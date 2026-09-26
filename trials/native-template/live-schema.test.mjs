import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { stages } from './native.mjs';
import { requireFeatureSpecs } from './workflow.mjs';
import { verifyGeometry } from './verify.mjs';

test('native variable visible length and internal value stay synchronized through handoff and revision', () => {
  const bundle = stages();
  for (const stage of ['baseline', 'simulatededitor', 'revision']) {
    for (const feature of bundle[stage].features.filter(item => item.featureType === 'assignVariable')) {
      const parameter = name => feature.parameters.find(item => item.parameterId === name);
      assert.equal(parameter('lengthValue').expression, parameter('value').expression);
      assert.equal(parameter('mode').value, 'ASSIGNED');
    }
  }
  assert.equal(bundle.baseline.features.find(item => item.featureType === 'cPlane').parameters[0].parameterId, 'cplaneType');
});

const sampled = new URL('./live/native-feature-specs.json', import.meta.url);
test('candidate matches actual native feature specs fetched from the owned template', { skip: !existsSync(sampled) }, () => {
  const specs = JSON.parse(readFileSync(sampled, 'utf8'));
  requireFeatureSpecs(specs, stages().baseline);
  const bad = stages().baseline;
  bad.features.find(feature => feature.featureType === 'cPlane').parameters[0].parameterId = 'planeType';
  assert.throws(() => requireFeatureSpecs(specs, bad), /PARAMETER_SPEC/);
});

const geometrySample = new URL('./live/setup-geometry-response.json', import.meta.url);
test('actual baseline B-rep uses cylinder axis and proves five through-holes and exact volume', { skip: !existsSync(geometrySample) }, () => {
  const actual = JSON.parse(readFileSync(geometrySample, 'utf8'));
  const verified = verifyGeometry(actual.bodies, actual.bounds, actual.mass, stages().baseline.parameters);
  assert.equal(verified.holes.length, 5);
  assert.ok(Math.abs(verified.volumeMm3 - 301875.70934676356) < 0.01);
  delete actual.bodies.bodies.find(body => body.type === 'SOLID').faces.find(face => face.surface.type === 'CYLINDER').surface.axis;
  assert.throws(() => verifyGeometry(actual.bodies, actual.bounds, actual.mass, stages().baseline.parameters), /HOLE_POSITION/);
});