import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Resvg} from '../../subsystem-ab/concepts/node_modules/@resvg/resvg-js/index.js';
import {intakeRecipes} from './intake-models.mjs';

const robotOutput=new URL('../../../outputs/whole-robots/mechanisms/states/',import.meta.url);
const intakeOutput=new URL('../../../outputs/concepts/mechanisms/',import.meta.url);
const catalogue=(await Promise.all(['a','b','c','d'].map(async family=>JSON.parse(await readFile(new URL(`../robots-${family}.json`,import.meta.url),'utf8'))))).flat();
const robotStates=[['stow','Collapsed / starting intent'],['floor','Open / floor acquisition'],['station','Station receive'],['coral','Coral / reef approach'],['algae','Algae / reef approach'],['climb','Cage approach / park']];
const intakeStates=[['open','Open / floor coral'],['collapsed','Collapsed / captured coral'],['handoff','Offer to receiver']];
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const records={robots:[],intakes:[]};

async function record(directory,file,target){
  const bytes=await readFile(new URL(file,directory));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file);
  assert.ok(bytes.length>10_000,`${file}: unexpectedly empty`);
  target.push({file,bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),sha256:createHash('sha256').update(bytes).digest('hex')});
  return bytes;
}

async function sheet(directory,stem,title,states,kind,target){
  const isRobot=kind==='robot';const sheetHeight=isRobot?1800:1020;
  const images=await Promise.all(states.map(async([pose,label],index)=>{
    const bytes=await record(directory,`${stem}-${pose}.png`,target);
    assert.equal(bytes.readUInt32BE(16),1100);assert.equal(bytes.readUInt32BE(20),850);
    const horizontal=20+(index%3)*990;const vertical=120+Math.floor(index/3)*780;
    return `<image x="${horizontal}" y="${vertical}" width="960" height="742" xlink:href="data:image/png;base64,${bytes.toString('base64')}"/><text x="${horizontal+16}" y="${vertical+767}" font-size="25" font-weight="600">${esc(label)}</text>`;
  }));
  const notes=isRobot?['Field placement and cropped profiles are illustrative; known height datums are retained. Visible proximity is not successful contact.', 'Cage approach is not a loaded climb. Reef algae center markers are provisional. Each scene is framed independently.']:['Same camera and scale across this intake\'s three states. One coral; fixed receiver and frame; moving section has proposed poses.', 'Original 2D path/flow drawing remains available unchanged. These snapshots do not prove contact, retention, stow or continuous motion.'];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="3000" height="${sheetHeight}" viewBox="0 0 3000 ${sheetHeight}"><rect width="3000" height="${sheetHeight}" fill="#f2f5f3"/><g font-family="'Segoe UI',sans-serif" fill="#263934"><text x="35" y="55" font-size="38" font-weight="700">${esc(title)}</text><text x="35" y="94" font-size="24">${isRobot?'ROBOT CONFIGURATIONS WITH FIELD CONTEXT':'INTAKE CONFIGURATIONS / COMPLEMENT TO 2D FLOW'} / UNTESTED CONCEPT</text>${images.join('')}<text x="35" y="${sheetHeight-75}" font-size="23">${esc(notes[0])}</text><text x="35" y="${sheetHeight-35}" font-size="23">${esc(notes[1])}</text></g></svg>`;
  await writeFile(new URL(`${stem}-states.svg`,directory),svg);
  await writeFile(new URL(`${stem}-states.png`,directory),new Resvg(svg,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'}}).render().asPng());
  await record(directory,`${stem}-states.png`,target);
}

for(const robot of catalogue)await sheet(robotOutput,`robot-${robot.id}`,`${robot.id} / ${robot.title}`,robotStates,'robot',records.robots);
for(const intake of intakeRecipes)await sheet(intakeOutput,`intake-${intake.id}`,`${intake.id} / ${intake.title}`,intakeStates,'intake',records.intakes);

const overview=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2200" height="2020" viewBox="0 0 2200 2020"><rect width="2200" height="2020" fill="#f2f5f3"/><g font-family="'Segoe UI',sans-serif" fill="#263934"><text x="30" y="50" font-size="34" font-weight="700">FOURTEEN INTAKE MECHANISM CONCEPTS</text><text x="30" y="90" font-size="21">Open views below; each option also has collapsed and receiver-handoff views. Original 2D paths are preserved.</text>${(await Promise.all(intakeRecipes.map(async(intake,index)=>{const bytes=await readFile(new URL(`intake-${intake.id}-open.png`,intakeOutput));const horizontal=20+(index%4)*545;const vertical=125+Math.floor(index/4)*465;return `<image x="${horizontal}" y="${vertical}" width="520" height="400" xlink:href="data:image/png;base64,${bytes.toString('base64')}"/><text x="${horizontal+8}" y="${vertical+430}" font-size="21">${intake.id} / ${esc(intake.title)}</text>`;}))).join('')}</g></svg>`;
await writeFile(new URL('overview.svg',intakeOutput),overview);
await writeFile(new URL('overview.png',intakeOutput),new Resvg(overview,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'}}).render().asPng());
await record(intakeOutput,'overview.png',records.intakes);

const originalManifest=JSON.parse(await readFile(new URL('../manifest.json',intakeOutput),'utf8'));
const preserved=[];
for(const file of [...originalManifest.files,...originalManifest.rasters.filter(file=>/^concept-\d\d\.png$/.test(file.file))]){
  const bytes=await readFile(new URL(`../${file.file}`,intakeOutput));const sha256=createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,file.sha256,`Original drawing changed: ${file.file}`);preserved.push({file:`../${file.file}`,sha256});
}
await writeFile(new URL('manifest.json',robotOutput),`${JSON.stringify({status:'CONTEXTUAL_POSE_ILLUSTRATIONS',robots:10,statesPerRobot:6,apiCalls:0,cadKernelRuns:0,contactProven:false,files:records.robots},null,2)}\n`);
const intakeManifest=JSON.parse(await readFile(new URL('manifest.json',intakeOutput),'utf8'));intakeManifest.files=records.intakes;intakeManifest.preserved2DDrawings=preserved;
await writeFile(new URL('manifest.json',intakeOutput),`${JSON.stringify(intakeManifest,null,2)}\n`);
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Robot state illustrations</title><style>body{font-family:Georgia,serif;margin:24px;background:#f2f5f3;color:#263934}h1{font-size:26px}h2{font-size:22px}img{width:100%;height:auto}section{padding:20px 0;border-bottom:1px solid #cad6cf}a{color:#286a70}</style><h1>Ten Robots / Six Contextual Configurations</h1><p><a href="../index.html">Interactive robot viewer</a> | <a href="../../../concepts/mechanisms/index.html">Intake state viewer + original 2D flows</a></p><p>Illustrative approaches, not verified interaction or legal stow. Field heights are sourced where available; unspecified profiles and algae center markers remain provisional.</p>${catalogue.map(robot=>`<section><h2>${robot.id} / ${esc(robot.title)}</h2><a href="robot-${robot.id}-states.png"><img src="robot-${robot.id}-states.png" alt="${esc(robot.title)} collapsed, floor, station, reef and cage configurations"></a></section>`).join('')}</html>`;
await writeFile(new URL('index.html',robotOutput),html);
console.log(`Created 10 six-state robot sheets and 14 three-state intake sheets. All ${preserved.length} original intake SVG/PNG drawings byte-identical.`);