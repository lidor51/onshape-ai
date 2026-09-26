import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { OnshapeClient } from './client.mjs';

test('interrupted translation resumes only from owned successful export provenance', async () => {
  const directory = new URL('./runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/', import.meta.url);
  const creation = JSON.parse(await readFile(new URL('creation.json', directory), 'utf8'));
  const calls = (await readFile(new URL('calls.jsonl', directory), 'utf8')).trim().split('\n').map(JSON.parse);
  const exported = calls.find(call => call.method === 'POST' && call.path.endsWith('/export/step'));
  const requests = [];
  const client = new OnshapeClient({ accessKey: 'synthetic-access', secretKey: 'synthetic-secret', fetchImpl: async (url, options) => {
    requests.push({ url, method: options.method });
    return Response.json(url.includes('/translations/') ? exported.response : creation.response);
  } });
  assert.throws(() => client.resumeTranslation(exported), /provenance/);
  await client.resumePublicDocument(creation, true);
  await assert.rejects(client.request('GET', `/translations/${exported.response.id}`), /outside/);
  for (const change of [{ status: 400 }, { path: exported.path.replace(creation.response.id, '0'.repeat(24)) },
    { requestBody: { storeInDocument: true } }, { response: { ...exported.response, documentId: '0'.repeat(24) } }]) {
    assert.throws(() => client.resumeTranslation({ ...exported, ...change }), /provenance/);
  }
  assert.equal(client.resumeTranslation(exported).id, exported.response.id);
  await client.request('GET', `/translations/${exported.response.id}`);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.method === 'GET'));
});