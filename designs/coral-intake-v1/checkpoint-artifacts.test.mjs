import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('./',import.meta.url);const output=new URL('checkpoint/',root);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',output)));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('current CAD checkpoint is revision-bound and explicitly fails release acceptance',()=>{
  assert.equal(manifest.release,'NOT RELEASED');assert.equal(manifest.assembly_acceptance,'FAIL');assert.equal(manifest.native_onshape,false);
  assert.equal(manifest.physical_reliability,'UNMEASURED');assert.equal(manifest.instances.length,551);
  assert.equal(Object.keys(manifest.definitions).length,140);
  for(const [file,expected] of Object.entries(manifest.source_hashes))assert.equal(hash(readFileSync(new URL(file,root))),expected,file);
  assert.equal(hash(readFileSync(new URL('assembly-checks.json',output))),manifest.assembly_check_sha256);
});
test('assembly and all 111 reimported custom STEP files retain recorded bytes',()=>{
  const assembly=readFileSync(new URL(manifest.assembly_step,output));assert.equal(hash(assembly),manifest.assembly_step_sha256);
  assert.ok(assembly.subarray(0,100).toString().includes('ISO-10303-21'));
  const custom=Object.values(manifest.definitions).filter(definition=>definition.step);assert.equal(custom.length,111);
  for(const definition of custom){assert.equal(definition.custom_step_reimport,'PASS');assert.equal(hash(readFileSync(new URL(definition.step,output))),definition.step_sha256,definition.step);}
  assert.ok(existsSync(new URL('index.html',output)));assert.ok(existsSync(new URL('BOM.csv',output)));
});
test('all actual COTS masters remain unchanged and all instances resolve to active geometry',()=>{
  assert.equal(Object.keys(manifest.sources).length,6);
  for(const source of Object.values(manifest.sources))assert.equal(hash(readFileSync(new URL('../../'+source.pathrepoRelative,root))),source.sha256,source.sku);
  const counts=new Map();for(const instance of manifest.instances){assert.ok(manifest.definitions[instance.definition]);assert.equal(instance.matrix.flat().length,16);assert.ok(instance.matrix.flat().every(Number.isFinite));counts.set(instance.definition,(counts.get(instance.definition)??0)+1);}
  for(const [name,definition] of Object.entries(manifest.definitions))assert.equal(counts.get(name),definition.quantity,name);
});