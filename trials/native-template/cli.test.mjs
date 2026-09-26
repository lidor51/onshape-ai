import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { main, parseOptions, HELP } from './run.mjs';

test('offline is the default; documented setup/copy live flags parse and help executes', async () => {
  assert.equal(parseOptions([]).live, false);
  for (const phase of ['setup', 'copy', 'simulated-editor', 'revision', 'validation']) {
    assert.equal(parseOptions(['--live', '--phase', phase]).phase, phase);
  }
  for (const flag of ['--rotation-confirmation', '--current-key-acknowledgment', '--approved-origin', '--new-public', '--reserve-native', '--reserve-manufacturing', '--reserve-official']) {
    assert.ok(HELP.includes(flag));
  }
  const output = spawnSync(process.execPath, [fileURLToPath(new URL('./run.mjs', import.meta.url)), '--help'], { encoding: 'utf8' });
  assert.equal(output.status, 0);
  assert.ok(output.stdout.includes('setup|copy|simulated-editor|revision|validation'));
  await assert.rejects(main(['--live', '--phase', 'setup']), /EXPLICIT_CREDENTIAL_AUTHORIZATION_REQUIRED/);
  assert.throws(() => parseOptions(['--live', '--offline']), /CONFLICTING/);
  assert.throws(() => parseOptions(['--allow-delete']));
});