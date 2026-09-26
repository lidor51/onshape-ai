import { requireThat } from './ledger.mjs';
import { batchInstances, bindInstances, bindParts } from './native.mjs';

export const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const pilotGraph = { instances: ['base', 'arm'].map(role => ({ id: role, part: role, transform: identity })) };

export async function insertPilotParts(api) {
  const owned = api.owned();
  const parts = bindParts(api.result('pilot-parts'), ['base', 'arm'].map(role => ({ role, name: `PROVISIONAL pilot ${role}` })),
    api.element('PARTSTUDIO'));
  const ids = { ...owned, eid: api.element('ASSEMBLY') };
  await api.call('pilot-instances', 'nativePilot', 'insertTransformedInstances', ids, batchInstances(pilotGraph, parts, owned.did));
  const definition = await api.call('pilot-instance-readback', 'nativePilot', 'getAssemblyDefinition', ids,
    undefined, { includeMateFeatures: true, includeMateConnectors: true });
  const instances = bindInstances(pilotGraph, parts, definition, owned.did);
  api.ledger.checkpoint('pilot-instance-binding', instances);
  return { instances, rootKeys: Object.keys(definition.rootAssembly),
    rootConnectors: definition.rootAssembly.mateConnectors,
    parts: definition.parts?.map(part => ({ partId: part.partId, mateConnectors: part.mateConnectors })),
    occurrences: definition.rootAssembly.occurrences?.map(occurrence => ({ path: occurrence.path, transform: occurrence.transform,
      fixed: occurrence.fixed })), documentMicroversion: definition.rootAssembly.documentMicroversion };
}