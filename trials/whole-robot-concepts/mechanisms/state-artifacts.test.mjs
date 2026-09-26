import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';

const robotOutput=new URL('../../../outputs/whole-robots/mechanisms/states/',import.meta.url);
const intakeOutput=new URL('../../../outputs/concepts/mechanisms/',import.meta.url);
const json=async url=>JSON.parse(await readFile(url,'utf8'));

test('robot and intake state packages contain every exported pose and comparison sheet',async()=>{
  for(const [directory,count,expected] of [[robotOutput,10,70],[intakeOutput,14,57]]){
    const manifest=await json(new URL('manifest.json',directory));
    assert.equal(manifest.files.length,expected);assert.equal(manifest.apiCalls,0);assert.equal(manifest.cadKernelRuns,0);
    const sheets=manifest.files.filter(file=>file.file.endsWith('-states.png'));assert.equal(sheets.length,count);
    for(const file of manifest.files){const bytes=await readFile(new URL(file.file,directory));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.file);assert.equal(bytes.readUInt32BE(16),file.width);assert.equal(bytes.readUInt32BE(20),file.height);}
  }
});

test('all original 2D intake flow drawings remain byte-identical and embedded',async()=>{
  const manifest=await json(new URL('manifest.json',intakeOutput));assert.equal(manifest.preserved2DDrawings.length,28);
  for(const file of manifest.preserved2DDrawings)assert.equal(createHash('sha256').update(await readFile(new URL(file.file,intakeOutput))).digest('hex'),file.sha256,file.file);
  const viewer=await readFile(new URL('index.html',intakeOutput),'utf8');assert.ok(viewer.includes('Original 2D Geometry And Flow'));assert.ok(viewer.includes('id="flow"'));
  assert.equal(createHash('sha256').update(await readFile(new URL('viewer.js',intakeOutput))).digest('hex'),manifest.bundleSha256);
});

test('state gallery and complementary intake viewer links resolve locally',async()=>{
  for(const directory of [robotOutput,intakeOutput]){
    const html=await readFile(new URL('index.html',directory),'utf8');
    for(const [,target]of html.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)){if(/^https?:/.test(target))continue;const url=new URL(target,directory);url.hash='';await access(url);}
  }
  const markdown=await readFile(new URL('README.md',intakeOutput),'utf8');for(const [,target]of markdown.matchAll(/\]\(([^)\s]+)\)/g)){const url=new URL(target,intakeOutput);url.hash='';await access(url);}
});

test('browser evidence records all state exports, mobile framing and retained flow drawings',async()=>{
  const evidence=await json(new URL('verification.json',robotOutput));
  assert.equal(evidence.robotExports.pngCount,60);assert.equal(evidence.intakeExports.pngCount,42);
  assert.equal(evidence.mobileRobotFraming.scenesChecked,60);assert.equal(evidence.mobileRobotFraming.allFramed,true);
  assert.equal(evidence.preserved2DDrawings.byteIdentical,true);
  for(const layout of evidence.responsive){assert.equal(layout.overflow,false);assert.equal(layout.imagesLoaded,true);assert.equal(layout.framed,true);assert.ok(layout.coloredPixels>500&&layout.darkPixels>100);}
});