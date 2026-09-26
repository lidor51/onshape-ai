# Shared Local Engineering Handoff

## V4 Continuation: Local Demonstrator Blocked

2026-09-13: continued the same [v4 source](v4/build.py), not a new design round.
The original nine deployed mount/trunnion/hub-fastener interferences are repaired
and pass an exact four-angle scoped check. Deployment pinion now counter-rotates
at 3:1; the authentic gear pair passes those phases. Thirteen exact inlet poses
have opposing compliant contacts, require at most 7.84046 mm of the 12 mm float,
and have zero rigid roller-core intersection. Nominal upper-guide seams are closed.

**BLOCKED_LOCAL_CAD_DEMONSTRATOR, not LOCALCAD_DEMONSTRATOR_PASS.** Three geometry
repair cycles are exhausted. The bounded 126-pose all-pairs run terminated at
600 seconds with durable exit 124 after 38 baseline poses; revision was not swept.
Actual moving roller ends hit the towers, moving shafts/rollers hit the deployment
drive, and maximum measured forward extension is 501.70103 mm versus 457.2 mm.
The 30-degree coral pose intersects `orienter_1_0_shaft` by 1875.46647 mm3.
Original X44 body 0 includes a nonseparable shaft presentation; the rotating
pinion intersects that fixed presentation. No source splitting, reexport, new
blanket exemption, tolerance relaxation, or v3 gate was used to hide a failure.

Physical drive and attachment completion is still blocking: chain loops,
tensioners, motor-output connections to pickup/fixed/orienter shafts, deployment
gear-to-trunnion adapter, plug retention, anchored/preloaded floating guides,
complete frame/motor/stop/sensor hardware and guards are missing. These are
not merely physical friction/thermal qualification. Do not submit this model as
a finished or mechanically connected demonstrator. Material grades, assumed
38x2 mm tube stock and shop tolerances are TEST_ONLY, not release specifications.

The existing 11 pickup lower rollers remain; four fixed rollers and one upper
roller make 16 total. No rollers were added. Fewer driven stations with continuous
belt/guide support could simplify the mechanism, but that topology and its
controlled contact coverage have not been implemented or validated here.

Current artifacts:

- [Summary and exact blockers](v4/summary.json), [hash-bound diagnostic checkpoint](v4/checkpoint.json).
- [Native catalog](v4/native-catalog.json): 510 modeled occurrences, including five
   references; 505 nonreference occurrences, 58 unique definitions, 28 logical
   motion groups. This is not an exact purchase-piece count: some retainer geometry
   combines screw/washer presentation and missing hardware is not counted.
- Four untouched vendor files contain five authentic source bodies, placed 56
   times with original topology preserved. [COTS evidence](v4/cots-preservation.json)
   carries original paths, hashes, body indices and source-to-attachment frames.
- [Baseline exports](v4/baseline/custom-roundtrip.json) and
   [revision exports](v4/revision/custom-roundtrip.json): 106 unique generated-part
   checks PASS, plus independent 454-body generated-only assembly readbacks PASS
   for both widths. Original vendor files were not reexported.
- [Editable source](v4/source/concept-a-v4.fs), [connectors](v4/source/connectors.json),
   [106 local recipe parity checks](v4/source/recipe-parity.json): `mouthWidth`,
   `receiverHeight`, `topFloat` present; native compilation/UI/mates UNVERIFIED.
- [Scoped probe](v4/mechanical-probe.json), [partial full sweep](v4/validation.json),
   [coral samples](v4/contact-samples.json), [11-regression exit](v4/test_layout.exit.json),
   [final gate exit 2](v4/packet.exit.json), [execution history](v4/execution-history.jsonl).
- Six real depth-buffered VTK images pass [pixel checks](v4/preview-checks.json).
   [Deployed](v4/previews/baseline-deployed.png), [stowed](v4/previews/baseline-stowed.png),
   [side](v4/previews/side-contact.png) and [plan](v4/previews/plan-contact.png) were
   visually inspected. Contact overlays show alternative single-piece poses,
   not multiple stored coral. Missing connections remain visible.

Parent scaling recommendation: supported bulk occurrence insertion plus logical
rigid-group operations, at the current 28-group scale within the roughly 50-group
planning target. Every physical member still needs source/body/placement readback;
grouping is not permission to omit hardware or claim a guaranteed call count.
The catalog is diagnostic and **not admitted**. No network, API, browser,
credentials, sibling-arm writes, commits or delegates were used.

Run the final local artifact audit with
`node trials/subsystem-ab/shared/v4/audit.mjs`. It verifies and seals the existing
diagnostic packet without rerunning the failing motion gate or making API calls.
Physical friction, thermal duty, torque/brake, reliable capture and manufacturing
release remain UNVERIFIED, separately from the explicit blocking CAD defects.

## Current V3 Result: Blocked, Unfrozen

2026-09-12 continuation: **V3 SOURCE ROUND-TRIP BLOCKED. No V3 freeze, full
sampled sweep, native admission or manufacturing release.** The current result is
[packet-v3/REPORT.md](packet-v3/REPORT.md), with measured status and hashes in
[packet-v3/continuation-status.json](packet-v3/continuation-status.json).

The prior V3 implementation partitioned X44 body 0 and invented rotating-shaft
instances. That assumption is removed. Both authentic solids remain unchanged:
body 0 is the combined housing/shaft presentation, body 1 is the fixed rear cover.
OpenCascade `IsPartner` confirms unchanged underlying topology for all six source
bodies from five vendor files, with rigid location changes only. X60 remains
quarantined. No COTS original or parent manifest was modified.

The corrected [current contract](packet-v3/current/assembly-contract.json) has
52 native instances, 51 mates, six relations and 102 source-owned connector
definitions. [Source bindings](packet-v3/current/cots-bindings.json),
[geometry payload](packet-v3/current/source/geometry-payload.json),
[connector frames](packet-v3/current/source/parametric-connectors.json),
[uncompiled source candidate](packet-v3/current/source/concept-a.fs), and
[controls](packet-v3/current/ui-edit-map.json) are current but **not admitted**.
Older root V3 `source/`, `baseline/`, quick validation and phase artifacts retain
the prior split-model evidence; do not use them as the current packet.

Default STEP readback fails the unchanged strict volume budgets for X44 main:
0.017142343 mm3 versus 0.011210731 mm3; rear cover: 0.733032533 mm3 versus
0.01 mm3. Original-source OBB-frame errors are below 1e-11 mm, but that is not
geometry equivalence. Rear-cover surface-type counts change on readback. Tighter
integration/recentering did not resolve the historical main-body discrepancy;
the current no-pcurve export experiment also fails. The underlying OCCT
serialization/healing mechanism remains unproven. No tolerance was relaxed.

Bearing, pinion, output gear and AndyMark REV2 wheel pass scalar/bounds checks.
The bearing's B-rep correspondence is separately UNVERIFIED: the existing UV
parameter sampler is not invariant to reparameterization. Pinion, output gear
and wheel pass the current sampled correspondence check, not a continuous proof.
See [source corpus](packet-v3/original-source-roundtrip-probe.json) and
[OBB/B-rep evidence](packet-v3/source-brep-roundtrip-probe.json).

[Six focused regressions pass](packet-v3/current/tests.json), including 306
parameter-frame checks, fail-closed source gates, and unchanged V1/V2 freeze
verification. These are contract/regression results, not a V3 motion PASS.
`v3_finish.py` now executes fresh scalar and B-rep gates before a full sweep or
freeze. Internal motor motion, native effective FeatureScript geometry,
connectors, mate health, UI use and full revised motion remain unverified.

Run from the repository root with the existing environment, without installs:

```powershell
node trials/subsystem-ab/shared/v3_run.mjs v3_source_probe.py
node trials/subsystem-ab/shared/v3_run.mjs v3_source_probe.py --no-pcurves
node trials/subsystem-ab/shared/v3_run.mjs v3_brep_probe.py
node trials/subsystem-ab/shared/v3_run.mjs v3_resume_test.py
node trials/subsystem-ab/shared/v3_run.mjs v3_resume_report.py
```

The first three currently return failure, which must not be relabeled PASS.
The runner preloads installed VTK 9.3.1 before CadQuery 2.6.1 and uses the existing
explicit manufacturing virtual-environment interpreter. It awaits one process,
streams logs locally, and installs a Python network/subprocess-denial audit hook.
No polling, new environment, network, credentials, browser, delegation or commits.

The [request plan](packet-v3/current/api-source-plan.json) requires 131 attempts
for a conservative fresh API arm, not 131 additional requests on an existing
ledger. Parent owns remaining headroom under the 150 global / 140 API / 10
overhead cap. There is no arbitrary 45-instance limit. Native rigid groups are
conditional on supported schemas and readback of every logical member.
Teeth manufacture, materials, loads, hardware retention, guarding, wiring, brake,
jam handling, physical acquisition and manufacturing release remain UNVERIFIED.

## Historical V2 Result

2026-09-12: the authorized single v2 repair is complete as a **LOCAL GEOMETRY
PASS**, with **FULL ADMISSION BLOCKED / BUILD UNVERIFIED / COTS PENDING**.
Use [packet-v2/REPORT.md](packet-v2/REPORT.md) for the current result and exact
remaining defects. Both original clashes are repaired; the unchanged full
all-pairs checker passes 31 poses per variant, baseline and revision. There are
62 round-tripped STEP files, six previews, regenerated FeatureScript with the
same UI parameter map, and a source/neutral-frame/STEP hash freeze.

The opaque 8:1 reducer was replaced by a dimensioned supported 16:128 stage
driving the 16:96 final stage. This is still **UNVERIFIED_BUILD**, not a finished
tooth/hub/retention/load-rated gearbox. Full native count is 48 versus the
conservative 45-instance ceiling. Those are concrete independent non-vendor
blockers; geometry PASS does not admit the full mechanism. Authentic COTS remains
separately PENDING and its manifest was not read. No upload or live work occurred.

The original six implementation/source files and all 84 sealed v1 artifacts
remain unchanged and hash-verified. V2 uses additive modules only. Run the current
check with `v2_test.py`; `v2_test.py --admission` returns BLOCKED/exit 2. The legacy
commands and limitations below describe v1 only and are preserved as history.

## Historical V1 Handoff

Date: 2026-09-12. **PARTIAL: actual local CAD delivered; geometry-motion and
paired API/browser admission are BLOCKED. Not mechanically released.**

Only this shared directory was written. Zero Onshape API calls, no browser,
credentials/environment-file access, live-account access, delegates, commits,
reference-CAD branching, installations, or sibling-arm results were used.

## Exact Freeze Packet

The immutable diagnostic version is
[packet-v1/freeze.json](packet-v1/freeze.json), version `concept-a-local-v1`.
It hashes 84 artifacts, six local input/source files, and six permitted upstream
engineering/protocol inputs. It intentionally says
`FROZEN_DIAGNOSTIC_PACKET_NOT_ADMITTED` and `apiBrowserAdmission: BLOCKED`.
Do not run either live arm from this version, even if COTS files arrive later.
Repairs require an authorized new packet version and fresh checks, not edits to
the sealed files or relabeling failed samples.

| Deliverable | File |
| --- | --- |
| Complete part roles, assembly graph, frames and relations | [packet-v1/assembly-contract.json](packet-v1/assembly-contract.json) |
| Neutral geometry construction recipes and Part Studio layout offsets | [packet-v1/source/geometry-payload.json](packet-v1/source/geometry-payload.json) |
| Editable native custom-part source candidate | [packet-v1/source/concept-a.fs](packet-v1/source/concept-a.fs) |
| Parameters and assumptions | [packet-v1/source/parameters.json](packet-v1/source/parameters.json) |
| All baseline/revision part measurements and instance pose matrices | [packet-v1/expected.json](packet-v1/expected.json) |
| Sample-by-sample solid, hole and motion evidence | [packet-v1/validation.json](packet-v1/validation.json) |
| Real source-geometry revision and local datum preservation | [packet-v1/revision-report.json](packet-v1/revision-report.json) |
| Human-editable controls and dependencies | [packet-v1/ui-edit-map.json](packet-v1/ui-edit-map.json) |
| Parent COTS bindings, deliberately pending | [packet-v1/cots-bindings-pending.json](packet-v1/cots-bindings-pending.json) |
| BOM scope, rigid modules and omitted hardware | [packet-v1/bom.json](packet-v1/bom.json) |
| Actual runtime and export duration | [packet-v1/runtime.json](packet-v1/runtime.json) |
| Final local regression result | [tests.json](tests.json) |

## Tangible CAD

There are **27 unique neutral-coordinate part definitions**, each exported in
baseline and revision: **54 individual named STEP files**. Six additional STEP
assemblies cover deployed, midpoint and stowed in both variants: **60 STEP files
total**. Every STEP was reimported through OpenCascade and checked. Each individual
file contains one closed, valid positive-volume solid; each assembly contains
46 separate named solids, not one fused assembly-shaped body.

The target native assembly contains **45 instances**: 22 custom/rigid-module
instances, 20 explicitly non-vendor COTS envelope instances, and three chassis,
bumper and receiver references. The 46th preview/export solid is the optional
nominal coral diagnostic reference. It is not an extra robot part or a second
stored piece. This count is top-level modeling granularity, not a complete
physical-parts or fastening count. Some custom rigid modules combine stock,
bosses or hubs; their detailed joining remains unfinished in the BOM.

- [Baseline deployed STEP](packet-v1/baseline/deployed.step) and [PNG](packet-v1/baseline/deployed.png).
- [Baseline midpoint STEP](packet-v1/baseline/mid.step) and [PNG](packet-v1/baseline/mid.png).
- [Baseline stowed STEP](packet-v1/baseline/stowed.step) and [PNG](packet-v1/baseline/stowed.png).
- [Revision deployed STEP](packet-v1/revision/deployed.step) and [PNG](packet-v1/revision/deployed.png).
- [Revision midpoint STEP](packet-v1/revision/mid.step) and [PNG](packet-v1/revision/mid.png).
- [Revision stowed STEP](packet-v1/revision/stowed.step) and [PNG](packet-v1/revision/stowed.png).
- Neutral individual part paths, hashes and measurements are indexed under each
  variant's `parts` map in [packet-v1/expected.json](packet-v1/expected.json).

PNGs are 1620 x 1100 projections of actual B-rep tessellation, rendered with
Pillow. Deployed preview has 836 colors and 578,015 non-background pixels.
Deployed and stowed images were visually inspected. The simple triangle-depth
painter can show facet/occlusion artifacts; STEP/B-rep checks, not the preview,
are the clearance evidence.

## Geometry And Drive

Coordinates are x across, y rearward from the front robot perimeter, z upward
from floor. Chassis is 700 x 760 mm, nominal perimeter 2920 mm. The complete
bumper ring is 85 mm outward, z=45..165 mm, with no pickup notch; its 120 mm
height fully covers the required 63.5..146.05 mm interval. This is a packaging
keepout, not a verified material/backer/fastening construction.

Pivot is `(0,100,410)` mm, revolute axis +X. Deployment is 0 degrees;
stow is -145 degrees; midpoint is -72.5 degrees. The lower drum center is
`(0,-360,-370)` mm relative to the pivot. Drums are 54 mm OD with a continuous
3 mm belt; lower belt-floor clearance in the deployed envelope is 10 mm.
The initial 127 mm drum path collided with the bumper and was rejected; both
the original failed and corrected isolated-conveyor sweeps are retained.

The nominal `mouthWidth` control is 500 mm, revised to 520 mm. Measured clear
distance between side-plate inner faces is control +4 mm, not exactly the UI
number. Usable belt width is control -60 mm, and drum length is control -30 mm.
This distinction is explicit because nominal frame width is not usable grip
width. All three grow by 20 mm in the revision. Upper fixed hex spine remains
612 mm long, and pivot/receiver positions do not move under that revision.

Pickup power path: X44 envelope -> 16t pinion -> custom 96t output/hub -> upper
drum -> real closed belt envelope -> lower drum/hex shaft. Ratio is 6:1, not
the earlier 3:1 research example. At the research 7758 rpm no-load endpoint,
the 60 mm belt outside diameter corresponds to about 4.06 m/s. This is not a
safe operating command or loaded-performance prediction.

The fixed orienter has separately supported left/right vertical hex shafts,
70 mm custom contact drums, upper/lower bearing envelopes and independent X44
16t/48t drives at 40.64 mm centers. These drums are not relabeled AndyMark vendor
wheels. Positive left and negative right +Z shaft rotation nominally feed +Y;
independent control is intended for orientation, not a proven control strategy.

Deployment has a modeled external 16t/96t stage at 71.12 mm centers, with the
output bolted to the left carrier. The upstream X44 plus assumed 8:1 reducer is
an **unselected rigid envelope**, giving a hypothetical 48:1 total. Internal
reducer geometry, actual product compatibility, adapter/mount, brake and torque
capacity are not complete. It must not be advertised as a selected working drive.

A fixed sloping transfer plate leads toward a 330 mm long, 100 mm wide V cradle
holding one nominal 301.625 x 114.3 mm coral, axis +Y, centered `(0,440,320)` mm.
Only one nominal coral is modeled; cavity arithmetic does not prove whole-robot
occupancy control, acquisition, orientation or reliable handoff. The rough
receiver is an open fork, not a completed gripping actuator.

## Validation Results

| Gate | Result | Evidence |
| --- | --- | --- |
| Regression tests | PASS | 14 tests, zero failures/errors/skips after freeze |
| Baseline/revision solids | PASS | 27 + 27 valid, closed, positive-volume single parts |
| Separate STEP round trips | PASS | All 54 individual parts and six 46-solid assemblies |
| Hole interfaces | PASS | 25 bore checks and 300 empty-bore sample points per variant; matching real cylinder faces |
| Deployment samples | FAIL | 31 per variant, 5-degree increments plus exact midpoint; 62 total |
| Sampled bumper/floor/perimeter bounds | PASS | Minimum moving-part/bumper distance 8.2577 mm; max sampled front extension 446.1880 mm |
| Stowed envelope | PASS | x=-350..350, y=0..760, z=70..949.5738 mm, excluding bumper/coral as stated |
| +20 mm source edit | PASS locally | Six neutral part geometries change; instance and mate role IDs retained |
| Pivot/receiver preservation | PASS locally | Same pivot world frame and receiver attachment/geometry under mouth revision |
| Independent receiver edit | PASS locally | 320 -> 350 control changes fork geometry and raises its lower datum 30 mm without changing pickup width |
| Native mates, relation execution and identity retention | UNVERIFIED | Contract only; no native Assembly was created |
| FeatureScript compilation/UI usability | UNVERIFIED | Offline source emitted and statically checked only; no Onshape or human UI test |
| Authentic COTS bindings | BLOCKED | Pending parent source/version/units/interface checks |
| Physical contact, load/stress, continuous motion, release | UNVERIFIED | No physical tests, stress calculation, thermal duty or manufacturing release |

The pair checker considers all 1,035 pairs of 46 solids at each pose. It uses
bounding-box rejection and reuses same-motion pair results, not a blind all-pairs
Boolean on every repeat. Six exact semantic exclusions are permitted: four
designed gear-addendum overlaps and two coral/compliant-drum contacts. No wildcard,
same-subsystem blanket exclusion, or exemption for either unexpected clash exists.

Remaining geometry failures:

1. `pickup_gear_guard` / `pickup_right`: **298.4543 mm3**, both variants, every
   sample. The small pinion guard intersects a motor-mount standoff. Revise the
   guard/standoff clearance geometry in a new version, not the exclusion list.
2. `pickup_motor` / `transfer_ramp`: sampled at **-50 through -10 degrees** in
   5-degree steps. Maximum overlap is **7297.8723 mm3 baseline**, **5426.6230 mm3
   revision**. The start/mid/end-only check missed this, demonstrating why the
   full incremental sweep matters. Repackage the ramp/drive while retaining a
   defensible coral transfer surface, then rerun the full sweep.

The limited geometry-repair sequence stopped with these failures retained. Every
final motion sample remains FAIL because the guard clash exists in all poses.
Passing regression tests explicitly assert that failures are preserved; they
are not a substitute for a motion PASS.

Continuous swept clearance is not proven by sampling. A separate radial bound
for the conveyor is `sqrt(360^2 + 370^2) + 30 - 100 = 446.2364 mm` front extension;
this analytic conveyor bound is distinct from whole-assembly sampled checks and
does not include unmodeled fasteners, cables, flex, impacts or game-piece motion.

## Native Arm Contract

The JSON is an internal, explicit engineering contract, **not invented Onshape
REST request JSON**. It contains neutral part roles, instance placements and
parent/child mate frames in 4x4 row-major, column-vector form, with millimeter
translations. A joint frame's +Z axis is its revolute axis. Native adapters must
use documented platform schemas and observed source identifiers.

There are nine revolute joints and five transmission relations. The pickup
deployment joint has -145..0 degree limits; the other eight revolute joints are
continuous with no finite travel stops. Those are requested native constraints,
not verified hardware stops. The flexible belt solid is fixed only as a geometric
clearance proxy; the belt relation is required separately. Independent roller
spin phases, coupled native gear relations and elastic belt dynamics were not
executed by the local deployment sweep.

The native arm must instantiate named parts, create actual fixed/revolute mates,
test limits and independence, perform the width edit without deleting/reinserting
instances, and inspect retained mate health. Importing the deployed STEP as one
body, or merely restoring static poses, **does not satisfy native assembly**.

The FeatureScript candidate preserves version 3070 from the existing local
geometry template. It exposes `mouthWidth`, `receiverHeight`, an off-by-default
COTS-envelope study toggle and an off-by-default coral-reference toggle. Default
output is 21 custom/reference unique parts; actual COTS must be separately bound
to approved native/vendor sources. Generated parts are laid out in a fixed grid;
subtract the role's source layout offset before applying its neutral-to-world
instance transform. Do not treat the Part Studio grid as assembly placement.

Part names/roles are stable local identifiers. Native element, part, face and
instance IDs are deliberately absent until the authorized arm actually observes
them. Width-dependent connector positions require an adapter update or native
parametric connector implementation; automatic Onshape topology tracking is not
claimed. Non-coder UI usability is still untested.

The receiver control intentionally changes two things: fork leg length is
`receiverHeight - 110`, and attachment world Z is `receiverHeight + 85`. Its
mouth-width independence is tested, but its meaning is not a measured acceptance
height for a real gripper. Hole locations, fits, pivot Y/Z, gears, ramp shape and
drum diameter are fixed source choices, not separate UI controls in this version.

## Parent COTS And Remaining Engineering

Do not read sibling API/browser results to complete this packet. The parent COTS
work may bind exact approved manufacturer/catalog files and versions into a
new packet. Every current motor, bearing, pinion and purchased-output-gear body
is tagged `NOT_VENDOR_GEOMETRY`. The 8 mm gear face envelope is not conservative
against the researched WCP-0137 12.7 mm overall width; authentic replacements
must trigger axial-stack and collision checks. Motor shaft extension, flange
details, spline form, exact mounting clocking and loads are pending.

Chassis, bumper and receiver references and coral are excluded from manufactured
BOM. Repeated screw solids are omitted, with nominal known counts and incomplete
items documented rather than inflated into a released fastening list. Current
rigid tower/ramp/drum modules are not proof of routable monolithic stock. Stock
grades, print materials, shop travel, joining, shaft stiffness, motor/reducer
mounting, guards/side covers, hard stops, axial retention, cable routing, sensors,
current limits, powered-off retention/release and interlocks remain review items.
No precision metal bending is assumed.

Physical coral compliance/contact, acquisition from arbitrary poses, centerline
accuracy, transfer over the gravity transition, one-piece interlocks and receiver
capture are not provable from these solids. They remain UNVERIFIED, not PASS.

## Local Runtime And Recheck

Actual runtime: CadQuery **2.6.1**, cadquery-ocp **7.8.1.1.post1**, VTK **9.3.1**,
Pillow **11.3.0**, reportlab **4.4.3**, pypdfium2 **4.30.0** in the existing
manufacturing virtual environment. The unavailable tool loader was not treated
as a blocker: the explicit existing interpreter was verified and used. `-I`
failed DLL/visualization loading; the verified `-B` command worked. No interpreter
selection, dependency or environment-file changes were made. Local audit hooks
deny network socket operations and child processes; this is not an OS-firewall
claim. Exports took 35.674 seconds; full two-variant motion validation took 18.976
seconds. These are phase runtimes, not fabricated total engineering wall time.

Run from the repository root:

```powershell
& '.\trials\manufacturing-package\.venv\Scripts\python.exe' -B '.\trials\subsystem-ab\shared\packet_test.py'
& '.\trials\manufacturing-package\.venv\Scripts\python.exe' -B '.\trials\subsystem-ab\shared\packet_test.py' --admission
```

The first returns 14 passing regression tests. The second must return BLOCKED
with exit code 2 and zero API calls. Geometry generation refuses to overwrite a
sealed version. A new repair/version cycle needs parent authorization before
either live arm can receive an admitted shared packet.