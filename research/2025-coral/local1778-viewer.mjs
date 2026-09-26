import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {OrbitControls} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/controls/OrbitControls.js';

const status = document.querySelector('#status');
try {
  const [model, binary] = await Promise.all([fetch('model.json').then(response => response.json()), fetch('geometry.bin').then(response => response.arrayBuffer())]);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eef1ef');
  const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const area = document.querySelector('main');
  area.append(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
  camera.up.set(0, 0, 1);
  const controls = new OrbitControls(camera, renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x68776b, 2));
  const light = new THREE.DirectionalLight(0xffffff, 2.3);
  light.position.set(-2, -4, 5);
  scene.add(light);
  const types = {Float32Array, Uint32Array, Uint16Array, Int16Array, Uint8Array, Int8Array};
  const array = description => new types[description.type](binary, description.offset, description.length);
  const materials = model.materials.map(description => {
    const factor = description.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];
    return new THREE.MeshStandardMaterial({name: description.name, color: new THREE.Color().setRGB(...factor.slice(0, 3), THREE.LinearSRGBColorSpace), opacity: factor[3], transparent: description.alphaMode === 'BLEND', alphaTest: description.alphaMode === 'MASK' ? description.alphaCutoff ?? 0.5 : 0, side: description.doubleSided ? THREE.DoubleSide : THREE.FrontSide, metalness: description.pbrMetallicRoughness?.metallicFactor ?? 1, roughness: description.pbrMetallicRoughness?.roughnessFactor ?? 1});
  });
  const geometries = model.meshes.map(mesh => mesh.groups.map(group => {
    const geometry = new THREE.BufferGeometry();
    for (const [name, attribute] of Object.entries(group.attributes)) geometry.setAttribute(name, new THREE.BufferAttribute(array(attribute), attribute.itemSize, attribute.normalized));
    if (group.index) geometry.setIndex(new THREE.BufferAttribute(array(group.index), 1));
    geometry.computeBoundingSphere();
    return {geometry, material: group.material < 0 ? new THREE.MeshStandardMaterial() : materials[group.material]};
  }));
  const nodes = model.nodes.map((node, index) => {
    const object = new THREE.Group();
    object.name = node.name ?? '';
    object.userData.sourceIndex = index;
    if (node.matrix) {object.matrix.fromArray(node.matrix); object.matrixAutoUpdate = false;}
    else {object.position.fromArray(node.translation ?? [0, 0, 0]); object.quaternion.fromArray(node.rotation ?? [0, 0, 0, 1]); object.scale.fromArray(node.scale ?? [1, 1, 1]);}
    if (node.mesh !== undefined) geometries[node.mesh].forEach(({geometry, material}) => {const mesh = new THREE.Mesh(geometry, material); mesh.userData.sourceIndex = index; object.add(mesh);});
    return object;
  });
  model.nodes.forEach((node, index) => (node.children ?? []).forEach(child => nodes[index].add(nodes[child])));
  model.roots.forEach(index => scene.add(nodes[index]));
  scene.updateMatrixWorld(true);
  const scope = document.querySelector('#scope');
  const context = document.querySelector('#context');
  const view = document.querySelector('#view');
  const partSelect = document.querySelector('#part');
  const isolate = document.querySelector('#isolate');
  const selection = document.querySelector('#selection');
  let visibleParts = [];
  let bounds = new THREE.Box3();
  let marker;
  function render() {renderer.render(scene, camera);}
  function extent(part) {return new THREE.Box3(new THREE.Vector3(...part.minMm).multiplyScalar(0.001), new THREE.Vector3(...part.maxMm).multiplyScalar(0.001));}
  function selectedPart() {return model.records.find(part => String(part.index) === partSelect.value);}
  function fit() {
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const direction = new THREE.Vector3(...{iso: [-1.1, -1.5, 0.95], front: [0, -1, 0], side: [-1, 0, 0], top: [0, 0, 1], rear: [0, 1, 0]}[view.value]).normalize();
    camera.up.set(0, view.value === 'top' ? 1 : 0, view.value === 'top' ? 0 : 1);
    const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
    const vertical = new THREE.Vector3().crossVectors(direction, right).normalize();
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let distance = 0;
    for (const horizontal of [-1, 1]) for (const depth of [-1, 1]) for (const height of [-1, 1]) {
      const corner = new THREE.Vector3(horizontal * size.x / 2, depth * size.y / 2, height * size.z / 2);
      distance = Math.max(distance, Math.max(Math.abs(corner.dot(right)) / (tangent * camera.aspect), Math.abs(corner.dot(vertical)) / tangent) + corner.dot(direction));
    }
    distance = Math.max(0.02, distance * 1.13);
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.target.copy(center);
    controls.minDistance = distance / 100;
    controls.maxDistance = distance * 10;
    camera.near = Math.max(0.00001, distance / 10000);
    camera.far = Math.max(100, distance * 20);
    camera.updateProjectionMatrix();
    controls.update();
    render();
  }
  function updateSelection() {
    if (marker) {scene.remove(marker); marker.geometry.dispose(); marker.material.dispose(); marker = null;}
    const part = selectedPart();
    if (part) {
      marker = new THREE.Box3Helper(extent(part), 0xd04e32);
      scene.add(marker);
      selection.textContent = `#${part.index} ${part.name} | XYZ AABB ${part.sizeMm.map(value => value.toFixed(2)).join(' / ')} | center ${part.centerMm.map(value => value.toFixed(2)).join(' / ')}`;
    } else selection.textContent = `XYZ bounds ${bounds.getSize(new THREE.Vector3()).multiplyScalar(1000).toArray().map(value => value.toFixed(1)).join(' / ')} mm`;
  }
  function update(rebuildOptions = true) {
    const groups = {subsystem: [132, 1637], intake: [1637], arm: [132], elevator: [382], all: [1, 132, 382, 1637], chassis: [1]}[scope.value];
    const included = context.checked ? [1, 132, 382, 1637] : groups;
    const candidates = model.records.filter(part => included.includes(part.group));
    if (rebuildOptions) {
      const previous = partSelect.value;
      partSelect.replaceChildren(new Option('All visible parts', ''), ...candidates.map(part => new Option(`#${part.index} ${part.name}`, part.index)));
      if (candidates.some(part => String(part.index) === previous)) partSelect.value = previous;
    }
    const selected = selectedPart();
    visibleParts = candidates.filter(part => !isolate.checked || !selected || part.index === selected.index);
    const indices = new Set(visibleParts.map(part => part.index));
    bounds.makeEmpty();
    model.records.forEach(part => {nodes[part.index].visible = indices.has(part.index); if (nodes[part.index].visible) bounds.union(extent(part));});
    updateSelection();
    status.textContent = `${visibleParts.length} / ${model.counts.physicalPartOccurrences} part occurrences | ${model.counts.meshDefinitions} source meshes | Source pose`;
    fit();
  }
  function resize() {
    const rectangle = area.getBoundingClientRect();
    renderer.setSize(rectangle.width, rectangle.height);
    camera.aspect = rectangle.width / rectangle.height;
    camera.updateProjectionMatrix();
    fit();
  }
  controls.addEventListener('change', render);
  scope.addEventListener('change', () => {context.checked = false; isolate.checked = false; update();});
  context.addEventListener('change', () => update());
  partSelect.addEventListener('change', () => {if (isolate.checked) update(false); else {updateSelection(); render();}});
  isolate.addEventListener('change', () => update(false));
  view.addEventListener('change', fit);
  document.querySelector('#fit').addEventListener('click', fit);
  const raycaster = new THREE.Raycaster();
  let pointerStart;
  renderer.domElement.addEventListener('pointerdown', event => {pointerStart = [event.clientX, event.clientY];});
  renderer.domElement.addEventListener('pointerup', event => {
    if (!pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 4) return;
    const rectangle = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rectangle.left) / rectangle.width * 2 - 1, -(event.clientY - rectangle.top) / rectangle.height * 2 + 1), camera);
    const hit = raycaster.intersectObjects(visibleParts.map(part => nodes[part.index]), true)[0];
    if (hit) {partSelect.value = String(hit.object.userData.sourceIndex); updateSelection(); render();}
  });
  window.addEventListener('resize', resize);
  update(); resize();
  window.local1778 = {ready: true, model, camera, controls, renderer, render, fit, resize, get visibleParts() {return visibleParts;}, get bounds() {return bounds;}, nodes, sourcePoseUnchanged: () => model.records.every(part => nodes[part.index].matrixWorld.toArray().every((value, index) => Math.abs(value - part.matrix[index]) < 1e-12))};
} catch (error) {status.textContent = error.message; status.classList.add('error'); console.error(error);}