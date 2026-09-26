import { fastenedGroups, multiply, rigid, errorBetween } from './graph.mjs';
import { planV3Budget } from './budget.mjs';
import { requireThat, sha256 } from './ledger.mjs';

const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const matrix = values => {
  requireThat(Array.isArray(values) && values.length === 16, 'FRAME_16_REQUIRED');
  return rigid(Array.from({ length: 4 }, (_, row) => values.slice(row * 4, row * 4 + 4)));
};
const close = (actual, expected, tolerance) => Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
const success = (ledger, key, operation) => {
  const entry = ledger.attempts.find(item => item.key === key && item.operation === operation && item.status === 'SUCCESS');
  requireThat(entry?.result, 'SUCCESSFUL_NATIVE_READBACK_REQUIRED');
  return entry.result;
};

export function freezeMigration(ledger, contract) {
  const owned = success(ledger, 'create-document', 'createDocument');
  requireThat(!ledger.halt && !ledger.attempts.some(entry => entry.status === 'PENDING'), 'LEDGER_HALTED_OR_PENDING');
  requireThat(contract.origin === 'https://cad.onshape.com' && contract.origin === ledger.binding?.origin &&
    contract.did === owned.id && contract.wid === owned.defaultWorkspace.id, 'SAME_OWNED_WORKSPACE_REQUIRED');
  requireThat(hash(contract.freezeSha256) && contract.freezeSha256 !== ledger.binding.packetHash &&
    /^(?:packet-)?v3$/.test(contract.packetVersion), 'NEW_FROZEN_V3_REQUIRED');
  return { schema: 'subsystem-ab-api-freeze-migration/1', status: 'PROPOSED_NOT_APPLIED',
    originalBinding: structuredClone(ledger.binding), targetFreezeSha256: contract.freezeSha256,
    targetPacketVersion: contract.packetVersion, did: contract.did, wid: contract.wid,
    throughSequence: ledger.attempts.length, attemptPrefixSha256: sha256(JSON.stringify(ledger.attempts)),
    requirement: 'Append a parent-approved migration checkpoint later; never replace binding, pilot receipts or the attempt prefix.' };
}

export function validateBindingContract(contract, ledger) {
  requireThat(contract?.schema === 'subsystem-ab-api-v3-binding/1' && hash(contract.sourceSha256) &&
    hash(contract.evaluatorSha256), 'V3_SOURCE_AND_EVALUATOR_HASHES_REQUIRED');
  const migration = freezeMigration(ledger, contract);
  requireThat(Array.isArray(contract.instances) && contract.instances.length >= 2 &&
    new Set(contract.instances.map(item => item.id)).size === contract.instances.length, 'V3_INSTANCE_SET_REQUIRED');
  requireThat(Array.isArray(contract.joints) && contract.joints.length === contract.instances.length - 1 &&
    new Set(contract.joints.map(item => item.id)).size === contract.joints.length, 'V3_TREE_REQUIRED');
  const instances = new Map(contract.instances.map(item => [item.id, item]));
  const children = new Set();
  for (const joint of contract.joints) {
    requireThat(instances.has(joint.parent) && instances.has(joint.child) && !children.has(joint.child) &&
      joint.child !== 'chassis' && ['FASTENED', 'REVOLUTE'].includes(joint.type), 'INVALID_V3_JOINT');
    children.add(joint.child);
  }
  const reached = new Set(['chassis']);
  for (let pass = 0; pass < instances.size; pass++)
    for (const joint of contract.joints) if (reached.has(joint.parent)) reached.add(joint.child);
  requireThat(reached.size === instances.size, 'DISCONNECTED_V3_TREE');
  requireThat(Array.isArray(contract.sourceGroups) && new Set(contract.sourceGroups.map(group => group.id)).size ===
    contract.sourceGroups.length && Array.isArray(contract.connectors), 'V3_SOURCE_GROUPS_REQUIRED');
  requireThat(contract.sourceGroups.filter(group => group.kind === 'generated').length === 1,
    'BUDGET_REQUIRES_ONE_GENERATED_SOURCE_GROUP');
  const assigned = new Set();
  const preserved = new Set();
  const expectedBodies = new Set();
  const originalCounts = new Map();
  for (const group of contract.sourceGroups) {
    requireThat(['generated', 'authentic'].includes(group.kind) && group.partRoles?.length &&
      new Set(group.partRoles).size === group.partRoles.length, 'INVALID_SOURCE_GROUP');
    for (const role of group.partRoles) {
      requireThat(contract.parts[role]?.sourceGroup === group.id && !assigned.has(role), 'SOURCE_ROLE_BIJECTION_REQUIRED');
      assigned.add(role);
    }
    if (group.kind !== 'authentic') continue;
    requireThat(hash(group.importSha256) && group.originals?.length && group.preservation?.length === group.partRoles.length,
      'AUTHENTIC_PRESERVATION_REQUIRED');
    for (const original of group.originals) {
      requireThat(hash(original.sha256) && Number.isInteger(original.solidCount) && original.solidCount > 0,
        'ORIGINAL_SOLID_COUNT_REQUIRED');
      requireThat(!originalCounts.has(original.sha256) || originalCounts.get(original.sha256) === original.solidCount,
        'CONSISTENT_ORIGINAL_SOLID_COUNT_REQUIRED');
      if (!originalCounts.has(original.sha256)) {
        originalCounts.set(original.sha256, original.solidCount);
        for (let index = 1; index <= original.solidCount; index++) expectedBodies.add(`${original.sha256}:${index}`);
      }
    }
    const roles = new Set();
    for (const record of group.preservation) {
      const source = `${record.originalSha256}:${record.bodyIndex}`;
      requireThat(expectedBodies.delete(source) && !preserved.has(source) && group.partRoles.includes(record.partRole) &&
        !roles.has(record.partRole), 'EVERY_AUTHENTIC_SOLID_EXACTLY_ONCE');
      matrix(record.sourceToBundleRowMajorMm);
      preserved.add(source);
      roles.add(record.partRole);
    }
    requireThat(roles.size === group.partRoles.length, 'PRESERVATION_ROLE_BIJECTION_REQUIRED');
  }
  requireThat(expectedBodies.size === 0, 'NO_DISCARDED_AUTHENTIC_SOLIDS');
  requireThat(assigned.size === Object.keys(contract.parts).length && [...instances.values()].every(item => assigned.has(item.part)) &&
    [...assigned].every(role => [...instances.values()].some(item => item.part === role)), 'UNBOUND_OR_UNUSED_SOURCE_ROLE');
  const motors = contract.motorBindings;
  requireThat(Array.isArray(motors) && motors.length > 0, 'X44_HOUSING_COVER_OUTPUT_BINDING_REQUIRED');
  for (const motor of motors) {
    const housing = instances.get(motor.housingInstance);
    const rearCover = instances.get(motor.rearCoverInstance);
    const shaft = instances.get(motor.shaftInstance);
    const joint = contract.joints.find(item => item.id === motor.revoluteMate);
    const coverJoint = contract.joints.find(item => item.id === motor.rearCoverMate);
    const housingRecord = contract.sourceGroups.flatMap(group => group.preservation ?? []).find(item => item.partRole === housing?.part);
    const coverRecord = contract.sourceGroups.flatMap(group => group.preservation ?? []).find(item => item.partRole === rearCover?.part);
    const shaftRecord = contract.sourceGroups.flatMap(group => group.preservation ?? []).find(item => item.partRole === shaft?.part);
    requireThat(housing && rearCover && shaft && new Set([housing.part, rearCover.part, shaft.part]).size === 3 &&
      joint?.type === 'REVOLUTE' && joint.parent === housing.id && joint.child === shaft.id &&
      coverJoint?.type === 'FASTENED' && coverJoint.parent === housing.id && coverJoint.child === rearCover.id &&
      [housing.part, rearCover.part].every(role => contract.sourceGroups.some(group =>
        group.kind === 'authentic' && group.partRoles.includes(role))) && housingRecord && coverRecord &&
      housingRecord.originalSha256 === coverRecord.originalSha256 && housingRecord.bodyIndex !== coverRecord.bodyIndex &&
      contract.sourceGroups.flatMap(group => group.originals ?? []).some(original =>
        original.sha256 === housingRecord.originalSha256 && original.solidCount === 2), 'X44_HOUSING_COVER_AND_SEPARATE_SHAFT_REQUIRED');
    const shaftGroup = contract.sourceGroups.find(group => group.partRoles.includes(shaft.part));
    requireThat(shaftGroup.kind === 'generated' ? motor.shaftProvenance === 'GENERATED_SEPARATE_OUTPUT' :
      motor.shaftProvenance === 'AUTHENTIC_SEPARATE_OUTPUT' && shaftRecord &&
      shaftRecord.originalSha256 !== housingRecord.originalSha256, 'SEPARATE_OUTPUT_SHAFT_PROVENANCE_REQUIRED');
  }
  requireThat(new Set(contract.connectors.map(connector => connector.key)).size === contract.connectors.length &&
    contract.connectors.length === contract.joints.length * 2 + 1, 'EXACT_SOURCE_CONNECTOR_COVERAGE_REQUIRED');
  const variants = ['baseline', 'revision', 'receiverControlProbe'];
  for (const connector of contract.connectors) {
    requireThat(assigned.has(connector.partRole) && /^[A-Za-z][A-Za-z0-9_]*$/.test(connector.featureIdSuffix),
      'STABLE_OWNED_SOURCE_DATUM_REQUIRED');
    for (const variant of variants) matrix(connector.framesSI?.[variant]);
  }
  for (const variant of variants) {
    for (const instance of contract.instances) matrix(instance.transformsSI?.[variant]);
    for (const joint of contract.joints) {
      const world = ['parent', 'child'].map(side => {
        const instance = instances.get(joint[side]);
        const datum = contract.connectors.find(connector => connector.key === `${joint.id}:${side}`);
        requireThat(datum?.partRole === instance.part, 'CONNECTOR_OWNER_ROLE_REQUIRED');
        return multiply(matrix(instance.transformsSI[variant]), matrix(datum.framesSI[variant]));
      });
      requireThat(errorBetween(...world) < 1e-7, 'NATIVE_RELATIVE_MATE_FRAME_PARITY');
    }
  }
  const ground = contract.connectors.find(connector => connector.key === 'ground:chassis');
  requireThat(ground?.partRole === instances.get('chassis')?.part, 'CHASSIS_OWNED_DATUM_REQUIRED');
  for (const role of assigned) {
    const part = contract.parts[role];
    requireThat(typeof part.nativeName === 'string' && part.nativeName.length > 0, 'NATIVE_SOURCE_NAME_REQUIRED');
    for (const variant of variants) {
      const geometry = part.geometry[variant];
      requireThat(Number.isFinite(geometry?.volumeMm3) && geometry.volumeMm3 > 0 &&
        geometry.boundsMm?.length === 6 && geometry.boundsMm.every(Number.isFinite), 'EXPECTED_SOURCE_GEOMETRY_REQUIRED');
    }
  }
  requireThat(Array.isArray(contract.relations) && Array.isArray(contract.motionScenarios) && contract.motionScenarios.length > 0,
    'FROZEN_RELATIONS_AND_MOTION_SCENARIOS_REQUIRED');
  for (const relation of contract.relations) requireThat(Number.isFinite(relation.outputPerInput) && relation.outputPerInput !== 0 &&
    ['GEAR_RELATION', 'BELT_RELATION'].includes(relation.type) && [relation.driverMate, relation.drivenMate].every(id =>
      contract.joints.some(joint => joint.id === id && joint.type === 'REVOLUTE')) &&
    (!relation.carrier || instances.has(relation.carrier)), 'FROZEN_RELATION_GRAPH_REQUIRED');
  const groups = fastenedGroups(contract);
  const counts = { instances: instances.size, revolutes: contract.joints.filter(joint => joint.type === 'REVOLUTE').length,
    relations: contract.relations.length, cotsImportGroups: contract.sourceGroups.filter(group => group.kind === 'authentic').length,
    rigidGroups: groups.length, motionScenarios: contract.motionScenarios.length };
  return { migration, groups, counts, budget: planV3Budget(counts, ledger.attempts.length,
    { fastenedMode: contract.nativeGroupsAuthorized === true ? 'nativeGroups' : 'individual',
      pilotReserve: Math.max(0, 10 - ledger.attempts.filter(entry => entry.phase === 'nativePilotRepair').length) }) };
}

export function decodeEvaluation(value) {
  requireThat(value && typeof value.btType === 'string', 'TYPED_NATIVE_EVALUATION_REQUIRED');
  if (value.btType === 'BTFSValueMap-2062') {
    requireThat(Array.isArray(value.value), 'NATIVE_MAP_REQUIRED');
    const result = Object.create(null);
    for (const entry of value.value) {
      const key = decodeEvaluation(entry.key);
      requireThat(typeof key === 'string' && !Object.hasOwn(result, key) && !['__proto__', 'constructor', 'prototype'].includes(key),
        'UNIQUE_NATIVE_MAP_KEYS_REQUIRED');
      result[key] = decodeEvaluation(entry.value);
    }
    return result;
  }
  if (value.btType === 'BTFSValueArray-1499') {
    requireThat(Array.isArray(value.value), 'NATIVE_ARRAY_REQUIRED');
    return value.value.map(decodeEvaluation);
  }
  const types = { 'BTFSValueString-1422': 'string', 'BTFSValueNumber-772': 'number', 'BTFSValueBoolean-1195': 'boolean' };
  requireThat(types[value.btType] && typeof value.value === types[value.btType] &&
    (types[value.btType] !== 'number' || Number.isFinite(value.value)), 'SUPPORTED_NATIVE_VALUE_REQUIRED');
  return value.value;
}

export function validateNativeReadback(contract, ledger, readback) {
  const planned = validateBindingContract(contract, ledger);
  requireThat(['baseline', 'revision', 'receiverControlProbe'].includes(readback.variant), 'READBACK_VARIANT_REQUIRED');
  const sourceBinding = {};
  for (const group of contract.sourceGroups) {
    const keys = readback.sourceGroups[group.id];
    requireThat(keys, 'ALL_NATIVE_SOURCE_READBACKS_REQUIRED');
    const parts = success(ledger, keys.partsKey, 'getPartsWMVE');
    const evaluation = success(ledger, keys.geometryKey, 'evalFeatureScript');
    requireThat(!evaluation.error && !evaluation.errorMessage && evaluation.microversionSkew !== true, 'NATIVE_EVALUATION_FAILED');
    const receipt = ledger.checkpoints?.[`v3-source-readback:${keys.geometryKey}`];
    requireThat(receipt?.evaluatorSha256 === contract.evaluatorSha256 && receipt.partsKey === keys.partsKey &&
      receipt.documentId === contract.did && /^[a-f0-9]{24}$/.test(evaluation.sourceMicroversion ?? '') &&
      receipt.sourceMicroversion === evaluation.sourceMicroversion, 'FROZEN_EVALUATOR_RECEIPT_REQUIRED');
    const geometry = decodeEvaluation(evaluation.result);
    requireThat(geometry.schema === 'subsystem-ab-api-source-geometry/1' && geometry.units === 'mm' &&
      geometry.variant === readback.variant && geometry.bodies?.length === group.partRoles.length && parts.length === group.partRoles.length,
      'EXACT_NATIVE_SOURCE_GEOMETRY_REQUIRED');
    const used = new Set();
    for (const role of group.partRoles) {
      const expected = contract.parts[role];
      const matches = parts.filter(part => part.name === expected.nativeName && part.bodyType === 'solid' &&
        part.elementId === receipt.elementId);
      requireThat(matches.length === 1 && !used.has(matches[0].partId), 'DISTINCT_ACTUAL_SOURCE_PART_IDS_REQUIRED');
      const actual = matches[0];
      used.add(actual.partId);
      const measured = geometry.bodies.filter(body => body.partId === actual.partId);
      requireThat(measured.length === 1, 'MEASURE_ACTUAL_PART_ID_REQUIRED');
      const expectedGeometry = expected.geometry[readback.variant];
      requireThat(close(measured[0].volumeMm3, expectedGeometry.volumeMm3, expectedGeometry.volumeMm3 * 1e-5) &&
        measured[0].boundsMm?.length === 6 && measured[0].boundsMm.every((coordinate, index) =>
          close(coordinate, expectedGeometry.boundsMm[index], 0.02)), 'ACTUAL_SOURCE_GEOMETRY_MISMATCH');
      sourceBinding[role] = { partId: actual.partId, elementId: actual.elementId,
        documentMicroversion: evaluation.sourceMicroversion, nativeName: actual.name };
    }
  }
  const assembly = success(ledger, readback.assemblyKey, 'getAssemblyDefinition');
  const root = assembly.rootAssembly;
  requireThat(root?.documentId === contract.did && root.instances?.length === contract.instances.length &&
    root.occurrences?.length === contract.instances.length, 'SAME_OWNED_ASSEMBLY_INSTANCE_SET_REQUIRED');
  const binding = {};
  const used = new Set();
  for (const instance of contract.instances) {
    const source = sourceBinding[instance.part];
    const candidates = root.instances.filter(item => !used.has(item.id) && item.documentId === contract.did &&
      item.elementId === source.elementId && item.partId === source.partId && item.suppressed === false &&
      root.occurrences.some(occurrence => occurrence.path?.length === 1 && occurrence.path[0] === item.id &&
        occurrence.transform?.length === 16 && occurrence.transform.every((coordinate, index) =>
          close(coordinate, instance.transformsSI[readback.variant][index], 1e-7))));
    requireThat(candidates.length === 1, 'ASSEMBLY_MUST_USE_MEASURED_NATIVE_PARTS');
    const actual = candidates[0];
    used.add(actual.id);
    const sourceParts = assembly.parts?.filter(part => part.documentId === contract.did && part.elementId === source.elementId &&
      part.partId === source.partId && part.documentMicroversion === source.documentMicroversion);
    requireThat(sourceParts?.length === 1, 'ASSEMBLY_SOURCE_MICROVERSION_REQUIRED');
    const connectors = {};
    for (const expected of contract.connectors.filter(connector => connector.partRole === instance.part)) {
      const observed = sourceParts[0].mateConnectors?.filter(connector => connector.featureId.endsWith(`.${expected.featureIdSuffix}`));
      requireThat(observed?.length === 1, 'ACTUAL_OWNED_CONNECTOR_REQUIRED');
      const frame = matrix(expected.framesSI[readback.variant]);
      const coord = observed[0].mateConnectorCS;
      requireThat(coord && ['xAxis', 'yAxis', 'zAxis', 'origin'].every((key, column) => coord[key]?.length === 3 &&
        coord[key].every((coordinate, row) => close(coordinate, frame[row][column], 1e-8))), 'NATIVE_CONNECTOR_FRAME_MISMATCH');
      connectors[expected.key] = observed[0].featureId;
    }
    binding[instance.id] = { ...source, id: actual.id, nativeName: actual.name, connectors };
    if (readback.baselineBinding) {
      const before = readback.baselineBinding[instance.id];
      requireThat(before && ['id', 'elementId', 'partId'].every(key => before[key] === binding[instance.id][key]) &&
        JSON.stringify(before.connectors) === JSON.stringify(connectors), 'REVISION_NATIVE_IDENTITY_CHANGED');
    }
  }
  return { status: 'SOURCE_GEOMETRY_AND_ASSEMBLY_PARITY_PASS', proofScope: 'LEDGER_READBACK_VALIDATION_NOT_FULL_MOTION_PROOF',
    variant: readback.variant, binding, counts: planned.counts };
}