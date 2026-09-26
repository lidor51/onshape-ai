import { LIMIT, requireThat, sha256 } from './ledger.mjs';
import { planV3Budget } from './budget.mjs';

export const forecastCounts = Object.freeze({ instances: 48, revolutes: 12, relations: 5,
  cotsImportGroups: 1, rigidGroups: 13, motionScenarios: 8 });

export function pilotEvidence(ledger) {
  requireThat(ledger.limit === LIMIT && Array.isArray(ledger.attempts), 'CURRENT_LEDGER_REQUIRED');
  const entry = key => ledger.attempts.find(attempt => attempt.key === key && attempt.status === 'SUCCESS');
  const ground = (entry('pilot-repair-ground-update') ?? entry('pilot-ground'))?.result;
  const revolute = entry('pilot-independent-revolute')?.result;
  const before = entry('pilot-mate-values-before')?.result;
  const motion = entry('pilot-motion-upper-limit-command')?.result;
  const initial = entry('pilot-instance-readback')?.result;
  const reopened = (entry('pilot-repair-ground-readback') ?? entry('pilot-reopened-motion-readback'))?.result;
  const mateId = revolute?.feature?.featureId;
  const value = response => response?.mateValues?.find(item => item.featureId === mateId);
  const occurrences = reopened?.rootAssembly?.occurrences ?? [];
  const changed = occurrences.filter(occurrence => {
    const previous = initial?.rootAssembly?.occurrences?.find(item => JSON.stringify(item.path) === JSON.stringify(occurrence.path));
    return previous && occurrence.transform.some((coordinate, index) => Math.abs(coordinate - previous.transform[index]) > 1e-7);
  });
  const evidenceKeys = ['pilot-native-specs', 'pilot-source-specs', 'pilot-parts', 'pilot-instance-readback',
    'pilot-ground', 'pilot-ground-diagnostic', 'pilot-independent-revolute', 'pilot-mate-values-before',
    'pilot-motion-upper-limit-command', 'pilot-reopened-motion-readback', 'pilot-repair-visibility',
    'pilot-repair-ground-controller', 'pilot-repair-ground-update', 'pilot-repair-ground-readback'];
  return {
    spent: ledger.attempts.length, limit: LIMIT, remaining: LIMIT - ledger.attempts.length,
    successfulRequests: ledger.attempts.filter(attempt => attempt.status === 'SUCCESS').length,
    attempts: ledger.attempts.map(({ sequence, key, phase, operation, status, httpStatus }) =>
      ({ sequence, key, phase, operation, status, httpStatus })),
    originalFreezeAnchor: structuredClone(ledger.binding),
    owned: { origin: ledger.binding?.origin, did: entry('create-document')?.result?.id,
      wid: entry('create-document')?.result?.defaultWorkspace?.id },
    pilot: {
      parts: entry('pilot-parts')?.result?.length ?? 0,
      instances: reopened?.rootAssembly?.instances?.length ?? 0,
      ground: { status: ground?.featureState?.featureStatus === 'OK' ? 'PASS' : ground ? 'FAIL' : 'UNVERIFIED',
        featureId: ground?.feature?.featureId, nativeStatus: ground?.featureState?.featureStatus },
      repair: { attempts: ledger.attempts.filter(attempt => attempt.phase === 'nativePilotRepair').length,
        closed: Boolean(ledger.checkpoints?.['pilot-repair-outcome']),
        resolvedGroundEndpoints: reopened?.rootAssembly?.features?.find(feature =>
          feature.id === ground?.feature?.featureId)?.featureData?.matedEntities?.length ?? 0 },
      revolute: { status: revolute?.featureState?.featureStatus === 'OK' ? 'PASS' : 'UNVERIFIED', featureId: mateId },
      motion: { status: value(motion)?.jsonType === 'Revolute' && changed.length ? 'OBSERVED' : 'UNVERIFIED',
        jsonType: value(before)?.jsonType, beforeRadians: value(before)?.rotationZ,
        requestedRadians: ledger.checkpoints?.['pilot-motion-command']?.requestedRadians,
        returnedRadians: value(motion)?.rotationZ, configuredLowerDegrees: -30, configuredUpperDegrees: 60,
        reopenedChangedOccurrences: changed.length, reopenedFixedOccurrences: occurrences.filter(item => item.fixed === true).length },
      limits: 'UNVERIFIED', relations: 'UNVERIFIED', movingCarrier: 'UNVERIFIED',
      sourceConnectorTrackingAfterRevision: 'UNVERIFIED',
    },
    evidence: evidenceKeys.filter(key => entry(key)).map(key => ({ key, sequence: entry(key).sequence,
      operation: entry(key).operation, resultSha256: sha256(JSON.stringify(entry(key).result)) })),
  };
}

export function preparationPlan(ledger) {
  const evidence = pilotEvidence(ledger);
  const pilotReserve = Math.max(0, 10 - evidence.pilot.repair.attempts);
  return { schema: 'subsystem-ab-api-v3-preparation/1', status: 'BLOCKED_NATIVE_PILOT_AND_FROZEN_V3_REQUIRED',
    mode: 'OFFLINE_PREPARATION', credentialsLoaded: false, authenticatedRequestsThisInvocation: 0,
    fullModelUploadAllowed: false, newDocumentAllowed: false, frozenV3ReadThisInvocation: false,
    ...evidence, conditionalV3Route: planV3Budget(forecastCounts, ledger.attempts.length, { fastenedMode: 'nativeGroups', pilotReserve }),
    individualMateRoute: planV3Budget(forecastCounts, ledger.attempts.length, { pilotReserve }),
    separateImportRoute: planV3Budget({ ...forecastCounts, cotsImportGroups: 5 }, ledger.attempts.length, { pilotReserve }),
    countStatus: 'FORECAST_ONLY_NOT_FROZEN_V3_COUNTS',
    nativeRecipe: { status: 'PARTIALLY_OBSERVED_NOT_EXECUTION_ADMITTED',
      bulkInsert: { operation: 'insertTransformedInstances', requests: 1,
        body: 'transformGroups[{instances:[{documentId,elementId,partId,includePartTypes:[PARTS],isAssembly:false,isWholePartStudio:false}],transform:rowMajorSI}]',
        evidenceKey: 'pilot-instances', bindingRule: 'Match actual source part ID and occurrence transform; never response ordering.' },
      sourceConnectors: { queryType: 'BTMPartStudioMateConnectorQuery-1324', featureId: 'observed full feature ID', path: ['observed instance ID'],
        evidenceKey: 'pilot-instance-readback', trackingAfterRevision: 'UNVERIFIED' },
      revolute: { featureType: 'mate', btType: 'BTMMate-64', typeParameter: 'mateType', queryParameter: 'mateConnectorsQuery',
        limits: ['limitsEnabled', 'limitAxialZMin', 'limitAxialZMax'], nativeStatus: evidence.pilot.revolute.status },
      motion: { jsonType: 'Revolute', coordinate: 'rotationZ', units: 'radians', evidenceKey: 'pilot-mate-values-before',
        movementProven: false, configuredLimitEnforcementProven: false },
      rigidGroups: { featureType: 'mateGroup', btType: 'BTMMateGroup-65', queryParameter: 'occurrencesQuery',
        status: 'PUBLISHED_SCHEMA_AND_OBSERVED_SPEC_ONLY_NO_LIVE_FEATURE' },
      relations: { featureType: 'mateRelation', btType: 'BTMMateRelation-1412',
        observedParameters: ['relationType', 'matesQuery', 'relationRatio', 'relationLength', 'reverseDirection'],
        queryBinding: 'Two native mate references in the single ordered matesQuery parameter.',
        carrier: 'No carrier parameter was observed. Prove carrier-relative behavior from reopened occurrence frames.',
        status: 'OBSERVED_SPEC_ONLY_NO_LIVE_RELATION' } },
    gates: [
      { code: 'PARENT_FROZEN_V3', status: 'BLOCKED', detail: 'Await next parent handoff; do not inspect or relabel an old packet.' },
      { code: 'FREEZE_MIGRATION', status: 'PENDING', detail: 'Append an explicit migration record later. Preserve original binding and every historical receipt.' },
      { code: 'NATIVE_GROUND', status: evidence.pilot.ground.status, detail: 'HTTP 200 did not mean feature regeneration succeeded.' },
      { code: 'MOVEMENT_AND_LIMITS', status: 'UNVERIFIED', detail: 'Requested pi/2, returned 0; reopening showed no motion.' },
      { code: 'RELATION_DIRECTION_AND_CARRIER', status: 'UNVERIFIED', detail: 'Only parameter schema observed; no relation or moving-carrier live proof.' },
      { code: 'RIGID_GROUPS_AND_PRESERVED_BUNDLE', status: 'CONDITIONAL', detail: '137-call route requires contract acceptance and owned-pilot verification.' },
      { code: 'SOURCE_GEOMETRY_AND_REVISION', status: 'UNVERIFIED', detail: 'Executable readback validators exist; no v3 source or evaluator supplied yet.' },
      { code: 'NATIVE_NAMES', status: 'UNVERIFIED', detail: 'Capture actual names plus stable role IDs; no guessed naming endpoint or rename pass.' },
      { code: 'HUMAN_AND_PHYSICAL', status: 'UNVERIFIED', detail: 'No human usability, acquisition, endurance or manufacturing release claim.' },
    ],
    requiredSharedSource: { bindingSchema: 'subsystem-ab-api-v3-binding/1', sourceGeometrySchema: 'subsystem-ab-api-source-geometry/1',
      connectorCount: '2 * (nativeInstanceCount - 1) + 1; 95 logical connector keys at 48 instances.',
      variants: ['baseline', 'revision', 'receiverControlProbe'], controls: ['mouthWidth', 'receiverHeight'],
      generated: 'All body-owned datums emitted parametrically with stable role-based feature suffixes in the source feature.',
      authentic: 'One frozen source-preserving COTS bundle for the 137-call route; retain originals, hashes and every source-body mapping.',
      wcp: 'Authentic X44 solids are housing and rear cover, fastened together. Preserve both; never rotate the rear cover as a shaft. Bind a separate output shaft with explicit generated/authentic provenance, housing-to-shaft REVOLUTE, and downstream output hardware.',
      cotsDatums: 'One frozen native datum feature in each imported Part Studio, owning connectors on the actual imported solids.',
      evaluation: 'Frozen evaluator returns typed maps/arrays of all actual part IDs, volumes in mm^3 and source-coordinate bounds in mm; no per-part REST loop.',
      geometryAndFrames: 'Expected geometry, source-to-bundle transforms, per-instance world transforms and full connector frames for all variants.',
      references: 'No coral reference or rigid motor envelope may replace required native sources.' },
    executionHold: 'run.mjs only plans or checks a local binding contract. Production execution requires the next parent handoff and proven native gates.' };
}