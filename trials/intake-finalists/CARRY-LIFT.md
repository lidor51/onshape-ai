# B: Split Receiver With Lift-Away

**FAIL. Not geometry-ready. Geometry frozen after three local repairs.**

This is the separately authorized 2026-09-14 revision of candidate B, ancestry
14/07. It does not establish two passing finalists or select a design. Candidate A
and every legacy carry file are outside this revision's write scope. No Onshape,
network/API, kernel, vendor import, credential, commit or delegate was used.

## Result

[carry-lift-report.json](carry-lift-report.json) is generated directly by
[carry-lift.mjs](carry-lift.mjs). It contains 3,176 inspected poses, 14,261 exact
pair evaluations after conservative pruning, 44 aggregate gates and 248 phase
gates. Aggregate results: **35 PASS / 9 FAIL**. Phase results: **214 PASS / 34 FAIL**.
`geometryReady` is false. Read the phase witnesses as well as aggregate minima.

The first eleven-pose close/release/lift probe passed after repair 3. That was
not a motion certificate: the denser check found both a closing interference
and a lift collision between those samples. The failed evidence is retained.

| Phase / criterion | Sampled gap mm | Conservative bound mm | Required mm |
| --- | ---: | ---: | ---: |
| Closing p0.116: lift-to-jaw tie / upper carriage shoe | 0 | 0 | 0.25 |
| Closing p0.2: upper cage / full coral | 2.340938 | 0.090938 | 0.25 |
| Lift p0.465: locked full shaft / lower finger stem | -9.350000 | -10.600000 | 0.25 |
| Empty return p0.694722: locked full shaft / lower stem | -8.697682 | -10.912995 | 0.25 |
| Empty return p0.705417: locked full shaft / full coral | -29.001592 | -31.216905 | 0.25 |
| Empty return p0.705417: locked drum / full coral | -47.651592 | -47.694381 | -3 |
| Delivered stow p0.897222: locked full shaft / lower stem | -8.800274 | -10.954051 | 0.25 |
| Delivered stow p0.863889: locked drum / full coral | -47.673230 | -47.694381 | -3 |
| Hardware floor, both mounts | 4.588731 | 4.588731 | 5 |
| Left receiver lift rail / intact right frame | 0 | 0 | 0.25 |

The first eight rows use front-mount witnesses; the corresponding local
mechanism failures also occur on the left mount. A zero non-joint gap fails
the 0.25 mm clearance requirement. The closing cage/coral row is an
uncertified intersample margin, not a sampled collision. Negative polygon
scores establish overlap, not penetration depth. Drum interference is a
geometric overlap calculation, not a measured rubber deformation.

## What Changed

All dimensions are mm. Local x is transverse, y rearward, z up.

| Item | Frozen geometry |
| --- | --- |
| Full hollow coral | L301.625, OD114.3, bore101.6; axis x |
| Acquire | Center (0,-320,57.15), already seated, floor contact |
| Carrier | Pivot y100/z150; offer -180 degrees; loaded stow -175 degrees |
| Offered / delivered centers | (0,520,242.85) / (0,520,492.85) |
| Central drums | Radius25, x[-98,98]; one driven, one carrier-locked |
| Full shafts | Radius6.35, x[-270,270], retained in every check |
| Compliant nip | Nominal3 interference, assumed maximum7; not material-tested |
| Cheeks / end discs | Cheeks x+/-255; end discs x+/-162, thickness4, radius52 |
| Carrier retention | Three sectors per side at x+/-140; 65 axial withdrawal to x+/-205 |
| Keeper pins | Length140, closed x[140,280] and mirror; open x[205,345] and mirror |
| Receiver | Four half-cages at x+/-120, thickness30, radii59.5/63.5 |
| Cage sectors | Upper12..168 degrees; lower192..348 degrees |
| Jaw opening | Upper450 upward, lower100 downward; proposed synchronized unequal travel |
| Axial receiver stops | Upper-jaw tabs at x+/-155, thickness3, local z54..64 above piece center |
| Lift | One vertical linear motion, stroke250 |
| Actual supports | Finger stems, outboard beams, slotted carriage shoes, jaw rails y650 and lift rails y680 |
| Body inventory | 79 hardware + 10 chassis/bumper references + one coral = 90 bodies |

The receiver does not approach axially through the cheeks or end discs. Its
half-cages close from above and below. Carrier fingers lie outside the
receiver's x[105,135] bands and withdraw before lift. Nevertheless, the lower
stem connecting a cage to its rail crosses the retained full shaft during
lift. Lifting the coral250 also leaves it inside the empty carrier's swept
volume. Clearing the cage fingers alone did not clear their supporting bodies.

The two lower carrier sectors and upper keeper all withdraw. Their near axial
faces are x+/-201 before lift, giving50.1875 clearance to the full coral ends.
The end discs remain physically present. No receiver-wide collision exception
or omitted shaft is used. Named pin/guide and pivot bearing interiors remain
simplified local bearing allowances, not detailed bores or purchased bearings.

## Sequence And Views

| State | Physical configuration |
| --- | --- |
| acquire | Carrier down; all keeper sectors withdrawn; receiver jaws open |
| capture0..1 | Same floor coral; carrier keepers close axially |
| transfer0..1 | Retained carrier rotates0 to -180 degrees |
| handoff0..0.2 | Vertical receiver halves close; carrier retains coral |
| handoff0.2..0.4 | Receiver closed; carrier keepers withdraw; shared ownership |
| handoff0.4..0.65 | Receiver and same coral lift250; carrier remains seated |
| handoff0.65..1 | Empty carrier returns; receiver and coral stay lifted |
| stow0..1 | Alternative loaded-carrier branch from offer to -175 degrees |
| delivered-stow0..1 | From completed handoff, empty carrier rotates0 to -175; receiver remains loaded and lifted |

Side-path diagram, x pointing out of page; it describes the proposed path,
not a collision-free trajectory:

```text
z
^                         delivered (520,492.85)
|                                 ^ 250 lift
|         retained rotary arc     |
|               /          offer (520,242.85)
|        pivot (100,150)
| acquire (-320,57.15)
+--------------------------------------------------> y
```

Top-view axial bands at offer:

```text
x: -270  -255  -162 -155 -140 -120       0       120 140 155 162 255 270
   shaft cheek disc stop keeper cage   coral   cage keeper stop disc cheek shaft
   <------------------------ full shafts remain ------------------------->
   keepers withdraw to +/-205; receiver does not slide through the cheeks
```

`definition`, `poseAt`, `assemblyAt`, `buildModel(state,progress,mount)` and
`evaluate` are exported. Both front and left mounts use the same body definitions
and actual rigid placement transform. Profile edge lengths, radii, axial lengths,
IDs and body count remain constant. No snapshot body resizing or piece teleport
is used. Invalid states, mounts and out-of-range progress throw errors.

`buildModel` returns an **analytic-extrusion-assembly data object**, not a Three.js
Object3D. It contains extruded polygons, full cylinders, the hollow coral and
mount transforms for a parent renderer. It is not a drop-in Group for the legacy
viewer. No browser-rendered views or parent viewer integration were verified;
that deliverable remains unresolved under this four-file/local-only revision.

## Passed Checks And Limits

Minimum hardware extension margin is18.928890 against the required5. Front/left
bumper clearances are5/16. The full coral stays at or above the floor and its
minimum extension margin is69.909183. Endpoint loaded stow hardware insets are
16.8/12; delivered stow hardware insets are5/12. These insets include the1066.8
height limit. Full coral fits both endpoint stow envelopes, but the delivered
stow motion is not collision-free. Endpoint packaging is not motion acceptance.

All79 hardware bodies have touching named support paths to chassis crossmembers
at all3,176 sampled poses. This is sampled geometric connectivity, not strength,
fastener validation or continuous load-path certification. The receiver rails
are actual parts and are checked against the carrier, coral and chassis.

The receiver's two closed gaps have26.404785 opening upper bounds, below the114.3
OD. The carrier's lower opening bound is81.267315. End-disc/bore radial overlap
is1.2; receiver stop/wall overlap is3.15. These are positive geometric throat
and wall-stop checks, not a complete3D escape, tilted-piece or load proof.

The63-case finite-cylinder yaw/offset screen uses full-cylinder support extents,
not just its center. With assumed3 nominal and7 maximum compression, the tangent
slab/end-plane screen admits +/-1.5 degrees at +/-5 axial offset. It rejects
both +/-2 and +/-5 degrees under that sufficient-condition screen. Nonzero yaw
was not checked against every hardware body; only the centered zero-yaw motion
was evaluated. No all-angle pickup, self-centering, traction or elite suitability
is established. Failure of this conservative slab screen is not a measured
pickup failure.

There are five proposed independent inputs: carrier rotation, powered roller,
synchronized axial keepers, synchronized vertical jaw halves and receiver lift.
The unequal-stroke synchronization, spring/preload behavior, drives, structural
loads, sensors, bearings, moving cables, tolerances and jam recovery remain
undesignated or untested. No cycle-time or reliability claim is made.

## Reproduce

[carry-lift.test.mjs](carry-lift.test.mjs) keeps software checks and the mandatory
geometry acceptance test separate by name, not by hiding the geometry failure.
The normal full test command is expected to exit1 while this geometry is frozen:

```powershell
node --test trials/intake-finalists/carry-lift.test.mjs
```

The software checks cover inventory/dimensions, state continuity, finite shafts
and stops, the exact intermediate lift collision, intersample-bound rejection,
yaw-screen limits, legacy hashes and exact saved/recomputed report equality.
The mandatory geometry test still requires all required gates to pass.

Regenerate only the permitted report:

```powershell
node --input-type=module -e "import {writeFileSync} from 'node:fs'; import {evaluate} from './trials/intake-finalists/carry-lift.mjs'; writeFileSync('./trials/intake-finalists/carry-lift-report.json', JSON.stringify(evaluate(),null,2)+'\n');"
```

SHA256 regression checks preserve the original four files: carry.mjs,
carry.test.mjs, carry-report.json and CARRY.md. No history was overwritten.

## Repair Stop

1. Shortened a keeper sector clipping the compressed drum; separated pad and beam solids.
2. Moved the carrier fingers outside the receiver axial bands; moved the upper pin; shortened the withdrawal stroke.
3. Moved the axial stops to the upper jaw and raised the lower guide anchors.

No fourth geometry repair was attempted. Any further attempt needs authorization
and must resolve the stem/shaft lift crossing, carrier/held-coral swept-volume
intersection, carriage/tie travel interference, floor reserve and left frame
contact together. A different lift direction or greater stroke is only a future
hypothesis: neither has been packaged or certified here. B must not advance to
Onshape or be presented as a geometry-ready finalist.