import * as THREE from '../whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {bodyBounds, bodyGap, coralBodyGap, coralBoxGap, beltClosestGap, cylinderExtents, robotInMount} from './feed.mjs';
import {placePoint} from './mounts.mjs';

const radians = degrees => degrees * Math.PI / 180;
const degrees = angle => angle * 180 / Math.PI;
const clamp = value => Math.max(0, Math.min(1, value));
const mix = (first, second, fraction) => first + (second - first) * fraction;
const radius = 57.15;
const halfLength = 150.8125;
const thickness = 3;
const pivot = [80, 200];

export const dimensions = {
  coralLength: 301.625, coralDiameter: 114.3, coralBore: 101.6,
  compressionTotal: 3, compressionPerFace: 1.5, clearance: 5,
  extensionLimit: 457.2, startHeightLimit: 1066.8,
  pivot: [0, ...pivot], front: [-390, 33], crest: [-180, 201], tail: [0, 201],
  returnIdler: [-140, 148], noseLanes: [[-164, -79], [79, 164]],
  bankLanes: [[-74, -0.5], [0.5, 74]], bankEnds: [25, 415],
  lowerSurface: 229, upperSurface: 340.3, orientCenter: [0, 205, 284.65],
  receiver: [0, 455, 284.65], receiverLift: 180, receiverWithdraw: 145,
  frontStop: 27, backStop: 383, fenceInside: 180,
};

export const definition = {
  id: 'A', name: 'Supported return cassette with split-belt indexer', dimensions,
  ancestry: ['01 separate pickup/feed', '09 independent left/right indexer', '07 rigid front/left mounting'],
  states: ['acquire', 'capture', 'transfer', 'handoff', 'stow'],
  limits: [
    'Local geometry revision, not a selected finalist or measured reference-team CAD.',
    'Full finite horizontal cylinder; bore never excuses collision. Pitch transport is not established.',
    'Three millimeters TOTAL opposed indentation, not three millimeters on each face.',
    'Commanded yaw and differential belt contact do not prove traction, centering, sensed yaw or an achievable trajectory.',
    'A narrow acquisition result cannot substantiate elite arbitrary-orientation pickup.',
    'No network, Onshape, kernel, vendor CAD or physical test is used.',
  ],
};

export function turnPoint(point, angleDegrees) {
  const angle = radians(angleDegrees), cosine = Math.cos(angle), sine = Math.sin(angle);
  const rearward = point[0] - pivot[0], up = point[1] - pivot[1];
  return [pivot[0] + rearward * cosine + up * sine, pivot[1] - rearward * sine + up * cosine];
}

export function tangentLoop(drums) {
  const tangents = drums.map((drum, index) => {
    const next = drums[(index + 1) % drums.length];
    const delta = next.center.map((value, axis) => value - drum.center[axis]);
    const length = Math.hypot(...delta);
    const signed = drum.side * (drum.radius + thickness / 2);
    const nextSigned = next.side * (next.radius + thickness / 2);
    const cosine = (signed - nextSigned) / length;
    if (Math.abs(cosine) >= 1) throw new Error('No real common drum tangent');
    const sine = Math.sqrt(1 - cosine * cosine);
    const normal = [(delta[0] * cosine - delta[1] * sine) / length,
      (delta[1] * cosine + delta[0] * sine) / length];
    return {kind: 'line', start: drum.center.map((value, axis) => value + signed * normal[axis]),
      end: next.center.map((value, axis) => value + nextSigned * normal[axis]),
      from: drum.id, to: next.id};
  });
  return drums.flatMap((drum, index) => {
    const incoming = tangents[(index + drums.length - 1) % drums.length].end;
    const outgoing = tangents[index].start;
    const startAngle = Math.atan2(incoming[1] - drum.center[1], incoming[0] - drum.center[0]);
    let endAngle = Math.atan2(outgoing[1] - drum.center[1], outgoing[0] - drum.center[0]);
    if (drum.side > 0) while (endAngle > startAngle + 1e-10) endAngle -= 2 * Math.PI;
    else while (endAngle < startAngle - 1e-10) endAngle += 2 * Math.PI;
    return [{kind: 'arc', center: drum.center, radius: drum.radius + thickness / 2,
      startAngle, endAngle, drum: drum.id}, tangents[index]];
  });
}

export function lowerDrums() {
  return [
    {id: 'front', center: dimensions.front, radius: 25, side: 1},
    {id: 'crest', center: dimensions.crest, radius: 25, side: 1},
    {id: 'tail', center: dimensions.tail, radius: 25, side: 1},
    {id: 'return-idler', center: dimensions.returnIdler, radius: 25, side: -1},
  ];
}

export function beltSectionPoint(section, fraction) {
  if (section.kind === 'line') return section.start.map((value, axis) => mix(value, section.end[axis], fraction));
  const angle = mix(section.startAngle, section.endAngle, fraction);
  return section.center.map((value, axis) => value + section.radius * (axis ? Math.sin(angle) : Math.cos(angle)));
}

export function beltPolygons(body, angleStep = 2) {
  return body.sections.flatMap(section => {
    if (section.kind === 'line') {
      const angle = Math.atan2(section.end[1] - section.start[1], section.end[0] - section.start[0]) + Math.PI / 2;
      return [{outline: [[section.start, -1], [section.end, -1], [section.end, 1], [section.start, 1]].map(([point, side]) =>
        point.map((value, axis) => value + side * thickness / 2 * (axis ? Math.sin(angle) : Math.cos(angle)))), error: 0}];
    }
    const count = Math.max(1, Math.ceil(Math.abs(degrees(section.endAngle - section.startAngle)) / angleStep));
    const error = (section.radius + thickness / 2) * (1 - Math.cos((section.endAngle - section.startAngle) / count / 2));
    return Array.from({length: count}, (_, index) => ({outline: [[-1, index], [-1, index + 1], [1, index + 1], [1, index]].map(([side, sample]) =>
      beltSectionPoint({...section, radius: section.radius + side * thickness / 2}, sample / count)), error}));
  });
}

function belt(id, span, drums, assembly, bank, contactSide) {
  return {id, kind: 'belt', span, sections: tangentLoop(drums), drums, thickness,
    assembly, bank, contactSide, role: 'powered'};
}

export function lowerBelts() {
  return dimensions.noseLanes.map((span, bank) => belt(`nose-lower-${bank}`, span, lowerDrums(), 'nose', bank, 'lower'));
}

export function foldBounds(body, endDegrees = foldDegrees) {
  if (body.assembly !== 'nose') return bodyBounds(body);
  if (body.kind === 'belt') {
    const bounds = body.sections.flatMap(section => section.kind === 'arc' ?
      [foldBounds({...body, kind: 'circle', center: section.center, radius: section.radius + thickness / 2}, endDegrees)] :
      section.start.map((unused, index) => foldBounds({...body, kind: 'circle', center: index ? section.end : section.start, radius: thickness / 2}, endDegrees)));
    return {minimum: [0, 1, 2].map(axis => Math.min(...bounds.map(bound => bound.minimum[axis]))),
      maximum: [0, 1, 2].map(axis => Math.max(...bounds.map(bound => bound.maximum[axis])))};
  }
  const points = body.kind === 'circle' ? [body.center] : body.outline;
  const extrema = [[], []];
  for (const point of points) for (const axis of [0, 1]) {
    const cosine = point[axis] - pivot[axis], sine = axis ? pivot[0] - point[0] : point[1] - pivot[1];
    const angles = [0, radians(endDegrees)];
    const extreme = Math.atan2(sine, cosine);
    for (let winding = -2; winding <= 2; winding++) {
      const angle = extreme + winding * Math.PI;
      if (angle >= 0 && angle <= radians(endDegrees)) angles.push(angle);
    }
    extrema[axis].push(...angles.map(angle => pivot[axis] + cosine * Math.cos(angle) + sine * Math.sin(angle)));
  }
  const inflation = body.kind === 'circle' ? body.radius : 0;
  return {minimum: [body.span[0], ...extrema.map(values => Math.min(...values) - inflation)],
    maximum: [body.span[1], ...extrema.map(values => Math.max(...values) + inflation)]};
}

export const foldDegrees = degrees(Math.atan2(pivot[1] - dimensions.front[1], pivot[0] - dimensions.front[0])) + 90;
dimensions.foldDegrees = foldDegrees;

export function topologyProbe() {
  const lower = lowerBelts()[0];
  const returnLine = lower.sections.find(section => section.kind === 'line' && section.from === 'tail');
  const bounds = foldBounds(lower);
  return {returnUnderside: Math.min(returnLine.start[1], returnLine.end[1]) - thickness / 2,
    returnBumperGap: Math.min(returnLine.start[1], returnLine.end[1]) - thickness / 2 - 165,
    lowerFoldExtension: -bounds.minimum[1], extensionReserve: dimensions.extensionLimit + bounds.minimum[1],
    foldDegrees, analyticFrontRadius: Math.hypot(pivot[0] - dimensions.front[0], pivot[1] - dimensions.front[1]) + 28};
}

const slope = Math.atan2(168, 210);
const reach = radius + 28 - dimensions.compressionPerFace;
const normal = [-Math.sin(slope), Math.cos(slope)];
const initialAngle = Math.PI - Math.asin((radius - 33) / reach);
const topEntryCenter = [-416, radius + Math.sqrt(reach ** 2 - (-390 + reach * Math.cos(initialAngle) + 416) ** 2)];

function circle(id, span, center, bodyRadius, assembly, role, extra = {}) {
  return {id, kind: 'circle', span, center, radius: bodyRadius, assembly, role, ...extra};
}

function box(id, center, size, assembly, role, extra = {}) {
  const [across, rearward, up] = center, [width, length, height] = size;
  return {id, kind: 'prism', span: [across - width / 2, across + width / 2],
    outline: [[rearward - length / 2, up - height / 2], [rearward + length / 2, up - height / 2],
      [rearward + length / 2, up + height / 2], [rearward - length / 2, up + height / 2]], assembly, role, ...extra};
}

function ovalDrums(prefix, first, second, drumRadius) {
  return [{id: `${prefix}-front`, center: first, radius: drumRadius, side: 1},
    {id: `${prefix}-back`, center: second, radius: drumRadius, side: 1}];
}

export function workingBelts() {
  const upperStart = [-285, 117].map((value, axis) => value + 2 * reach * normal[axis]);
  const upperEnd = dimensions.crest.map((value, axis) => value + 2 * reach * normal[axis]);
  return [...lowerBelts(), ...dimensions.noseLanes.flatMap((span, bank) => [
    belt(`nose-upper-ramp-${bank}`, span, ovalDrums('ramp', upperStart, upperEnd, 25), 'nose', bank, 'upper'),
    belt(`nose-upper-flat-${bank}`, span, ovalDrums('flat', [-175, 368.3], [0, 368.3], 25), 'nose', bank, 'upper'),
  ]), ...dimensions.bankLanes.flatMap((span, bank) => [
    belt(`bank-lower-${bank}`, span, ovalDrums('lower', [25, 211], [415, 211], 15), 'fixed', bank, 'lower'),
    belt(`bank-upper-${bank}`, span, ovalDrums('upper', [25, 358.3], [415, 358.3], 15), 'fixed', bank, 'upper'),
  ])];
}

export function lowerPath(progress) {
  const arcPoint = (center, angle) => center.map((value, axis) => value + reach * (axis ? Math.sin(angle) : Math.cos(angle)));
  if (progress <= 0.2) return arcPoint(dimensions.front, mix(initialAngle, Math.PI / 2 + slope, progress / 0.2));
  if (progress <= 0.65) return arcPoint(dimensions.front.map((value, axis) => mix(value, dimensions.crest[axis], (progress - 0.2) / 0.45)), Math.PI / 2 + slope);
  if (progress <= 0.8) return arcPoint(dimensions.crest, mix(Math.PI / 2 + slope, Math.PI / 2, (progress - 0.65) / 0.15));
  return [mix(-180, 0, (progress - 0.8) / 0.2), dimensions.orientCenter[2]];
}

export function poseAt(state = 'acquire', progress = 1) {
  if (!definition.states.includes(state)) throw new Error(`Unknown cassette state ${state}`);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Progress must be in [0,1]');
  let center, yaw = 90, fold = 0, jaw = 0, cellFront = 0, cellBack = 0, withdraw = 0, lift = 0;
  if (state === 'acquire') center = [0, ...lowerPath(progress * 0.2)];
  if (state === 'capture') center = [0, ...lowerPath(mix(0.2, 1, progress))];
  if (state === 'transfer') {
    center = [0, mix(0, 205, clamp(progress / 0.4)), dimensions.orientCenter[2]];
    cellFront = clamp((progress - 0.4) / 0.2);
    yaw = mix(90, 0, clamp((progress - 0.6) / 0.4));
  }
  if (state === 'handoff' || state === 'stow') {
    const fraction = state === 'stow' ? 1 : progress;
    cellFront = 1; cellBack = clamp(fraction / 0.1); yaw = 0;
    jaw = clamp((fraction - 0.45) / 0.1);
    withdraw = dimensions.receiverWithdraw * (clamp((fraction - 0.55) / 0.15) - clamp((fraction - 0.85) / 0.15));
    lift = dimensions.receiverLift * clamp((fraction - 0.7) / 0.15);
    center = [0, mix(205, 455, clamp((fraction - 0.1) / 0.35)) + withdraw, 284.65 + lift];
    fold = state === 'stow' ? foldDegrees * progress : 0;
  }
  return {center, yaw, pitch: 0, fold, jaw, cellFront, cellBack, withdraw, lift, state, progress, commandedOnly: true};
}

export function controlAt({receiver = 'ready', occupied = false, yaw = 90} = {}) {
  if (!['ready', 'absent', 'waiting'].includes(receiver)) throw new Error('Unknown receiver condition');
  return {receiver, acquisitionEnabled: receiver === 'ready' && !occupied,
    drives: receiver === 'ready' ? 'external controller and measured yaw required' : [0, 0, 0],
    frontClosed: occupied || receiver !== 'ready', backClosed: true,
    pose: occupied ? {...poseAt('transfer', 0.6), yaw, cellFront: 1, cellBack: 0} : null,
    receiverAcceptance: 'External capture confirmation required before withdrawal; geometry is not a sensor.'};
}

function movedBody(body, pose) {
  if (body.assembly === 'nose') {
    if (body.kind === 'belt') return {...body, sections: body.sections.map(section => section.kind === 'line' ?
      {...section, start: turnPoint(section.start, pose.fold), end: turnPoint(section.end, pose.fold)} :
      {...section, center: turnPoint(section.center, pose.fold), startAngle: section.startAngle - radians(pose.fold), endAngle: section.endAngle - radians(pose.fold)})};
    return {...body, ...(body.kind === 'circle' ? {center: turnPoint(body.center, pose.fold)} :
      {outline: body.outline.map(point => turnPoint(point, pose.fold)), holes: body.holes?.map(hole => ({...hole, center: turnPoint(hole.center, pose.fold)}))})};
  }
  return body;
}

export function bodiesAt(state = 'acquire', progress = 1, override = null) {
  const pose = override ?? poseAt(state, progress), bodies = workingBelts();
  for (const beltBody of [...bodies]) {
    for (const drum of beltBody.drums) {
      const id = `${beltBody.id}-${drum.id}`;
      bodies.push(circle(`${id}-drum`, beltBody.span, drum.center, drum.radius, beltBody.assembly, 'drum', {joint: id, belt: beltBody.id}));
      bodies.push(circle(`${id}-shaft`, [beltBody.span[0] - 3, beltBody.span[1] + 3], drum.center, 4, beltBody.assembly, 'shaft', {joint: id}));
      for (const side of [0, 1]) {
        const across = beltBody.span[side] + (side ? 1.5 : -1.5);
        bodies.push(box(`${id}-bearing-${side}`, [across, ...drum.center], [3, 20, 20], beltBody.assembly, 'bearing',
          {joint: id, holes: [{center: drum.center, radius: 4.5}]}));
      }
    }
    const first = beltBody.drums[0], last = beltBody.drums.at(-1);
    for (const side of [0, 1]) {
      const spanCenter = beltBody.span[side] + (side ? 6 : -6);
      const delta = last.center.map((value, axis) => value - first.center[axis]);
      const magnitude = Math.hypot(...delta), offset = [-delta[1] / magnitude * 5, delta[0] / magnitude * 5];
      bodies.push({id: `${beltBody.id}-support-${side}`, kind: 'prism', span: [spanCenter - 2, spanCenter + 2],
        outline: [[first.center, -1], [last.center, -1], [last.center, 1], [first.center, 1]].map(([point, sign]) => point.map((value, axis) => value + sign * offset[axis])),
        assembly: beltBody.assembly, role: 'support'});
    }
  }
  for (const [bank, span] of dimensions.bankLanes.entries()) {
    const id = `floor-top-${bank}`;
    bodies.push(circle(id, span, topEntryCenter, 28, 'nose', 'powered', {contactSide: 'upper', bank, joint: id}));
    bodies.push(circle(`${id}-drum`, span, topEntryCenter, 25, 'nose', 'drum', {belt: id, joint: id}));
    bodies.push(circle(`${id}-shaft`, [span[0] - 3, span[1] + 3], topEntryCenter, 4, 'nose', 'shaft', {joint: id}));
    for (const side of [0, 1]) bodies.push(box(`${id}-bearing-${side}`, [span[side] + (side ? 1.5 : -1.5), ...topEntryCenter], [3, 20, 20], 'nose', 'bearing',
      {joint: id, holes: [{center: topEntryCenter, radius: 4.5}]}));
  }
  for (const side of [-1, 1]) {
    const platePoints = [[-404, 18], [-404, 48], [-185, 218], [80, 217], [97, 200], [80, 183], [-174, 184], [-380, 18]];
    bodies.push({id: `nose-sideplate-${side}`, kind: 'prism', span: [side * 215 - 3, side * 215 + 3], outline: platePoints,
      holes: [{center: pivot, radius: 9.5}], assembly: 'nose', role: 'plate', joint: `fold-${side}`});
    bodies.push(circle(`pivot-shaft-${side}`, [side * 215 - 15, side * 215 + 15], pivot, 9, 'fixed', 'shaft', {joint: `fold-${side}`}));
    bodies.push(box(`pivot-post-${side}`, [side * 225, 80, 169], [10, 22, 62], 'fixed', 'mount', {joint: `fold-${side}`}));
    bodies.push(box(`cell-fence-${side}`, [side * 183, 205, 284.65], [6, 338, 100], 'fixed', 'fence'));
    for (const [name, rearward, opening] of [['front', 27, 1 - pose.cellFront], ['back', 383, pose.cellBack]]) {
      const across = side * (80 + opening * 183), joint = `gate-${name}-leaf-${side}`;
      bodies.push(box(`cell-${name}-leaf-${side}`, [across, rearward, 284.65], [160, 6, 70], `gate-${name}`, 'gate', {joint}));
      bodies.push(box(`cell-${name}-hanger-${side}`, [side * (159 + opening * 183), rearward, 372], [4, 6, 175], `gate-${name}`, 'hanger', {joint}));
      bodies.push(box(`cell-${name}-slide-${side}`, [side * 250, rearward, 466], [188, 12, 12], 'fixed', 'slide'));
    }
    const jawAcross = side * mix(81.65, 59.65, pose.jaw);
    bodies.push(box(`receiver-jaw-${side}`, [jawAcross, 565 + pose.withdraw, 284.65 + pose.lift], [8, 90, 80], 'receiver', 'jaw'));
    bodies.push(box(`receiver-jaw-guide-${side}`, [side * 90, 620 + pose.withdraw, 284.65 + pose.lift], [65, 10, 16], 'receiver', 'slide'));
    bodies.push(box(`receiver-lift-rail-${side}`, [side * 110, 634 + pose.withdraw, 370], [12, 12, 300], 'receiver-withdraw', 'rail'));
    bodies.push(box(`receiver-withdraw-rail-${side}`, [side * 125, 590, 205], [12, 200, 12], 'fixed', 'rail'));
    bodies.push(box(`receiver-carriage-${side}`, [side * 125, 520 + pose.withdraw, 220], [18, 30, 12], 'receiver-withdraw', 'carriage'));
    bodies.push(box(`receiver-lift-tie-${side}`, [side * 117.5, 577 + pose.withdraw, 232], [27, 126, 12], 'receiver-withdraw', 'support'));
  }
  bodies.push(box('receiver-cradle-floor', [0, 566 + pose.withdraw, 224.5 + pose.lift], [140, 98, 6], 'receiver', 'cradle'));
  bodies.push(box('receiver-end-stop', [0, 619 + pose.withdraw, 270 + pose.lift], [140, 6, 90], 'receiver', 'stop'));
  bodies.push(box('indexer-chassis-crossmember', [0, 300, 150], [610, 20, 20], 'fixed', 'mount'));
  return bodies.map(body => movedBody(body, pose));
}

const polygonCache = new WeakMap();
function pieces(body) {
  if (body.kind !== 'belt') return [{body, error: 0}];
  if (!polygonCache.has(body)) polygonCache.set(body, beltPolygons(body).map(part => ({body: {...body, kind: 'prism', outline: part.outline}, error: part.error})));
  return polygonCache.get(body);
}

function boundsGap(first, second) {
  const gaps = [0, 1, 2].map(axis => Math.max(0, first.minimum[axis] - second.maximum[axis], second.minimum[axis] - first.maximum[axis]));
  return Math.hypot(...gaps);
}

export function hardwareGap(first, second) {
  const broad = boundsGap(bodyBounds(first), bodyBounds(second));
  if (broad > 5) return broad;
  if (first.role === 'shaft' && second.holes?.length) {
    for (const hole of second.holes) {
      const gap = hole.radius - first.radius - Math.hypot(...first.center.map((value, axis) => value - hole.center[axis]));
      if (gap >= 0) return gap;
    }
  }
  if (second.role === 'shaft' && first.holes?.length) return hardwareGap(second, first);
  let gap = Infinity;
  for (const firstPart of pieces(first)) for (const secondPart of pieces(second)) {
    const error = firstPart.error + secondPart.error;
    const bound = boundsGap(bodyBounds(firstPart.body), bodyBounds(secondPart.body)) - error;
    if (bound > Math.min(5, gap)) continue;
    gap = Math.min(gap, bodyGap(firstPart.body, secondPart.body) - error);
  }
  return Number.isFinite(gap) ? gap : broad;
}

function pieceBounds(pose) {
  const extents = cylinderExtents(pose);
  return {minimum: pose.center.map((value, axis) => value - extents[axis]), maximum: pose.center.map((value, axis) => value + extents[axis])};
}

export function pieceGap(pose, body) {
  const broad = boundsGap(pieceBounds(pose), bodyBounds(body));
  if (broad > 5) return broad;
  if (body.kind !== 'belt') {
    const result = coralBodyGap(pose, body);
    return Number.isFinite(result) ? result : broad;
  }
  return beltClosestGap(pose, {...body, assembly: 'cassette-exact-route'});
}

export function flatContact(pose, span, height, endpoints = dimensions.bankEnds) {
  return coralBoxGap(pose, {minimum: [span[0], endpoints[0], height], maximum: [span[1], endpoints[1], height]});
}

function contactSummary(pose, bodies) {
  const contacts = bodies.filter(body => body.role === 'powered').map(body => ({id: body.id, side: body.contactSide,
    bank: body.bank, gap: body.assembly === 'fixed' && pose.center[1] >= 100 && pose.center[1] <= 350 ?
      flatContact(pose, body.span, body.contactSide === 'lower' ? 229 : 340.3) : pieceGap(pose, body)}));
  const active = contacts.filter(contact => contact.gap <= 1e-6 && contact.gap >= -3 - 1e-6);
  const lowerIndent = Math.max(0, ...contacts.filter(contact => contact.side === 'lower').map(contact => -contact.gap));
  const upperIndent = Math.max(0, ...contacts.filter(contact => contact.side === 'upper').map(contact => -contact.gap));
  const floorTangent = Math.abs(pose.center[2] - radius) < 1e-6;
  const opposed = active.some(contact => contact.side === 'upper') && (floorTangent || active.some(contact => contact.side === 'lower'));
  return {active, contacts, lowerIndent, upperIndent, totalIndent: lowerIndent + upperIndent, floorTangent, opposed};
}

function allowedJoint(first, second) {
  if (first.joint && first.joint === second.joint) {
    if (first.role === 'shaft' && second.holes || second.role === 'shaft' && first.holes) return false;
    return true;
  }
  if (first.belt === second.id || second.belt === first.id) return true;
  if (first.role === 'gate' && second.role === 'gate' && first.assembly === second.assembly) return true;
  return false;
}

export function indexerScreen() {
  let reserve = Infinity, totalIndent = 0, passing = 0, witness = null, cases = 0;
  for (let yaw = 0; yaw <= 90; yaw++) for (const across of [-10, 0, 10]) for (const rearward of [-10, 0, 10]) {
    const pose = {center: [across, 205 + rearward, 284.65], yaw};
    const gaps = dimensions.bankLanes.map(span => [flatContact(pose, span, 229), flatContact(pose, span, 340.3)]);
    const current = Math.min(...gaps.flat().map(gap => -gap));
    const indentation = Math.max(...gaps.map(pair => pair.reduce((sum, gap) => sum + Math.max(0, -gap), 0)));
    if (current < reserve) {reserve = current; witness = {yaw, across, rearward};}
    totalIndent = Math.max(totalIndent, indentation); cases++;
    if (current >= 0.5 - 1e-8 && indentation <= 3 + 1e-8) passing++;
  }
  return {cases, passing, reserve, totalIndent, witness, slotWidth: 1,
    analyticYawZeroOffsetLimitAtHalfMillimeterReserve: Math.sqrt(radius ** 2 - (radius - 1) ** 2) - 0.5,
    rotationEvidence: 'Geometric dual-bank contact only; yaw90->0 poses are commanded, not a demonstrated differential-rotation trajectory.'};
}

export function entryScreen() {
  const bodies = bodiesAt('acquire', 0), powered = bodies.filter(body => body.role === 'powered');
  const rigid = bodies.filter(body => !['powered', 'jaw'].includes(body.role));
  return [0, 30, 60, 75, 80, 85, 89, 89.5, 90, 90.5, 91, 95, 100, 105, 120, 150, 180].map(yaw => {
    const offsets = [-10, 0, 10].map(across => {
      const pose = {...poseAt('acquire', 0), yaw, center: [across, ...lowerPath(0)]};
      const contacts = powered.map(body => ({id: body.id, gap: pieceGap(pose, body)}));
      const maximumIndent = Math.max(0, ...contacts.map(contact => -contact.gap));
      const totalIndent = ['upper', 'lower'].reduce((sum, side) => sum + Math.max(0, ...powered.filter(body => body.contactSide === side).map(body => -pieceGap(pose, body))), 0);
      const rigidContacts = rigid.map(body => ({id: body.id, gap: pieceGap(pose, body)}));
      const minimumRigid = Math.min(...rigidContacts.map(contact => contact.gap));
      const upper = powered.filter(body => body.contactSide === 'upper').some(body => {
        const gap = pieceGap(pose, body); return gap <= 1e-6 && gap >= -3 - 1e-6;
      });
      return {across, maximumIndent, totalIndent, minimumRigid, floorPassiveTangent: true, poweredTop: upper,
        status: totalIndent <= 3 + 1e-6 && minimumRigid >= 0 && upper ? 'PASS' : 'FAIL',
        witness: rigidContacts.reduce((first, second) => first.gap < second.gap ? first : second)};
    });
    return {yaw, offsets, floorOnlyStatus: offsets.every(offset => offset.status === 'PASS') ? 'PASS' : 'FAIL'};
  });
}

function clean(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value * 1e6) / 1e6 : null;
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clean(entry)]));
  return value;
}

function gate(name, value, minimum, evidence = {}) {
  return {name, status: Number.isFinite(value) && value >= minimum - 1e-6 ? 'PASS' : 'FAIL', value, minimum, ...evidence};
}

function updateMinimum(record, value, witness) {
  if (value < record.value) {record.value = value; record.witness = witness;}
}

function movingBudget(first, second, angleDifference) {
  if (first.assembly === 'nose') {
    const bounds = bodyBounds(second);
    const maximumRadius = Math.max(...[bounds.minimum[1], bounds.maximum[1]].flatMap(rearward =>
      [bounds.minimum[2], bounds.maximum[2]].map(up => Math.hypot(rearward - pivot[0], up - pivot[1]))));
    return 2 * maximumRadius * Math.sin(Math.abs(radians(angleDifference)) / 2);
  }
  if (first.kind === 'circle') return Math.hypot(...first.center.map((value, axis) => value - second.center[axis])) + Math.abs(first.span[0] - second.span[0]);
  if (first.kind === 'belt') return 0;
  return Math.max(...first.outline.map((point, index) => Math.hypot(...point.map((value, axis) => value - second.outline[index][axis])))) + Math.abs(first.span[0] - second.span[0]);
}

function sweptBounds(body, before, angleDifference) {
  const first = bodyBounds(before ?? body), second = bodyBounds(body);
  const inflation = body.assembly === 'nose' ? Math.max(...[first.minimum[1], first.maximum[1]].flatMap(rearward =>
    [first.minimum[2], first.maximum[2]].map(up => Math.hypot(rearward - pivot[0], up - pivot[1])))) *
    (1 - Math.cos(radians(angleDifference) / 2)) : 0;
  return {minimum: first.minimum.map((value, axis) => Math.min(value, second.minimum[axis]) - (axis ? inflation : 0)),
    maximum: first.maximum.map((value, axis) => Math.max(value, second.maximum[axis]) + (axis ? inflation : 0))};
}

export function escapeScreen(yaw, openBack = false) {
  const walls = bodiesAt('transfer', 0.6).filter(body => ['gate', 'fence'].includes(body.role) && !(openBack && body.assembly === 'gate-back'));
  const queue = [[0, 205]], visited = new Set(['0,205']), step = 10;
  for (let head = 0; head < queue.length; head++) {
    const center = queue[head];
    if (Math.abs(center[0]) > 240 || Math.abs(center[1] - 205) > 400) return {escaped: true, visited: visited.size};
    for (const direction of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const next = center.map((value, axis) => value + direction[axis]), key = next.join(',');
      if (visited.has(key)) continue;
      const pose = {center: [...next, 284.65], yaw};
      if (walls.some(body => coralBoxGap(pose, bodyBounds(body)) < 0)) continue;
      visited.add(key); queue.push(next);
    }
  }
  return {escaped: false, visited: visited.size};
}

export function evaluate() {
  const deployed = bodiesAt('acquire', 0), indexed = indexerScreen(), entry = entryScreen();
  const hardware = {value: Infinity}, pieceRigid = {value: Infinity}, shafts = {value: Infinity}, bumper = {value: Infinity};
  const gatesToBelts = {value: Infinity}, loadedFold = {value: Infinity}, movingClearance = {value: Infinity};
  const coralRobot = {value: Infinity}, continuousPiece = {value: Infinity};
  const family = {}, intendedJoints = [];
  let extension = 0, stowInset = Infinity, stowHeight = 0, floor = Infinity, noPowered = 0, noOpposition = 0, maxIndent = 0;
  let firstContactFailure = null, poses = 0, pairsChecked = 0;
  const mounted = ['front', 'left'].map(mount => ({mount, obstacles: robotInMount(mount)}));
  const byMount = Object.fromEntries(mounted.map(({mount}) => [mount, {extension: 0, stowInset: Infinity, bumper: Infinity}]));
  for (const body of deployed) {
    const bounds = foldBounds(body);
    for (const {mount} of mounted) for (const point of [bounds.minimum, bounds.maximum].map(corner => placePoint(corner, mount))) {
      const current = Math.max(0, -350 - point[0], point[0] - 350, -point[1], point[1] - 760);
      extension = Math.max(extension, current); byMount[mount].extension = Math.max(byMount[mount].extension, current);
    }
  }
  const boundaries = {acquire: [], capture: [0.5625, 0.75], transfer: [0.4, 0.6], handoff: [0.1, 0.45, 0.55, 0.7, 0.85], stow: []};
  const schedule = definition.states.flatMap(state => [...new Set([...Array.from({length: 41}, (_, index) => index / 40), ...boundaries[state]])]
    .sort((first, second) => first - second).map(progress => ({state, progress})));
  let previous = null;
  for (const {state, progress} of schedule) {
    const pose = poseAt(state, progress), bodies = bodiesAt(state, progress), support = contactSummary(pose, bodies);
    const angleDifference = previous ? pose.fold - previous.pose.fold : 0;
    const budgets = previous ? bodies.map((body, index) => movingBudget(body, previous.bodies[index], angleDifference)) : bodies.map(() => 0);
    const sweepBounds = bodies.map((body, index) => sweptBounds(body, previous?.bodies[index], angleDifference));
    const tubeBudget = previous && previous.pose.state === state ?
      ({acquire: 60, capture: 720, transfer: 1147, handoff: 1200, stow: 0})[state] * (progress - previous.pose.progress) : 0;
    poses++;
    if (state !== 'stow' && !(state === 'handoff' && progress >= 0.55)) {
      if (!support.active.length) noPowered++;
      if (!support.opposed) {noOpposition++; firstContactFailure ??= {state, progress, center: pose.center, active: support.active};}
      maxIndent = Math.max(maxIndent, support.totalIndent);
    }
    for (let index = 0; index < bodies.length; index++) {
      const body = bodies[index], bounds = bodyBounds(body), piece = pieceGap(pose, body);
      floor = Math.min(floor, bounds.minimum[2]);
      if (!['powered', 'jaw', 'cradle'].includes(body.role)) {
        updateMinimum(pieceRigid, piece, {state, progress, body: body.id});
        updateMinimum(continuousPiece, piece - tubeBudget - budgets[index], {state, progress, body: body.id, sampledGap: piece});
      }
      if (body.role === 'shaft') updateMinimum(shafts, piece, {state, progress, body: body.id});
      if (state === 'stow' && body.assembly === 'nose') updateMinimum(loadedFold, piece - tubeBudget - budgets[index], {state, progress, body: body.id});
      for (const {mount, obstacles} of mounted) {
        for (const point of [bounds.minimum, bounds.maximum].map(corner => placePoint(corner, mount))) {
          const outward = Math.max(0, -350 - point[0], point[0] - 350, -point[1], point[1] - 760);
          extension = Math.max(extension, outward); byMount[mount].extension = Math.max(byMount[mount].extension, outward);
          if (state === 'stow' && progress === 1) {
            const inset = Math.min(point[0] + 350, 350 - point[0], point[1], 760 - point[1]);
            stowInset = Math.min(stowInset, inset); byMount[mount].stowInset = Math.min(byMount[mount].stowInset, inset);
            stowHeight = Math.max(stowHeight, point[2]);
          }
        }
        for (const obstacle of obstacles) {
          const sampled = hardwareGap(body, obstacle);
          const gap = sampled < 0 ? sampled - budgets[index] : Math.max(boundsGap(sweepBounds[index], bodyBounds(obstacle)), sampled - budgets[index]);
          updateMinimum(bumper, gap, {state, progress, mount, body: body.id, obstacle: obstacle.id, sampledGap: sampled});
          byMount[mount].bumper = Math.min(byMount[mount].bumper, gap);
          if (index === 0) updateMinimum(coralRobot, pieceGap(pose, obstacle) - tubeBudget, {state, progress, mount, obstacle: obstacle.id});
        }
      }
      for (let otherIndex = index + 1; otherIndex < bodies.length; otherIndex++) {
        const other = bodies[otherIndex];
        if (allowedJoint(body, other)) {
          if (!previous) intendedJoints.push([body.id, other.id]);
          continue;
        }
        if (previous && budgets[index] === 0 && budgets[otherIndex] === 0) continue;
        if (previous && body.assembly === 'nose' && other.assembly === 'nose') continue;
        pairsChecked++;
        const clearance = hardwareGap(body, other);
        const motion = budgets[index] + budgets[otherIndex];
        const bound = clearance < 0 ? clearance - motion : Math.max(boundsGap(sweepBounds[index], sweepBounds[otherIndex]), clearance - motion);
        const witness = {state, progress, first: body.id, second: other.id, sampledGap: clearance, motionBudget: motion};
        updateMinimum(hardware, clearance, witness);
        const key = [body.role, other.role].sort().join(':');
        family[key] ??= {value: Infinity, pairs: 0}; family[key].pairs++;
        updateMinimum(family[key], bound, witness);
        if (motion > 0) updateMinimum(movingClearance, bound, witness);
        if ((body.role === 'gate' && other.kind === 'belt') || (other.role === 'gate' && body.kind === 'belt')) updateMinimum(gatesToBelts, bound, witness);
      }
    }
    previous = {pose, bodies};
  }
  const escapes = [0, 30, 60, 90].map(yaw => ({yaw, ...escapeScreen(yaw)}));
  const openEscape = escapeScreen(0, true);
  const holdBodies = bodiesAt('transfer', 0.6), walls = holdBodies.filter(body => ['gate', 'fence'].includes(body.role));
  let cageMargin = Infinity;
  for (let yaw = 0; yaw <= 90; yaw++) for (const across of [-10, 0, 10]) for (const rearward of [-10, 0, 10]) {
    const pose = {center: [across, 205 + rearward, 284.65], yaw};
    cageMargin = Math.min(cageMargin, ...walls.map(body => pieceGap(pose, body)));
  }
  const results = [
    gate('hardware-extension-reserve-front-left', 457.2 - extension, 5),
    gate('stow-inset-front-left', stowInset, 5),
    gate('stow-height-reserve', 1066.8 - stowHeight, 5),
    gate('hardware-floor-margin', floor, 5),
    gate('intact-bumper-and-frame-continuous-bound', bumper.value, 5, {witness: bumper.witness}),
    gate('all-nonmating-hardware-families', hardware.value, 0.25, {witness: hardware.witness}),
    gate('moving-family-continuous-bound', movingClearance.value, 0.25, {witness: movingClearance.witness}),
    gate('gate-sweeps-versus-belts', gatesToBelts.value, 0.25, {witness: gatesToBelts.witness}),
    gate('full-coral-rigid-bodies', pieceRigid.value, 0, {witness: pieceRigid.witness}),
    gate('full-coral-shaft-margin', shafts.value, 5, {witness: shafts.witness}),
    gate('full-coral-rigid-continuous-bound', continuousPiece.value, 0, {witness: continuousPiece.witness}),
    gate('full-coral-bumper-frame-continuous-bound', coralRobot.value, 5, {witness: coralRobot.witness}),
    gate('retained-coral-fold-continuous-bound', loadedFold.value, 5, {witness: loadedFold.witness}),
    gate('powered-coverage', -noPowered, 0, {posesWithoutDrive: noPowered}),
    gate('opposition-including-passive-floor', -noOpposition, 0, {firstContactFailure}),
    gate('total-opposed-indentation-ceiling', 3 - maxIndent, 0),
    gate('indexer-reserve-yaw0-through90-offset10', indexed.reserve, 0.5),
    gate('indexer-total-indentation-ceiling', 3 - indexed.totalIndent, 0),
    gate('closed-cell-yaw-offset-workspace', cageMargin, 5),
    gate('closed-cell-planar-escape-with-open-control', escapes.filter(row => !row.escaped).length + Number(openEscape.escaped), 5),
    gate('full-flow-continuous-contact-certificate', 0, 1, {reason: 'Analytic lower working route and endpoint overlap do not certify opposed passage through the rigidly blocked entry or upper transition.'}),
    gate('practical-entry-envelope-80-through100', entry.filter(row => row.yaw >= 80 && row.yaw <= 100 && row.floorOnlyStatus === 'PASS').length,
      entry.filter(row => row.yaw >= 80 && row.yaw <= 100).length),
    gate('supported-complete-transmission', 0, 1, {reason: 'Drums, shafts and bearing holes exist; spine ties, drive couplings, tensioners and actuator attachments are not fully packaged.'}),
  ];
  return clean({schema: 'intake-finalists/feed-cassette/1', candidate: 'A', status: results.every(result => result.status === 'PASS') ? 'PASS' : 'FAIL',
    geometryReady: false, passing: results.filter(result => result.status === 'PASS').length, failing: results.filter(result => result.status === 'FAIL').length,
    gates: results, topology: topologyProbe(), dimensions, indexer: indexed, entry,
    contact: {poses, noPowered, noOpposition, maxTotalIndentation: maxIndent, firstContactFailure,
      lowerToFixedOverlap: Math.sqrt((radius + 28) ** 2 - reach ** 2) + Math.sqrt((radius + 18) ** 2 - (radius + 18 - 1.5) ** 2) - 25,
      floorOwnership: 'Passive floor tangent plus powered upper front roller is a valid initial opposing pair; two powered faces are not required.',
      admittedTransportEnvelope: null, commandedDiagnostic: {yaw: 90, across: 0, pitch: 0}},
    clearance: {extension, stowInset, stowHeight, floor, bumper, hardware, movingClearance, pieceRigid, continuousPiece, coralRobot, shafts, gatesToBelts, loadedFold, cageMargin},
    retention: {escapes, openEscape, scope: 'Fixed-yaw horizontal translation grid, 10 mm step. Not arbitrary-yaw/pitch escape or holding force. Upper/lower pinch is not waived because two faces are not powered at the floor.'},
    inventory: {bodies: deployed.length, beltLoops: deployed.filter(body => body.kind === 'belt').length,
      drums: deployed.filter(body => body.role === 'drum').length, shafts: deployed.filter(body => body.role === 'shaft').length,
      bearingsWithExplicitHoles: deployed.filter(body => body.holes?.length).length,
      countsByRole: Object.fromEntries([...new Set(deployed.map(body => body.role))].map(role => [role, deployed.filter(body => body.role === role).length])),
      physicalBodies: deployed.map(({id, role, assembly, kind}) => ({id, role, assembly, kind})), intendedJoints},
    verification: {poses, pairsChecked, family, mounted: byMount, beltArcFacetDegrees: 2,
      beltFacetSagittaMm: 28 * (1 - Math.cos(radians(1))),
      method: 'Exact common drum tangents and cylinder/flat-lane sections; partitioned closest-surface minimization for yawed belt arcs. Hardware belt facets subtract sagitta. Interval bounds combine swept AABB separation and distance minus bounded motion. Negative polygon sentinels indicate intersection, not penetration depth.',
      limitations: ['Horizontal cylinder only. General-yaw prism query uses a conservative bounding box, not an exact arbitrary polyhedron distance.',
        'Every prescribed actuator/path breakpoint is included. Full interval angular-radius budgets bound nose motion. Conservative failed bounds are NOT proof of physical penetration.',
        'Contact is sampled except analytic lower route and bridge overlap. Rigid coral interval bounds use statewise Lipschitz speeds; exact traction/retention path not certified.',
        'Floor-only yaw rows are necessary screens, never an admitted transport envelope. No rigid-pass yaw path yet certified.']},
    controls: {positioningAxes: ['nose fold', 'front lateral gates', 'back lateral gates', 'receiver jaws', 'receiver withdrawal', 'receiver lift'],
      driveGroups: ['coupled pickup/lower/upper nose', 'independent left opposed indexer', 'independent right opposed indexer'],
      totalControlledActuatorsBeforeBrakes: 9, receiverAbsent: controlAt({receiver: 'absent', occupied: true}),
      ownership: 'One coral only. Fixed cell holds when receiver absent. Open back, feed while bank contact persists, grip leading end, confirm grip, withdraw145, lift180, retract145, then fold empty nose.',
      return: 'Reverse these same coordinates; lower before returning into fixed belts, and retain receiver ownership until cell acceptance.'},
    unverifiedPhysics: ['Friction and traction', 'Belt compliance and pretension', 'Yaw control and sensing', 'Arbitrary-orientation acquisition or auto-orient driving strategy',
      'Positive holding force, end-grip slip, gate strength', 'Belt tracking, shafts, bearings and structure under load', 'Cycle time and reliability'],
    decision: 'Not a finalist. Repair geometry and retention before physical tests; do not substitute a narrow entry screen for elite arbitrary-orientation acquisition.'});
}

function meshPrism(body) {
  const shape = new THREE.Shape();
  body.outline.forEach((point, index) => index ? shape.lineTo(...point) : shape.moveTo(...point));
  shape.closePath();
  for (const hole of body.holes ?? []) {
    const path = new THREE.Path(); path.absarc(...hole.center, hole.radius, 0, Math.PI * 2, true); shape.holes.push(path);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {depth: body.span[1] - body.span[0], bevelEnabled: false, curveSegments: 16});
  const vertices = geometry.getAttribute('position');
  for (let index = 0; index < vertices.count; index++) vertices.setXYZ(index, body.span[0] + vertices.getZ(index), vertices.getX(index), vertices.getY(index));
  geometry.computeVertexNormals();
  return geometry;
}

export function buildModel(state = 'acquire', progress = 1, mount = 'front') {
  if (!['front', 'left'].includes(mount)) throw new Error('Cassette mount must be front or left');
  const pose = poseAt(state, progress), bodies = bodiesAt(state, progress), root = new THREE.Group(), mechanism = new THREE.Group();
  root.add(mechanism); root.name = 'A supported cassette: geometry gate not passed';
  const colors = {powered: 0x398d87, drum: 0x595d63, shaft: 0xb4bac1, bearing: 0x7692a1, plate: 0xd9ba61,
    gate: 0xc99949, fence: 0xb8cbd2, jaw: 0xb86c72, cradle: 0xaebbc0, rail: 0xa3a9ae, bumper: 0x9b4250, frame: 0x51585c};
  function addBody(body, parent) {
    const part = new THREE.Group(); part.name = body.id; part.userData = {physicalBody: true, role: body.role, assembly: body.assembly}; parent.add(part);
    const material = new THREE.MeshStandardMaterial({color: colors[body.role] ?? 0x8c9caa, roughness: 0.68});
    if (body.kind === 'circle') {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(body.radius, body.radius, body.span[1] - body.span[0], 32), material);
      mesh.rotation.z = Math.PI / 2; mesh.position.set((body.span[0] + body.span[1]) / 2, ...body.center); part.add(mesh);
    } else for (const section of pieces(body)) part.add(new THREE.Mesh(meshPrism(section.body), material));
  }
  bodies.forEach(body => addBody(body, mechanism));
  robotInMount('front').forEach(body => addBody(body, root));
  const coral = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dimensions.coralLength, 64), new THREE.MeshStandardMaterial({color: 0xe48657}));
  coral.name = 'full nominal coral'; coral.position.set(...pose.center);
  coral.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.sin(radians(pose.yaw)), Math.cos(radians(pose.yaw)), 0));
  mechanism.add(coral);
  if (mount === 'left') {mechanism.rotation.z = -Math.PI / 2; mechanism.position.set(-350, 380, 0);}
  root.userData = {candidate: 'A', state, progress, mount, pose, bodies, status: 'FAIL', geometryReady: false, physicalBodyCount: bodies.length};
  root.updateMatrixWorld(true);
  return root;
}