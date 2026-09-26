import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = dirname(fileURLToPath(import.meta.url));
export const LIMITS = Object.freeze({ attempts: 12, fileBytes: 25 * 1024 ** 2, totalBytes: 100 * 1024 ** 2 });
export function approvedUrl(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert.ok(!url.username && !url.password && !url.port, 'Credentials and custom ports prohibited');
  const allowed = (url.hostname === 'wcproducts.info' && /^\/files\/frc\/(cad|drawings)\//.test(url.pathname)) ||
    (['andymark.com', 'www.andymark.com'].includes(url.hostname) &&
      (/^\/(products|pages)\//.test(url.pathname) ||
        (url.pathname === '/search' && url.searchParams.get('q') === '5 inch compliant star' &&
          url.searchParams.get('type') === 'product' && [...url.searchParams].length === 2))) ||
    (['files.andymark.com', 'cdn.andymark.com'].includes(url.hostname)) ||
    (url.hostname === 'cdn.shopify.com' && url.pathname.startsWith('/s/files/1/0644/2303/5052/')) ||
    (url.hostname === 's3.amazonaws.com' && url.pathname.startsWith('/docusync-files/'));
  assert.ok(allowed, 'Only bounded public manufacturer assets/pages allowed');
  assert.ok(!/token|signature|credential|password|authorization/i.test(url.search), 'Signed/authenticated URLs prohibited');
  return url.href;
}

export function newLedger() {
  return { schema: 'coral-cots-public-acquisition/v1', date: new Date().toISOString(), limits: LIMITS,
    authenticatedRequests: 0, accounting: 'One receipt before each explicit HTTP attempt, including redirects; no retries. Body byte caps exclude HTTP/TLS overhead and transport prefetch.',
    requests: [] };
}

export async function acquire(url, filename, ledger, persist, save, transport = fetch) {
  assert.match(filename, /^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(step|stp|pdf|html|csv|json)$/i);
  assert.ok(!ledger.closed, 'STOP: this bounded acquisition pass is closed');
  let current = approvedUrl(url);
  for (;;) {
    assert.ok(ledger.requests.length < LIMITS.attempts, 'STOP: 12-attempt budget exhausted');
    const charged = ledger.requests.reduce((sum, record) => sum + record.chargedBytes, 0);
    const allowance = Math.min(LIMITS.fileBytes, LIMITS.totalBytes - charged);
    assert.ok(allowance > 0, 'STOP: 100 MiB budget exhausted');
    const record = { attempt: ledger.requests.length + 1, url: current, requestedAt: new Date().toISOString(),
      status: 'reserved', chargedBytes: allowance, receivedBytes: 0, savedPath: null };
    ledger.requests.push(record);
    persist(ledger);
    let response;
    try {
      response = await transport(current, { method: 'GET', redirect: 'manual', credentials: 'omit',
        headers: { 'User-Agent': 'BoundedPublicVendorCAD/1.0', Accept: '*/*', 'Accept-Encoding': 'identity' },
        signal: AbortSignal.timeout(90000) });
      record.httpStatus = response.status;
      record.contentType = response.headers.get('content-type');
      record.contentLength = response.headers.get('content-length');
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const location = response.headers.get('location');
        assert.ok(location, 'Redirect missing Location');
        record.redirect = new URL(location, current).href;
        current = approvedUrl(record.redirect);
        record.status = 'redirect';
        record.chargedBytes = 0;
        persist(ledger);
        continue;
      }
      assert.ok(response.ok, `HTTP ${response.status}`);
      assert.ok(!record.contentLength || Number(record.contentLength) <= allowance, 'Declared body exceeds remaining byte cap');
      assert.ok(response.body, 'Empty response body');
      const chunks = [];
      for await (const chunk of response.body) {
        record.receivedBytes += chunk.byteLength;
        assert.ok(record.receivedBytes <= allowance, 'Streaming body exceeds remaining byte cap');
        chunks.push(Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks);
      assert.ok(body.length > 0, 'Empty asset');
      if (/\.(step|stp)$/i.test(filename)) assert.match(body.subarray(0, 256).toString(), /ISO-10303-21;/);
      if (/\.pdf$/i.test(filename)) assert.equal(body.subarray(0, 5).toString(), '%PDF-');
      record.sha256 = createHash('sha256').update(body).digest('hex');
      record.savedPath = save(filename, body);
      record.status = 'saved';
      record.chargedBytes = record.receivedBytes;
      persist(ledger);
      return record;
    } catch (error) {
      try { await response?.body?.cancel(); } catch {}
      record.status = 'failed';
      record.error = error.message;
      record.chargedBytes = Math.max(record.chargedBytes, record.receivedBytes);
      persist(ledger);
      throw new Error(`Attempt ${record.attempt}: ${error.message}; no automatic retry`);
    }
  }
}

async function selftest() {
  const source = 'https://wcproducts.info/files/frc/cad/WCP-1010.STEP';
  approvedUrl('https://www.andymark.com/search?q=5+inch+compliant+star&type=product');
  assert.throws(() => approvedUrl('https://www.andymark.com/search?q=all&type=product'));
  for (const denied of ['http://wcproducts.info/files/frc/cad/test.step', 'https://cad.onshape.com/documents/x',
    'https://user:pass@files.andymark.com/a.step', 'https://localhost/a.step', 'https://files.andymark.com/a.step?token=x']) {
    assert.throws(() => approvedUrl(denied));
  }
  const ledger = newLedger();
  let calls = 0;
  const saved = [];
  const fake = async (url, options) => {
    calls++;
    assert.equal(options.redirect, 'manual');
    assert.equal(options.credentials, 'omit');
    assert.equal(ledger.requests.length, calls);
    return calls === 1 ? new Response(null, { status: 302, headers: { location: source } }) :
      new Response('ISO-10303-21;\nEND-ISO-10303-21;');
  };
  await acquire(source, 'test.step', ledger, () => {}, (name, body) => { saved.push(body); return name; }, fake);
  assert.equal(calls, 2);
  assert.equal(saved.length, 1);
  assert.equal(ledger.requests[0].status, 'redirect');
  assert.equal(ledger.requests[1].chargedBytes, saved[0].length);
  await assert.rejects(acquire(source, 'test.step', { ...newLedger(), closed: true }, () => {}, () => {}, fake), /closed/);
  const full = newLedger();
  full.requests = Array.from({ length: 12 }, () => ({ chargedBytes: 0 }));
  await assert.rejects(acquire(source, 'test.step', full, () => {}, () => {}, fake), /12-attempt/);
  const bytesFull = newLedger();
  bytesFull.requests.push({ chargedBytes: LIMITS.totalBytes });
  await assert.rejects(acquire(source, 'test.step', bytesFull, () => {}, () => {}, fake), /100 MiB/);
  const oversize = newLedger();
  await assert.rejects(acquire(source, 'test.step', oversize, () => {}, () => assert.fail('Must not save'),
    async () => new Response('too large', { headers: { 'content-length': String(LIMITS.fileBytes + 1) } })), /Declared body/);
  const streaming = newLedger();
  streaming.requests.push({ chargedBytes: LIMITS.totalBytes - 8 });
  await assert.rejects(acquire(source, 'test.step', streaming, () => {}, () => assert.fail('Must not save'),
    async () => new Response('123456789')), /Streaming body/);
  const invalid = newLedger();
  await assert.rejects(acquire(source, 'test.step', invalid, () => {}, () => assert.fail('Must not save'),
    async () => new Response('<html>not STEP</html>')), /ISO-10303/);
  const forbiddenRedirect = newLedger();
  await assert.rejects(acquire(source, 'test.step', forbiddenRedirect, () => {}, () => {},
    async () => new Response(null, { status: 302, headers: { location: 'https://cad.onshape.com/' } })), /manufacturer/);
  assert.equal(forbiddenRedirect.requests.length, 1);
  console.log('PASS: offline URL/auth, pre-request receipt, redirects, request/byte caps, streaming overflow, content signature, and fail-closed checks; zero HTTP attempts');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === 'selftest') await selftest();
  else if (process.argv[2] === 'get' && process.argv.length === 5) {
    const filename = process.argv[4];
    assert.match(filename, /^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(step|stp|pdf|html|csv|json)$/i);
    mkdirSync(join(ROOT, 'originals'), { recursive: true });
    assert.ok(!existsSync(join(ROOT, 'originals', filename)), 'Never overwrite a vendor original');
    const lockPath = join(ROOT, '.acquisition.lock');
    const lock = openSync(lockPath, 'wx');
    try {
      const ledgerPath = join(ROOT, 'request-ledger.json');
      const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : newLedger();
      const persist = data => writeFileSync(ledgerPath, JSON.stringify(data, null, 2) + '\n');
      const record = await acquire(process.argv[3], filename, ledger, persist, (name, body) => {
        writeFileSync(join(ROOT, 'originals', name), body, { flag: 'wx' });
        return `designs/coral-intake-v1/cots/originals/${name}`;
      });
      console.log(JSON.stringify(record, null, 2));
    } finally {
      closeSync(lock);
      unlinkSync(lockPath);
    }
  } else throw new Error('Usage: node acquire.mjs selftest | get HTTPS_URL filename.step');
}