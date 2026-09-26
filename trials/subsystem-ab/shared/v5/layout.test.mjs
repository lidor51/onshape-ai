import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defaults, datums, evaluateContact, supportAt } from './layout.mjs';

const report = evaluateContact();
const checks = [];
function check(name, assertion) {
  try { assertion(); checks.push({ name, pass: true }); }
  catch (error) { checks.push({ name, pass: false, reason: error.message }); }
}
check('floor support derives nominal radius', () => assert.equal(supportAt(-700, 90).z, 57.15));
check('flat cradle support derives nominal height for every yaw', () => {
  for (const yaw of [0, 15, 45, 75, 90]) assert.equal(supportAt(400, yaw).z, 237.15);
});
check('inclined support uses exact offset, not interpolated poses', () => {
  const slope = defaults.deckHeight / (defaults.crestY - defaults.toeY);
  const expected = slope * (-240 - defaults.toeY) + defaults.coralDiameter / 2 * Math.hypot(1, slope);
  assert.ok(Math.abs(supportAt(-240, 90).z - expected) < 1e-8);
});
check('five pickup axes only', () => assert.equal(report.rollers.length, 5));
check('starting perimeter has explicit rule margin', () => assert.ok(datums.startingPerimeter <= datums.startingPerimeterLimit));
check('deployed rollers inside forward extension', () => {
  for (const roller of report.rollers) assert.ok(roller.y - roller.radius >= -datums.extensionLimit, roller.id);
});
check('same-bank rollers do not overlap', () => {
  for (const [index, first] of report.rollers.entries()) {
    for (const second of report.rollers.slice(index + 1)) {
      if (Math.min(first.x[1], second.x[1]) <= Math.max(first.x[0], second.x[0])) continue;
      for (const float of first.floating ? [0, defaults.frontFloat] : [0]) {
        assert.ok(Math.hypot(first.y - second.y, first.z + float - second.z) >= first.radius + second.radius,
          `${first.id}/${second.id}`);
      }
    }
  }
});
check('opposing powered contact has no gap after capture', () => assert.equal(report.gaps.length, 0, JSON.stringify(report.gaps)));
check('initial capture happens while floor-supported', () => {
  const initial = report.samples.find(sample => sample.driven);
  assert.ok(initial && initial.segment === 'floor');
});
check('compression within declared unverified 8 mm allowance', () => assert.ok(report.maximumCompression <= 8.001, String(report.maximumCompression)));
check('front float can satisfy declared preload without exceeding stop', () => assert.ok(report.maximumRequiredFloat <= defaults.frontFloat, String(report.maximumRequiredFloat)));
check('coral clears hard roller cores', () => assert.ok(report.minimumCoreClearance > 0, String(report.minimumCoreClearance)));
check('coral clears uninterrupted bumper', () => assert.ok(report.minimumBumperClearance >= 0, String(report.minimumBumperClearance)));
check('fixed opposed orienter overlaps pickup before handoff', () => {
  assert.ok(report.samples.some(sample => sample.contacts.some(contact => contact.active) &&
    sample.orienterContacts.every(contact => contact.active)));
  assert.ok(report.samples.at(-1).orienterContacts.every(contact => contact.active));
  for (const sample of report.samples) for (const contact of sample.orienterContacts) {
    assert.ok(contact.compression <= defaults.compressionLimit);
    assert.ok(contact.hardClearance > 0);
  }
});
check('supported path is continuous at plate transition', () => {
  for (let index = 1; index < report.samples.length; index++) {
    assert.ok(Math.abs(report.samples[index].z - report.samples[index - 1].z) <= 0.5);
  }
});
const result = { status: checks.every(check => check.pass) ? 'PASS_CONTACT_CORE_ONLY' : 'FAIL_CONTACT_CORE',
  frozen: false, physicalPerformance: 'UNVERIFIED', checks, ...report };
writeFileSync(fileURLToPath(new URL('./contact-report.json', import.meta.url)), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, checks, gaps: report.gaps,
  captureY: report.acquiredAtY, maximumCompression: report.maximumCompression,
  maximumRequiredFloat: report.maximumRequiredFloat, rollers: report.rollers,
  flatBankEquation: report.flatBankEquation }, null, 2));
process.exitCode = checks.every(check => check.pass) ? 0 : 1;