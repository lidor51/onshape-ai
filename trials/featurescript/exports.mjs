import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';

export const sha256 = data => createHash('sha256').update(data).digest('hex');

export async function retainStep(data, variant, save) {
  assert.ok(['baseline', 'revision'].includes(variant));
  const rawFile = `${variant}-export.bin`;
  await save(rawFile, data);
  const zipped = data.subarray(0, 4).toString('hex') === '504b0304';
  const entries = zipped ? Object.entries(unzipSync(data, { filter: entry => {
    assert.ok(entry.originalSize <= 100_000_000, 'Oversized export member');
    return /\.(step|stp)$/i.test(entry.name);
  } })) : [[`${variant}.step`, data]];
  assert.ok(entries.length > 0, 'No STEP members in server export');
  const parts = [];
  for (const [index, [member, bytes]] of entries.entries()) {
    const content = Buffer.from(bytes);
    const text = content.toString('utf8');
    assert.match(text.slice(0, 4096), /ISO-10303-21;/, 'Expected genuine STEP header');
    assert.match(text.slice(-4096), /END-ISO-10303-21;/, 'Expected complete STEP footer');
    const file = zipped ? `${variant}-part-${index + 1}.step` : `${variant}.step`;
    await save(file, content);
    parts.push({ member, file, bytes: content.length, sha256: sha256(content),
      manifoldSolidBrepCount: (text.match(/\bMANIFOLD_SOLID_BREP\s*\(/g) ?? []).length });
  }
  if (zipped) await save(`${variant}.zip`, data);
  const result = { status: zipped ? 'RECEIVED_ZIP_AND_EXTRACTED_STEP' : 'RECEIVED_STEP',
    rawFile, archiveFile: zipped ? `${variant}.zip` : null, bytes: data.length, sha256: sha256(data), parts };
  await save(`${variant}-export-manifest.json`, result);
  return result;
}