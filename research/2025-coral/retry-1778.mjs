import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadCredentials} from '../../trials/native-api/transport.mjs';
import {Ledger,readLedger,requireThat,sha256} from '../../trials/subsystem-ab/api/ledger.mjs';
import {loadSchema} from '../../trials/subsystem-ab/api/schema.mjs';
import {createTransport,ORIGIN} from '../../trials/subsystem-ab/api/transport.mjs';
import {referenceRequest,references} from './native-inspect.mjs';

export const retryPrefix='reference-retry-1778-20260918';
export function retryRequest(schema,mode='assembly'){
  const source=references['1778'];
  requireThat(['assembly','blob'].includes(mode),'RETRY_MODE');
  if(mode==='blob')return referenceRequest(schema,'1778','downloadFileWorkspace',{wid:source.wid,eid:'9f0878ee196d31c4be012b8b'},{contentDisposition:'attachment'});
  return referenceRequest(schema,'1778','getAssemblyDefinition',{wvm:'w',wvmid:source.wid,eid:source.eid},{includeMateFeatures:false,includeMateConnectors:false,excludeSuppressed:true});
}

export function permitBlobAfterServerError(data){
  const entry=data.attempts.at(-1);
  requireThat(data.halt?.sequence===entry?.sequence&&data.halt.code==='HTTP_500'&&entry.method==='GET'&&entry.key===`${retryPrefix}-workspace-definition`&&!data.retry1778BlobDiagnostic,'RETRY_RECOVERY_SCOPE');
  data.retry1778BlobDiagnostic={...data.halt,reason:'User-requested retry: different read-only blob route after workspace definition server error'};delete data.halt;
}

export async function retry1778(args=process.argv.slice(2)){
  requireThat(args.at(-1)==='--user-requested-retry'&&args.length<=2,'RETRY_APPROVAL_REQUIRED');
  const mode=args[0]==='blob'?'blob':'assembly';
  const ledgerPath=fileURLToPath(new URL('../../trials/subsystem-ab/api/ledger.json',import.meta.url));
  const data=readLedger(ledgerPath);const ledger=new Ledger(ledgerPath,data.binding);
  const directory=new URL('../../.cache/reference-cad/1778/',import.meta.url);mkdirSync(directory,{recursive:true});
  try{
    if(mode==='blob'&&ledger.data.halt){permitBlobAfterServerError(ledger.data);ledger.save();}
    requireThat(!ledger.data.halt,'LEDGER_HALTED');
    ledger.checkpoint(`${retryPrefix}-authorization`,{date:'2026-09-18',request:'User explicitly requested retry 1778',maximumAdditionalAttempts:4,oldClosurePreserved:true,mutationsAllowed:false});
    const adapter={data:ledger.data,completed:key=>ledger.completed(key),begin(input){requireThat(ledger.data.attempts.filter(entry=>entry.key.startsWith(retryPrefix)).length<4,'RETRY_CAP_4');return ledger.begin(input);},finish(sequence,response){
      if(response.result){const bytes=Buffer.from(JSON.stringify(response.result));const filename=`retry-workspace-${sha256(bytes).slice(0,12)}.json`;writeFileSync(new URL(filename,directory),bytes);response={...response,result:{referenceCache:`1778/${filename}`,sha256:sha256(bytes),microversion:response.result.rootAssembly?.documentMicroversion,instances:response.result.rootAssembly?.instances?.length,occurrences:response.result.rootAssembly?.occurrences?.length,subassemblies:response.result.subAssemblies?.length,parts:response.result.parts?.length}};}
      ledger.finish(sequence,response);
    }};
    let observation;
    const send=createTransport({ledger:adapter,credentials:await loadCredentials(true,undefined,ORIGIN,{}),fetchImpl:async(url,options)=>{
      try{
        const response=await fetch(url,options);
        observation={httpStatus:response.status,contentType:response.headers.get('content-type'),contentLength:response.headers.get('content-length')};
        ledger.checkpoint(`${retryPrefix}-${mode}-response`,observation);
        if(mode==='blob'&&response.ok){
          const maximum=150*1024*1024;const chunks=[];let bytes=0;
          if(Number(observation.contentLength)>maximum){await response.body.cancel();throw new Error('REFERENCE_DOWNLOAD_SIZE');}
          for await(const chunk of response.body){bytes+=chunk.length;requireThat(bytes<=maximum,'REFERENCE_DOWNLOAD_SIZE');chunks.push(chunk);}
          return new Response(Buffer.concat(chunks),{status:response.status,headers:response.headers});
        }
        return response;
      }catch(error){ledger.checkpoint(`${retryPrefix}-${mode}-diagnostic`,{...observation,category:['REFERENCE_DOWNLOAD_SIZE','TimeoutError','AbortError'].includes(error.message)?error.message:['TimeoutError','AbortError'].includes(error.name)?error.name:'NETWORK_OR_STREAM_FAILURE'});throw error;}
    }});
    const result=await send({...retryRequest(loadSchema(),mode),key:`${retryPrefix}-${mode==='blob'?'published-blob':'workspace-definition'}`,phase:'userRequestedReferenceRetry',binary:mode==='blob'});
    if(mode==='blob'){const filename='retry-published.gltf';writeFileSync(new URL(filename,directory),result);ledger.checkpoint(`${retryPrefix}-blob-file`,{file:`1778/${filename}`,sha256:sha256(result),bytes:result.length,header:result.subarray(0,4).toString('hex')});}
    return {attempts:ledger.data.attempts.length,result:ledger.data.attempts.at(-1).result};
  }finally{ledger.close();}
}
if(import.meta.main){try{console.log(JSON.stringify(await retry1778(),null,2));}catch(error){console.log(JSON.stringify({status:'STOPPED',reason:/^[A-Za-z0-9_:.-]+$/.test(error.message)?error.message:'LOCAL_OR_PROTOCOL_FAILURE'}));process.exitCode=1;}}