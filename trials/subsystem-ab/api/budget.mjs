import { LIMIT, requireThat } from './ledger.mjs';

export function planBudget(graph, { cotsImports = 5, parametricSourceConnectors = false, spent = 0,
  changedConnectorFeatures = 0, completedByPhase = {} } = {}) {
  requireThat([cotsImports, spent, changedConnectorFeatures].every(value => Number.isInteger(value) && value >= 0), 'INVALID_BUDGET_INPUT');
  const phases = {
    pilotAndOwnership: 4,
    sourceUploadVersionInstantiation: 10,
    assemblyReadiness: 2,
    cotsImportPollInspect: cotsImports * 4,
    batchInstancesAndReadback: 2,
    ground: 1,
    connectorFeatures: parametricSourceConnectors ? 0 : graph.joints.length * 2,
    nativeMates: graph.joints.length,
    nativeRelations: graph.relations.length,
    baselineHealth: 2,
    motionLimitsAndIndependence: 15,
    widthRevisionAndSourceReadback: 4,
    revisionConnectorUpdates: changedConnectorFeatures,
    receiverControlProbeAndRestore: 8,
    baselineRevisionExports: 8,
    finalIdentityAndHealth: 2,
    recoveryReserve: 5,
  };
  const remainingPhases = Object.fromEntries(Object.entries(phases).map(([phase, count]) => {
    const completed = completedByPhase[phase] ?? 0;
    requireThat(Number.isInteger(completed) && completed >= 0, 'INVALID_PHASE_CREDIT');
    return [phase, Math.max(0, count - completed)];
  }));
  const predicted = Object.values(remainingPhases).reduce((sum, value) => sum + value, 0);
  return { status: predicted + spent <= LIMIT ? 'CONDITIONAL_FIT' : 'BLOCKED', limit: LIMIT, spent,
    predictedRemainingAttempts: predicted, projectedTotal: predicted + spent, headroom: LIMIT - spent - predicted,
    phases, remainingPhases, metricKind: 'PREDICTION_NOT_OBSERVED_API_METRIC',
    assumptions: ['One documented batch insertion; response ordering and role binding must be checked.',
      'At most two translation polls per import/export; no automatic retry.',
      'Native grounding, role-name handling, limits, relation direction and motion-value codecs require an owned pilot.',
      'Parametric connector estimate is valid only if the frozen source creates all custom and COTS mate datums.',
      'No separate 45-call naming pass, no mate batching, and no static STEP assembly substitution are assumed.'] };
}

export function assertBudget(plan) {
  requireThat(plan.status === 'CONDITIONAL_FIT' && plan.projectedTotal <= LIMIT, 'BUDGET_CANNOT_COMPLETE_BEFORE_CREATE');
}

export function planV3Budget(counts, spent, { fastenedMode = 'individual', pilotReserve = 10 } = {}) {
  const { instances, revolutes, relations, cotsImportGroups, rigidGroups, motionScenarios } = counts;
  requireThat([instances, revolutes, relations, cotsImportGroups, rigidGroups, motionScenarios, spent, pilotReserve]
    .every(value => Number.isInteger(value) && value >= 0), 'INVALID_V3_COUNTS');
  requireThat(instances >= 2 && revolutes < instances && rigidGroups <= instances - 1 - revolutes &&
    cotsImportGroups > 0 && motionScenarios > 0 && pilotReserve <= 10 && spent <= LIMIT &&
    ['individual', 'nativeGroups'].includes(fastenedMode), 'INVALID_V3_BUDGET_ROUTE');
  const rows = [];
  const add = (phase, operation, count, kind = 'REQUEST') => rows.push({ phase, operation, count, kind });
  const exportPhase = phase => {
    add(phase, 'createAssemblyExportStep', 1);
    add(phase, 'getTranslation', 2, 'POLL_SLOT');
    add(phase, 'downloadExternalData', 1);
  };
  add('ownedVisibility', 'getDocument', 1);
  add('boundedNativePilot', null, pilotReserve, 'RESERVE');
  add('productionElements', 'createPartStudio', 1);
  add('productionElements', 'createAssembly', 1);
  for (const operation of ['createFeatureStudio', 'getFeatureStudioContents', 'updateFeatureStudioContents',
    'getFeatureStudioContents', 'getFeatureStudioSpecs', 'createVersion', 'getFeatureStudioSpecs',
    'getPartStudioFeatures', 'addPartStudioFeature', 'getPartsWMVE']) add('parametricSource', operation, 1);
  add('authenticCots', 'createTranslation', cotsImportGroups);
  add('authenticCots', 'getTranslation', cotsImportGroups * 2, 'POLL_SLOT');
  add('authenticCots', 'getPartsWMVE', cotsImportGroups);
  add('cotsOwnedDatums', 'getPartStudioFeatures', cotsImportGroups);
  add('cotsOwnedDatums', 'addPartStudioFeature', cotsImportGroups);
  add('nativeSnapshot', 'getFeatures', 1);
  add('bulkInsert', 'insertTransformedInstances', 1);
  add('bulkInsert', 'getAssemblyDefinition', 1);
  add('ground', 'addFeature', 1);
  add('fastened', 'addFeature', fastenedMode === 'nativeGroups' ? rigidGroups : instances - 1 - revolutes);
  add('revolutes', 'addFeature', revolutes);
  add('relations', 'addFeature', relations);
  add('sourceGeometryAndDatums', 'evalFeatureScript', cotsImportGroups + 1);
  add('baselineHealth', 'getFeatures', 1);
  add('baselineHealth', 'getAssemblyDefinition', 1);
  add('motion', 'getMateValues', 1);
  add('motion', 'updateMateValues', motionScenarios);
  add('motion', 'getAssemblyDefinition', motionScenarios);
  exportPhase('baselineExport');
  for (const operation of ['getPartStudioFeatures', 'updatePartStudioFeature', 'getPartsWMVE',
    'evalFeatureScript', 'getFeatures', 'getAssemblyDefinition'])
    add('widthRevision', operation, operation === 'evalFeatureScript' ? cotsImportGroups + 1 : 1);
  exportPhase('revisionExport');
  for (const phase of ['receiverProbe', 'receiverRestore']) {
    add(phase, 'updatePartStudioFeature', 1);
    add(phase, 'evalFeatureScript', cotsImportGroups + 1);
    add(phase, 'getAssemblyDefinition', 1);
  }
  add('finalHealth', 'getFeatures', 1);
  add('finalHealth', 'getAssemblyDefinition', 1);
  exportPhase('finalExport');
  add('recovery', null, 5, 'RESERVE');
  const remaining = rows.reduce((total, row) => total + row.count, 0);
  return { status: spent + remaining <= LIMIT ? 'CONDITIONAL_FIT' : 'BLOCKED', metricKind: 'PLAN_NOT_LIVE_PROOF',
    limit: LIMIT, spent, counts: structuredClone(counts), fastenedMode, rows,
    predictedRemainingAttempts: remaining, projectedTotal: spent + remaining, headroom: LIMIT - spent - remaining,
    assumptions: ['Counts are planning inputs until a new parent-frozen v3 contract is bound.',
      'One documented insertTransformedInstances request includes every actual part instance.',
      'Native groups require contract acceptance and live proof; they never include both sides of a revolute.',
      'Each authentic import preserves every source solid, including both WCP X44 bodies, with owned source datums.',
      'The geometry evaluator returns all source IDs, volumes, boxes and connector frames in one call per source Part Studio.',
      'Each motion command response must include all observed mate values; each reopen validates actual occurrence transforms.',
      'At most two polls per translation. Exhaustion or any unknown POST outcome stops; no resubmission.',
      'No rename pass, quota query, new document, per-connector REST pass or unconditional retry is included.'] };
}