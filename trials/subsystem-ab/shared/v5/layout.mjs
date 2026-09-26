export const defaults = Object.freeze({
  mouthWidth: 500, coralDiameter: 114.3, coralLength: 301.625,
  rollerDiameter: 127, coreDiameter: 80, bankGap: 10,
  compressionLimit: 8, preloadCompression: 7, frontFloat: 30,
  toeY: -350, crestY: -110, deckHeight: 180, plateThickness: 4,
  transferY: 0, receiverY: 465, rollerY: [-387, -308, -240, -171, -77],
  frontBaseZ: 169, mouthOffset: 0, orienterEntryY: 30, orienterEntryX: 180,
  orienterRadius: 35, orienterCoreRadius: 12.7,
});

export const datums = Object.freeze({
  units: 'mm', chassis: { x: [-350, 350], y: [0, 760] },
  bumper: { x: [-435, 435], y: [-85, 0], z: [45, 165] },
  startingPerimeter: 2920, startingPerimeterLimit: 3048,
  startingHeightLimit: 1066.8, extensionLimit: 457.2,
  source: '../../../../research/2025-coral/rules.json',
});

export function guideSegments(parameters = defaults) {
  return [
    { id: 'floor', start: [-1000, 0], end: [parameters.toeY, 0], reference: true },
    { id: 'ramp', start: [parameters.toeY, 0], end: [parameters.crestY, parameters.deckHeight] },
    { id: 'deck', start: [parameters.crestY, parameters.deckHeight], end: [680, parameters.deckHeight] },
  ];
}

export function supportAt(longitudinal, yawDegrees, parameters = defaults) {
  const radius = parameters.coralDiameter / 2;
  const yaw = yawDegrees * Math.PI / 180;
  const axialHalf = parameters.coralLength / 2 * Math.abs(Math.cos(yaw));
  const radialHalf = radius * Math.abs(Math.sin(yaw));
  let support = { z: -Infinity, segment: null, point: null };
  for (const segment of guideSegments(parameters)) {
    const slope = (segment.end[1] - segment.start[1]) / (segment.end[0] - segment.start[0]);
    const lower = Math.max(segment.start[0], longitudinal - axialHalf - radialHalf);
    const upper = Math.min(segment.end[0], longitudinal + axialHalf + radialHalf);
    if (upper < lower) continue;
    const unconstrained = longitudinal + Math.sign(slope) * axialHalf +
      slope * radialHalf ** 2 / Math.hypot(radius, slope * radialHalf);
    const contactY = Math.max(lower, Math.min(upper, unconstrained));
    const radialDistance = Math.max(0, Math.abs(contactY - longitudinal) - axialHalf);
    const radialZ = radialHalf < 1e-9 ? radius :
      radius * Math.sqrt(Math.max(0, 1 - (radialDistance / radialHalf) ** 2));
    const guideZ = segment.start[1] + slope * (contactY - segment.start[0]);
    const height = guideZ + radialZ;
    if (height > support.z) support = { z: height, segment: segment.id, point: [contactY, guideZ] };
  }
  return { y: longitudinal, ...support };
}

export function supportedPath(parameters = defaults, yaw = 90, spacing = 0.5) {
  const samples = [];
  for (let longitudinal = -450; longitudinal <= parameters.transferY + 1e-8; longitudinal += spacing) {
    samples.push(supportAt(longitudinal, yaw, parameters));
  }
  return samples;
}

export function makeRollers(parameters = defaults) {
  const path = supportedPath(parameters);
  const radius = parameters.rollerDiameter / 2;
  const loadedDistance = parameters.coralDiameter / 2 + radius - parameters.compressionLimit;
  return parameters.rollerY.map((longitudinal, index) => {
    const fixedZ = Math.max(...path.filter(sample => Math.abs(sample.y - longitudinal) <= loadedDistance)
      .map(sample => sample.z + Math.sqrt(Math.max(0, loadedDistance ** 2 - (sample.y - longitudinal) ** 2))));
    return {
      id: `pickup_${index + 1}`, y: longitudinal, z: index === 0 ? parameters.frontBaseZ : fixedZ,
      radius, coreRadius: parameters.coreDiameter / 2, floating: index === 0,
      x: index % 2 === 0 ? [-parameters.mouthWidth / 2, -parameters.bankGap / 2] :
        [parameters.bankGap / 2, parameters.mouthWidth / 2],
      axis: [1, 0, 0], material: 'CUSTOM_TUBE_AND_RUBBER_NOT_COTS',
    };
  });
}

export function entryContacts(sample, parameters = defaults) {
  return [-1, 1].map(side => {
    const axialHalf = parameters.coralLength / 2;
    const radius = parameters.coralDiameter / 2;
    const deltaX = Math.max(0, Math.abs(side * parameters.orienterEntryX - parameters.mouthOffset) - axialHalf);
    const deltaY = Math.max(0, Math.abs(sample.y - parameters.orienterEntryY) - radius);
    const distance = Math.hypot(deltaX, deltaY);
    const compression = parameters.orienterRadius - distance;
    return { roller: `orienter_entry_${side < 0 ? 'left' : 'right'}`,
      compression, hardClearance: distance - parameters.orienterCoreRadius,
      active: compression > 1e-6 && sample.z >= parameters.deckHeight && sample.z <= parameters.deckHeight + 140 };
  });
}

export function evaluateContact(parameters = defaults) {
  const radius = parameters.coralDiameter / 2;
  const rollers = makeRollers(parameters);
  const loadedDistance = radius + parameters.rollerDiameter / 2 - parameters.preloadCompression;
  const samples = supportedPath(parameters).map(sample => {
    const contacts = rollers.map(roller => {
      const deltaY = sample.y - roller.y;
      const requestedFloat = roller.floating && Math.abs(deltaY) < loadedDistance ?
        Math.max(0, sample.z + Math.sqrt(loadedDistance ** 2 - deltaY ** 2) - roller.z) : 0;
      const float = Math.min(parameters.frontFloat, requestedFloat);
      const centerZ = roller.z + float;
      const distance = Math.hypot(deltaY, sample.z - centerZ);
      const compression = radius + roller.radius - distance;
      const coralX = [parameters.mouthOffset - parameters.coralLength / 2,
        parameters.mouthOffset + parameters.coralLength / 2];
      const axialOverlap = Math.min(coralX[1], roller.x[1]) - Math.max(coralX[0], roller.x[0]);
      return {
        roller: roller.id, compression, float, requestedFloat, centerZ,
        hardClearance: distance - radius - roller.coreRadius,
        opposingDownward: (centerZ - sample.z) / distance, axialOverlap,
        active: compression > 1e-6 && axialOverlap > 0 && centerZ > sample.z,
      };
    });
    const bumperY = Math.max(datums.bumper.y[0], Math.min(datums.bumper.y[1], sample.y));
    const bumperZ = Math.max(datums.bumper.z[0], Math.min(datums.bumper.z[1], sample.z));
    const orienterContacts = entryContacts(sample, parameters);
    return {
      ...sample, contacts, orienterContacts,
      driven: contacts.some(contact => contact.active) || orienterContacts.every(contact => contact.active),
      bumperClearance: Math.hypot(sample.y - bumperY, sample.z - bumperZ) - radius,
    };
  });
  const firstContact = samples.findIndex(sample => sample.driven);
  const acquired = samples.slice(firstContact < 0 ? 0 : firstContact);
  const gaps = [];
  for (const sample of acquired) {
    if (sample.driven) continue;
    const lastGap = gaps.at(-1);
    if (lastGap && Math.abs(lastGap.endY + 0.5 - sample.y) < 1e-7) lastGap.endY = sample.y;
    else gaps.push({ startY: sample.y, endY: sample.y });
  }
  const flatHalfSpan = Math.sqrt((radius + parameters.rollerDiameter / 2) ** 2 -
    (radius + parameters.rollerDiameter / 2 - parameters.compressionLimit) ** 2);
  return {
    parameters, datums, rollers, guide: guideSegments(parameters), samples, gaps,
    acquiredAtY: firstContact < 0 ? null : samples[firstContact].y,
    minimumBumperClearance: Math.min(...acquired.map(sample => sample.bumperClearance)),
    maximumCompression: Math.max(...samples.flatMap(sample => sample.contacts.map(contact => contact.compression))),
    minimumCoreClearance: Math.min(...samples.flatMap(sample => sample.contacts.map(contact => contact.hardClearance))),
    maximumRequiredFloat: Math.max(...samples.flatMap(sample => sample.contacts.map(contact => contact.requestedFloat))),
    flatBankEquation: { halfSpan: flatHalfSpan, maxPitch: 2 * flatHalfSpan,
      fullWidthMinimumPitch: parameters.rollerDiameter,
      explanation: '2*sqrt((r+R)^2-(r+R-c)^2); axial staggering is necessary for overlapping projected contact at this compression.' },
    orientationScope: { verifiedSideYawDeg: 90, arbitraryEntry: 'UNVERIFIED',
      note: 'Support solver accepts yaw, but roller contact is exact only for the crosswise, horizontal cylinder. No prescribed yaw trajectory is called a motion proof.' },
  };
}