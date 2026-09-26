import { defaults, datums, evaluateContact, guideSegments, supportAt } from './layout.mjs';

export const pivot = [180, 210];
export const stowAngle = -95;
export const orienter = Object.freeze([
  { id: 'entry', y: 30, x: 180 },
  { id: 'middle', y: 165, x: 130 },
  { id: 'exit', y: 305, x: 85.15 },
]);

export function rotate(point, angle) {
  const radians = angle * Math.PI / 180;
  const deltaY = point[0] - pivot[0];
  const deltaZ = point[1] - pivot[1];
  return [pivot[0] + deltaY * Math.cos(radians) - deltaZ * Math.sin(radians),
    pivot[1] + deltaY * Math.sin(radians) + deltaZ * Math.cos(radians)];
}

export function rectangleDistance(point, centerY, yawDegrees, parameters = defaults) {
  const radians = yawDegrees * Math.PI / 180;
  const deltaX = point[0];
  const deltaY = point[1] - centerY;
  const axial = deltaX * Math.sin(radians) + deltaY * Math.cos(radians);
  const radial = deltaX * Math.cos(radians) - deltaY * Math.sin(radians);
  return Math.hypot(Math.max(0, Math.abs(axial) - parameters.coralLength / 2),
    Math.max(0, Math.abs(radial) - parameters.coralDiameter / 2));
}

export function yawClearance(centerY, yawDegrees, parameters = defaults) {
  return Math.min(...orienter.flatMap(station => [-1, 1].map(side =>
    rectangleDistance([side * station.x, station.y], centerY, yawDegrees, parameters) -
      (parameters.orienterRadius - parameters.compressionLimit))));
}

export function yawRoute(parameters = defaults) {
  const start = [0, 90];
  const goal = [parameters.receiverY, 0];
  const queue = [start];
  const previous = new Map([[start.join(','), null]]);
  const states = new Map([[start.join(','), start]]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    if (current[0] === goal[0] && current[1] === goal[1]) break;
    for (const delta of [[5, 0], [-5, 0], [0, -3], [0, 3]]) {
      const next = [current[0] + delta[0], current[1] + delta[1]];
      const key = next.join(',');
      if (previous.has(key) || next[0] < -60 || next[0] > goal[0] || next[1] < 0 || next[1] > 90) continue;
      const edgeSafe = Array.from({ length: 11 }, (_, index) => {
        const blend = index / 10;
        return yawClearance(current[0] + delta[0] * blend, current[1] + delta[1] * blend, parameters) >= 0.05;
      }).every(Boolean);
      if (!edgeSafe) continue;
      previous.set(key, current.join(','));
      states.set(key, next);
      queue.push(next);
    }
  }
  if (!previous.has(goal.join(','))) return { status: 'NO_PATH_IN_BOUNDED_GRID', explored: previous.size, path: [] };
  const path = [];
  for (let key = goal.join(','); key !== null; key = previous.get(key)) path.push(states.get(key));
  path.reverse();
  return { status: 'GEOMETRIC_ROUTE_ONLY', explored: previous.size, path,
    minimumClearance: Math.min(...path.map(state => yawClearance(...state, parameters))),
    driveConvergence: 'UNVERIFIED_FIXTURE_REQUIRED',
    meaning: 'Collision-constrained search, including reverse travel. Not a prescribed-pose or friction/dynamics success claim.' };
}

export function coarseSweep(parameters = defaults) {
  const report = evaluateContact(parameters);
  const samples = [];
  for (const float of [0, parameters.frontFloat]) {
    for (let index = 0; index < 63; index++) {
      const angle = stowAngle * index / 62;
      const circles = report.rollers.map(roller => {
        const position = rotate([roller.y, roller.z + (roller.floating ? float : 0)], angle);
        return { id: roller.id, center: position, radius: roller.radius };
      });
      const ramp = guideSegments(parameters).find(segment => segment.id === 'ramp');
      const vertices = [ramp.start, ramp.end, [ramp.end[0], ramp.end[1] - parameters.plateThickness]]
        .map(point => rotate(point, angle));
      const front = Math.min(...circles.map(circle => circle.center[0] - circle.radius), ...vertices.map(point => point[0]));
      const back = Math.max(...circles.map(circle => circle.center[0] + circle.radius), ...vertices.map(point => point[0]));
      const top = Math.max(...circles.map(circle => circle.center[1] + circle.radius), ...vertices.map(point => point[1]));
      const bumperClearance = Math.min(...circles.map(circle => {
        const nearestY = Math.max(-85, Math.min(0, circle.center[0]));
        const nearestZ = Math.max(45, Math.min(165, circle.center[1]));
        return Math.hypot(circle.center[0] - nearestY, circle.center[1] - nearestZ) - circle.radius;
      }));
      samples.push({ angle, float, front, back, top, bumperClearance });
    }
  }
  return { samples, front: Math.min(...samples.map(sample => sample.front)),
    bumperClearance: Math.min(...samples.map(sample => sample.bumperClearance)),
    stowed: samples.filter(sample => Math.abs(sample.angle - stowAngle) < 1e-7),
    scope: 'Analytic roller/ramp envelopes only; all-pair BRep follows before hardware detail.' };
}

export function variant(name) {
  return name === 'baseline' ? { ...defaults } : { ...defaults, mouthWidth: 520, frontFloat: 24 };
}

export function prepare(name) {
  const parameters = variant(name);
  const contact = evaluateContact(parameters);
  return { name, parameters, datums, contact, pivot, stowAngle, orienter,
    sweep: coarseSweep(parameters), yaw: yawRoute(parameters),
    entryTrials: [0, 30, 60, 75, 90].map(yaw => ({ yaw,
      samples: Array.from({ length: 63 }, (_, index) => supportAt(-432 + 432 * index / 62, yaw, parameters)) })),
    receiver: { center: [0, parameters.receiverY, parameters.deckHeight + parameters.coralDiameter / 2],
      fingerX: [-40, 40], slotWidth: 18, fingerWidth: 10, fingerLength: 50,
      approach: 'vertical from below through two deck slots; lift 180 mm', retained: 'UNVERIFIED' } };
}