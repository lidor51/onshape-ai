import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import {
  ENDPOINT, PROTOCOL_VERSION, initializeRequest, requestOptions,
  publicUrl, safeHeaders, metadataSummary, authorizationMetadataUrl,
} from './protocol.mjs';

export async function readPayload(response, expectedId) {
  if (!response.body) return { body: null, bytesRead: 0 };
  const contentType = response.headers.get('content-type') ?? '';
  if (!/application\/json|text\/event-stream/i.test(contentType)) {
    await response.body.cancel();
    return { body: null, bytesRead: 0, nonProtocolBodyDiscarded: true };
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytesRead = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytesRead += chunk.value.byteLength;
      if (bytesRead > 1_048_576) throw new Error('response-limit');
      text += decoder.decode(chunk.value, { stream: true });
      if (contentType.includes('text/event-stream')) {
        let boundary;
        while ((boundary = /\r?\n\r?\n/.exec(text))) {
          const event = text.slice(0, boundary.index);
          text = text.slice(boundary.index + boundary[0].length);
          const data = event.split(/\r?\n/).filter(line => line.startsWith('data:'))
            .map(line => line.slice(5).replace(/^ /, '')).join('\n');
          if (!data) continue;
          const message = JSON.parse(data);
          if (message.jsonrpc === '2.0' && message.id === expectedId &&
              ('result' in message || 'error' in message)) return { body: message, bytesRead };
        }
      }
    }
    text += decoder.decode();
    return { body: contentType.includes('application/json') && text ? JSON.parse(text) : null, bytesRead };
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

function bodySummary(body) {
  return {
    jsonRpc: body?.jsonrpc === '2.0',
    resultPresent: Boolean(body && Object.hasOwn(body, 'result')),
    errorPresent: Boolean(body && Object.hasOwn(body, 'error')),
    ...(Number.isInteger(body?.error?.code) ? { errorCode: body.error.code } : {}),
    ...(['unauthorized', 'invalid_token', 'invalid_request', 'insufficient_scope'].includes(body?.error)
      ? { oauthError: body.error } : {}),
  };
}

export function contractSummary(tool) {
  const identifier = value => typeof value === 'string' && /^[A-Za-z_][A-Za-z0-9_.-]{0,127}$/.test(value);
  const schema = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result = {};
    if (['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'].includes(value.type)) result.type = value.type;
    if (value.properties && typeof value.properties === 'object') {
      result.properties = Object.fromEntries(Object.entries(value.properties)
        .filter(([key]) => identifier(key)).map(([key, nested]) => [key, schema(nested)]));
    }
    if (Array.isArray(value.required)) result.required = value.required.filter(identifier);
    if (value.items) result.items = schema(value.items);
    if (typeof value.additionalProperties === 'boolean') result.additionalProperties = value.additionalProperties;
    for (const key of ['oneOf', 'anyOf', 'allOf']) {
      if (Array.isArray(value[key])) result[key] = value[key].map(schema);
    }
    return result;
  };
  return {
    name: identifier(tool?.name) ? tool.name : '[omitted]',
    inputSchemaStructuralSubset: schema(tool?.inputSchema),
    contractComplete: false,
  };
}

export async function probe({ live = false, fetchImpl = fetch } = {}) {
  if (!live) throw new Error('Explicit --live-unsigned authorization required');
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const report = {
    startedAt, endpoint: ENDPOINT, protocolVersionRequested: PROTOCOL_VERSION,
    mode: 'credential-free-discovery', status: 'UNVERIFIED',
    requests: [], retries: 0, tools: [], toolsListStatus: 'NOT_ATTEMPTED',
    cadCreated: false, authenticated: false,
  };
  const finish = (status, blocker) => ({
    ...report, status, blocker, elapsedMs: Math.round(performance.now() - started),
    requestCount: report.requests.length,
  });
  async function request(url, options, purpose, expectedId) {
    if (report.requests.length >= 8) throw new Error('request-limit');
    if (!publicUrl(url)) throw new Error('unapproved-url');
    const entry = { method: options.method, url, purpose, startedAt: new Date().toISOString() };
    report.requests.push(entry);
    const requestStarted = performance.now();
    try {
      const response = await fetchImpl(url, options);
      entry.status = response.status;
      entry.headers = safeHeaders(response.headers);
      const payload = await readPayload(response, expectedId);
      entry.body = { ...bodySummary(payload.body), bytesRead: payload.bytesRead,
        nonProtocolBodyDiscarded: payload.nonProtocolBodyDiscarded ?? false };
      return { response, body: payload.body };
    } catch (error) {
      entry.failure = error?.name === 'TimeoutError' ? 'timeout' : 'network-or-protocol-error';
      return { response: null, body: null };
    } finally {
      entry.elapsedMs = Math.round(performance.now() - requestStarted);
    }
  }
  const getMetadata = (url, purpose) => request(url, {
    method: 'GET', headers: { Accept: 'application/json' },
    redirect: 'manual', credentials: 'omit', signal: AbortSignal.timeout(20_000),
  }, purpose);
  async function discoverAuth(response) {
    const challenge = safeHeaders(response.headers).authentication;
    const candidates = challenge.resourceMetadata ? [challenge.resourceMetadata] : [
      'https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource/mcp',
      'https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource',
    ];
    report.oauth = { protectedResource: null, authorizationServers: [] };
    for (const url of candidates) {
      const result = await getMetadata(url, 'protected-resource-metadata');
      const summary = metadataSummary(result.body);
      if (result.response?.status !== 200 || !summary.resource) continue;
      report.oauth.protectedResource = { url, metadata: summary,
        resourceMatchesEndpoint: summary.resource === ENDPOINT };
      if (summary.resource !== ENDPOINT) break;
      for (const issuer of (summary.authorization_servers ?? []).slice(0, 2)) {
        const metadataUrl = authorizationMetadataUrl(issuer);
        if (!metadataUrl) continue;
        const authorization = await getMetadata(metadataUrl, 'authorization-server-metadata');
        const metadata = metadataSummary(authorization.body);
        report.oauth.authorizationServers.push({
          url: metadataUrl, status: authorization.response?.status ?? null, metadata,
          issuerMatches: metadata.issuer === issuer,
        });
      }
      break;
    }
  }
  const initialized = await request(ENDPOINT, requestOptions(initializeRequest()), 'initialize', 1);
  if ([401, 403].includes(initialized.response?.status)) {
    await discoverAuth(initialized.response);
    return finish('BLOCKED', 'AUTHENTICATION_REQUIRED');
  }
  if (!initialized.response?.ok || initialized.body?.jsonrpc !== '2.0' ||
      initialized.body?.id !== 1 || !initialized.body?.result || initialized.body?.error) {
    return finish('BLOCKED', 'INITIALIZE_NOT_ACCEPTED');
  }
  const result = initialized.body.result;
  if (result.protocolVersion !== PROTOCOL_VERSION) return finish('BLOCKED', 'UNSUPPORTED_NEGOTIATED_VERSION');
  report.protocolVersionNegotiated = result.protocolVersion;
  report.toolsCapabilityAdvertised = Boolean(result.capabilities?.tools);
  const sessionId = initialized.response.headers.get('mcp-session-id');
  const notification = await request(ENDPOINT, requestOptions({
    jsonrpc: '2.0', method: 'notifications/initialized',
  }, sessionId, result.protocolVersion), 'initialized-notification');
  if (notification.response?.status !== 202) return finish('BLOCKED', 'INITIALIZED_NOTIFICATION_NOT_ACCEPTED');
  if (!report.toolsCapabilityAdvertised) return finish('DISCOVERED', 'NO_TOOLS_CAPABILITY');
  let cursor;
  let requestId = 2;
  do {
    const listing = await request(ENDPOINT, requestOptions({
      jsonrpc: '2.0', id: requestId, method: 'tools/list', params: cursor ? { cursor } : {},
    }, sessionId, result.protocolVersion), 'tools/list', requestId);
    if ([401, 403].includes(listing.response?.status)) {
      report.toolsListStatus = 'AUTHENTICATION_REQUIRED';
      await discoverAuth(listing.response);
      return finish('BLOCKED', 'AUTHENTICATION_REQUIRED');
    }
    if (!listing.response?.ok || listing.body?.jsonrpc !== '2.0' || listing.body?.id !== requestId ||
        listing.body?.error || !Array.isArray(listing.body?.result?.tools)) {
      report.toolsListStatus = 'FAILED';
      return finish('BLOCKED', 'TOOLS_LIST_NOT_ACCEPTED');
    }
    report.tools.push(...listing.body.result.tools.map(contractSummary));
    cursor = listing.body.result.nextCursor;
    requestId++;
  } while (cursor && report.requests.length < 5);
  report.toolsListStatus = cursor ? 'PARTIAL' : 'DISCOVERED_STRUCTURAL_SUBSETS';
  return finish('DISCOVERED', 'NO_AUTHENTICATED_CAD_TOOL_EXECUTION');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3 || process.argv[2] !== '--live-unsigned') {
    console.error('Usage: node trials/official-mcp/probe.mjs --live-unsigned');
    process.exitCode = 1;
  } else {
    const result = await probe({ live: true });
    const directory = new URL('./artifacts/', import.meta.url);
    await mkdir(directory, { recursive: true });
    const filename = `probe-${result.startedAt.replaceAll(':', '-').replaceAll('.', '-')}.json`;
    const serialized = `${JSON.stringify(result, null, 2)}\n`;
    await writeFile(new URL(filename, directory), serialized);
    await writeFile(new URL('probe-latest.json', directory), serialized);
    console.log(JSON.stringify({ status: result.status, blocker: result.blocker,
      requests: result.requestCount, artifact: `trials/official-mcp/artifacts/${filename}` }, null, 2));
  }
}