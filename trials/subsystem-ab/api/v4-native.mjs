import { loadSchema } from './schema.mjs';
import { requireThat } from './ledger.mjs';
import { concurrency } from './native.mjs';
import { errorBetween, inverseRigid, multiply, rigid } from './graph.mjs';
import { observedMateValueRequest } from './pilot-motion.mjs';

export const pilotTarget = Object.freeze({
  did: 'c88349fc8bd39b3e6d811b19', wid: '2cb07fb6d6b08930d5b0cf8f', eid: '58b7e117163e0ec8a6100e66',
  baseId: 'MSpc3q/jM0oxa5U+q', armId: 'M+MREVtBvc2Vk9gdr',
  failedGroundId: 'MHVWwSC5EjXoRtyJV', revoluteId: 'MnOxhkG9xBvNei93d',
});

export const originalPrefixSha256 = 'a4d100c6f3c983770fbdf0f1c6f00e81fb02ebb0a15e0573307f01220083e8ea';

export function groundContract(schema = loadSchema()) {
  const operation = schema.operation('modify');
  const shape = schema.flatten({ $ref: '#/components/schemas/BTAssemblyModificationParams' });
  return {
    status: 'NO_AUTHORITATIVE_FIXED_STATE_WRITE_FOUND',
    source: 'https://cad.onshape.com/api/openapi',
    schemaRef: '#/components/schemas/BTAssemblyModificationParams',
    operation: operation.operationId, path: operation.path,
    writableFields: Object.keys(shape.properties).sort(),
    rejectedCandidates: ['fixInstances', 'fixedInstances', 'isFixed', 'fixed'],
    readbackRef: '#/components/schemas/BTAssemblyOccurrenceInfo/properties/fixed',
    authoritativeGroundPayload: null,
    nativeGroundProven: false,
  };
}

export function requireGroundAuthority() {
  requireThat(false, 'V4_AUTHORITATIVE_GROUND_PAYLOAD_REQUIRED');
}

export const pilotScenarios = Object.freeze({
  interior: { requestedRadians: Math.PI / 6, expectedRadians: Math.PI / 6, kind: 'WITHIN_LIMITS' },
  upper: { requestedRadians: Math.PI / 2, expectedRadians: Math.PI / 3, kind: 'OUTSIDE_UPPER_LIMIT' },
  lower: { requestedRadians: -Math.PI / 2, expectedRadians: -Math.PI / 6, kind: 'OUTSIDE_LOWER_LIMIT' },
  restore: { requestedRadians: 0, expectedRadians: 0, kind: 'RESTORE' },
});

export function suppressionRequest(savedResponse, latestDefinition, schema = loadSchema()) {
  const feature = structuredClone(savedResponse?.feature);
  requireThat(feature?.featureId === pilotTarget.failedGroundId && feature.suppressed === false &&
    savedResponse.featureState?.featureStatus === 'ERROR', 'SAVED_FAILED_FEATURE_REQUIRED');
  feature.suppressed = true;
  if (feature.suppressionState === null) delete feature.suppressionState;
  return schema.request('updateFeature', { ...pilotTarget, fid: feature.featureId }, {
    btType: 'BTFeatureDefinitionCall-1406',
    ...concurrency({ ...savedResponse, sourceMicroversion: latestDefinition?.rootAssembly?.documentMicroversion }),
    feature,
  });
}

export function pilotMotionRequest(observed, scenario, schema = loadSchema()) {
  requireThat(Object.hasOwn(pilotScenarios, scenario), 'V4_PILOT_SCENARIO_REQUIRED');
  const mate = observed?.mateValues?.find(value => value.featureId === pilotTarget.revoluteId);
  requireThat(mate?.jsonType === 'Revolute' && mate.ownerOccurrencePath?.length === 0, 'OBSERVED_PILOT_REVOLUTE_REQUIRED');
  return observedMateValueRequest(schema, pilotTarget, { mateValues: [{ ...structuredClone(mate),
    rotationZ: pilotScenarios[scenario].requestedRadians }] }, observed);
}

const matrixSI = values => {
  requireThat(Array.isArray(values) && values.length === 16, 'V4_TRANSFORM_REQUIRED');
  return rigid(Array.from({ length: 4 }, (_, row) => values.slice(row * 4, row * 4 + 4)));
};
const frameSI = frame => {
  requireThat(frame && ['xAxis', 'yAxis', 'zAxis', 'origin'].every(key =>
    Array.isArray(frame[key]) && frame[key].length === 3), 'V4_CONNECTOR_FRAME_REQUIRED');
  return rigid([
    [frame.xAxis[0], frame.yAxis[0], frame.zAxis[0], frame.origin[0]],
    [frame.xAxis[1], frame.yAxis[1], frame.zAxis[1], frame.origin[1]],
    [frame.xAxis[2], frame.yAxis[2], frame.zAxis[2], frame.origin[2]],
    [0, 0, 0, 1],
  ]);
};
const occurrence = (definition, path) => {
  const matches = definition?.rootAssembly?.occurrences?.filter(item => JSON.stringify(item.path) === JSON.stringify(path));
  requireThat(matches?.length === 1, 'V4_UNIQUE_OCCURRENCE_REQUIRED');
  return matches[0];
};

export function measureMateAngle(definition, mateId) {
  const mate = definition?.rootAssembly?.features?.find(feature => feature.id === mateId);
  requireThat(mate?.featureData?.mateType === 'REVOLUTE' && mate.suppressed === false &&
    mate.featureData.matedEntities?.length === 2, 'V4_TWO_ACTIVE_REVOLUTE_ENDPOINTS_REQUIRED');
  const worldFrames = mate.featureData.matedEntities.map(entity => multiply(
    matrixSI(occurrence(definition, entity.matedOccurrence).transform), frameSI(entity.mateConnectorCS)));
  const relative = multiply(inverseRigid(worldFrames[1]), worldFrames[0]);
  const radians = Math.atan2(relative[1][0], relative[0][0]);
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const planar = [[cosine, -sine, 0, 0], [sine, cosine, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  requireThat(errorBetween(relative, planar) < 1e-8, 'V4_PIVOT_OR_AXIS_MOVED');
  return radians;
}

export function assertPilotReadback(definition, baseline) {
  const root = definition?.rootAssembly;
  requireThat(root?.documentId === pilotTarget.did && root.elementId === pilotTarget.eid &&
    /^[a-f0-9]{24}$/.test(root.documentMicroversion ?? '') &&
    root.documentMicroversion !== baseline?.rootAssembly?.documentMicroversion, 'V4_FRESH_OWNED_READBACK_REQUIRED');
  requireThat(root.instances?.length === 2 && root.occurrences?.length === 2, 'V4_PILOT_COUNT_CHANGED');
  for (const instance of baseline.rootAssembly.instances) {
    const native = root.instances.find(item => item.id === instance.id);
    requireThat(native?.suppressed === false && ['id', 'documentId', 'elementId', 'partId'].every(key =>
      native[key] === instance[key]), 'V4_PILOT_IDENTITY_CHANGED');
  }
  const base = occurrence(definition, [pilotTarget.baseId]);
  const arm = occurrence(definition, [pilotTarget.armId]);
  requireThat(base.fixed === true && arm.fixed === false, 'V4_BASE_NOT_FIXED_OR_ARM_FIXED');
  requireThat(errorBetween(matrixSI(base.transform), matrixSI(occurrence(baseline, [pilotTarget.baseId]).transform)) < 1e-8,
    'V4_BASE_MOVED');
  const oldGround = root.features?.filter(feature => feature.id === pilotTarget.failedGroundId);
  requireThat(oldGround?.length === 1 && oldGround[0].suppressed === true, 'V4_FAILED_MATE_MUST_REMAIN_SUPPRESSED');
  requireThat(root.features.length === baseline.rootAssembly.features.length && root.features.every(feature =>
    baseline.rootAssembly.features.some(previous => previous.id === feature.id)), 'V4_PILOT_FEATURE_IDENTITY_CHANGED');
  const revolute = root.features.find(feature => feature.id === pilotTarget.revoluteId);
  const previousMate = baseline.rootAssembly.features.find(feature => feature.id === pilotTarget.revoluteId);
  requireThat(revolute?.suppressed === false && revolute.featureData?.mateType === 'REVOLUTE' &&
    JSON.stringify(revolute.featureData.mateLimits) === JSON.stringify(previousMate.featureData.mateLimits) &&
    revolute.featureData.mateLimits.limitAxialZMin === -Math.PI / 6 &&
    revolute.featureData.mateLimits.limitAxialZMax === Math.PI / 3, 'V4_LIMIT_CONFIGURATION_CHANGED');
  requireThat(revolute.featureData.matedEntities?.length === 2, 'V4_TWO_ACTIVE_REVOLUTE_ENDPOINTS_REQUIRED');
  revolute.featureData.matedEntities.forEach((entity, index) => {
    const previous = previousMate.featureData.matedEntities[index];
    requireThat(JSON.stringify(entity.matedOccurrence) === JSON.stringify(previous.matedOccurrence) &&
      errorBetween(frameSI(entity.mateConnectorCS), frameSI(previous.mateConnectorCS)) < 1e-8,
    'V4_CONNECTOR_IDENTITY_OR_DATUM_CHANGED');
  });
  return { baseFixed: true, failedFeatureRetained: true, suppressedHistoricalFailureCount: 1,
    historicalGroundStatus: 'ERROR', activeFeatureHealth: 'UNVERIFIED_REQUIRES_FRESH_FEATURE_STATES',
    sourceMicroversion: root.documentMicroversion };
}

export function assertPilotMotion(definition, baseline, commandResponse, scenario) {
  requireThat(Object.hasOwn(pilotScenarios, scenario), 'V4_PILOT_SCENARIO_REQUIRED');
  const readback = assertPilotReadback(definition, baseline);
  const expected = pilotScenarios[scenario];
  const measuredRadians = measureMateAngle(definition, pilotTarget.revoluteId);
  const returned = commandResponse?.mateValues?.find(value => value.featureId === pilotTarget.revoluteId);
  requireThat(returned?.jsonType === 'Revolute' && returned.ownerOccurrencePath?.length === 0 &&
    Number.isFinite(returned.rotationZ) && Math.abs(returned.rotationZ - measuredRadians) < 1e-8,
  'V4_MATE_VALUE_TRANSFORM_DISAGREE');
  requireThat(Math.abs(measuredRadians - expected.expectedRadians) < 1e-8, 'V4_REQUESTED_POSE_NOT_OBSERVED');
  if (scenario !== 'restore') requireThat(errorBetween(matrixSI(occurrence(definition, [pilotTarget.armId]).transform),
    matrixSI(occurrence(baseline, [pilotTarget.armId]).transform)) > 1e-8, 'V4_NO_ACTUAL_MOTION');
  return { ...readback, status: 'PASS_POSE_ONLY', scenario, ...expected, measuredRadians,
    limits: scenario === 'interior' ? 'UNPROVEN_INTERIOR_ONLY' : scenario === 'restore' ? 'RESTORED' : 'OBSERVED_AT_REQUESTED_SIDE_BOUND',
    productionAuthorized: false };
}

export function relationDeltaEvidence({ before, after, outputPerInput, movingCarrier = false }) {
  requireThat([before?.driver, before?.driven, before?.carrier, after?.driver, after?.driven, after?.carrier, outputPerInput]
    .every(Number.isFinite) && outputPerInput !== 0, 'V4_RELATION_ANGLES_REQUIRED');
  const carrierDelta = after.carrier - before.carrier;
  const driverDelta = after.driver - before.driver - carrierDelta;
  const drivenDelta = after.driven - before.driven - carrierDelta;
  const residual = drivenDelta - outputPerInput * driverDelta;
  return { driverDelta, drivenDelta, carrierDelta, residual,
    pass: Math.abs(driverDelta) > 1e-8 && Math.abs(drivenDelta) > 1e-8 && Math.abs(residual) < 1e-8 &&
      (!movingCarrier || Math.abs(carrierDelta) > 1e-8),
    basis: 'UNWRAPPED_COAXIAL_ANGLES_IN_SHARED_SIGNED_AXIS_FRAME',
    nativeRelationHealth: 'SEPARATE_GATE', hierarchyProofRequiredForThisLocalCheck: false };
}