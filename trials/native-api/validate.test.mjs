import test from 'node:test';
import assert from 'node:assert/strict';
import { requirePrivate, featureResult, inspectPart, verifyFeatureList, bomExclusionProperty } from './validate.mjs';
import { circle, sketch } from './model.mjs';

test('observed all-BOM BOOL property is accepted only when editable and boolean', () => {
  const property = { name: 'Exclude from all BOMs', valueType: 'BOOL', editable: true, propertyId: 'observedProperty', value: false };
  assert.equal(bomExclusionProperty({ properties: [property] }), property);
  for (const override of [{ editable: false }, { valueType: 'STRING' }, { name: 'Unrelated property' }]) {
    assert.equal(bomExclusionProperty({ properties: [{ ...property, ...override }] }), undefined);
  }
});

test('private creation is fail-closed on absent flags, public response, or anonymous access', () => {
  requirePrivate({ public: false });
  for (const response of [{}, { isPublic: false }, { public: true }, { public: false, anonymousAccessAllowed: true }]) {
    assert.throws(() => requirePrivate(response), /PRIVATE_DOCUMENT_NOT_CONFIRMED/);
  }
});

test('feature failure, missing status, skew, and changed update ID are rejected', () => {
  const response = { featureState: { featureStatus: 'OK' }, feature: { featureId: 'nativeFeature1' } };
  assert.equal(featureResult(response, 'nativeFeature1'), 'nativeFeature1');
  for (const bad of [{}, { ...response, featureState: { featureStatus: 'ERROR' } }, { ...response, microversionSkew: true }]) {
    assert.throws(() => featureResult(bad));
  }
  assert.throws(() => featureResult(response, 'otherFeature'), /FEATURE_ID_CHANGED/);
});

test('synthetic cylinder proves through-bore extents; blind pocket and missing hole fail', () => {
  const part = { key: 'leftPlate', boundsMm: { low: [-176.35, 0, 12.7], high: [-170, 320, 162.7] }, holes: [{ centerYZMm: [70, 65], diameterMm: 12.9 }] };
  const box = { lowX: -0.17635, lowY: 0, lowZ: 0.0127, highX: -0.170, highY: 0.320, highZ: 0.1627 };
  const body = { type: 'SOLID', faces: [{ id: 'boreFace', area: Math.PI * 0.0129 * 0.00635, box: { minCorner: { x: -0.17635 }, maxCorner: { x: -0.170 } }, surface: { type: 'CYLINDER', radius: 0.00645, origin: { y: 0.070, z: 0.065 }, axis: { x: 1, y: 0, z: 0 } } }] };
  assert.equal(inspectPart(part, 'part1', box, body).holesMatch, true);
  assert.equal(inspectPart(part, 'part1', box, { type: 'SOLID', faces: [] }).holesMatch, false);
  body.faces[0].box.maxCorner.x = -0.172;
  assert.equal(inspectPart(part, 'part1', box, body).holesMatch, false);
  assert.throws(() => inspectPart(part, 'part1', {}, body), /BOUNDING_BOX_SCHEMA_UNSUPPORTED/);
});

test('circle readback accepts documented legacy spelling but rejects shifted geometry', () => {
  const feature = sketch('profile', [circle('circle', [70, 65], 38.1)]);
  const actual = structuredClone(feature);
  actual.featureId = 'sketch1';
  for (const key of ['xCenter', 'yCenter', 'xDir', 'yDir']) {
    actual.entities[0].geometry[key.toLowerCase()] = actual.entities[0].geometry[key];
    delete actual.entities[0].geometry[key];
  }
  const response = { features: [actual], featureStates: { sketch1: { featureStatus: 'OK' } } };
  const plan = { features: [{ key: 'profile', feature }] };
  assert.equal(verifyFeatureList(response, plan, { profile: 'sketch1' }).length, 1);
  actual.entities[0].geometry.xcenter = 0;
  assert.throws(() => verifyFeatureList(response, plan, { profile: 'sketch1' }), /SKETCH_GEOMETRY_MISMATCH/);
});