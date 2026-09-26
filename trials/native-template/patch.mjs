import { createHash } from 'node:crypto';

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
export const OWNED = Object.freeze(['innerWidth', 'rollerGap']);

export function planPatch(snapshot, values) {
  if (!snapshot.microversion || !Array.isArray(snapshot.features)) throw new Error('INVALID_SNAPSHOT');
  if (Object.keys(values).sort().join(',') !== [...OWNED].sort().join(',')) throw new Error('OWNERSHIP');
  const changes = OWNED.map(name => {
    const matches = snapshot.features.filter(feature => feature.featureType === 'assignVariable' &&
      feature.parameters.find(parameter => parameter.parameterId === 'name')?.value === name);
    if (matches.length !== 1) throw new Error('VARIABLE_IDENTITY');
    const feature = matches[0];
    const parameter = feature.parameters.find(item => item.parameterId === 'value');
    if (!parameter || !Number.isFinite(values[name]) || values[name] <= 0) throw new Error('INVALID_VALUE');
    const after = structuredClone(feature);
    for (const item of after.parameters) {
      if (['value', 'lengthValue'].includes(item.parameterId)) item.expression = `${values[name]} mm`;
    }
    return { featureId: feature.featureId, before: structuredClone(feature), after };
  });
  return { microversion: snapshot.microversion, snapshotHash: hash(snapshot), changes };
}

export function applyPatch(current, patch) {
  if (current.microversion !== patch.microversion) throw new Error('STALE_MICROVERSION');
  if (hash(current) !== patch.snapshotHash) throw new Error('CONFLICTING_STATE');
  if (patch.changes.length !== OWNED.length) throw new Error('OWNERSHIP');
  const values = Object.fromEntries(patch.changes.map(change => {
    const name = change.before.parameters.find(item => item.parameterId === 'name')?.value;
    const expression = change.after.parameters.find(item => item.parameterId === 'value')?.expression;
    if (!/^(?:\d+(?:\.\d*)?|\.\d+) mm$/.test(expression)) throw new Error('INVALID_UNITS');
    return [name, Number(expression.slice(0, -3))];
  }));
  if (hash(planPatch(current, values)) !== hash(patch)) throw new Error('TAMPERED_PATCH');
  return {
    ...structuredClone(current),
    features: current.features.map(feature => structuredClone(
      patch.changes.find(change => change.featureId === feature.featureId)?.after ?? feature)),
  };
}