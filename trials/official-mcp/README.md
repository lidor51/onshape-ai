# Official Onshape MCP trial

## Final Result

**Baseline and persisted revision PASS, with supplemental read-only REST.**
Official Onshape Labs MCP performed the modeling. Separately authorized REST
readbacks verified persisted geometry and exported PNGs and original STEP ZIPs.
This is **not a pure official-tool capability pass**. Finalized 2026-09-11 using
saved evidence only: no new authenticated requests, credential reads, delegation,
sibling reads or model repairs. No authentication or scope blocker remains.

[Open the retained final model](https://cad.onshape.com/documents/f92dc90f7c052de045dd2c4f/w/b60d9355149429c9c55f69c8/e/d0a579bf1b84bc1e68e06e90).
The parent created one new branch with official `create_geometry`, feature name
`OfficialIntakeFinal`, and `clean: false`, then called `put_featurescript` once on
the same Feature Studio and branch. Its `null` response alone proves nothing;
the saved revision source, feature status and measurements prove regeneration.
This is a new branch in a verified public managed document, not a claimed new
document creation. The earlier NEW PUBLIC requirement and tool-loading BLOCKED
observations remain historical records, not the current outcome.

| Saved result | Baseline | Revision |
| --- | --- | --- |
| Status | PASS_BASELINE | PASS_REVISION |
| Measured inner width / clear gap | 340 / 100 mm | 360 / 95 mm |
| Plate thickness | 6.35 mm | 6.35 mm |
| Named solids / bores per plate | 9 / 5 | 9 / 5 |
| Retained feature status | OK | OK |
| BOM exclusion | coralReference only | coralReference only |
| Direct supplement requests | 11 | 10; cumulative 21 |
| Image | [Baseline PNG](artifacts/readonly-supplement/baseline.png) | [Revision PNG](artifacts/readonly-supplement/revision.png) |
| Original export | [Baseline ZIP](artifacts/readonly-supplement/baseline-step-original.zip) | [Revision ZIP](artifacts/readonly-supplement/revision-step-original.zip) |

Each original ZIP contains nine individually extracted, byte-preserved STEP
members, not a concatenated assembly STEP. Both source readbacks, feature statuses,
names, BOM flags, measured bounds/volumes/cylinders and phase-stable microversions
are covered by offline saved-evidence tests.

## Limits And Accounting

The retained feature has an **empty precondition and numeric defaults**, not
exposed UI controls. Revision was a **source-default edit, not parameter-only**.
Same feature and part IDs do not prove downstream reference stability. Assembly
degrees of freedom, human UI operation, manufacturing drawings and independent
STEP geometry re-import were not tested. Local PNG inspection is not human UI
validation or inspection of every bore.

The parent-observed evidence reports quota **479/2,500 used; 2,021 remaining**.
No quota was freshly queried here. The delta from 273 is 206, including other
activity. Subtracting the parent's other-trial successes, 83 and 31, leaves 92,
**not an exact instrumented official request count**. MCP-internal REST counts
remain unknown. Saved direct REST ledgers contain 29 attempts and 27 successes:
21 supplement attempts plus 8 discovery attempts, each group with one HTTP 400.
The parent reports 13 official tool invocations; this exceeds the earlier
12-invocation handoff plan. The 100-request official planning reserve is not
proven met. Direct REST caps and the two-compiler-repair cap were met.

## Current Evidence And Verification

Final offline verification: **80 tests passed across 16 files; 0 failed,
0 skipped, 0 cancelled**. This revalidates saved evidence; it is not a new live run.

- [Current machine result](artifacts/current-live-result.json): identities, actual
  source hashes, both stages, parent-attributed outcomes, failure history and gates.
- [Main report](REPORT.md) and [supplement report](SUPPLEMENT-REPORT.md): current
  results, provenance, request accounting and limitations.
- [Baseline report](artifacts/readonly-supplement/baseline-report.json) and
  [revision report](artifacts/readonly-supplement/revision-report.json): original
  saved REST evidence, complete export-member hashes and measurements.
- [Current local verification](artifacts/current-local-validation.json) and
  [complete TAP output](artifacts/current-tests.tap): all official-trial suites,
  including historical evidence checks. Historical validation files are preserved.
- [Retained baseline source](artifacts/readonly-supplement/baseline-persisted.fs)
  and [retained revision source](artifacts/readonly-supplement/revision-persisted.fs):
  actual bytes, distinct from the whitespace-different prepared payloads.

Run from the workspace root with Node 24 or newer; no installation is required:

```powershell
node trials/official-mcp/verify.mjs
```

The verifier uses only this trial's own snapshots, disables networking for tests,
and writes current verification artifacts. Do not rerun live discovery, compiler
probes, generation, modeling or supplements to finalize this trial.

The service is vendor-hosted, experimental Onshape Labs, configured as
`onshape-official-featurescript`. A public implementation repository or OSS
license is not established by the [saved sources](artifacts/sources.json).

## Historical Setup And Preparation (Superseded)

Everything below, plus [HANDOFF.md](HANDOFF.md) and [FINAL-REPAIR.md](FINAL-REPAIR.md),
is archived preparation, not current status or permission to execute. Earlier
UNVERIFIED results, source forms, unspent budgets, authentication instructions and
suggested next actions applied only at those earlier stages. The final result above
supersedes them without relabeling their evidence. No historical live command is
authorized by this finalization.

### Historical Reproduction

Run these commands from the workspace root with Node 24 or newer. No dependency
installation is required. Both commands are offline. The historical unsigned
probe is retained for evidence but must not be rerun. Only official modeling
tools may perform the authorized parent dispatch; the narrow REST discovery
exception is complete and is not a modeling route.

```powershell
node trials/official-mcp/generate.mjs
node trials/official-mcp/verify.mjs
```

The historical probe uses the raw MCP 2025-06-18 Streamable HTTP protocol, requests both JSON
and SSE, rejects redirects, and sends no Authorization or Cookie header. It has
20-second per-request timeouts, a 1 MiB response limit, an eight-request ceiling,
and no retries. It lists tools only after a compatible initialization and accepted
initialized notification. Session IDs and pagination cursors remain in memory.
The CLI exit code reports probe execution, not CAD success; read artifact `status`.

Saved evidence uses an allowlist. Cookie/session values, redirect destinations,
free-form errors, response bodies, tokens, and credentials are never persisted.
Public metadata URLs are HTTPS host-checked and query/fragment-free. OAuth values
outside the allowlist are omitted; URL serialization normalizes root slashes.
On successful future discovery, only explicitly labelled structural schema subsets
would be saved, not complete contracts suitable for unattended execution.

## Secure VS Code setup

1. The user signs in manually and subscribes to the
   [official Onshape Labs app](https://cad.onshape.com/appstore/apps/Onshape%20Labs/6a29aea7c03f8bf659841734).
  The continuation user reports completion; the parent reports a successful
  authenticated usage call. This trial did not inspect account identity or tokens.
2. The parent manages the workspace MCP configuration separately. The minimal
   server entry is shown below; do not add API keys, environment files, an
   Authorization header, or a guessed OAuth client ID.
3. In VS Code run **MCP: List Servers**, select `onshape-official-featurescript`, inspect the
   endpoint, and start it. Review the trust prompt where offered. Let the standard
   client handle the OAuth challenge and registration if supported.
4. Complete any client-opened authorization and consent flow personally. The agent
   must not navigate login, inspect cookies, collect credentials, or implement a
   token flow. Never put codes, tokens, client secrets, or raw auth logs in chat.
5. After connection, enable the official server in Chat's **Configure Tools** and
   request discovery. Save sanitized tool schemas before planning tool calls. If
   cached discovery is stale, use **MCP: Reset Cached Tools** and restart the server.

```json
{
  "servers": {
    "onshape-official-featurescript": {
      "type": "http",
      "url": "https://fs-mcp.labs.onshape.app/mcp"
    }
  }
}
```

Observed metadata advertises authorization code, refresh token, PKCE `S256`, and
dynamic registration, but token endpoint authentication lists `client_secret_post`
and `client_secret_basic`, not `none`. This is not a tested claim of VS Code login
compatibility. If registration/client authentication fails, stop and ask Onshape
Labs support for the supported client setup. Do not guess a client ID, register a
custom client manually, build a token proxy, or repurpose Onshape REST API keys.
Record only the sanitized failure category and HTTP status. Subscription remains
an independent vendor prerequisite, not something the 401 proves is missing.

## Benchmark artifacts

- [intake.fs](intake.fs): independently generated reusable feature and an unevaluated
  `officialIntakeEvidence` helper for bounds, volumes, solid counts, and cylinders.
- [artifacts/baseline.json](artifacts/baseline.json) and
  [artifacts/revision.json](artifacts/revision.json): complete task parameters,
  part bounds, five hole definitions per plate, analytic volumes, and source hashes.
- [artifacts/probe-latest.json](artifacts/probe-latest.json): latest sanitized
  discovery evidence; timestamped probe files preserve historical observations.
- [artifacts/live-status.json](artifacts/live-status.json): explicit blocked and
  unverified acceptance states from the earlier continuation, retained as history.
- [artifacts/continuation.json](artifacts/continuation.json): parent authentication
  evidence and blockers from the earlier continuation, not the current status.
- [artifacts/managed-discovery.json](artifacts/managed-discovery.json): current
  sanitized public-sandbox provenance and all eight discovery attempts.
- [artifacts/dispatch-manifest.json](artifacts/dispatch-manifest.json): current
  source/payload hashes, entry points, pin policy and unverified CAD status.
- [artifacts/continuation-tool-contracts.json](artifacts/continuation-tool-contracts.json):
  14 exposed input-contract summaries, explicitly not a fresh server response.
- [artifacts/tests.tap](artifacts/tests.tap) and
  [artifacts/local-validation.json](artifacts/local-validation.json): actual local
  test output and source-bound validation summary, produced by the verifier.

Feature inputs are `innerWidth`, `rollerGap`, and `plateThickness`, expressed as
FeatureScript lengths. Baseline: 340, 100, 6.35 mm. Revision: 360, 95, 6.35 mm.
Other fixture dimensions are generated constants. New source uses version 3070 and
standard library 3070.0, as reported by the parent's prior live version test.
The original 2500 source was local-only, not source read from a server studio;
the existing-server-code version exception never applied. Compilation is unverified.
Compact dispatch sources preserve all expectation values and checks and are below
14,000 characters. Generation now uses only saved official-trial analytic snapshots;
the original shared fixture hash is retained but not freshly checked.

## Live handoff gates

The continuation exposes official tool descriptions, including `test_featurescript`,
`test_feature`, and `create_geometry`. This is context-provided contract evidence,
not a fresh `tools/list` response or an executed CAD tool. The mandatory
`tool_search` loader is absent from this session's callable interface. Do not bypass
the loader with raw network requests, REST, credentials, or browser modeling.

Before a mutation, establish creation of a **NEW PUBLIC synthetic intake** document
using an explicit public flag, verify returned visibility positively, and persist
its document/workspace/element identities locally. This continuation permits at
most 12 further official tool invocations and two retained geometry branches, with
a 100-request planning reserve separate from the other 200 requests and 500-request
safety reserve. Tool invocations are not individual Onshape REST requests.
Record every attempted call; never retry an ambiguous create or delete anything.

The exposed `create_geometry` branches the service's configured document version.
It has no document selector or public visibility flag, and `clean` defaults to
`true`. Any future authorized call MUST explicitly pass `clean: false`. Managed
sandbox/notes provisioning is permitted service behavior, but dedicated/public
sandbox provenance must be established before writing model source. Subscription
or plan type is not proof of public visibility. The newest exact-name discovery
positively verified document `f92dc90f7c052de045dd2c4f`, default workspace
`f635457a22317d08c72c7d93`; retain and check these IDs as specified in the handoff.

After tool loading is available, a trivial nonmutating test lambda is permitted
to learn the library version and any returned sandbox identifiers. Read the
official FeatureScript notes before source changes. The parent already read them
and received `No notes added yet.` New source uses the already reported live 3070;
no new authenticated requests or credential loading occurred during compaction.
All three defaults now exist in the second `defineFeature`
argument, and the common import and self-contained test are prepared. These
adaptations are locally tested but not compiler-tested. Obtain real
`test_feature` diagnostics before creation, with at most two compiler retries.

The retained wrapper has empty controls, so its UI rating is limited. The three
length controls belong to the inner feature, not the retained instance. Revision
changes an exported source flag; it is not a parameter patch. The official schema
does not support that patch. Actual 3070 surface/unit compatibility still needs
the parent's compiler and runtime diagnostics, not local regex checks.

Use the same feature/document for the revision. Obtain actual server compilation
diagnostics, nine named solids, all bounds, five plate holes per side, sleeve bores,
and revised values. Confirm the non-BOM reference property independently. Persist
sanitized evidence and source hashes immediately because runtime tool output can
be ephemeral. Obtain Onshape-rendered media and STEP only through discovered,
authorized capabilities. Browser use is prohibited for this continuation. Mark every
missing acceptance result BLOCKED or UNVERIFIED rather than substituting local
expectations. Keep per-call timing, failures, retries, and human interventions.
`create_geometry` alone creates a new branch per call; that is not evidence of an
in-place baseline-to-revision edit. Lambda-local bodies are not persisted CAD.
No explicit image, STEP export, or document visibility/readback tool is exposed
in the supplied contract set. Check usage once near the end if the loader becomes
available; report an observed allocation delta, not exact self usage under
concurrent activity. Never change the allocation to work around a failure.