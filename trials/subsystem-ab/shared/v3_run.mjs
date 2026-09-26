import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const shared = dirname(fileURLToPath(import.meta.url));
const entry = process.argv[2] ?? 'v3_resume_test.py';
const allowed = new Set(['v3_roundtrip_probe.py', 'v3_source_probe.py', 'v3_brep_probe.py', 'v3_resume_test.py', 'v3_resume_report.py', 'v3_finish.py', 'v3_checks.py']);
if (!allowed.has(entry)) throw new Error('Only the named shared V3 entry points are allowed');
const bootstrap = [
  'import sys, runpy',
  'def deny_network(event, arguments):',
  '    if (event.startswith("socket.") and event != "socket.gethostname") or event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:',
  '        raise PermissionError("Local V3 run forbids " + event)',
  'sys.addaudithook(deny_network)',
  'import vtk',
  'sys.argv = sys.argv[1:]',
  'from pathlib import Path',
  'sys.path.insert(0, str(Path(sys.argv[0]).parent))',
  'runpy.run_path(sys.argv[0], run_name="__main__")',
].join('\n');
const python = resolve(shared, '../../manufacturing-package/.venv/Scripts/python.exe');
const child = spawn(python, ['-u', '-B', '-c', bootstrap, join(shared, entry), ...process.argv.slice(3)], {
  cwd: resolve(shared, '../../..'),
  detached: true,
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.stdout.pipe(createWriteStream(join(shared, 'packet-v3', entry.replace('.py', '') + '-current.stdout.log')));
child.stderr.pipe(createWriteStream(join(shared, 'packet-v3', entry.replace('.py', '') + '-current.stderr.log')));
child.on('error', error => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('close', code => { process.exitCode = code ?? 1; });