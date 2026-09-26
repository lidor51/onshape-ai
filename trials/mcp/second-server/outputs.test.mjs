import test from 'node:test';
import assert from 'node:assert/strict';
import { payloadKind } from './outputs.mjs';

test('identifies export bytes independent of filenames and rejects error pages', () => {
  assert.equal(payloadKind(Buffer.from('504b0304', 'hex')), 'zip');
  assert.equal(payloadKind(Buffer.from('ISO-10303-21;\nHEADER;')), 'step');
  assert.throws(() => payloadKind(Buffer.from('<html>error</html>')));
});