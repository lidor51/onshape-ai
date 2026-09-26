import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {OrbitControls} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {coaxialTransform, groupOf} from './coaxial-motion.mjs';

const data = window.coaxialData;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#edf1ef');
const camera = new THREE.OrthographicCamera(-500, 500, 500, -500, 0.1, 20000); camera.up.set(0, 0, 1);
let viewportAspect = 1;
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); document.querySelector('main').append(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x63766e, 2.4));
const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(1300, -1800, 2400); scene.add(light);
const root = new THREE.Group(); scene.add(root);
const geometry = new Map();
for (const [name, definition] of Object.entries(data.mesh.definitions)) {
  const shape = new THREE.BufferGeometry();
  shape.setAttribute('position', new THREE.Float32BufferAttribute(definition.positions, 3));
  shape.setIndex(definition.indices); shape.computeVertexNormals(); geometry.set(name, shape);
}
const flagged = new Set(data.cases.flatMap(pair => [pair.first, pair.second]));
const flagMaterial = new THREE.MeshStandardMaterial({color: '#c74b36', roughness: 0.65});
const selectedMotorMaterial = new THREE.MeshStandardMaterial({color: '#007dca', emissive: '#003a57', roughness: 0.45});
for (const part of data.mesh.instances) {
  const definition = data.definitions[part.definition];
  let color = {pickup: '#abc0ba', indexer: '#a8bad0', cradle: '#d4b95c', drives: '#c27642', mounts: '#bfc5c5'}[groupOf(part)];
  if (/motor/.test(part.role)) color = '#c87836';
  if (/outer_elastomer|compliant_contact/.test(part.role)) color = '#3f9465';
  if (part.reference_only) color = '#bd6291';
  const normal = new THREE.MeshStandardMaterial({color, roughness: 0.65, metalness: 0.1,
    transparent: part.reference_only, opacity: part.reference_only ? 0.16 : 1, depthWrite: !part.reference_only});
  const body = new THREE.Mesh(geometry.get(part.definition), normal); body.name = part.id;
  body.matrixAutoUpdate = false; body.userData = {part, definition, normal}; root.add(body);
}
const motorOutline = new THREE.BoxHelper(undefined, '#007dca');
motorOutline.material.depthTest = false; motorOutline.renderOrder = 11; motorOutline.visible = false; scene.add(motorOutline);
const grid = new THREE.GridHelper(1600, 16, '#a4b7aa', '#d4dfd7'); grid.rotateX(Math.PI / 2); scene.add(grid);
let frameOutline = null;
if (data.frame) {
  const {x: horizontal, y: depth} = data.frame;
  const points = [[horizontal[0], depth[0], 0], [horizontal[1], depth[0], 0],
    [horizontal[1], depth[1], 0], [horizontal[0], depth[1], 0], [horizontal[0], depth[0], 0]];
  const shape = new THREE.BufferGeometry().setFromPoints(points.map(point => new THREE.Vector3(...point)));
  frameOutline = new THREE.Line(shape, new THREE.LineBasicMaterial({color: '#a73a25', depthTest: false}));
  frameOutline.renderOrder = 10; scene.add(frameOutline);
}
function render() { renderer.render(scene, camera); }
function update(refit = false) {
  const fold = -Number(document.querySelector('#fold').value), floating = -Number(document.querySelector('#float').value);
  const group = document.querySelector('#group').value;
  const selectedMotor = data.motors?.find(motor => motor.key === document.querySelector('#motor')?.value);
  for (const body of root.children) {
    const part = body.userData.part;
    body.matrix.copy(coaxialTransform(part, data.mesh.motion, fold, floating));
    body.visible = (group === 'all' || groupOf(part) === group) && (!part.reference_only || document.querySelector('#references').checked);
    body.material = document.querySelector('#contacts').checked && flagged.has(part.id) ? flagMaterial : body.userData.normal;
    if (part.id === selectedMotor?.id) body.material = selectedMotorMaterial;
  }
  root.updateMatrixWorld(true);
  const selectedBody = selectedMotor ? root.children.find(body => body.name === selectedMotor.id) : null;
  motorOutline.visible = Boolean(selectedBody?.visible);
  if (motorOutline.visible) motorOutline.setFromObject(selectedBody);
  if (selectedMotor) {
    document.querySelector('#motor-name').textContent = selectedMotor.label;
    document.querySelector('#motor-function').textContent = selectedMotor.function;
    document.querySelector('#motor-ratio').textContent = `${selectedMotor.reduction.toFixed(2)}:1${selectedMotor.kickerReduction ? ` upper / ${selectedMotor.kickerReduction.toFixed(2)}:1 kicker` : ''}`;
    document.querySelector('#motor-height').textContent = `${selectedMotor.centerDatumMm[2].toFixed(1)} mm attachment datum`;
    document.querySelector('#motor-path').textContent = selectedMotor.path;
    document.querySelector('#motor-note').textContent = selectedMotor.note;
  }
  const motorSummary = document.querySelector('#motor-summary');
  if (motorSummary) motorSummary.hidden = !selectedMotor;
  document.querySelector('#fold-value').textContent = `${fold} deg`;
  document.querySelector('#float-value').textContent = `${floating} deg`;
  document.querySelector('#count').textContent = `${root.children.filter(body => body.visible && !body.userData.part.reference_only).length} physical`;
  if (frameOutline) frameOutline.visible = document.querySelector('#perimeter').checked;
  const poseStatus = document.querySelector('#pose-status');
  if (poseStatus) poseStatus.textContent = fold === data.mesh.motion.stow_deg
    ? 'STOW ENVELOPE CONTAINED / NOT RELEASED' : 'NON-STARTING POSE / NOT RELEASED';
  if (refit) fit(); else render();
}
function fit() {
  const box = new THREE.Box3();
  for (const body of root.children) if (body.visible) box.expandByObject(body, true);
  if (frameOutline?.visible) box.expandByObject(frameOutline);
  const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
  const direction = new THREE.Vector3(...{iso: [1, -1, 0.75], side: [1, 0, 0], front: [0, -1, 0], top: [0, 0, 1]}[document.querySelector('#view').value]).normalize();
  camera.up.set(0, Math.abs(direction.z) > 0.99 ? 1 : 0, Math.abs(direction.z) > 0.99 ? 0 : 1);
  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
  const vertical = new THREE.Vector3().crossVectors(direction, right).normalize();
  let halfHeight = 0;
  for (const horizontal of [-1, 1]) for (const depth of [-1, 1]) for (const height of [-1, 1]) {
    const point = new THREE.Vector3(horizontal * size.x / 2, depth * size.y / 2, height * size.z / 2);
    halfHeight = Math.max(halfHeight, Math.abs(point.dot(right)) / viewportAspect, Math.abs(point.dot(vertical)));
  }
  halfHeight = Math.max(1, halfHeight * 1.12);
  camera.left = -halfHeight * viewportAspect; camera.right = halfHeight * viewportAspect;
  camera.top = halfHeight; camera.bottom = -halfHeight; camera.zoom = 1;
  const distance = Math.max(100, size.length() * 2);
  camera.position.copy(center).addScaledVector(direction, distance);
  controls.target.copy(center); controls.maxDistance = distance * 4; camera.far = distance * 12;
  camera.updateProjectionMatrix(); controls.update(); render();
}
function resize() {
  const box = document.querySelector('main').getBoundingClientRect(); renderer.setSize(box.width, box.height);
  viewportAspect = box.width / box.height; camera.updateProjectionMatrix(); fit();
}
for (const name of ['fold', 'float', 'references', 'contacts']) document.querySelector('#' + name).addEventListener('input', () => update());
document.querySelector('#group').addEventListener('change', () => update(true));
document.querySelector('#motor')?.addEventListener('change', () => {
  document.querySelector('#group').value = 'all'; update();
});
document.querySelector('#view').addEventListener('change', fit);
document.querySelector('#perimeter')?.addEventListener('change', () => update(true));
controls.addEventListener('change', render); window.addEventListener('resize', resize);
update(); resize();
window.coaxialReview = {ready: true, root, camera, controls, frameOutline, motorOutline, canvas: renderer.domElement, update, fit, resize};