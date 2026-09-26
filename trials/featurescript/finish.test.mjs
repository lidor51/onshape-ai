import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ensureRevision, verifyFeature } from './finish.mjs';
import { ownBenchmark } from './resume.mjs';
import { revisionCall } from './deploy.mjs';
import { expectations } from './geometry.mjs';
import { validateMeasurements } from './validate.mjs';

const directory = new URL('./runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/', import.meta.url);
const load = async name => JSON.parse(await readFile(new URL(name, directory), 'utf8'));
const progress = JSON.parse(await readFile(new URL('./runs/2026-09-11T12-37-01-358Z-f2ee3f15-b4f1-4480-b848-7c847ae17f55/summary.json', import.meta.url), 'utf8'));

test('real baseline response decodes and verifies nine solids and every required through cylinder', async () => {
  const benchmark = await ownBenchmark();
  verifyFeature(await load('baseline-features.json'), progress, benchmark, 'baseline');
  const validation = validateMeasurements(await load('baseline-measurements-raw.json'), expectations(benchmark));
  assert.equal(validation.solidCount, 9);
  assert.ok(Math.abs(validation.clearRollerGapMm - 100) < 1e-9);
});

test('revision updates only parameters on the same ID and never repeats an already applied update', async () => {
  const benchmark = await ownBenchmark();
  const features = await load('baseline-features.json');
  const calls = [];
  const client = { request: async (method, path, body) => {
    calls.push({ method, path, body });
    return { feature: body.feature, featureState: { featureStatus: 'OK' } };
  } };
  await ensureRevision(client, '/synthetic-own-studio', progress, benchmark, features, async () => {});
  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, `/synthetic-own-studio/features/featureid/${progress.featureId}`);
  assert.equal(calls[0].body.rejectMicroversionSkew, true);
  assert.equal(calls[0].body.feature.featureId, features.features[0].featureId);
  const revision = structuredClone(features);
  revision.features[0] = revisionCall(features.features[0], benchmark, progress.namespace).feature;
  await ensureRevision(client, '/synthetic-own-studio', progress, benchmark, revision, async () => {});
  assert.equal(calls.length, 1);
  const unrelated = structuredClone(features);
  unrelated.features[0].parameters[0].expression = '370 mm';
  await assert.rejects(ensureRevision(client, '/synthetic-own-studio', progress, benchmark, unrelated, async () => {}));
  assert.equal(calls.length, 1);
});