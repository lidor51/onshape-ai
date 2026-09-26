import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const read = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const contract = () => read('compact-qualification.json');

test('review binds its local evidence without promoting a source model to hardware approval', () => {
  const review = contract();
  assert.equal(review.status, 'PROPOSED_NOT_QUALIFIED');
  assert.equal(review.cad_complete, false);
  assert.equal(review.physical_field_ready, false);
  assert.equal(review.physical_tests_executed, 0);
  for (const source of review.local_evidence) {
    const actual = createHash('sha256').update(readFileSync(new URL(source.path, import.meta.url))).digest('hex');
    assert.equal(actual, source.sha256, `Changed evidence: ${source.path}`);
  }
  const bindings = read('../coral-intake-v1/cots/sourcebindings.json').products;
  for (const source of review.components.filter(component => component.binding_key)) {
    assert.equal(source.sku, bindings[source.binding_key].sku);
    assert.equal(source.geometry_sha256, bindings[source.binding_key].sha256);
    const original = new URL(`../../${bindings[source.binding_key].pathrepoRelative}`, import.meta.url);
    assert.equal(createHash('sha256').update(readFileSync(original)).digest('hex'), source.geometry_sha256, source.sku);
  }
});

test('every retained motor has an explicit output path and tooth ratios compose', () => {
  const review = contract();
  assert.deepEqual(review.motors.map(motor => motor.id).sort(), ['deployment', 'indexer_left', 'indexer_right', 'pickup']);
  assert.deepEqual(review.paths.map(path => path.id).sort(), ['deployment', 'indexer_left', 'indexer_right', 'pickup_kicker', 'pickup_upper']);
  const components = new Set(review.components.map(component => component.id));
  for (const path of review.paths) {
    assert.ok(review.motors.some(motor => motor.id === path.motor));
    assert.ok(path.outputs.length && path.stages.length);
    let reduction = 1;
    let direction = 1;
    for (const stage of path.stages) {
      assert.ok(stage.driver_teeth > 0 && stage.driven_teeth > 0);
      assert.ok(components.has(stage.driver_component) && components.has(stage.driven_component));
      assert.equal(stage.driver_teeth, review.components.find(component => component.id === stage.driver_component).teeth);
      assert.equal(stage.driven_teeth, review.components.find(component => component.id === stage.driven_component).teeth);
      if (stage.kind === 'external_spur' && stage.center_mm !== undefined) {
        assert.ok(Math.abs(stage.center_mm - 25.4 * (stage.driver_teeth + stage.driven_teeth) / 40) < 1e-9);
      }
      reduction *= stage.driven_teeth / stage.driver_teeth;
      direction *= stage.kind === 'external_spur' ? -1 : 1;
    }
    assert.ok(Math.abs(reduction - path.reduction) < 1e-9, path.id);
    assert.equal(direction, path.rotation_relative_to_motor, path.id);
    for (const field of ['support', 'retention', 'tension_or_mesh', 'release_blockers']) assert.ok(path[field].length, `${path.id}: ${field}`);
    assert.equal(path.hardware_qualified, false);
  }
  const upper = review.paths.find(path => path.id === 'pickup_upper');
  const kicker = review.paths.find(path => path.id === 'pickup_kicker');
  assert.equal(upper.reduction, 10);
  assert.equal(kicker.rotation_relative_to_motor, -upper.rotation_relative_to_motor);
  assert.ok(Math.abs((51 / kicker.reduction) / (127 / upper.reduction) - review.kicker_surface_speed_ratio) < 1e-9);
});

test('only equal-pulley loops inherit catalog pitch lengths and floating center distance', () => {
  const review = contract();
  const candidates = read('transmission-candidates.json');
  for (const original of candidates.roller_loops) {
    const loop = review.equal_pulley_loops.find(candidate => candidate.rows.join(':') === original.rows.join(':'));
    assert.ok(loop);
    assert.equal(loop.pulley_sku, original.pulley_sku);
    assert.equal(loop.belt_sku, original.belt_sku);
    assert.equal(loop.center_mm, original.nominal_center_mm);
    assert.equal(loop.pitch_length_mm, 2 * loop.center_mm + loop.teeth * loop.pitch_mm);
  }
  assert.equal(review.front_float_axis, 'middle_roller_axis');
  assert.equal(review.belt_qualification, false);
});

test('unequal-pulley belts use pitch geometry and indexer take-up is not hidden', () => {
  const review = contract();
  for (const stage of review.paths.flatMap(path => path.stages).filter(stage => stage.kind === 'open_htd')) {
    const center = stage.nominal_center_mm;
    const radiusDifference = Math.abs(stage.driven_teeth - stage.driver_teeth) * 5 / (2 * Math.PI);
    assert.ok(center > radiusDifference);
    const pitchLength = 2 * Math.sqrt(center ** 2 - radiusDifference ** 2)
      + (stage.driver_teeth + stage.driven_teeth) * 5 / 2
      + 2 * radiusDifference * Math.asin(radiusDifference / center);
    const belt = review.components.find(component => component.id === stage.belt_component);
    assert.ok(Math.abs(pitchLength - belt.pitch_length_mm) < 0.001, stage.output_shaft);
    assert.equal(belt.pitch_length_mm, belt.teeth * 5);
  }
  const stations = read('../coral-intake-v1/params.json').indexer.stations_xy;
  assert.equal(review.indexer_loops_per_bank.length, 2);
  for (const loop of review.indexer_loops_per_bank) {
    const [start, end] = loop.stations.map(index => stations[index]);
    assert.ok(Math.abs(Math.hypot(end[0] - start[0], end[1] - start[1]) - loop.center_mm) < 1e-9);
    const driver = review.components.find(component => component.id === loop.driver_component);
    const driven = review.components.find(component => component.id === loop.driven_component);
    const belt = review.components.find(component => component.id === loop.belt_component);
    assert.equal(driver.teeth, driven.teeth);
    assert.equal(loop.reduction, driven.teeth / driver.teeth);
    assert.ok(Math.abs(belt.pitch_length_mm - 2 * loop.center_mm - driver.teeth * 5 - loop.nominal_extra_path_mm) < 1e-9);
    assert.ok(loop.nominal_extra_path_mm > 0);
  }
  assert.equal(review.paths.find(path => path.id === 'deployment').reduction, 45);
  assert.equal(review.components.find(component => component.id === 'sprocket12').bore, 'half_inch_rounded_hex');
  assert.equal(review.components.find(component => component.id === 'sprocket12').fit_approved, false);
});

test('qualification covers capture, recovery, transfer, structure, duty and shop acceptance', () => {
  const review = contract();
  const required = ['inputs', 'drive_interfaces', 'capture', 'jam_eject', 'indexed_held_handoff', 'fold_stow', 'front_hits', 'side_hits', 'thermal_duty', 'repair', 'manufacturing'];
  assert.deepEqual(review.gates.map(gate => gate.id).sort(), required.sort());
  for (const gate of review.gates) {
    assert.equal(gate.status, 'OPEN');
    assert.equal(gate.evidence.length, 0);
    assert.ok(gate.procedure.length && gate.acceptance.length && gate.record.length, gate.id);
  }
  const capture = review.gates.find(gate => gate.id === 'capture').matrix;
  assert.deepEqual(capture.yaw_deg, [0, 30, 60, 90]);
  assert.deepEqual(capture.offset_mm, [-100, 0, 100]);
  assert.ok(capture.wall_cases.includes('upright_against_wall'));
  assert.ok(capture.wall_cases.includes('horizontal_parallel_to_wall'));
  for (const id of ['front_hits', 'side_hits']) {
    const gate = review.gates.find(candidate => candidate.id === id);
    assert.equal(gate.approved_energy_j, null);
    assert.equal(gate.static_screen_qualifies_dynamic_impact, false);
  }
  assert.equal(review.current_limits.supply_a, null);
  assert.equal(review.current_limits.stator_a, null);
  assert.ok(review.unknown_inputs.includes('actual_robot_mass_kg'));
  assert.ok(review.unknown_inputs.includes('stock_grades_and_tolerances'));
});

test('review links the contract and names unresolved hardware instead of hiding it', () => {
  const markdown = readFileSync(new URL('compact-drive-review.md', import.meta.url), 'utf8');
  assert.ok(markdown.includes('compact-qualification.json'));
  for (const term of ['SplineXS', 'single pivot', 'round cord', 'NO accurate metal bending', 'NOT field-ready']) {
    assert.ok(markdown.includes(term), `Missing review boundary: ${term}`);
  }
  assert.ok(contract().blockers.length >= 5);
});