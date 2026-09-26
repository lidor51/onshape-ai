import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FRAME, margins, audit} from './starting-envelope.mjs';

test('starting constraint uses frame rather than bumper face and checks width', () => {
  assert.equal(margins([-100, -20, 20, 100, 200, 300]).front, -20);
  assert.equal(margins([-356, 5, 20, 356, 200, 300]).left, -6);
  assert.equal(margins([-356, 5, 20, 356, 200, 300]).right, -6);
  assert.equal(FRAME.y[0], 0);
});

test('actual collapsed model includes fixed protrusions and all motors', () => {
  const mesh = JSON.parse(readFileSync(new URL('coaxial-output/revision-feed/coaxial-mesh.json', import.meta.url)));
  const deployed = audit(mesh, {angle: 0}), folded = audit(mesh);
  assert.equal(folded.physicalParts, 502);
  assert.equal(folded.motorCount, 4);
  assert.equal(folded.status, 'FAIL_OUTSIDE_FRAME');
  assert.ok(folded.fixedOutsideCount > 0);
  assert.ok(folded.minimumMarginsMm.front < -85);
  assert.ok(folded.minimumMarginsMm.left <= -6);
  const fixed = folded.outsideParts.find(part => part.id === 'v2_star_rear_0_body_2');
  assert.ok(fixed);
  assert.deepEqual(fixed.boundsMm, deployed.outsideParts.find(part => part.id === fixed.id).boundsMm);
  assert.equal(folded.startingConfigurationCertified, false);
});