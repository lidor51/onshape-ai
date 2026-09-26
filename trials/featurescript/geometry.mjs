export function configuration(benchmark, variant = 'baseline') {
  if (!['baseline', 'revision'].includes(variant)) throw new Error('Unknown configuration');
  return { ...benchmark.baseline, ...(variant === 'revision' ? benchmark.revision : {}) };
}

export function expectations(benchmark, variant = 'baseline') {
  const parameters = configuration(benchmark, variant);
  const {
    innerWidthMm: width, plateThicknessMm: thickness, plateLengthMm: length,
    plateHeightMm: height, plateBottomZMm: bottom, rollerDiameterMm: diameter,
    rollerGapMm: gap, rollerSideClearanceMm: clearance, frontRollerYMm: frontY,
    rollerZMm: rollerZ, shaftDiameterMm: shaftDiameter, shaftHoleDiameterMm: bore,
    shaftEndExtensionMm: extension, crossmemberSizeMm: crossSize,
  } = parameters;
  const rearY = frontY + diameter + gap;
  const shaftLength = width + 2 * thickness + 2 * extension;
  const rollerLength = width - 2 * clearance;
  const holes = [
    { role: 'frontShaft', centerYZMm: [frontY, rollerZ], diameterMm: bore },
    { role: 'rearShaft', centerYZMm: [rearY, rollerZ], diameterMm: bore },
    ...parameters.crossmemberCentersYZMm.map((centerYZMm, index) => ({
      role: index === 0 ? 'frontMount' : 'rearMount', centerYZMm,
      diameterMm: parameters.mountHoleDiameterMm,
    })),
    { role: 'pivot', centerYZMm: parameters.pivotCenterYZMm, diameterMm: parameters.pivotHoleDiameterMm },
  ];
  const parts = [];
  const box = (name, min, max, volumeMm3, extra = {}) => parts.push({ name, boundsMm: { min, max }, volumeMm3, ...extra });
  const plateVolume = thickness * (length * height - holes.reduce((sum, hole) => sum + Math.PI * (hole.diameterMm / 2) ** 2, 0));
  for (const side of ['left', 'right']) {
    const minX = side === 'left' ? -width / 2 - thickness : width / 2;
    box(`${side}Plate`, [minX, 0, bottom], [minX + thickness, length, bottom + height], plateVolume, { holes });
  }
  for (const [position, centerY] of [['front', frontY], ['rear', rearY]]) {
    box(`${position}Roller`, [-rollerLength / 2, centerY - diameter / 2, rollerZ - diameter / 2],
      [rollerLength / 2, centerY + diameter / 2, rollerZ + diameter / 2],
      Math.PI * (diameter ** 2 - shaftDiameter ** 2) * rollerLength / 4, { boreDiameterMm: shaftDiameter });
    box(`${position}Shaft`, [-shaftLength / 2, centerY - shaftDiameter / 2, rollerZ - shaftDiameter / 2],
      [shaftLength / 2, centerY + shaftDiameter / 2, rollerZ + shaftDiameter / 2],
      Math.PI * shaftDiameter ** 2 * shaftLength / 4);
  }
  for (const [index, [centerY, centerZ]] of parameters.crossmemberCentersYZMm.entries()) {
    box(index === 0 ? 'frontCrossmember' : 'rearCrossmember',
      [-width / 2, centerY - crossSize / 2, centerZ - crossSize / 2],
      [width / 2, centerY + crossSize / 2, centerZ + crossSize / 2], width * crossSize ** 2);
  }
  const coral = benchmark.coralReference;
  box('coralReference', [-coral.lengthMm / 2, coral.centerYMm - coral.outerDiameterMm / 2, coral.centerZMm - coral.outerDiameterMm / 2],
    [coral.lengthMm / 2, coral.centerYMm + coral.outerDiameterMm / 2, coral.centerZMm + coral.outerDiameterMm / 2],
    Math.PI * (coral.outerDiameterMm ** 2 - coral.innerDiameterMm ** 2) * coral.lengthMm / 4,
    { boreDiameterMm: coral.innerDiameterMm, nonBomReference: true });
  return {
    evidence: 'Analytic contract only; not compiled or measured in Onshape', variant, parameters,
    rearRollerYMm: rearY, clearRollerGapMm: gap, rollerLengthMm: rollerLength,
    shaftLengthMm: shaftLength, expectedSolidCount: parts.length, parts,
  };
}