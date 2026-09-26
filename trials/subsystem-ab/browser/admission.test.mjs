import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { test } from 'node:test';
import { evaluateAdmission } from './admission.mjs';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const admission = JSON.parse(read('admission.json'));
const paired = JSON.parse(read('paired-results.json'));
const schema = JSON.parse(read('result.schema.json'));
const digest = value => createHash('sha256').update(value).digest('hex');
const receiptUrl = new URL('validation.json', import.meta.url);
const startedAt = new Date().toISOString();
const started = performance.now();
rmSync(receiptUrl, { force: true });

function syntheticReadyRecord() {
  const record = structuredClone(admission);
  record.serviceGate.status = 'RESOLVED';
  record.serviceGate.vendorPermissionEvidence = 'SYNTHETIC TEST ONLY: not vendor permission';
  for (const key of ['sharedPacket', 'preparedPlate']) {
    record.dependencies[key] = { status: 'VERIFIED', path: 'synthetic-test-only', sha256: 'a'.repeat(64) };
  }
  record.dependencies.parentAllowanceEvidence = { status: 'VERIFIED', path: 'synthetic-test-only' };
  record.tooling.browserCapabilityStatus = 'AVAILABLE';
  record.dependencies.independentRoutes.browser.observedModel = 'GPT-6 Astra';
  record.dependencies.independentRoutes.browser.status = 'VERIFIED';
  return record;
}

const checks = [
  ['current source restriction yields BLOCKED before any technical assessment', () => {
    assert.deepEqual(evaluateAdmission(admission), { status: 'BLOCKED', reasonCode: admission.reasonCode });
    assert.equal(admission.status, 'BLOCKED');
    assert.equal(admission.technicalFailure, false);
    assert.equal(admission.accounting.officialPublicPageFetches, 2);
    assert.equal(admission.accounting.officialPublicPageFetchCap, 3);
    assert.equal(admission.accounting.fetchWebpageToolCalls, 1);
    assert.ok(admission.accounting.officialPublicPageFetches <= admission.accounting.officialPublicPageFetchCap);
    for (const key of ['directOnshapeApiCalls', 'authenticatedOnshapeRequests', 'onshapeMcpCalls', 'browserToolInvocations', 'individualUiActions', 'loginActions', 'documentsCreated']) {
      assert.equal(admission.accounting[key], 0, key);
    }
  }],
  ['same-day offline finalization closes the browser stage without new fetches or design questions', () => {
    assert.equal(admission.finalization.state, 'CLOSED');
    assert.equal(admission.finalization.finalizedOn, '2026-09-12');
    assert.equal(admission.finalization.outcome, evaluateAdmission(admission).status);
    assert.equal(admission.finalization.newPublicPageFetches, 0);
    assert.equal(admission.finalization.newFetchWebpageToolCalls, 0);
    assert.equal(admission.finalization.comparisonRankable, false);
    assert.equal(admission.finalization.apiOutcome, 'PARENT_OWNED_NOT_READ');
    assert.equal(admission.userAuthorization.furtherDesignQuestionsNeeded, false);
    assert.equal(admission.userAuthorization.vendorApprovalImplied, false);
    assert.equal(admission.serviceGate.status, 'UNRESOLVED');
    assert.equal(admission.serviceGate.vendorPermissionEvidence, null);
    assert.equal(admission.serviceGate.supersedingTermsEvidence, null);
    assert.equal(admission.dependencies.waiting, false);
    assert.equal(admission.dependencies.liveExecutionReady, false);
    assert.equal(admission.dependencies.browserSession.authenticationObserved, false);
    assert.equal(admission.localPreparation.siblingResultsRead, false);
    for (const key of ['sharedPacket', 'preparedPlate', 'parentAllowanceEvidence']) {
      assert.equal(admission.dependencies[key].status, 'UNVERIFIED');
      assert.equal(admission.dependencies[key].path, null);
    }
  }],
  ['user consent, parent tools and ready packet cannot override unresolved policy', () => {
    const record = syntheticReadyRecord();
    record.serviceGate = structuredClone(admission.serviceGate);
    assert.equal(evaluateAdmission(record).reasonCode, 'UNRESOLVED_AUTOMATION_RESTRICTION');
    record.serviceGate.status = 'RESOLVED';
    assert.equal(evaluateAdmission(record).reasonCode, 'UNRESOLVED_AUTOMATION_RESTRICTION');
    assert.equal(admission.tooling.loaderAbsenceIsSoleBlocker, false);
    assert.equal(admission.tooling.browserRuntimeTested, false);
    assert.equal(admission.tooling.toolSearchCallable, null);
    assert.equal(admission.tooling.priorObservation.checkedDate, '2026-09-12');
    assert.equal(admission.tooling.priorObservation.toolSearchCallable, false);
  }],
  ['packet, allowance, tools and independent GPT6 remain separate prerequisites', () => {
    const changes = [
      ['WAITING_FOR_PARENT_PACKET', record => { record.dependencies.sharedPacket.sha256 = null; }],
      ['WAITING_FOR_PARENT_PACKET', record => { record.dependencies.preparedPlate.status = 'WAITING_FOR_PARENT'; }],
      ['WAITING_FOR_PARENT_ALLOWANCE_EVIDENCE', record => { record.dependencies.parentAllowanceEvidence.path = null; }],
      ['PARENT_TOOL_HANDOFF_REQUIRED', record => { record.tooling.browserCapabilityStatus = 'UNVERIFIED'; }],
      ['SEPARATE_GPT6_BROWSER_ROUTE_UNVERIFIED', record => { record.dependencies.independentRoutes.browser.observedModel = 'fallback'; }]
    ];
    for (const [expected, change] of changes) {
      const record = syntheticReadyRecord();
      change(record);
      assert.equal(evaluateAdmission(record).reasonCode, expected);
    }
    assert.deepEqual(evaluateAdmission(syntheticReadyRecord()), { status: 'ADMISSIBLE', reasonCode: 'BOUNDED_UI_SMOKE_ONLY' });
    assert.equal(admission.serviceGate.vendorPermissionEvidence, null);
  }],
  ['unexecuted paired results keep measurements null and distinguish unread API results', () => {
    assert.equal(paired.dependenciesWaiting, false);
    assert.equal(paired.documentationReady, true);
    assert.equal(paired.sharedPacketSha256, null);
    assert.equal(paired.comparison.status, 'BLOCKED');
    assert.equal(paired.arms.browser.status, 'BLOCKED');
    assert.equal(paired.arms.browser.executionAttempted, false);
    assert.equal(paired.arms.browser.phases[0].reasonCode, 'PARENT_OWNED_NOT_READ');
    assert.equal(paired.arms.api.status, 'UNVERIFIED');
    assert.equal(paired.arms.api.executionAttempted, null);
    for (const [key, value] of Object.entries(paired.comparison)) {
      if (key !== 'status') assert.equal(value, null, key);
    }
    const requiredPhases = ['shared_preparation', 'ui_plate_smoke', 'baseline_solids_placements', 'native_instances_mates_motion_limits', 'cots_interfaces_provenance', 'source_parameter_ui_revision', 'resume_unsuppressed_identity_health', 'baseline_revision_exports', 'human_usability', 'physical_manufacturing_release'];
    for (const arm of Object.values(paired.arms)) {
      assert.equal(arm.documentUrl, null);
      assert.deepEqual(arm.phases.map(phase => phase.id), requiredPhases);
      for (const value of Object.values(arm.metrics)) assert.equal(value, null);
      for (const phase of arm.phases) {
        assert.ok(['BLOCKED', 'UNVERIFIED'].includes(phase.status));
        for (const key of ['attempts', 'successes', 'failures', 'recoveries', 'wallTimeMs', 'interventions', 'evidence']) assert.equal(phase[key], null, key);
      }
    }
  }],
  ['schema has resolvable local definitions and null guards for unexecuted arms', () => {
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    for (const match of JSON.stringify(schema).matchAll(/"\$ref":"#\/\$defs\/([^"]+)"/g)) assert.ok(schema.$defs[match[1]], match[1]);
    for (const key of schema.required) assert.ok(Object.hasOwn(paired, key), key);
    for (const arm of Object.values(paired.arms)) {
      for (const key of schema.$defs.arm.required) assert.ok(Object.hasOwn(arm, key), key);
      assert.deepEqual(Object.keys(arm.metrics).sort(), schema.$defs.metrics.required.toSorted());
      for (const phase of arm.phases) assert.deepEqual(Object.keys(phase).sort(), schema.$defs.phase.required.toSorted());
    }
    const unexecuted = schema.$defs.arm.allOf[0].then.properties;
    assert.equal(unexecuted.metrics.additionalProperties.type, 'null');
    assert.equal(unexecuted.phases.items.properties.attempts.type, 'null');
  }],
  ['pilot retains protocol budgets and native source UI resume requirements', () => {
    const protocol = read('../PROTOCOL.md');
    const pilot = read('PILOT.md');
    for (const token of ['150 attempted authenticated', '140 direct requests', 'reserve 10', '500-call reserve', 'GPT-6 Astra', 'Native assembly behavior']) assert.ok(protocol.includes(token), token);
    assert.equal(admission.bounds.directApiBudget, 0);
    assert.equal(admission.bounds.maxNewPublicDocuments, 1);
    assert.equal(admission.bounds.assemblyCheckpointCount, 2);
    assert.equal(admission.bounds.repairCheckpointCountAcrossArm, 1);
    assert.equal(admission.bounds.restartResetsBudget, false);
    for (const key of ['pilot', 'perAssemblyCheckpoint', 'perRepairCheckpoint']) {
      assert.deepEqual(admission.bounds[key], { maxToolInvocations: 60, maxIndividualUiActions: 60, maxActiveMinutes: 15 });
    }
    for (const token of ['source parameter UI', 'assembly mates', 'native motion/limits', 'real UI attempt', 'auth HAR', 'OAuth proxy', 'No blind retries', 'no second smoke doc']) assert.ok(pilot.includes(token), token);
  }],
  ['public evidence is dated with bounded fetches and local artifact links resolve', () => {
    assert.deepEqual(admission.sources.map(source => source.url), ['https://www.onshape.com/en/legal/terms-of-use', 'https://onshape-public.github.io/docs/auth/limits/']);
    assert.equal(admission.sources[0].effectiveDate, '2020-07-15');
    assert.ok(admission.sources[0].excerpt.includes('other automated means to access the Service'));
    assert.ok(admission.sources[1].apiGuidanceExcerpt.includes('The API should be used exclusively'));
    for (const source of admission.sources) {
      assert.equal(source.fetchedOn, '2026-09-12');
      assert.equal(source.fetchedOn, admission.checkedDate);
      assert.equal(source.rawResponseSha256, null);
    }
    for (const name of ['REPORT.md', 'PILOT.md']) {
      for (const match of read(name).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        if (!match[1].startsWith('https://')) assert.ok(existsSync(new URL(match[1], import.meta.url)), match[1]);
      }
    }
  }]
];

let passed = 0;
for (const [name, run] of checks) {
  await test(name, () => {
    run();
    passed += 1;
  });
}

await test('write bounded local validation receipt only after all admission checks pass', () => {
  assert.equal(passed, checks.length);
  const artifacts = ['admission.json', 'admission.mjs', 'admission.test.mjs', 'paired-results.json', 'result.schema.json', 'REPORT.md', 'PILOT.md'];
  const receipt = {
    status: 'PASS',
    scope: 'Local admission contract only; not live browser, authentication, CAD or full JSON Schema validation.',
    startedAt,
    completedAt: new Date().toISOString(),
    wallTimeMs: performance.now() - started,
    nodeVersion: process.version,
    command: 'node --test trials/subsystem-ab/browser/admission.test.mjs',
    contractChecksPassed: passed,
    browserExecutionStatus: evaluateAdmission(admission).status,
    testNetworkCalls: 0,
    testOnshapeApiCalls: 0,
    testBrowserActions: 0,
    evidenceCheckedDate: admission.checkedDate,
    hashScope: 'Exact UTF-8 excerpt bytes and local file bytes, not raw fetched responses.',
    excerptHashes: admission.sources.map(source => ({
      id: source.id,
      url: source.url,
      fetchedOn: source.fetchedOn,
      excerptSha256: digest(source.excerpt),
      apiGuidanceExcerptSha256: source.apiGuidanceExcerpt ? digest(source.apiGuidanceExcerpt) : null
    })),
    artifactHashes: Object.fromEntries(artifacts.map(name => [name, digest(readFileSync(new URL(name, import.meta.url)))])),
    protocolSha256: digest(readFileSync(new URL('../PROTOCOL.md', import.meta.url)))
  };
  writeFileSync(receiptUrl, `${JSON.stringify(receipt, null, 2)}\n`);
});