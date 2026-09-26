import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MOTOR_ROLES, motorInventory} from './motor-roles.mjs';
const manifest = JSON.parse(readFileSync(new URL('final-frame-output/revision-clearance/manifest.json', import.meta.url)));

test('every actual motor has exactly one function and matches the installed ratio', () => {
  const inventory = motorInventory(manifest);
  assert.equal(inventory.length, 4);
  assert.equal(new Set(inventory.map(motor => motor.id)).size, 4);
  for (const motor of inventory) {
    assert.equal(motor.motorSku, 'WCP-0941');
    assert.equal(motor.motion, 'fixed');
    assert.ok(motor.centerDatumMm.every(Number.isFinite));
  }
  const ratios = manifest.powertrain_installation.ratios;
  assert.ok(Math.abs(inventory[0].reduction - Math.abs(ratios.deployment_motor_to_cheek)) < 1e-9);
  assert.equal(inventory[1].reduction, Math.abs(ratios.upper_motor_to_roller));
  assert.equal(inventory[1].kickerReduction, ratios.kicker_motor_to_roller);
  assert.equal(inventory[2].reduction, Math.abs(ratios.indexer_each));
  assert.equal(inventory[3].reduction, Math.abs(ratios.indexer_each));
});

test('a fifth motor or an unrecognized ID cannot silently disappear from the map', () => {
  assert.throws(() => motorInventory({...manifest, instances: [...manifest.instances, {id: 'extra', role: 'motor'}]}));
  assert.throws(() => motorInventory({...manifest, instances: manifest.instances.map(part => part.id === MOTOR_ROLES[0].id ? {...part, id: 'changed'} : part)}));
});