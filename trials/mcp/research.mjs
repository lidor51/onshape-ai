import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertOfflineArguments, trialDirectory } from './safety.mjs';

assertOfflineArguments(process.argv.slice(2));
const output = join(trialDirectory, 'artifacts');
await mkdir(output, { recursive: true });
const results = [];
const urls = [
  ['repositories', 'https://api.github.com/search/repositories?q=onshape%20mcp&sort=stars&per_page=8'],
  ['release', 'https://api.github.com/repos/altendky/onshape-mcp/releases/tags/v0.5.2'],
  ['commit', 'https://api.github.com/repos/altendky/onshape-mcp/commits/3bd1bf698818ade4ab286f0e3a7cc57289114b91'],
  ['official-openapi', 'https://cad.onshape.com/api/openapi'],
  ['fs-library', 'https://cad.onshape.com/FsDoc/library.html'],
];
for (const [name, url] of urls) {
  console.log(`Fetching public evidence: ${url}`);
  try {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    const text = await response.text();
    results.push({ name, url, status: response.status, fetchedAt: new Date().toISOString(), sha256: createHash('sha256').update(text).digest('hex') });
    if (!response.ok) continue;
    if (name === 'fs-library') {
      const evidence = ['fCuboid', 'fCylinder', 'EXCLUDE_FROM_BOM', 'opBoolean', 'setProperty'].map(term => {
        const position = text.indexOf(`id="${term}`);
        return { term, found: position >= 0, excerpt: position >= 0 ? text.slice(position, position + 6500) : '' };
      });
      await writeFile(join(output, 'fs-library-excerpts.json'), JSON.stringify(evidence, null, 2) + '\n');
    } else {
      const data = JSON.parse(text);
      if (name === 'official-openapi') {
        const operations = JSON.parse(await readFile(join(output, 'discovery.json'))).explainedEndpoints;
        const paths = Object.fromEntries(Object.entries(data.paths).filter(([, methods]) => Object.values(methods).some(method => operations.includes(method?.operationId))));
        await writeFile(join(output, 'official-api.json'), JSON.stringify({ openapi: data.openapi, info: data.info, servers: data.servers, paths, components: data.components }, null, 2) + '\n');
      } else if (name === 'repositories') {
        await writeFile(join(output, `${name}.json`), JSON.stringify(data.items.map(repo => ({ project: repo.full_name, url: repo.html_url, description: repo.description, branch: repo.default_branch, license: repo.license?.spdx_id ?? null, stars: repo.stargazers_count, pushedAt: repo.pushed_at, archived: repo.archived })), null, 2) + '\n');
      } else {
        await writeFile(join(output, `${name}.json`), text);
      }
    }
  } catch (error) {
    results.push({ name, url, error: error.message });
  }
}
await writeFile(join(output, 'public-fetches.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results.map(({ name, status, error }) => ({ name, status, error }))));