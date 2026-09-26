FeatureScript 3070;
import(path : "onshape/std/geometry.fs", version : "3070.0");

annotation { "Feature Type Name" : "Local preflight left plate" }
export const localPreflightPlate = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Plate length" }
        isLength(definition.plateLength, { (millimeter) : [0.01, 320, 1000] } as LengthBoundSpec);
        annotation { "Name" : "Plate height" }
        isLength(definition.plateHeight, { (millimeter) : [0.01, 150, 1000] } as LengthBoundSpec);
        annotation { "Name" : "Plate thickness" }
        isLength(definition.plateThickness, { (millimeter) : [0.01, 6.35, 100] } as LengthBoundSpec);
        annotation { "Name" : "Inner width" }
        isLength(definition.innerWidth, { (millimeter) : [0.01, 340, 1000] } as LengthBoundSpec);
        annotation { "Name" : "Clear roller gap" }
        isLength(definition.rollerGap, { (millimeter) : [0, 100, 200] } as LengthBoundSpec);
        annotation { "Name" : "Shaft hole diameter" }
        isLength(definition.shaftHoleDiameter, { (millimeter) : [0.01, 12.9, 50] } as LengthBoundSpec);
        annotation { "Name" : "Mount hole diameter" }
        isLength(definition.mountHoleDiameter, { (millimeter) : [0.01, 6.6, 50] } as LengthBoundSpec);
        annotation { "Name" : "Pivot hole diameter" }
        isLength(definition.pivotHoleDiameter, { (millimeter) : [0.01, 12.9, 50] } as LengthBoundSpec);
        annotation { "Name" : "Pivot Y" }
        isLength(definition.pivotY, { (millimeter) : [0.01, 25, 1000] } as LengthBoundSpec);
        annotation { "Name" : "Pivot Z" }
        isLength(definition.pivotZ, { (millimeter) : [0.01, 130, 1000] } as LengthBoundSpec);
    }
    {
        const bottom = 12.7 * millimeter;
        const minX = -definition.innerWidth / 2 - definition.plateThickness;
        const maxX = -definition.innerWidth / 2;
        const rearY = (70 + 76.2) * millimeter + definition.rollerGap;
        const holes = [
            { "role" : "frontShaft", "center" : vector(70, 65) * millimeter, "diameter" : definition.shaftHoleDiameter },
            { "role" : "rearShaft", "center" : vector(rearY, 65 * millimeter), "diameter" : definition.shaftHoleDiameter },
            { "role" : "mount0", "center" : vector(140, 135) * millimeter, "diameter" : definition.mountHoleDiameter },
            { "role" : "mount1", "center" : vector(300, 135) * millimeter, "diameter" : definition.mountHoleDiameter },
            { "role" : "pivot", "center" : vector(definition.pivotY, definition.pivotZ), "diameter" : definition.pivotHoleDiameter }
        ];
        for (var holeIndex = 0; holeIndex < size(holes); holeIndex += 1)
        {
            const hole = holes[holeIndex];
            const radius = hole.diameter / 2;
            if (hole.center[0] - radius <= 0 * millimeter || hole.center[0] + radius >= definition.plateLength ||
                hole.center[1] - radius <= bottom || hole.center[1] + radius >= bottom + definition.plateHeight)
                throw regenError("Hole has no positive edge ligament");
            for (var otherIndex = 0; otherIndex < holeIndex; otherIndex += 1)
            {
                if (norm(hole.center - holes[otherIndex].center) <= (hole.diameter + holes[otherIndex].diameter) / 2)
                    throw regenError("Hole bores overlap");
            }
        }
        fCuboid(context, id + "blank", {
                    "corner1" : vector(minX, 0 * millimeter, bottom),
                    "corner2" : vector(maxX, definition.plateLength, bottom + definition.plateHeight)
                });
        const body = qCreatedBy(id + "blank", EntityType.BODY);
        for (var hole in holes)
        {
            const holeId = id + hole.role;
            fCylinder(context, holeId + "tool", {
                        "bottomCenter" : vector(minX - millimeter, hole.center[0], hole.center[1]),
                        "topCenter" : vector(maxX + millimeter, hole.center[0], hole.center[1]),
                        "radius" : hole.diameter / 2
                    });
            opBoolean(context, holeId + "subtract", {
                        "tools" : qCreatedBy(holeId + "tool", EntityType.BODY),
                        "targets" : body,
                        "operationType" : BooleanOperationType.SUBTRACTION,
                        "keepTools" : false
                    });
        }
        setProperty(context, { "entities" : body, "propertyType" : PropertyType.NAME, "value" : "leftPlate" });
        if (size(evaluateQuery(context, qBodyType(qCreatedBy(id, EntityType.BODY), BodyType.SOLID))) != 1)
            throw regenError("Expected one left plate solid");
    }, {
        "plateLength" : 320 * millimeter,
        "plateHeight" : 150 * millimeter,
        "plateThickness" : 6.35 * millimeter,
        "innerWidth" : 340 * millimeter,
        "rollerGap" : 100 * millimeter,
        "shaftHoleDiameter" : 12.9 * millimeter,
        "mountHoleDiameter" : 6.6 * millimeter,
        "pivotHoleDiameter" : 12.9 * millimeter,
        "pivotY" : 25 * millimeter,
        "pivotZ" : 130 * millimeter
    });
