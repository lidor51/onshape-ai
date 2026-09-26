import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coaxialTransform} from './coaxial-motion.mjs';

const mesh = JSON.parse(readFileSync(new URL('coaxial-output/revision-feed/coaxial-mesh.json', import.meta.url)));
test('viewer transforms reproduce every exported deployed and stow matrix', () => {
  for (const part of mesh.instances) {
    for (const [angle, matrix] of [[0, part.matrix], [mesh.motion.stow_deg, part.stow_matrix]]) {
      const actual = coaxialTransform(part, mesh.motion, angle).transpose().elements;
      for (const [index, expected] of matrix.flat().entries()) assert.ok(Math.abs(actual[index] - expected) < 1e-8, part.id);
    }
  }
});
test('full context retains motors and the rear power shaft while the cassette folds', () => {
  assert.equal(mesh.instances.filter(part => part.role === 'motor').length, 4);
  for (const id of ['v2_shaft_rear', 'v1_detachable_tray', 'pickup_pickup_drive_X44']) {
    const part = mesh.instances.find(entry => entry.id === id);
    assert.equal(part.motion, 'fixed');
    assert.deepEqual(coaxialTransform(part, mesh.motion, -165, -8).elements, coaxialTransform(part, mesh.motion).elements);
  }
});