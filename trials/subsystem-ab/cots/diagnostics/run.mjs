import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, '../../../..');
const bootstrap = [
  'import sys, runpy',
  'def deny_network(event, arguments):',
  '    if (event.startswith("socket.") and event != "socket.gethostname") or event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:',
  '        raise PermissionError("Local diagnostic forbids " + event)',
  'sys.addaudithook(deny_network)',
  'import vtk',
  'sys.argv = sys.argv[1:]',
  'runpy.run_path(sys.argv[0], run_name="__main__")',
].join('\n');
const child = spawn(resolve(root, 'trials/manufacturing-package/.venv/Scripts/python.exe'),
  ['-u', '-B', '-c', bootstrap, resolve(directory, 'roundtrip.py'), ...process.argv.slice(2)],
  { cwd: root, windowsHide: true, stdio: 'inherit', timeout: 600_000 });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('close', (code, signal) => {
  if (signal) console.error(`Diagnostic terminated with ${signal}; process cap is 600 seconds.`);
  process.exitCode = code ?? 1;
});