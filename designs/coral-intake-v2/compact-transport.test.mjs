import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { bumperGate, chordHalfWidth, correctedCenters, evaluate, evaluateTransport, loadInputs,
  pointBoxDistance, readInputs, sidewaysCrest, solveLocalCorrection } from './compact-transport.mjs';

test('source-backed deployed screen reports dimensions without loading CAD', context => {
  const report = evaluateTransport();
  assert.equal(report.continuous_supported_powered_path_proven, false);
  assert.equal(report.release_ready, false);
  assert.equal(report.entry_evidence.source_current, true);
  context.diagnostic(JSON.stringify({ status: report.status,
    middle_aperture_mm: report.bumper_checks[0].hard_gap_upper_bound_mm,
    lengthwise_overlap_mm: report.lengthwise.optimistic_powered_overlap_mm,
    correction_tray_contact_lost: report.correction_downstream_regression.corrected_lengthwise_contact_bounds.last_upper_contact_center_y_mm === null }));
});

test('circle chord has exact limiting and separated cases', () => {
  assert.equal(chordHalfWidth(5, 3), 4);
  assert.equal(chordHalfWidth(5, 5), 0);
  assert.equal(chordHalfWidth(5, 6), null);
});

test('rear-row crest constraint rejects nominal circle and responds to height', () => {
  const { centers, params } = readInputs();
  const baseline = sidewaysCrest({ rear: centers.rear, bumperTop: 165, diameter: params.coral.od, rollerRadius: 63.7 });
  assert.ok(Math.abs(baseline.maximum_effective_roller_radius_mm - 10.466886753) < 1e-6);
  assert.equal(baseline.rigid_circle_underpass_possible, false);
  const corrected = sidewaysCrest({ rear: [-9, 165 + 114.3 + 63.7], bumperTop: 165, diameter: 114.3, rollerRadius: 63.7 });
  assert.equal(corrected.rigid_circle_underpass_possible, true);
});

const near = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const inputs = loadInputs();

test('source-derived centers preserve the live deployed pickup, not the old v1 centers', () => {
  near(inputs.centers.front[0], -261);
  near(inputs.centers.front[1], 170.3484861008832);
  near(inputs.centers.rear[0], -9);
  near(Math.hypot(...inputs.centers.middle.map((value, axis) => value - inputs.centers.front[axis])), 155);
});

test('circle-to-box distance handles faces and corners', () => {
  near(pointBoxDistance([-136, 262], [-85, 45], [0, 165]), Math.hypot(51, 97));
  near(pointBoxDistance([-9, 289], [-85, 45], [0, 165]), 124);
});

test('middle shaft alone closes the nominal under-row bumper channel', () => {
  const middle = bumperGate(inputs)[0];
  assert.ok(middle.hard_gap_upper_bound_mm < inputs.params.coral.od);
  assert.ok(middle.hard_od_margin_upper_bound_mm < -10);
  assert.equal(evaluate(inputs).status, 'BLOCKED_UNDER_ROW_CHANNEL');
});

test('local hole-layout correction clears only the analytic gate and retains both belt centers', () => {
  for (const allowance of [0, 10]) {
    const candidate = solveLocalCorrection(inputs, allowance);
    const centers = candidate.centers_yz_mm;
    assert.deepEqual(centers.front, inputs.centers.front);
    assert.deepEqual(centers.kick, inputs.centers.kick);
    near(Math.hypot(...centers.middle.map((value, axis) => value - centers.front[axis])), 155);
    near(Math.hypot(...centers.rear.map((value, axis) => value - centers.middle[axis])), 130);
    assert.ok(candidate.bumper_checks.every(row => row.unloaded_star_gap_mm + allowance >= inputs.params.coral.od - 1e-8));
    assert.ok(bumperGate(inputs, correctedCenters(inputs, candidate.front_to_middle_angle_deg - 0.01))
      .some(row => row.unloaded_star_gap_mm + allowance < inputs.params.coral.od));
    assert.equal(candidate.qualified, false);
  }
});

test('finite length preserves possible overlap with the third bank despite the wide early banks', () => {
  const result = evaluateTransport().lengthwise;
  assert.deepEqual(result.stations.map(station => station.reaches_centered_lengthwise_pipe), [false, false, true]);
  assert.ok(result.optimistic_powered_overlap_mm > 60);
  near(result.third_bank_diametral_interference_mm, 6);
  near(result.earliest_tray_overlap_center_y_mm, 79.1875);
});

test('near-wall envelope possibility is distinct from source-phase contact', () => {
  const result = evaluateTransport().near_wall;
  assert.ok(result.sideways_front_outer_circle_overlap_mm > 0);
  near(result.cached_phase_contact_requires_wall_penetration_mm, 7.7);
  near(result.extra_standoff_for_flat_lengthwise_piece_mm, 33.625);
});

test('flat lengthwise crest cannot be substituted for an untested pitch transition', () => {
  const result = evaluateTransport().flat_lengthwise_crest;
  assert.equal(result.flat_pipe_spans_shaft_and_bumper, true);
  near(result.flat_vertical_aperture_upper_bound_mm, 90.65);
  near(result.flat_od_margin_upper_bound_mm, -23.65);
});

test('crest-only repair loses rear contact at the retained tray height and cannot be released', () => {
  const result = evaluateTransport().correction_downstream_regression;
  near(result.rear_surface_above_tray_pipe_top_mm, 31.15);
  assert.equal(result.corrected_lengthwise_contact_bounds.last_upper_contact_center_y_mm, null);
  assert.equal(result.corrected_lengthwise_contact_bounds.optimistic_powered_overlap_mm, null);
  assert.equal(result.full_transport_fix, false);
});

test('functional CLI gate exits nonzero although regression tests correctly pass', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./compact-transport.mjs', import.meta.url)), '--gate'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).status, 'BLOCKED_UNDER_ROW_CHANNEL');
  assert.equal(result.stderr, '');
});