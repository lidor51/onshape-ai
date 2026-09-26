import test from 'node:test';
import assert from 'node:assert/strict';
import { zipSync } from 'fflate';
import { decodeStep } from './step.mjs';

const step = Buffer.from("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\n#1=MANIFOLD_SOLID_BREP('synthetic',#2);\nENDSEC;\nEND-ISO-10303-21;\n");

test('raw and ZIP-wrapped STEP preserve original bytes and identify solid records', () => {
  for (const input of [step, Buffer.from(zipSync({ 'Native REST intake.step': step }))]) {
    const result = decodeStep(input);
    assert.deepEqual(result.bytes, step);
    assert.equal(result.solidRecordCount, 1);
  }
});

test('ZIP support does not accept malformed STEP, traversal, missing or multiple STEP files', () => {
  for (const entries of [
    { 'intake.step': Buffer.from('not STEP') },
    { '../intake.step': step },
    { 'intake.txt': step },
    { 'first.step': step, 'second.step': step },
  ]) assert.throws(() => decodeStep(Buffer.from(zipSync(entries))));
  assert.throws(() => decodeStep(Buffer.from('not STEP')));
});

test('observed nine-part bundle requires every STEP file to validate and the expected count', () => {
  const entries = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [`part${index}.step`, step]));
  const payload = Buffer.from(zipSync(entries));
  assert.equal(decodeStep(payload, 9).solidRecordCount, 9);
  assert.equal(decodeStep(payload, 9).files.length, 9);
  assert.throws(() => decodeStep(payload, 8), /FILE_COUNT_MISMATCH/);
  entries['part0.step'] = Buffer.from('invalid STEP');
  assert.throws(() => decodeStep(Buffer.from(zipSync(entries)), 9), /SIGNATURE_UNSUPPORTED/);
});