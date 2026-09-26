import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { generate, trialDirectory } from './generate.mjs';
import { parseArguments, loadCredentials, createClient, PocError, requireCondition } from './transport.mjs';
import { runWorkflow } from './workflow.mjs';

export async function main(args) {
  const options = parseArguments(args);
  const { baseline, revision } = await generate();
  if (!options.live) {
    console.log('OFFLINE ONLY: generated trials/native-api/artifacts/{baseline,revision,revision-updates}.json. No credentials or network used.');
    return;
  }
  const credentials = await loadCredentials(options.live, undefined, options.stack);
  console.log('Configured origin match: true');
  const runId = options.resume ?? `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
  const directory = new URL(`live/${runId}/`, trialDirectory);
  await mkdir(directory, { recursive: true });
  const phaseFile = new URL('live/public-phase.json', trialDirectory);
  const phase = options.publicDocument ? JSON.parse(await readFile(phaseFile, 'utf8')) : null;
  if (options.resume) requireCondition(phase.runs.some(run => run.runId === runId && run.documentId), 'OWNED_PHASE_PROVENANCE_REQUIRED');
  if (phase && !options.resume) {
    requireCondition(phase.creationAttempts < 3, 'PUBLIC_DOCUMENT_BUDGET_EXHAUSTED');
    phase.creationAttempts++;
    phase.runs.push({ runId, creationName: `Native API coral intake PoC ${randomUUID()}`, intentAt: new Date().toISOString() });
    await writeFile(phaseFile, `${JSON.stringify(phase, null, 2)}\n`);
  }
  const intent = phase?.runs.find(run => run.runId === runId);
  const report = options.resume ? JSON.parse(await readFile(new URL('observations.json', directory), 'utf8')) : {
    evidence: 'LIVE_OBSERVATIONS_SEPARATE_FROM_OFFLINE_PREDICTIONS',
    predicted: { baseline: baseline.predicted, revision: revision.predicted },
    observed: { status: 'STARTED', startedAt: new Date().toISOString(), requests: [], retries: 0,
      featureOperations: [], stages: {}, humanInterventionsDuringRun: 0, tokens: null, cost: null },
  };
  if (options.resume) requireCondition(report.observed.documentId === intent.documentId
    && report.observed.provenance?.phaseId === phase.phaseId && report.observed.publicConfirmed === true, 'OWNED_PHASE_PROVENANCE_REQUIRED');
  report.observed.invocations ??= [];
  for (const prior of report.observed.invocations) {
    if (!prior.finishedAt) {
      prior.status = 'INTERRUPTED_WITHOUT_FINALIZER';
      prior.lastRecordedResponseAt = report.observed.requests.at(-1)?.at;
      prior.elapsedWallMs = null;
    }
  }
  const invocation = { startedAt: new Date().toISOString(), resumed: Boolean(options.resume), startingRequestCount: report.observed.requests.length };
  report.observed.invocations.push(invocation);
  report.observed.status = 'STARTED';
  delete report.observed.failureCode;
  function redactedText(text) {
    let result = text;
    for (const secret of Object.values(credentials)) result = result.split(secret).join('[REDACTED]');
    return result;
  }
  const save = async () => {
    writeFileSync(new URL('observations.json', directory), `${redactedText(JSON.stringify(report, null, 2))}\n`);
    if (intent && report.observed.documentId) {
      intent.documentId = report.observed.documentId;
      writeFileSync(phaseFile, `${JSON.stringify(phase, null, 2)}\n`);
    }
  };
  const started = performance.now();
  const client = createClient({ ...options, credentials, onEvent: event => {
    report.observed.requests.push({ ...event, at: new Date().toISOString() });
    console.log(`${event.operation}: ${event.status ?? event.error} (${event.elapsedMs} ms)`);
    void save();
  } });
  try {
    await save();
    await runWorkflow({ client, baseline, revision, report, save, publicDocument: options.publicDocument,
      resume: Boolean(options.resume), creationName: intent?.creationName, phaseId: phase?.phaseId,
      saveBinary: (filename, bytes) => writeFile(new URL(filename, directory), bytes),
    });
  } catch (error) {
    report.observed.status = 'BLOCKED_OR_FAILED';
    report.observed.failureCode = error instanceof PocError ? error.code : 'UNEXPECTED_RESPONSE_OR_IO';
    invocation.failureCode = report.observed.failureCode;
    process.exitCode = 1;
  } finally {
    report.observed.finishedAt = new Date().toISOString();
    invocation.finishedAt = report.observed.finishedAt;
    invocation.elapsedWallMs = Math.round(performance.now() - started);
    report.observed.elapsedWallMs = Math.round(performance.now() - started);
    report.observed.requestCount = report.observed.requests.length;
    report.observed.requestElapsedSumMs = report.observed.requests.reduce((sum, event) => sum + event.elapsedMs, 0);
    invocation.status = report.observed.status;
    await save();
    console.log(`${report.observed.status}. Sanitized observations: trials/native-api/live/${runId}/observations.json`);
    if (report.observed.documentUrl) console.log(redactedText(report.observed.documentUrl));
  }
}

if (import.meta.main) {
  try { await main(process.argv.slice(2)); }
  catch (error) {
    console.error(error instanceof PocError ? error.code : 'LOCAL_RUNNER_FAILED');
    process.exitCode = 1;
  }
}