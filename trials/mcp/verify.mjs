import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { assertOfflineArguments, isolatedEnvironment, trialDirectory } from './safety.mjs';

assertOfflineArguments(process.argv.slice(2));
await mkdir(join(trialDirectory, 'runtime'), { recursive: true });
const runtime = await mkdtemp(join(trialDirectory, 'runtime/verify-'));
const environment = isolatedEnvironment(runtime);
for (const path of new Set([environment.TEMP, environment.APPDATA, environment.LOCALAPPDATA])) await mkdir(path, { recursive: true });
const results = { startedAt: new Date().toISOString(), commands: [] };

async function execute(label, args) {
  const start = performance.now();
  const child = spawn(process.execPath, args, { cwd: trialDirectory, env: environment, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', bytes => { stdout += bytes; });
  child.stderr.on('data', bytes => { stderr += bytes; });
  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => resolve(code));
  });
  const result = { command: label, exitCode, stdout, stderr, elapsedMs: performance.now() - start };
  results.commands.push(result);
  return result;
}

console.log('Running trial tests in an isolated environment');
const tests = await execute('node --test benchmark.test.mjs safety.test.mjs manifests.test.mjs evidence.test.mjs', ['--test', 'benchmark.test.mjs', 'safety.test.mjs', 'manifests.test.mjs', 'evidence.test.mjs']);
console.log(tests.stdout);
if (tests.stderr) console.error(tests.stderr);
const config = join(runtime, 'empty-user.npmrc');
const globalConfig = join(runtime, 'empty-global.npmrc');
await writeFile(config, '');
await writeFile(globalConfig, '');
console.log('Auditing the locked public dependency graph');
const audit = await execute('npm audit --json --ignore-scripts (isolated config/cache)', [
  join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), 'audit', '--json', '--ignore-scripts',
  '--registry=https://registry.npmjs.org', `--cache=${join(trialDirectory, '.npm-cache')}`,
  `--userconfig=${config}`, `--globalconfig=${globalConfig}`,
]);
try {
  const parsed = JSON.parse(audit.stdout);
  await writeFile(join(trialDirectory, 'artifacts/audit.json'), JSON.stringify(parsed, null, 2) + '\n');
  results.audit = parsed.metadata?.vulnerabilities ?? parsed.error;
  console.log(JSON.stringify({ auditExitCode: audit.exitCode, vulnerabilities: results.audit }));
} catch {
  results.audit = { error: 'Audit did not return JSON', exitCode: audit.exitCode };
}
const transcript = (await readFile(join(trialDirectory, 'artifacts/transcript.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line));
results.protocol = {
  requests: transcript.filter(entry => entry.direction === 'client->server' && entry.message.id !== undefined).length,
  notifications: transcript.filter(entry => entry.direction === 'client->server' && entry.message.id === undefined).length,
  toolCalls: transcript.filter(entry => entry.direction === 'client->server' && entry.message.method === 'tools/call').length,
  negotiatedVersion: transcript.find(entry => entry.direction === 'server->client' && entry.message.result?.protocolVersion)?.message.result.protocolVersion,
};
console.log(JSON.stringify(results.protocol));
await writeFile(join(trialDirectory, 'artifacts/verification.json'), JSON.stringify(results, null, 2) + '\n');
process.exitCode = tests.exitCode ?? 1;