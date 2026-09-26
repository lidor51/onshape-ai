import assert from 'node:assert/strict';
import test from 'node:test';
import { ENDPOINT, PROTOCOL_VERSION } from './protocol.mjs';
import { probe, readPayload } from './probe.mjs';

const jsonResponse = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', ...headers },
});

test('live probe requires an explicit flag before network access', async () => {
  await assert.rejects(probe({ fetchImpl: () => assert.fail('network called') }), /Explicit/);
});

test('401 discovers only advertised public metadata; never tools, login or token endpoints', async () => {
  const requests = [];
  const result = await probe({ live: true, fetchImpl: async (url, options) => {
    requests.push({ url, options });
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'manual');
    assert.ok(!Object.keys(options.headers).some(key => /authorization|cookie/i.test(key)));
    if (url === ENDPOINT) return jsonResponse({ error: 'unauthorized', message: 'secret-body' }, 401, {
      'set-cookie': 'secret-cookie',
      'www-authenticate': 'Bearer resource_metadata="https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource"',
    });
    if (url.endsWith('oauth-protected-resource')) return jsonResponse({
      resource: ENDPOINT, authorization_servers: ['https://fs-mcp.labs.onshape.app'], access_token: 'secret-token',
    });
    assert.equal(url, 'https://fs-mcp.labs.onshape.app/.well-known/oauth-authorization-server');
    return jsonResponse({ issuer: 'https://fs-mcp.labs.onshape.app',
      code_challenge_methods_supported: ['S256'], token_endpoint: 'https://fs-mcp.labs.onshape.app/token' });
  } });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.blocker, 'AUTHENTICATION_REQUIRED');
  assert.equal(result.requestCount, 3);
  assert.equal(result.toolsListStatus, 'NOT_ATTEMPTED');
  assert.equal(result.oauth.authorizationServers[0].issuerMatches, true);
  assert.ok(!JSON.stringify(result).includes('secret-'));
});

test('successful session orders initialize, notification, paginated list without tool execution', async () => {
  const methods = [];
  const result = await probe({ live: true, fetchImpl: async (url, options) => {
    assert.equal(url, ENDPOINT);
    const message = JSON.parse(options.body);
    methods.push(message.method);
    if (message.method === 'initialize') return jsonResponse({ jsonrpc: '2.0', id: 1, result: {
      protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {} },
      serverInfo: { name: 'fixture', version: '0' },
    } }, 200, { 'mcp-session-id': 'secret-session' });
    assert.equal(options.headers['Mcp-Session-Id'], 'secret-session');
    assert.equal(options.headers['MCP-Protocol-Version'], PROTOCOL_VERSION);
    if (message.method === 'notifications/initialized') return new Response(null, { status: 202 });
    assert.equal(message.method, 'tools/list');
    const firstPage = message.id === 2;
    if (!firstPage) assert.equal(message.params.cursor, 'secret-cursor');
    return jsonResponse({ jsonrpc: '2.0', id: message.id, result: {
      tools: [{ name: firstPage ? 'fixture_read' : 'fixture_write', inputSchema: {
        type: 'object', properties: { source: { type: 'string', default: 'secret-default' } }, required: ['source'],
      } }], ...(firstPage ? { nextCursor: 'secret-cursor' } : {}),
    } });
  } });
  assert.deepEqual(methods, ['initialize', 'notifications/initialized', 'tools/list', 'tools/list']);
  assert.equal(result.tools.length, 2);
  assert.equal(result.cadCreated, false);
  assert.equal(result.authenticated, false);
  assert.ok(!JSON.stringify(result).includes('secret-'));
});

test('SSE reader handles split frames and ignores notifications without saving event IDs', async () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({ start(controller) {
    for (const chunk of [': keepalive\r\n\r\ndata: {"jsonrpc":"2.0","method":"notifications/message"}\r\n\r',
      '\nid: secret-event\r\ndata: {"jsonrpc":"2.0",\r\ndata: "id":1,"result":{}}\r\n\r\n']) {
      controller.enqueue(encoder.encode(chunk));
    }
    controller.close();
  } });
  const result = await readPayload(new Response(stream, { headers: { 'content-type': 'text/event-stream' } }), 1);
  assert.deepEqual(result.body, { jsonrpc: '2.0', id: 1, result: {} });
});

test('redirects and unsupported versions stop without follow-up requests', async () => {
  for (const response of [new Response(null, { status: 302, headers: { location: 'https://cad.onshape.com/signin?secret' } }),
    jsonResponse({ jsonrpc: '2.0', id: 1, result: { protocolVersion: '2099-01-01' } })]) {
    const result = await probe({ live: true, fetchImpl: async () => response });
    assert.equal(result.status, 'BLOCKED');
    assert.equal(result.requestCount, 1);
    assert.ok(!JSON.stringify(result).includes('?secret'));
  }
});

test('network exception text is not persisted', async () => {
  const result = await probe({ live: true, fetchImpl: async () => { throw new Error('secret-token'); } });
  assert.equal(result.requests[0].failure, 'network-or-protocol-error');
  assert.ok(!JSON.stringify(result).includes('secret-token'));
});