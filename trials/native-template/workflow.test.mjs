import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { executePhase, PHASES } from './workflow.mjs';
import { stages } from './native.mjs';
import { preflight } from './preflight.mjs';
import { createLiveTransport } from './transport.mjs';
import { ROTATION_CONFIRMATION } from './safety.mjs';
import { rebind } from './verify.mjs';

test('setup and copy are real phase entrypoints; invalid phase ordering makes zero requests', async () => {
  assert.ok(PHASES.includes('setup') && PHASES.includes('copy') && PHASES.includes('revision'));
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-workflow-', import.meta.url)));
  let calls = 0;
  try {
    const session = { ledger: { events: [] }, request: async () => { calls++; } };
    await assert.rejects(executePhase(session, 'copy', stages(), directory), /PREVIOUS_PHASE/);
    await assert.rejects(executePhase(session, 'arbitrary', stages(), directory), /UNKNOWN_PHASE/);
    assert.equal(calls, 0);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('unsupported current native specs stop setup before adding any guessed features', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-workflow-', import.meta.url)));
  const operations = [];
  const events = [];
  const session = { ledger: { events, startPhase: () => {}, record: event => events.push(event),
    halt: () => events.push({ kind: 'halt' }), summary: () => ({ successful: operations.length }) },
    request: async (_phase, operation) => {
      operations.push(operation);
      if (operation === 'getElementsInDocument') return [{ elementType: 'PARTSTUDIO', id: 'a'.repeat(24) }];
      if (operation === 'getPartStudioFeatures') return { sourceMicroversion: 'b'.repeat(24), libraryVersion: 3000,
        serializationVersion: 'fixture', features: [], defaultFeatures: [{ name: 'Right', featureId: 'Right' }, { name: 'Origin', featureId: 'Origin' }] };
      if (operation === 'getPartStudioFeatureSpecs') return { featureSpecs: [] };
      return {};
    } };
  try {
    mkdirSync(directory, { recursive: true });
    await assert.rejects(executePhase(session, 'setup', stages(), directory), /NATIVE_FEATURE_TYPE/);
    assert.ok(!operations.includes('addPartStudioFeature'));
    assert.ok(events.some(event => event.kind === 'halt'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('constructed server end-to-end: copied IDs, editor handoff, six-request revision, original unchanged', async () => {
  const directory = mkdtempSync(fileURLToPath(new URL('./.test-workflow-', import.meta.url)));
  const bundle = stages();
  const binding = { sourceHash: 'end-to-end-source', testHash: 'end-to-end-tests' };
  const tests = { ...binding, status: 'PASS' };
  const server = {};
  let counter = 1;
  const nextId = () => (counter++).toString(16).padStart(24, '0');
  const snapshot = document => ({ features: structuredClone(document.features), sourceMicroversion: document.microversion,
    libraryVersion: 3000, serializationVersion: 'fixture-only', isComplete: true,
    defaultFeatures: [{ name: 'Right', featureId: 'Right' }, { name: 'Origin', featureId: 'Origin' }],
    featureStates: Object.fromEntries(document.features.map(feature => [feature.featureId, { featureStatus: 'OK' }])) });
  function geometricResponse(document, operation) {
    const candidate = Object.fromEntries(document.features.filter(feature => feature.featureType === 'assignVariable')
      .map(feature => [feature.parameters.find(parameter => parameter.parameterId === 'name').value,
        Number.parseFloat(feature.parameters.find(parameter => parameter.parameterId === 'value').expression)]));
    candidate.units = 'mm';
    candidate.downstream = document.features.some(feature => feature.name.startsWith('Editor downstream'));
    const low = -candidate.innerWidth / 2 - candidate.plateThickness;
    const high = -candidate.innerWidth / 2;
    const holes = [[candidate.frontRollerY, candidate.rollerZ, candidate.shaftHoleDiameter],
      [candidate.frontRollerY + candidate.rollerDiameter + candidate.rollerGap, candidate.rollerZ, candidate.shaftHoleDiameter],
      [candidate.mount1Y, candidate.mount1Z, candidate.mountHoleDiameter], [candidate.mount2Y, candidate.mount2Z, candidate.mountHoleDiameter],
      [candidate.pivotY, candidate.pivotZ, candidate.pivotHoleDiameter], ...(candidate.downstream ? [[200, 40, 4]] : [])];
    if (operation === 'boundingboxes') return { lowX: low / 1000, highX: high / 1000, lowY: 0, highY: candidate.plateLength / 1000,
      lowZ: candidate.plateBottomZ / 1000, highZ: (candidate.plateBottomZ + candidate.plateHeight) / 1000 };
    if (operation === 'massproperties') {
      const volume = (candidate.plateLength * candidate.plateHeight - holes.reduce((area, hole) => area + Math.PI * (hole[2] / 2) ** 2, 0)) * candidate.plateThickness / 1e9;
      return { bodies: { '-all-': { volume: [volume, volume, volume] } } };
    }
    const body = { id: `FAKE-${document.microversion}`, type: 'SOLID', edges: [], faces: [] };
    for (const [index, [centerY, centerZ, diameter]] of holes.entries()) {
      const edges = [low, high].map((faceX, side) => ({ id: `edge-${index}-${side}`,
        curve: { type: 'CIRCLE', origin: { x: faceX / 1000, y: centerY / 1000, z: centerZ / 1000 } },
        geometry: { length: Math.PI * diameter / 1000 } }));
      body.edges.push(...edges);
      body.faces.push({ surface: { type: 'CYLINDER', origin: { x: 0, y: centerY / 1000, z: centerZ / 1000 }, direction: { x: 1, y: 0, z: 0 } },
        area: Math.PI * diameter * candidate.plateThickness / 1e6, loops: edges.map(edge => ({ coedges: [{ edgeId: edge.id }] })) });
    }
    return { bodies: [body] };
  }
  const options = { live: true, rotationConfirmation: ROTATION_CONFIRMATION, approvedOrigin: 'https://cad.onshape.com',
    newPublic: true, maxDocuments: 2, acceptUnvalidatedNativeCandidate: true, reserveNative: 120, reserveManufacturing: 80,
    reserveOfficial: 100, annualSafety: 500, annualLimit: 2500, annualUsed: 273, reservationSnapshot: '2026-09-11' };
  const session = createLiveTransport({ options, report: preflight(bundle, tests, binding), bundle, tests, binding, directory,
    credentialProvider: () => ({ accessKey: 'FAKE', secretKey: 'FAKE' }),
    fetchFn: async (url, request) => {
      const path = new URL(url).pathname;
      const body = request.body ? JSON.parse(request.body) : undefined;
      if (path === '/api/v17/documents') {
        const id = nextId();
        server[id] = { wid: nextId(), eid: nextId(), microversion: nextId(), features: [] };
        return Response.json({ id, defaultWorkspace: { id: server[id].wid } });
      }
      const did = path.match(/\/documents\/(?:d\/)?([0-9a-f]{24})/)?.[1] ?? path.match(/\/partstudios\/d\/([0-9a-f]{24})/)?.[1];
      const document = server[did];
      assert.ok(document, 'only test-owned documents');
      if (path.endsWith('/copy')) {
        const id = nextId();
        const map = Object.fromEntries(document.features.map(feature => [feature.featureId, nextId()]));
        server[id] = { wid: nextId(), eid: nextId(), microversion: nextId(), features: rebind(document.features, map) };
        return Response.json({ newDocumentId: id, newWorkspaceId: server[id].wid });
      }
      if (path === `/api/v17/documents/${did}`) return Response.json({ id: did, public: true });
      if (path.endsWith('/elements')) return Response.json([{ id: document.eid, elementType: 'PARTSTUDIO' }]);
      if (path.endsWith('/featurespecs')) return Response.json({ featureSpecs: [...new Set(bundle.baseline.features.map(feature => feature.featureType))]
        .map(featureType => ({ featureType, parameters: bundle.baseline.features.filter(feature => feature.featureType === featureType).flatMap(feature => feature.parameters) })) });
      if (request.method === 'POST') {
        assert.equal(body.sourceMicroversion, document.microversion);
        assert.equal(body.rejectMicroversionSkew, true);
        document.microversion = nextId();
        if (path.endsWith('/updates')) {
          document.features = document.features.map(feature => body.features.find(update => update.featureId === feature.featureId) ?? feature);
          return Response.json(snapshot(document));
        }
        const feature = { ...body.feature, featureId: nextId() };
        document.features.push(feature);
        return Response.json({ ...snapshot(document), feature, featureState: { featureStatus: 'OK' } });
      }
      if (path.endsWith('/features')) return Response.json(snapshot(document));
      assert.ok(path.includes(`/m/${document.microversion}/`), 'geometry pinned to observed microversion');
      return Response.json(geometricResponse(document, path.split('/').at(-1)));
    } });
  try {
    for (const phase of PHASES) await executePhase(session, phase, bundle, directory);
    const state = JSON.parse(readFileSync(`${directory}/state.json`, 'utf8'));
    assert.equal(state.revision.successfulCalls, 6);
    assert.equal(state.validation.originalTemplateUnchanged, true);
    assert.equal(state.revision.measurements.holes.length, 6);
    assert.notEqual(state.copy.native.map['plate-extrude'], state.setup.native.map['plate-extrude']);
    assert.equal(session.ledger.summary().documentSlots, 2);
    assert.ok(session.ledger.summary().attempted < 120);
    assert.equal(state['simulated-editor'].humanUI, 'UNVERIFIED');
  } finally { session.close(); rmSync(directory, { recursive: true, force: true }); }
});