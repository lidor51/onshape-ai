# Manufacturing Package Follow-Up Report

## Current Status

2026-09-11 continuation: **PASS for real native Onshape A/B packages.**
31/80 cumulative attempted requests, 31 successes, zero failed/unknown HTTP outcomes
or retries. Setup=9, native revision=6, baseline A=8, revised B=8 calls. One new PUBLIC
synthetic document; A/B PDF, PNG, DXF and original-byte STEP are complete. The final
suite passed 60 tests including retained live evidence; standalone B rerender made
zero network attempts. Manufacturing approval remains UNVERIFIED/NOT FOR MANUFACTURE.
Current key acknowledged=true; rotation confirmed=false.

See the self-contained [live report](LIVE-REPORT.md) for actual artifacts, immutable
versions, metrics, exact commands, dependencies, failures corrected and unsupported
capabilities. This section supersedes all blocked/zero-call claims below.

## Historical Offline Report

The remainder is the original pre-continuation report, preserved as history.
Its 44-test/zero-call counts and blocked status describe that earlier checkpoint
only. Synthetic cache solids remain separate under `artifacts/offline/`; derived
outputs and current test/preflight metadata have since been regenerated. The links
below do not constitute an archived original 44-test log.

Date: 2026-09-11. **FINISHED for local synthetic A/B package execution.**
**Onshape snapshot execution: BLOCKED. Engineering approval: UNVERIFIED.**

## Results

The initial falsifiable check imported an actual synthetic STEP file through
OpenCascade, recovered its five cylindrical through-holes, validated millimeters
and `u=Y, v=Z-12.7`, and rejected a stale source hash. It was executed immediately
before broader package implementation and public-schema research.

The completed workflow passes **44 tests** and automatically creates A3 landscape
1:2 vector engineering drawings, full-scale millimeter DXF profiles, PNG renders,
and byte-identical copies of each authoritative **synthetic** input STEP.
No Onshape geometry, export, human edit, API latency, or manufacturing fitness
is inferred from these local results.

| Gate | Result | Evidence / Boundary |
| --- | --- | --- |
| Automatic consistent Onshape snapshots and actual milestone cost | BLOCKED | Fresh-key rotation unconfirmed; native fixture/exact measurement adapters and authenticated transport not enabled |
| PDF dimensions and notes for bounded plate | PASS | Synthetic A/B, principal and thickness views, third-angle convention, scale, overall dimensions, center marks, keyed hole table, intent and status |
| Parsed geometry matches server measurements | BLOCKED | No server measurements exist; local BRep/DXF/PDF consistency separately PASS |
| Imported STEP and reconstructed DXF consistency | PASS | Synthetic solid count, hole count/centers/diameters, full through span, bounds, thickness, volume |
| B includes downstream edits absent from benchmark | PASS | Synthetic B contains thickness 8, pivot Y=30, rear Y=241.2, sixth hole at world (Y,Z)=(200,40) |
| Cache rerender without drawing work/network | PASS | Standalone B rerender; socket monkeypatch guard; zero attempted network or authenticated requests |
| Rendered readability and test assumptions/status | PASS | Both 150 dpi PNGs visually inspected by assistant; text boxes/glyphs/vector geometry also checked automatically |
| Engineer/manufacturer release review | UNVERIFIED | No approval or signature; every sheet says EXPERIMENT - NOT FOR MANUFACTURE |

## Tangible Packages

| Revision | PDF | PNG | DXF | STEP | Manifest |
| --- | --- | --- | --- | --- | --- |
| A | [Drawing](artifacts/offline/A/package/drawing.pdf) | [Preview](artifacts/offline/A/package/drawing.png) | [Profile](artifacts/offline/A/package/profile.dxf) | [Solid](artifacts/offline/A/package/plate.step) | [Hashes/checks](artifacts/offline/A/package/manifest.json) |
| B | [Drawing](artifacts/offline/B/package/drawing.pdf) | [Preview](artifacts/offline/B/package/drawing.png) | [Profile](artifacts/offline/B/package/profile.dxf) | [Solid](artifacts/offline/B/package/plate.step) | [Hashes/checks](artifacts/offline/B/package/manifest.json) |

Original input bytes and consistent local measurement manifests remain separately
in [A cache](artifacts/offline/A/cache/snapshot.json) and
[B cache](artifacts/offline/B/cache/snapshot.json). Source hashes, output hashes,
units, extraction transform, test intent, revision, kernel/dependency versions,
and review status are retained. Rerunning offline does not replace existing caches.
H1...H6 are positional drawing keys, not persistent CAD identifiers across revisions.

| Measured Fixture Item | A | B |
| --- | --- | --- |
| Plate (mm) | 320 x 150 x 6.35 | 320 x 150 x 8 |
| World X span (mm) | -176.35 to -170 | -188 to -180 |
| Hole count | 5 | 6 |
| Pivot (u,v), diameter (mm) | (25,117.3), 12.9 | (30,117.3), 12.9 |
| Front shaft (u,v), diameter (mm) | (70,52.3), 12.9 | unchanged |
| Rear shaft (u,v), diameter (mm) | (246.2,52.3), 12.9 | (241.2,52.3), 12.9 |
| Mount holes (u,v), diameter (mm) | (140,122.3), (300,122.3), 6.6 | unchanged |
| Added hole (u,v), diameter (mm) | absent | (200,27.3), 4 |

The generator does not read the benchmark acceptance coordinates. It uses
imported STEP BRep surfaces and wires. Only the labeled synthetic fixture creator
reads the shared benchmark; acceptance coordinates live in tests. Synthetic
snapshot measurements are local OpenCascade values, not an independent server
oracle. This distinction limits what a passing comparison proves.

## Validation And Failure Evidence

- [44 per-test outcomes](artifacts/offline/tests.json) cover the first import and
  stale hash, A/B lifecycle, exact units, missing holes, shifted holes at unchanged
  volume, wrong/mixed revision/state, unknown intent, and stale preflight inputs.
- Unsupported blind bores, counterbores, countersinks, angled bores, pockets,
  multiple solids, and incomplete plate faces are rejected. Only analytic,
  X-normal rectangular plates with full circular through-holes are supported.
- DXF is reparsed with ezdxf and imported/extruded by CadQuery. Checks include a
  single closed rectangular loop, full circles, no annotation/duplicate entities,
  coordinates, units, thickness, solid count, bounds and volume. A matching volume
  alone cannot pass. Self-intersecting and shifted profiles fail.
- pypdf checks A3 dimensions, all expected text, and embedded TrueType fonts.
  PDFium reparses vector paths and verifies principal outline, each plotted hole,
  1:2 scale and side-view thickness; a PDF transformed to 90% scale is rejected.
  DejaVu Sans supplies the diameter glyph. Labels pass non-overlap/margin checks.
- Both rendered PNGs were opened and inspected: visible holes match their table
  keys, B's extra hole is visible, thickness changes are present, and warnings,
  notes, views and title blocks are unobscured. Physical print inspection and
  independent human drafting review remain UNVERIFIED.
- A rerender starts with BLOCKED status and publishes PASS only after checks.
  Tampered outputs or an interrupted renderer cannot leave a valid old PASS
  manifest beside newly replaced geometry. Original STEP bytes are never
  replaced with a reconstructed or re-exported solid.
- The first local environment bootstrap was interrupted, and package tool success
  initially disagreed with executable checks. The exact local interpreter was
  then verified. CasADi 3.8.0 caused CadQuery import to crash on interpreter exit;
  pinning 3.7.2 produced clean test exits. This is an observed compatibility
  workaround, not a diagnosis of the native library's internal defect.
- PDFium 4.30.0 lacked newer context-manager/bounds helpers; explicit close and
  its public raw bindings fixed the mismatch. A final indentation defect was
  caught and repaired before successful end-to-end execution.

Software comparison thresholds are 0.01 mm and
`max(0.1 mm^3, 1e-6 * referenceVolume)`. These are not machining tolerances.
Manufacturing intent comes only from [test-only inputs](intent.test-only.json):
6061-T6 aluminum, quantity 1, outer +/-0.20 mm, stock +/-0.13 mm, hole diameter
+/-0.05 mm, hole coordinates +/-0.10 mm, bare finish and 0.2 mm maximum edge break.
Unknown intent can produce a review sheet but blocks package PASS/release.
Every result has `manufacture_ready=false`; no approval is assigned automatically.

## Safety And Quota

**Authenticated requests 0; credential loads 0; new documents 0.** No browser,
MCP, paid service, sibling source/result reuse, root source edit, commit, document
deletion, sharing change, or external CAD upload was performed by this trial.

The persisted sanitized ledger is at ignored
`artifacts/private/call-ledger.json`. The [trackable summary](artifacts/offline/summary.json)
contains counts only. All setup/revision/milestone attempts reserve a slot before
sending; failed and unknown requests consume the 80-attempt ceiling. Exclusive
locking and atomic saves protect restarts. Ambiguous outcomes halt, no write is
automatically retried, and one creation reservation prevents replacement documents.
3xx are counted as successful allowance use but redirects are rejected.

The quota observation is **parent-provided official OAuth information**, not our
own tool call: used 269 / 2,500; remaining 2,231. Reserve 120 for native plus 80
for manufacturing together, and retain the proposed 500-call annual safety buffer.
The resulting unreserved headroom is 1,531 calls. This snapshot is not a guarantee
of current remaining allowance at a later live execution.

The public-contract simulation records 6 successful milestone calls, plus one
explicit setup creation call. This is **mock cost only**; real native fixture
setup and edits are not implemented or measured. A job needing polling may add
up to four polls within the 10-call milestone ceiling. Failure to fit the ceiling
blocks that milestone instead of silently increasing the budget.

Conditional annual planning example, **not measured capacity**: 269 already used
+ 200 combined trial reserve + 100 additional revision/package milestones at an
assumed 10 calls each + 531 reserved for their native setup/edit/other operations
= 2,000 successful calls, leaving 500 safety calls. The 531-call edit/setup
allowance is a planning cap, not an observed per-revision cost. Real workloads
cannot be promised until setup, edit, export and polling costs are measured.
Local layout rerenders add zero authenticated calls. AI-provider cost is unknown
and accounted for separately from these Onshape figures.

## Actual Commands

All Python execution used this trial's `.venv/Scripts/python.exe`, with selected
interpreter verification through the Python tooling. Commands were run directly
or via subprocess with captured exit status; no shell activation was required.

```powershell
.\.venv\Scripts\python.exe -m pytest test_first.py -q --disable-warnings
.\.venv\Scripts\python.exe -m pytest test_package.py -q --disable-warnings --tb=short
.\.venv\Scripts\python.exe -m pytest test_safety.py -q --disable-warnings --tb=short
node research.mjs
.\.venv\Scripts\python.exe run.py offline
.\.venv\Scripts\python.exe run.py rerender --revision B
.\.venv\Scripts\python.exe run.py live
.\.venv\Scripts\python.exe -m pip check
```

Final outcomes: offline exit 0, 44 passed; rerender exit 0 with zero blocked
network attempts; live exit 2 at fresh-key confirmation; pip check exit 0,
no broken requirements. Upstream deprecation warnings do not indicate geometry
failures. [Hash-bound preflight](artifacts/offline/preflight.json) expires after
24 hours and is invalidated by code, schema, dependency, intent or artifact changes.

## Limitations And Decision

Use the local package pipeline for this bounded synthetic plate experiment.
Do not use these outputs for fabrication. Do not call the mock snapshot lifecycle
a complete working live runner: the CLI has no authenticated sender, native
fixture builder/editor, or verified exact server measurement adapter. It remains
BLOCKED before credential access even when flags are supplied, until those
capabilities are separately implemented and validated after fresh-key confirmation.

The public schema and its uncertainties are recorded in [SOURCES.md](SOURCES.md).
No guessed drawing endpoints or alternative geometry generator was substituted.
The isolated full lock and installed license inventory are
[requirements.lock](requirements.lock) and [dependencies.json](dependencies.json).

Onshape native CAD remains the intended editable source. PDF/DXF are local
derived documents, not associative Onshape Drawing tabs; manual drawing changes
do not round-trip and must be regenerated from a new snapshot after CAD edits.
OpenCascade and Parasolid are different kernels. Neither successful local BRep
validation nor a readable drawing proves live Onshape geometry, human UI usability,
process capability, stock availability, fits, strength, or engineering approval.