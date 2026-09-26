import assert from 'node:assert/strict';

function point(value) {
  assert.ok(Array.isArray(value) && value.length === 2 && value.every(Number.isFinite), 'Expected finite 2D coordinate');
}

export function validateConcept(concept) {
  assert.match(concept.id, /^(0[1-9]|1[0-4])$/);
  for (const field of ['title', 'family', 'summary', 'advantage', 'risk', 'firstTest', 'inspiration', 'states']) {
    assert.ok(typeof concept[field] === 'string' && concept[field].trim().length > 0, `Missing ${field}`);
  }
  for (const field of ['summary', 'advantage', 'risk', 'firstTest']) assert.ok(concept[field].length <= 180, `${field} too long`);
  assert.ok(['low', 'moderate', 'high'].includes(concept.complexity));
  assert.ok(concept.mouthWidthMm >= 350 && concept.mouthWidthMm <= 600);
  if (concept.notice !== undefined) assert.ok(typeof concept.notice === 'string' && concept.notice.length <= 120, 'Invalid notice');
  if (concept.bumperOpening !== undefined) {
    const { widthMm, recessDepthMm } = concept.bumperOpening;
    assert.ok(Number.isFinite(widthMm) && widthMm > 114.3 && widthMm < 700, 'Invalid bumper opening width');
    assert.ok(Number.isFinite(recessDepthMm) && recessDepthMm > 0 && recessDepthMm < 760, 'Invalid chassis recess depth');
    assert.ok(concept.notice?.includes('2025 NON-COMPLIANT'), 'Open bumper needs explicit rules warning');
  }
  for (const view of ['side', 'plan']) {
    const geometry = concept[view];
    assert.ok(geometry && Array.isArray(geometry.path) && geometry.path.length >= 3, 'Missing transport path');
    const points = [...geometry.path];
    for (const field of ['guides', 'rollers', 'labels']) assert.ok(Array.isArray(geometry[field]), `Missing ${view}.${field}`);
    for (const contact of [...geometry.guides, ...geometry.rollers]) {
      if (contact.rotation !== undefined) assert.ok(['locked', 'driven'].includes(contact.rotation), 'Invalid contact rotation');
    }
    for (const guide of geometry.guides) {
      assert.ok(guide.points.length >= 2);
      points.push(...guide.points);
    }
    for (const roller of geometry.rollers) {
      point(roller.center);
      assert.ok(Number.isFinite(roller.radius) && roller.radius > 0 && roller.radius < 110);
      points.push(roller.center);
    }
    points.push(geometry.receiver.center, ...geometry.labels.map(label => label.at));
    for (const value of points) point(value);
  }
  assert.ok(Math.abs(concept.side.receiver.center[0] - concept.plan.receiver.center[1]) < 1e-8, 'Receiver y must agree between views');
  assert.ok(Array.isArray(concept.side.links) && Array.isArray(concept.side.ghost));
  for (const link of concept.side.links) link.points.forEach(point);
  for (const outline of concept.side.ghost) outline.forEach(point);
  if (concept.side.pivot !== null) point(concept.side.pivot);
  concept.plan.movingOutline.forEach(point);
  assert.ok(Number.isFinite(concept.plan.coralYawDeg));
  return concept;
}