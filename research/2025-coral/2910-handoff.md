# 2910 Spectre: Utility Arm And Coral Handoff Reference

Research date: 2026-09-12. Subject: Team 2910's **2025 Spectre only**.
Research input to a standalone intake on a blank chassis, not a robot clone.

## Verified Sources And Access

URLs below were inspected as public pages, or found verbatim in the inspected
team release and explicitly marked as uninspected destinations. Search snippets
are discovery aids, not engineering evidence. No images supplied measurements.

| ID | Exact source | Attribution / revision | Inspection status |
| --- | --- | --- | --- |
| S1 | [2025 CAD and tech binder release](https://www.chiefdelphi.com/t/2910-cad-and-tech-binder-release-2025/500310) | Sudhir, Team 2910; opening post #1, 2025-04-23 | Public page inspected; release links verified |
| S2 | [2025 Spectre reveal](https://www.chiefdelphi.com/t/2910-robot-reveal-2025-spectre/494648) | Sudhir, Team 2910; opening post #1, 2025-03-07 | Public page inspected; embedded video not watched |
| S3 | [Intake and algae improvement plans, #54](https://www.chiefdelphi.com/t/2910-robot-reveal-2025-spectre/494648/54) | PatrickW, displayed affiliation 2910; 2025-03-17 | Public post inspected |
| S4 | [V3 coral orientation and centering, #122](https://www.chiefdelphi.com/t/2910-robot-reveal-2025-spectre/494648/122) | PatrickW, displayed affiliation 2910; 2025-04-21 | Public post inspected; nearby #119 also readable |
| S5 | [Team resources: CAD And Code Releases For 2025](https://frcteam2910.org/resources/) | Official Team 2910 website; publication date not displayed | Public page inspected; independently confirms S1's destinations |
| S6 | [Spectre architecture retrospective](https://www.onshape.com/en/blog/spectre-2025-first-world-championship-robot-built-in-cloud-native-cad) | Byline: FRC Team 2910, Jack in the Bot; published 2026-03-18, describing the 2025 robot | Public page inspected; later retrospective, not a 2025-dated post or evidence about a 2026 robot |
| B1 | [Released technical binder](https://drive.google.com/file/d/1bjl1LJRS1vXOiLeVq6HdaQw0rmdQOUhk/view?usp=drivesdk) | Exact link published in S1 and S5 | **Binder not read**: fetch redirected to Google sign-in; stopped without authentication or alternate download routes |
| C1 | [Released Onshape CAD](https://2910.onshape.com/documents/f33ab032b00dc4b711aa86a6/w/951c0955d38b370eab02b587/e/415a66cb7efdf4aba6199086?configuration=default&renderMode=0&uiState=68091e6c81c18033fbb4fd25) | Exact team-published link in S1, S5 and S6; workspace URL, not an immutable version | **CAD geometry not inspected**; destination not fetched, opened or downloaded; release provenance only |

S6 is explicitly a later account of the same 2025 design. The comparison below
keeps its retrospective claims separate from the contemporaneous March/April
2025 CD revision reports; it introduces no other-season mechanism reference.
Release visibility is not a redistribution license. Binder contents, CAD assembly
revision/configuration and their agreement with the competition robot remain unknown.

## What The Sources Actually Establish

All mechanism statements here are **author-reported**, not independently measured.

1. **The arm positions the intake itself.** S6, "Arm", describes pivot rotation,
   two-stage telescoping extension and a rotational wrist: three degrees of freedom
   moving the game-piece intake to the required positions. This is a main
   manipulating arm, not evidence of an auxiliary feeder handing coral to an
   elevator. "Utility arm" was not verified as the team's subsystem name.
2. **Acquisition includes controlled positioning of the captured coral.** S6,
   "Intake", reports early use of different wheel durometers to shuttle coral to
   the intake center; later versions used time-of-flight position sensing to move
   coral as needed. Its any-orientation wording describes a design requirement,
   not a measured capture envelope or demonstrated success rate.
3. **V3 explicitly changes the orientation capability.** In S4, PatrickW reports
   three complete intake rebuilds. V3 adds horizontal L1 coral handling alongside
   their "standard straight coral", four CANrange sensors total, and separately
   powered left/right vertical wheels to actively orient and center the piece.
   Do not translate "straight" into an exact axis, angle or receiver datum.
4. **Placement requires whole-mechanism setup, not just roller geometry.** Nearby
   post #119, PatrickW, 2025-04-21, readable in the S4 fetch, describes automated
   L1 placement practice and tuning exact setpoints on championship practice
   elements. The videos were not watched; no trajectories or times were measured.
5. **Coral and algae requirements changed during the season.** S3 announces planned
   improvements to coral collection/L1 scoring and algae holding/net scoring.
   Those are improvement plans at that date, not proof of later reliability.
   S4 establishes the later coral V3 changes, not completion of every algae plan.
   These inspected posts do not establish an auxiliary arm's algae pickup path,
   algae-to-coral transfer sequence, or simultaneous possession capability.
6. **Arm motion has chassis and maintenance consequences.** S6, "Drivebase" and
   "Pivot", reports front battery/ballast placement to counter arm motion, a stiff
   dead-axle/A-frame pivot, and a removable arm connection. Its hard-stop-based
   zeroing procedure covers pivot, extension, wrist and climber. These are useful
   integration lessons, not dimensions, ballast requirements or copied hardware.

## Ground Pickup Versus Handoff

**Known:** the reported Spectre architecture moves its intake using the main
arm/extension/wrist; its intake actively positions coral for placement [S4, S6].
The contemporary reveal discussion also contains a ground-intake alignment
question, but a spectator's question is not a team specification.

**Inferred, not verified by motion inspection:** acquisition, retention and
repositioning in the arm-mounted intake are consistent with direct pickup-to-score
handling. This is not a demonstrated two-mechanism coral transfer sequence.

**Unknown:** a separate floor-intake-to-receiver handoff, its release/accept timing,
entry orientation tolerance, receiver pose, retention overlap and numeric clearances.
No inspected first-party passage establishes a separate receiving elevator. Do not
draw one as a fact about Spectre, or assert that Spectre has proven our handoff.
No source here supplies a measured ground reach, swept envelope, bumper clearance
or permissible transfer gap. Photos cannot fill those missing values.

**Engineering takeaway:** borrow controlled coral centering, deliberate orientation
states, coordinated arm/wrist poses and service/zeroing considerations. A new
standalone floor intake feeding a separate arm/elevator adds an interface that this
evidence does not validate. Floor capture alone must not count as handoff success.

## Rough Reference Geometry Only

These are **proposed study artifacts**, not recovered 2910 geometry or CAD created
in this research step. Follow the local [team profile](../../docs/TEAM-PROFILE.md)
and [evidence requirements](../../docs/RESEARCH-REQUIREMENTS.md).

| Placeholder / owner | Keep adjustable | Purpose |
| --- | --- | --- |
| Blank chassis / chassis owner | Mount datums, bumper boundary, ground plane, electronics and battery keep-outs | Locate the standalone mechanism without assuming an existing robot |
| Floor intake / intake owner | Mouth, capture region, output datum, deployment/stow sweep | Model the full capture-to-offer path, not only rollers |
| Receiver / receiver owner | Intake mouth, retention region, approach/withdrawal sweep | A block/line arm or elevator chosen for our concept, not attributed to 2910 |
| Optional arm reference / receiver owner | Pivot axis, extension, wrist pose and moving payload envelope | Explore Spectre-like positional freedom without designing a second complete subsystem |
| Shared transfer interface / jointly owned | Coral center/axis at offer and acceptance, allowed pose error, retained overlap | Make changes to either side visibly invalidate the transfer check |

Keep all rest-of-robot geometry labelled reference-only. Do not copy the old
benchmark intake dimensions, freeze lengths from photos, or choose the entire
Spectre architecture merely because its CAD is available.

## Engineering Questions And Checks

The following are **proposed constraints/tests**, not facts about Team 2910.

- **Orientation contract:** which floor orientations must be accepted, and which
  coral axis/position must the receiver accept? Test skewed, offset and partially
  captured pieces; distinguish our transfer orientation from Spectre's L1 mode.
- **Two alternatives:** compare a fixed pickup/indexer offering to a moving receiver
  against a deployable intake presenting at a transfer pose. Spectre informs
  orientation control, but does not decide which of these handoffs fits our chassis.
- **Control contract:** specify acquire, retain/index, receiver-ready, offer,
  receiver-captured, release, withdraw and reverse/jam-clear states. Decide which
  sensor proves each transition; a presence sensor alone need not prove orientation.
- **Acceptance check:** in a simple physical fixture, demonstrate receiver retention
  before intake release across the agreed pose-error range, then withdrawal without
  recontact. Define trials and a failure threshold before claiming reliable transfer.
- **Reach and clearance:** sweep intake, receiver and held coral through every state
  against chassis, bumpers, stops and cable loops. Include tolerance/deflection and
  removal access; numeric margins and the 2025 rule checks still need sources.
- **Algae boundary:** decide whether algae is excluded, rejected or deliberately
  supported. Do not add a second game-piece function from S3's upgrade plans alone.
- **Manufacturing boundary:** favor router-cut aluminum/polycarbonate, accessible
  fasteners and printable guides; do not introduce precision-bent brackets. Keep
  metric design parameters while preserving selected purchased-part native fits.
- **Selection gate:** obtain a permitted readable binder and an explicitly selected
  CAD revision before adopting 2910-specific geometry. Motor/reduction, contact
  compliance, loads, stock and COTS remain unselected; no manufacturing release.

## Limits And Parent Handoff

Best technical starting point: S4 for a dated, first-party explanation of active
coral orientation and the V3 revision. Best release entry point: S1, corroborated by
S5. S6 adds arm/chassis/service rationale but is a later retrospective. B1 is an
access gap, not a read binder; C1 is a provenance link, not inspected geometry.

Ten source-fetch attempts, plus ten search queries. Two additional inspected
reveal-thread locations (page 3 and post #74) did not supply a verified transfer
specification; third-party speculation and other-season discussion were excluded.
An initial homepage attempt yielded no readable content. Google search returned
a JavaScript challenge; it was not bypassed. No further source requests made.
No ranking research, authenticated API, browser automation, credentials, CAD
downloads, trial reads, root-file changes, delegates or commits were used.