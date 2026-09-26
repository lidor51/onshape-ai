# Pickup Transmission: NOT RELEASED

This is an implemented, importable CAD slice, not a manufacturing release or a
physical-performance pass. Dimensions are millimeters. Source originals,
source bindings, model parameters, existing reports and validation outputs are
unchanged. No network calls, downloads, full robot build, exports or agents are
used by the tests. The three deliverables are [transmission.py](transmission.py),
[test_transmission.py](test_transmission.py) and this document.

## Parent Integration

`add_transmission(package)` mutates and returns the same unclocked Package. It
replaces instances, preserves retired definitions, and exposes its inventory,
routes, slot coordinates and axial stacks in `package.transmission`. Repeated
calls on an already augmented package are no-ops.

The current [model.py](model.py) `build()` already clocks its outputs. Do not
call this helper on that result. The parent must insert it before the existing
`clock_outputs(package)` call, or use this explicit construction order:

```python
from geometry import parameters
from model import Package, build_pickup, build_indexer, build_dock, clock_outputs
from transmission import add_transmission

package = Package(parameters())
build_pickup(package)
build_indexer(package)
build_dock(package)
add_transmission(package)
clock_outputs(package)
```

No parent integration was performed in this bounded change. The helper rejects
an already-clocked unaugmented package and incompatible plate/shaft/belt sizes.
The parent owns full sweeps, drawing/export generation, serializing
`package.transmission`, and excluding zero-quantity definitions from its BOM.
Four existing 12T/60T reducers and their source transforms are unchanged.

## Power Paths

The two upper loops are open, same-sense, 1:1 **round friction belts**, not
timing belts. Each solid contains exact straight common tangents and circular
arcs with a swept 6 mm circular section. Neither is the former triangular path.

```text
Power path, NOT a shared belt plane:

  rear shaft == rear loop == middle shaft == front loop == front shaft
      X=-328                    two pulleys                  X=-313

  Each loop has one grooved, free-running adjustment idler.
  Front belt + idler + brackets rotate with the floating arm about middle.
  Both middle pulleys stay on the middle shaft, not on the floating arm.
  All other transmission parts follow pickup fold.
  Kicker: NOT CONNECTED; reverse drive remains missing.
```

| Dimension | Middle/front loop | Middle/rear loop |
| --- | ---: | ---: |
| Shaft center distance | 160.704698 | 129.437243 |
| Belt plane X | -313 | -328 |
| Drive pulley pitch radius | 18 | 18 |
| Zero-idler path length | 434.506732 | 371.971822 |
| Installed path at modeled setting | 437.506732 | 374.971822 |
| Geometric take-up at modeled setting | 3 | 3 |
| Setup take-up range | 2 to 4 | 2 to 4 |
| Drive-pulley wraps, degrees | 186.235 / 201.827 | 192.827 / 192.827 |
| Idler wrap, degrees | 28.062 | 25.655 |

The current coordinate difference (125,101) gives 160.704698, not the 160.64
stated in the brief. Coordinates were not changed to force the rounded value.
Floating rotation cannot change that center distance. The front idler is 75%
along the center span to clear the existing stops; the rear idler is at 50%.

The installed length is not an approved cord cut length. Taking the zero-idler
path as a provisional unstretched circumference gives geometric elongation of
0.69% front / 0.81% rear at the modeled setting. Supplier elastic properties,
splice shrinkage, allowable elongation, traction and creep remain unknown.
The release end of each slot clears an un-deflected cord centerline by 1 mm.
There is no spring or active tension-compensation requirement for front float.

## Machining Details

These dimensioned sections are schematic, not to scale. Numeric coordinates
and complete B-reps are in the helper/report; tolerance and strength approval
are still required. All supports are flat 6 mm router plates, no precision bends.

**Four identical drive pulleys: turn OD42 x 12.**

```text
AXIAL SECTION THROUGH OUTSIDE GROOVE (symmetric about axial zero)

             axial -6      -3.05      +3.05       +6
outer R21       +-----------+           +-----------+
                           |           |  opened mouth
pitch R18                  |           |  width 6.10
                            \         /
                             \_______/   bottom R3.05
root R14.95

THROUGH BORE: AF12.8 hex; six R1.5 router corner reliefs.
Relief centers: radius 12.8/sqrt(3), at 0,60,...,300 degrees.
Groove mouth is opened from R18 to OD; a closed torus cut alone
interfered with departing tangent runs and is NOT the final geometry.
```

The shortened pulley leaves 2.95 mm axial material on each groove side.
Hex flats transmit torque; the round spacer tubes do not. Router reliefs are
modeled cuts, not sharp, unmachinable internal hex corners.

**Two idlers: turn OD52 x 12.7, through bore 28.57.** Groove pitch R23,
bottom R3.05, open 6.1 wide mouth to OD; root radius 19.95. Each wheel traps
two opposed authentic WCP-0783 bearing flanges. No invented small bearing,
sprocket or timing-belt asset is used. Bearing source journal OD is 28.5496;
nominal diametral seat clearance is 0.0204, not a qualified fit.

```text
IDLER AXIAL STACK, coordinate relative to belt plane X

 -22 -17 -16      -10 -7.9375 -6.35       0       +6.35 +7.9375 +10       +16 +17 +22
  head |washer|plate|sleeve|flange|bearing =><= bearing|flange|gap+sleeve|plate|washer|head
                    2.0625                  right sleeve 1.8625 + 0.20 free gap

 Wheel: -6.35 to +6.35. Two bearing inner end faces meet at zero.
 Axle: AF12.7 center section -10 to +10; turned OD8 ends, length6 each.
 Overall axle length32. Each end: drill4.2 x12 deep, tap M5 for 11 engagement.
 End screws M5x12, custom/nominal OD19 ID5.5 x1 washers, 4 mm hex-key sockets.
```

The axle's turned journals run in paired 8.2-wide slots. Loosen both end
screws, slide the axle, and clamp. Slots and screw sockets are actual cuts.
Clamping torque, slot slip resistance and bearing-seat life are not qualified.
The bearing outside races/flanges retain the wheel; end sleeves contact only
the inner races. Retention must not remove the specified axial float.

**Idler brackets:** two identical plates per loop, at belt plane +/-13.
Plate inner faces are +/-10, outer faces +/-16. The roller-shaft clearance
hole is diameter26. Two diameter5.5 anchors are at support-roller YZ offsets
(-20,+20) and (+20,-20). Use two M5x65 through screws and nuts per loop.
Between paired plates use OD10 ID5.5 x20 sleeves. Inboard mounting sleeves
are length14 front / length13 rear, same OD10 ID5.5. Head washers are x1.

| Bracket feature, world YZ | Front loop | Rear loop |
| --- | --- | --- |
| Support roller axis | (-261,161) | (-9,287) |
| Slot release endpoint | (-203.353759,153.581384) | (-80.612039,315.709159) |
| Slot 4 mm take-up endpoint | (-213.314791,165.909395) | (-77.372015,299.249837) |
| Modeled axle center, 3 mm take-up | (-212.105331,164.412538) | (-77.775372,301.298889) |
| Slot center travel | 15.849353 | 16.775192 |

The helper generates the full router outlines as connected rounded webs,
including slot-end material and anchor pads. Slot width/end radius is 8.2/4.1.

**Shared left stop bridge:** one 6 mm plate centered at X=-303 replaces two
overlapping left stop supports. Central shaft clearance diameter32 at
YZ=(-136,262); four diameter5.5 holes at +/-20 Y and +/-20 Z about that point.
The two existing diameter8.2 stop holes stay at (-220.299665,251.111176) and
(-175.227063,186.592855). Original M8 stop screws remain. Four M5x25 screws,
four M5 nuts, four 1 mm gap washers and four 1 mm head washers attach the
bridge through the existing cassette/rail holes. Right stop supports are not
changed. Stop impact capacity remains unqualified.

## Upper Roller Capture

All 22 source-specified 12.7-wide hubs keep their actual row centers. New
inter-wheel and end standoffs are **OD19 ID15** tube, saw/turn and finish faces.
The 12.7 AF shaft circumdiameter is 14.664697, giving 0.335303 diametral bore
clearance. OD19 stays below the hard hub OD20 and the observed inner-race
end-face OD19.304. A B-rep annular probe verifies the bearing face contact.

```text
ROLLER AXIAL STACK, left to right

M5 + washer | end sleeve | pulley(s) | sleeve | left INNER race |
 end standoff | hub | inter-hub sleeve | hub ... | end standoff |
 0.20 FREE GAP | right INNER race | sleeves / rear gear stack | washer + M5

The shaft itself fixes end-washer spacing. Tightening an end screw must
not use bearing preload to take up machining error. Trim the final
inboard-right standoff against the measured assembled stack.
```

There are 35 upper-row tubes, listed below from left toward right. Repeated
inter-hub tubes occupy the middle of each row. Targets are nominal geometry,
not independent production tolerances. Confirm 0.20 mm free axial travel
after torquing; no outer-race contact or rubber compression is intended.

| Row | New shaft X ends / length | OD19 ID15 tube cut lengths and quantities |
| --- | --- | --- |
| Front | -329 to +320 / 649 | 10; 22.4125; 96.65; 8 x 30.7125; 96.45; 35.4125 |
| Middle | -344 to +320 / 664 | 10; 3; 6.4125; 112.65; 7 x 36.914286; 112.45; 19.4125 |
| Rear | -344 to +330 / 674 | 10; 21.4125; 112.65; 4 x 74.125; 112.45; 8.16915 |

New shafts preserve the right-end datums and existing M5 end-tap concept.
Each upper shaft has two M5x12 screws and two OD19 ID5.5 x1 end washers.
Effective thread engagement is 11 mm. The rear authentic gear and existing
output-side spacer remain in the continuous stack. All six upper loose
collars are retired; kicker and indexer collars are untouched.

## Inventory And Service

With the current parent pickup interfaces: **114 added instances, 26 removed,
net +88**. Three existing shaft instances receive new custom definitions.
The report computes this from the supplied package, not a fixed BOM total.
Removed definitions remain available, with zero quantity when no other
instance uses them. Whole-robot total quantity is not claimed here.

| Added item group | Quantity |
| --- | ---: |
| Drive pulleys / custom cord loops | 4 / 2 |
| Idler wheels / axles / authentic WCP-0783 assemblies | 2 / 2 / 4 |
| Idler bracket plates / shared stop bridge plate | 4 / 1 |
| Upper capture tubes / idler inner-race sleeves / mount sleeves | 35 / 4 / 8 |
| M5x12 / M5x65 / M5x25 screws | 10 / 4 / 4 |
| M5 nuts / OD19 end washers / OD10 mount washers | 8 / 10 / 12 |

Retired instances: three old pulleys, triangular belt, six upper collars,
six upper end-screw assemblies, eight cassette-screw assemblies and two left
stop supports. Those 14 old screw assemblies each contain a screw AND washer.
Counting those separately gives **net +74 nominal hardware/fabricated items**;
a sourced bearing is counted as one procured assembly, not its internal balls.
This is not claimed to be an optimized minimum-part design. Repeated pulley,
axle, sleeve and fastener definitions are shared; no bent or tension-spring
subassembly was introduced.

Nominal access/clearance dimensions:

- Middle drive-pulley face gap: 3 mm; cord-surface separation: 9 mm.
- Inboard pulley face to shared stop bridge: 1 mm; belt surface to bridge: 4 mm.
- Idler wheel faces to bracket inner faces: 3.65 mm; flange faces: 2.0625 mm.
- Leftmost new screw head: X=-350 exactly, **zero allowance** to a +/-350
  chassis-width boundary. Full stow/rule margins are not approved.
- M5 screws use modeled 4 mm sockets; M5 nuts need an 8 mm wrench. Inboard
  wrench/key access against the complete robot is not proven.

To replace a loop, release its axle clamps and remove its outboard bracket
and axle end hardware as needed. The inboard bracket stays attached. Slide
the loop axially over the flanges after clearing the outboard shaft-end
washer/pulley hardware. A loop cannot pass through an installed bracket or
end washer. Restoring tension requires measured setup, not a fixed torque
number. Wheel replacement requires withdrawing the shaft toward the left
after removing left retention, pulleys and sleeves; provide at least the
649/664/674 mm shaft length as conservative extraction space or remove the
pickup module. This is not an in-place split-wheel service claim.

## Evidence And Exact Remainder

Run only this bounded suite, using the existing CadQuery environment:

```powershell
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B 'designs/coral-intake-v1/test_transmission.py' -v
```

Final routine result: **12 tests PASS, 15.491 s** test-run time. The fixture
builds only the transmission interfaces, real cached bearings/rear gear,
nominal source-dimensioned hub gauges and nearby stop/cassette geometry. It
does not invoke `build()`, the full integration suite, exports or report writers.
Tests cover valid closed solids, exact tangent lengths/take-up, stack lengths,
inner-race seating, float endpoints, structural clearances and parent clocking.
Nominal screw major cylinders intentionally overlap modeled tap-drill bores;
thread-overlap volume is checked analytically, not called a zero-clash fit.

A one-time broader pairwise audit of new parts against that same local fixture
also passed; its 44.931 s suite was narrowed to the routine structural and
representative-thread checks to meet the fast-test requirement. No continuous
motion, complete robot collision, strength, guarding, belt-load or service-access
pass is implied. Actual vendor star profiles are not rebuilt in this fixture.

Remaining, explicitly **not implemented or resolved**:

1. Kicker opposite drive: no extra parallel shaft, 60T/60T pair or kicker loop.
   No collision-free supported layout was established within the current width;
   this is not proof that one is impossible. No crossed belt, fabricated COTS
   gear or hand-generated sprocket profile substitutes for it.
2. Kicker core/hub torque attachment and sleeve attachment: the existing
   unresolved hubs remain; no radial M4 tap, pin or retained sleeve was added.
3. Fold-positive hex hub/flange and four-M5 rail coupling: not added. Existing
   static assembly clocking is not a positive rotating joint. Split stubs remain;
   no new full-width shaft enters the coral corridor.
4. Existing 5:1 fold reduction torque deficiency: unchanged, not excused by the
   successful static source-gear fit.
5. Cord supplier, material comparison, weld process, cut length, pretension
   force, friction, heat/creep, loaded slip and life tests. A 30 A starting current
   limit is only a test precaution, not torque or performance qualification.
6. Full parent integration/sweep, strength and fatigue, tolerances/end-float,
   screw locking/torques, bearing seat retention under load, guards, wrench
   access and manufacturing release. Original right-side stop/support issues,
   if found by the parent, are outside this left-side transmission repair.