import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { OnshapeClient, sanitizer, signRequest, trustedOrigin } from './client.mjs';

const did = '111111111111111111111111';
const wid = '222222222222222222222222';

test('HMAC contract matches official lowercase fields and final newline', () => {
  const result = signRequest({ method: 'GET', url: 'https://cad.onshape.com/api/v11/parts?Name=ABC', nonce: 'ABC123456789012345', date: 'Fri, 11 Sep 2026 12:00:00 GMT', accessKey: 'test-access', secretKey: 'test-secret' });
  const canonical = 'get\nabc123456789012345\nfri, 11 sep 2026 12:00:00 gmt\napplication/json\n/api/v11/parts\nname=abc\n';
  assert.equal(result.canonical, canonical);
  assert.equal(result.authorization, `On test-access:HmacSHA256:${createHmac('sha256', 'test-secret').update(canonical).digest('base64')}`);
});

test('credential destination guard rejects spoofed hosts, ports, userinfo, and HTTP', () => {
  assert.equal(trustedOrigin(), 'https://cad.onshape.com');
  for (const host of ['http://cad.onshape.com', 'https://cad.onshape.com.attacker.test', 'https://attacker.test', 'https://cad.onshape.com:8443', 'https://user@cad.onshape.com', 'https://cad.onshape.com/path']) assert.throws(() => trustedOrigin(host));
});

test('synthetic transport only: private creation, same-run scope, and no delete or duplicate document', async () => {
  const calls = [];
  const client = new OnshapeClient({ accessKey: 'synthetic-access', secretKey: 'synthetic-secret', fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return Response.json({ id: did, public: false, defaultWorkspace: { id: wid } });
  } });
  await assert.rejects(client.request('POST', '/documents'), /No private/);
  await client.createPrivateDocument('Synthetic test');
  assert.deepEqual(JSON.parse(calls[0].options.body), { name: 'Synthetic test', isPublic: false });
  await assert.rejects(client.createPrivateDocument('again'), /one new-document/);
  await assert.rejects(client.request('DELETE', `/documents/d/${did}/`), /GET and POST/);
  await assert.rejects(client.request('POST', `/featurestudios/d/${'3'.repeat(24)}/w/${wid}`, {}), /outside/);
  await assert.rejects(client.request('POST', `/documents/d/${did}/versions`, { workspaceId: wid, publishVersion: true }), /unpublished/);
  assert.equal(calls.length, 1);
});

test('synthetic transport only: redirects never forward credentials or auto-retry', async () => {
  for (const location of ['https://attacker.test/collect', 'https://cad.onshape.com/api/v11/other']) {
    let count = 0;
    const client = new OnshapeClient({ accessKey: 'synthetic-access', secretKey: 'synthetic-secret', fetchImpl: async (url, options) => {
      count++;
      assert.equal(options.redirect, 'manual');
      return new Response(null, { status: 307, headers: { Location: location } });
    } });
    await assert.rejects(client.createPrivateDocument('Synthetic test'), /redirect blocked/);
    assert.equal(count, 1);
  }
});

test('synthetic transport only: refusal or ambiguous privacy never falls back to public', async () => {
  for (const response of [Response.json({ message: 'Forbidden' }, { status: 403 }), Response.json({ id: did, public: true, defaultWorkspace: { id: wid } }), Response.json({ id: did, defaultWorkspace: { id: wid } })]) {
    let count = 0;
    const client = new OnshapeClient({ accessKey: 'synthetic-access', secretKey: 'synthetic-secret', fetchImpl: async () => { count++; return response; } });
    await assert.rejects(client.createPrivateDocument('Synthetic test'));
    await assert.rejects(client.request('POST', `/partstudios/d/${did}/w/${wid}`, {}), /No private/);
    assert.equal(count, 1);
  }
});

test('sanitizer removes credentials and signed authorization from diagnostics', () => {
  const sanitize = sanitizer(['my-secret', 'my-access']);
  assert.deepEqual(sanitize({ secretKey: 'my-secret', error: 'my-secret my-access On other:HmacSHA256:AAAA==', nested: { token: 'hidden' } }), { secretKey: '[REDACTED]', error: '[REDACTED] [REDACTED] [REDACTED AUTH]', nested: { token: '[REDACTED]' } });
});

test('synthetic public mode requires explicit confirmation and positive visibility; no fallback or retry', async () => {
  for (const visibility of [true, false, undefined]) {
    const calls = [];
    const client = new OnshapeClient({ accessKey: 'synthetic-access', secretKey: 'synthetic-secret', fetchImpl: async (url, options) => {
      calls.push(JSON.parse(options.body));
      return Response.json({ id: did, public: visibility, defaultWorkspace: { id: wid } });
    } });
    await assert.rejects(client.createPublicDocument('Synthetic test'), /explicit confirmation/);
    assert.equal(calls.length, 0);
    if (visibility === true) assert.deepEqual(await client.createPublicDocument('Synthetic test', true), { did, wid });
    else await assert.rejects(client.createPublicDocument('Synthetic test', true), /positively confirmed/);
    await assert.rejects(client.createPrivateDocument('fallback'), /one new-document/);
    assert.deepEqual(calls, [{ name: 'Synthetic test', isPublic: true }]);
  }
});

test('public resume requires original creation evidence and matching server provenance', async () => {
  const document = { id: did, public: true, name: 'FeatureScript intake PoC synthetic', defaultWorkspace: { id: wid }, createdBy: { id: 'synthetic-owner' }, createdAt: 'synthetic-time' };
  const creation = { method: 'POST', path: '/documents', status: 200, requestBody: { name: document.name, isPublic: true }, response: document };
  for (const change of [{}, { public: false }, { name: 'Other document' }, { createdBy: { id: 'other' } }]) {
    const calls = [];
    const client = new OnshapeClient({ accessKey: 'synthetic-access', secretKey: 'synthetic-secret', fetchImpl: async (url, options) => {
      calls.push({ url, method: options.method });
      return Response.json({ ...document, ...change });
    } });
    await assert.rejects(client.resumePublicDocument(creation), /confirmation/);
    await assert.rejects(client.resumePublicDocument({}, true), /provenance/);
    assert.equal(calls.length, 0);
    if (Object.keys(change).length) await assert.rejects(client.resumePublicDocument(creation, true), /provenance changed/);
    else assert.deepEqual(await client.resumePublicDocument(creation, true), { did, wid });
    await assert.rejects(client.createPublicDocument('another', true), /one new-document/);
    assert.deepEqual(calls, [{ url: `https://cad.onshape.com/api/v17/documents/${did}`, method: 'GET' }]);
  }
});