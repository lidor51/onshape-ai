import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPacket } from './admission.mjs';
import { Ledger } from './ledger.mjs';
import { loadSchema } from './schema.mjs';
import { createTransport, ORIGIN } from './transport.mjs';
import { OwnedApi } from './owned-api.mjs';
import { main, offlinePlan, parseArgs } from './run.mjs';
import { assertNativeRecipe, source } from './workflow.mjs';

const packet = loadPacket(fileURLToPath(new URL('../shared/packet-v1/', import.meta.url)));
const ids = { did: '0123456789abcdef01234567', wid: '1123456789abcdef01234567', part: '2123456789abcdef01234567',
  assembly: '3123456789abcdef01234567', source: '4123456789abcdef01234567', version: '5123456789abcdef01234567' };
const schema = loadSchema();
function fixture(context, responder) {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-workflow-', import.meta.url)));
  const path = join(directory, 'ledger.json');
  writeFileSync(path, JSON.stringify({ schema: 'subsystem-ab-api-ledger/1', limit: 140, binding: null, attempts: [], halt: null }));
  const ledger = new Ledger(path, { packetHash: packet.freezeHash, origin: ORIGIN });
  context.after(() => { ledger.close(); rmSync(directory, { force: true, recursive: true }); });
  const send = createTransport({ ledger, credentials: { accessKey: 'offlineAccessKey', secretKey: 'offlineSecretKey' },
    fetchImpl: async (url, request) => Response.json(responder(ledger.data.attempts.at(-1).operation,
      request.body ? JSON.parse(request.body) : undefined, url)) });
  return new OwnedApi({ schema, ledger, send, packet });
}
function setupResponse(operation) {
  if (operation === 'createDocument') return { id: ids.did, defaultWorkspace: { id: ids.wid } };
  if (operation === 'getDocument') return { id: ids.did, public: true };
  if (operation === 'getElementsInDocument') return [{ id: ids.part, elementType: 'PARTSTUDIO' }, { id: ids.assembly, elementType: 'ASSEMBLY' }];
  throw new Error(`Unexpected fixture operation ${operation}`);
}

test('offline CLI reads no credentials and makes no authenticated requests', async () => {
  const never = () => { assert.fail('Offline command touched a live dependency'); };
  const result = await main(['plan'], { credentialProvider: never, fetchImpl: never });
  assert.equal(result.status, 'BLOCKED_NATIVE_PILOT_AND_FROZEN_V3_REQUIRED');
  assert.equal(result.authenticatedRequestsThisInvocation, 0);
  const emptyLedgerPlan = offlinePlan(packet, { limit: 140, attempts: [] });
  assert.equal(emptyLedgerPlan.conditionalV3Route.projectedTotal, 118);
  assert.equal(result.conditionalV3Route.projectedTotal,
    result.conditionalV3Route.spent + result.conditionalV3Route.predictedRemainingAttempts);
  assert.equal(result.fullModelUploadAllowed, false);
});

test('live v1 fails before credentials, sender, or any attempt', async () => {
  const before = readFileSync(new URL('./ledger.json', import.meta.url), 'utf8');
  const never = () => assert.fail('Rejected packet reached a live dependency');
  await assert.rejects(main(['pilot', '--live', '--ack-current-key', '--confirm-one-public-document',
    '--handoff=trials/subsystem-ab/shared/packet-v1/freeze.json'], { credentialProvider: never, fetchImpl: never }), /V3_LIVE_EXECUTION_HELD/);
  assert.equal(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'), before);
  assert.throws(() => parseArgs(['pilot', '--live']), /V3_LIVE_EXECUTION_HELD/);
  assert.throws(() => parseArgs(['plan', '--packet=trials/subsystem-ab/browser']), /ONLY_API_LOCAL/);
});

test('only one new public document, fresh confirmed visibility and no copies, sharing or deletion', async context => {
  const api = fixture(context, setupResponse);
  await api.initialize(true);
  assert.equal(api.ledger.data.attempts.length, 3);
  for (const operation of ['copyWorkspace', 'deleteFeature', 'deleteDocument', 'shareDocument'])
    await assert.rejects(api.call('forbidden', 'pilot', operation), /NOT_AUTHORIZED/);
  await assert.rejects(api.call('wrong', 'pilot', 'getDocument', { did: 'aaaaaaaaaaaaaaaaaaaaaaaa' }), /UNOWNED_DOCUMENT/);
  api.visibilityConfirmed = false;
  await assert.rejects(api.call('early', 'source', 'getFeatures', { ...api.owned(), eid: ids.assembly }), /FRESH_PUBLIC/);
  await api.initialize(false);
  assert.equal(api.ledger.data.attempts.filter(entry => entry.operation === 'createDocument').length, 1);
  assert.equal(api.ledger.data.attempts.filter(entry => entry.operation === 'getDocument').length, 2);
});

test('public creation flag is not a visibility confirmation', async context => {
  const api = fixture(context, operation => operation === 'getDocument' ? { id: ids.did, public: false } : setupResponse(operation));
  await assert.rejects(api.initialize(true), /PUBLIC_VISIBILITY_NOT_CONFIRMED/);
  assert.equal(api.ledger.data.attempts.length, 2);
  assert.equal(api.visibilityConfirmed, false);
});

test('unverified v1 connector/ground/relations recipe cannot reach native creation', () => {
  assert.throws(() => assertNativeRecipe({ schema: 'subsystem-ab-native-recipe/1', freezeSha256: packet.freezeHash,
    parametricSourceConnectors: true }, packet, { attempts: [] }), /PARAMETRIC_CONNECTOR_RECIPE/);
});

test('complete source sequence uses official v17 bodies, ten source calls and safe POST replay', async context => {
  let uploaded = false;
  const snapshot = { sourceMicroversion: '6123456789abcdef01234567', libraryVersion: 3070, serializationVersion: 'fixture' };
  const api = fixture(context, (operation, body) => {
    if (['createDocument', 'getDocument', 'getElementsInDocument'].includes(operation)) return setupResponse(operation);
    if (operation === 'createFeatureStudio') return { id: ids.source };
    if (operation === 'getFeatureStudioContents') return { ...snapshot, contents: uploaded ? packet.source : '' };
    if (operation === 'updateFeatureStudioContents') { uploaded = true; return snapshot; }
    if (operation === 'getFeatureStudioSpecs') return { featureSpecs: [{ featureType: 'conceptAShared', namespace: 'owned-fixture-namespace' }] };
    if (operation === 'createVersion') return { id: ids.version };
    if (operation === 'getPartStudioFeatures') return { ...snapshot, features: [], featureStates: {} };
    if (operation === 'getFeatures') return { ...snapshot, features: [], featureStates: {} };
    if (operation === 'getFeatureSpecs') return { featureSpecs: [] };
    if (operation === 'addPartStudioFeature') return { ...snapshot, feature: { ...body.feature, featureId: 'fixture-source-feature' }, featureState: { featureStatus: 'OK' } };
    if (operation === 'getPartsWMVE') return Object.values(packet.contract.parts).filter(part => ['custom', 'reference'].includes(part.category))
      .filter(part => part.id !== 'coral_reference').map(part => ({ name: part.id, bodyType: 'solid', elementId: ids.part, partId: part.id }));
    assert.fail(`Unexpected source operation: ${operation}`);
  });
  const result = await source(api);
  assert.equal(result.featureId, 'fixture-source-feature');
  assert.equal(api.ledger.data.attempts.filter(entry => entry.phase === 'sourceUploadVersionInstantiation').length, 10);
  const posts = api.ledger.data.attempts.filter(entry => entry.method === 'POST').length;
  await source(api);
  assert.equal(api.ledger.data.attempts.filter(entry => entry.method === 'POST').length, posts);
});