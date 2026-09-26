import test from 'node:test';
import assert from 'node:assert/strict';
import { stages } from './native.mjs';
import { measure } from './model.mjs';
import { inspectNative, rebind, preserved, verifyGeometry } from './verify.mjs';

export function fakeSnapshot(candidate, prefix = 'server') {
  const map = Object.fromEntries(candidate.features.map((feature, index) => [feature.featureId, `${prefix}-${index}`]));
  return { features: rebind(candidate.features, map), defaultFeatures: [{ name: 'Right', featureId: 'Right' }, { name: 'Origin', featureId: 'Origin' }],
    sourceMicroversion: 'a'.repeat(24), libraryVersion: 3000, serializationVersion: 'test-only', isComplete: true,
    featureStates: Object.fromEntries(Object.values(map).map(featureId => [featureId, { featureStatus: 'OK' }])) };
}

export function fakeGeometry(candidate) {
  const expected = measure(candidate);
  const body = { id: 'FAKE-part', type: 'SOLID', faces: [], edges: [] };
  for (const [index, hole] of expected.holes.entries()) {
    const edges = expected.boundsMm.low.slice(0, 1).concat(expected.boundsMm.high.slice(0, 1)).map((faceX, side) => ({
      id: `edge-${index}-${side}`, curve: { type: 'CIRCLE', origin: { x: faceX / 1000, y: hole.center[0] / 1000, z: hole.center[1] / 1000 } },
      geometry: { length: Math.PI * hole.diameter / 1000 } }));
    body.edges.push(...edges);
    body.faces.push({ surface: { type: 'CYLINDER', origin: { x: 0, y: hole.center[0] / 1000, z: hole.center[1] / 1000 },
      direction: { x: 1, y: 0, z: 0 } }, area: Math.PI * hole.diameter * candidate.plateThickness / 1e6,
      loops: edges.map(edge => ({ coedges: [{ edgeId: edge.id }] })) });
  }
  return { bodies: { bodies: [body] }, boxes: Object.fromEntries(['low', 'high'].flatMap(side =>
    ['X', 'Y', 'Z'].map((axis, index) => [`${side}${axis}`, expected.boundsMm[side][index] / 1000]))),
    mass: { bodies: { '-all-': { volume: [expected.volumeMm3 / 1e9, expected.volumeMm3 / 1e9, expected.volumeMm3 / 1e9] } } } };
}

test('server-adapter contract rebinds copied IDs and inspects actual driving constraint expressions', () => {
  const candidate = stages().baseline;
  const snapshot = fakeSnapshot(candidate, 'copied');
  assert.equal(inspectNative(candidate, snapshot).map['plate-extrude'].startsWith('copied-'), true);
  snapshot.features.find(feature => feature.constraints).constraints[9].parameters.find(parameter => parameter.expression).expression = 'wrong';
  assert.throws(() => inspectNative(candidate, snapshot), /DIMENSION/);
});

test('adapter fixtures are not CAD evidence: rejects blind holes, missing schemas and bad volume', () => {
  const candidate = stages().revision.parameters;
  const fixture = fakeGeometry(candidate);
  assert.equal(verifyGeometry(fixture.bodies, fixture.boxes, fixture.mass, candidate).holes.length, 6);
  const broken = structuredClone(fixture);
  broken.bodies.bodies[0].edges.pop();
  assert.throws(() => verifyGeometry(broken.bodies, broken.boxes, broken.mass, candidate), /THROUGH_HOLE/);
  assert.throws(() => verifyGeometry({}, fixture.boxes, fixture.mass, candidate), /UNVERIFIED/);
  fixture.mass.bodies['-all-'].volume = [1, 1, 1];
  assert.throws(() => verifyGeometry(fixture.bodies, fixture.boxes, fixture.mass, candidate), /VOLUME/);
});

test('unrelated definitions must survive readback, including opaque native editor fields', () => {
  const bundle = stages();
  const before = { features: [...bundle.snapshot.features, { featureId: 'unrelated', opaque: { keep: true } }] };
  const after = { features: [...bundle.revision.features, { featureId: 'unrelated', opaque: { keep: true } }] };
  preserved(before, after, bundle.patch.changes);
  after.features.at(-1).opaque.keep = false;
  assert.throws(() => preserved(before, after, bundle.patch.changes), /UNRELATED/);
});