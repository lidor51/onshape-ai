# Coaxial Pickup Candidate

**Current packaging:** The old viewer below is superseded by the
[frame-contained full-powered revision](FINAL-FRAME.md) and
[starting-envelope viewer](final-frame-output/revision-clearance/index.html).
It corrects the actual front/side protrusions without enlarging the frame or
hiding hardware. Nominal stow containment passes; physical stops/holding and
broader manufacturing/field qualification remain incomplete. This page's prior
counts, missing-transmission statements and failed bounds are historical.

## Current Revision: Feed Spacing And 165-Degree Fold

**The complete competition-ready task is not finished. No manufacturing release.**

[Open the current full-assembly review](coaxial-output/revision-feed/index.html),
[deployed STEP](coaxial-output/revision-feed/coaxial-deployed-NOT-RELEASED.step),
[folded STEP](coaxial-output/revision-feed/coaxial-stow-NOT-RELEASED.step), and
[BOM](coaxial-output/revision-feed/BOM.csv). The parametric source is
[coaxial_pickup.py](coaxial_pickup.py). These are local OpenCascade solids, not
native editable Onshape feature history. The original 1778 file and frozen v1
files remain unchanged. No authenticated API or Onshape browser calls were made.

This revision keeps the rear row/positioning axis at Y=-25/Z348, raises the
retained indexer/cradle together by 41.15 mm, moves the kicker from Y=-132 to
**Y=-122/Z34**, and stops folding at **-165 degrees**. The four motors and all
181 retained occurrences remain; 502 physical occurrences plus five explicit
references are displayed. The earlier -180 export below is rejected history.

The isolated Y110/Z170 proposal was rejected by actual full-system solid witnesses:
the rear shaft intersected both indexer upper plates. Y110/Z250 put its keeper,
cheek and mounting screws into those plates. These failures are preserved under
[compact-output](compact-output/). The coaxial arrangement avoids carrying the
rear shaft through the indexer, without adding another positioning linkage.

### Current Evidence

- Nine current Python geometry/source tests pass. Sixty custom STEP round trips
	pass with no invalid definitions. These are not manufacturing-fit approvals.
- All 507 viewer transforms match the exported deployed and folded matrices.
	Twenty-four desktop/mobile pose/view cases are nonblank, show all four motors,
	have no text overflow or browser errors, and orbit correctly. Minimum sampled
	foreground pixel count is 19,109; three screenshots were visually reviewed.
- The bounded [solid check](coaxial-output/revision-feed/checks.json) retains four
	screw/plug interior witnesses and **1,602 unresolved cases**. The four witnesses
	correspond to the explicitly modeled M5 top screws entering 4.2 mm tap drills,
	with nominal 4.9 mm engagement. A dedicated test verifies this intended thread
	representation; strength, tolerance and bottom clearance remain unqualified.
	They have not been silently erased or converted into a full-clearance pass.
- The original deployed layout had a 103.24 mm middle-shaft/bumper throat for
	114.3 mm OD coral. The higher coaxial roller layout removes that hard throat.
	A first route search incorrectly allowed entry behind the front roller; that
	false-positive condition was removed. With front-most floor entry enforced,
	the corrected kicker layout has no sampled route at float 0 or -8 degrees;
	a route is found at -4 degrees. See [current calculation](coaxial-transport.mjs)
	and [results](coaxial-transport.json). Front compliance/preload is therefore a
	controlling unresolved parameter, not a validated feature. Assumed star
	compression is at most 8 mm and kicker compression 2 mm. These are unqualified
	screening assumptions, not measured allowable deflections. No physical feed,
	complete floor-to-cradle transfer or force-equilibrium pass is claimed.

### Requirements Still Blocking Completion

| Requirement | Current boundary |
| --- | --- |
| Complete power paths | Pickup, kicker and deployment downstream stages are not modeled installations; indexer round cord still requires replacement/qualification. Four motor bodies do not close this gate. |
| Simple construction | Long links and the independent pivot lobe are removed, but 60 custom definitions and the retained hardware still exceed the intended low-part-count outcome. No simplicity victory claimed. |
| Clear stow | -180 bracing clashes are avoided by the -165 limit, but unknown pairs and intervals remain. Fixed rear star reaches Y about -88.7 versus assumed bumper front -85; fixed motor plate reaches farther. Full stow containment is not achieved. |
| Frame fit and support | Root screw heads give 712 mm width versus the assumed 700 mm envelope. New motor-stage frame brackets and raised indexer/cradle mounting are unfinished. |
| Durable impact path | Low frontal hits still drive against deployment direction; side hits cannot be relieved by this axis. Rated stops/buffers, torque flange, holding and replaceable contact faces are not completed. |
| Continuous transport | The sampled route depends on an assumed -4-degree float; nominal and -8-degree cases fail. Actual star phase, preload, traction, forces, guides/support, lengthwise/upright/yawed pieces, wall extraction and orientation remain unproven. |
| Holding and receiving | Scope choice is an oriented holding cradle plus stop, not a new elevator/gripper. Arrival sensing, positive retention and a receiving mechanism contract are not completed. |
| Safety and service | Operational hold, service restraint, complete guards, cable travel, jam detection/eject and recovery logic need implementation and test. |
| Manufacturing | Kicker hub wall/attachment, shaft/race fits, stock grades, load ratings, machining capability and critical tolerances are unresolved. Do not fabricate the subsystem from these STEP files as released drawings. |
| Field qualification | No physical capture, impact, endurance or thermal test has been run. The eleven [qualification gates](compact-qualification.json) are OPEN, not checkboxes passed by software. |

The [drive review](compact-drive-review.md) is a topology and procurement starting
point, not a purchase/release BOM. Its earlier fold load/ratio is not a low-axis
or coaxial dynamics solution. The current two upper loop length candidates are
450/400 mm, not the earlier 400/350. Actual pulley widths, retention and support
must determine shaft spacers before that layout is frozen.

The next defensible physical step is a guarded, powered transfer fixture using
the candidate roller centers and adjustable supports, testing the same full-size
coral against a real bumper and cradle. It must measure compression/normal force,
acquisition and recovery before optimizing/finalizing its shafts, guards and
impact structure. This fixture is not yet a manufactured or released product;
the model cannot substitute for those measurements.

## Preserved 180-Degree Checkpoint

2026-09-19. **NOT RELEASED. Physical mount and powered subsystem are incomplete.**
Two bounded geometry passes were completed, with one repair between them.
No Onshape/API calls, network access, child processes or concurrent terminals.
All 305 frozen v1 files match the saved baseline. Existing v2 source, exports
and evidence also remained unchanged during both runs.

## Inspect The CAD

- [Deployed full assembly STEP](coaxial-output/coaxial-deployed-NOT-RELEASED.step): 42,566,879 bytes.
- [Failed -180 deg inspection endpoint STEP](coaxial-output/coaxial-stow-NOT-RELEASED.step): 42,570,800 bytes. This is NOT an accepted stow.
- [Actual Brep tessellations and placement matrices](coaxial-output/coaxial-mesh.json).
- [Definition/instance manifest, joints and omissions](coaxial-output/manifest.json).
- [Physical BOM](coaxial-output/BOM.csv), [custom STEP round trips](coaxial-output/export-checks.json), [artifact hashes](coaxial-output/artifact-hashes.json).
- [Parametric builder](coaxial_pickup.py) and [eight focused tests](test_coaxial_pickup.py).

507 total occurrences: **502 physical, 5 reference envelopes**, 99 definitions,
60 custom definitions, 17 nominal-hardware definitions, 18 authentic-vendor
body definitions and 4 reference definitions. All **181 retained indexer/dock
occurrences** remain, including the two sensor reference occurrences. There
are **four authentic X44 motors, eight authentic gears and six hash-verified
vendor products**. Reference envelopes are excluded from the assembly STEP
and physical BOM, not silently counted as hardware. Two assumed chassis side
rails are explicitly modeled fabrication proposals, not sourced robot chassis.

## Geometry And Motion

Coordinates: millimeters, X across width, +Y into robot, +Z up.

| Item | Selected geometry |
| --- | --- |
| Single positioning pivot / rear powered row | Y=-25, Z=348 |
| Middle row | Y=-177.630272, Z=321 |
| Front row at float=0 | Y=-269.145298, Z=166 |
| Kicker | Y=-132, Z=34 |
| Main cheek / floating arm planes | X=+/-225 / +/-237; 6 mm flat plates |
| Upper star counts | Front 11, middle 9, rear 7; all three authentic source bodies retained |
| Front-middle / middle-rear centers | 180 / 155 |
| Belt candidates | 18:18, 450 mm WCP-0623 / 400 mm WCP-0621, HTD5 x9 mm |
| Revised crossmember centers | (-288,268), (-210,408) |
| Rear shaft / other shafts | 648 mm / retained 500 mm |
| Outer support plate / bearing flange planes | X=+/-310 / +/-313 |
| Retained indexer and dock | Entire retained assembly raised 41.15; tray top 175 |
| Exported fold endpoint | -180 deg, FAILED; float endpoints 0/-8 |

The main cheek is newly constructed Brep with three row seats, not an old
viewer transform or a metadata-only pivot change. There is no separate pivot
lobe, pivot stub, coincident old pivot bearing or transverse independent pivot
shaft. Legacy removal/replacement IDs are explicit in the manifest.
The rear shaft, wheels, spacers and rear bearing bodies are fixed in positioning.
Rear keepers and main cheeks fold around that same axis. Front float is about
the middle shaft before the whole cassette folds. Roller spin is not animated.

The requested tubes at (-288,215) and (-210,360) actually intersected authentic
star elastomer: strict interior witnesses at (0,-279,206), front spin 15 deg,
and (0,-210,351), middle spin 0 deg. The one repair raised the tubes and rebuilt
their cheek attachments and plugs. Revised tube-to-full-spin-disk gap is at
least **14.055 mm at nine sampled float angles**. This is not a coral-path test.
The same repair shortened the two new first-stage shafts to X258..305, removing
their original 1 mm intrusion into the end washers.

## Physical Supports

Two routed, triangulated 6 mm support plates have authentic WCP-0783 bearings,
bolted outer-race keepers, lathe-cut standoffs, four M5x50 through bolts, nuts,
washers and rail crush sleeves. The assumed 25x40x2 chassis rails have actual
cross-drilled holes at Y70/Y190, Z45. The 648 mm rear shaft accommodates these
outboard supports and end washers/M5 tapped-end screws. No metal bends required.
Two cheek bearings plus two chassis bearings share the rear axis; they are
separated axially, not duplicated coincident bearings.

**Physical mount complete: NO.** These are inspectable positive-retention solids,
not a load-qualified mount. Shaft deflection, four-bearing alignment, fits,
axial preload/end float, screw grades and bearing/spacer race contact need
qualification. Bolt heads reach X=+/-356, outside the assumed 700 mm frame.
The raised indexer/dock mounts and both new motor-plate-to-frame brackets are
unfinished. Fixed motion classification does not imply a completed attachment.

## Measured Failures And Unknowns

Eight software/geometry tests pass; all **60 custom STEP reimports** pass validity,
solid-count and volume checks. No active definition is invalid. These checks
do not certify vendor round-trip fidelity or manufacturing readiness; the full
assembly STEP has not been reimported.

The final [bounded solid check](coaxial-output/checks.json) has **14 strict
interior witnesses**, **791 no-witness unknowns**, **491 budget unknowns** and
877,383 whole-AABB-separated pair/pose cases. No unknown is called clear.
The classifier made 29,999 calls; the checking portion took 50.75 seconds.
Per-definition solid bounds/classifiers are cached. Pair sampling has a 64-call
cap and a one-second cooperative deadline, with no pair Boolean/distance calls.
The deadline is checked between OCP calls; it is not a hard kernel interrupt.

All 14 witnesses are at -180 deg: upper crossmember 1 intersects both raised
indexer plates, both station-1 upper bearings and both station-1 pulleys; the
two main cheek branches and six tube-joint parts intersect the raised plates.
Examples: tube/left plate at (-143.5,151,288.15), main cheek/left plate at
(-225,152.5,288.15). These are genuine solid interiors, not intended thread fits.

[Actual mesh extents](coaxial-output/mesh-pose-extents.json) provide a narrower
inspection bound than rotating the entire local part bounding box:

- -180 deg moving bounds: X[-257,257], Y[-72,282.734], Z[265.008,687.492] at float 0. Failed interfaces above remain decisive.
- -165 deg alternate: X[-257,257], Y[-70.700,231.306], Z[314.942,704.477]; float -8 changes Ymax to 250.509. This is a lead for the parent, NOT a cleared stow. Two conservative cheek/indexer cases, cheek/motor and internal interfaces remain unresolved.
- +125 deg gives a compact endpoint, but the positive route fails: at +20 deg the actual kicker mesh reaches Z=-9.152 below the floor.
- Fixed pickup first-stage mounting geometry reaches Y=-104.72; the nominal rear-star envelope reaches Y=-88.7. Both exceed the assumed bumper front at Y=-85, even when the moving cassette is folded.
- Full physical width is 712 mm, including the new root screw heads.

Moving/fixed, pickup structural self-pairs and selected new fixed support/stage
interfaces were screened at nine negative angles and two float endpoints.
Retained-to-retained interfaces were not recertified, and not every new fastener
pair is covered. The sweep, floor, bumper, spinning rotors, contact mechanics
and tolerance envelopes are NOT continuously certified. The -165 deg alternate
has only mesh/broad-phase evidence; no third geometry repair was attempted.

## Drives Still Missing

Both additional authentic 5:1 motor stages are retained as fixed-position
geometry. Pickup output is Y=-25, Z=241.4644, exactly 106.5356 from the rear axis;
the motor is 45.72 forward of that output. Deployment motor/output remain at
Y550/Y504.28, moved to Z100 below the lifted dock. Stage shaft ends are retained,
but second output bearings, chassis brackets and their load paths are missing.

No invented COTS pulleys or timing-belt solids are included. Actual pulley
drawings, axial datums, tensioning, guards, retention and couplings are missing
for the 18:36 input candidate and both upper loops. The long rear support
spacers occupy potential pulley lanes and must be redesigned using real pulley
dimensions; this is not a finished power path. Kicker reversing transmission,
robust hub/core and tread attachment are unfinished. Retained indexer round-cord
loops remain unqualified rather than being deleted.

Deployment needs an independent torque flange to the moving cheek: the powered
rear roller shaft cannot also be locked to the positioning cheek. Reduction,
endpoint stops, automated holding, stow/service lock, guards, cabling, sensors
and raised dock attachment are unfinished. No competition-readiness or complete
subsystem claim is made. Parent contact mathematics and functional transport
qualification are outside this bounded geometry correction.

## Reproduce

Use the existing manufacturing-package virtual environment with Python `-I -B`.
Run `test_coaxial_pickup.py`, then `coaxial_pickup.py --export --seconds 90
--classifier-budget 30000` serially. Imports are read-only; generated writes
stay under `coaxial-output`. [Source freeze](coaxial-output/source-freeze.json)
and [first-pass evidence](coaxial-output/iteration-1-checks.json) preserve the
unchanged baseline and superseded failures.