import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { root } from './generate.mjs';
import { sha256 } from './gate.mjs';
import { assertLocalArtifacts } from './preflight.mjs';

test('retained STEP and preview must match local oracle hashes and provenance', () => {
  const directory = mkdtempSync(join(root, '.artifact-test-'));
  const step = Buffer.from('stub STEP bytes, not geometry');
  const preview = Buffer.from('stub preview bytes');
  const report = { oracle: { evidenceOrigin: 'LOCAL_CADQUERY_NOT_ONSHAPE_EXPORT', localStepSha256: sha256(step), previewSha256: sha256(preview) } };
  try {
    writeFileSync(join(directory, 'local.step'), step);
    writeFileSync(join(directory, 'local-preview.svg'), preview);
    assert.doesNotThrow(() => assertLocalArtifacts(directory, report));
    for (const [name, original] of [['local.step', step], ['local-preview.svg', preview]]) {
      writeFileSync(join(directory, name), 'changed');
      assert.throws(() => assertLocalArtifacts(directory, report), /Stale local artifact/);
      writeFileSync(join(directory, name), original);
    }
    assert.throws(() => assertLocalArtifacts(directory, { oracle: { ...report.oracle, evidenceOrigin: 'ONSHAPE' } }), /provenance/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});