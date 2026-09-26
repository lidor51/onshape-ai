import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMeasurements } from './measure.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const rounded = value => Number(value.toFixed(3));

export async function verifyEvidence() {
  const active = await json(join(root, 'active-run.json'));
  const run = join(root, 'runs', active.run);
  const state = await json(join(run, 'state.json'));
  const ledger = await json(join(root, 'creation-ledger.json'));
  assert.ok(ledger.length <= 3, 'document budget');
  assert.ok(ledger.some(entry => entry.run === active.run && entry.documentId === state.documentId && entry.public === true && entry.status === 200), 'creation provenance');
  assert.equal(state.public, true);
  assert.equal(state.revised, true);
  assert.equal(state.featureId, (await json(join(run, 'build.json'))).feature_id);
  assert.equal(state.featureId, (await json(join(run, 'revision-update.json'))).feature_id);
  const phases = {};
  for (const phase of ['baseline', 'revision']) {
    const measured = await json(join(run, `${phase}-decoded.json`));
    const expected = await json(join(run, `${phase}-expected.json`));
    const validation = validateMeasurements(measured, expected);
    const features = await json(join(run, `${phase}-features.json`));
    const statuses = [...features.text.matchAll(/'featureStatus': '([^']+)'/g)].map(match => match[1]);
    assert.ok(statuses.length >= 5 && statuses.every(status => status === 'OK'), `${phase} feature health`);
    assert.ok(features.text.includes(`'featureId': '${state.featureId}'`), `${phase} feature identity`);
    for (const expression of phase === 'baseline' ? ['340 mm', '100 mm'] : ['360 mm', '95 mm']) {
      assert.ok(features.text.includes(`'expression': '${expression}'`), `${phase} parameter readback`);
    }
    const outputs = await json(join(run, `${phase}-outputs.json`));
    assert.equal(outputs.status, 'PASS');
    for (const artifact of [outputs.original, ...outputs.steps, ...outputs.images]) {
      const bytes = await readFile(join(run, artifact.file));
      assert.equal(bytes.length, artifact.bytes, `${phase} artifact size`);
      assert.equal(sha256(bytes), artifact.sha256, `${phase} artifact hash`);
    }
    const exportText = (await json(join(run, `${phase}-export.json`))).text;
    assert.ok(state.translations.includes(exportText.match(/Translation ID: ([a-f0-9]{24})/)[1]), `${phase} translation state`);
    const part = name => measured.parts.find(item => item.name === name);
    const centerY = name => (part(name).minMm[1] + part(name).maxMm[1]) / 2;
    phases[phase] = {
      status: validation.status, scalarGeometryChecks: validation.checks.length, featureStatus: 'OK',
      solidCount: measured.solidCount, plateHoleCount: part('leftPlate').cylinders.length + part('rightPlate').cylinders.length,
      innerWidthMm: rounded(part('rightPlate').minMm[0] - part('leftPlate').maxMm[0]),
      rollerGapMm: rounded(part('rearRoller').minMm[1] - part('frontRoller').maxMm[1]),
      rearRollerYMm: rounded(centerY('rearRoller')),
      sleeveLengthMm: rounded(part('frontRoller').maxMm[0] - part('frontRoller').minMm[0]),
      shaftLengthMm: rounded(part('frontShaft').maxMm[0] - part('frontShaft').minMm[0]),
      coralExcludedFromBom: part('coralReference').nonBom,
      outputs,
    };
  }
  assert.notEqual(phases.baseline.outputs.original.sha256, phases.revision.outputs.original.sha256);
  const invocations = [];
  for (const file of await readdir(run)) {
    if (/^(build|measure|revise|output)-\d+-summary\.json$/.test(file)) {
      const saved = await json(join(run, file));
      invocations.push({ file, stage: saved.stage, status: saved.status, startedAt: saved.startedAt, elapsedMs: saved.elapsedMs, calls: saved.calls });
    }
  }
  invocations.sort((first, second) => first.startedAt.localeCompare(second.startedAt));
  const recordedLabels = invocations.flatMap(item => item.calls.map(call => call.label));
  const recoveredToolCalls = ['baseline-render', 'baseline-export'].filter(label => !recordedLabels.includes(label));
  const httpRuns = [];
  for (const directory of await readdir(join(root, 'runs'), { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    let events;
    try { events = (await readFile(join(root, 'runs', directory.name, 'http.jsonl'), 'utf8')).trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const requests = events.filter(entry => entry.event === 'request');
    const responses = events.filter(entry => entry.event === 'response');
    const byStatus = {};
    const byEndpoint = {};
    for (const response of responses) byStatus[response.status] = (byStatus[response.status] ?? 0) + 1;
    for (const request of requests) {
      const endpoint = `${request.method} ${request.path.replace(/[a-f0-9]{24}/g, ':id')}`;
      byEndpoint[endpoint] = (byEndpoint[endpoint] ?? 0) + 1;
      assert.ok(['GET', 'POST'].includes(request.method), 'no delete/share request');
      const document = request.path.match(/\/d\/([a-f0-9]{24})(?:\/|$)/) ?? request.path.match(/\/documents\/([a-f0-9]{24})$/);
      if (document) assert.equal(document[1], state.documentId, 'HTTP document ownership');
    }
    httpRuns.push({ run: directory.name, attempted: requests.length, responses: responses.length,
      success: responses.filter(entry => entry.status >= 200 && entry.status < 300).length,
      summedResponseMs: rounded(responses.reduce((sum, entry) => sum + entry.elapsedMs, 0)), byStatus, byEndpoint });
  }
  const research = await json(join(root, 'research.json'));
  const modifiedPythonSources = [];
  for (const source of research.fetches.filter(item => item.url.endsWith('.py'))) {
    const path = source.url.split(`/${research.revision}/`)[1];
    const actualSha256 = sha256(await readFile(join(root, 'vendor', path)));
    if (actualSha256 !== source.sha256) modifiedPythonSources.push({ path, upstreamSha256: source.sha256, actualSha256 });
  }
  const discovery = await json(join(run, 'discovery.json'));
  return { status: 'PASS', verifiedAt: new Date().toISOString(), run: active.run,
    documentUrl: `https://cad.onshape.com/documents/${state.documentId}/w/${state.workspaceId}/e/${state.elementId}`,
    documentId: state.documentId, featureId: state.featureId, publicDocumentsCreated: ledger.filter(entry => entry.documentId).length,
    creationAttempts: ledger.length, publicDocumentCap: 3, translations: state.translations,
    serverIdentity: discovery.server, discoveredTools: discovery.tools.length,
    phases, invocations, modeledToolCalls: recordedLabels.length + recoveredToolCalls.length,
    recoveredToolCalls, timingCaveat: 'Baseline output has persisted tool results but no invocation timing summary; its two calls are recovered from artifacts. Durations are stage process times, not full agent time.',
    httpRuns, modifiedPythonSources };
}

if (process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase()) {
  const evidence = await verifyEvidence();
  await writeFile(join(root, 'runs', evidence.run, 'verified-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence));
}