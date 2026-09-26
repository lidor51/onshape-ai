import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('follow-up outputs retain original hashes and distinguish live from local evidence', async () => {
  const manifest = JSON.parse(await readFile(new URL('outputs/followup-manifest.json', root), 'utf8'));
  assert.equal(manifest.networkRequests, 0);
  assert.deepEqual(manifest.routes.map(route => route.id), ['official-mcp', 'native-template', 'manufacturing-package', 'local-preflight']);
  assert.match(manifest.routes[0].evidence, /REST_VERIFICATION/);
  assert.match(manifest.routes[2].evidence, /NOT_FOR_MANUFACTURE/);
  assert.match(manifest.routes[3].evidence, /BROWSER_BLOCKED_NOT_ONSHAPE_EXPORT/);
  for (const route of manifest.routes) {
    for (const file of route.files) {
      assert.ok(file.path.startsWith(`outputs/${route.id}/`) && !file.path.includes('..'));
      const bytes = await readFile(new URL(file.path, root));
      assert.equal(bytes.length, file.bytes, file.path);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
      if (file.path.endsWith('.png')) assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      if (file.path.endsWith('.zip')) assert.equal(bytes.subarray(0, 4).toString('hex'), '504b0304');
      if (file.path.endsWith('.pdf')) assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
      if (file.path.endsWith('.step')) {
        assert.match(bytes.toString(), /ISO-10303-21;/);
        assert.match(bytes.toString(), /END-ISO-10303-21;/);
      }
    }
  }
});

test('curated live results include same-feature official revision and native edit preservation', async () => {
  const load = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
  const baseline = await load('outputs/official-mcp/baseline-report.json');
  const revision = await load('outputs/official-mcp/revision-report.json');
  assert.equal(baseline.status, 'PASS_BASELINE');
  assert.equal(revision.status, 'PASS_REVISION');
  assert.equal(baseline.before.featureId, revision.before.featureId);
  assert.equal(revision.validation.partCount, 9);
  const native = await load('outputs/native-template/summary.json');
  assert.equal(native.status, 'LIVE_COMPLETE');
  assert.equal(native.revisionSuccessfulCalls, 6);
  assert.equal(native.originalTemplateUnchanged, true);
  assert.equal(native.preservation.status, 'PASS');
});