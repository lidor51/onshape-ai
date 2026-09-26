import assert from 'node:assert/strict';
import test from 'node:test';
import { assertionModel, loadLocalFixture } from './generate.mjs';
import { parseMeasurements, validateMeasurements } from './final-measurements.mjs';

const { task } = await loadLocalFixture();

function syntheticFixture(phase = 'baseline') {
  const parameters = { ...task.baseline, ...(phase === 'revision' ? task.revision : {}) };
  const expected = assertionModel(task, parameters);
  return { parametersMm: { innerWidth: parameters.innerWidthMm, rollerGap: parameters.rollerGapMm,
    plateThickness: parameters.plateThicknessMm }, partCount: 9,
    parts: expected.parts.map(part => ({ ...part, solidCount: 1,
      cylinders: part.cylinders.map(cylinder => ({ radiusMm: cylinder.radiusMm,
        axisOriginMm: [0, ...cylinder.centerYZMm], axisDirection: [1, 0, 0],
        minMm: [part.minMm[0], ...cylinder.centerYZMm.map(value => value - cylinder.radiusMm)],
        maxMm: [part.maxMm[0], ...cylinder.centerYZMm.map(value => value + cylinder.radiusMm)],
      })) })) };
}

function records(measured) {
  return [`OIM1|BEGIN|${Object.values(measured.parametersMm).join('|')}`,
    ...measured.parts.flatMap(part => [
      ['OIM1', 'P', part.role, part.solidCount, part.volumeMm3, ...part.minMm, ...part.maxMm].join('|'),
      ...part.cylinders.map(cylinder => ['OIM1', 'C', part.role, cylinder.radiusMm,
        ...cylinder.axisOriginMm, ...cylinder.axisDirection, ...cylinder.minMm, ...cylinder.maxMm].join('|')),
    ]), `OIM1|END|${measured.partCount}`].join('\n');
}

for (const phase of ['baseline', 'revision']) {
  test(`synthetic ${phase} records round-trip and validate without claiming persistence`, () => {
    const text = records(syntheticFixture(phase));
    const parsed = parseMeasurements(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify({
      passed: true, notices: [{ severity: 'WARNING', message: 'Unused declaration' }], console: text,
    }) }] }));
    assert.deepEqual(parsed, syntheticFixture(phase));
    const result = validateMeasurements(parsed, task, phase);
    assert.equal(result.status, 'PASS_MEASUREMENTS_ONLY');
    assert.equal(result.persistedGeometryVerified, false);
    assert.equal(result.inputOriginAuthenticated, false);
    assert.deepEqual(result.holesPerPlate, [5, 5]);
    assert.throws(() => validateMeasurements(parsed, task, phase === 'baseline' ? 'revision' : 'baseline'), /parameter mismatch/);
  });
}

test('all required geometric failure conditions remain enforced', () => {
  const mutations = [
    ['overall part count', measured => { measured.partCount = 10; }],
    ['missing part', measured => { measured.parts.pop(); }],
    ['role', measured => { measured.parts[0].role = 'wrong'; }],
    ['solid count', measured => { measured.parts[0].solidCount = 2; }],
    ['bounds', measured => { measured.parts[0].minMm[0] += 0.001; }],
    ['volume', measured => { measured.parts[0].volumeMm3 += 1; }],
    ['missing hole', measured => { measured.parts[0].cylinders.pop(); }],
    ['extra hole', measured => { measured.parts[0].cylinders.push(measured.parts[0].cylinders[0]); }],
    ['duplicated bore', measured => { measured.parts[0].cylinders[1] = measured.parts[0].cylinders[0]; }],
    ['radius', measured => { measured.parts[0].cylinders[0].radiusMm += 0.001; }],
    ['center', measured => { measured.parts[0].cylinders[0].axisOriginMm[1] += 0.001; }],
    ['axis X', measured => { measured.parts[0].cylinders[0].axisDirection[0] = 0; }],
    ['axis Y', measured => { measured.parts[0].cylinders[0].axisDirection[1] = 0.01; }],
    ['axis Z', measured => { measured.parts[0].cylinders[0].axisDirection[2] = 0.01; }],
    ['blind start', measured => { measured.parts[0].cylinders[0].minMm[0] += 0.001; }],
    ['blind end', measured => { measured.parts[0].cylinders[0].maxMm[0] -= 0.001; }],
    ['face bounds', measured => { measured.parts[0].cylinders[0].minMm[1] += 0.001; }],
    ['non-finite', measured => { measured.parts[0].volumeMm3 = NaN; }],
    ['non-finite axis origin', measured => { measured.parts[0].cylinders[0].axisOriginMm[0] = Infinity; }],
    ['inner width', measured => { measured.parametersMm.innerWidth += 1; }],
    ['roller gap', measured => { measured.parametersMm.rollerGap += 1; }],
  ];
  for (const [label, mutate] of mutations) {
    const measured = syntheticFixture();
    mutate(measured);
    assert.throws(() => validateMeasurements(measured, task, 'baseline'), undefined, label);
  }
});

test('parser rejects absent, incomplete, duplicate, malformed and non-finite records', () => {
  const text = records(syntheticFixture());
  for (const invalid of ['', text.replace(/OIM1\|END\|9$/, ''), `${text}\n${text}`,
    text.replace('OIM1|BEGIN|340|100|6.35', ''), text.replace('|340|', '|NaN|'),
    text.replace('|340|', '|1e999|'), text.replace('|340|', '||'),
    text.replace('OIM1|P|leftPlate', 'OIM1|C|leftPlate'), text.replace('OIM1|END|9', 'OIM1|OTHER|9'),
    text.replace('OIM1|END|9', 'prefix OIM1|END|9'), `${text}\nOIM1|END|9`]) {
    assert.throws(() => parseMeasurements(invalid));
  }
});

test('compiler/runtime failures cannot pass even with valid records; warnings alone may pass', () => {
  const console = records(syntheticFixture());
  for (const failure of [{ isError: true }, { passed: false }, { testsRan: false }, { success: false },
    { status: 'FAILED' }, { notices: [{ severity: 'ERROR' }] }, { errors: ['failed'] },
    { notices: 'Evaluation notices: ONLY1ERROR' }, { result: 'Precondition failed' },
    { result: 'no features found' }]) {
    assert.throws(() => parseMeasurements({ ...failure, console }), /failure/);
  }
  assert.equal(parseMeasurements({ notices: 'ONLY4WARNING Unused declaration', errors: [], console }).partCount, 9);
});