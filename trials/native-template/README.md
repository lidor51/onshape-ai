# Native Template Reuse And Human Handoff

## Status And Purpose

**FINISHED live on 2026-09-11.** Resumed the existing two public documents and
append-only ledger; no restart or extra document. The separate-editor changes,
AI revision, and original-template remeasurement all passed. This supersedes the
old credential-blocked status; the user explicitly authorized the current key
despite historical exposure, without claiming rotation.

- [Revised editable copy](https://cad.onshape.com/documents/2db9a7eda58817bb0ba921b8/w/511535852de274d393a2ea6c/e/87e35d1bfe08c90c7ac97c4f): width 360, gap 95, preserved thickness 8, pivot Y=30, six through-holes including diameter 4 at Y=200/Z=40 (all mm).
- [Original template](https://cad.onshape.com/documents/2f23d55654f456b946061a5f/w/ccfd8b5117a32b5fb46baaeb/e/0b24f166452add1bd85ec855): unchanged baseline geometry, native definitions and microversion.
- Cumulative **84/120 attempts, 83 successes, 0 HTTP failures, 1 historical interrupted read with unknown allowance outcome; 36 attempts remain.** Exactly two documents total, zero blind retries.
- The revision used **6 successful calls**, including readback and B-rep geometry verification, in 2141.5516 ms runner time. Setup/copy/editor/original verification are separate costs.
- **30 local tests passed, 0 failed**, plus offline replay of all five live evidence sets. Native readback confirms 34 final features, seven sketches and 30 driving constraints, with no FIX constraints. Human UI editing and exact solver DOF remain **UNVERIFIED**.

See [REPORT.md](REPORT.md) for exact costs/timings, geometry and limitations,
[summary.json](artifacts/summary.json), [cumulative ledger](artifacts/call-ledger.json),
[source research](sources/README.md), and the optional [UI checklist](UI-CHECKLIST.md).
The acceptance contract below is retained; unverified gates are not silently passed.

Local-only reproduction from repository root (Node v24.15.0, no npm dependencies):

```powershell
node trials/native-template/run.mjs --offline
node trials/native-template/finish.mjs
```

The first command runs the suite and refreshes offline receipts; the second
revalidates retained live responses and republishes LIVE_COMPLETE without network
or credentials. Raw live state is ignored by Git and retained locally. Completed
live phases must not be replayed; never reset the ledger to regain budget.

User requirements: free tools, at most 2,500 successful Onshape API calls per
year, high-quality geometry, important dimensions editable by non-coders in the
normal Onshape UI, and automatic manufacturing deliverables. Credential setup
and engineering review are allowed; recurring manual modeling is not required.

This tests **build a native parametric template once, then copy and revise it**.
It is not another from-scratch nine-body native API trial. The new questions are
amortized call cost, native dimension/constraint quality, and preservation of
edits made after AI generation. Do not build another custom FeatureScript or MCP
generator, import STEP as the editable model, or expand into robot assemblies.

Read [the protocol](../../benchmark/PROTOCOL.md),
[the benchmark](../../benchmark/intake.json), and
[access rules](../../docs/ACCESS.md). Keep code, dependencies, and artifacts in
this folder. Do not modify shared files or inspect/copy sibling implementations
or results. This is a follow-up experiment, not a numerical reranking of the
original three generation trials. Use Node 24 built-ins where practical.

## Hypothesis And First Check

Hypothesis: a small native template can retain meaningful UI-editable design
intent, preserve later user edits, and apply the width/gap revision in at most
**6 successful API calls**, including readback and geometric verification.
Template authoring and copying are measured separately, never treated as free.

First implement a local dependency/patch test: a simulated user changes plate
thickness and adds a downstream feature; an AI width/gap update must change only
those two driving values and preserve all other feature definitions. Also reject
a stale microversion. Run this narrow test immediately. It can disprove the
ownership/update design, but cannot prove Onshape constraints or UI behavior.

Before any authenticated request, run a mandatory offline preflight on the exact
candidate parameters and patch. Check units/finite values, positive thickness,
plate bounds, hole containment/non-overlap, analytic volume, parameter dependencies,
and preservation of unrelated cached feature definitions. Include invalid inputs
and a stale-state case; assert they cannot invoke the transport. Bind the passing
report to source/parameter/test hashes and invalidate it on changes. Do not load
credentials until this gate passes. Cached definitions cannot reveal newer remote
edits, so live concurrency checks and server geometry validation remain required.
These arithmetic/contract checks are not real local CAD execution; the separate
local-preflight-browser experiment tests the added value of an OpenCascade solid
oracle. Do not duplicate that oracle or claim native constraints compile locally.

## Bounded Fixture

Use only the benchmark's **left side plate** as a reusable component family.
Do not recreate the nine-part mechanism. Read shared dimensions from the JSON,
not sibling generated artifacts. This small fixture exercises important edits:

| Control | Baseline | Why it matters |
| --- | --- | --- |
| Inner width | 340 mm | Drives the plate's inner X face to -width/2 |
| Roller gap | 100 mm | Drives rear shaft-hole Y = 70 + 76.2 + gap |
| Plate thickness | 6.35 mm | Ordinary extrude depth |
| Plate length / height | 320 / 150 mm | Dimensioned rectangular sketch |
| Shaft / pivot hole diameter | 12.9 mm | Standard hole or dimensioned cut |
| Mount hole diameter | 6.6 mm | Independently editable mounting holes |
| Pivot Y / Z | 25 / 130 mm | Dimensioned hole location |

Baseline X bounds are [-176.35, -170] mm; Y bounds [0, 320]; Z bounds
[12.7, 162.7]. The five hole centers in world Y/Z are (70,65), (246.2,65),
(140,135), (300,135), and (25,130). Shaft/pivot holes are 12.9 mm; mount
holes are 6.6 mm. Derive these from the shared specification.

Create ordinary native variables, a dimension-constrained profile, an extrude,
and clearly named hole/cut features. Prefer native Hole features if the current
documented API supports them; record a dimensioned-sketch/cut implementation as
such. Important dimensions must live in native feature dialogs or constraints,
not only in external JSON, hidden coordinates, fixed geometry, or source code.
All intended sketch degrees of freedom must be constrained; report what server
or UI evidence supports that claim. No need to add every native feature type.

Use native variable features initially. Configurations are optional only if
needed, not a second experiment. Configurations can change part IDs: do not
assume IDs are stable across copies or configurations. Within a revision track
feature identity and semantic part identity, resolving changed geometry IDs.

## Execution Sequence

1. Research the current public feature, constraint, variable, and document-copy
   contracts. Record exact URLs, API/library versions, and unsupported fields.
   No guessed payload is evidence of compatibility. Inspect constraints and
   dimension expressions returned by Onshape, not just a feature count.
2. Build the template automatically in one new trial-owned document. No existing
   human-authored template may be a hidden prerequisite. Include all bootstrap
   calls/time in the report. Measure the baseline plate and feature health.
3. Copy the template into a second new trial-owned document using a supported
   API. Verify destination privacy, source references, and independent native
   feature editability. A linked/derived frozen solid is not an editable copy.
   Rebind returned IDs; do not assume source IDs survive copying.
4. On the copy, apply a separate-editor change: thickness 6.35 -> 8 mm and
   pivot Y 25 -> 30 mm; add a downstream 4 mm through-hole at Y=200, Z=40.
   Use ordinary native feature edits. The added hole must be separately named
   and outside the AI-owned driving parameters.
5. Read the current feature state, then apply the benchmark revision: inner
   width 340 -> 360 mm and roller gap 100 -> 95 mm. Patch only these variables
   with concurrency guards. Preserve thickness, pivot position, the added hole,
   and all unrelated feature definitions. Do not recreate the document or tree.
6. Verify final X bounds [-188,-180] mm, rear shaft-hole Y=241.2 mm, the pivot
   at (30,130), thickness 8 mm, and six through-holes including the added one.
   The original template must remain at baseline. Read feature errors and exact
   server geometry, not only source parameters or a shaded image.
7. Exercise a local negative case: an intervening editor modifies a requested
   AI-owned variable after readback. The patch must stop for reconciliation;
   an unknown outcome or conflict must never trigger an unconditional retry.

For step 4, default to a **separate-editor API simulation** so execution does
not depend on a person doing CAD. This establishes preservation only, not UI
usability. Provide an optional non-coder checklist using the same edits: open
the named variable/dimension dialog, change thickness and pivot location, add
the hole, then inspect the AI revision. No code, console, manual coordinate
payloads, or FeatureScript editing. Record actual completion and difficulties if
a human elects to test it; otherwise label human UI usability **UNVERIFIED**.
Do not substitute browser automation for a human test or claim simulated actions
were human-observed. The existing no-Playwright-modeling rule still applies.

## API Budget And Free Operation

- Planning target: at most 6 successful calls per verified two-variable revision;
  measure actual calls for this case rather than extrapolating arbitrary CAD.
- Experiment hard ceiling: **120 attempted authenticated requests total** across
  bootstrap, copying, edit simulation, inspection, and any authorized repair.
  Maximum two newly created documents, including copies. Persist counters across
  phases/restarts; rerunning does not reset the budget or authorize new documents.
- Record setup, copy, simulated-human edits, revision, and validation separately.
  Log attempted requests, 2xx/3xx successes, failures, retries, and unknown outcomes.
  Polls/downloads count too. No habitual exports or screenshots on every edit.
- Before live work, reserve the maximum attempts against the remaining annual
  allowance, counting unknown outcomes conservatively. Local tests use zero
  authenticated requests. Do not spend the full annual quota proving a concept.
- Report the measured planning equation:
  `setup + copies * copyCost + revisions * revisionCost + packages * packageCost
  + otherUsage <= 2000`, leaving a proposed 500-call reserve under 2,500. These
  are planning assumptions, not measured usage or a promised yearly capacity.
  Package cost comes from a measured deliverable pipeline, not an assumed zero.
- No paid CAD kernel, paid template, paid API tier, or temporary paid trial may
  be necessary. Count any external AI/service cost separately; free Onshape
  operations do not imply free model-provider usage.

## Safety And Completed Authorization

The original brief was offline-only; the subsequent explicit current-key risk
acknowledgment authorized the completed live work. The runner supports either that
acknowledgment or a rotation attestation, never infers rotation, and requires exact
origin, a saved shared-account reservation, and the cumulative 120-attempt/two-
document bounds. This continuation used only the already recorded documents.
Both are public synthetic fixtures; there was no privacy fallback, sharing change,
or paid upgrade. The reservation snapshot remains the original ledger-bound one,
not a new account usage claim. Credentials remain runtime-only and should be
rotated after use; historical exposure is not reported as a current blocker.

Never read credentials with editor tools or print/store secrets, headers, raw
errors, or environment dumps. Load credentials in memory only in explicit live
mode; sign only requests to the approved origin, rejecting redirects. Mutate only
the two documents created and recorded by this experiment. No existing robot
documents, sharing changes, deletion, or automatic replay of ambiguous POSTs.
Stop on authorization, privacy, entitlement, exhausted budget, or concurrency
failures. Keep live IDs/geometry/logs ignored by Git via a folder-local ignore file.

## Required Deliverables And Gates

The executing agent must implement a documented offline-default runner and local
tests in this folder. Its live mode needs explicit confirmation, a persisted call
ledger, and trial-owned document provenance. Record exact commands and dependency
versions/licenses. Do not present future CLI commands as already runnable.

Produce a report, sanitized call ledger, logical feature/control map, baseline
and final measurement evidence, original-template unchanged evidence, and a
separate-editor preservation diff. Include an optional UI checklist with results
kept separate from API simulation. List which edits are possible in ordinary UI,
which are outside the template family, and what a new family would cost.

Report each gate as PASS, FAIL, BLOCKED, or UNVERIFIED:

- Native parameter/constraint structure and measured baseline geometry.
- Independent editable copy without rebuilding the component from scratch.
- Revision geometry, downstream feature preservation, and conflict detection.
- Actual non-coder UI editing; never infer this from successful HTTP responses.
- Measured cold-start/copy/revision costs and a credible annual usage example.

Do not call the result production-ready: this is a geometry/editability test.
Material, tolerances, strength, fits, assemblies, and fabrication release are not
established by the packaging benchmark. Stop once these gates are reported;
do not add a whole-robot or separate assembly experiment.

## Research Starting Points

- [Native features](https://onshape-public.github.io/docs/api-adv/featureaccess/)
- [Documents and versions](https://onshape-public.github.io/docs/api-adv/documents/)
- [Configurations and part identity](https://onshape-public.github.io/docs/api-adv/configs/)
- [Geometry associativity](https://onshape-public.github.io/docs/api-adv/associativity/)
- [API Explorer](https://cad.onshape.com/glassworks/explorer/)
- [Annual and rate limits](https://onshape-public.github.io/docs/auth/limits/)

These are starting points, not verified payload contracts. Recheck current
schemas before authenticated execution. This brief was prepared 2026-09-11.