# FeatureScript Workflow PoC: FINISHED - Public Geometry And Exports Verified

## Public Result

Completed on 2026-09-11 at 12:42:50 UTC. **GEOMETRY_AND_EXPORTS_VERIFIED**:
actual Onshape custom-feature compilation and regeneration, nine solid parts,
required through holes, server-measured baseline and revision, API PNGs, and
genuine STEP exports. The existing owned NEW PUBLIC synthetic intake document
was resumed. This continuation created **zero documents** and uploaded **zero
source revisions**. Cumulative confirmed public documents: **1 of 3 allowed**.

- [Public Part Studio, currently revision](https://cad.onshape.com/documents/086039b6f3621e6c0c73690a/w/57576582af3edd8e81d291cf/e/c1c82d07d6491f6fe419f3fe)
- [Saved Feature Studio source](https://cad.onshape.com/documents/086039b6f3621e6c0c73690a/w/57576582af3edd8e81d291cf/e/8e613db339872b56a7d45795)
- [Version-pinned source](https://cad.onshape.com/documents/086039b6f3621e6c0c73690a/v/9851f47744739d85de500abe/e/8e613db339872b56a7d45795)
- [Final summary](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/summary.json)
- [Cumulative audit and error history](artifacts/public-audit.json)

Both variants use document `086039b6f3621e6c0c73690a`, Part Studio
`c1c82d07d6491f6fe419f3fe`, and feature **`FquoTJ0SIxovR9B_0`**. Onshape returned
the namespace `e8e613db339872b56a7d45795::meb3df23499da79259ce35c58`; it was used
unchanged. The source is FeatureScript **3070**, standard library **3070.0**,
SHA-256 `af76352c2d823da717d178e4bcec0923fd7283d41b640272402fd71a89c21968`.
Exported specs plus an active `OK` persistent feature and measured geometry
establish success, not HTTP status or a diagnostic lambda alone.

## Server Measurements

All values below are decoded from Onshape read-only evaluation of the persistent
feature, not substituted analytic values. Bounds and cylindrical radii/centers
pass 0.01 mm tolerance; volume tolerance is max(0.1 mm^3, one part per million).

| Measured quantity (mm unless count) | Baseline | Revision |
| --- | ---: | ---: |
| Solid parts / persistent custom features | 9 / 1 | 9 / 1 |
| Inner plate width | 340 | 360 |
| Clear roller gap | 100 | 95 |
| Rear roller center Y | 246.2 | 241.2 |
| Roller length | 330 | 350 |
| Shaft length | 378.1 | 398.1 |
| Plate thickness | 6.35 | 6.35 |
| Left plate outer X | -176.35 | -186.35 |
| Through holes per plate | 5 | 5 |

Each plate has two 12.9 mm shaft holes, two 6.6 mm mounting holes, and one
12.9 mm pivot hole: **10 plate holes total**. Cylindrical-face radius, Y/Z center,
X-axis direction and full plate-thickness span all pass. Both rollers have
12.7 mm through bores and 76.2 mm OD; the reference tube is 301.625 mm long,
114.3 mm OD and 101.6 mm ID. All nine per-part bounds and volumes pass.

The revision request changed only `innerWidth` from `340 mm` to `360 mm` and
`rollerGap` from `100 mm` to `95 mm`, preserving every other server feature field,
including feature ID, namespace and nodes. Baseline/revision responses both
report the same active `OK` custom feature with no microversion skew.

| Evidence | Baseline | Revision |
| --- | --- | --- |
| Decoded dimensions and cylindrical surfaces | [Measurements](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/baseline-measured.json) | [Measurements](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/revision-measured.json) |
| Original evaluation response | [Raw response](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/baseline-measurements-raw.json) | [Raw response](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/revision-measurements-raw.json) |
| Persistent feature and state | [Feature list](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/baseline-features.json) | [Feature list](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/revision-features.json) |
| 1200 x 900 API render | [PNG, 203536 bytes](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/baseline.png) | [PNG, 203141 bytes](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/revision.png) |
| AP242-requested export | [STEP, 64379 bytes](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/baseline.step) | [STEP, 64379 bytes](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/revision.step) |
| Exact-byte export provenance | [Manifest](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/baseline-export-manifest.json) | [Manifest](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/revision-export-manifest.json) |

Both exports were **plain STEP**, not ZIP. Each is byte-identical to the saved
server download (`baseline-export.bin` / `revision-export.bin`), has exchange
header/footer and **nine MANIFOLD_SOLID_BREP records**. The baseline STEP SHA-256
is `d8c63d218cb6dcece6061d0dce1d680f5ba9cc3ea3e02ef5c2fb032701756f5e`; revision is
`388cb611875936e57288c5a42f7c1bed8b15879f72fcb4afdd8597d00a9aa329`.
[exports.mjs](exports.mjs) also preserves original ZIP bytes and names/hash-maps
extracted STEP members when applicable; this branch was tested synthetically,
not exercised by these server downloads. The PNGs were opened for visual
inspection and their raster streams decoded and checked for nonblank content.

## Calls, Timing And Failure History

The trial recorded **62 authenticated requests**, including **5 HTTP errors**,
with **0 automatic retries**. There were two document-creation attempts total:
one failed private attempt, then one explicitly authorized successful public
creation. This continuation made **36 requests**, all HTTP 200: one source
version, one custom-feature insertion, one parameter revision and two STEP
export creations. It created no document and performed no source upload.

| Saved run / phase (UTC) | Recorded calls | HTTP time (s) | Actual outcome |
| --- | ---: | ---: | --- |
| 11:47:01 private attempt | 1 | 0.853 | HTTP 409, private entitlement refused |
| 12:11:03 public creation/source | 5 | 6.242 | Owned public doc created; local line-ending assertion stopped workflow |
| 12:12:37 empty run directory | 0 | 0 | No recorded network call |
| 12:13:10 inspection and diagnostics | 14 | 6.336 | Saved source/spec inspection; three diagnostic endpoint 404s |
| 12:20:18 source/spec/version | 6 | 3.714 | Exported spec; incomplete version payload returned HTTP 400 |
| 12:37:01 corrected version and insertion | 10 | 17.694 | Version created; feature OK; incorrect local import-list assertion stopped validation |
| 12:37:56 baseline plus checkpoint finisher | 26 | 18.684 | Baseline/revision geometry and all exports verified |
| **Total** | **62** | **53.523** | **Finished** |

The last row includes 12 requests before an interrupted process and 14 requests
in the successful finisher. Baseline measurement and PNG had already completed;
translation `6aa3f60d948340d21a67f52e` was recovered, not recreated. No parameter
revision had occurred before that interruption. The finisher took **14.170 s**
including polling; the corrected-version invocation took **17.771 s**. Initial
interrupted workflow elapsed time is unavailable. Continuation HTTP time totals
**36.378 s**. These are recorded workflow/HTTP timers, not total agent wall time,
CAD-only time, or a speed comparison. HTTP time includes response body reads,
excludes signing and log writes; each completed invocation timer has its own scope.

The original private response was: "Free accounts only allow access to public
documents. Upgrade your account to get full access to private documents."
It returned no document. Public work followed separate explicit authorization,
not an automatic visibility fallback. Three earlier diagnostic URL probes
returned 404; they were not repeated here. The exact version failure was fixed
using the saved schema's `documentId` and `microversionId`, with the latter taken
from the server's `sourceMicroversion`. The custom feature links through its
returned namespace; expecting a custom entry in `imports` was a local validator
bug, not a compiler failure. The existing decoder correctly handled the real
BTFSValueArray/Number/String response, including vector tags; no decoder repair
or source recompile was required here.

Evidence: [audit](artifacts/public-audit.json),
[baseline-stage calls](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/calls.jsonl),
[finisher calls](runs/2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49/finish-84d488aa-9e38-42d7-bf0f-1c25489fafce-calls.jsonl).
Local tool issues included a terminal-wrapper syntax rewrite, interrupted/missing
terminal output and one interrupted test run; durable TAP/artifacts were used
instead of claiming those outputs proved success. No human CAD interaction,
additional prompt, delegation, GUI/browser modeling, sharing, deletion, or commit
was used in this continuation. Local changes stayed in this trial, including
the `fflate` dependency and lockfile. Credential configuration was runtime-loaded
only, never tool-read, printed, or included in request headers in logs.

## Safe Commands And Verification

Use Node 24 from the repository root. Dependencies are confined to this trial:

```powershell
npm ci --prefix trials/featurescript --ignore-scripts --no-audit --no-fund
```

The following exact checkpoint recovery command completed the public trial. It
requires explicit public authorization and runtime credentials. It verifies
original ownership and export provenance, reuses completed baseline evidence,
refuses unrelated parameter changes, and does not repeat an already-applied
revision. No further live run is required for this completed deliverable.

```powershell
node trials/featurescript/finish.mjs --live --confirm-public --run 2026-09-11T12-37-56-506Z-8cae962e-3237-4508-aea2-2278e6976b49 --parent 2026-09-11T12-37-01-358Z-f2ee3f15-b4f1-4480-b848-7c847ae17f55
```

Do not restart `deploy.mjs` for this document: that entry point creates a new
document. The earlier `resume.mjs` is for the pre-revision deployment checkpoint;
use [finish.mjs](finish.mjs) for this completed baseline/revision artifact set.
The client restricts production origin, owned document/workspace, approved
mutations, registered translations and export IDs; no redirects or automatic
HTTP retries. It has a 60-request cap per process, 60-second request timeout,
and at most eight translation status checks per export.

**24 tests passed, 0 failed, 0 skipped** in the final selected suite:
[public-final-tests.tap](artifacts/public-final-tests.tap). This includes real
server-response checks, same-feature parameter-only revision, image decode,
exact STEP bytes/solid records, ZIP fixtures, and transport/provenance guards.

```powershell
node --test --test-reporter=tap --test-reporter-destination=trials/featurescript/artifacts/public-final-tests.tap trials/featurescript/client.test.mjs trials/featurescript/compile-check.test.mjs trials/featurescript/resume.test.mjs trials/featurescript/workflow-resume.test.mjs trials/featurescript/recovery.test.mjs trials/featurescript/exports.test.mjs trials/featurescript/finish.test.mjs trials/featurescript/live-evidence.test.mjs
node trials/featurescript/audit-public.mjs
```

The audit command is offline. It derives counters from this trial's logs and
corrects final-summary accounting, without credential loading. The full legacy
suite was not rerun: some tests read a sibling benchmark or expect obsolete
source hashes. Prior 22/23-test artifacts remain historical, not current gates.
Focused tests immediately followed each repair. This continuation used two
deployment repairs (version payload and import assertion), one transport recovery
addition, and one finisher accounting repair; no file exceeded three repair loops.

## Current Limitations

- This is a synthetic intake packaging module, not a full robot or production design.
- Editable source and two custom-feature parameters are proven; separate native
  sketch/extrude history, arbitrary topology changes and downstream references are not.
- The live workspace is the revision. Baseline geometry is preserved in server
  responses, PNG and STEP; no separate baseline version was created.
- All dimensions, volumes, hole surfaces and counts were checked on Onshape.
  STEP was not re-imported into a second CAD kernel; record counts are not a
  semantic re-import test. Raster checks do not prove manufacturing correctness.
- Reference naming is observed and source sets EXCLUDE_FROM_BOM, but server BOM
  property readback, assembly BOM, materials, mates, motion, interference,
  purchased parts, manufacturing drawings, FEA and rule compliance are unverified.
- The parent regenerated the analytic artifacts against the current successful
  source and reran their contract tests. They still correctly say NOT_RUN because
  generated expectations are not measurements; use the final run for live evidence.
- No cross-trial ranking, model-performance claim, token count, cost, or speedup
  is inferred. Only this trial was inspected and modified in this continuation.

## Archived Private-Only Report

The following report describes the earlier private-only phase. Its status,
commands, source version, test counts and limitations are historical and are
superseded by the completed public result above.

<details>
<summary>Private-only report archive (not current status or instructions)</summary>

## Result

Live attempt on 2026-09-11: **BLOCKED BY PRIVATE-DOCUMENT ENTITLEMENT**.
The first private-document creation request returned HTTP 409:

> Free accounts only allow access to public documents. Upgrade your account to get full access to private documents.

The runner stopped immediately. No further live request, retry, public fallback,
sharing, deletion, or resume was attempted. No document ID was returned or private
document confirmed created. Consequently there is no document URL, saved server
FeatureScript source, custom-feature instance, server compilation/runtime result,
measured solid/hole count, baseline/revision CAD, API PNG, or STEP file. The local
source and analytic contracts below are not substitutes for that missing evidence.

The local regression suite passed **23 tests, 0 failures, 0 skipped**. These tests
validate analytic expectations, lexical source contracts, API payload contracts,
and synthetic transport/validation behavior. They are not a FeatureScript compiler.
The previous offline phase passed 22 tests using Node v24.15.0; its evidence is
preserved separately.

All changes and output are under this directory. No sibling trial or recommendation
was read; no shared/root file was edited, and no branch, commit, delegation, or
Playwright workflow was used. The live loader consumed credential configuration
only in memory; no credential file was opened with editor tools and no credential
values, request headers, or environment dumps were printed or saved. The configured
base URL was validated before the request. No public documentation host was
contacted during this live continuation. The protocol's user-approved model label
is GPT-6 Astra; reasoning effort was not set or verified by this tooling.

## Live Evidence

Command actually run:

```powershell
node trials/featurescript/deploy.mjs --live --confirm-private
```

| Observation | Actual result |
| --- | --- |
| Request | `POST https://cad.onshape.com/api/v17/documents` |
| Request body contract | `isPublic:false`; name generated as `FeatureScript intake PoC <ISO timestamp>` |
| Response | HTTP 409, server code 0, free-account private-access refusal |
| Requests / retries | 1 / 0 |
| Creation attempts / allowed maximum | 1 / 3; stopped at the entitlement failure |
| Confirmed new documents | 0 |
| HTTP elapsed, including body read | 852.6616 ms |
| Runner workflow elapsed | 857.9727 ms |
| Server feature / solid / hole counts | Not measured; no document created successfully |
| Baseline / same-feature revision | Not reached |
| PNG / STEP | Not reached; no image or STEP path exists |

The workflow timer starts after credentials/configuration, source/benchmark reads,
run-directory creation, and client setup. It ends before the final summary write.
It is neither end-to-end agent wall time nor CAD generation time. The HTTP timer
starts after signing and includes fetch/body read, but not the call-log write.
Only one request was issued; no source, specs, version, feature, measurement, or
export request was issued. The exact method/path and sanitized server response
are retained. The original request body/name timestamp and headers are not logged;
the body contract above is grounded in the runner, not a captured wire payload.

- [runs/2026-09-11T11-47-01-505Z-4b21b844-9614-4b69-a191-8558c6b9a061/calls.jsonl](runs/2026-09-11T11-47-01-505Z-4b21b844-9614-4b69-a191-8558c6b9a061/calls.jsonl): immutable failed request evidence, sanitized response, timing, zero retries.
- [runs/2026-09-11T11-47-01-505Z-4b21b844-9614-4b69-a191-8558c6b9a061/summary.json](runs/2026-09-11T11-47-01-505Z-4b21b844-9614-4b69-a191-8558c6b9a061/summary.json): failure stage, request count, elapsed time, source hash.
- [artifacts/live-phase-tests.tap](artifacts/live-phase-tests.tap): all 23 current local test results; the earlier 22-test artifact remains unchanged.

Interventions in this continuation: one preflight code repair plus one synthetic
regression test before the live request; zero API/schema/compiler repair attempts,
zero manual CAD actions, and zero additional user prompts. The parent had supplied
live authorization and credential-presence confirmation before this continuation.
No human setup time, token use, cost, speedup, or ranking is inferred. Further live
work requires private-document entitlement and renewed authorization to proceed;
changing account entitlement was not attempted.

## Hypothesis And First Check

Hypothesis: a saved, reusable custom feature can construct the nine benchmark
solids using role-scoped primitive and subtraction operations, then preserve its
feature identity while width changes from 340 to 360 mm and clear gap changes
from 100 to 95 mm.

The first small edit was an analytic geometry-contract module and two tests.
The immediately following command was
`node --test trials/featurescript/geometry.test.mjs`; both passed. This check
could disprove the parameter/coordinate derivation, but cannot establish that
the FeatureScript compiles. Each subsequent implementation slice was followed
by focused Node tests. The decisive remaining test is a genuine Onshape run.

Live preflight hypothesis: the existing credential loader ignored
`ONSHAPE_BASE_URL`, so enterprise configuration would silently target production.
The local repair resolves the effective process/local base URL in memory, rejects
unsupported or malformed values with a value-free error, and passes the validated
origin to the client. A synthetic regression tests local/process targets, including
userinfo and malformed input, without reading real configuration. Immediately
after editing, `node --test trials/featurescript/deploy.test.mjs` passed all six
tests. The subsequent live response was an entitlement failure, not an API schema
or compiler defect supporting further repair.

## Deliverables

- [intake.fs](intake.fs): saved `defineFeature` source, pinned to FeatureScript
  2232 and `onshape/std/geometry.fs` version `2232.0`.
- [geometry.mjs](geometry.mjs): independent analytic bounds, volumes, hole
  positions, and baseline/revision configurations.
- [generate.mjs](generate.mjs): reproducible parameter payload and expectation
  generation, with source SHA-256.
- [artifacts/baseline.json](artifacts/baseline.json) and
  [artifacts/revision.json](artifacts/revision.json): generated contracts, not CAD
  results. Both use exactly the same feature source.
- [client.mjs](client.mjs): production-host-only HMAC transport and private
  same-run document guard.
- [deploy.mjs](deploy.mjs): explicit live runner and default zero-access plan.
- [validate.mjs](validate.mjs): read-only measurement lambda and strict response
  validators.
- [research.mjs](research.mjs), [artifacts/api-research.json](artifacts/api-research.json),
  and [artifacts/upstream-license.txt](artifacts/upstream-license.txt): reproducible
  public schema provenance and upstream license.
- [artifacts/tests.tap](artifacts/tests.tap): actual final local test output.
- [artifacts/offline-status.json](artifacts/offline-status.json): verification boundary.

The six test files cover geometry, source, artifacts, signing/transport, deployment,
and validation. No additional packages or project framework were installed.

## Geometry And Editability

The feature creates two 6.35 mm plates at the specified inner faces, two annular
76.2 mm rollers with 12.7 mm shaft bores, two 12.7 mm shafts, two solid 25.4 mm
square crossmember envelopes, and one staged annular PVC reference. Each plate
gets two 12.9 mm shaft holes, two 6.6 mm mount holes, and one 12.9 mm pivot hole.
Through-cut tools overrun their targets by 1 mm at each end and are consumed.
There is no union between neighboring components.

| Analytic expectation (mm) | Baseline | Revision |
| --- | ---: | ---: |
| Inner width | 340 | 360 |
| Clear roller gap | 100 | 95 |
| Rear roller center Y | 246.2 | 241.2 |
| Roller length | 330 | 350 |
| Shaft length | 378.1 | 398.1 |
| Left plate outer X | -176.35 | -186.35 |

These numbers are calculated locally, not measured. The reference coral stays
301.625 mm long with OD 114.3 and ID 101.6 mm, centered at Y=-110 and Z=57.15 mm.
Its name is `coralReference [REFERENCE - NON-BOM]`, and the source sets
`PropertyType.EXCLUDE_FROM_BOM` to true. Actual property readback and an assembly
BOM are not implemented or verified.

The feature dialog exposes `innerWidth` (100..1000 mm, default 340) and
`rollerGap` (0..135.7 mm, default 100). The upper gap limit keeps the rear roller
envelope within the plate's 320 mm length. Other benchmark dimensions are named
source constants, with tests against the normative JSON. This is a bounded
module family, not an arbitrary-mechanism generator.

IDs use semantic roles such as `leftPlate/blank` and `leftPlate/frontShaft/tool`.
Queries refer to their own creation operations; no stored face IDs, face-order
selection, or global subtraction target is used. The source checks for nine
surviving solids and attaches role attributes. Stable role IDs reduce reference
fragility, but do not prove downstream face/edge identity under topology changes.

**Persistent feature versus transient evaluation:** a Feature Studio stores the
editable source. A custom-feature instance with a namespace and parameters is
inserted into the Part Studio feature list and regenerates with the model. An
`evalFeatureScript` lambda is not that persistent feature; constructing geometry
only inside evaluation would not satisfy this trial. Here evaluation is used
only to inspect already-created geometry. Users can edit the custom feature's
parameters; this route does not expose every internal operation as a separate
native sketch/extrude item. Source edits are a separate compile/version/link
update workflow, not required for this width/gap revision.

## Researched Live Sequence

The client uses `/api/v17`, matching the pinned public schema's server URL. Older
official guide examples use v8/v9/v11. Current endpoint compatibility still needs
an authenticated response; no guessed namespace or silent version downgrade is used.

1. `POST /documents` with `isPublic:false`; require a returned `public:false`,
   document ID, and default workspace ID. Only one creation attempt per process.
2. `POST /featurestudios/d/{did}/w/{wid}` with a name; GET initial source metadata;
   POST `BTFeatureStudioContents-2239` with `contents` and concurrency metadata;
   GET exact source readback and GET `/featurespecs`.
3. Require exported `coralGroundIntake` specs exposing both controls. The public
   schema has no standalone compiler-diagnostics operation. Specs are a compiler
   gate, not proof of runtime geometry. HTTP/source/spec failures are preserved;
   missing specs stop before creating a version or inserting a feature.
4. `POST /documents/d/{did}/versions` with the new workspace and
   `publishVersion:false`. GET version-pinned Feature Studio specs and use their
   returned `namespace`. No private source is published.
5. Create a Part Studio with `POST /partstudios/d/{did}/w/{wid}`. Insert
   `BTMFeature-134` through `/features`, with typed `BTMParameterQuantity-147`
   parameters and the server-returned namespace. Insertion is expected to register
   the custom import; require that the feature list actually reports an import
   containing the Feature Studio ID. There is no fabricated separate import API.
6. Require an active `OK` feature state, one custom feature, nine named solid
   parts, both parameter expressions, and no microversion skew. Read-only
   evaluation measures tight per-part bounds, volumes, and cylindrical faces.
   Check each plate's five hole surfaces and tube bores for radius, Y/Z center,
   X-aligned axis, and full through-length. Bounds/radii tolerance is 0.01 mm;
   volume tolerance is max(0.1 mm^3, one part per million).
7. Attempt shaded-view PNG and asynchronous AP242 STEP export of the baseline.
   Image uses a positive-determinant orthonormal isometric matrix and
   `pixelSize=0` fit-to-frame. PNG signature is checked; this is not a visual
   correctness check. STEP completion, external data ID, exchange header, bytes,
   and hash are checked, not semantic STEP re-import correctness.
8. Read the current feature and concurrency metadata, preserve its ID, namespace,
   nodes, and other fields, and change only the two expression strings. POST to
   `/features/featureid/{fid}` in the same document/workspace/Part Studio. Do not
   re-upload or recompile source as part of parameter revision. Repeat validation
   and export for the revision.

This orchestration has local contract tests, not a successful live integration
test. It may fail at source compilation, specs/namespace shape, import resolution,
evaluation encoding, or any permission/API boundary. Fail-closed results are useful
evidence and must not be reclassified as CAD success.

## Safety And Recovery

The default command and `--help` never load credentials or call the network.
Only explicit `--live --confirm-private` can read the root environment file into
memory with Node's `parseEnv`, taking `ONSHAPE_ACCESS_KEY` and
`ONSHAPE_SECRET_KEY` from process environment first, then local configuration.
The effective `ONSHAPE_BASE_URL` setting is also checked in memory with process
environment taking precedence over local configuration. An absent setting defaults
to production; a configured unsupported/malformed target fails before any request
without echoing its value. There is no arbitrary host configuration.
Never put real keys in command-line arguments, logs, artifacts, or this report.

HMAC follows the official algorithm: lowercase method, nonce, date, content type,
path, query, each newline-delimited including the final newline; SHA-256 HMAC,
Base64, and `On <access>:HmacSHA256:<signature>`. Nonces use cryptographic randomness.
Only `https://cad.onshape.com` is allowed. HTTP, other hosts, userinfo, nondefault
ports, and all redirects are blocked. Even a legitimate same-host redirect is
not followed; this deliberately limits exports rather than forwarding credentials.
Enterprise stacks and region-host redirects are unsupported in this PoC.

Only resources in the just-created private document are accessible through the
runner. It has no existing-document/resume, public fallback, sharing, or delete
mode. It uses reject-on-skew concurrency guards. A failed run leaves its newly
created document intact for human inspection; it never deletes or repairs a
pre-existing document. A rerun creates a new PoC, not a resumed revision.

Requests have 60-second timeouts, a 60-request budget, and no automatic HTTP
retries, including 429 and ambiguous POST failures. Each export polls at most
eight times with 2/4/8/10-second bounded backoff. Rate limits or unavailable
exports are recorded as failures, not suppressed success. Export failures can
leave geometry validated but exports incomplete, with a nonzero exit code.

Live output is confined to a unique `runs/<timestamp>-<uuid>/` directory:
sanitized HTTP responses and timing in `calls.jsonl`, source/spec/feature/part
responses, raw measurement responses, validation results, available PNG/STEP
files, and a final summary when those stages are reached. The only live run so far
contains a call log and failure summary, with no CAD-stage artifacts. Actual counts
and timings are recorded above; interventions are documented separately because
they are not automatically measurable by the runner.

## Commands And Verification

Run from the repository root using Node 24. No install step is required.

```powershell
node --version
node trials/featurescript/generate.mjs
node trials/featurescript/deploy.mjs
node trials/featurescript/research.mjs
```

These commands were run in the previous offline phase. Generation and default deployment are offline; the
research command fetches only the public pinned schema and license. The exact
final local test command was:

```powershell
node --test --test-reporter=spec --test-reporter=tap --test-reporter-destination=stdout --test-reporter-destination=trials/featurescript/artifacts/tests.tap trials/featurescript/artifacts.test.mjs trials/featurescript/client.test.mjs trials/featurescript/deploy.test.mjs trials/featurescript/geometry.test.mjs trials/featurescript/source.test.mjs trials/featurescript/validate.test.mjs
```

Offline phase result: 22 passed, 0 failed, 0 skipped. Editor diagnostics reported no errors in
the trial directory. Source tests are lexical/contracts only; transport and
measurement fixtures are explicitly synthetic. The source hash and contracts
are checked for staleness, not compiled by Node.

Research failures: the webpage extractor could not parse the large stdlib page;
public Node fetch succeeded with HTTP 200. One inline schema command was rewritten
by the terminal wrapper (`||` became `;`) and failed with a SyntaxError. A second
inline attempt exited 1 with no output. The saved research script subsequently
ran successfully. These are tooling failures, not Onshape compiler errors.

Live-continuation regression command, actually run after the entitlement failure:

```powershell
node --test --test-reporter=spec --test-reporter=tap --test-reporter-destination=stdout --test-reporter-destination=trials/featurescript/artifacts/live-phase-tests.tap trials/featurescript/artifacts.test.mjs trials/featurescript/client.test.mjs trials/featurescript/deploy.test.mjs trials/featurescript/geometry.test.mjs trials/featurescript/source.test.mjs trials/featurescript/validate.test.mjs
```

Result: 23 passed, 0 failed, 0 skipped. Editor diagnostics reported no errors in
the two edited JavaScript files. No local test made authenticated network requests.
One initial report-edit patch failed its context check and was corrected; this
did not issue any API call or alter the failed attempt's evidence.

**Live command, now run once and blocked by entitlement; do not repeat without resolution:**

```powershell
node trials/featurescript/deploy.mjs --live --confirm-private
```

A private-document-capable account, correctly scoped production-stack keys, and
an accurate system clock are prerequisites. A free/public-only entitlement is a
blocker; there is no public fallback. No CAD timing, token use, cost, speedup,
or ranking is inferred from the local tests or public documentation.

## Fetched Sources

Fetched during this phase on 2026-09-11; pinned-schema fetch metadata and SHA-256
are in the research artifact. No third-party client code was executed or installed.

- https://cad.onshape.com/FsDoc/library.html : `fCuboid`, `fCylinder`, `opBoolean`,
  `qCreatedBy`, `qOwnedByBody`, `qGeometry`, attributes, properties, `Cylinder`,
  `evBox3d`, `evSurfaceDefinition`, `evVolume`.
- https://cad.onshape.com/FsDoc/feature-types.html : exported feature definition,
  UI preconditions, regeneration behavior.
- https://cad.onshape.com/FsDoc/imports.html : workspace versus version references
  and how source updates propagate.
- https://onshape-public.github.io/docs/ : official API guide entry point.
- https://onshape-public.github.io/docs/auth/apikeys/ : HMAC canonical string,
  nonce/date requirements, stack scoping, redirects.
- https://onshape-public.github.io/docs/api-adv/featureaccess/ : typed feature
  encoding, insertion, updates, states, imports, serialization/microversions.
- https://onshape-public.github.io/docs/api-adv/fs/ : lambda-only evaluation and
  tight bounding boxes versus graphics bounds.
- https://onshape-public.github.io/docs/api-adv/partstudios/ : Part Studio creation,
  feature lists, body and mass properties.
- https://onshape-public.github.io/docs/api-adv/translation/ : shaded/export-related
  workflow context, async STEP, translation states, external-data download.
- https://api.github.com/repos/onshape-public/go-client and its `/commits/master`
  and `/contents/` resources : public repository identity, revision, file discovery.
- https://raw.githubusercontent.com/onshape-public/go-client/cac13c6a22593bd0aff3294b2656ac171e01c6e8/openapi.json :
  exact Feature Studio/create/update/spec schemas, namespace, private documents,
  versions, custom feature payloads, shaded views, and STEP export. Project commit
  `cac13c6a22593bd0aff3294b2656ac171e01c6e8`; repository MIT license. The OpenAPI
  document itself declares Apache 2.0 in its metadata; both facts are recorded.
- https://raw.githubusercontent.com/onshape-public/go-client/cac13c6a22593bd0aff3294b2656ac171e01c6e8/LICENSE.md :
  captured upstream license text. Schemas were used as documentation contracts,
  not a bundled SDK implementation.

## Whole-Robot Assessment

FeatureScript is a credible route for reusable module families: intake plates,
roller stacks, mounting patterns, structural envelopes, and other mechanically
bounded variants. A compact feature interface can express intent more directly
than a long series of independent REST feature edits. This trial has not yet
demonstrated that advantage in authenticated CAD.

Whole robots need more than one generated Part Studio. Use separately versioned
modules with explicit attachment interfaces, then an assembly layer for repeated
instances, mate connectors, mates, limits, motion, and interference validation.
Repeated purchased parts should be linked from controlled supplier/library
versions, not generated as new geometry for every occurrence. Material, part
number, revision, mass, sourcing, make/buy status, and reference exclusions must
flow into an assembly BOM and release process; naming alone is insufficient.

Topology-changing edits such as adding rollers, cutouts, bearings, or splitting
plates can invalidate downstream references despite stable feature IDs. They need
family-specific tests and migration rules, not merely wider numeric bounds.
Version-pinned imports make reproduction predictable but require deliberate code
update propagation. Large robots also need API scheduling, rate-limit accounting,
checkpointed recovery with ownership checks, and auditable human review.

Motors/transmission, bearings/fasteners, assembly/motion, purchased components,
manufacturing details, FEA, rule certification, and production BOM are outside
this benchmark. This is a packaging-study implementation and safe deployment
harness, not a complete FRC robot design or an observed route ranking.

</details>