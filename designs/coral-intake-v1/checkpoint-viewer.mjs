import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {OrbitControls} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {partMatrix} from './checkpoint-motion.mjs';

const {manifest,meshes}=window.checkpointData;
const settings=manifest.settings;
const scene=new THREE.Scene();scene.background=new THREE.Color('#edf1f0');
const camera=new THREE.PerspectiveCamera(35,1,1,20000);camera.up.set(0,0,1);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
document.querySelector('#scene').append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;
scene.add(new THREE.HemisphereLight(0xffffff,0x647168,2.3));
const lamp=new THREE.DirectionalLight(0xffffff,3);lamp.position.set(1500,-2000,2500);scene.add(lamp);
const geometries=new Map();
for(const [name,data] of Object.entries(meshes)){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));geometry.setIndex(data.indices);geometry.computeVertexNormals();geometry.computeBoundingBox();geometries.set(name,geometry);
}
const root=new THREE.Group();scene.add(root);
const colors={compliant_contact:'#3c9563',motor:'#ce7442',belt:'#333c39',gear:'#b8b7aa',fastener:'#626c71',spacer:'#aab9bf',sensor_envelope:'#53a9ad'};
const materials=new Map();
function material(part){const color=colors[part.role]??'#bfcacd';if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.62,metalness:0.18}));return materials.get(color);}
for(const part of manifest.instances){const body=new THREE.Mesh(geometries.get(part.definition),material(part));body.name=part.id;body.userData=part;body.matrixAutoUpdate=false;root.add(body);}
const context=new THREE.Group();scene.add(context);
function referenceBox(name,size,center,color,opacity=0.3){const body=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,transparent:true,opacity,depthWrite:false}));body.position.set(...center);body.name=name;context.add(body);return body;}
referenceBox('Reference front frame',[700,25,40],[0,12.5,45],'#687c80',0.7);
referenceBox('Reference bumper',[870,85,120],[0,-42.5,105],'#9f4546',0.42);
const floor=new THREE.GridHelper(1600,16,'#a4b8b0','#d3ded9');floor.rotateX(Math.PI/2);scene.add(floor);
const pipeSection=new THREE.Shape();pipeSection.absarc(0,0,57.15,0,Math.PI*2,false);const bore=new THREE.Path();bore.absarc(0,0,50.8,0,Math.PI*2,true);pipeSection.holes.push(bore);
const pipeGeometry=new THREE.ExtrudeGeometry(pipeSection,{depth:301.625,bevelEnabled:false,curveSegments:32});pipeGeometry.translate(0,0,-301.625/2);
const piece=new THREE.Mesh(pipeGeometry,new THREE.MeshStandardMaterial({color:'#fffefd',roughness:0.8}));scene.add(piece);
const frames=new Map();
function selected(part){const value=document.querySelector('#module').value;return value==='all'||part.module===value;}
function update(){
  const fold=-Number(document.querySelector('#fold').value);const floating=-Number(document.querySelector('#float').value);
  document.querySelector('#fold-value').value=`${fold} deg`;document.querySelector('#float-value').value=`${floating} deg`;
  root.children.forEach(body=>{body.matrix.copy(partMatrix(body.userData,settings,fold,floating));body.visible=selected(body.userData);});root.updateMatrixWorld(true);
  const piecePose=document.querySelector('#piece').value;piece.visible=piecePose!=='none';piece.rotation.set(0,0,0);
  if(piecePose==='floor'){piece.rotation.y=Math.PI/2;piece.position.set(0,-224,57.15);}
  if(piecePose==='crest'){piece.rotation.y=Math.PI/2;piece.position.set(0,-42.5,226.15);}
  if(piecePose==='seated'){piece.rotation.x=-Math.PI/2;piece.position.set(0,385,191);}
  context.visible=document.querySelector('#context').checked;
  renderer.render(scene,camera);
}
function stableBounds(){
  const key=document.querySelector('#module').value;if(frames.has(key))return frames.get(key).clone();
  const result=new THREE.Box3();
  for(const body of root.children){if(!selected(body.userData))continue;for(const fold of [0,-20,-40,-60,-80,-100,-123])for(const floating of [0,-8])result.union(body.geometry.boundingBox.clone().applyMatrix4(partMatrix(body.userData,settings,fold,floating)));}
  if(key==='all')result.union(new THREE.Box3(new THREE.Vector3(-435,-400,0),new THREE.Vector3(435,760,500)));
  frames.set(key,result.clone());return result;
}
function fit(){
  const bounds=stableBounds();const center=bounds.getCenter(new THREE.Vector3());const size=bounds.getSize(new THREE.Vector3());
  const direction={iso:[1,-1,0.85],side:[1,0,0],front:[0,-1,0],top:[0,0,1]}[document.querySelector('#view').value];
  const forward=new THREE.Vector3(...direction).normalize();camera.up.set(0,Math.abs(forward.z)>0.99?1:0,Math.abs(forward.z)>0.99?0:1);
  const right=new THREE.Vector3().crossVectors(camera.up,forward).normalize();const vertical=new THREE.Vector3().crossVectors(forward,right).normalize();const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=0;
  for(const horizontal of [-1,1])for(const depth of [-1,1])for(const height of [-1,1]){const corner=new THREE.Vector3(horizontal*size.x/2,depth*size.y/2,height*size.z/2);distance=Math.max(distance,Math.max(Math.abs(corner.dot(right))/(tangent*camera.aspect),Math.abs(corner.dot(vertical))/tangent)+corner.dot(forward));}
  distance*=1.12;camera.position.copy(center).addScaledVector(forward,distance);controls.target.copy(center);controls.maxDistance=distance*5;camera.far=distance*15;camera.updateProjectionMatrix();controls.update();update();
}
function resize(){const area=document.querySelector('#scene').getBoundingClientRect();renderer.setSize(area.width,area.height);camera.aspect=area.width/area.height;fit();}
for(const id of ['fold','float','piece','context'])document.querySelector('#'+id).addEventListener('input',update);
for(const id of ['module','view'])document.querySelector('#'+id).addEventListener('change',fit);
controls.addEventListener('change',()=>renderer.render(scene,camera));window.addEventListener('resize',resize);resize();
window.cadCheckpoint={ready:true,manifest,update,fit,resize,canvas:renderer.domElement,instanceCount:root.children.length};