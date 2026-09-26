import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const revision = 'cac13c6a22593bd0aff3294b2656ac171e01c6e8';
const url = `https://raw.githubusercontent.com/onshape-public/go-client/${revision}/openapi.json`;
const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Public schema HTTP ${response.status}`);
const text = await response.text();
const spec = JSON.parse(text);
function properties(schema) {
  return Object.assign({}, schema?.properties, ...(schema?.allOf ?? []).map(item =>
    properties(item.$ref ? spec.components.schemas[item.$ref.split('/').at(-1)] : item)));
}
const operations = [];
const schemas = {};
const wanted = /featurestudios|FeatureStudio|FeatureScript|^(createDocument|createVersion|createPartStudio|addPartStudioFeature|updatePartStudioFeature|getPartStudioShadedViews|createPartStudioExportStep|getTranslation|downloadExternalData|getPartsWMV)$/;
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (!wanted.test(path) && !wanted.test(operation.operationId ?? '')) continue;
    const contracts = { requestBody: operation.requestBody, responses: operation.responses };
    operations.push({ path, method, id: operation.operationId, description: operation.description, parameters: operation.parameters, ...contracts });
    for (const match of JSON.stringify(contracts).matchAll(/#\/components\/schemas\/([^" ]+)/g)) {
      schemas[match[1]] = properties(spec.components.schemas[match[1]]);
    }
  }
}
for (const key of ['BTFeatureSpec-129', 'BTMFeature-134', 'BTFeatureApiBase-1430', ...Object.keys(spec.components.schemas).filter(key => /FeatureStudio|Diagnostic|Compiler|FeatureScript.*(Response|Info)/i.test(key))]) {
  schemas[key] = properties(spec.components.schemas[key]);
}
const artifact = { evidence: 'Public documentation, not live API verification', url, revision, repositoryLicense: 'MIT', schemaDeclaredLicense: spec.info.license, fetchedAt: new Date().toISOString(), sha256: createHash('sha256').update(text).digest('hex'), apiVersion: spec.info.version, servers: spec.servers, operations, schemas };
const licenseUrl = `https://raw.githubusercontent.com/onshape-public/go-client/${revision}/LICENSE.md`;
const licenseResponse = await fetch(licenseUrl, { redirect: 'error', signal: AbortSignal.timeout(30000) });
if (!licenseResponse.ok) throw new Error(`Public license HTTP ${licenseResponse.status}`);
const license = await licenseResponse.text();
artifact.licenseSource = licenseUrl;
await mkdir(new URL('./artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('./artifacts/api-research.json', import.meta.url), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(new URL('./artifacts/upstream-license.txt', import.meta.url), license);
for (const operation of operations) console.log(`${operation.method.toUpperCase()} ${operation.path}: ${operation.id}`);
for (const name of ['BTFeatureStudioContents-2239', 'BTFeatureSpec-129', ...Object.keys(schemas).filter(key => /Diagnostic|Compiler/.test(key))]) console.log(name, JSON.stringify(schemas[name], null, 2));
console.log('Detailed schema contracts: trials/featurescript/artifacts/api-research.json');