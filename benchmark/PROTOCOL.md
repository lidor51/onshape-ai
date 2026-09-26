# Independent workflow trial

Use `intake.json` as the common task. Units and coordinates are normative. Plates
occupy x = [-width/2-thickness, -width/2] and [width/2, width/2+thickness]. Rollers
and coral run along x and are centered on x = 0. The rear roller's y coordinate is
frontRollerYMm + rollerDiameterMm + rollerGapMm. The gap is surface-to-surface.
Shafts extend shaftEndExtensionMm beyond each outside plate face. Crossmembers
span the inner width. Coral is a staged reference, not a motion/contact simulation.

Three separate GPT-6 Astra subagents implement native REST features, a reusable
FeatureScript, and an existing MCP workflow. The user accepted this available
model name. The agent tool cannot set or verify extra-high reasoning. Independence
means separate contexts and output directories; it is not statistical blinding.
Agents must not read sibling trial outputs or a recommendation before reporting.
One trial per route is exploratory evidence, not a statistically reliable ranking.

Each agent has the same task and must report:

1. A falsifiable hypothesis and a cheap focused test, followed by implementation.
2. Executable/source outputs under its assigned `trials/<route>/` directory only.
3. Baseline and revision artifacts; no speculative endpoint/tool success claims.
4. Exact fetched official/GitHub sources, project revision/license when relevant.
5. Commands run, tests, failure evidence, and what remains unverified.
6. Risks for whole robots: persistent references, editable features, repeated
   parts, assemblies/mates, purchased components, BOM, rate limits, recovery.

No Playwright modeling/navigation workflows except the narrowly scoped checkpoint
trial below. Other trials may use Playwright only to obtain verification
screenshots if an API image is unavailable. No credentials may be
read with editor tools, printed, copied into artifacts, or sent to public services.
Do not run live operations until access is confirmed. No deletion or mutations
to pre-existing documents. Do not auto-fallback from private to public documents.

## Authorized Live Scope Update (2026-09-11)

After both private-document attempts returned HTTP 409 (Free account entitlement),
the user explicitly authorized NEW PUBLIC documents containing only this synthetic
intake. This supersedes private-only creation for subsequent trials, not the ban
on automatic fallback. Require an explicit public-document flag, positively verify
the returned visibility, and retain each run's document identity. Never publish
existing documents, upload existing robot data, change sharing, or delete anything.
The user asked to prefer an official Onshape MCP if verifiably available, otherwise
choose another suitable public project. Do not describe a community server as official.

## Local-First Browser Exception (2026-09-11)

The user requested local validation before spending API calls and a Playwright MCP
submission/check workflow, not continuous browser CAD. The new
[local-preflight-browser trial](../trials/local-preflight-browser/README.md) may use
the normal Onshape UI to submit a locally validated candidate, regenerate, inspect,
exercise the specified parameter-edit check, and download verification geometry.
No other trial gains a browser-modeling fallback from this exception.

### End-to-End Subsystem Pilot Authorization (2026-09-12)

The user subsequently authorized completion of a paired API-versus-Playwright
subsystem pilot without further guidance. The new
[subsystem A/B protocol](../trials/subsystem-ab/PROTOCOL.md) extends normal-UI
assembly work to its browser arm and approves the shared 150-attempt budget.
All identity, credential, no-deletion, public synthetic-data and platform-admission
boundaries remain. Earlier trial budgets and historical outcomes are unchanged.

Keep generation and repair local. Allow two planned candidate checkpoints and at
most one repaired submission, in one newly created synthetic trial document. No
direct REST/OAuth/API Explorer calls, injected network requests, hidden application
APIs, session-token reuse, or access-control workarounds. Login/MFA stays with the
user; do not inspect cookies or persist authentication in artifacts. Live browser
work still requires execution authorization and a confirmed session/visibility.
The public-document scope above applies; never upload unrelated robot geometry.

To avoid duplicating a modeling trial, this follow-up may read only an explicitly
supplied fixture or `trials/featurescript/intake.fs` as reusable source input. Record
its hash and necessary adaptations. Do not read sibling reports/results or claim
this reused-input experiment is independent generation evidence. Local OpenCascade
checks are preflight, not an Onshape compiler or a guarantee of matching topology.

Prefer Node 24 built-ins for local runners/tests when practical. Any live runner
must require an explicit flag and record actual, sanitized observations. A source
file, offline preview, synthetic measurement, or mock protocol result is not
evidence that Onshape compiled or created geometry. An unsupported capability is
a result worth reporting, not a reason to silently switch modeling routes.

Compare task completion and revision correctness first. Record wall time, network
requests/retries, interventions, feature/part count, export success, and source
editability only when observed. Do not invent token usage, costs, speedups, or a
numerical score for blocked trials. A rendered image alone cannot prove geometry.