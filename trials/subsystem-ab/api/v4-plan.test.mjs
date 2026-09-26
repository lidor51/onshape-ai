import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { main, forecastV4, readOnlyPlan } from './v4-plan.mjs';
import { originalPrefixSha256 } from './v4-native.mjs';
import { sha256 } from './ledger.mjs';

const ledgerUrl = new URL('./ledger.json', import.meta.url);
const bytesBefore = readFileSync(ledgerUrl);
const ledger = JSON.parse(bytesBefore);

test('offline plan preserves all 23 receipts, binding and closed repair without credentials or sender', () => {
  const priorFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('NETWORK_FORBIDDEN'); };
  try {
    const plan = main(['plan']);
    assert.equal(plan.ledger.spent, 23);
    assert.equal(plan.ledger.remaining, 117);
    assert.equal(plan.ledger.original23PrefixSha256, originalPrefixSha256);
    assert.equal(sha256(JSON.stringify(ledger.attempts)), originalPrefixSha256);
    assert.equal(plan.liveEnabled, false);
    assert.equal(plan.conditionalPilot.ceiling, 6);
    assert.equal(plan.conditionalPilot.maximumCumulativeAfterPilot, 29);
    assert.equal(plan.conditionalPilot.groundPayload, null);
    assert.equal(plan.conditionalPilot.separateUnapprovedFollowup.minimumAdditional, 7);
    assert.equal(plan.v4Catalog.projectedTotal, null);
    assert.equal(plan.lastSavedCadEvidence.groundFeatureStatus, 'ERROR');
    assert.throws(() => main(['pilot', '--live-approved']), /OFFLINE_ONLY/);
    assert.throws(() => main(['plan', '--write-plan']), /OFFLINE_ONLY/);
    assert.deepEqual(readFileSync(ledgerUrl), bytesBefore);
  } finally { globalThis.fetch = priorFetch; }
});

test('prefix rewrite, pending attempts and sibling catalog inputs fail closed', () => {
  const changed = structuredClone(ledger);
  changed.attempts[0].status = 'PENDING';
  assert.throws(() => readOnlyPlan(changed), /ORIGINAL_LEDGER_PREFIX/);
  const pending = structuredClone(ledger);
  pending.attempts.push({ sequence: 24, status: 'PENDING' });
  assert.throws(() => readOnlyPlan(pending), /PENDING_OR_HALTED/);
  pending.attempts[23].status = 'SUCCESS';
  assert.equal(readOnlyPlan(pending).conditionalPilot.unusedSlots, 5);
  assert.equal(readOnlyPlan(pending).conditionalPilot.maximumCumulativeAfterPilot, 29);
  const rebound = structuredClone(ledger);
  rebound.binding.packetHash = 'b'.repeat(64);
  assert.throws(() => readOnlyPlan(rebound), /ORIGINAL_LEDGER_PREFIX/);
  assert.throws(() => main(['check-catalog', '--catalog=trials/subsystem-ab/PROTOCOL.md']), /CATALOG_MUST_BE_IN_API_FOLDER/);
});

test('full forecast cannot turn unknown grounding or missing real counts into a 137-call claim', () => {
  const counts = { instances: 62, revolutes: 12, relations: 5, rigidGroups: 13, originalImportGroups: 1, generatedSourceGroups: 1 };
  const unpriced = forecastV4(counts, 23, { motionScenarios: 8 });
  assert.equal(unpriced.projectedTotal, null);
  assert.equal(unpriced.status, 'UNPRICED_NO_ADMISSION');
  assert.equal(unpriced.admission, false);
  const oneOriginal = forecastV4(counts, 23, { motionScenarios: 8, groundWriteCeiling: 1 });
  const fiveOriginals = forecastV4({ ...counts, originalImportGroups: 5 }, 23, { motionScenarios: 8, groundWriteCeiling: 1 });
  assert.equal(fiveOriginals.projectedTotal - oneOriginal.projectedTotal, 40);
  assert.equal(fiveOriginals.status, 'OVER_CAP');
  assert.equal(fiveOriginals.admission, false);
  assert.equal(fiveOriginals.rows.filter(row => row.operation === 'getTranslation').reduce((sum, row) => sum + row.count, 0), 16);
  assert.throws(() => forecastV4(counts, 23), /EXPLICIT_COUNTS/);
  assert.throws(() => forecastV4(counts, 23, { motionScenarios: 8, pilotCeiling: 10 }), /EXPLICIT_COUNTS/);
  assert.throws(() => forecastV4(counts, 24, { motionScenarios: 8, pilotCeiling: 6 }), /EXPLICIT_COUNTS/);
  assert.equal(forecastV4(counts, 29, { motionScenarios: 8 }).rows.find(row => row.phase === 'conditionalPilot').count, 0);
});