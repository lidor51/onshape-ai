# 2056 Binder: Actual PDF Inspection

Research date: 2026-09-12. Team 2056, 2025 REEFSCAPE, LIGHTNING.
Inputs: [team profile](../../docs/TEAM-PROFILE.md) and [prior 2056/6328 research](2056-6328.md).
This is reference research, not a final concept selection, manufacturing release, or legality review.

## What Was Actually Read

- **B: technical binder downloaded and inspected**, not just linked. 33 PDF pages. Full selected text read on PDF pages 3, 7, 9, 11, 25; images directly viewed on pages 1, 7, 8, 9, 10, 11, 12, 25. Other pages received only an automated heading/keyword scan, not substantive review.
- **D: drawing package downloaded and selected sheets inspected.** 285 PDF pages. Full-page images viewed on pages 1, 3, 4, 5, 6, 7, 8, 12, 13, 20, 22, 139, 283, 284, 285. Four navigation contact sheets covered 63 unique title-block crops; these are not full-sheet reviews. Most drawing pages remain uninspected.
- Existing Python 3.10 manufacturing virtual environment reused without installation or package changes; parser/renderer: **pypdfium2 4.30.0 / PDFium**. Binder extraction passed; drawing extraction required image inspection. No OCR transcript or full-document text mirror was produced.
- **Five public HTTP attempts:** interrupted binder GET, successful binder GET, drawing HEAD, interrupted drawing GET before response, successful drawing GET. Successful responses were HTTP 200. No further network requests, redirects, browser, login, cookies, credentials, Onshape/API calls, CAD-model downloads, delegates, or commits.
- The drawing HEAD reported 39,858,900 bytes; actual download matched. Both downloads were bounded at 40 MiB (41,943,040 bytes); the drawing also fits a decimal 40 MB ceiling.

## Sources And Versions

**B:** [official technical binder](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Technical-Binder.pdf).
Cover title: **Orchard Park Robotics / 2025 Reefscape Technical Binder**; robot name **LIGHTNING**.
There is no explicit binder revision identifier on the inspected cover. The exact inspected version is the downloaded byte hash, not the URL's month.

**D:** [official drawing package](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf).
PDF metadata title is **Full page photo**; this is not a drawing revision identifier.
Drawing identifiers are printed **OPR25-...**, whereas both download filenames begin **OPR25-2056-...**. Preserve the actual sheet identifiers below.

| Receipt | B: Binder | D: Drawings |
| --- | --- | --- |
| Successful GET started, UTC | 2026-09-12T08:32:01.510434+00:00 | 2026-09-12T08:33:46.073850+00:00 |
| Bytes / PDF pages | 17,356,770 / 33 | 39,858,900 / 285 |
| HTTP Last-Modified | Thu, 29 May 2025 15:17:02 GMT | Mon, 23 Jun 2025 14:27:27 GMT |
| PDF CreationDate, verbatim | `D:20250528142536-04'00'` | `D:20250525180351-04'00'` |
| PDF ModDate, verbatim | `D:20250528142536-04'00'` | `D:20250623102547-04'00'` |
| PDF author | Balraj Singh | Balraj Singh Panesar |
| PDF producer | Microsoft Word for Microsoft 365 | Microsoft: Print To PDF |
| ETag | Not supplied | Not supplied |

B SHA-256: `5f5738b38e819860c048710d2edc4084c9328906ed93e2c8e1ce1a131f50cc1c`

D SHA-256: `30286623b5a496f760dd4a83e0c86a42d889a27fd1ff6831c42aeb104302a81f`

All page references below are **1-based PDF viewer indices**. Inspected binder pages have no visible printed page numbers; use their printed section titles. Drawing `SHEET ... OF ...` labels refer to an individual drawing, not the package's global page number. The live URLs are mutable; anchors alone do not freeze these bytes.

## Five Findings

### 1. Pickup Is Not The Handoff

[B PDF p.7, INTAKE](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Technical-Binder.pdf#page=7) reports a 20-inch-wide acquisition mechanism, a floating top roller, kicker roller, and smooth ramp. A beam break detecting acquired coral triggers intake retraction.

[B PDF p.9, STRAIGHTENATOR](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Technical-Binder.pdf#page=9) separately aligns coral and feeds it **underneath the elevator into a cradle**. [B PDF p.11, CORAL CRADLE](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Technical-Binder.pdf#page=11) provides constraint and repeatable gripper handoff.

Visual check: B p.7 shows transverse pickup rollers; B p.9 and D p.8 show opposing banks of vertical-axis straightening wheels around a central passage. B photos pp.8/10 corroborate the mechanism's placement around the elevator, not dimensions, speeds, or acquisition success. B p.12 was viewed as integration context, not a measured transfer pose.

**Implication:** specify acquisition, alignment, and receiver acceptance independently. A pivoting whole intake and a floating individual roller are different design choices. This static evidence does not prove a receiver-absent buffering duration.

### 2. The Actual Drive Revision Is Base A11 To A11-R1

[D PDF p.7](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf#page=7), **OPR25-A11**, lists one `WCP-0940` Kraken X60 in BOM item 9; its drawing shows a central gearbox driving both side banks. [D PDF p.8](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf#page=8), **OPR25-A11-R1**, lists two `WCP-0941` Kraken X44s in item 8 and shows separate side-mounted drives. This directly supports the coupled versus independent architectural change.

B p.9 explicitly says each side is independently driven at **3:1**, permitting independent slip; motor-current jam detection briefly commands opposite directions. Reduced jamming is the team's claim, not a measured result here. Threshold, filtering, reversal duration/speed, retry count, and recovery interlocks are not printed in this section.

The prior report attributes the parallel-entry jam explanation to [Khalsa, CD post 120, 2025-08-14](https://www.chiefdelphi.com/t/team-2056-op-robotics-2025-technical-binder-release/502550/120). That post was **not fetched again**. The newly inspected drawings now ground the motor change, but not its first competition deployment date.

### 3. Separate The Three Reductions And Contact Constructions

B p.7 states **X60 / 4:1 belt reduction to the coaxial intake-pivot shaft** for roller drive, and **X44 / 51:1** for pivot actuation. A jackshaft, #25 chain, and inline turnbuckle couple/tension the pivot sides. This pivot coupling is not the straightenator coupling removed in finding 2. Do not assume every downstream roller shares the same final motor-to-roller ratio.

B p.7 specifies a **1-1/2 x 1/8-inch polycarbonate round tube**, printed end plugs/stub shafts, and stretched WCP front star wheels. [D PDF p.20, Intake Front Roller, OPR25-A18-R1](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf#page=20) identifies eight `WCP-0406` wheels, printed pulley/spacer parts, and lathe stub shafts. Its assembly notes explicitly call for end-plug adhesive and keeping uncured threadlocker away from Lexan. These are source instructions, not a verified adhesive specification for our parts.

D p.8 specifies AndyMark polyurethane star/compliant wheels and Onyx printed timing pulleys for the straightenator. Its BOM identifies 3-inch blue 50A compliant wheels as well as 2.25-inch contact wheels; do not assign one diameter, hardness, or material to every contact. Vendor listings were not independently verified.

### 4. The Cradle Defines Two Different Detection Events

B p.11 specifies two PA-CF printed halves, glued/aligned with dowels, gripper-clearance cutouts, a position-stop lip, and an anti-bounce step. The **first beam break stops or slows coral; the second initiates the handoff subroutine**.

[D PDF p.22, Coral Cradle, OPR25-A20-R1](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf#page=22) shows the split cradle and sensor mountings. BOM items 1/2 name **Onyx**; items 3/4 each list two left/right photoeye assemblies. Four optical endpoint assemblies do not establish four separate beam-break channels. The binder establishes two beams. Do not silently treat every PA-CF grade as interchangeable with this named material.

[B PDF p.25, SOFTWARE](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Technical-Binder.pdf#page=25) reports timed-base C++ finite-state machines, beam-break automation and stator-current jam monitoring. No numerical handoff timing, sensor debounce, receiver-ready guard, or timeout is provided in the inspected sections. Source-stated conditions are acquisition detected -> retract; jam detected -> brief opposed drives; first cradle beam -> slow/stop; second -> handoff. A complete safe state machine remains our engineering work.

### 5. Router-Friendly Parts Do Not Mean A Bend-Free Mechanism

B p.7 specifies 3/16- and 1/4-inch aluminum pivot plates spaced 1 inch apart, 1/4-inch polycarbonate intake structure, aluminum clamping plates, and dual bearing-retaining plates. B p.9 calls out a hinged front ramp for battery replacement. These establish construction/access ideas, not a demonstrated quick-swap module or measured service time.

D p.8's BOM specifically assigns **Router** to the 0.230-inch Lexan bottom plate and 0.250-inch 6061-T6 top plates, **Lathe** to 7075-T6 rounded-hex shafts, and **3DP/Onyx** to timing pulleys. Those process labels support feasibility discussion, not our machine envelope, tolerances, or material inventory.

[D PDF p.139, Straightenator Mounting Bracket, OPR25-P209](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf#page=139) explicitly specifies **0.063-inch 5052-H32 sheet with 80-degree and 90-degree bends**. A direct copy therefore conflicts with our lack of accurate metal bending. Replace this support concept with located flat plates/machined blocks only after checking stiffness and datums, or explicitly outsource forming; do not hide a bending requirement.

## Drawing Revision Ledger

These are literal title-block readings, not dates inferred from filenames. `Printed on` is not a hardware build or deployment date.

| PDF page | Printed title / identity | Exact drawing number | Printed sheet label | Printed on |
| --- | --- | --- | --- | --- |
| 7 | Title field blank; Straightenator identity from BOM | OPR25-A11 | SHEET 1 OF 2 | 2025-01-24 |
| 8 | Straightenator | OPR25-A11-R1 | SHEET 1 OF 1 | 2025-02-05 |
| 12 | Title field blank; intake identity from BOM | OPR25-A14 | SHEET 1 OF 2 | 2025-01-24 |
| 13 | Intake | OPR25-A14-R2 | SHEET 1 OF 1 | 2025-05-19 |
| 20 | Intake Front Roller | OPR25-A18-R1 | SHEET 1 OF 1 | 2025-05-24 |
| 22 | Coral Cradle | OPR25-A20-R1 | SHEET 1 OF 1 | 2025-05-19 |
| 139 | Straightenator Mounting Bracket | OPR25-P209 | SHEET 1 OF 1 | 2025-01-19 |

D pp.12/13 show different intake roller arrangements: the base illustration has dense blue star rows; the R2 illustration has a black front star row and fewer stars on the uppermost shaft. D p.13 references the front-roller subassembly A18-R1. **An intake R2 is not a straightenator R2.** No straightenator A11-R2 was established in this bounded inspection; this is not a claim that none exists elsewhere.

## Chronology And Conflicts

- **May URL versus August explanation:** the presently downloaded May-path binder already includes the two-X44/3:1 independent-drive text quoted in the previously read August post. Its PDF metadata says May 28 and HTTP Last-Modified says May 29. This does not establish an August revision, nor prove that the May release originally had these bytes. The post could explain an earlier change; the binder could have been updated in place with retained metadata. No archived byte comparison was made. **Cannot date a revision solely from the URL.**
- **Drawing package changed after its URL month:** its PDF ModDate and HTTP Last-Modified both indicate June 23, although its path says May. This shows why the path is not an immutable revision, but does not date individual hardware changes.
- **X44 chronology remains unresolved:** A11-R1 prints February 5 while listing two X44s. Preserve that literal combination; do not claim February X44 competition use or resolve it by inventing a release date. Availability, season legality, template-date retention, and actual deployment require separate evidence.
- **Geometry language needs scope:** the prior author account says the straightening geometry did not materially change. The drawings corroborate changed motors/transmissions, but do not prove all wheel stacks or plates stayed identical. The pickup intake also has its own visible revisions. Do not assemble one supposed robot from arbitrary suffixes.

## Evidence To Engineering Tests

The middle and right columns are **our proposals**, not 2056's reported test results. Compare concepts on a blank chassis with a receiver placeholder; do not select the final layout from this binder alone.

| Factual source | Engineering lesson for our shop | Discriminating test |
| --- | --- | --- |
| B p.7 acquisition; B pp.9/11 alignment and cradle | Keep a simple fixed acquisition fixture as a comparator to a deployable intake; floating contact does not require a whole-mechanism pivot. Define separate intake/chassis/receiver datums. | Matched entry-orientation, offset and approach-speed matrix; compare fixed/floating contact separately from deployment. Record misses, catches, transfer time and mounting loads. |
| D pp.7/8 base shared drive versus independent A11-R1; B p.9 current reversal | Independent straightener drives may relieve conflicting contact velocities but add motor/control complexity. Use matched geometry before concluding that they help. | Couple versus independently command identical wheel banks; include parallel/skewed entries and deliberate jams. Log jam rate, recovery attempts, stator current, peak load and energy. |
| B p.7 separate roller/pivot reductions; D p.20 tube/stub construction | Size our Kraken drive from measured load and surface speed, not copied ratios. Compare AndyMark contact with rubber-covered tube; check printed pulley and adhesive limitations. | Measure pickup torque/current and exit speed across compression settings; run repeated reversals, impact, wear and plug-retention tests. No unverified friction coefficient or motor RPM assumption. |
| B p.11 two beams and physical stops; D p.22 split cradle | Make offer/accept pose, capture retention, receiver-ready and abort ownership explicit. Onyx/PA-CF is not automatic proof of our printer capability. | Absent/late receiver, pose offsets, obstructed beam, overrun and rebound trials. Measure capture repeatability; log sensor transitions; validate timeout, retry limit and safe driver abort before powered integration. |
| D p.8 routed plates; D p.139 formed bracket; B p.9 battery hinge | Prefer located flat metric plates and turned spacers, preserving native vendor fits. Explicitly redesign or outsource folded brackets; retain battery/roller/belt access. | Router fit coupon and bearing-retention test, loaded handoff-deflection test, then timed battery/roller/belt service and reassembly. Repeat pose checks after service. |

Set sample counts, acceptance limits, realistic loads and battery conditions before testing. Fixed pickup versus pivoting pickup remains open; independent alignment versus mechanically coupled alignment is a separate comparison.

## Unknowns Before CAD Selection

- Coral exit pose/tolerance, compression, contact surface speed, acquisition/transfer reliability, current limits, thermal duty, controller gains, debounce and recovery timings are unqualified here. Static images establish neither robustness nor collision-free swept envelopes.
- Bearing/shaft fits, belt tensions, stock grades, actual router envelope/accuracy and the exact Markforged model/material availability need confirmation. Keep printed Onyx part orientation, moisture conditioning and replacement procedure as unverified process details.
- Use metric custom geometry, but preserve COTS standards: 1/2-inch hex is 12.7 mm, not 12 mm. Example source stock conversions are 0.230 inch = 5.842 mm and 1/4 inch = 6.35 mm; do not round these into a new interchangeable part. WCP/AndyMark part numbers above are drawing transcriptions, not current catalog validation.
- No native CAD/STEP, robot measurement, match video, immutable historical binder, or fresh manufacturer/rule check was performed. A drawing note mentioning `.sldprt` or `.step` does not mean those files were obtained. Broader modular removal and long-duration buffering remain unproven.

## Local Evidence And Verification

[Machine-readable receipt](2056-binder.evidence.json) records hashes, metadata, reviewed pages and selected image hashes. PDFs, navigation crops, page renders and scripts stay in the **ignored private local cache**, controlled by [the cache-local ignore rule](../../.cache/2056/.gitignore). No PDF or page-image mirror is published by this report; the relative cache links below work only on this checkout.

| Directly inspected media | Local artifact |
| --- | --- |
| Pickup text/geometry, B p.7 | [Intake page](../../.cache/2056/binder-page-007.png) |
| Straightening text/geometry, B p.9 | [Straightenator page](../../.cache/2056/binder-page-009.png) |
| Cradle text/geometry, B p.11 | [Cradle page](../../.cache/2056/binder-page-011.png) |
| Coupled baseline, D p.7 | [A11 sheet](../../.cache/2056/drawings-page-007.png) |
| Independent drive, D p.8 | [A11-R1 sheet](../../.cache/2056/drawings-page-008.png) |
| Separate intake revision, D p.13 | [A14-R2 sheet](../../.cache/2056/drawings-page-013.png) |
| Front roller retention, D p.20 | [A18-R1 sheet](../../.cache/2056/drawings-page-020.png) |
| Formed bracket limitation, D p.139 | [P209 sheet](../../.cache/2056/drawings-page-139.png) |

Offline verification checks the report's 220-line cap, local links, five-request ledger, source lengths/hashes/page counts/metadata, selected binder text, rendered-image hashes, and Git exclusion of cache artifacts. It does not independently validate engineering performance or the manually read drawing annotations.