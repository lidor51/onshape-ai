import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groundRepairBody } from './pilot-mates.mjs';
import { closeRepair, motionEvidence } from './pilot-repair.mjs';
import { assertHealthy } from './native.mjs';
import { loadSchema } from './schema.mjs';

const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
const result = key => ledger.attempts.find(entry => entry.key === key)?.result;

test('same-ID ground update uses a schema-supported root reference and preserves failed evidence', () => {
  const failed = result('pilot-ground');
  const before = JSON.stringify(failed);
  const body = groundRepairBody(failed, result('pilot-repair-ground-controller'));
  const request = loadSchema().request('updateFeature', { did: 'owned', wid: 'owned', eid: 'assembly',
    fid: failed.feature.featureId }, body);
  assert.equal(request.method, 'POST');
  assert.ok(request.path.endsWith(`/features/featureid/${failed.feature.featureId}`));
  assert.equal(body.rejectMicroversionSkew, true);
  assert.equal(body.feature.featureId, failed.feature.featureId);
  assert.equal(body.feature.subFeatures.length, 0);
  assert.equal(body.feature.parameters.find(parameter => parameter.parameterId === 'mateConnectorsQuery').queries[1].featureId,
    'actualGround');
  assert.equal(JSON.stringify(failed), before);
});

test('motion evidence rejects HTTP-only success, base movement and off-pivot rotation', () => {
  const baseline = result('pilot-instance-readback');
  const instances = ledger.checkpoints['pilot-instance-binding'];
  const unchanged = motionEvidence(baseline, baseline, instances, Math.PI / 6, Math.PI / 6);
  assert.equal(unchanged.armChanged, false);
  assert.equal(unchanged.valueMatchesTransform, false);
  const moved = structuredClone(baseline);
  const arm = moved.rootAssembly.occurrences.find(item => item.path[0] === instances.arm.id);
  const angle = Math.PI / 6;
  arm.transform = [Math.cos(angle), Math.sin(angle), 0, 0, -Math.sin(angle), Math.cos(angle), 0, 0,
    0, 0, 1, 0, 0, 0, 0, 1];
  const evidence = motionEvidence(moved, baseline, instances, angle, angle);
  assert.ok(evidence.armChanged && evidence.baseUnchanged && evidence.planarPivotPreserved &&
    evidence.reachedExpectedAngle && evidence.valueMatchesTransform);
  arm.transform[3] = 0.01;
  assert.equal(motionEvidence(moved, baseline, instances, angle, angle).planarPivotPreserved, false);
  moved.rootAssembly.occurrences.find(item => item.path[0] === instances.base.id).transform[3] = 0.01;
  assert.equal(motionEvidence(moved, baseline, instances, angle, angle).baseUnchanged, false);
});

test('saved failed root query closes as a partial result, not a promoted ground recipe', () => {
  assert.throws(() => assertHealthy(result('pilot-repair-ground-update')), /NATIVE_REGENERATION_UNVERIFIED/);
  const copy = structuredClone(ledger);
  delete copy.checkpoints['pilot-repair-outcome'];
  const outcome = closeRepair({ data: copy, completed: key => copy.attempts.find(entry => entry.key === key),
    checkpoint: (key, value) => { copy.checkpoints[key] = value; } });
  assert.equal(outcome.status, 'BLOCKED_GROUND_QUERY_UNRESOLVED');
  assert.equal(outcome.additionalRequests, 4);
  assert.equal(outcome.remaining, 117);
  assert.equal(outcome.resolvedGroundEndpoints, 1);
  assert.equal(outcome.armChanged, false);
  assert.equal(outcome.measuredRadians, 0);
  assert.equal(outcome.limits, 'CONFIGURED_NOT_PROVEN');
  assert.equal(outcome.productionAuthorized, false);
});