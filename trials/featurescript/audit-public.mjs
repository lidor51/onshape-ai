import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { reconcileSummary } from './finish.mjs';

const root = new URL('./runs/', import.meta.url);
const finalRun = '2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49';
const summary = await reconcileSummary(new URL(`${finalRun}/`, root));
assert.equal(summary.status, 'GEOMETRY_AND_EXPORTS_VERIFIED');
const rows = [];
const allCalls = [];
for (const run of await readdir(root)) {
  const directory = new URL(`${run}/`, root);
  const names = await readdir(directory);
  const calls = [];
  for (const file of names.filter(name => name.endsWith('calls.jsonl'))) {
    const content = (await readFile(new URL(file, directory), 'utf8')).trim();
    if (content) calls.push(...content.split('\n').map(line => ({ ...JSON.parse(line), log: `${run}/${file}` })));
  }
  let result;
  if (names.includes('summary.json')) result = JSON.parse(await readFile(new URL('summary.json', directory), 'utf8'));
  const diagnostics = [];
  for (const file of names.filter(name => name.endsWith('-summary.json'))) {
    const diagnostic = JSON.parse(await readFile(new URL(file, directory), 'utf8'));
    diagnostics.push({ file, status: diagnostic.status, error: diagnostic.error,
      networkRequests: diagnostic.networkRequests, elapsedMs: diagnostic.elapsedMs });
  }
  rows.push({ run, requests: calls.length, httpElapsedMs: calls.reduce((sum, call) => sum + call.elapsedMs, 0),
    status: result?.status, stage: result?.stage, error: result?.error, workflowElapsedMs: result?.elapsedMs,
    latestInvocation: result?.latestInvocation, diagnostics });
  allCalls.push(...calls);
}
const creations = allCalls.filter(call => call.method === 'POST' && call.path === '/documents');
const publicDocuments = [...new Set(creations.filter(call => call.status === 200 && call.response?.public === true).map(call => call.response.id))];
assert.ok(publicDocuments.length <= 3);
const continuation = allCalls.filter(call => call.log >= '2026-09-11T12-37-');
const sourceUploads = continuation.filter(call => call.method === 'POST' && /^\/featurestudios\/d\/.+\/e\/[a-f0-9]{24}$/.test(call.path));
assert.equal(sourceUploads.length, 0);
assert.equal(continuation.filter(call => call.method === 'POST' && call.path === '/documents').length, 0);
const errors = allCalls.filter(call => call.status >= 400 || call.error || call.blocked).map(call => ({ log: call.log,
  method: call.method, path: call.path, status: call.status, message: call.response?.message ?? call.error ?? call.blocked }));
const audit = { evidence: 'Counts from this trial only; no new network requests', generatedAt: new Date().toISOString(),
  finalRun, totalRecordedRequests: allCalls.length, totalRecordedHttpElapsedMs: allCalls.reduce((sum, call) => sum + call.elapsedMs, 0),
  publicDocuments, publicDocumentCount: publicDocuments.length, totalDocumentCreationAttempts: creations.length,
  automaticRetries: allCalls.reduce((sum, call) => sum + (call.retries ?? 0), 0),
  continuation: { requests: continuation.length, httpElapsedMs: continuation.reduce((sum, call) => sum + call.elapsedMs, 0),
    sourceUploads: sourceUploads.length, documentsCreated: 0,
    versionsCreated: continuation.filter(call => call.method === 'POST' && call.path.endsWith('/versions') && call.status === 200).length,
    featureInsertions: continuation.filter(call => call.method === 'POST' && call.path.endsWith('/features') && call.status === 200).length,
    parameterRevisions: continuation.filter(call => call.method === 'POST' && call.path.includes('/features/featureid/') && call.status === 200).length,
    stepExportCreations: continuation.filter(call => call.method === 'POST' && call.path.endsWith('/export/step') && call.status === 200).length },
  errors, runs: rows,
  timingsNote: 'HTTP times include fetch/body read, not signing or log writes. Cumulative HTTP time is not agent wall time. Interrupted workflow timer is unavailable; completed invocation timers are preserved.' };
await writeFile(new URL('./artifacts/public-audit.json', import.meta.url), `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ status: summary.status, totalRequests: audit.totalRecordedRequests,
  continuationRequests: audit.continuation.requests, publicDocuments: audit.publicDocumentCount, errors: errors.length }));