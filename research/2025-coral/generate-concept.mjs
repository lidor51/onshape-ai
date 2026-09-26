import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createSizingReport, motorReference, pivotScreen } from './sizing.mjs';

const directory = new URL('./', import.meta.url);
const names = ['concept-inputs.json', 'rules.json', 'cots.json', 'sizing.mjs', 'sizing.test.mjs', 'generate-concept.mjs'];
const files = Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(new URL(name, directory))])));
const inputs = JSON.parse(files['concept-inputs.json']);
const rules = JSON.parse(files['rules.json']);
const catalog = JSON.parse(files['cots.json']);
const report = createSizingReport(inputs, rules, catalog);
const sourceHashes = Object.fromEntries(names.map(name => [name, createHash('sha256').update(files[name]).digest('hex')]));
const x44 = motorReference(catalog, 'x44', inputs.motorMode);
const coralMass = rules.constraints.find(item => item.id === 'coral_mass_upper').kg;
report.pivotSensitivity = [3, 4, 6].flatMap(mass => [0.75, 1.25].map(duration => ({
  structureMassKg: mass, moveDurationS: duration,
  fixedAssumptionWarning: 'Structure inertia scales with mass at fixed mass distribution and center-of-mass radius; not a re-estimated complete assembly',
  ...pivotScreen({ ...inputs.designAssumptions, pivotMovingStructureMassKg: mass, pivotMoveDurationS: duration,
    pivotStructureInertiaKgM2: inputs.designAssumptions.pivotStructureInertiaKgM2 * mass / inputs.designAssumptions.pivotMovingStructureMassKg },
  coralMass, x44, 50, report.coralInertiaAssumption.worstAxisCentroidalInertiaKgM2),
})));
report.sourceHashes = sourceHashes;
report.knownSourceLimits = ['Nominal piece geometry, not measured sample tolerances', 'Post-Championships CTRE X44 performance data',
  'Motor current/thermal and simultaneous speed/torque feasibility unverified', 'Geometry/clearance and physical tests not run'];
await writeFile(new URL('concept-screen.json', directory), `${JSON.stringify(report, null, 2)}\n`);

const table = report.pickupScreens.filter(row => row.diameterMm === 127 && row.targetMps === 3);
const pivot = report.pivotScreens;
const text = [
  '# Provisional Sizing Screen', '',
  'Generated from source-bound local inputs. These are calculations, not Onshape',
  'measurements, a validated mechanism, or electrical/control settings.', '',
  '## Envelope Assumptions', '',
  `- Rectangular blank chassis: ${inputs.designAssumptions.blankChassisWidthMm} x ${inputs.designAssumptions.blankChassisLengthMm} mm, perimeter ${report.candidateEnvelope.perimeterMm} mm.`,
  `- Margin below sourced perimeter maximum: ${report.candidateEnvelope.perimeterMarginMm} mm of total perimeter, not per side.`,
  `- Starting-height target margin: ${report.candidateEnvelope.startingHeightMarginMm.toFixed(1)} mm.`,
  `- Front-extension target margin: ${report.candidateEnvelope.frontExtensionMarginMm.toFixed(1)} mm from ROBOT PERIMETER, not bumper face.`,
  `- Horizontal CORAL centered-yaw disk: ${report.candidateEnvelope.exactUninflatedCoralYawDiskDiameterMm.toFixed(1)} mm diameter; ${report.candidateEnvelope.conservativeInflatedCoralYawDiskDiameterMm.toFixed(1)} mm with the assumed allowance.`,
  '- These scalar numbers do not prove stow, bumper coverage, actual movement, wiring or receiver clearance.', '',
  '## Pickup Speed Screen', '',
  'X44 trapezoidal 12 V test endpoints; 127 mm example contact diameter and 3 m/s',
  'illustrative target. Diameters/targets/reductions are not selected hardware.', '',
  '| Total reduction | No-load surface m/s | Required fraction of motor free speed |',
  '| --- | ---: | ---: |',
  ...table.map(row => `| ${row.reduction}:1 | ${row.noLoadSurfaceSpeedMps.toFixed(2)} | ${(100 * row.requiredFractionOfMotorFreeSpeed).toFixed(1)}% |`), '',
  'Speed fraction is not duty cycle or a guaranteed loaded operating point. Higher',
  'reduction can increase stall/jam force; it is not automatically safer. Check the',
  'exact contact-wheel RPM rating before any powered test.', '',
  '## Pivot Load Screen', '',
  `Assumptions: ${inputs.designAssumptions.pivotMovingStructureMassKg} kg structure, ${inputs.designAssumptions.pivotStructureCenterOfMassRadiusM} m center-of-mass radius,`,
  `${inputs.designAssumptions.pivotStructureInertiaKgM2} kg m^2 structure inertia about the pivot, worst manual CORAL mass ${coralMass.toFixed(3)} kg at ${inputs.designAssumptions.pivotCoralCenterOfMassRadiusM} m,`,
  `${inputs.designAssumptions.pivotTravelDeg} degrees in ${inputs.designAssumptions.pivotMoveDurationS} s, ${inputs.designAssumptions.pivotAssumedEfficiency * 100}% efficiency, ${inputs.designAssumptions.pivotFrictionTorqueNm} N m friction, ${inputs.designAssumptions.pivotLoadFactor} load factor.`,
  `CORAL centroidal inertia: ${report.coralInertiaAssumption.worstAxisCentroidalInertiaKgM2.toFixed(6)} kg m^2, using a uniform annular tube and worst principal axis.`,
  'This assumes a direct constant-ratio pivot and triangular rest-to-rest velocity,',
  'not a collapsing linkage, impacts or a measured controller trajectory.', '',
  `Conservative combined output torque: **${pivot[0].conservativeOutputTorqueNm.toFixed(2)} N m**.`, '',
  '| Reduction | Required peak motor rpm | Required motor torque N m | Torque / extrapolated stall |',
  '| --- | ---: | ---: | ---: |',
  ...pivot.map(row => `| ${row.reduction}:1 | ${row.requiredPeakMotorRpm.toFixed(0)} | ${row.requiredMotorTorqueNm.toFixed(3)} | ${(100 * row.requiredFractionOfExtrapolatedStallTorque).toFixed(1)}% |`), '',
  'These are requirements, not proof of an available simultaneous speed/torque point.',
  'Stator and supply current differ; no current limit is inferred from stall current.',
  'No gear stress, bearing load, braking/backdrive, impact or thermal check has passed.', '',
  '## Provenance And Reproduction', '',
  'Inputs and all sensitivity rows: [concept-screen.json](concept-screen.json).',
  'Assumptions: [concept-inputs.json](concept-inputs.json); motor sources: [cots.md](cots.md); rules: [rules.md](rules.md).', '',
  '```powershell',
  'node --test research/2025-coral/sizing.test.mjs',
  'node research/2025-coral/generate-concept.mjs',
  '```', '',
  'Both commands require no credentials, dependencies or network. Source hashes',
  'allow stale inputs to be detected; they do not turn assumptions into facts.', '',
].join('\n');
await writeFile(new URL('SIZING.md', directory), text);

const diagram = `<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="820" viewBox="0 0 1260 820" role="img" aria-labelledby="title desc">
<title id="title">Proposed coral acquisition and handoff architecture</title>
<desc id="desc">Not-to-scale functional sketch: deployable pickup, independent alignment, single-coral cradle, and rough receiver on a blank chassis. Physical clearance is unverified.</desc>
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#245c4a"/></marker></defs>
<rect width="1260" height="820" fill="#ffffff"/>
<g font-family="sans-serif" fill="#18211f">
<text x="40" y="45" font-size="27" font-weight="bold">Concept A: separate pickup, orientation and handoff</text>
<text x="40" y="77" font-size="16">FUNCTIONAL SKETCH ONLY - NOT TO SCALE - NO SWEPT-CLEARANCE OR ACQUISITION PASS</text>
<rect x="460" y="126" width="752" height="376" fill="#f4f6f5" stroke="#65746c" stroke-width="3"/>
<text x="486" y="155" font-size="18">Blank chassis / reference structure</text>
<text x="486" y="480" font-size="16">${inputs.designAssumptions.blankChassisWidthMm} x ${inputs.designAssumptions.blankChassisLengthMm} mm starting reference, dimensions provisional; bumper geometry not drawn</text>
<rect x="65" y="222" width="135" height="77" rx="4" fill="#f8e7c5" stroke="#997531" stroke-width="2"/>
<text x="84" y="253" font-size="19">Floor coral</text><text x="84" y="278" font-size="15">varied entry pose</text>
<rect x="245" y="196" width="236" height="134" rx="4" fill="#d9ece3" stroke="#245c4a" stroke-width="2"/>
<text x="266" y="232" font-size="20">Deployable pickup</text><text x="266" y="260" font-size="16">floating contact candidate</text><text x="266" y="287" font-size="16">drive and pivot separate</text>
<path d="M200,259 H242 M482,259 H519 M752,259 H789 M1010,259 H1055" fill="none" stroke="#245c4a" stroke-width="3" marker-end="url(#arrow)"/>
<rect x="522" y="196" width="230" height="134" rx="4" fill="#d9ece3" stroke="#245c4a" stroke-width="2"/>
<text x="541" y="232" font-size="20">Orientation stage</text><text x="541" y="260" font-size="16">independent side drives</text><text x="541" y="287" font-size="16">opposed jam recovery</text>
<rect x="793" y="196" width="217" height="134" rx="4" fill="#e2e9f3" stroke="#496387" stroke-width="2"/>
<text x="810" y="232" font-size="20">Single-coral cradle</text><text x="810" y="260" font-size="16">locate, retain and wait</text><text x="810" y="287" font-size="16">receiver-confirmed release</text>
<rect x="1061" y="195" width="117" height="208" rx="4" fill="#ffffff" stroke="#496387" stroke-width="2" stroke-dasharray="7 5"/>
<text x="1076" y="231" font-size="17">Receiver</text><text x="1076" y="258" font-size="15">placeholder</text><text x="1076" y="285" font-size="15">not 2910</text><text x="1076" y="309" font-size="15">reconstruction</text>
<path d="M1114,405 V434 H894 V333" fill="none" stroke="#496387" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#arrow)"/>
<text x="778" y="458" font-size="15">ready + aligned + same-piece retention confirmed</text>
<text x="41" y="546" font-size="21" font-weight="bold">Interfaces to resolve before detailed CAD</text>
<text x="41" y="580" font-size="17">1. Stow and deploy around a complete bumper; no intake notch or precision-bent bracket assumption.</text>
<text x="41" y="610" font-size="17">2. Define coral exit position/orientation and a shared tolerance budget with the rough receiving mechanism.</text>
<text x="41" y="640" font-size="17">3. Hold one piece while the receiver is unavailable; lock out another pickup while any robot stage holds coral.</text>
<text x="41" y="670" font-size="17">4. Establish physical jam-clear, disabled release, cable travel, stiffness and service-access tests.</text>
<text x="41" y="717" font-size="20" font-weight="bold">Concept B comparator</text>
<text x="41" y="747" font-size="17">A raising intake centers and presents coral directly; fewer transfer stages are possible, but handoff depends</text>
<text x="41" y="775" font-size="17">more strongly on its motion and the receiver pose. Not rejected until matched transfer tests are available.</text>
</g></svg>`;
await writeFile(new URL('concept-A-functional.svg', directory), diagram);
console.log(JSON.stringify({ status: report.status, generated: ['concept-screen.json', 'SIZING.md', 'concept-A-functional.svg'],
  pickup127mm3to1FreeMps: table[0].noLoadSurfaceSpeedMps,
  pivotOutputTorqueNm: pivot[0].conservativeOutputTorqueNm,
  apiCalls: 0, cadCreated: false }, null, 2));