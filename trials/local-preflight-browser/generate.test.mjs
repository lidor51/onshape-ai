import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { analyticFor, checkSource, dialogFor, fields, sourceFor, statesFor, sweepFor } from './generate.mjs';
import { holesFor, validateParameters } from './gate.mjs';

const fixture = JSON.parse(readFileSync(new URL('../../benchmark/intake.json', import.meta.url)));
const reusedSource = readFileSync(new URL('../featurescript/intake.fs', import.meta.url), 'utf8');
const source = sourceFor(fixture, reusedSource);
const states = statesFor(fixture);

test('single-plate source exposes all ten live dimensions and pinned import', () => {
  assert.ok(source.startsWith('FeatureScript 3070;'));
  assert.ok(source.includes('version : "3070.0"'));
  assert.equal((source.match(/fCuboid\(/g) ?? []).length, 1);
  assert.equal((source.match(/export const /g) ?? []).length, 1);
  for (const [name] of fields) {
    assert.ok(source.includes(`isLength(definition.${name},`));
    assert.ok(source.includes(`"${name}" :`));
  }
  assert.ok(!source.includes('independentNativeHole'));
  assert.ok(!source.includes('makeTube'));
});

test('all intermediate candidates and deterministic sweep satisfy local parameter contracts', () => {
  assert.equal(Object.keys(states).length, 6);
  assert.equal(Object.keys(sweepFor(fixture)).length, 25);
  for (const parameters of [...Object.values(states), ...Object.values(sweepFor(fixture))]) {
    assert.equal(checkSource(source, fixture, reusedSource, parameters), 'PASS');
    assert.equal(Object.keys(dialogFor(parameters)).length, 10);
  }
});

test('revision preserves thickness/pivot and the final downstream hole stays separate', () => {
  assert.deepEqual(analyticFor(states.A).boundsMm.slice(0, 2), [-176.35, -170]);
  assert.equal(holesFor(states.A)[1].y, 246.2);
  const final = states['B-final-six'];
  assert.deepEqual(analyticFor(final).boundsMm.slice(0, 2), [-188, -180]);
  assert.equal(final.plateThicknessMm, 8);
  assert.deepEqual(final.pivotCenterYZMm, [30, 130]);
  assert.equal(holesFor(final)[1].y, 241.2);
  assert.deepEqual(holesFor(final).at(-1), { name: 'independentNativeHole', y: 200, z: 40, radius: 2 });
  assert.equal(holesFor(final).length, 6);
});

test('source mutation and unsupported fixed geometry are rejected', () => {
  assert.throws(() => checkSource(source.replace('fCuboid', 'brokenCuboid'), fixture, reusedSource, states.A), /Source differs/);
  assert.throws(() => checkSource(source, fixture, reusedSource, { ...states.A, frontRollerYMm: 71 }), /Fixed fixture/);
});

test('invalid units, non-finite values, bounds and overlapping bores never enter sweep', () => {
  for (const change of [{ plateThicknessMm: -8 }, { pivotCenterYZMm: [330, 130] }, { pivotCenterYZMm: [70, 65] }, { units: 'm' }, { rollerGapMm: NaN }, { pivotCenterYZMm: [Infinity, 130] }]) {
    assert.throws(() => validateParameters({ ...states.A, ...change }));
  }
});