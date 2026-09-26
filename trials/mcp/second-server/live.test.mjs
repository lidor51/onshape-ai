import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { argumentsForLive, decode, parseToolText } from './live.mjs';
import { environment } from './discover.mjs';

test('requires explicit public authorization and limits stages', () => {
  assert.throws(() => argumentsForLive([]));
  assert.throws(() => argumentsForLive(['--live', '--confirm-new-private-document']));
  assert.throws(() => argumentsForLive(['--live', '--confirm-new-public-document', '--stage', 'delete']));
  assert.equal(argumentsForLive(['--live', '--confirm-new-public-document']), 'build');
});
test('child environment excludes unrelated credentials and disables dotenv search', () => {
  const env = environment('trial');
  assert.equal(env.PYTHON_DOTENV_DISABLED, '1');
  assert.ok(!Object.keys(env).some(key => /KEY|SECRET|TOKEN|PROXY/.test(key)));
});
test('decodes server FeatureScript typed maps', () => {
  assert.deepEqual(decode({ type: 'map', value: [{ key: { type: 'string', value: 'solidCount' }, value: { type: 'number', value: 9 } }] }), { solidCount: 9 });
});
test('decodes the real Jarvis response wrapper and Onshape btType encoding', () => {
  const payload = { result: { btType: 'com.belmonttech.serialize.fsvalue.BTFSValueMap', value: [
    { key: { btType: 'com.belmonttech.serialize.fsvalue.BTFSValueString', value: 'solidCount' }, value: { btType: 'com.belmonttech.serialize.fsvalue.BTFSValueNumber', value: 9 } },
  ] } };
  assert.deepEqual(decode(parseToolText(`FeatureScript result:\n${JSON.stringify(payload)}`)), { result: { solidCount: 9 } });
});

test('translation hook refreshes current state before persisting translation IDs', async () => {
  const source = await readFile(new URL('./launch.py', import.meta.url), 'utf8');
  const hook = source.slice(source.indexOf('if response.is_success and response.request.method == "POST" and path.endswith("/translations")'));
  assert.ok(hook.indexOf('state.update(json.loads(state_path.read_text()))') > 0);
  assert.ok(hook.indexOf('state.update(json.loads(state_path.read_text()))') < hook.indexOf('state["translations"]'));
});