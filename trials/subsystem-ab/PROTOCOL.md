# Subsystem A/B Execution Protocol

Authorized 2026-09-12: the user requests phase-by-phase completion, including API
versus Playwright, without further design guidance. This supersedes the previous
research-only and unapproved-pilot boundary for this experiment. It does not
authorize bypassing platform restrictions, credentials disclosure or fabrication.

## Shared Task

Use the researched Concept A in
[the decision packet](../../research/2025-coral/CONCEPT-DECISION.md): deployable
coral pickup, fixed orientation/holding stage, and a rough receiver on a blank
chassis. Preserve [team/shop preferences](../../docs/TEAM-PROFILE.md). Engineer
unknowns conservatively and label assumptions. Do not claim prototype performance
from geometry, or call placeholder vendor geometry an authentic COTS model.

First freeze a shared local packet with geometry, reference frames, native assembly
connections, movement limits, parts/provenance, baseline/revision checks and source
hashes. Native assembly behavior must not be replaced by a STEP assembly or static
parts positioned to resemble joints. Generated custom parts may use FeatureScript;
expose the important parameters and describe what is not independently editable.

Two separate GPT-6 Astra agents execute API and browser arms against independent
trial-owned copies of the same packet. No intermediate sibling solutions; common
inputs and upstream design results are shared. Reasoning effort is not configurable.
The parent integrates evidence. This is exploratory paired evidence, not a reliable
statistical success-rate estimate.

## Budget And Safety

- **150 attempted authenticated Onshape requests total** for this new experiment,
  including shared setup, API modeling, COTS queries/import, inspection, exports,
  retries, and uncertain outcomes. Persistent ledger; process restart never resets it.
- Allocate 140 direct requests to the API arm including all its setup and validation;
  reserve 10 for shared account checks/overhead. Do not transfer unused budget from
  earlier trials or between accounts. An opaque MCP call cannot be assumed to be
  one REST request; prefer counted direct calls for this experiment's accounting.
- Verify current annual allowance before live CAD, retain a 500-call reserve, and
  stop on authorization, quota or an unresolved ambiguous mutation. No blind retries.
- Browser arm: **zero direct API calls**, no API MCP fallback, browser request
  client, injected fetch/XHR, session replay or hidden application methods. Normal
  UI traffic is separate from counted API usage; record policy versus observed
  quota evidence rather than claiming zero network traffic.
- Browser budget: first admission/pilot at most 60 tool invocations/15 active minutes;
  if passed, at most two assembly checkpoints, each 60 invocations/15 active minutes,
  plus one repaired checkpoint shared across the whole arm. Count individual UI
  actions inside scripted calls; no unbounded loops or repeated refreshes.
- At most one new public document per execution arm; a copy/import destination
  counts as creation. Reuse only documents this experiment created and recorded.
  No changes to the user's previous robot or PoC models, sharing or deletion.
- Runtime-only `.env.local` use is already explicitly authorized by the user,
  without asserting rotation. Never read it with editor tools or print/store values,
  signed headers, cookies or secret-bearing errors. Public-source research receives
  no credentials. Exact authorized HTTPS Onshape stack only; block unsafe redirects.
- Confirm downloaded assets' intended use and source identity; no public-CAD crawl,
  automatic macro execution, paid purchase, dependency elevation or account sharing.

## Completion Gates

1. Local solids/placements and stow/deploy/intermediate checks, with analytic
   versus sampled versus unverified clearances distinguished. Wrong-source/unsafe
   parameter inputs must fail before invoking a live sender.
2. Actual named native assembly instances, fixed/rotating joints, allowed motion
   and limits, retained identity and health after a bounded revision.
3. Real selected COTS references and interface provenance. Missing manufacturer
   geometry or incomplete gearbox/wiring/support details remain explicit gaps.
4. Same-packet baseline/revision checks and actual exports; original downloaded
   bytes retained. Local preflight exports are never relabeled Onshape exports.
5. Named human-editable controls; automated UI evidence, API edit simulation and
   human usability are separate results. No human observation invented.
6. Per-phase attempts, success/failure/recovery, wall time and interventions.
   Shared preparation reported separately. A blocked browser arm has no measured
   relative speed or success rate; do not rank it from missing observations.
7. Reports and tangible outputs for every executed phase; PASS, FAIL, BLOCKED or
   UNVERIFIED for every gate. Physical acquisition, endurance and manufacturing
   release remain unverified until real tests/review occur.

Proceed independently within these bounds. Stop only at a concrete gate and record
what would resolve it; never silently simplify away a requirement to report success.

## V4 Corrective Continuation (2026-09-13)

The user accepts the direct-original-COTS approach and requests finalizing the
mechanism locally, then in Onshape. Create a new v4 engineering packet; retain
v1/v2/v3 and their failed checks unchanged. Prioritize the contact, handoff and
physical-attachment findings in [the design review](shared/DESIGN-REVIEW.md), not
rendering polish or an unneeded STEP conversion. This remains Concept A, not a
new full-robot scope. No further user design guidance is required for provisional
CAD decisions; unresolved material/load/contact assumptions must stay explicit.

For v4 only, preserve original vendor files and hash-bound source-body mappings;
store rigid placements and connectors separately. Directly import the original
files into Onshape. Do not bundle them by re-export through OCCT or discard vendor
solids. Validate original local solids, mounting/shaft interfaces, assembly poses
and destination source geometry independently. An OCCT round-trip of a vendor
file is a diagnostic, not an obligatory operation in this revised pipeline.
Do not claim that this change fixes prior round-trip failures or validates unseen
Onshape imports. Generated custom geometry still requires local solid/export
checks and later cloud readback.

Local v4 CAD acceptance requires explicit pickup/opposing contact and controlled
transfer geometry, cradle retention and receiver clearance, realizable mounting/
shaft-retention/load paths, an itemized BOM, baseline/revision parameter checks,
stow/deploy/intermediate checks and stated limitations. CAD completion does not
claim measured friction, physical acquisition, impact/thermal capacity, endurance,
or manufacturing approval. Those need documented physical tests and review.

The cumulative budget remains 150 attempts total, 140 API plus 10 overhead; the
API ledger already contains 23 attempts. Keep its original provenance and append
any v4 binding migration. Reforecast using the real v4 graph and original-file
imports, not old instance counts or a reset repair reserve. The earlier pilot
repair remains closed history; a new evidence-grounded, bounded pilot correction
may be authorized within the remaining ledger before v4 live assembly. Browser
policy/access restrictions, no deletion/sharing and trial-document ownership are
unchanged. Prefer a single viable Onshape route over repeating failed encodings.