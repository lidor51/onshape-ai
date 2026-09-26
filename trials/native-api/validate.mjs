import { requireCondition } from './transport.mjs';
import { bindFeature } from './model.mjs';

export function checkedId(value) {
  requireCondition(typeof value === 'string' && /^[A-Za-z0-9_.+-]{1,128}$/.test(value), 'INVALID_RETURNED_ID');
  return value;
}

export function requirePrivate(document) {
  requireCondition(document?.public === false && document.anonymousAccessAllowed !== true, 'PRIVATE_DOCUMENT_NOT_CONFIRMED');
}

export function bomExclusionProperty(metadata) {
  return metadata.properties?.find(property => ['Exclude from BOM', 'Exclude from all BOMs'].includes(property.name)
    && property.editable === true && ['BOOLEAN', 'BOOL'].includes(property.valueType));
}

export function featureResult(response, expectedId) {
  requireCondition(response?.featureState?.featureStatus === 'OK' && !response.featureState.inactive, 'FEATURE_NOT_OK');
  requireCondition(response.microversionSkew !== true, 'MICROVERSION_SKEW');
  const id = checkedId(response.feature?.featureId);
  requireCondition(expectedId === undefined || id === expectedId, 'FEATURE_ID_CHANGED');
  return id;
}

export function verifyFeatureList(response, plan, ids) {
  requireCondition(Array.isArray(response?.features) && response.features.length === plan.features.length, 'FEATURE_COUNT_MISMATCH');
  const results = [];
  for (const entry of plan.features) {
    const featureId = ids[entry.key];
    const actual = response.features.find(feature => feature.featureId === featureId);
    const status = response.featureStates?.[featureId];
    requireCondition(actual && status?.featureStatus === 'OK' && !status.inactive && !actual.suppressed, 'FEATURE_LIST_NOT_OK');
    const expected = bindFeature(entry.feature, ids);
    requireCondition(actual.featureType === expected.featureType && actual.name === expected.name, 'FEATURE_READBACK_MISMATCH');
    for (const parameter of expected.parameters) {
      if (parameter.queries) continue;
      const returned = actual.parameters?.find(item => item.parameterId === parameter.parameterId);
      requireCondition(returned, 'PARAMETER_READBACK_MISSING');
      for (const key of ['expression', 'value', 'enumName']) {
        if (parameter[key] !== undefined) requireCondition((returned[key] ?? (parameter[key] === false ? false : undefined)) === parameter[key], 'PARAMETER_READBACK_MISMATCH');
      }
    }
    if (expected.entities) {
      requireCondition(actual.entities?.length === expected.entities.length, 'SKETCH_ENTITY_COUNT_MISMATCH');
      for (const entity of expected.entities) {
        const returned = actual.entities.find(item => item.entityId === entity.entityId);
        requireCondition(returned?.geometry?.btType === entity.geometry.btType, 'SKETCH_GEOMETRY_TYPE_MISMATCH');
        for (const [key, value] of Object.entries(entity.geometry)) {
          const alias = { xCenter: 'xcenter', yCenter: 'ycenter', xDir: 'xdir', yDir: 'ydir' }[key];
          if (typeof value === 'number') requireCondition(Math.abs((returned.geometry[key] ?? returned.geometry[alias] ?? (value === 0 ? 0 : NaN)) - value) < 1e-10, 'SKETCH_GEOMETRY_MISMATCH');
        }
        for (const key of ['startParam', 'endParam']) {
          if (entity[key] !== undefined) requireCondition(Math.abs((returned[key] ?? (entity[key] === 0 ? 0 : NaN)) - entity[key]) < 1e-10, 'SKETCH_SEGMENT_MISMATCH');
        }
      }
    }
    results.push({ key: entry.key, featureId, status: status.featureStatus, parameterReadback: 'MATCH' });
  }
  return results;
}

export function boundsMm(response) {
  const low = [response?.lowX, response?.lowY, response?.lowZ];
  const high = [response?.highX, response?.highY, response?.highZ];
  requireCondition([...low, ...high].every(Number.isFinite), 'BOUNDING_BOX_SCHEMA_UNSUPPORTED');
  return { low: low.map(value => value * 1000), high: high.map(value => value * 1000) };
}

export function near(actual, expected, tolerance = 0.02) {
  return Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
}

export function inspectPart(part, partId, box, body) {
  const measured = boundsMm(box);
  const boundsMatch = ['low', 'high'].every(side => measured[side].every((value, index) => near(value, part.boundsMm[side][index])));
  requireCondition(body?.type === 'SOLID' && Array.isArray(body.faces), 'BODY_DETAILS_SCHEMA_UNSUPPORTED');
  const cylinders = body.faces.filter(face => face.surface?.type === 'CYLINDER').map(face => ({
    faceId: checkedId(face.id),
    radiusMm: face.surface.radius * 1000,
    centerYMm: face.surface.origin?.y * 1000,
    centerZMm: face.surface.origin?.z * 1000,
    axisX: face.surface.axis?.x,
    axisY: face.surface.axis?.y ?? 0,
    axisZ: face.surface.axis?.z ?? 0,
    lowX: face.box?.minCorner?.x * 1000,
    highX: face.box?.maxCorner?.x * 1000,
    areaMm2: face.area * 1000000,
  }));
  const expectedLength = part.boundsMm.high[0] - part.boundsMm.low[0];
  const holes = part.holes.map(hole => {
    const matches = cylinders.filter(surface => near(surface.radiusMm, hole.diameterMm / 2)
      && near(surface.centerYMm, hole.centerYZMm[0]) && near(surface.centerZMm, hole.centerYZMm[1])
      && near(Math.abs(surface.axisX), 1, 1e-8) && near(surface.axisY, 0, 1e-8) && near(surface.axisZ, 0, 1e-8)
      && near(surface.lowX, part.boundsMm.low[0]) && near(surface.highX, part.boundsMm.high[0])
      && near(surface.areaMm2, Math.PI * hole.diameterMm * expectedLength, 1));
    return { expected: hole, throughBoreVerified: matches.length === 1, matchingFaceIds: matches.map(surface => surface.faceId) };
  });
  const outerCylinderCount = /Roller|Shaft|coralReference/.test(part.key) ? 1 : 0;
  return {
    key: part.key, partId, boundsMm: measured, boundsMatch,
    cylinders, holes, holesMatch: holes.every(hole => hole.throughBoreVerified) && cylinders.length === part.holes.length + outerCylinderCount,
  };
}