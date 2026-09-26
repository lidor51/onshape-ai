import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Resvg } from '../subsystem-ab/concepts/node_modules/@resvg/resvg-js/index.js';
import { validateRobot, screenHardware } from './validate.mjs';

const root = new URL('./', import.meta.url);
const output = new URL('../../outputs/whole-robots/', root);
const sourceNames = ['robots-a.json','robots-b.json','robots-c.json','robots-d.json'];
const robots = (await Promise.all(sourceNames.map(async name => JSON.parse(await readFile(new URL(name, root), 'utf8'))))).flat().map(validateRobot).sort((first, second) => first.id.localeCompare(second.id));
assert.deepEqual(robots.map(robot => robot.id), Array.from({ length: 10 }, (_, index) => `R${String(index + 1).padStart(2, '0')}`));
const hardwareChecks = robots.map(screenHardware);
const game = JSON.parse(await readFile(new URL('game.json', root), 'utf8'));
const colors = { structure: '#537b9d', coral: '#b97812', algae: '#238461', climb: '#865b95', electrical: '#737b83', bumper: '#b16a65', ink: '#243631', muted: '#65776e' };
const fills = { structure: '#d8e5ed', coral: '#f5dfb1', algae: '#cbe9db', climb: '#e4d7ea', electrical: '#e0e4e7', bumper: '#ead0cc' };
const width = 2200;
const height = 1630;
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text = (x,y,value,size=20,color=colors.ink,weight=400,extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" ${extra}>${esc(value)}</text>`;
const line = (first,last,color=colors.muted,size=2,extra='') => `<line x1="${first[0]}" y1="${first[1]}" x2="${last[0]}" y2="${last[1]}" stroke="${color}" stroke-width="${size}" ${extra}/>`;
const rect = (x,y,boxWidth,boxHeight,fill='none',stroke='none',extra='') => `<rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" fill="${fill}" stroke="${stroke}" ${extra}/>`;

function wrap(value, limit) {
  const rows = [];
  for (const word of value.split(/\s+/)) {
    if (!rows.length || rows.at(-1).length + word.length + 1 > limit) rows.push(word);
    else rows[rows.length - 1] += ` ${word}`;
  }
  return rows;
}

function paragraph(x,y,value,limit=54,size=21,color=colors.ink) {
  return wrap(value,limit).map((row,index) => text(x,y+index*(size+7),row,size,color)).join('');
}

const iso = ([across,rearward,up]) => [495 + 0.255*(0.866*across+0.5*(rearward-380)), 905 + 0.255*(0.3*across-0.52*(rearward-380)-up)];
const side = ([across,rearward,up]) => [1060+(rearward+457.2)*0.285,1065-up*0.285];
const top = ([across,rearward,up]) => [1640+(across+807.2)*0.29,205+(rearward+457.2)*0.29];
const distance = (first,second) => Math.hypot(...first.map((value,index) => value-second[index]));

function poly(points,project,stroke,fill='none',strokeWidth=2,extra='') {
  return `<polyline points="${points.map(point => project(point).map(value => value.toFixed(2)).join(',')).join(' ')}" stroke="${stroke}" fill="${fill}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}

function boxShape(box,project,mode,opacity=1) {
  const [across,rearward,up] = box.center;
  const [halfAcross,halfRear,halfUp] = box.size.map(size => size/2);
  const color = colors[box.role];
  const reserve = /reserve|service|keep.?out/i.test(box.name);
  const extra = `${box.state === 'deployed' || reserve ? 'stroke-dasharray="7 5"' : ''}`;
  const fill = reserve ? 'none' : fills[box.role];
  const corners = [];
  for (const high of [-1,1]) for (const rear of [-1,1]) for (const right of [-1,1]) corners.push([across+right*halfAcross,rearward+rear*halfRear,up+high*halfUp]);
  const faces = project === iso ? [[0,1,5,4,0],[1,3,7,5,1],[4,5,7,6,4]] : [project === side ? [0,2,6,4,0] : [0,1,3,2,0]];
  return `<g opacity="${opacity}" data-role="${box.role}" data-state="${box.state}"><title>${esc(box.name)} (${esc(box.state)})</title>${faces.map(face => poly(face.map(index => corners[index]),project,color,fill,mode==='top'?1.7:2,extra)).join('')}</g>`;
}

function linkShape(link,project,mode,opacity=1) {
  const scale = project===iso ? 0.255 : project===side ? 0.285 : 0.29;
  const thickness = Math.max(mode==='side' ? 3 : 4, link.radius*scale*(mode==='hero'?1.7:0.8));
  const extra = link.state==='deployed' && mode!=='hero' ? 'stroke-dasharray="9 6"' : '';
  return `<g opacity="${opacity}" data-role="${link.role}" data-state="${link.state}"><title>${esc(link.name)}</title>${poly(link.points,project,colors[link.role],'none',thickness,extra)}${link.points.map(point => {const [horizontal,vertical]=project(point); return `<circle cx="${horizontal}" cy="${vertical}" r="${Math.max(3,link.radius*scale*0.65)}" fill="white" stroke="${colors[link.role]}" stroke-width="1.7"/>`;}).join('')}</g>`;
}

function highlightTools(robot) {
  return ['coral','algae'].map(role => {
    const options = robot.geometry.tools.filter(tool => tool.role===role && tool.state==='deployed');
    const scoring = role==='coral' ? options.filter(tool=>/Coral L[1-4]/i.test(tool.name)) : options;
    return (scoring.length?scoring:options).sort((first,second)=>second.center[2]-first.center[2])[0];
  }).filter(Boolean);
}

function hardware(robot,project,mode) {
  const highlighted = highlightTools(robot);
  const linked = robot.geometry.links.filter(link => link.state!=='deployed' || link.role==='climb' || highlighted.some(tool => link.points.some(point=>distance(point,tool.center)<1)));
  const boxes = [...robot.geometry.boxes].sort((first,second) => first.center[2]-second.center[2]);
  const links = mode==='hero' ? linked : robot.geometry.links;
  const tools = mode==='hero' ? robot.geometry.tools.filter(tool=>tool.state!=='deployed'||highlighted.includes(tool)) : robot.geometry.tools;
  return boxes.filter(box=>mode!=='top'||box.state!=='deployed').map(box=>boxShape(box,project,mode,box.state==='deployed'?0.65:0.9)).join('')
    + links.filter(link=>mode!=='top'||link.state!=='deployed').map(link=>linkShape(link,project,mode,link.state==='deployed'&&mode!=='hero'?0.45:0.85)).join('')
    + tools.filter(tool=>mode!=='top'||tool.state!=='deployed').map(tool=>boxShape(tool,project,mode,tool.state==='deployed'&&mode!=='hero'?0.5:0.8)).join('');
}

function chassis(project,mode) {
  const shapes = [
    { name:'Chassis',role:'structure',center:[0,380,120],size:[700,760,100],state:'base' },
    { name:'Front bumper',role:'bumper',center:[0,-42.5,105],size:[870,85,120],state:'base' },
    { name:'Rear bumper',role:'bumper',center:[0,802.5,105],size:[870,85,120],state:'base' },
    { name:'Left bumper',role:'bumper',center:[-392.5,380,105],size:[85,760,120],state:'base' },
    { name:'Right bumper',role:'bumper',center:[392.5,380,105],size:[85,760,120],state:'base' },
  ];
  for (const across of [-250,250]) for (const rearward of [110,650]) shapes.push({name:'Swerve module envelope',role:'electrical',center:[across,rearward,65],size:[150,150,100],state:'base'});
  return shapes.map(box=>boxShape(box,project,mode,0.9)).join('');
}

function dimensions(robot) {
  const items = [...robot.geometry.boxes,...robot.geometry.tools].filter(item=>item.state!=='deployed');
  const links = robot.geometry.links.filter(item=>item.state!=='deployed');
  const stow = Math.max(...items.map(item=>item.center[2]+item.size[2]/2),...links.flatMap(item=>item.points.map(point=>point[2]+item.radius)));
  return { stow, maximum: Math.max(...robot.geometry.tools.map(tool=>tool.center[2]+tool.size[2]/2)) };
}

function capabilityLine(robot) {
  const cap = robot.capabilities;
  const algaeSources = cap.algaeSources.map(source=>({reefLow:'low reef',reefHigh:'high reef',floor:'floor'}[source])).join(' / ');
  return `CORAL ${cap.coralLevels.map(level=>`L${level}`).join('/')} | ${cap.coralSources.join('+')}    ALGAE ${algaeSources} -> ${cap.algaeDestinations.join('+')}    ENDGAME ${cap.climb}    CARRY ${cap.simultaneousCarry?'one each':'serial'}`;
}

function viewPlots(robot) {
  const values = dimensions(robot);
  const primary = highlightTools(robot);
  const content = [];
  content.push(text(35,196,'AXONOMETRIC / WHOLE ROBOT',21,colors.ink,650),text(1030,196,'SIDE / REACH OPTIONS',21,colors.ink,650),text(1640,196,'TOP / STARTING PACKAGE',21,colors.ink,650));
  content.push(rect(30,210,960,920,'#f7faf8'),rect(1010,210,600,920,'#fbfcfb'),rect(1630,210,540,535,'#f7faf8'));
  content.push(`<g clip-path="url(#iso-${robot.id})">`);
  for (let across=-600;across<=600;across+=200) content.push(poly([[across,-350,0],[across,1150,0]],iso,'#e3eae5'));
  for (let rearward=-200;rearward<=1000;rearward+=200) content.push(poly([[-600,rearward,0],[600,rearward,0]],iso,'#e3eae5'));
  content.push(poly([[-350,0,1066.8],[350,0,1066.8],[350,760,1066.8],[-350,760,1066.8],[-350,0,1066.8]],iso,'#8a9b91','none',1,'stroke-dasharray="6 5"'));
  content.push(chassis(iso,'hero'),hardware(robot,iso,'hero'));
  for (const tool of primary) {
    const [horizontal,vertical] = iso(tool.center);
    const right = tool.role==='algae';
    const labelX = right ? 745 : 50;
    const labelY = Math.max(250,Math.min(940,vertical-35));
    content.push(line([horizontal,vertical],[right?labelX-10:labelX+220,labelY+7],colors[tool.role],1.6));
    content.push(paragraph(labelX,labelY,tool.name,26,18,colors[tool.role]));
  }
  content.push('</g>');
  content.push(text(48,1110,'Alternate working poses; shared mechanisms are NOT simultaneous copies.',18,colors.muted));
  content.push(`<g clip-path="url(#side-${robot.id})">`);
  for (let up=0;up<=2800;up+=500) {
    content.push(line(side([0,-430,up]),side([0,1190,up]),'#e2e8e4',1));
    content.push(text(1020,side([0,0,up])[1]-5,`${up}`,13,colors.muted));
  }
  const levels = game.dimensionsMm.reef;
  for (const level of robot.capabilities.coralLevels) {
    const up = levels[`L${level}`].height;
    const screen = side([0,0,up]);
    content.push(line([1050,screen[1]],[1540,screen[1]],'#bca77b',1,'stroke-dasharray="5 5"'));
    content.push(text(1546,screen[1]+5,`L${level}`,16,colors.coral,650));
  }
  content.push(line(side([0,-457.2,0]),side([0,-457.2,2800]),colors.bumper,1,'stroke-dasharray="5 5"'));
  content.push(line(side([0,1217.2,0]),side([0,1217.2,2800]),colors.bumper,1,'stroke-dasharray="5 5"'));
  content.push(line(side([0,0,1066.8]),side([0,760,1066.8]),colors.muted,1.6,'stroke-dasharray="8 5"'));
  content.push(chassis(side,'side'),hardware(robot,side,'side'));
  for (const role of ['coral','algae']) {
    const route = robot.geometry.routes.find(route=>route.role===role&&/floor/i.test(route.name)) ?? robot.geometry.routes.find(route=>route.role===role);
    if (route) content.push(poly(route.points,side,colors[role],'none',2.5,`stroke-dasharray="3 5" marker-end="url(#arrow-${robot.id}-${role})"`));
  }
  content.push('</g>');
  content.push(text(1030,1092,'Dashed poses are not checked sweeps.',17,colors.muted));
  content.push(text(1030,1117,'L1 edge / L2-L4 tips, NOT tool-center targets.',17,colors.muted));
  content.push(chassis(top,'top'),hardware(robot,top,'top'));
  content.push(text(1690,728,'700 x 760 mm chassis / intact bumpers',18,colors.muted));
  content.push(text(1640,790,`STOW ENVELOPE: ${values.stow.toFixed(0)} mm high`,21,colors.ink,650));
  content.push(text(1640,822,`START LIMIT: ${game.constraints.startingHeightMaximumMm} mm`,18,colors.muted));
  const legend = [['coral','Coral acquisition / score'],['algae','Algae acquisition / score'],['structure','Structure / pivots / lift'],['climb','Climb or parking plan'],['electrical','Battery / electrical / service']];
  legend.forEach(([role,label],index) => {const vertical=870+index*33;content.push(line([1640,vertical-7],[1680,vertical-7],colors[role],6),text(1692,vertical,label,19,colors.muted));});
  content.push(text(1640,1070,'Solid = base or stow. Dashed = pose / reserve.',17,colors.muted));
  content.push(text(1640,1097,'All views use the same 3D block/link coordinates.',17,colors.muted));
  content.push(text(1640,1124,'Algae 412.75 +/- 6.35; coral 301.625 x 114.3 mm.',17,colors.muted));
  return content.join('');
}

function renderSheet(robot) {
  const lower = [
    ['STRATEGIC ROLE',robot.strategy,colors.ink],
    ['CORAL PATH',robot.cycle.coral,colors.coral],
    ['ALGAE PATH',robot.cycle.algae,colors.algae],
    ['FIRST PROOF / MAIN TRADEOFF',`${robot.firstTest} ${robot.tradeoff}`,colors.climb],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title-${robot.id}"><title id="title-${robot.id}">${esc(robot.id)} ${esc(robot.title)}: whole robot concept, untested</title>
<defs><clipPath id="iso-${robot.id}">${rect(30,210,960,875)}</clipPath><clipPath id="side-${robot.id}">${rect(1010,215,595,870)}</clipPath>${['coral','algae'].map(role=>`<marker id="arrow-${robot.id}-${role}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${colors[role]}"/></marker>`).join('')}</defs>
${rect(0,0,width,height,'white')}<g font-family="'Aptos','Segoe UI',sans-serif" letter-spacing="0">
${rect(0,0,13,height,colors.structure)}${text(35,64,robot.id,43,colors.structure,700)}${text(155,64,robot.title,43,colors.ink,650)}
${text(35,104,robot.family,24,colors.muted)}${text(35,143,capabilityLine(robot),21,colors.ink,600)}
${viewPlots(robot)}${line([35,1160],[2160,1160],'#cbd8d0',1)}
${lower.map(([label,value,color],index)=>text(35+index*535,1200,label,18,color,700)+paragraph(35+index*535,1237,value,51,21)).join('')}
${text(35,1542,'STAGE 2 / PROPOSED GEOMETRY. No contact, stability, loaded climb, ballistics or rules-compliance pass.',22,colors.bumper,650)}
${text(35,1583,'Hardware endpoints fit the stated reference envelope; trajectories, piece clearance and real field interfaces remain unverified. Zero Onshape / CAD-kernel calls.',19,colors.muted)}
</g></svg>`;
}

await mkdir(output,{recursive:true});
const started = performance.now();
const files = [];
const sheets = [];
for (const robot of robots) {
  const sheet = renderSheet(robot);
  sheets.push(sheet);
  const stem = `robot-${robot.id}`;
  const image = new Resvg(sheet,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'},background:'white'}).render().asPng();
  assert.equal(image.readUInt32BE(16),width);
  assert.equal(image.readUInt32BE(20),height);
  await writeFile(new URL(`${stem}.svg`,output),sheet);
  await writeFile(new URL(`${stem}.png`,output),image);
  await writeFile(new URL(`${stem}.html`,output),`<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(robot.id)} ${esc(robot.title)}</title><style>html,body{margin:0;background:white}svg{display:block}</style><body>${sheet}</body></html>`);
  files.push({id:robot.id,svg:`${stem}.svg`,png:`${stem}.png`,svgSha256:createHash('sha256').update(sheet).digest('hex'),pngSha256:createHash('sha256').update(image).digest('hex')});
}
const overviewWidth = 2200;
const overviewHeight = 4350;
const overview = `<svg xmlns="http://www.w3.org/2000/svg" width="${overviewWidth}" height="${overviewHeight}" viewBox="0 0 ${overviewWidth} ${overviewHeight}">${rect(0,0,overviewWidth,overviewHeight,'#eff4f0')}<g font-family="'Aptos','Segoe UI',sans-serif">${text(35,55,'REEFSCAPE / TEN WHOLE-ROBOT CONCEPTS',35,colors.ink,700)}${text(35,94,'Coral + algae + endgame. Compare capability ownership before detailed CAD. All proposals untested.',23,colors.muted)}${sheets.map((sheet,index)=>`<g transform="translate(${25+(index%2)*1090},${125+Math.floor(index/2)*837}) scale(0.48)">${sheet.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`).join('')}</g></svg>`;
await writeFile(new URL('overview.svg',output),overview);
await writeFile(new URL('overview.png',output),new Resvg(overview,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'},background:'white'}).render().asPng());
await writeFile(new URL('robots.json',output),`${JSON.stringify(robots,null,2)}\n`);
await writeFile(new URL('checks.json',output),`${JSON.stringify({status:'PASS_CONCEPT_CONSISTENCY_ONLY',meaning:'Static hardware envelopes and tool-link endpoint consistency; NOT piece clearance, collision, kinematics, loads or field reach',robots:hardwareChecks},null,2)}\n`);
await writeFile(new URL('manifest.json',output),`${JSON.stringify({stage:2,season:2025,status:'TEN_UNTESTED_WHOLE_ROBOT_CONCEPTS',apiCalls:0,cadKernelRuns:0,views:['axonometric','side','top'],size:{width,height},overviewSize:{width:overviewWidth,height:overviewHeight},renderElapsedMs:Math.round(performance.now()-started),files},null,2)}\n`);
const named = name => name.replace(/([A-Z])/g,' $1').toLowerCase();
const gallery = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>REEFSCAPE whole-robot concepts</title><style>:root{--ink:#243631;--line:#c8d6cd;--accent:#286d7b}*{box-sizing:border-box}body{margin:0;color:var(--ink);background:#f3f7f4;font-family:Georgia,serif;letter-spacing:0}header{padding:22px 28px;background:white;border-bottom:1px solid var(--line)}h1{font-size:30px;margin:0 0 10px}h2{font-size:25px;margin:0 0 12px}p{line-height:1.5;margin:7px 0}nav{display:flex;flex-wrap:wrap;gap:12px 20px;margin-top:18px}a{color:var(--accent)}main{max-width:2240px;margin:auto;padding:24px}section{padding:25px 0;border-bottom:1px solid var(--line)}img{width:100%;height:auto;display:block;background:white}details{margin:14px 0}summary{cursor:pointer;font-weight:bold;color:var(--accent)}dl{display:grid;grid-template-columns:140px 1fr;gap:12px;max-width:1300px}dt{font-weight:bold;text-transform:capitalize}dd{margin:0;line-height:1.5}.readout{max-width:1200px}.table-scroll{overflow:auto}table{border-collapse:collapse;min-width:740px}th,td{padding:10px;text-align:left;border-bottom:1px solid var(--line)}footer{padding:28px}@media(max-width:650px){header{padding:18px}h1{font-size:25px}main{padding:10px}h2{font-size:22px}dl{grid-template-columns:1fr;gap:6px}dd{margin-bottom:12px}}@media print{section{break-after:page}nav,details{display:none}main{padding:0}}</style>
<header><h1>REEFSCAPE: Ten Whole-Robot Concepts</h1><p>2025 / Coral + Algae + Endgame / Stage 2</p><p>Provisional block-and-link geometry, not working robots. <a href="../../trials/whole-robot-concepts/GAME-ANALYSIS.md">Game analysis</a> | <a href="README.md">Selection guide</a> | <a href="overview.png">All ten</a></p><nav>${robots.map(robot=>`<a href="#${robot.id}">${robot.id} ${esc(robot.title)}</a>`).join('')}</nav></header>
<main>${robots.map(robot=>`<section id="${robot.id}"><h2>${robot.id} / ${esc(robot.title)}</h2><a href="robot-${robot.id}.png"><img src="robot-${robot.id}.png" alt="${esc(robot.title)} whole-robot axonometric, side and top concept views" width="${width}" height="${height}"></a><p class="readout">${esc(robot.strategy)}</p><details><summary>Mechanisms, operation and assumptions</summary><dl>${Object.entries(robot.subsystems).map(([name,value])=>`<dt>${esc(named(name))}</dt><dd>${esc(value)}</dd>`).join('')}${Object.entries(robot.cycle).map(([name,value])=>`<dt>${esc(named(name))} cycle</dt><dd>${esc(value)}</dd>`).join('')}</dl></details><details><summary>References and limitations</summary>${robot.inspiration.map(reference=>`<p class="readout">${esc(reference.source)}: ${esc(reference.lesson)}</p>`).join('')}<p>No exact team replica, measured cycle time, simulated score or verified climbing load is claimed.</p></details></section>`).join('')}</main><footer><a href="robots.json">Dimensioned 3D concept data</a> | <a href="../concepts/index.html">Earlier intake-only concepts</a></footer></html>`;
await writeFile(new URL('index.html',output),gallery);
console.log(`Generated ${robots.length} whole-robot sheets with axonometric, side and top views, overview and gallery in ${Math.round(performance.now()-started)} ms. Zero API or CAD-kernel calls.`);