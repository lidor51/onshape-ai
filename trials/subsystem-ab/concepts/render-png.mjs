import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const output = new URL('../../../outputs/concepts/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', output), 'utf8'));
const started = performance.now();
manifest.rasters = [];
for (const name of [...manifest.files.map(file => file.file.slice(0, -4)), 'overview']) {
  const source = await readFile(new URL(`${name}.svg`, output));
  const image = new Resvg(source, { font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' }, background: '#ffffff' }).render();
  const bytes = image.asPng();
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), name === 'overview' ? manifest.overviewSize.width : 1600);
  assert.equal(bytes.readUInt32BE(20), name === 'overview' ? manifest.overviewSize.height : 1030);
  await writeFile(new URL(`${name}.png`, output), bytes);
  manifest.rasters.push({ file: `${name}.png`, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
manifest.rasterEngine = '@resvg/resvg-js 2.6.2 (2D SVG rasterizer, not a CAD kernel)';
manifest.rasterElapsedMs = Math.round(performance.now() - started);
await writeFile(new URL('manifest.json', output), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Rendered ${manifest.rasters.length} PNGs in ${manifest.rasterElapsedMs} ms; no CAD kernel, credentials or network used.`);