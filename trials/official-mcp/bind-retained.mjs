import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { sha256 } from './generate.mjs';

const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/.test(value);

export function retainedReadbackPayload(identity, discovery) {
  if (!['PUBLIC_MANAGED_DOCUMENTS_IDENTIFIED', 'PUBLIC_MANAGED_WORKSPACE_IDENTIFIED_NOTES_ABSENT'].includes(discovery.status)) {
    throw new Error('Public managed discovery is required');
  }
  const workspace = discovery.documents.filter(document => document.name === 'FeatureScript MCP Workspace');
  if (workspace.length !== 1 || workspace[0].isPublic !== true) throw new Error('Public managed Workspace is ambiguous');
  if (!['did', 'wid', 'featureStudioEid', 'partStudioEid'].every(key => validId(identity[key]))) throw new Error('Missing retained identifiers');
  if (identity.did !== workspace[0].id || identity.wid === workspace[0].defaultWorkspaceId || identity.featureStudioEid === identity.partStudioEid) {
    throw new Error('Retained target is not the newly branched managed sandbox');
  }
  if (!/^[A-Za-z0-9_.-]{1,256}$/.test(identity.featureId ?? '') || identity.parentValidatedCreateResponse !== true ||
      identity.parentValidatedSelfTest !== true || identity.clean !== false) throw new Error('Parent response validation is required');
  return { did: identity.did, wvm: 'w', wvmid: identity.wid, eid: identity.featureStudioEid };
}

export function revisionPayload(identity, discovery, readback, baseline, revision) {
  const target = retainedReadbackPayload(identity, discovery);
  if (sha256(readback) !== sha256(baseline)) throw new Error('Retained source differs from the tested baseline; do not overwrite');
  const before = 'const officialIntakeDefaultBaseline=true;';
  const after = 'const officialIntakeDefaultBaseline=false;';
  if (baseline.split(before).length !== 2 || revision !== baseline.replace(before, after)) {
    throw new Error('Revision must change only the source-controlled baseline default');
  }
  return { did: target.did, wid: target.wvmid, eid: target.eid, code: revision };
}

async function main() {
  if (process.argv.length !== 3 || !['--read', '--revision'].includes(process.argv[2])) throw new Error('Use --read or --revision');
  const artifacts = new URL('./artifacts/', import.meta.url);
  const json = async name => JSON.parse(await readFile(new URL(name, artifacts), 'utf8'));
  const discovery = await json('managed-discovery.json');
  const identity = await json('retained-identity.json');
  const target = retainedReadbackPayload(identity, discovery);
  const readName = 'get-retained-source.payload.json';
  await writeFile(new URL(readName, artifacts), `${JSON.stringify(target, null, 2)}\n`);
  const generated = [readName];
  if (process.argv[2] === '--revision') {
    const source = async name => readFile(new URL(name, artifacts), 'utf8');
    const baseline = await source('baseline-feature.fs');
    const revision = await source('revision-feature.fs');
    const payload = revisionPayload(identity, discovery, await source('retained-baseline-readback.fs'), baseline, revision);
    const filename = 'put-retained-revision.payload.json';
    await writeFile(new URL(filename, artifacts), `${JSON.stringify(payload)}\n`);
    await writeFile(new URL('revision-binding.json', artifacts), `${JSON.stringify({
      status: 'BOUND_FOR_PARENT_DISPATCH_NOT_EXECUTED', did: identity.did, wid: identity.wid,
      featureStudioEid: identity.featureStudioEid, partStudioEid: identity.partStudioEid,
      featureIdExpectedUnchanged: identity.featureId, sameFeatureIdAfterUpdateObserved: false,
      baselineSourceSha256: sha256(baseline), revisionSourceSha256: sha256(revision),
      payloadSha256: sha256(`${JSON.stringify(payload)}\n`), revisionKind: 'CODE_DEFAULT_EDIT_NOT_PARAMETER_ONLY',
      persistedRevisionMeasurements: null, remoteWritesByBinder: 0,
    }, null, 2)}\n`);
    generated.push(filename, 'revision-binding.json');
  }
  console.log(JSON.stringify({ generated: generated.map(name => `trials/official-mcp/artifacts/${name}`), remoteCalls: 0 }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Retained payload binding refused; validate identity and source before retrying.'); process.exitCode = 1; });
}