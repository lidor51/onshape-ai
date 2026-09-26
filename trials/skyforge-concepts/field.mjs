// SKYFORGE field datums from the v0.1 manual (inches -> mm). Red alliance view; blue mirrors Y -> FIELD_Y - Y.
export const IN = 25.4;
export const FIELD_X = 324 * IN;
export const FIELD_Y = 648 * IN;
export const CUBE = 9 * IN;

export const LIMITS = {
  startHeight: 42 * IN,
  maxHeight: 78 * IN,
  extension: 18 * IN,
  duckHeight: 48 * IN,
  boardClearance: 32 * IN,
  perimeter: 120 * IN,
};

const throatHalf = 5.5 * IN;
function goal(id, name, owner, centerIn, rimIn, faceNormal) {
  const center = [centerIn[0] * IN, centerIn[1] * IN];
  return {
    id, name, owner, center, rim: rimIn * IN, throatHalf, baseHalf: 12 * IN,
    shellTop: (rimIn - 5.5) * IN, faceNormal,
    face: [center[0] + faceNormal[0] * 12 * IN, center[1] + faceNormal[1] * 12 * IN],
  };
}

export const GOALS = {
  G1: goal('G1', 'GOAL 1 (18 in rim)', 'red', [165, 12], 18, [0, 1]),
  G2near: goal('G2near', 'GOAL 2 near (38 in rim)', 'red', [12, 120], 38, [1, 0]),
  G2center: goal('G2center', 'GOAL 2 centre (38 in rim)', 'red', [12, 270], 38, [1, 0]),
  G3: goal('G3', 'GOAL 3 (60 in rim, blue half)', 'red', [12, 456], 60, [1, 0]),
  blueG1: goal('blueG1', 'Blue GOAL 1 (blocker in red LAUNCH ZONE)', 'blue', [165, 636], 18, [0, -1]),
};

export const VG = {
  owner: 'red', centerX: 165 * IN, planeY: FIELD_Y, bottom: 60 * IN,
  circumradius: (34.64 / 2) * IN, halfFlats: 15 * IN,
  get centerZ() { return this.bottom + this.circumradius; },
  releaseLineY: FIELD_Y - 24 * IN,
};

export const LAUNCH_ZONE = { x0: 120 * IN, x1: 210 * IN, y0: FIELD_Y - 72 * IN, y1: FIELD_Y };
export const OPPONENT_LAUNCH_ZONE = { x0: 120 * IN, x1: 210 * IN, y0: 0, y1: 72 * IN };
export const STARTING_ZONE = { x0: 0, x1: 114 * IN, y0: 0, y1: 90 * IN };
export const SAFE_ZONE = { x0: 264 * IN, x1: FIELD_X, y0: 0, y1: 144 * IN };

export const BOARD = {
  vertices: [[FIELD_X, 216 * IN], [FIELD_X, 324 * IN], [240 * IN, 324 * IN]],
  underside: 32 * IN, top: 33.5 * IN,
  rail: { a: [FIELD_X, 216 * IN], b: [240 * IN, 324 * IN], z: 33 * IN, radius: 1.66 * IN / 2 },
};

export const FIELD_CUBES = {
  centerLine: [84, 108, 132, 156, 180, 204, 228].flatMap(x => [288, 312].map(y => [x * IN, y * IN])),
  safeZone: [276, 300].flatMap(x => [24, 48, 72, 96, 120].map(y => [x * IN, y * IN])),
  besideIPC: [276, 300].flatMap(x => [168, 192].map(y => [x * IN, y * IN])),
  underBoard: [290, 310].flatMap(x => [290, 310].map(y => [x * IN, y * IN])),
};

export function railFrame() {
  const [ax, ay] = BOARD.rail.a;
  const [bx, by] = BOARD.rail.b;
  const length = Math.hypot(bx - ax, by - ay);
  const along = [(bx - ax) / length, (by - ay) / length];
  const inward = [along[1], -along[0]];
  const [cx, cy] = BOARD.vertices[1];
  const mid = [(ax + bx) / 2, (ay + by) / 2];
  if ((cx - mid[0]) * inward[0] + (cy - mid[1]) * inward[1] < 0) { inward[0] *= -1; inward[1] *= -1; }
  return { mid, along, inward, length };
}

export function pointInTriangle([px, py], [[ax, ay], [bx, by], [cx, cy]]) {
  const sign = (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = sign(px, py, ax, ay, bx, by), d2 = sign(px, py, bx, by, cx, cy), d3 = sign(px, py, cx, cy, ax, ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

export function inRect([x, y], rect) {
  return x >= rect.x0 && x <= rect.x1 && y >= rect.y0 && y <= rect.y1;
}

// Regular hexagon, vertices at top and bottom, centred on the VERTICAL GOAL opening (x horizontal, z vertical).
export function insideHexagon(x, z) {
  const dx = Math.abs(x - VG.centerX), dz = Math.abs(z - VG.centerZ), R = VG.circumradius;
  if (dx > VG.halfFlats) return false;
  return dz <= R - dx * Math.tan(Math.PI / 6);
}
