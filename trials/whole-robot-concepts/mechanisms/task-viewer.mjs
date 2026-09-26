import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildInteraction} from './interaction-scenes.mjs';
import {solveTask,phases,phaseLabels} from './interaction-solver.mjs';
import {robotCatalogue,tasksForRobot,taskLabels} from './task-contract.mjs';
import {contentBounds} from './scene-bounds.mjs';

THREE.Object3D.DEFAULT_UP.set(0,0,1);
const mount=document.querySelector('#scene');const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf2f5f3);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
mount.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Robot task interaction scene');
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(33,1,10,25000);camera.up.set(0,0,1);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=150;
scene.add(new THREE.HemisphereLight(0xffffff,0x71817c,2.4));
const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-1600,2600,4500);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-3000,right:3000,top:3200,bottom:-2800,near:100,far:10000});key.shadow.bias=-0.00015;scene.add(key);
const fill=new THREE.DirectionalLight(0xdde8ef,1.5);fill.position.set(2400,-1800,2200);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000),new THREE.ShadowMaterial({opacity:0.12}));floor.receiveShadow=true;floor.position.z=-2;scene.add(floor);
let current;let id='R03';let task='coral-l4';let phase='engage';let view='iso';let focus='whole';let frames=0;
const element=name=>document.getElementById(name);
const round=value=>Number.isFinite(value)?value.toFixed(1):'Not solved';

function dispose(root){root?.traverse(object=>object.geometry?.dispose());if(root)scene.remove(root);}
function frame(){
  const bounds=contentBounds(current.model,current.field);let center=bounds.getCenter(new THREE.Vector3());let radius=bounds.getSize(new THREE.Vector3()).length()/2;
  if(focus==='contact'&&!current.solution.legacy){center=new THREE.Vector3(...current.solution.pieceCenter);radius=task==='net'?900:460;}
  const directions={iso:[1.5,2.1,1.3],side:[1,0,0.08],front:[0,1,0.06],top:[0,0.001,1]};const direction=new THREE.Vector3(...directions[view]).normalize();
  const vertical=THREE.MathUtils.degToRad(camera.fov);const horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);const distance=radius/Math.sin(Math.min(vertical,horizontal)/2)*1.1;
  controls.maxDistance=Math.max(12000,distance*2);camera.far=Math.max(25000,distance+radius*4);camera.updateProjectionMatrix();
  camera.position.copy(center).addScaledVector(direction,distance);controls.target.copy(center);camera.lookAt(center);controls.update();renderer.render(scene,camera);
}
function table(){
  const body=element('comparison');body.replaceChildren();
  for(const robot of robotCatalogue){
    const supported=tasksForRobot(robot.id).includes(task);const row=document.createElement('tr');
    const link=document.createElement('button');link.type='button';link.className='robot-link';link.textContent=`${robot.id} ${robot.title}`;link.disabled=!supported;link.addEventListener('click',()=>choose(robot.id,task,phase));
    const name=document.createElement('td');name.append(link);row.append(name);
    const solved=supported?solveTask(robot.id,task,phase):null;
    const values=supported?[solved.status,round(solved.standOffMm),solved.joints.map(joint=>`${joint.name}: ${round(joint.value)}${joint.second?` / ${round(joint.second)}`:''} ${joint.unit}`).join('; ')]:['Not a declared capability','-','-'];
    for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}if(robot.id===id)row.className='selected';body.append(row);
  }
}
function update(){
  const robot=robotCatalogue.find(robot=>robot.id===id);const solution=current.solution;
  element('robot-title').textContent=`${id} / ${robot.title}`;element('task-title').textContent=taskLabels[task];
  element('status').textContent=solution.status.replaceAll('_',' ');element('status').classList.toggle('blocked',!solution.reachable&&!solution.legacy);
  element('gap').textContent=Number.isFinite(solution.standOffMm)?`${round(solution.standOffMm)} mm`:'Not solved';
  element('gap-datum').textContent=solution.standOffDatum||solution.reason;
  element('piece-height').textContent=solution.pieceCenter?`${round(solution.pieceCenter[2])} mm`:'-';
  element('error').textContent=solution.positionErrorMm===undefined?'-':`${solution.positionErrorMm.toFixed(3)} mm`;
  element('assumptions').textContent=solution.reason||'Static configuration only.';
  element('joints').replaceChildren();for(const joint of solution.joints){const term=document.createElement('dt');term.textContent=joint.name;const value=document.createElement('dd');value.textContent=`${round(joint.value)}${joint.second?` / ${round(joint.second)}`:''} ${joint.unit}`;element('joints').append(term,value);}
  element('contact-rule').textContent=solution.target?.insertionMm!==undefined?`Branch insertion: ${round(solution.target.insertionMm)} mm; bore coaxial to the branch.`:solution.shooter?'Ideal projectile at the stated release angle/speed; not a calibrated shot.':task==='processor'?'One ball passes the sourced opening center; tool release is separate.':solution.legacy?solution.reason:'The task target, piece pose and tool datum share one coordinate calculation.';
  element('phase').disabled=solution.legacy;element('png').href=`interactions/task-${id}-${task}.png`;element('png').textContent='Engagement PNG';
  element('comparison-title').textContent=`Same task / ${taskLabels[task]} / ${phaseLabels[phase]}`;
  document.title=`${id} / ${taskLabels[task]} / Robot interactions`;table();
}
function choose(nextId,nextTask=task,nextPhase=phase){
  const tasks=tasksForRobot(nextId);if(!tasks.includes(nextTask))nextTask=tasks.includes('coral-l4')?'coral-l4':tasks.find(task=>task.startsWith('coral-l'))||'stow';
  if(!phases.includes(nextPhase))throw new Error('Unknown phase');
  id=nextId;task=nextTask;phase=nextPhase;dispose(current?.model);dispose(current?.field);current=buildInteraction(id,task,phase);
  scene.add(current.model);if(current.field)scene.add(current.field);
  element('robot').value=id;element('task').replaceChildren(...tasks.map(value=>{const option=document.createElement('option');option.value=value;option.textContent=taskLabels[value];return option;}));
  element('task').value=task;element('phase').value=phase;update();frame();return diagnostics();
}
function diagnostics(){
  const bounds=contentBounds(current.model,current.field);camera.updateMatrixWorld();const corners=[];
  for(const across of [bounds.min.x,bounds.max.x])for(const rear of [bounds.min.y,bounds.max.y])for(const up of [bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(across,rear,up).project(camera));
  return {id,task,phase,focus,view,frames,framed:focus==='contact'?null:corners.every(point=>Math.abs(point.x)<=1&&Math.abs(point.y)<=1&&point.z>=-1&&point.z<=1),solution:current.solution,size:[renderer.domElement.width,renderer.domElement.height],tasks:tasksForRobot(id)};
}
function capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
function pixels(){
  renderer.render(scene,camera);const gl=renderer.getContext();const data=new Uint8Array(renderer.domElement.width*renderer.domElement.height*4);gl.readPixels(0,0,renderer.domElement.width,renderer.domElement.height,gl.RGBA,gl.UNSIGNED_BYTE,data);
  let colored=0;let dark=0;for(let offset=0;offset<data.length;offset+=4){const red=data[offset],green=data[offset+1],blue=data[offset+2];if(Math.max(red,green,blue)-Math.min(red,green,blue)>25)colored++;if(Math.max(red,green,blue)<155)dark++;}
  return {colored,dark,total:data.length/4,nonblank:colored>400&&dark>100};
}
function resize(){const bounds=mount.getBoundingClientRect();renderer.setSize(bounds.width,bounds.height);camera.aspect=bounds.width/bounds.height;camera.updateProjectionMatrix();if(current)frame();}
new ResizeObserver(resize).observe(mount);
element('robot').addEventListener('change',event=>choose(event.target.value));element('task').addEventListener('change',event=>choose(id,event.target.value));element('phase').addEventListener('change',event=>choose(id,task,event.target.value));
element('view').addEventListener('change',event=>{view=event.target.value;frame();});element('focus').addEventListener('change',event=>{focus=event.target.value;frame();});
window.interactionViewer={choose,diagnostics,capture,pixels,refreshLayout:resize,setFocus:value=>{focus=value;element('focus').value=value;frame();},exportSize:(width,height)=>{renderer.setPixelRatio(1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();frame();}};
resize();const params=new URL(location.href).searchParams;choose(params.get('robot')||'R03',params.get('task')||'coral-l4','engage');
renderer.setAnimationLoop(()=>{frames++;controls.update();renderer.render(scene,camera);});