// Side-view geometry shared by the 4-cube magazine concepts (SF5 Column Arm, SF6 Ramp Lift), the feasibility
// searches (feasibility.mjs) and the 3D builders (robots.mjs). Robot frame: x forward, z up, mm; y is lateral.
// A magazine frame is (along, across): along runs up the magazine axis, across = (u_z, -u_x) is its normal.
import { GOALS, CUBE } from './field.mjs';

export const deg = Math.PI / 180;
export const BUMPER = 82.55;
// Throat centre when the bumper touches the goal face: 12 in beyond the bumper.
export const throatX = L => L / 2 + BUMPER + 12 * 25.4;

// SF5 column: 4 cubes stacked on the axis, side pinch belts, no gate. The near wall (belt backbone and wrist) is
// 150 mm behind the cube centre line; the side walls stop 68 mm past it (the 18 in budget at a goal is 69.9 mm).
export const COLUMN = { gate: 10, length: 950, nearWall: 150, sideWallPastCentre: 68 };
// SF6 tray: 4 cubes in line, floor belt under slots 2-4, trapdoor under slot 1, compliant top belt over all four,
// and a single top kicker flywheel at the rear end that drives the cube along the floor plate (one-sided shooter).
// Front side walls stop 68 mm past the front cube centre.
export const TRAY = { front: CUBE / 2 - 68, length: 950, floor: 134, top: 150, kickerStart: 870, kickerTop: 190 };

export const pointOn = ([x, z], axisDeg, along, across) => {
  const u = [Math.cos(axisDeg * deg), Math.sin(axisDeg * deg)], n = [u[1], -u[0]];
  return [x + u[0] * along + n[0] * across, z + u[1] * along + n[1] * across];
};

// Separating-axis overlap test for two convex side-view polygons (touching counts as clear).
export function convexOverlap(a, b) {
  for (const poly of [a, b]) for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i], [x2, z2] = poly[(i + 1) % poly.length], axis = [z1 - z2, x2 - x1];
    const project = pts => pts.map(([x, z]) => x * axis[0] + z * axis[1]);
    const pa = project(a), pb = project(b);
    if (Math.max(...pa) <= Math.min(...pb) || Math.max(...pb) <= Math.min(...pa)) return false;
  }
  return true;
}

// Over-bumper intake tunnel: pivot 36 mm inside the front frame edge at floorZ, lip 50 mm above the carpet, 50 deg.
// Its cube centre line runs 120.3 mm above the tunnel floor, heading up-rear (axis 130). The magazine mouth sits
// 50 mm further up that line, so a cube bridges the gap to the tunnel's rear roller.
export function tunnelFor(L) {
  const t = { pivotX: L / 2 - 36, floorZ: 250, lipZ: 50, angle: 50 };
  t.length = (t.floorZ - t.lipZ) / Math.sin(t.angle * deg);
  const exit = [t.pivotX + 120.3 * Math.sin(t.angle * deg), t.floorZ + 120.3 * Math.cos(t.angle * deg)];
  t.loadBottom = pointOn(exit, 130, 50, 0).map(v => Math.round(v));
  // Upright stowed tunnel: side plates reach 300 mm rearward of the pivot; rollers and gearbox up to the frame edge.
  t.keepout = [[t.pivotX - 305, t.floorZ - 30], [L / 2, t.floorZ - 30], [L / 2, t.floorZ + t.length + 45], [t.pivotX - 305, t.floorZ + t.length + 45]];
  return t;
}

export function columnAt(bottom, axisDeg) {
  return [[-COLUMN.nearWall, -COLUMN.gate], [COLUMN.sideWallPastCentre, -COLUMN.gate], [COLUMN.sideWallPastCentre, COLUMN.length - COLUMN.gate], [-COLUMN.nearWall, COLUMN.length - COLUMN.gate]]
    .map(([across, along]) => pointOn(bottom, axisDeg, along, across));
}
export const wristOf = (bottom, axisDeg, along) => pointOn(bottom, axisDeg, along, -COLUMN.nearWall);
export const bottomFromWrist = (wrist, axisDeg, along) => pointOn(wrist, axisDeg, -along, COLUMN.nearWall);
export const columnFromWrist = (wrist, axisDeg, along) => columnAt(bottomFromWrist(wrist, axisDeg, along), axisDeg);

// Convex hull of the tray side view (body plus the rear kicker flywheel).
export function trayAt(front, axisDeg) {
  const { front: f, length, floor, top, kickerStart, kickerTop } = TRAY;
  return [[-floor, f], [top, f], [kickerTop, kickerStart], [kickerTop, length], [-floor, length]]
    .map(([across, along]) => pointOn(front, axisDeg, along, across));
}

// ------------------------------------------------------------------ chosen geometry (see feasibility.json)
// SF5 needs a 34 x 26 in frame: in 30 x 28 in no start pose of the 950 mm column clears the stowed intake.
export const LONG_FRAME = { L: 34 * 25.4, W: 26 * 25.4 };
export const STANDARD_FRAME = { L: 762, W: 711.2 };

// SF5: shoulder at the 42 in start ceiling, wrist on the near wall 50 mm above the column mouth. Loading and the
// GOAL 2 drop both hold the column vertical, so a cycle is a pure shoulder swing with the wrist chain held.
export const SF5 = { ...LONG_FRAME, pivot: [-41.8, 1020], arm: 712, wristAlong: 50, loadAxis: 90, start: { shoulder: -116, axis: 50 } };
export function sf5Pose(shoulderDeg, axisDeg) {
  const wrist = [SF5.pivot[0] + SF5.arm * Math.cos(shoulderDeg * deg), SF5.pivot[1] + SF5.arm * Math.sin(shoulderDeg * deg)];
  return { wrist, bottom: bottomFromWrist(wrist, axisDeg, SF5.wristAlong), axis: axisDeg, shoulder: shoulderDeg };
}
// Shoulder angle that puts the column mouth closest to a target (column axis given); error = residual distance.
export function sf5Reach(bottom, axisDeg) {
  const w = wristOf(bottom, axisDeg, SF5.wristAlong);
  const shoulder = Math.atan2(w[1] - SF5.pivot[1], w[0] - SF5.pivot[0]) / deg;
  return { shoulder, error: Math.abs(Math.hypot(w[0] - SF5.pivot[0], w[1] - SF5.pivot[1]) - SF5.arm) };
}
export const sf5Drop = L => [throatX(L), GOALS.G2near.rim + 40];

// SF6: single-stage inclined elevator on the 30 x 28 in frame. The tray tilts on two stub axles on its side plates,
// on the cube centre line in slot 4. The carriage path is the line through the axle positions of the load pose
// (axis 130, in line with the tunnel) and the level GOAL 3 pose; the carriage top hard stop is the GOAL 3 pose.
export const SF6 = { ...STANDARD_FRAME, pivotOnTray: { along: 800, across: 0 }, start: { s: -75, axis: 86 } };
{
  const { along, across } = SF6.pivotOnTray;
  const g3Front = [throatX(SF6.L) + CUBE / 2, GOALS.G3.rim + 40 + CUBE / 2];
  SF6.g3Front = g3Front;
  SF6.pivotLoad = pointOn(tunnelFor(SF6.L).loadBottom, 130, along, across);
  SF6.pivotG3 = pointOn(g3Front, 180, along, across);
  const d = [SF6.pivotG3[0] - SF6.pivotLoad[0], SF6.pivotG3[1] - SF6.pivotLoad[1]];
  SF6.travel = Math.hypot(...d);
  SF6.u = [d[0] / SF6.travel, d[1] / SF6.travel];
  SF6.beta = Math.atan2(SF6.u[0], SF6.u[1]) / deg;
  // Fixed stage from z 100 (or 30 mm inside the frame edge) to z 1040; one moving stage of the same length.
  const edge = SF6.u[0] > 0 ? (-(SF6.L / 2 - 30) - SF6.pivotLoad[0]) / SF6.u[0] : -Infinity;
  SF6.rail = { baseS: Math.max((100 - SF6.pivotLoad[1]) / SF6.u[1], edge), topS: (1040 - SF6.pivotLoad[1]) / SF6.u[1] };
  SF6.rail.length = SF6.rail.topS - SF6.rail.baseS;
}
export function sf6Pose(s, axisDeg) {
  const pivot = [SF6.pivotLoad[0] + SF6.u[0] * s, SF6.pivotLoad[1] + SF6.u[1] * s];
  const offset = pointOn([0, 0], axisDeg, SF6.pivotOnTray.along, SF6.pivotOnTray.across);
  return { pivot, front: [pivot[0] - offset[0], pivot[1] - offset[1]], axis: axisDeg, s };
}

// SF8 dunk tray: the SF6 tray with no trapdoor. Slot 1 has two rows of omni wheels on the cube's side faces (drive
// across the tray, free along it), so at a goal the cube is driven straight down into the THROAT. The lower row is
// as low as the rim edge allows (wheel 10 mm clear of the edge, 5 mm squish into the foam). The kicker is two-sided
// (top and bottom flywheels), so the cube leaves without spin.
export const DUNK = { radius: 41, squish: 5.3, clearance: 10, along: [62, 170], upperAcross: 40, goalGap: 40 };
DUNK.y = CUBE / 2 + DUNK.radius - DUNK.squish;
DUNK.lineAboveRim = Math.sqrt((DUNK.radius + DUNK.clearance) ** 2 - (DUNK.y - 5.5 * 25.4) ** 2);
DUNK.lowerAcross = DUNK.lineAboveRim - DUNK.goalGap - CUBE / 2;
// Cube bottom below the rim when its top leaves the lower wheels (the THROAT is straight for 152 mm).
DUNK.driveDepth = CUBE - DUNK.lineAboveRim;
// Side-view hull of the dunk tray (body, lower dunk wheels, two-sided kicker) plus a 16 mm boss around the tilt
// axle, which sits on side-plate ears at the rear corner.
export function dunkTrayAt(front, axisDeg, pivot = SF8.pivotOnTray) {
  const { front: f, length, top, kickerStart, kickerTop } = TRAY, wheelLow = -DUNK.lowerAcross + DUNK.radius, boss = 16;
  const local = [[-wheelLow, f], [top, f], [kickerTop, kickerStart], [kickerTop, length], [-kickerTop, length], [-kickerTop, kickerStart]];
  for (const [da, dc] of [[-boss, -boss], [boss, -boss], [boss, boss], [-boss, boss]]) local.push([pivot.across + dc, pivot.along + da]);
  return convexHull(local.map(([across, along]) => pointOn(front, axisDeg, along, across)));
}
export function convexHull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = list => { const out = []; for (const q of list) { while (out.length >= 2 && cross(out.at(-2), out.at(-1), q) <= 0) out.pop(); out.push(q); } out.pop(); return out; };
  return [...half(p), ...half(p.slice().reverse())];
}

// SF8: vertical mast, tray hinged on stub axles on its side plates at (along a, across c). Level poses over the
// GOAL 2 and GOAL 3 THROATs differ only in height, so the mast is vertical; the load pose (in line with the tunnel)
// must put the axle on the same vertical line, which fixes c for each a.
export function mastPivot(L, along, loadAxis = 130) {
  const x = throatX(L) + CUBE / 2, th = loadAxis * deg, load = tunnelFor(L).loadBottom;
  const across = (x - load[0] - along * (1 + Math.cos(th))) / Math.sin(th);
  const height = rim => rim + DUNK.goalGap + CUBE / 2 + across;
  return { along, across, mastX: x - along, load: pointOn(load, loadAxis, along, across)[1], g1: height(GOALS.G1.rim), g2: height(GOALS.G2near.rim), g3: height(GOALS.G3.rim) };
}
// Chosen from feasibility.json dunkMast: the load pose sits 4 deg steeper than the 50 deg tunnel (a 4 deg kink at the
// handoff); in line (130) no axle position on the side plate gives a legal start on the 30 in frame.
export const SF8 = { ...STANDARD_FRAME, pivotAlong: 930, loadAxis: 126, start: { h: 1020, axis: 92 }, carriage: { up: 25, down: 70 } };
{
  Object.assign(SF8, mastPivot(SF8.L, SF8.pivotAlong, SF8.loadAxis));
  SF8.pivotOnTray = { along: SF8.along, across: SF8.across };
}
export function sf8Pose(h, axisDeg) {
  const offset = pointOn([0, 0], axisDeg, SF8.pivotOnTray.along, SF8.pivotOnTray.across);
  return { pivot: [SF8.mastX, h], front: [SF8.mastX - offset[0], h - offset[1]], axis: axisDeg, h };
}

export function circumcircle(a, b, c) {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-6) return null;
  const s = p => p[0] ** 2 + p[1] ** 2;
  const o = [(s(a) * (b[1] - c[1]) + s(b) * (c[1] - a[1]) + s(c) * (a[1] - b[1])) / d, (s(a) * (c[0] - b[0]) + s(b) * (a[0] - c[0]) + s(c) * (b[0] - a[0])) / d];
  return { o, r: Math.hypot(a[0] - o[0], a[1] - o[1]) };
}

// SF7: the SF6 tray on a four-bar driven by one motor (feasibility.json fourBarTray bestHang, 30 x 28 in). The tray
// is the coupler; its two joints are stub axles on the side plates. Each ground pivot is the circumcentre of its
// coupler joint in the three precision poses (start, load in line with the tunnel, level over the GOAL 2 THROAT).
// Both ground pivots sit under 30 in, so the front half of the robot fits under the board to hang.
export const SF7 = { ...STANDARD_FRAME, start: { front: [-131, 80], axis: 90 }, couplers: [[750, 0], [825, -100]] };
{
  SF7.load = { front: tunnelFor(SF7.L).loadBottom, axis: 130 };
  SF7.goal = { front: [throatX(SF7.L) + CUBE / 2, GOALS.G2near.rim + 40 + CUBE / 2], axis: 180 };
  const world = (pose, [along, across]) => pointOn(pose.front, pose.axis, along, across);
  SF7.links = SF7.couplers.map(c => {
    const k = circumcircle(world(SF7.start, c), world(SF7.load, c), world(SF7.goal, c));
    return { coupler: c, ground: k.o, length: k.r };
  });
  const [A] = SF7.links, ang = p => Math.atan2(p[1] - A.ground[1], p[0] - A.ground[0]);
  const aS = ang(world(SF7.start, A.coupler)), aL = ang(world(SF7.load, A.coupler)), aG = ang(world(SF7.goal, A.coupler));
  const span = v => ((v % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  SF7.dir = span(aG - aS) > span(aL - aS) ? 1 : -1;
  SF7.crankStart = aS;
  SF7.sweep = span(SF7.dir * (aG - aS)) / deg;
  SF7.loadCrank = span(SF7.dir * (aL - aS)) / deg;
}
// Drive the crank (link A) `crankDeg` from the start pose; link B follows its branch continuously from the start.
export function sf7Pose(crankDeg) {
  const [A, B] = SF7.links;
  const localPhi = Math.atan2(B.coupler[1] - A.coupler[1], B.coupler[0] - A.coupler[0]);
  const d12 = Math.hypot(B.coupler[0] - A.coupler[0], B.coupler[1] - A.coupler[1]);
  let pB = pointOn(SF7.start.front, SF7.start.axis, ...B.coupler), pA = null;
  const steps = Math.max(1, Math.ceil(Math.abs(crankDeg)));
  for (let k = 1; k <= steps; k++) {
    const a = SF7.crankStart + SF7.dir * crankDeg * deg * k / steps;
    pA = [A.ground[0] + A.length * Math.cos(a), A.ground[1] + A.length * Math.sin(a)];
    const dx = B.ground[0] - pA[0], dz = B.ground[1] - pA[1], dd = Math.hypot(dx, dz);
    const along = (d12 * d12 - B.length * B.length + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, d12 * d12 - along * along));
    const base = [pA[0] + dx * along / dd, pA[1] + dz * along / dd];
    const c1 = [base[0] - dz * h / dd, base[1] + dx * h / dd], c2 = [base[0] + dz * h / dd, base[1] - dx * h / dd];
    pB = Math.hypot(c1[0] - pB[0], c1[1] - pB[1]) < Math.hypot(c2[0] - pB[0], c2[1] - pB[1]) ? c1 : c2;
  }
  // The across axis is u rotated by -90 deg, so a local direction at psi points at world angle (axis - psi).
  const axis = ((Math.atan2(pB[1] - pA[1], pB[0] - pA[0]) + localPhi) / deg + 720) % 360;
  const offset = pointOn([0, 0], axis, ...A.coupler);
  return { front: [pA[0] - offset[0], pA[1] - offset[1]], axis, joints: [pA, pB], crank: crankDeg };
}
