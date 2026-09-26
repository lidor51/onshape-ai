import assert from 'node:assert/strict';
import test from 'node:test';
import { expectations, featureScript, loadBenchmark } from './benchmark.mjs';

const specification = await loadBenchmark();
const baseline = expectations(specification);
const revision = expectations(specification, true);

test('baseline contains nine expected solids, five holes per plate and three sleeves', () => {
  assert.equal(baseline.expectedSolidCount, 9);
  assert.deepEqual(baseline.parts.map(part => part.name).sort(), [...specification.requiredParts].sort());
  for (const plate of baseline.parts.filter(part => part.name.endsWith('Plate'))) {
    assert.equal(plate.throughHoles.length, 5);
    assert.deepEqual(plate.throughHoles.map(hole => hole.diameterMm), [12.9, 12.9, 6.6, 6.6, 12.9]);
  }
  assert.equal(baseline.parts.filter(part => part.boreDiameterMm).length, 3);
});

test('surface gap, plate positions and shaft extensions obey the protocol', () => {
  assert.equal(baseline.rearRollerYMm, 246.2);
  assert.equal(baseline.sleeveLengthMm, 330);
  assert.equal(baseline.shaftLengthMm, 378.1);
  assert.equal(baseline.parts.find(part => part.name === 'leftPlate').boundsMm.min[0], -176.35);
  assert.equal(baseline.parts.find(part => part.name === 'rightPlate').boundsMm.min[0], 170);
  assert.equal(baseline.parts.find(part => part.name === 'coralReference').nonBom, true);
});

test('revision changes only normative input values and dependent geometry expectations', () => {
  assert.equal(revision.dimensions.innerWidthMm, 360);
  assert.equal(revision.dimensions.rollerGapMm, 95);
  assert.equal(revision.rearRollerYMm, 241.2);
  assert.equal(revision.sleeveLengthMm, 350);
  assert.equal(revision.shaftLengthMm, 398.1);
  assert.deepEqual(revision.parts.find(part => part.name === 'coralReference'), baseline.parts.find(part => part.name === 'coralReference'));
  assert.deepEqual(Object.keys(specification.baseline).filter(key => baseline.dimensions[key] !== revision.dimensions[key]), ['innerWidthMm', 'rollerGapMm']);
});

test('generated source exposes revision parameters and excludes coral from BOM', () => {
  const source = featureScript(specification);
  assert.match(source, /definition.innerWidth/);
  assert.match(source, /definition.rollerGap/);
  assert.match(source, /PropertyType.EXCLUDE_FROM_BOM/);
  assert.match(source, /BooleanOperationType.SUBTRACTION/);
  assert.doesNotMatch(source, /opDeleteBodies|opTransform/);
  assert.equal(baseline.serverMeasurements, null);
  assert.equal(revision.stepExport, null);
});