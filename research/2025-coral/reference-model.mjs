import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

export const sourceFrame={up:[0,1,0],widthAxis:'X',foreAftAxis:'Z',evidenceParts:['JFv','JFz','JFr','JF3','KF3n']};

export function placedParts(definition,available){
  const assemblies=new Map([definition.rootAssembly,...definition.subAssemblies].map(assembly=>[assembly.elementId,assembly]));
  const result=[];
  for(const occurrence of definition.rootAssembly.occurrences){
    let assembly=definition.rootAssembly;let instance;const names=[];const elements=[];
    for(const id of occurrence.path){
      instance=assembly.instances.find(candidate=>candidate.id===id);
      if(!instance)throw new Error('Missing native occurrence instance');
      names.push(instance.name);
      if(instance.type==='Assembly'){elements.push(instance.elementId);assembly=assemblies.get(instance.elementId);}
    }
    if(instance.type!=='Part'||!available.has(instance.partId)||occurrence.hidden)continue;
    const group=elements.includes('befa12a91dd2f83dec7fac8c')?'indexer':elements.includes('27d1bd01f3647ce048478b9f')?'pickup':elements.includes('4711e6fc676ebb7fceb3e769')?'receiver':elements.includes('482de263123d71210f0c54aa')?'chassis':undefined;
    if(!group)continue;
    if(occurrence.transform.length!==16||!occurrence.transform.every(Number.isFinite))throw new Error('Invalid native transform');
    result.push({partId:instance.partId,name:names.join(' / '),path:occurrence.path,transform:occurrence.transform,group,elements});
  }
  return result;
}

export async function sourceAssembly(payload){
  const templates=new Map();const loader=new GLTFLoader();
  for(const source of payload.geometry){
    if(source.buffers.some(buffer=>!buffer.uri?.startsWith('data:')))throw new Error('External reference buffer refused');
    const parsed=await loader.parseAsync(JSON.stringify(source),'');
    parsed.scene.traverse(object=>{
      const association=parsed.parser.associations.get(object);
      if(association?.nodes===undefined)return;
      const partId=source.nodes[association.nodes].extensions?.PTC_onshape_metadata?.id?.[0];
      if(partId)templates.set(partId,object);
    });
  }
  const root=new THREE.Group();const measurements=[];
  for(const occurrence of placedParts(payload.definition,new Set(templates.keys()))){
    const holder=new THREE.Group();holder.matrixAutoUpdate=false;
    holder.matrix.set(...occurrence.transform);
    if(Math.abs(holder.matrix.determinant()-1)>1e-5)throw new Error('Non-rigid native occurrence');
    const body=templates.get(occurrence.partId).clone(true);holder.add(body);root.add(holder);
    holder.userData=occurrence;holder.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(holder,true);
    if(bounds.isEmpty())throw new Error('Empty source mesh');
    const center=bounds.getCenter(new THREE.Vector3()).multiplyScalar(1000).toArray();
    const size=bounds.getSize(new THREE.Vector3()).multiplyScalar(1000).toArray();
    measurements.push({...occurrence,centerMm:center,sizeMm:size,minMm:bounds.min.clone().multiplyScalar(1000).toArray(),maxMm:bounds.max.clone().multiplyScalar(1000).toArray()});
  }
  return {root,measurements,sourcePartCount:templates.size};
}