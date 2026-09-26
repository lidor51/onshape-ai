import { unzipSync } from 'fflate';
import { requireCondition } from './transport.mjs';

export function decodeStep(input, expectedFiles = 1) {
  const maximumBytes = 64 * 1024 * 1024;
  requireCondition(Buffer.isBuffer(input) && input.length > 0 && input.length <= maximumBytes, 'STEP_INPUT_SIZE_UNSUPPORTED');
  let files = [{ bytes: input, archiveEntry: null }];
  if (input.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4]))) {
    let entryCount = 0;
    let totalBytes = 0;
    const entries = unzipSync(input, { filter(entry) {
      entryCount++;
      totalBytes += entry.originalSize;
      requireCondition(entryCount <= 32 && Number.isSafeInteger(totalBytes) && totalBytes <= maximumBytes, 'STEP_ARCHIVE_SIZE_UNSUPPORTED');
      requireCondition(!entry.name.includes('..') && !/^[\\/]|^[A-Za-z]:/.test(entry.name), 'STEP_ARCHIVE_PATH_UNSUPPORTED');
      return /\.(step|stp)$/i.test(entry.name);
    } });
    const names = Object.keys(entries);
    requireCondition(names.length === expectedFiles, 'STEP_ARCHIVE_FILE_COUNT_MISMATCH');
    files = names.map(archiveEntry => ({ archiveEntry, bytes: Buffer.from(entries[archiveEntry]) }));
  }
  for (const file of files) {
    const text = file.bytes.toString('utf8');
    requireCondition(/^\s*ISO-10303-21;/.test(text) && /END-ISO-10303-21;\s*$/.test(text)
      && /\bHEADER;/.test(text) && /\bDATA;/.test(text), 'STEP_FILE_SIGNATURE_UNSUPPORTED');
    file.solidRecordCount = [...text.matchAll(/\bMANIFOLD_SOLID_BREP\s*\(/g)].length;
  }
  return { ...(files.length === 1 ? files[0] : {}), files,
    solidRecordCount: files.reduce((sum, file) => sum + file.solidRecordCount, 0) };
}