import { createHmac, randomBytes } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';

export const ORIGIN = 'https://cad.onshape.com';
export const MANAGED_NAMES = ['FeatureScript MCP Workspace', 'FeatureScript MCP Notes'];
export const REQUEST_CAP = 8;
const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/.test(value);
const stop = code => { throw new Error(code); };

export function authorizeDiscovery(flags) {
  const required = ['--live-managed-discovery', '--allow-current-key', '--allow-new-public-managed-documents'];
  const resume = ['--resume-after-http-400', '--resume-partial-discovery', '--resume-visibility-schema'].find(flag => flags.includes(flag));
  const expected = resume ? [...required, resume] : required;
  if (flags.length !== expected.length || expected.some(flag => !flags.includes(flag))) stop('AUTHORIZATION_REQUIRED');
}

export function minimalDocument(document, expectedName) {
  if (document?.name !== expectedName || !MANAGED_NAMES.includes(expectedName) || !validId(document.id)) {
    stop('DOCUMENT_IDENTITY_NOT_VERIFIED');
  }
  const visibilityFields = ['isPublic', 'public'].filter(key => Object.hasOwn(document, key));
  if (!visibilityFields.length || visibilityFields.some(key => typeof document[key] !== 'boolean')) stop('DOCUMENT_VISIBILITY_UNKNOWN');
  const visibility = document[visibilityFields[0]];
  if (visibilityFields.some(key => document[key] !== visibility)) stop('DOCUMENT_VISIBILITY_CONFLICT');
  const workspaceId = document.defaultWorkspace?.id;
  if (!validId(workspaceId)) stop('DEFAULT_WORKSPACE_UNKNOWN');
  return { id: document.id, name: expectedName, isPublic: visibility, defaultWorkspaceId: workspaceId };
}

export function exactCandidate(body, name) {
  if (!Array.isArray(body?.items)) stop('LIST_RESPONSE_UNRECOGNIZED');
  if (body.next || body.items.length >= 20 || (typeof body.totalCount === 'number' && body.totalCount > body.items.length)) {
    stop('LIST_NOT_EXHAUSTIVE');
  }
  const matches = body.items.filter(document => document?.name === name);
  if (matches.length !== 1) stop(matches.length ? 'AMBIGUOUS_MANAGED_DOCUMENT' : 'MANAGED_DOCUMENT_NOT_FOUND');
  if (!validId(matches[0].id)) stop('DOCUMENT_IDENTITY_NOT_VERIFIED');
  return { id: matches[0].id, name };
}

export function approvedUrl(url, approvedIds = new Set()) {
  const parsed = new URL(url);
  if (parsed.origin !== ORIGIN || parsed.username || parsed.password || parsed.hash) stop('UNAPPROVED_ORIGIN');
  if (parsed.pathname === '/api/documents') {
    const keys = [...parsed.searchParams.keys()].sort().join(',');
    if (keys !== 'filter,limit,offset,q' || parsed.searchParams.get('filter') !== '0' || !MANAGED_NAMES.includes(parsed.searchParams.get('q')) ||
      parsed.searchParams.get('limit') !== '20' || parsed.searchParams.get('offset') !== '0') {
      stop('UNAPPROVED_DOCUMENT_SEARCH');
    }
  } else {
    const identity = parsed.pathname.match(/^\/api\/documents\/([a-f0-9]{24})$/)?.[1];
    if (!identity || !approvedIds.has(identity) || parsed.search) stop('UNAPPROVED_DOCUMENT_ROUTE');
  }
  return parsed;
}

export function guardedGet({ credentials, fetchImpl = fetch, ledger, checkpoint = async () => {} }) {
  const approvedIds = new Set();
  return {
    approveId(identity) {
      if (!validId(identity)) stop('DOCUMENT_IDENTITY_NOT_VERIFIED');
      approvedIds.add(identity);
    },
    async get(url) {
      const parsed = approvedUrl(url, approvedIds);
      if (ledger.requests.length >= REQUEST_CAP) stop('DISCOVERY_REQUEST_CAP');
      const entry = { method: 'GET', url: parsed.href, startedAt: new Date().toISOString(), status: null };
      ledger.requests.push(entry);
      await checkpoint();
      const date = new Date().toUTCString();
      const nonce = randomBytes(16).toString('hex');
      const contentType = 'application/json';
      const canonical = ['GET', nonce, date, contentType, parsed.pathname, parsed.search.slice(1), ''].join('\n').toLowerCase();
      const signature = createHmac('sha256', credentials.secretKey).update(canonical).digest('base64');
      try {
        const response = await fetchImpl(parsed.href, {
          method: 'GET', redirect: 'manual', credentials: 'omit', signal: AbortSignal.timeout(20_000),
          headers: { Accept: 'application/json', 'Content-Type': contentType, Date: date, 'On-Nonce': nonce,
            Authorization: `On ${credentials.accessKey}:HmacSHA256:${signature}` },
        });
        entry.status = response.status;
        if (response.status !== 200) stop('DOCUMENT_REQUEST_NOT_200');
        if (!response.headers.get('content-type')?.includes('application/json')) stop('DOCUMENT_RESPONSE_NOT_JSON');
        const reader = response.body.getReader();
        const chunks = [];
        let bytes = 0;
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            bytes += chunk.value.byteLength;
            if (bytes > 2_000_000) stop('DOCUMENT_RESPONSE_TOO_LARGE');
            chunks.push(chunk.value);
          }
          return JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } finally {
          await reader.cancel();
          reader.releaseLock();
        }
      } catch {
        entry.failure = 'DOCUMENT_REQUEST_FAILED';
        stop('DOCUMENT_REQUEST_FAILED');
      } finally {
        entry.completedAt = new Date().toISOString();
        await checkpoint();
      }
    },
  };
}

export async function discoverManaged(client, report) {
  report.absentManagedNames = [];
  report.matchedCandidates = [];
  for (const name of MANAGED_NAMES) {
    const url = new URL('/api/documents', ORIGIN);
    url.search = new URLSearchParams({ q: name, filter: '0', limit: '20', offset: '0' }).toString();
    let candidate;
    try {
      candidate = exactCandidate(await client.get(url.href), name);
    } catch (error) {
      if (name !== MANAGED_NAMES[1] || error.message !== 'MANAGED_DOCUMENT_NOT_FOUND') throw error;
      report.absentManagedNames.push(name);
      continue;
    }
    report.matchedCandidates.push(candidate);
    if (report.documents.some(document => document.id === candidate.id)) stop('AMBIGUOUS_MANAGED_DOCUMENT');
    client.approveId(candidate.id);
    const document = minimalDocument(await client.get(`${ORIGIN}/api/documents/${candidate.id}`), candidate.name);
    if (document.id !== candidate.id) stop('DOCUMENT_IDENTITY_CHANGED');
    report.documents.push(document);
    if (!document.isPublic) stop('MANAGED_DOCUMENT_NOT_PUBLIC');
  }
  report.status = report.absentManagedNames.length ? 'PUBLIC_MANAGED_WORKSPACE_IDENTIFIED_NOTES_ABSENT' : 'PUBLIC_MANAGED_DOCUMENTS_IDENTIFIED';
  report.provenanceBasis = 'Exact service-managed names authorized by user; unique search matches and direct metadata agree';
  report.serviceConfiguredTargetIndependentlyConfirmed = false;
}

async function main() {
  authorizeDiscovery(process.argv.slice(2));
  const artifact = new URL('./artifacts/managed-discovery.json', import.meta.url);
  await mkdir(new URL('./artifacts/', import.meta.url), { recursive: true });
  const resumingPartial = process.argv.includes('--resume-partial-discovery');
  const resumingVisibility = process.argv.includes('--resume-visibility-schema');
  const resuming = process.argv.includes('--resume-after-http-400') || resumingPartial || resumingVisibility;
  const previous = resuming ? JSON.parse(await readFile(artifact, 'utf8')) : null;
  if (resuming && (previous.status !== 'BLOCKED' || previous.documents.length ||
      (resumingVisibility ? previous.blocker !== 'DOCUMENT_VISIBILITY_UNKNOWN' || previous.requests.length !== 5 || previous.retries !== 2 :
        resumingPartial ? previous.blocker !== 'MANAGED_DOCUMENT_NOT_FOUND' || previous.requests.length !== 3 || previous.retries !== 1 :
        previous.requests.length !== 1 || previous.requests[0].status !== 400 || previous.retries !== 0))) stop('RESUME_NOT_APPROVED');
  const guardName = resumingVisibility ? 'managed-discovery-visibility.guard' : resumingPartial ? 'managed-discovery-partial.guard' : 'managed-discovery-resume.guard';
  const once = await open(resuming ? new URL(`./artifacts/${guardName}`, import.meta.url) : artifact, 'wx');
  await once.close();
  const started = performance.now();
  const report = { startedAt: previous?.startedAt ?? new Date().toISOString(), status: 'IN_PROGRESS', mode: 'READ_ONLY_MANAGED_DOCUMENT_DISCOVERY',
    explicitCurrentKeyAuthorization: true, keyRotationAttested: false, explicitNewPublicManagedScope: true,
    requestCap: REQUEST_CAP, chargedInsideOfficialPlanningReserve: 100,
    parentReportedQuota: { used: 273, limit: 2500, remaining: 2227 },
    requests: previous?.requests ?? [], documents: [], retries: (previous?.retries ?? -1) + 1, officialToolInvocations: 0, modelWrites: 0, rawResponsesSaved: false };
  if (resuming) report.resumedAt = new Date().toISOString();
  const checkpoint = () => writeFile(artifact, `${JSON.stringify(report, null, 2)}\n`);
  await checkpoint();
  try {
    const env = parseEnv(await readFile(new URL('../../.env.local', import.meta.url), 'utf8'));
    if (env.ONSHAPE_BASE_URL && env.ONSHAPE_BASE_URL.replace(/\/$/, '') !== ORIGIN) stop('UNAPPROVED_ORIGIN');
    if (!env.ONSHAPE_ACCESS_KEY || !env.ONSHAPE_SECRET_KEY) stop('CREDENTIALS_MISSING');
    const client = guardedGet({ credentials: { accessKey: env.ONSHAPE_ACCESS_KEY, secretKey: env.ONSHAPE_SECRET_KEY }, ledger: report, checkpoint });
    await discoverManaged(client, report);
  } catch (error) {
    report.status = 'BLOCKED';
    report.blocker = /^[A-Z_]+$/.test(error?.message ?? '') ? error.message : 'DISCOVERY_FAILED';
  }
  report.completedAt = new Date().toISOString();
  report.elapsedMs = (previous?.elapsedMs ?? 0) + Math.round(performance.now() - started);
  report.requestCount = report.requests.length;
  await checkpoint();
  console.log(JSON.stringify({ status: report.status, blocker: report.blocker, requests: report.requestCount,
    documents: report.documents, absentManagedNames: report.absentManagedNames,
    artifact: 'trials/official-mcp/artifacts/managed-discovery.json' }, null, 2));
  if (!report.status.startsWith('PUBLIC_MANAGED_')) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Managed discovery refused; no raw errors or credentials displayed.'); process.exitCode = 1; });
}