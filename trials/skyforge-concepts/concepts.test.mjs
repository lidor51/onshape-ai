import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CONCEPTS } from './robots.mjs';
import { TASKS, scene, matrix } from './tasks.mjs';
import { GOALS, VG, BOARD, LIMITS, IN, insideHexagon } from './field.mjs';
import { flight, solveSpeed, collect, heightOf, extensionBeyondPerimeter } from './geometry.mjs';
import { SF5, SF6, SF7, tunnelFor, sf7Pose } from './magazine.mjs';

const gameDir = process.env.SKYFORGE_GAME_DIR ?? 'C:/Users/lidor/FRC/2026/mocked_game';
const fieldHtml = `${gameDir}/Steampunk_SKYFORGE_Field_3D.html`;
const results = matrix();
const failures = results.flatMap(row => row.tasks.filter(entry => entry.supported).flatMap(entry => entry.phases.flatMap(phase =>
  phase.checks.filter(check => check.status === 'fail').map(check => `${row.id}/${entry.task}/${phase.phase}: ${check.label}`))));

test('only the known SF2 deep-zone speed-tolerance checks fail', () => {
  const expected = ['aim', 'release'].flatMap(phase => ['L', 'R'].map(lane => `SF2/vgZone/${phase}: Speed tolerance (lane ${lane})`));
  assert.deepEqual(failures.sort(), expected.sort(), 'Unexpected failing checks');
});

test('every concept starts inside 42 in and the frame perimeter', () => {
  for (const item of CONCEPTS) {
    const built = scene(item.id, 'start', 'start');
    const height = heightOf(collect(built.root)).value;
    assert.ok(height <= LIMITS.startHeight, `${item.id} start height ${height}`);
    assert.ok(extensionBeyondPerimeter(built.root, built.root.userData.L, built.root.userData.W).value <= 1, `${item.id} overhangs at start`);
    assert.ok(2 * (built.root.userData.L + built.root.userData.W) <= LIMITS.perimeter + 1e-6, `${item.id} perimeter`);
  }
});

test('under-board concepts keep a field-tolerance margin under the 32 in board when stowed', () => {
  for (const id of ['SF1', 'SF2']) {
    const height = heightOf(collect(scene(id, 'under', 'park').root)).value;
    assert.ok(height <= BOARD.underside - 25.4, `${id} stowed ${height}`);
  }
});

test('unsupported capabilities are omitted rather than faked', () => {
  assert.throws(() => scene('SF3', 'vgZone', 'aim'), /does not support/);
  assert.throws(() => scene('SF2', 'hang', 'hang'), /does not support/);
  assert.throws(() => scene('SF1', 'g3', 'engage'), /does not support/);
  for (const [id, task] of [['SF5', 'g1'], ['SF5', 'g3'], ['SF6', 'g1'], ['SF6', 'g2'], ['SF7', 'g1'], ['SF7', 'g3'], ['SF7', 'vgFender']]) assert.throws(() => scene(id, task, 'engage'), /does not support/);
  for (const item of CONCEPTS) for (const task of item.tasks) assert.ok(TASKS[task], `${item.id} declares unknown task ${task}`);
});

test('placing concepts put the cube over the throat centre above the rim', () => {
  const cases = [['SF3', 'g1'], ['SF3', 'g2'], ['SF3', 'g3'], ['SF4', 'g1'], ['SF4', 'g2'], ['SF4', 'g3'], ['SF5', 'g2'], ['SF6', 'g3'], ['SF7', 'g2']];
  for (const [id, task] of cases) {
    const built = scene(id, task, 'engage');
    for (const label of ['Cube over THROAT', 'Cube bottom above RIM', 'No robot part inside the goal body']) {
      const check = built.checks.find(entry => entry.label.startsWith(label));
      assert.equal(check.status, 'pass', `${id} ${task} ${label}: ${check.detail}`);
    }
    const extension = extensionBeyondPerimeter(built.root, built.root.userData.L, built.root.userData.W).value;
    assert.ok(extension <= LIMITS.extension, `${id} ${task} extension ${extension}`);
  }
});

test('SF5/SF6 geometry is the one the feasibility search found', { skip: !existsSync(new URL('./feasibility.json', import.meta.url)) && 'feasibility.json not generated' }, () => {
  const feas = JSON.parse(readFileSync(new URL('./feasibility.json', import.meta.url), 'utf8'));
  const g1 = feas.heightBudget.find(row => row.goal.startsWith('GOAL 1'));
  assert.ok(g1.fourCubeTop > LIMITS.duckHeight, 'a 4-stack over GOAL 1 must break the 48 in duck height');
  assert.equal(feas.wristArm.find(row => row.L === 762).count, 0, 'no shoulder + wrist solution on the 30 in frame');
  const arm = feas.wristArm.find(row => Math.abs(row.L - SF5.L) < 0.01).byLoad['90'].leastMotion;
  assert.deepEqual([Math.round(arm.pivot[0] * 10) / 10, arm.pivot[1], arm.radius, arm.wristAlong], [SF5.pivot[0], SF5.pivot[1], SF5.arm, SF5.wristAlong]);
  assert.deepEqual([arm.shoulder.stow, arm.stowAxis], [SF5.start.shoulder, SF5.start.axis]);
  const lift = feas.rampLift.find(row => Math.abs(row.L - SF6.L) < 0.01).best;
  assert.deepEqual(lift.pivotOnTray, SF6.pivotOnTray);
  assert.deepEqual(lift.stow, SF6.start);
  assert.equal(lift.movingStages, 1);
  // SF7 is the best hang-compatible four-bar, and its linkage passes the three precision poses exactly.
  const bar = feas.fourBarTray.find(row => row.L === 762).bestHang;
  assert.deepEqual([bar.start, bar.linkA.coupler, bar.linkB.coupler], [SF7.start, ...SF7.couplers]);
  for (const [crank, target] of [[0, SF7.start], [SF7.loadCrank, SF7.load], [SF7.sweep, SF7.goal]]) {
    const pose = sf7Pose(crank);
    assert.ok(Math.hypot(pose.front[0] - target.front[0], pose.front[1] - target.front[1]) < 1 && Math.abs(pose.axis - target.axis) < 0.1, `SF7 at crank ${crank}`);
  }
  assert.equal(feas.singlePivot.every(frame => frame.trayLevel.every(row => !row.legalStartAngles) && frame.columnDrop.every(row => !row.legalStartAngles)), true, 'no single pin joint has a legal start');
  // The SF5 load pose puts the column mouth on the tunnel's cube line; the 15 mm grid tolerance only shortens the gap.
  const bottom = scene('SF5', 'floor', 'intake').root.userData.joints.bottom, target = tunnelFor(SF5.L).loadBottom;
  const d = [bottom[0] - target[0], bottom[1] - target[1]], u = [Math.cos(130 * Math.PI / 180), Math.sin(130 * Math.PI / 180)];
  assert.ok(Math.abs(d[0] * u[1] - d[1] * u[0]) <= 3 && Math.abs(d[0] * u[0] + d[1] * u[1]) <= 16, `SF5 mouth ${bottom} vs ${target}`);
});

test('SF1 barrel release anchor matches the analytic pivot geometry', () => {
  const built = scene('SF1', 'vgFender', 'aim');
  const theta = built.pose.barrel * Math.PI / 180;
  const [release] = built.root.userData.anchors.release;
  assert.ok(Math.abs(release.position[0] + 360 * Math.cos(theta)) < 0.01);
  assert.ok(Math.abs(release.position[2] - (450 + 360 * Math.sin(theta))) < 0.01);
});

test('ballistic solver hits the opening centre and the hexagon test is bounded', () => {
  const p0 = [VG.centerX, VG.planeY - 1500, 900];
  const alpha = 55 * Math.PI / 180;
  const speed = solveSpeed(p0, [0, 1], alpha);
  const t = 1500 / (speed * Math.cos(alpha));
  assert.ok(Math.abs(flight(p0, [0, 1], alpha, speed, t)[2] - VG.centerZ) < 0.5);
  assert.ok(insideHexagon(VG.centerX, VG.centerZ));
  assert.ok(!insideHexagon(VG.centerX + 15.2 * IN, VG.centerZ));
  assert.ok(!insideHexagon(VG.centerX, VG.bottom - 1));
});

test('shooter lanes release fieldward of the RELEASE LINE', () => {
  for (const row of results) for (const entry of row.tasks) if (entry.supported && entry.task.startsWith('vg')) {
    for (const phase of entry.phases.filter(item => item.phase !== 'approach')) {
      const lines = phase.checks.filter(check => check.label.startsWith('G410 cube behind'));
      assert.ok(lines.length && lines.every(check => check.status === 'pass'), `${row.id} ${entry.task}`);
    }
  }
});

test('field datums agree with the supplied 3D field mesh', { skip: !existsSync(fieldHtml) && 'supplied field HTML not found' }, () => {
  const text = readFileSync(fieldHtml, 'utf8');
  const start = text.indexOf('>', text.indexOf('id="field-data"')) + 1;
  const parts = JSON.parse(text.slice(start, text.indexOf('</script>', start))).parts;
  const bounds = name => parts.find(part => part.name === name).bounds;
  for (const [name, goal] of [['red_G1_throat', GOALS.G1], ['red_G2_near_throat', GOALS.G2near], ['blue_red_G3_throat', GOALS.G3]]) {
    const [x0, y0, , x1, y1, z1] = bounds(name);
    assert.ok(Math.abs((x0 + x1) / 2 - goal.center[0]) < 1 && Math.abs((y0 + y1) / 2 - goal.center[1]) < 1, `${name} centre`);
    assert.ok(Math.abs(z1 - goal.rim) < 1, `${name} rim ${z1}`);
    assert.ok(Math.abs((x1 - x0) - 2 * goal.throatHalf) < 14, `${name} throat width ${x1 - x0}`);
  }
  const board = bounds('red_Floating_board');
  assert.ok(Math.abs(board[2] - BOARD.underside) < 1 && Math.abs(board[5] - BOARD.top) < 1, 'board heights');
  const frame = bounds('red_blue_Vertical_goal_frame');
  assert.ok(Math.abs((frame[0] + frame[3]) / 2 - VG.centerX) < 1, 'VG centre');
});

test('built page and manifest are consistent when present', { skip: !existsSync(new URL('../../outputs/skyforge/manifest.json', import.meta.url)) && 'not built' }, () => {
  const manifest = JSON.parse(readFileSync(new URL('../../outputs/skyforge/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.checkCounts.fail, failures.length);
  assert.equal(manifest.apiCalls, 0);
  assert.deepEqual(manifest.concepts.map(item => item.id), CONCEPTS.map(item => item.id));
});
