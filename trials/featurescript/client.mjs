import { createHmac, randomBytes } from 'node:crypto';

export function trustedOrigin(value = 'https://cad.onshape.com') {
  const url = new URL(value);
  if (url.origin !== 'https://cad.onshape.com' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Only the production https://cad.onshape.com origin is allowed');
  }
  return url.origin;
}

export function signRequest({ method, url, nonce, date, contentType = 'application/json', accessKey, secretKey }) {
  const target = new URL(url);
  trustedOrigin(target.origin);
  if (target.username || target.password || target.hash) throw new Error('Unsafe signed URL');
  const canonical = [method, nonce, date, contentType, target.pathname, target.search.slice(1), ''].join('\n').toLowerCase();
  const digest = createHmac('sha256', secretKey).update(canonical).digest('base64');
  return { canonical, authorization: `On ${accessKey}:HmacSHA256:${digest}` };
}

export function sanitizer(secrets) {
  const variants = secrets.filter(Boolean).flatMap(secret => [secret, encodeURIComponent(secret)]);
  return function sanitize(value) {
    if (typeof value === 'string') {
      for (const secret of variants) value = value.split(secret).join('[REDACTED]');
      return value.replace(/On\s+[^\s:]+:HmacSHA256:[A-Za-z0-9+/=]+/g, '[REDACTED AUTH]');
    }
    if (Array.isArray(value)) return value.map(sanitize);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) =>
      [key, /authorization|secret|access.?key|token|cookie/i.test(key) ? '[REDACTED]' : sanitize(item)]));
    return value;
  };
}

export class OnshapeClient {
  #accessKey;
  #secretKey;
  #origin;
  #fetch;
  #owned;
  #createAttempted = false;
  #translations = new Set();
  #externalData = new Set();
  #requestCount = 0;

  constructor({ accessKey, secretKey, origin, fetchImpl = fetch, observe = async () => {} }) {
    this.#origin = trustedOrigin(origin);
    if (!accessKey || !secretKey) throw new Error('Missing Onshape API keys');
    this.#accessKey = accessKey;
    this.#secretKey = secretKey;
    this.#fetch = fetchImpl;
    this.observe = observe;
    this.sanitize = sanitizer([accessKey, secretKey]);
  }

  get requestCount() { return this.#requestCount; }

  async createPrivateDocument(name) {
    return this.#createDocument(name, false);
  }

  async createPublicDocument(name, confirmPublic = false) {
    if (confirmPublic !== true) throw new Error('Public creation requires explicit confirmation');
    return this.#createDocument(name, true);
  }

  async resumePublicDocument(creation, confirmPublic = false) {
    if (confirmPublic !== true || this.#owned || this.#createAttempted) throw new Error('Resume requires explicit public confirmation and a fresh client');
    const original = creation?.response;
    if (creation?.method !== 'POST' || creation.path !== '/documents' || creation.status !== 200 ||
        creation.requestBody?.isPublic !== true || original?.public !== true ||
        creation.requestBody.name !== original.name || !original.name?.startsWith('FeatureScript intake PoC ') ||
        !/^[a-f0-9]{24}$/.test(original.id ?? '') || !/^[a-f0-9]{24}$/.test(original.defaultWorkspace?.id ?? '') ||
        !original.createdBy?.id || !original.createdAt) throw new Error('Missing original public trial creation provenance');
    this.#createAttempted = true;
    const current = await this.#send('GET', `/documents/${original.id}`);
    if (current.id !== original.id || current.public !== true || current.name !== original.name || current.trash === true ||
        current.defaultWorkspace?.id !== original.defaultWorkspace.id || current.createdBy?.id !== original.createdBy.id ||
        current.createdAt !== original.createdAt) throw new Error('Server public document provenance changed; refusing resume');
    this.#owned = { did: current.id, wid: current.defaultWorkspace.id };
    return this.#owned;
  }

  resumeTranslation(creation) {
    const result = creation?.response;
    const { did, wid } = this.#owned ?? {};
    if (!did || creation?.method !== 'POST' || creation.status !== 200 ||
        !new RegExp(`^/partstudios/d/${did}/w/${wid}/e/[a-f0-9]{24}/export/step$`).test(creation.path ?? '') ||
        creation.requestBody?.storeInDocument !== false || result?.documentId !== did || result.workspaceId !== wid ||
        result.resultDocumentId !== did || !/^[a-f0-9]{24}$/.test(result.id ?? '') ||
        !creation.path.includes(`/e/${result.requestElementId}/`)) throw new Error('Missing owned translation creation provenance');
    this.#translations.add(result.id);
    return result;
  }

  async #createDocument(name, isPublic) {
    if (this.#createAttempted) throw new Error('Only one new-document attempt is permitted per run');
    this.#createAttempted = true;
    const document = await this.#send('POST', '/documents', { name, isPublic });
    if (document.public !== isPublic || !/^[a-f0-9]{24}$/.test(document.id ?? '') || !/^[a-f0-9]{24}$/.test(document.defaultWorkspace?.id ?? '')) {
      throw new Error('Requested document visibility and identity were not positively confirmed; stopping without cleanup or fallback');
    }
    this.#owned = { did: document.id, wid: document.defaultWorkspace.id };
    return this.#owned;
  }

  async request(method, path, body, binary = false) {
    if (!this.#owned) throw new Error('No private document created in this run');
    if (!['GET', 'POST'].includes(method)) throw new Error('Only approved GET and POST operations are permitted');
    const { did, wid } = this.#owned;
    const parsed = new URL(`${this.#origin}/api/v17${path}`);
    const normalized = parsed.pathname.replace('/api/v17', '');
    if (!path.startsWith('/') || normalized !== path.split('?')[0] || /%|\\/.test(path)) throw new Error('Unsafe API path');
    const documentScoped = normalized.includes(`/d/${did}/`);
    const translation = /^\/translations\/([a-f0-9]{24})$/.exec(normalized);
    if (!documentScoped && !(method === 'GET' && translation && this.#translations.has(translation[1]))) throw new Error('Request is outside this run document');
    if (/\/w\//.test(normalized) && !normalized.includes(`/w/${wid}`)) throw new Error('Workspace is outside this run');
    const external = new RegExp(`^/documents/d/${did}/externaldata/([A-Za-z0-9_-]+)$`).exec(normalized);
    if (external && !this.#externalData.has(external[1])) throw new Error('Unregistered export result');
    const allowedPost = [
      new RegExp(`^/(featurestudios|partstudios)/d/${did}/w/${wid}$`),
      new RegExp(`^/featurestudios/d/${did}/w/${wid}/e/[a-f0-9]{24}$`),
      new RegExp(`^/documents/d/${did}/versions$`),
      new RegExp(`^/partstudios/d/${did}/w/${wid}/e/[a-f0-9]{24}/(features|features/featureid/[A-Za-z0-9_-]+|featurescript|export/step)$`),
    ];
    if (method === 'POST' && !allowedPost.some(pattern => pattern.test(normalized))) throw new Error('Unapproved mutation endpoint');
    if (normalized.endsWith('/versions') && (body?.publishVersion !== false || body.workspaceId !== wid)) throw new Error('Version must stay unpublished in this run workspace');
    if (normalized.endsWith('/export/step') && body?.storeInDocument !== false) throw new Error('Only external export is allowed');
    const result = await this.#send(method, path, body, binary);
    if (method === 'POST' && normalized.endsWith('/export/step') && result.id) this.#translations.add(result.id);
    if (normalized.endsWith('/export/step') || translation) {
      if (result.documentId && result.documentId !== did) throw new Error('Translation belongs to a different document');
      if (result.resultDocumentId && result.resultDocumentId !== did) throw new Error('Export belongs to a different document');
      for (const foreignId of result.resultExternalDataIds ?? []) this.#externalData.add(foreignId);
    }
    return result;
  }

  async #send(method, path, body, binary = false) {
    if (++this.#requestCount > 60) throw new Error('Run request budget exhausted');
    const url = `${this.#origin}/api/v17${path}`;
    const date = new Date().toUTCString();
    const nonce = randomBytes(18).toString('hex');
    const { authorization } = signRequest({ method, url, nonce, date, accessKey: this.#accessKey, secretKey: this.#secretKey });
    const started = performance.now();
    let response;
    try {
      response = await this.#fetch(url, {
        method, redirect: 'manual', signal: AbortSignal.timeout(60000),
        headers: { 'Content-Type': 'application/json', Accept: binary ? 'application/octet-stream' : 'application/json', Date: date, 'On-Nonce': nonce, Authorization: authorization },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch (error) {
      await this.observe(this.sanitize({ method, path, elapsedMs: performance.now() - started, error: error.message, retries: 0 }));
      throw new Error('Network request failed; see sanitized call log; no retry was attempted');
    }
    const observation = this.sanitize({ method, path, requestBody: body, status: response.status, elapsedMs: performance.now() - started, retries: 0 });
    if (response.status >= 300 && response.status < 400) {
      await this.observe({ ...observation, blocked: 'All redirects blocked, including same-host redirects' });
      throw new Error(`HTTP ${response.status} redirect blocked`);
    }
    let data;
    try { data = Buffer.from(await response.arrayBuffer()); }
    catch (error) {
      await this.observe(this.sanitize({ ...observation, elapsedMs: performance.now() - started, error: error.message }));
      throw new Error('Response body failed; see sanitized call log');
    }
    observation.elapsedMs = performance.now() - started;
    if (binary && response.ok) {
      await this.observe({ ...observation, bytes: data.length });
      return data;
    }
    let result;
    try { result = JSON.parse(data.toString('utf8')); }
    catch { result = { nonJsonBody: data.toString('utf8').slice(0, 16000) }; }
    await this.observe(this.sanitize({ ...observation, response: result }));
    if (!response.ok) throw new Error(`HTTP ${response.status}; see sanitized call log; no retry was attempted`);
    if (result.nonJsonBody) throw new Error('Expected a JSON API response');
    return result;
  }
}