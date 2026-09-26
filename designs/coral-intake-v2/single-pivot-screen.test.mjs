import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {arcBounds, rotateYZ, wallMoment, pivotScreen, convexOutline, pickupOutline} from './single-pivot-screen.mjs';

test('negative rotation raises a forward roller and matches a quarter turn', () => {
  const result = rotateYZ([-250, 0], [0, 0], -90);
  assert.ok(Math.abs(result[0]) < 1e-10);
  assert.ok(Math.abs(result[1] - 250) < 1e-10);
});

test('analytic arc extrema enclose dense samples including interior maximum', () => {
  for (const angle of [-10, -90, -140, -180]) {
    const point = [-261, 170.3484861008832], pivot = [110, 330];
    const bounds = arcBounds(point, pivot, angle);
    for (let index = 0; index <= 1000; index++) {
      const sample = rotateYZ(point, pivot, angle * index / 1000);
      for (const axis of [0, 1]) {
        assert.ok(sample[axis] >= bounds.min[axis] - 1e-9);
        assert.ok(sample[axis] <= bounds.max[axis] + 1e-9);
      }
    }
  }
  assert.equal(arcBounds([-3, -4], [0, 0], -180).max[1], 5);
});

test('impact moment changes with height but side load cannot be cleared by this screen', () => {
  assert.equal(wallMoment([-140, 34], [110, 330]).torqueXNm, 44.4);
  assert.equal(wallMoment([-140, 34], [110, 170]).torqueXNm, 20.4);
  assert.equal(wallMoment([-261, 170.35], [110, 140]).favorsNegativeStow, true);
  assert.equal(wallMoment([-140, 34], [110, 140]).favorsNegativeStow, false);
  assert.equal(wallMoment([-140, 34], [110, 140]).passiveRetractionProven, false);
});

test('existing report is screened without claiming full mechanism clearance', () => {
  const report = JSON.parse(readFileSync(new URL('pickup-report.json', import.meta.url)));
  const result = pivotScreen(report, {pivot: [110, 170], angleDeg: -120});
  assert.equal(result.sampledAngles, 1201);
  assert.equal(result.releaseReady, false);
  assert.equal(result.fullAssemblyClearance, false);
  assert.equal(result.impactSurvival, false);
  assert.ok(result.betweenSampleTravelBoundMm > 0);
  assert.throws(() => pivotScreen(report, {pivot: [110, 170], angleDeg: -120, stepDeg: 0}));
});

test('projected outline retains extremes and excludes empty bounding-box corners', () => {
  const source = [[-3, 0], [0, 4], [3, 0], [0, -4], [0, 0], [0, 4]];
  const outline = convexOutline(source);
  assert.equal(outline.length, 4);
  for (const angle of [-140, -90, -30, 0]) {
    const points = source.map(point => rotateYZ(point, [0, 0], angle));
    const hull = outline.map(point => rotateYZ(point, [0, 0], angle));
    for (const axis of [0, 1]) {
      assert.equal(Math.min(...hull.map(point => point[axis])), Math.min(...points.map(point => point[axis])));
      assert.equal(Math.max(...hull.map(point => point[axis])), Math.max(...points.map(point => point[axis])));
    }
  }
});

test('pickup projection applies source matrix before front-arm float', () => {
  const mesh = {settings: {middle_yz: [10, 20]},
    definitions: {sample: {positions: [0, 0, 0, 0, 2, 0, 0, 0, 1]}},
    instances: [{definition: 'sample', motion: 'float', matrix: [[1, 0, 0, 0], [0, 1, 0, 10], [0, 0, 1, 20], [0, 0, 0, 1]]}]};
  const result = pickupOutline(mesh, -90);
  assert.ok(result.some(point => Math.abs(point[0] - 11) < 1e-10 && Math.abs(point[1] - 20) < 1e-10));
  assert.ok(result.some(point => Math.abs(point[0] - 10) < 1e-10 && Math.abs(point[1] - 18) < 1e-10));
});

test('recorded comparison is source-bound and distinguishes packaging from release', () => {
  const comparison = JSON.parse(readFileSync(new URL('single-pivot-screen.json', import.meta.url)));
  for (const [filename, property] of [['pickup-report.json', 'sourceSha256'], ['output/pickup-mesh.json', 'sourceMeshSha256']]) {
    assert.equal(comparison[property], createHash('sha256').update(readFileSync(new URL(filename, import.meta.url))).digest('hex'));
  }
  const lower = comparison.candidates.find(candidate => candidate.pivot[0] === 110 && candidate.pivot[1] === 170 && candidate.angleDeg === -110);
  const original = comparison.candidates.find(candidate => candidate.pivot[0] === 110 && candidate.pivot[1] === 330 && candidate.angleDeg === -140);
  assert.equal(lower.packagingScreenPass, true);
  assert.equal(original.packagingScreenPass, true);
  assert.equal(comparison.releaseReady, false);
  for (const state of lower.states) {
    assert.ok(state.sweptMeshBoundsYZ.max[1] < 637);
    assert.ok(state.extensionBeyondBumperMm < 270);
    assert.ok(state.bumperClearanceLowerBoundMm > 30);
    assert.ok(state.floorClearanceLowerBoundMm > 8);
    assert.equal(state.wallMoments.kick.favorsNegativeStow, false);
    assert.equal(state.fullAssemblyClearance, false);
    assert.equal(state.releaseReady, false);
  }
  assert.ok(comparison.priorLinkage.stowBoundsMm[5] > 834);
});