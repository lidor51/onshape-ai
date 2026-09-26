import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Ledger, authorize, ROTATION_CONFIRMATION, CURRENT_KEY_ACKNOWLEDGMENT } from './safety.mjs';

export const options = { live: true, rotationConfirmation: ROTATION_CONFIRMATION,
  approvedOrigin: 'https://cad.onshape.com', newPublic: true, maxDocuments: 2,
  acceptUnvalidatedNativeCandidate: true, reserveNative: 120, reserveManufacturing: 80, reserveOfficial: 100,
  annualSafety: 500, annualLimit: 2500, annualUsed: 273, reservationSnapshot: '2026-09-11' };

test('explicit rotation, exact origin, public scope and shared reserve are mandatory', () => {
  authorize(options);
  for (const change of [{ live: false }, { rotationConfirmation: undefined }, { approvedOrigin: 'https://cad.onshape.com/' },
    { approvedOrigin: 'https://cad.onshape.com.attacker.test' }, { newPublic: false }, { maxDocuments: 3 },
    { annualUsed: 1900 }, { reserveManufacturing: 0 }, { reserveOfficial: 0 }, { acceptUnvalidatedNativeCandidate: false }]) {
    assert.throws(() => authorize({ ...options, ...change }));
  }
});

test('explicit current-key risk authorization is distinct from rotation and cannot imply it', () => {
  const current = { ...options, rotationConfirmation: undefined, currentKeyAcknowledgment: CURRENT_KEY_ACKNOWLEDGMENT };
  const authorization = authorize(current);
  assert.equal(authorization.rotationConfirmed, false);
  assert.equal(authorization.credentialAuthorization, 'CURRENT_KEY_RISK_ACKNOWLEDGED');
  assert.equal(authorize(options).rotationConfirmed, true);
  assert.throws(() => authorize({ ...current, currentKeyAcknowledgment: 'yes' }), /AUTHORIZATION_REQUIRED/);
  assert.throws(() => authorize({ ...current, rotationConfirmation: ROTATION_CONFIRMATION }), /CONFLICTING/);
  for (const change of [{ live: false }, { approvedOrigin: 'https://example.com' }, { newPublic: false }, { reserveOfficial: 0 }]) {
    assert.throws(() => authorize({ ...current, ...change }));
  }
});

test('attempt and document ceilings persist across restarts; a concurrent process cannot reset them', () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-ledger-', import.meta.url)));
  const authorization = authorize(options);
  let ledger;
  try {
    ledger = new Ledger(directory, authorization, 'source');
    assert.throws(() => new Ledger(directory, authorization, 'source'), /LOCKED/);
    for (let index = 0; index < 2; index++) {
      const sequence = ledger.attempt('setup', 'create', true); ledger.outcome(sequence, 200, 1);
    }
    ledger.close();
    ledger = new Ledger(directory, authorization, 'source');
    assert.equal(ledger.summary().attempted, 2);
    assert.throws(() => ledger.attempt('copy', 'copy', true), /DOCUMENT_LIMIT/);
    for (let index = 2; index < 120; index++) {
      const sequence = ledger.attempt('validation', 'read'); ledger.outcome(sequence, 200, 1);
    }
    assert.throws(() => ledger.attempt('validation', 'read'), /ATTEMPT_LIMIT/);
  } finally { ledger?.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('an interrupted attempt cannot replay after restart and phase replay is forbidden', () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-ledger-', import.meta.url)));
  const authorization = authorize(options);
  let ledger;
  try {
    ledger = new Ledger(directory, authorization, 'source');
    ledger.startPhase('setup');
    assert.throws(() => ledger.startPhase('setup'), /NO_REPLAY/);
    ledger.attempt('setup', 'createDocument', true);
    ledger.close();
    assert.throws(() => new Ledger(directory, authorization, 'source'), /RECONCILIATION/);
  } finally { ledger?.close(); rmSync(directory, { recursive: true, force: true }); }
});