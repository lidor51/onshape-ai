# V3 Continuation Result

**BLOCKED / UNFROZEN. Not a complete local V3 packet, live admission, or manufacturing release.**

## Measured Result

The unauthorized split of X44 body 0 was removed. Both original solids are preserved by rigid location only: combined housing/shaft presentation plus fixed rear cover. There is no vendor rotor solid. OpenCascade `IsPartner` confirms unchanged underlying source topology for all six bodies from five vendor files. X60 is excluded. No original COTS bytes or manifest were written.

- X44 main STEP volume error: 0.017142342782 mm3; unchanged budget 0.011210730835 mm3: FAIL.
- X44 rear-cover STEP volume error: 0.733032532539 mm3; unchanged budget 0.01 mm3: FAIL.
- Bearing, pinion, output gear and AndyMark REV2 wheel pass the original scalar/bounds budgets. Pinion/gear/wheel also pass the current sampled B-rep correspondence check. Bearing correspondence is UNVERIFIED because UV reparameterization invalidates the existing point-to-point sampler.
- Original-OBB-frame errors are below 1e-11 mm for all six bodies. This rules out a gross source-frame error, not a STEP geometry mismatch. X44 rear-cover surface-type counts change on readback. Tighter integration and recentering did not cure the earlier main-body discrepancy; disabling pcurves does not cure the current X44 corpus. The exact OCCT serialization/healing mechanism is not proven.
- 6 focused regressions pass; 306 parameter-frame checks, 102 source connector definitions, 52 native instances, 51 mates and 6 relations. These are local definitions/algebra, not native readback or physical tests.
- V1/V2 source and artifact freeze verification passes. No new V3 sweep, full assembly export or freeze was executed after the failed narrow gate.

## Current Artifacts

- [Status and hashes](continuation-status.json)
- [Corrected complete local contract](current/assembly-contract.json)
- [Unchanged source bindings and diagnostic STEP paths](current/cots-bindings.json)
- [Geometry payload](current/source/geometry-payload.json)
- [Source connector frames](current/source/parametric-connectors.json)
- [FeatureScript candidate, uncompiled](current/source/concept-a.fs)
- [Controls and native limitations](current/ui-edit-map.json)
- [Regression result](current/tests.json)
- [Default source corpus](original-source-roundtrip-probe.json)
- [No-pcurve experiment](original-source-roundtrip-no-pcurves-probe.json)
- [Source OBB/B-rep evidence](source-brep-roundtrip-probe.json)

Older root `source/`, `baseline/`, quick validation and phase artifacts predate this corrected contract. They are retained as historical failure evidence, not current source geometry or an admitted packet. The six `source-probe/` STEP exports are diagnostic; the X44 exports failed equivalence.

## Reproduction

From the repository root, the runner uses only the existing explicit CadQuery environment, preloads its installed VTK, denies socket/child-process operations in Python, and waits for one process without polling or installing anything.

```powershell
node trials/subsystem-ab/shared/v3_run.mjs v3_source_probe.py
node trials/subsystem-ab/shared/v3_run.mjs v3_source_probe.py --no-pcurves
node trials/subsystem-ab/shared/v3_run.mjs v3_brep_probe.py
node trials/subsystem-ab/shared/v3_run.mjs v3_resume_test.py
node trials/subsystem-ab/shared/v3_run.mjs v3_resume_report.py
```

The first three return failure by design while the measured gate remains unresolved; regression PASS tests that failures cannot be hidden. `v3_finish.py` now runs fresh scalar and B-rep source gates before attempting a full sweep or freeze. The standalone X44 probe supports `--boundary-only` and retains separate historical partition evidence.

## Remaining Gates

- Resolve both X44 STEP scalar discrepancies without changing original geometry or relaxing budgets
- Resolve bearing geometric boundary correspondence independent of UV parameterization
- Run current baseline/revision exports and 62 deployment samples after strict source gates pass
- Run current tooth-phase and interface checks with unsplit motor presentation limitations retained
- Verify native FeatureScript effective geometry, source-owned connectors, identities, mates and UI
- Parent must verify remaining persistent request budget and allowance; native grouping requires logical-member readback
- Physical torque, materials, teeth production, fastening/retention, guarding, wiring, jam handling and manufacturing release remain unverified

The cap is 150 global attempted requests, 140 API plus 10 overhead, not 45 instances. The conservative fresh-arm plan is 131 attempts, not an allowance to reset an existing ledger. Actual remaining headroom was not read. Native rigid groups are conditional on supported schemas and readback of every logical member.

Only shared code/local artifacts were written. Zero API/network/browser actions, credentials access, downloads, installs, commits or delegates. No physical hardware or manufacturing certification is claimed.
