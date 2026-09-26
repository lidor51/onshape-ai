# Public MCP Intake Trial

## Result

**PASS for the synthetic CAD benchmark on 2026-09-11.** The existing public
baseline was measured, revised in place, measured again, and exported through
the selected community MCP server. Both states have nine server solids, ten
plate through-holes, correct tight bounds and bores, and a server-confirmed
coral BOM exclusion. Both have actual Onshape-rendered PNGs and downloaded STEP.
This is not a manufacturing approval or a complete robot mechanism.

[Open the public Onshape document](https://cad.onshape.com/documents/c91dab628a4c5b87c23aa534/w/0c40bbe9087fa21610dff575/e/b5a7239c126b14bd4385f232).
It now contains the revision. Baseline artifacts were captured before revision.

- Document: `c91dab628a4c5b87c23aa534`.
- Workspace: `0c40bbe9087fa21610dff575`.
- Part Studio: `b5a7239c126b14bd4385f232`.
- Feature: `FVktJs9uyq76hAE_0`, unchanged from baseline through revision.
- Feature Studio: `fdbca5cd112689993ad9fd48`.
- Public document creation: **1 of maximum 3 cumulative**; first experiment 0,
  selected second server 1. No document was created during this resumed turn.

[Creation provenance](creation-ledger.json),
[current state](runs/2026-09-11T12-31-16.089Z-851ac40f/state.json), and
[verified evidence](runs/2026-09-11T12-31-16.089Z-851ac40f/verified-evidence.json)
bind the outputs to the owned newly created public synthetic document. No other
document was modeled, shared, deleted, or queried by a document-scoped call.

## Server and Sources

The selected server remains
[ReshefElisha/jarvis-onshape-mcp](https://github.com/ReshefElisha/jarvis-onshape-mcp),
commit `b0e725852280ebcfda5d46a4f2ed2d0b720beace`, project version **1.2.0**, MIT.
The actual MCP initialization reports `onshape-mcp` version **1.26.0**; this is
recorded separately and must not be mistaken for the project release version.
Actual discovery returned **69 tools**. The existing TypeScript MCP SDK client
launches the project's Python stdio server; no replacement MCP framework was
created. The project license and notice remain in
[vendor/LICENSE](vendor/LICENSE) and [vendor/NOTICE](vendor/NOTICE).

**Research correction:** an official hosted Onshape Labs FeatureScript MCP exists.
The parent found the [August 2026 vendor announcement](https://www.onshape.com/en/blog/featurescript-mcp-server-enables-text-code-cad)
and [official App Store listing](https://cad.onshape.com/appstore/apps/Onshape%20Labs/6a29aea7c03f8bf659841734).
It is separately evaluated in `trials/official-mcp/`; this trial remains community
Jarvis, not the official service. The original GitHub-only search below missed a
hosted product and must not be used as evidence that no official option exists.

The saved
[source research](research.json), fetched 2026-09-11, records HTTP 200 and zero
repository matches for each of these exact GitHub repository searches:

- [org:onshape MCP](https://api.github.com/search/repositories?q=org%3Aonshape%20MCP)
- [org:onshape-public MCP](https://api.github.com/search/repositories?q=org%3Aonshape-public%20MCP)
- [org:PTCInc Onshape MCP](https://api.github.com/search/repositories?q=org%3APTCInc%20Onshape%20MCP)
- [org:ptc-iot-sharing Onshape MCP](https://api.github.com/search/repositories?q=org%3Aptc-iot-sharing%20Onshape%20MCP)

These are limited public repository checks, not proof that no private, renamed,
unindexed, or subsequently released official service exists. The same research
records hashes and successful downloads of the selected commit's tree, README,
LICENSE, NOTICE, project manifest and Python source. The first trial's official
API/OpenAPI research is preserved separately; an official API is not an official
MCP server. No vendor endorsement is claimed.

## Route and Local Changes

The route is **community MCP + Onshape FeatureScript (MCP+FS)**. The MCP tool
`write_featurescript_feature` compiled the source and inserted the custom
feature. `update_feature` changed its two quantity parameters. Onshape's backend
created the B-rep; MCP is transport and tool orchestration, not a geometry kernel.
There was no raw REST modeling fallback, browser modeling, or GUI automation.

All vendored Python sources still match their recorded upstream hashes.
The local security changes are in [launch.py](launch.py) and
[discover.mjs](discover.mjs), not a patched upstream release:

- Runtime-only credentials; isolated child environment, dotenv search disabled,
  unrelated credentials/proxy settings excluded, upstream logging disabled, and
  persisted result data scrubbed. Credential/config files and raw MCP transcripts
  were not inspected through tools during this continuation.
- Injected HTTP client uses `trust_env=False`, zero transport retries and a
  no-redirect client default. A request hook checks HTTPS, exact approved host and
  port, GET/POST methods, owned document or recorded translation identity before
  dispatch. The upstream raw downloader explicitly enables redirects per request;
  the hook still checks each hop. All 34 observed responses were 200, so no redirect
  behavior was exercised live.
- New creation requires public visibility and an unused creation ledger slot;
  successful response provenance establishes ownership. Delete/share calls are
  not used. The current ledger has one creation attempt and one public success.
- Request guard is **100 attempted requests per launched process**, not a
  cumulative annual limiter. Actual cumulative second-server usage is 34.
- Translation recording now merges the current saved document state before
  writing IDs, preserving feature identity and the revision flag. Both completed
  translation IDs and the original feature ID remain in the final state.

This is a scoped trial launcher, not an OS sandbox or a general authorization
layer for all 69 tools. No new security framework or third server was introduced.

## Measurements

Measurements come from `eval_featurescript` on the live Part Studio, not from
local expected values or rendering inference. [measure.mjs](measure.mjs) queries
tight body/face boxes, cylindrical surface radius/axis/origin, and the coral
`EXCLUDE_FROM_BOM` property. Each state passes **103 scalar geometry checks**
at **0.01 mm** tolerance plus count/name/bore/BOM assertions. Feature readbacks
report `OK`; the revision tool also returns structured `ok: true`, `status: OK`.

| Measured Quantity | Baseline | Revision |
| --- | ---: | ---: |
| Inner width | 340 mm | 360 mm |
| Clear roller surface gap | 100 mm | 95 mm |
| Rear roller center Y | 246.2 mm | 241.2 mm |
| Roller sleeve length | 330 mm | 350 mm |
| Shaft length | 378.1 mm | 398.1 mm |
| Left plate X interval | -176.35 to -170 mm | -186.35 to -180 mm |
| Right plate X interval | 170 to 176.35 mm | 180 to 186.35 mm |
| Plate through-holes | 5 per plate | 5 per plate |
| Server solids | 9 | 9 |
| Coral excluded from BOM | true | true |

Per plate, measured hole diameters are 12.9, 12.9, 6.6, 6.6 and 12.9 mm. Their
YZ centers are front roller `(70,65)`, rear roller `(246.2,65)` or `(241.2,65)`,
crossmembers `(140,135)` and `(300,135)`, and pivot `(25,130)`. Cylindrical face
X spans cover the full 6.35 mm plate thickness. Roller bores are 12.7 mm; coral
bore and all nine bodies' tight bounds also pass their saved expectations.

[Baseline measurements](runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-decoded.json),
[baseline validation](runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-validation.json),
[revision measurements](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-decoded.json),
[revision validation](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-validation.json),
and [same-ID update result](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-update.json)
provide the detailed evidence. Body-detail responses are retained for both phases.

## Outputs

| Phase | API Isometric PNG | API Right PNG | Actual STEP |
| --- | --- | --- | --- |
| Baseline | [PNG](runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-render-0.png) | [PNG](runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-render-1.png) | [STEP](runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-export-original.step) |
| Revision | [PNG](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-render-0.png) | [PNG](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-render-1.png) | [STEP](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-export-original.step) |

All four PNGs are 1200x900, returned as MCP `ImageContent` from Onshape
`shadedviews`; the isometric renders were visually inspected and are nonblank.
The right baseline view was also inspected. They are not local synthetic renders.

Both STEP payloads are **64,436 bytes**, plain ISO-10303-21 with nine
`MANIFOLD_SOLID_BREP` records and a complete closing marker. Onshape gave an
extensionless filename; the original server-saved files remain untouched and the
named `.step` copies are byte-identical. **Neither payload is ZIP; no extracted
files were used.** The helper can retain and extract ZIP in a future run, but
that path was not exercised against a live ZIP here. The local
[intake.fs](runs/2026-09-11T12-31-16.089Z-851ac40f/intake.fs) is generated source,
not an exported CAD file. Its standard-library version was raised from the
preserved first experiment's 2144 to 2931 before the earlier successful build.

- Baseline STEP SHA-256: `e326330462bfcccddf6ad2ffe538822e211689e860cd144e89a89df36a7c17e5`.
- Revision STEP SHA-256: `e3b947a3cf325706ee6b9d6b4150c59b524e7ccdd243e41568e22bc4840b4846`.
- [Baseline output manifest](runs/2026-09-11T12-31-16.089Z-851ac40f/baseline-outputs.json)
  and [revision output manifest](runs/2026-09-11T12-31-16.089Z-851ac40f/revision-outputs.json)
  contain original filenames, sizes, image hashes and explicit provenance.

## Counts and Timing

**16 completed CAD MCP tool calls, 34 attempted authenticated HTTP requests,
34 responses, all HTTP 200, one public document, two translations.** Tool count
includes 14 timed calls and the two baseline-output calls recovered from their
saved results. SDK initialization and `tools/list` are not tool calls; raw MCP
protocol frame totals were not logged/reconstructed for this follow-up.

| Stage | Tool Calls | Measured Stage Time |
| --- | ---: | ---: |
| Earlier baseline creation/build/readbacks | 5 | 25.558 s |
| Resumed full baseline measurement | 3 | 14.107 s |
| Baseline PNG/STEP | 2 | Unavailable; output artifacts confirm completion |
| Same-feature revision and measurements | 4 | 6.936 s |
| Revision PNG/STEP | 2 | 18.420 s |

The build tool itself took 9.533 s; the update tool 3.758 s; revision render
1.337 s; revision STEP translation/download 6.210 s. Stage times include process
startup and local persistence, not full agent-session work. Summed HTTP response
durations are 33.044 s; parallel rendering means that is not wall-clock time.
The saved checkpoints span 12:31 to 12:41 UTC, including development between them.

The 34 requests comprise creation/workspace/elements 3; Feature Studio
create/source/specification 3; feature insert 1; feature list 4; feature update 1;
measurement evaluation 3; body details 3; shaded views 4; translation starts 2;
translation polls 8; external-data downloads 2. Polls are not transport retries.
No failed authenticated requests or modeling retries were observed in the ledger.

Several terminal invocations returned empty output/exit 1. Saved state and results
were checked before retries. Baseline exports had completed and were not replayed;
its final timing summary was absent. The revision/output retries with no saved
attempt then completed once each. The measured states and output hashes, not an
empty terminal result, establish success.

34 successful calls are **1.36% of a 2,500-call annual allocation**. This is trial
usage only; remaining account quota and unrelated account usage were not queried.
Public research downloads and local tests are not authenticated Onshape usage.

## Validation and Limits

The follow-up's offline suite checks stage authorization, environment isolation,
real typed-value decoding, translation-state merge source guard, measurement
rejection cases, export byte classification, saved live evidence and report links.
See [verification.json](verification.json) and [verification.tap](verification.tap)
for the actual run. The first experiment's old tests/results remain preserved;
they were not rerun because some access root fixtures or raw transcripts.

The first edit's focused measurement suite passed 3 tests immediately. Subsequent
runner checks passed 8, then 9 tests; the saved live-evidence check passed after
the actual exports. No touched code file required more than three edit passes in
this continuation. Translation-state protection has a source regression guard
and successful final-state evidence, not a simulated concurrent-writer stress test.

Important limits:

- Only two custom-feature quantities are exposed: inner width and clear roller
  gap. API readback and regeneration prove those edits; no human UI edit or
  downstream feature robustness test was performed. Other dimensions remain source
  constants. This is not an ordinary native-feature-tree benchmark.
- Plate holes are corroborated by cylindrical faces, axis, diameter, centers and
  full-thickness spans. No independent STEP-kernel reimport/Boolean clearance or
  manufacturing tolerance analysis was run. STEP record checks are not B-rep
  validity certification.
- BOM exclusion is verified on the server, but STEP still includes the coral
  reference as the ninth solid. No assembly BOM, drawing, PDF/DXF, material,
  fastener selection, drive system, load case or manufacturing release was made.
- The selected server returns feature lists as Python-repr text; health/parameter
  checks use explicit readback tokens. Measured geometry uses structured decoded
  Onshape values. Several upstream error handlers return text without `isError`;
  measurement and output validators gate this run independently.
- The launcher is trial-specific, dependencies were reused from the isolated
  installed environment, and upstream compatibility/security is not certified.

The completed claim is therefore **measured public synthetic intake baseline +
same-feature revision + actual MCP PNG/STEP outputs**, not production readiness.