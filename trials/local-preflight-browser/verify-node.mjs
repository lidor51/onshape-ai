import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encode, prepare, root } from './generate.mjs';

const started = performance.now();
const preparation = prepare();
const testFiles = ['gate.test.mjs', 'generate.test.mjs', 'admission.test.mjs', 'preflight.test.mjs'];
const environment = Object.fromEntries(['SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP'].filter(name => process.env[name]).map(name => [name, process.env[name]]));
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...testFiles.map(name => join(root, name))], { cwd: root, env: environment, encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
writeFileSync(join(root, 'artifacts/node-tests.tap'), result.stdout ?? 'No test output');
const count = Number(result.stdout?.match(/^# tests (\d+)$/m)?.[1] ?? 0);
const report = {
  status: result.status === 0 && count === 15 ? 'PASS' : 'FAIL',
  tests: count, exitCode: result.status,
  command: 'node --test --test-reporter=tap gate.test.mjs generate.test.mjs admission.test.mjs preflight.test.mjs',
  nodeVersion: process.version,
  scope: 'Node parameter/source contracts, policy admission, stub gate and artifact tamper checks ONLY',
  sourcePrepared: preparation.status,
  wallTimeMs: performance.now() - started,
  networkRequestsByRunner: 0, directOnshapeApiCalls: 0,
  pythonExecuted: false, browserInvocations: 0,
};
const summaryPath = join(root, 'artifacts/preflight-summary.json');
report.geometry = { status: 'NOT_RUN', previousRecordedStatus: existsSync(summaryPath) ? JSON.parse(readFileSync(summaryPath)).status : 'MISSING', reason: 'Node-only verification never overwrites kernel reports; run preflight.mjs and audit.mjs to validate current geometry and hashes' };
writeFileSync(join(root, 'artifacts/node-tests.json'), encode(report));
console.log(encode(report));
if (report.status !== 'PASS') process.exitCode = 1;