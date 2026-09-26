import { requireThat } from './ledger.mjs';
import { assertHealthy, concurrency } from './native.mjs';

export function groundRepairBody(failed, snapshot) {
  requireThat(failed?.featureState?.featureStatus === 'ERROR' && failed.feature?.featureId === 'MHVWwSC5EjXoRtyJV',
    'OBSERVED_FAILED_GROUND_REQUIRED');
  const feature = structuredClone(failed.feature);
  delete feature.suppressionState;
  const queries = feature.parameters.find(parameter => parameter.parameterId === 'mateConnectorsQuery');
  requireThat(queries?.queries?.length === 2 && queries.queries[0].btType === 'BTMPartStudioMateConnectorQuery-1324',
    'OBSERVED_BASE_CONNECTOR_REQUIRED');
  queries.queries[1] = { btType: 'BTMFeatureQueryWithOccurrence-157', path: [], featureId: 'actualGround', queryData: '' };
  feature.subFeatures = [];
  return { btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature };
}

export function observedConnector(definition, instance, suffix, origin) {
  const matches = definition.parts.filter(part => part.partId === instance.partId && part.elementId === instance.elementId)
    .flatMap(part => part.mateConnectors ?? []).filter(connector => connector.featureId.endsWith(`.${suffix}`));
  requireThat(matches.length === 1 && matches[0].mateConnectorCS.origin.every((value, index) =>
    Math.abs(value - origin[index]) < 1e-9), 'OWNED_SOURCE_CONNECTOR_FRAME_REQUIRED');
  return { btType: 'BTMPartStudioMateConnectorQuery-1324', path: [instance.id], featureId: matches[0].featureId, queryData: '' };
}

export function pilotMateBodies(definition, instances, snapshot, specs) {
  const parameters = specs.featureSpecs.find(spec => spec.featureType === 'mate')?.parameters;
  for (const parameterId of ['mateType', 'mateConnectorsQuery', 'primaryAxisAlignment', 'limitsEnabled', 'limitAxialZMin', 'limitAxialZMax'])
    requireThat(parameters?.some(parameter => parameter.parameterId === parameterId), 'LIVE_MATE_PARAMETER_REQUIRED');
  const connector = (role, suffix, origin) => observedConnector(definition, instances[role], suffix, origin);
  const mate = (name, type, queries, extras = [], subFeatures = []) => ({
    btType: 'BTFeatureDefinitionCall-1406', ...concurrency(snapshot), feature: {
      btType: 'BTMMate-64', featureType: 'mate', namespace: '', name, suppressed: false, returnAfterSubfeatures: false,
      subFeatures, parameters: [
        { btType: 'BTMParameterEnum-145', parameterId: 'mateType', enumName: 'Mate type', value: type },
        { btType: 'BTMParameterQueryWithOccurrenceList-67', parameterId: 'mateConnectorsQuery', queries },
        { btType: 'BTMParameterBoolean-144', parameterId: 'primaryAxisAlignment', value: false }, ...extras
      ]
    }
  });
  const ground = mate('PROVISIONAL native origin fastened', 'FASTENED', [
    connector('base', 'baseOrigin', [0, 0, 0]),
    { btType: 'BTMFeatureQueryWithOccurrence-157', path: [], featureId: 'pilotRootOrigin', queryData: '' }
  ], [], [{ btType: 'BTMMateConnector-66', featureType: 'mateConnector', featureId: 'pilotRootOrigin', namespace: '',
    name: 'PROVISIONAL assembly origin', suppressed: false, implicit: true, parameters: [
      { btType: 'BTMParameterEnum-145', parameterId: 'originType', enumName: 'Origin type', value: 'ON_ENTITY' },
      { btType: 'BTMParameterQueryWithOccurrenceList-67', parameterId: 'originQuery', queries: [
        { btType: 'BTMInferenceQueryWithOccurrence-1083', inferenceType: 'PART_ORIGIN', path: [], deterministicIds: [] }
      ] }
    ] }]);
  const revolute = mate('PROVISIONAL limited revolute', 'REVOLUTE', [
    connector('base', 'basePivot', [0, 0, 0.02]), connector('arm', 'armPivot', [0, 0, 0.02])
  ], [
    { btType: 'BTMParameterBoolean-144', parameterId: 'limitsEnabled', value: true },
    ...[['limitAxialZMin', '-30 deg'], ['limitAxialZMax', '60 deg']].map(([parameterId, expression]) => ({
      btType: 'BTMParameterNullableQuantity-807', parameterId, expression, isNull: false
    }))
  ]);
  return { ground, revolute };
}

export async function matePilot(api) {
  const definition = api.result('pilot-instance-readback');
  const instances = api.ledger.data.checkpoints?.['pilot-instance-binding'];
  requireThat(definition && instances, 'OBSERVED_PILOT_INSTANCES_REQUIRED');
  const snapshot = { ...api.result('pilot-native-base'), sourceMicroversion: definition.rootAssembly.documentMicroversion };
  const bodies = pilotMateBodies(definition, instances, snapshot, api.result('pilot-native-specs'));
  const ids = { ...api.owned(), eid: api.element('ASSEMBLY') };
  const ground = await api.call('pilot-ground', 'nativePilot', 'addFeature', ids, bodies.ground);
  const groundId = assertHealthy(ground);
  const revoluteBody = { ...bodies.revolute, ...concurrency(ground) };
  const revolute = await api.call('pilot-revolute', 'nativePilot', 'addFeature', ids, revoluteBody);
  const revoluteId = assertHealthy(revolute);
  api.ledger.checkpoint('pilot-mate-binding', { groundId, revoluteId });
  const values = await api.call('pilot-mate-values-before', 'nativePilot', 'getMateValues', ids);
  return { groundId, revoluteId, groundHealth: ground.featureState?.featureStatus,
    revoluteHealth: revolute.featureState?.featureStatus,
    values: values.mateValues?.map(value => Object.fromEntries(Object.entries(value).filter(([name]) =>
      !/token|secret|header|cookie|authorization/i.test(name)))) };
}

export async function independentRevolutePilot(api) {
  const ground = api.result('pilot-ground');
  requireThat(ground?.featureState?.featureStatus === 'ERROR' && api.result('pilot-ground-diagnostic'),
    'OBSERVED_GROUND_FAILURE_REQUIRED');
  const bodies = pilotMateBodies(api.result('pilot-instance-readback'), api.ledger.data.checkpoints['pilot-instance-binding'],
    ground, api.result('pilot-native-specs'));
  const ids = { ...api.owned(), eid: api.element('ASSEMBLY') };
  const revolute = await api.call('pilot-independent-revolute', 'nativePilot', 'addFeature', ids, bodies.revolute);
  const revoluteId = assertHealthy(revolute);
  api.ledger.checkpoint('pilot-mate-binding', { groundId: ground.feature.featureId, groundHealth: 'ERROR', revoluteId });
  const values = await api.call('pilot-mate-values-before', 'nativePilot', 'getMateValues', ids);
  return { groundHealth: 'ERROR', revoluteHealth: revolute.featureState.featureStatus, revoluteId,
    values: values.mateValues?.map(value => Object.fromEntries(Object.entries(value).filter(([name]) =>
      !/token|secret|header|cookie|authorization/i.test(name)))) };
}