import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { expectedModel, featureSource, loadLocalFixture, sha256 } from './generate.mjs';
import { ENDPOINT } from './protocol.mjs';

const directory = fileURLToPath(new URL('./', import.meta.url));
const read = path => readFileSync(resolve(directory, path), 'utf8');
const { task, fixtureSha256, fixtureProvenance } = await loadLocalFixture();

test('current README names the actual server and distinguishes completed modeling from supplemental evidence', () => {
  const readme = read('README.md');
  assert.ok(readme.includes('onshape-official-featurescript'));
  assert.ok(!readme.includes('onshapeOfficial'));
  assert.ok(!readme.includes('BLOCKED: authentication required'));
  assert.ok(readme.includes('parent-observed evidence'));
  assert.ok(readme.includes('Baseline and persisted revision PASS'));
  assert.ok(readme.includes('not a pure official-tool capability pass'));
  assert.ok(readme.includes('empty precondition and numeric defaults'));
  assert.ok(readme.includes('source-default edit, not parameter-only'));
  assert.ok(readme.includes('`clean: false`'));
});

test('generated source and both expectation artifacts are bound to local fixture snapshots and source', () => {
  const source = read('intake.fs');
  assert.equal(source, featureSource(task));
  for (const [phase, overrides] of [['baseline', {}], ['revision', task.revision]]) {
    const artifact = JSON.parse(read(`artifacts/${phase}.json`));
    assert.equal(artifact.fixtureSha256, fixtureSha256);
    assert.equal(artifact.fixtureProvenance, fixtureProvenance);
    assert.equal(artifact.sourceSha256, sha256(source));
    assert.equal(artifact.serverCompilation, 'UNVERIFIED');
    assert.equal(artifact.serverMeasurements, null);
    const expected = expectedModel(task, overrides);
    for (const [key, value] of Object.entries(expected)) assert.deepEqual(artifact[key], value);
  }
});

test('immutable live evidence proves only the unsigned challenge and metadata, not CAD or tool discovery', () => {
  const probe = JSON.parse(read('artifacts/probe-2026-09-11T12-54-34-006Z.json'));
  assert.equal(probe.endpoint, ENDPOINT);
  assert.equal(probe.status, 'BLOCKED');
  assert.equal(probe.blocker, 'AUTHENTICATION_REQUIRED');
  assert.deepEqual(probe.requests.map(request => request.status), [401, 200, 200]);
  assert.deepEqual(probe.requests.map(request => request.purpose),
    ['initialize', 'protected-resource-metadata', 'authorization-server-metadata']);
  assert.equal(probe.requests[0].headers.authentication.scheme, 'bearer');
  assert.equal(probe.oauth.protectedResource.resourceMatchesEndpoint, true);
  assert.equal(probe.oauth.authorizationServers[0].issuerMatches, true);
  assert.equal(probe.toolsListStatus, 'NOT_ATTEMPTED');
  assert.deepEqual(probe.tools, []);
  assert.equal(probe.cadCreated, false);
  assert.equal(probe.retries, 0);
});

test('historical live evidence contains no credential fields and preserves its original blocked acceptance', () => {
  function inspect(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
      assert.ok(!/^(access_token|refresh_token|id_token|client_secret|authorization|cookie|set-cookie|mcp-session-id)$/i.test(key), key);
      inspect(nested);
    }
  }
  inspect(JSON.parse(read('artifacts/probe-latest.json')));
  const status = JSON.parse(read('artifacts/live-status.json'));
  assert.equal(status.status, 'BLOCKED');
  assert.equal(status.blocker, 'REQUIRED_TOOL_SEARCH_NOT_CALLABLE');
  assert.equal(status.subscriptionConfirmed, true);
  assert.equal(status.standardClientOAuthCompleted, true);
  assert.equal(status.authenticatedCadCalls, 0);
  assert.equal(status.documentCreationAttempts, 0);
  assert.equal(status.authorization.maximumNewDocuments, 3);
  assert.equal(status.authorization.explicitPublicFlagRequired, true);
  assert.equal(status.authorization.positiveVisibilityVerificationRequired, true);
  assert.equal(status.toolExecutionPlan, null);
  for (const field of ['serverPartCount', 'serverHoleEvidence', 'onshapeRenderedImage', 'stepExport']) {
    assert.equal(status[field], null);
  }
});

test('continuation records exposed contracts without inventing loading, invocation, geometry, or quota evidence', () => {
  const evidence = JSON.parse(read('artifacts/continuation.json'));
  const contracts = JSON.parse(read('artifacts/continuation-tool-contracts.json'));
  const status = JSON.parse(read('artifacts/live-status.json'));
  assert.equal(contracts.serverName, 'onshape-official-featurescript');
  assert.equal(contracts.freshToolsListResponse, false);
  assert.equal(contracts.loader.callableInThisSession, false);
  assert.equal(contracts.loader.searchAttempted, false);
  assert.deepEqual(contracts.loader.loadedOfficialTools, []);
  assert.equal(contracts.tools.length, status.exposedToolContractCount);
  assert.equal(new Set(contracts.tools.map(tool => tool.name)).size, contracts.tools.length);
  const create = contracts.tools.find(tool => tool.name === 'mcp_featurescript_create_geometry');
  assert.deepEqual(Object.keys(create.properties), ['feature_name', 'feature_code', 'clean']);
  assert.equal(create.defaults.clean, true);
  assert.deepEqual(create.mandatoryAuthorizedOverride, {clean: false});
  assert.equal(create.documentSelectorExposed, false);
  assert.equal(create.publicVisibilityFlagExposed, false);
  assert.equal(create.sameWorkspaceRevisionSupportedByThisTool, false);
  assert.ok(contracts.tools.some(tool => tool.name === 'mcp_featurescript_test_feature'));
  assert.deepEqual(evidence.officialInvocations, []);
  assert.equal(evidence.officialInvocationCount, evidence.officialInvocations.length);
  assert.equal(evidence.officialInvocationCount, status.officialContinuationInvocations);
  assert.equal(evidence.authorization.maximumFurtherOfficialToolInvocations, 12);
  assert.equal(evidence.authorization.maximumRetainedGeometryBranches, 2);
  assert.equal(evidence.authorization.compilerRetryLimit, 2);
  assert.equal(evidence.authorization.planningReserveRequests, 100);
  assert.equal(evidence.authorization.separateOtherNewRequests, 200);
  assert.equal(evidence.authorization.untouchedSafetyReserveRequests, 500);
  assert.equal(evidence.authorization.deletionAllowed, false);
  assert.equal(evidence.quota.initial.remaining, evidence.quota.initial.limit - evidence.quota.initial.used);
  assert.equal(evidence.quota.endObservation, null);
  assert.equal(evidence.quota.observedDelta, null);
  assert.equal(evidence.quota.exactSelfRestRequests, null);
  assert.equal(evidence.authentication.observedDirectlyInThisContinuation, false);
  assert.equal(evidence.sourceReadiness.sourceModifiedInContinuation, false);
  assert.equal(evidence.sourceReadiness.existingVersion, 2500);
  assert.equal(evidence.sourceReadiness.serverCompilation, 'UNVERIFIED');
  assert.deepEqual(evidence.retainedGeometryBranches, []);
  for (const field of ['sandboxIdentifiers', 'sandboxDedicated', 'sandboxPublic', 'detectedLibraryVersion']) {
    assert.equal(evidence[field], null);
  }
  for (const field of ['serverPartCount', 'serverBounds', 'serverHoleMeasurements',
    'serverFeatureDiagnostics', 'persistedModelReadback', 'documentUrl', 'imageUrl', 'stepExportUrl']) {
    assert.equal(evidence.acceptance[field], null);
  }
  assert.deepEqual(evidence.acceptance.baselineParametersExpectedMm, {innerWidth: 340, rollerGap: 100});
  assert.deepEqual(evidence.acceptance.revisionParametersExpectedMm, {innerWidth: 360, rollerGap: 95});
  assert.equal(evidence.acceptance.expectedSolids, task.requiredParts.length);
  assert.equal(evidence.acceptance.expectedHolesPerPlate, task.plateHolesPerSide);
  assert.equal(evidence.nonOfficialObservations.length, 2);
  for (const entry of evidence.nonOfficialObservations) {
    assert.equal(entry.tool, 'fetch_webpage');
    assert.equal(new URL(entry.parameters.urls[0]).hostname, 'www.onshape.com');
  }
});

test('current and historical docs are ASCII with valid local links and explicit evidence limitations', () => {
  const generatedDuringVerification = ['tests.tap', 'local-validation.json', 'current-tests.tap', 'current-local-validation.json'];
  for (const name of ['README.md', 'REPORT.md', 'SUPPLEMENT-REPORT.md', 'HANDOFF.md']) {
    const text = read(name);
    assert.ok(!/[^\x00-\x7f]/.test(text));
    assert.ok(!/[\t ]+$/m.test(text));
    if (name === 'HANDOFF.md') {
      assert.ok(text.includes('BLOCKED'));
      assert.ok(text.includes('NEW PUBLIC'));
    } else {
      assert.ok(text.includes('artifacts/current-live-result.json'), `${name}: current evidence missing`);
      assert.ok(text.includes('not a pure') || text.includes('not proof of pure'), `${name}: route limitation missing`);
      assert.ok(!text.includes('revision pending'), `${name}: stale current status`);
    }
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^https?:/.test(match[1])) continue;
      const [target, anchor] = match[1].split('#');
      const path = resolve(dirname(resolve(directory, name)), target);
      if (generatedDuringVerification.some(file => path === resolve(directory, 'artifacts', file))) continue;
      assert.ok(existsSync(path), `${name}: missing ${target}`);
      if (anchor) {
        const headings = [...readFileSync(path, 'utf8').matchAll(/^#+ (.+)$/gm)]
          .map(heading => heading[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-'));
        assert.ok(headings.includes(anchor), `${name}: missing anchor ${anchor}`);
      }
    }
  }
});