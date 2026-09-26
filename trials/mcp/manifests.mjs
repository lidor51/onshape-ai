import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { expectations, featureScript, measurementScript } from './benchmark.mjs';
import { trialDirectory } from './safety.mjs';

export function makeManifest(specification, details, revision = false) {
  const phase = revision ? 'revision' : 'baseline';
  const expected = expectations(specification, revision);
  const source = featureScript(specification);
  const endpointMap = new Map(details.map(detail => [detail.operation_id, detail]));
  const bindings = {
    did: '$newDocument.id', wid: '$newDocument.defaultWorkspace.id',
    wvm: 'w', wvmid: '$newDocument.defaultWorkspace.id',
    wv: 'w', wvid: '$newDocument.defaultWorkspace.id',
    eid: '$newPartStudio.id', fid: '$createdFeature.featureId',
    tid: '$stepTranslation.id',
  };
  const calls = [];
  function api(endpoint, body, overrides = {}, query = {}) {
    const detail = endpointMap.get(endpoint);
    if (!detail) throw new Error(`Endpoint not actually discovered: ${endpoint}`);
    const parameters = { ...bindings, ...overrides };
    const path = Object.fromEntries(detail.parameters.filter(parameter => parameter.location === 'path').map(parameter => {
      if (!parameters[parameter.name]) throw new Error(`Missing path binding: ${parameter.name}`);
      return [parameter.name, parameters[parameter.name]];
    }));
    const args = { endpoint, path_params: path, query_params: query };
    if (body !== undefined) args.body = JSON.stringify(body);
    calls.push({ tool: 'onshape_api_call', arguments: args, method: detail.method, path: detail.path, status: 'not-executed' });
  }
  if (!revision) {
    api('createDocument', { name: 'FRC coral intake MCP PoC', isPublic: false, isEmptyContent: true });
    api('getDocument');
    api('createPartStudio', { name: 'Coral intake packaging' });
    api('createFeatureStudio', { name: 'Coral intake source' });
    api('updateFeatureStudioContents', { contents: source }, { eid: '$newFeatureStudio.id' });
  }
  api('getPartStudioFeatures');
  const feature = {
    btType: 'BTMFeature-134', name: 'Coral intake packaging', featureType: 'coralIntake',
    namespace: '$verifiedFeatureStudioNamespace',
    parameters: [
      { btType: 'BTMParameterQuantity-147', parameterId: 'innerWidth', expression: `${expected.dimensions.innerWidthMm} mm`, isInteger: false },
      { btType: 'BTMParameterQuantity-147', parameterId: 'rollerGap', expression: `${expected.dimensions.rollerGapMm} mm`, isInteger: false },
    ],
  };
  if (revision) feature.featureId = bindings.fid;
  api(revision ? 'updatePartStudioFeature' : 'addPartStudioFeature', {
    btType: 'BTFeatureDefinitionCall-1406', sourceMicroversion: '$latestFeatureRead.sourceMicroversion', rejectMicroversionSkew: true, feature,
  });
  api('getPartStudioFeatures');
  api('getPartsWMV', undefined, {}, { elementId: '$newPartStudio.id', includePropertyDefaults: 'true' });
  api('getPartStudioBodyDetails', undefined, {}, { includeGeometricData: 'true' });
  api('getPartStudioBoundingBoxes');
  api('evalFeatureScript', { script: measurementScript });
  calls.push({
    tool: 'onshape_screenshot', status: 'not-executed',
    arguments: { did: bindings.did, wvm: 'w', wvmid: bindings.wvmid, eid: bindings.eid,
      view: { type: 'preset', name: 'isometric' }, output_width: 1200, output_height: 900,
      show_all_parts: true, output_path: join(trialDirectory, `artifacts/${phase}.png`) },
  });
  api('createPartStudioExportStep', { storeInDocument: false, destinationName: `coral-intake-${phase}`, stepVersionString: 'AP242', notifyUser: false, triggerAutoDownload: false });
  api('getTranslation');
  api('downloadExternalData', undefined, { fid: '$stepTranslation.resultExternalDataIds[0]' });
  return {
    benchmarkId: specification.id, route: 'existing MCP + FeatureScript (MCP+FS)', phase,
    status: 'schema-validated-call-plan-only-not-executed', executableLive: false,
    sourceArtifact: 'intake.fs', sourceSha256: createHash('sha256').update(source).digest('hex'),
    expected,
    bindings: {
      '$newDocument': 'Only the successful response to this plan\'s createDocument; never accept an existing document ID.',
      '$newPartStudio': 'Only the createPartStudio response in that new document.',
      '$newFeatureStudio': 'Only the createFeatureStudio response in that new document.',
      '$verifiedFeatureStudioNamespace': 'Unresolved. Bind from a verified custom-feature import for the newly created Feature Studio; do not guess.',
      '$latestFeatureRead': 'Fresh getPartStudioFeatures before each mutation; reject microversion skew.',
      '$createdFeature': 'Feature ID returned by baseline addPartStudioFeature; reuse for revision.',
      '$stepTranslation': 'Async export response; poll getTranslation with bounded backoff until DONE or FAILED.',
    },
    gates: [
      'Explicit future live approval and reviewed credentials handling required; no live runner is provided.',
      'Require a NEW private document. Verify private status before later writes. No public fallback or deletion.',
      'Compile source in Feature Studio, verify namespace, then require featureStatus OK after add/update.',
      'Merge revision parameters into the full current feature readback; preserve IDs, namespace and other fields.',
      'Decode body details and check ten through-holes plus roller/coral bores; tight bounds alone cannot prove holes.',
      'Compare server part names/count, tight bounds and parameter expressions with expectations, with explicit unit conversion.',
      'Verify coralReference EXCLUDE_FROM_BOM on the server, not just its name.',
      'Check image PNG signature/dimensions and STEP bytes after DONE; do not treat a queued translation as export success.',
    ],
    calls,
  };
}