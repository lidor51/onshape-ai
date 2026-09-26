import {readFileSync,writeFileSync} from 'node:fs';

export function translationPose(angleDeg,{horizontal=500,vertical=10}={}){
  const angle=angleDeg*Math.PI/180;
  return {dy:horizontal*(1-Math.cos(angle))+vertical*Math.sin(angle),dz:horizontal*Math.sin(angle)+vertical*(Math.cos(angle)-1),
    inwardJacobianMm:horizontal*Math.sin(angle)+vertical*Math.cos(angle),upJacobianMm:horizontal*Math.cos(angle)-vertical*Math.sin(angle)};
}

export function circleBoxClearance(center,radius,box){
  const distances=center.map((value,index)=>Math.max(box.min[index]-value,value-box.max[index],0));
  if(distances.every(value=>value===0))return -radius-Math.min(...center.flatMap((value,index)=>[value-box.min[index],box.max[index]-value]));
  return Math.hypot(...distances)-radius;
}

export function wallRetractionForce(angleDeg,massKg,config={horizontal:500,vertical:10}){
  if(!(Number.isFinite(massKg)&&massKg>0))throw new Error('Positive finite moving mass required');
  const pose=translationPose(angleDeg,config);
  const gravityGeneralizedNm=massKg*9.80665*pose.upJacobianMm/1000;
  return {angleDeg,massKg,inwardJacobianMm:pose.inwardJacobianMm,upJacobianMm:pose.upJacobianMm,
    gravityGeneralizedNm,frontalForceForGravityN:pose.inwardJacobianMm>0?gravityGeneralizedNm/(pose.inwardJacobianMm/1000):null,
    assumptions:'Rigid parallelogram translation, gravity only, no counterbalance, friction, preload or actuator resistance',impactSurvival:false};
}

export function screen(config={horizontal:500,vertical:10,stowAngle:78}){
  const report=JSON.parse(readFileSync(new URL('pickup-report.json',import.meta.url)));
  const rows=Object.entries(report.roller_centers_yz).map(([name,center])=>({name,center,radius:name==='kick'?25.5:63.7}));
  const bumper={min:[-85,45],max:[0,165]};
  const samples=[];const step=0.1;
  for(let index=0;index<=Math.ceil(config.stowAngle/step);index++){
    const angle=Math.min(index*step,config.stowAngle),pose=translationPose(angle,config);
    const clearances=rows.map(row=>({name:row.name,clearance:circleBoxClearance([row.center[0]+pose.dy,row.center[1]+pose.dz],row.radius,bumper),floor:row.center[1]+pose.dz-row.radius}));
    samples.push({angle,...pose,clearances});
  }
  const endpoint=translationPose(config.stowAngle,config);
  const interpolationBound=Math.hypot(config.horizontal,config.vertical)*step*Math.PI/180/2;
  const minimumBumper=Math.min(...samples.flatMap(sample=>sample.clearances.map(row=>row.clearance)));
  const minimumFloor=Math.min(...samples.flatMap(sample=>sample.clearances.map(row=>row.floor)));
  const input=report.poses.poses.find(pose=>pose.fold_deg===0&&pose.float_deg===0).bounds_mm;
  return {config,unit:'mm/degrees',motion:'parallel translation from equal rocker links; no compliance or drive hardware implied',
    minimumBumperClearanceMm:minimumBumper,betweenSampleTravelBoundMm:interpolationBound,
    bumperClearanceLowerBoundMm:minimumBumper-interpolationBound,minimumFloorMm:minimumFloor,
    minimumInwardJacobianMm:Math.min(...samples.map(sample=>sample.inwardJacobianMm)),
    minimumUpJacobianMm:Math.min(...samples.map(sample=>sample.upJacobianMm)),
    stowBoundsMm:[input[0],input[1]+endpoint.dy,input[2]+endpoint.dz,input[3],input[4]+endpoint.dy,input[5]+endpoint.dz],
    sampledAngles:samples.length,fullAssemblyClearance:false,impactSurvival:false,
    pass:minimumBumper-interpolationBound>=3&&minimumFloor>=5&&samples.every(sample=>sample.inwardJacobianMm>0&&sample.upJacobianMm>0)&&input[1]+endpoint.dy>=5&&input[4]+endpoint.dy<=755&&input[5]+endpoint.dz<=1056.8};
}
if(import.meta.main){const results=[360,400,450,500,550].map(horizontal=>screen({horizontal,vertical:10,stowAngle:78}));const sizing=JSON.parse(readFileSync(new URL('drive-sizing.json',import.meta.url)));const massKg=sizing.fold_model.mass_kg;const forceScreen=[0,5,10,20,40,78].map(angle=>wallRetractionForce(angle,massKg));const report={status:'REJECTED_AS_PASSIVE_IMPACT_RELIEF_AT_DEPLOYED_POSE',results,forceScreen,reason:'Positive kinematic direction is insufficient; the near-horizontal deployed links have poor frontal-force leverage against gravity.'};writeFileSync(new URL('deployment-path.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,forceScreen},null,2));}