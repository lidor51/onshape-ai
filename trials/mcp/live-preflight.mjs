import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { trialDirectory } from './safety.mjs';

export const releaseSha256 = '424d25e13acab181da32470fb1c28faa129258998ba52979b72f693a43846472';
export const allowedOrigin = 'https://cad.onshape.com';
const messages = Object.freeze({
  LIVE_FLAGS_REQUIRED: 'Require exactly --live and --confirm-new-private-document; no overrides are accepted.',
  ORIGIN_REJECTED: 'Configured origin is not the exact approved HTTPS Onshape origin.',
  UNREVIEWED_EXECUTABLE: 'Executable does not match the reviewed release. No replacement build is approved.',
  BLOCKED_RELEASE_REDIRECT_POLICY: 'Pinned release follows redirects internally without the trial origin/write policy. A source patch does not harden the executable. Credentials were not loaded; no MCP or CAD call was sent.',
  PREFLIGHT_IO_FAILURE: 'Could not inspect the local trial prerequisites. No credentials or server process were used.',
});

function fail(code) {
  throw Object.assign(new Error(messages[code]), { code });
}

export function assertLiveArguments(args) {
  if (args.length !== 2 || !args.includes('--live') || !args.includes('--confirm-new-private-document')) {
    fail('LIVE_FLAGS_REQUIRED');
  }
}

export function assertOrigin(origin) {
  if (origin !== allowedOrigin) fail('ORIGIN_REJECTED');
}

export function assertLiveExecutable(sha256) {
  if (sha256 !== releaseSha256) fail('UNREVIEWED_EXECUTABLE');
  fail('BLOCKED_RELEASE_REDIRECT_POLICY');
}

export async function runPreflight(args) {
  const started = performance.now();
  const result = {
    startedAt: new Date().toISOString(),
    route: 'existing MCP + FeatureScript (MCP+FS)',
    status: 'blocked-before-credential-loading',
    serverRelease: 'v0.5.2',
    serverCommit: '3bd1bf698818ade4ab286f0e3a7cc57289114b91',
    executableModified: false,
    sourcePatchCompiled: false,
    configuredOrigin: allowedOrigin,
    credentialConfigurationRead: false,
    credentialsLoaded: false,
    serverLaunched: false,
    mcpRequests: 0,
    mcpToolCalls: 0,
    onshapeHttpRequests: 0,
    retries: 0,
    newDocuments: 0,
    phaseDocumentLimit: 3,
    documentUrls: [],
    cadElapsedMs: null,
  };
  try {
    assertLiveArguments(args);
    assertOrigin(allowedOrigin);
    const binary = await readFile(join(trialDirectory, 'vendor/bin/onshape-mcp.exe'));
    result.binarySha256 = createHash('sha256').update(binary).digest('hex');
    const source = await readFile(join(trialDirectory, 'artifacts/intake.fs'));
    result.geometrySourceSha256 = createHash('sha256').update(source).digest('hex');
    const transportSource = await readFile(join(trialDirectory, 'vendor/source/crates/onshape-client-io/src/lib.rs'));
    result.localTransportSourceSha256 = createHash('sha256').update(transportSource).digest('hex');
    assertLiveExecutable(result.binarySha256);
  } catch (error) {
    const code = Object.hasOwn(messages, error?.code) ? error.code : 'PREFLIGHT_IO_FAILURE';
    result.error = { code, message: messages[code] };
  }
  result.elapsedMs = performance.now() - started;
  return result;
}

if (import.meta.main) {
  try {
    const result = await runPreflight(process.argv.slice(2));
    const artifact = `artifacts/live-preflight-${randomUUID()}.json`;
    await writeFile(join(trialDirectory, artifact), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ status: result.status, error: result.error, elapsedMs: result.elapsedMs, artifact }));
  } catch {
    console.error('Preflight evidence could not be saved. No credential loading or server launch is implemented.');
  }
  process.exitCode = 1;
}