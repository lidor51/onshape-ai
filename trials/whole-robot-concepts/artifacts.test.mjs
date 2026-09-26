import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateRobot, screenHardware } from './validate.mjs';

const root = new URL('./',import.meta.url);
const output = new URL('../../outputs/whole-robots/',root);
const readJson = async url=>JSON.parse(await readFile(url,'utf8'));
const ids = Array.from({length:10},(_,index)=>`R${String(index+1).padStart(2,'0')}`);

test('ten distinct whole-robot sources preserve both-piece and endgame contracts',async()=>{
  const robots=(await Promise.all(['a','b','c','d'].map(family=>readJson(new URL(`robots-${family}.json`,root))))).flat().map(validateRobot).sort((first,second)=>first.id.localeCompare(second.id));
  assert.deepEqual(robots.map(robot=>robot.id),ids);
  assert.equal(new Set(robots.map(robot=>robot.title)).size,10);
  assert.deepEqual(await readJson(new URL('robots.json',output)),robots);
  assert.ok(robots.some(robot=>!robot.capabilities.coralLevels.includes(4)),'deliberate lower-reach options');
  assert.ok(robots.some(robot=>!robot.capabilities.coralSources.includes('floor')),'deliberate source tradeoff');
  assert.ok(robots.some(robot=>robot.capabilities.climb==='park'),'deliberate climb tradeoff');
});

test('static hardware envelopes fit and tool centers attach to drawn links',async()=>{
  const robots=await readJson(new URL('robots.json',output));
  const checks=robots.map(screenHardware);
  assert.deepEqual((await readJson(new URL('checks.json',output))).robots,checks);
  assert.ok(2*(700+760)<=3048);
  const invalid=structuredClone(robots[0]);
  invalid.geometry.boxes[0].center[0]=800;
  assert.throws(()=>screenHardware(invalid),/envelope/);
});

test('official scoring values, event thresholds and unknown height guards remain explicit',async()=>{
  const game=await readJson(new URL('game.json',root));
  assert.equal(game.scoring.points.coral.L4.teleop,5);
  assert.equal(game.scoring.points.coral.L3.teleop,4);
  assert.equal(game.scoring.points.algae.processor.teleop,6);
  assert.equal(game.scoring.points.algae.net.teleop,4);
  assert.equal(game.scoring.algaeAttribution.example.opponentPoints,4);
  assert.equal(game.scoring.rankingPoints.eventProfiles.districtChampionship.bargePoints,14);
  assert.equal(game.scoring.rankingPoints.eventProfiles.firstChampionship.bargePoints,16);
  assert.equal(game.dimensionsMm.algae.maximumDiameter,419.1);
  assert.equal(game.dimensionsMm.reef.algaeHigh.centerHeight,null);
  assert.equal(game.dimensionsMm.net.rimOrOpeningHeight,null);
  assert.equal(game.dimensionsMm.cage.deepHookTargetHeight,null);
  assert.equal(game.dimensionsMm.reef.L4.height,72*25.4);
});

test('all sheet hashes, image dimensions and comparison views match the manifest',async()=>{
  const manifest=await readJson(new URL('manifest.json',output));
  assert.deepEqual(manifest.files.map(file=>file.id),ids);
  assert.deepEqual(manifest.views,['axonometric','side','top']);
  assert.equal(manifest.apiCalls,0);
  assert.equal(manifest.cadKernelRuns,0);
  for(const file of manifest.files){
    const svg=await readFile(new URL(file.svg,output));
    const png=await readFile(new URL(file.png,output));
    assert.equal(createHash('sha256').update(svg).digest('hex'),file.svgSha256,file.id);
    assert.equal(createHash('sha256').update(png).digest('hex'),file.pngSha256,file.id);
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),2200);
    assert.equal(png.readUInt32BE(20),1630);
    for(const label of ['AXONOMETRIC / WHOLE ROBOT','SIDE / REACH OPTIONS','TOP / STARTING PACKAGE','STAGE 2 / PROPOSED GEOMETRY']) assert.ok(svg.toString().includes(label),`${file.id} ${label}`);
  }
  const overview=await readFile(new URL('overview.png',output));
  assert.equal(overview.readUInt32BE(16),2200);
  assert.equal(overview.readUInt32BE(20),4350);
  const vector=await readFile(new URL('overview.svg',output),'utf8');
  for(const id of ids)assert.ok(vector.includes(`title-${id}`));
});

test('gallery, selection and research links resolve without a server',async()=>{
  const html=await readFile(new URL('index.html',output),'utf8');
  for(const id of ids){
    assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes(`src="robot-${id}.png"`));
  }
  for(const [,target] of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) await access(new URL(target,output));
  for(const url of [new URL('README.md',output),new URL('GAME-ANALYSIS.md',root),...['README.md','docs/STATUS.md','docs/DESIGN-WORKFLOW.md','docs/TEAM-PROFILE.md'].map(path=>new URL(`../../${path}`,root))]){
    const markdown=await readFile(url,'utf8');
    for(const [,target] of markdown.matchAll(/\]\(([^)\s]+)\)/g)){
      if(/^(?:https?:|#)/.test(target))continue;
      const linked=new URL(target,url);linked.hash='';await access(linked);
    }
  }
});