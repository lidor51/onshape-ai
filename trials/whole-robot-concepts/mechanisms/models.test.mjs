import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {buildRobot,recipes,poses} from './models.mjs';

test('ten mechanism recipes create finite, recognizable solids in every selected pose',()=>{
  assert.equal(recipes.length,10);
  for(const recipe of recipes)for(const pose of poses){
    const model=buildRobot(recipe.id,pose);let meshes=0;let rollers=0;let plates=0;
    model.traverse(object=>{
      if(!object.isMesh)return;meshes++;
      if(object.geometry.type==='CylinderGeometry')rollers++;
      if(object.geometry.type==='ExtrudeGeometry')plates++;
      const values=object.geometry.attributes.position.array;
      assert.ok(values.every(Number.isFinite),`${recipe.id} ${pose} ${object.name}: finite vertices`);
    });
    const bounds=new THREE.Box3().setFromObject(model);
    assert.ok(meshes>50&&rollers>10&&plates>=4,`${recipe.id} recognizable working primitives`);
    assert.ok(bounds.max.z<3500&&bounds.min.z>-600,`${recipe.id} gross drawing bounds only`);
    assert.equal(model.userData.kinematicsProven,false);
    model.traverse(object=>object.geometry?.dispose());
  }
});