import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadBenchmark } from './benchmark.mjs';
import { makeManifest } from './manifests.mjs';

const specification = await loadBenchmark();
const details = JSON.parse(await readFile(new URL('./artifacts/endpoint-details.json', import.meta.url)));
const baseline = makeManifest(specification, details);
const revision = makeManifest(specification, details, true);

test('baseline requests only a new private document and exports outside the document', () => {
  const create = baseline.calls.find(call => call.arguments.endpoint === 'createDocument');
  assert.equal(JSON.parse(create.arguments.body).isPublic, false);
  assert.equal(baseline.calls.filter(call => call.arguments.endpoint === 'createDocument').length, 1);
  const step = baseline.calls.find(call => call.arguments.endpoint === 'createPartStudioExportStep');
  assert.equal(JSON.parse(step.arguments.body).storeInDocument, false);
  assert.ok(baseline.calls.every(call => call.method !== 'DELETE'));
});

test('revision updates the same feature and document without recreating either', () => {
  assert.ok(revision.calls.every(call => !['createDocument', 'createPartStudio', 'createFeatureStudio', 'addPartStudioFeature'].includes(call.arguments.endpoint)));
  const update = revision.calls.find(call => call.arguments.endpoint === 'updatePartStudioFeature');
  assert.equal(update.arguments.path_params.did, '$newDocument.id');
  assert.equal(update.arguments.path_params.fid, '$createdFeature.featureId');
  const body = JSON.parse(update.arguments.body);
  assert.equal(body.rejectMicroversionSkew, true);
  assert.deepEqual(body.feature.parameters.map(parameter => parameter.expression), ['360 mm', '95 mm']);
  assert.equal(baseline.sourceSha256, revision.sourceSha256);
});

test('manifest records uncertainty and includes image, export and measurement calls', () => {
  for (const plan of [baseline, revision]) {
    assert.equal(plan.executableLive, false);
    assert.ok(plan.calls.every(call => call.status === 'not-executed'));
    for (const endpoint of ['getPartStudioFeatures', 'getPartsWMV', 'getPartStudioBodyDetails', 'evalFeatureScript', 'getTranslation', 'downloadExternalData']) {
      assert.ok(plan.calls.some(call => call.arguments.endpoint === endpoint));
    }
    assert.ok(plan.calls.some(call => call.tool === 'onshape_screenshot'));
  }
});