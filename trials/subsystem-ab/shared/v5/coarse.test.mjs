import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { prepare, yawClearance } from './coarse.mjs';

const results = [];
for (const name of ['baseline', 'revision']) {
  const packet = prepare(name);
  const checks = [];
  function check(label, assertion) {
    try { assertion(); checks.push({ label, pass: true }); }
    catch (error) { checks.push({ label, pass: false, reason: error.message }); }
  }
  check('contact core remains gap-free', () => assert.equal(packet.contact.gaps.length, 0));
  check('126 deployment/float envelope samples', () => assert.equal(packet.sweep.samples.length, 126));
  check('global roller/ramp extension within 457.2 mm', () => assert.ok(packet.sweep.front >= -457.2, String(packet.sweep.front)));
  check('rollers clear bumper across deployment', () => assert.ok(packet.sweep.bumperClearance >= 0, String(packet.sweep.bumperClearance)));
  check('stowed coarse geometry inside starting box', () => {
    for (const sample of packet.sweep.stowed) {
      assert.ok(sample.front >= 0 && sample.back <= 760 && sample.top <= 1066.8, JSON.stringify(sample));
    }
  });
  check('crosswise-to-longitudinal geometric route exists', () => assert.equal(packet.yaw.status, 'GEOMETRIC_ROUTE_ONLY'));
  check('yaw path edges, not only vertices, clear compliant limit', () => {
    for (let index = 1; index < packet.yaw.path.length; index++) {
      const previous = packet.yaw.path[index - 1];
      const current = packet.yaw.path[index];
      for (let fraction = 0; fraction <= 20; fraction++) {
        const center = previous[0] + (current[0] - previous[0]) * fraction / 20;
        const yaw = previous[1] + (current[1] - previous[1]) * fraction / 20;
        assert.ok(yawClearance(center, yaw, packet.parameters) >= 0, `${center}/${yaw}`);
      }
    }
  });
  packet.checks = checks;
  packet.status = checks.every(check => check.pass) ? 'PASS_COARSE_ENVELOPES_ONLY' : 'FAIL_COARSE_ENVELOPES';
  writeFileSync(fileURLToPath(new URL(`./${name}-layout.json`, import.meta.url)), JSON.stringify(packet, null, 2) + '\n');
  results.push({ name, status: packet.status, checks, front: packet.sweep.front,
    bumperClearance: packet.sweep.bumperClearance, stowed: packet.sweep.stowed,
    yaw: { status: packet.yaw.status, states: packet.yaw.path.length, minimumClearance: packet.yaw.minimumClearance } });
}
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.every(result => result.status === 'PASS_COARSE_ENVELOPES_ONLY') ? 0 : 1;