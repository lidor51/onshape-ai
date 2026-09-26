import * as THREE from 'three';
import {box, beam, axle, roller, sidePlate, palette} from './primitives.mjs';

export const intakePoses = Object.freeze(['open', 'collapsed', 'handoff']);

const proposalWarning = 'Approximate mechanism proposal inspired by the original side/plan drawings, not an exact reconstruction. Discrete manual poses are not continuous physics, solved linkage motion, swept clearance, contact, retention, stow, strength, rules or performance proof.';
const coralRadius = 57.15;
const coralBoreRadius = 50.8;
const coralLength = 301.625;
const ink = 0x283235;

export const intakeRecipes = Object.freeze([
  {id:'01', title:'Kicker and fixed V', mechanismId:'roll-kicker-fixed-v', mouthWidthMm:510, receiverCenter:[0,260,260], receiverAxis:'y', sourcePivot:[-60,180], stowIntent:'Fold pickup and kicker; retain the fixed V.'},
  {id:'02', title:'Opposed belts and cradle', mechanismId:'opposed-belt-cassette', mouthWidthMm:480, receiverCenter:[0,270,275], receiverAxis:'x', sourcePivot:[-50,215], stowIntent:'Fold the opposed cassette, not its stationary cradle.'},
  {id:'03', title:'Floating nose and indexer', mechanismId:'floating-nose-fixed-indexer', mouthWidthMm:520, receiverCenter:[0,295,242], receiverAxis:'y', sourcePivot:[30,300], stowIntent:'Raise the linked nose; indexer stays on the chassis.'},
  {id:'04', title:'Pivot Scoop', mechanismId:'pivoting-roller-scoop', mouthWidthMm:500, receiverCenter:[0,140,312], receiverAxis:'x', sourcePivot:[0,80], stowIntent:'Rotate the retained scoop inward about a low pivot.'},
  {id:'05', title:'Rising Drawer', mechanismId:'rising-sliding-drawer', mouthWidthMm:450, receiverCenter:[0,290,260], receiverAxis:'x', sourcePivot:null, stowIntent:'Raise the drawer before retracting; cam sequence unresolved.'},
  {id:'06', title:'Tip Cradle', mechanismId:'tipping-lengthwise-cradle', mouthWidthMm:400, receiverCenter:[90,320,245], receiverAxis:'y', sourcePivot:[25,205], stowIntent:'Tip the captured cradle toward the offset receiver.'},
  {id:'07', title:'Side Door', mechanismId:'side-entry-lift-slide', mouthWidthMm:350, receiverCenter:[0,300,240], receiverAxis:'y', sourcePivot:null, stowIntent:'Lift outside the side bumper, then translate inward.'},
  {id:'08', title:'Grab and Lift', mechanismId:'short-two-link-jaws', mouthWidthMm:350, receiverCenter:[0,240.525589,387.15], receiverAxis:'x', sourcePivot:[50,277.15], stowIntent:'Fold two 220 mm links with a proposed leveling wrist.'},
  {id:'09', title:'Wheel Deck', mechanismId:'differential-wheel-deck', mouthWidthMm:500, receiverCenter:[0,435,250], receiverAxis:'y', sourcePivot:null, stowIntent:'Fold only the kick-up nose; both wheel banks remain.'},
  {id:'10', title:'Segmented star tunnel', mechanismId:'segmented-star-tunnel', mouthWidthMm:450, receiverCenter:[0,260,282], receiverAxis:'x', sourcePivot:[15,225], stowIntent:'Fold the slotted star tunnel under its proposed floating ceiling.'},
  {id:'11', title:'1690 / 2056 reference chain', mechanismId:'reference-pickup-straightener-chain', mouthWidthMm:508, receiverCenter:[0,500,245.15], receiverAxis:'y', sourcePivot:[-350,334], stowIntent:'Fold the acquisition section; keep rear drive, independent banks and stopped cradle.', warning:'Reference-inspired hybrid, not a measured 1690 or 2056 clone. Top-row float and drive sequencing are unresolved.'},
  {id:'12', title:'Through-bumper cutout', mechanismId:'noncompliant-through-bumper-belt', mouthWidthMm:500, receiverCenter:[0,240,95], receiverAxis:'x', sourcePivot:null, stowIntent:'Retract only the proposed front belt tongue; low rear feed remains.', warning:'KNOWN NONCOMPLIANT 2025: actual 350 mm front bumper gap and separate 340 mm deep frame recess. R401/R402/R405 conflict; Q152 rejects the notch exception. Not a competition recommendation.'},
  {id:'13', title:'Bore-Lock Elevator', mechanismId:'internal-mandrel-lift', mouthWidthMm:350, receiverCenter:[0,240,280], receiverAxis:'y', sourcePivot:null, stowIntent:'Lift outside, accept in a saddle, withdraw the mandrel and transfer inward.', warning:'Half-transparent tube is an inspection aid. Bore ID 101.6 mm is an assumption; dirty-bore grip, pad collapse, outside latch and inward transfer are unproved.'},
  {id:'14', title:'1778 carrier, locked lower', mechanismId:'1778-carrier-locked-lower', mouthWidthMm:500, receiverCenter:[0,37.85,337.15], receiverAxis:'x', sourcePivot:null, stowIntent:'Raise and center the retained coral, then power the upper contact to offer.', warning:'Lower contact is LOCKED: nonrotating relative to the moving carrier, not world-fixed. Dark mesh crosses mark the locked axle. Proposed pivot and centering are not measured 1778 geometry.'},
].map(recipe => Object.freeze({...recipe, receiverCenter:Object.freeze(recipe.receiverCenter), sourcePivot:recipe.sourcePivot && Object.freeze(recipe.sourcePivot)})));

function group(parent, name, data = {}, position = [0,0,0]) {
  const result = new THREE.Group();
  result.name = name;
  result.userData = data;
  result.position.set(...position);
  parent.add(result);
  return result;
}

function stock(parent, name, center, size, color = palette.plate) {
  const mesh = box(parent, name, center, size, color);
  mesh.userData.role = 'structure';
  return mesh;
}

function strut(parent, name, start, end, width = 20, depth = 30, color = palette.rail) {
  const mesh = beam(parent, name, start, end, width, depth, color);
  mesh.userData.role = 'structure';
  return mesh;
}

function cylinder(parent, name, start, end, radius, color = palette.shaft, role = 'shaft') {
  const mesh = axle(parent, name, start, end, radius, color);
  mesh.userData.role = role;
  return mesh;
}

function contact(parent, name, center, width, radius, segmented = false, color = palette.coral) {
  const first = parent.children.length;
  roller(parent, name, center, width, radius, color, segmented);
  parent.children.slice(first).forEach((mesh, index) => {
    mesh.userData.role = index === 0 ? 'shaft' : 'roller';
    mesh.userData.contact = name;
  });
}

function cheeks(parent, name, width, outline, color = palette.plate) {
  for (const sign of [-1,1]) {
    const mesh = sidePlate(parent, `${name} ${sign < 0 ? 'left' : 'right'}`, sign * width / 2, outline, 8, color);
    mesh.userData.role = 'structure';
  }
}

function chassis(parent, split) {
  const frame = group(parent, '700 x 760 blank intake chassis', {role:'chassis', sizeMm:[700,760], bumperGapMm:split ? 350 : 0, frameRecessDepthMm:split ? 340 : 0});
  for (const across of [-325,325]) {
    strut(frame, 'Chassis side rail', [across,25,125], [across,735,125], 50, 50, palette.frame);
    stock(frame, 'Front mounting pad', [across,115,157], [65,85,8], palette.frame);
    stock(frame, 'Rear mounting pad', [across,650,157], [65,85,8], palette.frame);
    stock(frame, 'Side pan strip', [split ? Math.sign(across)*262.5 : Math.sign(across)*195,380,35], [split ? 175 : 285,680,5], palette.frame);
  }
  strut(frame, 'Rear frame rail', [-300,735,125], [300,735,125], 50, 50, palette.frame);
  if (split) {
    for (const sign of [-1,1]) strut(frame, 'Split front frame rail', [sign*175,25,125], [sign*300,25,125], 50, 50, palette.frame);
    strut(frame, 'Recess back rail, front face at 340', [-300,365,125], [300,365,125], 50, 50, palette.frame);
  } else strut(frame, 'Intact front frame rail', [-300,25,125], [300,25,125], 50, 50, palette.frame);
  const bumper = (name, center, size, section) => {
    const mesh = stock(frame, name, center, size, palette.bumper);
    mesh.userData = {role:'bumper', section, intactCentral:section === 'front' && !split};
  };
  for (const sign of [-1,1]) bumper('Side bumper', [sign*392.5,380,105], [85,760,120], 'side');
  bumper('Rear bumper', [0,802.5,105], [870,85,120], 'rear');
  if (split) {
    for (const sign of [-1,1]) bumper('Split front bumper flank', [sign*305,-42.5,105], [260,85,120], 'front');
  } else bumper('Intact front bumper', [0,-42.5,105], [870,85,120], 'front');
  return frame;
}

function receiver(parent, recipe) {
  const dock = group(parent, 'Fixed rough jaw receiver', {role:'receiver', center:[...recipe.receiverCenter], axis:recipe.receiverAxis, accepting:true}, recipe.receiverCenter);
  if (recipe.receiverAxis === 'x') dock.rotation.z = -Math.PI/2;
  for (const sign of [-1,1]) {
    stock(dock, 'Receiver saddle rail', [sign*75,0,-70], [16,340,16]);
    stock(dock, 'Receiver support foot', [sign*100,100,-100], [40,70,12], palette.frame);
    strut(dock, 'Receiver stanchion', [sign*100,100,-100], [sign*75,100,-40], 16, 20);
    for (const along of [-80,80]) stock(dock, 'Open accepting jaw', [sign*70,along,0], [16,38,55]);
  }
  stock(dock, 'Receiver rear bridge', [0,180,-70], [180,16,18], palette.rail);
  for (const along of [-90,90]) contact(dock, 'Receiver support roller', [0,along,-75.15], 130, 18, false, palette.rubber);
  return dock;
}

function fixedIndexer(parent, recipe) {
  const fixed = group(parent, 'Fixed indexer and receiver approach', {role:'fixedIndexer', mechanismId:recipe.mechanismId});
  const height = recipe.receiverCenter[2];
  const low = recipe.id === '12';
  for (const sign of [-1,1]) {
    stock(fixed, 'Indexer foot', [sign*285,100,low ? 25 : 160], [50,80,10], palette.frame);
    strut(fixed, 'Indexer post', [sign*285,100,low ? 25 : 160], [sign*285,100,height+30], 20, 25);
    stock(fixed, 'Indexer bearing cheek', [sign*265,100,height], [8,70,75]);
  }
  if (recipe.id !== '14') {
    const finish = Math.max(190,recipe.receiverCenter[1]-50);
    for (const sign of [-1,1]) strut(fixed, 'Fixed support finger', [sign*95,70,height-65], [sign*95,finish,height-65], 18, 8, palette.plate);
  } else {
    for (const sign of [-1,1]) strut(fixed, 'Stationary carrier docking rail', [sign*220,65,230], [sign*220,170,230], 20, 20);
  }
  return fixed;
}

function movingSection(parent, recipe, pose, pivot, collapsed, handoff, kind = 'pivot') {
  const stage = group(parent, 'Moving intake section', {role:'movingSection', component:'nose', mechanismId:recipe.mechanismId, motionKind:kind, anchor:[...pivot], discretePoseOnly:true}, pivot);
  const selected = pose === 'open' ? {} : pose === 'collapsed' ? collapsed : handoff;
  stage.position.add(new THREE.Vector3(...(selected.translation || [0,0,0])));
  stage.rotation.x = selected.pitch || 0;
  const datum = group(stage, 'Rigid nose construction datum', {}, pivot.map(value => -value));
  if (kind === 'pivot') {
    cylinder(parent, 'Stationary nose pivot axle', [-recipe.mouthWidthMm/2-20,pivot[1],pivot[2]], [recipe.mouthWidthMm/2+20,pivot[1],pivot[2]], 12);
    for (const sign of [-1,1]) stock(parent, 'Nose pivot bearing block', [sign*(recipe.mouthWidthMm/2+12),pivot[1],pivot[2]], [18,40,40], palette.rail);
  }
  return {stage, datum};
}

function belt(parent, name, start, end, width, radius = 22) {
  contact(parent, `${name} entry pulley`, [0,...start], width, radius, false, palette.rail);
  contact(parent, `${name} exit pulley`, [0,...end], width, radius, false, palette.rail);
  const distance = Math.hypot(end[0]-start[0],end[1]-start[1]);
  const normal = [-(end[1]-start[1])/distance,(end[0]-start[0])/distance];
  for (const sign of [-1,1]) strut(parent, `${name} belt run`, [0,start[0]+sign*radius*normal[0],start[1]+sign*radius*normal[1]], [0,end[0]+sign*radius*normal[0],end[1]+sign*radius*normal[1]], width, 5, palette.rubber);
}

function guideV(parent, width, start, throat, end, height) {
  for (const sign of [-1,1]) {
    strut(parent, 'Fixed V converging bank', [sign*width/2,start,height], [sign*76,throat,height], 14, 42);
    strut(parent, 'Fixed V parallel exit', [sign*76,throat,height], [sign*76,end,height], 14, 42);
  }
}

function coral(parent, center, axis = 'y', inspectBore = false) {
  const piece = group(parent, 'One nominal hollow coral', {role:'coral', outerDiameterMm:114.3, lengthMm:coralLength, assumedBoreDiameterMm:101.6, openEnds:2, inspectionHalfShell:inspectBore}, center);
  if (axis === 'x') piece.rotation.z = -Math.PI/2;
  const opaque = new THREE.MeshStandardMaterial({color:0xebe7d9,roughness:0.85,side:THREE.DoubleSide});
  const translucent = inspectBore ? opaque.clone() : null;
  if (translucent) {
    translucent.transparent = true;
    translucent.opacity = 0.18;
    translucent.depthWrite = false;
  }
  for (const [surface,radius] of [['outer',coralRadius],['bore',coralBoreRadius]]) {
    for (let half = 0; half < (inspectBore ? 2 : 1); half++) {
      const geometry = new THREE.CylinderGeometry(radius,radius,coralLength,48,1,true,inspectBore ? Math.PI/2+half*Math.PI : 0,inspectBore ? Math.PI : Math.PI*2);
      const shell = new THREE.Mesh(geometry,half === 1 ? translucent : opaque);
      shell.name = `Coral ${surface} ${half === 1 ? 'inspection half' : 'shell'}`;
      shell.userData = {role:'coralSurface', surface, openEnded:true};
      piece.add(shell);
    }
  }
  for (const sign of [-1,1]) {
    const rim = new THREE.Mesh(new THREE.RingGeometry(coralBoreRadius,coralRadius,48),opaque);
    rim.name = 'Open annular coral end';
    rim.rotation.x = Math.PI/2;
    rim.position.y = sign*coralLength/2;
    rim.userData = {role:'coralRim', boreOpen:true};
    piece.add(rim);
  }
  return piece;
}

function rollerNose(root, fixed, recipe, pose) {
  const settings = {
    '01':{pivot:[0,-60,180], folded:-1.45, offer:-0.12, outline:[[-455,15],[-400,125],[-60,215],[-30,175],[-330,50]], rolls:[[-417,173,28],[-268,266,32]]},
    '03':{pivot:[0,30,300], folded:-1.05, offer:-0.1, outline:[[-450,40],[-400,125],[30,320],[45,280],[-270,125]], rolls:[[-415,170,30],[-282,265,34]]},
    '04':{pivot:[0,0,80], folded:-1.8, offer:-2.1, outline:[[-440,8],[-440,110],[-120,145],[20,95],[20,55],[-110,20]], rolls:[[-390,63.5,63.5],[-150,63.5,63.5]]},
    '06':{pivot:[0,25,205], folded:-1.7, offer:-Math.PI, outline:[[-440,40],[-405,180],[-140,310],[40,230],[30,180],[-340,60]], rolls:[[-380,147,63.5],[-140,273,63.5]]},
    '09':{pivot:[0,-70,225], folded:-1.4, offer:-0.1, outline:[[-400,12],[-360,110],[-80,255],[-50,220],[-270,70]], rolls:[[-335,140,40],[-200,155,38]]},
  }[recipe.id];
  const {datum} = movingSection(root,recipe,pose,settings.pivot,{pitch:settings.folded},{pitch:settings.offer});
  cheeks(datum, 'Flat pickup carrier plate', recipe.mouthWidthMm, settings.outline);
  settings.rolls.forEach(([rearward,up,radius], index) => contact(datum,index ? 'Pickup kicker / retention' : 'Acquisition nose roller',[0,rearward,up],recipe.mouthWidthMm-25,radius,recipe.id === '03'));
  for (const across of [-170,170]) strut(datum,'Flat supported pickup finger',[across,-410,20],[across,-105,170],24,6);
  if (recipe.id === '01') {
    guideV(fixed,510,-80,130,315,260);
    contact(fixed,'Fixed exit roller',[0,135,345],180,28);
  }
  if (recipe.id === '03') {
    for (const sign of [-1,1]) {
      strut(datum,'Floating parallel upper link',[sign*225,30,300],[sign*225,-280,200],12,24);
      strut(datum,'Floating parallel lower link',[sign*225,30,210],[sign*225,-280,110],12,24);
      strut(datum,'Floating nose end link',[sign*225,-280,110],[sign*225,-280,200],12,24);
      cylinder(datum,'Float spring placeholder',[sign*235,-40,245],[sign*235,-175,190],10,palette.shaft);
      cylinder(fixed,'Stationary side indexer wheel',[sign*85,110,215],[sign*85,110,265],28,palette.rail,'roller');
    }
    contact(fixed,'Fixed indexer top roll',[0,190,327],180,28);
    guideV(fixed,340,-20,180,300,242);
  }
  if (recipe.id === '04') {
    for (const across of [-185,0,185]) strut(datum,'Scoop floor slat',[across,-410,8],[across,-130,8],35,6);
    stock(datum,'Scoop retaining lip',[0,-110,35],[390,8,50]);
    return {parent:datum,center:[0,-270,78],axis:'x'};
  }
  if (recipe.id === '06') {
    for (const across of [10,170]) strut(datum,'Offset tipping cradle runner',[across,-400,72],[across,-90,205],16,8);
    stock(datum,'Cradle end stop',[90,-65,240],[150,8,65]);
    return {parent:datum,center:[90,-240,192],axis:'y'};
  }
  if (recipe.id === '09') {
    for (const sign of [-1,1]) {
      const bank = group(fixed,`${sign < 0 ? 'Left' : 'Right'} independent speed bank`,{role:'differentialBank', driveIndependent:true});
      stock(bank,'Wheel bank plate',[sign*65,180,125],[75,310,8]);
      for (const rearward of [80,180,280]) contact(bank,'Differential deck wheel',[sign*65,rearward,164.85],50,28,false,sign < 0 ? palette.coral : palette.rail);
      cylinder(bank,'Independent bank drive',[sign*65-20,345,150],[sign*65+20,345,150],24);
    }
    guideV(fixed,440,10,330,440,250);
  }
  return {parent:root,center:[0,recipe.receiverCenter[1]-110,recipe.receiverCenter[2]],axis:recipe.receiverAxis};
}

function opposedBelts(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,-50,215],{pitch:-1.25},{pitch:-0.1});
  cheeks(datum,'Opposed cassette side plate',480,[[-420,20],[-435,230],[-150,360],[-45,235],[-75,150]]);
  belt(datum,'Lower capture belt',[-316,64],[-86,188],300);
  belt(datum,'Upper floating belt',[-391,203],[-161,327],300);
  for (const sign of [-1,1]) {
    strut(datum,'Upper belt float slot',[sign*215,-160,300],[sign*215,-160,365],14,18);
    cylinder(datum,'Upper belt preload spring',[sign*215,-250,265],[sign*215,-240,320],9);
  }
  stock(fixed,'Stopped crosswise cradle lip',[0,345,240],[350,10,45]);
  return {parent:datum,center:[0,-238,195],axis:'x'};
}

function drawer(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,-100,220],{translation:[0,300,200]},{translation:[0,380,200]},'lift-slide');
  cheeks(datum,'Drawer side plate',450,[[-415,0],[-415,180],[-380,195],[-165,45],[-165,0]]);
  contact(datum,'Overhead pickup roller',[0,-345,155],420,63.5);
  for (const sign of [-1,1]) {
    strut(fixed,'Stationary drawer rail',[sign*215,-140,235],[sign*215,430,235],22,30);
    strut(fixed,'Vertical drawer guide',[sign*235,-140,30],[sign*235,-140,250],18,24);
    stock(datum,'Sliding drawer shoe',[sign*215,-200,25],[25,100,28],palette.rail);
    strut(datum,'Drawer lower slat',[sign*140,-405,5],[sign*140,-175,5],45,6);
  }
  stock(datum,'Drawer retaining lip',[0,-170,30],[400,8,50]);
  return {parent:datum,center:[0,-265,65],axis:'x'};
}

function sideEntry(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[-455,300,240],{translation:[480,0,172.85]},{translation:[605,0,172.85]},'side-lift-slide');
  const intake = group(datum,'Side-facing cassette',{},[-560,300,0]);
  intake.rotation.z = -Math.PI/2;
  cheeks(intake,'Side door carrier plate',350,[[-135,10],[-135,160],[90,200],[105,10]]);
  contact(intake,'Side entry acquisition roller',[0,-105,140],325,35);
  contact(intake,'Side carrier lower roller',[0,40,22],325,22);
  for (const across of [-125,125]) strut(intake,'Side tray runner',[across,-130,7],[across,95,7],22,8);
  stock(intake,'Side retaining lip',[0,95,45],[320,8,80]);
  for (const rearward of [130,470]) {
    strut(fixed,'Outside side lift rail',[-460,rearward,30],[-460,rearward,355],20,25);
    strut(fixed,'Raised inward slide rail',[-460,rearward,355],[150,rearward,355],20,25);
    stock(datum,'Side lift carriage shoe',[-460,rearward,120],[35,35,65]);
  }
  return {parent:datum,center:[-605,300,67.15],axis:'y'};
}

function twoLinkJaws(root, recipe, pose) {
  const pitch = {open:0,collapsed:-1.1,handoff:-Math.PI/2}[pose];
  const elbowPitch = {open:Math.PI/2,collapsed:3.6,handoff:4*Math.PI/3}[pose];
  const {stage} = movingSection(root,recipe,pose,[0,50,277.15],{pitch},{pitch},'pivot');
  const elbow = group(stage,'Second short link',{role:'articulatedLink'},[0,-220,0]);
  elbow.rotation.x = elbowPitch;
  for (const link of [stage,elbow]) {
    for (const across of [-115,115]) strut(link,'220 mm flat arm link',[across,0,0],[across,-220,0],12,35);
    cylinder(link,'Two-link joint axle',[-140,0,0],[140,0,0],18);
  }
  const jaws = group(elbow,'Leveling end jaws',{role:'captureJaws'},[0,-220,0]);
  jaws.rotation.x = -(pitch+elbowPitch);
  for (const sign of [-1,1]) {
    stock(jaws,'End-grip cheek',[sign*165,0,0],[12,130,95]);
    stock(jaws,'Jaw lower hook',[sign*140,0,-62],[55,80,12]);
    stock(jaws,'Jaw rubber end pad',[sign*157,0,0],[5,55,55],palette.rubber);
    cylinder(jaws,'Jaw closure pivot',[sign*165,-65,-20],[sign*165,-65,25],10);
  }
  strut(jaws,'Jaw rear bridge',[-165,80,20],[165,80,20],20,20);
  return {parent:jaws,center:[0,0,0],axis:'x'};
}

function starTunnel(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,15,225],{pitch:-1.35},{pitch:-0.08});
  cheeks(datum,'Tunnel cheek',450,[[-420,0],[-405,160],[-220,310],[40,360],[50,210],[-230,90]]);
  for (const [row,rearward,up,radius] of [[0,-357,61,44],[1,-219,155,45],[2,-56,179,48]]) {
    cylinder(datum,'Segmented star shaft',[-240,rearward,up],[240,rearward,up],14);
    for (const across of [-155,0,155]) {
      const outline = Array.from({length:16},(_,index) => {
        const angle = index*Math.PI/8+row*0.22;
        const reach = index%2 ? radius*0.57 : radius;
        return [rearward+reach*Math.cos(angle),up+reach*Math.sin(angle)];
      });
      const wheel = sidePlate(datum,'Replaceable star wheel segment',across,outline,32,palette.coral);
      wheel.userData = {role:'roller', profile:'unsolved-star', segment:true};
    }
  }
  for (const across of [-215,-80,80,215]) strut(datum,'Slotted tunnel support finger',[across,-400,10],[across,25,216],16,6);
  for (const rearward of [-245,-155,-65,25]) stock(datum,'Floating tunnel ceiling slat',[0,rearward,355],[425,24,8],palette.rail);
  for (const sign of [-1,1]) cylinder(datum,'Ceiling spring mount',[sign*190,10,290],[sign*190,10,390],10);
  contact(fixed,'Tunnel exit support',[0,155,204.85],340,20);
  return {parent:root,center:[0,125,282],axis:'x'};
}

function referenceChain(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,-100,250],{pitch:-1.3},{pitch:-0.05});
  cheeks(datum,'Acquisition carrier cheek',508,[[-455,5],[-455,315],[-350,350],[-100,270],[-110,200],[-340,20]]);
  contact(datum,'Lower acquisition packet row',[0,-380,45],480,38,true);
  contact(datum,'Powered kicker packet row',[0,-300,151],460,37,true);
  const floating = group(datum,'Short floating upper row',{floatIntentMm:15},[0,-350,334]);
  contact(floating,'Floating powered top packets',[0,-73,-49],470,32,true,palette.rail);
  for (const sign of [-1,1]) {
    strut(floating,'Short upper float arm',[sign*225,0,0],[sign*225,-73,-49],12,25);
    cylinder(floating,'Top row preload spring',[sign*215,-10,5],[sign*215,-63,-30],9);
    const bank = group(fixed,`${sign < 0 ? 'Left' : 'Right'} independent straightener`,{role:'straightenerBank', driveIndependent:true});
    stock(bank,'Straightener mounting plate',[sign*115,130,195],[85,290,8]);
    for (const rearward of [25,130,235]) cylinder(bank,'Vertical straightener wheel',[sign*86,rearward,217],[sign*86,rearward,273],27,palette.rail,'roller');
  }
  contact(fixed,'Retained rear drive packet row',[0,-222,151],450,37,true);
  for (const across of [-190,-95,95,190]) strut(datum,'Acquisition support finger',[across,-430,8],[across,-150,188],18,6);
  stock(fixed,'Stopped cradle lip',[0,651,205],[140,8,35]);
  for (const rearward of [345,610]) stock(fixed,'Cradle event sensor block',[100,rearward,235],[18,24,20],ink);
  return {parent:root,center:[0,340,245.15],axis:'y'};
}

function bumperGap(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,-80,90],{translation:[0,210,0]},{translation:[0,20,0]},'tongue-slide');
  cheeks(datum,'Retracting low entry tongue',330,[[-420,0],[-395,45],[-70,64],[-70,25]]);
  belt(datum,'Entry upper belt',[-350,141.314],[-100,155.65],220,25);
  for (const sign of [-1,1]) {
    strut(datum,'Shallow entry tray finger',[sign*120,-420,2],[sign*120,-80,21],25,5);
    strut(fixed,'Low guide through actual gap',[sign*163,-75,60],[sign*163,185,83],8,40);
    strut(fixed,'Tongue slide guide',[sign*155,-60,30],[sign*155,210,30],12,18);
  }
  belt(fixed,'Fixed low rear feed',[-65,157.65],[240,175.15],220,25);
  stock(fixed,'Low fixed receiving tray',[0,130,30],[310,230,6]);
  return {parent:root,center:[0,105,87.5],axis:'x'};
}

function mandrelLift(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,-102.5,57.15],{translation:[0,0,222.85]},{translation:[0,0,412.85]},'vertical-mandrel-slide');
  for (const sign of [-1,1]) {
    strut(fixed,'Outside mandrel lift rail',[sign*155,-102.5,30],[sign*155,-102.5,590],22,28);
    stock(fixed,'Mandrel lift foot',[sign*155,-75,20],[55,100,16],palette.frame);
    stock(datum,'Mandrel lift carriage shoe',[sign*155,-102.5,80],[40,40,95]);
    cylinder(fixed,'Lift cable idler',[sign*155-12,-102.5,550],[sign*155+12,-102.5,550],22,palette.rail,'roller');
  }
  stock(datum,'Mandrel carriage bridge',[0,-90,80],[310,20,18]);
  cylinder(datum,'Internal mandrel stem',[0,-260,57.15],[0,-100,57.15],12);
  cylinder(datum,'Mandrel taper nose',[0,-282,57.15],[0,-260,57.15],8,palette.rail);
  for (const angle of [0,2*Math.PI/3,4*Math.PI/3]) {
    const radial = 43.8;
    const pad = stock(datum,'Internal expanding bore pad',[Math.sin(angle)*radial,-225,57.15+Math.cos(angle)*radial],[16,82,14],palette.coral);
    pad.rotation.y = angle;
    pad.userData = {role:'mandrelPad', expansion:'illustrative', outerRadiusMm:50.8};
    strut(datum,'Pad expansion spoke',[0,-225,57.15],[Math.sin(angle)*38,-225,57.15+Math.cos(angle)*38],8,8,palette.shaft);
  }
  for (const sign of [-1,1]) {
    stock(datum,'External acceptance saddle finger',[sign*68,-245,5],[12,115,12]);
    stock(datum,'Outside saddle latch',[sign*70,-180,52],[10,18,65],palette.rail);
    strut(fixed,'Raised receiver transfer guide',[sign*100,-95,205],[sign*100,390,205],20,20);
  }
  return {parent:datum,center:[0,-260.8125,57.15],axis:'y'};
}

function lockedCarrier(root, fixed, recipe, pose) {
  const {datum} = movingSection(root,recipe,pose,[0,0,57.15],{pitch:-1.4},{pitch:-Math.PI/2});
  cheeks(datum,'1778-style flat carrier cheek',500,[[-375,120],[-350,190],[-205,85],[-190,0],[-245,0]]);
  for (const sign of [-1,1]) strut(datum,'Proposed carrier lift arm',[sign*250,0,57.15],[sign*250,-250,90],16,32);
  const locked = group(datum,'Lower contact locked to carrier',{role:'lockedContact', rotation:'locked', relativeTo:'movingCarrier'},[0,-221.911178,36.911178]);
  contact(locked,'Nonrotating lower support',[0,0,0],480,25,false,palette.shaft);
  for (const across of [-270,270]) {
    for (const sign of [-1,1]) {
      const mark = strut(locked,'Locked axle dark cross',[across,-15,sign*15],[across,15,-sign*15],6,6,ink);
      mark.userData = {role:'lockedAxisMark', relativeTo:'movingCarrier'};
    }
  }
  contact(datum,'Powered upper pickup and handoff',[0,-338.088822,153.088822],480,25,true);
  for (const sign of [-1,1]) {
    strut(datum,'Centering finger',[sign*235,-320,100],[sign*169,-280,100],12,20);
    stock(datum,'Coral end centering pad',[sign*162,-280,95],[8,45,45],palette.rubber);
  }
  stock(datum,'Retaining stop proposal',[0,-193,90],[310,8,45],palette.rail);
  stock(fixed,'Receiver ready sensor',[210,120,325],[20,25,22],ink);
  return {parent:datum,center:[0,-280,95],axis:'x'};
}

export function buildIntake(id, pose = 'open') {
  const recipe = intakeRecipes.find(item => item.id === id);
  if (!recipe || !intakePoses.includes(pose)) throw new Error(`Unknown intake id or pose: ${id} / ${pose}`);
  const root = new THREE.Group();
  root.name = `${id} ${recipe.title}`;
  root.userData = {
    id, pose, title:recipe.title, status:'INTAKE_MECHANISM_PROPOSAL', kinematicsProven:false,
    warning:[proposalWarning,recipe.warning].filter(Boolean).join(' '), flowHref:`../concept-${id}.png`,
    receiverCenter:[...recipe.receiverCenter], receiverAxis:recipe.receiverAxis, pieceCount:1,
    mechanismId:recipe.mechanismId, mouthWidthMm:recipe.mouthWidthMm, stowIntent:recipe.stowIntent,
    sourceData:'outputs/concepts/concepts.json', units:'mm', poseInterpretation:'discrete manual proposal',
  };
  chassis(root,id === '12');
  const dock = receiver(root,recipe);
  const fixed = fixedIndexer(root,recipe);
  const builders = {'02':opposedBelts,'05':drawer,'07':sideEntry,'10':starTunnel,'11':referenceChain,'12':bumperGap,'13':mandrelLift,'14':lockedCarrier};
  const captured = id === '08' ? twoLinkJaws(root,recipe,pose) : builders[id] ? builders[id](root,fixed,recipe,pose) : rollerNose(root,fixed,recipe,pose);
  let piece;
  if (pose === 'handoff') piece = coral(dock,[0,0,0],'y',id === '13');
  else if (pose === 'collapsed') piece = coral(captured.parent,captured.center,captured.axis,id === '13');
  else {
    const floorCenter = id === '07' ? [-760,300,coralRadius] : id === '13' ? [0,-328,coralRadius] : id === '08' ? [0,-240,coralRadius] : [0,id === '11' ? -475 : -440,coralRadius];
    piece = coral(root,floorCenter,id === '07' || id === '13' ? 'y' : 'x',id === '13');
  }
  piece.userData.state = pose === 'open' ? 'floor-entry' : pose === 'collapsed' ? 'captured-proposal' : 'receiver-offer';
  root.updateMatrixWorld(true);
  return root;
}