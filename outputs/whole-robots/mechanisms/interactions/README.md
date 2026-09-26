# Task-Specific Robot Interactions

[Interactive task viewer](../index.html) | [All task sheets](index.html) |
[Same L4 target, different robots](l4-comparison.png) | [Numeric solutions](solutions.json)

This replaces the previous fixed-distance nearby scenes as the main robot viewer.
Select a robot, a **supported task**, and **approach / engage / release**. Switch
robots in the same-task table to compare their configuration and bumper stand-off
against the same fixed field target. Contact-detail framing exposes the piece/tool
interface. The previous [nearby-state sheets](../states/index.html) remain archived;
the [intake 3D and original 2D flow drawings](../../../concepts/mechanisms/index.html)
are unchanged by this task study.

## Coverage

Task availability follows each concept's declared capabilities: individual L1-L4
placements, coral floor/station intake, algae floor/low-reef/high-reef intake,
processor delivery, and net shooting or placement. Unsupported tasks are omitted
from the selector, not fabricated for every robot. Climb/stow/park retain their
separate illustrative studies; they are not newly solved loaded interactions.

Declared capability is a design intention, not proof. A declared task that cannot
be reached by the explicit task-study geometry is shown as **unreachable**, **active
tool extension exceeded**, or **chassis/target overlap**. The target does not move
up/down to hide a failure, and the chassis never floats above carpet to add reach.
R02 and R10 floor-coral poses expose a missing low-reaching motion in the current
lift recipe. Fixed-arm configurations can also fail the extension check; inspect
the current numeric result rather than assuming every declared capability works.

## What Is Actually Aligned

- **L1:** coral bottom contacts a proposed trough support surface at the sourced
  front-edge height. Full trough profile remains an assumption.
- **L2/L3:** a closed, inclined branch enters the real hollow coral bore. The
  branch/piece axes are coaxial; the engagement depth is explicit. Pipe OD, highest
  points and 35-degree angle are sourced; exposed length/cap/support details remain assumed.
- **L4:** vertical coral is lowered over the fixed vertical branch. Approach,
  insertion and tool withdrawal are separate phases; the placed piece stays put
  during withdrawal. This is not an animation that moves the field to meet the wrist.
- **Station:** crosswise coral translates down the 55-degree chute. The pipe axis
  is different from the feed direction. The nominal cross-section fits the sourced
  opening; acquisition reliability and the complete handoff remain untested.
- **Floor:** one full-size coral or algae sits on the ideal floor in the pickup
  phase, then is carried in the withdrawal phase. Loose pieces are separate tasks;
  the initially stacked algae-on-coral arrangement is not treated as loose pickup.
- **Processor:** a full-size algae crosses the actual 711.2 x 508 mm bounding
  aperture at center height 431.8 mm. Contact hardware remains robot-side of the
  opening while the ball is released; lip, rounded-corner and compression details remain open.
- **Net:** R03/R09 use an ideal fixed-angle projectile calculation and show release
  speed, time and trajectory. R02/R06/R10 show high placement then gravity release.
  The net side-entry boundary and clear aperture are explicit hypotheses, not a
  verified flat rim; higher end panels and sagging net are retained.

The field is defined in a local reference frame and stays fixed across robots.
Only robot ground-plane position, heading and mechanism settings change. The
stand-off dimension is measured from the relevant **bumper face** to the selected
task reference plane. This is different from the rule's extension measurement,
which starts at ROBOT PERIMETER. Floor stand-off uses the piece center plane.

## Geometry And Limits

Example, **the same L4 engagement target**: R03 uses a 2039.6 mm carriage height
and 480 mm support reach with **56.4 mm bumper stand-off**. R04 uses a 1755.7 mm
boom at 66.5 degrees with **207.6 mm stand-off**. Both prescribe a vertical coral
axis. These are outputs of the stated task-study dimensions, not measured robots
or final inspection distances. The [verification record](verification.json) captures
this comparison, coverage, limits and responsive checks.

The earlier cartoons did not encode a complete kinematic chain. This revision
therefore defines explicit task-study base positions, rail ranges, arm lengths,
reach-slide limits and contact-tool mounting offsets. Lift, telescopic, fixed-arm
and two-link solvers calculate the drawn endpoint; tests compare actual mesh tool
and mounting coordinates to the solution, not just labels in JSON.

Tool attitude is an imposed task requirement. The displayed piece-axis angle is
not a certified wrist actuator/joint inventory: indexing a crosswise station pickup
into another orientation still requires a mechanically verified wrist/orienter and
a tested transition. The model proves neither available wrist torque nor complete
movement between these independently solved phases.

An active forward-tool envelope check limits adjustable arm projection and exposes
fixed-geometry violations. It is **not** a full robot/body/field collision check or
all-state rules inspection. Inactive hardware packaging, elbows, drives, cables,
deflection, all game-piece clearances, stability, retention and loads need further
verification. The aligned state is a geometric construction, not a physical-success claim.

Net trajectories use gravity with no drag, spin or measured launch behavior.
Reef algae centers and net aperture hypotheses are fixed for comparison but remain
unverified. See [field evidence and datums](../../../../trials/whole-robot-concepts/mechanisms/FIELD-TARGETS.md)
and [the source record](../../../../trials/whole-robot-concepts/mechanisms/field-targets.json).

## Reproduce

```powershell
node --test trials/whole-robot-concepts/mechanisms/task-contract.test.mjs trials/whole-robot-concepts/mechanisms/interaction-*.test.mjs trials/whole-robot-concepts/mechanisms/task-field.test.mjs
node trials/whole-robot-concepts/mechanisms/build.mjs
```

The HTML works locally without a development server. PNGs are direct WebGL canvas
exports; a filename-restricted loopback receiver is used temporarily during export.
No Onshape API or CAD kernel is used. Old mechanism and intake outputs are retained.