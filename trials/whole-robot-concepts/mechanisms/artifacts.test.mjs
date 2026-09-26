import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';

const root=new URL('./',import.meta.url);const output=new URL('../../../outputs/whole-robots/mechanisms/',root);
const readJson=async url=>JSON.parse(await readFile(url,'utf8'));

test('elite-role review retains ten options without recommending lower reach by default',async()=>{
  const review=await readJson(new URL('review.json',root));
  assert.equal(review.robots.length,10);
  assert.equal(review.baselineIds[0],'R03');
  for(const id of ['R07','R08'])assert.equal(review.robots.find(robot=>robot.id===id).tier,'contrast');
  for(const robot of review.robots){
    assert.ok(robot.winningRole.includes('auto hypothesis'));
    assert.ok(Number.isInteger(robot.complexity.positioningDofs));
    assert.ok(robot.cycleContract.headingHypothesis.length>30);
  }
});

test('twenty genuine canvas exports match the recorded manifest and bundle',async()=>{
  const manifest=await readJson(new URL('manifest.json',output));
  assert.equal(manifest.status,'ILLUSTRATIVE_MECHANISM_REVISION');
  assert.equal(manifest.modelCount,10);assert.equal(manifest.poses,7);assert.equal(manifest.apiCalls,0);assert.equal(manifest.cadKernelRuns,0);
  assert.equal(manifest.screenshotsVerified,true);assert.equal(manifest.files.length,20);
  assert.equal(createHash('sha256').update(await readFile(new URL('viewer.js',output))).digest('hex'),manifest.bundleSha256);
  for(const file of manifest.files){
    const bytes=await readFile(new URL(file.file,output));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.file);
    assert.equal(bytes.readUInt32BE(16),file.width);assert.equal(bytes.readUInt32BE(20),file.height);
  }
  const overview=await readFile(new URL('overview.png',output));assert.equal(overview.readUInt32BE(16),2000);assert.equal(overview.readUInt32BE(20),4440);
});

test('local viewer and updated architecture documents resolve their links',async()=>{
  const html=await readFile(new URL('index.html',output),'utf8');
  for(const [,target]of html.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)){
    if(/^https?:/.test(target))continue;const url=new URL(target,output);url.hash='';await access(url);
  }
  for(const name of ['outputs/whole-robots/mechanisms/README.md','docs/ROBOT-ARCHITECTURE-STANDARD.md','docs/DESIGN-WORKFLOW.md','docs/STATUS.md','README.md']){
    const url=new URL(`../../../${name}`,root);const markdown=await readFile(url,'utf8');
    for(const [,target]of markdown.matchAll(/\]\(([^)\s]+)\)/g)){
      if(/^(https?:|#)/.test(target))continue;const linked=new URL(target,url);linked.hash='';await access(linked);
    }
  }
});