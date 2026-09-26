import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveDatums } from './derive-datums.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const prefix = 'trials/subsystem-ab/cots/';
const read = name => JSON.parse(readFileSync(join(root, name), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const save = (name, value) => writeFileSync(join(root, name), JSON.stringify(value, null, 2) + '\n');
const ledger = read('public-fetch-log.json');
const manifest = read('manifest.json');
const measured = read('geometry-validation-v2.json');
const resolved = read('resolved-sources.json');
const datums = deriveDatums(measured);
assert.equal(ledger.limit, 39);
assert.equal(ledger.requests.length, 39);
assert.equal(ledger.authenticated_calls, 0);
assert.deepEqual(ledger.requests.slice(0, 14), manifest.source_evidence.slice(0, 14));
for (const item of ledger.requests.filter(item => item.cache)) {
  const bytes = readFileSync(join(root, item.cache));
  assert.equal(hash(bytes), item.sha256, item.cache);
  assert.equal(bytes.length, item.bytes, item.cache);
}
const record = cache => {
  const found = ledger.requests.find(item => item.cache === cache && item.status === 200);
  assert.ok(found, `Missing successful source: ${cache}`);
  return found;
};
for (const item of ledger.requests.slice(14)) {
  if (item.status === 'attempted' && !item.cache) {
    item.status = 'INTERRUPTED_NO_RESPONSE';
    item.resolution = 'Shared terminal process ended before response recording; counted conservatively. A later separately counted request acquired the exact same source URL.';
  }
}
if (!manifest.phase_one_history) {
  manifest.phase_one_history = { schema_version: manifest.schema_version, status: manifest.status,
    public_attempts: 14, former_limit: manifest.public_fetch_limit, gates: structuredClone(manifest.gates),
    unresolved_at_that_time: manifest.unresolved, interventions: manifest.interventions,
    source_evidence_sha256: hash(Buffer.from(JSON.stringify(ledger.requests.slice(0, 14)))) };
}
manifest.phase_one_history.gates = {
  minimum_motor_source: 'BLOCKED', bearing_source: 'BLOCKED', gear_pair_sources: 'BLOCKED',
  compliant_wheel_source: 'PASS', wheel_variant_specific_model: 'UNVERIFIED',
  original_source_bytes: 'PASS', local_solid_import: 'PASS', native_onshape_import: 'UNVERIFIED',
  complete_subsystem_authentic_cots: 'BLOCKED', manufacturing_release: 'UNVERIFIED'
};
Object.assign(manifest, {
  schema_version: 2, status: 'PARTIAL_READY_X44_CORE', public_fetch_limit: 39,
  public_fetch_attempts: ledger.requests.length, original_public_attempts: 14,
  additional_public_attempts: ledger.requests.length - 14, additional_public_limit: 25,
  public_fetch_successes: ledger.requests.filter(item => item.status === 200).length,
  public_fetch_redirects: ledger.requests.filter(item => [301, 302, 303, 307, 308].includes(item.status)).length,
  public_fetch_failures: ledger.requests.filter(item => typeof item.status === 'number' && item.status >= 400).length,
  public_fetch_interrupted: ledger.requests.filter(item => item.status === 'INTERRUPTED_NO_RESPONSE').length,
  source_evidence: ledger.requests,
  source_policy: 'Anonymous manufacturer pages, explicit public asset links, and bounded public GitHub source inspection only. No credentials, cookies, Onshape requests, cloud extraction, remote macros, purchases or installs.',
  recovered_failures: [{ attempts: [11, 12], recovery_attempts: [15, 16], status: 'RESOLVED',
    evidence: 'Fresh original published CSV URL followed immediately to its Google Sheets content redirect returned HTTP 200. Original failure bytes and request records remain unchanged.',
    cause: 'Delay-sensitive redirect is consistent with observations; expiry was not independently proven.' }],
  interventions: ['Parent explicitly authorized 25 additional public attempts and zero authenticated requests.',
    'Shared terminal interference consumed attempts 23 and 25 without recorded responses; isolated local subprocesses then completed exact-source downloads. No other arm code was read or modified.',
    'CAD validation resumed by original-file hash after a time limit; no model healing, pruning, fusing or regeneration was used.']
});
for (const source of resolved.sources) {
  const product = manifest.products.find(item => item.id === source.id);
  const asset = record(source.cad_cache);
  const geometry = measured.assets[source.cad_cache];
  assert.equal(geometry.sha256, asset.sha256);
  const valid = geometry.status === 'PASS';
  const table = record(source.table_cache);
  const drawing = record(`cache/${source.sku.toLowerCase()}.pdf`);
  const label = geometry.hierarchy[0].name;
  const discoveryUrl = new URL(source.row.Onshape);
  assert.equal(discoveryUrl.hostname, 'cad.onshape.com');
  Object.assign(product, {
    status: valid ? 'PASS' : 'QUARANTINED_INVALID_TOPOLOGY', source_acquisition_status: 'ACQUIRED',
    source_version: `${label}; manufacturer STEP release number not separately established; original bytes pinned by SHA-256`,
    sha256: asset.sha256, cad_units: geometry.declared_length_units.join(', '),
    asset: { repository_path: prefix + source.cad_cache, source_url: source.cad_url, bytes: asset.bytes,
      sha256: asset.sha256, format: 'STEP', unchanged_vendor_bytes: true, configuration_specific: true },
    published_cad_table: { ...product.published_cad_table, status: 'PASS', cache: prefix + source.table_cache,
      sha256: table.sha256, csv_record_number: source.csv_record_number,
      url: ledger.requests.find(item => item.redirect === table.url)?.url ?? table.url,
      parser: resolved.parser, kind: 'Manufacturer explicitly published public CSV' },
    geometry_validation: { status: geometry.status, report: prefix + 'geometry-validation-v2.json', report_asset_key: source.cad_cache,
      root_count: geometry.root_count, leaf_definition_count: geometry.leaf_definition_count,
      leaf_occurrence_count: geometry.leaf_occurrence_count, solid_count: geometry.occurrence_solid_count,
      invalid_solid_indices: geometry.root_geometry[0].solids.filter(item => !item.valid).map(item => item.index),
      bounds_mm: geometry.root_geometry[0].bounds_mm, size_mm: geometry.root_geometry[0].size_mm,
      volume_mm3: geometry.root_geometry[0].volume_mm3,
      source_part_labels: Object.entries(geometry.definitions).map(([localLabel, part]) => ({ local_label: localLabel, name: part.name, solid_count: part.solid_count })),
      label_is_onshape_part_id: false,
      note: valid ? 'All source solids pass local BRepCheck and have positive finite volume.' : 'Original X60 source solid index 3 fails BRepCheck. Quarantined unchanged; excluded from allowed imports.' },
    attachment_points: valid ? datums.products[product.id] : null,
    native_discovery: { url: discoveryUrl.href, status: 'WORKSPACE_LINK_ONLY_NOT_IMMUTABLE',
      queried: false, version_id: null, part_id: null, configuration: null,
      caution: 'Published workspace URL is not a version-pinned native part reference or an insertion API.' },
    drawing: { repository_path: prefix + drawing.cache, source_url: source.drawing_url, sha256: drawing.sha256,
      units: 'inch with metric references', text_extracted_locally: true,
      visually_read: ['x44', 'hex_bearing', 'hex_output_gear'].includes(product.id),
      comparison: 'Dimensions are not automatically treated as equivalent across release dates. See measured attachment points and explicit discrepancies.' }
  });
}
const wheel = manifest.products.find(item => item.id === 'compliant_wheel');
wheel.source_acquisition_status = 'ACQUIRED';
wheel.geometry_validation.report = prefix + 'geometry-validation-v2.json';
wheel.geometry_validation.report_asset_key = 'cache/am-3462-rev2.step';
wheel.attachment_points.source_sha256 = wheel.sha256;
wheel.attachment_points.source_to_attachment = { convention: 'attachment_point = rotation * source_point + translation_mm',
  rotation: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], translation_mm: [0, 0, 0] };
wheel.attachment_points.rotation_description = 'Identity; source +Z is bore axis and source +X is a hex corner.';
const sqlBlob = read('cache/frcdesign-init-sql-blob.json');
const sqlBytes = Buffer.from(sqlBlob.content, 'base64');
assert.equal(createHash('sha1').update(`blob ${sqlBytes.length}\0`).update(sqlBytes).digest('hex'), sqlBlob.sha);
manifest.catalog.public_source_inspection = {
  repository_search: { source: record('cache/frcdesignlib-search.json').url,
    total_count: read('cache/frcdesignlib-search.json').total_count,
    conclusion: 'Exact repository-name search returned no result; does not prove the catalog has no differently named public repository.' },
  fixed_source_file: { path: 'drizzle/0000_init.sql', git_blob_sha: sqlBlob.sha,
    content_sha256: hash(sqlBytes), cache: prefix + 'cache/frcdesign-init-sql-blob.json',
    result: 'Public schema definitions inspected, no populated CAD database rows or complete versioned Onshape tuples found.' }
};
manifest.catalog.catalog_data_status = 'No immutable native part binding found in the bounded inspected public sources. Published WCP workspace links are retained per product as discovery only.';
const critical = ['x44', 'x60', 'hex_bearing', 'spline_pinion', 'hex_output_gear'];
const ready = manifest.products.filter(item => item.geometry_validation.status === 'PASS');
manifest.critical_part_completeness = {
  requested_product_ids: critical, authentic_source_files_acquired: 5, requested_source_files: 5,
  locally_validated_products: critical.filter(id => ready.some(item => item.id === id)),
  locally_validated_count: 4, all_requested_critical_parts: 'BLOCKED_X60_TOPOLOGY',
  minimum_priority_motor_and_bearing: 'PASS',
  x44_core: { status: 'PASS', products: ['x44', 'hex_bearing', 'spline_pinion', 'hex_output_gear'] },
  blocked_products: [{ id: 'x60', reason: 'Acquired original STEP contains an invalid solid; alternative vendor search did not expose an exact motor asset before the request cap.' }],
  meaning: 'Local source/solid readiness only. This does not integrate these parts into either design or replace the shared agent envelopes.'
};
Object.assign(manifest.gates, { minimum_motor_source: 'PASS', bearing_source: 'PASS', gear_pair_sources: 'PASS',
  original_source_bytes: 'PASS', local_solid_import: 'PARTIAL_5_OF_6', all_requested_critical_parts: 'BLOCKED_X60_TOPOLOGY',
  minimum_x44_core: 'PASS', complete_subsystem_authentic_cots: 'BLOCKED', native_onshape_import: 'UNVERIFIED',
  manufacturing_release: 'UNVERIFIED' });
manifest.interface_discrepancies = [
  { product: 'hex_bearing', nominal_bore_mm: 12.7, measured_bore_mm: 12.72,
    nominal_journal_od_mm: 28.575, measured_journal_od_mm: 28.5496,
    listed_width_mm: 7.9502, measured_width_mm: 7.9375, measured_flange_od_mm: 31.115,
    measured_flange_thickness_mm: 1.5875, conclusion: 'Preserve source fit geometry; drawing rounded nominal dimensions are not machining tolerances.' },
  { product: 'hex_output_gear', nominal_hex_mm: 12.7, measured_hex_mm: 12.8016,
    measured_tooth_face_width_mm: 9.525, measured_overall_width_mm: 12.6492,
    conclusion: 'Gear bore differs from bearing bore; source hex corner at 30 degrees is explicitly transformed.' },
  { product: 'x44', listed_body_length_mm: 75, drawing_body_length_mm: 74.61,
    measured_body_rear_z_mm: -74.6125, shaft_extension_from_mount_mm: datums.products.x44.shaft_extension_from_mount_mm,
    conclusion: 'Listed motor length is not total STEP envelope including shaft; retain the two source solids.' }
];
manifest.unresolved = [
  'X60 original STEP was acquired but one of its six solids is invalid. It remains quarantined, not missing and not a validated import candidate.',
  'Spline clocking/engagement, gear backlash and axial retention, bearing housing fit, dynamic clearances and physical assembly remain unvalidated.',
  'No native Onshape import, instance, versioned catalog part or supported catalog automation API was established; no Onshape call was made.',
  'The wheel remains generic am-3462 REV2 CAD paired with a REV3 drawing; exact green/35A geometry and revision equivalence remain unverified.',
  'No redistribution license or manufacturing/physical release was established. Shared design envelopes are unchanged; parent integration is still required.'
];
manifest.timing.last_public_attempt = ledger.requests.at(-1).requested_at;
manifest.timing.finalized_at = ledger.closed_at ?? new Date().toISOString();
manifest.timing.public_attempt_window_seconds = (Date.parse(manifest.timing.last_public_attempt) - Date.parse(manifest.timing.first_public_attempt)) / 1000;
const packet = {
  schema_version: 2, status: 'PARTIAL_READY_X44_CORE_X60_QUARANTINED', manifest: prefix + 'manifest.json',
  critical_part_completeness: manifest.critical_part_completeness,
  allowed_import_candidates: ready.map(product => {
    const cache = product.asset.repository_path.slice(prefix.length);
    const geometry = measured.assets[cache];
    assert.equal(geometry.status, 'PASS');
    assert.equal(geometry.sha256, product.sha256);
    return { product_id: product.id, sku: product.sku, path: product.asset.repository_path,
      source_url: product.asset.source_url, sha256: product.sha256, bytes: product.asset.bytes,
      multipart_filename: decodeURIComponent(new URL(product.asset.source_url).pathname.split('/').at(-1)),
      requires_binary_multipart: true, path_string_is_not_upload_bytes: true,
      expected_source_part_count: geometry.leaf_definition_count, expected_source_occurrence_count: geometry.leaf_occurrence_count,
      expected_source_solid_count: geometry.occurrence_solid_count, source_name: geometry.hierarchy[0].name,
      source_parts: Object.entries(geometry.definitions).map(([label, part]) => ({ local_xcaf_label: label, name: part.name, solid_count: part.solid_count })),
      source_units: geometry.declared_length_units[0].toLowerCase(), measurement_units: 'mm', source_frame: product.attachment_points,
      source_hierarchy_report: { path: prefix + 'geometry-validation-v2.json', asset_key: cache },
      preserve_source_hierarchy: true, fuse_or_flatten: false, native_source_reference: null, onshape_import_or_instance_ids: null,
      post_import_checks: ['Verify inch-to-mm conversion and valid imported solids.',
        'Preserve source names and hierarchy; a single source part may contain multiple solids, particularly the two-solid X44.',
        'Record actual native IDs returned by the parent import; XCAF labels are not Onshape IDs.',
        'Apply the recorded source-to-attachment transform; verify source hole/hex/spline clocking and all axial interfaces.',
        'Run real engagement, retention, interference and full motion checks after replacing the parent envelopes.'] };
  }),
  quarantined_assets: manifest.products.filter(item => item.status.startsWith('QUARANTINED')).map(item => ({
    product_id: item.id, path: item.asset.repository_path, sha256: item.sha256, reason: item.geometry_validation.note,
    allowed_for_import: false })),
  blocked_products: manifest.critical_part_completeness.blocked_products,
  execution: 'No cloud action authorized here. Parent integrates the validated local assets and replaces its own shared envelopes; this packet has not imported or placed parts in Onshape.'
};
ledger.phase_closed = true;
ledger.closed_at = manifest.timing.finalized_at;
ledger.close_reason = '25 additional public attempts exhausted; original 14 preserved. X44 core and wheel validated; X60 source acquired but quarantined for invalid topology. No further network requests permitted.';
save('attachment-points.json', datums);
save('public-fetch-log.json', ledger);
save('manifest.json', manifest);
save('import-packet.json', packet);
const reportRows = manifest.products.map(product => {
  const geometry = measured.assets[product.asset.repository_path.slice(prefix.length)];
  return `| ${product.sku} | ${product.id} | [STEP](${product.asset.source_url}) / [drawing](${product.drawing.source_url}) | ${geometry.declared_length_units.join(', ')} | ${geometry.leaf_definition_count} / ${geometry.occurrence_solid_count} | ${product.status} |`;
}).join('\n');
const hashes = manifest.products.map(product => `| ${product.sku} | ${product.sha256} |`).join('\n');
writeFileSync(join(root, 'REPORT.md'), `# Public COTS Source Packet v2

## Result

The X44, WCP-0783 bearing, WCP-1016 pinion, WCP-0137 output gear, and existing AndyMark wheel pass local solid validation. X60 CAD was acquired, but solid index 3 of its six source solids fails OpenCascade BRepCheck. That original file is quarantined and excluded from imports. All five requested critical source files exist; four pass topology validation. The X44-based core is ready for parent integration, not manufacturing release.

## Budget and Recovery

- Original public attempts preserved: 14. Additional attempts: 25 of 25. Total: 39 of 39. Phase closed.
- HTTP 200 responses: ${manifest.public_fetch_successes}; redirects: ${manifest.public_fetch_redirects}; HTTP failures: ${manifest.public_fetch_failures}; interrupted/no-response attempts: ${manifest.public_fetch_interrupted}.
- Authenticated/Onshape calls: 0. No cookies, credentials, Playwright, extraction service, installs, purchases or remote macros.
- Original CSV failure at attempts 11-12 remains in history. A fresh request followed immediately succeeded at attempts 15-16. Bearing and gear tables also succeeded. Redirect expiry is plausible, not proven.
- Attempts 23 and 25 were interrupted by shared-terminal interference. They remain counted; later exact-URL downloads succeeded through isolated local processes.

## CAD Source Map

| SKU | Product | Original manufacturer sources | STEP units | Named definitions / solids | Local status |
| --- | --- | --- | --- | --- | --- |
${reportRows}

All measurements are millimetres after declared INCH conversion. Source files remain byte-for-byte unchanged. Each source has one named XCAF definition; X44 contains two solids and X60 six. Names and full hierarchy are retained in [geometry-validation-v2.json](geometry-validation-v2.json). Local labels are not Onshape IDs.

## Interfaces

- X44: mounting face at source Z=0; +Z points along the shaft. Pilot diameter 19.05 mm, eleven holes on a 34.925 mm bolt circle; missing hole at 270 degrees from source +X. Drawing calls out #10-32 UNF mounting threads, 6.35 mm deep, and a 9.525 mm-deep shaft-end thread. Spline shoulder Z=5.55625 mm; tip Z=37.35705 mm. Preserve both solids and the actual spline.
- Bearing: source axis +Y; flange underside Y=6.35 mm. Rotate +90 degrees about X and translate attachment Z by -6.35 mm. Actual bore 12.72 mm hex, journal OD 28.5496 mm, flange OD 31.115 mm, total width 7.9375 mm and flange thickness 1.5875 mm. These differ from rounded nominal drawing dimensions; no fit tolerance is approved.
- Pinion: source axis +Z, midplane Z=0; end planes +/-9.525 mm. CAD has 16 tooth-tip faces and the original SplineXS bore, not a circular replacement. Spline engagement/clocking remains unvalidated.
- Output gear: 48 tooth-tip faces; source axis +Z, tooth face width 9.525 mm, overall width 12.6492 mm. Actual hex is 12.8016 mm across flats. Rotate -30 degrees about Z to align its measured hex corner with attachment +X.
- Wheel: unchanged REV2 single solid, intentionally undersized 10.795 mm hex bore and 12.7 mm width. The published REV3 drawing and selected green/35A variant remain distinct; no revision or variant equivalence is asserted.

Face indices and transforms are in [attachment-points.json](attachment-points.json), bound to exact source hashes. They are measured local datums, not native mate connectors. Axial retention, spline engagement, backlash, bearing housing fit, dynamic interference and motion clearance are parent checks.

## Catalog and Documentation

Published WCP tables supply live Onshape workspace links, not immutable version/part/configuration tuples. Those links are retained as discovery only and were never queried. The bounded FRCDesignLib repository-name search returned zero results. The observed FRCDesignApp tree, README and fixed initial SQL schema were inspected; the schema contains no populated CAD rows or exact native bindings. This does not prove a differently named public catalog is absent. The subscribed app/library was not accessed. Public GitBook documentation was read without dynamic query services; inspected pages supplied no alternate solid asset. AndyMark searches did not expose an exact X60 motor CAD link.

## Deliverables and Parent Boundary

[manifest.json](manifest.json) contains schema-v2 completeness, provenance, acquisition history and quarantine status. [import-packet.json](import-packet.json) contains five permitted local import candidates with original binary paths, hashes, inch units, names, solid counts and source frames. [resolved-sources.json](resolved-sources.json) retains exact CSV records parsed with Python csv.DictReader. [public-fetch-log.json](public-fetch-log.json) is the closed request ledger. Shared-agent envelopes and other arm code were not modified. Parent integration and any later cloud action are separate work.

Cached vendor assets are ignored by git; redistribution permission is not established. No native import, mechanical assembly, physical testing or manufacturing release occurred.

## Source STEP Hashes

| SKU | SHA-256 |
| --- | --- |
${hashes}

## Local Checks

Run node --test bindings.test.mjs public-fetch.test.mjs datums.test.mjs from this directory. Run test_assets.py with the existing CAD Python environment for parser, units, nested assembly and multibody tests. validate_assets.py --all intentionally exits 1 while the original X60 remains invalid; its complete report records five PASS assets and one FAIL. The packet must not promote that source to import-ready.
`, 'utf8');
console.log(JSON.stringify({ status: manifest.status, schema_version: 2, public_attempts: ledger.requests.length,
  additional_public_attempts: 25, authenticated_calls: 0, acquired_step_files: 6,
  import_ready_products: packet.allowed_import_candidates.map(item => item.product_id), quarantined: ['x60'] }));