import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {OrbitControls} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {partMatrix} from '../coral-intake-v1/checkpoint-motion.mjs';

const data=window.pickupData;
const config=data.pickup.settings;
const settings={pickup:{pivot_yz:config.pivot_yz,rollers:[{id:'middle',yz:config.middle_yz}]}};
const scene=new THREE.Scene();scene.background=new THREE.Color('#eef2f0');
const camera=new THREE.PerspectiveCamera(35,1,1,20000);camera.up.set(0,0,1);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));document.querySelector('#scene').append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x6b7870,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(1000,-2000,2500);scene.add(light);
const root=new THREE.Group();const references=new THREE.Group();scene.add(root,references);
const geometries=new Map();
function geometry(name,definition){
  if(geometries.has(name))return geometries.get(name);
  const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(definition.positions,3));result.setIndex(definition.indices);result.computeVertexNormals();result.computeBoundingBox();geometries.set(name,result);return result;
}
const colors={outer_elastomer:'#3a9964',fastener:'#667176',spacer:'#a2b3b8',hard_hub:'#596766',bearing:'#a0a8ab',pivot_support:'#df9d47'};
for(const part of data.pickup.instances){
  const body=new THREE.Mesh(geometry(part.definition,data.pickup.definitions[part.definition]),new THREE.MeshStandardMaterial({color:colors[part.category]??'#c4ced2',metalness:0.12,roughness:0.7}));body.userData=part;body.matrixAutoUpdate=false;root.add(body);
}
const referenceMaterial=new THREE.MeshStandardMaterial({color:'#748fa0',transparent:true,opacity:0.22,depthWrite:false,roughness:0.8});
for(const part of data.references.instances){const body=new THREE.Mesh(geometry('reference/'+part.definition,data.references.meshes[part.definition]),referenceMaterial);body.matrixAutoUpdate=false;body.matrix.set(...part.matrix.flat());references.add(body);}
const oldTube=new THREE.Mesh(geometry('oldTube',data.oldTube.geometry),new THREE.MeshStandardMaterial({color:'#b3463d',transparent:true,opacity:0.85}));oldTube.matrixAutoUpdate=false;oldTube.visible=false;scene.add(oldTube);
const context=new THREE.Group();scene.add(context);
function frameBox(size,center,color){const body=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,transparent:true,opacity:0.35,depthWrite:false}));body.position.set(...center);context.add(body);}
frameBox([870,85,120],[0,-42.5,105],'#a6464a');frameBox([700,25,40],[0,12.5,45],'#526773');
const grid=new THREE.GridHelper(1600,16,'#9cafa7','#d2dfd8');grid.rotateX(Math.PI/2);scene.add(grid);
const section=new THREE.Shape();section.absarc(0,0,57.15,0,Math.PI*2,false);const bore=new THREE.Path();bore.absarc(0,0,50.8,0,Math.PI*2,true);section.holes.push(bore);
const pipeGeometry=new THREE.ExtrudeGeometry(section,{depth:301.625,bevelEnabled:false,curveSegments:32});pipeGeometry.translate(0,0,-301.625/2);
const pipe=new THREE.Mesh(pipeGeometry,new THREE.MeshStandardMaterial({color:'#fffdfa',roughness:0.8}));scene.add(pipe);
let fitBounds;
function update(refit=true){
  const fold=-Number(document.querySelector('#fold').value);const floating=-Number(document.querySelector('#float').value);
  root.children.forEach(body=>body.matrix.copy(partMatrix(body.userData,settings,fold,floating)));root.updateMatrixWorld(true);
  oldTube.matrix.copy(partMatrix({...data.oldTube.instance,motion:'fold'},settings,fold));oldTube.visible=document.querySelector('#old').checked;
  references.visible=document.querySelector('#reference').checked;context.visible=document.querySelector('#context').checked;
  const yaw=Number(document.querySelector('#yaw').value)*Math.PI/180;
  pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(Math.sin(yaw),Math.cos(yaw),0));pipe.position.set(0,Number(document.querySelector('#approach').value),57.15);
  pipe.visible=document.querySelector('#piece').checked;
  document.querySelector('#foldValue').value=`${fold} deg`;document.querySelector('#floatValue').value=`${floating} deg`;document.querySelector('#approachValue').value=`${pipe.position.y} mm`;
  if(refit&&document.querySelector('#framing').value==='current'){frame();return;}
  renderer.render(scene,camera);
}
function frame(){
  if(!fitBounds){fitBounds=new THREE.Box3(new THREE.Vector3(-440,-610,0),new THREE.Vector3(440,580,400));for(const body of root.children)for(const fold of config.fold_angles)fitBounds.union(body.geometry.boundingBox.clone().applyMatrix4(partMatrix(body.userData,settings,fold,-8)));}
  let selectedBounds=fitBounds;
  if(document.querySelector('#framing').value==='current'){
    update(false);selectedBounds=new THREE.Box3().setFromObject(root,true);
    if(references.visible)selectedBounds.expandByObject(references,true);
    if(context.visible)selectedBounds.expandByObject(context,true);
    if(pipe.visible)selectedBounds.expandByObject(pipe,true);
    if(oldTube.visible)selectedBounds.expandByObject(oldTube,true);
  }
  const center=selectedBounds.getCenter(new THREE.Vector3()),size=selectedBounds.getSize(new THREE.Vector3());
  const direction={iso:[1,-1,0.8],side:[1,0,0],front:[0,-1,0],top:[0,0,1]}[document.querySelector('#view').value];const forward=new THREE.Vector3(...direction).normalize();camera.up.set(0,Math.abs(forward.z)>0.99?1:0,Math.abs(forward.z)>0.99?0:1);
  const right=new THREE.Vector3().crossVectors(camera.up,forward).normalize(),vertical=new THREE.Vector3().crossVectors(forward,right).normalize();const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=0;
  for(const horizontal of [-1,1])for(const depth of [-1,1])for(const height of [-1,1]){const corner=new THREE.Vector3(horizontal*size.x/2,depth*size.y/2,height*size.z/2);distance=Math.max(distance,Math.max(Math.abs(corner.dot(right))/(tangent*camera.aspect),Math.abs(corner.dot(vertical))/tangent)+corner.dot(forward));}
  distance*=1.1;camera.position.copy(center).addScaledVector(forward,distance);controls.target.copy(center);controls.maxDistance=distance*4;camera.far=distance*12;camera.updateProjectionMatrix();controls.update();update(false);
}
function resize(){const bounds=document.querySelector('#scene').getBoundingClientRect();renderer.setSize(bounds.width,bounds.height);camera.aspect=bounds.width/bounds.height;frame();}
for(const id of ['fold','float','approach','yaw','old','reference','context','piece'])document.querySelector('#'+id).addEventListener('input',update);
document.querySelector('#view').addEventListener('change',frame);document.querySelector('#framing').addEventListener('change',frame);controls.addEventListener('change',()=>renderer.render(scene,camera));window.addEventListener('resize',resize);resize();
window.pickupInspection={ready:true,instances:root.children.length,references:references.children.length,canvas:renderer.domElement,update,frame,resize};