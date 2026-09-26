import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Ledger, readLedger, requireThat, sha256 } from './ledger.mjs';
import { loadSchema } from './schema.mjs';
import { createTransport, ORIGIN } from './transport.mjs';
import { OwnedApi } from './owned-api.mjs';
import { groundRepairBody } from './pilot-mates.mjs';
import { assertHealthy } from './native.mjs';

export const repairCeiling = 29;
export const groundLookupQuery = { featureId: ['actualGround'] };

export function repairScope(data) {
  const owner = data.attempts.find(entry => entry.key === 'create-document')?.result;
  requireThat(data.limit === 140 && data.binding?.origin === ORIGIN &&
    owner?.id === 'c88349fc8bd39b3e6d811b19' && owner.defaultWorkspace?.id === '2cb07fb6d6b08930d5b0cf8f' &&
    !data.halt && !data.attempts.some(entry => entry.status !== 'SUCCESS'), 'REPAIR_OWNED_LEDGER_REQUIRED');
  requireThat(data.attempts.length >= 19 && data.attempts.length <= repairCeiling, 'REPAIR_ATTEMPT_CEILING');
  const prefixSha256 = sha256(JSON.stringify(data.attempts.slice(0, 19)));
  const checkpoint = data.checkpoints?.['pilot-repair-authorization'];
  requireThat(checkpoint ? checkpoint.prefixSha256 === prefixSha256 && checkpoint.ceiling === repairCeiling :
    data.attempts.length === 19, 'REPAIR_PREFIX_CHECKPOINT_REQUIRED');
  return { schema: 'subsystem-ab-api-pilot-repair/1', prefixSha256, startAttempts: 19, ceiling: repairCeiling,
    authority: '2026-09-12 user: at most 10 additional pilot requests, no full upload', productionAuthorized: false };
}

export function observedGround(snapshot) {
  const ground = snapshot?.features?.find(feature => feature.featureId === 'actualGround');
  requireThat(ground, 'ACTUAL_GROUND_NOT_OBSERVED');
  return ground;
}

export function motionEvidence(definition, baseline, instances, requestedRadians, returnedRadians) {
  const occurrence = (root, role) => root.occurrences.find(item => item.path.length === 1 && item.path[0] === instances[role].id);
  const base = occurrence(definition.rootAssembly, 'base');
  const arm = occurrence(definition.rootAssembly, 'arm');
  requireThat(base?.transform?.length === 16 && arm?.transform?.length === 16, 'PILOT_OCCURRENCES_REQUIRED');
  const delta = role => Math.max(...occurrence(definition.rootAssembly, role).transform.map((value, index) =>
    Math.abs(value - occurrence(baseline.rootAssembly, role).transform[index])));
  const difference = Math.atan2(base.transform[4], base.transform[0]) - Math.atan2(arm.transform[4], arm.transform[0]);
  const measuredRadians = Math.atan2(Math.sin(difference), Math.cos(difference));
  const expectedRadians = Math.max(-Math.PI / 6, Math.min(Math.PI / 3, requestedRadians));
  const expectedArm = [Math.cos(measuredRadians), Math.sin(measuredRadians), 0, 0,
    -Math.sin(measuredRadians), Math.cos(measuredRadians), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return { requestedRadians, returnedRadians, measuredRadians, expectedRadians,
    baseUnchanged: delta('base') < 1e-8, armChanged: delta('arm') > 1e-8,
    planarPivotPreserved: arm.transform.every((value, index) => Math.abs(value - expectedArm[index]) < 1e-8),
    valueMatchesTransform: Number.isFinite(returnedRadians) && Math.abs(measuredRadians - returnedRadians) < 1e-8,
    reachedExpectedAngle: Math.abs(measuredRadians - expectedRadians) < 1e-8,
    withinLimits: measuredRadians >= -Math.PI / 6 - 1e-8 && measuredRadians <= Math.PI / 3 + 1e-8,
    fixedOccurrenceCount: definition.rootAssembly.occurrences.filter(item => item.fixed).length,
    sourceMicroversion: definition.rootAssembly.documentMicroversion,
    features: definition.rootAssembly.features, occurrences: definition.rootAssembly.occurrences };
}

export function closeRepair(ledger) {
  const existing = ledger.data.checkpoints?.['pilot-repair-outcome'];
  if (existing) return existing;
  const result = key => ledger.completed(key)?.result;
  const repaired = result('pilot-repair-ground-update');
  const reopened = result('pilot-repair-ground-readback');
  requireThat(repaired && reopened, 'SAVED_REPAIR_AND_REOPEN_REQUIRED');
  const measured = motionEvidence(reopened, result('pilot-instance-readback'),
    ledger.data.checkpoints['pilot-instance-binding'], Math.PI / 2, null);
  const outcome = { status: 'BLOCKED_GROUND_QUERY_UNRESOLVED', closed: true, startAttempts: 19,
    endAttempts: ledger.data.attempts.length, additionalRequests: ledger.data.attempts.length - 19,
    unusedRepairSlots: repairCeiling - ledger.data.attempts.length, limit: 140, remaining: 140 - ledger.data.attempts.length,
    originalPrefixSha256: sha256(JSON.stringify(ledger.data.attempts.slice(0, 19))),
    groundFeatureId: repaired.feature.featureId, groundNativeStatus: repaired.featureState.featureStatus,
    rootQuery: 'actualGround', resolvedGroundEndpoints: reopened.rootAssembly.features.find(feature =>
      feature.id === repaired.feature.featureId)?.featureData?.matedEntities?.length ?? 0,
    measuredRadians: measured.measuredRadians, baseUnchanged: measured.baseUnchanged, armChanged: measured.armChanged,
    fixedOccurrenceCount: measured.fixedOccurrenceCount, reopenedSourceMicroversion: measured.sourceMicroversion,
    motion: 'UNPROVEN_NO_NEW_MOTION_WRITE', limits: 'CONFIGURED_NOT_PROVEN', productionAuthorized: false,
    reason: 'Targeted controller lookup was empty; same-ID direct root-query update stayed ERROR with one resolved endpoint. No further guessed payloads.' };
  ledger.checkpoint('pilot-repair-outcome', outcome);
  return outcome;
}

export async function repairMain(args = process.argv.slice(2)) {
  const commands = ['close', 'discover', 'ground', 'reopen-ground', 'move-interior', 'reopen-interior',
    'move-upper', 'reopen-upper', 'move-lower', 'reopen-lower'];
  requireThat(args.length === 2 && commands.includes(args[0]) && args[1] === '--live-approved-repair',
    'EXPLICIT_REPAIR_COMMAND_REQUIRED');
  const path = fileURLToPath(new URL('./ledger.json', import.meta.url));
  const saved = readLedger(path);
  const scope = repairScope(saved);
  const ledger = new Ledger(path, saved.binding);
  let credentials;
  try {
    if (!ledger.data.checkpoints?.['pilot-repair-authorization']) ledger.checkpoint('pilot-repair-authorization', scope);
    if (args[0] === 'close') return closeRepair(ledger);
    requireThat(!ledger.data.checkpoints?.['pilot-repair-outcome'], 'BOUNDED_REPAIR_CLOSED');
    const environment = parseEnv(readFileSync(new URL('../../../.env.local', import.meta.url), 'utf8'));
    requireThat(environment.ONSHAPE_ACCESS_KEY && environment.ONSHAPE_SECRET_KEY &&
      (!environment.ONSHAPE_BASE_URL || environment.ONSHAPE_BASE_URL.replace(/\/$/, '') === ORIGIN), 'REPAIR_CREDENTIAL_CONFIGURATION');
    credentials = { accessKey: environment.ONSHAPE_ACCESS_KEY, secretKey: environment.ONSHAPE_SECRET_KEY };
    const transport = createTransport({ ledger, credentials, fetchImpl: fetch });
    const send = request => {
      requireThat(['getDocument', 'getFeatures', 'updateFeature', 'updateMateValues', 'getAssemblyDefinition'].includes(request.operation),
        'REPAIR_OPERATION_SCOPE');
      requireThat(request.operation !== 'updateFeature' || request.body.feature.featureId === 'MHVWwSC5EjXoRtyJV',
        'SAME_FAILED_GROUND_ONLY');
      requireThat(ledger.completed(request.key) || ledger.data.attempts.length < repairCeiling, 'REPAIR_ATTEMPT_CEILING');
      return transport(request);
    };
    const api = new OwnedApi({ schema: loadSchema(), ledger, send });
    const visibility = ledger.completed('pilot-repair-visibility');
    if (visibility) requireThat(Date.now() - Date.parse(visibility.startedAt) < 3600000, 'REPAIR_VISIBILITY_EXPIRED');
    await api.call('pilot-repair-visibility', 'nativePilotRepair', 'getDocument', { did: api.owned().did });
    const ids = { ...api.owned(), eid: api.element('ASSEMBLY') };
    const summary = () => ({ attempts: ledger.data.attempts.length, remaining: 140 - ledger.data.attempts.length });
    if (args[0] === 'ground') {
      const body = groundRepairBody(api.result('pilot-ground'), api.result('pilot-repair-ground-controller'));
      if (!ledger.data.checkpoints['pilot-ground-repair-plan']) ledger.checkpoint('pilot-ground-repair-plan', {
        sameFeatureId: body.feature.featureId, beforeFeatureSha256: sha256(JSON.stringify(api.result('pilot-ground').feature)),
        request: body, rootReference: 'User-specified actualGround query; native resolution requires live readback.' });
      const result = await api.call('pilot-repair-ground-update', 'nativePilotRepair', 'updateFeature',
        { ...ids, fid: body.feature.featureId }, body);
      ledger.checkpoint('pilot-ground-repair-result', { featureId: result.feature?.featureId,
        status: result.featureState?.featureStatus, sourceMicroversion: result.sourceMicroversion });
      assertHealthy(result);
      return { ...summary(), groundStatus: result.featureState.featureStatus, featureId: result.feature.featureId };
    }
    if (args[0] === 'reopen-ground') {
      requireThat(api.result('pilot-repair-ground-update'), 'GROUND_REPAIR_WRITE_REQUIRED');
      const definition = await api.call('pilot-repair-ground-readback', 'nativePilotRepair', 'getAssemblyDefinition', ids,
        undefined, { includeMateFeatures: true, includeMateConnectors: true });
      return { ...summary(), features: definition.rootAssembly.features, occurrences: definition.rootAssembly.occurrences };
    }
    if (args[0].startsWith('move-') || args[0].startsWith('reopen-')) {
      assertHealthy(api.result('pilot-repair-ground-update'));
      const pose = args[0].split('-')[1];
      const requestedRadians = { interior: Math.PI / 6, upper: Math.PI / 2, lower: -Math.PI / 2 }[pose];
      requireThat(Number.isFinite(requestedRadians), 'REPAIR_POSE_REQUIRED');
      const previous = { interior: 'pilot-repair-ground-readback', upper: 'pilot-repair-interior-readback',
        lower: 'pilot-repair-upper-readback' }[pose];
      requireThat(api.result(previous), 'PRIOR_REOPEN_REQUIRED');
      const mateId = ledger.data.checkpoints['pilot-mate-binding'].revoluteId;
      if (args[0].startsWith('move-')) {
        const observed = api.result('pilot-mate-values-before').mateValues.find(item => item.featureId === mateId);
        const body = { mateValues: [{ ...structuredClone(observed), rotationZ: requestedRadians }] };
        const response = await api.call(`pilot-repair-${pose}-command`, 'nativePilotRepair', 'updateMateValues', ids, body);
        return { ...summary(), pose, requestedRadians,
          returnedRadians: response.mateValues?.find(item => item.featureId === mateId)?.rotationZ ?? null };
      }
      const command = api.result(`pilot-repair-${pose}-command`);
      requireThat(command, 'PRIOR_MOTION_WRITE_REQUIRED');
      const definition = await api.call(`pilot-repair-${pose}-readback`, 'nativePilotRepair', 'getAssemblyDefinition', ids,
        undefined, { includeMateFeatures: true, includeMateConnectors: true });
      const evidence = motionEvidence(definition, api.result('pilot-instance-readback'),
        ledger.data.checkpoints['pilot-instance-binding'], requestedRadians,
        command.mateValues?.find(item => item.featureId === mateId)?.rotationZ ?? null);
      ledger.checkpoint(`pilot-repair-${pose}-evidence`, { ...evidence, reopenedInNewProcess: true });
      const { features, occurrences, ...measurements } = evidence;
      return { ...summary(), pose, ...measurements };
    }
    const snapshot = await api.call('pilot-repair-ground-controller', 'nativePilotRepair', 'getFeatures',
      { ...api.owned(), eid: api.element('ASSEMBLY') }, undefined, groundLookupQuery);
    return { attempts: ledger.data.attempts.length, remaining: 140 - ledger.data.attempts.length,
      ground: observedGround(snapshot), featureStates: snapshot.featureStates, sourceMicroversion: snapshot.sourceMicroversion };
  } finally {
    credentials = undefined;
    ledger.close();
  }
}

if (import.meta.main) {
  try { console.log(JSON.stringify(await repairMain(), null, 2)); }
  catch (error) {
    console.log(JSON.stringify({ status: 'STOPPED', reason: /^[A-Z0-9_]+$/.test(error.message) ? error.message : 'LOCAL_OR_PROTOCOL_FAILURE' }));
    process.exitCode = 1;
  }
}