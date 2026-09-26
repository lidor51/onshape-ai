import { createHmac, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

export class PocError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function requireCondition(condition, code) {
  if (!condition) throw new PocError(code);
}

export function stackOrigin(input = 'https://cad.onshape.com') {
  let url;
  try { url = new URL(input); } catch { throw new PocError('INVALID_STACK'); }
  requireCondition(url.protocol === 'https:' && /^[a-z0-9-]+\.onshape\.com$/.test(url.hostname)
    && !url.username && !url.password && !url.port && url.pathname === '/' && !url.search && !url.hash, 'INVALID_STACK');
  return url.origin;
}

export function parseArguments(args) {
  const result = { live: false, confirmed: false, publicDocument: false, stack: 'https://cad.onshape.com' };
  const seen = new Set();
  for (const argument of args) {
    const key = argument.split('=')[0];
    requireCondition(!seen.has(key), 'DUPLICATE_ARGUMENT');
    seen.add(key);
    if (argument === '--live') result.live = true;
    else if (argument === '--confirm-new-private-document') result.confirmed = true;
    else if (argument === '--confirm-new-public-document') { result.confirmed = true; result.publicDocument = true; }
    else if (/^--resume-owned=[A-Za-z0-9-]+$/.test(argument)) result.resume = argument.slice(15);
    else if (argument.startsWith('--stack=')) result.stack = stackOrigin(argument.slice(8));
    else throw new PocError('UNKNOWN_ARGUMENT');
  }
  requireCondition(!(seen.has('--confirm-new-private-document') && seen.has('--confirm-new-public-document')), 'CONFLICTING_VISIBILITY_CONFIRMATION');
  requireCondition(result.live === result.confirmed, 'LIVE_CONFIRMATION_REQUIRED');
  requireCondition(!result.resume || (result.live && result.publicDocument), 'PUBLIC_RESUME_REQUIRES_CONFIRMATION');
  requireCondition(result.live || !seen.has('--stack'), 'STACK_REQUIRES_LIVE');
  return result;
}

export async function loadCredentials(live, reader = readFile, target = 'https://cad.onshape.com', environment = process.env) {
  requireCondition(live === true, 'LIVE_REQUIRED_FOR_CREDENTIALS');
  let values;
  try { values = parseEnv(await reader(new URL('../../.env.local', import.meta.url), 'utf8')); }
  catch { throw new PocError('CREDENTIAL_FILE_UNAVAILABLE_OR_INVALID'); }
  const origin = stackOrigin(target);
  for (const configured of [values.ONSHAPE_BASE_URL, environment.ONSHAPE_BASE_URL]) {
    if (configured !== undefined) requireCondition(stackOrigin(configured.trim()) === origin, 'CONFIGURED_STACK_MISMATCH');
  }
  const accessKey = (values.ONSHAPE_ACCESS_KEY ?? values.ONSHAPE_API_ACCESS_KEY)?.trim();
  const secretKey = (values.ONSHAPE_SECRET_KEY ?? values.ONSHAPE_API_SECRET_KEY)?.trim();
  requireCondition(typeof accessKey === 'string' && /^[A-Za-z0-9_-]+$/.test(accessKey)
    && typeof secretKey === 'string' && /^[\x21-\x7e]{1,4096}$/.test(secretKey), 'CREDENTIAL_KEYS_MISSING_OR_INVALID');
  return { accessKey, secretKey };
}

export function signRequest({ method, url, nonce, date, contentType, accessKey, secretKey }) {
  const parsed = new URL(url);
  const canonical = [method, nonce, date, contentType, parsed.pathname, parsed.search.slice(1), ''].join('\n').toLowerCase();
  const digest = createHmac('sha256', secretKey).update(canonical).digest('base64');
  return `On ${accessKey}:HmacSHA256:${digest}`;
}

export function createClient({ live, stack, credentials, fetchImpl = fetch, onEvent = () => {} }) {
  requireCondition(live === true, 'LIVE_REQUIRED');
  const origin = stackOrigin(stack);
  let requests = 0;
  return {
    origin,
    async request(method, path, body, operation, binary = false) {
      requireCondition(['GET', 'POST'].includes(method), 'METHOD_NOT_ALLOWED');
      requireCondition(typeof path === 'string' && /^\/api\/v\d+\//.test(path)
        && !/[\\#]/.test(path) && !path.includes('..'), 'INVALID_API_PATH');
      const url = new URL(path, origin);
      requireCondition(url.origin === origin && !url.username && !url.password, 'CROSS_HOST_BLOCKED');
      requireCondition(typeof operation === 'string' && /^[a-zA-Z0-9_.-]+$/.test(operation), 'INVALID_OPERATION_LABEL');
      requireCondition(++requests <= 300, 'REQUEST_BUDGET_EXCEEDED');
      const date = new Date().toUTCString();
      const nonce = randomBytes(16).toString('hex');
      const contentType = 'application/json';
      const headers = {
        Date: date, 'On-Nonce': nonce, 'Content-Type': contentType,
        Accept: binary ? 'application/octet-stream' : 'application/json',
        Authorization: signRequest({ method, url, nonce, date, contentType, ...credentials }),
      };
      const started = performance.now();
      const event = { request: requests, operation, method, status: null, retry: false };
      try {
        const response = await fetchImpl(url, {
          method, headers, body: body === undefined ? undefined : JSON.stringify(body),
          redirect: 'manual', signal: AbortSignal.timeout(60000),
        });
        event.status = response.status;
        if (!response.ok && !(response.status >= 300 && response.status < 400)) {
          let detail;
          try { detail = await response.json(); } catch {}
          const message = detail?.message ?? detail?.errorMessage;
          if (typeof message === 'string') {
            let sanitized = message;
            for (const secret of Object.values(credentials)) sanitized = sanitized.split(secret).join('[REDACTED]');
            sanitized = sanitized.replace(/https?:\/\/\S+/gi, '[URL_REDACTED]')
              .replace(/\bOn\s+\S+:HmacSHA256:\S+/gi, '[AUTH_REDACTED]')
              .replace(/\bBearer\s+\S+/gi, '[AUTH_REDACTED]');
            if (!/authorization|on-nonce|cookie|signature/i.test(sanitized)) event.reason = sanitized.replace(/[\r\n\t]/g, ' ').slice(0, 600);
          }
        }
        if (response.status >= 300 && response.status < 400) throw new PocError('REDIRECT_BLOCKED');
        if (response.status === 429) throw new PocError('RATE_LIMITED_NO_AUTOMATIC_RETRY');
        requireCondition(response.ok, `HTTP_${response.status}`);
        if (binary) return Buffer.from(await response.arrayBuffer());
        try { return await response.json(); } catch { throw new PocError('INVALID_JSON_RESPONSE'); }
      } catch (error) {
        event.error = error instanceof PocError ? error.code : 'NETWORK_OR_TIMEOUT';
        throw new PocError(event.error);
      } finally {
        event.elapsedMs = Math.round(performance.now() - started);
        onEvent(event);
      }
    },
  };
}