import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readArtifact = async name => JSON.parse(await readFile(new URL(`./artifacts/${name}`, import.meta.url)));
const discovery = await readArtifact('discovery.json');
const transcript = (await readFile(new URL('./artifacts/transcript.jsonl', import.meta.url), 'utf8')).trim().split('\n').map(line => JSON.parse(line));

test('actual transcript contains a completed SDK initialization and tool discovery', () => {
  const initialize = transcript.find(entry => entry.direction === 'client->server' && entry.message.method === 'initialize');
  assert.ok(initialize);
  const response = transcript.find(entry => entry.direction === 'server->client' && entry.message.id === initialize.message.id);
  assert.deepEqual(response.message.result.serverInfo, { name: 'onshape-mcp', version: '0.5.2' });
  assert.ok(response.message.result.protocolVersion);
  assert.ok(transcript.some(entry => entry.message.method === 'notifications/initialized'));
  assert.ok(transcript.some(entry => entry.message.method === 'tools/list'));
  assert.equal(discovery.schemasCompiled, 11);
  assert.equal(discovery.transportClosed, true);
});

test('actual outbound transcript contains no live tools, authentication or screenshot calls', () => {
  const calls = transcript.filter(entry => entry.direction === 'client->server' && entry.message.method === 'tools/call');
  assert.ok(calls.length > 0);
  for (const call of calls) {
    assert.ok(['onshape_auth_status', 'onshape_api_search', 'onshape_api_explain', 'onshape_api_schema'].includes(call.message.params.name));
    if (call.message.params.name === 'onshape_auth_status') assert.equal(call.message.params.arguments.validate, false);
  }
  assert.equal(discovery.auth.status, 'not_configured');
  assert.equal(discovery.status, 'offline-discovery-passed');
  assert.equal(discovery.negativeInputRejectedLocally, true);
  assert.equal(discovery.objectBodyRejectedLocally, true);
  assert.equal(discovery.serverNegativeCheck.isError, true);
});

test('both materialized manifests passed real tool-schema validation and remain unexecuted', () => {
  assert.equal(discovery.manifestValidation.length, 2);
  for (const result of discovery.manifestValidation) {
    assert.equal(result.mcpInputSchemasValid, true);
    assert.equal(result.requiredApiParametersPresent, true);
    assert.equal(result.executed, false);
  }
});