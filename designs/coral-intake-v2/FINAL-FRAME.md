# Starting Frame: Current Contained Revision

## Current Result

**The modeled collapsed perimeter violation is corrected. The intake is not
competition-ready or released for manufacture.**

[Open the full-powered starting view](final-frame-output/revision-clearance/index.html),
[collapsed STEP](final-frame-output/revision-clearance/coaxial-stow-NOT-RELEASED.step),
[deployed STEP](final-frame-output/revision-clearance/coaxial-deployed-NOT-RELEASED.step),
and [BOM](final-frame-output/revision-clearance/BOM.csv).
The viewer opens at -165 degrees with an orthographic top view and the actual
frame footprint. All 847 physical occurrences are visible; no offending part is
hidden and the frame dimensions are unchanged.

The prior displayed assembly exceeded the front frame plane by **104.72 mm**
and both side planes by **6 mm**. The subsequently installed deployment motor
extended **22.61 mm** beyond the left side. Those are real model failures, not
perspective artifacts or approved bumper exclusions. The separate perspective
top-view problem has also been corrected: orthographic projection compares all
heights against the same footprint without parallax.

The current starting boundary is X=-350..350, Y=0..760, maximum Z=1066.8 mm.
The front boundary is **Y=0**, not the bumper outside face at Y=-85. These are
the existing assumed robot dimensions, not verified dimensions of a supplied
robot chassis. The modeled side rails themselves may lie on the frame plane;
all other physical hardware must have 5 mm nominal reserve.

| Boundary | Conservative non-rail stow margin |
| --- | ---: |
| Front | 15.17 mm |
| Left | 5.10 mm |
| Right | 5.10 mm |
| Rear | 216.00 mm |
| Height | 318.36 mm |

The [exact audit](final-frame-output/revision-clearance/audit.json) covers the
entire physical assembly, including fixed motors, belts, chains, sprockets,
shafts, supports and fasteners. Analytic B-rep bounds and conservative rotor
enclosures are used; a displacement bound covers continuous front float from
-8 to 0 degrees **at the selected -165-degree fold pose**. It does not certify
the swept fold path or a manufactured tolerance stack.

## Physical Changes

- Moved the coaxial rear/positioning axis from Y=-25 to **Y=80 mm**. Rebuilt the
	middle/front layout at 230/205 mm spans so it is not a translated mechanism
	with broken belt centers. Existing pickup, indexer, cradle and four motors remain.
- Installed actual sourced drive components: four motors, eight nominal belt
	paths and two nominal chain paths. Relocated the pickup reducer above the rear
	axis; repacked and reanchored the deployment reducer inside the left frame.
- Replaced the protruding root through-bolts with inward screws and internal
	tapped blocks. The external rail planes did not move.
- Mirrored the first left indexer idler and added a bridged chain passage.
	The 25 original fixed interference pairs now clear their exact Boolean checks.
- Added explicit keeper/end-stack openings in the supporting parent plates.
	The nine subsequent neighboring interference pairs now clear. Both plates
	remain one connected solid, and the tested material around all three left
	indexer bearing seats is retained. Strength of the new ligaments/bridge remains
	unqualified; this is not a cosmetic removal of collision markers.

Nominal M5 screw/tap-drill overlap is now classified as
`EXPECTED_THREAD_ENGAGEMENT` only after an actual overlap-containment check.
The four tube-plug joints and four new root joints are recorded individually.
Shifted and bottoming screws fail the regression; there is no blanket fastener
exception. Thread fit, preload, and structural capacity remain unqualified.

## Verification And Boundary

Current output directory: [revision-clearance](final-frame-output/revision-clearance/).
852 total occurrences, **847 physical**, five explicit references, four motors,
27 upper stars, 18 indexer wheels, eight belts and two chains. All **152 custom
STEP round trips** pass, no invalid active definitions, and every exported mesh
vertex is enclosed by its exact B-rep bounds. All 305 frozen v1 files and all
165 hashed inboard historical artifacts remain unchanged.

The exporter completed in 575.58 seconds with exit 0. That means containment,
the defined fixed-pair scopes, chain passage envelope, static gear meshes, export
and source-freeze gates passed. It is **not** a whole-assembly collision certificate.
The [neighbor report](final-frame-output/revision-clearance/repair-neighbor-interference.json)
has no failures or budget unknowns in its stated scope. Internal groups, full
folding sweep and complete phase-dependent rotor/contact checks are not covered
by that result.

The keeper-clearance regression passes. Five focused Node tests verify the
contained inventory, exported transforms, frame reserves and artifact hashes.
Twenty-four orthographic desktop/mobile view/float cases render correctly with
847 physical parts and four motors, no browser errors/overflow, and at least
33,619 foreground pixels. Direct top-view projection testing found no physical
vertices outside the frame rectangle. Top, isometric, deployed and mobile
captures were inspected; the earlier perspective captures were replaced.

**Remaining starting-condition gate:** a physical deployed/stowed stop and
holding/restraint system is still absent. A slider at -165 degrees is not a
physical restraint. Added guards, cables, sensors and manufacturing tolerances
must also be included before a final starting-configuration approval. The audit
does not replace checking the applicable official game rules.

The broader task remains unfinished: structure/impact load qualification,
raised-deck mounting, kicker hub/tread joint, chain seating/tension, guards,
continuous feeding/orientation, serviceability and physical endurance have not
been released. Part count also remains high. No field-readiness claim is made.

## Previous Blocked Checkpoint

The following describes the unchanged earlier `final-frame-output` root export,
not the corrected `revision-clearance` export linked above.

## Result

`BLOCKED_FIXED_NEIGHBORS`, not a collision-clear or released assembly.

- All 25 archived inboard fixed interference pairs now have zero modeled-phase overlap.
- The refreshed original target scope has seven exact Boolean candidates, all clear, with no budget-unknown pairs.
- The expanded repair-neighbor scope has 31 exact Boolean candidates, nine interferences, and no budget-unknown pairs. These failures are not waived.
- Frame containment passes at fold -165 degrees across continuous front float -8 to 0 degrees, including conservative full-spin enclosures. Non-rail lower-bound reserves: left/right 5.10 mm, front 15.1656 mm, rear 216.00 mm, height 318.3558 mm. This is containment, not clearance during folding.
- 852 occurrences: 847 physical and five reference-only, including all four source motors, 27 upper stars, 18 indexer wheels, eight belts and two chains. No roller, motor, guard, or original power path was deleted to clear a pair.
- All 152 custom STEP round-trips pass; 210 active definitions, none invalid; 206 physical BOM rows. Exported mesh vertices remain inside their exact B-rep bounds, maximum excess 0 mm.
- 305 frozen v1 files and all 165 hashed historical inboard artifacts are unchanged. The export run found no changes to protected v2/v1 files. Two optional configuration hooks are the only shared-source edits; nine unmodified inboard tests pass with defaults.

## Two Repair Groups

1. Pickup stage above rear: `pickup_input_direction=1` puts the input at YZ `[80, 454.535598542]` instead of below the unchanged rear `[80,348]`. The source gear center distance remains 45.72 mm, the motor is +45.72 mm in Y, and the 18T/36T 350 mm belt remains at X=289. Bearings, columns, plates, take-up slots and bolts are constructed from the new center. This clears the original 17 pickup/indexer pairs. Default direction remains -1.
2. Left bank packaging: `indexer_idler_sides={"L_0": -1}` mirrors the first left idler to XY `[-163.794950345,141.046846264]`; supports and parent slots are rebuilt during installation, not translated off their attachment. Reversed route-node order preserves the external tangent winding: 350 mm belt, wrap 157.3395/45.3210/157.3395 degrees. The other three indexer routes retain their original side. This clears the seven original star/idler pairs. A width-11.3 mm passage centered at X=-249, Y=42..115 clears the final chain without moving its lane or the rear/feed height. A 6 mm bridge at Z=272.15, two 10 mm spacers and two M5x30 through-bolts connect the post-side strip back to the bearing-side bank below the chain. The plate remains one valid solid. The post and bearing seats are retained; bridge/ligament strength is not qualified.

The passage and all seven bridge components clear a filled convex envelope of the final-chain pitch circles with 2.9 mm link radius, 2.5 mm additional reserve, and full link axial width plus 2.5 mm each side. This is a conservative nominal chain-travel envelope at the fixed gearbox pose, not a chain tooth-seating, master-link, load, or dynamic certification.

Rear, middle, front, kicker, tray, deployment gearbox pose/lanes, independent torque flange, and inboard tapped root blocks remain as in the inboard candidate. The main audit also verifies all eight nominal belt lengths, both closed 6.35 mm chord-pitch chains, and the three static source gear meshes. Final-chain report pitch points are transformed to world YZ consistently with the already-rotated solid geometry.

## Exact Remaining Blockers

All are fixed/fixed, angle 0, float 0; therefore these witnesses do not disappear by folding. No third geometry-repair group was attempted.

| First part | Obstruction | Exact overlap mm3 |
| --- | --- | ---: |
| `pt_pickup_outer_keeper_screw_0` | `coaxial_frame_plate_1` | 105.292441 |
| `pt_pickup_outer_keeper_nut_0` | `coaxial_frame_plate_1` | 166.284809 |
| `pt_pickup_outer_keeper_screw_1` | `coaxial_frame_plate_1` | 105.292441 |
| `pt_pickup_outer_keeper_nut_1` | `coaxial_frame_plate_1` | 163.631888 |
| `pt_pickup_stage_spacer_4` | `coaxial_frame_plate_1` | 27.986153 |
| `pt_pickup_stage_washer_1` | `coaxial_frame_plate_1` | 18.657436 |
| `pt_indexer_L_0_idler_lower_keeper` | `v1_indexer_plate_L_247` | 412.436404 |
| `pt_indexer_L_0_idler_lower_keeper_screw_0` | `v1_indexer_plate_L_247` | 145.966064 |
| `pt_indexer_L_0_idler_lower_keeper_screw_1` | `v1_indexer_plate_L_247` | 145.966064 |

The original target selector does not include these parent-plate pairs. The expanded test caught them and remains failing. Further work needs a coordinated pickup frame/keeper/end-stack interface and idler lower-keeper/bank interface repair that retains bearing support and load paths. Merely reporting the cleared original list would be misleading.

## Inspection Package

Full-powered deployed/stowed assemblies and parent-viewer data are in [final-frame-output/manifest.json](final-frame-output/manifest.json), [final-frame-output/coaxial-mesh.json](final-frame-output/coaxial-mesh.json), and [final-frame-output/audit.json](final-frame-output/audit.json). The mesh/manifest instance and motion fields retain the existing coaxial schema. Top-level schema identifies the final-frame candidate. Known failures, `candidate_acceptance_pass=false`, `collision_status=FAIL_INTERFERENCE`, and `release_ready=false` are explicit.

- [Deployed STEP](final-frame-output/coaxial-deployed-NOT-RELEASED.step)
- [Collapsed STEP](final-frame-output/coaxial-stow-NOT-RELEASED.step)
- [Summary](final-frame-output/summary.json)
- [Historical pair regression](final-frame-output/historical-pair-regression.json)
- [Additional exact witnesses](final-frame-output/repair-neighbor-interference.json)
- [Chain passage envelope](final-frame-output/chain-passage-envelope.json)
- [Power-path checks](final-frame-output/mechanical-invariants.json)
- [Export checks](final-frame-output/export-checks.json)
- [Protected-source evidence](final-frame-output/source-freeze.json)
- [Artifact hashes](final-frame-output/artifact-hashes.json)

This is an inspection export of a blocked candidate, not an accepted manufacturing package. No new viewer was implemented or visually certified. Full assembly STEP re-import is not claimed; all custom part STEP re-imports were checked. Continuous fold clearance, all rotor-phase collision clearance, transport/contact forces, strength, fits, belt tension, chain tooth seating, thin kicker-hub torque attachment, guards, stops, holding, cables and field/rules performance remain unqualified.

## Commands And Results

All CAD commands used the existing cached interpreter, ran serially with `-I -B -W ignore`, and used no downloads or API calls. In the commands below, `$py` is the exact executable `C:/Users/lidor/FRC/onshape-ai/trials/manufacturing-package/.venv/Scripts/python.exe`; `$v2` is `C:/Users/lidor/FRC/onshape-ai/designs/coral-intake-v2`. These abbreviations are for this log only.

| Command | Result |
| --- | --- |
| `git status --short --untracked-files=no` | Only pre-existing root ignore/readme modifications listed; left untouched. |
| `& $py -I -B -W ignore "$v2/test_final_frame.py" PickupRepairTests.test_pickup_repair` | First run: exit 1, 166.791 s. All 17 exact pickup pairs cleared; expected-height rounding in the test differed by 0.000027542 mm. Test corrected to the exact belt equation; no geometry change. |
| Same pickup command | Exit 0, one test, 171.281 s. Four motors, belt, gear centers and support holes verified; eight original pairs remained before group 2. |
| `& $py -I -B -W ignore "$v2/test_final_frame.py" PickupRepairTests.test_bank_repair` | Initial bank check: exit 0, one test, 169.886 s. All 25 original pairs clear; seven current target candidates clear; mirrored path and valid connected plate pass. |
| Same bank command after adding neighbor/envelope checks | Exit 1, one test, 196.155 s. Original 25 still clear, chain envelope passes, nine additional fixed neighbor clashes found; zero unknowns. Failing assertion retained. |
| `& $py -I -B -W ignore "$v2/final_frame.py" --export` | Exit 1, 584.610 s. Containment, original targets, chain envelope, gear meshes, inventory, source freeze and 152 custom round-trips pass. Nine neighbor clashes block acceptance. Full inspection export written. |
| `& $py -I -B -W ignore "$v2/test_inboard_frame.py"` | Exit 0, nine unmodified tests, 146.698 s. Default-hook compatibility verified. |

Read-only Node commands were also run, all exit 0: one extracted the archived 25 failures; two extracted bank/path/definition evidence (their large output was truncated by the terminal); a compact extraction printed the exact path centers, wraps, plate/post/shaft bounds and manifest transform; an independent `node -e` verifier recomputed all 172 final artifact hashes and 21 source-code hashes and asserted inventories, zero original-target failures/unknowns, exactly nine recorded neighbor failures, containment, 152 round-trips, no invalid definitions, mesh enclosure, frozen v1/inboard preservation and the blocked/release-false flags. Editor diagnostics for all three touched Python files reported no errors. No compilation/runtime/geometry failures were hidden as expected passes.