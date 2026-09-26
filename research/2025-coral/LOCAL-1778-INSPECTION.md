# Local 1778 Source Inspection

Inspected 2026-09-18. This record supersedes the earlier **geometry unavailable**
status for 1778 only: the user supplied the actual local glTF. No new remote
retrieval, Onshape API, credentials, native feature edit or B-rep edit was used.

## Viewer And Provenance

- Running viewer: <http://127.0.0.1:49178/>. Bound to loopback only; the original
  file is not served. The five allowed URLs expose generated local viewer assets.
- [Generated local page](../../.cache/reference-cad/1778/local-viewer/index.html),
  [builder](build-local1778-viewer.mjs), [viewer implementation](local1778-viewer.mjs).
  The page needs its local server for binary loading; it is not standalone HTML.
- Source: user-supplied `Full Assembly 1778 2025.gltf`, **273,057,824 bytes**;
  SHA-256 `a52dc4f1110034338c01d2330df4bc13ef551dda42183001007b28e6bbfe8ce8`.
  glTF 2.0, generator `ONSHAPE BY PTC INC, 1.208`; original revision/configuration
  is not independently established by the local filename.
- Geometry is a **forked display derivative of source triangles**, not remodeled
  CAD. All source nodes, positions, raw matrices and per-material colors remain.
  Faces are merged within each mesh/material, without decimation. No invented
  joints, motion, handoff pose, coral or collision-clearance animation is present.
- Original and all three parent-owned cache artifacts were hash-checked unchanged.
  The derivative stays in ignored cache; nothing was uploaded or publicly rehosted.

Restart: `node research/2025-coral/build-local1778-viewer.mjs --serve 49178`.
Rebuild: `node --max-old-space-size=6144 research/2025-coral/build-local1778-viewer.mjs`.
Use another local port if occupied. The server does not browse arbitrary files.

## Complete Source Coverage

| Original Root | Source Assembly | Part/Body Occurrences | Face-Primitives At Occurrences | Merged Material Draws |
| --- | --- | ---: | ---: | ---: |
| 1 | Drivetrain Assembly | 64 | 11,891 | 126 |
| 132 | Arm Assembly | 123 | 10,101 | 159 |
| 382 | Elevator Assembly | 612 | 34,494 | 765 |
| 1637 | Intake Assembly | 341 | 30,123 | 411 |
| Total | All four source roots | **1,140** | **86,609** | **1,461** |

There are 2,329 nodes, 340 unique source meshes, 38,106 face primitives across
those unique meshes, and 473 merged mesh/material definitions. These are distinct
counting levels: faces are **not** physical parts. The previous 528-occurrence
extract's 52,115 rendered face primitives excluded the entire elevator root,
including two elevator motors and the arm-pivot motor. The viewer retains all of it.
Counts are exported body occurrences, not a procurement BOM: simplified purchased
assemblies and nonfunctional reference markers also remain as authored.

[Full 1,140-row source parts CSV](../../.cache/reference-cad/1778/local-viewer/source-parts.csv)
includes exact names, body metadata, source mesh/node indices and measured bounds.
[Full model record](../../.cache/reference-cad/1778/local-viewer/model.json) also
retains ancestry and matrices. [Evidence summary](local1778-evidence.json) links
the build, mechanical and browser records.

## Coordinate Frame And Measurements

**Z is up, X is width, negative Y is the intake/front.** This is established
from the actual chassis: four simplified MK4i bodies occupy the XY corners,
all with their lowest mesh plane at Z approximately 0; horizontal chassis tubes
have 25.4/50.8 mm vertical sections, and elevator uprights extend along +Z.
This is not 1690's Y-up convention. Loaded tire deflection/floor contact is untested.
glTF meters are converted to millimeters. AABBs are mesh extents, not drawings,
stock sizes, analytic fits or machining tolerances.

| Source Nodes And Exact Name | Measured Observation, mm |
| --- | --- |
| 1976 / 2070, LeftIntakePlate / RightIntakePlate | World XYZ 6.350 x 351.626 x 228.290; X centers +/-349.250 |
| 2098 / 2124, Left Alu Reinforcement / Right Alu Reinforcement | 2.286 thick, matching side-plate outline; outside the 6.350 plates |
| 1785 / 2252, TopCenterPlate | 6.350 thick; one measured world envelope 6.350 x 161.783 x 53.902 |
| 1753 / 1865, TopCenteringPlate / BottomCenteringPlate | 692.150 width; dominant surface-normal thickness approximately 6.35, not 46.24/39.73 world-Z height |
| 1714, IntakePivotAxle | X axis through Y=-330.200, Z=171.450; overall length 736.600 |
| 1783, IntakeRollerAxle | X axis, Y=-615.818, Z=273.194; overall length 711.200 |
| 2106, IntakeRollerAxle | X axis, Y=-563.243, Z=132.754; overall length 711.200 |
| 1765 / 1769 / 1789 / 2014, OuterCenteringWheelsAxle | X positions -313.5125 / +163.5125 / -163.5125 / +313.5125; YZ AABB center (-487.408,255.239); axial length 71.438 |
| 1773 / 2326, CenterCenteringWheelGearsAxle | Axial length 58.738; gear-shaft X centers +/-19.0627 |
| 1823, CenterCenteringWheelAxle | Axial length 42.799; AABB center (0,-482.729,242.582) |
| 210 / 304, ManipulatorPlate | Local thickness **4.7625**; world X extent 9.318 is tilt, not thickness; inner parallel-plate gap 50.800 |
| 314 / 326, ManipultorRollerAxle [source spelling] | Local length 123.825; parallel axes approximately (0.999663,0,-0.025960) |
| 214 / 302 / 332 / 363, 3-inch Compliant Wheel | Four source wheels, 76.200 diameter and 25.400 axial width; node 214 end-cap hex measures 12.700 across flats |
| 264, 54t Aluminum Plate Sprocket | 3.000 thick along Y, centered near X=0, Z=222.296; supports the fore-aft arm-pivot-axis interpretation |

Hex shaft side-face measurements are approximately 12.700 across flats. Actual
outer-centering axis is (0,-0.346466,0.938062), **20.271 degrees from +Z** in this
pose. The shaft lengths above are vertex projections along that axis, not diagonal
AABBs. End-cap edges on receiver wheel 214 produce six 12.700 mm hex flats.
The small flex wheel's stretch-bore cap contains other openings and six 9.525 mm
flat-distance candidates; this is **not** a certified installed fit or grounds
to replace its source-labeled half-inch stretch-bore interface.

## Contacts And Drives

The 44 source-labeled 2-inch flex wheels are **17 upper + 17 lower + 10 centering**.
Each long row spans about 641.350 mm in X, although its shaft is 711.200 long.
The ten centering wheels are five pairs at X=-313.5125,-163.5125,0,+163.5125,+313.5125.
Pair centers lie on two common YZ rows, (-480.43,236.37) and (-484.64,247.76).
The mesh does not establish a continuous conical V surface. The visible belt
layout forms a shallow chevron; that alone is not the contact geometry.
Four outer stations have belt drives. The center contact's rotation/constraint
state is not established. Five parts named GorillaTape include one center wrap
and four lower-row patches; their names do not prove physical friction or axle lock.

| Functional Path | Source Nodes And Observed Connections | Boundary |
| --- | --- | --- |
| Intake lift | X60 1735; 12t 2158 -> 40t 1651, coaxial 18t 1845 -> 46t 1791, coaxial 18t 2002 -> 60t 1946; axle 2026; twin 12t-to-32t chains to pivot 1714 | Nominal tooth-name ratio **75.720:1** assuming rigid compounds and engagement; not a motion/torque test |
| Upper pickup row | X60 1690, 18t pulley 2280 -> 20t 1673 through 75-tooth belt 1698; coaxial 20t 1974 -> 20t 1702 through belt 1787 to axle 1783 | Separate belt path; lower-row drive or lock cannot be inferred from this |
| Centering banks | X60 1868, 18t pulley 1771; 45/80/82-tooth belts; 30t gear pair 2032/2238 reverses the two mirrored trains | Four outer driven stations support opposing lateral contact motion; inward/outward electrical direction and successful centering unproved |
| Receiver rollers | X60 347 on arm, long belt 359, gears/pulleys and short belts to axles 314/326 | Powered receiver, not a vacuum head; rotation and grip force untested |
| Sideways arm pivot | X60 1336 in elevator carriage; spur stages, sprocket 1136 and arm sprocket 264 around Y | This motor was missing from the previous extract; angular range/flip limits not supplied |
| Elevator | X60s 796 and 886, base gearbox and lifting transmission | Both source motors retained; lift sequence/load capacity not verified |

Thus **three intake drive paths**, six functional drive paths across these
mechanisms, and **seven explicit X60-labeled motor bodies outside simplified
swerve modules** are present. Intake inventory includes seven belts, eight spur
gears and two chain-loop bodies. This is not a count of every motor inside the
simplified drivetrain. The three lift-gear mesh-center distances exceed nominal
20-DP tooth-name distances by approximately 0.0254 mm each; no operating backlash
or tooth-contact acceptance is claimed. Source labels are not supplier verification.

## Receiver And Architecture

Receiver roller centers are separated by 182.245 mm along Y. Subtracting the
76.2 mm wheel diameter gives a nominal 106.045 mm surface gap: 8.255 mm less than
a hypothetical 114.3 mm coral OD. That is a conditional interference estimate,
not measured compression, force, retention or a collision-free entry path.
The centering-contact envelope ends at Z=264.396, while the lowest receiver-wheel
mesh point is Z=715.865: **451.469 mm vertical separation in this source pose**.
The export is not an aligned receiving state. No receiver clearance pass, continuous
transfer, release path, arm escape, full flip, or stow/deploy sweep is established.

Compared with [1690's inspected geometry](CAD-INSPECTION.md), 1778 combines a wide
moving pickup/centering carrier with an elevator-mounted, sideways-pivoting arm
and powered four-wheel receiver. The intake pivot is along X; the arm pivot is
along Y. 1690 instead separates its compliant pickup from a chassis-resident
powered plan-view V indexer and vacuum receiver. 1778's paired rows/centering
drive are not equivalent to a passive V, nor is its arm merely a front-back
intake fold. It does not remove the need for a controlled receiving interface.

[Previously read first-party reports](1690-1778.md), E07-E11, describe centering
during raising, an intentionally immobilized lower axle, and alignment-sensitive
handoff. Those operating statements remain **author-reported**, not mesh-derived.
The three-motor source inventory differs from the older two-X60 description;
do not silently assign the older post's revision to this file.

## Construction And Unresolved Materials

The source shows separate cheeks, outer reinforcement sheets, bolted centering
plates, replaceable wheel/spacer stacks and bearing retention plates. This is
evidence of separable construction, not timed service access or qualified modularity.
Motor/gearbox support stays on chassis plates for intake lift; two chain paths
distribute that drive. Source parts IntakeHardstop 1944/2136 and GearboxCover 1918
provide specific stop/cover geometry. BreakerBar 1671 is 692.150 long and roughly
19.05 diameter, forward/above the upper pickup row. It is a potential impact/contact
member, not demonstrated crash protection. Belts and wheel rows remain exposed.

Material declarations are numeric PBR appearance descriptions, not certified
alloy/polymer specifications. Neither pale color, opacity nor a 6.35 mm thickness
establishes polycarbonate. Even the Alu Reinforcement names are source labels,
not alloy/temper verification. Small plates may deflect under load, but no
compliance, mass, fatigue, shock load or reliability result follows from this mesh.
Do not import 1690's reported collapse/contact mechanism into 1778 without evidence.

## Verification And Actual Visual Review

Build checks preserved triangle counts and local bounds, original file hash and
parent cache hashes. All 528 prior measurements compare within 0.000010801 mm;
the explicit 0.0001 mm comparison tolerance accommodates GLTFLoader's matrix
decomposition. The new viewer itself uses the raw source matrices unchanged.

Playwright in installed Edge passed **24 cases at 1440x1000 and 390x844**:
nonblank WebGL pixels (minimum 15,804), projected bounds inside canvas, no page
overflow, unchanged part transforms, assembly/part isolation, context retention,
orbit and fit. Four additional filtered detail captures preserve transforms.
All page requests used loopback; zero browser errors were recorded.

Images were opened and visually inspected, including
[full source](../../.cache/reference-cad/1778/local-viewer/1440-all-iso.png),
[intake top](../../.cache/reference-cad/1778/local-viewer/1440-intake-top.png),
[intake side](../../.cache/reference-cad/1778/local-viewer/1440-intake-side.png),
[centering detail](../../.cache/reference-cad/1778/local-viewer/detail-centering.png),
[exposed lift gears](../../.cache/reference-cad/1778/local-viewer/detail-pivot-drive.png),
[receiver detail](../../.cache/reference-cad/1778/local-viewer/detail-receiver.png),
chassis/elevator/arm views and
[mobile intake](../../.cache/reference-cad/1778/local-viewer/390-intake-iso.png).
Visibility-filter definitions are saved alongside the images. These checks prove
viewer operation and inspection coverage, **not manufacturing or robot performance**.