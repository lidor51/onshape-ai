import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {layout, classify, trace, floatConfig} from './coaxial-transport.mjs';

test('shorter deployed layout preserves catalog center distances and clears the hard crest throat', () => {
  const config = layout();
  assert.ok(Math.abs(Math.hypot(...config.front.map((value, axis) => value - config.middle[axis])) - 205) < 1e-8);
  assert.ok(Math.abs(Math.hypot(...config.middle.map((value, axis) => value - config.rear[axis])) - 155) < 1e-8);
  assert.ok(config.rear[0] - config.starRadius > -85);
  for (const name of ['middle', 'rear']) {
    const distance = Math.hypot(Math.max(-85 - config[name][0], config[name][0], 0), config[name][1] - 165);
    assert.ok(distance - config.upperHardRadius > 114.3);
  }
});

test('path search cannot label bumper and shaft penetration as compliant contact', () => {
  assert.equal(classify([-40, 170]).geometricallyAllowed, false);
  assert.equal(classify(layout().middle).geometricallyAllowed, false);
  const result = trace();
  for (const point of result.path) {
    assert.equal(classify(point).geometricallyAllowed, true);
    assert.equal(classify(point).drivenEnvelope, true);
  }
  assert.equal(result.physicalFeedProven, false);
  assert.equal(result.continuousPathCertified, false);
});

test('entry cannot be initialized behind the front roller to manufacture a feeding pass', () => {
  const manifest = JSON.parse(readFileSync(new URL('coaxial-output/revision-165/manifest.json', import.meta.url)));
  const config = {...layout(), ...manifest.roller_centers_yz, trayTop: 175};
  assert.equal(trace(config).status, 'NO_ROUTE_IN_SEARCH');
  config.kick = [-122, 34];
  const result = trace(config);
  assert.equal(result.status, 'NO_ROUTE_IN_SEARCH');
  for (const point of result.path.slice(0, 1)) assert.ok(point[0] < config.front[0]);
  for (const point of result.path) assert.equal(classify(point, config).geometricallyAllowed, true);
  assert.equal(result.contactForceAndVelocityDirectionsSolved, false);
  assert.equal(result.releaseReady, false);
  const floating = floatConfig(config, -8);
  assert.ok(floating.front[1] > config.front[1]);
  assert.ok(Math.abs(Math.hypot(...floating.front.map((value, axis) => value - config.middle[axis])) - 180) < 1e-7);
  const sensitive = floatConfig(config, -4), candidate = trace(sensitive);
  assert.equal(candidate.status, 'DISCRETE_ENVELOPE_ROUTE_FOUND');
  assert.ok(candidate.path[0][0] < sensitive.front[0]);
  assert.equal(candidate.physicalFeedProven, false);
});