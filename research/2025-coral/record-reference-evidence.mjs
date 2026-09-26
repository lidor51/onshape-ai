import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readLedger,sha256} from '../../trials/subsystem-ab/api/ledger.mjs';
import {sourceFrame} from './reference-model.mjs';
import {fitCircle} from './source-bores.mjs';

const ledger=readLedger(fileURLToPath(new URL('../../trials/subsystem-ab/api/ledger.json',import.meta.url)));
const cache=new URL('../../.cache/reference-cad/',import.meta.url);
const measured=JSON.parse(readFileSync(new URL('1690/measurements.json',cache)));
const entries=ledger.attempts.filter(entry=>entry.key.startsWith('reference-inspection-20260918'));
function source(sequence){
  const entry=entries.find(candidate=>candidate.sequence===sequence);
  const bytes=readFileSync(new URL(entry.result.referenceCache,cache));
  if(sha256(bytes)!==entry.result.sha256)throw new Error('Reference source changed');
  return JSON.parse(bytes);
}
const definition=source(32);const pickup=source(38);const analytic=source(36);
const shaftIds=['LF7YB','LFLZB','LFnbB'];
const shafts=shaftIds.map(partId=>{
  const matches=measured.measurements.filter(part=>part.partId===partId);
  if(matches.length!==1)throw new Error('Ambiguous shaft measurement');
  const part=matches[0];
  return {partId,name:part.name,spanXMm:part.sizeMm[0],centerMm:part.centerMm};
});
const tyres=measured.measurements.filter(part=>part.partId==='LFDHB');
const bores=JSON.parse(readFileSync(new URL('1690/bore-observations.json',cache)));
const lowerRocker=bores.findings.find(part=>part.partId==='LFPYB');
const slot=lowerRocker.bores.find(bore=>bore.type&&bore.size[0]>40);
const bearingCenter=measured.measurements.find(part=>part.partId==='KFP2'&&part.group==='pickup').centerMm.slice(1);
const endPoints=slot.points.filter(point=>Math.hypot(point[0]-bearingCenter[0],point[1]-bearingCenter[1])<6.1);
const slotEnd=fitCircle(endPoints);
if(!slotEnd||slotEnd.maximumResidual>0.01)throw new Error('Slot end fit unresolved');
const duplicateRoof=measured.measurements.filter(part=>part.partId==='KFD+');
const frameRails=measured.measurements.filter(part=>['JFv','JFz','JFr','JF3'].includes(part.partId)).map(part=>({partId:part.partId,centerMm:part.centerMm,sizeMm:part.sizeMm}));
const starCounts=['4888016cc0c501d628b0d02c','70304876d78dd05d432b8c72','a2c88465a85cdff33c34d83b'].map(elementId=>({elementId,count:measured.measurements.filter(part=>part.elements.includes(elementId)&&part.partId==='LFTHB').length}));
const evidence={
  schema:'reference-geometry-inspection/1',date:'2026-09-18',status:'PARTIAL_NATIVE_HIERARCHY_AND_SOURCE_MESH_INSPECTION',
  source:{team:'1690',documentId:definition.rootAssembly.documentId,microversion:definition.rootAssembly.documentMicroversion,configuration:definition.rootAssembly.configuration,rootElementId:definition.rootAssembly.elementId,partDefinitions:definition.parts.length,subassemblies:definition.subAssemblies.length,occurrences:definition.rootAssembly.occurrences.length},
  local:{sourceBodies:measured.provenance.sourcePartCount,placedOccurrences:measured.measurements.length,groups:Object.fromEntries(['pickup','indexer','receiver'].map(group=>[group,measured.measurements.filter(part=>part.group===group).length])),viewer:'../../.cache/reference-cad/1690-inspection.html',measurements:'../../.cache/reference-cad/1690/measurements.json',units:'mm',method:'World-axis bounding boxes of source mesh vertices after native occurrence transforms; not analytic fits or machining dimensions',sha256:sha256(readFileSync(new URL('1690/measurements.json',cache)))},
  measurements:{pickupShafts:shafts,pickupStarCounts:starCounts,indexerTyreOccurrences:tyres.length,indexerTyreCentersMm:tyres.map(part=>part.centerMm),indexerTyreThicknessRangeMm:[Math.min(...tyres.map(part=>part.sizeMm[1])),Math.max(...tyres.map(part=>part.sizeMm[1]))]},
  analytic:{status:analytic.errorEnum,bodyCount:analytic.bodies.length},
  nativeMotion:{pickupFeatures:pickup.rootAssembly.features.length,subassemblies:pickup.subAssemblies.length,subassemblyFeatures:pickup.subAssemblies.reduce((count,assembly)=>count+assembly.features.length,0),status:'NO_NATIVE_MATES_OBSERVED'},
  availability:{'1778':{status:'SOURCE_ACCESS_CLOSED_FOR_THIS_RUN',assemblyHttpErrors:[26,33],blobReadFailure:31,geometryInspected:false},'2056':{status:'TEAM_WITHHOLDS_NATIVE_2025_ROBOT_CAD',report:'2056-NATIVE-INSPECTION.md',geometryInspected:false}},
  decision:{architecture:'Separate compliant pickup and independently powered horizontal-plan V indexer with upright wheel shafts',status:'FUNCTIONAL_ARCHITECTURE_SELECTED_NOT_GEOMETRY_FROZEN',receiver:'Reference dual-seal vacuum head inspected in static pose; adaptation grip and receiving pose not frozen',priorPassiveVEquivalent:false,liveCad:'BLOCKED_CURRENT_ANNUAL_ALLOWANCE_UNVERIFIED',manufacturingRelease:false,fieldReliability:'UNMEASURED'},
  accounting:{referenceAttempts:entries.length,referenceCap:18,totalDirectAttempts:ledger.attempts.length,directCap:140,annualAllowance:'UNKNOWN',reserveRequired:500},
  requests:entries.map(entry=>({attempt:entry.sequence,operation:entry.operation,status:entry.status,httpStatus:entry.httpStatus,elapsedMs:entry.elapsedMs,...(entry.result?.referenceCache?{cache:entry.result.referenceCache,sha256:entry.result.sha256}:{})})),
};
evidence.local.groups.chassis=measured.measurements.filter(part=>part.group==='chassis').length;
evidence.sourceFrame={...sourceFrame,frameRails,floorDatum:'Not verified; lowest selected tire mesh is about native Y=-2.11 mm. Do not equate Y=0 with loaded carpet.'};
evidence.kinematicProbe={status:'SIMPLE_PINNED_FOUR_BAR_HYPOTHESIS_REJECTED',source:'1690/bore-observations.json',sha256:sha256(readFileSync(new URL('1690/bore-observations.json',cache))),couplerPart:'LFfVB',lowerRockerPart:'LFPYB',contactBearingPart:'KFP2',bearingCenterYZMm:bearingCenter,slotOutlineSizeMm:slot.size,slotEndFit:slotEnd,reason:'The front bearing is in a shaped slot, not a corresponding round pivot hole. Motion needs slot/contact freedom and independently verified drive coupling.'};
evidence.duplicateOccurrences={partId:'KFD+',count:duplicateRoof.length,paths:duplicateRoof.map(part=>part.path),status:'COINCIDENT_SOURCE_OCCURRENCES_NOT_TWO_PROVEN_PHYSICAL_PLATES'};
writeFileSync(new URL('1690-geometry-evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({sourceBodies:evidence.local.sourceBodies,occurrences:evidence.local.placedOccurrences,starCounts,tyres:tyres.length,referenceAttempts:entries.length,totalAttempts:ledger.attempts.length,release:false}));