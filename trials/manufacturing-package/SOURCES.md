# Fetched Sources And Dependency Contracts

Public sources accessed on 2026-09-11. No API key, OAuth token, browser session,
or other credentials were supplied. These are documentation observations, not
authenticated Onshape CAD observations.

## Onshape

- https://cad.onshape.com/api/openapi : direct unauthenticated HTTP 200; OpenAPI
  3.0.1, product schema `1.220.87559-9d09f09aac42`, current server `/api/v17`.
  [Captured subset](research/public-schema.json) now retains 12 relevant paths,
  72 referenced schemas, retrieval timestamp, and original response SHA-256.
  The web-document reader first failed to extract meaningful content; the Node
  JSON fetch succeeded. Continuation added one unauthenticated schema refresh.
- https://onshape-public.github.io/docs/api-adv/translation/ : format-specific
  STEP export, `ACTIVE`/`DONE`/`FAILED`, `resultExternalDataIds`, and external-data
  download. External data itself is not versioned: bind the export job's identity
  and immutable input version, then retain bytes/hash immediately.
- https://onshape-public.github.io/docs/api-adv/documents/ : create document,
  create version from workspace, returned version ID and microversion.
- https://onshape-public.github.io/docs/api-adv/fs/ : exact `evBox3d(tight=true)`;
  ordinary bounding-box endpoints are visualization approximations. This page
  does not establish an implemented exact-hole measurement response adapter.
- https://onshape-public.github.io/docs/auth/limits/ : annual 2,500-call allowance
  for Free/Student/Standard accounts; relevant authenticated 2xx/3xx count.
  This trial counts all attempted authenticated requests conservatively instead.

### Observed Schema Bindings

| Operation | Observed Contract | Trial Policy |
| --- | --- | --- |
| createDocument | `BTDocumentParams.isPublic` | Explicit true; response visibility must be true; reserve one creation before POST |
| document response | `BTDocumentInfo.public` | Observed true; response differs from request field isPublic |
| native modeling | getElementsInDocument, addPartStudioFeature, updatePartStudioFeature | Observed plane/sketch/extrude add and owned-ID edits |
| createVersion | `BTVersionOrWorkspaceParams`, `BTVersionInfo.id`, `.documentId`, `.microversion` | Never export a moving workspace |
| getPartStudioFeatures | `BTFeatureListResponse-2457` | Complete, no skew, exact source microversion, all states OK |
| getPartsWMV | array of `BTPartMetadataInfo` | Exactly one non-mesh solid in the selected Part Studio |
| createPartStudioExportStep | `BTBStepExportParams` | `stepUnit=MILLIMETER`, AP242, no axis rotation, no document blob, no email/cloud export |
| getTranslation | `BTTranslationRequestInfo` | Match document, element, version, job; no workspace ambiguity; max four polls |
| downloadExternalData | document and foreign ID | Accept only an ID bound by the completed job; no redirect or alternate host |

The STEP endpoint supports `w`/`v`, not `m`, and its observed request schema has
no selected-part or configuration field. Do not invent `partIds` or configuration
parameters. The intended live input must be a dedicated one-part,
default-configuration fixture. Multi-part Part Studios are BLOCKED.

Both actual A/B responses supplied the required version/source-microversion
identities. No consistency guard was weakened for missing IDs. Native setup,
ordinary updates and exact read-only measurements are implemented and observed;
mock tests remain separate evidence. Additional public sources used:

- https://onshape-public.github.io/docs/api-adv/featureaccess/ : native JSON types,
  sketch circles/region queries, extrusion parameters and add/update responses.
- https://onshape-public.github.io/docs/auth/apikeys/ : lowercase HMAC canonical
  request, nonce/date and SHA-256 signature; no credentials supplied to this page.
- https://cad.onshape.com/FsDoc/library.html : attempted fetch failed to extract
  meaningful content, not claimed as successful research. Actual versioned server
  evaluations validated evPlane, evBox3d(tight=true), evSurfaceDefinition, evVolume
  and cylinder coordinate-system fields. Part Studio library=3070, serialization=1.2.21.

Actual STEP declares metres despite requesting millimetres. OpenCascade converts
declared units to mm; actual geometry matches server values, with original bytes
unchanged. Trimmed cylinders require `BRepAdaptor_Surface`. All response provenance
is retained, sanitized, in ignored `artifacts/private/responses/`. No FeatureScript
geometry-generation fallback or sibling implementation was used.

## Local Libraries

| Installed Component | Pin | License / Source |
| --- | --- | --- |
| CadQuery | 2.6.1 | Apache-2.0; installed package metadata; https://cadquery.readthedocs.io/en/latest/importexport.html |
| cadquery-ocp | 7.8.1.1.post1 | OCP wrapper Apache-2.0; underlying OCCT LGPL-2.1 with additional exception |
| CasADi | 3.7.2 | LGPL-3.0-or-later; installed metadata; transitive CadQuery dependency |
| ezdxf | 1.4.3 | MIT; https://ezdxf.readthedocs.io/en/stable/ |
| ReportLab open-source toolkit | 4.4.3 | BSD; https://docs.reportlab.com/ and https://docs.reportlab.com/reportlab/userguide/ch3_fonts/ |
| pypdf | 6.0.0 | BSD-3-Clause; installed package metadata |
| pypdfium2 | 4.30.0 | Apache-2.0 OR BSD-3-Clause plus PDFium dependency notices |
| Pillow | 11.3.0 | MIT-CMU; installed package metadata |
| Matplotlib / bundled DejaVu Sans | 3.10.9 | Matplotlib PSF-style; font Bitstream Vera/DejaVu license; bundled metadata/notices |
| pytest | 8.4.2 | MIT; installed package metadata |

Additional fetched sources:

- https://github.com/CadQuery/OCP : identifies Apache-2.0 thin OCCT bindings;
  current master observed at `b0495a71d10168b96cef8043ac39020a3fa45372`.
  That master commit is **not** the installed 7.8.1.1.post1 wheel revision.
- https://dev.opencascade.org/resources/licensing : redirected to the new OCCT
  site; not treated as a fetched license text. Review packaged OCCT license and
  linking exception before redistributing binary dependencies.
- https://pypdfium2.readthedocs.io/en/stable/ and
  https://pypdfium2.readthedocs.io/en/stable/readme.html#licensing : public helper
  and raw ctypes APIs, platform wheels, PDFium/third-party license obligations.

The current ezdxf documentation identifies 1.4.4, and current CadQuery/PDFium
documentation exposes APIs newer than these pins. Installed runtime evidence,
not documentation examples alone, controls the implementation. PDFium 4.30.0
needs explicit resource closing and raw path access; neither a context manager
nor newer `PdfObject.get_bounds()` helper is assumed.

[requirements.lock](requirements.lock) pins the entire observed environment,
including transitive dependencies. [dependencies.json](dependencies.json)
records versions, license expressions/classifiers, project URLs, and distributed
license paths. `.venv` is not redistributed. Preserve all applicable notices if
redistributing runtime binaries; the license table is not legal advice.

Only free local libraries are used. ReportLab Plus, PageCatcher, cloud conversion,
paid CAD/PDF services, and expiring trials are not used. No external converter or
manufacturer received geometry. AI-provider usage/cost is not measured by this
trial and is not represented as zero.