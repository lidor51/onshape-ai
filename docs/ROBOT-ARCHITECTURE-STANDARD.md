# Robot Architecture Standard

Reviewed: 2026-09-13. Scope: architecture research and design acceptance, not a validated robot design.
This document preserves the requested method for future work; it does not authorize CAD generation or deployment.

## Evidence And Attribution

- **S1: independently read source.** Andrew Torrance, Chief Delphi, [Progression of CAD, post 2](https://www.chiefdelphi.com/t/progression-of-cad/440533/2), September 6, 2023. The post and all three specified embedded originals were read/viewed for this study.
- **U1: user-provided workflow, attributed by the user to Team 254.** Its original source and wording were not independently found. The supplied context includes 2025; it is not a verbatim quotation from the September 2023 post. The ordered workflow below is a paraphrase of U1, not an attribution of every step to S1.
- **R1: project acceptance rules.** The 2025 checklist, complexity register, and evidence gates below implement the user's requirements. They are not claims that S1 contains those rules or that Team 254 endorses this document.
- No full source quotations or image copies are published here. Image links identify the originals and ignored local inspection files; there are no embedded images.

## What Post 2 Establishes

S1 describes ongoing CAD iteration, with approximate durations and overlapping work rather than a rigid serial schedule:

1. Whiteboard concepts and research comparable mechanisms, approximately one afternoon.
2. Architecture sketches, approximately two days: commonly a side view showing frame, bumpers, intake, superstructure, and scoring positions; endgame concepts may be explored in parallel.
3. A 3D cartoon, approximately two to five days: a multibody master containing drivebase, bumpers, superstructure, intake, and endgame mechanisms.
4. Optionally split bodies into parts and reassemble them to communicate stowing, scoring poses, turret sweep, and potential interference. S1 reports about an hour for this split and emphasizes its value for other team members.
5. Prototype subsystems in parallel, approximately two weeks, especially intakes, shooters, and feeders/serializers; use adjustable contact geometry and test materials.
6. Finish the drivebase first and quickly, under one week while other subsystems are still being conceived. Initial subsystem design then establishes motors, stroke, compression, rollers, powertrains, mounting, and integration, approximately one week.
7. Add detailed hardware, manufacturing information, procurement, and kitting later, approximately two weeks. Continue subsystem iteration through the season; the post lists approximately five weeks for that stage.

These are S1's reported estimates, not promises for this project. Parallel endgame exploration in S1 does not negate U1's requirement to integrate an intrusive endgame before committing a layout.

## Three Images Actually Inspected

The post labels its examples collectively as 2022 and 2023. This study does not infer a precise year or final robot identity for every image.

### I1: Mechanism-Rich Robot Cartoon

[Original PNG](https://www.chiefdelphi.com/uploads/default/original/3X/f/c/fcaf33de648f7229663f0be6e86db53e72e236d2.png) | [Local inspection file](../.cache/architecture-study/fcaf33de648f7229663f0be6e86db53e72e236d2.png) | 654 x 643 pixels.

Observed: an isometric robot with blue perimeter bumpers, visible base wheels, repeated gray disks on transverse roller axes, pale cylindrical cross-members, paired pivoting side plates/links, a tall purple rectangular frame, red uprights with pink hook-shaped features, and translucent green curved upper geometry containing circular forms.
The image communicates roller placement, supporting structure, and the relationship between lower handling mechanisms and the upper superstructure. It is not merely colored subsystem cuboids. The exact green subsystem internals, drive transmission, and contact forces are not established by the screenshot.

### I2: Endgame In Field Context

[Original JPEG](https://www.chiefdelphi.com/uploads/default/original/3X/b/e/be5f905a618db59bf86ea984ac397399015a5b5b.jpeg) | [Local inspection file](../.cache/architecture-study/be5f905a618db59bf86ea984ac397399015a5b5b.jpeg) | 1312 x 1125 pixels.

Observed: a gray truss field structure with multiple horizontal bars, an angled bumper-outline robot frame, a large rectangular robot-core placeholder, long articulated members reaching upward, and smaller hook-like members near another bar.
This is a climbing/endgame pose study with the field surrounding the robot. The central cuboid is a legitimate reserved-space placeholder because the relevant climbing members and field contacts remain visible. One screenshot cannot establish a complete climb sequence, secure engagement, clearance throughout motion, or loaded strength.

### I3: Side-View Architecture Layout

[Original PNG](https://www.chiefdelphi.com/uploads/default/original/3X/5/7/57d7de252b6e21005c4c610710c02648c1d7e1ff.png) | [Local inspection file](../.cache/architecture-study/57d7de252b6e21005c4c610710c02648c1d7e1ff.png) | 919 x 654 pixels.

Observed: a blue bumper/base at right, a tall gray upright, a long multicolored segmented arm extending left, a purple end-effector/game-piece region, an orange cone outline, gray stepped target/reference outlines, and red/gray construction geometry.
This is a side-view layout, not a detailed 3D assembly. It shows the reach relationship between base, arm, game-piece references, and target geometry. Dimensions, motion feasibility, actual telescoping construction, and compliance with rules cannot be measured or certified from it.

Together the images support varying fidelity by the question being answered. Context may remain a black box; the working interface under evaluation must be recognizable.

## Required Workflow: U1 Paraphrase

1. **Define the winning-alliance role and cycles.** State the robot's contribution, partner assumptions, and complete acquisition-to-score cycles. Compare the optimal autonomous routine for that role, not just isolated autonomous actions. Keep desired cycle times separate from measured results.
2. **Choose acquisition and exhaust locations.** Locate entry and exit relative to the robot, including scoring direction, travel direction, alignment, and recovery. Compare ground versus station acquisition and trace retention and every transfer between them and the target.
3. **Arrange full-size game pieces and field targets around a black-box robot.** Use sourced dimensions, orientations, approach space, and target contact locations. Label unknown dimensions; never scale a screenshot into unsupported engineering facts.
4. **Integrate endgame before layout if intrusive.** Reserve the deployment path, engagement geometry, structure, and access when climbing affects the main architecture. Decide this early enough that the scorer cannot consume its required space.
5. **Compare linear and rotary degrees of freedom.** Compare required reach, swept space, contact robustness, electrical and mechanical complexity, and failure/recovery behavior for the same tasks. Include compound alternatives only when their benefit warrants the extra mechanism.
6. **Draw symmetric side/front/top sketches.** Use common datums and consistent scale; show symmetry or explain intentional asymmetry. Include frame, bumpers, game pieces, axes, field targets, stow, and task poses. Do not hide an impossible layout in an attractive isometric view.
7. **Build recognizable 3D cartoon mechanisms.** Create a coherent multibody architecture with drivebase, bumpers, handling mechanisms, superstructure, and endgame. Split it into an assembly when separate poses improve communication. Keep one physical configuration per 3D view.
8. **Add targeted detail only to resolve a decision.** Model tight packaging, contact geometry, or a commitment-critical wheel/turret dimension when it could change the architecture. Do not detail every hole, fastener, or motor before those decisions are settled.
9. **Test the uncertain interface.** Use focused contact/motion checks and adjustable physical prototypes where needed. Check pickup, handoff, retention, scoring, endgame engagement, and jam recovery; record what was actually tested and what remains assumed.
10. **Iterate and then release detail.** Revise architecture when evidence disagrees with it; compare against the same role and complexity criteria. Carry forward unresolved risks explicitly and continue testing throughout the season.

## Cartoon Geometry Contract

- Model the relevant rollers/wheels and shafts as recognizable rotating bodies with axes, separation, and supporting plates. Show guides and the game-piece contact/retention path, not a generic intake box.
- Model rails, carriages, pivots, links, plates, and hooks where the proposed mechanism requires them. A labeled tall cuboid does not establish an elevator; duplicated arms do not establish a linkage or sequence.
- Use simple solids for genuine reserved volumes such as an unspecified robot core or electronics bay. Distinguish those envelopes from proposed working geometry, as I2 does.
- Show one pose at a time in each 3D view. Separate start, acquisition, transfer, scoring, and endgame views; label sweep envelopes or 2D pose overlays as reference geometry, not simultaneous physical members.
- Keep bodies connected to plausible supports. Make motion axes, interface locations, full-size game pieces, and supporting field geometry inspectable without implying that bearings, transmissions, or load paths have been validated.
- Freeze critical dimensions only with a stated reason and source or test. Detail elsewhere remains intentionally light until the architecture decision is made.

## Complexity Register

For each candidate, record counts and definitions for the same mission; use unknown rather than inventing a number. Lower count alone does not prove higher reliability.

| Measure | Record consistently |
| --- | --- |
| Actuators | Inventory motors, cylinders, and servos by purpose; separate quantities from controlled motions. |
| Active DOF | Count independently controlled motions, including driven intake/conveyor axes; identify coupled and passive motion separately. A positioning-only subtotal may exclude continuous roller drives, but must say so and is not the full inventory. |
| Handoffs | Count game-piece transfers between independently retaining/controlling mechanisms for each complete cycle. |
| State changes | Count required mechanism/control transitions per selected cycle and list interlocks, retries, and recovery states. |
| Cabling | Count moving cable/hose interfaces and routed runs; flag loops, bend requirements, snag paths, connectors, and access. |
| Servicing | Count access/removal steps for routine service; record removable modules, tools, jam access, and evidence for any repair-time claim. |

Compare benefits against this register, packaging, robustness, build capability, and maintenance. Do not select the concept with the most features by default.

## 2025 Practical Acceptance Checklist

- [ ] Winning-alliance role, partner assumptions, and complete cycles are explicit; alternatives serve the same declared goals.
- [ ] Coral capability covers all levels through L4, with acquisition, orientation, retention, reach, and release explained. A target-height marker alone is insufficient.
- [ ] Strong autonomous has a concrete routine, including starting arrangement, acquisition, scoring, routes, transitions, and recovery. Distinguish the optimal-auto objective from tested execution; invent no success rate or cycle time.
- [ ] Ground versus station acquisition is an explicit choice supported by the intended cycles and interface studies.
- [ ] Algae pickup/removal requirements are explicit; processor and net are compared and deliberately included or excluded for the alliance role. Neither becomes an automatic extra mechanism.
- [ ] Endgame is integrated before layout commitment where intrusive; deployment, field engagement, interference, and service access are addressed.
- [ ] Side/front/top sketches agree, symmetry is intentional, and field/game-piece dimensions have sources or visible unknowns.
- [ ] Cartoon geometry includes recognizable working rollers, shafts, rails, plates, guides, and hooks as applicable, with one physical pose per 3D view.
- [ ] Complexity counts cover actuators, active DOF, handoffs, state changes, cabling, and servicing. Simpler viable architecture is preferred over maximum features.
- [ ] Reliability has a test plan and recorded evidence for retention, missed pickup, jams, recovery, repeated cycles, and maintenance; it is not inferred from appearance.
- [ ] Only decision-critical packaging and wheel/turret dimensions receive early detail. Every added degree of freedom has a mission benefit and an acknowledged cost.
- [ ] Rules, full travel, contact, stability, loads, and physical performance remain separate gates with explicit pass/fail/unknown status.

## Evidence Gates And Study Result

- **Static-envelope pass:** only the stated bounds and sampled/static poses were checked. It is not a geometry pass, a motion-clearance pass, a contact proof, or manufacturing approval.
- **Geometry pass:** requires an explicitly scoped check of actual modeled bodies, supports, interfaces, and connectivity. Reachability and clearance require appropriate travel/sweep checks; even these do not prove real-world performance.
- **Physical-performance pass:** requires measured testing under stated conditions. Record loads, game-piece variation, failures, and recovery; do not convert a rendering or an unexecuted test plan into a pass.
- **This research: PASS.** Post 2 was read; all three specified originals were downloaded into the ignored cache and inspected with the image viewer. Text and image observations are separated from U1 attribution and R1 requirements.
- **Not assessed:** any robot's geometry, motion, rules compliance, autonomous performance, structural safety, or reliability. No Onshape, authentication, CAD downloads, or CAD kernels were used. No images were placed in published output directories.