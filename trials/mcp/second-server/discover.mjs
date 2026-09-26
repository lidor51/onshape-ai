import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '../node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '../node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';

export const root = dirname(fileURLToPath(import.meta.url));
export function environment(run) {
  const env = {};
  for (const key of ['SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'PATH']) if (process.env[key]) env[key] = process.env[key];
  return { ...env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8', PYTHON_DOTENV_DISABLED: '1',
    USERPROFILE: run, HOME: run, APPDATA: run, LOCALAPPDATA: run, TRIAL_RUN: run };
}
export async function connect(run, liveEnvironment = {}) {
  const transport = new StdioClientTransport({ command: join(root, '.venv/Scripts/python.exe'),
    args: [join(root, 'launch.py')], cwd: run, env: { ...environment(run), ...liveEnvironment }, stderr: 'pipe' });
  const client = new Client({ name: 'independent-intake-trial', version: '1.0.0' });
  await client.connect(transport);
  transport.stderr?.resume();
  return { client, transport };
}
if (process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase()) {
  assert.equal(process.argv.length, 2);
  const run = join(root, 'runs', 'discovery');
  await mkdir(run, { recursive: true });
  const started = performance.now();
  const { client } = await connect(run);
  try {
    const tools = await client.listTools();
    for (const name of ['create_document', 'write_featurescript_feature', 'update_feature', 'eval_featurescript', 'render_part_studio_views', 'export_part_studio']) {
      assert.ok(tools.tools.some(tool => tool.name === name), `Missing ${name}`);
    }
    await writeFile(join(root, 'tools.json'), JSON.stringify(tools, null, 2));
    console.log(JSON.stringify({ status: 'PASS', server: client.getServerVersion(), toolCount: tools.tools.length,
      elapsedMs: performance.now() - started, authenticatedRequests: 0 }));
  } finally { await client.close(); }
}