import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyEvidence } from './evidence.mjs';

test('saved live baseline and revision have measured geometry, owned identity and intact MCP artifacts', async () => {
  const evidence = await verifyEvidence();
  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.publicDocumentsCreated, 1);
  assert.equal(evidence.translations.length, 2);
  assert.equal(evidence.phases.baseline.innerWidthMm, 340);
  assert.equal(evidence.phases.revision.innerWidthMm, 360);
});