function(context is Context, queries is map)
{
    const bodies = qBodyType(qEverything(EntityType.BODY), BodyType.SOLID);
    const bounds = evBox3d(context, { "topology" : bodies, "tight" : true });
    const minimum = bounds.minCorner / millimeter;
    const maximum = bounds.maxCorner / millimeter;
    var holes = [];
    const faces = evaluateQuery(context, qGeometry(qOwnedByBody(bodies, EntityType.FACE), GeometryType.CYLINDER));
    for (var face in faces)
    {
        const surface = evSurfaceDefinition(context, { "face" : face });
        const faceBounds = evBox3d(context, { "topology" : face, "tight" : true });
        holes = append(holes, {
            "u" : surface.coordSystem.origin[1] / millimeter,
            "v" : surface.coordSystem.origin[2] / millimeter - 12.7,
            "diameter" : 2 * surface.radius / millimeter,
            "axis" : surface.coordSystem.zAxis,
            "x_min" : faceBounds.minCorner[0] / millimeter,
            "x_max" : faceBounds.maxCorner[0] / millimeter
        });
    }
    return {
        "units" : "mm",
        "solid_count" : size(evaluateQuery(context, bodies)),
        "part_ids" : transientQueriesToStrings(evaluateQuery(context, bodies)),
        "world_bounds" : [minimum[0], minimum[1], minimum[2], maximum[0], maximum[1], maximum[2]],
        "thickness" : maximum[0] - minimum[0],
        "width" : maximum[1] - minimum[1],
        "height" : maximum[2] - minimum[2],
        "volume" : evVolume(context, { "entities" : bodies }) / (millimeter * millimeter * millimeter),
        "holes" : holes
    };
}