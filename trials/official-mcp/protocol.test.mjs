import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ENDPOINT, PROTOCOL_VERSION, initializeRequest, requestOptions,
  publicUrl, safeHeaders, metadataSummary, authorizationMetadataUrl,
} from './protocol.mjs';

test('unsigned initialize follows the MCP 2025-06-18 Streamable HTTP envelope', () => {
  const message = initializeRequest();
  assert.deepEqual(message, {
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: {
      protocolVersion: PROTOCOL_VERSION, capabilities: {},
      clientInfo: { name: 'official-onshape-independent-probe', version: '1.0.0' },
    },
  });
  const options = requestOptions(message);
  assert.equal(options.method, 'POST');
  assert.deepEqual(Object.keys(options.headers).sort(), ['Accept', 'Content-Type']);
  assert.equal(options.headers.Accept, 'application/json, text/event-stream');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.redirect, 'manual');
  assert.deepEqual(JSON.parse(options.body), message);
  assert.equal(ENDPOINT, 'https://fs-mcp.labs.onshape.app/mcp');
});

test('session and negotiated version stay on subsequent protocol requests', () => {
  const options = requestOptions({ jsonrpc: '2.0', method: 'notifications/initialized' }, 'test-session', PROTOCOL_VERSION);
  assert.equal(options.headers['Mcp-Session-Id'], 'test-session');
  assert.equal(options.headers['MCP-Protocol-Version'], PROTOCOL_VERSION);
});

test('saved headers omit cookies, sessions, challenge descriptions and redirect values', () => {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'set-cookie': 'secret-cookie', 'mcp-session-id': 'secret-session',
    location: 'https://cad.onshape.com/signin?token=secret-redirect',
    'www-authenticate': 'Bearer error="invalid_token", error_description="secret-description", resource_metadata="https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource"',
    'x-debug': 'secret-debug',
  });
  const summary = safeHeaders(headers);
  assert.equal(summary.authentication.scheme, 'bearer');
  assert.equal(summary.authentication.error, 'invalid_token');
  assert.equal(summary.authentication.resourceMetadata, 'https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource');
  assert.equal(summary.setCookiePresent, true);
  assert.ok(!JSON.stringify(summary).includes('secret-'));
});

test('metadata discovery rejects credentials, queries, redirects and unapproved hosts', () => {
  for (const value of ['http://localhost/', 'https://evil.example/', 'https://cad.onshape.com/?token=secret',
    'https://user:secret@cad.onshape.com/', 'https://cad.onshape.com/#secret', 'https://cad.onshape.com:8443/']) {
    assert.equal(publicUrl(value), null);
  }
  assert.equal(authorizationMetadataUrl('https://fs-mcp.labs.onshape.app/oauth'),
    'https://fs-mcp.labs.onshape.app/.well-known/oauth-authorization-server/oauth');
  const summary = metadataSummary({
    issuer: 'https://fs-mcp.labs.onshape.app', access_token: 'secret-token',
    authorization_servers: ['https://fs-mcp.labs.onshape.app', 'http://localhost/'],
    code_challenge_methods_supported: ['S256', 'secret-field'],
  });
  assert.deepEqual(summary.code_challenge_methods_supported, ['S256']);
  assert.deepEqual(summary.authorization_servers, ['https://fs-mcp.labs.onshape.app/']);
  assert.ok(!JSON.stringify(summary).includes('secret-'));
});