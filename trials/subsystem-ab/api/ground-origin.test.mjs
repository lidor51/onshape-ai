import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
const schema = JSON.parse(readFileSync(new URL('./schema/openapi-v17.json', import.meta.url), 'utf8'));
const result = key => ledger.attempts.find(entry => entry.key === key)?.result;

test('the 23 historical API receipts remain unchanged', () => {
  const receipts = ledger.attempts.slice(0, 23);
  assert.equal(receipts.length, 23);
  assert.equal(createHash('sha256').update(JSON.stringify(receipts)).digest('hex'),
    'a4d100c6f3c983770fbdf0f1c6f00e81fb02ebb0a15e0573307f01220083e8ea');
});

test('native connector spec admits assembly origin but supplies no root query or owner parameter', () => {
  const connector = result('pilot-native-specs').featureSpecs.find(spec => spec.featureType === 'mateConnector');
  const parameter = parameterId => connector.parameters.find(item => item.parameterId === parameterId);
  const filterContainsOrigin = filter => filter?.featureType === 'assemblyOrigin' ||
    Object.values(filter ?? {}).some(value => value && typeof value === 'object' && filterContainsOrigin(value));
  assert.deepEqual(parameter('originType').options, ['ON_ENTITY', 'BETWEEN_ENTITIES']);
  assert.ok(filterContainsOrigin(parameter('originQuery').filter));
  assert.deepEqual(parameter('originQuery').defaultValue.queries, []);
  assert.deepEqual(parameter('secondaryAxisType').options, ['PLUS_X', 'PLUS_Y', 'MINUS_X', 'MINUS_Y']);
  assert.equal(parameter('flipPrimary').defaultValue.value, false);
  for (const unsupported of ['owner', 'ownerPart', 'requireOwnerPart', 'coordSystem',
    'primaryAxisAlignment', 'secondaryAxisOrientation'])
    assert.equal(parameter(unsupported), undefined, `Unobserved connector parameter: ${unsupported}`);
});

test('examined saved controllers do not bind an origin and both ground attempts remain errors', () => {
  for (const key of ['pilot-native-base', 'pilot-repair-ground-controller']) {
    assert.equal(result(key).features.length, 0, 'Saved controller content changed');
    assert.equal(Object.hasOwn(result(key), 'defaultFeatures'), false);
  }
  for (const key of ['pilot-ground', 'pilot-repair-ground-update'])
    assert.equal(result(key).featureState.featureStatus, 'ERROR');
});

test('mate-value acceptance can ignore motion and the saved nonzero command returned zero', () => {
  const operation = schema.paths['/assemblies/d/{did}/w/{wid}/e/{eid}/matevalues'].post;
  assert.equal(operation.operationId, 'updateMateValues');
  assert.match(operation.description, /degrees of freedom; otherwise, the input mate value will be ignored/);
  const motion = ledger.checkpoints['pilot-motion-command'];
  assert.ok(motion.requestedRadians > motion.upperLimitRadians);
  assert.equal(motion.responseValue, 0);
});