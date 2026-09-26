import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { featureCall } from './generate.mjs';

const source = await readFile(new URL('./intake.fs', import.meta.url), 'utf8');
const benchmark = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));

test('lexical only, not a FeatureScript compiler: saved feature has UI and scoped operations', () => {
  assert.match(source, /^FeatureScript 3070;/);
  assert.match(source, /export const coralGroundIntake = defineFeature/);
  assert.match(source, /isLength\(definition.innerWidth, WIDTH_BOUNDS\)/);
  assert.match(source, /isLength\(definition.rollerGap, GAP_BOUNDS\)/);
  assert.match(source, /FRONT_Y \+ ROLLER_DIAMETER \+ definition.rollerGap/);
  assert.match(source, /width - 2 \* SIDE_CLEARANCE/);
  assert.match(source, /width \+ 2 \* PLATE_THICKNESS \+ 2 \* SHAFT_EXTENSION/);
  assert.equal((source.match(/"role" : "(?:frontShaft|rearShaft|frontMount|rearMount|pivot)", "center"/g) ?? []).length, 5);
  assert.doesNotMatch(source, /qNthElement|qEverything|BooleanOperationType.UNION|keepTools" : true/);
  assert.match(source, /PropertyType.EXCLUDE_FROM_BOM,\s*"value" : true/);
  for (const part of benchmark.requiredParts) assert.ok(source.includes(`"${part}"`), part);
});

test('lexical only: fixed length constants match the normative benchmark', () => {
  const mapping = {
    PLATE_THICKNESS: 'plateThicknessMm', PLATE_LENGTH: 'plateLengthMm', PLATE_HEIGHT: 'plateHeightMm',
    PLATE_BOTTOM: 'plateBottomZMm', ROLLER_DIAMETER: 'rollerDiameterMm', SIDE_CLEARANCE: 'rollerSideClearanceMm',
    FRONT_Y: 'frontRollerYMm', ROLLER_Z: 'rollerZMm', SHAFT_DIAMETER: 'shaftDiameterMm',
    SHAFT_HOLE_DIAMETER: 'shaftHoleDiameterMm', SHAFT_EXTENSION: 'shaftEndExtensionMm',
    CROSS_SIZE: 'crossmemberSizeMm', MOUNT_HOLE_DIAMETER: 'mountHoleDiameterMm', PIVOT_HOLE_DIAMETER: 'pivotHoleDiameterMm',
  };
  for (const [constant, key] of Object.entries(mapping)) assert.ok(source.includes(`const ${constant} = ${benchmark.baseline[key]} * millimeter;`), key);
  const coral = benchmark.coralReference;
  for (const [constant, value] of Object.entries({ CORAL_OUTER_DIAMETER: coral.outerDiameterMm, CORAL_INNER_DIAMETER: coral.innerDiameterMm, CORAL_LENGTH: coral.lengthMm, CORAL_Y: coral.centerYMm, CORAL_Z: coral.centerZMm })) {
    assert.ok(source.includes(`const ${constant} = ${value} * millimeter;`), constant);
  }
  for (const center of [...benchmark.baseline.crossmemberCentersYZMm, benchmark.baseline.pivotCenterYZMm]) assert.ok(source.includes(`vector(${center.join(', ')}) * millimeter`));
});

test('request contract only: revision preserves custom feature identity and namespace', () => {
  const baseline = featureCall(benchmark, 'baseline', 'synthetic-namespace', 'synthetic-feature');
  const revision = featureCall(benchmark, 'revision', 'synthetic-namespace', 'synthetic-feature');
  assert.deepEqual(revision.feature.parameters.map(parameter => parameter.expression), ['360 mm', '95 mm']);
  assert.deepEqual({ ...baseline.feature, parameters: [] }, { ...revision.feature, parameters: [] });
});