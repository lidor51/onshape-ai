import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {sha256} from '../../trials/subsystem-ab/api/ledger.mjs';

const evidence=JSON.parse(readFileSync(new URL('1690-geometry-evidence.json',import.meta.url)));
test('recorded inspection is pinned and source-cache hashes still match',()=>{
  assert.equal(evidence.source.microversion,'1d118c30ab4c3c15bc9b4ab0');
  assert.equal(evidence.local.sourceBodies,493);assert.equal(evidence.local.placedOccurrences,955);
  for(const request of evidence.requests.filter(request=>request.cache))assert.equal(sha256(readFileSync(new URL(`../../.cache/reference-cad/${request.cache}`,import.meta.url))),request.sha256);
  assert.equal(sha256(readFileSync(new URL(evidence.local.measurements,import.meta.url))),evidence.local.sha256);
  assert.ok(existsSync(new URL(evidence.local.viewer,import.meta.url)));
});
test('native dimensions distinguish tyres, hubs, projected spans and missing motion',()=>{
  assert.equal(evidence.measurements.indexerTyreOccurrences,10);
  for(const thickness of evidence.measurements.indexerTyreThicknessRangeMm)assert.ok(Math.abs(thickness-25.4)<0.001);
  assert.deepEqual(evidence.measurements.pickupStarCounts.map(row=>row.count),[11,8,5]);
  for(const [index,expected] of [441.2,457.78,307.62].entries())assert.ok(Math.abs(evidence.measurements.pickupShafts[index].spanXMm-expected)<0.01);
  assert.equal(evidence.nativeMotion.pickupFeatures,0);assert.equal(evidence.nativeMotion.subassemblyFeatures,0);
  assert.equal(evidence.analytic.status,'BAD_GEOMETRY');assert.equal(evidence.analytic.bodyCount,0);
});
test('availability and manufacturing gates are not promoted to successes',()=>{
  assert.equal(evidence.availability['1778'].geometryInspected,false);assert.equal(evidence.availability['2056'].geometryInspected,false);
  assert.equal(evidence.decision.manufacturingRelease,false);assert.equal(evidence.decision.fieldReliability,'UNMEASURED');
  assert.ok(evidence.accounting.referenceAttempts<=evidence.accounting.referenceCap);
  assert.ok(evidence.accounting.totalDirectAttempts<=evidence.accounting.directCap);
  assert.equal(evidence.accounting.annualAllowance,'UNKNOWN');
});

test('native up axis is grounded in chassis geometry, not an arbitrary camera convention',()=>{
  assert.deepEqual(evidence.sourceFrame.up,[0,1,0]);
  assert.equal(evidence.sourceFrame.frameRails.length,4);
  for(const rail of evidence.sourceFrame.frameRails){assert.ok(Math.abs(rail.centerMm[1]-37)<0.001);assert.ok(Math.abs(rail.sizeMm[1]-50)<0.001);}
  assert.match(evidence.decision.architecture,/horizontal-plan/);
});

test('source slot rejects a fabricated pinned joint and preserves duplicate occurrence warning',()=>{
  const probe=evidence.kinematicProbe;
  assert.equal(probe.status,'SIMPLE_PINNED_FOUR_BAR_HYPOTHESIS_REJECTED');
  assert.ok(Math.abs(probe.slotEndFit.radius-6)<0.01);assert.ok(probe.slotEndFit.maximumResidual<0.01);
  assert.ok(Math.hypot(...probe.slotEndFit.center.map((value,index)=>value-probe.bearingCenterYZMm[index]))<0.01);
  assert.ok(probe.slotOutlineSizeMm[0]>50);assert.equal(evidence.duplicateOccurrences.count,2);
  assert.equal(sha256(readFileSync(new URL(`../../.cache/reference-cad/${probe.source}`,import.meta.url))),probe.sha256);
});