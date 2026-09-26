# Independent official MCP report

## Current Final Outcome

**PASS_BASELINE and PASS_REVISION with supplemental read-only REST**, finalized
2026-09-11. Official Onshape Labs MCP performed modeling; supplemental REST
measured persisted geometry and exported PNG and STEP ZIPs. This is **not a pure
official-tool capability pass**. Finalization used only saved official-trial
evidence, with no authenticated requests, credentials, delegation, sibling reads,
new modeling or repairs. No current authentication or scope blocker remains.

[Retained final model](https://cad.onshape.com/documents/f92dc90f7c052de045dd2c4f/w/b60d9355149429c9c55f69c8/e/d0a579bf1b84bc1e68e06e90):
document `f92dc90f7c052de045dd2c4f`, new branch `b60d9355149429c9c55f69c8`,
Part Studio `d0a579bf1b84bc1e68e06e90`, Feature Studio `66e03cc911623af502c718c4`,
same feature `FQxpC8Q8LkpIQvt_0` (`OfficialIntakeFinal`). The parent reports one
official `create_geometry(clean:false)` in the verified managed public document,
not a trial-created new document. Saved discovery establishes document visibility;
the parent returned and retained this new branch. One `put_featurescript` revised
the same studio/branch; its `null` response alone is not regeneration evidence.

| Persisted measurement | Baseline | Revision |
| --- | --- | --- |
| Inner width / clear gap | 340 / 100 mm | 360 / 95 mm |
| Thickness / bores per plate | 6.35 mm / 5 | 6.35 mm / 5 |
| Named solids / feature state | 9 / OK, unsuppressed | 9 / OK, unsuppressed |
| BOM exclusion | coralReference only | coralReference only |
| Workspace microversion | dd5d804ab7aa470518d44acc | 4bcde993e8baf4730d3a12db |
| Namespace source ID | m5dd5c58ddf7b5c3d6b5988eb | mf3fe3ec444fb32385ab49edc |
| Supplement requests | 11 | 10; cumulative 21 |
| PNG | [Baseline](artifacts/readonly-supplement/baseline.png) | [Revision](artifacts/readonly-supplement/revision.png) |
| Original nine-member STEP ZIP | [Baseline](artifacts/readonly-supplement/baseline-step-original.zip) | [Revision](artifacts/readonly-supplement/revision-step-original.zip) |

Both saved reports verify the same feature ID, names, part IDs and BOM properties;
persisted `qCreatedBy` bodies pass bounds, volumes, cylinder axes/radii/centers and
through-depth checks. Each phase's before/pre-export/after microversions match.
The actual revision namespace comes from its snapshots, not the baseline namespace
stored in the static target binding. Saved source readbacks are token-equivalent
to local payloads but whitespace-different; actual retained hashes are:

- [Baseline source](artifacts/readonly-supplement/baseline-persisted.fs), 4,641 bytes:
  `7cd0ac34fd4eb1d800caa64a39fdd50356e4c7b116895d68dcb6b417178691ec`.
- [Revision source](artifacts/readonly-supplement/revision-persisted.fs), 4,640 bytes:
  `c2dde13d448cdf311821b18b8ce33a0d8dbe4eb721c0bf99a728a755e11b0a3e`.

The parent reports final baseline and revision `test_feature` success, no notices,
library 3070, source microversions `f7ae35ac5545c9d2210f0e83` and
`115bb1bc5897d287c56a0039` respectively. The
[baseline console](artifacts/baseline-live-console.txt) is saved and passes the
validator. Full raw revision test output was not saved: its nine-part/correct-value
outcome remains parent-attributed, with no fabricated console or raw-response hash.
The revision supplement independently proves persisted regeneration after the write.

### Gates And Limitations

Geometry, both feature statuses/names/BOM, same-feature revision, source tokens,
images, original ZIP/member integrity and phase-consistency gates pass. Both PNGs
were locally inspected as nonblank and fully framed. Each ZIP has nine unmodified
individual STEP files, not a combined assembly STEP.

The final retained feature has **EMPTY precondition and numeric defaults, not
exposed UI controls**. Revision changed source defaults 340/100 to 360/95:
**not parameter-only**. Earlier inner-feature UI controls and flag-based revision
preparation below describe historical source, not this final feature. Non-coder UI
editing and pure official-tool measurement/export gates are not met. Downstream
references, assembly degrees of freedom and human UI validation were not exercised;
stable observed part IDs are not substitutes. No manufacturing drawings or
independent STEP geometry re-import were produced. Literal new-document creation
is not demonstrated; the retained result is a new managed branch.

### Failures And Accounting

The parent reports six `test_feature` calls: two full-source failures, minimal
success, a declaration probe with unused-declaration warnings, final baseline
success, revision success. Two compiler repairs were used, within the two-repair
cap. Initial failures were source-specific but their precise cause is unknown.
Successful compact numeric modeling and decoupled measurement validation do not
prove a particular compiler repair caused success. Historical failures and
NOT_SUBMITTED/READY/BLOCKED preparation snapshots remain unchanged, not relabeled.

Direct supplement: **21 attempts / 20 successes**, including one baseline HTTP 400;
baseline 11/12, revision 10/12, cumulative 21/24. Discovery: **8 attempts / 7
successes**, including one HTTP 400, with its ledger never reset. Combined direct
authenticated REST from this folder: **29 attempts / 27 successes**. No REST model
writes occurred. Baseline decoding/export recoveries and unchanged original
responses remain in the supplement ledger; replay completion times are not pure
network timings. Full modeling elapsed time is unknown.

Parent quota observations were **273**, **446** after baseline create/before
supplements, then **479/2,500 used; 2,021 remaining**. No fresh quota call here.
The delta **206** includes official and possible other activity; subtracting
parent-reported other-trial successes **83 and 31** leaves **92**, which is **not
exact instrumented official calls**. MCP-internal REST counts remain unknown;
compliance with the official 100-request planning reserve is not established.
The earlier approximate 59-call estimate is historical, not current accounting.

The parent reports **13 official tool calls** in this modeling turn: usage 3,
notes 1, `test_feature` 6, create 1, source read 1, source write 1. Tool calls are
not internal REST calls. Thirteen exceeds the earlier 12-call handoff plan; that
gate is not claimed met. The direct REST caps and two-repair cap were met.

### Evidence And Verification

Final offline verification: **80 tests passed across 16 files; 0 failed,
0 skipped, 0 cancelled**. No new live compilation or request was performed.

[Current machine result](artifacts/current-live-result.json) is the authoritative
current summary, including parent-attributed completion, both actual phase reports,
hashes, failure provenance, accounting and individual gates.
[SUPPLEMENT-REPORT.md](SUPPLEMENT-REPORT.md) details saved readbacks and exports.
[Current validation](artifacts/current-local-validation.json) and
[full TAP](artifacts/current-tests.tap) record all official-trial tests, including
historical provenance and both saved phase reports. The verifier blocks networking
and uses only local official fixtures. Old test logs and statuses remain history.

```powershell
node trials/official-mcp/verify.mjs
```

No further authenticated requests, probes, source writes or repairs are needed or
authorized for finalization. Remaining workflow gaps are limitations, not blockers
to reporting the completed trial.

## Historical Preparation Outcome (Superseded)

Everything below is a historical as-observed record. Its present-tense statuses,
unspent budgets, source forms and suggested next actions applied at those earlier
stages only. Do not execute those instructions or reinterpret them as the current
result; the final outcome and gates above supersede them without altering evidence.

**Public sandbox identified; complete official geometry payloads ready for parent
dispatch. CAD remains UNVERIFIED.** The latest pass performed local-only compaction,
with no authenticated requests, credential loading, sibling reads or sibling edits.
The eight earlier authorized read-only managed-document discovery requests remain
historical prerequisite evidence, not authorization for further REST access. No
official tool was called here because the mandatory loader is absent. There were
no model writes, retained branches, browser operations, delegation or commits.

The unique `FeatureScript MCP Workspace` is public: document
`f92dc90f7c052de045dd2c4f`, default workspace `f635457a22317d08c72c7d93`.
The exact Notes search found no matching document. The evidence comes from
allowlisted search results and direct metadata, not account plan inference.
It does not independently inspect the MCP's internal configured target. Conflicting
parent target information is a stop condition. Raw responses, personal account
fields, credentials, headers and unrelated CAD were neither printed nor saved.

[HANDOFF.md](HANDOFF.md) contains exact parent tool arguments, file paths, full
hashes and the bounded dispatch/response-validation sequence. The original
independent generator was adapted, not replaced or sourced from another trial.
New source now uses the parent-verified live 3070 and common import 3070.0. The
original local-only 2500 source was never read from a server Feature Studio and did
not qualify for the existing-server-code exception. The parent already read
official notes and received `No notes added yet.` All second-argument feature
defaults are supplied. The compact test/baseline sources are 12,658 characters;
revision is 12,659. Expected arrays round-trip without loss and whitespace removal
preserves strings and token boundaries. The generator and tests use only this
trial's saved snapshots, not a fresh shared-fixture read. No local test establishes
3070 compiler, units or cylinder-surface API compatibility.

The empty-precondition self-test builds baseline and revision in the transient
evaluation with distinct IDs: nine solids per phase, 18 total. It asserts each
solid's bounds and volume, five cylindrical through-holes per plate, sleeve bores,
axis directions, center locations, full through extents, inner width and clear
gap. Length tolerance is 0.00001 mm; volume tolerance is max(0.001 mm^3, expected
volume * 1e-8). Output explicitly says transient, not persisted. Local tests verify
the generated expectations and assertion structure, not execution by Onshape.

The retained baseline wrapper has default baseline=true and empty parameter maps.
Its revision changes only the exported source flag to false. Stable wrapper and
operation IDs avoid intentionally replacing the feature. The local binder requires
actual returned retained IDs and exact baseline source readback before preparing
the final one-time `put_featurescript` payload. This is a code-default edit, not a
parameter-only change. Source readback alone cannot prove regenerated geometry or
unchanged persisted feature identity. A second `create_geometry` is not a revision.

The empty retained wrapper exposes no UI controls, limiting its UI rating. The
inner feature still has width, gap and thickness controls, but the retained
instance does not. The official tools expose no parameter patch. The source-default
revision is retained explicitly and is not represented as a parameter-only edit.

| New continuation observation | Actual result |
| --- | --- |
| Parent quota observation | 273/2,500 used; 2,227 remaining; not freshly polled here |
| Direct REST discovery | 8/8 GET attempts; status 400 then seven 200 responses |
| Local guarded recovery passes | 3; listing shape, partial Notes absence, visibility schema |
| Discovery budget | All 8 consumed inside official 100-request reserve; no more raw REST |
| Discovery execution time | 6,571 ms summed active runs; 16:00:24.112Z through 16:04:17.801Z observation window |
| Official calls / compiler attempts / compiler repairs | 0 / 0 / 0; at most two compiler repairs allowed for parent dispatch |
| Retained branches / model writes | 0 / 0; prepared create payload explicitly uses clean:false |
| End quota / persisted CAD / image / STEP | UNVERIFIED; no invented observations |

The first query with a 100-item page returned 400; the 20-item, filter=0 shape
returned 200. This does not isolate which query property caused the 400. Notes
absence initially prevented retaining partial Workspace evidence, then direct
metadata used the explicit `public` visibility field rather than `isPublic`.
The guard now accepts only consistent boolean visibility fields. All failures
and every request remain in [artifacts/managed-discovery.json](artifacts/managed-discovery.json).
The one-shot guards and request ledger prevent another live run from resetting
the cap. Current-key authorization is recorded separately from rotation; no
rotation claim is made.

Focused discovery, generator, evidence, and dispatch-binding tests passed. The
expanded own-directory verifier writes actual results to
[artifacts/local-validation.json](artifacts/local-validation.json) and
[artifacts/tests.tap](artifacts/tests.tap). A public library webpage extraction
attempt failed and is not compiler evidence. Some terminal responses belonged to
unrelated concurrent commands; they were excluded and own scoped checks rerun.
One generator invocation returned an empty exit-1 result; explicit module
invocation then generated and validated the artifacts successfully. No sibling
source/report was inspected to diagnose those terminal responses.

The 14 existing exposed contracts remain the capability baseline. They do not
expose a targeted Part Studio parameter update, persisted-body readback, image or
STEP export. Parent dispatch and validation must preserve these limitations and
the distinction between transient evaluation, saved source, and persisted geometry.

## Earlier outcome (superseded)

**FINISHED continuation; CAD BLOCKED at tool loading and public sandbox scope.**
The parent reports a successful authenticated official `get_api_usage` after the
user subscribed and completed client OAuth. Authentication is no longer the
current blocker. The continuation exposes 14 official tool descriptions, but its
mandatory `tool_search` loader is not callable. No official tool was invoked here.
No model source was written to Onshape, and no document, image, or STEP URL exists
for this trial. Compilation, exact bodies, and persisted revision remain unverified.

This is an Onshape-built, vendor-hosted **experimental Labs service**. The official
August 11 and September 3, 2026 articles establish vendor provenance and the
subscription requirement. They do not establish a public implementation repo or
an OSS license. Hosted server revision and implementation license are undisclosed
in the evidence gathered. No third-party server was used under the official label.

## Earlier authenticated continuation

The user requested an independent GPT-6 Astra continuation. That is the supplied
trial label, not an independently verified model/runtime identity. Ownership
remained exclusively `trials/official-mcp/`; there were no sibling reads, shared
edits, new subagents, commits, API-key access, raw network, or browser operations.

Local hypothesis: the exposed contracts do not by themselves enforce the authorized
NEW PUBLIC synthetic-only scope. The cheap check was to inspect their actual input
properties and the official public guides for explicit visibility and dedicated
sandbox provenance, after checking for the mandatory deferred-tool loader.

Observed boundary: no callable `tool_search` is provided by this session. It was
not possible to dispatch a search, load official tools, run even a trivial lambda,
read service notes, or perform the requested end quota check. This is a client
tool-interface limitation, not an Onshape authentication failure or a failed server
request. No raw MCP/REST fallback was attempted.

Separately, `create_geometry(feature_name, feature_code, clean)` selects the
service-configured document version and creates a NEW branch. It cannot take a
document ID or public visibility flag. Its default `clean: true` deletes the new
workspace afterward; any authorized use MUST pass `clean: false`. The current
subscription and account plan do not prove visibility. Both official guides were
retrieved again using `fetch_webpage`; neither returned positive evidence of a
dedicated/public managed sandbox. The getting-started guide describes a user-created
test document with Part Studio and Feature Studio, not a visibility guarantee.
No sandbox document/workspace/element IDs or live library version were returned.

The user permits normal managed sandbox/notes provisioning and a trivial
nonmutating discovery lambda, but model source writes still require established
scope. `test_feature` itself writes a Feature Studio and adds a helper feature;
it is not a scope-free compiler probe. It must precede any geometry create and
requires full defaults as the second `defineFeature` argument and a common import.
The independent source retains its historical 2500 pin and remains unchanged.
Required notes, default/import adaptation, and live compiler diagnostics are still
pending; at most two compiler retries are allowed. No version mismatch was observed.

The revision remains width/gap 340/100 to 360/95 mm, nine solids and five holes per
plate. Two `create_geometry` calls would create separate branches, not demonstrate
an in-place revision. No explicit Part Studio parameter-update, persisted-body
readback, document visibility, image, or STEP capability is exposed. `put_featurescript`
can overwrite source in an identified studio, but that alone does not establish
parameter editing or persistent regenerated geometry. Evaluation-local geometry
would not be counted as persistent CAD.

### Invocation and quota ledger

| Observation | Result |
| --- | --- |
| Parent's successful official usage call, not repeated first | 269 used / 2,500 limit / 2,231 remaining; personal allocation |
| Parent's allocation cycle / reported overage flag | 2026-01-02 through 2027-01-02 / false |
| Further official invocations in this continuation | 0 of 12; no server failures or retries observed |
| Compiler attempts / retries | 0 / 0; retry cap 2 |
| Retained geometry branches | 0 of 2; no deletion or cleanup |
| Continuation planning reserve | 100 REST requests, separate from other 200 and safety reserve 500 |
| Near-end quota observation / observed delta | BLOCKED by absent loader / unknown, not zero |
| Public documentation retrieval | 2 successful `fetch_webpage` calls, no authenticated CAD calls |
| Human interventions during continuation | 0; subscription/OAuth reported before handoff |

The parent balance is the last known observation, not a freshly checked remaining
balance. Official tools may use multiple internal REST requests. Concurrent
activity is unknown, so exact self usage and an end-to-start delta are not claimed.
The first recorded continuation clock is 2026-09-11T14:01:49.643Z; this excludes
initial context reads. The first full local verification started at
2026-09-11T14:05:27.645Z and passed 21 tests in 2,276 ms. A later timestamp command
returned unrelated concurrent-terminal output, which was excluded without reading
or using sibling implementation files. Full continuation elapsed time is not
claimed. The verifier saves its own actual test timestamps and duration.

Sanitized parameters and results are in
[artifacts/continuation.json](artifacts/continuation.json). The official invocation
array is deliberately empty; the parent observation and public-page calls are
separate. [artifacts/continuation-tool-contracts.json](artifacts/continuation-tool-contracts.json)
records the 14 context-exposed contracts as summaries, not a fabricated `tools/list`
response. No user email, identity, tokens, cookie values, or auth stores were read
or retained. The setup now uses the actual server name
`onshape-official-featurescript`.

## Historical unsigned probe

Hypothesis: an exact, unsigned Streamable HTTP initialize request will return
either a usable MCP initialization result or an authentication challenge without
requiring API-key guessing. The cheap first check exercised the JSON-RPC envelope,
HTTP headers, and evidence redaction locally; all four initial tests passed before
the live request. Local fixtures are protocol tests, never server-success evidence.

Actual probe: **2026-09-11T12:54:34.006Z**, requested MCP **2025-06-18**.

| Request | Status | Sanitized observation |
| --- | --- | --- |
| POST `https://fs-mcp.labs.onshape.app/mcp`, method `initialize` | 401 | JSON response; Bearer challenge; `invalid_token`; no session, cookie, or redirect header |
| GET `https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource/mcp` | 200 | Resource matches the MCP endpoint; header bearer transport; hosted issuer |
| GET `https://fs-mcp.labs.onshape.app/.well-known/oauth-authorization-server` | 200 | Issuer matches; authorization code and refresh token; PKCE S256; registration endpoint |

The sanitized challenge preserves:

```text
Bearer error="invalid_token", resource_metadata="https://fs-mcp.labs.onshape.app/.well-known/oauth-protected-resource/mcp"
```

Other challenge text was deliberately not retained. Metadata advertises
`https://fs-mcp.labs.onshape.app/authorize`, `/token`, and `/register`.
**None was called.** Token endpoint authentication advertises `client_secret_post`
and `client_secret_basic`; compatibility with a particular client's managed
registration is untested. URLs in saved metadata are normalized, including root
slashes. Free-form body messages and unknown metadata fields are omitted.

The runner observed **3 unauthenticated discovery HTTP requests, 0 retries,
1,830 ms elapsed**. These are discovery transport observations only. They are not
Onshape CAD API usage, a budget estimate, or a comparison with authenticated trials.
No `tools/list` was sent after the historical failed initialization. No tools were
discovered at that time; this does not imply the server has zero tools. No user
login or subscription action was performed by this trial. The later parent-reported
authentication success and exposed contracts are recorded separately above.

The immutable evidence is
[artifacts/probe-2026-09-11T12-54-34-006Z.json](artifacts/probe-2026-09-11T12-54-34-006Z.json).
The request is generated by [protocol.mjs](protocol.mjs); transport and metadata
handling are in [probe.mjs](probe.mjs).

## Independent preparation

[generate.mjs](generate.mjs) reads only the common intake fixture and generates
[intake.fs](intake.fs), with no sibling source reuse. Two drilled plates, two bored
roller sleeves, two shafts, two solid crossmember envelopes, and one hollow staged
PVC reference are defined as separate bodies. The reference is clearly named and
sets `PropertyType.EXCLUDE_FROM_BOM` to true. Stable role-based operation IDs are
used, but downstream reference stability has not been exercised on Onshape.

| Local expectation | Baseline | Revision |
| --- | --- | --- |
| Inner width | 340 mm | 360 mm |
| Clear roller gap | 100 mm | 95 mm |
| Rear roller center y | 246.2 mm | 241.2 mm |
| Plate outer x | +/-176.35 mm | +/-186.35 mm |
| Roller sleeve length | 330 mm | 350 mm |
| Shaft overall length | 378.1 mm | 398.1 mm |
| Crossmember span | 340 mm | 360 mm |
| Solids / holes per plate | 9 / 5 expected | 9 / 5 expected |

The same feature source supports both states through editable length parameters;
same-document revision is prepared, not performed. Analytic artifacts include all
fixture values, expected bounds/volumes, hole axes/diameters, and fixture/source
SHA-256 hashes. Local tests also exercise an 8 mm thickness change and reject
overlapping or out-of-bounds plate holes. The exported evidence helper computes
server-context geometry only when invoked in Onshape; it was **not executed**.
It does not itself prove feature diagnostics, parameter values, or BOM properties.
Those need separate authenticated checks through discovered capabilities.

## Verification

Continuation commands actually used from the workspace root:

```powershell
node --test trials/official-mcp/evidence.test.mjs
node trials/official-mcp/verify.mjs
```

The first focused run passed 5 tests. The expanded source-bound run passed all
21 local tests with no live requests. Editor diagnostics found no errors in the
changed trial files. These checks validate local source expectations and evidence
consistency, not FeatureScript compilation, authentication, or Onshape geometry.
The latest verifier output is preserved in
[artifacts/local-validation.json](artifacts/local-validation.json) and
[artifacts/tests.tap](artifacts/tests.tap).

Historical commands, not rerun as live operations during this continuation:

```powershell
node --test trials/official-mcp/protocol.test.mjs
node --test trials/official-mcp/protocol.test.mjs trials/official-mcp/probe.test.mjs
node trials/official-mcp/probe.mjs --live-unsigned
node --test trials/official-mcp/generate.test.mjs
node trials/official-mcp/generate.mjs
node trials/official-mcp/verify.mjs
```

The first three local runs passed 4, 10, and 5 tests respectively. The final
source-bound run is recorded in [artifacts/tests.tap](artifacts/tests.tap) and
[artifacts/local-validation.json](artifacts/local-validation.json). Editor checks
reported no errors for the JavaScript modules inspected. This is not a FeatureScript
compiler result. The public library webpage extractor failed; two credential-free
Node fetches of that public page succeeded (HTTP 200, 1,786,199 bytes on the first
read) and checked primitive, property, measurement, and Cylinder signatures.
The first attempt to read the terminal's long-output file used a mistyped path;
the corrected read succeeded. Neither issue concerned the MCP endpoint.

## Remaining gates

| Requirement | Status |
| --- | --- |
| Official vendor identity and hosted endpoint | Verified from official guides |
| Unsigned initialization and public auth metadata | Historical 401/200/200 preserved, not current auth diagnosis |
| User subscription and client OAuth completion | User-reported; parent successful authenticated usage call |
| Actual tools and execution contracts | 14 exposed summaries; required loader unavailable; none invoked here |
| Dedicated public sandbox / explicit visibility | BLOCKED, no identifiers or positive evidence |
| Independent baseline/revision source and expectations | Prepared and locally tested |
| Onshape compilation, errors, nine solids, bounds, holes, BOM flag | UNVERIFIED |
| Revision in the same document | UNVERIFIED |
| Onshape-rendered image and STEP | BLOCKED |

Follow [README.md](README.md#secure-vs-code-setup) for exact user/client setup and
[README.md](README.md#live-handoff-gates) for authorization gates. Restore the
required loader and establish sandbox scope before any model write. Only NEW PUBLIC
synthetic intake documents are authorized. This continuation is capped at 12 further
official invocations, two retained geometry branches, and two compiler retries,
with explicit public scope, positive verification, and retained identities. No prior document
access, deletion, publishing, sharing changes, browser modeling, login automation,
custom OAuth flow, or community-server fallback is permitted.

## Whole-robot risks

- Persistent references: role-based IDs help intent, but Boolean topology changes
  and external references require actual regeneration/revision tests.
- Editability: three dimensions are feature parameters; other fixture dimensions
  require a source edit. A custom feature is not a native sketch-by-sketch tree.
- Repeated parts: this is a nine-body Part Studio design, not reusable instances
  with assembly identity, configurations, or quantity-aware BOM handling.
- Assemblies and purchased parts: mates, motion, bearings, motors, vendor part
  imports, and contact behavior are absent and excluded from this packaging task.
- BOM: the reference exclusion is authored but unverified; real part numbers,
  material, procurement, fasteners, and assembly quantities are not addressed.
- Service limits and recovery: authenticated rate limits and Labs availability
  were not measured. Preserve returned identities and checkpoints, avoid replaying
  ambiguous creates, and save ephemeral evidence promptly. No deletion-based repair.
- Manufacturing and release: no tolerance, FEA, rule compliance, or production
  readiness claim follows from generated code or analytic expectations.