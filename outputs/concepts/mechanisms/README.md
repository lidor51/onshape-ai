# Intake Mechanisms And States

[Open the intake state viewer](index.html) | [Fourteen open views](overview.png) |
[Original 2D flow gallery](../index.html) | [Whole-robot field scenes](../../whole-robots/mechanisms/states/index.html)

Each of the fourteen original intake suggestions now has recognizable 3D mechanism
mockups in three discrete states: **open at floor coral**, **collapsed with retained
coral**, and **handoff into a rough receiver**. The same camera scale is used across
an intake's three states. Each model contains one full-size hollow coral; the frame,
fixed indexer and receiver stay fixed while the proposed moving section changes pose.

The 2D side/top path and flow drawings are **retained, not replaced**. The new viewer
shows the selected option's original drawing immediately below its three-state sheet.
All fourteen original SVGs and fourteen corresponding PNGs remain byte-identical;
the new manifest records their hashes. Mouth intent and receiver datums agree with
the original dataset, but the modeled hardware and collapse motions are illustrative
interpretations, not exact geometric conversions or solved mechanisms.

| ID | Mechanism | Three-State Sheet |
| --- | --- | --- |
| 01 | Kicker and fixed V | [PNG](intake-01-states.png) |
| 02 | Opposed belts and cradle | [PNG](intake-02-states.png) |
| 03 | Floating nose and indexer | [PNG](intake-03-states.png) |
| 04 | Pivot scoop | [PNG](intake-04-states.png) |
| 05 | Rising drawer | [PNG](intake-05-states.png) |
| 06 | Tip cradle | [PNG](intake-06-states.png) |
| 07 | Side entry | [PNG](intake-07-states.png) |
| 08 | Grab and lift | [PNG](intake-08-states.png) |
| 09 | Differential wheel deck | [PNG](intake-09-states.png) |
| 10 | Segmented star tunnel | [PNG](intake-10-states.png) |
| 11 | 1690/2056 reference chain | [PNG](intake-11-states.png) |
| 12 | Through-bumper cutout | [PNG](intake-12-states.png) |
| 13 | Internal bore mandrel | [PNG](intake-13-states.png) |
| 14 | 1778 carrier with locked lower contact | [PNG](intake-14-states.png) |

Option 12 remains **noncompliant with the 2025 bumper rules**; its actual front
opening is intentionally visible. Option 13's half-transparent coral is an
inspection aid for the mandrel pads. Option 14's crossed lower contact is locked
relative to its moving carrier, not to the world. Reference-inspired concepts are
not measured replicas of team CAD.

Open/collapsed/handoff are pose proposals, not a continuous animation, contact
simulation, collision-free sweep, retention test, starting-envelope approval or
physical-success claim. Showing coral at a receiver does not prove the path can
deliver it. The original flow drawings remain useful for that next-stage work.

Built with the existing Three.js cartoon primitives, without CAD kernels or
Onshape calls. The unit tests construct all 42 models, preserve receiver coordinates,
check one-piece geometry and moving/fixed groups, and retain the known rule warning.
Canvas exports are checked separately for nonblank pixels and camera framing.
The [verification record](../../whole-robots/mechanisms/states/verification.json)
records all exports, preservation hashes, responsive checks and hidden-tab limits.