# V5: Finite Layout No-Fit

**2026-09-13. NOT A FINISHED LOCAL CAD DEMONSTRATOR. NOT FROZEN.**

This independent candidate stops before hardware detail because required geometry
fails. V4 remains untouched. The contact-first work establishes a narrowly feasible
crosswise core, not arbitrary-entry acquisition or a buildable powered assembly.
The authoritative combined result is [decision.json](decision.json); earlier
`PASS_MODELED_CORE_ONLY` results cover only their explicitly named probes.

## Candidate And Datums

Concept A division is retained: deployable pickup, fixed independently driven
orienter banks, retained cradle and rough receiver. Binder pages 7, 9 and 11 and
the previous V4 side image were actually viewed. No new vendor CAD was downloaded.

| Parameter | Baseline | Revision |
| --- | ---: | ---: |
| Mouth width | 500 mm | 520 mm |
| Upper pickup axes | 5 | 5 |
| Custom rubbered tube OD / hard core OD | 127 / 80 mm | 127 / 80 mm |
| Front float range, modeled kinematically | 0..30 mm | 0..24 mm |
| Required front float for tested crosswise path | 16.7497 mm | 16.7497 mm |
| Fixed orienter | Three vertical stations per side | Same |
| Ramp toe Y/Z; crest Y/Z | -350/0; -110/180 mm | Same |
| Pivot Y/Z; stow rotation | 180/210 mm; -95 degrees | Same |
| Receiver coral center X/Y/Z | 0/465/237.15 mm | Same |
| Sampled maximum forward extension | 451.962 mm | 451.962 mm |

Chassis: 700 x 760 mm, front Y=0. Unbroken front bumper: Y=-85..0,
Z=45..165 mm. Nominal CORAL: OD114.3, ID101.6, length301.625 mm.
2025 rule source is the existing audited `research/2025-coral/rules.json`:
2920 mm assumed chassis perimeter versus 3048 mm maximum, 457.2 mm extension,
1066.8 mm starting height. This is not an all-rules or inspection approval.

The upper rollers alternate half-width banks, with 10 mm axial separation:
Y/Z=(-387,169), (-308,243.750), (-240,294.750), (-171,338.465),
(-77,349.800) mm. Only the first roller floats. This is NOT five full-width
rollers; that distinction is essential to the contact-spacing result.
Orienter centers are X=+/-180 at Y30, +/-130 at Y165, +/-85.15 at Y305 mm;
custom outer radius35, shaft radius12.7, height140 mm.

## What Passed

- The center path is the exact upper support envelope of the finite cylinder over
  the floor and two connected flat guide surfaces, not interpolation between poses.
  The mitered ramp toe is the only tapered end; no precision bend is required.
- At centered, horizontal, crosswise yaw90 only: sampled upper/guide contact from
  Y=-432 through the fixed entry-bank overlap, no 120 mm drop and no lost drive
  samples. Rubber indentation up to8 mm is an assumption, not measured compliance.
- Both variants have42 separate closed, valid BRep occurrences, 33 non-reference.
  Each ran126 deployment/float states, five63-sample entry probes, 136 searched
  yaw-route states, and63 receiver approach/lift states: 640 states per variant.
- All modeled pairs are visited. AABB rejection and relative-pose caching avoid
  repeated Booleans; no hardware/category blanket exclusion is used. Only actual
  coral/rubber intersections are compared against an explicit8 mm radial envelope.
- Centered crosswise entry, deployment, the searched plan yaw route and two-finger
  receiver clearance have zero unexpected intersections. Yaw search includes reverse
  translation and inter-state checks; it is NOT proof that motors can execute it.
- Custom-only STEP exports and ten PNGs use real BRep tessellation and a per-pixel
  VTK depth buffer. Original COTS are hashed, never reexported or replaced.

## Why It Does Not Fit

For equal, full-width upper rollers over a flat guide, let coral radius be r,
roller radius R and allowed indentation c. Continuous loaded contact requires:

$$p \le 2\sqrt{(r+R)^2-(r+R-c)^2}=86.404\text{ mm}.$$

Nonintersecting127 mm full-width rollers require p>=127 mm. There is no pitch
that satisfies both at c=8 mm. Under this restricted construction the maximum
roller diameter would be76.478 mm. Staggering banks solves roller overlap, but
does not solve the skewed-cylinder clearance problem.

For a horizontal finite cylinder on the ramp, the support offset is:

$$H(\alpha)=m\frac{L}{2}|\cos\alpha|+r\sqrt{1+m^2\sin^2\alpha},\qquad m=0.75.$$

The side model handles guide endpoints explicitly. Finite BRep tests reject all
tested noncrosswise entries, including only15 degrees away from crosswise:

| Yaw from +Y | First fixed hard-tube witness | Coral center Y/Z, mm | Intersection, mm3 |
| --- | --- | --- | ---: |
| 0 degrees | Pickup2 tube | -376.258 / 150.566 | 704.987 |
| 30 degrees | Pickup2 tube | -362.323 / 149.750 | 1691.940 |
| 60 degrees | Pickup2 tube | -320.516 / 146.815 | 13.872 |
| 75 degrees | Pickup2 tube | -278.710 / 153.313 | 203.800 |

These witnesses cannot be repaired by increasing front-roller travel: pickup2 is
fixed. No nonzero entry-angle or lateral tolerance is certified. The assumed
horizontal-on-guide trajectory excludes free pitching; this is a finite no-fit
result for this candidate, not an impossibility claim about Concept A.

The separate63-sample front-tab closure test also fails: 48 tab/coral intersections
despite clear open/closed endpoints. A flexible label is not a collision waiver.
The receiver clearance result must not be mistaken for complete retention success.

## Scope And Artifacts

The full dual-variant BRep run took511.808 seconds, below its600-second bound.
One contact-geometry repair added the missing entry-bank handoff overlap. The later
boundary probe changed no geometry. No iterative hardware repair loop was started.

Actual endblocks, bolted support plates/towers, bearings, hard stops, spring hardware,
full physical BOM, motors and closed transmissions are intentionally absent because
the required layout gate failed. No bolts, reducer, motor shaft or mate is invented
to imply otherwise. There is no frozen FeatureScript/native packet or COTS placement.
The four original vendor files remain available with exact hashes; the X44 body
includes its presentation output shaft and its rear cover remains a fixed body.

Spring rate, friction, contact dynamics, thermal/duty limits, strength, anti-bounce
behavior and complete legality remain UNVERIFIED separately from these CAD failures.
Zero API/browser calls, environment changes, installs, new downloads, other agents,
commits or edits outside V5 were made. Native API grounding remains outside scope.

- [Baseline deployed](baseline/deployed.png), [side](baseline/side.png), [plan](baseline/plan.png), [stowed](baseline/stowed.png).
- [Revision deployed](revision/deployed.png), [revision receiver probe](revision/receiver-probe.png).
- [Baseline custom contact core STEP](baseline/contact-core.step), [revision STEP](revision/contact-core.step).
- [Contact samples](contact-report.json), [baseline BRep](baseline-brep.json), [boundary witnesses](boundary-report.json).
- [Original COTS manifest](original-cots-manifest.json), [baseline component inventory](baseline/component-inventory.json).

Reproduce from the repository root:

```powershell
node trials/subsystem-ab/shared/v5/layout.test.mjs
node trials/subsystem-ab/shared/v5/coarse.test.mjs
node trials/subsystem-ab/shared/v5/run.mjs geometry.py
node trials/subsystem-ab/shared/v5/run.mjs geometry.py --boundary
node trials/subsystem-ab/shared/v5/decision.mjs
node --test trials/subsystem-ab/shared/v5/decision.test.mjs
```

The boundary and decision commands intentionally exit1 for the measured rejection.
The regression tests verify evidence integrity and truthful rejection, not successful
completion of the requested demonstrator. Do not admit this packet to native API or
manufacture it as a finished mechanism.