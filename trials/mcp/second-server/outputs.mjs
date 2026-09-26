import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function payloadKind(bytes) {
  if (bytes.subarray(0, 4).toString('hex') === '504b0304') return 'zip';
  if (bytes.subarray(0, 200).toString('ascii').includes('ISO-10303-21;')) return 'step';
  throw new Error('UNRECOGNIZED_EXPORT_BYTES');
}

export async function collectOutputs(run, phase) {
  assert.ok(['baseline', 'revision'].includes(phase));
  const result = JSON.parse(await readFile(join(run, `${phase}-export.json`), 'utf8'));
  assert.ok(result.text?.startsWith('Export DONE.'), 'MCP_EXPORT_NOT_DONE');
  const payloadPath = result.text.match(/^Path: (.+)$/m)?.[1];
  assert.ok(payloadPath && resolve(dirname(payloadPath)) === resolve(run), 'EXPORT_OUTSIDE_OWN_RUN');
  const bytes = await readFile(payloadPath);
  const kind = payloadKind(bytes);
  const original = `${phase}-export-original.${kind}`;
  await writeFile(join(run, original), bytes);
  let extracted;
  if (kind === 'zip') {
    extracted = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-NonInteractive', '-File', join(root, 'extract-step.ps1'),
      '-Archive', join(run, original), '-Destination', join(run, `${phase}-export-extracted`)], { encoding: 'utf8' }));
  } else {
    extracted = [{ filename: original, entry: null }];
  }
  const steps = [];
  for (const entry of extracted) {
    const file = kind === 'zip' ? `${phase}-export-extracted/${entry.filename}` : entry.filename;
    const data = await readFile(join(run, file));
    assert.equal(payloadKind(data), 'step');
    const text = data.toString('utf8');
    assert.ok(text.trimEnd().endsWith('END-ISO-10303-21;'), 'INCOMPLETE_STEP');
    steps.push({ file, archiveEntry: entry.entry, bytes: data.length, sha256: sha256(data),
      solidRecords: (text.match(/MANIFOLD_SOLID_BREP\s*\(/g) ?? []).length,
      provenance: kind === 'zip' ? 'extracted unchanged from MCP-downloaded Onshape ZIP' : 'MCP-downloaded Onshape STEP' });
  }
  assert.equal(steps.reduce((total, file) => total + file.solidRecords, 0), 9, 'STEP_SOLID_RECORD_COUNT');
  const images = [];
  for (const [index, view] of ['iso', 'right'].entries()) {
    const file = `${phase}-render-${index}.png`;
    const data = await readFile(join(run, file));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16), 1200);
    assert.equal(data.readUInt32BE(20), 900);
    images.push({ file, view, width: 1200, height: 900, bytes: data.length, sha256: sha256(data), provenance: 'Onshape shadedviews PNG returned as MCP ImageContent' });
  }
  const manifest = { status: 'PASS', phase, original: { file: original, serverSavedFile: basename(payloadPath), kind, bytes: bytes.length, sha256: sha256(bytes) }, steps, images };
  await writeFile(join(run, `${phase}-outputs.json`), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase()) {
  const active = JSON.parse(await readFile(join(root, 'active-run.json'), 'utf8'));
  console.log(JSON.stringify(await collectOutputs(join(root, 'runs', active.run), process.argv[2])));
}