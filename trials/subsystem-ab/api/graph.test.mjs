import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assemblyGraph, errorBetween, identity, multiply, toSI, translation } from './graph.mjs';
import { loadSchema } from './schema.mjs';

const read = path => JSON.parse(readFileSync(new URL(`../shared/packet-v1/${path}`, import.meta.url), 'utf8'));
export const packet = { contract: read('assembly-contract.json'), geometry: read('source/geometry-payload.json'), expected: read('expected.json') };

test('actual v1 graph has 45 parts, 44 mates, 9 revolutes and 5 relations in both variants', () => {
  for (const variant of ['baseline', 'revision']) {
    const graph = assemblyGraph(packet, variant);
    assert.equal(graph.instances.length, 45);
    assert.equal(graph.joints.length, 44);
    assert.equal(graph.joints.filter(joint => joint.type === 'REVOLUTE').length, 9);
    assert.equal(graph.relations.length, 5);
    assert.equal(graph.instances.filter(instance => instance.sourceKind === 'COTS_BINDING_REQUIRED').length, 20);
    assert.ok(graph.joints.every(joint => joint.connectors.length === 2));
  }
});

test('absolute row-major SI conversion removes source grid in the rotated frame', () => {
  const rotation = [[0, -1, 0, 20], [1, 0, 0, 30], [0, 0, 1, 40], [0, 0, 0, 1]];
  assert.deepEqual(toSI(multiply(rotation, translation([-1000, -2000, 0]))),
    [0, -1, 0, 2.02, 1, 0, 0, -0.97, 0, 0, 1, 0.04, 0, 0, 0, 1]);
  assert.deepEqual(toSI(identity()), identity().flat());
  assert.throws(() => toSI([[1, 0, 0, 0], [0, 2, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]), /RIGID/);
});

test('+20 width revision preserves receiver and pivot frames with stable graph role IDs', () => {
  const baseline = assemblyGraph(packet, 'baseline');
  const revision = assemblyGraph(packet, 'revision');
  assert.equal(packet.expected.revision.controls.mouthWidth - packet.expected.baseline.controls.mouthWidth, 20);
  assert.equal(packet.expected.revision.controls.receiverHeight, packet.expected.baseline.controls.receiverHeight);
  assert.deepEqual(baseline.instances.map(instance => instance.id), revision.instances.map(instance => instance.id));
  for (const id of ['mate_receiver', 'mate_pickup_left']) {
    assert.equal(errorBetween(baseline.joints.find(joint => joint.id === id).worldJointFrameRowMajorMm,
      revision.joints.find(joint => joint.id === id).worldJointFrameRowMajorMm), 0);
  }
});

test('official v17 batch schema accepts transformGroups and rejects invented instances list', () => {
  const schema = loadSchema();
  const variables = { did: 'fixtureDocument', wid: 'fixtureWorkspace', eid: 'fixtureAssembly' };
  const body = { transformGroups: [{ instances: [{ documentId: variables.did, elementId: 'fixturePartStudio',
    partId: 'fixturePart', includePartTypes: ['PARTS'] }], transform: toSI(identity()) }] };
  assert.equal(schema.request('insertTransformedInstances', variables, body).method, 'POST');
  assert.throws(() => schema.request('insertTransformedInstances', variables, { instances: [] }), /SCHEMA_FIELD/);
  assert.throws(() => schema.request('addFeature', variables, { type: 1406, message: {} }), /SCHEMA_FIELD|MISSING/);
});