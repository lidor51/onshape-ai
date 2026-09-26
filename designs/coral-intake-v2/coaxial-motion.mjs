import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';

export function rotationAbout(center, degrees) {
  return new THREE.Matrix4().makeTranslation(...center)
    .multiply(new THREE.Matrix4().makeRotationX(degrees * Math.PI / 180))
    .multiply(new THREE.Matrix4().makeTranslation(...center.map(value => -value)));
}

export function coaxialTransform(part, motion, angle = 0, floating = 0) {
  const pose = new THREE.Matrix4().set(...part.matrix.flat());
  if (part.motion === 'float') pose.premultiply(rotationAbout(motion.float_pivot, floating));
  if (['fold', 'float'].includes(part.motion)) pose.premultiply(rotationAbout(motion.pivot, angle));
  return pose;
}

export function groupOf(part) {
  if (part.id.startsWith('pt_indexer_')) return 'indexer';
  if (part.id.startsWith('pt_frame_root_') || part.id.startsWith('pt_chain_passage_')) return 'mounts';
  if (part.id.startsWith('pt_')) return 'drives';
  if (part.id.startsWith('v1_')) return part.original_module === 'indexer' ? 'indexer' : 'cradle';
  if (part.id.startsWith('v2_')) return 'pickup';
  if (part.id.startsWith('pickup_') || part.id.startsWith('deployment_')) return 'drives';
  return 'mounts';
}