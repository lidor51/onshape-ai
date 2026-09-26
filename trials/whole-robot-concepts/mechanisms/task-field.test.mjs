import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import targets from './field-targets.json' with {type:'json'};
import {phases,solveTask,targetForTask} from './interaction-solver.mjs';
import {robotCatalogue,taskLabels,tasksForRobot} from './task-contract.mjs';
import {buildTaskField} from './task-field.mjs';

const legacy=new Set(['stow','climb','park']);
const vector=point=>new THREE.Vector3(...point);
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<0.002,`${message}: ${actual} vs ${expected}`);

function bounds(object){object.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(object,true);}
function dispose(root){root.traverse(object=>object.geometry?.dispose());}
function role(root,name){const matches=[];root.traverse(object=>{if(object.userData.role===name)matches.push(object);});return matches;}
function fixedSnapshot(root){
  root.updateWorldMatrix(true,true);
  const result=[];
  const visit=object=>{
    if(object.userData.role==='dimension')return;
    result.push({name:object.name,matrix:object.matrixWorld.toArray(),vertices:object.geometry?Array.from(object.geometry.attributes.position.array):null});
    object.children.forEach(visit);
  };
  visit(root);return result;
}
function opaqueMeshes(root){const meshes=[];root.traverse(object=>{if(object.isMesh&&!object.material.transparent)meshes.push(object);});return meshes;}
function rayHits(root,from,direction,distance=1000){
  root.updateWorldMatrix(true,true);
  return new THREE.Raycaster(vector(from),vector(direction).normalize(),0,distance).intersectObjects(opaqueMeshes(root),false);
}

test('all supported nonlegacy tasks across ten robots and three phases have finite, isolated fixed geometry and no extra pieces',()=>{
  assert.equal(robotCatalogue.length,10);const seen=new Set();
  const allowed={reef:new Set(['branch','fieldSupport']),trough:new Set(['troughContact','troughEdge','fieldSupport']),station:new Set(['apertureFrame','chuteContact','feedAxis']),processor:new Set(['apertureFrame']),net:new Set(['netRim','netPanel','netEndFrame','netMesh']), 'reef-algae':new Set(['branch','fieldSupport']),floor:new Set(['floorContact'])};
  for(const robot of robotCatalogue)for(const task of tasksForRobot(robot.id).filter(task=>!legacy.has(task))){
    seen.add(task);let first;
    for(const phase of phases){
      const solution=solveTask(robot.id,task,phase);const before=JSON.stringify(solution);const field=buildTaskField(solution);
      assert.ok(field.isGroup);assert.equal(JSON.stringify(solution),before,'solution is not mutated');
      assert.deepEqual(field.position.toArray(),[0,0,0]);assert.deepEqual(field.quaternion.toArray(),[0,0,0,1]);assert.deepEqual(field.scale.toArray(),[1,1,1]);
      assert.equal(field.userData.fieldFixed,true);assert.equal(field.userData.field,solution.target.field);assert.equal(field.userData.contactProven,false);
      assert.strictEqual(field.userData.assumptions,solution.target.assumptions);
      const context=role(field,'taskInterface')[0];assert.match(context.userData.source,/geometry standard; not native CAD/);assert.ok(context.userData.caveats.length);
      assert.ok(context.children.length>0);
      for(const object of context.children)assert.ok(allowed[solution.target.field].has(object.userData.role),`${task}: relevant interface only: ${object.name}`);
      field.updateWorldMatrix(true,true);
      field.traverse(object=>{
        assert.ok(object.matrixWorld.elements.every(Number.isFinite));assert.ok(!object.isSprite,'no DOM labels');
        if(!object.geometry)return;
        assert.ok(object.geometry.attributes.position.array.every(Number.isFinite),`${robot.id} ${task} ${phase}: ${object.name}`);
        assert.equal(object.material.map,null,'no DOM/canvas textures');
        if(object.isMesh){
          assert.ok(['BoxGeometry','CylinderGeometry'].includes(object.geometry.type),'no duplicate ball, coral or piece path');
          const data=object.geometry.parameters;
          if(object.geometry.type==='CylinderGeometry')assert.equal(data.openEnded,false);
          for(const key of object.geometry.type==='BoxGeometry'?['width','height','depth']:['radiusTop','radiusBottom','height'])assert.ok(data[key]>0&&Number.isFinite(data[key]));
        }
      });
      const extent=bounds(context).getSize(new THREE.Vector3());
      assert.ok(extent.x<3600&&extent.y<1100&&extent.z<2600,`${task}: compact task-local context`);
      const snapshot=fixedSnapshot(field);if(first)assert.deepEqual(snapshot,first,`${robot.id} ${task}: phase cannot fit the field to the tool`);else first=snapshot;
      dispose(field);
    }
  }
  assert.deepEqual([...seen].sort(),Object.keys(taskLabels).filter(task=>!legacy.has(task)).sort());
});

test('L2/L3/L4 selected closed branch stays at x=0 with exact axis, tip surface, partner and behind-face supports',()=>{
  for(const level of ['l2','l3','l4']){
    const solution=solveTask('R04',`coral-${level}`);const field=buildTaskField(solution);const data=targets.interfaces[level];
    const branches=role(field,'branch');assert.equal(branches.length,2);
    for(const [index,branch] of branches.entries()){
      assert.equal(branch.userData.level,level);assert.equal(branch.geometry.parameters.openEnded,false);
      near(branch.geometry.parameters.radiusTop,21.082,'physical branch radius');near(branch.geometry.parameters.radiusBottom,21.082,'physical branch radius');
      near(branch.geometry.parameters.height,data.branchLengthHypothesisMm,'fixed exposed length');
      const tip=vector([0,branch.geometry.parameters.height/2,0]).applyMatrix4(branch.matrixWorld);
      branch.updateWorldMatrix(true,false);
      tip.set(0,branch.geometry.parameters.height/2,0).applyMatrix4(branch.matrixWorld);
      const base=vector([0,-branch.geometry.parameters.height/2,0]).applyMatrix4(branch.matrixWorld);
      for(const [coordinate,axis] of ['x','y','z'].entries()){
        near(tip[axis],solution.target.tip[coordinate]+(coordinate===0?index*data.pairSpacingMm:0),'actual tip matches solver');
        near(base[axis],solution.target.branchBase[coordinate]+(coordinate===0?index*data.pairSpacingMm:0),'actual base matches solver');
      }
      near(bounds(branch).max.z,data.tipHeightMm,'highest physical surface, not cylinder center');
      near(branch.userData.tip[0],index*330.2,'selected branch x=0, partner x=330.2');
      const direction=vector([0,1,0]).applyQuaternion(branch.quaternion);
      near(direction.distanceTo(vector(solution.target.axis)),0,'branch axis');
      if(level==='l2')near(tip.z+21.082*Math.cos(THREE.MathUtils.degToRad(35)),809.625,'exact L2 highest-point math');
    }
    for(const support of role(field,'fieldSupport'))assert.ok(bounds(support).max.y<0,'support stays behind y=0');
    assert.equal(role(field,'fieldSupport').length,level==='l4'?4:2,'L4 compound support, no other levels');
    dispose(field);
  }
});

test('R03 and R04 see identical branch points and every task ignores robot XYZ translation except the dimension',()=>{
  for(const task of ['coral-l2','coral-l3','coral-l4']){
    const first=buildTaskField(solveTask('R03',task));const second=buildTaskField(solveTask('R04',task));
    assert.deepEqual(fixedSnapshot(first),fixedSnapshot(second),`${task}: different robot cannot move branch points`);dispose(first);dispose(second);
  }
  for(const robot of robotCatalogue)for(const task of tasksForRobot(robot.id).filter(task=>!legacy.has(task))){
    const solution=solveTask(robot.id,task);const original=buildTaskField(solution);
    const moved={...solution,rootPosition:[solution.rootPosition[0]+317,solution.rootPosition[1]+193,solution.rootPosition[2]+333],standOffMm:solution.standOffMm+193};
    const changed=buildTaskField(moved);
    assert.deepEqual(fixedSnapshot(changed),fixedSnapshot(original),`${robot.id} ${task}: explicitly strip dimension only`);
    assert.deepEqual(bounds(role(changed,'taskInterface')[0]),bounds(role(original,'taskInterface')[0]));
    near(changed.userData.dimension.from[0]-original.userData.dimension.from[0],317,'dimension follows lateral robot edge');
    near(changed.userData.dimension.to[1]-original.userData.dimension.to[1],193,'dimension follows gap');
    assert.equal(changed.userData.dimension.to[2],original.userData.dimension.to[2],'annotation stays on carpet despite robot Z');
    dispose(original);dispose(changed);
  }
});

test('stand-off witnesses measure the signed plane-to-nearest-bumper gap for front, rear, side and shooter approaches',()=>{
  for(const [id,task] of [['R04','coral-l2'],['R09','coral-l2'],['R10','coral-l2'],['R03','net']]){
    const solution=solveTask(id,task);const field=buildTaskField(solution);const dimension=field.userData.dimension;
    const corners=[-435,435].flatMap(across=>[-85,845].map(rearward=>vector([across,rearward,0]).applyAxisAngle(vector([0,0,1]),solution.heading).add(vector(solution.rootPosition))));
    const nearest=Math.min(...corners.map(point=>point.y));
    near(dimension.from[1],0,'world reference plane');near(dimension.to[1],nearest,'actual nearest bumper');
    near(dimension.to[1]-dimension.from[1],solution.standOffMm,'signed gap');assert.equal(dimension.valueMm,solution.standOffMm);assert.equal(dimension.datum,solution.standOffDatum);
    assert.equal(dimension.to[0],dimension.from[0]);assert.equal(dimension.to[2],12);
    const rightEdge=Math.max(...corners.filter(point=>Math.abs(point.y-nearest)<0.001).map(point=>point.x));
    near(dimension.from[0],rightEdge+30,'small offset at nearest bumper edge');
    const annotation=role(field,'dimension')[0];assert.equal(annotation.userData.excludeFromBounds,true);
    annotation.traverse(object=>assert.ok(!object.isMesh,'dimension uses lines, not oversized solid bounds'));
    assert.ok(bounds(annotation).getSize(new THREE.Vector3()).x<=42.002);dispose(field);
  }
  const solution=solveTask('R04','coral-l2');
  for(const gap of [0,-60]){
    const field=buildTaskField({...solution,standOffMm:gap});assert.equal(field.userData.dimension.to[1],gap);assert.equal(field.userData.dimension.valueMm,gap);dispose(field);
  }
});

test('L1 contact floor and front edge share 457.2 mm with the solver piece bottom and assumed 900 x 200 footprint',()=>{
  const solution=solveTask('R04','coral-l1');const field=buildTaskField(solution);
  const floor=bounds(field.getObjectByName('L1 horizontal contact floor'));const edge=bounds(field.getObjectByName('L1 front contact edge'));
  near(floor.max.z,457.2,'contact floor');near(edge.max.z,457.2,'contact edge');near(edge.max.y,0,'face');
  near(floor.min.y,-200,'floor back');near(floor.max.y,0,'floor front');near(floor.min.x,-450,'floor left');near(floor.max.x,450,'floor right');
  near(solution.target.center[2],514.35,'target center');near(solution.target.center[2]-targets.pieces.coral.outsideDiameterMm/2,floor.max.z,'nominal lower contact');
  dispose(field);
});

test('station retains its sourced opening and 55-degree tangent lane without silently claiming whole-pipe clearance',()=>{
  const field=buildTaskField(solveTask('R04','coral-station'));const context=role(field,'taskInterface')[0];const data=targets.interfaces.station;
  const bottom=bounds(field.getObjectByName('Station bottom sill'));const top=bounds(field.getObjectByName('Station top lintel'));
  near(bottom.max.z,952.5,'sill');near(top.min.z,1130.3,'lintel');near(bounds(field.getObjectByName('Station left jamb')).max.x,-965.2,'left opening');near(bounds(field.getObjectByName('Station right jamb')).min.x,965.2,'right opening');
  assert.equal(role(field,'apertureFrame').length,4);
  const {axis,openingPoint,sectionHeightMm,verticalClearanceMm}=context.userData.feed;const expected=targetForTask('coral-station');
  near(vector(axis).distanceTo(vector(expected.feedAxis)),0,'feed matches translation direction');
  near(vector(axis).dot(vector(expected.axis)),0,'crosswise pipe axis differs from feed direction');
  near(openingPoint[2],data.bottomMm+57.15/Math.cos(THREE.MathUtils.degToRad(55)),'same solver opening point');
  const lane=field.getObjectByName('Station sloped feed lane');const direction=vector([0,0,1]).applyQuaternion(lane.quaternion);
  near(direction.distanceTo(vector(axis)),0,'actual chute axis');near(THREE.MathUtils.radToDeg(Math.atan2(-direction.z,direction.y)),55,'actual chute angle');
  const normal=vector(lane.userData.normal);lane.updateWorldMatrix(true,false);
  const surfaceOffset=lane.position.clone().sub(vector(openingPoint)).dot(normal)+lane.geometry.parameters.height/2;
  near(surfaceOffset,-57.15,'guide contact plane tangent to pipe');near(bounds(lane).max.y,0,'chute ends at opening, not inside robot');
  const guideFaceHeight=openingPoint[2]-57.15/normal.z;near(guideFaceHeight,952.5,'guide plane meets bottom edge');
  const start=vector(openingPoint).addScaledVector(vector(axis),-180);
  assert.equal(rayHits(field,start.toArray(),axis,360).length,0,'feed centerline remains unobstructed');
  near(sectionHeightMm,114.3,'crosswise circular section');assert.ok(verticalClearanceMm>0);assert.equal(context.userData.feed.fullBoreClearance,false);
  assert.ok(openingPoint[2]-sectionHeightMm/2>=data.bottomMm);
  assert.ok(openingPoint[2]+sectionHeightMm/2<=data.topMm);
  dispose(field);
});

test('processor is exactly four frame bars around an unobscured 711.2 x 508 aperture at y=0, not an opening-filling plane',()=>{
  const field=buildTaskField(solveTask('R04','processor'));const context=role(field,'taskInterface')[0];
  assert.equal(context.children.length,4);assert.equal(role(field,'apertureFrame').length,4);
  near(bounds(field.getObjectByName('Processor bottom sill')).max.z,177.8,'bottom');near(bounds(field.getObjectByName('Processor top lintel')).min.z,685.8,'top');
  near(bounds(field.getObjectByName('Processor left jamb')).max.x,-355.6,'left');near(bounds(field.getObjectByName('Processor right jamb')).min.x,355.6,'right');
  assert.deepEqual(context.userData.deliveryAxis,[0,-1,0]);
  for(const across of [-354.6,-206.375,0,206.375,354.6])for(const height of [178.8,225.425,431.8,638.175,684.8]){
    assert.equal(rayHits(field,[across,320,height],[0,-1,0],700).length,0,'aperture has no opaque obstruction along delivery');
  }
  for(const bar of context.children)near(bounds(bar).max.y,0,'actual opening plane');
  for(const phase of phases){const solution=solveTask('R04','processor',phase);near(solution.pieceCenter[2],431.8,'fixed ball height');}
  dispose(field);
});

test('net has a fixed near side, long opening, higher transparent end panels and a visible sagging wire basin',()=>{
  const field=buildTaskField(solveTask('R03','net'));const context=role(field,'taskInterface')[0];
  assert.deepEqual(context.userData.opening,{nearY:0,farY:-1000,minX:-1750,maxX:1750,rimMm:2260,endPanelTopMm:2565.146});
  const nearRail=bounds(field.getObjectByName('Net near rim'));const farRail=bounds(field.getObjectByName('Net far rim'));
  near(nearRail.min.y,0,'near inside boundary');near(farRail.max.y,-1000,'far inside boundary');near(nearRail.max.z,2260,'rim, not lowest mesh');near(nearRail.min.x,-1750,'long side left');near(nearRail.max.x,1750,'long side right');
  const panels=role(field,'netPanel');assert.equal(panels.length,4);
  for(const panel of panels){
    assert.equal(panel.material.transparent,true);assert.ok(panel.material.opacity<=0.2);assert.equal(panel.material.depthWrite,false);
    const channels=panel.material.color.toArray();assert.ok(Math.max(...channels)-Math.min(...channels)<0.1,'neutral panels');
    assert.ok(Math.min(...bounds(panel).getSize(new THREE.Vector3()).toArray())<=4.002,'thin panels');
    if(panel.name.includes('end panel'))near(bounds(panel).max.z,2565.146,'higher end panel');
  }
  const wires=role(field,'netMesh');assert.ok(wires.length>=20);const vertices=[];
  for(const wire of wires){
    assert.ok(wire.isLine);const positions=wire.geometry.attributes.position;
    for(let index=0;index<positions.count;index++)vertices.push(vector([positions.getX(index),positions.getY(index),positions.getZ(index)]));
  }
  near(Math.min(...vertices.map(point=>point.z)),1930.4,'lowest mesh');
  const center=vertices.filter(point=>Math.abs(point.x)<0.001&&Math.abs(point.y+500)<0.001);assert.ok(center.length>=2);center.forEach(point=>near(point.z,1930.4,'center lowest'));
  for(const point of vertices)if(Math.abs(point.x)===1750||point.y===0||point.y===-1000)near(point.z,2260,'mesh reaches perimeter');
  for(const across of [-1000,0,1000])assert.equal(rayHits(field,[across,200,2400],[0,-1,0],1400).length,0,'side-entry opening is not a central block');
  assert.equal(rayHits(field,[0,-500,2800],[0,0,-1],900).length,0,'wire basin, no opaque fill');
  assert.ok(!field.getObjectByName('Shot path'),'parent alone owns piece/path');dispose(field);
});

test('low/high algae use fixed 900/1300 hypotheses between x=+/-165.1 branch pairs without an extra ball or unrelated reef levels',()=>{
  for(const [task,level,height] of [['algae-low','l2',900],['algae-high','l3',1300]]){
    const field=buildTaskField(solveTask('R04',task));const context=role(field,'taskInterface')[0];const branches=role(field,'branch');
    assert.deepEqual(context.userData.algaeCenterHypothesisMm,[0,0,height]);assert.equal(branches.length,2);
    for(const [index,branch] of branches.entries()){
      assert.equal(branch.userData.level,level);near(branch.userData.tip[0],index===0?-165.1:165.1,'flank ball center');
      near(branch.userData.tip[1],targetForTask(`coral-${level}`).tip[1],'fixed inset');near(bounds(branch).max.z,targets.interfaces[level].tipHeightMm,'fixed branch datum, not ball-adjusted');
    }
    assert.ok(bounds(context).max.z<height,'only relevant half-height branch section');
    assert.equal(context.children.length,4,'two branches and supports only');dispose(field);
  }
});

test('floor tasks provide only a small light patch at z=0 and leave the single piece to the parent',()=>{
  for(const task of ['coral-floor','algae-floor']){
    const field=buildTaskField(solveTask('R01',task));const context=role(field,'taskInterface')[0];assert.equal(context.children.length,1);
    const patch=context.children[0];assert.equal(patch.userData.role,'floorContact');const extent=bounds(patch);
    near(extent.max.z,0,'carpet contact');assert.ok(extent.getSize(new THREE.Vector3()).x<=900);assert.ok(extent.getSize(new THREE.Vector3()).y<=700);
    assert.ok(patch.material.color.toArray().every(channel=>channel>0.7),'light neutral floor');dispose(field);
  }
});