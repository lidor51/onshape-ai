# Intake Narrowing: Geometry Gate Not Yet Met

## 2026-09-14 Continuation

The user approved the end-grip/lift-away receiver redesign. Two separate revisions
were implemented and checked without altering the legacy packets, including the
externally updated feed report. **Neither revision passes the required geometry
gate. The requested two-ready-finalist checkpoint remains unmet.**

| Revision | Improvements | Blocking Evidence |
| --- | --- | --- |
| [A: supported return cassette](FEED-CASSETTE.md) | 8 mm local belt-return/bumper gap; 6.942 mm extension reserve; front/left stow inset 6/7 mm; indexer contact reserve 0.527 mm | Entry shaft/coral interference; 54 transport samples without opposition; 29.5 mm demanded indentation against the unchanged 3 mm ceiling; folding/gate collisions |
| [B: split receiver with lift-away](CARRY-LIFT.md) | Continuous grip-release-lift-return sequence; 250 mm receiver lift; full shafts and receiver supports retained in checks | Receiver stem crosses a full shaft during lift; returning roller/shaft intersects the receiver-held coral; floor and left-frame margins fail |

Both received three local topology repairs. The revised A grew to 171 modeled
physical bodies and B to 79 hardware bodies, without demonstrating the required
contact and transfer performance. That is a warning against further complexity,
not evidence that either is close to a simple, effective intake. Body counts are
not actuator counts or a finished BOM.

Independent parent verification:

```powershell
node --test trials/intake-finalists/carry-lift.test.mjs trials/intake-finalists/feed-cassette.test.mjs trials/intake-finalists/handoff-sequence.test.mjs trials/intake-finalists/mounts.test.mjs
```

Result: **28 tests, 26 pass, 2 fail, zero skipped**. The failures are the actual
mandatory geometry-acceptance tests, left failing intentionally rather than
converted to expected failures. Saved reports match recomputation, old file hashes
match, and the sequence/mounting checks pass. These are digital geometry checks,
not physical trials. No new finalist browser views or Onshape model were produced.

The new [carrier report](carry-lift-report.json) and [feed report](feed-cassette-report.json)
are separate from the preserved legacy reports below. B's initial sparse receiver
probe cleared its eleven points, but denser sampling found the stem/shaft collision
at handoff progress 0.465. The actual sampled gap is -9.35 mm; this is not just a
between-sample certification issue. Complete pickup and useful nonzero-yaw
acquisition are still unproved for both candidates.

**Recommended reset:** discard these failed transfer implementations, retain the
useful mounting/contact calculations, and compare a simpler direct carried handoff
against a side-lift/shuttle arrangement. Establish collision-free receiver escape
and an adjustable real-piece capture fixture before adding orientation machinery.
This is a proposed next direction, not an implemented fix or a passing pair.
Further geometry edits pause here after the three-attempt repair limit; no final
selection or Onshape deployment is implied by the completed experiments.

## Previous 2026-09-13 Gate

User authorization, 2026-09-13: advance 01/07/09/14 to two geometry-ready finalists,
stop for selection, then continue the selected option toward Onshape. **No final
pair has passed this gate. No Onshape work or API calls were performed.**

The [brief](BRIEF.md) defines the gate. The [independent screen](SCREEN.md) and
[numeric screen](screen.json) separate drive direction, orientation and transfer.
The existing intake concepts and 2D flow drawings remain unchanged.

## Swerve Correction

Sideways motion is not inherently worse with holonomic swerve. Rotating the intake
and approach together preserves local relative velocity and geometry. The tested
front/left coordinate transform makes no turn-time or lateral-speed deduction.
On the provisional 700 x 760 mm chassis, orientation changes the available width
and inward depth. Vision coverage, mass distribution, other subsystems and actual
field routes can matter, but none is measured enough here to penalize side entry.
07 is retained as a mounting/routing alternative, not rejected as a slower drive mode.

## What Narrowed

| Candidate Family | Revised Geometry | Current Gate |
| --- | --- | --- |
| A, from 01/09 | Continuous split-belt pickup/bridge and differential orienter feeding a fixed receiver | **FAIL**: return-belt/bumper and folding/gate collisions, excess folded extension, inadequate contact/entry reserves |
| B, from 14 with 07 mounting | Retained rotary carrier, split axial keepers and sequenced receiver | **FAIL**: receiver closing collision and uncertified return clearance; impractically small floor reserve |

01's passive V is not certified by reference teams' powered V indexers. The 09
orientation principle remains worth testing, but projected overlap is not traction
or yaw feedback. The 14 mechanism keeps its direct carried handoff advantage, but
its closed-slot acceptance currently certifies only a centered crosswise piece.
Neither candidate demonstrates robust arbitrary-yaw acquisition.

## Measured Blockers

- [A report](feed-report.json) / [A explanation](FEED.md): continuous lower powered
  coverage replaced the original dead spots, but complete opposed entry is missing.
  Hardware extends 483.597 mm against 457.2 mm; loaded stow inset is 2 mm against
  the selected 5 mm reserve. The belt return intersects the bumper and gates
  interfere with belts. The narrow indexer contact reserve is 0.116 mm against
  the selected 0.5 mm requirement. This is not a geometry-ready intake.
- [B report](carry-report.json) / [B explanation](CARRY.md): the full motion check
  covers 2,052 front/left poses, with conservative between-sample bounds. Receiver
  closing has an actual sampled polygon overlap. Return clearance is 1.5 mm at
  the witness, but its certified lower bound is -0.372 mm against 0.25 mm required.
  The latter is an uncertified interval, not a measured penetration. Hardware
  floor reserve is only 0.276 mm, inadequate as a practical terrain/tolerance margin.

Three bounded repair passes were made on each candidate. Results and earlier
failures are preserved; contacts, receiver bodies and shafts were not excluded to
manufacture a pass. Passing software tests means these results are reproducible,
**not that either assembly passed the geometry gate**.

## Proposed Next Decision

Continuing requires a more fundamental interface change, not another cosmetic
render or relaxing the failed gates:

1. Replace A's return-belt routing and fold topology with a supported cassette
   whose return remains outside the bumper, then resolve entry before orientation.
2. Replace B's interleaving cage receiver with a different receiving-tool approach,
   such as independent end gripping or a lift-away dock. That may add a controlled
   motion and must be counted and collision-checked, not assumed free.

These are proposed directions, not implemented fixes or the final two choices.
The user has not selected an intake or approved either failed assembly for Onshape.
No need to choose between A and B at this point. The current work pauses at this
gate for direction after the three failed local repair passes.

## Reproduce

```powershell
node --test trials/intake-finalists/*.test.mjs
```

39 tests pass: 22 feed, 16 carry, and one mounting test. They exercise fixed
part geometry, state continuity, receiver ownership, contacts and the failure
witnesses. Physics, traction, compliance, active centering, terrain, loads and
manufacturing details remain separate work.