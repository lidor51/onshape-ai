# Mechanism Concepts: Revision 2

**Current viewer:** [task-specific interactions](index.html) now replace the generic
nearby states. It reports configuration and stand-off for each supported L1-L4,
processor/net and acquisition task, with approach/engage/release and explicit
unresolved limits. See [the interaction review](interactions/README.md) and
[L4 comparison](interactions/l4-comparison.png). Earlier renders below are archived
concept snapshots, not newly validated interactions.

[Open the 3D mechanism viewer](index.html) | [Ten revised previews](overview.png) |
[Architecture standard](../../../docs/ROBOT-ARCHITECTURE-STANDARD.md) |
[Cycle and complexity review](review.json)

## New State Illustrations

[Six-state sheets for all ten robots](states/index.html) now show collapsed/starting
intent, open floor acquisition, station receive, coral at a reef approach, algae
at a reef approach, and cage approach (parking context for R06). The interactive
viewer includes the same field context by default and frames both robot and field.
The individual scenes are framed independently; comparisons do not imply equal
scale between different robot/context scenes.

Field models use known 2025 datums for station opening height, reef branch tips,
trough edge and cage dimensions. Cropped profiles, approach spacing and unspecified
depths remain illustrative. Reef-algae center heights are unknown and represented
by explicitly provisional wire markers. Field elements are not moved vertically
to make a tool appear to reach them. Proximity is not verified contact or scoring;
the starting outline is not an inspection pass, and a cage approach is not a loaded climb.

[Fourteen intake mechanism state sheets](../../concepts/mechanisms/index.html) add
the same visual treatment to the intake suggestions, alongside their unchanged
2D path/flow drawings.

The first whole-robot set was a space-claim/pose study. It did **not** meet the
requested cartoon-mechanism fidelity or put enough emphasis on an elite winning
alliance. This revision changes both the visual deliverable and the recommendation.
The [earlier box study](../index.html) is preserved, not retroactively called a
validated mechanism model.

## What Changed

The ten robots now show real 3D primitive rollers and shafts, extruded side plates,
paired links, nested rails and carriages, wrists, fixed-hood shooters where selected,
and connected climb arms/hooks. Battery and electrical volumes remain simple blocks
because they are legitimate space claims. One configuration is shown at a time;
alternate poses are selectable, not multiple physical arms overlaid on one robot.

These are original **mechanism-shaped sketches**, not detailed vendor assemblies
or exact replicas. The primitive dimensions and configuration recipes are new
proposals, not a faithful solid conversion of the previous coordinate tables.
The old static-envelope checks do not validate this new geometry. Changing a pose
rebuilds a snapshot; it is not a continuous, collision-checked motion simulation.

## Elite Does Not Mean Most Features

The target is a high-value, repeatable role on a winning alliance, ideally with few
unnecessary axes, transfers and state changes. A simpler-looking arm is not
automatically simpler to control or build. Removing L4, net or deep climb is not
automatically a simplification worth making. Every addition and omission must earn
its place through complete cycles, partner assumptions and reliability testing.

| ID | Current Assessment | First Decision |
| --- | --- | --- |
| R03 | **Lead contender:** station-fed L4, independent algae net/processor, deep intent | Test one-way algae feed and shots early; compare rear-receive/front-score routes before accepting no floor coral |
| R01 | **Benchmark contender:** L4 plus floor recovery, independent processor algae, deep intent | One floor-to-wrist handoff, direct rear station receive; test occupied stow and front approach conflicts |
| R09 | **Specialist contender:** algae-first, L1-L3 backup, deep intent | Does useful clearing and net throughput add more alliance value than another coral-maximizing robot? |
| R04 | Conditional no-handoff challenger | Does shared-wrist versatility and loaded telescope behavior beat the transfers it removes? |
| R02 | Conditional shared carriage | Account for reach, pitch, selection, serial tasks and unverified net placement |
| R05 | Conditional floor-recovery carrier | Compare carrier centering/retention against R01 before accepting high-algae/net/deep omissions |
| R06 | Conditional turret | Measure full-cycle benefit after settling, cable limits, backlash and lost climb contribution |
| R10 | Conditional twin lifts | Useful overlap must outperform the independent retention already possible on R01/R03 |
| R07 / R08 | Lower-reach comparisons, **not default powerhouse recommendations** | Keep as controls; require measured alliance benefit to justify the lost reach |

"Contender" describes architectural fit, not evidence of dominant performance.
The detailed review includes a proposed winning-alliance role and autonomous
direction for each, plus cycle sides and explicitly scoped positioning-DOF and
handoff counts. No autonomous routine, cycle time, success probability, mass or
performance ranking has been measured.

## Architecture Method To Retain

1. Define the desired winning-alliance role and complete cycles, including the best
   autonomous plan to investigate, partner lanes and fallback behavior.
2. Choose ground/station acquisition and chassis-relative intake/scoring sides.
   Compare complete field routes; rear receive/front score does not prove zero turns.
3. Place full-size game pieces and sourced field interfaces around a black-box
   robot before solving the mechanism that connects those poses.
4. Reserve intrusive endgame space and its sweep before the scoring architecture
   consumes it. For 2025, cage engagement is an architectural concern.
5. Compare familiar linear/rotary mechanisms on the same mission: axes, contacts,
   handoffs, state changes, robustness, cabling, servicing and shop feasibility.
6. Build common-datum sketches and recognizable 3D cartoon mechanisms. Add only
   the detail needed to resolve a risky contact or tight packaging decision.
7. Prototype, test and iterate before broad detailed CAD.

The [standard](../../../docs/ROBOT-ARCHITECTURE-STANDARD.md) distinguishes the
independently read September 2023 Torrance post and its three inspected images
from the later workflow supplied by the user and attributed to 254. The long
user-provided passage was not falsely assigned to the 2023 post. No reference
image copies are published here.

## Limits And Verification

The seven configurations are visual hypotheses: travel, starting package, floor,
station, coral, algae and climb approach. They do not establish actual floor
contact, piece retention, a legal starting package, loaded stroke, full extension,
interference-free sweeps, insertion, ballistics, cage engagement or strength.
Some high-risk interfaces are still visibly unresolved; a more readable model is
not a better test result. In particular, net rim, reef-algae centers and cage
engagement geometry still need authoritative dimension checks.

Three.js provides the local mesh rendering; no CAD kernel or Onshape call is used.
Tests construct all 70 recipe/configuration combinations and verify finite solids
and expected primitive types. Browser verification separately checks nonblank
canvas pixels, framing and configuration/camera operation at desktop/mobile sizes.
Neither test category proves engineering performance. Snapshots and review counts
are recipe intentions, not a complete motion/actuator inventory; roller drives,
grip closures, latches and service operations must also be counted before selection.
The [verification record](verification.json) contains the observed canvas, framing,
interaction and responsive checks, including the integrated-browser capture limitation.

## Reproduce

```powershell
npm ci --prefix trials/whole-robot-concepts/mechanisms --ignore-scripts --no-audit --no-fund
node --test trials/whole-robot-concepts/mechanisms/*.test.mjs
node trials/whole-robot-concepts/mechanisms/build.mjs
```

Open the local HTML directly; no application server is required. PNGs were exported
from the WebGL canvas because integrated-browser element screenshots cropped the
wrong screen area. A temporary filename-restricted receiver bound to loopback was
used only for those generated exports and stopped afterward. The finalizer builds
the overview from those exports and records their hashes; it does not recreate
missing screenshots or fabricate browser checks.