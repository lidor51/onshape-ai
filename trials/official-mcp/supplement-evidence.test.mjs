import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { TARGET, validateLedger, ROLES } from './supplement-policy.mjs';
import { capture, featureSnapshot, measuredModel, pngBytes } from './supplement.mjs';
import { stepMembers } from './supplement-step.mjs';
import { loadLocalFixture } from './generate.mjs';
import { validateMeasurements } from './final-measurements.mjs';

const root = new URL('./artifacts/readonly-supplement/', import.meta.url);
const json = async name => JSON.parse(await readFile(new URL(name, root), 'utf8'));

for (const [phase, count, microversion, indices] of [
  ['baseline', 11, 'dd5d804ab7aa470518d44acc', [1, 6, 11, 4, 5, 10]],
  ['revision', 10, '4bcde993e8baf4730d3a12db', [12, 17, 21, 15, 16, 20]],
]) {
test(`${phase} ledger and artifact hashes bind actual requests to the retained branch`, async () => {
  const ledger = validateLedger(await json('ledger.json'));
  const requests = ledger.requests.filter(entry => entry.phase === phase);
  assert.equal(requests.length, count);
  assert.equal(requests.filter(entry => entry.status === 400).length, phase === 'baseline' ? 1 : 0);
  assert.equal(requests.filter(entry => entry.status === 200).length, 10);
  assert.equal(ledger.phases[phase].status, `PASS_${phase.toUpperCase()}`);
  assert.equal(ledger.phases[phase].modelWrites, 0);
  for (const entry of requests) {
    assert.equal(new URL(entry.url).origin, 'https://cad.onshape.com');
    assert.ok(['GET', 'POST'].includes(entry.method));
    if (entry.method === 'POST') assert.match(entry.url, /\/(featurescript|translations|export\/step)$/);
    assert.ok(entry.response);
    const bytes = await readFile(new URL(entry.response.file, root));
    assert.equal(bytes.length, entry.response.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.response.sha256);
  }
  const report = await json(`${phase}-report.json`);
  assert.deepEqual(report, ledger.phases[phase]);
  assert.deepEqual(report.target, TARGET);
  for (const artifact of [report.source, report.measurements, report.png, report.step, ...report.step.members]) {
    const bytes = await readFile(new URL(artifact.file, root));
    assert.equal(bytes.length, artifact.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), artifact.sha256);
  }
});

test(`${phase} actual snapshots, measurements, PNG and nine STEP members agree`, async () => {
  const name = (sequence, kind, extension = 'json') => `${phase}-${String(sequence).padStart(2, '0')}-${kind}.${extension}`;
  const before = featureSnapshot(await json(name(indices[0], 'features')), phase);
  const exportBefore = featureSnapshot(await json(name(indices[1], 'features')), phase);
  const after = featureSnapshot(await json(name(indices[2], 'features')), phase);
  assert.equal(before.microversion, microversion);
  assert.deepEqual(before, exportBefore);
  assert.deepEqual(before, after);
  const measured = measuredModel(await json(name(indices[3], 'measure')));
  const { task } = await loadLocalFixture();
  assert.equal(validateMeasurements(measured, task, phase).status, 'PASS_MEASUREMENTS_ONLY');
  assert.deepEqual(measured, await json(`${phase}-measured.json`));
  const image = pngBytes(await json(name(indices[4], 'png')));
  assert.ok(image.equals(await readFile(new URL(`${phase}.png`, root))));
  const rawDownload = await readFile(new URL(name(indices[5], 'download', 'step'), root));
  const archive = await readFile(new URL(`${phase}-step-original.zip`, root));
  assert.ok(rawDownload.equals(archive));
  const members = stepMembers(archive);
  assert.deepEqual(members.map(member => member.role).sort(), [...ROLES].sort());
  for (const member of members) {
    assert.ok(member.data.equals(await readFile(new URL(`${phase}-${member.role}.step`, root))));
  }
});

test(`${phase} full offline capture revalidates actual source tokens, status, names and BOM`, async () => {
  const ledger = await json('ledger.json');
  const entries = ledger.requests.filter(entry => entry.phase === phase && entry.status === 200);
  const report = {};
  const { task } = await loadLocalFixture();
  const localSource = await readFile(new URL(`../final-repair-${phase}.fs`, root), 'utf8');
  await capture({ phase, task, localSource, report, wait: async () => {},
    request: async kind => {
      const entry = entries.shift();
      assert.ok(entry.response.file.endsWith(`-${kind}.${kind === 'download' ? 'step' : 'json'}`));
      const bytes = await readFile(new URL(entry.response.file, root));
      return kind === 'download' ? bytes : JSON.parse(bytes);
    },
    save: async (file, bytes) => {
      assert.ok(bytes.equals(await readFile(new URL(file, root))), `${phase} unchanged saved bytes: ${file}`);
      return { file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    },
  });
  assert.equal(entries.length, 0);
  const saved = await json(`${phase}-report.json`);
  for (const [key, value] of Object.entries(report)) assert.deepEqual(value, saved[key], `${phase} ${key}`);
});
}

test('both phases preserve feature and part identity while source and geometry change', async () => {
  const baseline = await json('baseline-report.json');
  const revision = await json('revision-report.json');
  assert.equal(baseline.before.featureId, revision.before.featureId);
  assert.deepEqual(baseline.parts, revision.parts);
  assert.notEqual(baseline.before.namespace, revision.before.namespace);
  assert.notEqual(baseline.before.microversion, revision.before.microversion);
  assert.notEqual(baseline.source.sha256, revision.source.sha256);
  assert.equal(revision.cumulativeRequests, baseline.phaseRequests + revision.phaseRequests);
  assert.equal(revision.cumulativeRequests, 21);
});