FeatureScript 3070;
import(path : "onshape/std/geometry.fs", version : "3070.0");

annotation { "Feature Type Name" : "Concept A shared engineering" }
export const conceptAShared = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Pickup mouth width" }
        isLength(definition.mouthWidth, { (millimeter) : [480, 500, 520] } as LengthBoundSpec);
        annotation { "Name" : "Receiver height datum" }
        isLength(definition.receiverHeight, { (millimeter) : [300, 320, 360] } as LengthBoundSpec);
        annotation { "Name" : "Study only: COTS envelopes" }
        definition.includeCotsEnvelopes is boolean;
        annotation { "Name" : "Show nominal coral reference" }
        definition.includeCoralReference is boolean;
    }
    {
        const mouthWidth = definition.mouthWidth / millimeter;
        const receiverHeight = definition.receiverHeight / millimeter;
        if (true)
        {
        fCuboid(context, id + "part0primitive0", { "corner1" : vector(((((0 + 0)) + (-700/2))), ((((380 + 0)) + (-760/2))), ((((95 + 0)) + (-50/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (700/2))), ((((380 + 0)) + (760/2))), ((((95 + 0)) + (50/2)))) * millimeter });
        var body0 = qCreatedBy(id + "part0primitive0", EntityType.BODY);
        fCuboid(context, id + "part0primitive1", { "corner1" : vector(((((0 + 0)) + (-650/2))), ((((380 + 0)) + (-710/2))), ((((95 + 0)) + (-52/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (650/2))), ((((380 + 0)) + (710/2))), ((((95 + 0)) + (52/2)))) * millimeter });
        opBoolean(context, id + "part0cut1", { "tools" : qCreatedBy(id + "part0primitive1", EntityType.BODY), "targets" : body0, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCuboid(context, id + "part0primitive2", { "corner1" : vector(((((0 + 0)) + (-660/2))), ((((100 + 0)) + (-25/2))), ((((95 + 0)) + (-50/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (660/2))), ((((100 + 0)) + (25/2))), ((((95 + 0)) + (50/2)))) * millimeter });
        opBoolean(context, id + "part0union2", { "tools" : qUnion([body0, qCreatedBy(id + "part0primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body0 = qUnion([body0, qCreatedBy(id + "part0primitive2", EntityType.BODY), qCreatedBy(id + "part0union2", EntityType.BODY)]);
        fCuboid(context, id + "part0primitive3", { "corner1" : vector(((((0 + 0)) + (-660/2))), ((((440 + 0)) + (-25/2))), ((((95 + 0)) + (-50/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (660/2))), ((((440 + 0)) + (25/2))), ((((95 + 0)) + (50/2)))) * millimeter });
        opBoolean(context, id + "part0union3", { "tools" : qUnion([body0, qCreatedBy(id + "part0primitive3", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body0 = qUnion([body0, qCreatedBy(id + "part0primitive3", EntityType.BODY), qCreatedBy(id + "part0union3", EntityType.BODY)]);
        fCuboid(context, id + "part0primitive4", { "corner1" : vector(((((-220 + 0)) + (-30/2))), ((((440 + 0)) + (-30/2))), ((((173.5 + 0)) + (-107/2)))) * millimeter, "corner2" : vector(((((-220 + 0)) + (30/2))), ((((440 + 0)) + (30/2))), ((((173.5 + 0)) + (107/2)))) * millimeter });
        opBoolean(context, id + "part0union4", { "tools" : qUnion([body0, qCreatedBy(id + "part0primitive4", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body0 = qUnion([body0, qCreatedBy(id + "part0primitive4", EntityType.BODY), qCreatedBy(id + "part0union4", EntityType.BODY)]);
        fCuboid(context, id + "part0primitive5", { "corner1" : vector(((((220 + 0)) + (-30/2))), ((((440 + 0)) + (-30/2))), ((((173.5 + 0)) + (-107/2)))) * millimeter, "corner2" : vector(((((220 + 0)) + (30/2))), ((((440 + 0)) + (30/2))), ((((173.5 + 0)) + (107/2)))) * millimeter });
        opBoolean(context, id + "part0union5", { "tools" : qUnion([body0, qCreatedBy(id + "part0primitive5", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body0 = qUnion([body0, qCreatedBy(id + "part0primitive5", EntityType.BODY), qCreatedBy(id + "part0union5", EntityType.BODY)]);
        fCuboid(context, id + "part0primitive6", { "corner1" : vector(((((0 + 0)) + (-500/2))), ((((440 + 0)) + (-330/2))), ((((224 + 0)) + (-6/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (500/2))), ((((440 + 0)) + (330/2))), ((((224 + 0)) + (6/2)))) * millimeter });
        opBoolean(context, id + "part0union6", { "tools" : qUnion([body0, qCreatedBy(id + "part0primitive6", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body0 = qUnion([body0, qCreatedBy(id + "part0primitive6", EntityType.BODY), qCreatedBy(id + "part0union6", EntityType.BODY)]);
        setProperty(context, { "entities" : body0, "propertyType" : PropertyType.NAME, "value" : "chassis_reference" });
        if (size(evaluateQuery(context, body0)) != 1) throw regenError("Expected one solid: chassis_reference");
        }
        if (true)
        {
        fCuboid(context, id + "part1primitive0", { "corner1" : vector(((((0 + 1200)) + (-870/2))), ((((0 + 0)) + (-930/2))), ((((0 + 0)) + (-120/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (870/2))), ((((0 + 0)) + (930/2))), ((((0 + 0)) + (120/2)))) * millimeter });
        var body1 = qCreatedBy(id + "part1primitive0", EntityType.BODY);
        fCuboid(context, id + "part1primitive1", { "corner1" : vector(((((0 + 1200)) + (-700/2))), ((((0 + 0)) + (-760/2))), ((((0 + 0)) + (-122/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (700/2))), ((((0 + 0)) + (760/2))), ((((0 + 0)) + (122/2)))) * millimeter });
        opBoolean(context, id + "part1cut1", { "tools" : qCreatedBy(id + "part1primitive1", EntityType.BODY), "targets" : body1, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body1, "propertyType" : PropertyType.NAME, "value" : "bumper_keepout" });
        if (size(evaluateQuery(context, body1)) != 1) throw regenError("Expected one solid: bumper_keepout");
        }
        if (true)
        {
        fCuboid(context, id + "part2primitive0", { "corner1" : vector(((((0 + 2400)) + (-320/2))), ((((0 + 0)) + (-30/2))), (((((receiverHeight - 110) + 0)) + (-20/2)))) * millimeter, "corner2" : vector(((((0 + 2400)) + (320/2))), ((((0 + 0)) + (30/2))), (((((receiverHeight - 110) + 0)) + (20/2)))) * millimeter });
        var body2 = qCreatedBy(id + "part2primitive0", EntityType.BODY);
        fCuboid(context, id + "part2primitive1", { "corner1" : vector(((((-150 + 2400)) + (-20/2))), ((((0 + 0)) + (-30/2))), ((((((receiverHeight - 110) / 2) + 0)) + (-(receiverHeight - 110)/2)))) * millimeter, "corner2" : vector(((((-150 + 2400)) + (20/2))), ((((0 + 0)) + (30/2))), ((((((receiverHeight - 110) / 2) + 0)) + ((receiverHeight - 110)/2)))) * millimeter });
        opBoolean(context, id + "part2union1", { "tools" : qUnion([body2, qCreatedBy(id + "part2primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body2 = qUnion([body2, qCreatedBy(id + "part2primitive1", EntityType.BODY), qCreatedBy(id + "part2union1", EntityType.BODY)]);
        fCuboid(context, id + "part2primitive2", { "corner1" : vector(((((150 + 2400)) + (-20/2))), ((((0 + 0)) + (-30/2))), ((((((receiverHeight - 110) / 2) + 0)) + (-(receiverHeight - 110)/2)))) * millimeter, "corner2" : vector(((((150 + 2400)) + (20/2))), ((((0 + 0)) + (30/2))), ((((((receiverHeight - 110) / 2) + 0)) + ((receiverHeight - 110)/2)))) * millimeter });
        opBoolean(context, id + "part2union2", { "tools" : qUnion([body2, qCreatedBy(id + "part2primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body2 = qUnion([body2, qCreatedBy(id + "part2primitive2", EntityType.BODY), qCreatedBy(id + "part2union2", EntityType.BODY)]);
        setProperty(context, { "entities" : body2, "propertyType" : PropertyType.NAME, "value" : "receiver_reference" });
        if (size(evaluateQuery(context, body2)) != 1) throw regenError("Expected one solid: receiver_reference");
        }
        if (definition.includeCoralReference)
        {
        fCylinder(context, id + "part3primitive0", { "bottomCenter" : vector(((((0 + 3600)) + (-301.625/2))), ((0 + 0)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (301.625/2))), ((0 + 0)), ((0 + 0))) * millimeter, "radius" : 57.15 * millimeter });
        var body3 = qCreatedBy(id + "part3primitive0", EntityType.BODY);
        fCylinder(context, id + "part3primitive1", { "bottomCenter" : vector(((((0 + 3600)) + (-303.625/2))), ((0 + 0)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (303.625/2))), ((0 + 0)), ((0 + 0))) * millimeter, "radius" : 50.8 * millimeter });
        opBoolean(context, id + "part3cut1", { "tools" : qCreatedBy(id + "part3primitive1", EntityType.BODY), "targets" : body3, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body3, "propertyType" : PropertyType.NAME, "value" : "coral_reference" });
        if (size(evaluateQuery(context, body3)) != 1) throw regenError("Expected one solid: coral_reference");
        }
        if (true)
        {
        fCuboid(context, id + "part4primitive0", { "corner1" : vector(((((0 + 4800)) + (-500/2))), ((((0 + 0)) + (-380/2))), ((((0 + 0)) + (-6/2)))) * millimeter, "corner2" : vector(((((0 + 4800)) + (500/2))), ((((0 + 0)) + (380/2))), ((((0 + 0)) + (6/2)))) * millimeter });
        var body4 = qCreatedBy(id + "part4primitive0", EntityType.BODY);
        fCylinder(context, id + "part4primitive1", { "bottomCenter" : vector(((-220 + 4800)), ((-150 + 0)), ((((0 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((-220 + 4800)), ((-150 + 0)), ((((0 + 0)) + (8/2)))) * millimeter, "radius" : 3.3 * millimeter });
        opBoolean(context, id + "part4cut1", { "tools" : qCreatedBy(id + "part4primitive1", EntityType.BODY), "targets" : body4, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part4primitive2", { "bottomCenter" : vector(((-220 + 4800)), ((150 + 0)), ((((0 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((-220 + 4800)), ((150 + 0)), ((((0 + 0)) + (8/2)))) * millimeter, "radius" : 3.3 * millimeter });
        opBoolean(context, id + "part4cut2", { "tools" : qCreatedBy(id + "part4primitive2", EntityType.BODY), "targets" : body4, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part4primitive3", { "bottomCenter" : vector(((220 + 4800)), ((-150 + 0)), ((((0 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((220 + 4800)), ((-150 + 0)), ((((0 + 0)) + (8/2)))) * millimeter, "radius" : 3.3 * millimeter });
        opBoolean(context, id + "part4cut3", { "tools" : qCreatedBy(id + "part4primitive3", EntityType.BODY), "targets" : body4, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part4primitive4", { "bottomCenter" : vector(((220 + 4800)), ((150 + 0)), ((((0 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((220 + 4800)), ((150 + 0)), ((((0 + 0)) + (8/2)))) * millimeter, "radius" : 3.3 * millimeter });
        opBoolean(context, id + "part4cut4", { "tools" : qCreatedBy(id + "part4primitive4", EntityType.BODY), "targets" : body4, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part4primitive5", { "bottomCenter" : vector(((-88 + 4800)), ((0 + 0)), ((((0 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((-88 + 4800)), ((0 + 0)), ((((0 + 0)) + (8/2)))) * millimeter, "radius" : 7.45 * millimeter });
        opBoolean(context, id + "part4cut5", { "tools" : qCreatedBy(id + "part4primitive5", EntityType.BODY), "targets" : body4, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part4primitive6", { "bottomCenter" : vector(((88 + 4800)), ((0 + 0)), ((((0 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((88 + 4800)), ((0 + 0)), ((((0 + 0)) + (8/2)))) * millimeter, "radius" : 7.45 * millimeter });
        opBoolean(context, id + "part4cut6", { "tools" : qCreatedBy(id + "part4primitive6", EntityType.BODY), "targets" : body4, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body4, "propertyType" : PropertyType.NAME, "value" : "stage_deck" });
        if (size(evaluateQuery(context, body4)) != 1) throw regenError("Expected one solid: stage_deck");
        }
        if (true)
        {
        const sketch_part5primitive0 = newSketchOnPlane(context, id + "part5primitive0_sk", { "sketchPlane" : plane(vector(((((0 + 6000)) + -165)), ((0 + 0)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part5primitive0, "edge0", { "start" : vector(-50, -87) * millimeter, "end" : vector(50, -87) * millimeter });
        skLineSegment(sketch_part5primitive0, "edge1", { "start" : vector(50, -87) * millimeter, "end" : vector(50, -30.822305) * millimeter });
        skLineSegment(sketch_part5primitive0, "edge2", { "start" : vector(50, -30.822305) * millimeter, "end" : vector(0, -80.822305) * millimeter });
        skLineSegment(sketch_part5primitive0, "edge3", { "start" : vector(0, -80.822305) * millimeter, "end" : vector(-50, -30.822305) * millimeter });
        skLineSegment(sketch_part5primitive0, "edge4", { "start" : vector(-50, -30.822305) * millimeter, "end" : vector(-50, -87) * millimeter });
        skSolve(sketch_part5primitive0);
        opExtrude(context, id + "part5primitive0", { "entities" : qSketchRegion(id + "part5primitive0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 330 * millimeter });
        opDeleteBodies(context, id + "part5primitive0_clean", { "entities" : qCreatedBy(id + "part5primitive0_sk", EntityType.BODY) });
        var body5 = qCreatedBy(id + "part5primitive0", EntityType.BODY);
        setProperty(context, { "entities" : body5, "propertyType" : PropertyType.NAME, "value" : "cradle" });
        if (size(evaluateQuery(context, body5)) != 1) throw regenError("Expected one solid: cradle");
        }
        if (true)
        {
        const sketch_part6primitive0 = newSketchOnPlane(context, id + "part6primitive0_sk", { "sketchPlane" : plane(vector(((((0 + 0)) + -195)), ((0 + 1500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part6primitive0, "edge0", { "start" : vector(145, 385) * millimeter, "end" : vector(270, 250) * millimeter });
        skLineSegment(sketch_part6primitive0, "edge1", { "start" : vector(270, 250) * millimeter, "end" : vector(273, 253) * millimeter });
        skLineSegment(sketch_part6primitive0, "edge2", { "start" : vector(273, 253) * millimeter, "end" : vector(148, 388) * millimeter });
        skLineSegment(sketch_part6primitive0, "edge3", { "start" : vector(148, 388) * millimeter, "end" : vector(145, 385) * millimeter });
        skSolve(sketch_part6primitive0);
        opExtrude(context, id + "part6primitive0", { "entities" : qSketchRegion(id + "part6primitive0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 390 * millimeter });
        opDeleteBodies(context, id + "part6primitive0_clean", { "entities" : qCreatedBy(id + "part6primitive0_sk", EntityType.BODY) });
        var body6 = qCreatedBy(id + "part6primitive0", EntityType.BODY);
        fCuboid(context, id + "part6primitive1", { "corner1" : vector(((((-170 + 0)) + (-8/2))), ((((271 + 1500)) + (-8/2))), ((((244 + 0)) + (-22/2)))) * millimeter, "corner2" : vector(((((-170 + 0)) + (8/2))), ((((271 + 1500)) + (8/2))), ((((244 + 0)) + (22/2)))) * millimeter });
        opBoolean(context, id + "part6union1", { "tools" : qUnion([body6, qCreatedBy(id + "part6primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body6 = qUnion([body6, qCreatedBy(id + "part6primitive1", EntityType.BODY), qCreatedBy(id + "part6union1", EntityType.BODY)]);
        fCuboid(context, id + "part6primitive2", { "corner1" : vector(((((-170 + 0)) + (-30/2))), ((((292 + 1500)) + (-50/2))), ((((236 + 0)) + (-6/2)))) * millimeter, "corner2" : vector(((((-170 + 0)) + (30/2))), ((((292 + 1500)) + (50/2))), ((((236 + 0)) + (6/2)))) * millimeter });
        opBoolean(context, id + "part6union2", { "tools" : qUnion([body6, qCreatedBy(id + "part6primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body6 = qUnion([body6, qCreatedBy(id + "part6primitive2", EntityType.BODY), qCreatedBy(id + "part6union2", EntityType.BODY)]);
        fCuboid(context, id + "part6primitive3", { "corner1" : vector(((((170 + 0)) + (-8/2))), ((((271 + 1500)) + (-8/2))), ((((244 + 0)) + (-22/2)))) * millimeter, "corner2" : vector(((((170 + 0)) + (8/2))), ((((271 + 1500)) + (8/2))), ((((244 + 0)) + (22/2)))) * millimeter });
        opBoolean(context, id + "part6union3", { "tools" : qUnion([body6, qCreatedBy(id + "part6primitive3", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body6 = qUnion([body6, qCreatedBy(id + "part6primitive3", EntityType.BODY), qCreatedBy(id + "part6union3", EntityType.BODY)]);
        fCuboid(context, id + "part6primitive4", { "corner1" : vector(((((170 + 0)) + (-30/2))), ((((292 + 1500)) + (-50/2))), ((((236 + 0)) + (-6/2)))) * millimeter, "corner2" : vector(((((170 + 0)) + (30/2))), ((((292 + 1500)) + (50/2))), ((((236 + 0)) + (6/2)))) * millimeter });
        opBoolean(context, id + "part6union4", { "tools" : qUnion([body6, qCreatedBy(id + "part6primitive4", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body6 = qUnion([body6, qCreatedBy(id + "part6primitive4", EntityType.BODY), qCreatedBy(id + "part6union4", EntityType.BODY)]);
        setProperty(context, { "entities" : body6, "propertyType" : PropertyType.NAME, "value" : "transfer_ramp" });
        if (size(evaluateQuery(context, body6)) != 1) throw regenError("Expected one solid: transfer_ramp");
        }
        if (definition.includeCotsEnvelopes)
        {
        fCylinder(context, id + "part7primitive0", { "bottomCenter" : vector(((((0 + 1200)) + (-7.9502/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 1200)) + (7.9502/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 14.2875 * millimeter });
        var body7 = qCreatedBy(id + "part7primitive0", EntityType.BODY);
        const sketch_part7primitive1 = newSketchOnPlane(context, id + "part7primitive1_sk", { "sketchPlane" : plane(vector(((((0 + 1200)) + (-10/2))), ((0 + 1500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part7primitive1, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part7primitive1, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part7primitive1, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part7primitive1, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part7primitive1, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part7primitive1, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part7primitive1);
        opExtrude(context, id + "part7primitive1", { "entities" : qSketchRegion(id + "part7primitive1_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 10 * millimeter });
        opDeleteBodies(context, id + "part7primitive1_clean", { "entities" : qCreatedBy(id + "part7primitive1_sk", EntityType.BODY) });
        opBoolean(context, id + "part7cut1", { "tools" : qCreatedBy(id + "part7primitive1", EntityType.BODY), "targets" : body7, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body7, "propertyType" : PropertyType.NAME, "value" : "hex_bearing_envelope" });
        if (size(evaluateQuery(context, body7)) != 1) throw regenError("Expected one solid: hex_bearing_envelope");
        }
        if (definition.includeCotsEnvelopes)
        {
        fCylinder(context, id + "part8primitive0", { "bottomCenter" : vector(((((37.5 + 2400)) + (-75/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((37.5 + 2400)) + (75/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 23.7 * millimeter });
        var body8 = qCreatedBy(id + "part8primitive0", EntityType.BODY);
        fCylinder(context, id + "part8primitive1", { "bottomCenter" : vector(((((-1 + 2400)) + (-2/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((-1 + 2400)) + (2/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 9.525 * millimeter });
        opBoolean(context, id + "part8union1", { "tools" : qUnion([body8, qCreatedBy(id + "part8primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body8 = qUnion([body8, qCreatedBy(id + "part8primitive1", EntityType.BODY), qCreatedBy(id + "part8union1", EntityType.BODY)]);
        fCylinder(context, id + "part8primitive2", { "bottomCenter" : vector(((((-11 + 2400)) + (-22/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((-11 + 2400)) + (22/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 4 * millimeter });
        opBoolean(context, id + "part8union2", { "tools" : qUnion([body8, qCreatedBy(id + "part8primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body8 = qUnion([body8, qCreatedBy(id + "part8primitive2", EntityType.BODY), qCreatedBy(id + "part8union2", EntityType.BODY)]);
        setProperty(context, { "entities" : body8, "propertyType" : PropertyType.NAME, "value" : "x44_envelope" });
        if (size(evaluateQuery(context, body8)) != 1) throw regenError("Expected one solid: x44_envelope");
        }
        if (definition.includeCotsEnvelopes)
        {
        fCylinder(context, id + "part9primitive0", { "bottomCenter" : vector(((((0 + 3600)) + (-8/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (8/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 11.43 * millimeter });
        var body9 = qCreatedBy(id + "part9primitive0", EntityType.BODY);
        fCylinder(context, id + "part9primitive1", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 4.05 * millimeter });
        opBoolean(context, id + "part9cut1", { "tools" : qCreatedBy(id + "part9primitive1", EntityType.BODY), "targets" : body9, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body9, "propertyType" : PropertyType.NAME, "value" : "pinion_16_envelope" });
        if (size(evaluateQuery(context, body9)) != 1) throw regenError("Expected one solid: pinion_16_envelope");
        }
        if (definition.includeCotsEnvelopes)
        {
        fCylinder(context, id + "part10primitive0", { "bottomCenter" : vector(((((0 + 4800)) + (-8/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 4800)) + (8/2))), ((0 + 1500)), ((0 + 0))) * millimeter, "radius" : 31.75 * millimeter });
        var body10 = qCreatedBy(id + "part10primitive0", EntityType.BODY);
        const sketch_part10primitive1 = newSketchOnPlane(context, id + "part10primitive1_sk", { "sketchPlane" : plane(vector(((((0 + 4800)) + (-10/2))), ((0 + 1500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part10primitive1, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part10primitive1, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part10primitive1, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part10primitive1, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part10primitive1, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part10primitive1, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part10primitive1);
        opExtrude(context, id + "part10primitive1", { "entities" : qSketchRegion(id + "part10primitive1_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 10 * millimeter });
        opDeleteBodies(context, id + "part10primitive1_clean", { "entities" : qCreatedBy(id + "part10primitive1_sk", EntityType.BODY) });
        opBoolean(context, id + "part10cut1", { "tools" : qCreatedBy(id + "part10primitive1", EntityType.BODY), "targets" : body10, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body10, "propertyType" : PropertyType.NAME, "value" : "gear_48_envelope" });
        if (size(evaluateQuery(context, body10)) != 1) throw regenError("Expected one solid: gear_48_envelope");
        }
        if (true)
        {
        const sketch_part11primitive0 = newSketchOnPlane(context, id + "part11primitive0_sk", { "sketchPlane" : plane(vector(((((0 + 6000)) + (-194/2))), ((0 + 1500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part11primitive0, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part11primitive0, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part11primitive0, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part11primitive0, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part11primitive0, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part11primitive0, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part11primitive0);
        opExtrude(context, id + "part11primitive0", { "entities" : qSketchRegion(id + "part11primitive0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 194 * millimeter });
        opDeleteBodies(context, id + "part11primitive0_clean", { "entities" : qCreatedBy(id + "part11primitive0_sk", EntityType.BODY) });
        var body11 = qCreatedBy(id + "part11primitive0", EntityType.BODY);
        setProperty(context, { "entities" : body11, "propertyType" : PropertyType.NAME, "value" : "orienter_hex_shaft" });
        if (size(evaluateQuery(context, body11)) != 1) throw regenError("Expected one solid: orienter_hex_shaft");
        }
        if (true)
        {
        fCylinder(context, id + "part12primitive0", { "bottomCenter" : vector(((((0 + 0)) + (-144/2))), ((0 + 3000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 0)) + (144/2))), ((0 + 3000)), ((0 + 0))) * millimeter, "radius" : 35 * millimeter });
        var body12 = qCreatedBy(id + "part12primitive0", EntityType.BODY);
        const sketch_part12primitive1 = newSketchOnPlane(context, id + "part12primitive1_sk", { "sketchPlane" : plane(vector(((((0 + 0)) + (-146/2))), ((0 + 3000)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part12primitive1, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part12primitive1, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part12primitive1, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part12primitive1, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part12primitive1, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part12primitive1, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part12primitive1);
        opExtrude(context, id + "part12primitive1", { "entities" : qSketchRegion(id + "part12primitive1_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 146 * millimeter });
        opDeleteBodies(context, id + "part12primitive1_clean", { "entities" : qCreatedBy(id + "part12primitive1_sk", EntityType.BODY) });
        opBoolean(context, id + "part12cut1", { "tools" : qCreatedBy(id + "part12primitive1", EntityType.BODY), "targets" : body12, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body12, "propertyType" : PropertyType.NAME, "value" : "orienter_contact_drum" });
        if (size(evaluateQuery(context, body12)) != 1) throw regenError("Expected one solid: orienter_contact_drum");
        }
        if (true)
        {
        fCuboid(context, id + "part13primitive0", { "corner1" : vector(((((0 + 1200)) + (-60/2))), ((((35 + 3000)) + (-140/2))), ((((0 + 0)) + (-8/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (60/2))), ((((35 + 3000)) + (140/2))), ((((0 + 0)) + (8/2)))) * millimeter });
        var body13 = qCreatedBy(id + "part13primitive0", EntityType.BODY);
        fCuboid(context, id + "part13primitive1", { "corner1" : vector(((((0 + 1200)) + (-74/2))), ((((35 + 3000)) + (-140/2))), ((((160 + 0)) + (-8/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (74/2))), ((((35 + 3000)) + (140/2))), ((((160 + 0)) + (8/2)))) * millimeter });
        opBoolean(context, id + "part13union1", { "tools" : qUnion([body13, qCreatedBy(id + "part13primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body13 = qUnion([body13, qCreatedBy(id + "part13primitive1", EntityType.BODY), qCreatedBy(id + "part13union1", EntityType.BODY)]);
        fCuboid(context, id + "part13primitive2", { "corner1" : vector(((((0 + 1200)) + (-60/2))), ((((101 + 3000)) + (-8/2))), ((((80 + 0)) + (-168/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (60/2))), ((((101 + 3000)) + (8/2))), ((((80 + 0)) + (168/2)))) * millimeter });
        opBoolean(context, id + "part13union2", { "tools" : qUnion([body13, qCreatedBy(id + "part13primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body13 = qUnion([body13, qCreatedBy(id + "part13primitive2", EntityType.BODY), qCreatedBy(id + "part13union2", EntityType.BODY)]);
        fCuboid(context, id + "part13primitive3", { "corner1" : vector(((((0 + 1200)) + (-48/2))), ((((65 + 3000)) + (-8/2))), ((((173.5 + 0)) + (-31/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (48/2))), ((((65 + 3000)) + (8/2))), ((((173.5 + 0)) + (31/2)))) * millimeter });
        opBoolean(context, id + "part13union3", { "tools" : qUnion([body13, qCreatedBy(id + "part13primitive3", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body13 = qUnion([body13, qCreatedBy(id + "part13primitive3", EntityType.BODY), qCreatedBy(id + "part13union3", EntityType.BODY)]);
        fCuboid(context, id + "part13primitive4", { "corner1" : vector(((((0 + 1200)) + (-48/2))), ((((40.64 + 3000)) + (-48/2))), ((((187 + 0)) + (-6/2)))) * millimeter, "corner2" : vector(((((0 + 1200)) + (48/2))), ((((40.64 + 3000)) + (48/2))), ((((187 + 0)) + (6/2)))) * millimeter });
        opBoolean(context, id + "part13union4", { "tools" : qUnion([body13, qCreatedBy(id + "part13primitive4", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body13 = qUnion([body13, qCreatedBy(id + "part13primitive4", EntityType.BODY), qCreatedBy(id + "part13union4", EntityType.BODY)]);
        fCuboid(context, id + "part13primitive5", { "corner1" : vector(((((-35.5 + 1200)) + (-3/2))), ((((35 + 3000)) + (-140/2))), ((((174 + 0)) + (-28/2)))) * millimeter, "corner2" : vector(((((-35.5 + 1200)) + (3/2))), ((((35 + 3000)) + (140/2))), ((((174 + 0)) + (28/2)))) * millimeter });
        opBoolean(context, id + "part13union5", { "tools" : qUnion([body13, qCreatedBy(id + "part13primitive5", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body13 = qUnion([body13, qCreatedBy(id + "part13primitive5", EntityType.BODY), qCreatedBy(id + "part13union5", EntityType.BODY)]);
        fCuboid(context, id + "part13primitive6", { "corner1" : vector(((((35.5 + 1200)) + (-3/2))), ((((35 + 3000)) + (-140/2))), ((((174 + 0)) + (-28/2)))) * millimeter, "corner2" : vector(((((35.5 + 1200)) + (3/2))), ((((35 + 3000)) + (140/2))), ((((174 + 0)) + (28/2)))) * millimeter });
        opBoolean(context, id + "part13union6", { "tools" : qUnion([body13, qCreatedBy(id + "part13primitive6", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body13 = qUnion([body13, qCreatedBy(id + "part13primitive6", EntityType.BODY), qCreatedBy(id + "part13union6", EntityType.BODY)]);
        fCylinder(context, id + "part13primitive7", { "bottomCenter" : vector(((0 + 1200)), ((0 + 3000)), ((((80 + 0)) + (-174/2)))) * millimeter, "topCenter" : vector(((0 + 1200)), ((0 + 3000)), ((((80 + 0)) + (174/2)))) * millimeter, "radius" : 14.3375 * millimeter });
        opBoolean(context, id + "part13cut7", { "tools" : qCreatedBy(id + "part13primitive7", EntityType.BODY), "targets" : body13, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part13primitive8", { "bottomCenter" : vector(((0 + 1200)), ((40.64 + 3000)), ((((187 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((0 + 1200)), ((40.64 + 3000)), ((((187 + 0)) + (8/2)))) * millimeter, "radius" : 9.575 * millimeter });
        opBoolean(context, id + "part13cut8", { "tools" : qCreatedBy(id + "part13primitive8", EntityType.BODY), "targets" : body13, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part13primitive9", { "bottomCenter" : vector(((17.4625 + 1200)), ((40.64 + 3000)), ((((187 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((17.4625 + 1200)), ((40.64 + 3000)), ((((187 + 0)) + (8/2)))) * millimeter, "radius" : 2.75 * millimeter });
        opBoolean(context, id + "part13cut9", { "tools" : qCreatedBy(id + "part13primitive9", EntityType.BODY), "targets" : body13, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part13primitive10", { "bottomCenter" : vector(((-8.731249999999996 + 1200)), ((55.76296861358576 + 3000)), ((((187 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((-8.731249999999996 + 1200)), ((55.76296861358576 + 3000)), ((((187 + 0)) + (8/2)))) * millimeter, "radius" : 2.75 * millimeter });
        opBoolean(context, id + "part13cut10", { "tools" : qCreatedBy(id + "part13primitive10", EntityType.BODY), "targets" : body13, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part13primitive11", { "bottomCenter" : vector(((-8.731250000000006 + 1200)), ((25.517031386414246 + 3000)), ((((187 + 0)) + (-8/2)))) * millimeter, "topCenter" : vector(((-8.731250000000006 + 1200)), ((25.517031386414246 + 3000)), ((((187 + 0)) + (8/2)))) * millimeter, "radius" : 2.75 * millimeter });
        opBoolean(context, id + "part13cut11", { "tools" : qCreatedBy(id + "part13primitive11", EntityType.BODY), "targets" : body13, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body13, "propertyType" : PropertyType.NAME, "value" : "orienter_housing" });
        if (size(evaluateQuery(context, body13)) != 1) throw regenError("Expected one solid: orienter_housing");
        }
        if (true)
        {
        const sketch_part14primitive0sub0 = newSketchOnPlane(context, id + "part14primitive0sub0_sk", { "sketchPlane" : plane(vector(((((0 + 2400)) + (-8/2))), ((0 + 3000)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part14primitive0sub0, "edge0", { "start" : vector(((0 + (21*0.7167259309091052))), ((0 + (21*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (21*0.7167259309091052))), ((-370 + (21*-0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part14primitive0sub0, "edge1", { "start" : vector(((-360 + (21*0.7167259309091052))), ((-370 + (21*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (21*-0.7167259309091052))), ((-370 + (21*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part14primitive0sub0, "edge2", { "start" : vector(((-360 + (21*-0.7167259309091052))), ((-370 + (21*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (21*-0.7167259309091052))), ((0 + (21*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part14primitive0sub0, "edge3", { "start" : vector(((0 + (21*-0.7167259309091052))), ((0 + (21*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (21*0.7167259309091052))), ((0 + (21*-0.6973549598034536)))) * millimeter });
        skSolve(sketch_part14primitive0sub0);
        opExtrude(context, id + "part14primitive0sub0", { "entities" : qSketchRegion(id + "part14primitive0sub0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 8 * millimeter });
        opDeleteBodies(context, id + "part14primitive0sub0_clean", { "entities" : qCreatedBy(id + "part14primitive0sub0_sk", EntityType.BODY) });
        fCylinder(context, id + "part14primitive0sub1", { "bottomCenter" : vector(((((0 + 2400)) + (-8/2))), ((((0 + 0)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (8/2))), ((((0 + 0)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "radius" : 21 * millimeter });
        fCylinder(context, id + "part14primitive0sub2", { "bottomCenter" : vector(((((0 + 2400)) + (-8/2))), ((((0 + -360)) + 3000)), ((((0 + -370)) + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (8/2))), ((((0 + -360)) + 3000)), ((((0 + -370)) + 0))) * millimeter, "radius" : 21 * millimeter });
        opBoolean(context, id + "part14primitive0", { "tools" : qUnion([qCreatedBy(id + "part14primitive0sub0", EntityType.BODY), qCreatedBy(id + "part14primitive0sub1", EntityType.BODY), qCreatedBy(id + "part14primitive0sub2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        var body14 = qUnion([qCreatedBy(id + "part14primitive0sub0", EntityType.BODY), qCreatedBy(id + "part14primitive0sub1", EntityType.BODY), qCreatedBy(id + "part14primitive0sub2", EntityType.BODY), qCreatedBy(id + "part14primitive0", EntityType.BODY)]);
        fCylinder(context, id + "part14primitive1", { "bottomCenter" : vector(((((0 + 2400)) + (-10/2))), ((0 + 3000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (10/2))), ((0 + 3000)), ((0 + 0))) * millimeter, "radius" : 14.3375 * millimeter });
        opBoolean(context, id + "part14cut1", { "tools" : qCreatedBy(id + "part14primitive1", EntityType.BODY), "targets" : body14, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part14primitive2", { "bottomCenter" : vector(((((0 + 2400)) + (-10/2))), ((-360 + 3000)), ((-370 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (10/2))), ((-360 + 3000)), ((-370 + 0))) * millimeter, "radius" : 14.3375 * millimeter });
        opBoolean(context, id + "part14cut2", { "tools" : qCreatedBy(id + "part14primitive2", EntityType.BODY), "targets" : body14, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part14primitive3", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((12.020815280171309 + 3000)), ((12.020815280171309 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((12.020815280171309 + 3000)), ((12.020815280171309 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part14cut3", { "tools" : qCreatedBy(id + "part14primitive3", EntityType.BODY), "targets" : body14, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part14primitive4", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((-12.020815280171307 + 3000)), ((12.020815280171309 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((-12.020815280171307 + 3000)), ((12.020815280171309 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part14cut4", { "tools" : qCreatedBy(id + "part14primitive4", EntityType.BODY), "targets" : body14, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part14primitive5", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((-12.02081528017131 + 3000)), ((-12.020815280171307 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((-12.02081528017131 + 3000)), ((-12.020815280171307 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part14cut5", { "tools" : qCreatedBy(id + "part14primitive5", EntityType.BODY), "targets" : body14, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part14primitive6", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((12.020815280171306 + 3000)), ((-12.02081528017131 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((12.020815280171306 + 3000)), ((-12.02081528017131 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part14cut6", { "tools" : qCreatedBy(id + "part14primitive6", EntityType.BODY), "targets" : body14, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body14, "propertyType" : PropertyType.NAME, "value" : "pickup_left_plate" });
        if (size(evaluateQuery(context, body14)) != 1) throw regenError("Expected one solid: pickup_left_plate");
        }
        if (true)
        {
        const sketch_part15primitive0sub0 = newSketchOnPlane(context, id + "part15primitive0sub0_sk", { "sketchPlane" : plane(vector(((((0 + 3600)) + (-8/2))), ((0 + 3000)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part15primitive0sub0, "edge0", { "start" : vector(((0 + (21*0.7167259309091052))), ((0 + (21*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (21*0.7167259309091052))), ((-370 + (21*-0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part15primitive0sub0, "edge1", { "start" : vector(((-360 + (21*0.7167259309091052))), ((-370 + (21*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (21*-0.7167259309091052))), ((-370 + (21*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part15primitive0sub0, "edge2", { "start" : vector(((-360 + (21*-0.7167259309091052))), ((-370 + (21*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (21*-0.7167259309091052))), ((0 + (21*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part15primitive0sub0, "edge3", { "start" : vector(((0 + (21*-0.7167259309091052))), ((0 + (21*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (21*0.7167259309091052))), ((0 + (21*-0.6973549598034536)))) * millimeter });
        skSolve(sketch_part15primitive0sub0);
        opExtrude(context, id + "part15primitive0sub0", { "entities" : qSketchRegion(id + "part15primitive0sub0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 8 * millimeter });
        opDeleteBodies(context, id + "part15primitive0sub0_clean", { "entities" : qCreatedBy(id + "part15primitive0sub0_sk", EntityType.BODY) });
        fCylinder(context, id + "part15primitive0sub1", { "bottomCenter" : vector(((((0 + 3600)) + (-8/2))), ((((0 + 0)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (8/2))), ((((0 + 0)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "radius" : 21 * millimeter });
        fCylinder(context, id + "part15primitive0sub2", { "bottomCenter" : vector(((((0 + 3600)) + (-8/2))), ((((0 + -360)) + 3000)), ((((0 + -370)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (8/2))), ((((0 + -360)) + 3000)), ((((0 + -370)) + 0))) * millimeter, "radius" : 21 * millimeter });
        opBoolean(context, id + "part15primitive0", { "tools" : qUnion([qCreatedBy(id + "part15primitive0sub0", EntityType.BODY), qCreatedBy(id + "part15primitive0sub1", EntityType.BODY), qCreatedBy(id + "part15primitive0sub2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        var body15 = qUnion([qCreatedBy(id + "part15primitive0sub0", EntityType.BODY), qCreatedBy(id + "part15primitive0sub1", EntityType.BODY), qCreatedBy(id + "part15primitive0sub2", EntityType.BODY), qCreatedBy(id + "part15primitive0", EntityType.BODY)]);
        const sketch_part15primitive1sub0 = newSketchOnPlane(context, id + "part15primitive1sub0_sk", { "sketchPlane" : plane(vector(((((0 + 3600)) + (-8/2))), ((0 + 3000)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part15primitive1sub0, "edge0", { "start" : vector(((0 + (24*0.0))), ((0 + (24*1.0)))) * millimeter, "end" : vector(((71.12 + (24*0.0))), ((0 + (24*1.0)))) * millimeter });
        skLineSegment(sketch_part15primitive1sub0, "edge1", { "start" : vector(((71.12 + (24*0.0))), ((0 + (24*1.0)))) * millimeter, "end" : vector(((71.12 + (24*-0.0))), ((0 + (24*-1.0)))) * millimeter });
        skLineSegment(sketch_part15primitive1sub0, "edge2", { "start" : vector(((71.12 + (24*-0.0))), ((0 + (24*-1.0)))) * millimeter, "end" : vector(((0 + (24*-0.0))), ((0 + (24*-1.0)))) * millimeter });
        skLineSegment(sketch_part15primitive1sub0, "edge3", { "start" : vector(((0 + (24*-0.0))), ((0 + (24*-1.0)))) * millimeter, "end" : vector(((0 + (24*0.0))), ((0 + (24*1.0)))) * millimeter });
        skSolve(sketch_part15primitive1sub0);
        opExtrude(context, id + "part15primitive1sub0", { "entities" : qSketchRegion(id + "part15primitive1sub0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 8 * millimeter });
        opDeleteBodies(context, id + "part15primitive1sub0_clean", { "entities" : qCreatedBy(id + "part15primitive1sub0_sk", EntityType.BODY) });
        fCylinder(context, id + "part15primitive1sub1", { "bottomCenter" : vector(((((0 + 3600)) + (-8/2))), ((((0 + 0)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (8/2))), ((((0 + 0)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "radius" : 24 * millimeter });
        fCylinder(context, id + "part15primitive1sub2", { "bottomCenter" : vector(((((0 + 3600)) + (-8/2))), ((((0 + 71.12)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (8/2))), ((((0 + 71.12)) + 3000)), ((((0 + 0)) + 0))) * millimeter, "radius" : 24 * millimeter });
        opBoolean(context, id + "part15primitive1", { "tools" : qUnion([qCreatedBy(id + "part15primitive1sub0", EntityType.BODY), qCreatedBy(id + "part15primitive1sub1", EntityType.BODY), qCreatedBy(id + "part15primitive1sub2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        opBoolean(context, id + "part15union1", { "tools" : qUnion([body15, qUnion([qCreatedBy(id + "part15primitive1sub0", EntityType.BODY), qCreatedBy(id + "part15primitive1sub1", EntityType.BODY), qCreatedBy(id + "part15primitive1sub2", EntityType.BODY), qCreatedBy(id + "part15primitive1", EntityType.BODY)])]), "operationType" : BooleanOperationType.UNION });
        body15 = qUnion([body15, qUnion([qCreatedBy(id + "part15primitive1sub0", EntityType.BODY), qCreatedBy(id + "part15primitive1sub1", EntityType.BODY), qCreatedBy(id + "part15primitive1sub2", EntityType.BODY), qCreatedBy(id + "part15primitive1", EntityType.BODY)]), qCreatedBy(id + "part15union1", EntityType.BODY)]);
        fCylinder(context, id + "part15primitive2", { "bottomCenter" : vector(((((-14.5 + 3600)) + (-21/2))), ((88.58250000000001 + 3000)), ((0.0 + 0))) * millimeter, "topCenter" : vector(((((-14.5 + 3600)) + (21/2))), ((88.58250000000001 + 3000)), ((0.0 + 0))) * millimeter, "radius" : 4.5 * millimeter });
        opBoolean(context, id + "part15union2", { "tools" : qUnion([body15, qCreatedBy(id + "part15primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body15 = qUnion([body15, qCreatedBy(id + "part15primitive2", EntityType.BODY), qCreatedBy(id + "part15union2", EntityType.BODY)]);
        fCylinder(context, id + "part15primitive3", { "bottomCenter" : vector(((((-14.5 + 3600)) + (-21/2))), ((79.85125000000001 + 3000)), ((15.122968613585758 + 0))) * millimeter, "topCenter" : vector(((((-14.5 + 3600)) + (21/2))), ((79.85125000000001 + 3000)), ((15.122968613585758 + 0))) * millimeter, "radius" : 4.5 * millimeter });
        opBoolean(context, id + "part15union3", { "tools" : qUnion([body15, qCreatedBy(id + "part15primitive3", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body15 = qUnion([body15, qCreatedBy(id + "part15primitive3", EntityType.BODY), qCreatedBy(id + "part15union3", EntityType.BODY)]);
        fCylinder(context, id + "part15primitive4", { "bottomCenter" : vector(((((-14.5 + 3600)) + (-21/2))), ((79.85125000000001 + 3000)), ((-15.122968613585758 + 0))) * millimeter, "topCenter" : vector(((((-14.5 + 3600)) + (21/2))), ((79.85125000000001 + 3000)), ((-15.122968613585758 + 0))) * millimeter, "radius" : 4.5 * millimeter });
        opBoolean(context, id + "part15union4", { "tools" : qUnion([body15, qCreatedBy(id + "part15primitive4", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body15 = qUnion([body15, qCreatedBy(id + "part15primitive4", EntityType.BODY), qCreatedBy(id + "part15union4", EntityType.BODY)]);
        fCylinder(context, id + "part15primitive5", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((0 + 3000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((0 + 3000)), ((0 + 0))) * millimeter, "radius" : 14.3375 * millimeter });
        opBoolean(context, id + "part15cut5", { "tools" : qCreatedBy(id + "part15primitive5", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive6", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((-360 + 3000)), ((-370 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((-360 + 3000)), ((-370 + 0))) * millimeter, "radius" : 14.3375 * millimeter });
        opBoolean(context, id + "part15cut6", { "tools" : qCreatedBy(id + "part15primitive6", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive7", { "bottomCenter" : vector(((((0 + 3600)) + (-62/2))), ((88.58250000000001 + 3000)), ((0.0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (62/2))), ((88.58250000000001 + 3000)), ((0.0 + 0))) * millimeter, "radius" : 2.75 * millimeter });
        opBoolean(context, id + "part15cut7", { "tools" : qCreatedBy(id + "part15primitive7", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive8", { "bottomCenter" : vector(((((0 + 3600)) + (-62/2))), ((79.85125000000001 + 3000)), ((15.122968613585758 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (62/2))), ((79.85125000000001 + 3000)), ((15.122968613585758 + 0))) * millimeter, "radius" : 2.75 * millimeter });
        opBoolean(context, id + "part15cut8", { "tools" : qCreatedBy(id + "part15primitive8", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive9", { "bottomCenter" : vector(((((0 + 3600)) + (-62/2))), ((79.85125000000001 + 3000)), ((-15.122968613585758 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (62/2))), ((79.85125000000001 + 3000)), ((-15.122968613585758 + 0))) * millimeter, "radius" : 2.75 * millimeter });
        opBoolean(context, id + "part15cut9", { "tools" : qCreatedBy(id + "part15primitive9", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive10", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((71.12 + 3000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((71.12 + 3000)), ((0 + 0))) * millimeter, "radius" : 9.575 * millimeter });
        opBoolean(context, id + "part15cut10", { "tools" : qCreatedBy(id + "part15primitive10", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive11", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((12.020815280171309 + 3000)), ((12.020815280171309 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((12.020815280171309 + 3000)), ((12.020815280171309 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part15cut11", { "tools" : qCreatedBy(id + "part15primitive11", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive12", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((-12.020815280171307 + 3000)), ((12.020815280171309 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((-12.020815280171307 + 3000)), ((12.020815280171309 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part15cut12", { "tools" : qCreatedBy(id + "part15primitive12", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive13", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((-12.02081528017131 + 3000)), ((-12.020815280171307 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((-12.02081528017131 + 3000)), ((-12.020815280171307 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part15cut13", { "tools" : qCreatedBy(id + "part15primitive13", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part15primitive14", { "bottomCenter" : vector(((((0 + 3600)) + (-10/2))), ((12.020815280171306 + 3000)), ((-12.02081528017131 + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + (10/2))), ((12.020815280171306 + 3000)), ((-12.02081528017131 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part15cut14", { "tools" : qCreatedBy(id + "part15primitive14", EntityType.BODY), "targets" : body15, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body15, "propertyType" : PropertyType.NAME, "value" : "pickup_side_plate" });
        if (size(evaluateQuery(context, body15)) != 1) throw regenError("Expected one solid: pickup_side_plate");
        }
        if (true)
        {
        fCuboid(context, id + "part16primitive0", { "corner1" : vector(((((0 + 4800)) + (-(mouthWidth + 4)/2))), ((((0 + 3000)) + (-20/2))), ((((0 + 0)) + (-20/2)))) * millimeter, "corner2" : vector(((((0 + 4800)) + ((mouthWidth + 4)/2))), ((((0 + 3000)) + (20/2))), ((((0 + 0)) + (20/2)))) * millimeter });
        var body16 = qCreatedBy(id + "part16primitive0", EntityType.BODY);
        fCuboid(context, id + "part16primitive1", { "corner1" : vector(((((0 + 4800)) + (-(mouthWidth + 6)/2))), ((((0 + 3000)) + (-16/2))), ((((0 + 0)) + (-16/2)))) * millimeter, "corner2" : vector(((((0 + 4800)) + ((mouthWidth + 6)/2))), ((((0 + 3000)) + (16/2))), ((((0 + 0)) + (16/2)))) * millimeter });
        opBoolean(context, id + "part16cut1", { "tools" : qCreatedBy(id + "part16primitive1", EntityType.BODY), "targets" : body16, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body16, "propertyType" : PropertyType.NAME, "value" : "pickup_cross_tube" });
        if (size(evaluateQuery(context, body16)) != 1) throw regenError("Expected one solid: pickup_cross_tube");
        }
        if (true)
        {
        const sketch_part17primitive0 = newSketchOnPlane(context, id + "part17primitive0_sk", { "sketchPlane" : plane(vector(((((0 + 6000)) + (-612/2))), ((0 + 3000)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part17primitive0, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part17primitive0, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part17primitive0, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part17primitive0, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part17primitive0, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part17primitive0, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part17primitive0);
        opExtrude(context, id + "part17primitive0", { "entities" : qSketchRegion(id + "part17primitive0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : 612 * millimeter });
        opDeleteBodies(context, id + "part17primitive0_clean", { "entities" : qCreatedBy(id + "part17primitive0_sk", EntityType.BODY) });
        var body17 = qCreatedBy(id + "part17primitive0", EntityType.BODY);
        setProperty(context, { "entities" : body17, "propertyType" : PropertyType.NAME, "value" : "pivot_spine" });
        if (size(evaluateQuery(context, body17)) != 1) throw regenError("Expected one solid: pivot_spine");
        }
        if (true)
        {
        const sketch_part18primitive0 = newSketchOnPlane(context, id + "part18primitive0_sk", { "sketchPlane" : plane(vector(((((0 + 0)) + (-(mouthWidth + 28)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part18primitive0, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part18primitive0, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part18primitive0, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part18primitive0, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part18primitive0, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part18primitive0, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part18primitive0);
        opExtrude(context, id + "part18primitive0", { "entities" : qSketchRegion(id + "part18primitive0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : (mouthWidth + 28) * millimeter });
        opDeleteBodies(context, id + "part18primitive0_clean", { "entities" : qCreatedBy(id + "part18primitive0_sk", EntityType.BODY) });
        var body18 = qCreatedBy(id + "part18primitive0", EntityType.BODY);
        setProperty(context, { "entities" : body18, "propertyType" : PropertyType.NAME, "value" : "lower_hex_shaft" });
        if (size(evaluateQuery(context, body18)) != 1) throw regenError("Expected one solid: lower_hex_shaft");
        }
        if (true)
        {
        fCylinder(context, id + "part19primitive0", { "bottomCenter" : vector(((((0 + 1200)) + (-(mouthWidth - 30)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 1200)) + ((mouthWidth - 30)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 27 * millimeter });
        var body19 = qCreatedBy(id + "part19primitive0", EntityType.BODY);
        fCylinder(context, id + "part19primitive1", { "bottomCenter" : vector(((((0 + 1200)) + (-(mouthWidth - 28)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 1200)) + ((mouthWidth - 28)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 14.3375 * millimeter });
        opBoolean(context, id + "part19cut1", { "tools" : qCreatedBy(id + "part19primitive1", EntityType.BODY), "targets" : body19, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body19, "propertyType" : PropertyType.NAME, "value" : "upper_pickup_drum" });
        if (size(evaluateQuery(context, body19)) != 1) throw regenError("Expected one solid: upper_pickup_drum");
        }
        if (true)
        {
        fCylinder(context, id + "part20primitive0", { "bottomCenter" : vector(((((0 + 2400)) + (-(mouthWidth - 30)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + ((mouthWidth - 30)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 27 * millimeter });
        var body20 = qCreatedBy(id + "part20primitive0", EntityType.BODY);
        const sketch_part20primitive1 = newSketchOnPlane(context, id + "part20primitive1_sk", { "sketchPlane" : plane(vector(((((0 + 2400)) + (-(mouthWidth - 28)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part20primitive1, "edge0", { "start" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter });
        skLineSegment(sketch_part20primitive1, "edge1", { "start" : vector(((12.7/sqrt(3))*6.123233995736766e-17), ((12.7/sqrt(3))*1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skLineSegment(sketch_part20primitive1, "edge2", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter, "end" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter });
        skLineSegment(sketch_part20primitive1, "edge3", { "start" : vector(((12.7/sqrt(3))*-0.8660254037844386), ((12.7/sqrt(3))*-0.5000000000000001)) * millimeter, "end" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter });
        skLineSegment(sketch_part20primitive1, "edge4", { "start" : vector(((12.7/sqrt(3))*-1.8369701987210297e-16), ((12.7/sqrt(3))*-1.0)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter });
        skLineSegment(sketch_part20primitive1, "edge5", { "start" : vector(((12.7/sqrt(3))*0.8660254037844384), ((12.7/sqrt(3))*-0.5000000000000004)) * millimeter, "end" : vector(((12.7/sqrt(3))*0.8660254037844387), ((12.7/sqrt(3))*0.49999999999999994)) * millimeter });
        skSolve(sketch_part20primitive1);
        opExtrude(context, id + "part20primitive1", { "entities" : qSketchRegion(id + "part20primitive1_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : (mouthWidth - 28) * millimeter });
        opDeleteBodies(context, id + "part20primitive1_clean", { "entities" : qCreatedBy(id + "part20primitive1_sk", EntityType.BODY) });
        opBoolean(context, id + "part20cut1", { "tools" : qCreatedBy(id + "part20primitive1", EntityType.BODY), "targets" : body20, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body20, "propertyType" : PropertyType.NAME, "value" : "lower_pickup_drum" });
        if (size(evaluateQuery(context, body20)) != 1) throw regenError("Expected one solid: lower_pickup_drum");
        }
        if (true)
        {
        const sketch_part21primitive0sub0 = newSketchOnPlane(context, id + "part21primitive0sub0_sk", { "sketchPlane" : plane(vector(((((0 + 3600)) + (-(mouthWidth - 60)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part21primitive0sub0, "edge0", { "start" : vector(((0 + (30*0.7167259309091052))), ((0 + (30*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (30*0.7167259309091052))), ((-370 + (30*-0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part21primitive0sub0, "edge1", { "start" : vector(((-360 + (30*0.7167259309091052))), ((-370 + (30*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (30*-0.7167259309091052))), ((-370 + (30*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part21primitive0sub0, "edge2", { "start" : vector(((-360 + (30*-0.7167259309091052))), ((-370 + (30*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (30*-0.7167259309091052))), ((0 + (30*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part21primitive0sub0, "edge3", { "start" : vector(((0 + (30*-0.7167259309091052))), ((0 + (30*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (30*0.7167259309091052))), ((0 + (30*-0.6973549598034536)))) * millimeter });
        skSolve(sketch_part21primitive0sub0);
        opExtrude(context, id + "part21primitive0sub0", { "entities" : qSketchRegion(id + "part21primitive0sub0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : (mouthWidth - 60) * millimeter });
        opDeleteBodies(context, id + "part21primitive0sub0_clean", { "entities" : qCreatedBy(id + "part21primitive0sub0_sk", EntityType.BODY) });
        fCylinder(context, id + "part21primitive0sub1", { "bottomCenter" : vector(((((0 + 3600)) + (-(mouthWidth - 60)/2))), ((((0 + 0)) + 4500)), ((((0 + 0)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + ((mouthWidth - 60)/2))), ((((0 + 0)) + 4500)), ((((0 + 0)) + 0))) * millimeter, "radius" : 30 * millimeter });
        fCylinder(context, id + "part21primitive0sub2", { "bottomCenter" : vector(((((0 + 3600)) + (-(mouthWidth - 60)/2))), ((((0 + -360)) + 4500)), ((((0 + -370)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + ((mouthWidth - 60)/2))), ((((0 + -360)) + 4500)), ((((0 + -370)) + 0))) * millimeter, "radius" : 30 * millimeter });
        opBoolean(context, id + "part21primitive0", { "tools" : qUnion([qCreatedBy(id + "part21primitive0sub0", EntityType.BODY), qCreatedBy(id + "part21primitive0sub1", EntityType.BODY), qCreatedBy(id + "part21primitive0sub2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        var body21 = qUnion([qCreatedBy(id + "part21primitive0sub0", EntityType.BODY), qCreatedBy(id + "part21primitive0sub1", EntityType.BODY), qCreatedBy(id + "part21primitive0sub2", EntityType.BODY), qCreatedBy(id + "part21primitive0", EntityType.BODY)]);
        const sketch_part21primitive1sub0 = newSketchOnPlane(context, id + "part21primitive1sub0_sk", { "sketchPlane" : plane(vector(((((0 + 3600)) + (-(mouthWidth - 58)/2))), ((0 + 4500)), ((0 + 0))) * millimeter, vector(1, 0, 0), vector(0, 1, 0)) });
        skLineSegment(sketch_part21primitive1sub0, "edge0", { "start" : vector(((0 + (27*0.7167259309091052))), ((0 + (27*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (27*0.7167259309091052))), ((-370 + (27*-0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part21primitive1sub0, "edge1", { "start" : vector(((-360 + (27*0.7167259309091052))), ((-370 + (27*-0.6973549598034536)))) * millimeter, "end" : vector(((-360 + (27*-0.7167259309091052))), ((-370 + (27*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part21primitive1sub0, "edge2", { "start" : vector(((-360 + (27*-0.7167259309091052))), ((-370 + (27*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (27*-0.7167259309091052))), ((0 + (27*0.6973549598034536)))) * millimeter });
        skLineSegment(sketch_part21primitive1sub0, "edge3", { "start" : vector(((0 + (27*-0.7167259309091052))), ((0 + (27*0.6973549598034536)))) * millimeter, "end" : vector(((0 + (27*0.7167259309091052))), ((0 + (27*-0.6973549598034536)))) * millimeter });
        skSolve(sketch_part21primitive1sub0);
        opExtrude(context, id + "part21primitive1sub0", { "entities" : qSketchRegion(id + "part21primitive1sub0_sk"), "direction" : vector(1, 0, 0), "endBound" : BoundingType.BLIND, "endDepth" : (mouthWidth - 58) * millimeter });
        opDeleteBodies(context, id + "part21primitive1sub0_clean", { "entities" : qCreatedBy(id + "part21primitive1sub0_sk", EntityType.BODY) });
        fCylinder(context, id + "part21primitive1sub1", { "bottomCenter" : vector(((((0 + 3600)) + (-(mouthWidth - 58)/2))), ((((0 + 0)) + 4500)), ((((0 + 0)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + ((mouthWidth - 58)/2))), ((((0 + 0)) + 4500)), ((((0 + 0)) + 0))) * millimeter, "radius" : 27 * millimeter });
        fCylinder(context, id + "part21primitive1sub2", { "bottomCenter" : vector(((((0 + 3600)) + (-(mouthWidth - 58)/2))), ((((0 + -360)) + 4500)), ((((0 + -370)) + 0))) * millimeter, "topCenter" : vector(((((0 + 3600)) + ((mouthWidth - 58)/2))), ((((0 + -360)) + 4500)), ((((0 + -370)) + 0))) * millimeter, "radius" : 27 * millimeter });
        opBoolean(context, id + "part21primitive1", { "tools" : qUnion([qCreatedBy(id + "part21primitive1sub0", EntityType.BODY), qCreatedBy(id + "part21primitive1sub1", EntityType.BODY), qCreatedBy(id + "part21primitive1sub2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        opBoolean(context, id + "part21cut1", { "tools" : qUnion([qCreatedBy(id + "part21primitive1sub0", EntityType.BODY), qCreatedBy(id + "part21primitive1sub1", EntityType.BODY), qCreatedBy(id + "part21primitive1sub2", EntityType.BODY), qCreatedBy(id + "part21primitive1", EntityType.BODY)]), "targets" : body21, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body21, "propertyType" : PropertyType.NAME, "value" : "pickup_belt" });
        if (size(evaluateQuery(context, body21)) != 1) throw regenError("Expected one solid: pickup_belt");
        }
        if (true)
        {
        fCylinder(context, id + "part22primitive0", { "bottomCenter" : vector(((((0 + 4800)) + (-8/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 4800)) + (8/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 62.23 * millimeter });
        var body22 = qCreatedBy(id + "part22primitive0", EntityType.BODY);
        fCylinder(context, id + "part22primitive1", { "bottomCenter" : vector(((((-5 + 4800)) + (-10/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((-5 + 4800)) + (10/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 20 * millimeter });
        opBoolean(context, id + "part22union1", { "tools" : qUnion([body22, qCreatedBy(id + "part22primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body22 = qUnion([body22, qCreatedBy(id + "part22primitive1", EntityType.BODY), qCreatedBy(id + "part22union1", EntityType.BODY)]);
        fCylinder(context, id + "part22primitive2", { "bottomCenter" : vector(((((0 + 4800)) + (-20/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 4800)) + (20/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 14.4 * millimeter });
        opBoolean(context, id + "part22cut2", { "tools" : qCreatedBy(id + "part22primitive2", EntityType.BODY), "targets" : body22, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body22, "propertyType" : PropertyType.NAME, "value" : "pickup_output_gear" });
        if (size(evaluateQuery(context, body22)) != 1) throw regenError("Expected one solid: pickup_output_gear");
        }
        if (true)
        {
        fCylinder(context, id + "part23primitive0", { "bottomCenter" : vector(((((0 + 6000)) + (-13/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 6000)) + (13/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 67 * millimeter });
        var body23 = qCreatedBy(id + "part23primitive0", EntityType.BODY);
        fCylinder(context, id + "part23primitive1", { "bottomCenter" : vector(((((0 + 6000)) + (-13/2))), ((71.12 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 6000)) + (13/2))), ((71.12 + 4500)), ((0 + 0))) * millimeter, "radius" : 17 * millimeter });
        opBoolean(context, id + "part23union1", { "tools" : qUnion([body23, qCreatedBy(id + "part23primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body23 = qUnion([body23, qCreatedBy(id + "part23primitive1", EntityType.BODY), qCreatedBy(id + "part23union1", EntityType.BODY)]);
        fCylinder(context, id + "part23primitive2", { "bottomCenter" : vector(((((0 + 6000)) + (-15/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 6000)) + (15/2))), ((0 + 4500)), ((0 + 0))) * millimeter, "radius" : 65 * millimeter });
        opBoolean(context, id + "part23cut2", { "tools" : qCreatedBy(id + "part23primitive2", EntityType.BODY), "targets" : body23, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part23primitive3", { "bottomCenter" : vector(((((0 + 6000)) + (-15/2))), ((71.12 + 4500)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 6000)) + (15/2))), ((71.12 + 4500)), ((0 + 0))) * millimeter, "radius" : 15 * millimeter });
        opBoolean(context, id + "part23cut3", { "tools" : qCreatedBy(id + "part23primitive3", EntityType.BODY), "targets" : body23, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body23, "propertyType" : PropertyType.NAME, "value" : "pickup_gear_guard" });
        if (size(evaluateQuery(context, body23)) != 1) throw regenError("Expected one solid: pickup_gear_guard");
        }
        if (true)
        {
        fCuboid(context, id + "part24primitive0", { "corner1" : vector(((((0 + 0)) + (-12/2))), ((((0 + 6000)) + (-60/2))), ((((-145 + 0)) + (-290/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (12/2))), ((((0 + 6000)) + (60/2))), ((((-145 + 0)) + (290/2)))) * millimeter });
        var body24 = qCreatedBy(id + "part24primitive0", EntityType.BODY);
        fCylinder(context, id + "part24primitive1", { "bottomCenter" : vector(((((0 + 0)) + (-12/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 0)) + (12/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 35 * millimeter });
        opBoolean(context, id + "part24union1", { "tools" : qUnion([body24, qCreatedBy(id + "part24primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body24 = qUnion([body24, qCreatedBy(id + "part24primitive1", EntityType.BODY), qCreatedBy(id + "part24union1", EntityType.BODY)]);
        fCuboid(context, id + "part24primitive2", { "corner1" : vector(((((0 + 0)) + (-36/2))), ((((0 + 6000)) + (-90/2))), ((((-286 + 0)) + (-8/2)))) * millimeter, "corner2" : vector(((((0 + 0)) + (36/2))), ((((0 + 6000)) + (90/2))), ((((-286 + 0)) + (8/2)))) * millimeter });
        opBoolean(context, id + "part24union2", { "tools" : qUnion([body24, qCreatedBy(id + "part24primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body24 = qUnion([body24, qCreatedBy(id + "part24primitive2", EntityType.BODY), qCreatedBy(id + "part24union2", EntityType.BODY)]);
        fCylinder(context, id + "part24primitive3", { "bottomCenter" : vector(((((0 + 0)) + (-16/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 0)) + (16/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 7.45 * millimeter });
        opBoolean(context, id + "part24cut3", { "tools" : qCreatedBy(id + "part24primitive3", EntityType.BODY), "targets" : body24, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body24, "propertyType" : PropertyType.NAME, "value" : "pivot_tower" });
        if (size(evaluateQuery(context, body24)) != 1) throw regenError("Expected one solid: pivot_tower");
        }
        if (definition.includeCotsEnvelopes)
        {
        fCylinder(context, id + "part25primitive0", { "bottomCenter" : vector(((((-72.5 + 1200)) + (-75/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((-72.5 + 1200)) + (75/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 23.7 * millimeter });
        var body25 = qCreatedBy(id + "part25primitive0", EntityType.BODY);
        fCylinder(context, id + "part25primitive1", { "bottomCenter" : vector(((((-17.5 + 1200)) + (-35/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((-17.5 + 1200)) + (35/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 25 * millimeter });
        opBoolean(context, id + "part25union1", { "tools" : qUnion([body25, qCreatedBy(id + "part25primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body25 = qUnion([body25, qCreatedBy(id + "part25primitive1", EntityType.BODY), qCreatedBy(id + "part25union1", EntityType.BODY)]);
        fCylinder(context, id + "part25primitive2", { "bottomCenter" : vector(((((8 + 1200)) + (-16/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((8 + 1200)) + (16/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 4 * millimeter });
        opBoolean(context, id + "part25union2", { "tools" : qUnion([body25, qCreatedBy(id + "part25primitive2", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body25 = qUnion([body25, qCreatedBy(id + "part25primitive2", EntityType.BODY), qCreatedBy(id + "part25union2", EntityType.BODY)]);
        setProperty(context, { "entities" : body25, "propertyType" : PropertyType.NAME, "value" : "deploy_motor_reducer_envelope" });
        if (size(evaluateQuery(context, body25)) != 1) throw regenError("Expected one solid: deploy_motor_reducer_envelope");
        }
        if (true)
        {
        fCylinder(context, id + "part26primitive0", { "bottomCenter" : vector(((((0 + 2400)) + (-8/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (8/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 62.23 * millimeter });
        var body26 = qCreatedBy(id + "part26primitive0", EntityType.BODY);
        fCylinder(context, id + "part26primitive1", { "bottomCenter" : vector(((((((281 - (mouthWidth / 2 + 10)) / 2) + 2400)) + (-(281 - (mouthWidth / 2 + 10))/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((((281 - (mouthWidth / 2 + 10)) / 2) + 2400)) + ((281 - (mouthWidth / 2 + 10))/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 20 * millimeter });
        opBoolean(context, id + "part26union1", { "tools" : qUnion([body26, qCreatedBy(id + "part26primitive1", EntityType.BODY)]), "operationType" : BooleanOperationType.UNION });
        body26 = qUnion([body26, qCreatedBy(id + "part26primitive1", EntityType.BODY), qCreatedBy(id + "part26union1", EntityType.BODY)]);
        fCylinder(context, id + "part26primitive2", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((0 + 6000)), ((0 + 0))) * millimeter, "radius" : 14.4 * millimeter });
        opBoolean(context, id + "part26cut2", { "tools" : qCreatedBy(id + "part26primitive2", EntityType.BODY), "targets" : body26, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part26primitive3", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((12.020815280171309 + 6000)), ((12.020815280171309 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((12.020815280171309 + 6000)), ((12.020815280171309 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part26cut3", { "tools" : qCreatedBy(id + "part26primitive3", EntityType.BODY), "targets" : body26, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part26primitive4", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((-12.020815280171307 + 6000)), ((12.020815280171309 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((-12.020815280171307 + 6000)), ((12.020815280171309 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part26cut4", { "tools" : qCreatedBy(id + "part26primitive4", EntityType.BODY), "targets" : body26, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part26primitive5", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((-12.02081528017131 + 6000)), ((-12.020815280171307 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((-12.02081528017131 + 6000)), ((-12.020815280171307 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part26cut5", { "tools" : qCreatedBy(id + "part26primitive5", EntityType.BODY), "targets" : body26, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        fCylinder(context, id + "part26primitive6", { "bottomCenter" : vector(((((0 + 2400)) + (-50/2))), ((12.020815280171306 + 6000)), ((-12.02081528017131 + 0))) * millimeter, "topCenter" : vector(((((0 + 2400)) + (50/2))), ((12.020815280171306 + 6000)), ((-12.02081528017131 + 0))) * millimeter, "radius" : 2.2 * millimeter });
        opBoolean(context, id + "part26cut6", { "tools" : qCreatedBy(id + "part26primitive6", EntityType.BODY), "targets" : body26, "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });
        setProperty(context, { "entities" : body26, "propertyType" : PropertyType.NAME, "value" : "deploy_output_gear" });
        if (size(evaluateQuery(context, body26)) != 1) throw regenError("Expected one solid: deploy_output_gear");
        }
    }, { "mouthWidth" : 500 * millimeter, "receiverHeight" : 320 * millimeter, "includeCotsEnvelopes" : false, "includeCoralReference" : false });
