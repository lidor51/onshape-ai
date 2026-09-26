import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { expectations } from './geometry.mjs';

const read = name => readFile(new URL(name, import.meta.url), 'utf8');

test('stored baseline and revision are analytic contracts for the same current source', async () => {
  const benchmark = JSON.parse(await read('../../benchmark/intake.json'));
  const sourceHash = createHash('sha256').update(await read('./intake.fs')).digest('hex');
  for (const variant of ['baseline', 'revision']) {
    const artifact = JSON.parse(await read(`./artifacts/${variant}.json`));
    assert.equal(artifact.sourceSha256, sourceHash);
    assert.equal(artifact.compilation, 'NOT_RUN');
    assert.deepEqual(artifact.parts, expectations(benchmark, variant).parts);
    assert.match(artifact.evidence, /not compiled or measured in Onshape/);
    assert.equal(artifact.featureCallTemplate.feature.parameters.length, 2);
  }
});

test('implemented API contracts are grounded in the pinned public schema, not live verification', async () => {
  const research = JSON.parse(await read('./artifacts/api-research.json'));
  const client = await read('./client.mjs');
  const runner = await read('./deploy.mjs');
  assert.ok(research.servers.some(server => server.url === 'https://cad.onshape.com/api/v17'));
  assert.match(client, /\/api\/v17/);
  assert.ok(research.schemas.BTDocumentParams.isPublic);
  assert.ok(research.schemas['BTFeatureStudioContents-2239'].contents);
  assert.ok(research.schemas['BTFeatureSpec-129'].namespace);
  assert.ok(research.operations.some(operation => operation.id === 'createPartStudioExportStep'));
  assert.match(runner, /pixelSize=0/);
  assert.match(await read('./artifacts/upstream-license.txt'), /MIT License/);
});