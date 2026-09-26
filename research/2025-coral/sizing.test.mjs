import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canBeginAcquisition, canClearJam, canReleaseToReceiver, coralInertia, createSizingReport,
  motorReference, pivotScreen, rollerScreen, surfaceSpeedMps } from './sizing.mjs';

const load = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const inputs = load('concept-inputs.json');
const rules = load('rules.json');
const catalog = load('cots.json');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8);

test('roller SI conversion and reductions use mechanical speed, not assumed duty cycle', () => {
  near(surfaceSpeedMps(100, 6000, 10), Math.PI);
  const screen = rollerScreen(127, 7758, 3, 3);
  assert.ok(screen.requiredFractionOfMotorFreeSpeed < 0.18);
  assert.equal(screen.loadAndTractionVerified, false);
  assert.equal(rollerScreen(100, 600, 10, 1).noLoadSpeedReachable, false);
});

test('invalid units/dimensions cannot become plausible sizing values', () => {
  for (const invalid of [-1, 0, NaN, Infinity, '127']) assert.throws(() => surfaceSpeedMps(invalid, 6000, 3));
  assert.throws(() => surfaceSpeedMps(127, 6000, 0));
  assert.throws(() => rollerScreen(127, 6000, 3, -1));
});

test('motor screen keeps one dated source and mode and does not assume FOC licensing', () => {
  const reference = motorReference(catalog, 'x44', 'trapezoidal');
  assert.equal(reference.voltageV, 12);
  assert.equal(reference.freeRpm, 7758);
  assert.equal(reference.endpointTorqueNm, 4.113);
  assert.equal(reference.testDate, '2025-09-26');
  assert.throws(() => motorReference(catalog, 'missing', 'trapezoidal'));
  assert.throws(() => createSizingReport({ ...inputs, motorMode: 'FOC' }, rules, catalog));
});

test('pivot motion integrates to requested angle and heavier load increases demand', () => {
  const assumptions = inputs.designAssumptions;
  const reference = motorReference(catalog, 'x44', 'trapezoidal');
  const coral = coralInertia(0.816466266, 301.625, 114.3, 101.6);
  const baseline = pivotScreen(assumptions, coral.massKg, reference, 50, coral.worstAxisCentroidalInertiaKgM2);
  near(baseline.peakSpeedRadS * assumptions.pivotMoveDurationS / 2, assumptions.pivotTravelDeg * Math.PI / 180);
  const heavier = pivotScreen({ ...assumptions, pivotMovingStructureMassKg: 6, pivotStructureInertiaKgM2: assumptions.pivotStructureInertiaKgM2 * 1.5 }, coral.massKg, reference, 50, coral.worstAxisCentroidalInertiaKgM2);
  assert.ok(heavier.conservativeOutputTorqueNm > baseline.conservativeOutputTorqueNm);
  const slower = pivotScreen({ ...assumptions, pivotMoveDurationS: 1.5 }, coral.massKg, reference, 50, coral.worstAxisCentroidalInertiaKgM2);
  assert.ok(slower.conservativeOutputTorqueNm < baseline.conservativeOutputTorqueNm);
  assert.equal(baseline.thermalImpactAndGearStrength, 'UNVERIFIED');
  assert.throws(() => pivotScreen({ ...assumptions, pivotAssumedEfficiency: 1.1 }, coral.massKg, reference, 50, coral.worstAxisCentroidalInertiaKgM2));
  assert.throws(() => pivotScreen({ ...assumptions, pivotMovingStructureMassKg: 6 }, coral.massKg, reference, 50, coral.worstAxisCentroidalInertiaKgM2), /parallel-axis/);
  assert.throws(() => pivotScreen({ ...assumptions, pivotStructureInertiaAxis: 'center of mass' }, coral.massKg, reference, 50, coral.worstAxisCentroidalInertiaKgM2));
  assert.ok(coral.worstAxisCentroidalInertiaKgM2 > 0);
  assert.throws(() => coralInertia(0.8, 300, 100, 110));
});

test('scalar rules screen is not mislabeled full swept clearance', () => {
  const report = createSizingReport(inputs, rules, catalog);
  assert.equal(report.candidateEnvelope.perimeterMm, 2920);
  assert.equal(report.candidateEnvelope.perimeterMarginMm, 128);
  near(report.candidateEnvelope.frontExtensionMarginMm, 57.2);
  assert.ok(report.candidateEnvelope.exactUninflatedCoralYawDiskDiameterMm > 322);
  assert.match(report.candidateEnvelope.fullSweepBumperAndCableClearance, /UNVERIFIED/);
  assert.equal(report.cadCreated, false);
});

test('whole-robot one-coral interlock rejects receiver occupancy and unknown sensing', () => {
  const state = { occupancyKnown: true, robotCoralCount: 0, receiverHasCoral: false, pathClear: true, pickupDeployed: true, fault: false };
  assert.equal(canBeginAcquisition(state), true);
  for (const patch of [{ robotCoralCount: 1 }, { receiverHasCoral: true }, { occupancyKnown: false }, { fault: true }, { pickupDeployed: false }, { pathClear: false }]) {
    assert.equal(canBeginAcquisition({ ...state, ...patch }), false);
  }
  assert.equal(canBeginAcquisition({}), false);
});

test('release requires receiver confirmation for the same single coral, not mere readiness', () => {
  const state = { occupancyKnown: true, robotCoralCount: 1, receiverReady: true, receiverAligned: true, receiverHasSameCoralConfirmed: true, fault: false };
  assert.equal(canReleaseToReceiver(state), true);
  for (const patch of [{ receiverHasSameCoralConfirmed: false }, { receiverAligned: false }, { receiverReady: false }, { robotCoralCount: 2 }, { occupancyKnown: false }, { fault: true }]) {
    assert.equal(canReleaseToReceiver({ ...state, ...patch }), false);
  }
});

test('jam clearing requires separate release-path and field-location permission', () => {
  const state = { lowEnergyMode: true, releasePathClear: true, locationAllowsRelease: true, retryBudgetRemaining: true, operatorAbort: false };
  assert.equal(canClearJam(state), true);
  for (const patch of [{ lowEnergyMode: false }, { releasePathClear: false }, { locationAllowsRelease: false }, { retryBudgetRemaining: false }, { operatorAbort: true }]) {
    assert.equal(canClearJam({ ...state, ...patch }), false);
  }
});