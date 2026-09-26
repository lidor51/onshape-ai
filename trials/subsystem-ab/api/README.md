# API Arm: V4 Offline Preparation

**Current continuation: [V4-REPORT.md](V4-REPORT.md).** Public-source research and
new V4-only helpers are ready; an authoritative native fixed-state write was NOT
found. No authenticated calls were made. Ledger remains **23/140, 117 remaining**;
old ground `ERROR`, zero saved motion and closed repair remain unchanged.

Safe, read-only command from repository root (Node 24):

```powershell
node --permission --allow-fs-read=./trials/subsystem-ab/api trials/subsystem-ab/api/v4-plan.mjs plan
node --test trials/subsystem-ab/api/v4-native.test.mjs trials/subsystem-ab/api/v4-catalog.test.mjs trials/subsystem-ab/api/v4-plan.test.mjs
```

V4 uses exact original vendor bytes and counted source-body/catalog mappings,
not the old bundle requirement. X44 body and rear cover remain fixed together;
an explicitly approximate output-gear DOF may represent drivetrain motion without
inventing a separate physical motor shaft. No old fixed instance count or 137-call
forecast is carried forward. Full-model upload waits for parent local v4 freeze,
authoritative grounding and a new counted authorization. The V4 CLI has no live
sender and does not reopen the old repair.

## Historical V3 And Bounded Repair

The following is retained historical guidance. Its bundle/separate-shaft contract
and old forecast do not govern the V4 continuation above.

Status: **BLOCKED_NATIVE_PILOT_AND_FROZEN_V3_REQUIRED**. The bounded repair made
four authenticated requests. The current ledger is 23/140, with 117 left.
The same-ID `actualGround` query repair still regenerated with native `ERROR`;
the saved reopened assembly has one ground endpoint, zero moved occurrences and
zero fixed occurrences. Six of the ten repair slots were not used. The repair
entrypoint is closed by its persisted outcome checkpoint; no further live writes.
No v3 packet has been read, admitted or uploaded. See [REPORT.md](REPORT.md) and
the generated [v3-preparation-plan.json](v3-preparation-plan.json).

## Safe Start

Run from the repository root. These commands read only this API folder, do not
import the credential transport, do not load an old/shared packet, and do not
open or mutate Onshape:

```powershell
node trials/subsystem-ab/api/run.mjs plan
node trials/subsystem-ab/api/run.mjs plan --write-plan
node --test trials/subsystem-ab/api/preparation.test.mjs trials/subsystem-ab/api/v3-binding.test.mjs trials/subsystem-ab/api/native-recipes.test.mjs
```

The first command prints a sanitized ledger/evidence summary. The second writes
only the new v3 preparation artifact, never the ledger or historical offline plan.
Do not use a test glob here: legacy tests load packet-v1 or sibling transport code.
Do not invoke the legacy live pilot/source entrypoints during this hold.

After the next parent handoff has placed a frozen binding contract in this API
folder, the following performs a local contract check, **not live admission**:

```powershell
node trials/subsystem-ab/api/run.mjs check-binding --binding=trials/subsystem-ab/api/parent-v3-binding.json
```

Live commands are intentionally rejected before packet or credential loading.
No new document, API allocation query, ledger reset, automatic POST retry, or
old-freeze replacement is available through this CLI.

## Executable Architecture

- [run.mjs](run.mjs): offline plan/check-binding CLI and production hold.
- [pilot-repair.mjs](pilot-repair.mjs): closed bounded repair, prefix-preserving authorization, same-ID update and saved failure outcome. The rejected candidate is not a proven ground recipe.
- [preparation.mjs](preparation.mjs): sanitized saved-pilot evidence, partial native recipe and current gates.
- [budget.mjs](budget.mjs): complete phase/operation ceilings, translation polls, pilot/recovery reserves and three exports.
- [graph.mjs](graph.mjs): source-frame transforms and fastened-component compression that cannot cross a revolute.
- [native.mjs](native.mjs): documented bulk insertion, lossless source-body binding, native group candidate and ordered relation references.
- [workflow.mjs](workflow.mjs): retained legacy workflow plus guarded `importV3Cots`, one import per preserved source group and at most two polls.
- [v3-binding.mjs](v3-binding.mjs): proposed-only freeze migration, complete source-body coverage, X44 housing/rear-cover preservation and separate output shaft, typed geometry decoding and native assembly/revision parity.

The cost rows are operation budgets, not a blind sequential sender. In particular,
execute each import with its own bounded polls/readback, and each motion write
with its immediate reopen. Baseline export must finish before width revision;
revision export before receiver probing; restore and final health before final STEP.
Original downloaded bytes and checksums must be retained for all three exports.

This is executable offline preparation and reusable native helpers, not a completed
v3 live executor. The legacy source/assembly workflow is not v3-wired: production
element selection, the frozen COTS-datum feature, evaluator receipts, native group
admission, full motion/relations checks and final-export orchestration must be
bound at the next handoff. It must not be used to bypass the CLI hold.

## Exact Shared Contract

Supply a frozen `subsystem-ab-api-v3-binding/1` contract matching
`validateBindingContract`. Do not silently retain the old 45-instance contract.

- Identity: `packetVersion` = `v3` or `packet-v3`, new `freezeSha256`, `sourceSha256`, `evaluatorSha256`, exact owned `origin`, `did`, `wid`.
- `parts[role]`: stable `nativeName`, `sourceGroup`, and `geometry[variant]` containing `volumeMm3` and `boundsMm` = `[minX,minY,minZ,maxX,maxY,maxZ]` in source coordinates.
- `sourceGroups`: unique `id`, `kind` (`generated` or `authentic`), and complete `partRoles`. The budget assumes one generated source Part Studio.
- Each authentic group: frozen `importFile`, `importSha256`, `units`; `originals[{sha256,solidCount}]`; and `preservation[{partRole,originalSha256,bodyIndex,sourceToBundleRowMajorMm}]`. Body indices are one-based provenance indices, not guessed Onshape IDs.
- Preserve all original bytes and hash-linked source identities. A bundled or split file needs a lossless mapping for every original solid. The authentic X44's two solids are housing/body and rear cover, not housing and rotating shaft. Preserve both across any split; no discarded cover or artificial one-solid claim. This correction is supplied by the parent/user, not a new inspection of sibling COTS files.
- `instances[{id,part,transformsSI}]`: all actual native instances, including housing, rear cover and a separately modeled or sourced output shaft; full row-major 4x4 matrices for each control variant.
- `joints`: a chassis-rooted tree of FASTENED/REVOLUTE edges. Each X44 `motorBindings` entry names `housingInstance`, `rearCoverInstance`, `rearCoverMate` (housing-parent/cover-child FASTENED), `shaftInstance`, and `revoluteMate` (housing-parent/shaft-child REVOLUTE). The imported rear cover must never stand in for a shaft.
- `shaftProvenance`: `GENERATED_SEPARATE_OUTPUT` for a generated output shaft, or `AUTHENTIC_SEPARATE_OUTPUT` backed by a separate authenticated source hash. Generated output geometry is not vendor geometry; the new freeze must define its dimensions, interfaces and physical support. Output hardware follows the shaft; mounting hardware and rear cover follow the housing.
- `relations`: actual driver/driven revolute IDs, signed `outputPerInput`, native relation type and moving `carrier` when relevant. `motionScenarios` must enumerate complete bounds, direction, carrier, independence and restored-state expectations before live admission; array length alone is not motion proof.
- `nativeGroupsAuthorized: true` is required for the compressed budget. Logical fastened edges remain traceable to their native group. No revolute may lie inside a group.

Variants are `baseline`, `revision`, and `receiverControlProbe`. Expose
`mouthWidth` and `receiverHeight`; the agreed revision is width +20 mm with receiver
height unchanged. Specify the receiver probe independently and restore the revision
state before final STEP. The next parent admission must bind all control values,
ranges, sampled poses and evidence hashes to the new freeze.

### Source Connector Specification

Provide exactly one logical connector record for each `jointId:parent` and
`jointId:child`, plus `ground:chassis`: `2*(N-1)+1` keys, **95 at N=48**.
Identical logical datums may share a native connector only if owner and all frames
match; the logical coverage record must remain complete.

Each record has `key`, owning `partRole`, stable `featureIdSuffix`, and
`framesSI[variant]`. Frames are right-handed row-major 4x4 transforms in the actual
source Part Studio coordinate system, with translations in meters. Include full
X/Y/Z directions, not only a point/axis. The world frame computed from each mate
side must coincide at every specified variant. Include source-layout and bundle
transforms; never apply a guessed imported-origin offset.

Emit generated-part datums parametrically in the original source feature, owned
by their actual solid bodies, using stable role-based feature IDs. Their locations
must regenerate with width/receiver changes without per-connector REST updates.

For authentic imports, supply a frozen `conceptACotsDatums` feature in the same
source Feature Studio. One invocation per imported Part Studio must create every
needed connector owned by the actual imported bodies. Expose one body-query input
per stable source role, named by that role; include both housing and rear-cover queries.
Own the separate output-shaft datums on their actual generated or separately
imported shaft solid, never on the rear cover.
The API must bind query encodings/namespace from returned feature specs and observed
native IDs, not inferred face numbers or a connector on an unrelated custom part.
This entrypoint and query binding still require compilation/native verification.

### Geometry Readback Contract

The frozen evaluator must emit a native typed map:
`{schema: "subsystem-ab-api-source-geometry/1", units: "mm", variant, bodies}`.
Each body contains its **actual queried native `partId`**, `volumeMm3`, and six
`boundsMm` numbers. Convert units explicitly before returning numeric values.
No hardcoded expected dimensions or fabricated part IDs are valid measurements.

The future sender must append `v3-source-readback:<geometryKey>` receipts containing
`evaluatorSha256`, `partsKey`, `documentId`, `elementId`, and the actual API envelope's
`sourceMicroversion`. The hash belongs in the receipt, not a self-hashing script.

`validateNativeReadback` accepts ledger keys for actual `getPartsWMVE`,
`evalFeatureScript`, and `getAssemblyDefinition` responses. It requires exact solid
coverage, unique source IDs, volume tolerance 1e-5 relative, bounds tolerance
0.02 mm, matching assembly source microversions, observed body-owned connectors,
native occurrence transforms, and unchanged IDs/connectors after revision.
Fresh evaluations for every source group are budgeted for baseline, width revision,
receiver probe and restore. API metadata compatibility remains a live validation gate.

## Budget And Resume

The conditional forecast is still **137 cumulative**, now including 23 already
spent and six remaining pilot slots (four debited from the original ten), five
recovery slots, all import/export polls, and baseline,
revision and final STEP downloads. Three unallocated attempts remain. Counts are
planning inputs only: 48 instances, 12 revolutes, 5 relations, up to 13 rigid groups,
one authentic preserved bundle and eight motion scenarios.

These six unused slots are accounting headroom, not a reopened repair authorization.
Resetting the pilot reserve to ten at 23 spent would project **141**, above 140.
The corrected housing/cover/separate-shaft graph may change the counts and costs;
reforecast from frozen v3. Ground, groups and relations remain unproven. Do not
reduce acceptance coverage or source-solid preservation to make the budget fit.

Individual fastened mates cost 159 with one bundle. Five separate import groups
plus individual mates cost 199. The grouped route with two import groups costs
147, so an explicit WCP split is preservable but not automatically budget-admitted.
Recompute from the real frozen graph; no 45-instance cap or hidden rename pass.

Keep the original ledger binding. `freezeMigration` only proposes an append-only
record with original binding, new freeze hash, prefix sequence and prefix hash.
At handoff, add parent authorization/hash and append that migration; do not replace
old provenance. Open the ledger under its original binding, then verify the separate
active migration. Pending or unknown POST outcomes stop progression, never trigger
resubmission. Debit any pilot/reserve spending explicitly from the same 140 total.