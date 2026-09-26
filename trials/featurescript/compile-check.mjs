import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { OnshapeClient } from './client.mjs';
import { loadLiveCredentials } from './deploy.mjs';

export function diagnosticScript(source) {
  const declarations = source.replace(/^FeatureScript[^\n]+\nimport[^\n]+\n/, '')
    .replace(/^function (\w+)\(/gm, 'const $1 = function(')
    .replace(/^}\r?$/gm, '};')
    .replace(/^annotation \{ "Feature Type Name"[^\n]+\n/m, '')
    .replace(/^export const /gm, 'const ');
  return `function(context is Context, queries) {\n${declarations}\nreturn 0;\n}`;
}

if (import.meta.main) {
  assert.deepEqual(process.argv.slice(2), ['--live', '--confirm-public']);
  const directory = new URL('./runs/2026-09-11T12-13-10-600Z-b3dea05b-d228-4142-8f6e-3f6fbdf257cd/', import.meta.url);
  const creation = JSON.parse(await readFile(new URL('creation.json', directory), 'utf8'));
  const label = `compile-check-${randomUUID()}`;
  const client = new OnshapeClient({ ...await loadLiveCredentials('live-public'),
    observe: entry => appendFile(new URL(`${label}-calls.jsonl`, directory), `${JSON.stringify(entry)}\n`),
  });
  const started = performance.now();
  const result = { evidence: 'Diagnostic lambda compilation only; custom feature is not invoked', retries: 0 };
  try {
    const { did, wid } = await client.resumePublicDocument(creation, true);
    const elements = await client.request('GET', `/documents/d/${did}/w/${wid}/elements`);
    const studio = elements.find(element => element.elementType === 'PARTSTUDIO');
    assert.match(studio?.id ?? '', /^[a-f0-9]{24}$/);
    const source = await readFile(new URL('./intake.fs', import.meta.url), 'utf8');
    const script = diagnosticScript(source);
    result.response = await client.request('POST', `/partstudios/d/${did}/w/${wid}/e/${studio.id}/featurescript`, { script, libraryVersion: 2232 });
  } catch (error) { result.error = error.message; }
  Object.assign(result, { elapsedMs: performance.now() - started, networkRequests: client.requestCount });
  await writeFile(new URL(`${label}-summary.json`, directory), JSON.stringify(client.sanitize(result), null, 2), { flag: 'wx' });
  console.log(JSON.stringify(client.sanitize(result), null, 2));
}