import * as THREE from 'three';
import {box,beam,axle,roller,sidePlate,solid,palette} from './primitives.mjs';

export const recipes = [
  {id:'R01',coral:'lift',pickup:'roller',algae:'arm',climb:'deep',height:2020,coralX:-130,algaeX:160},
  {id:'R02',coral:'sharedLift',pickup:null,algae:'shared',climb:'shallow',height:2040,coralX:0,algaeX:0},
  {id:'R03',coral:'lift',pickup:null,algae:'arm',shooter:true,climb:'deep',height:2040,coralX:-160,algaeX:180},
  {id:'R04',coral:'telescope',pickup:null,algae:'shared',climb:'deep',height:2020,coralX:0,algaeX:0},
  {id:'R05',coral:'lift',pickup:'carrier',algae:'shortArm',climb:'shallow',height:2020,coralX:-120,algaeX:170},
  {id:'R06',coral:'turret',pickup:null,algae:'shared',climb:'park',height:2040,coralX:0,algaeX:0},
  {id:'R07',coral:'lift',pickup:'belt',algae:'telescope',climb:'deep',height:1390,coralX:-130,algaeX:165},
  {id:'R08',coral:'shortArm',pickup:'carrier',algae:'shortArm',climb:'shallow',height:970,coralX:-130,algaeX:170},
  {id:'R09',coral:'rearArm',pickup:null,algae:'lift',shooter:true,climb:'deep',height:1370,coralX:-140,algaeX:80},
  {id:'R10',coral:'foldLift',pickup:null,algae:'foldLift',climb:'shallow',height:2030,coralX:-180,algaeX:180},
];

export const poses=['travel','stow','floor','station','coral','algae','climb'];

function pairPlates(parent,name,center,width,outline,color=palette.plate) {
  const group=new THREE.Group();group.name=name;group.position.set(...center);parent.add(group);
  for(const sign of [-1,1])sidePlate(group,`${name} cheek`,sign*width/2,outline,8,color);
  return group;
}

function coralHead(parent,center,pitch=0,shared=false) {
  const width=shared?310:245;
  const group=pairPlates(parent,shared?'Dual-shape wrist':'Coral wrist',center,width,[[-145,-55],[-145,70],[60,90],[125,30],[95,-65]],palette.plate);
  group.rotation.x=pitch;
  roller(group,'Lower retention',[0,-60,-35],width-15,30,palette.coral);
  roller(group,'Upper drive',[0,-35,65],width-15,32,palette.coral,true);
  roller(group,'Rear guide',[0,65,0],width-15,22,palette.rail);
  axle(group,'Pitch axle',[-width/2-20,80,0],[width/2+20,80,0],12);
  box(group,'Retention floor',[0,0,-64],[width-8,180,5],palette.plate);
  if(shared){
    for(const across of [-155,155])beam(group,'Algae finger',[across,70,0],[across,-170,-20],20,30,palette.algae);
    roller(group,'Algae contact pair',[0,-155,-20],290,40,palette.algae,true);
  }
  return group;
}

function algaeHead(parent,center) {
  const group=pairPlates(parent,'Algae jaw',center,330,[[-145,-75],[-180,65],[-55,145],[105,90],[110,-65]],palette.algae);
  roller(group,'Algae lower contact',[0,-95,-65],310,42,palette.algae,true);
  roller(group,'Algae upper contact',[0,-80,105],310,42,palette.algae,true);
  roller(group,'Algae backing',[0,90,35],310,32,palette.rail);
  axle(group,'Jaw mounting axle',[-180,105,35],[180,105,35],12);
  return group;
}

function coralPiece(parent,center,axis='y') {
  const geometry=new THREE.CylinderGeometry(57.15,57.15,301.625,32,1,true);
  const mesh=solid(parent,'Nominal coral',geometry,0xe6e3d7,center);
  if(axis==='z')mesh.rotation.x=Math.PI/2;
  if(axis==='x')mesh.rotation.z=Math.PI/2;
  const capMaterial=new THREE.MeshStandardMaterial({color:0xe6e3d7,side:THREE.DoubleSide,roughness:0.9});
  for(const sign of [-1,1]){
    const rim=new THREE.Mesh(new THREE.RingGeometry(50.8,57.15,32),capMaterial);
    rim.rotation.x=Math.PI/2;rim.position.y=sign*301.625/2;mesh.add(rim);
  }
  return mesh;
}

function algaePiece(parent,center) {
  return solid(parent,'Nominal algae',new THREE.SphereGeometry(206.375,32,20),palette.ball,center);
}

export function frame(parent) {
  for(const across of [-325,325])beam(parent,'Chassis side rail',[across,30,125],[across,730,125],50,50,palette.frame);
  for(const rearward of [25,735])beam(parent,'Chassis cross rail',[-300,rearward,125],[300,rearward,125],50,50,palette.frame);
  box(parent,'Bellypan',[0,380,75],[645,685,5],0xb7c5bd);
  for(const across of [-392.5,392.5])box(parent,'Side bumper',[across,380,105],[85,760,120],palette.bumper);
  for(const rearward of [-42.5,802.5])box(parent,'End bumper',[0,rearward,105],[870,85,120],palette.bumper);
  for(const across of [-245,245])for(const rearward of [110,650]){
    box(parent,'Swerve fork',[across,rearward,100],[115,125,20],palette.shaft);
    axle(parent,'Drive tread',[across-23,rearward,55],[across+23,rearward,55],50,palette.rubber);
    axle(parent,'Steer axis',[across,rearward,108],[across,rearward,160],30,palette.rail);
  }
  box(parent,'Battery',[0,600,235],[180,240,165],palette.battery);
  for(const across of [-105,105])beam(parent,'Battery restraint',[across,470,150],[across,720,150],15,20,palette.shaft);
  box(parent,'Electrical tray',[-220,450,170],[155,150,8],palette.frame);
  for(let index=0;index<3;index++)box(parent,'Electrical module',[-225,400+45*index,195],[90,25,30],palette.battery);
}

function elevator(parent,name,across,rearward,carriageHeight,color=palette.rail,fold=0) {
  const group=new THREE.Group();group.name=name;group.position.set(across,rearward,160);group.rotation.x=fold;parent.add(group);
  const stageLength=760;
  const extension=Math.max(0,carriageHeight-800)/2;
  for(let stage=0;stage<3;stage++){
    const halfSpan=155-stage*25;
    const bottom=stage*extension;
    for(const sign of [-1,1]){
      beam(group,`${name} rail ${stage+1}`,[sign*halfSpan,stage*24,bottom],[sign*halfSpan,stage*24,bottom+stageLength],25,35,color);
      axle(group,'Stage return pulley',[sign*halfSpan-8,stage*24,bottom+stageLength-35],[sign*halfSpan+8,stage*24,bottom+stageLength-35],22,palette.shaft);
    }
    for(const up of [bottom+15,bottom+stageLength-15])beam(group,'Stage crossmember',[-halfSpan,stage*24,up],[halfSpan,stage*24,up],25,25,color);
  }
  const up=carriageHeight-160;
  for(const sign of [-1,1])box(group,'Carriage side',[sign*100,55,up],[28,55,115],palette.plate);
  beam(group,'Carriage bridge',[-100,45,up],[100,45,up],30,35,palette.plate);
  axle(group,'Lift drive',[-150,0,55],[150,0,55],22,palette.shaft);
  return group;
}

function wristSupport(parent,center,reach,angle=0) {
  const group=new THREE.Group();group.position.set(...center);group.rotation.x=angle;parent.add(group);
  for(const across of [-95,95])beam(group,'Wrist pitch cheek',[across,0,0],[across,-reach,0],18,40,palette.plate);
  axle(group,'Wrist pivot',[-140,0,0],[140,0,0],18,palette.shaft);
  return {group,tool:[0,-reach,0]};
}

function telescope(parent,name,from,target,color=palette.plate) {
  const start=new THREE.Vector3(...from);const finish=new THREE.Vector3(...target);
  const span=finish.clone().sub(start);const length=span.length();const direction=span.clone().normalize();
  const pieces=Math.max(2,Math.ceil(length/720));
  for(let stage=0;stage<pieces;stage++){
    const lower=stage*length/pieces;
    const upper=Math.min(length,(stage+1)*length/pieces+100);
    beam(parent,`${name} nested ${stage+1}`,start.clone().addScaledVector(direction,lower).toArray(),start.clone().addScaledVector(direction,upper).toArray(),Math.max(30,80-stage*17),Math.max(40,100-stage*17),color);
  }
  axle(parent,`${name} shoulder`,[from[0]-90,from[1],from[2]],[from[0]+90,from[1],from[2]],32,palette.shaft);
  return finish.toArray();
}

function articulated(parent,name,base,target,upper,lower,color=palette.plate) {
  const rear=target[1]-base[1];const up=target[2]-base[2];
  const distance=Math.hypot(rear,up);
  if(distance>upper+lower || distance<Math.abs(upper-lower))throw new Error(`${name}: requested cartoon pose out of two-link reach`);
  const angle=Math.atan2(up,rear)-(rear<0?1:-1)*Math.acos((upper*upper+distance*distance-lower*lower)/(2*upper*distance));
  const elbow=[base[0],base[1]+upper*Math.cos(angle),base[2]+upper*Math.sin(angle)];
  for(const offset of [-45,45]){
    const shifted=point=>[point[0]+offset,point[1],point[2]];
    beam(parent,`${name} upper`,shifted(base),shifted(elbow),20,55,color);
    beam(parent,`${name} lower`,shifted(elbow),shifted(target),18,45,color);
  }
  for(const [index,point] of [base,elbow,target].entries())axle(parent,`${name} joint ${index+1}`,[point[0]-65,point[1],point[2]],[point[0]+65,point[1],point[2]],index===0?30:22,palette.shaft);
  return target;
}

function intake(parent,kind,across,pose) {
  const group=new THREE.Group();group.name='Coral floor carrier';group.position.set(across,45,215);parent.add(group);
  group.rotation.x=pose==='floor'?0:pose==='stow'?-Math.PI/2:-0.95;
  const width=kind==='carrier'?420:450;
  for(const sign of [-1,1])sidePlate(group,'Intake side plate',sign*width/2,[[-370,-150],[-50,-10],[15,65],[-150,65],[-390,-85]],8,palette.plate);
  axle(group,'Carrier pivot',[-width/2-15,0,0],[width/2+15,0,0],15);
  roller(group,'Pickup nose',[0,-320,-130],width-15,52,palette.coral,true);
  roller(group,'Upper control',[0,-250,5],width-15,48,palette.rail);
  roller(group,kind==='carrier'?'Carrier locked lower':'Powered rear kicker',[0,-75,-25],width-15,35,kind==='carrier'?palette.rubber:palette.coral,true);
  beam(group,'Supported ramp',[0,-350,-172],[0,-25,-55],width-30,5,palette.plate);
  if(kind==='belt')for(const across of [-100,100])beam(group,'Belt working run',[across,-310,-115],[across,-65,-15],60,5,palette.rubber);
}

export function shooter(parent,across) {
  const center=[across,200,760];
  for(const sign of [-1,1])beam(parent,'Launcher post',[across+sign*205,210,155],[across+sign*205,210,830],25,30,palette.rail);
  const points=[];for(let index=0;index<=10;index++){const angle=0.05+index*0.12;points.push([40-260*Math.cos(angle),80+260*Math.sin(angle)]);}
  for(const sign of [-1,1])sidePlate(parent,'Fixed hood cheek',across+sign*210,points.map(([rear,up])=>[center[1]+rear,center[2]+up]),8,palette.plate);
  for(let index=0;index<7;index++){
    const angle=0.1+index*0.18;const rear=center[1]+40-260*Math.cos(angle);const up=center[2]+80+260*Math.sin(angle);
    box(parent,'Hood slat',[across,rear,up],[412,35,6],palette.coral).rotation.x=angle;
  }
  roller(parent,'Launcher flywheel',[across,80,790],395,90,palette.coral,true);
  roller(parent,'Launcher feed roller',[across,310,610],390,50,palette.algae,true);
  for(const sign of [-1,1])sidePlate(parent,'Feed side guide',across+sign*210,[[90,545],[390,535],[400,745],[200,810]],7,palette.plate);
  beam(parent,'Feed bed',[across,385,535],[across,100,585],405,6,palette.rail);
}

function climber(parent,type,pose) {
  if(type==='park')return;
  const group=new THREE.Group();group.name=`${type} climb`;group.position.set(0,660,180);parent.add(group);
  const deployed=pose==='climb';
  const end=deployed?[0,350,type==='deep'?330:920]:[0,-75,650];
  for(const across of [-105,105]){
    beam(group,'Climb arm',[across,0,0],[across,end[1],end[2]],30,50,palette.climb);
    const hook=pairPlates(group,'Cage hook',[across,end[1],end[2]],22,[[-20,-60],[70,-60],[95,35],[70,70],[25,75],[20,45],[55,38],[45,-20],[-20,-20]],palette.climb);
    hook.rotation.x=deployed?0:0.15;
  }
  axle(group,'Climb pivot',[-155,0,0],[155,0,0],30,palette.shaft);
  axle(group,'Winch spool',[-80,-35,90],[80,-35,90],40,palette.shaft);
  beam(group,'Climb crossbar',[-105,end[1],end[2]-50],[105,end[1],end[2]-50],25,25,palette.climb);
  axle(group,'Winch cable',[0,-35,90],[0,end[1],end[2]-50],3,palette.rubber);
}

function addCoral(parent,recipe,pose,mode) {
  const shared=['telescope','turret','sharedLift'].includes(recipe.coral);
  const algaeActive=pose==='algae'||(pose==='floor'&&shared);
  if(recipe.coral==='telescope'||recipe.coral==='turret'){
    const group=new THREE.Group();group.position.set(recipe.coralX,380,0);parent.add(group);
    if(recipe.coral==='turret'){
      axle(group,'Turret bearing',[0,0,180],[0,0,240],160,palette.shaft);group.rotation.z=pose==='coral'?0.4:pose==='algae'?-0.35:0;
    }
    const base=[0,0,430];
    for(const across of [-130,130])sidePlate(group,'Shoulder tower',across,[[-110,150],[90,150],[65,470],[-55,500]],12,palette.rail);
    const target=pose==='coral'?[0,-510,recipe.height]:pose==='algae'?[0,-490,recipe.coral==='turret'?2250:1520]:pose==='floor'?[0,-635,230]:pose==='station'?[0,-440,1040]:[0,-130,850];
    telescope(group,'Scoring boom',base,target,palette.rail);
    const head=coralHead(group,target,0,true);
    if(pose==='coral')coralPiece(head,[0,-40,5]);
    if(algaeActive)algaePiece(head,[0,-115,65]);
    return;
  }
  if(recipe.coral==='shortArm'||recipe.coral==='rearArm'){
    const rear=recipe.coral==='rearArm';const base=[recipe.coralX,rear?480:320,360];
    for(const sign of [-1,1])beam(parent,'Coral arm tower',[base[0]+sign*65,base[1],160],[base[0]+sign*65,base[1],360],30,40,palette.rail);
    let target=pose==='coral'?[base[0],rear?960:-170,recipe.height]:pose==='floor'&&!recipe.pickup?[base[0],rear?990:-255,140]:pose==='station'?[base[0],rear?880:-100,1040]:[base[0],rear?480:240,750];
    if(rear)articulated(parent,'Rear coral arm',base,target,720,630,palette.rail);
    else {
      if(pose==='stow')target=[base[0],base[1]+290,base[2]+Math.sqrt(680*680-290*290)];
      const direction=new THREE.Vector3(...target).sub(new THREE.Vector3(...base)).normalize();
      target=new THREE.Vector3(...base).addScaledVector(direction,680).toArray();
      for(const offset of [-65,65])beam(parent,'Fixed scoring arm',[base[0]+offset,base[1],base[2]],[target[0]+offset,target[1],target[2]],22,45,palette.rail);
      axle(parent,'Scoring shoulder',[base[0]-90,base[1],base[2]],[base[0]+90,base[1],base[2]],26);
    }
    const head=coralHead(parent,target);if(pose==='coral')coralPiece(head,[0,-20,5]);
    return;
  }
  const across=recipe.coralX;
  const rearward=recipe.coral==='foldLift'?350:310;
  const up=pose==='coral'?recipe.height:pose==='station'?1010:pose==='algae'&&shared?2330:pose==='floor'&&!recipe.pickup?500:pose==='stow'?700:1050;
  const lift=elevator(parent,'Coral elevator',across,rearward,up,palette.rail,recipe.coral==='foldLift'&&pose==='floor'?0.4:0);
  const backwards=pose==='station'&&['R01','R03','R05'].includes(recipe.id);
  const mount=[0,48,up-160];
  const reach=backwards?-315:pose==='floor'&&!recipe.pickup?420:330;
  const support=wristSupport(lift,mount,reach,pose==='floor'&&!recipe.pickup?0.6:0);
  if(recipe.coral==='sharedLift'){
    for(const sign of [-1,1])beam(support.group,'Reach slide',[sign*85,0,0],[sign*85,-reach,0],25,28,palette.shaft);
    axle(support.group,'Head selector',[0,-reach,-40],[0,-reach,40],55,palette.shaft);
  }
  const head=coralHead(support.group,support.tool,backwards?Math.PI:0,shared);
  if(pose==='coral')coralPiece(head,[0,-40,5]);
  if(pose==='algae'&&shared)algaePiece(head,[0,-120,65]);
}

function addAlgae(parent,recipe,pose) {
  if(recipe.algae==='shared')return;
  const active=pose==='algae'||pose==='floor';
  const across=recipe.algaeX;
  const base=[across,430,300];
  let target=pose==='floor'?[across,-250,250]:pose==='algae'?[across,-160,recipe.algae==='shortArm'?1030:1500]:[across,230,750];
  if(recipe.algae==='lift'||recipe.algae==='foldLift'){
    target=pose==='floor'?[across,-170,450]:pose==='algae'?[across,-80,recipe.algae==='foldLift'?2350:1520]:[across,150,700];
    const lift=elevator(parent,'Algae elevator',across,360,target[2],palette.algae,recipe.algae==='foldLift'&&pose==='floor'?0.45:0);
    const support=wristSupport(lift,[0,48,target[2]-160],408-target[1]);
    const head=algaeHead(support.group,support.tool);if(active)algaePiece(head,[0,-105,25]);
  }else{
    for(const sign of [-1,1])beam(parent,'Algae shoulder tower',[across+sign*65,430,160],[across+sign*65,430,300],25,35,palette.rail);
    if(recipe.algae==='telescope')telescope(parent,'Algae reach',base,target,palette.algae);
    else articulated(parent,'Algae arm',base,target,recipe.algae==='shortArm'?540:730,recipe.algae==='shortArm'?520:630,palette.algae);
    const head=algaeHead(parent,target);if(active)algaePiece(head,[0,-100,25]);
  }
}

export function buildRobot(id,pose='travel') {
  const recipe=recipes.find(item=>item.id===id);
  if(!recipe||!poses.includes(pose))throw new Error('Unknown robot or pose');
  const root=new THREE.Group();root.name=`${id} mechanism concept`;
  frame(root);
  if(recipe.pickup)intake(root,recipe.pickup,0,pose);
  if(recipe.shooter)shooter(root,70);
  addCoral(root,recipe,pose);
  addAlgae(root,recipe,pose);
  climber(root,recipe.climb,pose);
  if(pose==='floor'&&recipe.pickup)coralPiece(root,[0,-350,57.15],'x');
  root.userData={id,pose,status:'ILLUSTRATIVE_MECHANISM_REVISION',kinematicsProven:false,recipe};
  return root;
}

export function fieldReferences(pose) {
  const root=new THREE.Group();root.name='Field height references, not complete field geometry';
  if(pose==='coral'){
    const target=1828.8;
    axle(root,'L4 highest branch reference',[0,-300,target-300],[0,-300,target],21,0x9b9e9c);
    beam(root,'Reference support',[0,-330,40],[0,-330,target-300],35,35,0xa8b3ab);
  }
  if(pose==='station'){
    box(root,'Station opening bottom datum',[0,960,952.5],[600,20,8],0xa8b3ab);
    for(const across of [-300,300])beam(root,'Station height datum',[across,960,50],[across,960,1130],20,20,0xa8b3ab);
  }
  return root;
}