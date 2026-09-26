# AI CAD In Onshape: FRC Intake PoC

Evidence captured 2026-09-11. This report separates observed results from design
recommendations and vendor claims. [Open models and files](../README.md#open-the-outputs).

## Decision

**Use native templates for repeatedly edited parts, FeatureScript for procedural
geometry, and local manufacturing packages from milestone exports.** The added
trials demonstrated a six-call native revision that preserved downstream changes,
and eight-call manufacturing snapshots followed by zero-call local rerenders.
Template authoring/copying costs are real and reported separately below.

Use REST for integration and MCP as an optional agent-facing layer. The official
MCP is now tested: it created and source-revised the retained intake, but this
successful version has no exposed parameter controls and needed supplementary
REST measurement/export. Prefer the demonstrated native-template pattern where
human-editable design intent matters. These findings do not establish whole-robot
automation or actual non-coder usability.

## Common Task And Method

The [normative benchmark](../benchmark/intake.json) defines a deliberately simple
coral ground-intake packaging module: two plates, two roller sleeves, two shafts,
two crossmembers and one hollow reference tube. Each plate has two shaft holes,
two mounting holes and a pivot hole. Crossmembers are solid packaging envelopes.

Baseline inner width is 340 mm; clear roller gap is 100 mm. Revision changes them
to 360 and 95 mm in the same document, preserving feature IDs. The reference sits
in front of the intake; the design does not simulate coral acquisition, roller
compliance or floor contact. Its 114.3/101.6 mm OD/ID and 301.625 mm length are
nominal modeling assumptions, not verified regulation tolerances.

Each option was assigned a separate GPT-6 Astra agent context. Each read the same
task, researched sources, implemented, tested and reported without sibling code.
The user approved this model name and the inability to set/verify extra-high
reasoning. Separate continuations resumed each option's own artifacts. The parent
reviewed combined evidence afterward and refreshed one stale source-hash artifact.

This is exploratory, not statistically controlled: one design, nonuniform setup
and recovery work, different validators and library versions, and no model token
or total-agent-time measurement. No Playwright was used, including for screenshots;
Onshape's shaded-view API supplied images.

## Results

| Route | Observed Geometry And Revision | Editable Result | Export And Evidence |
| --- | --- | --- | --- |
| Native REST | Nine solids; 13 through-bores; 340/100 to 360/95 mm; 18 feature IDs and nine part IDs preserved | Nine sketches + nine extrudes; 12 in-place feature updates | Four PNGs; original ZIP per stage containing nine STEP parts. Baseline raw-response retention and BOM verification were incomplete. |
| FeatureScript via REST | Nine solids; all bounds, volumes and holes checked; same custom feature revised | Saved compiled source; two UI parameters; one feature containing internal operations | One PNG and one nine-solid STEP per stage. BOM exclusion set in source but not read back. |
| Community Jarvis MCP + FS | Nine solids; 103 scalar geometry checks per stage plus bore/BOM checks; same feature revised | Saved source; two parameters; MCP build/update/evaluate tools | Two PNGs and one nine-solid STEP per stage. BOM exclusion confirmed at both stages. |
| Official Onshape Labs MCP + REST verification | Nine solids, measured holes/bounds/volumes and BOM; same retained feature revised to 360/95 | Successful feature uses numeric source defaults and empty precondition; not a parameter-dialog revision | Official modeling and three returned views; supplemental REST produced verified PNG/STEP archives at both stages |
| Initial community altendky MCP | Real credential-free initialization, 11 tools, 300 endpoint catalog | Unexecuted source/call plans | No CAD. Stopped on client redirect-policy concerns; superseded for modeling by Jarvis, retained as experiment history. |

All four intake workspace links now show the revision. Baseline files are
preserved, but no versioned baseline geometry link was captured. The original native trial
retained derived baseline measurements but overwrote some raw baseline responses;
its final manifest reconciles original ZIPs using all part names and geometry.
These limitations matter for auditability even when current geometry is correct.

## Native REST Assessment

**Best fit:** controlled native operations and a conventional feature tree that a
human CAD user can inspect operation by operation. This trial used native feature
payloads, not a custom FeatureScript model disguised as REST. Native region queries
and stable default datums avoided transient face IDs for this favorable geometry.

**Costs observed:** typed feature payloads, returned-ID binding, datum/unit
conventions, sequential updates, property discovery and export handling created
considerable orchestration. The server returned a ZIP of separate STEP parts, while
the first validator expected one STEP. Correct files were recovered without
inventing a combined export. BOM property matching also needed correction.

**Robot implication:** use it for selected editable leaf operations and assembly
integration, not thousands of agent-authored low-level requests. Coordinate-defined
sketches here are not a demonstration of rich dimension constraints, semantic face
references or topology robustness. Those remain additional work.

[Implementation and full ledger](../trials/native-api/REPORT.md).

## FeatureScript Assessment

**Best fit:** parameterized module families, repeated bolt/bearing patterns,
spacers, shafts, plates and manufacturing rules. A source file is reviewable in
Git, and changing two quantities regenerated the whole nine-part module without
rewriting its source. This offers a useful unit of reuse for FRC subsystems.

**Costs observed:** the deployment needed actual source/spec readback, version
payload correction, server-returned namespaces and correct response decoding.
An expected custom entry in the feature list's `imports` was a bad local assertion,
not failed compilation. Local source/regex tests could not establish CAD success.

**Tradeoff:** operations inside one custom feature are not individual editable
native tree entries. A human edits exposed parameters or source. Avoid a monolithic
whole-robot script: independent subassemblies, controlled interfaces and versioned
references make debugging and human collaboration more manageable.

[Compiled source](../outputs/featurescript/intake.fs) and
[live evidence](../trials/featurescript/REPORT.md).

## MCP Assessment

**What it changes:** tool discovery, schemas, authentication and higher-level
operations available to the agent. It does not replace Onshape's modeling engine.
Jarvis's `write_featurescript_feature` handled deployment behind a tool call;
`update_feature` and evaluation completed the revision and measurement loop.
One MCP tool call can perform multiple REST requests.

The successful server was [ReshefElisha/jarvis-onshape-mcp](https://github.com/ReshefElisha/jarvis-onshape-mcp),
project 1.2.0, commit `b0e725852280ebcfda5d46a4f2ed2d0b720beace`, MIT. Actual discovery
returned 69 tools. Its initialization version differs from its project version;
both are recorded in the trial report. It is **community-maintained**, not official.
Vendored source hashes remained unchanged; a trial-specific launcher supplied
credential isolation, host/owned-document guards and sanitized observations.

**Tradeoff:** fewer orchestration details at the agent boundary, but another
dependency and trust boundary. Some upstream errors are text rather than structured
failures. Independent geometry validation is still essential. Only the FS route
was built through Jarvis here; its broader native/assembly tools were not tested.

The first server, [altendky/onshape-mcp](https://github.com/altendky/onshape-mcp)
v0.5.2 (MIT OR Apache-2.0), really initialized and exposed its catalog. Its generic
API schema was older than the current official schema; the local safety wrapper
could not inspect its internal redirect handling. It was not given credentials.
The proposed Rust patch was not compiled, so it is not a tested solution.

[Jarvis trial evidence](../trials/mcp/second-server/REPORT.md).

## Official MCP Correction

The initial GitHub-organization search missed a hosted product. The parent's
vendor-site check found [Onshape's August 11 announcement](https://www.onshape.com/en/blog/featurescript-mcp-server-enables-text-code-cad),
[September 3 setup guide](https://www.onshape.com/en/blog/get-started-featurescript-mcp-server),
and [PTC Inc. App Store listing](https://cad.onshape.com/appstore/apps/Onshape%20Labs/6a29aea7c03f8bf659841734).
**The official Onshape Labs FeatureScript MCP exists** at
`https://fs-mcp.labs.onshape.app/mcp`; it is an experimental hosted service, not an
open-source repository established by this research.

A separate agent prepared source; the parent executed official tools after the
user completed OAuth. The initial 401 is historical. Two larger source submissions
returned generic "no features found" errors; a trivial probe and declaration subset
worked. The second repair separated numeric geometry output from local assertions,
and final baseline/revision tests compiled with no notices. This did not establish
the exact original compile defect.

`create_geometry(clean:false)` retained a branch in the verified public managed
sandbox. A single `put_featurescript` source-default change regenerated the same
feature. Separate read-only REST evaluation verified persisted geometry/BOM and
captured PNGs and original ZIPs of nine STEP parts. This is **official MCP modeling
plus REST verification/export**, not evidence that the official tools exposed those
targeted readback/export operations. The empty precondition is a material UI limit:
the successful trial does not satisfy parameter-only edits.

The vendor listing says it provisions Workspace and Notes documents, can delete
sandbox workspaces, and counts calls against API allocation. The live trial verified
its Workspace identity/public visibility and retained one branch without cleanup.
It did not verify all Notes provisioning behavior or delete anything. Its scope
is FeatureScript authoring/testing, not demonstrated robot assembly automation.
App Store user reviews suggest workflow limitations but are anecdotes, not our
measurements or authoritative current tool contracts.

[Official live evidence and limitations](../trials/official-mcp/REPORT.md).

## Added Follow-Up Findings

### Native Template And Human Handoff

[The live native-template trial](../trials/native-template/REPORT.md) built one
left-plate template and copied it to an independent native document. A separate-editor
API simulation changed thickness to 8 mm, moved pivot Y to 30 mm and added a diameter-4
downstream hole. The AI then changed only width/gap, preserving those edits and all
unrelated definitions. Exact B-rep checks confirmed six bores, X=[-188,-180] mm and
rear shaft Y=241.2 mm. The original template's geometry, definitions and microversion
remained unchanged.

Cost: setup 58 attempts including repairs/interruption, copy eight, editor simulation
eight, AI revision six, original verification four: **84/120 attempts**, 83 known
successes and one interrupted read with uncertain allowance outcome. Revision took
about 2.14 seconds runner time, excluding setup and original re-verification. The
final tree has 34 healthy native features, seven sketches and 30 driving constraints,
without FIX constraints. Remaining solver DOF and actual non-coder UI editing are
unverified. Simulated edits prove preservation, not usability.

### Local Manufacturing Package

[The live package trial](../trials/manufacturing-package/LIVE-REPORT.md) built a
separate native one-plate fixture, captured immutable Onshape A/B versions and
extracted actual STEP geometry with CadQuery/OpenCascade. It produced dimensioned
A3 PDFs, 1:1 mm DXFs, PNG previews and unchanged original STEP bytes. B's moved
holes, sixth hole and 8 mm thickness appear consistently. Unsupported blind,
countersunk, bent or ambiguous geometry is rejected rather than silently flattened.

Cost: native setup nine calls, native revision six, snapshots eight each:
**31/80 attempts, all successful**. Cached B rerendering made zero network requests.
This is an allocation-efficient milestone workflow, not native associative Drawing
tabs or a generic production drawing system. Every sheet is TEST_ONLY and NOT FOR
MANUFACTURE; tolerances/material are assumptions, not engineer/manufacturer approval.

### Local Preflight And Browser Checkpoints

[Local preflight](../trials/local-preflight-browser/REPORT.md) completed six candidates
and 25 sweep states in its own Python 3.10/CadQuery 2.6.1 environment. Real closed-solid,
volume, bore, STEP round-trip and negative checks passed. This is an independent
geometry check, not an Onshape FeatureScript compiler or proof of kernel equivalence.

The browser stage stopped at the brief's explicit service-terms restriction gate.
No browser action, cloud model, human UI edit or account-counter delta is claimed.
Zero direct API calls do not demonstrate a working zero-quota CAD pipeline. This
is completed local work with a blocked submission stage, not a skipped experiment.

### Practical Annual Plan

Include template/copy and snapshot costs. With the final account total of 479,
a bounded example is `479 + 20*8 copies + 100*6 revisions + 50*8 packages = 1639`
successful calls, leaving 861 of 2,500, including a proposed 500-call safety reserve.
This assumes an existing demonstrated family and excludes new-family setup,
separate edit simulations, extra polling, diagnostics and other account usage.
Reserve those before promising capacity. This is a conditional example, not measured
annual throughput; AI-provider fees/time are separate and unmeasured.

## Effort And API Budget

| Route | Recorded Authenticated Requests | Failure/Recovery Context |
| --- | ---: | --- |
| Native REST | 173 completed public requests, plus one uncertain interrupted creation dispatch; one earlier private 409 | Multiple process resumes, ZIP recovery and later BOM fix; not 174 required requests for a clean build. |
| FeatureScript | 62 total; 57 successful, five HTTP errors | Includes private rejection, three diagnostic 404s, one version-payload 400, source/spec work and recovery. |
| Jarvis MCP | 34 HTTP requests behind 16 completed CAD tool calls | All HTTP 200; includes measurement, four renders, two translations and polling. Earlier server discovery/setup excluded. |
| Native template | 84 attempts, 83 successes, one uncertain interrupted read | Setup/copy/editor/revision/original verification counted; six-call revision met |
| Manufacturing package | 31 attempts, all successful | Setup, edits, two eight-call immutable milestones; rerenders use no network |
| Official MCP + REST supplement | 13 MCP invocations plus 29 direct REST attempts, 27 direct successes | Exceeded earlier 12-invocation plan by one; internal REST count unknown; no exact total-route cost claim |

These counts are operational evidence, **not a speed/cost ranking**: validators,
exports and recovery differ. Timers also have different boundaries. Native's
modeling calendar span was 196.986 s including interruptions; FS's successful
finisher took 14.170 s after prior work; Jarvis's revision/measurement stage took
6.936 s. Comparing those as build times would be misleading. Exact ledgers are in
the per-trial reports. Total agent time, tokens and monetary costs were not captured.

[Official API limits](https://onshape-public.github.io/docs/auth/limits/) currently
list 2,500 annual calls for Free/Student/Standard users, plus per-endpoint rate
limits. Only qualifying 2xx/3xx calls count; 4xx/5xx do not. The known successful
API-key calls for the original three trials total 264; one original native dispatch
has unknown outcome. The final account observation after follow-ups was **479 used,
2,021 remaining**. This continuation's account delta was 206; subtracting the added
API trials' known successes (83+31) leaves 92, not exact official attribution because
internal calls and concurrent activity were not fully instrumented. Its 100-request
planning-reserve compliance is unverified, not asserted. The two added API trials
stayed within their hard caps. Plan budgets rather than assuming unlimited use.

## Other Projects Checked

- [onshape-public/onshape-clients](https://github.com/onshape-public/onshape-clients): archived official client examples informed native payloads; not installed as a current production SDK.
- [onshape-public/go-client](https://github.com/onshape-public/go-client): pinned OpenAPI definitions informed Feature Studio/version/feature schemas.
- [hedless/onshape-mcp](https://github.com/hedless/onshape-mcp): active community candidate; metadata did not establish a license in the initial search; not runtime-tested.
- [Mbvjdev/onshape-mcp](https://github.com/Mbvjdev/onshape-mcp): MIT/Python candidate, not runtime-tested.
- [BLamy/onshape-mcp](https://github.com/BLamy/onshape-mcp): smaller TypeScript candidate; not runtime-tested.
- [ricokahler/onshape-cadscript](https://github.com/ricokahler/onshape-cadscript): MIT, local-first scripting; inspected README required a signed-in browser/native-host bridge with macOS setup, so it was not selected for this Windows API-only trial.

Repository status and license metadata are snapshots, not blanket security or
maintenance endorsements. Pinned URLs, hashes and actual commands are retained in
each agent's research artifacts. Official modeling references:
[FeatureScript](https://cad.onshape.com/FsDoc/),
[feature APIs](https://onshape-public.github.io/docs/api-adv/featureaccess/),
[API authentication](https://onshape-public.github.io/docs/auth/apikeys/).

## Next Robot-Scale Gate

Do not jump from this packaging model to a full robot. The next bounded experiment
should place the intake into an Assembly with a purchased motor, bearings and
fasteners, add pivot/roller mates, evaluate stowed and deployed envelopes, generate
a BOM and plate DXF, and repeat a width revision without broken references.

Also test one invalid gap, a deliberate topology change, an interrupted update
and a concurrent human edit. Require measurable recovery and stable part/version
identities. Define subsystem coordinate frames, interfaces and keep-outs before
composing a drivetrain, elevator, intake and end effector. Treat motors and vendor
parts as versioned purchased components rather than AI approximations.

Until those gates pass, the supported claim is **AI can create, measure, revise
and export this small parametric Onshape module without browser modeling**.