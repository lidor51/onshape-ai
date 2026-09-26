import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {coaxialTransform, groupOf} from './coaxial-motion.mjs';
const root = new URL('final-frame-output/revision-clearance/', import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(name, root)));

test('whole powered assembly is frame contained without claiming full release', () => {
  const audit = read('audit.json');
  assert.equal(audit.framePass, true); assert.equal(audit.candidateAcceptancePass, true);
  assert.equal(audit.releaseReady, false); assert.equal(audit.startingConfigurationCertified, false);
  assert.equal(audit.counts.physical, 847); assert.equal(audit.counts.motors, 4);
  assert.equal(audit.counts.belts, 8); assert.equal(audit.counts.chains, 2);
  for (const pose of audit.poses) {
    assert.equal(pose.outsideCount, 0); assert.equal(pose.reserveFailureCount, 0);
    assert.equal(pose.fullSpinEnclosureFailureIds.length, 0);
  }
  for (const value of Object.values(audit.continuousFloatFrame.minimumNonRailMarginLowerBoundsMm)) assert.ok(value >= 5);
  assert.equal(audit.repairNeighbors.failures.length, 0); assert.equal(audit.repairNeighbors.unknownCount, 0);
  assert.equal(audit.historicalPairs.pass, true); assert.equal(audit.chainPassageEnvelope.pass, true);
  assert.equal(audit.verifiedExpectedThreadContacts.length, 8);
});

test('current viewer placements match CAD and powertrain is assigned to visible modules', () => {
  const mesh = read('coaxial-mesh.json');
  for (const part of mesh.instances) {
    const actual = coaxialTransform(part, mesh.motion, -165).transpose().elements;
    for (const [index, expected] of part.stow_matrix.flat().entries()) assert.ok(Math.abs(actual[index] - expected) < 1e-8, part.id);
  }
  assert.equal(groupOf({id: 'pt_deployment_final_chain'}), 'drives');
  assert.equal(groupOf({id: 'pt_indexer_L_0'}), 'indexer');
  assert.equal(groupOf({id: 'pt_frame_root_1_0_tap_block'}), 'mounts');
});

test('actual exported custom solids and historical source preservation pass', () => {
  const checks = read('export-checks.json');
  assert.equal(checks.all_custom_roundtrips_pass, true);
  assert.equal(checks.custom_roundtrips.length, 152); assert.deepEqual(checks.invalid_definitions, []);
  const freeze = read('source-freeze.json');
  assert.equal(freeze.frozenV1Count, 305); assert.equal(freeze.frozenV1Unchanged, true);
  assert.equal(freeze.inboardArtifactsUnchanged, true);
  for (const [path, expected] of Object.entries(read('artifact-hashes.json'))) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex'), expected, path);
  }
});