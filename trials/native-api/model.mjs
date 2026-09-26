export function circle(entityId, centerMm, radiusMm) {
  return {
    btType: 'BTMSketchCurve-4',
    entityId,
    centerId: `${entityId}.center`,
    geometry: {
      btType: 'BTCurveGeometryCircle-115',
      xCenter: centerMm[0] / 1000,
      yCenter: centerMm[1] / 1000,
      radius: radiusMm / 1000,
      xDir: 1,
      yDir: 0,
      clockwise: false,
    },
  };
}

export function queryParameter(parameterId, queryString) {
  return {
    btType: 'BTMParameterQueryList-148', parameterId,
    queries: [{ btType: 'BTMIndividualQuery-138', queryString }],
  };
}

export function enumParameter(parameterId, enumName, value) {
  return { btType: 'BTMParameterEnum-145', parameterId, enumName, value };
}

export function quantity(parameterId, valueMm) {
  return { btType: 'BTMParameterQuantity-147', parameterId, expression: `${valueMm} mm` };
}

export function sketch(name, entities, planeId = 'Right') {
  return {
    btType: 'BTMSketch-151', featureType: 'newSketch', name,
    parameters: [queryParameter('sketchPlane', `query=qCreatedBy(makeId(${JSON.stringify(planeId)}), EntityType.FACE);`)],
    entities, constraints: [], suppressed: false,
  };
}

export function extrude(name, sketchId, depthMm) {
  return {
    btType: 'BTMFeature-134', featureType: 'extrude', name, suppressed: false,
    parameters: [
      enumParameter('bodyType', 'ExtendedToolBodyType', 'SOLID'),
      enumParameter('operationType', 'NewBodyOperationType', 'NEW'),
      {
        btType: 'BTMParameterQueryList-148', parameterId: 'entities',
        queries: [{ btType: 'BTMIndividualSketchRegionQuery-140', featureId: sketchId }],
      },
      enumParameter('endBound', 'BoundingType', 'BLIND'),
      quantity('depth', depthMm),
    ],
  };
}

export function booleanParameter(parameterId, value) {
  return { btType: 'BTMParameterBoolean-144', parameterId, value };
}

export function rectangle(minimum, maximum) {
  const corners = [minimum, [maximum[0], minimum[1]], maximum, [minimum[0], maximum[1]]];
  return corners.map((start, index) => {
    const end = corners[(index + 1) % corners.length];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const entityId = `edge${index}`;
    return {
      btType: 'BTMSketchCurveSegment-155', entityId,
      startPointId: `${entityId}.start`, endPointId: `${entityId}.end`,
      startParam: 0, endParam: length / 1000,
      geometry: {
        btType: 'BTCurveGeometryLine-117', pntX: start[0] / 1000, pntY: start[1] / 1000,
        dirX: (end[0] - start[0]) / length, dirY: (end[1] - start[1]) / length,
      },
    };
  });
}

export function buildPlan(spec, stage = 'baseline') {
  if (!['baseline', 'revision'].includes(stage) || spec.units !== 'mm') throw new Error('Invalid stage or units');
  const dimensions = { ...spec.baseline, ...(stage === 'revision' ? spec.revision : {}) };
  for (const value of Object.values(dimensions).filter(value => typeof value === 'number')) {
    if (!Number.isFinite(value) || value <= 0) throw new Error('Expected positive finite dimensions');
  }
  const rearY = dimensions.frontRollerYMm + dimensions.rollerDiameterMm + dimensions.rollerGapMm;
  const halfWidth = dimensions.innerWidthMm / 2;
  const rollerLength = dimensions.innerWidthMm - 2 * dimensions.rollerSideClearanceMm;
  const shaftLength = dimensions.innerWidthMm + 2 * (dimensions.plateThicknessMm + dimensions.shaftEndExtensionMm);
  if (rollerLength <= 0 || dimensions.shaftDiameterMm >= dimensions.rollerDiameterMm) throw new Error('Invalid roller geometry');
  const plateHoles = [
    { centerYZMm: [dimensions.frontRollerYMm, dimensions.rollerZMm], diameterMm: dimensions.shaftHoleDiameterMm },
    { centerYZMm: [rearY, dimensions.rollerZMm], diameterMm: dimensions.shaftHoleDiameterMm },
    ...dimensions.crossmemberCentersYZMm.map(centerYZMm => ({ centerYZMm, diameterMm: dimensions.mountHoleDiameterMm })),
    { centerYZMm: dimensions.pivotCenterYZMm, diameterMm: dimensions.pivotHoleDiameterMm },
  ];
  const parts = [];
  const features = [];
  function addPart(key, xRangeMm, outline, holes = [], nonBom = false) {
    const name = nonBom ? `${key} [REFERENCE - NON-BOM]` : key;
    const minYZ = outline.radiusMm === undefined ? outline.minimum : outline.center.map(value => value - outline.radiusMm);
    const maxYZ = outline.radiusMm === undefined ? outline.maximum : outline.center.map(value => value + outline.radiusMm);
    const entities = outline.radiusMm === undefined ? rectangle(minYZ, maxYZ) : [circle('outer', outline.center, outline.radiusMm)];
    entities.push(...holes.map((hole, index) => circle(`hole${index}`, hole.centerYZMm, hole.diameterMm / 2)));
    const area = outline.radiusMm === undefined ? (maxYZ[0] - minYZ[0]) * (maxYZ[1] - minYZ[1]) : Math.PI * outline.radiusMm ** 2;
    const profileKey = `${key}.profile`;
    const solid = extrude(name, `$feature:${profileKey}`, xRangeMm[1] - xRangeMm[0]);
    solid.parameters = solid.parameters.filter(parameter => parameter.parameterId !== 'entities');
    solid.parameters.push(
      queryParameter('entities', `query=qSketchRegion(makeId("$feature:${profileKey}"), true);`),
      booleanParameter('symmetric', false),
      booleanParameter('oppositeDirection', false),
      booleanParameter('startOffset', xRangeMm[0] !== 0),
      enumParameter('startOffsetBound', 'StartOffsetType', 'BLIND'),
      quantity('startOffsetDistance', Math.abs(xRangeMm[0])),
      booleanParameter('startOffsetOppositeDirection', xRangeMm[0] < 0),
    );
    features.push({ key: profileKey, feature: sketch(`${name} profile`, entities) }, { key: `${key}.solid`, feature: solid });
    parts.push({
      key, name, nonBom, boundsMm: { low: [xRangeMm[0], ...minYZ], high: [xRangeMm[1], ...maxYZ] },
      holes, expectedVolumeMm3: (area - holes.reduce((sum, hole) => sum + Math.PI * (hole.diameterMm / 2) ** 2, 0)) * (xRangeMm[1] - xRangeMm[0]),
    });
  }
  const plateOutline = { minimum: [0, dimensions.plateBottomZMm], maximum: [dimensions.plateLengthMm, dimensions.plateBottomZMm + dimensions.plateHeightMm] };
  addPart('leftPlate', [-halfWidth - dimensions.plateThicknessMm, -halfWidth], plateOutline, plateHoles);
  addPart('rightPlate', [halfWidth, halfWidth + dimensions.plateThicknessMm], plateOutline, plateHoles);
  for (const [label, centerY] of [['front', dimensions.frontRollerYMm], ['rear', rearY]]) {
    const center = [centerY, dimensions.rollerZMm];
    addPart(`${label}Roller`, [-rollerLength / 2, rollerLength / 2], { center, radiusMm: dimensions.rollerDiameterMm / 2 }, [{ centerYZMm: center, diameterMm: dimensions.shaftDiameterMm }]);
  }
  for (const [label, centerY] of [['front', dimensions.frontRollerYMm], ['rear', rearY]]) {
    addPart(`${label}Shaft`, [-shaftLength / 2, shaftLength / 2], { center: [centerY, dimensions.rollerZMm], radiusMm: dimensions.shaftDiameterMm / 2 });
  }
  dimensions.crossmemberCentersYZMm.forEach((center, index) => {
    const halfSize = dimensions.crossmemberSizeMm / 2;
    addPart(`${index === 0 ? 'front' : 'rear'}Crossmember`, [-halfWidth, halfWidth], {
      minimum: center.map(value => value - halfSize), maximum: center.map(value => value + halfSize),
    });
  });
  const coral = spec.coralReference;
  addPart('coralReference', [-coral.lengthMm / 2, coral.lengthMm / 2], {
    center: [coral.centerYMm, coral.centerZMm], radiusMm: coral.outerDiameterMm / 2,
  }, [{ centerYZMm: [coral.centerYMm, coral.centerZMm], diameterMm: coral.innerDiameterMm }], true);
  if (JSON.stringify(parts.map(part => part.key)) !== JSON.stringify(spec.requiredParts) || plateHoles.length !== spec.plateHolesPerSide) throw new Error('Benchmark shape changed');
  return {
    benchmark: spec.id, stage, evidence: 'OFFLINE_PREDICTION_NOT_SERVER_CAD',
    dimensions, predicted: { solidCount: parts.length, nativeFeatureCount: features.length, rearRollerYMm: rearY, rollerLengthMm: rollerLength, shaftLengthMm: shaftLength, parts },
    features,
  };
}

export function bindFeature(feature, ids) {
  function bind(value) {
    if (typeof value === 'string') return value.replace(/\$feature:([A-Za-z0-9_.]+)/g, (_, key) => {
      const id = ids[key];
      if (typeof id !== 'string' || !/^[A-Za-z0-9_.+-]+$/.test(id)) throw new Error(`Missing or unsafe feature binding: ${key}`);
      return id;
    });
    if (Array.isArray(value)) return value.map(bind);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, bind(item)]));
    return value;
  }
  return bind(feature);
}

export function revisionChanges(baseline, revision) {
  return revision.features.filter((entry, index) => {
    if (entry.key !== baseline.features[index]?.key) throw new Error('Revision must preserve feature topology');
    return JSON.stringify(entry.feature) !== JSON.stringify(baseline.features[index].feature);
  });
}