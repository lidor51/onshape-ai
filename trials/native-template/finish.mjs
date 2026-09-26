import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { hash, planPatch } from './patch.mjs';
import { inspectNative, definition, preserved, verifyGeometry } from './verify.mjs';
import { PHASES } from './workflow.mjs';

const root = new URL('./', import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
const write = (name, value) => writeFileSync(new URL(name, root), `${JSON.stringify(value, null, 2)}\n`, { flush: true });

export function finish() {
  const state = read('live/state.json');
  const events = readFileSync(new URL('live/ledger.jsonl', root), 'utf8').trim().split('\n').map(JSON.parse);
  const attempts = events.filter(event => event.kind === 'attempt');
  const outcomes = events.filter(event => event.kind === 'outcome');
  const done = events.filter(event => event.kind === 'phase-done');
  assert.equal(done.at(-1)?.stateHash, hash(state), 'Saved state must match the final ledger receipt');
  assert.deepEqual(done.map(event => event.phase), PHASES, 'All five phases must be complete');
  assert.ok(attempts.length <= 120, 'Cumulative attempt cap');
  assert.deepEqual(attempts.map(event => event.sequence), attempts.map((_, index) => index + 1), 'No reset or missing attempts');
  assert.equal(new Set(outcomes.map(event => event.sequence)).size, outcomes.length, 'No duplicate outcomes');
  const cost = selected => {
    const responses = outcomes.filter(outcome => selected.some(attempt => attempt.sequence === outcome.sequence));
    return { attempted: selected.length,
      successful: responses.filter(event => event.status >= 200 && event.status < 400).length,
      failed: responses.filter(event => event.status >= 400).length,
      unknownOutcomesConservative: selected.filter(attempt => !responses.some(event =>
        event.sequence === attempt.sequence && Number.isInteger(event.status) && !event.unknown)).length,
      reconciledInterruptedReads: selected.filter(attempt => events.some(event =>
        event.kind === 'interrupted-read' && event.sequence === attempt.sequence)).length,
      automaticRetries: 0,
      recordedRequestMs: responses.reduce((sum, event) => sum + event.elapsedMs, 0) };
  };
  const documents = events.filter(event => event.kind === 'document').map(document => {
    const element = events.find(event => event.kind === 'element' && event.role === document.role);
    assert.ok(events.some(event => event.kind === 'visibility' && event.role === document.role && event.isPublic), 'Public visibility evidence');
    return { role: document.role, did: document.did, wid: document.wid, eid: element.eid,
      creationSequence: document.creationSequence,
      url: `https://cad.onshape.com/documents/${document.did}/w/${document.wid}/e/${element.eid}` };
  });
  assert.equal(documents.length, 2, 'Exactly the existing two documents');
  assert.equal(attempts.filter(event => event.createsDocument).length, 2, 'No extra document attempts');
  assert.equal(attempts.filter(event => event.phase === 'copy' && event.operation === 'addPartStudioFeature').length, 0, 'Copy was not rebuilt');
  const bundle = read('artifacts/bundle.json');
  const candidateNames = { setup: 'baseline', copy: 'templatecopy', 'simulated-editor': 'simulatededitor', revision: 'revision', validation: 'baseline' };
  const phases = {};
  for (const phase of PHASES) {
    const selected = attempts.filter(event => event.phase === phase);
    const featureRead = selected.filter(event => event.operation === 'getPartStudioFeatures').at(-1);
    const snapshot = read(`live/response-${String(featureRead.sequence).padStart(3, '0')}-getPartStudioFeatures.json`);
    if (state[phase].snapshot) assert.equal(hash(snapshot), hash(state[phase].snapshot), 'Readback must match committed phase');
    const native = inspectNative(bundle[candidateNames[phase]], snapshot);
    const geometry = read(`live/${phase}-geometry-response.json`);
    assert.equal(geometry.microversion, snapshot.sourceMicroversion, 'Geometry pinned to feature readback');
    const measurements = verifyGeometry(geometry.bodies, geometry.bounds, geometry.mass, bundle[candidateNames[phase]].parameters);
    assert.equal(hash(measurements), hash(state[phase].measurements), 'Replayed measurements agree');
    const sketches = snapshot.features.filter(feature => feature.featureType === 'newSketch').map(feature => ({
      name: feature.name, featureId: feature.featureId, constraints: feature.constraints.map(constraint => ({
        id: constraint.entityId, type: constraint.constraintType, drivenDimension: constraint.drivenDimension === true,
        parameters: constraint.parameters.map(parameter => ({ id: parameter.parameterId,
          ...(parameter.expression !== undefined ? { expression: parameter.expression } : {}),
          ...(parameter.value !== undefined ? { value: parameter.value } : {}) })) })) }));
    assert.ok(sketches.length >= 6, 'Native sketches are present');
    assert.ok(sketches.every(sketch => sketch.constraints.every(constraint => !constraint.drivenDimension && constraint.type !== 'FIX')), 'Driving constraints without FIX');
    const start = events.find(event => event.kind === 'phase-start' && event.phase === phase);
    const end = done.find(event => event.phase === phase);
    phases[phase] = { status: 'PASS', cost: cost(selected), firstStartedAt: start.at, completedAt: end.at,
      wallSpanMsIncludingInterruptions: Date.parse(end.at) - Date.parse(start.at),
      completedInvocationMs: state[phase].elapsedMs, microversion: snapshot.sourceMicroversion,
      libraryVersion: snapshot.libraryVersion, serializationVersion: snapshot.serializationVersion,
      featureCount: snapshot.features.length, native, sketches, measurements,
      featureReadback: `live/response-${String(featureRead.sequence).padStart(3, '0')}-getPartStudioFeatures.json`,
      geometryEvidence: `live/${phase}-geometry-response.json` };
  }
  const editor = state['simulated-editor'].snapshot;
  const patch = planPatch({ microversion: editor.sourceMicroversion, features: editor.features },
    { innerWidth: 360, rollerGap: 95 });
  const preservation = preserved(editor, state.revision.snapshot, patch.changes);
  assert.equal(hash(preservation), hash(state.revision.preservation), 'Revision preservation agrees');
  assert.equal(phases.revision.cost.attempted, 6, 'Six-call revision including geometry');
  assert.equal(phases.revision.cost.successful, 6, 'All six revision requests succeeded');
  assert.equal(phases.validation.microversion, phases.setup.microversion, 'Original microversion unchanged');
  const original = read(phases.validation.featureReadback);
  assert.equal(hash(definition(original.features)), hash(definition(state.setup.snapshot.features)), 'Original definitions unchanged');
  assert.equal(hash(phases.validation.measurements), hash(phases.setup.measurements), 'Original geometry unchanged');
  assert.equal(state.validation.originalTemplateUnchanged, true);
  const lastLiveSource = events.filter(event => event.kind === 'source-rebind').at(-1)?.sourceHash ?? events[0].sourceHash;
  if (!existsSync(new URL('live/execution-preflight.json', root))) {
    const preflight = read('artifacts/preflight.json');
    assert.equal(preflight.sourceHash, lastLiveSource, 'Archive the actual live preflight before refreshing offline receipts');
    write('live/execution-preflight.json', preflight);
    write('live/execution-tests.json', read('artifacts/tests.json'));
  }
  const totals = cost(attempts);
  const ledger = { status: 'LIVE_COMPLETE', cap: 120, remainingAttempts: 120 - attempts.length,
    ...totals, documentsCreated: documents.length, sharedSnapshot: events[0].sharedSnapshot,
    firstAttemptAt: attempts[0].at, lastOutcomeAt: outcomes.at(-1).at,
    wallSpanMsIncludingInterruptions: Date.parse(done.at(-1).at) - Date.parse(events[0].at),
    phaseCosts: Object.fromEntries(PHASES.map(phase => [phase, phases[phase].cost])),
    note: 'Recorded request time excludes the interrupted read with no outcome. Phase wall spans include local repairs and pauses; total wall span also includes gaps between invocations. No blind transport retries; owned read reconciliation repeated some setup reads.',
    events };
  const summary = { status: 'LIVE_COMPLETE', completedAt: done.at(-1).at, finalizedAt: new Date().toISOString(),
    documents, tests: read('artifacts/tests.json'), executionTests: read('live/execution-tests.json'),
    executionSourceHash: lastLiveSource, stateHash: hash(state), ledgerHash: hash(events),
    cumulativeCost: totals, remainingAttempts: ledger.remainingAttempts, sixCallTargetMet: true,
    revisionSuccessfulCalls: 6, originalTemplateUnchanged: true, preservation, phases,
    gates: { offlinePreflight: 'PASS', nativeSourceAndGeometry: 'PASS', independentCopy: 'PASS',
      revisionAndPreservation: 'PASS', originalUnchanged: 'PASS', sixCallRevision: 'PASS',
      nativeSolverDOF: 'UNVERIFIED', humanUI: 'UNVERIFIED', manufacturingRelease: 'UNVERIFIED' },
    limitations: ['Separate-editor API simulation, not a human UI test.',
      'Driving native constraints and healthy geometry do not expose exact remaining sketch DOF.',
      'Dimensioned circle sketches and bounded REMOVE extrudes, not native Hole features.',
      'Historical interrupted read remains an unknown allowance outcome and counts against the attempt cap.',
      'Annual account usage is a saved shared snapshot, not a new quota measurement.',
      'No manufacturing package, materials, tolerances, fits, FEA, assemblies, or production approval.',
      'No API PNG requested; external AI/provider cost is not measured.'] };
  write('artifacts/call-ledger.json', ledger);
  write('artifacts/summary.json', summary);
  write('artifacts/preservation.json', { ...preservation, originalTemplateUnchanged: true,
    sourceMicroversion: phases.setup.microversion, finalOriginalMicroversion: phases.validation.microversion });
  return { status: summary.status, testsPassed: summary.tests.passed, executionTestsPassed: summary.executionTests.passed,
    documents, cumulativeCost: totals, remainingAttempts: ledger.remainingAttempts,
    timings: Object.fromEntries(PHASES.map(phase => [phase, { cost: phases[phase].cost,
      completedInvocationMs: phases[phase].completedInvocationMs, wallSpanMsIncludingInterruptions: phases[phase].wallSpanMsIncludingInterruptions }])),
    totalWallSpanMsIncludingInterruptions: ledger.wallSpanMsIncludingInterruptions,
    firstAttemptAt: ledger.firstAttemptAt, lastOutcomeAt: ledger.lastOutcomeAt,
    geometry: Object.fromEntries(PHASES.map(phase => [phase, phases[phase].measurements])),
    constraints: Object.fromEntries(PHASES.map(phase => [phase, { features: phases[phase].featureCount,
      sketches: phases[phase].sketches.length, constraints: phases[phase].sketches.reduce((sum, sketch) => sum + sketch.constraints.length, 0),
      libraryVersion: phases[phase].libraryVersion, microversion: phases[phase].microversion }])), preservation };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(finish(), null, 2));
}