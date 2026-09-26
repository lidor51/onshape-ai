import * as THREE from 'three';
import { VG, CUBE, insideHexagon } from './field.mjs';

const G = 9806.65; // mm/s^2
const HALF = CUBE / 2;

// Drag-free point-mass flight of a non-rotating cube, released at p0 (mm) along unit d = (dx, dy, dz).
export function flight(p0, horizontal, alpha, speed, t) {
  const vh = speed * Math.cos(alpha), vz = speed * Math.sin(alpha);
  return [p0[0] + horizontal[0] * vh * t, p0[1] + horizontal[1] * vh * t, p0[2] + vz * t - 0.5 * G * t * t];
}

// Speed that puts the cube centre at height zt when it reaches the goal plane (Y = VG.planeY).
export function solveSpeed(p0, horizontal, alpha, zt = VG.centerZ) {
  const distance = (VG.planeY - p0[1]) / horizontal[1];
  const rise = p0[2] + distance * Math.tan(alpha) - zt;
  if (!(distance > 0) || rise <= 0) return null;
  return Math.sqrt(G * distance * distance / (2 * Math.cos(alpha) ** 2 * rise));
}

// True if the cube's face-on 228.6 mm square stays inside the hexagon while it crosses the opening plane.
export function passesOpening(p0, horizontal, alpha, speed, lateral = 0) {
  const vy = speed * Math.cos(alpha) * horizontal[1];
  if (vy <= 0) return false;
  const tFront = (VG.planeY - HALF - p0[1]) / vy, tBack = (VG.planeY + HALF - p0[1]) / vy;
  for (let index = 0; index <= 24; index++) {
    const t = tFront + (tBack - tFront) * index / 24;
    const [x, , z] = flight(p0, horizontal, alpha, speed, t);
    const xs = x + lateral;
    for (const [cx, cz] of [[xs - HALF, z - HALF], [xs + HALF, z - HALF], [xs - HALF, z + HALF], [xs + HALF, z + HALF]]) {
      if (!insideHexagon(cx, cz)) return false;
    }
  }
  return true;
}

function band(test, nominal, step, limit) {
  let low = nominal, high = nominal;
  while (low > nominal - limit && test(low - step)) low -= step;
  while (high < nominal + limit && test(high + step)) high += step;
  return [low, high];
}

// Full shot evaluation: required speed, crossing, tolerance bands and whether a legal 48 in defender can touch it.
export function evaluateShot({ position, horizontal, alpha, footprintExit, quick = false }) {
  const speed = solveSpeed(position, horizontal, alpha);
  if (!speed) return { feasible: false, reason: 'Opening centre is above the launch line; no ballistic solution at this angle.' };
  const passes = passesOpening(position, horizontal, alpha, speed);
  const [vLow, vHigh] = band(v => passesOpening(position, horizontal, alpha, v), speed, speed * (quick ? 0.004 : 0.001), speed * 0.3);
  const tClear = footprintExit / (speed * Math.cos(alpha));
  const clearBottom = flight(position, horizontal, alpha, speed, tClear)[2] - HALF;
  if (quick) return { feasible: passes, speedBandPct: [(vLow / speed - 1) * 100, (vHigh / speed - 1) * 100], unblockable: clearBottom >= 48 * 25.4 };
  const [latLow, latHigh] = band(dx => passesOpening(position, horizontal, alpha, speed, dx), 0, 2, 600);
  const distance = (VG.planeY - position[1]) / horizontal[1];
  const [dLow, dHigh] = band(dd => passesOpening([position[0] - dd * horizontal[0], position[1] - dd * horizontal[1], position[2]], horizontal, alpha, speed), 0, 2, 900);
  const vy = speed * Math.cos(alpha) * horizontal[1];
  const tPlane = (VG.planeY - position[1]) / vy;
  const vzPlane = speed * Math.sin(alpha) - G * tPlane;
  const apexT = speed * Math.sin(alpha) / G;
  const apex = flight(position, horizontal, alpha, speed, apexT)[2];
  const samples = [];
  const tEnd = (VG.planeY + 250 - position[1]) / vy;
  for (let index = 0; index <= 40; index++) samples.push(flight(position, horizontal, alpha, speed, tEnd * index / 40));
  return {
    feasible: passes, speed, speedMps: speed / 1000, distance, alphaDeg: alpha * 180 / Math.PI,
    crossingDeg: Math.atan2(vzPlane, speed * Math.cos(alpha)) * 180 / Math.PI, apex,
    speedBandPct: [(vLow / speed - 1) * 100, (vHigh / speed - 1) * 100],
    lateralBand: [latLow, latHigh], distanceBand: [dLow, dHigh],
    footprintClearBottom: clearBottom, unblockable: clearBottom >= 48 * 25.4, samples,
  };
}

// World-space vertices of every robot mesh (bumpers flagged separately), for rule checks.
export function collect(root, kinds = ['robot', 'bumper']) {
  root.updateMatrixWorld(true);
  const out = [];
  const point = new THREE.Vector3();
  root.traverse(object => {
    if (!object.isMesh || !kinds.includes(object.userData.kind)) return;
    const box = new THREE.Box3();
    const positions = object.geometry.attributes.position;
    const vertices = [];
    for (let index = 0; index < positions.count; index++) {
      point.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld);
      box.expandByPoint(point);
      vertices.push([point.x, point.y, point.z]);
    }
    out.push({ name: object.name, kind: object.userData.kind, box, vertices });
  });
  return out;
}

// Largest distance of any non-bumper robot vertex beyond the frame-perimeter rectangle (robot-local frame).
export function extensionBeyondPerimeter(root, L, W) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const point = new THREE.Vector3();
  let worst = { value: 0, name: '' };
  root.traverse(object => {
    if (!object.isMesh || object.userData.kind !== 'robot') return;
    const positions = object.geometry.attributes.position;
    const matrix = inverse.clone().multiply(object.matrixWorld);
    for (let index = 0; index < positions.count; index++) {
      point.fromBufferAttribute(positions, index).applyMatrix4(matrix);
      const dx = Math.max(0, Math.abs(point.x) - L / 2), dy = Math.max(0, Math.abs(point.y) - W / 2);
      const value = Math.hypot(dx, dy);
      if (value > worst.value) worst = { value, name: object.name };
    }
  });
  return worst;
}

export function heightOf(parts) {
  return parts.reduce((best, part) => part.box.max.z > best.value ? { value: part.box.max.z, name: part.name } : best, { value: 0, name: '' });
}

export function lowestOf(parts) {
  return parts.reduce((best, part) => part.box.min.z < best.value ? { value: part.box.min.z, name: part.name } : best, { value: Infinity, name: '' });
}
