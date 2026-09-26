import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { checkSource, dialogFor, encode, root } from './generate.mjs';
import { sha256 } from './gate.mjs';
import { assertLocalArtifacts, checkAllCandidates } from './preflight.mjs';

const read = relative => readFileSync(join(root, relative));
const json = relative => JSON.parse(read(relative));
const preparation = json('artifacts/preparation.json');
const fixtureBytes = read('artifacts/input-benchmark.json');
const sourceBytes = read('artifacts/input-source.fs');
const source = read('plate.fs');
assert.equal(sha256(fixtureBytes), preparation.hashes.benchmark);
assert.equal(sha256(sourceBytes), preparation.hashes.reusedSource);
assert.equal(sha256(source), preparation.hashes.generatedSource);
for (const name of preparation.candidates) {
  const directory = `artifacts/candidates/${name}`;
  const parameters = read(`${directory}/parameters.json`);
  assert.equal(sha256(parameters), preparation.parameterHashes[name]);
  assert.equal(checkSource(source.toString(), JSON.parse(fixtureBytes), sourceBytes.toString(), JSON.parse(parameters)), 'PASS');
  assert.equal(read(`${directory}/dialog.json`).toString(), encode(dialogFor(JSON.parse(parameters))));
  assert.equal(json(`${directory}/preflight.json`).status, 'PASS');
  assertLocalArtifacts(join(root, directory), json(`${directory}/preflight.json`));
}
const tests = json('artifacts/node-tests.json');
assert.equal(tests.status, 'PASS');
assert.equal(tests.tests, 15);
assert.equal(tests.pythonExecuted, false);
const summary = json('artifacts/preflight-summary.json');
assert.equal(summary.status, 'PASS');
assert.equal(summary.successful, 31);
assert.equal(summary.results.length, 31);
assert.equal(json('artifacts/python-tests.json').status, 'PASS');
assert.match(json('artifacts/python-tests.json').stderr, /Ran 8 tests/);
assert.equal(json('artifacts/python-evidence.json').status, 'PASS');
const dependencies = json('artifacts/dependency-evidence.json');
assert.equal(dependencies.status, 'PASS');
assert.equal(dependencies.previewChecks.length, 31);
assert.ok(dependencies.runtime.packages.includes('cadquery==2.6.1'));
assert.ok(dependencies.runtime.packages.includes('casadi==3.7.2'));
checkAllCandidates();
const ledger = json('ledger.json');
for (const name of ['directOnshapeApiCalls', 'officialMcpCalls', 'browserToolInvocations', 'actualUiActions', 'activeBrowserSeconds', 'newDocumentCount', 'checkpointsStarted', 'repairCheckpointsUsed']) assert.equal(ledger[name], 0);
for (const name of ['actionEntries', 'onshapeDownloads', 'serverMeasurements', 'screenshots']) assert.deepEqual(ledger[name], []);
assert.equal(json('policy.json').browserExecution, 'BLOCKED');
ledger.outcome = 'FINISHED_LOCAL_BROWSER_BLOCKED';
ledger.localStepExports = [];
ledger.localPreviews = [];
for (const { name } of summary.results) {
  const directory = `artifacts/${preparation.candidates.includes(name) ? 'candidates' : 'sweep'}/${name}`;
  const oracle = json(`${directory}/preflight.json`).oracle;
  ledger.localStepExports.push({ state: name, path: `${directory}/local.step`, sha256: oracle.localStepSha256, origin: oracle.evidenceOrigin });
  ledger.localPreviews.push({ state: name, path: `${directory}/local-preview.svg`, sha256: oracle.previewSha256 });
}
const event = { event: 'completed real local preflight', result: 'PASS', nodeTests: 15, pythonTests: 8, checkpointStates: 6, sweepStates: 25, realSolidChecks: 31, stepRoundtrips: 31, preflightWallTimeMs: summary.wallTimeMs, baselineRepeat: 'PASS', browser: 'BLOCKED_POLICY', evidence: 'artifacts/dependency-evidence.json' };
ledger.localEvents = [...ledger.localEvents.filter(value => value.event !== event.event), event];
ledger.localArtifactCountsNote = '31 accepted states; additional probe and repeat-baseline artifacts are diagnostic/local repeatability evidence, never server downloads';
writeFileSync(join(root, 'ledger.json'), encode(ledger));

const ignored = new Set(['.venv', 'node_modules', 'live', '__pycache__']);
function filesWithin(relative = '') {
  return readdirSync(join(root, relative), { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name) || entry.isSymbolicLink()) return [];
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    return entry.isDirectory() ? filesWithin(path) : [path];
  });
}
const paths = [...new Set([...filesWithin(), 'FILES.md', 'artifacts/inventory.json'])].sort();
writeFileSync(join(root, 'FILES.md'), `# Trial Files\n\n${paths.length} files in the recorded deliverable. This inventory excludes ignored\nvenv, live, dependency and cache directories. The 31 accepted states each retain\na local STEP, orthographic SVG and measured report. Probe/repeat files are local\ndiagnostics. No Onshape download, browser screenshot or PDF was produced.\nAll paths are relative to this trial folder.\n\n${paths.map(path => `- [${path}](${path.replaceAll(' ', '%20')})`).join('\n')}\n`);
for (const path of paths.filter(path => path.endsWith('.md'))) {
  const text = read(path).toString();
  assert.ok(!/[^\x00-\x7f]/.test(text), `ASCII: ${path}`);
  assert.ok(!/[\t ]+$/m.test(text), `Whitespace: ${path}`);
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (target && !/^https?:/.test(target)) assert.ok(existsSync(resolve(root, dirname(path), decodeURIComponent(target))), `Missing local link in ${path}`);
  }
}
const inventory = {
  status: 'PASS', scope: 'Current 31-state input/runtime/artifact hashes, recorded real CAD/tests, and unchanged zero-live policy gate; not Onshape validation',
  files: paths.map(path => ({ path, sha256: path === 'artifacts/inventory.json' ? null : sha256(read(path)) })),
  selfHashNote: 'The inventory itself has a null hash to avoid self-reference',
};
writeFileSync(join(root, 'artifacts/inventory.json'), encode(inventory));
console.log(`PASS: ${preparation.candidates.length} candidates + 25 sweep states with current hashes, 15 Node / 8 Python tests, local STEP/previews, browser BLOCKED, zero-live ledger, ${paths.length} inventoried files.`);