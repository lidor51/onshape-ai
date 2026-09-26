import { mkdirSync, writeFileSync } from 'node:fs';
import { requireThat, sha256 } from './ledger.mjs';

export const PUBLIC_SCHEMA_URL = 'https://cad.onshape.com/api/openapi';
export const PUBLIC_DOCS = {
  signing: 'https://onshape-public.github.io/docs/auth/apikeys/',
  assemblies: 'https://onshape-public.github.io/docs/api-adv/assemblies/',
  imports: 'https://onshape-public.github.io/docs/api-adv/translation/',
};

export async function downloadPublicSchema() {
  const response = await fetch(PUBLIC_SCHEMA_URL, { redirect: 'error',
    signal: AbortSignal.timeout(60000), headers: { Accept: 'application/json' } });
  requireThat(response.ok, `PUBLIC_SCHEMA_HTTP_${response.status}`);
  const text = await response.text();
  const spec = JSON.parse(text);
  requireThat(spec.servers.some(server => new URL(server.url).pathname === '/api/v17'), 'PUBLIC_SCHEMA_NOT_V17');
  const directory = new URL('./schema/', import.meta.url);
  mkdirSync(directory, { recursive: true });
  writeFileSync(new URL('openapi-v17.json', directory), text);
  writeFileSync(new URL('provenance.json', directory), JSON.stringify({ source: PUBLIC_SCHEMA_URL,
    retrievedAt: new Date().toISOString(), sha256: sha256(text), authentication: 'none',
    targetApiVersion: 'v17', info: spec.info, docs: PUBLIC_DOCS }, null, 2) + '\n');
  return { authentication: 'none', targetApiVersion: 'v17', sha256: sha256(text),
    operations: Object.values(spec.paths).flatMap(methods => Object.values(methods))
      .filter(operation => operation.tags?.includes('Assembly')).map(operation => operation.operationId) };
}

if (import.meta.main) {
  requireThat(process.argv.slice(2).join(' ') === '--download-public-schema', 'EXPLICIT_ANONYMOUS_SCHEMA_DOWNLOAD_REQUIRED');
  console.log(JSON.stringify(await downloadPublicSchema(), null, 2));
}