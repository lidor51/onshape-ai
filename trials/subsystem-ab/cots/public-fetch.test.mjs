import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateUrl } from './public-fetch.mjs';

test('continuation preserves the original fourteen records and adds at most 25 attempts', () => {
  const ledger = JSON.parse(readFileSync(new URL('./public-fetch-log.json', import.meta.url)));
  const original = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url))).source_evidence.slice(0, 14);
  assert.deepEqual(ledger.requests.slice(0, 14), original);
  assert.equal(ledger.limit, 39);
  assert.equal(ledger.continuation_authorization.additional_attempt_limit, 25);
  assert.ok(ledger.requests.length <= 39);
  assert.equal(ledger.authenticated_calls, 0);
});

test('fresh Google sheet content hosts are allowed but host spoofing and auth are not', () => {
  assert.ok(validateUrl('https://doc-01-abc-sheets.googleusercontent.com/pub/example'));
  for (const url of ['https://docs.google.com/private', 'https://accounts.google.com/',
    'https://doc-01-sheets.googleusercontent.com.evil.test/pub/example',
    'https://user:secret@wcproducts.com/products/kraken', 'https://cad.onshape.com/']) {
    assert.throws(() => validateUrl(url));
  }
});