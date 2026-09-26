import { inflateRawSync, crc32 } from 'node:zlib';
import { ROLES, fail } from './supplement-policy.mjs';

export function isStep(bytes) {
  return bytes.toString('ascii', 0, 100).includes('ISO-10303-21;') &&
    bytes.subarray(-200).toString('ascii').includes('END-ISO-10303-21;');
}

export function stepMembers(bytes) {
  let end = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset--) {
    if (bytes.readUInt32LE(offset) === 0x06054b50 && offset + 22 + bytes.readUInt16LE(offset + 20) === bytes.length) {
      end = offset;
      break;
    }
  }
  if (end < 0 || bytes.readUInt16LE(end + 4) !== 0 || bytes.readUInt16LE(end + 6) !== 0 ||
      bytes.readUInt16LE(end + 8) !== 9 || bytes.readUInt16LE(end + 10) !== 9) fail('STEP_ARCHIVE_DIRECTORY_INVALID');
  let cursor = bytes.readUInt32LE(end + 16);
  if (cursor + bytes.readUInt32LE(end + 12) !== end) fail('STEP_ARCHIVE_BOUNDARY_INVALID');
  const members = [];
  for (let index = 0; index < 9; index++) {
    if (cursor + 46 > end || bytes.readUInt32LE(cursor) !== 0x02014b50) fail('STEP_ARCHIVE_ENTRY_INVALID');
    const flags = bytes.readUInt16LE(cursor + 8);
    const method = bytes.readUInt16LE(cursor + 10);
    const checksum = bytes.readUInt32LE(cursor + 16);
    const compressedSize = bytes.readUInt32LE(cursor + 20);
    const size = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const localOffset = bytes.readUInt32LE(cursor + 42);
    const next = cursor + 46 + nameLength + extraLength + commentLength;
    if (next > end || flags & 1 || ![0, 8].includes(method) || size > 10_000_000 || compressedSize > 10_000_000 ||
        bytes.readUInt16LE(cursor + 34) !== 0 || localOffset + 30 > cursor) fail('STEP_ARCHIVE_UNSUPPORTED');
    const originalName = bytes.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    const role = ROLES.find(candidate => originalName === `Part Studio 1 - ${candidate}.step`);
    if (!role || members.some(member => member.role === role)) fail('STEP_ARCHIVE_PART_NAME_INVALID');
    if (bytes.readUInt32LE(localOffset) !== 0x04034b50 || bytes.readUInt16LE(localOffset + 8) !== method) fail('STEP_ARCHIVE_LOCAL_HEADER_INVALID');
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    if (start + compressedSize > cursor || bytes.toString('utf8', localOffset + 30, localOffset + 30 + localNameLength) !== originalName) fail('STEP_ARCHIVE_LOCAL_BOUNDARY_INVALID');
    const compressed = bytes.subarray(start, start + compressedSize);
    const data = method === 8 ? inflateRawSync(compressed, { maxOutputLength: 10_000_000 }) : compressed;
    if (data.length !== size || crc32(data) !== checksum || !isStep(data)) fail('STEP_ARCHIVE_MEMBER_INTEGRITY_FAILED');
    members.push({ role, originalName, data, crc32: checksum.toString(16).padStart(8, '0') });
    cursor = next;
  }
  if (cursor !== end) fail('STEP_ARCHIVE_TRAILING_DIRECTORY_DATA');
  return members;
}

export async function saveStepExport(phase, bytes, save) {
  if (isStep(bytes)) return { ...await save(`${phase}.step`, bytes), format: 'STEP', originalDownloadBytes: true };
  const members = stepMembers(bytes);
  const archive = await save(`${phase}-step-original.zip`, bytes);
  const files = [];
  for (const member of members) {
    files.push({ role: member.role, originalName: member.originalName, crc32: member.crc32,
      ...await save(`${phase}-${member.role}.step`, member.data) });
  }
  return { ...archive, format: 'ZIP_OF_NINE_STEP_FILES', originalDownloadBytes: true,
    memberBytesUnmodified: true, members: files };
}