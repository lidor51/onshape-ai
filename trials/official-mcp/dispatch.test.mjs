import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compactDispatchSource as dispatchSource, loadLocalFixture, sha256 } from './generate.mjs';
import { retainedReadbackPayload, revisionPayload } from './bind-retained.mjs';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const { task } = await loadLocalFixture();
const baseline = dispatchSource(task, 'retained');
const revision = dispatchSource(task, 'retained', false);
const discovery = { status: 'PUBLIC_MANAGED_WORKSPACE_IDENTIFIED_NOTES_ABSENT', documents: [{
  id: 'a'.repeat(24), name: 'FeatureScript MCP Workspace', isPublic: true, defaultWorkspaceId: 'b'.repeat(24),
}] };
const identity = { did: 'a'.repeat(24), wid: 'c'.repeat(24), featureStudioEid: 'd'.repeat(24), partStudioEid: 'e'.repeat(24),
  featureId: 'test-feature-id', parentValidatedCreateResponse: true, parentValidatedSelfTest: true, clean: false };

test('dispatch artifacts are actual tool parameter maps with exact source bytes and manifest hashes', () => {
  const testPayload = JSON.parse(read('artifacts/test-feature.payload.json'));
  const createPayload = JSON.parse(read('artifacts/create-geometry.payload.json'));
  assert.deepEqual(Object.keys(testPayload), ['code']);
  assert.deepEqual(Object.keys(createPayload), ['feature_name', 'feature_code', 'clean']);
  assert.equal(testPayload.code, dispatchSource(task));
  assert.equal(createPayload.feature_code, baseline);
  assert.equal(createPayload.feature_name, 'OfficialIntakeRetained');
  assert.equal(createPayload.clean, false);
  assert.equal(read('artifacts/test-feature.fs'), testPayload.code);
  assert.equal(read('artifacts/baseline-feature.fs'), baseline);
  assert.equal(read('artifacts/revision-feature.fs'), revision);
  const manifest = JSON.parse(read('artifacts/dispatch-manifest.json'));
  assert.equal(manifest.sourceVersion, 3070);
  assert.equal(manifest.onshapeCompilation, 'UNVERIFIED');
  assert.deepEqual(manifest.retainedUiControls, []);
  assert.equal(manifest.fixtureProvenance, 'LOCAL_OFFICIAL_SNAPSHOTS_ORIGINAL_FIXTURE_NOT_REREAD');
  for (const source of [testPayload.code, baseline, revision]) assert.ok(source.length <= 14000);
  for (const file of manifest.files) {
    const text = read(file.path.replace('trials/official-mcp/', ''));
    assert.equal(sha256(text), file.sha256);
    assert.equal(Buffer.byteLength(text), file.bytes);
  }
  assert.equal(manifest.modelWrites, 0);
  assert.equal(manifest.persistedGeometryVerified, false);
  assert.equal(manifest.compilerRepairCap, 2);
  assert.equal(manifest.compilerRepairsUsed, 1);
  assert.equal(manifest.parentReportedTestFeatureCalls, 1);
  assert.equal(manifest.parentReportedTestsRan, false);
  assert.equal(manifest.maximumSourceLineCharacters, 1200);
  const failure = JSON.parse(read('artifacts/compile-repair-1.json'));
  assert.equal(failure.attribution, 'PARENT_REPORTED_NOT_INDEPENDENTLY_RETRIEVED');
  assert.equal(failure.parentReportedCall.sourceSha256, '1cc2098bc0fe09711be94b16597ba606d1b59a6f534565747e2ef7b2e85747a2');
  assert.deepEqual(failure.parentReportedCall.response, {
    result: 'Error: could not find Trojan feature spec: no features found. This may indicate syntax errors in the FeatureScript.',
  });
  assert.equal(failure.serverTestsRan, false);
  assert.equal(failure.syntaxDiagnostic, null);
  assert.equal(failure.repairedSourceCompilation, 'UNVERIFIED');
});

test('live discovery contains only approved matched identities and preserves all eight attempted requests', () => {
  const report = JSON.parse(read('artifacts/managed-discovery.json'));
  assert.equal(report.status, 'PUBLIC_MANAGED_WORKSPACE_IDENTIFIED_NOTES_ABSENT');
  assert.equal(report.requestCount, 8);
  assert.equal(report.requests.length, 8);
  assert.equal(report.requests[0].status, 400);
  assert.ok(report.requests.slice(1).every(request => request.status === 200 && request.method === 'GET'));
  assert.deepEqual(report.absentManagedNames, ['FeatureScript MCP Notes']);
  assert.equal(report.documents.length, 1);
  assert.equal(report.documents[0].id, 'f92dc90f7c052de045dd2c4f');
  assert.equal(report.documents[0].defaultWorkspaceId, 'f635457a22317d08c72c7d93');
  assert.equal(report.documents[0].isPublic, true);
  assert.deepEqual(Object.keys(report.documents[0]), ['id', 'name', 'isPublic', 'defaultWorkspaceId']);
  assert.equal(report.rawResponsesSaved, false);
  assert.equal(report.modelWrites, 0);
  assert.equal(report.officialToolInvocations, 0);
  assert.equal(report.keyRotationAttested, false);
});

test('retained binding requires validated new-branch identities within the positively public managed document', () => {
  assert.deepEqual(retainedReadbackPayload(identity, discovery), {
    did: identity.did, wvm: 'w', wvmid: identity.wid, eid: identity.featureStudioEid,
  });
  for (const patch of [{ did: 'f'.repeat(24) }, { wid: 'b'.repeat(24) }, { featureStudioEid: identity.partStudioEid },
    { parentValidatedCreateResponse: false }, { parentValidatedSelfTest: false }, { clean: true }, { featureId: '' }]) {
    assert.throws(() => retainedReadbackPayload({ ...identity, ...patch }, discovery));
  }
  assert.throws(() => retainedReadbackPayload(identity, { ...discovery, status: 'BLOCKED' }));
  assert.throws(() => retainedReadbackPayload(identity, { ...discovery, documents: [{ ...discovery.documents[0], isPublic: false }] }));
});

test('revision binding requires exact source readback and changes only the baseline flag without replacing the feature', () => {
  assert.deepEqual(revisionPayload(identity, discovery, baseline, baseline, revision), {
    did: identity.did, wid: identity.wid, eid: identity.featureStudioEid, code: revision,
  });
  assert.throws(() => revisionPayload(identity, discovery, `${baseline}\n`, baseline, revision), /differs from the tested baseline/);
  assert.throws(() => revisionPayload(identity, discovery, baseline, baseline, `${revision}\n`), /only the source-controlled/);
  assert.equal(identity.featureId, 'test-feature-id');
});