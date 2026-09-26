import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Ledger, authorize, CURRENT_KEY_ACKNOWLEDGMENT } from './safety.mjs';

const authorization = authorize({ live: true, currentKeyAcknowledgment: CURRENT_KEY_ACKNOWLEDGMENT,
  approvedOrigin: 'https://cad.onshape.com', newPublic: true, maxDocuments: 2, acceptUnvalidatedNativeCandidate: true,
  reserveNative: 120, reserveManufacturing: 80, reserveOfficial: 100, annualSafety: 500, annualLimit: 2500,
  annualUsed: 273, reservationSnapshot: '2026-09-11' });

test('owned read interruption resumes after reconciliation without resetting calls or replaying creation', () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-recovery-', import.meta.url)));
  let ledger;
  try {
    ledger = new Ledger(directory, authorization, 'old');
    ledger.startPhase('setup');
    const sequence = ledger.attempt('setup', 'createDocument', true);
    ledger.outcome(sequence, 200, 1);
    ledger.record({ kind: 'document', role: 'template', did: 'a'.repeat(24), wid: 'b'.repeat(24), creationSequence: sequence });
    ledger.attempt('setup', 'getDocument');
    ledger.close();
    ledger = new Ledger(directory, authorization, 'new', true);
    assert.equal(ledger.summary().attempted, 2);
    assert.equal(ledger.summary().interruptedReads, 1);
    assert.throws(() => ledger.attempt('setup', 'addPartStudioFeature'), /RECONCILIATION/);
    const read = ledger.attempt('setup', 'getDocument');
    ledger.outcome(read, 200, 1);
    ledger.record({ kind: 'visibility', role: 'template', isPublic: true });
    ledger.reconcileOwned('template', 'checked-prefix');
    ledger.startPhase('setup');
    assert.equal(ledger.summary().documentSlots, 1);
    const write = ledger.attempt('setup', 'addPartStudioFeature');
    ledger.close();
    assert.throws(() => new Ledger(directory, authorization, 'new', true), /UNKNOWN_WRITE/);
    assert.equal(write, 4);
  } finally { ledger?.close(); rmSync(directory, { recursive: true, force: true }); }
});