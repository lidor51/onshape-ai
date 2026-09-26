import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { versionCall } from './deploy.mjs';
import { ownBenchmark } from './resume.mjs';
import { expectations } from './geometry.mjs';

test('resume reconstructs both geometry contracts entirely from own saved artifacts', async () => {
  const benchmark = await ownBenchmark();
  for (const variant of ['baseline', 'revision']) {
    const saved = JSON.parse(await readFile(new URL(`./artifacts/${variant}.json`, import.meta.url), 'utf8'));
    const actual = expectations(benchmark, variant);
    assert.deepEqual(actual.parameters, saved.parameters);
    for (const part of actual.parts) {
      const expected = saved.parts.find(item => item.name === part.name);
      for (const bound of ['min', 'max']) for (const axis of [0, 1, 2]) {
        assert.ok(Math.abs(part.boundsMm[bound][axis] - expected.boundsMm[bound][axis]) < 1e-9);
      }
      assert.ok(Math.abs(part.volumeMm3 - expected.volumeMm3) < 1e-7);
      assert.deepEqual(part.holes, expected.holes);
    }
  }
});

test('version creation includes schema document and server microversion identifiers', async () => {
  const directory = new URL('./runs/2026-09-11T12-20-18-317Z-2bba9339-7d84-4098-960e-15c495b4d10e/', import.meta.url);
  const summary = JSON.parse(await readFile(new URL('summary.json', directory), 'utf8'));
  const readback = JSON.parse(await readFile(new URL('source-readback.json', directory), 'utf8'));
  const schema = JSON.parse(await readFile(new URL('./artifacts/api-research.json', import.meta.url), 'utf8'));
  const payload = versionCall(summary.documentId, summary.workspaceId, readback);
  assert.equal(payload.documentId, summary.documentId);
  assert.equal(payload.workspaceId, summary.workspaceId);
  assert.equal(payload.microversionId, readback.sourceMicroversion);
  assert.equal(payload.publishVersion, false);
  for (const key of Object.keys(payload)) assert.ok(key in schema.schemas.BTVersionOrWorkspaceParams, key);
  assert.throws(() => versionCall(summary.documentId, summary.workspaceId, {}));
  assert.throws(() => versionCall('other-document', summary.workspaceId, readback));
});