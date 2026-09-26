import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pilotEvidence } from './preparation.mjs';
import { planV3Budget } from './budget.mjs';
import { fastenedGroups } from './graph.mjs';
import { loadSchema } from './schema.mjs';
import { main, parseArgs } from './run.mjs';

const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));

test('pilot HTTP success is not native grounding success', () => {
  const evidence = pilotEvidence(ledger);
  assert.equal(evidence.spent, ledger.attempts.length);
  assert.equal(evidence.remaining, 140 - ledger.attempts.length);
  assert.equal(evidence.pilot.ground.status, 'FAIL');
  assert.equal(evidence.pilot.ground.nativeStatus, 'ERROR');
  assert.equal(evidence.pilot.repair.attempts, ledger.attempts.filter(entry => entry.phase === 'nativePilotRepair').length);
  assert.equal(evidence.pilot.repair.resolvedGroundEndpoints, 1);
  assert.equal(evidence.pilot.revolute.status, 'PASS');
  assert.equal(evidence.pilot.motion.jsonType, 'Revolute');
  const result = ledger.attempts.find(entry => entry.key === 'pilot-motion-upper-limit-command').result;
  assert.equal(evidence.pilot.motion.returnedRadians, result.mateValues.find(value =>
    value.featureId === evidence.pilot.revolute.featureId).rotationZ);
  assert.equal(evidence.pilot.limits, 'UNVERIFIED');
  assert.equal(evidence.pilot.movingCarrier, 'UNVERIFIED');
  assert.deepEqual(evidence.originalFreezeAnchor, ledger.binding);
  assert.ok(evidence.evidence.every(item => /^[a-f0-9]{64}$/.test(item.resultSha256)));
  assert.ok(evidence.attempts.every(entry => !Object.hasOwn(entry, 'result')));
});

test('complete conditional route counts the existing 19 requests, all polls and three exports', () => {
  const counts = { instances: 48, revolutes: 12, relations: 5, cotsImportGroups: 1, rigidGroups: 13, motionScenarios: 8 };
  const plan = planV3Budget(counts, 19, { fastenedMode: 'nativeGroups' });
  assert.equal(plan.projectedTotal, 137);
  assert.equal(plan.headroom, 3);
  assert.equal(plan.rows.filter(row => row.kind === 'RESERVE').reduce((sum, row) => sum + row.count, 0), 15);
  assert.equal(plan.rows.filter(row => row.operation === 'createAssemblyExportStep').length, 3);
  assert.equal(plan.rows.find(row => row.operation === 'insertTransformedInstances').count, 1);
  assert.ok(plan.rows.findIndex(row => row.phase === 'baselineExport') < plan.rows.findIndex(row => row.phase === 'widthRevision'));
  assert.ok(plan.rows.findIndex(row => row.phase === 'revisionExport') < plan.rows.findIndex(row => row.phase === 'receiverProbe'));
  assert.ok(plan.rows.findIndex(row => row.phase === 'receiverRestore') < plan.rows.findIndex(row => row.phase === 'finalExport'));
  const schema = loadSchema();
  for (const row of plan.rows.filter(row => row.operation)) assert.ok(schema.operation(row.operation));
  assert.equal(planV3Budget(counts, 19).projectedTotal, 159);
  assert.equal(planV3Budget({ ...counts, cotsImportGroups: 5 }, 19).projectedTotal, 199);
  assert.equal(planV3Budget({ ...counts, instances: 60 }, 19, { fastenedMode: 'nativeGroups' }).projectedTotal, 137);
  assert.equal(planV3Budget(counts, 26, { fastenedMode: 'nativeGroups' }).status, 'BLOCKED');
  assert.equal(planV3Budget(counts, 23, { fastenedMode: 'nativeGroups', pilotReserve: 6 }).projectedTotal, 137);
  assert.equal(planV3Budget(counts, 23, { fastenedMode: 'nativeGroups' }).projectedTotal, 141);
});

test('native rigid groups preserve housing/shaft revolute boundaries and logical fastened coverage', () => {
  const graph = { instances: ['chassis', 'housing', 'shaft', 'pulley'].map(id => ({ id })), joints: [
    { id: 'mount', type: 'FASTENED', parent: 'chassis', child: 'housing' },
    { id: 'output', type: 'REVOLUTE', parent: 'housing', child: 'shaft' },
    { id: 'drive', type: 'FASTENED', parent: 'shaft', child: 'pulley' },
  ] };
  assert.deepEqual(fastenedGroups(graph).map(group => group.members), [['chassis', 'housing'], ['shaft', 'pulley']]);
  assert.deepEqual(fastenedGroups(graph).flatMap(group => group.logicalMates), ['mount', 'drive']);
  graph.joints.push({ id: 'invalid', type: 'FASTENED', parent: 'housing', child: 'shaft' });
  assert.throws(() => fastenedGroups(graph), /REVOLUTE_COLLAPSED/);
});

test('safe CLI never loads a packet, credentials, a sender or changes the live ledger', async () => {
  const before = readFileSync(new URL('./ledger.json', import.meta.url));
  const result = await main(['plan']);
  assert.equal(result.authenticatedRequestsThisInvocation, 0);
  assert.equal(result.credentialsLoaded, false);
  assert.equal(result.conditionalV3Route.projectedTotal, 137);
  assert.equal(result.nativeRecipe.motion.movementProven, false);
  assert.equal(result.frozenV3ReadThisInvocation, false);
  assert.throws(() => parseArgs(['source', '--live']), /V3_LIVE_EXECUTION_HELD/);
  assert.throws(() => parseArgs(['plan', '--packet=../shared/packet-v1']), /ONLY_API_LOCAL/);
  assert.deepEqual(readFileSync(new URL('./ledger.json', import.meta.url)), before);
});