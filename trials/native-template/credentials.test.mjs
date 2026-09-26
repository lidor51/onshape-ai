import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCredentials, safeEvidence } from './credentials.mjs';

test('runtime-only env parser checks origin and does not expose failures', () => {
  const values = 'ONSHAPE_ACCESS_KEY=fixture-access\nONSHAPE_SECRET_KEY=fixture-secret\nONSHAPE_BASE_URL=https://cad.onshape.com';
  const credentials = loadCredentials('https://cad.onshape.com', () => values);
  assert.equal(credentials.accessKey, 'fixture-access');
  assert.throws(() => loadCredentials('https://other.onshape.com', () => values), /^Error: CREDENTIAL_FILE_OR_ORIGIN_INVALID$/);
  assert.throws(() => loadCredentials('https://cad.onshape.com', () => { throw new Error(values); }), /^Error: CREDENTIAL_FILE_OR_ORIGIN_INVALID$/);
  const safe = safeEvidence({ message: values, headers: { secret: values }, data: 'fixture-secret fixture-access', status: 'OK' }, credentials);
  assert.deepEqual(safe, { data: '[REDACTED] [REDACTED]', status: 'OK' });
});