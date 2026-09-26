import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildRobot,recipes,poses} from './models.mjs';
import {buildFieldScene} from './field-scenes.mjs';
import {contentBounds} from './scene-bounds.mjs';
import review from './review.json';
import familyA from '../robots-a.json';
import familyB from '../robots-b.json';
import familyC from '../robots-c.json';
import familyD from '../robots-d.json';

THREE.Object3D.DEFAULT_UP.set(0,0,1);
const catalogue=[...familyA,...familyB,...familyC,...familyD];
const mount=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0xf2f5f3);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.3;
mount.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label','Interactive mechanism model');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,10,15000);camera.up.set(0,0,1);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.1;controls.minDistance=450;controls.maxDistance=8000;
scene.add(new THREE.HemisphereLight(0xffffff,0x71817c,2.4));
const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-1800,-2200,3800);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-2200,right:2200,top:2400,bottom:-2400,near:100,far:9000});key.shadow.bias=-0.00015;
scene.add(key);
const fill=new THREE.DirectionalLight(0xdde8ef,1.4);fill.position.set(2300,1400,1800);scene.add(fill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000),new THREE.ShadowMaterial({opacity:0.16}));ground.receiveShadow=true;ground.position.z=-1;scene.add(ground);
let model;let references;let selected='R03';let pose='travel';let view='iso';let frames=0;

function dispose(group){if(!group)return;scene.remove(group);group.traverse(object=>object.geometry?.dispose());}

function setCamera(){
  const bounds=contentBounds(model,references);const center=bounds.getCenter(new THREE.Vector3());const size=bounds.getSize(new THREE.Vector3());
  const directions={iso:new THREE.Vector3(1.45,-1.85,1.25),side:new THREE.Vector3(1,0,0.18),front:new THREE.Vector3(0,-1,0.05),top:new THREE.Vector3(0,-0.001,1)};
  const direction=directions[view].clone().normalize();
  const verticalFov=THREE.MathUtils.degToRad(camera.fov);const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*camera.aspect);
  const radius=size.length()/2;
  const distance=radius/Math.sin(Math.min(verticalFov,horizontalFov)/2)*1.08;
  controls.maxDistance=Math.max(8000,distance*1.5);
  camera.far=Math.max(15000,distance+radius*3);camera.updateProjectionMatrix();
  camera.position.copy(center).addScaledVector(direction,distance);controls.target.copy(center);camera.lookAt(center);controls.update();
}

function updateText(){
  const robot=catalogue.find(item=>item.id===selected);const assessment=review.robots.find(item=>item.id===selected);
  document.querySelector('#robot-title').textContent=`${selected} / ${robot.title}`;
  document.querySelector('#tier').textContent={contender:'Primary candidate',conditional:'Conditional candidate',contrast:'Lower-reach comparison'}[assessment.tier];
  document.querySelector('#role').textContent=assessment.winningRole;
  document.querySelector('#tradeoff').textContent=assessment.rationale;
  document.querySelector('#next-proof').textContent=assessment.nextProof;
  document.querySelector('#dofs').textContent=assessment.complexity.positioningDofs;
  document.querySelector('#coral-transfers').textContent=assessment.complexity.handoffsCoral;
  document.querySelector('#algae-transfers').textContent=assessment.complexity.handoffsAlgae;
  document.querySelector('#complexity-note').textContent=assessment.complexity.note;
  document.querySelector('#cycles').textContent=assessment.cycleContract.headingHypothesis;
  document.querySelector('#directions').textContent=`Coral: ${assessment.cycleContract.stationSide} station / ${assessment.cycleContract.floorSide} floor / ${assessment.cycleContract.coralScoreSide} score`;
  document.querySelector('#download').href=`robot-${selected}${pose==='coral'?'-score':''}.png`;
  document.querySelector('#state-sheet').src=`states/robot-${selected}-states.png`;
  document.querySelector('#state-sheet-link').href=`states/robot-${selected}-states.png`;
  document.querySelector('#state-sheet-title').textContent=`${selected} / Collapsed and Field Configurations`;
  document.querySelector('#context-title').textContent=references.userData.title;
  document.querySelector('#context-note').textContent=references.userData.note;
  document.querySelectorAll('[data-pose]').forEach(element=>{element.querySelector('img').src=`states/robot-${selected}-${element.dataset.pose}.png`;});
  document.title=`${selected} / Mechanism Concepts`;
  document.querySelectorAll('[data-robot]').forEach(element=>element.classList.toggle('selected',element.dataset.robot===selected));
}

function choose(id,nextPose=pose){
  if(!recipes.some(recipe=>recipe.id===id)||!poses.includes(nextPose))throw new Error('Invalid selection');
  selected=id;pose=nextPose;dispose(model);dispose(references);model=buildRobot(id,pose);scene.add(model);
  references=buildFieldScene(model,recipes.find(recipe=>recipe.id===id),pose);references.visible=document.querySelector('#field').checked;scene.add(references);
  document.querySelector('#robot').value=id;document.querySelector('#pose').value=pose;
  updateText();setCamera();renderer.render(scene,camera);return diagnostics();
}

function diagnostics(){
  const bounds=contentBounds(model,references);let meshes=0;
  model.traverse(object=>{if(object.isMesh)meshes++;});
  camera.updateMatrixWorld();
  const corners=[];for(const across of [bounds.min.x,bounds.max.x])for(const rearward of [bounds.min.y,bounds.max.y])for(const up of [bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(across,rearward,up).project(camera));
  const framed=corners.every(point=>Math.abs(point.x)<=1&&Math.abs(point.y)<=1&&point.z>=-1&&point.z<=1);
  return {id:selected,pose,view,frames,meshes,framed,contextVisible:references.visible,context:references.userData.title,size:[renderer.domElement.width,renderer.domElement.height],bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},status:'ILLUSTRATIVE_MECHANISMS_NOT_VALIDATED_CAD'};
}

function pixels(){
  renderer.render(scene,camera);
  const gl=renderer.getContext();const sample=new Uint8Array(renderer.domElement.width*renderer.domElement.height*4);
  gl.readPixels(0,0,renderer.domElement.width,renderer.domElement.height,gl.RGBA,gl.UNSIGNED_BYTE,sample);
  let colored=0;let dark=0;for(let index=0;index<sample.length;index+=4){const red=sample[index],green=sample[index+1],blue=sample[index+2];if(Math.max(red,green,blue)-Math.min(red,green,blue)>25)colored++;if(Math.max(red,green,blue)<155)dark++;}
  return {colored,dark,total:sample.length/4,nonblank:colored>500&&dark>100};
}

const resize=()=>{const bounds=mount.getBoundingClientRect();renderer.setSize(bounds.width,bounds.height);camera.aspect=bounds.width/bounds.height;camera.updateProjectionMatrix();if(model)setCamera();};
new ResizeObserver(resize).observe(mount);
document.querySelector('#robot').addEventListener('change',event=>choose(event.target.value));
document.querySelector('#pose').addEventListener('change',event=>choose(selected,event.target.value));
document.querySelector('#view').addEventListener('change',event=>{view=event.target.value;setCamera();});
document.querySelector('#field').addEventListener('change',event=>{references.visible=event.target.checked;setCamera();});
document.querySelectorAll('[data-robot]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();choose(element.dataset.robot,'travel');document.querySelector('#viewer').scrollIntoView({behavior:'smooth'});}));
document.querySelectorAll('[data-pose]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();choose(selected,element.dataset.pose);document.querySelector('#viewer').scrollIntoView({behavior:'smooth'});}));
window.mechanismViewer={choose,diagnostics,pixels,refreshLayout:resize,frame:()=>{setCamera();renderer.render(scene,camera);},setView:next=>{view=next;document.querySelector('#view').value=next;setCamera();},exportSize:(width,height)=>{renderer.setPixelRatio(1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();setCamera();},capture:()=>{renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}};
resize();choose(new URL(location.href).searchParams.get('robot')||'R03','coral');
renderer.setAnimationLoop(()=>{frames++;controls.update();renderer.render(scene,camera);});
window.addEventListener('error',event=>{document.querySelector('#status').textContent=`Viewer error: ${event.message}`;});