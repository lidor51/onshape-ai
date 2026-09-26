import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {OrbitControls} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {systemTransform,systemGroup} from './system-motion.mjs';

const data=window.systemData;
const scene=new THREE.Scene();scene.background=new THREE.Color('#edf1ef');
const camera=new THREE.PerspectiveCamera(36,1,1,20000);camera.up.set(0,0,1);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));document.querySelector('main').append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);scene.add(new THREE.HemisphereLight(0xffffff,0x61716b,2.4));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(1500,-2000,3000);scene.add(light);
const geometries=new Map();
for(const [name,definition] of Object.entries(data.mesh.definitions)){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(definition.positions,3));geometry.setIndex(definition.indices);geometry.computeVertexNormals();geometries.set(name,geometry);}
const root=new THREE.Group();scene.add(root);const failParts=new Set(data.failPairs.flatMap(pair=>[pair.first,pair.second]));
const palette={pickup:'#a8c4c0',indexer:'#a5b9cd',dock:'#bec7c6',drives:'#cb783e',mounts:'#c0c7ca'};
for(const part of data.mesh.instances){
  const definition=data.mesh.definitions[part.definition];let color=palette[systemGroup(part)];
  if(/motor/.test(part.role))color='#d4773d';else if(/outer_elastomer|compliant_contact/.test(part.role))color='#39905c';else if(definition.material==='polycarbonate')color='#d4b250';else if(part.reference_only)color='#c56a91';
  const normal=new THREE.MeshStandardMaterial({color,roughness:0.65,metalness:0.1,transparent:part.reference_only,opacity:part.reference_only?0.18:1,depthWrite:!part.reference_only});
  const body=new THREE.Mesh(geometries.get(part.definition),normal);body.name=part.id;body.matrixAutoUpdate=false;body.userData={part,normal,definition};root.add(body);
}
const warning=new THREE.MeshStandardMaterial({color:'#d43f34',roughness:0.6});
const grid=new THREE.GridHelper(1800,18,'#acbcb4','#d8e2dc');grid.rotateX(Math.PI/2);scene.add(grid);
const pieceShape=new THREE.Shape();pieceShape.absarc(0,0,57.15,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,50.8,0,Math.PI*2,true);pieceShape.holes.push(hole);const pieceGeometry=new THREE.ExtrudeGeometry(pieceShape,{depth:301.625,bevelEnabled:false,curveSegments:32});pieceGeometry.translate(0,0,-150.8125);
const pipe=new THREE.Mesh(pieceGeometry,new THREE.MeshStandardMaterial({color:'#fffefd',roughness:0.8}));scene.add(pipe);
function update(refit=true){
  const angle=Number(document.querySelector('#deploy').value),floating=-Number(document.querySelector('#float').value),module=document.querySelector('#module').value;
  for(const body of root.children){const part=body.userData.part;body.matrix.copy(systemTransform(part,angle,floating));body.visible=(module==='all'||systemGroup(part)===module)&&(!part.reference_only||document.querySelector('#spaces').checked);body.material=document.querySelector('#failures').checked&&failParts.has(part.id)?warning:body.userData.normal;}
  root.updateMatrixWorld(true);document.querySelector('#angle').value=`${angle} deg`;document.querySelector('#floatAngle').value=`${floating} deg`;
  const piece=document.querySelector('#piece').value;pipe.visible=piece!=='none';pipe.rotation.set(0,0,0);
  if(piece==='floor'){pipe.rotation.y=Math.PI/2;pipe.position.set(0,-365,57.15);}else{pipe.rotation.x=-Math.PI/2;pipe.position.set(0,385,191);}
  const shown=root.children.filter(body=>body.visible);document.querySelector('#visible').textContent=`${shown.filter(body=>!body.userData.part.reference_only).length} physical / ${shown.filter(body=>body.userData.part.reference_only).length} reference`;
  if(refit){fit();return;}renderer.render(scene,camera);
}
function fit(){
  update(false);const bounds=new THREE.Box3();root.children.forEach(body=>{if(body.visible)bounds.expandByObject(body,true);});if(pipe.visible)bounds.expandByObject(pipe,true);
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const direction={iso:[1,-1,0.8],side:[1,0,0],front:[0,-1,0],top:[0,0,1]}[document.querySelector('#view').value];const forward=new THREE.Vector3(...direction).normalize();camera.up.set(0,Math.abs(forward.z)>0.99?1:0,Math.abs(forward.z)>0.99?0:1);
  const right=new THREE.Vector3().crossVectors(camera.up,forward).normalize(),vertical=new THREE.Vector3().crossVectors(forward,right).normalize(),tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=0;
  for(const horizontal of [-1,1])for(const depth of [-1,1])for(const height of [-1,1]){const point=new THREE.Vector3(horizontal*size.x/2,depth*size.y/2,height*size.z/2);distance=Math.max(distance,Math.max(Math.abs(point.dot(right))/(tangent*camera.aspect),Math.abs(point.dot(vertical))/tangent)+point.dot(forward));}
  distance*=1.12;camera.position.copy(center).addScaledVector(forward,distance);controls.target.copy(center);controls.maxDistance=distance*4;camera.far=distance*12;camera.updateProjectionMatrix();controls.update();renderer.render(scene,camera);
}
function resize(){const box=document.querySelector('main').getBoundingClientRect();renderer.setSize(box.width,box.height);camera.aspect=box.width/box.height;fit();}
for(const id of ['deploy','float','module','piece','spaces','failures'])document.querySelector('#'+id).addEventListener('input',()=>update());
document.querySelector('#view').addEventListener('change',fit);window.addEventListener('resize',resize);controls.addEventListener('change',()=>renderer.render(scene,camera));resize();
window.completeSystem={ready:true,update,fit,resize,canvas:renderer.domElement,instances:root.children.length,physical:root.children.filter(body=>!body.userData.part.reference_only).length,root};