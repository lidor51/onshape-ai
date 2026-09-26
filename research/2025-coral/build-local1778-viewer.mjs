import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {mergeGeometries} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import {build} from '../../trials/whole-robot-concepts/mechanisms/node_modules/esbuild/lib/main.js';

const directory = new URL('../../.cache/reference-cad/1778/local-viewer/', import.meta.url);
const expectedHash = 'a52dc4f1110034338c01d2330df4bc13ef551dda42183001007b28e6bbfe8ce8';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const arrayTypes = {5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array};
const widths = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16};
const semantics = {POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', TEXCOORD_1: 'uv1', COLOR_0: 'color', TANGENT: 'tangent'};

export function compactSource(source) {
  assert.equal(source.asset.version, '2.0');
  assert.equal(source.animations?.length ?? 0, 0);
  assert.equal(source.skins?.length ?? 0, 0);
  assert.equal(source.textures?.length ?? 0, 0, 'Texture support must be explicit');
  const buffers = source.buffers.map(buffer => {
    assert.match(buffer.uri, /^data:.*;base64,/);
    return Buffer.from(buffer.uri.slice(buffer.uri.indexOf(',') + 1), 'base64');
  });
  function attribute(index) {
    const accessor = source.accessors[index];
    assert.ok(!accessor.sparse, 'Sparse accessor unsupported');
    const view = source.bufferViews[accessor.bufferView];
    const ArrayType = arrayTypes[accessor.componentType];
    const width = widths[accessor.type];
    assert.ok(ArrayType && width);
    const stride = view.byteStride ?? width * ArrayType.BYTES_PER_ELEMENT;
    const bytes = buffers[view.buffer];
    const offset = bytes.byteOffset + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const packed = new ArrayType(accessor.count * width);
    for (let row = 0; row < accessor.count; row++) {
      packed.set(new ArrayType(bytes.buffer, offset + row * stride, width), row * width);
    }
    return new THREE.BufferAttribute(packed, width, accessor.normalized ?? false);
  }
  const chunks = [];
  let byteLength = 0;
  function store(array) {
    const padding = (4 - byteLength % 4) % 4;
    if (padding) { chunks.push(Buffer.alloc(padding)); byteLength += padding; }
    const result = {type: array.constructor.name, offset: byteLength, length: array.length};
    const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
    chunks.push(bytes);
    byteLength += bytes.length;
    return result;
  }
  let sourcePrimitives = 0;
  let triangles = 0;
  const geometryObjects = [];
  const meshes = source.meshes.map(mesh => {
    const buckets = new Map();
    for (const primitive of mesh.primitives) {
      assert.equal(primitive.mode ?? 4, 4, 'Only source triangles supported');
      assert.ok(!primitive.targets && !primitive.extensions);
      const geometry = new THREE.BufferGeometry();
      for (const [semantic, index] of Object.entries(primitive.attributes)) {
        assert.ok(semantics[semantic], `Unsupported attribute ${semantic}`);
        geometry.setAttribute(semantics[semantic], attribute(index));
      }
      if (primitive.indices !== undefined) geometry.setIndex(attribute(primitive.indices));
      const material = primitive.material ?? -1;
      const signature = JSON.stringify([material, Object.keys(geometry.attributes).sort(), !!geometry.index]);
      if (!buckets.has(signature)) buckets.set(signature, {material, geometries: []});
      buckets.get(signature).geometries.push(geometry);
      sourcePrimitives++;
      triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3;
    }
    const groups = [...buckets.values()].map(bucket => {
      const merged = mergeGeometries(bucket.geometries, false);
      assert.ok(merged, 'Part merge failed');
      const before = bucket.geometries.reduce((total, geometry) => total + (geometry.index?.count ?? geometry.attributes.position.count), 0);
      assert.equal(merged.index?.count ?? merged.attributes.position.count, before);
      const bounds = new THREE.Box3();
      bucket.geometries.forEach(geometry => {geometry.computeBoundingBox(); bounds.union(geometry.boundingBox);});
      merged.computeBoundingBox();
      assert.deepEqual(merged.boundingBox.min.toArray(), bounds.min.toArray());
      assert.deepEqual(merged.boundingBox.max.toArray(), bounds.max.toArray());
      const attributes = Object.fromEntries(Object.entries(merged.attributes).map(([name, value]) => [name, {...store(value.array), itemSize: value.itemSize, normalized: value.normalized}]));
      const index = merged.index ? store(merged.index.array) : null;
      return {material: bucket.material, attributes, index, geometry: merged};
    });
    geometryObjects.push(groups.map(group => group.geometry));
    return {name: mesh.name, groups: groups.map(({geometry, ...group}) => group)};
  });
  const records = [];
  const roots = source.scenes[source.scene ?? 0].nodes;
  const nodeObjects = source.nodes.map(node => {
    assert.ok(node.skin === undefined);
    const object = new THREE.Object3D();
    if (node.matrix) { object.matrix.fromArray(node.matrix); object.matrixAutoUpdate = false; }
    else {object.position.fromArray(node.translation ?? [0, 0, 0]); object.quaternion.fromArray(node.rotation ?? [0, 0, 0, 1]); object.scale.fromArray(node.scale ?? [1, 1, 1]); object.updateMatrix();}
    return object;
  });
  source.nodes.forEach((node, index) => (node.children ?? []).forEach(child => nodeObjects[index].add(nodeObjects[child])));
  roots.forEach(index => nodeObjects[index].updateMatrixWorld(true));
  function walk(index, ancestry) {
    const node = source.nodes[index];
    const path = [...ancestry, index];
    if (node.mesh !== undefined) {
      const world = new THREE.Box3();
      const local = new THREE.Box3();
      const vertex = new THREE.Vector3();
      for (const geometry of geometryObjects[node.mesh]) {
        local.union(geometry.boundingBox);
        const positions = geometry.attributes.position;
        for (let offset = 0; offset < positions.count; offset++) world.expandByPoint(vertex.fromBufferAttribute(positions, offset).applyMatrix4(nodeObjects[index].matrixWorld));
      }
      const toMm = vector => vector.toArray().map(value => value * 1000);
      records.push({index, name: node.name ?? '', mesh: node.mesh, group: path[1], ancestry: path, metadata: node.extensions?.PTC_onshape_metadata ?? null, matrix: nodeObjects[index].matrixWorld.toArray(), minMm: toMm(world.min), maxMm: toMm(world.max), sizeMm: toMm(world.getSize(new THREE.Vector3())), centerMm: toMm(world.getCenter(new THREE.Vector3())), localMinMm: toMm(local.min), localMaxMm: toMm(local.max), localSizeMm: toMm(local.getSize(new THREE.Vector3()))});
    }
    for (const child of node.children ?? []) walk(child, path);
  }
  roots.forEach(index => walk(index, []));
  assert.equal(records.length, source.nodes.filter(node => node.mesh !== undefined).length);
  assert.ok(records.every(part => part.sizeMm.every(Number.isFinite)));
  const groups = source.nodes[0].children.map(index => ({index, name: source.nodes[index].name, occurrences: records.filter(part => part.group === index).length}));
  return {binary: Buffer.concat(chunks), model: {asset: source.asset, nodes: source.nodes, roots, materials: source.materials, meshes, records, groups, counts: {nodes: source.nodes.length, meshDefinitions: meshes.length, physicalPartOccurrences: records.length, facePrimitives: sourcePrimitives, mergedMaterialPrimitives: meshes.reduce((total, mesh) => total + mesh.groups.length, 0), sourceTriangles: triangles, binaryBytes: byteLength}, provenance: {sourceSha256: expectedHash, units: 'glTF meters; measurements millimeters', geometry: 'Source triangles merged per mesh and material; no simplification or invented geometry', pose: 'All original node transforms; no joint solver or animation'}}};
}

async function bundleViewer() {
  const bundled = await build({entryPoints: [fileURLToPath(new URL('local1778-viewer.mjs', import.meta.url))], bundle: true, write: false, format: 'esm', minify: true, legalComments: 'none'});
  writeFileSync(new URL('viewer.js', directory), bundled.outputFiles[0].text);
  writeFileSync(new URL('index.html', directory), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>1778 actual CAD</title><style>
*{box-sizing:border-box}body{margin:0;background:#eef1ef;color:#202a25;font-family:'Segoe UI',sans-serif;letter-spacing:0;display:grid;grid-template-rows:auto minmax(250px,1fr) auto;height:100dvh}header{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #b4c4bb;background:#fff;flex-wrap:wrap}h1{font-size:18px;margin:0 10px 0 0;font-family:Georgia,serif}label{display:flex;gap:5px;align-items:center;font-size:13px}select,button,input{font:inherit;max-width:100%;border:1px solid #87998e;background:white;border-radius:3px;padding:5px}button{width:32px;height:32px;cursor:pointer}main{min-height:0;position:relative;overflow:hidden}canvas{display:block;touch-action:none;width:100%;height:100%}footer{border-top:1px solid #b4c4bb;background:#fff;padding:8px 14px;display:grid;gap:5px;font-size:12px}#part{max-width:350px}#selection{overflow-wrap:anywhere;min-height:18px}#status{font-variant-numeric:tabular-nums;color:#375743}.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.error{color:#a00000}@media(max-width:600px){header{gap:7px;padding:8px}h1{font-size:17px}label{font-size:12px}#part{width:100%;max-width:none}.parts{flex:1 0 100%}footer{padding:7px 8px;font-size:11px}}
</style></head><body><header><h1>1778 / Actual CAD</h1><label>Assembly<select id="scope"><option value="subsystem">Intake + arm</option><option value="intake">Intake</option><option value="arm">Arm / receiver</option><option value="elevator">Elevator + pivot drive</option><option value="all">Full source</option><option value="chassis">Drivetrain</option></select></label><label><input type="checkbox" id="context" checked>Context</label><label>View<select id="view"><option value="iso">Isometric</option><option value="front">Front</option><option value="side">Side</option><option value="top">Top</option><option value="rear">Rear</option></select></label><button id="fit" title="Fit visible assembly" aria-label="Fit visible assembly">&#x26F6;</button><label class="parts">Part<select id="part"><option value="">All visible parts</option></select></label><label><input id="isolate" type="checkbox">Isolate part</label></header><main aria-label="1778 source geometry"></main><footer><div id="status">Loading local source geometry</div><div id="selection"></div><div>Unmodified source pose | Mesh dimensions, mm | Materials and joints unverified</div></footer><script type="module" src="viewer.js"></script></body></html>`);
}

export function serve(port = 49178) {
  const files = {'/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/viewer.js': ['viewer.js', 'text/javascript'], '/model.json': ['model.json', 'application/json'], '/geometry.bin': ['geometry.bin', 'application/octet-stream']};
  const server = createServer((request, response) => {
    const entry = files[new URL(request.url, 'http://127.0.0.1').pathname];
    if (request.method !== 'GET' || !entry) {response.writeHead(404).end(); return;}
    response.writeHead(200, {'Content-Type': entry[1], 'Cache-Control': 'no-store'});
    response.end(readFileSync(new URL(entry[0], directory)));
  });
  server.listen(port, '127.0.0.1', () => console.log(`1778 local viewer http://127.0.0.1:${server.address().port}/`));
  return server;
}

if (import.meta.main) {
  mkdirSync(directory, {recursive: true});
  if (process.argv.includes('--serve')) serve(Number(process.argv[process.argv.indexOf('--serve') + 1]) || 49178);
  else if (process.argv.includes('--bundle')) {await bundleViewer(); console.log('Viewer bundled');}
  else {
    const path = process.argv[2] ?? 'C:/Users/lidor/Downloads/Full Assembly 1778 2025.gltf';
    const original = readFileSync(path);
    assert.equal(original.length, 273057824);
    assert.equal(hash(original), expectedHash);
    const protectedNames = ['local-file-receipt.json', 'local-measurements.json', 'intake-arm-chassis.gltf'];
    const protectedHashes = Object.fromEntries(protectedNames.map(name => [name, hash(readFileSync(new URL('../' + name, directory)))]));
    const {model, binary} = compactSource(JSON.parse(original));
    const existing = JSON.parse(readFileSync(new URL('../local-measurements.json', directory)));
    let maxDeviationMm = 0;
    for (const previous of existing.measurements) {
      const current = model.records.find(part => part.index === previous.ancestry[0].index);
      assert.ok(current);
      for (const key of ['minMm', 'maxMm', 'sizeMm']) previous[key].forEach((value, axis) => {maxDeviationMm = Math.max(maxDeviationMm, Math.abs(value - current[key][axis]));});
    }
    assert.ok(maxDeviationMm < 0.0001, `World bounds changed by ${maxDeviationMm} mm`);
    writeFileSync(new URL('geometry.bin', directory), binary);
    writeFileSync(new URL('model.json', directory), JSON.stringify(model));
    await bundleViewer();
    assert.equal(hash(readFileSync(path)), expectedHash);
    protectedNames.forEach(name => assert.equal(hash(readFileSync(new URL('../' + name, directory))), protectedHashes[name]));
    const verification = {counts: model.counts, groups: model.groups, sourceSha256: expectedHash, sourceBytes: original.length, protectedHashes, sourceUnchangedAfterBuild: true, priorOccurrencesCompared: existing.measurements.length, maxDeviationMm, priorLoaderComparisonToleranceMm: 0.0001, comparisonNote: 'Prior GLTFLoader decomposes matrices using applyMatrix4; this derivative keeps raw source matrices', triangleCountsAndMeshLocalBoundsPreserved: true, generatedFiles: ['index.html', 'viewer.js', 'model.json', 'geometry.bin']};
    writeFileSync(new URL('build-verification.json', directory), JSON.stringify(verification, null, 2));
    console.log(JSON.stringify(verification, null, 2));
  }
}