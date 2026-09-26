function(context is Context, queries) {
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
}
