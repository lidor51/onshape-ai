# 2025 Coral Intake Reference Index

Research pass: 2026-09-12. Three separate GPT-6 Astra agents researched the
user-selected teams, without inspecting each other's results. This index is the
parent's synthesis after their reports. It is first-party text research and source
discovery, **not measured CAD, a complete binder review, or a selected mechanism**.
No authenticated Onshape requests, CAD downloads or model writes were performed.

Inputs: [team/shop/COTS profile](../../docs/TEAM-PROFILE.md) and
[research evidence requirements](../../docs/RESEARCH-REQUIREMENTS.md).
The Blue Alliance/Statbotics ranking step was explicitly skipped.

## Concept Study Update

The next research-only pass read the relevant official 2025 rules, selected 2056
binder/drawing pages, and manufacturer specifications. It produced a provisional
[concept decision](CONCEPT-DECISION.md), a [functional sketch](concept-A-functional.svg)
and [locally tested sizing screen](SIZING.md). Concept A leads pending packaging,
contact tests and receiver validation. No authenticated Onshape calls, 3D CAD or
physical tests were performed. Earlier link-only statements below are historical
unless specifically updated here.

- [2025 rule audit](rules.md) and [structured constraints](rules.json): relevant
   source passages verified; X44 and X60 are both listed for 2025. Not inspection approval.
- [2056 binder inspection](2056-binder.md): selected pages and drawing revisions
   actually read; identifies a precision-bent bracket incompatible with the shop.
- [COTS candidate screen](cots.md): six sourced candidates, explicit interface,
   timing and performance uncertainties; not a selected complete BOM.
- [Sizing inputs](concept-inputs.json): provisional dimensions/load assumptions,
   not inherited requirements from the original 340/100 mm test fixture.

## First-Hand Starting Points

| Team | Best technical entry point | Evidence useful for our decision |
| --- | --- | --- |
| 1690 Orbit | [Fourteen-iteration account, May 6, post 35](https://www.chiefdelphi.com/t/frc-orbit-1690-2025-robot-cad-release/501057/35) | Author reports separating pickup from orientation; a prototype-masked dead spot appeared on the installed robot after removing a roller |
| 2056 OP Robotics | [Binder/drawing release, May 29](https://www.chiefdelphi.com/t/team-2056-op-robotics-2025-technical-binder-release/502550/1) and [jam/drive explanation, August 14](https://www.chiefdelphi.com/t/team-2056-op-robotics-2025-technical-binder-release/502550/120) | Independently powered straightening sides and current-based jam handling are reported; exact deployment date of the described revision is not established |
| 1778 Chill Out | [Capture/raise/handoff, March 3](https://www.chiefdelphi.com/t/1778-chill-out-reefscape-robot-reveal/493591/14) and [CAD/code release](https://www.chiefdelphi.com/t/1778-2025-cad-code-release/501460/1) | Centering during raising, stationary lower-axle importance, and alignment-sensitive transfer failures; possession detection is not proof of centering |
| 6328 Mechanical Advantage | [In-season intake development, March 28/29](https://www.chiefdelphi.com/t/frc-6328-mechanical-advantage-2025-build-thread/477314/439) and [post-Champs issues, April 25](https://www.chiefdelphi.com/t/frc-6328-mechanical-advantage-2025-build-thread/477314/532) | Explicitly "inspired mostly by 2056"; floating pickup, orientation and waiting for the receiver; later robustness and structural integration problems |
| 2910 Jack in the Bot | [V3 orientation/centering, April 21](https://www.chiefdelphi.com/t/2910-robot-reveal-2025-spectre/494648/122) and [CAD/binder release, April 23](https://www.chiefdelphi.com/t/2910-cad-and-tech-binder-release-2025/500310) | Arm-mounted intake with active orientation; not evidence of a separate floor-intake-to-elevator transfer |

These are author-reported findings, not our replication or comparative success
rates. Full source/date/author/qualification records:

- [2056 and 6328](2056-6328.md)
- [1690 and 1778](1690-1778.md)
- [2910 and receiver integration](2910-handoff.md)

## Sources Not Yet Inspected

- [2056 technical binder](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Technical-Binder.pdf): selected PDF text/images now inspected; [page-level evidence](2056-binder.md). Other sections remain unreviewed.
- [2056 drawing package](https://2056.ca/wp-content/uploads/2025/05/OPR25-2056-Drawing-Package-comp.pdf): selected assembly and fabrication sheets inspected; still not native assembly CAD, and most of 285 pages unreviewed.
- [1690 native CAD](https://cad.onshape.com/documents/76609fe05a6594c5f9c4062a/w/437a97728f1629348e9dd7cf/e/465d3a35c190dab8355f1e5c): release link found; no geometry inspected. The release also links a Parasolid x_t file, not STEP.
- [1778 native CAD](https://cad.onshape.com/documents/07beed2a16f5d7898cc42c9c/w/a74e4d796ba952dabae8ff7e/e/42c6b0e68334934d197bf369): release link found; no geometry inspected.
- 6328 CAD: several competition revisions and an explicitly offseason 25O rebuild are indexed in its report. Do not silently use the October rebuild as March/Champs hardware.
- [2910 binder](https://drive.google.com/file/d/1bjl1LJRS1vXOiLeVq6HdaQw0rmdQOUhk/view?usp=drivesdk): exact release link found, but retrieval required sign-in and stopped. A permitted local PDF would enable deeper review.
- 2910 native CAD and all linked picture/video assets are located in its report; geometry/media were not inspected. No exact dimensions were derived from pictures.

Mutable Onshape workspace links need an explicitly selected version or dated
export before relying on dimensions. No 1690/1778 2025 binder was established in
this bounded search; that does not prove none exists. Later retrospectives and
post edits are dated separately from the season designs they discuss.

## Two Concepts To Compare

### A: Pickup Plus Separate Orientation And Buffer

Acquire coral over the chassis boundary, then orient and retain it at a repeatable
receiver pose. References 1690 and 6328 motivate separation; 2056 motivates comparing
coupled and independent alignment drives. Floating front contact and deployment
of the entire intake are separate decisions, not synonyms.

Potential benefit: pickup can continue to a holding state while a receiver is
unavailable. Potential cost: more contact transitions, packaging and control states.
Neither benefit nor fit has been demonstrated on our mechanism.

### B: Moving Intake Presents Centered Coral

Raise/reposition the intake after capture so the geometry and motion deliver coral
to the transfer pose. 1778 provides a reported example and specific ejection/
alignment failure modes. A moving assembly does not remove the need for a reliable
receiver alignment and retention strategy.

Potential benefit: combine deployment and transfer positioning. Potential cost:
motion-dependent centering, variable contact and tighter coupling to receiver pose.
These are hypotheses to test, not scores or a final recommendation.

2910's arm/wrist approach supplies useful integration and active-orientation lessons,
but making the arm carry the intake changes the system architecture. It is not a
third full mechanism objective or proof of compatibility with concepts A/B.

## Shared Design And Test Inputs

Before detailed CAD, prepare one common engineering packet for both API and browser
execution trials. It must identify:

1. **Entry cases:** coral orientation/offset, approach speed and low-momentum pickup.
   A stationary successful feed does not cover the real chassis approach.
2. **Handoff contract:** output coral pose, receiver-ready/captured signals, allowed
   misalignment, who retains the piece during transfer, timeout and jam-clearing path.
3. **Rough integration CAD:** blank chassis, bumper/structure boundaries and a
   receiver/arm/elevator placeholder with motion and cable keep-outs. Label these
   reference-only, not completed robot subsystems.
4. **Manufacturing:** flat router-cut aluminum/polycarbonate, turned/milled interfaces
   and appropriate prints; no precision bends. Keep metric structure and unrounded
   native COTS fits. Confirm print material and stock properties before load claims.
5. **COTS:** exact FRCDesignLib/vendor part numbers and versions; verify Kraken motor
   interfaces, WCP/REV standards and gearbox choices. No universal assumption that
   MAXPlanetary or a ThriftyBot unit is compatible with the selected motor.
6. **Evidence checks:** low-momentum dead spots, receiver absent/misaligned, coupled
   versus independent rollers, presence versus pose sensing, frame deflection and
   reassembly repeatability. Record physical tests as pending until actually run.

The bounded 2025 manual/update/Q&A audit and preliminary speed/pivot calculations
are now available above. X44 legality is established by the official motor list and
kickoff update, not its mention in an August post. Supply/revision timing remains
distinct. Contact, complete transmission, real moving geometry and manufacturing
tolerances remain unvalidated; proposed test targets are not measured success.

## Next Boundary

The supplied shop/COTS/research direction is enough to develop the concept packet
without another general questionnaire. Use explicit placeholders for unknown budget,
stock, machine travel and receiver dimensions; ask only when a real choice depends
on them. A readable 2910 binder and selected permitted CAD exports would improve
source depth, but the existing public reports already support initial alternatives.

The proposed 150-attempt API pilot and browser-policy resolution are separate
execution decisions. Nothing in this research index starts account access or
changes prior browser restrictions. Initial file/link checks verify report structure,
not the truth or reliability of the referenced mechanisms.