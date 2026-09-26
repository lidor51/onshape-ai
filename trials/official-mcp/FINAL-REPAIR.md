# Final Repair 2 Of 2

Status: prepared locally, NOT submitted or compiled. No authenticated calls, sibling changes, or delegation.

The parent reports that the declaration probe compiled with only four unused-declaration warnings:
`makeBox`, `makeCylinder`, `labelPart`, `officialIntakeNear`. Its element is
`66e03cc911623af502c718c4`, microversion `43ac8ba4cb0bec1fe6abdab9`.
The raw response was not independently retrieved. The earlier full-source compiler defect is unconfirmed.
Earlier evidence is unchanged; this handoff supersedes its pending-probe status for the final dispatch.

## Single Final Dispatch

- Submit [baseline test payload](artifacts/final-repair-baseline.test.payload.json) once with `test_feature`.
- Source: [baseline](artifacts/final-repair-baseline.fs), 4710 ASCII characters; longest line 286 characters.
- One export: `officialIntakeFinal`; feature name `OfficialIntakeFinal`; empty precondition.
- Explicit numeric defaults in millimeters: `innerWidth: 340`, `rollerGap: 100`, `plateThickness: 6.35`.
- No server expected map, packed expectations, assertion helper, phase loop, or secondary exported feature.
- Any final compilation failure means `FAILED_COMPILE_WITHIN_BUDGET`. Do not probe, repair, or redispatch again.
- No compiler error alone is insufficient for acceptance: complete measured output must also pass the validator.

After successful compilation, the exact same source is available in the
[baseline create payload](artifacts/final-repair-baseline.create.payload.json), with `clean: false`.
The [revision source](artifacts/final-repair-revision.fs) is 4709 characters and changes only numeric defaults
to `innerWidth: 360`, `rollerGap: 95`. Its [test payload](artifacts/final-repair-revision.test.payload.json)
and [create payload](artifacts/final-repair-revision.create.payload.json) are prepared, not instructions to
spend extra calls or create an extra branch. Use only the parent's authorized post-compilation workflow.
These defaults do not provide editable UI controls. No UI-editability or complete benchmark pass is claimed.

## Measured Output

`OIM1` records contain numeric millimeter values, not expected values:

```text
OIM1|BEGIN|innerWidth|rollerGap|plateThickness
OIM1|P|role|solidCount|volumeMm3|minX|minY|minZ|maxX|maxY|maxZ
OIM1|C|role|radius|originX|originY|originZ|axisX|axisY|axisZ|minX|minY|minZ|maxX|maxY|maxZ
OIM1|END|totalSolidCount
```

For the actual response captured inside this folder, run:

```powershell
node trials/official-mcp/final-measurements.mjs baseline trials/official-mcp/artifacts/ACTUAL_RESPONSE.json
```

Use `revision` for the revision response. Plain console text and nested JSON text results are supported.
Every required geometry check remains local: nine solids and identities, per-part bounds and volume,
five cylindrical holes per plate, all cylinder counts/radii/centers/axes, full through-depth,
inner width and clear roller gap. Tolerances: length `1e-5 mm`, axis `1e-8`,
volume `max(0.001 mm^3, expected * 1e-8)`. Bad numbers, truncated/duplicate records, and reported errors fail.
Warning-only notices do not fail. Both phases must pass separately. Regeneration output is NOT persisted readback.
Bind each actual response to the [manifest](artifacts/final-repair-manifest.json) source hash; retain separate
persisted-model readback, visibility, and other benchmark evidence. The validator never authenticates input origin.

## Local Checks

`node --test trials/official-mcp/final-repair.test.mjs trials/official-mcp/final-measurements.test.mjs`

Tests use synthetic data, not invented server evidence. The lexical check only detects unknown bare names;
it does not establish FeatureScript parsing, type correctness, or geometry success. The public
[API reference](https://cad.onshape.com/FsDoc/library.html) confirms the used primitive/evaluator signatures,
`Cylinder.coordSystem`, and `defineFeature(function, defaults)` semantics. No diagnostic GET was performed.