import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const routes = [
  {
    id: 'official-mcp',
    evidence: 'OFFICIAL_MCP_MODELING_WITH_REST_VERIFICATION_AND_EXPORT',
    directory: 'trials/official-mcp/artifacts/readonly-supplement/',
    files: ['baseline.png', 'revision.png', 'baseline-step-original.zip', 'revision-step-original.zip',
      'baseline-report.json', 'revision-report.json', 'baseline-measured.json', 'revision-measured.json',
      'baseline-persisted.fs', 'revision-persisted.fs'],
    extras: { 'result.json': 'trials/official-mcp/artifacts/current-live-result.json' },
  },
  {
    id: 'native-template',
    evidence: 'LIVE_NATIVE_TEMPLATE_AND_EDIT_PRESERVATION',
    directory: 'trials/native-template/artifacts/',
    files: ['summary.json'],
  },
  {
    id: 'manufacturing-package',
    evidence: 'LOCAL_DRAWINGS_FROM_REAL_ONSHAPE_SNAPSHOTS_NOT_FOR_MANUFACTURE',
    directory: 'trials/manufacturing-package/artifacts/live/',
    files: ['summary.json', ...['A', 'B'].flatMap(revision =>
      ['drawing.pdf', 'drawing.png', 'profile.dxf', 'plate.step', 'manifest.json'].map(name => `${revision}/package/${name}`))],
  },
  {
    id: 'local-preflight',
    evidence: 'LOCAL_CADQUERY_ONLY_BROWSER_BLOCKED_NOT_ONSHAPE_EXPORT',
    directory: 'trials/local-preflight-browser/artifacts/',
    files: ['preflight-summary.json', ...['A', 'B-final-six'].flatMap(phase =>
      ['local.step', 'local-preview.svg', 'parameters.json'].map(name => `candidates/${phase}/${name}`))],
  },
];
const manifest = { capturedOn: '2026-09-11', copyingOnly: true, networkRequests: 0, routes: [] };
for (const route of routes) {
  const inputs = route.files.map(name => ({ name, original: `${route.directory}${name}` }));
  for (const [name, original] of Object.entries(route.extras ?? {})) inputs.push({ name, original });
  const files = [];
  for (const input of inputs) {
    const path = `outputs/${route.id}/${input.name}`;
    const destination = new URL(path, root);
    await mkdir(dirname(fileURLToPath(destination)), { recursive: true });
    const bytes = await readFile(new URL(input.original, root));
    await copyFile(new URL(input.original, root), destination);
    assert.deepEqual(await readFile(destination), bytes);
    files.push({ path, original: input.original, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  manifest.routes.push({ id: route.id, evidence: route.evidence, files });
}
await writeFile(new URL('outputs/followup-manifest.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Published ${manifest.routes.reduce((total, route) => total + route.files.length, 0)} unchanged follow-up artifacts. No network or credential access.`);