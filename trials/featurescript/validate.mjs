import assert from 'node:assert/strict';

export function measurementScript(featureId, roles) {
  if (!/^[A-Za-z0-9_-]+$/.test(featureId)) throw new Error('Unsafe feature ID');
  if (!roles.every(role => /^[A-Za-z]+$/.test(role))) throw new Error('Unsafe role');
  return `function(context is Context, queries) {
    const rootId = makeId(${JSON.stringify(featureId)});
    var rows = [];
    for (var role in ${JSON.stringify(roles)}) {
        const body = qBodyType(qCreatedBy(rootId + role + "blank", EntityType.BODY), BodyType.SOLID);
        const count = size(evaluateQuery(context, body));
        if (count != 1) throw regenError("Expected one body for " ~ role);
        const bounds = evBox3d(context, { "topology" : body, "tight" : true });
        var cylinders = [];
        for (var face in evaluateQuery(context, qGeometry(qOwnedByBody(body, EntityType.FACE), GeometryType.CYLINDER))) {
            const surface = evSurfaceDefinition(context, { "face" : face });
            const faceBounds = evBox3d(context, { "topology" : face, "tight" : true });
            cylinders = append(cylinders, [surface.radius / millimeter,
                    surface.coordSystem.origin[1] / millimeter, surface.coordSystem.origin[2] / millimeter,
                    surface.coordSystem.zAxis, faceBounds.minCorner / millimeter, faceBounds.maxCorner / millimeter]);
        }
        rows = append(rows, [role, count, bounds.minCorner / millimeter, bounds.maxCorner / millimeter,
                evVolume(context, { "entities" : body }) / (millimeter ^ 3), cylinders]);
    }
    return [size(evaluateQuery(context, qBodyType(qEverything(EntityType.BODY), BodyType.SOLID))), rows];
}`;
}

export function decodeFs(value) {
  if (!value || typeof value !== 'object' || !value.btType) throw new Error('Unexpected FeatureScript value encoding');
  if (value.btType.endsWith('BTFSValueArray')) return value.value.map(decodeFs);
  if (/(BTFSValueNumber|BTFSValueString|BTFSValueBoolean)$/.test(value.btType)) return value.value;
  throw new Error(`Unsupported FeatureScript value type: ${value.btType}`);
}

function close(actual, expected, label, tolerance = 0.01) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, observed ${actual}`);
}

export function validateMeasurements(evaluation, expected) {
  if (evaluation.error || evaluation.errors?.length) throw new Error('FeatureScript evaluation returned errors');
  const [solidCount, rows] = decodeFs(evaluation.result);
  assert.equal(solidCount, 9, 'Server solid count');
  assert.equal(rows.length, 9, 'Server measured part count');
  assert.equal(new Set(rows.map(row => row[0])).size, 9, 'Unique measured roles');
  for (const part of expected.parts) {
    const row = rows.find(item => item[0] === part.name);
    assert.ok(row, `Missing ${part.name}`);
    const [, count, min, max, volume, cylinders] = row;
    assert.equal(count, 1, part.name);
    for (const axis of [0, 1, 2]) {
      close(min[axis], part.boundsMm.min[axis], `${part.name} min ${axis}`);
      close(max[axis], part.boundsMm.max[axis], `${part.name} max ${axis}`);
    }
    close(volume, part.volumeMm3, `${part.name} volume`, Math.max(0.1, part.volumeMm3 * 1e-6));
    const requiredCylinders = part.holes?.map(hole => ({ radius: hole.diameterMm / 2, center: hole.centerYZMm })) ??
      (part.name.includes('Crossmember') ? [] : [
        { radius: (max[1] - min[1]) / 2, center: [(max[1] + min[1]) / 2, (max[2] + min[2]) / 2] },
        ...(part.boreDiameterMm ? [{ radius: part.boreDiameterMm / 2, center: [(max[1] + min[1]) / 2, (max[2] + min[2]) / 2] }] : []),
      ]);
    assert.equal(cylinders.length, requiredCylinders.length, `${part.name} cylindrical face count`);
    for (const required of requiredCylinders) {
      const match = cylinders.find(([radius, centerY, centerZ]) => Math.abs(radius - required.radius) < 0.01 && Math.abs(centerY - required.center[0]) < 0.01 && Math.abs(centerZ - required.center[1]) < 0.01);
      assert.ok(match, `${part.name} missing cylindrical surface at ${required.center}`);
      close(Math.abs(match[3][0]), 1, `${part.name} cylinder X axis`, 1e-6);
      close(match[3][1], 0, `${part.name} cylinder Y axis`, 1e-6);
      close(match[3][2], 0, `${part.name} cylinder Z axis`, 1e-6);
      close(match[4][0], min[0], `${part.name} through surface min X`);
      close(match[5][0], max[0], `${part.name} through surface max X`);
    }
  }
  const front = rows.find(row => row[0] === 'frontRoller');
  const rear = rows.find(row => row[0] === 'rearRoller');
  const gap = rear[2][1] - front[3][1];
  close(gap, expected.clearRollerGapMm, 'Clear roller gap');
  return { solidCount, measuredPartCount: rows.length, clearRollerGapMm: gap, boundsToleranceMm: 0.01, status: 'PASS_SERVER_MEASUREMENTS' };
}

export function assertFeatureState(response, featureId) {
  const state = featureId ? response.featureStates?.[featureId] : response.featureState;
  assert.equal(state?.featureStatus, 'OK', 'Feature must report OK');
  assert.notEqual(state?.inactive, true, 'Feature must be active');
  assert.notEqual(response.microversionSkew, true, 'Microversion skew');
}

export function compiledSpec(response) {
  const matches = response.featureSpecs?.filter(spec => spec.featureType === 'coralGroundIntake');
  assert.equal(matches?.length, 1, 'Expected exactly one exported coralGroundIntake feature spec');
  const spec = matches[0];
  const ids = new Set((spec.parameters ?? spec.allParameters ?? []).map(parameter => parameter.parameterId));
  assert.ok(ids.has('innerWidth') && ids.has('rollerGap'), 'Compiled feature spec must expose both controls');
  return spec;
}