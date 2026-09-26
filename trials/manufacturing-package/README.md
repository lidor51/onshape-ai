# Local Manufacturing Package From Onshape Geometry

## Status And Purpose

Completed with real native Onshape geometry on 2026-09-11: **60 tests passed**,
immutable A/B original-byte STEP exports, exact server measurements, derived
PDF/DXF/PNG packages and a standalone zero-network B rerender. **31/80 cumulative
authenticated attempts, 31 successes, zero failed/unknown HTTP outcomes or retries;
one new PUBLIC synthetic document.** Setup=9, revision=6, A=8, B=8 calls.
Current-key use was explicitly acknowledged; **rotation remains unconfirmed**.
Every package is TEST_ONLY and NOT FOR MANUFACTURE. See [live results](LIVE-REPORT.md)
and the separately labeled [historical synthetic report](REPORT.md#historical-offline-report).

## Runnable Workflow

Run from this folder with the already-created local environment:

```powershell
Set-Location C:\Users\lidor\FRC\onshape-ai\trials\manufacturing-package
.\.venv\Scripts\python.exe run.py offline
.\.venv\Scripts\python.exe run.py rerender --source live --revision B
.\.venv\Scripts\python.exe run.py finish-live
.\.venv\Scripts\python.exe run.py test
.\.venv\Scripts\python.exe -m pip check
```

The offline command runs tests, retains immutable synthetic A/B caches, regenerates
synthetic packages and refreshes hash-bound preflight. Real-evidence tests consume
retained live artifacts when present and explicitly skip when absent. Live-source
rerender and finish-live need neither credentials nor network. Do not edit the
cached STEP or its snapshot manifest;
changes require a new consistent snapshot, not a drawing-only revision label.

For a fresh installation only, create `.venv` inside this folder with a supported
64-bit Python 3.10 interpreter and install [the complete tested lock](requirements.lock):

```powershell
& C:\Python310\python.exe -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.lock
```

The tested host is Python 3.10.0 / Windows 10 x64. The environment is isolated;
no global package installation is needed. CasADi 3.7.2 is deliberately pinned:
3.8.0 caused a native exit fault with this CadQuery stack. Current upstream docs
can describe newer APIs; this implementation uses the tested installed versions.

| Revision | Engineering Drawing | Preview | 1:1 mm Cutting Profile | Original STEP Bytes |
| --- | --- | --- | --- | --- |
| A, five holes | [PDF](artifacts/live/A/package/drawing.pdf) | [PNG](artifacts/live/A/package/drawing.png) | [DXF](artifacts/live/A/package/profile.dxf) | [STEP](artifacts/live/A/package/plate.step) |
| B, six holes | [PDF](artifacts/live/B/package/drawing.pdf) | [PNG](artifacts/live/B/package/drawing.png) | [DXF](artifacts/live/B/package/profile.dxf) | [STEP](artifacts/live/B/package/plate.step) |

The [live summary](artifacts/live/summary.json), [60 test outcomes](artifacts/live/tests.json),
[rerender proof](artifacts/live/B/rerender/network-proof.json), and
[cumulative ledger](artifacts/private/call-ledger.json) contain actual observations.
Live caches/outputs and operational records remain Git-ignored. Historical synthetic
solids and packages remain separately under `artifacts/offline/`; local regeneration
refreshes their derived outputs and test metadata, not their source cache solids.

The executed live command was:

```powershell
.\.venv\Scripts\python.exe run.py live --acknowledge-current-key --confirm-new-public
```

It loads root credentials in memory only after authorization and current preflight,
using exact-origin HMAC HTTPS. The acknowledgment is separate from the fresh-key
flag, which was NOT used. The ledger never resets; unknown POSTs are never replayed;
creation is reserved once. There is no browser/MCP or FeatureScript geometry fallback.
Use cached rerender for layout changes, not another live run. This is a bounded A/B
fixture builder, not an arbitrary future-edit synchronizer.

The [native builder](native.py) executes ordinary plane/sketch/extrude additions and
edits. The [snapshot module](snapshot.py) binds immutable versions, healthy features,
part identity, [read-only exact measurements](measure.fs), export jobs and original
downloads. Both real snapshots passed. The [safety module](safety.py) retains counts,
provenance and exclusive locking. Pre-existing/supplied external documents remain
unsupported and denied. Mock tests remain distinct from actual server evidence.

Optional public documentation refresh, with no credentials:

```powershell
node research.mjs
```

This is a network command for public documentation only. It is not part of local
rerendering. Refreshing the schema invalidates preflight until offline checks run
again. See [fetched sources and contract limitations](SOURCES.md) and
[dependency/license inventory](dependencies.json).

## Original Scope

The requested page for a manufacturer is an **engineering drawing**, also called
a manufacturing or fabrication drawing. Test automatic generation of a dimensioned
PDF, a 1:1 DXF cutting profile, and the corresponding STEP solid, using free local
tools within the user's **2,500 successful Onshape API calls per year**. This is
a deliverable pipeline, not another CAD generation method, STEP-import modeling
trial, or MCP integration.

The editable source stays native in Onshape. Download a snapshot at a milestone,
then derive the package locally; do not replace the native tree with STEP. Humans
continue editing important geometry in Onshape's ordinary UI. Local PDF/SVG/DXF
outputs are **not native associative Onshape Drawing tabs**: manual drawing edits
will not round-trip automatically. Regenerate after model changes and report this
limitation explicitly. Native drawing-tab editing is outside this experiment.

Read [the protocol](../../benchmark/PROTOCOL.md),
[the benchmark](../../benchmark/intake.json), and
[access rules](../../docs/ACCESS.md). Write only within this folder. Do not inspect
or copy sibling implementations/results. Do not build another full intake,
template-reuse system, assembly workflow, browser modeler, or custom MCP server.

## Hypothesis And First Check

Hypothesis: one authoritative Onshape part snapshot can produce a complete,
geometrically consistent flat-plate drawing/cutting package in at most **10
successful API calls per milestone**, including versioning, inspection, export,
polls, and download. Subsequent rendering/layout changes to the same cached
snapshot require **zero authenticated requests**. Fixture construction is a
separate measured setup expense, never omitted from total cost.

First build an offline test with a clearly labeled synthetic STEP plate and
measurement fixture: import it, recover the outer profile and all through-holes,
and verify drawing-plane coordinates and millimeter units. Deliberately supply a
stale measurement manifest and assert rejection. Run that narrow test immediately.
This can disprove the extraction/validation logic, not prove Onshape export or
manufacturing fitness. Never label a synthetic/local fixture as server evidence.
Require these offline checks to pass before the first live snapshot request.
They validate the extraction/drawing pipeline in advance, not unseen Onshape CAD.
Actual source geometry still requires a consistent server snapshot afterward.

## Bounded Fixture And Revisions

Use one flat left side plate from the shared benchmark, not the whole mechanism.
If no separately authorized read-only test snapshot is supplied, create one small
native plate fixture automatically in **one new trial-owned document**. This is
input setup only, not a new scored native modeling route. Do not rely on a person
to create, download, annotate, or upload the fixture. Never use an existing robot
document as the default input. Record setup calls and any supplied input provenance.

Baseline A uses the JSON dimensions. Create revision B in the same owned fixture:
apply inner width 360 mm and roller gap 95 mm, then independently change thickness
to 8 mm, pivot Y to 30 mm, and add a 4 mm through-hole at world Y=200, Z=40.
These last three changes are explicit **test extensions** representing later
user edits, not modifications to the shared benchmark. Implement them with normal
native edits; API simulation does not establish observed human UI usability.

Use this drawing coordinate system: `u = world Y`, `v = world Z - 12.7 mm`.
The origin is the front/lower plate corner; the plate normal is along world X.
Do not mirror, swap axes, or silently change handedness during projection.

| Geometric check in drawing coordinates (mm) | Baseline A | Revision B |
| --- | --- | --- |
| Outer size | 320 x 150 | 320 x 150 |
| Thickness | 6.35 | 8 |
| Front shaft hole center / diameter | (70,52.3) / 12.9 | unchanged |
| Rear shaft hole center / diameter | (246.2,52.3) / 12.9 | (241.2,52.3) / 12.9 |
| Mount centers / diameter | (140,122.3), (300,122.3) / 6.6 | unchanged |
| Pivot center / diameter | (25,117.3) / 12.9 | (30,117.3) / 12.9 |
| Added downstream hole | absent | (200,27.3) / 4 |
| Through-hole count | 5 | 6 |

Treat these as acceptance checks only. **Extract delivered geometry from the
actual exported solid**, not by redrawing these hard-coded values or rereading
only the original JSON. Otherwise human edits would disappear from the package.
The revision's X location changes too, but that placement is not a fabrication
dimension of the individual plate.

## Execution Sequence

1. Verify current public export, versioning, and measurement contracts. Use
   supported documented endpoints with actual response binding, not invented
   drawing/annotation endpoints. Record schema versions and fetched sources.
2. Implement an offline-default runner with separate snapshot and local-render
   phases. Keep local rendering usable without credentials or network access.
   Use pinned, free libraries in a folder-local environment. A practical starting
   stack is CadQuery/OpenCascade for STEP inspection, ezdxf for DXF, and ReportLab
   for PDF. Equivalent maintained free libraries are acceptable; do not handwrite
   STEP/DXF/PDF parsers or assume an SVG projection is a dimensioned drawing.
3. For each authorized fixture state, obtain feature health, selected part
   identity, units, tight bounds, volume, thickness, and hole centers/diameters.
   Use exact server geometry evaluation where available; visualization bounding
   boxes and images are not dimensional evidence. Read-only FeatureScript
   evaluation is allowed for measurement, not as a geometry-generation fallback.
4. Bind measurements and STEP to the **same immutable version/microversion** and
   configuration. Record document/element/part identity, revision, source state,
   timestamp, and artifact hashes. If an export API cannot address a microversion,
   create a version or use an explicitly verified consistency guard. Never mix
   measurements of an old state with an export of a moving workspace.
5. Export the selected part, retrieve the completed file with bounded polling,
   and cache it. Record actual API costs, including all downloads and metadata.
   Check response state and parse the STEP into a valid single solid. Retain the
   original Onshape STEP bytes in the package; do not silently substitute a local
   remodeling or re-export. Failure to retrieve a supported export is a blocker.
6. Locally identify the two planar plate faces, constant thickness, exterior
   boundary, and cylindrical through-holes. Reject unsupported geometry such as
   countersinks, blind holes, bends, or ambiguous faces rather than flattening it
   into a misleading plate profile. Preserve circles/arcs, not mesh silhouettes.
7. Generate the package described below from the extracted geometry plus explicit
   manufacturing intent. Compare against the server measurement snapshot, then
   reparse the outputs using suitable libraries. Render and inspect the PDF.
8. Repeat for revision B. The changed rear/pivot holes, thickness, and extra hole
   must appear consistently in the PDF, DXF, and STEP. Retain A separately and
   label B clearly. A fresh local run on B's cache must use zero API calls.
9. Run negative tests for a missing hole, wrong units, mixed revisions, unknown
   material/tolerances, and unsupported non-through geometry. All must block a
   release-ready result instead of silently generating plausible-looking output.

## Package Contents And Quality

- **Vector PDF drawing:** a legible dimensioned principal view and thickness
  view, identified orthographic projection convention, consistent scale, units,
  origin/datum scheme, center marks, overall dimensions, every hole's size and
  location, through-hole callouts, and a keyed hole table without duplicate or
  contradictory dimensions. Use standard dimension symbols and embedded fonts.
- **Title block and notes:** part number, description, revision, quantity, sheet
  number, scale, material/grade, stock thickness, tolerances, finish/deburr notes,
  date, and review status. Use A3 landscape at 1:2 unless a tested layout needs a
  different sheet; no clipping, overlapping labels, or unreadable print text.
  Do not substitute an isometric screenshot or a numbers table for the drawing.
- **DXF profile:** explicit mm units, model-space scale 1:1 regardless of PDF
  scale, one closed exterior loop and one closed circle per through-hole, no
  duplicate edges, self-intersections, annotation geometry on cutting layers, or
  inferred kerf/tool compensation. The manufacturer selects the machining process.
- **STEP:** the authoritative selected solid, consistent with the drawing revision
  and DXF. This is CAD exchange geometry, not G-code or a machine toolpath.
- **Local manifest and source:** hashes, source version/configuration, measurements,
  extraction transform, manufacturing-intent inputs, dependency versions, and
  validation/review status. Keep these sensitive provenance records local rather
  than embedding private document URLs into a supplier-facing drawing by default.

Validate extracted sizes/centers against the server to 0.01 mm and volume to
`max(0.1 mm^3, 1e-6 * serverVolume)`. These are **software comparison tolerances**,
not machining tolerances. Reconstruct the DXF loops at measured thickness locally
and compare solid count, holes, bounds, and volume. Matching volume alone is not
enough. Verify PDF text values against extracted geometry; inspect rendered pages
for correct leaders, table keys, scale, and layout at normal print size.

OpenCascade and Onshape's Parasolid are different kernels. Successful local
import and comparisons are cross-checks, not proof of identical topology or a
complete Onshape compiler/kernel replacement.

## Manufacturing Intent And Release

The existing benchmark explicitly excludes manufacturing tolerances and is only
a packaging study. Do not quietly invent real fits, material, or certification.
For unattended testing, keep the following **test-only assumptions** in a separate
input file rather than changing the benchmark:

- Material: 6061-T6 aluminum; quantity 1; nominal thickness taken from the state.
- Outer size tolerance: +/-0.20 mm; stock thickness: +/-0.13 mm.
- Hole diameter tolerance: +/-0.05 mm; hole coordinate tolerance: +/-0.10 mm.
- Finish: bare; remove burrs and break sharp edges 0.2 mm maximum.
- Part number: TEST-INTAKE-LP; revisions A/B; release status: TEST_ONLY.

These assumptions exercise annotation, not validate actual FRC fits, stock,
strength, or process capability. Mark all experimental sheets **EXPERIMENT - NOT
FOR MANUFACTURE**. Never assign an approval signature automatically. Unknown or
unapproved manufacturing intent must block manufacture-ready status, not drawing
generation for review. Real release requires engineer/manufacturer review of
material, tolerances, interfaces, and process; this is different from requiring
a human to manually create the CAD or drawing.

Report package-generation correctness separately from fabrication approval. A
passing trial demonstrates the ability to generate/check this class of drawing;
it does not establish that this packaging plate is ready to fabricate or that
arbitrary robot components are supported. Report non-flat parts as out of scope.

## API Budget And Safety

- Target: at most 10 successful API calls per verified milestone package, plus
  separately reported fixture setup. Local layout, render, parse, and revision-
  comparison work on cached snapshots uses zero authenticated requests.
- Hard ceiling: **80 attempted authenticated requests total**, including setup,
  both snapshots, polls, failures, downloads, and any authorized repair. Maximum
  one new trial-owned document. Persist counters across phases/restarts; do not
  reset the budget on reruns or automatically create replacement documents.
- Before live work, reserve this cap against the remaining annual allowance.
  Record attempts, 2xx/3xx successes, failures, retries, and unknown outcomes;
   unknown outcomes consume the conservative local reserve. Parent-provided quota
   was 273/2500 used, 2227 remaining. Reserves: manufacturing 80, native 120,
   official 100, safety 500. This trial consumed 31 of its 80; no quota re-query.
- Include measured setup, revision, package, and other usage in an annual scenario
  of at most 2,000 successful calls with a proposed 500-call reserve. State the
  chosen number of revisions/packages; do not promise a yearly workload without
  measurements. No paid CAD/API/PDF service or expiring paid trial is acceptable;
  account for external AI-provider costs separately.

The user's explicit current-key and new-public instructions authorized this run,
without attesting rotation. Follow the shared access policy. The
Free entitlement previously returned HTTP 409 for private creation. The protocol
now records approval for NEW PUBLIC synthetic-intake documents; authorized runs
must explicitly select and verify that visibility. Do not retry private creation,
auto-fallback, publish existing CAD, buy an upgrade, or assume education eligibility.

Load credentials only in explicit live mode and only in memory. Never expose
credentials, headers, environment dumps, or raw errors. Enforce the approved
Onshape origin and reject redirects/unapproved download hosts. Do not upload CAD
to external converters or send files to a manufacturer. Mutate only the newly
created fixture; any separately approved supplied snapshot stays read-only.
No sharing changes, deletion, browser modeling, or blind mutation retries. Stop
on permission/privacy, budget, ambiguous write, or consistency failures. Keep
exports, live IDs, and logs Git-ignored using a folder-local ignore file.

## Required Deliverables And Gates

Implement a documented runner, narrow tests, pinned local dependencies, and an
offline sample workflow in this folder. The commands and files above are now
implemented and executed; the live gates below remain distinct. Produce A/B packages, negative-test
evidence, a sanitized persisted call ledger, and a report with source URLs and
versions/licenses. Separate local/synthetic evidence from actual Onshape evidence.

Report each gate as PASS, FAIL, BLOCKED, or UNVERIFIED:

- Automatic, consistent Onshape snapshots and observed per-milestone API cost.
- PDF dimensions and notes sufficient to describe the bounded plate fixture.
- Parsed DXF/STEP geometry matching server measurements and the drawing.
- Revision B includes later edits absent from the original benchmark JSON.
- Local cache rerender needs no manual drawing work and zero API calls.
- Rendered drawing readability and explicit manufacturing assumptions/status.
- Actual engineering/manufacturer release review, separate from software checks.

Do not add native drawing automation, assemblies, CAM, arbitrary shape recognition,
or another modeling backend if blocked. Report the exact unsupported capability
and stop. The experiment's value is whether this limited, inexpensive handoff is
reliable, not how many output formats or modeling routes can be added.

## Research Starting Points

- [Onshape export and translation](https://onshape-public.github.io/docs/api-adv/translation/)
- [Exact server measurements](https://onshape-public.github.io/docs/api-adv/fs/)
- [Documents and versions](https://onshape-public.github.io/docs/api-adv/documents/)
- [API limits](https://onshape-public.github.io/docs/auth/limits/)
- [CadQuery import/export and units](https://cadquery.readthedocs.io/en/latest/importexport.html)
- [ezdxf documentation](https://ezdxf.readthedocs.io/en/stable/)
- [ReportLab documentation](https://docs.reportlab.com/)

CadQuery documents STEP import and SVG/DXF export, not automatic manufacture-ready
dimensioning. Recheck current APIs, library licenses, and Windows support before
implementation. This brief was prepared 2026-09-11.