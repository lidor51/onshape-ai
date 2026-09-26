import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import { connect, root } from './discover.mjs';
import { measurementScript, validateMeasurements } from './measure.mjs';
import { collectOutputs } from './outputs.mjs';

export function argumentsForLive(args) {
  assert.equal(args[0], '--live');
  assert.equal(args[1], '--confirm-new-public-document');
  assert.ok(args.length === 2 || (args.length === 4 && args[2] === '--stage' && ['build', 'measure', 'revise', 'output'].includes(args[3])));
  return args[3] ?? 'build';
}
export function decode(value) {
  if (Array.isArray(value)) return value.map(decode);
  if (!value || typeof value !== 'object') return value;
  if ((value.type === 'map' || value.btType?.endsWith('.BTFSValueMap')) && Array.isArray(value.value)) return Object.fromEntries(value.value.map(entry => [decode(entry.key), decode(entry.value)]));
  if ((value.type || value.btType?.includes('BTFSValue')) && Object.hasOwn(value, 'value')) return decode(value.value);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]));
}
export function parseToolText(text) {
  const json = text.startsWith('FeatureScript result:\n') ? text.slice('FeatureScript result:\n'.length) : text;
  try { return JSON.parse(json); } catch { return { text }; }
}

async function main() {
  const stage = argumentsForLive(process.argv.slice(2));
  const env = parseEnv(await readFile(join(root, '../../../.env.local'), 'utf8'));
  const access = env.ONSHAPE_ACCESS_KEY || env.ONSHAPE_API_KEY;
  const secret = env.ONSHAPE_SECRET_KEY || env.ONSHAPE_API_SECRET;
  assert.ok(access && secret, 'KEYS_NOT_CONFIGURED');
  const secrets = [access, secret, Buffer.from(`${access}:${secret}`).toString('base64')];
  function clean(value) {
    if (typeof value === 'string') return secrets.reduce((text, key) => text.split(key).join('[REDACTED]'), value);
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !/authorization|headers|cookie|token|secret|access.?key/i.test(key)).map(([key, item]) => [key, clean(item)]));
    return value;
  }
  let run;
  try { run = join(root, 'runs', JSON.parse(await readFile(join(root, 'active-run.json'))).run); }
  catch { run = join(root, 'runs', `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID().slice(0, 8)}`); }
  await mkdir(run, { recursive: true });
  await writeFile(join(root, 'active-run.json'), JSON.stringify({ run: basename(run) }));
  const invocation = `${stage}-${Date.now()}`;
  const started = performance.now();
  const observations = { stage, startedAt: new Date().toISOString(), status: 'RUNNING', calls: [], route: 'community MCP+FS' };
  const save = (name, data) => writeFile(join(run, name), JSON.stringify(clean(data), null, 2) + '\n');
  let client;
  try {
    ({ client } = await connect(run, { TRIAL_LIVE: 'yes', ONSHAPE_ACCESS_KEY: access, ONSHAPE_SECRET_KEY: secret }));
    const tools = await client.listTools();
    const schemas = new Map(tools.tools.map(tool => [tool.name, tool.inputSchema]));
    await save('discovery.json', { server: client.getServerVersion(), tools: tools.tools });
    async function call(name, args, label) {
      assert.ok(schemas.has(name), 'TOOL_NOT_DISCOVERED');
      for (const required of schemas.get(name).required ?? []) assert.ok(Object.hasOwn(args, required), `Missing ${required}`);
      const callStarted = performance.now();
      const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 240000 });
      const text = result.content.filter(item => item.type === 'text').map(item => item.text).join('\n');
      const data = parseToolText(text);
      observations.calls.push({ tool: name, label, elapsedMs: performance.now() - callStarted, isError: result.isError ?? false });
      await save(`${label}.json`, data);
      let image = 0;
      for (const item of result.content.filter(item => item.type === 'image')) {
        const bytes = Buffer.from(item.data, 'base64');
        assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        await writeFile(join(run, `${label}-${image++}.png`), bytes);
      }
      await save(`${invocation}-summary.json`, observations);
      assert.ok(!result.isError && data.ok !== false, `TOOL_FAILED_${label}`);
      return data;
    }
    let state = {};
    try { state = JSON.parse(await readFile(join(run, 'state.json'))); } catch {}
    if (!state.documentId) {
      assert.equal(stage, 'build');
      const created = await call('create_document', { name: `Synthetic intake MCP ${basename(run)}`, isPublic: true,
        description: 'Public synthetic FRC intake packaging PoC only. Not a robot design release.' }, 'create');
      state = JSON.parse(await readFile(join(run, 'state.json')));
      assert.equal(state.public, true);
      assert.equal(created.document_id, state.documentId);
      state.workspaceId = created.workspace_id;
      state.elementId = created.part_studio_id;
      assert.ok(state.workspaceId && state.elementId, 'MISSING_CREATED_IDS');
      await save('state.json', state);
    }
    assert.equal(state.public, true);
    const ids = { documentId: state.documentId, workspaceId: state.workspaceId, elementId: state.elementId };
    observations.documentUrl = `https://cad.onshape.com/documents/${state.documentId}/w/${state.workspaceId}/e/${state.elementId}`;
    if (stage === 'build') {
      assert.ok(!state.featureId && !state.buildAttempted, 'BUILD_ALREADY_ATTEMPTED');
      state.buildAttempted = true;
      await save('state.json', state);
      const source = (await readFile(join(root, '../artifacts/intake.fs'), 'utf8')).replaceAll('2144', '2931');
      await writeFile(join(run, 'intake.fs'), source);
      const built = await call('write_featurescript_feature', { ...ids, featureType: 'coralIntake', featureScript: source,
        featureName: 'Synthetic coral intake', fsElementName: 'Independent MCP intake source',
        parameters: [{ id: 'innerWidth', type: 'quantity', value: '340 mm' }, { id: 'rollerGap', type: 'quantity', value: '100 mm' }] }, 'build');
      assert.ok(built.feature_id && built.ok === true, 'BUILD_NOT_CONFIRMED');
      state.featureId = built.feature_id;
      state.fsElementId = built.fs_element_id;
      await save('state.json', state);
    }
    if (stage === 'revise') {
      assert.ok(state.featureId && !state.revisionAttempted, 'REVISION_NOT_AUTHORIZED');
      for (const gate of ['baseline-validation.json', 'baseline-outputs.json']) {
        assert.equal(JSON.parse(await readFile(join(run, gate), 'utf8')).status, 'PASS', `BASELINE_GATE_${gate}`);
      }
      state.revisionAttempted = true;
      await save('state.json', state);
      const revised = await call('update_feature', { ...ids, featureId: state.featureId,
        updates: [{ parameterId: 'innerWidth', expression: '360 mm' }, { parameterId: 'rollerGap', expression: '95 mm' }] }, 'revision-update');
      assert.equal(revised.feature_id, state.featureId);
      assert.equal(revised.ok, true);
      state.revised = true;
      await save('state.json', state);
    }
    const phase = state.revised ? 'revision' : 'baseline';
    if (stage !== 'output') {
      await call('get_features', ids, `${phase}-features`);
      const measured = await call('eval_featurescript', { ...ids, script: measurementScript }, `${phase}-measurements`);
      const decoded = decode(measured).result;
      await save(`${phase}-decoded.json`, decoded);
      const expected = JSON.parse(await readFile(join(root, `../artifacts/${phase}.json`), 'utf8')).expected;
      await save(`${phase}-expected.json`, expected);
      await save(`${phase}-validation.json`, validateMeasurements(decoded, expected));
      await call('get_body_details', ids, `${phase}-body-details`);
    }
    if (stage === 'output') {
      await call('render_part_studio_views', { ...ids, views: ['iso', 'right'], width: 1200, height: 900, edges: true }, `${phase}-render`);
      await call('export_part_studio', { ...ids, format: 'STEP' }, `${phase}-export`);
      observations.outputs = await collectOutputs(run, phase);
    }
    observations.status = 'PASS';
  } catch (error) {
    observations.status = 'FAILED';
    observations.error = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    process.exitCode = 1;
  } finally {
    observations.elapsedMs = performance.now() - started;
    await save(`${invocation}-summary.json`, observations);
    await save('latest-summary.json', observations);
    try { await client?.close(); } catch { observations.closeStatus = 'CLOSE_ERROR'; }
    console.log(JSON.stringify(clean({ run: basename(run), ...observations })));
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase()) {
  main().catch(() => { console.log('LIVE_RUN_FAILED_BEFORE_CONNECTION'); process.exitCode = 1; });
}