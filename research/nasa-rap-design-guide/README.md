# NASA RAP Robotics Design Guide (v1.01, 2020): Digest For 1577

Processed 2026-09-27. Source: NASA Robotics Alliance Project, *Robotics Design Guide*, version 1.01,
[PDF](https://robotics.nasa.gov/downloads/nasarap-rdc-v101-compressed.pdf), 298 pages. PDF metadata
gives creation 2020-12-08 and modification 2020-12-11. The downloaded file was 14,153,407 bytes with SHA-256
`E2E405AFA178B6E70881F7D1155827028988E147DB48E416E94D108119749321`. It is kept only in the ignored
`.cache/nasa-rdc/` folder and is not committed.

**Status:** this is a digest of general guidance written by community authors. It is not a rules source, a validated
design or evidence of elite performance. The guide covers FIRST, VEX, BEST and Botball. Most worked examples come
from Team 118 robots from 2012 to 2020, so the examples lean heavily toward one team. The guide dates from before
the Kraken motors, before AprilTags (2023), and before COTS swerve became the default. It also assumes a shop with
a waterjet, a CNC mill, a CNC brake and welding. In the tables below, **Keep** marks material that does not depend
on a product and can be used as written. **Update** marks dated products and practices. **Not for 1577** marks
methods that need machines we do not have ([team profile](../../docs/TEAM-PROFILE.md)).

Evidence labels: *guide* = author-reported in the guide. *user* = stated by the user on 2026-09-27. *profile* =
[team profile](../../docs/TEAM-PROFILE.md). *derived* = arithmetic or standard engineering, not a claim made by
the guide. *verify* = my current-state note, not checked in this pass.
Citations use guide section numbers (§). The printed page number is the PDF page number minus 1.

## Contents At A Glance

| § | Topic (printed page) | Use for 1577 |
| --- | --- | --- |
| 1 | Things to consider (8) | Keep: design principles |
| 2 | Manufacturing, tolerancing, fasteners, rivets, welding (10-30) | Router/lathe/fastener parts: keep. Waterjet, laser, CNC brake, welding: not for 1577 |
| 3 | Design styles: box tube, round tube, plate+standoff, sheet metal, slot/tab, 3D print, weight (31-56) | Plate+standoff, slot/tab, box tube+gussets: keep. Sheet metal, bent tube: not for 1577 |
| 4 | Power transmission: motors, gearboxes, bearings, shafts, gears, chain, belts, linear actuators (57-97) | Methods: keep. Motors and gearboxes: update |
| 5 | Mechanisms: drivetrains, elevators, arms, linkages, intakes, shooters, turrets, bumpers (98-169) | Superstructure guidance: keep. Drivetrain: update to swerve. Bumpers: season rules |
| 6 | Electronics, sensors, cameras, CAN/PWM, motor controllers, pneumatics, connectors, cabling (170-186) | Practices: keep. Products: update. Pneumatics: not used |
| 7 | Prototyping (187-198) | Keep |
| 8 | CAD packages, naming, Creo DXF/sheet metal, Progression of CAD (199-215) | Naming and progression: keep. Creo and sheet-metal tutorials: not relevant |
| 9 | Software (216-275) | Outside this repo's mechanical scope; summarised briefly below |
| App. B-E | Materials, hole charts, resources (279-296) | Materials: keep, filtered to our stock and printers |

## Principles That Still Hold (§1.1)

These are the guide's own heuristics (*guide*). Several match our [architecture standard](../../docs/ROBOT-ARCHITECTURE-STANDARD.md).

- **KISS, relative to the team:** choose the mechanism and construction method your team can build fastest and most
  simply, even if it is heavier. This is the same idea as the user's "build with your own means". It does not mean
  choosing low capability (*user*).
- **Low CG:** keep heavy parts (battery, motors) low. Keep lifted end effectors light. This fits the user's
  preference for low, chassis-side motors.
- **Touch it, own it** and **rollers are (almost) always the answer** (§1.1, §5.5). The guide uses the same phrase
  the user uses.
- **Drivetrain is king:** "strive to never compromise the drivetrain" (§5.1).
- **Auton domination:** some teams design the whole robot around the autonomous routine. This matches step 1 of our
  standard (optimal auto for the alliance role).
- **Design for adjustability:** add slots and offsets where accuracy matters (shooters, hoods, handoffs).
- **Take prototype dimensions into CAD** (§8.7): build prototypes that work, measure them, then design the robot
  from those measurements.

## What Changed Since 2020

| Area | Guide (2020) | 1577 now | Label |
| --- | --- | --- | --- |
| Motors (§4.1) | Table from the 2020 manual: CIM, mini-CIM, 775pro, BAG, 775a RedLine, NEO, NEO 550, Falcon 500. Motor choice is driven by stall survival (775pro burns out when stalled; BAG and CIM tolerate stall) | **All deprecated for us.** Use Kraken X60 / X44, chosen by speed, torque, current, duty and packaging. Use the verified data in [cots.md](../2025-coral/cots.md), not this table. Check each season's legal-motor list | user, profile |
| Motor controllers (§6.5) | Talon SRX, Victor SPX, Spark, Spark MAX, Nidec, TalonFX, plus a legacy list | **All deprecated for us.** The Kraken has an integrated controller. FOC needs a Phoenix Pro licence ([cots.md](../2025-coral/cots.md)). Protect stalled rollers with configured current limits and stall detection, not with motor choice | user; verify licence |
| Pneumatics (§6.6 and every mechanism that depends on it) | Two-position intakes and hoods, drive shifters, pincher claws, catapults, punchers, end-of-arm joints, articulating drivetrains, test box. F = P·A at 60 psi working pressure | **Not used.** Replace two-position actuators with a motor-driven single pivot against hard stops. Replace shifters with single-speed swerve. Replace punchers and catapults with flywheels or a motor-wound spring and latch, only if needed. Count every replacement motor in the complexity register | user; translation inferred |
| Drivetrain (§5.1) | Surveys tank, WCD, 2+2/4+2, omni, mecanum, kiwi, X, H, crab, butterfly/grasshopper, octocanum and swag drives. Swerve is "heavy, difficult to program, high part count". The worked example is a WCD | **Always swerve** (holonomic) with COTS modules. Vendor/model to select; WCP preferred. Side intakes are not penalised. The other drivetrain tables are history only | user, profile |
| Swerve software (§9.6.2, §9.8.1) | "By and large the most complex"; resources are for highly experienced teams | Vendor swerve generators, libraries and path tools now exist. Not checked in this pass | verify |
| Vision (§6.3) | Retro-reflective target tracking: Limelight, PixyCam, Gloworm, JeVois; driver cameras | AprilTag pose estimation (since 2023) changes auto and alignment. Tools not selected here | verify |
| Control system (§6.1, §9.2) | roboRIO, PDP, VRM, PCM, the 2020 radio and their configuration tools | Parts and the radio are season-specific. Follow the current manual and control-system docs | verify |
| Gearboxes (§4.1.3) | VersaPlanetary, UltraPlanetary, AndyMark Sport | In-house gearboxes preferred. REV MAXPlanetary or ThriftyBot cycloidal as alternatives; verify the Kraken interface and allowed loads | profile |
| VEXpro items (§2.3, §3.1, §4.5) | VersaFrame (1 in hole pitch, 5/32 in rivets), VersaBlocks, ThunderHex, VersaChassis | Check where each item is sold now. WCP preferred for hex shaft, gears and bearings. Imperial rectangular tube only if needed; otherwise local metric tube | profile; verify source |
| CAD (§8) | SolidWorks/Creo/Inventor/Fusion survey; Creo DXF and sheet-metal tutorials; MKCad library | Onshape with FRCDesignApp/FRCDesignLib. The Creo steps do not apply. Keep the naming and progression ideas | profile |
| 3D printing (§3.6, App. B4) | Markforged Mark Two, Onyx and fibre reinforcement, Ultem on Fortus | Prusa MK4 plus a Markforged (model to confirm). Onyx/fibre only if the Markforged supports it. No Fortus, so no Ultem | profile |
| Bumpers (§5.8) | Strategic shape, height, noodle and fabric choices | Bumper rules change by season. Check every idea against the current manual; many may now be illegal or moot | unknown per season |
| Weight (§3.7, §5.6.1) | Says 125 lb in one place and 120 lb in another | Season-specific; use the current manual | guide inconsistency |

## Manufacturing Filter For Our Shop

The team has a router CNC, a manual lathe, a manual mill, a Prusa MK4 and a Markforged printer, saws, hand tools
and a manual press. We cannot bend accurately; only rough polycarbonate bends are possible (*profile*).

| Guide method | Verdict | 1577 translation |
| --- | --- | --- |
| CNC router (§2.1) | **Keep** | Interior corners must be at least the tool radius: a 1/4 in (6.35 mm) end mill needs at least 1/8 in (3.175 mm), and slightly larger cuts faster and cleaner. Use single-flute end mills at router spindle speeds. Add dog-bone reliefs at 90° slot corners (§3.5) |
| Waterjet / laser tolerances (§2.1-2.2) | Not for 1577, but keep the principle | Every process cuts over or under size. Cut a test coupon on our router. Size bolt holes with a drill, and ream bearing or pin bores |
| Slot + tab (§3.5) | **Keep** | The guide adds 0.005 in (0.127 mm) to slots and/or removes it from tabs for a waterjet; find our router value by test. Captive-nut pockets are nut flat-to-flat + 0.01 in (0.254 mm); measure the nuts. The guide shows a pseudo box frame built only from flat slotted plates |
| Plate + standoff (§3.3) | **Keep** | This fits a router shop best. Spacers with through-bolts preload the joint and beat threaded standoffs (§3.3.1). A tapped hex-shaft end can serve as a custom standoff |
| Box tube + gussets (§3.1.1) | **Keep** | Router-cut gussets riveted or bolted to tube; match-drill. Replace 3D milled blocks (§3.1.3) with turned or printed inserts where loads allow |
| Round tube (§3.2) | Partial | Straight tube only. Use router-cut clamp plates, 3D-printed inserts under low load, riveted tube stiffeners, and rod-end struts from turned plugs tapped with left- and right-hand threads. **No bent tube** |
| Sheet metal (§3.4, §8.5-8.6) | **Not for 1577** | The rules (bend radius ≥ t for 5052, flange ≥ 4t, holes ≥ 2t from a bend, K = 0.44 for 5052) need a brake. Use flat plates, standoffs and tube instead. Rough polycarbonate bends only for guards and funnels with no critical dimension |
| Welding (§2.3.7, §3.1.2, §3.2.2) | **Not for 1577** | No welding in the profile. Use rivets and bolts with gussets. The guide says quality depends on a skilled TIG welder and that thin aluminium warps |
| Lathe (§2.1, §5.1.5) | **Keep** | Turn 1/2 in hex down to round bearing journals, cut retaining-ring grooves, spacers, tube plugs, rollers and turned-down wheels. Keep vendor hex and bearing fits exact |
| Broaching hex (§4.5.2) | Unknown | The guide recommends 1/2 and 3/8 in hex broaches. Press capacity and tooling are unknown. Otherwise use COTS hex-bore parts |
| 3D printing (§3.6) | **Keep** | Use heat-set inserts; do not tap prints. Minimise overhangs. Nylon/Onyx pulleys can have tighter hex bores than aluminium COTS pulleys. PLA fails near hot parts; nylon absorbs moisture (App. B4) |
| Weight reduction (§3.7) | **Keep** | Build less robot first. Thinner stock without pockets usually beats thicker stock with pockets. Use triangular struts and rounded pocket corners (router radius), and do pockets last. Half-depth pockets on drive rails were not worth it (118 saved about 0.5 lb for much more machine time) |

## Fasteners And Retention (§2.3)

- Standardise a few sizes and colour-code the hardware and tools. The guide's fastener sizes are imperial. We design
  metric-first but keep vendor imperial interfaces exact (*profile*). The standard fastener set is still **unknown**.
- Socket-head bolts are the default. Avoid set screws, or use them only to locate axially and never to carry torque.
  Metric countersinks are 90°; imperial countersinks are 82°.
- Tapped holes need at least 4 engaged threads (*guide*). For metric that is 4 × pitch (*derived*): M3 2.0 mm,
  M4 2.8 mm, M5 3.2 mm, M6 4.0 mm. For thin or highly loaded parts, use a nut or a press-in nut instead.
- Loctite: blue 242 for #8 and smaller, red 262 for #10 and larger, 648 as a bearing/shaft retaining compound.
  **Never use Loctite on polycarbonate** (242 and 262 crack it; use 425). **Never combine Loctite with nylon lock
  nuts.**
- Rivets: 1/8 in for low to medium loads, 5/32 in for medium to high, 3/16 in for high loads (drill #30/#20/#11).
  Steel mandrels are stronger but heavier and harder to drill out. Rivets are for occasional repair; bolt any joint
  opened every match. Re-drilling enlarges the hole, so step up one rivet size.
- Rivnuts, heat-set inserts, E-clips, retaining rings, shaft collars, clevis/cotter pins and dowels each have their
  uses. Safety wire, castle nuts and distorted-thread nuts are unnecessary in FRC.

## Power Transmission Rules Of Thumb (§4, Keep)

| Topic | Guidance | Label |
| --- | --- | --- |
| Ratio selection | Treat it as unit conversion: free speed → ratio stages → wheel or roller diameter → mechanism speed. Apply a speed-loss factor because the motor never runs at free speed under load. Two motors give twice the torque and power at the same free speed | guide |
| Planetaries | Use as few stages as possible. Put the high-ratio (weakest) stages nearest the input. Stay roughly within 3:1-100:1; 118's 1000:1 worked only at almost zero load | guide |
| Cycloidal | The guide says cycloidals are "usually not necessary", inefficient without rollers, vibrate from the eccentric, and wear. They **will** back-drive under enough load. Keep this in mind for the ThriftyBot option | guide |
| Harmonic drive | Zero backlash but expensive; not justified in FRC | guide |
| Gears | Meshing gears must share pitch and pressure angle (COTS: 20 DP at 14.5°, 32 DP at 20°). Centre distance $C = (N_1+N_2)/(2P)$, plus about 0.003 in (0.076 mm). Draw pitch circles in the layout sketch. DP gears do not mesh with metric-module gears ($C = m(N_1+N_2)/2$), so keep vendor DP gears exact | guide (formula re-set: text extraction garbled); module formula derived |
| Sector / worm / bevel | Sector gears for arms under 360° (cut COTS gears or generate custom ones). Worm gears resist back-driving. Use vendor drawings for bevel-gear centre distances | guide |
| Chain | #25 is standard, #25H is stronger (check double sprockets), #35 is heavier and forgives misalignment. Use an **even link count**, no half links, and break chain to length instead of using master links. Centre-distance add: about 0.018 in (0.457 mm) for #25 and 0.012 in (0.305 mm) for #35 (Paul Copioli), or find it by test. Custom sprocket thickness: 0.125 in for #25, 0.1875 in for #35 | guide |
| Belts | HTD 5 mm (9 mm wide general, 15 mm for high load) and GT2 3 mm (9 mm, lighter and more efficient). Pitch length = teeth × pitch. Pitch diameter = teeth × pitch / π. Shorten the centre distance by 0.005-0.060 in (0.13-1.52 mm) **only** on fast, low-torque feeders and intakes, **never** on arms, elevators or drives (skip risk) | guide |
| Polycord / flat belting | Polycord: cut about 10% short and heat-weld; one metal pulley as the input, because two plastic pulleys weld to the cord at stall. It slips like a clutch but has high drag. Flat urethane needs crowned pulleys | guide |
| Bearings | Retain every bearing. Radial bearings handle normal drivetrain thrust. X / four-point bearings take moment loads (turrets, swerve). Linear ball bearings need **steel** rails; aluminium rails need plastic or PTFE sliders. One-way bearings make passive PTOs (118 and 971 climbers, 2017). Bushings suit slow, high-load joints | guide |
| Shafts | Live axle vs dead axle (a dead axle doubles as a standoff). Hex is standard. Rounded "ThunderHex" fits round bearings. Keyed shafts are rare except on high-speed shooters. **Hex bearings vibrate at flywheel speeds**, so use round-bore or rounded-hex bearings rated for the speed | guide |
| Lead / ball screws | Lead screws run at about 20% efficiency and ball screws at about 90%. Critical whip speed = $4.76\times10^6\,D/(L^2 C)$ (imperial inputs). Multi-start threads reduce rpm. Screws need their own linear guidance | guide |
| Elevator bearings | Four bearings per tube to constrain each stage | guide |

## Mechanism Guidance (§5, Keep With 1577 Translation)

**Elevators (§5.2).** A single stage "often suffices" and nearly doubles robot height. Multi-stage elevators add
rigging complexity and slop; give the bottom stage more bearing spread. Cascade rigging moves all stages together.
It is simpler to rig and wire, more deterministic, and needs more torque. Continuous rigging moves one stage at a
time. Timing belt is "almost always strong enough". Chain is overkill but forgiving. Dyneema/Spectra is lightest.
Rack and screw drives suit single stages only. Counterbalance with constant-force springs (dangerous if mishandled)
or latex so the elevator can be geared faster. Fit an encoder or string pot plus top and bottom limit sensors.
*1577:* router-cut carriage plates, bearings on shoulder bolts, and motors kept low in the chassis.

**Arms (§5.3).** Keep the end light and put motors at the pivot. Remove backlash with offset split gears, a
tensioned final chain, or epoxied / oversized hex. Mount the absolute sensor at the pivot. Counterbalance
non-over-centre arms with springs behind the pivot. Over-centre arms can use 118's cam-and-standoff pair of springs
(2018). The guide says multi-joint arms often put a pneumatic joint at the end. *1577:* use a motor wrist or a
passive or coupled joint instead, and count it in the [complexity register](../../docs/ROBOT-ARCHITECTURE-STANDARD.md#complexity-register).

**Linkages (§5.4).** Parallel 4-bars and 6-bars are common. The double-reverse 4-bar has a high part count, is
heavy and sways. **Avoid scissor lifts:** they are complex, heavy and sway badly.

**Intakes (§5.5).** Architectures: roller claw (top + bottom rollers), top roller(s), top roller + dustpan, side
rollers, side rollers + dustpan, and pinchers. Pinchers are simpler but rarely "own" the piece. Wheel choice
depends on material *and* shape; durometer alone does not decide it. Prototype many options and design around the
data. Options listed: compliant/Flex, Stealth, Colson (65A), mecanum (centering), HiGrip, neoprene "space wheels",
surgical tubing or high-temperature silicone over tube, and custom molded wheels. **Roller surface speed must be
faster than the drivetrain speed; some teams use 2×.** Otherwise the robot pushes the piece away (§5.5.3). *1577:*
AndyMark compliant wheels or rubber-covered round tube (*profile*). Size the roller from our actual swerve free
speed, $v_{roller} = \pi D n$. Handle stall with current limits.

**Shooters (§5.6).** Shots slow the flywheel, which hurts accuracy in rapid-fire games. Add inertia with a separate
wheel geared faster. 118's 1.5 lb brass-rim wheel acted like a 15 lb wheel at shooter speed and saved 13.5 lb
(2017/2020). The reason is that effective inertia scales with the square of the ratio (*derived*). Use high-speed
round-bore bearings. On single-wheel + hood shooters, compression and hood wrap tune the arc; they are the easiest
to put on a turret. On dual-wheel shooters, link the wheels mechanically. Catapults (pneumatic, slip gear, drop cam,
choo-choo) and punchers suit pieces with inconsistent compression. Slip gears put the whole load on one tooth.

**Turrets (§5.7).** "A huge complexity" and "unnecessary for most games" (*guide*). Test that claim per game in the
concept stage; do not adopt it by default. Bearing options: lazy susan (cheap, weak under moment and impact),
shoulder-bolt roller stacks (common; 6-8 stacks recommended), 3D blocks where every bearing is loaded radially, and
a thin-section **X-bearing (best for moment loads)**. The guide lists ThriftyBot as a cheaper X-bearing vendor.
Drive options: belt (a bolted belt leaves a dead zone under 360°), chain (router-cut sprocket), gear (most compact,
hardest to make).

**Bumpers (§5.8).** Shape (hex/octagonal bumpers escape T-bones), height (lower bumpers win pushing matches),
noodle hollowness, corner treatment and fabric friction all have strategic value. **Legality and freedom vary by
season**, so this is an idea list only.

## Electronics Practices (§6, Keep)

- **Never make a sensor the hard stop.** Mount it adjustably so it trips before the stop, and the stop protects it.
- CAN is daisy-chained with 120 Ω termination at both ends; a single break drops every downstream device. Plan
  connector access.
- Connectors: latching or retained; one family per power class. The 2020 rules allowed only SB50/SB120 for main
  power. Insulate with heat shrink; electrical tape is for emergencies only.
- Cabling: route close to pivots. Use energy chain or passive management on linear stages, and snakeskin sleeve
  against abrasion. Apply the same rules to any hoses.
- Magnetometers and IMUs are disturbed by motor and high-current wiring; keep them away from those runs.

## Prototyping And CAD Workflow (§7-8, Keep)

- Escalate fidelity step by step: wood and hand drills (118 built a 2018 intake by day 3), then correct motors and
  materials (day 10), then mount it on an old drivetrain ("PACBot") to tune integrated geometry and the handoff and
  to train drivers (day 13-21). Tools: a drill-based "power gun" and a small prototype controller with sticks and
  pots.
- "Crayola CAD" (§8.7): a rough, multi-coloured whole-robot layout that uses prototype dimensions. Parts are added,
  moved, reshaped and redesigned, and often remade after assembly. Rendered PDF pages 211, 214 and 216 were viewed.
  The 20 January image already shows coloured bumpers, links, arm and intake bodies around a full-size game piece.
  The 30 January image adds structure and pneumatic tanks. The end-of-season model is fully detailed. This supports
  our Stage 2 cartoon approach, but our [workflow](../../docs/DESIGN-WORKFLOW.md) puts cycle, auto and side
  selection first.
- Naming: `0000_Top_Robot`, `0001_Chassis`, `0002_Intake` and so on; parts inherit the assembly number unless they
  are COTS. Name flat patterns `Thickness_Qty_Part_Material` for cutting. Remove dimensions and bend lines before
  export; the guide warns that a waterjet will cut leftover dimension text into the part.

## Software Notes (§9, Brief)

This is outside the mechanical scope; for reference only. The chapter covers language and style guides, TimedRobot
vs Command-based, and git branching. Tune PID with all gains at 0: raise $K_p$ first, add $K_d$ for overshoot (CTRE
starts at 10 × $K_p$), and add $K_i \approx K_p/100$ only for steady-state error. Motion profiles are for critical
motions. Use presets instead of manual control. Elevators need gravity feed-forward and limits. Shooters need
velocity closed loop with logged shots. Climbers need interlocks. Brownouts, duplicate CAN IDs and competing motor
commands are common faults. Framework, vendor-tool and network specifics are dated (*verify*).

## Materials (Appendix B, Filtered)

- **Aluminium:** 6061-T6 is the default. 7075-T6 is strongest but more brittle. 2024-T3 appears mostly as round
  tube. Avoid 6063-T5 (half the strength of 6061, machines poorly). 5052-H32 is for bending, which we do not do.
- **Steel:** 41xx chromoly is strong for its weight; 1075/1095 spring steel needs heat treatment.
- **Plastics:** polycarbonate is about half the weight of aluminium, impact tolerant, and good for flexing intakes
  and guards; no Loctite. Delrin/acetal is stiff and low-friction for slow bearing surfaces. PTFE has the lowest
  friction. UHMW is toughest and self-lubricating. HDPE is mostly used on field elements.
- **Composites:** carbon fibre is stiff but brittle, expensive and weak at holes, so clamp it rather than bolting
  through it; its dust needs a mask. Fibreglass rods flex without breaking. Baltic birch plywood is good for
  prototypes.
- **Rubbers:** silicone and latex tubing for grip, polyurethane for custom wheels, neoprene for space wheels, gum
  rubber for backboards. COTS wheels usually beat molding your own.
- The alloy-property table and the tap/drill and rivet charts are images and were not transcribed.

## Guide Errors Or Inconsistencies Found

- §6.6.3 pneumatic example: a 1 in bore has 0.785 in² of area, not 1.57 in². The stated 94 lbf at 60 psi
  corresponds to about a 1.41 in bore (*derived*). Moot for us, but do not reuse the example.
- §4.6.1 gear formula: it renders garbled in the extracted text. The correct form $C=(N_1+N_2)/(2P)$ matches the
  guide's own note that 50t+50t equals 60t+40t.
- §3.7 gives a 125 lb weight limit and §5.6.1 gives 120 lb.
- §5.1.3 says differential swerve had not been used in competition as of 2020. That is dated.

## Evidence And Limits

- The full text was extracted with pypdf 6.19.0. Figure content is known only from captions, except the rendered
  pages that were viewed: PDF 110, 141, 145, 150, 211, 214 and 216. Tables inside images (alloy properties,
  tap/drill chart) were not read.
- Five read-only subagents summarised section ranges. The parent checked specific passages against the extracted
  text and corrected two subagent errors: the gear formula and the connector classes. The checked passages were:
  motor table, swerve text, gear formula, chain add, intake speed rule, router corner rule, Loctite, flywheel inertia
  example, pneumatic example, K-factor, elevator bearings, Crayola CAD text, and PID guidance. Other details come
  from the subagents' readings and should be re-checked in the PDF before a design depends on them.
- Replacement suggestions in the "1577 now" column come from the team profile, the user's statement or inference.
  None is a measured or tested result. Items marked *verify* describe the current state and were not checked here.

Reproduce: download the PDF into the ignored cache and check the SHA-256 above. Then extract per-page text with
pypdf (`PdfReader(...).pages[i].extract_text()`) and render figure pages with pypdfium2 at scale 1.0. The helper
scripts and outputs (`rdc_text.txt`, `page_NNN.png`) stay in the ignored `.cache/nasa-rdc/` folder.

```powershell
curl.exe -sSL -o .cache\nasa-rdc\nasarap-rdc-v101-compressed.pdf https://robotics.nasa.gov/downloads/nasarap-rdc-v101-compressed.pdf
(Get-FileHash .cache\nasa-rdc\nasarap-rdc-v101-compressed.pdf -Algorithm SHA256).Hash
```
