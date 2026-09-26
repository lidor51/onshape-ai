# Candidate A: Split-Belt Differential Feed

**Geometry gate: FAIL after three local belt repairs. Do not promote A.**
The final model has 19 passing geometry subchecks and seven failures. The 22 Node
tests pass by reproducing those outcomes, not by declaring a working intake.
No practical nonzero-width entry envelope or complete opposed transport is proven.

## Scope And Reproduction

Only [feed.mjs](feed.mjs), [feed.test.mjs](feed.test.mjs),
[feed-report.json](feed-report.json), and this document were changed.
The report is the six-decimal frozen output of `evaluate()`. It retains the original
failed study as `firstFailedResult`, two intermediate belt results as
`repairHistory`, and the third repair as the current result.

```text
node --test trials/intake-finalists/feed.test.mjs trials/intake-finalists/mounts.test.mjs
node --input-type=module -e "import('./trials/intake-finalists/feed.mjs').then(module=>console.log(JSON.stringify(module.evaluate(),null,2)))"
```

The second command prints evidence without overwriting files. No API, network,
CAD kernel, vendor CAD, credentials, dependencies, commits or delegates were used.
The parent, candidate B and original illustrations were not edited.

## Ancestry And Comparison

[Original 01](../subsystem-ab/concepts/family-a.json) supplies the separate pickup
and feed function; [original 09](../subsystem-ab/concepts/family-c.json) supplies
the independently powered horizontal left/right banks. This **split-belt
differential feed** evolution replaces discrete working rollers with continuous
belts and adds a retained orienting cell. It is not a new vertical-V architecture,
a reference-team reconstruction, or another full robot.
Original [01 flow](../../outputs/concepts/concept-01.html) and
[09 flow](../../outputs/concepts/concept-09.html) remain unchanged.

The [1690 dead-spot account](../../research/2025-coral/1690-1778.md) motivates
checking zero-momentum powered coverage. Belts now supply the missing working
surfaces; the spaces between supporting wheels are not mislabeled as contact.
Their existence still does not prove preload, traction or a force-driven path.

A feeds through a stationary orienter to a stationary low receiver, then folds
only the empty nose. B/14 carries a retained piece with its moving structure.
That functional distinction is preserved. A's failed comparison gates prevent a
final two-candidate promotion; this task neither remeasures nor ranks B.
An exact-crosswise diagnostic is not competitive evidence of broad entry tolerance.

## Geometry

Coordinates are mm, x across, +y inward, z up. Yaw is from +y toward +x;
yaw90 is crosswise. The collision piece is a full finite L301.625, OD114.3 cylinder.
Its bore is never used to excuse interference.

| Item | Final geometry |
| --- | --- |
| Chassis / intact front bumper | x=-350..350, y=0..760 / y=-85..0, z=45..165 |
| Same nose pivot / fold | (0,80,225), x-axis; 0..135 degrees |
| Front / crest / tail pulley centers (y,z) | (-420,33), (-180,197.5), (0,197.5) |
| Lower pulley / belt outer radius | 25 / 28; belt thickness3 |
| Nose belt lanes x | -165..-80 and80..165, upper and lower |
| Fixed belt lanes x | -75..-2.5 and2.5..75, upper and lower |
| Fixed lower wheel centers | z197.5; existing rows y30,86,142,198,254,310 |
| Continuous fixed working run | y30..560; lower surface225.5, upper336.8 |
| Constant opposed working gap | 111.3 =114.3-3; nominal1.5 indentation per face |
| Fixed orienter / receiver | (0,190,281.15) / unchanged(0,430,281.15) |
| Cell end gates / side fences / roof underside | y10,370 / x=+/-180 inside / z410 |
| Receiver jaw gaps / front stop / back stop | 148.3 open,108.3 closed / y262..268 / y592..598 |

The lower bank wheel axes move down4.5 to accommodate the belt while keeping the
piece/indexer/receiver level unchanged. Repair three moves only the orienting
datum and its cell inward48; no receiver lift or moving-carrier handoff is added.
The full front and crest shafts still span x=-276..276 with R6.35. Tail shafts
are actual independent stubs. Fixed bank shafts remain explicitly modeled.

Eight closed belt bodies have line/arc centerlines and finite axial spans. Their
upper nose working run begins partway up the rise: it **does not oppose the floor
entry**. The lower return is the triangular loop's chord, and it really intersects
the bumper. Neither flaw is hidden behind the working face or a shortened shaft.

The bands are prescribed working-contact geometry, not a completed belt assembly.
Existing lower wheels and mirrored upper bank wheels are represented. Upper-nose
concave backing/idlers, receiver-end pulleys at y560, full upper shafts/supports,
tensioners, and belt tension/sag remain unresolved. Declaring a powered band does
not validate its support or load capability. These omissions are not permission
to treat an unsupported material span as rigid hardware in detailed CAD.

## Side And Plan Paths

```text
SIDE (y,z), horizontal crosswise cylinder center:
  floor (-500.088,57.150)
    -> exterior front-drum arc, center(-420,33), radius83.65
    -> tangent join (-467.292,101.998)
    -> rising common tangent to (-227.292,266.498)
    -> crest arc to (-180,281.150)
    -> horizontal working run to (0,281.150)
    -> fixed orienter (190,281.150)
    -> fixed receiver (430,281.150)

PLAN:
  crosswise yaw90, x=0: floor -> rise -> fixed orienter
  fixed orienter: commanded yaw90 -> yaw0
  lengthwise yaw0: orienter -> fixed receiver

LOADED STOW:
  coral stays (0,430,281.150), yaw0, receiver jaws closed
  nose alone folds0 ->135 about the unchanged pivot
  retained coral clears; nose/fixed hardware does NOT
```

The working path consists of analytic lines and pulley arcs with tangent joins,
not interpolated unsupported jumps. All five state boundaries preserve position,
yaw, fold, jaws and gate coordinates. They remain commanded diagnostic poses.

`acquire` traverses the front arc. `capture` follows the tangent, crest arc and
nose flat. `transfer` advances during0..0.45, closes the cell front during0.45..0.6,
then commands rotation during0.6..1. `handoff` opens the cell back during0..0.15,
feeds during0.15..0.75, closes jaws during0.75..0.9 and closes the receiver stop
during0.9..1. `stow` folds the nose with the same retained piece.
Reverse follows these coordinates, not an invisible reset or new piece.

## Working Contact And Angles

For the admitted horizontal crosswise trajectory, closest distance to belt lines
and restricted circular arcs is analytic. General horizontal tube contact uses
finite-cylinder section clipping for pulleys/shafts, exact flat-lane sections in
the orienter, and partitioned numerical minimization for curved belt bands.
The solver checks the finite tube, not just its center. No friction is inferred.

The old123.004546 bridge and12.004546 inter-wheel dead lengths are preserved as
failed history. The continuous bank now has zero pitch dead length. At the
interleaved nose/bank endpoints,30 mm apart, crosswise contact half-reach is:

$$a=\sqrt{(57.15+28)^2-83.65^2}=15.912259\text{ mm}.$$

Thus overlap is2a-30=1.824519, with0.165751 mm midpoint reserve. Axial interleaving
leaves5 mm between distinct belts. This is positive working-surface coverage, not
a claim that the endpoint pulleys physically overlap. There are no zero-drive
poses in the205-pose task sweep. Top/bottom opposition nevertheless fails at entry.

**Attempted entry is only yaw90, x=-10..10, pitch0**, at the common floor position.
No yaw0 entry, +/-30 crosswise envelope or all-angle capability is admitted.
The centered exposed-drum screen clears yaw89.5/90/90.5, but yaw89/91 produces
4.008474 mm belt-envelope interference and rigid-pulley interference. Those
necessary floor-only tests do not certify a +/-0.5-degree transport envelope.
At yaw0 the narrowed nose belts miss the tube, while the full front shaft
intersects it: shaft gap=-6.35. This is not relabeled as compliant contact.

The fixed indexer has819/819 two-bank contacts over yaw0..90 in1-degree steps and
x/y offsets-10,0,+10. Its minimum reserve is only0.116231, below the unchanged
0.5 gate. Analytic lengthwise offset limits are10.507690 for contact and8.144247
for0.5 reserve. Wide-offset cases remain an explicitly rejected screen.
**No valid end-to-end angle envelope is established.**

Commanded yaw90->0 demonstrates only geometric contact feasibility at those poses.
There is no passive-yaw trajectory, differential-speed control law, centering
proof or yaw observability test. Actual yaw sensing, low-speed controlled rotation
with offsets, slip, reversal and recovery must be tested later.

## Retained Cell And Interlocks

Three cell gate conditions are explicit: `receiving` opens the front only,
`retained` closes both ends, and `releasing` opens the back only. `controlAt()`
blocks acquisition/feed/orientation for receiver `absent` or `waiting`, commands
zero drives and preserves an already occupied cell. An optional fourth argument
to `buildModel` can show that held piece, e.g.
`{receiver:'waiting', occupied:true, yaw:45}`. The original three-argument contract
and `acquire/capture/transfer/handoff/stow` states remain intact.

Full-cylinder support-function extents check yaw0..90, x/y offsets+/-10, and
pitch+/-0.25:2457 cage-workspace cases, minimum rigid-wall/roof margin5.723674.
The small-tilt lower-surface compression bound is2.157498, under3. This tests a
static tilted cylinder in an axis-aligned enclosure, not varying-pitch transport
or an arbitrary 3D orthobody collision engine.

The closed cell blocks a10 mm 2D translation flood search at each fixed yaw
0/30/60/90; opening the back gives a positive escape control. This is geometry,
not mechanical holding force, arbitrary 3D escape or power-loss retention.
Crucially, **the gate panels collide with working belts, including during their
slides**. The isolated enclosure fit/escape passes do not establish a buildable
retention mechanism. Receiver-ready and capture confirmation remain external.

## Final Gates

| Check | Measured result, mm unless stated | Outcome |
| --- | --- | --- |
| Continuous powered surfaces | minimum2; zero unpowered poses | PASS, not full opposition |
| Top/bottom opposition from floor | only1 side at entry | FAIL |
| Nominal working indentation | maximum1.5 | PASS against3 |
| Narrow indexer coverage / reserve | 819/819 /0.116231 | coverage PASS; reserve FAIL |
| Full coral to bumper, both mounts | minimum59 | Sampled PASS |
| Hardware to bumper, both mounts | lower return-run intersection | FAIL |
| Whole-fold hardware extension | 483.596863 | FAIL; exceeds457.2 by26.396863 |
| Fully stowed inset, front and left | 2 versus required5 | FAIL |
| Stowed height / belt ground clearance | 742.317893 /5 | PASS against1000 /5 |
| Nose to fixed hardware in fold | tail pulley intersects cell front gate | FAIL |
| Loaded fold to retained coral | 21.35 | Sampled PASS |
| Gate slides to belt bodies | intersection | FAIL |
| Distinct belts / shaft to guides | 5 /18.5 | PASS |
| Full coral to shafts / rigid bodies | 20.15 /1.5 | PASS against5 /0 |
| Cell yaw/tilt workspace | 5.723674 | PASS |
| Closed-cell 2D escape / open control | 4 blocked / open exit found | Geometric subcheck PASS |
| Receiver roof / end-stop gaps | 71.7 /11.1875 | Geometric fit PASS |

Seven failures remain; no thresholds were relaxed to claim success. Negative
polygon sentinels mean overlap, not measured penetration depth. The fold witness
is at54 degrees, tail pulley against the cell front gate. The front drum itself
has an analytic fold-extension maximum483.596863, so sampling more poses cannot
recover that limit while keeping this geometry and pivot.

The main sweep uses41 poses/state,205 total, with3.375-degree fold increments.
The bumper offset screen includes738 full-cylinder cases. Tests additionally
check denser fold-bound containment and independent cylinder-surface oracles.
Working contact uses analytic/numerical surfaces; hardware belt polygons use
5-degree arc facets. Hardware gaps above5 may be conservative AABB lower bounds.
Fold arc envelopes conservatively include complete circles. None of these are a
continuous whole-mechanism collision certificate or manufacturing tolerance audit.

Both front and left use [mounts.mjs](mounts.mjs) rigidly, with the actual chassis
ring. Left inward depth is700, front760. Left receiver=(80,380,281.15), axis+world-x.
Both fail bumper and stow-margin gates for actual geometry, not hypothetical
swerve travel. There is no basis here to favor front mounting or exclude left.
The final2 mm inset is limited by the fixed front belt caps, not left depth.

## Repair History And Limits

| Local trial | Improvement | Remaining rejection |
| --- | --- | --- |
| Original, compact preserved history | 17 subchecks passed | 5 failures;38 dead poses;52.3 old lengthwise interference |
| Belt repair1, original widths | zero sampled dead poses | intersecting belts;807/819 narrow contacts; open floor opposition |
| Belt repair2, interleaved lanes | 819/819 contacts; distinct belts and loaded-fold piece clear | weak contact reserve; stow/fold/bumper and cage margins |
| Belt repair3, cell inward48 | full yaw/tilt cage margin passes; stow inset improves-38 to2 | seven current failures, including explicit gate/belt collisions |

The repair limit is reached. This is the retained final study, not authorization
for another ladder, cosmetic pass, whole-robot redesign or detailed CAD.
Five positioning actuators are exposed: nose, jaws, receiver stop and two cell
gates. Three drive groups are assumed: coupled opposed nose belts and independent
left/right opposed bank belts. Total eight controlled actuators before any added
brakes or tension control. Couplings, motors, reductions, gate slides, fasteners,
backing, stiffness, holding and the complete transmission are not packaged.

There are111 actual rendered meshes, including belt sections; shafts use one
instanced draw. Part identities and dimensions remain stable through the five
states, with one full coral. Node validates Three.js vertices and transforms for
front and left. Parent-browser framing, screenshots and canvas pixels were not
verified in this isolated four-file task. No physical test, physics simulation,
elite-performance claim or all-angle acquisition claim is made.