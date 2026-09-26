import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compilerProbeSource } from './compiler-probe.mjs';
import { featureSource, loadLocalFixture, sha256 } from './generate.mjs';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const json = name => JSON.parse(read(name));

test('parent failures and successful minimal probe remain separate with no invented raw response or source identity', () => {
  const first = json('artifacts/compile-repair-1.json');
  const second = json('artifacts/compile-attempt-2.json');
  const success = json('artifacts/compiler-probe-success.json');
  assert.equal(second.reportedErrorText, first.parentReportedCall.response.result);
  assert.equal(second.localRepair1ReferenceSha256, first.repairedSourceSha256);
  assert.equal(second.localReferenceIsNotSubmittedByteIdentity, true);
  for (const observation of [second, success]) {
    assert.equal(observation.attribution, 'PARENT_REPORTED_NOT_INDEPENDENTLY_RETRIEVED');
    assert.equal(observation.rawResponse, null);
    assert.equal(observation.submittedSource, null);
    assert.equal(observation.submittedSourceSha256, null);
    assert.equal(observation.serverMeasurements, null);
  }
  assert.equal(second.serverTestsRan, false);
  assert.equal(second.syntaxDiagnostic, null);
  assert.equal(success.serverTestsRan, true);
  assert.equal(success.geometryTestsRan, false);
  assert.deepEqual(success.parentReportedFields, {
    passed: true, notices: 'none', consoleMarker: 'OFFICIAL_COMPILER_PROBE_OK',
    sourceMicroversion: '14a9aeceee5d7c8401552b42', libraryVersion: 3070, serializationVersion: '1.2.21',
  });
});

test('historical declaration preparation preserves exact payload bytes and its then-unspent final repair', async () => {
  const investigation = json('artifacts/compiler-investigation.json');
  const source = read('artifacts/compiler-declaration-probe.fs');
  const payload = json('artifacts/compiler-declaration-probe.payload.json');
  const { task } = await loadLocalFixture();
  assert.deepEqual(Object.keys(payload), ['code']);
  assert.equal(payload.code, source);
  assert.equal(source, compilerProbeSource(task));
  assert.equal(source.length, investigation.probe.sourceCharacters);
  assert.equal(sha256(source), investigation.probe.sourceSha256);
  assert.equal(investigation.probe.status, 'NOT_SUBMITTED');
  assert.equal(investigation.compilerRepairsUsed, 1);
  assert.equal(investigation.compilerRepairCap, 2);
  assert.equal(investigation.finalRepair2Produced, false);
  assert.equal(investigation.productionRedispatchAllowed, false);
  assert.equal(investigation.parentReportedTestFeatureCalls, 3);
  assert.equal(investigation.parentReportedGeometryTestsRan, false);
  assert.equal(investigation.authenticatedRequestsByThisContinuation, 0);
  assert.equal(investigation.officialToolCallsByThisContinuation, 0);
  for (const path of Object.values(investigation.observations)) json(path.replace('trials/official-mcp/', ''));
  assert.equal(read('intake.fs'), featureSource(task));
  const first = json('artifacts/compile-repair-1.json');
  assert.equal(sha256(read('artifacts/test-feature.fs')), first.repairedSourceSha256);
});