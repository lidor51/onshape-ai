# Baseline And Revision Read-Only Supplement

## Final Outcome

**PASS_BASELINE and PASS_REVISION**, completed 2026-09-11. Both saved reports and
their original response bytes were revalidated offline. No new requests,
credentials, official tools, model repairs or delegation were used to finalize.
This is **official MCP modeling plus supplemental read-only REST measurement
and PNG/STEP export**, not proof of pure official-tool readback/export capabilities.
There is no pending revision, authentication blocker or scope blocker.

[Current machine result](artifacts/current-live-result.json) records the full
outcome and limitations. The [baseline report](artifacts/readonly-supplement/baseline-report.json)
and [revision report](artifacts/readonly-supplement/revision-report.json) are
unchanged original phase reports, also bound to the
[append-only ledger](artifacts/readonly-supplement/ledger.json).

## Current Identity And Provenance

[Retained model](https://cad.onshape.com/documents/f92dc90f7c052de045dd2c4f/w/b60d9355149429c9c55f69c8/e/d0a579bf1b84bc1e68e06e90):
document `f92dc90f7c052de045dd2c4f`, branch `b60d9355149429c9c55f69c8`,
Part Studio `d0a579bf1b84bc1e68e06e90`, Feature Studio `66e03cc911623af502c718c4`,
feature `FQxpC8Q8LkpIQvt_0`, named `OfficialIntakeFinal`.

The [parent baseline record](artifacts/parent-retained-baseline.json) attributes
the successful final test, one retained `create_geometry(clean:false)`, source
readback, three tool-returned images and the then-current quota to the parent.
Those full raw tool responses were not saved here. Public managed-document
visibility comes from [saved discovery](artifacts/managed-discovery.json);
the new branch and returned target are parent-attributed. No new document creation,
private robot mutation or fresh account-metadata query is claimed.

The parent reports final baseline `test_feature` success with no notices, library
3070 and source microversion `f7ae35ac5545c9d2210f0e83`.
[Saved baseline console](artifacts/baseline-live-console.txt) passes the local
measurement validator. Parent revision `test_feature` likewise passed with no
notices, source microversion `115bb1bc5897d287c56a0039`, nine parts and 360/95 mm
values. **Full raw revision test output was not saved**; no raw response, console
or submitted-byte hash has been invented. These transient test identities are
distinct from the persisted workspace microversions below.

The parent then called `put_featurescript` **once** on this same branch/studio,
editing only numeric source defaults. Its returned `null` is not proof of
compilation or regeneration. The persisted revision supplement provides that
independent evidence. The retained feature has an **empty precondition**, with
numeric defaults for width, gap and thickness and **no exposed UI controls**.
This was **not a parameter-only revision** or an exposed-control UI workflow.

## Both Verified Stages

| Check | Baseline | Revision |
| --- | --- | --- |
| Saved status | PASS_BASELINE | PASS_REVISION |
| Retained feature | OK, unsuppressed | OK, unsuppressed |
| Named solids / total solids | 9 / 9 | 9 / 9 |
| Inner width / clear roller gap | 340 / 100 mm | 360 / 95 mm |
| Plate thickness / bores per plate | 6.35 mm / 5 | 6.35 mm / 5 |
| BOM exclusion | coralReference only | coralReference only |
| Workspace microversion | dd5d804ab7aa470518d44acc | 4bcde993e8baf4730d3a12db |
| Namespace source ID | m5dd5c58ddf7b5c3d6b5988eb | mf3fe3ec444fb32385ab49edc |
| Original persisted source bytes | 4,641 | 4,640 |

Both stages use namespace prefix `e66e03cc911623af502c718c4::`. The revision
report's `target.namespace` retains the original baseline binding; its actual
revision namespace is in `before.namespace` and `after.namespace`. Do not mistake
the static target field for the readback. Feature ID and all nine observed part
IDs match across phases, while source namespace and workspace microversion change.
This does not establish downstream references or assembly degrees of freedom.

All bounds, volumes, cylindrical radii/axes/centers and bore through-depths pass
the existing geometry validator. Length tolerance is 0.00001 mm, axis tolerance
1e-8, volume tolerance max(0.001 mm^3, expected volume * 1e-8). The measurement
POST queried only persisted `qCreatedBy(makeId(retainedFeatureId) + role)` bodies;
it created no geometry. Width, gap and thickness were derived from measured bounds,
not returned as editable feature parameters or accepted as supplied expectations.

Within each phase, initial, pre-export and final feature snapshots have the same
microversion. Source, parts, evaluation and PNG are pinned to it; workspace STEP
export is bracketed by equal snapshots. Actual persisted sources are token-equivalent
to prepared final sources but differ in whitespace. Actual retained SHA-256 values:

| Source | SHA-256 |
| --- | --- |
| [Baseline](artifacts/readonly-supplement/baseline-persisted.fs) | 7cd0ac34fd4eb1d800caa64a39fdd50356e4c7b116895d68dcb6b417178691ec |
| [Revision](artifacts/readonly-supplement/revision-persisted.fs) | c2dde13d448cdf311821b18b8ce33a0d8dbe4eb721c0bf99a728a755e11b0a3e |

## Both Original Exports

| Artifact | Baseline | Revision |
| --- | --- | --- |
| PNG, 1,200 x 900 | [48,171 bytes](artifacts/readonly-supplement/baseline.png) | [49,488 bytes](artifacts/readonly-supplement/revision.png) |
| Original STEP ZIP | [23,326 bytes](artifacts/readonly-supplement/baseline-step-original.zip) | [23,318 bytes](artifacts/readonly-supplement/revision-step-original.zip) |
| Individual STEP members | 9 | 9 |

Each PNG is decoded without alteration from its saved API response. Both were
locally visually inspected as nonblank and fully framed. This is not human UI
validation, a manufacturing drawing or a complete visual bore inspection.

Each ZIP is byte-identical to its original download, initially saved with a
`.step` suffix; those original files remain unchanged. Each member's original
filename, byte count, CRC32 and SHA-256 is in the phase report. Extracted files
retain the original member bytes and have STEP envelopes and solid B-rep declarations.
There was no concatenation into a purported assembly STEP and no independent
STEP geometry re-import or manufacturing drawing production.

## Final Failures And Accounting

The two original full-source compiler failures, minimal success, declaration
warnings and two compiler repairs are retained in the current result and their
historical artifacts. The precise initial source-specific failure cause remains
unknown. The successful compact numeric model and decoupled measurement validation
do not prove one particular declaration, formatting or compiler repair caused success.

Baseline used **11 attempts, 10 HTTP successes, one HTTP 400**. Revision used
**10 attempts, all successful**, for **21 attempts / 20 successes cumulative**.
Both fit 12 per phase and 24 cumulative. Baseline: eight GETs and three POSTs;
revision: eight GETs and two POSTs. Each phase needed one translation poll.
Zero supplement model/source/feature/document/share writes; export jobs used
`storeInDocument:false`; zero official tool invocations by the supplement script.

The failed baseline generic translation did not isolate a rejected field. The
format-specific `/api/v11/partstudios/.../export/step` route succeeded. Baseline
local recovery records preserve `RETAINED_FEATURE_NOT_FOUND`,
`MEASUREMENT_KEY_INVALID`, `HTTP_400` and `STEP_SIGNATURE_INVALID`. Saved successful
responses were replayed after decoding/ZIP recognition changes, without repeating
successful network requests. `startedAt` records dispatch; `completedAt` can include
later local replay work, so it is not purely network elapsed time.

Discovery remains **8 attempts / 7 successes / one HTTP 400**, not reset or reused.
All direct authenticated REST from this folder therefore totals **29 attempts /
27 successes / two HTTP 400 responses**. Historical unsigned service discovery
was separate from these CAD calls. The earlier approximate 59-call estimate is
preserved as history, not used as current accounting.

Parent quota observations: **273**, then **446** after baseline creation and
before supplements, then **479/2,500 used, 2,021 remaining**. No fresh quota query
was made. Total delta **206** includes official and possible other activity. The
parent reports other-trial successes of **83 and 31**, leaving residual **92**;
that residual is **not exact instrumented official calls**. Internal MCP request
counts are unknown and the official 100-request reserve cannot be proven met.

Parent-reported current-turn official tool calls total **13**: three usage, one
notes, six `test_feature`, one create, one source read and one source write. These
are tool invocations, not REST counts, and exceed the earlier 12-call handoff plan.
No new call is authorized to reconcile them. No authentication/scope blocker remains;
the unfulfilled UI, parameter-only, reference/DOF, human-validation and manufacturing
gates are limitations, not pending repairs.

## Current Offline Verification

Final offline verification: **80 tests passed across 16 files; 0 failed,
0 skipped, 0 cancelled**. These are local saved-evidence results, not new live calls.

[Current TAP](artifacts/current-tests.tap) and
[current validation summary](artifacts/current-local-validation.json) record all
official-trial suites, including historical provenance and both actual phases.
Tests verify response/artifact hashes, exact source readbacks, token equivalence,
names/BOM/status, all geometric checks, original image bytes, ZIP CRCs/member bytes,
same-feature revision, failure history and honest accounting. Networking is disabled
by the verifier and only this trial's saved fixtures are used.

```powershell
node trials/official-mcp/verify.mjs
```

The older [baseline TAP](artifacts/readonly-supplement/baseline-tests.tap),
preparation status files and historical validation outputs remain untouched.
Do not rerun either completed supplement or any authenticated tool.

## Historical Baseline-Only Report (Superseded)

The following is the earlier baseline-only report, preserved as an as-observed
record. Its pending revision, old quota, approximate request estimate and handoff
instructions are superseded by the complete two-stage result above. They are not
active instructions or permission for further authenticated access.

## Provenance And Scope

The [parent record](artifacts/parent-retained-baseline.json) durably attributes the
successful final test, retained `create_geometry(clean:false)`, source readback,
three images and quota observation to the parent. Those raw tool responses were
not available here; no raw bytes or hashes were invented for them. The test used
library 3070 and parent-reported source microversion `f7ae35ac5545c9d2210f0e83`.

Only document `f92dc90f7c052de045dd2c4f`, new branch
`b60d9355149429c9c55f69c8`, Part Studio `d0a579bf1b84bc1e68e06e90`,
Feature Studio `66e03cc911623af502c718c4` were authorized. Ownership and public
visibility of this branch are parent-attributed, not re-queried account metadata.
The source/feature/document write, deletion, sharing and unrelated-CAD routes
are denied. The current key is read from the current local environment file
only at runtime after explicit acknowledgement; no values or auth headers are
logged. Origin is exactly `https://cad.onshape.com`; redirects fail closed.

## Verified Baseline

The [machine report](artifacts/readonly-supplement/baseline-report.json) records:

- Retained feature `FQxpC8Q8LkpIQvt_0`, status `OK`, unsuppressed, namespace
  `e66e03cc911623af502c718c4::m5dd5c58ddf7b5c3d6b5988eb`.
- Equal initial, pre-export and final workspace microversions:
  `dd5d804ab7aa470518d44acc`. Source, parts, evaluation and PNG were pinned to it.
- Original persisted source, 4,641 bytes, token-equivalent to the local final
  baseline artifact. Its actual bytes and hash are retained separately.
- Nine individually named solids and nine total solids. All part bounds, volumes,
  cylinder radii/axes/centers and bore through-depths pass the existing validator.
- Five bores per plate; inner width 340 mm, clear roller gap 100 mm,
  plate thickness 6.35 mm. Only `coralReference` is excluded from BOM.
- Evaluation queried `qCreatedBy(makeId(retainedFeatureId) + role)` only;
  it generated no geometry. Numeric dimensions were derived from measured bounds,
  not supplied as expected values to the server or read as editable UI parameters.

[PNG](artifacts/readonly-supplement/baseline.png): 1,200 by 900 pixels, 48,171
bytes, decoded without image alteration from the retained original API response.
Local visual inspection found a nonblank, fully framed view. It is not a
manufacturing drawing or an independent visual inspection of every bore.

[Original STEP archive](artifacts/readonly-supplement/baseline-step-original.zip):
23,326 original downloaded bytes, containing nine individual STEP files. The
report lists each extracted member, original filename, byte count, CRC32 and
SHA-256. Extraction preserved the member bytes; no files were concatenated or
fabricated into a purported single assembly STEP. Each member has a STEP
envelope and solid B-rep declaration. Independent STEP geometry re-import was
not performed. The raw download was initially saved with a `.step` suffix before
its ZIP format was recognized; that original evidence file is retained unchanged.

## Request Accounting

The separate [append-only request list](artifacts/readonly-supplement/ledger.json)
contains **11 baseline requests of 12 allowed; 11 cumulative of 24 allowed**.
It does not reuse or reset the exhausted eight-request managed-discovery ledger.
Revision can use at most 12 additional requests, even though 13 cumulative slots
remain. Approximately 59 parent-reported prior calls plus these 11 means roughly
70 of the official 100-request planning reserve, excluding any concurrent parent
calls. The parent's last quota was 446/2,500, 2,054 remaining; no quota call was
made here, and no fresh quota total is claimed.

Eight GETs and three POSTs: one measurement evaluation, one failed generic
translation request, and one successful external STEP export. Only one translation
poll was needed. Ten responses were HTTP 200; the generic export returned 400.
Zero source/feature/model/document/share writes, zero official tool invocations
by this script. External export jobs used `storeInDocument:false`.

The generic export failure did not establish its exact rejected field. The
successful route follows [Onshape's format-specific export documentation](https://onshape-public.github.io/docs/api-adv/translation/):
`POST /api/v11/partstudios/d/{did}/w/{wid}/e/{eid}/export/step`.
The public documentation fetch was unauthenticated and did not query CAD or quota.
Earlier successful responses were replayed locally after legacy envelope/map
decoding adjustments and ZIP recognition, with saved-byte hashes checked. No
successful request was redispatched. Request `startedAt` records dispatch;
`completedAt` may reflect later local replay processing, not solely network time.

## Tests And Revision Handoff

[Focused TAP report](artifacts/readonly-supplement/baseline-tests.tap) records the
source, route, credential, redirect, budget, replay, geometry, ZIP checksum and
actual saved-evidence checks. These local tests make no authenticated requests.

The parent may now perform its separately authorized official MCP revision on
the same branch. After it has regenerated, with branch changes paused, run from
the repository root:

```powershell
node trials/official-mcp/supplement.mjs revision --live-readonly-export --allow-current-key --parent-branch-quiescent
```

This command only verifies and exports; it cannot apply the revision. It retains
the same feature ID and cumulative ledger, compares source with the local final
revision artifact, and requires the 360 mm width and 95 mm gap geometry. Failure
saves partial evidence. A completed phase cannot be rerun. Only a stopped phase
may use `--resume-saved-responses`; attempts remain charged and hashes must match.
Do not delete the ledger, artifacts or lock to bypass these guards. No UI-editable
parameter workflow or complete two-stage benchmark pass is claimed yet.