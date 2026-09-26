import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';

export function systemTransform(part,angle=0,floating=0){
  const pose=new THREE.Matrix4().set(...part.matrix.flat());
  if(part.motion==='float')pose.premultiply(around([0,-136,262],floating));
  const radians=angle*Math.PI/180;
  if(['pickup_translate','float'].includes(part.motion))pose.premultiply(new THREE.Matrix4().makeTranslation(0,500*(1-Math.cos(radians))+10*Math.sin(radians),500*Math.sin(radians)+10*(Math.cos(radians)-1)));
  if(part.motion==='link')pose.premultiply(around(part.center,-angle));
  return pose;
}
export function around(center,degrees){return new THREE.Matrix4().makeTranslation(...center).multiply(new THREE.Matrix4().makeRotationX(degrees*Math.PI/180)).multiply(new THREE.Matrix4().makeTranslation(...center.map(value=>-value)));}

export function systemGroup(part){
  if(part.id.startsWith('v1_'))return part.original_module==='indexer'?'indexer':'dock';
  if(part.id.startsWith('v2_'))return 'pickup';
  if(part.id.startsWith('pickup_pickup_')||part.id.startsWith('deployment_deployment_'))return 'drives';
  return 'mounts';
}