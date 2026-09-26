import { createHash } from 'node:crypto';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function holesFor(parameters) {
  return [
    { name: 'frontShaft', y: parameters.frontRollerYMm, z: parameters.rollerZMm, radius: parameters.shaftHoleDiameterMm / 2 },
    { name: 'rearShaft', y: parameters.frontRollerYMm + parameters.rollerDiameterMm + parameters.rollerGapMm, z: parameters.rollerZMm, radius: parameters.shaftHoleDiameterMm / 2 },
    ...parameters.crossmemberCentersYZMm.map(([y, z], index) => ({ name: `mount${index}`, y, z, radius: parameters.mountHoleDiameterMm / 2 })),
    { name: 'pivot', y: parameters.pivotCenterYZMm[0], z: parameters.pivotCenterYZMm[1], radius: parameters.pivotHoleDiameterMm / 2 },
    ...(parameters.downstreamHole ? [{ name: 'independentNativeHole', y: 200, z: 40, radius: 2 }] : []),
  ];
}

export function validateParameters(parameters) {
  if (parameters.units !== 'mm') throw new Error('Only mm units are accepted');
  const finite = value => Array.isArray(value) ? value.every(finite) : typeof value === 'number' && Number.isFinite(value);
  const dimensions = ['innerWidthMm', 'plateThicknessMm', 'plateLengthMm', 'plateHeightMm', 'rollerDiameterMm', 'shaftHoleDiameterMm', 'mountHoleDiameterMm', 'pivotHoleDiameterMm'];
  for (const name of dimensions) {
    if (!finite(parameters[name]) || parameters[name] <= 0) throw new Error(`Invalid positive dimension: ${name}`);
  }
  for (const name of ['plateBottomZMm', 'rollerGapMm', 'frontRollerYMm', 'rollerZMm', 'crossmemberCentersYZMm', 'pivotCenterYZMm']) {
    if (!finite(parameters[name])) throw new Error(`Invalid finite parameter: ${name}`);
  }
  if (parameters.rollerGapMm < 0) throw new Error('Negative gap');
  if (parameters.crossmemberCentersYZMm.length !== 2 || parameters.crossmemberCentersYZMm.some(center => center.length !== 2) || parameters.pivotCenterYZMm.length !== 2) throw new Error('Invalid hole center arrays');
  if (typeof parameters.downstreamHole !== 'boolean') throw new Error('Explicit downstream state required');
  const holes = holesFor(parameters);
  for (const [index, hole] of holes.entries()) {
    const ligament = Math.min(hole.y - hole.radius, parameters.plateLengthMm - hole.y - hole.radius, hole.z - parameters.plateBottomZMm - hole.radius, parameters.plateBottomZMm + parameters.plateHeightMm - hole.z - hole.radius);
    if (!(ligament > 0)) throw new Error(`Non-positive edge ligament: ${hole.name}`);
    for (const other of holes.slice(0, index)) {
      if (!(Math.hypot(hole.y - other.y, hole.z - other.z) > hole.radius + other.radius)) throw new Error(`Overlapping bores: ${hole.name}`);
    }
  }
  return holes;
}

export function bindingsFor(inputs) {
  const required = ['source', 'parameters', 'validator', 'dependencies', 'generator', 'fixture', 'reusedSource', 'gate', 'oracle', 'dependencyRuntime', 'dependencySpecification', 'dialog', 'sweep'];
  if (required.some(name => !Object.hasOwn(inputs, name))) throw new Error('Missing bound input');
  return Object.fromEntries(Object.entries(inputs).sort(([left], [right]) => left.localeCompare(right)).map(([name, bytes]) => [name, sha256(bytes)]));
}

export function assertReady(inputs, report) {
  const parameters = JSON.parse(inputs.parameters.toString());
  const holes = validateParameters(parameters);
  const bindings = bindingsFor(inputs);
  if (JSON.stringify(bindings) !== JSON.stringify(report.bindings)) throw new Error('Stale preflight bindings');
  if (report.status !== 'PASS' || report.oracle?.valid !== true || report.oracle?.closed !== true || report.oracle?.solids !== 1 || report.oracle?.holeCount !== holes.length || report.oracle?.analyticComparison !== 'PASS' || report.oracle?.stepRoundtrip !== 'PASS' || report.sourceContract !== 'PASS') throw new Error('Incomplete or failed preflight');
  return Object.freeze({ parameters, bindings });
}

export async function submitValidated(inputs, report, adapter) {
  const validated = assertReady(inputs, report);
  return adapter({ ...validated, source: inputs.source.toString() });
}