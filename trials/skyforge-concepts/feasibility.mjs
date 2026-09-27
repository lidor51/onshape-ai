// 2D (side-view) feasibility studies behind the 4-cube magazine concepts. Robot frame: x forward, z up, mm.
// Run: node feasibility.mjs  (writes feasibility.json; `debug` skips the slow rigid-arm search).
import { GOALS, LIMITS, CUBE, BOARD } from './field.mjs';
import { deg, COLUMN, TRAY, throatX, tunnelFor, columnAt, trayAt, pointOn, wristOf, columnFromWrist, convexOverlap, circumcircle, SF6, sf6Pose, SF8, sf8Pose, mastPivot, dunkTrayAt } from './magazine.mjs';
import { evaluateThroatShot } from './geometry.mjs';

// How many stacked cubes fit above each rim, with 40 mm drop clearance and 25 mm of column structure on top.
export function heightBudget() {
  return [['G1', LIMITS.duckHeight, 'G416: GOAL 1 sits inside the opponent LAUNCH ZONE'], ['G2near', LIMITS.maxHeight, 'R106'], ['G3', LIMITS.maxHeight, 'R106']]
    .map(([key, limit, rule]) => {
      const goal = GOALS[key];
      const cubes = Math.floor((limit - goal.rim - 40 - 25) / CUBE);
      return { goal: goal.name, rim: goal.rim, limit, rule, cubes, fourCubeTop: goal.rim + 40 + 4 * CUBE + 25 };
    });
}

const startViolation = (points, L) => Math.max(...points.map(([x, z]) => Math.max(Math.abs(x) - L / 2, 30 - z, z - LIMITS.startHeight)));

// Start pose: inside the frame and 42 in, above the drivebase (swerve motors and belly pan, about 120 mm) and clear
// of the upright stowed intake tunnel.
const START_FLOOR = 120;
const startOk = (points, L) => startViolation(points, L) <= 0 && Math.min(...points.map(([, z]) => z)) >= START_FLOOR && !convexOverlap(points, tunnelFor(L).keepout);

// A column rigidly fixed to one arm: search every pivot inside the robot and every rotation for a legal start pose,
// then require the whole swing from stow to the GOAL 2 drop to stay inside the 78 in / 18 in match envelope.
export function rigidArmSearch(L = 762, step = 10) {
  const g2 = columnAt([throatX(L), GOALS.G2near.rim + 40], 90);
  const rotate = (px, pz, t) => { const c = Math.cos(t * deg), s = Math.sin(t * deg); return g2.map(([x, z]) => [px + (x - px) * c - (z - pz) * s, pz + (x - px) * s + (z - pz) * c]); };
  const matchViolation = points => Math.max(...points.map(([x, z]) => Math.max(Math.abs(x) - (L / 2 + LIMITS.extension), 20 - z, z - LIMITS.maxHeight)));
  let bestStow = null, bestLegal = null, legalStarts = 0;
  for (let px = -L / 2; px <= L / 2; px += step) for (let pz = 100; pz <= LIMITS.startHeight; pz += step) for (let t = -180; t < 180; t += 1) {
    const pts = rotate(px, pz, t), stow = startViolation(pts, L);
    if (!bestStow || stow < bestStow.violation) bestStow = { violation: stow, pivot: [px, pz], rotation: t };
    if (!startOk(pts, L)) continue;
    legalStarts++;
    for (const end of [t, t - 360 * Math.sign(t || 1)]) {
      let sweep = -Infinity;
      for (let a = 0; Math.abs(a) <= Math.abs(end); a += Math.sign(end) * 2) sweep = Math.max(sweep, matchViolation(rotate(px, pz, a)));
      if (!bestLegal || sweep < bestLegal.violation) bestLegal = { violation: sweep, pivot: [px, pz], rotation: end };
    }
  }
  return { L, legalStarts, bestStow, bestLegalSwing: bestLegal };
}

// Passive 4-bar levelling keeps the column vertical: the drop points only translate on a circle about the pivot.
export function leveledArm(L = 762) {
  const x = throatX(L), z1 = GOALS.G1.rim + 40, z2 = GOALS.G2near.rim + 40;
  const pz = (z1 + z2) / 2, half = (z2 - z1) / 2;
  const stow = [L / 2 - 20 - COLUMN.sideWallPastCentre, 80];
  const px = ((stow[0] ** 2 + (stow[1] - pz) ** 2) - (x ** 2 + half ** 2)) / (2 * (stow[0] - x));
  const radius = Math.hypot(x - px, half);
  return { pivot: [px, pz], radius, stowBottom: stow, stowTop: stow[1] + COLUMN.length, loadBottomInsideFrame: pz - Math.sqrt(radius ** 2 - (L / 2 - 150 - px) ** 2) };
}

// Rigid motion between two side-view poses (point + axis): rotation angle and its pole (the only possible pivot).
function pole([ax, az], axisA, [bx, bz], axisB) {
  const t = wrap(axisB - axisA) * deg;
  if (Math.abs(t) < 1e-6) return null;
  const m = [(ax + bx) / 2, (az + bz) / 2], h = Math.hypot(bx - ax, bz - az) / 2 / Math.tan(t / 2);
  const n = [-(bz - az), bx - ax], len = Math.hypot(...n);
  return { angle: t / deg, pivot: [m[0] + n[0] / len * h, m[1] + n[1] / len * h] };
}

// A single pin joint moves the magazine rigidly, so the load pose and the GOAL 2 pose fix the pivot (their pole).
// Load axis 130 is in line with the tunnel; others need a curved handoff. The pivot must sit inside the robot and
// under the start ceiling, and some rotation about it must give a legal start pose.
export function singlePivotPoles(L = 762) {
  const t = tunnelFor(L), throat = throatX(L);
  const magazines = {
    trayLevel: { goal: [throat + CUBE / 2, GOALS.G2near.rim + 40 + CUBE / 2], goalAxis: 180, profile: trayAt },
    columnDrop: { goal: [throat, GOALS.G2near.rim + 40], goalAxis: 90, profile: columnAt },
  };
  const out = {};
  for (const [name, m] of Object.entries(magazines)) {
    out[name] = [];
    for (let loadAxis = 80; loadAxis <= 140; loadAxis += 10) {
      const p = pole(t.loadBottom, loadAxis, m.goal, m.goalAxis);
      if (!p) { out[name].push({ loadAxis, pivot: null, verdict: 'pure translation: no pivot exists' }); continue; }
      const inRobot = Math.abs(p.pivot[0]) <= L / 2 - 30 && p.pivot[1] >= 80 && p.pivot[1] <= LIMITS.startHeight - 20;
      let starts = 0;
      if (inRobot) for (let a = -180; a < 180; a += 1) {
        const c = Math.cos(a * deg), s = Math.sin(a * deg);
        const rot = ([x, z]) => [p.pivot[0] + (x - p.pivot[0]) * c - (z - p.pivot[1]) * s, p.pivot[1] + (x - p.pivot[0]) * s + (z - p.pivot[1]) * c];
        if (startOk(m.profile(m.goal, m.goalAxis).map(rot), L)) starts++;
      }
      out[name].push({ loadAxis, swing: Math.round(p.angle), pivot: p.pivot.map(Math.round), inRobot, legalStartAngles: starts });
    }
  }
  return { L, ...out };
}

// Four-bar with one motor: the tray is the coupler. Three precision poses (start, load in line with the tunnel,
// level over the GOAL 2 THROAT) fix each ground pivot as the circumcentre of a coupler point's three positions.
// The linkage is then driven from start to goal and must pass the load pose in order without a dead point, stay
// inside 78 in / 18 in, and pass a rear-up pose usable as a VERTICAL GOAL shot (35-65 deg, release >= 900 mm; the
// ballistic and defender checks run later on the chosen linkage).
export function fourBarTraySearch(L = 762) {
  const t = tunnelFor(L), throat = throatX(L);
  const load = { front: t.loadBottom, axis: 130 };
  const goal = { front: [throat + CUBE / 2, GOALS.G2near.rim + 40 + CUBE / 2], axis: 180 };
  const world = (pose, [along, across]) => pointOn(pose.front, pose.axis, along, across);
  const starts = [];
  for (let axis = 70; axis <= 110; axis += 2) for (let x = -L / 2; x <= L / 2; x += 10) for (let z = 60; z <= 400; z += 10) {
    if (startOk(trayAt([x, z], axis), L)) starts.push({ front: [x, z], axis });
  }
  const couplerPoints = [];
  for (let along = -100; along <= 1050; along += 25) for (let across = -350; across <= 350; across += 25) couplerPoints.push([along, across]);
  const circum = circumcircle;
  const results = [], why = {};
  let tested = 0;
  for (const start of starts) {
    const links = [];
    for (const c of couplerPoints) {
      const k = circum(world(start, c), world(load, c), world(goal, c));
      if (!k || k.r < 150 || k.r > 1300) continue;
      if (Math.abs(k.o[0]) > L / 2 - 30 || k.o[1] < 80 || k.o[1] > LIMITS.startHeight - 20) continue;
      links.push({ c, ...k });
    }
    for (let i = 0; i < links.length; i++) for (let j = i + 1; j < links.length; j++) {
      const A = links[i], B = links[j];
      const d12 = Math.hypot(A.c[0] - B.c[0], A.c[1] - B.c[1]);
      if (d12 < 120 || Math.hypot(A.o[0] - B.o[0], A.o[1] - B.o[1]) < 80) continue;
      tested++;
      const res = driveFourBar(A, B, d12, start, load, goal, world, L, why);
      if (res) results.push({ start, linkA: { ground: A.o.map(Math.round), coupler: A.c, length: Math.round(A.r) }, linkB: { ground: B.o.map(Math.round), coupler: B.c, length: Math.round(B.r) }, ...res });
    }
  }
  results.sort((a, b) => b.shot.release[1] - a.shot.release[1] || a.crankSweep - b.crankSweep);
  // Hang: the front half goes under the 32 in board with the robot lifted 50 mm, so ground pivots (plus 25 mm of axle
  // and tower) must stay 25 mm under it, and the upright start tray must stay behind the rail line (x 150).
  const hangOk = r => Math.max(r.linkA.ground[1], r.linkB.ground[1]) + 25 + 50 <= BOARD.underside - 25 && Math.max(...trayAt(r.start.front, r.start.axis).map(p => p[0])) <= 60;
  const hang = results.filter(hangOk);
  return { L, startPoses: starts.length, pairsTested: tested, rejected: why, count: results.length, hangCompatible: hang.length, best: results[0] ?? null, bestHang: hang[0] ?? null, next: results.slice(1, 4) };
}

// Drive link A from the start pose to the goal pose; link B closes the loop on a continuous branch. The driven
// coupler must match the load and goal poses (a solution on the other assembly branch is rejected).
const matches = (pose, target) => Math.hypot(pose.front[0] - target.front[0], pose.front[1] - target.front[1]) < 20 && Math.abs(wrap(pose.axis - target.axis)) < 3;
function driveFourBar(A, B, d12, start, load, goal, world, L, why) {
  const ang = p => Math.atan2(p[1] - A.o[1], p[0] - A.o[0]);
  const aS = ang(world(start, A.c)), aL = ang(world(load, A.c)), aG = ang(world(goal, A.c));
  const span = s => ((s % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let reason = 'order';
  for (const dir of [1, -1]) {
    const total = span(dir * (aG - aS)), toLoad = span(dir * (aL - aS));
    if (toLoad >= total) continue;
    const bStart = world(start, B.c);
    let prev = bStart, ok = true, worst = -Infinity, shot = null;
    const localA = A.c, localB = B.c, phiLocal = Math.atan2(localB[1] - localA[1], localB[0] - localA[0]);
    const steps = 90;
    for (let k = 1; k <= steps && ok; k++) {
      const a = aS + dir * total * k / steps;
      const pA = [A.o[0] + A.r * Math.cos(a), A.o[1] + A.r * Math.sin(a)];
      const dx = B.o[0] - pA[0], dz = B.o[1] - pA[1], dd = Math.hypot(dx, dz);
      if (dd > d12 + B.r || dd < Math.abs(d12 - B.r)) { ok = false; reason = 'toggle'; break; }
      const along = (d12 * d12 - B.r * B.r + dd * dd) / (2 * dd), hh = Math.sqrt(Math.max(0, d12 * d12 - along * along));
      const base = [pA[0] + dx * along / dd, pA[1] + dz * along / dd];
      const cands = [[base[0] - dz * hh / dd, base[1] + dx * hh / dd], [base[0] + dz * hh / dd, base[1] - dx * hh / dd]];
      if (hh < 5) { ok = false; reason = 'toggle'; break; }
      const pB = Math.hypot(cands[0][0] - prev[0], cands[0][1] - prev[1]) < Math.hypot(cands[1][0] - prev[0], cands[1][1] - prev[1]) ? cands[0] : cands[1];
      if (Math.hypot(pB[0] - prev[0], pB[1] - prev[1]) > 80) { ok = false; reason = 'jump'; break; }
      prev = pB;
      // Coupler pose from the two joint positions. The magazine's across axis is u rotated by -90 deg, so a local
      // direction at angle psi = atan2(across, along) points at world angle (axis - psi).
      const phiWorld = Math.atan2(pB[1] - pA[1], pB[0] - pA[0]);
      const axis = ((phiWorld + phiLocal) / deg + 720) % 360;
      const frontOffset = pointOn([0, 0], axis, localA[0], localA[1]);
      const pose = { front: [pA[0] - frontOffset[0], pA[1] - frontOffset[1]], axis };
      worst = Math.max(worst, inside(trayAt(pose.front, axis), L));
      const alpha = 180 - axis;
      if (alpha >= 35 && alpha <= 65) {
        const release = pointOn(pose.front, axis, 910 + CUBE / 2, 0);
        const top = Math.max(...trayAt(pose.front, axis).map(p => p[1]));
        if (release[1] >= 900 && top <= LIMITS.maxHeight - 60 && (!shot || release[1] > shot.release[1])) shot = { crank: Math.round(total * k / steps / deg), alpha: Math.round(alpha), release: release.map(Math.round) };
      }
      if (Math.abs(k / steps - toLoad / total) < 0.5 / steps && !matches(pose, load)) { ok = false; reason = 'loadBranch'; }
      if (k === steps && !matches(pose, goal)) { ok = false; reason = 'goalBranch'; }
    }
    if (ok && worst <= 0 && shot) return { crankSweep: Math.round(total / deg), loadAtCrank: Math.round(toLoad / deg), pathMargin: Math.round(-worst), shot };
    if (ok) reason = worst > 0 ? 'envelope' : 'noShot';
  }
  why[reason] = (why[reason] ?? 0) + 1;
  return null;
}

const inside = (points, L) => Math.max(...points.map(([x, z]) => Math.max(Math.abs(x) - (L / 2 + LIMITS.extension), 20 - z, z - LIMITS.maxHeight)));
// Envelope margin with `spare` mm demanded under the 78 in ceiling and above the floor (the 18 in limit stays exact:
// the goal poses use the whole reach budget by design).
const marginOf = (points, L, spare) => Math.min(...points.map(([x, z]) => Math.min(L / 2 + LIMITS.extension - Math.abs(x), z - 20 - spare, LIMITS.maxHeight - spare - z)));

const wrap = a => ((a % 360) + 540) % 360 - 180;

// Shoulder + wrist: the wrist sits on the column's near wall, `along` mm up from the gate. Needs the GOAL 2 drop,
// a load pose at the intake tunnel exit and a legal start pose. Motion is checked on a joint grid (shoulder 2 deg,
// column axis 5 deg): a path is a sequence of grid poses where the axis moves at most 10 deg per 2 deg of shoulder,
// so it is a continuous joint trajectory. The path value is its smallest envelope margin (78 in, 18 in, floor).
// loadAxis 130 is in line with the 50 deg tunnel; 90-110 need a curved handoff plate at the column mouth.
export function wristArmSearch(L = 762, { loadAxes = [90, 110, 130], spare = 0 } = {}) {
  const drop = [throatX(L), GOALS.G2near.rim + 40];
  const solutions = [];
  const rejected = { cycle: 0, stow: 0, closest: null };
  const S = 180, A = 72, sOf = a => ((Math.round((a + 180) / 2) % S) + S) % S, aOf = axis => ((Math.round(axis / 5) % A) + A) % A;
  // Max-min margin from a fixed (s0, i0) walking the shoulder grid in direction dir; returns value[s][i] for every reached pose.
  const sweep = (margin, s0, i0, dir, steps) => {
    const out = [];
    let row = new Float64Array(A).fill(-Infinity);
    row[i0] = margin[s0 * A + i0];
    out.push({ s: s0, row });
    for (let k = 1; k <= steps; k++) {
      const s = ((s0 + dir * k) % S + S) % S, next = new Float64Array(A).fill(-Infinity);
      for (let i = 0; i < A; i++) {
        let best = -Infinity;
        for (let d = -2; d <= 2; d++) best = Math.max(best, row[(i + d + A) % A]);
        if (best > -Infinity) next[i] = Math.min(best, margin[s * A + i]);
      }
      row = next;
      out.push({ s, row });
    }
    return out;
  };
  for (const loadAxis of loadAxes) for (let along = 50; along <= 750; along += 25) {
    const load = { bottom: tunnelFor(L).loadBottom, axis: loadAxis };
    const wDrop = wristOf(drop, 90, along), wLoad = wristOf(load.bottom, load.axis, along);
    for (let px = -L / 2 + 40; px <= L / 2 - 40; px += 10) for (let pz = 450; pz <= LIMITS.startHeight - 40; pz += 10) {
      const radius = Math.hypot(wDrop[0] - px, wDrop[1] - pz);
      if (Math.abs(Math.hypot(wLoad[0] - px, wLoad[1] - pz) - radius) > 15) continue;
      const at = a => [px + radius * Math.cos(a * deg), pz + radius * Math.sin(a * deg)];
      const angleOf = w => Math.atan2(w[1] - pz, w[0] - px) / deg;
      const aDrop = angleOf(wDrop), aLoad = angleOf(wLoad);
      const margin = new Float64Array(S * A);
      for (let s = 0; s < S; s++) for (let i = 0; i < A; i++) margin[s * A + i] = marginOf(columnFromWrist(at(-180 + 2 * s), 5 * i, along), L, spare);
      // The exact goal and load poses are off-grid; score them exactly and use the grid in between.
      const exactEnds = Math.min(marginOf(columnFromWrist(wDrop, 90, along), L, spare), marginOf(columnFromWrist(wLoad, loadAxis, along), L, spare));
      const sLoad = sOf(aLoad), sDrop = sOf(aDrop), iLoad = aOf(loadAxis), iDrop = aOf(90);
      let cycle = null;
      for (const dir of [1, -1]) {
        const steps = ((dir * (sDrop - sLoad)) % S + S) % S;
        const saved = [margin[sLoad * A + iLoad], margin[sDrop * A + iDrop]];
        margin[sLoad * A + iLoad] = margin[sDrop * A + iDrop] = exactEnds;
        const value = sweep(margin, sLoad, iLoad, dir, steps).at(-1).row[iDrop];
        [margin[sLoad * A + iLoad], margin[sDrop * A + iDrop]] = saved;
        if (!cycle || value > cycle.value) cycle = { value, span: 2 * steps * dir };
      }
      if (cycle.value < 0) {
        rejected.cycle++;
        if (!rejected.closest || cycle.value > -rejected.closest.violation) rejected.closest = { violation: Math.round(-cycle.value), loadAxis, pivot: [px, pz], along };
        continue;
      }
      // Start pose: any grid pose inside the start envelope, joined to the load pose by a legal path.
      let stow = null;
      for (const dir of [1, -1]) for (const { s, row } of sweep(margin, sLoad, iLoad, dir, S / 2)) for (let i = 0; i < A; i++) {
        if (row[i] < 0 || (stow && row[i] <= stow.value)) continue;
        const pts = columnFromWrist(at(-180 + 2 * s), 5 * i, along);
        if (startOk(pts, L)) stow = { value: row[i], shoulder: -180 + 2 * s, axis: 5 * i };
      }
      if (!stow) { rejected.stow++; continue; }
      solutions.push({
        loadAxis, pivot: [px, pz], radius: Math.round(radius), wristAlong: along,
        shoulder: { load: Math.round(aLoad), drop: Math.round(aDrop), stow: stow.shoulder }, stowAxis: stow.axis,
        shoulderTravel: Math.abs(cycle.span), wristTravel: Math.round(Math.abs(wrap(90 - loadAxis) - cycle.span)),
        cycleMargin: Math.round(cycle.value * 10) / 10, startPathMargin: Math.round(stow.value * 10) / 10,
      });
    }
  }
  const effort = s => s.shoulderTravel + s.wristTravel;
  const byLoad = Object.fromEntries(loadAxes.map(axis => {
    const set = solutions.filter(s => s.loadAxis === axis);
    return [axis, {
      count: set.length,
      range: set.length ? { pivotX: [Math.min(...set.map(s => s.pivot[0])), Math.max(...set.map(s => s.pivot[0]))], pivotZ: [Math.min(...set.map(s => s.pivot[1])), Math.max(...set.map(s => s.pivot[1]))], arm: [Math.min(...set.map(s => s.radius)), Math.max(...set.map(s => s.radius))], wristAlong: [Math.min(...set.map(s => s.wristAlong)), Math.max(...set.map(s => s.wristAlong))] } : null,
      leastMotion: set.slice().sort((a, b) => effort(a) - effort(b) || b.pivot[1] - a.pivot[1])[0] ?? null,
      highestPivot: set.slice().sort((a, b) => b.pivot[1] - a.pivot[1] || effort(a) - effort(b))[0] ?? null,
    }];
  }));
  return { L, spare, count: solutions.length, rejected, byLoad };
}

// Inclined elevator + tilting tray. The tilt pivot is fixed on the tray (along p, across q). The G3 pose is level
// with the front cube over the THROAT; the load pose is in line with the intake tunnel (axis 130). Both poses fix
// two pivot positions, so they define the elevator line. The top hard stop of the carriage is the G3 pose.
// The fixed stage-0 rail runs from 100 mm below the start carriage position to z 1040, inside the frame; every
// moving stage has that length and overlaps the next by 200 mm, which sets the number of stages.
export function rampLiftSearch(L = 762) {
  const g3Front = [throatX(L) + CUBE / 2, GOALS.G3.rim + 40 + CUBE / 2];
  const loadFront = tunnelFor(L).loadBottom;
  const results = [];
  const rejected = { direction: 0, cycle: 0, stow: 0, startSweep: 0 };
  for (let p = 250; p <= 950; p += 25) for (const q of [-214, -174, -134, 0, 60, 120, 150, 190]) {
    const top = pointOn(g3Front, 180, p, q), low = pointOn(loadFront, 130, p, q);
    const d = [top[0] - low[0], top[1] - low[1]], travel = Math.hypot(...d);
    if (d[1] <= 0) { rejected.direction++; continue; }
    const u = [d[0] / travel, d[1] / travel], beta = Math.atan2(u[0], u[1]) / deg;
    const at = s => [low[0] + u[0] * s, low[1] + u[1] * s];
    const frontFromPivot = (pivot, axis) => { const r = pointOn([0, 0], axis, p, q); return [pivot[0] - r[0], pivot[1] - r[1]]; };
    const pose = (s, axis) => trayAt(frontFromPivot(at(s), axis), axis);
    let cycle = -Infinity;
    for (let k = 0; k <= 48; k++) cycle = Math.max(cycle, inside(pose(travel * k / 48, 130 + 50 * k / 48), L));
    if (cycle > 0) { rejected.cycle++; continue; }
    // Fixed stage: along the line from z 100 (or the frame edge) up to z 1040. Moving stages have the same length and
    // overlap by 200 mm; the carriage block reaches 60 mm above the tilt pivot.
    const railTopS = (1040 - low[1]) / u[1];
    let baseS = (100 - low[1]) / u[1];
    const edge = u[0] > 0 ? (-(L / 2 - 30) - low[0]) / u[0] : u[0] < 0 ? ((L / 2 - 30) - low[0]) / u[0] : -Infinity;
    baseS = Math.max(baseS, edge);
    const stage0 = railTopS - baseS, reachPerStage = (stage0 - 200) * u[1];
    const stages = Math.max(0, Math.ceil((top[1] + 60 - 1040) / reachPerStage));
    if (Math.abs(at(railTopS)[0]) > L / 2 - 30 || reachPerStage <= 0) { rejected.stow++; continue; }
    let stow = null;
    for (let s = travel; s >= -700; s -= 10) {
      if (s < baseS + 100 || at(s)[1] + 60 > 1040) continue;
      for (let axis = 60; axis <= 180; axis += 2) {
        if (!startOk(pose(s, axis), L)) continue;
        let sweep = -Infinity;
        for (let k = 0; k <= 24; k++) sweep = Math.max(sweep, inside(pose(s * (1 - k / 24), axis + (130 - axis) * k / 24), L));
        if (sweep > 0) continue;
        const need = travel - s;
        if (!stow || need < stow.need) stow = { s, axis, need };
      }
    }
    if (!stow) { rejected.stow++; continue; }
    results.push({
      pivotOnTray: { along: p, across: q }, betaFromVertical: Math.round(beta * 10) / 10, carriageTravel: Math.round(stow.need),
      stage0Length: Math.round(stage0), movingStages: stages, pivotLoad: low.map(Math.round), pivotG3: top.map(Math.round),
      stow: { s: Math.round(stow.s), axis: stow.axis }, cycleMargin: Math.round(-cycle * 10) / 10,
    });
  }
  results.sort((a, b) => a.movingStages - b.movingStages || a.carriageTravel - b.carriageTravel);
  return { L, count: results.length, byStages: Object.fromEntries([1, 2, 3, 4].map(k => [k, results.filter(r => r.movingStages === k).length])), rejected, best: results[0] ?? null, next: results.slice(1, 5) };
}

// SF8: vertical mast + tray hinged on side-plate ears. For each axle position `along` on the tray, mastPivot fixes
// `across` (load, GOAL 2 and GOAL 3 axle positions on one vertical line). The axle must lie on the side plate, the
// mast inside the frame and the carriage at GOAL 3 under 78 in. Paths are linear in axle height and tilt: load ->
// GOAL 2 -> GOAL 3 and start -> load stay inside 78 in / 18 in / floor. A VERTICAL GOAL shot pose (35-65 deg,
// release >= 900 mm, hull 60 mm under 78 in, clear of the stowed intake) must exist. Hang-compatible solutions keep
// the start tray and the mast behind the rail line (x 60).
export function dunkMastSearch(L = 762, { loadAxis = 130 } = {}) {
  const keepout = tunnelFor(L).keepout, up = SF8.carriage.up, results = [];
  const rejected = { offPlate: 0, mast: 0, height: 0, cycle: 0, stow: 0, shot: 0 };
  const lerp = (a, b, k) => a + (b - a) * k;
  for (let along = 700; along <= 960; along += 5) {
    const m = mastPivot(L, along, loadAxis), piv = { along, across: m.across };
    const topAcross = along >= TRAY.kickerStart ? TRAY.kickerTop : TRAY.top;
    if (!(m.across >= -TRAY.kickerTop + 5 && m.across <= topAcross - 5 && along <= TRAY.length - 5)) { rejected.offPlate++; continue; }
    if (Math.abs(m.mastX) > L / 2 - 40) { rejected.mast++; continue; }
    if (m.g3 + up > LIMITS.maxHeight - 20) { rejected.height++; continue; }
    const hull = (h, axis) => { const o = pointOn([0, 0], axis, along, m.across); return dunkTrayAt([m.mastX - o[0], h - o[1]], axis, piv); };
    const path = (a, b, n = 24) => { let worst = -Infinity; for (let k = 0; k <= n; k++) worst = Math.max(worst, inside(hull(lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)), L)); return worst; };
    const load = [m.load, loadAxis], g2 = [m.g2, 180], g3 = [m.g3, 180];
    const cycle = Math.max(path(load, g2), path(g2, g3));
    if (cycle > 0) { rejected.cycle++; continue; }
    const starts = [];
    for (let h = 300; h + up <= LIMITS.startHeight - 20; h += 10) for (let axis = 60; axis <= 300; axis += 2) {
      if (!startOk(hull(h, axis), L) || path([h, axis], load) > 0) continue;
      starts.push({ h, axis, hangOk: Math.max(...hull(h, axis).map(p => p[0])) <= 60 && m.mastX + 30 <= 60 });
    }
    if (!starts.length) { rejected.stow++; continue; }
    // Least motion to the load pose, preferring a start that also works as the hang pose.
    const effort = s => Math.abs(s.axis - loadAxis) * 5 + Math.abs(m.load - s.h);
    const stow = starts.slice().sort((a, b) => (b.hangOk - a.hangOk) || effort(a) - effort(b))[0];
    let shot = null;
    for (let h = stow.h; h <= m.g3; h += 10) for (let alpha = 35; alpha <= 65; alpha += 1) {
      const axis = 180 - alpha, pts = hull(h, axis), o = pointOn([0, 0], axis, along, m.across);
      const release = pointOn([m.mastX - o[0], h - o[1]], axis, 910 + CUBE / 2, 0);
      if (release[1] < 900 || Math.max(...pts.map(p => p[1])) > LIMITS.maxHeight - 60 || Math.min(...pts.map(p => p[1])) < 150) continue;
      if (Math.max(...pts.map(p => Math.abs(p[0]))) > L / 2 + LIMITS.extension - 20 || convexOverlap(pts, keepout)) continue;
      if (!shot || release[1] > shot.release[1]) shot = { h, alpha, release: release.map(Math.round) };
    }
    if (!shot) { rejected.shot++; continue; }
    // GOAL 1 (18 in): the level tray would sit in the stowed intake, and G416 limits the robot to 48 in there.
    const g1 = hull(m.g1, 180);
    results.push({
      pivotOnTray: { along, across: Math.round(m.across * 10) / 10 }, mastX: Math.round(m.mastX * 10) / 10,
      axle: { load: Math.round(m.load), g2: Math.round(m.g2), g3: Math.round(m.g3) }, carriageTravel: Math.round(m.g3 - stow.h),
      movingStages: Math.ceil((m.g3 + up - 1040) / (980 - 200)), cycleMargin: Math.round(-cycle * 10) / 10,
      stow: { h: stow.h, axis: stow.axis }, startPoses: starts.length, hangStarts: starts.filter(s => s.hangOk).length, hangOk: stow.hangOk, shot,
      g1: { intakeOverlap: convexOverlap(g1, keepout), top: Math.round(Math.max(...g1.map(p => p[1])) + 0), trayBottom: Math.round(Math.min(...g1.map(p => p[1]))) },
    });
  }
  results.sort((a, b) => (b.hangOk - a.hangOk) || a.movingStages - b.movingStages || b.cycleMargin - a.cycleMargin);
  return { L, loadAxis, count: results.length, hangCompatible: results.filter(r => r.hangOk).length, byStages: Object.fromEntries([1, 2, 3].map(k => [k, results.filter(r => r.movingStages === k).length])), rejected, best: results[0] ?? null, next: results.slice(1, 4) };
}

// Shooting into a HORIZONTAL GOAL: for each goal and horizontal distance to the THROAT centre, the release height
// (900-1900 mm) and launch angle with the widest speed tolerance for a clean entry, in two regimes: practical
// shooters (20-70 deg) and mortar lobs (71-88 deg). Also the best lob SF8's rear kicker can make from the goal face.
export function throatShotScan() {
  const pick = (goal, D, a0, a1) => {
    let best = null;
    for (let h = 900; h <= 1900; h += 50) for (let a = a0; a <= a1; a++) {
      const r = evaluateThroatShot({ position: [goal.center[0] + D, goal.center[1], h], horizontal: [-1, 0], alpha: a * deg, goal, quick: true });
      const w = r.feasible ? r.speedBandPct[1] - r.speedBandPct[0] : -1;
      if (w >= 0 && (!best || w > best.w)) best = { h, a, w };
    }
    if (!best) return null;
    const r = evaluateThroatShot({ position: [goal.center[0] + D, goal.center[1], best.h], horizontal: [-1, 0], alpha: best.a * deg, goal });
    const r2 = v => Math.round(v * 100) / 100;
    return { release: best.h, alpha: best.a, speedBandPct: r.speedBandPct.map(r2), angleBandDeg: r.angleBandDeg.map(r2), distanceBand: r.distanceBand, lateralBand: r.lateralBand, apex: Math.round(r.apex), crossingDeg: Math.round(r.crossingDeg), speedMps: r2(r.speedMps) };
  };
  const goals = { G2: GOALS.G2near, G3: GOALS.G3 };
  const rows = [];
  for (const [key, goal] of Object.entries(goals)) for (const D of [500, 800, 1000, 1600, 2500]) rows.push({ goal: key, distance: D, practical: pick(goal, D, 20, 70), mortar: pick(goal, D, 71, 88) });
  const sf8 = {};
  for (const [key, goal] of Object.entries(goals)) {
    const cx = goal.face[0] + SF8.L / 2 + 82.55, keepout = tunnelFor(SF8.L).keepout;
    let best = null;
    for (let h = SF8.start.h; h <= SF8.g3; h += 10) for (let a = 30; a <= 88; a++) {
      const axis = 180 - a, p = sf8Pose(h, axis), pts = dunkTrayAt(p.front, axis);
      if (Math.max(...pts.map(q => q[1])) > LIMITS.maxHeight - 60 || Math.min(...pts.map(q => q[1])) < 150 || Math.max(...pts.map(q => Math.abs(q[0]))) > SF8.L / 2 + LIMITS.extension - 20 || convexOverlap(pts, keepout)) continue;
      const release = pointOn(p.front, axis, 910 + CUBE / 2, 0);
      const r = evaluateThroatShot({ position: [cx + release[0], goal.center[1], release[1]], horizontal: [-1, 0], alpha: a * deg, goal, quick: true });
      const w = r.feasible ? r.speedBandPct[1] - r.speedBandPct[0] : -1;
      if (w >= 0 && (!best || w > best.w)) best = { h, a, w, position: [cx + release[0], goal.center[1], release[1]] };
    }
    if (!best) { sf8[key] = null; continue; }
    const r = evaluateThroatShot({ position: best.position, horizontal: [-1, 0], alpha: best.a * deg, goal });
    sf8[key] = { axleHeight: best.h, alpha: best.a, distance: Math.round(r.distance), release: Math.round(best.position[2]), speedBandPct: r.speedBandPct.map(v => Math.round(v * 100) / 100), angleBandDeg: r.angleBandDeg.map(v => Math.round(v * 100) / 100), distanceBand: r.distanceBand, apex: Math.round(r.apex) };
  }
  return { entryRule: 'Clean entry: the non-rotating cube square stays inside the 279.4 mm THROAT while it crosses the rim plane.', rows, sf8FromGoalFace: sf8 };
}

// Can SF6 (inclined lift + tilt) reach the GOAL 2 THROAT? Search every carriage position and tilt for the front
// cube closest to the throat centre with its bottom 10-150 mm above the rim (a controlled drop, not a lob).
export function sf6Goal2Reach() {
  const target = throatX(SF6.L), rim = GOALS.G2near.rim;
  const levelPivot = pointOn([target + CUBE / 2, rim + 40 + CUBE / 2], 180, SF6.pivotOnTray.along, SF6.pivotOnTray.across);
  const sAtHeight = (levelPivot[1] - SF6.pivotLoad[1]) / SF6.u[1];
  const lineX = SF6.pivotLoad[0] + SF6.u[0] * sAtHeight;
  let best = null;
  for (let s = SF6.start.s; s <= SF6.travel; s += 5) for (let tilt = 150; tilt <= 210; tilt += 1) {
    const { front } = sf6Pose(s, tilt);
    const c = pointOn(front, tilt, CUBE / 2, 0);
    if (c[1] - CUBE / 2 < rim + 10 || c[1] - CUBE / 2 > rim + 150) continue;
    const offset = target - c[0];
    if (!best || Math.abs(offset) < Math.abs(best.offset)) best = { s, tilt, cube: c.map(Math.round), offset: Math.round(offset) };
  }
  return { neededPivot: levelPivot.map(Math.round), liftLineXAtThatHeight: Math.round(lineX), levelShortfall: Math.round(levelPivot[0] - lineX), bestAnyTilt: best };
}

if (process.argv[1]?.endsWith('feasibility.mjs')) {
  const { writeFileSync } = await import('node:fs');
  const debug = process.argv[2] === 'debug';
  const frames = [762, 863.6];
  const result = {
    frames: { 762: '30 x 28 in (SF1-SF4)', 863.6: '34 x 26 in' },
    heightBudget: heightBudget(), leveledArm: leveledArm(),
    rigidArm: debug ? null : frames.map(L => rigidArmSearch(L)),
    wristArm: frames.map(L => wristArmSearch(L, { spare: 30 })),
    rampLift: frames.map(L => rampLiftSearch(L)),
    singlePivot: frames.map(L => singlePivotPoles(L)),
    fourBarTray: frames.map(L => fourBarTraySearch(L)),
    dunkMast: {
      byLoadAxis: [122, 123, 124, 125, 126, 127, 128, 129, 130].map(loadAxis => { const r = dunkMastSearch(762, { loadAxis }); return { loadAxis, count: r.count, hangCompatible: r.hangCompatible, byStages: r.byStages, rejected: r.rejected }; }),
      chosen: dunkMastSearch(762, { loadAxis: SF8.loadAxis }), longFrameInLine: dunkMastSearch(863.6),
    },
    throatShots: throatShotScan(),
    sf6Goal2: sf6Goal2Reach(),
  };
  writeFileSync(new URL(debug ? 'feasibility-debug.json' : 'feasibility.json', import.meta.url), JSON.stringify(result, null, 1));
}
