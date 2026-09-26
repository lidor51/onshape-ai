import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLedger, requireThat } from './ledger.mjs';
import { preparationPlan } from './preparation.mjs';
import { validateBindingContract } from './v3-binding.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const ledgerPath = resolve(directory, 'ledger.json');

export function parseArgs(args) {
  const command = args[0]?.startsWith('--') ? 'plan' : args[0] ?? 'plan';
  requireThat(['plan', 'check-binding'].includes(command), 'V3_LIVE_EXECUTION_HELD');
  const options = { command };
  const seen = new Set();
  for (const argument of args.slice(args[0] === command ? 1 : 0)) {
    const [flag, ...rest] = argument.split('=');
    requireThat(!seen.has(flag), 'DUPLICATE_FLAG');
    seen.add(flag);
    if (flag === '--write-plan') {
      requireThat(command === 'plan' && rest.length === 0, 'OFFLINE_WRITE_PLAN_ONLY');
      options.writePlan = true;
    } else {
      requireThat(command === 'check-binding' && flag === '--binding' && rest.length === 1 && rest[0],
        'ONLY_API_LOCAL_BINDING_INPUT_ALLOWED');
      const path = realpathSync(resolve(rest[0]));
      const local = relative(realpathSync(directory), path).replaceAll('\\', '/');
      requireThat(local && !local.startsWith('../') && !local.includes(':') && !local.startsWith('/') && local.endsWith('.json') &&
        !local.split('/').some(part => part.startsWith('.env')) && local !== 'ledger.json', 'ONLY_API_LOCAL_BINDING_INPUT_ALLOWED');
      options.binding = path;
    }
  }
  requireThat(command !== 'check-binding' || options.binding, 'LOCAL_V3_BINDING_REQUIRED');
  return options;
}

export function offlinePlan(_packet, ledger) {
  return preparationPlan(ledger);
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const ledger = readLedger(ledgerPath);
  if (options.command === 'check-binding') {
    const result = validateBindingContract(JSON.parse(readFileSync(options.binding, 'utf8')), ledger);
    return { ...result, status: 'OFFLINE_CONTRACT_CHECK_ONLY', authenticatedRequestsThisInvocation: 0,
      liveExecutionAdmitted: false, nativeSemanticsProven: false };
  }
  const result = preparationPlan(ledger);
  if (options.writePlan) writeFileSync(resolve(directory, 'v3-preparation-plan.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (import.meta.main) {
  try { console.log(JSON.stringify(await main(), null, 2)); }
  catch {
    console.log(JSON.stringify({ status: 'BLOCKED', reason: 'V3_HELD_OR_INVALID_API_LOCAL_INPUT', authenticatedRequestsThisInvocation: 0 }));
    process.exitCode = 1;
  }
}