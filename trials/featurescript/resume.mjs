import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { OnshapeClient } from './client.mjs';
import { deployWorkflow, loadLiveCredentials } from './deploy.mjs';

export async function ownBenchmark() {
  const baseline = JSON.parse(await readFile(new URL('./artifacts/baseline.json', import.meta.url), 'utf8'));
  const revision = JSON.parse(await readFile(new URL('./artifacts/revision.json', import.meta.url), 'utf8'));
  const coral = baseline.parts.find(part => part.name === 'coralReference');
  const { min, max } = coral.boundsMm;
  return { baseline: baseline.parameters, revision: revision.parameters,
    requiredParts: baseline.parts.map(part => part.name),
    coralReference: { lengthMm: max[0] - min[0], outerDiameterMm: max[2] - min[2],
      innerDiameterMm: coral.boreDiameterMm, centerYMm: (min[1] + max[1]) / 2, centerZMm: (min[2] + max[2]) / 2 } };
}

export async function resume(argv = process.argv.slice(2)) {
  assert.deepEqual(argv.slice(0, 3), ['--live', '--confirm-public', '--run']);
  assert.equal(argv.length, 4, 'Only an own-run directory may be resumed');
  assert.match(argv[3], /^[0-9TZa-f-]{61}$/);
  const previousDirectory = new URL(`./runs/${argv[3]}/`, import.meta.url);
  const previous = JSON.parse(await readFile(new URL('summary.json', previousDirectory), 'utf8'));
  const previousCalls = (await readFile(new URL('calls.jsonl', previousDirectory), 'utf8')).trim().split('\n').map(JSON.parse);
  const creation = previousCalls.find(call => call.method === 'POST' && call.path === '/documents') ??
    JSON.parse(await readFile(new URL('creation.json', previousDirectory), 'utf8'));
  assert.equal(previous.documentId, creation.response.id);
  assert.equal(previous.workspaceId, creation.response.defaultWorkspace.id);
  assert.equal(previous.public, true);
  assert.match(previous.featureStudioId, /^[a-f0-9]{24}$/);
  const credentials = await loadLiveCredentials('live-public');
  const runName = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
  const directory = new URL(`./runs/${runName}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const client = new OnshapeClient({ ...credentials, observe: observation => appendFile(new URL('calls.jsonl', directory), `${JSON.stringify(observation)}\n`) });
  const save = (name, value) => writeFile(new URL(name, directory), Buffer.isBuffer(value) ? value : `${JSON.stringify(client.sanitize(value), null, 2)}\n`, { flag: 'wx' });
  await save('creation.json', creation);
  const started = performance.now();
  const progress = { ...previous, status: 'STARTED', stage: 'verify-resume-provenance', parentRun: argv[3], artifacts: `trials/featurescript/runs/${runName}` };
  delete progress.error;
  try {
    await client.resumePublicDocument(creation, true);
    progress.resumeVerified = true;
    const benchmark = await ownBenchmark();
    await save('benchmark.json', benchmark);
    const source = await readFile(new URL('./intake.fs', import.meta.url), 'utf8');
    progress.sourceSha256 = createHash('sha256').update(source).digest('hex');
    await deployWorkflow(client, benchmark, source, save, progress, 'live-public');
  } catch (error) { Object.assign(progress, { status: 'FAILED', error: error.message }); }
  Object.assign(progress, { elapsedMs: performance.now() - started, networkRequests: client.requestCount, retries: 0 });
  await save('summary.json', progress);
  return client.sanitize(progress);
}

if (import.meta.main) {
  try { const result = await resume(); console.log(JSON.stringify(result, null, 2)); if (result.status === 'FAILED') process.exitCode = 1; }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}