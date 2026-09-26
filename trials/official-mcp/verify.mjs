import { spawnSync } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadLocalFixture, sha256 } from './generate.mjs';

const directory = new URL('./', import.meta.url);
const artifacts = new URL('./artifacts/', directory);
await mkdir(artifacts, { recursive: true });
const tests = (await readdir(directory)).filter(file => file.endsWith('.test.mjs')).sort();
if (!tests.length) throw new Error('NO_OFFICIAL_TESTS_FOUND');
const argumentsList = ['--import', './offline-only.mjs', '--test', '--test-reporter=tap', ...tests];
const startedAt = new Date().toISOString();
const started = performance.now();
const result = spawnSync(process.execPath, argumentsList, {
  cwd: fileURLToPath(directory), encoding: 'utf8', timeout: 60_000,
});
await writeFile(new URL('current-tests.tap', artifacts), result.stdout ?? '');
const { fixtureSha256, fixtureProvenance } = await loadLocalFixture();
const count = label => Number(result.stdout?.match(new RegExp(`^# ${label} (\\d+)$`, 'm'))?.[1] ?? 0);
const passed = result.status === 0 && count('tests') > 0 && count('tests') === count('pass') &&
  ['fail', 'cancelled', 'skipped', 'todo'].every(label => count(label) === 0);
const summary = {
  startedAt, nodeVersion: process.version, elapsedMs: Math.round(performance.now() - started),
  command: `node ${argumentsList.join(' ')}`,
  workingDirectory: 'trials/official-mcp',
  status: passed ? 'PASS_OFFLINE_EVIDENCE_REVALIDATION' : 'FAIL', exitCode: result.status,
  testFiles: tests, testFileCount: tests.length,
  tests: count('tests'), passed: count('pass'), failed: count('fail'),
  cancelled: count('cancelled'), skipped: count('skipped'), todo: count('todo'),
  stderrPresent: Boolean(result.stderr),
  currentLiveResultSha256: sha256(await readFile(new URL('current-live-result.json', artifacts))),
  tapSha256: sha256(result.stdout ?? ''),
  fixtureSha256, fixtureProvenance,
  liveRequestsMadeByVerifier: 0,
  networkDisabledForTests: true,
  credentialReads: 0,
  newOnshapeCompilationPerformed: false,
  evidenceBasis: 'Existing saved baseline and revision readbacks; parent-attributed modeling outcomes; immutable historical observations.',
  historicalValidationFilesOverwritten: false,
};
await writeFile(new URL('current-local-validation.json', artifacts), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
process.exitCode = passed ? 0 : 1;