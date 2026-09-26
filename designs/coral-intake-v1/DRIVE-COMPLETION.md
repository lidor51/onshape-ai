# Drive Completion: Isolated Geometry Slice

Status: **NOT RELEASED. Partial mechanical completion, not a functioning or approved robot.**

Only [drive_completion.py](drive_completion.py), [test_drive_completion.py](test_drive_completion.py), and this document are owned by this task. No parent builder, transmission, settings, validator, source original, export, network/API, credential, or running parent process was changed.

## Integration Contract

The parent must explicitly call the extension before clocking. The existing `build()` already clocks outputs and is not a suitable input.

```python
package = Package(settings)
build_pickup(package)
build_indexer(package)
build_dock(package)
add_transmission(package)
add_drive_completion(package)
clock_outputs(package, degrees=3)
```

`add_drive_completion` returns the same package and is idempotent. It requires the unclocked transmission package, X290 rails, 6 mm plates, and existing verified WCP-0121/WCP-0783 bindings. It modifies definitions, instances, holes, joints, hardware counts, belt and gear inventories in memory; it does not export anything. The rear transmission capture record is refreshed because its shaft, spacer stack, and ends are replaced. Transmission's original net-delta inventory remains a record of that earlier operation, not the final assembly inventory.

The extension uses the parent's cached `Package.vendor` imports. Six source products remain six; there are no downloads or new claimed COTS products. Fasteners are explicitly nominal hardware B-reps, not authenticated vendor assets. Custom round cord is not a timing belt.

## Added Power Paths

The same pickup X44 drives the existing 12:60 stage and upper rows. Two additional authentic WCP-0121 60T hex gears take power from the rear shaft and reverse a new shaft 1:1. The new shaft drives the kicker through one tensioned round-cord loop. Kicker surface speed is nominally `51/127 = 0.401574803` of the upper roller surface speed, in the opposite rotational sense, before slip. Adequate acquisition speed/force is unproven.

The middle-minus-76.2 mm candidate was rejected because the existing floating stop is too near its bearing location. The implemented reversal picks up from the rear shaft. It adds no motor and no SplineXS-to-hex assumption.

| Item | Geometry, mm |
| --- | --- |
| Pickoff gear center, YZ | `(-9, 287)` |
| Reversal gear/shaft center, YZ | `(-85.2, 287)` |
| 60:60 center distance | `76.2` |
| Both gear midplanes, X | `334` |
| Reversal shaft ends, X | `274, 342` |
| Reversal bearing flange seats, X | `277, 299`, opposed, spacing `22` |
| Gear overhang beyond outboard bearing seat | `35`, load unqualified |
| Kicker shaft ends, X | `-305, 326` |
| Rear shaft ends, X | `-344, 342` |
| Maximum new right end-screw extent, X | `348`, nominal 2 mm inside frame |

The rear-right cassette becomes a 6 mm extended bearing carrier. A second small inboard carrier bolts to two existing rear cassette holes on the 40 mm square pattern, using two M5x22 screws, two 4 mm spacers, and washers. A new OD32 aperture in the right rail clears the reversal shaft. The inner carrier has tapped M5 holes; thread stripping, bearing fits, rail ligaments, and cantilever load are not qualified.

### Clocking

The actual source gears have zero static B-rep intersection at final absolute phases **3 degrees pickoff / 0 degrees reversal**. The incorrect 3/3 combination intersects by **119.372832 mm3**. Reversal shaft, gear, pulley, bearings, and axial hardware therefore receive -3 degrees before the parent's +3-degree clock. Source normalization is unchanged. This proves one static phase, not continuous tooth contact, backlash, or durability.

### Kicker Loop

| Item | Value |
| --- | --- |
| Pulley centers, YZ | `(-85.2, 287)`, `(-140, 34)` |
| Pulley/belt plane, X | `316` |
| Pulley pitch radius / cord diameter | `18 / 6` mm |
| Constant center distance | `258.866838355167` mm |
| Idler center, YZ | `(-103.982018081935, 79.172421307866)` |
| Released idler center, YZ | `(-87.991868584183, 75.708942286218)` |
| Maximum-take-up idler center, YZ | `(-106.259763782716, 79.665782827244)` |
| Idler span fraction / pitch radius | `0.8 / 23` mm |
| Neutral / installed path length | `630.831012239566 / 633.831012239566` mm |
| Installed take-up / modeled range | `3 / 0..4` mm |
| Driven pulley wrap | `184.273539508347 / 198.861941300765` degrees |
| Idler wrap | `23.135480809112` degrees |

The idler uses two actual WCP-0783 bearings, an axially retained turned axle, two compact 6 mm slotted plates, and actual nominal mounting screws, nuts, washers and spacers. Its two mounting bolts use the lower kick-cassette holes; the upper-hole trial intersected the belt and was rejected. The lower bracket nominally reaches Z5: **zero floor-clearance reserve**, not a practical clearance approval. Belt length is installed geometry, not a released cut length. Preload, weld loss, creep, traction, alignment tolerance and guarding remain unqualified.

Two transverse M4x30 screws with nuts and washers pass through the kicker tube, hex hubs and hex shaft at X +/-172. They provide a positive shaft-to-hub-to-core torque path rather than relying on a smooth cylindrical fit. The tube, hubs and shaft have actual 4.5 mm through-holes; the sleeve has OD10 access holes. Cross-pin fatigue, wheel balance and assembly tolerance are unqualified. **The compliant sleeve still needs a qualified bond or positive attachment to the driven core.**

## Capture and Fold

All six indexer shafts become AF12.7 x192, Z82..274, with M5 end taps, end washers/screws, OD19/ID15 spacers and one 0.20 mm axial float at the upper inner race. The three adjacent 25.4 mm source wheels are captured as one stack. Source output bearings and gears are included on the driven station of each bank. Existing loose collars and output spacers are removed. Open-groove, relieved-hex pulleys replace the original pulleys. The two original triangular indexer belts retain their original centers and **still lack qualified adjustable tensioners**.

The rear, reversal and kicker shaft stacks also close with 0.20 mm float. OD19 spacers are checked against actual inner-race and source hub faces, not the outer race. Bearings, fits and loaded axial retention are not approved.

Two flat 6 mm fold flanges use relieved AF12.8 bores and four tapped M5 holes each on the existing 40 mm square pattern. Eight M5x18 screws engage 5 mm into the flanges. Both bores are clocked 3 degrees because the parent's coaxial-output clock also rotates the left stub. The right flange has an R27 motor relief. Both stubs and existing right output gear/spacer/end follow the imposed fold pose; the flange has a real positive hex-to-bolted-rail path.

**This does not solve fold torque or holding.** The 5:1 drive is unchanged. No spring, ratchet, latch, counterbalance force, moving mass, CG or adequate continuous motor torque is invented. Stub axial retention, existing support duplication/overlap, native joints and rotating gearbox contact remain unresolved. A stalled motor is not a hold mechanism.

## Inventory

Relative to `add_transmission` output at this task's starting contract:

- **157 added instances, 58 removed, net +99**, with 20 existing instances redefined.
- **59 new definitions: 52 custom and 7 nominal-hardware definitions.** One intermediate custom shaft blank has zero final instances; 51 new custom definitions are used.
- Vendor additions are **2 WCP-0121 gears and 4 WCP-0783 bearings**, reused from existing source definitions.
- Combined with the transmission's original +88, the net is **+187 relative to the unextended parent model**. No full-model total is claimed from a reduced fixture.
- The transmission's inherited extreme remains **X=-350**, with zero nominal width reserve. Its helper has no public placement configuration; this task did not edit it. Stow/tolerance failure remains possible.

The exact instance IDs, definition quantities, removed IDs and redefined IDs are available in `package.drive_completion`.

## Verification and Blockers

Run the owned test file using the existing manufacturing-package Python environment, with `-I -B`. It performs no exports and uses one cached-source fixture, not the full assembly validator. The fixture contains actual six-product vendor B-reps, actual indexer construction, representative upper source hubs, right-side neighbors, and the changed parts. It omits complete compliant upper stars, full floating-arm geometry, complete frame/dock geometry and full motion collision testing.

After two geometry repair passes: **9/9 focused tests passed**. The measured test phase took **214.386 seconds**, excluding the pre-test fixture build. Checks cover static gear phase and a deliberately wrong-phase witness, hex fits, valid closed B-reps, source inventory preservation, all nine capture stacks, constant-center fold samples, fold-flange fit, width, and changed-body static pairs. The final metadata/inventory check also verifies single-solid flat parts, refreshed hole records and current rear-stack metadata; it is rerun separately without another collision sweep.

**Static slice clearance remains FAIL:** 447 overlapping-AABB candidate pairs were checked by B-rep intersection, with zero new/worsened collisions but these eight inherited interferences. The regression test compares the original fixture solids; it does not waive these as acceptable contacts.

| Interference | Final volume, mm3 | Original volume, mm3 |
| --- | ---: | ---: |
| Rear-right cassette / pickup X44 | 562.412674 | 562.412674 |
| Right rail / pickup X44 | 9521.432584 | 9521.432584 |
| Right rail / fold X44 | 2184.063351 | 2184.063351 |
| Right rail / floating stop R0 | 301.592895 | 301.592895 |
| Fold drive mount / each of four right fold screws | 85.777222 each | 113.490035 each |

Nominal tap-drill overlap is separately checked against analytical thread-annulus volumes, not blanket-excluded. Clearance PASS is not inferred from a green software test run. The parent must integrate and validate the full model; it may have changed since this fixture was authored. No full fold/floating sweep, contact transport, reliability, physical torque, manufacturing, rules or safety approval is claimed.