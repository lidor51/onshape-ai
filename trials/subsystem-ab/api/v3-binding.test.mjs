import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeEvaluation, freezeMigration, validateBindingContract, validateNativeReadback } from './v3-binding.mjs';

const liveLedger = JSON.parse(readFileSync(new URL('./ledger.json', import.meta.url), 'utf8'));
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const variants = ['baseline', 'revision', 'receiverControlProbe'];
const eachVariant = value => Object.fromEntries(variants.map(variant => [variant, structuredClone(value)]));
const geometry = { volumeMm3: 100, boundsMm: [0, 0, 0, 10, 10, 1] };
function fixture() {
  const contract = { schema: 'subsystem-ab-api-v3-binding/1', origin: liveLedger.binding.origin,
    did: 'c88349fc8bd39b3e6d811b19', wid: '2cb07fb6d6b08930d5b0cf8f', packetVersion: 'v3',
    freezeSha256: 'a'.repeat(64), sourceSha256: 'b'.repeat(64), evaluatorSha256: 'c'.repeat(64), nativeGroupsAuthorized: true,
    parts: Object.fromEntries(['chassis', 'housing', 'rearCover', 'shaft'].map(role => [role, { nativeName: role,
      sourceGroup: ['chassis', 'shaft'].includes(role) ? 'custom' : 'vendor', geometry: eachVariant(geometry) }])),
    sourceGroups: [{ id: 'custom', kind: 'generated', partRoles: ['chassis', 'shaft'] }, { id: 'vendor', kind: 'authentic',
      partRoles: ['housing', 'rearCover'], importSha256: 'd'.repeat(64), originals: [{ sha256: 'e'.repeat(64), solidCount: 2 }],
      preservation: ['housing', 'rearCover'].map((partRole, index) => ({ partRole, originalSha256: 'e'.repeat(64),
        bodyIndex: index + 1, sourceToBundleRowMajorMm: identity })) }],
    instances: ['chassis', 'housing', 'rearCover', 'shaft'].map(id => ({ id, part: id, transformsSI: eachVariant(identity) })),
    joints: [{ id: 'mount', type: 'FASTENED', parent: 'chassis', child: 'housing' },
      { id: 'cover', type: 'FASTENED', parent: 'housing', child: 'rearCover' },
      { id: 'output', type: 'REVOLUTE', parent: 'housing', child: 'shaft' }],
    motorBindings: [{ housingInstance: 'housing', rearCoverInstance: 'rearCover', rearCoverMate: 'cover',
      shaftInstance: 'shaft', shaftProvenance: 'GENERATED_SEPARATE_OUTPUT', revoluteMate: 'output' }],
    connectors: [['ground:chassis', 'chassis'], ['mount:parent', 'chassis'], ['mount:child', 'housing'],
      ['cover:parent', 'housing'], ['cover:child', 'rearCover'],
      ['output:parent', 'housing'], ['output:child', 'shaft']].map(([key, partRole], index) => ({
      key, partRole, featureIdSuffix: `datum${index}`, framesSI: eachVariant(identity) })),
    relations: [], motionScenarios: [{ id: 'offline-only-fixture' }],
  };
  return contract;
}
function typed(value) {
  if (Array.isArray(value)) return { btType: 'BTFSValueArray-1499', value: value.map(typed) };
  if (value && typeof value === 'object') return { btType: 'BTFSValueMap-2062', value: Object.entries(value)
    .map(([key, item]) => ({ btType: 'BTFSValueMapEntry-2077', key: typed(key), value: typed(item) })) };
  return { btType: { string: 'BTFSValueString-1422', number: 'BTFSValueNumber-772', boolean: 'BTFSValueBoolean-1195' }[typeof value], value };
}
function readbackFixture(contract) {
  const ledger = structuredClone(liveLedger);
  const readback = { variant: 'baseline', sourceGroups: {}, assemblyKey: 'fixture-assembly' };
  const parts = [];
  const microversion = '1'.repeat(24);
  const add = (key, operation, result) => ledger.attempts.push({ sequence: ledger.attempts.length + 1, key, operation,
    status: 'SUCCESS', result, evidenceKind: 'OFFLINE_FIXTURE_NOT_LIVE_PROOF' });
  for (const group of contract.sourceGroups) {
    const bodies = group.partRoles.map(role => ({ name: role, partId: `part-${role}`, elementId: group.id, bodyType: 'solid' }));
    const partsKey = `${group.id}-parts`;
    const geometryKey = `${group.id}-geometry`;
    readback.sourceGroups[group.id] = { partsKey, geometryKey };
    add(partsKey, 'getPartsWMVE', bodies);
    add(geometryKey, 'evalFeatureScript', { sourceMicroversion: microversion,
      result: typed({ schema: 'subsystem-ab-api-source-geometry/1', units: 'mm', variant: 'baseline',
        bodies: bodies.map(body => ({ partId: body.partId, ...geometry })) }) });
    ledger.checkpoints[`v3-source-readback:${geometryKey}`] = { evaluatorSha256: contract.evaluatorSha256,
      partsKey, documentId: contract.did, elementId: group.id, sourceMicroversion: microversion };
    parts.push(...bodies.map(body => ({ documentId: contract.did, elementId: body.elementId, partId: body.partId,
      documentMicroversion: microversion, mateConnectors: contract.connectors.filter(connector => connector.partRole === body.name)
        .map(connector => ({ featureId: `source.${connector.featureIdSuffix}`, mateConnectorCS: {
          origin: [0, 0, 0], xAxis: [1, 0, 0], yAxis: [0, 1, 0], zAxis: [0, 0, 1] } })) })));
  }
  add(readback.assemblyKey, 'getAssemblyDefinition', { parts, rootAssembly: { documentId: contract.did,
    instances: contract.instances.map(item => ({ id: `instance-${item.id}`, name: item.id, documentId: contract.did,
      elementId: contract.parts[item.part].sourceGroup, partId: `part-${item.part}`, suppressed: false })),
    occurrences: contract.instances.map(item => ({ path: [`instance-${item.id}`], transform: identity })) } });
  return { ledger, readback };
}

test('v3 migration is only proposed and keeps the original ledger prefix and freeze anchor', () => {
  const before = JSON.stringify(liveLedger);
  const contract = fixture();
  const migration = freezeMigration(liveLedger, contract);
  assert.equal(migration.status, 'PROPOSED_NOT_APPLIED');
  assert.deepEqual(migration.originalBinding, liveLedger.binding);
  assert.equal(JSON.stringify(liveLedger), before);
  assert.throws(() => freezeMigration(liveLedger, { ...contract, did: '0'.repeat(24) }), /SAME_OWNED/);
  assert.throws(() => freezeMigration(liveLedger, { ...contract, freezeSha256: liveLedger.binding.packetHash }), /NEW_FROZEN/);
});

test('authentic X44 housing and rear cover are fastened; output shaft is separate', () => {
  const contract = fixture();
  assert.equal(validateBindingContract(contract, liveLedger).counts.instances, 4);
  const discarded = structuredClone(contract);
  discarded.sourceGroups[1].preservation.pop();
  assert.throws(() => validateBindingContract(discarded, liveLedger), /PRESERVATION/);
  const duplicated = structuredClone(contract);
  duplicated.sourceGroups[1].preservation[1].bodyIndex = 1;
  assert.throws(() => validateBindingContract(duplicated, liveLedger), /EVERY_AUTHENTIC_SOLID/);
  const rigidShaft = structuredClone(contract);
  rigidShaft.joints.at(-1).type = 'FASTENED';
  assert.throws(() => validateBindingContract(rigidShaft, liveLedger), /HOUSING_COVER/);
  const rotatingCover = structuredClone(contract);
  rotatingCover.motorBindings[0].shaftInstance = 'rearCover';
  assert.throws(() => validateBindingContract(rotatingCover, liveLedger), /HOUSING_COVER/);
  const falseVendorShaft = structuredClone(contract);
  falseVendorShaft.motorBindings[0].shaftProvenance = 'AUTHENTIC_SEPARATE_OUTPUT';
  assert.throws(() => validateBindingContract(falseVendorShaft, liveLedger), /SHAFT_PROVENANCE/);
  const wrongFrame = structuredClone(contract);
  wrongFrame.connectors.at(-1).framesSI.revision[3] = 0.01;
  assert.throws(() => validateBindingContract(wrongFrame, liveLedger), /FRAME_PARITY/);
  const extraSource = structuredClone(contract);
  extraSource.sourceGroups.push({ id: 'unbudgeted-source', kind: 'generated', partRoles: [] });
  assert.throws(() => validateBindingContract(extraSource, liveLedger), /ONE_GENERATED_SOURCE_GROUP/);
  const generatedMotor = structuredClone(contract);
  generatedMotor.sourceGroups = [{ ...generatedMotor.sourceGroups[1], id: 'custom', kind: 'generated',
    partRoles: ['chassis', 'housing', 'rearCover', 'shaft'] }];
  generatedMotor.parts.housing.sourceGroup = 'custom';
  generatedMotor.parts.rearCover.sourceGroup = 'custom';
  assert.throws(() => validateBindingContract(generatedMotor, liveLedger), /HOUSING_COVER/);
});

test('native evaluation decoder rejects untyped, ambiguous and unsupported values', () => {
  assert.equal(decodeEvaluation(typed({ volume: 100 })).volume, 100);
  assert.throws(() => decodeEvaluation({ volume: 100 }), /TYPED_NATIVE/);
  const duplicate = typed({ volume: 100 });
  duplicate.value.push(duplicate.value[0]);
  assert.throws(() => decodeEvaluation(duplicate), /UNIQUE_NATIVE/);
});

test('explicit split records preserve both original WCP solids across separate import groups', () => {
  const contract = fixture();
  const vendor = contract.sourceGroups.pop();
  for (const role of vendor.partRoles) {
    const id = `split-${role}`;
    contract.parts[role].sourceGroup = id;
    contract.sourceGroups.push({ ...structuredClone(vendor), id, partRoles: [role],
      preservation: vendor.preservation.filter(record => record.partRole === role) });
  }
  assert.equal(validateBindingContract(contract, liveLedger).counts.cotsImportGroups, 2);
  const pending = structuredClone(liveLedger);
  pending.attempts.push({ sequence: pending.attempts.length + 1, status: 'PENDING' });
  assert.throws(() => freezeMigration(pending, contract), /LEDGER_HALTED_OR_PENDING/);
  contract.sourceGroups.at(-1).originals[0].solidCount = 1;
  assert.throws(() => validateBindingContract(contract, liveLedger), /CONSISTENT_ORIGINAL/);
});

test('offline readback fixture validates measured source IDs, both motor bodies and assembly parity', () => {
  const contract = fixture();
  const { ledger, readback } = readbackFixture(contract);
  const result = validateNativeReadback(contract, ledger, readback);
  assert.equal(result.proofScope, 'LEDGER_READBACK_VALIDATION_NOT_FULL_MOTION_PROOF');
  assert.notEqual(result.binding.housing.partId, result.binding.shaft.partId);
  const assembly = ledger.attempts.at(-1).result;
  assembly.rootAssembly.instances[3].partId = result.binding.housing.partId;
  assert.throws(() => validateNativeReadback(contract, ledger, readback), /MEASURED_NATIVE_PARTS/);
});

test('wrong native geometry, connector orientation and regenerated IDs fail closed', () => {
  const contract = fixture();
  const { ledger, readback } = readbackFixture(contract);
  const result = validateNativeReadback(contract, ledger, readback);
  const changedGeometry = structuredClone(contract);
  changedGeometry.parts.shaft.geometry.baseline.volumeMm3 = 200;
  assert.throws(() => validateNativeReadback(changedGeometry, ledger, readback), /GEOMETRY_MISMATCH/);
  const connector = ledger.attempts.at(-1).result.parts.at(-1).mateConnectors[0];
  connector.mateConnectorCS.zAxis = [0, 0, -1];
  assert.throws(() => validateNativeReadback(contract, ledger, readback), /CONNECTOR_FRAME/);
  connector.mateConnectorCS.zAxis = [0, 0, 1];
  result.binding.shaft.id = 'replaced-native-instance';
  assert.throws(() => validateNativeReadback(contract, ledger, { ...readback, baselineBinding: result.binding }), /IDENTITY_CHANGED/);
});