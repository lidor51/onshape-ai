import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildPlan, revisionChanges } from './model.mjs';
import { main } from './run.mjs';

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('generated offline artifacts reproduce the normative benchmark and twelve ID-preserving updates', async () => {
  const spec = await readJson('../../benchmark/intake.json');
  const baseline = await readJson('artifacts/baseline.json');
  const revision = await readJson('artifacts/revision.json');
  const changes = await readJson('artifacts/revision-updates.json');
  assert.deepEqual(baseline, buildPlan(spec));
  assert.deepEqual(revision, buildPlan(spec, 'revision'));
  assert.deepEqual(changes.updates.map(entry => entry.key), revisionChanges(baseline, revision).map(entry => entry.key));
  for (const entry of changes.updates) assert.equal(entry.body.feature.featureId, `$feature:${entry.key}`);
});

test('public evidence confirms privacy flag asymmetry and inherited feature cursor fields', async () => {
  const sources = await readJson('artifacts/public-sources.json');
  assert.ok(sources.sources.every(source => source.status === 200 && /^[a-f0-9]{64}$/.test(source.sha256)));
  assert.equal(sources.schemaFields.BTDocumentParams.fields.isPublic.type, 'boolean');
  assert.equal(sources.schemaFields.BTDocumentInfo.fields.public.type, 'boolean');
  for (const field of ['sourceMicroversion', 'serializationVersion', 'libraryVersion']) {
    assert.ok(sources.schemaFields['BTFeatureApiBase-1430'].fields[field]);
  }
});

test('default runner is offline even when a fetch implementation is available', async context => {
  let requests = 0;
  context.mock.method(globalThis, 'fetch', async () => { requests++; throw new Error('Offline runner attempted network access'); });
  await main([]);
  assert.equal(requests, 0);
});