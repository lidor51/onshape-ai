import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCatalog, originalImport, bindOriginalReadback } from './v4-catalog.mjs';
import { sha256 } from './ledger.mjs';

const bytes = Buffer.from('synthetic test bytes, not a vendor file');
const boundsMm = [0, 0, 0, 1, 1, 1];
const body = (index, role, purpose) => ({ index, role, function: purpose, volumeMm3: 1, boundsMm });
const transform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function catalogFixture(quantity = 1) {
  const catalog = { schema: 'subsystem-ab-api-v4-catalog/1', packetVersion: 'v4', freezeSha256: 'a'.repeat(64),
    rootInstance: 'base', sourceGroups: [
      { id: 'motor-source', kind: 'ORIGINAL_VENDOR', model: 'KRAKEN_X44', importMode: 'ORIGINAL_BYTES',
        filename: 'test-original.step', originalSha256: sha256(bytes), importSha256: sha256(bytes), units: 'mm', solidCount: 2,
        bodies: [body(1, 'motorBody', 'VENDOR_BODY'), body(2, 'motorCover', 'REAR_COVER')] },
      { id: 'custom', kind: 'GENERATED_CUSTOM', bodies: [body(1, 'basePart', 'BASE'), body(2, 'gearPart', 'OUTPUT_GEAR')] },
    ], instances: [], joints: [], relations: [], componentCatalog: [], motorPresentations: [] };
  const instance = (id, part) => ({ id, part, transformsSI: { baseline: transform, revision: transform, receiverControlProbe: transform } });
  catalog.instances.push(instance('base', 'basePart'), instance('gear', 'gearPart'));
  catalog.joints.push({ id: 'gear-revolute', parent: 'base', child: 'gear', type: 'REVOLUTE' });
  catalog.componentCatalog.push({ id: 'custom', sourceGroup: 'custom', quantity: 1,
    occurrences: [{ id: 'custom-components', bodyInstances: { basePart: 'base', gearPart: 'gear' } }] });
  const motors = { id: 'x44', sourceGroup: 'motor-source', quantity, occurrences: [] };
  for (let index = 0; index < quantity; index++) {
    const housing = `body-${index}`;
    const cover = `cover-${index}`;
    const componentId = `motor-${index}`;
    catalog.instances.push(instance(housing, 'motorBody'), instance(cover, 'motorCover'));
    catalog.joints.push({ id: `mount-${index}`, parent: 'base', child: housing, type: 'FASTENED' },
      { id: `cover-mate-${index}`, parent: housing, child: cover, type: 'FASTENED' });
    motors.occurrences.push({ id: componentId, bodyInstances: { motorBody: housing, motorCover: cover } });
    catalog.motorPresentations.push({ componentId, vendorPresentation: 'STATIC_NONSEPARABLE_VENDOR_GEOMETRY',
      outputReference: { kind: 'OUTPUT_GEAR_DOF_APPROXIMATION', instanceId: 'gear', revoluteId: 'gear-revolute', claimsVendorRotor: false } });
  }
  catalog.componentCatalog.push(motors);
  return catalog;
}

test('catalog derives arbitrary counts, reuses one original import and does not invent a motor shaft', () => {
  for (const quantity of [1, 4, 30]) {
    const catalog = catalogFixture(quantity);
    const summary = analyzeCatalog(catalog);
    assert.equal(summary.instances, 2 + quantity * 2);
    assert.equal(summary.originalImportGroups, 1);
    assert.equal(summary.motorDofApproximations, quantity);
    assert.equal(summary.importBytesVerified, false);
    assert.equal(summary.destinationGeometry, 'UNVERIFIED');
    assert.equal(summary.rigidGroups, 1);
  }
  for (const mutate of [
    catalog => { catalog.sourceGroups[0].importMode = 'LOSSLESS_BUNDLE'; },
    catalog => { catalog.sourceGroups[0].importSha256 = 'b'.repeat(64); },
    catalog => { catalog.sourceGroups[0].bodies.pop(); },
    catalog => { catalog.componentCatalog[1].quantity++; },
    catalog => { catalog.componentCatalog[1].occurrences[0].bodyInstances.motorCover = 'body-0'; },
    catalog => { catalog.joints[2].type = 'REVOLUTE'; },
    catalog => { catalog.motorPresentations[0].outputReference.instanceId = 'cover-0'; },
    catalog => { catalog.motorPresentations[0].outputReference.kind = 'GENERATED_SEPARATE_OUTPUT'; },
    catalog => { catalog.motorPresentations[0].outputReference.claimsVendorRotor = true; },
  ]) {
    const catalog = catalogFixture();
    mutate(catalog);
    assert.throws(() => analyzeCatalog(catalog), /V4_/);
  }
});

test('original import uploads the identical bytes, not a rebuilt STEP or placement bundle', () => {
  const group = catalogFixture().sourceGroups[0];
  const prepared = originalImport(group, bytes);
  assert.equal(prepared.fields.file, bytes);
  assert.equal(prepared.fields.createComposite, false);
  assert.equal(prepared.fields.allowFaultyParts, false);
  assert.throws(() => originalImport(group, Buffer.from('reexport')), /ORIGINAL_BYTES_HASH_MISMATCH/);
});

test('native body mapping uses complete measured identities, never returned list order or motor rotor assumptions', () => {
  const group = catalogFixture().sourceGroups[0];
  group.bodies[1].volumeMm3 = 2;
  const sourceMicroversion = '1'.repeat(24);
  const parts = ['coverNative', 'bodyNative'].map(partId => ({ partId, elementId: 'originalPS', bodyType: 'solid', microversionId: sourceMicroversion }));
  const measured = { units: 'mm', sourceMicroversion,
    bodies: parts.map(part => ({ partId: part.partId, volumeMm3: part.partId === 'bodyNative' ? 1 : 2, boundsMm })) };
  const receipt = { inputSha256: group.originalSha256, elementId: 'originalPS', sourceMicroversion,
    bodyMap: [{ index: 1, partId: 'bodyNative' }, { index: 2, partId: 'coverNative' }] };
  assert.equal(bindOriginalReadback(group, parts, measured, receipt).motorBody.partId, 'bodyNative');
  assert.equal(bindOriginalReadback(group, parts, measured, receipt).motorCover.partId, 'coverNative');
  assert.throws(() => bindOriginalReadback(group, parts.slice(1), measured, receipt), /COMPLETE_SOURCE_RECEIPT/);
  assert.throws(() => bindOriginalReadback(group, parts, measured, { ...receipt, inputSha256: '0'.repeat(64) }), /COMPLETE_SOURCE_RECEIPT/);
  measured.bodies[0].volumeMm3 = 1;
  assert.throws(() => bindOriginalReadback(group, parts, measured, receipt), /AMBIGUOUS_OR_MISSING_BODY_GEOMETRY/);
  measured.bodies[0].volumeMm3 = 3;
  assert.throws(() => bindOriginalReadback(group, parts, measured, receipt), /AMBIGUOUS_OR_MISSING_BODY_GEOMETRY/);
});