FeatureScript 2931;
import(path : "onshape/std/geometry.fs", version : "2931.0");

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
        const dimensions = {"innerWidthMm":340,"plateThicknessMm":6.35,"plateLengthMm":320,"plateHeightMm":150,"plateBottomZMm":12.7,"rollerDiameterMm":76.2,"rollerGapMm":100,"rollerSideClearanceMm":5,"frontRollerYMm":70,"rollerZMm":65,"shaftDiameterMm":12.7,"shaftHoleDiameterMm":12.9,"shaftEndExtensionMm":12.7,"crossmemberSizeMm":25.4,"crossmemberCentersYZMm":[[140,135],[300,135]],"mountHoleDiameterMm":6.6,"pivotCenterYZMm":[25,130],"pivotHoleDiameterMm":12.9};
        const coral = {"outerDiameterMm":114.3,"innerDiameterMm":101.6,"lengthMm":301.625,"centerYMm":-110,"centerZMm":57.15,"note":"Nominal 4-inch Schedule 40 PVC, 11-7/8 inch long. Verify official tolerances before design release. Staged ahead of intake, not simulated contact."};
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
