import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isAbsolute, relative, resolve } from 'node:path';
import { LIMIT, readLedger, requireThat, sha256 } from './ledger.mjs';
import { groundContract, originalPrefixSha256, pilotTarget, pilotMotionRequest, suppressionRequest } from './v4-native.mjs';
import { analyzeCatalog } from './v4-catalog.mjs';

export function forecastV4(counts, spent, { motionScenarios, groundWriteCeiling = null,
  pilotCeiling = Math.max(0, 29 - spent) } = {}) {
  requireThat([counts?.instances, counts?.revolutes, counts?.relations, counts?.rigidGroups,
    counts?.originalImportGroups, counts?.generatedSourceGroups, spent, motionScenarios, pilotCeiling]
    .every(value => Number.isInteger(value) && value >= 0) && spent >= 23 && spent <= LIMIT &&
    pilotCeiling <= Math.max(0, 29 - spent) && motionScenarios > 0 && counts.instances >= 2 &&
    counts.revolutes < counts.instances && counts.rigidGroups <= counts.instances - 1 - counts.revolutes,
  'V4_FORECAST_EXPLICIT_COUNTS_REQUIRED');
  requireThat(groundWriteCeiling === null || Number.isInteger(groundWriteCeiling) && groundWriteCeiling > 0,
    'V4_GROUND_COST_REQUIRED');
  const originals = counts.originalImportGroups;
  const generated = counts.generatedSourceGroups;
  const sources = originals + generated;
  const rows = [];
  const add = (phase, operation, count, kind = 'REQUEST') => rows.push({ phase, operation, count, kind });
  add('productionVisibility', 'getDocument', 1);
  add('conditionalPilot', null, pilotCeiling, 'RESERVE_NOT_AUTHORIZATION');
  add('productionElements', 'createPartStudio', generated);
  add('productionElements', 'createAssembly', 1);
  add('sourceFeatureStudio', 'create_upload_verify_pin_specs', 7, 'ENUMERATED_COMPOSITE');
  add('generatedSources', 'getFeatures_addFeature_getParts', 3 * generated, 'ENUMERATED_COMPOSITE');
  add('originalImports', 'createTranslation', originals);
  add('originalImports', 'getTranslation', 2 * originals, 'POLL_SLOT');
  add('originalImports', 'getPartsWMVE', originals);
  add('originalDatums', 'getPartStudioFeatures', originals);
  add('originalDatums', 'addPartStudioFeature', originals);
  add('nativeSpecs', 'getFeatures', 1);
  add('nativeInstances', 'insertTransformedInstances', 1);
  add('nativeInstances', 'getAssemblyDefinition', 1);
  add('ground', null, groundWriteCeiling, 'UNPROVEN_ROUTE');
  add('rigidGroups', 'addFeature', counts.rigidGroups);
  add('revolutes', 'addFeature', counts.revolutes);
  add('relations', 'addFeature', counts.relations);
  add('baselineSourceGeometry', 'evalFeatureScript', sources);
  add('baselineHealth', 'getFeatures_getAssemblyDefinition', 2, 'ENUMERATED_COMPOSITE');
  add('motion', 'getMateValues', 1);
  add('motion', 'updateMateValues', motionScenarios);
  add('motion', 'getAssemblyDefinition', motionScenarios);
  add('motionHealth', 'getFeatures', 1);
  add('widthRevision', 'getFeatures_updateFeature_getParts', 3 * generated, 'ENUMERATED_COMPOSITE');
  add('widthRevision', 'evalFeatureScript', sources);
  add('widthRevision', 'getFeatures_getAssemblyDefinition', 2, 'ENUMERATED_COMPOSITE');
  for (const phase of ['receiverProbe', 'receiverRestore']) {
    add(phase, 'updatePartStudioFeature', generated);
    add(phase, 'evalFeatureScript', sources);
    add(phase, 'getAssemblyDefinition', 1);
  }
  add('finalHealth', 'getFeatures_getAssemblyDefinition', 2, 'ENUMERATED_COMPOSITE');
  for (const phase of ['baselineExport', 'revisionExport', 'finalExport']) {
    add(phase, 'createAssemblyExportStep', 1);
    add(phase, 'getTranslation', 2, 'POLL_SLOT');
    add(phase, 'downloadExternalData', 1);
  }
  add('recovery', null, 5, 'RESERVE');
  const knownRemaining = rows.reduce((total, row) => total + (row.count ?? 0), 0);
  const unpriced = rows.filter(row => row.count === null).map(row => row.phase);
  const projectedTotal = unpriced.length ? null : spent + knownRemaining;
  return { status: unpriced.length ? 'UNPRICED_NO_ADMISSION' : projectedTotal > LIMIT ? 'OVER_CAP' : 'CONDITIONAL_ONLY',
    spent, limit: LIMIT, remaining: LIMIT - spent, counts, motionScenarios, rows, knownRemaining, unpriced, projectedTotal,
    headroomBeforeUnpriced: LIMIT - spent - knownRemaining, admission: false,
    exclusionsRequiringReforecast: ['Additional pilot limit/restore/health calls beyond the six-call interior pilot.',
      'Any relation/group pilot fixtures, retries, extra polls, split destination Part Studios or ambiguous body mapping.',
      'Connector creation beyond one parametric datum invocation per original source group.'],
    assumptions: ['One original file and one destination Part Studio per hash-bound original source group.',
      'All originals preserve every source solid; generated source feature definitions share one Feature Studio.',
      'Native fastened groups are parent-approved, traceable to logical edges, and still require native proof.',
      'Motion count is the actual frozen scenario count, including both limits, carrier, independence and restores.',
      'Two maximum polls per translation; timeout or uncertain mutation stops without retry.',
      'Every original and generated source is remeasured at baseline, width revision, receiver probe and restore.'] };
}

export function readOnlyPlan(data) {
  requireThat(data.limit === LIMIT && data.binding?.origin === 'https://cad.onshape.com' &&
    data.binding.packetHash === '8a90d25fd25cb4068def905f53d83f0319d75a6226c016d69f5cbb93514a2f60' &&
    data.attempts.length >= 23 && data.attempts.length <= LIMIT &&
    sha256(JSON.stringify(data.attempts.slice(0, 23))) === originalPrefixSha256 &&
    data.checkpoints?.['pilot-repair-outcome']?.closed === true, 'V4_ORIGINAL_LEDGER_PREFIX_REQUIRED');
  requireThat(!data.halt && data.attempts.every(entry => entry.status === 'SUCCESS'), 'V4_PENDING_OR_HALTED_LEDGER');
  const result = key => data.attempts.find(entry => entry.key === key)?.result;
  const groundReadback = result('pilot-repair-ground-readback');
  const suppress = suppressionRequest(result('pilot-repair-ground-update'), groundReadback);
  const motion = pilotMotionRequest(result('pilot-mate-values-before'), 'interior');
  return { schema: 'subsystem-ab-api-v4-offline-plan/1', status: 'PUBLIC_RESEARCH_COMPLETE_GROUND_WRITE_NOT_ESTABLISHED',
    authenticatedCallsThisInvocation: 0, liveEnabled: false, productionAuthorized: false,
    ledger: { spent: data.attempts.length, limit: LIMIT, remaining: LIMIT - data.attempts.length,
      originalBinding: data.binding, original23PrefixSha256: originalPrefixSha256, priorRepairStillClosed: true },
    ownedPilot: pilotTarget, authoritativeGround: groundContract(),
    lastSavedCadEvidence: { atAttempt: 23, currentStateNotRefetched: true, groundFeatureStatus: 'ERROR', fixedOccurrences: 0,
      rotationRadians: 0, limits: 'CONFIGURED_NOT_PROVEN', relations: 'UNPROVEN' },
    conditionalPilot: { status: 'NOT_AUTHORIZED_NOT_EXECUTABLE', ceiling: 6, startAttempts: 23,
      unusedSlots: Math.max(0, 29 - data.attempts.length),
      sequence: [
        { slot: 1, operation: 'getDocument', gate: 'Same owned document, public visibility and WRITE permission; no read-only override.' },
        { slot: 2, operation: suppress.operation, gate: 'Same failed feature ID; suppressed=true; reject stale microversion.' },
        { slot: 3, operation: null, gate: 'Authoritative direct fixed-instance operation required; no guessed flags/root queries.' },
        { slot: 4, operation: 'getAssemblyDefinition', gate: 'Include suppressed features: base fixed, arm free, old failure retained, unchanged IDs.' },
        { slot: 5, operation: motion.operation, gate: 'Interior only: first connector relative to second, +30 degrees = pi/6 radians.' },
        { slot: 6, operation: 'getAssemblyDefinition', gate: 'Fresh native transform, nonzero arm motion, base unchanged, values agree.' },
      ], suppressionPreview: { featureId: suppress.body.feature.featureId, suppressed: true,
        sourceMicroversion: suppress.body.sourceMicroversion, rejectMicroversionSkew: true },
      interiorRequest: motion, groundPayload: null,
      maximumCumulativeAfterPilot: 29,
      separateUnapprovedFollowup: { upperCommandAndReopen: 2, lowerCommandAndReopen: 2, restoreCommandAndReopen: 2,
        freshFeatureHealth: 1, minimumAdditional: 7 },
      note: 'No supported batch combining fixed-instance edit and failed-feature suppression was found. Six slots do not establish full limits or health.' },
    v4Catalog: { status: 'AWAITING_PARENT_FROZEN_LOCAL_PASS', projectedTotal: null,
      required: ['Frozen v4 hash and acceptance report; never replace the original ledger binding.',
        'Counted component catalog, complete source body mapping and unchanged original vendor byte hashes.',
        'Source-owned connectors/frames, controls, geometry evaluator and stable baseline/revision/probe IDs.',
        'X44 body and rear cover fixed together; explicit output-gear approximation, no invented physical motor shaft.',
        'Native groups, signed relations, moving-carrier/independence/limit/restore scenarios and exact poll/export budgets.',
        'New parent pilot authorization and allowance evidence, then append-only migration authorization after local freeze.'] } };
}

export function main(args = process.argv.slice(2)) {
  requireThat(args.length === 1 && args[0] === 'plan' || args.length === 2 && args[0] === 'check-catalog' &&
    args[1].startsWith('--catalog='), 'V4_OFFLINE_ONLY_PLAN_OR_CHECK_CATALOG');
  const directory = fileURLToPath(new URL('./', import.meta.url));
  const plan = readOnlyPlan(readLedger(new URL('./ledger.json', import.meta.url)));
  if (args[0] === 'plan') return plan;
  const catalogPath = realpathSync(resolve(args[1].slice('--catalog='.length)));
  const within = relative(directory, catalogPath);
  requireThat(within && !within.startsWith('..') && !isAbsolute(within) && within.endsWith('.json'), 'V4_CATALOG_MUST_BE_IN_API_FOLDER');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const counts = analyzeCatalog(catalog);
  return { status: 'LOCAL_CONTRACT_CHECK_ONLY', liveEnabled: false, counts,
    forecast: Number.isInteger(catalog.motionScenarioCount) ? forecastV4(counts, plan.ledger.spent,
      { motionScenarios: catalog.motionScenarioCount }) : null };
}

if (import.meta.main) {
  try { console.log(JSON.stringify(main(), null, 2)); }
  catch (error) {
    console.error(JSON.stringify({ status: 'STOPPED_OFFLINE', reason: /^V4_[A-Z0-9_]+$/.test(error.message) ? error.message : 'LOCAL_VALIDATION_FAILED' }));
    process.exitCode = 1;
  }
}