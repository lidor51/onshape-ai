import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {systemTransform,systemGroup} from './system-motion.mjs';

const identity=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
test('link front pivot and translating pickup coincide throughout the proposed motion',()=>{
  for(const angle of [0,20,40,78]){
    const front=new THREE.Vector3(292,-300,195);
    const link=front.clone().applyMatrix4(systemTransform({matrix:identity,motion:'link',center:[292,200,185]},angle));
    const pickup=front.clone().applyMatrix4(systemTransform({matrix:identity,motion:'pickup_translate'},angle));
    assert.ok(link.distanceTo(pickup)<1e-8);
  }
});
test('fixed indexer and retained drive parts remain fixed and distinctly grouped',()=>{
  assert.deepEqual(systemTransform({matrix:identity,motion:'fixed'},78).elements,new THREE.Matrix4().elements);
  assert.equal(systemGroup({id:'v1_indexer_drive_L_X44',original_module:'indexer'}),'indexer');
  assert.equal(systemGroup({id:'pickup_pickup_drive_X44'}),'drives');
});