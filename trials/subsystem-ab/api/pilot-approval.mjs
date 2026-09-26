import { requireThat, sha256 } from './ledger.mjs';

export function admitPilot(approval) {
  requireThat(approval?.schema === 'subsystem-ab-api-parent-pilot-approval/1' && approval.approved === true &&
    approval.phase === 'PROVISIONAL_NATIVE_ASSEMBLY_PILOT' && approval.productionGeometryAdmitted === false &&
    approval.sharedPacketRequiredForPilot === false, 'EXPLICIT_PROVISIONAL_PILOT_APPROVAL_REQUIRED');
  requireThat(approval.origin === 'https://cad.onshape.com' && approval.newPublicDocumentAuthorized === true &&
    approval.maximumNewDocuments === 1 && approval.reuseForFullTrial === true && approval.retainPilotTabsAndFailures === true &&
    approval.apiLedgerSoleOwner === true, 'PILOT_OWNERSHIP_SCOPE_REQUIRED');
  requireThat(approval.currentKeyAcknowledgement === 'CURRENT_KEY_AUTHORIZED_NOT_ROTATION_CLAIM' &&
    approval.credentialSource === 'ROOT_ENV_LOCAL_RUNTIME_MEMORY_ONLY', 'PILOT_CURRENT_KEY_SCOPE_REQUIRED');
  const allowance = approval.allowance;
  requireThat(allowance?.apiArmCap === 140 && allowance.parentOverheadCap === 10 && allowance.safetyReserve === 500 &&
    allowance.pilotAttemptCap === 19 && allowance.observedDate === '2026-09-12' &&
    Number.isInteger(allowance.used) && Number.isInteger(allowance.limit) && allowance.used >= 0 &&
    allowance.remaining === allowance.limit - allowance.used && allowance.remaining >= 650, 'PILOT_ALLOWANCE_REQUIRED');
  return { origin: approval.origin, packetHash: sha256(JSON.stringify(approval)) };
}