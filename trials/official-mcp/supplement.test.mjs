import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { TARGET, measurementScript } from './supplement-policy.mjs';
import { newLedger, transport, decodeFs, featureSnapshot, measuredModel, capture } from './supplement.mjs';
import { assertionModel, loadLocalFixture } from './generate.mjs';
import { validateMeasurements } from './final-measurements.mjs';

const snapshot = { sourceMicroversion: 'a'.repeat(24), features: [{ featureId: TARGET.featureId, namespace: TARGET.namespace,
  featureType: 'officialIntakeFinal', name: 'OfficialIntakeFinal', suppressed: false }], featureStates: { [TARGET.featureId]: { featureStatus: 'OK' } } };
const credentials = { accessKey: 'synthetic-access-key', secretKey: 'synthetic-secret-key' };
const save = async (file, bytes) => ({ file, bytes: bytes.length });

test('source guard: runtime reads current credentials without logging them, no modeling or credential exports', async () => {
  const source = await readFile(new URL('./supplement.mjs', import.meta.url), 'utf8');
  assert.ok(source.includes("authorize(process.argv.slice(2))"));
  assert.ok(source.indexOf('authorize(process.argv.slice(2))') < source.indexOf('parseEnv(await readFile'));
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:credentials|env\.|signature|headers)/);
  assert.doesNotMatch(source, /managed-discovery\.json|setProperty\(|opBoolean\(|create_geometry|put_featurescript/);
  assert.ok(source.includes("open(lockPath, 'wx')"));
  assert.ok(source.includes('PHASE_ALREADY_STARTED_NEVER_RESET'));
});

test('transport checkpoints before dispatch, permits only observed snapshots, does not log auth', async () => {
  const ledger = newLedger();
  let checkpoints = 0;
  let calls = 0;
  const request = transport({ credentials, ledger, phase: 'baseline', checkpoint: async () => { checkpoints++; }, save,
    fetchImpl: async (url, options) => {
      calls++;
      assert.ok(checkpoints > 0);
      assert.equal(ledger.requests.length, calls);
      assert.equal(options.redirect, 'manual');
      assert.equal(options.credentials, 'omit');
      assert.equal(new URL(url).origin, 'https://cad.onshape.com');
      if (options.method === 'POST') assert.equal(JSON.parse(options.body).script, measurementScript());
      return Response.json(snapshot);
    } });
  await assert.rejects(() => request('measure', { microversion: snapshot.sourceMicroversion }), /UNOBSERVED/);
  await request('features');
  await request('measure', { microversion: snapshot.sourceMicroversion });
  await assert.rejects(() => request('poll', { translationId: 'b'.repeat(24) }), /UNOBSERVED/);
  await assert.rejects(() => request('download', { externalDataId: 'c'.repeat(24) }), /UNOBSERVED/);
  assert.equal(calls, 2);
  assert.doesNotMatch(JSON.stringify(ledger), /synthetic-access|synthetic-secret|Authorization|HmacSHA256/);
});

test('redirects, transport failures and echoed secrets cannot leak, retry or evade request counting', async () => {
  for (const mode of ['redirect', 'throw', 'echo']) {
    const ledger = newLedger();
    let calls = 0;
    let saves = 0;
    const request = transport({ credentials, ledger, phase: 'baseline', checkpoint: async () => {},
      save: async () => { saves++; }, fetchImpl: async () => {
        calls++;
        if (mode === 'throw') throw new Error(credentials.secretKey);
        if (mode === 'redirect') return new Response(null, { status: 302, headers: { Location: 'https://example.invalid' } });
        return Response.json({ echo: credentials.secretKey });
      } });
    await assert.rejects(() => request('features'), /REDIRECT_DENIED|SUPPLEMENT_FAILED|RESPONSE_CONTAINS_CREDENTIAL_BYTES/);
    assert.equal(calls, 1);
    assert.equal(saves, 0);
    assert.equal(ledger.requests.length, 1);
    assert.doesNotMatch(JSON.stringify(ledger), /synthetic-secret/);
  }
});

test('typed JSON decoder preserves numeric geometry and rejects unknown types and duplicate keys', () => {
  const entry = { key: { type: 'BTFSValueString', value: 'partCount' }, value: { type: 'BTFSValueNumber', value: 9 } };
  assert.deepEqual(decodeFs({ type: 'BTFSValueMap', value: [entry] }), { partCount: 9 });
  assert.throws(() => decodeFs({ type: 'BTFSValueMap', value: [entry, entry] }), /KEY_INVALID/);
  assert.throws(() => decodeFs({ type: 'unexpected' }), /TYPE_UNRECOGNIZED/);
  assert.throws(() => measuredModel({ result: {}, notices: [{ severity: 'ERROR' }] }), /NOT_CONFIRMED/);
});

test('feature snapshot requires actual retained feature ID, namespace, microversion and OK state', () => {
  assert.equal(featureSnapshot(snapshot, 'baseline').microversion, snapshot.sourceMicroversion);
  assert.throws(() => featureSnapshot({ ...snapshot, features: [] }, 'baseline'), /NOT_FOUND/);
  assert.throws(() => featureSnapshot({ ...snapshot, sourceMicroversion: undefined }, 'baseline'), /SCHEMA/);
  assert.throws(() => featureSnapshot({ ...snapshot, featureStates: {} }, 'baseline'), /NOT_OK/);
});

test('saved live legacy feature envelope is decoded locally without a repeated request', async () => {
  const actual = JSON.parse(await readFile(new URL('./artifacts/readonly-supplement/baseline-01-features.json', import.meta.url), 'utf8'));
  const verified = featureSnapshot(actual, 'baseline');
  assert.equal(verified.featureId, TARGET.featureId);
  assert.equal(verified.namespace, TARGET.namespace);
  assert.equal(verified.state.featureStatus, 'OK');
  const bytes = Buffer.from(JSON.stringify(actual));
  const entry = { sequence: 1, phase: 'baseline', method: 'GET',
    url: `https://cad.onshape.com/api/partstudios/d/${TARGET.did}/w/${TARGET.wid}/e/${TARGET.eid}/features`,
    status: 200, contentType: 'application/json' };
  const ledger = { ...newLedger(), requests: [entry] };
  const request = transport({ credentials, ledger, phase: 'baseline', checkpoint: async () => {}, save,
    fetchImpl: async () => assert.fail('No live request allowed'), replay: [{ entry, bytes }] });
  assert.deepEqual(await request('features'), actual);
  assert.equal(ledger.requests.length, 1);
  assert.ok(entry.replayedSuccessfullyAt);
  assert.deepEqual(decodeFs({ type: 123, typeName: 'BTFSValueMap', message: { value: [
    { key: { type: 1, typeName: 'BTFSValueString', message: { value: 'count' } }, value: { type: 2, typeName: 'BTFSValueNumber', message: { value: 9 } } },
  ] } }), { count: 9 });
});

test('saved live legacy measurement map entries pass complete geometry and BOM validation locally', async () => {
  const response = JSON.parse(await readFile(new URL('./artifacts/readonly-supplement/baseline-04-measure.json', import.meta.url), 'utf8'));
  const measured = measuredModel(response);
  const { task } = await loadLocalFixture();
  const validation = validateMeasurements(measured, task, 'baseline');
  assert.equal(validation.status, 'PASS_MEASUREMENTS_ONLY');
  assert.equal(validation.partCount, 9);
  assert.deepEqual(validation.holesPerPlate, [5, 5]);
  assert.deepEqual(measured.parts.filter(part => part.excludeFromBOM).map(part => part.name), ['coralReference']);
});

test('synthetic full capture fits twelve requests with three polls and unchanged snapshot; no files saved', async () => {
  const { task } = await loadLocalFixture();
  const expected = assertionModel(task);
  const parts = expected.parts.map(part => ({ ...part, name: part.role, solidCount: 1,
    excludeFromBOM: part.role === 'coralReference', cylinders: part.cylinders.map(cylinder => ({
      radiusMm: cylinder.radiusMm, axisOriginMm: [0, ...cylinder.centerYZMm], axisDirection: [1, 0, 0],
      minMm: [part.minMm[0], ...cylinder.centerYZMm.map(value => value - cylinder.radiusMm)],
      maxMm: [part.maxMm[0], ...cylinder.centerYZMm.map(value => value + cylinder.radiusMm)],
    })) }));
  const image = Buffer.alloc(128);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(image);
  image.writeUInt32BE(1200, 16);
  image.writeUInt32BE(900, 20);
  const translationId = 'b'.repeat(24);
  const externalDataId = 'c'.repeat(24);
  let polls = 0;
  const ledger = newLedger();
  const report = {};
  const localSource = 'synthetic-local-source-not-live';
  const request = transport({ credentials, ledger, phase: 'baseline', checkpoint: async () => {}, save,
    fetchImpl: async url => {
      if (url.endsWith('/features')) return Response.json(snapshot);
      if (url.includes('/featurestudios/')) return Response.json({ contents: localSource });
      if (url.includes('/api/parts/')) return Response.json(parts.map((part, index) => ({ name: part.name, partId: `synthetic-${index}` })));
      if (url.endsWith('/featurescript')) return Response.json({ notices: [], result: { partCount: 9, allSolidCount: 9, parts } });
      if (url.includes('/shadedviews?')) return Response.json({ images: [image.toString('base64')] });
      if (url.endsWith('/export/step')) return Response.json({ id: translationId, requestState: 'ACTIVE' });
      if (url.includes('/api/translations/')) return Response.json({ id: translationId, requestState: ++polls === 3 ? 'DONE' : 'ACTIVE', resultExternalDataIds: [externalDataId] });
      if (url.includes('/externaldata/')) return new Response('ISO-10303-21;\nSYNTHETIC_NOT_GEOMETRY\nEND-ISO-10303-21;');
      assert.fail('Unexpected request');
    } });
  await capture({ phase: 'baseline', request, save, task, localSource, report, wait: async () => {} });
  assert.equal(report.status, 'PASS_BASELINE');
  assert.equal(ledger.requests.length, 12);
  assert.equal(polls, 3);
  assert.equal(report.validation.persistedGeometryVerified, true);
  assert.equal(report.bom.filter(part => part.excludeFromBOM).length, 1);
});