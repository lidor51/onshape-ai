import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url)));
const hash=name=>createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex');
test('catalogued loops match actual parametric center distances without invented belt lengths',()=>{
  const candidates=read('transmission-candidates.json'),report=read('pickup-report.json');
  for(const loop of candidates.roller_loops){assert.equal(loop.pitch_length_mm,loop.belt_teeth*loop.pitch_mm);assert.equal(loop.pitch_length_mm,2*loop.nominal_center_mm+loop.pulley_teeth*loop.pitch_mm);}
  assert.equal(report.settings.front_distance,155);assert.equal(report.settings.rear_distance,130);
  assert.equal(candidates.deployment.ratio_selected,null);assert.equal(candidates.deployment.rejected_ratio,5);
});
test('sizing and contact evidence match the current pickup and retain physical-test boundaries',()=>{
  const sizing=read('drive-sizing.json'),contact=read('entry-contact.json');
  assert.equal(sizing.source_pickup_sha256,hash('pickup.py'));assert.equal(contact.pickup_source_sha256,hash('pickup.py'));
  assert.equal(contact.rows.length,4);assert.ok(contact.rows.every(row=>row.contact&&!row.hard_obstruction_before_contact));
  assert.ok(sizing.fold.find(row=>row.ratio===5).ideal_speed_torque_margin_nm<0);
  assert.ok(sizing.fold.every(row=>!row.holding_approved&&!row.physical_duty_validated));
  assert.ok(sizing.pickup.every(row=>!row.hardware_qualified));
});
test('new CAD exports and viewer stay bound to their real source geometry',()=>{
  const report=read('pickup-report.json'),viewer=read('output/viewer-manifest.json');
  assert.equal(hash('output/assembly.step'),report.exports.assembly_sha256);
  assert.equal(report.exports.custom_roundtrips.length,17);
  for(const part of report.exports.custom_roundtrips)assert.equal(hash(`output/custom/${part.definition}.step`),part.sha256);
  assert.equal(hash('output/pickup-mesh.json'),viewer.meshSha256);assert.equal(hash('output/index.html'),viewer.htmlSha256);
  assert.equal(viewer.release,false);assert.equal(report.cad_ready,false);assert.equal(report.v1_frozen.unchanged,true);
});

test('machining and reference checks retain unresolved engineering limitations',()=>{
  const geometry=read('output/pickup-mesh.json'),resolution=read('output/final-reference-resolution.json');
  assert.equal(geometry.definitions.kick_end_hub.process,'turn_and_router_hex');
  assert.ok(geometry.definitions.kick_end_hub.minimum_nominal_wall_mm<1);
  assert.equal(resolution.bindings.pickup_source_sha256,hash('pickup.py'));
  assert.equal(resolution.summary.outcomes.EXACT_CLEAR_AT_SAMPLE,84);
  assert.equal(resolution.summary.outcomes.UNCERTAIN_ENVELOPE_ONLY,80);
  assert.equal(resolution.status,'UNCERTAIN');
});