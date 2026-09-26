# Explicit Assembly-Origin Alternative

Date: 2026-09-13. Status: **BLOCKED_EXPLICIT_ORIGIN_QUERY_UNPROVEN**.

One bounded, independent research pass; **five public fetch attempts, zero
authenticated calls**. Saved ledger: **23/140**, 117 remaining. No full upload,
Onshape mutation, browser/private-network inspection, credentials, environment
files, delegation, new Onshape document, or retry of a fixed-state setter.
Only this report and [ground-origin.test.mjs](ground-origin.test.mjs) were written.
The parent's local v5 design remains independent and untouched.

## Finding

**An explicit assembly mate connector is a supported native feature. A verified
world-origin reference for that feature is still missing.** This is a narrower
blocker than lack of a connector endpoint, not proof that grounding is impossible.

The official [assembly guide](https://onshape-public.github.io/docs/api-adv/assemblies/#create-a-mate-connector-in-an-assembly)
documents a top-level `BTMMateConnector-66`, `featureType: mateConnector`, with
`originType: ON_ENTITY` and an `originQuery` containing
`BTMInferenceQueryWithOccurrence-1083`. Its example uses `CENTROID`, real part
occurrence paths and real geometry IDs. It does **not** supply a root/world-origin
example. The [FASTENED example](https://onshape-public.github.io/docs/api-adv/assemblies/#create-a-mate-in-an-assembly)
then references **returned connector feature IDs** through
`BTMFeatureQueryWithOccurrence-157`, `path: []`, `queryData: ""`. Empty `path`
there means an assembly-level connector reference, not an origin selector.

The cached public contract in [schema/openapi-v17.json](schema/openapi-v17.json),
version `1.220.87929-d54ca734df42`, supplies `addFeature`:
`POST /api/v17/assemblies/d/{did}/{wvm}/{wvmid}/e/{eid}/features`, workspace mode
`w`, body `BTFeatureDefinitionCall-1406`. This establishes the outer feature
request, not the missing root-reference contents. No complete supported grounding
payload or dispatchable candidate is supplied.

## Saved Native Evidence

Only `featureSpecs[featureType == "mateConnector"]` was extracted from
[ledger.json](ledger.json); account/document metadata was excluded from extraction.

- `originType` permits `ON_ENTITY` and `BETWEEN_ENTITIES`.
- `originQuery` explicitly admits `BTFeatureTypeFilter-962` with
  `featureType: assemblyOrigin`. Its connector branch has `requiresOccurrence:
  false`, `allowImplicitMateConnector: false`. This is positive evidence that an
  assembly origin is selectable, **not its serialized query**.
- The native connector orientation parameters are `flipPrimary` and
  `secondaryAxisType` (`PLUS_X`, `PLUS_Y`, `MINUS_X`, `MINUS_Y`), plus `realign`,
  `primaryAxisQuery`, `secondaryAxisQuery`. `primaryAxisAlignment` and
  `secondaryAxisOrientation` are not observed connector parameters.
- `transform`, `translationX/Y/Z`, `rotationType`, and `rotation` modify a
  resolved connector frame. Zero translations do not supply a missing origin.
  No native connector `owner`, `ownerPart`, `requireOwnerPart`, or `coordSystem`
  parameter appears in this saved spec. Do not invent `owner: null`.
- `BTMMateConnector-66.implicit` is a schema-supported boolean, separate from
  `originType`. Making the failed subfeature explicit does not by itself prove
  that its origin query resolves.
- The examined `pilot-native-base` and `pilot-repair-ground-controller` responses
  have empty `features` and no `defaultFeatures`. Neither supplies an origin ID;
  these saved responses are not an exhaustive inventory of possible root data.
- Both `pilot-ground` and `pilot-repair-ground-update` remain `ERROR`. The former
  used an implicit subfeature with `PART_ORIGIN`, empty occurrence path and empty
  deterministic IDs. The latter directly referenced `actualGround` as a mate
  endpoint. Neither tests a verified, separately created explicit origin connector;
  neither is a recipe to retry.

## FeatureScript Boundary

The current public [mateConnector reference](https://cad.onshape.com/FsDoc/library.html#mateConnector-Context-Id-map)
and [origin enum](https://cad.onshape.com/FsDoc/library.html#OriginCreationType)
name **OriginCreationType**, not `MateConnectorOriginType`. Its values are
`ON_ENTITY` and `BETWEEN_ENTITIES`; `PART_ORIGIN` is an inference category, and
`implicit` is a native connector property, not another origin-creation value.

The readable [standard-library mirror implementation](https://raw.githubusercontent.com/javawizard/onshape-std-library-mirror/master/mateConnector.fs)
computes `evMateConnectorCoordSystem` before creating a connector. Its
`requireOwnerPart: false` branch sets `ownerPart` to `qNothing()` before calling
`opMateConnector`. This is an **unpinned third-party mirror with a generated version
placeholder**, not verified current official implementation. It supports an
ownerless FeatureScript-body interpretation, not a native assembly parameter recipe.

Official [qOrigin](https://cad.onshape.com/FsDoc/library.html#qOrigin-EntityType)
returns a FeatureScript origin query for `VERTEX` or `BODY`.
[opMateConnector](https://cad.onshape.com/FsDoc/library.html#opMateConnector-Context-Id-map)
creates a coordinate-system body in its context; owned connectors follow their
owner into an assembly. Neither reference defines a REST `originQuery` encoding
for assembly world origin. No supported bridge from a Part Studio/Feature Studio
`qOrigin` to the native `assemblyOrigin` selector was established. Creating an
ownerless Part Studio connector is therefore not proven assembly grounding.

## Motion Interpretation

Cached `updateMateValues`,
`POST /assemblies/d/{did}/w/{wid}/e/{eid}/matevalues`, explicitly says unsupported
input degrees of freedom cause the value to be **ignored**. See the
[public operation reference](https://cad.onshape.com/glassworks/explorer/#/Assembly/updateMateValues)
and the cached operation description; the explorer was not fetched separately.
The saved upper-limit command requested pi/2, beyond its pi/3 upper limit, and
returned zero. HTTP acceptance is not motion or limit-enforcement proof. The exact
reason for this saved no-op is unresolved; missing grounding alone is not proven
to cause it, and a free-floating mechanism can still have relative joint motion.

The official [transform documentation](https://onshape-public.github.io/docs/api-adv/assemblies/#assembly-transforms)
says occurrence matrices are absolute object-to-world transforms of source Part
Studio frames, not parent-relative transforms. Evaluate world mate frames as
`occurrenceTransform * sourceMateConnectorFrame`; compare their relative frame,
not occurrence matrices alone. Source geometry/frame changes can alter the visible
pose without changing an occurrence matrix. That caveat explains measurement risk,
**not evidence of a source change or an explanation for the ignored command**.
No transform write or additional motion command was executed.

## Parent Handoff

The missing item is an authoritative or successfully observed **serialized
assembly-origin query inside an explicit connector's `originQuery`**, with any
required root reference resolved. A filter, inferred feature ID, empty query,
Part Studio origin, or schema-valid body does not meet that gate.

Only after that evidence and separate parent authorization: create the explicit
connector, require successful feature health and the intended world frame, then
FASTENED-mate its returned ID to the observed base connector. Require reopened
world anchoring and nonzero relative motion with a stationary base. A successful
world FASTENED constraint need not be the same representation as an occurrence's
`fixed` flag; changing that acceptance criterion needs explicit agreement.
No request budget or execution permission is inferred here.

**Strict pure-API grounding remains blocked.** The parent can continue mechanical
supports/design and local validation independently. A future native assembly with
healthy relative joints but a free-floating base is only an explicitly accepted
partial demo, not the requested fixed assembly, a ground pass, or permission to
ship/upload the full model. The current failed ground feature also prevents calling
the entire saved assembly healthy.

## Bounded Sources And Check

1. Official FeatureScript library URL above: fetch-tool extraction failed.
2. [Anonymous GitHub code search](https://github.com/search?q=%28%22mateConnector%22+OR+%22BTMInferenceQueryWithOccurrence%22%29+%28%22ground%22+OR+%22fixed%22+OR+%22PART_ORIGIN%22%29&type=code):
   sign-in required; no code results obtained and no authentication attempted.
3. Public library mirror source above: readable, current-release fidelity unproven.
4. Official assembly guide above: readable connector and FASTENED examples.
5. Same official FeatureScript library: direct anonymous GET succeeded, HTTP 200;
   relevant reference sections extracted in memory. No further public fetches.

[ground-origin.test.mjs](ground-origin.test.mjs) is an offline evidence check using
only Node built-ins and the two saved JSON files. It checks the historical receipt
prefix, selectable-origin spec, missing saved root binding, retained failures and
ignored-motion contract. It does not execute source, compile FeatureScript, resolve
an Onshape query, or prove native grounding.

Verification: **4/4 saved-module tests passed**. The 23-receipt prefix hash matches
the prior report, and the ledger still contains 23 attempts. Permission-limited
`--test` discovery could not locate the file; direct module execution succeeded.

```powershell
node --permission --allow-fs-read=./trials/subsystem-ab/api trials/subsystem-ab/api/ground-origin.test.mjs
```