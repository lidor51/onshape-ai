# Native Template Follow-Up Report

Date: 2026-09-11. **FINISHED: live geometry, independent copy, editor preservation,
six-call revision, and original-template verification PASS.** This supersedes the
old credential-blocked report. The user explicitly authorized the current key
despite its historical exposure; that authorization is not a rotation attestation.
Credentials were loaded only into runtime memory. This continuation used only
native-template, the two existing trial-owned public documents, and the existing
append-only ledger. No browser, delegation, sibling/shared edits, new document,
reset, document deletion, or custom FeatureScript was used in this continuation.

## Actual Onshape Results

- [Original native template](https://cad.onshape.com/documents/2f23d55654f456b946061a5f/w/ccfd8b5117a32b5fb46baaeb/e/0b24f166452add1bd85ec855): unchanged baseline, 32 native features, five through-holes.
- [Revised independent editable copy](https://cad.onshape.com/documents/2db9a7eda58817bb0ba921b8/w/511535852de274d393a2ea6c/e/87e35d1bfe08c90c7ac97c4f): width 360 mm, gap 95 mm, preserved editor thickness 8 mm, pivot Y=30 mm, and sixth 4 mm through-hole.

The copy was made with `copyWorkspace`, not by rebuilding features, importing a
solid, or inserting a derived link. Both documents were independently confirmed
public. The copied native tree matched the baseline, contained no source-document
reference, and subsequently accepted ordinary native variable and sketch/cut
edits. Human interaction with those dialogs was not tested.

All measurements below are validated against actual Onshape REST B-rep, bounds,
and mass-property responses pinned to their feature-readback microversions.

| State | X bounds mm | Thickness mm | Rear shaft Y mm | Pivot Y/Z mm | Through-holes | Volume mm3 |
| --- | --- | --- | --- | --- | --- | --- |
| Original baseline / copied baseline | -176.35 to -170 | 6.35 | 246.2 | 25 / 130 | 5 | 301875.7093467633 |
| Separate-editor API simulation | -178 to -170 | 8 | 246.2 | 30 / 130 | 6 | 380215.3233302207 |
| Final AI revision | -188 to -180 | 8 | 241.2 | 30 / 130 | 6 | 380215.3233302207 |
| Original remeasured after revision | -176.35 to -170 | 6.35 | 246.2 | 25 / 130 | 5 | 301875.7093467633 |

Every state has Y bounds 0..320 mm and Z bounds 12.7..162.7 mm and exactly one
solid. Final hole centers in world Y/Z, with diameter in mm: (70,65)/12.9,
(241.2,65)/12.9, (140,135)/6.6, (300,135)/6.6, (30,130)/12.9,
and editor-added (200,40)/4. Throughness is verified from cylindrical faces,
full circular boundary lengths at both X faces, cylinder area, and total volume.
It is not inferred from feature names or a shaded image. Bound/center comparisons
use 0.00001 mm tolerance; volume tolerance is max(0.01 mm3, one part per million).

## Preservation And Constraints

The AI revision changed only `innerWidth` and `rollerGap`, feature IDs
`Fyd8SSJSmaf2Hyz_0` and `FpNVMyouOXqRcKO_0`. Both native `value` and
`lengthValue` expressions were updated. All other ordered feature definitions,
including the editor's thickness, pivot and downstream sketch/cut, matched the
pre-revision readback. Only server-generated `nodeId` fields and evaluated
quantity values are ignored; expressions and feature identities remain compared.
See [preservation.json](artifacts/preservation.json) for the exact hashes.

The original's microversion stayed `43b8e4916a8e7e781726665a`, and its normalized
feature definitions and measured geometry match the saved setup exactly. The
final copy microversion is `ae2732bc911e3cf419bf1a7d`. Part identities are resolved
as the single semantic solid, not assumed to survive copying or regeneration.

Server readback confirms 19 ordinary native variable controls. Baseline/copy have
32 features, six sketches and 27 constraints; editor/revision have 34 features,
seven sketches and 30 constraints. All features report `OK`, with no suppression
or custom namespace. The profile has 12 constraints: four coincident corners,
horizontal/vertical edges, a horizontal-position anchor, and driving bottom,
length and height dimensions. Each hole circle has two driving position distances
and one driving diameter. No FIX or driven/reference dimensions were used.
Examples read back include `#plateLength`, `#plateHeight`, `#plateBottomZ`,
`#pivotY`, and the rear-hole dependency through `#rearRollerY`.

These source definitions and successful regeneration support native design intent;
**exact remaining solver DOF is UNVERIFIED** because the adapter does not expose
it. Important controls live in ordinary native feature dialogs/constraints, not
only local JSON. Holes are dimensioned circle sketches plus bounded REMOVE
extrudes driven by thickness, not Onshape's native Hole feature. Measured geometry
proves those cuts are through for this case, not for arbitrary later edits.

Observed runtime: Node v24.15.0, API v17, native library 3070, serialization
1.2.21. Public OpenAPI revision `1.220.87559-9d09f09aac42` and exact source URLs
are in [source research](sources/README.md). Native parameter specs were also
read from the actual template before authoring.

## Exact Cost And Timing

**Cumulative: 84/120 attempts, 83 successful HTTP responses, 0 HTTP failures,
1 historical interrupted read with unknown allowance outcome, 0 blind/automatic
retries, 2 documents total. Remaining trial budget: 36 attempts.** The interrupted
GET was reconciled by later owned reads, not erased or counted as a known success.
The continuation started at 66 attempts and added exactly 18, all successful.

| Phase | Attempts | Successes | Unknown allowance outcomes | Recorded request ms | Phase wall span ms |
| --- | --- | --- | --- | --- | --- |
| Setup, including earlier repairs | 58 | 57 | 1 | 39567.1886 | 605437 |
| Independent copy | 8 | 8 | 0 | 11554.3185 | 11941 |
| Separate-editor simulation | 8 | 8 | 0 | 6404.0791 | 6878 |
| AI revision | 6 | 6 | 0 | 1854.8500 | 2225 |
| Original-template verification | 4 | 4 | 0 | 3144.4287 | 3350 |

Recorded request time totals **62524.8649 ms**, excluding the interrupted read's
unrecorded duration. Phase wall spans include phase bookkeeping, pauses and repairs.
The full ledger window, including inter-invocation gaps, is **1307954 ms
(21 min 47.954 s)**, from 16:00:36.408Z to 16:22:24.362Z. These are not total
agent labor or uninterrupted network time. The revision runner itself measured
**2141.5516 ms**; its phase wall span including ledger overhead was 2225 ms.
Unrounded clock values and each request timestamp are in the receipts.

The six revision requests were: GET features, guarded POST feature updates, GET
features, GET bodydetails, GET massproperties, GET boundingboxes. The three
geometry GETs used the observed revision microversion. The four original-template
verification requests are explicitly outside the six-call figure. No screenshot,
export, quota query or download is hidden in these totals; the optional PNG was
omitted to conserve calls.

Earlier setup stopped on nested native-parameter spec handling,
`FEATURE_METADATA_UNVERIFIED` from the mutation response's library-version zero
sentinel, and `SERVER_HOLE_POSITION` from the cylinder-axis response adapter.
Local tested repairs and read reconciliation completed setup without replacing
the document. The successful verification retained the same geometry microversion
as the earlier hole-position check. All those attempts remain in setup's 58.
There was no live endpoint or geometry failure during this continuation. One local
summary command had a quoting syntax error; the file-based finalizer then passed
without spending another API request.

## Tests And Receipts

**30 tests passed, 0 failed across 11 Node test files.** The suite covers native
source/schema handling, credentials and redaction, geometry/units/containment,
dependency and exact patch binding, preservation, stale/conflicting state,
copied-ID rebinding, bounded ownership, persistent ledger caps, unknown outcomes,
and constructed-server phase control. Negative stale/intervening-editor cases
are local tests, not a fabricated live concurrency conflict.

[finish.mjs](finish.mjs) additionally replays all five saved feature/geometry
validations, recomputes preservation and original-template equality, checks the
state/ledger hash and consecutive attempts, and refuses to publish completion
unless the six-call result agrees. Its first execution passed; it makes zero
network requests and never reads credentials. Editor diagnostics: none.

- [summary.json](artifacts/summary.json): LIVE_COMPLETE, URLs, every phase's measurements, native feature maps, detailed constraint expressions, microversions and costs.
- [call-ledger.json](artifacts/call-ledger.json): sanitized complete cumulative event ledger, including setup recoveries and the interrupted read.
- [tests.json](artifacts/tests.json) and [preflight.json](artifacts/preflight.json): current local executed-suite/source bindings.
- [preservation.json](artifacts/preservation.json): actual revision definition comparison and original microversion equality.
- [Live state](live/state.json), [append-only ledger](live/ledger.jsonl), and per-phase `*-geometry-response.json` / `response-*-getPartStudioFeatures.json`: ignored raw CAD evidence retained locally.
- [Execution preflight](live/execution-preflight.json) and [execution tests](live/execution-tests.json): archived 30-test receipts used by the live run, before adding the offline finalizer. The live execution source hash is `1bfa50a3a502f9394cf909bbfe0b4ab8a2efc981a23410f14555e7bc7dbb2ad9`.

The remaining `*-analytic.json`, `*-native.json`, `*-map.json` and
`revision-patch.json` files are local candidates/expectations, not substituted for
measured evidence. Raw responses remain in the ignored live directory; published
summary/ledger/preservation receipts contain the sanitized result. No secrets or
signed headers are included.

To rerun only local checks and regenerate final receipts, from repository root:

```powershell
node trials/native-template/run.mjs --offline
node trials/native-template/finish.mjs
```

The first command refreshes offline receipts; the second restores the completed
live summary from retained evidence. Neither contacts Onshape. Do not replay
completed live phases or remove the ledger to run them again.

## Gates And Limits

| Required gate | Result | Limitation |
| --- | --- | --- |
| Native parameter/constraint source and measured geometry | PASS | Exact solver DOF remains UNVERIFIED. |
| Independent editable copy without rebuilding | PASS | Readback and API edits, not a human UI observation. |
| Revised geometry and downstream preservation | PASS | One bounded plate family and one revision. |
| Original template unchanged | PASS | Same microversion, definitions and measured geometry. |
| Stale/conflicting patch detection | PASS locally | No deliberate live concurrent-edit race. |
| Verified revision in six successful requests | PASS | Setup, copy, editor and original verification are separate costs. |
| Actual non-coder UI editing | UNVERIFIED | Only the separate-editor API simulation ran; see [checklist](UI-CHECKLIST.md). |
| Manufacturing/production release | UNVERIFIED | Not this trial's deliverable. |

Saved shared-account snapshot: 273/2500 used before this trial. Its reservations
were native 120, manufacturing 80, official 100, annual safety 500, leaving 1427
unreserved calls. This is historical planning evidence, not a fresh account quota;
other concurrent use is unknown. Our 84 attempts are cumulative within that native
reservation, not 84 additional to a restarted 120-call allowance.

Planning equation: `setup + copies * copyCost + revisions * revisionCost +
editorEdits * editorCost + verification + packages * packageCost + otherUsage <= 2000`.
Using this single trial's measured costs, a hypothetical one setup, ten copies,
ten editor edits, twenty revisions and one original verification, plus the saved
273 other calls, gives `58 + 10*8 + 10*8 + 20*6 + 4 + 273 = 615` conservative
calls. That leaves 1385 below 2000 for packages and other work, preserving 500 of
2500. This includes the observed setup repair cost and unknown read. It is a
planning example, not measured annual throughput or authorization for more runs.
Package cost is unknown here, not zero; sibling results were not consulted.

No paid kernel, template, subscription upgrade or external dependency was used.
External AI/provider cost is unmeasured. New topology/families need new authoring
and validation with unknown cost; this six-call result does not generalize to a
whole robot. No manufacturing files, material assignment, tolerances, fits, FEA,
assemblies/mates, BOM or fabrication approval are established. Credential rotation
remains recommended after use, but its historical status did not block this
explicitly authorized continuation.