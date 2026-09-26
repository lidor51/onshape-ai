import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { batchInstances, bindPreservedParts, nativeGroupFeature, relationFeature } from './native.mjs';
import { loadSchema } from './schema.mjs';

const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
const observed = key => ledger.attempts.find(entry => entry.key === key).result;
const schema = loadSchema();
const ids = { did: 'fixture', wid: 'fixture', wvm: 'w', wvmid: 'fixture', eid: 'fixture' };

test('multibody source binding preserves the rear cover and rejects dropped or extra bodies', () => {
  const group = { partRoles: ['housing', 'rearCover'], preservation: [{ partRole: 'housing', bodyIndex: 1 },
    { partRole: 'rearCover', bodyIndex: 2 }] };
  const specs = { housing: { nativeName: 'motor housing' }, rearCover: { nativeName: 'rear cover' } };
  const parts = [{ name: 'motor housing', elementId: 'fixture', partId: 'housing-id', bodyType: 'solid' },
    { name: 'rear cover', elementId: 'fixture', partId: 'cover-id', bodyType: 'solid' }];
  const bound = bindPreservedParts(parts, group, specs, 'fixture');
  assert.notEqual(bound.housing.partId, bound.rearCover.partId);
  assert.equal(bound.rearCover.preservation.bodyIndex, 2);
  assert.throws(() => bindPreservedParts(parts.slice(0, 1), group, specs, 'fixture'), /EVERY_IMPORTED_SOLID/);
  assert.throws(() => bindPreservedParts([...parts, parts[1]], group, specs, 'fixture'), /EVERY_IMPORTED_SOLID/);
});

test('documented bulk contract accepts 48+ instances in one request without ordering assumptions', () => {
  const transform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const graph = { instances: Array.from({ length: 60 }, (_, index) => ({ id: `instance-${index}`, part: 'housing', transform })) };
  const body = batchInstances(graph, { housing: { elementId: 'fixture', partId: 'real-observed-id' } }, 'fixture');
  assert.equal(body.transformGroups.length, 60);
  schema.request('insertTransformedInstances', ids, body);
});

test('native group candidate uses the observed spec and cached schema but is not live proof', () => {
  const body = nativeGroupFeature({ id: 'offline-rigid-group', members: ['first', 'second'] },
    { first: { id: 'fixture-first' }, second: { id: 'fixture-second' } },
    observed('pilot-native-base'), observed('pilot-native-specs'));
  schema.request('addFeature', ids, body);
  assert.equal(body.feature.parameters[0].parameterId, 'occurrencesQuery');
  assert.equal(ledger.attempts.some(entry => entry.result?.feature?.btType === 'BTMMateGroup-65'), false);
});

test('relation binding keeps both native mate references in the observed single ordered parameter', () => {
  const spec = observed('pilot-native-specs').featureSpecs.find(feature => feature.featureType === 'mateRelation');
  const recipe = { nativeType: 'GEAR_RELATION', outputPerInput: -1, carrier: 'moving-carrier', matePairParameterId: 'matesQuery',
    feature: { btType: 'BTMMateRelation-1412', featureType: 'mateRelation', name: 'offline-fixture-only', namespace: '',
      suppressed: false, parameters: spec.parameters.map(parameter => structuredClone(parameter.defaultValue)) } };
  const relation = { id: 'offline-relation', type: 'GEAR_RELATION', outputPerInput: -1, carrier: 'moving-carrier',
    driverMate: 'input', drivenMate: 'output' };
  const body = relationFeature(relation, recipe, { input: 'observed-input', output: 'observed-output' }, observed('pilot-native-base'));
  schema.request('addFeature', ids, body);
  assert.deepEqual(body.feature.parameters.find(parameter => parameter.parameterId === 'matesQuery').queries
    .map(query => query.featureId), ['observed-input', 'observed-output']);
  assert.equal(body.feature.parameters.some(parameter => parameter.parameterId === 'carrier'), false);
  assert.equal(ledger.attempts.some(entry => entry.result?.feature?.btType === 'BTMMateRelation-1412'), false);
});