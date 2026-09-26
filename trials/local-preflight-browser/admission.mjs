import { readFileSync } from 'node:fs';
import { checkAllCandidates } from './preflight.mjs';

export function assertBrowserAdmission({ executionAuthorized, newPublicDocumentConfirmed }) {
  if (executionAuthorized !== true || newPublicDocumentConfirmed !== true) throw new Error('Explicit live authorization and NEW PUBLIC confirmation required');
  const policy = JSON.parse(readFileSync(new URL('./policy.json', import.meta.url)));
  if (policy.browserExecution !== 'PASS') throw new Error(`Browser BLOCKED: ${policy.reason}`);
  if (policy.tooling?.toolSearchExposed !== true || policy.tooling?.playwrightToolsLoaded !== true) throw new Error('Actual loaded Playwright MCP tools required');
  checkAllCandidates();
  return { permitted: true, maxNewDocuments: 1, maxToolCallsPerCheckpoint: 60, maxActiveMinutesPerCheckpoint: 15, maxRepairCheckpoints: 1 };
}