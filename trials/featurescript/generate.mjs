import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { configuration, expectations } from './geometry.mjs';

export function featureCall(benchmark, variant, namespace, featureId) {
  const values = configuration(benchmark, variant);
  return {
    btType: 'BTFeatureDefinitionCall-1406',
    feature: {
      btType: 'BTMFeature-134', featureType: 'coralGroundIntake',
      name: 'FRC coral ground intake', namespace, suppressed: false,
      ...(featureId ? { featureId } : {}),
      parameters: [
        { btType: 'BTMParameterQuantity-147', parameterId: 'innerWidth', expression: `${values.innerWidthMm} mm`, isInteger: false },
        { btType: 'BTMParameterQuantity-147', parameterId: 'rollerGap', expression: `${values.rollerGapMm} mm`, isInteger: false },
      ],
    },
  };
}

export async function generate() {
  const benchmark = JSON.parse(await readFile(new URL('../../benchmark/intake.json', import.meta.url), 'utf8'));
  const source = await readFile(new URL('./intake.fs', import.meta.url), 'utf8');
  const sourceSha256 = createHash('sha256').update(source).digest('hex');
  const directory = new URL('./artifacts/', import.meta.url);
  await mkdir(directory, { recursive: true });
  for (const variant of ['baseline', 'revision']) {
    const artifact = {
      ...expectations(benchmark, variant), source: '../intake.fs', sourceSha256,
      compilation: 'NOT_RUN',
      featureCallTemplate: featureCall(benchmark, variant, '<namespace returned by version-pinned feature specs>', variant === 'revision' ? '<same featureId returned on baseline insertion>' : undefined),
    };
    await writeFile(new URL(`${variant}.json`, directory), `${JSON.stringify(artifact, null, 2)}\n`);
  }
  return { artifacts: ['artifacts/baseline.json', 'artifacts/revision.json'], sourceSha256, evidence: 'Offline analytic and request contracts only' };
}

if (import.meta.main) console.log(JSON.stringify(await generate(), null, 2));