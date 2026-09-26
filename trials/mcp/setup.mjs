import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { assertOfflineArguments, isolatedEnvironment, trialDirectory } from './safety.mjs';

assertOfflineArguments(process.argv.slice(2));
if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('Pinned binary requires Windows x64');
export const commit = '3bd1bf698818ade4ab286f0e3a7cc57289114b91';
const archiveSha256 = '8cd050010f120ec893499fa34fccaba08f9919530c76a0bdbbb6d704e7948739';
const releaseUrl = 'https://github.com/altendky/onshape-mcp/releases/download/v0.5.2/onshape-mcp-0.5.2-x86_64-pc-windows-msvc.zip';
const sources = [
  'README.md', 'LICENSE-APACHE', 'LICENSE-MIT', 'Cargo.toml', 'Cargo.lock',
  'docs/src/project/configuration.md', 'docs/src/project/authentication.md',
  'docs/src/project/mcp-tools.md',
  'crates/onshape-mcp/src/main.rs',
  'crates/onshape-mcp-core/src/config.rs', 'crates/onshape-mcp-core/src/lib.rs',
  'crates/onshape-mcp-core/src/tools.rs',
  'crates/onshape-mcp-io/src/config.rs', 'crates/onshape-mcp-io/src/lib.rs',
  'crates/onshape-mcp-io/src/oauth.rs', 'crates/onshape-mcp-io/src/watcher.rs',
  'crates/onshape-client-io/src/lib.rs', 'crates/onshape-openapi/src/lib.rs',
  'crates/onshape-mcp-io/ONSHAPE-API-LICENSE', 'crates/onshape-mcp-io/onshape-openapi.json',
];
const observations = { commit, release: 'v0.5.2', startedAt: new Date().toISOString(), downloads: [], commands: [] };
const artifacts = join(trialDirectory, 'artifacts');
await mkdir(artifacts, { recursive: true });

async function download(url, destination, expectedHash) {
  console.log(`Downloading public source: ${url}`);
  const start = performance.now();
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Public download failed: ${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (expectedHash && sha256 !== expectedHash) throw new Error('Archive hash mismatch');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  observations.downloads.push({ url, status: response.status, bytes: bytes.length, sha256, elapsedMs: performance.now() - start });
}

try {
  for (const path of sources) {
    await download(`https://raw.githubusercontent.com/altendky/onshape-mcp/${commit}/${path}`, join(trialDirectory, 'vendor/source', path));
  }
  const archive = join(trialDirectory, 'vendor/server.zip');
  await download(releaseUrl, archive, archiveSha256);
  const runtimeRoot = join(trialDirectory, 'runtime');
  await mkdir(runtimeRoot, { recursive: true });
  const runtime = await mkdtemp(join(runtimeRoot, 'install-'));
  const environment = isolatedEnvironment(runtime);
  for (const path of new Set([environment.TEMP, environment.APPDATA, environment.LOCALAPPDATA])) {
    await mkdir(path, { recursive: true });
  }
  const tar = join(environment.SystemRoot, 'System32', 'tar.exe');
  const entries = execFileSync(tar, ['-tf', archive], { env: environment, encoding: 'utf8' }).trim().split(/\r?\n/);
  const prefix = 'onshape-mcp-0.5.2-x86_64-pc-windows-msvc/';
  const expectedEntries = [prefix, ...['onshape-mcp.exe', 'LICENSE-MIT', 'LICENSE-APACHE'].map(name => prefix + name)];
  if (JSON.stringify([...entries].sort()) !== JSON.stringify(expectedEntries.sort())) {
    throw new Error('Archive entries differ from the reviewed release layout');
  }
  const binaryDirectory = join(trialDirectory, 'vendor/bin');
  await mkdir(binaryDirectory, { recursive: true });
  execFileSync(tar, ['-xf', archive, '--strip-components=1', '-C', binaryDirectory], { env: environment });
  observations.commands.push({ command: 'tar.exe -tf/-xf vendor/server.zip', exitCode: 0, entries });
  const npmCli = join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const userConfig = join(runtime, 'empty-user.npmrc');
  const globalConfig = join(runtime, 'empty-global.npmrc');
  await writeFile(userConfig, '');
  await writeFile(globalConfig, '');
  const args = [npmCli, existsSync(join(trialDirectory, 'package-lock.json')) ? 'ci' : 'install',
    '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org',
    `--prefix=${trialDirectory}`, `--cache=${join(trialDirectory, '.npm-cache')}`,
    `--userconfig=${userConfig}`, `--globalconfig=${globalConfig}`];
  console.log('Installing pinned SDK with lifecycle scripts disabled');
  const installer = spawn(process.execPath, args, { cwd: trialDirectory, env: environment, stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000 });
  let stdout = '';
  installer.stdout.on('data', bytes => { stdout += bytes; process.stdout.write(bytes); });
  installer.stderr.on('data', bytes => process.stderr.write(bytes));
  const exitCode = await new Promise((resolve, reject) => {
    installer.on('error', reject);
    installer.on('close', code => resolve(code));
  });
  if (exitCode !== 0) throw new Error(`Isolated npm install exited ${exitCode}`);
  observations.commands.push({ command: 'node npm-cli.js install/ci --ignore-scripts --no-audit --no-fund (isolated config/cache)', exitCode: 0, stdout });
  observations.status = 'ready-for-source-review';
  console.log(JSON.stringify({ status: observations.status, downloads: observations.downloads.length, npm: stdout.trim() }));
} catch (error) {
  observations.status = 'failed';
  observations.error = error.message;
  process.exitCode = 1;
  console.error(error.message);
} finally {
  await writeFile(join(artifacts, 'setup.json'), JSON.stringify(observations, null, 2) + '\n');
}