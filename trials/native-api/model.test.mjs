import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { circle, sketch, extrude, buildPlan, bindFeature, revisionChanges, rectangle } from './model.mjs';

const spec = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));

test('native circle/extrude payload uses metres for geometry and returned sketch ID', () => {
  const profile = sketch('frontRoller profile', [circle('outer', [70, 65], 38.1)]);
  assert.equal(profile.btType, 'BTMSketch-151');
  assert.equal(profile.featureType, 'newSketch');
  assert.deepEqual(profile.entities[0].geometry, {
    btType: 'BTCurveGeometryCircle-115', xCenter: 0.07, yCenter: 0.065,
    radius: 0.0381, xDir: 1, yDir: 0, clockwise: false,
  });
  const solid = extrude('frontRoller', 'returnedSketchId', 330);
  assert.equal(solid.featureType, 'extrude');
  assert.equal(solid.parameters.find(parameter => parameter.parameterId === 'entities').queries[0].featureId, 'returnedSketchId');
  assert.equal(solid.parameters.find(parameter => parameter.parameterId === 'depth').expression, '330 mm');
});

test('baseline and revision meet benchmark dimensions without changing feature topology', () => {
  const baseline = buildPlan(spec);
  const revision = buildPlan(spec, 'revision');
  assert.equal(baseline.predicted.solidCount, 9);
  assert.equal(baseline.features.length, 18);
  assert.equal(baseline.predicted.rearRollerYMm, 246.2);
  assert.equal(revision.predicted.rearRollerYMm, 241.2);
  assert.equal(baseline.predicted.rollerLengthMm, 330);
  assert.equal(revision.predicted.rollerLengthMm, 350);
  assert.equal(baseline.predicted.shaftLengthMm, 378.1);
  assert.equal(revision.predicted.shaftLengthMm, 398.1);
  assert.deepEqual(baseline.predicted.parts[0].boundsMm.low, [-176.35, 0, 12.7]);
  assert.deepEqual(revision.predicted.parts[1].boundsMm.high, [186.35, 320, 162.7]);
  for (const plan of [baseline, revision]) {
    assert.deepEqual(plan.predicted.parts.map(part => part.holes.length), [5, 5, 1, 1, 0, 0, 0, 0, 1]);
    assert.equal(plan.predicted.parts.filter(part => part.nonBom).length, 1);
    assert.match(plan.predicted.parts[8].name, /NON-BOM/);
    assert.ok(plan.predicted.parts.every(part => part.expectedVolumeMm3 > 0));
    for (const entry of plan.features.filter(entry => entry.feature.featureType === 'extrude')) {
      const parameters = Object.fromEntries(entry.feature.parameters.map(parameter => [parameter.parameterId, parameter]));
      assert.equal(parameters.operationType.value, 'NEW');
      assert.match(parameters.entities.queries[0].queryString, /, true\);$/);
      assert.equal(parameters.startOffsetBound.enumName, 'StartOffsetType');
    }
  }
  assert.deepEqual(baseline.features.map(entry => entry.key), revision.features.map(entry => entry.key));
  assert.equal(revisionChanges(baseline, revision).length, 12);
  assert.ok(revisionChanges(baseline, revision).every(entry => !entry.key.startsWith('coralReference')));
});

test('rectangle segments close and retain unit directions in metres', () => {
  const edges = rectangle([0, 12.7], [320, 162.7]);
  edges.forEach((edge, index) => {
    const next = edges[(index + 1) % edges.length].geometry;
    const geometry = edge.geometry;
    assert.ok(Math.abs(Math.hypot(geometry.dirX, geometry.dirY) - 1) < 1e-12);
    assert.ok(Math.abs(geometry.pntX + geometry.dirX * edge.endParam - next.pntX) < 1e-12);
    assert.ok(Math.abs(geometry.pntY + geometry.dirY * edge.endParam - next.pntY) < 1e-12);
  });
});

test('feature bindings reject unresolved or injected IDs and preserve inputs', () => {
  const feature = buildPlan(spec).features[1].feature;
  assert.throws(() => bindFeature(feature, {}), /Missing or unsafe/);
  assert.throws(() => bindFeature(feature, { 'leftPlate.profile': 'bad"query' }), /Missing or unsafe/);
  const bound = bindFeature(feature, { 'leftPlate.profile': 'serverSketch123' });
  assert.ok(JSON.stringify(bound).includes('serverSketch123'));
  assert.ok(!JSON.stringify(bound).includes('$feature:'));
  assert.ok(JSON.stringify(feature).includes('$feature:'));
});