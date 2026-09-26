import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {circleBoxClearance, screen as linkageScreen} from './deployment_path.mjs';

const DEG = Math.PI / 180;

export function rotateYZ(point, pivot, angleDeg) {
  const cosine = Math.cos(angleDeg * DEG), sine = Math.sin(angleDeg * DEG);
  const deltaY = point[0] - pivot[0], deltaZ = point[1] - pivot[1];
  return [pivot[0] + deltaY * cosine - deltaZ * sine,
    pivot[1] + deltaY * sine + deltaZ * cosine];
}

export function arcBounds(point, pivot, angleDeg) {
  const lower = Math.min(0, angleDeg) * DEG, upper = Math.max(0, angleDeg) * DEG;
  const phase = Math.atan2(point[1] - pivot[1], point[0] - pivot[0]);
  const angles = [0, angleDeg];
  for (let quarterTurn = Math.floor((lower + phase) / (Math.PI / 2));
    quarterTurn <= Math.ceil((upper + phase) / (Math.PI / 2)); quarterTurn++) {
    const angle = quarterTurn * Math.PI / 2 - phase;
    if (angle >= lower && angle <= upper) angles.push(angle / DEG);
  }
  const points = angles.map(angle => rotateYZ(point, pivot, angle));
  return {min: [0, 1].map(axis => Math.min(...points.map(value => value[axis]))),
    max: [0, 1].map(axis => Math.max(...points.map(value => value[axis])))};
}

export function wallMoment(point, pivot, forceN = 150) {
  const torqueXNm = -(point[1] - pivot[1]) * forceN / 1000;
  return {forceN, torqueXNm, favorsNegativeStow: torqueXNm < 0,
    passiveRetractionProven: false};
}

export function convexOutline(points) {
  const sorted = points.toSorted((first, second) => first[0] - second[0] || first[1] - second[1]);
  const cross = (origin, first, second) => (first[0] - origin[0]) * (second[1] - origin[1])
    - (first[1] - origin[1]) * (second[0] - origin[0]);
  const half = sequence => {
    const result = [];
    for (const point of sequence) {
      while (result.length > 1 && cross(result.at(-2), result.at(-1), point) <= 0) result.pop();
      result.push(point);
    }
    return result.slice(0, -1);
  };
  return [...half(sorted), ...half(sorted.toReversed())];
}

export function pickupOutline(mesh, floatDeg) {
  const points = [];
  for (const part of mesh.instances) {
    const vertices = mesh.definitions[part.definition].positions;
    for (let offset = 0; offset < vertices.length; offset += 3) {
      let point = [1, 2].map(axis => part.matrix[axis][0] * vertices[offset]
        + part.matrix[axis][1] * vertices[offset + 1] + part.matrix[axis][2] * vertices[offset + 2] + part.matrix[axis][3]);
      if (part.motion === 'float') point = rotateYZ(point, mesh.settings.middle_yz, floatDeg);
      points.push(point);
    }
  }
  return convexOutline(points);
}

export function pivotScreen(report, {pivot, angleDeg, floatDeg = 0, stepDeg = 0.1, outline = null, meshAllowanceMm = 0.5}) {
  if (!pivot.every(Number.isFinite) || pivot.length !== 2 || !Number.isFinite(angleDeg)
    || angleDeg >= 0 || angleDeg < -180 || !Number.isFinite(stepDeg) || stepDeg <= 0)
    throw new Error('Finite YZ pivot, negative stow angle up to 180 degrees and positive step required');
  const rows = Object.entries(report.roller_centers_yz).map(([name, source]) => ({name,
    center: name === 'front' ? rotateYZ(source, report.roller_centers_yz.middle, floatDeg) : source,
    radius: name === 'kick' ? 25.5 : 63.7}));
  const bumper = {min: [-85, 45], max: [0, 165]};
  const divisions = Math.ceil(Math.abs(angleDeg) / stepDeg);
  const actualStep = Math.abs(angleDeg) / divisions;
  const maxOrbitRadius = Math.max(...rows.map(row => Math.hypot(row.center[0] - pivot[0], row.center[1] - pivot[1])));
  const betweenSampleTravelBoundMm = maxOrbitRadius * actualStep * DEG / 2;
  let minimumBumperClearanceMm = Infinity, minimumFloorMm = Infinity;
  let limitingBumper = null;
  for (let index = 0; index <= divisions; index++) {
    const angle = angleDeg * index / divisions;
    for (const row of rows) {
      const center = rotateYZ(row.center, pivot, angle);
      const clearance = circleBoxClearance(center, row.radius, bumper);
      if (clearance < minimumBumperClearanceMm) {
        minimumBumperClearanceMm = clearance;
        limitingBumper = {roller: row.name, angleDeg: angle};
      }
      minimumFloorMm = Math.min(minimumFloorMm, center[1] - row.radius);
    }
  }
  const rollerArcs = rows.map(row => ({...arcBounds(row.center, pivot, angleDeg), radius: row.radius}));
  const sweptRollerBoundsYZ = {
    min: [0, 1].map(axis => Math.min(...rollerArcs.map(row => row.min[axis] - row.radius))),
    max: [0, 1].map(axis => Math.max(...rollerArcs.map(row => row.max[axis] + row.radius)))};
  const deployed = report.poses.poses.find(pose => pose.fold_deg === 0 && pose.float_deg === floatDeg);
  if (!deployed) throw new Error('A source module bound for this float setting is required');
  const extent = deployed.bounds_mm;
  const corners = [extent[1], extent[4]].flatMap(yCoord => [extent[2], extent[5]].map(zCoord => [yCoord, zCoord]));
  const boxArcs = corners.map(point => arcBounds(point, pivot, angleDeg));
  const stowedCorners = corners.map(point => rotateYZ(point, pivot, angleDeg));
  const moduleBox = points => ({min: [0, 1].map(axis => Math.min(...points.map(point => point[axis]))),
    max: [0, 1].map(axis => Math.max(...points.map(point => point[axis])))});
  const stowModuleBoxYZ = moduleBox(stowedCorners);
  const sweptModuleBoxYZ = {min: [0, 1].map(axis => Math.min(...boxArcs.map(row => row.min[axis]))),
    max: [0, 1].map(axis => Math.max(...boxArcs.map(row => row.max[axis])))};
  const meshArcs = outline?.map(point => arcBounds(point, pivot, angleDeg));
  const sweptMeshBoundsYZ = meshArcs ? {
    min: [0, 1].map(axis => Math.min(...meshArcs.map(row => row.min[axis])) - meshAllowanceMm),
    max: [0, 1].map(axis => Math.max(...meshArcs.map(row => row.max[axis])) + meshAllowanceMm)} : null;
  const stowMeshBoundsYZ = outline ? moduleBox(outline.map(point => rotateYZ(point, pivot, angleDeg))) : null;
  if (stowMeshBoundsYZ) for (const axis of [0, 1]) {
    stowMeshBoundsYZ.min[axis] -= meshAllowanceMm;
    stowMeshBoundsYZ.max[axis] += meshAllowanceMm;
  }
  const bumperClearanceLowerBoundMm = minimumBumperClearanceMm - betweenSampleTravelBoundMm;
  const floorClearanceLowerBoundMm = minimumFloorMm - betweenSampleTravelBoundMm;
  const extensionBeyondBumperMm = Math.max(0, -85 - (sweptMeshBoundsYZ ?? sweptModuleBoxYZ).min[0]);
  const rollerEnvironmentClear = bumperClearanceLowerBoundMm >= 3 && floorClearanceLowerBoundMm >= 5;
  const sourceModuleBoxFitsStow = stowModuleBoxYZ.min[0] >= 5 && stowModuleBoxYZ.max[0] <= 755
    && stowModuleBoxYZ.min[1] >= 5 && stowModuleBoxYZ.max[1] <= 1056.8;
  const sourceMeshFitsStow = stowMeshBoundsYZ !== null && stowMeshBoundsYZ.min[0] >= 5
    && stowMeshBoundsYZ.max[0] <= 755 && stowMeshBoundsYZ.min[1] >= 5 && stowMeshBoundsYZ.max[1] <= 1056.8;
  const sourceMeshClearsFloor = sweptMeshBoundsYZ !== null && sweptMeshBoundsYZ.min[1] >= 5;
  return {pivot, angleDeg, floatDeg, sampledAngles: divisions + 1, minimumBumperClearanceMm,
    limitingBumper, betweenSampleTravelBoundMm, bumperClearanceLowerBoundMm, floorClearanceLowerBoundMm,
    sweptRollerBoundsYZ, stowModuleBoxYZ, sweptModuleBoxYZ, extensionBeyondBumperMm,
    sweptMeshBoundsYZ, stowMeshBoundsYZ, meshAllowanceMm, meshAllowanceQualified: false,
    rollerEnvironmentClear, sourceModuleBoxFitsStow, sourceMeshFitsStow, sourceMeshClearsFloor,
    packagingScreenPass: rollerEnvironmentClear && sourceMeshFitsStow && sourceMeshClearsFloor && extensionBeyondBumperMm <= 457.2,
    wallMoments: Object.fromEntries(rows.map(row => [row.name, wallMoment(row.center, pivot)])),
    fullAssemblyClearance: false, impactSurvival: false, releaseReady: false};
}

export function buildReport() {
  const sourceBytes = readFileSync(new URL('pickup-report.json', import.meta.url));
  const report = JSON.parse(sourceBytes);
  const meshBytes = readFileSync(new URL('output/pickup-mesh.json', import.meta.url));
  const mesh = JSON.parse(meshBytes);
  const outlines = new Map([0, -8].map(floatDeg => [floatDeg, pickupOutline(mesh, floatDeg)]));
  const candidates = [[110, 330], [110, 250], [110, 200], [110, 170], [110, 140], [80, 170], [50, 170]]
    .flatMap(pivot => [-90, -110, -120, -130, -140].map(angleDeg => ({pivot, angleDeg,
      states: [0, -8].map(floatDeg => pivotScreen(report, {pivot, angleDeg, floatDeg, outline: outlines.get(floatDeg)}))})))
    .map(candidate => ({...candidate, packagingScreenPass: candidate.states.every(state => state.packagingScreenPass)}));
  return {schema: 'single-pivot-packaging-screen/1', status: 'LAYOUT_SCREEN_ONLY', units: 'mm, degrees, N, Nm',
    sourceSha256: createHash('sha256').update(sourceBytes).digest('hex'),
    sourceMeshSha256: createHash('sha256').update(meshBytes).digest('hex'),
    assumptions: ['Same pickup roller centers and circular outer envelopes; front float evaluated only at 0 and -8 degrees',
      'Bumper Y=-85..0, Z=45..165, treated as full width; 3 mm geometric bumper reserve, 5 mm floor reserve',
      'Whole pickup box contains the original high-pivot hardware; lowering the axis needs new physical cheeks and mounts',
      'Module box sweep is conservative, not actual full-system geometry; indexer, receiver, drives, supports and wiring not cleared',
      'Mesh outline is the convex projection of every original pickup mesh; extrema exact for mesh vertices, not analytic B-reps',
      '0.5 mm added mesh allowance is provisional, not a verified tessellation/tolerance bound; old fixed pivot hardware moves with this layout probe',
      'Front/back stow limits Y=5..755 and Z=5..1056.8 are assumed packaging targets, not a robot integration or rules pass',
      'Moments are static frontal force at roller centers, no drive friction, impact dynamics or passive collapse claim'],
    priorLinkage: linkageScreen(), candidates, releaseReady: false};
}

if (import.meta.main) {
  const result = buildReport();
  writeFileSync(new URL('single-pivot-screen.json', import.meta.url), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({status: result.status, candidates: result.candidates.map(candidate => ({
    pivot: candidate.pivot, angleDeg: candidate.angleDeg, packagingScreenPass: candidate.packagingScreenPass,
    stowBox: candidate.states[0].stowMeshBoundsYZ, sweepBox: candidate.states[0].sweptMeshBoundsYZ,
    bumperReserve: Math.min(...candidate.states.map(state => state.bumperClearanceLowerBoundMm)),
    floorReserve: Math.min(...candidate.states.map(state => state.floorClearanceLowerBoundMm))}))}, null, 2));
}