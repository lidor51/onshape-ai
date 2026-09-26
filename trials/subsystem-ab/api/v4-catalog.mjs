import { requireThat, sha256 } from './ledger.mjs';
import { fastenedGroups, rigid } from './graph.mjs';
import { multipartImport } from './native.mjs';
import { loadSchema } from './schema.mjs';

const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const unique = values => new Set(values).size === values.length;
const variants = ['baseline', 'revision', 'receiverControlProbe'];
const geometry = body => Number.isFinite(body?.volumeMm3) && body.volumeMm3 > 0 &&
  Array.isArray(body.boundsMm) && body.boundsMm.length === 6 && body.boundsMm.every(Number.isFinite) &&
  [0, 1, 2].every(axis => body.boundsMm[axis + 3] > body.boundsMm[axis]);

export function analyzeCatalog(catalog) {
  requireThat(catalog?.schema === 'subsystem-ab-api-v4-catalog/1' && catalog.packetVersion === 'v4' &&
    hash(catalog.freezeSha256), 'V4_CATALOG_IDENTITY_REQUIRED');
  const { sourceGroups, instances, joints, relations, componentCatalog, motorPresentations = [] } = catalog;
  requireThat([sourceGroups, instances, joints, relations, componentCatalog].every(Array.isArray) &&
    instances.length >= 2 && sourceGroups.length > 0, 'V4_CATALOG_ARRAYS_REQUIRED');
  requireThat(unique(sourceGroups.map(group => group.id)) && unique(instances.map(instance => instance.id)) &&
    unique(joints.map(joint => joint.id)) && unique(relations.map(relation => relation.id)) &&
    unique(componentCatalog.map(component => component.id)), 'V4_DUPLICATE_CATALOG_ID');
  const roles = new Map();
  for (const group of sourceGroups) {
    requireThat(typeof group.id === 'string' && group.id && ['ORIGINAL_VENDOR', 'GENERATED_CUSTOM'].includes(group.kind) &&
      Array.isArray(group.bodies) && group.bodies.length > 0, 'V4_SOURCE_GROUP_REQUIRED');
    if (group.kind === 'ORIGINAL_VENDOR') requireThat(group.importMode === 'ORIGINAL_BYTES' &&
      hash(group.originalSha256) && group.importSha256 === group.originalSha256 &&
      ['mm', 'm', 'inch'].includes(group.units) && Number.isInteger(group.solidCount) &&
      group.solidCount === group.bodies.length && !group.bundle && !group.preservation &&
      !group.sourceToBundleRowMajorMm, 'V4_DIRECT_ORIGINAL_ALL_SOLIDS_REQUIRED');
    requireThat(unique(group.bodies.map(body => body.index)) && group.bodies.every((_, index) =>
      group.bodies.some(body => body.index === index + 1)), 'V4_COMPLETE_BODY_INDICES_REQUIRED');
    for (const body of group.bodies) {
      requireThat(typeof body.role === 'string' && body.role && !roles.has(body.role) && geometry(body) &&
        !body.sourceToBundleRowMajorMm, 'V4_UNIQUE_SOURCE_BODY_GEOMETRY_REQUIRED');
      roles.set(body.role, { ...body, groupId: group.id });
    }
    if (group.model === 'KRAKEN_X44') requireThat(group.kind === 'ORIGINAL_VENDOR' && group.bodies.length === 2 &&
      ['VENDOR_BODY', 'REAR_COVER'].every(kind => group.bodies.some(body => body.function === kind)),
    'V4_X44_BODY_AND_REAR_COVER_REQUIRED');
  }
  const originalGroups = sourceGroups.filter(group => group.kind === 'ORIGINAL_VENDOR');
  requireThat(unique(originalGroups.map(group => group.originalSha256)), 'V4_REUSE_ONE_GROUP_PER_ORIGINAL_HASH');
  for (const instance of instances) {
    requireThat(typeof instance.id === 'string' && instance.id && roles.has(instance.part), 'V4_INSTANCE_PART_MAPPING_REQUIRED');
    for (const variant of variants) {
      const transform = instance.transformsSI?.[variant];
      requireThat(Array.isArray(transform) && transform.length === 16, 'V4_VARIANT_TRANSFORM_REQUIRED');
      rigid(Array.from({ length: 4 }, (_, row) => transform.slice(row * 4, row * 4 + 4)));
    }
  }
  const byInstance = new Map(instances.map(instance => [instance.id, instance]));
  const counted = [];
  const componentOccurrences = new Map();
  for (const component of componentCatalog) {
    const group = sourceGroups.find(source => source.id === component.sourceGroup);
    requireThat(group && Number.isInteger(component.quantity) && component.quantity > 0 &&
      component.occurrences?.length === component.quantity, 'V4_COUNTED_COMPONENT_REQUIRED');
    for (const occurrence of component.occurrences) {
      requireThat(typeof occurrence.id === 'string' && !componentOccurrences.has(occurrence.id) &&
        occurrence.bodyInstances && Object.keys(occurrence.bodyInstances).length === group.bodies.length,
      'V4_COMPONENT_BODY_COVERAGE_REQUIRED');
      for (const body of group.bodies) {
        const instanceId = occurrence.bodyInstances[body.role];
        requireThat(byInstance.get(instanceId)?.part === body.role, 'V4_COMPONENT_PART_MAPPING_REQUIRED');
        counted.push(instanceId);
      }
      componentOccurrences.set(occurrence.id, { group, occurrence });
    }
  }
  requireThat(counted.length === instances.length && unique(counted), 'V4_EVERY_INSTANCE_COUNTED_ONCE');
  requireThat(byInstance.has(catalog.rootInstance) && joints.length === instances.length - 1 &&
    unique(joints.map(joint => joint.child)) && !joints.some(joint => joint.child === catalog.rootInstance) &&
    joints.every(joint => byInstance.has(joint.parent) && byInstance.has(joint.child) &&
      ['FASTENED', 'REVOLUTE'].includes(joint.type)), 'V4_NATIVE_CONNECTION_TREE_REQUIRED');
  const reached = new Set([catalog.rootInstance]);
  for (let pass = 0; pass < instances.length; pass++) for (const joint of joints)
    if (reached.has(joint.parent)) reached.add(joint.child);
  requireThat(reached.size === instances.length, 'V4_DISCONNECTED_GRAPH');
  const groups = fastenedGroups({ instances, joints });
  for (const relation of relations) requireThat(Number.isFinite(relation.outputPerInput) && relation.outputPerInput !== 0 &&
    ['GEAR_RELATION', 'BELT_RELATION'].includes(relation.type) && relation.driverMate !== relation.drivenMate &&
    [relation.driverMate, relation.drivenMate].every(mate => joints.some(joint => joint.id === mate && joint.type === 'REVOLUTE')) &&
    (relation.carrier == null || byInstance.has(relation.carrier)), 'V4_RELATION_MAPPING_REQUIRED');
  const x44Components = [...componentOccurrences].filter(([, item]) => item.group.model === 'KRAKEN_X44');
  requireThat(motorPresentations.length === x44Components.length && unique(motorPresentations.map(motor => motor.componentId)),
    'V4_DECLARE_EACH_X44_PRESENTATION');
  for (const [componentId, { group, occurrence }] of x44Components) {
    const motor = motorPresentations.find(item => item.componentId === componentId);
    const bodyId = occurrence.bodyInstances[group.bodies.find(body => body.function === 'VENDOR_BODY').role];
    const coverId = occurrence.bodyInstances[group.bodies.find(body => body.function === 'REAR_COVER').role];
    requireThat(motor?.vendorPresentation === 'STATIC_NONSEPARABLE_VENDOR_GEOMETRY' &&
      groups.some(item => item.members.includes(bodyId) && item.members.includes(coverId)), 'V4_X44_COVER_MUST_FOLLOW_BODY');
    if (motor.outputReference) {
      const reference = motor.outputReference;
      const output = byInstance.get(reference.instanceId);
      requireThat(reference.kind === 'OUTPUT_GEAR_DOF_APPROXIMATION' && reference.claimsVendorRotor === false &&
        reference.instanceId !== bodyId && reference.instanceId !== coverId &&
        roles.get(output?.part)?.function === 'OUTPUT_GEAR' && joints.some(joint => joint.id === reference.revoluteId &&
          joint.type === 'REVOLUTE' && [joint.parent, joint.child].includes(reference.instanceId)),
      'V4_OUTPUT_GEAR_REFERENCE_NOT_INVENTED_MOTOR_SHAFT');
    }
  }
  return { freezeSha256: catalog.freezeSha256, instances: instances.length, logicalJoints: joints.length,
    revolutes: joints.filter(joint => joint.type === 'REVOLUTE').length, relations: relations.length,
    movingCarrierRelations: relations.filter(relation => relation.carrier != null).length,
    rigidGroups: groups.length, originalImportGroups: originalGroups.length,
    generatedSourceGroups: sourceGroups.length - originalGroups.length,
    sourceSolids: sourceGroups.reduce((total, group) => total + group.bodies.length, 0),
    catalogUnits: componentOccurrences.size, motorDofApproximations: motorPresentations.filter(motor => motor.outputReference).length,
    importBytesVerified: false, destinationGeometry: 'UNVERIFIED', localPhysicalAcceptance: 'SEPARATE_PARENT_GATE',
    nativeCarrierBehavior: 'UNVERIFIED_LOCAL_RELATION_PLANNING_ALLOWED' };
}

export function originalImport(group, bytes, schema = loadSchema()) {
  requireThat(group?.kind === 'ORIGINAL_VENDOR' && group.importMode === 'ORIGINAL_BYTES' && Buffer.isBuffer(bytes) &&
    hash(group.originalSha256) && group.importSha256 === group.originalSha256 && sha256(bytes) === group.originalSha256,
  'V4_ORIGINAL_BYTES_HASH_MISMATCH');
  return multipartImport(bytes, group.filename, group.units, schema);
}

export function bindOriginalReadback(group, parts, measured, receipt) {
  requireThat(receipt?.inputSha256 === group.originalSha256 && /^[a-f0-9]{24}$/.test(receipt.sourceMicroversion ?? '') &&
    measured?.sourceMicroversion === receipt.sourceMicroversion && measured.units === 'mm' &&
    parts?.length === group.bodies.length && measured.bodies?.length === group.bodies.length &&
    receipt.bodyMap?.length === group.bodies.length && unique(parts.map(part => part.partId)) &&
    unique(measured.bodies.map(body => body.partId)) && unique(receipt.bodyMap.map(body => body.partId)) &&
    unique(receipt.bodyMap.map(body => body.index)), 'V4_DESTINATION_COMPLETE_SOURCE_RECEIPT_REQUIRED');
  return Object.fromEntries(group.bodies.map(body => {
    const mapping = receipt.bodyMap.find(item => item.index === body.index);
    const part = parts.find(item => item.partId === mapping?.partId);
    const actual = measured.bodies.find(item => item.partId === mapping?.partId);
    const matchesGeometry = candidate => geometry(candidate) &&
      Math.abs(candidate.volumeMm3 - body.volumeMm3) <= body.volumeMm3 * 1e-5 &&
      candidate.boundsMm.every((value, index) => Math.abs(value - body.boundsMm[index]) <= 0.02);
    requireThat(measured.bodies.filter(matchesGeometry).length === 1, 'V4_AMBIGUOUS_OR_MISSING_BODY_GEOMETRY');
    requireThat(part?.bodyType === 'solid' && part.elementId === receipt.elementId &&
      part.microversionId === receipt.sourceMicroversion && matchesGeometry(actual),
    'V4_DESTINATION_SOURCE_GEOMETRY_MISMATCH');
    return [body.role, { elementId: part.elementId, partId: part.partId, sourceMicroversion: receipt.sourceMicroversion,
      originalSha256: group.originalSha256, originalBodyIndex: body.index }];
  }));
}