# Verified Public Vendor Sources

Completed 2026-09-18. All writes are confined to this directory. No authenticated
Onshape requests, browsers, cookies, secrets, purchases, installs, additional
agents, or interference with other terminal jobs were used.

## Acquisition Result

- 9 of 12 allowed public HTTP attempts, including one redirect.
- 13,352,516 response-body bytes received (12.734 MiB); largest file 4,544,081 bytes.
- Limits: 25 MiB per file and 100 MiB total. The pass is now closed.
- Byte accounting covers response bodies, not HTTP/TLS overhead or transport
  prefetch; individual redirects are explicitly recorded. No fetch_webpage calls.
- The old ledger remains closed at 39/39, with SHA-256
  `c68c34424d26e7af81c228d6f98d8a67765d713a49c6fbea4a52d8ce6d7d0875`.
- Downloaded originals are never overwritten, resized, fused, or re-exported.
  Cached originals are referenced in place and hash-checked.

[sourcebindings.json](sourcebindings.json) is the parent integration contract.
[request-ledger.json](request-ledger.json) contains the separate request receipts.
Each product includes the original URL, repository-relative path, SHA-256, byte
count, source units, imported solids, catalog/drawing evidence, source axis,
attachment transforms, face-index evidence, verification status, and caveats.
Cached evidence identifies the old ledger separately from the new receipts.

| Binding ID | Exact Part | Original STEP | Solids | Evidence |
| --- | --- | --- | ---: | --- |
| `spline_pinion` | WCP-1010, 12T 20DP SplineXS | [wcp-1010.step](originals/wcp-1010.step) | 1 | Exact cached WCP CSV row and original family drawing explicitly list WCP-1010 |
| `hex_output_gear` | WCP-0121, 60T 20DP 1/2-inch hex | [wcp-0121.step](originals/wcp-0121.step) | 1 | Exact cached WCP CSV row and original family drawing explicitly list WCP-0121 |
| `indexer_wheel` | am-3945_green, 3-inch, 1/2-inch hex, 35A | [am-3945-rev3.step](originals/am-3945-rev3.step) | 2 | Manufacturer product variant and [revision-3 drawing](originals/am-3945-rev3.pdf) |
| `intake_star` | am-5123_green, 5-inch, 1/2-inch hex, 35A | [am-5123.step](originals/am-5123.step) | 3 | Manufacturer product variant and [revision-1 drawing](originals/am-5123.pdf) |
| `x44` | WCP-0941 | Existing hash-verified cache, path in bindings | 2 | Existing manufacturer STEP, drawing, and verified datums |
| `hex_bearing` | WCP-0783 | Existing hash-verified cache, path in bindings | 1 | Existing manufacturer STEP, drawing, and verified datums |

AndyMark publishes family geometry, not separate STEP files for each durometer.
The 35A choice is established by the explicit `_green` product SKU and variant
title. It is not inferred from CAD colors or material appearance. The two wheel
STEP URLs and drawing URLs were extracted from manufacturer page links, not
constructed from filename guesses. No requested original remains unavailable.

## Dimensional Contracts

- WCP-1010: 12 measured tooth-tip cylinders, 17.78 mm tip-circle diameter,
  19.05 mm overall width, original SplineXS bore preserved. CAD bounding-box
  width is not the tip-circle diameter. Source length units are INCH.
- WCP-0121: 60 measured tooth-tip cylinders, 78.74 mm tip-circle diameter,
  12.6492 mm overall width, six CAD bore flats measuring 12.7762 mm AF.
  The drawing's 0.750-inch callout is a hub diameter, not overall width.
  Source length units are INCH.
- The 12T/60T, 20DP pair has a nominal 5:1 ratio and 45.72 mm calculated center
  distance. This does not prove backlash, pressure-angle compatibility, motor
  spline engagement, axial retention, clearance, or loaded operation.
- am-3945: 76.2 mm cylindrical OD, 25.4 mm overall width, two valid solids.
  Source units are millimetres. The source center is offset; use the recorded
  transform, not a guessed origin.
- am-5123: the original eight-spoke star profile is retained, including the
  core spacer and the small separate marking solid. Three valid solids;
  10.16 mm spoke-body width and 12.7 mm hub/overall width. Source units are INCH.
  The CAD X/Y envelope is 127.17734346 mm, while the drawing calls out nominal
  127 mm diameter. No scaling is applied. A full rotational swept-envelope
  or motion/contact check has not been established by this acquisition task.

**Bore discrepancies require attention:** the am-3945 STEP has a 12.700 mm AF
bore but its drawing specifies 0.501-0.506 inches (12.7254-12.8524 mm). The
am-5123 STEP also has a 12.700 mm AF bore, while its drawing specifies
0.505-0.515 inches (12.827-13.081 mm). These are genuine source discrepancies,
not grounds to scale or silently modify the CAD. Fit is not approved.

## Attachment Transforms

All inputs below are the original root coordinates **after unit-aware import
into millimetres**. Never apply an additional inches-to-mm scale to a CadQuery
import. The convention is `attachmentPoint = R * sourcePoint + t`.
The attachment shaft direction is +Z. Full-precision matrices, inverse
transforms, and datum witnesses are in the bindings.

| Binding | R | Translation t, mm | Attachment Origin |
| --- | --- | --- | --- |
| `spline_pinion` | Identity | (0, 0, 0) | Gear midplane |
| `hex_output_gear` | Rz(-30 degrees) | (0, 0, 0) | Gear midplane; hex corner toward +X |
| `x44` | Identity | (0, 0, 0) | Motor mounting face/shaft axis |
| `hex_bearing` | Rx(+90 degrees) | (0, 0, -6.35) | Flange underside; source +Y becomes +Z |
| `indexer_wheel` | Identity | (59.25219339224, -3.97637023707, -28.56508764216) | Bore axial midplane; hex corner +X |
| `intake_star` | Identity | (4.30094056219, 3.32696485793, -3.25983853933) | Bore axial midplane; hex corner +X |

For placement in the parent assembly, compose its chosen world rotation and
origin with this attachment transform. Preserve all imported solids; do not
use only the first solid of a motor, wheel, or star. Cached X44 datums include
its 19.05 mm pilot, 34.925 mm bolt circle, eleven measured mounting holes,
mounting face, shaft shoulder, and shaft tip. Bearing datums include flange
seat, bore flats, journal and flange diameters, and overall width.

## Parent Commands

Run from the repository root using the existing environment; no installs:

```powershell
node designs/coral-intake-v1/cots/acquire.mjs selftest
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v1/cots/build_bindings.py --check
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v1/cots/test_bindings.py
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v1/cots/load_vendor.py --check
```

Observed results: acquisition guard self-test PASS with zero HTTP requests;
source-binding validation PASS; 12 regression tests PASS; all six runtime
CadQuery imports and transformed-axis checks PASS. Runtime checks also
preserve volumes and valid-solid counts. See
[integration-validation.json](integration-validation.json) and
[geometry-report.json](geometry-report.json).

Minimal parent-side import, without editing or re-exporting vendor originals:

```python
import importlib.util
from pathlib import Path

loader_path = Path("designs/coral-intake-v1/cots/load_vendor.py").resolve()
spec = importlib.util.spec_from_file_location("verified_vendor_cots", loader_path)
vendor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vendor)
indexer_shape, indexer_binding = vendor.load_vendor("indexer_wheel")
star_shape, star_binding = vendor.load_vendor("intake_star")
```

The returned shapes are already in attachment coordinates. The parent should
place these instances at its own validated shaft datums. It must replace its
unqualified custom roller tyres itself: edits to the parent generator are
outside this directory's ownership. No parent assembly validation was run,
and the parent's previously failing validation commands are not claimed fixed.

The offline producer can be rerun with `build_bindings.py` without `--check`;
the inspector with `inspect_sources.py`, or `inspect_sources.py drawings`.
All their output paths remain under this directory. The public acquisition
script refuses further requests after closure; no budget reset is provided.