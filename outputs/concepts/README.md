# Fourteen Coral Intake Concepts

[Open the gallery](index.html) | [All fourteen on one sheet](overview.png) | [Editable dimensioned data](concepts.json)

**Added:** [3D mechanism states](mechanisms/index.html) show every intake open,
collapsed and offering coral to its receiver. The original side/top path drawings
remain unchanged and are included alongside the new views, not replaced.

Stage 2: approximate napkin-CAD alternatives for a 2025 standalone intake and rough
receiver. Side and top views use the same respective scales across all fourteen options.
The sheets show the nominal coral at handoff, bumper/chassis context, a proposed
center path, moving outlines, one main risk and one cheap prototype test.
None is a verified working mechanism, rules inspection or manufacturing design.

| Option | Principle | Handoff Height | Main Unresolved Issue |
| --- | --- | --- | --- |
| [01 Kicker and fixed V](concept-01.png) | Lift with rollers; orient with passive guides | 260 mm | Wedging and contact gaps |
| [02 Opposed belts and cradle](concept-02.png) | Pinch between belts; deliver crosswise | 275 mm | Belt tracking, preload and exit transition |
| [03 Floating nose and indexer](concept-03.png) | Compliant pickup; stationary powered orientation | 242 mm | Contact force and moving bridge gap |
| [04 Pivot Scoop](concept-04.png) | Capture and carry directly to the receiver | 312 mm | Retention throughout rotation |
| [05 Rising Drawer](concept-05.png) | Capture, lift on a cam, then retract | 260 mm | Binding, sag and stow |
| [06 Tip Cradle](concept-06.png) | Capture nose-in; tip and discharge | 245 mm | Limited entry orientation and release timing |
| [07 Side Door](concept-07.png) | Lift outside the side bumper; feed sideways | 240 mm | Side approach, lift and swept clearance |
| [08 Grab and Lift](concept-08.png) | Pick and place with short links and jaws | 387 mm | Narrow capture and wrist control |
| [09 Wheel Deck](concept-09.png) | Lift onto independently driven yawing banks | 250 mm | Grip while turning and sensing |
| [10 Segmented star tunnel](concept-10.png) | Advance through compliant rotating pockets | 282 mm | Phasing and pinch points |
| [11 1690 / 2056 reference clone](concept-11.png) | Floating pickup, powered V banks and two-event stopped cradle | 245 mm | Reference hybrid, not measured team CAD; contact and controls untested |
| [12 Through-bumper cutout](concept-12.png) | Shallow belt feed through an actual 350 mm front opening | 95 mm | Known 2025 R401/R402/R405 conflict; geometry comparison only |
| [13 Bore-Lock Elevator](concept-13.png) | Expand inside coral, lift, release to outside receiver, then retract | 280 mm | End-on alignment, dirty-bore grip and positive release |
| [14 1778 reference clone](concept-14.png) | Capture, center during raise, then drive against a carrier-locked lower axle | 337 mm | Retention, entry orientation, receiver alignment and grip tuning |

The added reference option follows the mechanisms documented in the
[2056 binder review](../../research/2025-coral/2056-binder.md) and
[1690 first-hand account](../../research/2025-coral/1690-1778.md), not a dimensional
copy of either team's robot. Option 12 intentionally removes required bumper
protection, unlike a chassis recess or trimming only excess bumper material;
the [2025 rules audit](../../research/2025-coral/rules.md#bumper-integration) excludes
that opening for competition. Option 13 is an original internal-grip hypothesis.
Option 14 follows the [1778 firsthand reports](../../research/2025-coral/1690-1778.md#1778-reported-behavior-and-revisions):
presence-triggered raising, mechanical centering and an intentionally locked lower
axle for powered handoff. Gray crossed contact means locked to the moving carrier,
not world-fixed; green means driven. Its coordinates, short centering fingers and
deployment motion are proposals, not measured 1778 CAD. Presence alone does not
prove centering or receiver alignment.

## Selection

Suggested comparison, not a measured ranking: **03** for separate pickup and
orientation, **04** for direct carried handoff, and **02** for opposed continuous
contact. Select one or two IDs before Stage 3. No option has been selected for you.
The remaining options stay available, with 12 retained only as a non-compliant
geometry comparison, not a 2025 competition candidate.

The bumper and blank chassis are provisional reference envelopes. Internal frame
recesses do not imply permission to remove required bumper protection. Receiver
blocks are symbols, not sized gripping tools. Ghost outlines are proposed poses,
not collision-checked sweeps; mouth width is intent, not proven acquisition width.
For 07, lateral travel is visible in top view and collapses in side view. For 08,
the stated 350 mm approach envelope is not a demonstrated jaw capture width.

## Reproduce

Run from the repository root. Only the first command downloads dependencies;
subsequent rendering and tests are local, without credentials or CAD kernels.

```powershell
npm ci --prefix trials/subsystem-ab/concepts --ignore-scripts --no-audit --no-fund
node trials/subsystem-ab/concepts/render.mjs
node trials/subsystem-ab/concepts/render-png.mjs
node --test trials/subsystem-ab/concepts/*.test.mjs
```

The initial three concept families were drafted by separate GPT-6 Astra subagents;
each of the four additions also had its own GPT-6 Astra drafter. All were combined
and reviewed with one renderer. This is concept diversity, not fourteen independent
engineering validations. The manifest records the fifteen-PNG pass runtime;
this excludes research, authoring and review latency.
The [manifest](manifest.json) records SVG/PNG hashes, dimensions are checked by tests,
and the [stage-gated workflow](../../docs/DESIGN-WORKFLOW.md) governs further work.