# 1690 Native CAD Inspection

Research date: 2026-09-18. Team 1690, 2025 Whisper. **Current status: native hierarchy and selected source geometry inspected; motion/manufacturing unverified.**

## Subsequent Budgeted Onshape Inspection

The parent subsequently used documented read-only API calls. This section
supersedes the earlier download-only status below, which is retained as history.

- Immutable document microversion: `1d118c30ab4c3c15bc9b4ab0`, configuration `default`.
- Full native hierarchy: 1,341 part definitions, 84 subassemblies, 2,684 occurrences.
- Actual source meshes inspected: pickup subassemblies 2500/2610/2620/2770 plus
	lower shafts/transmissions, exported 3000 indexer parts, 5100 vacuum head and
	a frame/swerve datum subset. 493 source bodies placed in 955 native occurrences.
	The pickup/chassis selections are partial; no complete robot reconstruction.
- [Interactive local source viewer](../../.cache/reference-cad/1690-inspection.html),
	[hash-bound evidence](1690-geometry-evidence.json), and
	[current findings and gates](CAD-INSPECTION.md).
- Distinct pickup shafts: 441.2, 457.8, 307.6 mm mesh X spans; 11/8/5 star
	placements in the selected rows. Not projected link lengths or capture width.
- Low kick-up roller width is about 431.03 mm. Actual frame and drivetrain geometry
	establish native **Y-up**, X width and Z fore/aft. The early Z-up camera and
	"vertical-plane V" inference were incorrect; the V is horizontal with upright
	wheel shafts. Raw source measurements/transforms were not rotated or changed.
- Indexer: actual powered wheel/star V banks, ten 3-inch tyre occurrences,
	two modeled X44 drive units and belt transmission. Previous passive-V concepts
	are not faithful reconstructions.
- Native pickup and 25 returned subassemblies contain zero mate features.
	Analytic body-details export returned `BAD_GEOMETRY`, no bodies. No B-rep or
	motion validity claimed; the usable geometry is source tessellation.
- Independent plate-edge inspection rejects treating the small front bearing as
	a pinned four-bar joint: the lower rocker has a shaped slot with a 6 mm fitted
	end radius. Slot/contact freedom and drive coupling remain to be modeled.
- `KFD+` appears twice at identical placement. Counts are native occurrences,
	not a verified physical quantity or mass model.
- Vacuum cup and dual-seal head were visually inspected. The release pose is not
	an established receiver handoff configuration.
- Fourteen sampled frames from the January 9 V-indexer prototype were inspected
	through ordinary public video playback. No acquisition statistics or final
	production-robot motion measurements were made.

Source meshes, response JSON and screenshots stay in the ignored local cache;
the report/evidence describe them without publicly mirroring the released CAD.

## Earlier Download-Only Pass

### Result And Blocker

The team's [Drive release](https://drive.google.com/file/d/18I7GmIrRfM7bVn9VmSPJua8I7O3O3a7O/view?usp=sharing) is publicly viewable and names **1690-25-0000 Post.x_t**. Its embedded viewer metadata reports **372,129,700 bytes (372.13 MB)**, exceeding the **200,000,000-byte cap**. This is a metadata-reported size, not a measured download size. The public post and filename identify Parasolid text `.x_t`; no file header was read to independently confirm that format or its Parasolid version.

No CAD payload was downloaded. Parasolid `.x_t` is not directly readable by the existing CadQuery/OpenCascade route. No STEP alternative was identified in the fetched source windows. **No local native or readable CAD file was produced by this task.**

The ordinary download route returned HEAD 303, then HEAD 200 with `text/html; charset=utf-8`, no attachment filename, and a declared content length of zero. That is not evidence of a zero-byte CAD file or a successful CAD download. The final HTML body was not read, so its purpose is unknown; do not infer a particular warning, authentication requirement, or denial.

## Confirmed Release

The anonymous public Chief Delphi JSON response for the [release post](https://www.chiefdelphi.com/t/frc-orbit-1690-2025-robot-cad-release/501057/1) was retrieved and its complete post-1 `cooked` HTML read, including link destinations. The post is by `manash` (yotam manash), created and last updated 2025-05-02T10:52:58.814Z, post revision 1. This is the forum-post revision, not a CAD revision.

- [Released Onshape workspace](https://cad.onshape.com/documents/76609fe05a6594c5f9c4062a/w/437a97728f1629348e9dd7cf/e/465d3a35c190dab8355f1e5c): source link verified; destination not opened or queried. No immutable CAD version or configuration established.
- The release labels the Drive link "Top level x_t files". The public Drive viewer's title and parsed `window.viewerData.itemJson[1]` agree on the filename. `itemJson[11]` is the generic `application/octet-stream`; `itemJson[25][2]` is the size string `372129700`. These are undocumented viewer fields, not authenticated Drive API results or a payload-header check.
- `itemJson[18]` supplies the ordinary, token-free [download URL](https://drive.usercontent.google.com/uc?id=18I7GmIrRfM7bVn9VmSPJua8I7O3O3a7O&export=download). The HEAD redirect leads to the corresponding [download endpoint](https://drive.usercontent.google.com/download?id=18I7GmIrRfM7bVn9VmSPJua8I7O3O3a7O&export=download). Only response headers were read there.
- Public viewer availability is VERIFIED; successful binary-payload retrieval remains UNVERIFIED. No file hash, internal revision, creation date, units, body count or assembly hierarchy was established. The filename word "Post" is not an immutable revision identifier.
- The Onshape link is the released native authoring source; `.x_t` is an exchange format and does not establish native feature history. Neither source was inspected geometrically.

## Revision Context

The complete relevant post bodies were read as multiline HTML after the first JSON display truncated long strings. These are AUTHOR-REPORTED facts, not CAD observations or independently tested mechanism behavior.

| Source | Verified post metadata | Revision caution |
| --- | --- | --- |
| [Release post 35](https://www.chiefdelphi.com/t/frc-orbit-1690-2025-robot-cad-release/501057/35) | Korny / Yair Kornblau; created 2025-05-06T17:59:29.367Z; updated 2025-05-06T18:02:39.164Z; returned post revision 1 | Describes separating acquisition from orientation, a rear-roller addition on 2025-02-14 after a dead spot, and a later front-roller change to stars only after ISR event 3. This does not identify which revision is inside the Drive file. |
| [Collapsing four-bar post 19](https://www.chiefdelphi.com/t/self-collapsing-4-bar-intakes/501428/19) | Korny / Yair Kornblau; created 2025-05-08T17:55:17.777Z; updated 2025-05-08T18:04:18.970Z; returned post revision 2 | Explicitly labels its pictured geometry an earlier, more-roller version with the same collapse principle. Reports lift-assisting surgical tubing and a main pivot below the lower front pivot. No link lengths or impact behavior were measured. |

The opening release body and these two mechanism bodies contain no identified STEP destination. A local scan of already-returned post windows also found no `.step`/`.stp` href or simple STEP-labelled download anchor. This is a bounded link check, not a whole-thread, whole-site, opaque-file-ID or edit-history completeness claim. Post 19's extra Drive link labelled "intake four bar geometry" was not opened; its format is UNKNOWN. No additional team CAD export was positively identified.

The team-posted robot and earlier-linkage image destinations remain LINK-ONLY for this task. Zero photographs/screenshots were downloaded or visually inspected; no image is presented as native CAD evidence.

## Inspection Boundary

No native CAD file was downloaded, parsed, viewed or measured. No CAD reader or converter was run. Format identification is based on the team's label and public filename, not magic bytes. CAD file header, Parasolid version, file checksum, frozen revision, configurations, units, topology, contacts, dimensions, transforms, linkage motion and clearances remain UNKNOWN. No design changes or manufacturing conclusions follow from this check.

No Onshape browser automation, authenticated API/MCP calls, credential access, cookies, model copies, model mutations, paid service, commits or delegation. No access control was bypassed and no confirmation-token route was attempted. Only the two requested research files were authored; no downloads were saved to the permitted ignored cache.

## Nearest Readable Route

**Parent handoff, not executed:** use the parent's authorized, budgeted Onshape API export route against the exact released document/workspace/element above. Establish a version or microversion and configuration, identify the intake plus indexer/receiver interface, and export a bounded relevant assembly subset as STEP, with placement information preserved. Do not assume the linked top-level element is already that subset or that a small export is guaranteed.

Record the selected assembly/occurrences, frozen revision/configuration, export format/settings, response size and SHA-256. Enforce the same 200 MB cap before accepting the file, then check its STEP header and actual CadQuery/OpenCascade import before reporting dimensions or topology. If the authorized export route cannot provide a bounded STEP, a team-supplied STEP is the next external dependency; no paid Parasolid conversion or increased cap is authorized here.

## Retrieval Record

**Six anonymous public HTTP requests: four GETs and two HEADs, including one manually followed redirect.** Five logical source routes were used; the redirect accounts for the sixth URL. Zero Onshape requests, zero CAD-payload GETs, zero image requests. The four complete source bodies total 305,760 bytes; the HEAD requests read zero body bytes. Source responses were held in memory, not saved as source files.

| Request | Source route | Result and body coverage |
| --- | --- | --- |
| 1 | [Release JSON](https://www.chiefdelphi.com/t/frc-orbit-1690-2025-robot-cad-release/501057.json) | GET 200; 64,484 bytes; complete post-1 cooked HTML reviewed |
| 2 | [Release JSON page 2](https://www.chiefdelphi.com/t/frc-orbit-1690-2025-robot-cad-release/501057.json?page=2) | GET 200; 95,375 bytes; complete post-35 cooked HTML reviewed |
| 3 | [Collapse JSON](https://www.chiefdelphi.com/t/self-collapsing-4-bar-intakes/501428.json) | GET 200; 66,665 bytes; complete post-19 cooked HTML reviewed |
| 4 | Drive viewer linked above | GET 200; 79,236 bytes; title and selected parsed embedded metadata reviewed |
| 5 | Viewer-provided `/uc` download URL | HEAD 303; zero body bytes; redirect observed |
| 6 | Observed `/download` redirect target | HEAD 200; HTML, no attachment filename; zero body bytes read |

These are raw HTTP bodies, not text-stripped webpage summaries. Entire bodies were received and parsed, but review was limited to the named post bodies, local link scan and selected Drive metadata. Discourse `cooked` HTML is server-rendered post content, not raw Markdown or edit history. Drive browser scripts were not executed. Final download-endpoint HTML was not read. No whole-topic or binary-availability claim is made.

SHA-256 hashes of the four received source bodies, **not of CAD geometry**:

| Request | SHA-256 |
| --- | --- |
| 1 | `e367ac3dff7ea6dc39f3f3a1807b7d31d8f6b5e0b7faeda07c902942e4c6010d` |
| 2 | `a77c4429cd7f4c31c0e32ce04072064b1d110c985b43e392e92bad4177b290b6` |
| 3 | `6ab2c59b8a3a830221abd0dca22bd4a70409ff1a21e957c438a6366e0fe0fc06` |
| 4 | `1292e6c5bc193970545a41a9bd8d36e2f7971f5d82409a432a8995650afabfc3` |

The machine-readable record is [1690-native-evidence.json](1690-native-evidence.json). Local consistency checks are not a native-CAD inspection pass.