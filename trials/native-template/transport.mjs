import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertPreflight } from './preflight.mjs';
import { authorize, Ledger } from './safety.mjs';
import { loadCredentials, safeEvidence } from './credentials.mjs';

const contract = JSON.parse(readFileSync(new URL('./sources/openapi-contract.json', import.meta.url), 'utf8'));
const apiPath = new URL(contract.servers[0].url).pathname;
const idPattern = /^[0-9a-f]{24}$/;
const allowlist = new Set(['createDocument', 'getDocument', 'copyWorkspace', 'getElementsInDocument',
  'getPartStudioFeatures', 'addPartStudioFeature', 'updateFeatures', 'getPartStudioFeatureSpecs',
  'getPartStudioBodyDetails', 'getPartStudioMassProperties', 'getPartStudioBoundingBoxes', 'getSketchInfo']);

export function createLiveTransport({ options, report, bundle, tests, directory, binding,
  credentialProvider = loadCredentials, fetchFn = fetch }) {
  assertPreflight(report, bundle, tests, binding);
  const authorization = authorize(options);
  const ledger = new Ledger(directory, authorization, report.sourceHash, options.resumeOwned === true);
  let credentials;
  try { credentials = credentialProvider(authorization.origin); } catch { ledger.close(); throw new Error('CREDENTIALS_NOT_PROVIDED'); }
  const document = role => ledger.events.find(event => event.kind === 'document' && event.role === role);
  const verified = role => ledger.events.some(event => event.kind === 'visibility' && event.role === role && event.isPublic === true);
  const element = role => ledger.events.find(event => event.kind === 'element' && event.role === role)?.eid;

  async function request(phase, operation, role, body, query = {}, microversion) {
    if (!allowlist.has(operation) || !['template', 'copy'].includes(role)) throw new Error('OPERATION_SCOPE');
    const operationSpec = contract.operations[operation];
    const createsDocument = ['createDocument', 'copyWorkspace'].includes(operation);
    const target = document(role);
    if (operation === 'createDocument') {
      if (phase !== 'setup' || role !== 'template' || document('template') || ledger.summary().documentSlots !== 0 ||
        body?.isPublic !== true || body.name !== 'Native template synthetic left plate') throw new Error('CREATE_SCOPE');
    } else {
      if (!target || !idPattern.test(target.did) || !idPattern.test(target.wid)) throw new Error('UNOWNED_DOCUMENT');
      if (operation !== 'getDocument' && !verified(role)) throw new Error('VISIBILITY_UNVERIFIED');
    }
    if (operation === 'copyWorkspace' && (phase !== 'copy' || role !== 'template' || document('copy') ||
      body?.isPublic !== true || body.newName !== 'Native template synthetic editable copy')) throw new Error('COPY_SCOPE');
    if (operation === 'addPartStudioFeature' && !((phase === 'setup' && role === 'template') ||
      (phase === 'simulated-editor' && role === 'copy'))) throw new Error('ADD_SCOPE');
    if (operation === 'updateFeatures') {
      const owned = phase === 'revision' ? ['innerWidth', 'rollerGap'] : phase === 'simulated-editor' ? ['plateThickness', 'pivotY'] : [];
      const names = body?.features?.map(feature => {
        if (feature.featureType !== 'assignVariable') throw new Error('UPDATE_SCOPE');
        return feature.parameters.find(parameter => parameter.parameterId === 'name')?.value;
      });
      if (role !== 'copy' || !names || names.length !== 2 || new Set(names).size !== 2 ||
        names.some(name => !owned.includes(name))) throw new Error('UPDATE_SCOPE');
    }
    if (['addPartStudioFeature', 'updateFeatures'].includes(operation) &&
      (body?.rejectMicroversionSkew !== true || !idPattern.test(body?.sourceMicroversion) ||
      !Number.isInteger(body?.libraryVersion) || typeof body?.serializationVersion !== 'string')) throw new Error('CONCURRENCY_GUARD_REQUIRED');
    if (microversion && (!idPattern.test(microversion) || !ledger.events.some(event =>
      event.kind === 'microversion' && event.role === role && event.value === microversion))) throw new Error('UNOBSERVED_MICROVERSION');
    const variables = { did: target?.did, wid: target?.wid, wvm: microversion ? 'm' : 'w',
      wvmid: microversion ?? target?.wid, eid: element(role) };
    const path = operationSpec.path.replace(/\{(\w+)\}/g, (_, name) => {
      if (!variables[name]) throw new Error('UNRESOLVED_NATIVE_ID');
      return encodeURIComponent(variables[name]);
    });
    const allowedQuery = new Set((operationSpec.parameters ?? []).filter(item => item.in === 'query').map(item => item.name));
    if (Object.keys(query).some(name => !allowedQuery.has(name) || ['linkDocumentId', 'configuration', 'partIds', 'partId'].includes(name))) throw new Error('QUERY_SCOPE');
    const suffix = new URLSearchParams(query).toString();
    const url = new URL(`${authorization.origin}${apiPath}${path}${suffix ? `?${suffix}` : ''}`);
    if (url.origin !== authorization.origin) throw new Error('ORIGIN_SCOPE');
    const method = operationSpec.method.toUpperCase();
    const contentType = 'application/json';
    const nonce = randomBytes(16).toString('hex');
    const date = new Date().toUTCString();
    const toSign = `${method}\n${nonce}\n${date}\n${contentType}\n${url.pathname}\n${url.search.slice(1)}\n`.toLowerCase();
    const signature = createHmac('sha256', credentials.secretKey).update(toSign).digest('base64');
    const sequence = ledger.attempt(phase, operation, createsDocument);
    const start = performance.now();
    let status;
    let completed = false;
    try {
      const response = await fetchFn(url.href, { method, redirect: 'manual', signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': contentType, Accept: 'application/json', Date: date, 'On-Nonce': nonce,
          Authorization: `On ${credentials.accessKey}:HmacSHA256:${signature}` },
        ...(body ? { body: JSON.stringify(body) } : {}) });
      status = response.status;
      if (status < 200 || status >= 300) {
        ledger.outcome(sequence, status, performance.now() - start);
        completed = true;
        throw new Error(status >= 300 && status < 400 ? 'REDIRECT_REFUSED' : `HTTP_${status}`);
      }
      const data = safeEvidence(await response.json(), credentials);
      ledger.outcome(sequence, status, performance.now() - start);
      completed = true;
      if (!['createDocument', 'getDocument', 'copyWorkspace'].includes(operation)) {
        writeFileSync(join(directory, `response-${String(sequence).padStart(3, '0')}-${operation}.json`),
          `${JSON.stringify(data, null, 2)}\n`, { flush: true });
      }
      if (createsDocument) {
        const newRole = operation === 'createDocument' ? 'template' : 'copy';
        const did = operation === 'createDocument' ? data.id : data.newDocumentId;
        const wid = operation === 'createDocument' ? data.defaultWorkspace?.id : data.newWorkspaceId;
        if (!idPattern.test(did) || !idPattern.test(wid) || ledger.events.some(event => event.kind === 'document' && event.did === did)) throw new Error('DOCUMENT_PROVENANCE_UNKNOWN');
        ledger.record({ kind: 'document', role: newRole, did, wid, creationSequence: sequence,
          sourceRole: operation === 'copyWorkspace' ? 'template' : null });
      }
      if (operation === 'getDocument') {
        if (data.id !== target.did || data.public !== true) throw new Error('PUBLIC_VISIBILITY_NOT_CONFIRMED');
        ledger.record({ kind: 'visibility', role, isPublic: true });
      }
      if (data.microversionSkew === true) throw new Error('SERVER_MICROVERSION_CONFLICT');
      if (data.sourceMicroversion) {
        if (!idPattern.test(data.sourceMicroversion)) throw new Error('MICROVERSION_SCHEMA_UNKNOWN');
        ledger.record({ kind: 'microversion', role, value: data.sourceMicroversion });
      }
      if (['addPartStudioFeature', 'updateFeatures'].includes(operation) && data.libraryVersion === 0 && body.libraryVersion > 0) {
        ledger.record({ kind: 'inherited-library-version', sequence, value: body.libraryVersion, reason: 'mutation response uses zero sentinel; retain guarded request library' });
        data.libraryVersion = body.libraryVersion;
      }
      return data;
    } catch (error) {
      if (!completed) ledger.outcome(sequence, status, performance.now() - start, true);
      if (completed && error.message === 'DOCUMENT_PROVENANCE_UNKNOWN') ledger.record({ kind: 'ambiguity', sequence });
      const code = /^(HTTP_\d{3}|REDIRECT_REFUSED|DOCUMENT_PROVENANCE_UNKNOWN|PUBLIC_VISIBILITY_NOT_CONFIRMED|SERVER_MICROVERSION_CONFLICT|MICROVERSION_SCHEMA_UNKNOWN)$/.test(error.message) ? error.message : 'UNKNOWN_OUTCOME';
      ledger.halt(code);
      throw new Error(code);
    }
  }
  return { ledger, request, document, element, close: () => { credentials = null; ledger.close(); } };
}