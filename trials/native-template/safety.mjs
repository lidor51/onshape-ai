import { appendFileSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { hash } from './patch.mjs';

export const ROTATION_CONFIRMATION = 'I-CONFIRM-EXPOSED-KEY-REVOKED-AND-REPLACED';
export const CURRENT_KEY_ACKNOWLEDGMENT = 'I-ACKNOWLEDGE-EXPOSED-CURRENT-KEY-RISK-AND-AUTHORIZE-USE';
export const SHARED_SNAPSHOT = Object.freeze({ date: '2026-09-11', source: 'parent-reported successful OAuth quota check',
  accountScope: 'shared-account allocation snapshot, NOT native-template consumed requests',
  used: 273, limit: 2500, remaining: 2227, nativeReservation: 120, manufacturingReservation: 80,
  officialReservation: 100, combinedReservation: 300, annualSafety: 500, remainingAfterReservationsAndSafety: 1427 });

export function authorize(options) {
  if (options.live !== true) throw new Error('EXPLICIT_LIVE_REQUIRED');
  const rotated = options.rotationConfirmation === ROTATION_CONFIRMATION;
  const currentKey = options.currentKeyAcknowledgment === CURRENT_KEY_ACKNOWLEDGMENT;
  if (options.rotationConfirmation && options.currentKeyAcknowledgment) throw new Error('CONFLICTING_CREDENTIAL_AUTHORIZATION');
  if (!rotated && !currentKey) throw new Error('EXPLICIT_CREDENTIAL_AUTHORIZATION_REQUIRED');
  if (!/^https:\/\/[a-z0-9-]+\.onshape\.com$/.test(options.approvedOrigin ?? '')) throw new Error('EXACT_APPROVED_ORIGIN_REQUIRED');
  if (options.newPublic !== true || options.maxDocuments !== 2) throw new Error('NEW_PUBLIC_TWO_DOCUMENT_SCOPE_REQUIRED');
  if (options.acceptUnvalidatedNativeCandidate !== true) throw new Error('NATIVE_PAYLOAD_SEMANTICS_UNVERIFIED');
  if (options.reserveNative !== 120 || options.reserveManufacturing !== 80 || options.reserveOfficial !== 100 || options.annualSafety !== 500 ||
    options.annualLimit !== 2500 || !Number.isSafeInteger(options.annualUsed) || options.annualUsed < 273 ||
    options.annualUsed + 120 + 80 + 100 + 500 > options.annualLimit || !/^\d{4}-\d{2}-\d{2}$/.test(options.reservationSnapshot ?? '')) {
    throw new Error('ANNUAL_RESERVATION_REQUIRED');
  }
  return { origin: options.approvedOrigin, credentialAuthorization: currentKey ? 'CURRENT_KEY_RISK_ACKNOWLEDGED' : 'ROTATION_ATTESTED',
    rotationConfirmed: rotated, reservation: { used: options.annualUsed, limit: options.annualLimit,
    date: options.reservationSnapshot, native: 120, manufacturing: 80, official: 100, safety: 500 } };
}

export class Ledger {
  constructor(directory, authorization, sourceHash, resumeOwned = false) {
    mkdirSync(directory, { recursive: true });
    this.path = join(directory, 'ledger.jsonl');
    this.lockPath = join(directory, 'session.lock');
    try { this.lock = openSync(this.lockPath, 'wx'); } catch { throw new Error('LEDGER_LOCKED_RECONCILIATION_REQUIRED'); }
    try {
      this.events = existsSync(this.path) ? readFileSync(this.path, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : [];
      this.authorizationHash = hash(authorization);
      this.sourceHash = sourceHash;
        this.resumeOwned = resumeOwned;
      if (!this.events.length) this.record({ kind: 'init', authorizationHash: this.authorizationHash, sourceHash,
        sharedSnapshot: SHARED_SNAPSHOT });
      const initial = this.events[0];
      if (initial.authorizationHash !== this.authorizationHash) throw new Error('LEDGER_BINDING_CHANGED');
      const latestSource = this.events.filter(event => event.kind === 'source-rebind').at(-1)?.sourceHash ?? initial.sourceHash;
      const outcomes = this.events.filter(event => event.kind === 'outcome');
      const unresolved = this.events.filter(event => event.kind === 'attempt' && !outcomes.some(outcome =>
        outcome.sequence === event.sequence && Number.isInteger(outcome.status) && !outcome.unknown));
      if (resumeOwned) {
        const owned = this.events.filter(event => event.kind === 'document');
        if (!owned.length || owned.some(document => !outcomes.some(outcome => outcome.sequence === document.creationSequence && outcome.status >= 200 && outcome.status < 300))) throw new Error('RESUME_PROVENANCE_REQUIRED');
        if (unresolved.some(event => !event.operation.startsWith('get')) || this.events.some(event => event.kind === 'ambiguity')) throw new Error('UNKNOWN_WRITE_RECONCILIATION_REQUIRED');
        for (const event of unresolved) {
          if (!this.events.some(item => item.kind === 'interrupted-read' && item.sequence === event.sequence)) this.record({ kind: 'interrupted-read', sequence: event.sequence });
        }
        this.pendingReconciliation = true;
        if (latestSource !== sourceHash) this.record({ kind: 'source-rebind', previousSourceHash: latestSource, sourceHash, reason: 'tested repair; fresh preflight; owned read reconciliation required' });
      } else {
        if (latestSource !== sourceHash) throw new Error('LEDGER_BINDING_CHANGED');
        if (this.activeHalt() || this.summary().unknown > 0) throw new Error('LEDGER_HALTED_RECONCILIATION_REQUIRED');
      }
    } catch (error) { this.close(); throw error; }
  }
  record(event) {
    const entry = { ...event, at: new Date().toISOString() };
    const descriptor = openSync(this.path, 'a');
    try { appendFileSync(descriptor, `${JSON.stringify(entry)}\n`); fsyncSync(descriptor); }
    finally { closeSync(descriptor); }
    this.events.push(entry);
    return entry;
  }
  summary() {
    const attempts = this.events.filter(event => event.kind === 'attempt');
    const outcomes = this.events.filter(event => event.kind === 'outcome');
    const classify = selected => ({ attempted: selected.length,
      successful: selected.filter(attempt => outcomes.some(event => event.sequence === attempt.sequence && event.status >= 200 && event.status < 400)).length,
      failed: selected.filter(attempt => outcomes.some(event => event.sequence === attempt.sequence && event.status >= 400)).length,
      unknown: selected.filter(attempt => (!outcomes.some(event => event.sequence === attempt.sequence && Number.isInteger(event.status) && !event.unknown) &&
        !this.events.some(event => event.kind === 'interrupted-read' && event.sequence === attempt.sequence)) ||
        this.events.some(event => event.kind === 'ambiguity' && event.sequence === attempt.sequence)).length,
      interruptedReads: selected.filter(attempt => this.events.some(event => event.kind === 'interrupted-read' && event.sequence === attempt.sequence)).length,
      retries: 0 });
    return { ...classify(attempts), documentSlots: attempts.filter(event => event.createsDocument).length,
      phases: Object.fromEntries(['setup', 'copy', 'simulated-editor', 'revision', 'validation'].map(phase =>
        [phase, classify(attempts.filter(event => event.phase === phase))])) };
  }
  startPhase(phase) {
    if (this.events.some(event => event.kind === 'phase-start' && event.phase === phase)) {
      if (!this.resumeOwned || this.events.some(event => event.kind === 'phase-done' && event.phase === phase)) throw new Error('PHASE_ALREADY_ATTEMPTED_NO_REPLAY');
      this.record({ kind: 'phase-resume', phase });
      return;
    }
    this.record({ kind: 'phase-start', phase });
  }
  activeHalt() {
    const lastReconciled = this.events.findLastIndex(event => event.kind === 'reconciled');
    return this.events.slice(lastReconciled + 1).some(event => event.kind === 'halt');
  }
  reconcileOwned(role, snapshotHash) {
    if (!this.pendingReconciliation || !this.events.some(event => event.kind === 'visibility' && event.role === role && event.isPublic)) throw new Error('RECONCILIATION_EVIDENCE_REQUIRED');
    this.record({ kind: 'reconciled', role, snapshotHash, sourceHash: this.sourceHash });
    this.pendingReconciliation = false;
  }
  attempt(phase, operation, createsDocument = false) {
    const summary = this.summary();
    if (this.pendingReconciliation ? !operation.startsWith('get') : (summary.unknown || this.activeHalt())) throw new Error('LEDGER_HALTED_RECONCILIATION_REQUIRED');
    if (summary.attempted >= 120) throw new Error('ATTEMPT_LIMIT');
    if (createsDocument && summary.documentSlots >= 2) throw new Error('DOCUMENT_LIMIT');
    return this.record({ kind: 'attempt', sequence: summary.attempted + 1, phase, operation, createsDocument }).sequence;
  }
  outcome(sequence, status, elapsedMs, unknown = false) {
    this.record({ kind: 'outcome', sequence, status: Number.isInteger(status) ? status : null, elapsedMs, unknown });
  }
  halt(code = 'RECONCILIATION_REQUIRED') { this.record({ kind: 'halt', code }); }
  close() {
    if (this.lock !== undefined) { closeSync(this.lock); this.lock = undefined; unlinkSync(this.lockPath); }
  }
}