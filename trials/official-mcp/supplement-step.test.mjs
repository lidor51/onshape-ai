import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { ROLES } from './supplement-policy.mjs';
import { stepMembers, saveStepExport } from './supplement-step.mjs';

test('actual downloaded archive contains exactly nine valid original STEP members with correct CRCs', async () => {
  const archive = await readFile(new URL('./artifacts/readonly-supplement/baseline-10-download.step', import.meta.url));
  const members = stepMembers(archive);
  assert.deepEqual(members.map(member => member.role).sort(), [...ROLES].sort());
  assert.ok(members.every(member => member.data.includes(Buffer.from('MANIFOLD_SOLID_BREP'))));
  const saved = new Map();
  const result = await saveStepExport('baseline', archive, async (file, bytes) => {
    saved.set(file, bytes);
    return { file, bytes: bytes.length };
  });
  assert.equal(result.format, 'ZIP_OF_NINE_STEP_FILES');
  assert.equal(result.members.length, 9);
  assert.ok(saved.get(result.file).equals(archive));
  assert.equal(saved.size, 10);
  const damaged = Buffer.from(archive);
  damaged[100] ^= 1;
  assert.throws(() => stepMembers(damaged));
  assert.throws(() => stepMembers(archive.subarray(0, -22)), /DIRECTORY_INVALID/);
});