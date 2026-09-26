import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import { Ledger, readLedger } from './ledger.mjs';
import { createTransport, ORIGIN } from './transport.mjs';
import { multipartImport } from './native.mjs';
import { loadSchema } from './schema.mjs';
import { signRequest } from '../../native-api/transport.mjs';

const binding = { packetHash: 'synthetic-test-only', origin: ORIGIN };
const credentials = { accessKey: 'offlineAccessKey', secretKey: 'offlineSecretKey' };
const request = { key: 'pilot', phase: 'pilot', operation: 'fixture', method: 'GET', path: '/api/v17/users/sessioninfo' };
function fixture(context) {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-', import.meta.url)));
  const path = join(directory, 'ledger.json');
  writeFileSync(path, JSON.stringify({ schema: 'subsystem-ab-api-ledger/1', limit: 140, binding: null, attempts: [], halt: null }));
  const ledger = new Ledger(path, binding);
  context.after(() => { ledger.close(); rmSync(directory, { recursive: true, force: true }); });
  return { ledger, path };
}

test('HMAC, exact origin, pre-send persistence and safe replay use no network', async context => {
  const { ledger, path } = fixture(context);
  let calls = 0;
  const send = createTransport({ ledger, credentials, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(readLedger(path).attempts[0].status, 'PENDING');
    assert.equal(url, `${ORIGIN}${request.path}`);
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers.Authorization, signRequest({ method: 'GET', url,
      nonce: options.headers['On-Nonce'], date: options.headers.Date, contentType: 'application/json', ...credentials }));
    return Response.json({ id: 'fixture-user' });
  } });
  assert.deepEqual(await send(request), { id: 'fixture-user' });
  assert.deepEqual(await send(request), { id: 'fixture-user' });
  await assert.rejects(send({ ...request, path: 'https://other.onshape.com/api/v17/documents' }), /REQUEST_SCOPE/);
  await assert.rejects(send({ ...request, path: '/api/v17/../documents' }), /REQUEST_SCOPE/);
  assert.equal(calls, 1);
  assert.ok(!readFileSync(path, 'utf8').includes(credentials.accessKey));
});

test('persistent shared 140 cap survives reopen and has one writer', context => {
  const { ledger, path } = fixture(context);
  assert.throws(() => new Ledger(path, binding));
  for (let index = 0; index < 140; index++) {
    const sequence = ledger.begin({ ...request, key: `read-${index}`, requestHash: 'fixture' });
    ledger.finish(sequence, { httpStatus: 200, elapsedMs: 0, result: {} });
  }
  ledger.close();
  const resumed = new Ledger(path, binding);
  try { assert.throws(() => resumed.begin({ ...request, key: 'over-cap' }), /ATTEMPT_CAP_140/); }
  finally { resumed.close(); }
});

test('uncertain POST occupies document slot and blocks restart', async context => {
  const { ledger, path } = fixture(context);
  const send = createTransport({ ledger, credentials, fetchImpl: async () => { throw new Error('network fixture'); } });
  await assert.rejects(send({ ...request, method: 'POST', createsDocument: true }), /UNKNOWN_OUTCOME/);
  ledger.close();
  const resumed = new Ledger(path, binding);
  try { assert.throws(() => resumed.begin({ ...request, key: 'retry' }), /LEDGER_HALTED_OR_PENDING/); }
  finally { resumed.close(); }
  assert.equal(readLedger(path).attempts.length, 1);
});

test('redirects are counted once and never followed', async context => {
  const { ledger } = fixture(context);
  const send = createTransport({ ledger, credentials, fetchImpl: async () => new Response(null,
    { status: 307, headers: { location: 'https://other.onshape.com/' } }) });
  await assert.rejects(send(request), /REDIRECT_REFUSED/);
  assert.equal(ledger.data.attempts.length, 1);
});

test('a rejected secret-bearing response is not persisted', async context => {
  const { ledger, path } = fixture(context);
  const send = createTransport({ ledger, credentials, fetchImpl: async () => Response.json({ contents: credentials.secretKey }) });
  await assert.rejects(send(request), /SECRET_BEARING_RESPONSE/);
  assert.ok(!readFileSync(path, 'utf8').includes(credentials.secretKey));
});

test('binary multipart wire bytes and boundary Content-Type are included in the documented HMAC request', async context => {
  const { ledger } = fixture(context);
  const upload = multipartImport(Buffer.from([0, 255, 13, 10, 128]), 'fixture.step', 'mm', loadSchema());
  const path = '/api/v17/translations/d/fixture/w/fixture';
  const send = createTransport({ ledger, credentials, fetchImpl: async (url, options) => {
    assert.equal(url, ORIGIN + path);
    assert.deepEqual(options.body, upload.body);
    assert.equal(options.headers['Content-Type'], upload.contentType);
    const canonical = ['POST', options.headers['On-Nonce'], options.headers.Date, upload.contentType, path, '', ''].join('\n').toLowerCase();
    const signature = createHmac('sha256', credentials.secretKey).update(canonical).digest('base64');
    assert.equal(options.headers.Authorization, `On ${credentials.accessKey}:HmacSHA256:${signature}`);
    return Response.json({ id: 'fixture-translation' });
  } });
  await send({ key: 'binary-upload', phase: 'cotsImportPollInspect', operation: 'createTranslation', method: 'POST',
    path, body: upload.body, contentType: upload.contentType });
  assert.equal(ledger.data.attempts.length, 1);
});

test('encoded slashes are permitted in query values but not API path segments', async context => {
  const { ledger } = fixture(context);
  let calls = 0;
  const send = createTransport({ ledger, credentials, fetchImpl: async url => {
    calls++;
    assert.equal(new URL(url).searchParams.get('partId'), 'LF/GB');
    return Response.json({ source: 'offline-fixture' });
  } });
  await assert.rejects(send({ ...request, path: '/api/v17/parts%2Fprivate' }), /REQUEST_SCOPE/);
  await send({ ...request, path: '/api/v17/partstudios/fixture/gltf?partId=LF%2FGB' });
  assert.equal(calls, 1);
});

test('documented GLTF JSON media type is sent and bound to the cached request', async context => {
  const { ledger } = fixture(context);
  const send = createTransport({ ledger, credentials, fetchImpl: async (url, options) => {
    assert.equal(options.headers.Accept, 'model/gltf+json');
    return Response.json({ asset: { version: '2.0' } });
  } });
  await send({ ...request, accept: 'model/gltf+json' });
  await assert.rejects(send(request), /RESUME_REQUEST_CHANGED/);
});