# Design Workflow

The user's 2026-09-13 direction replaces detail-first iteration with five stages.
The later correction is controlling: use the cycle-first
[Robot Architecture Standard](ROBOT-ARCHITECTURE-STANDARD.md), aim for a high-value
winning-alliance role with minimal unnecessary complexity, and produce recognizable
mechanism cartoons rather than tool boxes. Consider optimal autonomous and entry/exit
sides before mechanism selection; reserve intrusive endgame space early. The
[mechanism revision](../outputs/whole-robots/mechanisms/README.md) supersedes the
original R01/R04/R07 shortlist, without claiming validated performance.
Current position: **Stage 2, ten whole-robot concepts ready for selection**; fourteen
earlier intake-only options remain as references. The user expanded scope to coral,
algae, scoring and endgame, while retaining the geometry-before-detail gate. Earlier v1-v5
models remain failed or incomplete studies, not the architecture to finish by default.

| Stage | Work | Gate Before Advancing |
| --- | --- | --- |
| 0. Capabilities and rules | Shop, materials, stock, tolerances, COTS interfaces, game rules and subsystem task | Record known constraints and unknowns; preserve exact imperial COTS interfaces within metric-first custom geometry |
| 1. Research | First-hand robot reports, drawings, binders, observed operation and season updates | Separate observed evidence from inference; explain the contact and handoff principles being borrowed |
| 2. Crayola CAD | Cycle/field-pose sketches and recognizable rails, rollers, plates, arms and hooks; separate physical configurations | User selects one or two concepts; targeted detail only for decision-critical packaging, no wholesale hardware detail |
| 3. Geometry and PoCs | Contact sections, motion envelopes, acquisition yaw/offset cases, retention and receiver access; focused physical mockups | Demonstrate a credible floor-to-receiver sequence, record failures and obtain approval for detail |
| 4. Detailed design | Real parts, load paths, drives, bearings, retention, fasteners, assembly connections and manufacturing outputs | Verify interfaces, loads, tolerances, service access, motion, rule compliance and build readiness |

## Current Inputs

- [Team capabilities and COTS preferences](TEAM-PROFILE.md): aluminum/polycarbonate,
  router CNC, manual machining, printing, no accurate sheet-metal bending.
- [2025 research index](../research/2025-coral/README.md) and
  [rules audit](../research/2025-coral/rules.md): preserve required bumper protection;
  distinguish a chassis recess from a bumper gap; measure extension from ROBOT PERIMETER.
- [Ten full-robot previews and selection matrix](../outputs/whole-robots/README.md),
  [whole-robot gallery](../outputs/whole-robots/index.html), and
  [game/strategy analysis](../trials/whole-robot-concepts/GAME-ANALYSIS.md).
- [Fourteen earlier intake previews and selection table](../outputs/concepts/README.md), with
  [local gallery](../outputs/concepts/index.html) and [overview](../outputs/concepts/overview.png).

## Fast Iteration

Use the cheapest check that can reject the current hypothesis. Stage 2 updates
are dimensioned JSON and 2D rendering, not B-rep construction or vendor STEP imports.
Each output manifest records its own PNG pass runtime; this is not the total
design turnaround. Record the actual runtime and limits of later checks.

In Stage 3, test one uncertain transition first. Keep coral size/orientation,
bumper protection, pivot axes and receiver access explicit. A drawn center path
does not establish positive contact, adequate traction, retention or collision-free
motion. A digital envelope pass does not substitute for a physical acquisition test.
Vary slow entry, yaw, offset, floor height and receiver absence before polishing.

Do not add hundreds of fasteners or repeat full STEP round-trips while the contact
architecture is unresolved. If a check becomes slow, narrow it to the failing
transition before another detailed run. Preserve rejected variants and reasons.

Only promote a selected and locally checked milestone to the authorized Onshape
route. Stage 2 used zero Onshape requests and zero CAD-kernel runs. The earlier
API/browser pilot's budget, native grounding problem and browser policy gate
remain unchanged; this concept package does not resolve any of them.