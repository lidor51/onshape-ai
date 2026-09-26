import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedOrigin, assertLiveArguments, assertLiveExecutable, assertOrigin, releaseSha256, runPreflight } from './live-preflight.mjs';

test('both explicit approvals are required; duplicate and unknown flags fail closed', () => {
  assert.doesNotThrow(() => assertLiveArguments(['--live', '--confirm-new-private-document']));
  assert.doesNotThrow(() => assertLiveArguments(['--confirm-new-private-document', '--live']));
  for (const args of [[], ['--live'], ['--confirm-new-private-document'], ['--live', '--live'], ['--live', '--confirm-new-private-document', '--override']]) {
    assert.throws(() => assertLiveArguments(args), { code: 'LIVE_FLAGS_REQUIRED' });
  }
});

test('origin guard rejects lookalikes, credentials, paths, ports and non-HTTPS', () => {
  assert.doesNotThrow(() => assertOrigin(allowedOrigin));
  for (const origin of ['http://cad.onshape.com', 'https://cad.onshape.com.other.invalid', 'https://cad.onshape.com@other.invalid', 'https://cad.onshape.com:443', 'https://cad.onshape.com/', 'https://cad.onshape.com/api/v16', undefined]) {
    assert.throws(() => assertOrigin(origin), { code: 'ORIGIN_REJECTED' });
  }
});

test('neither the unsafe release nor a substitute hash can enable live execution', () => {
  assert.throws(() => assertLiveExecutable(releaseSha256), { code: 'BLOCKED_RELEASE_REDIRECT_POLICY' });
  assert.throws(() => assertLiveExecutable('0'.repeat(64)), { code: 'UNREVIEWED_EXECUTABLE' });
});

test('rejected arguments are not reflected into observations', async () => {
  const canary = 'synthetic-private-canary';
  const result = await runPreflight(['--live', '--confirm-new-private-document', canary]);
  assert.equal(result.error.code, 'LIVE_FLAGS_REQUIRED');
  assert.equal(JSON.stringify(result).includes(canary), false);
  assert.equal(result.binarySha256, undefined);
});

test('actual pinned executable is refused even with the edited transport source present', async () => {
  const result = await runPreflight(['--live', '--confirm-new-private-document']);
  assert.equal(result.binarySha256, releaseSha256);
  assert.equal(result.error.code, 'BLOCKED_RELEASE_REDIRECT_POLICY');
  assert.equal(result.credentialsLoaded, false);
  assert.equal(result.credentialConfigurationRead, false);
  assert.equal(result.serverLaunched, false);
  assert.equal(result.sourcePatchCompiled, false);
  assert.equal(result.mcpToolCalls, 0);
  assert.equal(result.onshapeHttpRequests, 0);
  assert.equal(result.newDocuments, 0);
  assert.equal(result.cadElapsedMs, null);
  assert.match(result.geometrySourceSha256, /^[a-f0-9]{64}$/);
});