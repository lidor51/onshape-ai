import test from 'node:test';
import assert from 'node:assert/strict';
import {retryRequest,retry1778,permitBlobAfterServerError,retryPrefix} from './retry-1778.mjs';
import {loadSchema} from '../../trials/subsystem-ab/api/schema.mjs';

test('authorized diagnostic reads only the released 1778 workspace without mutation',()=>{
  const request=retryRequest(loadSchema());assert.equal(request.method,'GET');assert.equal(request.body,undefined);
  assert.ok(request.path.includes('/d/07beed2a16f5d7898cc42c9c/w/a74e4d796ba952dabae8ff7e/e/42c6b0e68334934d197bf369'));
  assert.ok(request.path.includes('includeMateFeatures=false'));
});
test('retry requires the new explicit user authorization before opening credentials or ledger',async()=>{
  await assert.rejects(retry1778([]),/RETRY_APPROVAL_REQUIRED/);
});

test('blob diagnostic is bounded to the observed public element and a classified read-only error',()=>{
  const request=retryRequest(loadSchema(),'blob');assert.equal(request.method,'GET');assert.ok(request.path.includes('/e/9f0878ee196d31c4be012b8b'));
  const fixture=()=>({attempts:[{sequence:42,method:'GET',key:`${retryPrefix}-workspace-definition`}],halt:{sequence:42,code:'HTTP_500'}});
  const data=fixture();permitBlobAfterServerError(data);assert.equal(data.halt,undefined);assert.equal(data.retry1778BlobDiagnostic.sequence,42);
  const denied=fixture();denied.halt.code='HTTP_403';assert.throws(()=>permitBlobAfterServerError(denied));
});