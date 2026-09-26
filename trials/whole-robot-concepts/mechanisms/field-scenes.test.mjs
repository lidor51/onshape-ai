import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import game from '../game.json' with {type:'json'};
import {buildRobot,recipes,poses} from './models.mjs';
import {buildFieldScene} from './field-scenes.mjs';

function near(actual,expected,message) {
  assert.ok(Math.abs(actual-expected)<0.002,`${message}: ${actual} vs ${expected}`);
}

function bounds(object) {
  object.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(object,true);
}

function dispose(...roots) {
  for(const root of roots)root.traverse(object=>object.geometry?.dispose());
}

function objectsWithRole(root,role) {
  const result=[];root.traverse(object=>{if(object.userData.role===role)result.push(object);});return result;
}

function snapshot(model) {
  const result=[];
  model.traverse(object=>result.push({uuid:object.uuid,position:object.position.toArray(),quaternion:object.quaternion.toArray(),scale:object.scale.toArray(),geometry:object.geometry?.uuid,userData:JSON.stringify(object.userData)}));
  return result;
}

test('all ten robots and seven poses produce finite, bounded field context without mutating robot geometry or poses',()=>{
  assert.equal(recipes.length,10);assert.equal(poses.length,7);
  for(const recipe of recipes)for(const pose of poses){
    const model=buildRobot(recipe.id,pose);const before=snapshot(model);
    const field=buildFieldScene(model,recipe,pose);
    assert.ok(field.isGroup,`${recipe.id} ${pose}`);
    for(const key of ['title','note','source'])assert.ok(typeof field.userData[key]==='string'&&field.userData[key].length>0,`${recipe.id} ${pose}: ${key}`);
    assert.equal(field.userData.provenContact,false);
    assert.match(field.userData.note,/unverified/);
    assert.deepEqual(snapshot(model),before,'robot transforms, hierarchy and geometry preserved');
    field.updateWorldMatrix(true,true);
    let geometries=0;
    field.traverse(object=>{
      assert.ok(object.matrixWorld.elements.every(Number.isFinite),`${recipe.id} ${pose}: finite transforms`);
      if(!object.geometry)return;
      geometries++;
      assert.ok(object.geometry.attributes.position.array.every(Number.isFinite),`${recipe.id} ${pose} ${object.name}: finite vertices`);
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for(const material of materials)assert.equal(material.map,null,'no DOM/canvas textures');
    });
    if(pose==='travel'){
      assert.equal(field.children.length,0);assert.match(field.userData.note,/isolated/);
    }else {
      assert.ok(geometries>0);
      const extent=bounds(field).getSize(new THREE.Vector3());
      assert.ok(extent.x<=1601&&extent.y<=2501&&extent.z<=2601,`${recipe.id} ${pose}: compact context`);
    }
    const expected={stow:'stowGuide',floor:'pickup',station:'fieldSupport',coral:'branch',algae:'provisionalMarker',climb:recipe.climb==='park'?'parkGuide':'cageBody'}[pose];
    if(expected)assert.ok(objectsWithRole(field,expected).length>0,`${recipe.id} ${pose}: appropriate field`);
    if(pose!=='floor')assert.equal(objectsWithRole(field,'loosePiece').length,0);
    if(!['coral','algae'].includes(pose))assert.equal(objectsWithRole(field,'branch').length,0);
    for(const support of objectsWithRole(field,'fieldSupport')){
      const extent=bounds(support);
      assert.ok(extent.max.y<=-600||extent.min.y>=1300,`${recipe.id} ${pose}: support outside footprint`);
    }
    dispose(model,field);
  }
});

test('station opening and slope use official datums in an explicitly cropped approach, on the appropriate side',()=>{
  const reference=game.dimensionsMm.coralStation;
  for(const recipe of recipes){
    const model=buildRobot(recipe.id,'station');const field=buildFieldScene(model,recipe,'station');
    const station=field.getObjectByName('Cropped coral station');
    assert.equal(station.userData.side,['R01','R03','R05','R09'].includes(recipe.id)?'rear':'front');
    assert.equal(station.userData.cropped.shownWidthMm,600);
    assert.equal(station.userData.cropped.fullOpeningWidthMm,reference.openingWidth);
    near(bounds(field.getObjectByName('Opening bottom sill')).max.z,reference.openingBottomHeight,'opening bottom');
    near(bounds(field.getObjectByName('Opening top lintel')).min.z,reference.openingBottomHeight+reference.openingHeight,'opening top');
    const opening=bounds(field.getObjectByName('Cropped opening edges'));
    near(opening.getSize(new THREE.Vector3()).x,600,'cropped opening width');
    near(opening.min.z,reference.openingBottomHeight,'crop bottom');near(opening.max.z,reference.openingBottomHeight+reference.openingHeight,'crop top');
    const chute=field.getObjectByName('Sloped station trough');
    const direction=new THREE.Vector3(0,0,1).applyQuaternion(chute.quaternion);
    near(THREE.MathUtils.radToDeg(Math.atan2(Math.abs(direction.z),Math.abs(direction.y))),reference.chuteSlopeDegrees,'chute slope');
    dispose(model,field);
  }
});

test('reef meshes preserve highest-point datums, branch angle, real pipe spacing and honest bumper stand-off',()=>{
  const reference=game.dimensionsMm.reef;
  for(const recipe of recipes){
    const model=buildRobot(recipe.id,'coral');const field=buildFieldScene(model,recipe,'coral');
    const reef=field.getObjectByName('Reef face section');
    assert.equal(field.userData.title,'Reef approach');
    assert.equal(reef.userData.side,recipe.id==='R09'?'rear':'front');
    assert.ok(reef.userData.approx.baseProfile&&reef.userData.approx.branchLengthMm);
    near(bounds(field.getObjectByName('L1 front trough edge')).max.z,reference.L1.height,'L1 top/front edge');
    const pipes=[];field.traverse(object=>{if(object.name==='Vertical reef pipe')pipes.push(object);});
    near(Math.abs(pipes[0].position.x-pipes[1].position.x),reference.pipePairSpacing,'vertical pipe pair spacing');
    const nominalAcross=model.getObjectByName('Nominal coral').getWorldPosition(new THREE.Vector3()).x;
    const branchAcross=field.getObjectByName('L4 branch 1').getWorldPosition(new THREE.Vector3()).x;
    const otherAcross=field.getObjectByName('L4 branch 2').getWorldPosition(new THREE.Vector3()).x;
    near(Math.min(Math.abs(nominalAcross-branchAcross),Math.abs(nominalAcross-otherAcross)),0,'horizontal alignment only');
    for(const branch of objectsWithRole(field,'branch')){
      const extent=bounds(branch);const level=branch.userData.level;
      near(extent.max.z,reference[level].height,`${level} highest mesh point`);
      assert.ok(reef.userData.side==='front'?extent.max.y<-85:extent.min.y>845,'branch remains outside bumper');
      if(level!=='L4'){
        const axis=new THREE.Vector3(0,1,0).applyQuaternion(branch.quaternion);
        near(THREE.MathUtils.radToDeg(Math.atan2(axis.z,Math.abs(axis.y))),reference[level].branchUpAngleDegrees,`${level} upward angle`);
      }
    }
    dispose(model,field);
  }
});

test('floor context suppresses existing nominal pieces and puts new loose coral on the carpet',()=>{
  for(const recipe of recipes){
    const model=buildRobot(recipe.id,'floor');const field=buildFieldScene(model,recipe,'floor');
    for(const kind of ['coral','algae']){
      const existing=model.getObjectByName(`Nominal ${kind}`);
      const added=objectsWithRole(field,'loosePiece').filter(object=>object.userData.piece===kind);
      assert.equal(added.length,existing?0:1,`${recipe.id}: no duplicate ${kind}`);
      for(const piece of added)near(bounds(piece).min.z,0,`${kind} rests on ideal carpet`);
    }
    if(recipe.id==='R09')assert.ok(bounds(field.getObjectByName('Loose floor coral')).min.y>845,'R09 rear pickup');
    dispose(model,field);
  }
  const model=new THREE.Group();const recipe=recipes[0];const field=buildFieldScene(model,recipe,'floor');
  const algae=field.getObjectByName('Loose floor algae');
  near(bounds(algae).min.z,0,'loose algae ideal carpet datum');
  near(bounds(algae).getSize(new THREE.Vector3()).z,game.dimensionsMm.algae.diameter,'nominal loose algae diameter');
  dispose(model,field);
});

test('algae removal uses a different-tint wire marker and never promotes unknown official center heights',()=>{
  assert.equal(game.dimensionsMm.reef.algaeLow.centerHeight,null);
  assert.equal(game.dimensionsMm.reef.algaeHigh.centerHeight,null);
  for(const recipe of recipes){
    const model=buildRobot(recipe.id,'algae');const field=buildFieldScene(model,recipe,'algae');
    const marker=field.getObjectByName('Provisional reef algae marker');
    assert.ok(marker.isLineSegments);assert.equal(marker.userData.isScoringPiece,false);
    assert.equal(marker.userData.officialCenterHeightMm,null);
    assert.equal(marker.userData.band,recipe.algae==='shortArm'?'low':'high');
    assert.equal(marker.userData.approx.centerHeightMm,recipe.algae==='shortArm'?1000:1500);
    assert.notEqual(marker.material.color.getHex(),model.getObjectByName('Nominal algae').material.color.getHex());
    assert.match(field.userData.note,/provisional/);assert.match(field.userData.note,/unknown/);
    assert.equal(field.getObjectByName('Reef face section').userData.side,'front');
    dispose(model,field);
  }
});

test('cages use the actual bottom, width and height with sloping bars, never computed hook positions',()=>{
  const reference=game.dimensionsMm.cage;
  for(const recipe of recipes){
    const model=buildRobot(recipe.id,'climb');const field=buildFieldScene(model,recipe,'climb');
    const cages=objectsWithRole(field,'cageBody');
    if(recipe.climb==='park')assert.equal(cages.length,0);
    else {
      assert.equal(cages.length,1);const body=cages[0];const extent=bounds(body);
      const bottom=recipe.climb==='deep'?reference.deepBottomHeight:reference.shallowBottomHeight;
      near(extent.min.z,bottom,'actual suspended cage bottom');
      near(extent.max.z,bottom+reference.bodyHeight,'actual cage top, not a hook target');
      near(extent.getSize(new THREE.Vector3()).x,reference.outsideWidth,'cage outer width');
      assert.equal(body.userData.official.hookTargetHeightMm,null);
      assert.ok(body.userData.approx.depthMm);assert.ok(extent.min.y>=1300);
      const bars=body.children.filter(object=>object.name==='Sloping cage bar');
      assert.equal(bars.length,4);
      for(const bar of bars){
        const axis=new THREE.Vector3(0,1,0).applyQuaternion(bar.quaternion);
        assert.ok(Math.abs(axis.z)>0.9&&Math.abs(axis.x)>0.01&&Math.abs(axis.y)>0.01,'cage bar visibly slopes');
      }
      const hooks=[];model.traverse(object=>{if(object.name==='Cage hook')hooks.push(object);});
      assert.ok(hooks.every(hook=>bounds(hook).max.y<extent.min.y),'visible hook approach gap');
      assert.match(field.userData.note,/gap/);
    }
    field.traverse(object=>assert.doesNotMatch(object.name,/anchor|rope/i));
    dispose(model,field);
  }
});

test('changing robot Y or Z cannot drag reef, station or cage datums into contact',()=>{
  for(const id of ['R01','R05','R09'])for(const pose of ['coral','station','climb']){
    const recipe=recipes.find(item=>item.id===id);const model=buildRobot(id,pose);
    const original=buildFieldScene(model,recipe,pose);const originalBounds=bounds(original);
    model.position.y+=200;model.position.z+=333;
    const changed=buildFieldScene(model,recipe,pose);const changedBounds=bounds(changed);
    assert.deepEqual(changedBounds,originalBounds,`${id} ${pose}: fixed field, no fake contact`);
    dispose(model,original,changed);
  }
});

test('stow context is edges only with sourced height and explicitly model-derived footprint',()=>{
  const recipe=recipes[0];const model=buildRobot(recipe.id,'stow');const field=buildFieldScene(model,recipe,'stow');
  field.traverse(object=>assert.ok(!object.isMesh,'no opaque bounds box'));
  near(bounds(field).max.z,game.constraints.startingHeightMaximumMm,'starting height maximum');
  const guide=objectsWithRole(field,'stowGuide')[0];
  assert.match(guide.userData.approx.footprint,/not a verified/);
  near(guide.userData.approx.widthMm,700,'chassis rail width');near(guide.userData.approx.lengthMm,760,'chassis rail length');
  dispose(model,field);
});