import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = 'https://cad.onshape.com/api/openapi';
const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000),
  headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`PUBLIC_SCHEMA_HTTP_${response.status}`);
const text = await response.text();
const spec = JSON.parse(text);
const wanted = ['createDocument', 'getDocument', 'copyWorkspace', 'getElementsInDocument',
  'getPartStudioFeatures', 'addPartStudioFeature', 'updateFeatures', 'getPartStudioFeatureSpecs',
  'getPartStudioBodyDetails', 'getPartStudioMassProperties', 'getPartStudioBoundingBoxes', 'getSketchInfo'];
const operations = {};
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (wanted.includes(operation.operationId)) operations[operation.operationId] = { path, method, ...operation };
  }
}
const names = ['BTCopyDocumentParams', 'BTCopyDocumentInfo', 'BTDocumentParams', 'BTDocumentInfo',
  'BTFeatureDefinitionCall-1406', 'BTUpdateFeaturesCall-1748', 'BTUpdateFeaturesResponse-1333',
  'BTFeatureListResponse-2457', 'BTMFeature-134', 'BTMSketch-151', 'BTMSketchConstraint-2',
  'BTMSketchCurve-4', 'BTMSketchCurveSegment-155', 'BTCurveGeometryLine-117', 'BTCurveGeometryCircle-115',
  'BTMParameterString-149', 'BTMParameterQuantity-147', 'BTMParameterEnum-145', 'BTMParameterBoolean-144',
  'BTMParameterQueryList-148', 'BTMIndividualQuery-138', 'BTMIndividualSketchRegionQuery-140',
  'GBTConstraintType', 'BTExportModelBodiesResponse-734', 'BTMassPropertiesBulkInfo',
  'BTMassPropertiesInfo', 'BTBoundingBoxInfo'];
function includeReferences(name) {
  if (!names.includes(name)) names.push(name);
  const schema = spec.components.schemas[name];
  for (const match of JSON.stringify(schema).matchAll(/"\$ref":"#\/components\/schemas\/([^"]+)"/g)) {
    if (!names.includes(match[1])) includeReferences(match[1]);
  }
}
includeReferences('BTExportModelBodiesResponse-734');
function flatten(schema) {
  if (!schema) return null;
  const result = { ...schema, properties: { ...schema.properties } };
  for (const base of schema.allOf ?? []) {
    const inherited = base.$ref ? flatten(spec.components.schemas[base.$ref.split('/').at(-1)]) : flatten(base);
    Object.assign(result.properties, inherited?.properties);
  }
  delete result.allOf;
  return result;
}
const schemas = Object.fromEntries(names.filter(name => spec.components.schemas[name]).map(name =>
  [name, flatten(spec.components.schemas[name])]));
const directory = new URL('./sources/', import.meta.url);
mkdirSync(directory, { recursive: true });
const output = { source: url, fetchedAt: new Date().toISOString(), authentication: 'none',
  sha256: createHash('sha256').update(text).digest('hex'), apiVersion: spec.info.version,
  license: spec.info.license, servers: spec.servers, operations, schemas,
  missingSchemas: names.filter(name => !spec.components.schemas[name]),
  relatedSchemaNames: Object.keys(spec.components.schemas).filter(name => /BodyDetails|Surface|MassProperties|SketchInfo/.test(name)) };
writeFileSync(new URL('openapi-contract.json', directory), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ apiVersion: output.apiVersion, operations: Object.keys(operations),
  schemas: Object.keys(schemas).length, missing: output.missingSchemas, authenticatedCalls: 0 }));