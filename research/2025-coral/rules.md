# 2025 REEFSCAPE Rules For Local Intake Sizing

Research/retrieval date: 2026-09-12. **VALIDATED_BOUNDED_RULES** means that the
specified source passages were actually read and reconciled for local concept
sizing. It does **not** mean a mechanism passed these rules, a complete manual/Q&A
audit, inspection approval, or a manufacturing release. No CAD or physical test was
performed. [rules.json](rules.json) contains the machine-readable subset.

## Authority And Provenance

Use the official **2025 English PDF**, not 2026 rules. Manual printed page numbers
equal PDF page numbers in this 164-page file. Footers are section-specific:
Introduction V1, ARENA V4, Game Rules V11, ROBOT Construction Rules V11. The PDF
was created 2025-04-08 16:16:42 -04:00 and modified 16:18:04 -04:00;
HTTP Last-Modified was 2025-04-08 21:10:03 GMT. Do not mislabel every section V11.

Manual pp. 10-11 (Introduction, document conventions and section 1.8 Translations
& Other Versions) make imperial measurements and the English PDF authoritative.
Actual rule text prevails over conflicting headlines/blue boxes. Section 1.9 Team
Updates, p. 11, explains amendments; section 1.10 Question and Answer System,
p. 12, explicitly says Q&A **does not supersede manual text**. Inspectors and
referees remain the event authorities. Later retrieval does not make an answer a
new rule. The Q&A export's December creation date is not its answers' effective date.

| Key | Official source | Version/date and private-copy provenance |
| --- | --- | --- |
| M | [2025 manual](https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf) | 164 pages, metadata 2025-04-08; SHA-256 `dc6aa9ddbeba25c679c58bae746bde14dba2af79a61a65d8c5f575ca6cdfd523` |
| U | [Combined Team Updates](https://firstfrc.blob.core.windows.net/frc2025/Manual/TeamUpdates/TeamUpdate-Combined.pdf) | 44 PDF pages, modified 2025-04-08 16:15:32 -04:00; SHA-256 `fc8c6292a5756244d1e896d01fc78bb620db9caa95913d42c02a450e379f10fb` |
| Q | [2025 Q&A export](https://firstfrc.blob.core.windows.net/frc2025/FRC2025REEFSCAPE-QandAExport.pdf) | 74 PDF pages, title FRC Q&A Answers, created/modified 2025-12-16 11:37:29 -05:00; SHA-256 `8f282af8993c2c790f3e695aec365b5edfe5918e1099a9572f149ba9fa58d890` |

The [official archive](https://www.firstinspires.org/resources/library/frc/archived-games)
links all three under **2025 REEFSCAPE**. Its HTTP update link was retrieved via
HTTPS on the same official host/path. U PDF p. 1, Team Update 21, April 8, explicitly
identifies itself as the last season update. The live Q&A homepage was checked and
serves 2026 REBUILT; it was excluded. Five unique public source URLs were inspected.

PDFs are private research copies in [.cache/rules/](.cache/rules/), ignored by its
folder-local ignore file; no mirrored manual or extracted transcript is published.
Extraction used existing **pypdf 6.0.0**, with selectable text, not OCR. Update
extraction does not reliably retain highlighting/strikethrough; final M wording,
not concatenated old/new redline text, controls the limits below. Diagrams were
not measured. Initial console/truncation problems were resolved with bounded
local rereads; no unread/truncated passage is used to establish a numerical cap.

## Robot Envelope

| Rule, exact section, manual page | Short paraphrase and exact conversion | Check for the provisional mechanism |
| --- | --- | --- |
| R101, 8.1 General ROBOT Design, p. 77 | ROBOT PERIMETER is the taut-string outline of fixed, non-articulated structure in the BUMPER ZONE, established in starting configuration, excluding bumpers. Minor fastener-type protrusions no greater than 1/4 in. = 6.35 mm are excluded. | Define this datum explicitly; do not use the bumper outline, an open U-shaped path, or a moving intake as the perimeter. The minor-protrusion provision is not a general mechanism allowance. |
| R102, 8.1, p. 78; G303, 7.3 Pre-MATCH, p. 64 | Starting robot stays inside the perimeter's vertical projection except bumpers/minor protrusions; G303 requires starting configuration and at most one fully/solely supported preload CORAL. | Stow rollers, guards, fasteners, belt runs and receiver; include preload geometry and safe support. |
| R104, 8.1, p. 78 | Starting perimeter <= 120 in. = **3048 mm**; starting height <= 42 in. = **1066.8 mm**. | For a rectangular perimeter only, derived L + W <= 1524 mm. This does not select chassis dimensions. |
| R105, 8.1, pp. 78-79; G415, 7.4.3 ROBOT, p. 68 | Robot extension <= 18 in. = **457.2 mm** beyond vertical projection of ROBOT PERIMETER. Hardware or software constraints must be demonstrable at inspection. | Check every mechanism together through the full sweep, including guards, belts, cables, jam-clear and transfer states. Measurement starts at perimeter, not bumper face. |
| G415, 7.4.3, p. 68; Q174 | **No single-side-only restriction in 2025**; simultaneous sides may extend within their respective limits. | Do not import a later season's single-side interlock. Avoid assuming a rectangular envelope for a nonrectangular perimeter without reviewing the geometry. |
| R104/R105 and G413/G420; Q18 | No rule caps robot height after match start. Starting height, safety, NET contact, ceilings and transport still matter. | Use an explicitly chosen finite receiver/swept-volume placeholder; absence of a numerical rule cap is not unlimited safe clearance. |
| R105; Q144 | Held CORAL does not count toward the robot extension limit. | Keep a separate piece envelope: G413 hazards/outside-FIELD contact and G423 opponent damage still include controlled CORAL. |
| R103, 8.1, p. 78; R408, 8.4 BUMPER Rules, p. 88 | Robot <= 115 lb = 52.16312255 kg under R103 exclusions; with bumpers <= 135 lb = 61.23496995 kg under the same basis. | R103 excludes bumpers, specified battery/connector/cable assembly, and event location tags. No intake mass allocation is established. R408 is not a standalone 20 lb bumper cap. |

G415's damage/no-strategic-benefit exception is an event assessment, not permission
to design an overlength state. Q174 uses informal "less than" wording; the actual
R105/G415 "not more than" limit controls, hence `<=`, with a separate design margin.

## Bumper Integration

All entries are from **8.4 BUMPER Rules** (M V11). Its p. 84 preamble makes the
dimensions nominal and allows **1/4 in. = 6.35 mm inspection tolerance**, unless
otherwise specified: plus for maxima, minus for minima. Design to nominal; reserve
tolerance for manufacturing/stack-up. Do not apply this tolerance to R104/R105 or
CORAL dimensions. It is neither a selected machining tolerance nor a safety margin.

| Rule and manual page | Nominal requirement | Intake consequence |
| --- | --- | --- |
| R401 p. 84; R406 pp. 87-88 | Protect entire perimeter; adjacent-segment gaps < 1.25 in. = 31.75 mm, with filled corners. Corners require uncompressed padding extending >= 2.25 in. = 57.15 mm, without gaps/voids. | No open intake-sized bumper break. Q152 rejects using the segment-gap allowance to excuse a backing notch. |
| R402-A/B pp. 84-85 | Padding depth >= 2.25 in. = 57.15 mm; padding and supporting backer each >= 4.5 in. = 114.3 mm tall. | Reserve the entire cross-section. Approved foam categories and densities are specified, not arbitrary printed plastic or assumed foam properties. |
| R402-C/D p. 85 | Cover exposed outward/upward/downward padding with cloth; use a rigid, robust attachment to the robot perimeter. | Intake mounts must not undermine bumper backing/fastening or inspection/removal access. |
| R403 p. 86 | Bumper extension <= 4 in. = 101.6 mm from perimeter. | Parametrize actual bumper projection separately from the 457.2 mm mechanism limit. |
| R404 p. 86 | Hard parts <= 1.25 in. = 31.75 mm beyond perimeter; padding extends >= 2 in. = 50.8 mm beyond hard parts. | Include brackets/fasteners in hard-part geometry. A soft-looking cover does not make a hard item soft. |
| R405 pp. 86-87; G414, 7.4.3, p. 68 | Padding supported by backing entirely fills the **2.5-5.75 in. = 63.5-146.05 mm** zone above a flat floor. | Evaluate every configuration as virtually placed on a flat floor, unchanged; not only stowed, and not simply actual carpet distance while climbing. |
| R407/R409/R410 p. 88 | Bumpers must not act as wedges or articulate relative to perimeter; must be removable. | Do not turn a bumper into the moving intake ramp. Preserve service access. |

Q197 explains that the inspection checklist's 2.75-5.5 in.
(69.85-139.7 mm) band already applies the tolerance; it does **not** replace the
nominal design zone. This checklist explanation was read in Q197; the checklist
PDF itself was not fetched. Q179/Q211/Q212 reinforce configuration-aware R405.

## CORAL And Control

M **5.7.1 CORAL**, V4 p. 33, officially specifies 4 in. Schedule 40 cellular
(foam) core PVC, AndyMark **am-5601** or equivalent pipe cut to length:

| Quantity | Official nominal/range | Exact unit conversion |
| --- | --- | --- |
| Length | 11 7/8 in. | **301.625 mm** |
| Outside diameter | 4.5 in. | **114.3 mm** |
| Inside diameter | 4 in. | **101.6 mm** |
| Event/KOP mass range | 1.1-1.8 lb | **0.498951607-0.816466266 kg** |

These are official nominal geometry/range, not measurements of an actual piece.
Especially the nominal pipe ID is not a guaranteed bore fit. No dimensional
tolerance, ovality, friction coefficient or acceptable roller compression was
established. Measure real pieces from several sources, including worn/marked pipe;
the manual warns of source/weight variation and rough edges. Do not round the
length to 300 mm or interpret exact conversion as exact manufacturing accuracy.

- **G409, 7.4.2 SCORING ELEMENTS, M pp. 66-67:** at most **one CORAL and one
  ALGAE** controlled simultaneously, directly or transitively. CONTROL includes
  fully supported or stuck in/on/under the robot, and intentional directional
  pushing/herding. Inadvertent bulldozing/deflection is different. Its L1 exception
  is pushing already-scored CORAL while scoring, not a two-piece storage allowance.
- **Concept implication:** an intake buffer and receiver cannot each retain a
  separate CORAL. Interlock acquisition against whole-robot occupancy; transition
  from intake retention to receiver retention without unlocking second-piece
  acquisition. One piece held by both mechanisms remains one piece.
- **G412, 7.4.2, M p. 67:** launch CORAL only with bumpers partly in own REEF
  ZONE. The blue box allows typical short-distance reverse-intake/herding behavior,
  approximately 3 ft.; this is contextual guidance, not an exact 914.4 mm cutoff.
  Q108/Q132 distinguish incidental bulldozing from launching. Test a low-energy
  jam-clear mode; do not infer a universal safe roller speed from this rule.
- **G407, 7.4.2, M p. 66:** no intentional out-of-FIELD CORAL ejection. A jam-clear
  command must consider location and piece trajectory as well as motor reversal.

## Kraken Allowance And Timing

**R501, 8.5 Motors & Actuators, Table 8-1, M pp. 89-91:** the permitted list
expressly includes **Kraken x44 WCP-0941** and **Kraken x60 WCP-0940 / am-5274**,
with no separate count limit for these listed motors. **Team Update 00, January 4,
2025, Section 8 ROBOT Construction Rules, printed p. 2 of 4 / U PDF p. 42**
explicitly records adding x44 to R501 and R505 at kickoff. Thus a late-2025 team
post is not the basis of motor legality, and X44 alone does not force the study
to be labeled a modernized retrospective. Actual product supply dates, each team's
installation date, and compatibility of later vendor revisions remain unverified.

- **R502, 8.5, M pp. 91-92:** maximum **four propulsion motors**. A mechanism
  roller occasionally touching carpet without enough force for significant thrust
  is an example of a non-propulsion motor; a deliberately traction-driving intake
  cannot automatically claim that exemption.
- **R503, 8.5, M p. 92:** motor modifications are restricted to enumerated
  exceptions. The plug-screw exception specifically names Falcon 500 and X60;
  do not extend it to X44 by analogy.
- **R504-A.i, 8.5, M p. 92; R505/Table 8-2, M pp. 93-94:** use the integrated
  Talon FX for the corresponding Kraken; one electrical load per device unless
  otherwise specified. Kraken rows require the integrated controller, not a
  separate arbitrary controller or relay.
- Listing a motor is not a torque, current, thermal or gearbox-sizing result.
  Breakers, wire gauges, power distribution, firmware, total battery draw, motor
  curves, exact gearbox interface and duty cycle still need their own review.

## Safety And Human Checks

| Rules, exact section and manual page | Bounded requirement and verification |
| --- | --- |
| R201/R202/R203, 8.2 ROBOT Safety & Damage Prevention, pp. 79-80 | No carpet-damaging traction features, hazardous edges or unsafe construction. Inspect roller/shaft/plate edges and guards; confirm material/contact behavior experimentally. |
| R204/R205/R206, 8.2, p. 80; G408, 7.4.2, p. 66 | Remove CORAL safely while disabled/powered off; keep lubricants internal; no significant hazard to CORAL. Ordinary wear is not license to gouge or tear pieces. Demonstrate manual release and wear tests with representative pieces. |
| G413/G414, 7.4.3 ROBOT, pp. 67-68 | Avoid unsafe operation, exposed bumper corners and prohibited outside-FIELD contact by robot or controlled CORAL; retain bumper-zone compliance. Review swept envelopes, cables, guards, stopping behavior and field proximity. |
| G416/G417/G420, 7.4.3, p. 69 | No field damage; no grabbing/grasping/attaching/entangling/suspending from field elements except the rule's CAGE exception; no NET contact or contact with opponent-NET ALGAE. Review snag/reaction paths, not only static interference. |
| G422/G423, 7.4.4 Opponent Interaction, p. 70 | Extended non-bumper components must not initiate contact inside an opponent's perimeter projection. No deliberate damage/impairment, or damage from initiating inside-perimeter contact directly or via controlled CORAL. Review exposed deployed hardware and piece envelope; match adjudication is not a CAD test. |
| G424, 7.4.4, p. 71 | No deliberate attachment, tipping or entanglement with an opponent. Accidental normal contact is not categorically the same violation. Inspect hooks, exposed belt/chain runs, snag points and likely failure behavior. |

## Dated Interpretation And Amendment Ledger

Q page references below are **export PDF pages**, not current live `/qa/number`
URLs, which may refer to another season. Dates are the actual recorded answer dates.

| Reference | Exact locator/title | Resolution used here |
| --- | --- | --- |
| Q18, 2025-01-10 | Q pp. 5-6, Maximum height extension limit | No post-start height cap; safety, NET, ceilings and transport remain relevant. |
| Q144, 2025-02-10 | Q pp. 42-43, R105 Coral Inclusion in Robot Extension Limits | CORAL excluded from robot-extension measurement, not from hazard/contact rules. |
| Q174, 2025-02-18 | Q pp. 51-52, Robot Expansion limits in all directions simultaneously. | No single-side restriction; use R105/G415's inclusive maximum rather than treating Q&A as an amendment. |
| Q38/Q39, 2025-01-10/13 | Q p. 11, G409 Excessive Violation / G409-B While Scoring on L1 | Q39 points to TU02; TU03/final manual clarify excessive CORAL violations. Do not retain an obsolete blue-box loophole. |
| Q84, 2025-01-21 | Q p. 24, G409 Enforcement at CORAL STATION | Context-sensitive clearing/bulldozing answer, not a blanket authorization for deliberate multi-piece herding. |
| Q108/Q132, 2025-01-27 / 2025-02-03 | Q pp. 31-32 / 38-39, G412 Launched Clarification / G412 "Bulldozing" versus "kicking across the floor" | Incidental movement versus launching requires context; approximate distance is not a hard numerical test. |
| Q152, 2025-02-10 | Q p. 45, R401 - Bumper notch? | Segment-gap exception does not waive cross-section compliance. |
| Q179, 2025-02-21 | Q p. 53, Bumper zone while extending below bumpers and wheels | Flat-floor/configuration reasoning and inspector judgment, not a general deployment exemption. |
| Q197, 2025-03-04 | Q p. 58, Bumpers interact with bumpers | Checklist band already includes 1/4 in. tolerance; use nominal manual band for design. |
| Q211/Q212, 2025-03-12 / 2025-03-10 | Q pp. 62-63, Determining bumper compliance / G414 during climb | R405 applies beyond starting pose; use unchanged configuration virtually on flat floor. |
| TU00, 2025-01-04 | U pp. 41-42, General Updates / Section 8 ROBOT Construction Rules, printed pp. 1-2 of 4 | FRAME PERIMETER renamed ROBOT PERIMETER; X44 explicitly added at kickoff. |
| TU01, 2025-01-07 | U pp. 36-38, 7.4.3 ROBOT / 8.4 BUMPER Rules, printed pp. 3-5 of 7 | G415 redline includes stale height-example text; final M p. 68 and Q18 do not impose that cap. Bumper figure updates are not measurements extracted here. |
| TU02/TU03, 2025-01-10/14 | U p. 32 / pp. 28-29, 7.4.2 SCORING ELEMENTS / 8.4 BUMPER Rules | L1 control exception and excessive-CORAL guidance reflected in final M pp. 66-67; cloth/wedge wording reflected in final bumpers section. |
| TU05/TU14, 2025-01-21 / 2025-02-21 | U p. 25 / p. 9, 7.4.2 SCORING ELEMENTS | G412 short-distance reverse/herding guidance and bulldozing distinction reflected in final M p. 67. |
| TU06/TU09, 2025-01-24 / 2025-02-04 | U p. 24 / p. 18, 8.4 BUMPER Rules | Hard-part/padding wording and backing-supported zone reflected in final M p. 86. |

No unresolved contradiction changes the numerical constraints above. This is a
targeted relevant-rule search/read, not certification that every unrelated answer,
rule, drawing or inspection item has been audited.

## Actionable Gate

Proceed with **local provisional sizing** against this packet. Keep independent
robot-perimeter, bumper, robot-swept-volume, CORAL and receiver datums. Check stow,
acquisition, hold, transfer, return, jam-clear and interrupted-motion states. Use
one shared whole-robot CORAL occupancy interlock; choose engineering margins
explicitly instead of consuming inspection tolerances.

**Still UNVERIFIED:** actual geometry across every state, physical piece tolerances,
stock/foam properties, grip/compression, chosen motor/gearbox performance and
availability, electrical/pneumatic compliance, safe release, wear/snag tests, field
and receiver clearances, and human inspection/referee judgments. R402 foam material
compliance and R411/R412 alliance/number markings need checking on the selected
bumper implementation. Other manual sections and all diagrams are not fully audited.
Recheck source hashes after any revision; dependent constraints become stale.

Validation checks JSON parsing, exact unit arithmetic, rule/source/page references,
local links and private-source hashes/ignore status. These are document consistency
checks and source spot checks, not invented mechanism tests or a legality verdict.