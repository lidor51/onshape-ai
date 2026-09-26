import test from 'node:test';
import assert from 'node:assert/strict';
import {subsetGltf} from './extract-local-1778.mjs';

test('subsetting preserves native transforms and accessor bytes while excluding other groups',()=>{
  const bytes=Buffer.from(new Float32Array([1,2,3]).buffer);
  const source={asset:{version:'2.0'},nodes:[{children:[1,2]},{name:'Intake',children:[3],translation:[0,1,0]},{name:'Other'},{name:'Wheel',mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],accessors:[{bufferView:0,componentType:5126,count:1,type:'VEC3'}],bufferViews:[{buffer:0,byteOffset:0,byteLength:12}],buffers:[{uri:'data:application/octet-stream;base64,'+bytes.toString('base64')}]};
  const subset=subsetGltf(source,[1]);assert.equal(subset.nodes.length,3);assert.deepEqual(subset.nodes[1].translation,[0,1,0]);assert.deepEqual(subset.nodes[1].children,[2]);assert.equal(subset.nodes[2].extras.sourceNodeIndex,3);
  assert.deepEqual(Buffer.from(subset.buffers[0].uri.split(',')[1],'base64'),bytes);
});