import assert from 'node:assert/strict';
import test from 'node:test';
import { zipSync, strToU8 } from 'fflate';
import { retainStep, sha256 } from './exports.mjs';

const step = 'ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\n#1=MANIFOLD_SOLID_BREP(\'synthetic\',#2);\nENDSEC;\nEND-ISO-10303-21;';

test('ZIP export retains exact server bytes and identifies unchanged STEP members', async () => {
  const data = Buffer.from(zipSync({ 'original part name.stp': strToU8(step), 'notes.txt': strToU8('synthetic fixture') }));
  const saved = new Map();
  const result = await retainStep(data, 'baseline', async (name, value) => saved.set(name, value));
  assert.deepEqual(saved.get('baseline-export.bin'), data);
  assert.deepEqual(saved.get('baseline.zip'), data);
  assert.equal(result.sha256, sha256(data));
  assert.equal(result.parts[0].member, 'original part name.stp');
  assert.equal(saved.get(result.parts[0].file).toString(), step);
  assert.equal(result.parts[0].manifoldSolidBrepCount, 1);
});

test('plain STEP remains STEP and failed content is still preserved as raw bytes', async () => {
  const saved = new Map();
  const save = async (name, value) => saved.set(name, value);
  assert.equal((await retainStep(Buffer.from(step), 'revision', save)).status, 'RECEIVED_STEP');
  assert.equal(saved.get('revision.step').toString(), step);
  const unexpected = Buffer.from('not a STEP file');
  await assert.rejects(retainStep(unexpected, 'baseline', save), /genuine STEP header/);
  assert.deepEqual(saved.get('baseline-export.bin'), unexpected);
});