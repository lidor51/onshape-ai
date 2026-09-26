import { requireThat } from './ledger.mjs';
import { observedMateValueRequest } from './pilot-motion.mjs';

const allowed = new Set(['sessionInfo', 'createDocument', 'getDocument', 'getElementsInDocument',
  'createFeatureStudio', 'getFeatureStudioContents', 'updateFeatureStudioContents', 'getFeatureStudioSpecs', 'createVersion',
  'getPartStudioFeatures', 'addPartStudioFeature', 'updatePartStudioFeature', 'getPartsWMVE',
  'getFeatureSpecs', 'getFeatures', 'addFeature', 'updateFeature', 'insertTransformedInstances', 'getAssemblyDefinition',
  'getMateValues', 'updateMateValues', 'createTranslation', 'getTranslation', 'createAssemblyExportStep', 'downloadExternalData']);

export class OwnedApi {
  constructor({ schema, ledger, send, packet, pilotApproval }) {
    Object.assign(this, { schema, ledger, send, packet, pilotApproval });
    this.visibilityConfirmed = false;
  }

  documentName() { return this.pilotApproval?.documentName ?? `Subsystem AB API ${this.packet.freeze.packetVersion}`; }

  result(key) { return this.ledger.completed(key)?.result; }

  owned() {
    const document = this.result('create-document');
    requireThat(/^[a-f0-9]{24}$/.test(document?.id ?? '') && /^[a-f0-9]{24}$/.test(document?.defaultWorkspace?.id ?? ''),
      'NO_RECORDED_TRIAL_OWNED_DOCUMENT');
    return { did: document.id, wid: document.defaultWorkspace.id, wvm: 'w', wvmid: document.defaultWorkspace.id,
      wv: 'w', wvid: document.defaultWorkspace.id };
  }

  elements() {
    const elements = this.result('owned-elements');
    requireThat(Array.isArray(elements), 'OWNED_ELEMENTS_UNOBSERVED');
    return elements;
  }

  element(type) {
    const matches = this.elements().filter(element => element.elementType === type);
    requireThat(matches.length === 1, `EXPECTED_ONE_DEFAULT_ELEMENT:${type}`);
    return matches[0].id;
  }

  allowedElement(eid) {
    return this.result('owned-elements')?.some(element => element.id === eid) || this.result('source-studio')?.id === eid ||
      this.pilotApproval && this.result('pilot-source-studio')?.id === eid ||
      this.ledger.data.attempts.some(entry => ['createTranslation', 'getTranslation'].includes(entry.operation) && entry.status === 'SUCCESS' &&
        entry.result.resultDocumentId === this.owned().did && entry.result.resultElementIds?.includes(eid));
  }

  async call(key, phase, operation, variables = {}, body, query = {}, wire = {}) {
    requireThat(allowed.has(operation), 'OPERATION_NOT_AUTHORIZED');
    requireThat(!Object.keys(query).some(name => /document|workspace|owner|project/i.test(name)), 'CROSS_DOCUMENT_QUERY_REFUSED');
    requireThat(Object.keys(wire).every(name => ['body', 'contentType', 'binary'].includes(name)) &&
      (!wire.body || operation === 'createTranslation') && (!wire.binary || operation === 'downloadExternalData'), 'WIRE_OVERRIDE_SCOPE');
    if (operation === 'createDocument') {
      requireThat(key === 'create-document' && JSON.stringify(body) === JSON.stringify({
        name: this.documentName(), isPublic: true, isEmptyContent: false }), 'PUBLIC_CREATE_SCOPE');
    } else if (operation !== 'sessionInfo') {
      const owned = this.owned();
      requireThat(operation === 'getDocument' || this.visibilityConfirmed, 'FRESH_PUBLIC_VISIBILITY_REQUIRED');
      requireThat(!variables.did || variables.did === owned.did, 'UNOWNED_DOCUMENT');
      requireThat(!variables.wid || variables.wid === owned.wid, 'UNOWNED_WORKSPACE');
      for (const selector of ['wvm', 'wv']) {
        const selectedId = variables[selector === 'wvm' ? 'wvmid' : 'wvid'];
        if (variables[selector]) requireThat(variables[selector] === 'w' && selectedId === owned.wid ||
          variables[selector] === 'v' && selectedId === this.result('source-version')?.id, 'UNOBSERVED_VERSION');
      }
      if (variables.eid) requireThat(this.allowedElement(variables.eid), 'UNOBSERVED_ELEMENT');
      if (operation === 'getTranslation') requireThat(this.ledger.data.attempts.some(entry => entry.status === 'SUCCESS' &&
        ['createTranslation', 'createAssemblyExportStep'].includes(entry.operation) && entry.result.id === variables.tid), 'UNOBSERVED_TRANSLATION');
      if (operation === 'downloadExternalData') requireThat(this.ledger.data.attempts.some(entry => entry.status === 'SUCCESS' &&
        entry.result?.resultExternalDataIds?.includes(variables.fid)), 'UNOBSERVED_EXPORT');
      if (operation === 'updateFeatureStudioContents') requireThat(this.pilotApproval ?
        variables.eid === this.result('pilot-source-studio')?.id && body.contents === this.pilotSource :
        body.contents === this.packet.source, 'UNFROZEN_SOURCE_UPLOAD');
      if (operation === 'insertTransformedInstances') {
        for (const group of body.transformGroups) for (const instance of group.instances) requireThat(instance.documentId === owned.did &&
          this.allowedElement(instance.elementId) && !instance.isAssembly && !instance.isWholePartStudio && !instance.versionId,
          'INSTANCE_SOURCE_NOT_OWNED');
      }
      if (operation === 'createVersion') requireThat(body.documentId === owned.did && body.workspaceId === owned.wid &&
        body.publishVersion === false, 'VERSION_SCOPE');
      if (['addFeature', 'updateFeature'].includes(operation)) requireThat(
        ['BTMMate-64', 'BTMMateRelation-1412', 'BTMMateConnector-66'].includes(body.feature?.btType), 'NATIVE_FEATURE_SCOPE');
      if (['addPartStudioFeature', 'updatePartStudioFeature'].includes(operation)) requireThat(
        body.feature?.featureType === (this.pilotApproval ? 'provisionalApiPilot' : 'conceptAShared'), 'CUSTOM_FEATURE_SCOPE');
      if (['addFeature', 'updateFeature', 'addPartStudioFeature', 'updatePartStudioFeature', 'updateFeatureStudioContents'].includes(operation))
        requireThat(body.rejectMicroversionSkew === true && body.sourceMicroversion, 'CONCURRENCY_GUARD_REQUIRED');
      if (operation === 'createTranslation') requireThat(body.importWithinDocument === true && body.onePartPerDoc === false &&
        body.splitAssembliesIntoMultipleDocuments === false && !body.makePublic && !body.ownerId && !body.parentId,
        'IMPORT_MUST_STAY_IN_OWNED_DOCUMENT');
      if (operation === 'createAssemblyExportStep') requireThat(body.storeInDocument === false, 'EXTERNAL_EXPORT_ONLY');
    }
    const request = operation === 'updateMateValues' ?
      observedMateValueRequest(this.schema, variables, body, this.result('pilot-mate-values-before')) :
      this.schema.request(operation, variables, body, query);
    const result = await this.send({ ...request, ...wire, key, phase, createsDocument: operation === 'createDocument' });
    if (request.method === 'POST') this.ledger.checkpoint(`mutation:${key}`, {
      operation, observedAt: new Date().toISOString(), resultId: result.id ?? result.feature?.featureId ?? null,
      sourceMicroversion: result.sourceMicroversion ?? null });
    if (operation === 'getDocument') {
      requireThat(result.id === this.owned().did && result.public === true, 'PUBLIC_VISIBILITY_NOT_CONFIRMED');
      this.visibilityConfirmed = true;
    }
    return result;
  }

  async initialize(create = false) {
    if (!this.result('create-document')) {
      requireThat(create, 'NO_RECORDED_TRIAL_OWNED_DOCUMENT');
      await this.call('create-document', 'pilotAndOwnership', 'createDocument', {}, {
        name: this.documentName(), isPublic: true, isEmptyContent: false });
    }
    const owned = this.owned();
    await this.call(`public-visibility-${this.ledger.data.attempts.length}`, 'pilotAndOwnership', 'getDocument', { did: owned.did });
    await this.call('owned-elements', 'pilotAndOwnership', 'getElementsInDocument', owned);
    return owned;
  }
}