import { readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { requireThat, sha256 } from './ledger.mjs';
import { isCots, rigid } from './graph.mjs';

export const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
export function contained(root, name) {
  requireThat(typeof name === 'string' && !isAbsolute(name) && !name.split(/[\\/]/).includes('..'), 'UNSAFE_PACKET_PATH');
  const path = realpathSync(resolve(root, name));
  const local = relative(realpathSync(root), path);
  requireThat(local !== '..' && !local.startsWith(`..${sep}`) && !isAbsolute(local), 'PACKET_PATH_ESCAPE');
  requireThat(!/(^|[\\/])\.env(?:\.|$)/i.test(local), 'ENV_NOT_PACKET_INPUT');
  return path;
}

export function loadPacket(root) {
  root = realpathSync(root);
  const freezeBytes = readFileSync(contained(root, 'freeze.json'));
  const freeze = JSON.parse(freezeBytes);
  const files = { contract: 'assembly-contract.json', geometry: 'source/geometry-payload.json', expected: 'expected.json' };
  const packet = { root, freeze, freezeHash: sha256(freezeBytes) };
  for (const [key, name] of Object.entries(files)) {
    const bytes = readFileSync(contained(root, name));
    requireThat(sha256(bytes) === freeze.artifactSha256[name], `PACKET_HASH_MISMATCH:${name}`);
    packet[key] = JSON.parse(bytes);
  }
  packet.source = readFileSync(contained(root, 'source/concept-a.fs'), 'utf8');
  requireThat(sha256(packet.source) === freeze.artifactSha256['source/concept-a.fs'], 'SOURCE_HASH_MISMATCH');
  const parameters = packet.contract.parameters;
  requireThat(Object.values(packet.contract.parts).every(part => ['custom', 'reference'].includes(part.category) || isCots(part)),
    'UNKNOWN_PART_CATEGORY');
  requireThat(parameters.packetVersion === freeze.packetVersion && parameters.units === 'mm', 'PACKET_VERSION_OR_UNITS');
  for (const variant of ['baseline', 'revision', 'receiverControlProbe']) {
    for (const name of ['mouthWidth', 'receiverHeight']) {
      const value = parameters[variant][name];
      requireThat(Number.isFinite(value) && value >= parameters.controls[name].min && value <= parameters.controls[name].max,
        `PARAMETER_OUT_OF_RANGE:${name}`);
    }
    if (packet.expected[variant]) requireThat(JSON.stringify(packet.expected[variant].controls) === JSON.stringify(parameters[variant]),
      'SOURCE_EXPECTATION_CONTROLS_MISMATCH');
  }
  requireThat(parameters.revision.mouthWidth === parameters.baseline.mouthWidth + 20 &&
    parameters.revision.receiverHeight === parameters.baseline.receiverHeight, 'REVISION_NOT_WIDTH_ONLY_PLUS_20');
  requireThat(/definition\.mouthWidth/.test(packet.source) && /definition\.receiverHeight/.test(packet.source) &&
    /definition\.includeCotsEnvelopes/.test(packet.source), 'EDITABLE_SOURCE_CONTROLS_MISSING');
  return packet;
}

export function admit(packet, handoff, now = Date.now()) {
  requireThat(packet.freeze.apiBrowserAdmission === 'PASS' && !/DIAGNOSTIC|NOT_ADMITTED/.test(packet.freeze.status) &&
    !packet.freeze.blockers?.length, 'PARENT_FROZEN_ADMITTED_PACKET_REQUIRED');
  requireThat(handoff?.schema === 'subsystem-ab-api-parent-handoff/1' && handoff.admitted === true &&
    handoff.freezeSha256 === packet.freezeHash && handoff.packetVersion === packet.freeze.packetVersion,
    'PARENT_HANDOFF_NOT_BOUND_TO_FREEZE');
  requireThat(handoff.currentKeyAcknowledgement === 'CURRENT_KEY_AUTHORIZED_NOT_ROTATION_CLAIM', 'CURRENT_KEY_ACK_REQUIRED');
  requireThat(handoff.origin === 'https://cad.onshape.com' && handoff.newPublicDocumentAuthorized === true &&
    handoff.apiLedgerSoleOwner === true, 'PARENT_SCOPE_NOT_CONFIRMED');
  const allowance = handoff.allowance;
  requireThat(Number.isInteger(allowance?.used) && allowance.used >= 0 && Number.isInteger(allowance.limit) &&
    allowance.limit - allowance.used >= 640 && Number.isFinite(Date.parse(allowance.observedAt)) &&
    now - Date.parse(allowance.observedAt) >= 0 && now - Date.parse(allowance.observedAt) <= 3600000 &&
    Date.parse(allowance.cycleEnd) > now, 'FRESH_ALLOWANCE_WITH_500_RESERVE_REQUIRED');
  for (const [name, hash] of Object.entries(packet.freeze.artifactSha256)) {
    requireThat(sha256(readFileSync(contained(packet.root, name))) === hash, `FROZEN_ARTIFACT_CHANGED:${name}`);
  }
  requireThat(typeof handoff.cotsBindingsFile === 'string' &&
    packet.freeze.artifactSha256[handoff.cotsBindingsFile] === handoff.cotsBindingsSha256, 'COTS_BINDINGS_NOT_FROZEN');
  const bindingsFile = contained(packet.root, handoff.cotsBindingsFile);
  requireThat(sha256(readFileSync(bindingsFile)) === handoff.cotsBindingsSha256, 'COTS_BINDINGS_HASH');
  const bindings = readJson(bindingsFile);
  requireThat(bindings.status === 'PASS' && Array.isArray(bindings.roles), 'AUTHENTIC_COTS_BINDINGS_REQUIRED');
  const requiredRoles = [...new Set(packet.contract.instances.filter(instance => instance.id !== 'held_coral' &&
    isCots(packet.contract.parts[instance.part])).map(instance => instance.part))];
  requireThat(new Set(bindings.roles.map(binding => binding.partRole)).size === bindings.roles.length, 'DUPLICATE_COTS_ROLE');
  requireThat(bindings.roles.length === requiredRoles.length && bindings.roles.every(binding => requiredRoles.includes(binding.partRole)),
    'COTS_ROLE_SET_MISMATCH');
  for (const role of requiredRoles) {
    const binding = bindings.roles.find(item => item.partRole === role);
    requireThat(binding?.geometryStatus === 'AUTHENTIC_VENDOR_GEOMETRY' && binding.interfaceCrossCheck === 'PASS' &&
      binding.motionRecheck === 'PASS' && binding.intendedUseApproved === true && binding.sourceVersion &&
      /^https:\/\//.test(binding.sourceUrl ?? '') && ['mm', 'm', 'inch'].includes(binding.units) &&
      typeof binding.importPartName === 'string' && binding.importPartName.length > 0, `COTS_NOT_ADMITTED:${role}`);
    rigid(binding.sourceToNeutralRowMajorMm);
    const bytes = readFileSync(contained(packet.root, binding.authenticFile));
    requireThat(sha256(bytes) === binding.sha256 && packet.freeze.artifactSha256[binding.authenticFile] === binding.sha256,
      `COTS_ASSET_HASH:${role}`);
  }
  return Object.fromEntries(bindings.roles.map(binding => [binding.partRole, binding]));
}