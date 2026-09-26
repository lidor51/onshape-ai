import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {buildInteraction} from './interaction-scenes.mjs';
import {robotCatalogue,tasksForRobot} from './task-contract.mjs';

function dispose(root){root.traverse(object=>object.geometry?.dispose());}

test('every declared task renders one actual piece and geometry connected to the solved wrist',()=>{
  for(const robot of robotCatalogue)for(const task of tasksForRobot(robot.id)){
    const {model,field,solution}=buildInteraction(robot.id,task);if(solution.legacy){dispose(model);dispose(field);continue;}
    const pieces=[];model.traverse(object=>{if(object.userData.role==='gamePiece')pieces.push(object);if(object.isMesh)assert.ok(object.geometry.attributes.position.array.every(Number.isFinite));});
    assert.equal(pieces.length,1,`${robot.id}/${task}: single actual piece`);
    assert.ok(pieces[0].getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3(...solution.pieceCenter))<1e-6);
    if(!solution.shooter){assert.ok(solution.meshToolPositionErrorMm<1e-6,`${robot.id}/${task}: tool position`);assert.ok(solution.meshMountErrorMm<1e-6,`${robot.id}/${task}: physical wrist attachment`);}
    dispose(model);dispose(field);
  }
});

test('L4 engage and release keep the same placed coral while the robot tool withdraws',()=>{
  const engage=buildInteraction('R03','coral-l4','engage');const release=buildInteraction('R03','coral-l4','release');
  assert.deepEqual(engage.solution.pieceCenter,release.solution.pieceCenter);
  assert.notDeepEqual(engage.solution.toolCenter,release.solution.toolCenter);
  for(const scene of [engage,release]){dispose(scene.model);dispose(scene.field);}
});

test('floor contact tools stay above carpet and processor hardware stays behind its aperture',()=>{
  for(const task of ['coral-floor','algae-floor','processor']){
    const scene=buildInteraction('R04',task);scene.model.updateWorldMatrix(true,true);
    let tool;scene.model.traverse(object=>{if(object.userData.role==='contactTool')tool=object;});
    const bounds=new THREE.Box3().setFromObject(tool);assert.ok(bounds.min.z>=0,`${task}: tool below carpet`);
    if(task==='processor')assert.ok(bounds.min.y>0,'processor tool remains robot-side of opening');
    dispose(scene.model);dispose(scene.field);
  }
});