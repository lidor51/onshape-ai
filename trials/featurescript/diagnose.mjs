import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { OnshapeClient } from './client.mjs';
import { loadLiveCredentials } from './deploy.mjs';

assert.deepEqual(process.argv.slice(2), ['--live', '--confirm-public']);
const directory = new URL('./runs/2026-09-11T12-13-10-600Z-b3dea05b-d228-4142-8f6e-3f6fbdf257cd/', import.meta.url);
const creation = JSON.parse(await readFile(new URL('creation.json', directory), 'utf8'));
const label = `diagnostic-${randomUUID()}`;
const client = new OnshapeClient({ ...await loadLiveCredentials('live-public'),
  observe: entry => appendFile(new URL(`${label}-calls.jsonl`, directory), `${JSON.stringify(entry)}\n`),
});
const started = performance.now();
const result = { status: 'STARTED', artifacts: directory.pathname, retries: 0 };
try {
  const { did, wid } = await client.resumePublicDocument(creation, true);
  for (const endpoint of ['notices']) {
    try {
      const response = await client.request('GET', `/featurescript/d/${did}/w/${wid}/e/8e613db339872b56a7d45795/${endpoint}`);
      await writeFile(new URL(`${label}-${endpoint}.json`, directory), JSON.stringify(client.sanitize(response), null, 2), { flag: 'wx' });
      Object.assign(result, { status: 'DIAGNOSTICS_RECEIVED', endpoint, response });
      break;
    } catch (error) { result[endpoint] = error.message; }
  }
} catch (error) { result.error = error.message; }
Object.assign(result, { elapsedMs: performance.now() - started, networkRequests: client.requestCount });
await writeFile(new URL(`${label}-summary.json`, directory), JSON.stringify(client.sanitize(result), null, 2), { flag: 'wx' });
console.log(JSON.stringify(client.sanitize(result), null, 2));