import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encode, root } from './generate.mjs';

const executable = join(root, '.venv', 'Scripts', 'python.exe');
const environment = Object.fromEntries(['SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP'].filter(name => process.env[name]).map(name => [name, process.env[name]]));
const mode = process.argv[2] ?? 'probe';
const commands = {
  'install-casadi': ['-I', '-m', 'pip', '--isolated', '--disable-pip-version-check', 'install', '--no-input', '--progress-bar', 'off', '--no-deps', '--index-url', 'https://pypi.org/simple', 'casadi==3.7.2'],
  probe: ['-I', '-X', 'faulthandler', '-c', 'import runpy, sys, json; oracle = runpy.run_path(sys.argv[1]); parameters = json.loads((oracle["ROOT"] / "artifacts/candidates/A/parameters.json").read_text()); print(json.dumps(oracle["evaluate"](parameters, oracle["ROOT"] / "artifacts/probe")))', join(root, 'oracle.py')],
  lock: ['-I', join(root, 'oracle.py'), 'lock'],
  tests: ['-I', '-X', 'faulthandler', '-m', 'unittest', 'discover', '-s', root, '-p', 'oracle_test.py', '-v'],
  dependencies: ['-I', '-m', 'pip', '--isolated', '--disable-pip-version-check', 'check'],
  evidence: ['-I', '-X', 'faulthandler', join(root, 'evidence.py')],
};
if (!Object.hasOwn(commands, mode)) throw new Error('Unknown local verification mode');
const started = performance.now();
const result = spawnSync(executable, commands[mode], { cwd: root, env: environment, encoding: 'utf8', timeout: 180000, maxBuffer: 4 * 1024 * 1024 });
const report = {
  status: result.status === 0 && !result.error ? 'PASS' : 'FAIL',
  executable, arguments: commands[mode], exitCode: result.status, signal: result.signal,
  error: result.error?.message, stdout: result.stdout, stderr: result.stderr,
  wallTimeMs: performance.now() - started, directOnshapeApiCalls: 0, browserInvocations: 0,
};
mkdirSync(join(root, 'artifacts'), { recursive: true });
mkdirSync(join(root, 'artifacts', 'executions'), { recursive: true });
writeFileSync(join(root, 'artifacts', 'executions', `python-${mode}-${Date.now()}.json`), encode(report));
writeFileSync(join(root, 'artifacts', `python-${mode}.json`), encode(report));
console.log(encode(report));
if (report.status !== 'PASS') process.exitCode = 1;