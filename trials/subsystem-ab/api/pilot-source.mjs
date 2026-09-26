import { requireThat } from './ledger.mjs';
import { assertHealthy, concurrency } from './native.mjs';

export function pilotSource(version) {
  requireThat(Number.isInteger(version) && version > 0, 'OBSERVED_FS_VERSION_REQUIRED');
  return `FeatureScript ${version};
import(path : "onshape/std/common.fs", version : "${version}.0");

annotation { "Feature Type Name" : "Provisional API pilot blocks" }
export const provisionalApiPilot = defineFeature(function(context is Context, id is Id, definition is map)
precondition {}
{
    fCuboid(context, id + "base", {
        "corner1" : vector(-20, -15, -8) * millimeter,
        "corner2" : vector(20, 15, 0) * millimeter
    });
    fCuboid(context, id + "arm", {
        "corner1" : vector(0, -5, 20) * millimeter,
        "corner2" : vector(60, 5, 30) * millimeter
    });
    const base = qCreatedBy(id + "base", EntityType.BODY);
    const arm = qCreatedBy(id + "arm", EntityType.BODY);
    setProperty(context, { "entities" : base, "propertyType" : PropertyType.NAME, "value" : "PROVISIONAL pilot base" });
    setProperty(context, { "entities" : arm, "propertyType" : PropertyType.NAME, "value" : "PROVISIONAL pilot arm" });
    opMateConnector(context, id + "baseOrigin", {
        "coordSystem" : coordSystem(vector(0, 0, 0) * millimeter, vector(1, 0, 0), vector(0, 0, 1)),
        "owner" : base
    });
    opMateConnector(context, id + "basePivot", {
        "coordSystem" : coordSystem(vector(0, 0, 20) * millimeter, vector(1, 0, 0), vector(0, 0, 1)),
        "owner" : base
    });
    opMateConnector(context, id + "armPivot", {
        "coordSystem" : coordSystem(vector(0, 0, 20) * millimeter, vector(1, 0, 0), vector(0, 0, 1)),
        "owner" : arm
    });
}, {});
`;
}

export async function createPilotSource(api) {
  const owned = api.owned();
  const phase = 'nativePilot';
  const studio = await api.call('pilot-source-studio', phase, 'createFeatureStudio', owned,
    { name: 'PROVISIONAL pilot source - retained' });
  const ids = { ...owned, eid: studio.id };
  const initial = await api.call('pilot-source-initial', phase, 'getFeatureStudioContents', ids);
  const version = Number(initial.contents?.match(/^FeatureScript\s+(\d+);/)?.[1]);
  const contents = pilotSource(version);
  api.pilotSource = contents;
  const uploaded = await api.call('pilot-source-upload', phase, 'updateFeatureStudioContents', ids,
    { btType: 'BTFeatureStudioContents-2239', ...concurrency(initial), contents });
  const specs = await api.call('pilot-source-specs', phase, 'getFeatureStudioSpecs', ids);
  const spec = specs.featureSpecs?.find(item => item.featureType === 'provisionalApiPilot');
  requireThat(spec?.namespace, 'PILOT_SOURCE_COMPILE_FAILED');
  const feature = await api.call('pilot-source-feature', phase, 'addPartStudioFeature',
    { ...owned, eid: api.element('PARTSTUDIO') }, {
      btType: 'BTFeatureDefinitionCall-1406', ...concurrency(specs), feature: {
        btType: 'BTMFeature-134', featureType: spec.featureType, namespace: spec.namespace,
        name: 'PROVISIONAL blocks and owned datums', suppressed: false, parameters: []
      }
    });
  assertHealthy(feature);
  const parts = await api.call('pilot-parts', phase, 'getPartsWMVE', { ...owned, eid: api.element('PARTSTUDIO') });
  requireThat(parts.length === 2 && parts.every(part => part.bodyType === 'solid'), 'PILOT_TWO_SOLIDS_REQUIRED');
  return { version, sourceFeatureId: feature.feature.featureId, sourceStudio: studio.id,
    sourceUploadMicroversion: uploaded.sourceMicroversion,
    parts: parts.map(part => ({ name: part.name, partId: part.partId, elementId: part.elementId, bodyType: part.bodyType })) };
}