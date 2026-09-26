import { hash } from './patch.mjs';
import { measure } from './model.mjs';

export function metadata(response) {
  if (!/^[0-9a-f]{24}$/.test(response.sourceMicroversion) || !Number.isInteger(response.libraryVersion) ||
    response.libraryVersion <= 0 || !response.serializationVersion || response.microversionSkew) throw new Error('FEATURE_METADATA_UNVERIFIED');
  return { sourceMicroversion: response.sourceMicroversion, libraryVersion: response.libraryVersion,
    serializationVersion: response.serializationVersion, rejectMicroversionSkew: true };
}

export function healthy(snapshot) {
  metadata(snapshot);
  if (!Array.isArray(snapshot.features) || snapshot.isComplete !== true) throw new Error('FEATURE_LIST_INCOMPLETE');
  for (const feature of snapshot.features) {
    if (snapshot.featureStates?.[feature.featureId]?.featureStatus !== 'OK' || feature.suppressed ||
      (feature.namespace && feature.namespace !== '')) throw new Error('NATIVE_FEATURE_HEALTH_FAILED');
  }
}

export function mapFeatures(candidate, snapshot) {
  const map = {};
  for (const expected of candidate.features) {
    const matching = snapshot.features.filter(feature => feature.name === expected.name && feature.featureType === expected.featureType);
    if (matching.length !== 1 || !matching[0].featureId) throw new Error('FEATURE_IDENTITY_AMBIGUOUS');
    map[expected.featureId] = matching[0].featureId;
  }
  for (const name of ['Right', 'Origin']) {
    const found = snapshot.defaultFeatures?.find(feature => feature.name === name);
    if (!found?.featureId) throw new Error('DEFAULT_GEOMETRY_ID_UNVERIFIED');
    map[name] = found.featureId;
  }
  return map;
}

export function rebind(value, map) {
  if (Array.isArray(value)) return value.map(item => rebind(item, map));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (key === 'featureId' && map[item]) return [key, map[item]];
    if (key === 'queryString') return [key, item.replace(/makeId\("([^"]+)"\)/g, (whole, local) =>
      `makeId("${map[local] ?? local}")`)];
    return [key, rebind(item, map)];
  }));
  return value;
}

export function inspectNative(candidate, snapshot) {
  healthy(snapshot);
  const map = mapFeatures(candidate, snapshot);
  for (const expected of candidate.features) {
    const actual = snapshot.features.find(feature => feature.featureId === map[expected.featureId]);
    for (const parameter of expected.parameters.filter(item => item.expression !== undefined || item.value !== undefined)) {
      const found = actual.parameters.find(item => item.parameterId === parameter.parameterId);
      if (!found || (parameter.expression !== undefined && found.expression !== parameter.expression) ||
        (parameter.value !== undefined && found.value !== parameter.value)) throw new Error('NATIVE_PARAMETER_READBACK_MISMATCH');
    }
    if (expected.constraints) {
      if (!Array.isArray(actual.constraints) || actual.constraints.length !== expected.constraints.length) throw new Error('NATIVE_CONSTRAINT_READBACK_MISMATCH');
      for (const constraint of expected.constraints) {
        const actualConstraint = actual.constraints.find(item => item.entityId === constraint.entityId);
        if (!actualConstraint || actualConstraint.constraintType !== constraint.constraintType || actualConstraint.drivenDimension === true) throw new Error('NATIVE_CONSTRAINT_READBACK_MISMATCH');
        for (const parameter of constraint.parameters) {
          const found = actualConstraint.parameters?.find(item => item.parameterId === parameter.parameterId);
          if (!found || (parameter.expression !== undefined && found.expression !== parameter.expression) ||
            (parameter.value !== undefined && found.value !== parameter.value)) throw new Error('NATIVE_DIMENSION_READBACK_MISMATCH');
        }
      }
    }
  }
  return { nativeReadback: 'PASS', solverDOF: 'UNVERIFIED', map,
    note: 'Driving definitions read back; remaining solver degrees of freedom are not exposed by this adapter.' };
}

export function definition(value) {
  if (Array.isArray(value)) return value.map(definition);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== 'nodeId' && !(value.btType === 'BTMParameterQuantity-147' && key === 'value'))
    .map(([key, item]) => [key, definition(item)]));
  return value;
}

export function preserved(before, after, changes) {
  const expected = before.features.map(feature => changes.find(change => change.featureId === feature.featureId)?.after ?? feature);
  if (hash(definition(expected)) !== hash(definition(after.features))) throw new Error('UNRELATED_DEFINITION_CHANGED');
  return { status: 'PASS', beforeHash: hash(definition(before.features)), afterHash: hash(definition(after.features)),
    changedFeatureIds: changes.map(change => change.featureId),
    ignoredServerFields: ['nodeId', 'evaluated quantity value; expression remains compared'] };
}

const near = (actual, expected, tolerance = 1e-5) => Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
const vector = value => value && [value.x, value.y, value.z].every(Number.isFinite) ? [value.x, value.y, value.z] : null;

export function verifyGeometry(bodyDetails, boxes, mass, candidate) {
  const expected = measure(candidate);
  if (!Array.isArray(bodyDetails.bodies)) throw new Error('BODYDETAILS_SCHEMA_UNVERIFIED');
  const solids = bodyDetails.bodies.filter(body => body.type === 'SOLID');
  if (solids.length !== 1) throw new Error('SOLID_COUNT');
  const body = solids[0];
  if (!body.id || !Array.isArray(body.faces) || !Array.isArray(body.edges)) throw new Error('BODYDETAILS_SCHEMA_UNVERIFIED');
  const bounds = { low: [boxes.lowX, boxes.lowY, boxes.lowZ].map(value => value * 1000),
    high: [boxes.highX, boxes.highY, boxes.highZ].map(value => value * 1000) };
  for (const side of ['low', 'high']) {
    if (!bounds[side].every((value, index) => near(value, expected.boundsMm[side][index]))) throw new Error('SERVER_BOUNDS_MISMATCH');
  }
  const volume = mass.bodies?.['-all-']?.volume;
  if (!Array.isArray(volume) || volume.length !== 3 || !volume.every(value => Number.isFinite(value) && value > 0) ||
    volume[1] > volume[0] || volume[0] > volume[2]) throw new Error('MASS_SCHEMA_UNVERIFIED');
  const volumeMm3 = volume[0] * 1e9;
  if (!near(volumeMm3, expected.volumeMm3, Math.max(0.01, expected.volumeMm3 * 1e-6))) throw new Error('SERVER_VOLUME_MISMATCH');
  const cylinders = body.faces.filter(face => face.surface?.type === 'CYLINDER');
  if (cylinders.length !== expected.holes.length || body.faces.some(face => !['CYLINDER', 'PLANE'].includes(face.surface?.type))) throw new Error('SERVER_HOLE_TOPOLOGY');
  const holes = expected.holes.map(hole => {
    const matches = cylinders.filter(face => {
      const center = vector(face.surface.origin);
      const axis = vector(face.surface.axis ?? face.surface.direction);
      return center && axis && near(Math.abs(axis[0]), 1) && near(axis[1], 0) && near(axis[2], 0) &&
        near(center[1] * 1000, hole.center[0]) && near(center[2] * 1000, hole.center[1]);
    });
    if (matches.length !== 1) throw new Error('SERVER_HOLE_POSITION');
    const face = matches[0];
    const edgeIds = new Set((face.loops ?? []).flatMap(loop => (loop.coedges ?? []).map(edge => edge.edgeId)));
    const circles = body.edges.filter(edge => edgeIds.has(edge.id) && edge.curve?.type === 'CIRCLE');
    for (const faceX of [expected.boundsMm.low[0], expected.boundsMm.high[0]]) {
      const matching = circles.filter(edge => {
        const center = vector(edge.curve.origin);
        return center && near(center[0] * 1000, faceX) && near(center[1] * 1000, hole.center[0]) &&
          near(center[2] * 1000, hole.center[1]) && near(edge.geometry?.length * 1000, Math.PI * hole.diameter);
      });
      if (matching.length !== 1) throw new Error('THROUGH_HOLE_EDGE_SCHEMA_OR_GEOMETRY_UNVERIFIED');
    }
    if (!near(face.area * 1e6, Math.PI * hole.diameter * candidate.plateThickness, 0.01)) throw new Error('CYLINDER_AREA_MISMATCH');
    return { ...hole, evidence: 'cylindrical face, two full circular boundary lengths at both X faces, area and total volume' };
  });
  return { status: 'PASS', evidence: 'server REST analytic B-rep and mass properties; not tessellation',
    units: 'mm', partMap: { semanticId: 'leftPlate', serverPartId: body.id }, boundsMm: bounds, volumeMm3, holes };
}