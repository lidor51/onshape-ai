import test from 'node:test';
import assert from 'node:assert/strict';
import {translationPose,circleBoxClearance,wallRetractionForce} from './deployment_path.mjs';

test('linkage Jacobian agrees with finite differences and wall force favors retraction',()=>{
  for(const angle of [0,20,40,78]){const pose=translationPose(angle),delta=1e-5,other=translationPose(angle+delta);assert.ok(Math.abs((other.dy-pose.dy)/(delta*Math.PI/180)-pose.inwardJacobianMm)<0.001);assert.ok(pose.inwardJacobianMm>0);assert.ok(pose.upJacobianMm>0);}
  assert.equal(translationPose(0).dy,0);assert.equal(translationPose(0).dz,0);
});
test('roller checks include bumper corner distance and penetration',()=>{
  const bumper={min:[-85,45],max:[0,165]};assert.ok(circleBoxClearance([-100,180],25,bumper)<0);assert.ok(circleBoxClearance([-120,210],25,bumper)>0);assert.ok(circleBoxClearance([-40,100],25,bumper)<-25);
});

test('positive wall work does not waive poor deployed mechanical advantage',()=>{
  const result=wallRetractionForce(0,7.6);assert.ok(result.inwardJacobianMm>0);
  assert.ok(Math.abs(result.frontalForceForGravityN-7.6*9.80665*50)<1e-8);
  assert.ok(result.frontalForceForGravityN>3700);assert.equal(result.impactSurvival,false);
  assert.equal(wallRetractionForce(0,7.6,{horizontal:500,vertical:0}).frontalForceForGravityN,null);
});