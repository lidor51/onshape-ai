import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {contentBounds} from './scene-bounds.mjs';

test('camera framing includes visible field context but ignores hidden context',()=>{
  const robot=new THREE.Mesh(new THREE.BoxGeometry(700,760,1000));
  const field=new THREE.Mesh(new THREE.BoxGeometry(500,500,1200));field.position.set(0,-1300,600);
  assert.equal(contentBounds(robot,field).min.y,-1550);
  field.visible=false;
  assert.equal(contentBounds(robot,field).min.y,-380);
  assert.equal(contentBounds(robot).max.z,500);
});