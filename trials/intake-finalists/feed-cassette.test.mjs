import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {readFileSync, existsSync} from 'node:fs';
import {definition, dimensions, topologyProbe, tangentLoop, lowerDrums, workingBelts, beltSectionPoint,
  indexerScreen, lowerPath, poseAt, bodiesAt, hardwareGap, flatContact, buildModel, evaluate, controlAt, foldBounds, escapeScreen} from './feed-cassette.mjs';
import {bodyBounds} from './feed.mjs';

const close = (first, second, tolerance = 1e-6) => assert.ok(Math.abs(first - second) <= tolerance, `${first} versus ${second}`);
const distance = (first, second) => Math.hypot(...first.map((value, axis) => value - second[axis]));
let cachedReport;
const report = () => cachedReport ??= evaluate();
const legacy = {
  'feed.mjs': 'D48C8B7C043A97A5A82563440BCBF808DF7322C8D2CAF53A8CC88FA4360DD13E',
  'feed.test.mjs': '946B0E695C5E35A93496A9755742342FF1846C9C1F1A047BE16307990CAFA7AF',
  'FEED.md': 'D674ED1CE7063D09B99CFE6BD11B2C8B66088D0719F894E8C52B38EBDB426501',
  'feed-report.json': 'C0E0ECC6BBF77EDB2FA4E17C4FF42B6BEC3283B48F93406CBCEB22E959C9B010',
};

test('protected legacy feed artifacts remain byte-identical', () => {
  for (const [name, expected] of Object.entries(legacy)) assert.equal(createHash('sha256').update(readFileSync(new URL(name, import.meta.url))).digest('hex').toUpperCase(), expected, name);
});

test('supported return uses exact tangent joins and a real reverse-bend drum', () => {
  assert.equal(lowerDrums().find(drum => drum.id === 'return-idler').side, -1);
  for (const body of workingBelts()) for (let index = 0; index < body.sections.length; index++) {
    assert.ok(distance(beltSectionPoint(body.sections[index], 1), beltSectionPoint(body.sections[(index + 1) % body.sections.length], 0)) < 1e-8);
  }
  assert.throws(() => tangentLoop([{id: 'first', center: [0, 0], radius: 25, side: 1}, {id: 'second', center: [10, 0], radius: 25, side: -1}]));
  const probe = topologyProbe(); close(probe.returnBumperGap, 8); assert.ok(probe.extensionReserve >= 5);
});

test('fixed indexer meets actual reserve and TOTAL compression thresholds', () => {
  const result = indexerScreen(); assert.equal(result.cases, 819); assert.equal(result.passing, 819);
  assert.ok(result.reserve >= 0.5); assert.ok(result.totalIndent <= 3 + 1e-8);
  const pose = {center: [10, 205, 284.65], yaw: 0};
  close(flatContact(pose, [-74, -0.5], 229), 55.65 - Math.sqrt(57.15 ** 2 - 10.5 ** 2));
});

test('state boundaries preserve the full piece and every actual actuator coordinate', () => {
  for (let index = 0; index < definition.states.length - 1; index++) {
    const first = poseAt(definition.states[index], 1), second = poseAt(definition.states[index + 1], 0);
    close(distance(first.center, second.center), 0);
    for (const coordinate of ['yaw', 'fold', 'jaw', 'cellFront', 'cellBack', 'withdraw', 'lift']) close(first[coordinate], second[coordinate]);
  }
  for (const boundary of [0.2, 0.65, 0.8]) assert.ok(distance(lowerPath(boundary - 1e-9), lowerPath(boundary + 1e-9)) < 1e-5);
  assert.throws(() => poseAt('invented')); assert.throws(() => poseAt('acquire', NaN));
});

test('drums are individual bodies, holes are real, and lengths never morph', () => {
  const initial = bodiesAt('acquire', 0);
  assert.equal(new Set(initial.map(body => body.id)).size, initial.length);
  assert.equal(initial.filter(body => body.role === 'drum').length, 26);
  for (const state of definition.states) for (const progress of [0, 0.5, 1]) {
    const bodies = bodiesAt(state, progress); assert.deepEqual(bodies.map(body => body.id), initial.map(body => body.id));
    bodies.forEach((body, index) => {
      const original = initial[index]; close(body.span[1] - body.span[0], original.span[1] - original.span[0]);
      if (body.kind === 'circle') close(body.radius, original.radius);
      if (body.kind === 'prism') body.outline.forEach((point, vertex) => close(distance(point, body.outline[(vertex + 1) % body.outline.length]), distance(original.outline[vertex], original.outline[(vertex + 1) % original.outline.length])));
      if (body.kind === 'belt') body.sections.forEach((section, sectionIndex) => {
        const before = original.sections[sectionIndex];
        if (section.kind === 'arc') {close(section.radius, before.radius); close(section.endAngle - section.startAngle, before.endAngle - before.startAngle);}
        else close(distance(section.start, section.end), distance(before.start, before.end));
      });
    });
  }
  const shaft = initial.find(body => body.id === 'nose-lower-0-front-shaft');
  const bearing = initial.find(body => body.id === 'nose-lower-0-front-bearing-0'); close(hardwareGap(shaft, bearing), 0.5);
});

test('receiver waits for end grip, withdraws before lifting and returns above the fixed belts', () => {
  const gripped = poseAt('handoff', 0.55), withdrawn = poseAt('handoff', 0.7), raised = poseAt('handoff', 0.85);
  close(gripped.jaw, 1); close(gripped.withdraw, 0); close(withdrawn.withdraw, 145); close(withdrawn.lift, 0);
  assert.ok(withdrawn.center[1] - dimensions.coralLength / 2 >= 433 + 5);
  close(raised.lift, 180); close(raised.withdraw, 145);
  assert.ok(poseAt('handoff', 1).center[2] - 57.15 > 376.3 + 5);
  const absent = controlAt({receiver: 'absent', occupied: true}); assert.deepEqual(absent.drives, [0, 0, 0]); assert.ok(absent.frontClosed && absent.backClosed);
});

test('analytic complete-circle fold envelope contains denser actual hardware samples', () => {
  const initial = bodiesAt('stow', 0);
  for (let index = 0; index <= 120; index++) {
    const current = bodiesAt('stow', index / 120);
    initial.forEach((body, bodyIndex) => {
      if (body.assembly !== 'nose') return;
      const bound = foldBounds(body), sample = bodyBounds(current[bodyIndex]);
      for (const axis of [0, 1, 2]) {assert.ok(sample.minimum[axis] >= bound.minimum[axis] - 1e-6); assert.ok(sample.maximum[axis] <= bound.maximum[axis] + 1e-6);}
    });
  }
});

test('parent API renders one piece and all physical bodies with finite front/left transforms', () => {
  for (const mount of ['front', 'left']) for (const state of definition.states) {
    const model = buildModel(state, 1, mount); let pieces = 0, counted = 0;
    model.traverse(object => {
      if (object.name === 'full nominal coral') pieces++;
      if (object.userData.physicalBody && object.userData.assembly !== 'robot') counted++;
      if (object.isMesh) {assert.ok(object.geometry.getAttribute('position').array.every(Number.isFinite)); assert.ok(object.matrixWorld.elements.every(Number.isFinite)); object.geometry.dispose();}
    });
    assert.equal(pieces, 1); assert.equal(counted, model.userData.physicalBodyCount); assert.equal(model.userData.geometryReady, false);
  }
});

test('receiver-absent cell blocks planar escape with an open-back positive control', () => {
  for (const yaw of [0, 30, 60, 90]) assert.equal(escapeScreen(yaw).escaped, false);
  assert.equal(escapeScreen(0, true).escaped, true);
});

test('upper nose belt turns have individually counted support drums', () => {
  for (const body of workingBelts().filter(body => body.id.startsWith('nose-upper'))) {
    assert.equal(body.drums.length, 2);
    for (const section of body.sections.filter(section => section.kind === 'arc')) assert.ok(body.drums.some(drum => drum.id === section.drum));
  }
});

test('complete stowed hardware fits front and left starting packages', () => {
  for (const body of bodiesAt('stow', 1)) {
    const bounds = bodyBounds(body);
    assert.ok(bounds.minimum[0] >= -345 && bounds.maximum[0] <= 345, body.id);
    assert.ok(bounds.minimum[1] >= 5 && bounds.maximum[1] <= 695, body.id);
  }
});

test('frozen report matches measured numeric thresholds, independently of acceptance', {skip: !existsSync(new URL('feed-cassette-report.json', import.meta.url))}, () => {
  const path = new URL('feed-cassette-report.json', import.meta.url);
  const frozen = JSON.parse(readFileSync(path, 'utf8'));
  const current = JSON.parse(JSON.stringify(report()));
  assert.equal(current.status, frozen.result.status);
  assert.deepEqual(current.gates, frozen.result.gates);
  assert.deepEqual(current.indexer, frozen.result.indexer);
  assert.deepEqual(current.contact, frozen.result.contact);
  assert.deepEqual(current.topology, frozen.result.topology);
  assert.deepEqual(current.retention, frozen.result.retention);
  assert.deepEqual(current.entry.map(row => [row.yaw, row.floorOnlyStatus, ...row.offsets.map(offset =>
    [offset.across, offset.totalIndent, offset.minimumRigid, offset.poweredTop])]), frozen.result.entry);
  assert.deepEqual(Object.entries(current.verification.family).map(([name, record]) => [name, record.pairs, record.value]), frozen.result.verification.families);
  assert.deepEqual(current.verification.mounted, frozen.result.verification.mounted);
  assert.equal(current.verification.pairsChecked, frozen.result.verification.pairsChecked);
  for (const key of ['extension', 'stowInset', 'stowHeight', 'floor']) assert.equal(current.clearance[key], frozen.result.metrics[key]);
  for (const key of ['bodies', 'beltLoops', 'drums', 'shafts', 'bearingsWithExplicitHoles', 'countsByRole']) assert.deepEqual(current.inventory[key], frozen.result.inventory[key]);
  for (const result of frozen.result.gates) assert.equal(result.status, result.value !== null && result.value >= result.minimum - 1e-6 ? 'PASS' : 'FAIL');
});

test('REQUIRED GEOMETRY ACCEPTANCE: all thresholds must actually pass', () => {
  const result = report();
  console.log(JSON.stringify({cassetteStatus: result.status, passing: result.passing, failing: result.failing,
    extensionReserve: 457.2 - result.clearance.extension, stowInset: result.clearance.stowInset, indexReserve: result.indexer.reserve,
    contact: result.contact, bodies: result.inventory.bodies, drums: result.inventory.drums}));
  assert.equal(result.status, 'PASS', JSON.stringify(result.gates.filter(gate => gate.status !== 'PASS').map(({name, value, minimum, witness}) => ({name, value, minimum, witness})), null, 2));
});