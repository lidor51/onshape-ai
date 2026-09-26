export function evaluateAdmission(record) {
  if (record.userAuthorization.status !== 'AUTHORIZED') {
    return { status: 'BLOCKED', reasonCode: 'USER_SCOPE_UNAUTHORIZED' };
  }
  const permissionEvidence = record.serviceGate.vendorPermissionEvidence
    ?? record.serviceGate.supersedingTermsEvidence;
  if (record.serviceGate.status !== 'RESOLVED' || !permissionEvidence) {
    return { status: 'BLOCKED', reasonCode: 'UNRESOLVED_AUTOMATION_RESTRICTION' };
  }
  if (record.dependencies.sharedPacket.status !== 'VERIFIED'
      || !record.dependencies.sharedPacket.path
      || !record.dependencies.sharedPacket.sha256
      || record.dependencies.preparedPlate.status !== 'VERIFIED'
      || !record.dependencies.preparedPlate.path
      || !record.dependencies.preparedPlate.sha256) {
    return { status: 'BLOCKED', reasonCode: 'WAITING_FOR_PARENT_PACKET' };
  }
  if (record.dependencies.parentAllowanceEvidence.status !== 'VERIFIED'
      || !record.dependencies.parentAllowanceEvidence.path) {
    return { status: 'BLOCKED', reasonCode: 'WAITING_FOR_PARENT_ALLOWANCE_EVIDENCE' };
  }
  if (record.tooling.browserCapabilityStatus !== 'AVAILABLE') {
    return { status: 'BLOCKED', reasonCode: 'PARENT_TOOL_HANDOFF_REQUIRED' };
  }
  if (record.dependencies.independentRoutes.browser.observedModel !== 'GPT-6 Astra'
      || record.dependencies.independentRoutes.browser.status !== 'VERIFIED') {
    return { status: 'BLOCKED', reasonCode: 'SEPARATE_GPT6_BROWSER_ROUTE_UNVERIFIED' };
  }
  return { status: 'ADMISSIBLE', reasonCode: 'BOUNDED_UI_SMOKE_ONLY' };
}