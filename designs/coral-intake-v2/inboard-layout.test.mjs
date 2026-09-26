import test from 'node:test';
import assert from 'node:assert/strict';
import {inboardLayout} from './inboard-layout.mjs';

test('inboard row layout has positive front reserve with exact catalog spans', () => {
  const config = inboardLayout();
  assert.ok(config.rear[0] - config.starRadius > 5);
  assert.ok(Math.abs(Math.hypot(...config.front.map((value, axis) => value - config.middle[axis])) - 192.5) < 1e-8);
  assert.ok(Math.abs(Math.hypot(...config.middle.map((value, axis) => value - config.rear[axis])) - 230) < 1e-8);
  assert.equal(config.frontBeltLength, 475);
  assert.equal(config.rearBeltLength, 550);
  assert.equal(config.front[1], 166);
  assert.throws(() => inboardLayout({frontSpan: 10}));
});