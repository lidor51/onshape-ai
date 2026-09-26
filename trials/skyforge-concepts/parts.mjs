import * as THREE from 'three';

// Crayola palette: saturated, flat, distinct per mechanism family.
export const C = {
  frame: 0x9aa7b0, rail: 0x5f7fa3, plate: 0x8fc79a, polycarb: 0xbfe3ea, roller: 0x3fae5a, rollerAlt: 0xf29b38,
  rubber: 0x2f3438, belt: 0x3a3f46, shaft: 0x6d7880, brass: 0xd9a441, copper: 0xc26a3d, hook: 0x9b6bd1,
  motor: 0x7d8894, gearbox: 0x4a6fa5, red: 0xd62828, blue: 0x1d4ed8, cube: 0xf5c400, reserve: 0xcdd3d8,
  battery: 0x3c4449, aid: 0xe8641c, ok: 0x18a058, bad: 0xd21f3c, fork: 0x2a9d8f, hood: 0xe0c48a,
};

const materials = new Map();
export function material(color, opacity = 1) {
  const key = `${color}-${opacity}`;
  if (!materials.has(key)) {
    materials.set(key, new THREE.MeshStandardMaterial({
      color, roughness: 0.62, metalness: 0.05, transparent: opacity < 1, opacity, depthWrite: opacity === 1,
    }));
  }
  return materials.get(key);
}

export function mesh(parent, name, geometry, color, { kind = 'robot', position = [0, 0, 0], opacity = 1 } = {}) {
  const item = new THREE.Mesh(geometry, material(color, opacity));
  item.name = name;
  item.userData.kind = kind;
  item.position.set(...position);
  item.castShadow = opacity === 1;
  item.receiveShadow = true;
  parent.add(item);
  return item;
}

export function group(parent, name, position = [0, 0, 0]) {
  const item = new THREE.Group();
  item.name = name;
  item.position.set(...position);
  parent.add(item);
  return item;
}

export function box(parent, name, center, size, color, options = {}) {
  return mesh(parent, name, new THREE.BoxGeometry(...size), color, { ...options, position: center });
}

// Rectangular member between two points; width is along the member's local "side" (perpendicular in XY where possible).
export function beam(parent, name, from, to, width, depth, color, options = {}) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const span = b.clone().sub(a);
  if (span.length() < 1e-6) throw new Error(`${name}: zero-length beam`);
  const item = box(parent, name, a.clone().add(b).multiplyScalar(0.5).toArray(), [width, depth, span.length()], color, options);
  item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), span.normalize());
  return item;
}

export function cylinder(parent, name, from, to, radius, color, options = {}) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const span = b.clone().sub(a);
  if (span.length() < 1e-6) throw new Error(`${name}: zero-length cylinder`);
  const item = mesh(parent, name, new THREE.CylinderGeometry(radius, radius, span.length(), options.segments ?? 28), color,
    { ...options, position: a.clone().add(b).multiplyScalar(0.5).toArray() });
  item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), span.normalize());
  return item;
}

// Roller with its axis along robot Y (across); shaft sticks out past the tube.
export function rollerY(parent, name, x, z, halfSpan, radius, color = C.roller, { segments = 0 } = {}) {
  cylinder(parent, `${name} shaft`, [x, -halfSpan - 14, z], [x, halfSpan + 14, z], 6.35, C.shaft);
  if (!segments) return cylinder(parent, `${name} roller`, [x, -halfSpan, z], [x, halfSpan, z], radius, color);
  const pitch = (2 * halfSpan) / segments;
  for (let index = 0; index < segments; index++) {
    const y = -halfSpan + (index + 0.5) * pitch;
    cylinder(parent, `${name} wheel ${index + 1}`, [x, y - pitch * 0.32, z], [x, y + pitch * 0.32, z], radius, color);
  }
}

// Flat plate in the robot XZ plane (outline of [x, z] points), centred on y with thickness t.
export function plateXZ(parent, name, y, outline, t, color = C.plate, options = {}) {
  const shape = new THREE.Shape();
  outline.forEach(([x, z], index) => (index ? shape.lineTo(x, z) : shape.moveTo(x, z)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, y + t / 2, 0);
  return mesh(parent, name, geometry, color, options);
}

// Belt run between two pulley centres in the XZ plane at a given y, drawn as a thin loop.
export function beltXZ(parent, name, y, [x1, z1], [x2, z2], radius, width, color = C.belt) {
  const dx = x2 - x1, dz = z2 - z1, length = Math.hypot(dx, dz);
  const nx = -dz / length * radius, nz = dx / length * radius;
  for (const [label, sign] of [['A', 1], ['B', -1]]) {
    const run = box(parent, `${name} run ${label}`, [(x1 + x2) / 2 + sign * nx, y, (z1 + z2) / 2 + sign * nz], [length, width, 3], color);
    run.rotation.y = -Math.atan2(dz, dx);
  }
  cylinder(parent, `${name} pulley A`, [x1, y - width / 2, z1], [x1, y + width / 2, z1], radius, C.shaft);
  cylinder(parent, `${name} pulley B`, [x2, y - width / 2, z2], [x2, y + width / 2, z2], radius, C.shaft);
}

export function cube(parent, name, center, yaw = 0, options = {}) {
  const item = box(parent, name, center, [228.6, 228.6, 228.6], C.cube, { kind: 'cube', ...options });
  item.rotation.z = yaw;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(item.geometry), new THREE.LineBasicMaterial({ color: 0x8a6d00 }));
  edges.userData.kind = 'decor';
  item.add(edges);
  return item;
}

// Swerve chassis: frame perimeter L x W (robot x forward, y left, z up; origin at frame centre on carpet).
export function chassis(parent, { L, W, alliance = 'red' }) {
  const base = group(parent, 'drivebase');
  const tube = 50.8, h = 25.4, z0 = 38;
  box(base, 'frame rail front', [L / 2 - tube / 2, 0, z0 + h / 2], [tube, W, h], C.frame);
  box(base, 'frame rail rear', [-L / 2 + tube / 2, 0, z0 + h / 2], [tube, W, h], C.frame);
  box(base, 'frame rail left', [0, W / 2 - tube / 2, z0 + h / 2], [L - 2 * tube, tube, h], C.frame);
  box(base, 'frame rail right', [0, -W / 2 + tube / 2, z0 + h / 2], [L - 2 * tube, tube, h], C.frame);
  box(base, 'belly pan', [0, 0, z0 - 2], [L - 20, W - 20, 4], C.frame);
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    const x = sx * (L / 2 - 68), y = sy * (W / 2 - 68);
    cylinder(base, `swerve wheel ${sx}${sy}`, [x - 19, y, 50.8], [x + 19, y, 50.8], 50.8, C.rubber);
    box(base, `swerve module plate ${sx}${sy}`, [x, y, 92], [118, 118, 10], C.rail);
    cylinder(base, `swerve drive motor ${sx}${sy}`, [x + 22, y, 97], [x + 22, y, 197], 30, C.motor);
    cylinder(base, `swerve steer motor ${sx}${sy}`, [x - 30, y - 30, 97], [x - 30, y - 30, 160], 22, C.motor);
  }
  const color = alliance === 'blue' ? C.blue : C.red;
  const t = 82.55, zb = 63.5, hb = 82.55;
  box(parent, 'bumper front', [L / 2 + t / 2, 0, zb + hb / 2], [t, W + 2 * t, hb], color, { kind: 'bumper' });
  box(parent, 'bumper rear', [-L / 2 - t / 2, 0, zb + hb / 2], [t, W + 2 * t, hb], color, { kind: 'bumper' });
  box(parent, 'bumper left', [0, W / 2 + t / 2, zb + hb / 2], [L, t, hb], color, { kind: 'bumper' });
  box(parent, 'bumper right', [0, -W / 2 - t / 2, zb + hb / 2], [L, t, hb], color, { kind: 'bumper' });
  return base;
}

// Labelled reserved volume (electronics, battery): a legitimate space claim, not a mechanism.
export function reserve(parent, name, center, size, color = C.reserve) {
  return box(parent, name, center, size, color, { kind: 'robot', opacity: 0.55 });
}

export function motor(parent, name, from, to, radius = 30) {
  return cylinder(parent, name, from, to, radius, C.motor);
}

// Straight polyline of beams (hooks, guides).
export function polyline(parent, name, points, width, depth, color) {
  for (let index = 1; index < points.length; index++) beam(parent, `${name} ${index}`, points[index - 1], points[index], width, depth, color);
}
