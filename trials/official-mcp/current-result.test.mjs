import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadLocalFixture, sha256 } from './generate.mjs';
import { parseMeasurements, validateMeasurements } from './final-measurements.mjs';

const read = file => readFileSync(new URL(file, import.meta.url));
const json = file => JSON.parse(read(file));
const current = json('artifacts/current-live-result.json');
const ledger = json(current.accounting.supplementLedger);
const discovery = json(current.accounting.managedDiscoveryLedger);

test('current result is bound to both actual saved phase reports and measured values', () => {
  assert.equal(current.status, 'PASS_BASELINE_AND_REVISION_WITH_SUPPLEMENTAL_REST');
  for (const [phase, stage] of Object.entries(current.phases)) {
    const report = json(stage.report);
    assert.deepEqual(report, ledger.phases[phase]);
    for (const key of ['status', 'phaseRequests', 'cumulativeRequests']) assert.equal(stage[key], report[key]);
    assert.equal(stage.workspaceMicroversion, report.before.microversion);
    assert.equal(stage.namespace, report.before.namespace);
    assert.equal(stage.featureStatus, report.before.state.featureStatus);
    assert.equal(stage.suppressed, report.before.suppressed);
    assert.equal(stage.partCount, report.validation.partCount);
    assert.deepEqual(stage.holesPerPlate, report.validation.holesPerPlate);
    assert.deepEqual(stage.bomExcludedRoles, report.bom.filter(part => part.excludeFromBOM).map(part => part.name));
    assert.equal(stage.stepMemberCount, report.step.members.length);
    for (const [field, reportField] of [['measurements', 'measurements'], ['png', 'png'], ['stepArchive', 'step']]) {
      assert.equal(stage[field], `artifacts/readonly-supplement/${report[reportField].file}`);
      assert.equal(sha256(read(stage[field])), report[reportField].sha256);
    }
    const measured = json(stage.measurements);
    for (const [field, value] of Object.entries(stage.parametersMm)) assert.ok(Math.abs(measured.parametersMm[field] - value) < 1e-5);
  }
});

test('actual retained-source hashes differ from prepared bytes and revision changes only numeric defaults', () => {
  for (const stage of Object.values(current.phases)) {
    const actual = read(stage.source.file);
    assert.equal(actual.length, stage.source.bytes);
    assert.equal(sha256(actual), stage.source.sha256);
    assert.equal(sha256(read(stage.source.localArtifact)), stage.source.localArtifactSha256);
    assert.notEqual(stage.source.sha256, stage.source.localArtifactSha256);
    const source = actual.toString('utf8');
    assert.ok(/precondition\s*\{\s*\}/.test(source));
    assert.equal((source.match(/defineFeature\(/g) ?? []).length, 1);
    assert.ok(!source.includes('isLength('));
  }
  const baseline = read(current.phases.baseline.source.file).toString('utf8');
  const revision = read(current.phases.revision.source.file).toString('utf8');
  assert.equal(revision, baseline.replace('"innerWidth":340,"rollerGap":100', '"innerWidth":360,"rollerGap":95'));
  assert.deepEqual(current.revisionMethod.exposedUiControls, []);
  assert.equal(current.revisionMethod.kind, 'SOURCE_NUMERIC_DEFAULT_EDIT_NOT_PARAMETER_ONLY');
  assert.equal(current.revisionMethod.putFeaturescriptInvocationsParentReported, 1);
  assert.equal(current.revisionMethod.putFeaturescriptReportedResult, null);
  assert.equal(current.revisionMethod.nullWriteResultProvesRegeneration, false);
});

test('saved baseline console passes while revision test remains explicitly parent-attributed without raw output', async () => {
  const { task } = await loadLocalFixture();
  const baseline = current.parentReportedCompletion.baselineTest;
  assert.equal(validateMeasurements(parseMeasurements(read(baseline.savedConsole).toString('utf8')), task, 'baseline').status, baseline.savedConsoleValidator);
  const revision = current.parentReportedCompletion.revisionTest;
  assert.equal(baseline.sourceMicroversion, 'f7ae35ac5545c9d2210f0e83');
  assert.equal(revision.sourceMicroversion, '115bb1bc5897d287c56a0039');
  for (const stage of [baseline, revision]) {
    assert.equal(stage.libraryVersion, 3070);
    assert.deepEqual(stage.notices, []);
    assert.equal(stage.success, true);
  }
  for (const field of ['rawResponse', 'rawResponseSha256', 'savedConsole']) assert.equal(revision[field], null);
  assert.equal(current.parentReportedCompletion.rawToolResponsesCapturedHere, false);
});

test('original failures and preparation snapshots remain historical with unresolved precise cause', () => {
  const history = current.failureHistory;
  const first = json(history.initialFullSourceFailure);
  const second = json(history.repair1FullSourceFailure);
  assert.equal(first.parentReportedCall.response.result, history.reportedErrorText);
  assert.equal(second.reportedErrorText, history.reportedErrorText);
  assert.equal(first.status, 'REPAIRED_LOCALLY_AWAITING_PARENT_TEST_FEATURE');
  assert.equal(second.status, 'PARENT_REPORTED_REPAIR_1_SUBMISSION_FAILED');
  assert.equal(first.serverTestsRan, false);
  assert.equal(second.serverTestsRan, false);
  assert.equal(second.submittedSourceSha256, null);
  assert.equal(history.preciseCompilerCause, null);
  assert.equal(history.fullSourceFailures, 2);
  assert.equal(history.compilerRepairsUsed, history.compilerRepairCap);
  assert.equal(json(history.minimalProbeSuccess).geometryTestsRan, false);
  assert.equal(json(history.declarationPreparationSnapshot).probe.status, 'NOT_SUBMITTED');
  const finalPreparation = json(history.declarationOutcomeAndFinalPreparation);
  assert.equal(finalPreparation.status, 'FINAL_REPAIR_2_OF_2_READY_NOT_EXECUTED');
  assert.equal(finalPreparation.persistedGeometryVerified, false);
  assert.deepEqual(history.declarationProbeWarnings, finalPreparation.declarationProbe.warnings);
  assert.deepEqual(history.baselineSupplementResumes, ledger.phases.baseline.resumes.map(entry => entry.priorBlocker));
});

test('accounting includes both HTTP failures and never treats allocation residual as exact official usage', () => {
  const accounting = current.accounting;
  for (const [summary, requests] of [[accounting.supplement, ledger.requests], [accounting.managedDiscovery, discovery.requests],
    [accounting.allDirectAuthenticatedRest, [...ledger.requests, ...discovery.requests]]]) {
    assert.equal(summary.attempted, requests.length);
    assert.equal(summary.successful, requests.filter(entry => entry.status === 200).length);
    assert.equal(summary.http400, requests.filter(entry => entry.status === 400).length);
  }
  assert.deepEqual(accounting.allDirectAuthenticatedRest, { attempted: 29, successful: 27, http400: 2 });
  const observations = accounting.parentQuotaObservations;
  assert.deepEqual(observations.map(entry => entry.used), [273, 446, 479]);
  for (const entry of observations) assert.equal(entry.remaining, entry.limit - entry.used);
  assert.equal(accounting.observedAllocationDelta, observations.at(-1).used - observations[0].used);
  assert.equal(accounting.residualAfterOtherTrials, accounting.observedAllocationDelta - accounting.otherTrialSuccessfulRequestsParentReported.reduce((sum, value) => sum + value, 0));
  assert.equal(accounting.residualAfterOtherTrials, 92);
  assert.equal(accounting.residualIsExactInstrumentedOfficialCalls, false);
  assert.equal(accounting.exactOfficialInternalRestRequests, null);
});

test('parent invocation count, compiler cap and limitations are explicit rather than universal pass claims', () => {
  const parent = current.parentReportedCompletion;
  assert.equal(Object.values(parent.officialToolCalls).reduce((sum, value) => sum + value, 0), 13);
  assert.equal(parent.officialToolCallTotal, 13);
  assert.equal(current.accounting.parentReportedOfficialToolCalls, 13);
  assert.equal(current.accounting.earlierHandoffOfficialToolCap, 12);
  assert.equal(current.gates.earlierTwelveOfficialToolCap, 'NOT_MET_13_PARENT_REPORTED');
  assert.equal(current.gates.hundredRequestOfficialReserve, 'NOT_ESTABLISHED');
  assert.equal(current.gates.nonCoderUiParameterEditing, 'NOT_MET_EMPTY_PRECONDITION');
  assert.equal(current.gates.parameterOnlyRevision, 'NOT_MET_SOURCE_DEFAULT_EDIT');
  assert.equal(current.gates.humanUiValidation, 'NOT_PERFORMED');
  assert.equal(current.gates.downstreamReferencesAndAssemblyDof, 'UNTESTED');
  assert.equal(current.route.pureOfficialToolCapabilityPass, false);
});

test('retained identity matches public discovery and both actual phase snapshots without claiming a new document', () => {
  const retained = current.retained;
  assert.ok(discovery.documents.some(document => document.id === retained.documentId && document.isPublic === true));
  assert.equal(retained.newDocumentCreatedByTrial, false);
  assert.equal(retained.downstreamReferenceStabilityProven, false);
  assert.equal(retained.assemblyDegreesOfFreedomTested, false);
  for (const phase of Object.keys(current.phases)) {
    const report = ledger.phases[phase];
    for (const [field, targetField] of [['documentId', 'did'], ['workspaceId', 'wid'], ['partStudioId', 'eid'], ['featureStudioId', 'fsid'], ['featureId', 'featureId']]) {
      assert.equal(retained[field], report.target[targetField]);
    }
    assert.equal(retained.featureId, report.before.featureId);
    assert.equal(retained.featureName, report.before.name);
    assert.equal(retained.featureType, report.before.featureType);
    assert.deepEqual(report.before, report.after);
  }
  assert.equal(new URL(retained.documentUrl).pathname, `/documents/${retained.documentId}/w/${retained.workspaceId}/e/${retained.partStudioId}`);
});

test('finalization is offline and keeps historical validation separate from current verification', () => {
  const finalization = current.finalization;
  assert.equal(finalization.mode, 'OFFLINE_ONLY');
  for (const field of ['authenticatedRequests', 'officialToolInvocations', 'credentialReads', 'modelRepairs']) assert.equal(finalization[field], 0);
  assert.equal(finalization.delegationUsed, false);
  assert.equal(finalization.siblingTrialsRead, false);
  assert.equal(finalization.verificationCommand, 'node trials/official-mcp/verify.mjs');
  assert.equal(finalization.verificationTap, 'artifacts/current-tests.tap');
  assert.equal(finalization.verificationReport, 'artifacts/current-local-validation.json');
  assert.equal(json('artifacts/live-status.json').status, 'BLOCKED');
  assert.equal(json('artifacts/continuation.json').officialInvocationCount, 0);
});