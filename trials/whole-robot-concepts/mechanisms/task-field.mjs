import * as THREE from 'three';
import targets from './field-targets.json' with {type:'json'};
import {targetForTask} from './interaction-solver.mjs';
import {axle,beam,box} from './primitives.mjs';

const colors={support:0xbac2c3,contact:0x7f969c,panel:0xd5dbda,wire:0x899795,floor:0xe3e5e1,dimension:0x687777};
const vector=point=>new THREE.Vector3(...point);

function line(parent,name,points,color=colors.wire,segments=false){
  const geometry=new THREE.BufferGeometry().setFromPoints(points.map(vector));
  const material=new THREE.LineBasicMaterial({color});
  const object=segments?new THREE.LineSegments(geometry,material):new THREE.Line(geometry,material);
  object.name=name;parent.add(object);return object;
}

function branchPair(parent,target,offsets){
  const data=targets.interfaces[target.level];
  for(const [index,across] of offsets.entries()){
    const tip=[target.tip[0]+across,...target.tip.slice(1)];
    const base=[target.branchBase[0]+across,...target.branchBase.slice(1)];
    const branch=axle(parent,`${target.level.toUpperCase()} branch ${index+1}`,base,tip,target.branchRadius,colors.contact);
    branch.userData={role:'branch',level:target.level,tip,branchBase:base,radiusMm:target.branchRadius,highestPointMm:data.tipHeightMm};
    const postTop=target.level==='l4'?[base[0],base[1]-220,base[2]-220]:base;
    const post=axle(parent,`${target.level.toUpperCase()} support ${index+1}`,[postTop[0],postTop[1],0],postTop,target.branchRadius,colors.support);
    post.userData={role:'fieldSupport',profileAssumed:true};
    if(target.level==='l4'){
      const bend=axle(parent,`L4 assumed support bend ${index+1}`,postTop,base,target.branchRadius,colors.support);
      bend.userData={role:'fieldSupport',profileAssumed:true};
    }
  }
  parent.userData.branchLevel=target.level;
  parent.userData.pairSpacingMm=data.pairSpacingMm;
  parent.userData.caveats.push('Exposed branch length, support path and cap/weld shape are illustrative hypotheses, not reconstructed native CAD.');
}

function frame(parent,prefix,width,bottom,height){
  const bar=24;const depth=20;const top=bottom+height;
  const bars=[
    box(parent,`${prefix} bottom sill`,[0,-depth/2,bottom-bar/2],[width+2*bar,depth,bar],colors.contact),
    box(parent,`${prefix} top lintel`,[0,-depth/2,top+bar/2],[width+2*bar,depth,bar],colors.support),
    ...[-1,1].map(side=>box(parent,`${prefix} ${side<0?'left':'right'} jamb`,[side*(width+bar)/2,-depth/2,(bottom+top)/2],[bar,depth,height],colors.support)),
  ];
  for(const object of bars)object.userData={role:'apertureFrame'};
  parent.userData.opening={planeY:0,widthMm:width,heightMm:height,bottomMm:bottom,topMm:top};
}

function trough(parent){
  const data=targets.interfaces.l1;const width=data.troughWidthHypothesisMm;const depth=data.troughDepthHypothesisMm;
  const floor=box(parent,'L1 horizontal contact floor',[0,-depth/2,data.frontEdgeMm-8],[width,depth,16],colors.panel);
  floor.userData={role:'troughContact',surfaceHeightMm:data.frontEdgeMm};
  const edge=box(parent,'L1 front contact edge',[0,-6,data.frontEdgeMm-20],[width,12,40],colors.contact);
  edge.userData={role:'troughEdge',surfaceHeightMm:data.frontEdgeMm};
  for(const across of [-width/2+30,width/2-30]){
    box(parent,'Trough support',[across,-depth+20,(data.frontEdgeMm-16)/2],[24,24,data.frontEdgeMm-16],colors.support).userData={role:'fieldSupport'};
  }
  parent.userData.assumedDimensions={widthMm:width,depthMm:depth};
  parent.userData.caveats.push('Only the 457.2 mm front-edge datum is sourced; the horizontal floor, 900 mm width and 200 mm depth are assumed.');
}

function station(parent){
  const data=targets.interfaces.station;const angle=THREE.MathUtils.degToRad(data.chuteAngleDeg);
  const axis=new THREE.Vector3(0,Math.cos(angle),-Math.sin(angle));
  const normal=new THREE.Vector3(0,Math.sin(angle),Math.cos(angle));
  const radius=targets.pieces.coral.outsideDiameterMm/2;
  const openingPoint=new THREE.Vector3(0,0,data.bottomMm+radius/Math.cos(angle));
  frame(parent,'Station',data.openingWidthMm,data.bottomMm,data.openingHeightMm);
  const thickness=10;const guideLength=400;const guideWidth=220;
  const guideEnd=openingPoint.clone().addScaledVector(axis,radius*Math.tan(angle)).addScaledVector(normal,-radius-thickness/2);
  const guideStart=guideEnd.clone().addScaledVector(axis,-guideLength);
  const guide=beam(parent,'Station sloped feed lane',guideStart.toArray(),guideEnd.toArray(),guideWidth,thickness,colors.panel);
  guide.userData={role:'chuteContact',axis:axis.toArray(),openingPoint:openingPoint.toArray(),normal:normal.toArray(),contactOffsetMm:radius,assumedLengthMm:guideLength,assumedWidthMm:guideWidth};
  line(parent,'Station feed centerline',[-220,120].map(distance=>openingPoint.clone().addScaledVector(axis,distance).toArray()),colors.contact).userData={role:'feedAxis',decorative:true};
  const sectionHeight=2*radius;
  parent.userData.feed={axis:axis.toArray(),pieceAxis:[1,0,0],openingPoint:openingPoint.toArray(),sectionHeightMm:sectionHeight,verticalClearanceMm:data.openingHeightMm-sectionHeight,fullBoreClearance:false};
  parent.userData.caveats.push('Guide length, lane width and receiving arrangement are assumed. Crosswise coral translates down the 55-degree chute; the feed direction is not the cylinder axis. Nominal aperture clearance is not a feed reliability proof.');
}

function transparentPanel(parent,name,center,size){
  const panel=box(parent,name,center,size,colors.panel);
  panel.material=panel.material.clone();panel.material.transparent=true;panel.material.opacity=0.13;panel.material.depthWrite=false;
  panel.castShadow=false;panel.userData={role:'netPanel',profileAssumed:true};return panel;
}

function net(parent){
  const data=targets.interfaces.net;const halfLength=data.openingLengthHypothesisMm/2;const depth=data.openingWidthHypothesisMm;
  const rim=data.rimHypothesisMm;const low=data.lowestMeshMm;const endTop=data.endPanelTopDrawingMm;const railRadius=12;
  parent.userData.opening={nearY:0,farY:-depth,minX:-halfLength,maxX:halfLength,rimMm:rim,endPanelTopMm:endTop};
  for(const [name,rearward] of [['near',railRadius],['far',-depth-railRadius]]){
    axle(parent,`Net ${name} rim`,[-halfLength,rearward,rim-railRadius],[halfLength,rearward,rim-railRadius],railRadius,colors.contact).userData={role:'netRim',side:name};
    transparentPanel(parent,`Net ${name} side`,[0,name==='near'?2:-depth-2,(rim+low)/2],[2*halfLength,4,rim-low]);
  }
  for(const side of [-1,1]){
    const across=side*(halfLength+12);
    transparentPanel(parent,`Net end panel ${side}`,[side*(halfLength+2),-depth/2,(endTop+low)/2],[4,depth,endTop-low]);
    for(const rearward of [railRadius,-depth-railRadius]){
      axle(parent,'Net end post',[across,rearward,low],[across,rearward,endTop],8,colors.support).userData={role:'netEndFrame'};
    }
    axle(parent,'Net high end rail',[across,-depth,endTop-8],[across,0,endTop-8],8,colors.support).userData={role:'netEndFrame'};
  }
  const sag=(across,rearward)=>low+(rim-low)*(1-(1-(across/halfLength)**2)*(1-((rearward+depth/2)/(depth/2))**2));
  for(let index=0;index<=14;index++){
    const across=-halfLength+2*halfLength*index/14;
    const points=Array.from({length:17},(_,sample)=>{const rearward=-depth+depth*sample/16;return [across,rearward,sag(across,rearward)];});
    line(parent,`Net transverse mesh wire ${index}`,points).userData={role:'netMesh',profileAssumed:true};
  }
  for(let index=0;index<=8;index++){
    const rearward=-depth+depth*index/8;
    const points=Array.from({length:29},(_,sample)=>{const across=-halfLength+2*halfLength*sample/28;return [across,rearward,sag(across,rearward)];});
    line(parent,`Net longitudinal mesh wire ${index}`,points).userData={role:'netMesh',profileAssumed:true};
  }
  parent.userData.caveats.push('The 2260 mm near-side rim, 1000 x 3500 mm opening and sag profile are fixed hypotheses. End-panel top and lowest mesh are separate datums. Wires are illustrative, not a contact or shot simulation.');
}

function standOff(root,solution){
  const cosine=Math.cos(solution.heading);const sine=Math.sin(solution.heading);
  const corners=[-435,435].flatMap(across=>[-85,845].map(rearward=>[solution.rootPosition[0]+across*cosine-rearward*sine,solution.rootPosition[1]+across*sine+rearward*cosine]));
  const nearestY=Math.min(...corners.map(point=>point[1]));
  const edgeX=Math.max(...corners.filter(point=>Math.abs(point[1]-nearestY)<0.001).map(point=>point[0]));
  const across=edgeX+30;const height=12;
  const dimension={from:[across,0,height],to:[across,solution.standOffMm,height],valueMm:solution.standOffMm,datum:solution.standOffDatum};
  const decoration=new THREE.Group();decoration.name='Stand-off dimension';decoration.userData={role:'dimension',decorative:true,excludeFromBounds:true};root.add(decoration);
  const points=[dimension.from,dimension.to];
  for(const rearward of [0,solution.standOffMm]){
    points.push([edgeX,rearward,height],[across+12,rearward,height],[across-4,rearward-4,height],[across+4,rearward+4,height]);
  }
  line(decoration,'Stand-off line and witnesses',points,colors.dimension,true);
  return dimension;
}

export function buildTaskField(solution){
  if(solution.legacy||['stow','climb','park'].includes(solution.task))return null;
  const root=new THREE.Group();root.name='Fixed task field';
  const field=new THREE.Group();field.name=`${solution.task} interface`;
  field.userData={role:'taskInterface',source:'field-targets.json geometry standard; not native CAD',caveats:['Illustrative primitives do not establish contact, swept clearance, retention, field accuracy or scoring.']};root.add(field);
  const target=solution.target;
  switch(target.field){
    case 'reef':
      branchPair(field,target,[0,targets.interfaces[target.level].pairSpacingMm]);
      break;
    case 'trough':
      trough(field);
      break;
    case 'station':
      station(field);
      break;
    case 'processor': {
      const data=targets.interfaces.processor;
      frame(field,'Processor',data.openingWidthMm,data.bottomMm,data.openingHeightMm);
      field.userData.deliveryAxis=[0,-1,0];
      field.userData.caveats.push('Four bars represent the bounding aperture only; rounded corners, lip, ramp and compression remain unqualified.');
      break;
    }
    case 'net':
      net(field);
      break;
    case 'reef-algae': {
      const low=solution.task==='algae-low';const branch=targetForTask(low?'coral-l2':'coral-l3');
      const data=targets.interfaces[low?'algaeLow':'algaeHigh'];const halfSpacing=targets.interfaces[branch.level].pairSpacingMm/2;
      branchPair(field,branch,[-halfSpacing,halfSpacing]);
      field.userData.algaeCenterHypothesisMm=[0,data.normalOffsetHypothesisMm,data.centerHypothesisMm];
      field.userData.caveats.push('The parent owns the only algae ball. Its fixed 900/1300 mm center hypotheses are not a seated branch-contact solution.');
      break;
    }
    case 'floor':
      box(field,'Local carpet patch',[0,100,-3],[900,700,6],colors.floor).userData={role:'floorContact',surfaceHeightMm:0,profileAssumed:true};
      break;
    default:
      throw new Error(`No fixed task field for ${solution.task}`);
  }
  root.userData={fieldFixed:true,field:target.field,dimension:standOff(root,solution),assumptions:target.assumptions,contactProven:false};
  return root;
}