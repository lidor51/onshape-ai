# 2025 Task-Specific Field Targets

Bounded evidence review, 2026-09-13. Contract: [field-targets.json](field-targets.json). This adds field-interface evidence for task-specific whole-robot scenes; it does not implement or validate those scenes. [../game.json](../game.json), [../GAME-ANALYSIS.md](../GAME-ANALYSIS.md), the existing [rules packet](../../../research/2025-coral/rules.md), viewers and research reports are unchanged.

## Authority And Inspection

- **M:** [Final official English manual](https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf). Cached file SHA-256 `dc6aa9ddbeba25c679c58bae746bde14dba2af79a61a65d8c5f575ca6cdfd523`, 164 pages. Actual raster figures inspected on **23-28, 32, 45-46**, not just extracted text. Piece text on 33-34 also read. ARENA V4 and Game Details V13; printed pages equal PDF pages.
- **D:** [Official field drawing package](https://firstfrc.blob.core.windows.net/frc2025/FieldAssets/2025FieldDrawings.pdf), linked as Drawing Package in FIRST's [2025 archive](https://www.firstinspires.org/resources/library/frc/archived-games). One public PDF download, 11,661,511 bytes / 215 pages; SHA-256 `85659c846ec94909d399ed0b29c9ea0a2fbb57dd8e21f77eaf613fcdd5401015`. Sheet text labels indexed; actual drawings inspected on **91, 125, 143, 157, 162, 163, 164**. Locators below are PDF pages, not drawing sheet numbers. This is not an exhaustive drawing audit.
- Imperial nominal dimensions control; mm values are exact conversions at 25.4 mm/in, not manufacturing precision. No screenshot scaling, pixel measurement, CAD download, authenticated API, secrets, CAD/notebook kernel, commits or delegates.
- The downloaded PDF and working rasters remain in the already ignored `.cache/interaction-field/`. No copyrighted whole-page figures are embedded in the deliverables. No ignore-file change was needed.

| Evidence | Locator and what was visually checked |
| --- | --- |
| Trough and branches | M pp.23-24, Figures 5-5 through 5-8: actual trough surfaces, distinct L1-L4 structures, face arrangement; numbers from accompanying text |
| Barge, cages, net | M pp.25-27, Figures 5-9 through 5-12: suspended mesh, side supports, higher end structures, anchors; lowest mesh is not the entry boundary |
| Processor | M p.28 Figure 5-13 is undimensioned; D p.91 **GE-25100 sheet 2/2**, 2024-10-28, supplies bottom/height/width arrows |
| Station | M p.32 Figure 5-18: side chute and field-facing opening; dimensions from accompanying text |
| Staged pieces | M pp.45-46 Figures 6-2/6-3: algae on upright floor coral, and alternating low/high reef branch pairs; no numerical ball centers |
| Net supports/material | D p.125 **GE-25200 sheet 3/3**, 2024-12-16; p.143 **GE-25215 sheet 1/1**; p.157 **GE-25228 sheet 1/1** |
| Reef/pipe | D p.162 **GE-25300 sheet 2/2**, 2024-12-06; p.163 **GE-25301 rev D sheet 1/1**, last revision 2025-02-18; p.164 **GE-25301-01 rev B sheet 1/1**, 2024-05-03 |

## Confirmed Datums

All heights are above FIELD carpet. These are field/piece datums, not robot hand targets.

| Interface | Confirmed nominal values | Meaning and source |
| --- | --- | --- |
| L1 | Front edge **457.2 mm** (18 in) | Trough, not a branch. Angled/vertical surfaces and top front edge count; M pp.23-24 |
| L2 | Highest point **809.625 mm**; up **35 deg**; inset **41.275 mm** | 31 7/8 and 1 5/8 in; highest physical branch point, not cap-axis center; M p.24 |
| L3 | Highest point **1209.675 mm**; up **35 deg**; inset **41.275 mm** | 47 5/8 and 1 5/8 in; same endpoint caveat; M p.24 |
| L4 | Highest point **1828.8 mm**; vertical; inset **28.575 mm** | 72 and 1 1/8 in; compound support below the vertical scoring segment; M p.24 |
| Reef pipe | OD **42.164 mm**, radius **21.082 mm**; pair centers **330.2 mm** | D p.164 explicitly labels OD 1.66 in, not 1.25 in OD. M/D specify nominal 1.25 in Schedule 40 steel. Radius = OD/2; pair spacing is M p.24's 13 in. L4 OD uses the same specified pipe stock, not a separately measured cap. |
| Station | Bottom **952.5 mm**, opening **1930.4 x 177.8 mm**, top **1130.3 mm**, chute **55 deg** | M p.32: 37.5 in bottom, 76 x 7 in aperture; top derived. Chute descends toward robot; neither bottom nor aperture midpoint prescribes coral axis. |
| Processor | Bottom **177.8 mm**, opening **711.2 x 508 mm**, top **685.8 mm**, geometric center **431.8 mm** | D p.91 explicitly confirms 7 in is **bottom**, 20 in is opening height, 28 in width. Top = 7+20 in; center = 7+10 in. Rounded corners remain relevant. |
| Net mesh | Lowest mesh **1930.4 mm**; material **1219.2 x 3657.6 mm** | M p.27 and D p.157: 76 in low point, 48 x 144 in material. **Neither is a solved entry aperture.** |
| Net structure | Side-rail level **2235.454 mm** (88.01 in); upper side-support level **2258.822 mm** (88.93 in); end-panel top **2565.146 mm** (100.99 in); outer width **1045.464 mm** (41.16 in) | D p.125 distinct dimension endpoints. These document structure, not one flat mesh-rim plane or unobstructed rectangular opening. |
| CORAL | Length **301.625 mm**, OD **114.3 mm**, nominal ID **101.6 mm** | M p.33: 11 7/8, 4.5 and 4 in; not a measured fit specification |
| ALGAE | Diameter **412.75 +/- 6.35 mm** | M p.34: 16.25 +/- 0.25 in gauge size; non-sphericity and compression unresolved |

**Processor resolution:** the manual's prose alone did not name the measured edge, and its illustration has no dimension arrows. GE-25100's front view does: the 7.00-inch arrow runs from the base/floor datum to the straight lower aperture edge. The 20.00-inch arrow spans that edge to the top. Thus bottom 177.8 and top 685.8 mm are now supported, not guessed from image proportions. The 431.8 mm number is only a derived aperture center, not a sensor or mandatory ball-release target.

**Reef source differences:** D p.162 shows assembly references 17.88 / 31.72 / 47.59 / 71.87 in, 12.94 in pair spacing and 1.61 / 1.18 in insets. The final manual gives 18 / 31.875 / 47.625 / 72 in, 13 in spacing and 1.625 / 1.125 in insets. Retain the final manual's nominal values; do not silently replace them with drawing decimals or manufacture a correction offset. D's assembly title block includes +/-0.50 in two-place tolerance; that is not a universal tolerance for every component, manual datum or robot fit.

**Branch length:** D p.164 dimensions a **12.00 in (304.8 mm) maximum component length**, with other endpoints on its coped attachment end. It is not a documented 304.8 mm clear insertion protrusion. D p.163's 11.23 in is a projected assembly reference, not branch-axis length. The 55-degree relation there is to the vertical pipe, consistent with 35 degrees above horizontal. Keep `branchLengthMm: null` for usable tip-to-weld protrusion and use the separate 280 mm sketch hypothesis only when explicitly selected. Caps, welds, bends and seating depth remain unresolved.

## Unknowns And Hypotheses

The contract preserves unknown authoritative values as `null`. It exposes optional numeric `Hypothesis` fields so a parent scene can run **as an assumed illustration**, without pretending those numbers are sourced. Every such field is named in `assumedFields` and has `hypothesisSource: "unknown"`. `verifiedFields` identifies supported quantities within mixed interfaces; `unknownFields` lists unresolved numeric geometry. `status: verified` covers supplied datums only, not an entire interface's detailed shape or interaction feasibility.

| Unknown authoritative quantity | Fixed optional scene hypothesis | Boundary |
| --- | --- | --- |
| L1 trough depth/width/profile | Depth 200 mm, width 900 mm | Independent sketch dimensions, not scaled Figure 5-7 geometry; detailed profile still unknown |
| L2/L3 usable branch length, tip-axis coordinates | Length 280 mm; positive-x tip center `[165.1, -55, 790]` / `[165.1, -55, 1190]` mm | Coarse capped-cylinder pose; mirror x for partner. Do not treat highest-point z as axis-center z. |
| L4 exposed straight length, cap-axis coordinates, compound path | Straight length 180 mm; positive-x tip center `[165.1, -50, 1828.8]` mm | XY and straight length assumed; full bend/weld/cap geometry unresolved |
| Net `rimMm`, clear width/length, perimeter profile | Long-side entry reference **2260 mm**, sketch aperture **1000 x 3500 mm** | Height rounds the dimensioned upper side-support envelope; no verified cord-rim height or all-sides plane. Preserve higher end panels and sagging mesh. **98 in / 2489.2 mm is not accepted as a verified rim.** |
| Low/high reef algae ball centers and normal offsets | Heights **900 / 1300 mm**; normal offset **0 mm** | No numerical center dimension found in the inspected sheets; independent engineering hypotheses, not branch-tip-plus-radius or a solved supported-ball contact |
| Loose horizontal floor coral axis | **57.15 mm** | Ideal OD/2, no carpet sink or deformation |
| Loose floor algae center | **206.375 mm** | Ideal sphere radius, no sink/compression |
| Initial algae-on-upright-coral center | **508 mm** | Coarse top-tangent sum of coral length and ball radius; real sphere seating into the pipe mouth can lower the center. This is not an exact contact solution. |

`centerMm` for algae means center **height**, not an XYZ vector. `tipCenterHypothesisMm` is XYZ in the task-local frame. This frame is defined in JSON: carpet z=0, x lateral, positive y outward toward robot; reef y=0 is its base face. It is not an official full-field coordinate system. No whole-field pose is inferred from screenshots.

## Scene Integration Contract

1. Instantiate the **selected task**, its full-size piece and mechanism pose: L1 trough, L2/L3 inclined insertion, L4 vertical placement, processor transfer, net delivery, station receiving, low/high reef removal, or the appropriate floor case. A generic field object nearby is not an interaction scene.
2. Fix each field interface and each chosen hypothesis across every robot. Select robot heading once for the task, then use **robot XY approach translation only**, with chassis on carpet at z=0. Never raise/lower the field, float the robot, or scale either to make a hand reach. Mechanism articulation is a separate proposed motion, not a field transform.
3. Check missing values explicitly before numeric use. A verified-only consumer must refuse an unresolved required target. An illustrative consumer must deliberately select a named hypothesis and propagate **assumed** status. Do not implicitly convert `null` to 0 or replace net rim with mesh minimum.
4. Place a retained full-size piece using the actual tool-to-piece transform and report target position/orientation mismatch. Branch tip is not coral center; station/processor edge is not a gripper target; algae center is not a roller axis. If it cannot reach or align, display that fact.
5. For branch tasks, show coral bore and capped branch overlap with distinct approach/seated/release hypotheses. Preserve L4's compound support. For net tasks retain side rails, higher end panels and mesh sag; a 2260 mm flat box alone is not the field. No NET contact or ballistic success is certified.
6. Distinguish loose floor pieces from the initial upright-coral stack. Preserve original 2D flow/path diagrams alongside 3D states. One view shows one physical state, not overlapping alternate poses.

This packet does not close the remaining contact, aperture profile, reef-algae seating, swept-clearance, ballistics, reach, strength, stability, game-rule or performance gates. It supplies bounded evidence and explicit assumptions for those checks without silently fitting the field to the robot.

## Validation Scope

The focused check for this packet parses JSON; requires the nine requested interfaces plus three floor cases; validates status/verified/assumed/unknown lists; checks exact imperial conversions, processor/station arithmetic, pipe OD/radius, piece dimensions and floor idealizations; rejects mesh-minimum-as-rim; checks fixed-field/XY-only flags; verifies both cached source hashes and actual figure-image files; and checks local Markdown links. The existing task-capability test is a separate regression check, not evidence that a viewer consumes this new data or that an interaction succeeds.