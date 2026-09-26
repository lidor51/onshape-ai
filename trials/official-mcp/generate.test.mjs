import assert from 'node:assert/strict';
import test from 'node:test';
import { expectedModel, validateExpected, featureSource, assertionModel, dispatchSource, loadLocalFixture } from './generate.mjs';

const { task } = await loadLocalFixture();
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('baseline independently matches normative coordinates and nine separate part expectations', () => {
  const model = expectedModel(task);
  assert.equal(validateExpected(model, task), true);
  const parts = Object.fromEntries(model.parts.map(part => [part.name, part]));
  assert.deepEqual(model.parts.map(part => part.name), task.requiredParts);
  assert.deepEqual(parts.leftPlate.minMm, [-176.35, 0, 12.7]);
  assert.deepEqual(parts.rightPlate.maxMm, [176.35, 320, 162.7]);
  near(model.rearRollerYMm, 246.2);
  near(parts.rearRoller.minMm[1] - parts.frontRoller.maxMm[1], 100);
  near(parts.frontRoller.maxMm[0] - parts.frontRoller.minMm[0], 330);
  near(parts.frontShaft.maxMm[0] - parts.rightPlate.maxMm[0], 12.7);
  assert.equal(parts.leftPlate.holes.length, 5);
  assert.deepEqual(parts.leftPlate.holes.map(hole => hole.diameterMm), [12.9, 12.9, 6.6, 6.6, 12.9]);
  assert.equal(parts.frontRoller.innerDiameterMm, 12.7);
  assert.equal(parts.coralReference.nonBom, true);
  near(parts.coralReference.minMm[2], 0);
  near(parts.coralReference.maxMm[0] - parts.coralReference.minMm[0], 301.625);
});

test('revision updates plate offsets, roller lengths, shaft lengths, bores, crossmembers and clear gap', () => {
  const baseline = expectedModel(task);
  const revision = expectedModel(task, task.revision);
  assert.equal(validateExpected(revision, task), true);
  near(revision.parts[0].minMm[0], -186.35);
  near(revision.rearRollerYMm, 241.2);
  near(revision.parts[3].minMm[1] - revision.parts[2].maxMm[1], 95);
  near(revision.parts[0].holes[1].centerYZMm[0], 241.2);
  for (const name of ['frontRoller', 'rearRoller', 'frontShaft', 'rearShaft', 'frontCrossmember', 'rearCrossmember']) {
    const before = baseline.parts.find(part => part.name === name);
    const after = revision.parts.find(part => part.name === name);
    near((after.maxMm[0] - after.minMm[0]) - (before.maxMm[0] - before.minMm[0]), 20);
  }
  assert.deepEqual(revision.parts[8], baseline.parts[8]);
  assert.deepEqual(revision.featureParametersMm, { innerWidth: 360, rollerGap: 95, plateThickness: 6.35 });
});

test('plate thickness is editable independently and shaft extensions follow outside plate faces', () => {
  const model = expectedModel(task, { ...task.revision, plateThicknessMm: 8 });
  near(model.parts[0].minMm[0], -188);
  near(model.parts[4].maxMm[0], 200.7);
  near(model.parts[4].maxMm[0] - model.parts[1].maxMm[0], 12.7);
  assert.equal(validateExpected(model, task), true);
});

test('local validation detects holes leaving the plate or overlapping each other', () => {
  assert.throws(() => validateExpected(expectedModel(task, { rollerGapMm: 300 }), task), /plate edge/);
  assert.throws(() => validateExpected(expectedModel(task, { pivotCenterYZMm: [70, 65] }), task), /Overlapping/);
});

test('independent FeatureScript provides reusable parameters, stable roles, bores, non-BOM flag and unevaluated evidence', () => {
  const source = featureSource(task);
  assert.ok(source.startsWith('FeatureScript 3070;'));
  assert.equal((source.match(/isLength\(definition\./g) ?? []).length, 3);
  for (const role of task.requiredParts) assert.ok(source.includes(`id + "${role}"`));
  for (const token of ['definition.innerWidth', 'definition.rollerGap', 'definition.plateThickness',
    'BooleanOperationType.SUBTRACTION', 'PropertyType.EXCLUDE_FROM_BOM', 'officialIntakeEvidence',
    'evBox3d', 'evVolume', 'evSurfaceDefinition', 'GeometryType.CYLINDER', 'BodyType.SOLID']) {
    assert.ok(source.includes(token), token);
  }
  assert.ok(!/[^\x00-\x7f]/.test(source));
  assert.ok(!/[\t ]+$/m.test(source));
  assert.ok(!/\b(importForeign|deletePartStudio|tools\/call)\b/.test(source));
});

test('self-contained test is the first executable feature and covers both hardcoded phases with explicit defaults', () => {
  const source = dispatchSource(task);
  assert.match(source, /^FeatureScript 3070;\nimport\(path : "onshape\/std\/common.fs", version : "3070.0"\);/);
  assert.equal(source.match(/export const (\w+) = defineFeature/)[1], 'officialIntakeSelfTest');
  assert.match(source, /for \(var baseline in \[true, false\]\)/);
  assert.match(source, /"innerWidth" : \(baseline \? 340 : 360\) \* millimeter/);
  assert.match(source, /"rollerGap" : \(baseline \? 100 : 95\) \* millimeter/);
  assert.equal((source.match(/precondition \{\}/g) ?? []).length, 2);
  assert.equal((source.match(/}, \{\}\);/g) ?? []).length, 2);
  assert.match(source, /}, \{\s+"innerWidth" : 340 \* millimeter,\s+"rollerGap" : 100 \* millimeter,\s+"plateThickness" : 6.35 \* millimeter\s+}\);/);
  for (const token of ['TRANSIENT_SCRATCH_EVALUATION_NOT_PERSISTED', '"persisted" : false', '"evaluationTotalSolids" : 18',
    'officialIntakeAssert(context, phaseId, baseline)', 'through start', 'through end', 'cylindrical face count mismatch',
    'max(0.001, expectedPart.volumeMm3 * 0.00000001)', 'actualPart.solidCount != 1']) assert.ok(source.includes(token), token);
});

test('every phase asserts fixture-derived exact bounds, volumes and cylinder axes including five holes per plate', () => {
  for (const overrides of [{}, task.revision]) {
    const model = assertionModel(task, overrides);
    const expected = expectedModel(task, overrides);
    assert.equal(model.parts.length, 9);
    assert.deepEqual(model.parts.map(part => part.cylinders.length), [5, 5, 2, 2, 1, 1, 0, 0, 2]);
    model.parts.forEach((part, index) => {
      assert.deepEqual(part.minMm, expected.parts[index].minMm);
      assert.deepEqual(part.maxMm, expected.parts[index].maxMm);
      near(part.volumeMm3, expected.parts[index].volumeMm3);
    });
    assert.deepEqual(model.parts[0].cylinders.map(cylinder => cylinder.radiusMm), [6.45, 6.45, 3.3, 3.3, 6.45]);
    assert.deepEqual(model.parts[2].cylinders.map(cylinder => cylinder.radiusMm), [38.1, 6.35]);
  }
});

test('retained baseline and revision keep the same entry point and operation IDs with only a source-default switch', () => {
  const baseline = dispatchSource(task, 'retained');
  const revision = dispatchSource(task, 'retained', false);
  assert.equal(baseline.match(/export const (\w+) = defineFeature/)[1], 'officialIntakeRetained');
  assert.equal(revision, baseline.replace('const officialIntakeDefaultBaseline = true;', 'const officialIntakeDefaultBaseline = false;'));
  assert.match(baseline, /const intakeId = id \+ "intake";/);
  assert.match(baseline, /officialIntakeParameters\(officialIntakeDefaultBaseline\)/);
  assert.match(baseline, /REGENERATION_MEASUREMENTS_NOT_PERSISTENCE_READBACK/);
  assert.throws(() => dispatchSource(task, 'unapproved'), /Invalid source entry/);
});