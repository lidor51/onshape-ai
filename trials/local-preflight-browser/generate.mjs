import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { holesFor, sha256, validateParameters } from './gate.mjs';

export const root = dirname(fileURLToPath(import.meta.url));
export const fields = [
  ['plateLength', 'Plate length', 'plateLengthMm', 1000],
  ['plateHeight', 'Plate height', 'plateHeightMm', 1000],
  ['plateThickness', 'Plate thickness', 'plateThicknessMm', 100],
  ['innerWidth', 'Inner width', 'innerWidthMm', 1000],
  ['rollerGap', 'Clear roller gap', 'rollerGapMm', 200],
  ['shaftHoleDiameter', 'Shaft hole diameter', 'shaftHoleDiameterMm', 50],
  ['mountHoleDiameter', 'Mount hole diameter', 'mountHoleDiameterMm', 50],
  ['pivotHoleDiameter', 'Pivot hole diameter', 'pivotHoleDiameterMm', 50],
  ['pivotY', 'Pivot Y', null, 1000],
  ['pivotZ', 'Pivot Z', null, 1000],
];
export const encode = value => `${JSON.stringify(value, null, 2)}\n`;

export function dialogFor(parameters) {
  return Object.fromEntries(fields.map(([name, label, key]) => [name, { label, expression: `${key ? parameters[key] : parameters.pivotCenterYZMm[name === 'pivotY' ? 0 : 1]} mm` }]));
}

export function statesFor(fixture) {
  const baseline = { ...fixture.baseline, units: fixture.units, downstreamHole: false };
  const thickness = { ...baseline, plateThicknessMm: 8 };
  const pivot = { ...thickness, pivotCenterYZMm: [30, baseline.pivotCenterYZMm[1]] };
  const width = { ...pivot, innerWidthMm: fixture.revision.innerWidthMm };
  const revision = { ...width, rollerGapMm: fixture.revision.rollerGapMm };
  return { A: baseline, 'B-thickness': thickness, 'B-pivot': pivot, 'B-width': width, 'B-revision': revision, 'B-final-six': { ...revision, downstreamHole: true } };
}

export function sweepFor(fixture) {
  const baseline = statesFor(fixture).A;
  const states = { 'benchmark-revision': { ...baseline, ...fixture.revision } };
  for (const innerWidthMm of [340, 360]) {
    for (const plateThicknessMm of [6.35, 8]) {
      for (const pivotY of [25, 30]) {
        for (const rollerGapMm of [95, 97.5, 100]) {
          states[`w${innerWidthMm}-t${plateThicknessMm}-p${pivotY}-g${rollerGapMm}`] = { ...baseline, innerWidthMm, plateThicknessMm, pivotCenterYZMm: [pivotY, 130], rollerGapMm };
        }
      }
    }
  }
  return states;
}

export function analyticFor(parameters) {
  const holes = validateParameters(parameters);
  const thickness = parameters.plateThicknessMm;
  return {
    evidence: 'analytic expectation only, NOT a measured B-rep or an Onshape result',
    boundsMm: [-parameters.innerWidthMm / 2 - thickness, -parameters.innerWidthMm / 2, 0, parameters.plateLengthMm, parameters.plateBottomZMm, parameters.plateBottomZMm + parameters.plateHeightMm],
    volumeMm3: thickness * (parameters.plateLengthMm * parameters.plateHeightMm - holes.reduce((area, hole) => area + Math.PI * hole.radius ** 2, 0)),
    holes,
  };
}

export function sourceFor(fixture, reusedSource) {
  if (!reusedSource.startsWith('FeatureScript 3070;') || !reusedSource.includes('function makePlate(')) throw new Error('Reusable source contract changed');
  const baseline = statesFor(fixture).A;
  const defaults = dialogFor(baseline);
  return `FeatureScript 3070;
import(path : "onshape/std/geometry.fs", version : "3070.0");

annotation { "Feature Type Name" : "Local preflight left plate" }
export const localPreflightPlate = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
${fields.map(([name, label, , maximum]) => `        annotation { "Name" : "${label}" }\n        isLength(definition.${name}, { (millimeter) : [${name === 'rollerGap' ? 0 : 0.01}, ${parseFloat(defaults[name].expression)}, ${maximum}] } as LengthBoundSpec);`).join('\n')}
    }
    {
        const bottom = ${baseline.plateBottomZMm} * millimeter;
        const minX = -definition.innerWidth / 2 - definition.plateThickness;
        const maxX = -definition.innerWidth / 2;
        const rearY = (${baseline.frontRollerYMm} + ${baseline.rollerDiameterMm}) * millimeter + definition.rollerGap;
        const holes = [
            { "role" : "frontShaft", "center" : vector(${baseline.frontRollerYMm}, ${baseline.rollerZMm}) * millimeter, "diameter" : definition.shaftHoleDiameter },
            { "role" : "rearShaft", "center" : vector(rearY, ${baseline.rollerZMm} * millimeter), "diameter" : definition.shaftHoleDiameter },
${baseline.crossmemberCentersYZMm.map(([centerY, centerZ], index) => `            { "role" : "mount${index}", "center" : vector(${centerY}, ${centerZ}) * millimeter, "diameter" : definition.mountHoleDiameter },`).join('\n')}
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
${fields.map(([name]) => `        "${name}" : ${parseFloat(defaults[name].expression)} * millimeter`).join(',\n')}
    });
`;
}

export function checkSource(source, fixture, reusedSource, parameters) {
  if (source !== sourceFor(fixture, reusedSource)) throw new Error('Source differs from the bounded generator contract');
  validateParameters(parameters);
  const baseline = statesFor(fixture).A;
  const editable = new Set(fields.map(([, , key]) => key).filter(Boolean).concat(['pivotCenterYZMm', 'downstreamHole']));
  if (JSON.stringify(Object.keys(parameters).sort()) !== JSON.stringify(Object.keys(baseline).sort())) throw new Error('Unknown or missing parameter');
  for (const [name, value] of Object.entries(baseline)) {
    if (!editable.has(name) && JSON.stringify(value) !== JSON.stringify(parameters[name])) throw new Error(`Fixed fixture parameter changed: ${name}`);
  }
  for (const [name, , key, maximum] of fields) {
    const value = key ? parameters[key] : parameters.pivotCenterYZMm[name === 'pivotY' ? 0 : 1];
    if (value < (name === 'rollerGap' ? 0 : 0.01) || value > maximum) throw new Error(`Outside dialog range: ${name}`);
  }
  return 'PASS';
}

export function prepare() {
  const started = performance.now();
  const fixtureBytes = readFileSync(join(root, '../../benchmark/intake.json'));
  const reusedBytes = readFileSync(join(root, '../featurescript/intake.fs'));
  const fixture = JSON.parse(fixtureBytes);
  const source = sourceFor(fixture, reusedBytes.toString());
  const artifacts = join(root, 'artifacts');
  mkdirSync(artifacts, { recursive: true });
  writeFileSync(join(artifacts, 'input-benchmark.json'), fixtureBytes);
  writeFileSync(join(artifacts, 'input-source.fs'), reusedBytes);
  writeFileSync(join(root, 'plate.fs'), source);
  const candidates = statesFor(fixture);
  for (const [name, parameters] of Object.entries(candidates)) {
    const directory = join(artifacts, 'candidates', name);
    mkdirSync(directory, { recursive: true });
    checkSource(source, fixture, reusedBytes.toString(), parameters);
    writeFileSync(join(directory, 'parameters.json'), encode(parameters));
    writeFileSync(join(directory, 'dialog.json'), encode(dialogFor(parameters)));
    writeFileSync(join(directory, 'expected.json'), encode(analyticFor(parameters)));
  }
  const sweep = sweepFor(fixture);
  for (const parameters of Object.values(sweep)) checkSource(source, fixture, reusedBytes.toString(), parameters);
  writeFileSync(join(artifacts, 'sweep.json'), encode(sweep));
  const result = {
    status: 'PREPARED_NOT_SOLID_VALIDATED',
    candidates: Object.keys(candidates),
    validParameterSweepCount: Object.keys(sweep).length,
    hashes: { benchmark: sha256(fixtureBytes), reusedSource: sha256(reusedBytes), generatedSource: sha256(source) },
    parameterHashes: Object.fromEntries(Object.entries(candidates).map(([name, parameters]) => [name, sha256(encode(parameters))])),
    featureScriptVersion: 3070,
    inputPath: 'trials/featurescript/intake.fs',
    adaptations: ['Retain pinned 3070 source version', 'Extract cuboid/cylindrical subtraction plate pattern', 'Generate one left plate only', 'Expose ten real length parameters with defaults', 'Add edge and bore-overlap checks', 'Keep downstream sixth hole outside custom FeatureScript'],
    independence: 'Reused source; not independent generation-quality evidence',
    localCompilerClaim: false,
    networkRequests: 0,
    wallTimeMs: performance.now() - started,
  };
  writeFileSync(join(artifacts, 'preparation.json'), encode(result));
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(prepare(), null, 2));