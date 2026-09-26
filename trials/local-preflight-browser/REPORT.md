# Local Preflight Browser Follow-up

Date: 2026-09-11. Outcome: **LOCAL CAD PASS; BROWSER ADMISSION BLOCKED**.
This supersedes the initial 13-Node-test, zero-solid, setup-blocked report.
The interrupted work had already completed real geometry execution. This resume
recovered its saved results and passed the current input/runtime/artifact audit;
it did not reinstall dependencies, regenerate inputs or restart the 31-state run.

## Results

| Gate | Verdict | Observed evidence |
| --- | --- | --- |
| Invalid inputs and stale hashes prevent browser stub invocation | PASS | 15 recorded Node tests; 8 Python tests, including six invalid parameter variants and five wrong-solid variants |
| Source/parameter preparation | PASS | One-plate source, ten dialog fields, six states, 25 valid parameter-sweep entries |
| Independent real B-rep oracle and full preflights | PASS | All 31 states: one valid closed solid, measured bounds/volume and five bores, or six in B-final-six |
| Local STEP round-trip and orthographic preview | PASS | 31 measured exports/reimports and 31 nonempty 960 x 500 SVGs; retained local bytes and hashes |
| Dependency setup | PASS | Own Python 3.10.0 venv; 42 exact distribution pins; runtime equals lock; pip check passed |
| Onshape compilation, one plate and downloaded geometry | BLOCKED | Recorded automation restriction; no browser or Onshape API use |
| Real parameter-dialog editing and preserved edits | BLOCKED | Local parameter values verified; no automated UI evidence |
| Independent native downstream hole, suppress/unsuppress | BLOCKED | Final six-hole geometry verified locally; no Onshape native feature created |
| Zero direct API and bounded browser use | PASS | 0 direct Onshape API/MCP calls, 0 browser calls/actions, 0 active seconds, 0 documents/repairs |
| Actual quota delta | UNVERIFIED | No counter reads; historical parent counts are not this trial's measurement |
| Repeatability | PASS locally, limited / UNVERIFIED live | One baseline rebuild matched bounds, volume, bores and SVG hash; no repeated full sweep or UI run |
| Actual human usability | UNVERIFIED | No human editing study or automated UI run |

Evidence: [preflight summary](artifacts/preflight-summary.json),
[Node results](artifacts/node-tests.json), [Python results](artifacts/python-tests.json),
[dependency and repeat evidence](artifacts/dependency-evidence.json),
[ledger](ledger.json), and [current inventory](artifacts/inventory.json).

## Browser Remains Blocked

The requested public-policy recheck retrieved Onshape's
[Terms of Use](https://www.onshape.com/en/legal/terms-of-use), effective July 15,
2020. Section 4(b)(9) prohibits use of automated means to access the Service.
The brief explicitly requires stopping on service automation restrictions.
The separately fetched [allocation rules](https://onshape-public.github.io/docs/auth/limits/)
exclude browser-client calls from quota; that does not establish permission for
Playwright. No workaround, API fallback, account inspection or login attempt was made.

The required deferred `tool_search` loader remains absent, but the terminal and
explicit own-venv executable work. This is not a local execution blocker. No
Pylance/editor-interpreter verification is claimed. Browser admission remains
BLOCKED regardless of a local PASS or user authorization under the recorded
service restriction. No web recheck was made during this local-only resume.
This is not a login/MFA finding: browser authentication was never observed.

## Environment And Recovery

The saved runtime and current audit use this trial's
`.venv\Scripts\python.exe`, base prefix `C:\Python310`, Python 3.10.0, 64-bit
Windows. System-site packages are disabled. No sibling environment or selected
editor environment was borrowed.

[requirements.txt](requirements.txt) pins CadQuery 2.6.1 and CasADi 3.7.2,
replacing the initial uninstalled CadQuery 2.8.0 plan for available Python 3.10
compatibility. [requirements.lock](requirements.lock) pins all 42 installed
distributions, including cadquery-ocp 7.8.1.1.post1, VTK 9.3.1, NumPy 2.2.6,
pip and setuptools. The installed runtime matches that lock exactly. The saved
dependency check reports `No broken requirements found.`

Earlier failures remain in `artifacts/executions`: an import-time subprocess
denied by the guard, a native crash with code `0xc0000374`, and an invalid/missing
CasADi installation. Later probe, CasADi installation, dependency checks, tests
and geometry results passed. This sequence does not establish an exact cause of
the native crash. Third-party pyparsing deprecation warnings did not fail tests.

[dependency-evidence.json](artifacts/dependency-evidence.json) records installed
package metadata, declared Python/license information and metadata/RECORD/license
file hashes. These are installed-distribution evidence, not signed wheels, an
offline wheelhouse, a legal audit or a guarantee of future download availability.
The fresh-install recipe is documented but was not repeated during this resume.
Existing installed dependencies suffice for offline checks.

## Implementation

The initial edit introduced [gate.mjs](gate.mjs) and a stub discriminator, tested
immediately. Invalid edge ligament, stale inputs, or a failed closed-solid flag
prevent invocation. The positive test invokes only a stub. It proves control flow,
not the truth of claimed geometry facts. Reports are hashes, not signed attestations.

[generate.mjs](generate.mjs) adapts the permitted plate-building source into
[plate.fs](plate.fs). It retains FeatureScript 3070/import 3070.0, creates one left
plate and exposes length, height, thickness, inner width, gap, shaft/mount/pivot
hole diameters and pivot Y/Z. The sixth hole is deliberately not part of the custom
feature. Text/source checks are not FeatureScript compilation. Internal booleans
are not independent native sketches/extrudes.

[oracle.py](oracle.py) and [preflight.mjs](preflight.mjs) executed the real
CadQuery/OCP path: parameter rejection, independent analytic values, solid validity,
closed shells, one-solid count, measured volume/bounds and cylindrical face axes,
radii, positions, axial extent, lateral area and unobstructed bore samples; STEP
reimport and orthographic SVG export; an audit-hook network denial; and bound
source/parameter/dialog/validator/generator/gate/oracle/fixture/reused-source/
sweep/dependency specification/lock/runtime hashes. All 31 states passed, and the
resume audit verified current bindings and retained artifact bytes without
rebuilding the solids. Previews were checked as XML with nonempty geometry paths;
no browser-rendered screenshot evidence is claimed.

[oracle_test.py](oracle_test.py) passed eight methods. Six rejected parameter
variants are negative thickness, an out-of-plate pivot, overlapping bores, inch
units, NaN gap and infinite thickness. Five wrong-solid variants are an unrelated
box, wrong thickness, wrong shaft radius, wrong pivot location and a two-solid
compound. Other checks cover the real STEP round-trip, socket/DNS/subprocess
denial, allowed local hostname lookup and output-path confinement.

The audit hook is installed before CadQuery import and permits the non-network
local `socket.gethostname` lookup while denying other socket events and child
processes. Controllers launch explicit own-venv Python with `-I` and an
OS/path/temp environment allowlist. This is application-level isolation, not an
OS firewall, packet capture or native-code security sandbox. OpenCascade is not
Onshape Parasolid and cannot prove cloud syntax, queries, regeneration, topology
or downstream references. A cloud failure would remain a preflight miss.

[admission.mjs](admission.mjs) separately rejects the observed policy blocker even
with explicit public/live authorization. There is no fabricated Playwright CLI,
no API adapter, and no operational MCP adapter. Future tool use remains conditional
on resolution of the service/tooling restrictions; completed local preflights
alone never authorize browser use.

## Inputs And Bias

The earlier preparation read the required brief, protocol, intake/access documents
and explicitly permitted sibling source. This resume used only trial-owned code,
snapshots, environment and evidence, plus the required Python workflow skill.
No sibling reports, implementations or environments were read or borrowed. All
writes stayed inside this trial; no browser/API calls, secrets, delegation,
commits or root edits occurred during the resume.

The reusable source was read only and snapshotted in this trial. This is reused-input
preflight evidence, **not independent AI generation-quality evidence**.

| SHA-256 input | Hash |
| --- | --- |
| Normative benchmark bytes | `8b0c26084c7176e98c9196c01e89c73ff41bc0443830aee18d1050f5e1dbe392` |
| Reused FeatureScript bytes | `af76352c2d823da717d178e4bcec0923fd7283d41b640272402fd71a89c21968` |
| Generated one-plate source | `042b5676a8f1b6b4faad848ad096daa5acd691f0ed96a192129de588aa12ffbf` |

Per-state exact parameter hashes and adaptation notes are in
[preparation.json](artifacts/preparation.json). File hashes for validators and
dependency specification are in [inventory.json](artifacts/inventory.json).
All 31 PASS preflights bind the exact current dependency lock and runtime.

## Measured Geometry

These are **local OpenCascade B-rep measurements**, independently compared with
analytic expectations and measured again after STEP reimport. They are not
Onshape geometry. Common Y bounds are [0,320] mm, Z bounds [12.7,162.7] mm.

| State | X bounds mm | Volume mm^3 | Rear shaft Y mm | Pivot Y/Z mm | Holes |
| --- | --- | --- | --- | --- | --- |
| A | [-176.35,-170] | 301875.709346763 | 246.2 | 25/130 | 5 |
| B-thickness | [-178,-170] | 380315.854295135 | 246.2 | 25/130 | 5 |
| B-pivot | [-178,-170] | 380315.854295135 | 246.2 | 30/130 | 5 |
| B-width | [-188,-180] | 380315.854295135 | 246.2 | 30/130 | 5 |
| B-revision | [-188,-180] | 380315.854295135 | 241.2 | 30/130 | 5 |
| B-final-six | [-188,-180] | 380215.323330220 | 241.2 | 30/130 | 6 |

A expected volume is 301875.709346764 mm^3; B-final-six is 380215.323330220 mm^3.
Front/rear shaft and pivot radii are 6.45 mm; mount radii are 3.3 mm. The downstream
hole is radius 2 mm at Y/Z=(200,40). The parameter sweep has 24 combinations of
width 340/360, thickness 6.35/8, pivot Y 25/30 and gap 95/97.5/100, plus the exact
benchmark revision. **All 25 passed real kernel and STEP round-trip checks**.
No stronger ligament minimum was assumed: strict positivity and non-overlap only.
Linear tolerance is 0.01 mm; volume tolerance is max(0.1 mm^3, 1e-6 * volume).
These are comparison tolerances, not manufacturing tolerances.

Example retained outputs: [A STEP](artifacts/candidates/A/local.step),
[A preview](artifacts/candidates/A/local-preview.svg),
[A measured report](artifacts/candidates/A/preflight.json),
[final STEP](artifacts/candidates/B-final-six/local.step),
[final preview](artifacts/candidates/B-final-six/local-preview.svg), and
[final measured report](artifacts/candidates/B-final-six/preflight.json).

## Commands And Timing

The saved successful results correspond to these trial-local entry points:

```powershell
node verify-node.mjs
node verify-local.mjs probe
node verify-local.mjs install-casadi
node verify-local.mjs lock
node verify-local.mjs dependencies
node verify-local.mjs tests
node preflight.mjs
node verify-local.mjs evidence
```

These describe recovered work, not commands to repeat blindly or an exact
chronological installation sequence. Do not recreate the environment, reinstall
CasADi or regenerate a successful lock. The saved Node runner prepared source
and ran four test files. It was not rerun in this strict snapshot-only resume.

| Saved execution | Result | Wall time |
| --- | --- | --- |
| Final Node runner, Node v24.15.0 | 15 PASS | 0.505 s |
| Python unittest runner | 8 PASS | 4.982 s |
| Full real-CAD preflight | 31/31 PASS | 120.918 s |
| Preview/dependency/baseline-repeat evidence runner | PASS | 6.023 s |
| Final pip dependency check | PASS | 1.272 s |

This resume executed the existing audit successfully:

```powershell
node "C:\Users\lidor\FRC\onshape-ai\trials\local-preflight-browser\audit.mjs"
```

Observed result: `PASS: 6 candidates + 25 sweep states with current hashes,
15 Node / 8 Python tests, local STEP/previews, browser BLOCKED, zero-live ledger`.
The audit validates all 31 states using current inputs/runtime and artifact bytes.
A before/after verification also checks that the 32 preflight reports, including
the summary, retain identical bytes. Total conversation time and clean-install
repeatability were not measured. See [RUNBOOK.md](RUNBOOK.md) for exact bounded
local resume/reproduction commands. No live locators are claimed.

## Status Preservation

[verify-node.mjs](verify-node.mjs) writes Node results only, never a setup-only
zero-solid replacement for a kernel report. [audit.mjs](audit.mjs) requires
31 successful states and current bindings/artifacts before updating its ledger
and inventory. It does not rewrite preflight reports or this narrative from a
stale zero-solid template. Earlier BLOCKED ledger events remain history; the
current outcome is `FINISHED_LOCAL_BROWSER_BLOCKED`.

## Accounting And Files

[ledger.json](ledger.json) records actual calls/actions and checkpoint status.
Browser calls: **0**. UI actions, including actions inside scripts: **0**.
Active browser time/authentication wait: **0/0 seconds**. Checkpoints started: **0**.
Repair checkpoints: **0 of 1**. New documents: **0 of 1**. Direct Onshape API calls:
**0**. Official MCP calls: **0**. Human interventions for this trial: **0**.

Earlier work requested six public documentation URLs using two `fetch_webpage` tool
invocations; five provided meaningful content and CadQuery classreference extraction
failed. These were unauthenticated documentation reads, not Playwright actions or
Onshape REST API calls. Dependency setup also required package downloads. Those
historical setup requests are not zero-network claims. No web requests or package
installations were made during this resume. No OS-wide network trace was collected
and unrelated concurrent account activity is unknown.

There are **31 local STEP files and 31 local SVG previews** for accepted states,
plus probe/repeat diagnostics. There are no server downloads, browser screenshots,
Onshape part counts, visible UI measurements or document identity. Nothing was
substituted for an Onshape export. The `.venv` and potential `live/` artifacts are
ignored. No PDF/drawing pipeline was added. The file inventory is [FILES.md](FILES.md),
with hashes in [artifacts/inventory.json](artifacts/inventory.json).

## Sources And Limits

- [Onshape terms, section 4(b)(9)](https://www.onshape.com/en/legal/terms-of-use): fetched 2026-09-11; automation restriction blocks this route.
- [API allocation rules](https://onshape-public.github.io/docs/auth/limits/): fetched 2026-09-11; browser exclusion is policy, not an observed counter delta.
- [Feature Studio UI](https://cad.onshape.com/help/Content/FeatureStudio/feature_studios.htm): fetched 2026-09-11; page updated 2026-09-09; normal editor documentation, not tested locators.
- [CadQuery 2.6.1](https://pypi.org/project/cadquery/2.6.1/): installed version, verified from local metadata and execution; replaced the initial uninstalled 2.8.0 plan for Python 3.10 compatibility.
- [CadQuery import/export](https://cadquery.readthedocs.io/en/latest/importexport.html): fetched 2026-09-11; STEP import/export and SVG orthographic options documented.

This local-only run cannot support claims about whole robots, stable downstream
references, native histories, repeated parts, assemblies/mates, purchased items,
BOM, manufacturing drawings/tolerances, motion or build readiness. No numerical
route ranking, speedup, token usage or cost was inferred from local success and
a blocked browser phase.