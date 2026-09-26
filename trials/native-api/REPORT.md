# Native REST Trial Report

## Current Outcome: Public CAD And Exports Verified

The separately authorized **NEW PUBLIC synthetic intake** succeeded on
2026-09-11. The earlier private-entitlement failure below is history, not the
current blocker. Finalization reused the journal-proven owned document and
already fetched API media: **zero new authenticated requests, zero new documents,
no browser modeling, no deletes, no sharing, and no other user documents**.
Only this trial was read or changed in this finalization; credentials were not
read by tools or loaded by the offline finalizer.

Owned [Onshape Part Studio, current revision](https://cad.onshape.com/documents/8ed4380f4a245838e95aa4a5/w/fb131c088194dac823c29de4/e/4e3c0ad9b4c4e0b31dcc3875).
This is the only confirmed created-document link. The
[public phase journal](live/public-phase.json) records **2 of 3 creation attempts
consumed**, including one interrupted dispatch with unknown outcome. Its exact
creation-name reconciliation returned zero matching documents; it still counts
conservatively against the ceiling. One document is confirmed created. No further
creation is needed or was attempted during finalization.

### Measured CAD Result

Measurements come from recorded Onshape body details, per-part bounding boxes,
native feature readback and state checks, not the offline predictions. The
[evidence manifest](live/2026-09-11T12-12-56-154Z-fcca583e/evidence-manifest.json)
rechecks those values and hashes its original source journals.

| Observed quantity | Baseline | Revision |
| --- | --- | --- |
| Distinct named solid parts | 9 | 9, same part IDs |
| Native sketch/extrude features | 18, all OK | 18, same IDs, all OK |
| Feature mutations | 18 ADD | 12 UPDATE of existing IDs |
| Inner plate width | 340 mm | 360 mm |
| Roller surface gap | 100 mm | 95 mm |
| Left plate X interval | -176.35 to -170 mm | -186.35 to -180 mm |
| Right plate X interval | 170 to 176.35 mm | 180 to 186.35 mm |
| Plate thickness; Y by Z size | 6.35; 320 by 150 mm | Unchanged |
| Roller length; outside diameter | 330; 76.2 mm | 350; 76.2 mm |
| Front/rear roller Y axes | 70 / 246.2 mm | 70 / 241.2 mm |
| Shaft length; diameter | 378.1; 12.7 mm | 398.1; 12.7 mm |
| Shaft projection outside each plate | 12.7 mm | 12.7 mm |
| Crossmember length; section | 340; 25.4 by 25.4 mm | 360; 25.4 by 25.4 mm |
| Coral length; OD; ID | 301.625; 114.3; 101.6 mm | Unchanged |
| Through-bores verified | 13 | 13 |

Each plate has five bores: three diameter 12.9 mm (two shafts plus pivot) and
two diameter 6.6 mm (crossmembers). Each roller has a diameter 12.7 mm bore;
coral has a diameter 101.6 mm bore. Cylinder radius, Y/Z axis position,
X-spanning face bounds and full cylindrical area were checked. Bounds/linear
tolerance is 0.02 mm; area tolerance is 1 mm2. All nine bounds and hole checks
passed at both stages. These are native extruded profile voids, not native Hole
features. The model remains 9 sketches plus 9 extrudes, with no custom
FeatureScript modeling fallback.

Coral was named `coralReference [REFERENCE - NON-BOM]` at both stages. Recovery
discovered `Exclude from all BOMs` with type `BOOL`, set it from false to true,
and confirmed it by GET after revision. **Baseline BOM exclusion was not
confirmed at capture time**; the later metadata fix is not retroactive evidence.

### PNG And STEP Evidence

All PNGs are actual 1024 by 768 API shaded views. Their signatures, sizes and
SHA-256 values match the original journal. All four were opened locally during
finalization: they are nonblank; isometric views show the intake and separate
coral reference, and right views show the five-hole plate pattern and rear-hole
shift. Images do not establish dimensions or expose every occluded bore.

| Stage | API PNGs | Original server ZIP, byte-identical recovered copy |
| --- | --- | --- |
| Baseline | [Right](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-right.png), [isometric](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-isometric.png) | [baseline-server-export.zip](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-server-export.zip), 23,376 bytes |
| Revision | [Right](live/2026-09-11T12-12-56-154Z-fcca583e/revision-right.png), [isometric](live/2026-09-11T12-12-56-154Z-fcca583e/revision-isometric.png) | [revision-server-export.zip](live/2026-09-11T12-12-56-154Z-fcca583e/revision-server-export.zip), 23,378 bytes |

The server returned ZIP archives containing **nine separate AP242 STEP files
each**, not one combined STEP. Each member is preserved byte-for-byte with one
`MANIFOLD_SOLID_BREP` record and the expected product name. No synthetic
concatenation or hand-constructed combined STEP was created or labeled as a
server export. The raw recovered downloads are also retained:
[baseline original .bin](live/2026-09-11T12-12-56-154Z-fcca583e/export-6aa3f0d0948340d21a67d98f.bin)
and [revision original .bin](live/2026-09-11T12-12-56-154Z-fcca583e/export-6aa3f0e4948340d21a67da05.bin).

| Extracted original STEP member | Baseline | Revision |
| --- | --- | --- |
| leftPlate | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/leftPlate.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/leftPlate.step) |
| rightPlate | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/rightPlate.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/rightPlate.step) |
| frontRoller | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/frontRoller.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/frontRoller.step) |
| rearRoller | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/rearRoller.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/rearRoller.step) |
| frontShaft | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/frontShaft.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/frontShaft.step) |
| rearShaft | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/rearShaft.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/rearShaft.step) |
| frontCrossmember | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/frontCrossmember.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/frontCrossmember.step) |
| rearCrossmember | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/rearCrossmember.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/rearCrossmember.step) |
| coralReference | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-step/coralReference.step) | [STEP](live/2026-09-11T12-12-56-154Z-fcca583e/revision-step/coralReference.step) |

Baseline translation ID is `6aa3f0d0948340d21a67d98f`; revision is
`6aa3f0e4948340d21a67da05`. Both were DONE with the same owned document,
workspace and element and one external-data ID each. The manifest ties them to
the original export request events using a **unique match of all nine product
names and exported X endpoints to stage bounds**, corroborated by order. It
also checks exported cylinder radii against measured CAD. The initial runner
did not retain a direct stage-to-translation-ID mapping; this is recovered
association, not an invented original response. All STEP length units are metres;
comparison values are converted to mm without changing files.

STEP header timestamps are 12:15:13Z (baseline) and 12:15:33Z (revision).
Original export POST response events are 12:15:46.393Z and 12:16:06.569Z;
server/local clocks are not assumed synchronized. The timestamps alone were
not used to assign stages. Archive SHA-256 values are
`8eec2aaa9395d1780a70f7a0cab9f3ff1d6219dd8cc8df2691b1e056ddcb2d3c`
and `b79a2a4b13c9e23c0a354ef97b98b168c11b0159465fae7c9d1e319129ff8344`.
The manifest records every extracted member name, size and hash.

### Request, Repair And Timing Ledger

| Public-phase activity | Completed requests | Request time sum | Wall/calendar duration |
| --- | --- | --- | --- |
| Interrupted-creation reconciliation | 1 | 2.142 s | Full invocation unknown |
| Modeling and four owned resumes | 162 | 70.466 s | 196.986 s calendar, including gaps |
| Media/metadata discovery | 3 | 1.581 s | 1.587 s calendar |
| Export download and BOM recovery | 7 | 4.049 s | 4.194 s measured wall |
| This offline finalization | 0 | 0 | 0.734 s final successful extraction/check |

Totals: **173 known completed public requests**, all HTTP 200, plus **one
interrupted creation dispatch** conservatively counted as attempted:
**174 public-phase attempts**. Completed request time sums to 78.238 s.
Automatic retries: **0**. Manual recovery includes two repeated export-byte
downloads and one BOM metadata POST; these are included, not hidden retries.
The earlier private phase adds one HTTP 409 request, making 175 conservative
attempts across the private and public phases together.

Modeling calendar interval is 12:12:56.158Z to 12:16:13.144Z. The five runner
invocations recorded 18, 38, 21, 4 and 81 requests. Four ended without their
finalizer; their durations are unknown. The last invocation measured 42.691 s
(12:15:30.450Z start). The repeated `lastRecordedResponseAt` fields on interrupted
invocations were overwritten by resume and are not trustworthy per-invocation
end times; the manifest derives each last actual response from request groups.
The unknown initial creation dispatch has no duration. Discovery ran
12:17:24.197Z to 12:17:25.784Z; recovery ran 12:18:47.069Z to 12:18:51.274Z.
Recovery and idle gaps are not CAD compute time. Total agent time, isolated
Parasolid compute time, tokens, monetary cost and speedup were not measured.

Repair accounting is deliberately bounded by the available record. The private
phase had one local credential-validation repair. Public modeling has **zero
recorded rejected feature mutations**, 18 successful adds and 12 intended
revision updates; the updates are not repairs. Four owned-document resumes
followed interrupted runs, in addition to one replacement creation after the
unknown dispatch. Two original STEP validations failed locally on ZIP signatures;
the saved code/tests add ZIP and nine-member support, and BOM property matching
was corrected. Exact prior public code-edit/repair counts were not retained and
remain **unverified**, rather than being inferred from successful requests.
In this finalization there was **one failed local unit-assumption check and one
repair to the run-local finalizer**, followed immediately by a passing rerun.
No repair loop exceeded three attempts per file. No production CAD module was
edited or live model repaired in this finalization.

### Verification And Remaining Limits

Current local checks: **17 passed, 0 failed, 0 skipped**, 335.528 ms TAP suite
duration in [final-tests.tap](live/2026-09-11T12-12-56-154Z-fcca583e/final-tests.tap).
The real-artifact [finalizer](live/2026-09-11T12-12-56-154Z-fcca583e/finalize-evidence.mjs)
passed after its metre-unit correction; editor diagnostics were clear.
[step-focused.tap](live/2026-09-11T12-12-56-154Z-fcca583e/step-focused.tap)
is preserved as prior focused-test evidence, not relabeled as this run.
Only self-contained tests were run here: the model, workflow and artifact suites
load a shared benchmark outside this trial, so they were not rerun under the
native-only read restriction.

```powershell
node --test --test-reporter=tap --test-reporter-destination=trials/native-api/live/2026-09-11T12-12-56-154Z-fcca583e/final-tests.tap trials/native-api/step.test.mjs trials/native-api/transport.test.mjs trials/native-api/validate.test.mjs
node trials/native-api/live/2026-09-11T12-12-56-154Z-fcca583e/finalize-evidence.mjs
```

Original [observations](live/2026-09-11T12-12-56-154Z-fcca583e/observations.json),
[media discovery](live/2026-09-11T12-12-56-154Z-fcca583e/media-discovery.json) and
[media recovery](live/2026-09-11T12-12-56-154Z-fcca583e/media-recovery.json) remain
unchanged. The original `fullAcceptance: false`, failed STEP signature statuses
and unconfirmed BOM field are historical observations, supplemented by the
manifest and recovery evidence, not rewritten to imply first-pass success.
The existing local `live/` ignore rule covers the recovered evidence.

Remaining limitations: no STEP reimport or independent CAD-kernel topology
validation; no manufacturing certification, materials, tolerances, mating,
drive/bearings, interference simulation, or full-robot claim. STEP checks verify
named solid records, X endpoints and cylindrical radii, not every topology edge
or all dimensions independently. Baseline derived measurements, feature checks,
PNGs and original exports survive revision, but the original runner overwrote
the raw baseline body/feature response slots with revision. No versioned baseline
link or baseline source microversion was retained. The public workspace link
shows the revision. Current acceptance is **measured geometry and recovered
media success, with later revision BOM confirmation**, not complete benchmark
or manufacturing acceptance at both capture times.

## Historical Private Phase: Entitlement Blocked

The following records the earlier private-only authorization and stop. It was
superseded by explicit public-phase authorization, not an automatic fallback.

On 2026-09-11, the authorized live command reached Onshape after the runtime
configured-origin check returned `true`. The first API call, native REST
`POST /api/v10/documents` with `isPublic: false`, returned **HTTP 409**:

> Free accounts only allow access to public documents. Upgrade your account to get full access to private documents.

This is an actual server rejection, not a synthetic result or a CAD schema
failure. Execution stopped immediately. No authorization retry, public fallback,
sharing, deletion, or mutation of a pre-existing document was attempted.
No document ID was returned; no document link is available.

| Live observation | Result |
| --- | --- |
| API requests / failures / automatic retries | 1 / 1 / 0 |
| Request elapsed / runner wall time | 394 ms / 397 ms |
| UTC start / finish | 11:48:34.966 / 11:48:35.364 |
| New-document creation requests / documents created | 1 / 0; authorized ceiling was 3 documents |
| Native feature operations / returned feature IDs | 0 / 0 |
| Baseline part count, bounds, bores, width and gap | Not measured; no geometry created |
| Revision / preserved document and feature IDs | Not attempted / unverified |
| Onshape PNG / STEP | Not attempted; no files produced |
| Human interventions during runner execution | 0; excludes prior authorization and credential setup |
| Token usage / cost / speedup | Not measured / not measured / no claim |

The command was invoked twice. The first invocation stopped **locally**, before
any request, with `CREDENTIAL_KEYS_MISSING_OR_INVALID`. One bounded local repair
trimmed surrounding whitespace and removed the unsupported alphanumeric-only
secret restriction while rejecting embedded controls. Synthetic tests passed
immediately after the edit. Actual key characters were never inspected or
printed; the precise offending character/whitespace is not claimed. The second
invocation produced the HTTP 409 above. API/schema repair attempts: **0** because
private entitlement failure is a mandatory stop. First-invocation elapsed time
was not instrumented; the 397 ms figure is only the second runner invocation,
not CAD compute time or total agent task time.

### Live Evidence

The original failed-run observations are preserved without rewriting them:

- [observations.json](live/2026-09-11T11-48-34-964Z-2347652c/observations.json): exact selected server reason, status, request timings, empty feature/part ID maps and stages; predictions are separately labeled.
- [phase-summary.json](live/2026-09-11T11-48-34-964Z-2347652c/phase-summary.json): both invocations, local repair, document budget usage, and mandatory stop.
- [live-tests.tap](live/2026-09-11T11-48-34-964Z-2347652c/live-tests.tap): post-edit native-suite verification; offline/synthetic, not server CAD evidence.

All three paths are inside the ignored `trials/native-api/live/` directory.
The owned [.gitignore](.gitignore) covers JSON, PNG and STEP evidence. No commit,
branch, staging, shared-file change, sibling read, delegation, browser, package
installation, or request outside the configured Onshape stack was performed.

Safety changes for this phase: runtime file/environment `ONSHAPE_BASE_URL` must
match the requested origin before signing; only a safe match Boolean is printed;
error retention selects and sanitizes a message rather than retaining headers or
raw bodies; newly returned document provenance and feature response shapes are
checkpointed; optional media authorization errors also halt. The geometry
generator remains native sketches/extrudes with independent baseline/revision
plans. No custom FeatureScript geometry fallback was introduced.

Live/focused commands executed:

```powershell
node --test trials/native-api/transport.test.mjs
node --test trials/native-api/workflow.test.mjs
node trials/native-api/run.mjs --live --confirm-new-private-document
node --test --test-reporter=tap --test-reporter-destination=trials/native-api/live/2026-09-11T11-48-34-964Z-2347652c/live-tests.tap trials/native-api/*.test.mjs
```

The transport check ran before live access and immediately after the one local
repair. The live command ran twice as described above. Git status, ignore and
tracked-file checks were scoped to this owned directory. VS Code diagnostics
for the modified JavaScript were also checked. The saved TAP contains the final
test totals.

### Historical Requirements At The Private Stop

At that time private-document entitlement had to be resolved or separate
authorization obtained before any further live attempt. Public creation was not
then authorized; it was authorized separately later. Native
feature compilation, editable server source, actual part count, bores, bounds,
baseline 340 mm width / 100 mm gap, revision 360 mm width / 95 mm gap, same-document
and feature-ID preservation, Onshape PNG, STEP and BOM exclusion were all
unverified. Offline dimensions below were predictions only, not substitute server
measurements. That private attempt was **unsuccessful due to private entitlement**, not
evidence for or against native REST geometry correctness or CAD speed.

## Historical Offline Outcome

Offline implementation and artifacts were complete before live authorization.
Authenticated CAD execution was deliberately not run in that earlier phase.
There was no observed Onshape part count, regenerated geometry, CAD elapsed time,
rendered image, STEP export, token count, or cost. The small synthetic API used
in tests verifies control flow only. The following offline record is historical.

Verification: 20 tests passed, zero failed, zero skipped in the saved full-suite
TAP result. VS Code reported no diagnostics within the native trial directory.

The available model was approved as GPT-6 Astra; this runner makes no model API
calls and neither configures nor verifies reasoning effort. No sibling trial was
read, no root/shared file changed, no dependency installed, no browser used, and
no commit, branch, or delegation performed.

## Hypothesis And Check

Initial falsifiable hypothesis: a minimal generator based on the official native
circle/extrude example can preserve native types, convert mm to sketch metres,
and bind an extrude to a returned sketch feature ID. The first edit implemented
just that generator and a single `node:test` check; it immediately passed before
further research or implementation.

Extended server hypothesis, untested in that offline phase and now checked above: 18 native feature calls can create
nine correct solids with bore regions excluded, and 12 updates to existing IDs
can produce width 360 / gap 95 without a new document. The decisive live checks
are returned feature states, nine distinct solid part IDs, B-rep bore dimensions,
per-part world bounds, and measured width/gap at both stages. A successful HTTP
status or local preview alone cannot confirm this hypothesis.

## Deliverables

Exact repository-relative outputs:

- `trials/native-api/artifacts/baseline.json`
- `trials/native-api/artifacts/revision.json`
- `trials/native-api/artifacts/revision-updates.json`
- `trials/native-api/artifacts/public-sources.json`
- `trials/native-api/artifacts/test-results.tap`

See [README.md](README.md) for each executable/source file and future live output
paths. Baseline/revision JSON are runnable feature templates with explicit
`$feature:<logical-key>` bindings, not a fake feature-list response. The runner
binds only server-returned IDs and updates those IDs in place.

Predicted geometry: nine solids including named non-BOM coral; 5 through-bores
per plate, one bore per roller, and one coral bore. Plate x intervals are
[-176.35,-170] / [170,176.35] mm initially and [-186.35,-180] / [180,186.35] mm
after revision. Rear roller y moves 246.2 to 241.2 mm. Shafts extend 12.7 mm
beyond each outer plate face. Crossmembers span the inner width.

## Commands And Evidence

Observed runtime: Node `v24.15.0`. Executed commands, all from the repository root:

```powershell
node --test trials/native-api/model.test.mjs
node trials/native-api/generate.mjs
node --test trials/native-api/transport.test.mjs
node --test trials/native-api/validate.test.mjs
node --test trials/native-api/workflow.test.mjs
node --test trials/native-api/validate.test.mjs trials/native-api/workflow.test.mjs
node --test trials/native-api/artifacts.test.mjs
node trials/native-api/research.mjs
node trials/native-api/run.mjs
node --version
```

The full-suite evidence command is:

```powershell
node --test --test-reporter=tap --test-reporter-destination=trials/native-api/artifacts/test-results.tap trials/native-api/*.test.mjs
```

Additional public-only Node `fetch`/`JSON.parse` inspection commands were used
when the webpage extractor could not read the large OpenAPI JSON. A cylinder
schema inspection command once exited 1 without output, then a bounded retry
returned HTTP 200. Webpage extraction of the official large library page failed;
the pinned standard-library mirror supplied the relevant source definitions.
Guessed mirror `plane.fs` and `LICENSE` paths returned 404. The correct license
path was resolved through GitHub's license API as `LICENSE.txt` (MIT). These are
research failures, not CAD failures. The corrected manifest records current
successful fetches; original failures are retained here.

The first artifact-evidence test failed because the saved manifest still contained
the old license 404. Regenerating it with the corrected URL and inherited schema
fields resolved that failure; the same focused check then passed all three tests.

## Public Sources

Fetched official URLs, with body hashes and fetch times recorded in
[artifacts/public-sources.json](artifacts/public-sources.json):

- [API key signing](https://onshape-public.github.io/docs/auth/apikeys/): lowercase method/nonce/date/content-type/path/query with trailing newline, HMAC-SHA256, Base64.
- [Native feature APIs](https://onshape-public.github.io/docs/api-adv/featureaccess/): sketch, circle, extrude, add/update, parameter types and feature statuses; v9 examples.
- [Documents](https://onshape-public.github.io/docs/api-adv/documents/): create and GET document, v10 examples.
- [Part Studios](https://onshape-public.github.io/docs/api-adv/partstudios/): new studio, features and body details.
- [Metadata](https://onshape-public.github.io/docs/api-adv/metadata/): dynamically discovered property IDs and part-name updates.
- [Import/export](https://onshape-public.github.io/docs/api-adv/translation/): v11 asynchronous STEP, translation status and external-data download.
- [API limits](https://onshape-public.github.io/docs/auth/limits/): request limits are an integration constraint, not a measured bottleneck in this phase.

GitHub project evidence:

1. **onshape-public/onshape-clients**, MIT, archived, revision
   `4f613cc4025a90e11493e2b79560afe9762e1686` (commit date 2021-11-15).
   Fetched [revision metadata](https://api.github.com/repos/onshape-public/onshape-clients/commits/master),
   [OpenAPI schema](https://raw.githubusercontent.com/onshape-public/onshape-clients/4f613cc4025a90e11493e2b79560afe9762e1686/openapi.json),
   [Python native feature tests](https://raw.githubusercontent.com/onshape-public/onshape-clients/4f613cc4025a90e11493e2b79560afe9762e1686/python/test/test_part_studios_api.py),
   [Python README](https://raw.githubusercontent.com/onshape-public/onshape-clients/4f613cc4025a90e11493e2b79560afe9762e1686/python/README.rst),
   and [license](https://raw.githubusercontent.com/onshape-public/onshape-clients/4f613cc4025a90e11493e2b79560afe9762e1686/LICENSE).
   Native line/circle insertion tests support the geometry serialization approach.
   The README and skipped feature-deserialization test warn against assuming a
   generated client guarantees schema completeness. Python/TypeScript client
   directories were inspected, but no client was installed or executed.
2. **javawizard/onshape-std-library-mirror**, MIT, revision
   `a2a7b13ea823f144b20d27198043aea35a64d928`, library 2960.0 (2026-05-15).
   Fetched [revision metadata](https://api.github.com/repos/javawizard/onshape-std-library-mirror/commits/without-versions),
   [native extrude definition](https://raw.githubusercontent.com/javawizard/onshape-std-library-mirror/a2a7b13ea823f144b20d27198043aea35a64d928/extrude.fs),
   [query semantics](https://raw.githubusercontent.com/javawizard/onshape-std-library-mirror/a2a7b13ea823f144b20d27198043aea35a64d928/query.fs),
   [default plane basis](https://raw.githubusercontent.com/javawizard/onshape-std-library-mirror/a2a7b13ea823f144b20d27198043aea35a64d928/defaultFeatures.fs),
   and [license](https://raw.githubusercontent.com/javawizard/onshape-std-library-mirror/a2a7b13ea823f144b20d27198043aea35a64d928/LICENSE.txt).
   Used to inspect native feature parameter names and region semantics only.
   No standard-library implementation is executed locally or submitted as a
   custom feature. This third-party mirror is not a current server contract.

## Historical Geometry Gates

Private creation was rejected in the earlier phase. At the offline/private stop,
all geometry and additional account scopes were unverified. The public result
above supersedes the geometry and export gates described in this historical section.
The historical schema has `isPublic` in requests and `public` in responses.
The official v9 circle example uses `xCenter`/`xDir`; the archived schema uses
`xcenter`/`xdir`. Requests follow the official guide; readback recognizes both.
The guide's prose calls the example radius inches while raw sketch coordinates
are treated as SI here; server world bounds must validate the unit assumption.

Blind start offsets and filtered region selection are sourced from native feature
definitions, but their composed REST payload has not been compiled by Onshape.
Library/serialization cursor fields, B-rep ID correspondence, property
availability, and exact response packaging remain server gates. Strict failure
is intentional. No endpoint/schema is claimed to work based solely on this code.

No dedicated native Hole features, dimension-constrained sketches, materials,
bearings, drive, tolerances, interference/contact simulation, or certification.
The geometric holes are native profile/extrude voids. Coral's non-BOM name is
mandatory; an actual metadata BOM exclusion is attempted only if its editable
boolean property is discoverable. Missing exclusion is explicitly unaccepted.

PNG bytes require a PNG signature; visuals are not automatically reviewed. STEP
requires DONE, matching result document, one external file, and header/trailer
signatures; the initial implementation rejected ZIP packaging. ZIP decoding was
subsequently added and used for the recovered files above; credential redirects
remain rejected. A returned file
is not verified manufacturing geometry. Failures and partial states are retained.

## Whole-Robot Assessment

Native REST is a plausible building block for editable packaging geometry, not
demonstrated autonomous whole-robot CAD. This trial avoids topology-derived face
IDs by using fixed datum planes, logical sketch IDs and native region queries.
That favorable case does not establish reference stability through arbitrary
fillets, splits, booleans, edits by humans, or derived/versioned subsystems.

Repeated parts currently duplicate features; a robot needs reusable part/version
identities and assembly instances. Assemblies, mates, motion, purchased component
libraries, fasteners and BOM rollups are absent. Cross-subsystem design intent,
manufacturing checks and revisions would need explicit modeling and validation.

Fine-grained native features plus readback and measurement produce many serialized
requests. Request budgets, rate-limit handling and measured latency matter; no
speed comparison is justified yet. Microversion rejection prevents unnoticed
concurrent edits, but this runner has no transaction rollback. Journal-gated
owned public resume now exists, but cannot make an uncertain mutation atomic:
a failed update can leave a partly revised document, and a timed-out POST has an
unknown outcome. Whole-robot use requires reconciliation, idempotency strategy,
dependency management and durable references before broad autonomous changes.

## Live Command And Stop Condition

Executed twice in the live phase as recorded above. Do not rerun until the
private-document entitlement issue is resolved and live authorization is renewed:

```powershell
node trials/native-api/run.mjs --live --confirm-new-private-document
```