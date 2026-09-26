import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const benchmark = JSON.parse(readFileSync(new URL('./intake.json', import.meta.url), 'utf8'));

for (const [name, dimensions] of Object.entries({
  baseline: benchmark.baseline,
  revision: { ...benchmark.baseline, ...benchmark.revision },
})) {
  test(`${name}: benchmark dimensions allow the intended components`, () => {
    const rearRollerY = dimensions.frontRollerYMm + dimensions.rollerDiameterMm + dimensions.rollerGapMm;
    assert.ok(dimensions.innerWidthMm > benchmark.coralReference.lengthMm);
    assert.ok(dimensions.innerWidthMm - 2 * dimensions.rollerSideClearanceMm > 0);
    assert.ok(dimensions.shaftHoleDiameterMm > dimensions.shaftDiameterMm);
    assert.ok(dimensions.rollerZMm - dimensions.rollerDiameterMm / 2 > 0);
    assert.ok(rearRollerY + dimensions.shaftHoleDiameterMm / 2 < dimensions.plateLengthMm);
    assert.ok(dimensions.rollerZMm - dimensions.shaftHoleDiameterMm / 2 > dimensions.plateBottomZMm);
    for (const [centerY, centerZ] of dimensions.crossmemberCentersYZMm) {
      assert.ok(centerY + dimensions.crossmemberSizeMm / 2 < dimensions.plateLengthMm);
      assert.ok(centerZ + dimensions.crossmemberSizeMm / 2 < dimensions.plateBottomZMm + dimensions.plateHeightMm);
    }
  });
}

test('the comparison has identical part and revision targets', () => {
  assert.equal(new Set(benchmark.requiredParts).size, 9);
  assert.equal(benchmark.plateHolesPerSide, 5);
  assert.equal(benchmark.revision.innerWidthMm - benchmark.baseline.innerWidthMm, 20);
  assert.equal(benchmark.revision.rollerGapMm - benchmark.baseline.rollerGapMm, -5);
});
