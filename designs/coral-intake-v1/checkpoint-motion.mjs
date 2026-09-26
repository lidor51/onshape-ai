import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';

export function rotationAt(center,degrees){
  const forward=new THREE.Matrix4().makeTranslation(...center);
  return forward.multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(degrees))).multiply(new THREE.Matrix4().makeTranslation(...center.map(value=>-value)));
}

export function partMatrix(part,settings,fold=0,floating=0){
  const result=new THREE.Matrix4().set(...part.matrix.flat());
  if(part.motion==='float'){
    const middle=settings.pickup.rollers.find(roller=>roller.id==='middle').yz;
    result.premultiply(rotationAt([0,...middle],floating));
  }
  if(['float','fold'].includes(part.motion))result.premultiply(rotationAt([0,...settings.pickup.pivot_yz],fold));
  if(part.motion==='fold_input')result.premultiply(rotationAt([0,...part.input_center_yz],fold*part.input_ratio));
  return result;
}