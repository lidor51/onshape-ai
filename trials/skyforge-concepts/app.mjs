import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONCEPTS, concept } from './robots.mjs';
import { TASKS, PHASE_NAMES, scene, isolated } from './tasks.mjs';
import { SF5, SF6, SF7, SF8, sf5Reach, sf5Drop } from './magazine.mjs';

const field = window.SKYFORGE_FIELD;
const summary = window.SKYFORGE_SUMMARY;
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------- shared scene
const world = new THREE.Scene();
world.background = new THREE.Color(0xf4efe3);
const root = new THREE.Group();
root.scale.setScalar(0.001);
world.add(root);
world.add(new THREE.HemisphereLight(0xfff8ec, 0x6b5a45, 2.2));
const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
world.add(sun, sun.target);

const fieldGroup = new THREE.Group();
fieldGroup.name = 'field';
root.add(fieldGroup);
const fieldCubes = new Map();
for (const part of field.parts) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(part.vertices, 3));
  geometry.setIndex(part.triangles);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: part.color, roughness: 0.8, metalness: 0.02, transparent: part.opacity < 1, opacity: part.opacity, depthWrite: part.opacity === 1, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = part.name;
  mesh.receiveShadow = true;
  mesh.castShadow = part.opacity === 1 && !['floor', 'markings'].includes(part.layer);
  fieldGroup.add(mesh);
  if (/cube/i.test(part.layer)) fieldCubes.set(part.name, mesh);
  if (['goals', 'boards'].includes(part.layer)) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), new THREE.LineBasicMaterial({ color: 0x3b2a18, transparent: true, opacity: 0.35 })));
}
const plain = new THREE.Mesh(new THREE.CircleGeometry(4000, 48), new THREE.MeshStandardMaterial({ color: 0xe9e1cf, roughness: 1 }));
plain.receiveShadow = true;
plain.visible = false;
root.add(plain);

let content = new THREE.Group();
root.add(content);

function setContent(built, { showField = true, showAids = true } = {}) {
  root.remove(content);
  content = new THREE.Group();
  content.add(built.root);
  if (built.extras) { built.extras.visible = showAids; content.add(built.extras); }
  root.add(content);
  fieldGroup.visible = showField;
  plain.visible = !showField;
  plain.position.set(built.root.position.x, built.root.position.y, -1);
  for (const mesh of fieldCubes.values()) mesh.visible = true;
  for (const name of built.hide ?? []) if (fieldCubes.has(name)) fieldCubes.get(name).visible = false;
}

function aimLights(target, radius) {
  sun.position.set(target.x + radius * 0.6, target.y - radius * 0.9, target.z + radius * 1.6);
  sun.target.position.copy(target);
  const span = Math.max(2.5, radius * 1.4);
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.1, far: radius * 5 + 10 });
  sun.shadow.camera.updateProjectionMatrix();
}

function frame(camera, controls, { target, direction, radius }) {
  const t = new THREE.Vector3(...target).multiplyScalar(0.001);
  const d = new THREE.Vector3(...direction).normalize();
  const r = radius * 0.001;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fit = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect));
  const distance = r / Math.sin(fit / 2);
  camera.position.copy(t).addScaledVector(d, distance);
  camera.near = Math.max(0.01, distance / 200);
  camera.far = distance * 40 + 60;
  camera.updateProjectionMatrix();
  if (controls) { controls.target.copy(t); controls.update(); } else camera.lookAt(t);
  aimLights(t, r);
}

function robotCamera(built, view) {
  const box = new THREE.Box3().setFromObject(built.root);
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const yaw = built.root.rotation.z;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const local = { iso: [1.15, 1.25, 0.85], side: [0, 1, 0.08], front: [1, 0, 0.08], rear: [-1, 0, 0.1], top: [0.001, 0, 1] }[view];
  const direction = [local[0] * c - local[1] * s, local[0] * s + local[1] * c, local[2]];
  return { target: centre.toArray(), direction, radius: Math.max(size.x, size.y, size.z) * 0.62 };
}

// ---------------------------------------------------------------- offscreen renders (gallery, compare)
const shot = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
shot.setPixelRatio(1);
shot.setSize(720, 520);
shot.shadowMap.enabled = true;
shot.outputColorSpace = THREE.SRGBColorSpace;
shot.toneMapping = THREE.ACESFilmicToneMapping;
const shotCamera = new THREE.PerspectiveCamera(34, 720 / 520, 0.01, 200);
shotCamera.up.set(0, 0, 1);

function snapshot(built, camera, options) {
  setContent(built, options);
  frame(shotCamera, null, camera);
  shot.render(world, shotCamera);
  return shot.domElement.toDataURL('image/png');
}

const SIGNATURE = {
  SF1: { intake: 'deployed', barrel: 58, cubes: [{ slot: 'barrel', lane: 127.5 }, { slot: 'barrel', lane: -127.5 }, { slot: 'front', lane: 127.5 }, { slot: 'front', lane: -127.5 }] },
  SF2: { intake: 'deployed', cubes: [{ slot: 'lane', lane: 127.5 }, { slot: 'lane', lane: -127.5 }, { slot: 'front', lane: 127.5 }, { slot: 'front', lane: -127.5 }] },
  SF3: { intake: 'deployed', trayZ: 1005, reach: 486, fork: true, pushed: 61.35, cubes: [{ slot: 'tray' }, { slot: 'tray' }, { slot: 'tray' }, { slot: 'mouth', lane: 0 }] },
  SF4: { intake: 'deployed', trayZ: 1005, reach: 486, fork: true, pushed: 61.35, cubes: [{ slot: 'tray' }, { slot: 'tray' }, { slot: 'mouth', lane: 0 }] },
  SF5: { intake: 'stowed', shoulder: sf5Reach(sf5Drop(SF5.L), 90).shoulder, axis: 90, column: 4, fork: true },
  SF6: { intake: 'stowed', carriage: SF6.travel, tilt: 180, tray: 4, fork: true },
  SF7: { intake: 'stowed', crank: SF7.sweep, tray: 4, fork: true },
  SF8: { intake: 'stowed', h: SF8.g3, tilt: 180, tray: 4, fork: true },
};

function isolatedBuilt(id, pose) {
  const robot = isolated(id, pose);
  return { root: robot, extras: null, hide: [] };
}

// ---------------------------------------------------------------- gallery
function renderGallery() {
  const grid = $('#concept-grid');
  grid.innerHTML = CONCEPTS.map(item => {
    const stats = summary.concepts[item.id];
    return `<article class="card" data-id="${item.id}">
      <div class="duo"><figure><img alt="${esc(item.name)} collapsed" data-shot="${item.id}-stow"><figcaption>Collapsed / start</figcaption></figure>
      <figure><img alt="${esc(item.name)} working pose" data-shot="${item.id}-work"><figcaption>Working pose</figcaption></figure></div>
      <h3><span class="tag">${item.id}</span> ${esc(item.name)}</h3>
      <p class="tagline">${esc(item.tagline)}</p>
      <p>${esc(item.role)}</p>
      <div class="chips">${item.tasks.filter(task => task !== 'start').map(task => `<span class="chip s-${stats.tasks[task]}">${esc(TASKS[task].name)}</span>`).join('')}</div>
      <dl class="counts"><div><dt>Motors</dt><dd>${item.complexity.motors}</dd></div><div><dt>Positioning DOF</dt><dd>${item.complexity.positioningDof}</dd></div><div><dt>State changes / cycle</dt><dd>${item.complexity.stateChanges}</dd></div><div><dt>Capacity</dt><dd>${item.capacity}</dd></div></dl>
      <button type="button" class="open" data-id="${item.id}">Open in 3D field</button>
    </article>`;
  }).join('');
  grid.querySelectorAll('button.open').forEach(button => button.addEventListener('click', () => openViewer(button.dataset.id)));
  const jobs = CONCEPTS.flatMap(item => [
    [`${item.id}-stow`, () => { const built = scene(item.id, 'start', 'start'); return snapshot({ ...built, extras: null }, robotCamera(built, 'iso'), { showField: false }); }],
    [`${item.id}-work`, () => { const built = isolatedBuilt(item.id, SIGNATURE[item.id]); return snapshot(built, robotCamera(built, 'iso'), { showField: false }); }],
  ]);
  for (const [name, render] of jobs) document.querySelector(`img[data-shot="${name}"]`).src = render();
  restoreViewer();
}

// ---------------------------------------------------------------- viewer
const canvasHost = $('#scene');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
canvasHost.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 200);
camera.up.set(0, 0, 1);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const state = { id: 'SF1', task: 'vgZone', phase: 'release', view: 'task', field: true, aids: true };
let current = null;

function resize() {
  const width = canvasHost.clientWidth, height = canvasHost.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
}
new ResizeObserver(() => { resize(); if (current) applyCamera(); }).observe(canvasHost);

function fillSelect(select, entries, value) {
  select.innerHTML = entries.map(([key, label]) => `<option value="${key}"${key === value ? ' selected' : ''}>${esc(label)}</option>`).join('');
}

function syncControls() {
  const item = concept(state.id);
  if (!item.tasks.includes(state.task)) state.task = item.tasks.includes('vgZone') ? 'vgZone' : item.tasks[1];
  if (!TASKS[state.task].phases.includes(state.phase)) state.phase = TASKS[state.task].phases.at(-1);
  fillSelect($('#robot'), CONCEPTS.map(entry => [entry.id, `${entry.id} ${entry.name}`]), state.id);
  fillSelect($('#task'), item.tasks.map(task => [task, `${TASKS[task].group}: ${TASKS[task].name}`]), state.task);
  fillSelect($('#phase'), TASKS[state.task].phases.map(phase => [phase, PHASE_NAMES[phase]]), state.phase);
  $('#view').value = state.view;
  $('#field').checked = state.field;
  $('#aids').checked = state.aids;
}

function applyCamera() {
  const spec = state.view === 'task' ? current.camera : robotCamera(current, state.view);
  frame(camera, controls, spec);
}

const STATUS = { pass: 'PASS', flag: 'FLAG', fail: 'FAIL', info: 'NOTE' };
function updatePanel() {
  const item = concept(state.id);
  const task = TASKS[state.task];
  $('#p-title').textContent = `${item.id} ${item.name}`;
  $('#p-tagline').textContent = item.tagline;
  $('#p-role').textContent = item.role;
  $('#p-heights').textContent = item.heights;
  $('#p-why').textContent = item.why;
  $('#p-task').textContent = `${task.name} / ${PHASE_NAMES[state.phase]}`;
  $('#p-task-note').textContent = task.note + (current.pose.barrel ? ` Barrel pitch selected: ${current.pose.barrel} deg.` : '');
  $('#p-checks').innerHTML = current.checks.map(entry => `<li class="c-${entry.status}"><b>${STATUS[entry.status]}</b><span><strong>${esc(entry.label)}</strong><br>${esc(entry.detail)}</span></li>`).join('');
  $('#p-risks').innerHTML = item.risks.map(risk => `<li>${esc(risk)}</li>`).join('');
  const k = item.complexity;
  $('#p-complexity').innerHTML = `<tr><th>Motors (all purposes)</th><td>${k.motors}</td></tr><tr><th>Positioning DOF</th><td>${k.positioningDof}</td></tr><tr><th>Piece handoffs per cycle</th><td>${k.handoffs}</td></tr><tr><th>State changes per cycle</th><td>${k.stateChanges}</td></tr><tr><th>Moving cables</th><td>${esc(k.movingCables)}</td></tr><tr><th>Service</th><td>${esc(k.service)}</td></tr>`;
  $('#status').textContent = `${item.id} / ${task.name} / ${PHASE_NAMES[state.phase]} - one physical configuration, static pose, not a motion proof`;
}

function rebuild({ keepCamera = false } = {}) {
  current = scene(state.id, state.task, state.phase);
  setContent(current, { showField: state.field, showAids: state.aids });
  updatePanel();
  if (!keepCamera) applyCamera();
  history.replaceState(null, '', `#viewer/${state.id}/${state.task}/${state.phase}`);
}

function openViewer(id, task) {
  state.id = id;
  if (task) state.task = task;
  syncControls();
  rebuild();
  $('#viewer').scrollIntoView({ behavior: 'smooth' });
}

function restoreViewer() {
  if (current) { setContent(current, { showField: state.field, showAids: state.aids }); applyCamera(); }
}

$('#robot').addEventListener('change', event => { state.id = event.target.value; syncControls(); rebuild(); });
$('#task').addEventListener('change', event => { state.task = event.target.value; state.phase = TASKS[state.task].phases.at(-1); syncControls(); rebuild(); });
$('#phase').addEventListener('change', event => { state.phase = event.target.value; rebuild({ keepCamera: state.view === 'task' ? false : true }); });
$('#view').addEventListener('change', event => { state.view = event.target.value; applyCamera(); });
$('#field').addEventListener('change', event => { state.field = event.target.checked; setContent(current, { showField: state.field, showAids: state.aids }); });
$('#aids').addEventListener('change', event => { state.aids = event.target.checked; setContent(current, { showField: state.field, showAids: state.aids }); });

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(world, camera);
}

// ---------------------------------------------------------------- compare: same target, same phase, same camera
function renderCompare() {
  const task = $('#c-task').value, phase = $('#c-phase').value;
  const capable = CONCEPTS.filter(item => item.tasks.includes(task));
  const builds = capable.map(item => scene(item.id, task, phase));
  const fixedCamera = builds[0].camera;
  const cells = builds.map(built => {
    const item = concept(built.id);
    const fails = built.checks.filter(entry => entry.status === 'fail'), flags = built.checks.filter(entry => entry.status === 'flag');
    const image = snapshot(built, fixedCamera, { showField: true, showAids: true });
    return `<figure class="cmp"><img src="${image}" alt="${esc(item.name)} ${esc(task)} ${esc(phase)}"><figcaption><b>${item.id} ${esc(item.name)}</b>${built.pose.barrel ? ` - barrel ${built.pose.barrel} deg` : ''}<br><span class="c-fail">${fails.length} fail</span> / <span class="c-flag">${flags.length} flag</span> / ${built.checks.filter(entry => entry.status === 'pass').length} pass${fails.length || flags.length ? `<br><small>${[...fails, ...flags].map(entry => esc(entry.label)).join('; ')}</small>` : ''}</figcaption></figure>`;
  });
  const missing = CONCEPTS.filter(item => !item.tasks.includes(task)).map(item => `${item.id} ${item.name}`);
  $('#compare-grid').innerHTML = cells.join('') + (missing.length ? `<p class="missing">Not offered (capability omitted, not faked): ${esc(missing.join(', '))}</p>` : '');
  restoreViewer();
}
const taskKeys = Object.keys(TASKS).filter(task => task !== 'start');
fillSelect($('#c-task'), taskKeys.map(task => [task, `${TASKS[task].group}: ${TASKS[task].name}`]), 'vgZone');
const syncComparePhases = () => fillSelect($('#c-phase'), TASKS[$('#c-task').value].phases.map(phase => [phase, PHASE_NAMES[phase]]), TASKS[$('#c-task').value].phases.at(-1));
syncComparePhases();
$('#c-task').addEventListener('change', () => { syncComparePhases(); renderCompare(); });
$('#c-phase').addEventListener('change', renderCompare);

// ---------------------------------------------------------------- boot
const parseRoute = () => {
  const route = location.hash.match(/^#viewer\/(SF\d)\/(\w+)\/(\w+)/);
  return route && CONCEPTS.some(item => item.id === route[1]) ? { id: route[1], task: route[2], phase: route[3] } : null;
};
Object.assign(state, parseRoute() ?? {});
window.addEventListener('hashchange', () => {
  const route = parseRoute();
  if (!route) return;
  Object.assign(state, route);
  syncControls();
  rebuild();
  $('#viewer').scrollIntoView();
});
syncControls();
resize();
rebuild();
animate();
renderGallery();
renderCompare();
window.SKYFORGE_READY = true;
