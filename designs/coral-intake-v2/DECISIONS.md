# Intake Design Decisions And Current Revision

Date: 2026-09-18. **Engineering work in progress, not a manufacturing release.**
The user wants effective coral acquisition with simple, reliable, serviceable
construction. A low joint count, green software tests or a convincing rendering
does not establish those outcomes.

## Latest: Compact Single Pivot Preferred

The user prefers a single deployment pivot for simplicity and rejects the current
linkage's large extension. The long-link candidate is parked. The first
[lower-pivot packaging screen](SINGLE-PIVOT.md) reduces pickup sweep height, but
does not yet establish full-system clearance, impact protection or supported CAD.
Frontal and side loads remain requirements; passive folding through the deployment
gearbox is not assumed. The complete pickup/indexer/receiver and all drives remain
part of the design, not optional details.

The sections below retain earlier reasoning. The supplied 1778 GLTF has since
been [inspected locally](../../research/2025-coral/LOCAL-1778-INSPECTION.md);
the older geometry-unavailable statements describe the prior API attempt only.

## 1778 Links And Concept Difference

- [Released native assembly](https://cad.onshape.com/documents/07beed2a16f5d7898cc42c9c/w/a74e4d796ba952dabae8ff7e/e/42c6b0e68334934d197bf369)
- [Published Full Assembly.gltf tab](https://cad.onshape.com/documents/07beed2a16f5d7898cc42c9c/w/a74e4d796ba952dabae8ff7e/e/9f0878ee196d31c4be012b8b)
- [Team release thread](https://www.chiefdelphi.com/t/1778-2025-cad-code-release/501460/1)

The assembly API returned HTTP500 through both pinned-revision and workspace
routes. The GLTF download returned HTTP200, but exceeded the retained150 MiB
ceiling. No complete1778 geometry was saved. An intake-only STEP or an export of
the intake plus its receiver interface would be more useful than a screenshot.
No further authenticated requests were made in this revision.

| Reference | Functional division | Important consequence |
| --- | --- | --- |
|1778, first-party descriptions | Capture in a moving intake; center during raising; powered direct offer/handoff against a lower contact locked relative to the carrier | Fewer separate transport stages are possible, but carrier/receiver alignment and retention during the motion are tightly coupled. Presence sensing is not proof of centered coral. |
|1690, actual selected geometry plus team account | Compliant pickup over the bumper, separate powered plan-view V orientation stage, then vacuum receiver | Acquisition and orientation can be tuned separately. Pickup/indexer transition must retain powered contact; their rear-roller omission produced a reported dead spot. |
|2056, inspected binder/drawings | Floating pickup/kicker/ramp, independent straightenator banks, stopped cradle, gripper handoff | Explicit acquisition/alignment/holding functions and sensor events, at the cost of more interfaces and parts. Their receiver is not1690's vacuum head. |

This is a functional comparison, not a measured1778 CAD reconstruction. It does
not imply identical final coral orientation, linkage, wheel geometry or control
between the teams. The1690 inspection HTML is actual reference mesh/placement
data in our viewer; the CAD below is newly generated custom B-rep geometry.

## The Blocking Tube

The user's observation was correct. In v1, `pickup_crossmember_0` is a20x20 tube
at Y=-310/Z44, ahead of the kicker at Y=-140/Z34. The actual exported tube and a
full301.625 x114.3 OD/101.6 bore pipe at (0,-365,57.15) intersect by
**8270.256 mm3**. The prior floor/crest/seated witnesses skipped that approach
interval. [The regression check](../coral-intake-v1/entry_check.py) reproduces it.

The new structure places its two braces overhead, at Y=-330/Z211 and
Y=-215/Z320. It does not delete bracing to make a collision test pass. The
unpowered-mouth test uses the full finite cylinder at specified yaw/offset
samples; minimum conservative separation is2.8175 mm. This is positive but small
and not a qualified tolerance/dynamic-clearance margin.

[Extended first-contact checks](entry-contact.json) found front-star soft-contact
witnesses at centered horizontal yaw0/30/60/90 degrees without earlier sampled
hard contact. Crosswise first positive4 mm sample is Y=-288.15; circular kicker
first-contact geometry is about Y=-219.34. All unqualified non-elastomer vendor
bodies are retained as hard geometry. This does not prove friction, acceptable
compression, support after initial contact, upright acquisition or complete feeding.

## Why A Single Pivot

The original motivation was fewer joints, less backlash, easier plate alignment,
less moving hardware and a single serviceable pickup module. The rejected v1
implementation failed those goals through an awkward motor/mounting stack and
many added bearing cassettes. It was a hypothesis, not a proven improvement.

A single pivot has a larger circular sweep and couples height to entry angle.
A linkage can provide a better pickup trajectory, compact stow and beneficial
impact response.1690's collapsing/floating linkage is not interchangeable with
our rigid fold.2056 also uses a pivoted intake; its separate roller/pivot
reductions, jackshaft and chain coupling are not the same as1690's linkage.

Revision2 uses integrated bearing seats in matched6 mm cheeks, a pair of floating
front arms around the middle roller, two overhead crossmembers and common shaft
retention hardware. The modeled positioning pivot is Y110/Z330, with140-degree
stow travel. Its pickup-only sampled envelopes improve, but actual chassis
brackets and actuation are still missing. Do not call an assumed bracket box a joint.

## Proposed Fold Drive

The current direction is a **chassis-mounted reduction unit and short guarded
chain to the supported pivot**, instead of packing the motor/reducer between
moving cheek plates. Physical deployed/stowed stops take endpoint loads; service
and stow retention must not rely on leaving a motor stalled. Counterbalance is
an option to calculate, not an assumed spring force.

The reduction unit remains in-house by default. The final ratio, chain width,
sprockets, output support and holding mechanism are not selected. Chain is a
packaging/service candidate, not a claim of self-locking or safe impact collapse.
There is no new complete fold-drive CAD in this pickup-only export.

## Why The Reference-Like Layout

Option1 supplied the separate-pickup/passive-V idea; option9 supplied independently
driven orientation contacts. Replacing the passive V with powered contacts was
justified by the inspected reference and the earlier contact failures. But the
old design went further: it adopted much of1690's roller/station arrangement and
grew into a reference-derived hybrid. It was not a faithful realization of either
original sketch. That drift should have been stated explicitly.

The useful principle retained here is separating acquisition from orientation,
not copying every roller or bracket. Option14 remains the moving-carrier/direct-
handoff alternative. It is not rejected as inherently unreliable; its geometry
and receiver contract are not yet inspected. Final performance must justify
each roller, motor, support and handoff in our own mechanism.

## Ratio Calculations

The old uniform5:1 was a convenient12T/60T packaging choice, **not a completed
speed/force/thermal calculation**. It should not have been treated as selected
deployment gearing. The new reproducible [sizing calculation](drive_sizing.py)
and [results](drive-sizing.json) separate these requirements.

For a roller: `roller_rpm = 60 * surface_speed / (pi * diameter)` and
`motor_torque = tangential_force * radius / (reduction * efficiency)`.
At a provisional3 m/s, a127 mm roller needs451.15 rpm. Assuming40 N combined
tangential load and80% efficiency gives:

| Total reduction | Motor rpm | Required motor torque | No-load surface speed |
| --- | ---: | ---: | ---: |
|5:1|2256|0.635 Nm|10.32 m/s|
|9:1|4060|0.353 Nm|5.73 m/s|
|10:1|4511|0.318 Nm|5.16 m/s|
|12:1|5414|0.265 Nm|4.30 m/s|

Thus9-12:1 is a useful **screening range**, not a validated selection.40 N and
3 m/s are explicit provisional design targets, not measured required loads.
Power, motor-speed headroom, wheel RPM limit, friction, current and duty still
need to agree. An example10:1 implementation is12:60 spur followed by18:36 HTD;
its additional stage and packaging must earn their part count.

For deployment: `output_torque = load_factor * (gravity + inertia * acceleration
+ friction)`, with acceleration derived from an explicit motion profile.
CAD volume/inertia calculations with density ranges estimate5.382-6.118 kg for
the pickup as modeled. This is not a measured weight. An explicit1.5 kg omitted-
hardware allowance at0.30 m is added for the screen. For140 degrees in1.2 s,
70% efficiency and1.5 load factor, the conservative pivot requirement is
43.50 Nm.5:1 would require12.43 Nm from an X44 and is rejected even by the
optimistic endpoint motor model.50:1/64:1 require1.243/0.971 Nm and peak motor
speeds1944/2489 rpm respectively. Their endpoint-derived current proxies are
84/66 A: neither is a recommended controller setting or a continuous rating.

Mass reduction, slower motion and a properly sized counterbalance must be
considered before choosing a ratio. Increased reduction also changes backdrive
and impact response. The model uses one dated CTRE12 V trapezoidal dataset;
it does not mix FOC values or equate supply and stator current.

## Belts, Chain And Gears

- **Spur gears:** compact reduction/reversal with known ratio, but need accurate
  centers, support, axial retention and guards. Not a good way to bridge long or
  moving center distances.
- **Timing belts:** preferred candidates for short constant-center roller spans;
  positive tooth drive, no lubrication and no intentional friction slip. They
  still require correct installation tension, wrap, alignment and load capacity.
- **Chain:** candidate for the slower high-torque final deployment connection;
  length can be serviced without threading a closed belt through the structure.
  Tradeoffs are lubrication, wear, backlash, noise, guards and tension control.
- **Round friction cord:** removed from the preferred direction. The v1 geometry
  did not establish its slip/creep/torque capacity, and its idlers proliferated.

The verified WCP catalog lists18T5 mm HTD/9 mm pulleys WCP-0563 and400/350 mm
belts WCP-0621/WCP-0619. Equal pulley pitch length is `2*C + teeth*pitch`, giving
155/130 mm centers.440/380 mm were only earlier mathematical candidates, not
verified catalog selections. The front arm was shortened from160 to155 mm,
raising its axis8.223 mm. This delayed its first-contact witness; the extended
entry check above makes the effect explicit rather than claiming no tradeoff.
The floating front arm pivots about the middle shaft, preserving center distance.
The two middle pulleys need separate axial planes, real retention and assembly
adjustment; none of those is supplied by merely naming a belt SKU.

[Machine-readable candidates and sources](transmission-candidates.json) retain
the exact products and unqualified items. No belt/pulley tooth CAD is fabricated
or included as an authentic part in the structure-only STEP.

## Current CAD And Evidence

- [New pickup viewer](output/index.html), [pickup STEP](output/assembly.step),
  [structure report](pickup-report.json), [reference resolution](output/final-reference-resolution.json).
-279 pickup instances;8 machined definitions plus9 cut-stock definitions.
  Drives are excluded, so279 versus the old330 pickup occurrences is not a
  like-for-like powered-system reduction. Existing v1 is preserved byte-for-byte.
-17 custom STEP reimports pass.17 structure/catalog/artifact tests and3 sizing
  tests pass, plus a focused hub machining-geometry test. These software results
  do not override open assembly acceptance.
-All84 solid-backed overlapping sample pairs were exactly separated;80 assumed
  bracket-envelope cases remain uncertain. The20-degree fold sampling does not
  certify intervals, rotating star envelopes or future hardware.
-Pickup-only minimum sampled floor is8.5 mm; minimum extension reserve90.03 mm;
  stow front inset71.89 mm; left/right width reserve93 mm. Drives, wires, guards
  and chassis brackets will consume some of these margins.

The kicker hub originally specified hex broaching, an unconfirmed shop process.
It now has actual3 mm router-cutter corner reliefs and clears the12.7 AF shaft.
However, its smallest nominal wall is only0.610 mm: **not acceptable to freeze
without redesign/strength evidence**. The next detail should provide a thicker
torque-transmitting hub/core interface or a verified purchased hub, not claim
that machinability proves strength. Its custom rubber attachment is also unresolved.

Next acceptance work: continuous contact/support over the bumper to the indexer,
actual pivot brackets and stops, stock pulley/shaft packaging, lower mass and a
sized deployment drive, then service/access and tolerance review. Physical
acquisition, impact and endurance tests remain required for a reliable-field claim.