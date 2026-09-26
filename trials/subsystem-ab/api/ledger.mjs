import { closeSync, existsSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const LIMIT = 140;
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function requireThat(condition, code) {
  if (!condition) throw new Error(code);
}

export function readLedger(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  requireThat(data.schema === 'subsystem-ab-api-ledger/1' && data.limit === LIMIT &&
    Array.isArray(data.attempts) && data.attempts.length <= LIMIT &&
    data.attempts.every((entry, index) => entry.sequence === index + 1), 'LEDGER_INVALID');
  return data;
}

export class Ledger {
  constructor(path, binding) {
    this.path = path;
    this.lockPath = `${path}.lock`;
    this.lock = openSync(this.lockPath, 'wx');
    try {
      this.data = readLedger(path);
      requireThat(binding && typeof binding.packetHash === 'string' &&
        binding.origin === 'https://cad.onshape.com', 'LEDGER_BINDING_REQUIRED');
      if (this.data.binding) {
        requireThat(JSON.stringify(this.data.binding) === JSON.stringify(binding), 'LEDGER_BINDING_MISMATCH');
      } else {
        requireThat(this.data.attempts.length === 0, 'LEDGER_UNBOUND_ATTEMPTS');
        this.data.binding = binding;
        this.save();
      }
    } catch (error) {
      this.close();
      throw error;
    }
  }

  save() {
    requireThat(this.lock !== undefined, 'LEDGER_CLOSED');
    writeFileSync(this.path, `${JSON.stringify(this.data, null, 2)}\n`, { flush: true });
  }

  begin({ key, phase, operation, method, requestHash, createsDocument = false }) {
    requireThat(!this.data.halt && !this.data.attempts.some(entry => entry.status === 'PENDING'), 'LEDGER_HALTED_OR_PENDING');
    requireThat(!this.data.attempts.some(entry => entry.key === key), 'NO_BLIND_REPLAY');
    requireThat(this.data.attempts.length < LIMIT, 'ATTEMPT_CAP_140');
    requireThat(!createsDocument || !this.data.attempts.some(entry => entry.createsDocument), 'ONE_DOCUMENT_ONLY');
    const entry = { sequence: this.data.attempts.length + 1, key, phase, operation, method,
      requestHash, createsDocument, status: 'PENDING', startedAt: new Date().toISOString() };
    this.data.attempts.push(entry);
    this.save();
    return entry.sequence;
  }

  finish(sequence, { httpStatus, elapsedMs, result, error, errorDetail }) {
    const entry = this.data.attempts[sequence - 1];
    requireThat(entry?.status === 'PENDING', 'NO_PENDING_ATTEMPT');
    Object.assign(entry, { httpStatus, elapsedMs: Math.round(elapsedMs),
      status: error ? 'STOPPED' : 'SUCCESS', ...(result === undefined ? {} : { result }),
      ...(errorDetail === undefined ? {} : { errorDetail }) });
    if (error) this.data.halt = { sequence, code: error };
    this.save();
  }

  completed(key) {
    return this.data.attempts.find(entry => entry.key === key && entry.status === 'SUCCESS');
  }

  checkpoint(name, result) {
    this.data.checkpoints ??= {};
    this.data.checkpoints[name] = result;
    this.save();
  }

  close() {
    if (this.lock !== undefined) {
      closeSync(this.lock);
      this.lock = undefined;
      if (existsSync(this.lockPath)) unlinkSync(this.lockPath);
    }
  }
}