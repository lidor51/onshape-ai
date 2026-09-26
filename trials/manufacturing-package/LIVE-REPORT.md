# Manufacturing Package Live Trial

2026-09-11. **PASS for the bounded native Onshape A/B handoff.**
Engineering approval UNVERIFIED; manufacture_ready=false; all sheets TEST_ONLY
and EXPERIMENT - NOT FOR MANUFACTURE.

One new PUBLIC synthetic plate document, ordinary native feature edits, two
immutable original-byte STEP snapshots, exact server measurements, and locally
generated/reparsed PDF, DXF and PNG packages are complete. Final suite: **60 passed,
none failed/skipped**. Four tests consume retained real evidence; the earlier
44-test synthetic result alone does not establish any live success.

## Outputs

[Editable native document](https://cad.onshape.com/documents/5e6ece69c8ad75145815b3de/w/08bbe64620275454db6e9141/e/852d2fd01bfa34525231d27a).

| Revision | PDF | PNG | DXF | Original STEP | Snapshot |
| --- | --- | --- | --- | --- | --- |
| A | [Drawing](artifacts/live/A/package/drawing.pdf) | [Preview](artifacts/live/A/package/drawing.png) | [Profile](artifacts/live/A/package/profile.dxf) | [Solid](artifacts/live/A/package/plate.step) | [Provenance](artifacts/live/A/cache/snapshot.json) |
| B | [Drawing](artifacts/live/B/package/drawing.pdf) | [Preview](artifacts/live/B/package/drawing.png) | [Profile](artifacts/live/B/package/profile.dxf) | [Solid](artifacts/live/B/package/plate.step) | [Provenance](artifacts/live/B/cache/snapshot.json) |

PDF/DXF/PNG derive from REAL Onshape-exported geometry. PNG is a 150 dpi local PDF
render, not an Onshape screenshot. STEP remains exactly the original download,
never local remodeling or re-export. Live caches, outputs and operational records
are Git-ignored. [Historical synthetic packages](REPORT.md#tangible-packages)
remain separately under `artifacts/offline/`; they are not relabeled as live.

## Gates

| Gate | Actual Result |
| --- | --- |
| Automatic native fixture and edits | PASS: A=5 native features, B=7; one solid each, all feature states OK |
| Consistent immutable snapshots | PASS: exact evaluation and feature microversions match export input version |
| <=10 successful calls per milestone | PASS: A=8, B=8; setup=9, native revision=6 counted separately |
| Server, imported STEP, reconstructed DXF | PASS: bounds, thickness, hole positions/diameters/count, through spans and volume |
| Dimensioned PDF/PNG | PASS: A3 landscape 1:2, principal/thickness views, keyed hole table, mm units and watermark |
| Requested downstream changes | PASS: thickness 8, pivot Y=30, rear Y=241.2, sixth diameter-4 hole at world Y=200/Z=40 |
| Standalone cache rerender | PASS: zero network attempts/calls; original STEP/PDF/PNG/layout hashes identical; DXF geometry identical |
| Human UI/physical print testing | UNVERIFIED: native API editability observed, not a human UI workflow |
| Engineer/manufacturer release | UNVERIFIED: no signature/approval; NOT FOR MANUFACTURE |

Both PNGs were opened and visually inspected by the assistant. Hole keys match
table rows; B's sixth hole and 8 mm side view are visible; dimensions, leaders,
notes and title blocks are legible and unobscured. This is not independent human
drafting approval. [Package checks](artifacts/live/B/package/manifest.json) also
verify embedded fonts, page size, text, overlap, vector positions and scale.

## Geometry And Binding

Drawing coordinates: u=world Y, v=world Z-12.7 mm, normal=+X.

| Measured Item (mm unless noted) | A | B |
| --- | --- | --- |
| Outer size | 320 x 150 | 320 x 150 |
| Thickness | 6.35 | 8 |
| World X span | -176.35 to -170 | -188 to -180 |
| Through holes | 5 | 6 |
| Pivot (u,v), diameter | (25,117.3), 12.9 | (30,117.3), 12.9 |
| Front shaft (u,v), diameter | (70,52.3), 12.9 | unchanged |
| Rear shaft (u,v), diameter | (246.2,52.3), 12.9 | (241.2,52.3), 12.9 |
| Mount centers, diameter | (140,122.3), (300,122.3), 6.6 | unchanged |
| Added hole, diameter | absent | (200,27.3), 4 |
| Imported volume (mm^3) | 301875.709347 | 380215.323330 |

A version `4d5b62b961e75a8f01c024b3`, microversion `ee26afbb30354b96e7ba9252`.
B version `a515ca607194bd42b4056dfa`, microversion `a149b086f0300248d5f988fc`.
Both address the same one-part element, default configuration and selected part
`JID`. Each exact evaluation used the immutable version URL and returned its
matching source microversion. Translation responses bound document/element/version.
Snapshot manifests retain original hashes and server numeric measurements.

The builder uses native offset plane, rectangle sketch, solid extrusion,
five-circle sketch and through-all remove. B updates the existing plane, extrusion
and hole-sketch IDs, then adds a separate sixth-hole sketch/removal. Offset changes
inner width 340 to 360; rear hole reflects gap 100 to 95. No roller bodies are
needed in this single-plate scope. FeatureScript performs read-only measurement,
never geometry generation. No sibling source/results were read or reused.

Extraction reads exported BRep, not hard-coded acceptance coordinates. Comparisons
use 0.01 mm and max(0.1 mm^3, 1e-6*serverVolume), not machining tolerances. Imported
X bounds expand roughly 1e-7 mm per side, within tolerance; recorded server values
are not silently replaced by those imported bounds.

## Actual Accounting

[Persistent ledger](artifacts/private/call-ledger.json), [live summary](artifacts/live/summary.json),
[60 test outcomes](artifacts/live/tests.json), [network proof](artifacts/live/B/rerender/network-proof.json).

| Phase | Attempts / Successes | Recorded Request Time |
| --- | --- | --- |
| Setup | 9 / 9 | 8.640 s |
| Native revision | 6 / 6 | 4.531 s |
| A milestone | 8 / 8 | 8.202 s |
| B milestone | 8 / 8 | 7.952 s |
| Total | **31 / 31** | **29.325 s** |

Each milestone: create version, features, parts, exact evaluation, export, two
polls, download. Zero HTTP failures, unknown outcomes, redirects or retries.
Each milestone also waited 2+4 seconds between polls. Request time excludes those
waits, local work, debugging and tool overhead. Final networked invocation took
21.719 s; this is not total development time. No token/AI-provider cost measurement.
No manual CAD creation/download/drawing intervention was required.

Cap remains **80 cumulative attempts, 49 unused**. Counters, creation reservation,
document identity and response evidence survived restarts. Three live invocations
loaded credentials in memory; cache commands did not. Acknowledgment is explicitly
`current_key_acknowledged=true`, `rotation_confirmed=false`; no claim of rotation.
Current-key use was authorized despite the earlier warning; rotation remains
recommended. No credentials, headers or secret-bearing errors were printed or
saved into trial outputs. No deletion, sharing change, existing robot access,
browser, MCP fallback, delegation, commits or out-of-folder edits were performed.

Parent-provided quota: 273/2500 used, 2227 remaining before this continuation.
Reserves: manufacturing 80, native 120, official 100, safety 500; initial unreserved
headroom 1427. Adding only this trial's 31 successes implies 304 used / 2196 left,
NOT a refreshed account observation; concurrent trials may have consumed more.
Conditional planning: 100 later milestones at observed 8 calls + 300 native
setup/edit calls + 300 combined trial reservation + initial 273 = 1673. This leaves
327 to a 2000-call planning ceiling and 500 safety. It is not a capacity promise
for arbitrary shapes, polling times or whole robots.

## Defects Corrected

1. Create request uses `isPublic`; actual response uses `public`. Attempt 1 was a
   known HTTP success with public=true. Bound that retained document locally with
   recorded provenance; no second creation, visibility change or request replay.
2. STEP declares metres despite `stepUnit=MILLIMETER`. Retained original bytes;
   OpenCascade performs declared metre-to-mm conversion and independently matches
   server dimensions. Inch/unknown input units remain rejected.
3. Real cylindrical faces use trimmed wrappers. `BRepAdaptor_Surface` replaces
   the synthetic-only direct-surface assumption. The actual A regression passed;
   completed A from its already-downloaded bytes without another request.
4. Native feature IDs contain underscores; validation permits them while still
   requiring owned IDs for updates.
5. DXF generated metadata differs between rerenders. Geometry is reparsed and
   reconstructed, not asserted byte-identical. PDF/PNG/layout/STEP hashes match.

Two retained-state recoveries are recorded; no ambiguous POST was replayed. One
local indentation defect was caught and fixed before execution. Initial terminal
outputs were interrupted/unrelated; verified runs used captured subprocesses from
the configured local interpreter. Unrelated output was not used as trial evidence.

## Commands And Dependencies

Run from this folder with the existing Python 3.10.0 local environment:

```powershell
node research.mjs
.\.venv\Scripts\python.exe -m pytest test_safety.py -q --disable-warnings --tb=short
.\.venv\Scripts\python.exe -m pytest test_transport.py -q --disable-warnings --tb=short
.\.venv\Scripts\python.exe -m pytest test_native.py -q --disable-warnings --tb=short
.\.venv\Scripts\python.exe -m pytest test_live.py test_package.py test_first.py -q --disable-warnings --tb=short
.\.venv\Scripts\python.exe run.py offline
.\.venv\Scripts\python.exe run.py live --acknowledge-current-key --confirm-new-public
.\.venv\Scripts\python.exe run.py finish-live
.\.venv\Scripts\python.exe run.py rerender --source live --revision B
.\.venv\Scripts\python.exe -m pip check
```

Focused pytest commands additionally used `-o cache_dir=artifacts/private/pytest-cache`.
Other focused file sets were `test_live.py test_safety.py test_runner.py test_package.py`,
`test_live.py test_safety.py`, `test_live.py test_runner.py`, and
`test_native.py test_runner.py test_live.py`, with the same flags. Final offline,
finish-live, standalone rerender and pip check exited 0; no broken dependencies.
Editor diagnostics reported no errors in touched code.

Recovery invoked `Ledger.recover_known_creation()` and
`complete_cached_download(ledger, "A", ROOT / "artifacts/live/A/cache")`, each with
ledger close in `finally`, zero new requests and retained cumulative events.

No new runtime dependency installed. [Full lock](requirements.lock),
[license/version inventory](dependencies.json), [official sources](SOURCES.md).
Pins: CadQuery 2.6.1, cadquery-ocp 7.8.1.1.post1, CasADi **3.7.2**, ezdxf 1.4.3,
ReportLab 4.4.3, pypdf 6.0.0, pypdfium2 4.30.0, Pillow 11.3.0, pytest 8.4.2.
Authentication uses Python standard-library HMAC/HTTPS, no new framework.

## Unsupported And Release Boundary

Only an X-normal rectangular flat plate with full circular through-holes is
supported. Blind holes, counterbores/countersinks, pockets, bends, angled bores,
multiple solids and nonrectangular profiles are rejected. Supplied external
documents, arbitrary later-edit synchronization, native associative Drawing tabs,
CAM/toolpaths, assemblies/mates, BOM and whole-robot reference robustness are not
implemented or demonstrated. Manual PDF/DXF edits do not round-trip to Onshape.

Intent is [test-only](intent.test-only.json): 6061-T6, quantity 1, stated test
tolerances and deburr notes. Actual fits, stock, strength, process capability and
rule compliance remain unverified. OpenCascade/Parasolid cross-checks are not
kernel equivalence or engineering approval. Every artifact remains NOT FOR MANUFACTURE.