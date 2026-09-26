import * as THREE from 'three';
import {box,beam,axle,roller,sidePlate,solid,palette} from './primitives.mjs';
import {frame,shooter,buildRobot,recipes} from './models.mjs';
import {buildFieldScene} from './field-scenes.mjs';
import {buildTaskField} from './task-field.mjs';
import {solveTask,solveMechanism,mechanisms} from './interaction-solver.mjs';

function group(parent,name,center=[0,0,0]){const result=new THREE.Group();result.name=name;result.position.set(...center);parent.add(result);return result;}
const vector=value=>new THREE.Vector3(...value);

function hollowCoral(parent,center,axis){
  const piece=group(parent,'Task coral',center);piece.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector(axis));piece.userData={role:'gamePiece',part:'coral',lengthMm:301.625,diameterMm:114.3};
  const surface=new THREE.MeshStandardMaterial({color:0xe8e5d9,side:THREE.DoubleSide,roughness:0.8});
  for(const radius of [57.15,50.8]){const shell=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,301.625,32,1,true),surface);shell.castShadow=true;shell.receiveShadow=true;piece.add(shell);}
  for(const sign of [-1,1]){const rim=new THREE.Mesh(new THREE.RingGeometry(50.8,57.15,32),surface);rim.rotation.x=Math.PI/2;rim.position.y=sign*301.625/2;piece.add(rim);}
  return piece;
}

function coralTool(parent,center,axis,open=false,floor=false){
  const head=group(parent,'Active coral contact tool',center);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector(axis));head.userData={role:'contactTool',axis:[0,1,0],mount:[0,180,0],open};
  for(const across of [-92,92]){
    sidePlate(head,'Coral cheek plate',across,[[-90,floor?0:-110],[195,floor?0:-110],[195,125],[120,125],[105,90],[-90,90]],7,palette.plate);
  }
  for(const rearward of [-55,65]){
    roller(head,'Coral opposing roller',[0,rearward,82.15+(open?55:0)],170,25,palette.coral,true);
    if(!floor)roller(head,'Coral support roller',[0,rearward,-82.15-(open?35:0)],170,25,palette.coral,true);
  }
  axle(head,'Contact tool mounting pin',[-110,180,0],[110,180,0],14);
  return head;
}

function algaeTool(parent,center,axis,open=false,floor=false){
  const head=group(parent,'Active algae contact tool',center);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector(axis));head.userData={role:'contactTool',mount:[0,270,0],open};
  for(const across of [-245,245])sidePlate(head,'Algae roller support',across,[[125,floor?-175:-235],[260,floor?-175:-235],[290,-40],[290,65],[260,235],[125,235]],8,palette.algae);
  const tangentHeight=Math.sqrt(246.375**2-160**2);
  for(const sign of floor?[1]:[-1,1])roller(head,'Opposed algae capture roller',[0,160,sign*(tangentHeight+(open?85:0))],470,40,palette.algae,true);
  roller(head,'Algae backing contact',[0,246.375,0],330,40,palette.rail);
  axle(head,'Algae wrist mounting pin',[-100,270,0],[100,270,0],18);
  return head;
}

function renderMechanism(parent,spec,solution,role){
  const color=role==='coral'?palette.rail:palette.algae;const assembly=group(parent,`${role} ${spec.type}`);assembly.userData={role:'manipulator',type:spec.type,points:solution.points};
  if(spec.type==='pickup'){
    const anchor=solution.points[0];const pivot=solution.points.at(-1);
    for(const across of [-205,205])beam(assembly,'Pickup side link',[across,anchor[1],anchor[2]],[across,pivot[1]-160,pivot[2]+45],20,45,palette.plate);
    axle(assembly,'Pickup pivot',[-240,anchor[1],anchor[2]],[240,anchor[1],anchor[2]],18);
    roller(assembly,'Floor pickup drive',[0,pivot[1]-200,pivot[2]+95],420,45,palette.coral,true);
    return assembly;
  }
  if(spec.type==='lift'){
    const [across,rearward,baseHeight]=spec.base;const carriage=solution.points[1][2];
    const extension=Math.max(0,carriage-850)/2;
    for(let stage=0;stage<3;stage++){
      const span=135-stage*25;const bottom=baseHeight+stage*extension;
      for(const sign of [-1,1])beam(assembly,'Nested lift rail',[across+sign*span,rearward+stage*23,bottom],[across+sign*span,rearward+stage*23,bottom+760],25,30,color);
      for(const up of [bottom+15,bottom+745])beam(assembly,'Stage crossbar',[across-span,rearward+stage*23,up],[across+span,rearward+stage*23,up],20,25,color);
    }
    const start=solution.points[1],end=solution.pivot;
    for(const shift of [-70,70])beam(assembly,'Wrist support member',[start[0]+shift,start[1],start[2]],[end[0]+shift,end[1],end[2]],20,40,palette.plate);
    axle(assembly,'Lift drive shaft',[across-140,rearward,205],[across+140,rearward,205],25);
  }else if(spec.type==='telescope'){
    const start=vector(solution.points[0]);const end=vector(solution.pivot);const length=start.distanceTo(end);const axis=end.clone().sub(start).normalize();
    for(let stage=0;stage<3;stage++){
      const lower=stage*length/3;const upper=Math.min(length,(stage+1)*length/3+85);
      beam(assembly,'Three-stage telescopic boom',start.clone().addScaledVector(axis,lower).toArray(),start.clone().addScaledVector(axis,upper).toArray(),85-stage*20,100-stage*20,color);
    }
  }else{
    for(let index=1;index<solution.points.length;index++)for(const offset of [-50,50]){
      const previous=solution.points[index-1],next=solution.points[index];
      beam(assembly,`Fixed arm segment ${index}`,[previous[0]+offset,previous[1],previous[2]],[next[0]+offset,next[1],next[2]],22,50,color);
    }
  }
  const base=solution.points[0];
  for(const across of [-85,85])beam(assembly,'Chassis anchored support',[base[0]+across,base[1],155],[base[0]+across,base[1],Math.max(160,base[2])],30,40,palette.rail);
  for(const point of solution.points)axle(assembly,'Mechanism pivot shaft',[point[0]-105,point[1],point[2]],[point[0]+105,point[1],point[2]],18);
  return assembly;
}

function passiveHardware(root,recipe,activeRole){
  const other=activeRole==='coral'?'algae':'coral';const spec=recipe[other];
  if(spec.type==='shared'||(activeRole==='algae'&&recipe.algae.type==='shared'))return;
  const state=solveMechanism(spec,other==='coral'?700:650);renderMechanism(root,spec,state,other);
  box(root,`${other} inactive folded tool`,state.pivot,[160,110,80],other==='coral'?palette.coral:palette.algae);
}

function parkedClimb(root,type){
  if(type==='park')return;
  for(const across of [-100,100]){
    beam(root,'Parked climb arm',[across,670,175],[across,630,790],30,40,palette.climb);
    sidePlate(root,'Parked cage hook',across,[[600,750],[710,750],[725,840],[680,860],[675,825],[690,810],[680,780],[600,780]],16,palette.climb);
  }
  axle(root,'Climb winch',[-105,640,230],[105,640,230],30);
}

function guideLine(parent,name,points,color){
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(vector)),new THREE.LineBasicMaterial({color}));line.name=name;parent.add(line);return line;
}

export function buildInteraction(id,task,phase='engage'){
  const solution=solveTask(id,task,phase);const recipe=mechanisms[id];
  if(solution.legacy){
    const model=buildRobot(id,solution.pose);const field=buildFieldScene(model,recipes.find(recipe=>recipe.id===id),solution.pose);
    return {model,field,solution};
  }
  const model=group(new THREE.Group(),`${id} ${task} interaction`);const robot=group(model,'Positioned robot',solution.rootPosition);robot.rotation.z=solution.heading;robot.userData={role:'robot',baseZ:0};
  frame(robot);parkedClimb(robot,recipe.climb);if(recipe.shooter&&!solution.shooter)shooter(robot,70);
  if(solution.shooter){
    passiveHardware(robot,recipe,'algae');const neutral=solveMechanism(recipe.algae,700);renderMechanism(robot,recipe.algae,neutral,'algae');
    const launch=vector(solution.shot.worldPath[0]).sub(vector(solution.rootPosition));const angle=THREE.MathUtils.degToRad(65);
    for(const [radius,sign] of [[90,1],[40,-1]]){
      const center=launch.clone().add(new THREE.Vector3(0,Math.sin(angle),Math.cos(angle)).multiplyScalar(sign*(206.375+radius)));
      roller(robot,'Fixed-angle launch contact',center.toArray(),460,radius,palette.coral,true);
      for(const across of [-250,250])beam(robot,'Shooter support',[launch.x+across,250,160],[launch.x+across,center.y,center.z],25,35,palette.rail);
    }
    guideLine(model,'Calculated ideal launch arc',solution.shot.worldPath,palette.algae);
    const center=solution.pieceCenter;solid(model,'Single task algae',new THREE.SphereGeometry(206.375,32,20),palette.ball,center).userData={role:'gamePiece',part:'algae'};
  }else{
    passiveHardware(robot,recipe,solution.role);renderMechanism(robot,solution.spec,solution.mechanism,solution.role);
    if(solution.spec.type==='pickup')renderMechanism(robot,recipe.coral,solveMechanism(recipe.coral,700),'coral');
    const rootRotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),solution.heading);const inverse=rootRotation.clone().invert();
    const localAxis=vector(solution.role==='coral'?solution.pieceAxis:[0,1,0]).applyQuaternion(inverse).toArray();
    const head=solution.role==='coral'?coralTool(robot,solution.localToolCenter,localAxis,solution.target.release,task==='coral-floor'):algaeTool(robot,solution.localToolCenter,localAxis,solution.target.release,task==='algae-floor');
    robot.updateWorldMatrix(true,true);
    const actualTool=head.getWorldPosition(new THREE.Vector3());
    const mount=head.localToWorld(vector(head.userData.mount));const actualPivot=robot.localToWorld(vector(solution.mechanism.pivot));
    solution.meshToolPositionErrorMm=actualTool.distanceTo(vector(solution.toolCenter??solution.pieceCenter));
    solution.meshMountErrorMm=mount.distanceTo(actualPivot);
    if(solution.role==='coral')hollowCoral(model,solution.pieceCenter,solution.pieceAxis);
    else solid(model,'Single task algae',new THREE.SphereGeometry(206.375,32,20),palette.ball,solution.pieceCenter).userData={role:'gamePiece',part:'algae'};
    if(task==='processor')guideLine(model,'Processor delivery line',[[0,330,431.8],[0,-350,431.8]],palette.algae);
    if(task==='net')guideLine(model,'Placement then gravity release',[solution.target.goal,[0,-400,2136.775]],palette.algae);
  }
  model.userData={task,phase,status:solution.status,geometricTargetsOnly:true};
  const field=buildTaskField(solution);
  return {model,field,solution};
}