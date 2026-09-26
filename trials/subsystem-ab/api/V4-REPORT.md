# V4 API Corrective Preparation

Date: 2026-09-13. **Offline/public research and code complete; native grounding
write NOT established. No live pilot or production upload authorized by this artifact.**

## State Preserved

Authenticated calls this invocation: **0**. Ledger remains **23/140, 117 remaining**.
The original freeze binding, all 23 receipts, prior repair closure and historical
[REPORT.md](REPORT.md) are unchanged. The 23-attempt serialized prefix SHA-256 is
`a4d100c6f3c983770fbdf0f1c6f00e81fb02ebb0a15e0573307f01220083e8ea`.

Retained target: document `c88349fc8bd39b3e6d811b19`, workspace
`2cb07fb6d6b08930d5b0cf8f`, assembly `58b7e117163e0ec8a6100e66`.
Saved request 23 still shows zero fixed occurrences, zero rotation, and the old
ground feature `MHVWwSC5EjXoRtyJV` has last feature status `ERROR`. Limits are
configured, not proven. These are saved observations, not a fresh cloud read.
Current visibility, permissions, quota, feature health and motion were not queried.

Only this API folder was edited. No credential file, browser, authenticated MCP,
new document, deletion, sharing, commit, delegate, sibling trial implementation,
original vendor geometry or parent v4 geometry was used or modified. Public
Jarvis source was read, not executed. The parent's local design remains its own lane.

## Authoritative Payload Finding

**There is no authoritative ground payload example to return from this research.**
The exact current public contract disproves the suggested `/modify` flags:

- Public source: [Onshape OpenAPI](https://cad.onshape.com/api/openapi), version
  `1.220.87929-d54ca734df42`, anonymously checked again on this date.
- Operation ID: `modify`, not `modifyAssembly`.
- Endpoint: `POST /api/v17/assemblies/d/{did}/w/{wid}/e/{eid}/modify`.
- Request reference: `#/components/schemas/BTAssemblyModificationParams`.
- Fields: `deleteInstances`, `editDescription`, `suppressInstances`,
  `suppressionStates`, `transformDefinitions`, `unsuppressInstances`.
- `fixInstances`, `fixedInstances`, `isFixed` and `fixed` are not fields of that
  request. Local tests reject each. `BTOccurrenceData-75.isFixed` and
  `BTAssemblyOccurrenceInfo.fixed` do not establish a public setter.

The [official assembly guide](https://onshape-public.github.io/docs/api-adv/assemblies/)
documents modifications and transforms but no fixed-instance setter. The public
[Jarvis assembly manager](https://github.com/ReshefElisha/jarvis-onshape-mcp/blob/b0e725852280ebcfda5d46a4f2ed2d0b720beace/onshape_mcp/api/assemblies.py),
[server tools](https://github.com/ReshefElisha/jarvis-onshape-mcp/blob/b0e725852280ebcfda5d46a4f2ed2d0b720beace/onshape_mcp/server.py)
and [workflow guide](https://github.com/ReshefElisha/jarvis-onshape-mcp/blob/b0e725852280ebcfda5d46a4f2ed2d0b720beace/knowledge_base/assembly_workflow_guide.md)
at commit `b0e725852280ebcfda5d46a4f2ed2d0b720beace` provide no setter. The guide's
first-inserted-instance assumption does not match our saved bulk-insertion result.
Its UI unfix/re-fix advice is not an API repair and is not executed or proposed as
a covert browser fallback. Search restrictions and exact references are retained
in [v4-public-research.json](v4-public-research.json).

This establishes a specific public-contract gap, not universal impossibility.
The missing evidence is an Onshape-supported request/endpoint or an explicitly
authorized, observed native fixed-instance write with its exact request and
successful saved readback. An HTTP 200 alone is insufficient. Do not resume the
closed `actualGround` repair, synthesize an empty root connector, use an unlisted
flag, create a replacement assembly, or invoke a hidden browser method.

## Supported Local Work

[v4-native.mjs](v4-native.mjs) prepares the existing `updateFeature` suppression
request for the same failed ID. It preserves the mate definition, sets
`suppressed: true`, omits only the response's optional null `suppressionState`,
and rejects stale microversions. The full request passes the cached official
schema locally. Suppression has NOT been executed. It does not itself fix the base.

The reopened checker requires the base fixed, arm unfixed, preserved instance/
part IDs and pivot frames, unchanged limits, and the old failed feature present
and suppressed. Historical failure count remains one; suppression does not erase
history or turn its prior `ERROR` into `OK`. Feature-health acceptance requires a
fresh feature-state response separately; pose acceptance says `PASS_POSE_ONLY`.

Motion uses `updateMateValues` and the observed `jsonType: Revolute` codec:

```json
{
  "mateValues": [{
    "jsonType": "Revolute",
    "ownerOccurrencePath": [],
    "mateName": "PROVISIONAL limited revolute",
    "featureId": "MnOxhkG9xBvNei93d",
    "rotationZ": 0.5235987755982988
  }]
}
```

This is the **interior motion example, not grounding**. The public base mate-value
schema documents radians and first-connector-relative-to-second direction, but
omits the concrete `rotationZ` subtype. The existing observed-codec validator
validates the base against schema and the extension against saved native evidence;
it is not represented as full polymorphic schema or successful live motion proof.
For this base-first/arm-second pilot, positive mate angle means negative arm-world
Z rotation. Checks derive angle from both source connector frames and absolute
occurrence transforms; they reject an unchanged arm, drifting base, wrong sign,
off-pivot translation, altered source frames and HTTP-only success.

Interior +30 degrees, outside-upper +90 degrees, outside-lower -90 degrees and
restore 0 are separate scenarios. The limits are -30/+60 degrees. Upper/lower
checks accept an observed bound only when the returned value agrees with the
reopened transform. Clamping is a test expectation, not claimed API behavior.
An unchanged/ignored out-of-range command proves nothing. Explicit native limit
rejection needs its own error and unchanged-readback evidence; it is not a pass
in the current checker. Do not switch to absolute transforms just to force a
passing pose: placement changes are not native DOF or limit-enforcement proof.

Moving-carrier planning is supported without waiting for full native hierarchy
proof. The local relation checker uses signed, unwrapped, common-axis increments:
`drivenDelta - carrierDelta = outputPerInput * (driverDelta - carrierDelta)`.
It rejects zero-motion and wrong-sign fixtures. Full native relation health,
proper projected coordinate frames, independent DOFs and carrier-following remain
separate live gates; no undocumented carrier parameter is inserted into a mate.

## Conditional Pilot Cost

No live entrypoint is exposed while grounding authority is missing. After the
parent's v4 local PASS and new explicit authorization, a one-write direct-ground
route would permit this **conditional six-request interior pilot**:

| Slot | Operation | Gate |
| --- | --- | --- |
| 1 | `getDocument` | Exact owned public document; current write permission; stop on read-only/access/quota errors |
| 2 | `updateFeature` | Suppress only old failed mate, same ID, strict saved microversion |
| 3 | Not established | Supported direct base fixed-state write; no invented payload |
| 4 | `getAssemblyDefinition` | Include mate features/connectors and `excludeSuppressed=false`; require fixed base and retained suppressed failure |
| 5 | `updateMateValues` | Interior +30-degree request only |
| 6 | `getAssemblyDefinition` | Reopened nonzero relative rotation, fixed unchanged base, values match transforms |

Slots 2 and 3 are separate: no documented fixed-state-plus-feature-suppression
batch was found. The saved source microversion is stale-sensitive; a mismatch
stops, rather than silently refreshing/retrying. A needed fresh snapshot consumes
another slot and requires reforecast/authorization. The first bounded pilot's
ceiling is 29 cumulative, not a new six slots after every restart.

Both outside-limit command/reopen pairs plus restore require **six more requests**;
fresh feature health adds at least **one**. Relations/groups need their own counted
evidence. Six requests cannot honestly cover ground, real movement, both limits,
restore and full health. Nothing in this proposal consumes or reopens the old grant.

## Direct Original Catalog

[v4-catalog.mjs](v4-catalog.mjs) is independent of old v1/v3 packet loaders and
contains no geometry generator. The parent supplies `subsystem-ab-api-v4-catalog/1`:

- `packetVersion: v4`, `freezeSha256`, `rootInstance` and actual `instances`,
  `joints`, `relations`; counts are derived, never forced to 45/48/52.
- `sourceGroups`: unique `id`, `kind: ORIGINAL_VENDOR | GENERATED_CUSTOM`, and
  `bodies[{index, role, function, volumeMm3, boundsMm}]`. Original groups include
  `importMode: ORIGINAL_BYTES`, `filename`, `units`, `solidCount`, and identical
  `originalSha256`/`importSha256`. Body indices are complete and one-based.
- `componentCatalog[{id, sourceGroup, quantity, occurrences}]`; each occurrence
  has `id` and `bodyInstances` mapping every source role to its actual instance.
  Each native instance must be counted exactly once. Catalog-unit quantity and
  source-solid/native-instance count are reported separately.
- Each instance has `part` and row-major `transformsSI` for `baseline`, `revision`
  and `receiverControlProbe`. Placements/connectors stay separate from original
  bytes. Generated custom sources and source-owned datums remain parent-provided.
- X44 groups declare `model: KRAKEN_X44` and both `VENDOR_BODY`/`REAR_COVER`
  bodies. `motorPresentations` declares every X44 catalog occurrence with
  `vendorPresentation: STATIC_NONSEPARABLE_VENDOR_GEOMETRY`; both bodies must
  belong to one rigid group. No imported cover may rotate as a shaft.
- Optional `outputReference` is explicitly `OUTPUT_GEAR_DOF_APPROXIMATION`, with
  an existing output-gear instance/revolute ID and `claimsVendorRotor: false`.
  No physical motor shaft is generated, requested or inferred by this adapter.

`originalImport` accepts a supplied Buffer only when its hash equals the original
vendor hash; the multipart file field is those exact bytes. No OCCT re-export,
bundle, generated replacement, re-download or original file read occurs here.
One import group is reused for identical original hashes. Translation/readback
must still demonstrate all solids survived in the destination.

`bindOriginalReadback` checks all destination part IDs, source microversion,
solid count, original hash, volume (1e-5 relative) and source bounds (0.02 mm).
It refuses ambiguous geometry matches instead of trusting list order. These
signatures do not prove exact B-rep topology, mounting fits or physical performance;
parent local acceptance and destination-specific validation remain required.

## Budget And Parent Handoff

[v4-plan.mjs](v4-plan.mjs) derives costs from the new catalog and explicit scenario
count, including original-file imports, two poll slots, body inspection, owned
datums, four all-source measurements, motion reopens, three exports and recovery.
Under its stated one-Part-Studio-per-original assumption, each additional distinct
original contributes **10 planned requests**, not merely its upload. Split imports,
ambiguous mappings or extra polls increase that cost. There is no frozen v4 total
yet: output is `projectedTotal: null`, never a reused 137-call forecast. Grounding
cost remains unpriced; even a hypothetical fit returns `admission: false`.

Parent next steps: finish/freeze local v4 and place its adapter contract in this
folder; preserve source/evaluator/acceptance hashes; provide actual motion and
import-group counts; obtain authoritative grounding evidence; approve only the
recounted bounded pilot and current allowance evidence. Later append a hash-bound
v4 migration while retaining the original ledger binding. Full-model upload stays
disabled. No new user design decision or CAD rewrite is requested from this lane.

## Safe Commands And Verification

From repository root, Node 24.15.0:

```powershell
node --permission --allow-fs-read=./trials/subsystem-ab/api trials/subsystem-ab/api/v4-plan.mjs plan
node --test trials/subsystem-ab/api/v4-native.test.mjs trials/subsystem-ab/api/v4-catalog.test.mjs trials/subsystem-ab/api/v4-plan.test.mjs
```

The restricted read-only CLI ran successfully. It does not import the credential
transport and has no sender or write command. `check-catalog --catalog=<path>`
accepts only a JSON file within this API folder, performs local checks only, and
does not import vendor files or enable live admission. Synthetic test fixtures
are not a production packet or native CAD evidence. Full v4 geometry, native
grounding, motion enforcement, relations, imports and exports remain unverified.

Observed verification: **12 V4 tests passed in focused runs** (six native, three
catalog, three planner), including the subsequent catalog/planner tightening.
One additional schema-provenance test was then added. The combined run of the
three V4 suites and six previously documented API-local regression suites could
not be confirmed: the shared terminal tool returned another process's Python
output instead of Node test results. No success is inferred from that output and
no further terminal calls were made after recognizing the conflict. The new
provenance test and combined regression suite need the parent's isolated rerun.
Editor diagnostics are clean for all V4 modules/tests, the research JSON and docs.