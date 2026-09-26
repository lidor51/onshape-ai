import * as THREE from '../whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {axle, sidePlate, palette} from '../whole-robot-concepts/mechanisms/primitives.mjs';
import {placePoint, unplacePoint} from './mounts.mjs';

export const dimensions = {
  coralLength: 301.625, coralDiameter: 114.3, coralBore: 101.6,
  compression: 3, clearance: 5, extensionLimit: 457.2,
  chassisWidth: 700, chassisLength: 760, bumperTop: 165,
  receiver: [0, 430, 281.15], pivot: [0, 80, 225], foldDegrees: 135,
  bankSpan: [[-75, -2.5], [2.5, 75]], bankRows: [30, 86, 142, 198, 254, 310],
  bankRadius: 25, bankHeight: 197.5, orientCenter: [0, 190, 281.15],
};

export const definition = {
  id: 'A', name: 'Split-belt differential feed: local geometry trial',
  ancestry: ['01', '09'], dimensions,
  states: ['acquire', 'capture', 'transfer', 'handoff', 'stow'],
  limitations: [
    'FAIL until all measured gates pass; commanded rotation is contact feasibility, not physics.',
    'Only horizontal crosswise yaw90 entry is attempted; other yaws are rejection screens, not accepted capability.',
    'Continuous working belts evolve 01 pickup and 09 independently driven split banks; not a retained moving carrier.',
    '3 mm rubber indentation is a geometric ceiling, not friction, preload, load or force validation.',
    'No encoder or presence sensor establishes coral yaw. Passive guides do not establish self-centering.',
    'Only the nose folds. Receiver-absent hold, loaded folding, shafts and left mounting have separate gates.',
  ],
};

export const pickup = [
  {id: 'pickup', y: -420, z: 33, radius: 25, span: [-250, 250]},
  {id: 'crest', y: -180, z: 197.5, radius: 25, span: [-250, 250]},
  {id: 'tail', y: 0, z: 197.5, radius: 25, span: [-250, 250]},
];

const radians = degrees => degrees * Math.PI / 180;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const mix = (first, second, fraction) => first + (second - first) * fraction;
const radius = dimensions.coralDiameter / 2;
const halfLength = dimensions.coralLength / 2;

export const beltDesign = {
  thickness: 3, pulleyRadius: 25, outsideRadius: 28, gap: 111.3,
  front: [-420, 33], crest: [-180, 197.5], tail: [0, 197.5],
  noseSpan: [[-165, -80], [80, 165]],
  entryYaw: [90, 90], entryAcross: [-10, 10], indexAcross: [-10, 10],
  frontStop: 10, backStop: 370, fenceInside: 180, roofInside: 410,
};

export function beltRoute() {
  const slope = Math.atan2(beltDesign.crest[1] - beltDesign.front[1], beltDesign.crest[0] - beltDesign.front[0]);
  const reach = beltDesign.outsideRadius + radius - dimensions.compression / 2;
  const entranceAngle = Math.PI - Math.asin((radius - beltDesign.front[1]) / reach);
  const normalAngle = Math.PI / 2 + slope;
  return {slope, reach, entranceAngle, normalAngle};
}

export function beltPath(progress) {
  const {reach, entranceAngle, normalAngle} = beltRoute();
  const arc = (center, angle) => [center[0] + reach * Math.cos(angle), center[1] + reach * Math.sin(angle)];
  if (progress <= 0.25) return arc(beltDesign.front, mix(entranceAngle, normalAngle, progress * 4));
  if (progress <= 0.65) {
    const fraction = (progress - 0.25) / 0.4;
    return arc(beltDesign.front.map((value, axis) => mix(value, beltDesign.crest[axis], fraction)), normalAngle);
  }
  if (progress <= 0.8) return arc(beltDesign.crest, mix(normalAngle, Math.PI / 2, (progress - 0.65) / 0.15));
  return [mix(beltDesign.crest[0], beltDesign.tail[0], (progress - 0.8) / 0.2), beltDesign.crest[1] + reach];
}

export function finiteTubePointGap(pose, point) {
  const yaw = radians(pose.yaw), pitch = radians(pose.pitch ?? 0);
  const axis = [Math.sin(yaw) * Math.cos(pitch), Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch)];
  const delta = point.map((value, coordinate) => value - pose.center[coordinate]);
  const along = delta.reduce((sum, value, coordinate) => sum + value * axis[coordinate], 0);
  const axial = Math.abs(along) - halfLength;
  const radial = Math.sqrt(Math.max(0, delta.reduce((sum, value) => sum + value * value, 0) - along * along)) - radius;
  return Math.hypot(Math.max(0, axial), Math.max(0, radial)) + Math.min(0, Math.max(axial, radial));
}

export function beltSectionPoint(section, fraction) {
  if (section.kind === 'line') return section.start.map((value, axis) => mix(value, section.end[axis], fraction));
  const angle = mix(section.startAngle, section.endAngle, fraction);
  return section.center.map((value, axis) => value + section.radius * (axis ? Math.sin(angle) : Math.cos(angle)));
}

export function beltClosestGap(pose, body) {
  if (!(pose.pitch ?? 0) && body.assembly === 'fixed' && pose.center[1] >= 100 && pose.center[1] <= 490) {
    const height = body.contactSide === 'lower' ? 225.5 : 336.8;
    return coralBoxGap(pose, {minimum: [body.span[0], 30, height], maximum: [body.span[1], 560, height]});
  }
  if (Math.abs(pose.yaw - 90) < 1e-8 && !(pose.pitch ?? 0) &&
    body.span[0] <= pose.center[0] + halfLength && body.span[1] >= pose.center[0] - halfLength) {
    const point = pose.center.slice(1);
    return Math.min(...body.sections.map(section => {
      if (section.kind === 'line') return pointSegmentDistance(point, section.start, section.end);
      const angle = Math.atan2(point[1] - section.center[1], point[0] - section.center[0]);
      const lower = Math.min(section.startAngle, section.endAngle), upper = Math.max(section.startAngle, section.endAngle);
      const candidates = [section.startAngle, section.endAngle];
      for (let winding = -2; winding <= 2; winding++) if (angle + winding * 2 * Math.PI >= lower && angle + winding * 2 * Math.PI <= upper) candidates.push(angle + winding * 2 * Math.PI);
      return Math.min(...candidates.map(candidate => Math.hypot(point[0] - section.center[0] - section.radius * Math.cos(candidate),
        point[1] - section.center[1] - section.radius * Math.sin(candidate))));
    })) - radius - body.thickness / 2;
  }
  let minimum = Infinity;
  for (const section of body.sections) {
    if (!(pose.pitch ?? 0) && section.kind === 'line' && Math.abs(section.start[1] - section.end[1]) < 1e-8) {
      const bounds = {minimum: [body.span[0], Math.min(section.start[0], section.end[0]), section.start[1]],
        maximum: [body.span[1], Math.max(section.start[0], section.end[0]), section.start[1]]};
      minimum = Math.min(minimum, coralBoxGap(pose, bounds));
      continue;
    }
    const bound = section.kind === 'arc' ? section.radius : Math.hypot(...section.end.map((value, axis) => value - section.start[axis])) / 2;
    const middle = section.kind === 'arc' ? section.center : section.start.map((value, axis) => (value + section.end[axis]) / 2);
    if (Math.hypot(middle[0] - pose.center[1], middle[1] - pose.center[2]) - bound > halfLength + radius + 10) continue;
    const distance = fraction => {
      const point = beltSectionPoint(section, fraction);
      return minimizeConvex(across => finiteTubePointGap(pose, [across, ...point]), body.span[0], body.span[1], 24);
    };
    const partitions = section.kind === 'arc' ? 12 : 4;
    for (let index = 0; index < partitions; index++) minimum = Math.min(minimum,
      minimizeConvex(distance, index / partitions, (index + 1) / partitions, 24));
  }
  return minimum - body.thickness / 2;
}

export function footprint(pose) {
  const sine = Math.sin(radians(pose.yaw));
  const cosine = Math.cos(radians(pose.yaw));
  return [[-halfLength, -radius], [halfLength, -radius], [halfLength, radius], [-halfLength, radius]]
    .map(([along, across]) => [pose.center[0] + along * sine + across * cosine,
      pose.center[1] + along * cosine - across * sine]);
}

function clipPolygon(polygon, coordinate, bound, greater) {
  const result = [];
  for (let index = 0; index < polygon.length; index++) {
    const first = polygon[index];
    const second = polygon[(index + 1) % polygon.length];
    const firstInside = greater ? first[coordinate] >= bound : first[coordinate] <= bound;
    const secondInside = greater ? second[coordinate] >= bound : second[coordinate] <= bound;
    if (firstInside) result.push(first);
    if (firstInside !== secondInside) {
      const fraction = (bound - first[coordinate]) / (second[coordinate] - first[coordinate]);
      result.push(first.map((value, axis) => mix(value, second[axis], fraction)));
    }
  }
  return result;
}

function minimizeConvex(fn, lower, upper, iterations = 55) {
  const ratio = (Math.sqrt(5) - 1) / 2;
  let left = upper - ratio * (upper - lower);
  let right = lower + ratio * (upper - lower);
  let leftValue = fn(left), rightValue = fn(right);
  for (let iteration = 0; iteration < iterations; iteration++) {
    if (leftValue < rightValue) {
      upper = right; right = left; rightValue = leftValue;
      left = upper - ratio * (upper - lower); leftValue = fn(left);
    } else {
      lower = left; left = right; leftValue = rightValue;
      right = lower + ratio * (upper - lower); rightValue = fn(right);
    }
  }
  return Math.min(fn(lower), fn(upper), leftValue, rightValue);
}

export function rollerGap(pose, roll) {
  const polygon = clipPolygon(clipPolygon(footprint(pose), 0, roll.span[0], true), 0, roll.span[1], false);
  if (!polygon.length) return Infinity;
  const sine = Math.sin(radians(pose.yaw));
  const cosine = Math.cos(radians(pose.yaw));
  const lower = Math.min(...polygon.map(point => point[1]));
  const upper = Math.max(...polygon.map(point => point[1]));
  const squaredDistance = rearward => {
    const delta = rearward - pose.center[1];
    let minimum = roll.span[0] - pose.center[0], maximum = roll.span[1] - pose.center[0];
    for (const [coefficient, offset, bound] of [[sine, cosine * delta, halfLength], [cosine, -sine * delta, radius]]) {
      if (Math.abs(coefficient) > 1e-12) {
        const limits = [(-bound - offset) / coefficient, (bound - offset) / coefficient].sort((first, second) => first - second);
        minimum = Math.max(minimum, limits[0]); maximum = Math.min(maximum, limits[1]);
      }
    }
    if (minimum > maximum + 1e-7) return Infinity;
    const across = Math.abs(cosine) > 1e-12 ? clamp(sine * delta / cosine, minimum, maximum) : (minimum + maximum) / 2;
    const transverse = across * cosine - delta * sine;
    const halfHeight = Math.sqrt(Math.max(0, radius ** 2 - transverse ** 2));
    const vertical = Math.max(0, Math.abs(roll.z - pose.center[2]) - halfHeight);
    return (rearward - roll.y) ** 2 + vertical ** 2;
  };
  return Math.sqrt(minimizeConvex(squaredDistance, lower, upper)) - roll.radius;
}

export function bankRollers() {
  return dimensions.bankSpan.flatMap((span, bank) => dimensions.bankRows.map((rearward, row) => ({
    id: `bank-${bank}-${row}`, bank, y: rearward, z: dimensions.bankHeight,
    radius: dimensions.bankRadius, span,
  })));
}

export function contacts(pose, rolls = workingBelts()) {
  return rolls.map(roll => ({id: roll.id, bank: roll.bank ?? null, gap: roll.kind === 'belt' ? beltClosestGap(pose, roll) : rollerGap(pose, roll)}))
    .filter(contact => Number.isFinite(contact.gap));
}

export function probe() {
  const floor = {center: [0, -480, radius], yaw: 0};
  const centered = {center: [0, 148, dimensions.receiver[2]], yaw: 0};
  const offset = {center: [30, 148, dimensions.receiver[2]], yaw: 0};
  return {
    floorLengthwisePickupGap: rollerGap(floor, pickup[0]),
    centeredBanks: contacts(centered, bankRollers()),
    offsetBanks: contacts(offset, bankRollers()),
    pickupCircleClearances: pickup.slice(1).map((roll, index) => Math.hypot(roll.y - pickup[index].y, roll.z - pickup[index].z) - roll.radius - pickup[index].radius),
  };
}

export function poseAt(state = 'acquire', progress = 1) {
  if (!definition.states.includes(state)) throw new Error(`Unknown feed state ${state}`);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Progress must be in [0,1]');
  let center, yaw = 90, fold = 0, jaw = 0, gate = 0, cellFront = 0, cellBack = 0;
  if (state === 'acquire') center = [0, ...beltPath(progress * 0.25)];
  else if (state === 'capture') center = [0, ...beltPath(mix(0.25, 1, progress))];
  else if (state === 'transfer') {
    center = [0, mix(pickup[2].y, dimensions.orientCenter[1], Math.min(1, progress / 0.45)), dimensions.receiver[2]];
    cellFront = clamp((progress - 0.45) / 0.15, 0, 1);
    yaw = mix(90, 0, clamp((progress - 0.6) / 0.4, 0, 1));
  } else {
    const advance = state === 'stow' ? 1 : clamp((progress - 0.15) / 0.6, 0, 1);
    center = [0, mix(dimensions.orientCenter[1], dimensions.receiver[1], advance), dimensions.receiver[2]];
    yaw = 0; cellFront = 1;
    cellBack = state === 'stow' ? 1 : clamp(progress / 0.15, 0, 1);
    jaw = state === 'stow' ? 1 : clamp((progress - 0.75) / 0.15, 0, 1);
    gate = state === 'stow' ? 1 : clamp((progress - 0.9) / 0.1, 0, 1);
    fold = state === 'stow' ? dimensions.foldDegrees * progress : 0;
  }
  return {center, yaw, pitch: 0, fold, jaw, gate, cellFront, cellBack, state, progress, commandedOnly: true};
}

export function controlAt({receiver = 'ready', occupied = false, yaw = 90, cell = 'receiving'} = {}) {
  if (!['absent', 'waiting', 'ready'].includes(receiver)) throw new Error('Unknown receiver condition');
  if (!['receiving', 'retained', 'releasing'].includes(cell)) throw new Error('Unknown cell gate state');
  const enabled = receiver === 'ready';
  const gateState = enabled ? cell : 'retained';
  return {receiver, cell: gateState, feed: enabled && cell !== 'retained', orient: enabled && occupied && cell === 'retained',
    leftDrive: enabled ? 'controller-request-required' : 0, rightDrive: enabled ? 'controller-request-required' : 0,
    frontClosed: gateState !== 'receiving', backClosed: gateState !== 'releasing',
    pose: occupied ? {...poseAt('transfer', 0.6), yaw, cellFront: gateState === 'receiving' ? 0 : 1, cellBack: gateState === 'releasing' ? 1 : 0} : null,
    yawEvidence: 'External measured yaw required; commanded pose and belt encoders are not observations'};
}

function circle(id, span, rearward, up, rollRadius, assembly, role, color = palette.shaft) {
  return {id, kind: 'circle', span, center: [rearward, up], radius: rollRadius, assembly, role, color};
}

function prism(id, span, outline, assembly, role, color = palette.rail) {
  return {id, kind: 'prism', span, outline, assembly, role, color};
}

function cuboid(id, center, size, assembly, role, color) {
  const [across, rearward, up] = center, [width, length, height] = size;
  return prism(id, [across - width / 2, across + width / 2],
    [[rearward - length / 2, up - height / 2], [rearward + length / 2, up - height / 2],
      [rearward + length / 2, up + height / 2], [rearward - length / 2, up + height / 2]], assembly, role, color);
}

function turnPoint([rearward, up], degrees) {
  const angle = -radians(degrees), cosine = Math.cos(angle), sine = Math.sin(angle);
  const deltaRearward = rearward - dimensions.pivot[1], deltaUp = up - dimensions.pivot[2];
  return [dimensions.pivot[1] + cosine * deltaRearward - sine * deltaUp,
    dimensions.pivot[2] + sine * deltaRearward + cosine * deltaUp];
}

function lineSection(start, end) { return {kind: 'line', start, end}; }
function arcSection(center, arcRadius, startAngle, endAngle) { return {kind: 'arc', center, radius: arcRadius, startAngle, endAngle}; }

function loopSections(centers, offset) {
  const sections = [];
  for (let index = 0; index < centers.length; index++) {
    const start = centers[index], end = centers[(index + 1) % centers.length], previous = centers[(index + centers.length - 1) % centers.length];
    const normal = Math.atan2(end[1] - start[1], end[0] - start[0]) + Math.PI / 2;
    let before = Math.atan2(start[1] - previous[1], start[0] - previous[0]) + Math.PI / 2;
    while (before < normal - 1e-10) before += 2 * Math.PI;
    sections.push(arcSection(start, offset, before, normal));
    const shift = point => [point[0] + offset * Math.cos(normal), point[1] + offset * Math.sin(normal)];
    sections.push(lineSection(shift(start), shift(end)));
  }
  return sections;
}

function sectionPolygon(section, thickness) {
  if (section.kind === 'line') {
    const direction = Math.atan2(section.end[1] - section.start[1], section.end[0] - section.start[0]) + Math.PI / 2;
    return [[section.start, -1], [section.end, -1], [section.end, 1], [section.start, 1]].map(([point, side]) =>
      [point[0] + side * thickness / 2 * Math.cos(direction), point[1] + side * thickness / 2 * Math.sin(direction)]);
  }
  const count = Math.max(2, Math.ceil(Math.abs(section.endAngle - section.startAngle) / radians(5)));
  return [1, -1].flatMap(side => Array.from({length: count + 1}, (_, index) => {
    const fraction = side === 1 ? index / count : 1 - index / count;
    return beltSectionPoint({...section, radius: section.radius + side * thickness / 2}, fraction);
  }));
}

function belt(id, span, sections, assembly, bank, contactSide) {
  return {id, kind: 'belt', span, sections, thickness: beltDesign.thickness, assembly, bank, contactSide,
    role: 'powered', color: contactSide === 'upper' ? 0x477f85 : bank ? 0x5d9a95 : 0xc29b4b};
}

export function workingBelts() {
  const lower = loopSections([beltDesign.front, beltDesign.crest, beltDesign.tail], 26.5);
  const {normalAngle} = beltRoute();
  const upperRadius = beltDesign.outsideRadius + beltDesign.gap + beltDesign.thickness / 2;
  const start = beltDesign.front.map((value, axis) => mix(value, beltDesign.crest[axis], 0.5));
  const offsetPoint = (point, offset, angle) => point.map((value, axis) => value + offset * (axis ? Math.sin(angle) : Math.cos(angle)));
  const upper = [lineSection(offsetPoint(start, upperRadius, normalAngle), offsetPoint(beltDesign.crest, upperRadius, normalAngle)),
    arcSection(beltDesign.crest, upperRadius, normalAngle, Math.PI / 2),
    lineSection(offsetPoint(beltDesign.crest, upperRadius, Math.PI / 2), offsetPoint(beltDesign.tail, upperRadius, Math.PI / 2)),
    arcSection(offsetPoint(beltDesign.tail, upperRadius + 26.5, Math.PI / 2), 26.5, -Math.PI / 2, Math.PI / 2),
    lineSection(offsetPoint(beltDesign.tail, upperRadius + 53, Math.PI / 2), offsetPoint(beltDesign.crest, upperRadius + 53, Math.PI / 2)),
    arcSection(beltDesign.crest, upperRadius + 53, Math.PI / 2, normalAngle),
    lineSection(offsetPoint(beltDesign.crest, upperRadius + 53, normalAngle), offsetPoint(start, upperRadius + 53, normalAngle)),
    arcSection(offsetPoint(start, upperRadius + 26.5, normalAngle), 26.5, normalAngle, normalAngle + Math.PI)];
  return dimensions.bankSpan.flatMap((span, bank) => [
    belt(`nose-lower-${bank}`, beltDesign.noseSpan[bank], lower, 'nose', bank, 'lower'),
    belt(`nose-upper-${bank}`, beltDesign.noseSpan[bank], upper, 'nose', bank, 'upper'),
    belt(`bank-lower-${bank}`, span, loopSections([[30, dimensions.bankHeight], [560, dimensions.bankHeight]], 26.5), 'fixed', bank, 'lower'),
    belt(`bank-upper-${bank}`, span, loopSections([[30, 364.8], [560, 364.8]], 26.5), 'fixed', bank, 'upper'),
  ]);
}

export function bodiesAt(state = 'acquire', progress = 1, overridePose = null) {
  const pose = overridePose ?? poseAt(state, progress), bodies = [];
  bodies.push(...workingBelts());
  for (const roll of pickup) {
    for (const [segment, span] of beltDesign.noseSpan.entries()) {
      bodies.push(circle(`${roll.id}-pulley-${segment}`, span, roll.y, roll.z, roll.radius, 'nose', 'pulley', palette.rubber));
    }
    if (roll.id === 'tail') for (const [segment, span] of beltDesign.noseSpan.entries()) bodies.push(circle(`${roll.id}-shaft-${segment}`, span, roll.y, roll.z, 6.35, 'nose', 'shaft'));
    else bodies.push(circle(`${roll.id}-shaft`, [-276, 276], roll.y, roll.z, 6.35, 'nose', 'shaft'));
  }
  const noseOutline = [[-440, 18], [-440, 48], [-185, 220], [80, 242],
    [94, 225], [80, 208], [-175, 172], [-405, 18]];
  for (const side of [-1, 1]) {
    bodies.push(prism(`nose-plate-${side}`, [side * 270 - 3, side * 270 + 3], noseOutline, 'nose', 'plate', palette.plate));
    bodies.push(circle(`pivot-stub-${side}`, [side * 273 - 13, side * 273 + 13], 80, 225, 9, 'fixed', 'mount'));
    bodies.push(cuboid(`pivot-post-${side}`, [side * 270, 80, 173], [12, 18, 104], 'fixed', 'mount', palette.frame));
  }
  for (const roll of bankRollers()) {
    bodies.push(circle(roll.id, roll.span, roll.y, roll.z, roll.radius, 'fixed', 'pulley', palette.rubber));
    bodies.push(circle(`${roll.id}-upper`, roll.span, roll.y, 364.8, roll.radius, 'fixed', 'pulley', palette.rubber));
    const shaftSpan = roll.bank ? [2, 184] : [-184, -2];
    bodies.push(circle(`${roll.id}-shaft`, shaftSpan, roll.y, roll.z, 5, 'fixed', 'shaft'));
  }
  for (const side of [-1, 1]) {
    bodies.push(cuboid(`bank-bearing-rail-${side}`, [side * 180, 171, 197], [8, 332, 24], 'fixed', 'rail', palette.plate));
    bodies.push(cuboid(`outer-fence-${side}`, [side * 183, 190, 285], [6, 366, 128], 'fixed', 'guide', palette.rail));
    bodies.push(cuboid(`jaw-pad-${side}`, [side * (60.15 + 20 * (1 - pose.jaw)), 480, 281.15], [12, 80, 62], 'receiver', 'jaw', palette.rubber));
    bodies.push(cuboid(`jaw-slide-${side}`, [side * 130, 480, 245], [104, 18, 12], 'receiver', 'rail', palette.frame));
    bodies.push(cuboid(`receiver-side-plate-${side}`, [side * 181, 430, 280], [6, 338, 142], 'receiver', 'plate', palette.plate));
    bodies.push(cuboid(`bank-front-post-${side}`, [side * 180, 25, 160], [8, 12, 50], 'fixed', 'support', palette.frame));
    bodies.push(cuboid(`bank-back-post-${side}`, [side * 180, 330, 170], [8, 12, 30], 'fixed', 'support', palette.frame));
  }
  bodies.push(cuboid('bank-chassis-crossmember', [0, 330, 145], [650, 20, 20], 'fixed', 'support', palette.frame));
  bodies.push(cuboid('cell-front-gate', [0, beltDesign.frontStop, mix(435, 285, pose.cellFront)], [360, 6, 128], 'cell', 'gate', palette.plate));
  bodies.push(cuboid('cell-back-gate', [0, beltDesign.backStop, mix(285, 435, pose.cellBack)], [360, 6, 128], 'cell', 'gate', palette.plate));
  bodies.push(cuboid('cell-roof', [0, 190, beltDesign.roofInside + 3], [360, 366, 6], 'fixed', 'guide', palette.rail));
  bodies.push(cuboid('receiver-back-stop', [0, 595, 285], [368, 6, 124], 'receiver', 'stop', palette.plate));
  bodies.push(cuboid('receiver-front-gate', [0, 265, mix(420, 285, pose.gate)], [346, 6, 124], 'receiver', 'gate', palette.plate));
  bodies.push(cuboid('receiver-roof', [0, 430, 413], [368, 320, 6], 'receiver', 'guide', palette.rail));
  bodies.push(cuboid('bumper-front', [0, -42.5, 105], [870, 85, 120], 'robot', 'bumper', palette.bumper));
  bodies.push(cuboid('bumper-back', [0, 802.5, 105], [870, 85, 120], 'robot', 'bumper', palette.bumper));
  for (const side of [-1, 1]) {
    bodies.push(cuboid(`bumper-side-${side}`, [side * 392.5, 380, 105], [85, 760, 120], 'robot', 'bumper', palette.bumper));
    bodies.push(cuboid(`frame-side-${side}`, [side * 325, 380, 110], [50, 760, 50], 'robot', 'frame', palette.frame));
  }
  bodies.push(cuboid('frame-front', [0, 25, 110], [600, 50, 50], 'robot', 'frame', palette.frame));
  bodies.push(cuboid('frame-back', [0, 735, 110], [600, 50, 50], 'robot', 'frame', palette.frame));
  return bodies.map(body => body.assembly !== 'nose' ? body : {
    ...body, ...(body.kind === 'belt' ? {sections: body.sections.map(section => section.kind === 'line' ?
      {...section, start: turnPoint(section.start, pose.fold), end: turnPoint(section.end, pose.fold)} :
      {...section, center: turnPoint(section.center, pose.fold), startAngle: section.startAngle - radians(pose.fold), endAngle: section.endAngle - radians(pose.fold)})} :
      body.kind === 'circle' ? {center: turnPoint(body.center, pose.fold)} : {outline: body.outline.map(point => turnPoint(point, pose.fold))}),
  });
}

function pointSegmentDistance(point, start, end) {
  const delta = end.map((value, axis) => value - start[axis]);
  const square = delta.reduce((sum, value) => sum + value ** 2, 0);
  const fraction = square ? clamp(delta.reduce((sum, value, axis) => sum + value * (point[axis] - start[axis]), 0) / square, 0, 1) : 0;
  return Math.hypot(...point.map((value, axis) => value - start[axis] - fraction * delta[axis]));
}

function insidePolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const current = polygon[index], last = polygon[previous];
    if ((current[1] > point[1]) !== (last[1] > point[1]) &&
      point[0] < (last[0] - current[0]) * (point[1] - current[1]) / (last[1] - current[1]) + current[0]) inside = !inside;
  }
  return inside;
}

function pointPolygonGap(point, polygon) {
  const distance = Math.min(...polygon.map((start, index) => pointSegmentDistance(point, start, polygon[(index + 1) % polygon.length])));
  return insidePolygon(point, polygon) ? -distance : distance;
}

function segmentCross(first, second, third, fourth) {
  const orientation = (start, end, point) => (end[0] - start[0]) * (point[1] - start[1]) - (end[1] - start[1]) * (point[0] - start[0]);
  return orientation(first, second, third) * orientation(first, second, fourth) < 0 &&
    orientation(third, fourth, first) * orientation(third, fourth, second) < 0;
}

function polygonGap(first, second) {
  if (first.some(point => insidePolygon(point, second)) || second.some(point => insidePolygon(point, first))) return -1e-6;
  let minimum = Infinity;
  for (let index = 0; index < first.length; index++) {
    const start = first[index], end = first[(index + 1) % first.length];
    for (let other = 0; other < second.length; other++) {
      const third = second[other], fourth = second[(other + 1) % second.length];
      if (segmentCross(start, end, third, fourth)) return -1e-6;
      minimum = Math.min(minimum, pointSegmentDistance(start, third, fourth), pointSegmentDistance(end, third, fourth),
        pointSegmentDistance(third, start, end), pointSegmentDistance(fourth, start, end));
    }
  }
  return minimum;
}

export function bodyGap(first, second) {
  const firstBounds = bodyBounds(first), secondBounds = bodyBounds(second);
  const bound = Math.hypot(...[0, 1, 2].map(axis => Math.max(0, firstBounds.minimum[axis] - secondBounds.maximum[axis], secondBounds.minimum[axis] - firstBounds.maximum[axis])));
  if (bound > 5) return bound;
  if (first.kind === 'belt') return Math.min(...first.sections.map(section => bodyGap({...first, kind: 'prism', outline: sectionPolygon(section, first.thickness)}, second)));
  if (second.kind === 'belt') return bodyGap(second, first);
  const axial = Math.max(second.span[0] - first.span[1], first.span[0] - second.span[1]);
  let planar;
  if (first.kind === 'circle' && second.kind === 'circle') planar = Math.hypot(...first.center.map((value, axis) => value - second.center[axis])) - first.radius - second.radius;
  else if (first.kind === 'circle') planar = pointPolygonGap(first.center, second.outline) - first.radius;
  else if (second.kind === 'circle') planar = pointPolygonGap(second.center, first.outline) - second.radius;
  else planar = polygonGap(first.outline, second.outline);
  return axial <= 0 && planar <= 0 ? Math.max(axial, planar) : Math.hypot(Math.max(0, axial), Math.max(0, planar));
}

export function bodyBounds(body) {
  if (body.kind === 'belt') {
    const points = body.sections.flatMap(section => {
      const fractions = [0, 1];
      if (section.kind === 'arc') for (let quadrant = -12; quadrant <= 12; quadrant++) {
        const fraction = (quadrant * Math.PI / 2 - section.startAngle) / (section.endAngle - section.startAngle);
        if (fraction > 0 && fraction < 1) fractions.push(fraction);
      }
      return fractions.map(fraction => beltSectionPoint(section, fraction));
    });
    return {minimum: [body.span[0], ...[0, 1].map(axis => Math.min(...points.map(point => point[axis])) - body.thickness / 2)],
      maximum: [body.span[1], ...[0, 1].map(axis => Math.max(...points.map(point => point[axis])) + body.thickness / 2)]};
  }
  const rearward = body.kind === 'circle' ? [body.center[0] - body.radius, body.center[0] + body.radius] : body.outline.map(point => point[0]);
  const vertical = body.kind === 'circle' ? [body.center[1] - body.radius, body.center[1] + body.radius] : body.outline.map(point => point[1]);
  return {minimum: [body.span[0], Math.min(...rearward), Math.min(...vertical)], maximum: [body.span[1], Math.max(...rearward), Math.max(...vertical)]};
}

export function robotInMount(mount = 'front') {
  return bodiesAt().filter(body => body.assembly === 'robot').map(body => {
    const bounds = bodyBounds(body);
    const points = [unplacePoint(bounds.minimum, mount), unplacePoint(bounds.maximum, mount)];
    const minimum = [0, 1, 2].map(axis => Math.min(...points.map(point => point[axis])));
    const maximum = [0, 1, 2].map(axis => Math.max(...points.map(point => point[axis])));
    return cuboid(body.id, minimum.map((value, axis) => (value + maximum[axis]) / 2),
      minimum.map((value, axis) => maximum[axis] - value), body.assembly, body.role, body.color);
  });
}

export function foldBounds(body) {
  if (body.assembly !== 'nose') return bodyBounds(body);
  if (body.kind === 'belt') {
    const bounds = body.sections.flatMap(section => section.kind === 'arc' ?
      [foldBounds({...body, kind: 'circle', center: section.center, radius: section.radius + body.thickness / 2})] :
      [foldBounds({...body, kind: 'prism', outline: sectionPolygon(section, body.thickness)})]);
    return {minimum: [0, 1, 2].map(axis => Math.min(...bounds.map(bound => bound.minimum[axis]))),
      maximum: [0, 1, 2].map(axis => Math.max(...bounds.map(bound => bound.maximum[axis])))};
  }
  const points = body.kind === 'circle' ? [body.center] : body.outline;
  const extrema = [[], []];
  for (const point of points) {
    const delta = [point[0] - dimensions.pivot[1], point[1] - dimensions.pivot[2]];
    for (const coordinate of [0, 1]) {
      const coefficientCos = delta[coordinate], coefficientSin = coordinate ? -delta[0] : delta[1];
      const angles = [0, radians(dimensions.foldDegrees)];
      const extremum = Math.atan2(coefficientSin, coefficientCos);
      for (let winding = -2; winding <= 2; winding++) {
        const angle = extremum + winding * Math.PI;
        if (angle >= 0 && angle <= radians(dimensions.foldDegrees)) angles.push(angle);
      }
      extrema[coordinate].push(...angles.map(angle => dimensions.pivot[coordinate + 1] + coefficientCos * Math.cos(angle) + coefficientSin * Math.sin(angle)));
    }
  }
  const inflation = body.kind === 'circle' ? body.radius : 0;
  return {minimum: [body.span[0], ...extrema.map(values => Math.min(...values) - inflation)],
    maximum: [body.span[1], ...extrema.map(values => Math.max(...values) + inflation)]};
}

export function coralBoxGap(pose, bounds) {
  let polygon = footprint(pose);
  for (const axis of [0, 1]) {
    polygon = clipPolygon(clipPolygon(polygon, axis, bounds.minimum[axis], true), axis, bounds.maximum[axis], false);
    if (!polygon.length) return Infinity;
  }
  const sine = Math.sin(radians(pose.yaw)), cosine = Math.cos(radians(pose.yaw));
  const transverse = polygon.map(point => (point[0] - pose.center[0]) * cosine - (point[1] - pose.center[1]) * sine);
  const lower = Math.min(...transverse), upper = Math.max(...transverse);
  const closest = lower <= 0 && upper >= 0 ? 0 : Math.min(Math.abs(lower), Math.abs(upper));
  const height = Math.sqrt(Math.max(0, radius ** 2 - closest ** 2));
  return Math.max(bounds.minimum[2] - pose.center[2] - height, pose.center[2] - height - bounds.maximum[2]);
}

export function coralBodyGap(pose, body) {
  if (body.kind === 'belt') return beltClosestGap(pose, body);
  if (body.kind === 'circle') return rollerGap(pose, {span: body.span, y: body.center[0], z: body.center[1], radius: body.radius});
  if (Math.abs(pose.yaw - 90) < 1e-8) {
    const axial = Math.max(body.span[0] - pose.center[0] - halfLength, pose.center[0] - halfLength - body.span[1]);
    const planar = pointPolygonGap([pose.center[1], pose.center[2]], body.outline) - radius;
    return axial <= 0 && planar <= 0 ? Math.max(axial, planar) : Math.hypot(Math.max(0, axial), Math.max(0, planar));
  }
  if (Math.abs(pose.yaw) < 1e-8) {
    const lateral = Math.max(0, body.span[0] - pose.center[0], pose.center[0] - body.span[1]);
    if (lateral > radius) return Infinity;
    const height = Math.sqrt(radius ** 2 - lateral ** 2);
    return polygonGap([[pose.center[1] - halfLength, pose.center[2] - height], [pose.center[1] + halfLength, pose.center[2] - height],
      [pose.center[1] + halfLength, pose.center[2] + height], [pose.center[1] - halfLength, pose.center[2] + height]], body.outline);
  }
  return coralBoxGap(pose, bodyBounds(body));
}

function contactSummary(pose, bodies) {
  const active = [], excessive = [];
  for (const body of bodies.filter(body => body.role === 'powered')) {
    const gap = coralBodyGap(pose, body);
    if (gap < -dimensions.compression - 1e-5) excessive.push({id: body.id, gap});
    if (gap <= 1e-5 && gap >= -dimensions.compression - 1e-5) active.push({id: body.id, gap});
  }
  const stations = new Set(active.map(contact => contact.id.replace(/-rubber-[01]$/, '')));
  return {active, excessive, stations: stations.size};
}

function gate(name, value, minimum, details = {}) {
  return {name, status: Number.isFinite(value) && value >= minimum - 1e-7 ? 'PASS' : 'FAIL', value, minimum, ...details};
}

function cleanNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value * 1e6) / 1e6 : null;
  if (Array.isArray(value)) return value.map(cleanNumber);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cleanNumber(entry)]));
  return value;
}

export function cylinderExtents(pose) {
  const yaw = radians(pose.yaw), pitch = radians(pose.pitch ?? 0);
  const axis = [Math.sin(yaw) * Math.cos(pitch), Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch)];
  return axis.map(component => halfLength * Math.abs(component) + radius * Math.sqrt(Math.max(0, 1 - component * component)));
}

export function cellWorkspace(pose) {
  const extent = cylinderExtents(pose);
  const bounds = [[-beltDesign.fenceInside, beltDesign.fenceInside], [beltDesign.frontStop + 3, beltDesign.backStop - 3], [225.5, beltDesign.roofInside]];
  return bounds.map(([lower, upper], axis) => [pose.center[axis] - extent[axis] - lower, upper - pose.center[axis] - extent[axis]]);
}

export function escapeScreen(yaw = 90, openBack = false) {
  const walls = bodiesAt('transfer', 0.6).filter(body => ['cell-front-gate', 'cell-back-gate', 'outer-fence--1', 'outer-fence-1'].includes(body.id))
    .filter(body => !(openBack && body.id === 'cell-back-gate'));
  const queue = [[0, 0]], visited = new Set(['0,0']), step = 10;
  for (let head = 0; head < queue.length; head++) {
    const point = queue[head];
    if (Math.abs(point[0]) >= 240 || Math.abs(point[1]) >= 360) return {escaped: true, visited: visited.size};
    for (const delta of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const next = point.map((value, axis) => value + delta[axis]), key = next.join(',');
      if (visited.has(key)) continue;
      const pose = {center: [next[0], dimensions.orientCenter[1] + next[1], 281.15], yaw};
      if (walls.some(body => coralBodyGap(pose, body) < 0)) continue;
      visited.add(key); queue.push(next);
    }
  }
  return {escaped: false, visited: visited.size};
}

export const firstFailedResult = {
  schema: 'intake-finalists/feed/1', status: 'FAIL', passing: 17, failing: 5,
  floorEntry: {passing: 5, cases: 230, lengthwiseInterferenceMm: 52.3},
  zeroDrivePoses: 38, noseBridgeDeadMm: 123.004546, bankPitchDeadMm: 12.004546,
  wideBanks: {passing: 1074, cases: 1150}, receiverAbsentHold: false,
};

export const repairHistory = [{attempt: 1, change: 'Continuous opposed belt loops with original widths; enclosed fixed orienter', status: 'FAIL',
  zeroDrivePoses: 0, narrowIndexPassing: 807, narrowIndexCases: 819, indexReserveMm: -0.785417,
  foldExtensionBoundMm: 483.596863, stowedInsetMm: -38, opposedSurfacesAtEntry: 1},
  {attempt: 2, change: 'Interleave nose and fixed lanes; 5 mm center slot; independent tail stubs', status: 'FAIL',
    zeroDrivePoses: 0, narrowIndexPassing: 819, narrowIndexCases: 819, indexReserveMm: 0.116231,
    foldExtensionBoundMm: 483.596863, stowedInsetMm: -38, loadedFoldGapMm: 21.35}];

export function evaluate() {
  const gates = [], sampleCount = 40;
  let minimumBumper = Infinity, minimumShaft = Infinity, minimumGuide = Infinity, minimumPowered = Infinity;
  let minimumStations = Infinity, minimumOpposed = Infinity, noDrive = 0, excessive = 0, firstDeadSpot = null;
  let extension = 0, floor = Infinity, stowMargin = Infinity, foldClearance = Infinity, foldedCoral = Infinity, stowedHeight = 0;
  let foldWitness = null, bumperWitness = null, guideWitness = null;
  let circleClearance = Infinity, shaftGuideClearance = Infinity;
  const deployed = bodiesAt(), mountedRobots = ['front', 'left'].map(mount => ({mount, bodies: robotInMount(mount)}));
  let allYawBumper = Infinity, allYawBumperCases = 0, hardwareBumper = Infinity, gateHardware = Infinity;
  let hardwareBumperWitness = null, gateHardwareWitness = null;
  const mountResults = {front: {hardwareBumper: Infinity, stowedInset: Infinity}, left: {hardwareBumper: Infinity, stowedInset: Infinity}};
  const rows = [];
  for (const state of definition.states) {
    let stateBumper = Infinity, stateMinimumContacts = Infinity, stateInterference = Infinity;
    for (let index = 0; index <= sampleCount; index++) {
      const progress = index / sampleCount, pose = poseAt(state, progress), bodies = bodiesAt(state, progress);
      const support = contactSummary(pose, bodies);
      stateMinimumContacts = Math.min(stateMinimumContacts, support.stations);
      if (state !== 'stow' && !(state === 'handoff' && progress >= 0.75)) {
        minimumStations = Math.min(minimumStations, support.stations);
        minimumOpposed = Math.min(minimumOpposed, new Set(support.active.map(contact => bodies.find(body => body.id === contact.id).contactSide)).size);
        if (!support.stations) {
          noDrive++;
          firstDeadSpot ??= {state, progress, center: pose.center, yaw: pose.yaw};
        }
        excessive += support.excessive.length;
      }
      for (const body of bodies) {
        const gap = coralBodyGap(pose, body);
        if (body.role === 'bumper') {
          const exactGap = coralBoxGap(pose, bodyBounds(body));
          stateBumper = Math.min(stateBumper, exactGap);
          if (exactGap < minimumBumper) { minimumBumper = exactGap; bumperWitness = {state, progress, center: pose.center, body: body.id}; }
        }
        if (body.role === 'shaft') minimumShaft = Math.min(minimumShaft, gap);
        if (body.role === 'powered') minimumPowered = Math.min(minimumPowered, gap);
        if (body.assembly !== 'robot' && !['powered', 'jaw', 'shaft'].includes(body.role)) {
          stateInterference = Math.min(stateInterference, gap);
          if (gap < minimumGuide) { minimumGuide = gap; guideWitness = {state, progress, body: body.id}; }
        }
        if (body.assembly !== 'robot') {
          const bounds = bodyBounds(body);
          floor = Math.min(floor, bounds.minimum[2]);
          for (const mount of ['front', 'left']) {
            const corners = [placePoint(bounds.minimum, mount), placePoint(bounds.maximum, mount)];
            const minimum = [0, 1, 2].map(axis => Math.min(...corners.map(point => point[axis])));
            const maximum = [0, 1, 2].map(axis => Math.max(...corners.map(point => point[axis])));
            extension = Math.max(extension, -350 - minimum[0], maximum[0] - 350, -minimum[1], maximum[1] - 760);
            if (state === 'stow' && index === sampleCount) stowMargin = Math.min(stowMargin, minimum[0] + 350,
              350 - maximum[0], minimum[1], 760 - maximum[1], minimum[2], 1000 - maximum[2]);
            if (state === 'stow' && index === sampleCount) stowedHeight = Math.max(stowedHeight, maximum[2]);
            if (state === 'stow' && index === sampleCount) mountResults[mount].stowedInset = Math.min(mountResults[mount].stowedInset,
              minimum[0] + 350, 350 - maximum[0], minimum[1], 760 - maximum[1], minimum[2], 1000 - maximum[2]);
          }
        }
      }
      if (state === 'stow') {
        const moving = bodies.filter(body => body.assembly === 'nose');
        const fixed = bodies.filter(body => body.assembly !== 'nose' && body.assembly !== 'robot' && body.role !== 'mount');
        for (const body of moving) {
          foldedCoral = Math.min(foldedCoral, coralBodyGap(pose, body));
          for (const obstacle of fixed) {
            const clearance = bodyGap(body, obstacle);
            if (clearance < foldClearance) { foldClearance = clearance; foldWitness = {progress, moving: body.id, fixed: obstacle.id}; }
          }
        }
      }
      for (const panel of bodies.filter(body => body.role === 'gate')) for (const beltBody of bodies.filter(body => body.kind === 'belt')) {
        const gap = bodyGap(panel, beltBody);
        if (gap < gateHardware) {gateHardware = gap; gateHardwareWitness = {state, progress, panel: panel.id, belt: beltBody.id};}
      }
      for (const mounted of mountedRobots) {
        for (const body of bodies.filter(body => body.assembly !== 'robot' && body.role !== 'mount')) {
          for (const obstacle of mounted.bodies.filter(body => body.role === 'bumper')) {
            const gap = bodyGap(body, obstacle);
            mountResults[mounted.mount].hardwareBumper = Math.min(mountResults[mounted.mount].hardwareBumper, gap);
            if (gap < hardwareBumper) {hardwareBumper = gap; hardwareBumperWitness = {state, progress, mount: mounted.mount, body: body.id, bumper: obstacle.id};}
          }
        }
        if (['acquire', 'capture', 'transfer'].includes(state)) {
          for (const yaw of [pose.yaw]) for (const across of [-10, 0, 10]) {
            allYawBumperCases++;
            for (const obstacle of mounted.bodies.filter(body => body.role === 'bumper')) {
              allYawBumper = Math.min(allYawBumper, coralBoxGap({...pose, yaw, center: [across, ...pose.center.slice(1)]}, bodyBounds(obstacle)));
            }
          }
        }
        if (state === 'stow') for (const moving of bodies.filter(body => body.assembly === 'nose')) {
          for (const obstacle of mounted.bodies) {
            const clearance = bodyGap(moving, obstacle);
            if (clearance < foldClearance) { foldClearance = clearance; foldWitness = {progress, moving: moving.id, fixed: obstacle.id, mount: mounted.mount}; }
          }
        }
      }
    }
    rows.push({state, poses: sampleCount + 1, bumperVerticalGap: stateBumper, minimumPoweredStations: stateMinimumContacts, minimumRigidPieceGap: stateInterference});
  }
  for (const body of deployed.filter(body => body.assembly !== 'robot')) {
    const bounds = foldBounds(body);
    for (const mount of ['front', 'left']) {
      const points = [placePoint(bounds.minimum, mount), placePoint(bounds.maximum, mount)];
      extension = Math.max(extension, ...points.flatMap(point => [-350 - point[0], point[0] - 350, -point[1], point[1] - 760]));
    }
  }
  const rubber = deployed.filter(body => body.role === 'powered');
  for (let first = 0; first < rubber.length; first++) for (let second = first + 1; second < rubber.length; second++) {
    circleClearance = Math.min(circleClearance, bodyGap(rubber[first], rubber[second]));
  }
  for (const shaft of deployed.filter(body => body.role === 'shaft')) for (const guide of deployed.filter(body => body.role === 'guide')) {
    shaftGuideClearance = Math.min(shaftGuideClearance, bodyGap(shaft, guide));
  }
  const bankCoverage = (offsets, rearwardOffsets, yawStep) => {
    let cases = 0, passing = 0, preloadMargin = Infinity, minimumBanks = 2, firstFailure = null;
    for (let yaw = 0; yaw <= 90; yaw += yawStep) for (const across of offsets) for (const rearward of rearwardOffsets) {
      cases++;
      const pose = {center: [across, dimensions.orientCenter[1] + rearward, dimensions.receiver[2]], yaw};
      const sampled = deployed.filter(body => body.kind === 'belt' && body.assembly === 'fixed').map(body => ({id: body.id, bank: body.bank, gap: beltClosestGap(pose, body)}));
      const usable = sampled.filter(contact => contact.gap <= 1e-5 && contact.gap >= -dimensions.compression - 1e-5);
      const bankCount = new Set(usable.map(contact => contact.bank)).size;
      const margin = Math.min(...[0, 1].map(bank => Math.max(...sampled.filter(contact => contact.bank === bank).map(contact => -contact.gap))));
      minimumBanks = Math.min(minimumBanks, bankCount); preloadMargin = Math.min(preloadMargin, margin);
      if (bankCount === 2) passing++; else firstFailure ??= {center: pose.center, yaw, bankCount, margin};
    }
    return {cases, passing, minimumBanks, preloadMargin, firstFailure, yawStep, offsets, rearwardOffsets};
  };
  const wideBanks = bankCoverage([-30, -15, 0, 15, 30], [-28, -14, 0, 14, 28], 2);
  const narrowBanks = bankCoverage([-10, 0, 10], [-10, 0, 10], 1);
  let entryCases = 0, entryClearCases = 0, worstEntry = Infinity, entryWitness = null;
  const entrance = poseAt('acquire', 0).center;
  for (const yaw of [90]) for (const across of [-10, 0, 10]) {
    const pose = {center: [across, entrance[1], radius], yaw};
    const gap = Math.min(...deployed.filter(body => body.role === 'powered').map(body => coralBodyGap(pose, body)));
    entryCases++; if (gap >= -dimensions.compression - 1e-5) entryClearCases++;
    if (gap < worstEntry) { worstEntry = gap; entryWitness = {center: pose.center, yaw, gap}; }
  }
  const closed = poseAt('stow', 0), closedBodies = bodiesAt('stow', 0);
  const receiverBounds = bodyBounds(closedBodies.find(body => body.id === 'receiver-roof'));
  const roofGap = receiverBounds.minimum[2] - closed.center[2] - radius;
  const frontStopGap = closed.center[1] - halfLength - 268;
  const rearStopGap = 592 - closed.center[1] - halfLength;
  const jawPreload = radius - 54.15;
  const crosswiseReach = Math.sqrt((radius + beltDesign.outsideRadius) ** 2 - beltRoute().reach ** 2);
  const contactIntervals = {
    crosswiseHalfContactReach: crosswiseReach,
    bankWorkingRun: [30, 560], bankPitchDeadLength: 0,
    noseToBankContactOverlap: 2 * crosswiseReach - 30,
    bridgeMidpointReserve: radius + beltDesign.outsideRadius - Math.hypot(15, beltRoute().reach),
    fullCurveCenterline: 'Front pulley arc -> common rising tangent -> crest pulley arc -> horizontal tangent; no pose jump.',
    lowerWorkingHeight: 225.5, upperWorkingHeight: 336.8, opposedGap: 111.3,
    lengthwiseDualBankOffsetLimit: Math.sqrt(radius ** 2 - (radius - dimensions.compression / 2) ** 2) - dimensions.bankSpan[1][0],
    lengthwiseReserveOffsetLimit: Math.sqrt(radius ** 2 - (radius - dimensions.compression / 2 + 0.5) ** 2) - dimensions.bankSpan[1][0],
  };
  const entryYawScreen = [0, 60, 75, 85, 89, 89.5, 90, 90.5, 91, 95, 105, 120].map(yaw => {
    const pose = {center: entrance, yaw};
    const pulleyGap = Math.min(...beltDesign.noseSpan.map(span => rollerGap(pose, {...pickup[0], span})));
    const beltEnvelopeGap = Math.min(...beltDesign.noseSpan.map(span => rollerGap(pose, {...pickup[0], span, radius: beltDesign.outsideRadius})));
    const shaftGap = rollerGap(pose, {...pickup[0], span: [-276, 276], radius: 6.35});
    return {yaw, relativeToCrosswise: yaw - 90, pulleyGap, beltEnvelopeGap, shaftGap,
      floorEnvelopeClear: Number.isFinite(beltEnvelopeGap) && pulleyGap >= 0 && beltEnvelopeGap >= -3 && shaftGap >= 5,
      admittedToCommandedTrial: yaw === 90};
  });
  gates.push(gate('full-body-bumper-margin', minimumBumper, dimensions.clearance, {witness: bumperWitness}));
  gates.push(gate('full-cylinder-commanded-yaw-bumper-both-mounts', allYawBumper, dimensions.clearance, {cases: allYawBumperCases, acrossOffsets: [-10, 0, 10]}));
  gates.push(gate('hardware-to-intact-bumper-front-and-left', hardwareBumper, dimensions.clearance, {witness: hardwareBumperWitness}));
  gates.push(gate('hardware-extension-reserve-front-and-left', dimensions.extensionLimit - extension, dimensions.clearance));
  gates.push(gate('hardware-floor-margin', floor, dimensions.clearance));
  gates.push(gate('stowed-hardware-inset-front-and-left', stowMargin, dimensions.clearance));
  gates.push(gate('starting-height-below-1000', 1000 - stowedHeight, dimensions.clearance));
  gates.push(gate('fold-body-clearance', foldClearance, dimensions.clearance, {witness: foldWitness}));
  gates.push(gate('loaded-fold-coral-clearance', foldedCoral, dimensions.clearance));
  gates.push(gate('distinct-rubber-body-clearance', circleClearance, dimensions.clearance));
  gates.push(gate('whole-shaft-to-guide-clearance', shaftGuideClearance, dimensions.clearance));
  gates.push(gate('gate-sweeps-to-working-belts', gateHardware, dimensions.clearance, {witness: gateHardwareWitness}));
  gates.push(gate('coral-to-whole-shafts', minimumShaft, dimensions.clearance));
  gates.push(gate('coral-to-rigid-guides', minimumGuide, 0, {witness: guideWitness, overlapSentinel: -0.000001}));
  gates.push(gate('commanded-path-compression-ceiling', minimumPowered, -dimensions.compression));
  gates.push(gate('continuous-two-powered-stations', minimumStations, 2, {zeroDrivePoses: noDrive, excessiveContacts: excessive, firstDeadSpot}));
  gates.push(gate('continuous-top-bottom-opposition', minimumOpposed, 2));
  gates.push(gate('crosswise-floor-entry-clearance', worstEntry, -dimensions.compression, {entryCases, entryClearCases, witness: entryWitness}));
  gates.push(gate('narrow-indexer-two-banks', narrowBanks.passing, narrowBanks.cases));
  gates.push(gate('narrow-indexer-preload-reserve', narrowBanks.preloadMargin, 0.5));
  gates.push(gate('receiver-closed-cage-clearance', Math.min(roofGap, frontStopGap, rearStopGap), dimensions.clearance));
  gates.push(gate('receiver-jaw-preload', jawPreload, dimensions.compression));
  let workspaceMargin = Infinity, workspaceCases = 0, maximumTiltCompression = 0;
  for (let yaw = 0; yaw <= 90; yaw++) for (const across of [-10, 0, 10]) for (const rearward of [-10, 0, 10]) for (const pitch of [-0.25, 0, 0.25]) {
    const pose = {center: [across, dimensions.orientCenter[1] + rearward, 281.15], yaw, pitch};
    const space = cellWorkspace(pose);
    workspaceMargin = Math.min(workspaceMargin, ...space.slice(0, 2).flat(), space[2][1]);
    maximumTiltCompression = Math.max(maximumTiltCompression, -space[2][0]); workspaceCases++;
  }
  const escape = [0, 30, 60, 90].map(yaw => ({yaw, ...escapeScreen(yaw)}));
  const releaseEscape = escapeScreen(0, true);
  gates.push(gate('cell-full-cylinder-yaw-and-small-tilt-workspace', workspaceMargin, 5, {workspaceCases, pitchDegrees: [-0.25, 0.25]}));
  gates.push(gate('cell-small-tilt-compression', 3 - maximumTiltCompression, 0));
  gates.push(gate('receiver-absent-geometric-retention-2D', escape.filter(result => !result.escaped).length, escape.length, {escape, releaseEscape,
    scope: '10 mm connected translation grid at fixed yaw and height, with a positive open-gate escape control. Not force or arbitrary 3D escape proof.'}));
  gates.push(gate('receiver-transfer-opening', Number(releaseEscape.escaped), 1));
  return cleanNumber({
    schema: 'intake-finalists/feed/2', candidate: 'A', status: gates.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL',
    firstFailedResult, repairHistory, repairAttempt: 3, beltDesign,
    geometryReady: false, ancestry: definition.ancestry, dimensions, gates, states: rows,
    sweep: {posesPerState: sampleCount + 1, totalPoses: rows.length * (sampleCount + 1), foldStepDegrees: dimensions.foldDegrees / sampleCount,
      interpolation: 'Analytic tangent lines and pulley arcs; rigid fold. Belt arc fold bounds conservatively include whole circles. Other clearance gates sampled.',
      prismMethod: 'Finite horizontal cylinders for working belt contact; exact full-cylinder extents for tilted cage fit. Hardware belt polygons have 5-degree facets; gaps above5 use AABB lower bounds.'},
    contact: {wideBanks, narrowBanks, contactIntervals, entry: {entryCases, entryClearCases, worstEntry, entryWitness, entryYawScreen,
      admittedCommandedYaw: [90, 90], admittedEntryOffsets: [-10, 10], validEndToEndEnvelope: null,
      scope: 'Floor drum screen is necessary only, not certification of nonzero-yaw transport. No +/-30 or all-angle capability.'}, compressionMm: dimensions.compression,
      criterion: 'Actual continuous belt working surfaces, not supporting wheel stations. Two banks and separate top/bottom opposition. Narrow +/-10 index envelope, 0.5 mm contact reserve. Wide cases are rejects, not required capability.'},
    clearances: {maximumHardwareExtension: extension, stowedHeight, stowedInset: stowMargin, bumperVertical: minimumBumper, allYawBumper, hardwareBumper, fold: foldClearance,
      loadedFold: foldedCoral, rubberBodies: circleClearance, wholeShaftToGuide: shaftGuideClearance, coralToShaft: minimumShaft,
      receiverRoof: roofGap, receiverFrontStop: frontStopGap, receiverRearStop: rearStopGap},
    controls: {controlledPositionDOF: 5, positioning: ['nose pivot', 'symmetric receiver jaws', 'receiver stop slide', 'cell front gate', 'cell back gate'],
      rollerDrives: 3, drives: ['paired opposed nose belts', 'left opposed fixed belts', 'right opposed fixed belts'],
      totalControlledActuators: 8, interlocks: ['absent/waiting: stop acquisition, feed and yaw; retain occupied cell', 'ready: open entry, retain, then release back gate'],
      unmodeled: ['motors and reductions', 'upper nose bend backing/idlers', 'upper shafts and supports', 'gate slides', 'yaw observability', 'transmission coupling', 'tensioners and holding brakes']},
    mount: {tested: ['front', 'left'], results: mountResults, leftReceiver: placePoint(dimensions.receiver, 'left'),
      localAxis: [0, 1, 0], leftWorldAxis: [1, 0, 0], interpretation: 'Rigid side-entry equivalent; no swerve travel penalty. Full chassis-ring packaging only, not other subsystems.'},
    receiver: {datum: dimensions.receiver, axis: [0, 1, 0], fixed: true, openJawGap: 148.3, closedJawGap: 108.3,
      sequence: 'Ready/open -> feed to fixed datum -> close jaws -> confirm capture -> close front stop -> nose folds. Abort feed if receiver absent.',
      release: 'Reverse the same jaw/stop slides only after downstream ownership confirmation. No receiving subsystem or automatic confirmation is modeled.'},
    decision: 'Local split-belt geometry trial only. FAIL is not selectable; no all-angle or passive yaw trajectory claim. A remains fixed feed, unlike B retained-carrier transport.',
  });
}

export function buildModel(state = 'acquire', progress = 1, mount = 'front', options = {}) {
  if (!['front', 'left', 'right'].includes(mount)) throw new Error(`Unknown mount ${mount}`);
  const root = new THREE.Group(), mechanism = new THREE.Group();
  root.name = 'A compact powered orient-and-feed'; root.add(mechanism);
  const control = controlAt(options);
  const pose = options.receiver && options.receiver !== 'ready' && options.occupied ? control.pose : poseAt(state, progress);
  const bodies = bodiesAt(state, progress, pose);
  const shaftBodies = bodies.filter(body => body.role === 'shaft');
  for (const body of bodies.filter(body => !shaftBodies.includes(body))) {
    const parent = body.assembly === 'robot' ? root : mechanism;
    if (body.kind === 'belt') {
      const beltGroup = new THREE.Group(); beltGroup.name = body.id; parent.add(beltGroup);
      body.sections.forEach((section, index) => sidePlate(beltGroup, `${body.id}-section-${index}`, (body.span[0] + body.span[1]) / 2,
        sectionPolygon(section, body.thickness), body.span[1] - body.span[0], body.color));
    } else if (body.kind === 'circle') axle(parent, body.id, [body.span[0], ...body.center], [body.span[1], ...body.center], body.radius, body.color);
    else sidePlate(parent, body.id, (body.span[0] + body.span[1]) / 2, body.outline, body.span[1] - body.span[0], body.color);
  }
  const shafts = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 16),
    new THREE.MeshStandardMaterial({color: palette.shaft}), shaftBodies.length);
  shafts.name = 'full shafts including independent bank stubs';
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
  shaftBodies.forEach((body, index) => {
    matrix.compose(new THREE.Vector3((body.span[0] + body.span[1]) / 2, ...body.center), rotation,
      new THREE.Vector3(body.radius, body.span[1] - body.span[0], body.radius));
    shafts.setMatrixAt(index, matrix);
  });
  shafts.userData.parts = shaftBodies.map(body => body.id); mechanism.add(shafts);
  const axis = new THREE.Vector3(Math.sin(radians(pose.yaw)), Math.cos(radians(pose.yaw)), 0);
  const coral = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dimensions.coralLength, 48),
    new THREE.MeshStandardMaterial({color: 0xdc7855, roughness: 0.7}));
  coral.name = 'nominal full coral - commanded diagnostic pose'; coral.position.set(...pose.center);
  coral.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis); mechanism.add(coral);
  if (mount !== 'front') {
    mechanism.rotation.z = mount === 'left' ? -Math.PI / 2 : Math.PI / 2;
    mechanism.position.set(mount === 'left' ? -350 : 350, 380, 0);
  }
  root.userData = {candidate: 'A', state, progress, mount, pose, control, geometryReady: false,
    status: 'FAIL', bodies, contact: contactSummary(pose, bodies),
    warning: 'The piece follows one continuous commanded diagnostic path. Unsupported/interfering poses are not transport proof.'};
  root.updateMatrixWorld(true);
  return root;
}