import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

assert.equal(process.argv.length, 2, 'Public setup takes no arguments');
const root = dirname(fileURLToPath(import.meta.url));
const revision = 'b0e725852280ebcfda5d46a4f2ed2d0b720beace';
const project = 'ReshefElisha/jarvis-onshape-mcp';
const evidence = { project, revision, official: false, license: 'MIT', fetchedAt: new Date().toISOString(), fetches: [] };
async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const text = await response.text();
  evidence.fetches.push({ url, status: response.status, sha256: createHash('sha256').update(text).digest('hex') });
  assert.ok(response.ok, `Public download failed: ${response.status}`);
  return text;
}
const tree = JSON.parse(await download(`https://api.github.com/repos/${project}/git/trees/${revision}?recursive=1`));
const paths = tree.tree.filter(entry => entry.type === 'blob' && (
  /^onshape_mcp\/.+\.py$/.test(entry.path) || ['LICENSE', 'NOTICE', 'pyproject.toml', 'README.md'].includes(entry.path)
)).map(entry => entry.path);
for (const path of paths) {
  assert.ok(!path.includes('..'));
  const text = await download(`https://raw.githubusercontent.com/${project}/${revision}/${path}`);
  if (path === 'LICENSE') assert.match(text, /Permission is hereby granted, free of charge/);
  const target = join(root, 'vendor', path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text);
}
evidence.officialSearches = [];
for (const query of ['org:onshape MCP', 'org:onshape-public MCP', 'org:PTCInc Onshape MCP', 'org:ptc-iot-sharing Onshape MCP']) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  evidence.officialSearches.push({ query, url, status: response.status, totalCount: data.total_count ?? null,
    results: data.items?.map(item => item.html_url) ?? [] });
}
await writeFile(join(root, 'research.json'), JSON.stringify(evidence, null, 2) + '\n');
assert.ok(paths.includes('onshape_mcp/server.py') && paths.includes('onshape_mcp/api/client.py'));
console.log(JSON.stringify({ status: 'PASS', project, revision, downloadedFiles: paths.length, officialSearches: evidence.officialSearches }));