import assert from 'node:assert/strict';
import test from 'node:test';
import { assertBrowserAdmission } from './admission.mjs';

test('published policy blocker prevents even a stub browser with explicit public authorization', () => {
  let actions = 0;
  assert.throws(() => {
    assertBrowserAdmission({ executionAuthorized: true, newPublicDocumentConfirmed: true });
    actions++;
  }, /Browser BLOCKED/);
  assert.equal(actions, 0);
});

test('missing public confirmation cannot authorize a document', () => {
  assert.throws(() => assertBrowserAdmission({ executionAuthorized: true }), /NEW PUBLIC/);
});

test('missing live authorization cannot be inferred from a session', () => {
  assert.throws(() => assertBrowserAdmission({ newPublicDocumentConfirmed: true }), /authorization/);
});