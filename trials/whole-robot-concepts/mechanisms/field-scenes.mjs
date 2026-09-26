import * as THREE from 'three';
import game from '../game.json' with {type:'json'};
import {box,beam,axle,sidePlate,solid} from './primitives.mjs';

const dimensions=game.dimensionsMm;
const colors={carpet:0xd6d9d7,boundary:0xf5f4ed,body:0x9a9d9b,edge:0x686e6b,pipe:0x7e8583,coral:0xe6e3d7,algae:0x5db1aa,provisional:0xb46c35};
const caveat='Geometry mates and contact are unverified; no reach, scoring, inspection or load-path proof. No source CAD copied or measured.';

function source(reference,description) {
  const entries=reference.sourceRefs.map(id=>game.sources.find(entry=>entry.id===id));
  return `game.json; ${entries.map(entry=>`${entry.id}: ${entry.url}`).join('; ')}; pp. ${reference.pages.join(', ')}. ${description}`;
}

function group(parent,name,userData={}) {
  const result=new THREE.Group();result.name=name;result.userData=userData;parent.add(result);return result;
}

function edges(parent,name,geometry,color,position=[0,0,0]) {
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color}));
  geometry.dispose();outline.name=name;outline.position.set(...position);parent.add(outline);return outline;
}

function rectangle(parent,name,minimum,maximum,color) {
  const [left,front,up]=minimum;const [right,rear]=maximum;
  const points=[[left,front,up],[right,front,up],[right,rear,up],[left,rear,up],[left,front,up]];
  const outline=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(point=>new THREE.Vector3(...point))),new THREE.LineBasicMaterial({color}));
  outline.name=name;parent.add(outline);return outline;
}

function carpet(root) {
  const patch=group(root,'Local carpet patch',{role:'carpet',approx:{widthMm:1600,lengthMm:2500,thicknessMm:2,boundary:'Crop boundary only, not an official field or scoring-zone boundary.'}});
  box(patch,'Carpet surface',[0,250,-1],[1600,2500,2],colors.carpet);
  rectangle(patch,'Context crop boundary',[-798,-998,0.5],[798,1498,0.5],colors.boundary);
}

function approach(root,name,across,rear,approx) {
  const section=group(root,name,{side:rear?'rear':'front',approx:{...approx,placementXmm:across,faceYmm:rear?1320:-620,placement:'Fixed illustrative approach distance, not solved contact.'}});
  section.position.set(across,rear?1320:-620,0);section.rotation.z=rear?Math.PI:0;
  return section;
}

function coralAcross(model,recipe) {
  const piece=model.getObjectByName('Nominal coral');
  return piece?piece.getWorldPosition(new THREE.Vector3()).x:recipe.coralX;
}

function floor(root,model,recipe) {
  const pickup=group(root,'Loose floor pickup context',{role:'pickup',suppressedPieces:[],approx:{frontYmm:-490,rearYmm:1140,piecePlacement:'Illustrative loose pickup, not initially staged algae on coral.'}});
  if(model.getObjectByName('Nominal coral'))pickup.userData.suppressedPieces.push('coral');
  else {
    const coral=dimensions.coral;
    const piece=solid(pickup,'Loose floor coral',new THREE.CylinderGeometry(coral.outsideDiameter/2,coral.outsideDiameter/2,coral.length,32,1,true),colors.coral,[recipe.coralX,recipe.coral==='rearArm'?1140:-490,dimensions.floorIdealizations.coralHorizontalAxisHeight]);
    piece.rotation.z=Math.PI/2;piece.userData={role:'loosePiece',piece:'coral'};
    for(const sign of [-1,1]){
      const rim=solid(piece,'Loose coral rim',new THREE.RingGeometry(coral.nominalInsideDiameter/2,coral.outsideDiameter/2,32),colors.coral,[0,sign*coral.length/2,0]);
      rim.rotation.x=sign*Math.PI/2;
    }
  }
  if(model.getObjectByName('Nominal algae'))pickup.userData.suppressedPieces.push('algae');
  else solid(pickup,'Loose floor algae',new THREE.SphereGeometry(dimensions.algae.diameter/2,24,16),colors.algae,[recipe.algaeX,-490,dimensions.floorIdealizations.algaeNominalCenterHeight]).userData={role:'loosePiece',piece:'algae'};
}

function stow(root,model) {
  model.updateWorldMatrix(true,true);
  const footprint=new THREE.Box3();
  model.traverse(object=>{
    if(['Chassis side rail','Chassis cross rail'].includes(object.name))footprint.union(new THREE.Box3().setFromObject(object,true));
  });
  if(footprint.isEmpty())throw new Error('Stow context requires the model chassis rails');
  const size=footprint.getSize(new THREE.Vector3());const center=footprint.getCenter(new THREE.Vector3());
  const height=game.constraints.startingHeightMaximumMm;
  const guide=group(root,'Starting envelope guide',{role:'stowGuide',official:{heightMm:height,perimeterMaximumMm:game.constraints.startingPerimeterMaximumMm},approx:{widthMm:size.x,lengthMm:size.y,footprint:'Visible fixed chassis-rail bounds from models.mjs, excluding bumpers; not a verified taut-string ROBOT PERIMETER.'}});
  edges(guide,'Starting height guide edges',new THREE.BoxGeometry(size.x,size.y,height),colors.edge,[center.x,center.y,height/2]);
  rectangle(guide,'Model chassis footprint',[footprint.min.x,footprint.min.y,0],[footprint.max.x,footprint.max.y,0],colors.edge);
}

function station(root,recipe) {
  const station=dimensions.coralStation;
  const rear=recipe.coral==='rearArm'||['R01','R03','R05'].includes(recipe.id);
  const chuteRun=170;
  const section=approach(root,'Cropped coral station',recipe.coralX,rear,{shownWidthMm:600,chuteRunMm:chuteRun,wallHeightMm:100,frameThicknessMm:20,profile:'Chute depth, supports and crop edges are illustrative, not station CAD.'});
  section.userData.official={openingWidthMm:station.openingWidth,openingHeightMm:station.openingHeight,openingBottomMm:station.openingBottomHeight,chuteSlopeDegrees:station.chuteSlopeDegrees};
  section.userData.cropped={shownWidthMm:600,fullOpeningWidthMm:station.openingWidth,note:'Central 600 mm segment; side edges are crop markers, not actual opening jambs.'};
  const bottom=station.openingBottomHeight;const top=bottom+station.openingHeight;
  const body=group(section,'Station frame',{role:'fieldSupport'});
  for(const across of [-330,330])beam(body,'Illustrative station post',[across,-55,0],[across,-55,top+60],30,30,colors.edge);
  const sill=box(body,'Opening bottom sill',[0,-10,bottom-10],[600,20,20],colors.body);
  sill.userData={datum:'top edge',heightMm:bottom};
  const lintel=box(body,'Opening top lintel',[0,-10,top+10],[600,20,20],colors.body);
  lintel.userData={datum:'bottom edge',heightMm:top};
  rectangle(section,'Cropped opening edges',[-300,bottom,0],[300,top,0],colors.edge).rotation.x=Math.PI/2;
  const rise=chuteRun*Math.tan(THREE.MathUtils.degToRad(station.chuteSlopeDegrees));
  beam(body,'Sloped station trough',[0,-chuteRun,bottom+rise],[0,0,bottom],600,8,colors.body);
  for(const across of [-300,300])sidePlate(body,'Illustrative chute side',across,[[-chuteRun,bottom+rise],[-chuteRun,bottom+rise+100],[0,bottom+100],[0,bottom]],6,colors.edge);
}

function reef(root,model,recipe,pose) {
  const reef=dimensions.reef;
  const across=pose==='coral'?coralAcross(model,recipe)+reef.pipePairSpacing/2:recipe.algaeX;
  const section=approach(root,'Reef face section',across,pose==='coral'&&recipe.coral==='rearArm',{faceWidthMm:720,baseDepthMm:180,baseProfile:'Illustrative face, ribs and trough cross-section; official base profile is unknown.',branchLengthMm:310,pipeRadiusMm:21,branchTipLocalYmm:210,verticalBranchLengthMm:250,cantilever:'Illustrative lengths and stand-off, outside the bumper; not a solved insertion path.'});
  section.userData.official={pipePairSpacingMm:reef.pipePairSpacing,heightsMm:Object.fromEntries(['L1','L2','L3','L4'].map(level=>[level,reef[level].height])),datum:'FIELD carpet; L1 top/front trough edge; L2/L3 highest angled branch points; L4 highest vertical branch point. None is a gripper target.'};
  const body=group(section,'Illustrative reef body',{role:'fieldSupport'});
  box(body,'Reef base foot',[0,-90,20],[760,180,40],colors.edge);
  box(body,'Reef face backing',[0,-155,235],[720,12,350],colors.body);
  for(const across of [-350,350])sidePlate(body,'Illustrative reef base profile',across,[[-175,40],[-175,420],[-65,reef.L1.height],[0,120],[0,40]],10,colors.edge);
  const trough=group(section,'L1 trough',{role:'cantilever',official:{frontEdgeHeightMm:reef.L1.height},approx:{bedStartHeightMm:350,bedEndHeightMm:420,lipThicknessMm:12}});
  beam(trough,'Sloping trough bed',[0,-95,350],[0,140,420],720,8,colors.body);
  box(trough,'L1 front trough edge',[0,140,reef.L1.height-6],[720,16,12],colors.edge);
  box(trough,'Trough rear lip',[0,-95,reef.L1.height-6],[720,16,12],colors.edge);
  for(const across of [-355,355])sidePlate(trough,'Trough end cheek',across,[[-95,350],[140,420],[140,reef.L1.height],[-95,reef.L1.height]],8,colors.body);
  for(const [index,across] of [-reef.pipePairSpacing/2,reef.pipePairSpacing/2].entries()){
    axle(body,'Vertical reef pipe',[across,-80,45],[across,-80,reef.L4.height-400],21,colors.pipe);
    for(const level of ['L2','L3']){
      const angle=THREE.MathUtils.degToRad(reef[level].branchUpAngleDegrees);
      const tip=[across,210,reef[level].height-21*Math.cos(angle)];
      const base=[across,tip[1]-310*Math.cos(angle),tip[2]-310*Math.sin(angle)];
      axle(section,`${level} illustrative collar ${index+1}`,[across,-80,base[2]],base,21,colors.pipe).userData={role:'cantilever',approx:{length:'Derived from illustrative stand-off, not sourced.'}};
      const branch=axle(section,`${level} branch ${index+1}`,base,tip,21,colors.pipe);
      branch.userData={role:'branch',level,official:{highestPointMm:reef[level].height,upAngleDegrees:reef[level].branchUpAngleDegrees},approx:{lengthMm:310,radiusMm:21}};
    }
    axle(section,`L4 illustrative cantilever ${index+1}`,[across,-80,reef.L4.height-400],[across,210,reef.L4.height-250],21,colors.pipe).userData={role:'cantilever',approx:{profile:'Illustrative support, not official branch geometry.'}};
    const branch=axle(section,`L4 branch ${index+1}`,[across,210,reef.L4.height-250],[across,210,reef.L4.height],21,colors.pipe);
    branch.userData={role:'branch',level:'L4',official:{highestPointMm:reef.L4.height},approx:{lengthMm:250,radiusMm:21}};
  }
  if(pose==='algae'){
    const low=recipe.algae==='shortArm';const center=low?1000:1500;
    const marker=edges(section,'Provisional reef algae marker',new THREE.SphereGeometry(dimensions.algae.diameter/2,16,10),colors.provisional,[0,210,center]);
    marker.userData={role:'provisionalMarker',isScoringPiece:false,band:low?'low':'high',officialCenterHeightMm:(low?reef.algaeLow:reef.algaeHigh).centerHeight,officialDiameterMm:dimensions.algae.diameter,approx:{centerHeightMm:center,note:'Provisional center only, not a numerical official height or an additional held ball.'}};
  }
}

function climb(root,recipe) {
  if(recipe.climb==='park'){
    const outline=rectangle(root,'Illustrative park-area crop',[-500,950,0.5],[500,1400,0.5],colors.edge);
    outline.userData={role:'parkGuide',approx:{widthMm:1000,lengthMm:450,note:'Local cue only, not the official BARGE ZONE boundary or verified PARK.'}};
    return;
  }
  const cage=dimensions.cage;
  const bottom=recipe.climb==='deep'?cage.deepBottomHeight:cage.shallowBottomHeight;
  const top=bottom+cage.bodyHeight;const halfWidth=cage.outsideWidth/2;
  const body=group(root,`${recipe.climb} cage body`,{role:'cageBody',official:{bottomHeightMm:bottom,bodyHeightMm:cage.bodyHeight,outsideWidthMm:cage.outsideWidth,hookTargetHeightMm:recipe.climb==='deep'?cage.deepHookTargetHeight:cage.shallowHookTargetHeight},approx:{centerYmm:1385,depthMm:160,topWidthMm:140,topDepthMm:110,barThicknessMm:16,profile:'Illustrative taper and bar layout; fixed carpet datum, not fitted to a hook.'}});
  body.position.y=1385;
  for(const [name,width,depth,height] of [['Lower',cage.outsideWidth,160,bottom+8],['Upper',140,110,top-8]]){
    for(const sign of [-1,1]){
      box(body,`${name} cage crossbar`,[0,sign*(depth/2-8),height],[width,16,16],colors.edge);
      box(body,`${name} cage side bar`,[sign*(width/2-8),0,height],[16,depth-32,16],colors.edge);
    }
  }
  for(const across of [-1,1])for(const rearward of [-1,1])axle(body,'Sloping cage bar',[across*(halfWidth-8),rearward*72,bottom+16],[across*62,rearward*47,top-16],8,colors.pipe);
  const support=group(root,'Illustrative cage backdrop support',{role:'fieldSupport',approx:{heightMm:2200,postYmm:1460,note:'Cropped illustrative support, disconnected from cage; actual suspension and load path are not modeled.'}});
  for(const across of [-300,300])beam(support,'Backdrop support post',[across,1460,0],[across,1460,2200],30,30,colors.body);
  box(support,'Backdrop support crossmember',[0,1460,2185],[630,30,30],colors.body);
}

export function buildFieldScene(robotModel,recipe,pose) {
  if(!robotModel?.isObject3D||!recipe||!['travel','stow','floor','station','coral','algae','climb'].includes(pose))throw new Error('Field context requires a robot model, recipe and known pose');
  const root=new THREE.Group();root.name=`${recipe.id} ${pose} field context`;
  root.userData={title:'',note:'',source:'',provenContact:false,pose};
  if(pose==='travel'){
    Object.assign(root.userData,{title:'Isolated mechanism',note:`isolated; no field context. ${caveat}`,source:'No field dimensions used; existing mechanism model only.'});
    return root;
  }
  if(pose==='stow'){
    stow(root,robotModel);
    Object.assign(root.userData,{title:'Collapsed envelope reference',note:`Edges only; footprint follows the model chassis rails, not a certified starting outline. ${caveat}`,source:`game.json constraints, R101-R105 pp.77-78; starting height ${game.constraints.startingHeightMaximumMm} mm and maximum perimeter ${game.constraints.startingPerimeterMaximumMm} mm. XY outline derived from models.mjs, not an official rectangle.`});
    return root;
  }
  carpet(root);
  if(pose==='floor'){
    floor(root,robotModel,recipe);
    Object.assign(root.userData,{title:'Floor pickup approach',note:`Local carpet crop; loose pieces only when that type is absent from the robot. Ideal undeformed geometry, not a second held piece or initial algae-on-coral staging. ${caveat}`,source:source(dimensions.floorIdealizations,'Floor centers derived from half nominal diameter, not tool centers; coral/algae sizes from dimensionsMm.')});
  }else if(pose==='station'){
    station(root,recipe);
    Object.assign(root.userData,{title:'Coral station approach',note:`Cropped central 600 mm of the ${dimensions.coralStation.openingWidth} mm opening; crop edges are not actual jambs. Chute depth, side profile and supports illustrative. Approach gap is not a feed/contact solution. ${caveat}`,source:source(dimensions.coralStation,'Opening bottom, opening height/width and chute slope only; opening bottom is not a fed coral axis.')});
  }else if(pose==='coral'||pose==='algae'){
    reef(root,robotModel,recipe,pose);
    Object.assign(root.userData,{title:pose==='coral'?'Reef approach':`${recipe.algae==='shortArm'?'Low':'High'} reef-algae approach`,note:`One reef face with L1 trough and paired branches. Base profile, branch lengths and cantilever stand-off are illustrative; gap is intentional, not verified scoring.${pose==='algae'?' Rust wire marker is a provisional removal location, not another ball; numerical official algae center is unknown. No net or processor target is implied.':''} ${caveat}`,source:source(dimensions.reef,'L1 is the top/front trough edge; L2/L3/L4 are highest branch points, not gripper centers. Pipe-pair spacing is center to center; algae center heights remain null.')});
  }else {
    climb(root,recipe);
    Object.assign(root.userData,{title:recipe.climb==='park'?'Barge park approach':`${recipe.climb==='deep'?'Deep':'Shallow'} cage approach`,note:`${recipe.climb==='park'?'Illustrative park-area crop; no cage for this recipe.':'Cage remains at the official bottom datum, with a visible approach gap. Taper, depth, bars and disconnected backdrop support are illustrative; actual suspension is omitted. No hook target height is known.'} ${caveat}`,source:recipe.climb==='park'?'game.json scoring.criteria.park; M p.49. Bumper overlap criterion only; local outline is not an official zone boundary.':source(dimensions.cage,'Bottom of suspended cage, body height and outside width only; neither bottom nor top is a hook engagement target.')});
  }
  return root;
}