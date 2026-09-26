import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { hash, planPatch, applyPatch } from './patch.mjs';
import { measure } from './model.mjs';
import { revisionPreflight } from './preflight.mjs';
import { healthy, inspectNative, mapFeatures, metadata, preserved, rebind, definition, verifyGeometry } from './verify.mjs';

export const PHASES = Object.freeze(['setup', 'copy', 'simulated-editor', 'revision', 'validation']);
const save = (directory, name, data) => {
  const destination = join(directory, name);
  writeFileSync(`${destination}.tmp`, `${JSON.stringify(data, null, 2)}\n`, { flush: true });
  renameSync(`${destination}.tmp`, destination);
};
const valueOf = (snapshot, name) => snapshot.features.find(feature => feature.featureType === 'assignVariable' &&
  feature.parameters.find(parameter => parameter.parameterId === 'name')?.value === name)?.parameters.find(parameter => parameter.parameterId === 'value')?.expression;

export function requireFeatureSpecs(specifications, candidate) {
  if (!Array.isArray(specifications.featureSpecs)) throw new Error('NATIVE_FEATURE_SPECS_SCHEMA_UNVERIFIED');
  for (const feature of candidate.features) {
    const spec = specifications.featureSpecs.find(item => item.featureType === feature.featureType);
    if (!spec) throw new Error('NATIVE_FEATURE_TYPE_UNVERIFIED');
    const parameterIds = new Set();
    const visit = value => {
      if (!value || typeof value !== 'object') return;
      if (typeof value.parameterId === 'string') parameterIds.add(value.parameterId);
      Object.values(value).forEach(visit);
    };
    visit(spec);
    if (feature.parameters.some(parameter => !parameterIds.has(parameter.parameterId))) throw new Error('NATIVE_PARAMETER_SPEC_UNVERIFIED');
  }
}

export async function executePhase(session, phase, bundle, directory) {
  if (!PHASES.includes(phase)) throw new Error('UNKNOWN_PHASE');
  const { ledger, request } = session;
  const statePath = join(directory, 'state.json');
  const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};
  const lastDone = ledger.events.filter(event => event.kind === 'phase-done').at(-1);
  if (lastDone && lastDone.stateHash !== hash(state)) throw new Error('LIVE_STATE_HASH_MISMATCH');
  const previous = PHASES[PHASES.indexOf(phase) - 1];
  if (previous && !state[previous]) throw new Error('PREVIOUS_PHASE_REQUIRED');
  ledger.startPhase(phase);
  const startedAt = performance.now();
  const previousCount = ledger.summary();
  const getFeatures = role => request(phase, 'getPartStudioFeatures', role, undefined,
    { rollbackBarIndex: -1, includeGeometryIds: true, noSketchGeometry: false });
  async function discover(role) {
    await request(phase, 'getDocument', role);
    const elements = await request(phase, 'getElementsInDocument', role);
    const studios = Array.isArray(elements) ? elements.filter(element => element.elementType === 'PARTSTUDIO') : [];
    if (studios.length !== 1 || !/^[0-9a-f]{24}$/.test(studios[0].id)) throw new Error('PARTSTUDIO_IDENTITY_UNVERIFIED');
    ledger.record({ kind: 'element', role, eid: studios[0].id });
  }
  async function geometry(role, snapshot, candidate) {
    const microversion = metadata(snapshot).sourceMicroversion;
    const bodies = await request(phase, 'getPartStudioBodyDetails', role, undefined,
      { includeGeometricData: true, includeSurfaces: false, includeCompositeParts: false }, microversion);
    const mass = await request(phase, 'getPartStudioMassProperties', role, undefined,
      { massAsGroup: true, useMassPropertyOverrides: false }, microversion);
    const bounds = await request(phase, 'getPartStudioBoundingBoxes', role, undefined,
      { includeHidden: true, includeWireBodies: false }, microversion);
    save(directory, `${phase}-geometry-response.json`, { microversion, bodies, mass, bounds });
    return verifyGeometry(bodies, bounds, mass, candidate.parameters);
  }
  async function add(role, feature, map, previousMetadata) {
    const resolved = rebind(feature, map);
    delete resolved.featureId;
    const body = { btType: 'BTFeatureDefinitionCall-1406', ...metadata(previousMetadata), feature: resolved };
    const response = await request(phase, 'addPartStudioFeature', role, body);
    if (response.featureState?.featureStatus !== 'OK' || !response.feature?.featureId) throw new Error('NATIVE_ADD_FAILED');
    map[feature.featureId] = response.feature.featureId;
    metadata(response);
    return response;
  }
  try {
    if (phase === 'setup') {
      if (!session.document?.('template')) await request(phase, 'createDocument', 'template', { name: 'Native template synthetic left plate', isPublic: true, isEmptyContent: false });
      await discover('template');
      const empty = await getFeatures('template');
      metadata(empty);
      if (empty.features?.length !== 0 && !ledger.resumeOwned) throw new Error('NEW_DOCUMENT_NOT_EMPTY');
      if (!Array.isArray(empty.features) || empty.features.length > bundle.baseline.features.length) throw new Error('UNEXPECTED_PARTIAL_TREE');
      const prefix = { ...bundle.baseline, features: bundle.baseline.features.slice(0, empty.features.length) };
      if (ledger.resumeOwned) inspectNative(prefix, empty);
      const map = mapFeatures(prefix, empty);
      const specifications = await request(phase, 'getPartStudioFeatureSpecs', 'template');
      save(directory, 'native-feature-specs.json', specifications);
      requireFeatureSpecs(specifications, bundle.baseline);
      if (ledger.pendingReconciliation) ledger.reconcileOwned('template', hash(empty));
      let latest = empty;
      for (const feature of bundle.baseline.features.slice(empty.features.length)) latest = await add('template', feature, map, latest);
      const snapshot = await getFeatures('template');
      const native = inspectNative(bundle.baseline, snapshot);
      const measurements = await geometry('template', snapshot, bundle.baseline);
      state.setup = { snapshot, native, measurements };
    } else if (phase === 'copy') {
      const original = await getFeatures('template');
      healthy(original);
      if (hash(definition(original.features)) !== hash(definition(state.setup.snapshot.features)) ||
        original.sourceMicroversion !== state.setup.snapshot.sourceMicroversion) throw new Error('TEMPLATE_CHANGED_BEFORE_COPY');
      await request(phase, 'copyWorkspace', 'template', { newName: 'Native template synthetic editable copy', isPublic: true });
      await discover('copy');
      const snapshot = await getFeatures('copy');
      if (snapshot.features.length !== bundle.baseline.features.length) throw new Error('COPY_TREE_CHANGED');
      if (JSON.stringify(snapshot.features).includes(session.document('template').did)) throw new Error('COPY_SOURCE_REFERENCE');
      const native = inspectNative(bundle.templatecopy, snapshot);
      const measurements = await geometry('copy', snapshot, bundle.templatecopy);
      state.copy = { snapshot, native, measurements, copyOperation: 'copyWorkspace',
        independentNativeTree: true, geometryIdsAssumedStable: false, rebuilt: false };
    } else if (phase === 'simulated-editor') {
      const current = await getFeatures('copy');
      inspectNative(bundle.templatecopy, current);
      if (current.sourceMicroversion !== state.copy.snapshot.sourceMicroversion) throw new Error('STALE_EDITOR_STATE');
      measure(bundle.simulatededitor.parameters);
      const features = ['plateThickness', 'pivotY'].map(name => {
        const feature = structuredClone(current.features.find(item => item.parameters.find(parameter => parameter.parameterId === 'name')?.value === name));
        for (const parameter of feature.parameters) {
          if (['value', 'lengthValue'].includes(parameter.parameterId)) parameter.expression = `${bundle.simulatededitor.parameters[name]} mm`;
        }
        return feature;
      });
      const editorBody = { btType: 'BTUpdateFeaturesCall-1748', ...metadata(current), features };
      save(directory, 'editor-patch-preflight.json', { status: 'PASS', candidateHash: hash(bundle.simulatededitor),
        snapshotHash: hash(current), patchHash: hash(editorBody), measurements: measure(bundle.simulatededitor.parameters) });
      let latest = await request(phase, 'updateFeatures', 'copy', editorBody);
      metadata(latest);
      const map = mapFeatures(bundle.templatecopy, current);
      for (const feature of bundle.simulatededitor.features.slice(-2)) latest = await add('copy', feature, map, latest);
      const snapshot = await getFeatures('copy');
      const native = inspectNative(bundle.simulatededitor, snapshot);
      const measurements = await geometry('copy', snapshot, bundle.simulatededitor);
      state['simulated-editor'] = { snapshot, native, measurements, performedBy: 'separate-editor API simulation', humanUI: 'UNVERIFIED' };
    } else if (phase === 'revision') {
      const current = await getFeatures('copy');
      healthy(current);
      for (const name of ['innerWidth', 'rollerGap']) {
        if (valueOf(current, name) !== valueOf(state['simulated-editor'].snapshot, name)) throw new Error('INTERVENING_AI_OWNED_EDIT');
      }
      inspectNative(bundle.simulatededitor, current);
      const snapshot = { microversion: current.sourceMicroversion, features: current.features };
      const values = { innerWidth: bundle.revision.parameters.innerWidth, rollerGap: bundle.revision.parameters.rollerGap };
      const gate = revisionPreflight(snapshot, snapshot, values, bundle.revision.parameters);
      const patch = planPatch(snapshot, values);
      applyPatch(snapshot, patch);
      save(directory, 'revision-patch-preflight.json', { ...gate, sourceHash: ledger.sourceHash });
      await request(phase, 'updateFeatures', 'copy', { btType: 'BTUpdateFeaturesCall-1748', ...metadata(current),
        features: patch.changes.map(change => change.after) });
      const after = await getFeatures('copy');
      const native = inspectNative(bundle.revision, after);
      const preservation = preserved(current, after, patch.changes);
      const measurements = await geometry('copy', after, bundle.revision);
      const successfulCalls = ledger.summary().successful - previousCount.successful;
      state.revision = { snapshot: after, native, measurements, preservation, successfulCalls, sixCallTargetMet: successfulCalls <= 6 };
    } else {
      const original = await getFeatures('template');
      inspectNative(bundle.baseline, original);
      if (original.sourceMicroversion !== state.setup.snapshot.sourceMicroversion ||
        hash(definition(original.features)) !== hash(definition(state.setup.snapshot.features))) throw new Error('ORIGINAL_TEMPLATE_CHANGED');
      state.validation = { originalTemplateUnchanged: true, microversion: original.sourceMicroversion,
        measurements: await geometry('template', original, bundle.baseline), humanUI: 'UNVERIFIED' };
    }
    state[phase].elapsedMs = performance.now() - startedAt;
    state[phase].cost = ledger.summary().phases[phase];
    save(directory, 'state.json', state);
    ledger.record({ kind: 'phase-done', phase, stateHash: hash(state), elapsedMs: state[phase].elapsedMs });
    return { phase, status: 'PASS', nativeSolverDOF: 'UNVERIFIED', humanUI: 'UNVERIFIED', costs: state[phase].cost };
  } catch (error) {
    const code = /^[A-Z][A-Z0-9_]+$/.test(error.message) ? error.message : 'WORKFLOW_VALIDATION_OR_SCHEMA_FAILED';
    save(directory, `${phase}-failure.json`, { code, costs: ledger.summary(), documents: ledger.events.filter(event => event.kind === 'document') });
    ledger.halt(code);
    throw new Error(code);
  }
}