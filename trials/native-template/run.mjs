import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { stages, controlMap } from './native.mjs';
import { hash } from './patch.mjs';
import { bindings, preflight } from './preflight.mjs';
import { authorize, ROTATION_CONFIRMATION, CURRENT_KEY_ACKNOWLEDGMENT, SHARED_SNAPSHOT } from './safety.mjs';
import { createLiveTransport } from './transport.mjs';
import { executePhase, PHASES } from './workflow.mjs';

export const HELP = `Native template experiment, Node 24, zero third-party dependencies.
Default: node trials/native-template/run.mjs [--offline]
Public schema research only: node trials/native-template/research.mjs
Live phases: --live --phase setup|copy|simulated-editor|revision|validation
Interrupted known-owned phase: --resume-owned (read reconciliation before writes)
Choose exactly one credential authorization:
  --current-key-acknowledgment ${CURRENT_KEY_ACKNOWLEDGMENT}
  --rotation-confirmation ${ROTATION_CONFIRMATION}
Other live flags are mandatory:
  --approved-origin https://cad.onshape.com
  --new-public --max-documents 2 --accept-unvalidated-native-candidate
  --reserve-native 120 --reserve-manufacturing 80 --reserve-official 100 --annual-safety 500
  --annual-limit 2500 --annual-used 273 --reservation-snapshot 2026-09-11
Use a newly confirmed annual reservation snapshot for a later run.
Credentials: root .env.local, loaded in memory only after hash-bound preflight,
explicit credential authorization, exact-origin approval and exclusive ledger lock.
Current-key authorization does not attest rotation. No OAuth/browser/fallback/deletion exists.
The sample reservation is parent-reported shared account usage, not this trial's calls.
Rotation remains recommended; explicit current-key risk acknowledgment is supported.
`;

export function parseOptions(args) {
  const { values } = parseArgs({ args, strict: true, allowPositionals: false, options: {
    help: { type: 'boolean' }, offline: { type: 'boolean' }, live: { type: 'boolean' }, phase: { type: 'string' }, 'resume-owned': { type: 'boolean' },
    'rotation-confirmation': { type: 'string' }, 'current-key-acknowledgment': { type: 'string' }, 'approved-origin': { type: 'string' },
    'new-public': { type: 'boolean' }, 'max-documents': { type: 'string' },
    'accept-unvalidated-native-candidate': { type: 'boolean' }, 'reserve-native': { type: 'string' },
    'reserve-manufacturing': { type: 'string' }, 'reserve-official': { type: 'string' }, 'annual-safety': { type: 'string' },
    'annual-limit': { type: 'string' }, 'annual-used': { type: 'string' }, 'reservation-snapshot': { type: 'string' },
  } });
  if (values.offline && values.live) throw new Error('CONFLICTING_MODE_FLAGS');
  return { help: values.help, live: values.live === true, phase: values.phase, resumeOwned: values['resume-owned'] === true,
    rotationConfirmation: values['rotation-confirmation'], currentKeyAcknowledgment: values['current-key-acknowledgment'], approvedOrigin: values['approved-origin'],
    newPublic: values['new-public'], maxDocuments: Number(values['max-documents']),
    acceptUnvalidatedNativeCandidate: values['accept-unvalidated-native-candidate'],
    reserveNative: Number(values['reserve-native']), reserveManufacturing: Number(values['reserve-manufacturing']), reserveOfficial: Number(values['reserve-official']),
    annualSafety: Number(values['annual-safety']), annualLimit: Number(values['annual-limit']),
    annualUsed: Number(values['annual-used']), reservationSnapshot: values['reservation-snapshot'] };
}

export function offline() {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('NODE_24_REQUIRED');
  const start = performance.now();
  const directory = fileURLToPath(new URL('./', import.meta.url));
  const testFiles = readdirSync(directory).filter(name => name.endsWith('.test.mjs')).sort();
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...testFiles], {
    cwd: directory, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024,
  });
  if (result.status !== 0 || result.error) throw new Error('OFFLINE_TESTS_FAILED');
  const binding = bindings();
  const tests = { status: 'PASS', ...binding, node: process.version, testFiles,
    passed: Number(result.stdout.match(/^# pass (\d+)$/m)?.[1]),
    failed: Number(result.stdout.match(/^# fail (\d+)$/m)?.[1]),
    outputHash: hash(result.stdout), evidence: 'executed Node tests, no real transport' };
  if (!Number.isSafeInteger(tests.passed) || tests.passed < 1 || tests.failed !== 0) throw new Error('TEST_RECEIPT_UNVERIFIED');
  const bundle = stages();
  const report = preflight(bundle, tests, binding);
  const artifacts = new URL('./artifacts/', import.meta.url);
  mkdirSync(artifacts, { recursive: true });
  const write = (name, data) => writeFileSync(new URL(name, artifacts), `${JSON.stringify(data, null, 2)}\n`);
  write('bundle.json', bundle);
  write('tests.json', tests);
  write('preflight.json', report);
  write('revision-patch.json', bundle.patch);
  write('preservation.json', bundle.preservation);
  for (const stage of ['baseline', 'templatecopy', 'simulatededitor', 'revision']) {
    write(`${stage}-native.json`, bundle[stage]);
    write(`${stage}-analytic.json`, report.measurements[stage]);
    write(`${stage}-map.json`, controlMap(bundle[stage]));
  }
  write('call-ledger.json', { mode: 'offline', measuredAuthenticatedRequests: 0, attempted: 0, successful: 0,
    failed: 0, retries: 0, unknown: 0, documentsCreated: 0, credentialLoads: 0, sharedSnapshot: SHARED_SNAPSHOT,
    phases: Object.fromEntries(PHASES.map(phase => [phase, { attempted: 0, successful: 0, status: 'BLOCKED' }])),
    note: 'Local fake-transport requests are excluded. Public documentation fetches were unauthenticated.' });
  const summary = { status: 'OFFLINE_COMPLETE', testsPassed: tests.passed,
    authenticatedCalls: 0, credentialLoads: 0, liveBlocker: null, scope: 'offline invocation only; live ledger is authoritative for cumulative calls',
    candidateHash: report.candidateHash, patchHash: report.patchHash, sourceHash: report.sourceHash,
    elapsedMs: performance.now() - start, humanUI: 'UNVERIFIED', nativeSolverDOF: 'UNVERIFIED',
    gates: { offlinePreflight: 'PASS', nativeGeometry: 'BLOCKED', independentCopy: 'BLOCKED',
      revisionServerGeometry: 'BLOCKED', localPreservationAndConflict: 'PASS', humanUI: 'UNVERIFIED', liveCost: 'BLOCKED' } };
  write('summary.json', summary);
  return summary;
}

export async function main(args = process.argv.slice(2)) {
  const options = parseOptions(args);
  if (options.help) return HELP;
  if (!options.live) return offline();
  if (!PHASES.includes(options.phase)) throw new Error('LIVE_PHASE_REQUIRED');
  authorize(options);
  const read = name => JSON.parse(readFileSync(new URL(`./artifacts/${name}`, import.meta.url), 'utf8'));
  const bundle = read('bundle.json');
  const session = createLiveTransport({ options, report: read('preflight.json'), tests: read('tests.json'), bundle,
    directory: fileURLToPath(new URL('./live/', import.meta.url)) });
  try { return await executePhase(session, options.phase, bundle, fileURLToPath(new URL('./live/', import.meta.url))); }
  finally { session.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await main();
    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  } catch (error) {
    const code = /^[A-Z][A-Z0-9_]+$/.test(error.message) ? error.message : 'RUN_BLOCKED_OR_FAILED';
    console.error(JSON.stringify({ status: 'BLOCKED', code }));
    process.exitCode = 1;
  }
}