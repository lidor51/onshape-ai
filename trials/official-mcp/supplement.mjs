import { createHash, createHmac, randomBytes } from 'node:crypto';
import { mkdir, open, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { loadLocalFixture } from './generate.mjs';
import { validateMeasurements } from './final-measurements.mjs';
import { saveStepExport } from './supplement-step.mjs';
import { ORIGIN, TARGET, ROLES, PHASE_CAP, TOTAL_CAP, authorize, validateLedger, reserve,
  requestPlan, assertRequest, validId, fail } from './supplement-policy.mjs';

const artifactRoot = new URL('./artifacts/readonly-supplement/', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const safeError = error => /^[A-Z][A-Z0-9_]+$/.test(error?.message ?? '') ? error.message : 'SUPPLEMENT_FAILED';
export const newLedger = () => ({ schema: 1, target: TARGET, phaseCap: PHASE_CAP, totalCap: TOTAL_CAP,
  mode: 'READ_ONLY_REST_SUPPLEMENT_TO_OFFICIAL_MCP_MODELING', officialPlanningReserve: 100,
  parentApproximatePriorRequests: 59, priorManagedDiscoveryRequests: 8, requests: [], phases: {} });

export function decodeFs(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(decodeFs);
  if (value.message) return decodeFs({ ...value.message, type: value.typeName ?? value.message.type });
  const type = value.typeName ?? value.type ?? value.btType;
  if (typeof type === 'string' && /(?:Map|Object)(?:-|$)/.test(type)) {
    if (!Array.isArray(value.value)) fail('MEASUREMENT_MAP_INVALID');
    const result = {};
    for (const wrappedEntry of value.value) {
      const entry = wrappedEntry.message ?? wrappedEntry;
      const key = decodeFs(entry.key);
      if (typeof key !== 'string' || Object.hasOwn(result, key) || ['__proto__', 'constructor', 'prototype'].includes(key)) fail('MEASUREMENT_KEY_INVALID');
      result[key] = decodeFs(entry.value);
    }
    return result;
  }
  if (typeof type === 'string' && /(?:Array|Vector)(?:-|$)/.test(type)) {
    if (!Array.isArray(value.value)) fail('MEASUREMENT_ARRAY_INVALID');
    return value.value.map(decodeFs);
  }
  if (typeof type === 'string' && /(?:Number|String|Boolean)(?:-|$)/.test(type)) return value.value;
  if (typeof type === 'string' && /Undefined(?:-|$)/.test(type)) return null;
  if (type) fail('MEASUREMENT_TYPE_UNRECOGNIZED');
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, decodeFs(nested)]));
}

export function featureSnapshot(body, phase) {
  if (!validId(body?.sourceMicroversion) || !Array.isArray(body.features)) fail('FEATURE_SNAPSHOT_SCHEMA_INVALID');
  const found = body.features.map(feature => feature.message ?? feature).filter(feature => feature.featureId === TARGET.featureId);
  if (found.length !== 1) fail('RETAINED_FEATURE_NOT_FOUND');
  const feature = found[0];
  const states = Array.isArray(body.featureStates) ? body.featureStates.filter(entry => entry.key === TARGET.featureId).map(entry => entry.value) : [body.featureStates?.[TARGET.featureId]];
  if (states.length !== 1) fail('RETAINED_STATE_AMBIGUOUS');
  const state = states[0]?.message ?? states[0];
  if (feature.suppressed === true || state?.featureStatus !== 'OK') fail('RETAINED_FEATURE_NOT_OK');
  if (typeof feature.namespace !== 'string' || !feature.namespace.startsWith(`e${TARGET.fsid}::m`) ||
      !validId(feature.namespace.split('::m')[1]) || phase === 'baseline' && feature.namespace !== TARGET.namespace) fail('RETAINED_NAMESPACE_MISMATCH');
  return { microversion: body.sourceMicroversion, featureId: feature.featureId, featureType: feature.featureType,
    name: feature.name, namespace: feature.namespace, state, suppressed: feature.suppressed ?? false };
}

export function measuredModel(response) {
  if (!Array.isArray(response?.notices) || response.notices.some(notice => /error/i.test(JSON.stringify(notice))) || response.result == null) fail('EVALUATION_NOT_CONFIRMED');
  const measured = decodeFs(response.result);
  if (measured?.partCount !== 9 || measured.allSolidCount !== 9 || measured.parts?.length !== 9) fail('PERSISTED_SOLID_COUNT_MISMATCH');
  for (const [index, role] of ROLES.entries()) {
    const part = measured.parts[index];
    if (part.role !== role || part.name !== role || part.excludeFromBOM !== (role === 'coralReference')) fail('PERSISTED_NAME_OR_BOM_MISMATCH');
  }
  measured.parametersMm = {
    innerWidth: measured.parts[1].minMm[0] - measured.parts[0].maxMm[0],
    rollerGap: measured.parts[3].minMm[1] - measured.parts[2].maxMm[1],
    plateThickness: measured.parts[0].maxMm[0] - measured.parts[0].minMm[0],
  };
  return measured;
}

export function pngBytes(response) {
  if (!Array.isArray(response?.images) || response.images.length !== 1 || typeof response.images[0] !== 'string') fail('PNG_RESPONSE_SCHEMA_INVALID');
  const encoded = response.images[0].replace(/^data:image\/png;base64,/, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) fail('PNG_BASE64_INVALID');
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      bytes.length < 100 || bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 900) fail('PNG_SIGNATURE_OR_DIMENSIONS_INVALID');
  return bytes;
}

export function transport({ credentials, ledger, phase, checkpoint, save, fetchImpl = fetch, replay = [] }) {
  const snapshots = new Set();
  const translations = new Set();
  const downloads = new Set();
  const forbiddenBytes = [credentials.accessKey, credentials.secretKey].map(value => Buffer.from(value));
  return async (kind, binding = {}) => {
    const request = requestPlan(kind, binding);
    assertRequest(request, kind, binding);
    if (['source', 'parts', 'measure', 'png'].includes(kind) && !snapshots.has(binding.microversion) ||
        kind === 'poll' && !translations.has(binding.translationId) ||
        kind === 'download' && !downloads.has(binding.externalDataId)) fail('UNOBSERVED_RESPONSE_BINDING');
    const cached = replay.shift();
    if (cached && (cached.entry.method !== request.method || cached.entry.url !== request.url ||
      request.body && cached.entry.requestBodySha256 !== digest(JSON.stringify(request.body)))) fail('REPLAY_REQUEST_MISMATCH');
    if (!cached && kind === 'poll' && (ledger.requests.filter(entry => entry.phase === phase).length >= PHASE_CAP - 2 ||
      ledger.requests.length >= TOTAL_CAP - 2)) fail('EXPORT_TAIL_BUDGET_RESERVED');
    const entry = cached?.entry ?? reserve(ledger, phase, request);
    if (request.body) entry.requestBodySha256 = digest(JSON.stringify(request.body));
    await checkpoint();
    const date = new Date().toUTCString();
    const nonce = randomBytes(16).toString('hex');
    const parsed = new URL(request.url);
    const contentType = 'application/json';
    const canonical = [request.method, nonce, date, contentType, parsed.pathname, parsed.search.slice(1), ''].join('\n').toLowerCase();
    const signature = createHmac('sha256', credentials.secretKey).update(canonical).digest('base64');
    try {
      const response = cached ? new Response(cached.bytes, { status: cached.entry.status,
        headers: { 'content-type': cached.entry.contentType } }) : await fetchImpl(parsed.href, {
        method: request.method, redirect: 'manual', credentials: 'omit', signal: AbortSignal.timeout(90_000),
        headers: { Accept: kind === 'download' ? 'application/octet-stream' : 'application/json',
          'Content-Type': contentType, Date: date, 'On-Nonce': nonce,
          Authorization: `On ${credentials.accessKey}:HmacSHA256:${signature}` },
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      entry.status = response.status;
      if (response.status >= 300 && response.status < 400) fail('REDIRECT_DENIED');
      const reader = response.body?.getReader();
      if (!reader) fail('EMPTY_HTTP_RESPONSE');
      const chunks = [];
      let length = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          length += chunk.value.byteLength;
          if (length > 50_000_000) fail('RESPONSE_TOO_LARGE');
          chunks.push(chunk.value);
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
      const bytes = Buffer.concat(chunks);
      if (forbiddenBytes.some(secret => bytes.includes(secret))) fail('RESPONSE_CONTAINS_CREDENTIAL_BYTES');
      const extension = kind === 'download' && response.ok ? 'step' : 'json';
      entry.response = await save(`${phase}-${String(entry.sequence).padStart(2, '0')}-${kind}.${extension}`, bytes);
      entry.contentType = response.headers.get('content-type');
      if (!response.ok) fail(`HTTP_${response.status}`);
      if (kind === 'download') return bytes;
      if (!entry.contentType?.includes('application/json')) fail('RESPONSE_NOT_JSON');
      const body = JSON.parse(bytes.toString('utf8'));
      if (kind === 'features') snapshots.add(featureSnapshot(body, phase).microversion);
      if (kind === 'step' || kind === 'poll') {
        if (body.documentId && body.documentId !== TARGET.did || body.workspaceId && body.workspaceId !== TARGET.wid ||
            body.elementId && body.elementId !== TARGET.eid || body.requestElementId && body.requestElementId !== TARGET.eid) fail('EXPORT_TARGET_MISMATCH');
        if (!validId(body.id)) fail('TRANSLATION_ID_INVALID');
        if (kind === 'poll' && body.id !== binding.translationId) fail('TRANSLATION_ID_MISMATCH');
        translations.add(body.id);
        if (body.requestState === 'DONE') {
          if (body.resultDocumentId && body.resultDocumentId !== TARGET.did) fail('EXPORT_DOCUMENT_MISMATCH');
          if (!Array.isArray(body.resultExternalDataIds) || body.resultExternalDataIds.length !== 1 || !validId(body.resultExternalDataIds[0])) fail('EXPORT_RESULT_INVALID');
          downloads.add(body.resultExternalDataIds[0]);
        }
      }
      if (cached) entry.replayedSuccessfullyAt = new Date().toISOString();
      return body;
    } catch (error) {
      entry.failure = safeError(error);
      fail(entry.failure);
    } finally {
      entry.completedAt = new Date().toISOString();
      await checkpoint();
    }
  };
}

const tokens = source => source.match(/"(?:\\[\s\S]|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|[A-Za-z_$][A-Za-z0-9_$]*|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||\+\+|--|::|->|[^\s]/g) ?? [];

export async function capture({ phase, request, save, task, localSource, report, wait = delay }) {
  const before = featureSnapshot(await request('features'), phase);
  report.before = before;
  const binding = { microversion: before.microversion };
  const source = await request('source', binding);
  if (typeof source.contents !== 'string') fail('SOURCE_READBACK_SCHEMA_INVALID');
  report.source = await save(`${phase}-persisted.fs`, Buffer.from(source.contents));
  report.source.tokenEquivalentToLocalArtifact = JSON.stringify(tokens(source.contents)) === JSON.stringify(tokens(localSource));
  if (!report.source.tokenEquivalentToLocalArtifact) fail('SOURCE_TOKEN_MISMATCH');
  const parts = await request('parts', binding);
  if (!Array.isArray(parts) || parts.length !== 9 || new Set(parts.map(part => part.partId)).size !== 9 ||
      parts.some(part => !part.partId) || JSON.stringify(parts.map(part => part.name).sort()) !== JSON.stringify([...ROLES].sort())) fail('PART_LIST_IDENTITY_MISMATCH');
  report.parts = parts.map(part => ({ partId: part.partId, name: part.name, bodyType: part.bodyType }));
  const measured = measuredModel(await request('measure', binding));
  report.measurements = await save(`${phase}-measured.json`, Buffer.from(`${JSON.stringify(measured, null, 2)}\n`));
  try { report.validation = validateMeasurements(measured, task, phase); } catch { fail('PERSISTED_GEOMETRY_VALIDATION_FAILED'); }
  report.validation.inputOriginAuthenticated = true;
  report.validation.persistedGeometryVerified = true;
  report.validation.status = 'PASS_PERSISTED_READ_ONLY_REST_MEASUREMENTS';
  report.validation.caveat = 'Authenticated read-only REST supplement, not an official MCP modeling/export capability. Numeric parameters are derived from measured geometry, not editable UI parameters.';
  report.bom = measured.parts.map(part => ({ name: part.name, excludeFromBOM: part.excludeFromBOM }));
  report.png = await save(`${phase}.png`, pngBytes(await request('png', binding)));
  const exportBefore = featureSnapshot(await request('features'), phase);
  if (before.microversion !== exportBefore.microversion) fail('WORKSPACE_CHANGED_BEFORE_EXPORT');
  let translation = await request('step');
  for (let poll = 0; translation.requestState !== 'DONE' && poll < 3; poll++) {
    if (translation.requestState === 'FAILED') fail('STEP_TRANSLATION_FAILED');
    await wait(3000 * (poll + 1));
    translation = await request('poll', { translationId: translation.id });
  }
  if (translation.requestState !== 'DONE') fail('STEP_POLL_LIMIT_SAVE_PARTIAL');
  report.translation = { id: translation.id, requestState: translation.requestState, resultExternalDataIds: translation.resultExternalDataIds };
  const step = await request('download', { externalDataId: translation.resultExternalDataIds[0] });
  report.step = await saveStepExport(phase, step, save);
  const after = featureSnapshot(await request('features'), phase);
  report.after = after;
  if (after.microversion !== before.microversion) fail('WORKSPACE_CHANGED_DURING_EXPORT');
  report.consistency = 'Parts, source, evaluation and PNG pinned to microversion; workspace STEP bracketed by equal before/after microversions.';
  report.status = `PASS_${phase.toUpperCase()}`;
}

async function main() {
  const phase = authorize(process.argv.slice(2));
  const resuming = process.argv.includes('--resume-saved-responses');
  await mkdir(artifactRoot, { recursive: true });
  const lockPath = new URL('capture.lock', artifactRoot);
  const lock = await open(lockPath, 'wx');
  await lock.close();
  try {
    const ledgerPath = new URL('ledger.json', artifactRoot);
    let ledger;
    try { ledger = validateLedger(JSON.parse(await readFile(ledgerPath, 'utf8'))); }
    catch (error) {
      if (error.code !== 'ENOENT' || phase !== 'baseline' || resuming) throw error;
      ledger = newLedger();
      const once = await open(ledgerPath, 'wx');
      await once.writeFile(`${JSON.stringify(ledger, null, 2)}\n`);
      await once.close();
    }
    if (resuming ? ledger.phases[phase]?.status !== 'PARTIAL_STOPPED' :
      ledger.phases[phase] || ledger.requests.some(entry => entry.phase === phase)) fail('PHASE_ALREADY_STARTED_NEVER_RESET');
    if (phase === 'revision' && ledger.phases.baseline?.status !== 'PASS_BASELINE') fail('BASELINE_MUST_COMPLETE_FIRST');
    const report = ledger.phases[phase] ?? { phase, status: 'IN_PROGRESS', startedAt: new Date().toISOString(), target: TARGET,
      provenance: '../parent-retained-baseline.json', evidenceClass: 'AUTHENTICATED_READ_ONLY_REST_SUPPLEMENT',
      explicitCurrentKeyAuthorization: true, keyRotationAttested: false, modelWrites: 0,
      exportJobsStoreInDocument: false, maxPollRequests: 3, officialToolInvocationsByThisScript: 0 };
    if (resuming) {
      report.resumes ??= [];
      report.resumes.push({ resumedAt: new Date().toISOString(), priorBlocker: report.blocker, requestsBefore: ledger.requests.length });
      delete report.blocker;
      report.status = 'IN_PROGRESS';
    }
    ledger.phases[phase] = report;
    const checkpoint = async () => {
      const temporary = new URL('ledger.pending.json', artifactRoot);
      await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`);
      await rename(temporary, ledgerPath);
    };
    const save = async (name, bytes) => {
      const path = new URL(name, artifactRoot);
      try {
        const file = await open(path, 'wx');
        await file.writeFile(bytes);
        await file.close();
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        if (!(await readFile(path)).equals(bytes)) fail('ARTIFACT_ALREADY_EXISTS_DIFFERENT_BYTES');
      }
      return { file: name, bytes: bytes.length, sha256: digest(bytes) };
    };
    await checkpoint();
    try {
      const parent = JSON.parse(await readFile(new URL('./artifacts/parent-retained-baseline.json', import.meta.url), 'utf8'));
      if (parent.documentId !== TARGET.did || parent.workspaceId !== TARGET.wid || parent.partStudioId !== TARGET.eid ||
          parent.featureStudioId !== TARGET.fsid || parent.featureId !== TARGET.featureId ||
          parent.evidenceClass !== 'PARENT_ATTRIBUTED_TOOL_OUTCOMES_NOT_RAW_RESPONSES') fail('PARENT_PROVENANCE_MISMATCH');
      const env = parseEnv(await readFile(new URL('../../.env.local', import.meta.url), 'utf8'));
      if (env.ONSHAPE_BASE_URL && env.ONSHAPE_BASE_URL.replace(/\/$/, '') !== ORIGIN) fail('CREDENTIAL_ORIGIN_DENIED');
      if (!env.ONSHAPE_ACCESS_KEY || !env.ONSHAPE_SECRET_KEY) fail('CURRENT_CREDENTIALS_MISSING');
      const credentials = { accessKey: env.ONSHAPE_ACCESS_KEY, secretKey: env.ONSHAPE_SECRET_KEY };
      const replay = [];
      if (resuming) {
        for (const entry of ledger.requests.filter(entry => entry.phase === phase && entry.status >= 200 && entry.status < 300 && entry.response)) {
          if (!/^[a-z0-9.-]+$/.test(entry.response.file)) fail('REPLAY_ARTIFACT_PATH_INVALID');
          const bytes = await readFile(new URL(entry.response.file, artifactRoot));
          if (bytes.length !== entry.response.bytes || digest(bytes) !== entry.response.sha256) fail('REPLAY_ARTIFACT_HASH_MISMATCH');
          replay.push({ entry, bytes });
        }
      }
      const request = transport({ credentials, ledger, phase, checkpoint, save, replay });
      const { task } = await loadLocalFixture();
      const localSource = await readFile(new URL(`./artifacts/final-repair-${phase}.fs`, import.meta.url), 'utf8');
      await capture({ phase, request, save, task, localSource, report });
    } catch (error) {
      report.status = 'PARTIAL_STOPPED';
      report.blocker = safeError(error);
    }
    report.completedAt = new Date().toISOString();
    report.phaseRequests = ledger.requests.filter(entry => entry.phase === phase).length;
    report.cumulativeRequests = ledger.requests.length;
    await checkpoint();
    await writeFile(new URL(`${phase}-report.json`, artifactRoot), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({ status: report.status, blocker: report.blocker, phaseRequests: report.phaseRequests,
      cumulativeRequests: report.cumulativeRequests, validation: report.validation?.status,
      partCount: report.parts?.length, png: report.png?.file, step: report.step?.file,
      artifactDirectory: 'trials/official-mcp/artifacts/readonly-supplement',
      nextRevisionCommand: report.status === 'PASS_BASELINE' ? 'node trials/official-mcp/supplement.mjs revision --live-readonly-export --allow-current-key --parent-branch-quiescent' : null }, null, 2));
    if (!report.status.startsWith('PASS_')) process.exitCode = 1;
  } finally {
    await unlink(lockPath);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(safeError(error)); process.exitCode = 1; });
}