import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {partMatrix} from './checkpoint-motion.mjs';

const settings={pickup:{pivot_yz:[110,265],rollers:[{id:'middle',yz:[-136,262]}]}};
const part={motion:'fold',matrix:[[1,0,0,0],[0,1,0,-140],[0,0,1,34],[0,0,0,1]]};
test('viewer keeps CAD millimeters and uses the source-defined fold pivot',()=>{
  const point=new THREE.Vector3().applyMatrix4(partMatrix(part,settings,-123));
  const radians=-123*Math.PI/180;
  assert.ok(Math.abs(point.y-(110-250*Math.cos(radians)+231*Math.sin(radians)))<1e-9);
  assert.ok(Math.abs(point.z-(265-250*Math.sin(radians)-231*Math.cos(radians)))<1e-9);
  assert.equal(partMatrix({...part,motion:'fixed'},settings,-123).elements[13],-140);
});
test('floating motion and input gear ratio are explicit, rigid and not independent snapshots',()=>{
  assert.ok(Math.abs(partMatrix({...part,motion:'float'},settings,-60,-8).determinant()-1)<1e-12);
  const gear={...part,motion:'fold_input',input_ratio:-5,input_center_yz:[155.72,265]};
  assert.ok(Math.abs(partMatrix(gear,settings,-20).determinant()-1)<1e-12);
});