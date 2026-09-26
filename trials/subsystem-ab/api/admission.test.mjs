import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { admit, loadPacket } from './admission.mjs';
import { assemblyGraph } from './graph.mjs';
import { assertBudget, planBudget } from './budget.mjs';

const packet = loadPacket(fileURLToPath(new URL('../shared/packet-v1/', import.meta.url)));

test('actual frozen diagnostic v1 is rejected even with a claimed parent approval', () => {
  assert.throws(() => admit(packet, { admitted: true, freezeSha256: packet.freezeHash }), /FROZEN_ADMITTED/);
});

test('budget rejects the explicit connector route before expensive creation', () => {
  const graph = assemblyGraph(packet, 'baseline');
  const separate = planBudget(graph);
  assert.equal(separate.phases.connectorFeatures, 88);
  assert.equal(separate.predictedRemainingAttempts, 220);
  assert.throws(() => assertBudget(separate), /BUDGET_CANNOT_COMPLETE/);
  const parametric = planBudget(graph, { parametricSourceConnectors: true });
  assert.equal(parametric.predictedRemainingAttempts, 132);
  assert.equal(parametric.headroom, 8);
  assert.doesNotThrow(() => assertBudget(parametric));
  assert.throws(() => assertBudget(planBudget(graph, { parametricSourceConnectors: true, spent: 10 })), /BUDGET_CANNOT_COMPLETE/);
  const resumed = planBudget(graph, { parametricSourceConnectors: true, spent: 14,
    completedByPhase: { pilotAndOwnership: 4, sourceUploadVersionInstantiation: 10 } });
  assert.equal(resumed.projectedTotal, 132);
});

test('COTS import growth is charged before document creation', () => {
  const graph = assemblyGraph(packet, 'baseline');
  assert.throws(() => assertBudget(planBudget(graph, { parametricSourceConnectors: true, cotsImports: 8 })), /BUDGET_CANNOT_COMPLETE/);
});

test('fresh allowance and truthful current-key acknowledgement precede asset loading', () => {
  const future = structuredClone(packet);
  future.freeze.apiBrowserAdmission = 'PASS';
  future.freeze.status = 'FROZEN_ADMITTED';
  future.freeze.blockers = [];
  const handoff = { schema: 'subsystem-ab-api-parent-handoff/1', admitted: true,
    freezeSha256: future.freezeHash, packetVersion: future.freeze.packetVersion };
  assert.throws(() => admit(future, handoff), /CURRENT_KEY_ACK/);
  Object.assign(handoff, { currentKeyAcknowledgement: 'CURRENT_KEY_AUTHORIZED_NOT_ROTATION_CLAIM',
    origin: 'https://cad.onshape.com', newPublicDocumentAuthorized: true, apiLedgerSoleOwner: true,
    allowance: { used: 1000, limit: 1500, observedAt: new Date().toISOString(), cycleEnd: '2099-01-01' } });
  assert.throws(() => admit(future, handoff), /500_RESERVE/);
});