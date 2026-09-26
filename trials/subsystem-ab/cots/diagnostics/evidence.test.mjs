import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, '../../../..');
const read = name => JSON.parse(readFileSync(resolve(directory, name), 'utf8'));
const roles = ['cots_hex_bearing', 'cots_x44_rear_cover', 'cots_x44_main'];

test('completed diagnostic evidence is bound to unchanged inputs and frozen gates', () => {
  const original = JSON.parse(readFileSync(resolve(root, 'trials/subsystem-ab/shared/packet-v3/original-source-roundtrip-probe.json')));
  assert.equal(original.status, 'FAIL');
  for (const role of roles) {
    const result = read(`${role}.json`);
    assert.equal(result.completed, true);
    assert.equal(result.inputBytesUnchanged, true);
    assert.equal(result.status, 'DIAGNOSTIC_ONLY_NOT_CERTIFICATION');
    assert.equal(result.environment.packages['cadquery-ocp'], '7.8.1.1.post1');
    assert.equal(result.environment.packages.cadquery, '2.6.1');
    assert.deepEqual(result.originalStrictGate, original.rows.find(row => row.role === role));
    for (const [path, digest] of Object.entries(result.inputSha256)) {
      assert.equal(createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex'), digest);
    }
    for (const direction of ['sourceToReadback', 'readbackToSource']) {
      const boundary = result[direction];
      assert.equal(boundary.facesSampled + boundary.uncoveredFaceIndices.length, boundary.faceCount);
      assert.ok(boundary.surfaceSamples > 0);
      assert.ok(boundary.unprunedCompoundCrosscheckErrorMm.every(error => error < 1e-9));
    }
  }
});

test('cover witnesses discriminate changed trimming from supporting-surface distance', () => {
  const result = read('cover-witnesses.json');
  assert.equal(result.rows.length, 2);
  for (const row of result.rows) {
    assert.equal(row.faceIndex, 843);
    assert.ok(row.ownTrimmedFaceDistanceMm < 1e-7);
    assert.ok(row.oppositeWholeBoundaryDistanceMm > 0.05);
    assert.ok(row.oppositeSupportProjections[0].distanceMm < 2e-8);
    assert.equal(row.oppositeSupportProjections[0].trimState, 'TopAbs_State.TopAbs_OUT');
  }
});

test('bearing and main conclusions retain sampling limits and scalar failures', () => {
  const bearing = read('cots_hex_bearing.json');
  const main = read('cots_x44_main.json');
  for (const direction of ['sourceToReadback', 'readbackToSource']) {
    assert.ok(bearing[direction].surfaceMaximumMm < 1e-9);
    assert.equal(bearing[direction].uncoveredFaceIndices.length, 0);
    assert.equal(main[direction].uncoveredFaceIndices.length, 31);
    assert.ok(main[direction].vertexAndEdgeMaximum.distanceMm < 1e-7);
  }
  for (const role of ['cots_x44_main', 'cots_x44_rear_cover']) {
    const result = read(`${role}.json`);
    assert.equal(result.originalStrictGate.status, 'FAIL');
    assert.ok(result.integrations.every(row => Math.abs(row.volumeDifferenceMm3) > result.originalStrictGate.volumeBudgetMm3));
  }
});

test('report stays within scope, links to existing evidence, and has six public sources', () => {
  const reportDirectory = resolve(directory, '..');
  const report = readFileSync(resolve(reportDirectory, 'ROUNDTRIP-ANALYSIS.md'), 'utf8');
  assert.ok(report.split(/\r?\n/).length <= 250);
  for (const match of report.matchAll(/\]\(([^)]+)\)/g)) {
    assert.ok(existsSync(resolve(reportDirectory, match[1])), match[1]);
  }
  assert.equal(new Set(report.match(/https:\/\/\S+/g)).size, 6);
});