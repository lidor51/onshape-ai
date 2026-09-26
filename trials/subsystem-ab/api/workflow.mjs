import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { contained } from './admission.mjs';
import { requireThat, sha256 } from './ledger.mjs';
import { assemblyGraph } from './graph.mjs';
import { validateBindingContract } from './v3-binding.mjs';
import { assertHealthy, batchInstances, bindInstances, bindParts, bindPreservedParts, concurrency, customRoles, mateFeature,
  multipartImport, relationFeature, sourceFeature } from './native.mjs';

export async function source(api) {
  const owned = await api.initialize(true);
  const phase = 'sourceUploadVersionInstantiation';
  const studio = await api.call('source-studio', phase, 'createFeatureStudio', owned, { name: 'Concept A editable source' });
  const sourceIds = { ...owned, eid: studio.id };
  const initial = await api.call('source-before', phase, 'getFeatureStudioContents', sourceIds);
  await api.call('source-upload', phase, 'updateFeatureStudioContents', sourceIds,
    { btType: 'BTFeatureStudioContents-2239', ...concurrency(initial), contents: api.packet.source });
  const readback = await api.call('source-readback', phase, 'getFeatureStudioContents', sourceIds);
  requireThat(typeof readback.contents === 'string' && readback.contents.replace(/\r\n/g, '\n') === api.packet.source.replace(/\r\n/g, '\n'),
    'SOURCE_READBACK_MISMATCH');
  const workspaceSpecs = await api.call('source-workspace-specs', phase, 'getFeatureStudioSpecs', sourceIds);
  requireThat(workspaceSpecs.featureSpecs?.some(spec => spec.featureType === 'conceptAShared'), 'SOURCE_COMPILATION_UNVERIFIED');
  const version = await api.call('source-version', phase, 'createVersion', { did: owned.did }, {
    documentId: owned.did, workspaceId: owned.wid, microversionId: readback.sourceMicroversion,
    name: 'Concept A source v1', publishVersion: false });
  const pinned = await api.call('source-pinned-specs', phase, 'getFeatureStudioSpecs', { ...sourceIds, wvm: 'v', wvmid: version.id });
  const spec = pinned.featureSpecs?.find(specification => specification.featureType === 'conceptAShared');
  requireThat(spec?.namespace, 'OBSERVED_SOURCE_NAMESPACE_REQUIRED');
  const partIds = { ...owned, eid: api.element('PARTSTUDIO') };
  const before = await api.call('source-feature-before', phase, 'getPartStudioFeatures', partIds);
  const inserted = await api.call('source-feature', phase, 'addPartStudioFeature', partIds,
    sourceFeature(spec.namespace, api.packet.contract.parameters.baseline, before));
  assertHealthy(inserted);
  const parts = await api.call('source-parts', phase, 'getPartsWMVE', partIds);
  bindParts(parts, customRoles(api.packet), partIds.eid);
  const assemblyIds = { ...owned, eid: api.element('ASSEMBLY') };
  await api.call('native-specs', 'assemblyReadiness', 'getFeatureSpecs', assemblyIds);
  await api.call('native-before', 'assemblyReadiness', 'getFeatures', assemblyIds);
  return { status: 'SOURCE_REGENERATED_NATIVE_ASSEMBLY_NOT_YET_VERIFIED', featureId: inserted.feature.featureId };
}

async function translation(api, key, phase, initial) {
  let result = initial;
  for (let poll = 0; result.requestState === 'ACTIVE' && poll < 2; poll++) {
    await delay(1500 * (poll + 1));
    result = await api.call(`${key}-poll-${poll}`, phase, 'getTranslation', { tid: initial.id });
  }
  requireThat(result.requestState === 'DONE', 'TRANSLATION_PENDING_OR_FAILED_NO_RESUBMIT');
  requireThat((result.documentId ?? result.resultDocumentId) === api.owned().did &&
    (!result.resultDocumentId || result.resultDocumentId === api.owned().did), 'TRANSLATION_LEFT_OWNED_DOCUMENT');
  return result;
}

export async function importCots(api, bindings) {
  const output = {};
  for (const [role, binding] of Object.entries(bindings)) {
    const bytes = readFileSync(contained(api.packet.root, binding.authenticFile));
    requireThat(sha256(bytes) === binding.sha256, 'COTS_BYTES_CHANGED');
    const upload = multipartImport(bytes, basename(binding.authenticFile), binding.units, api.schema);
    const initial = await api.call(`cots-${role}`, 'cotsImportPollInspect', 'createTranslation', api.owned(), upload.fields,
      {}, { body: upload.body, contentType: upload.contentType });
    const result = await translation(api, `cots-${role}`, 'cotsImportPollInspect', initial);
    requireThat(result.resultElementIds?.length === 1, 'COTS_IMPORT_ELEMENT_MAPPING_UNVERIFIED');
    const elementId = result.resultElementIds[0];
    const parts = await api.call(`cots-parts-${role}`, 'cotsImportPollInspect', 'getPartsWMVE', { ...api.owned(), eid: elementId });
    requireThat(parts.length === 1, 'MULTIBODY_COTS_NEEDS_PARENT_NATIVE_BINDING_AND_NEW_BUDGET');
    Object.assign(output, bindParts(parts, [{ role, name: binding.importPartName }], elementId));
  }
  return output;
}

export async function importV3Cots(api, contract) {
  requireThat(contract.schema === 'subsystem-ab-api-v3-binding/1' && contract.freezeSha256 === api.packet.freezeHash,
    'FROZEN_V3_IMPORT_CONTRACT_REQUIRED');
  validateBindingContract(contract, api.ledger.data);
  const output = {};
  for (const group of contract.sourceGroups.filter(source => source.kind === 'authentic')) {
    requireThat(api.packet.freeze.artifactSha256[group.importFile] === group.importSha256, 'FROZEN_PRESERVED_BUNDLE_REQUIRED');
    const bytes = readFileSync(contained(api.packet.root, group.importFile));
    requireThat(sha256(bytes) === group.importSha256, 'PRESERVED_BUNDLE_BYTES_CHANGED');
    const upload = multipartImport(bytes, basename(group.importFile), group.units, api.schema);
    const initial = await api.call(`v3-import-${group.id}`, 'authenticCots', 'createTranslation', api.owned(), upload.fields,
      {}, { body: upload.body, contentType: upload.contentType });
    const translated = await translation(api, `v3-import-${group.id}`, 'authenticCots', initial);
    requireThat(translated.resultElementIds?.length === 1, 'ONE_PRESERVED_IMPORT_PART_STUDIO_REQUIRED');
    const elementId = translated.resultElementIds[0];
    const parts = await api.call(`v3-import-parts-${group.id}`, 'authenticCots', 'getPartsWMVE', { ...api.owned(), eid: elementId });
    const bound = bindPreservedParts(parts, group, contract.parts, elementId);
    requireThat(Object.keys(bound).every(role => !Object.hasOwn(output, role)), 'DUPLICATE_IMPORTED_ROLE');
    Object.assign(output, bound);
  }
  return output;
}

export function assertSourcePlan(recipe, packet, bindings = {}) {
  requireThat(recipe?.schema === 'subsystem-ab-native-recipe/1' && recipe.freezeSha256 === packet.freezeHash &&
    recipe.sourceSha256 === sha256(packet.source) && recipe.parametricSourceConnectors === true &&
    /opMateConnector\s*\(/.test(packet.source), 'PARAMETRIC_CONNECTOR_RECIPE_REQUIRED');
  const graph = assemblyGraph(packet, 'baseline', bindings);
  for (const joint of graph.joints) {
    for (const [index, side] of ['parent', 'child'].entries()) {
      const frame = recipe.sourceConnectorFramesSI?.[`${joint.id}:${side}`];
      requireThat(frame?.length === 16 && frame.every((value, axis) => Number.isFinite(value) &&
        Math.abs(value - joint.connectors[index].sourceFrameSI[axis]) < 1e-8), 'SOURCE_CONNECTOR_COVERAGE_UNVERIFIED');
    }
  }
}

export function assertNativeRecipe(recipe, packet, ledger, bindings = {}) {
  assertSourcePlan(recipe, packet, bindings);
  requireThat(['ground', 'limits', 'relations', 'connectorTracking', 'roleNames', 'motionCodec'].every(name =>
    recipe.semanticChecks?.[name] === 'PASS'), 'NATIVE_PILOT_SEMANTICS_UNVERIFIED');
  requireThat(Array.isArray(recipe.evidence) && recipe.evidence.length >= 3 && recipe.evidence.every(evidence => {
    const entry = ledger.attempts.find(attempt => attempt.key === evidence.key && attempt.status === 'SUCCESS');
    return entry && ['getFeatures', 'getFeatureSpecs', 'getAssemblyDefinition', 'getMateValues'].includes(entry.operation) &&
      sha256(JSON.stringify(entry.result)) === evidence.resultSha256;
  }), 'OWNED_PILOT_EVIDENCE_REQUIRED');
}

export async function assemble(api, bindings, recipe) {
  assertNativeRecipe(recipe, api.packet, api.ledger.data, bindings);
  const owned = await api.initialize(false);
  const graph = assemblyGraph(api.packet, 'baseline', bindings);
  const custom = bindParts(api.result('source-parts'), customRoles(api.packet), api.element('PARTSTUDIO'));
  const parts = { ...custom, ...await importCots(api, bindings) };
  const ids = { ...owned, eid: api.element('ASSEMBLY') };
  await api.call('native-specs', 'assemblyReadiness', 'getFeatureSpecs', ids);
  await api.call('native-before', 'assemblyReadiness', 'getFeatures', ids);
  await api.call('native-instances', 'batchInstancesAndReadback', 'insertTransformedInstances', ids, batchInstances(graph, parts, owned.did));
  const definition = await api.call('native-instance-readback', 'batchInstancesAndReadback', 'getAssemblyDefinition', ids,
    undefined, { includeMateFeatures: true, includeMateConnectors: true });
  const instances = bindInstances(graph, parts, definition, owned.did);
  let snapshot = await api.call('native-feature-base', 'baselineHealth', 'getFeatures', ids);
  const ground = structuredClone(recipe.groundFeature);
  delete ground.featureId;
  delete ground.nodeId;
  requireThat(ground?.btType === 'BTMMate-64' && ground.parameters.some(parameter =>
    parameter.parameterId === 'mateType' && parameter.value === 'FASTENED'), 'NATIVE_GROUND_RECIPE_REQUIRED');
  const groundQueries = ground.parameters.find(parameter => parameter.parameterId === 'mateConnectorsQuery')?.queries;
  requireThat(groundQueries?.length === 2 && groundQueries[1].path.length === 0, 'ASSEMBLY_ORIGIN_GROUND_REQUIRED');
  groundQueries[0].path = [instances.chassis.id];
  const grounded = await api.call('native-ground', 'ground', 'addFeature', ids,
    { btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature: ground });
  assertHealthy(grounded);
  snapshot = { ...grounded, libraryVersion: grounded.libraryVersion || snapshot.libraryVersion };
  const mateIds = {};
  for (const joint of graph.joints) {
    const result = await api.call(`mate-${joint.id}`, 'nativeMates', 'addFeature', ids,
      mateFeature(joint, instances, recipe.connectors[joint.id], snapshot, recipe.limitParameters?.[joint.id]));
    mateIds[joint.id] = assertHealthy(result);
    snapshot = { ...result, libraryVersion: result.libraryVersion || snapshot.libraryVersion };
  }
  for (const relation of graph.relations) {
    const result = await api.call(`relation-${relation.id}`, 'nativeRelations', 'addFeature', ids,
      relationFeature(relation, recipe.relations[relation.id], mateIds, snapshot));
    assertHealthy(result);
    snapshot = { ...result, libraryVersion: result.libraryVersion || snapshot.libraryVersion };
  }
  const health = await api.call('native-health', 'baselineHealth', 'getFeatures', ids);
  Object.values(mateIds).forEach(featureId => assertHealthy(health, featureId));
  return { status: 'ASSEMBLED_MOTION_AND_NAMES_REQUIRE_READBACK', instances, mateIds,
    gates: { nativeMotion: 'UNVERIFIED', humanUsability: 'UNVERIFIED', manufacturingRelease: 'UNVERIFIED' } };
}

export async function revise(api) {
  await api.initialize(false);
  requireThat(api.result('native-health') && api.ledger.data.checkpoints?.['baseline-export-finished'], 'NATIVE_BASELINE_AND_EXPORT_REQUIRED');
  const ids = { ...api.owned(), eid: api.element('PARTSTUDIO') };
  const before = await api.call('revision-before', 'widthRevisionAndSourceReadback', 'getPartStudioFeatures', ids);
  const featureId = api.result('source-feature')?.feature?.featureId;
  const existing = before.features.find(feature => feature.featureId === featureId);
  requireThat(existing, 'SAME_FEATURE_NOT_FOUND');
  const result = await api.call('revision-feature', 'widthRevisionAndSourceReadback', 'updatePartStudioFeature', { ...ids, fid: featureId },
    sourceFeature(existing.namespace, api.packet.contract.parameters.revision, before, existing));
  requireThat(assertHealthy(result) === featureId, 'FEATURE_IDENTITY_CHANGED');
  const parts = await api.call('revision-parts', 'widthRevisionAndSourceReadback', 'getPartsWMVE', ids);
  const baselineParts = bindParts(api.result('source-parts'), customRoles(api.packet), ids.eid);
  const revisionParts = bindParts(parts, customRoles(api.packet), ids.eid);
  requireThat(Object.keys(baselineParts).every(role => baselineParts[role].partId === revisionParts[role].partId), 'PART_IDENTITY_CHANGED');
  const health = await api.call('revision-native-health', 'widthRevisionAndSourceReadback', 'getFeatures',
    { ...api.owned(), eid: api.element('ASSEMBLY') });
  for (const entry of api.ledger.data.attempts.filter(entry => entry.operation === 'addFeature' && entry.status === 'SUCCESS'))
    assertHealthy(health, entry.result.feature.featureId);
  return { status: 'SOURCE_WIDTH_EDITED_MEASUREMENTS_AND_RECEIVER_POSE_UNVERIFIED', featureId };
}

export async function exportAssembly(api, variant) {
  requireThat(['baseline', 'revision'].includes(variant), 'EXPORT_VARIANT');
  await api.initialize(false);
  const completed = api.ledger.data.checkpoints?.[`${variant}-export-finished`];
  if (completed) {
    requireThat(api.ledger.completed(`${variant}-download`) && sha256(readFileSync(completed.file)) === completed.sha256,
      'EXPORT_RECEIPT_OR_BYTES_CHANGED');
    return completed;
  }
  requireThat(api.result(variant === 'baseline' ? 'native-health' : 'revision-native-health'), 'NATIVE_ASSEMBLY_REQUIRED_FOR_EXPORT');
  const ids = { ...api.owned(), eid: api.element('ASSEMBLY') };
  const initial = await api.call(`${variant}-export`, 'baselineRevisionExports', 'createAssemblyExportStep', ids,
    { storeInDocument: false, stepVersionString: 'AP242' });
  const result = await translation(api, `${variant}-export`, 'baselineRevisionExports', initial);
  requireThat(result.resultExternalDataIds?.length === 1, 'EXPECTED_ONE_NATIVE_EXPORT');
  const directory = new URL('./artifacts/', import.meta.url);
  mkdirSync(directory, { recursive: true });
  const file = new URL(`${variant}-original.step`, directory);
  requireThat(!api.ledger.completed(`${variant}-download`), 'EXPORT_ALREADY_DOWNLOADED_NO_BLIND_REPEAT');
  const bytes = await api.call(`${variant}-download`, 'baselineRevisionExports', 'downloadExternalData',
    { did: ids.did, fid: result.resultExternalDataIds[0] }, undefined, {}, { binary: true });
  requireThat(!existsSync(file), 'EXPORT_FILE_ALREADY_EXISTS');
  writeFileSync(file, bytes, { flag: 'wx', flush: true });
  requireThat(bytes.subarray(0, 4096).includes(Buffer.from('ISO-10303-21;')), 'NATIVE_EXPORT_FORMAT_UNVERIFIED_OR_ZIPPED_ORIGINAL_RETAINED');
  const receipt = { status: 'ORIGINAL_ONSHAPE_EXPORT_RETAINED', bytes: bytes.length, sha256: sha256(bytes), file: fileURLToPath(file),
    nativeMotion: 'UNVERIFIED' };
  api.ledger.checkpoint(`${variant}-export-finished`, receipt);
  return receipt;
}