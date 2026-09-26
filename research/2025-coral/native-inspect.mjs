import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadCredentials} from '../../trials/native-api/transport.mjs';
import {Ledger,readLedger,requireThat,sha256} from '../../trials/subsystem-ab/api/ledger.mjs';
import {loadSchema} from '../../trials/subsystem-ab/api/schema.mjs';
import {createTransport,ORIGIN} from '../../trials/subsystem-ab/api/transport.mjs';

const ledgerPath=fileURLToPath(new URL('../../trials/subsystem-ab/api/ledger.json',import.meta.url));
const cache=new URL('../../.cache/reference-cad/',import.meta.url);
const prefix='reference-inspection-20260918';
export const references={
  '1690':{did:'76609fe05a6594c5f9c4062a',wid:'437a97728f1629348e9dd7cf',eid:'465d3a35c190dab8355f1e5c'},
  '1778':{did:'07beed2a16f5d7898cc42c9c',wid:'a74e4d796ba952dabae8ff7e',eid:'42c6b0e68334934d197bf369'},
};
const allowed=new Set(['getDocument','getCurrentMicroversion','getElementsInDocument','getAssemblyDefinition','getPartStudioBodyDetails','getPartsWMVE','exportPartStudioGltf','getPartStudioBoundingBoxes','downloadFileWorkspace']);

export function recoverReadFailure(data,nextOperation){
  const halt=data.halt;const entry=data.attempts.at(-1);
  requireThat(halt?.sequence===entry?.sequence&&halt.code==='HTTP_500'&&entry.method==='GET'&&entry.key.startsWith(prefix)&&entry.operation==='getAssemblyDefinition'&&nextOperation==='getElementsInDocument','READ_RECOVERY_SCOPE');
  data.referenceReadRecoveries??=[];requireThat(data.referenceReadRecoveries.length<1,'READ_RECOVERY_LIMIT');
  data.referenceReadRecoveries.push({...halt,recordedAt:new Date().toISOString(),nextOperation,reason:'Known read-only assembly HTTP500; inspect element metadata, not replay failed call.'});delete data.halt;
}

export function recoverDownloadRead(data,team,operation){
  const entry=data.attempts.at(-1);
  requireThat(data.halt?.code==='UNKNOWN_OUTCOME'&&data.halt.sequence===entry?.sequence&&entry.operation==='downloadFileWorkspace'&&entry.method==='GET'&&entry.key.startsWith(`${prefix}-1778-`)&&team==='1690'&&operation==='getAssemblyDefinition'&&!data.referenceDownloadRecovery,'READ_ALTERNATIVE_SCOPE');
  data.referenceDownloadRecovery={...data.halt,recordedAt:new Date().toISOString(),reason:'No file saved from non-mutating GET; do not retry blob. Inspect a different document via reduced JSON definition.'};delete data.halt;
}

export function closeUnavailableReference(data,team,operation){
  const entry=data.attempts.at(-1);
  requireThat(data.halt?.code==='HTTP_500'&&data.halt.sequence===entry?.sequence&&entry.method==='GET'&&entry.key===`${prefix}-1778-getAssemblyDefinition-${references['1778'].eid}-minimal`&&team==='1690'&&operation==='exportPartStudioGltf'&&!data.closedReferences?.['1778'],'REFERENCE_CLOSE_SCOPE');
  data.closedReferences={...data.closedReferences,'1778':{...data.halt,recordedAt:new Date().toISOString(),reason:'Full and reduced assembly definitions failed; no further requests to this reference.'}};
  delete data.halt;
}

export function subassemblyPartIds(definition,elementId){
  const assemblies=new Map([definition.rootAssembly,...definition.subAssemblies].map(assembly=>[assembly.elementId,assembly]));
  const parts=new Set();
  function visit(eid,path){
    requireThat(!path.includes(eid)&&assemblies.has(eid),'REFERENCE_ASSEMBLY_GRAPH');
    for(const instance of assemblies.get(eid).instances){
      if(instance.type==='Assembly')visit(instance.elementId,[...path,eid]);
      else if(instance.type==='Part'){
        requireThat(instance.documentId===references['1690'].did&&instance.elementId==='9d9d0c6fb9f94eb7f073ecc4','REFERENCE_PART_SCOPE');
        parts.add(instance.partId);
      }
    }
  }
  visit(elementId,[]);requireThat(parts.size>0&&parts.size<=200,'REFERENCE_PART_COUNT');return [...parts].sort();
}

export function recoverGltfFormat(data,team,operation){
  const entry=data.attempts.at(-1);
  requireThat(data.halt?.code==='HTTP_406'&&data.halt.sequence===entry?.sequence&&entry.method==='GET'&&entry.operation==='exportPartStudioGltf'&&entry.key.startsWith(`${prefix}-1690-`)&&team==='1690'&&operation==='exportPartStudioGltf'&&!data.referenceFormatCorrection,'FORMAT_CORRECTION_SCOPE');
  data.referenceFormatCorrection={...data.halt,recordedAt:new Date().toISOString(),accept:'model/gltf+json',reason:'Use the media type declared by the cached official schema.'};delete data.halt;
}

export function referenceRequest(schema,team,operation,variables={},query={}){
  const source=references[team];requireThat(source&&allowed.has(operation),'REFERENCE_SCOPE');
  requireThat(!variables.did||variables.did===source.did,'REFERENCE_DOCUMENT_SCOPE');
  const request=schema.request(operation,{did:source.did,...variables},undefined,query);
  requireThat(request.method==='GET'&&request.body===undefined,'REFERENCE_READ_ONLY');
  return request;
}

function summarize(operation,result){
  if(operation==='getDocument')return {id:result.id,name:result.name,public:result.public,defaultElementId:result.defaultElementId};
  if(operation==='getCurrentMicroversion')return result;
  if(operation==='getElementsInDocument')return result.map(item=>({id:item.id,name:item.name,elementType:item.elementType,microversionId:item.microversionId}));
  if(operation==='getAssemblyDefinition')return {keys:Object.keys(result),root:{...Object.fromEntries(['documentId','elementId','documentMicroversion','configuration'].map(key=>[key,result.rootAssembly?.[key]])),instances:result.rootAssembly?.instances?.map(item=>({id:item.id,name:item.name,type:item.type,documentId:item.documentId,elementId:item.elementId,documentMicroversion:item.documentMicroversion,partId:item.partId})),occurrences:result.rootAssembly?.occurrences?.length,features:result.rootAssembly?.features?.length},subAssemblies:result.subAssemblies?.map(item=>({documentId:item.documentId,elementId:item.elementId,documentMicroversion:item.documentMicroversion,instances:item.instances?.length})),parts:result.parts?.length};
  if(operation==='getPartStudioBodyDetails')return {keys:Object.keys(result),bodies:result.bodies?.map(body=>({id:body.id,type:body.type,faces:body.faces?.length,edges:body.edges?.length}))};
  if(operation==='exportPartStudioGltf')return {keys:Object.keys(result),meshes:result.meshes?.length,nodes:result.nodes?.length,buffers:result.buffers?.map(buffer=>({byteLength:buffer.byteLength,embedded:buffer.uri?.startsWith('data:')}))};
  return result;
}

export async function inspect(args=process.argv.slice(2)){
  requireThat(args.at(-1)==='--read-only-approved','EXPLICIT_REFERENCE_APPROVAL_REQUIRED');
  const [team,operation,extra]=args;const source=references[team];requireThat(source,'REFERENCE_TEAM');
  const data=readLedger(ledgerPath);const ledger=new Ledger(ledgerPath,data.binding);let credentials;
  const directory=new URL(`${team}/`,cache);mkdirSync(directory,{recursive:true});
  const adapter={
    data:ledger.data,
    completed(key){const entry=ledger.completed(key);if(!entry)return undefined;const receipt=entry.result;if(receipt?.referenceCache){const path=new URL(receipt.referenceCache,cache);requireThat(existsSync(path)&&sha256(readFileSync(path))===receipt.sha256,'REFERENCE_CACHE_HASH');return {...entry,result:JSON.parse(readFileSync(path,'utf8'))};}return entry;},
    begin(input){requireThat(ledger.data.attempts.filter(entry=>entry.key.startsWith(prefix)).length<18,'REFERENCE_INSPECTION_CAP_18');return ledger.begin(input);},
    finish(sequence,response){if(response.result){const file=`${team}/${operation}-${sha256(JSON.stringify(response.result)).slice(0,12)}.json`;const bytes=Buffer.from(JSON.stringify(response.result));writeFileSync(new URL(file,cache),bytes);response={...response,result:{referenceCache:file,sha256:sha256(bytes),summary:summarize(operation,response.result)}};}ledger.finish(sequence,response);},
  };
  try{
    if(ledger.data.halt&&args.includes('--recover-read-metadata')){recoverReadFailure(ledger.data,operation);ledger.save();}
    if(ledger.data.halt&&args.includes('--recover-read-alternative')){recoverDownloadRead(ledger.data,team,operation);ledger.save();}
    if(ledger.data.halt&&args.includes('--close-unavailable-1778')){closeUnavailableReference(ledger.data,team,operation);ledger.save();}
    if(ledger.data.halt&&args.includes('--correct-gltf-format')){recoverGltfFormat(ledger.data,team,operation);ledger.save();}
    requireThat(!ledger.data.closedReferences?.[team],'REFERENCE_CLOSED');
    requireThat(!ledger.data.halt,'LEDGER_HALTED');credentials=await loadCredentials(true,undefined,ORIGIN,{});
    let rateLimit;
    const sender=createTransport({ledger:adapter,credentials,fetchImpl:async(url,options)=>{const response=await fetch(url,options);rateLimit={limit:response.headers.get('x-rate-limit-limit'),remaining:response.headers.get('x-rate-limit-remaining'),retryAfter:response.headers.get('retry-after'),interpretation:'Observed headers only, not assumed annual allocation'};if(operation==='downloadFileWorkspace'&&response.ok){const maximum=150*1024*1024;requireThat(Number(response.headers.get('content-length')||0)<=maximum,'REFERENCE_DOWNLOAD_SIZE');const chunks=[];let length=0;for await(const chunk of response.body){length+=chunk.length;requireThat(length<=maximum,'REFERENCE_DOWNLOAD_SIZE');chunks.push(chunk);}return new Response(Buffer.concat(chunks),{status:response.status,headers:response.headers});}return response;}});
    const schema=loadSchema();let variables={};let query={};
    if(operation==='getCurrentMicroversion')variables={wv:'w',wvid:source.wid};
    if(operation==='downloadFileWorkspace'){
      const elements=adapter.completed(`${prefix}-${team}-getElementsInDocument`)?.result;
      requireThat(elements?.some(item=>item.id===extra&&item.elementType==='BLOB'),'OBSERVED_BLOB_REQUIRED');
      variables={wid:source.wid,eid:extra};query={contentDisposition:'attachment'};
    }else if(!['getDocument','getCurrentMicroversion'].includes(operation)){
      const snapshot=adapter.completed(`${prefix}-${team}-getCurrentMicroversion`)?.result;const microversion=snapshot?.microversion??snapshot?.microversionId??snapshot?.id;
      requireThat(typeof microversion==='string'&&/^[a-f0-9]{24}$/.test(microversion),'PINNED_MICROVERSION_REQUIRED');variables={wvm:'m',wvmid:microversion};
      if(operation!=='getElementsInDocument')variables.eid=extra&&/^[a-f0-9]{24}$/.test(extra)?extra:source.eid;
      if(operation==='getElementsInDocument')query={withThumbnails:false};
      if(operation==='getAssemblyDefinition')query=args.includes('--minimal')?{includeMateFeatures:false,includeMateConnectors:false,excludeSuppressed:true}:{includeMateFeatures:true,includeMateConnectors:true,excludeSuppressed:true};
      if(operation==='getPartStudioBodyDetails')query={includeGeometricData:true,includeSurfaces:false};
      if(operation==='exportPartStudioGltf')query={outputFaceAppearances:true};
    }
    const selection=args.find(argument=>argument.startsWith('--subassembly='))?.split('=')[1];
    if(selection){
      requireThat(team==='1690'&&['exportPartStudioGltf','getPartStudioBodyDetails'].includes(operation)&&variables.eid==='9d9d0c6fb9f94eb7f073ecc4','REFERENCE_SELECTION_SCOPE');
      const definition=adapter.completed(`${prefix}-1690-getAssemblyDefinition-${source.eid}-minimal`)?.result;
      requireThat(definition,'REFERENCE_DEFINITION_REQUIRED');
      const selected=[...new Set(selection.split(',').flatMap(elementId=>subassemblyPartIds(definition,elementId)))];
      requireThat(selected.length<=200,'REFERENCE_PART_COUNT');
      query[operation==='exportPartStudioGltf'?'partId':'partIds']=selected;
    }
    const request=referenceRequest(schema,team,operation,variables,query);const key=`${prefix}-${team}-${operation}${variables.eid?`-${variables.eid}`:''}${args.includes('--minimal')?'-minimal':''}${selection?`-${selection}`:''}${operation==='exportPartStudioGltf'?'-gltf-json':''}`;
    const binary=operation==='downloadFileWorkspace';
    const result=await sender({...request,key,phase:'nativeReferenceInspection',binary,...(operation==='exportPartStudioGltf'?{accept:'model/gltf+json'}:{})});
    ledger.checkpoint(key,{observedAt:new Date().toISOString(),rateLimit,readOnly:true});
    if(binary){const file=`${team}/published-${variables.eid}.gltf`;writeFileSync(new URL(file,cache),result);const receipt={file,bytes:result.length,sha256:sha256(result),source:'Workspace blob export; not native feature history',header:result.subarray(0,4).toString('hex')};ledger.checkpoint(`${key}-file`,receipt);return {team,operation,attempts:ledger.data.attempts.length,receipt};}
    return {team,operation,status:'READ_ONLY_RESPONSE_OBSERVED',attempts:ledger.data.attempts.length,remaining:140-ledger.data.attempts.length,rateLimit,data:summarize(operation,result)};
  }finally{credentials=undefined;ledger.close();}
}

if(import.meta.main){try{console.log(JSON.stringify(await inspect(),null,2));}catch(error){console.log(JSON.stringify({status:'STOPPED',reason:/^[A-Za-z0-9_:.-]+$/.test(error.message)?error.message:'LOCAL_OR_PROTOCOL_FAILURE'}));process.exitCode=1;}}