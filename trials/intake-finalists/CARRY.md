# B: Retained Crosswise Carrier

**Geometry: FAIL. Not geometry-ready. Software: 16/16 tests PASS.**

Three bounded local geometry repairs were completed. No finalist selection,
Onshape work, API/network calls, kernels, vendor CAD, secrets, commits, or
delegates were used. Writes were restricted to these four carry files. The
subsequent reporting-only fix prefers a sampled overlap when lower bounds tie;
it did not change geometry or relax acceptance.

## Current Failure

The complete evaluator checks **2,052 poses across front and left mounts**:
361 samples each for transfer and empty return, and 76 each for capture,
receiver closing, keeper withdrawal, and loaded stow. Maximum full-rotation
step is 0.444445 degrees. Both mounts fail the same receiver interfaces.

| Failed phase | Part / obstacle | Progress | Sampled mm | Lower bound mm |
| --- | --- | ---: | ---: | ---: |
| Receiver closing, first retained sampled overlap | Retention disc mounting link negative-x / Receiver axial cage negative-x | 0.044 | -0.001 | -0.001 |
| Receiver closing, separately verified pair | Dogleg ribbon cheek negative-x / Receiver axial cage negative-x | 0.048 | -0.001 | -0.001 |
| Empty return, aggregate worst bound | Lower finger mounting tie negative-x 1 / Receiver axial cage negative-x | 0.55 | 1.500000 | -0.371866 |

The cheek/cage also intersects at p=0.046 between the closing samples. The
polygon score -0.001 establishes overlap, **not penetration depth**. The
return failure is different: its sampled clearance is positive, but the
continuous bound does not meet the required 0.25 mm. No return intersection
is claimed from that bound alone.

Capture, transfer, keeper withdrawal, and loaded stow have no failed phase
gates. Floor, extension, intact bumper/frame, coral clearance, intended
contacts, and stow gates pass their geometric criteria in both mounts.
Hardware floor clearance is only 0.276059 mm: this is not useful terrain or
tolerance allowance. Closing and return failures still reject the design.

[carry-report.json](carry-report.json) contains 33 aggregate gates and 167
phase gates. Aggregates retain the worst lower bound, so their witness can
differ from the first collision. Read `phaseGates` as well as `failures`.
Each `sampledMarginMm` belongs to its recorded witness; it is not a separate
minimum over every sample. Equal-bound witnesses now prefer the smaller
sampled clearance, retaining the actual closing overlap.

## Current Geometry

Axes are x transverse, y rearward, z up; distances are mm.

| Item | Current geometry |
| --- | --- |
| Hollow coral | Length 301.625; OD 114.3; bore 101.6; axis x |
| Acquired coral center | (0, -320, 57.15), already seated |
| Carrier | Pivot y100/z140; handoff -160 degrees; loaded stow -155 degrees |
| Full roller shafts | Both x[-270,270], radius 6.35, still collision-checked |
| Rubber contact drums | One central x[-98,98] drum per shaft, radius 25 |
| Outboard rubber bands | Removed in attempt 2; they had zero nominal coral overlap |
| Split keeper fingers | Centers x+/-80 closed, x+/-205 open; 125 mm axial stroke |
| Keeper arc | Inner/outer radii 68/72; 43..96 degrees plus mounting tab |
| Keeper pinbars | Separate 140 mm bars; no full-width moving upper bar |
| Keeper rails | Fixed to the carrier, x[215,258] and its mirror |
| Receiver cages | Centers x+/-300 open, x+/-120 closed; 180 mm axial stroke |
| Receiver C-cage section | Inner/outer radii 58.5/59.5; 336-degree wrap; 30 mm axial width |
| Receiver end stops | Centers x+/-155 closed; 3 mm axial thickness; wall-catching radial strip 54..56 |
| Receiver rails | Real U-shaped profiles with open stem slots; separate axial pinbars |

There are **45 hardware bodies + 10 chassis/bumper references + one hollow
coral = 56 meshes**, constant across states. Parts translate or rotate without
resizing. Only named joints/contact pairs have allowances. No full shaft is
excluded against a receiver body; the receiver is not an excluded corridor.
Keeper bearing bores remain simplified joint allowances, not detailed bearings.

## Sequence And Retention

`acquire` begins centered and crosswise with both sets of retainers open.
`capture` closes the split keeper axially. `transfer` rotates the closed
carrier to -160 degrees. Handoff p0..0.30 inserts the receiver cages; p0.30..0.55
withdraws the keepers; p0.55..1 returns the carrier while the same coral remains
stationary in the receiver. Keeper fingers and pinbars are outside the full
coral axial interval before return. There is no piece or slider teleport.

`stow` remains the alternative loaded-carrier branch from transfer, with the
receiver open. It is not a state after completed receiver delivery. Front/left
mounting transforms retain the same core geometry and rerun actual chassis checks.

Proposed positive restraint is geometric, not an assumed friction force:
the carrier lower opening is bounded by 73.813463 mm, the shortened keeper to
locked-roller gap by 86.253067 mm, and the receiver C-cage opening by
24.741491 mm, each below the 114.3 mm OD. Carrier end discs and receiver end
stops remain modeled. The receiver's 1 mm radial section, stop strength,
pad forces, spring preload, synchronization, bearings, and drive transmission
are **not load-qualified**. The collision failures prevent a usable handoff
claim regardless of these intended retention measures.

There remain four proposed independent inputs: carrier rotation, rear roller
drive, synchronized keeper halves, and synchronized receiver halves. The front
roller is carrier-locked. The actual synchronized drives are not designed.

The 49-case whole-cylinder yaw/offset screen still certifies **zero yaw only**,
with an axial half-range of 9.1875 mm. Acquisition, traction, self-centering,
piece variation, terrain and contact forces remain conditional physical work.
This is not an all-angle intake or a demonstrated pickup.

## Contract And Verification

[carry.mjs](carry.mjs) retains `definition`, `assemblyAt()`, `evaluate()` and
`buildModel(state='acquire', progress=1, mount='front', overrides={})`.
All five state names and front/left model-building checks remain supported.
The legacy metadata key `receiverJawInnerOffsetMm` now carries the receiver
axial center magnitude, 300 open / 120 closed; `receiverSlideAxis: 'x'` and
`receiverAxialTravelMm` make the current motion explicit. No viewer files changed.
Model construction was tested; browser rendering was not re-inspected.

Continuous bounds use exact swept axial intervals, rotating-point extrema
for floor/extension, circular roller contact bounds, and conservative planar
travel bounds. Pure axial sliding does not move the planar profiles. Opposite
slider halves are not treated as a rigid pair. Stationary hardware is included
in every phase. Named support paths were tested throughout all five states.

[carry.test.mjs](carry.test.mjs) passes all 16 software tests, including constant
dimensions/body inventory, intermediate slides, actual full shafts and end
stops, support connectivity, the closing-collision regression, and exact saved
report equality. These passing tests reproduce a **failing geometry packet**.

```powershell
node --test trials/intake-finalists/carry.test.mjs
```

After a separately authorized future edit, regenerate only the report with:

```powershell
node --input-type=module -e "import {writeFileSync} from 'node:fs'; import {evaluate} from './trials/intake-finalists/carry.mjs'; writeFileSync('./trials/intake-finalists/carry-report.json', JSON.stringify(evaluate(), null, 2) + '\n');"
```

## Preserved Failed History

All numbers below belong to older geometry, not the current packet. Each
attempt used the full 2,052-pose schedule. Sampled/bound values are mm.

| Revision | Preserved failed evidence |
| --- | --- |
| Baseline, 60 hardware bodies | Local-z keeper stroke150, full-width crossbar, receiver opening150. Transfer drum/stop -14.500/-15.939; coral/open finger -11.500/-13.382; closing lower tie/stop -15.359/-15.978; release drum/stop -12.491/-12.491; return keeper/held coral -58.756/-60.661. |
| Attempt 1, 59 bodies, connected | Split axial keeper; receiver opening260; outer bands start180. Pinbar/mounting link -11.000/-11.833; closing full shaft/cage -7.729/-9.081; return drum/crossbar -14.085/-15.524; left stow exceeded its box by51.185. |
| Attempt 2, 45 bodies, connected | Axial receiver; outboard rubber removed, full shafts retained. Closing stop/end disc -3.300/-4.500; keeper/rail and receiver stem/rail polygon overlaps; transfer rail/rail 0.488/-1.167; open keeper/receiver guide overlapped on return. |
| Attempt 3, current | Slotted rails, relocated supports, narrowed stops and keeper arc. Closing mounting-link/cage sampled overlap and return tie/cage uncertified bound remain, as detailed above. |

The earlier -140/-145/-150/-155/-160 handoff angle screen also found no passing
baseline option; it is not evidence about the repaired topology. The three
authorized geometry attempts are exhausted. Do not select B or advance it to
detailed CAD as geometry-ready while these failures remain.# B: Retained Crosswise Carrier

**Historical baseline: FAIL. Repair in progress; no new pass claimed.**

## Preserved Failed Baseline

Before the axial-keeper repair, the 2,052-pose two-mount gate failed with
60 hardware bodies: transfer drum/receiver stop -14.500 mm sampled / -15.939
bound; transfer coral/open receiver finger -11.500 / -13.382; closing lower
mounting tie/stop -15.359 / -15.978; release drum/stop -12.491 / -12.491;
return upper keeper/held coral -58.756 / -60.661. The keeper used a 150 mm
local-z stroke and a full-width upper crossbar; receiver opening was 150 mm.
These are failed historical results, not results for the pending repair.

Repair attempt 1 also FAILED the full 2,052 poses (59 hardware bodies, all
connected). Keeper pinbar/mounting link: -11.000 sampled / -11.833 bound;
closing full roller shaft/receiver cage: -7.729 / -9.081; return outer
drum/receiver crossbar: -14.085 / -15.524. Left stow exceeded its box by
51.185 mm. No geometry pass was recorded for this attempt.

Repair attempt 2 FAILED all-mount aggregate acceptance after 2,052 poses
(45 hardware bodies, all connected): closing receiver stop/carrier end disc
-3.300 sampled / -4.500 bound; keeper/rail and receiver stem/rail sampled
polygon overlaps (-0.001 score); transfer rail/rail 0.488 sampled but
-1.167 bound. Open keeper/receiver guide also overlapped on return. The
outboard rubber bands were removed in this attempt; full shafts were retained.

This bounded candidate retains ancestry 14 and applies the 07 side-mount equivalence.
It is a parameterized local geometric failure packet, not a successful pickup or
handoff demonstration. No network, API, vendor CAD, credentials, whole-robot work,
selection, or detailed CAD is part of this packet. The parent owns viewer/export work.

## Files And Contract

- [carry.mjs](carry.mjs): `definition`, `buildModel(state='acquire', progress=1, mount='front')`, and `evaluate()`.
- [carry.test.mjs](carry.test.mjs): live Node tests, including equality of saved and recomputed results.
- [carry-report.json](carry-report.json): every aggregate gate, phase-specific evidence, contacts, dimensions, and the 49-case yaw/offset screen.
- `assemblyAt()` exposes the same circle/prism specifications used for rendering and collision checks. An optional fourth argument to `buildModel`, or argument to `evaluate`, overrides dimensions for local experiments; overrides are not automatically validated designs.

The model has 60 hardware meshes, 10 chassis/bumper reference meshes, and one hollow
coral mesh in every state. Bodies keep their names, dimensions, and connectivity;
sliding and rotating parts do not resize. Mesh metadata labels roles, faces, shaft
axes, driven contacts, and carrier-locked contacts. `root.userData` contains state,
mount, dimensions, ownership, coral pose, kinematics and explicitly non-certifying
instantaneous checks. The report is the authority for the motion gate.

## Dimensions

All distances are mm. Core axes are x transverse, y rearward, z up.

| Item | Retained parameter or derived coordinate |
| --- | --- |
| Hollow coral | Length 301.625; OD 114.3; bore 101.6; axis x |
| Acquired coral center | (0, -320, 57.15) |
| Carrier pivot | y100, z140; rotation about x |
| Handoff | -160 degrees; coral (0, 466.334532, 361.501994) |
| Loaded stow | -155 degrees; coral (0, 445.635348, 392.587270) |
| Cheeks | x +/-255; thickness 6; routed ribbon width 10 |
| Roller shafts | x -270..270; radius 6.35 |
| Roller surfaces | Radius 25; bands x[-240,-142], [-98,98], [142,240] on each axis |
| Keeper | One 150 mm local-z slide, closed stop plus proposed closing spring/release actuator |
| Receiver pads | Inner y offsets +/-150 open, +/-57.15 closed; 92.85 mm travel per jaw |
| Receiver fingers | x[-135,-105], [105,135]; 7 mm side clearance in roller grooves |
| External receiver slider arms | x +/-300; 12 mm wide, outside the carrier shafts |

The supplied z80 pivot makes the raised dogleg vertex go below z=-40 at -155
degrees. Raising the pivot to z140 keeps the acquired coral at floor height.
The upper ribbon follows (100,140), (60,235), (-80,235), (-230,120); its lower
route visits the actual roller and lower-finger support coordinates before ending
at (-430,40). It is an offset, closed, concave ribbon, not a filled triangle.
Separate thin chassis crossmembers support the pivot and receiver towers.

The two contact axes lie on the pivot-to-coral radial line, about +/-80.60 in y
and +/-15.90 in z from the acquired coral center. That preserves tangency without
driving a roller into a stationary receiver-held coral on the ideal return arc.
The rear axis is powered; the front axis is locked relative to the carrier.
Each has finite axial contact bands, not an infinite contact surface.

## States And Ownership

| State/progress | Actual motion and owner |
| --- | --- |
| acquire | Carrier at zero angle; keeper open; receiver open; one centered crosswise coral at the contacts |
| capture 0..1 | Same coral pose; keeper closes through its 150 mm stroke |
| transfer 0..1 | Closed carrier rotates 0 to -160 degrees; coral follows that same rigid transform |
| handoff 0..0.30 | Carrier seated; receiver jaws close symmetrically; keeper stays closed |
| handoff 0.30..0.55 | Both retainers nominally engaged; receiver stays closed; keeper slides open |
| handoff 0.55..1 | Coral remains fixed in the receiver; carrier returns -160 to 0 degrees with keeper open |
| stow 0..1 | Alternative loaded-carrier branch from transfer: -160 to -155 degrees, receiver open |

Stow is not a state after completed receiver delivery. Returning from loaded stow
to offer reverses the checked 5-degree branch. No coral changes pose when ownership
changes. Acquisition begins already seated: travel into this pose, traction and
capture success have not been established.

Three independent positioning inputs are carrier rotation, keeper translation,
and synchronized receiver opening. The receiver has two real opposed slides under
one proposed synchronized control. Including the rear roller drive gives four
independent inputs. The front roller adds no independently driven axis. The actual
synchronizing transmission, closing spring and release actuator are not sized.

## Retention

The carrier adds lower curved fingers, a sliding upper keeper, and axial end discs
to the two opposed rollers. Closed lower-finger opening is bounded by a 73.814 mm
chord, less than the 114.3 mm OD. End discs have radius52 versus bore radius50.8,
with 9.1875 mm nominal clearance to each coral end. This is a proposed geometric
cage, not a friction or load proof. Its support graph connects all 60 bodies to
the chassis-supported towers through modeled touching joints.

The proposed receiver uses paired annular cage fingers in the roller grooves,
finite tangent pads, and axial stops. Its closed vertical opening is at most
33.129 mm. It must close before keeper release and keep the coral stationary
during return. These are real modeled parts, including their supports and strokes;
they are **not** an excluded receiver corridor. Their collisions below invalidate
the handoff, despite the intended retention sequence.

## Live Geometry Gates

The report evaluates 2,052 poses over front and left mounts, including 361 points
on each full transfer and return. Capture, jaw closing, keeper opening, and the
stow branch each have 76 samples. Endpoints cover the transitions. Maximum full
rotation increment is 0.444445 degrees.

Floor and extension use exact rotating-point/circle extrema between samples.
Collision checks use actual concave plate polygons and circular outer envelopes,
with conservative half-step travel bounds for moving pairs. Rigid relative pairs
are invariant; roller contacts use exact relative circle motion; closing pads use
the exact monotonic slide. Only named assembly joints and intended contacts have
contact allowances. Nothing excludes the receiver as a whole. Bounding-box pruning
cannot discard overlapping boxes after finding an earlier collision.

| Gate: certified lower bound | Front | Left |
| --- | ---: | ---: |
| Hardware floor | 2.434 | 2.434 |
| Full coral floor | 0, intentional floor contact | 0, intentional floor contact |
| Hardware extension margin to 457.2 limit | 17.109 | 17.109 |
| Extra above required 5 mm extension margin | 12.109 | 12.109 |
| Full coral extension margin | 71.956 | 71.956 |
| Hardware versus intact bumper | 40.000 | 45.416 |
| Full coral versus intact bumper | 175.968 | 175.968 |
| Hardware versus actual thin frame rails/crossmembers, excluding mount contact | 15.000 | 41.528 |
| Full coral versus frame | 247.470 | 247.470 |
| Non-jointed carrier hardware pairs | 5.150 | 5.150 |
| Stowed hardware, min of all 700x760x1066.8 envelope faces | 40.000 | 51.665 |
| Stowed full coral, min of all envelope faces | 199.188 | 197.215 |

Intended pad/roller tangencies and chassis-mount contacts have zero required gap,
not an invented positive clearance. Other collision pairs require 0.25 mm.
Positive nominal floor clearance is not terrain, deflection or tolerance clearance.
Both the empty hardware envelope and the full optional loaded-start coral fit the
stow box. The motion gate nevertheless fails on the following actual intersections.

| Failed phase, same in both mounts | Sampled signed clearance | Conservative lower bound |
| --- | ---: | ---: |
| Transfer near -142.222 degrees: rear driven drum versus receiver front axial stop | -14.500 | -15.939 |
| Transfer near -143.556 degrees: coral versus open front cage finger | -11.500 | -13.382 |
| Handoff p0.26: lower-finger mounting tie versus closing axial stop | -15.359 | -15.978 |
| Keeper release starts with drum/axial-stop interference | -12.491 | -12.491 |
| Return p0.63125, -131.111 degrees: opened upper keeper versus receiver-owned coral | -58.756 | -60.661 |

Negative values are signed geometric intersection scores, **not** B-rep penetration
depths. A polygon-polygon value of -0.001 specifically means overlap without depth
calculation. The report separately labels an actual sampled overlap and an
uncertified between-sample bound. No contact-normalization issue explains the
substantial failures above.

## Side Mount And Acceptance Limits

`mounts.mjs` maps the core to the left side without changing mechanism dimensions:
(x,y,z) becomes (-350+y,380-x,z). Chassis crossmembers span the corresponding real
chassis dimension, 700 mm front-mounted or 760 mm side-mounted. Actual global
bumper, frame and start-box checks are rerun on that 700x760 chassis. Internal
receiver failures remain identical; no penalty is assigned for holonomic strafing.

The 49-case yaw/offset screen uses the support extent of the **whole finite
cylinder**, not its center. Its sufficient rigid-slot-fit condition certifies
zero yaw and an axial half-range of 9.1875 mm; nonzero sampled yaw is not certified.
That is a geometric fit allowance, not a promise of acquisition or self-centering.
Yaw never changes in the animation. Roller compression, friction, centering,
spring preload, piece variation, terrain and contact forces remain physical unknowns.

## Reproduce And Stop

Run from the repository root:

```powershell
node --test trials/intake-finalists/carry.test.mjs
```

Regenerate the computed JSON after an authorized parameter/code change:

```powershell
node --input-type=module -e "import {writeFileSync} from 'node:fs'; import {evaluate} from './trials/intake-finalists/carry.mjs'; writeFileSync('./trials/intake-finalists/carry-report.json', JSON.stringify(evaluate(), null, 2) + '\n');"
```

Passing software tests mean the failure packet is reproducible, not that B passes
the gate. An earlier bounded screen of -140/-145/-150/-155/-160-degree handoffs
found no passing option. The retained -160-degree alternative reduced one sampled
receiver obstruction but did not solve approach, closing or withdrawal.

Promoting B would require a revised receiver/end-stop access path and keeper
withdrawal topology, followed by the same complete-motion checks. Do not omit the
receiver, hide the held coral, or advance this topology to detailed Onshape as if
these intersections were solved. Fasteners, bearings, motor/gearbox envelopes,
cables, tolerances, dynamics and build/rules review are also still outstanding.