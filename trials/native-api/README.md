# Native REST Intake PoC

This is a native Onshape sketch/extrude trial for the common coral ground-intake
benchmark. The explicitly authorized **NEW PUBLIC synthetic intake** succeeded:
Onshape measured **nine solids, width 340 / gap 100 mm at baseline, then width
360 / gap 95 mm after 12 updates**, preserving all 18 native feature IDs and
all nine part IDs. Thirteen through-bores and every part's bounds passed at both
stages. Four API PNGs and two original nine-member STEP ZIP exports are retained.

Open the owned [Onshape Part Studio, current revision](https://cad.onshape.com/documents/8ed4380f4a245838e95aa4a5/w/fb131c088194dac823c29de4/e/4e3c0ad9b4c4e0b31dcc3875).
This is the only confirmed created-document link. The workspace shows revision;
baseline evidence is preserved locally, not as a separate versioned document.

Public-phase totals: **173 completed requests plus one interrupted creation
dispatch = 174 conservative attempts; 0 recorded HTTP failures, 0 automatic
retries; 2 of 3 creation attempts consumed, one confirmed document created**.
No new requests or documents were needed for finalization. See
[REPORT.md](REPORT.md) for measured dimensions, all extracted STEP links, timing,
repair accounting and limitations; the [phase journal](live/public-phase.json)
proves document ownership and conservative budget usage.

The private HTTP 409 rejection is historical, preceding separate public
authorization. It created zero documents and cost one request, 394 ms request
time / 397 ms runner wall time. Original private
[observations](live/2026-09-11T11-48-34-964Z-2347652c/observations.json),
[phase summary](live/2026-09-11T11-48-34-964Z-2347652c/phase-summary.json) and
[tests](live/2026-09-11T11-48-34-964Z-2347652c/live-tests.tap) remain unchanged.

Runtime is Node 24 with pinned `fflate` 0.8.2 for ZIP decoding. No Python,
browser modeling, mesh import, custom FeatureScript or evaluated FeatureScript
endpoint was used for this native trial. Finalization read only this trial,
did not load credentials, and did not inspect other user documents.

## Captured Media

| Stage | API PNG views | Original server STEP archive |
| --- | --- | --- |
| Baseline | [Right](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-right.png), [isometric](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-isometric.png) | [ZIP, nine parts](live/2026-09-11T12-12-56-154Z-fcca583e/baseline-server-export.zip) |
| Revision | [Right](live/2026-09-11T12-12-56-154Z-fcca583e/revision-right.png), [isometric](live/2026-09-11T12-12-56-154Z-fcca583e/revision-isometric.png) | [ZIP, nine parts](live/2026-09-11T12-12-56-154Z-fcca583e/revision-server-export.zip) |

The ZIPs are byte-identical copies of the original recovered API payloads, not
newly packaged exports. Each contains nine separate AP242 STEP files, one named
solid per file. **No combined STEP or synthetic concatenation was created.**
All 18 byte-preserving extracted member links are in
[REPORT.md](REPORT.md#png-and-step-evidence). The
[manifest](live/2026-09-11T12-12-56-154Z-fcca583e/evidence-manifest.json) records
translation/external-data IDs, original request events, archive/member SHA-256
values, STEP units/timestamps, PNG hashes and stage-specific CAD checks.

All four PNGs were opened locally and are nonblank. Both STEP bundles match
their stage's nine names, X endpoints and cylindrical radii. Stage association
was recovered from unique geometry matches and ordering because the original
runner did not retain a direct stage-to-translation ID mapping. STEP server
timestamps precede local request timestamps; clock synchronization is not
assumed. No STEP reimport or independent CAD-kernel validation was performed.

## Commands

Completed native-only verification, run from the repository root:

```powershell
node --test trials/native-api/step.test.mjs trials/native-api/transport.test.mjs trials/native-api/validate.test.mjs
node trials/native-api/live/2026-09-11T12-12-56-154Z-fcca583e/finalize-evidence.mjs
```

The first command passed **17 tests, zero failures/skips**; saved evidence is
[final-tests.tap](live/2026-09-11T12-12-56-154Z-fcca583e/final-tests.tap).
The second is offline and rechecks/extracts the existing downloaded archives,
preserving original journals and bytes. It makes zero API calls. Its one initial
metre/mm assumption failure was repaired and immediately retested successfully.
The final successful extraction/check took 0.734 s locally, not CAD compute time.

Do not restart live creation: the existing public document works. The generic
runner supports `--confirm-new-public-document` and journal-proven
`--resume-owned=<run-id>` together with `--live`; it is not an invitation to
create another document or accept arbitrary document IDs. The generator and
some broader tests read the shared benchmark, so those commands were not rerun
under the finalization's native-only read restriction.

The live command loads the configured credential file in memory using Node's `parseEnv`,
only after validating both flags. It accepts `ONSHAPE_ACCESS_KEY` and
`ONSHAPE_SECRET_KEY`, or the corresponding `ONSHAPE_API_ACCESS_KEY` and
`ONSHAPE_API_SECRET_KEY` aliases. Do not pass keys on the command line. Neither
the offline command nor tests read the real credential file. Tests supply a
synthetic reader when testing credential loading.

The runtime checks `ONSHAPE_BASE_URL` from both the credential file and inherited
environment, when present, against the target stack before using any key. A
mismatch fails closed; it never silently substitutes the public stack for an
enterprise origin. Only a safe origin-match Boolean is printed. Surrounding key
whitespace is trimmed; embedded controls are rejected.

An explicitly chosen enterprise stack can be added as
`--stack=https://YOUR-ENTERPRISE.onshape.com`. Only a single-label Onshape subdomain,
HTTPS, standard port, and an origin without path, query, or userinfo are accepted.
Every request stays on that exact origin. All redirects are rejected, including
same-host redirects. This can block an otherwise supported export.

## Artifacts And Source

All paths below are relative to this directory:

| Path | Contents |
| --- | --- |
| [artifacts/baseline.json](artifacts/baseline.json) | Nine-part baseline predictions and 18 native feature definitions |
| [artifacts/revision.json](artifacts/revision.json) | Width 360 mm, gap 95 mm, same feature topology |
| [artifacts/revision-updates.json](artifacts/revision-updates.json) | 12 POST update templates requiring existing feature IDs |
| [artifacts/public-sources.json](artifacts/public-sources.json) | Exact fetched URLs, status, SHA-256, revisions, schema fields |
| [model.mjs](model.mjs) | Native sketch geometry, extrude parameters, logical ID binding |
| [generate.mjs](generate.mjs) | Deterministic JSON artifact generation |
| [transport.mjs](transport.mjs) | Explicit live gates, HMAC, host restrictions, safe error codes |
| [workflow.mjs](workflow.mjs) | Explicit visibility, owned public resume, native adds/updates, naming, inspection, media |
| [validate.mjs](validate.mjs) | Returned feature/geometry checks |
| [step.mjs](step.mjs) | Raw STEP and bounded ZIP-member decoding with signature and solid-record checks |
| [recover-media.mjs](recover-media.mjs) | Owned-phase translation download and confirmed coral BOM metadata recovery |
| [run.mjs](run.mjs) | Offline default and explicit live entry point |
| [research.mjs](research.mjs) | Fixed public-source manifest collector |
| [REPORT.md](REPORT.md) | Evidence, limitations, source interpretation, whole-robot assessment |

Tests are [model.test.mjs](model.test.mjs), [transport.test.mjs](transport.test.mjs),
[validate.test.mjs](validate.test.mjs), [workflow.test.mjs](workflow.test.mjs), and
[artifacts.test.mjs](artifacts.test.mjs), plus [step.test.mjs](step.test.mjs).
[artifacts/test-results.tap](artifacts/test-results.tap) is historical offline
full-suite evidence; current scoped results are linked above.

## Native Modeling Strategy

Each part has a `BTMSketch-151` profile on the built-in Right plane and one
`BTMFeature-134` solid `extrude` with operation `NEW`. Sketch x/y corresponds to
world y/z; its normal is +x. Geometry coordinates are metres, quantity expressions
explicitly use mm. Blind starting offsets position extrusions along x.

Closed rectangles/circles include five inner circles per plate, one shaft bore
per roller, and the coral's inner diameter. The documented query-string parameter
`qSketchRegion(makeId(returnedSketchId), true)` excludes enclosed inner regions.
These are selection expressions in native REST parameters, not custom feature
execution or a FeatureScript fallback. Requests contain no fixed geometry IDs.

The baseline is width 340, gap 100, roller length 330, rear roller y 246.2,
and shaft length 378.1 mm. The revision is width 360, gap 95, roller length 350,
rear roller y 241.2, and shaft length 398.1 mm. Coral dimensions do not change.
All features are nominally editable native features; sketches are numerically
placed, not fully dimension-constrained. Source regeneration owns the two design
parameters, not a shared Onshape variable/configuration table.

## Live Safety And Validation

Visibility is explicitly selected: public mode is separately authorized, never
an automatic fallback from private rejection. Creation requests use
`isEmptyContent: true`; the returned document flag and a subsequent GET must
confirm the chosen visibility. Public resume is limited to the same document
and phase recorded in this trial's creation journal. It checks stored feature
identity before continuing and does not accept arbitrary existing-document IDs.
There is no delete or share operation. Public creation intent is counted before
dispatch, including unknown outcomes; the maximum is three attempts cumulatively.

After each extrusion, a part-list delta must contain exactly one new non-mesh
solid. The returned part ID is named via dynamically discovered metadata property
IDs. Coral is named `coralReference [REFERENCE - NON-BOM]`. The runner additionally
tries the editable boolean `Exclude from BOM` property if present; absent or
unconfirmed exclusion prevents full acceptance but not the geometry trial.
The observed server property is `Exclude from all BOMs`, type `BOOL`; recovery
set it to true and verified it after revision. Baseline capture did not confirm
that flag. The original observation of `fullAcceptance: false` is preserved,
not rewritten to suggest uninterrupted first-pass success.

Before each feature mutation, the runner fetches serialization/library versions
and source microversion, then requests skew rejection. It checks individual
feature state, final feature-list states, parameter and geometry readback, nine
distinct solids, stable part IDs/names, per-part bounds, and cylindrical bores.
Each bore must match its radius, y/z axis position, x-spanning face bounds, and
full cylindrical area. Bounds use 0.02 mm tolerance; cylindrical area uses 1 mm2.
This is deliberately strict and may reject a valid but differently split B-rep.

Both stages attempt right and isometric shaded-view PNGs and asynchronous STEP
export. Translation polling is capped at 12 waits of 2-10 seconds. There are no
automatic retries of failed requests, including POSTs and HTTP 429; a timeout
after a mutation can leave an unknown server outcome. Requests have a 60-second
timeout and a 300-call budget. Partial document state is never deleted.
That client counter is per invocation, not a cumulative phase budget; the report
accounts for all five modeling invocations, discovery, recovery and reconciliation.

Live outputs are confined to a unique
`trials/native-api/live/<UTC-timestamp>-<random-id>/` directory:

- `observations.json`: selected observations, generated ID mappings, feature error
  context, actual request statuses/times, count/retries, and separate predictions.
- `baseline-right.png`, `baseline-isometric.png`, `revision-right.png`, and
  `revision-isometric.png`: only when a PNG response is returned.
- Raw export payloads and extracted STEP members: only after DONE, owned-document
  validation, archive checks and STEP signatures. The recovered run's original
  ZIPs and all member links are listed above and in the report; a nine-file bundle
  is not labeled as a single combined server STEP.

Public run [observations](live/2026-09-11T12-12-56-154Z-fcca583e/observations.json),
[media discovery](live/2026-09-11T12-12-56-154Z-fcca583e/media-discovery.json), and
[media recovery](live/2026-09-11T12-12-56-154Z-fcca583e/media-recovery.json) are
unchanged original evidence, supplemented by the final manifest.
The owned [.gitignore](.gitignore) excludes all `live/` artifacts; do not force-add
them. Live logs exclude
headers, raw error bodies, owner/account responses, and credential values; only
a sanitized selected server error message is retained.

## Timing And Limits

Modeling/resume elapsed calendar time was 196.986 s including interruption gaps;
recorded request time was 70.466 s. Only the last runner invocation finalized its
timer: 42.691 s. Four earlier invocation durations remain unknown. Discovery
took 1.587 s calendar (3 requests); export/BOM recovery took 4.194 s wall
(7 requests). Reconciliation request time was 2.142 s. Total completed public
request time was 78.238 s, not isolated CAD compute time or total agent time.

There were no rejected feature mutations in the saved public request journal.
Four owned resumes and two later export-byte downloads are explicitly counted.
Earlier public code-repair counts were not durably retained and remain
unverified. Current finalization made one local unit-comparison repair, zero
production-module repairs, and zero live CAD edits. Full details and source
timestamps are in the report and manifest; tokens, cost and speedup are unknown.

Baseline measurements, images and original STEP survive the revision, but raw
baseline body/feature response slots were overwritten by revision in the original
runner. No baseline source microversion or versioned baseline link was retained.
No manufacturing validation, materials, tolerances, interference checks, assembly
mates or motion, bearings, drive or whole-robot demonstration is claimed. Success
here is measured native geometry and recovered media, with BOM exclusion verified
later on the revision, not complete manufacturing or both-stage BOM acceptance.