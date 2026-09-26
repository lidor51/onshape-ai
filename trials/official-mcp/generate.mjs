import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const FEATURESCRIPT_VERSION = 3070;
export const sha256 = text => createHash('sha256').update(text).digest('hex');

function sourceTokens(source) {
  return source.match(/"(?:\\[\s\S]|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|[A-Za-z_$][A-Za-z0-9_$]*|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||\+\+|--|::|->|[^\s]/g) ?? [];
}

export function compactFeatureScript(source) {
  const tokens = sourceTokens(source);
  let lineLength = 0;
  return tokens.map((token, index) => {
    const previous = tokens[index - 1];
    let prefix = '';
    if (index) {
      const joined = sourceTokens(previous + token);
      if (!(joined.length === 2 && joined[0] === previous && joined[1] === token)) prefix = ' ';
      if (token === '=' && tokens[index + 1] === 'defineFeature' || token === 'defineFeature' && previous === '=') prefix = ' ';
      if (previous.startsWith('//') || previous === ';' || previous === '}' || token === 'export' || token === 'annotation' ||
          lineLength + prefix.length + token.length > 1200) prefix = '\n';
    }
    lineLength = (prefix === '\n' ? 0 : lineLength + prefix.length) + token.length;
    return prefix + token;
  }).join('');
}

export function compactDispatchSource(task, entry = 'self-test', baseline = true) {
  return compactFeatureScript(dispatchSource(task, entry, baseline));
}

export async function loadLocalFixture() {
  const read = async phase => JSON.parse(await readFile(new URL(`./artifacts/${phase}.json`, import.meta.url), 'utf8'));
  const baseline = await read('baseline');
  const revision = await read('revision');
  if (!/^[a-f0-9]{64}$/.test(baseline.fixtureSha256) || baseline.fixtureSha256 !== revision.fixtureSha256 ||
      baseline.evidenceClass !== 'LOCAL_ANALYTIC_EXPECTATIONS_NOT_ONSHAPE_GEOMETRY' ||
      revision.evidenceClass !== baseline.evidenceClass) throw new Error('Official fixture snapshot provenance mismatch');
  return {
    task: { baseline: baseline.parameters, revision: revision.parameters, coralReference: baseline.coralReference,
      requiredParts: baseline.parts.map(part => part.name), plateHolesPerSide: baseline.expectedHolesPerPlate },
    fixtureSha256: baseline.fixtureSha256,
    fixtureProvenance: 'LOCAL_OFFICIAL_SNAPSHOTS_ORIGINAL_FIXTURE_NOT_REREAD',
  };
}

export function expectedModel(task, overrides = {}) {
  const parameters = { ...task.baseline, ...overrides };
  const reference = task.coralReference;
  const width = parameters.innerWidthMm;
  const thickness = parameters.plateThicknessMm;
  const rearY = parameters.frontRollerYMm + parameters.rollerDiameterMm + parameters.rollerGapMm;
  const holes = [
    { role: 'frontShaftBore', centerYZMm: [parameters.frontRollerYMm, parameters.rollerZMm], diameterMm: parameters.shaftHoleDiameterMm },
    { role: 'rearShaftBore', centerYZMm: [rearY, parameters.rollerZMm], diameterMm: parameters.shaftHoleDiameterMm },
    ...parameters.crossmemberCentersYZMm.map((centerYZMm, index) => ({
      role: index === 0 ? 'frontMountHole' : 'rearMountHole', centerYZMm, diameterMm: parameters.mountHoleDiameterMm,
    })),
    { role: 'pivotHole', centerYZMm: parameters.pivotCenterYZMm, diameterMm: parameters.pivotHoleDiameterMm },
  ];
  const parts = [];
  for (const [name, minX, maxX] of [
    ['leftPlate', -width / 2 - thickness, -width / 2], ['rightPlate', width / 2, width / 2 + thickness],
  ]) {
    parts.push({ name, kind: 'drilledPlate',
      minMm: [minX, 0, parameters.plateBottomZMm],
      maxMm: [maxX, parameters.plateLengthMm, parameters.plateBottomZMm + parameters.plateHeightMm],
      holes: structuredClone(holes), cylindricalFaces: holes.length,
      volumeMm3: thickness * (parameters.plateLengthMm * parameters.plateHeightMm -
        holes.reduce((area, hole) => area + Math.PI * (hole.diameterMm / 2) ** 2, 0)),
    });
  }
  function tube(name, length, centerY, centerZ, outerDiameter, innerDiameter = 0, nonBom = false) {
    parts.push({ name, kind: innerDiameter ? 'tube' : 'shaft', axis: 'x',
      minMm: [-length / 2, centerY - outerDiameter / 2, centerZ - outerDiameter / 2],
      maxMm: [length / 2, centerY + outerDiameter / 2, centerZ + outerDiameter / 2],
      centerYZMm: [centerY, centerZ], outerDiameterMm: outerDiameter, innerDiameterMm: innerDiameter,
      cylindricalFaces: innerDiameter ? 2 : 1, nonBom,
      volumeMm3: Math.PI * (outerDiameter ** 2 - innerDiameter ** 2) / 4 * length,
    });
  }
  for (const [position, centerY] of [['front', parameters.frontRollerYMm], ['rear', rearY]]) {
    tube(`${position}Roller`, width - 2 * parameters.rollerSideClearanceMm, centerY,
      parameters.rollerZMm, parameters.rollerDiameterMm, parameters.shaftDiameterMm);
  }
  for (const [position, centerY] of [['front', parameters.frontRollerYMm], ['rear', rearY]]) {
    tube(`${position}Shaft`, width + 2 * thickness + 2 * parameters.shaftEndExtensionMm, centerY,
      parameters.rollerZMm, parameters.shaftDiameterMm);
  }
  const halfSize = parameters.crossmemberSizeMm / 2;
  for (const [index, center] of parameters.crossmemberCentersYZMm.entries()) {
    parts.push({ name: index === 0 ? 'frontCrossmember' : 'rearCrossmember', kind: 'box',
      minMm: [-width / 2, center[0] - halfSize, center[1] - halfSize],
      maxMm: [width / 2, center[0] + halfSize, center[1] + halfSize],
      cylindricalFaces: 0, volumeMm3: width * parameters.crossmemberSizeMm ** 2,
    });
  }
  tube('coralReference', reference.lengthMm, reference.centerYMm, reference.centerZMm,
    reference.outerDiameterMm, reference.innerDiameterMm, true);
  return {
    evidenceClass: 'LOCAL_ANALYTIC_EXPECTATIONS_NOT_ONSHAPE_GEOMETRY',
    parameters, coralReference: reference,
    featureParametersMm: { innerWidth: width, rollerGap: parameters.rollerGapMm, plateThickness: thickness },
    rearRollerYMm: rearY, expectedPartCount: 9, expectedHolesPerPlate: task.plateHolesPerSide,
    parts,
  };
}

export function validateExpected(model, task) {
  if (model.parts.length !== 9 || model.parts.map(part => part.name).join('|') !== task.requiredParts.join('|')) {
    throw new Error('Required nine-part order or identity mismatch');
  }
  for (const part of model.parts) {
    if (!(part.volumeMm3 > 0) || part.minMm.some((minimum, axis) => !(part.maxMm[axis] > minimum))) {
      throw new Error(`Invalid dimensions: ${part.name}`);
    }
    if (part.holes) {
      if (part.holes.length !== task.plateHolesPerSide) throw new Error('Plate hole count mismatch');
      for (const [index, hole] of part.holes.entries()) {
        const radius = hole.diameterMm / 2;
        for (const [axis, coordinate] of hole.centerYZMm.entries()) {
          if (coordinate - radius <= part.minMm[axis + 1] || coordinate + radius >= part.maxMm[axis + 1]) {
            throw new Error('Hole intersects plate edge');
          }
        }
        for (const other of part.holes.slice(index + 1)) {
          if (Math.hypot(...hole.centerYZMm.map((value, axis) => value - other.centerYZMm[axis])) <=
              radius + other.diameterMm / 2) throw new Error('Overlapping plate holes');
        }
      }
    }
  }
  return true;
}

export function featureSource(task) {
  const parameters = task.baseline;
  const reference = task.coralReference;
  const centers = parameters.crossmemberCentersYZMm;
  return `FeatureScript ${FEATURESCRIPT_VERSION};
import(path : "onshape/std/common.fs", version : "${FEATURESCRIPT_VERSION}.0");

function makeBox(context is Context, operationId is Id, minimum is Vector, maximum is Vector)
{
    fCuboid(context, operationId, { "corner1" : minimum, "corner2" : maximum });
}

function makeCylinder(context is Context, operationId is Id, minimumX is ValueWithUnits,
    maximumX is ValueWithUnits, centerY is ValueWithUnits, centerZ is ValueWithUnits, radius is ValueWithUnits)
{
    fCylinder(context, operationId, {
        "bottomCenter" : vector(minimumX, centerY, centerZ),
        "topCenter" : vector(maximumX, centerY, centerZ),
        "radius" : radius
    });
}

function labelPart(context is Context, partId is Id, partName is string)
{
    setProperty(context, {
        "entities" : qCreatedBy(partId, EntityType.BODY),
        "propertyType" : PropertyType.NAME,
        "value" : partName
    });
}

function drilledPlate(context is Context, partId is Id, minimumX is ValueWithUnits,
    maximumX is ValueWithUnits, rearY is ValueWithUnits, partName is string)
{
    makeBox(context, partId + "stock",
        vector(minimumX, 0 * millimeter, ${parameters.plateBottomZMm} * millimeter),
        vector(maximumX, ${parameters.plateLengthMm} * millimeter, ${parameters.plateBottomZMm + parameters.plateHeightMm} * millimeter));
    const holes = [
        [${parameters.frontRollerYMm} * millimeter, ${parameters.rollerZMm} * millimeter, ${parameters.shaftHoleDiameterMm} * millimeter],
        [rearY, ${parameters.rollerZMm} * millimeter, ${parameters.shaftHoleDiameterMm} * millimeter],
        [${centers[0][0]} * millimeter, ${centers[0][1]} * millimeter, ${parameters.mountHoleDiameterMm} * millimeter],
        [${centers[1][0]} * millimeter, ${centers[1][1]} * millimeter, ${parameters.mountHoleDiameterMm} * millimeter],
        [${parameters.pivotCenterYZMm[0]} * millimeter, ${parameters.pivotCenterYZMm[1]} * millimeter, ${parameters.pivotHoleDiameterMm} * millimeter]
    ];
    var cutters = [];
    for (var holeIndex = 0; holeIndex < size(holes); holeIndex += 1)
    {
        const cutterId = partId + ("hole" ~ holeIndex);
        makeCylinder(context, cutterId, minimumX - millimeter, maximumX + millimeter,
            holes[holeIndex][0], holes[holeIndex][1], holes[holeIndex][2] / 2);
        cutters = append(cutters, qCreatedBy(cutterId, EntityType.BODY));
    }
    opBoolean(context, partId + "drill", {
        "targets" : qCreatedBy(partId + "stock", EntityType.BODY),
        "tools" : qUnion(cutters),
        "operationType" : BooleanOperationType.SUBTRACTION
    });
    labelPart(context, partId, partName);
}

function makeTube(context is Context, partId is Id, length is ValueWithUnits,
    centerY is ValueWithUnits, centerZ is ValueWithUnits,
    outerDiameter is ValueWithUnits, innerDiameter is ValueWithUnits, partName is string)
{
    makeCylinder(context, partId + "outside", -length / 2, length / 2, centerY, centerZ, outerDiameter / 2);
    makeCylinder(context, partId + "bore", -length / 2 - millimeter, length / 2 + millimeter,
        centerY, centerZ, innerDiameter / 2);
    opBoolean(context, partId + "hollow", {
        "targets" : qCreatedBy(partId + "outside", EntityType.BODY),
        "tools" : qCreatedBy(partId + "bore", EntityType.BODY),
        "operationType" : BooleanOperationType.SUBTRACTION
    });
    labelPart(context, partId, partName);
}

annotation { "Feature Type Name" : "Official MCP synthetic intake" }
export const officialIntake = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Inner width" }
        isLength(definition.innerWidth, { (millimeter) : [300, ${parameters.innerWidthMm}, 500] } as LengthBoundSpec);
        annotation { "Name" : "Clear roller gap" }
        isLength(definition.rollerGap, { (millimeter) : [80, ${parameters.rollerGapMm}, 105] } as LengthBoundSpec);
        annotation { "Name" : "Plate thickness" }
        isLength(definition.plateThickness, { (millimeter) : [3, ${parameters.plateThicknessMm}, 12] } as LengthBoundSpec);
    }
    {
        const halfWidth = definition.innerWidth / 2;
        const rearY = ${parameters.frontRollerYMm} * millimeter + ${parameters.rollerDiameterMm} * millimeter + definition.rollerGap;
        const rollerLength = definition.innerWidth - 2 * ${parameters.rollerSideClearanceMm} * millimeter;
        const shaftHalfLength = halfWidth + definition.plateThickness + ${parameters.shaftEndExtensionMm} * millimeter;
        drilledPlate(context, id + "leftPlate", -halfWidth - definition.plateThickness, -halfWidth, rearY, "leftPlate");
        drilledPlate(context, id + "rightPlate", halfWidth, halfWidth + definition.plateThickness, rearY, "rightPlate");
        makeTube(context, id + "frontRoller", rollerLength, ${parameters.frontRollerYMm} * millimeter,
            ${parameters.rollerZMm} * millimeter, ${parameters.rollerDiameterMm} * millimeter, ${parameters.shaftDiameterMm} * millimeter, "frontRoller");
        makeTube(context, id + "rearRoller", rollerLength, rearY,
            ${parameters.rollerZMm} * millimeter, ${parameters.rollerDiameterMm} * millimeter, ${parameters.shaftDiameterMm} * millimeter, "rearRoller");
        makeCylinder(context, id + "frontShaft", -shaftHalfLength, shaftHalfLength,
            ${parameters.frontRollerYMm} * millimeter, ${parameters.rollerZMm} * millimeter, ${parameters.shaftDiameterMm / 2} * millimeter);
        labelPart(context, id + "frontShaft", "frontShaft");
        makeCylinder(context, id + "rearShaft", -shaftHalfLength, shaftHalfLength,
            rearY, ${parameters.rollerZMm} * millimeter, ${parameters.shaftDiameterMm / 2} * millimeter);
        labelPart(context, id + "rearShaft", "rearShaft");
        makeBox(context, id + "frontCrossmember",
            vector(-halfWidth, ${centers[0][0] - parameters.crossmemberSizeMm / 2} * millimeter, ${centers[0][1] - parameters.crossmemberSizeMm / 2} * millimeter),
            vector(halfWidth, ${centers[0][0] + parameters.crossmemberSizeMm / 2} * millimeter, ${centers[0][1] + parameters.crossmemberSizeMm / 2} * millimeter));
        labelPart(context, id + "frontCrossmember", "frontCrossmember");
        makeBox(context, id + "rearCrossmember",
            vector(-halfWidth, ${centers[1][0] - parameters.crossmemberSizeMm / 2} * millimeter, ${centers[1][1] - parameters.crossmemberSizeMm / 2} * millimeter),
            vector(halfWidth, ${centers[1][0] + parameters.crossmemberSizeMm / 2} * millimeter, ${centers[1][1] + parameters.crossmemberSizeMm / 2} * millimeter));
        labelPart(context, id + "rearCrossmember", "rearCrossmember");
        makeTube(context, id + "coralReference", ${reference.lengthMm} * millimeter,
            ${reference.centerYMm} * millimeter, ${reference.centerZMm} * millimeter,
            ${reference.outerDiameterMm} * millimeter, ${reference.innerDiameterMm} * millimeter, "coralReference - NON-BOM staged PVC");
        setProperty(context, {
            "entities" : qCreatedBy(id + "coralReference", EntityType.BODY),
            "propertyType" : PropertyType.EXCLUDE_FROM_BOM,
            "value" : true
        });
        if (size(evaluateQuery(context, qBodyType(qCreatedBy(id, EntityType.BODY), BodyType.SOLID))) != 9)
            throw regenError("Expected nine separate intake solids");
      }, {
        "innerWidth" : ${parameters.innerWidthMm} * millimeter,
        "rollerGap" : ${parameters.rollerGapMm} * millimeter,
        "plateThickness" : ${parameters.plateThicknessMm} * millimeter
      });

export function officialIntakeEvidence(context is Context, featureId is Id) returns map
{
    const roles = ["leftPlate", "rightPlate", "frontRoller", "rearRoller", "frontShaft",
        "rearShaft", "frontCrossmember", "rearCrossmember", "coralReference"];
    var parts = [];
    for (var role in roles)
    {
        const bodies = qBodyType(qCreatedBy(featureId + role, EntityType.BODY), BodyType.SOLID);
        const bounds = evBox3d(context, { "topology" : bodies, "tight" : true });
        const cylinders = evaluateQuery(context, qGeometry(qOwnedByBody(bodies, EntityType.FACE), GeometryType.CYLINDER));
        var surfaces = [];
        for (var face in cylinders)
        {
            const surface = evSurfaceDefinition(context, { "face" : face });
          const faceBounds = evBox3d(context, { "topology" : face, "tight" : true });
            surfaces = append(surfaces, {
                "radiusMm" : surface.radius / millimeter,
                "axisOriginMm" : surface.coordSystem.origin / millimeter,
            "axisDirection" : surface.coordSystem.zAxis,
            "minMm" : faceBounds.minCorner / millimeter,
            "maxMm" : faceBounds.maxCorner / millimeter
            });
        }
        parts = append(parts, {
            "role" : role,
            "solidCount" : size(evaluateQuery(context, bodies)),
            "minMm" : bounds.minCorner / millimeter,
            "maxMm" : bounds.maxCorner / millimeter,
            "volumeMm3" : evVolume(context, { "entities" : bodies }) / millimeter^3,
            "cylinders" : surfaces
        });
    }
    return { "parts" : parts,
        "partCount" : size(evaluateQuery(context, qBodyType(qCreatedBy(featureId, EntityType.BODY), BodyType.SOLID))) };
}

  function officialIntakeExpected(baseline is boolean) returns map
  {
    const packed = baseline ? ${JSON.stringify(packedAssertionModel(task))} : ${JSON.stringify(packedAssertionModel(task, task.revision))};
    var parts = [];
    for (var row in packed[2])
    {
      var cylinders = [];
      for (var cylinder in row[4])
        cylinders = append(cylinders, { "radiusMm" : cylinder[0], "centerYZMm" : [cylinder[1], cylinder[2]] });
      parts = append(parts, { "role" : row[0], "minMm" : row[1], "maxMm" : row[2],
        "volumeMm3" : row[3], "cylinders" : cylinders });
    }
    return { "innerWidthMm" : packed[0], "rollerGapMm" : packed[1], "parts" : parts };
  }

  function officialIntakeParameters(baseline is boolean) returns map
  {
    return {
      "innerWidth" : (baseline ? ${parameters.innerWidthMm} : ${task.revision.innerWidthMm}) * millimeter,
      "rollerGap" : (baseline ? ${parameters.rollerGapMm} : ${task.revision.rollerGapMm}) * millimeter,
      "plateThickness" : ${parameters.plateThicknessMm} * millimeter
    };
  }

  function officialIntakeNear(actual is number, expected is number, tolerance is number, label is string)
  {
    if (abs(actual - expected) > tolerance)
      throw regenError(label ~ ": expected " ~ expected ~ ", measured " ~ actual);
  }

  function officialIntakeAssert(context is Context, featureId is Id, baseline is boolean) returns map
  {
    const expected = officialIntakeExpected(baseline);
    const measured = officialIntakeEvidence(context, featureId);
    if (measured.partCount != 9 || size(measured.parts) != 9)
      throw regenError("Expected nine measured solids per phase");
    for (var partIndex = 0; partIndex < size(expected.parts); partIndex += 1)
    {
      const actualPart = measured.parts[partIndex];
      const expectedPart = expected.parts[partIndex];
      if (actualPart.role != expectedPart.role || actualPart.solidCount != 1)
        throw regenError("Expected exactly one solid for " ~ expectedPart.role);
      for (var axisIndex = 0; axisIndex < 3; axisIndex += 1)
      {
        officialIntakeNear(actualPart.minMm[axisIndex], expectedPart.minMm[axisIndex], 0.00001, expectedPart.role ~ " minimum");
        officialIntakeNear(actualPart.maxMm[axisIndex], expectedPart.maxMm[axisIndex], 0.00001, expectedPart.role ~ " maximum");
      }
      officialIntakeNear(actualPart.volumeMm3, expectedPart.volumeMm3,
        max(0.001, expectedPart.volumeMm3 * 0.00000001), expectedPart.role ~ " volume");
      if (size(actualPart.cylinders) != size(expectedPart.cylinders))
        throw regenError(expectedPart.role ~ " cylindrical face count mismatch");
      for (var expectedCylinder in expectedPart.cylinders)
      {
        var matches = 0;
        for (var actualCylinder in actualPart.cylinders)
        {
          if (abs(actualCylinder.radiusMm - expectedCylinder.radiusMm) > 0.00001 ||
            abs(actualCylinder.axisOriginMm[1] - expectedCylinder.centerYZMm[0]) > 0.00001 ||
            abs(actualCylinder.axisOriginMm[2] - expectedCylinder.centerYZMm[1]) > 0.00001)
            continue;
          officialIntakeNear(abs(actualCylinder.axisDirection[0]), 1, 0.00000001, expectedPart.role ~ " cylinder axis X");
          officialIntakeNear(actualCylinder.axisDirection[1], 0, 0.00000001, expectedPart.role ~ " cylinder axis Y");
          officialIntakeNear(actualCylinder.axisDirection[2], 0, 0.00000001, expectedPart.role ~ " cylinder axis Z");
          officialIntakeNear(actualCylinder.minMm[0], expectedPart.minMm[0], 0.00001, expectedPart.role ~ " through start");
          officialIntakeNear(actualCylinder.maxMm[0], expectedPart.maxMm[0], 0.00001, expectedPart.role ~ " through end");
          matches += 1;
        }
        if (matches != 1)
          throw regenError(expectedPart.role ~ " missing or duplicated cylinder/bore");
      }
    }
    officialIntakeNear(measured.parts[1].minMm[0] - measured.parts[0].maxMm[0], expected.innerWidthMm, 0.00001, "inner width");
    officialIntakeNear(measured.parts[3].minMm[1] - measured.parts[2].maxMm[1], expected.rollerGapMm, 0.00001, "clear roller gap");
    return {
      "phase" : baseline ? "baseline" : "revision",
      "assertionsPassed" : true,
      "lengthToleranceMm" : 0.00001,
      "volumeToleranceMm3" : "max(0.001, expectedVolume * 1e-8)",
      "measurements" : measured
    };
  }
`;
}

  export function assertionModel(task, overrides = {}) {
    const model = expectedModel(task, overrides);
    validateExpected(model, task);
    return { innerWidthMm: model.parameters.innerWidthMm, rollerGapMm: model.parameters.rollerGapMm,
    parts: model.parts.map(part => ({ role: part.name, minMm: part.minMm, maxMm: part.maxMm,
      volumeMm3: part.volumeMm3,
      cylinders: part.holes ? part.holes.map(hole => ({ radiusMm: hole.diameterMm / 2, centerYZMm: hole.centerYZMm })) :
      part.outerDiameterMm ? [part.outerDiameterMm, part.innerDiameterMm].filter(diameter => diameter > 0)
        .map(diameter => ({ radiusMm: diameter / 2, centerYZMm: part.centerYZMm })) : [],
    })) };
  }

export function packedAssertionModel(task, overrides = {}) {
  const model = assertionModel(task, overrides);
  return [model.innerWidthMm, model.rollerGapMm, model.parts.map(part => [part.role, part.minMm, part.maxMm,
    part.volumeMm3, part.cylinders.map(cylinder => [cylinder.radiusMm, ...cylinder.centerYZMm])])];
}

  export function dispatchSource(task, entry = 'self-test', baseline = true) {
    if (!['self-test', 'retained'].includes(entry) || typeof baseline !== 'boolean') throw new Error('Invalid source entry');
    const selfTest = `annotation { "Feature Type Name" : "OfficialIntakeSelfTest" }
  export const officialIntakeSelfTest = defineFeature(function(context is Context, id is Id, definition is map)
    precondition {}
    {
      var phases = [];
      for (var baseline in [true, false])
      {
        const phaseId = id + (baseline ? "baseline" : "revision");
        officialIntake(context, phaseId, officialIntakeParameters(baseline));
        phases = append(phases, officialIntakeAssert(context, phaseId, baseline));
      }
      println({ "evidenceClass" : "TRANSIENT_SCRATCH_EVALUATION_NOT_PERSISTED", "persisted" : false,
        "solidsPerPhase" : 9, "evaluationTotalSolids" : 18, "phases" : phases });
    }, {});
  `;
    const retained = `annotation { "Feature Type Name" : "OfficialIntakeRetained" }
  export const officialIntakeRetained = defineFeature(function(context is Context, id is Id, definition is map)
    precondition {}
    {
      const intakeId = id + "intake";
      officialIntake(context, intakeId, officialIntakeParameters(officialIntakeDefaultBaseline));
      const measurements = officialIntakeAssert(context, intakeId, officialIntakeDefaultBaseline);
      println({ "evidenceClass" : "REGENERATION_MEASUREMENTS_NOT_PERSISTENCE_READBACK", "result" : measurements });
    }, {});

  `;
    const wrapper = entry === 'self-test' ? `${selfTest}\n${retained}` : `${retained}\n${selfTest}`;
    const implementation = featureSource(task).replace(
      'annotation { "Feature Type Name" : "Official MCP synthetic intake" }\nexport const officialIntake',
      'const officialIntake').replace('export function officialIntakeEvidence', 'function officialIntakeEvidence');
    return `${implementation}\nconst officialIntakeDefaultBaseline = ${baseline};\n${wrapper}`;
  }

export async function generate() {
  const { task, fixtureSha256, fixtureProvenance } = await loadLocalFixture();
  const source = featureSource(task);
  const sourceHash = sha256(source);
  const directory = new URL('./artifacts/', import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('./intake.fs', import.meta.url), source);
  for (const [phase, overrides] of [['baseline', {}], ['revision', task.revision]]) {
    const model = expectedModel(task, overrides);
    validateExpected(model, task);
    await writeFile(new URL(`${phase}.json`, directory), `${JSON.stringify({
      phase, fixtureSha256, fixtureProvenance, sourceSha256: sourceHash, ...model,
      serverCompilation: 'UNVERIFIED', serverMeasurements: null,
    }, null, 2)}\n`);
  }
  const testSource = compactDispatchSource(task);
  const baselineSource = compactDispatchSource(task, 'retained');
  const revisionSource = compactDispatchSource(task, 'retained', false);
  if ([testSource, baselineSource, revisionSource].some(text => text.length > 14000)) {
    throw new Error('Compact dispatch exceeds 14000 characters');
  }
  for (const [name, text] of [['test-feature.fs', testSource], ['baseline-feature.fs', baselineSource], ['revision-feature.fs', revisionSource]]) {
    await writeFile(new URL(name, directory), text);
  }
  await writeFile(new URL('test-feature.payload.json', directory), `${JSON.stringify({ code: testSource })}\n`);
  await writeFile(new URL('test-revision.payload.json', directory), `${JSON.stringify({ code: revisionSource })}\n`);
  await writeFile(new URL('create-geometry.payload.json', directory), `${JSON.stringify({
    feature_name: 'OfficialIntakeRetained', feature_code: baselineSource, clean: false,
  })}\n`);
  const payloadFiles = ['test-feature.fs', 'baseline-feature.fs', 'revision-feature.fs', 'test-feature.payload.json',
    'test-revision.payload.json', 'create-geometry.payload.json'];
  const files = [];
  for (const name of payloadFiles) {
    const bytes = await readFile(new URL(name, directory));
    files.push({ path: `trials/official-mcp/artifacts/${name}`, bytes: bytes.length, sha256: sha256(bytes) });
  }
  await writeFile(new URL('dispatch-manifest.json', directory), `${JSON.stringify({
    generatedAt: new Date().toISOString(), status: 'READY_FOR_PARENT_OFFICIAL_TOOL_DISPATCH_NOT_COMPILED',
    sourceVersion: FEATURESCRIPT_VERSION, parentReportedLiveLibraryVersion: 3070,
    versionPolicy: 'New source uses parent-verified live 3070; original 2500 was not read from a server Feature Studio',
    parentReportedNotes: 'No notes added yet.', compilerRepairsUsed: 1, compilerRepairCap: 2,
    parentReportedTestFeatureCalls: 1, parentReportedTestsRan: false,
    parentReportedFailureEvidence: 'trials/official-mcp/artifacts/compile-repair-1.json',
    officialCallsInThisContinuation: 0, authenticatedRequestsInCompactPass: 0,
    sourceSha256: sourceHash, fixtureSha256, fixtureProvenance,
    compaction: 'TOKEN_PRESERVING_BOUNDED_LINES_AND_LOSSLESS_EXPECTATION_TUPLES', maximumSourceCharacters: 14000,
    preferredSourceCharacters: 8000, preferredSourceSizeMet: [testSource, baselineSource, revisionSource].every(text => text.length <= 8000),
    maximumSourceLineCharacters: 1200,
    testEntry: 'officialIntakeSelfTest', retainedEntry: 'officialIntakeRetained', retainedDefaultBaseline: true,
    baselineFeatureParameters: {}, revisionMode: 'SOURCE_CONTROLLED_DEFAULT_SWITCH_NOT_PARAMETER_ONLY_EDIT',
    retainedUiControls: [], retainedUiLimitation: 'Empty wrapper controls; innerWidth/rollerGap/plateThickness belong to the inner feature only',
    onshapeCompilation: 'UNVERIFIED', serverMeasurements: null,
    maximumRetainedBranches: 2, plannedRetainedBranches: 1, clean: false,
    modelWrites: 0, persistedGeometryVerified: false, files,
  }, null, 2)}\n`);
  console.log(JSON.stringify({ generated: ['intake.fs', 'artifacts/baseline.json', 'artifacts/revision.json'],
    sourceSha256: sourceHash, dispatchFiles: files, onshapeCompilation: 'UNVERIFIED' }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generate();