import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { trialDirectory } from './safety.mjs';

export async function loadBenchmark() {
  return JSON.parse(await readFile(join(trialDirectory, '../../benchmark/intake.json'), 'utf8'));
}

const rounded = value => Number(value.toFixed(6));

export function expectations(specification, revision = false) {
  const dimensions = { ...specification.baseline, ...(revision ? specification.revision : {}) };
  const halfWidth = dimensions.innerWidthMm / 2;
  const rearY = dimensions.frontRollerYMm + dimensions.rollerDiameterMm + dimensions.rollerGapMm;
  const cylinderBounds = (length, diameter, centerY, centerZ) => ({
    min: [-length / 2, centerY - diameter / 2, centerZ - diameter / 2].map(rounded),
    max: [length / 2, centerY + diameter / 2, centerZ + diameter / 2].map(rounded),
  });
  const plateHoles = [
    { centerYZMm: [dimensions.frontRollerYMm, dimensions.rollerZMm], diameterMm: dimensions.shaftHoleDiameterMm },
    { centerYZMm: [rearY, dimensions.rollerZMm], diameterMm: dimensions.shaftHoleDiameterMm },
    ...dimensions.crossmemberCentersYZMm.map(centerYZMm => ({ centerYZMm, diameterMm: dimensions.mountHoleDiameterMm })),
    { centerYZMm: dimensions.pivotCenterYZMm, diameterMm: dimensions.pivotHoleDiameterMm },
  ];
  const parts = [
    { name: 'leftPlate', boundsMm: { min: [-halfWidth - dimensions.plateThicknessMm, 0, dimensions.plateBottomZMm].map(rounded), max: [-halfWidth, dimensions.plateLengthMm, dimensions.plateBottomZMm + dimensions.plateHeightMm].map(rounded) }, throughHoles: plateHoles },
    { name: 'rightPlate', boundsMm: { min: [halfWidth, 0, dimensions.plateBottomZMm].map(rounded), max: [halfWidth + dimensions.plateThicknessMm, dimensions.plateLengthMm, dimensions.plateBottomZMm + dimensions.plateHeightMm].map(rounded) }, throughHoles: plateHoles },
  ];
  const sleeveLength = dimensions.innerWidthMm - 2 * dimensions.rollerSideClearanceMm;
  const shaftLength = dimensions.innerWidthMm + 2 * (dimensions.plateThicknessMm + dimensions.shaftEndExtensionMm);
  for (const [label, centerY] of [['front', dimensions.frontRollerYMm], ['rear', rearY]]) {
    parts.push({ name: `${label}Roller`, boundsMm: cylinderBounds(sleeveLength, dimensions.rollerDiameterMm, centerY, dimensions.rollerZMm), boreDiameterMm: dimensions.shaftDiameterMm });
    parts.push({ name: `${label}Shaft`, boundsMm: cylinderBounds(shaftLength, dimensions.shaftDiameterMm, centerY, dimensions.rollerZMm) });
  }
  dimensions.crossmemberCentersYZMm.forEach(([centerY, centerZ], index) => {
    const halfSize = dimensions.crossmemberSizeMm / 2;
    parts.push({ name: index === 0 ? 'frontCrossmember' : 'rearCrossmember', boundsMm: { min: [-halfWidth, centerY - halfSize, centerZ - halfSize].map(rounded), max: [halfWidth, centerY + halfSize, centerZ + halfSize].map(rounded) } });
  });
  const coral = specification.coralReference;
  parts.push({ name: 'coralReference', nonBom: true, boundsMm: cylinderBounds(coral.lengthMm, coral.outerDiameterMm, coral.centerYMm, coral.centerZMm), boreDiameterMm: coral.innerDiameterMm });
  return {
    status: 'local-expectations-only-not-server-measurements', units: 'mm',
    dimensions, rearRollerYMm: rounded(rearY), sleeveLengthMm: rounded(sleeveLength), shaftLengthMm: rounded(shaftLength),
    expectedSolidCount: parts.length, parts,
    serverMeasurements: null, renderedImage: null, stepExport: null,
  };
}

export function featureScript(specification) {
  return `FeatureScript 2144;
import(path : "onshape/std/geometry.fs", version : "2144.0");

function cylinder(context is Context, bodyId is Id, firstX, lastX, centerY, centerZ, diameter)
{
    fCylinder(context, bodyId, {
        "bottomCenter" : vector(firstX, centerY, centerZ) * millimeter,
        "topCenter" : vector(lastX, centerY, centerZ) * millimeter,
        "radius" : diameter / 2 * millimeter
    });
}

function bore(context is Context, operationId is Id, target is Query, firstX, lastX, centerY, centerZ, diameter)
{
    cylinder(context, operationId + "tool", firstX - 1, lastX + 1, centerY, centerZ, diameter);
    opBoolean(context, operationId + "subtract", {
        "tools" : qCreatedBy(operationId + "tool", EntityType.BODY),
        "targets" : target,
        "operationType" : BooleanOperationType.SUBTRACTION
    });
}

function nameBody(context is Context, bodyId is Id, name is string)
{
    setProperty(context, { "entities" : qCreatedBy(bodyId, EntityType.BODY), "propertyType" : PropertyType.NAME, "value" : name });
}

function plate(context is Context, plateId is Id, firstX, lastX, dimensions is map, rearY, name is string)
{
    const bodyId = plateId + "blank";
    fCuboid(context, bodyId, {
        "corner1" : vector(firstX, 0, dimensions.plateBottomZMm) * millimeter,
        "corner2" : vector(lastX, dimensions.plateLengthMm, dimensions.plateBottomZMm + dimensions.plateHeightMm) * millimeter
    });
    const holes = [
        [dimensions.frontRollerYMm, dimensions.rollerZMm, dimensions.shaftHoleDiameterMm],
        [rearY, dimensions.rollerZMm, dimensions.shaftHoleDiameterMm],
        [dimensions.crossmemberCentersYZMm[0][0], dimensions.crossmemberCentersYZMm[0][1], dimensions.mountHoleDiameterMm],
        [dimensions.crossmemberCentersYZMm[1][0], dimensions.crossmemberCentersYZMm[1][1], dimensions.mountHoleDiameterMm],
        [dimensions.pivotCenterYZMm[0], dimensions.pivotCenterYZMm[1], dimensions.pivotHoleDiameterMm]
    ];
    for (var index = 0; index < size(holes); index += 1)
    {
        const hole = holes[index];
        bore(context, plateId + ("hole" ~ index), qCreatedBy(bodyId, EntityType.BODY), firstX, lastX, hole[0], hole[1], hole[2]);
    }
    nameBody(context, bodyId, name);
}

function sleeve(context is Context, sleeveId is Id, length, outerDiameter, innerDiameter, centerY, centerZ, name is string)
{
    const bodyId = sleeveId + "blank";
    cylinder(context, bodyId, -length / 2, length / 2, centerY, centerZ, outerDiameter);
    bore(context, sleeveId + "bore", qCreatedBy(bodyId, EntityType.BODY), -length / 2, length / 2, centerY, centerZ, innerDiameter);
    nameBody(context, bodyId, name);
}

annotation { "Feature Type Name" : "FRC coral intake packaging" }
export const coralIntake = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Inner width" }
        isLength(definition.innerWidth, LENGTH_BOUNDS);
        annotation { "Name" : "Clear roller gap" }
        isLength(definition.rollerGap, LENGTH_BOUNDS);
    }
    {
        const dimensions = ${JSON.stringify(specification.baseline)};
        const coral = ${JSON.stringify(specification.coralReference)};
        const width = definition.innerWidth / millimeter;
        const gap = definition.rollerGap / millimeter;
        const halfWidth = width / 2;
        const rearY = dimensions.frontRollerYMm + dimensions.rollerDiameterMm + gap;
        const sleeveLength = width - 2 * dimensions.rollerSideClearanceMm;
        const shaftLength = width + 2 * (dimensions.plateThicknessMm + dimensions.shaftEndExtensionMm);
        plate(context, id + "leftPlate", -halfWidth - dimensions.plateThicknessMm, -halfWidth, dimensions, rearY, "leftPlate");
        plate(context, id + "rightPlate", halfWidth, halfWidth + dimensions.plateThicknessMm, dimensions, rearY, "rightPlate");
        const rollerCenters = [dimensions.frontRollerYMm, rearY];
        const prefixes = ["front", "rear"];
        for (var index = 0; index < 2; index += 1)
        {
            const prefix = prefixes[index];
            sleeve(context, id + (prefix ~ "Roller"), sleeveLength, dimensions.rollerDiameterMm, dimensions.shaftDiameterMm, rollerCenters[index], dimensions.rollerZMm, prefix ~ "Roller");
            const shaftId = id + (prefix ~ "Shaft");
            cylinder(context, shaftId, -shaftLength / 2, shaftLength / 2, rollerCenters[index], dimensions.rollerZMm, dimensions.shaftDiameterMm);
            nameBody(context, shaftId, prefix ~ "Shaft");
            const center = dimensions.crossmemberCentersYZMm[index];
            const halfSize = dimensions.crossmemberSizeMm / 2;
            const crossmemberId = id + (prefix ~ "Crossmember");
            fCuboid(context, crossmemberId, {
                "corner1" : vector(-halfWidth, center[0] - halfSize, center[1] - halfSize) * millimeter,
                "corner2" : vector(halfWidth, center[0] + halfSize, center[1] + halfSize) * millimeter
            });
            nameBody(context, crossmemberId, prefix ~ "Crossmember");
        }
        sleeve(context, id + "coralReference", coral.lengthMm, coral.outerDiameterMm, coral.innerDiameterMm, coral.centerYMm, coral.centerZMm, "coralReference");
        setProperty(context, { "entities" : qCreatedBy(id + "coralReference" + "blank", EntityType.BODY), "propertyType" : PropertyType.EXCLUDE_FROM_BOM, "value" : true });
    });
`;
}

export const measurementScript = `function(context is Context, queries) {
    const solids = evaluateQuery(context, qBodyType(qEverything(EntityType.BODY), BodyType.SOLID));
    var measurements = [];
    for (var solid in solids) {
        const bounds = evBox3d(context, { "topology" : solid, "tight" : true });
        measurements = append(measurements, {
            "name" : getProperty(context, { "entity" : solid, "propertyType" : PropertyType.NAME }),
            "minMm" : bounds.minCorner / millimeter,
            "maxMm" : bounds.maxCorner / millimeter
        });
    }
    return { "solidCount" : size(solids), "parts" : measurements };
}`;