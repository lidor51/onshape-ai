import { requireThat, sha256 } from './ledger.mjs';
import { isCots } from './graph.mjs';

export function concurrency(response) {
  requireThat(/^[a-f0-9]{24}$/.test(response.sourceMicroversion ?? '') && typeof response.serializationVersion === 'string' &&
    Number.isInteger(response.libraryVersion), 'OBSERVED_CONCURRENCY_REQUIRED');
  return { sourceMicroversion: response.sourceMicroversion, serializationVersion: response.serializationVersion,
    libraryVersion: response.libraryVersion, rejectMicroversionSkew: true };
}

export function bindParts(parts, roles, elementId) {
  requireThat(Array.isArray(parts), 'PART_LIST_REQUIRED');
  return Object.fromEntries(roles.map(({ role, name }) => {
    const matches = parts.filter(part => part.name === name && part.elementId === elementId);
    requireThat(matches.length === 1 && matches[0].bodyType === 'solid' && matches[0].partId, `OBSERVED_SOLID_PART_REQUIRED:${role}`);
    return [role, { elementId, partId: matches[0].partId, nativeName: matches[0].name }];
  }));
}

export function bindPreservedParts(parts, group, partSpecs, elementId) {
  requireThat(parts.length === group.partRoles.length && group.preservation?.length === group.partRoles.length,
    'EVERY_IMPORTED_SOLID_MUST_BE_BOUND');
  const bound = bindParts(parts, group.partRoles.map(role => ({ role, name: partSpecs[role].nativeName })), elementId);
  requireThat(new Set(Object.values(bound).map(part => part.partId)).size === group.partRoles.length,
    'DISTINCT_IMPORTED_SOURCE_SOLIDS_REQUIRED');
  for (const [role, part] of Object.entries(bound)) {
    const records = group.preservation.filter(record => record.partRole === role);
    requireThat(records.length === 1, 'PRESERVATION_ROLE_BIJECTION_REQUIRED');
    part.preservation = structuredClone(records[0]);
  }
  return bound;
}

export function batchInstances(graph, parts, documentId) {
  return { transformGroups: graph.instances.map(instance => {
    const source = parts[instance.part];
    requireThat(source?.elementId && source.partId, `UNBOUND_PART:${instance.part}`);
    return { instances: [{ documentId, elementId: source.elementId, partId: source.partId,
      includePartTypes: ['PARTS'], isAssembly: false, isWholePartStudio: false }], transform: instance.transform };
  }) };
}

export function bindInstances(graph, parts, definition, documentId) {
  const root = definition.rootAssembly;
  requireThat(Array.isArray(root?.instances) && Array.isArray(root?.occurrences), 'ASSEMBLY_DEFINITION_REQUIRED');
  requireThat(root.instances.length === graph.instances.length, 'NATIVE_INSTANCE_COUNT');
  const binding = {};
  const used = new Set();
  for (const instance of graph.instances) {
    const source = parts[instance.part];
    const matches = root.instances.filter(native => !used.has(native.id) && native.documentId === documentId &&
      native.elementId === source.elementId && native.partId === source.partId && native.suppressed === false &&
      root.occurrences.some(occurrence => occurrence.path.length === 1 && occurrence.path[0] === native.id &&
        occurrence.transform.length === 16 && occurrence.transform.every((value, index) => Math.abs(value - instance.transform[index]) < 1e-7)));
    requireThat(matches.length === 1, `AMBIGUOUS_INSTANCE_BINDING:${instance.id}`);
    used.add(matches[0].id);
    binding[instance.id] = { id: matches[0].id, nativeName: matches[0].name, partId: source.partId, elementId: source.elementId };
  }
  return binding;
}

export function connectorQuery(observed, instanceId) {
  requireThat(observed?.featureId && ['assembly', 'partStudio'].includes(observed.location), 'OBSERVED_CONNECTOR_REQUIRED');
  return { btType: observed.location === 'assembly' ? 'BTMFeatureQueryWithOccurrence-157' : 'BTMPartStudioMateConnectorQuery-1324',
    path: observed.location === 'assembly' ? [] : [instanceId], featureId: observed.featureId, queryData: observed.queryData ?? '' };
}

export function mateFeature(joint, instances, connectors, snapshot, limitParameters = []) {
  requireThat(joint.type === 'FASTENED' || joint.type === 'REVOLUTE', 'NATIVE_MATE_REQUIRED');
  requireThat(joint.limitsDeg === null || limitParameters.length > 0, 'VERIFIED_LIMIT_PARAMETERS_REQUIRED');
  return { btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature: {
    btType: 'BTMMate-64', featureType: 'mate', name: joint.id, namespace: '', suppressed: false,
    returnAfterSubfeatures: false, subFeatures: [], parameters: [
      { btType: 'BTMParameterEnum-145', enumName: 'Mate type', value: joint.type, parameterId: 'mateType' },
      { btType: 'BTMParameterQueryWithOccurrenceList-67', parameterId: 'mateConnectorsQuery', queries:
        ['parent', 'child'].map(side => connectorQuery(connectors[side], instances[joint[side]].id)) },
      ...structuredClone(limitParameters),
    ],
  } };
}

export function relationFeature(relation, observedRecipe, mateIds, snapshot) {
  requireThat(observedRecipe?.nativeType === relation.type && observedRecipe.outputPerInput === relation.outputPerInput &&
    observedRecipe.carrier === (relation.carrier ?? null) && observedRecipe.feature.btType === 'BTMMateRelation-1412',
    `VERIFIED_RELATION_RECIPE_REQUIRED:${relation.id}`);
  const feature = structuredClone(observedRecipe.feature);
  feature.name = relation.id;
  delete feature.featureId;
  delete feature.nodeId;
  requireThat(observedRecipe.matePairParameterId === 'matesQuery', 'OBSERVED_RELATION_PAIR_PARAMETER_REQUIRED');
  const parameter = feature.parameters.find(item => item.parameterId === 'matesQuery');
  requireThat(parameter?.btType === 'BTMParameterQueryWithOccurrenceList-67' &&
    [relation.driverMate, relation.drivenMate].every(role => mateIds[role]), 'RELATION_MATE_BINDING_REQUIRED');
  parameter.queries = [relation.driverMate, relation.drivenMate].map(role => ({
    btType: 'BTMFeatureQueryWithOccurrence-157', path: [], featureId: mateIds[role], queryData: '' }));
  return { btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature };
}

export function nativeGroupFeature(group, instances, snapshot, observedSpecs) {
  const observed = observedSpecs.featureSpecs?.find(spec => spec.featureType === 'mateGroup')?.parameters
    ?.find(parameter => parameter.parameterId === 'occurrencesQuery')?.defaultValue;
  requireThat(observed?.btType === 'BTMParameterQueryWithOccurrenceList-67' && group.members.length > 1 &&
    new Set(group.members).size === group.members.length && group.members.every(role => instances[role]?.id),
    'OBSERVED_GROUP_SPEC_AND_INSTANCE_BINDING_REQUIRED');
  return { btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature: {
    btType: 'BTMMateGroup-65', featureType: 'mateGroup', namespace: '', name: group.id, suppressed: false,
    parameters: [{ btType: observed.btType, parameterId: 'occurrencesQuery', queries: group.members.map(role => ({
      btType: 'BTMIndividualOccurrenceQuery-626', path: [instances[role].id] })) }],
  } };
}

export function sourceFeature(namespace, controls, snapshot, existing) {
  const parameters = [
    ...['mouthWidth', 'receiverHeight'].map(parameterId => ({ btType: 'BTMParameterQuantity-147', parameterId,
      expression: `${controls[parameterId]} mm` })),
    ...['includeCotsEnvelopes', 'includeCoralReference'].map(parameterId => ({ btType: 'BTMParameterBoolean-144', parameterId, value: false })),
  ];
  requireThat(namespace && ['mouthWidth', 'receiverHeight'].every(name => Number.isFinite(controls[name])), 'SOURCE_CONTROLS_REQUIRED');
  if (existing) requireThat(existing.featureType === 'conceptAShared' && existing.namespace === namespace && existing.featureId,
    'SAME_SOURCE_FEATURE_REQUIRED');
  return { btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature: existing ?
    { ...structuredClone(existing), parameters } : { btType: 'BTMFeature-134', featureType: 'conceptAShared',
      name: 'Concept A editable source', namespace, suppressed: false, parameters } };
}

export function customRoles(packet) {
  return [...new Set(packet.contract.instances.filter(instance => instance.id !== 'held_coral' &&
    !isCots(packet.contract.parts[instance.part])).map(instance => instance.part))].map(role => ({ role, name: role }));
}

export function assertHealthy(response, featureId = response.feature?.featureId) {
  const state = response.featureState ?? response.featureStates?.[featureId];
  requireThat(featureId && state?.featureStatus === 'OK' && response.microversionSkew !== true, 'NATIVE_REGENERATION_UNVERIFIED');
  return featureId;
}

export function multipartImport(bytes, filename, unit, schema) {
  requireThat(Buffer.isBuffer(bytes) && /^[A-Za-z0-9_.-]+\.(?:step|stp|x_t|x_b)$/i.test(filename), 'APPROVED_COTS_BINARY_REQUIRED');
  requireThat(['mm', 'm', 'inch'].includes(unit), 'COTS_IMPORT_UNIT_REQUIRED');
  const fields = { file: bytes, formatName: '', storeInDocument: true, translate: true, flattenAssemblies: true,
    allowFaultyParts: false, createComposite: false, importWithinDocument: true, splitAssembliesIntoMultipleDocuments: false,
    onePartPerDoc: false, notifyUser: false, unit };
  schema.check({ $ref: '#/components/schemas/BTBTranslationRequestParams' }, fields);
  const boundary = `onshapeab${sha256(bytes).slice(0, 32)}`;
  requireThat(!bytes.includes(Buffer.from(boundary)), 'MULTIPART_BOUNDARY_COLLISION');
  const chunks = [];
  for (const [name, value] of Object.entries(fields)) {
    const file = name === 'file';
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"${file ? `; filename="${filename}"` : ''}\r\n` +
      (file ? 'Content-Type: application/octet-stream\r\n' : '') + '\r\n'));
    chunks.push(file ? value : Buffer.from(String(value)), Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}`, fields };
}