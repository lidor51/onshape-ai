import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { OnshapeClient, trustedOrigin } from './client.mjs';
import { featureCall } from './generate.mjs';
import { expectations } from './geometry.mjs';
import { assertFeatureState, compiledSpec, measurementScript, validateMeasurements } from './validate.mjs';

export function parseMode(argv) {
  if (argv.length === 0 || (argv.length === 1 && argv[0] === '--help')) return 'offline';
  if (argv.length === 2 && new Set(argv).size === 2 && argv.includes('--live') && argv.includes('--confirm-private')) return 'live';
  if (argv.length === 2 && new Set(argv).size === 2 && argv.includes('--live') && argv.includes('--confirm-public')) return 'live-public';
  throw new Error('Use no flags for offline plan, or exactly --live with --confirm-private or --confirm-public after authorization');
}

export async function loadLiveCredentials(mode) {
  if (!['live', 'live-public'].includes(mode)) throw new Error('Credential loading requires explicit live mode');
  let local = {};
  try { local = parseEnv(await readFile(new URL('../../.env.local', import.meta.url), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Unable to load live credential configuration'); }
  return resolveLiveConfiguration(local);
}

export function resolveLiveConfiguration(local, environment = process.env) {
  let origin;
  try { origin = trustedOrigin(environment.ONSHAPE_BASE_URL ?? local.ONSHAPE_BASE_URL); }
  catch { throw new Error('Configured ONSHAPE_BASE_URL must be https://cad.onshape.com; no request sent'); }
  const accessKey = (environment.ONSHAPE_ACCESS_KEY ?? local.ONSHAPE_ACCESS_KEY)?.trim();
  const secretKey = (environment.ONSHAPE_SECRET_KEY ?? local.ONSHAPE_SECRET_KEY)?.trim();
  if (!accessKey || !secretKey) throw new Error('Live mode requires ONSHAPE_ACCESS_KEY and ONSHAPE_SECRET_KEY');
  return { accessKey, secretKey, origin };
}

function apiId(value) {
  assert.match(value ?? '', /^[a-f0-9]{24}$/, 'Expected a server document, workspace, version, or element ID');
  return value;
}

function concurrency(response) {
  assert.ok(response.sourceMicroversion, 'Missing source microversion');
  assert.ok(response.serializationVersion, 'Missing serialization version');
  return { sourceMicroversion: response.sourceMicroversion, serializationVersion: response.serializationVersion, rejectMicroversionSkew: true };
}

export function normalizeSource(source) {
  return source.replace(/\r\n/g, '\n');
}

export function versionCall(documentId, workspaceId, readback) {
  return { name: 'Intake source v1', documentId: apiId(documentId), workspaceId: apiId(workspaceId),
    microversionId: apiId(readback.sourceMicroversion), publishVersion: false };
}

export function revisionCall(serverFeature, benchmark, namespace) {
  assert.equal(serverFeature.featureType, 'coralGroundIntake');
  assert.equal(serverFeature.namespace, namespace);
  assert.match(serverFeature.featureId ?? '', /^[A-Za-z0-9_-]+$/);
  const call = featureCall(benchmark, 'revision', namespace, serverFeature.featureId);
  const parameters = new Map(call.feature.parameters.map(parameter => [parameter.parameterId, parameter.expression]));
  const feature = structuredClone(serverFeature);
  for (const [parameterId, expression] of parameters) {
    const matches = feature.parameters.filter(parameter => parameter.parameterId === parameterId);
    assert.equal(matches.length, 1, `Missing or duplicate editable parameter ${parameterId}`);
    matches[0].expression = expression;
  }
  return { btType: 'BTFeatureDefinitionCall-1406', feature };
}

export async function captureExports(client, studioPath, variant, save, documentId) {
  const results = {};
  try {
    const viewMatrix = '0.7071067812,0.7071067812,0,0,-0.4082482905,0.4082482905,0.8164965809,0,0.5773502692,-0.5773502692,0.5773502692,0';
    const response = await client.request('GET', `${studioPath}/shadedviews?viewMatrix=${viewMatrix}&outputWidth=1200&outputHeight=900&pixelSize=0&showAllParts=true`);
    await save(`${variant}-shadedviews.json`, response);
    const image = response.images?.flat(Infinity).find(item => typeof item === 'string');
    assert.ok(image, 'No image returned by Onshape');
    const data = Buffer.from(image, 'base64');
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Expected PNG signature');
    await save(`${variant}.png`, data);
    results.image = { status: 'RECEIVED_PNG', bytes: data.length };
  } catch (error) { results.image = { status: 'FAILED', error: error.message }; }
  try {
    let translation = await client.request('POST', `${studioPath}/export/step`, {
      storeInDocument: false, grouping: true, destinationName: `featurescript-${variant}`,
      stepVersionString: 'AP242', notifyUser: false, triggerAutoDownload: false,
    });
    const translationId = apiId(translation.id);
    await save(`${variant}-translation-created.json`, translation);
    for (let poll = 0; translation.requestState === 'ACTIVE' && poll < 8; poll++) {
      await delay(Math.min(2000 * 2 ** poll, 10000));
      translation = await client.request('GET', `/translations/${translationId}`);
    }
    await save(`${variant}-translation-final.json`, translation);
    assert.equal(translation.requestState, 'DONE', 'STEP translation failed or exceeded polling budget');
    assert.equal(translation.resultExternalDataIds?.length, 1, 'Expected a single external STEP result');
    const foreignId = translation.resultExternalDataIds[0];
    assert.match(foreignId, /^[A-Za-z0-9_-]+$/);
    const data = await client.request('GET', `/documents/d/${documentId}/externaldata/${foreignId}`, undefined, true);
    assert.match(data.subarray(0, 4096).toString('utf8'), /ISO-10303-21;/, 'Expected STEP exchange header; ZIP or unexpected content retained only as failure');
    await save(`${variant}.step`, data);
    results.step = { status: 'RECEIVED_STEP', bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') };
  } catch (error) { results.step = { status: 'FAILED', error: error.message }; }
  return results;
}

export async function deployWorkflow(client, benchmark, source, save, progress, mode = 'live') {
  const isPublic = mode === 'live-public';
  progress.stage = isPublic ? 'create-public-document' : 'create-private-document';
  const name = `FeatureScript intake PoC ${new Date().toISOString()}`;
  const { did, wid } = progress.resumeVerified ? { did: apiId(progress.documentId), wid: apiId(progress.workspaceId) } :
    isPublic ? await client.createPublicDocument(name, true) : await client.createPrivateDocument(name);
  Object.assign(progress, { documentId: did, workspaceId: wid });
  progress.public = isPublic;
  progress.documentUrl = `https://cad.onshape.com/documents/${did}/w/${wid}`;
  if (!progress.resumeVerified) await save('provenance.json', { documentId: did, workspaceId: wid, name, public: isPublic, createdBy: 'featurescript-trial', createdAt: new Date().toISOString() });
  const studio = progress.featureStudioId ? { id: progress.featureStudioId } : await client.request('POST', `/featurestudios/d/${did}/w/${wid}`, { name: 'Editable coral intake source' });
  const sourceId = apiId(studio.id);
  progress.featureStudioId = sourceId;
  const sourcePath = `/featurestudios/d/${did}/w/${wid}/e/${sourceId}`;
  progress.stage = 'source-upload-and-spec-check';
  const before = await client.request('GET', sourcePath);
  if (normalizeSource(before.contents) !== normalizeSource(source)) {
    assert.ok(!progress.featureId, 'Source repair is only permitted before feature insertion');
    const uploaded = await client.request('POST', sourcePath, { btType: 'BTFeatureStudioContents-2239', contents: normalizeSource(source), ...concurrency(before) });
    await save('source-upload.json', uploaded);
    delete progress.sourceVersionId;
  }
  const readback = await client.request('GET', sourcePath);
  await save('source-readback.json', readback);
  assert.ok(normalizeSource(readback.contents) === normalizeSource(source), 'Saved Feature Studio source differs beyond CRLF normalization');
  const specs = await client.request('GET', `${sourcePath}/featurespecs`);
  await save('workspace-feature-specs.json', specs);
  compiledSpec(specs);
  progress.compilation = 'EXPORTED_SPEC_OBSERVED; runtime regeneration still required';

  progress.stage = 'version-pinned-feature-specs';
  const version = progress.sourceVersionId ? { id: progress.sourceVersionId } : await client.request('POST', `/documents/d/${did}/versions`, versionCall(did, wid, readback));
  const versionId = apiId(version.id);
  progress.sourceVersionId = versionId;
  const pinnedSpecs = await client.request('GET', `/featurestudios/d/${did}/v/${versionId}/e/${sourceId}/featurespecs`);
  await save('version-feature-specs.json', pinnedSpecs);
  const spec = compiledSpec(pinnedSpecs);
  assert.ok(typeof spec.namespace === 'string' && spec.namespace.length > 0, 'Version-pinned namespace not returned; refusing to invent one');
  const namespace = spec.namespace;
  progress.namespace = namespace;
  const partStudio = progress.partStudioId ? { id: progress.partStudioId } : await client.request('POST', `/partstudios/d/${did}/w/${wid}`, { name: 'Coral ground intake packaging' });
  const partStudioId = apiId(partStudio.id);
  progress.partStudioId = partStudioId;
  progress.documentUrl = `https://cad.onshape.com/documents/${did}/w/${wid}/e/${partStudioId}`;
  const studioPath = `/partstudios/d/${did}/w/${wid}/e/${partStudioId}`;
  const initial = await client.request('GET', `${studioPath}/features`);
  const baselineCall = { ...featureCall(benchmark, 'baseline', namespace), ...concurrency(initial) };
  progress.stage = 'baseline-instantiation';
  await save('baseline-request.json', baselineCall);
  const inserted = progress.featureId ? { feature: initial.features.find(feature => feature.featureId === progress.featureId), featureState: initial.featureStates?.[progress.featureId] } : await client.request('POST', `${studioPath}/features`, baselineCall);
  await save('baseline-insert-response.json', inserted);
  const featureId = inserted.feature?.featureId;
  assert.match(featureId ?? '', /^[A-Za-z0-9_-]+$/);
  progress.featureId = featureId;
  assertFeatureState(inserted);
  progress.compilation = 'EXPORTED_SPEC_AND_OK_REGENERATION_OBSERVED';
  progress.variants ??= {};

  for (const variant of ['baseline', 'revision']) {
    progress.stage = `${variant}-validation`;
    const expected = expectations(benchmark, variant);
    const features = await client.request('GET', `${studioPath}/features`);
    await save(`${variant}-features.json`, features);
    assertFeatureState(features, featureId);
    assert.equal(features.features?.length, 1, 'Expected one persistent custom feature, excluding default geometry');
    const feature = features.features.find(item => item.featureId === featureId);
    assert.equal(feature?.featureType, 'coralGroundIntake');
    assert.equal(feature.namespace, namespace);
    for (const parameter of featureCall(benchmark, variant, namespace).feature.parameters) {
      assert.equal(feature.parameters.find(item => item.parameterId === parameter.parameterId)?.expression, parameter.expression, 'Server parameter expression');
    }
    progress.linkEvidence = { sourceId, namespace: feature.namespace, featureId, featureStatus: 'OK' };
    const parts = await client.request('GET', `/parts/d/${did}/w/${wid}?elementId=${partStudioId}&withThumbnails=false&includePropertyDefaults=true`);
    await save(`${variant}-parts.json`, parts);
    assert.equal(parts.length, 9, 'Server part count');
    assert.deepEqual(parts.map(part => part.name).sort(), benchmark.requiredParts.map(role => role === 'coralReference' ? 'coralReference [REFERENCE - NON-BOM]' : role).sort());
    assert.ok(parts.every(part => part.bodyType?.toLowerCase() === 'solid'), 'All parts must be solids');
    const evaluation = await client.request('POST', `${studioPath}/featurescript`, { script: measurementScript(featureId, benchmark.requiredParts) });
    await save(`${variant}-measurements-raw.json`, evaluation);
    const validation = validateMeasurements(evaluation, expected);
    progress.variants[variant] = { validation, featureCount: features.features.length, partCount: parts.length, parameterExpressions: feature.parameters.map(parameter => ({ parameterId: parameter.parameterId, expression: parameter.expression })) };
    await save(`${variant}-validation.json`, validation);
    progress.variants[variant].exports = await captureExports(client, studioPath, variant, save, did);
    if (variant === 'baseline') {
      progress.stage = 'parameter-only-revision';
      const current = await client.request('GET', `${studioPath}/features`);
      const update = { ...revisionCall(current.features.find(item => item.featureId === featureId), benchmark, namespace), ...concurrency(current) };
      await save('revision-request.json', update);
      const revised = await client.request('POST', `${studioPath}/features/featureid/${featureId}`, update);
      await save('revision-response.json', revised);
      assertFeatureState(revised);
      assert.equal(revised.feature?.featureId, featureId, 'Revision changed the feature ID');
    }
  }
  progress.stage = 'completed';
  progress.status = Object.values(progress.variants).every(variant => Object.values(variant.exports).every(result => result.status.startsWith('RECEIVED_'))) ? 'GEOMETRY_AND_EXPORTS_VERIFIED' : 'GEOMETRY_VERIFIED_EXPORTS_INCOMPLETE';
  progress.bomMetadata = 'FeatureScript sets EXCLUDE_FROM_BOM; server property readback and assembly BOM not implemented';
  return progress;
}

export async function main(argv = process.argv.slice(2), dependencies = {}) {
  const mode = parseMode(argv);
  if (mode === 'offline') {
    return { mode, credentialsLoaded: false, networkRequests: 0, status: 'NOT_RUN',
      message: 'Offline plan only. After authorization use --live --confirm-private, or --live --confirm-public for NEW synthetic public documents. No fallback.',
      sequence: ['new private document', 'source upload/readback/exported specs', 'unpublished version + server namespace', 'custom feature insertion', 'baseline measurement/image/STEP', 'same-feature parameter revision', 'revision measurement/image/STEP'],
    };
  }
  const credentials = await (dependencies.loadCredentials ?? loadLiveCredentials)(mode);
  const benchmark = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));
  const source = await readFile(new URL('./intake.fs', import.meta.url), 'utf8');
  const runName = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
  const directory = new URL(`./runs/${runName}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const client = new OnshapeClient({ ...credentials, fetchImpl: dependencies.fetchImpl,
    observe: observation => appendFile(new URL('calls.jsonl', directory), `${JSON.stringify(observation)}\n`),
  });
  const save = (name, value) => writeFile(new URL(name, directory), Buffer.isBuffer(value) ? value : `${JSON.stringify(client.sanitize(value), null, 2)}\n`, { flag: 'wx' });
  const started = performance.now();
  const progress = { status: 'STARTED', sourceSha256: createHash('sha256').update(source).digest('hex'), retries: 0, interventions: 'Not automatically measurable; record any human actions separately', artifacts: `trials/featurescript/runs/${runName}` };
  try { await deployWorkflow(client, benchmark, source, save, progress, mode); }
  catch (error) { Object.assign(progress, { status: 'FAILED', error: error.message }); }
  Object.assign(progress, { elapsedMs: performance.now() - started, networkRequests: client.requestCount });
  await save('summary.json', progress);
  return client.sanitize(progress);
}

if (import.meta.main) {
  try {
    const result = await main();
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'FAILED' || result.status === 'GEOMETRY_VERIFIED_EXPORTS_INCOMPLETE') process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}