# Public COTS Source Packet v2

## Result

The X44, WCP-0783 bearing, WCP-1016 pinion, WCP-0137 output gear, and existing AndyMark wheel pass local solid validation. X60 CAD was acquired, but solid index 3 of its six source solids fails OpenCascade BRepCheck. That original file is quarantined and excluded from imports. All five requested critical source files exist; four pass topology validation. The X44-based core is ready for parent integration, not manufacturing release.

## Budget and Recovery

- Original public attempts preserved: 14. Additional attempts: 25 of 25. Total: 39 of 39. Phase closed.
- HTTP 200 responses: 31; redirects: 5; HTTP failures: 1; interrupted/no-response attempts: 2.
- Authenticated/Onshape calls: 0. No cookies, credentials, Playwright, extraction service, installs, purchases or remote macros.
- Original CSV failure at attempts 11-12 remains in history. A fresh request followed immediately succeeded at attempts 15-16. Bearing and gear tables also succeeded. Redirect expiry is plausible, not proven.
- Attempts 23 and 25 were interrupted by shared-terminal interference. They remain counted; later exact-URL downloads succeeded through isolated local processes.

## CAD Source Map

| SKU | Product | Original manufacturer sources | STEP units | Named definitions / solids | Local status |
| --- | --- | --- | --- | --- | --- |
| WCP-0940 | x60 | [STEP](https://wcproducts.info/files/frc/cad/WCP-0940.STEP) / [drawing](https://wcproducts.info/files/frc/drawings/Web-WCP-0940.pdf) | INCH | 1 / 6 | QUARANTINED_INVALID_TOPOLOGY |
| WCP-0941 | x44 | [STEP](https://wcproducts.info/files/frc/cad/WCP-0941.STEP) / [drawing](https://wcproducts.info/files/frc/drawings/Web-WCP-0941.pdf) | INCH | 1 / 2 | PASS |
| WCP-0783 | hex_bearing | [STEP](https://wcproducts.info/files/frc/cad/WCP-0783.step) / [drawing](https://wcproducts.info/files/frc/drawings/Web-Bearings%20Flanged.PDF) | INCH | 1 / 1 | PASS |
| WCP-1016 | spline_pinion | [STEP](https://wcproducts.info/files/frc/cad/WCP-1016.step) / [drawing](https://wcproducts.info/files/frc/drawings/Web-Steel%20SplineXS%20Pinions.pdf) | INCH | 1 / 1 | PASS |
| WCP-0137 | hex_output_gear | [STEP](https://wcproducts.info/files/frc/cad/WCP-0137.step) / [drawing](https://wcproducts.info/files/frc/drawings/Web-Pocketed%20Gears.PDF) | INCH | 1 / 1 | PASS |
| am-3462_green | compliant_wheel | [STEP](https://s3.amazonaws.com/docusync-files/52389c35842755f9c6f77598cba5df751cbf2fda3671ae44da95fa9adf489910/am-3462%202IN%20Molded%20500Hex%20Compliant%20Wheel%20REV2.STEP) / [drawing](https://s3.amazonaws.com/docusync-files/ccd7676e32fa79e76433f7137c7bef15176ed2d9a223f14772328c53d0aeaee9/am-3462%202IN%20500Hex%20Compliant%20Wheel%20REV3.PDF) | INCH | 1 / 1 | PASS |

All measurements are millimetres after declared INCH conversion. Source files remain byte-for-byte unchanged. Each source has one named XCAF definition; X44 contains two solids and X60 six. Names and full hierarchy are retained in [geometry-validation-v2.json](geometry-validation-v2.json). Local labels are not Onshape IDs.

## Interfaces

- X44: mounting face at source Z=0; +Z points along the shaft. Pilot diameter 19.05 mm, eleven holes on a 34.925 mm bolt circle; missing hole at 270 degrees from source +X. Drawing calls out #10-32 UNF mounting threads, 6.35 mm deep, and a 9.525 mm-deep shaft-end thread. Spline shoulder Z=5.55625 mm; tip Z=37.35705 mm. Preserve both solids and the actual spline.
- Bearing: source axis +Y; flange underside Y=6.35 mm. Rotate +90 degrees about X and translate attachment Z by -6.35 mm. Actual bore 12.72 mm hex, journal OD 28.5496 mm, flange OD 31.115 mm, total width 7.9375 mm and flange thickness 1.5875 mm. These differ from rounded nominal drawing dimensions; no fit tolerance is approved.
- Pinion: source axis +Z, midplane Z=0; end planes +/-9.525 mm. CAD has 16 tooth-tip faces and the original SplineXS bore, not a circular replacement. Spline engagement/clocking remains unvalidated.
- Output gear: 48 tooth-tip faces; source axis +Z, tooth face width 9.525 mm, overall width 12.6492 mm. Actual hex is 12.8016 mm across flats. Rotate -30 degrees about Z to align its measured hex corner with attachment +X.
- Wheel: unchanged REV2 single solid, intentionally undersized 10.795 mm hex bore and 12.7 mm width. The published REV3 drawing and selected green/35A variant remain distinct; no revision or variant equivalence is asserted.

Face indices and transforms are in [attachment-points.json](attachment-points.json), bound to exact source hashes. They are measured local datums, not native mate connectors. Axial retention, spline engagement, backlash, bearing housing fit, dynamic interference and motion clearance are parent checks.

## Catalog and Documentation

Published WCP tables supply live Onshape workspace links, not immutable version/part/configuration tuples. Those links are retained as discovery only and were never queried. The bounded FRCDesignLib repository-name search returned zero results. The observed FRCDesignApp tree, README and fixed initial SQL schema were inspected; the schema contains no populated CAD rows or exact native bindings. This does not prove a differently named public catalog is absent. The subscribed app/library was not accessed. Public GitBook documentation was read without dynamic query services; inspected pages supplied no alternate solid asset. AndyMark searches did not expose an exact X60 motor CAD link.

## Deliverables and Parent Boundary

[manifest.json](manifest.json) contains schema-v2 completeness, provenance, acquisition history and quarantine status. [import-packet.json](import-packet.json) contains five permitted local import candidates with original binary paths, hashes, inch units, names, solid counts and source frames. [resolved-sources.json](resolved-sources.json) retains exact CSV records parsed with Python csv.DictReader. [public-fetch-log.json](public-fetch-log.json) is the closed request ledger. Shared-agent envelopes and other arm code were not modified. Parent integration and any later cloud action are separate work.

Cached vendor assets are ignored by git; redistribution permission is not established. No native import, mechanical assembly, physical testing or manufacturing release occurred.

## Source STEP Hashes

| SKU | SHA-256 |
| --- | --- |
| WCP-0940 | 819d2d0cbe3855af73e19726a461996193d2b7ecf94603dd5173b19e7c2bab32 |
| WCP-0941 | 503dff32f3e25502adfa7a0b7f9733b0b7b08e677be5a03c8c82386ba2dfade1 |
| WCP-0783 | cf4820ba57cfc6d71088e2328e0bdddfda2e707a5f4e3460bd527eafcf725f3b |
| WCP-1016 | 00ab731705d3c7c79e61a87fdae954f09d4a156d78d56d6a289a1e3f026cd874 |
| WCP-0137 | 2571edd253fe0eefe667ed4d318b18f6de84088d1d56a5e4aacaa5a554f04d7d |
| am-3462_green | 52389c35842755f9c6f77598cba5df751cbf2fda3671ae44da95fa9adf489910 |

## Local Checks

Run node --test bindings.test.mjs public-fetch.test.mjs datums.test.mjs from this directory. Run test_assets.py with the existing CAD Python environment for parser, units, nested assembly and multibody tests. validate_assets.py --all intentionally exits 1 while the original X60 remains invalid; its complete report records five PASS assets and one FAIL. The packet must not promote that source to import-ready.
