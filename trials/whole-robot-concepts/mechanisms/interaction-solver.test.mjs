import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {solveTask,targetForTask,taskSummary,ballisticShot,phases} from './interaction-solver.mjs';
import {robotCatalogue,tasksForRobot} from './task-contract.mjs';

test('supported tasks have finite configurations and never elevate the chassis to force reach',()=>{
  for(const robot of robotCatalogue)for(const task of tasksForRobot(robot.id))for(const phase of phases){
    const solution=solveTask(robot.id,task,phase);if(solution.legacy)continue;
    assert.ok(solution.rootPosition.every(Number.isFinite),`${robot.id}/${task}`);assert.equal(solution.rootPosition[2],0);
    assert.ok(solution.joints.every(joint=>Number.isFinite(joint.value)));
    if(solution.reachable){assert.ok(solution.positionErrorMm<1e-6);if(solution.workingExtensionMm!==undefined)assert.ok(solution.workingExtensionMm<=457.2+1e-6);}
  }
});

test('the same L4 task gives different fixed-field configurations and stand-off for different mechanisms',()=>{
  const elevator=solveTask('R03','coral-l4');const arm=solveTask('R04','coral-l4');
  assert.deepEqual(elevator.target,arm.target);assert.notEqual(elevator.standOffMm,arm.standOffMm);
  assert.ok(elevator.joints.some(joint=>joint.name==='Carriage height'));
  assert.ok(arm.joints.some(joint=>joint.name==='Boom length'));
  assert.ok(elevator.reachable&&arm.reachable);
});

test('branch delivery is coaxial with explicit insertion rather than a nearby pipe',()=>{
  for(const task of ['coral-l2','coral-l3','coral-l4']){
    const target=targetForTask(task);const center=new THREE.Vector3(...target.center);const tip=new THREE.Vector3(...target.tip);const axis=new THREE.Vector3(...target.axis);
    const delta=tip.sub(center);assert.ok(delta.clone().cross(axis).length()<1e-8);
    assert.ok(Math.abs(delta.dot(axis))<301.625/2);assert.ok(target.branchRadius<101.6/2);
    assert.ok(targetForTask(task,'approach').insertionMm<0);
  }
});

test('processor uses the verified opening and net distinguishes launch from placement',()=>{
  assert.equal(targetForTask('processor').center[2],431.8);
  assert.ok(431.8-206.375>=177.8&&431.8+206.375<=685.8);
  assert.equal(solveTask('R03','net').shooter,true);assert.equal(solveTask('R02','net').shooter,undefined);
  for(const id of ['R03','R09'])assert.ok(solveTask(id,'net').shot.nearRailClearanceMm>=20);
  const landed=solveTask('R03','net','release');assert.ok(Math.abs(landed.pieceCenter[2]-206.375-1930.4)<1e-6);assert.ok(Math.abs(landed.pieceCenter[1]+500)<1e-6);
  const shot=ballisticShot(1600,860,2526.375);assert.ok(Math.abs(shot.points.at(-1)[2]-2526.375)<1e-6);
});

test('capability filtering and explicit reach failures remain intact',()=>{
  assert.throws(()=>solveTask('R03','coral-floor'),/does not support/);
  assert.throws(()=>solveTask('R08','coral-l4'),/does not support/);
  assert.equal(taskSummary().length,10);
});