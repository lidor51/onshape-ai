import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as generator from './generate.mjs';

const baseline = JSON.parse(readFileSync(new URL('./artifacts/baseline.json', import.meta.url), 'utf8'));
const revision = JSON.parse(readFileSync(new URL('./artifacts/revision.json', import.meta.url), 'utf8'));
const task = {
  baseline: baseline.parameters,
  revision: revision.parameters,
  coralReference: baseline.coralReference,
  requiredParts: baseline.parts.map(part => part.name),
  plateHolesPerSide: baseline.expectedHolesPerPlate,
};
const withoutWhitespace = text => text.replace(/"(?:\\[\s\S]|[^"\\])*"|\s+/g,
  token => token.startsWith('"') ? token : '');

test('compact dispatch is under 14000 characters, uses live 3070 and keeps entrypoint order', () => {
  for (const [entry, phase, firstExport] of [
    ['self-test', true, 'officialIntakeSelfTest'],
    ['retained', true, 'officialIntakeRetained'],
    ['retained', false, 'officialIntakeRetained'],
  ]) {
    const source = generator.compactDispatchSource(task, entry, phase);
    assert.ok(source.length <= 14000, `${entry}: ${source.length} characters`);
    assert.equal(withoutWhitespace(source), withoutWhitespace(generator.dispatchSource(task, entry, phase)));
    assert.match(source, /^FeatureScript 3070;/);
    assert.match(source, /version\s*:\s*"3070.0"/);
    assert.equal(source.match(/export const (\w+)\s*=\s*defineFeature/)[1], firstExport);
    assert.ok(Math.max(...source.split('\n').map(line => line.length)) <= 1200);
    assert.equal(generator.compactFeatureScript(source), source);
    assert.ok(!/[^\x00-\x7f]/.test(source));
  }
});

test('compaction preserves all non-whitespace tokens including strings and operator boundaries', () => {
  const source = 'const text = "a  b \\" c"; const difference = left - -right; const sum = left + +right;\n';
  const compact = generator.compactFeatureScript(source);
  assert.ok(compact.includes('"a  b \\" c"'));
  assert.ok(!compact.includes('--'));
  assert.ok(!compact.includes('++'));
  assert.equal(generator.compactFeatureScript(compact), compact);
});

test('dispatch declares dependencies before wrappers and places exported features on their own lines', () => {
  for (const entry of ['self-test', 'retained']) {
    const source = generator.compactDispatchSource(task, entry);
    const firstFeature = source.search(/^export const officialIntake(?:SelfTest|Retained) = defineFeature/m);
    assert.equal(source.search(/^export /m), firstFeature);
    assert.ok(firstFeature > source.indexOf('const officialIntake = defineFeature'));
    assert.ok(firstFeature > source.indexOf('const officialIntakeDefaultBaseline='));
    assert.ok(firstFeature > source.indexOf('function officialIntakeAssert('));
    assert.doesNotMatch(source, /export const officialIntake\s*=/);
    assert.equal([...source.matchAll(/^export const \w+ = defineFeature/gm)].length, 2);
  }
});

test('compact dispatch preserves both-phase bounds, volumes, full cylindrical through-hole checks and evidence caveats', () => {
  const source = generator.compactDispatchSource(task);
  for (const token of ['[true,false]', 'evBox3d', 'evVolume', 'evSurfaceDefinition',
    'GeometryType.CYLINDER', 'actualPart.solidCount', 'actualPart.minMm', 'actualPart.maxMm',
    'actualPart.volumeMm3', 'actualCylinder.radiusMm', 'actualCylinder.axisOriginMm',
    'actualCylinder.axisDirection', 'actualCylinder.minMm', 'actualCylinder.maxMm',
    'through start', 'through end', 'cylindrical face count mismatch',
    'TRANSIENT_SCRATCH_EVALUATION_NOT_PERSISTED', 'REGENERATION_MEASUREMENTS_NOT_PERSISTENCE_READBACK']) {
    assert.ok(source.includes(token), token);
  }
  for (const overrides of [{}, task.revision]) {
    const expected = generator.assertionModel(task, overrides);
    assert.deepEqual(expected.parts.map(part => part.cylinders.length), [5, 5, 2, 2, 1, 1, 0, 0, 2]);
    const packed = generator.packedAssertionModel(task, overrides);
    assert.ok(withoutWhitespace(source).includes(withoutWhitespace(JSON.stringify(packed))));
    assert.deepEqual({ innerWidthMm: packed[0], rollerGapMm: packed[1], parts: packed[2].map(row => ({
      role: row[0], minMm: row[1], maxMm: row[2], volumeMm3: row[3],
      cylinders: row[4].map(cylinder => ({ radiusMm: cylinder[0], centerYZMm: cylinder.slice(1) })),
    })) }, expected);
  }
});