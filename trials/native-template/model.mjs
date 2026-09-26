import { readFileSync } from 'node:fs';

export const specification = JSON.parse(readFileSync(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));
export function parameters() {
  const baseline = specification.baseline;
  return { units: specification.units, innerWidth: baseline.innerWidthMm, rollerGap: baseline.rollerGapMm,
    plateThickness: baseline.plateThicknessMm, plateLength: baseline.plateLengthMm,
    plateHeight: baseline.plateHeightMm, plateBottomZ: baseline.plateBottomZMm,
    rollerDiameter: baseline.rollerDiameterMm, frontRollerY: baseline.frontRollerYMm,
    rollerZ: baseline.rollerZMm, shaftHoleDiameter: baseline.shaftHoleDiameterMm,
    mountHoleDiameter: baseline.mountHoleDiameterMm, pivotHoleDiameter: baseline.pivotHoleDiameterMm,
    pivotY: baseline.pivotCenterYZMm[0], pivotZ: baseline.pivotCenterYZMm[1],
    mount1Y: baseline.crossmemberCentersYZMm[0][0], mount1Z: baseline.crossmemberCentersYZMm[0][1],
    mount2Y: baseline.crossmemberCentersYZMm[1][0], mount2Z: baseline.crossmemberCentersYZMm[1][1],
    downstream: false };
}

export function measure(candidate) {
  if (candidate.units !== 'mm') throw new Error('UNITS_MM_REQUIRED');
  if (typeof candidate.downstream !== 'boolean') throw new Error('INVALID_DOWNSTREAM');
  for (const name of Object.keys(parameters()).filter(name => !['units', 'downstream'].includes(name))) {
    if (!Number.isFinite(candidate[name])) throw new Error('NONFINITE_PARAMETER');
  }
  for (const name of ['innerWidth', 'rollerGap', 'plateThickness', 'plateLength', 'plateHeight',
    'rollerDiameter', 'shaftHoleDiameter', 'mountHoleDiameter', 'pivotHoleDiameter']) {
    if (candidate[name] <= 0) throw new Error('NONPOSITIVE_PARAMETER');
  }
  const holes = [
    { name: 'Front shaft', center: [candidate.frontRollerY, candidate.rollerZ], diameter: candidate.shaftHoleDiameter },
    { name: 'Rear shaft', center: [candidate.frontRollerY + candidate.rollerDiameter + candidate.rollerGap, candidate.rollerZ], diameter: candidate.shaftHoleDiameter },
    { name: 'Mount 1', center: [candidate.mount1Y, candidate.mount1Z], diameter: candidate.mountHoleDiameter },
    { name: 'Mount 2', center: [candidate.mount2Y, candidate.mount2Z], diameter: candidate.mountHoleDiameter },
    { name: 'Pivot', center: [candidate.pivotY, candidate.pivotZ], diameter: candidate.pivotHoleDiameter },
  ];
  if (candidate.downstream) holes.push({ name: 'Editor downstream', center: [200, 40], diameter: 4 });
  const ligaments = [];
  for (const [index, hole] of holes.entries()) {
    const [centerY, centerZ] = hole.center;
    const radius = hole.diameter / 2;
    ligaments.push(centerY - radius, candidate.plateLength - centerY - radius,
      centerZ - candidate.plateBottomZ - radius, candidate.plateBottomZ + candidate.plateHeight - centerZ - radius);
    for (const other of holes.slice(index + 1)) {
      ligaments.push(Math.hypot(centerY - other.center[0], centerZ - other.center[1]) - radius - other.diameter / 2);
    }
  }
  const volumeMm3 = (candidate.plateLength * candidate.plateHeight -
    holes.reduce((area, hole) => area + Math.PI * (hole.diameter / 2) ** 2, 0)) * candidate.plateThickness;
  const boundsMm = { low: [-candidate.innerWidth / 2 - candidate.plateThickness, 0, candidate.plateBottomZ],
    high: [-candidate.innerWidth / 2, candidate.plateLength, candidate.plateBottomZ + candidate.plateHeight] };
  if (![volumeMm3, ...ligaments, ...boundsMm.low, ...boundsMm.high].every(Number.isFinite)) throw new Error('NONFINITE_GEOMETRY');
  if (Math.min(...ligaments) <= 0 || volumeMm3 <= 0) throw new Error('LIGAMENT_OR_VOLUME');
  return { evidence: 'analytic arithmetic only; not CAD or server measurements', units: 'mm',
    solidCountExpected: 1, boundsMm, holes, volumeMm3, minLigamentMm: Math.min(...ligaments) };
}