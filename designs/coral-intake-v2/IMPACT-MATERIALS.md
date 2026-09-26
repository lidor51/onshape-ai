# Impact And Material Policy

**PROVISIONAL DESIGN POLICY. NOT COMPETITION READY.** 2026-09-18.
This is an engineering screen of the existing 279-occurrence v2 structure, not a
new CAD design, material certification, crash simulation or physical test result.
No physical validation has been performed for this policy. All release gates remain open.

## Subsequent Verified Sheet Data

The later parent inspection obtained the actual manufacturer-linked
[TUFFAK GP sheet datasheet](https://plaskolite.com/docs/default-source/pds/PDS004_TUF_GP.pdf)
and [fabrication guide](https://plaskolite.com/docs/default-source/fab/fab015_tuf_en.pdf).
This supersedes the PC source-unavailable status of the bounded lookup below;
the original numerical screen is retained as history, not silently recalculated.
[Source receipts and values](material-data.json) record original hashes.

TUFFAK GP page1 lists specific gravity1.2, tensile modulus340,000 psi
(2.344 GPa), flexural modulus345,000 psi (2.379 GPa), and tensile yield9,000 psi
(62.05 MPa). These are **typical properties, explicitly not specification values**.
Its47 ft-lb instrumented-impact value concerns an ASTM D3763 specimen at0.125 in
thickness, not this intake, a bolted cheek, or a robot collision.

Fabrication PDF pages55-56 specify flat-underhead fastening, load-spreading
washers/standoffs, and hole-edge clearance at least twice the hole diameter and
twice the sheet thickness; slots require more. Avoid conical countersunk heads
and ordinary threadlocker. Dissimilar-material thermal movement must be allowed.
These details require checking in each proposed PC guard, not just putting
"polycarbonate" in the BOM. The actual team stock/grade and aluminum producer
certificate remain unconfirmed. With the sheet's flexural modulus, same-contour
6.35 mm PC has about4.1% of the weak-axis stiffness of the assumed6 mm/69 GPa Al
comparison, consistent with the earlier approximate4% conclusion.

## Complete-System Follow-Up

The [full assembly checkpoint](system-output/index.html) restores the indexer,
holding tray, four authentic X44 motors and actual first-stage gear geometry.
It also contains candidate PC guards and the proposed parallel-link mounting.
Downstream transmissions and several joints remain unfinished; see [SYSTEM.md](SYSTEM.md).

The high single pivot remains rejected for adverse wall-force direction.
The later equal-link proposal moves up/inward, but its initial links are nearly
horizontal. [Virtual-work calculation](deployment-path.json) gives approximately
**3735 N frontal force to overcome gravity at full deployment** using the prior
7.618 kg screened moving-mass allowance, before friction/actuator resistance.
The new linkage hardware is not included in that allowance as a verified mass.
Positive force direction alone therefore did not establish useful passive
compliance. That proposal is also **REJECTED as a qualified impact-relief design**.
It remains displayed as rejected engineering evidence, not an approved mechanism.

## Decision

Use a **protected, stiff 6061-T6 aluminum bearing/reducer structure**, with
**replaceable 6.35 mm unfilled polycarbonate leading guides and sacrificial contact faces**.
Retain 6 mm aluminum as the current structural comparison baseline, not as an
approved final plate thickness. Remove area or change section geometry only after
the actual bearing, torsion and stop load paths have been checked.

Do **not** substitute PC into every existing bearing cheek simply because it is
impact resistant. Keep the 6.35 mm PC outboard-cheek plus local aluminum bearing
doubler option as a coupon/fixture prototype, not the selected drop-in construction.
The preferred PC guide is mechanically independent of shaft-axis location; guide
deflection must not set roller centers or timing-belt alignment. PC also does not
make the existing exposed aluminum structure or high-pivot geometry crash tolerant.

The first design gate is the force path:

**Replaceable face -> directionally verified reversible linkage/compliance ->
spring/damped travel -> mechanical stop -> chassis frame.**

The contact must actually drive that compliant motion in a relieving direction.
Provide a defined return/preload and containment for a broken replaceable piece.
A spring stores and returns energy; it is not automatically a dissipator. Specify
damping/rebound behavior. Stop reactions must bypass reducer teeth and motor
bearings. A high reduction ratio, motor braking, current limiting or an unverified
slipping belt is not passive impact protection. A non-backdrivable drive can make
the problem worse. No final linkage, clutch, spring rate or travel is selected here.

## Evidence And Properties

[impact-materials.json](impact-materials.json) contains the calculations and hashes.
[impact_materials.py](impact_materials.py) reads the saved
[mesh](output/pickup-mesh.json), [pickup report](pickup-report.json) and
[drive report](drive-sizing.json); it does not import the CAD builder or rebuild solids.
The drive report is checked against the current pickup source hash.

Four named public URLs were attempted, with no authentication or Onshape API:

| First-party source | Observed result | Numerical support |
| --- | --- | --- |
| [Kaiser 6061 sheet/plate PDF URL](https://www.kaiseraluminum.com/wp-content/uploads/2016/02/Kaiser_Aluminum_6061_Sheet_Coil_Plate.pdf) | HTTP 404 | None |
| [Covestro Makrolon 2405 URL](https://solutions.covestro.com/en/products/makrolon/makrolon-2405) | HTTP 404 | None |
| [Hydro 6061 extrusion PDF URL](https://www.hydro.com/globalassets/01-products-services/extruded-profiles/north-america/hydro_extrusion_na_alloy_6061.pdf) | HTTP 404 | None; extrusion data would not qualify sheet anyway |
| [Covestro Makrolon brand page](https://solutions.covestro.com/en/brands/makrolon) | Read successfully; links to product/processing PDFs | Brand family only, not an extracted grade datasheet |

**The first-party numerical datasheet requirement remains unverified.** The
four-URL cap was respected; no further crawl or PDF downloads were attempted.
The following are explicit typical screening assumptions, NOT values verified
from those pages, purchasing specifications, lower-bound allowables or guarantees:

| Candidate | Young's modulus | Density | Nominal tensile yield | Temperature basis |
| --- | ---: | ---: | ---: | --- |
| 6061-T6 sheet/plate | 69 GPa | 2700 kg/m3 | 276 MPa | Assumed 23 C; actual temper/form/direction limits unresolved |
| Unfilled PC sheet | 2.3 GPa | 1200 kg/m3 | 60 MPa | Assumed 23 C, short-term loading; grade/conditioning/rate unresolved |

Before procurement/release, obtain the producer's actual 6061-T6 sheet/plate
datasheet and certificate, and the chosen unfilled Makrolon/Lexan sheet grade's
manufacturer datasheet. Verify thickness-dependent minimum properties, test
standard, temperature and strain rate. A Covestro/SABIC resin coupon does not by
itself qualify an extruded sheet. Reinforced, flame-retardant and impact-modified
grades are not interchangeable. PC yield, creep, fatigue, cold impact, UV aging
and chemical stress cracking must be evaluated for the actual stock and service
environment. Glass transition/HDT is not a permissible bearing service temperature.
Printed PLA/PETG/nylon, chopped-fiber or continuous-fiber parts are **not qualified**
for structural cheeks, bearing alignment, stops or impact faces by this analysis.

## Exact Plate Area

Coordinates are X width, Y into the robot, Z up. Main cheek centers are X=+/-225 mm,
floating cheek centers X=+/-237 mm, all currently 6 mm thick. Nominal front star
coverage is 393.7 mm, not 500 mm shaft length and not guaranteed capture width.
Current outer cheek faces reach +/-228 and +/-240 mm: 31.15 and 43.15 mm beyond
the nominal star coverage. Shaft ends and hardware may be still farther outboard.
Being behind a roller in one view does not protect a cheek from a side/corner hit.

| Existing plate | Quantity | Exact CAD volume each, mm3 | Net area each, mm2 | Mass each at 2700 kg/m3, kg |
| --- | ---: | ---: | ---: | ---: |
| Main cheek | 2 | 210732.836228 | 35122.139371 | 0.568979 |
| Floating cheek | 2 | 48736.215933 | 8122.702656 | 0.131588 |
| Total | 4 | 518938.104323 | 86489.684054 | 1.401133 |

For the present uniform, through-cut plate geometry, $A=V/(6\ \mathrm{mm})$.
These are net material areas including holes/slots, not bounding rectangles or
sheet purchasing area. Volume values match the separate pickup report. Independent
signed-tetrahedron integration of the placed triangle meshes differs from exact
volume by at most 0.000509% and from saved CAD pivot inertia by 0.010702%.
That numerical cross-check is not a tolerance, strength or physical validation.

The original moving-assembly density estimate is **5.382-6.118 kg**, with pivot
inertia **0.56990-0.65233 kg m2**. It excludes omitted drives, guards, wiring and
other unfinished hardware; it is not a measured or completed assembly mass.

## Thickness Comparison

Same YZ contour, same supports, uniform thickness along X:

$$
m=A t\rho,\qquad
R_{\mathrm{weak}}=\frac{E}{E_{Al}}\left(\frac{t}{6\ \mathrm{mm}}\right)^3,
\qquad R_{\mathrm{strong}}=\frac{E}{E_{Al}}\frac{t}{6\ \mathrm{mm}}.
$$

Weak axis means side-load bending through the thickness. Strong axis means bending
within the plate plane with the in-plane section unchanged. These are beam-section
EI ratios, not full perforated-plate FEA, torsional stiffness or strength ratios.

| Material/thickness | Four plates, kg | Weak-axis relative stiffness | Strong-axis relative stiffness | Four-plate pivot inertia, kg m2 | Assembly subtotal, kg |
| --- | ---: | ---: | ---: | ---: | --- |
| Al, 6 mm | 1.4011 | 1.0000 | 1.0000 | 0.12997 | 5.408-6.040 |
| PC, 6.35 mm | 0.6591 | 0.03951 | 0.03528 | 0.06113 | 4.666-5.298 |
| PC, 9.525 mm | 0.9886 | 0.13336 | 0.05292 | 0.09170 | 4.996-5.627 |
| PC, 12.7 mm | 1.3181 | 0.31611 | 0.07056 | 0.12227 | 5.325-5.957 |

Each subtotal removes the original four plates at each original density bound,
then adds the candidate at its nominal density. Thus nominal-Al subtotal bounds
differ from the original density-range result. No doublers, new fasteners,
changed shafts or new stops are included. This is not a recommendation to purchase
those thick sheets. Thickness changes require new bearing seats, retainers,
spacers, shaft engagement and belt/float-clearance checks.

With the assumed moduli, equal weak-axis stiffness needs
$t_{PC}=6(69/2.3)^{1/3}=18.643$ mm, approximately **19 mm**. Modulus sensitivity
68-70 GPa Al and 2.0-2.4 GPa PC gives 18.292-19.626 mm, not a statistical interval.
At 18.643 mm, same-contour PC is about 1.935 kg, heavier than the 6 mm Al plates;
matching this axis would still not match in-plane stiffness.

**6.35 mm PC cheek/doubler budget:** a gross 60x60x3 mm Al pad weighs 29.16 g.
Twelve illustrative pads add 349.92 g; twenty-four add 699.84 g. PC plus 24 pads
is 1.35889 kg, only **42.24 g lighter** than the existing nominal-Al plate set
before extra fasteners, spacers or bearing blocks. These pads are a mass example,
not approved dimensions or a proposed hardware inventory. Extra hardware can make
this option heavier, with more parts and worse access. Two local pads around a
bearing do not restore stiffness of the intervening PC span.

## Side-Load Screen

For an isolated rectangular cantilever of length 300-450 mm, section height
60 mm and thickness $t$, $I=ht^3/12$, $\delta=FL^3/(3EI)$ and
$\sigma=6FL/(ht^2)$. The full 150 N acts on one side; it is not automatically
shared between left and right. Root moment is 45-67.5 N m.

| Material/thickness | Formal linear deflection at 300 / 450 mm, mm | Nominal stress at 300 / 450 mm, MPa |
| --- | ---: | ---: |
| Al 6 | 18.12 / 61.14 | 125.0 / 187.5 |
| PC 6.35 | 458.47 / 1547.35 | 111.6 / 167.4 |
| PC 9.525 | 135.84 / 458.47 | 49.6 / 74.4 |
| PC 12.7 | 57.31 / 193.42 | 27.9 / 41.9 |

**These deflections are not predictions of the actual cheeks.** All listed
150 N examples exceed the chosen 5%-of-length small-deflection screening threshold;
some PC stresses also exceed the assumed yield value. Their elastic solution is
outside its useful range. Holes, slots, local bearing stress, bolt preload, creep,
plate triangulation and nonlinear contact are absent. Even at the separate 40 N
example, thin PC requires nonlinear investigation. Flexibility alone does not
establish recoverable strain, useful energy absorption or safe shaft misalignment.

## Critical Contact Direction

Current main pivot: (Y,Z)=(110,330) mm. Front roller: (-261,170.348486) mm.
Kicker: (-140,34) mm. Positive $q$ is right-hand rotation about +X; stow is
negative $q$ toward -140 degrees. At a currently posed point, let $r=p-pivot$:

$$
J=\frac{\partial p}{\partial q}=(0,-r_z,r_y),\qquad
Q_q=J\cdot F=r_yF_z-r_zF_y.
$$

Use metres in $J$ and radians for $q$. For stow coordinate $s=-q$,
$Q_s=-Q_q$. A frontal wall reaction is $F=(0,+F_y,0)$. At the front,
$r_z=-0.159651514$ m, so **150 N gives +23.9477 N m about X and negative
work in the stow direction**. Because $\partial z/\partial q=r_y=-0.371$ m,
the force-favored positive rotation pushes the front **down**, not up/inward.
The kicker gives **+44.4 N m**, also opposing stow. These are conditional
force-direction results, not claims that both rollers contact the same wall first.

Actual full-plate mesh frontmost witnesses give +17.7576 N m for each main cheek
and +27.3770 N m for each floating cheek under the same +Y force. Both left and
right outboard faces are tested. Pure side force has zero main-fold torque, not
zero stress: it bends the cheeks/shafts and loads crossmembers and pivot mounts.
Corner loads additionally rack/twist the cassette; do not replace that analysis
with symmetric axial or half-force calculations. The separate floating DOF and
simultaneous contacts still require a coupled solution.

**Design gate: FAIL for passive high-pivot collapse under these low frontal
normals.** A stronger material or a releasing motor brake does not change this sign.
At a hypothetical pivot Z40, front-roller wall torque becomes -19.5523 N m,
which favors stow, but kicker wall torque is still +0.9 N m. A low pivot is
therefore a candidate, not a chosen solution. Compare a low driven linkage and a
spring-retracting inward translation/tilt; require actual frame, bumper, floor,
reef, receiver and stowed-clearance solutions before choosing either.

### What The 1690 Source Shows

Do not confuse its native Y-up frame with this model's Z-up frame. The cached
lower-rocker `LFPYB` observations put its rear driven-axis interface candidate at
native (Y,Z)=(52,227) mm and front pin at (179.535249,577.132992) mm: the rear
axis is **127.535 mm below** the front pin. The rear location is a noncircular
outline center, not a fitted circular bore or independent proof of drive coupling.
The report preserves the source hash and measurement basis.

For an isolated rocker with those axes, a native -Z wall force of 150 N applied
at the front pin produces -19.1303 N m about X; negative rotation raises that pin
because $\partial Y/\partial q=-350.133$ mm/rad. This is the geometric reason
the low-driven-axis arrangement is worth investigating, unlike our high single
pivot. It does **not** establish the actual roller-to-link force transmission or
prove the source mechanism retracts under every collision. The recorded shaped
slot/contact bearing invalidates a simple pinned-four-bar reconstruction; see
[source inspection](../../research/2025-coral/CAD-INSPECTION.md). A low kicker
can still be below a rear axis. Keep source topology and contact modes explicit.

## Collision Energy

The old **40 N aggregate acquisition** force is an assumed operating target, not
40 N per roller and not a measured collision force. **150 N operating contact**
is a separate proposed quasi-static one-contact test target, not measured service
load. Neither target, nor a static 250 N check, qualifies collision survival.

For the illustrative effective mass 55 kg, $K=mv^2/2$ and
$F_{avg}=K/\delta$, with stopping travel along the contact normal:

| Speed, m/s | Energy, J | Average force over 10 mm, N | Average force over 50 mm, N |
| --- | ---: | ---: | ---: |
| 0.5 | 6.875 | 687.5 | 137.5 |
| 1 | 27.5 | 2750 | 550 |
| 2 | 110 | 11000 | 2200 |

These are average forces, **not peaks**, and are not a crash rating. Effective
mass depends on chassis rotation, other contacts, traction, opposite robot motion
and compliance. The assumed 5/15/55 kg sensitivity at 1 m/s and 50 mm gives
50/150/550 N average. That 5-55 kg interval is not a measured or universal bound;
continued powered pushing and a second moving robot can add energy. Mechanism
spring stroke is not necessarily equal to normal stopping travel. A hard stop
after compliant travel can still deliver a large peak and must be structurally rated.

## Construction And Service

- Keep reducer/bearing alignment on a stiff protected subframe. Prefer whole-cassette
  reversible compliance to independent left/right bearing-axis motion. Resolve
  both shaft axial retention and allowed angular/axial freedom. Do not hard-link
  two flexing cheeks with rigid shafts and a timing belt and also claim independent
  flex. Local bearing doublers do not remove that overconstraint.
- Analyze each side separately: front/outer PC contact face, its bolts and edge
  distances, cheek net ligaments and slots, bearing blocks, crossmembers, pivot
  supports, stops and chassis rails. Include opposite-face rebound, oblique reef
  snag, roller/piece jam, reverse extraction and stowed hits. Full geometry must
  include shaft ends, fasteners, belts and guards, not just the plate outline.
- Use mechanically captured, radiused/deburred replacement guides with accessible
  common hardware, preferably the existing metric tool sizes. Use broad washers
  or load-spreading clamps and compression sleeves as appropriate. No primary
  impact threads tapped directly into PC. Hole edge distances, clamp preload and
  bearing stresses are unresolved design dimensions, not generic washer fixes.
- Keep adhesives and unqualified threadlockers/cleaners away from stressed PC:
  environmental stress cracking/crazing is a release concern. Use mechanical
  locking and only manufacturer-approved chemical combinations. No adhesive-only
  sacrificial-face retention. Supply spare faces, inspectable fasteners and captive
  spacers. Target replacement with ordinary hand tools in under five minutes;
  demonstrate it without disturbing bearing location or retensioning the drive.
- Check every new face's outboard/forward envelope in deployed and stowed poses.
  Do not trade a collision concern for field snagging, bumper interference or
  extension/width noncompliance. The existing 279 occurrences already make added
  doublers/fasteners a meaningful complexity cost; a complete BOM and real
  assembly/replacement trial are required, not a lower nominal plate mass alone.

## Falsifiable Gates

No powered robot or automatic impact test is authorized by this document.
Machine/fixture capacity, guards, stored-energy containment and human review are
required before physical work. The numerical screening limits below are proposed
abort/measurement targets, not certified safe operating limits.

1. **Unilateral contact direction:** with drives disconnected and stored energy
   controlled, inspect actual deployed/intermediate/stowed geometry at both float
   extremes. For wall, reef and floor normals, identify all active contacts and
   compute their Jacobians. Require a feasible relieving motion with nonnegative
   gap rates at all active contacts. For passive stow, require positive work in
   that direction where intended, not cancellation of a jam at one contact by
   another. Enforce $g_i\ge0$, $\lambda_i\ge0$, $g_i\lambda_i=0$ and include
   friction/snags, stops and spring preload. No active contact may force the
   cassette into the floor or another obstacle. Verify the sign physically with
   low-force hand/fixture pushes before energy testing. Discrete angle samples
   alone do not establish a continuous path. The present frontal witnesses fail.
2. **Material and joints:** identify the sheet batch and temper/grade, weigh actual
   parts, measure thickness, and test representative routed holes/slots and edge
   finish. Establish load-deflection-unload curves and creep under actual belt
   tension/preload at the intended minimum/maximum service temperatures. Reject
   crazing, cracks, hole elongation or unexplained set. Bolted coupons must match
   actual contact faces, sleeves, washer footprint, torque and edge distance.
3. **Alignment and quasi-static fixture:** mount the actual complete cassette to
   a chassis-representative frame, with load cell and displacement indicators at
   both shaft ends. Apply 40 N aggregate acquisition separately from 150 N at
   each specified wall, left/right corner and side witness in reviewed stages.
   Record input force, travel, spring/stop reactions and bearing/pulley alignment.
   Provisional abort ceilings are 0.25 mm relative bearing-center displacement,
   0.25 degree axis skew, 0.20 mm residual set after unloading, or 0.5% measured
   local PC surface strain. Use stricter manufacturer limits if available; stop
   below any fixture/sensor rating. These ceilings are not bearing specifications.
   Stop for any binding, belt climb/tooth skip, bolt slip, cracking/crazing,
   uncontrolled downward motion or exhausted clearance. Complete manufacturer
   alignment/tension limits and shaft bending analysis before declaring a pass.
4. **Graded energy fixture:** only after gates 1-3 and human sign-off, use a guarded,
   independently restrained pendulum/drop/sled fixture with motor power isolated.
   Proposed initial review points are 0.25, 0.5, 1, 2 and 5 J, not robot collision
   qualification levels. Calibrate delivered energy and measure force/time and
   travel; record contact shape and exact contact point. Test left/right frontal
   corners, side hits and the relevant reef-contact geometries. Review the data
   and unload/inspect after each strike before deciding to advance; stop at any
   gate-3 limit, unexpected contact or 80% of approved available compliance travel
   during initial fixture trials. Do not deliberately strike the unqualified hard
   stop. Its energy/reaction capacity needs a separately reviewed proof test.
   The 6.875-110 J robot-energy cases are not automatic next test levels.
5. **Return, repetition and replacement:** set the repetition count, temperature
   range, permissible peak force, stop loads and service interval in the signed
   test plan before testing. Verify return position, preload, belt tracking,
   alignment and coral pickup after unloading and after guide replacement.
   Include damaged-guide inspection/replacement, creep holds and jam recovery.
   A single successful strike or a passing software test does not qualify field
   reliability. No competition-ready claim until the mechanism, structure,
   material, drive, rules and physical test gates are closed.

## Reproduction

Run [impact_materials.py](impact_materials.py) to regenerate only the authorized
JSON report, then [test_impact_materials.py](test_impact_materials.py) for the
independent SI arithmetic, finite-difference Jacobian, mesh/CAD cross-checks,
left/right contact witnesses, source-axis ordering and generated-file checks.
Use the existing configured Python environment with `-I -B`; no new packages are
needed. The private reference cache is optional and explicitly reported missing
when unavailable. This work changes no pickup CAD, v1 files or viewers, and does
not run an Onshape API request or physical machine.