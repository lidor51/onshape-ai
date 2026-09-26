import test from 'node:test';
import assert from 'node:assert/strict';
import { measure, parameters } from './model.mjs';
import { stages, controlMap } from './native.mjs';
import { hash } from './patch.mjs';

test('baseline and revision arithmetic matches normative bounds, holes and positive material', () => {
  const states = stages();
  const baseline = measure(states.baseline.parameters);
  const revision = measure(states.revision.parameters);
  assert.deepEqual(baseline.boundsMm, { low: [-176.35, 0, 12.7], high: [-170, 320, 162.7] });
  assert.deepEqual(revision.boundsMm, { low: [-188, 0, 12.7], high: [-180, 320, 162.7] });
  assert.equal(revision.holes.length, 6);
  assert.ok(Math.abs(revision.holes[1].center[0] - 241.2) < 1e-9);
  assert.deepEqual(revision.holes[4].center, [30, 130]);
  assert.deepEqual(revision.holes[5], { name: 'Editor downstream', center: [200, 40], diameter: 4 });
  assert.ok(revision.volumeMm3 > 0 && revision.minLigamentMm > 0);
  assert.equal(hash(states.baseline), hash(states.templatecopy));
});

test('native source contains dimensions and variable dependencies, not fixed/imported/custom geometry', () => {
  const states = stages();
  const map = controlMap(states.revision);
  assert.equal(map.constraints.length, 7);
  assert.equal(map.controls.filter(item => item.aiOwned).length, 2);
  assert.ok(states.revision.features.every(item => item.namespace === '' && !item.suppressed));
  assert.ok(states.revision.features.filter(item => item.featureType === 'newSketch')
    .every(item => item.constraints.every(value => value.constraintType !== 'FIX' && value.drivenDimension === false)));
  assert.deepEqual(states.revision.features.filter(item => !['var-innerWidth', 'var-rollerGap'].includes(item.featureId)),
    states.simulatededitor.features.filter(item => !['var-innerWidth', 'var-rollerGap'].includes(item.featureId)));
});

test('invalid units, NaN, infinity, nonpositive material, out-of-bounds and overlapping holes reject', () => {
  for (const change of [{ units: 'in' }, { innerWidth: NaN }, { rollerGap: Infinity }, { plateThickness: 0 },
    { plateHeight: -1 }, { pivotY: 0 }, { pivotY: 70, pivotZ: 65 }, { plateLength: 200 }, { plateThickness: 1e308 }]) {
    assert.throws(() => measure({ ...parameters(), ...change }));
  }
});