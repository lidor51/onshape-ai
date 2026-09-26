import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { unzlibSync } from 'fflate';
import { sha256 } from './exports.mjs';
import { verifyFeature } from './finish.mjs';
import { expectations } from './geometry.mjs';
import { decodeFs, validateMeasurements } from './validate.mjs';

const directory = new URL('./runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/', import.meta.url);
const bytes = name => readFile(new URL(name, directory));
const load = async name => JSON.parse(await bytes(name));
const summary = await load('summary.json');
const benchmark = await load('benchmark.json');

for (const variant of ['baseline', 'revision']) {
  test(`real ${variant}: same custom feature, nine solids and every required hole dimension`, async () => {
    verifyFeature(await load(`${variant}-features.json`), summary, benchmark, variant);
    const evaluation = await load(`${variant}-measurements-raw.json`);
    assert.equal(validateMeasurements(evaluation, expectations(benchmark, variant)).status, 'PASS_SERVER_MEASUREMENTS');
    const decoded = decodeFs(evaluation.result);
    const encode = value => ({ btType: `com.belmonttech.serialize.fsvalue.BTFSValue${Array.isArray(value) ? 'Array' : typeof value === 'number' ? 'Number' : 'String'}`, value: Array.isArray(value) ? value.map(encode) : value });
    decoded[1][0][5].pop();
    assert.throws(() => validateMeasurements({ result: encode(decoded) }, expectations(benchmark, variant)), /cylindrical face count/);
  });

  test(`real ${variant}: PNG is 1200x900, decodes nonblank, and hash matches`, async () => {
    const image = await bytes(`${variant}.png`);
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(image.readUInt32BE(16), 1200);
    assert.equal(image.readUInt32BE(20), 900);
    assert.equal(sha256(image), summary.variants[variant].exports.image.sha256);
    const chunks = [];
    for (let offset = 8; offset < image.length;) {
      const length = image.readUInt32BE(offset);
      if (image.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(image.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    const pixels = unzlibSync(Buffer.concat(chunks));
    assert.ok(pixels.length >= 1200 * 900);
    assert.ok(new Set(pixels).size > 32, 'Image data must not be a blank uniform raster');
  });

  test(`real ${variant}: STEP is unchanged server bytes with nine solid records`, async () => {
    const manifest = await load(`${variant}-export-manifest.json`);
    const raw = await bytes(manifest.rawFile);
    const step = await bytes(`${variant}.step`);
    assert.equal(manifest.status, 'RECEIVED_STEP');
    assert.deepEqual(step, raw);
    assert.equal(sha256(raw), manifest.sha256);
    assert.match(step.toString(), /^ISO-10303-21;/);
    assert.match(step.toString().slice(-4096), /END-ISO-10303-21;/);
    assert.equal((step.toString().match(/\bMANIFOLD_SOLID_BREP\s*\(/g) ?? []).length, 9);
  });
}

test('actual revision changes only two expressions on the same server feature', async () => {
  const baseline = (await load('baseline-features.json')).features[0];
  const request = (await load('revision-request.json')).feature;
  const restored = structuredClone(request);
  for (const parameter of restored.parameters) parameter.expression = baseline.parameters.find(item => item.parameterId === parameter.parameterId).expression;
  assert.deepEqual(restored, baseline);
  assert.notEqual((await load('baseline-export-manifest.json')).sha256, (await load('revision-export-manifest.json')).sha256);
});