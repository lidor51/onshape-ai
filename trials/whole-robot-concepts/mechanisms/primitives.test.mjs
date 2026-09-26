import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {beam,roller,sidePlate} from './primitives.mjs';

test('mechanism primitives have physical depth and explicit rollers, not tool boxes',()=>{
  const assembly=new THREE.Group();
  beam(assembly,'Rail',[0,0,100],[0,0,900],25,50,0x888888);
  roller(assembly,'Pickup',[0,-200,100],450,50,0xaaaa55,true);
  sidePlate(assembly,'Left cheek',-245,[[-300,50],[-100,50],[-80,180],[-270,160]],8);
  assembly.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(assembly);
  assert.ok(bounds.max.z>=900);
  assert.ok(assembly.children.filter(mesh=>mesh.name.includes('compliant wheel')).length>=3);
  assert.equal(assembly.getObjectByName('Left cheek').geometry.type,'ExtrudeGeometry');
  assert.throws(()=>beam(assembly,'Invalid',[0,0,0],[0,0,0],20,20,0),/zero-length/);
});