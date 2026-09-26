export const ORIGIN = 'https://cad.onshape.com';
export const TARGET = Object.freeze({
  did: 'f92dc90f7c052de045dd2c4f', wid: 'b60d9355149429c9c55f69c8',
  eid: 'd0a579bf1b84bc1e68e06e90', fsid: '66e03cc911623af502c718c4',
  featureId: 'FQxpC8Q8LkpIQvt_0', namespace: 'e66e03cc911623af502c718c4::m5dd5c58ddf7b5c3d6b5988eb',
});
export const PHASE_CAP = 12;
export const TOTAL_CAP = 24;
export const ROLES = Object.freeze(['leftPlate', 'rightPlate', 'frontRoller', 'rearRoller',
  'frontShaft', 'rearShaft', 'frontCrossmember', 'rearCrossmember', 'coralReference']);
export const fail = code => { throw new Error(code); };
export const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/.test(value);

export function authorize(flags) {
  const [phase, ...acknowledgements] = flags;
  const required = ['--live-readonly-export', '--allow-current-key', '--parent-branch-quiescent'];
  if (acknowledgements.includes('--resume-saved-responses')) required.push('--resume-saved-responses');
  if (!['baseline', 'revision'].includes(phase) || acknowledgements.length !== required.length ||
      required.some(flag => !acknowledgements.includes(flag))) fail('EXPLICIT_AUTHORIZATION_REQUIRED');
  return phase;
}

export function validateLedger(ledger) {
  if (ledger?.schema !== 1 || JSON.stringify(ledger.target) !== JSON.stringify(TARGET) ||
      ledger.phaseCap !== PHASE_CAP || ledger.totalCap !== TOTAL_CAP || !Array.isArray(ledger.requests) ||
      ledger.requests.length > TOTAL_CAP || ledger.requests.some((entry, index) =>
        entry.sequence !== index + 1 || !['baseline', 'revision'].includes(entry.phase)) ||
      ['baseline', 'revision'].some(phase => ledger.requests.filter(entry => entry.phase === phase).length > PHASE_CAP)) {
    fail('LEDGER_INVALID_NEVER_RESET');
  }
  return ledger;
}

export function reserve(ledger, phase, request) {
  validateLedger(ledger);
  if (!['baseline', 'revision'].includes(phase)) fail('PHASE_INVALID');
  if (ledger.requests.length >= TOTAL_CAP) fail('CUMULATIVE_REQUEST_CAP');
  if (ledger.requests.filter(entry => entry.phase === phase).length >= PHASE_CAP) fail('PHASE_REQUEST_CAP');
  const entry = { sequence: ledger.requests.length + 1, phase, method: request.method, url: request.url,
    startedAt: new Date().toISOString(), status: null };
  ledger.requests.push(entry);
  return entry;
}

export function measurementScript() {
  return `function(context, queries) {
    const featureId = makeId("${TARGET.featureId}");
    const roles = ${JSON.stringify(ROLES)};
    var parts = [];
    for (var role in roles) {
      const bodies = qBodyType(qCreatedBy(featureId + role, EntityType.BODY), BodyType.SOLID);
      const bounds = evBox3d(context, {"topology": bodies, "tight": true});
      const faces = evaluateQuery(context, qGeometry(qOwnedByBody(bodies, EntityType.FACE), GeometryType.CYLINDER));
      var cylinders = [];
      for (var face in faces) {
        const surface = evSurfaceDefinition(context, {"face": face});
        const limits = evBox3d(context, {"topology": face, "tight": true});
        cylinders = append(cylinders, {"radiusMm": surface.radius / millimeter,
          "axisOriginMm": surface.coordSystem.origin / millimeter, "axisDirection": surface.coordSystem.zAxis,
          "minMm": limits.minCorner / millimeter, "maxMm": limits.maxCorner / millimeter});
      }
      parts = append(parts, {"role": role, "name": getProperty(context, {"entity": bodies, "propertyType": PropertyType.NAME}),
        "excludeFromBOM": getProperty(context, {"entity": bodies, "propertyType": PropertyType.EXCLUDE_FROM_BOM}),
        "solidCount": size(evaluateQuery(context, bodies)), "volumeMm3": evVolume(context, {"entities": bodies}) / millimeter^3,
        "minMm": bounds.minCorner / millimeter, "maxMm": bounds.maxCorner / millimeter, "cylinders": cylinders});
    }
    return {"partCount": size(evaluateQuery(context, qBodyType(qCreatedBy(featureId, EntityType.BODY), BodyType.SOLID))),
      "allSolidCount": size(evaluateQuery(context, qBodyType(qEverything(EntityType.BODY), BodyType.SOLID))), "parts": parts};
  }`;
}

export function requestPlan(kind, binding = {}) {
  const workspace = `d/${TARGET.did}/w/${TARGET.wid}/e/${TARGET.eid}`;
  const snapshot = `d/${TARGET.did}/m/${binding.microversion}/e/${TARGET.eid}`;
  if (['parts', 'measure', 'png', 'source'].includes(kind) && !validId(binding.microversion)) fail('MICROVERSION_REQUIRED');
  let path;
  let method = 'GET';
  let body;
  if (kind === 'features') path = `/api/partstudios/${workspace}/features`;
  else if (kind === 'parts') path = `/api/parts/${snapshot}`;
  else if (kind === 'source') path = `/api/featurestudios/d/${TARGET.did}/m/${binding.microversion}/e/${TARGET.fsid}`;
  else if (kind === 'measure') {
    path = `/api/partstudios/${snapshot}/featurescript`;
    method = 'POST';
    body = { script: measurementScript(), queries: [] };
  } else if (kind === 'png') {
    const query = new URLSearchParams({ viewMatrix: '0.7071067812,-0.4082482905,0.5773502692,0,0.7071067812,0.4082482905,-0.5773502692,0,0,0.8164965809,0.5773502692,0',
      outputWidth: '1200', outputHeight: '900', pixelSize: '0.00065' });
    path = `/api/partstudios/${snapshot}/shadedviews?${query}`;
  } else if (kind === 'step') {
    path = `/api/v11/partstudios/${workspace}/export/step`;
    method = 'POST';
    body = { storeInDocument: false };
  } else if (kind === 'poll' && validId(binding.translationId)) {
    path = `/api/translations/${binding.translationId}`;
  } else if (kind === 'download' && validId(binding.externalDataId)) {
    path = `/api/documents/d/${TARGET.did}/externaldata/${binding.externalDataId}`;
  } else fail('ROUTE_DENIED');
  return { method, url: ORIGIN + path, ...(body ? { body } : {}) };
}

export function assertRequest(request, kind, binding) {
  const url = new URL(request.url);
  if (url.origin !== ORIGIN || url.username || url.password || url.hash) fail('ORIGIN_DENIED');
  if (JSON.stringify(request) !== JSON.stringify(requestPlan(kind, binding))) fail('REQUEST_OR_SOURCE_DENIED');
}