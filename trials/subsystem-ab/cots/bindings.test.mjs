import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { fetchPublic, validateUrl } from './public-fetch.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const read = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = read('manifest.json');
const packet = read('import-packet.json');
const ledger = read('public-fetch-log.json');

test('source bytes match recorded hashes without rereading out-of-scope candidate inputs', () => {
  assert.match(manifest.source_input_sha256, /^[a-f0-9]{64}$/);
  for (const source of manifest.source_evidence.filter(source => source.cache)) {
    const bytes = readFileSync(join(root, source.cache));
    assert.equal(sha256(bytes), source.sha256, source.cache);
    assert.equal(bytes.length, source.bytes, source.cache);
  }
  assert.ok(readFileSync(join(root, '.gitignore'), 'utf8').includes('/cache/'));
});

test('closed phase cannot make a fortieth request or silently resume research', async () => {
  assert.equal(manifest.authenticated_calls, 0);
  assert.equal(ledger.authenticated_calls, 0);
  assert.equal(ledger.requests.length, 39);
  assert.equal(manifest.additional_public_attempts, 25);
  assert.equal(manifest.schema_version, 2);
  assert.equal(packet.schema_version, 2);
  assert.ok(ledger.requests.length <= ledger.limit);
  assert.equal(ledger.phase_closed, true);
  const before = readFileSync(join(root, 'public-fetch-log.json'), 'utf8');
  await assert.rejects(fetchPublic('https://wcproducts.com/products/kraken', 'must-not-fetch.html'), /phase is closed/);
  assert.equal(readFileSync(join(root, 'public-fetch-log.json'), 'utf8'), before);
  assert.equal(existsSync(join(root, 'cache/must-not-fetch.html')), false);
});

test('Onshape, credentials, private sheets, foreign buckets and executables remain rejected', async () => {
  for (const url of ['https://cad.onshape.com/documents/test', 'http://wcproducts.com/a',
    'https://user:password@wcproducts.com/a', 'https://wcproducts.com/a.exe',
    'https://docs.google.com/spreadsheets/d/private/edit', 'https://s3.amazonaws.com/other/a.step',
    'https://unapproved.googleusercontent.com/a']) assert.throws(() => validateUrl(url));
  await assert.rejects(fetchPublic('https://wcproducts.com/a', '../outside.step'));
});

test('X44 core is ready while invalid X60 stays quarantined and native IDs stay unknown', () => {
  assert.equal(manifest.status, 'PARTIAL_READY_X44_CORE');
  assert.equal(manifest.gates.minimum_motor_source, 'PASS');
  assert.equal(manifest.gates.bearing_source, 'PASS');
  assert.equal(manifest.gates.gear_pair_sources, 'PASS');
  assert.equal(manifest.gates.complete_subsystem_authentic_cots, 'BLOCKED');
  assert.equal(manifest.critical_part_completeness.authentic_source_files_acquired, 5);
  assert.equal(manifest.critical_part_completeness.locally_validated_count, 4);
  const quarantined = manifest.products.find(product => product.id === 'x60');
  assert.equal(quarantined.status, 'QUARANTINED_INVALID_TOPOLOGY');
  assert.equal(quarantined.attachment_points, null);
  assert.deepEqual(quarantined.geometry_validation.invalid_solid_indices, [3]);
  assert.ok(!packet.allowed_import_candidates.some(product => product.product_id === 'x60'));
  assert.equal(manifest.recovered_failures[0].status, 'RESOLVED');
  assert.equal(manifest.phase_one_history.gates.minimum_motor_source, 'BLOCKED');
  assert.equal(manifest.phase_one_history.source_evidence_sha256, sha256(Buffer.from(JSON.stringify(ledger.requests.slice(0, 14)))));
  for (const product of manifest.products) {
    assert.ok(Object.values(product.native_reference).every(value => value === null));
  }
  assert.deepEqual(manifest.catalog.native_references, []);
  assert.equal(manifest.catalog.public_automation_api, 'NOT_ESTABLISHED');
});

test('binary import packet binds the original STEP and retains source identity', () => {
  assert.equal(packet.allowed_import_candidates.length, 5);
  const measurements = read('geometry-validation-v2.json').assets;
  for (const asset of packet.allowed_import_candidates) {
    const cache = asset.path.replace('trials/subsystem-ab/cots/', '');
    assert.equal(sha256(readFileSync(join(root, cache))), asset.sha256);
    assert.equal(asset.requires_binary_multipart, true);
    assert.equal(asset.fuse_or_flatten, false);
    assert.equal(asset.preserve_source_hierarchy, true);
    assert.equal(asset.expected_source_part_count, 1);
    assert.equal(asset.expected_source_solid_count, asset.product_id === 'x44' ? 2 : 1);
    const validation = measurements[cache];
    assert.equal(validation.sha256, asset.sha256);
    assert.equal(validation.status, 'PASS');
    assert.equal(validation.hierarchy[0].name, asset.source_name);
    assert.deepEqual(validation.declared_length_units, ['INCH']);
    assert.equal(validation.transfer_system_length_unit_mm, 1);
    assert.equal(asset.source_frame.source_sha256, asset.sha256);
    assert.equal(asset.source_frame.source_to_attachment.rotation.length, 3);
  }
});

test('drawing revisions, compliant bore and SKU-specific gaps remain explicit', () => {
  const wheel = manifest.products.find(product => product.id === 'compliant_wheel');
  assert.equal(wheel.selected_variant.sku, 'am-3462_green');
  assert.equal(wheel.selected_variant.id, '44493390807212');
  assert.equal(wheel.asset.configuration_specific, false);
  assert.equal(wheel.drawing.revision, '3');
  assert.ok(wheel.source_version.includes('REV2'));
  assert.equal(wheel.attachment_points.bore_across_flats_mm, 10.795);
  assert.equal(wheel.drawing.specifications.hex_across_flats_in * 25.4, 10.795);
  assert.equal(manifest.cache_policy.redistribution_permission, 'NOT_ESTABLISHED');
  assert.equal(manifest.gates.native_onshape_import, 'UNVERIFIED');
});

test('report local links resolve inside the repository', () => {
  const text = readFileSync(join(root, 'REPORT.md'), 'utf8');
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (!match[1].startsWith('https://')) assert.ok(existsSync(resolve(root, match[1])), match[1]);
  }
});