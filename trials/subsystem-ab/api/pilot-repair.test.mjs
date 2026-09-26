import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadSchema } from './schema.mjs';
import { groundLookupQuery, observedGround, repairScope } from './pilot-repair.mjs';

test('targeted controller readback is supported but an absent controller is never invented', () => {
  const schema = loadSchema();
  const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
  const snapshot = ledger.attempts.find(entry => entry.key === 'pilot-native-base').result;
  assert.throws(() => observedGround(snapshot), /ACTUAL_GROUND_NOT_OBSERVED/);
  const request = schema.request('getFeatures', { did: 'owned', wvm: 'w', wvmid: 'owned', eid: 'assembly' },
    undefined, groundLookupQuery);
  assert.ok(request.path.endsWith('?featureId=actualGround'));
  assert.equal(ledger.attempts[13].result.featureState.featureStatus, 'ERROR');
});

test('repair scope preserves the original 19 receipts and cumulative 29 ceiling', () => {
  const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
  const scope = repairScope(ledger);
  assert.equal(scope.ceiling, 29);
  assert.equal(scope.productionAuthorized, false);
  ledger.checkpoints ??= {};
  ledger.checkpoints['pilot-repair-authorization'] = scope;
  ledger.attempts[13].result.featureState.featureStatus = 'OK';
  assert.throws(() => repairScope(ledger), /REPAIR_PREFIX_CHECKPOINT_REQUIRED/);
});