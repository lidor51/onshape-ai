import assert from 'node:assert/strict';
import test from 'node:test';
import { compilerProbeSource } from './compiler-probe.mjs';
import { compactFeatureScript, featureSource, loadLocalFixture } from './generate.mjs';

const { task } = await loadLocalFixture();

test('one compiler probe fits the parent limit and preserves actual suspect helper declarations', () => {
  const source = compilerProbeSource(task);
  assert.ok(source.length <= 2000);
  assert.match(source, /^FeatureScript 3070;/);
  assert.match(source, /version:"3070.0"/);
  assert.doesNotMatch(source, /[^\x00-\x7f]/);
  const original = featureSource(task);
  for (const [start, end] of [
    ['function makeBox(', 'function drilledPlate('],
    ['function officialIntakeNear(', '  function officialIntakeAssert('],
  ]) {
    const fragment = original.slice(original.indexOf(start), original.indexOf(end));
    assert.ok(source.includes(compactFeatureScript(fragment)), start);
  }
  for (const token of ['is Vector', 'is ValueWithUnits', 'as LengthBoundSpec', 'fCuboid(', 'fCylinder(',
    'setProperty(', 'qBodyType(', 'returns map', 'const officialIntake = defineFeature',
    'officialIntake(context,id+"probe",inputs())', 'OFFICIAL_DECL_OK']) {
    assert.ok(source.includes(token), token);
  }
  assert.equal(source.match(/isLength\(definition\./g).length, 3);
  assert.equal(source.match(/^export const \w+ = defineFeature/gm).length, 2);
  assert.ok(source.indexOf('const officialIntake = defineFeature') < source.indexOf('export const probe'));
  assert.ok(source.indexOf('function inputs(') < source.indexOf('export const probe'));
});

test('probe is separate from the production model and does not claim geometry validation', () => {
  const original = featureSource(task);
  const source = compilerProbeSource(task);
  assert.equal(featureSource(task), original);
  assert.doesNotMatch(source, /assertionsPassed|TRANSIENT_SCRATCH_EVALUATION_NOT_PERSISTED/);
  assert.doesNotMatch(source, /officialIntakeAssert\(|drilledPlate\(|makeTube\(/);
  assert.ok(original.includes('through start'));
  assert.ok(original.includes('through end'));
  assert.ok(original.includes('volumeMm3'));
});