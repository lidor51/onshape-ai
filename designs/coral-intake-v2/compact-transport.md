# Deployed Transport Gate

**Decision: BLOCKED for the nominal under-row, over-bumper channel.** This is a local functional rejection, not another clearance report and not proof that every possible pitched or rotated trajectory is impossible. The single deployment pivot is retained. Changing its Z or stow angle does not change these fold=0 roller centers.

## Scope and Reproduction

- Coral: OD 114.3, ID 101.6, length 301.625 mm; X width, +Y into robot, +Z up.
- Read-only inputs: v2 pickup source/report and entry-contact evidence, compact/system drivers, v1 model/parameters. Source SHA-256 receipts are in [compact-transport.json](compact-transport.json).
- Analytic circles/finite-cylinder bounds, with the existing 63.7 mm star radial envelope. No vendor STEP import, network, Onshape, motion animation, CAD mutation or dependency installation.
- Bumper is the specified nominal undeformed keepout, Y=-85..0, Z=45..165 mm. This does not assert that foam is rigid; intentional bumper deformation has not been designed or qualified as a transport surface.
- Run `node --test designs/coral-intake-v2/compact-transport.test.mjs` for software regressions.
- Run `node designs/coral-intake-v2/compact-transport.mjs --write --gate` to regenerate only the allowed JSON and run the functional gate. **Exit 2 is the current engineering rejection**, not a test-runner failure.

## Controlling Facts

| Check | Numeric finding | Decision |
| --- | --- | --- |
| Sideways middle-shaft/bumper throat | Middle Y/Z = -136/262; distance to bumper corner = 109.590. Subtract only the shaft's inscribed radius 6.35: aperture at most 103.240, versus OD 114.3. | 11.060 mm deficit, even with all star rubber omitted. No continuously external under-row path through this local throat without changing geometry or compressing the bumper. |
| Sideways rear crest | Rear Y/Z = -9/289.767. Coral center must reach Z=222.15 over bumper; allowed rear effective radius is only 10.467. | 63.7 mm envelope implies 53.233 mm radial overlap. This is not an approved star deflection. Cached hard hub bounds are radius 10; no fabricated 20 mm-radius hub claim. |
| Flat lengthwise crest | 301.625 mm length spans the 51 mm longitudinal separation from middle shaft to bumper front. Flat vertical aperture is at most 90.650. | 23.650 mm OD deficit. A pitch/yaw transition cannot be presumed from a flat entry witness. |
| Existing lengthwise relay at tray height | Center Z=191; V inner gaps 268.8, 143.8, 108.3. Third-bank earliest center Y=122.369; optimistic rear-row last contact Y=190.038. | 67.670 mm optimistic powered overlap. Do **not** falsely report a dead zone just because the first two banks cannot touch a centered lengthwise pipe. |
| Lower support and receiver | Tray starts Y=230, top Z=133.85; 31.15 below bumper. First longitudinal overlap is center Y=79.1875, not stable support proof. Final pipe ends Y=234.1875..535.8125, 2.1875 before stop. | Endpoint fits do not supply a continuous supporting surface, prove balance, orient the coral or constitute receiver acceptance. |

The annular bore is included as a topology limitation: a centered pipe approaching from outside cannot simply pass a transverse shaft through its sidewall. No pre-threaded pipe, lateral threading action or invented cup motion is assumed.

## Near a Wall

A wall normal to Y that spans the cheek height/width stops the robot at the leading cheek, Y=-353 (the crossmember tube alone would incorrectly give -340). A sideways pipe flush to that wall has center Y=-295.85, Z=57.15. The front star's full circular envelope overlaps by only **2.408 mm**. The cached fixed-phase first-contact witness at Y=-288.15 would require **7.700 mm wall penetration**; the previous no-contact sample is still 3.700 mm beyond the wall-limited position. This does not prove all rotating phases fail, but it does not qualify reliable wall pickup either.

For a flat lengthwise pipe with its front end at the wall, its rear end must remain at or ahead of bumper Y=-85. Thus wall Y must be <= -386.625, **33.625 mm farther away** than the cheek-limited approach. The robot can pull a reachable pipe away from that wall in principle; lift, phase-dependent engagement, compression and uninterrupted extraction remain unresolved. Side-wall/corner cases are outside this gate.

## Smallest Local Corrective Direction

Do not spend another stow/pivot iteration expecting it to repair deployed transport. The first implementable local probe is a revised **flat cheek/arm hole layout** for the middle/rear rows. It requires no accurate metal bending and retains one deployment pivot, the current front/kicker positions and both 155/130 mm upper belt center distances.

Within the checked one-parameter family (rear delta-Y remains 127), the zero-star-deflection boundary is front-to-middle angle 69.186 degrees, middle Y/Z **-205.923/315.233**, rear **-78.923/343.000**. The 10 mm radial-deflection sensitivity gives 60.485 degrees, middle **-184.638/305.233**, rear **-57.638/333.000**. Ten millimeters is a sensitivity assumption, not a permitted compression. These are mathematical boundaries without tolerance reserve, not fabrication dimensions.

**Do not implement that probe as a complete fix:** with rear Y over the bumper, zero-deflection crest clearance requires rear Z >=343 while contact with a tray-height pipe requires rear Z <=311.85. Raising the row therefore loses the existing relay by a 31.15 mm vertical gap. A bolted, cut-sheet supported transition plus a continuously reachable driven contact, or a revised longitudinal rear-row location, must be dimensioned jointly before CAD release. A passive ramp alone does not establish powered continuity. The new regression explicitly rejects calling the crest-only correction a complete transport solution.

Required next acceptance is a single connected, collision-compatible support/contact solution from floor through the corrected crest into the retained V/tray, including the orientation change for sideways coral. No additional deployment DOF is justified by this gate. The current analysis stops at these controlling local constraints; it does not select new hardware or author a fictional coral trajectory.

## Remaining Qualification

Traction, star phase and compressibility, differential rotation/yaw authority, annular end engagement, loading/support reactions, bumper drag, retention, reverse/jam recovery, wear and durability are unresolved. Indexer belt torque/slip and the compact pickup's missing downstream drive are not repaired here. The receiver remains a reference keepout, not a modeled accepting mechanism. Source-phase first-contact evidence, analytic relay overlap and a tray endpoint must not be promoted to a complete functional intake.