import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import * as THREE from '../whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {placePoint} from './mounts.mjs';
import {definition, dimensions, pickup, footprint, rollerGap, bankRollers, contacts, poseAt,
  bodiesAt, bodyGap, bodyBounds, foldBounds, coralBoxGap, coralBodyGap, robotInMount, buildModel, evaluate,
  beltDesign, beltRoute, beltPath, finiteTubePointGap, beltClosestGap, beltSectionPoint, workingBelts,
  cylinderExtents, cellWorkspace, escapeScreen, controlAt} from './feed.mjs';

const report = evaluate();
const close = (actual, expected, tolerance = 1e-5) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const vectorClose = (actual, expected) => actual.forEach((value, axis) => close(value, expected[axis]));
const length = (first, second) => Math.hypot(...first.map((value, axis) => value - second[axis]));
const byId = (bodies, id) => bodies.find(body => body.id === id);

test('belt local probe: tangent arc joins and finite-cylinder working-surface distance', () => {
  for (const boundary of [0.25, 0.65, 0.8]) assert.ok(length(beltPath(boundary - 1e-8), beltPath(boundary + 1e-8)) < 0.0001);
  close(beltPath(0)[1], 57.15);
  assert.ok(beltPath(0)[0] < -500);
  const body = {span: [-170, -6], thickness: 3, sections: [{kind: 'line', start: [30, 224], end: [310, 224]}]};
  close(beltClosestGap({center: [0, 142, 281.15], yaw: 90}, body), -1.5);
  close(finiteTubePointGap({center: [0, 0, 0], yaw: 0}, [0, 200, 0]), 49.1875);
  close(beltDesign.gap, dimensions.coralDiameter - dimensions.compression);
  close(beltRoute().reach, 83.65);
});

test('viewer contract declares the ancestry, failed status, nominal piece and fixed receiver', () => {
  assert.equal(definition.id, 'A');
  assert.deepEqual(definition.ancestry, ['01', '09']);
  assert.deepEqual(definition.states, ['acquire', 'capture', 'transfer', 'handoff', 'stow']);
  assert.equal(dimensions.coralLength, 301.625);
  assert.equal(dimensions.coralDiameter, 114.3);
  assert.deepEqual(dimensions.receiver, [0, 430, 281.15]);
  assert.ok(buildModel() instanceof THREE.Group);
  assert.throws(() => buildModel('invented'));
  assert.throws(() => buildModel('acquire', -0.01));
  assert.throws(() => buildModel('acquire', NaN));
  assert.throws(() => buildModel('acquire', 1, 'rotated-cartoon'));
});

test('finite parallel-cylinder contact agrees with the exact section-circle solution', () => {
  for (const rearward of [-120, 0, 100]) for (const up of [60, 150]) {
    const pose = {center: [0, rearward, up], yaw: 90};
    const roll = {span: [-250, 250], y: 0, z: 0, radius: 60};
    close(rollerGap(pose, roll), Math.max(0, Math.hypot(rearward, up) - 57.15) - 60);
  }
  assert.equal(rollerGap({center: [0, 0, 150], yaw: 90}, {span: [160, 200], y: 0, z: 0, radius: 60}), Infinity);
});

test('lengthwise floor interference cannot be hidden by the coral center or unlimited compression', () => {
  const pose = {center: [0, -480, 57.15], yaw: 0};
  close(rollerGap(pose, {span: [-250, 250], y: -380, z: 122, radius: 60}), -52.3);
  assert.equal(report.firstFailedResult.floorEntry.lengthwiseInterferenceMm, 52.3);
  const rejected = report.contact.entry.entryYawScreen.find(entry => entry.yaw === 0);
  close(rejected.shaftGap, -6.35);
  assert.equal(rejected.floorEnvelopeClear, false);
  assert.equal(rejected.pulleyGap, null);
  const roll = {span: [-250, 250], y: 0, z: 0, radius: 25};
  close(rollerGap({center: [0, 300, 150], yaw: 0}, roll), Math.hypot(300 - 301.625 / 2, 150 - 57.15) - 25);
});

test('yaw contact agrees with an independent sampled finite-cylinder surface oracle', () => {
  const roll = bankRollers().find(roll => roll.bank === 0 && roll.y === 142);
  for (const yaw of [25, 50, 85]) {
    const pose = {center: [10, 154, 281.15], yaw};
    const angle = yaw * Math.PI / 180;
    let sampledGap = Infinity;
    for (let alongIndex = 0; alongIndex <= 400; alongIndex++) {
      const along = -301.625 / 2 + 301.625 * alongIndex / 400;
      for (let radialIndex = 0; radialIndex < 720; radialIndex++) {
        const radialAngle = radialIndex * Math.PI / 360;
        const transverse = 57.15 * Math.cos(radialAngle), up = 57.15 * Math.sin(radialAngle);
        const across = pose.center[0] + along * Math.sin(angle) + transverse * Math.cos(angle);
        if (across < roll.span[0] || across > roll.span[1]) continue;
        const rearward = pose.center[1] + along * Math.cos(angle) - transverse * Math.sin(angle);
        sampledGap = Math.min(sampledGap, Math.hypot(rearward - roll.y, pose.center[2] + up - roll.z) - roll.radius);
      }
    }
    const exactGap = rollerGap(pose, roll);
    assert.ok(sampledGap >= exactGap - 1e-5);
    assert.ok(sampledGap - exactGap < 0.3, `Surface oracle mismatch at yaw ${yaw}`);
  }
});

test('bumper check uses the complete finite cylinder before its center reaches the bumper', () => {
  const bumper = bodyBounds(byId(bodiesAt(), 'bumper-front'));
  const pose = {center: [0, -230, 100], yaw: 0};
  assert.ok(pose.center[1] < bumper.minimum[1]);
  close(coralBoxGap(pose, bumper), -112.15);
  close(coralBoxGap({...pose, center: [0, -230, 250]}, bumper), 27.85);
  assert.equal(coralBoxGap({...pose, center: [0, -236, 100]}, bumper), Infinity);
  const firstOverlap = -85 - dimensions.coralLength / 2;
  close(firstOverlap, -235.8125);
  assert.ok(beltPath(0.65)[1] >= 165 + 57.15 + 5);
  close(Math.max(...footprint({center: [0, 0, 0], yaw: 0}).map(point => point[1])), 301.625 / 2);
});

test('actual circle/polygon sections do not confuse corner AABB overlap with collision', () => {
  const wheel = {kind: 'circle', span: [-10, 10], center: [0, 0], radius: 60};
  const plate = {kind: 'prism', span: [-5, 5], outline: [[50, 50], [70, 50], [70, 70], [50, 70]]};
  close(bodyGap(wheel, plate), Math.hypot(50, 50) - 60);
  const separate = {...wheel, span: [20, 30]};
  close(bodyGap(wheel, separate), 10);
});

test('all state boundaries preserve one continuous coral pose and actual actuator coordinates', () => {
  for (let index = 0; index < definition.states.length - 1; index++) {
    const end = poseAt(definition.states[index], 1), start = poseAt(definition.states[index + 1], 0);
    vectorClose(end.center, start.center);
    for (const coordinate of ['yaw', 'pitch', 'fold', 'jaw', 'gate', 'cellFront', 'cellBack']) close(end[coordinate], start[coordinate]);
  }
  for (let index = 0; index <= 120; index++) {
    const pose = poseAt('acquire', index / 120);
    close(beltClosestGap(pose, workingBelts()[0]), -1.5);
    assert.equal(pose.commandedOnly, true);
  }
});

test('every body retains its dimensions through every task and the indexer never resets', () => {
  const original = bodiesAt('acquire', 0);
  for (const state of definition.states) for (let index = 0; index <= 24; index++) {
    const bodies = bodiesAt(state, index / 24);
    assert.deepEqual(bodies.map(body => body.id), original.map(body => body.id));
    for (const body of bodies) {
      const before = byId(original, body.id);
      close(body.span[1] - body.span[0], before.span[1] - before.span[0]);
      if (body.kind === 'belt') {
        close(body.thickness, before.thickness);
        body.sections.forEach((section, sectionIndex) => {
          const originalSection = before.sections[sectionIndex];
          if (section.kind === 'arc') {close(section.radius, originalSection.radius); close(section.endAngle - section.startAngle, originalSection.endAngle - originalSection.startAngle);}
          else close(length(section.start, section.end), length(originalSection.start, originalSection.end));
        });
      } else if (body.kind === 'circle') close(body.radius, before.radius);
      else body.outline.forEach((point, pointIndex) => close(length(point, body.outline[(pointIndex + 1) % body.outline.length]),
        length(before.outline[pointIndex], before.outline[(pointIndex + 1) % before.outline.length])));
      if (body.assembly === 'fixed' || body.assembly === 'robot') assert.deepEqual(body, before);
    }
  }
});

test('analytic fold bounds contain a denser 0.1875-degree rigid sweep', () => {
  const initial = bodiesAt('stow', 0).filter(body => body.assembly === 'nose');
  for (let index = 0; index <= 720; index++) {
    const current = bodiesAt('stow', index / 720);
    for (const body of initial) {
      const analytic = foldBounds(body), sampled = bodyBounds(byId(current, body.id));
      for (const axis of [0, 1, 2]) {
        assert.ok(sampled.minimum[axis] >= analytic.minimum[axis] - 1e-7);
        assert.ok(sampled.maximum[axis] <= analytic.maximum[axis] + 1e-7);
      }
    }
  }
});

test('receiver jaws accept before the stop closes; reverse release opens before translation', () => {
  vectorClose(poseAt('handoff', 0.75).center, dimensions.receiver);
  assert.equal(poseAt('handoff', 0.75).jaw, 0);
  assert.equal(poseAt('handoff', 0.9).gate, 0);
  close(poseAt('handoff', 0.9).jaw, 1);
  for (let index = 0; index <= 120; index++) {
    const progress = index / 120, pose = poseAt('handoff', progress), bodies = bodiesAt('handoff', progress);
    assert.ok(coralBodyGap(pose, byId(bodies, 'receiver-front-gate')) >= 5 - 1e-7);
    if (progress >= 0.75) vectorClose(pose.center, dimensions.receiver);
    if (progress < 0.75) { assert.equal(pose.jaw, 0); assert.equal(pose.gate, 0); }
    vectorClose(poseAt('stow', progress).center, dimensions.receiver);
    assert.equal(poseAt('stow', progress).jaw, 1);
  }
});

test('front/left models contain one full-size coral and the actual finite belt meshes', () => {
  for (const mount of ['front', 'left']) for (const state of definition.states) for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    const model = buildModel(state, progress, mount);
    let meshes = 0, pieces = 0;
    model.traverse(object => {
      if (!object.isMesh) return;
      meshes++;
      const vertices = object.geometry.getAttribute('position').array;
      assert.ok(vertices.every(Number.isFinite));
      assert.ok(object.matrixWorld.elements.every(Number.isFinite));
      if (object.name.startsWith('nominal full coral')) {
        pieces++;
        vectorClose(object.getWorldPosition(new THREE.Vector3()).toArray(), placePoint(poseAt(state, progress).center, mount));
        close(object.geometry.parameters.height, 301.625);
        close(object.geometry.parameters.radiusTop, 57.15);
      }
    });
    assert.equal(meshes, 111); assert.equal(pieces, 1);
    for (const body of workingBelts()) assert.ok(model.getObjectByName(body.id));
    assert.equal(model.userData.geometryReady, false);
    const bounds = new THREE.Box3().setFromObject(model.getObjectByName('bumper-front'));
    close(bounds.min.y, -85); close(bounds.max.z, 165);
    model.traverse(object => object.geometry?.dispose());
  }
});

test('left packaging uses the real chassis ring and retained piece is inside both stow footprints', () => {
  const left = robotInMount('left');
  const inwardBumper = bodyBounds(byId(left, 'bumper-side-1'));
  close(inwardBumper.minimum[1], 700); close(inwardBumper.maximum[1], 785);
  for (const mount of ['front', 'left']) for (const body of bodiesAt('stow', 1).filter(body => body.assembly !== 'robot')) {
    const bounds = bodyBounds(body);
    for (const point of [bounds.minimum, bounds.maximum].map(point => placePoint(point, mount))) {
      assert.ok(point[0] >= -350 - 1e-7 && point[0] <= 350 + 1e-7);
      assert.ok(point[1] >= 0 - 1e-7 && point[1] <= 760 + 1e-7);
    }
  }
  const pose = poseAt('stow', 1);
  for (const mount of ['front', 'left']) for (const point of footprint(pose)) {
    const placed = placePoint([...point, pose.center[2]], mount);
    assert.ok(Math.abs(placed[0]) < 345 && placed[1] > 5 && placed[1] < 755);
  }
});

test('full shafts, non-overlapping segments and mounted guide supports retain measured gaps', () => {
  const bodies = bodiesAt();
  for (const roll of pickup) {
    if (roll.id === 'tail') for (const [index, span] of beltDesign.noseSpan.entries()) assert.deepEqual(byId(bodies, `tail-shaft-${index}`).span, span);
    else assert.deepEqual(byId(bodies, `${roll.id}-shaft`).span, [-276, 276]);
    assert.deepEqual(byId(bodies, `${roll.id}-pulley-0`).span, beltDesign.noseSpan[0]);
    assert.deepEqual(byId(bodies, `${roll.id}-pulley-1`).span, beltDesign.noseSpan[1]);
  }
  for (const support of bodies.filter(body => body.assembly === 'nose' && body.role === 'support')) {
    for (const wheel of bodies.filter(body => body.role === 'powered')) assert.ok(bodyGap(support, wheel) >= 5 - 1e-7);
  }
  assert.ok(report.clearances.wholeShaftToGuide >= 5);
  assert.ok(report.clearances.coralToShaft >= 5);
  assert.ok(report.clearances.loadedFold >= 5);
});

test('separate offset, yaw, compression and two-bank reserve gates prevent a false pass', () => {
  assert.equal(report.contact.narrowBanks.passing, 819);
  assert.equal(report.contact.narrowBanks.minimumBanks, 2);
  close(report.contact.narrowBanks.preloadMargin, 0.116231);
  assert.ok(report.contact.narrowBanks.preloadMargin < 0.5);
  assert.ok(report.contact.wideBanks.passing < report.contact.wideBanks.cases);
  assert.ok(report.contact.wideBanks.preloadMargin < 0);
  const pose = {center: [30, 190, 281.15], yaw: 0};
  const firstBank = contacts(pose, workingBelts().filter(body => body.assembly === 'fixed')).filter(contact => contact.bank === 0);
  assert.ok(firstBank.every(contact => contact.gap > 0));
  assert.equal(report.contact.entry.entryClearCases, 3);
  assert.equal(report.contact.entry.entryCases, 3);
  const dead = report.gates.find(check => check.name === 'continuous-two-powered-stations');
  assert.equal(dead.zeroDrivePoses, 0);
  assert.equal(dead.firstDeadSpot, null);
  assert.equal(report.contact.entry.validEndToEndEnvelope, null);
});

test('closed-form belt intervals cover the bridge without pretending the support wheels fill gaps', () => {
  const intervals = report.contact.contactIntervals;
  close(intervals.bankPitchDeadLength, 0);
  close(intervals.noseToBankContactOverlap, 1.824519);
  close(intervals.bridgeMidpointReserve, 0.165751);
  close(intervals.opposedGap, 111.3);
  for (let rearward = 0; rearward <= 30; rearward += 0.25) for (const across of [-10, 0, 10]) {
    const usable = contacts({center: [across, rearward, 281.15], yaw: 90}).filter(contact => contact.gap <= 0 && contact.gap >= -3 - 1e-6);
    assert.equal(new Set(usable.map(contact => contact.bank)).size, 2);
  }
  assert.ok(intervals.lengthwiseDualBankOffsetLimit < 15);
  assert.ok(intervals.lengthwiseReserveOffsetLimit < 10);
});

test('belt loops are closed and tangent transport is analytic at every route join', () => {
  for (const body of workingBelts()) body.sections.forEach((section, index) => {
    vectorClose(beltSectionPoint(section, 1), beltSectionPoint(body.sections[(index + 1) % body.sections.length], 0));
  });
  for (const boundary of [0.25, 0.65, 0.8]) {
    const before = beltPath(boundary - 1e-6), at = beltPath(boundary), after = beltPath(boundary + 1e-6);
    const incoming = at.map((value, axis) => value - before[axis]), outgoing = after.map((value, axis) => value - at[axis]);
    const cosine = incoming.reduce((sum, value, axis) => sum + value * outgoing[axis], 0) / (Math.hypot(...incoming) * Math.hypot(...outgoing));
    assert.ok(cosine > 0.99999);
  }
  const pose = poseAt('acquire', 0);
  assert.ok(contacts(pose).filter(contact => contact.id.includes('upper')).every(contact => contact.gap > 0));
  assert.equal(report.gates.find(check => check.name === 'continuous-top-bottom-opposition').status, 'FAIL');
});

test('finite 3D cylinder extents contain a separate yaw/pitch surface oracle for cage fit', () => {
  for (const yaw of [0, 31, 64, 90]) for (const pitch of [-0.25, 0.25]) {
    const pose = {center: [...dimensions.orientCenter], yaw, pitch}, extent = cylinderExtents(pose);
    const yawAngle = yaw * Math.PI / 180, pitchAngle = pitch * Math.PI / 180;
    const axial = [Math.sin(yawAngle) * Math.cos(pitchAngle), Math.cos(yawAngle) * Math.cos(pitchAngle), Math.sin(pitchAngle)];
    const lateral = [Math.cos(yawAngle), -Math.sin(yawAngle), 0];
    const vertical = [-Math.sin(yawAngle) * Math.sin(pitchAngle), -Math.cos(yawAngle) * Math.sin(pitchAngle), Math.cos(pitchAngle)];
    for (const along of [-150.8125, 0, 150.8125]) for (let degree = 0; degree < 360; degree++) {
      const angle = degree * Math.PI / 180;
      const point = pose.center.map((value, axis) => value + along * axial[axis] + 57.15 * (Math.cos(angle) * lateral[axis] + Math.sin(angle) * vertical[axis]));
      close(finiteTubePointGap(pose, point), 0);
      point.forEach((value, axis) => assert.ok(Math.abs(value - pose.center[axis]) <= extent[axis] + 1e-7));
    }
    const margins = cellWorkspace(pose);
    assert.ok(margins.slice(0, 2).flat().every(value => value >= 5));
    assert.ok(margins[2][0] >= -3);
  }
});

test('three gate conditions block feed and yaw when absent or waiting but retain the existing piece', () => {
  for (const receiver of ['absent', 'waiting']) for (const yaw of [0, 45, 90]) {
    const control = controlAt({receiver, occupied: true, yaw, cell: 'releasing'});
    assert.equal(control.feed, false); assert.equal(control.orient, false);
    assert.equal(control.leftDrive, 0); assert.equal(control.rightDrive, 0);
    assert.equal(control.frontClosed, true); assert.equal(control.backClosed, true);
    vectorClose(control.pose.center, dimensions.orientCenter); close(control.pose.yaw, yaw);
    const model = buildModel('handoff', 1, 'left', {receiver, occupied: true, yaw});
    vectorClose(model.userData.pose.center, dimensions.orientCenter);
    model.traverse(object => object.geometry?.dispose());
  }
  for (const cell of ['receiving', 'retained', 'releasing']) {
    const control = controlAt({receiver: 'ready', occupied: true, cell});
    assert.equal(control.frontClosed, cell !== 'receiving');
    assert.equal(control.backClosed, cell !== 'releasing');
    assert.equal(control.orient, cell === 'retained');
  }
  for (const yaw of [0, 30, 60, 90]) assert.equal(escapeScreen(yaw).escaped, false);
  assert.equal(escapeScreen(0, true).escaped, true);
  assert.equal(report.gates.find(check => check.name === 'gate-sweeps-to-working-belts').status, 'FAIL');
});

test('both mounting options and actual fold collisions remain failed comparison gates', () => {
  for (const mount of ['front', 'left']) {
    close(report.mount.results[mount].stowedInset, 2);
    assert.ok(report.mount.results[mount].hardwareBumper < 0);
  }
  assert.ok(report.clearances.maximumHardwareExtension > 457.2);
  assert.ok(report.clearances.stowedHeight < 1000);
  const collision = report.gates.find(check => check.name === 'fold-body-clearance').witness;
  const bodies = bodiesAt('stow', collision.progress);
  assert.ok(bodyGap(byId(bodies, collision.moving), byId(bodies, collision.fixed)) < 0);
});

test('the numerical report is reproducible and every PASS/FAIL is consistent with its threshold', () => {
  const recorded = JSON.parse(readFileSync(new URL('./feed-report.json', import.meta.url), 'utf8'));
  assert.deepEqual(report, recorded);
  for (const check of report.gates) {
    assert.ok(Number.isFinite(check.value) && Number.isFinite(check.minimum), check.name);
    assert.equal(check.status, check.value >= check.minimum - 1e-7 ? 'PASS' : 'FAIL', check.name);
  }
  assert.equal(report.status, 'FAIL'); assert.equal(report.geometryReady, false);
  assert.equal(report.gates.filter(check => check.status === 'FAIL').length, 7);
  assert.equal(report.sweep.totalPoses, 205);
  assert.equal(report.controls.controlledPositionDOF, 5);
  assert.equal(report.controls.rollerDrives, 3);
  assert.equal(report.repairAttempt, 3);
  assert.equal(report.repairHistory.length, 2);
  assert.equal(report.firstFailedResult.status, 'FAIL');
});