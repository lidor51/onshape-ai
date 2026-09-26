# Team Design Profile

User-supplied constraints, 2026-09-12. These guide the next 2025 coral intake
research/design study; they do not retroactively validate the earlier geometry
benchmark or its test-only manufacturing assumptions.

## Current Execution Scope

The 2026-09-18 request authorizes actual reference-CAD inspection followed by
autonomous intake/receiver subsystem development. It supersedes the older
research-only, whole-robot-concept and stop-for-user-selection wording below.
The cumulative API budget is authorized but not reset; the annual-allowance,
browser access, shop and physical-release gates remain. See
[the current inspection/development record](../research/2025-coral/CAD-INSPECTION.md).

## Whole-Robot Scope Extension

Latest request, 2026-09-13: ten full-robot concepts for 2025 coral **and algae**, with
game analysis and suggested effective architectures. Include acquisition, retention,
scoring, endgame, starting package and service volume. This supersedes the intake-only
scope below for the current concept study, but not the shop, COTS or stage-gate
constraints. The earlier fourteen intakes remain references, not a selected design.
See [the whole-robot concepts](../outputs/whole-robots/README.md). No detailed/native
CAD deployment, API spending or mechanical-performance claim is implied.

## Manufacturing

| Resource | Confirmed by user | Design consequence |
| --- | --- | --- |
| Main raw materials | Aluminum and polycarbonate | Prefer appropriate flat stock/tube construction; grade, thickness and supplier remain to be selected |
| CNC | Router CNC | Favor cut plates and accessible pockets; do not assume a CNC metal mill, five-axis machining, or an unlimited router work envelope |
| Printing | Prusa MK4 and "markeforge mk2" | Printed guides, guards, spacers or tested functional parts are options; confirm exact Markforged model, materials and reinforcement availability before relying on them |
| Turning | Manual lathe | Turned round shafts, spacers, hubs and simple supports are feasible subject to capacity/tolerance checks |
| Milling | Manual mill | Use for accessible secondary features; keep operations and setups realistic |
| Cutting | Miter saw, jig saw tables, smaller manual hand tools | Cut stock/tubes; do not assume production accuracy without finishing/inspection |
| Press | Manual press | Press operations may be available; tooling/capacity unspecified, not evidence of sheet-metal bending capability |
| Bending | No accurate manual bending; only simple, inaccurate polycarbonate bends | No precision-bent metal brackets or folded-sheet geometry as a hidden manufacturing prerequisite; locate critical features with machined parts instead |

Machine envelope, achievable tolerances, stock grades, print polymers, reinforcement,
and subsystem cost/weight allowances are UNKNOWN, not implicit team capabilities.
For concept work, make assumptions explicit and keep them adjustable. Obtain
confirmation only when a selected part or operation depends on an unknown.

## Units And Purchased Components

- **Metric-first design.** Use inches where the purchased component actually
  requires them. Preserve vendor shaft/bearing fits, gear pitch, threads and hole
  patterns; convert nominal dimensions exactly rather than rounding an imperial
  interface to a nearby metric size. Display the native standard in the parts list.
- **Motors:** Kraken X60 and X44 are the preferred choices, not a mandate to use
  both. Choose motor/reduction from speed, torque, current, duty cycle and packaging.
  Check applicable 2025 rules/availability or clearly label a modernized retrospective.
- **Gearboxes:** prefer in-house designs. Alternatives: REV MAXPlanetary for
  planetary arrangements, or ThriftyBot for cycloidal arrangements. Exact products,
  motor interfaces, ratios and allowed loads must be verified; do not assume
  compatibility with the selected Kraken motor.
- **WCP:** preferred for hex shafts, gears, bearings and similar components.
- **REV:** also used; ION ecosystem selectively, not as a universal design standard.
  Imperial rectangular tube is an option when necessary, otherwise favor locally
  purchased metric tube/stock.
- **Roller contact:** AndyMark compliant wheels are common; custom round tube plus
  rubber is also acceptable. Compare grip, wear, contact pressure, serviceability,
  shaft attachment and controllability; do not assume material/friction values.
- **COTS catalog:** user is already subscribed to FRCDesignApp in Onshape.
  Prefer FRCDesignLib references over recreating vendor parts, with manufacturer
  part number, selected configuration, source/version and units recorded.

## FRCDesign Catalog Integration

The [official setup page](https://frcdesign.org/learning-course/course-setup/required-course-tools/part-library/)
was fetched on 2026-09-12. It describes FRCDesignApp as the free Onshape inserter
and FRCDesignLib as the actual part collection. Existing open documents may need
a reload; first use may request app authorization. The subscription is user-reported,
not a live connection check performed in this step.

This page does not establish a supported public automation API, current catalog
coverage for every selected component, or API-accounting behavior. Verify insertion
and source versions before implementing either comparison route. Do not automate
private app internals or assume the official FeatureScript MCP can call the inserter.
If an item is missing, use a permitted vendor native model or STEP with explicit
provenance and no invented manufacturing detail. Preserve the same COTS versions
in the eventual API/browser comparison.

## Research Priorities

The selected game remains **2025 REEFSCAPE**, not the current year's game.
Research the following user-nominated teams and their own Chief Delphi posts,
CAD releases and technical binders:

- **1690, 2056, 1778:** intake references nominated by the user.
- **6328:** user reports that its 2025 intake drew from 2056, with a Chief Delphi
  build blog. Verify and attribute that relationship rather than treating it as
  independently established evidence.
- **2910:** utility-arm integration reference nominated by the user.

Prioritize first-hand technical posts by these teams and other clearly identified
high-performing teams. Do not turn arbitrary replies into design facts. Consider
prototype failures and later revisions, not only reveal-day claims. A team's
ranking does not establish why a mechanism worked.

**Skip Blue Alliance/Statbotics ranking discovery for this PoC**, as requested.
Use the named shortlist directly; do not spend time or requests building a ranking.
Additional team know-how will be provided later and is outside this PoC.

For every reference, record team/season/revision, URL/post/page, source type,
observed or reported mechanism behavior, limitations and relevance. Pictures give
hypotheses, not hidden dimensions or proven performance. Use ordinary permitted
public pages and provided files; do not crawl Onshape public CAD through the API.

## Mechanism And Handoff Scope

Design a **standalone mechanism attached to a blank chassis**, not a retrofit
into an undisclosed existing robot. Use rough block/line CAD for the rest of the
robot where needed, clearly named as reference geometry, not manufactured parts.

The mechanism must account for coral handoff, not merely pull coral off the floor.
Define and keep adjustable:

1. Chassis mounting points, datums, available volume and nearby bumper/structure
   boundaries relevant to the selected 2025 rules.
2. Coral entry orientations and the desired exit position, orientation and motion
   into the receiving mechanism; distinguish a known transfer pose from assumptions.
3. Receiving arm/elevator/gripper placeholder and its working/clearance envelope.
4. Stowed, acquisition, transfer and jam-clearing states, swept clearance, stops,
   cable paths and access for removal/maintenance.
5. Interface ownership: which dimensions belong to intake, chassis and receiver,
   so a later change does not silently break the handoff.

Compare mechanism concepts before committing to a pivoting layout. Use 2910 as
integration evidence without building a second complete scoring subsystem. The
earlier 340 mm width, 100 mm gap and two-roller arrangement are test-fixture values,
not validated requirements for this new design.

## Execution Boundary

This profile supports reference research and local planning. No new authenticated
Onshape calls, browser CAD, reference-CAD downloads or manufacturing release are
implied by recording it. The previously proposed **150-attempt shared API pilot
cap remains a proposal**, not a per-agent allowance or a measured cost. The browser
trial's existing admission gate remains unchanged.

Different execution trials will use separate GPT-6 Astra agents as requested;
extra-high reasoning remains unconfigurable in the agent tool. Freeze one shared
engineering/COTS/handoff packet before comparing API and normal-UI assembly routes,
so different designs do not confound the interface comparison.