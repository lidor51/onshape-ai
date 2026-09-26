import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const identity = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-5, `${actual} differs from ${expected}`);
const dot = (left, right) => left.reduce((total, value, index) => total + value * right[index], 0);
const round = value => Number(value.toFixed(8));

export function deriveDatums(report) {
  const products = {};
  const source = sku => {
    const measured = report.assets[`cache/wcp-${sku}.step`];
    assert.equal(measured.status, 'PASS');
    assert.equal(measured.root_count, 1);
    return measured;
  };
  const base = measured => ({
    status: 'SOURCE_GEOMETRY_DERIVED_NOT_NATIVE_MATE_CONNECTORS', units: 'mm',
    source_sha256: measured.sha256, source_coordinate_system: 'Unchanged STEP root coordinates',
    face_index_reference: 'root_geometry[0].analytic_faces; zero-based, hash-specific local indices, not native IDs',
    source_to_attachment: { convention: 'attachment_point = rotation * source_point + translation_mm',
      rotation: identity, translation_mm: [0, 0, 0] },
    shaft_axis: { origin: [0, 0, 0], direction: [0, 0, 1] },
    assembly_fit_validated: false, operating_clearance_validated: false
  });

  const motor = source('0941');
  const motorFaces = motor.root_geometry[0].analytic_faces;
  const pilot = motorFaces[103];
  close(pilot.radius_mm, 9.525);
  assert.deepEqual(motorFaces[119].origin_mm, [0, 0, 0]);
  const holes = new Map();
  for (const face of motorFaces) {
    if (face.radius_mm === undefined || Math.abs(face.radius_mm - 2.0193) > 1e-6 || Math.abs(face.axis_direction[2]) < 0.99999) continue;
    const [positionX, positionY] = face.axis_origin_mm;
    if (Math.abs(Math.hypot(positionX, positionY) - 17.4625) > 1e-5) continue;
    const angle = Math.round((Math.atan2(positionY, positionX) * 180 / Math.PI + 360) % 360);
    if (!holes.has(angle)) holes.set(angle, { angle_deg: angle, center_mm: [round(positionX), round(positionY), 0], face_indices: [] });
    holes.get(angle).face_indices.push(face.index);
  }
  assert.equal(holes.size, 11);
  assert.ok(!holes.has(270));
  const shaft = motorFaces[468];
  close(shaft.radius_mm, 3.972045);
  const shaftBase = shaft.bounds_mm[2];
  const shaftTip = shaft.axis_origin_mm[2];
  products.x44 = {
    ...base(motor), mounting_plane: { origin: [0, 0, 0], normal: [0, 0, 1], face_indices: [119] },
    rotation_description: 'Identity; source +Z points out of the motor, source +X passes through a mounting hole.',
    pilot_diameter_mm: round(2 * pilot.radius_mm), pilot_cylindrical_height_mm: round(pilot.bounds_mm[5] - pilot.bounds_mm[2]),
    pilot_face_indices: [103, 120], bolt_circle_diameter_mm: 34.925,
    mounting_holes: [...holes.values()].sort((left, right) => left.angle_deg - right.angle_deg),
    missing_hole_angle_deg: 270, angle_convention: 'Right-hand about source +Z, 0 degrees = source +X',
    modeled_hole_diameter_mm: 4.0386, modeled_blind_bottom_z_mm: -6.35,
    mounting_thread_from_drawing: '#10-32 UNF', mounting_thread_depth_from_drawing_mm: 6.35,
    shaft_end_thread_from_drawing: '#10-32 UNF', shaft_end_thread_depth_from_drawing_mm: 9.525,
    spline_shoulder_z_mm: round(shaftBase), shaft_tip_z_mm: round(shaftTip),
    shaft_extension_from_shoulder_mm: round(shaftTip - shaftBase), shaft_extension_from_mount_mm: round(shaftTip),
    shaft_evidence_face_indices: [468, 470, 472],
    caution: 'Thread dimensions come from the original drawing, not inferred from tap-drill cylinders. Usable screw engagement and spline interference are unvalidated.'
  };

  const bearing = source('0783');
  const bearingFaces = bearing.root_geometry[0].analytic_faces;
  const boreFaces = bearingFaces.filter(face => face.index >= 16 && face.index <= 21);
  const bearingBores = boreFaces.map(face => 2 * Math.abs(dot(face.normal, face.origin_mm)));
  bearingBores.forEach(value => close(value, 12.72));
  const bearingSeat = bearingFaces[12].origin_mm[1];
  close(bearingSeat, 6.35);
  products.hex_bearing = {
    ...base(bearing), shaft_axis: { origin: [0, 0, 0], direction: [0, 1, 0] },
    mounting_plane: { origin: [0, bearingSeat, 0], normal: [0, -1, 0], face_indices: [12] },
    source_to_attachment: { convention: 'attachment_point = rotation * source_point + translation_mm',
      rotation: [[1, 0, 0], [0, 0, -1], [0, 1, 0]], translation_mm: [0, 0, -bearingSeat] },
    rotation_description: '+90 degrees about source X maps source +Y to attachment +Z; origin is flange underside.',
    bore_across_flats_mm: round(bearingBores[0]), bore_face_indices: boreFaces.map(face => face.index),
    hex_corner_direction: [1, 0, 0], body_od_mm: round(2 * bearingFaces[5].radius_mm), body_od_face_indices: [5, 24],
    flange_od_mm: round(2 * bearingFaces[2].radius_mm), flange_face_indices: [2, 10],
    overall_width_mm: round(bearing.root_geometry[0].size_mm[1]),
    flange_thickness_mm: round(bearingFaces[2].bounds_mm[4] - bearingSeat),
    journal_depth_to_seat_mm: bearingSeat,
    caution: 'CAD bore 12.72 mm and journal OD 28.5496 mm differ from nominal 0.500-inch hex / 1.125-inch OD. Preserve geometry; bearing fit class and press-fit allowance are not established.'
  };

  for (const [id, sku, tipRadius, count, endFaces] of [
    ['spline_pinion', '1016', 11.43, 16, [1, 2]],
    ['hex_output_gear', '0137', 31.75, 48, [58, 109]]
  ]) {
    const measured = source(sku);
    const geometry = measured.root_geometry[0];
    const faces = geometry.analytic_faces;
    const tips = faces.filter(face => face.radius_mm !== undefined && Math.abs(face.radius_mm - tipRadius) < 1e-5);
    assert.equal(tips.length, count);
    products[id] = {
      ...base(measured), rotation_description: 'Identity, source +Z is the common axis of tooth-tip cylinders; source origin is gear midplane.',
      axis_evidence_face_indices: tips.map(face => face.index),
      seating_planes: endFaces.map(index => ({ origin: [0, 0, faces[index].origin_mm[2]], normal: [0, 0, Math.sign(faces[index].origin_mm[2])], face_indices: [index] })),
      tooth_count_from_tip_faces: tips.length, tip_circle_diameter_mm: round(2 * tips[0].radius_mm),
      overall_width_mm: round(Math.abs(faces[endFaces[1]].origin_mm[2] - faces[endFaces[0]].origin_mm[2])),
      tooth_face_width_mm: round(tips[0].bounds_mm[5] - tips[0].bounds_mm[2]),
      tooth_midplane_origin: [0, 0, 0],
      caution: 'Source teeth and bore are preserved. No substituted primitive, involute regeneration, axial retention, backlash, or assembly interference approval.'
    };
    if (id === 'hex_output_gear') {
      const flats = faces.filter(face => face.index >= 110 && face.index <= 115);
      flats.forEach(face => close(2 * Math.abs(dot(face.normal, face.origin_mm)), 12.8016));
      const angle = Math.atan2(flats[0].normal[1], flats[0].normal[0]) / 2;
      products[id].bore_across_flats_mm = round(2 * Math.abs(dot(flats[0].normal, flats[0].origin_mm)));
      products[id].bore_face_indices = flats.map(face => face.index);
      products[id].hex_corner_direction = [Math.cos(angle), Math.sin(angle), 0];
      products[id].source_to_attachment.rotation = [[Math.cos(angle), Math.sin(angle), 0], [-Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]];
      products[id].rotation_description = '-30 degrees about source Z aligns the CAD hex corner with attachment +X; gear midplane stays at origin.';
      products[id].cad_clearance_over_nominal_half_inch_hex_mm = round(products[id].bore_across_flats_mm - 12.7);
    } else {
      products[id].bore_profile = 'Original vendor SplineXS geometry; not reduced to a circular 8 mm bore';
      products[id].spline_to_motor_clocking = 'UNVERIFIED; source orientation retained, parent must verify spline engagement';
    }
  }
  return { schema_version: 2, products };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = JSON.parse(readFileSync(new URL('./geometry-validation-v2.json', import.meta.url)));
  const result = deriveDatums(report);
  writeFileSync(new URL('./attachment-points.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', derived_products: Object.keys(result.products) }));
}