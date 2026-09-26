# Concept A: Critical Mechanical Design Review

2026-09-12. **NOT READY FOR MECHANICAL FREEZE OR FABRICATION.** Review only; no
model, frozen packet, source binding, or acceptance budget changed. Local files
and images only; no network, API, browser, credentials, environment changes,
installation, delegates, or commits. No physical test was performed.

## Decision

The concern that this looks mechanically shallow is substantially justified,
but resemblance to a reference robot is not the acceptance criterion. The main
defect is an unresolved contact and load-path design: an open inclined belt,
uncontrolled transition, single-station orienter, and unretained presentation
trough have been detailed before demonstrating how they acquire and hand off coral.
This is useful packaging/software work, not yet a credible buildable intake.

**Highest-priority next engineering action:** resolve an adjustable, supported
floor-to-receiver contact path within Concept A. Draw side/plan sections with coral
poses, surface velocities, opposing reactions, compliance travel and receiver
acceptance volume; then test a guarded, low-energy fixture. No new full model or
dimension freeze is authorized by this audit.

Working hypothesis: removing approach momentum will expose capture loss, roll-back,
or a dead spot before the cradle. This is a risk, not an observed failure. Challenge
it with slow/stop/restart trials, skewed coral and an absent receiver, without assistance.

## Evidence Inspected

- Actual image viewed: [packet-v2/revision/deployed.png](packet-v2/revision/deployed.png).
  It is the 520 mm mouth revision, not a v3 render. The gold parts are explicitly
  envelopes. Associated geometry: [packet-v2/revision/deployed.step](packet-v2/revision/deployed.step).
- [packet-v2/REPORT.md](packet-v2/REPORT.md) and [packet-v3/REPORT.md](packet-v3/REPORT.md):
  v2 has sampled static geometry PASS but blocked admission/build; current v3 is
  blocked/unfrozen, with no completed current full sweep or assembly export.
- Geometry/roles: [parameters.json](parameters.json), [model.py](model.py),
  [v2_model.py](v2_model.py), [packet-v2/assembly-contract.json](packet-v2/assembly-contract.json),
  [packet-v2/source/geometry-payload.json](packet-v2/source/geometry-payload.json),
  [v3_model.py](v3_model.py), and [packet-v3/current/assembly-contract.json](packet-v3/current/assembly-contract.json).
  V3 inherits the pickup/ramp/cradle layout; its current contract supersedes older v3 artifacts.
- Directly viewed 2056 binder images: [page 7](../../../.cache/2056/binder-page-007.png),
  [page 9](../../../.cache/2056/binder-page-009.png), [page 11](../../../.cache/2056/binder-page-011.png).
  These cached images are checkout-local evidence, not a new public image mirror.
- Research: [2056-binder.md](../../../research/2025-coral/2056-binder.md),
  [1690-1778.md](../../../research/2025-coral/1690-1778.md),
  [2056-6328.md](../../../research/2025-coral/2056-6328.md),
  [CONCEPT-DECISION.md](../../../research/2025-coral/CONCEPT-DECISION.md),
  [TEAM-PROFILE.md](../../../docs/TEAM-PROFILE.md). Team posts remain author reports;
  1690/1778 linked CAD/videos were not inspected here. The later binder inspection
  supersedes the earlier 2056 report's unread-PDF status, not its source chronology.

## What The Geometry Says

**Pickup contact, not just appearance.** At deployment the drum centers are
Y/Z=(100,410) and (-260,40) mm. Equal 27 mm drums plus a 3 mm belt give a 516.24 mm
straight tangent span at 45.78 degrees. The revision belt is 460 mm wide inside
the 520 mm mouth. These are current model facts, not recommended dimensions.
There is no opposing pickup roller, adjustable nip, or local floating-contact
joint; folding the entire pickup through -145..0 degrees is not that compliance.

The belt does not provide "upward normal force only": its normal is perpendicular
to the incline, and tangential friction can pull uphill. But no selected contact
material, compression, friction data, or preload establishes sufficient traction.
For an ideal nonrolling body supported only by gravity on the straight span:

$$N=mg\cos\theta,\qquad \mu N\ge mg\sin\theta+ma,\qquad \mu\ge\tan(45.78^\circ)=1.028\quad(a=0).$$

This is only a necessary sliding-traction screen under those assumptions, not a
measured coefficient or proof of failure/success. Round coral also rolls/spins;
one moving surface does not uniquely impose its translation. Additional contact
changes the force balance and must be designed, not assumed from belt motion.
The wrap, entry, and acceleration require different balances. The wide belt also
lacks a selected construction, tracking/tension adjustment, and defined loaded-span
support. A rigid clearance envelope does not predict sag or drum-to-belt traction.

**The 10 mm floor gap is not a coral passage.** The lower belt envelope bottoms
at Z=10 mm; nominal coral OD is 114.3 mm. Comparing those numbers as if coral must
pass underneath is wrong. The front wrap must lift a floor-supported cylinder
over the nose. At initial front contact its normal can push coral forward as
well as upward; tangential grip, floor reaction, approach, and compliance decide
capture. No modeled feature establishes this balance or maintains it over floor
variation. Floor clearance alone is not acquisition clearance or grip evidence.

**Transition continuity was sacrificed for clearance.** V2 lowers the ramp entry
from Z=388 to 320 mm to avoid the motor envelope, while belt crest remains Z=440.
The 120 mm is a crest-to-entry height difference, not a solved release trajectory.
The flat ramp then descends about 28.19 degrees to Y/Z=(273,253); it is not the
original steeper ramp. There is no powered upper contact across this transition.
The cradle starts near Y=275; v2 drums begin at Y=405, centered at Y=440. This
leaves about 132 mm from ramp end to drum front without powered side contact.
Neither a geometric gap nor a closed ramp solid proves that coral will bridge,
land without rebound, yaw, and reach the next nip at low momentum.

**Opposed contact exists downstream, but is not an established orienter.** V2 has
two vertical-axis 70 mm drums, 144 mm tall, at X=+/-88 and the same Y. Their nominal
106 mm throat imposes 8.3 mm diametral interference on the ideal coral, requiring
unqualified deformation. Independent drives can produce feed and yaw moments;
they do not themselves prove acquisition of a crosswise/skewed piece or convergence
to a repeatable pose. The fixed V trough supplies support, not active centering.
V3 substitutes one authentic wheel per side at X=+/-82.55, Z=320; that changes the
contact envelope, not just fidelity, and is not a replica of 2056's distributed banks.
Neither variant specifies the complete sequence of contacts into the held pose.

**Handoff is posed, not demonstrated.** Research offers coral along +Y at
(0,320,320), with a receiver approaching from above. The packet moves its center
to (0,440,320), an acknowledged 120 mm rearward packaging change. Feeding rearward
through the orienter and receiver withdrawal upward are distinct motions; specify
both and which surface retains coral during the exchange. The open V trough has
no longitudinal stop, anti-bounce feature, or defined sensor/receiver capture
interface. The diagnostic coral is placed at the destination, not transported there.
Changing `receiverHeight` moves/resizes the rough fork while cradle/coral remain at
Z=320. That is a clearance-control test, not proof of adjustable successful handoff.

## Discrepancies And Checks

P0 means resolve before mechanical freeze; P1 means resolve before build/powered integration.

| Priority / source fact | Proposed-model gap | Risk | Correction within A | Discriminating CAD or physical test |
| --- | --- | --- | --- | --- |
| P0: 2056 binder p.7 uses floating top contact, kicker, and ramp; 1690 E03 iterates compliance; 6328 S8 replaces inconsistent fixed pickup. | Open long belt, fixed drum centers; whole-pickup pivot only. | Pushing, rolling, slipping, or losing floor contact rather than controlled lift. | Compare adjustable compliant roller pickup with a belt plus controlled opposing contact; separate folding from floating. | Sectioned floor-contact poses, then matched slow acquisitions across entry orientations, offsets, and representative floor variation. |
| P0: 1690 E03 rear-roller removal created an installed dead spot masked by prototype momentum. | V2 collision repair introduces the 120 mm drop and an unpowered route to the orienter. | Stalling, bounce, orientation loss, momentum-dependent transfer. | Overlap successive driven contacts or justify a constrained gravity transition with measured margins. | Release near rest at crest, ramp, and orienter entrance on representative supports; stop/restart and bounded reverse without touching coral. |
| P0: 2056 p.9 has opposed wheel banks; independent drives address conflicting contact motion, not arbitrary geometry. | One contact station per side, unqualified compression; no demonstrated capture/centering envelope. | Crosswise wedging, in-place spin, ejection, or inconsistent final yaw. | Define wheel positions, compliance, supported approach, and signed surface velocities; compare coupled/independent commands on identical geometry. | Plan-view coral pose/contact sweep, followed by skew/parallel entry tests recording pose and current, not only beam interruption. |
| P0: 2056 p.11 has stop lip, anti-bounce step, two sensing events, and gripper cutouts; 6328 S8 buffers for an absent receiver. | Extruded open V with no stop or verified retention/sensing/access arrangement. | Overshoot, rebound, loss during driving, or release before receiver grip. | Add serviceable constraint and retention with explicit accept/release ownership, after receiver access is agreed. | Receiver absent/late, obstructed sensing, stopped drive, overrun, and deliberate pose offsets; measure retained pose and same-piece capture. |
| P0: Concept decision makes receiver location provisional; 1778 E07-E11 distinguishes fixed-contact ejection and receiver alignment from presence. | Y=440 replaces Y=320; rough fork and stationary coral do not define approach, grip, or withdrawal. | A centered coral can still be impossible to collect or be thrown during transfer. | Jointly agree an adjustable intake/receiver interface with motion directions, clearance volume, and acceptance tolerances; no new complete receiver. | Sweep a simple jaw/tool envelope through approach, grasp, withdrawal, and failed acceptance, including nearby wheel/motor housings. |
| P0: 6328 S10 reports structural integration/rigidity trouble; team requires actual chassis attachment. | Towers, deck, housings and rigid modules have incomplete physical joints; fixed mates bypass fasteners. | No demonstrated reaction path or maintained gear/receiver alignment under load. | Close one supported load path with located flat plates, spacers/blocks, shaft clamps, and accessible retained fasteners. | Joint-by-joint section review and service assembly; then loaded deflection/retention tests with loads and limits agreed before testing. |
| P1: Reference ratios are separate roller/pivot/orienter choices, not sizing prescriptions. | V2 disks and assumed 48:1 screen; v3 teeth still lack qualified manufacture, retention, and operating loads. | Undercut, tooth/joint failure, bearing overload, backdrive, or uncontained stop impact. | Size from selected moving mass/inertia, measured contact loads, speed/current/duty, and credible faults; design hard stops/retention independently. | Check full torque/reaction chain, tooth/root production and fits; guarded load/backdrive tests only after hardware review. |
| P1: Team profile requires exact COTS interfaces and a realistic router/lathe/print process. | Hole/volume/source-identity checks do not establish mount fit or buildability; module solids conceal unfinished joints. | Parts can import perfectly yet not assemble, retain, or be machinable. | Separate true parts and hardware; preserve vendor fits/threads/pitch; qualify stock, tolerances, print process and tool access. | Section vendor-to-custom interfaces, fit coupons and dry assembly with screw engagement, retention and removal access checked. |

## Structure And Claim Boundaries

The deployment torque path must be motor mounting face -> 16:128 stage -> compound
shaft/bearings -> 16:96 stage -> output hub/left carrier -> cross-member/right carrier.
Reactions return through gearbox cheeks, tower attachment, and chassis. The fixed
spine supports bearings; it does not transmit deployment torque through a free
revolute joint. One-sided drive requires a real cross-frame torsional connection.
[v2_reducer.py](v2_reducer.py) supplies layout and an assumed 22.5 N m load screen,
not current-model mass/inertia, impact/jam/stall qualification, or a strength margin.
V3 adds tooth geometry but retains unverified 16t/14.5-degree root/manufacturing details.
Joint limits are not hard stops; no resolved powered-off retention/brake load path exists.

[packet-v2/bom.json](packet-v2/bom.json) explicitly omits motor/deck/hub screws,
collars and tube/drum/ramp/guard joints. The tower recipe has a spine-clearance hole
but no base-fastener pattern; the cross tube lacks end holes; cradle/ramp recipes
lack mounting holes; orienter housing has motor/bearing bores but no deck-fastener
pattern. These are incomplete mechanism interfaces, not merely missing bolt renderings.
The four deck mounting holes do not close all of those joints. A fused multi-item
module and `FASTENED` mate do not supply a fabrication or assembly instruction.

[validate.py](validate.py) checks declared bore voids/cylindrical faces, not missing
holes, mating threads, engagement, bearing retention, datum tolerances, or capacity.
V2 compliant-contact collision exclusions are declarations, not compression tests.
V3 declares a 10.795 mm molded wheel hex versus 12.7 mm shaft press interface:
preserve that source fact, but do not call assembly force, hub life, or fit validated.
Authentic COTS provenance is valuable; it never proves the custom mount is correct by looks.

The red uninterrupted bumper is intentionally a keepout, not a manufactured bumper.
The gray chassis/fork and diagnostic coral are explicitly reference-only. Their
simplification is appropriate scope, not evidence that a complete robot is missing.
However, reference structure cannot silently become proof that real tower/deck loads
are supported; chassis interface ownership and realizable attachment still matter.

The triangular apparent holes/stripes in the viewed image are not evidence of
literal triangular cutouts. The belt recipe is an outer capsule minus an inner
capsule, producing a continuous loop; no triangular aperture operations exist.
Ramp geometry is a continuous extruded polygon. [package_packet.py](package_packet.py#L182)
paints tessellation triangles sorted by mean depth, without a per-pixel depth buffer;
this can draw rear faces over nearer ones. Source geometry and recorded closed-solid
checks support a rendering/occlusion explanation. No fresh STEP kernel inspection
was run here, so individual pixels are not diagnosed as new topology defects.

## Conservative V4 Direction

Keep **Concept A: deployable pickup -> chassis-fixed orienter -> retained single-coral
cradle -> adjustable rough receiver interface**. No switch to another full robot,
no reference-dimension transplant, and no claim that the following options will work.

| Corrective option | Benefit and cost | Decision evidence |
| --- | --- | --- |
| Preferred study: compliant wheel/roller pickup over the complete bumper, with controlled opposing roller/guide contact and overlapping powered transfer. | Directly addresses contact control and dead spots; changes pickup plates, drive routing and sweep. Contact compliance and number of rollers still require evidence. | Use adjustable locations/preload/travel; prove capture and continuous control in side/plan sections and matched low-energy trials before detailing a gearbox. |
| Retain belt, add opposing compliant contact and controlled discharge to the same fixed orienter/cradle. | Preserves more packaging work; retains belt tension/tracking, sag, long path, wrap and service burdens. A long belt must earn its complexity. | Compare on the same bumper, coral samples, receiver fixture and entry conditions; reject if it relies on momentum or unsupported friction assumptions. |
| Short belt or roller-assisted lift with a compact guided transfer. | Possible middle ground when roller sweep or belt packaging fails; introduces another transition and is not automatically simpler. | Compare contact continuity, supported loads, access, mass/cost and sweep before authorizing the larger layout change. |

Do not silently freeze mouth width, 54 mm drums, drop height, compression, receiver
Y/Z, or 3:1/6:1/48:1 ratios. Reference 2056 ratios describe its hardware, not ours.
Use the team's flat-plate/turned-spacer route without hidden precision bends;
confirm machine envelope, grades, tolerances and printer/material before release.

## Progress That Counts

Pause render polish, cosmetic reference imitation, extra COTS tessellation work,
and repeated sub-mm3 STEP volume tuning as the main mechanical-development task.
Do not relax or relabel those failing source gates: v3 stays blocked for its stated
fidelity reasons. They are separate software/interchange work and can resume when needed.
Retain existing collision, source-preservation, unit and parameter tests as guardrails.

The next design milestone is a closed contact path, an agreed receiver fit/retention
interface, and real support/torque joints, followed by recorded fixture outcomes.
Set loads, acceptance limits and safe test conditions with the team before testing;
progress means fewer unverified mechanical interfaces, not more solids or prettier
motors. Freeze only after evidence supports that architecture and its interfaces.