import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPatch, planPatch } from './patch.mjs';

const variable = (name, expression) => ({
  featureType: 'assignVariable', featureId: `variable-${name}`, name,
  parameters: [{ parameterId: 'name', value: name }, { parameterId: 'value', expression }],
});
const edited = () => ({
  microversion: 'simulated-editor-1',
  features: [variable('innerWidth', '340 mm'), variable('rollerGap', '100 mm'),
    variable('plateThickness', '8 mm'), variable('pivotY', '30 mm'),
    { featureId: 'editor-hole', featureType: 'extrude', name: 'Editor downstream 4 mm through-hole',
      parameters: [{ parameterId: 'diameter', expression: '4 mm' }], opaque: { keep: true } }],
});

test('first discriminator: patch only width/gap, preserving user edits and downstream definition', () => {
  const before = edited();
  const patch = planPatch(before, { innerWidth: 360, rollerGap: 95 });
  const after = applyPatch(before, patch);
  assert.deepEqual(after.features.slice(2), before.features.slice(2));
  assert.equal(after.features[0].parameters[1].expression, '360 mm');
  assert.equal(after.features[1].parameters[1].expression, '95 mm');
  assert.equal(before.features[0].parameters[1].expression, '340 mm');
});

test('stale microversion and an intervening AI-owned edit stop the patch', () => {
  const before = edited();
  const patch = planPatch(before, { innerWidth: 360, rollerGap: 95 });
  assert.throws(() => applyPatch({ ...before, microversion: 'editor-2' }, patch), /STALE/);
  const conflict = structuredClone(before);
  conflict.features[0].parameters[1].expression = '355 mm';
  assert.throws(() => applyPatch(conflict, patch), /CONFLICTING/);
});

test('unrelated definitions cannot be smuggled into the owned patch', () => {
  const before = edited();
  const patch = planPatch(before, { innerWidth: 360, rollerGap: 95 });
  patch.changes[0].after.name = 'unexpected edit';
  assert.throws(() => applyPatch(before, patch), /TAMPERED/);
  assert.throws(() => planPatch(before, { innerWidth: 360, plateThickness: 9 }), /OWNERSHIP/);
});