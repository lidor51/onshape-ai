import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const decision = read('decision.json');
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');

test('required geometry failures prevent demonstrator pass and freeze', () => {
  assert.equal(decision.status, 'FINITE_LAYOUT_NO_FIT');
  assert.equal(decision.localCADDemoPass, false);
  assert.equal(decision.frozen, false);
  assert.equal(decision.manufacturingRelease, false);
  assert.ok(decision.retention.unexpectedCount > 0);
  for (const witness of decision.inclinedGuideYawBound.fixedTubeWitnesses) {
    assert.ok(witness.hardIntersectionMm3 > 0.0001);
    assert.equal(witness.fixedTube, 'pickup_2_tube');
  }
});

test('same-plane full-width 127 mm top bank has a contradictory pitch interval at 8 mm indentation', () => {
  const bound = decision.fullWidthTopBankBound;
  assert.ok(bound.minimumNonintersectingPitchMm > bound.maximumPitchMm);
  assert.ok(Math.abs(bound.maximumPitchMm - 86.40370362432387) < 1e-8);
  assert.ok(bound.maximumDiameterAtThisCompressionMm < 77);
});

test('feasible core evidence is narrow, complete and closed-volume', () => {
  for (const variant of decision.variants) {
    assert.equal(variant.modeledOccurrences, 42);
    assert.ok(variant.customOccurrences < 50);
    assert.equal(variant.closedVolumes, true);
    assert.equal(variant.contactCore, true);
    assert.equal(variant.centeredCrosswiseUnexpected, 0);
    assert.equal(variant.deploymentUnexpected, 0);
    assert.equal(variant.yawRouteUnexpected, 0);
    assert.equal(variant.receiverEndpointTabUnexpected, 0);
    assert.equal(variant.mainPoseSamples, 640);
    for (const orientation of variant.testedEntryYawDeg.filter(entry => entry.yaw !== 90)) {
      assert.ok(orientation.unexpectedPairSamples > 0);
    }
  }
});

test('all decision evidence still matches its content hash', () => {
  for (const [name, expected] of Object.entries(decision.evidence)) assert.equal(hash(resolve(root, name)), expected, name);
});

test('original four authentic COTS remain exact and are not substituted into exports', () => {
  const expected = {
    'wcp-0941.step': '503dff32f3e25502adfa7a0b7f9733b0b7b08e677be5a03c8c82386ba2dfade1',
    'wcp-0783.step': 'cf4820ba57cfc6d71088e2328e0bdddfda2e707a5f4e3460bd527eafcf725f3b',
    'wcp-1016.step': '00ab731705d3c7c79e61a87fdae954f09d4a156d78d56d6a289a1e3f026cd874',
    'wcp-0137.step': '2571edd253fe0eefe667ed4d318b18f6de84088d1d56a5e4aacaa5a554f04d7d',
  };
  const manifest = read('original-cots-manifest.json');
  assert.equal(manifest.vendorBodiesInCustomExports, 0);
  assert.equal(manifest.placementTransforms.length, 0);
  assert.equal(manifest.sources.length, 4);
  for (const source of manifest.sources) {
    const name = source.path.split('/').at(-1);
    assert.equal(source.sha256, expected[name]);
    assert.equal(hash(resolve(root, '../../../../', source.path)), expected[name]);
    assert.equal(source.reexportAllowed, false);
  }
});

test('baseline revision and receiver PNGs contain real rendered depth and valid PNG signatures', () => {
  for (const variant of ['baseline', 'revision']) {
    assert.ok(existsSync(resolve(root, variant, 'contact-core.step')));
    for (const preview of read(variant + '/previews.json')) {
      assert.ok(preview.foregroundDepthPixels > 10000);
      assert.ok(preview.depthMin < preview.depthMax);
      const image = readFileSync(resolve(root, variant, preview.file));
      assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    }
  }
});

test('bounded execution finished without timeout, installs or network', () => {
  for (const name of ['geometry.exit.json', 'boundary.exit.json']) {
    const execution = read(name);
    assert.equal(execution.timedOut, false);
    assert.ok(execution.seconds < 600);
    assert.equal(execution.networkAllowed, false);
    assert.equal(execution.installs, 0);
  }
  assert.equal(read('geometry.exit.json').exitCode, 0);
  assert.equal(read('boundary.exit.json').exitCode, 1);
});