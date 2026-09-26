import assert from 'node:assert/strict';
import test from 'node:test';
import { authorize, TARGET, PHASE_CAP, TOTAL_CAP, measurementScript, requestPlan, assertRequest,
  reserve, validateLedger } from './supplement-policy.mjs';

const ledger = () => ({ schema: 1, target: TARGET, phaseCap: PHASE_CAP, totalCap: TOTAL_CAP, requests: [] });
const binding = { microversion: 'a'.repeat(24) };

test('explicit phase, current-key and quiescent-branch acknowledgement precede credential access', () => {
  assert.throws(() => authorize([]), /AUTHORIZATION/);
  assert.throws(() => authorize(['baseline', '--live-readonly-export']), /AUTHORIZATION/);
  assert.equal(authorize(['baseline', '--live-readonly-export', '--allow-current-key', '--parent-branch-quiescent']), 'baseline');
  assert.throws(() => authorize(['baseline', '--live-readonly-export', '--allow-current-key', '--parent-branch-quiescent', '--reset']), /AUTHORIZATION/);
});

test('only exact pinned branch reads and immutable measurement source are accepted', () => {
  for (const kind of ['features', 'parts', 'source', 'measure', 'png', 'step']) {
    const request = requestPlan(kind, binding);
    assertRequest(request, kind, binding);
    for (const method of ['PUT', 'PATCH', 'DELETE']) assert.throws(() => assertRequest({ ...request, method }, kind, binding), /DENIED/);
    for (const url of [request.url.replace(TARGET.did, 'b'.repeat(24)), request.url.replace('https:', 'http:'),
      request.url.replace('cad.onshape.com', 'example.invalid'), request.url + '#fragment', request.url + '&extra=true']) {
      assert.throws(() => assertRequest({ ...request, url }, kind, binding), /DENIED/);
    }
  }
  const measurement = requestPlan('measure', binding);
  assert.throws(() => assertRequest({ ...measurement, body: { script: 'function(context, queries) { opDeleteBodies(context, makeId("bad"), {}); }', queries: [] } }, 'measure', binding), /SOURCE_DENIED/);
  assert.throws(() => requestPlan('share'), /DENIED/);
  assert.throws(() => requestPlan('parts'), /MICROVERSION/);
  assert.throws(() => requestPlan('poll', {}), /DENIED/);
  assert.equal(requestPlan('step').body.storeInDocument, false);
  assert.ok(requestPlan('step').url.endsWith('/export/step'));
  assert.deepEqual(requestPlan('step').body, { storeInDocument: false });
});

test('measurement contains literal retained feature query and no geometry-generating operations', () => {
  const source = measurementScript();
  assert.ok(source.includes(`makeId("${TARGET.featureId}")`));
  assert.ok(source.includes('qCreatedBy(featureId + role, EntityType.BODY)'));
  assert.doesNotMatch(source, /\b(?:op\w+|fCuboid|fCylinder|newSketch|setProperty|defineFeature|import|officialIntakeFinal)\s*\(/);
  assert.ok(source.includes('PropertyType.EXCLUDE_FROM_BOM'));
  assert.ok(source.includes('evSurfaceDefinition'));
});

test('attempts consume non-resetting per-phase and cumulative budgets including failures', () => {
  const state = ledger();
  for (let index = 0; index < 12; index++) reserve(state, 'baseline', requestPlan('features'));
  assert.throws(() => reserve(state, 'baseline', requestPlan('features')), /PHASE_REQUEST_CAP/);
  const resumed = JSON.parse(JSON.stringify(state));
  validateLedger(resumed);
  for (let index = 0; index < 12; index++) reserve(resumed, 'revision', requestPlan('features'));
  assert.throws(() => reserve(resumed, 'revision', requestPlan('features')), /CUMULATIVE_REQUEST_CAP/);
  assert.equal(resumed.requests.length, 24);
  assert.throws(() => validateLedger({ ...state, totalCap: 25 }), /NEVER_RESET/);
  assert.throws(() => validateLedger({ ...state, target: { ...TARGET, wid: 'b'.repeat(24) } }), /NEVER_RESET/);
});