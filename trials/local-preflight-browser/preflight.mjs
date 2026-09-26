import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertReady, bindingsFor, sha256 } from './gate.mjs';
import { checkSource, dialogFor, encode, root, statesFor } from './generate.mjs';

export function setupState() {
  const executable = join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  const missing = [executable, join(root, 'requirements.lock')].filter(path => !existsSync(path));
  return { executable, ready: missing.length === 0, missing: missing.map(path => path.slice(root.length + 1).replaceAll('\\', '/')) };
}

function pythonResult(executable, args) {
  const environment = Object.fromEntries(['SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP'].filter(name => process.env[name]).map(name => [name, process.env[name]]));
  const result = spawnSync(executable, ['-I', join(root, 'oracle.py'), ...args], { cwd: root, env: environment, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('Oracle failed; inspect local dependency setup or run focused oracle tests (no browser repair)');
  const lines = result.stdout.trim().split(/\r?\n/);
  return JSON.parse(lines.at(-1));
}

export function inputsFor(parametersPath, dependencyRuntime) {
  const read = relative => readFileSync(join(root, relative));
  const parameters = readFileSync(parametersPath);
  const dialogPath = join(parametersPath, '../dialog.json');
  const dialog = existsSync(dialogPath) ? readFileSync(dialogPath) : Buffer.from(encode(dialogFor(JSON.parse(parameters))));
  return {
    source: read('plate.fs'), parameters,
    validator: read('preflight.mjs'), dependencies: read('requirements.lock'),
    generator: read('generate.mjs'), fixture: read('artifacts/input-benchmark.json'),
    reusedSource: read('artifacts/input-source.fs'), gate: read('gate.mjs'), oracle: read('oracle.py'),
    dependencyRuntime: Buffer.from(encode(dependencyRuntime)),
    dependencySpecification: read('requirements.txt'), dialog,
    sweep: read('artifacts/sweep.json'),
  };
}

export function assertLocalArtifacts(directory, report) {
  if (report.oracle?.evidenceOrigin !== 'LOCAL_CADQUERY_NOT_ONSHAPE_EXPORT') throw new Error('Expected local oracle provenance');
  for (const [name, key] of [['local.step', 'localStepSha256'], ['local-preview.svg', 'previewSha256']]) {
    if (sha256(readFileSync(join(directory, name))) !== report.oracle[key]) throw new Error(`Stale local artifact: ${name}`);
  }
}

export function runPreflight() {
  const started = performance.now();
  const setup = setupState();
  const artifacts = join(root, 'artifacts');
  mkdirSync(artifacts, { recursive: true });
  const fixture = JSON.parse(readFileSync(join(artifacts, 'input-benchmark.json')));
  const candidates = statesFor(fixture);
  if (!setup.ready) {
    const blocked = { status: 'BLOCKED', reason: 'Folder-local Python environment and exact dependency lock are required before any oracle execution', missing: setup.missing, realSolidChecksRun: 0, localStepExports: 0, previews: 0, directOnshapeApiCalls: 0, browserInvocations: 0, wallTimeMs: performance.now() - started };
    for (const name of Object.keys(candidates)) writeFileSync(join(artifacts, 'candidates', name, 'preflight.json'), encode(blocked));
    writeFileSync(join(artifacts, 'preflight-summary.json'), encode(blocked));
    return blocked;
  }
  const runtime = pythonResult(setup.executable, ['runtime']);
  const results = [];
  const sweep = JSON.parse(readFileSync(join(artifacts, 'sweep.json')));
  console.error('local-preflight-browser: verified folder-local runtime; starting 31 real CAD states');
  for (const [name, parameters] of Object.entries({ ...candidates, ...sweep })) {
    const candidate = Object.hasOwn(candidates, name);
    const directory = join(artifacts, candidate ? 'candidates' : 'sweep', name);
    mkdirSync(directory, { recursive: true });
    const parametersPath = join(directory, 'parameters.json');
    if (!candidate) writeFileSync(parametersPath, encode(parameters));
    let report;
    try {
      const inputs = inputsFor(parametersPath, runtime);
      const actualParameters = JSON.parse(inputs.parameters);
      if (JSON.stringify(actualParameters) !== JSON.stringify(parameters)) throw new Error('Prepared state was changed');
      if (inputs.dialog.toString() !== encode(dialogFor(actualParameters))) throw new Error('Dialog map differs from candidate parameters');
      const sourceContract = checkSource(inputs.source.toString(), JSON.parse(inputs.fixture), inputs.reusedSource.toString(), actualParameters);
      const oracle = pythonResult(setup.executable, ['evaluate', parametersPath, directory]);
      report = { status: 'PASS', bindings: bindingsFor(inputs), sourceContract, oracle };
      assertReady(inputsFor(parametersPath, pythonResult(setup.executable, ['runtime'])), report);
      assertLocalArtifacts(directory, report);
    } catch (error) {
      report = { status: 'FAIL', reason: error.message };
    }
    writeFileSync(join(directory, 'preflight.json'), encode(report));
    results.push({ name, status: report.status });
    console.error(`local-preflight-browser: ${name} ${report.status}`);
  }
  const summary = { status: results.every(result => result.status === 'PASS') ? 'PASS' : 'FAIL', results, realSolidChecksRun: results.length, successful: results.filter(result => result.status === 'PASS').length, wallTimeMs: performance.now() - started, directOnshapeApiCalls: 0, browserInvocations: 0, networkIsolation: 'Python audit hook before CAD import denies sockets, DNS and child processes; local socket.gethostname allowed; no OS firewall assertion', localFeatureScriptCompilation: 'NOT_PERFORMED' };
  writeFileSync(join(artifacts, 'preflight-summary.json'), encode(summary));
  return summary;
}

export function checkAllCandidates() {
  const setup = setupState();
  if (!setup.ready) throw new Error('Oracle setup BLOCKED');
  const summary = JSON.parse(readFileSync(join(root, 'artifacts/preflight-summary.json')));
  if (summary.status !== 'PASS') throw new Error('Complete sweep has not passed');
  const fixture = JSON.parse(readFileSync(join(root, 'artifacts/input-benchmark.json')));
  const runtime = pythonResult(setup.executable, ['runtime']);
  const candidates = statesFor(fixture);
  const sweep = JSON.parse(readFileSync(join(root, 'artifacts/sweep.json')));
  for (const name of Object.keys({ ...candidates, ...sweep })) {
    const directory = join(root, 'artifacts', Object.hasOwn(candidates, name) ? 'candidates' : 'sweep', name);
    const report = JSON.parse(readFileSync(join(directory, 'preflight.json')));
    assertReady(inputsFor(join(directory, 'parameters.json'), runtime), report);
    assertLocalArtifacts(directory, report);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = runPreflight();
  console.log(encode(report));
  if (report.status !== 'PASS') process.exitCode = 2;
}