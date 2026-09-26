import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { admitPilot } from './pilot-approval.mjs';
import { pilotMain } from './pilot.mjs';
import { pilotSource } from './pilot-source.mjs';
import { pilotGraph } from './pilot-assembly.mjs';
import { batchInstances } from './native.mjs';
import { loadSchema } from './schema.mjs';
import { pilotMateBodies } from './pilot-mates.mjs';
import { observedMateValueRequest } from './pilot-motion.mjs';

const approval = JSON.parse(readFileSync(new URL('./parent-pilot-approval.json', import.meta.url), 'utf8'));

test('explicit pilot approval does not require or admit production geometry', () => {
  assert.equal(admitPilot(approval).origin, 'https://cad.onshape.com');
  assert.equal(approval.productionGeometryAdmitted, false);
  assert.throws(() => admitPilot({ ...approval, productionGeometryAdmitted: true }), /PROVISIONAL/);
  assert.throws(() => admitPilot({ ...approval, maximumNewDocuments: 2 }), /OWNERSHIP/);
  assert.throws(() => admitPilot({ ...approval, allowance: { ...approval.allowance, remaining: 649 } }), /ALLOWANCE/);
});

test('pilot cannot load credentials without its explicit command', async () => {
  await assert.rejects(pilotMain([]), /EXPLICIT_PILOT_COMMAND_REQUIRED/);
  await assert.rejects(pilotMain(['production', '--live-approved-pilot']), /EXPLICIT_PILOT_COMMAND_REQUIRED/);
});

test('provisional source makes exactly two solids and three owned datums with a documented batch insertion', () => {
  const source = pilotSource(3070);
  assert.equal((source.match(/fCuboid\(/g) ?? []).length, 2);
  assert.equal((source.match(/opMateConnector\(/g) ?? []).length, 3);
  assert.throws(() => pilotSource(0), /OBSERVED_FS_VERSION/);
  const parts = Object.fromEntries(['base', 'arm'].map(role => [role, { elementId: 'fixture', partId: role }]));
  loadSchema().request('insertTransformedInstances', { did: 'fixture', wid: 'fixture', eid: 'fixture' },
    batchInstances(pilotGraph, parts, 'fixture'));
});

test('ground and limit probes use observed owned connectors and published native shapes', () => {
  const ledger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
  const response = key => ledger.attempts.find(entry => entry.key === key)?.result;
  if (!response('pilot-instance-readback')) return;
  const bodies = pilotMateBodies(response('pilot-instance-readback'), ledger.checkpoints['pilot-instance-binding'],
    response('pilot-native-base'), response('pilot-native-specs'));
  const ids = { did: 'fixture', wvm: 'w', wvmid: 'fixture', eid: 'fixture' };
  for (const body of Object.values(bodies)) loadSchema().request('addFeature', ids, body);
  assert.equal(bodies.ground.feature.subFeatures[0].parameters[1].queries[0].inferenceType, 'PART_ORIGIN');
  assert.equal(bodies.revolute.feature.parameters.find(parameter => parameter.parameterId === 'limitAxialZMax').expression, '60 deg');
});

test('motion codec accepts only a readback-observed Revolute extension and preserves endpoint encoding', () => {
  const schema = loadSchema();
  const observed = { mateValues: [{ jsonType: 'Revolute', rotationZ: 0, ownerOccurrencePath: [], mateName: 'fixture', featureId: 'fixture' }] };
  const body = { mateValues: [{ ...observed.mateValues[0], rotationZ: Math.PI / 2 }] };
  const ids = { did: 'fixture', wid: 'fixture', eid: 'fixture' };
  const request = observedMateValueRequest(schema, ids, body, observed);
  assert.equal(request.path, '/api/v17/assemblies/d/fixture/w/fixture/e/fixture/matevalues');
  assert.equal(request.body.mateValues[0].rotationZ, Math.PI / 2);
  assert.throws(() => observedMateValueRequest(schema, ids, body, undefined), /OBSERVED_REVOLUTE/);
  assert.throws(() => observedMateValueRequest(schema, ids, { mateValues: [{ ...body.mateValues[0], invented: true }] }, observed), /OBSERVED_REVOLUTE/);
});