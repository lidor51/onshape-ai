import { createHmac, randomBytes } from 'node:crypto';
import { requireThat, sha256 } from './ledger.mjs';

export const ORIGIN = 'https://cad.onshape.com';

export function signRequest({ method, url, nonce, date, contentType, accessKey, secretKey }) {
  const canonical = [method, nonce, date, contentType, url.pathname, url.search.slice(1), ''].join('\n').toLowerCase();
  return `On ${accessKey}:HmacSHA256:${createHmac('sha256', secretKey).update(canonical).digest('base64')}`;
}

export function createTransport({ ledger, credentials, fetchImpl }) {
  requireThat(ledger.data.binding.origin === ORIGIN, 'ORIGIN_NOT_AUTHORIZED');
  requireThat(typeof fetchImpl === 'function', 'EXPLICIT_SENDER_REQUIRED');
  return async function send({ key, phase, operation, method, path, body, contentType = 'application/json',
    binary = false, createsDocument = false, accept = binary ? 'application/octet-stream' : 'application/json' }) {
    requireThat(['application/json', 'application/octet-stream', 'model/gltf+json'].includes(accept), 'ACCEPT_SCOPE');
    requireThat(['GET', 'POST'].includes(method) && /^\/api\/v17\/[a-zA-Z]/.test(path) &&
      !/[\\#]/.test(path) && !/\.\.|%(?![a-f0-9]{2})|%2e|%5c/i.test(path) &&
      !/%2f/i.test(path.split('?')[0]), 'REQUEST_SCOPE');
    const url = new URL(path, ORIGIN);
    requireThat(url.origin === ORIGIN && !url.username && !url.password, 'ORIGIN_NOT_AUTHORIZED');
    const wireBody = body === undefined ? undefined : Buffer.isBuffer(body) ? body : JSON.stringify(body);
    const format = accept === 'model/gltf+json' ? `${accept}\n` : '';
    const requestHash = sha256(Buffer.concat([Buffer.from(`${method}\n${path}\n${contentType}\n${format}`), Buffer.from(wireBody ?? '')]));
    const completed = ledger.completed(key);
    if (completed) {
      requireThat(completed.requestHash === requestHash && !binary, 'RESUME_REQUEST_CHANGED');
      return structuredClone(completed.result);
    }
    const date = new Date().toUTCString();
    const nonce = randomBytes(16).toString('hex');
    const headers = { Date: date, 'On-Nonce': nonce, 'Content-Type': contentType,
      Accept: accept,
      Authorization: signRequest({ method, url, nonce, date, contentType, ...credentials }) };
    const sequence = ledger.begin({ key, phase, operation, method, requestHash, createsDocument });
    const started = performance.now();
    let httpStatus;
    let result;
    let failure;
    let errorDetail;
    try {
      const response = await fetchImpl(url.href, { method, headers, body: wireBody,
        redirect: 'manual', signal: AbortSignal.timeout(60000) });
      httpStatus = response.status;
      if (!response.ok) {
        try {
          const detail = await response.json();
          let message = detail.message ?? detail.errorMessage;
          if (typeof message === 'string') {
            for (const secret of [credentials.accessKey, credentials.secretKey]) message = message.split(secret).join('[REDACTED]');
            if (!/authorization|cookie|on-nonce|signature|bearer/i.test(message))
              errorDetail = message.replace(/https?:\/\/\S+/gi, '[URL]').replace(/[\r\n\t]/g, ' ').slice(0, 800);
          }
        } catch {}
        throw new Error(response.status >= 300 && response.status < 400 ? 'REDIRECT_REFUSED' : `HTTP_${response.status}`);
      }
      result = binary ? Buffer.from(await response.arrayBuffer()) : await response.json();
      if (!binary) {
        const text = JSON.stringify(result);
        requireThat(![credentials.accessKey, credentials.secretKey].some(secret => text.includes(secret)) &&
          !/"(?:authorization|cookie|set-cookie|on-nonce)"\s*:/i.test(text), 'SECRET_BEARING_RESPONSE');
      }
    } catch (error) {
      result = undefined;
      failure = /^(HTTP_\d{3}|REDIRECT_REFUSED|SECRET_BEARING_RESPONSE)$/.test(error.message) ? error.message : 'UNKNOWN_OUTCOME';
    }
    ledger.finish(sequence, { httpStatus, elapsedMs: performance.now() - started,
      result: binary ? undefined : result, error: failure, errorDetail });
    requireThat(!failure, failure);
    return result;
  };
}