import { spawn } from 'node:child_process';
import { appendFileSync, createWriteStream, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const entry = process.argv[2] ?? 'test_layout.py';
const allowed = new Set(['test_layout.py', 'build.py', 'validate.py', 'packet.py', 'probe.py']);
if (!allowed.has(entry)) throw new Error('Only local V4 entry points are allowed');
const bootstrap = [
  'import sys, runpy',
  'def deny_network(event, arguments):',
  '    if (event.startswith("socket.") and event != "socket.gethostname") or event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:',
  '        raise PermissionError("Local V4 run forbids " + event)',
  'sys.addaudithook(deny_network)',
  'import vtk',
  'sys.argv = sys.argv[1:]',
  'from pathlib import Path',
  'sys.path.insert(0, str(Path(sys.argv[0]).parent))',
  'runpy.run_path(sys.argv[0], run_name="__main__")',
].join('\n');
const python = resolve(root, '../../../manufacturing-package/.venv/Scripts/python.exe');
const started = new Date();
let timedOut = false;
const child = spawn(python, ['-u', '-B', '-c', bootstrap, join(root, entry), ...process.argv.slice(3)], {
  cwd: resolve(root, '../../../..'), detached: true, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.stdout.pipe(createWriteStream(join(root, entry.replace('.py', '') + '.stdout.log')));
child.stderr.pipe(createWriteStream(join(root, entry.replace('.py', '') + '.stderr.log')));
const wallLimitMs = entry === 'probe.py' ? 300000 : 600000;
const deadline = setTimeout(() => {
  timedOut = true;
  child.kill('SIGKILL');
}, wallLimitMs);
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('close', (code, signal) => {
  clearTimeout(deadline);
  const result = { entry, args: process.argv.slice(3), interpreter: python, started: started.toISOString(), ended: new Date().toISOString(), wallSeconds: (Date.now() - started.getTime()) / 1000, wallLimitMs, timedOut, signal, exitCode: timedOut ? 124 : code ?? 1 };
  writeFileSync(join(root, entry.replace('.py', '') + '.exit.json'), JSON.stringify(result, null, 2) + '\n');
  appendFileSync(join(root, 'execution-history.jsonl'), JSON.stringify(result) + '\n');
  process.exitCode = result.exitCode;
});