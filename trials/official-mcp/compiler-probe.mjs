import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { compactFeatureScript, featureSource, loadLocalFixture, sha256 } from './generate.mjs';

function fragment(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0 || source.indexOf(start, startIndex + start.length) >= 0) {
    throw new Error(`Ambiguous compiler probe boundary: ${start}`);
  }
  return source.slice(startIndex, endIndex);
}

export function compilerProbeSource(task) {
  const source = featureSource(task);
  const primitives = fragment(source, 'FeatureScript ', 'function drilledPlate');
  const near = fragment(source, 'function officialIntakeNear(', '  function officialIntakeAssert(');
  const precondition = fragment(source, 'export const officialIntake = defineFeature(', '        const halfWidth')
    .replace('export const officialIntake', 'const officialIntake');
  const defaults = `{ "innerWidth" : ${task.baseline.innerWidthMm} * millimeter,
    "rollerGap" : ${task.baseline.rollerGapMm} * millimeter,
    "plateThickness" : ${task.baseline.plateThicknessMm} * millimeter }`;
  const probe = compactFeatureScript(`${primitives}
${near}
function inputs() returns map { return {}; }
${precondition}
    qBodyType(qNothing(), BodyType.SOLID);
}, ${defaults});
annotation { "Feature Type Name" : "PROBE" }
export const probe = defineFeature(function(context is Context, id is Id, definition is map)
precondition {}
{
  officialIntake(context, id + "probe", inputs());
  println("OFFICIAL_DECL_OK");
}, {});
annotation { "Feature Type Name" : "PROBE2" }
export const probe2 = defineFeature(function(context is Context, id is Id, definition is map)
precondition {} { }, {});
`);
  if (probe.length > 2000) throw new Error(`Compiler probe exceeds 2000 characters: ${probe.length}`);
  return probe;
}

export async function generateCompilerProbe() {
  const { task } = await loadLocalFixture();
  const source = compilerProbeSource(task);
  const sourcePath = new URL('./artifacts/compiler-declaration-probe.fs', import.meta.url);
  const payloadPath = new URL('./artifacts/compiler-declaration-probe.payload.json', import.meta.url);
  await writeFile(sourcePath, source);
  await writeFile(payloadPath, `${JSON.stringify({ code: source })}\n`);
  console.log(JSON.stringify({ sourceCharacters: source.length, sourceSha256: sha256(source),
    status: 'AWAITING_PARENT_COMPILER_PROBE_NOT_A_PRODUCTION_REPAIR', compilerExecuted: false,
    authenticatedRequests: 0, productionSourceChanged: false }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generateCompilerProbe();