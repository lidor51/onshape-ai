import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {fitCircle,boreLoops} from './source-bores.mjs';

test('circle fit resolves translated sampled loops without interpreting straight edges as circles',()=>{
  const points=Array.from({length:64},(_,index)=>[52+11*Math.cos(index*Math.PI/32),227+11*Math.sin(index*Math.PI/32)]);
  const circle=fitCircle(points);assert.ok(Math.hypot(circle.center[0]-52,circle.center[1]-227)<1e-9);assert.ok(Math.abs(circle.radius-11)<1e-9);assert.ok(circle.maximumResidual<1e-9);
  assert.equal(fitCircle(Array.from({length:10},(_,index)=>[index,index*2])),undefined);
});
test('actual extruded mesh bore edges provide independent hole-center observations',()=>{
  const outline=new THREE.Shape();outline.moveTo(-40,-40);outline.lineTo(40,-40);outline.lineTo(40,40);outline.lineTo(-40,40);outline.closePath();
  const hole=new THREE.Path();hole.absarc(8,5,10,0,Math.PI*2,true);outline.holes.push(hole);
  const geometry=new THREE.ExtrudeGeometry(outline,{depth:6,bevelEnabled:false,curveSegments:32});geometry.rotateY(Math.PI/2).scale(0.001,0.001,0.001);
  const mesh=new THREE.Mesh(geometry);const group=new THREE.Group();group.add(mesh);const circles=boreLoops(group);
  assert.equal(circles.length,2);for(const circle of circles){assert.ok(Math.abs(circle.radius-10)<0.001);assert.ok(Math.hypot(circle.center[0]-5,circle.center[1]+8)<0.001);}
});