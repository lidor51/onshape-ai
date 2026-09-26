import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assemblyGraph } from './graph.mjs';
import { loadSchema } from './schema.mjs';
import { batchInstances, bindInstances, bindParts, customRoles, mateFeature, multipartImport, relationFeature, sourceFeature } from './native.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../shared/packet-v1/${name}`, import.meta.url), 'utf8'));
const packet = { contract: read('assembly-contract.json'), geometry: read('source/geometry-payload.json'), expected: read('expected.json') };
const graph = assemblyGraph(packet, 'baseline');
const schema = loadSchema();
const ids = { did: '0123456789abcdef01234567', wid: '1123456789abcdef01234567', eid: '2123456789abcdef01234567', wvm: 'w', wvmid: '1123456789abcdef01234567' };
const snapshot = { sourceMicroversion: '3123456789abcdef01234567', serializationVersion: 'fixture', libraryVersion: 3070 };

test('documented batch supports all 45 mapped instances without guessed server IDs', () => {
  const parts = Object.fromEntries(Object.keys(packet.contract.parts).map(role => [role, { elementId: ids.eid, partId: role }]));
  const body = batchInstances(graph, parts, ids.did);
  schema.request('insertTransformedInstances', ids, body);
  assert.equal(body.transformGroups.length, 45);
  assert.ok(body.transformGroups.every(group => !('versionId' in group.instances[0])));
  const definition = { rootAssembly: { instances: graph.instances.map(instance => ({ id: `fixture-${instance.id}`,
    name: instance.id, documentId: ids.did, elementId: ids.eid, partId: instance.part, suppressed: false })),
    occurrences: graph.instances.map(instance => ({ path: [`fixture-${instance.id}`], transform: instance.transform })) } };
  assert.equal(Object.keys(bindInstances(graph, parts, definition, ids.did)).length, 45);
  definition.rootAssembly.occurrences.reverse();
  assert.equal(Object.keys(bindInstances(graph, parts, definition, ids.did)).length, 45);
});

test('bodyType is the documented solid string, and no COTS envelope is treated as custom', () => {
  assert.equal(customRoles(packet).length, 21);
  assert.deepEqual(bindParts([{ name: 'frame', bodyType: 'solid', partId: 'JHD', elementId: ids.eid }],
    [{ role: 'frame', name: 'frame' }], ids.eid).frame.partId, 'JHD');
  assert.throws(() => bindParts([{ name: 'frame', bodyType: 'PART', partId: 'JHD', elementId: ids.eid }],
    [{ role: 'frame', name: 'frame' }], ids.eid), /OBSERVED_SOLID/);
});

test('real fastened and continuous revolute payloads validate; finite limits need a verified recipe', () => {
  const instances = Object.fromEntries(graph.instances.map(instance => [instance.id, { id: `fixture-${instance.id}` }]));
  const connectors = { parent: { featureId: 'fixture-parent', location: 'partStudio' }, child: { featureId: 'fixture-child', location: 'partStudio' } };
  for (const joint of graph.joints.filter(joint => joint.limitsDeg === null)) schema.request('addFeature', ids,
    mateFeature(joint, instances, connectors, snapshot));
  const deployment = graph.joints.find(joint => joint.limitsDeg !== null);
  assert.throws(() => mateFeature(deployment, instances, connectors, snapshot), /VERIFIED_LIMIT/);
  assert.throws(() => relationFeature(graph.relations[0], null, {}, snapshot), /VERIFIED_RELATION/);
});

test('source edit is exactly +20 width with persistent feature identity and envelopes disabled', () => {
  const baseline = sourceFeature('fixture-owned-namespace', packet.contract.parameters.baseline, snapshot);
  schema.request('addPartStudioFeature', ids, baseline);
  baseline.feature.featureId = 'fixture-feature';
  const revision = sourceFeature('fixture-owned-namespace', packet.contract.parameters.revision, snapshot, baseline.feature);
  schema.request('updatePartStudioFeature', { ...ids, fid: baseline.feature.featureId }, revision);
  assert.equal(revision.feature.featureId, baseline.feature.featureId);
  assert.equal(revision.feature.parameters[0].expression, '520 mm');
  assert.equal(revision.feature.parameters[1].expression, '320 mm');
  assert.equal(revision.feature.parameters[2].value, false);
});

test('multipart import roundtrip preserves binary bytes and a stable boundary without extra documents', async () => {
  const bytes = Buffer.from([0, 1, 255, 13, 10, 128, 42]);
  const upload = multipartImport(bytes, 'approved.step', 'mm', schema);
  const form = await new Response(upload.body, { headers: { 'content-type': upload.contentType } }).formData();
  assert.deepEqual(Buffer.from(await form.get('file').arrayBuffer()), bytes);
  assert.equal(form.get('importWithinDocument'), 'true');
  assert.equal(form.get('onePartPerDoc'), 'false');
  assert.equal(form.get('splitAssembliesIntoMultipleDocuments'), 'false');
  assert.equal(upload.contentType, multipartImport(bytes, 'approved.step', 'mm', schema).contentType);
});