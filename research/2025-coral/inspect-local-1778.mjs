import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function inspectLocal1778(path){
  if(statSync(path).size>400*1024*1024)throw new Error('Local reference exceeds 400 MiB parser bound');
  const bytes=readFileSync(path);
  const source=JSON.parse(bytes.toString('utf8'));
  if(source.asset?.version!=='2.0'||!Array.isArray(source.nodes))throw new Error('Expected GLTF 2.0 node graph');
  const parents=new Map();
  source.nodes.forEach((node,index)=>(node.children??[]).forEach(child=>{
    if(!source.nodes[child])throw new Error('Missing child node');
    if(!parents.has(child))parents.set(child,[]);parents.get(child).push(index);
  }));
  const nodes=source.nodes.map((node,index)=>({index,name:node.name??'',mesh:node.mesh,children:node.children??[],parents:parents.get(index)??[],matrix:node.matrix,translation:node.translation,rotation:node.rotation,scale:node.scale,metadata:node.extensions?.PTC_onshape_metadata}));
  return {source,receipt:{path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),asset:source.asset,extensionsUsed:source.extensionsUsed,scenes:source.scenes,nodes,meshCount:source.meshes?.length,bufferCount:source.buffers?.length,buffers:source.buffers?.map(buffer=>({byteLength:buffer.byteLength,embedded:buffer.uri?.startsWith('data:')})),sourceUnmodified:true,nativeMatesInspected:false}};
}

if(import.meta.main){
  const path=process.argv[2];if(!path)throw new Error('Provide the user-supplied GLTF path');
  const {receipt}=inspectLocal1778(path);const output=new URL('../../.cache/reference-cad/1778/',import.meta.url);mkdirSync(output,{recursive:true});
  writeFileSync(new URL('local-file-receipt.json',output),JSON.stringify(receipt,null,2));
  console.log(JSON.stringify({bytes:receipt.bytes,sha256:receipt.sha256,meshes:receipt.meshCount,nodes:receipt.nodes.length,buffers:receipt.buffers,roots:receipt.nodes.filter(node=>!node.parents.length).slice(0,20),namedCandidates:receipt.nodes.filter(node=>/intake|coral|manip|grip|roller|wrist|index|elevator|arm/i.test(node.name)).slice(0,60),receipt:fileURLToPath(new URL('local-file-receipt.json',output))},null,2));
}