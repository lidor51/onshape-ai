import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url)));
const hash=name=>createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex');

test('full-system page retains all physical motors and indexer geometry without claiming release',()=>{
  const mesh=read('system-output/system-mesh.json'),viewer=read('system-output/viewer-verification.json');
  assert.equal(mesh.instances.filter(part=>!part.reference_only).length,589);
  assert.equal(mesh.instances.filter(part=>part.role==='motor').length,4);
  assert.ok(mesh.instances.some(part=>part.id==='v1_indexer_drive_L_X44'));
  assert.ok(mesh.instances.some(part=>part.id==='v1_indexer_drive_R_X44'));
  assert.equal(viewer.release,false);assert.equal(viewer.sourceMeshSha256,hash('system-output/system-mesh.json'));assert.equal(viewer.htmlSha256,hash('system-output/index.html'));
});
test('CAD exports remain hashed and actual interferences stay failures',()=>{
  const hashes=read('system-output/artifact-hashes.json');
  for(const [name,expected] of Object.entries(hashes).filter(([name])=>name.endsWith('.step')))assert.equal(hash('system-output/'+name),expected,name);
  const failures=read('system-output/targeted-interferences.json');assert.equal(failures.full_physical_gate,false);
  assert.equal(failures.source_manifest_sha256,hash('system-output/manifest.json'));
  assert.equal(failures.pairs.length,2);assert.ok(failures.pairs.every(pair=>pair.intersection_mm3>100));
});
test('impact leverage, calculator cross-check and material evidence retain correct boundaries',()=>{
  const path=read('deployment-path.json'),recalc=read('recalc-check.json'),materials=read('material-data.json');
  assert.equal(path.status,'REJECTED_AS_PASSIVE_IMPACT_RELIEF_AT_DEPLOYED_POSE');assert.ok(path.forceScreen[0].frontalForceForGravityN>3700);
  assert.ok(Math.abs(recalc.converted_speed_m_per_s-recalc.local_no_load_speed_m_per_s)<0.02);
  assert.equal(recalc.arm_calculator.used_as_system_validation,false);assert.equal(materials.manufacturing_release,false);
  assert.equal(materials.polycarbonate.flexural_modulus.value,345000);assert.equal(materials.polycarbonate.selected_team_stock,false);
});