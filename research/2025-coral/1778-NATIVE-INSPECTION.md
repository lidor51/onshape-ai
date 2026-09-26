# 1778 Native Reference Access

Date: 2026-09-18. **Current: user-supplied local source mesh inspected.**

The user supplied the273,057,824-byte GLTF. Its original SHA256 is
`a52dc4f1110034338c01d2330df4bc13ef551dda42183001007b28e6bbfe8ce8`.
All four source assembly groups were inspected:1,140 body occurrences, including
the intake, arm/receiver, elevator/pivot drive and drivetrain. Original bytes are
unchanged, with zero additional Onshape API calls.

[Actual source viewer](http://127.0.0.1:49178/) and
[the new inspection record](LOCAL-1778-INSPECTION.md) supersede the unavailable-
geometry status below. This is source triangle inspection, not native editable
features, analytic B-rep, material certification or verified joint motion.
The remote API/download failures below remain historical evidence.

## User-Requested Retry

The user explicitly requested another attempt after the first pass. A separate
read-only retry was bounded to four additional requests without resetting the
140-attempt cumulative budget. Two additional attempts were made:

- Attempt 42: workspace assembly definition, without mate expansion, again
	returned HTTP 500. This falsified the hypothesis that only the pinned
	microversion path was failing.
- Attempt 43: the published GLTF blob returned **HTTP 200**, content type
	`application/octet-stream;charset=utf-8`, with no Content-Length header.
	Its stream exceeded the configured 150 MiB limit and was stopped locally.
	No complete payload was saved or inspected. The sanitized diagnostic is
	`REFERENCE_DOWNLOAD_SIZE`; the generic transport entry retains its historical
	`UNKNOWN_OUTCOME` classification.

This changes the source-access conclusion: **the GLTF file is accessible, but is
larger than the retained download ceiling**. It is not proven corrupt, private or
unavailable. A proposed increase to 512 MiB was not explicitly approved because
the user was unavailable; that larger download was not made. No browser/API
access bypass or source mutation occurred. The cumulative ledger is now43/140.

The current local custom design uses the1+9 family, not a claimed1778 replica.
The retry implementation and offline scope tests are [retry-1778.mjs](retry-1778.mjs)
and [retry-1778.test.mjs](retry-1778.test.mjs). Original failures below remain history.

The [released source](https://cad.onshape.com/documents/07beed2a16f5d7898cc42c9c/w/a74e4d796ba952dabae8ff7e/e/42c6b0e68334934d197bf369)
was confirmed public with document name `0 - Full Assembly`. Its workspace was
pinned to microversion `02bad7ce0056faa45e888361`.

The pinned element listing includes `Full Assembly`, a `Full Assembly.gltf` blob
and its BOM. Element metadata is not a geometric inspection.

| Ledger Attempt | Operation | Result |
| --- | --- | --- |
| 24 | Document metadata | HTTP 200; public source confirmed |
| 25 | Current microversion | HTTP 200; immutable revision captured |
| 26 | Assembly, mate features/connectors requested | HTTP 500; support code `039d64e1874098b7bc30cfcd` |
| 27 | Pinned element listing | HTTP 200; source elements identified |
| 31 | Observed workspace GLTF blob download | `UNKNOWN_OUTCOME`; no file saved, no response status recorded |
| 33 | Assembly without mate expansion | HTTP 500; support code `a763e4a73d006ac7ce6592af` |

The failed blob was not retried. The reduced assembly request changed the query;
it also failed. The inspector now refuses additional 1778 requests for this run.
All attempts and specifically recorded read-only recoveries remain in the shared
ledger. No authorization or quota denial was cleared, and no mutation was made.

Known limits: the precise blob failure cause is unclassified; neither its size
nor a timeout is asserted. The two assembly server errors do not show that the
team's design is defective. Browser CAD access was not used as a workaround.

The earlier first-party centering, locked-lower-axle and receiver-alignment
accounts in [1690-1778.md](1690-1778.md) remain reported behavior, not native
measurements. Concept 14 remains an interpretation, not a dimensional replica.
A readable team-provided export or a repaired documented API response is needed
to inspect the actual geometry. No CAD files, dimensions or joints are claimed.