import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { assertionModel, loadLocalFixture } from './generate.mjs';

const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const failureText = /\b(?:ONLY\d+)?ERROR\b|precondition failed|no features found|evaluation failed|tests? (?:did not|not) run/i;

function responseStrings(value) {
  if (typeof value === 'string') {
    let parsed;
    try { parsed = JSON.parse(value); } catch { }
    if (parsed !== undefined && parsed !== value) return responseStrings(parsed);
    if (failureText.test(value)) throw new Error('Server response reports a compiler/runtime failure');
    return [value];
  }
  if (!value || typeof value !== 'object') return [];
  for (const [key, nested] of Object.entries(value)) {
    if (['isError', 'hasError'].includes(key) && nested === true ||
        ['passed', 'success', 'testsRan'].includes(key) && nested === false ||
        ['status', 'severity', 'featureStatus'].includes(key) && typeof nested === 'string' && /^(?:ERROR|FAIL(?:ED|URE)?)$/i.test(nested) ||
        ['error', 'errors'].includes(key) && nested != null && nested !== false && nested !== '' &&
          !(Array.isArray(nested) && nested.length === 0)) {
      throw new Error('Server response reports a compiler/runtime failure');
    }
  }
  return Object.values(value).flatMap(responseStrings);
}

export function parseMeasurements(response) {
  const lines = responseStrings(response).flatMap(text => text.split(/\r?\n/));
  const parts = [];
  let parametersMm;
  let partCount;
  for (const text of lines) {
    const line = text.trim();
    if (!line.startsWith('OIM1|')) {
      if (line.includes('OIM1')) throw new Error('Malformed OIM1 record');
      continue;
    }
    if (partCount !== undefined) throw new Error('Duplicate or trailing measurement record');
    const fields = line.split('|');
    const tag = fields[1];
    const offset = ['P', 'C'].includes(tag) ? 3 : 2;
    const values = fields.slice(offset).map(field => {
      if (!numeric.test(field) || !Number.isFinite(Number(field))) throw new Error('Non-finite or malformed measurement');
      return Number(field);
    });
    if (tag === 'BEGIN') {
      if (parametersMm || fields.length !== 5) throw new Error('Duplicate or malformed BEGIN');
      parametersMm = { innerWidth: values[0], rollerGap: values[1], plateThickness: values[2] };
      continue;
    }
    if (!parametersMm) throw new Error('Measurement before BEGIN');
    if (tag === 'END') {
      if (fields.length !== 3) throw new Error('Malformed END');
      partCount = values[0];
    } else if (tag === 'P') {
      const role = fields[2];
      if (fields.length !== 11 || parts.some(part => part.role === role)) throw new Error('Duplicate or malformed part');
      parts.push({ role, solidCount: values[0], volumeMm3: values[1],
        minMm: values.slice(2, 5), maxMm: values.slice(5, 8), cylinders: [] });
    } else if (tag === 'C') {
      const part = parts.at(-1);
      if (fields.length !== 16 || !part || part.role !== fields[2]) throw new Error('Orphan or malformed cylinder');
      part.cylinders.push({ radiusMm: values[0], axisOriginMm: values.slice(1, 4),
        axisDirection: values.slice(4, 7), minMm: values.slice(7, 10), maxMm: values.slice(10, 13) });
    } else {
      throw new Error('Unknown measurement record');
    }
  }
  if (!parametersMm || partCount === undefined) throw new Error('Missing or incomplete measurement block');
  return { parametersMm, partCount, parts };
}

function near(actual, expected, tolerance, label) {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) throw new Error(`${label} mismatch`);
}

function vector(value, label) {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) throw new Error(`${label} invalid vector`);
}

export function validateMeasurements(measured, task, phase) {
  if (!['baseline', 'revision'].includes(phase)) throw new Error('Invalid phase');
  const overrides = phase === 'revision' ? task.revision : {};
  const expected = assertionModel(task, overrides);
  const parameters = { ...task.baseline, ...overrides };
  for (const [field, expectedValue] of Object.entries({ innerWidth: parameters.innerWidthMm,
    rollerGap: parameters.rollerGapMm, plateThickness: parameters.plateThicknessMm })) {
    near(measured.parametersMm?.[field], expectedValue, 1e-5, `${field} parameter`);
  }
  if (measured.partCount !== 9 || measured.parts?.length !== 9) throw new Error('Expected nine measured solids');
  for (const [index, expectedPart] of expected.parts.entries()) {
    const actual = measured.parts[index];
    if (actual.role !== expectedPart.role || actual.solidCount !== 1) throw new Error('Part identity or solid count mismatch');
    for (const key of ['minMm', 'maxMm']) {
      vector(actual[key], `${actual.role} ${key}`);
      for (let axis = 0; axis < 3; axis += 1) near(actual[key][axis], expectedPart[key][axis], 1e-5, `${actual.role} ${key}`);
    }
    near(actual.volumeMm3, expectedPart.volumeMm3, Math.max(0.001, expectedPart.volumeMm3 * 1e-8), `${actual.role} volume`);
    if (actual.cylinders?.length !== expectedPart.cylinders.length) throw new Error(`${actual.role} cylinder count mismatch`);
    for (const cylinder of actual.cylinders) {
      for (const key of ['axisOriginMm', 'axisDirection', 'minMm', 'maxMm']) vector(cylinder[key], key);
      if (!Number.isFinite(cylinder.radiusMm) || cylinder.radiusMm <= 0) throw new Error('Invalid cylinder radius');
    }
    const matched = new Set();
    for (const cylinder of expectedPart.cylinders) {
      const matches = actual.cylinders.filter(surface => Math.abs(surface.radiusMm - cylinder.radiusMm) <= 1e-5 &&
        Math.abs(surface.axisOriginMm[1] - cylinder.centerYZMm[0]) <= 1e-5 &&
        Math.abs(surface.axisOriginMm[2] - cylinder.centerYZMm[1]) <= 1e-5);
      if (matches.length !== 1 || matched.has(matches[0])) throw new Error(`${actual.role} missing or duplicated cylinder/bore`);
      const surface = matches[0];
      matched.add(surface);
      near(Math.abs(surface.axisDirection[0]), 1, 1e-8, `${actual.role} cylinder axis X`);
      near(surface.axisDirection[1], 0, 1e-8, `${actual.role} cylinder axis Y`);
      near(surface.axisDirection[2], 0, 1e-8, `${actual.role} cylinder axis Z`);
      near(surface.minMm[0], expectedPart.minMm[0], 1e-5, `${actual.role} through start`);
      near(surface.maxMm[0], expectedPart.maxMm[0], 1e-5, `${actual.role} through end`);
      for (let axis = 1; axis < 3; axis += 1) {
        near(surface.minMm[axis], cylinder.centerYZMm[axis - 1] - cylinder.radiusMm, 1e-5, 'Cylinder transverse minimum');
        near(surface.maxMm[axis], cylinder.centerYZMm[axis - 1] + cylinder.radiusMm, 1e-5, 'Cylinder transverse maximum');
      }
    }
  }
  near(measured.parts[1].minMm[0] - measured.parts[0].maxMm[0], expected.innerWidthMm, 1e-5, 'Inner width');
  near(measured.parts[3].minMm[1] - measured.parts[2].maxMm[1], expected.rollerGapMm, 1e-5, 'Clear roller gap');
  return { status: 'PASS_MEASUREMENTS_ONLY', phase, partCount: measured.partCount,
    holesPerPlate: measured.parts.slice(0, 2).map(part => part.cylinders.length), lengthToleranceMm: 1e-5,
    axisTolerance: 1e-8, volumeToleranceMm3: 'max(0.001, expectedVolume * 1e-8)',
    inputOriginAuthenticated: false, persistedGeometryVerified: false,
    caveat: 'Validates supplied numbers only. Bind the actual tool response to submitted source; require both phases and separate persisted readback.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [phase, path] = process.argv.slice(2);
    if (!path) throw new Error('Usage: node trials/official-mcp/final-measurements.mjs baseline|revision RESPONSE_PATH');
    const { task } = await loadLocalFixture();
    const measured = parseMeasurements(await readFile(path, 'utf8'));
    console.log(JSON.stringify(validateMeasurements(measured, task, phase), null, 2));
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}