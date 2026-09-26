import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCredentials } from '../../native-api/transport.mjs';
import { admitPilot } from './pilot-approval.mjs';
import { Ledger, requireThat } from './ledger.mjs';
import { loadSchema } from './schema.mjs';
import { createTransport, ORIGIN } from './transport.mjs';
import { OwnedApi } from './owned-api.mjs';
import { createPilotSource } from './pilot-source.mjs';
import { insertPilotParts } from './pilot-assembly.mjs';
import { independentRevolutePilot, matePilot } from './pilot-mates.mjs';
import { movePilot, reopenPilot } from './pilot-motion.mjs';

export function summarizeSpecs(response) {
  return { libraryVersion: response.libraryVersion, serializationVersion: response.serializationVersion,
    sourceMicroversion: response.sourceMicroversion,
    features: response.featureSpecs?.filter(spec => ['mate', 'mateConnector', 'mateGroup'].includes(spec.featureType))
      .map(spec => ({ featureType: spec.featureType, parameters: spec.parameters?.map(parameter => ({
        id: parameter.parameterId, type: parameter.defaultValue?.btType, options: parameter.options })) })) };
}

export async function pilotMain(args = process.argv.slice(2)) {
  requireThat(args.length === 2 && ['discover', 'source', 'native-base', 'insert', 'mate', 'diagnose', 'revolute', 'motion', 'reopen'].includes(args[0]) &&
    args[1] === '--live-approved-pilot', 'EXPLICIT_PILOT_COMMAND_REQUIRED');
  const approval = JSON.parse(readFileSync(new URL('./parent-pilot-approval.json', import.meta.url), 'utf8'));
  const ledger = new Ledger(fileURLToPath(new URL('./ledger.json', import.meta.url)), admitPilot(approval));
  let credentials;
  try {
    requireThat(!ledger.data.halt, 'LEDGER_HALTED');
    credentials = await loadCredentials(true, undefined, ORIGIN, {});
    const transport = createTransport({ ledger, credentials, fetchImpl: fetch });
    const send = request => {
      requireThat(ledger.completed(request.key) || ledger.data.attempts.length < approval.allowance.pilotAttemptCap, 'PILOT_ATTEMPT_CAP_19');
      return transport(request);
    };
    const api = new OwnedApi({ schema: loadSchema(), ledger, send, pilotApproval: approval });
    if (api.result('owned-elements')) {
      const visibility = ledger.data.attempts.findLast(entry => entry.operation === 'getDocument' && entry.status === 'SUCCESS');
      requireThat(visibility?.result.id === api.owned().did && visibility.result.public === true &&
        Date.now() - Date.parse(visibility.startedAt) < 3600000, 'RECENT_PILOT_PUBLIC_OBSERVATION_REQUIRED');
      api.visibilityConfirmed = true;
    } else await api.initialize(true);
    const owned = api.owned();
    if (args[0] === 'motion') return { status: 'PILOT_MOTION_COMMAND_OBSERVED', ...await movePilot(api), attempts: ledger.data.attempts.length };
    if (args[0] === 'reopen') return { status: 'PILOT_REOPENED_READBACK', ...await reopenPilot(api), attempts: ledger.data.attempts.length };
    if (args[0] === 'revolute') return { status: 'PILOT_REVOLUTE_OBSERVED', ...await independentRevolutePilot(api),
      attempts: ledger.data.attempts.length };
    if (args[0] === 'diagnose') {
      const response = await api.call('pilot-ground-diagnostic', 'nativePilot', 'getAssemblyDefinition',
        { ...owned, eid: api.element('ASSEMBLY') }, undefined, { includeMateFeatures: true, includeMateConnectors: true });
      return { attempts: ledger.data.attempts.length, features: response.rootAssembly.features?.map(feature => ({
        id: feature.id, type: feature.featureType, data: feature.featureData })),
        occurrences: response.rootAssembly.occurrences?.map(occurrence => ({ path: occurrence.path,
          transform: occurrence.transform, fixed: occurrence.fixed })) };
    }
    if (args[0] === 'mate') return { status: 'PILOT_MATES_OBSERVED', ...await matePilot(api), attempts: ledger.data.attempts.length };
    if (args[0] === 'insert') return { status: 'PILOT_INSTANCES_OBSERVED', ...await insertPilotParts(api), attempts: ledger.data.attempts.length };
    if (args[0] === 'source') return { status: 'PILOT_SOURCE_OBSERVED', ...await createPilotSource(api), attempts: ledger.data.attempts.length };
    if (args[0] === 'native-base') {
      const response = await api.call('pilot-native-base', 'nativePilot', 'getFeatures', { ...owned, eid: api.element('ASSEMBLY') });
      return { attempts: ledger.data.attempts.length, libraryVersion: response.libraryVersion,
        sourceMicroversion: response.sourceMicroversion, defaults: response.defaultFeatures?.map(feature => ({
          featureId: feature.featureId, featureType: feature.featureType, name: feature.name, parameters: feature.parameters })) };
    }
    const response = await api.call('pilot-native-specs', 'nativePilot', 'getFeatureSpecs',
      { ...owned, eid: api.element('ASSEMBLY') });
    return { status: 'PILOT_DOCUMENT_CREATED_SPECS_OBSERVED', provisional: true,
      url: `${ORIGIN}/documents/${owned.did}/w/${owned.wid}/e/${api.element('ASSEMBLY')}`,
      attempts: ledger.data.attempts.length, cap: 140, pilotCap: 19, specs: summarizeSpecs(response) };
  } catch (error) {
    ledger.checkpoint(`pilot-stop-${ledger.data.attempts.length}`, {
      reason: /^[A-Za-z0-9_:.-]+$/.test(error.message) ? error.message : 'LOCAL_OR_PROTOCOL_FAILURE',
      observedAt: new Date().toISOString() });
    throw error;
  } finally {
    credentials = undefined;
    ledger.close();
  }
}

if (import.meta.main) {
  try { console.log(JSON.stringify(await pilotMain(), null, 2)); }
  catch (error) {
    console.log(JSON.stringify({ status: 'STOPPED', reason: /^[A-Za-z0-9_:.-]+$/.test(error.message) ? error.message : 'LOCAL_OR_PROTOCOL_FAILURE' }));
    process.exitCode = 1;
  }
}