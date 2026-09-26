import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = new URL('./', import.meta.url);
const sourcePaths = [
  'pickup.py', 'pickup-report.json', 'entry_contact.py', 'entry-contact.json',
  'compact_system.py', 'system.py', '../coral-intake-v1/model.py',
  '../coral-intake-v1/params.json',
];

export function readInputs() {
  const sources = Object.fromEntries(sourcePaths.map(path => {
    const bytes = readFileSync(new URL(path, directory));
    return [path, { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }];
  }));
  const readJson = path => JSON.parse(readFileSync(new URL(path, directory), 'utf8'));
  const params = readJson('../coral-intake-v1/params.json');
  const pickup = readJson('pickup-report.json');
  const entry = readJson('entry-contact.json');
  const centers = pickup.roller_centers_yz;
  const derived = loadInputs();
  const expected = derived.centers;
  for (const [name, center] of Object.entries(expected)) {
    assert.ok(center.every((value, axis) => Math.abs(value - centers[name][axis]) < 1e-7),
      `${name} source center changed: revise the deployed transport screen`);
  }
  assert.deepEqual([params.coral.od, params.coral.bore, params.coral.length], [114.3, 101.6, 301.625]);
  return { ...derived, params, centers, pickup, entry, sources, leadingCheekY: -353 };
}

export function chordHalfWidth(radius, offset) {
  return Math.abs(offset) > radius ? null : Math.sqrt(Math.max(0, radius ** 2 - offset ** 2));
}

export function sidewaysCrest({ rear, bumperTop, diameter, rollerRadius }) {
  const allowedRadius = rear[1] - bumperTop - diameter;
  return {
    center_y_mm: rear[0], minimum_coral_center_z_mm: bumperTop + diameter / 2,
    maximum_effective_roller_radius_mm: allowedRadius,
    roller_radius_mm: rollerRadius,
    nominal_radial_overlap_mm: rollerRadius - allowedRadius,
    rigid_circle_underpass_possible: allowedRadius >= rollerRadius - 1e-9,
    scope: 'Sideways horizontal pipe centered in X, below rear roller, directly above bumper. Circular roller model, not a compliant-star compression limit.',
  };
}

export function lengthwiseContacts({ centers, params, starRadius }) {
  const pipeRadius = params.coral.od / 2;
  const halfLength = params.coral.length / 2;
  const centerZ = params.tray.top_z + pipeRadius;
  const rearReach = chordHalfWidth(starRadius, centers.rear[1] - centerZ - pipeRadius);
  const stations = params.indexer.stations_xy.map(([centerX, centerY]) => {
    const reach = chordHalfWidth(params.indexer.wheel_radius, centerX - pipeRadius);
    return {
      center_xy_mm: [centerX, centerY], inner_gap_mm: 2 * (centerX - params.indexer.wheel_radius),
      reaches_centered_lengthwise_pipe: reach !== null,
      earliest_center_y_mm: reach === null ? null : centerY - reach - halfLength,
    };
  });
  const rearLast = rearReach === null ? null : centers.rear[0] + rearReach + halfLength;
  const firstBank = stations.find(station => station.reaches_centered_lengthwise_pipe);
  return {
    center_z_mm: centerZ, stations, last_upper_contact_center_y_mm: rearLast,
    earliest_tray_overlap_center_y_mm: params.tray.front_y - halfLength,
    optimistic_powered_overlap_mm: rearLast === null || !firstBank ? null : rearLast - firstBank.earliest_center_y_mm,
    bumper_to_tray_step_down_mm: params.bumper.z[1] - params.tray.top_z,
    third_bank_diametral_interference_mm: params.coral.od - stations[2].inner_gap_mm,
    scope: 'Optimistic outer-cylinder contact bounds at final tray height, not a path from floor/crest. Wheel Z/thickness, phase, bore entry, support stability and intervening collision not resolved. First two bank gaps alone do not prove a powered gap.',
  };
}

export function flatLengthwiseCrest(inputs) {
  const { params, centers, shaftInscribedRadius } = inputs;
  const availableHeight = centers.middle[1] - shaftInscribedRadius - params.bumper.z[1];
  return {
    shaft_to_bumper_front_longitudinal_separation_mm: params.bumper.y[0] - centers.middle[0],
    pipe_length_mm: params.coral.length,
    flat_pipe_spans_shaft_and_bumper: params.coral.length > params.bumper.y[0] - centers.middle[0],
    flat_vertical_aperture_upper_bound_mm: availableHeight,
    flat_od_margin_upper_bound_mm: availableHeight - params.coral.od,
    scope: 'Horizontal lengthwise pipe crossing beneath the middle shaft and above the undeformed bumper. Pitch/yaw changes or over-row routing are not constructed or qualified. A transverse shaft cannot pass through an annular pipe sidewall just because its center is inside the bore.',
  };
}

export function wallScreen({ centers, params, starRadius, leadingCheekY, entry }) {
  const pipeRadius = params.coral.od / 2;
  const sideCenter = [leadingCheekY + pipeRadius, pipeRadius];
  const sampledContact = entry.rows.find(row => row.yaw_deg === 90).contact.center_y_mm;
  return {
    wall_model: 'Plane normal to Y, outside robot front, spanning the leading cheek X/Z envelope. Not a side-wall/corner or short-obstacle claim.',
    closest_wall_y_from_known_cheek_mm: leadingCheekY,
    sideways_floor_center_yz_mm: sideCenter,
    sideways_front_outer_circle_overlap_mm: pipeRadius + starRadius - Math.hypot(...centers.front.map((value, axis) => value - sideCenter[axis])),
    cached_phase_contact_requires_wall_penetration_mm: sampledContact - sideCenter[0],
    cached_phase_previous_no_contact_sample_margin_mm: sampledContact - entry.approach_step_mm - sideCenter[0],
    lengthwise_floor_wall_y_max_from_bumper_mm: params.bumper.y[0] - params.coral.length,
    extra_standoff_for_flat_lengthwise_piece_mm: leadingCheekY - (params.bumper.y[0] - params.coral.length),
    scope: 'Known leading cheek and bumper constraints only. Cached source-phase samples are not continuous/all-phase proof. Positive outer-circle overlap allows possible rotating-lobe contact, not traction/lift/extraction.',
  };
}

export function evaluateTransport(inputs = readInputs()) {
  const { params, centers, pickup, entry, sources } = inputs;
  const starRadius = 63.7;
  const localCorrection = solveLocalCorrection(inputs);
  const correctedRelay = lengthwiseContacts({ ...inputs, centers: localCorrection.centers_yz_mm });
  const receiverCenter = params.coral.final_center;
  return {
    ...evaluate(inputs),
    units: 'mm',
    geometry_model: 'Analytic finite outer cylinders/circles; cached source bounds only; no STEP imports or invented coral trajectory.',
    deployed_pose: { fold_deg: 0, float_deg: 0, independent_of_pivot_z_at_zero_fold: true },
    coral: params.coral, roller_centers_yz_mm: centers,
    upper_circle_radius_mm: starRadius,
    upper_radius_basis: '63.7 mm conservative envelope already used by system.py, not a solid disk or measured loaded shape.',
    sideways_crest: sidewaysCrest({ rear: centers.rear, bumperTop: params.bumper.z[1], diameter: params.coral.od, rollerRadius: starRadius }),
    lengthwise: lengthwiseContacts({ centers, params, starRadius }),
    flat_lengthwise_crest: flatLengthwiseCrest(inputs),
    correction_downstream_regression: {
      rear_surface_above_tray_pipe_top_mm: localCorrection.centers_yz_mm.rear[1] - starRadius - params.tray.top_z - params.coral.od,
      corrected_lengthwise_contact_bounds: correctedRelay,
      full_transport_fix: false,
      controlling_conflict: 'While rear Y is above bumper, undeformed sideways clearance requires rear Z >= 343; tray-height upper contact requires rear Z <= 311.85. Moving holes alone in this family cannot satisfy both. A supported powered height transition or different rear-row longitudinal placement must be designed and checked, not animated.',
    },
    receiver_static_pose: {
      center_xyz_mm: receiverCenter,
      pipe_y_ends_mm: [receiverCenter[1] - params.coral.length / 2, receiverCenter[1] + params.coral.length / 2],
      stop_end_gap_mm: params.tray.stop_y - receiverCenter[1] - params.coral.length / 2,
      tray_side_margin_mm: (params.tray.width - params.coral.od) / 2,
      scope: 'Tray/stop endpoint only. Receiver is a keepout reference, not a modeled accepting/retaining mechanism. No handoff, cup motion or arrival trajectory inferred.',
    },
    near_wall: wallScreen(inputs),
    cached_star_body_mapping: pickup.sources.star_body_mapping,
    entry_evidence: {
      source_current: entry.pickup_source_sha256 === sources['pickup.py'].sha256,
      scope: entry.scope, rows: entry.rows,
    },
    sources,
    continuous_supported_powered_path_proven: false,
    release_ready: false,
  };
}

const root = new URL('./', import.meta.url);

export function loadInputs() {
  const paths = ['pickup.py', 'compact_system.py', 'system.py', 'entry_contact.py',
    '../coral-intake-v1/model.py', '../coral-intake-v1/params.json'];
  const sources = Object.fromEntries(paths.map(path => [path, readFileSync(new URL(path, root), 'utf8')]));
  const params = JSON.parse(sources['../coral-intake-v1/params.json']);
  const pickup = sources['pickup.py'];
  const number = key => {
    const match = pickup.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
    assert.ok(match, `Missing pickup scalar: ${key}`);
    return Number(match[1]);
  };
  const pair = key => {
    const match = pickup.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]+)\\]`));
    assert.ok(match, `Missing pickup pair: ${key}`);
    const values = JSON.parse(`[${match[1]}]`);
    assert.equal(values.length, 2);
    return values;
  };
  assert.ok(pickup.includes('middle_z - math.sqrt(config["front_distance"] ** 2 - config["front_dy"] ** 2)'), 'Re-review changed front-center equation');
  assert.ok(pickup.includes('middle_z + math.sqrt(config["rear_distance"] ** 2 - config["rear_dy"] ** 2)'), 'Re-review changed rear-center equation');
  assert.ok(pickup.includes('tapped_shaft(config["shaft_length"])') && pickup.includes('hex_prism(12.7, length)'), 'Re-review changed shaft');
  assert.ok(pickup.includes('"crossmembers_yz": [[-330.0, 211.0], [-215.0, 320.0]]')
    && pickup.includes('config["crossmembers_yz"][0]], 23, thickness)'), 'Re-review leading cheek datum');
  assert.ok(sources['compact_system.py'].includes('config.update(pivot_yz=list(pivot), stow_angle=stow)'), 'Re-review compact deployed offsets');
  const middle = pair('middle_yz');
  const frontDistance = number('front_distance');
  const rearDistance = number('rear_distance');
  const frontDy = number('front_dy');
  const rearDy = number('rear_dy');
  return {
    params,
    centers: {
      front: [middle[0] - frontDy, middle[1] - Math.sqrt(frontDistance ** 2 - frontDy ** 2)],
      middle,
      rear: [middle[0] + rearDy, middle[1] + Math.sqrt(rearDistance ** 2 - rearDy ** 2)],
      kick: pair('kick_yz'),
    },
    frontDistance, rearDistance, rearDy,
    shaftInscribedRadius: 6.35,
    starRadius: 63.7,
    sourceSha256: Object.fromEntries(paths.map(path => [path, createHash('sha256').update(sources[path]).digest('hex')])),
  };
}

export function pointBoxDistance(point, lower, upper) {
  return Math.hypot(...point.map((value, axis) => Math.max(lower[axis] - value, value - upper[axis], 0)));
}

export function bumperGate(inputs, centers = inputs.centers) {
  const { bumper, coral } = inputs.params;
  return ['middle', 'rear'].map(row => {
    const axisDistance = pointBoxDistance(centers[row], [bumper.y[0], bumper.z[0]], [bumper.y[1], bumper.z[1]]);
    return {
      row, center_yz_mm: centers[row], axis_to_bumper_mm: axisDistance,
      hard_gap_upper_bound_mm: axisDistance - inputs.shaftInscribedRadius,
      hard_od_margin_upper_bound_mm: axisDistance - inputs.shaftInscribedRadius - coral.od,
      unloaded_star_gap_mm: axisDistance - inputs.starRadius,
      required_star_radial_deflection_mm: Math.max(0, coral.od + inputs.starRadius - axisDistance),
    };
  });
}

export function correctedCenters(inputs, angleDegrees) {
  const angle = angleDegrees * Math.PI / 180;
  const front = inputs.centers.front;
  const middle = [front[0] + inputs.frontDistance * Math.cos(angle), front[1] + inputs.frontDistance * Math.sin(angle)];
  const rear = [middle[0] + inputs.rearDy, middle[1] + Math.sqrt(inputs.rearDistance ** 2 - inputs.rearDy ** 2)];
  return { front: [...front], middle, rear, kick: [...inputs.centers.kick] };
}

export function solveLocalCorrection(inputs, allowedDeflection = 0) {
  let lower = Math.atan2(inputs.centers.middle[1] - inputs.centers.front[1], inputs.centers.middle[0] - inputs.centers.front[0]) * 180 / Math.PI;
  let upper = 90;
  const passes = angle => bumperGate(inputs, correctedCenters(inputs, angle))
    .every(row => row.unloaded_star_gap_mm + allowedDeflection >= inputs.params.coral.od);
  assert.ok(passes(upper), 'No correction in the retained front-center circle');
  for (let iteration = 0; iteration < 60; iteration += 1) {
    const middle = (lower + upper) / 2;
    if (passes(middle)) upper = middle;
    else lower = middle;
  }
  const centers = correctedCenters(inputs, upper);
  return { allowed_radial_deflection_mm: allowedDeflection, front_to_middle_angle_deg: upper,
    centers_yz_mm: centers, bumper_checks: bumperGate(inputs, centers),
    scope: 'Minimum angle only within this fixed-front/fixed-127-mm-rear-dy family. Both upper belt centers retained. Flat cheek/arm hole relocation, not a full transport fix; no approved deflection or manufacturing allowance.',
    qualified: false };
}

export function evaluate(inputs = loadInputs()) {
  const checks = bumperGate(inputs);
  return {
    schema: 'compact-transport/1',
    status: checks.some(row => row.hard_od_margin_upper_bound_mm < 0) ? 'BLOCKED_UNDER_ROW_CHANNEL' : 'UNRESOLVED',
    source_sha256: inputs.sourceSha256,
    coral_mm: inputs.params.coral,
    deployed_centers_yz_mm: inputs.centers,
    analytic_model: 'Crosswise external-cylinder configuration space, hard shaft inscribed circle and nominal undeformed bumper keepout rectangle. A negative hard margin rules out the local under-row channel without compressing the bumper; it is not a rigid-metal bumper claim or proof against every 3D detour. Hollow bore is not an initially threaded shaft path. Stars use a 63.7 mm radial envelope, not a solid CAD contact model.',
    bumper_checks: checks,
    zero_deflection_local_correction: solveLocalCorrection(inputs),
    ten_mm_deflection_sensitivity_only: solveLocalCorrection(inputs, 10),
    deployment: 'Single pivot retained. Pivot/stow changes alone do not alter the fold=0 pickup or fixed indexer coordinates.',
    full_transport_qualified: false,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = evaluateTransport();
  const text = JSON.stringify(report, null, 2) + '\n';
  if (process.argv.includes('--write')) writeFileSync(new URL('compact-transport.json', directory), text);
  process.stdout.write(text);
  if (process.argv.includes('--gate')) process.exitCode = report.continuous_supported_powered_path_proven ? 0 : 2;
}