import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { assertOfflineArguments, assertOfflineCall, isolatedEnvironment } from './safety.mjs';

test('subprocess environment excludes credentials, proxies, injection and original profiles', () => {
  const environment = isolatedEnvironment('trials/mcp/runtime/test', {
    SystemRoot: 'C:\\Windows',
    ONSHAPE_MCP_AUTH__ACCESS_KEY: 'CANARY',
    ONSHAPE_SECRET_KEY: 'CANARY',
    GITHUB_TOKEN: 'CANARY',
    NODE_OPTIONS: 'CANARY',
    HTTPS_PROXY: 'CANARY',
    PATH: 'CANARY',
    APPDATA: 'CANARY',
    LOCALAPPDATA: 'CANARY',
    HOME: 'CANARY',
    XDG_DATA_HOME: 'CANARY',
  });
  assert.ok(!JSON.stringify(environment).includes('CANARY'));
  assert.equal(environment.HOME, resolve('trials/mcp/runtime/test'));
  assert.ok(environment.XDG_CONFIG_HOME.startsWith(environment.HOME));
  assert.ok(environment.XDG_DATA_HOME.startsWith(environment.HOME));
});

test('only offline metadata tools can be called', () => {
  assertOfflineCall('onshape_auth_status', { validate: false });
  assertOfflineCall('onshape_api_search', { query: 'shaded' });
  for (const name of ['onshape_api_call', 'onshape_auth_login', 'onshape_screenshot']) {
    assert.throws(() => assertOfflineCall(name, {}), /rejects tool/);
  }
  assert.throws(() => assertOfflineCall('onshape_auth_status', {}), /validate:false/);
  assert.throws(() => assertOfflineCall('onshape_auth_status', { validate: true }), /validate:false/);
});

test('live access and arbitrary hosts are rejected before execution', () => {
  assertOfflineArguments([]);
  for (const args of [['--live'], ['--host', 'https://example.com'], ['--env-file', '.env.local']]) {
    assert.throws(() => assertOfflineArguments(args), /no flags/);
  }
});