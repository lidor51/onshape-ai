import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildIntake,intakeRecipes,intakePoses} from './intake-models.mjs';
import concepts from '../../../outputs/concepts/concepts.json';

THREE.Object3D.DEFAULT_UP.set(0,0,1);
const mount=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf2f5f3);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;mount.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label','Intake mechanism model');
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,10,15000);camera.up.set(0,0,1);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=250;controls.maxDistance=8000;
scene.add(new THREE.HemisphereLight(0xffffff,0x71817c,2.4));
const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-1800,-2200,3800);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-1500,right:1500,top:1800,bottom:-1800,near:100,far:9000});key.shadow.bias=-0.00015;scene.add(key);
const fill=new THREE.DirectionalLight(0xdde8ef,1.4);fill.position.set(2300,1400,1800);scene.add(fill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000),new THREE.ShadowMaterial({opacity:0.15}));ground.receiveShadow=true;ground.position.z=-2;scene.add(ground);
let model;let selected='01';let pose='open';let view='iso';let frames=0;const boundsCache=new Map();

function dispose(root){if(!root)return;scene.remove(root);root.traverse(object=>{object.geometry?.dispose();if(object.userData.role?.startsWith('coral'))object.material?.dispose();});}
function framingBounds(id){
  if(!boundsCache.has(id)){
    const bounds=new THREE.Box3();
    for(const state of intakePoses){const candidate=buildIntake(id,state);bounds.union(new THREE.Box3().setFromObject(candidate));dispose(candidate);}
    boundsCache.set(id,bounds);
  }
  return boundsCache.get(id);
}
function frame(){
  const bounds=framingBounds(selected);const center=bounds.getCenter(new THREE.Vector3());const radius=bounds.getSize(new THREE.Vector3()).length()/2;
  const direction={iso:new THREE.Vector3(1.4,-1.85,1.3),side:new THREE.Vector3(1,0,0.08),front:new THREE.Vector3(0,-1,0.05),top:new THREE.Vector3(0,-0.001,1)}[view].normalize();
  const vertical=THREE.MathUtils.degToRad(camera.fov);const horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);
  camera.position.copy(center).addScaledVector(direction,radius/Math.sin(Math.min(vertical,horizontal)/2)*1.08);controls.target.copy(center);camera.lookAt(center);controls.update();renderer.render(scene,camera);
}
function choose(id,state=pose){
  if(!intakeRecipes.some(recipe=>recipe.id===id)||!intakePoses.includes(state))throw new Error('Invalid intake selection');
  selected=id;pose=state;dispose(model);model=buildIntake(id,pose);scene.add(model);
  const recipe=intakeRecipes.find(item=>item.id===id);const original=concepts.find(item=>item.id===id);
  document.querySelector('#robot').value=id;document.querySelector('#pose').value=pose;
  document.querySelector('#title').textContent=`${id} / ${recipe.title}`;
  document.querySelector('#description').textContent=original.summary;
  document.querySelector('#stow').textContent=recipe.stowIntent;
  document.querySelector('#risk').textContent=original.risk;
  document.querySelector('#warning').textContent=recipe.warning||'Illustrative poses; contact, retention, collapse and clearance are not verified.';
  document.querySelector('#first-test').textContent=original.firstTest;
  document.querySelector('#receiver').textContent=`Receiver x ${recipe.receiverCenter[0].toFixed(0)} / y ${recipe.receiverCenter[1].toFixed(0)} / z ${recipe.receiverCenter[2].toFixed(0)} mm; mouth intent ${recipe.mouthWidthMm} mm`;
  document.querySelector('#state-sheet').src=`intake-${id}-states.png`;document.querySelector('#state-link').href=`intake-${id}-states.png`;
  document.querySelector('#flow').src=`../concept-${id}.png`;document.querySelector('#flow-link').href=`../concept-${id}.png`;
  document.querySelector('#download').href=`intake-${id}-${pose}.png`;
  document.querySelectorAll('[data-pose]').forEach(element=>{element.querySelector('img').src=`intake-${id}-${element.dataset.pose}.png`;});
  document.querySelectorAll('[data-id]').forEach(element=>element.classList.toggle('selected',element.dataset.id===id));
  document.title=`${id} / Intake Mechanism States`;frame();return diagnostics();
}
function diagnostics(){
  const bounds=new THREE.Box3().setFromObject(model);camera.updateMatrixWorld();const corners=[];
  for(const across of [bounds.min.x,bounds.max.x])for(const rear of [bounds.min.y,bounds.max.y])for(const up of [bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(across,rear,up).project(camera));
  let meshes=0;model.traverse(object=>{if(object.isMesh)meshes++;});
  return {id:selected,pose,frames,meshes,framed:corners.every(point=>Math.abs(point.x)<=1&&Math.abs(point.y)<=1&&point.z>=-1&&point.z<=1),pieceCount:model.userData.pieceCount,flowHref:model.userData.flowHref,size:[renderer.domElement.width,renderer.domElement.height],equalScaleAcrossStates:true};
}
function capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
function pixels(){
  renderer.render(scene,camera);const gl=renderer.getContext();const values=new Uint8Array(renderer.domElement.width*renderer.domElement.height*4);gl.readPixels(0,0,renderer.domElement.width,renderer.domElement.height,gl.RGBA,gl.UNSIGNED_BYTE,values);
  let colored=0;let dark=0;for(let index=0;index<values.length;index+=4){const channels=[values[index],values[index+1],values[index+2]];if(Math.max(...channels)-Math.min(...channels)>25)colored++;if(Math.max(...channels)<155)dark++;}
  return {colored,dark,total:values.length/4,nonblank:colored>500&&dark>100};
}
const resize=()=>{const bounds=mount.getBoundingClientRect();renderer.setSize(bounds.width,bounds.height);camera.aspect=bounds.width/bounds.height;camera.updateProjectionMatrix();if(model)frame();};
new ResizeObserver(resize).observe(mount);
document.querySelector('#robot').addEventListener('change',event=>choose(event.target.value));
document.querySelector('#pose').addEventListener('change',event=>choose(selected,event.target.value));
document.querySelector('#view').addEventListener('change',event=>{view=event.target.value;frame();});
document.querySelectorAll('[data-pose]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();choose(selected,element.dataset.pose);document.querySelector('#viewer').scrollIntoView({behavior:'smooth'});}));
document.querySelectorAll('[data-id]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();choose(element.dataset.id,'open');document.querySelector('#viewer').scrollIntoView({behavior:'smooth'});}));
window.intakeViewer={choose,diagnostics,pixels,capture,frame,refreshLayout:resize,exportSize:(width,height)=>{renderer.setPixelRatio(1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();frame();}};
resize();choose(new URL(location.href).searchParams.get('intake')||'01','open');
renderer.setAnimationLoop(()=>{frames++;controls.update();renderer.render(scene,camera);});