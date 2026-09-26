# Local Preflight Runbook

## Current State And Scope

**LOCAL CAD PASS; BROWSER ADMISSION BLOCKED.** Six candidate states and 25 sweep
states already have real B-rep PASS reports, measured STEP round-trips and local
orthographic previews. Recorded tests: 15 Node and 8 Python PASS. Do not restart
that successful work because an earlier narrative said zero solids.

Stay within `C:\Users\lidor\FRC\onshape-ai\trials\local-preflight-browser`.
No browser, Onshape API/MCP, secrets, sibling environment, delegation, commits or
root configuration edits. Existing snapshots suffice for the normal resume and
complete CAD recheck paths below. Admission remains BLOCKED under the recorded
Terms of Use section 4(b)(9) restriction in [policy.json](policy.json), regardless
of local results. Do not check login, inspect counters or invoke a browser to
resolve a local failure. No observed login/MFA blocker is claimed.

## Resume Without Rebuilding

Node v24.15.0 was observed; there are no npm dependencies.

```powershell
Set-Location "C:\Users\lidor\FRC\onshape-ai\trials\local-preflight-browser"
node .\audit.mjs
```

Expected: six candidates plus 25 sweep states PASS with current runtime/input/
artifact hashes, 15 Node / 8 Python tests, local STEP/previews, browser BLOCKED
and a zero-live ledger. This command executed successfully during the resume.
It starts only the trial's own Python for runtime inventory, not a CAD rebuild.
It refreshes the local ledger, inventory and [FILES.md](FILES.md); it never
replaces successful kernel reports or [REPORT.md](REPORT.md) with a stale
zero-solid report. A before/after check verified identical hashes for all 32
preflight reports, including the summary, across the audit.

Inspect [the summary](artifacts/preflight-summary.json),
[Python tests](artifacts/python-tests.json),
[dependency evidence](artifacts/dependency-evidence.json) and
[the report](REPORT.md) for saved results. All 31 STEP/preview pairs and hashes
are in [ledger.json](ledger.json). Probe/repeat outputs are additional diagnostics.

## Explicit Local Python

The verified executable is this trial's `.venv\Scripts\python.exe`, base prefix
`C:\Python310`, Python 3.10.0, 64-bit Windows; system-site packages are disabled.
The editor's selected interpreter was not inspected or borrowed. The absent
deferred tool loader does not prevent using this explicit executable through
the terminal. Do not substitute a sibling venv or PATH Python.
[oracle.py](oracle.py) rejects a runtime prefix outside its own `.venv`.

The existing [requirements.lock](requirements.lock) matches all 42 installed
distributions, including CadQuery 2.6.1, cadquery-ocp 7.8.1.1.post1 and CasADi
3.7.2. The initial uninstalled CadQuery 2.8.0 plan was replaced transparently for
Python 3.10 compatibility. No dependency reinstall is needed.

Optional bounded checks, only when a relevant result needs refreshing:

```powershell
& .\.venv\Scripts\python.exe -I .\oracle.py runtime
node .\verify-local.mjs dependencies
node .\verify-local.mjs tests
```

`runtime` verifies the installed lock and own-venv prefix. The wrappers preserve
stdout, stderr, exit status and wall time in timestamped execution JSON and
update the corresponding latest result. Their process timeout is 180 seconds.
`dependencies` runs isolated pip check, not an installation or update. The saved
results already pass; do not run checks just to replace those records. Terminal
execution does not establish Pylance/editor diagnostics or selected-env state.

## Intentional CAD Recheck

Only after a relevant input, validator or dependency change, use the prepared
trial-owned snapshots and candidates:

```powershell
node .\preflight.mjs
node .\verify-local.mjs evidence
node .\audit.mjs
```

`preflight.mjs` runs six candidates plus 25 sweep entries, exports/reimports each
STEP and writes each SVG and measured report. The observed complete run took
120.918 seconds. Each Python subprocess has a 120-second timeout; this is a
finite 31-state run, not an unbounded repair loop. Failed checks stay local.
Inspect the specific local error rather than invoking Onshape.

`evidence` verifies preview XML dimensions/paths, records installed dependency
metadata and rebuilds the baseline once. The saved baseline bounds, volume,
bores and SVG hash match; STEP bytes can differ due to export timestamps.
It does not repeat the full sweep. `audit` then checks the complete current set
before refreshing the ledger and inventory. These commands use only this trial's
files and own environment, not sibling implementations.

The Python audit hook runs before CAD import, denies sockets/DNS/child processes
and permits only the local `socket.gethostname` event. Node launches isolated
Python with an OS/path/temp environment allowlist. This is not an OS firewall
or a guarantee about all possible native library network behavior. No network
or credentials are needed for these checks after dependency installation.

## Fresh Environment Recipe

This is a reproducibility recipe, **not a clean reinstall executed in this
resume**. Never delete or recreate the working `.venv`. On a fresh trial checkout
without a venv, use the verified base interpreter explicitly. Installation needs
package-index access or separately prepared local wheels, not Onshape access.

```powershell
Set-Location "C:\Users\lidor\FRC\onshape-ai\trials\local-preflight-browser"
if (Test-Path .\.venv) { throw "Existing environment: use the resume audit instead" }
& C:\Python310\python.exe -I -m venv .venv
if ($LASTEXITCODE -ne 0) { throw "Own-venv creation failed" }
& .\.venv\Scripts\python.exe -I -m pip --isolated --disable-pip-version-check install --no-input --no-cache-dir --progress-bar off --only-binary=:all: --index-url https://pypi.org/simple -r .\requirements.lock
if ($LASTEXITCODE -ne 0) { throw "Locked dependency installation failed" }
& .\.venv\Scripts\python.exe -I -m pip --isolated --disable-pip-version-check check
if ($LASTEXITCODE -ne 0) { throw "Dependency check failed" }
& .\.venv\Scripts\python.exe -I .\oracle.py runtime
if ($LASTEXITCODE -ne 0) { throw "Runtime differs from the recorded lock" }
```

Use the supplied exact lock, not a new resolution from just
[requirements.txt](requirements.txt). It includes pip/setuptools and is specific
to the recorded Windows/Python runtime. Pins are not wheel integrity signatures;
no wheelhouse or future index availability is guaranteed. Do not silently change
Python or dependencies: record any compatible change and rerun affected tests
and full preflight, because the bound runtime hash will change.

`oracle.py lock` was used once to record the working inventory and refuses to
overwrite the existing lock. It is not a normal resume command. The legacy
`install-casadi` mode records the earlier targeted installation; it is unnecessary
when installing the full lock or resuming the existing environment.

## Preparation And Status Safety

The saved Node run was `node verify-node.mjs`; it generated source/candidates and
ran gate, generator, admission and artifact tests. That preparation and the full
generator test read the original repository benchmark plus the explicitly allowed
`trials/featurescript/intake.fs`. Neither was rerun in this strict snapshot-only
resume. Do not regenerate healthy inputs unnecessarily. Snapshots retain their
original hashes in [preparation.json](artifacts/preparation.json).

`verify-node.mjs` never executes Python or writes CAD summaries/preflight reports.
Its `geometry.status` is `NOT_RUN`, with a separate prior-recorded status; Node
PASS is not new geometry evidence. Changed inputs must still pass `audit.mjs`,
which rechecks source/parameter/dialog/validator/generator/gate/oracle/fixture/
reused-input/sweep/dependency-specification/lock/runtime bindings and retained
STEP/preview bytes for every state. Hashes prevent accidental stale use, not
forged evidence by an adversarial writer.

The original two-checkpoint browser proposal remains in [README.md](README.md)
only as an unexecuted broader acceptance criterion. There is no live execution
step in this runbook. Cloud compilation, real dialog edits, native downstream
feature editing, server exports, quota change and human usability remain
BLOCKED or UNVERIFIED. All retained STEP and SVG outputs are **local CadQuery**
artifacts, never Onshape downloads or screenshots.