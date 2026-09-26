FeatureScript 3070;
import(path : "onshape/std/geometry.fs", version : "3070.0");

const WIDTH_BOUNDS = { (millimeter) : [100, 340, 1000] } as LengthBoundSpec;
const GAP_BOUNDS = { (millimeter) : [0, 100, 135.7] } as LengthBoundSpec;

const PLATE_THICKNESS = 6.35 * millimeter;
const PLATE_LENGTH = 320 * millimeter;
const PLATE_HEIGHT = 150 * millimeter;
const PLATE_BOTTOM = 12.7 * millimeter;
const ROLLER_DIAMETER = 76.2 * millimeter;
const SIDE_CLEARANCE = 5 * millimeter;
const FRONT_Y = 70 * millimeter;
const ROLLER_Z = 65 * millimeter;
const SHAFT_DIAMETER = 12.7 * millimeter;
const SHAFT_HOLE_DIAMETER = 12.9 * millimeter;
const SHAFT_EXTENSION = 12.7 * millimeter;
const CROSS_SIZE = 25.4 * millimeter;
const MOUNT_HOLE_DIAMETER = 6.6 * millimeter;
const PIVOT_HOLE_DIAMETER = 12.9 * millimeter;
const CORAL_OUTER_DIAMETER = 114.3 * millimeter;
const CORAL_INNER_DIAMETER = 101.6 * millimeter;
const CORAL_LENGTH = 301.625 * millimeter;
const CORAL_Y = -110 * millimeter;
const CORAL_Z = 57.15 * millimeter;

function nameBody(context is Context, body is Query, role is string)
{
    setProperty(context, {
                "entities" : body,
                "propertyType" : PropertyType.NAME,
                "value" : role == "coralReference" ? "coralReference [REFERENCE - NON-BOM]" : role
            });
    setAttribute(context, {
                "entities" : body,
                "name" : "featurescriptIntake",
                "attribute" : { "role" : role }
            });
}

function cylinderAlongX(context is Context, id is Id, minX is ValueWithUnits,
        maxX is ValueWithUnits, centerY is ValueWithUnits, centerZ is ValueWithUnits,
        radius is ValueWithUnits)
{
    fCylinder(context, id, {
                "bottomCenter" : vector(minX, centerY, centerZ),
                "topCenter" : vector(maxX, centerY, centerZ),
                "radius" : radius
            });
}

function makePlate(context is Context, id is Id, minX is ValueWithUnits,
        rearY is ValueWithUnits, role is string)
{
    fCuboid(context, id + "blank", {
                "corner1" : vector(minX, 0 * millimeter, PLATE_BOTTOM),
                "corner2" : vector(minX + PLATE_THICKNESS, PLATE_LENGTH, PLATE_BOTTOM + PLATE_HEIGHT)
            });
    const body = qCreatedBy(id + "blank", EntityType.BODY);
    const holes = [
        { "role" : "frontShaft", "center" : vector(FRONT_Y, ROLLER_Z), "diameter" : SHAFT_HOLE_DIAMETER },
        { "role" : "rearShaft", "center" : vector(rearY, ROLLER_Z), "diameter" : SHAFT_HOLE_DIAMETER },
        { "role" : "frontMount", "center" : vector(140, 135) * millimeter, "diameter" : MOUNT_HOLE_DIAMETER },
        { "role" : "rearMount", "center" : vector(300, 135) * millimeter, "diameter" : MOUNT_HOLE_DIAMETER },
        { "role" : "pivot", "center" : vector(25, 130) * millimeter, "diameter" : PIVOT_HOLE_DIAMETER }
    ];
    for (var hole in holes)
    {
        const holeId = id + hole.role;
        cylinderAlongX(context, holeId + "tool", minX - millimeter,
                minX + PLATE_THICKNESS + millimeter,
                hole.center[0], hole.center[1], hole.diameter / 2);
        opBoolean(context, holeId + "subtract", {
                    "tools" : qCreatedBy(holeId + "tool", EntityType.BODY),
                    "targets" : body,
                    "operationType" : BooleanOperationType.SUBTRACTION,
                    "keepTools" : false
                });
    }
    nameBody(context, body, role);
}

function makeTube(context is Context, id is Id, tubeLength is ValueWithUnits,
        centerY is ValueWithUnits, centerZ is ValueWithUnits,
        outerDiameter is ValueWithUnits, innerDiameter is ValueWithUnits, role is string)
{
    cylinderAlongX(context, id + "blank", -tubeLength / 2, tubeLength / 2,
            centerY, centerZ, outerDiameter / 2);
    cylinderAlongX(context, id + "boreTool", -tubeLength / 2 - millimeter,
            tubeLength / 2 + millimeter, centerY, centerZ, innerDiameter / 2);
    const body = qCreatedBy(id + "blank", EntityType.BODY);
    opBoolean(context, id + "subtract", {
                "tools" : qCreatedBy(id + "boreTool", EntityType.BODY),
                "targets" : body,
                "operationType" : BooleanOperationType.SUBTRACTION,
                "keepTools" : false
            });
    nameBody(context, body, role);
}

annotation { "Feature Type Name" : "FRC coral ground intake" }
export const coralGroundIntake = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Inner width" }
        isLength(definition.innerWidth, WIDTH_BOUNDS);
        annotation { "Name" : "Clear roller gap" }
        isLength(definition.rollerGap, GAP_BOUNDS);
    }
    {
        const width = definition.innerWidth;
        const rearY = FRONT_Y + ROLLER_DIAMETER + definition.rollerGap;
        const rollerLength = width - 2 * SIDE_CLEARANCE;
        const shaftLength = width + 2 * PLATE_THICKNESS + 2 * SHAFT_EXTENSION;

        makePlate(context, id + "leftPlate", -width / 2 - PLATE_THICKNESS, rearY, "leftPlate");
        makePlate(context, id + "rightPlate", width / 2, rearY, "rightPlate");

        for (var roller in [
            { "role" : "frontRoller", "centerY" : FRONT_Y },
            { "role" : "rearRoller", "centerY" : rearY }
        ])
        {
            makeTube(context, id + roller.role, rollerLength, roller.centerY, ROLLER_Z,
                    ROLLER_DIAMETER, SHAFT_DIAMETER, roller.role);
        }
        for (var shaft in [
            { "role" : "frontShaft", "centerY" : FRONT_Y },
            { "role" : "rearShaft", "centerY" : rearY }
        ])
        {
            const shaftId = id + shaft.role;
            cylinderAlongX(context, shaftId + "blank", -shaftLength / 2, shaftLength / 2,
                    shaft.centerY, ROLLER_Z, SHAFT_DIAMETER / 2);
            nameBody(context, qCreatedBy(shaftId + "blank", EntityType.BODY), shaft.role);
        }
        for (var crossmember in [
            { "role" : "frontCrossmember", "center" : vector(140, 135) * millimeter },
            { "role" : "rearCrossmember", "center" : vector(300, 135) * millimeter }
        ])
        {
            const crossId = id + crossmember.role;
            fCuboid(context, crossId + "blank", {
                        "corner1" : vector(-width / 2, crossmember.center[0] - CROSS_SIZE / 2, crossmember.center[1] - CROSS_SIZE / 2),
                        "corner2" : vector(width / 2, crossmember.center[0] + CROSS_SIZE / 2, crossmember.center[1] + CROSS_SIZE / 2)
                    });
            nameBody(context, qCreatedBy(crossId + "blank", EntityType.BODY), crossmember.role);
        }
        makeTube(context, id + "coralReference", CORAL_LENGTH, CORAL_Y, CORAL_Z,
                CORAL_OUTER_DIAMETER, CORAL_INNER_DIAMETER, "coralReference");
        setProperty(context, {
                    "entities" : qCreatedBy(id + "coralReference" + "blank", EntityType.BODY),
                    "propertyType" : PropertyType.EXCLUDE_FROM_BOM,
                    "value" : true
                });
        if (size(evaluateQuery(context, qBodyType(qCreatedBy(id, EntityType.BODY), BodyType.SOLID))) != 9)
            throw regenError("Expected exactly nine intake solids");
    });