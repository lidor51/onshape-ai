import * as THREE from '../whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import { solid, axle, sidePlate, palette } from '../whole-robot-concepts/mechanisms/primitives.mjs';
import { placePoint } from './mounts.mjs';

const radians = degrees => degrees * Math.PI / 180;
const clamp = value => Math.max(0, Math.min(1, value));
const distance = (first, second) => Math.hypot(first[0] - second[0], first[1] - second[1]);
const rectangle = (rearward, up, length, height) => [
  [rearward - length / 2, up - height / 2], [rearward + length / 2, up - height / 2],
  [rearward + length / 2, up + height / 2], [rearward - length / 2, up + height / 2],
];

export const definition = {
  id: 'B',
  name: 'Retained crosswise rotary carrier with sequenced receiver',
  ancestry: ['14', '07'],
  dimensions: {
    units: 'mm', coralLength: 301.625, coralOD: 114.3, coralBore: 101.6,
    pivotY: 100, pivotZ: 140, acquireY: -320, acquireZ: 57.15,
    handoffDegrees: -160, stowDegrees: -155, rollerRadius: 25,
    plateAcross: 255, plateThickness: 6, ribbonWidth: 10, shaftHalfLength: 270,
    keeperStroke: 125, jawOpen: 300, jawClosed: 120,
    receiverSupportAcross: 300, samplesPerRotation: 361,
    chassisWidth: 700, chassisLength: 760, heightLimit: 1066.8, extensionLimit: 457.2,
    requiredExtensionMargin: 5, requiredClearance: 0.25,
  },
  states: ['acquire', 'capture', 'transfer', 'handoff', 'stow'],
  limitations: [
    'Analytic rigid geometry only; not traction, self-centering, load, reliability or rule certification.',
    'Acquire begins with a centered, crosswise coral already between contacts. No guaranteed pickup or yaw correction.',
    'Handoff receiver is a new proposed interface, not measured team or vendor CAD.',
    'Central contact drums preserve both full roller shafts; non-contacting outboard rubber bands were removed for axial receiver access.',
    'Stow is the loaded-carrier branch from transfer, not a teleport after a completed receiver handoff.',
    'Motors, transmissions, sensors, fasteners, wiring and tolerance stack remain undesigned.',
    'A failed collision or continuous-clearance gate means NOT GEOMETRY-READY.',
  ],
};

function parameters(overrides = {}) {
  const result = { ...definition.dimensions, ...overrides };
  for (const [name, value] of Object.entries(result)) {
    if (name !== 'units' && !Number.isFinite(value)) throw new Error(`Invalid parameter ${name}`);
  }
  if (result.coralOD <= result.coralBore || result.coralBore <= 0 || result.coralLength <= 0 ||
      result.rollerRadius <= 0 || result.ribbonWidth <= 0 || result.plateThickness <= 0 ||
      result.samplesPerRotation < 71 || !Number.isInteger(result.samplesPerRotation)) {
    throw new Error('Invalid dimensions or fewer than 71 rotation samples');
  }
  return result;
}

export function rotatePoint(point, angle, settings = definition.dimensions) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const rearward = point[0] - settings.pivotY;
  const up = point[1] - settings.pivotZ;
  return [settings.pivotY + cosine * rearward - sine * up,
    settings.pivotZ + sine * rearward + cosine * up];
}

export function poseAt(state = 'acquire', progress = 1, overrides = {}) {
  const settings = parameters(overrides);
  if (!definition.states.includes(state)) throw new Error(`Unknown state ${state}`);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Progress must be in [0,1]');
  const handoffAngle = radians(settings.handoffDegrees);
  let angle = 0;
  let keeper = settings.keeperStroke;
  let jaw = settings.jawOpen;
  let owner = 'carrier';
  if (state === 'capture') keeper *= 1 - progress;
  if (state === 'transfer') { angle = handoffAngle * progress; keeper = 0; }
  if (state === 'stow') {
    angle = handoffAngle + radians(settings.stowDegrees - settings.handoffDegrees) * progress;
    keeper = 0;
  }
  if (state === 'handoff') {
    angle = handoffAngle;
    keeper = 0;
    jaw = settings.jawOpen + (settings.jawClosed - settings.jawOpen) * clamp(progress / 0.3);
    if (progress >= 0.3) { owner = 'both'; jaw = settings.jawClosed; }
    keeper = settings.keeperStroke * clamp((progress - 0.3) / 0.25);
    if (progress >= 0.55) {
      owner = 'receiver';
      angle = progress === 1 ? 0 : handoffAngle * (1 - clamp((progress - 0.55) / (1 - 0.55)));
    }
  }
  const receiver = rotatePoint([settings.acquireY, settings.acquireZ], handoffAngle, settings);
  const coral = owner === 'receiver' || owner === 'both' ? receiver :
    rotatePoint([settings.acquireY, settings.acquireZ], angle, settings);
  return { state, progress, angle, keeper, jaw, owner, coral, receiver };
}

export function ribbonOutline(points, width) {
  const half = width / 2;
  const normals = points.slice(1).map((point, index) => {
    const span = [point[0] - points[index][0], point[1] - points[index][1]];
    const length = Math.hypot(...span);
    return [-span[1] / length, span[0] / length];
  });
  const edge = sign => points.map((point, index) => {
    const before = normals[Math.max(0, index - 1)];
    const after = normals[Math.min(index, normals.length - 1)];
    const denominator = 1 + before[0] * after[0] + before[1] * after[1];
    return [point[0] + sign * half * (before[0] + after[0]) / denominator,
      point[1] + sign * half * (before[1] + after[1]) / denominator];
  });
  return [...edge(1), ...edge(-1).reverse()];
}

function arcOutline(center, inner, outer, start, finish) {
  const steps = Math.ceil((finish - start) / 4);
  const edge = radius => Array.from({ length: steps + 1 }, (_, index) => {
    const angle = radians(start + (finish - start) * index / steps);
    return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
  });
  return [...edge(outer), ...edge(inner).reverse()];
}

function keeperOutline(center) {
  const outer = arcOutline([0, 0], 68, 72, 43, 96);
  const count = outer.length / 2;
  const before = outer.slice(0, count).filter(point => point[0] > 4);
  const after = outer.slice(0, count).filter(point => point[0] < -4);
  const shoulder = Math.sqrt(72 ** 2 - 4 ** 2);
  return [...before, [4, shoulder], [4, 102], [-4, 102], [-4, shoulder], ...after,
    ...outer.slice(count)].map(point => [point[0] + center[0], point[1] + center[1]]);
}

function prism(name, role, across, thickness, polygon, motion = 'fixed', color = palette.plate) {
  return { name, role, across: [across - thickness / 2, across + thickness / 2], polygon, motion, color };
}

function cylinder(name, role, across, length, center, radius, motion = 'fixed', color = palette.shaft) {
  return { name, role, across: [across - length / 2, across + length / 2], center, radius, motion, color };
}

function block(name, role, center, size, motion = 'fixed', color = palette.frame) {
  return prism(name, role, center[0], size[0], rectangle(center[1], center[2], size[1], size[2]), motion, color);
}

function movePart(part, pose, settings) {
  const shift = part.motion === 'keeper' ? part.axialSide * pose.keeper :
    part.motion === 'jaw' ? part.axialSide * (pose.jaw - settings.jawClosed) : 0;
  const transform = point => {
    let result = [...point];
    if (part.motion === 'carrier' || part.motion === 'keeper') result = rotatePoint(result, pose.angle, settings);
    return result;
  };
  return { ...part, across: part.across.map(value => value + shift),
    polygon: part.polygon?.map(transform), center: part.center && transform(part.center) };
}

function canonicalParts(settings) {
  const parts = [];
  const connections = [];
  const add = part => { parts.push(part); return part.name; };
  const connect = (...names) => {
    for (let first = 0; first < names.length; first++) {
      for (let second = first + 1; second < names.length; second++) connections.push([names[first], names[second]]);
    }
  };
  const coralCenter = [settings.acquireY, settings.acquireZ];
  const handoff = rotatePoint(coralCenter, radians(settings.handoffDegrees), settings);
  const radialLength = distance(coralCenter, [settings.pivotY, settings.pivotZ]);
  const contactDistance = settings.coralOD / 2 + settings.rollerRadius;
  const radial = [(settings.pivotY - coralCenter[0]) / radialLength,
    (settings.pivotZ - coralCenter[1]) / radialLength];
  const contactCenter = side => [coralCenter[0] + side * radial[0] * contactDistance,
    coralCenter[1] + side * radial[1] * contactDistance];
  const fingerMount = angle => [coralCenter[0] + 64 * Math.cos(radians(angle)),
    coralCenter[1] + 64 * Math.sin(radians(angle))];
  const platePoints = [[settings.pivotY, settings.pivotZ], [60, 235], [-80, 235], [-230, 120],
    contactCenter(1), fingerMount(306), fingerMount(230), contactCenter(-1), [-430, 40]];
  const outline = ribbonOutline(platePoints, settings.ribbonWidth);
  const pivot = add(cylinder('Fixed transverse pivot shaft', 'pivot-shaft', 0, 620,
    [settings.pivotY, settings.pivotZ], 10));
  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'negative-x' : 'positive-x';
    const tower = add(block(`Pivot mount ${suffix}`, 'mount-structure',
      [side * 300, settings.pivotY, (55 + settings.pivotZ) / 2], [20, 28, settings.pivotZ - 55]));
    const cheek = add(prism(`Dogleg ribbon cheek ${suffix}`, 'carrier-cheek',
      side * settings.plateAcross, settings.plateThickness, outline, 'carrier'));
    connect(pivot, tower, cheek);
    const guide = add(cylinder(`Axial retention disc ${suffix}`, 'axial-guide', side * 162, 4,
      coralCenter, 52, 'carrier', palette.rail));
    const hub = add(cylinder(`Retention disc mounting pin ${suffix}`, 'guide-mount-shaft', side * 211,
      94, coralCenter, 6, 'carrier'));
    const link = add(block(`Retention disc mounting link ${suffix}`, 'guide-mount',
      [side * 255, settings.acquireY, (12 + settings.acquireZ + 94) / 2],
      [8, 12, settings.acquireZ + 94 - 12], 'carrier'));
    connect(guide, hub, link, cheek);
    const keeperRail = add(block(`Keeper slide rail ${suffix}`, 'keeper-guide-rail',
      [side * 236.5, settings.acquireY, settings.acquireZ + 100], [43, 12, 12], 'carrier', palette.rail));
    connect(keeperRail, link);
    for (const [index, range] of [[224, 236], [304, 344]].entries()) {
      add(prism(`Lower retention finger ${suffix} ${index + 1}`, 'retention-finger', side * 80, 8,
        arcOutline(coralCenter, 62, 66, ...range), 'carrier', palette.rail));
    }
    add(prism(`Sliding upper keeper ${suffix}`, 'keeper-finger', side * 80, 8,
      keeperOutline(coralCenter), 'keeper', palette.climb));
    parts.at(-1).axialSide = side;
    const keeperPin = add(cylinder(`Keeper sliding pinbar ${suffix}`, 'keeper-crossbar', side * 150, 140,
      [settings.acquireY, settings.acquireZ + 100], 5, 'keeper', palette.climb));
    parts.at(-1).axialSide = side;
    connect(keeperPin, `Sliding upper keeper ${suffix}`);
    connect(keeperPin, keeperRail);
    for (const index of [1, 2]) {
      const angle = index === 1 ? radians(230) : radians(306);
      const center = [coralCenter[0] + 64 * Math.cos(angle), coralCenter[1] + 64 * Math.sin(angle)];
      const tie = add(cylinder(`Lower finger mounting tie ${suffix} ${index}`, 'finger-mount-shaft',
        side * 167.5, 175, center, 3, 'carrier'));
      connect(tie, `Lower retention finger ${suffix} ${index}`, cheek);
    }
  }
  for (const side of [-1, 1]) {
    const label = side > 0 ? 'Rear driven' : 'Front carrier-locked';
    const center = contactCenter(side);
    const shaft = add(cylinder(`${label} roller shaft`, side > 0 ? 'driven-shaft' : 'locked-shaft', 0,
      settings.shaftHalfLength * 2, center, 6.35, 'carrier'));
    connect(shaft, 'Dogleg ribbon cheek negative-x', 'Dogleg ribbon cheek positive-x');
    for (const [index, interval] of [[-98, 98]].entries()) {
      const drum = add(cylinder(`${label} drum ${index + 1}`, side > 0 ? 'driven-contact' : 'locked-contact',
        (interval[0] + interval[1]) / 2, interval[1] - interval[0], center, settings.rollerRadius,
        'carrier', side > 0 ? 0x669d72 : 0x677079));
      connect(shaft, drum);
    }
  }
  const supportDirection = [(handoff[1] - settings.pivotZ) / radialLength,
    -(handoff[0] - settings.pivotY) / radialLength];
  const receiverPoint = (radial, tangent = 0) => [
    handoff[0] + supportDirection[0] * radial - supportDirection[1] * tangent,
    handoff[1] + supportDirection[1] * radial + supportDirection[0] * tangent];
  const supportCenter = receiverPoint(110);
  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'negative-x' : 'positive-x';
    const addSlider = part => { part.axialSide = side; return add(part); };
    const finger = addSlider(prism(`Receiver axial cage ${suffix}`, 'receiver-cage',
      side * settings.jawClosed, 30, arcOutline(handoff, 58.5, 59.5, 102, 438), 'jaw', palette.rail));
    for (const padSide of [-1, 1]) {
      const pad = addSlider(block(`Receiver contact pad ${suffix} ${padSide}`, 'receiver-pad',
        [side * settings.jawClosed, handoff[0] + padSide * (settings.coralOD / 2 + 1.5), handoff[1]],
        [30, 3, 12], 'jaw', palette.rubber));
      connect(finger, pad);
    }
    const stem = addSlider(prism(`Receiver finger stem ${suffix}`, 'receiver-finger-mount',
      side * settings.jawClosed, 30,
      [[58, -4], [110, -4], [110, 4], [58, 4]].map(point => receiverPoint(...point)), 'jaw', palette.rail));
    const pin = addSlider(cylinder(`Receiver axial pinbar ${suffix}`, 'receiver-crossbar',
      side * (settings.jawClosed + 20), 40, supportCenter, 5, 'jaw', palette.rail));
    const stop = addSlider(prism(`Receiver axial stop ${suffix}`, 'receiver-axial-stop', side * 155, 3,
      [[54, -8], [56, -8], [56, -3], [110, -3], [110, 3], [56, 3], [56, 8], [54, 8]]
        .map(point => receiverPoint(...point)), 'jaw', palette.rail));
    const guide = add(prism(`Receiver slide guide ${suffix}`, 'receiver-slide-guide', side * 229, 162,
      [[104, -8], [118, -8], [118, 8], [104, 8], [104, 5], [115, 5], [115, -5], [104, -5]]
        .map(point => receiverPoint(...point))));
    const post = add(block(`Receiver chassis post ${suffix}`, 'receiver-mount',
      [side * settings.receiverSupportAcross, supportCenter[0], (supportCenter[1] - 6 + 55) / 2],
      [20, 20, supportCenter[1] - 6 - 55]));
    connect(finger, stem);
    connect(stem, pin);
    connect(pin, stop);
    connect(pin, guide);
    connect(guide, post);
  }
  return { parts, connections, radial, radialLength };
}

function referenceParts(settings, mount) {
  const handoff = rotatePoint([settings.acquireY, settings.acquireZ], radians(settings.handoffDegrees), settings);
  const supportY = handoff[0] + 110 * (handoff[1] - settings.pivotZ) /
    distance(handoff, [settings.pivotY, settings.pivotZ]);
  const crossmembers = [
    block('Pivot mounting chassis crossmember', 'frame', [0, settings.pivotY, 40],
      [mount === 'front' ? 700 : 760, 25, 30], 'context'),
    block('Receiver mounting chassis crossmember', 'frame', [0, supportY, 40],
      [mount === 'front' ? 700 : 760, 25, 30], 'context'),
  ];
  const globalParts = [
    block('Front intact bumper', 'bumper', [0, -42.5, 105], [870, 85, 120], 'context', palette.bumper),
    block('Rear intact bumper', 'bumper', [0, 802.5, 105], [870, 85, 120], 'context', palette.bumper),
    block('Left intact bumper', 'bumper', [-392.5, 380, 105], [85, 760, 120], 'context', palette.bumper),
    block('Right intact bumper', 'bumper', [392.5, 380, 105], [85, 760, 120], 'context', palette.bumper),
    block('Front thin chassis rail', 'frame', [0, 12.5, 40], [700, 25, 30], 'context'),
    block('Rear thin chassis rail', 'frame', [0, 747.5, 40], [700, 25, 30], 'context'),
    block('Left thin chassis rail', 'frame', [-337.5, 380, 40], [25, 710, 30], 'context'),
    block('Right thin chassis rail', 'frame', [337.5, 380, 40], [25, 710, 30], 'context'),
  ];
  if (mount === 'front') return [...globalParts, ...crossmembers];
  if (mount !== 'left' && mount !== 'right') throw new Error(`Unknown mount ${mount}`);
  return [...globalParts.map(part => {
    const rearward = part.polygon.map(point => point[0]);
    const up = part.polygon.map(point => point[1]);
    const across = mount === 'left' ? [380 - Math.max(...rearward), 380 - Math.min(...rearward)] :
      [Math.min(...rearward) - 380, Math.max(...rearward) - 380];
    const localY = mount === 'left' ? part.across.map(value => value + 350) : part.across.map(value => 350 - value);
    return { ...part, across, polygon: rectangle((Math.min(...localY) + Math.max(...localY)) / 2,
      (Math.min(...up) + Math.max(...up)) / 2, Math.max(...localY) - Math.min(...localY), Math.max(...up) - Math.min(...up)) };
  }), ...crossmembers];
}

export function assemblyAt(state = 'acquire', progress = 1, mount = 'front', overrides = {}) {
  const settings = parameters(overrides);
  const pose = poseAt(state, progress, settings);
  const canonical = canonicalParts(settings);
  const parts = canonical.parts.map(part => movePart(part, pose, settings));
  const coral = cylinder('Nominal hollow coral', 'gamepiece', 0, settings.coralLength, pose.coral,
    settings.coralOD / 2, pose.owner === 'carrier' ? 'carrier' : 'fixed', palette.coral);
  return { settings, pose, parts, coral, references: referenceParts(settings, mount), canonical };
}

export function boundsOf(part) {
  if (part.bounds) return part.bounds;
  const rearward = part.polygon?.map(point => point[0]);
  const up = part.polygon?.map(point => point[1]);
  return [part.across,
    rearward ? [Math.min(...rearward), Math.max(...rearward)] : [part.center[0] - part.radius, part.center[0] + part.radius],
    up ? [Math.min(...up), Math.max(...up)] : [part.center[1] - part.radius, part.center[1] + part.radius]];
}

function segmentDistance(point, start, end) {
  const delta = [end[0] - start[0], end[1] - start[1]];
  const lengthSquared = delta[0] ** 2 + delta[1] ** 2;
  const fraction = lengthSquared ? clamp(((point[0] - start[0]) * delta[0] + (point[1] - start[1]) * delta[1]) / lengthSquared) : 0;
  return distance(point, [start[0] + fraction * delta[0], start[1] + fraction * delta[1]]);
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

function cross(first, second, third) {
  return (second[0] - first[0]) * (third[1] - first[1]) - (second[1] - first[1]) * (third[0] - first[0]);
}

function edgesCross(first, second, third, fourth) {
  return cross(first, second, third) * cross(first, second, fourth) < 0 &&
    cross(third, fourth, first) * cross(third, fourth, second) < 0;
}

function planarGap(first, second) {
  if (first.center && second.center) return distance(first.center, second.center) - first.radius - second.radius;
  if (first.center || second.center) {
    const circle = first.center ? first : second;
    const polygon = first.polygon || second.polygon;
    const nearest = Math.min(...polygon.map((point, index) => segmentDistance(circle.center, point, polygon[(index + 1) % polygon.length])));
    return (inside(circle.center, polygon) ? -nearest : nearest) - circle.radius;
  }
  if (inside(first.polygon[0], second.polygon) || inside(second.polygon[0], first.polygon)) return -0.001;
  let nearest = Infinity;
  for (let firstIndex = 0; firstIndex < first.polygon.length; firstIndex++) {
    const firstStart = first.polygon[firstIndex];
    const firstEnd = first.polygon[(firstIndex + 1) % first.polygon.length];
    for (let secondIndex = 0; secondIndex < second.polygon.length; secondIndex++) {
      const secondStart = second.polygon[secondIndex];
      const secondEnd = second.polygon[(secondIndex + 1) % second.polygon.length];
      if (edgesCross(firstStart, firstEnd, secondStart, secondEnd)) return -0.001;
      nearest = Math.min(nearest, segmentDistance(firstStart, secondStart, secondEnd),
        segmentDistance(firstEnd, secondStart, secondEnd), segmentDistance(secondStart, firstStart, firstEnd),
        segmentDistance(secondEnd, firstStart, firstEnd));
    }
  }
  return nearest;
}

function intervalGap(first, second) {
  return Math.max(first[0] - second[1], second[0] - first[1]);
}

export function clearance(first, second) {
  const across = intervalGap(first.across, second.across);
  const planar = planarGap(first, second);
  if (across > 0 || planar > 0) return Math.hypot(Math.max(0, across), Math.max(0, planar));
  return Math.max(across, planar);
}

function boxGap(first, second) {
  const firstBounds = boundsOf(first);
  const secondBounds = boundsOf(second);
  return Math.hypot(...firstBounds.map((axis, index) => Math.max(0, intervalGap(axis, secondBounds[index]))));
}

function radiusFromPivot(part, settings) {
  const pivot = [settings.pivotY, settings.pivotZ];
  if (part.center) return distance(part.center, pivot) + part.radius;
  return Math.max(...part.polygon.map(point => distance(point, pivot)));
}

function movementBound(part, angleStep, keeperStep, jawStep, settings) {
  if (part.motion === 'carrier' || part.motion === 'keeper') {
    return radiusFromPivot(part, settings) * Math.abs(angleStep) / 2 +
      (part.motion === 'keeper' ? Math.abs(keeperStep) / 2 : 0);
  }
  return part.motion === 'jaw' ? Math.abs(jawStep) / 2 : 0;
}

function pairMovement(first, second, angleStep, keeperStep, jawStep, settings) {
  const carrier = motion => motion === 'carrier' || motion === 'keeper';
  if (carrier(first.motion) && carrier(second.motion)) {
    const firstSlide = first.motion === 'keeper' ? first.axialSide : 0;
    const secondSlide = second.motion === 'keeper' ? second.axialSide : 0;
    return Math.abs((firstSlide - secondSlide) * keeperStep) / 2;
  }
  if (first.motion === 'jaw' && second.motion === 'jaw') {
    return Math.abs((first.axialSide - second.axialSide) * jawStep) / 2;
  }
  return movementBound(first, angleStep, keeperStep, jawStep, settings) +
    movementBound(second, angleStep, keeperStep, jawStep, settings);
}

function rollerContactBound(rollerPart, coral, pose, before, after, settings) {
  if (coral.motion === 'carrier') return clearance(rollerPart, coral);
  const offsets = [before.angle - pose.angle, after.angle - pose.angle];
  const minimum = Math.min(...offsets);
  const maximum = Math.max(...offsets);
  const rollerAngle = Math.atan2(rollerPart.center[1] - settings.pivotZ, rollerPart.center[0] - settings.pivotY);
  const coralAngle = Math.atan2(coral.center[1] - settings.pivotZ, coral.center[0] - settings.pivotY);
  for (let turn = -2; turn <= 2; turn++) {
    const offset = coralAngle - rollerAngle + turn * Math.PI * 2;
    if (offset >= minimum && offset <= maximum) offsets.push(offset);
  }
  return Math.min(...offsets.map(offset => clearance({ ...rollerPart,
    center: rotatePoint(rollerPart.center, offset, settings) }, coral)));
}

function worldBounds(part, mount) {
  return placedBounds(boundsOf(part), mount);
}

function placedBounds(bounds, mount) {
  const corners = [];
  for (const across of bounds[0]) for (const rearward of bounds[1]) for (const up of bounds[2]) {
    corners.push(placePoint([across, rearward, up], mount));
  }
  return [0, 1, 2].map(axis => [Math.min(...corners.map(point => point[axis])), Math.max(...corners.map(point => point[axis]))]);
}

function extensionMargin(part, mount, settings) {
  return extensionFromBounds(worldBounds(part, mount), settings);
}

function extensionFromBounds(bounds, settings) {
  return Math.min(bounds[0][0] + 350 + settings.extensionLimit,
    350 + settings.extensionLimit - bounds[0][1], bounds[1][0] + settings.extensionLimit,
    760 + settings.extensionLimit - bounds[1][1]);
}

function stowMargin(part, mount, settings) {
  const bounds = worldBounds(part, mount);
  return Math.min(bounds[0][0] + 350, 350 - bounds[0][1], bounds[1][0],
    760 - bounds[1][1], bounds[2][0], settings.heightLimit - bounds[2][1]);
}

function arcExtrema(point, minimum, maximum, settings) {
  const pivot = [settings.pivotY, settings.pivotZ];
  const angle = Math.atan2(point[1] - pivot[1], point[0] - pivot[0]);
  const points = [rotatePoint(point, minimum, settings), rotatePoint(point, maximum, settings)];
  for (let quarter = -8; quarter <= 8; quarter++) {
    const offset = quarter * Math.PI / 2 - angle;
    if (offset >= minimum && offset <= maximum) points.push(rotatePoint(point, offset, settings));
  }
  return points;
}

export function sweptBoundsOf(part, pose, before, after, settings = definition.dimensions) {
  if (part.motion !== 'carrier' && part.motion !== 'keeper' && part.motion !== 'jaw') return boundsOf(part);
  if (part.motion === 'jaw') {
    const bounds = boundsOf(part).map(interval => [...interval]);
    const offsets = [before.jaw, after.jaw].map(jaw => part.axialSide * (jaw - pose.jaw));
    bounds[0][0] += Math.min(...offsets);
    bounds[0][1] += Math.max(...offsets);
    return bounds;
  }
  const angles = [before.angle - pose.angle, after.angle - pose.angle];
  const shifts = part.motion === 'keeper' ?
    [before.keeper - pose.keeper, after.keeper - pose.keeper].map(value => part.axialSide * value) : [0];
  const points = [];
  for (const point of part.polygon || [part.center]) {
    points.push(...arcExtrema(point, Math.min(...angles), Math.max(...angles), settings));
  }
  const radius = part.radius || 0;
  return [[part.across[0] + Math.min(...shifts), part.across[1] + Math.max(...shifts)],
    [Math.min(...points.map(point => point[0])) - radius, Math.max(...points.map(point => point[0])) + radius],
    [Math.min(...points.map(point => point[1])) - radius, Math.max(...points.map(point => point[1])) + radius]];
}

export function pickupScreen(overrides = {}) {
  const settings = parameters(overrides);
  const normalY = (settings.pivotY - settings.acquireY) /
    distance([settings.pivotY, settings.pivotZ], [settings.acquireY, settings.acquireZ]);
  const cases = [];
  for (const yaw of [-10, -5, -2, 0, 2, 5, 10]) for (const offset of [-15, -10, -5, 0, 5, 10, 15]) {
    const angle = radians(yaw);
    const acrossHalfExtent = settings.coralLength / 2 * Math.abs(Math.cos(angle)) + settings.coralOD / 2 * Math.abs(Math.sin(angle));
    const normalDotAxis = normalY * Math.sin(angle);
    const contactNormalHalfExtent = settings.coralLength / 2 * Math.abs(normalDotAxis) +
      settings.coralOD / 2 * Math.sqrt(1 - normalDotAxis ** 2);
    const axialMargin = 160 - Math.abs(offset) - acrossHalfExtent;
    const capturedSlabMargin = settings.coralOD / 2 - contactNormalHalfExtent;
    cases.push({ yawDegrees: yaw, axialOffsetMm: offset, fullAcrossHalfExtentMm: acrossHalfExtent,
      axialMarginMm: axialMargin, conservativeOpposedTangentSlabMarginMm: capturedSlabMargin,
      certifiedRigidSlotFit: axialMargin >= -1e-8 && capturedSlabMargin >= -1e-8 });
  }
  return { method: 'Exact support extent of the full yawed finite cylinder against axial guide planes and opposed tangent half-spaces. A failed sufficient-condition screen is not a measured pickup failure.',
    certifiedYawDegrees: 0, certifiedAxialHalfRangeMm: 160 - settings.coralLength / 2,
    guaranteedAcquisition: false, cases };
}

function connectivity(settings, canonical) {
  const pose = poseAt('transfer', 0, settings);
  const parts = canonical.parts.map(part => movePart(part, pose, settings));
  const map = new Map(parts.map(part => [part.name, part]));
  const neighbors = new Map(parts.map(part => [part.name, new Set()]));
  for (const [firstName, secondName] of canonical.connections) {
    if (clearance(map.get(firstName), map.get(secondName)) <= 0.25) {
      neighbors.get(firstName).add(secondName);
      neighbors.get(secondName).add(firstName);
    }
  }
  const reached = new Set(parts.filter(part => part.role === 'mount-structure' || part.role === 'receiver-mount').map(part => part.name));
  const queue = [...reached];
  for (let index = 0; index < queue.length; index++) for (const neighbor of neighbors.get(queue[index])) {
    if (!reached.has(neighbor)) { reached.add(neighbor); queue.push(neighbor); }
  }
  return { status: reached.size === parts.length ? 'PASS' : 'FAIL', attachedBodyCount: reached.size,
    totalBodyCount: parts.length, unattachedBodies: parts.filter(part => !reached.has(part.name)).map(part => part.name),
    criterion: 'Named mechanical joints must form an actual touching geometry path to a chassis-supported tower; proximity is not fastener or bearing validation.' };
}

function drawPart(parent, part, settings) {
  let mesh;
  if (part.role === 'gamepiece') {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, settings.coralOD / 2, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, settings.coralBore / 2, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: settings.coralLength, bevelEnabled: false, curveSegments: 48 });
    geometry.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
    mesh = solid(parent, part.name, geometry, part.color, [part.across[0], ...part.center]);
  } else if (part.center) {
    mesh = axle(parent, part.name, [part.across[0], ...part.center], [part.across[1], ...part.center], part.radius, part.color);
  } else {
    mesh = sidePlate(parent, part.name, (part.across[0] + part.across[1]) / 2, part.polygon,
      part.across[1] - part.across[0], part.color);
  }
  mesh.userData = { role: part.role, partId: part.name, motion: part.motion,
    faces: part.center ? ['negative-x end', 'positive-x end', 'cylindrical contact or shaft surface'] :
      ['negative-x plate face', 'positive-x plate face', 'profile edge faces'],
    shaftAxis: part.center ? [1, 0, 0] : undefined,
    lockedToCarrier: part.role.startsWith('locked'), powered: part.role.startsWith('driven') };
}

export function buildModel(state = 'acquire', progress = 1, mount = 'front', overrides = {}) {
  const assembly = assemblyAt(state, progress, mount, overrides);
  const root = new THREE.Group();
  root.name = `B retained carry ${mount} ${state}`;
  const core = new THREE.Group();
  core.name = 'Rigidly transformed intake core and reference geometry';
  root.add(core);
  for (const part of [...assembly.references, ...assembly.parts, assembly.coral]) drawPart(core, part, assembly.settings);
  if (mount === 'left') { core.rotation.z = -Math.PI / 2; core.position.set(-350, 380, 0); }
  if (mount === 'right') { core.rotation.z = Math.PI / 2; core.position.set(350, 380, 0); }
  const floor = Math.min(...assembly.parts.map(part => boundsOf(part)[2][0]));
  root.userData = {
    candidateId: 'B', state, progress, mount, parameters: assembly.settings,
    coralPose: { center: placePoint([0, ...assembly.pose.coral], mount),
      axis: mount === 'front' ? [1, 0, 0] : mount === 'left' ? [0, -1, 0] : [0, 1, 0],
      owner: assembly.pose.owner, length: assembly.settings.coralLength,
      outsideDiameter: assembly.settings.coralOD, bore: assembly.settings.coralBore },
    kinematics: { carrierAngleRadians: assembly.pose.angle, keeperSlideMm: assembly.pose.keeper,
      receiverJawInnerOffsetMm: assembly.pose.jaw, receiverSlideAxis: 'x',
      receiverAxialTravelMm: assembly.pose.jaw - assembly.settings.jawClosed, independentInputs: 4,
      inputInventory: ['carrier rotary axis', 'rear roller drive', 'synchronized split axial keeper slides',
        'synchronized opposed axial receiver cages'], frontRoller: 'carrier-locked, not world-locked' },
    checks: { scope: 'instantaneous display only; evaluate() owns continuous gate',
      hardwareFloorMarginMm: floor, physicalSuccessClaimed: false, geometryReady: false },
  };
  root.updateMatrixWorld(true);
  return root;
}

export function evaluate(overrides = {}) {
  const settings = parameters(overrides);
  const canonical = canonicalParts(settings);
  const connected = new Set(canonical.connections.map(names => names.sort().join('|')));
  const gates = {};
  const phaseGates = {};
  const record = (name, measured, lowerBound, required, witness) => {
    const entry = { criterion: name, status: lowerBound >= required - 1e-8 ? 'PASS' : 'FAIL',
      sampledMarginMm: measured, lowerBoundMm: lowerBound, requiredMm: required,
      evidence: measured < -1e-8 ? 'sampled overlap' : lowerBound < required - 1e-8 ? 'continuous margin not certified' : 'certified bound', witness };
    const worse = previous => !previous || lowerBound < previous.lowerBoundMm ||
      (lowerBound === previous.lowerBoundMm && measured < previous.sampledMarginMm);
    if (worse(gates[name])) gates[name] = entry;
    const phaseKey = `${name}.${witness.phase}`;
    if (worse(phaseGates[phaseKey])) phaseGates[phaseKey] = entry;
  };
  const phases = [
    ['capture', 0, 1, 76], ['transfer', 0, 1, settings.samplesPerRotation],
    ['handoff', 0, 0.3, 76], ['handoff', 0.3, 0.55, 76],
    ['handoff', 0.55, 1, settings.samplesPerRotation],
    ['stow', 0, 1, 76],
  ];
  let inspectedPoses = 0;
  let exactPairTests = 0;
  const staticChecked = new Set();
  for (const mount of ['front', 'left']) {
    const references = referenceParts(settings, mount);
    for (const [state, begin, end, count] of phases) {
      const start = poseAt(state, begin, settings);
      const finish = poseAt(state, end, settings);
      const angleStep = (finish.angle - start.angle) / (count - 1);
      const keeperStep = (finish.keeper - start.keeper) / (count - 1);
      const jawStep = (finish.jaw - start.jaw) / (count - 1);
      for (let index = 0; index < count; index++) {
        const progress = begin + (end - begin) * index / (count - 1);
        const pose = poseAt(state, progress, settings);
        const parts = canonical.parts.map(part => movePart(part, pose, settings));
        for (const part of parts) part.bounds = boundsOf(part);
        const before = poseAt(state, Math.max(begin, progress - (end - begin) / (count - 1) / 2), settings);
        const after = poseAt(state, Math.min(end, progress + (end - begin) / (count - 1) / 2), settings);
        const coral = cylinder('Nominal hollow coral', 'gamepiece', 0, settings.coralLength, pose.coral,
          settings.coralOD / 2, pose.owner === 'carrier' && state !== 'handoff' ? 'carrier' : 'fixed');
        inspectedPoses++;
        const witness = { mount, state, phase: `${state}:${begin}-${end}`, progress, angleDegrees: pose.angle * 180 / Math.PI, owner: pose.owner };
        for (const part of [...parts, coral]) {
          const motion = movementBound(part, angleStep, keeperStep, jawStep, settings);
          const kind = part.role === 'gamepiece' ? 'coral' : 'hardware';
          const partWitness = { ...witness, part: part.name };
          const swept = sweptBoundsOf(part, pose, before, after, settings);
          const floor = boundsOf(part)[2][0];
          record(`${mount}.${kind}.floor`, floor, swept[2][0], 0, partWitness);
          const extension = extensionMargin(part, mount, settings);
          record(`${mount}.${kind}.extension`, extension, extensionFromBounds(placedBounds(swept, mount), settings),
            kind === 'hardware' ? settings.requiredExtensionMargin : 0, partWitness);
          if (state === 'stow' && index === count - 1) {
            const margin = stowMargin(part, mount, settings);
            record(`${mount}.${kind}.stow`, margin, margin, 0, partWitness);
          }
          for (const obstacle of references) {
            const key = `${mount}.${kind}.${obstacle.role}`;
            const broadGap = boxGap(part, obstacle);
            if (broadGap > 0 && broadGap - motion > (phaseGates[`${key}.${witness.phase}`]?.lowerBoundMm ?? Infinity)) continue;
            const gap = clearance(part, obstacle);
            exactPairTests++;
            const mountContact = (part.role === 'mount-structure' && obstacle.name === 'Pivot mounting chassis crossmember') ||
              (part.role === 'receiver-mount' && obstacle.name === 'Receiver mounting chassis crossmember');
            if (mountContact && gap >= -1e-8) {
              record(`${mount}.hardware.mountAttachment`, gap, gap, 0, { ...partWitness, obstacle: obstacle.name });
            } else record(key, gap, gap - motion, settings.requiredClearance, { ...partWitness, obstacle: obstacle.name });
          }
        }
        for (let firstIndex = 0; firstIndex < parts.length; firstIndex++) {
          const first = parts[firstIndex];
          for (const second of [...parts.slice(firstIndex + 1), coral]) {
            const names = [first.name, second.name].sort().join('|');
            if (connected.has(names)) continue;
            const coMoving = first.motion === second.motion &&
              (!['jaw', 'keeper'].includes(first.motion) || first.axialSide === second.axialSide);
            const pairKey = `${mount}|${names}|${state}|${begin}`;
            if (coMoving && staticChecked.has(pairKey)) continue;
            if (coMoving) staticChecked.add(pairKey);
            const isCoral = second.role === 'gamepiece';
            if (isCoral && first.role.endsWith('-contact')) {
              record(`${mount}.contact.roller`, clearance(first, second),
                rollerContactBound(first, second, pose, before, after, settings), 0,
                { ...witness, part: first.name, obstacle: second.name, deliberateContact: true });
              continue;
            }
            if (isCoral && first.role === 'receiver-pad' && state === 'handoff') {
              const gap = clearance(first, second);
              const lower = Math.max(0, intervalGap(sweptBoundsOf(first, pose, before, after, settings)[0], second.across));
              record(`${mount}.contact.receiverPad`, gap, Math.min(gap, lower), 0,
                { ...witness, part: first.name, obstacle: second.name, deliberateContact: true });
              continue;
            }
            const group = isCoral ? 'coral.hardware' :
              first.role.startsWith('receiver') || second.role.startsWith('receiver') ? 'receiver.hardware' : 'carrier.hardware';
            const key = `${mount}.${group}`;
            const bound = pairMovement(first, second, angleStep, keeperStep, jawStep, settings);
            const broadGap = boxGap(first, second);
            if (broadGap > 0 && broadGap - bound > (phaseGates[`${key}.${witness.phase}`]?.lowerBoundMm ?? Infinity)) continue;
            const gap = clearance(first, second);
            exactPairTests++;
            const axialGap = intervalGap(sweptBoundsOf(first, pose, before, after, settings)[0],
              sweptBoundsOf(second, pose, before, after, settings)[0]);
            const planarLower = planarGap(first, second) - pairMovement(first, second, angleStep, 0, 0, settings);
            const lower = Math.max(axialGap, planarLower, gap - bound);
            record(key, gap, lower, settings.requiredClearance,
              { ...witness, part: first.name, obstacle: second.name, deliberateContact: false });
          }
        }
      }
    }
  }
  const handoff = poseAt('transfer', 1, settings);
  const structure = connectivity(settings, canonical);
  record('structure.connectedBodies', structure.attachedBodyCount - structure.totalBodyCount,
    structure.attachedBodyCount - structure.totalBodyCount, 0, { phase: 'assembly', unattachedBodies: structure.unattachedBodies });
  const acquired = canonical.parts.filter(part => part.role.endsWith('-contact'));
  const finiteContact = acquired.map(part => ({ part: part.name, axialIntervalMm: part.across,
    coralOverlapMm: Math.max(0, Math.min(part.across[1], settings.coralLength / 2) -
      Math.max(part.across[0], -settings.coralLength / 2)),
    radialContactGapMm: distance(part.center, [settings.acquireY, settings.acquireZ]) - part.radius - settings.coralOD / 2,
    mode: part.role === 'driven-contact' ? 'powered' : 'locked relative to carrier' }));
  const metrics = Object.values(gates);
  return {
    candidateId: 'B', result: metrics.every(gate => gate.status === 'PASS') ? 'PASS' : 'FAIL',
    geometryReady: metrics.every(gate => gate.status === 'PASS'), parameters: settings,
    scope: 'Rigid-body polygon/circle extrusion clearance with Lipschitz intersample bounds; not physical success.',
    inspectedPoses, exactPairTests, rotationSamplesEach: settings.samplesPerRotation,
    maximumRotationStepDegrees: Math.abs(settings.handoffDegrees) / (settings.samplesPerRotation - 1),
    conservativeMethod: 'Actual concave plate polygons and exact circular outer envelopes. Exact rotational extrema for floor/extension. General pairs use half-step travel, exact swept axial separation, and planar separation minus rotational travel (axial slides leave the planar profiles invariant). Exact relative circles for roller contacts and monotonic axial pad contact. Only named joints excluded; all full shafts checked. Phase minima independently populated.',
    polygonOverlapMeaning: '-0.001 mm means certified polygon overlap, not a computed penetration depth.',
    assemblyBodyMeshes: canonical.parts.length, referenceMeshes: 10, coralMeshes: 1,
    handoffCenterMm: [0, ...handoff.coral], stowCenterMm: [0, ...poseAt('stow', 1, settings).coral],
    degreesOfFreedom: { independentInputs: 4, positioning: 3, continuousRollerDrives: 1, lockedRollerAxes: 1 },
    structure,
    finiteContact,
    retention: { carrier: 'Two lower finger sectors, split axial upper keepers, opposed central rollers and axial end discs form a geometric cage when closed.',
      lowerOpeningChordUpperBoundMm: 2 * 66 * Math.sin(radians(34)), coralDiameterMm: settings.coralOD,
      keeperArcDegrees: [43, 96],
      keeperToLockedRollerGapUpperBoundMm: distance(
        [settings.acquireY + 68 * Math.cos(radians(96)), settings.acquireZ + 68 * Math.sin(radians(96))],
        acquired.find(part => part.role === 'locked-contact').center) - settings.rollerRadius,
      endDiscRadiusMm: 52, boreRadiusMm: settings.coralBore / 2,
      receiver: 'Two axially inserted C-cages with tangent pads and retained end stops; 336-degree wrap and a narrow opening provide geometric restraint without assuming pad friction. Close before split-keeper withdrawal, then return carrier. Thin 1 mm radial cage section is not load-qualified.',
      receiverFingerSlotSideMarginMm: 7, receiverClosedVerticalOpeningUpperBoundMm: 2 * 59.5 * Math.sin(radians(12)),
      springAndActuation: 'Separate axial pinbars and rails on both sides, synchronized within each pair. Receiver U-rails have modeled stem slots. Keeper rail bearing bores and intentional pin/rail sliding joints are contact allowances, not detailed bearings. Keeper spring, stops, release actuator, pad force and transmissions remain unsized.' },
    pickupEnvelope: { validatedInitialYawDegrees: 0, validatedInitialAxialOffsetMm: 0,
      axialGuideFreeHalfGapMm: 160 - settings.coralLength / 2,
      assumption: 'Centered crosswise insertion only. Any clearance-derived yaw/offset fit is not a guaranteed capture or self-centering envelope.' },
    pickupScreen: pickupScreen(settings),
    parameterScreen: { handoffAnglesDegrees: [-140, -145, -150, -155, -160],
      method: 'Earlier local recipe: 181 points per transfer/handoff/stow phase, all receiver parts versus coral and carrier; not a continuous certificate or an optimization.',
      conclusion: 'Historical baseline only: no screened angle passed the earlier receiver and local-z keeper. Current geometry is judged by the live gates, not this obsolete screen.',
      originalPivotZ80: 'The supplied upper dogleg vertex reaches below -40 mm at -155 degrees. Pivot Z was raised to 140 mm without moving the acquired coral.' },
    gates: metrics, phaseGates: Object.values(phaseGates), failures: metrics.filter(gate => gate.status === 'FAIL'),
    intentionalJoints: canonical.connections,
    limitations: definition.limitations,
  };
}