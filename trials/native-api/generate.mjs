import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildPlan, revisionChanges } from './model.mjs';

export const trialDirectory = new URL('./', import.meta.url);
export const specUrl = new URL('../../benchmark/intake.json', import.meta.url);

export async function generate() {
  const spec = JSON.parse(await readFile(specUrl, 'utf8'));
  const baseline = buildPlan(spec);
  const revision = buildPlan(spec, 'revision');
  const directory = new URL('artifacts/', trialDirectory);
  await mkdir(directory, { recursive: true });
  for (const plan of [baseline, revision]) {
    await writeFile(new URL(`${plan.stage}.json`, directory), `${JSON.stringify(plan, null, 2)}\n`);
  }
  const changes = revisionChanges(baseline, revision);
  await writeFile(new URL('revision-updates.json', directory), `${JSON.stringify({
    evidence: 'OFFLINE_UPDATE_TEMPLATES_NOT_EXECUTED',
    method: 'POST', endpointTemplate: '/api/v9/partstudios/d/{newDid}/w/{newWid}/e/{newEid}/features/featureid/{existingFid}',
    updates: changes.map(entry => ({ key: entry.key, body: { btType: 'BTFeatureDefinitionCall-1406', feature: { ...entry.feature, featureId: `$feature:${entry.key}` } } })),
  }, null, 2)}\n`);
  return { baseline, revision };
}

if (import.meta.main) {
  if (process.argv.length !== 2) throw new Error('generate.mjs accepts no arguments');
  await generate();
  console.log('Generated offline baseline, revision, and revision-updates JSON in trials/native-api/artifacts/. No network or credentials used.');
}