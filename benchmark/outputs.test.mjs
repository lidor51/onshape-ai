import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('curated CAD results retain source hashes and baseline/revision exports', async () => {
  const root = new URL('../', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('outputs/manifest.json', root), 'utf8'));
  assert.deepEqual(manifest.routes.map(route => route.id), ['native-api', 'featurescript', 'mcp-jarvis']);
  for (const route of manifest.routes) {
    assert.equal(route.solids, 9);
    for (const stage of ['baseline', 'revision']) {
      assert.ok(route.files.some(file => file.path.includes(stage) && file.path.endsWith('.png')));
      assert.ok(route.files.some(file => file.path.includes(stage) && /\.(step|zip)$/.test(file.path)));
    }
    for (const file of route.files) {
      assert.ok(file.path.startsWith(`outputs/${route.id}/`) && !file.path.includes('..'));
      const bytes = await readFile(new URL(file.path, root));
      assert.equal(bytes.length, file.bytes, file.path);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
      if (file.path.endsWith('.png')) assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      if (file.path.endsWith('.zip')) assert.equal(bytes.subarray(0, 4).toString('hex'), '504b0304');
      if (file.path.endsWith('.step')) {
        const text = bytes.toString('utf8');
        assert.match(text, /ISO-10303-21;/);
        assert.match(text, /END-ISO-10303-21;/);
        assert.equal([...text.matchAll(/MANIFOLD_SOLID_BREP\s*\(/g)].length, 9);
      }
    }
  }
});