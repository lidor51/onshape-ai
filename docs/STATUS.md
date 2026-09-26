# Trial Status

## Latest: Collapsed Frame Geometry Corrected

The user identified the visible intake outside the starting frame perimeter.
The old display truly protruded 104.72 mm through the front frame plane and 6 mm
through each side; the newly installed deployment motor also protruded 22.61 mm
on the left. Merely changing fold angle or using the bumper perimeter could
not repair the fixed geometry.

The [physical corrected revision](../designs/coral-intake-v2/FINAL-FRAME.md) now
[opens collapsed with the frame shown](../designs/coral-intake-v2/final-frame-output/revision-clearance/index.html).
All 847 physical occurrences are inside X[-350,350], Y[0,760] at -165-degree
stow. Conservative non-rail reserves are 15.17 mm front and 5.10 mm per side,
including full rotor envelopes and continuous front float. Four motors, eight
belts, two chains, pickup, indexer and cradle are retained as physical geometry.
The 25 original and nine neighboring fixed clashes clear their bounded tests;
152 custom STEP round trips and the source-freeze checks pass. Orthographic
top projection shows no physical vertices outside the footprint.

This closes the nominal collapsed-envelope geometry failure, **not the global
competition-ready task**. Physical stow stops/holding, full fold/rotor clearance,
guards/cables/tolerances, structural and impact qualification, complete transport
and physical field testing remain open. Expected thread engagements are now
individually verified and separated from accidental collisions.

## Latest: Coaxial Single-Pivot Prototype, Not Complete

The request for a complete competition-ready intake remains **UNFULFILLED**.
[Current real-CAD candidate](../designs/coral-intake-v2/COAXIAL.md) and
[full-context viewer](../designs/coral-intake-v2/coaxial-output/revision-feed/index.html)
retain four authentic motors and all indexer/cradle geometry. It uses a single
positioning pivot concentric with the fixed rear roller, actual revised cheeks
and outer supports, a raised cradle and 10 mm inward kicker correction.

The isolated 170 mm pivot collided with the indexer; 250 mm also collided.
Coaxial -180-degree stow clashed with the indexer bracing; the new candidate stops
at -165 degrees. Nine geometry tests and 60 custom STEP round trips pass; 24
desktop/mobile viewer cases pass. Four explicit modeled thread-contact witnesses
and 1,602 unresolved contact cases remain in the bounded solid check. The sampled
crosswise route fails at nominal and -8-degree float, appearing only at an assumed
-4-degree float. This is an unresolved preload/contact design, not a feed pass.

Remaining: completed drives, mount/bracket interfaces, stop/holding and impact
design, in-frame width/stow containment, robust kicker hub, actual sensors/guards,
continuous feed/orientation/retention, manufacturing tolerances and physical tests.
No released drawings, no native editable Onshape subsystem, no readiness claim.
The sources and ignored local STEP/BOM exports are preserved with evidence rather
than replaced by another unsupported green status. No further authenticated API
calls. Earlier entries below are history.

## Latest: Single-Pivot Direction Restored

The user prefers the simpler single pivot and finds the parallel-link deployment
too large. The long-link layout is parked. A targeted
[compact-pivot screen](../designs/coral-intake-v2/SINGLE-PIVOT.md) finds a provisional
Y110/Z170 mm axis and 110-degree fold reduces pickup sweep height to about635 mm
from about835 mm for the rejected linkage, without changing deployed roller depth.
This is mesh-based packaging evidence, not revised complete CAD: fixed indexer,
receiver, motors, new supports and drive clearance remain to be resolved together.
Impact direction, lateral loads, stops and replaceable contact protection remain
mandatory design considerations. Existing full-system CAD is retained as failed
history; no manufacturing or competition-readiness status changes.

## Latest: Supplied 1778 CAD And Full-System Review

The user supplied1778's273 MB GLTF, now actually inspected locally with its
intake, arm/receiver, elevator drives and drivetrain retained:1,140 source body
occurrences, original bytes unchanged, no further Onshape requests.
[Reference inspection](../research/2025-coral/LOCAL-1778-INSPECTION.md) supersedes
the earlier1778 geometry-unavailable status. Live source viewer:
<http://127.0.0.1:49178/>.

Our [full subsystem view](../designs/coral-intake-v2/system-output/index.html)
restores the indexer, tray, four actual motors, first-stage gears and transmissions
that were omitted from the pickup-only study. Full-context STEP and BOM exist.
**Competition-ready status is BLOCKED**, not complete: two proven hard clashes,
2,188 unchecked pairs, unfinished drive stages/joints, and an unqualified impact
load path remain. The high-pivot design drives down under a frontal hit; the
replacement parallel-link candidate has favorable direction but near-toggle
leverage requiring about3.7 kN just to overcome screened gravity at deployment.
Neither is an accepted passive crash-relief mechanism.

[Materials policy](../designs/coral-intake-v2/IMPACT-MATERIALS.md) uses stiff
aluminum at bearing/drive datums and replaceable6.35 mm PC leading surfaces as
provisional roles. Actual TUFFAK GP sheet data and fastening guidance were read;
6.35 mm PC has only about4% of the same-contour6 mm Al weak-axis stiffness.
This is not interchangeable structural stock or proof of impact survival.
[ReCalc cross-check](../designs/coral-intake-v2/recalc-check.json) corroborates
the X44/10:1/5-inch no-load speed only, not loaded acquisition or deployment.

No material, machining, physical test or competition release is issued. Existing
API ledger43/140 and annual-allowance gate remain unchanged. Older results below
are history, not the current complete-system acceptance state.

## Latest: Entry Obstruction Corrected, Lean Pickup Study

The user's low-tube observation was reproduced with actual v1 B-reps: a full
floor coral intersects the front structural tube by8270.256 mm3 before reaching
the kicker. A separate [revision2 pickup](../designs/coral-intake-v2/output/index.html)
uses overhead bracing and direct-bearing cheeks; v1 remains byte-identical.
The viewer includes the rejected old tube as a comparison toggle, not a new part.

[Design decisions](../designs/coral-intake-v2/DECISIONS.md) answer the1778 link and
concept question, single-pivot tradeoffs, the proposed chassis-mounted fold drive,
the1/9 reference-derived design drift, and separate roller/pivot sizing. The old
uniform5:1 was not a justified deployment ratio. A current CAD-mass screen rejects
it;9-12:1 pickup and higher deployment reductions remain candidates, not selected
load-rated transmissions. Stock belt candidates changed front centers to155 mm.

New pickup-only [STEP](../designs/coral-intake-v2/output/assembly.step):279 instances,
8 machined and9 cut-stock definitions,17 custom STEP reimports. This excludes
drives, so the reduction from the old330 pickup occurrences is not like-for-like.
Centered yaw0/30/60/90 first-contact samples reach actual front-star elastomer
without earlier sampled hard obstruction. All84 solid-backed reference overlap
candidates are clear at checked poses;80 assumed bracket cases remain uncertain.
Continuous feeding, rotating contact, actual chassis mount, torque transmission,
holding, load/fit tolerances and field reliability remain unverified. The router-
relieved kicker hub has a0.61 mm minimum wall and is explicitly not a released part.

No authenticated requests or new cloud CAD in this continuation. The43/140 ledger,
annual-allowance requirement and prior failed evidence remain unchanged. The
new view is an engineering structure study, not a finished subsystem.

## Latest: Custom CAD Exists, Acceptance Fails

The subsequent request clarified that the1690 viewer must be distinguished from
our own design, requested a1778 retry, and returned to options1/9/14 with modular,
low-part-count, shop-compatible construction. The1690 viewer is actual reference
geometry; the new [custom CAD checkpoint](../designs/coral-intake-v1/checkpoint/index.html)
is our own1+9-derived B-rep design plus authentic vendor parts.

The integrated [assembly STEP](../designs/coral-intake-v1/checkpoint/assembly-not-released.step),
111 custom STEP parts and BOM now exist and are source-revision matched. Six actual
COTS products are bound. **This is not a completed or manufacturable subsystem:**
551 instances/111 unique custom definitions miss the simplicity goal, and the
fold/frame/pickup stack retains measured interference and inadequate stow margins.
Three assembly repair passes were exhausted. Full contact/handoff, load/holding,
sensor/guard/wiring, manufacturing and physical reliability gates remain open.
See [current files and verification limits](../designs/coral-intake-v1/CURRENT.md).

1778 retry: workspace assembly again HTTP500; published GLTF HTTP200 but its
stream exceeded the retained150 MiB ceiling. No complete1778 geometry was saved.
The failure is now known to be a local size limit for that file, not inaccessible
download permission. No larger download was approved. Ledger43/140; annual
allowance still unknown. No native Onshape design deployment or field-reliability
claim. The earlier status below remains history.

## Current: Actual Reference Inspection, Subsystem Unfinished

Updated 2026-09-18. The user authorized native-reference inspection followed by
autonomous subsystem development, superseding the earlier stop-for-selection
boundary. See [the controlling inspection/development gate](../research/2025-coral/CAD-INSPECTION.md).

1690's native assembly hierarchy and selected actual source meshes were inspected
at an immutable microversion: 493 source bodies in 955 pickup/indexer/receiver
and chassis-datum occurrences. [Open the private local source viewer](../.cache/reference-cad/1690-inspection.html).
This is a partial reference inspection, not new subsystem CAD. The powered V
indexer differs materially from the earlier passive-V sketches. The selected
development family is separate compliant pickup plus powered V indexing; final
geometry and receiver selection are not frozen.

Chassis geometry establishes native Y-up: the V is horizontal, with upright wheel
shafts. An earlier camera-based vertical-plane inference was corrected. Independent
plate-hole/slot inspection also rejected a simple pinned-four-bar reconstruction;
the small front bearing rides in a shaped slot. The floating contact and actual
drive coupling require a proper motion model, not an imposed animation.

1778's full and reduced assembly reads returned server errors; its blob download
saved no geometry. 2056 explicitly withheld native 2025 robot CAD. Their known
source limits are recorded rather than represented as completed inspections.
1690's imported pickup contains no mate features, and analytic body export
returned `BAD_GEOMETRY`; deployed motion/contact and receiver escape remain open.

The current annual API allowance is unverified. The user is unavailable to supply
it, so live CAD modeling remains blocked by the retained 500-call-reserve rule.
The cumulative ledger is 41/140 direct attempts, including 18/18 reference reads.
No manufacturing-ready custom subsystem, successful Onshape deployment or physical
reliability result exists. Prior failing geometry evidence remains unchanged.

## Previous: Intake Finalist Geometry Gate

Updated 2026-09-14 after the approved receiver redesign. Separate supported-belt
and 250 mm lift-away receiver revisions were implemented without changing legacy
files. **Both mandatory geometry gates still fail** after three local repairs:
the cassette retains entry/fold/contact conflicts, and the carrier receiver stem
and return path intersect the shaft/held coral. Direct verification produced
26 passing tests and two failing required acceptance tests, with no skipped tests.
The failures remain visible. See the [continuation results](../trials/intake-finalists/README.md).
No geometry-ready pair, new successful CAD model or Onshape deployment is claimed.

The user authorized local narrowing of 01/07/09/14 to two geometry-ready intakes,
then a selection before the Onshape finish. **That gate is not yet met.** The
[intake gate report](../trials/intake-finalists/README.md) preserves the original
screen and three local repair passes per candidate. Feed A retains belt/fold/contact
failures; carrier B retains a receiver-closing overlap and uncertified return
clearance. Software tests reproduce these failures rather than certify geometry.

Swerve side entry receives no inherent speed/turn penalty. Front/left geometry is
checked by rigid transformation and against the actual provisional chassis.
Neither failed draft is offered as a final user choice; no Onshape calls occurred.

The [robot home page](../outputs/whole-robots/mechanisms/index.html) now previews all
ten concepts; each opens [the dedicated task viewer](../outputs/whole-robots/mechanisms/viewer.html).
Older robot/task query links are preserved by redirecting to that viewer.

## Previous: Task-Specific Interaction Geometry

The newest request replaces generic nearby poses with actual task-interface studies.
[The task viewer](../outputs/whole-robots/mechanisms/viewer.html) filters tasks by
each robot's declared capabilities, shows L1-L4/processor/net and distinct coral/
algae acquisition, and compares approach/engage/release. A same-task table reports
mechanism settings and bumper stand-off for each design against a fixed field target.

[118 declared task images](../outputs/whole-robots/mechanisms/interactions/index.html)
include 98 acquisition/scoring cases and 20 legacy stow/endgame poses. The current
study exposes 20 acquisition/scoring configurations requiring further mechanism
work; they are displayed as failures, not claimed demonstrations. The remaining
aligned poses depend on explicit field/tool assumptions, not a full robot collision,
wrist-axis, trajectory, load or inspection validation. Source drawings now verify
processor aperture edges; net aperture and reef-algae centers remain assumptions.

The [task evidence](../outputs/whole-robots/mechanisms/interactions/README.md)
supersedes the previous fixed-distance scene behavior, while preserving previous
images and all intake state/2D flow drawings. No Onshape calls or CAD-kernel runs.

## Added: States And Field Context

The latest requested addition provides [six-state sheets for all ten robots](../outputs/whole-robots/mechanisms/states/index.html),
including collapsed/open, floor pieces, station, reef and cage approaches. The
interactive viewer now frames visible field geometry as well as the robot.
Official height datums are retained where known; unsourced profiles/placement
and reef-algae center markers are explicitly provisional. Proximity does not
establish successful contact, scoring, starting compliance or a loaded climb.

[Fourteen intake mockups](../outputs/concepts/mechanisms/index.html) add open,
collapsed and handoff states at a common per-intake camera scale. Original mouth
and receiver datums remain; all 28 original 2D intake SVG/PNG drawings are
byte-identical and stay visible in the new viewer. New 3D poses are illustrative
interpretations, not validated reconstructions. No new Onshape or kernel calls.

## Current: Mechanism Fidelity And Elite Role

Latest correction, 2026-09-13: full-robot outputs should resemble mocked mechanisms,
not just boxes; prefer simple, highly effective winning-alliance architectures.
[Revision 2 viewer](../outputs/whole-robots/mechanisms/index.html) adds original
roller/rail/plate/arm/shooter/hook primitives and separate selectable poses.
[The review](../outputs/whole-robots/mechanisms/README.md) prioritizes R03, benchmarks
R01, retains R09 as a specialist and R04 as a challenger. R07/R08 are contrasts.

The [architecture standard](ROBOT-ARCHITECTURE-STANDARD.md) records the inspected
Torrance post and three images, and separately the user-provided 254-attributed
cycle-first workflow. The new primitive recipes are not a solid conversion of
the old boxes; previous envelope checks do not validate their geometry. Mesh and
browser checks establish rendering/structure only. No mechanism, elite performance,
motion, rules, ballistics or loaded-climb pass is claimed. Zero Onshape calls.

## Earlier: Whole-Robot Space-Claim Study

Latest user scope, 2026-09-13: **ten complete coral + algae robot architectures**,
not ten more intakes. [Open the full-robot gallery](../outputs/whole-robots/index.html),
[overview](../outputs/whole-robots/overview.png) and
[recommendations](../outputs/whole-robots/README.md). R01-R10 include drivetrain,
both-piece routes, endgame choice, stow and electrical/battery space. Common 3D
coordinates produce axonometric, side and top views. No robot is selected yet.

[Game analysis](../trials/whole-robot-concepts/GAME-ANALYSIS.md) uses the cached final
2025 manual, updates and Q&A: scoring attribution, event-specific RP thresholds,
reef access, processor/net and climb tradeoffs. Unknown net rim, reef algae centers,
processor edge-specific target and cage engagement remain explicit, not invented
reach passes. Recommendations are conditional; no cycle time or score was simulated.

Seven focused checks pass for source contracts, static hardware envelopes,
tool/link coordinates, scoring data, image hashes/dimensions and local links.
These do not establish contact, piece clearance, motion, stability or climb strength.
The whole-robot step used zero API calls and zero CAD-kernel runs, and did not
alter the earlier intake sheets, API ledger or browser-modeling gate.

## Earlier Intake Concept Selection

Updated 2026-09-13 after the user's request for fast geometry-first iteration.
**Fourteen approximate concepts are ready in the [local gallery](../outputs/concepts/index.html)**,
with an [overview PNG](../outputs/concepts/overview.png) and
[selection table](../outputs/concepts/README.md). All use common view scales,
bumper/chassis context, proposed piece paths and explicit risks and prototype tests.
User selection of one or two precedes further geometry work.

Added 11: a 1690/2056 architecture hybrid, not a dimensional replica; 12: a real
bumper-cutout comparison explicitly in conflict with 2025 R401/R402/R405; and
13: an internal-bore gripper with vertical lift and outside receiver capture; and
14: a 1778 architecture clone with centering during raise and a carrier-locked
lower contact for powered handoff, not measured team CAD. Earlier drawings remain
unchanged; no concept was automatically selected.

The [five-stage workflow](DESIGN-WORKFLOW.md) now controls development: capabilities
and rules, research, concepts, geometry/PoCs, then detail. No concept has passed
acquisition, contact, retention, swept clearance, manufacture or compliance checks.
This step made zero Onshape calls and ran no CAD kernel. Local HTML preview checks
are separate from the unchanged Onshape browser-modeling policy gate.

The v4/v5 detail-first attempts remain failed/incomplete, preserved as evidence;
they are not a working subsystem or the default design to resume. The earlier
API ledger remains 23/140 attempts. No cloud milestone or assembly fix is claimed.

## Previous Subsystem Review: Not Complete

Updated 2026-09-12 after the user's COTS and mechanical-realism review. The
completed simple-intake trials below are a separate earlier phase; they do not
establish completion of the larger API-versus-browser subsystem experiment.

- **Design:** the pictured v2 model is a packaging/clearance study, not a credible
	fully engineered intake. It passed 62 sampled deployment poses, but did not
	establish coral capture, orientation, continuous transfer, retention or hardware
	load paths. Authentic-COTS v3 remains blocked/unfrozen and has no current complete
	sweep or full Onshape subsystem upload.
- **COTS:** local trials reuse CadQuery/OpenCascade, not several independent
	kernels. The exact WCP motor corpus has not been tested through Onshape/Parasolid.
	New nearest-boundary diagnostics support reparameterization as the bearing's
	old comparison problem; they identify an X44 rear-cover trim discrepancy after
	round-trip and leave the very small main-body residual inconclusive. The original
	X60 import validity failure is separate. Frozen results and vendor bytes remain
	unchanged; no blanket COTS or kernel failure is claimed.
- **API:** the latest saved arm ledger contains 23/140 attempts, 117 remaining.
	Transport success did not establish native success: the base-fixing feature is
	still in error and motion/limit enforcement remains unproven. No authenticated
	calls were made for this diagnostic/design-review step.
- **Browser:** the user now reports a connected Playwright browser and has shared
	an Onshape page. That removes the lack of a shared page as a factual obstacle,
	but does not prove an assembly operation succeeded or resolve the protocol's
	existing platform-policy gate. No browser calls or new login were attempted here.

### Previous Corrective Priorities (Superseded By Stage Gates)

1. Keep the functional Concept A split, but redesign its contact path before
	 adding more detail: adjustable compliant pickup contact, overlapping controlled
	 transfer, actual orientation contacts, and a cradle with stops/retention and a
	 receiving-tool access path. A folded pickup is not the same as a floating roller.
2. Close physical interfaces and load paths: mounts, fasteners, shafts, bearings,
	 axial retention, drive reactions, hard stops and powered-off release. Native
	 fixed connections and joined display solids do not establish those details.
3. Preserve original manufacturer files for a future controlled destination-import
	 test, with placements and connector data separate. Do not require a redundant
	 OCCT re-export merely for convenience. This is a proposed pipeline revision,
	 not a passed import or a waiver of the existing frozen packet checks.
4. Keep interchange diagnostics and native joint debugging separate from mechanical
	 development. More realistic renders or smaller volume residuals alone do not
	 increase the evidence that the intake works. Do not claim A/B speed or reliability
	 while the browser arm has no execution result.

Current review artifacts:

- [COTS diagnosis, measured witnesses and online sources](../trials/subsystem-ab/cots/ROUNDTRIP-ANALYSIS.md)
- [Mechanical review, reference discrepancies and corrective options](../trials/subsystem-ab/shared/DESIGN-REVIEW.md)
- [V3 packet status](../trials/subsystem-ab/shared/packet-v3/REPORT.md)
- [Native pilot status](../trials/subsystem-ab/api/REPORT.md)
- [Browser admission status](../trials/subsystem-ab/browser/REPORT.md)

## Earlier PoC Results (2026-09-11)

The earlier bounded continuation completed its executable trials. The
browser-only stage remains explicitly BLOCKED by its service-terms admission
gate; no browser automation or API fallback was used for that stage.

| Trial | Outcome | Limits |
| --- | --- | --- |
| Original native API, FeatureScript/API, community Jarvis MCP | PASS: real baseline/revision CAD, geometry checks, images and STEP | Original PoC complete, not mechanical certification |
| Official Onshape Labs MCP | PASS for official modeling plus supplemental REST verification/export: same retained feature, both nine-solid states, PNGs and STEP archives | Source-default revision, no exposed UI parameters; not a pure-MCP end-to-end capability pass |
| Native-template reuse | PASS: native template, independent editable copy, preserved editor changes and original baseline | Solver DOF and actual human UI usability UNVERIFIED; 84/120 attempts including setup/repairs, six-call revision |
| Manufacturing package | PASS: immutable Onshape A/B exports to verified local PDF/DXF/PNG plus original STEP | TEST_ONLY, not approved; not native associative Drawing tabs; 31/80 attempts, eight per snapshot |
| Local-preflight/browser | Local PASS: six candidates + 25 sweep states, valid solids, measured bores and STEP round-trips | Browser BLOCKED; no Onshape compilation/UI/download/quota claim for this route |

## Outputs

- [All model and output links](../README.md#open-the-outputs)
- [Official retained model](https://cad.onshape.com/documents/f92dc90f7c052de045dd2c4f/w/b60d9355149429c9c55f69c8/e/d0a579bf1b84bc1e68e06e90)
- [Native revised copy](https://cad.onshape.com/documents/2db9a7eda58817bb0ba921b8/w/511535852de274d393a2ea6c/e/87e35d1bfe08c90c7ac97c4f)
- [Real revision B drawing](../outputs/manufacturing-package/B/package/drawing.pdf)
- [Real revision B cutting profile](../outputs/manufacturing-package/B/package/profile.dxf)
- [Local-only six-hole solid](../outputs/local-preflight/candidates/B-final-six/local.step)
- [Follow-up file hashes and evidence labels](../outputs/followup-manifest.json)

## Verification And Budget

Passed local checks: 154 non-official Node tests, 80 official-route tests, two
follow-up bundle tests, 60 manufacturing Python tests. The local preflight record
contains eight Python kernel tests and 31 solid/STEP states; its current audit
checks input, runtime and artifact hashes. These are different suites, not equal
measures of route quality. Geometry and layout checks do not confer engineering
approval.

Historical official quota response (earlier PoC, not a current quota check):
**479 used / 2,500 limit / 2,021 remaining**.
Before this continuation it was 273 used. The two added API trials have persistent
hard-cap ledgers: native 84/120 attempts (83 known successes, one historical
interrupted read), manufacturing 31/80 (all successful).

Official accounting has a limitation: 13 observed MCP invocations exceeded the
earlier 12-call plan by one. The service does not expose every internal request.
Its direct supplementary REST work used 29 attempts, 27 successes: eight discovery
and 21 readback/export attempts. The account delta of 206 minus the other trials'
114 known successes leaves 92, but that residual is not a fully instrumented
official-route cost or proof of its 100-request planning-reserve compliance.
No allocation switching, deletion, sharing changes or additional quota spending
was used to conceal this discrepancy.

The user explicitly authorized the current local key after the exposure warning;
the runners recorded that separately from rotation. No claim of replacement was
made. No credential values were displayed in this continuation. Rotation remains
recommended; the official service used its separate OAuth connection.

## Reports

- [Updated comparison](COMPARISON.md)
- [Official MCP](../trials/official-mcp/REPORT.md)
- [Native template](../trials/native-template/REPORT.md)
- [Live manufacturing package](../trials/manufacturing-package/LIVE-REPORT.md)
- [Local preflight and browser restriction](../trials/local-preflight-browser/REPORT.md)