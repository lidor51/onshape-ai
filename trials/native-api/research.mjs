import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const clientRevision = '4f613cc4025a90e11493e2b79560afe9762e1686';
const libraryRevision = 'a2a7b13ea823f144b20d27198043aea35a64d928';
const clientRoot = `https://raw.githubusercontent.com/onshape-public/onshape-clients/${clientRevision}/`;
const libraryRoot = `https://raw.githubusercontent.com/javawizard/onshape-std-library-mirror/${libraryRevision}/`;
const sources = [
  ...['auth/apikeys', 'auth/limits', 'api-adv/featureaccess', 'api-adv/documents', 'api-adv/partstudios', 'api-adv/translation', 'api-adv/metadata'].map(path => ({
    url: `https://onshape-public.github.io/docs/${path}/`, revision: 'Mutable official documentation; fetched body SHA-256 recorded',
  })),
  ...['openapi.json', 'README.md', 'LICENSE', 'python/README.rst', 'python/test/test_part_studios_api.py'].map(path => ({
    url: `${clientRoot}${path}`, revision: clientRevision, project: 'onshape-public/onshape-clients', license: 'MIT', archived: true,
  })),
  ...['extrude.fs', 'query.fs', 'defaultFeatures.fs', 'LICENSE.txt'].map(path => ({
    url: `${libraryRoot}${path}`, revision: libraryRevision, project: 'javawizard/onshape-std-library-mirror', license: 'MIT',
  })),
];

const schemaNames = ['BTDocumentParams', 'BTDocumentInfo', 'BTMSketch-151', 'BTMSketchCurveSegment-155', 'BTCurveGeometryLine-117',
  'BTCurveGeometryCircle-115', 'BTFeatureApiBase-1430', 'BTFeatureDefinitionCall-1406', 'BTFeatureListResponse-2457', 'BTBoundingBoxInfo',
  'BTExportModelBody-1272', 'BTExportModelFace-1363', 'BTCylinderDescription-686', 'BTVector3d-389', 'BTShadedViewsInfo'];

function fields(schema) {
  return Object.assign({}, schema?.properties, ...(schema?.allOf ?? []).filter(item => item.properties).map(item => item.properties));
}

export async function collectSources() {
  const manifest = { evidence: 'PUBLIC_DOCUMENTATION_RESEARCH_NOT_ONSHAPE_EXECUTION', fetchedAt: new Date().toISOString(), sources: [], schemaFields: {}, endpointSchemas: [] };
  for (const source of sources) {
    const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    manifest.sources.push({ ...source, status: response.status, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    if (source.url.endsWith('/openapi.json') && response.ok) {
      const spec = JSON.parse(bytes.toString('utf8'));
      manifest.schemaFields = Object.fromEntries(schemaNames.map(name => [name, {
        inheritedSchemas: (spec.components.schemas[name]?.allOf ?? []).map(item => item.$ref).filter(Boolean),
        fields: Object.fromEntries(Object.entries(fields(spec.components.schemas[name])).map(([key, value]) => [key, {
          type: value.type, reference: value.$ref, enum: value.enum,
          items: value.items && { type: value.items.type, reference: value.items.$ref, items: value.items.items },
        }])),
      }]));
      manifest.endpointSchemas = Object.entries(spec.paths).filter(([path]) => path === '/api/documents'
        || /^\/api\/partstudios.*(features|bodydetails|shadedviews)$/.test(path)
        || /^\/api\/parts.*\/boundingboxes$/.test(path)).map(([path, methods]) => ({
        path, methods: Object.fromEntries(Object.entries(methods).map(([method, details]) => [method, {
          operationId: details.operationId,
          parameters: details.parameters?.map(parameter => ({ name: parameter.name, in: parameter.in, schema: parameter.schema })),
          requestBody: details.requestBody,
          responses: details.responses,
        }])),
      }));
    }
  }
  const directory = new URL('artifacts/', import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('public-sources.json', directory), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Recorded ${manifest.sources.length} public fetches in trials/native-api/artifacts/public-sources.json.`);
  for (const source of manifest.sources.filter(source => source.status !== 200)) console.log(`Public fetch status ${source.status}: ${source.url}`);
}

if (import.meta.main) {
  if (process.argv.length !== 2) throw new Error('research.mjs accepts no arguments');
  await collectSources();
}