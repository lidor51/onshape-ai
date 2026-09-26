import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { deployWorkflow } from './deploy.mjs';
import { ownBenchmark } from './resume.mjs';

test('observed namespace links custom feature without a separate custom import; resume does not repeat mutations', async () => {
  const directory = new URL('./runs/2026-09-11T12-37-01-358Z-f2ee3f15-b4f1-4480-b848-7c847ae17f55/', import.meta.url);
  const load = async name => JSON.parse(await readFile(new URL(name, directory), 'utf8'));
  const progress = await load('summary.json');
  const features = await load('baseline-features.json');
  const source = await readFile(new URL('./intake.fs', import.meta.url), 'utf8');
  const calls = [];
  const client = { request: async (method, path) => {
    calls.push({ method, path });
    assert.equal(method, 'GET', 'No successful mutation may be repeated');
    if (path.startsWith('/parts/')) throw new Error('PART_VALIDATION_REACHED');
    if (path.endsWith('/features')) return features;
    if (path.endsWith('/featurespecs')) return load('version-feature-specs.json');
    return load('source-readback.json');
  } };
  await assert.rejects(deployWorkflow(client, await ownBenchmark(), source, async () => {}, progress, 'live-public'), /PART_VALIDATION_REACHED/);
  assert.equal(progress.linkEvidence.featureId, features.features[0].featureId);
  assert.equal(progress.linkEvidence.namespace, progress.namespace);
  assert.ok(calls.every(call => call.method === 'GET'));
});