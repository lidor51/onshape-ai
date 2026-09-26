import { readFileSync, readdirSync } from 'node:fs';
import { hash, applyPatch, planPatch } from './patch.mjs';
import { measure, parameters } from './model.mjs';
import { stages } from './native.mjs';

export function bindings() {
  const directory = new URL('./', import.meta.url);
  const files = readdirSync(directory).filter(name => /\.mjs$/.test(name)).sort();
  const digest = names => hash(names.map(name => [name, readFileSync(new URL(name, directory), 'utf8')]));
  return { sourceHash: hash({ code: digest(files.filter(name => !name.endsWith('.test.mjs'))),
    benchmark: readFileSync(new URL('../../benchmark/intake.json', directory), 'utf8'),
    schema: readFileSync(new URL('./sources/openapi-contract.json', directory), 'utf8') }),
    testHash: digest(files.filter(name => name.endsWith('.test.mjs'))) };
}

export function checkBundle(bundle) {
  const expected = stages();
  if (hash(bundle) !== hash(expected)) throw new Error('CANDIDATE_OR_DEPENDENCY_MISMATCH');
  const measures = Object.fromEntries(['baseline', 'templatecopy', 'simulatededitor', 'revision']
    .map(name => [name, measure(bundle[name].parameters)]));
  const applied = applyPatch(bundle.snapshot, bundle.patch);
  if (hash(applied.features) !== hash(bundle.revision.features)) throw new Error('PRESERVATION');
  return measures;
}

export function preflight(bundle, tests, currentBindings = bindings()) {
  if (tests.status !== 'PASS' || tests.testHash !== currentBindings.testHash ||
    tests.sourceHash !== currentBindings.sourceHash) throw new Error('TEST_EVIDENCE_STALE');
  return { status: 'PASS', scope: 'arithmetic, native source and simulated patch only; not CAD',
    ...currentBindings, testsHash: hash(tests), candidateHash: hash(bundle),
    parameterHash: hash(['baseline', 'templatecopy', 'simulatededitor', 'revision'].map(name => bundle[name].parameters)),
    patchHash: hash(bundle.patch), snapshotHash: hash(bundle.snapshot), measurements: checkBundle(bundle) };
}

export function assertPreflight(report, bundle, tests, currentBindings = bindings()) {
  if (hash(report) !== hash(preflight(bundle, tests, currentBindings))) throw new Error('PREFLIGHT_STALE');
}

export function revisionPreflight(current, cached, values, expectedParameters) {
  measure(expectedParameters);
  if (values.innerWidth !== expectedParameters.innerWidth || values.rollerGap !== expectedParameters.rollerGap) throw new Error('PATCH_PARAMETER_MISMATCH');
  const patch = planPatch(cached, values);
  const after = applyPatch(current, patch);
  for (const name of Object.keys(parameters()).filter(name => !['units', 'downstream'].includes(name))) {
    const matches = after.features.filter(feature => feature.featureType === 'assignVariable' &&
      feature.parameters.find(parameter => parameter.parameterId === 'name')?.value === name);
    const expression = matches[0]?.parameters.find(parameter => parameter.parameterId === 'value')?.expression;
    if (matches.length !== 1 || expression !== `${expectedParameters[name]} mm`) throw new Error('CACHED_CONTROL_PARAMETER_MISMATCH');
  }
  return { status: 'PASS', candidateHash: hash(expectedParameters), snapshotHash: hash(current),
    patchHash: hash(patch), afterHash: hash(after), patch };
}

export async function guardedRevision(current, cached, values, expectedParameters, transport) {
  const report = revisionPreflight(current, cached, values, expectedParameters);
  return transport(report.patch);
}