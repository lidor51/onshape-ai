# Packet V2 Local Result

2026-09-12. **LOCAL GEOMETRY PASS; FULL ADMISSION BLOCKED; BUILD UNVERIFIED;
AUTHENTIC COTS PENDING.** This is the completed single authorized v2 local
repair attempt, not a mechanically released mechanism or permission to upload.

Only `trials/subsystem-ab/shared` was written. No browser, authentication,
credentials, API calls, delegates, installations, commits or sibling-arm reads
were used. The parent COTS manifest has not been read. Its eventual binding is
a separate gate and must not be inferred from the local geometry result.

## Geometry Repair

The v1 implementation and its sealed failure evidence remain unchanged.
[Preservation checks](v1-preservation.json) verify all 84 v1 artifact hashes and
six original source hashes. The changes are additive modules outside the seal.

- The small pickup guard has a 23 mm inside radius. The standoff outer reach
  is 17.4625 + 4.5 = 21.9625 mm: measured clearance is 1.0375 mm, with zero
  solid overlap. No standoff or guard collision exclusion was introduced.
- The ramp retains its full 390 mm width and existing foot positions. Its
  entry top is lowered from Z=388 to Z=320 mm. The nearest profile point is
  102 mm from the pivot axis, versus the motor envelope's maximum radial reach
  of 94.82 mm. This gives a 7.18 mm conservative radial separation for that
  specific pair; it is not a continuous whole-mechanism clearance proof.
- The ramp is flat polycarbonate with attached blocks, not a bent metal part.
  The bumper remains a complete unnotched ring. The 120 mm belt-crest-to-ramp
  gravity drop and subsequent coral capture are physically UNVERIFIED.
- Receiver, pivot, bumper, cradle and chassis reference geometry are unchanged
  from v1. Deployment limits remain -145..0 degrees. Width revision remains
  500 -> 520 mm, with the same receiver-height control and UI parameter map.

## Completed Checks

| Check | Result |
| --- | --- |
| Baseline and revision full sweeps | PASS, 31 poses each, 5-degree grid plus exact -72.5-degree midpoint |
| All-pairs coverage | 1,176 pairs per pose across 49 solids; zero unexpected clashes |
| Existing semantic exclusions | Original six unchanged; one explicitly declared new 16:128 gear mesh only |
| Solids and declared bores | PASS for both variants; 28 valid, closed, single-solid neutral parts each |
| STEP exports and round trips | PASS, 56 individual parts plus six full-mechanism assemblies = 62 STEP files |
| Previews | Six nonblank B-rep-derived PNGs; baseline deployed and stowed visually inspected |
| Regression tests | 13 passed, zero failures/errors/skips before seal |
| Width revision and receiver independence | PASS locally; geometry, instance/mate frames and fixed datums checked |
| Native FeatureScript compilation and UI operation | UNVERIFIED, no live execution |
| Native mates and gear-relation execution | UNVERIFIED, local contract only |
| Build and conservative instance budget | BLOCKED independently of COTS |
| Authentic COTS | PENDING_PARENT_MANIFEST |

The unchanged v1 all-pairs checker performs bounding-box rejection and caches
same-motion pairs. The new gear exclusion was defined before the full test;
neither unexpected v1 collision is excluded. Sweep duration was 27.239 seconds;
the completed export/round-trip/render phase took 60.742 seconds. Earlier
interrupted processes are not counted as successful checks.

## Deployment Drive

The opaque assumed motor/reducer envelope was removed. The new local layout is
an X44 envelope driving a 16:128 stage at 91.44 mm centers, then the existing
16:96 stage at 71.12 mm centers: total 48:1. See the complete
[dimensioned drive and load screen](deployment-drive.json).

The first-stage plane is X=-318 mm and final-stage plane X=-281 mm. Two bearing
centers at X=-333/-307 mm support a 64 mm hex shaft. The left tower includes
two flat 6 mm gearbox cheeks, four turned spacers and a bridge. The compound
shaft module explicitly contains separate 128t gear, hex shaft and 16t pinion
physical items; it is not an unexplained gearbox box or a monolithic stock part.

At the parent-referenced 22.5 N m output load, assuming 0.9 efficiency per stage,
the calculated motor input is 0.5787 N m, compound torque 4.1667 N m and final
mesh tangential force 369.09 N. These are NOT impact, jam or motor-stall ratings.
The tangential-load-only shaft screen is not a material/fatigue/bearing approval.

**Concrete unfinished build defects:** gears are still addendum envelopes, not
manufacturable involute teeth; 16t/14.5-degree tooth undercut/profile is unresolved.
Gear/shaft grades, hub joints, bearing ratings, fits, axial retention, cheek
fasteners, hard stops and powered-off retention are unverified. The no-bend
plate/spacer/shaft route is dimensioned, but an actually build-ready in-house
gear stage was NOT completed. Status remains `UNVERIFIED_BUILD`.

**Concrete budget defect:** the full native target has 48 instances excluding
diagnostic coral, three above the conservative 45-instance limit. Excluding
chassis, bumper and receiver references gives 45 mechanism instances, but that
different count is not used to manufacture a full budget PASS. Rigid module
physical item and fastener counts are higher still; the [BOM](bom.json) says so.

## Frozen Deliverables

- [Freeze manifest](freeze.json), [I/O and neutral-frame hash contract](io-contract.json).
- [Source FeatureScript candidate](source/concept-a.fs), [neutral recipes and layout offsets](source/geometry-payload.json).
- [Assembly graph and mate contract](assembly-contract.json), [UI edit map](ui-edit-map.json).
- [Full validation](validation.json), [revision report](revision-report.json), [test result](tests.json).
- [Baseline deployed STEP](baseline/deployed.step), [preview](baseline/deployed.png).
- [Baseline midpoint STEP](baseline/mid.step), [stowed STEP](baseline/stowed.step), [stowed preview](baseline/stowed.png).
- [Revision deployed STEP](revision/deployed.step), [preview](revision/deployed.png), [midpoint STEP](revision/mid.step), [stowed STEP](revision/stowed.step).
- [All neutral STEP hashes, measurements and pose matrices](expected.json).
- [Admission result](admission.json), [separate pending COTS bindings](cots-bindings-pending.json).

Source, parameters, recipes, UI map, neutral STEP bytes and pose/mate frames are
hashed. Subtract each fixed Part Studio layout offset before applying its
neutral-to-world matrix; translations are millimeters. No scale, mirror,
delete/reinsert identity trick, or static compound counts as native assembly.
Generated FeatureScript uses the inherited 3070 version and unchanged UI inputs;
its regeneration matches the frozen source exactly, but compilation is untested.

## Final Admission

Admission is **BLOCKED**, even before authentic COTS is considered. The geometry
is a provisional evaluation candidate only, not an admitted full assembly.
No colliding geometry or claimed build-ready gearbox is being handed to a live
arm. The independent COTS gate remains PENDING, not failed or silently passed.

Recheck from the repository root, using the existing local interpreter:

```powershell
& '.\trials\manufacturing-package\.venv\Scripts\python.exe' -u -B '.\trials\subsystem-ab\shared\v2_test.py'
& '.\trials\manufacturing-package\.venv\Scripts\python.exe' -u -B '.\trials\subsystem-ab\shared\v2_test.py' --admission
```

The second command must return BLOCKED with exit code 2 and zero API calls.
Post-seal tests write outside the immutable packet to `../tests-v2.json`.
Neither v1 nor v2 may be overwritten by the generators after sealing.