import * as THREE from 'three';
import targets from './field-targets.json' with {type:'json'};
import {assertSupportedTask,robotCatalogue,tasksForRobot} from './task-contract.mjs';

const rad=degrees=>degrees*Math.PI/180;
const deg=radians=>radians*180/Math.PI;
const vector=value=>new THREE.Vector3(...value);
const coralHalf=targets.pieces.coral.lengthMm/2;
const ballRadius=targets.pieces.algae.diameterMm/2;
export const phases=['approach','engage','release'];
export const phaseLabels={approach:'Align / approach',engage:'Engage / deliver',release:'Release / withdraw'};
export const mechanisms={
  R01:{coral:{type:'lift',base:[-130,310,160],reach:500,maxHeight:2250},algae:{type:'twoLink',base:[160,430,300],upper:730,lower:630},pickup:true,climb:'deep'},
  R02:{coral:{type:'lift',base:[0,440,160],reach:610,maxReach:740,maxHeight:2750},algae:{type:'shared'},climb:'shallow'},
  R03:{coral:{type:'lift',base:[-160,310,160],reach:480,maxHeight:2250},algae:{type:'twoLink',base:[180,430,300],upper:730,lower:630},shooter:true,climb:'deep'},
  R04:{coral:{type:'telescope',base:[0,380,430],minLength:550,maxLength:2300},algae:{type:'shared'},climb:'deep'},
  R05:{coral:{type:'lift',base:[-120,310,160],reach:530,maxHeight:2250},algae:{type:'twoLink',base:[170,430,300],upper:540,lower:520},pickup:true,climb:'shallow'},
  R06:{coral:{type:'telescope',base:[0,380,430],minLength:550,maxLength:2500,turret:true},algae:{type:'shared'},climb:'park'},
  R07:{coral:{type:'lift',base:[-130,310,160],reach:500,maxHeight:1480},algae:{type:'telescope',base:[165,430,300],minLength:500,maxLength:1550},pickup:true,climb:'deep'},
  R08:{coral:{type:'fixedArm',base:[-130,320,360],length:680},algae:{type:'twoLink',base:[170,430,300],upper:540,lower:520},pickup:true,climb:'shallow'},
  R09:{coral:{type:'twoLink',base:[-140,480,360],upper:720,lower:630,rear:true},algae:{type:'lift',base:[80,360,160],reach:590,maxHeight:1680},shooter:true,climb:'deep'},
  R10:{coral:{type:'lift',base:[-180,350,160],reach:370,maxHeight:2250,side:true},algae:{type:'lift',base:[180,360,160],reach:590,maxHeight:2800},climb:'shallow'},
};

export function targetForTask(task,phase='engage'){
  if(!phases.includes(phase))throw new Error(`Unknown phase ${phase}`);
  const result={task,fieldFixed:true,axis:[0,1,0],assumptions:[],part:'coral',release:false};
  if(/^coral-l[234]$/.test(task)){
    const level=task.slice(-2);const data=targets.interfaces[level];const angle=rad(data.upAngleDeg);
    const axis=[0,Math.cos(angle),Math.sin(angle)];
    const tip=[0,-data.tipInsetFromBaseMm,data.tipHeightMm-data.branchRadiusMm*Math.cos(angle)];
    const insertion=level==='l4'?120:140;
    const goal=vector(tip).addScaledVector(vector(axis),coralHalf-insertion).toArray();
    const center=phase==='approach'?vector(tip).addScaledVector(vector(axis),coralHalf+70).toArray():goal;
    return {...result,field:'reef',level,axis,center,goal,tip,branchBase:vector(tip).addScaledVector(vector(axis),-data.branchLengthHypothesisMm).toArray(),branchRadius:data.branchRadiusMm,insertionMm:phase==='approach'?-70:insertion,release:phase==='release',assumptions:['Branch exposed length and support profile are fixed hypotheses; highest points, pipe OD and angle are sourced.','Coral bore is nominal; cap shape, tolerance and retained-tool clearance are not qualified.']};
  }
  if(task==='coral-l1'){
    const surface=targets.interfaces.l1.frontEdgeMm;const goal=[0,-85,surface+57.15];
    return {...result,field:'trough',center:phase==='approach'?[0,75,surface+137.15]:goal,goal,release:phase==='release',assumptions:['Illustrative horizontal trough support at the sourced front-edge height; complete trough profile is not verified.']};
  }
  if(task==='coral-station'){
    const data=targets.interfaces.station;const axis=[1,0,0];const feedAxis=[0,Math.cos(rad(55)),-Math.sin(rad(55))];
    const openingPoint=[0,0,data.bottomMm+57.15/Math.cos(rad(55))];
    const center=vector(openingPoint).addScaledVector(vector(feedAxis),phase==='release'?160:phase==='approach'?-60:0).toArray();
    return {...result,field:'station',axis,feedAxis,openingPoint,center,goal:center,assumptions:['Crosswise coral rolls down the sourced 55-degree chute; translation direction is not its cylinder axis.','Guide and receiving contact arrangement are proposed, not a reliable feed test.']};
  }
  if(task==='coral-floor')return {...result,field:'floor',axis:[1,0,0],center:[0,phase==='release'?80:0,phase==='release'?210:57.15],goal:[0,0,57.15],assumptions:['Loose crosswise coral on ideal carpet; not the initial stacked algae/coral condition.']};
  result.part='algae';result.axis=[0,1,0];
  if(task==='algae-floor')return {...result,field:'floor',center:[0,phase==='release'?160:0,phase==='release'?480:ballRadius],goal:[0,0,ballRadius],assumptions:['Ideal spherical algae and flat carpet; deformation is not modeled.']};
  if(task==='algae-low'||task==='algae-high'){
    const data=targets.interfaces[task==='algae-low'?'algaeLow':'algaeHigh'];
    return {...result,field:'reef-algae',center:[0,phase==='release'?350:0,data.centerHypothesisMm],goal:[0,0,data.centerHypothesisMm],assumptions:[`Reef algae center ${data.centerHypothesisMm} mm is an explicit fixed hypothesis, not a sourced field datum.`]};
  }
  if(task==='processor'){
    const data=targets.interfaces.processor;const center=[0,phase==='approach'?320:phase==='release'?-300:0,data.centerMm];
    return {...result,field:'processor',center,goal:[0,0,data.centerMm],release:phase==='release',assumptions:['Centered ball passes within the sourced bounding aperture; rounded-corner, lip and compression details are unqualified.']};
  }
  if(task==='net'){
    const data=targets.interfaces.net;const center=[0,phase==='approach'?300:-400,data.rimHypothesisMm+ballRadius+60];
    return {...result,field:'net',center,goal:[0,-400,data.rimHypothesisMm+ballRadius+60],release:phase==='release',assumptions:[`Net side-entry height ${data.rimHypothesisMm} mm and 1000 x 3500 mm clear aperture are hypotheses; end panels are higher.`, 'No real launch calibration, drag, spin or release reliability is established.']};
  }
  throw new Error(`No interaction target for ${task}`);
}

function localBasis(spec){
  if(spec.side)return {out:[-1,0,0],heading:Math.PI/2,edge:350};
  return {out:[0,spec.rear?1:-1,0],heading:spec.rear?Math.PI:0,edge:spec.rear?760:0};
}

export function solveMechanism(spec,pivotHeight){
  const basis=localBasis(spec);const base=vector(spec.base);const outward=vector(basis.out);
  let span=spec.reach??610;const joints=[];const points=[base.toArray()];let reachable=true;let reason='';
  if(spec.type==='lift'){
    reachable=pivotHeight>=180&&pivotHeight<=spec.maxHeight;
    if(!reachable)reason=`Carriage target ${pivotHeight.toFixed(1)} mm is outside 180..${spec.maxHeight} mm.`;
    const height=THREE.MathUtils.clamp(pivotHeight,180,spec.maxHeight);
    points.push([base.x,base.y,height]);joints.push({name:'Carriage height',value:height,unit:'mm'},{name:'Wrist support reach',value:span,unit:'mm'});
    const endpoint=new THREE.Vector3(base.x,base.y,height).addScaledVector(outward,span);points.push(endpoint.toArray());
    return {...basis,points,pivot:endpoint.toArray(),joints,reachable,reason};
  }
  const delta=pivotHeight-base.z;
  if(spec.type==='telescope'){
    const preferred=Math.min(spec.spanLimit??Infinity,delta>700?Math.max(530,Math.abs(delta)/Math.tan(rad(63))):610);
    const needed=Math.hypot(preferred,delta);const length=THREE.MathUtils.clamp(needed,spec.minLength,spec.maxLength);
    reachable=Math.abs(delta)<=length;
    if(!reachable)reason=`Required vertical rise ${delta.toFixed(1)} mm exceeds the ${spec.maxLength} mm telescope.`;
    span=Math.sqrt(Math.max(0,length*length-Math.min(Math.abs(delta),length)**2));
    const endpoint=base.clone().addScaledVector(outward,span);endpoint.z=base.z+THREE.MathUtils.clamp(delta,-length,length);
    points.push(endpoint.toArray());joints.push({name:'Boom length',value:length,unit:'mm'},{name:'Shoulder pitch',value:deg(Math.atan2(endpoint.z-base.z,span)),unit:'deg'});
    return {...basis,points,pivot:endpoint.toArray(),joints,reachable,reason};
  }
  if(spec.type==='fixedArm'){
    reachable=Math.abs(delta)<=spec.length;
    if(!reachable)reason=`Required rise ${delta.toFixed(1)} mm exceeds fixed ${spec.length} mm arm.`;
    span=Math.sqrt(Math.max(0,spec.length**2-Math.min(Math.abs(delta),spec.length)**2));
    const endpoint=base.clone().addScaledVector(outward,span);endpoint.z=base.z+THREE.MathUtils.clamp(delta,-spec.length,spec.length);
    points.push(endpoint.toArray());joints.push({name:'Shoulder pitch',value:deg(Math.atan2(endpoint.z-base.z,span)),unit:'deg'},{name:'Fixed arm length',value:spec.length,unit:'mm'});
    return {...basis,points,pivot:endpoint.toArray(),joints,reachable,reason};
  }
  span=Math.min(spec.spanLimit??Infinity,660,Math.sqrt(Math.max(0,(spec.upper+spec.lower-5)**2-delta*delta)));
  const separation=Math.hypot(span,delta);reachable=separation<=spec.upper+spec.lower&&separation>=Math.abs(spec.upper-spec.lower)&&span>0;
  if(!reachable)reason='Requested height is outside the fixed two-link workspace.';
  const safeSeparation=THREE.MathUtils.clamp(separation,Math.abs(spec.upper-spec.lower)+0.001,spec.upper+spec.lower-0.001);
  const shoulder=Math.atan2(delta,span)+Math.acos(THREE.MathUtils.clamp((spec.upper**2+safeSeparation**2-spec.lower**2)/(2*spec.upper*safeSeparation),-1,1));
  const elbow=base.clone().addScaledVector(outward,spec.upper*Math.cos(shoulder));elbow.z+=spec.upper*Math.sin(shoulder);
  const endpoint=base.clone().addScaledVector(outward,span);endpoint.z=pivotHeight;
  if(!reachable){endpoint.copy(elbow).addScaledVector(endpoint.clone().sub(elbow).normalize(),spec.lower);}
  points.push(elbow.toArray(),endpoint.toArray());
  const lowerAngle=Math.atan2(endpoint.z-elbow.z,endpoint.clone().sub(elbow).dot(outward));
  joints.push({name:'Shoulder pitch',value:deg(shoulder),unit:'deg'},{name:'Elbow relative',value:deg(lowerAngle-shoulder),unit:'deg'},{name:'Upper / lower lengths',value:spec.upper,second:spec.lower,unit:'mm'});
  return {...basis,points,pivot:endpoint.toArray(),joints,reachable,reason};
}

export function ballisticShot(distanceMm,launchHeightMm,targetHeightMm,angleDeg=65){
  const gravity=9810;const angle=rad(angleDeg);const denominator=2*Math.cos(angle)**2*(distanceMm*Math.tan(angle)-(targetHeightMm-launchHeightMm));
  if(denominator<=0)throw new Error('Fixed-hood shot has no positive ballistic speed for this target');
  const speed=Math.sqrt(gravity*distanceMm**2/denominator);const time=distanceMm/(speed*Math.cos(angle));
  return {speedMmPerSecond:speed,flightSeconds:time,angleDeg,points:Array.from({length:41},(_,index)=>{const current=time*index/40;return [0,-speed*Math.cos(angle)*current,launchHeightMm+speed*Math.sin(angle)*current-gravity*current*current/2];}),model:'Ideal point-mass projectile, no drag/spin'};
}

function toolProjection(spec,target,offset){
  const basis=localBasis(spec);const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),basis.heading).invert();
  const axis=target.part==='coral'?vector(target.axis):new THREE.Vector3(0,1,0);
  const orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis);
  const corners=target.part==='coral'?[[-96,96],[-90,198],[target.task==='coral-floor'?0:-112,128]]:[[-250,250],[118,312],[-240,240]];
  let extension=0;
  for(const across of corners[0])for(const rear of corners[1])for(const up of corners[2])extension=Math.max(extension,new THREE.Vector3(across,rear,up).applyQuaternion(orientation).sub(offset).applyQuaternion(rotation).dot(vector(basis.out)));
  return extension;
}

export function solveTask(id,task,phase='engage'){
  assertSupportedTask(id,task);if(!phases.includes(phase))throw new Error('Unknown phase');
  const recipe=mechanisms[id];
  if(['stow','climb','park'].includes(task))return {id,task,phase,legacy:true,pose:task==='park'?'climb':task,status:'POSE_ONLY_ENDGAME_NOT_SOLVED',reason:'Endgame/load engagement remains a separate unverified study.',joints:[],standOffMm:null};
  const target=targetForTask(task,phase);const isCoral=target.part==='coral';const role=isCoral?'coral':'algae';
  const spec=isCoral?recipe.coral:recipe.algae.type==='shared'?recipe.coral:recipe.algae;
  if(task==='net'&&recipe.shooter){
    const landing=[0,-targets.interfaces.net.openingWidthHypothesisMm/2,targets.interfaces.net.lowestMeshMm+ballRadius];
    let launchY=1200;let shot;let nearRailClearanceMm;
    for(;launchY<=2400;launchY+=25){
      shot=ballisticShot(launchY-landing[1],860,landing[2],65);
      const crossingTime=launchY/(shot.speedMmPerSecond*Math.cos(rad(65)));
      const crossingHeight=860+shot.speedMmPerSecond*Math.sin(rad(65))*crossingTime-9810*crossingTime**2/2;
      nearRailClearanceMm=crossingHeight-ballRadius-targets.interfaces.net.rimHypothesisMm;
      if(nearRailClearanceMm>=20)break;
    }
    const launch=[0,launchY,860];
    const worldPath=shot.points.map(point=>[0,launch[1]+point[1],point[2]]);
    return {id,task,phase,role,spec,target,shooter:true,status:nearRailClearanceMm>=20?'ASSUMED_IDEAL_SHOT':'SHOT_CLEARANCE_UNRESOLVED',reason:target.assumptions.join(' '),rootPosition:[-70,launchY+80,0],heading:0,standOffMm:launchY-5,standOffDatum:'front bumper to assumed net near-side boundary',joints:[{name:'Fixed hood angle',value:65,unit:'deg'},{name:'Ideal release speed',value:shot.speedMmPerSecond/1000,unit:'m/s'},{name:'Flight time',value:shot.flightSeconds,unit:'s'},{name:'Ball / near rail clearance',value:nearRailClearanceMm,unit:'mm'}],shot:{...shot,worldPath,nearRailClearanceMm,landing},pieceCenter:phase==='release'?worldPath.at(-1):launch,pieceAxis:[0,1,0],positionErrorMm:0,reachable:nearRailClearanceMm>=20};
  }
  const basis=localBasis(spec);const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),basis.heading);
  const axis=vector(target.axis);const offset=isCoral?axis.clone().multiplyScalar(180):new THREE.Vector3(0,270,0);
  const desired=vector(target.center);
  let toolCenter=desired.clone();
  if(target.release)toolCenter=task==='net'?vector(target.goal).add(new THREE.Vector3(0,170,140)):desired.clone().add(new THREE.Vector3(0,170,75));
  if(phase==='approach'&&!/^coral-l/.test(task))toolCenter.add(new THREE.Vector3(0,120,0));
  const desiredPivot=toolCenter.clone().add(offset);
  let mechanism;
  if(task==='coral-floor'&&recipe.pickup){
    const center=[0,-300,57.15+(phase==='release'?152.85:0)];
    const pivot=vector(center).add(offset).toArray();
    mechanism={...basis,pivot,points:[[0,30,230],pivot],joints:[{name:'Pickup deployment',value:phase==='release'?-38:0,unit:'deg'}],reachable:true,reason:'Dedicated pickup contact section; transfer to scorer is outside this task.'};
    const rootPosition=[0,target.center[1]-center[1],0];
    return {id,task,phase,role,spec:{type:'pickup'},target,mechanism,rootPosition,heading:0,standOffMm:rootPosition[1]-85,standOffDatum:'front bumper to floor-piece center plane',pieceCenter:target.center,pieceAxis:target.axis,toolCenter:target.center,joints:mechanism.joints,status:'GEOMETRIC_CONTACT_PROPOSAL',reachable:true,positionErrorMm:0,reason:target.assumptions.join(' '),contactOffset:offset.toArray(),localToolCenter:center};
  }
  const toolExtent=toolProjection(spec,target,offset);
  const baseToEdge=spec.side?spec.base[0]+350:spec.rear?760-spec.base[1]:spec.base[1];
  const spanLimit=baseToEdge+457.2-toolExtent-8;
  const effectiveSpec={...spec,spanLimit};
  if(task==='net'&&spec.maxReach)effectiveSpec.reach=Math.min(spec.maxReach,spanLimit,spec.base[1]+275);
  mechanism=solveMechanism(effectiveSpec,desiredPivot.z);
  const localOffset=offset.clone().applyQuaternion(rotation.clone().invert());
  const localTool=vector(mechanism.pivot).sub(localOffset);const rotated=localTool.clone().applyQuaternion(rotation);
  const rootPosition=[toolCenter.x-rotated.x,toolCenter.y-rotated.y,0];
  const actual=rotated.add(vector(rootPosition));
  const orientationPitch=isCoral?deg(Math.atan2(axis.z,Math.hypot(axis.x,axis.y))):0;
  const nearestEdge=spec.side?435:spec.rear?845:85;
  const standOffMm=rootPosition[1]-nearestEdge;
  const joints=[...mechanism.joints,{name:isCoral?'Coral axis / wrist pitch':'Algae wrist pitch',value:orientationPitch,unit:'deg'},{name:'Robot heading',value:deg(basis.heading),unit:'deg'}];
  const positionErrorMm=actual.distanceTo(toolCenter);
  const pieceCenter=task==='net'&&phase==='release'?[0,-400,targets.interfaces.net.lowestMeshMm+ballRadius]:target.center;
  const activeSpan=vector(mechanism.pivot).sub(vector(spec.base)).dot(vector(basis.out));
  const workingExtensionMm=activeSpan-baseToEdge+toolExtent;
  const extensionOk=workingExtensionMm<=457.2+1e-6;
  joints.push({name:'Tool forward extension envelope',value:workingExtensionMm,unit:'mm'});
  const status=!mechanism.reachable?'UNREACHABLE_WITH_CURRENT_LIMITS':!extensionOk?'ACTIVE_TOOL_EXTENSION_EXCEEDED':standOffMm<0?'CHASSIS_TARGET_OVERLAP':target.assumptions.length?'ALIGNED_UNDER_STATED_ASSUMPTIONS':'ALIGNED_GEOMETRICALLY';
  return {id,task,phase,role,spec:effectiveSpec,target,mechanism,rootPosition,heading:basis.heading,standOffMm,standOffDatum:`${spec.side?'left':spec.rear?'rear':'front'} bumper to fixed ${target.field} reference plane`,pieceCenter,pieceAxis:target.axis,toolCenter:actual.toArray(),localToolCenter:localTool.toArray(),joints,reachable:mechanism.reachable&&standOffMm>=0&&extensionOk,positionErrorMm,workingExtensionMm,status,reason:[mechanism.reason,...target.assumptions,!extensionOk?'Active tool envelope exceeds the 457.2 mm rule limit; this is an unresolved configuration.':'',standOffMm<0?'The fixed-length recipe overlaps the target face; this capability needs redesign, not a forced fit.':'','The forward-tool check is not a whole-robot swept-envelope or collision pass.'].filter(Boolean).join(' ')};
}

export function taskSummary(){return robotCatalogue.map(robot=>({id:robot.id,tasks:tasksForRobot(robot.id).map(task=>solveTask(robot.id,task,'engage'))}));}