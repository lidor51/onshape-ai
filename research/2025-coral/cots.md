# COTS Candidates For The Next 2025 Coral Intake

Public manufacturer research, 2026-09-12. **Candidates, not a selection, complete
BOM, manufacturing release, or 2025 legality finding.** Inputs are
[the team profile](../../docs/TEAM-PROFILE.md) and [the research index](README.md).
Machine-readable evidence and SI inputs are in [cots.json](cots.json).

Scope: standalone mechanism on a blank, rough reference chassis, with a rough
receiver and its handoff envelope. Favor router-cut plates, turned spacers and
accessible manual-mill work; no accurate bends, hidden CNC-mill capability, or
offline CAD build. Nothing here fixes roller count, contact diameter, motor count,
receiver pose, pivot architecture, or a final reduction.

## Motor Evidence

**Verified 12 V reference:** CTRE's dated dynamometer results [S9] use its
documented 12 V regulated supply, 100% duty-cycle command and disabled current
limits [S12]. Current is measured on the supply side in that test condition.
Stall endpoints are **regression extrapolations**, not measured sustained stalls;
sampling typically ends around 65 A. No inline breaker/fuse is used in this lab
test, which must not be copied as a robot wiring recommendation.

| Motor / SKU | Mode | Test supply (V) | Free speed (rpm) | Stall torque (N m) | Stall current (A) | Test date |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| X60 / WCP-0940 | Trapezoidal | 12 | 6065 | 7.157 | 374.4 | 2024-01-08 |
| X60 / WCP-0940 | FOC | 12 | 5785 | 9.362 | 476.1 | 2024-01-08 |
| X44 / WCP-0941 | Trapezoidal | 12 | 7758 | 4.113 | 279.1 | 2025-09-26 |
| X44 / WCP-0941 | FOC | 12 | 7368 | 5.011 | 329.2 | 2025-09-26 |

The X44 dataset is post-Championships evidence. CTRE warns that manufacturing
tolerances and controller limits affect performance. This verifies a reference
test voltage, not an entire permitted operating-voltage range.

The following are the **WCP published endpoint tables**, not continuous ratings.
Each row keeps its own commutation mode, current and torque together [S2, S3].
These differ from CTRE's numbers. The extracted WCP tables did not state voltage;
do not silently assign CTRE's 12 V condition to them. Keep the datasets separate,
including their free-current data; CTRE free current was not established here.

| Motor / SKU | Mode | Free speed (rpm) | Free current (A) | Stall torque (N m) | Stall current (A) | Published peak power (W) |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| X60 / WCP-0940 | Trapezoidal | 6000 | 2 | 7.09 | 366 | 1108 |
| X60 / WCP-0940 | FOC | 5800 | 2 | 9.37 | 483 | 1405 |
| X44 / WCP-0941 | Trapezoidal | 7758 | 3 | 4.11 | 279 | 835 |
| X44 / WCP-0941 | FOC | 7368 | 3 | 5.01 | 329 | 966 |

Do not combine X60's 6000 rpm with its FOC torque, or X44's trapezoidal current
with its FOC torque. WCP's controller documentation describes FOC as requiring
Phoenix Pro; FRCDesignApp subscription is unrelated to that entitlement. Verify
the actual controller firmware, license and control mode before using an FOC row.
WCP's peak-power discussion explicitly warns that the full peak is not normally
available on an FRC robot. A thermal breaker is not a precise torque limiter.

Approximate **WCP-only** endpoint-derived $K_t = T_{stall}/I_{stall}$ values, in N m/A:
X60 trapezoidal 0.019371585; X60 FOC 0.019399586; X44 trapezoidal 0.014731183;
X44 FOC 0.015227964. These are motor/controller performance surrogates, not
measured winding constants or guaranteed torque under a configured current cap.
Use stator/torque-current semantics appropriate to the selected control mode;
battery supply current is not interchangeable with motor current under PWM.
No current limit, continuous torque or gearbox efficiency is selected.

For a voltage-qualified preliminary model, the JSON separately stores the CTRE
rows and SI conversions. Within each CTRE row only, derive
$K_{T,end}=T_{stall}/I_{stall}$, $R_{eff}=12/I_{stall}$ and
$K_{v,supply}=\omega_{free}/12$. These are endpoint fits to a controller/motor
system, **not winding resistance, loss-corrected back EMF, or a CTRE-measured
torque-constant column**. Do not equate $K_{v,supply}$ to $1/K_{T,end}$ under FOC.
Free-current correction requires a matching dataset, not WCP's nearby number.

## Six Candidates

Prices are USD, observed 2026-09-12, excluding shipping/tax, not 2025 prices.
The five WCP entries said In Stock; AndyMark's exact variant said available.
Neither establishes a delivery date.

| Part | Native interface and metric equivalent | Compatibility status | Current price |
| --- | --- | --- | ---: |
| [Kraken X60, WCP-0940][S1] | 8 mm SplineXS; integrated Talon FX | Matches candidate spline pinion nominally; mounts and loads still need design | $217.99 FRC educational |
| [Kraken X44, WCP-0941][S1] | Same 8 mm SplineXS; integrated Talon FX | Same pinion interface; **not an X60 bolt-pattern swap** | $217.99 FRC educational |
| [Flanged hex bearing, WCP-0783][S6] | 1/2 in hex = 12.7 mm across flats; 1.125 in body OD = 28.575 mm; listed 0.313 in width = 7.9502 mm | Nominal 1/2-in hex family fit; flange, fits, load rating and retention unverified | $2.99 each |
| [16T spline pinion, WCP-1016][S1] | 20 DP; 14.5-degree pressure angle; 8 mm SplineXS bore | Nominal motor/mesh match; spline retention and face overlap pending | $8.99 each |
| [48T pocketed gear, WCP-0137][S7] | 20 DP; 14.5-degree pressure angle; 1/2-in hex bore; 12.7 mm overall width | Nominal mesh and hex-family match; strength and shaft attachment pending | $17.99 each |
| [AndyMark wheel, am-3462_green](https://andymark.com/products/compliant-wheels?variant=44493390807212) | 2 in = 50.8 mm diameter, 0.5 in = 12.7 mm width; intended 1/2-in hex; green 35A | Intentional interference fit; exact RPM limit and coral behavior pending | $6.20 each |

WCP lists motor MSRP as $399.99, distinct from the educational price [S1].
Motor masses are nominal **including Talon FX**: X60 1.2 lb = 0.544310844 kg;
X44 0.75 lb = 0.3401942775 kg [S4, S5]. Report these practically as about
544 g and 340 g, not precision measurements. The approximately 204 g difference
matters on a moving intake; add gearbox, bearings, shaft, roller and wiring mass.
No gear, bearing or full-assembly mass has been established. AndyMark's nominal
2-inch family mass is 0.035 lb = 0.01587573295 kg, about 15.9 g [S13]; the exact
variant also has a storefront weight field of 16, not a measured inertia.

## Mounting And Fit

| Manufacturer text [S4, S5] | X60 | X44 |
| --- | --- | --- |
| Body diameter | 60 mm | 44 mm |
| Effective diameter including bump | 63.5 mm | 47.4 mm |
| Listed motor/controller length | 75 mm | 75 mm |
| Pilot diameter | 3/4 in = 19.05 mm | 3/4 in = 19.05 mm |
| Mounting | 11 blind #10-32 holes, 2 in = 50.8 mm bolt circle, 30-degree spacing | 11 blind #10-32 holes, 1.375 in = 34.925 mm bolt circle, 30-degree spacing |

Embedded outline/mounting SVG drawings exist on both physical-specification
pages but **were not read**. Missing-hole clocking, thread depth, shaft extension,
pilot height, screw engagement, terminals and cable/service envelope remain open.
The listed 75 mm is not a verified total installed envelope including shaft and
cables. Do not generate eleven hole coordinates or treat the marketing phrase
"drop in" as identical mounting geometry. Retain #10-32, not M5.

Use WCP-0783 for a *hex-bore* candidate. WCP-0781 is instead a 0.500-in **round**
bore bearing, and WCP-0785 is a **13.75 mm round bearing for rounded hex** [S6].
Neither is a direct full-corner, 1/2-in hex-bearing substitute. Ordinary 12 mm
metric shaft/bearings are not this interface. The 0.313-in listed width must not
be silently replaced with 5/16 in. A nominal OD is not a housing machining
tolerance; inspect the drawing and prove a press/retained fit in the actual stock.

Both motors have non-replaceable output shafts [S1]. A Falcon spline or an
8 mm keyed-bore pinion is not an 8 mm SplineXS part simply because the diameter
or motor mounting appears similar. Use the native spline part, not a guessed
adapter or a printed high-torque bore. Axially retain components without loading
the bearing seals or allowing the pinion to walk.

## Gear Stage Example

**WCP-1016 (16T) driving WCP-0137 (48T)** is a concrete 3:1 candidate, not a
required intake ratio. Both are 20 DP / 14.5 degrees [S1, S7, S8]. Equivalent
module is exactly 1.27 mm, not metric module 1.25 and not 24 DP. Pitch diameters
derived from $d = 25.4N/DP$ are 20.32 and 60.96 mm; nominal center distance is
40.64 mm before the actual fit/backlash decision. A mesh reverses direction.

The 16T pinion is the ordinary 16T-spacing variant. WCP also sells addendum-
modified pinions: actual teeth set ratio, while the advertised spacing teeth
set center distance. Do not substitute them without updating both calculations.
S8's example table inconsistently reports some modified-pinion ratios; calculate
from actual teeth, not that example table. Its general 3/8-in face-width statement
also conflicts with its 3/4-in motor-pinion statement. **Pinion face width remains
unverified**; do not freeze the axial stack from the guide. The output gear has
7075-T6 aluminum, Type III hard anodize, 0.500-in overall width and 0.090-in web
per its product page [S7]; that does not establish allowable tooth torque.

This is not an exact build BOM: shaft SKU/material/length, bearing count and
span, collars/spacers, spline-retention hardware, housing fits, lubrication,
guarding and stress margins remain unselected. In-house gearbox construction
fits the team's flat-plate/lathe/manual-mill route, subject to actual tolerances.
MAXPlanetary and ThriftyBot cycloidal compatibility and ratings were not checked;
neither is needed to establish this candidate stage and neither is nominated.

## Contact And Remote Transmission

The legacy 2-inch URL redirected to Compliant Stars, so it was not used as wheel
evidence. The current page and public storefront product JSON [S11, S13] verify
**am-3462_green**, variant **44493390807212**: 1/2-in hex / 2-inch diameter / 35A.
The family specifications identify TPU tread, polycarbonate core and 12.7 mm
width for the 2-inch wheel. The manufacturer intentionally undersizes its bore
for interference on the nominal hex shaft; **12.7 mm is the intended shaft size,
not an actual measured wheel bore**. Its sizing image remains unread.

The published 3500-9000 rpm range is family-wide and was not mapped to this exact
variant, so its maximum rpm is **unknown**, not 9000 or a guessed 3500. Hardness is
not friction or a compression-force curve. No coral grip, wear, retention under
reversal or handoff success has been tested. The 50.8 mm diameter is a candidate
contact scale, not a chosen roller geometry.

Custom round tube plus rubber remains an alternative. Relative to discrete COTS
wheels it could provide continuous contact and replaceable sleeves, but requires
specified rubber compound, sleeve/bond retention, concentric hubs, runout and
inertia. Compare grip, compression, wear and service access by test; no claimed
friction, durometer, mass or strength is assigned to an unspecified rubber tube.

Known motor-side choices on S1: WCP-1019 is 10T and WCP-1020 is 12T, both steel
#25-chain sprockets with 8 mm SplineXS bore. WCP-1017 is a 12T, 9 mm-wide,
HTD 5 mm spline pulley; WCP-1178 is a 16T, 9 mm-wide, GT2 3 mm spline pulley.
These are **interface examples, not additional selected candidates or complete
chain/belt drives**. Do not mix HTD 5 mm with GT2 3 mm, or choose chain/belt length
from tooth count alone. No matching driven SKU, belt/chain SKU, wrap, tensioner,
center distance or rated load is verified, so no hand-wavy transmission BOM is
offered. A gear stage can be screened without selecting remote transmission.

## Sizing Milestones

1. **Freeze reference interfaces.** Record chassis datums and keep-outs, receiver
   offer/capture pose, motion envelope and retention ownership. Keep low-momentum
   entry, absent/misaligned receiver and jam-clearing cases. No old fixture sizes.
2. **Measure roller demand.** Establish contact radius $r$, target surface speed
   $v$, required tangential force $F$, roller inertia $J$, acceleration $\alpha$,
   slip/compression and duty cycle. Use $\omega_r=v/r$ and
   $T_r=Fr+J\alpha+T_{loss}$. For reduction $G$, require
   $\omega_m=G\omega_r$ and $T_m=T_r/(G\eta)$, with measured/justified efficiency.
   Free speed is an upper endpoint, not loaded operating speed. The 3:1 example
   gives one-third free speed, but does not establish a suitable surface speed.
3. **Measure pivot demand separately.** If a pivot is selected, establish moving
   mass/center of mass, coral load, inertia, angular acceleration and cable loads.
   With angle from horizontal, screen
   $T_p=mg\ell\cos\theta+J_p\alpha+T_{friction}+T_{cable}$.
   Check both gravity holding and motion; a 3:1 roller stage is not a pivot sizing
   result. Evaluate counterbalance, brake/retention and hard-stop energy. Use
   $g=9.80665$ m/s^2 as standard gravity, not a guessed local measurement.
4. **Bound torque before power.** Select stator and supply current limits, ramp,
   jam detection/reversal and thermal duty after load/stress checks. Even X44 may
   be oversized. Current-limited torque is not published stall torque; current
   limits do not eliminate external impact loads, shaft bending or hard-stop
   shock. Check tooth/root strength, hex rounding, bearing reactions and plate
   deflection. X60's extra mass and stall capability can be liabilities.
5. **Release only after evidence.** Test pickup/orientation/handoff and recovery
   at intended supply conditions, with repeatable reassembly and safe guards.
   Confirm drawings, source versions, actual availability and the separate rules
   review before freezing a procurement or manufacturing packet.

## Dates And Catalog

All current specs/prices/stock observations are dated **2026-09-12**, not 2025.
S1 has an "Update 08/24" production note with no year; it is not reliable evidence
of a 2025 release date or a promised shipment. Exact 2025 availability and hardware
revision for all candidates remain unverified. WCP's X44 changelog [S10] records
document creation on 2024-10-19, image updates on 2025-07-11 and a flipped-adapter
section added on 2026-07-16. These are not guaranteed product shipment dates.
CTRE's X60 test is dated 2024-01-08; its X44 test is dated 2025-09-26 [S9], after
the 2025 championship season. The AndyMark record is tagged Migrated Product and
published 2025-06-15 [S13]; that is not proof of first wheel introduction.
No event date or project deadline
was supplied; current In Stock text is not a delivery commitment. The rules owner
must evaluate the applicable 2025 manual/updates and event date separately.

Prefer the user's subscribed **FRCDesignApp / FRCDesignLib** for eventual COTS
insertion. Candidate coverage, configurations, source versions and a supported
automation API are **unverified**. Record each manufacturer's SKU, catalog
configuration/version and units, then cross-check interfaces. No authenticated
Onshape calls, CAD downloads, private FRCDesign endpoints, cookies, purchases,
delegates or commits were used for this packet.

Process limitation: the approximate 10-source fetch target was exceeded:
24 confirmed source-URL attempts, plus search/index discovery, with 13 retained
evidence URLs. Failed/moved URLs and incomplete extraction caused extra requests;
one terminal retrieval returned unrelated output and was excluded as evidence.
No further source hunt was performed after resolving the motor test conditions
and exact wheel variant. Drawings, PDF parsing and historical stock remain gaps.

## Sources

- [S1: WCP Kraken storefront][S1]: SKUs, spline, current prices/stock and accessories.
- [S2: X60 motor endpoint tables][S2]; [S3: X44 motor endpoint tables][S3].
- [S4: X60 physical specifications][S4]; [S5: X44 physical specifications][S5].
- [S6: WCP imperial bearings][S6]; [S7: pocketed output gears][S7].
- [S8: WCP gear standards and spacing guide][S8].
- [S9: CTRE dated motor results][S9]; [S12: CTRE test methodology][S12].
- [S10: X44 manual/product changelog][S10].
- [S11: AndyMark compliant wheels][S11]; [S13: public variant/specification JSON][S13].
- FOC entitlement context: [X60 controller documentation](https://docs.wcproducts.com/welcome/electronics/kraken-x60/kraken-x60-+-talonfx/overview-and-features/motor-performance.md)
   and [X44 controller documentation](https://docs.wcproducts.com/welcome/electronics/kraken-x44/kraken-x44-+-talonfx/overview-and-features/motor-performance.md), text read; no license/account check.

[S1]: https://wcproducts.com/products/kraken
[S2]: https://docs.wcproducts.com/welcome/electronics/kraken-x60/kraken-x60-motor/overview-and-features/motor-performance.md
[S3]: https://docs.wcproducts.com/welcome/electronics/kraken-x44/kraken-x44-motor/overview-and-features/motor-performance.md
[S4]: https://docs.wcproducts.com/welcome/electronics/kraken-x60/kraken-x60-motor/overview-and-features/physical-specifications.md
[S5]: https://docs.wcproducts.com/welcome/electronics/kraken-x44/kraken-x44-motor/overview-and-features/physical-specifications.md
[S6]: https://wcproducts.com/products/ball-bearings
[S7]: https://wcproducts.com/products/pocketed-gears
[S8]: https://docs.wcproducts.com/welcome/frc-build-system/belts-chain-and-gears/gears.md
[S9]: https://motors.ctr-electronics.com/dyno/dynometer-testing/
[S10]: https://docs.wcproducts.com/welcome/electronics/kraken-x44/misc/changelog.md
[S11]: https://andymark.com/products/compliant-wheels
[S12]: https://motors.ctr-electronics.com/dyno/
[S13]: https://andymark.com/products/compliant-wheels.js