import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeDiscovery, approvedUrl, exactCandidate, minimalDocument, guardedGet, discoverManaged, MANAGED_NAMES, ORIGIN } from './managed-discovery.mjs';

const ids = ['a'.repeat(24), 'b'.repeat(24)];
const documents = MANAGED_NAMES.map((name, index) => ({ id: ids[index], name, isPublic: true,
  defaultWorkspace: { id: `${index + 1}`.repeat(24) }, owner: { email: 'never-retain@example.invalid' }, arbitrary: 'omit-this' }));
const search = `${ORIGIN}/api/documents?${new URLSearchParams({ q: MANAGED_NAMES[0], filter: '0', limit: '20', offset: '0' })}`;

test('discovery requires all three explicit authorizations before credential loading', () => {
  assert.throws(() => authorizeDiscovery([]), /AUTHORIZATION/);
  assert.throws(() => authorizeDiscovery(['--live-managed-discovery', '--allow-current-key']), /AUTHORIZATION/);
  authorizeDiscovery(['--live-managed-discovery', '--allow-current-key', '--allow-new-public-managed-documents']);
});

test('only exact managed names survive filtering, with ambiguity and incomplete listing rejected', () => {
  assert.deepEqual(exactCandidate({ items: [...documents, { name: 'unrelated CAD' }] }, MANAGED_NAMES[0]), { id: ids[0], name: MANAGED_NAMES[0] });
  assert.throws(() => exactCandidate({ items: [documents[0], documents[0]] }, MANAGED_NAMES[0]), /AMBIGUOUS/);
  assert.throws(() => exactCandidate({ items: [{ ...documents[0], name: `${MANAGED_NAMES[0]} backup` }] }, MANAGED_NAMES[0]), /NOT_FOUND/);
  assert.throws(() => exactCandidate({ items: [documents[0]], next: 'anything' }, MANAGED_NAMES[0]), /NOT_EXHAUSTIVE/);
  assert.throws(() => exactCandidate({ items: [documents[0]], totalCount: 2 }, MANAGED_NAMES[0]), /NOT_EXHAUSTIVE/);
  assert.deepEqual(Object.keys(minimalDocument(documents[0], MANAGED_NAMES[0])), ['id', 'name', 'isPublic', 'defaultWorkspaceId']);
  assert.throws(() => minimalDocument({ ...documents[0], isPublic: undefined }, MANAGED_NAMES[0]), /VISIBILITY_UNKNOWN/);
  const publicShape = { ...documents[0], public: true };
  delete publicShape.isPublic;
  assert.equal(minimalDocument(publicShape, MANAGED_NAMES[0]).isPublic, true);
  assert.throws(() => minimalDocument({ ...documents[0], public: false }, MANAGED_NAMES[0]), /VISIBILITY_CONFLICT/);
});

test('origin and route guards reject unrelated CAD, geometry endpoints, credentials and broad search', () => {
  approvedUrl(search);
  approvedUrl(`${ORIGIN}/api/documents/${ids[0]}`, new Set([ids[0]]));
  for (const url of [`${ORIGIN}/api/documents/${ids[0]}`, `${ORIGIN}/api/partstudios/d/${ids[0]}`,
    `${ORIGIN}/api/documents`, search.replace('cad.onshape.com', 'example.invalid'), search.replace('https://', 'http://'),
    search.replace('https://', 'https://account:password@'), `${search}&q=anything`, `${search}#fragment`]) {
    assert.throws(() => approvedUrl(url), /UNAPPROVED/);
  }
});

test('live-like transport only GETs four approved routes and persists no raw account fields', async () => {
  const report = { requests: [], documents: [] };
  let calls = 0;
  const client = guardedGet({ credentials: { accessKey: 'fake-access', secretKey: 'fake-secret' }, ledger: report,
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(options.method, 'GET');
      assert.equal(options.redirect, 'manual');
      assert.equal(options.credentials, 'omit');
      const parsed = new URL(url);
      const body = parsed.search ? { items: documents.filter(document => document.name === parsed.searchParams.get('q')) } :
        documents.find(document => parsed.pathname.endsWith(document.id));
      return Response.json(body);
    } });
  await discoverManaged(client, report);
  assert.equal(calls, 4);
  assert.equal(report.status, 'PUBLIC_MANAGED_DOCUMENTS_IDENTIFIED');
  assert.equal(report.serviceConfiguredTargetIndependentlyConfirmed, false);
  for (const forbidden of ['fake-access', 'fake-secret', 'never-retain', 'omit-this', 'Authorization', 'HmacSHA256']) {
    assert.ok(!JSON.stringify(report).includes(forbidden));
  }
});

test('transport caps attempts at eight and does not follow redirects or expose thrown secrets', async () => {
  const ledger = { requests: [] };
  const client = guardedGet({ credentials: { accessKey: 'fake-access', secretKey: 'fake-secret' }, ledger,
    fetchImpl: async () => { throw new Error('fake-secret'); } });
  for (let index = 0; index < 8; index++) await assert.rejects(() => client.get(search), /^Error: DOCUMENT_REQUEST_FAILED$/);
  await assert.rejects(() => client.get(search), /DISCOVERY_REQUEST_CAP/);
  assert.equal(ledger.requests.length, 8);
  assert.ok(!JSON.stringify(ledger).includes('fake-secret'));
  const redirect = guardedGet({ credentials: { accessKey: 'fake-access', secretKey: 'fake-secret' }, ledger: { requests: [] },
    fetchImpl: async () => new Response(null, { status: 302, headers: { Location: 'https://example.invalid' } }) });
  await assert.rejects(() => redirect.get(search), /DOCUMENT_REQUEST_FAILED/);
});

test('private managed metadata blocks model admission without sharing changes', async () => {
  const report = { requests: [], documents: [] };
  const client = { approveId() {}, async get(url) {
    const parsed = new URL(url);
    if (parsed.search) return { items: documents.filter(document => document.name === parsed.searchParams.get('q')) };
    return { ...documents.find(document => parsed.pathname.endsWith(document.id)), isPublic: false };
  } };
  await assert.rejects(() => discoverManaged(client, report), /NOT_PUBLIC/);
  assert.equal(report.documents[0].isPublic, false);
  assert.notEqual(report.status, 'PUBLIC_MANAGED_DOCUMENTS_IDENTIFIED');
});

test('an absent Notes document does not erase positively verified Workspace metadata or permit Notes writes', async () => {
  const report = { requests: [], documents: [] };
  const client = { approveId() {}, async get(url) {
    const parsed = new URL(url);
    if (parsed.search) return { items: parsed.searchParams.get('q') === MANAGED_NAMES[0] ? [documents[0]] : [] };
    return documents[0];
  } };
  await discoverManaged(client, report);
  assert.equal(report.status, 'PUBLIC_MANAGED_WORKSPACE_IDENTIFIED_NOTES_ABSENT');
  assert.deepEqual(report.absentManagedNames, [MANAGED_NAMES[1]]);
  assert.deepEqual(report.documents, [minimalDocument(documents[0], MANAGED_NAMES[0])]);
});