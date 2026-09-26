import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildPlan } from './model.mjs';
import { runWorkflow } from './workflow.mjs';
import { PocError } from './transport.mjs';

const spec = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));
const baseline = buildPlan(spec);
const revision = buildPlan(spec, 'revision');

function syntheticServer(options = {}) {
  const calls = [];
  const features = [];
  const names = new Map();
  const exclusions = new Map();
  let updates = 0;
  const document = { id: 'newDocOnly', defaultWorkspace: { id: 'newWorkspaceOnly' }, public: false, ...options.document };
  const report = { evidence: 'SYNTHETIC_TEST_ONLY', observed: { featureOperations: [], stages: {} } };
  const plan = () => updates > 0 ? revision : baseline;
  const boxFor = part => Object.fromEntries(['low', 'high'].flatMap(side => ['X', 'Y', 'Z'].map((axis, index) => [`${side}${axis}`, part.boundsMm[side][index] / 1000])));
  function bodyFor(part, index) {
    const holes = [...part.holes];
    if (/Roller|Shaft|coralReference/.test(part.key)) holes.push({
      centerYZMm: [1, 2].map(axis => (part.boundsMm.low[axis] + part.boundsMm.high[axis]) / 2),
      diameterMm: part.boundsMm.high[1] - part.boundsMm.low[1],
    });
    return {
      id: `part${index}`, type: 'SOLID', faces: holes.map((hole, holeIndex) => ({
        id: `face${index}_${holeIndex}`,
        surface: { type: 'CYLINDER', radius: hole.diameterMm / 2000, origin: { x: 0, y: hole.centerYZMm[0] / 1000, z: hole.centerYZMm[1] / 1000 }, axis: { x: 1, y: 0, z: 0 } },
        box: { minCorner: { x: part.boundsMm.low[0] / 1000 }, maxCorner: { x: part.boundsMm.high[0] / 1000 } },
        area: Math.PI * hole.diameterMm * (part.boundsMm.high[0] - part.boundsMm.low[0]) / 1000000,
      })),
    };
  }
  const client = { origin: 'https://cad.onshape.com', async request(method, path, body, operation) {
    calls.push({ method, path, body, operation });
    if (operation === 'createPrivateDocument' || operation === 'createPublicDocument') {
      assert.equal(body.isPublic, operation === 'createPublicDocument');
      assert.equal(body.isEmptyContent, true);
      if (options.createError) throw new PocError(options.createError);
      return document;
    }
    if (operation === 'confirmPrivateDocument' || operation === 'confirmPublicDocument') return options.confirmedDocument ?? document;
    if (operation === 'createPartStudio') return { id: 'newStudioOnly' };
    if (['getEmptyFeatureList', 'getFeatureCursor', 'inspectFeatures'].includes(operation)) return {
      serializationVersion: 'synthetic', libraryVersion: 2960, sourceMicroversion: 'syntheticMicroversion',
      features, defaultFeatures: [{ featureId: 'Right' }],
      featureStates: Object.fromEntries(features.map(feature => [feature.featureId, { featureStatus: 'OK' }])),
    };
    if (operation === 'addFeature') {
      const feature = { ...structuredClone(body.feature), featureId: `feature${features.length}` };
      features.push(feature);
      return { feature, featureState: { featureStatus: options.featureError ? 'ERROR' : 'OK' } };
    }
    if (operation === 'updateFeature') {
      assert.ok(path.endsWith(`/featureid/${body.feature.featureId}`));
      assert.equal(body.rejectMicroversionSkew, true);
      const index = features.findIndex(feature => feature.featureId === body.feature.featureId);
      assert.ok(index >= 0);
      features[index] = structuredClone(body.feature);
      updates++;
      return { feature: features[index], featureState: { featureStatus: 'OK' } };
    }
    if (operation === 'getParts') return features.filter(feature => feature.featureType === 'extrude').map((feature, index) => ({
      partId: `part${index}`, bodyType: 'solid', isMesh: false, name: names.get(`part${index}`) ?? feature.name,
    }));
    const partId = path.split('/').at(-1);
    if (['getPartMetadata', 'verifyPartMetadata'].includes(operation)) return { properties: [
      { name: 'Name', propertyId: 'nameProperty', value: names.get(partId), editable: true },
      { name: 'Exclude from BOM', propertyId: 'excludeProperty', value: exclusions.get(partId) ?? false, valueType: 'BOOLEAN', editable: true },
    ] };
    if (operation === 'updatePartMetadata') {
      names.set(partId, body.properties.find(property => property.propertyId === 'nameProperty').value);
      exclusions.set(partId, body.properties.some(property => property.propertyId === 'excludeProperty' && property.value));
      return {};
    }
    if (operation === 'inspectBodies') return { bodies: plan().predicted.parts.map(bodyFor) };
    if (operation === 'inspectPartBounds') {
      const index = Number(path.match(/\/partid\/part(\d+)\//)[1]);
      const box = boxFor(plan().predicted.parts[index]);
      if (options.badBounds) box.highX += 0.01;
      return box;
    }
    if (operation === 'renderShadedView' || operation === 'startStepExport') throw new PocError(options.mediaError ?? 'SYNTHETIC_CAPABILITY_UNAVAILABLE');
    throw new Error(`Unmocked operation ${operation}`);
  } };
  return { client, report, calls };
}

test('synthetic controller creates once, adds 18 features, updates 12 IDs, measures both stages and attempts media', async () => {
  const server = syntheticServer();
  await runWorkflow({ ...server, baseline, revision, wait: async () => {} });
  assert.equal(server.calls.filter(call => call.operation === 'createPrivateDocument').length, 1);
  assert.equal(server.calls.filter(call => call.operation === 'addFeature').length, 18);
  assert.equal(server.calls.filter(call => call.operation === 'updateFeature').length, 12);
  assert.equal(server.calls.filter(call => call.operation === 'renderShadedView').length, 4);
  assert.equal(server.calls.filter(call => call.operation === 'startStepExport').length, 2);
  assert.ok(server.calls.every(call => call.method !== 'DELETE'));
  const observed = server.report.observed;
  assert.equal(observed.featureIdsPreserved, true);
  assert.equal(observed.coralBomExclusion, 'CONFIRMED');
  assert.equal(observed.fullAcceptance, false);
  for (const [stage, width, gap] of [['baseline', 340, 100], ['revision', 360, 95]]) {
    assert.equal(observed.stages[stage].partCount, 9);
    assert.ok(Math.abs(observed.stages[stage].innerWidthMm - width) < 1e-9);
    assert.ok(Math.abs(observed.stages[stage].rollerGapMm - gap) < 1e-9);
    assert.equal(observed.stages[stage].geometryChecksPassed, true);
    assert.equal(observed.stages[stage].step.status, 'FAILED_OR_UNSUPPORTED');
  }
});

test('public mode verifies both creation and readback visibility before modeling', async () => {
  const server = syntheticServer({ document: { public: true } });
  await runWorkflow({ ...server, baseline, revision, publicDocument: true });
  assert.equal(server.report.observed.publicConfirmed, true);
  assert.equal(server.report.observed.provenance.requestedPublic, true);
  assert.equal(server.calls.filter(call => call.operation === 'createPublicDocument').length, 1);
  for (const publicValue of [false, undefined]) {
    const failed = syntheticServer({ document: { public: publicValue } });
    await assert.rejects(runWorkflow({ ...failed, baseline, revision, publicDocument: true }), /PUBLIC_DOCUMENT_NOT_CONFIRMED/);
    assert.equal(failed.calls.length, 1);
    const readback = syntheticServer({ document: { public: true }, confirmedDocument: { id: 'newDocOnly', public: publicValue } });
    await assert.rejects(runWorkflow({ ...readback, baseline, revision, publicDocument: true }), /PUBLIC_DOCUMENT_NOT_CONFIRMED/);
    assert.equal(readback.calls.length, 2);
  }
});

test('private response failure halts after creation with no fallback, deletion, or model mutations', async () => {
  for (const document of [{ public: true }, { public: undefined }]) {
    const server = syntheticServer({ document });
    await assert.rejects(runWorkflow({ ...server, baseline, revision }), /PRIVATE_DOCUMENT_NOT_CONFIRMED/);
    assert.equal(server.calls.length, 1);
  }
});

test('observed private-entitlement HTTP 409 stops after one request without retry or fallback', async () => {
  const server = syntheticServer({ createError: 'HTTP_409' });
  await assert.rejects(runWorkflow({ ...server, baseline, revision }), /HTTP_409/);
  assert.deepEqual(server.calls.map(call => call.operation), ['createPrivateDocument']);
  assert.equal(server.report.observed.documentId, undefined);
  assert.deepEqual(server.report.observed.featureOperations, []);
});

test('failed native feature stops and identifies failing logical key', async () => {
  const server = syntheticServer({ featureError: true });
  await assert.rejects(runWorkflow({ ...server, baseline, revision }), /FEATURE_NOT_OK/);
  assert.equal(server.calls.filter(call => call.operation === 'addFeature').length, 1);
  assert.equal(server.report.observed.activeFeature.key, 'leftPlate.profile');
  assert.equal(server.report.observed.activeFeature.returnedStatus, 'ERROR');
});

test('measured baseline mismatch blocks revision instead of counting mock completion', async () => {
  const server = syntheticServer({ badBounds: true });
  await assert.rejects(runWorkflow({ ...server, baseline, revision }), /GEOMETRY_VALIDATION_FAILED/);
  assert.equal(server.calls.filter(call => call.operation === 'updateFeature').length, 0);
  assert.equal(server.report.observed.stages.baseline.geometryChecksPassed, false);
});

test('authorization failure on optional media halts without export or revision', async () => {
  for (const mediaError of ['HTTP_401', 'HTTP_403']) {
    const server = syntheticServer({ mediaError });
    await assert.rejects(runWorkflow({ ...server, baseline, revision }), new RegExp(mediaError));
    assert.equal(server.calls.filter(call => call.operation === 'renderShadedView').length, 1);
    assert.equal(server.calls.filter(call => call.operation === 'startStepExport').length, 0);
    assert.equal(server.calls.filter(call => call.operation === 'updateFeature').length, 0);
    assert.equal(server.report.observed.provenance.requestedPrivate, true);
    assert.equal(server.report.observed.privateConfirmed, true);
  }
});

test('resume rejects missing or foreign phase provenance before any request', async () => {
  const server = syntheticServer({ document: { public: true } });
  await assert.rejects(runWorkflow({ ...server, baseline, revision, publicDocument: true, resume: true, phaseId: 'this-phase' }), /OWNED_PHASE_PROVENANCE_REQUIRED/);
  assert.equal(server.calls.length, 0);
});

test('owned resume reads back existing features without recreating features or rewriting matching metadata', async () => {
  const server = syntheticServer({ document: { public: true } });
  await runWorkflow({ ...server, baseline, revision, publicDocument: true, phaseId: 'owned-phase' });
  const previousCalls = server.calls.length;
  await runWorkflow({ ...server, baseline, revision, publicDocument: true, phaseId: 'owned-phase', resume: true });
  const resumed = server.calls.slice(previousCalls);
  assert.equal(resumed.filter(call => call.method === 'POST' && call.operation !== 'startStepExport').length, 0);
  assert.equal(server.report.observed.featureIdsPreserved, true);
});