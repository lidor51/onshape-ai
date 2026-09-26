import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repository = resolve(root, '../../../..');
const read = name => JSON.parse(readFileSync(join(root, name), 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const started = new Date();
const tests = [];
const check = (name, action) => {
  try {
    action();
    tests.push({ name, status: 'PASS' });
  } catch (error) {
    tests.push({ name, status: 'FAIL', message: error.message });
  }
};
const checkpoint = read('checkpoint.json');
const summary = read('summary.json');
const catalog = read('native-catalog.json');
const cots = read('cots-preservation.json');
const validation = read('validation.json');
const probe = read('mechanical-probe.json');
const connectors = read('source/connectors.json');
const source = readFileSync(join(root, 'source/concept-a-v4.fs'), 'utf8');

check('Every frozen source and artifact hash matches', () => {
  for (const [name, expected] of Object.entries(checkpoint.sourceHashes)) {
    assert.equal(hash(join(root, name)), expected, name);
  }
});
check('Original vendor bytes and all 56 rigid placements are preserved', () => {
  assert.equal(Object.keys(cots.sources).length, 4);
  assert.equal(Object.values(cots.sources).reduce((total, item) => total + item.sourceSolidCount, 0), 5);
  for (const entry of Object.values(cots.sources)) {
    assert.equal(hash(resolve(repository, entry.originalPath)), entry.sha256, entry.originalPath);
    assert.equal(entry.occtReexportAllowed, false);
  }
  assert.equal(cots.instances.length, 56);
  for (const entry of cots.instances) {
    assert.equal(entry.IsPartner, true, entry.instance);
    assert.deepEqual(entry.topologyCountsPlaced, entry.topologyCountsBefore, entry.instance);
  }
  assert.equal(cots.originalFilesReexported, false);
});
check('Both generated export sets and independent assembly readbacks pass', () => {
  for (const variant of ['baseline', 'revision']) {
    const evidence = read(`${variant}/custom-roundtrip.json`);
    assert.equal(evidence.status, 'PASS', variant);
    assert.equal(evidence.checks.length, 53);
    assert.ok(evidence.checks.every(entry => entry.status === 'PASS'));
    assert.equal(evidence.generatedAssemblyReadback.status, 'PASS');
    assert.equal(evidence.generatedAssemblyReadback.actualBodies, 454);
    assert.equal(evidence.cotsReexported, false);
  }
});
check('510 occurrences include five references and retain member-level group mapping', () => {
  assert.equal(catalog.members.length, 510);
  assert.equal(catalog.modeledNonReferenceOccurrences, 505);
  assert.equal(catalog.referenceOccurrences, 5);
  assert.equal(catalog.uniquePartDefinitions, 58);
  assert.equal(catalog.logicalKinematicGroups, 28);
  assert.equal(new Set(catalog.members.map(item => item.id)).size, 510);
  const membership = catalog.groups.flatMap(group => group.members).sort();
  assert.deepEqual(membership, catalog.members.map(item => item.id).sort());
  assert.ok(catalog.members.every(item => item.nativeOccurrenceId === null && !item.readbackVerified));
  assert.ok(catalog.parts.some(item => item.category === 'generic_hardware_NOT_COTS'));
});
check('All occurrence connectors and the three editable controls are emitted', () => {
  assert.equal(connectors.length, 510);
  assert.equal(new Set(connectors.map(item => item.id)).size, 510);
  for (const name of ['mouthWidth', 'receiverHeight', 'topFloat']) {
    assert.ok(source.includes(`definition.${name}`), name);
    assert.ok(summary.controls[name].min < summary.controls[name].max, name);
  }
  const parity = read('source/recipe-parity.json');
  assert.equal(parity.checks.length, 106);
  assert.ok(parity.checks.every(item => item.status === 'PASS' && item.topologyCountsEqual && item.boundsDifferenceMm < 0.001));
});
check('Focused mount, mesh and inlet repairs pass without hiding the motor presentation collision', () => {
  assert.equal(probe.mountHubTrunnionStatus, 'PASS');
  assert.equal(probe.gearMeshStatus, 'PASS');
  assert.equal(probe.inletSamples.length, 13);
  assert.ok(probe.inletSamples.every(item => item.status === 'PASS' && item.requiredFloatMm <= 12));
  assert.equal(probe.status, 'FAIL');
});
check('Full sweep retains timeout, all-pairs coverage and measured blockers', () => {
  const exit = read('validate.exit.json');
  assert.equal(exit.exitCode, 124);
  assert.equal(exit.timedOut, true);
  assert.equal(exit.wallLimitMs, 600000);
  assert.equal(validation.status, 'FAIL_INCOMPLETE_TIMEOUT');
  const samples = Object.values(validation.variants).flatMap(variant => variant.samples);
  assert.equal(samples.length, 38);
  assert.ok(samples.every(sample => sample.collisions.pairCount === 510 * 509 / 2));
  assert.ok(summary.fullSweep.forwardExcessMm > 44);
  assert.ok(summary.hardCoralBlockers.some(item => item.blockers.some(blocker => blocker.part === 'orienter_1_0_shaft')));
});
check('Six VTK depth previews are nonblank and hash verified', () => {
  const previews = read('preview-checks.json');
  assert.equal(previews.images.length, 6);
  for (const image of previews.images) {
    assert.deepEqual(image.dimensions, [1800, 1300, 1]);
    assert.ok(image.chromaticPixels > 10000, image.path);
    assert.equal(hash(join(root, image.path)), image.sha256, image.path);
  }
});
check('Packet gate and mechanical incompleteness remain explicitly blocked', () => {
  assert.equal(summary.status, 'BLOCKED_LOCAL_CAD_DEMONSTRATOR');
  assert.equal(checkpoint.localCADApproved, false);
  assert.equal(summary.nativeAdmitted, false);
  assert.equal(summary.manufacturingRelease, false);
  assert.equal(summary.geometryRepairCyclesThisContinuation, 3);
  assert.ok(summary.blockingAttachments.length >= 7);
  assert.equal(read('packet.exit.json').exitCode, 2);
  assert.equal(read('test_layout.exit.json').exitCode, 0);
  assert.equal(summary.apiCalls, 0);
  assert.equal(summary.networkCalls, 0);
});

const failures = tests.filter(test => test.status === 'FAIL');
const result = { status: failures.length ? 'FAIL' : 'PASS_DIAGNOSTIC_INTEGRITY_NOT_MECHANICAL_APPROVAL', started: started.toISOString(), ended: new Date().toISOString(), exitCode: failures.length ? 1 : 0, tests };
writeFileSync(join(root, 'audit.json'), JSON.stringify(result, null, 2) + '\n');
if (!failures.length) {
  for (const name of ['audit.mjs', 'audit.json', 'packet.exit.json', 'execution-history.jsonl']) {
    checkpoint.sourceHashes[name] = hash(join(root, name));
  }
  checkpoint.finalAudit = 'audit.json';
  writeFileSync(join(root, 'checkpoint.json'), JSON.stringify(checkpoint, null, 2) + '\n');
}
writeFileSync(join(root, 'audit.exit.log'), JSON.stringify({ exitCode: result.exitCode, ended: result.ended }) + '\n');
console.log(JSON.stringify({ status: result.status, tests: tests.length, failures }, null, 2));
process.exitCode = result.exitCode;