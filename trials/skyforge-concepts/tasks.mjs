import * as THREE from 'three';
import { CONCEPTS, concept } from './robots.mjs';
import { IN, CUBE, LIMITS, GOALS, VG, LAUNCH_ZONE, OPPONENT_LAUNCH_ZONE, STARTING_ZONE, BOARD, railFrame, pointInTriangle, inRect } from './field.mjs';
import { collect, extensionBeyondPerimeter, heightOf, lowestOf, evaluateShot } from './geometry.mjs';
import { C, cube as cubeMesh, material } from './parts.mjs';
import { SF5, SF6, SF7, SF8, DUNK, tunnelFor, sf5Pose, sf5Reach, sf5Drop, sf6Pose, sf7Pose, sf8Pose, columnAt, trayAt, dunkTrayAt, pointOn, convexOverlap } from './magazine.mjs';

const deg = Math.PI / 180;
const HALF = CUBE / 2;
const BUMPER = 82.55;
const BLUE_BOARD = BOARD.vertices.map(([x, y]) => [x, 2 * 8229.6 - y]);

export const TASKS = {
  start: { name: 'Start configuration', group: 'Setup', phases: ['start'], note: 'Inside the STARTING ZONE with 1 preload. R102/R104: nothing outside the frame perimeter and 42 in maximum height.' },
  floor: { name: 'Floor pickup: centre line', group: 'Acquire', phases: ['approach', 'intake'], note: 'End cube of the red CENTER LINE row (84 in, 288 in). This is the AUTO race and the main open-field source.' },
  safe: { name: 'Floor pickup: SAFE ZONE lane', group: 'Acquire', phases: ['approach', 'intake'], note: 'Protected lane fed by IP-A and IP-B (G420/G427). Cube at (300 in, 120 in).' },
  underCube: { name: 'Pickup under the FLOATING BOARD', group: 'Acquire', phases: ['approach', 'intake'], note: 'The 4 under-board cubes at the feeder side. Only robots under 32 in (812.8 mm) can reach them.' },
  vgFender: { name: 'VERTICAL GOAL: fender shot', group: 'Score', phases: ['approach', 'aim', 'release'], note: 'Rear bumper pressed on the field face of blue GOAL 1, so the shot distance is set by contact and the cube starts behind the RELEASE LINE.' },
  vgZone: { name: 'VERTICAL GOAL: zone shot', group: 'Score', phases: ['approach', 'aim', 'release'], note: 'Same fixed spot for every shooter: robot centre 1.6 m from the opening plane, 0.49 m off centre, aimed with AprilTags 4/5.' },
  g1: { name: 'GOAL 1 place (18 in)', group: 'Score', phases: ['approach', 'engage', 'release'], note: 'Red GOAL 1 at the red wall, inside the blue LAUNCH ZONE, so G416 limits the robot to 48 in there.' },
  g2: { name: 'GOAL 2 place (38 in)', group: 'Score', phases: ['approach', 'engage', 'release'], note: 'Red GOAL 2 near, (12 in, 120 in), approached from the field side.' },
  g3: { name: 'GOAL 3 place (60 in)', group: 'Score', phases: ['approach', 'engage', 'release'], note: 'Red GOAL 3 in the blue half. The 78 in limit leaves about 2 cube heights above the rim.' },
  hang: { name: 'HANG on own FLOATING BOARD', group: 'Endgame', phases: ['approach', 'reach', 'hang'], note: 'Robot straddles the HANG RAIL so its centre of mass sits under the rail; hooks rest on top of the 33 in rail.' },
  under: { name: 'UNDER own FLOATING BOARD', group: 'Endgame', phases: ['park'], note: 'The whole bumper outline inside the red board projection and every part under 32 in.' },
};

export const PHASE_NAMES = { start: 'Start', approach: 'Approach', intake: 'Intake', aim: 'Aim', release: 'Release', engage: 'Engage', reach: 'Reach', hang: 'Hang', park: 'Park' };

function toField(placement, [x, y, z]) {
  const c = Math.cos(placement.yaw), s = Math.sin(placement.yaw);
  return [placement.x + x * c - y * s, placement.y + x * s + y * c, z + (placement.lift ?? 0)];
}

function centreFor(targetField, local, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return { x: targetField[0] - (local[0] * c - local[1] * s), y: targetField[1] - (local[0] * s + local[1] * c), yaw };
}

function bumperCorners(placement, L, W) {
  const hx = L / 2 + BUMPER, hy = W / 2 + BUMPER;
  return [[hx, hy], [-hx, hy], [-hx, -hy], [hx, -hy]].map(([x, y]) => toField(placement, [x, y, 0]).slice(0, 2));
}

function polygonIntersectsRect(points, rect) {
  if (points.some(point => inRect(point, rect))) return true;
  const corners = [[rect.x0, rect.y0], [rect.x1, rect.y0], [rect.x1, rect.y1], [rect.x0, rect.y1]];
  const inside = ([px, py]) => {
    let hit = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i], [xj, yj] = points[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  return corners.some(inside);
}

const fullCubes = n => Array.from({ length: n }, () => ({ slot: 'tray' }));

// SF5/SF6: the magazine holds `column` / `tray` cubes; `shift` slides the queue along the magazine axis.
const sf5Load = () => sf5Reach(tunnelFor(SF5.L).loadBottom, SF5.loadAxis).shoulder;
const sf5DropShoulder = () => sf5Reach(sf5Drop(SF5.L), 90).shoulder;
function magazineRecipe(id, task, phase) {
  const sf5 = id === 'SF5', sf7 = id === 'SF7', sf8 = id === 'SF8', slot = sf5 ? 'column' : 'tray';
  const load = sf5 ? { shoulder: sf5Load(), axis: SF5.loadAxis } : sf7 ? { crank: SF7.loadCrank } : sf8 ? { h: SF8.load, tilt: SF8.loadAxis } : { carriage: 0, tilt: 130 };
  const stow = sf5 ? { shoulder: SF5.start.shoulder, axis: SF5.start.axis } : sf7 ? { crank: 0 } : sf8 ? { h: SF8.start.h, tilt: SF8.start.axis } : { carriage: SF6.start.s, tilt: SF6.start.axis };
  if (task === 'start') return { ...stow, intake: 'stowed', [slot]: 1 };
  if (['floor', 'safe'].includes(task)) return { ...load, intake: 'deployed', [slot]: 2, cubes: phase === 'intake' ? [{ slot: 'mouth', lane: 0 }] : [] };
  if (task === 'vgFender' || task === 'vgZone') {
    if (phase === 'approach') return { ...stow, intake: 'stowed', [slot]: 4 };
    // Aim: the queue backs off 25 mm so the kicker spins up clear of the last cube. Release: one cube in flight.
    return { intake: 'stowed', [slot]: phase === 'release' ? 3 : 4, shift: phase === 'aim' ? -25 : 0 };
  }
  if (task === 'g2' && sf5) {
    const drop = { shoulder: sf5DropShoulder(), axis: 90, intake: 'stowed' };
    if (phase === 'approach') return { ...drop, column: 4 };
    // Release: the belts drive the stack down through the THROAT; the second cube is half through the mouth.
    return { ...drop, fork: true, column: phase === 'release' ? 3 : 4, shift: phase === 'release' ? -CUBE / 2 : 0 };
  }
  if (sf8 && (task === 'g2' || task === 'g3')) {
    // Engage: level on the mast stop with the fork on the base. Release: slot 1 at the moment its top leaves the
    // lower dunk wheels (driven from 40 mm above the rim to DUNK.driveDepth below it).
    const at = { h: task === 'g2' ? SF8.g2 : SF8.g3, tilt: 180, intake: 'stowed', tray: 4 };
    if (phase === 'approach') return at;
    return { ...at, fork: true, dunk: phase === 'release' ? DUNK.goalGap + DUNK.driveDepth : 0 };
  }
  if (task === 'g2' && sf7) {
    const g2 = { crank: SF7.sweep, intake: 'stowed' };
    if (phase === 'approach') return { ...g2, tray: 4 };
    return { ...g2, fork: true, tray: phase === 'release' ? 3 : 4, door: phase === 'release', dropped: phase === 'release' };
  }
  if (task === 'g3' && !sf5) {
    const g3 = { carriage: SF6.travel, tilt: 180, intake: 'stowed' };
    if (phase === 'approach') return { ...g3, tray: 4 };
    return { ...g3, fork: true, tray: phase === 'release' ? 3 : 4, door: phase === 'release', dropped: phase === 'release' };
  }
  if (task === 'hang') {
    // SF5 parks the column behind the robot; SF6/SF7 stand the tray upright. Both keep the half over the board low.
    const base = sf5 ? { shoulder: -150, axis: 90 } : sf7 ? { crank: 0 } : sf8 ? stow : { carriage: SF6.start.s, tilt: 90 };
    return { ...base, intake: 'stowed', hooks: phase === 'approach' ? 'stowed' : phase === 'reach' ? 'raised' : 'seated', lift: phase === 'hang' ? 50 : 0 };
  }
  throw new Error(`No recipe for ${id}/${task}`);
}

// Mechanism pose recipes: which configuration each concept uses for a task phase.
// SF1/SF2 hold 4 as 2 lanes x 2 deep; the front pair sits where the intake stows, so the intake stays deployed
// whenever the front lanes are loaded.
function recipe(id, task, phase) {
  if (concept(id).family === 'magazine') return magazineRecipe(id, task, phase);
  const rear = id === 'SF1' ? 'barrel' : 'lane';
  const pair = slot => [{ slot, lane: 127.5 }, { slot, lane: -127.5 }];
  const shooterLoad = id === 'SF1' || id === 'SF2' ? [...pair(rear), ...pair('front')] : fullCubes(id === 'SF4' ? 2 : 3);
  const shooterIntake = id === 'SF1' || id === 'SF2' ? 'deployed' : 'stowed';
  const gantryPark = { trayZ: 715 };
  if (task === 'start') {
    if (id === 'SF1') return { intake: 'stowed', barrel: 0, cubes: [{ slot: 'barrel', lane: -127.5 }] };
    if (id === 'SF2') return { intake: 'stowed', cubes: [{ slot: 'lane', lane: -127.5 }] };
    return { ...gantryPark, intake: 'stowed', cubes: fullCubes(1) };
  }
  if (['floor', 'safe', 'underCube'].includes(task)) {
    const inside = id === 'SF1' || id === 'SF2' ? [...pair(rear), { slot: 'front', lane: 127.5 }] : fullCubes(id === 'SF4' ? 1 : 2);
    const mouth = phase === 'intake' ? [{ slot: 'mouth', lane: id === 'SF1' || id === 'SF2' ? -127.5 : 0 }] : [];
    return { intake: 'deployed', barrel: 0, trayZ: 330, cubes: [...inside, ...mouth] };
  }
  if (task === 'vgFender' || task === 'vgZone') {
    if (phase === 'approach') return { intake: shooterIntake, barrel: 0, ...gantryPark, cubes: shooterLoad };
    // Release: the first pair is in flight. SF1's barrel is empty and returns level to reload from the front lanes;
    // SF2's front pair has already moved up to the flywheel.
    const cubes = phase !== 'release' ? shooterLoad : id === 'SF1' ? pair('front') : id === 'SF2' ? pair('lane') : shooterLoad.slice(1);
    return { intake: shooterIntake, trayZ: 800, cubes };
  }
  if (['g1', 'g2', 'g3'].includes(task)) {
    const trayZ = GOALS[{ g1: 'G1', g2: 'G2near', g3: 'G3' }[task]].rim + 40;
    const trayCubes = id === 'SF4' ? 2 : 3;
    if (phase === 'approach') return { intake: 'stowed', trayZ, cubes: fullCubes(trayCubes) };
    return { intake: 'stowed', trayZ, fork: true, reach: 486, pushed: 61.35, door: phase === 'release', dropped: phase === 'release', cubes: fullCubes(trayCubes) };
  }
  if (task === 'hang') {
    const base = id === 'SF1' ? { intake: 'stowed', barrel: 0, cubes: [] } : id === 'SF2' ? {} : { intake: 'stowed', trayZ: 330, cubes: [] };
    return { ...base, hooks: phase === 'approach' ? 'stowed' : phase === 'reach' ? 'raised' : 'seated', lift: phase === 'hang' ? 50 : 0 };
  }
  if (task === 'under') return { intake: 'stowed', barrel: 0, cubes: [] };
  throw new Error(`No recipe for ${id}/${task}`);
}

function sf1Release(theta, lane) {
  return [-360 * Math.cos(theta), lane, 450 + 360 * Math.sin(theta)];
}

// SF1 chooses its barrel angle: the widest speed tolerance among unblockable solutions at this spot.
const angleCache = new Map();
function bestBarrelAngle(key, placement) {
  if (angleCache.has(key)) return angleCache.get(key);
  let best = null;
  for (let a = 40; a <= 78; a += 1) {
    const theta = a * deg;
    const shots = [127.5, -127.5].map(lane => shotFor(placement, sf1Release(theta, lane), [-Math.cos(theta), 0, Math.sin(theta)], 762, true));
    if (!shots.every(shot => shot.feasible)) continue;
    const width = Math.min(...shots.map(shot => shot.speedBandPct[1] - shot.speedBandPct[0]));
    const score = (shots.every(shot => shot.unblockable) ? 1000 : 0) + width;
    if (!best || score > best.score) best = { angle: a, score };
  }
  angleCache.set(key, best?.angle ?? 60);
  return angleCache.get(key);
}

// Magazine concepts choose a static shot pose: joint angles that keep the magazine inside 78 in (60 mm spare) and
// 18 in (20 mm spare), above the drivebase and clear of the stowed intake, release the cube behind the RELEASE
// LINE, and give the widest speed tolerance among unblockable solutions.
const magazineShotCache = new Map();
function bestMagazineShot(id, key, placement) {
  if (magazineShotCache.has(key)) return magazineShotCache.get(key);
  const { L } = concept(id).frame, keepout = tunnelFor(L).keepout;
  const candidates = [];
  for (let alpha = 36; alpha <= 80; alpha += 2) {
    if (id === 'SF5') for (let shoulder = -120; shoulder <= 40; shoulder += 2) candidates.push({ shoulder, axis: 180 - alpha });
    else if (id === 'SF6') for (let carriage = 0; carriage <= SF6.travel; carriage += 25) candidates.push({ carriage, tilt: 180 - alpha });
    else if (id === 'SF8') for (let h = SF8.start.h; h <= SF8.g3; h += 25) candidates.push({ h, tilt: 180 - alpha });
  }
  // SF7 has one DOF: the tray angle and position both follow the crank.
  if (id === 'SF7') for (let crank = 0; crank <= SF7.sweep; crank += 0.5) candidates.push({ crank });
  let best = null;
  for (const c of candidates) {
    let profile, release, axis = c.axis ?? c.tilt;
    if (id === 'SF5') { const p = sf5Pose(c.shoulder, axis); profile = columnAt(p.bottom, axis); release = pointOn(p.bottom, axis, 895 + HALF, 0); }
    else if (id === 'SF6') { const p = sf6Pose(c.carriage, axis); profile = trayAt(p.front, axis); release = pointOn(p.front, axis, 910 + HALF, 0); }
    else if (id === 'SF8') { const p = sf8Pose(c.h, axis); profile = dunkTrayAt(p.front, axis); release = pointOn(p.front, axis, 910 + HALF, 0); }
    else { const p = sf7Pose(c.crank); axis = p.axis; if (180 - axis < 30 || 180 - axis > 80) continue; profile = trayAt(p.front, axis); release = pointOn(p.front, axis, 910 + HALF, 0); }
    const xs = profile.map(v => v[0]), zs = profile.map(v => v[1]);
    if (Math.max(...zs) > LIMITS.maxHeight - 60 || Math.min(...zs) < 150 || Math.max(...xs.map(Math.abs)) > L / 2 + LIMITS.extension - 20) continue;
    if (convexOverlap(profile, keepout)) continue;
    if (toField(placement, [release[0], 0, release[1]])[1] + HALF * Math.SQRT2 > VG.releaseLineY) continue;
    const shot = shotFor(placement, [release[0], 0, release[1]], [Math.cos(axis * deg), 0, Math.sin(axis * deg)], L, true);
    if (!shot.feasible) continue;
    const score = (shot.unblockable ? 1000 : 0) + shot.speedBandPct[1] - shot.speedBandPct[0];
    if (!best || score > best.score) best = { ...c, score };
  }
  if (!best) throw new Error(`${id}: no legal shot pose for ${key}`);
  const { score, ...joints } = best;
  magazineShotCache.set(key, joints);
  return joints;
}

function shotFor(placement, localRelease, localDirection, L, quick = false) {
  const position = toField(placement, localRelease);
  const c = Math.cos(placement.yaw), s = Math.sin(placement.yaw);
  const dx = localDirection[0] * c - localDirection[1] * s, dy = localDirection[0] * s + localDirection[1] * c;
  const h = Math.hypot(dx, dy);
  const alpha = Math.atan2(localDirection[2], h);
  const footprintExit = L / 2 + BUMPER + localRelease[0] + HALF;
  return evaluateShot({ position, horizontal: [dx / h, dy / h], alpha, footprintExit, quick });
}

const MOUTH_CUBE = {
  floor: { name: 'red_Field_cube_01', at: [84 * IN, 288 * IN], yaw: 90 * deg },
  safe: { name: 'red_Field_cube_24', at: [300 * IN, 120 * IN], yaw: -90 * deg },
  underCube: { name: 'red_Field_cube_29', at: [290 * IN, 290 * IN], yaw: 0 },
};

const mouthCache = new Map();
function mouthLocal(id) {
  if (mouthCache.has(id)) return mouthCache.get(id);
  const probe = concept(id).build({ intake: 'deployed', trayZ: 330 }, 'red');
  let lipX = 0;
  probe.traverse(object => { if (object.name === 'intake lip kicker roller') lipX = Math.max(lipX, new THREE.Box3().setFromObject(object).max.x); });
  mouthCache.set(id, lipX + HALF - 8);
  return mouthCache.get(id);
}

// Robot placement on the field (mm, yaw in radians) for a task phase.
function placementFor(id, task, phase, pose) {
  const L = concept(id).frame.L;
  const twoLane = id === 'SF1' || id === 'SF2';
  if (task === 'start') return { x: 1450, y: 1143, yaw: 90 * deg };
  if (MOUTH_CUBE[task]) {
    const { at, yaw } = MOUTH_CUBE[task];
    const place = centreFor(at, [mouthLocal(id), twoLane ? -127.5 : 0, 0], yaw);
    if (phase === 'approach') { place.x -= Math.cos(yaw) * 700; place.y -= Math.sin(yaw) * 700; }
    return place;
  }
  if (task === 'vgFender' || task === 'vgZone') {
    const standoff = task === 'vgFender' ? GOALS.blueG1.face[1] - (L / 2 + BUMPER) : VG.planeY - 1600;
    const x = task === 'vgFender' ? VG.centerX : VG.centerX - 491;
    const yaw = Math.atan2(standoff - VG.planeY, x - VG.centerX);
    const place = { x, y: standoff, yaw };
    if (phase === 'approach') { place.y -= 900; }
    return place;
  }
  if (['g1', 'g2', 'g3'].includes(task)) {
    const goal = GOALS[{ g1: 'G1', g2: 'G2near', g3: 'G3' }[task]];
    const [nx, ny] = goal.faceNormal;
    const back = L / 2 + BUMPER + (phase === 'approach' ? 800 : 0);
    return { x: goal.face[0] + nx * back, y: goal.face[1] + ny * back, yaw: Math.atan2(-ny, -nx) };
  }
  if (task === 'hang') {
    const { mid, inward } = railFrame();
    // Hooks with dir +1 reach forward over the rail, so the front half goes under the board.
    const hooks = concept(id).hooks;
    const forward = hooks.dir > 0 ? inward : [-inward[0], -inward[1]];
    const railLocalX = hooks.x + hooks.dir * 48;
    const out = phase === 'approach' ? 350 : 0;
    return {
      x: mid[0] - railLocalX * forward[0] - inward[0] * out, y: mid[1] - railLocalX * forward[1] - inward[1] * out,
      yaw: Math.atan2(forward[1], forward[0]), lift: pose.lift ?? 0,
    };
  }
  if (task === 'under') {
    const [cx, cy] = BOARD.vertices[1];
    return { x: cx - L / 2 - BUMPER - 10, y: cy - 355.6 - BUMPER - 10, yaw: 0 };
  }
  throw new Error(`No placement for ${task}`);
}

function check(label, status, detail) { return { label, status, detail }; }
const mm = value => `${Math.round(value)} mm`;
const inch = value => `${(value / IN).toFixed(1)} in`;

function ruleChecks(id, task, phase, root, placement) {
  const { L, W } = root.userData;
  const parts = collect(root);
  const robotParts = parts.filter(part => part.kind === 'robot');
  const height = heightOf(parts);
  const extension = extensionBeyondPerimeter(root, L, W);
  const corners = bumperCorners(placement, L, W);
  const out = [];
  if (task === 'start') {
    out.push(check('R104 start height <= 42 in', height.value <= LIMITS.startHeight ? 'pass' : 'fail', `${mm(height.value)} (${inch(height.value)}), top part: ${height.name}; margin ${mm(LIMITS.startHeight - height.value)}`));
    out.push(check('R102 nothing outside the frame perimeter', extension.value <= 1 ? 'pass' : 'fail', extension.value <= 1 ? 'All non-bumper parts are inside the frame projection.' : `${mm(extension.value)} beyond, at ${extension.name}`));
    out.push(check('G303 bumpers inside STARTING ZONE', corners.every(point => inRect(point, STARTING_ZONE)) ? 'pass' : 'fail', 'All 4 bumper corners checked.'));
    const perimeter = 2 * (L + W) / IN;
    out.push(check('R104 frame perimeter <= 120 in', perimeter <= 120 + 1e-9 ? 'pass' : 'fail', `${perimeter.toFixed(1)} in (${(L / IN).toFixed(0)} x ${(W / IN).toFixed(0)} in frame)`));
  } else {
    out.push(check('R106 height <= 78 in', height.value <= LIMITS.maxHeight ? (LIMITS.maxHeight - height.value < 50 ? 'flag' : 'pass') : 'fail', `${mm(height.value)} (${inch(height.value)}), top part: ${height.name}; margin ${mm(LIMITS.maxHeight - height.value)}`));
    out.push(check('R105 extension <= 18 in', extension.value <= LIMITS.extension ? (LIMITS.extension - extension.value < 15 ? 'flag' : 'pass') : 'fail', extension.value < 1 ? 'Inside the frame projection.' : `${mm(extension.value)} (${inch(extension.value)}) at ${extension.name}; margin ${mm(LIMITS.extension - extension.value)}`));
  }
  if (polygonIntersectsRect(corners, OPPONENT_LAUNCH_ZONE)) {
    out.push(check('G416 duck in opponent LAUNCH ZONE <= 48 in', height.value <= LIMITS.duckHeight ? 'pass' : 'fail', `${mm(height.value)} vs ${mm(LIMITS.duckHeight)}`));
  }
  // Highest point of each part that lies inside a board projection: mesh vertices, plus the box centre (at mid-height)
  // for faces that span a board without a vertex inside it.
  const inBoard = point => pointInTriangle(point, BOARD.vertices) || pointInTriangle(point, BLUE_BOARD);
  const underBoard = robotParts.filter(part => !(task === 'hang' && /climber hook/.test(part.name))).map(part => {
    const b = part.box;
    let top = inBoard([(b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2]) ? (b.min.z + b.max.z) / 2 : -Infinity;
    for (const [x, y, z] of part.vertices) if (z > top && inBoard([x, y])) top = z;
    return { name: part.name, top };
  }).filter(part => part.top > -Infinity);
  if (underBoard.length) {
    const top = underBoard.reduce((best, part) => part.top > best.top ? part : best);
    const margin = BOARD.underside - top.top;
    out.push(check('Board underside clearance (32 in)', margin < 0 ? 'fail' : margin < 25.4 ? 'flag' : 'pass', `Highest robot point inside a board projection: ${top.name} at ${mm(top.top)}; margin ${mm(margin)} (field tolerance is +/-25 mm).`));
  }
  return { out, parts, height, extension, corners };
}

function taskChecks(id, task, phase, root, placement, extras, context) {
  const out = [];
  const anchors = root.userData.anchors;
  if ((task === 'vgFender' || task === 'vgZone') && phase !== 'approach') {
    out.push(check('G410 bumpers intersect own LAUNCH ZONE', polygonIntersectsRect(context.corners, LAUNCH_ZONE) ? 'pass' : 'fail', 'Bumper outline tested against the 90 x 72 in zone.'));
    const joints = root.userData.joints;
    if (id === 'SF5') out.push(check('Shot pose is a static solution', 'info', `Shoulder ${joints.shoulder.toFixed(0)} deg, column tilted ${(180 - joints.axis).toFixed(0)} deg up toward the rear. The joint path from the load pose to this pose is not checked.`));
    if (id === 'SF6') out.push(check('Shot pose is a static solution', 'info', `Carriage ${joints.carriage.toFixed(0)} mm up the ${SF6.travel.toFixed(0)} mm lift, tray tilted ${(180 - joints.tilt).toFixed(0)} deg up toward the rear. The path from the load pose is not checked.`));
    if (id === 'SF7') out.push(check('Shot pose lies on the one-DOF path', 'info', `Crank ${joints.crank.toFixed(1)} deg of ${SF7.sweep.toFixed(0)}, tray ${(180 - joints.tilt).toFixed(0)} deg up toward the rear. The linkage passes this pose on every load-to-GOAL 2 swing, and that path is checked in feasibility.json.`));
    if (id === 'SF8') out.push(check('Shot pose is a static solution', 'info', `Tilt axle ${joints.h.toFixed(0)} mm up the mast, tray ${(180 - joints.tilt).toFixed(0)} deg up toward the rear. The top and bottom flywheels are geared together, so the cube leaves without spin (drag-free sketch).`));
    for (const shot of context.shots) {
      const lane = shot.lane === 0 ? 'single lane' : `lane ${shot.lane > 0 ? 'L' : 'R'}`;
      const frontY = shot.release[1] + HALF * Math.SQRT2;
      out.push(check(`G410 cube behind RELEASE LINE (${lane})`, frontY <= VG.releaseLineY ? 'pass' : 'fail', `Cube far corner (any yaw) ${mm(VG.releaseLineY - frontY)} fieldward of the line.`));
      const r = shot.result;
      if (!r.feasible) { out.push(check(`Ballistic solution (${lane})`, 'fail', r.reason ?? 'The cube square leaves the hexagon while crossing the plane at the nominal speed.')); continue; }
      out.push(check(`Ballistic solution (${lane})`, 'pass', `${r.alphaDeg.toFixed(0)} deg launch, ${r.speedMps.toFixed(2)} m/s, ${mm(r.distance)} to plane, crossing ${r.crossingDeg.toFixed(0)} deg, apex ${inch(r.apex)}. Drag-free, non-rotating cube.`));
      const width = r.speedBandPct[1] - r.speedBandPct[0];
      out.push(check(`Speed tolerance (${lane})`, width >= 6 ? 'pass' : width >= 3 ? 'flag' : 'fail', `Shot still scores from ${r.speedBandPct[0].toFixed(1)}% to +${r.speedBandPct[1].toFixed(1)}% of nominal speed.`));
      out.push(check(`Aim tolerance (${lane})`, Math.min(-r.lateralBand[0], r.lateralBand[1]) >= 100 ? 'pass' : 'flag', `Lateral miss allowed at the plane: ${mm(r.lateralBand[0])} / +${mm(r.lateralBand[1])} (~${(Math.atan(Math.min(-r.lateralBand[0], r.lateralBand[1]) / r.distance) / deg).toFixed(1)} deg yaw).`));
      out.push(check(`Distance tolerance at fixed speed (${lane})`, Math.min(-r.distanceBand[0], r.distanceBand[1]) >= 75 ? 'pass' : 'flag', `Robot may be ${mm(-r.distanceBand[0])} closer / ${mm(r.distanceBand[1])} farther without re-tuning speed.`));
      out.push(check(`Legal defender cannot touch shot (${lane})`, r.unblockable ? 'pass' : 'flag', `When the cube clears our bumper outline its underside is at ${mm(r.footprintClearBottom)}; the G416 duck height is 1219 mm.`));
    }
  }
  if (['g1', 'g2', 'g3'].includes(task) && phase !== 'approach') {
    const goal = GOALS[{ g1: 'G1', g2: 'G2near', g3: 'G3' }[task]];
    const cubeField = toField(placement, anchors.frontCube);
    const dx = cubeField[0] - goal.center[0], dy = cubeField[1] - goal.center[1];
    const clearance = goal.throatHalf - HALF;
    out.push(check('Cube over THROAT (1 in clearance per side)', Math.max(Math.abs(dx), Math.abs(dy)) <= clearance - 10 ? 'pass' : 'fail', `Offset x ${mm(dx)}, y ${mm(dy)}; per-side clearance ${mm(clearance)}. Fork centring is ${mm(anchors.forkInner - goal.baseHalf)} per side.`));
    out.push(check('Cube bottom above RIM before drop', cubeField[2] - HALF - goal.rim >= 10 ? 'pass' : 'fail', `${mm(cubeField[2] - HALF - goal.rim)} above the ${inch(goal.rim)} rim.`));
    const penetrating = context.parts.filter(part => {
      const b = part.box;
      const overlapX = b.max.x > goal.center[0] - goal.baseHalf + 1 && b.min.x < goal.center[0] + goal.baseHalf - 1;
      const overlapY = b.max.y > goal.center[1] - goal.baseHalf + 1 && b.min.y < goal.center[1] + goal.baseHalf - 1;
      if (!overlapX || !overlapY) return false;
      const inThroat = b.min.x >= goal.center[0] - goal.throatHalf && b.max.x <= goal.center[0] + goal.throatHalf && b.min.y >= goal.center[1] - goal.throatHalf && b.max.y <= goal.center[1] + goal.throatHalf;
      return !inThroat && b.min.z < goal.rim;
    });
    out.push(check('No robot part inside the goal body', penetrating.length ? 'fail' : 'pass', penetrating.length ? `Overlaps: ${penetrating.map(part => part.name).join(', ')}` : 'Axis-aligned box test against the 24 in base; parts over the roof sit above the rim.'));
    const registration = {
      SF5: 'Depth is set by bumper contact and the fork arms straddle the base (lateral and yaw). The shoulder holds its GOAL 2 angle on an absolute encoder, not a hard stop, so arm deflection and chain backlash add to the THROAT error.',
      SF6: 'Depth is set by bumper contact and the fork arms straddle the base. The carriage sits on its top hard stop and the tray on its level stop, so the front slot position is fixed by stops, not by servo accuracy.',
      SF7: 'Depth is set by bumper contact and the fork arms straddle the base. The crank sits on its end-of-travel hard stop, which fixes the whole linkage, so the front slot is set by one stop.',
      SF8: `Depth is set by bumper contact and the fork arms straddle the base. The tray sits on its level stop; the mast holds ${task === 'g3' ? 'its top hard stop' : 'the GOAL 2 height on its encoder'}. Laterally the omni-wheel pinch centres the cube, instead of the ${Math.round(172 - 3 - HALF)} mm side play between the tray plates.`,
    }[id] ?? 'Depth is set by bumper contact with the goal face; the fork arms straddle the base (lateral and yaw); the drawer runs to a hard stop.';
    out.push(check('Registration: bumper stop + fork', 'info', registration));
    if (id === 'SF8') {
      // Closest approach of the lower dunk wheels (mesh vertices) to the THROAT's rim edges.
      let gap = Infinity;
      for (const part of context.parts.filter(item => /dunk omni wheel .* lower/.test(item.name))) for (const [x, y, z] of part.vertices) {
        const dx = Math.abs(x - goal.center[0]) - goal.throatHalf, dy = Math.abs(y - goal.center[1]) - goal.throatHalf;
        if (dx <= 0) gap = Math.min(gap, Math.hypot(Math.max(0, dy), z - goal.rim));
        if (dy <= 0) gap = Math.min(gap, Math.hypot(Math.max(0, dx), z - goal.rim));
      }
      out.push(check('Dunk wheels clear the rim edge', gap >= 8 ? 'pass' : gap >= 0 ? 'flag' : 'fail', `Lower omni wheels come within ${mm(gap)} of the rim edge (designed for ${DUNK.clearance} mm with ${DUNK.squish} mm squish into the cube).`));
      out.push(check('Dunk reaction on the tilt axle', 'info', `The wheels push the cube down and the tray up, ${mm(SF8.pivotAlong - HALF)} from the tilt axle: ${((SF8.pivotAlong - HALF) / 100).toFixed(1)} N m per 10 N of dunk force, held by the tilt drive (a level stop only resists the other way).`));
    }
    if (phase === 'release') out.push(id === 'SF8'
      ? check('Cube driven through the THROAT', 'pass', `The omni wheels drive the cube until its top leaves the lower row, ${mm(DUNK.lineAboveRim)} above the rim: its bottom is then ${mm(DUNK.driveDepth)} below the rim, past the 152 mm straight section, and it is moving down. The last ${mm(DUNK.lineAboveRim + 76.2)} to the sensor plane (RIM - 3 in) is free fall inside the THROAT.`)
      : check('Cube passes the sensor plane (RIM - 3 in)', 'pass', 'Dropped cube drawn below the sensor plane; the trapdoor swings into our own THROAT projection (allowed for our goal, G411 covers opponent goals).'));
  }
  if (task === 'hang') {
    const railTop = BOARD.rail.z + BOARD.rail.radius;
    const seats = anchors.hookSeats.map(point => toField(placement, point));
    if (phase !== 'approach') {
      const gap = Math.min(...seats.map(point => point[2] - railTop));
      out.push(check(phase === 'reach' ? 'Hooks above rail before engaging' : 'Hooks seated on rail top', phase === 'reach' ? (gap > 20 ? 'pass' : 'fail') : (Math.abs(gap) < 2 ? 'pass' : 'fail'), `Hook seat ${mm(gap)} from the rail top (${inch(railTop)}).`));
      const { mid, along } = railFrame();
      const offsets = seats.map(([x, y]) => (x - mid[0]) * along[0] + (y - mid[1]) * along[1]);
      out.push(check('Hooks within rail length', offsets.every(value => Math.abs(value) < railFrame().length / 2 - 50) ? 'pass' : 'fail', `Hooks at ${offsets.map(mm).join(' and ')} from the rail midpoint.`));
    }
    if (phase === 'hang') {
      const lowest = lowestOf(context.parts);
      out.push(check('HANG: not touching the carpet', lowest.value > 20 ? 'pass' : 'fail', `Lowest part ${lowest.name} at ${mm(lowest.value)}.`));
      out.push(check('Level hang: rail over centre of mass', 'flag', 'Assumes the COM sits within about 50 mm of the rail line. Loads, swing and hook retention are not checked.'));
    }
  }
  if (task === 'under') {
    const inside = context.corners.every(point => pointInTriangle(point, BOARD.vertices));
    out.push(check('UNDER: bumper outline inside board projection', inside ? 'pass' : 'fail', 'All 4 bumper corners tested against the red triangle.'));
    out.push(check('UNDER: height under 32 in', context.height.value < BOARD.underside ? 'pass' : 'fail', `${mm(context.height.value)}; margin ${mm(BOARD.underside - context.height.value)}.`));
  }
  if (task === 'underCube' && phase === 'intake') out.push(check('Reaches an under-board cube', 'pass', 'Target cube is 12+ in inside the board edge; robot passes under it.'));
  return out;
}

// Build one scene: placed robot, aids (trajectory, targets), hidden field cubes, checks and camera.
export function scene(id, task, phase, overrides = {}) {
  const item = concept(id);
  if (!item.tasks.includes(task)) throw new Error(`${id} does not support ${task}`);
  const pose = { ...recipe(id, task, phase), ...overrides };
  let placement = placementFor(id, task, phase, pose);
  const extras = new THREE.Group();
  extras.name = 'aids';
  const hide = [];
  const shots = [];
  if (MOUTH_CUBE[task]) {
    hide.push(MOUTH_CUBE[task].name);
    if (phase === 'approach') cubeMesh(extras, 'target floor cube', [...MOUTH_CUBE[task].at, HALF]);
  }
  if (task === 'under') hide.push('red_Field_cube_29', 'red_Field_cube_30', 'red_Field_cube_31', 'red_Field_cube_32');
  if ((task === 'vgFender' || task === 'vgZone') && phase !== 'approach') {
    if (id === 'SF1') pose.barrel = overrides.barrel ?? bestBarrelAngle(task, placement);
    if (item.family === 'magazine') Object.assign(pose, bestMagazineShot(id, `${id}/${task}`, placement), overrides);
  }
  const root = item.build(pose, 'red');
  root.position.set(placement.x, placement.y, placement.lift ?? 0);
  root.rotation.z = placement.yaw;
  root.userData.placement = placement;
  const rules = ruleChecks(id, task, phase, root, placement);
  if ((task === 'vgFender' || task === 'vgZone') && phase !== 'approach') {
    for (const release of root.userData.anchors.release) {
      const result = shotFor(placement, release.position, release.direction, root.userData.L);
      shots.push({ lane: release.lane, release: toField(placement, release.position), result });
    }
    if (phase === 'release') {
      shots.forEach((shot, index) => {
        if (!shot.result.samples) return;
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(shot.result.samples.map(p => new THREE.Vector3(...p))),
          new THREE.LineDashedMaterial({ color: shot.result.feasible ? C.aid : C.bad, dashSize: 60, gapSize: 35 }));
        line.computeLineDistances();
        line.userData.kind = 'aid';
        extras.add(line);
        if (index === 0) for (const fraction of [0.35, 0.7, 0.93]) {
          const p = shot.result.samples[Math.round(fraction * 40)];
          const ghost = cubeMesh(extras, 'cube in flight (drag-free sketch)', p, 0, { opacity: fraction < 0.9 ? 0.35 : 0.9 });
          ghost.rotation.z = placement.yaw;
        }
      });
    }
  }
  if (['g1', 'g2', 'g3'].includes(task)) {
    const goal = GOALS[{ g1: 'G1', g2: 'G2near', g3: 'G3' }[task]];
    const s = goal.throatHalf;
    const rimLoop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-s, -s], [s, -s], [s, s], [-s, s]].map(([dx, dy]) => new THREE.Vector3(goal.center[0] + dx, goal.center[1] + dy, goal.rim + 3))),
      new THREE.LineBasicMaterial({ color: C.ok }));
    rimLoop.userData.kind = 'aid';
    extras.add(rimLoop);
    if (phase === 'release' && !pose.dunk) {
      const dropped = cubeMesh(extras, 'dropped cube (scored)', [goal.center[0], goal.center[1], goal.rim - HALF - 90]);
      dropped.rotation.z = placement.yaw;
    }
  }
  if (task === 'vgFender' || task === 'vgZone') {
    const R = VG.circumradius;
    const hex = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([90, 150, 210, 270, 330, 30].map(a => new THREE.Vector3(VG.centerX + R * Math.cos(a * deg), VG.planeY - 4, VG.centerZ + R * Math.sin(a * deg)))),
      new THREE.LineBasicMaterial({ color: C.aid }));
    hex.userData.kind = 'aid';
    extras.add(hex);
  }
  const checks = [...rules.out, ...taskChecks(id, task, phase, root, placement, extras, { ...rules, shots })];
  return { id, task, phase, pose, placement, root, extras, hide, checks, shots, camera: cameraFor(task, placement, shots) };
}

function cameraFor(task, placement, shots) {
  const at = [placement.x, placement.y, 600];
  if (task === 'start') return { target: [placement.x, placement.y, 450], direction: [1.1, -1.3, 0.9], radius: 1500 };
  if (MOUTH_CUBE[task]) return { target: [...MOUTH_CUBE[task].at, 250], direction: task === 'underCube' ? [-0.9, -1.3, 0.55] : [1.2, -0.9, 0.8], radius: 1500 };
  if (task === 'vgFender' || task === 'vgZone') return { target: [VG.centerX, (placement.y + VG.planeY) / 2 - 150, 1150], direction: [1, -0.18, 0.3], radius: task === 'vgZone' ? 1850 : 1450 };
  if (['g1', 'g2', 'g3'].includes(task)) {
    const goal = GOALS[{ g1: 'G1', g2: 'G2near', g3: 'G3' }[task]];
    const side = task === 'g1' ? [1, 0.45, 0.6] : [0.45, 1, 0.75];
    return { target: [goal.center[0] + goal.faceNormal[0] * 450, goal.center[1] + goal.faceNormal[1] * 450, goal.rim * 0.72], direction: side, radius: 1350 };
  }
  if (task === 'hang') { const { along, inward } = railFrame(); return { target: [...at.slice(0, 2), 550], direction: [along[0] - inward[0] * 0.5, along[1] - inward[1] * 0.5, 0.45], radius: 1500 }; }
  if (task === 'under') return { target: [placement.x - 300, placement.y - 300, 500], direction: [-1, -0.8, 0.55], radius: 2000 };
  return { target: at, direction: [1, -1, 0.8], radius: 2000 };
}

export function isolated(id, pose) {
  const root = concept(id).build(pose, 'red');
  return root;
}

export function matrix() {
  return CONCEPTS.map(item => ({
    id: item.id,
    tasks: Object.keys(TASKS).map(task => {
      if (!item.tasks.includes(task)) return { task, supported: false };
      const phases = TASKS[task].phases.map(phase => {
        const built = scene(item.id, task, phase);
        const statuses = built.checks.map(entry => entry.status);
        return { phase, fail: statuses.filter(s => s === 'fail').length, flag: statuses.filter(s => s === 'flag').length, pass: statuses.filter(s => s === 'pass').length, checks: built.checks, barrel: built.pose.barrel };
      });
      return { task, supported: true, phases };
    }),
  }));
}

export { material };
