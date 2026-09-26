import { randomUUID, createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { bindFeature, revisionChanges } from './model.mjs';
import { PocError, requireCondition } from './transport.mjs';
import { checkedId, requirePrivate, featureResult, verifyFeatureList, inspectPart, bomExclusionProperty } from './validate.mjs';
import { decodeStep } from './step.mjs';

const segment = value => encodeURIComponent(checkedId(value));

export async function runWorkflow({ client, baseline, revision, report, publicDocument = false, resume = false, creationName, phaseId,
  save = async () => {}, saveBinary = async () => {}, wait = delay }) {
  const observed = report.observed;
  const ids = observed.featureIds ??= {};
  const partIds = observed.partIds ??= {};
  const visibility = publicDocument ? 'Public' : 'Private';
  const requireVisibility = value => publicDocument
    ? requireCondition(value?.public === true, 'PUBLIC_DOCUMENT_NOT_CONFIRMED') : requirePrivate(value);
  requireCondition(!resume || (publicDocument && phaseId && observed.provenance?.phaseId === phaseId
    && observed.provenance.requestedPublic === true && observed.documentId && observed.workspaceId && observed.publicConfirmed), 'OWNED_PHASE_PROVENANCE_REQUIRED');
  const document = resume ? { id: observed.documentId, defaultWorkspace: { id: observed.workspaceId }, public: true }
    : await client.request('POST', '/api/v10/documents', {
      name: creationName ?? `Native API coral intake PoC ${randomUUID()}`, isPublic: publicDocument, isEmptyContent: true,
    }, `create${visibility}Document`);
  observed.documentId = checkedId(document?.id);
  observed.provenance ??= { createdBy: `runWorkflow.create${visibility}Document`, createdAt: new Date().toISOString(), requestedPrivate: !publicDocument, requestedPublic: publicDocument, phaseId, creationName };
  observed.documentUrl = `${client.origin}/documents/${segment(document.id)}`;
  await save();
  requireVisibility(document);
  const did = segment(document.id);
  const wid = segment(document.defaultWorkspace?.id);
  observed.workspaceId = document.defaultWorkspace.id;
  const confirmed = await client.request('GET', `/api/v10/documents/${did}`, undefined, `confirm${visibility}Document`);
  requireCondition(confirmed.id === document.id, 'DOCUMENT_ID_MISMATCH');
  requireVisibility(confirmed);
  observed[publicDocument ? 'publicConfirmed' : 'privateConfirmed'] = true;
  await save();
  const studio = resume && observed.elementId ? { id: observed.elementId }
    : await client.request('POST', `/api/v9/partstudios/d/${did}/w/${wid}`, { name: 'Native REST intake' }, 'createPartStudio');
  observed.elementId = checkedId(studio?.id);
  observed.documentUrl = `${client.origin}/documents/${did}/w/${wid}/e/${segment(studio.id)}`;
  const scope = `/d/${did}/w/${wid}/e/${segment(studio.id)}`;
  const studioPath = `/api/v9/partstudios${scope}`;
  const partsPath = `/api/v9/parts${scope}`;
  const featuresPath = `${studioPath}/features`;
  await save();
  const initial = await client.request('GET', featuresPath, undefined, 'getEmptyFeatureList');
  requireCondition(Array.isArray(initial.features) && (resume
    ? initial.features.every(feature => Object.values(ids).includes(feature.featureId)) && initial.features.length === Object.keys(ids).length
    : initial.features.length === 0), 'NEW_PART_STUDIO_NOT_EMPTY');
  requireCondition(initial.defaultFeatures?.some(feature => feature.featureId === 'Right'), 'RIGHT_PLANE_NOT_FOUND');

  async function mutate(entry, update = false, stage = update ? 'revision' : 'baseline') {
    observed.activeFeature = { stage, key: entry.key, operation: update ? 'UPDATE' : 'ADD' };
    await save();
    const current = await client.request('GET', featuresPath, undefined, 'getFeatureCursor');
    observed.cursorEvidence = Object.fromEntries(['serializationVersion', 'libraryVersion', 'sourceMicroversion'].map(key => [key, current[key]]));
    observed.activeFeature.cursorSchema = Object.fromEntries(['serializationVersion', 'libraryVersion', 'sourceMicroversion'].map(key => [key, typeof current[key]]));
    await save();
    requireCondition(typeof current.serializationVersion === 'string' && Number.isInteger(current.libraryVersion)
      && current.libraryVersion >= 1975 && typeof current.sourceMicroversion === 'string', 'FEATURE_CURSOR_SCHEMA_UNSUPPORTED');
    observed.serializationVersion = current.serializationVersion;
    observed.libraryVersion = current.libraryVersion;
    const feature = bindFeature(entry.feature, ids);
    const expectedId = update ? checkedId(ids[entry.key]) : undefined;
    if (update) feature.featureId = expectedId;
    const response = await client.request('POST', update ? `${featuresPath}/featureid/${segment(expectedId)}` : featuresPath, {
      btType: 'BTFeatureDefinitionCall-1406', feature,
      serializationVersion: current.serializationVersion, libraryVersion: current.libraryVersion,
      sourceMicroversion: current.sourceMicroversion, rejectMicroversionSkew: true,
    }, update ? 'updateFeature' : 'addFeature');
    observed.activeFeature.returnedStatus = ['OK', 'ERROR', 'WARNING', 'INFO'].includes(response.featureState?.featureStatus)
      ? response.featureState.featureStatus : 'UNKNOWN';
    if (response.feature?.featureId) observed.activeFeature.returnedFeatureId = checkedId(response.feature.featureId);
    observed.activeFeature.responseKeys = Object.keys(response).filter(key => /^[A-Za-z]{1,60}$/.test(key));
    observed.lastFeatureResponse = { feature: response.feature, featureState: response.featureState, microversionSkew: response.microversionSkew };
    if (response.feature?.featureId) ids[entry.key] = checkedId(response.feature.featureId);
    await save();
    ids[entry.key] = featureResult(response, expectedId);
    observed.featureOperations.push({ stage, key: entry.key, featureId: ids[entry.key], status: 'OK', operation: update ? 'UPDATE' : 'ADD' });
    await save();
  }

  async function listSolids() {
    const parts = await client.request('GET', partsPath, undefined, 'getParts');
    requireCondition(Array.isArray(parts), 'PART_LIST_SCHEMA_UNSUPPORTED');
    requireCondition(parts.every(part => part.bodyType === 'solid' && part.isMesh !== true), 'NON_SOLID_OR_MESH_PART');
    parts.forEach(part => checkedId(part.partId));
    return parts;
  }

  async function namePart(part, partId) {
    const path = `/api/v10/metadata${scope}/p/${segment(partId)}`;
    const metadata = await client.request('GET', path, undefined, 'getPartMetadata');
    const name = metadata.properties?.find(property => property.name === 'Name' && property.editable === true);
    requireCondition(name, 'NAME_PROPERTY_UNAVAILABLE');
    const properties = [{ propertyId: checkedId(name.propertyId), value: part.name }];
    const exclusion = bomExclusionProperty(metadata);
    if (part.nonBom && exclusion) properties.push({ propertyId: checkedId(exclusion.propertyId), value: true });
    const alreadyMatches = properties.every(property => metadata.properties.some(actual => actual.propertyId === property.propertyId && actual.value === property.value));
    if (!alreadyMatches) await client.request('POST', path, { jsonType: 'metadata-part', partId, properties }, 'updatePartMetadata');
    const updated = alreadyMatches ? metadata : await client.request('GET', path, undefined, 'verifyPartMetadata');
    requireCondition(updated.properties?.some(property => property.propertyId === name.propertyId && property.value === part.name), 'PART_NAME_NOT_CONFIRMED');
    if (part.nonBom) {
      observed.coralBomExclusion = exclusion && updated.properties.some(property => property.propertyId === exclusion.propertyId && property.value === true)
        ? 'CONFIRMED' : 'UNSUPPORTED_OR_UNCONFIRMED';
    }
  }

  async function optional(operation, action) {
    try { return await action(); }
    catch (error) {
      if (error instanceof PocError && ['HTTP_401', 'HTTP_403'].includes(error.code)) throw error;
      return { status: 'FAILED_OR_UNSUPPORTED', operation, code: error instanceof PocError ? error.code : 'UNEXPECTED_RESPONSE_OR_IO' };
    }
  }

  async function render(stage, view, viewMatrix) {
    const query = new URLSearchParams({ viewMatrix, outputWidth: '1024', outputHeight: '768', pixelSize: '0', showAllParts: 'true', includeSurfaces: 'false', edges: 'show' });
    const response = await client.request('GET', `${studioPath}/shadedviews?${query}`, undefined, 'renderShadedView');
    const images = response.images?.flat(Infinity);
    requireCondition(Array.isArray(images) && images.length > 0, 'IMAGE_RESPONSE_UNSUPPORTED');
    const encoded = images.find(image => typeof image === 'string' && image.startsWith('iVBOR'));
    requireCondition(encoded, 'PNG_IMAGE_NOT_RETURNED');
    const bytes = Buffer.from(encoded, 'base64');
    requireCondition(bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'INVALID_PNG');
    const filename = `${stage}-${view}.png`;
    await saveBinary(filename, bytes);
    return { status: 'DOWNLOADED_NOT_VISUALLY_INSPECTED', filename, bytes: bytes.length, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), sha256: createHash('sha256').update(bytes).digest('hex') };
  }

  async function exportStep(stage) {
    let translation = await client.request('POST', `/api/v11/partstudios${scope}/export/step`, { storeInDocument: false }, 'startStepExport');
    const translationId = checkedId(translation.id);
    const attempt = { stage, translationId, sourceMicroversion: observed.stages[stage]?.sourceMicroversion };
    (observed.exportAttempts ??= []).push(attempt);
    await save();
    for (let attempt = 0; translation.requestState === 'ACTIVE' && attempt < 12; attempt++) {
      await wait(Math.min(2000 * 2 ** attempt, 10000));
      translation = await client.request('GET', `/api/v9/translations/${segment(translationId)}`, undefined, 'pollStepExport');
    }
    requireCondition(translation.requestState === 'DONE', 'STEP_TRANSLATION_NOT_DONE');
    requireCondition(translation.resultDocumentId === document.id, 'EXPORT_DOCUMENT_MISMATCH');
    requireCondition(translation.resultExternalDataIds?.length === 1, 'STEP_RESULT_UNSUPPORTED');
    attempt.resultExternalDataIds = translation.resultExternalDataIds;
    attempt.requestState = translation.requestState;
    await save();
    const foreignId = segment(translation.resultExternalDataIds[0]);
    const payload = await client.request('GET', `/api/v6/documents/d/${did}/externaldata/${foreignId}`, undefined, 'downloadStep', true);
    await saveBinary(`${stage}-step-payload.bin`, payload);
    const { files, solidRecordCount } = decodeStep(payload, 9);
    requireCondition(solidRecordCount === 9, 'STEP_SOLID_RECORD_COUNT_MISMATCH');
    const outputs = [];
    for (const [index, file] of files.entries()) {
      const filename = files.length === 1 ? `${stage}.step` : `${stage}-part-${index + 1}.step`;
      await saveBinary(filename, file.bytes);
      outputs.push({ filename, archiveEntry: file.archiveEntry, bytes: file.bytes.length,
        sha256: createHash('sha256').update(file.bytes).digest('hex') });
    }
    return { status: 'DOWNLOADED_HEADER_VERIFIED_NOT_REIMPORTED', files: outputs, translationId, solidRecordCount };
  }

  async function inspect(plan) {
    const stage = observed.stages[plan.stage] = { status: 'INSPECTING', parts: [] };
    const features = await client.request('GET', featuresPath, undefined, 'inspectFeatures');
    stage.sourceMicroversion = features.sourceMicroversion;
    observed.featureReadback = features;
    await save();
    stage.featureCount = features.features?.length ?? null;
    stage.features = verifyFeatureList(features, plan, ids);
    const parts = await listSolids();
    stage.partCount = parts.length;
    requireCondition(parts.length === 9 && new Set(parts.map(part => part.partId)).size === 9, 'PART_COUNT_MISMATCH');
    const details = await client.request('GET', `${studioPath}/bodydetails`, undefined, 'inspectBodies');
    observed.bodyReadback = details;
    await save();
    requireCondition(Array.isArray(details.bodies), 'BODY_DETAILS_SCHEMA_UNSUPPORTED');
    for (const part of plan.predicted.parts) {
      const partId = partIds[part.key];
      requireCondition(parts.some(actual => actual.partId === partId && actual.name === part.name), 'PART_ID_OR_NAME_CHANGED');
      const box = await client.request('GET', `${partsPath}/partid/${segment(partId)}/boundingboxes`, undefined, 'inspectPartBounds');
      stage.lastBoundsResponse = { key: part.key, response: box };
      await save();
      stage.parts.push(inspectPart(part, partId, box, details.bodies.find(body => body.id === partId)));
    }
    const byKey = Object.fromEntries(stage.parts.map(part => [part.key, part]));
    stage.innerWidthMm = byKey.rightPlate.boundsMm.low[0] - byKey.leftPlate.boundsMm.high[0];
    stage.rollerGapMm = byKey.rearRoller.boundsMm.low[1] - byKey.frontRoller.boundsMm.high[1];
    stage.geometryChecksPassed = stage.parts.every(part => part.boundsMatch && part.holesMatch);
    stage.images = {
      right: await optional('rightImage', () => render(plan.stage, 'right', 'right')),
      isometric: await optional('isometricImage', () => render(plan.stage, 'isometric', '0.707106781187,0.707106781187,0,0,-0.408248290464,0.408248290464,0.816496580928,0,0.577350269190,-0.577350269190,0.577350269190,0')),
    };
    stage.step = await optional('stepExport', () => exportStep(plan.stage));
    stage.status = stage.geometryChecksPassed ? 'GEOMETRY_CHECKS_PASSED' : 'GEOMETRY_CHECKS_FAILED';
    await save();
    requireCondition(stage.geometryChecksPassed, 'GEOMETRY_VALIDATION_FAILED');
  }

  try {
  for (const entry of observed.stages.baseline?.geometryChecksPassed ? [] : baseline.features) {
    const completed = observed.featureOperations.some(operation => operation.stage === 'baseline' && operation.key === entry.key && operation.status === 'OK');
    if (!completed) await mutate(entry, Boolean(ids[entry.key]), 'baseline');
    if (entry.feature.featureType === 'extrude') {
      const part = baseline.predicted.parts.find(item => `${item.key}.solid` === entry.key);
      if (partIds[part.key]) { await namePart(part, partIds[part.key]); continue; }
      const parts = await listSolids();
      const newParts = parts.filter(part => !Object.values(partIds).includes(part.partId));
      requireCondition(newParts.length === 1 && parts.length === Object.keys(partIds).length + 1, 'EXTRUDE_DID_NOT_CREATE_ONE_SOLID');
      partIds[part.key] = checkedId(newParts[0].partId);
      await namePart(part, partIds[part.key]);
      await save();
    }
  }
  if (!observed.stages.baseline?.geometryChecksPassed) await inspect(baseline);
  const originalIds = { ...ids };
  for (const entry of revisionChanges(baseline, revision)) {
    if (!observed.featureOperations.some(operation => operation.stage === 'revision' && operation.key === entry.key && operation.status === 'OK')) await mutate(entry, true);
  }
  observed.featureIdsPreserved = Object.keys(originalIds).every(key => originalIds[key] === ids[key]);
  await inspect(revision);
  observed.activeFeature = null;
  observed.status = 'BASELINE_AND_REVISION_GEOMETRY_CHECKS_PASSED';
  observed.fullAcceptance = observed.coralBomExclusion === 'CONFIRMED'
    && Object.values(observed.stages).every(stage => stage.step.status.startsWith('DOWNLOADED')
      && Object.values(stage.images).every(image => image.status.startsWith('DOWNLOADED')));
  await save();
  } catch (error) {
    if (!['HTTP_401', 'HTTP_403'].includes(error.code) && Object.keys(partIds).length) {
      observed.partialImage = await optional('partialImage', () => render('partial', 'isometric', '0.707106781187,0.707106781187,0,0,-0.408248290464,0.408248290464,0.816496580928,0,0.577350269190,-0.577350269190,0.577350269190,0'));
      await save();
    }
    throw error;
  }
}