import assert from 'node:assert/strict';

export const measurementScript = `function(context is Context, queries) {
    const solids = evaluateQuery(context, qBodyType(qEverything(EntityType.BODY), BodyType.SOLID));
    var measurements = [];
    for (var solid in solids) {
        const name = getProperty(context, { "entity" : solid, "propertyType" : PropertyType.NAME });
        const bounds = evBox3d(context, { "topology" : solid, "tight" : true });
        var cylinders = [];
        for (var face in evaluateQuery(context, qGeometry(qOwnedByBody(solid, EntityType.FACE), GeometryType.CYLINDER))) {
            const surface = evSurfaceDefinition(context, { "face" : face });
            const faceBounds = evBox3d(context, { "topology" : face, "tight" : true });
            cylinders = append(cylinders, {
                "diameterMm" : 2 * surface.radius / millimeter,
                "originMm" : surface.coordSystem.origin / millimeter,
                "axis" : surface.coordSystem.zAxis,
                "minMm" : faceBounds.minCorner / millimeter,
                "maxMm" : faceBounds.maxCorner / millimeter
            });
        }
        var nonBom = false;
        if (name == "coralReference") {
            nonBom = getProperty(context, { "entity" : solid, "propertyType" : PropertyType.EXCLUDE_FROM_BOM });
        }
        measurements = append(measurements, {
            "name" : name, "minMm" : bounds.minCorner / millimeter,
            "maxMm" : bounds.maxCorner / millimeter, "cylinders" : cylinders, "nonBom" : nonBom
        });
    }
    return { "solidCount" : size(solids), "parts" : measurements };
}`;

export function validateMeasurements(measured, expected) {
  const checks = [];
  const near = (actual, target, label) => {
    assert.ok(Number.isFinite(actual) && Math.abs(actual - target) <= 0.01, label);
    checks.push(label);
  };
  assert.equal(measured.solidCount, expected.expectedSolidCount, 'solid count');
  assert.equal(measured.parts.length, expected.parts.length, 'part count');
  assert.equal(new Set(measured.parts.map(part => part.name)).size, expected.parts.length, 'unique names');
  for (const part of expected.parts) {
    const actual = measured.parts.find(item => item.name === part.name);
    assert.ok(actual, `missing ${part.name}`);
    for (const end of ['min', 'max']) {
      part.boundsMm[end].forEach((value, axis) => near(actual[`${end}Mm`][axis], value, `${part.name} ${end}[${axis}]`));
    }
    if (part.throughHoles) {
      assert.equal(actual.cylinders.length, part.throughHoles.length, `${part.name} hole count`);
      for (const hole of part.throughHoles) {
        const cylinder = actual.cylinders.find(item => Math.abs(item.originMm[1] - hole.centerYZMm[0]) <= 0.01 && Math.abs(item.originMm[2] - hole.centerYZMm[1]) <= 0.01);
        assert.ok(cylinder, `${part.name} hole at ${hole.centerYZMm}`);
        near(cylinder.diameterMm, hole.diameterMm, `${part.name} hole diameter ${hole.centerYZMm}`);
        near(Math.abs(cylinder.axis[0]), 1, `${part.name} hole axis`);
        near(cylinder.minMm[0], part.boundsMm.min[0], `${part.name} through-hole start`);
        near(cylinder.maxMm[0], part.boundsMm.max[0], `${part.name} through-hole end`);
      }
    }
    if (part.boreDiameterMm !== undefined) {
      const bore = actual.cylinders.find(item => Math.abs(item.diameterMm - part.boreDiameterMm) <= 0.01);
      assert.ok(bore, `${part.name} bore`);
      near(Math.abs(bore.axis[0]), 1, `${part.name} bore axis`);
      near(bore.minMm[0], part.boundsMm.min[0], `${part.name} bore start`);
      near(bore.maxMm[0], part.boundsMm.max[0], `${part.name} bore end`);
    }
    if (part.nonBom) assert.equal(actual.nonBom, true, `${part.name} excluded from BOM`);
  }
  return { status: 'PASS', toleranceMm: 0.01, solidCount: measured.solidCount, checks };
}