export const ENDPOINT = 'https://fs-mcp.labs.onshape.app/mcp';
export const PROTOCOL_VERSION = '2025-06-18';

export function initializeRequest() {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'official-onshape-independent-probe', version: '1.0.0' },
    },
  };
}

export function requestOptions(message, sessionId, protocolVersion) {
  const headers = {
    Accept: 'application/json, text/event-stream',
    'Content-Type': 'application/json',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  if (protocolVersion) headers['MCP-Protocol-Version'] = protocolVersion;
  return {
    method: 'POST', headers, body: JSON.stringify(message),
    redirect: 'manual', credentials: 'omit', signal: AbortSignal.timeout(20_000),
  };
}

export function publicUrl(value) {
  try {
    const url = new URL(value);
    const hosts = ['fs-mcp.labs.onshape.app', 'cad.onshape.com', 'oauth.onshape.com'];
    if (url.protocol !== 'https:' || !hosts.includes(url.hostname) ||
        url.username || url.password || url.search || url.hash || url.port) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function authChallenge(value) {
  if (!value) return { present: false };
  const scheme = /^\s*(Bearer|Basic)\b/i.exec(value)?.[1]?.toLowerCase() ?? 'other';
  const resource = /\bresource_metadata\s*=\s*"([^"\\]*)"/i.exec(value)?.[1];
  const error = /\berror\s*=\s*"(invalid_token|insufficient_scope|invalid_request)"/i.exec(value)?.[1];
  return {
    present: true, scheme,
    ...(resource ? { resourceMetadata: publicUrl(resource), resourceMetadataRejected: !publicUrl(resource) } : {}),
    ...(error ? { error } : {}),
  };
}

export function safeHeaders(headers) {
  const contentType = headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  return {
    contentType: ['application/json', 'text/event-stream', 'text/html', 'text/plain'].includes(contentType)
      ? contentType : 'other-or-absent',
    authentication: authChallenge(headers.get('www-authenticate')),
    sessionHeaderPresent: headers.has('mcp-session-id'),
    setCookiePresent: headers.has('set-cookie'),
    redirectPresent: headers.has('location'),
  };
}

export function authorizationMetadataUrl(issuer) {
  const safe = publicUrl(issuer);
  if (!safe) return null;
  const url = new URL(safe);
  return `${url.origin}/.well-known/oauth-authorization-server${url.pathname === '/' ? '' : url.pathname}`;
}

export function metadataSummary(body) {
  const result = {};
  for (const key of ['resource', 'issuer', 'authorization_endpoint', 'token_endpoint', 'registration_endpoint']) {
    if (typeof body?.[key] === 'string') result[key] = publicUrl(body[key]);
  }
  if (Array.isArray(body?.authorization_servers)) {
    result.authorization_servers = body.authorization_servers.map(publicUrl).filter(Boolean);
  }
  const knownValues = {
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
    code_challenge_methods_supported: ['S256', 'plain'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_basic', 'client_secret_post', 'private_key_jwt'],
    bearer_methods_supported: ['header', 'body', 'query'],
  };
  for (const [key, allowed] of Object.entries(knownValues)) {
    if (Array.isArray(body?.[key])) result[key] = body[key].filter(value => allowed.includes(value));
  }
  return result;
}