import test from 'node:test';
import assert from 'node:assert/strict';
import { measurementScript, validateMeasurements } from './measure.mjs';

const expected = { expectedSolidCount: 1, parts: [{ name: 'plate', boundsMm: { min: [0, 0, 0], max: [6, 100, 100] }, throughHoles: [{ centerYZMm: [20, 30], diameterMm: 8 }], nonBom: true }] };
const fixture = () => ({ solidCount: 1, parts: [{ name: 'plate', minMm: [0, 0, 0], maxMm: [6, 100, 100], nonBom: true, cylinders: [{ diameterMm: 8, originMm: [0, 20, 30], axis: [1, 0, 0], minMm: [0, 16, 26], maxMm: [6, 24, 34] }] }] });

test('measurement script requests tight bounds, cylindrical faces and BOM property', () => {
  for (const token of ['"tight" : true', 'GeometryType.CYLINDER', 'evSurfaceDefinition', 'PropertyType.EXCLUDE_FROM_BOM']) assert.ok(measurementScript.includes(token));
});
test('accepts measured through-hole geometry within tolerance', () => {
  assert.equal(validateMeasurements(fixture(), expected).status, 'PASS');
});
test('rejects missing holes, blind holes, incorrect bounds and missing BOM exclusion', () => {
  for (const mutate of [
    part => { part.cylinders = []; },
    part => { part.cylinders[0].maxMm[0] = 5; },
    part => { part.cylinders[0].diameterMm = 9; },
    part => { part.maxMm[1] = 101; },
    part => { part.nonBom = false; },
  ]) {
    const measured = fixture();
    mutate(measured.parts[0]);
    assert.throws(() => validateMeasurements(measured, expected));
  }
});