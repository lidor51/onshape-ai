import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {coaxialTransform} from './coaxial-motion.mjs';

export const FRAME = {x: [-350, 350], y: [0, 760], maximumHeight: 1066.8};

export function meshBounds(definition, matrix) {
  const lower = [Infinity, Infinity, Infinity], upper = [-Infinity, -Infinity, -Infinity];
  const values = matrix.elements;
  for (let offset = 0; offset < definition.positions.length; offset += 3) {
    const point = definition.positions.slice(offset, offset + 3);
    for (let axis = 0; axis < 3; axis++) {
      const coordinate = values[axis] * point[0] + values[axis + 4] * point[1] + values[axis + 8] * point[2] + values[axis + 12];
      lower[axis] = Math.min(lower[axis], coordinate); upper[axis] = Math.max(upper[axis], coordinate);
    }
  }
  if (![...lower, ...upper].every(Number.isFinite)) throw new Error('Missing physical mesh vertices');
  return [...lower, ...upper];
}

export function margins(bounds, frame = FRAME) {
  return {left: bounds[0] - frame.x[0], right: frame.x[1] - bounds[3],
    front: bounds[1] - frame.y[0], rear: frame.y[1] - bounds[4], height: frame.maximumHeight - bounds[5]};
}

export function audit(mesh, {angle = mesh.motion.stow_deg, floating = 0, reserveMm = 5, frame = FRAME} = {}) {
  const parts = mesh.instances.filter(part => !part.reference_only).map(part => {
    const bounds = meshBounds(mesh.definitions[part.definition], coaxialTransform(part, mesh.motion, angle, floating));
    const clearance = margins(bounds, frame);
    return {id: part.id, motion: part.motion, role: part.role, boundsMm: bounds, marginsMm: clearance,
      outsideFrame: Object.values(clearance).some(value => value < -1e-6),
      reserveMet: Object.values(clearance).every(value => value >= reserveMm)};
  });
  const outside = parts.filter(part => part.outsideFrame);
  return {schema: 'starting-frame-envelope/1', status: outside.length ? 'FAIL_OUTSIDE_FRAME' : 'MESH_ONLY_NOT_CERTIFIED',
    frame, angleDeg: angle, floatDeg: floating, reserveMm, physicalParts: parts.length,
    motorCount: parts.filter(part => part.role === 'motor').length,
    minimumMarginsMm: Object.fromEntries(Object.keys(parts[0].marginsMm).map(side => [side, Math.min(...parts.map(part => part.marginsMm[side]))])),
    outsideParts: outside, reserveFailures: parts.filter(part => !part.reserveMet).map(part => part.id),
    fixedOutsideCount: outside.filter(part => part.motion === 'fixed').length,
    startingConfigurationCertified: false, releaseReady: false,
    limitation: 'Actual mesh vertices reject protrusions; passing mesh bounds alone does not certify analytic B-rep extrema, tolerances, full rotor phases, starting restraints, or official rules. Frame plane is Y=0, not bumper outer face Y=-85.'};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = new URL('coaxial-output/revision-feed/coaxial-mesh.json', import.meta.url);
  const bytes = readFileSync(source), mesh = JSON.parse(bytes);
  const report = {source: 'coaxial-output/revision-feed/coaxial-mesh.json', sourceSha256: createHash('sha256').update(bytes).digest('hex'),
    poses: [0, -8].map(floating => audit(mesh, {floating}))};
  writeFileSync(new URL('starting-envelope.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.poses.map(pose => ({...pose, outsideParts: pose.outsideParts.map(part => ({id: part.id, motion: part.motion, marginsMm: part.marginsMm})), reserveFailures: pose.reserveFailures.length})), null, 2));
}