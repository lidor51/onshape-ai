import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readLedger,sha256} from '../../trials/subsystem-ab/api/ledger.mjs';
import {sourceAssembly} from './reference-model.mjs';
import {boreLoops} from './source-bores.mjs';

const cache=new URL('../../.cache/reference-cad/',import.meta.url);const ledger=readLedger(fileURLToPath(new URL('../../trials/subsystem-ab/api/ledger.json',import.meta.url)));
function source(entry){const bytes=readFileSync(new URL(entry.result.referenceCache,cache));if(sha256(bytes)!==entry.result.sha256)throw new Error('Source hash changed');return JSON.parse(bytes);}
globalThis.ProgressEvent??=class extends Event{constructor(type,options){super(type);Object.assign(this,options);}};
const definition=source(ledger.attempts.find(entry=>entry.sequence===32));const geometry=ledger.attempts.filter(entry=>entry.status==='SUCCESS'&&entry.operation==='exportPartStudioGltf').map(source);
const {root}=await sourceAssembly({definition,geometry});
const selected=new Set(['LFfWB','LFzWB','LFzXB','LFPYB','LFfVB','LFjVB','LFnVB','LFrVB','LFbVB']);
const findings=root.children.filter(holder=>selected.has(holder.userData.partId)).map(holder=>({partId:holder.userData.partId,name:holder.userData.name,path:holder.userData.path,bores:boreLoops(holder,{includeNoncircular:true})}));
if(findings.length<selected.size)throw new Error('Missing selected plate');
writeFileSync(new URL('1690/bore-observations.json',cache),JSON.stringify({status:'MESH_EDGE_CIRCLE_FITS_NOT_MACHINING_DIMENSIONS',toleranceMm:0.02,findings},null,2));
console.log(JSON.stringify(findings.map(finding=>({partId:finding.partId,bores:finding.bores})),null,2));