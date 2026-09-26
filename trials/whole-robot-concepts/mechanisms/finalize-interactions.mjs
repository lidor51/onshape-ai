import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Resvg} from '../../subsystem-ab/concepts/node_modules/@resvg/resvg-js/index.js';
import {robotCatalogue,tasksForRobot,taskLabels} from './task-contract.mjs';
import {solveTask} from './interaction-solver.mjs';

const output=new URL('../../../outputs/whole-robots/mechanisms/interactions/',import.meta.url);
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const records=[];const sections=[];const l4=[];
for(const robot of robotCatalogue){
  const tiles=[];
  for(const task of tasksForRobot(robot.id)){
    const file=`task-${robot.id}-${task}.png`;const bytes=await readFile(new URL(file,output));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    const solution=solveTask(robot.id,task);records.push({id:robot.id,task,file,sha256:createHash('sha256').update(bytes).digest('hex'),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),status:solution.status,standOffMm:solution.standOffMm});
    tiles.push(`<figure><a href="../index.html?robot=${robot.id}&amp;task=${task}"><img src="${file}" alt="${esc(robot.title)} ${esc(taskLabels[task])}"></a><figcaption><strong>${esc(taskLabels[task])}</strong><p>${Number.isFinite(solution.standOffMm)?`Bumper stand-off ${solution.standOffMm.toFixed(1)} mm`:'Legacy pose, not solved contact'}</p><p>${esc(solution.status)}</p></figcaption></figure>`);
    if(task==='coral-l4')l4.push({robot,solution,png:bytes.toString('base64')});
  }
  sections.push(`<section id="${robot.id}"><h2>${robot.id} / ${esc(robot.title)}</h2><div class="grid">${tiles.join('')}</div></section>`);
}
const overviewHeight=145+Math.ceil(l4.length/2)*880;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2400" height="${overviewHeight}" viewBox="0 0 2400 ${overviewHeight}"><rect width="2400" height="${overviewHeight}" fill="#f2f5f3"/><g font-family="'Segoe UI',sans-serif" fill="#263934"><text x="35" y="55" font-size="36" font-weight="700">SAME L4 TARGET / DIFFERENT ROBOT CONFIGURATIONS</text><text x="35" y="96" font-size="22">Engagement phase; fixed field, chassis on carpet. Pose geometry is conditional on stated assumptions, not a motion or inspection pass.</text>${l4.map(({robot,solution,png},index)=>{const horizontal=25+(index%2)*1185;const vertical=135+Math.floor(index/2)*880;return `<image x="${horizontal}" y="${vertical}" width="1140" height="700" xlink:href="data:image/png;base64,${png}"/><text x="${horizontal+15}" y="${vertical+739}" font-size="27" font-weight="650">${robot.id} / ${esc(robot.title)}</text><text x="${horizontal+15}" y="${vertical+780}" font-size="24">Bumper stand-off: ${solution.standOffMm.toFixed(1)} mm</text><text x="${horizontal+15}" y="${vertical+815}" font-size="21">${esc(solution.joints.slice(0,2).map(joint=>`${joint.name} ${joint.value.toFixed(1)} ${joint.unit}`).join(' | '))}</text><text x="${horizontal+15}" y="${vertical+847}" font-size="19">${esc(solution.status)}</text>`;}).join('')}</g></svg>`;
await writeFile(new URL('l4-comparison.svg',output),svg);await writeFile(new URL('l4-comparison.png',output),new Resvg(svg,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'}}).render().asPng());
const phaseExamples=[['R03','coral-l4'],['R04','coral-l4'],['R03','processor'],['R03','net']];
for(const [id,task] of phaseExamples){
  const content=[];
  for(const [index,phase]of ['approach','engage','release'].entries()){
    const file=`task-${id}-${task}${phase==='engage'?'':`-${phase}`}.png`;const bytes=await readFile(new URL(file,output));
    if(phase!=='engage')records.push({id,task,phase,file,sha256:createHash('sha256').update(bytes).digest('hex'),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)});
    const solution=solveTask(id,task,phase);content.push(`<image x="${index*1000}" y="105" width="1000" height="750" xlink:href="data:image/png;base64,${bytes.toString('base64')}"/><text x="${index*1000+25}" y="895" font-size="26">${phase.toUpperCase()} / stand-off ${solution.standOffMm.toFixed(1)} mm</text>`);
  }
  const sheet=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="3000" height="975"><rect width="3000" height="975" fill="#f2f5f3"/><g font-family="'Segoe UI',sans-serif" fill="#263934"><text x="30" y="55" font-size="38">${id} / ${esc(taskLabels[task])} / THREE PHASES</text>${content.join('')}<text x="30" y="950" font-size="22">Independently solved configurations, not a validated swept transition. Source and mechanism assumptions remain explicit in the viewer.</text></g></svg>`;
  await writeFile(new URL(`phases-${id}-${task}.png`,output),new Resvg(sheet,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'}}).render().asPng());
}
await writeFile(new URL('index.html',output),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Robot task sheets</title><style>body{font-family:Georgia,serif;margin:24px;background:#f2f5f3;color:#263934}h1{font-size:28px}h2{font-size:24px}a{color:#286a70}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}figure{margin:0}img{width:100%;aspect-ratio:4/3;object-fit:contain}p{font-size:13px;line-height:1.4}section{padding:24px 0;border-top:1px solid #ced9d1}@media(max-width:800px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:500px){body{margin:14px}.grid{grid-template-columns:1fr}}</style><h1>Task-Specific Configurations And Stand-Off</h1><p><a href="../index.html">Interactive task/phase viewer</a> | <a href="l4-comparison.png">L4 side-by-side comparison</a> | <a href="README.md">Limits and assumptions</a></p><p>Each image is a declared task, not an automatic success. Red/failed results in the viewer expose missing reach or forbidden overlap. Only supported tasks are generated.</p><p>${phaseExamples.map(([id,task])=>`<a href="phases-${id}-${task}.png">${id} ${taskLabels[task]} phases</a>`).join(' | ')}</p>${sections.join('')}</html>`);
await writeFile(new URL('manifest.json',output),`${JSON.stringify({status:'TASK_SPECIFIC_GEOMETRIC_STUDY',robotCount:10,taskCount:records.filter(record=>!record.phase).length,phasesAvailable:3,apiCalls:0,cadKernelRuns:0,fieldFixed:true,fullMotionProven:false,files:records},null,2)}\n`);
console.log(`Finalized ${records.length} task/phase PNGs, L4 comparison, four phase sheets and task gallery.`);