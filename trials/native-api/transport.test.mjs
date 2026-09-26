import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { parseArguments, stackOrigin, loadCredentials, signRequest, createClient } from './transport.mjs';

const credentials = { accessKey: 'SyntheticAccessOnly', secretKey: 'SyntheticSecretOnly' };

test('public creation requires explicit opt-in and cannot be combined with private mode', () => {
  assert.equal(parseArguments(['--live', '--confirm-new-public-document']).publicDocument, true);
  assert.equal(parseArguments(['--live', '--confirm-new-private-document']).publicDocument, false);
  assert.throws(() => parseArguments(['--confirm-new-public-document']), /LIVE_CONFIRMATION_REQUIRED/);
  assert.throws(() => parseArguments(['--live', '--confirm-new-public-document', '--confirm-new-private-document']), /CONFLICTING_VISIBILITY/);
});

test('live opt-in rejects existing-document arguments and arbitrary hosts', () => {
  assert.equal(parseArguments([]).live, false);
  assert.equal(parseArguments(['--live', '--confirm-new-private-document']).live, true);
  for (const args of [['--live'], ['--confirm-new-private-document'], ['--document=existing'], ['--live', '--live'], ['--stack=https://cad.onshape.com']]) {
    assert.throws(() => parseArguments(args));
  }
  for (const host of ['http://cad.onshape.com', 'https://example.com', 'https://onshape.com.evil.test', 'https://user@cad.onshape.com', 'https://cad.onshape.com:444', 'https://cad.onshape.com/path']) {
    assert.throws(() => stackOrigin(host));
  }
  assert.equal(stackOrigin('https://example-enterprise.onshape.com'), 'https://example-enterprise.onshape.com');
});

test('credential loader cannot read before live opt-in; only synthetic input is tested', async () => {
  let reads = 0;
  const reader = async () => { reads++; return 'ONSHAPE_ACCESS_KEY=SyntheticAccessOnly\nONSHAPE_SECRET_KEY=SyntheticSecretOnly'; };
  await assert.rejects(loadCredentials(false, reader, undefined, {}), /LIVE_REQUIRED/);
  assert.equal(reads, 0);
  assert.deepEqual(await loadCredentials(true, reader, undefined, {}), credentials);
  assert.equal(reads, 1);
});

test('configured stack must match the target before credentials can be used', async () => {
  const input = 'ONSHAPE_ACCESS_KEY=SyntheticAccessOnly\nONSHAPE_SECRET_KEY=SyntheticSecretOnly\n';
  const reader = async () => `${input}ONSHAPE_BASE_URL=https://enterprise.onshape.com`;
  await assert.rejects(loadCredentials(true, reader, 'https://cad.onshape.com', {}), /CONFIGURED_STACK_MISMATCH/);
  assert.deepEqual(await loadCredentials(true, reader, 'https://enterprise.onshape.com', {}), credentials);
  await assert.rejects(loadCredentials(true, async () => input, 'https://cad.onshape.com', {
    ONSHAPE_BASE_URL: 'https://enterprise.onshape.com',
  }), /CONFIGURED_STACK_MISMATCH/);
  await assert.rejects(loadCredentials(true, async () => `${input}ONSHAPE_BASE_URL=https://example.com`, undefined, {}), /INVALID_STACK/);
});

test('synthetic key normalization accepts printable HMAC secrets but rejects embedded controls', async () => {
  const reader = async () => 'ONSHAPE_ACCESS_KEY=" Synthetic_Access-Only "\nONSHAPE_SECRET_KEY=" Synthetic+/Secret=Only "';
  assert.deepEqual(await loadCredentials(true, reader, undefined, {}), {
    accessKey: 'Synthetic_Access-Only', secretKey: 'Synthetic+/Secret=Only',
  });
  await assert.rejects(loadCredentials(true, async () => 'ONSHAPE_ACCESS_KEY=Test\nONSHAPE_SECRET_KEY="Embedded\nNewline"', undefined, {}), /CREDENTIAL_KEYS_MISSING_OR_INVALID/);
});

test('server rejection retains only a sanitized message, never response headers', async () => {
  const events = [];
  const client = createClient({ live: true, credentials, onEvent: event => events.push(event), fetchImpl: async () => new Response(JSON.stringify({
    message: `Private creation denied ${credentials.secretKey} ${credentials.accessKey} https://example.com/token`,
    headers: { Authorization: 'must-not-be-saved' },
  }), { status: 403 }) });
  await assert.rejects(client.request('POST', '/api/v10/documents', {}, 'createPrivateDocument'), /HTTP_403/);
  assert.equal(events[0].reason, 'Private creation denied [REDACTED] [REDACTED] [URL_REDACTED]');
  assert.ok(!JSON.stringify(events).includes('must-not-be-saved'));
});

test('HMAC matches official lower-case canonical field order with terminal newline', () => {
  const input = {
    method: 'GET', url: 'https://cad.onshape.com/api/v9/Parts?x=UPPER&y=2', nonce: 'ABCdef0123456789',
    date: 'Fri, 11 Sep 2026 12:00:00 GMT', contentType: 'application/json', ...credentials,
  };
  const canonical = 'get\nabcdef0123456789\nfri, 11 sep 2026 12:00:00 gmt\napplication/json\n/api/v9/parts\nx=upper&y=2\n';
  const expected = createHmac('sha256', credentials.secretKey).update(canonical).digest('base64');
  assert.equal(signRequest(input), `On SyntheticAccessOnly:HmacSHA256:${expected}`);
});

test('redirect and hostile error responses never log credentials or headers or body', async () => {
  for (const status of [307, 403, 429]) {
    const events = [];
    let calls = 0;
    const client = createClient({ live: true, credentials, onEvent: event => events.push(event), fetchImpl: async (_url, options) => {
      calls++;
      assert.equal(options.redirect, 'manual');
      assert.match(options.headers['On-Nonce'], /^[a-z0-9]{32}$/);
      return new Response(JSON.stringify({ secret: credentials.secretKey, headers: options.headers }), { status, headers: { Location: 'https://example.com' } });
    } });
    await assert.rejects(client.request('POST', '/api/v10/documents', { name: 'test', isPublic: false }, 'createDocument'));
    assert.equal(calls, 1);
    const log = JSON.stringify(events);
    assert.ok(!log.includes(credentials.secretKey));
    assert.ok(!log.includes(credentials.accessKey));
    assert.ok(!log.includes('Authorization'));
    assert.equal(events[0].status, status);
  }
});

test('transport rejects delete, absolute URLs, and traversal before fetching', async () => {
  let calls = 0;
  const client = createClient({ live: true, credentials, fetchImpl: async () => { calls++; throw new Error('unreachable'); } });
  for (const [method, path] of [['DELETE', '/api/v10/documents/x'], ['GET', 'https://example.com/api/v9/x'], ['GET', '/api/v9/../x']]) {
    await assert.rejects(client.request(method, path, undefined, 'blocked'));
  }
  assert.equal(calls, 0);
});