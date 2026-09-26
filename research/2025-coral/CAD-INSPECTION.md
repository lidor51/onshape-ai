# Native Reference Inspection And Development Gate

Authorized 2026-09-18: locate and inspect the actual released reference geometry
for 1690, 1778 and 2056, then proceed autonomously with the coral intake and
receiver interface through the digital engineering/manufacturing package where
the checks support it. This supersedes the earlier requirement to stop for a
two-option selection. Relevant other-season references may be used when their
mechanical function and limitations are stated; do not substitute them silently.

## Initial Status

The prior work read first-hand accounts, and selected 2056 binder and drawing
pages. It did **not** inspect any of these three teams' native assemblies. The
previous synthetic geometry failures are not evidence against the reference teams.
Do not call a reference link, drawing image or a synthetic reconstruction native
CAD inspection. Inspection results are recorded below only after actual access.

| Team | Native Inspection | Decision-Critical Evidence |
| --- | --- | --- |
| 1690 | Native hierarchy and selected source meshes inspected | Actual pickup rows/link structures, powered V indexer and vacuum head; motion and contact path not established |
| 1778 | Public document pinned; geometry access failed | Full and reduced native assembly reads returned HTTP 500; blob read failed without a saved payload |
| 2056 | Native robot CAD explicitly withheld | Team drawings/binder remain the available evidence, not a native assembly |

## Scope And Resource Limits

- Read-only reference access. No edits/copies of reference documents, sharing
  changes, bulk public-CAD crawl, or private endpoint/browser-session replay.
- Keep the existing Onshape browser-automation admission gate. Public team
  downloads and documented API requests are distinct routes; neither is evidence
  that an inaccessible source has been inspected.
- Existing authenticated-request cap and accumulated ledger remain in force;
  check remaining allowance before live work. No assumed new allocation or reset.
- Never expose local credentials, signed headers or cookies. Downloaded original
  geometry stays in an ignored cache with source, revision and hash evidence.
- Inspect the controlling parts and interfaces first, rather than importing
  whole robots repeatedly or detailing speculative replacements.

## Engineering Release Gates

Native inspection must establish the actual parts, assembly transforms, relevant
dimensions and revision before selecting reference-derived geometry. Then prove
the selected design's own part connectivity, contact clearances, retention/handoff,
stow/extension and service access; do not import a team's reputation as test evidence.

The digital deliverable should include real CAD, assembly joints, selected COTS
interfaces, parts/BOM, manufacturing drawings and machine files, build/service
instructions, controlled parameters and a verification record. Missing shop
tolerances, stock/material specifications, loads or product revisions must be
resolved before affected drawings can be released for manufacture.

Physical acquisition, tolerance robustness, wear, impact, electrical/thermal duty,
jam recovery, endurance and field-cycle reliability require physical measurements
and testing. No digital-only result can certify these. An incomplete gate remains
explicitly blocked; user authorization to work autonomously does not waive it.

## Inspection Results

### 1690: Actual Geometry Inspected

Document `76609fe05a6594c5f9c4062a`, immutable microversion
`1d118c30ab4c3c15bc9b4ab0`, configuration `default`.
The native hierarchy contains 1,341 part definitions, 84 subassemblies and 2,684
occurrences. Five bounded GLTF exports yielded 493 distinct source bodies;
955 native occurrences from the pickup subset, indexer, vacuum receiver and chassis
datum subset were placed locally using their original world transforms. These are source parts,
not synthetic approximations or a newly engineered subsystem.

- [Private local inspection viewer](../../.cache/reference-cad/1690-inspection.html):
  stage isolation, four views and orbit controls. Source files are ignored, not rehosted.
- [Measurement/provenance record](1690-geometry-evidence.json) and
  [detailed native inspection](1690-NATIVE-INSPECTION.md).
- Three observed pickup shafts span approximately 441.2, 457.8 and 307.6 mm in
  native X. Selected rows contain 11, 8 and 5 star occurrences. Shaft span is not
  usable capture width; projected mesh dimensions are not machining tolerances.
- The indexer includes ten modeled 3-inch compliant wheels, stars, belts and two
  X44 drive-unit occurrences. The V banks lie in the horizontal native XZ plane,
  with upright wheel shafts along Y. Actual frame rails and swerve geometry establish
  **Y-up**. The earlier Z-up display and resulting "vertical-plane V" inference
  were wrong and are corrected. The team's "vertical wheel" wording does not
  establish a vertical V plane. It is powered, unlike the earlier passive V sketch.
- Native frame rails occupy Y=12..62 mm, with 754 mm outer X/Z spans. The lowest
  selected tire mesh is about Y=-2.11 mm, so Y=0 is not a verified loaded floor datum.
- The vacuum head uses distinct central and surrounding sealing geometry. The
  team identifies the central purchased cup with coral and custom seal with algae.
  Its exported static pose does not establish a transfer pose or vacuum performance.
- Mate-enabled inspection returned zero features in the pickup and all 25 returned
  subassemblies. No animated joint model was supplied by this imported release.
- Analytic body details returned `BAD_GEOMETRY` and zero bodies. This is a failed
  analytic export, not proof that the team's manufactured parts are invalid.

### Source-Derived Layout And Topology Check

Values below are source mesh observations in native coordinates, not manufacturing
dimensions or motion acceptance. X is width, Y is up, positive Z is the intake end.

| Element | Axis (Y, Z), mm | Observed Width/Span, mm |
| --- | --- | --- |
| Low kick-up roller 2672, outer body `LFfaB` | (31.42, 516.51) | 431.03 roller width; about 50.55 transverse extent |
| Forward upper shaft 2611, `LF7YB` | (159.22, 637.68) | 441.20 shaft; 390.15 star-bank envelope |
| Middle upper shaft 2621, `LFLZB` | (260.08, 513.48) | 457.78 shaft; 341.93 star-bank envelope |
| Rear upper shaft 2771, `LFnbB` | (285.05, 385.90) | 307.62 shaft; 258.61 star-bank envelope |
| Final upright indexer shafts | X=+/-92.25, Z=88.63 | Tyre centers Y=191.03; about 108.4 projected inner-X gap |

The low roller is about 121.17 mm behind the forward upper row. Narrowing star
coverage and spaces between discs are important contact risks; shaft length does
not establish a 458 mm capture mouth. Rubber compression and entry-angle coverage
are unmeasured.

Actual plate-edge loops were extracted offline with Three.js and circle-fit
against the independently observed bearing centers. The front coupler `LFfVB`
has a 2.6 mm-radius hole near (185.621, 593.839). Its small bearing `KFP2` lies in
a **shaped slot** in lower rocker `LFPYB`, not a corresponding revolute bore.
The slot end fits a radius of 6.00001 mm with maximum sampled radial residual
0.000034 mm; this is numerical mesh agreement, not machining precision.
The slot's overall projected outline is about 52.93 x 35.92 mm.

Therefore the simple pinned-four-bar reconstruction is **REJECTED**. Slot freedom,
contact/stop selection and real drive coupling must be modeled before claiming
stow/deploy trajectories. Circular coupler/auxiliary plate holes were observed;
small noncircular or interrupted outlines remain labeled rather than forced into
round bores. [Private bore observations](../../.cache/reference-cad/1690/bore-observations.json)
and [probe implementation](source-bores.mjs) preserve this discriminating check.

The outlet structure suggests a longitudinal horizontal coral pose with top-down
receiver approach: a nominal 114.3 mm cylinder supported at Y=133.85 would have
center Y=191.00, close to the final wheel centers. This is a **hypothesis**, because
the real guide contact section, compression and receiving sequence are not solved.
The exported cup is about 151 mm above that candidate piece's top, not touching it.
Part `KFD+` appears twice at identical placement under different source assemblies;
do not count those as two proven physical plates or accept a collision/mass result
without resolving the duplication.

The team-linked January 9 V-indexer prototype clip played in the public Drive
viewer. Fourteen frames at 2, 4, 5, 6, 8, 10, 12, 15, 18, 23, 27, 29, 32 and
38 seconds were inspected. They show drill-driven wheel banks and hand-fed trials.
This is sampled early-prototype media, not full motion tracking, a final-CAD
configuration, a success-rate measurement or proof of the final coral axis.

### Other References

[1778 access report](1778-NATIVE-INSPECTION.md): document metadata, elements and
microversion were read. Geometry was not obtained. Two native assembly requests
returned HTTP 500; the blob attempt saved no file. Further calls to 1778 are
closed for this run, with all failed requests retained in the ledger.

[2056 source report](2056-NATIVE-INSPECTION.md): the team's post 30 explicitly
declines a SolidWorks/STEP release. The inspected drawing pages remain useful,
but no native robot/intake geometry is claimed.

### Development Decision And Stop

Select the **separate compliant pickup plus independently powered V-indexer
functional family** as the evidence-grounded development direction. This is not
a geometry freeze or a literal replica. Do not reuse the failed passive-V cassette
or carrier geometry, or carry forward its invented receiving coordinates.

Next engineering needs a datumed deployed/stowed pickup model, actual pivot and
contact geometry, a chosen receiver acceptance/escape path, and slow-transfer
and tolerance tests. Router-cut plates and positively located machined/bolted
supports should replace any precision-bend dependency. Purchased fits remain exact.
Final dimensions, receiver choice, COTS interfaces and drive sizing are not frozen.

The current annual Onshape allowance was requested but not supplied because the
user is unavailable. **Live CAD modeling is blocked by the existing annual-allowance
and 500-call-reserve rule.** Endpoint rate headers are not an annual balance.
This does not imply the local engineering is complete: motion, contact, collision,
load and manufacturing gates remain open. No new custom subsystem, drawings or
manufacturing release is represented by the reference viewer.

Accounting: 18/18 bounded reference attempts, 41/140 cumulative direct attempts,
including four failed HTTP/download attempts. HTTP success with `BAD_GEOMETRY`
is not a geometry success. No reference mutations, copies or sharing changes.

Validation: source hashes, native path resolution, rigid placements, finite mesh
measurements and evidence gates checked locally. Forty desktop/mobile
stage/view cases were nonblank with no horizontal overflow; the smallest canvas
foreground count was 3,969 pixels and the minimum foreground edge margin was
22 pixels. Orbit drag changed the render. These checks
validate the inspection tool, not the mechanism's physical behavior.