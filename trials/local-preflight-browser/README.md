# Local CAD Preflight And Browser Checkpoints

## Status And Selection

Local execution completed on 2026-09-11: **LOCAL CAD PASS; BROWSER BLOCKED**.
All 6 candidate states and 25 sweep states passed real CadQuery/OpenCascade B-rep
checks, analytic comparisons and STEP export/reimport, with 31 local STEP files
and 31 orthographic SVG previews. Recorded tests: 15 Node and 8 Python PASS.
The isolated folder-local Python 3.10 environment uses CadQuery 2.6.1 and CasADi
3.7.2, with all 42 installed distributions pinned in
[requirements.lock](requirements.lock). Completed geometry work was recovered
from saved evidence, not restarted. The old zero-solid/setup-blocked report is
superseded by the measured results below.

**This completion is local-only.** No browser, Onshape API, credentials, sibling
environment, delegation or commits are allowed. Browser admission remains
`BLOCKED` under the recorded terms restriction regardless of a local PASS.
No Onshape document, server export, browser screenshot or cloud compilation
evidence exists. `node audit.mjs` rechecks all 31 states against current input,
runtime and artifact hashes; `node verify-node.mjs` never overwrites CAD reports.
See [the report](REPORT.md), [runbook](RUNBOOK.md), and [file inventory](FILES.md).
The original requirements below describe the broader trial, not authorization to
resume its browser phase or claims that its unexecuted gates passed.
This is the **third and final added trial**, alongside native-template reuse and
local manufacturing packages. It combines two questions rather than adding two
more experiments: how much bad CAD can be rejected locally, and can accepted
candidates reach Onshape through bounded normal-UI interactions without consuming
the 2,500 annual API-call allocation?

Use locally prepared **FeatureScript submitted through Feature Studio's UI**,
not STEP as the primary editable model. STEP would validate the exact upload
locally but lose the original driving dimensions/history. FeatureScript retains
normal parameter dialogs for important changes, although its internal operations
are not separate native sketches/extrudes. The trial must measure that tradeoff,
not imply ordinary native history was preserved inside a custom feature.

This is a local-first submission/verification experiment, not another nine-body
FeatureScript generation trial, MCP server comparison, or continuous UI modeler.
Use Playwright MCP as the browser controller; do not introduce an Onshape API MCP
behind it. Prepare and repair code locally. Visit Onshape only for the bounded
candidate checkpoints, including the small editability check described below.

Read [the protocol and scoped browser exception](../../benchmark/PROTOCOL.md),
[the benchmark](../../benchmark/intake.json), and
[access rules](../../docs/ACCESS.md). Write only under this folder. The protocol
allows a supplied fixture or read-only use of
[the existing FeatureScript source](../featurescript/intake.fs) as input to avoid
duplicate generation work. Record the input hash and local adaptations; do not
read sibling reports, implementations beyond that source, or performance results.
Reused source means this is not independent evidence of AI generation quality.

## Hypothesis And Cheap Check

Hypothesis: a bounded plate feature can pass real local solid checks before any
browser use, then be submitted and verified at two milestones using **zero direct
Onshape API calls**, while a non-coder can adjust important dimensions in native
dialogs. Browser interaction cost and Onshape regeneration still exist; zero
counted API calls does not mean zero network traffic, zero AI cost, or unlimited
automation permission.

First implement an offline gate around a stub browser adapter. An invalid plate,
failed solid check, or changed candidate hash must prevent adapter invocation.
Test this immediately with an invalid hole location and a stale validation report.
Only then implement the local CAD validation and real browser checkpoint. A stub
proves gating/control flow, not Onshape CAD, browser reliability, or quota behavior.

## Local Preflight Before Submission

Use one left plate from the shared benchmark, not all nine solids. Adapt an
existing plate-building helper where practical. Expose length, height, thickness,
inner width, roller gap, shaft-hole diameter, mount-hole diameter, pivot-hole
diameter, and pivot Y/Z through the feature's ordinary parameter dialog. Keep the
fixed benchmark axes and driving relationships documented in a shared local input.
At minimum a non-coder must be able to change thickness, pivot position, and gap
without editing FeatureScript. No manual copy/paste by a person is allowed.

Build a small independent local solid with CadQuery/build123d/OpenCascade from the
same parameters used to generate the candidate FeatureScript and parameter map.
Use a maintained free geometry library, not a new kernel or a claimed local
FeatureScript interpreter. Pin dependencies in a folder-local environment. This
is a limited geometric oracle, not a generic FeatureScript-to-Python translator.

Before **each submitted candidate**, check:

- Units, finite values, positive sizes, positive hole-edge ligaments and no
  overlapping holes. State any stronger design-rule minimum as a test assumption.
- A valid closed single solid, expected thickness/bounds/volume, and all five
  cylindrical through-holes (six in the final downstream-edit state) with correct
  radii and positions, measured from the local B-rep rather than only repeated
  parameter arithmetic.
- Independently derived analytic volume and bounds against the local solid, plus
  STEP export/reimport checks and a local orthographic preview. Images alone fail.
- A deterministic valid sweep including baseline/revision, thickness 6.35/8 mm,
  pivot Y 25/30 mm, and an interior gap value. Also reject negative thickness,
  out-of-plate holes, overlapping bores, wrong units, and non-finite parameters.
- FeatureScript source contracts, pinned library version, exposed parameter map,
  and source/parameter/validator/dependency hashes. Changing any submitted input
  invalidates the pass report. Text checks are not FeatureScript compilation.

Record local candidate counts, failures caught, wall time, and network isolation.
Tests and geometry sweeps must work without Onshape credentials or network access
after installing dependencies. Missing dependencies are a setup blocker, not a
reason to open Onshape for trial-and-error CAD.

FeatureScript executes inside Onshape; OpenCascade is not Onshape's Parasolid.
The local pass cannot guarantee FeatureScript syntax/type correctness, query
resolution, identical topology, successful Onshape booleans, or downstream
references. Record cloud-only errors as preflight misses, not as local successes.

## Bounded Browser Execution

Prepare both milestone candidates, intermediate dialog-edit states, and the final
six-hole downstream-edit state locally before opening the browser. A submission
is allowed only when the corresponding hash-bound preflight report passes.

1. Confirm live execution authorization and an authenticated Onshape browser
   session. The current protocol permits explicitly confirmed NEW PUBLIC documents
   for synthetic intake data; require that choice rather than auto-fallback from
   failed private creation. Create at most **one new trial-owned document** and
   record its identity/visibility. Never modify an existing robot document.
2. **Checkpoint A:** create the necessary Feature Studio/Part Studio through the
   ordinary UI. Submit complete prepared source through the actual editor using
   normal input/paste actions, then compile and insert the feature. Do not assume
   a `.fs` file can be uploaded using the normal STEP import dialog. Use supported
   visible editor actions; no injected Ace internals or hidden application methods.
   Log the source hash, visible compiler/regeneration state, and feature identity.
3. Verify baseline geometry with visible UI measurements and a normal-UI STEP
   export/download, parsed locally. Compare bounds, volume, hole axes/radii, and
   positions to the preflight contract. Baseline X bounds are [-176.35,-170] mm;
   rear shaft-hole Y is 246.2 mm. Require one solid and five through-holes. Use
   0.01 mm geometric and max(0.1 mm^3, 1e-6 * volume) volume comparison tolerances,
   not manufacturing tolerances. Keep the original downloaded bytes and hash.
4. **Checkpoint B:** exercise the real parameter dialog to set thickness to 8 mm
   and pivot Y to 30 mm. Then apply only the already-preflighted AI revision:
   inner width 360 mm and gap 95 mm. Preserve the two prior edits. Expect X bounds
   [-188,-180] mm, rear shaft-hole Y=241.2 mm, and pivot center Y/Z=(30,130) mm.
   Retain the same document and custom-feature instance; no delete/recreate cycle.
   These are small handoff tests inside a checkpoint, not a browser-driven design
   search. Report them as **automated UI evidence**, not actual human testing.
5. During B, verify a downstream normal feature can be added without source edits,
   using a single named 4 mm through-hole at Y=200, Z=40. Locally preflight the
   resulting six-hole state first. Suppress/unsuppress the added feature via its
   normal UI to confirm independent editability; finish unsuppressed. If precise
   selection/dimension entry cannot be made reliably, report the gate blocked
   rather than spending the session iterating on mouse coordinates.
6. Measure/export/download B once through the UI and compare locally, including
   the added hole and preserved edits. Downloads verify server output: do not
   substitute the local preflight STEP and call it an Onshape export. Retain A/B
   snapshots plus dialog/feature-tree screenshots and the visible revision state.
   Stop if concurrent changes prevent tying export/measurements to that state.

There are **two planned candidate checkpoints plus at most one repair checkpoint**
for the whole experiment, not per feature or error. On failure, capture diagnostics
once, leave the browser, repair locally, rerun the complete preflight, then use that
one remaining repair opportunity. Reuse healthy source for parameter-only B; do
not reupload code unless it actually changed. Stop when the repair allowance is
exhausted. Do not keep a browser session busy while generating local candidates.

Each checkpoint has a ceiling of **60 browser tool invocations or 15 minutes of
active browser work**, whichever comes first. Initial authentication wait is
reported separately. Also count actual UI actions within scripted calls, not just
tool invocations; no unbounded loops inside one call. Prefer semantic locators and
bounded state waits, no blind clicks, repeated refreshes, or tight polling. A UI
timeout requires state inspection before any retry of a mutating action.

## API Accounting And Safety

Onshape's [published allocation rules](https://onshape-public.github.io/docs/auth/limits/)
say calls from the Onshape browser client do not count toward API limits. This
makes normal-UI submission worth testing; it does not establish a Playwright
support guarantee or an exemption from the site's terms and rate/access controls.
Recheck current terms before live execution, stop on service automation restrictions,
and never bypass CAPTCHA, MFA, permission checks, or throttling.

- **Direct API budget: 0.** No API keys, private OAuth, API Explorer, API MCP calls,
  Playwright request client, browser `fetch`/XHR injection, hidden network replay,
  or cookie-based REST scripts. Using a browser tool to call REST does not count
  as this normal-UI route. Never silently fall back to API verification/export.
- Read the displayed Developer allocation counter at most once before and once
  after the run if accessible without secrets. Record only sanitized counts/time,
  outside the candidate-action totals but in total browser overhead. Do not inspect
  keys. Delayed counters/concurrent account use make a delta inconclusive: report
  policy expectation separately from observed quota evidence; zero explicit API
  requests alone does not prove an account counter stayed unchanged.
- This adds no direct-call allowance to the two earlier experiments' combined
  200-attempt ceiling. Keep the entire workflow below 2,500 successful calls/year
  if any separately authorized API work is later added; that would be a different
  measured workflow. External model/provider usage is a separate possible cost.
- Have the user authenticate directly when needed. Never read the open credential
  file, request passwords/MFA codes in chat, inspect cookies/storage, export browser
  authentication state, or persist HAR/network headers. Keep screenshots cropped
  away from account/credential controls and live artifacts Git-ignored locally.
- Use only the confirmed trial document and synthetic geometry. No existing-data
  uploads, sharing changes, document deletion, external CAD converters, supplier
  submissions, or paid software/trial prerequisites. Allow only expected Onshape
  navigation/download destinations; stop on unexpected redirects or file prompts.

## Deliverables And Verdict

Implement offline tests and a candidate builder/validator before browser actions.
Use the environment's actual Playwright MCP tools and document their availability;
do not invent a runnable CLI for a nonexistent browser integration. Provide the
next agent exact local setup/test/generation commands and a short checkpoint
runbook with observed locators/states. Do not promise the locators remain stable.

Produce source/parameter hashes, local preflight and negative-test results, an
action/checkpoint ledger, server-download hashes, local-vs-server comparisons,
sanitized quota observations, screenshots, and a report. A machine-readable
candidate gate must prevent accidental submission of unvalidated changed source.

Report each gate as PASS, FAIL, BLOCKED, or UNVERIFIED:

- Invalid candidates rejected locally before any browser or API work.
- Accepted candidate generated in Onshape and geometry verified after download.
- Important dimensions edited through real parameter dialogs without coding.
- Prior edits retained and a separate ordinary downstream feature stays editable.
- Zero direct API calls, bounded browser work, and separately qualified quota data.
- Repeatability and intervention count; actual human usability remains UNVERIFIED
  unless a non-coder chooses to perform the same dialog edits personally.

Do not generate another drawing pipeline here. Retain the verified STEP and
measurement snapshot as possible inputs to the manufacturing-package experiment
under a separately authorized handoff. This trial alone does not prove drawings,
tolerances, arbitrary native feature history, assemblies, or manufacture readiness.

## Sources And Limits

- [Annual allocation and browser exclusion](https://onshape-public.github.io/docs/auth/limits/)
- [FeatureScript execution and Feature Studios](https://cad.onshape.com/FsDoc/intro.html)
- [Native custom-feature dialogs](https://cad.onshape.com/FsDoc/uispec.html)
- [Feature Studio UI](https://cad.onshape.com/help/Content/FeatureStudio/feature_studios.htm)
- [CadQuery local STEP import/export](https://cadquery.readthedocs.io/en/latest/importexport.html)

Allocation and execution documentation was checked in the earlier work on
2026-09-11; no web recheck was made during this local-only completion. The local
oracle has executed successfully. Cloud compilation, browser editability and
counter behavior remain unverified; browser admission remains BLOCKED. Local
OpenCascade evidence does not establish Onshape Parasolid or FeatureScript
correctness and does not authorize browser or credential access.