# Motor Functions And Gearbox Direction

2026-09-19. The current assembly has four X44 motors. The viewer's Motor menu
selects the actual motor body and highlights it in blue without hiding the rest
of the mechanism. [Open the current CAD](final-frame-output/revision-clearance/index.html).
The mapping is checked against the exported manifest by
[motor-roles.test.mjs](motor-roles.test.mjs).

| Viewer selection | Function | Current reduction | Motor attachment datum height |
| --- | --- | --- | ---: |
| 1 / Deployment | Folds the intake frame through its independent cheek flange | 48.214:1 | 424.9 mm |
| 2 / Pickup Rollers | All three upper star rows AND the lower counter-rotating kicker | 10:1 stars; 4.167:1 kicker | 454.5 mm |
| 3 / Left Indexer | Three vertical shafts in the left orientation bank | 5:1 | 125.15 mm |
| 4 / Right Indexer | Three vertical shafts in the right orientation bank | 5:1 | 125.15 mm |

Ratios above describe operation with the positioning frame stationary. These
heights are attachment datums, not measured centers of mass. No separate motor
drives only the lower kicker. No motor is assigned both the star-roller drive
and deployment as its two intended outputs. The holding tray/stop is passive;
a scoring receiver motor is not present in this assembly.

The rear roller shaft and deployment joint share an axis, not a keyed connection.
The pickup motor rotates the rear hex shaft; belts drive the upper rows and a
reversing gear/belt branch drives the kicker. The deployment motor rotates a
separate annular adapter bolted to the cheek, free around the powered rear shaft.

There is a real kinematic coupling: the reversing gear carrier folds with the
frame. Folding can induce kicker rotation even with a stationary rear shaft.
Separate motors therefore do not imply completely independent output speeds
during folding. A controller must coordinate this, or a redesigned transmission
must remove the coupling; simply disabling a motor does not prove no roller
motion. This is not yet a validated control strategy.

## Recommended Packaging

Continue without a blocking user choice: compare a **low, chassis-mounted
planetary plus supported final belt/chain stage** against a compact in-house
reducer for the deployment and pickup drives. Retain the four motor functions
and the single positioning pivot during that comparison. Keep the low indexer
motors initially; no reason has been established to move them upward.

The current high deployment and pickup reducers were clearance repairs, not
mass-optimal architecture. A candidate axis-height band of roughly 80..150 mm
near the side-rail/support bases is a packaging target, not a cleared location.
It must preserve ground clearance, frame containment, indexer space, motor-end
service access, wiring, chain/belt alignment, guards and structural support.
Mount heavy assemblies at the chassis, with bearing-supported transmission up
to the pivot. Do not hang the final chain load on a long gearbox output shaft.

A planetary can reduce the side-view gearbox area and custom carrier/shaft count,
but motor-plus-cartridge axial length can consume the robot's interior width.
A supported remote stage is still needed to reach the pivot and carry radial
loads. Compare complete installed assemblies, including shafts, bearings,
spacers, tensioning, fasteners and guards, rather than bare gear or housing size.

Lowering a given mass lowers the robot center of mass, but no whole-robot CoG
change is claimed without actual masses and a complete mass model. Extra drive
length/support/guards may offset part of the gain. The existing physical CAD
and its starting-envelope result are unchanged by this recommendation.

## Manufacturer Facts Checked

The following are current public manufacturer observations, not confirmation
of availability during the 2025 game season or an approved installed package.

- [REV-21-2146 Universal Input Stage V2](https://www.revrobotics.com/rev-21-2146/)
  explicitly lists Kraken X44 and X60 support and the 1.375-inch mounting circle.
  The stated stage length is 19.1 mm, tab thickness 6.4 mm, mass 57 g. This is the
  specific V2 input; do not assume the old input supplied in a base kit is identical.
- [REV-21-2138 15T input coupler](https://www.revrobotics.com/maxplanetary-input-couplers/)
  is documented for the 8 mm SplineXS interface. The 14T Falcon coupler is different.
  Verify source CAD/drawings for pilot, axial engagement, shaft-tip clearance,
  fasteners and selected cartridge stack before installing the X44.
- [MAXPlanetary system](https://www.revrobotics.com/rev-21-2100/) publishes a
  nominal 50.8 x 61.925 mm housing cross-section and 63.5 mm two-reduction-stage
  gearbox length, excluding the motor. Recheck the actual V2/selected assembly
  CAD rather than treating this catalog envelope as complete installed dimensions.
- [Current load guidance](https://docs.revrobotics.com/ion-build/motion/maxplanetary-system/load-ratings.md)
  distinguishes static torque tests, allowed stage combinations and current
  assumptions. Shock and cantilever loads reduce capability. Specific stack
  approval has not been established here; the configuration tables are images
  and were not used to approve a ratio. The 2:1 cartridge reverses output direction.
- [REV-21-2131 brake cartridge](https://www.revrobotics.com/rev-21-2131/) offers
  unpowered holding, but REV says it is not recommended for high moments of
  inertia such as long lever arms. It is **not automatically selected** as this
  intake's stow hold or impact protection. Stops, service restraint and impact
  load paths still need their own engineering.

The appropriate next hardware decision is the complete low-mounted installation,
not a blanket replacement of every spur stage with a planetary. Procurement,
ratio selection, mass reduction and durability have not been approved by this note.