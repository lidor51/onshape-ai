import { requireThat } from './ledger.mjs';

export function observedMateValueRequest(schema, variables, body, observed) {
  requireThat(body && Object.keys(body).length === 1 && Array.isArray(body.mateValues) && body.mateValues.length === 1,
    'ONE_OBSERVED_MATE_VALUE_REQUIRED');
  const value = body.mateValues[0];
  const evidence = observed?.mateValues?.find(item => item.featureId === value.featureId);
  requireThat(evidence?.jsonType === 'Revolute' && typeof evidence.rotationZ === 'number' &&
    value.jsonType === evidence.jsonType && Number.isFinite(value.rotationZ) && Math.abs(value.rotationZ) <= Math.PI &&
    JSON.stringify(value.ownerOccurrencePath) === JSON.stringify(evidence.ownerOccurrencePath) &&
    value.mateName === evidence.mateName && Object.keys(value).every(name => Object.hasOwn(evidence, name)),
    'OBSERVED_REVOLUTE_CODEC_REQUIRED');
  const { rotationZ, ...base } = value;
  const request = schema.request('updateMateValues', variables, { mateValues: [base] });
  return { ...request, body: { mateValues: [{ ...base, rotationZ }] } };
}

export async function movePilot(api) {
  const mate = api.ledger.data.checkpoints?.['pilot-mate-binding'];
  const before = api.result('pilot-mate-values-before');
  const observed = before?.mateValues?.find(value => value.featureId === mate?.revoluteId);
  requireThat(observed, 'OBSERVED_REVOLUTE_REQUIRED');
  const body = { mateValues: [{ ...structuredClone(observed), rotationZ: Math.PI / 2 }] };
  const ids = { ...api.owned(), eid: api.element('ASSEMBLY') };
  const updated = await api.call('pilot-motion-upper-limit-command', 'nativePilot', 'updateMateValues', ids, body);
  api.ledger.checkpoint('pilot-motion-command', { requestedRadians: Math.PI / 2, upperLimitRadians: Math.PI / 3,
    mateId: mate.revoluteId, responseValue: updated.mateValues?.find(value => value.featureId === mate.revoluteId)?.rotationZ ?? null });
  return { requestedRadians: Math.PI / 2, upperLimitRadians: Math.PI / 3,
    responseValue: updated.mateValues?.find(value => value.featureId === mate.revoluteId)?.rotationZ ?? null };
}

export async function reopenPilot(api) {
  requireThat(api.result('pilot-motion-upper-limit-command'), 'OBSERVED_MOTION_WRITE_REQUIRED');
  const ids = { ...api.owned(), eid: api.element('ASSEMBLY') };
  const definition = await api.call('pilot-reopened-motion-readback', 'nativePilot', 'getAssemblyDefinition', ids,
    undefined, { includeMateFeatures: true, includeMateConnectors: true });
  const baseline = api.result('pilot-instance-readback').rootAssembly.occurrences;
  const occurrences = definition.rootAssembly.occurrences.map(occurrence => ({ path: occurrence.path,
    transform: occurrence.transform, fixed: occurrence.fixed, changed: occurrence.transform.some((value, index) =>
      Math.abs(value - baseline.find(item => JSON.stringify(item.path) === JSON.stringify(occurrence.path)).transform[index]) > 1e-7) }));
  const result = { reopenedInNewProcess: true, occurrences, features: definition.rootAssembly.features.map(feature => ({
    id: feature.id, type: feature.featureType, data: feature.featureData })),
    changedOccurrenceCount: occurrences.filter(occurrence => occurrence.changed).length };
  api.ledger.checkpoint('pilot-reopened-motion-evidence', result);
  return result;
}