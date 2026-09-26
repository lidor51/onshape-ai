import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { deployWorkflow, loadLiveCredentials, main, normalizeSource, parseMode, resolveLiveConfiguration, revisionCall } from './deploy.mjs';
import { featureCall } from './generate.mjs';

const benchmark = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));

test('saved source accepts only CRLF normalization, not changed code or whitespace', () => {
  assert.equal(normalizeSource('first\r\nsecond\r\n'), 'first\nsecond\n');
  assert.notEqual(normalizeSource('first \r\nsecond'), normalizeSource('first\nsecond'));
});

test('live configuration validates the selected base URL without exposing its value', () => {
  const local = { ONSHAPE_ACCESS_KEY: 'synthetic-access', ONSHAPE_SECRET_KEY: 'synthetic-secret' };
  assert.equal(resolveLiveConfiguration(local, {}).origin, 'https://cad.onshape.com');
  assert.equal(resolveLiveConfiguration({ ...local, ONSHAPE_BASE_URL: 'https://cad.onshape.com' }, {}).origin, 'https://cad.onshape.com');
  for (const target of ['https://enterprise.example', 'http://cad.onshape.com', 'https://user:synthetic-sensitive@cad.onshape.com', 'synthetic-sensitive']) {
    for (const [config, environment] of [[{ ...local, ONSHAPE_BASE_URL: target }, {}], [local, { ONSHAPE_BASE_URL: target }]]) {
      assert.throws(() => resolveLiveConfiguration(config, environment), error => {
        assert.equal(error.message, 'Configured ONSHAPE_BASE_URL must be https://cad.onshape.com; no request sent');
        return true;
      });
    }
  }
});

test('offline mode never invokes credential loader or transport', async () => {
  const forbidden = () => { throw new Error('Offline access violation'); };
  for (const argv of [[], ['--help']]) {
    const result = await main(argv, { loadCredentials: forbidden, fetchImpl: forbidden });
    assert.equal(result.credentialsLoaded, false);
    assert.equal(result.networkRequests, 0);
    assert.equal(result.status, 'NOT_RUN');
  }
});

test('explicit flags required; existing document, public, delete, and arbitrary host flags rejected', async () => {
  assert.equal(parseMode(['--live', '--confirm-private']), 'live');
  assert.equal(parseMode(['--live', '--confirm-public']), 'live-public');
  assert.throws(() => parseMode(['--live', '--confirm-private', '--confirm-public']));
  assert.throws(() => parseMode(['--confirm-public']));
  for (const argv of [['--live'], ['--confirm-private'], ['--live', '--live'], ['--live', '--confirm-private', '--document', 'existing'], ['--public'], ['--delete'], ['--host', 'https://attacker.test']]) assert.throws(() => parseMode(argv));
  await assert.rejects(loadLiveCredentials('offline'), /explicit live/);
});

test('revision modifies only expressions on the same server-returned feature', () => {
  const baseline = featureCall(benchmark, 'baseline', 'synthetic-pinned-namespace', 'synthetic_feature').feature;
  baseline.nodeId = 'synthetic-node';
  baseline.parameters[0].nodeId = 'width-node';
  const revision = revisionCall(baseline, benchmark, baseline.namespace).feature;
  assert.equal(baseline.parameters[0].expression, '340 mm');
  assert.deepEqual(revision.parameters.map(parameter => parameter.expression), ['360 mm', '95 mm']);
  const restored = structuredClone(revision);
  restored.parameters.forEach((parameter, index) => { parameter.expression = baseline.parameters[index].expression; });
  assert.deepEqual(restored, baseline);
  assert.throws(() => revisionCall(baseline, benchmark, 'different-namespace'));
});

test('lexical workflow contract separates compilation from parameter-only revision', async () => {
  const source = await readFile(new URL('./deploy.mjs', import.meta.url), 'utf8');
  const workflow = source.slice(source.indexOf('export async function deployWorkflow'), source.indexOf('export async function main'));
  assert.equal((workflow.match(/createPrivateDocument\(/g) ?? []).length, 1);
  assert.equal((workflow.match(/client.request\('POST', sourcePath/g) ?? []).length, 1);
  const revision = workflow.slice(workflow.indexOf("if (variant === 'baseline')"));
  assert.doesNotMatch(revision, /sourcePath|createPrivateDocument|\/featurestudios/);
  assert.match(revision, /features\/featureid\/\$\{featureId\}/);
});

test('synthetic workflow only: missing exported feature stops before version or insertion', async () => {
  const did = '1'.repeat(24);
  const wid = '2'.repeat(24);
  const sourceId = '3'.repeat(24);
  const calls = [];
  let uploaded = false;
  const progress = {};
  const fake = {
    createPrivateDocument: async () => ({ did, wid }),
    request: async (method, path, body) => {
      calls.push({ method, path });
      if (path.endsWith('/featurespecs')) return { featureSpecs: [] };
      if (path === `/featurestudios/d/${did}/w/${wid}`) return { id: sourceId };
      if (method === 'POST') { uploaded = true; return { contents: body.contents }; }
      return { contents: uploaded ? 'synthetic-source' : '', sourceMicroversion: 'synthetic-microversion', serializationVersion: 'synthetic-serialization' };
    },
  };
  await assert.rejects(deployWorkflow(fake, benchmark, 'synthetic-source', async () => {}, progress), /exported coralGroundIntake/);
  assert.equal(progress.stage, 'source-upload-and-spec-check');
  assert.ok(calls.every(call => call.path.startsWith('/featurestudios/')));
});