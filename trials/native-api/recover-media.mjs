import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseArguments, loadCredentials, createClient, requireCondition, PocError } from './transport.mjs';
import { checkedId, bomExclusionProperty } from './validate.mjs';

export async function recoverMedia(args) {
  const options = parseArguments(args);
  requireCondition(options.live && options.publicDocument && options.resume, 'PUBLIC_OWNED_RESUME_REQUIRED');
  const directory = new URL(`live/${options.resume}/`, import.meta.url);
  const phase = JSON.parse(readFileSync(new URL('live/public-phase.json', import.meta.url)));
  const { observed } = JSON.parse(readFileSync(new URL('observations.json', directory)));
  requireCondition(phase.runs.some(run => run.runId === options.resume && run.documentId === observed.documentId)
    && phase.phaseId === observed.provenance?.phaseId && observed.provenance.requestedPublic === true
    && observed.publicConfirmed && observed.stages.revision?.geometryChecksPassed, 'OWNED_PHASE_PROVENANCE_REQUIRED');
  const evidence = { startedAt: new Date().toISOString(), documentId: observed.documentId, requests: [], exports: [] };
  const credentials = await loadCredentials(true, undefined, options.stack);
  const save = () => {
    let text = JSON.stringify(evidence, null, 2);
    for (const secret of Object.values(credentials)) text = text.split(secret).join('[REDACTED]');
    writeFileSync(new URL('media-recovery.json', directory), `${text}\n`);
  };
  const client = createClient({ ...options, credentials, onEvent: event => {
    evidence.requests.push({ ...event, at: new Date().toISOString() });
    save();
    console.log(`${event.operation}: ${event.status ?? event.error} (${event.elapsedMs} ms)`);
  } });
  const started = performance.now();
  try {
    const documentId = checkedId(observed.documentId);
    const document = await client.request('GET', `/api/v10/documents/${documentId}`, undefined, 'confirmOwnedPublicDocument');
    requireCondition(document.id === documentId && document.public === true
      && document.name === observed.provenance.creationName, 'PUBLIC_OWNED_DOCUMENT_NOT_CONFIRMED');
    const translations = await client.request('GET', `/api/v9/translations/d/${documentId}?limit=20`, undefined, 'recoverExistingTranslations');
    const discovery = JSON.parse(readFileSync(new URL('media-discovery.json', directory)));
    const expectedIds = discovery.translations.map(item => checkedId(item.id));
    requireCondition(translations.items?.filter(item => expectedIds.includes(item.id)).length === 2, 'EXPORT_RECONCILIATION_MISMATCH');
    for (const translation of translations.items.filter(item => expectedIds.includes(item.id))) {
      requireCondition(translation.requestState === 'DONE' && translation.documentId === documentId
        && translation.resultDocumentId === documentId && translation.requestElementId === observed.elementId
        && translation.workspaceId === observed.workspaceId && translation.resultExternalDataIds?.length === 1, 'EXPORT_PROVENANCE_MISMATCH');
      const translationId = checkedId(translation.id);
      const foreignId = checkedId(translation.resultExternalDataIds[0]);
      const bytes = await client.request('GET', `/api/v6/documents/d/${documentId}/externaldata/${foreignId}`, undefined, 'recoverExportBytes', true);
      const filename = `export-${translationId}.bin`;
      writeFileSync(new URL(filename, directory), bytes);
      evidence.exports.push({ translationId, foreignId, filename, bytes: bytes.length,
        first16Hex: bytes.subarray(0, 16).toString('hex'), sha256: createHash('sha256').update(bytes).digest('hex') });
      save();
    }
    const metadataPath = `/api/v10/metadata/d/${documentId}/w/${checkedId(observed.workspaceId)}/e/${checkedId(observed.elementId)}/p/${checkedId(observed.partIds.coralReference)}`;
    const metadata = await client.request('GET', metadataPath, undefined, 'getCoralBomProperty');
    requireCondition(metadata.properties?.some(property => property.name === 'Name'
      && property.value === 'coralReference [REFERENCE - NON-BOM]'), 'CORAL_IDENTITY_NOT_CONFIRMED');
    const property = bomExclusionProperty(metadata);
    requireCondition(property && typeof property.value === 'boolean', 'EDITABLE_BOOLEAN_BOM_PROPERTY_REQUIRED');
    evidence.bomBefore = { name: property.name, propertyId: checkedId(property.propertyId), value: property.value, valueType: property.valueType };
    if (!property.value) await client.request('POST', metadataPath, {
      jsonType: 'metadata-part', partId: observed.partIds.coralReference,
      properties: [{ propertyId: property.propertyId, value: true }],
    }, 'setCoralExcludedFromAllBoms');
    const confirmed = await client.request('GET', metadataPath, undefined, 'verifyCoralBomExclusion');
    requireCondition(confirmed.properties?.some(item => item.propertyId === property.propertyId && item.value === true), 'BOM_EXCLUSION_NOT_CONFIRMED');
    evidence.bomExclusion = 'CONFIRMED_AFTER_REVISION';
    evidence.status = 'EXPORT_BYTES_RECOVERED_AND_BOM_CONFIRMED';
  } catch (error) {
    evidence.status = 'FAILED';
    evidence.failureCode = error instanceof PocError ? error.code : 'UNEXPECTED_RESPONSE_OR_IO';
    process.exitCode = 1;
  } finally {
    evidence.finishedAt = new Date().toISOString();
    evidence.elapsedWallMs = Math.round(performance.now() - started);
    save();
    console.log(JSON.stringify({ status: evidence.status, failureCode: evidence.failureCode, exports: evidence.exports, bom: evidence.bomExclusion }));
  }
}

if (import.meta.main) {
  try { await recoverMedia(process.argv.slice(2)); }
  catch (error) { console.error(error instanceof PocError ? error.code : 'LOCAL_RECOVERY_FAILED'); process.exitCode = 1; }
}