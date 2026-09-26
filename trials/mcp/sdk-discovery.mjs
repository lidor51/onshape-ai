import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport, DEFAULT_INHERITED_ENV_VARS } from '@modelcontextprotocol/sdk/client/stdio.js';
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import { assertOfflineCall, isolatedEnvironment, trialDirectory } from './safety.mjs';
import { featureScript, loadBenchmark, measurementScript } from './benchmark.mjs';
import { makeManifest } from './manifests.mjs';

const runtime = process.cwd();
assert.match(relative(join(trialDirectory, 'runtime'), runtime), /^discover-[a-zA-Z0-9]+$/);
const environment = isolatedEnvironment(runtime);
assert.deepEqual(Object.keys(process.env).map(key => key.toUpperCase()).sort(), Object.keys(environment).map(key => key.toUpperCase()).filter((key, index, keys) => keys.indexOf(key) === index).sort());
const binary = join(trialDirectory, 'vendor/bin/onshape-mcp.exe');
const binarySha256 = createHash('sha256').update(await readFile(binary)).digest('hex');
assert.equal(binarySha256, '424d25e13acab181da32470fb1c28faa129258998ba52979b72f693a43846472');
const artifacts = join(trialDirectory, 'artifacts');
const transcript = join(artifacts, 'transcript.jsonl');
await writeFile(transcript, '');
const started = performance.now();
const record = (direction, message) => appendFileSync(transcript, JSON.stringify({ elapsedMs: performance.now() - started, direction, message }) + '\n');
const transport = new StdioClientTransport({
  command: binary, args: ['--config', join(trialDirectory, 'offline-config.toml')],
  cwd: runtime, env: { ...Object.fromEntries(DEFAULT_INHERITED_ENV_VARS.map(key => [key, ''])), ...environment }, stderr: 'pipe',
});
let serverStderr = '';
transport.stderr.on('data', bytes => { serverStderr += bytes; });
const originalSend = transport.send.bind(transport);
transport.send = async message => { record('client->server', message); return originalSend(message); };
const originalStart = transport.start.bind(transport);
transport.start = async () => {
  const incoming = transport.onmessage;
  transport.onmessage = message => { record('server->client', message); incoming(message); };
  await originalStart();
};
const validator = new AjvJsonSchemaValidator(new Ajv2020({ strict: false, allErrors: true, validateFormats: false }));
const client = new Client({ name: 'frc-existing-mcp-offline-trial', version: '0.0.0' }, { jsonSchemaValidator: validator });
const result = { startedAt: new Date().toISOString(), binarySha256, sdkVersion: '1.26.0', status: 'started', calls: [], retries: 0, liveApiCalls: 0 };
let tools = [];
let validators;

async function call(name, args) {
  assertOfflineCall(name, args);
  const validation = validators.get(name)?.(args);
  assert.equal(validation?.valid, true, validation?.errorMessage);
  const start = performance.now();
  const response = await client.callTool({ name, arguments: args }, undefined, { timeout: 15000 });
  result.calls.push({ name, arguments: args, elapsedMs: performance.now() - start, isError: response.isError ?? false });
  assert.ok(!response.isError, JSON.stringify(response));
  return JSON.parse(response.content.find(content => content.type === 'text').text);
}

try {
  console.log('Starting hash-pinned existing Rust MCP server, credentials absent');
  await client.connect(transport, { timeout: 15000 });
  result.server = client.getServerVersion();
  result.capabilities = client.getServerCapabilities();
  let cursor;
  do {
    const page = await client.listTools(cursor ? { cursor } : undefined, { timeout: 15000 });
    tools.push(...page.tools);
    cursor = page.nextCursor;
    assert.ok(tools.length <= 100, 'Unexpected tool pagination');
  } while (cursor);
  await writeFile(join(artifacts, 'tools.json'), JSON.stringify({ server: result.server, tools }, null, 2) + '\n');
  validators = new Map(tools.map(tool => [tool.name, validator.getValidator(tool.inputSchema)]));
  result.schemasCompiled = validators.size;
  result.toolNames = tools.map(tool => tool.name);
  result.auth = await call('onshape_auth_status', { validate: false });
  assert.equal(result.auth.status, 'not_configured');
  result.negativeInputRejectedLocally = !validators.get('onshape_api_search')({ query: 7 }).valid;
  result.objectBodyRejectedLocally = !validators.get('onshape_api_call')({ endpoint: 'createDocument', body: {} }).valid;
  assert.equal(result.negativeInputRejectedLocally, true);
  assert.equal(result.objectBodyRejectedLocally, true);
  const malformed = { name: 'onshape_api_search', arguments: { query: 7 } };
  try {
    const response = await client.callTool(malformed, undefined, { timeout: 15000 });
    result.serverNegativeCheck = { isError: response.isError ?? false, response };
    assert.equal(response.isError, true);
  } catch (error) {
    if (error.code === undefined) throw error;
    result.serverNegativeCheck = { code: error.code, message: error.message };
    assert.equal(error.code, -32602);
  }
  const catalog = await call('onshape_api_search', { query: '' });
  await writeFile(join(artifacts, 'endpoints.json'), JSON.stringify(catalog, null, 2) + '\n');
  const selected = catalog.filter(endpoint => /^(createDocument|createPartStudio|createFeatureStudio|updateFeatureStudioContents|addPartStudioFeature|updatePartStudioFeature|getPartStudioFeatures|getPartsWMV|getPartStudioBodyDetails|getPartStudioBoundingBoxes|evalFeatureScript|getPartStudioShadedViews|createPartStudioExportStep|getTranslation|downloadExternalData|getDocument)$/.test(endpoint.operation_id));
  const details = [];
  for (const endpoint of selected) details.push(await call('onshape_api_explain', { endpoint: endpoint.operation_id }));
  await writeFile(join(artifacts, 'endpoint-details.json'), JSON.stringify(details, null, 2) + '\n');
  result.endpointCount = catalog.length;
  result.explainedEndpoints = selected.map(endpoint => endpoint.operation_id);
  result.featureDefinitionSchema = await call('onshape_api_schema', { schema: 'BTFeatureDefinitionCall-1406' });
  const specification = await loadBenchmark();
  result.manifestValidation = [];
  for (const revision of [false, true]) {
    const manifest = makeManifest(specification, details, revision);
    for (const planned of manifest.calls) {
      const validation = validators.get(planned.tool)?.(planned.arguments);
      assert.equal(validation?.valid, true, validation?.errorMessage);
      if (planned.tool === 'onshape_api_call') {
        const detail = details.find(detail => detail.operation_id === planned.arguments.endpoint);
        for (const parameter of detail.parameters.filter(parameter => parameter.required)) {
          const container = { path: 'path_params', query: 'query_params', header: 'header_params' }[parameter.location];
          assert.ok(planned.arguments[container]?.[parameter.name], `Missing required API parameter: ${parameter.name}`);
        }
      }
    }
    await writeFile(join(artifacts, `${manifest.phase}.json`), JSON.stringify(manifest, null, 2) + '\n');
    result.manifestValidation.push({ phase: manifest.phase, calls: manifest.calls.length, mcpInputSchemasValid: true, requiredApiParametersPresent: true, executed: false });
  }
  await writeFile(join(artifacts, 'intake.fs'), featureScript(specification));
  await writeFile(join(artifacts, 'measure.fs'), measurementScript + '\n');
  result.status = 'offline-discovery-passed';
  console.log(JSON.stringify({ status: result.status, server: result.server, tools: tools.length, endpoints: catalog.length, auth: result.auth.status }));
} catch (error) {
  result.status = 'failed';
  result.error = { message: error.message, code: error.code };
  process.exitCode = 1;
  console.error(error.message);
} finally {
  await client.close();
  result.transportClosed = transport.pid === null;
  result.elapsedMs = performance.now() - started;
  result.serverStderr = serverStderr;
  await writeFile(join(artifacts, 'discovery.json'), JSON.stringify(result, null, 2) + '\n');
}