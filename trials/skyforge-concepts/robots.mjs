import * as THREE from 'three';
import { C, group, box, beam, cylinder, rollerY, plateXZ, beltXZ, cube, chassis, reserve, motor } from './parts.mjs';
import { BOARD, CUBE } from './field.mjs';
import { SF5, SF6, SF7, SF8, DUNK, STANDARD_FRAME, TRAY, tunnelFor, sf5Pose, sf5Reach, sf6Pose, sf7Pose, sf8Pose, pointOn } from './magazine.mjs';

const deg = Math.PI / 180;
const HALF = 114.3;
// Fixed hood angles chosen by the hood-angle scan (build.mjs records it): 72 deg best at the fender, 60 deg for the raised kicker.
export const MORTAR_ANGLE = 72;
export const KICKER_ANGLE = 60;

function fin(parent, name, [x0, y0], [x1, y1], z0, z1, t, color = C.polycarb) {
  const length = Math.hypot(x1 - x0, y1 - y0);
  const item = box(parent, name, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [length, t, z1 - z0], color, { opacity: 0.6 });
  item.rotation.z = Math.atan2(y1 - y0, x1 - x0);
  return item;
}

// Partial cylindrical sheet with its axis along robot Y; beta is measured from +x towards +z.
function hoodY(parent, name, [cx, cz], radius, betaStart, betaEnd, halfSpan, color = C.hood) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 2 * halfSpan, 24, 1, true,
    (90 - betaEnd) * deg, (betaEnd - betaStart) * deg);
  const item = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.6, side: THREE.DoubleSide }));
  item.name = name;
  item.userData.kind = 'robot';
  item.position.set(cx, 0, cz);
  item.castShadow = true;
  parent.add(item);
  return item;
}

// Sloped "tunnel" intake that deploys over the bumper: powered floor belts below, compliant rollers above.
function tunnelIntake(root, { pivotX, floorZ = 330, lipZ = 50, angle = 50, laneHalf, funnelHalf, lanes, deployed, cubes = [] }) {
  const phi = angle * deg;
  const length = (floorZ - lipZ) / Math.sin(phi);
  const arm = group(root, 'intake tunnel', [pivotX, 0, floorZ]);
  arm.rotation.y = deployed ? phi : -90 * deg;
  cylinder(root, 'intake pivot shaft', [pivotX, -laneHalf - 30, floorZ], [pivotX, laneHalf + 30, floorZ], 10, C.shaft);
  box(root, 'intake deploy gearbox', [pivotX - 30, laneHalf + 24, floorZ - 40], [60, 28, 80], C.gearbox);
  box(arm, 'intake floor plate', [length / 2, 0, -6], [length, 2 * laneHalf, 8], C.polycarb, { opacity: 0.6 });
  for (const y of lanes) beltXZ(arm, `intake floor belt ${y > 0 ? 'L' : y < 0 ? 'R' : 'C'}`, y, [18, 4], [length - 18, 4], 14, 60);
  for (const side of [1, -1]) {
    plateXZ(arm, `intake side plate ${side > 0 ? 'L' : 'R'}`, side * (laneHalf + 6),
      [[-20, -22], [length + 12, -22], [length + 12, 90], [length - 50, 300], [30, 300], [-20, 210]], 8, C.plate);
    fin(arm, `intake funnel wing ${side > 0 ? 'L' : 'R'}`, [length - 150, side * (laneHalf + 10)], [length + 20, side * funnelHalf], 10, 230, 6);
  }
  // Two-lane intakes: a wedge at the mouth steers each cube into one lane. The drivetrain offsets the robot by half
  // a lane so a cube never arrives centred on the wedge tip, which is the main jam case.
  if (lanes.length === 2) for (const side of [1, -1]) fin(arm, `lane divider wedge ${side > 0 ? 'L' : 'R'}`, [length - 10, 0], [length * 0.3, side * 18], 10, 240, 6, C.copper);
  rollerY(arm, 'intake front compliant roller', length - 25, 250, laneHalf - 4, 45, C.roller, { segments: lanes.length * 3 });
  rollerY(arm, 'intake middle roller', length * 0.52, 262, laneHalf - 4, 34, C.rollerAlt, { segments: lanes.length * 2 });
  rollerY(arm, 'intake rear roller', 55, 262, laneHalf - 4, 34, C.rollerAlt, { segments: lanes.length * 2 });
  rollerY(arm, 'intake lip kicker', length + 8, 18, laneHalf - 4, 20, C.rollerAlt);
  motor(arm, 'intake roller motor', [length * 0.52, laneHalf + 12, 262], [length * 0.52, laneHalf + 72, 262], 28);
  const lipX = pivotX + length * Math.cos(phi);
  cubes.forEach(({ lane, slot }) => {
    if (slot === 'tunnel') cube(arm, `cube in intake lane ${lane}`, [length * 0.45, lane, HALF + 6]);
    if (slot === 'mouth') cube(root, `cube at intake mouth ${lane}`, [lipX + 110, lane, HALF]);
  });
  return { arm, length, lipX };
}

// Two telescoping hook tubes; the inverted-L hook bar rests on top of the HANG RAIL.
function railHooks(root, { x, dir, ys, state, lift = 0 }) {
  const railTop = BOARD.rail.z + BOARD.rail.radius;
  const top = state === 'raised' ? 925 : state === 'seated' ? railTop - lift + 20 : 700;
  const seats = [];
  for (const y of ys) {
    box(root, `climber outer tube ${y > 0 ? 'L' : 'R'}`, [x, y, 380], [38, 38, 620], C.rail);
    box(root, `climber inner tube ${y > 0 ? 'L' : 'R'}`, [x, y, (320 + top) / 2], [30, 30, top - 320], C.frame);
    beam(root, `climber hook bar ${y > 0 ? 'L' : 'R'}`, [x - dir * 10, y, top - 10], [x + dir * 80, y, top - 10], 30, 20, C.hook);
    box(root, `climber hook lip ${y > 0 ? 'L' : 'R'}`, [x - dir * 8, y, top - 30], [16, 30, 40], C.hook);
    seats.push([x + dir * 48, y, top - 20]);
  }
  motor(root, 'climber winch motor', [x - dir * 60, ys[0] - 20, 90], [x - dir * 60, ys[0] - 20, 190], 30);
  cylinder(root, 'climber winch spool', [x, ys[0] - 25, 120], [x, ys[0] - 60, 120], 22, C.brass);
  return seats;
}

function anchor(root, object, local) {
  root.updateMatrixWorld(true);
  const point = object.localToWorld(new THREE.Vector3(...local));
  return root.worldToLocal(point).toArray();
}

// Deployable goal fork: two arms straddle the 24 in goal base for passive lateral and yaw centring.
function goalFork(root, { x, side = 316, deployed }) {
  for (const s of [1, -1]) {
    const arm = group(root, `goal fork ${s > 0 ? 'L' : 'R'}`, [x, s * side, 225]);
    arm.rotation.y = deployed ? 0 : -90 * deg;
    box(arm, 'fork arm', [210, 0, 0], [420, 12, 40], C.fork);
    cylinder(arm, 'fork knuckle', [0, -10, 0], [0, 10, 0], 16, C.shaft);
  }
  box(root, 'fork actuator', [x - 12, 0, 190], [40, 2 * side - 112, 30], C.gearbox);
}

// Magazine frame in the side view: local z = along the magazine axis, local x = across (u_z, -u_x), y lateral.
function magazineFrame(root, name, [x, z], axisDeg) {
  const frame = group(root, name, [x, 0, z]);
  frame.rotation.y = (90 - axisDeg) * deg;
  return frame;
}
const xz = ([x, z], y = 0) => [x, y, z];

// Chassis lane slot in front of a shooter: floor, one belt and one motor per lane so each lane indexes on its own.
// The stowed intake tunnel occupies this slot, so it may hold cubes only while the intake is deployed.
function frontLanes(root, { lanes, x0, x1, floor, cubes }) {
  box(root, 'front lane floor', [(x0 + x1) / 2, 0, floor - 4], [x1 - x0, 510, 8], C.polycarb);
  box(root, 'front lane guide (low, clears the stowed intake)', [(x0 + x1) / 2, 0, floor + 7], [x1 - x0, 8, 15], C.polycarb);
  for (const lane of lanes) {
    const tag = lane > 0 ? 'L' : 'R';
    beltXZ(root, `front lane belt ${tag}`, lane, [x1 - 10, floor], [x0 + 10, floor], 6, 60);
    motor(root, `front lane belt motor ${tag}`, [(x0 + x1) / 2, lane, floor - 24], [(x0 + x1) / 2, lane, floor - 64], 22);
  }
  const centre = x1 - 2 - HALF;
  for (const { lane } of cubes) cube(root, `cube in front lane ${lane > 0 ? 'L' : 'R'}`, [centre, lane, floor + HALF + 4]);
}

// ---------------------------------------------------------------- SF1 BRASS CANNON
// 4 cubes: 2 in the pivoting barrel (one per lane) and 2 in the chassis front lanes. After a pair is shot the barrel
// returns level and the front lanes reload it, so a 4-cube volley is two pairs with one reset between them.
function brassCannon(pose, alliance) {
  const L = 762, W = 711.2;
  const root = new THREE.Group();
  root.name = 'SF1 Brass Cannon';
  chassis(root, { L, W, alliance });
  reserve(root, 'electronics bay (reserved volume)', [-130, 0, 150], [320, 320, 100]);
  reserve(root, 'battery (reserved volume)', [205, -215, 130], [180, 76, 168], C.battery);
  const lanes = [127.5, -127.5];
  tunnelIntake(root, {
    pivotX: 345, laneHalf: 255, funnelHalf: 322, lanes, deployed: pose.intake === 'deployed',
    cubes: (pose.cubes ?? []).filter(item => item.slot !== 'barrel' && item.slot !== 'front'),
  });
  frontLanes(root, { lanes, x0: 30, x1: 345, floor: 330, cubes: (pose.cubes ?? []).filter(item => item.slot === 'front') });
  for (const side of [1, -1]) plateXZ(root, `barrel pivot tower ${side > 0 ? 'L' : 'R'}`, side * 300,
    [[-100, 90], [110, 90], [35, 490], [-35, 490]], 8, C.plate);
  const theta = (pose.barrel ?? 0) * deg;
  const barrel = group(root, 'pivoting twin barrel', [0, 0, 450]);
  barrel.rotation.y = theta;
  cylinder(barrel, 'barrel pivot shaft', [0, -310, 0], [0, 310, 0], 12, C.shaft);
  cylinder(barrel, 'barrel pivot sector sprocket', [0, 268, 0], [0, 278, 0], 95, C.copper);
  for (const side of [1, -1]) plateXZ(barrel, `barrel side plate ${side > 0 ? 'L' : 'R'}`, side * 262,
    [[25, -190], [25, 190], [-230, 195], [-372, 150], [-372, -150], [-230, -195]], 8, C.brass);
  plateXZ(barrel, 'barrel lane divider', 0, [[0, -120], [0, 120], [-260, 120], [-260, -120]], 6, C.polycarb, { opacity: 0.6 });
  box(barrel, 'barrel floor', [-185, 0, -HALF - 10], [370, 510, 8], C.polycarb);
  rollerY(barrel, 'barrel feed roller', -90, 146, 255, 30, C.rollerAlt, { segments: 4 });
  rollerY(barrel, 'barrel top flywheel', -300, 152, 255, 48, C.brass, { segments: 4 });
  rollerY(barrel, 'barrel bottom flywheel', -300, -152, 255, 48, C.brass, { segments: 4 });
  motor(barrel, 'top flywheel motor', [-300, 270, 152], [-300, 330, 152], 30);
  motor(barrel, 'bottom flywheel motor', [-300, -270, -152], [-300, -330, -152], 30);
  motor(barrel, 'barrel feed motor', [-90, -270, 146], [-90, -325, 146], 24);
  box(root, 'barrel pitch gearbox (MAXPlanetary)', [125, 322, 250], [60, 50, 60], C.gearbox);
  motor(root, 'barrel pitch motor', [125, 322, 280], [125, 322, 380], 30);
  beltXZ(root, 'barrel pitch chain', 282, [125, 250], [0, 450], 10, 10, C.belt);
  for (const item of pose.cubes ?? []) if (item.slot === 'barrel') cube(barrel, `cube in barrel lane ${item.lane}`, [-140, item.lane, 0]);
  const seats = railHooks(root, { x: -40, dir: 1, ys: [318, -318], state: pose.hooks ?? 'stowed', lift: pose.lift ?? 0 });
  const direction = [-Math.cos(theta), 0, Math.sin(theta)];
  root.userData = {
    L, W, anchors: {
      release: lanes.map(lane => ({ lane, position: anchor(root, barrel, [-360, lane, 0]), direction, angle: pose.barrel ?? 0 })),
      hookSeats: seats, railLocalX: -40 + 48,
    },
  };
  return root;
}

// ---------------------------------------------------------------- SF2 MORTAR RIDER
// 4 cubes: 2 lanes x 2 deep. Slot A feeds the flywheel directly and slot B (front lanes) refills it, so the mortar
// fires continuously; each lane has its own belt, so lanes index independently.
function mortarRider(pose, alliance) {
  const L = 762, W = 711.2;
  const root = new THREE.Group();
  root.name = 'SF2 Mortar Rider';
  chassis(root, { L, W, alliance });
  const lanes = [127.5, -127.5];
  const floor = 330;
  tunnelIntake(root, {
    pivotX: 345, laneHalf: 255, funnelHalf: 322, lanes, deployed: pose.intake === 'deployed',
    cubes: (pose.cubes ?? []).filter(item => item.slot !== 'lane' && item.slot !== 'front'),
  });
  reserve(root, 'electronics bay (reserved volume)', [60, 0, 200], [320, 420, 110]);
  reserve(root, 'battery (reserved volume)', [-270, 0, 130], [76, 180, 168], C.battery);
  box(root, 'lane floor', [-35, 0, floor - 4], [130, 510, 8], C.polycarb);
  for (const lane of lanes) beltXZ(root, `lane belt ${lane > 0 ? 'L' : 'R'}`, lane, [30, floor + 4], [-85, floor + 4], 12, 60);
  frontLanes(root, { lanes, x0: 42, x1: 345, floor, cubes: (pose.cubes ?? []).filter(item => item.slot === 'front') });
  plateXZ(root, 'lane divider', 0, [[20, floor], [20, floor + 200], [-90, floor + 200], [-90, floor]], 6, C.polycarb);
  const alpha = pose.alpha ?? MORTAR_ANGLE, pathRadius = 165, hoodRadius = 294;
  const center = [-100, floor + HALF + pathRadius];
  rollerY(root, 'mortar flywheel', center[0], center[1], 255, 76, C.brass, { segments: 4 });
  hoodY(root, `mortar hood (fixed ${alpha} deg)`, center, hoodRadius, 270 - alpha, 270, 258);
  for (const side of [1, -1]) {
    plateXZ(root, `shooter side plate ${side > 0 ? 'L' : 'R'}`, side * 272,
      [[345, floor - 20], [345, floor + 120], [20, center[1] + 90], [-200, center[1] + 90], [-376, center[1] - 70], [-376, floor + 60], [-150, floor - 20]], 8, C.plate);
    box(root, `lane support post ${side > 0 ? 'L' : 'R'}`, [150, side * 272, (90 + floor) / 2], [40, 12, floor - 90], C.frame);
  }
  motor(root, 'flywheel motor', [center[0], 280, center[1]], [center[0], 340, center[1]], 30);
  for (const side of [1, -1]) motor(root, `lane belt motor ${side > 0 ? 'L' : 'R'}`, [-20, side * 280, floor + 40], [-20, side * 336, floor + 40], 24);
  for (const item of pose.cubes ?? []) if (item.slot === 'lane') cube(root, `cube staged in lane ${item.lane}`, [-72, item.lane, floor + HALF + 4]);
  const beta = (270 - alpha) * deg;
  const exit = [center[0] + pathRadius * Math.cos(beta), center[1] + pathRadius * Math.sin(beta)];
  root.userData = {
    L, W, anchors: {
      release: lanes.map(lane => ({ lane, position: [exit[0], lane, exit[1]], direction: [-Math.cos(alpha * deg), 0, Math.sin(alpha * deg)], angle: alpha })),
    },
  };
  return root;
}

// ---------------------------------------------------------------- SF3 / SF4 gantry family
function gantry(pose, alliance, { id, name, trayRear, trayCubes, shooter }) {
  const L = 762, W = 711.2;
  const root = new THREE.Group();
  root.name = `${id} ${name}`;
  chassis(root, { L, W, alliance });
  reserve(root, 'electronics bay (reserved volume)', [-160, 0, 150], [330, 300, 100]);
  reserve(root, 'battery (reserved volume)', [-300, 230, 130], [76, 180, 168], C.battery);
  tunnelIntake(root, {
    pivotX: 350, angle: 55, laneHalf: 127, funnelHalf: 300, lanes: [0], deployed: pose.intake === 'deployed',
    cubes: (pose.cubes ?? []).filter(item => item.slot !== 'tray'),
  });
  // Deployable goal fork: two arms straddle the 24 in goal base for passive lateral and yaw centring.
  goalFork(root, { x: 352, deployed: pose.fork });
  const floorZ = pose.trayZ ?? 330;
  const lift = floorZ - 330;
  const carriageTravel = 390;
  const e = Math.max(0, lift - carriageTravel);
  const xe = 255;
  for (const side of [1, -1]) {
    box(root, `elevator stage 0 rail ${side > 0 ? 'L' : 'R'}`, [xe, side * 215, 530], [50.8, 25.4, 980], C.rail);
    plateXZ(root, `elevator gusset ${side > 0 ? 'L' : 'R'}`, side * 232, [[xe - 120, 90], [xe + 60, 90], [xe + 25, 600], [xe - 25, 600]], 6, C.plate);
    box(root, `elevator stage 1 rail ${side > 0 ? 'L' : 'R'}`, [xe, side * 190, 520 + e], [38, 25.4, 960], C.frame);
  }
  box(root, 'elevator stage 1 top crossbar', [xe, 0, 990 + e], [38, 406, 25.4], C.frame);
  box(root, 'elevator base crossbar', [xe, 0, 60], [50.8, 455, 25.4], C.rail);
  for (const side of [1, -1]) motor(root, `elevator motor ${side > 0 ? 'L' : 'R'}`, [xe - 60, side * 170, 90], [xe - 60, side * 170, 200], 30);
  cylinder(root, 'elevator cable spool', [xe - 60, -140, 230], [xe - 60, 140, 230], 20, C.brass);
  const carriage = group(root, 'carriage', [xe, 0, floorZ]);
  for (const side of [1, -1]) {
    box(carriage, `carriage side bar ${side > 0 ? 'L' : 'R'}`, [0, side * 165, 110], [30, 16, 280], C.copper);
    box(carriage, `drawer slide ${side > 0 ? 'L' : 'R'}`, [-250, side * 150, -22], [660, 14, 22], C.shaft);
    for (const z of [0, 220]) cylinder(carriage, `carriage roller ${side}${z}`, [0, side * 172, z - 10], [0, side * 182, z - 10], 14, C.rubber);
  }
  box(carriage, 'carriage lower crossbar', [0, 0, -30], [30, 346, 20], C.copper);
  box(carriage, 'carriage upper crossbar', [0, 0, 245], [30, 346, 20], C.copper);
  motor(carriage, 'drawer motor', [-40, 150, 250], [-40, 150, 330], 22);
  const reach = pose.reach ?? 0;
  const tray = group(root, 'reach drawer tray', [reach, 0, floorZ]);
  const trayFront = 345, doorLength = 190, hinge = trayFront - doorLength;
  box(tray, 'tray conveyor floor', [(hinge + trayRear) / 2, 0, -5], [hinge - trayRear, 250, 10], C.polycarb);
  beltXZ(tray, 'tray conveyor belt', 0, [trayRear + 20, 4], [hinge - 10, 4], 12, 120);
  for (const side of [1, -1]) plateXZ(tray, `tray side wall ${side > 0 ? 'L' : 'R'}`, side * 131,
    [[trayRear, 0], [trayFront, 0], [trayFront, 150], [trayFront - 60, 250], [trayRear, 250]], 6, C.polycarb, { opacity: 0.5 });
  const door = group(tray, 'trapdoor', [hinge, 0, 0]);
  door.rotation.y = pose.door ? 90 * deg : 0;
  box(door, 'trapdoor plate', [doorLength / 2, 0, -5], [doorLength, 250, 10], C.copper);
  cylinder(tray, 'trapdoor hinge', [hinge, -125, -8], [hinge, 125, -8], 7, C.shaft);
  box(tray, 'trapdoor servo', [hinge - 30, -145, 30], [40, 25, 50], C.gearbox);
  motor(tray, 'tray conveyor motor', [trayRear + 60, 140, 60], [trayRear + 60, 200, 60], 24);
  const pushed = pose.pushed ?? 0;
  const cubeXs = Array.from({ length: trayCubes }, (_, index) => trayFront - 124 + pushed - index * 239);
  const shown = pose.cubes?.filter(item => item.slot === 'tray').length ?? 0;
  for (let index = 0; index < shown; index++) {
    const skip = pose.dropped ? 1 : 0;
    if (index + skip >= cubeXs.length) break;
    cube(tray, `cube in tray ${index + 1}`, [cubeXs[index + skip], 0, HALF + 2]);
  }
  let release = [];
  if (shooter) {
    const flywheelRadius = 64, pathRadius = 153, hoodRadius = 282, alpha = pose.alpha ?? shooter.alpha;
    const beta = (270 - alpha) * deg;
    const center = [trayRear - hoodRadius * Math.cos(beta), HALF + pathRadius];
    rollerY(tray, 'rear kicker flywheel', center[0], center[1], 125, flywheelRadius, C.brass, { segments: 2 });
    hoodY(tray, `rear kicker hood (fixed ${alpha} deg)`, center, hoodRadius, 270 - alpha, 270, 128);
    for (const side of [1, -1]) plateXZ(tray, `kicker side plate ${side > 0 ? 'L' : 'R'}`, side * 136,
      [[trayRear + 300, 0], [trayRear + 300, center[1] + 70], [trayRear + 150, center[1] + 70], [trayRear, center[1] - 110], [trayRear, 0]], 6, C.plate);
    motor(tray, 'kicker flywheel motor', [center[0], 142, center[1]], [center[0], 200, center[1]], 28);
    release = [{ lane: 0, position: anchor(root, tray, [center[0] + pathRadius * Math.cos(beta), 0, center[1] + pathRadius * Math.sin(beta)]), direction: [-Math.cos(alpha * deg), 0, Math.sin(alpha * deg)], angle: alpha }];
  }
  const seats = railHooks(root, { x: 40, dir: -1, ys: [318, -318], state: pose.hooks ?? 'stowed', lift: pose.lift ?? 0 });
  root.userData = {
    L, W, anchors: {
      release, hookSeats: seats, railLocalX: 40 - 48,
      frontCube: anchor(root, tray, [cubeXs[0], 0, HALF + 2]), trayFront: reach + trayFront, forkInner: 316 - 6,
    },
  };
  return root;
}

// Intake shared by SF5/SF6: single-lane tunnel whose pivot, height and slope come from magazine.mjs.
function magazineIntake(root, L, pose, slot, funnelHalf = 280) {
  const t = tunnelFor(L);
  tunnelIntake(root, {
    pivotX: t.pivotX, floorZ: t.floorZ, lipZ: t.lipZ, angle: t.angle, laneHalf: 127, funnelHalf, lanes: [0],
    deployed: pose.intake === 'deployed', cubes: (pose.cubes ?? []).filter(item => item.slot !== slot),
  });
}

// ---------------------------------------------------------------- SF5 COLUMN ARM
// Shoulder at the 42 in start ceiling, wrist on the column's near wall. Both joint drives sit low on the chassis:
// the wrist chain runs over a sprocket that turns freely on the shoulder axle, so shoulder and wrist share an axis,
// not an actuator. With the wrist motor held, the chain keeps the column's absolute angle (loading -> GOAL 2).
export const SF5_HOOKS = { x: 22, dir: 1 };
function columnArm(pose, alliance) {
  const { L, W } = SF5;
  const root = new THREE.Group();
  root.name = 'SF5 Column Arm';
  chassis(root, { L, W, alliance });
  reserve(root, 'electronics bay (reserved volume)', [-210, -262, 130], [180, 100, 100]);
  reserve(root, 'battery (reserved volume)', [-210, 262, 130], [180, 90, 168], C.battery);
  magazineIntake(root, L, pose, 'column');
  goalFork(root, { x: L / 2 - 30, deployed: pose.fork });
  const loadShoulder = sf5Reach(tunnelFor(L).loadBottom, SF5.loadAxis).shoulder;
  const shoulder = pose.shoulder ?? loadShoulder, axis = pose.axis ?? SF5.loadAxis;
  const { wrist, bottom } = sf5Pose(shoulder, axis);
  const [px, pz] = SF5.pivot;
  for (const side of [1, -1]) plateXZ(root, `shoulder tower ${side > 0 ? 'L' : 'R'}`, side * 214, [[px - 120, 90], [px + 60, 90], [px + 38, pz + 35], [px - 38, pz + 35]], 8, C.plate);
  cylinder(root, 'shoulder axle', [px, -222, pz], [px, 222, pz], 12.7, C.shaft);
  cylinder(root, 'shoulder sprocket (shoulder motor)', [px, 224, pz], [px, 232, pz], 40, C.copper);
  cylinder(root, 'wrist idler sprocket (free on shoulder axle; wrist motor)', [px, -232, pz], [px, -224, pz], 40, C.brass);
  box(root, 'shoulder gearbox (MAXPlanetary)', [px + 100, 228, 165], [70, 50, 70], C.gearbox);
  motor(root, 'shoulder motor', [px + 100, 228, 200], [px + 100, 228, 300], 30);
  beltXZ(root, 'shoulder chain (chassis gearbox to shoulder sprocket)', 228, [px + 100, 165], [px, pz], 16, 10);
  box(root, 'wrist gearbox (MAXPlanetary)', [px + 100, -228, 165], [70, 50, 70], C.gearbox);
  motor(root, 'wrist motor', [px + 100, -228, 200], [px + 100, -228, 300], 30);
  beltXZ(root, 'wrist chain stage 1 (chassis gearbox to shoulder idler)', -228, [px + 100, 165], [px, pz], 16, 10);
  for (const side of [1, -1]) beam(root, `arm tube ${side > 0 ? 'L' : 'R'}`, [px, side * 188, pz], xz(wrist, side * 188), 38, 20, C.rail);
  beltXZ(root, 'wrist chain stage 2 (along the arm)', -202, [px, pz], wrist, 14, 8);
  const col = magazineFrame(root, 'cube column', bottom, axis);
  const along = SF5.wristAlong;
  cylinder(col, 'wrist axle', [-150, -210, along], [-150, 210, along], 12.7, C.shaft);
  cylinder(col, 'wrist sprocket', [-150, -206, along], [-150, -198, along], 45, C.copper);
  for (const side of [1, -1]) {
    const tag = side > 0 ? 'L' : 'R';
    plateXZ(col, `column side plate ${tag}`, side * 172, [[-150, -10], [68, -10], [68, 940], [-150, 940]], 6, C.polycarb, { opacity: 0.45 });
    box(col, `column backbone tube ${tag}`, [-135, side * 100, 465], [30, 25, 950], C.frame);
    box(col, `pinch belt ${tag} (inner run on the cube face)`, [0, side * 117, 425], [100, 4, 790], C.belt);
    box(col, `pinch belt ${tag} (return run)`, [0, side * 161, 425], [100, 4, 790], C.belt);
    for (const z of [30, 820]) cylinder(col, `pinch belt ${tag} pulley ${z}`, [-50, side * 139, z], [50, side * 139, z], 22, C.shaft);
    cylinder(col, `kicker wheel ${tag}`, [-40, side * 140, 895], [40, side * 140, 895], 30, C.brass);
    motor(col, `kicker motor ${tag}`, [-45, side * 140, 895], [-110, side * 140, 895], 24);
  }
  for (const z of [60, 470, 900]) box(col, `column near-wall crossbar ${z}`, [-135, 0, z], [30, 225, 20], C.frame);
  motor(col, 'pinch belt motor', [-140, -60, 160], [-140, 60, 160], 24);
  rollerY(col, 'column mouth roller', -136, 5, 110, 22, C.roller);
  const shift = pose.shift ?? 0;
  for (let index = 0; index < (pose.column ?? 0); index++) cube(col, `cube in column ${index + 1}`, [0, 0, CUBE / 2 + index * CUBE + shift]);
  const seats = railHooks(root, { x: SF5_HOOKS.x, dir: SF5_HOOKS.dir, ys: [W / 2 - 40, -(W / 2 - 40)], state: pose.hooks ?? 'stowed', lift: pose.lift ?? 0 });
  const release = pointOn(bottom, axis, 895 + CUBE / 2, 0);
  root.userData = {
    L, W, joints: { shoulder, axis, wrist, bottom },
    anchors: {
      release: [{ lane: 0, position: xz(release), direction: [Math.cos(axis * deg), 0, Math.sin(axis * deg)], angle: 180 - axis }],
      hookSeats: seats, railLocalX: SF5_HOOKS.x + SF5_HOOKS.dir * 48,
      frontCube: xz(pointOn(bottom, axis, CUBE / 2, 0)), forkInner: 316 - 6,
    },
  };
  return root;
}

// ---------------------------------------------------------------- SF6 RAMP LIFT
// Single-stage lift inclined SF6.beta from vertical; the tray tilts on two stub axles on its side plates. The tray
// is the carriage crossmember, so nothing crosses the cube path. Floor belt (slots 2-4) + compliant top belt carry
// cubes both ways; slot 1 sits on a trapdoor; a top flywheel at the rear end is the VERTICAL GOAL kicker.
export const SF6_HOOKS = { x: 40, dir: 1 };
function rampLift(pose, alliance) {
  const { L, W } = SF6;
  const root = new THREE.Group();
  root.name = 'SF6 Ramp Lift';
  chassis(root, { L, W, alliance });
  reserve(root, 'electronics bay (reserved volume)', [185, -265, 140], [210, 90, 100]);
  reserve(root, 'battery (reserved volume)', [165, 265, 130], [180, 76, 168], C.battery);
  magazineIntake(root, L, pose, 'tray');
  goalFork(root, { x: L / 2 - 29, deployed: pose.fork });
  const s = pose.carriage ?? 0, axis = pose.tilt ?? 130;
  const { pivot, front } = sf6Pose(s, axis);
  const P = t => [SF6.pivotLoad[0] + SF6.u[0] * t, SF6.pivotLoad[1] + SF6.u[1] * t];
  const { baseS, topS, length } = SF6.rail;
  const carriageTop = s + 60 / SF6.u[1];
  const e = Math.min(length - 200, Math.max(0, carriageTop - topS));
  for (const side of [1, -1]) {
    const tag = side > 0 ? 'L' : 'R';
    beam(root, `lift fixed rail ${tag}`, xz(P(baseS), side * 215), xz(P(topS), side * 215), 50.8, 25.4, C.rail);
    beam(root, `lift moving stage ${tag}`, xz(P(baseS + e), side * 192), xz(P(topS + e), side * 192), 38, 20, C.frame);
    plateXZ(root, `lift base gusset ${tag}`, side * 232, [[P(baseS)[0] - 15, 70], [P(baseS)[0] + 220, 70], [P(baseS + 300)[0] + 20, P(baseS + 300)[1]], [P(baseS + 300)[0] - 20, P(baseS + 300)[1]]], 6, C.plate);
    box(root, `carriage block ${tag}`, xz(pivot, side * 186), [70, 26, 90], C.copper);
    motor(root, `lift motor ${tag}`, [P(baseS)[0] + 130, side * 180, 100], [P(baseS)[0] + 130, side * 180, 200], 30);
  }
  beam(root, 'lift fixed top crossbar', xz(P(topS), -215), xz(P(topS), 215), 25.4, 25.4, C.rail);
  beam(root, 'lift moving stage top crossbar', xz(P(topS + e), -192), xz(P(topS + e), 192), 25.4, 25.4, C.frame);
  cylinder(root, 'lift cable spool', [P(baseS)[0] + 130, -150, 230], [P(baseS)[0] + 130, 150, 230], 20, C.brass);
  // Tilt drive hangs below the left carriage block so the start pose stays under 42 in.
  box(root, 'tray tilt gearbox (on carriage)', xz([pivot[0], pivot[1] - 75], 186), [60, 26, 60], C.gearbox);
  motor(root, 'tray tilt motor (on carriage)', xz([pivot[0], pivot[1] - 105], 186), xz([pivot[0], pivot[1] - 185], 186), 26);
  const tray = cubeTray(root, 'tilting tray', front, axis, pose, [[SF6.pivotOnTray.along, SF6.pivotOnTray.across]], 'tilt stub axle');
  const seats = railHooks(root, { x: SF6_HOOKS.x, dir: SF6_HOOKS.dir, ys: [318, -318], state: pose.hooks ?? 'stowed', lift: pose.lift ?? 0 });
  root.userData = {
    L, W, joints: { carriage: s, tilt: axis, pivot, front },
    anchors: { ...tray.anchors, hookSeats: seats, railLocalX: SF6_HOOKS.x + SF6_HOOKS.dir * 48, forkInner: 316 - 6 },
  };
  return root;
}

// 4-cube tray shared by SF6 and SF7: floor belt (slots 2-4) + compliant top belt carry cubes both ways, slot 1 sits
// on a trapdoor, and a top flywheel at the rear end is the VERTICAL GOAL kicker. `axles` are stub axles on the side
// plates (tray-local along/across); nothing crosses the cube path.
function cubeTray(root, name, front, axis, pose, axles, axleName) {
  const tray = magazineFrame(root, name, front, axis);
  for (const side of [1, -1]) {
    const tag = side > 0 ? 'L' : 'R';
    plateXZ(tray, `tray side plate ${tag}`, side * 172, [[-134, TRAY.front], [150, TRAY.front], [150, 870], [190, 950], [-134, 950]], 6, C.polycarb, { opacity: 0.45 });
    axles.forEach(([along, across], index) => cylinder(tray, `${axleName} ${index + 1} ${tag}`, [across, side * 175, along], [across, side * 199, along], 14, C.shaft));
  }
  box(tray, 'tray floor plate (slots 2-4)', [-130, 0, (CUBE + 950) / 2], [8, 250, 950 - CUBE], C.polycarb);
  beltXZ(tray, 'floor belt (slots 2-4)', 0, [-121, 250], [-121, 880], 6, 200);
  beltXZ(tray, 'compliant top belt (all slots)', 0, [130, 70], [130, 860], 14, 200);
  motor(tray, 'belt motor (floor + top belt)', [130, 120, 480], [130, 168, 480], 24);
  const door = group(tray, 'trapdoor (slot 1)', [-124, 0, CUBE]);
  door.rotation.y = pose.door ? 90 * deg : 0;
  box(door, 'trapdoor plate', [-5, 0, -(CUBE - TRAY.front) / 2], [8, 250, CUBE - TRAY.front], C.copper);
  box(tray, 'trapdoor servo', [-120, -150, CUBE + 20], [30, 30, 40], C.gearbox);
  rollerY(tray, 'rear kicker flywheel', 150, 910, 110, 36, C.brass, { segments: 2 });
  motor(tray, 'kicker motor', [150, 125, 910], [150, 168, 910], 26);
  const first = pose.dropped ? 1 : 0, shift = pose.shift ?? 0;
  for (let index = 0; index < (pose.tray ?? 0); index++) cube(tray, `cube in tray slot ${first + index + 1}`, [0, 0, CUBE / 2 + (first + index) * CUBE + shift]);
  const release = pointOn(front, axis, 910 + CUBE / 2, 0);
  return {
    group: tray,
    anchors: {
      release: [{ lane: 0, position: xz(release), direction: [Math.cos(axis * deg), 0, Math.sin(axis * deg)], angle: 180 - axis }],
      frontCube: xz(pointOn(front, axis, CUBE / 2, 0)),
    },
  };
}

// ---------------------------------------------------------------- SF7 ROCKER TRAY
// One motor: a four-bar whose coupler is the SF6 tray. The crank (link A) is driven from a low MAXPlanetary through
// a chain; link B only follows. The linkage passes start -> load (in line with the tunnel) -> rear-up shot poses ->
// level over the GOAL 2 THROAT, so one angle sensor defines every state.
// Hooks sit forward so the rail line (x 150) crosses the crank link where it is low; the tray stands behind it.
export const SF7_HOOKS = { x: 102, dir: 1 };
function rockerTray(pose, alliance) {
  const { L, W } = SF7;
  const root = new THREE.Group();
  root.name = 'SF7 Rocker Tray';
  chassis(root, { L, W, alliance });
  reserve(root, 'electronics bay (reserved volume)', [180, -250, 140], [200, 90, 100]);
  reserve(root, 'battery (reserved volume)', [165, 260, 130], [180, 76, 168], C.battery);
  // Narrow funnel: the stowed wings must pass inside the link towers at y 218.
  magazineIntake(root, L, pose, 'tray', 200);
  goalFork(root, { x: L / 2 - 29, deployed: pose.fork });
  const crank = pose.crank ?? SF7.loadCrank;
  const { front, axis, joints } = sf7Pose(crank);
  SF7.links.forEach((link, index) => {
    const tag = index === 0 ? 'crank link A (driven)' : 'rocker link B (follower)';
    const g = link.ground;
    for (const side of [1, -1]) {
      plateXZ(root, `link ${index === 0 ? 'A' : 'B'} ground tower ${side > 0 ? 'L' : 'R'}`, side * 222, [[g[0] - 45, 70], [g[0] + 45, 70], [g[0] + 22, g[1] + 22], [g[0] - 22, g[1] + 22]], 8, C.plate);
      beam(root, `${tag} ${side > 0 ? 'L' : 'R'}`, xz(g, side * 205), xz(joints[index], side * 205), 34, 16, index === 0 ? C.rail : C.frame);
    }
    cylinder(root, `link ${index === 0 ? 'A' : 'B'} ground axle`, [g[0], -230, g[1]], [g[0], 230, g[1]], 12.7, C.shaft);
  });
  const [gA] = SF7.links.map(link => link.ground);
  // Crank drive sits above the battery, as low as the chassis allows, with a chain up to the crank sprocket.
  const drive = [gA[0] - 117, 300];
  cylinder(root, 'crank sprocket', [gA[0], 234, gA[1]], [gA[0], 242, gA[1]], 20, C.copper);
  box(root, 'crank gearbox (MAXPlanetary)', xz(drive, 238), [70, 50, 70], C.gearbox);
  motor(root, 'crank motor', xz([drive[0], drive[1] + 35], 238), xz([drive[0], drive[1] + 135], 238), 30);
  beltXZ(root, 'crank chain (chassis gearbox to crank sprocket)', 238, drive, gA, 12, 10);
  const tray = cubeTray(root, 'rocking tray', front, axis, pose, SF7.couplers, 'coupler stub axle');
  const seats = railHooks(root, { x: SF7_HOOKS.x, dir: SF7_HOOKS.dir, ys: [318, -318], state: pose.hooks ?? 'stowed', lift: pose.lift ?? 0 });
  root.userData = {
    L, W, joints: { crank, tilt: axis, front },
    anchors: { ...tray.anchors, hookSeats: seats, railLocalX: SF7_HOOKS.x + SF7_HOOKS.dir * 48, forkInner: 316 - 6 },
  };
  return root;
}

// ---------------------------------------------------------------- SF8 DUNK MAST
// Vertical 2-stage mast; the tray hangs on two stub axles near its rear corner. Level over the THROAT, slot 1's
// omni wheels (driven across the tray, free along it) push the cube straight down; nothing enters the THROAT.
// The mast rails cannot be tied across the top because the tray swings between them; they are tied at the base
// and by side gussets.
export const SF8_HOOKS = { x: 40, dir: 1 };
function dunkMast(pose, alliance) {
  const { L, W } = SF8;
  const root = new THREE.Group();
  root.name = 'SF8 Dunk Mast';
  chassis(root, { L, W, alliance });
  reserve(root, 'electronics bay (reserved volume)', [185, -265, 140], [210, 90, 100]);
  reserve(root, 'battery (reserved volume)', [165, 265, 130], [180, 76, 168], C.battery);
  magazineIntake(root, L, pose, 'tray');
  goalFork(root, { x: L / 2 - 29, deployed: pose.fork });
  const h = pose.h ?? SF8.load, axis = pose.tilt ?? SF8.loadAxis;
  const { front } = sf8Pose(h, axis), x = SF8.mastX;
  const e = Math.min(780, Math.max(0, h + SF8.carriage.up - 1040));
  for (const side of [1, -1]) {
    const tag = side > 0 ? 'L' : 'R';
    box(root, `mast fixed rail ${tag}`, [x, side * 215, 550], [50.8, 25.4, 980], C.rail);
    box(root, `mast moving stage ${tag}`, [x, side * 192, 550 + e], [38, 20, 980], C.frame);
    plateXZ(root, `mast side gusset ${tag}`, side * 232, [[x - 200, 70], [x + 200, 70], [x + 25, 700], [x - 25, 700]], 6, C.plate);
    box(root, `carriage block ${tag}`, [x, side * 186, h + (SF8.carriage.up - SF8.carriage.down) / 2], [70, 26, SF8.carriage.up + SF8.carriage.down], C.copper);
    motor(root, `mast motor ${tag}`, [x + 110, side * 180, 100], [x + 110, side * 180, 200], 30);
  }
  box(root, 'mast base crossbar', [x, 0, 60], [50.8, 455, 25.4], C.rail);
  box(root, 'moving stage base crossbar', [x, 0, 85 + e], [38, 404, 20], C.frame);
  cylinder(root, 'mast cable spool', [x + 110, -150, 230], [x + 110, 150, 230], 20, C.brass);
  // Tilt drive on the carriage, in front of the moving stage and outboard of the tray plates; chain to the stub axle.
  box(root, 'tray tilt gearbox (on carriage)', [x + 60, 200, h - 110], [60, 26, 60], C.gearbox);
  motor(root, 'tray tilt motor (on carriage)', [x + 60, 200, h - 140], [x + 60, 200, h - 220], 26);
  beltXZ(root, 'tray tilt chain', 200, [x + 60, h - 110], [x, h], 10, 10, C.belt);
  const tray = dunkTray(root, 'hinged dunk tray', front, axis, pose);
  const seats = railHooks(root, { x: SF8_HOOKS.x, dir: SF8_HOOKS.dir, ys: [318, -318], state: pose.hooks ?? 'stowed', lift: pose.lift ?? 0 });
  root.userData = {
    L, W, joints: { h, tilt: axis, front, pivot: [x, h] },
    anchors: { ...tray.anchors, hookSeats: seats, railLocalX: SF8_HOOKS.x + SF8_HOOKS.dir * 48, forkInner: 316 - 6 },
  };
  return root;
}

// SF6 tray without a trapdoor: slot 1 has two rows of omni wheels per side (drive across the tray, free along it), and
// the kicker is a top + bottom flywheel pair geared together so the cube leaves without spin.
function dunkTray(root, name, front, axis, pose) {
  const tray = magazineFrame(root, name, front, axis);
  const { along: pa, across: pc } = SF8.pivotOnTray, rows = [DUNK.lowerAcross, DUNK.upperAcross];
  for (const side of [1, -1]) {
    const tag = side > 0 ? 'L' : 'R';
    plateXZ(tray, `tray side plate ${tag}`, side * 172, [[-134, TRAY.front], [150, TRAY.front], [150, 870], [-134, 870]], 6, C.polycarb, { opacity: 0.45 });
    plateXZ(tray, `kicker side plate ${tag}`, side * 172, [[-190, 870], [190, 870], [190, 950], [-190, 950]], 6, C.plate);
    cylinder(tray, `tilt stub axle ${tag}`, [pc, side * 175, pa], [pc, side * 199, pa], 14, C.shaft);
    for (const across of rows) {
      cylinder(tray, `dunk wheel shaft ${tag} ${across > 0 ? 'upper' : 'lower'}`, [across, side * DUNK.y, TRAY.front + 4], [across, side * DUNK.y, 196], 6, C.shaft);
      for (const along of DUNK.along) cylinder(tray, `dunk omni wheel ${tag} ${across > 0 ? 'upper' : 'lower'} ${along}`, [across, side * DUNK.y, along - 12], [across, side * DUNK.y, along + 12], DUNK.radius, C.rollerAlt);
    }
    box(tray, `dunk row link belt ${tag}`, [(rows[0] + rows[1]) / 2, side * DUNK.y, 205], [rows[1] - rows[0] + 30, 26, 8], C.belt);
    box(tray, `dunk right-angle gearbox ${tag}`, [rows[0], side * 185, 205], [40, 20, 40], C.gearbox);
    motor(tray, `dunk wheel motor ${tag}`, [rows[0], side * 195, 205], [rows[0], side * 250, 205], 22);
  }
  box(tray, 'tray floor plate (slots 2-4)', [-130, 0, (CUBE + 870) / 2], [8, 250, 870 - CUBE], C.polycarb);
  beltXZ(tray, 'floor belt (slots 2-4)', 0, [-121, 250], [-121, 860], 6, 200);
  beltXZ(tray, 'compliant top belt (all slots)', 0, [130, 70], [130, 860], 14, 200);
  motor(tray, 'belt motor (floor + top belt)', [130, 120, 480], [130, 168, 480], 24);
  rollerY(tray, 'kicker top flywheel', 150, 910, 110, 36, C.brass, { segments: 2 });
  rollerY(tray, 'kicker bottom flywheel', -150, 910, 110, 36, C.brass, { segments: 2 });
  box(tray, 'kicker gear train (counter-rotating pair)', [0, 150, 910], [340, 12, 50], C.gearbox);
  motor(tray, 'kicker motor', [0, 178, 910], [0, 238, 910], 26);
  const shift = pose.shift ?? 0;
  for (let index = 0; index < (pose.tray ?? 0); index++) {
    const drop = index === 0 ? pose.dunk ?? 0 : 0;
    cube(tray, index === 0 && drop ? 'cube being dunked (slot 1)' : `cube in tray slot ${index + 1}`, [-drop, 0, CUBE / 2 + index * CUBE + shift]);
  }
  const release = pointOn(front, axis, 910 + CUBE / 2, 0);
  return {
    group: tray,
    anchors: {
      release: [{ lane: 0, position: xz(release), direction: [Math.cos(axis * deg), 0, Math.sin(axis * deg)], angle: 180 - axis }],
      frontCube: xz(pointOn(front, axis, CUBE / 2, 0)),
    },
  };
}

export const CONCEPTS = [
  {
    id: 'SF1', name: 'Brass Cannon', build: brassCannon, frame: STANDARD_FRAME, hooks: { x: -40, dir: 1 },
    tagline: 'Under-board twin-barrel pivot shooter + rail hooks',
    role: 'Primary scorer. Owns the VERTICAL GOAL and SKYFORGE RP. For the endgame it can HANG for 10, or go UNDER for 3 when a partner already holds the rail.',
    heights: 'Stows about 30 in, so it can use the under-board lane, the 4 under-board cubes and UNDER. The barrel pitches up to shoot steeply from inside its own footprint.',
    why: 'The 30 in hexagon is the most forgiving scoring target in the game, and a steep shot leaves the robot above a legal 48 in defender. A pivot lets the same robot shoot from the fender at blue GOAL 1 or from deep in the LAUNCH ZONE. Indexing: the wedge splits cubes into 2 lanes; each lane holds one cube in the barrel and one in a chassis front lane, and has its own belt and sensor.',
    risks: ['A 4-cube volley is two pairs: after the first pair the barrel returns level so the front lanes can reload it (about 0.5 s).', 'The front lanes sit where the intake stows, so the intake must stay deployed while they hold cubes.', 'Twin lanes put each cube 127.5 mm off the goal centreline, which reduces aim margin; a cube arriving centred on the lane wedge can jam.', 'Cube flight with tumble, spin and foam compression is untested.', 'The rail hang depends on a level COM under the rail and needs a proper load check.'],
    tasks: ['start', 'floor', 'safe', 'underCube', 'vgFender', 'vgZone', 'hang', 'under'],
    complexity: { motors: 9, positioningDof: 3, handoffs: 2, stateChanges: 6, movingCables: 'barrel (3 motors across the pivot), intake roller motor', service: 'Barrel unit comes out as one module (pivot shaft + chain)' },
    sim: { base: 'short_launcher', height: 'short', stow_height_in: 30, geometry: 'opposite', capacity: 4, tasks: { VG: [0.8, 0.6, 0.85], G1: null }, endgame: ['hang', 'under'], hang_s: 4.5, complexity: 0.45, defense_sensitivity: 0.9 },
  },
  {
    id: 'SF2', name: 'Mortar Rider', build: mortarRider, frame: STANDARD_FRAME,
    tagline: `Fixed ${MORTAR_ANGLE} deg hooded mortar, no pivot, parks UNDER`,
    role: 'Cheapest competitive shooter. VERTICAL GOAL points plus UNDER; can defend inside the opponent LAUNCH ZONE because it is always under 48 in.',
    heights: 'Always under 30 in. It can never hang.',
    why: 'It has the fewest state changes: deploy the intake, spin up and feed. A fixed steep hood with variable flywheel speed covers the useful LAUNCH ZONE depth. Indexing: 2 lanes x 2 deep, each lane on its own belt; the front cube refills the flywheel slot, so all 4 fire without moving anything but belts.',
    risks: ['Its release is low: a legal defender pressed against the rear bumper can reach the shot (see check).', 'A fixed angle narrows the usable shot band.', 'The front lanes sit where the intake stows, so the intake must stay deployed while they hold cubes.', 'UNDER is worth only 3 points, so the alliance needs another robot to HANG for the BOARD RP.'],
    tasks: ['start', 'floor', 'safe', 'underCube', 'vgFender', 'vgZone', 'under'],
    complexity: { motors: 7, positioningDof: 1, handoffs: 1, stateChanges: 2, movingCables: 'intake roller motor only', service: 'Open top; the flywheel shaft is reachable from the rear' },
    sim: { base: 'short_launcher', height: 'short', stow_height_in: 30, geometry: 'opposite', capacity: 4, tasks: { VG: [0.9, 0.5, 0.78], G1: null }, endgame: ['under'], complexity: 0.25 },
  },
  {
    id: 'SF3', name: 'Gantry Tower', frame: STANDARD_FRAME, hooks: { x: 40, dir: -1 }, build: (pose, alliance) => gantry(pose, alliance, { id: 'SF3', name: 'Gantry Tower', trayRear: -372, trayCubes: 3 }),
    tagline: 'Elevator + reach drawer + trapdoor tray, with a goal fork for passive centring',
    role: 'Placer. GOAL 1/2/3 for the LEVELS RP and the 5-point GOAL 3, plus HANG. Complements a shooter partner.',
    heights: 'Stows at 40 in (inside the 42 in start limit). It cannot use the under-board lane, but its rear half fits under the board edge to hang.',
    why: 'The 11 in throat is the precision problem in this game. The bumper stops on the goal face, the fork straddles the 24 in base and the drawer runs to a hard stop, so the cube lands over the throat without fine driving.',
    risks: ['It holds 3 cubes, not 4: a level 4-cube tray (914 mm) does not fit inside a 30 in frame at the start. SF6 solves this by tilting its tray.', 'The 18 in extension limit leaves about 70 mm of tray behind the cube centre: tight.', 'More state changes per cube (lift, fork, reach, drop, advance).', 'A cable chain has to follow a 2-stage elevator and a moving drawer.'],
    tasks: ['start', 'floor', 'safe', 'g1', 'g2', 'g3', 'hang'],
    complexity: { motors: 9, positioningDof: 5, handoffs: 1, stateChanges: 7, movingCables: 'carriage + drawer + trapdoor through the elevator', service: 'Drawer slides out forward; the elevator needs rigging access' },
    sim: { base: 'tower', height: 'tall', stow_height_in: 40, geometry: 'same', capacity: 3, tasks: { G1: [0.5, 0.8, 0.95], G2: [0.7, 0.8, 0.95], G3: [1.2, 1.0, 0.93] }, endgame: ['hang'], hang_s: 4.0, complexity: 0.55 },
  },
  {
    id: 'SF4', name: 'Forge Hybrid', frame: STANDARD_FRAME, hooks: { x: 40, dir: -1 }, build: (pose, alliance) => gantry(pose, alliance, { id: 'SF4', name: 'Forge Hybrid', trayRear: -345, trayCubes: 2, shooter: { alpha: KICKER_ANGLE } }),
    tagline: 'Gantry Tower + rear kicker flywheel on the same tray',
    role: 'Complexity ceiling. Places GOAL 1/2/3 from the front of the tray and shoots the VERTICAL GOAL from the rear, then HANGs.',
    heights: 'Stows at about 41 in. It uses the elevator to raise the shot above a legal defender.',
    why: 'One tray has two exits, so there is no second intake path. The elevator sets the release height, which a fixed hood cannot.',
    risks: ['It holds only 2 cubes: the kicker takes the third tray slot.', 'Most motors, states and moving cables of the gantry concepts.', 'At GOAL 3 the kicker sits about 60 mm under the 78 in limit.'],
    tasks: ['start', 'floor', 'safe', 'g1', 'g2', 'g3', 'vgZone', 'hang'],
    complexity: { motors: 11, positioningDof: 5, handoffs: 1, stateChanges: 8, movingCables: 'carriage + drawer + trapdoor + kicker through the elevator', service: 'As SF3, plus kicker on the tray' },
    sim: { base: 'tower_launcher', height: 'tall', stow_height_in: 41, geometry: 'opposite', capacity: 2, tasks: { G1: [0.5, 0.8, 0.94], G2: [0.8, 0.85, 0.94], G3: [1.3, 1.05, 0.92], VG: [1.0, 0.55, 0.84] }, endgame: ['hang'], hang_s: 4.5, complexity: 0.75 },
  },
  {
    id: 'SF5', name: 'Column Arm', build: columnArm, frame: { L: SF5.L, W: SF5.W }, hooks: SF5_HOOKS, family: 'magazine',
    tagline: 'High shoulder + wrist carrying a 4-cube column: GOAL 2 in drops of 4, VERTICAL GOAL in bursts of 4',
    role: 'Your arm idea, made legal. Fills GOAL 2 four cubes at a time toward the LEVELS RP and shoots the VERTICAL GOAL from the same column, then HANGs.',
    heights: 'Starts at 42 in with the shoulder axle at 40.2 in. At GOAL 2 the column top is at 76.6 in, 36 mm under the 78 in limit. It cannot go under the boards, and it does not place at GOAL 1 (see the arm verdict).',
    why: 'A vertical 4-cube column over the THROAT scores 4 cubes in one move, driven down by its own belts. Loading and the GOAL 2 drop both hold the column vertical, so a cycle is a single 62 deg shoulder swing with the wrist chain held. The wrist only moves to stow and to tilt the column for a shot.',
    risks: ['Needs a 34 x 26 in frame: on 30 x 28 in no start pose of the 950 mm column clears the stowed intake (feasibility.json).', 'Long lever: a 712 mm arm plus a 950 mm column with 4 cubes, 78 in up. Arm deflection and chain backlash eat directly into the 25 mm THROAT margin.', 'Cubes are held only by the side pinch belts, and the mouth needs a curved 40 deg handoff from the tunnel.', 'The kicker wheels touch the top cube, so the stack must back off 25 mm before spin-up.', 'The shot pose is a static solution; the joint path from loading to it is not checked here.'],
    tasks: ['start', 'floor', 'safe', 'g2', 'vgFender', 'vgZone', 'hang'],
    complexity: { motors: 9, positioningDof: 5, handoffs: 1, stateChanges: 6, movingCables: 'pinch-belt motor and 2 kicker motors on the column (through wrist and shoulder)', service: 'Column unbolts at the wrist; both joint drives sit on the chassis' },
    sim: { base: 'tower_launcher', height: 'tall', stow_height_in: 42, geometry: 'opposite', capacity: 4, tasks: { G1: null, G2: [0.8, 0.2, 0.93], G3: null, VG: [0.9, 0.45, 0.85] }, endgame: ['hang'], hang_s: 4.5, complexity: 0.65 },
  },
  {
    id: 'SF6', name: 'Ramp Lift', build: rampLift, frame: { L: SF6.L, W: SF6.W }, hooks: SF6_HOOKS, family: 'magazine',
    tagline: `Single-stage lift inclined ${SF6.beta.toFixed(0)} deg + tilting 4-cube tray: GOAL 3 on hard stops, VERTICAL GOAL bursts from the rear`,
    role: 'High-value placer-shooter. Indexes 4 cubes into GOAL 3 (5 points each) with both joints on hard stops, or shoots 4 into the VERTICAL GOAL from the rear, then HANGs.',
    heights: 'Starts under 42 in on the standard 30 x 28 in frame. At GOAL 3 the tray floor is 20 mm above the rim, and the lift is about 70 in tall.',
    why: `In the GOAL 3 pose both joints sit on hard stops (carriage on its top stop, tray level on its stop), the bumper is on the goal face and the fork is on the base. Precision comes from contact, not from servo accuracy. The lift leans ${SF6.beta.toFixed(0)} deg, so one stage gives both the height and the forward reach: no drawer. The tray loads in line with the intake.`,
    risks: ['The inclined lift reaches the THROAT only at GOAL 3 height, so it cannot place at GOAL 1 or GOAL 2.', 'At GOAL 3 cubes go in one at a time over the trapdoor (about 0.4 s each), not as a stack.', 'It uses the whole 18 in budget at GOAL 3 (2 mm spare), and the tray floor clears the rim by 20 mm.', 'The tilt motor, belt motor and kicker ride on the carriage, so their cables move.', 'The top-belt sandwich must hold 4 cubes at 50 deg without slipping; this is untested.'],
    tasks: ['start', 'floor', 'safe', 'g3', 'vgFender', 'vgZone', 'hang'],
    complexity: { motors: 10, positioningDof: 5, handoffs: 1, stateChanges: 6, movingCables: 'tilt, belt and kicker motors plus the trapdoor servo on the carriage', service: 'Tray lifts off its two stub axles; lift motors at the base' },
    sim: { base: 'tower_launcher', height: 'tall', stow_height_in: 42, geometry: 'opposite', capacity: 4, tasks: { G1: null, G2: null, G3: [1.0, 0.45, 0.93], VG: [0.9, 0.45, 0.85] }, endgame: ['hang'], hang_s: 4.5, complexity: 0.65 },
  },
  {
    id: 'SF7', name: 'Rocker Tray', build: rockerTray, frame: { L: SF7.L, W: SF7.W }, hooks: SF7_HOOKS, family: 'magazine',
    tagline: 'One motor: a four-bar carries the 4-cube tray from loading, through a VERTICAL GOAL shot pose, to level over GOAL 2',
    role: 'Your single-DOF idea, done with a four-bar instead of a pin joint. GOAL 2 four cubes per trip (indexed over the trapdoor) plus VERTICAL GOAL shots, then HANG.',
    heights: 'Starts under 42 in on the standard 30 x 28 in frame with the tray upright at the rear. At GOAL 2 the tray floor is 20 mm above the rim and the robot is about 52 in tall.',
    why: `One crank angle defines every state: start, load in line with the tunnel, shot and GOAL 2. The linkage was synthesised so the three precision poses are exact and the path between them stays inside 78 in / 18 in (feasibility.json). The shot pose lies on the way from loading to GOAL 2 (crank ${SF7.loadCrank.toFixed(0)} to ${SF7.sweep.toFixed(0)} deg), so shooting needs no extra motion.`,
    risks: ['The shot is flat (about 30-35 deg) and leaves at about 1.2 m. It is only available from the LAUNCH ZONE spot: no pose on its path makes a legal shot from the fender.', 'One DOF means one fixed path: no GOAL 1 or GOAL 3, and the shot angle cannot be tuned separately from its height.', 'Near the start pose the tray turns fast per crank degree (close to a toggle), so the crank needs a hard stop and a slow approach there.', 'At GOAL 2 it uses the whole 18 in budget (2 mm spare).', 'The top-belt sandwich must hold 4 cubes at 50 deg without slipping; this is untested.'],
    tasks: ['start', 'floor', 'safe', 'g2', 'vgZone', 'hang'],
    complexity: { motors: 8, positioningDof: 4, handoffs: 1, stateChanges: 5, movingCables: 'belt and kicker motors and the trapdoor servo ride on the tray (cables cross one linkage joint)', service: 'Tray lifts off its four stub axles; the crank drive stays on the chassis' },
    sim: { base: 'tower_launcher', height: 'tall', stow_height_in: 42, geometry: 'opposite', capacity: 4, tasks: { G1: null, G2: [0.7, 0.45, 0.93], G3: null, VG: [0.8, 0.45, 0.8] }, endgame: ['hang'], hang_s: 4.5, complexity: 0.5, defense_sensitivity: 1.0 },
  },
  {
    id: 'SF8', name: 'Dunk Mast', build: dunkMast, frame: { L: SF8.L, W: SF8.W }, hooks: SF8_HOOKS, family: 'magazine',
    tagline: 'Vertical mast + hinged 4-cube tray: driven omni wheels dunk GOAL 2 and GOAL 3, a two-sided kicker shoots the VERTICAL GOAL',
    role: 'Your shoot + dunk idea. Pushes each cube down into the GOAL 2 or GOAL 3 THROAT (4 per trip), shoots 4 into the VERTICAL GOAL from the rear, then HANGs. It shoots only at the hexagon: the THROATs are too small to shoot into (see the dunk verdict).',
    heights: `Starts under 42 in on the standard 30 x 28 in frame, the tray standing behind the mast. The tilt axle rides the mast from ${SF8.start.h} mm at the start to ${Math.round(SF8.g3)} mm at GOAL 3, where the robot is about ${((SF8.g3 - SF8.across + TRAY.kickerTop) / 25.4).toFixed(1)} in tall.`,
    why: `Level poses over GOAL 2 and GOAL 3 differ only in height, so a vertical mast reaches both with the same tray, fork and depth stop. The tray hangs on stub axles near its rear corner, placed so the loading pose is on the same vertical line. Two rows of omni wheels in slot 1 pinch the cube's side faces and drive it ${Math.round(DUNK.driveDepth)} mm below the rim, past the THROAT's 152 mm straight section, before it leaves them. The pinch also centres the cube: between the tray side plates it would have ${Math.round(172 - 3 - CUBE / 2)} mm of side play against 25 mm of THROAT clearance.`,
    risks: [
      `A dunk pushes the tray up. The wheels are ${Math.round(SF8.pivotAlong - CUBE / 2)} mm from the tilt axle, so each 10 N of dunk force needs ${((SF8.pivotAlong - CUBE / 2) / 100).toFixed(1)} N m of hold-down from the tilt drive; it cannot just rest on a level stop.`,
      'The slot-1 cube is held only by the omni-wheel pinch (no floor), in every tray angle. Pinch force against sliding friction is untested.',
      'Rule question for the manual: 4.5 says cubes enter a THROAT by being dropped or LAUNCHED. A driven dunk from above should be confirmed (G411 only forbids opponent THROATs).',
      `The load pose is 4 deg steeper than the 50 deg tunnel (a kink at the handoff); in line, no axle position on the side plate gives a legal start.`,
      'The mast rails cannot be tied across the top (the tray swings between them); they are tied at the base and by side gussets.',
      'Tilt, belt, dunk and kicker motors ride the carriage and tray, so their cables move with the mast.',
      'No GOAL 1: a level tray over the 18 in rim would sit in the stowed intake.'],
    tasks: ['start', 'floor', 'safe', 'g2', 'g3', 'vgFender', 'vgZone', 'hang'],
    complexity: { motors: 11, positioningDof: 5, handoffs: 1, stateChanges: 6, movingCables: 'tilt motor on the carriage; belt, 2 dunk and kicker motors on the tray', service: 'Tray lifts off its two stub axles; mast motors at the base' },
    sim: { base: 'tower_launcher', height: 'tall', stow_height_in: 42, geometry: 'opposite', capacity: 4, tasks: { G1: null, G2: [0.8, 0.35, 0.95], G3: [1.0, 0.35, 0.95], VG: [0.9, 0.45, 0.85] }, endgame: ['hang'], hang_s: 4.5, complexity: 0.7 },
  },
];

export function concept(id) {
  const item = CONCEPTS.find(entry => entry.id === id);
  if (!item) throw new Error(`Unknown concept ${id}`);
  return item;
}
