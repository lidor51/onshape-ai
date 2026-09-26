import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { expectations } from './geometry.mjs';

const benchmark = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('analytic contract only: baseline dimensions and plate hole pattern', () => {
  const result = expectations(benchmark);
  assert.equal(result.expectedSolidCount, 9);
  assert.deepEqual(result.parts.map(part => part.name).sort(), [...benchmark.requiredParts].sort());
  near(result.rearRollerYMm, 246.2);
  near(result.rollerLengthMm, 330);
  near(result.shaftLengthMm, 378.1);
  assert.deepEqual(result.parts[0].boundsMm, { min: [-176.35, 0, 12.7], max: [-170, 320, 162.7] });
  for (const plate of result.parts.filter(part => part.holes)) assert.equal(plate.holes.length, 5);
  assert.equal(result.parts.find(part => part.name === 'coralReference').nonBomReference, true);
});

test('analytic contract only: revision changes width and surface gap', () => {
  const baseline = expectations(benchmark);
  const revision = expectations(benchmark, 'revision');
  near(revision.rearRollerYMm, 241.2);
  near(revision.rollerLengthMm, 350);
  near(revision.shaftLengthMm, 398.1);
  const front = revision.parts.find(part => part.name === 'frontRoller');
  const rear = revision.parts.find(part => part.name === 'rearRoller');
  near(rear.boundsMm.min[1] - front.boundsMm.max[1], 95);
  assert.deepEqual(revision.parts.find(part => part.name === 'coralReference'), baseline.parts.find(part => part.name === 'coralReference'));
  assert.deepEqual(Object.keys(revision.parameters).filter(key => JSON.stringify(revision.parameters[key]) !== JSON.stringify(baseline.parameters[key])), ['innerWidthMm', 'rollerGapMm']);
});