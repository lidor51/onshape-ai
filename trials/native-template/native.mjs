import { parameters, measure, specification } from './model.mjs';
import { planPatch, applyPatch, hash } from './patch.mjs';

export const quantity = (parameterId, expression) => ({ btType: 'BTMParameterQuantity-147', parameterId, expression });
const string = (parameterId, value) => ({ btType: 'BTMParameterString-149', parameterId, value });
const enumeration = (parameterId, enumName, value) => ({ btType: 'BTMParameterEnum-145', parameterId, enumName, value });
const boolean = (parameterId, value) => ({ btType: 'BTMParameterBoolean-144', parameterId, value });
const query = (parameterId, queryString) => ({ btType: 'BTMParameterQueryList-148', parameterId,
  queries: [{ btType: 'BTMIndividualQuery-138', queryString }] });
const created = (featureId, type = 'FACE') => `query=qCreatedBy(makeId("${featureId}"), EntityType.${type});`;
const origin = () => query('externalSecond', created('Origin', 'VERTEX'));
const feature = (featureId, name, featureType, values) => ({ btType: 'BTMFeature-134',
  featureId, name, featureType, namespace: '', suppressed: false, returnAfterSubfeatures: false, parameters: values });

export function variable(name, expression) {
  return feature(`var-${name}`, `Control: ${name}`, 'assignVariable', [
    string('name', name), enumeration('mode', 'VariableMode', 'ASSIGNED'),
    enumeration('variableType', 'VariableType', 'LENGTH'), quantity('lengthValue', expression), quantity('value', expression) ]);
}

function constraint(entityId, constraintType, values) {
  return { btType: 'BTMSketchConstraint-2', entityId, constraintType, drivenDimension: false, parameters: values };
}
function distance(entityId, first, expression, direction, second) {
  return constraint(entityId, 'DISTANCE', [string('localFirst', first),
    second ? string('localSecond', second) : origin(), quantity('length', expression),
    enumeration('direction', 'DimensionDirection', direction)]);
}
function sketch(featureId, name, entities, constraints) {
  return { ...feature(featureId, name, 'newSketch', [query('sketchPlane', created('plate-plane'))]),
    btType: 'BTMSketch-151', entities, constraints };
}
function profile(candidate) {
  const points = [[0, candidate.plateBottomZ], [candidate.plateLength, candidate.plateBottomZ],
    [candidate.plateLength, candidate.plateBottomZ + candidate.plateHeight], [0, candidate.plateBottomZ + candidate.plateHeight]];
  const entities = points.map((point, index) => {
    const next = points[(index + 1) % 4];
    const delta = [next[0] - point[0], next[1] - point[1]];
    const length = Math.hypot(...delta);
    return { btType: 'BTMSketchCurveSegment-155', entityId: `edge${index}`, startPointId: `edge${index}.start`,
      endPointId: `edge${index}.end`, startParam: 0, endParam: length / 1000,
      geometry: { btType: 'BTCurveGeometryLine-117', pntX: point[0] / 1000, pntY: point[1] / 1000,
        dirX: delta[0] / length, dirY: delta[1] / length } };
  });
  const constraints = entities.flatMap((entity, index) => [
    constraint(`join${index}`, 'COINCIDENT', [string('localFirst', `${entity.entityId}.end`), string('localSecond', `edge${(index + 1) % 4}.start`)]),
    constraint(`axis${index}`, index % 2 ? 'VERTICAL' : 'HORIZONTAL', [string('localFirst', entity.entityId)]),
  ]);
  constraints.push(constraint('anchor-horizontal', 'VERTICAL', [string('localFirst', 'edge0.start'), origin()]),
    distance('bottom', 'edge0.start', '#plateBottomZ', 'VERTICAL'),
    distance('length', 'edge0.start', '#plateLength', 'HORIZONTAL', 'edge0.end'),
    distance('height', 'edge1.start', '#plateHeight', 'VERTICAL', 'edge1.end'));
  return sketch('plate-profile', 'Plate profile: length / height / bottom', entities, constraints);
}
function extrude(featureId, name, sketchId, operation) {
  return feature(featureId, name, 'extrude', [enumeration('bodyType', 'ExtendedToolBodyType', 'SOLID'),
    enumeration('operationType', 'NewBodyOperationType', operation),
    { btType: 'BTMParameterQueryList-148', parameterId: 'entities',
      queries: [{ btType: 'BTMIndividualSketchRegionQuery-140', featureId: sketchId }] },
    enumeration('endBound', 'BoundingType', 'BLIND'), quantity('depth', '#plateThickness'),
    boolean('oppositeDirection', true), ...(operation === 'REMOVE' ? [boolean('defaultScope', false),
      query('booleanScope', created('plate-extrude', 'BODY'))] : [])]);
}
function holeFeatures(hole, index) {
  const expressions = [ ['#frontRollerY', '#rollerZ', '#shaftHoleDiameter'],
    ['#rearRollerY', '#rollerZ', '#shaftHoleDiameter'], ['#mount1Y', '#mount1Z', '#mountHoleDiameter'],
    ['#mount2Y', '#mount2Z', '#mountHoleDiameter'], ['#pivotY', '#pivotZ', '#pivotHoleDiameter'],
    ['200 mm', '40 mm', '4 mm'] ][index];
  const sketchId = index === 5 ? 'editor-hole-sketch' : `hole-sketch-${index}`;
  const cutId = index === 5 ? 'editor-hole-cut' : `hole-cut-${index}`;
  return [sketch(sketchId, `${hole.name}: constrained hole sketch`, [{ btType: 'BTMSketchCurve-4',
    entityId: 'circle', centerId: 'circle.center', geometry: { btType: 'BTCurveGeometryCircle-115',
      radius: hole.diameter / 2000, xCenter: hole.center[0] / 1000, yCenter: hole.center[1] / 1000,
      xDir: 1, yDir: 0, clockwise: false } }], [
    distance('center-y', 'circle.center', expressions[0], 'HORIZONTAL'),
    distance('center-z', 'circle.center', expressions[1], 'VERTICAL'),
    constraint('diameter', 'DIAMETER', [string('localFirst', 'circle'), quantity('length', expressions[2])]),
  ]), extrude(cutId, `${hole.name}: through plate cut`, sketchId, 'REMOVE')];
}

export function buildNative(candidate = parameters()) {
  const geometry = measure(candidate);
  const features = Object.entries(candidate).filter(([name]) => !['units', 'downstream'].includes(name))
    .map(([name, value]) => variable(name, `${value} mm`));
  features.push(variable('rearRollerY', '#frontRollerY + #rollerDiameter + #rollerGap'),
    feature('plate-plane', 'Left inner face: -innerWidth / 2', 'cPlane', [
      enumeration('cplaneType', 'CPlaneType', 'OFFSET'), query('entities', created('Right')),
      quantity('offset', '#innerWidth / 2'), boolean('oppositeDirection', true)]),
    profile(candidate), extrude('plate-extrude', 'Left plate: thickness', 'plate-profile', 'NEW'),
    ...geometry.holes.flatMap(holeFeatures));
  return { evidence: 'unvalidated native REST candidate; seed geometry is not a solved sketch',
    parameters: structuredClone(candidate), features };
}

export function stages() {
  const baseline = buildNative();
  const templatecopy = structuredClone(baseline);
  const editorParameters = { ...baseline.parameters, plateThickness: 8, pivotY: 30, downstream: true };
  const simulatededitor = structuredClone(templatecopy);
  simulatededitor.parameters = editorParameters;
  for (const [name, expression] of [['plateThickness', '8 mm'], ['pivotY', '30 mm']]) {
    for (const parameter of simulatededitor.features.find(item => item.featureId === `var-${name}`).parameters) {
      if (['value', 'lengthValue'].includes(parameter.parameterId)) parameter.expression = expression;
    }
  }
  simulatededitor.features.push(...buildNative(editorParameters).features.slice(-2));
  const snapshot = { microversion: 'LOCAL-editor-1-NOT-ONSHAPE', features: simulatededitor.features };
  const patch = planPatch(snapshot, { innerWidth: specification.revision.innerWidthMm, rollerGap: specification.revision.rollerGapMm });
  const revision = { ...simulatededitor, parameters: { ...editorParameters,
    innerWidth: specification.revision.innerWidthMm, rollerGap: specification.revision.rollerGapMm }, features: applyPatch(snapshot, patch).features };
  return { baseline, templatecopy, simulatededitor, revision, snapshot, patch,
    preservation: { templateUnchangedHash: hash(baseline), copiedDefinitionHash: hash(templatecopy),
      changedFeatureIds: patch.changes.map(change => change.featureId), simulatedOnly: true } };
}

export function controlMap(candidate) {
  return { part: { semanticId: 'leftPlate', sourceFeature: 'plate-extrude', serverPartId: null,
    resolver: 'exactly one solid from bodydetails, validate bounds/holes/volume, rebind at every microversion' },
  controls: candidate.features.filter(item => item.featureType === 'assignVariable').map(item => ({
    featureId: item.featureId, name: item.parameters.find(value => value.parameterId === 'name').value,
    dialog: item.name, aiOwned: ['var-innerWidth', 'var-rollerGap'].includes(item.featureId) })),
  constraints: candidate.features.filter(item => item.featureType === 'newSketch').map(item => ({
    featureId: item.featureId, count: item.constraints.length, intendedRemainingDOF: 0,
    actualSolverDOF: null, status: 'UNVERIFIED', expressions: item.constraints.flatMap(value => value.parameters)
      .filter(value => value.expression).map(value => value.expression) })) };
}