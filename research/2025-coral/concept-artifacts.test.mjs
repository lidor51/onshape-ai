import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const directory = new URL('./', import.meta.url);

test('saved screen binds all current inputs and leaves CAD/physical claims unverified', async () => {
  const screen = JSON.parse(await readFile(new URL('concept-screen.json', directory), 'utf8'));
  for (const [name, hash] of Object.entries(screen.sourceHashes)) {
    assert.equal(createHash('sha256').update(await readFile(new URL(name, directory))).digest('hex'), hash, name);
  }
  assert.equal(screen.apiCalls, 0);
  assert.equal(screen.cadCreated, false);
  assert.equal(screen.physicalTestsRun, false);
  assert.equal(screen.pivotScreens.length, 3);
  assert.ok(screen.pivotSensitivity.every(row => row.thermalImpactAndGearStrength === 'UNVERIFIED'));
});

test('non-default assumptions propagate to generated prose, geometry allowances and diagram', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'intake-concept-test-'));
  try {
    for (const name of ['concept-inputs.json', 'rules.json', 'cots.json', 'sizing.mjs', 'sizing.test.mjs', 'generate-concept.mjs']) {
      await copyFile(new URL(name, directory), join(temporary, name));
    }
    const inputs = JSON.parse(await readFile(join(temporary, 'concept-inputs.json'), 'utf8'));
    Object.assign(inputs.designAssumptions, { blankChassisWidthMm: 680, blankChassisLengthMm: 740,
      coralSweptEnvelopeExtraPerSideMm: 25, pivotCoralCenterOfMassRadiusM: 0.35,
      pivotFrictionTorqueNm: 2, pivotLoadFactor: 1.8 });
    await writeFile(join(temporary, 'concept-inputs.json'), JSON.stringify(inputs));
    execFileSync(process.execPath, [join(temporary, 'generate-concept.mjs')], { encoding: 'utf8', timeout: 10000 });
    const text = await readFile(join(temporary, 'SIZING.md'), 'utf8');
    const diagram = await readFile(join(temporary, 'concept-A-functional.svg'), 'utf8');
    const report = JSON.parse(await readFile(join(temporary, 'concept-screen.json'), 'utf8'));
    assert.ok(text.includes('at 0.35 m'));
    assert.ok(text.includes('2 N m friction, 1.8 load factor'));
    assert.ok(diagram.includes('680 x 740 mm starting reference'));
    assert.ok(report.candidateEnvelope.planViewAssumption.includes('25 mm inflation'));
    assert.equal(report.candidateEnvelope.perimeterMm, 2840);
    assert.equal(report.pivotSensitivity.length, 6);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});