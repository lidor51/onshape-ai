import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const contact = read('contact-report.json');
const geometry = read('geometry-summary.json');
const boundary = read('boundary-report.json');
const parameters = contact.parameters;
const slope = parameters.deckHeight / (parameters.crestY - parameters.toeY);
const radius = parameters.coralDiameter / 2;
const baselineOffset = radius * Math.hypot(1, slope);
const variants = ['baseline', 'revision'].map(name => {
  const brep = read(name + '-brep.json');
  const layout = read(name + '-layout.json');
  return { name, contactCore: layout.contact.gaps.length === 0,
    closedVolumes: Object.values(brep.solids).every(shape => shape.valid && shape.closed && shape.solids === 1 && shape.volumeMm3 > 0),
    deploymentUnexpected: brep.deployment.unexpectedCount,
    centeredCrosswiseUnexpected: brep.entry.find(entry => entry.yaw === 90).unexpectedCount,
    yawRouteUnexpected: brep.yaw.unexpectedCount,
    receiverEndpointTabUnexpected: brep.receiver.unexpectedCount,
    testedEntryYawDeg: brep.entry.map(entry => ({ yaw: entry.yaw, unexpectedPairSamples: entry.unexpectedCount })),
    modeledOccurrences: brep.modeledOccurrences, customOccurrences: brep.customOccurrences,
    mainPoseSamples: brep.deployment.samples + brep.yaw.samples + brep.receiver.samples + brep.entry.reduce((sum, entry) => sum + entry.samples, 0),
    pairVisits: brep.deployment.pairVisits + brep.yaw.pairVisits + brep.receiver.pairVisits + brep.entry.reduce((sum, entry) => sum + entry.pairVisits, 0),
    fullBrepBooleans: brep.deployment.fullBrepBooleans + brep.yaw.fullBrepBooleans + brep.receiver.fullBrepBooleans + brep.entry.reduce((sum, entry) => sum + entry.fullBrepBooleans, 0) };
});
const result = {
  status: 'FINITE_LAYOUT_NO_FIT', candidate: 'V5 five staggered 127 mm upper rollers, planar guide, horizontal-axis entry',
  localCADDemoPass: false, frozen: false, manufacturingRelease: false, physicalPerformancePass: false,
  candidateGeometryRepairs: 1, limitGeometryRepairCyclesPerFile: 3,
  reason: 'Crosswise-only contact core passes, but 0/30/60/75 degree entries collide with fixed hard tubes. Retention closure also fails. Stop before mounts/transmission detail.',
  scopeOfNoFit: 'This tested candidate and its stated horizontal-on-guide trajectory. Not a proof that Concept A, tilted coral acquisition, or every other layout is impossible.',
  variants,
  fullWidthTopBankBound: {
    assumedCompressionMm: parameters.compressionLimit,
    equation: 'pitch_max = 2*sqrt((r+R)^2-(r+R-c)^2); pitch_min = 2*R',
    maximumPitchMm: contact.flatBankEquation.maxPitch,
    minimumNonintersectingPitchMm: parameters.rollerDiameter,
    unsatisfiedPitchIntervalMm: [parameters.rollerDiameter, contact.flatBankEquation.maxPitch],
    maximumDiameterAtThisCompressionMm: 2 * (parameters.compressionLimit + Math.sqrt(2 * radius * parameters.compressionLimit)),
    conditions: 'Consecutive full-width identical upper rollers over one flat guide; crosswise cylinder; normal indentation at most c. Axial staggering avoids roller/roller overlap but does not solve skew acquisition.',
  },
  inclinedGuideYawBound: {
    slope, equation: 'H(alpha) = m*L/2*abs(cos(alpha)) + r*sqrt(1+m^2*sin(alpha)^2)',
    conditions: 'Exact support function of a horizontal finite cylinder over an unbounded plane at slope m; finite-guide samples use the clipped support calculation.',
    offsets: [0, 30, 60, 75, 90].map(yaw => {
      const radians = yaw * Math.PI / 180;
      const height = slope * parameters.coralLength / 2 * Math.abs(Math.cos(radians)) +
        radius * Math.sqrt(1 + slope ** 2 * Math.sin(radians) ** 2);
      return { yawDeg: yaw, centerOffsetAbovePlaneMm: height, riseRelativeToCrosswiseMm: height - baselineOffset };
    }),
    fixedTubeWitnesses: boundary.fixedTubeSkewWitnesses,
  },
  retention: boundary.retentionClosure,
  feasibleCore: { pickupAxes: 5, orienterAxes: 6, orienterStationsPerSide: 3,
    acceptedGeometricEntry: 'Only tested centered yaw=90 degrees. No nonzero orientation or lateral tolerance certified.',
    contactCaptureY: contact.acquiredAtY, guideHeightMm: parameters.deckHeight,
    maximumRequiredFrontFloatMm: contact.maximumRequiredFloat,
    floatLimitsMm: { baseline: [0, 30], revision: [0, 24] },
    preload: '7 mm target at floating front; up to 8 mm assumed rubber indentation at other contacts. Neither force nor spring/friction performance validated.',
    yaw: 'Collision-constrained search route only; independent drive convergence and continuous driven control through the orienter are unverified.',
    receiver: 'Two underside fingers clear their slots on sampled approach/lift; tab was held closed during that probe. Tab closure fails separately.' },
  intentionallyNotBuilt: [
    'Bolted machined endblocks, chassis tower mounts, actual bearing supports and load-path face connectivity',
    'Full physical hardware BOM and grouped supported assembly',
    'Closed transmission, four-motor implementation, vendor placements and planned multistage deployment',
    'FeatureScript/native UI dimensions, owned mate connectors and frozen frames',
  ],
  physicalUnverified: ['spring coefficient', 'friction', 'rubber compression/traction', 'coral pitch/yaw convergence',
    'anti-bounce flexibility', 'structural loads', 'thermal/duty limits', 'powered-off retention', 'full 2025 legal inspection'],
  originalCots: { files: 4, unchangedHashCheck: 'decision.test.mjs', placedOccurrences: 0, vendorBodiesReexported: 0 },
  execution: { mainRun: read('geometry.exit.json'), boundaryRun: read('boundary.exit.json'),
    apiCalls: 0, downloads: 0, installs: 0, otherAgents: 0, rootEdits: 0, v4Edits: 0 },
  evidence: {},
};
for (const name of ['layout.mjs', 'layout.test.mjs', 'coarse.mjs', 'coarse.test.mjs', 'geometry.py', 'run.mjs',
  'contact-report.json', 'baseline-layout.json', 'revision-layout.json', 'baseline-brep.json', 'revision-brep.json',
  'boundary-report.json', 'geometry-summary.json', 'original-cots-manifest.json']) {
  result.evidence[name] = createHash('sha256').update(readFileSync(resolve(root, name))).digest('hex');
}
writeFileSync(resolve(root, 'decision.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, localCADDemoPass: false,
  reason: result.reason, pitchBound: result.fullWidthTopBankBound,
  variants, retentionFailures: result.retention.unexpectedCount,
  mainRunSeconds: geometry.seconds }, null, 2));
process.exitCode = 1;