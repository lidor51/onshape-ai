import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { OnshapeClient } from './client.mjs';
import { loadLiveCredentials, revisionCall } from './deploy.mjs';
import { featureCall } from './generate.mjs';
import { expectations } from './geometry.mjs';
import { assertFeatureState, decodeFs, measurementScript, validateMeasurements } from './validate.mjs';
import { retainStep, sha256 } from './exports.mjs';

export async function reconcileSummary(directory) {
  const progress = JSON.parse(await readFile(new URL('summary.json', directory), 'utf8'));
  const logs = (await readdir(directory)).filter(name => name.endsWith('calls.jsonl'));
  const calls = [];
  for (const name of logs) {
    const content = (await readFile(new URL(name, directory), 'utf8')).trim();
    if (content) calls.push(...content.split('\n').map(JSON.parse));
  }
  delete progress.elapsedMs;
  progress.networkRequests = calls.length;
  progress.recordedHttpElapsedMs = calls.reduce((sum, call) => sum + call.elapsedMs, 0);
  progress.timingNote = 'networkRequests and recordedHttpElapsedMs cover every call log in this run directory. Interrupted initial workflow elapsed time is unavailable. Each completed finisher invocation has its own timer.';
  await writeFile(new URL('summary.json', directory), `${JSON.stringify(progress, null, 2)}\n`);
  return progress;
}

export function verifyFeature(features, progress, benchmark, variant) {
  assertFeatureState(features, progress.featureId);
  assert.equal(features.features.length, 1, 'One persistent custom feature required');
  const feature = features.features[0];
  assert.equal(feature.featureId, progress.featureId);
  assert.equal(feature.featureType, 'coralGroundIntake');
  assert.equal(feature.namespace, progress.namespace);
  assert.equal(feature.suppressed, false);
  for (const parameter of featureCall(benchmark, variant, progress.namespace).feature.parameters) {
    assert.equal(feature.parameters.find(item => item.parameterId === parameter.parameterId)?.expression, parameter.expression);
  }
  return feature;
}

export async function ensureRevision(client, studioPath, progress, benchmark, features, save) {
  const feature = features.features.find(item => item.featureId === progress.featureId);
  const revised = featureCall(benchmark, 'revision', progress.namespace).feature.parameters;
  if (revised.every(parameter => feature?.parameters.find(item => item.parameterId === parameter.parameterId)?.expression === parameter.expression)) {
    verifyFeature(features, progress, benchmark, 'revision');
    return features;
  }
  verifyFeature(features, progress, benchmark, 'baseline');
  assert.ok(features.sourceMicroversion && features.serializationVersion);
  const update = { ...revisionCall(feature, benchmark, progress.namespace), sourceMicroversion: features.sourceMicroversion,
    serializationVersion: features.serializationVersion, rejectMicroversionSkew: true };
  await save('revision-request.json', update);
  const response = await client.request('POST', `${studioPath}/features/featureid/${progress.featureId}`, update);
  await save('revision-response.json', response);
  assertFeatureState(response);
  assert.equal(response.feature.featureId, progress.featureId);
  return null;
}

export async function finish(argv = process.argv.slice(2)) {
  assert.deepEqual(argv.slice(0, 3), ['--live', '--confirm-public', '--run']);
  assert.equal(argv.length, 6);
  assert.equal(argv[4], '--parent');
  for (const name of [argv[3], argv[5]]) assert.match(name, /^[0-9TZa-f-]{61}$/);
  const directory = new URL(`./runs/${argv[3]}/`, import.meta.url);
  const parent = JSON.parse(await readFile(new URL(`./runs/${argv[5]}/summary.json`, import.meta.url), 'utf8'));
  const loadBytes = async name => {
    try { return await readFile(new URL(name, directory)); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
  const load = async name => { const bytes = await loadBytes(name); return bytes ? JSON.parse(bytes) : null; };
  const creation = await load('creation.json');
  const benchmark = await load('benchmark.json');
  const baselineFeatures = await load('baseline-features.json');
  assert.equal(parent.documentId, creation.response.id);
  assert.equal(parent.workspaceId, creation.response.defaultWorkspace.id);
  assert.equal(parent.public, true);
  for (const key of ['documentId', 'workspaceId', 'partStudioId', 'featureStudioId', 'sourceVersionId']) assert.match(parent[key], /^[a-f0-9]{24}$/);
  assert.match(parent.featureId, /^[A-Za-z0-9_-]+$/);
  verifyFeature(baselineFeatures, parent, benchmark, 'baseline');
  const progress = { ...parent, ...await load('summary.json'), parentRun: argv[5],
    artifacts: `trials/featurescript/runs/${argv[3]}`, status: 'RUNNING', stage: 'verify-owned-checkpoint' };
  delete progress.error;
  const label = `finish-${randomUUID()}`;
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const client = new OnshapeClient({ ...await loadLiveCredentials('live-public'),
    observe: observation => appendFile(new URL(`${label}-calls.jsonl`, directory), `${JSON.stringify(observation)}\n`) });
  const save = async (name, value) => {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(`${JSON.stringify(client.sanitize(value), null, 2)}\n`);
    const existing = await loadBytes(name);
    if (existing) { assert.ok(existing.equals(bytes), `Refusing to overwrite different artifact ${name}`); return; }
    await writeFile(new URL(name, directory), bytes, { flag: 'wx' });
  };
  const checkpoint = async () => {
    progress.lastCheckpointAt = new Date().toISOString();
    await writeFile(new URL('summary.json', directory), `${JSON.stringify(client.sanitize(progress), null, 2)}\n`);
  };
  const studioPath = `/partstudios/d/${parent.documentId}/w/${parent.workspaceId}/e/${parent.partStudioId}`;
  const snapshots = async (variant, existingFeatures) => {
    const features = await load(`${variant}-features.json`) ?? existingFeatures ?? await client.request('GET', `${studioPath}/features`);
    verifyFeature(features, parent, benchmark, variant);
    if (!await load(`${variant}-features.json`)) await save(`${variant}-features.json`, features);
    const parts = await load(`${variant}-parts.json`) ?? await client.request('GET', `/parts/d/${parent.documentId}/w/${parent.workspaceId}?elementId=${parent.partStudioId}&withThumbnails=false&includePropertyDefaults=true`);
    await save(`${variant}-parts.json`, parts);
    assert.equal(parts.length, 9);
    assert.ok(parts.every(part => part.bodyType?.toLowerCase() === 'solid'));
    assert.deepEqual(parts.map(part => part.name).sort(), benchmark.requiredParts.map(role => role === 'coralReference' ? 'coralReference [REFERENCE - NON-BOM]' : role).sort());
    const evaluation = await load(`${variant}-measurements-raw.json`) ?? await client.request('POST', `${studioPath}/featurescript`, { script: measurementScript(parent.featureId, benchmark.requiredParts) });
    await save(`${variant}-measurements-raw.json`, evaluation);
    const validation = validateMeasurements(evaluation, expectations(benchmark, variant));
    await save(`${variant}-validation.json`, validation);
    const [solidCount, rows] = decodeFs(evaluation.result);
    const measured = { evidence: 'Decoded Onshape read-only evaluation of persistent custom feature', featureId: parent.featureId,
      sourceMicroversion: features.sourceMicroversion, solidCount,
      parts: rows.map(([name, count, min, max, volumeMm3, cylinders]) => ({ name, count, boundsMm: { min, max }, volumeMm3,
        cylinders: cylinders.map(([radiusMm, centerYMm, centerZMm, axis, minBound, maxBound]) => ({ radiusMm, centerYMm, centerZMm, axis, boundsMm: { min: minBound, max: maxBound } })) })) };
    const bounds = name => measured.parts.find(part => part.name === name).boundsMm;
    Object.assign(measured, { innerWidthMm: bounds('rightPlate').min[0] - bounds('leftPlate').max[0],
      clearRollerGapMm: bounds('rearRoller').min[1] - bounds('frontRoller').max[1],
      rearRollerYMm: (bounds('rearRoller').min[1] + bounds('rearRoller').max[1]) / 2,
      rollerLengthMm: bounds('frontRoller').max[0] - bounds('frontRoller').min[0],
      shaftLengthMm: bounds('frontShaft').max[0] - bounds('frontShaft').min[0] });
    await save(`${variant}-measured.json`, measured);
    progress.variants ??= {};
    progress.variants[variant] = { ...progress.variants[variant], validation, featureCount: 1, partCount: 9,
      parameters: features.features[0].parameters.map(({ parameterId, expression }) => ({ parameterId, expression })),
      measurements: `${variant}-measured.json`, exports: progress.variants[variant]?.exports ?? {} };
    await checkpoint();
  };
  const png = async variant => {
    let bytes = await loadBytes(`${variant}.png`);
    if (!bytes) {
      const matrix = '0.7071067812,0.7071067812,0,0,-0.4082482905,0.4082482905,0.8164965809,0,0.5773502692,-0.5773502692,0.5773502692,0';
      const response = await load(`${variant}-shadedviews.json`) ?? await client.request('GET', `${studioPath}/shadedviews?viewMatrix=${matrix}&outputWidth=1200&outputHeight=900&pixelSize=0&showAllParts=true`);
      await save(`${variant}-shadedviews.json`, response);
      const image = response.images?.flat(Infinity).find(item => typeof item === 'string');
      assert.ok(image, 'No API image');
      bytes = Buffer.from(image, 'base64');
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      await save(`${variant}.png`, bytes);
    }
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    progress.variants[variant].exports.image = { status: 'RECEIVED_PNG', file: `${variant}.png`, bytes: bytes.length,
      sha256: sha256(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    await checkpoint();
  };
  const step = async variant => {
    let manifest = await load(`${variant}-export-manifest.json`);
    if (!manifest) {
      let bytes = await loadBytes(`${variant}-export.bin`);
      if (!bytes) {
        const created = await load(`${variant}-translation-created.json`);
        let call = await load(`${variant}-translation-call.json`);
        if (!call && created) {
          const calls = (await loadBytes('calls.jsonl')).toString('utf8').trim().split('\n').map(JSON.parse);
          call = calls.find(item => item.method === 'POST' && item.path === `${studioPath}/export/step` && item.response?.id === created.id);
          assert.ok(call, 'Saved translation requires its original successful request evidence');
        }
        if (!call) {
          const body = { storeInDocument: false, grouping: true, destinationName: `featurescript-${variant}`,
            stepVersionString: 'AP242', notifyUser: false, triggerAutoDownload: false };
          const response = await client.request('POST', `${studioPath}/export/step`, body);
          call = { method: 'POST', path: `${studioPath}/export/step`, requestBody: body, status: 200, response };
          await save(`${variant}-translation-call.json`, call);
          await save(`${variant}-translation-created.json`, response);
        } else await save(`${variant}-translation-call.json`, call);
        client.resumeTranslation(call);
        let translation;
        for (let poll = 0; poll < 8; poll++) {
          if (poll > 0) await delay(Math.min(2000 * 2 ** (poll - 1), 10000));
          translation = await client.request('GET', `/translations/${call.response.id}`);
          if (translation.requestState !== 'ACTIVE') break;
        }
        assert.equal(translation.requestState, 'DONE', 'Translation not DONE within bounded polling budget');
        await save(`${variant}-translation-final.json`, translation);
        assert.equal(translation.resultExternalDataIds?.length, 1);
        const foreignId = translation.resultExternalDataIds[0];
        assert.match(foreignId, /^[A-Za-z0-9_-]+$/);
        bytes = await client.request('GET', `/documents/d/${parent.documentId}/externaldata/${foreignId}`, undefined, true);
      }
      manifest = await retainStep(bytes, variant, save);
    }
    assert.equal(sha256(await loadBytes(manifest.rawFile)), manifest.sha256);
    for (const part of manifest.parts) assert.equal(sha256(await loadBytes(part.file)), part.sha256);
    progress.variants[variant].exports.step = manifest;
    await checkpoint();
  };
  try {
    await client.resumePublicDocument(creation, true);
    await checkpoint();
    progress.stage = 'baseline-saved-measurements';
    await snapshots('baseline', baselineFeatures);
    progress.stage = 'baseline-media-recovery';
    await png('baseline');
    await step('baseline');
    progress.stage = 'same-feature-parameter-revision';
    const current = await client.request('GET', `${studioPath}/features`);
    const revised = await ensureRevision(client, studioPath, parent, benchmark, current, save);
    progress.stage = 'revision-server-measurements';
    await snapshots('revision', revised);
    progress.stage = 'revision-media';
    await png('revision');
    await step('revision');
    Object.assign(progress, { status: 'GEOMETRY_AND_EXPORTS_VERIFIED', stage: 'completed',
      compilation: 'EXPORTED_SPEC_AND_OK_REGENERATION_OBSERVED',
      bomMetadata: 'Source sets EXCLUDE_FROM_BOM and server name identifies reference; assembly BOM not verified' });
  } catch (error) { Object.assign(progress, { status: 'BLOCKED', error: error.message }); }
  const invocation = { label, startedAt, elapsedMs: performance.now() - started, networkRequests: client.requestCount,
    retries: 0, status: progress.status, stage: progress.stage };
  progress.finishInvocations = [...(progress.finishInvocations ?? []), invocation];
  progress.latestInvocation = invocation;
  await save(`${label}-summary.json`, invocation);
  await checkpoint();
  return client.sanitize(await reconcileSummary(directory));
}

if (import.meta.main) {
  try { const result = await finish(); console.log(JSON.stringify(result, null, 2)); if (result.status !== 'GEOMETRY_AND_EXPORTS_VERIFIED') process.exitCode = 1; }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}