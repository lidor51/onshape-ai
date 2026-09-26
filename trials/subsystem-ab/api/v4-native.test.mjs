import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groundContract, pilotTarget, requireGroundAuthority, suppressionRequest, pilotMotionRequest,
  assertPilotMotion, assertPilotReadback, relationDeltaEvidence } from './v4-native.mjs';
import { loadSchema } from './schema.mjs';
import { sha256 } from './ledger.mjs';

const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
const result = key => ledger.attempts.find(entry => entry.key === key)?.result;
const baseline = result('pilot-repair-ground-readback');

function poseFixture(angle) {
  const definition = structuredClone(baseline);
  definition.rootAssembly.documentMicroversion = '111111111111111111111111';
  definition.rootAssembly.features.find(feature => feature.id === pilotTarget.failedGroundId).suppressed = true;
  definition.rootAssembly.occurrences.find(item => item.path[0] === pilotTarget.baseId).fixed = true;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  definition.rootAssembly.occurrences.find(item => item.path[0] === pilotTarget.armId).transform =
    [cosine, sine, 0, 0, -sine, cosine, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return definition;
}

const valuesFixture = radians => ({ mateValues: [{ ...result('pilot-mate-values-before').mateValues[0], rotationZ: radians }] });

test('public research artifact matches the preserved official schema and distinguishes observed motion codec', () => {
  const research = JSON.parse(readFileSync(new URL('./v4-public-research.json', import.meta.url), 'utf8'));
  const schemaBytes = readFileSync(new URL('./schema/openapi-v17.json', import.meta.url));
  const schema = loadSchema();
  assert.equal(research.openapi.cachedSha256, sha256(schemaBytes));
  assert.equal(research.openapi.cachedAndCurrentInfoVersion, schema.spec.info.version);
  assert.deepEqual(research.openapi.fields, groundContract(schema).writableFields);
  assert.equal(research.authoritativeGroundPayload, null);
  assert.equal(research.authenticatedRequests, 0);
  assert.equal(research.jarvis.sourceCodeExecuted, false);
  assert.match(research.motion.rotationZAuthority, /Observed/);
  assert.equal(schema.flatten({ $ref: '#/components/schemas/BTOccurrenceData-75' }).properties.isFixed.type, 'boolean');
  assert.equal(schema.flatten({ $ref: '#/components/schemas/BTAssemblyMateValueInfo' }).properties.rotationZ, undefined);
});

test('current public modify contract rejects invented fixed-state payloads', () => {
  const schema = loadSchema();
  const contract = groundContract(schema);
  assert.equal(contract.operation, 'modify');
  assert.equal(contract.authoritativeGroundPayload, null);
  assert.equal(contract.nativeGroundProven, false);
  for (const field of contract.rejectedCandidates) {
    const value = field.endsWith('Instances') ? [pilotTarget.baseId] : true;
    assert.throws(() => schema.request('modify', pilotTarget, { [field]: value }), /SCHEMA_FIELD/);
  }
  assert.throws(() => requireGroundAuthority(), /AUTHORITATIVE_GROUND_PAYLOAD_REQUIRED/);
  schema.request('modify', pilotTarget, { editDescription: 'V4 schema check' });
});

test('suppression preserves the failed same-ID definition and historical evidence', () => {
  const saved = result('pilot-repair-ground-update');
  const before = JSON.stringify(saved);
  const request = suppressionRequest(saved, baseline);
  assert.equal(request.operation, 'updateFeature');
  assert.equal(request.body.feature.featureId, pilotTarget.failedGroundId);
  assert.equal(request.body.feature.suppressed, true);
  assert.equal(request.body.rejectMicroversionSkew, true);
  assert.equal(request.body.sourceMicroversion, baseline.rootAssembly.documentMicroversion);
  assert.deepEqual({ ...request.body.feature, suppressed: false, suppressionState: null }, saved.feature);
  assert.equal(JSON.stringify(saved), before);
  assert.equal(ledger.checkpoints['pilot-repair-outcome'].closed, true);
});

test('radian motion codec uses observed polymorphic field, with distinct interior and limit commands', () => {
  const observed = result('pilot-mate-values-before');
  for (const [scenario, radians] of [['interior', Math.PI / 6], ['upper', Math.PI / 2], ['lower', -Math.PI / 2], ['restore', 0]]) {
    const request = pilotMotionRequest(observed, scenario);
    assert.equal(request.operation, 'updateMateValues');
    assert.equal(request.body.mateValues[0].rotationZ, radians);
    assert.equal(request.body.mateValues[0].jsonType, 'Revolute');
  }
  assert.throws(() => pilotMotionRequest(observed, 'degrees'), /SCENARIO_REQUIRED/);
  assert.throws(() => pilotMotionRequest({ mateValues: [] }, 'interior'), /OBSERVED_PILOT/);
});

test('synthetic readbacks prove pose checks, never promote HTTP success or historical ground ERROR', () => {
  const angle = Math.PI / 6;
  const after = poseFixture(angle);
  const evidence = assertPilotMotion(after, baseline, valuesFixture(angle), 'interior');
  assert.equal(evidence.status, 'PASS_POSE_ONLY');
  assert.equal(evidence.limits, 'UNPROVEN_INTERIOR_ONLY');
  assert.equal(evidence.productionAuthorized, false);
  assert.equal(evidence.suppressedHistoricalFailureCount, 1);
  assert.match(evidence.activeFeatureHealth, /UNVERIFIED/);
  assert.throws(() => assertPilotMotion(baseline, baseline, valuesFixture(0), 'interior'), /FRESH_OWNED/);
  assert.throws(() => assertPilotMotion(poseFixture(0), baseline, valuesFixture(0), 'interior'), /POSE_NOT_OBSERVED/);
  assert.throws(() => assertPilotMotion(after, baseline, { status: 200 }, 'interior'), /TRANSFORM_DISAGREE/);
  assert.throws(() => assertPilotMotion(after, baseline, valuesFixture(-angle), 'interior'), /TRANSFORM_DISAGREE/);
  for (const mutate of [
    item => { item.rootAssembly.occurrences.find(native => native.path[0] === pilotTarget.baseId).fixed = false; },
    item => { item.rootAssembly.occurrences.find(native => native.path[0] === pilotTarget.armId).fixed = true; },
    item => { item.rootAssembly.occurrences.find(native => native.path[0] === pilotTarget.baseId).transform[3] = 0.01; },
    item => { item.rootAssembly.features[0].suppressed = false; },
    item => { item.rootAssembly.features.shift(); },
    item => { item.rootAssembly.instances[0].partId = 'different'; },
    item => { item.rootAssembly.occurrences.find(native => native.path[0] === pilotTarget.armId).transform[3] = 0.01; },
  ]) {
    const invalid = structuredClone(after);
    mutate(invalid);
    assert.throws(() => assertPilotMotion(invalid, baseline, valuesFixture(angle), 'interior'), /V4_/);
  }
  assertPilotReadback(poseFixture(0), baseline);
});

test('upper and lower enforcement remain separate from interior movement and unchanged responses', () => {
  for (const [scenario, angle] of [['upper', Math.PI / 3], ['lower', -Math.PI / 6]]) {
    assert.equal(assertPilotMotion(poseFixture(angle), baseline, valuesFixture(angle), scenario).limits,
      'OBSERVED_AT_REQUESTED_SIDE_BOUND');
    assert.throws(() => assertPilotMotion(poseFixture(0), baseline, valuesFixture(0), scenario), /POSE_NOT_OBSERVED/);
  }
});

test('moving-carrier relation check uses carrier-relative signed deltas without a hierarchy prerequisite', () => {
  const before = { driver: 0, driven: 0, carrier: 0 };
  const after = { driver: 0.7, driven: -0.8, carrier: 0.2 };
  assert.equal(relationDeltaEvidence({ before, after, outputPerInput: -2, movingCarrier: true }).pass, true);
  assert.equal(relationDeltaEvidence({ before, after, outputPerInput: 2, movingCarrier: true }).pass, false);
  assert.equal(relationDeltaEvidence({ before, after: before, outputPerInput: -2, movingCarrier: true }).pass, false);
  assert.equal(relationDeltaEvidence({ before, after: { driver: 0.5, driven: -1, carrier: 0 }, outputPerInput: -2,
    movingCarrier: true }).pass, false);
});