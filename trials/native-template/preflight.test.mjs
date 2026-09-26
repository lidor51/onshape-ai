import test from 'node:test';
import assert from 'node:assert/strict';
import { stages } from './native.mjs';
import { assertPreflight, preflight, guardedRevision } from './preflight.mjs';

const binding = { sourceHash: 'test-source', testHash: 'test-suite' };
const tests = { ...binding, status: 'PASS' };

test('preflight binds exact candidates, patch, parameters, tests and source', () => {
  const bundle = stages();
  const report = preflight(bundle, tests, binding);
  assertPreflight(report, bundle, tests, binding);
  assert.throws(() => assertPreflight(report, bundle, tests, { ...binding, sourceHash: 'changed' }));
  assert.throws(() => assertPreflight(report, bundle, { ...tests, status: 'FAIL' }, binding));
  const mutated = structuredClone(bundle);
  mutated.revision.features.at(-1).name = 'tamper';
  assert.throws(() => assertPreflight(report, mutated, tests, binding));
  const changedPatch = structuredClone(bundle);
  changedPatch.patch.changes[0].after.parameters.find(item => item.parameterId === 'value').expression = '361 mm';
  assert.throws(() => preflight(changedPatch, tests, binding));
});

test('invalid geometry, stale and conflicting snapshots cannot invoke transport', async () => {
  const bundle = stages();
  let calls = 0;
  const transport = async () => { calls++; };
  for (const change of [{ units: 'm' }, { plateThickness: -8 }, { pivotY: 70, pivotZ: 65 },
    { pivotY: 0 }, { plateThickness: Infinity }, { rollerGap: NaN }, { plateLength: 1 }]) {
    await assert.rejects(guardedRevision(bundle.snapshot, bundle.snapshot,
      { innerWidth: 360, rollerGap: 95 }, { ...bundle.revision.parameters, ...change }, transport));
  }
  await assert.rejects(guardedRevision({ ...bundle.snapshot, microversion: 'new-editor' }, bundle.snapshot,
    { innerWidth: 360, rollerGap: 95 }, bundle.revision.parameters, transport), /STALE/);
  const conflict = structuredClone(bundle.snapshot);
  conflict.features[0].parameters.find(item => item.parameterId === 'value').expression = '355 mm';
  await assert.rejects(guardedRevision(conflict, bundle.snapshot,
    { innerWidth: 360, rollerGap: 95 }, bundle.revision.parameters, transport), /CONFLICT/);
  await assert.rejects(guardedRevision(bundle.snapshot, bundle.snapshot,
    { innerWidth: 361, rollerGap: 95 }, bundle.revision.parameters, transport), /PATCH_PARAMETER/);
  await assert.rejects(guardedRevision(bundle.snapshot, bundle.snapshot,
    { innerWidth: 360, rollerGap: 95 }, { ...bundle.revision.parameters, plateThickness: 9 }, transport), /CACHED_CONTROL/);
  assert.equal(calls, 0);
});