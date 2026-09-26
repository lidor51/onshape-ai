import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { bindingsFor, submitValidated, validateParameters } from './gate.mjs';

const fixture = JSON.parse(readFileSync(new URL('../../benchmark/intake.json', import.meta.url)));
const parameters = { ...fixture.baseline, units: fixture.units, downstreamHole: false };
const makeInputs = values => Object.fromEntries(Object.entries({ source: 'stub source', parameters: JSON.stringify(values), validator: 'validator', dependencies: 'pinned deps', generator: 'generator', fixture: JSON.stringify(fixture), reusedSource: 'input source', gate: 'gate', oracle: 'oracle', dependencyRuntime: 'runtime', dependencySpecification: 'specification', dialog: 'dialog', sweep: 'sweep' }).map(([name, value]) => [name, Buffer.from(value)]));
const makeReport = inputs => ({ status: 'PASS', bindings: bindingsFor(inputs), oracle: { valid: true, closed: true, solids: 1, holeCount: 5, analyticComparison: 'PASS', stepRoundtrip: 'PASS' }, sourceContract: 'PASS' });

test('invalid hole prevents invocation even with matching hashes and a claimed PASS', async () => {
  const inputs = makeInputs({ ...parameters, pivotCenterYZMm: [0, 130] });
  let invoked = 0;
  await assert.rejects(submitValidated(inputs, makeReport(inputs), () => invoked++), /ligament/);
  assert.equal(invoked, 0);
});

test('every changed bound input prevents adapter invocation', async () => {
  for (const name of Object.keys(makeInputs(parameters))) {
    const inputs = makeInputs(parameters);
    const report = makeReport(inputs);
    inputs[name] = name === 'parameters' ? Buffer.from(JSON.stringify({ ...parameters, plateThicknessMm: 8 })) : Buffer.concat([inputs[name], Buffer.from(' changed')]);
    let invoked = 0;
    await assert.rejects(submitValidated(inputs, report, () => invoked++), /Stale/);
    assert.equal(invoked, 0, name);
  }
});

test('failed B-rep check cannot invoke browser stub', async () => {
  const inputs = makeInputs(parameters);
  const report = makeReport(inputs);
  report.oracle.closed = false;
  let invoked = 0;
  await assert.rejects(submitValidated(inputs, report, () => invoked++), /Incomplete/);
  assert.equal(invoked, 0);
});

test('valid stub passes once; this is control-flow evidence only', async () => {
  const inputs = makeInputs(parameters);
  let invoked = 0;
  await submitValidated(inputs, makeReport(inputs), () => invoked++);
  assert.equal(invoked, 1);
});

test('each required binding must be present', () => {
  for (const name of Object.keys(makeInputs(parameters))) {
    const inputs = makeInputs(parameters);
    delete inputs[name];
    assert.throws(() => bindingsFor(inputs), /Missing bound input/);
  }
});

test('negative parameter sweep', () => {
  for (const change of [{ plateThicknessMm: -1 }, { pivotCenterYZMm: [70, 65] }, { units: 'inch' }, { plateThicknessMm: Infinity }, { plateLengthMm: NaN }, { rollerGapMm: -1 }]) {
    assert.throws(() => validateParameters({ ...parameters, ...change }));
  }
});