import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {robotCatalogue,tasksForRobot} from './task-contract.mjs';
import {solveTask} from './interaction-solver.mjs';

const output=new URL('../../../outputs/whole-robots/mechanisms/interactions/',import.meta.url);
const json=async url=>JSON.parse(await readFile(url,'utf8'));

test('all and only declared tasks have numeric solutions and exported engagement images',async()=>{
  const manifest=await json(new URL('manifest.json',output));const solutions=await json(new URL('solutions.json',output));
  assert.equal(manifest.taskCount,118);assert.equal(manifest.robotCount,10);assert.equal(manifest.phasesAvailable,3);
  assert.equal(manifest.apiCalls,0);assert.equal(manifest.fieldFixed,true);assert.equal(manifest.fullMotionProven,false);
  for(const robot of robotCatalogue){
    assert.deepEqual(manifest.files.filter(file=>file.id===robot.id&&!file.phase).map(file=>file.task),tasksForRobot(robot.id));
    const solved=solutions.find(entry=>entry.id===robot.id);
    for(const task of solved.tasks)assert.deepEqual(task,JSON.parse(JSON.stringify(solveTask(robot.id,task.task))));
  }
  for(const file of manifest.files){const bytes=await readFile(new URL(file.file,output));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.file);assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),900);}
});

test('task controls, comparison and field evidence links are published',async()=>{
  const viewer=await readFile(new URL('../viewer.html',output),'utf8');
  for(const id of ['task','phase','focus','comparison','joints','gap','error'])assert.ok(viewer.includes(`id="${id}"`),id);
  for(const url of [new URL('index.html',output),new URL('../index.html',output)]){
    const html=await readFile(url,'utf8');for(const [,target]of html.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)){if(/^https?:/.test(target))continue;const linked=new URL(target,url);linked.hash='';linked.search='';await access(linked);}
  }
  const markdown=await readFile(new URL('README.md',output),'utf8');for(const [,target]of markdown.matchAll(/\]\(([^)\s]+)\)/g)){const linked=new URL(target,output);linked.hash='';await access(linked);}
});

test('invalid configurations remain diagnostic failures instead of successful demos',async()=>{
  const solutions=await json(new URL('solutions.json',output));
  const failures=solutions.flatMap(robot=>robot.tasks.filter(task=>!task.legacy&&!task.reachable));
  assert.ok(failures.length>0);
  for(const task of failures)assert.match(task.status,/UNREACHABLE|EXCEEDED|OVERLAP/);
  assert.ok(failures.some(task=>task.id==='R02'&&task.task==='coral-floor'));
  const elevator=solveTask('R03','coral-l4');const arm=solveTask('R04','coral-l4');
  assert.ok(Math.abs(elevator.standOffMm-arm.standOffMm)>100);
  assert.equal(elevator.target.tip[2],1828.8);
});

test('browser verification matches task coverage and fixed-target L4 comparison',async()=>{
  const record=await json(new URL('verification.json',output));
  assert.equal(record.coverage.declaredTasks,118);assert.equal(record.sameL4Target.identicalFieldTarget,true);
  assert.equal(record.responsive.mobile.framingFailures,0);assert.equal(record.responsive.mobile.taskFramingChecks,118);
  for(const id of ['R03','R04'])assert.ok(Math.abs(record.sameL4Target[id].bumperStandOffMm-solveTask(id,'coral-l4').standOffMm)<1e-6);
  assert.ok(record.netShotHypothesis.minimumBallNearRailClearanceMm>=20);
});