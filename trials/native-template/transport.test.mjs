import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stages } from './native.mjs';
import { preflight } from './preflight.mjs';
import { createLiveTransport } from './transport.mjs';
import { ROTATION_CONFIRMATION } from './safety.mjs';

const binding = { sourceHash: 'fixture-source', testHash: 'fixture-tests' };
const tests = { ...binding, status: 'PASS' };
const bundle = stages();
const options = { live: true, rotationConfirmation: ROTATION_CONFIRMATION, approvedOrigin: 'https://cad.onshape.com',
  newPublic: true, maxDocuments: 2, acceptUnvalidatedNativeCandidate: true, reserveNative: 120,
  reserveManufacturing: 80, reserveOfficial: 100, annualSafety: 500, annualLimit: 2500, annualUsed: 273, reservationSnapshot: '2026-09-11' };
const report = preflight(bundle, tests, binding);

test('failed preflight and missing rotation never load credentials or invoke transport', () => {
  let loads = 0;
  let calls = 0;
  const common = { bundle, tests, binding, directory: 'unused', credentialProvider: () => { loads++; },
    fetchFn: () => { calls++; } };
  assert.throws(() => createLiveTransport({ ...common, options, report: { ...report, patchHash: 'tampered' } }));
  assert.throws(() => createLiveTransport({ ...common, report, options: { ...options, rotationConfirmation: undefined } }), /AUTHORIZATION/);
  assert.equal(loads, 0);
  assert.equal(calls, 0);
});

test('redirects count once, halt, never forward secrets and never replay', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-transport-', import.meta.url)));
  let calls = 0;
  const session = createLiveTransport({ options, report, bundle, tests, directory, binding,
    credentialProvider: () => ({ accessKey: 'FAKE-ACCESS', secretKey: 'FAKE-SECRET' }),
    fetchFn: async (url, request) => {
      calls++;
      assert.equal(url, 'https://cad.onshape.com/api/v17/documents');
      assert.equal(request.redirect, 'manual');
      assert.ok(request.headers.Authorization.startsWith('On FAKE-ACCESS:HmacSHA256:'));
      return new Response(null, { status: 307, headers: { Location: 'https://unapproved.example' } });
    } });
  try {
    await assert.rejects(session.request('setup', 'createDocument', 'template', { isPublic: true, name: 'Native template synthetic left plate' }), /REDIRECT/);
    assert.equal(session.ledger.summary().successful, 1);
    await assert.rejects(session.request('validation', 'getDocument', 'copy'), /UNOWNED/);
    await assert.rejects(session.request('setup', 'deleteDocument', 'template'), /SCOPE/);
    assert.equal(calls, 1);
    const persisted = readFileSync(session.ledger.path, 'utf8');
    assert.ok(!persisted.includes('FAKE-') && !persisted.includes('Authorization'));
  } finally { session.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('unknown POST outcome stays blocked across process restarts without replay', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-transport-', import.meta.url)));
  const config = { options, report, bundle, tests, directory, binding,
    credentialProvider: () => ({ accessKey: 'FAKE', secretKey: 'FAKE' }),
    fetchFn: async () => { throw new Error('secret-bearing raw failure must not escape'); } };
  const session = createLiveTransport(config);
  try {
    await assert.rejects(session.request('setup', 'createDocument', 'template', { isPublic: true, name: 'Native template synthetic left plate' }), /^Error: UNKNOWN_OUTCOME$/);
    assert.equal(session.ledger.summary().unknown, 1);
    session.close();
    assert.throws(() => createLiveTransport(config), /RECONCILIATION/);
  } finally { session.ledger.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('current document response public field is verified before any modeling request', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-transport-', import.meta.url)));
  const documentId = 'a'.repeat(24);
  const responses = [{ id: documentId, defaultWorkspace: { id: 'b'.repeat(24) } }, { id: documentId, public: true }];
  let calls = 0;
  const session = createLiveTransport({ options, report, bundle, tests, directory, binding,
    credentialProvider: () => ({ accessKey: 'FAKE', secretKey: 'FAKE' }),
    fetchFn: async () => { calls++; return Response.json(responses.shift()); } });
  try {
    await session.request('setup', 'createDocument', 'template', { name: 'Native template synthetic left plate', isPublic: true });
    await assert.rejects(session.request('setup', 'getElementsInDocument', 'template'), /VISIBILITY/);
    assert.equal(calls, 1);
    await session.request('setup', 'getDocument', 'template');
    assert.ok(session.ledger.events.some(event => event.kind === 'visibility'));
    assert.equal(calls, 2);
  } finally { session.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('an unreadable 2xx body records both HTTP success and unknown outcome', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-transport-', import.meta.url)));
  const session = createLiveTransport({ options, report, bundle, tests, directory, binding,
    credentialProvider: () => ({ accessKey: 'FAKE', secretKey: 'FAKE' }),
    fetchFn: async () => new Response('not JSON', { status: 200 }) });
  try {
    await assert.rejects(session.request('setup', 'createDocument', 'template', { name: 'Native template synthetic left plate', isPublic: true }), /UNKNOWN/);
    assert.equal(session.ledger.summary().successful, 1);
    assert.equal(session.ledger.summary().unknown, 1);
  } finally { session.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('observed mutation zero-library sentinel retains the guarded request library, not a guessed version', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-transport-', import.meta.url)));
  const session = createLiveTransport({ options, report, bundle, tests, directory, binding,
    credentialProvider: () => ({ accessKey: 'FAKE', secretKey: 'FAKE' }),
    fetchFn: async () => Response.json({ sourceMicroversion: 'c'.repeat(24), libraryVersion: 0, serializationVersion: '1.2.21',
      feature: { featureId: 'observed' }, featureState: { featureStatus: 'OK' } }) });
  try {
    session.ledger.record({ kind: 'document', role: 'template', did: 'a'.repeat(24), wid: 'b'.repeat(24) });
    session.ledger.record({ kind: 'visibility', role: 'template', isPublic: true });
    session.ledger.record({ kind: 'element', role: 'template', eid: 'd'.repeat(24) });
    const response = await session.request('setup', 'addPartStudioFeature', 'template', { feature: bundle.baseline.features[0],
      sourceMicroversion: 'e'.repeat(24), libraryVersion: 3070, serializationVersion: '1.2.21', rejectMicroversionSkew: true });
    assert.equal(response.libraryVersion, 3070);
    assert.equal(response.sourceMicroversion, 'c'.repeat(24));
    const saved = JSON.parse(readFileSync(`${directory}/response-001-addPartStudioFeature.json`, 'utf8'));
    assert.equal(saved.libraryVersion, 0);
  } finally { session.close(); rmSync(directory, { recursive: true, force: true }); }
});