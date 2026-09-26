# Existing MCP Workflow Trial

## Result

**Overall public synthetic CAD trial: PASS, 2026-09-11.** The selected second
server completed measured baseline and same-feature revision, with actual
Onshape-rendered PNGs and STEP downloads for both. The earlier altendky safety
blocker remains preserved as the first experiment; it is no longer the overall
trial result. Detailed evidence and limitations are in
[second-server/REPORT.md](second-server/REPORT.md).

[Open the public Onshape document](https://cad.onshape.com/documents/c91dab628a4c5b87c23aa534/w/0c40bbe9087fa21610dff575/e/b5a7239c126b14bd4385f232).
The document now holds the revision. Document `c91dab628a4c5b87c23aa534`, Part
Studio `b5a7239c126b14bd4385f232`, and feature `FVktJs9uyq76hAE_0` were reused;
the revision did not recreate the model. **One public synthetic document was
created cumulatively out of the maximum three**: first experiment 0, second 1.
The resumed continuation created none. Provenance is retained in
[second-server/creation-ledger.json](second-server/creation-ledger.json).

## Current Server

The main live result uses the already selected
[ReshefElisha/jarvis-onshape-mcp](https://github.com/ReshefElisha/jarvis-onshape-mcp),
commit `b0e725852280ebcfda5d46a4f2ed2d0b720beace`, **project 1.2.0, MIT**.
Actual initialization reports `onshape-mcp` **1.26.0**, recorded separately from
the project version, and discovers 69 tools. It runs over stdio through the
existing official TypeScript MCP SDK client. All vendored Python source hashes
match the downloaded commit; local security controls are in the trial launcher,
not an upstream patch or a new MCP implementation.

The route is **community MCP+FS**: real MCP tools compile and execute FeatureScript
in Onshape, revise its quantities, measure geometry, render and export. MCP is
not a CAD kernel. No raw REST modeling fallback, browser modeling, delegation,
commit, root edit, sibling-trial read, document deletion or sharing was used in
this continuation. Keys were runtime-only; secret/config files and raw MCP
transcripts were not inspected through tools.

**Research correction: an official hosted Onshape Labs FeatureScript MCP exists.**
The original [research record](second-server/research.json) contains four GitHub
organization searches with zero matches; that narrow search missed the hosted
product. The parent verified the [vendor announcement](https://www.onshape.com/en/blog/featurescript-mcp-server-enables-text-code-cad)
and [PTC App Store listing](https://cad.onshape.com/appstore/apps/Onshape%20Labs/6a29aea7c03f8bf659841734).
A separate [official trial](../official-mcp/REPORT.md) observed HTTP 401 pending
OAuth. Jarvis remains the successful community-server experiment, not a substitute
for official-server testing. The chosen community commit's LICENSE, NOTICE,
manifest, README and source were fetched and hashed.

The existing launcher isolates credentials/environment, disables upstream logs,
proxies and transport retries, checks exact origin and owned document/translation
identity before requests, and restricts creation to public documents under the
ledger cap. Translation-ID persistence was corrected to merge current state,
preserving revision and feature IDs. Its 100-request guard is per process, not an
annual limiter. The upstream raw downloader enables redirects per request despite
the client's no-redirect default; the hook checks each hop. No redirects occurred
in the observed all-200 run. This is a scoped harness, not a general sandbox.

## Measured Public Result

| Measurement | Baseline | Same-Feature Revision |
| --- | ---: | ---: |
| Inner width | 340 mm | 360 mm |
| Clear roller gap | 100 mm | 95 mm |
| Rear roller center Y | 246.2 mm | 241.2 mm |
| Sleeve length | 330 mm | 350 mm |
| Shaft length | 378.1 mm | 398.1 mm |
| Server solids | 9 | 9 |
| Through-holes per plate | 5 | 5 |
| Coral excluded from BOM | true | true |
| Feature health | OK | OK |

Both states passed 103 scalar geometry checks at 0.01 mm tolerance plus
count/name/bore/BOM assertions. Server tight boxes, cylindrical-face centers,
diameters, axes and full-thickness spans validate ten plate holes and three
bores. These are actual server measurements, not the first experiment's local
expected-value manifests. See the
[verified evidence](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/verified-evidence.json).

| State | API Isometric PNG | API Right PNG | MCP-Downloaded STEP |
| --- | --- | --- | --- |
| Baseline | [PNG](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-render-0.png) | [PNG](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-render-1.png) | [STEP](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-export-original.step) |
| Revision | [PNG](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/revision-render-0.png) | [PNG](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/revision-render-1.png) | [STEP](second-server/runs/2026-09-11T12-31-16.089Z-851ac40f/revision-export-original.step) |

PNGs are actual 1200x900 Onshape `shadedviews` bytes returned through MCP.
Each STEP is 64,436 bytes with nine solid records, a complete ISO-10303-21
envelope, and a distinct SHA-256. Original extensionless downloads remain intact;
named STEP copies are byte-identical. **Neither export was ZIP, so no extracted
files are claimed.** Generated FeatureScript source is explicitly separate from
the downloaded CAD outputs. The detailed report links both hash manifests.

## Usage and Verification

**Second server: 16 completed CAD tool calls; 34 attempted authenticated HTTP
requests, all 34 HTTP 200; 2 completed translations; 1 public document.**
Counts include initial build, repeated full baseline measurement, both renders,
both downloads and eight translation polls. Fourteen tool calls have saved
timings; baseline render/export are two additional calls confirmed by artifacts.
SDK initialize/list messages are separate from tool calls; follow-up raw protocol
frame totals were not reconstructed. First experiment: 20 offline tool calls,
zero authenticated HTTP, zero documents, plus its zero-tool blocked preflight.

| Second-Server Stage | Tool Calls | Stage Duration |
| --- | ---: | ---: |
| Earlier baseline creation/build/readbacks | 5 | 25.558 s |
| Resumed baseline measurement | 3 | 14.107 s |
| Baseline PNG/STEP | 2 | Not recorded; outputs confirmed |
| Revision/update/readbacks | 4 | 6.936 s |
| Revision PNG/STEP | 2 | 18.420 s |

Build tool: 9.533 s; update tool: 3.758 s; revision render: 1.337 s;
revision export: 6.210 s. These are measured stage/tool durations, not full
agent-session time. Baseline output completed despite an empty terminal result
and missing final summary; it was recovered locally without replaying the export.
There were no observed failed HTTP requests or repeated modeling writes.
34 successful requests consume 1.36% of a 2,500-call annual allocation; the actual
account's remaining quota was not queried.

Current follow-up validation:
[second-server/verification.json](second-server/verification.json) and
[second-server/verification.tap](second-server/verification.tap). The scoped suite
checks authorization, isolation, decoders, measurement rejection cases,
translation-state guard, output bytes/hashes, provenance, same-ID revision and
report links. Historical first-experiment tests remain unchanged and were not
rerun during the scoped continuation.

Limitations: only width and gap are exposed custom-feature quantities; ordinary
UI editing and downstream-edit robustness were not exercised. No native feature
tree, assembly BOM, drawings, PDF/DXF, independent STEP reimport, load/clearance
analysis, or manufacturing release is claimed. STEP includes the coral reference
despite its server BOM exclusion. The successful result is a synthetic packaging
PoC, not a production-ready intake or certified secure MCP deployment.

## Historical First Experiment

**Everything below records the earlier altendky experiment at its own checkpoint.**
Its safety blocker, unexecuted plans and unknown API entitlement describe that
experiment only, not the completed public second-server result above. The old
candidate table predates direct verification of the selected second server's MIT
license. Its source proposal, executable, discovery and artifacts are preserved.

### Authorized Live Continuation, 2026-09-11

The user approved local API keys and NEW private PoC documents, with a maximum
of three new documents in this phase. Approval and the parent's key-presence
check were accepted; no credential-file read or authentication was attempted.
The safety exception in the request was exercised rather than sending credentials
to an executable whose internal writes cannot meet the destination policy.

**Local hypothesis:** disabling redirects and checking the exact approved origin
inside `OnshapeClient::execute`, before authentication, closes the observed
off-origin write path. The first narrow edit changed the reviewed vendored Rust
transport and added a static source-policy test. Immediate validation:
`node --test trials/mcp/transport-policy.test.mjs`, 1 passed. This checks source
shape, not compilation, redirects at runtime, or the released executable.

Concrete findings in the pinned upstream source:

- `crates/onshape-client-io/src/lib.rs`, `OnshapeClient::new` (upstream line 150):
  `Client::builder().timeout(timeout).build()` supplies no redirect policy.
  `execute` concatenates the base URL and request path, attaches authentication
  and a serialized JSON body, then calls `send`. MCP cannot inspect or authorize
  redirect hops before reqwest follows them.
- Pinned `Cargo.lock` selects reqwest **0.13.4**. Its public source and builder
  documentation confirm a default maximum of ten redirects and body cloning for
  307/308 responses. Cross-origin authentication headers are removed, so this
  is **not evidence of a key leak**. The unapproved destination/body forwarding
  still violates the exact-origin and guarded-write requirements. Same-origin
  redirects also bypass per-document authorization at the MCP harness boundary.
- Basic authentication dispatch calls `client.execute` once, but reqwest itself
  defaults to protocol-NACK retries. This is not proof of ambiguous POST replay;
  a hardened trial should disable automatic retries for observable call counts.
- `cargo`, `rustc`, `cl`, and `link` were not found on PATH. Conventional
  user-local Rust executable paths and Visual Studio's installer discovery tool
  were also absent. The vendored review snapshot lacks crate manifests, including
  the HTTP-client package manifest, and is not a complete build checkout.

The local source proposal disables redirects, automatic retries and proxies and
checks HTTPS, exact host, port, userinfo, fragment and the v16 API prefix before
authentication. Its retained delta is
[artifacts/transport-hardening.patch](artifacts/transport-hardening.patch).
**This is an uncompiled local fork proposal, not a hardened release or verified
fix.** The released executable is unchanged. No binary was rebuilt, substituted
or approved. Rust compilation and redirect/ownership behavior tests remain
unrun; upstream loopback HTTP tests would need an explicit test-only policy.

[live-preflight.mjs](live-preflight.mjs) is an executable **preflight only**, not
a completed modeling runner. It requires exactly `--live` and
`--confirm-new-private-document`, rejects overrides, pins the existing executable,
and refuses both that unsafe release and every unreviewed substitute. Its fixed
origin is checked in memory; credential-file configuration is never loaded.
It has no SDK transport, auth loading, REST fallback, document creation, token
fallback, credential config file, or raw message logging. Errors use a fixed
allowlist of messages, and each CLI invocation writes a new exclusive artifact.

Actual invocation:

```powershell
node trials/mcp/live-preflight.mjs --live --confirm-new-private-document
```

| Observation | Authorized Live Phase | Earlier Discovery |
| --- | --- | --- |
| Command result | Exit 1, `BLOCKED_RELEASE_REDIRECT_POLICY` | SDK worker exit 0 |
| Measured command work | **69.4333 ms**, local preflight only | **1304.6795 ms**, local discovery only |
| MCP requests / tool calls | **0 / 0** | 22 / 20 |
| Onshape HTTP requests / retries | **0 / 0** | 0 / 0 |
| New documents | **0 of maximum 3** | 0 |
| CAD build/revision duration | Not measured: neither attempted | Not measured |
| CAD outputs | None | None |
| New human interventions | 0 after supplied approval | 0 |

The actual failure, timestamps and hashes are preserved in
[artifacts/live-preflight-e8e17ba3-3e76-4fc3-9b1e-8326eaca1e29.json](artifacts/live-preflight-e8e17ba3-3e76-4fc3-9b1e-8326eaca1e29.json).
The unchanged saved geometry source is [artifacts/intake.fs](artifacts/intake.fs),
SHA-256 `f069baa4510550439a82db8ddae81934e855958fbb56bbf7255d24a036d39cac`.
These times are not full agent-session times or comparative CAD performance.

Verification: 6 focused preflight/transport tests passed, followed by **19 total
MCP-trial tests passed, 0 failed**, recorded separately in
[artifacts/live-phase-tests.tap](artifacts/live-phase-tests.tap). The old discovery
artifacts and unexecuted baseline/revision manifests were not overwritten.
Editor diagnostics reported no errors in the new JavaScript files. The retained
patch initially failed parsing because of its final terminator, then failed a
strict context check because the artifact uses CRLF and upstream source uses LF.
The terminator was repaired; this read-only check subsequently passed:

```powershell
git apply --reverse --check --ignore-space-change --directory=trials/mcp/vendor/source trials/mcp/artifacts/transport-hardening.patch
node --test trials/mcp/benchmark.test.mjs trials/mcp/safety.test.mjs trials/mcp/manifests.test.mjs trials/mcp/evidence.test.mjs trials/mcp/live-preflight.test.mjs trials/mcp/transport-policy.test.mjs
```

`setup.mjs` restores upstream review sources. After rerunning setup, the retained
proposal must be reapplied (omit `--reverse --check` above) before its static
source-policy test can pass. That does not rebuild or approve the executable.

**Remaining blocker:** obtain the complete pinned source and a usable local Rust
build toolchain, compile and behavior-test a reviewed hardened server, and bind
its actual binary hash to the harness. No global toolchain or system networking
changes were made. The downstream runner work remains unfinished: executable
response binding, ownership checks for each document-scoped call, Feature Studio
compile/version/namespace resolution, baseline custom-feature creation, same-ID
revision, server bounds/hole/BOM/feature-health validation, and MCP image/STEP
retrieval. There was no live schema error to repair because no CAD call was sent.
Private entitlement and API-key validity remain unknown, not failed.

## Selected Project

- Project: https://github.com/altendky/onshape-mcp
- Release: https://github.com/altendky/onshape-mcp/releases/tag/v0.5.2
- Reviewed source commit: `3bd1bf698818ade4ab286f0e3a7cc57289114b91`.
- License: **MIT OR Apache-2.0**. Both license files were fetched at the commit;
  the downloaded distribution retains both. Embedded Onshape OpenAPI declares
  Apache-2.0. The trial uses the released binary, not a new MCP server.
- Windows x64 archive SHA-256:
  `8cd050010f120ec893499fa34fccaba08f9919530c76a0bdbbb6d704e7948739`.
- Extracted executable SHA-256, checked before every discovery launch:
  `424d25e13acab181da32470fb1c28faa129258998ba52979b72f693a43846472`.
- Official client SDK: `@modelcontextprotocol/sdk@1.26.0` (MIT), pinned in
  [package.json](package.json); transitive versions/integrities are locked in
  [package-lock.json](package-lock.json). SDK `AjvJsonSchemaValidator` with its
  locked AJV 2020 implementation compiled all returned tool input schemas.

The public GitHub search was independently fetched and recorded in
[artifacts/repositories.json](artifacts/repositories.json). It is not a quality
ranking. The candidate triage was:

| Candidate | Evidence and Selection Relevance |
| --- | --- |
| ReshefElisha/jarvis-onshape-mcp | Python; GitHub reports `NOASSERTION` license classification. Not selected; this is not a conclusion that no license exists. |
| hedless/onshape-mcp | Python, `develop` default branch; no license identified by repository metadata. Not installed. |
| altendky/onshape-mcp | Explicit dual license, published Windows binary, headless stdio, inspectable auth/config/tool dispatch. Selected. |
| BLamy/onshape-mcp | TypeScript; no license identified by repository metadata; last push shown in 2025. Not installed. |
| Mbvjdev/onshape-mcp | MIT/Python alternative; not selected or runtime-tested. |
| ricokahler/onshape-cadscript | MIT verified in LICENSE; README requires a signed-in Chrome/native-host bridge and documents macOS support. Does not fit this no-GUI Windows route. Not installed. |

The selected README calls the project early development. Release v0.5.2 was
published 2026-08-07; public repository activity was visible in September. Recent
activity does not establish reliability or support. Release assets are mutable
according to GitHub metadata; pinned hashes detect replacement, but this trial
did not independently reproduce the Rust build or verify a signed attestation.

## Hypothesis and Check

Hypothesis stated before editing: explicit local config and isolated config/data
directories allow the existing stdio server to initialize without authentication,
so its actual tool contracts can be tested without touching Onshape CAD.

First edit implemented an environment allowlist and offline tool policy. Its
immediate focused check was `node --test trials/mcp/safety.test.mjs`: **3 passed**.
Subsequent real SDK initialization, listing, and `onshape_auth_status` with
`validate:false` confirmed the hypothesis. No synthetic credential was sent to
Onshape; test canaries were used only to assert environment exclusion locally.

## Executed Evidence

All commands below were run from the repository root, with absolute-path retries
where terminal output was unreliable:

```powershell
node --version
node trials/mcp/setup.mjs
node trials/mcp/research.mjs
node trials/mcp/discover.mjs
node trials/mcp/verify.mjs
```

| Check | Observed Result |
| --- | --- |
| Node | `v24.15.0` |
| Final setup | 21 public downloads recorded, archive hash matched, exact archive-entry allowlist passed, isolated npm installed 94 packages with exit 0 and lifecycle scripts disabled |
| Server identity | `onshape-mcp`, `0.5.2` |
| MCP protocol | Negotiated `2025-11-25`; initialized notification sent |
| Tool discovery | 11 real tools; all 11 input schemas compiled |
| Offline calls | 20 `tools/call` requests: auth status, API search, 16 endpoint explanations, schema lookup, and one deliberately invalid search |
| Protocol count | 22 requests total including initialize/list; 1 outbound notification |
| Auth | `not_configured`, `auto`, `last_check:null` |
| Negative checks | SDK validator rejected numeric search query and object-valued API body; real server returned `isError:true` for numeric query |
| Catalog | 300 embedded endpoints returned by the running server |
| Final discovery duration | 1304.6795 ms, local SDK/server/manifest work only; **not a CAD build time** |
| Process result | SDK worker exit 0, server stderr empty, SDK transport closed; binary exit code is not exposed by this SDK API |
| CAD operations | No `onshape_api_call`, login, or screenshot tool was sent; no modeling retries |
| Discovery-phase tests | **13 passed, 0 failed**, captured by isolated verifier |
| npm audit | Exit 0; 0 reported vulnerabilities in the locked graph at execution time |

Evidence files: [artifacts/setup.json](artifacts/setup.json),
[artifacts/subprocess.json](artifacts/subprocess.json),
[artifacts/transcript.jsonl](artifacts/transcript.jsonl),
[artifacts/discovery.json](artifacts/discovery.json),
[artifacts/tools.json](artifacts/tools.json),
[artifacts/endpoint-details.json](artifacts/endpoint-details.json),
[artifacts/verification.json](artifacts/verification.json), and
[artifacts/audit.json](artifacts/audit.json).

Failure history: the initial extraction guard rejected the legitimate release
subdirectory and was narrowed to its exact four entries. Some terminal attempts
exited silently or returned mismatched output; those were not counted as success.
A partial npm installation produced a missing Zod module. Isolated `npm ci`
repaired it; setup now streams npm output and records its exit. The first SDK
worker guard caught Windows injecting USERDOMAIN/LOGONSERVER, before Rust startup;
both are now explicitly synthetic. Final artifacts describe the final successful
runs, not a cumulative timing/count of all research or setup attempts. No user
intervention was requested during this phase.

## Advertised vs Actual

The README advertises document/part creation, features, screenshots, export, and
FeatureScript. Actual `tools/list` returned:

```text
onshape_mcp_get_started   onshape_auth_status   onshape_auth_login
onshape_api_search       onshape_api_explain   onshape_api_call
onshape_api_schema       onshape_list_resources
onshape_read_resource    onshape_screenshot    onshape_error_lookup
```

There is no dedicated intake/robot/assembly-design tool. Most capabilities route
through the real generic `onshape_api_call`. Its `body` argument is a **JSON
string**, not an object as one prose table suggests. `path_params`, `query_params`
and `header_params` map names to strings. A valid outer tool schema does not prove
the nested REST body, custom-feature namespace, topology, or geometry is valid.

Actual Rust dispatch executes HTTP effects, despite a stale documentation passage
saying HTTP execution is pending. Conversely, permission modes are still marked
unimplemented and are not a security boundary. The embedded spec actually selects
`https://cad.onshape.com/api/v16`, version `1.216.80836-7d2542b69551`; prose claiming
v14 is stale. The current official spec fetched in this trial selects **v17**,
version `1.220.87559-9d09f09aac42`. The server's compiled catalog does not update
automatically when Onshape changes. Live compatibility remains untested.

## Baseline and Revision

- [artifacts/intake.fs](artifacts/intake.fs): generated custom-feature source,
  standard-library version 2144.0, two length parameters, five drilled holes per
  plate, bored roller sleeves, shafts, crossmember envelopes, and hollow coral.
  Coral is named `coralReference` and assigned `EXCLUDE_FROM_BOM=true` in source.
  This source and the older pinned FS library version have **not been compiled**.
- [artifacts/baseline.json](artifacts/baseline.json): 16 unexecuted planned calls;
  width 340, clear gap 100, rear Y 246.2, sleeve length 330, shaft length 378.1 mm.
- [artifacts/revision.json](artifacts/revision.json): 11 unexecuted planned calls;
  width 360, clear gap 95, rear Y 241.2, sleeve length 350, shaft length 398.1 mm.
  Reuses the baseline document, Part Studio and feature ID; no document recreation.
- [artifacts/measure.fs](artifacts/measure.fs): unexecuted query for server solid
  count, names, and tight per-body bounding boxes. Not a complete hole verifier.

Both manifests passed actual discovered MCP input schemas and required API
path/query-parameter presence checks. They deliberately retain `$...` bindings
for returned IDs, the latest microversion, and an unresolved custom-feature
namespace. Revision must merge into the full current feature readback. These are
**call plans, not an executable live runner**. Expected bounds and hole dimensions
are local arithmetic, not measurements. Nine server solids, ten plate holes,
three sleeve bores, non-BOM status, source editability, feature health and revision
correctness are all unverified. There is no PNG or STEP artifact.

## Image and Export

Exact operations are present in both the real MCP-explained snapshot and the
current official OpenAPI captured in [artifacts/official-api.json](artifacts/official-api.json):

| Operation | Method and Path After API Version Prefix |
| --- | --- |
| `getPartStudioShadedViews` | `GET /partstudios/d/{did}/{wvm}/{wvmid}/e/{eid}/shadedviews` |
| `createPartStudioExportStep` | `POST /partstudios/d/{did}/{wv}/{wvid}/e/{eid}/export/step` |
| `getTranslation` | `GET /translations/{tid}` |
| `downloadExternalData` | `GET /documents/d/{did}/externaldata/{fid}` |
| `getPartStudioBodyDetails` | `GET /partstudios/d/{did}/{wvm}/{wvmid}/e/{eid}/bodydetails` |
| `evalFeatureScript` | `POST /partstudios/d/{did}/{wvm}/{wvmid}/e/{eid}/featurescript` |

Image response type is `BTShadedViewsInfo`; the selected screenshot implementation
extracts `images[0]`, base64-decodes it, and writes a file. It sets `pixelSize=0`
for auto-fit and computes a view matrix from the requested preset/angles. Its
write success alone does not validate PNG signature, dimensions, framing, holes,
or part count. No screenshot call was executed.

STEP uses the format-specific async endpoint with explicit `storeInDocument:false`
(the format-specific schema defaults it to true), `stepVersionString:"AP242"`,
and notifications/automatic download disabled. A future runner must poll at
bounded, rate-conscious intervals until `DONE` or `FAILED`, then use
`resultExternalDataIds` as download `fid` values. Check the actual downloaded
bytes and units; an accepted/queued translation is not export success. Do not
follow arbitrary returned URLs or forward credentials to a different host.

Onshape's official FS guide says bounding-box REST results are approximate for
graphics. Tight dimensional checks should use `evBox3d(..., tight:true)` through
`evalFeatureScript`; body details with `includeGeometricData:true` are additionally
needed to check hole radii/axes/topology. A complete hole decoder/verifier is not
implemented here. An image cannot substitute for these checks.

## Security and Robot Gaps

Startup, config, token-path resolution, tools registry/dispatch, and HTTP executor
source were inspected at the pinned commit. `--config` selects only our
credential-free TOML, but token fallback/watching is separate. Fresh absolute
`XDG_CONFIG_HOME`/`XDG_DATA_HOME`, HOME/profile/temp paths are therefore mandatory.
SDK default inherited fields are explicitly overridden. No original PATH, proxy,
NODE_OPTIONS, auth variables or user npm config is forwarded. Real server
discovery runs under an isolated SDK worker. This is **not an OS security sandbox**;
the prebuilt executable still runs with the user's filesystem privileges.

The harness denies all flags, host overrides and live-capable tool calls. It uses
only compiled-spec search/explain/schema and cached auth status. The transcript
proves no live API tool dispatch; it is not a packet capture or proof against a
malicious replacement binary. The selected API-key implementation is Basic over
TLS, not HMAC. Auth-login schemas accept secrets and generic API errors can return
raw server bodies: do not reuse this full transcript policy for credentialed runs.
Windows file-permission checks are a no-op in actual code despite stronger prose
guidance. No Rust dependency/security audit or exhaustive binary audit was run.
Zero npm advisories is a dated registry result, not a security guarantee.

| Whole-Robot Risk | Remaining Work |
| --- | --- |
| Persistent references | Verify `qCreatedBy` continuity and actual part/face IDs across revisions; do not attach mates using unverified transient IDs. |
| Editable features | Compile/install the custom feature and verify both parameters plus source round-trip; one procedural feature is not a native per-operation feature history. |
| Repeated parts | Demonstrate configured instances and versioned reuse, not duplicated geometry across many studios. |
| Assemblies and mates | No assembly, joints, motion, interference or drivetrain mechanisms were built; generic endpoints do not solve assembly planning. |
| Purchased components | Validate vendor geometry, metadata, part numbers, units and import licensing; motors/bearings/fasteners are excluded here. |
| BOM | Verify coral exclusion and a complete assembly BOM; a source property assignment is not BOM proof. |
| Rate limits | Measure actual request/retry behavior; add bounded translation polling and Retry-After/backoff handling before scaling. |
| Recovery | Persist IDs from a new private document; reject stale microversions, avoid blind retries of create calls, journal progress, and stop without deletion or public fallback. |

## Reproduction and Live Blocker

Prerequisites: Windows x64, Node 24, Windows `tar.exe`, public GitHub/npm access.
No Python environment, new workspace scaffolding, browser extension, or server
configuration outside this trial is needed. Run the four trial commands above in
order. Setup uses a hash-pinned GitHub release and `npm ci` when the lockfile is
present, with lifecycle scripts disabled and trial-local cache/config. Ignored
`vendor/`, `node_modules/`, `.npm-cache/` and `runtime/` are recreated locally.

**There is still no executable CAD runner.** The authorized continuation added
`node trials/mcp/live-preflight.mjs --live --confirm-new-private-document`, which
records and exits on the concrete release-transport blocker described above.
`node trials/mcp/discover.mjs --live` also remains intentionally rejected before
launch or credential read. No root `.env.local` loader is present. Do not invoke
the raw server with credentials as a substitute for the missing guarded runner.

A subsequent authorized phase must first implement/review credential loading in
memory, an exact HTTPS Onshape-host/redirect allowlist, new-private-document-only
ownership guards, secret-safe observations, response binding, FS compile/import
verification and hole/export validation. Private-document entitlement must be
confirmed; failure must stop with no public fallback. Only then can a real
baseline/revision CAD trial establish acceptance. Authentication did not block
discovery; it is intentionally absent for the unexecuted CAD phase.

## Public Sources

Exact fetched GitHub file URLs and SHA-256 values are in
[artifacts/setup.json](artifacts/setup.json). Public metadata/OpenAPI fetch URLs,
statuses and hashes are in [artifacts/public-fetches.json](artifacts/public-fetches.json).
These are the principal independently fetched sources:

- https://api.github.com/search/repositories?q=onshape%20mcp&sort=stars&per_page=8
- https://api.github.com/repos/altendky/onshape-mcp/git/ref/tags/v0.5.2
- https://api.github.com/repos/altendky/onshape-mcp/releases/tags/v0.5.2
- https://api.github.com/repos/altendky/onshape-mcp/commits/3bd1bf698818ade4ab286f0e3a7cc57289114b91
- https://raw.githubusercontent.com/altendky/onshape-mcp/3bd1bf698818ade4ab286f0e3a7cc57289114b91/crates/onshape-mcp-core/src/tools.rs
- https://raw.githubusercontent.com/altendky/onshape-mcp/3bd1bf698818ade4ab286f0e3a7cc57289114b91/crates/onshape-mcp-io/src/config.rs
- https://raw.githubusercontent.com/altendky/onshape-mcp/3bd1bf698818ade4ab286f0e3a7cc57289114b91/crates/onshape-mcp-io/src/oauth.rs
- https://raw.githubusercontent.com/altendky/onshape-mcp/3bd1bf698818ade4ab286f0e3a7cc57289114b91/crates/onshape-client-io/src/lib.rs
- https://registry.npmjs.org/@modelcontextprotocol/sdk/1.26.0
- https://raw.githubusercontent.com/ricokahler/onshape-cadscript/main/README.md
- https://raw.githubusercontent.com/ricokahler/onshape-cadscript/main/LICENSE
- https://api.github.com/repos/ricokahler/onshape-cadscript/commits/main
- https://cad.onshape.com/api/openapi
- https://cad.onshape.com/glassworks/explorer/
- https://docs.rs/reqwest/0.13.4/src/reqwest/redirect.rs.html
- https://docs.rs/reqwest/0.13.4/reqwest/struct.ClientBuilder.html
- https://cad.onshape.com/FsDoc/library.html
- https://onshape-public.github.io/docs/api-adv/translation/
- https://onshape-public.github.io/docs/api-adv/partstudios/
- https://onshape-public.github.io/docs/api-adv/fs/

No token usage, monetary cost, CAD speedup, relative score, or statistical ranking
was measured or inferred from this single offline trial.