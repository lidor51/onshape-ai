# Candidate A: Supported Return Cassette

**Final geometry gate: FAIL. Not a finalist. Stop after three local revisions.**
Nine of 23 geometry subchecks pass; 14 fail. The acceptance test requires an actual
PASS and exits 1. Structural tests and matching a frozen report do not turn that
failure into acceptance. No nonzero-width acquisition/transport envelope is admitted.

## Scope And Reproduction

Only [feed-cassette.mjs](feed-cassette.mjs),
[feed-cassette.test.mjs](feed-cassette.test.mjs),
[feed-cassette-report.json](feed-cassette-report.json) and this document were written.
The four protected legacy feed artifacts are SHA-256 checked against their original
contents. They remain unchanged, including the externally updated report.

```text
node --test trials/intake-finalists/feed-cassette.test.mjs
node --input-type=module -e "import('./trials/intake-finalists/feed-cassette.mjs').then(module=>console.log(JSON.stringify(module.evaluate(),null,2)))"
```

The first command is expected to exit **1 because geometry fails**, not because an
expected-failure assertion substitutes for acceptance. The second prints all
evidence without overwriting any file. The report freezes gates, indexer/contact
metrics, entry screens, inventory counts and every evaluated collision family.

Final run with the existing mounting test:
`node --test trials/intake-finalists/feed-cassette.test.mjs trials/intake-finalists/mounts.test.mjs`.
Result: **13 passing, one failing, zero skipped; exit1**. The sole failure is the
required geometry acceptance gate. All frozen measurements and legacy hashes
match. Twelve passing checks belong to the cassette; one is the mounting invariant.

The module supplies `definition = {id:'A', name, dimensions, states, limits}`,
`buildModel(state, progress, mount)` and `evaluate()`. States are `acquire`,
`capture`, `transfer`, `handoff`, `stow`; mounts are `front` and `left`.
All model parts keep their dimensions and identities. One full coral follows the
commanded path; no second piece is introduced at handoff. Parent artifacts were
not modified to install this failed revision.

## Architecture And Dimensions

Ancestry: 01 supplies separate pickup/feed; 09 supplies independently driven
left/right orienting banks. This is a fixed indexing cell, not a moving carrier.
07 supplies the rigid side-entry mounting interpretation. Left mounting has no
invented swerve turn-time penalty; the actual 700 mm inward package is checked.
Original [01 flow](../../outputs/concepts/concept-01.html) and
[09 flow](../../outputs/concepts/concept-09.html) remain unchanged.

Coordinates: mm, x across, +y inward, z up. Yaw is measured from +y toward +x.
The collision piece is the full finite L301.625 x OD114.3 cylinder. Its bore is not
used to excuse interference. All commanded transport is horizontal, pitch zero.

| Item | New geometry |
| --- | --- |
| Lower front / crest / tail drum centers, y,z | (-390,33), (-180,201), (0,201) |
| Reverse-bend return idler, y,z | (-140,148), R25 |
| Belt thickness / drum / outside radius | 3 / 25 / 28 |
| Fold pivot / angle | (0,80,200), x-axis, 109.561100 degrees |
| Nose belt lanes | x=-164..-79 and 79..164 |
| Fixed belt lanes / center slot | x=-74..-0.5 and 0.5..74 / 1 mm |
| Fixed working run / drum radius | y25..415 / R15 |
| Lower / upper fixed working faces | z229 / z340.3 |
| Fixed opposed gap / total indentation ceiling | 111.3 / 3 mm TOTAL |
| Fixed cell center / stops / fence inside | (0,205,284.65) / y27,383 / x=+/-180 |
| Cell gate leaves | two 160 x 6 x 70 leaves/end; lateral stroke183 |
| Receiver acceptance center | (0,455,284.65), tube axis +y |
| End-grip pads / cradle top / end stop inside | y520..610 / z227.5 / y616 |
| Receiver jaw gap | open155.3, closed111.3 |
| Receiver withdrawal / lift / inward return | +145 y / +180 z / -145 y |

The lower loop uses signed common tangents around four real drums. Its lower
return runs horizontally above the bumper, then reverses around the exterior
idler. It is **not** the old tail-to-front triangular chord. The return underside
is z173, eight millimeters above bumper top165. This is a local analytic result,
not a whole-loop/sweep certificate.

The upper nose uses separate angled and horizontal oval loops, each supported at
both turns by actual drums. It does not prescribe a large unsupported curved
upper belt. The two-loop transition is real hardware but does not establish
continuous opposition through the crest. The powered upper front entry roller
is also real hardware and is part of the failed rigid-interference screen.

There are **171 modeled physical bodies: 10 belt loops, 26 individual drums,
28 shafts, 52 holed bearing blocks and two holed pivot plates**, plus the listed
supports/gates/receiver parts. Bearing holes have radius4.5 around R4 shafts;
pivot holes have radius9.5 around R9 stubs. Holes render as cutouts and have
separate clearance checks. Counts are not draw-call counts or a complete BOM.
The 1 mm bank slot improves contact but adjacent shaft/bearing packaging still
interferes. No claim of buildable independent drives follows from the lane result.

## Side And Plan Paths

```text
SIDE, DEPLOYED (y -> inward; z up)

 powered top entry roller       upper ramp loop   upper flat loop
           O                         O======O       O=======O
 coral on floor -> lower front arc -> rise -> crest -> flat -> fixed cell
                   O===================O===========O
                    \                o============/  return z173
                     \__ lower return idler ______/
                                           [bumper top165]

 commanded tube center:
 floor (-470.088...,57.15) -> front-drum arc -> rising tangent
 -> crest arc -> (0,284.65) -> fixed cell (205,284.65)
 -> receiver (455,284.65) -> (600,284.65)
 -> (600,464.65) -> (455,464.65)

 PLAN, FIXED CELL
 crosswise tube axis x =======   -> command yaw90..0 -> axis y
     closed front leaves at y27 | pinched split banks | back leaves y383
 receiver absent: close both ends, hold one coral, command zero drives
 receiver ready: open back -> feed -> end grip -> external confirmation

 STOW
 receiver and coral remain at raised datum (0,455,464.65)
 empty nose rotates about the SAME (0,80,200) pivot to109.561100 degrees
 current hardware intersects the cell during this fold: FAIL
```

Diagrams explain topology, not successful motion. `buildModel()` gives recognizable
drums, finite belts, shafts, holed plates, gates and rails at each commanded pose.
The floor entry, folding and receiver-joint interferences remain visible/modelled;
there is no teleporting arm, resized roller, disappearing stop or enclosing
receiver roof. Node checks vertices/transforms for both mounts. No browser framing,
screenshots or canvas-pixel verification was performed in this four-file task.

`acquire` covers the front arc; `capture` covers rise, crest and flat. `transfer`
advances during0..0.4, closes the front during0.4..0.6, and commands yaw90->0 during
0.6..1. `handoff` opens the back0..0.1, feeds0.1..0.45, closes jaws0.45..0.55,
withdraws0.55..0.7, lifts0.7..0.85, then returns inward0.85..1. `stow` folds the nose.
Reverse follows these same axes in reverse; reverse actuator reachability does
not override the recorded forward collision and contact failures.

## Contact, Entry And Ownership

The full finite cylinder is used for flat-lane clipping and drum contact.
At yaw0 and x-offset10, far-bank contact reserve is

$$\sqrt{57.15^2-10.5^2}-55.65=0.527153\text{ mm}.$$

All 819 combinations of yaw0..90 in one-degree increments and x/y offsets -10,0,10
pass the 0.5 mm reserve threshold. Maximum fixed-bank total indentation is3 mm,
not3 mm per face. There is no relaxation to unlimited elasticity or a2 mm/face
assumption. The 1 mm slot is **not** acceptable complete shaft packaging yet.

The two-bank contact set makes differential rotation geometrically possible at
the listed poses, but commanded yaw is not a torque/slip model, orientation
observation, centering controller or demonstrated rotation path. Common-angle
acquisition and an auto-orient chassis-driving strategy remain unproven.

At the initial floor pose, a powered upper roller plus the passive tangent floor
counts as an opposing pair. Two powered faces are not demanded unnecessarily.
Nevertheless the subsequent rise loses opposition at54 of206 sampled poses and
has up to29.5 mm demanded total indentation. The rigid entry shaft and its bearing
also intersect the commanded tube. Zero sampled unpowered poses does not rescue
these failures or certify the complete flow.

| Initial yaw, x=0 | Total demanded indentation, mm | Result |
| --- | --- | --- |
| 0 / 180 | 21.337136 | FAIL; rigid upper-entry drum interference |
| 80 / 100 | 31.839372 | FAIL; rigid front drum interference |
| 85 / 95 | 18.504477 | FAIL; rigid front drum interference |
| 89 / 91 | 6.300572 | FAIL; rigid front drum interference |
| 89.5 / 90.5 | 4.663811 | FAIL; exceeds3 even with rigid-drum clearance |
| 90 | 3.000000 | Floor-only PASS, not transport acceptance |

The report includes 17 yaws and offsets -10,0,10. **Only exact yaw90 passes the
tested floor rows. No positive-width admitted envelope exists.** This is not an
elite arbitrary-orientation intake, nor evidence that a few-degree acquisition
strategy will be robust. General-yaw angled support bounds can reject
conservatively; the important near-crosswise drum collisions are finite-cylinder
tests, not a plan rectangle substituted for the cylinder's circular section.

The cell has upper/lower belt pinch, side fences and front/back leaves translating
sideways between belt heights. Gate opening does not sweep vertically through the
bank material. Four fixed-yaw planar escape searches remain enclosed; opening the
back provides a successful escape control. This is a 10 mm translation grid, not
a proof against arbitrary simultaneous yaw/pitch/lift, power loss or applied load.
The full yaw/offset workspace misses its 5 mm gate by1.276326 mm.

The receiver is a separate end-grip/cradle, without a trapping full-body roof.
At acceptance the lengthwise tube still overlaps the fixed bank by110.8125 mm.
Withdrawal moves its trailing end to449.1875, beyond bank cap433 with16.1875 mm
clearance before lift. The cradle supplies a bottom support, while closed side
jaws provide a3 mm geometric pinch. Grip confirmation must be external. There
are still receiver guide/stop/support interferences; neither joint packaging nor
positive gripping force has passed. An absent receiver retains the upstream
occupied cell and inhibits feed; there is never a second simultaneously held coral.

## Final Gate And Limits

| Key check | Final measured value | Outcome |
| --- | --- | --- |
| Analytic lower-return underside above bumper | 8 mm | Local PASS only |
| Whole modeled hardware maximum extension | 450.258116 mm | PASS; reserve6.941884 >=5 |
| Stowed inset front / left | 6 / 7 mm | PASS |
| Stowed height / hardware floor | 726.787530 / 5 mm | PASS |
| Full-coral bumper/frame interval bound | 32.5 mm | Bounded PASS for commanded path |
| Whole hardware bumper/frame interval bound | 0 mm | FAIL to certify5; not penetration evidence |
| Tail drum / front leaf during fold | intersection at stow0.425 | FAIL |
| Gate / nose belt during fold | intersection at stow0.275 | FAIL |
| Entry shaft / full coral | signed gap -4 mm | FAIL |
| Loaded fold clearance bound | -9.936392 mm | FAIL to certify5 |
| Fixed-indexer reserve | 0.527153 mm,819/819 | Contact subcheck PASS |
| Closed cell workspace | 3.723674 mm | FAIL against5 |
| Planar cell escape / open control | four blocked / one exit | Limited retention subcheck PASS |
| Powered gaps / missing opposition | 0 / 54 sampled poses | Opposition FAIL |
| Total demanded transport indentation | 29.5 mm | FAIL against3 |
| Practical entry, continuous flow, complete transmission | unresolved / blocked | FAIL |

The evaluator checks344595 nonmating hardware pairs across206 poses, including
every prescribed path/actuator breakpoint. Static and same-rigid-assembly pairs
are evaluated once; their geometry does not change. The report includes all
evaluated role families, not just convenient roller-to-bumper pairs. Intended
shaft/drum, belt/drum and declared attached joints are explicit exclusions;
shaft-to-hole fits remain checked. This is not permission to ignore new contacts.

Hardware belt arcs use2-degree facets with sub0.005 mm sagitta corrections.
Interval screening combines swept-AABB separation and clearance minus bounded
motion. Fold extension uses analytic angular extrema, with conservative full
circles for belt arcs. General-yaw prism tests conservatively enclose angled
supports. Yawed belt arcs use partitioned numerical minimization, not a certified
global nonlinear solve. Negative polygon sentinels and interval bounds are not
penetration depths; actual entry and tail-drum collision witnesses independently
establish FAIL. A zero conservative bound is not a measured zero gap.

Six positioning axes and three drive groups are exposed: fold, front gate, back
gate, jaws, receiver withdrawal, receiver lift; nose drive and independent left/
right indexer drives. Nine controlled actuators precede brakes or tension control.
Drums have shafts and holed bearing blocks, but support-spine ties, complete drive
couplings, tensioners, reductions and actuator attachments are not fully packaged.
No broad acquisition, traction, preload force, yaw control, belt tracking, stiffness,
load, holding force, cycle time or reliability proof is claimed. No API/network,
CAD kernel, vendor CAD, secrets, commits or delegates were used.