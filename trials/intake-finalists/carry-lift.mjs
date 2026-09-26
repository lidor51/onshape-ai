import { liftAwaySequence } from './handoff-sequence.mjs';
import { placePoint } from './mounts.mjs';

const radians = degrees => degrees * Math.PI / 180;
const distance = (first, second) => Math.hypot(first[0] - second[0], first[1] - second[1]);
const clamp = value => Math.max(0, Math.min(1, value));
const rectangle = (rearward, up, length, height) => [
  [rearward - length / 2, up - height / 2], [rearward + length / 2, up - height / 2],
  [rearward + length / 2, up + height / 2], [rearward - length / 2, up + height / 2],
];

export const definition = {
  id: 'B', name: 'Crosswise carrier with split vertical receiver and lift-away', ancestry: ['14', '07'],
  dimensions: {
    units: 'mm', coralLength: 301.625, coralOD: 114.3, coralBore: 101.6,
    pivotY: 100, pivotZ: 150, acquireY: -320, acquireZ: 57.15,
    handoffDegrees: -180, stowDegrees: -175, rollerRadius: 25, nominalCompression: 3,
    compressionCapacity: 7, shaftHalfLength: 270, shaftRadius: 6.35,
    keeperClosedAcross: 140, keeperStroke: 65, receiverLift: 250, upperJawStroke: 450, lowerJawStroke: 100,
    receiverInnerRadius: 59.5, receiverOuterRadius: 63.5, receiverAcross: 120,
    receiverRailY: 650, liftRailY: 680, receiverRailTop: 780, liftRailTop: 1050,
    chassisWidth: 700, chassisLength: 760, heightLimit: 1066.8, extensionLimit: 457.2,
    requiredFloor: 5, requiredExtensionMargin: 5, requiredStowInset: 5, requiredClearance: 0.25,
    rotationSamples: 361, slideSamples: 101,
  },
  states: ['acquire', 'capture', 'transfer', 'handoff', 'stow', 'delivered-stow'],
  limitations: [
    'Acquire starts with a centered, already seated crosswise coral on the floor. Pickup and self-centering are not established.',
    'Nominal 3 mm compliant drum interference and 7 mm maximum compression are assumptions, not measured material behavior.',
    'Rigid analytic clearance and geometric retention are not load, traction, reliability or elite-suitability validation.',
    'Actuation, synchronization, bearings, fasteners, tolerances and cables remain unsized.',
    'Model output is renderer-neutral mesh data with analytic extrusions; no vendor or rendering-library imports.',
    'Stow is the loaded-carrier branch. Delivered-stow follows the completed lift and empty return.',
  ],
};

function parameters(overrides = {}) {
  const settings = { ...definition.dimensions, ...overrides };
  for (const [name, value] of Object.entries(settings)) {
    if (name !== 'units' && !Number.isFinite(value)) throw new Error(`Invalid parameter ${name}`);
  }
  if (settings.coralOD <= settings.coralBore || settings.coralBore <= 0 || settings.coralLength <= 0 ||
      settings.receiverLift <= 0 || settings.nominalCompression < 0 ||
      settings.compressionCapacity < settings.nominalCompression || settings.receiverInnerRadius <= settings.coralOD / 2 ||
      settings.receiverOuterRadius <= settings.receiverInnerRadius ||
      !Number.isInteger(settings.rotationSamples) || settings.rotationSamples < 71 ||
      !Number.isInteger(settings.slideSamples) || settings.slideSamples < 3) throw new Error('Invalid geometry or sampling');
  return settings;
}

export function rotatePoint(point, angle, settings = definition.dimensions) {
  const rearward = point[0] - settings.pivotY;
  const up = point[1] - settings.pivotZ;
  return [settings.pivotY + Math.cos(angle) * rearward - Math.sin(angle) * up,
    settings.pivotZ + Math.sin(angle) * rearward + Math.cos(angle) * up];
}

export function poseAt(state = 'acquire', progress = 1, overrides = {}) {
  const settings = parameters(overrides);
  if (!definition.states.includes(state)) throw new Error(`Unknown state ${state}`);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Progress must be in [0,1]');
  const offered = radians(settings.handoffDegrees);
  const receiver = rotatePoint([settings.acquireY, settings.acquireZ], offered, settings);
  let angle = 0;
  let keeper = settings.keeperStroke;
  let closed = 0;
  let lift = 0;
  let owner = 'carrier';
  if (state === 'capture') keeper *= 1 - progress;
  if (state === 'transfer') { angle = offered * progress; keeper = 0; }
  if (state === 'stow') { angle = offered + radians(settings.stowDegrees - settings.handoffDegrees) * progress; keeper = 0; }
  if (state === 'handoff') {
    const sequence = liftAwaySequence(progress, { liftMm: settings.receiverLift });
    angle = offered * (1 - sequence.carrierReturn);
    keeper = settings.keeperStroke * sequence.carrierReleased;
    closed = sequence.receiverClosed;
    lift = sequence.receiverLift;
    owner = sequence.owner;
  }
  if (state === 'delivered-stow') {
    angle = radians(settings.stowDegrees) * progress;
    closed = 1; lift = settings.receiverLift; owner = 'receiver';
  }
  const coral = owner === 'receiver' || owner === 'both' ? [receiver[0], receiver[1] + lift] :
    rotatePoint([settings.acquireY, settings.acquireZ], angle, settings);
  return { state, progress, angle, keeper, closed, lift, owner, coral, receiver };
}

function ribbon(points, width) {
  const normals = points.slice(1).map((point, index) => {
    const length = distance(point, points[index]);
    return [-(point[1] - points[index][1]) / length, (point[0] - points[index][0]) / length];
  });
  const edge = sign => points.map((point, index) => {
    const before = normals[Math.max(0, index - 1)];
    const after = normals[Math.min(index, normals.length - 1)];
    const divisor = 1 + before[0] * after[0] + before[1] * after[1];
    return point.map((value, axis) => value + sign * width / 2 * (before[axis] + after[axis]) / divisor);
  });
  return [...edge(1), ...edge(-1).reverse()];
}

function arc(center, inner, outer, start, end) {
  const count = Math.ceil((end - start) / 2);
  const edge = radius => Array.from({ length: count + 1 }, (_, index) => {
    const angle = radians(start + (end - start) * index / count);
    return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
  });
  return [...edge(outer), ...edge(inner).reverse()];
}

const prism = (name, role, across, thickness, polygon, motion = 'fixed', side = 0) =>
  ({ name, role, across: [across - thickness / 2, across + thickness / 2], polygon, motion, side });
const cylinder = (name, role, across, length, center, radius, motion = 'fixed', side = 0) =>
  ({ name, role, across: [across - length / 2, across + length / 2], center, radius, motion, side });
const block = (name, role, center, size, motion = 'fixed', side = 0) =>
  prism(name, role, center[0], size[0], rectangle(center[1], center[2], size[1], size[2]), motion, side);
const pairId = (first, second) => [first, second].sort().join('|');

function canonicalParts(settings) {
  const parts = [];
  const joints = [];
  const add = part => { parts.push(part); return part.name; };
  const joint = (first, second, type = 'rigid') => joints.push({ first, second, type });
  const center = [settings.acquireY, settings.acquireZ];
  const offer = rotatePoint(center, radians(settings.handoffDegrees), settings);
  const contactRadius = settings.coralOD / 2 + settings.rollerRadius - settings.nominalCompression;
  const roller = side => [center[0] + side * contactRadius, center[1]];
  const mount = angle => [center[0] + 64 * Math.cos(radians(angle)), center[1] + 64 * Math.sin(radians(angle))];
  const cheekOutline = ribbon([[settings.pivotY, settings.pivotZ], [60, 235], [-80, 235], [-230, 120],
    roller(1), mount(312), mount(228), roller(-1), [-425, 40]], 10);
  const pivot = add(cylinder('Pivot shaft', 'pivot', 0, 620, [settings.pivotY, settings.pivotZ], 10));
  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'negative-x' : 'positive-x';
    const tower = add(block(`Pivot tower ${suffix}`, 'mount', [side * 300, settings.pivotY, (55 + settings.pivotZ) / 2],
      [20, 28, settings.pivotZ - 55]));
    const cheek = add(prism(`Carrier cheek ${suffix}`, 'cheek', side * 255, 6, cheekOutline, 'carrier'));
    joint(pivot, tower); joint(pivot, cheek, 'revolute');
    const disc = add(cylinder(`Carrier end disc ${suffix}`, 'end-disc', side * 162, 4, center, 52, 'carrier'));
    const hub = add(cylinder(`End disc hub ${suffix}`, 'disc-hub', side * 211, 94, center, 6, 'carrier'));
    const link = add(block(`End disc link ${suffix}`, 'disc-link', [side * 255, center[0], (12 + center[1] + 102) / 2],
      [8, 12, center[1] + 102 - 12], 'carrier'));
    joint(disc, hub); joint(hub, link); joint(link, cheek);
    const fingerProfiles = [arc(center, 62, 66, 224, 232), arc(center, 62, 66, 308, 336), arc(center, 68, 72, 43, 96)];
    for (const [index, profile] of fingerProfiles.entries()) {
      const finger = add(prism(`Withdrawable keeper ${suffix} ${index}`, 'keeper-finger', side * settings.keeperClosedAcross, 8, profile, 'keeper', side));
      const anchor = index < 2 ? mount(index === 0 ? 228 : 312) : [center[0], center[1] + 100];
      const pin = add(cylinder(`Keeper pin ${suffix} ${index}`, 'keeper-pin', side * (settings.keeperClosedAcross + 70), 140, anchor, 3, 'keeper', side));
      const rail = add(block(`Keeper guide ${suffix} ${index}`, 'keeper-guide', [side * 236.5, ...anchor], [43, 8, 8], 'carrier'));
      if (index < 2) joint(finger, pin);
      else {
        const tab = add(block(`Upper keeper mounting tab ${suffix}`, 'keeper-tab', [side * settings.keeperClosedAcross, center[0], center[1] + 85],
          [8, 8, 34], 'keeper', side));
        joint(tab, finger); joint(tab, pin);
      }
      joint(pin, rail, 'axial-bearing'); joint(rail, index < 2 ? cheek : link);
      joint(pin, index < 2 ? cheek : link, 'axial-bearing');
    }
  }
  for (const side of [-1, 1]) {
    const label = side < 0 ? 'Locked' : 'Driven';
    const shaft = add(cylinder(`${label} full roller shaft`, 'roller-shaft', 0, settings.shaftHalfLength * 2,
      roller(side), settings.shaftRadius, 'carrier'));
    const drum = add(cylinder(`${label} central drum`, 'roller-contact', 0, 196, roller(side), settings.rollerRadius, 'carrier'));
    joint(shaft, drum); joint(shaft, 'Carrier cheek negative-x'); joint(shaft, 'Carrier cheek positive-x');
  }
  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'negative-x' : 'positive-x';
    const post = add(block(`Receiver lift rail ${suffix}`, 'receiver-mount', [side * 300, settings.liftRailY, (55 + settings.liftRailTop) / 2],
      [12, 8, settings.liftRailTop - 55]));
    const jawRail = add(block(`Receiver jaw rail ${suffix}`, 'receiver-rail', [side * 300, settings.receiverRailY, (65 + settings.receiverRailTop) / 2],
      [12, 8, settings.receiverRailTop - 65], 'lift'));
    const sleeve = (label, rearward, up, motion, target) => {
      const bridge = add(block(`${label} bridge ${suffix}`, 'receiver-bearing', [side * 300, rearward - 10, up], [24, 12, 12], motion));
      for (const offset of [-9, 9]) {
        const shoe = add(block(`${label} shoe ${suffix} ${offset}`, 'receiver-bearing', [side * 300 + offset, rearward, up], [6, 16, 24], motion));
        joint(shoe, bridge); joint(shoe, target, 'vertical-slide');
      }
      joint(bridge, target, 'vertical-slide');
      return bridge;
    };
    const liftBearing = sleeve('Lift carriage', settings.liftRailY, 480, 'lift', post);
    const tie = add(block(`Lift to jaw rail tie ${suffix}`, 'receiver-frame', [side * 300, (settings.receiverRailY + settings.liftRailY - 16) / 2, 480],
      [12, settings.liftRailY - 16 - settings.receiverRailY, 12], 'lift'));
    joint(tie, liftBearing); joint(tie, jawRail);
    for (const direction of [-1, 1]) {
      const label = direction < 0 ? 'Lower' : 'Upper';
      const motion = direction < 0 ? 'lower-jaw' : 'upper-jaw';
      const ring = add(prism(`${label} receiver cage ${suffix}`, 'receiver-cage', side * settings.receiverAcross, 30,
        arc(offer, settings.receiverInnerRadius, settings.receiverOuterRadius, direction > 0 ? 12 : 192, direction > 0 ? 168 : 348), motion));
      const pad = add(block(`${label} receiver pad ${suffix}`, 'receiver-pad', [side * settings.receiverAcross, offer[0], offer[1] + direction * 58.325], [30, 12, 2.35], motion));
      joint(ring, pad);
      const beamZ = offer[1] + direction * 64;
      const stem = add(block(`${label} finger stem ${suffix}`, 'receiver-stem', [side * settings.receiverAcross, (offer[0] + settings.receiverRailY - 16) / 2, beamZ],
        [30, settings.receiverRailY - 16 - offer[0], 8], motion));
      const beam = add(block(`${label} outboard beam ${suffix}`, 'receiver-beam', [side * (settings.receiverAcross + 288) / 2, settings.receiverRailY - 10, beamZ],
        [288 - settings.receiverAcross, 12, 8], motion));
      const bearing = sleeve(`${label} jaw carriage`, settings.receiverRailY, beamZ, motion, jawRail);
      joint(ring, stem); joint(stem, beam); joint(beam, bearing);
      joint(beam, `${label} jaw carriage shoe ${suffix} ${-side * 9}`);
      if (direction > 0) {
        const stopBridge = add(block(`Receiver stop bridge ${suffix}`, 'receiver-stop-bridge', [side * 137.5, offer[0], offer[1] + 62], [35, 12, 4], motion));
        const stop = add(block(`Receiver axial stop ${suffix}`, 'receiver-stop', [side * 155, offer[0], offer[1] + 59], [3, 12, 10], motion));
        joint(stopBridge, stem); joint(stopBridge, ring); joint(stopBridge, stop);
      }
    }
  }
  return { parts, joints };
}

function translation(part, pose, settings) {
  const axial = part.motion === 'keeper' ? part.side * pose.keeper : 0;
  const up = ['lift', 'upper-jaw', 'lower-jaw', 'held'].includes(part.motion) ? pose.lift : 0;
  const jaw = part.motion === 'upper-jaw' ? settings.upperJawStroke * (1 - pose.closed) :
    part.motion === 'lower-jaw' ? -settings.lowerJawStroke * (1 - pose.closed) : 0;
  return [axial, up + jaw];
}

function movePart(part, pose, settings) {
  const shift = translation(part, pose, settings);
  const pointAt = point => {
    const moved = ['carrier', 'keeper'].includes(part.motion) ? rotatePoint(point, pose.angle, settings) : point;
    return [moved[0], moved[1] + shift[1]];
  };
  return { ...part, across: part.across.map(value => value + shift[0]),
    polygon: part.polygon?.map(pointAt), center: part.center && pointAt(part.center) };
}

function referenceParts(settings, mount) {
  if (!['front', 'left'].includes(mount)) throw new Error(`Unknown mount ${mount}`);
  const globals = [
    block('Front intact bumper', 'bumper', [0, -42.5, 105], [870, 85, 120]),
    block('Rear intact bumper', 'bumper', [0, 802.5, 105], [870, 85, 120]),
    block('Left intact bumper', 'bumper', [-392.5, 380, 105], [85, 760, 120]),
    block('Right intact bumper', 'bumper', [392.5, 380, 105], [85, 760, 120]),
    block('Front frame', 'frame', [0, 12.5, 40], [700, 25, 30]),
    block('Rear frame', 'frame', [0, 747.5, 40], [700, 25, 30]),
    block('Left frame', 'frame', [-337.5, 380, 40], [25, 710, 30]),
    block('Right frame', 'frame', [337.5, 380, 40], [25, 710, 30]),
  ];
  const references = mount === 'front' ? globals : globals.map(part => {
    const bounds = boundsOf(part);
    return { ...part, across: [380 - bounds[1][1], 380 - bounds[1][0]],
      polygon: rectangle((bounds[0][0] + bounds[0][1]) / 2 + 350, (bounds[2][0] + bounds[2][1]) / 2,
        bounds[0][1] - bounds[0][0], bounds[2][1] - bounds[2][0]) };
  });
  return [...references,
    block('Pivot crossmember', 'frame', [0, settings.pivotY, 40], [mount === 'front' ? 700 : 760, 28, 30]),
    block('Receiver crossmember', 'frame', [0, settings.liftRailY, 40], [mount === 'front' ? 700 : 760, 25, 30]),
  ];
}

export function assemblyAt(state = 'acquire', progress = 1, mount = 'front', overrides = {}) {
  const settings = parameters(overrides);
  const pose = poseAt(state, progress, settings);
  const canonical = canonicalParts(settings);
  const parts = canonical.parts.map(part => movePart(part, pose, settings));
  const coral = cylinder('Full hollow coral', 'gamepiece', 0, settings.coralLength, pose.coral, settings.coralOD / 2,
    pose.owner === 'carrier' ? 'carrier' : 'held');
  coral.bore = settings.coralBore;
  return { settings, pose, parts, coral, references: referenceParts(settings, mount), canonical };
}

export function boundsOf(part) {
  if (part.bounds) return part.bounds;
  const coordinates = part.polygon || [part.center];
  return [part.across, ...[0, 1].map(axis => [Math.min(...coordinates.map(point => point[axis])) - (part.radius || 0),
    Math.max(...coordinates.map(point => point[axis])) + (part.radius || 0)])];
}

function segmentDistance(point, start, end) {
  const delta = [end[0] - start[0], end[1] - start[1]];
  const squared = delta[0] ** 2 + delta[1] ** 2;
  const fraction = squared ? clamp(((point[0] - start[0]) * delta[0] + (point[1] - start[1]) * delta[1]) / squared) : 0;
  return distance(point, start.map((value, axis) => value + fraction * delta[axis]));
}

function inside(point, polygon) {
  let result = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const current = polygon[index];
    const before = polygon[previous];
    if ((current[1] > point[1]) !== (before[1] > point[1]) &&
        point[0] < (before[0] - current[0]) * (point[1] - current[1]) / (before[1] - current[1]) + current[0]) result = !result;
  }
  return result;
}
const cross = (first, second, third) => (second[0] - first[0]) * (third[1] - first[1]) - (second[1] - first[1]) * (third[0] - first[0]);
const intervalGap = (first, second) => Math.max(first[0] - second[1], second[0] - first[1]);

export function planarGap(first, second) {
  if (first.center && second.center) return distance(first.center, second.center) - first.radius - second.radius;
  if (first.center || second.center) {
    const circle = first.center ? first : second;
    const polygon = first.polygon || second.polygon;
    const nearest = Math.min(...polygon.map((point, index) => segmentDistance(circle.center, point, polygon[(index + 1) % polygon.length])));
    return (inside(circle.center, polygon) ? -nearest : nearest) - circle.radius;
  }
  if (inside(first.polygon[0], second.polygon) || inside(second.polygon[0], first.polygon)) return -0.001;
  let nearest = Infinity;
  for (const [firstIndex, firstStart] of first.polygon.entries()) {
    const firstEnd = first.polygon[(firstIndex + 1) % first.polygon.length];
    for (const [secondIndex, secondStart] of second.polygon.entries()) {
      const secondEnd = second.polygon[(secondIndex + 1) % second.polygon.length];
      if (cross(firstStart, firstEnd, secondStart) * cross(firstStart, firstEnd, secondEnd) < 0 &&
          cross(secondStart, secondEnd, firstStart) * cross(secondStart, secondEnd, firstEnd) < 0) return -0.001;
      nearest = Math.min(nearest, segmentDistance(firstStart, secondStart, secondEnd), segmentDistance(firstEnd, secondStart, secondEnd),
        segmentDistance(secondStart, firstStart, firstEnd), segmentDistance(secondEnd, firstStart, firstEnd));
    }
  }
  return nearest;
}

export function clearance(first, second) {
  const across = intervalGap(first.across, second.across);
  const planar = planarGap(first, second);
  return across > 0 || planar > 0 ? Math.hypot(Math.max(0, across), Math.max(0, planar)) : Math.max(across, planar);
}

export function instantaneousFailures(assembly) {
  const allowed = new Set(assembly.canonical.joints.map(joint => pairId(joint.first, joint.second)));
  const failures = [];
  for (const [index, first] of assembly.parts.entries()) {
    for (const second of [...assembly.parts.slice(index + 1), assembly.coral]) {
      if (allowed.has(pairId(first.name, second.name))) continue;
      const bounds = boundsOf(first).map((interval, axis) => intervalGap(interval, boundsOf(second)[axis]));
      if (Math.max(...bounds) > assembly.settings.requiredClearance) continue;
      const required = second.role === 'gamepiece' && first.role === 'roller-contact' ? -assembly.settings.nominalCompression :
        second.role === 'gamepiece' && first.role === 'receiver-pad' ? 0 : assembly.settings.requiredClearance;
      const gap = clearance(first, second);
      if (gap < required - 1e-8) failures.push({ part: first.name, obstacle: second.name, gap, required });
    }
  }
  return failures;
}

export function buildModel(state = 'acquire', progress = 1, mount = 'front', overrides = {}) {
  const assembly = assemblyAt(state, progress, mount, overrides);
  return {
    type: 'analytic-extrusion-assembly', name: `B lift-away ${mount} ${state}`, definition,
    children: [...assembly.references, ...assembly.parts, assembly.coral].map(part => ({
      ...part, id: part.name, type: part.center ? part.bore ? 'hollow-cylinder' : 'cylinder' : 'extruded-polygon',
      transform: mount === 'front' ? { rotationZ: 0, translation: [0, 0, 0] } : { rotationZ: -Math.PI / 2, translation: [-350, 380, 0] },
    })),
    userData: { state, progress, mount, candidateId: 'B', geometryReady: false,
      coralPose: { center: placePoint([0, ...assembly.pose.coral], mount), owner: assembly.pose.owner,
        axis: mount === 'front' ? [1, 0, 0] : [0, -1, 0], length: assembly.settings.coralLength,
        outsideDiameter: assembly.settings.coralOD, bore: assembly.settings.coralBore },
      kinematics: assembly.pose, parameters: assembly.settings, limitations: definition.limitations },
  };
}

const carrierMotion = part => ['carrier', 'keeper'].includes(part.motion);
const boxGap = (first, second) => Math.hypot(...first.map((interval, axis) => Math.max(0, intervalGap(interval, second[axis]))));

function relativeTravel(first, second, pose, before, after, settings) {
  const axial = point => translation(first, point, settings)[0] - translation(second, point, settings)[0];
  const axialTravel = Math.max(Math.abs(axial(before) - axial(pose)), Math.abs(axial(after) - axial(pose)));
  if (carrierMotion(first) && carrierMotion(second)) return { axial: axialTravel, planar: 0 };
  if (!carrierMotion(first) && !carrierMotion(second)) {
    const up = point => translation(first, point, settings)[1] - translation(second, point, settings)[1];
    return { axial: axialTravel, planar: Math.max(Math.abs(up(before) - up(pose)), Math.abs(up(after) - up(pose))) };
  }
  const radius = part => part.center ? distance(part.center, [settings.pivotY, settings.pivotZ]) :
    Math.max(...part.polygon.map(point => distance(point, [settings.pivotY, settings.pivotZ])));
  const moving = carrierMotion(first) ? first : second;
  const sliding = carrierMotion(first) ? second : first;
  const angle = Math.max(Math.abs(before.angle - pose.angle), Math.abs(after.angle - pose.angle));
  const up = translation(sliding, pose, settings)[1];
  return { axial: axialTravel, planar: radius(moving) * angle +
    Math.max(Math.abs(translation(sliding, before, settings)[1] - up), Math.abs(translation(sliding, after, settings)[1] - up)) };
}

function movingFrom(part, pose, target, settings) {
  const shift = translation(part, target, settings).map((value, axis) => value - translation(part, pose, settings)[axis]);
  const transform = point => {
    const rotated = carrierMotion(part) ? rotatePoint(point, target.angle - pose.angle, settings) : point;
    return [rotated[0], rotated[1] + shift[1]];
  };
  return { ...part, bounds: undefined, across: part.across.map(value => value + shift[0]),
    center: part.center && transform(part.center), polygon: part.polygon?.map(transform) };
}

export function sweptBoundsOf(part, pose, before, after, settings = definition.dimensions) {
  const endpoints = [movingFrom(part, pose, before, settings), movingFrom(part, pose, after, settings)];
  if (!carrierMotion(part)) {
    return [0, 1, 2].map(axis => [Math.min(...endpoints.map(endpoint => boundsOf(endpoint)[axis][0])),
      Math.max(...endpoints.map(endpoint => boundsOf(endpoint)[axis][1]))]);
  }
  const angles = [before.angle - pose.angle, after.angle - pose.angle].sort((first, second) => first - second);
  const points = endpoints.flatMap(endpoint => endpoint.polygon || [endpoint.center]);
  for (const point of part.polygon || [part.center]) {
    const bearing = Math.atan2(point[1] - settings.pivotZ, point[0] - settings.pivotY);
    for (let quarter = -8; quarter <= 8; quarter++) {
      const offset = quarter * Math.PI / 2 - bearing;
      if (offset >= angles[0] && offset <= angles[1]) points.push(rotatePoint(point, offset, settings));
    }
  }
  return [[Math.min(...endpoints.map(endpoint => endpoint.across[0])), Math.max(...endpoints.map(endpoint => endpoint.across[1]))],
    ...[0, 1].map(axis => [Math.min(...points.map(point => point[axis])) - (part.radius || 0),
      Math.max(...points.map(point => point[axis])) + (part.radius || 0)])];
}

export function pairBound(first, second, pose, before, after, settings = definition.dimensions) {
  const measured = clearance(first, second);
  const travel = relativeTravel(first, second, pose, before, after, settings);
  const firstSwept = sweptBoundsOf(first, pose, before, after, settings);
  const secondSwept = sweptBoundsOf(second, pose, before, after, settings);
  const broad = boxGap(firstSwept, secondSwept);
  const lower = Math.max(intervalGap(firstSwept[0], secondSwept[0]), planarGap(first, second) - travel.planar,
    measured - Math.hypot(travel.axial, travel.planar), broad > 0 ? broad : -Infinity);
  return { measured, lower: measured < -1e-8 ? Math.min(measured, lower) : lower };
}

function contactBound(part, coral, pose, before, after, settings) {
  if (carrierMotion(part) && carrierMotion(coral)) return clearance(part, coral);
  if (part.center && coral.center) {
    if (before.angle === after.angle) {
      const relative = target => {
        const first = movingFrom(part, pose, target, settings).center;
        const second = movingFrom(coral, pose, target, settings).center;
        return first.map((value, axis) => value - second[axis]);
      };
      return segmentDistance([0, 0], relative(before), relative(after)) - part.radius - coral.radius;
    }
    if (before.lift === after.lift) {
      const offsets = [before.angle - pose.angle, after.angle - pose.angle];
      const bearing = Math.atan2(coral.center[1] - settings.pivotZ, coral.center[0] - settings.pivotY) -
        Math.atan2(part.center[1] - settings.pivotZ, part.center[0] - settings.pivotY);
      for (let turn = -2; turn <= 2; turn++) {
        const offset = bearing + turn * Math.PI * 2;
        if (offset >= Math.min(...offsets) && offset <= Math.max(...offsets)) offsets.push(offset);
      }
      return Math.min(...offsets.map(offset => distance(rotatePoint(part.center, offset, settings), coral.center) - part.radius - coral.radius));
    }
  }
  if (part.role === 'receiver-pad' && pose.state === 'handoff') {
    return Math.min(...[before, after].map(target => clearance(movingFrom(part, pose, target, settings), movingFrom(coral, pose, target, settings))));
  }
  return pairBound(part, coral, pose, before, after, settings).lower;
}

function placedBounds(bounds, mount) {
  const corners = [];
  for (const across of bounds[0]) for (const rearward of bounds[1]) for (const up of bounds[2]) corners.push(placePoint([across, rearward, up], mount));
  return [0, 1, 2].map(axis => [Math.min(...corners.map(point => point[axis])), Math.max(...corners.map(point => point[axis]))]);
}

function extension(bounds, settings) {
  return Math.min(bounds[0][0] + settings.chassisWidth / 2 + settings.extensionLimit,
    settings.chassisWidth / 2 + settings.extensionLimit - bounds[0][1], bounds[1][0] + settings.extensionLimit,
    settings.chassisLength + settings.extensionLimit - bounds[1][1]);
}

function stowInset(bounds, settings) {
  return Math.min(bounds[0][0] + settings.chassisWidth / 2, settings.chassisWidth / 2 - bounds[0][1],
    bounds[1][0], settings.chassisLength - bounds[1][1], bounds[2][0], settings.heightLimit - bounds[2][1]);
}

export function pickupScreen(overrides = {}) {
  const settings = parameters(overrides);
  const cases = [];
  for (const yaw of [-10, -5, -2, -1.5, 0, 1.5, 2, 5, 10]) for (const offset of [-15, -10, -5, 0, 5, 10, 15]) {
    const angle = radians(yaw);
    const across = settings.coralLength / 2 * Math.abs(Math.cos(angle)) + settings.coralOD / 2 * Math.abs(Math.sin(angle));
    const normal = settings.coralLength / 2 * Math.abs(Math.sin(angle)) + settings.coralOD / 2 * Math.abs(Math.cos(angle));
    const axialMargin = 160 - Math.abs(offset) - across;
    const compressionRequired = settings.nominalCompression + normal - settings.coralOD / 2;
    cases.push({ yawDegrees: yaw, axialOffsetMm: offset, fullAcrossHalfExtentMm: across, fullNormalHalfExtentMm: normal,
      axialMarginMm: axialMargin, compressionRequiredMm: compressionRequired,
      slabScreenPass: axialMargin >= 0 && compressionRequired <= settings.compressionCapacity });
  }
  return { method: 'Exact support function of a full finite cylinder yawed about vertical, against end planes and compliant roller tangent slabs only.',
    nominalCheckedYawDegrees: 0, nominalCheckedOffsetMm: 0, assumedAdditionalCompressionMm: settings.compressionCapacity - settings.nominalCompression,
    slabScreenYawDegreesAtOffset5: Math.max(...cases.filter(item => item.axialOffsetMm === 5 && item.slabScreenPass).map(item => Math.abs(item.yawDegrees))),
    allHardwareYawCertified: false, guaranteedAcquisition: false, cases };
}

function connectivity(parts, references, joints) {
  const byName = new Map([...parts, ...references].map(part => [part.name, part]));
  const edges = new Map(parts.map(part => [part.name, new Set()]));
  const openJoints = [];
  for (const connection of joints) {
    const gap = clearance(byName.get(connection.first), byName.get(connection.second));
    if (gap <= 0.25 + 1e-8) {
      edges.get(connection.first).add(connection.second); edges.get(connection.second).add(connection.first);
    } else openJoints.push({ ...connection, gapMm: gap });
  }
  const reached = new Set();
  for (const part of parts.filter(part => ['mount', 'receiver-mount'].includes(part.role))) {
    const support = byName.get(part.role === 'mount' ? 'Pivot crossmember' : 'Receiver crossmember');
    if (Math.abs(clearance(part, support)) <= 1e-8) reached.add(part.name);
  }
  const queue = [...reached];
  for (let index = 0; index < queue.length; index++) for (const neighbor of edges.get(queue[index])) {
    if (!reached.has(neighbor)) { reached.add(neighbor); queue.push(neighbor); }
  }
  return { unattachedBodies: parts.filter(part => !reached.has(part.name)).map(part => part.name), openJoints };
}

export function evaluate(overrides = {}) {
  const settings = parameters(overrides);
  const canonical = canonicalParts(settings);
  const allowed = new Set(canonical.joints.map(joint => pairId(joint.first, joint.second)));
  const gates = new Map();
  const phaseGates = new Map();
  const record = (criterion, measured, lower, required, witness) => {
    const entry = { criterion, status: lower >= required - 1e-8 && measured >= required - 1e-8 ? 'PASS' : 'FAIL',
      sampledMarginMm: measured, lowerBoundMm: lower, requiredMm: required, witness };
    const worse = previous => !previous || lower < previous.lowerBoundMm || (lower === previous.lowerBoundMm && measured < previous.sampledMarginMm);
    if (worse(gates.get(criterion))) gates.set(criterion, entry);
    const key = `${criterion}.${witness.phase}`;
    if (worse(phaseGates.get(key))) phaseGates.set(key, entry);
  };
  const phases = [
    ['capture', 0, 1, settings.slideSamples, 'capture'],
    ['transfer', 0, 1, settings.rotationSamples, 'retained-transfer'],
    ['handoff', 0, 0.2, settings.slideSamples, 'receiver-close'],
    ['handoff', 0.2, 0.4, settings.slideSamples, 'carrier-release'],
    ['handoff', 0.4, 0.65, settings.slideSamples, 'receiver-lift'],
    ['handoff', 0.65, 1, settings.rotationSamples, 'empty-return'],
    ['stow', 0, 1, settings.slideSamples, 'loaded-stow'],
    ['delivered-stow', 0, 1, settings.rotationSamples, 'delivered-stow'],
  ];
  let inspectedPoses = 0;
  let exactPairTests = 0;
  const structureFailures = [];
  for (const mount of ['front', 'left']) {
    const references = referenceParts(settings, mount);
    for (const [state, begin, end, count, phase] of phases) {
      const invariantChecked = new Set();
      const progressStep = (end - begin) / (count - 1);
      for (let index = 0; index < count; index++) {
        const progress = begin + progressStep * index;
        const pose = poseAt(state, progress, settings);
        const before = poseAt(state, Math.max(begin, progress - progressStep / 2), settings);
        const after = poseAt(state, Math.min(end, progress + progressStep / 2), settings);
        const parts = canonical.parts.map(part => movePart(part, pose, settings));
        const coral = cylinder('Full hollow coral', 'gamepiece', 0, settings.coralLength, pose.coral, settings.coralOD / 2,
          ['capture', 'transfer', 'stow'].includes(state) ? 'carrier' : 'held');
        const witness = { mount, state, phase, progress, owner: pose.owner, angleDegrees: pose.angle * 180 / Math.PI };
        inspectedPoses++;
        for (const part of [...parts, coral, ...references]) {
          part.bounds = boundsOf(part);
          part.swept = sweptBoundsOf(part, pose, before, after, settings);
        }
        const structure = connectivity(parts, references, canonical.joints);
        record(`${mount}.structure`, -structure.unattachedBodies.length, -structure.unattachedBodies.length, 0,
          { ...witness, unattachedBodies: structure.unattachedBodies });
        if (structure.unattachedBodies.length && !structureFailures.some(failure => failure.mount === mount && failure.phase === phase)) {
          structureFailures.push({ ...witness, ...structure });
        }
        for (const part of [...parts, coral]) {
          const kind = part === coral ? 'coral' : 'hardware';
          const sample = placedBounds(part.bounds, mount);
          const swept = placedBounds(part.swept, mount);
          const details = { ...witness, part: part.name };
          record(`${mount}.${kind}.floor`, sample[2][0], swept[2][0], kind === 'hardware' ? settings.requiredFloor : 0, details);
          record(`${mount}.${kind}.extension`, extension(sample, settings), extension(swept, settings),
            kind === 'hardware' ? settings.requiredExtensionMargin : 0, details);
          if (['stow', 'delivered-stow'].includes(state) && index === count - 1) {
            record(`${mount}.${kind}.${phase}.inset`, stowInset(sample, settings), stowInset(sample, settings), settings.requiredStowInset, details);
          }
        }
        const checkPair = (first, second, criterion, required, contact = false) => {
          const names = pairId(first.name, second.name);
          const travel = relativeTravel(first, second, pose, before, after, settings);
          const invariant = travel.axial < 1e-12 && travel.planar < 1e-12;
          if (invariant && invariantChecked.has(names)) return;
          if (invariant) invariantChecked.add(names);
          const previous = phaseGates.get(`${criterion}.${phase}`);
          const broad = boxGap(first.swept, second.swept);
          if (!contact && broad > 0 && previous && broad > previous.lowerBoundMm) return;
          const evidence = pairBound(first, second, pose, before, after, settings);
          if (contact) evidence.lower = contactBound(first, second, pose, before, after, settings);
          exactPairTests++;
          record(criterion, evidence.measured, evidence.lower, required, { ...witness, part: first.name, obstacle: second.name, intendedContact: contact });
        };
        for (const part of [...parts, coral]) for (const reference of references) {
          const attachment = (part.role === 'mount' && reference.name === 'Pivot crossmember') ||
            (part.role === 'receiver-mount' && reference.name === 'Receiver crossmember');
          checkPair(part, reference, `${mount}.${part === coral ? 'coral' : 'hardware'}.${attachment ? 'mount-contact' : reference.role}`,
            attachment ? 0 : settings.requiredClearance);
        }
        for (const [firstIndex, first] of parts.entries()) for (const second of [...parts.slice(firstIndex + 1), coral]) {
          if (allowed.has(pairId(first.name, second.name))) continue;
          const contact = second === coral && (first.role === 'roller-contact' ||
            first.role === 'receiver-pad' && ['handoff', 'delivered-stow'].includes(state));
          const criterion = second === coral ? contact ? `contact.${first.role}` : 'coral.hardware' :
            first.role.startsWith('receiver') || second.role.startsWith('receiver') ? 'receiver.hardware' : 'carrier.hardware';
          checkPair(first, second, `${mount}.${criterion}`, contact ? first.role === 'roller-contact' ? -settings.nominalCompression : 0 : settings.requiredClearance, contact);
        }
      }
    }
  }
  const carrierOpening = 2 * 66 * Math.sin(radians(38));
  const receiverOpening = 2 * settings.receiverOuterRadius * Math.sin(radians(12));
  record('retention.carrier-lower-opening', settings.coralOD - carrierOpening, settings.coralOD - carrierOpening, 0,
    { phase: 'retention', openingMm: carrierOpening });
  record('retention.receiver-opening', settings.coralOD - receiverOpening, settings.coralOD - receiverOpening, 0,
    { phase: 'retention', openingMm: receiverOpening });
  record('retention.carrier-end-disc-wall', 52 - settings.coralBore / 2, 52 - settings.coralBore / 2, 0.25, { phase: 'retention' });
  record('retention.receiver-end-stop-wall', settings.coralOD / 2 - 54, settings.coralOD / 2 - 54, 0.25, { phase: 'retention' });
  const withdrawn = settings.keeperClosedAcross + settings.keeperStroke - 4 - settings.coralLength / 2;
  record('release.keeper-axial-clearance', withdrawn, withdrawn, settings.requiredClearance, { phase: 'carrier-release' });
  const screen = pickupScreen(settings);
  const nominal = screen.cases.find(item => item.yawDegrees === 0 && item.axialOffsetMm === 0);
  record('acquisition.nominal-slot-screen', Math.min(nominal.axialMarginMm, settings.compressionCapacity - nominal.compressionRequiredMm),
    Math.min(nominal.axialMarginMm, settings.compressionCapacity - nominal.compressionRequiredMm), 0, { phase: 'acquire', scope: 'Seated nominal pose only' });
  const metrics = [...gates.values()];
  const failures = metrics.filter(gate => gate.status !== 'PASS');
  return {
    candidateId: 'B', revision: 'carry-lift', result: failures.length ? 'FAIL' : 'PASS', geometryReady: failures.length === 0,
    parameters: settings, scope: 'Nominal rigid analytic geometry with assumed compliant contact; not complete acquisition or physical success.',
    inspectedPoses, exactPairTests, hardwareBodies: canonical.parts.length, referenceBodies: 10, coralBodies: 1,
    phases: phases.map(([state, begin, end, count, name]) => ({ state, begin, end, countPerMount: count, name })),
    maximumRotationStepDegrees: Math.abs(settings.handoffDegrees) / (settings.rotationSamples - 1),
    conservativeMethod: 'Exact rotation extrema and linear swept bounds; exact extruded polygon/circle separation; half-cell relative-motion Lipschitz bounds; exact circle/line or circle/rotation contact minima. Every phase is bounded independently. Shared rigid motion cancels; opposed slides do not. Axial and planar separation bounds both retained.',
    polygonOverlapMeaning: 'Negative polygon score establishes overlap, not penetration depth. The coral bore is conservatively filled for collision checks; no proposed hardware enters it.',
    mountPolicy: 'The complete mechanism is rigidly rotated for left mounting; intact chassis and bumper references are transformed back into local coordinates.',
    degreesOfFreedom: { positioning: 4, drivenRollers: 1, carrierLockedRollers: 1, independentInputs: 5,
      inputs: ['carrier rotation', 'rear roller drive', 'synchronized split axial keepers', 'synchronized unequal-stroke vertical jaws', '250 mm receiver lift'] },
    handoffCenterMm: [0, ...poseAt('transfer', 1, settings).coral], deliveredCenterMm: [0, ...poseAt('handoff', 1, settings).coral],
    structure: { status: structureFailures.length ? 'FAIL' : 'PASS', inspectedPoses, failures: structureFailures,
      criterion: 'Actual named joint geometry must connect every body to a touching chassis crossmember at every sampled pose. Local axial bearing bores and pivot bearing interiors remain simplified named joint allowances.' },
    retention: { carrierLowerOpeningUpperBoundMm: carrierOpening, receiverOpeningUpperBoundMm: receiverOpening,
      carrier: 'Opposed drums, two lower sectors, upper keeper and end discs. All three keeper sectors translate axially before lift.',
      receiver: 'Upper and lower radial half-cages, tangent pads and upper-jaw axial wall stops. Jaws close vertically before source release; the closed assembly lifts 250 mm before empty return.',
      status: 'Geometric throat and wall-stop checks only; loads, distortion, axial tilt escape and actuation failure remain unproven.' },
    finiteContacts: canonical.parts.filter(part => part.role === 'roller-contact').map(part => ({ part: part.name,
      axialIntervalMm: part.across, nominalCoralOverlapMm: Math.min(settings.coralLength, part.across[1] - part.across[0]),
      nominalCompressionMm: settings.nominalCompression, mode: part.name.startsWith('Driven') ? 'powered' : 'carrier-locked' })),
    pickupScreen: screen, gates: metrics, phaseGates: [...phaseGates.values()], failures, intentionalJoints: canonical.joints,
    modelContract: { type: 'analytic-extrusion-assembly', rendererNeutral: true, threeObject3D: false, browserRenderingVerified: false },
    topologyRepairsUsed: 3, geometryFrozen: true,
    repairHistory: [
      { revision: 'initial', result: 'FAIL', evidence: 'Keeper sector/drum -0.965596 mm; receiver pad/beam assembly intersections.' },
      { revision: 'repair-1', result: 'FAIL', evidence: 'Keeper pins/receiver cage -2.5 mm; upper pin/link -9 mm; keeper/stop bridge overlap.' },
      { revision: 'repair-2', result: 'FAIL', evidence: 'Lower receiver stop bridge overlapped its pad and crossed the upper keeper tab during closing.' },
      { revision: 'repair-3', result: 'Focused sampled close/release/lift PASS; full gate result is the top-level result.' },
    ],
    limitations: definition.limitations,
  };
}