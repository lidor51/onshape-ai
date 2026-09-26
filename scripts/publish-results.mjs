import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const routes = [
  {
    id: 'native-api',
    directory: 'trials/native-api/live/2026-09-11T12-12-56-154Z-fcca583e/',
    url: 'https://cad.onshape.com/documents/8ed4380f4a245838e95aa4a5/w/fb131c088194dac823c29de4/e/4e3c0ad9b4c4e0b31dcc3875',
    featureCount: 18,
    files: ['baseline-isometric.png', 'baseline-right.png', 'revision-isometric.png', 'revision-right.png', 'baseline-server-export.zip', 'revision-server-export.zip', 'evidence-manifest.json'],
  },
  {
    id: 'featurescript',
    directory: 'trials/featurescript/runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/',
    url: 'https://cad.onshape.com/documents/086039b6f3621e6c0c73690a/w/57576582af3edd8e81d291cf/e/c1c82d07d6491f6fe419f3fe',
    featureCount: 1,
    files: ['baseline.png', 'revision.png', 'baseline.step', 'revision.step', 'baseline-measured.json', 'revision-measured.json', 'baseline-export-manifest.json', 'revision-export-manifest.json'],
    source: 'trials/featurescript/intake.fs',
  },
  {
    id: 'mcp-jarvis',
    directory: 'trials/mcp/second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/',
    url: 'https://cad.onshape.com/documents/c91dab628a4c5b87c23aa534/w/0c40bbe9087fa21610dff575/e/b5a7239c126b14bd4385f232',
    featureCount: 1,
    files: ['baseline-render-0.png', 'baseline-render-1.png', 'revision-render-0.png', 'revision-render-1.png', 'baseline-export-original.step', 'revision-export-original.step', 'baseline-validation.json', 'revision-validation.json', 'baseline-outputs.json', 'revision-outputs.json', 'intake.fs'],
  },
];

const manifest = {
  schemaVersion: 1,
  capturedOn: '2026-09-11',
  provenance: 'Byte-identical copies of selected local artifacts from authenticated Onshape trials. No new network or credential access.',
  verificationBoundary: 'Server geometry and exports checked in trial reports; hashes alone do not establish geometry or manufacturing validity.',
  workspaceLinksShow: 'revision; baseline preserved in files, not a versioned baseline workspace',
  routes: [],
};

for (const route of routes) {
  const destination = new URL(`outputs/${route.id}/`, root);
  await mkdir(destination, { recursive: true });
  const files = route.files.map(name => ({ input: `${route.directory}${name}`, name }));
  if (route.source) files.push({ input: route.source, name: 'intake.fs' });
  const records = [];
  for (const file of files) {
    const input = new URL(file.input, root);
    const output = new URL(file.name, destination);
    const bytes = await readFile(input);
    await copyFile(input, output);
    assert.deepEqual(await readFile(output), bytes);
    records.push({ path: `outputs/${route.id}/${file.name}`, original: file.input, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  manifest.routes.push({ id: route.id, onshapeUrl: route.url, visibility: 'public', featureCount: route.featureCount, solids: 9, baseline: { innerWidthMm: 340, rollerGapMm: 100 }, revision: { innerWidthMm: 360, rollerGapMm: 95 }, files: records });
}
await writeFile(new URL('outputs/manifest.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Published ${manifest.routes.reduce((total, route) => total + route.files.length, 0)} unchanged artifacts from ${routes.length} trials. No network access.`);