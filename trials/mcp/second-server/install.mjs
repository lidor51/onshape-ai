import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root, environment } from './discover.mjs';

const command = join(root, '../../..', '.venv/Scripts/python.exe');
const args = ['-m', 'pip', '--python', join(root, '.venv/Scripts/python.exe'), 'install', '--progress-bar', 'off',
  '--ignore-installed', 'mcp==1.26.0', 'httpx==0.28.1', 'pydantic', 'python-dotenv', 'starlette',
  'uvicorn', 'loguru', 'pillow', 'pytesseract'];
const started = performance.now();
const child = spawn(command, args, { cwd: root, env: environment(join(root, 'runs/discovery')),
  detached: true, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
child.stdout.on('data', chunk => { output += chunk; });
child.stderr.on('data', chunk => { output += chunk; });
const result = await new Promise(resolve => {
  child.on('error', error => resolve({ error: error.code }));
  child.on('exit', (code, signal) => resolve({ code, signal }));
});
await writeFile(join(root, 'install-output.txt'), output);
await writeFile(join(root, 'install-result.json'), JSON.stringify({ ...result, elapsedMs: performance.now() - started }, null, 2));
console.log(JSON.stringify(result));
process.exitCode = result.code ?? 1;