import assert from 'node:assert/strict';
import test from 'node:test';
import {referenceRequest,references,recoverReadFailure,recoverDownloadRead,closeUnavailableReference,subassemblyPartIds,recoverGltfFormat} from './native-inspect.mjs';
import {loadSchema} from '../../trials/subsystem-ab/api/schema.mjs';

test('reference inspector allows only specific released documents and read-only API operations',()=>{
  const schema=loadSchema();
  const request=referenceRequest(schema,'1690','getDocument');assert.equal(request.method,'GET');assert.ok(request.path.endsWith(references['1690'].did));
  assert.throws(()=>referenceRequest(schema,'2056','getDocument'),/REFERENCE_SCOPE/);
  assert.throws(()=>referenceRequest(schema,'1690','createDocument'),/REFERENCE_SCOPE/);
  assert.throws(()=>referenceRequest(schema,'1778','getDocument',{did:references['1690'].did}),/DOCUMENT_SCOPE/);
});

test('one recorded assembly read-error recovery cannot clear authorization or mutation halts',()=>{
  const fixture=()=>({attempts:[{sequence:26,operation:'getAssemblyDefinition',method:'GET',key:'reference-inspection-20260918-1778-getAssemblyDefinition'}],halt:{sequence:26,code:'HTTP_500'}});
  const data=fixture();recoverReadFailure(data,'getElementsInDocument');assert.equal(data.halt,undefined);assert.equal(data.referenceReadRecoveries.length,1);
  assert.throws(()=>recoverReadFailure(fixture(),'getAssemblyDefinition'),/RECOVERY_SCOPE/);
  const unauthorized=fixture();unauthorized.halt.code='HTTP_403';assert.throws(()=>recoverReadFailure(unauthorized,'getElementsInDocument'));
  const mutation=fixture();mutation.attempts[0].method='POST';assert.throws(()=>recoverReadFailure(mutation,'getElementsInDocument'));
});

test('failed blob read may move only once to a different reference JSON inspection, never replay or mutate',()=>{
  const fixture=()=>({attempts:[{sequence:31,operation:'downloadFileWorkspace',method:'GET',key:'reference-inspection-20260918-1778-downloadFileWorkspace'}],halt:{sequence:31,code:'UNKNOWN_OUTCOME'}});
  assert.throws(()=>recoverDownloadRead(fixture(),'1778','downloadFileWorkspace'));
  const mutation=fixture();mutation.attempts[0].method='POST';assert.throws(()=>recoverDownloadRead(mutation,'1690','getAssemblyDefinition'));
  const data=fixture();recoverDownloadRead(data,'1690','getAssemblyDefinition');assert.equal(data.halt,undefined);assert.ok(data.referenceDownloadRecovery);
});

test('closing the unavailable reference preserves its error and allows only the other geometry path',()=>{
  const fixture=()=>({attempts:[{sequence:33,operation:'getAssemblyDefinition',method:'GET',key:`reference-inspection-20260918-1778-getAssemblyDefinition-${references['1778'].eid}-minimal`}],halt:{sequence:33,code:'HTTP_500'}});
  const data=fixture();closeUnavailableReference(data,'1690','exportPartStudioGltf');assert.equal(data.halt,undefined);assert.equal(data.closedReferences['1778'].sequence,33);
  assert.throws(()=>closeUnavailableReference(fixture(),'1778','getAssemblyDefinition'));
  const unauthorized=fixture();unauthorized.halt.code='HTTP_403';assert.throws(()=>closeUnavailableReference(unauthorized,'1690','exportPartStudioGltf'));
});

test('geometry selection follows actual assembly references, deduplicates parts and rejects unknown paths',()=>{
  const part={type:'Part',documentId:references['1690'].did,elementId:'9d9d0c6fb9f94eb7f073ecc4',partId:'wheel'};
  const definition={rootAssembly:{elementId:'root',instances:[{type:'Assembly',elementId:'child'},part]},subAssemblies:[{elementId:'child',instances:[part]}]};
  assert.deepEqual(subassemblyPartIds(definition,'root'),['wheel']);
  assert.throws(()=>subassemblyPartIds(definition,'missing'));
  definition.subAssemblies[0].instances.push({type:'Assembly',elementId:'root'});assert.throws(()=>subassemblyPartIds(definition,'root'));
});

test('media-type correction is specific to a failed read-only GLTF 406 response',()=>{
  const fixture=()=>({attempts:[{sequence:34,operation:'exportPartStudioGltf',method:'GET',key:'reference-inspection-20260918-1690-exportPartStudioGltf'}],halt:{sequence:34,code:'HTTP_406'}});
  const data=fixture();recoverGltfFormat(data,'1690','exportPartStudioGltf');assert.equal(data.halt,undefined);assert.equal(data.referenceFormatCorrection.accept,'model/gltf+json');
  const denied=fixture();denied.halt.code='HTTP_403';assert.throws(()=>recoverGltfFormat(denied,'1690','exportPartStudioGltf'));
});