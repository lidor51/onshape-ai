import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { compactFeatureScript, loadLocalFixture, sha256 } from './generate.mjs';

export function finalRepairSource(task, phase = 'baseline') {
  if (!['baseline', 'revision'].includes(phase)) throw new Error('Invalid phase');
  const parameters = task.baseline;
  const defaults = { ...parameters, ...(phase === 'revision' ? task.revision : {}) };
  const reference = task.coralReference;
  const centers = parameters.crossmemberCentersYZMm;
  const holes = JSON.stringify([
    [parameters.frontRollerYMm, parameters.rollerZMm, parameters.shaftHoleDiameterMm],
    ['REAR', parameters.rollerZMm, parameters.shaftHoleDiameterMm],
    ...centers.map(center => [...center, parameters.mountHoleDiameterMm]),
    [...parameters.pivotCenterYZMm, parameters.pivotHoleDiameterMm],
  ]).replace('"REAR"', 'rear');
  const source = compactFeatureScript(`FeatureScript 3070;
import(path : "onshape/std/common.fs", version : "3070.0");
function makeBox(context is Context, partId is Id, minimum is Vector, maximum is Vector)
{
  fCuboid(context, partId, { "corner1" : minimum * millimeter, "corner2" : maximum * millimeter });
}
function makeCylinder(context is Context, partId is Id, start is number, end is number,
  center is array, radius is number)
{
  fCylinder(context, partId, { "bottomCenter" : vector(start, center[0], center[1]) * millimeter,
    "topCenter" : vector(end, center[0], center[1]) * millimeter, "radius" : radius * millimeter });
}
function labelPart(context is Context, partId is Id, name is string)
{
  setProperty(context, { "entities" : qCreatedBy(partId, EntityType.BODY),
    "propertyType" : PropertyType.NAME, "value" : name });
}
function drilledPlate(context is Context, partId is Id, start is number, end is number, rear is number)
{
  makeBox(context, partId + "stock", vector(start, 0, ${parameters.plateBottomZMm}),
    vector(end, ${parameters.plateLengthMm}, ${parameters.plateBottomZMm + parameters.plateHeightMm}));
  const holes = ${holes};
  var cutters = [];
  for (var index = 0; index < size(holes); index += 1)
  {
    const cutterId = partId + ("hole" ~ index);
    const hole = holes[index];
    makeCylinder(context, cutterId, start - 1, end + 1, [hole[0], hole[1]], hole[2] / 2);
    cutters = append(cutters, qCreatedBy(cutterId, EntityType.BODY));
  }
  opBoolean(context, partId + "drill", { "targets" : qCreatedBy(partId + "stock", EntityType.BODY),
    "tools" : qUnion(cutters), "operationType" : BooleanOperationType.SUBTRACTION });
}
function makeTube(context is Context, partId is Id, length is number, center is array,
  outer is number, inner is number)
{
  makeCylinder(context, partId + "outside", -length / 2, length / 2, center, outer / 2);
  if (inner > 0)
  {
    makeCylinder(context, partId + "bore", -length / 2 - 1, length / 2 + 1, center, inner / 2);
    opBoolean(context, partId + "hollow", { "targets" : qCreatedBy(partId + "outside", EntityType.BODY),
      "tools" : qCreatedBy(partId + "bore", EntityType.BODY), "operationType" : BooleanOperationType.SUBTRACTION });
  }
}
function emit(tag is string, values is array)
{
  var text = "OIM1|" ~ tag;
  for (var value in values) text = text ~ "|" ~ value;
  println(text);
}
function measure(context is Context, featureId is Id, roles is array)
{
  for (var role in roles)
  {
    const bodies = qBodyType(qCreatedBy(featureId + role, EntityType.BODY), BodyType.SOLID);
    const bounds = evBox3d(context, { "topology" : bodies, "tight" : true });
    const minimum = bounds.minCorner / millimeter;
    const maximum = bounds.maxCorner / millimeter;
    emit("P|" ~ role, [size(evaluateQuery(context, bodies)),
      evVolume(context, { "entities" : bodies }) / millimeter^3,
      minimum[0], minimum[1], minimum[2], maximum[0], maximum[1], maximum[2]]);
    const faces = evaluateQuery(context, qGeometry(qOwnedByBody(bodies, EntityType.FACE), GeometryType.CYLINDER));
    for (var face in faces)
    {
      const surface = evSurfaceDefinition(context, { "face" : face });
      const origin = surface.coordSystem.origin / millimeter;
      const axis = surface.coordSystem.zAxis;
      const limits = evBox3d(context, { "topology" : face, "tight" : true });
      const low = limits.minCorner / millimeter;
      const high = limits.maxCorner / millimeter;
      emit("C|" ~ role, [surface.radius / millimeter, origin[0], origin[1], origin[2],
        axis[0], axis[1], axis[2], low[0], low[1], low[2], high[0], high[1], high[2]]);
    }
  }
  emit("END", [size(evaluateQuery(context, qBodyType(qCreatedBy(featureId, EntityType.BODY), BodyType.SOLID)))]);
}
annotation { "Feature Type Name" : "OfficialIntakeFinal" }
export const officialIntakeFinal = defineFeature(function(context is Context, id is Id, definition is map)
precondition {}
{
  const width = definition.innerWidth;
  const thickness = definition.plateThickness;
  const rear = ${parameters.frontRollerYMm + parameters.rollerDiameterMm} + definition.rollerGap;
  const roles = ${JSON.stringify(task.requiredParts)};
  drilledPlate(context, id + "leftPlate", -width / 2 - thickness, -width / 2, rear);
  drilledPlate(context, id + "rightPlate", width / 2, width / 2 + thickness, rear);
  const rollerLength = width - ${2 * parameters.rollerSideClearanceMm};
  const shaftLength = width + 2 * thickness + ${2 * parameters.shaftEndExtensionMm};
  makeTube(context, id + "frontRoller", rollerLength, [${parameters.frontRollerYMm}, ${parameters.rollerZMm}],
    ${parameters.rollerDiameterMm}, ${parameters.shaftDiameterMm});
  makeTube(context, id + "rearRoller", rollerLength, [rear, ${parameters.rollerZMm}],
    ${parameters.rollerDiameterMm}, ${parameters.shaftDiameterMm});
  makeTube(context, id + "frontShaft", shaftLength, [${parameters.frontRollerYMm}, ${parameters.rollerZMm}],
    ${parameters.shaftDiameterMm}, 0);
  makeTube(context, id + "rearShaft", shaftLength, [rear, ${parameters.rollerZMm}], ${parameters.shaftDiameterMm}, 0);
  makeBox(context, id + "frontCrossmember",
    vector(-width / 2, ${centers[0][0] - parameters.crossmemberSizeMm / 2}, ${centers[0][1] - parameters.crossmemberSizeMm / 2}),
    vector(width / 2, ${centers[0][0] + parameters.crossmemberSizeMm / 2}, ${centers[0][1] + parameters.crossmemberSizeMm / 2}));
  makeBox(context, id + "rearCrossmember",
    vector(-width / 2, ${centers[1][0] - parameters.crossmemberSizeMm / 2}, ${centers[1][1] - parameters.crossmemberSizeMm / 2}),
    vector(width / 2, ${centers[1][0] + parameters.crossmemberSizeMm / 2}, ${centers[1][1] + parameters.crossmemberSizeMm / 2}));
  makeTube(context, id + "coralReference", ${reference.lengthMm}, [${reference.centerYMm}, ${reference.centerZMm}],
    ${reference.outerDiameterMm}, ${reference.innerDiameterMm});
  for (var role in roles) labelPart(context, id + role, role);
  setProperty(context, { "entities" : qCreatedBy(id + "coralReference", EntityType.BODY),
    "propertyType" : PropertyType.EXCLUDE_FROM_BOM, "value" : true });
  emit("BEGIN", [width, definition.rollerGap, thickness]);
  measure(context, id, roles);
}, { "innerWidth" : ${defaults.innerWidthMm}, "rollerGap" : ${defaults.rollerGapMm},
  "plateThickness" : ${defaults.plateThicknessMm} });
`);
  if (source.length > 6000 || source.split('\n').some(line => line.length >= 1200)) {
    throw new Error(`Final repair source exceeds budget: ${source.length} characters`);
  }
  return source;
}

export async function generateFinalRepair() {
  const { task, fixtureSha256 } = await loadLocalFixture();
  const files = [];
  for (const phase of ['baseline', 'revision']) {
    const source = finalRepairSource(task, phase);
    const name = `final-repair-${phase}`;
    await writeFile(new URL(`./artifacts/${name}.fs`, import.meta.url), source);
    await writeFile(new URL(`./artifacts/${name}.test.payload.json`, import.meta.url),
      `${JSON.stringify({ code: source })}\n`);
    await writeFile(new URL(`./artifacts/${name}.create.payload.json`, import.meta.url),
      `${JSON.stringify({ feature_name: 'OfficialIntakeFinal', feature_code: source, clean: false })}\n`);
    files.push({ phase, sourcePath: `trials/official-mcp/artifacts/${name}.fs`,
      sourceCharacters: source.length, maximumLineCharacters: Math.max(...source.split('\n').map(line => line.length)),
      sourceSha256: sha256(source) });
  }
  const manifest = { status: 'FINAL_REPAIR_2_OF_2_READY_NOT_EXECUTED', fixtureSha256,
    libraryVersion: 3070, officialCalls: 0, authenticatedRequests: 0,
    onshapeCompilation: 'UNVERIFIED', serverMeasurements: null, persistedGeometryVerified: false,
    declarationProbe: { attribution: 'PARENT_REPORTED_NOT_INDEPENDENTLY_RETRIEVED', compiled: true,
      elementId: '66e03cc911623af502c718c4', microversionId: '43ac8ba4cb0bec1fe6abdab9',
      warnings: ['Unused declaration makeBox', 'Unused declaration makeCylinder',
        'Unused declaration labelPart', 'Unused declaration officialIntakeNear'], errorsReported: false,
      rawResponse: null },
    failurePolicy: 'If the single final execution fails compilation, conclude FAILED_COMPILE_WITHIN_BUDGET; no further repairs or probes.',
    validation: 'OIM1 records must pass final-measurements.mjs for each phase. Regeneration is not persisted readback.',
    files };
  await writeFile(new URL('./artifacts/final-repair-manifest.json', import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generateFinalRepair();