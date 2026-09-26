# 2025 REEFSCAPE: Bounded Whole-Robot Game Analysis

Status: **BOUNDED_SOURCE_ANALYSIS**, 2026-09-13. Decision input for ten coral + algae + endgame crayola concepts, not ten proven robots, a simulation, or inspection approval. Machine-readable companion: [game.json](game.json).

## Evidence And Scope

Started with [the existing rules packet](../../research/2025-coral/rules.md) and [its provenance](../../research/2025-coral/rules.json), then read relevant passages of the cached official PDFs with existing pypdf 6.0.0. All three cached SHA-256 hashes matched. No network, authenticated API, CAD, rankings, or physical tests were used.
Imperial source dimensions control; millimeters below are exact conversions, not claims of manufacturing accuracy. M printed pages equal PDF pages; U/Q locators are PDF pages. No diagram dimensions were estimated.

| ID | Verified source and locator | Scope |
| --- | --- | --- |
| M | [Official final 2025 manual](https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf), pp. 23-34, 41, 45-50, relevant rules pp. 65-88 | ARENA V4, Game Details V13, Game/Construction Rules V11; relevant excerpts only |
| U | [Combined Team Updates](https://firstfrc.blob.core.windows.net/frc2025/Manual/TeamUpdates/TeamUpdate-Combined.pdf), pp. 1, 4, 28 | TU21, Apr 8 (last update); TU18, Mar 18; TU03, Jan 14; resolve event thresholds |
| Q | [2025 Q&A export](https://firstfrc.blob.core.windows.net/frc2025/FRC2025REEFSCAPE-QandAExport.pdf), pp. 5-6, 42-43, 51-52 | Q18, Q144, Q174: post-start height, held CORAL, multi-side extension; interpretation, not superseding rules |

- M SHA-256: `dc6aa9ddbeba25c679c58bae746bde14dba2af79a61a65d8c5f575ca6cdfd523`
- U SHA-256: `fc8c6292a5756244d1e896d01fc78bb620db9caa95913d42c02a450e379f10fb`
- Q SHA-256: `8f282af8993c2c790f3e695aec365b5edfe5918e1099a9572f149ba9fa58d890`

## Points And Attribution

M 6.4, pp. 46-47: AUTO **15 s**, TELEOP **135 s** (150 s active play). The intervening **3 s scoring delay** is not extra autonomous driving time. M 6.5, p. 47 allows element assessment up to 3 s after each period; cage assessment is at rest or 3 s after TELEOP, whichever is first.

| Action | AUTO points | TELEOP points | Attribution / qualification |
| --- | ---: | ---: | --- |
| LEAVE | 3 | Not applicable | Robot bumpers no longer overlap its starting line at end of AUTO |
| CORAL L1 | 3 | 2 | Trough scoring criteria, not a branch |
| CORAL L2 | 4 | 3 | One coral per branch |
| CORAL L3 | 6 | 4 | One coral per branch |
| CORAL L4 | 7 | 5 | One coral per branch |
| ALGAE processor | 6 | 6 | Scoring alliance's processor; ball goes to opposing HUMAN PLAYER |
| ALGAE net | 4 | 4 | Alliance owning the scored net, whether delivered by robot or HUMAN PLAYER |
| PARK | Not applicable | 2 | Bumpers partly in own BARGE ZONE; not qualified for cage points |
| Shallow cage | Not applicable | 6 | Cage qualification required |
| Deep cage | Not applicable | 12 | Cage qualification required |

Source: M 6.1 p. 41, 5.5 p. 28, 6.5.1-6.5.4 pp. 47-50. Processor 6 plus a later successful opponent HP throw is **6 for us, 4 for them**, not 10 for us. Our HP receives balls from the opponent's processor and scores in our net. G404 p. 65 prohibits HP algae entry in AUTO; the AUTO net value is available to robots, not HP throws.
L2-L4 require the branch inside the coral's volume and no contact with own-alliance robot or algae. L1 has separate trough/support criteria. Merely reaching a height or holding coral against a branch does not score (M pp. 47-48).
AUTO coral values replace, rather than add to, TELEOP values for the same scored location. If removed in TELEOP, its AUTO match points are removed but AUTO-RP credit survives; restoring that location restores its AUTO points. L1 uses the aggregate removal/replacement accounting in M p. 48.

## Qualification Bonuses

| RP / bonus | Ordinary regional/district events AND District Championships | FIRST Championship |
| --- | --- | --- |
| AUTO RP: 1 | All non-BYPASSED robots LEAVE and at least one coral scored in AUTO | Same |
| CORAL RP: 1 | At least **5 on each of 4 levels**; with Coopertition, 5 on each of any 3 levels | **7 per level**, same 4-to-3-level reduction |
| BARGE RP: 1 | At least **14 barge points** | At least **16 barge points** |
| Coopertition | At least **2 algae in EACH processor**; 1 Coopertition Point for each team, not an RP | Same |
| Match result | Win 3 RP; tie 1 RP | Same |

There is no separate ALGAE RP. RP/Coopertition are qualification incentives, not extra match points. Do not assign RP a fixed match-point value or require one robot to supply an entire alliance threshold.
**Version trap:** final M Table 6-2 p. 50 displays 7/16. TU21 (U p. 1) changes 5 to 7 and 14 to 16 specifically for FIRST Championship. TU18 (U p. 4) explicitly says District Championship thresholds do not increase; TU03 (U p. 28) confirms the earlier 5-per-level coral rule. Do not apply final-table 7/16 retroactively to ordinary events.
Two shallow climbs plus a park = 14: ordinary BARGE RP, not Championship RP. One deep plus two parks = 16: either profile, if all qualify. These are arithmetic combinations, not predicted alliance outcomes.

## Geometric References, Not Tool Targets

All heights below reference FIELD carpet unless stated otherwise. No row certifies insertion clearance, ball-release position, mechanism reach, or manipulator-center trajectory.

| Item | Source imperial value | Exact mm / datum | Source |
| --- | --- | --- | --- |
| CORAL | Length 11 7/8 in; OD 4.5 in; nominal ID 4 in | 301.625; 114.3; 101.6; foam-core Schedule 40 PVC, not a guaranteed bore fit | M 5.7.1 p. 33 |
| ALGAE | Diameter 16.25 +/- 0.25 in | 412.75 +/- 6.35; range 406.4-419.1; not necessarily spherical | M 5.7.2 p. 34 |
| L1 | 18 in | **457.2**, top/front edge of trough; no L1 branch exists | M 5.3 p. 23 |
| L2 | 31 7/8 in | **809.625**, highest point of branch; branch angled up 35 degrees | M 5.3 p. 24 |
| L3 | 47 5/8 in | **1209.675**, highest point of branch; branch angled up 35 degrees | M 5.3 p. 24 |
| L4 | 72 in | **1828.8**, highest point of vertical branch | M 5.3 p. 24 |
| Reef offsets | L2/L3 inset 1 5/8 in; L4 inset 1 1/8 in; pipe pair spacing 13 in | 41.275 / 28.575 from reef base; 330.2 pipe center spacing, not tool clearance | M 5.3 p. 24 |
| Low / high reef algae centers | Not numerically established | **null / null**; staging on branch pairs does not establish ball-center z | M 6.3.4.2 pp. 45-46, Fig. 6-3 |
| CORAL STATION | Opening 76 x 7 in; bottom 37.5 in high; chute 55 degrees | 1930.4 x 177.8; **952.5 bottom edge**, not coral-axis height | M 5.6.2 p. 32 |
| PROCESSOR | Opening 28 x 20 in; opening 7 in from carpet | 711.2 x 508; **177.8 opening clearance**; prose does not name the measured edge, so bottom/center targets remain null | M 5.5 p. 28 |
| NET | Mesh 48 x 144 in; lowest point 76 in high | 1219.2 x 3657.6; **1930.4 lowest hanging mesh**, NOT rim/opening height; rim remains null | M 5.4.2 p. 27 |
| Deep cage | Bottom 3 1/8 in high | **79.375 cage bottom**, not hook contact point or robot clearance | M 5.4.1 p. 26 |
| Shallow cage | Bottom 30 1/8 in high | **765.175 cage bottom**, not hook target | M 5.4.1 p. 26 |
| Cage body | Height 24 in; outside width 7 3/8 in | 609.6 x 187.325; hook engagement/ANCHOR geometry unresolved | M 5.4.1 p. 26 |

Floor geometry: a nominal horizontal coral on an ideal flat plane has axis height **57.15 mm**, with a 301.625 x 114.3 mm projected envelope. A nominal spherical algae has center height **206.375 mm** (203.2-209.55 mm from its diameter range). These are derived idealizations, not carpet/compression measurements or roller-axis prescriptions.
The initial loose-piece layout is not equivalent to independent floor balls: six algae start on top of the six coral at CORAL MARKS; six more algae sit on each reef's branch pairs (M 6.3.4 pp. 45-46). Floor routes need separate stacked-piece and loose-piece acquisition cases, each honoring G409.
Reef algae is both a physical access obstruction and a scoring-contact obstruction on affected branches. Clearing it can unlock partner coral cycles; no points are awarded merely for removal. M p. 45 explicitly says staged algae will not contact coral placed on L4. Do not declare all coral levels blocked, or equate low/high algae centers with L2/L3 branch-tip heights.
Choose cage height with FIELD STAFF during reset; each team controls its corresponding cage choice, not its height during the match (M 6.3.5 p. 46).

## Whole-Robot Constraints And Guards

| Requirement | Verified bound / implication | Source |
| --- | --- | --- |
| Starting size | Perimeter <=120 in = **3048 mm**; height <=42 in = **1066.8 mm**; robot hardware inside perimeter projection except stated exceptions | R101-R104, M pp. 77-78 |
| Deployed extension | <=18 in = **457.2 mm** beyond fixed robot perimeter, NOT bumper face; all simultaneous mechanisms/states count | R105, M p. 78; Q174 |
| Height / held coral | No post-start robot-height cap; multi-side extension allowed. Held CORAL excluded from R105 measurement, not safety/contact review | Q18/Q144/Q174; R105's inclusive maximum controls |
| Mass | <=115 lb = **52.16312255 kg**; with bumpers <=135 lb = **61.23496995 kg** | R103 p. 78 / R408 p. 88; R103 excludes bumpers, specified battery/connection assembly, event location tags; not an independent 20 lb bumper cap |
| Bumpers intact | Entire perimeter protected; only adjacent-segment gaps <1.25 in =31.75 mm with filled corners. Padding/backing fills nominal **63.5-146.05 mm** floor zone | R401 p. 84; R405 pp. 86-87; no intake-sized bumper cutout |
| Occupancy | At most **one coral AND one algae** under whole-robot direct/transitive CONTROL; supported, stuck and deliberately herded pieces count | G409 pp. 66-67; L1 already-scored-coral pushing exception is not extra storage |
| Release | Coral launch requires bumpers partly in own REEF ZONE. No intentional out-of-field ejection of either piece, except algae through PROCESSOR | G412 p. 67; G407 p. 66; apply also to jam-clear modes |
| Protected space | No direct/piece-mediated opponent contact in opponent's REEF/BARGE ZONE; additional cage-contact protection in final **20 s**, regardless of initiator | G427/G428 p. 72; G403 p. 65 also restricts AUTO contact after crossing BARGE ZONE |
| Field/climb | No NET contact or contact with algae scored in opponent NET; no prohibited field attachment outside cage exception; no opponent cage contact; ANCHORS off limits | G405 p. 65; G417-G420 p. 69 |

Cage points require contact with exactly one own-alliance cage, no ANCHOR/carpet contact, and only the additional contacts enumerated in M 6.5.2 p. 49. A hook touching a cage, a selected deep setting, or a pose above a height line is not a scored climb. Parking and cage points are alternatives, not additive.
Use independent coral/algae occupancy states, shared-tool ownership, positive transfer confirmation, release-location guards, full swept-envelope limits, and a climb/stow interlock. Allow acquisition of one type while holding the other only if mechanically supported. Unknown location or occupancy should inhibit acquisition/launch, with a controlled safe-recovery procedure.
G421 p. 70 permits at most one robot beyond the BARGE ZONES on the opponent's side; G422-G424 pp. 70-71 restrict extended contact, damage and entanglement. No special CORAL STATION or PROCESSOR robot-contact protection is established by the cited G427 zone rule. HP delivery is through the station for coral and from the HP's PROCESSOR AREA for algae (G433 p. 73).
Shop constraint, not a game rule: router-cut aluminum/polycarbonate flat plates, spacers, tubes, manual machining and printed guides; **no accurately bent metal**. A frame recess behind an intact compliant bumper differs from an illegal bumper gap. Reserve electrical/battery service space and bumper removal access in every concept.

## Architecture Recommendations

These are conditional candidates for the ten-concept set, not a performance ranking. Every concept needs a complete coral path, algae path and explicit deep/shallow/park plan; intentional L4, net, deep or simultaneous-carry omission is acceptable and must be stated.

| Family | Why retain it | Cost / first discriminating check |
| --- | --- | --- |
| Elevator + separate algae mechanism | Strong all-round candidate when repeatable L2-L4 placement and independent algae clearing justify two mechanisms; processor baseline, net/deep optional | Check stow and shared reef approach, intact-bumper floor transfer, electrical space and cage load path before choosing reach or motors |
| Shared articulated arm or elevator/wrist with dual-purpose tool | Candidate when avoiding handoffs and reducing duplicate mechanisms outweighs serialized tasks; coral + processor first, optional L4/net | Demonstrate retention/release for both shapes and ownership transition; one shared tool need not physically carry both pieces together |
| Lower-reach coral specialist + independent algae roller + climb | Candidate when L1-L3 throughput and alliance complementarity beat the cost of L4/net; processor scoring and an explicit climb choice remain | Verify low/high algae capability separately; choose deep only if integration/time budget supports it, otherwise shallow/park; do not assume simpler means reliable |

Existing reports supply principles only: [1690/1778](../../research/2025-coral/1690-1778.md) for over-bumper transfer and centering during raise; [2056/6328](../../research/2025-coral/2056-6328.md) for independent-side orientation and explicitly attributed inspiration; [2056 binder](../../research/2025-coral/2056-binder.md) for separating pickup, alignment and cradle; [2910](../../research/2025-coral/2910-handoff.md) for an arm carrying its intake. None supplies a measured replica, our tool targets, or our expected success rates. Replace bend-dependent details with original flat-plate construction.
Across ten drawings, vary functional ownership, acquisition source, orientation/handoff method, scoring omissions and climb packaging. Cosmetic rearrangements of one machine do not test these choices. Do not turn null field references into invented numeric tool poses; label proposed poses separately as design hypotheses.

## Conditional Value Checks

Variables below are unmeasured; seconds, success probabilities and rates in examples are stipulated counterfactuals, not robot-performance estimates. No full-match score is predicted. RP, penalties, travel, partner access and remaining pieces must be evaluated separately.

- **AUTO:** one qualifying retained L4 coral plus LEAVE is 7+3=10 points, not 7+5+3. AUTO premiums over TELEOP are +1/+1/+2/+2 for L1/L2/L3/L4. AUTO-RP value is alliance-conditional; coordinate LEAVE and at least one coral before adding complexity.
- **L4 versus L3:** expected TELEOP points per second favor L4 only when $5p_4/t_4 > 4p_3/t_3$. At equal success probability, L4 may take less than 1.25 times the L3 cycle. Hypothetical 10 s L3 versus 12.5 s L4 is the equality boundary, not a measured cycle time.
- **Processor versus net:** for the same acquired ball and equal time, let $p_P$ be processor success, $p_N$ own-net success, and $h$ the conditional probability that a delivered processor ball later scores in the opponent net. Immediate expected score-margin contributions are $p_P(6-4h)$ and $4p_N$. With both robot successes stipulated as 1, they tie at $h=0.5$; processor still gives 6 own points, net 4. Different travel/release times require comparing rates. Clearing benefit, Coopertition and other HP recirculation effects are excluded from this small comparison.
- **Climb versus cycles:** compare $pC+(1-p)f$ with $2+rt$, where $C=12$ deep or $6$ shallow, $f$ is the actual failure outcome, $t$ incremental time versus parking, and $r$ forgone expected scoring rate. Hypothetically $t=12$ s and $r=0.4$ points/s, with failure still parking ($f=2$), require deep $p>0.48$; shallow would require $p>1.2$ and cannot win on match points alone. Failure-to-park ($f=0$), different time costs and decisive BARGE-RP contribution change the threshold. No climb reliability is assigned.
- **Algae clearing:** remove algae when expected additional own/partner coral value plus algae-destination value exceeds the forgone alternative and risk. L4 can remain available without that removal; never award an invented fixed clearance bonus or count a partner cycle twice.

## Evidence Gaps And Handoff

Numerical low/high reef-algae centers, net rim/opening height, processor edge-specific height, hook contact/ANCHOR clearances, all tool-center targets, field/piece tolerances beyond the stated algae range, carpet compression, cycle times, probabilities, loads, reach and stability are **unverified**. JSON uses null with reasons where these quantities matter; branch-tip or lowest-net values must not substitute for them.
Next concept-stage gate: select the capability mix and show stow, acquisition, retention, transfer, score, safe release and climb transition as hypotheses against the verified references. Resolve missing geometry from authoritative drawings or measurements only in a separately authorized follow-up; do not stall this bounded analysis for CAD or new research.
Outputs are only this document and [game.json](game.json). Validation is JSON parsing, required keys, exact unit arithmetic, scoring examples, source hashes and local links; it is not a CAD, simulation, field, or rules-compliance test.