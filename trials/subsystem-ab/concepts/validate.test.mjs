import assert from 'node:assert/strict';
import test from 'node:test';
import { validateConcept } from './validate.mjs';

function fixture() {
  const view = { path: [[0,0],[20,30],[40,40]], guides: [], rollers: [], labels: [], receiver: { center: [40,40], label: 'Receiver' } };
  return { id: '01', title: 'Test', family: 'Test', summary: 'Test', advantage: 'Test', risk: 'Test', firstTest: 'Test', inspiration: 'Test', states: 'Untested', complexity: 'low', mouthWidthMm: 500,
    side: { ...structuredClone(view), pivot: null, links: [], ghost: [] },
    plan: { ...structuredClone(view), movingOutline: [], coralYawDeg: 0 } };
}

test('concept contract preserves aligned receiver coordinates and finite geometry', () => {
  assert.equal(validateConcept(fixture()).id, '01');
  const wrong = fixture();
  wrong.plan.receiver.center[1] = 41;
  assert.throws(() => validateConcept(wrong), /Receiver/);
  const badPoint = fixture();
  badPoint.side.path[0][0] = NaN;
  assert.throws(() => validateConcept(badPoint), /finite/);
});

test('concept IDs include the requested additions and reject IDs outside the collection', () => {
  for (const id of ['11', '12', '13', '14']) assert.equal(validateConcept({ ...fixture(), id }).id, id);
  for (const id of ['00', '15', '1']) assert.throws(() => validateConcept({ ...fixture(), id }));
});

test('an open bumper needs bounded dimensions and an explicit 2025 rules warning', () => {
  const concept = { ...fixture(), id: '12', bumperOpening: { widthMm: 350, recessDepthMm: 340 }, notice: '2025 NON-COMPLIANT' };
  assert.equal(validateConcept(concept).id, '12');
  assert.throws(() => validateConcept({ ...concept, notice: undefined }), /rules warning/);
  assert.throws(() => validateConcept({ ...concept, bumperOpening: { widthMm: 0, recessDepthMm: 340 } }), /opening width/);
  assert.throws(() => validateConcept({ ...concept, bumperOpening: { widthMm: 350, recessDepthMm: NaN } }), /recess depth/);
});

test('locked and driven contacts remain distinct valid rotation states', () => {
  const concept = fixture();
  concept.side.rollers = [{ center: [0,50], radius: 25, rotation: 'locked', label: 'Carrier-locked lower contact' }];
  concept.plan.guides = [{ points: [[0,0],[10,10]], rotation: 'driven', label: 'Driven contact band' }];
  assert.equal(validateConcept(concept), concept);
  concept.side.rollers[0].rotation = 'unknown';
  assert.throws(() => validateConcept(concept), /contact rotation/);
});