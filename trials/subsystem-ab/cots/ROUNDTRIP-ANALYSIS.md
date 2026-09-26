# COTS STEP Roundtrip Analysis

Date: 2026-09-12. Diagnostic research only; not packet admission or manufacturing certification.

## Conclusion

**No, the evidence does not show that all CAD engines fail.** The local trials reuse one OCCT kernel family. Four of the six retained COTS bodies pass the original scalar roundtrip gate. The two X44 failures and the X60 original-import validity failure are different problems.

**Rear cover:** new measured witnesses localize a real discrepancy in the *interpreted trimmed boundary* around a periodic TORUS-to-REVOLUTION conversion. Supporting surfaces nearly coincide, but their accepted trimmed regions differ. This is not explained by volume integration noise alone.

**Main body:** the volume residual survives adaptive integration, while sampled boundary geometry nearly coincides. The exact cause remains inconclusive: integration/trim representation sensitivity is plausible, but pure numerical error and full boundary equivalence are not proven.

**Bearing:** the old 6.54 mm UV-correspondence discrepancy is not reproduced by geometric nearest-boundary comparison. All 29 faces are sampled with maximum face distance about 1.14e-11 mm. This strengthens the parameterization explanation without rewriting the frozen UNVERIFIED result.

## Engines Actually Exercised

| Route | Verified implementation/version | What was exercised | Conclusion |
| --- | --- | --- | --- |
| Local preflight | Recorded Python 3.10.0, CadQuery 2.6.1, cadquery-ocp 7.8.1.1.post1 | Generated intake models, not this exact WCP roundtrip corpus | OCCT, not an independent kernel |
| Manufacturing package | Existing environment now runtime-verified: Python 3.10.0, CadQuery 2.6.1, cadquery-ocp 7.8.1.1.post1; OCP module 7.8.1.1 | Earlier manufacturing processing; reused here | Same OCCT 7.8.1-based stack |
| Shared V3 / COTS / this diagnostic | Shared runner explicitly selects the manufacturing environment above; VTK 9.3.1, NumPy 2.2.6 verified at runtime | These original files and saved readbacks | Repeated tests of one kernel, not multiple engines |
| Onshape online | Parasolid per official Onshape documentation [5,6]; deployed kernel version unverified | Prior synthetic CAD/pilot workflows, not these exact WCP motor uploads | Neither success nor failure established for these motor files |
| build123d | No recorded run; package absent in the inspected environment | Not tested | Do not label FAIL or claim independent corroboration |
| FreeCAD | No recorded run/version evidence | Not tested | Do not label FAIL |

Local provenance: [preflight runtime evidence](../../local-preflight-browser/artifacts/dependency-evidence.json), [shared environment runner](../shared/v3_run.mjs), [COTS XCAF validation](geometry-validation-v2.json), and the environment field in each new diagnostic JSON. A package version is not a benchmark of other releases or configurations.

Ledger snapshot, read as aggregate statistics only: **23 attempts / 140 local API-attempt cap, 117 remaining**. This is not the account's Onshape allocation or permission to spend it. No COTS import operation appeared. The apparently suggestive `pilot-source-upload` is `updateFeatureStudioContents` for provisional generated blocks, not STEP upload: [pilot source implementation](../api/pilot-source.mjs). The [import packet](import-packet.json) supplies candidates, not successful native imports. No authenticated call was made here.

## Frozen Gate, Unchanged

The actual [scalar comparator](../shared/v3_source_probe.py) requires one valid closed solid, absolute volume difference below `max(0.01, sourceVolume * 1e-7)` mm3, and bounds error below 0.001 mm. This is a software equivalence gate, **not a material, fit, or machining tolerance**. Relative errors below use the original imported default volume as denominator.

| Body | Original volume mm3 | Absolute difference mm3 | Existing budget mm3 | Relative difference | Original status |
| --- | ---: | ---: | ---: | ---: | --- |
| X44 main | 112107.308354120 | 0.017142342782 | 0.011210730835 | 0.152910 ppm; 0.0000152910% | FAIL |
| X44 rear cover | 2515.771152336 | 0.733032532539 | 0.010000000000 | 291.374886 ppm; 0.02913749% | FAIL |
| Hex bearing | 3985.859541807 | 3.5285393e-7 | 0.01 | 8.85264e-5 ppm | Scalar PASS; boundary UNVERIFIED |
| Spline pinion | 5071.757420221 | 3.1998752e-8 | 0.01 | Negligible scalar residual | PASS, sampled boundary only |
| Hex output gear | 13726.909690795 | 2.1548658e-7 | 0.01 | Negligible scalar residual | PASS, sampled boundary only |
| REV2 wheel | 15092.582068992 | 3.9155566e-8 | 0.01 | Negligible scalar residual | PASS, sampled boundary only |

Sources: [current V3 report](../shared/packet-v3/REPORT.md), [original-source measurements](../shared/packet-v3/original-source-roundtrip-probe.json), [original B-rep probe](../shared/packet-v3/source-brep-roundtrip-probe.json).

X60 WCP-0940 is separate: the existing XCAF read of the original hash-bound STEP produced six solids, with solid index 3 invalid, volume reported as 195759.684035 mm3. It is already quarantined in [geometry validation](geometry-validation-v2.json) and [import packet](import-packet.json). This is an OCCT original-import validity failure, not a demonstrated re-export regression and not proof that every kernel or the manufacturer's native model is invalid. No repair or fresh X60 import was performed here.

## Why The Previous Check Could Mislead

[boundary_probe](../shared/v3_roundtrip_probe.py) greedily pairs faces by surface type and centroid, then compares a 5x5 grid at corresponding fractions of each face's UV rectangle, including untrimmed regions. A change of seam, orientation, domain, or parameterization can move those selected points while leaving the surface set unchanged. Conversely, equal vertices and bounding boxes cannot detect a changed interior trim.

[v3_brep_probe](../shared/v3_brep_probe.py) declines parameter matching when surface-type counts change. That is appropriately inconclusive about geometry, not proof that TORUS and REVOLUTION representations cannot describe the same surface.

The saved main-body topology counts match: 3142 vertices, 4829 edges, 1846 faces. Its old UV-point error was 0.000182831 mm, despite vertex agreement near 1e-11 mm. The cover changes 30 of 148 TORUS faces into REVOLUTION faces; the other type counts match. The bearing retains 40 vertices, 62 edges and 29 faces, but its old UV-point error is 6.537626 mm.

`IsPartner` proves the pre-export object retained the imported TShape under rigid placement. It does not prove equality after serialization and import, or identity to the manufacturer's pre-STEP native geometry. "Original" in the new measurements means the OCCT interpretation of the unmodified original STEP bytes; the reader itself has translation/healing behavior [2,3].

## New Local Diagnostic

Code: [diagnostics/roundtrip.py](diagnostics/roundtrip.py), executed by [diagnostics/run.mjs](diagnostics/run.mjs). The adapter follows the existing explicit Python path, preloads installed VTK, disables bytecode writes, and denies Python socket/child-process actions. The shared runner itself was not executed because it writes shared packet logs. No install, healing operation, boolean modification, or STEP export was used.

The probe reads the current hash-bound bindings and existing `source-probe` readbacks, applies only the saved inverse rigid placement, and compares in original source coordinates. Source/export hashes must match the frozen scalar report; the input hashes are checked again at completion. Output is confined to diagnostics.

Method:

1. Evaluate 3x3 interior UV candidates on every face, accepting only `TopAbs_IN` under trimmed-face classification at 1e-9. Try 9x9 where none are accepted; refine the eight worst sampled faces with 9x9. UV is used to generate points, never to pair points across surfaces.
2. Find each point's closest distance to the *other trimmed boundary* using `BRepExtrema_DistShapeShape`, in both directions. Comparing to a compound of faces avoids a misleading zero distance merely because a point lies inside a solid. Analytic per-face boxes prune candidates conservatively; worst face and edge results are cross-checked against an unpruned compound, with zero discrepancy in all six directions.
3. Also compare every vertex and one midpoint of every edge to the opposite boundary. Record points, nearest points, face indices, coverage gaps, exact B-rep boxes, default area, validity and maximum stored topology tolerance.
4. Compute default and adaptive Gauss volume, centroid and centroidal inertia with explicit OCCT overloads. `Eps` is a requested relative integration error per face, not a geometric length tolerance. Runtime source inspection confirms CadQuery `Volume(tol)` forwards that argument through `computeMass` to the dimensional OCCT properties function [4].

Self-tests verify a 0.02 mm displaced box, an inside-but-off-boundary point, a point outside a trimmed face, a rotated cylinder seam, bounding-box pruning, and known box volume/centroid/inertia.

| Body | Face samples forward / reverse | Faces covered per side | Max face distance forward / reverse, mm | Max vertex/edge distance, mm | Max bbox difference, mm |
| --- | ---: | ---: | ---: | ---: | ---: |
| Bearing | 878 / 878 | 29 / 29 | 1.14103e-11 / 1.14103e-11 | 6.40308e-12 | 1.77636e-15 |
| X44 cover | 9824 / 9702 | 1234 / 1234 | 0.06620305 / 0.11478645 | 3.23955e-8 | 9.26192e-12 |
| X44 main | 13949 / 13949 | 1815 / 1846 | 4.35322e-11 / 7.60553e-11 | 6.15508e-8 | 5.68434e-14 |

Vertex/edge sample counts per direction: bearing 102, cover 5131, main 7971. Main has 31 faces without accepted interior grid samples, explicitly listed in the JSON. No area-uniform, continuous Hausdorff, or full trim equivalence certification is claimed. Tight numerical residuals below kernel precision are not promises of physical accuracy.

### Rear-Cover Witnesses

[cover-witnesses.json](diagnostics/cover-witnesses.json) independently checks the worst points. Face indices are zero-based, hash-specific diagnostic indices, not stable CAD IDs.

| Direction, face 843 | Witness point in original mm coordinates | Distance to own trimmed face | To opposite full boundary | To opposite supporting surface |
| --- | --- | ---: | ---: | ---: |
| TORUS source to REVOLUTION readback | (11.23045923, -17.71295232, -74.42871385) | 1.78e-15 mm | 0.06620305 mm | 1.45e-9 mm, projected trim OUT |
| REVOLUTION readback to TORUS source | (10.87171520, -17.72396165, -74.47328645) | 0 mm | 0.11478645 mm | 1.10e-8 mm, projected trim OUT |

For the reverse point, distance to the opposite candidate face itself is 0.24865462 mm; a neighboring plane reduces the whole-boundary minimum to 0.11478645 mm. Thus the outlier is not an artifact of matching only one face.

Face 843's U bounds change from `[5.497787143782, 6.283185307180]` to `[-0.785398163423, 6.283185307180]`, while V bounds essentially match. Its maximum edge tolerance rises from `1e-7` to `0.427601268463 mm`; face tolerance remains `1e-7`. Whole-cover maximum topology tolerance rises from `0.000978886333` to `0.427601268464 mm`.

**Localization:** nearly identical supporting surfaces, different periodic trim acceptance, inflated edge tolerance, and persistent volume/centroid/inertia differences. This implicates conversion/reconstruction of periodic trimming/pcurves in the serialized/readback path. It does not isolate the exact writer versus reader/healing routine or prove every changed face has the same cause. Large stored tolerances also limit interpretation; these are independent algorithms in the same OCCT kernel, not cross-kernel proof.

### Integration And Mass Properties

| Body | Default signed delta mm3 | Adaptive Eps=1e-7 delta | Adaptive Eps=1e-9 delta | Centroid separation at 1e-9, mm | Relative inertia error at 1e-9 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Bearing | 3.52854e-7 | 1.069435e-6 | 1.069448e-6 | 4.70976e-10 | 2.53150e-10 |
| X44 cover | 0.733032533 | 0.733039798 | 0.732976572 | 0.003159902 | 2.29967e-4 |
| X44 main | 0.017142343 | 0.017288841424 | 0.017288841278 | 4.93695e-6 | 2.69290e-7 |

Inertia error is `norm(I_readback - I_source) / norm(I_source)` with Frobenius norm. Inertia is unit-density geometric inertia in mm5, not the actual motor mass distribution or rotor inertia. The JSON stores full centroid vectors and tensors.

Default-to-adaptive source volume changes are substantial compared with the roundtrip delta: main 112107.308354 -> 112096.526207 mm3, bearing 3985.859542 -> 3986.174835 mm3, cover 2515.771152 -> 2515.759510 mm3. Thus default volume is not exact ground truth. However, tightening Eps does **not** erase either X44 pair residual.

At requested Eps=1e-9, returned relative error estimates are about 3.57e-8 for main and 1.33e-9 for cover, exceeding the request. These are algorithm estimates, not certified bounds. Main remains inconclusive; cover has additional spatial witnesses and cannot be dismissed as a scalar-only numerical artifact.

Prior [no-pcurve experiment](../shared/packet-v3/original-source-roundtrip-no-pcurves-probe.json): main error 0.016911469 mm3, cover 0.019752522 mm3; both still FAIL. The cover's strong response supports translation-path sensitivity. `write_pcurves=False` is not a validated repair [1,2]. No new no-pcurve export was generated here.

Bounded execution limitations: an initial corpus run stopped during bearing Gauss-Kronrod without completing that method; it passed only on the simple self-test, so no corpus GK result is claimed. A subsequent combined cover/main run reached the 600-second cap after cover completed; main then completed alone in about 250 seconds. Final bearing and cover runs completed in about 3 and 397 seconds. No repeated kernel installation or settings search was attempted.

## Public Research

Six public documentation pages consulted anonymously, 2026-09-12. No auth, cookies, Playwright, CAD/document crawl, or new COTS download. Legacy OCCT URLs redirected to the official OCCT3D host. Onshape help's collapsed sections required a repeat anonymous HTML GET. The current OCCT pages identify version 8.0.1; they explain mechanisms, **not a claim that 8.0.1 was run locally**. Installed 7.8.1-based API signatures and behavior were inspected separately. CadQuery latest docs may describe newer APIs than installed 2.6.1.

1. https://cadquery.readthedocs.io/en/latest/importexport.html
   "Importing STEP", "Setting Extra Options": STEP exchange support and `write_pcurves=False` example; no promise of bitwise or strict-volume identity. Assembly fusion may alter faces. No fusion was used here.
2. https://occt3d.com/dev/doc/overview/html/occt_user_guides__step.html
   "Tolerance management", `read.surfacecurve.mode`, `read.step.sequence`, `write.step.sequence`, `write.surfacecurve.mode`: file uncertainty seeds translation; tolerances evolve locally; default reading includes ShapeFix; writing converts OCCT constructs to STEP equivalents; pcurves can be omitted/reconstructed. `write.precision.mode` controls exported uncertainty, not a guaranteed roundtrip geometric bound.
3. https://occt3d.com/dev/doc/overview/html/occt_user_guides__shape_healing.html
   "Toolkit Structure", "DirectFaces", "SameParameter": distinguishes analysis, representation changes and actual geometry fixes; periodic seams and 3D-curve/pcurve disagreement are explicit concerns. Some fixes increase tolerances or change geometry. Therefore a valid solid or surface-type change alone settles neither equivalence nor corruption.
4. https://occt3d.com/dev/doc/refman/html/class_b_rep_g_prop.html
   `VolumeProperties` and `VolumePropertiesGK`: numerical integration overloads, relative error estimates, spline spans, centroid/inertia properties; validity/closed-boundary assumptions are not automatically certified by the integral.
5. https://cad.onshape.com/help/Content/uploadfiles.htm
   "Preparing a SOLIDWORKS Assembly file": states that Onshape and SOLIDWORKS run on the Parasolid modeling kernel. This establishes kernel family, not exact-version or this-file test evidence.
6. https://cad.onshape.com/help/Content/translation.htm
   "Part files": Parasolid is the preferred import format; STEP is supported. This does not justify converting vendor STEP through OCCT to manufacture a supposed native Parasolid source.

## Development Recommendation

Use the existing hash-bound original vendor STEP as the future destination-import input, with placements/connectors kept separately. Avoid the redundant vendor STEP -> OCCT -> STEP -> destination conversion when it is unnecessary. This is an engineering recommendation to remove an evidenced conversion stage, **not** a guarantee of Onshape import success. No upload is authorized or performed by this report.

The strict V3 frozen-packet gate remains blocked. Do not relabel old FAIL/UNVERIFIED results, relax shared thresholds, heal original assets, invent an X44 rotor by splitting vendor presentation solids, or admit X60 based on this research.

Overall mechanical development need not stop: mechanism layout, generated-part iteration, gear ratios, mounting datums, packaging studies and test planning can continue using clearly labeled original-import geometry or provisional envelopes. The tiny main scalar percentage alone is not evidence that a design is mechanically unusable. Conversely, cover-local discrepancies matter wherever clearance is comparable to their scale; matching overall boxes does not validate a fit.

Before exact COTS admission or release, independently validate critical mounting/shaft/bearing interfaces, minimum clearances and destination readback from original bytes. Torque, loads, retention, materials, tolerances, wiring and physical tests remain separate engineering gates. The next discriminating software work would inspect the converted cover face's trim/pcurve history or perform an explicitly authorized direct-original import in another kernel; neither occurred here.

## Reproduction And Evidence

Run from repository root, without installs; each command has a 600-second cap:

```powershell
node trials/subsystem-ab/cots/diagnostics/run.mjs --self-test
node trials/subsystem-ab/cots/diagnostics/run.mjs --roles cots_hex_bearing
node trials/subsystem-ab/cots/diagnostics/run.mjs --roles cots_x44_rear_cover
node trials/subsystem-ab/cots/diagnostics/run.mjs --roles cots_x44_main
node trials/subsystem-ab/cots/diagnostics/run.mjs --cover-witnesses
node --test trials/subsystem-ab/cots/diagnostics/evidence.test.mjs
```

Measured artifacts: [bearing](diagnostics/cots_hex_bearing.json), [cover](diagnostics/cots_x44_rear_cover.json), [main](diagnostics/cots_x44_main.json), [cover witnesses](diagnostics/cover-witnesses.json). These contain numerical signatures and a few witness points, not redistributed STEP assets.

Writes limited to this report and diagnostics. Original files, COTS manifest, frozen packets and production thresholds were not edited. Zero Onshape calls, new COTS downloads, installs, agents or commits in this task.