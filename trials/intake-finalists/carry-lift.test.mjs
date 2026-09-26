import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { assemblyAt, buildModel, definition, evaluate, instantaneousFailures, pairBound, pickupScreen, poseAt, sweptBoundsOf } from './carry-lift.mjs';

test('eleven-pose receiver probe includes every non-jointed body but is not a motion certificate', () => {
  const failures = [];
  for (const progress of [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.45, 0.5, 0.6, 0.65]) {
    for (const failure of instantaneousFailures(assemblyAt('handoff', progress))) failures.push({ progress, ...failure });
  }
  assert.deepEqual(failures.slice(0, 24), []);
});

test('sequence keeps one coral and a constant body inventory', () => {
  const baseline = buildModel();
  for (const mount of ['front', 'left']) for (const state of definition.states) for (const progress of [0, 0.2, 0.4, 0.65, 1]) {
    const model = buildModel(state, progress, mount);
    assert.deepEqual(model.children.map(part => part.id), baseline.children.map(part => part.id));
    assert.equal(model.children.filter(part => part.role === 'gamepiece').length, 1);
  }
  assert.equal(poseAt('handoff', 0.4).keeper, 65);
  assert.equal(poseAt('handoff', 0.65).lift, 250);
  assert.equal(poseAt('handoff', 0.65).angle, -Math.PI);
});

test('phase boundaries preserve full coral position and ownership', () => {
  const transitions = [['acquire', 1, 'capture', 0], ['capture', 1, 'transfer', 0],
    ['transfer', 1, 'handoff', 0], ['transfer', 1, 'stow', 0], ['handoff', 1, 'delivered-stow', 0]];
  for (const [first, firstProgress, second, secondProgress] of transitions) {
    const before = poseAt(first, firstProgress);
    const after = poseAt(second, secondProgress);
    for (const coordinate of [0, 1]) assert.ok(Math.abs(before.coral[coordinate] - after.coral[coordinate]) < 1e-8);
    for (const axis of ['angle', 'keeper', 'closed', 'lift']) assert.ok(Math.abs(before[axis] - after[axis]) < 1e-8, axis);
  }
  for (const boundary of [0.2, 0.4, 0.65]) {
    const before = poseAt('handoff', boundary - 1e-9);
    const after = poseAt('handoff', boundary + 1e-9);
    assert.ok(Math.hypot(...before.coral.map((value, axis) => value - after.coral[axis])) < 0.00001);
  }
});

test('real shafts, finger bands, stops and lifted receiver remain present', () => {
  const assembly = assemblyAt('handoff', 0.65);
  const shafts = assembly.parts.filter(part => part.role === 'roller-shaft');
  assert.equal(shafts.length, 2);
  for (const shaft of shafts) assert.deepEqual(shaft.across, [-270, 270]);
  for (const finger of assembly.parts.filter(part => part.role === 'keeper-finger')) {
    assert.equal(Math.min(...finger.across.map(Math.abs)), 201);
  }
  assert.equal(assembly.parts.filter(part => part.role === 'receiver-stop').length, 2);
  assert.equal(assembly.parts.filter(part => part.role === 'receiver-cage').length, 4);
  assert.equal(assembly.parts.filter(part => part.role === 'receiver-mount').length, 2);
  assert.ok(Math.abs(assembly.coral.center[1] - assembly.pose.receiver[1] - 250) < 1e-8);
});

test('full finite cylinder screen does not invent two or five degree pickup success', () => {
  const screen = pickupScreen();
  assert.equal(screen.cases.length, 63);
  assert.equal(screen.guaranteedAcquisition, false);
  assert.equal(screen.allHardwareYawCertified, false);
  assert.equal(screen.slabScreenYawDegreesAtOffset5, 1.5);
  assert.ok(screen.cases.filter(item => [2, 5].includes(Math.abs(item.yawDegrees))).every(item => !item.slabScreenPass));
});

test('continuous pair bound rejects an intersample crossing even with clear sample', () => {
  const settings = definition.dimensions;
  const moving = { name: 'moving', motion: 'held', across: [-5, 5], center: [0, 100], radius: 2 };
  const stationary = { name: 'stationary', motion: 'fixed', across: [-5, 5], center: [0, 110], radius: 2 };
  const pose = { angle: 0, keeper: 0, closed: 1, lift: 0 };
  const after = { ...pose, lift: 20 };
  const bound = pairBound(moving, stationary, pose, pose, after, settings);
  assert.equal(bound.measured, 6);
  assert.ok(bound.lower < 0);
  assert.deepEqual(sweptBoundsOf(moving, pose, pose, after), [[-5, 5], [-2, 2], [98, 122]]);
});

let evaluated;
const reportOnce = () => evaluated ??= evaluate();

test('report records all mandatory failed geometry gates without claiming readiness', () => {
  const report = reportOnce();
  assert.equal(report.result, 'FAIL');
  assert.equal(report.geometryReady, false);
  assert.equal(report.inspectedPoses, 3176);
  for (const mount of ['front', 'left']) {
    for (const criterion of ['receiver.hardware', 'coral.hardware', 'contact.roller-contact', 'hardware.floor']) {
      assert.equal(report.gates.find(gate => gate.criterion === `${mount}.${criterion}`).status, 'FAIL');
    }
    const lift = report.phaseGates.filter(gate => gate.witness.mount === mount && gate.witness.phase === 'receiver-lift');
    assert.ok(lift.length > 0);
    assert.equal(lift.find(gate => gate.criterion.endsWith('receiver.hardware')).status, 'FAIL');
    assert.equal(lift.find(gate => gate.criterion.endsWith('coral.hardware')).status, 'PASS');
  }
});

test('legacy carry packet hashes remain unchanged', () => {
  const expected = {
    'carry.mjs': 'c6187fcb7f0d947bfca00535fa47a86799a3b8fc1a993c12657e64e388f07b37',
    'carry.test.mjs': 'c1df7d71e3d26bd85c66349158f6315f32eaab32f231574221f3753f658e8df5',
    'carry-report.json': '6a36429e1b84450f9c421eee926c4e4b5890c16b23e44e609db87821408e3cc7',
    'CARRY.md': 'ef9162e6a59924ccca12c20a1ad04cbb3118067d857fe9c59603e8df3298a32c',
  };
  for (const [name, hash] of Object.entries(expected)) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(name, import.meta.url))).digest('hex'), hash, name);
  }
});

test('saved report exactly reproduces the frozen evaluator', () => {
  const saved = readFileSync(new URL('carry-lift-report.json', import.meta.url), 'utf8');
  assert.equal(saved, JSON.stringify(reportOnce(), null, 2) + '\n');
});

test('complete required geometry gate', () => {
  const report = reportOnce();
  assert.equal(report.inspectedPoses, 3176);
  assert.equal(report.geometryReady, report.failures.length === 0);
  assert.deepEqual(report.failures.map(gate => ({ criterion: gate.criterion, lower: gate.lowerBoundMm,
    required: gate.requiredMm, witness: gate.witness })), []);
});

test('body dimensions and profile edge lengths remain constant across all states', () => {
  const reference = buildModel().children;
  for (const state of definition.states) for (const progress of [0, 0.116, 0.2, 0.4, 0.465, 0.65, 1]) {
    const actual = buildModel(state, progress).children;
    for (const [index, part] of actual.entries()) {
      const original = reference[index];
      assert.ok(Math.abs(part.across[1] - part.across[0] - original.across[1] + original.across[0]) < 1e-8, part.name);
      assert.equal(part.radius, original.radius, part.name);
      assert.equal(part.bore, original.bore, part.name);
      if (part.polygon) for (const [vertex, point] of part.polygon.entries()) {
        const next = part.polygon[(vertex + 1) % part.polygon.length];
        const oldPoint = original.polygon[vertex];
        const oldNext = original.polygon[(vertex + 1) % original.polygon.length];
        assert.ok(Math.abs(Math.hypot(point[0] - next[0], point[1] - next[1]) -
          Math.hypot(oldPoint[0] - oldNext[0], oldPoint[1] - oldNext[1])) < 1e-8, part.name);
      }
    }
  }
});

test('dense lift witness reproduces the collision missed by the initial sparse probe', () => {
  const failures = instantaneousFailures(assemblyAt('handoff', 0.465));
  const collision = failures.find(failure => failure.part === 'Locked full roller shaft' && failure.obstacle === 'Lower finger stem negative-x');
  assert.ok(collision);
  assert.ok(Math.abs(collision.gap + 9.35) < 1e-8);
});