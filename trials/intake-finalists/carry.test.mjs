import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { definition, poseAt, assemblyAt, buildModel, clearance, evaluate, rotatePoint, pickupScreen, sweptBoundsOf } from './carry.mjs';

let checkedReport;
const liveReport = () => checkedReport ??= evaluate();

test('B exports the required retained 14 / mounting 07 contract', () => {
  assert.equal(definition.id, 'B');
  assert.deepEqual(definition.ancestry, ['14', '07']);
  assert.deepEqual(definition.states, ['acquire', 'capture', 'transfer', 'handoff', 'stow']);
});

test('one coral follows the fixed carrier radius through capture and transfer', () => {
  const settings = definition.dimensions;
  const radius = Math.hypot(settings.acquireY - settings.pivotY, settings.acquireZ - settings.pivotZ);
  for (let index = 0; index <= 100; index++) {
    const pose = poseAt('transfer', index / 100);
    assert.ok(Math.abs(Math.hypot(pose.coral[0] - settings.pivotY, pose.coral[1] - settings.pivotZ) - radius) < 1e-8);
    assert.equal(pose.owner, 'carrier');
  }
  assert.deepEqual(poseAt('capture', 1).coral, poseAt('transfer', 0).coral);
  assert.deepEqual(poseAt('transfer', 1).coral, poseAt('handoff', 0).coral);
  assert.deepEqual(poseAt('transfer', 1).coral, poseAt('stow', 0).coral);
});

test('receiver closes before keeper release, and retains a stationary piece during return', () => {
  const seated = poseAt('handoff', 0);
  assert.equal(poseAt('handoff', 0.2).keeper, 0);
  assert.equal(poseAt('handoff', 0.3).owner, 'both');
  assert.equal(poseAt('handoff', 0.3).jaw, definition.dimensions.jawClosed);
  assert.equal(poseAt('handoff', 0.5).angle, seated.angle);
  assert.equal(poseAt('handoff', 0.55).owner, 'receiver');
  for (const progress of [0.3, 0.5, 0.55, 0.75, 1]) assert.deepEqual(poseAt('handoff', progress).coral, seated.coral);
  assert.equal(poseAt('handoff', 1).angle, 0);
});

test('all views have constant named physical parts and one actual hollow coral', () => {
  let expected;
  for (const mount of ['front', 'left']) for (const state of definition.states) {
    const root = buildModel(state, 1, mount);
    assert.ok(root.isGroup);
    const meshes = [];
    root.traverse(object => { if (object.isMesh) meshes.push(object); });
    const names = meshes.map(mesh => mesh.name).sort();
    expected ??= names;
    assert.deepEqual(names, expected);
    assert.equal(new Set(names).size, names.length);
    const corals = meshes.filter(mesh => mesh.userData.role === 'gamepiece');
    assert.equal(corals.length, 1);
    assert.equal(corals[0].geometry.parameters.shapes.holes.length, 1);
    assert.equal(root.userData.coralPose.length, 301.625);
    assert.equal(root.userData.coralPose.outsideDiameter, 114.3);
    assert.equal(root.userData.coralPose.bore, 101.6);
    assert.equal(root.userData.checks.physicalSuccessClaimed, false);
    for (const mesh of meshes) mesh.geometry.dispose();
  }
});

test('analytic distances use whole circular bodies and actual concave polygons', () => {
  const pipe = { across: [-150, 150], center: [-100, 150], radius: 57.15 };
  const bumper = { across: [-435, 435], polygon: [[-85, 45], [0, 45], [0, 165], [-85, 165]] };
  assert.ok(clearance(pipe, bumper) < 0);
  const concave = { across: [-5, 5], polygon: [[0, 0], [20, 0], [20, 5], [5, 5], [5, 20], [0, 20]] };
  assert.ok(clearance({ across: [-1, 1], center: [12, 12], radius: 2 }, concave) > 4.9);
});

test('starting pivot 80 dogleg exposes its floor failure instead of a snapshot pass', () => {
  const assembly = assemblyAt('stow', 1, 'front', { pivotZ: 80 });
  const plate = assembly.parts.find(part => part.role === 'carrier-cheek');
  assert.ok(Math.min(...plate.polygon.map(point => point[1])) < -40);
  const center = rotatePoint([-320, 57.15], -140 * Math.PI / 180, { pivotY: 100, pivotZ: 80 });
  assert.ok(Math.abs(center[0] - 407) < 1);
  assert.ok(Math.abs(center[1] - 368) < 1);
});

test('full-circle analytic sweep includes the worst extension between adjacent sample angles', () => {
  const settings = definition.dimensions;
  const part = { across: [-100, 100], center: [-400, 100], radius: 25, motion: 'carrier' };
  const extrema = sweptBoundsOf(part, { angle: 0, keeper: 0 }, { angle: -0.2, keeper: 0 },
    { angle: 0, keeper: 0 }, settings);
  assert.ok(Math.abs(extrema[1][0] - (100 - Math.hypot(500, 40) - 25)) < 1e-8);
});

test('yaw/offset screen uses the whole finite cylinder and never claims self-centering', () => {
  const screen = pickupScreen();
  assert.equal(screen.cases.length, 49);
  assert.equal(screen.certifiedAxialHalfRangeMm, 9.1875);
  assert.equal(screen.guaranteedAcquisition, false);
  assert.ok(screen.cases.filter(entry => entry.yawDegrees !== 0).every(entry => !entry.certifiedRigidSlotFit));
  assert.ok(screen.cases.some(entry => entry.yawDegrees === 0 && entry.axialOffsetMm === 5 && entry.certifiedRigidSlotFit));
});

test('every state preserves part lengths, drum radii and constant core body count', () => {
  const initial = assemblyAt('acquire').parts;
  assert.ok(initial.length >= 30 && initial.length + 11 < 100);
  for (const state of definition.states) for (const progress of [0, 0.25, 0.55, 0.8, 1]) {
    const current = assemblyAt(state, progress).parts;
    assert.deepEqual(current.map(part => part.name), initial.map(part => part.name));
    current.forEach((part, index) => {
      assert.equal(part.across[1] - part.across[0], initial[index].across[1] - initial[index].across[0]);
      if (!['keeper', 'jaw'].includes(part.motion)) assert.deepEqual(part.across, initial[index].across);
      assert.equal(part.radius, initial[index].radius);
      part.polygon?.forEach((point, vertex) => {
        const next = part.polygon[(vertex + 1) % part.polygon.length];
        const original = initial[index].polygon[vertex];
        const originalNext = initial[index].polygon[(vertex + 1) % part.polygon.length];
        assert.ok(Math.abs(Math.hypot(point[0] - next[0], point[1] - next[1]) -
          Math.hypot(original[0] - originalNext[0], original[1] - originalNext[1])) < 1e-7);
      });
    });
  }
});

test('keeper and receiver slides traverse their full axial paths without resizing or teleporting', () => {
  for (const [state, begin, end] of [['capture', 0, 1], ['handoff', 0, 0.3], ['handoff', 0.3, 0.55]]) {
    const start = assemblyAt(state, begin);
    const finish = assemblyAt(state, end);
    for (let index = 0; index <= 20; index++) {
      const fraction = index / 20;
      const current = assemblyAt(state, begin + (end - begin) * fraction);
      current.parts.forEach((part, partIndex) => {
        for (const edge of [0, 1]) {
          const expected = start.parts[partIndex].across[edge] * (1 - fraction) +
            finish.parts[partIndex].across[edge] * fraction;
          assert.ok(Math.abs(part.across[edge] - expected) < 1e-8, part.name);
        }
        if (part.polygon) assert.deepEqual(part.polygon, start.parts[partIndex].polygon);
        if (part.center) assert.deepEqual(part.center, start.parts[partIndex].center);
      });
    }
  }
  const released = assemblyAt('handoff', 0.55);
  for (const part of released.parts.filter(part => part.motion === 'keeper')) {
    assert.ok(Math.min(...part.across.map(Math.abs)) > released.settings.coralLength / 2);
  }
});

test('swept axial bounds include opposite slides and intermediate receiver insertion', () => {
  for (const [state, begin, end] of [['capture', 0.4, 0.6], ['handoff', 0.044, 0.048]]) {
    const middle = assemblyAt(state, (begin + end) / 2);
    const before = poseAt(state, begin);
    const after = poseAt(state, end);
    middle.parts.forEach((part, partIndex) => {
      const swept = sweptBoundsOf(part, middle.pose, before, after);
      for (let index = 0; index <= 10; index++) {
        const sample = assemblyAt(state, begin + (end - begin) * index / 10).parts[partIndex];
        assert.ok(sample.across[0] >= swept[0][0] - 1e-8, part.name);
        assert.ok(sample.across[1] <= swept[0][1] + 1e-8, part.name);
      }
    });
  }
});

test('the retained full roller shafts and receiver end stops are not collision exclusions', () => {
  const assembly = assemblyAt('handoff', 0.3);
  const shafts = assembly.parts.filter(part => ['driven-shaft', 'locked-shaft'].includes(part.role));
  assert.equal(shafts.length, 2);
  for (const shaft of shafts) {
    assert.deepEqual(shaft.across, [-270, 270]);
    assert.equal(shaft.radius, 6.35);
    assert.ok(assembly.canonical.connections.filter(pair => pair.includes(shaft.name))
      .every(pair => pair.every(name => !name.startsWith('Receiver'))));
  }
  assert.equal(assembly.parts.filter(part => part.role === 'receiver-axial-stop').length, 2);
  assert.equal(assembly.parts.filter(part => part.role === 'receiver-cage').length, 2);
  const report = liveReport();
  assert.ok(report.retention.keeperToLockedRollerGapUpperBoundMm < report.retention.coralDiameterMm);
  assert.ok(report.retention.lowerOpeningChordUpperBoundMm < report.retention.coralDiameterMm);
  assert.ok(report.retention.receiverClosedVerticalOpeningUpperBoundMm < report.retention.coralDiameterMm);
});

test('the first remaining closing collision is retained as an actual sampled overlap', () => {
  for (const mount of ['front', 'left']) {
    for (const progress of [0.046, 0.048]) {
      const { parts } = assemblyAt('handoff', progress, mount);
      const cheek = parts.find(part => part.name === 'Dogleg ribbon cheek negative-x');
      const cage = parts.find(part => part.name === 'Receiver axial cage negative-x');
      assert.equal(clearance(cheek, cage), -0.001);
    }
    const phase = liveReport().phaseGates.find(gate => gate.criterion === `${mount}.receiver.hardware` &&
      gate.witness.phase === 'handoff:0-0.3');
    assert.equal(phase.status, 'FAIL');
    assert.equal(phase.evidence, 'sampled overlap');
    assert.equal(phase.sampledMarginMm, -0.001);
  }
});

test('every motion phase includes stationary hardware and the same connected body inventory', () => {
  const report = liveReport();
  const phases = ['capture:0-1', 'transfer:0-1', 'handoff:0-0.3', 'handoff:0.3-0.55', 'handoff:0.55-1', 'stow:0-1'];
  for (const mount of ['front', 'left']) for (const phase of phases) {
    for (const criterion of ['hardware.floor', 'hardware.extension', 'carrier.hardware', 'receiver.hardware', 'coral.hardware']) {
      assert.ok(report.phaseGates.some(gate => gate.criterion === `${mount}.${criterion}` && gate.witness.phase === phase),
        `${mount}.${criterion}.${phase}`);
    }
  }
  for (const state of definition.states) for (const progress of [0, 0.15, 0.3, 0.55, 0.8, 1]) {
    const assembly = assemblyAt(state, progress);
    const parts = new Map(assembly.parts.map(part => [part.name, part]));
    const reached = new Set(assembly.parts.filter(part => ['mount-structure', 'receiver-mount'].includes(part.role))
      .map(part => part.name));
    for (let pass = 0; pass < parts.size; pass++) {
      for (const [first, second] of assembly.canonical.connections) {
        if (clearance(parts.get(first), parts.get(second)) > 0.25) continue;
        if (reached.has(first)) reached.add(second);
        if (reached.has(second)) reached.add(first);
      }
    }
    assert.equal(reached.size, parts.size, `${state} ${progress} has disconnected hardware`);
  }
});

test('live continuous gate reports failures honestly and checks front plus left mounting', () => {
  const report = liveReport();
  assert.ok(report.inspectedPoses > 1000);
  assert.ok(report.rotationSamplesEach >= 71);
  assert.ok(report.gates.some(gate => gate.criterion.startsWith('left.')));
  assert.ok(report.gates.some(gate => gate.criterion.includes('receiver.hardware')));
  assert.equal(report.inspectedPoses, 2052);
  assert.ok(report.phaseGates.filter(gate => gate.sampledMarginMm < 0).every(gate => gate.status === 'FAIL' ||
    gate.sampledMarginMm >= -1e-8), 'Actual intersections cannot be promoted to passing geometry');
  assert.ok(report.phaseGates.some(gate => gate.witness.phase === 'handoff:0.55-1'));
  assert.ok(report.gates.filter(gate => gate.criterion.includes('.contact.')).every(gate => gate.status === 'PASS'));
  assert.equal(report.geometryReady, report.failures.length === 0);
  assert.equal(report.result, report.failures.length ? 'FAIL' : 'PASS');
  for (const gate of report.gates) {
    assert.ok(Number.isFinite(gate.sampledMarginMm));
    assert.ok(Number.isFinite(gate.lowerBoundMm));
    assert.ok(gate.lowerBoundMm <= gate.sampledMarginMm + 1e-8);
  }
  console.log(JSON.stringify({ result: report.result, bodyMeshes: report.assemblyBodyMeshes,
    failures: report.failures.map(gate => ({ name: gate.criterion, margin: gate.lowerBoundMm, witness: gate.witness })) }));
});

const reportPath = new URL('./carry-report.json', import.meta.url);
test('persisted packet exactly matches the live analytic evaluator', { skip: !existsSync(reportPath) }, () => {
  assert.deepEqual(JSON.parse(readFileSync(reportPath, 'utf8')), JSON.parse(JSON.stringify(liveReport())));
});