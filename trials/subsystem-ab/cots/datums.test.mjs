import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { deriveDatums } from './derive-datums.mjs';

const measured = JSON.parse(readFileSync(new URL('./geometry-validation-v2.json', import.meta.url)));
const datums = deriveDatums(measured).products;
const transform = (frame, point) => frame.rotation.map((row, index) => row.reduce((sum, value, column) => sum + value * point[column], frame.translation_mm[index]));

test('X44 mount is CAD-derived and preserves eleven holes and missing-hole clocking', () => {
  assert.equal(datums.x44.mounting_holes.length, 11);
  assert.equal(datums.x44.missing_hole_angle_deg, 270);
  assert.equal(datums.x44.pilot_diameter_mm, 19.05);
  assert.equal(datums.x44.shaft_extension_from_shoulder_mm, 31.8008);
});

test('bearing seating frame rotates source Y onto attachment Z without changing the bore', () => {
  const frame = datums.hex_bearing.source_to_attachment;
  assert.deepEqual(transform(frame, [0, 6.35, 0]), [0, 0, 0]);
  assert.ok(Math.abs(transform(frame, [0, 7.35, 0])[2] - 1) < 1e-10);
  assert.equal(datums.hex_bearing.bore_across_flats_mm, 12.72);
  assert.equal(datums.hex_bearing.body_od_mm, 28.5496);
  assert.equal(datums.hex_bearing.flange_thickness_mm, 1.5875);
});

test('gear hex clocking and real clearance are preserved', () => {
  const gear = datums.hex_output_gear;
  const corner = transform(gear.source_to_attachment, gear.hex_corner_direction);
  assert.ok(Math.abs(corner[0] - 1) < 1e-10 && Math.abs(corner[1]) < 1e-10);
  assert.equal(gear.bore_across_flats_mm, 12.8016);
  assert.equal(gear.tooth_count_from_tip_faces, 48);
  assert.equal(datums.spline_pinion.tooth_count_from_tip_faces, 16);
  assert.equal(datums.spline_pinion.overall_width_mm, 19.05);
});