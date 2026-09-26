# API Arm Bounded Native Repair Report

Date: 2026-09-12. **BLOCKED: native ground failed; actual motion/limits and
relations are unproven; the next frozen v3 handoff has not arrived.**

Resumed only the existing native pilot. A targeted controller read and one
schema-checked, checkpointed update of the failed ground feature did not solve
grounding. Stopped with an observed partial result after four of ten authorized
additional requests. This is not completed native motion or v3 orchestration.

## Scope And Ledger

- Authenticated requests this invocation: **4 / 10**; allocation/quota queries: **0**.
- Ledger: **23 transport SUCCESS, limit 140, remaining 117**, with no reset or new document. HTTP success is not native feature success.
- Owned origin: `https://cad.onshape.com`.
- Owned document: `c88349fc8bd39b3e6d811b19`; workspace: `2cb07fb6d6b08930d5b0cf8f`.
- No browser, delegates, commits, sharing, delete endpoint, full-model upload, or new frozen packet reads. Current-key runtime credential use was explicitly authorized; values and signed headers were not displayed or persisted.
- Writes confined to this API folder. The explicitly requested parent protocol was read; sibling-arm code was not opened.
- Original freeze anchor: `8a90d25fd25cb4068def905f53d83f0319d75a6226c016d69f5cbb93514a2f60`.
- Preserved original 19-attempt prefix SHA-256 (JSON serialization): `0ae4f6601a2b9e911148a4df7f2486aaab1c1b4839de2c97c1224b28ec6ad9e5`.
- The old [offline-plan.json](offline-plan.json), all old response bodies/checkpoints and freeze binding were not overwritten. New repair checkpoints and requests were appended. [v3-preparation-plan.json](v3-preparation-plan.json) was refreshed offline.

Actual retained tabs: [Assembly 1](https://cad.onshape.com/documents/c88349fc8bd39b3e6d811b19/w/2cb07fb6d6b08930d5b0cf8f/e/58b7e117163e0ec8a6100e66),
[pilot source Part Studio](https://cad.onshape.com/documents/c88349fc8bd39b3e6d811b19/w/2cb07fb6d6b08930d5b0cf8f/e/92636ae2c3907e3f71a93cd5),
[pilot Feature Studio](https://cad.onshape.com/documents/c88349fc8bd39b3e6d811b19/w/2cb07fb6d6b08930d5b0cf8f/e/972fbdfd31990473e1ccb256).

## Actual Native Pilot

Two source solids and two native instances were inserted using the documented
single `insertTransformedInstances` call. Source-owned connector queries were
observed. This is native pilot evidence, not authentic v3 motor geometry.

Ground feature `MHVWwSC5EjXoRtyJV` was **ERROR** at request 14 and remained
**ERROR** after the same-ID update at request 22; both returned HTTP 200.
Independent revolute `MnOxhkG9xBvNei93d` was **OK** at request 16. No new
feature-state read of that revolute was made. Its two endpoints and configured
-30 degree / +60 degree limits remain present in the final assembly readback.

| Motion observation | Actual value |
| --- | ---: |
| Before `rotationZ` | 0 radians |
| Requested `rotationZ` | 1.5707963267948966 radians (90 degrees) |
| Returned `rotationZ` | 0 radians |
| Changed occurrences on reopened readback | 0 |
| Fixed occurrences on reopened readback | 0 |

| Repair before/after | Before, request 19 | After, request 23 |
| --- | --- | --- |
| Ground's resolved endpoints | 1 | 1 |
| Ground native status (last feature response) | ERROR (#14) | ERROR (#22) |
| Base/arm transforms | Identity / identity | Identity / identity |
| Changed / fixed occurrences | 0 / 0 | 0 / 0 |
| Transform-derived relative angle | 0 radians | 0 radians |
| Limit configuration | -30 / +60 degrees | -30 / +60 degrees |
| Actual movement / enforcement | UNPROVEN / UNPROVEN | UNPROVEN / UNPROVEN |

Request 21 used the supported `getFeatures` `featureId` query for `actualGround`;
it returned an empty feature list with `isComplete: false`. Thus it did not expose
an addressable controller or an observed controller payload. Request 22 used the
supported `updateFeature` endpoint on the existing failed ID, preserving the
observed source-owned base connector and replacing the unresolved root side with
`BTMFeatureQueryWithOccurrence-157`, empty path, `featureId: actualGround`.
The invalid nested origin connector was removed from that updated feature; its
original source and failed response remain in the ledger. Local request validation
passed, but native regeneration did not. This rejected payload is not an approved
ground recipe and must not be replayed blindly.

Request 23 reopened the saved assembly in a new process at microversion
`a8d7b13501e94a4e228330ca`. The root side still did not resolve. No new motion
write was sent after this failure, and no new mate-value read was made. The
after-angle above is calculated from native occurrence transforms, not a new
`getMateValues` result. The local closure checkpoint blocks further repair commands
before credential loading. Six unused slots do not constitute proof or require
spending on speculative encodings.

The observed codec is `jsonType: Revolute`, numeric `rotationZ` in radians.
Successful HTTP transport did **not** prove movement, clamping, or grounding.
No live gear/belt relation, native rigid group, or moving-carrier behavior was tested.
The next native step requires an authoritative ground-controller/query recipe or
a valid observed native example in the owned pilot, then saved motion and both
limit checks. The public [official assembly guide](https://onshape-public.github.io/docs/api-adv/assemblies/)
and cached v17 schema support the endpoints/types, but did not establish root-query
resolution. No additional query spiral or guessed write was attempted.

## Exact Request History

All 23 entries are transport `SUCCESS` / HTTP 200. Phase `pilotAndOwnership` used 3;
phase `nativePilot` used 16; `nativePilotRepair` used 4. No identity response bodies
are reproduced here.

| # | Ledger key | Operation |
| ---: | --- | --- |
| 1 | create-document | createDocument |
| 2 | public-visibility-1 | getDocument |
| 3 | owned-elements | getElementsInDocument |
| 4 | pilot-native-specs | getFeatureSpecs |
| 5 | pilot-source-studio | createFeatureStudio |
| 6 | pilot-source-initial | getFeatureStudioContents |
| 7 | pilot-source-upload | updateFeatureStudioContents |
| 8 | pilot-source-specs | getFeatureStudioSpecs |
| 9 | pilot-source-feature | addPartStudioFeature |
| 10 | pilot-parts | getPartsWMVE |
| 11 | pilot-native-base | getFeatures |
| 12 | pilot-instances | insertTransformedInstances |
| 13 | pilot-instance-readback | getAssemblyDefinition |
| 14 | pilot-ground | addFeature |
| 15 | pilot-ground-diagnostic | getAssemblyDefinition |
| 16 | pilot-independent-revolute | addFeature |
| 17 | pilot-mate-values-before | getMateValues |
| 18 | pilot-motion-upper-limit-command | updateMateValues |
| 19 | pilot-reopened-motion-readback | getAssemblyDefinition |
| 20 | pilot-repair-visibility | getDocument |
| 21 | pilot-repair-ground-controller | getFeatures |
| 22 | pilot-repair-ground-update | updateFeature, same failed ID; native ERROR |
| 23 | pilot-repair-ground-readback | getAssemblyDefinition |

## Conditional Full-Workflow Plan

Forecast, **not frozen v3 counts**: 48 instances, 47 logical mate edges (35 fastened,
12 revolute), 5 relations, at most 13 native rigid groups, one preserved authentic
COTS import group and 8 motion scenarios. This produces at most 31 native assembly
features including ground, while retaining the complete logical connection graph.
There are 95 logical source-connector keys. Counts are recomputed from the actual
contract at handoff, never forced to 45 or silently adjusted to fit.

| Remaining phase | Maximum attempts |
| --- | ---: |
| Owned-document visibility | 1 |
| Unspent bounded native pilot reserve (4 of original 10 debited) | 6 |
| New production Part Studio and Assembly in same document | 2 |
| Frozen parametric source upload, verification, pin and instantiation | 10 |
| Preserved COTS import, two polls, native part inspection | 4 |
| Imported-body datum feature preparation and insertion | 2 |
| Native feature snapshot | 1 |
| Single bulk insertion plus readback | 2 |
| Proven ground recipe | 1 |
| Native rigid groups | 13 |
| Revolute mates | 12 |
| Native relations | 5 |
| Baseline source geometry and owned datums | 2 |
| Baseline native health/assembly readback | 2 |
| Initial mate values plus eight command/reopen pairs | 17 |
| Baseline STEP including two polls and download | 4 |
| Width revision, all-source measurements and native health | 7 |
| Revision STEP including two polls and download | 4 |
| Receiver control probe and all-source readback | 4 |
| Restore and all-source readback | 4 |
| Final native identity and health | 2 |
| Final STEP including two polls and download | 4 |
| Recovery reserve | 5 |
| **Remaining planned ceiling** | **114** |
| **Already spent + planned** | **23 + 114 = 137 / 140** |

Three attempts remain outside the explicit reserves. All exports are native
assembly exports with original downloaded bytes retained. No per-connector REST
construction, individual role-renaming pass, additional document or hidden polling
is assumed. Poll exhaustion or uncertain mutation stops without blind POST retry.

This route is conditional on the parent's acceptance of native fastened groups
and a source-preserving COTS bundle. It must be proven in the owned pilot before
production. Individual mates cost 159 with one import group, or 199 with five;
native groups with two import groups cost 147. Those routes currently fail budget.
Eight motion scenarios are only a forecast; full coverage and any extra requests
must be recounted against the same cumulative cap.

The six unspent pilot slots remain in this forecast, not a fresh execution grant.
Restoring a full ten-slot reserve at 23 spent would total **141**, which is blocked.
The corrected authentic housing/rear-cover plus separate output-shaft graph may
require more instances, source datums or import groups than the old forecast.
Recompute from frozen v3; do not weaken motion, provenance, geometry or export gates.

## Handoff Requirements

The precise schema, safe commands, evaluator receipt layout and native connector
specification are in [README.md](README.md). Critical requirements:

- Actual frozen v3 geometry/contracts/hashes and controls, with all actual instances; 48 is only the previous forecast, not a forced count.
- Authentic X44 housing/body **and rear cover** as distinct preserved source solids and native IDs, FASTENED together. The parent/user corrected the earlier false housing/shaft interpretation; no sibling COTS file was opened here.
- A separately generated or separately authenticated output shaft, explicitly labeled by provenance, with housing-to-shaft REVOLUTE and downstream output hardware. The API validator rejects rotating the imported rear cover or labeling generated output geometry as vendor geometry.
- Complete original-to-bundle/split preservation mappings, names, unit conversions, geometry signatures and source-coordinate transforms.
- Parametric source-owned connectors for every mate side plus chassis ground; 95 logical keys at 48 instances, stable suffixes and full frames for baseline/revision/receiver probe.
- A frozen imported-body datum feature and geometry evaluator that measure actual queried part IDs, not copied expected values.
- Explicit later migration checkpoint preserving the original freeze and all 23 receipts, plus parent-supplied allowance evidence. No additional quota call here.
- Successful owned native ground, nonzero reopened motion, lower/upper limit checks, relation direction/ratio and moving-carrier evidence before production release.

The observed relation schema has one ordered `matesQuery` array, not independent
driver/driven parameters. No carrier parameter was observed. Candidate native
group/relation bodies validate against cached v17 schema; fixtures are **not live
proof**. The failed ground body is not promoted into an approved recipe.

## Verification And Remaining Gates

Focused API-local tests cover ledger-safe CLI behavior, bounded repair closure,
same-ID payload validation, rejected live ground evidence, transform-based motion
checks, HMAC/pre-send persistence, complete request ceilings, preserved housing
and rear cover, separate output provenance, native relation/group schemas, typed
geometry readbacks, source IDs, connector orientation and revision identity.
**25 tests passed** across these six explicit files, run with `node --test`:
[pilot-ground.test.mjs](pilot-ground.test.mjs), [pilot-repair.test.mjs](pilot-repair.test.mjs),
[transport.test.mjs](transport.test.mjs), [preparation.test.mjs](preparation.test.mjs),
[v3-binding.test.mjs](v3-binding.test.mjs), [native-recipes.test.mjs](native-recipes.test.mjs).
Editor diagnostics found no errors in the checked implementation, tests and docs.

The legacy full test suite was not run because it loads shared packet-v1 and sibling
transport code, outside this invocation's read scope. Offline tests do not prove
the source evaluator's live envelope, query encoding, native solving, full control
coverage, final exports, human usability or physical performance. The next frozen
packet is required to bind and finish production orchestration; the safe runner
currently refuses every live command.

## Files Changed

All changes are under this API folder:

- Repair: [pilot-repair.mjs](pilot-repair.mjs), [pilot-mates.mjs](pilot-mates.mjs), [transport.mjs](transport.mjs).
- Contract/evidence: [v3-binding.mjs](v3-binding.mjs), [preparation.mjs](preparation.mjs).
- Tests: [pilot-repair.test.mjs](pilot-repair.test.mjs), [pilot-ground.test.mjs](pilot-ground.test.mjs), [v3-binding.test.mjs](v3-binding.test.mjs), [preparation.test.mjs](preparation.test.mjs), [native-recipes.test.mjs](native-recipes.test.mjs).
- Receipts/plan/docs: [ledger.json](ledger.json), [v3-preparation-plan.json](v3-preparation-plan.json), [README.md](README.md), this report.