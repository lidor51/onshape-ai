import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const url = 'https://cad.onshape.com/api/openapi';
const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Public schema unavailable: HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const schema = JSON.parse(bytes);
const operationNames = new Set(['createDocument', 'createVersion', 'getDocument',
  'getPartsWMV', 'getPartStudioFeatures', 'createPartStudioExportStep',
  'getTranslation', 'downloadExternalData', 'getElementsInDocument',
  'addPartStudioFeature', 'updatePartStudioFeature', 'updateFeatures']);
const paths = {};
for (const [path, methods] of Object.entries(schema.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (operationNames.has(operation.operationId) || /eval.*featurescript/i.test(operation.operationId ?? '')) {
      paths[path] ??= {};
      paths[path][method] = operation;
    }
  }
}
const schemas = {};
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string' && value.$ref.startsWith('#/components/schemas/')) {
    const name = value.$ref.split('/').at(-1);
    if (!(name in schemas)) {
      schemas[name] = schema.components.schemas[name];
      collect(schemas[name]);
    }
  }
  for (const child of Object.values(value)) collect(child);
}
collect(paths);
const directory = join(root, 'research');
await mkdir(directory, { recursive: true });
await writeFile(join(directory, 'public-schema.json'), JSON.stringify({
  source: url, fetched_at: new Date().toISOString(), authenticated: false,
  original_sha256: createHash('sha256').update(bytes).digest('hex'),
  openapi: schema.openapi, info: schema.info, servers: schema.servers,
  paths, components: { schemas }
}, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', evidence: 'PUBLIC_SCHEMA_NOT_LIVE_CAD',
  schema_version: schema.info.version, paths: Object.keys(paths).length,
  schemas: Object.keys(schemas).length, authenticated_calls: 0 }));