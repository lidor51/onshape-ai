import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {inspectLocal1778} from './inspect-local-1778.mjs';
import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

export function subsetGltf(source,roots){
  const keep=new Set([0]);
  function descend(index){if(keep.has(index))return;keep.add(index);for(const child of source.nodes[index].children??[])descend(child);}
  roots.forEach(descend);
  const nodeIds=[...keep].sort((first,second)=>first-second),nodeMap=new Map(nodeIds.map((index,offset)=>[index,offset]));
  const meshIds=[...new Set(nodeIds.map(index=>source.nodes[index].mesh).filter(index=>index!==undefined))],meshMap=new Map(meshIds.map((index,offset)=>[index,offset]));
  const accessorIds=new Set();
  for(const index of meshIds)for(const primitive of source.meshes[index].primitives){if(primitive.indices!==undefined)accessorIds.add(primitive.indices);Object.values(primitive.attributes).forEach(index=>accessorIds.add(index));if(primitive.targets||primitive.extensions)throw new Error('Unsupported primitive extensions or morph targets');}
  const accessorMap=new Map([...accessorIds].map((index,offset)=>[index,offset]));
  const views=[...new Set([...accessorIds].map(index=>{if(source.accessors[index].sparse)throw new Error('Sparse accessor not supported');return source.accessors[index].bufferView;}))];
  const viewMap=new Map(views.map((index,offset)=>[index,offset]));
  const buffers=source.buffers.map(buffer=>{const match=/^data:[^,]*;base64,(.*)$/s.exec(buffer.uri??'');if(!match)throw new Error('Only embedded source buffers accepted');return Buffer.from(match[1],'base64');});
  const chunks=[];let offset=0;
  const bufferViews=views.map(index=>{const view=source.bufferViews[index],padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}const start=offset;chunks.push(buffers[view.buffer].subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength));offset+=view.byteLength;return {...view,buffer:0,byteOffset:start};});
  return {asset:source.asset,extensionsUsed:source.extensionsUsed,extensions:source.extensions,materials:source.materials,
    accessors:[...accessorIds].map(index=>({...source.accessors[index],bufferView:viewMap.get(source.accessors[index].bufferView)})),bufferViews,
    buffers:[{byteLength:offset,uri:'data:application/octet-stream;base64,'+Buffer.concat(chunks).toString('base64')}],
    meshes:meshIds.map(index=>({...source.meshes[index],primitives:source.meshes[index].primitives.map(primitive=>({...primitive,indices:primitive.indices===undefined?undefined:accessorMap.get(primitive.indices),attributes:Object.fromEntries(Object.entries(primitive.attributes).map(([key,index])=>[key,accessorMap.get(index)]))}))})),
    nodes:nodeIds.map(index=>{const node=source.nodes[index];if(node.skin!==undefined)throw new Error('Skinned mesh unsupported');return {...node,mesh:node.mesh===undefined?undefined:meshMap.get(node.mesh),children:node.children?.filter(child=>keep.has(child)).map(child=>nodeMap.get(child)),extras:{...node.extras,sourceNodeIndex:index}};}),scenes:[{nodes:[nodeMap.get(0)]}],scene:0};
}

export async function extract(path){
  const {source,receipt}=inspectLocal1778(path);
  for(const [index,name] of [[1637,'Intake Assembly <1>'],[132,'Arm Assembly <1>'],[1,'Drivetrain Assembly <1>']])if(source.nodes[index].name!==name)throw new Error('Selected source group changed');
  const selected=subsetGltf(source,[1,132,1637]);
  globalThis.ProgressEvent??=class extends Event{constructor(type,options){super(type);Object.assign(this,options);}};
  const parsed=await new GLTFLoader().parseAsync(JSON.stringify(selected),'');parsed.scene.updateMatrixWorld(true);
  const measurements=[];
  parsed.scene.traverse(object=>{const sourceIndex=object.userData.sourceNodeIndex;if(sourceIndex===undefined||source.nodes[sourceIndex].mesh===undefined)return;const extent=new THREE.Box3().setFromObject(object,true);let node=object;const ancestry=[];while(node){if(node.userData.sourceNodeIndex!==undefined)ancestry.push({index:node.userData.sourceNodeIndex,name:source.nodes[node.userData.sourceNodeIndex].name});node=node.parent;}
    measurements.push({name:object.name,ancestry,matrix:object.matrixWorld.toArray(),minMm:extent.min.clone().multiplyScalar(1000).toArray(),maxMm:extent.max.clone().multiplyScalar(1000).toArray(),sizeMm:extent.getSize(new THREE.Vector3()).multiplyScalar(1000).toArray()});});
  const directory=new URL('../../.cache/reference-cad/1778/',import.meta.url);mkdirSync(directory,{recursive:true});
  writeFileSync(new URL('intake-arm-chassis.gltf',directory),JSON.stringify(selected));
  writeFileSync(new URL('local-measurements.json',directory),JSON.stringify({sourceSha256:receipt.sha256,sourceBytes:receipt.bytes,units:'GLTF meters converted to mm; world transforms preserved',selectedRoots:[1,132,1637],nativeJointMotion:false,measurements},null,2));
  console.log(JSON.stringify({sourceSha256:receipt.sha256,nodes:selected.nodes.length,meshes:selected.meshes.length,bufferBytes:selected.buffers[0].byteLength,meshOccurrences:measurements.length,output:fileURLToPath(directory),namedExamples:measurements.filter(item=>/IntakePlate|IntakeAxle|ManipulatorPlate|Kraken/.test(item.name)).map(item=>({name:item.name,sizeMm:item.sizeMm})).slice(0,15)},null,2));
}
if(import.meta.main)await extract(process.argv[2]);