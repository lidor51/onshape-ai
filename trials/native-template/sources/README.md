# Public Contract Research

Fetched 2026-09-11 without credentials, cookies, OAuth, browser automation, or
authenticated document reads. No sibling implementation or result was used.

## Exact Sources And Versions

| Source | Version / license / use |
| --- | --- |
| https://cad.onshape.com/api/openapi | Observed `1.220.87559-9d09f09aac42`, current server `/api/v17`; declared Apache 2.0, https://www.apache.org/licenses/LICENSE-2.0.html. Extract and full-response SHA-256 in [openapi-contract.json](openapi-contract.json). |
| https://cad.onshape.com/glassworks/explorer/ | Same observed API version and Apache 2.0 declaration. Used as documentation, not an authenticated Explorer session. |
| https://onshape-public.github.io/docs/api-adv/featureaccess/ | Unversioned guide; explicitly says examples are accurate for API v9 and internal parameters can change. Public prose, no separate license assertion. Native feature, sketch, region-query and extrude examples. |
| https://onshape-public.github.io/docs/api-adv/documents/ | Unversioned guide with v10 examples. Creation and elements, not a complete copy contract. |
| https://onshape-public.github.io/docs/api-adv/partstudios/ | Unversioned guide with v9 examples. Features, body details and mass properties; nominal/lower/upper mass-property arrays. |
| https://onshape-public.github.io/docs/api-adv/configs/ | Configured part IDs change. Configurations not used in this experiment. |
| https://onshape-public.github.io/docs/api-adv/associativity/ | Geometry IDs are not persistent. Resolve the single semantic plate at each observed microversion. |
| https://onshape-public.github.io/docs/auth/apikeys/ | HMAC-SHA256 signing algorithm; redirects require separate handling. This runner refuses all redirects. |
| https://onshape-public.github.io/docs/auth/limits/ | Free account: 2,500 annual calls; API-key/private OAuth 2xx/3xx count. Trial separately caps attempted calls. |

No GitHub implementation was adopted. An exploratory fetch of
https://raw.githubusercontent.com/onshape-public/go-client/master/onshape/docs/BTMSketchConstraint2.md
returned an incomplete generated model description; it is not the pinned contract
or a dependency. The guessed `BTDocumentCopyParams.md` URL returned 404 and was
discarded. The current OpenAPI inheritance-expanded extract is authoritative for
the structural checks used here. No GitHub commit version is claimed.

The FeatureScript library anchor
https://cad.onshape.com/FsDoc/library.html#assignVariable-Context-Id-map could not be
meaningfully extracted. It does NOT validate variable semantics. No custom
FeatureScript code was generated or evaluated.

## Verified Structural Contracts

- `POST /api/v17/documents`: `BTDocumentParams`, `name`, `isPublic`, `isEmptyContent`.
- `GET /api/v17/documents/{did}`: response uses `public`, NOT `isPublic`.
- `POST /api/v17/documents/{did}/workspaces/{wid}/copy`:
  `BTCopyDocumentParams`, `newName`, `isPublic`; response
  `BTCopyDocumentInfo.newDocumentId` and `newWorkspaceId`. No document sharing
  update and no private-to-public fallback are used. Source workspace copying has
  no documented microversion precondition in this schema; source readback and
  final unchanged verification therefore remain necessary.
- Native `BTMFeature-134`, `BTMSketch-151`, `BTMSketchConstraint-2` and their
  inherited parameters are in the schema. `DISTANCE`, `DIAMETER`, `COINCIDENT`,
  `HORIZONTAL`, `VERTICAL` are documented constraint enum members.
- `BTUpdateFeaturesCall-1748` and `BTFeatureDefinitionCall-1406` have
  `sourceMicroversion`, `rejectMicroversionSkew`, `serializationVersion`,
  `libraryVersion`. Preserve returned versions; never invent the Part Studio's
  library version. Bulk two-variable update is one request.
- Body details response is `BTExportModelBodiesResponse-734`, not the guessed
  body-detail names tried in the first extract. Its body/face/loop/edge/curve and
  surface schemas are now included. Bounding box fields and mass-property arrays
  are recorded. Geometry requests are pinned to an observed document microversion.

## Live Verification And Remaining Limits

The schema types parameter containers, but does NOT enumerate all context-specific
native parameter IDs, expression rules, default-plane orientation, constraint
direction semantics, or solver degrees of freedom. The completed 2026-09-11 live
run additionally checked the actual template's native feature specs and all five
phases' feature readbacks and measured geometry. The used `assignVariable`
`value`/`lengthValue`, `cPlane` offset, `DimensionDirection`, origin queries,
diameter `length`, scope and extrusion direction now have bounded live evidence.
They are not a generalized payload contract for arbitrary native features.

Observed native library: 3070; serialization: 1.2.21. Native parameter IDs occur
inside nested spec structures, so their validation recursively visits those
structures. Successful mutation responses used a library-version zero sentinel;
the adapter retained the positive library version from the guarded request and
logged that inheritance. Cylinder surfaces used `axis`; the geometry adapter now
accepts that observed field as well as fixture `direction`. Earlier setup stops,
tested repairs and reconciliation remain counted in the 58 setup attempts.

The documented native Hole feature's detailed parameter contract was not resolved;
the implementation explicitly uses dimensioned circular sketches and REMOVE
extrudes, each depth driven by plate thickness. Full through-holes require the
strict server geometry checks, not the word "through" in a feature name.

Geometry adapters require cylindrical surfaces, two full circular boundary edges
at opposite X faces, boundary lengths, surface area, exact bounds and nominal
volume in SI units converted to mm/mm3. Unexpected serialization, split circular
edges, different surface enums, or missing geometry stops the run. These adapters
passed against actual saved Onshape responses for setup, independent copy,
separate-editor changes, revision and original-template remeasurement, and were
replayed offline by [finish.mjs](../finish.mjs). The final native tree has 34 healthy
features, seven sketches and 30 driving constraints: 12 for the rectangular
profile and three per hole circle, with no FIX constraints. Detailed expressions,
feature mappings and measured geometry are in [summary.json](../artifacts/summary.json).
Actual solver DOF remains UNVERIFIED; successful regeneration and source readback
are not a human UI test or proof of fabrication readiness. This updates the old
offline-only research status without replacing its pinned public schema extract.

## Reproduction And Dependencies

`node trials/native-template/research.mjs` fetches only the fixed public OpenAPI URL,
without auth, saves 12 operations and 64 structural schemas, and invalidates prior
preflight source hashes. It does not fetch CAD documents. Re-run the offline command
after research. No source SDK is installed. Runtime tested: Node v24.15.0, built-in
test runner, crypto, fs, fetch and child_process. Node.js is MIT-licensed, with its
own bundled third-party notices: https://github.com/nodejs/node/blob/v24.15.0/LICENSE.
No paid kernel, template, service tier, subscription upgrade or npm dependency is
required. Model-provider cost is separate and was not measured.