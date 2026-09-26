import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {OrbitControls} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {sourceAssembly,sourceFrame} from './reference-model.mjs';

const scene=new THREE.Scene();scene.background=new THREE.Color('#e9eeec');
const camera=new THREE.PerspectiveCamera(35,1,0.001,100);camera.up.fromArray(sourceFrame.up);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));document.querySelector('main').append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x64726e,2.5));
const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(2,5,3);scene.add(light);
const {root,measurements,sourcePartCount}=await sourceAssembly(window.referencePayload);scene.add(root);
let bounds;
function render(){renderer.render(scene,camera);}
function fit(){
  const selected=document.querySelector('#stage').value;
  bounds=new THREE.Box3();root.children.forEach(child=>{child.visible=selected==='both'||child.userData.group===selected;if(child.visible)bounds.expandByObject(child,true);});
  const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());
  const direction={iso:[1,0.8,1],side:[1,0,0],front:[0,0,1],top:[0,1,0]}[document.querySelector('#view').value];
  const forward=new THREE.Vector3(...direction).normalize();camera.up.set(0,Math.abs(forward.y)>0.99?0:1,Math.abs(forward.y)>0.99?-1:0);
  const right=new THREE.Vector3().crossVectors(camera.up,forward).normalize();
  const vertical=new THREE.Vector3().crossVectors(forward,right).normalize();const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  let distance=0;
  for(const horizontal of [-1,1])for(const depth of [-1,1])for(const height of [-1,1]){
    const corner=new THREE.Vector3(horizontal*size.x/2,depth*size.y/2,height*size.z/2);
    distance=Math.max(distance,Math.max(Math.abs(corner.dot(right))/(tangent*camera.aspect),Math.abs(corner.dot(vertical))/tangent)+corner.dot(forward));
  }
  distance*=1.12;camera.position.copy(center).addScaledVector(forward,distance);
  controls.target.copy(center);controls.maxDistance=distance*5;camera.far=Math.max(100,distance*10);camera.updateProjectionMatrix();controls.update();
  document.querySelector('#bounds').textContent=size.multiplyScalar(1000).toArray().map(value=>value.toFixed(1)).join(' x ')+' mm';render();
}
function resize(){const area=document.querySelector('main').getBoundingClientRect();renderer.setSize(area.width,area.height);camera.aspect=area.width/area.height;camera.updateProjectionMatrix();fit();}
controls.addEventListener('change',render);
document.querySelector('#stage').addEventListener('change',fit);document.querySelector('#view').addEventListener('change',fit);
window.addEventListener('resize',resize);resize();
document.querySelector('#status').textContent=`${sourcePartCount} source bodies / ${root.children.length} occurrences`;
window.referenceInspection={ready:true,measurements,render,fit,resize,canvas:renderer.domElement,sourcePartCount,occurrences:root.children.length};