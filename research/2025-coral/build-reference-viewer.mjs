import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {build} from '../../trials/whole-robot-concepts/mechanisms/node_modules/esbuild/lib/main.js';
import {readLedger,sha256} from '../../trials/subsystem-ab/api/ledger.mjs';
import {sourceAssembly} from './reference-model.mjs';

const cache=new URL('../../.cache/reference-cad/',import.meta.url);
const ledger=readLedger(fileURLToPath(new URL('../../trials/subsystem-ab/api/ledger.json',import.meta.url)));
function cached(entry){
  const bytes=readFileSync(new URL(entry.result.referenceCache,cache));
  if(sha256(bytes)!==entry.result.sha256)throw new Error('Source cache hash mismatch');
  return JSON.parse(bytes);
}
const definitionEntry=ledger.attempts.find(entry=>entry.key==='reference-inspection-20260918-1690-getAssemblyDefinition-465d3a35c190dab8355f1e5c-minimal');
const geometryEntries=ledger.attempts.filter(entry=>entry.key.startsWith('reference-inspection-20260918-1690-exportPartStudioGltf-')&&entry.status==='SUCCESS');
const payload={definition:cached(definitionEntry),geometry:geometryEntries.map(cached)};
globalThis.ProgressEvent??=class extends Event{constructor(type,options){super(type);Object.assign(this,options);}};
const {measurements,sourcePartCount,root}=await sourceAssembly(payload);
if(!measurements.length||measurements.some(part=>part.sizeMm.some(value=>!Number.isFinite(value))))throw new Error('Invalid placed source geometry');
const provenance={team:'1690',documentId:payload.definition.rootAssembly.documentId,microversion:payload.definition.rootAssembly.documentMicroversion,sourcePartCount,placedOccurrences:root.children.length,sources:[definitionEntry,...geometryEntries].map(entry=>({attempt:entry.sequence,...entry.result})),units:'GLTF meters converted to millimeters',measurement:'Source-mesh world-axis bounding boxes, not analytic B-rep fits or motion validation'};
writeFileSync(new URL('1690/measurements.json',cache),JSON.stringify({provenance,measurements},null,2));
const bundle=await build({entryPoints:[fileURLToPath(new URL('reference-viewer.mjs',import.meta.url))],bundle:true,write:false,minify:true,format:'esm',legalComments:'none'});
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>1690 released CAD inspection</title><style>*{box-sizing:border-box}body{margin:0;color:#24372d;background:#e9eeec;font-family:Georgia,serif;letter-spacing:0}header{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:12px 18px;background:#fff;border-bottom:1px solid #bbc8c0}h1{font-size:19px;margin:0}label{font-size:13px;display:flex;align-items:center;gap:6px}select{font:14px Georgia,serif;padding:6px;max-width:100%;background:#fff;border:1px solid #96aa9c;border-radius:3px}main{width:100%;height:calc(100dvh - 120px);min-height:360px}canvas{display:block;max-width:100%;touch-action:none}footer{padding:9px 18px;display:flex;gap:14px;flex-wrap:wrap;font-size:12px;border-top:1px solid #bbc8c0}#bounds{font-variant-numeric:tabular-nums}@media(max-width:600px){header{gap:10px}h1{width:100%}main{height:calc(100dvh - 175px)}}</style></head><body><header><h1>1690 / Released CAD</h1><label>Stage<select id="stage"><option value="both">Pickup + indexer</option><option value="pickup">Pickup subset</option><option value="indexer">Indexer</option></select></label><label>View<select id="view"><option value="iso">Isometric</option><option value="side">Side</option><option value="front">Front</option><option value="top">Top</option></select></label></header><main></main><footer><span id="status">Loading source meshes</span><span id="bounds"></span><span>Static release pose / partial pickup / not manufacturing CAD</span></footer><script>window.referencePayload=${JSON.stringify(payload).replaceAll('<','\\u003c')};</script><script type="module">${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body></html>`;
writeFileSync(new URL('1690-inspection.html',cache),html.replace('Pickup + indexer</option>','Mechanisms + chassis datum</option>').replace('<option value="indexer">Indexer</option>','<option value="indexer">Indexer</option><option value="receiver">Receiver</option><option value="chassis">Chassis datum</option>'));
console.log(JSON.stringify({sourcePartCount,placedOccurrences:root.children.length,measurementCount:measurements.length,viewer:fileURLToPath(new URL('1690-inspection.html',cache))}));