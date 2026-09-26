import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertOfflineArguments, isolatedEnvironment, trialDirectory } from './safety.mjs';

assertOfflineArguments(process.argv.slice(2));
await mkdir(join(trialDirectory, 'runtime'), { recursive: true });
await mkdir(join(trialDirectory, 'artifacts'), { recursive: true });
const runtime = await mkdtemp(join(trialDirectory, 'runtime/discover-'));
const environment = isolatedEnvironment(runtime);
for (const path of new Set([environment.TEMP, environment.APPDATA, environment.LOCALAPPDATA])) {
  await mkdir(path, { recursive: true });
}
const startedAt = new Date().toISOString();
const start = performance.now();
const worker = spawn(process.execPath, [join(trialDirectory, 'sdk-discovery.mjs')], {
  env: environment, cwd: runtime, stdio: ['ignore', 'pipe', 'pipe'], shell: false,
});
let stdout = '';
let stderr = '';
worker.stdout.on('data', bytes => { stdout += bytes; process.stdout.write(bytes); });
worker.stderr.on('data', bytes => { stderr += bytes; process.stderr.write(bytes); });
const exit = await new Promise((resolve, reject) => {
  worker.on('error', reject);
  worker.on('close', (code, signal) => resolve({ code, signal }));
});
await writeFile(join(trialDirectory, 'artifacts/subprocess.json'), JSON.stringify({
  command: 'node trials/mcp/discover.mjs -> isolated node sdk-discovery.mjs',
  startedAt, elapsedMs: performance.now() - start, ...exit, stdout, stderr,
  environmentKeys: Object.keys(environment).sort(), credentialsProvided: false,
}, null, 2) + '\n');
process.exitCode = exit.code ?? 1;