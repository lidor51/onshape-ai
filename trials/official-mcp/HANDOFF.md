# Official geometry dispatch handoff

## Current result

BLOCKED_AWAITING_PARENT_DECLARATION_PROBE. Repair #1 also failed when the parent
submitted semantically equivalent 3070 source with slightly different whitespace.
The original failure remains in
[artifacts/compile-repair-1.json](artifacts/compile-repair-1.json); the second exact
reported error text is in
[artifacts/compile-attempt-2.json](artifacts/compile-attempt-2.json). The second
submitted bytes/hash and enclosing response object were not supplied and are not
invented. The local candidate hash is explicitly only a reference.

Separately, the parent reports that the minimal println feature actually passed:
`OFFICIAL_COMPILER_PROBE_OK`, no notices, source microversion
`14a9aeceee5d7c8401552b42`, library `3070`, serialization `1.2.21`. Those observations
are preserved in
[artifacts/compiler-probe-success.json](artifacts/compiler-probe-success.json).
This establishes working helper authentication, compilation and execution for that
minimal source, not successful compilation or geometry of the intake.

No evidence-backed production repair #2 is available. **Repair usage remains
1 of 2.** The production generator, source, all geometric assertions and all
production payloads are unchanged. The only new source is a separate diagnostic
subset. This continuation made zero authenticated requests, loaded no credentials,
read no sibling trials and used no delegation.

[artifacts/compiler-investigation.json](artifacts/compiler-investigation.json) is
the current status authority and supersedes the old dispatch manifest's readiness
and parent-call counts. That historical manifest still describes unchanged source
bytes and hashes, but does not authorize another production submission or create.

## One discriminating probe

Pass the parsed object from
[artifacts/compiler-declaration-probe.payload.json](artifacts/compiler-declaration-probe.payload.json)
to the parent's `mcp_featurescript_test_feature`. Exact source:
[artifacts/compiler-declaration-probe.fs](artifacts/compiler-declaration-probe.fs),
1,995 ASCII characters, SHA-256
`d50ab76dcac912383f5859cf9cc173ba8e3fd54ce2c086d113349a1723115aaf`.
It has not been submitted. Generate it locally with
`node trials/official-mcp/compiler-probe.mjs`; this writes only its two diagnostic
artifacts, not the production model.

The probe copies the original `makeBox`, `makeCylinder`, `labelPart` and
`officialIntakeNear` bodies/signatures. It preserves the private `officialIntake`
declaration's three custom length preconditions and defaults, but replaces its
geometry body with an empty-body query. It adds a typed map-return helper and two
exported features, so the official helper will still append its Trojan to a
multi-feature source. All dependencies precede callers. The exported features
have empty preconditions and explicit `{}` defaults. Primitive and Near helpers
are compiled but not invoked; this is not a geometry test.

- `OFFICIAL_DECL_OK` with no error notices: this subset compiles and executes;
  its type names, helper declarations, private parameter/default handling and
  multi-feature discovery are not sufficient to reproduce the failure. Narrow
  the remaining original model/evidence/assertion bodies using actual diagnostics
  before spending repair #2. Do not call create or redispatch the full model.
- Same no-Trojan error: this small subset reproduces the discovery failure.
  Omitted geometry/assertion code is not necessary to reproduce it, but this alone
  does not identify which declaration, import, metadata or helper behavior fails.
- Runtime error: compilation/discovery progressed beyond the original failure;
  retain its exact diagnostics. A generic success flag without the marker is not
  a passing probe. There are no automatic follow-up calls in this handoff.

The public mirror explicitly exports `ValueWithUnits` and `LengthBoundSpec` and
documents the original unit-keyed custom bounds form. It declares `Vector` too;
the pending probe tests exact-3070 visibility through `common.fs`. The language
reference supports typed returns and private top-level constants and treats
newlines as whitespace. No imported-name collision or private-feature ban has
been established. Mirror versions are placeholders, not pinned 3070 evidence.
The narrow source URLs and limitations are in the investigation record.

No public unauthenticated compiler-diagnostics endpoint was verified, and no
speculative Feature Studio API requests were made. Parent `get_featurescript`
could recover exact source from a surviving studio, but its exposed schema does
not promise compiler notices. Do not guess an endpoint or authenticate here.

Local validation: 20 focused Node tests passed, zero failed, covering probe size,
original helper fidelity, exact payload/hash, separate parent observations, and
unchanged production geometry and revision contracts. This is not server compiler
evidence. The production dispatch sequence below is blocked pending diagnosis.

## Scope evidence

Only NEW PUBLIC synthetic intake sandboxes are authorized. Existing user CAD,
sharing changes and deletion remain prohibited.

[artifacts/managed-discovery.json](artifacts/managed-discovery.json) records the
user-authorized exact-name searches and direct document metadata. The unique
`FeatureScript MCP Workspace` match is positively public:

| Field | Observed value |
| --- | --- |
| Document ID | `f92dc90f7c052de045dd2c4f` |
| Default workspace ID | `f635457a22317d08c72c7d93` |
| Normalized explicit visibility | `isPublic: true` |
| Metadata verification completed | `2026-09-11T16:04:16.935Z` |
| Exact Notes search | No matching `FeatureScript MCP Notes` document |

[Managed public document](https://cad.onshape.com/documents/f92dc90f7c052de045dd2c4f/w/f635457a22317d08c72c7d93).
No unrelated CAD was fetched. Only matching names, IDs and visibility were saved;
raw listing/account responses and credentials were not retained. The current key
was loaded in memory after local safety tests and explicit flags. Rotation was
not attested and remains recommended. Do not write or provision Notes during
this dispatch: its public visibility is not established, and discovery is spent.

This is the exact-name discovery prerequisite authorized by the newest request,
not an independent read of the MCP service's internal target configuration. The
tools cannot accept a target document selector. Before dispatch, stop if the
parent's prior official responses identify a different configured document.
Require every subsequently returned document ID to equal the verified ID above;
stop on a conflict, never redirect the trial to another document or account.

## Budget and evidence

- Parent-reported quota: 273 used / 2,500 limit / 2,227 remaining, not freshly polled.
- This continuation: 8 of 8 raw REST discovery attempts, all GET, inside the
  official 100-request planning reserve. No further raw REST requests are allowed.
- Status sequence: 400, 200, 200, 200, 200, 200, 200, 200. Three guarded recovery
  passes: listing shape, partial Notes absence, explicit visibility field schema.
- Discovery active execution time: 6,571 ms across runs. The observation window
  was 16:00:24.112Z to 16:04:17.801Z, including local repair/validation intervals.
- Official invocations by this continuation: 0. Parent-reported `test_feature`
  attempts: 3, comprising two production failures and one successful minimal
  println probe. No geometry tests ran. Compiler repairs used: 1 of 2. Retained
  branches: 0. Parent calls consumed additional API requests of unknown count;
  the earlier planning-reserve figures below predate them.
- Up to 92 requests remain in this trial's planning reserve before parent dispatch;
  this is bookkeeping, not an observed account balance. Tools use multiple REST
  requests. Account concurrency and exact future tool cost remain unknown.
- Parent dispatch cap remains 12 official invocations, at most two compiler repairs
  and two retained branches. The sequence below plans only one branch. Never use
  `clean: true`, delete, change sharing/allocation, or retry an ambiguous create.
- Parent already read official notes: `No notes added yet.` Parent's prior read-only
  test reported library 3070. This is new source, not code read from a server
  Feature Studio. The old local-only 2500 pin did not qualify for the existing-code
  exception. Source now uses 3070 and `onshape/std/common.fs` at 3070.0.

## Blocked production files

These JSON files contain actual tool arguments, not an MCP envelope. Pass the
parsed object only after the current diagnostic block is resolved. Source must remain byte-identical to
its payload. Full source/payload hashes and sizes are in
[artifacts/dispatch-manifest.json](artifacts/dispatch-manifest.json).

| Official tool | Ready argument file | Source |
| --- | --- | --- |
| `test_feature` | [artifacts/test-feature.payload.json](artifacts/test-feature.payload.json) | [artifacts/test-feature.fs](artifacts/test-feature.fs) |
| `create_geometry` | [artifacts/create-geometry.payload.json](artifacts/create-geometry.payload.json) | [artifacts/baseline-feature.fs](artifacts/baseline-feature.fs) |
| `test_feature` before revision write | [artifacts/test-revision.payload.json](artifacts/test-revision.payload.json) | [artifacts/revision-feature.fs](artifacts/revision-feature.fs) |

The absolute file root is `C:\Users\lidor\FRC\onshape-ai\trials\official-mcp\`.

The previous hash block is superseded by the regenerated dispatch manifest.
Do not redispatch the failed payload; its source hash remains only in the
parent-attributed failure evidence.

## Parent sequence

Historical production sequence only: do not start it while the current status
is `BLOCKED_AWAITING_PARENT_DECLARATION_PROBE`. The immediate next step above is
one diagnostic test, not a production retry or geometry creation.

1. Load the official tools through the parent's available loader. Read this scope
   evidence and compare any already-observed target IDs. Do not redo REST discovery.
   Dispatch `mcp_featurescript_test_feature` using the test payload.
2. Validate compiler/runtime diagnostics and actual measured output. Require
   `TRANSIENT_SCRATCH_EVALUATION_NOT_PERSISTED`, `persisted: false`, and two phases
   with `assertionsPassed: true`, each with nine measured single-solid parts. The
   scratch evaluation contains 18 solids total because it builds both states with
   distinct operation IDs. Require width/gap 340/100 and 360/95 mm, five cylindrical
   through-holes per plate, sleeve bores, all expected bounds and volumes. Bounds,
   radius, center and through-extent tolerance is 0.00001 mm; axis tolerance is
   1e-8; volume tolerance is max(0.001 mm^3, expected volume * 1e-8). A generic tool
   success flag or missing output is insufficient. Do not label this persisted CAD.
3. Only after that success, dispatch `mcp_featurescript_create_geometry` with the
   ready baseline payload: `feature_name: OfficialIntakeRetained`, `clean: false`.
   The first exported feature has an empty precondition and `{}` defaults. It
   calls the original parametric feature with hardcoded baseline values; all three
   original length parameters also have explicit second-argument defaults.
4. Validate the returned document ID and retain the actual new branch workspace,
   Feature Studio, Part Studio and feature IDs. The branch workspace must differ
   from the default workspace above. If the Feature Studio ID is omitted, use
   `list_feature_studios` on that exact retained branch and require an unambiguous
   result. Save only validated fields in `artifacts/retained-identity.json`:

```json
{
  "did": "f92dc90f7c052de045dd2c4f",
  "wid": "ACTUAL_RETAINED_WORKSPACE_ID",
  "featureStudioEid": "ACTUAL_RETAINED_FEATURE_STUDIO_ID",
  "partStudioEid": "ACTUAL_RETAINED_PART_STUDIO_ID",
  "featureId": "ACTUAL_CREATED_FEATURE_ID",
  "parentValidatedCreateResponse": true,
  "parentValidatedSelfTest": true,
  "clean": false
}
```

5. Run `node trials/official-mcp/bind-retained.mjs --read`. Dispatch
   `mcp_featurescript_get_featurescript` with generated
   `artifacts/get-retained-source.payload.json`. Preserve the returned source bytes
   as `artifacts/retained-baseline-readback.fs`. Missing IDs or a source mismatch
   are a stop condition; do not guess them or overwrite a different studio.
6. Dispatch `mcp_featurescript_test_feature` using the exact revision-test payload.
   Its first feature is the retained wrapper with baseline set to false. Require
   revision-phase assertions and nine measured solids. This is also a transient
   evaluation, not retained-branch readback. Return any real diagnostics to this
   independent trial for at most two compiler repairs; the parent does not author
   fixes. A repair requires regenerated hashes and local tests before redispatch.
7. Run `node trials/official-mcp/bind-retained.mjs --revision`. It requires exact
  baseline source readback and permits only the private baseline flag changing
   from true to false. Dispatch `mcp_featurescript_put_featurescript` exactly once,
   at the end, with generated `artifacts/put-retained-revision.payload.json`. This
   targets the actual retained branch/studio, never the service default workspace.
8. Use the same get-source payload to read back the final source and compare its
   revision hash. Save the actual response diagnostics, timestamps and retained
   identity. A source-only edit does not replace the Part Studio feature, but its
   regenerated geometry and unchanged feature ID still need direct observation.
   Finish with `mcp_featurescript_get_api_usage`, preserving only usage/limit/cycle
   fields. Record observed delta with a concurrency caveat, not exact self usage.

Never create a second branch as a substitute for the same-feature revision.
The private source default is deliberately used because changing `defineFeature`
defaults alone would not reliably override already-stored feature parameter values.
The binder changes no parameter records and makes no remote calls. This is a
CODE-DEFAULT EDIT, not a parameter-only update.

The retained wrapper intentionally has no UI controls. `innerWidth`, `rollerGap`
and `plateThickness` remain controls on the inner `officialIntake` feature only;
they are not exposed on the retained feature instance. This lowers its UI rating.
The official schemas do not expose a parameter patch, and stored feature values
would defeat a revision implemented only by changing their defaults.

## Remaining limitations

The 14 exposed schemas do not provide an explicit Part Studio parameter update,
targeted persisted-body readback, image export, or STEP export. `test_featurescript`
targets the configured scratch Part Studio, not a chosen retained branch. Do not
silently substitute REST, browser automation or a community server. Source readback
proves saved source, not regeneration or model correctness. `create_geometry` does
not return compiler diagnostics; retain any actual geometry observations it does
return without inventing absent fields. The non-BOM property is authored but not
independently read back. Missing requirements stay UNVERIFIED or BLOCKED.

Whitespace token checks and lossless tuple round trips are not compiler tests.
The 3070 compatibility of units, `fCylinder`, `evSurfaceDefinition` cylinder fields
and geometry evaluators still requires actual parent `test_feature` diagnostics.

Repair #1 passed 16 focused local tests:
`node --test trials/official-mcp/compact.test.mjs trials/official-mcp/generate.test.mjs trials/official-mcp/dispatch.test.mjs`.
The command, results and repaired source hash are recorded in
[artifacts/compile-repair-1.json](artifacts/compile-repair-1.json). These are not
compiler tests. The broader `node trials/official-mcp/verify.mjs` was not rerun in
this repair; its existing local-validation and TAP artifacts predate the repair.