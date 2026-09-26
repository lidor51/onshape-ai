import { spawnSync } from 'node:child_process';
import { writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const files = (await readdir(root)).filter(file => file.endsWith('.test.mjs')).map(file => join(root, file));
const started = performance.now();
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { encoding: 'utf8' });
await writeFile(join(root, 'verification.tap'), result.stdout + result.stderr);
const verification = { status: result.status === 0 ? 'PASS' : 'FAIL', exitCode: result.status,
  elapsedMs: performance.now() - started, testFiles: files.map(file => file.slice(root.length + 1)),
  tests: Number(result.stdout.match(/^# tests (\d+)$/m)?.[1] ?? 0),
  passed: Number(result.stdout.match(/^# pass (\d+)$/m)?.[1] ?? 0),
  failed: Number(result.stdout.match(/^# fail (\d+)$/m)?.[1] ?? 0) };
await writeFile(join(root, 'verification.json'), JSON.stringify(verification, null, 2) + '\n');
console.log(JSON.stringify(verification));
process.exitCode = result.status ?? 1;