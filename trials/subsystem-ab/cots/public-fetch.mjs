import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const ledgerPath = join(root, 'public-fetch-log.json');
const hosts = new Set(['wcproducts.com', 'wcproducts.info', 'docs.wcproducts.com', 'cdn.shopify.com',
  'andymark.com', 'files.andymark.com', 'cdn.andymark.com', 'frcdesign.org',
  'github.com', 'raw.githubusercontent.com', 'api.github.com',
  'drive.google.com', 'drive.usercontent.google.com', 'files.gitbook.com',
  'docs.google.com', 'doc-14-60-sheets.googleusercontent.com', 's3.amazonaws.com']);

export function validateUrl(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', 'HTTPS required');
  assert.ok(hosts.has(url.hostname) || /^doc-[a-z0-9-]+-sheets\.googleusercontent\.com$/.test(url.hostname), 'Source host is not approved');
  assert.ok(!url.username && !url.password, 'Credentials prohibited');
  assert.ok(!url.port, 'Custom ports prohibited');
  if (url.hostname === 'docs.google.com') {
    assert.ok(url.pathname.startsWith('/spreadsheets/d/e/2PACX-1vSPZeZHcDPnZQIcYWm8WMmOUDzfBuh5zs9hROb3MuPvnkusPZuQDykwHV8uUDsjj8nRnv2LYrAV-hHZ/pub'), 'Only the WCP published CAD sheet is allowed');
  }
  if (url.hostname === 's3.amazonaws.com') {
    assert.ok(url.pathname.startsWith('/docusync-files/'), 'Only manufacturer-linked CAD assets are allowed');
  }
  if (url.hostname === 'wcproducts.info') {
    assert.ok(/^\/files\/frc\/(cad|drawings)\//.test(url.pathname), 'Only published manufacturer CAD and drawing paths are allowed');
  }
  assert.ok(!/\.(exe|msi|bat|ps1|sh|dll)(?:$|\/)/i.test(url.pathname), 'Executable downloads prohibited');
  return url.href;
}

export async function fetchPublic(value, filename) {
  assert.match(filename, /^[a-zA-Z0-9_.-]+$/, 'Cache filename must be flat');
  let current = validateUrl(value);
  const publishedSheet = new URL(current).hostname === 'docs.google.com';
  const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) :
    { limit: 15, authenticated_calls: 0, requests: [] };
  assert.ok(!ledger.phase_closed, 'STOP: public source phase is closed');
  mkdirSync(join(root, 'cache'), { recursive: true });
  for (let redirect = 0; redirect < 5; redirect++) {
    assert.ok(ledger.requests.length < ledger.limit, 'STOP: public fetch budget exhausted');
    current = validateUrl(current);
    if (publishedSheet) {
      const hostname = new URL(current).hostname;
      assert.ok(hostname === 'docs.google.com' || /^doc-[a-z0-9-]+-sheets\.googleusercontent\.com$/.test(hostname),
        'Published sheet redirects must stay on Google Docs or Sheets content hosts');
    }
    const record = { attempt: ledger.requests.length + 1, url: current,
      requested_at: new Date().toISOString(), cache: null, status: 'attempted' };
    ledger.requests.push(record);
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
    try {
      const response = await fetch(current, { redirect: 'manual', credentials: 'omit',
        headers: { 'User-Agent': 'Public-COTS-research/1.0', Accept: '*/*' },
        signal: AbortSignal.timeout(60000) });
      record.status = response.status;
      record.content_type = response.headers.get('content-type');
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        current = new URL(response.headers.get('location'), current).href;
        record.redirect = current;
        writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
        continue;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.ok(bytes.length <= 80 * 1024 * 1024, 'Asset exceeds size limit');
      assert.ok(bytes.subarray(0, 2).toString() !== 'MZ', 'Executable bytes prohibited');
      record.bytes = bytes.length;
      record.sha256 = createHash('sha256').update(bytes).digest('hex');
      record.cache = `cache/${filename}`;
      writeFileSync(join(root, record.cache), bytes);
      writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
      console.log(JSON.stringify(record));
      return record;
    } catch (error) {
      record.error_type = error.name;
      writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
      throw new Error(`Public attempt ${record.attempt} failed (${error.name}); no automatic retry`);
    }
  }
  throw new Error('Redirect limit reached');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await fetchPublic(process.argv[2], process.argv[3]);
}