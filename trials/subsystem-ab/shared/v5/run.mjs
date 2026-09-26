import { spawn } from 'node:child_process';
import { createWriteStream, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const entry = process.argv[2] ?? 'geometry.py';
if (entry !== 'geometry.py') throw new Error('V5 only permits its own geometry.py entry point');
const argumentsAfterEntry = process.argv.slice(3);
if (argumentsAfterEntry.some(argument => argument !== '--boundary')) throw new Error('Unknown V5 probe mode');
const logName = argumentsAfterEntry.includes('--boundary') ? 'boundary' : 'geometry';
const python = resolve(root, '../../../manufacturing-package/.venv/Scripts/python.exe');
const bootstrap = [
  'import sys, runpy',
  'def deny_network(event, arguments):',
  '    if (event.startswith("socket.") and event != "socket.gethostname") or event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:',
  '        raise PermissionError("V5 local-only run forbids " + event)',
  'sys.addaudithook(deny_network)',
  'sys.argv = sys.argv[1:]',
  'runpy.run_path(sys.argv[0], run_name="__main__")',
].join('\n');
const started = Date.now();
let timedOut = false;
const child = spawn(python, ['-I', '-u', '-B', '-c', bootstrap, join(root, entry), ...argumentsAfterEntry], {
  cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.stdout.pipe(createWriteStream(join(root, logName + '.stdout.log')));
child.stderr.pipe(createWriteStream(join(root, logName + '.stderr.log')));
const deadline = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, 600000);
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('close', (code, signal) => {
  clearTimeout(deadline);
  const result = { interpreter: python, entry, arguments: argumentsAfterEntry, started: new Date(started).toISOString(),
    seconds: (Date.now() - started) / 1000, limitSeconds: 600, timedOut, signal,
    exitCode: timedOut ? 124 : code ?? 1, networkAllowed: false, installs: 0 };
  writeFileSync(join(root, logName + '.exit.json'), JSON.stringify(result, null, 2) + '\n');
  appendFileSync(join(root, 'execution-history.jsonl'), JSON.stringify(result) + '\n');
  process.exitCode = result.exitCode;
});