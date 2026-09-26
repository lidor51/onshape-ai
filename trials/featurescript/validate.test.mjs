import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { expectations } from './geometry.mjs';
import { assertFeatureState, compiledSpec, decodeFs, measurementScript, validateMeasurements } from './validate.mjs';

const benchmark = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));
const encode = value => ({ btType: `com.belmonttech.serialize.fsvalue.BTFSValue${Array.isArray(value) ? 'Array' : typeof value === 'number' ? 'Number' : 'String'}`, value: Array.isArray(value) ? value.map(encode) : value });

function syntheticEvaluation(expected) {
  return { result: encode([9, expected.parts.map(part => {
    const { min, max } = part.boundsMm;
    const surfaces = part.holes?.map(hole => [hole.diameterMm / 2, ...hole.centerYZMm]) ??
      (part.name.includes('Crossmember') ? [] : [[(max[1] - min[1]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
        ...(part.boreDiameterMm ? [[part.boreDiameterMm / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]] : [])]);
    return [part.name, 1, min, max, part.volumeMm3, surfaces.map(surface => [...surface, [1, 0, 0], min, max])];
  })]) };
}

test('synthetic validation contract only: both variants and wrong gap rejection', () => {
  for (const variant of ['baseline', 'revision']) {
    const expected = expectations(benchmark, variant);
    assert.equal(validateMeasurements(syntheticEvaluation(expected), expected).solidCount, 9);
  }
  assert.throws(() => validateMeasurements(syntheticEvaluation(expectations(benchmark)), expectations(benchmark, 'revision')));
});

test('synthetic validation contract only: missing plate hole and blind bore are rejected', () => {
  const expected = expectations(benchmark);
  const decoded = decodeFs(syntheticEvaluation(expected).result);
  decoded[1][0][5].pop();
  assert.throws(() => validateMeasurements({ result: encode(decoded) }, expected), /cylindrical face count/);
  const blind = decodeFs(syntheticEvaluation(expected).result);
  blind[1][0][5][0][4][0] += 1;
  assert.throws(() => validateMeasurements({ result: encode(blind) }, expected), /through surface/);
});

test('lexical measurement contract only: read-only lambda, scoped IDs, tight boxes and analytic faces', () => {
  const script = measurementScript('synthetic_feature', benchmark.requiredParts);
  assert.match(script, /qCreatedBy\(rootId \+ role \+ "blank"/);
  assert.match(script, /"tight" : true/);
  assert.match(script, /evSurfaceDefinition/);
  assert.doesNotMatch(script, /opBoolean|fCylinder|fCuboid|defineFeature/);
  assert.throws(() => measurementScript('bad"id', []));
});

test('response gates do not confuse an HTTP response with successful compilation or regeneration', () => {
  assert.throws(() => compiledSpec({}));
  assert.throws(() => compiledSpec({ featureSpecs: [] }));
  assert.throws(() => assertFeatureState({ featureState: { featureStatus: 'ERROR' } }));
  assert.throws(() => assertFeatureState({ featureState: { featureStatus: 'OK', inactive: true } }));
  assert.throws(() => assertFeatureState({ featureState: { featureStatus: 'OK' }, microversionSkew: true }));
  assert.throws(() => decodeFs({ btType: 'Unexpected', value: 9 }));
});