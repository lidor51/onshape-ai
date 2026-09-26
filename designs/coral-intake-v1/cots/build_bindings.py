import csv
import hashlib
import json
import math
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
OLD = REPO / "trials/subsystem-ab/cots"
OLD_LEDGER_SHA256 = "c68c34424d26e7af81c228d6f98d8a67765d713a49c6fbea4a52d8ce6d7d0875"
IDENTITY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]


def read(path):
    return json.loads(path.read_text(encoding="utf8"))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def close(actual, expected, tolerance=1e-6):
    assert math.isclose(actual, expected, abs_tol=tolerance, rel_tol=0), (actual, expected)


def dot(left, right):
    return sum(first * second for first, second in zip(left, right))


def multiply(rotation, point):
    return [dot(row, point) for row in rotation]


def source_attachment(center, rotation=None):
    rotation = rotation or IDENTITY
    translation = [-value for value in multiply(rotation, center)]
    inverse = [list(row) for row in zip(*rotation)]
    return {"convention": "attachmentPointMm = rotation * sourcePointMm + translationMm",
            "units": "mm after STEP unit-aware import; never scale vendor geometry",
            "sourceToAttachment": {"rotation": rotation, "translationMm": translation,
                                   "matrix4x4": [row + [shift] for row, shift in zip(rotation, translation)] + [[0, 0, 0, 1]]},
            "attachmentToSource": {"rotation": inverse, "translationMm": center},
            "originInSourceMm": center, "shaftAxisInAttachment": [0, 0, 1],
            "placement": "worldPoint = worldRotation * (rotation * sourcePointMm + translationMm) + worldOriginMm"}


class ProductPage(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links = []
        self.products = []
        self.script = None
        self.feed(path.read_text(encoding="utf8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
        if tag == "script":
            self.script = ""

    def handle_data(self, data):
        if self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == "script" and self.script is not None:
            try:
                parsed = json.loads(self.script)
                if isinstance(parsed, dict):
                    product = parsed.get("product", parsed)
                    if isinstance(product, dict) and "variants" in product:
                        self.products.append(product)
            except (ValueError, TypeError):
                pass
            self.script = None


def artifact(path, receipts):
    relative = path.relative_to(REPO).as_posix()
    checksum = digest(path)
    matches = [record for record in receipts if record.get("sha256") == checksum]
    assert matches, f"Missing download receipt: {relative}"
    return {"url": matches[-1]["url"], "pathrepoRelative": relative, "sha256": checksum,
            "bytes": path.stat().st_size, "receiptAttempt": matches[-1]["attempt"],
            "receiptLedger": "designs/coral-intake-v1/cots/request-ledger.json" if "savedPath" in matches[-1]
            else "trials/subsystem-ab/cots/public-fetch-log.json"}


def axial_planes(faces, lower, upper):
    result = []
    for value in [lower, upper]:
        indices = [face["index"] for face in faces if "normal" in face
                   and abs(face["normal"][2]) > 0.999999 and abs(face["origin_mm"][2] - value) < 1e-6]
        assert indices, "No analytic end plane"
        result.append({"sourceZmm": value, "faceIndices": indices})
    return result


def hex_contract(faces, indices, center, width):
    chosen = [faces[index] for index in indices]
    assert len(chosen) == 6
    offsets = []
    angles = []
    for face in chosen:
        normal = face["normal"]
        close(normal[2], 0)
        offsets.append(abs(dot(normal, [value - origin for value, origin in zip(face["origin_mm"], center)])))
        close(face["bounds_mm"][5] - face["bounds_mm"][2], width)
        angles.append(math.atan2(normal[1], normal[0]) % (2 * math.pi))
    for offset in offsets:
        close(offset, offsets[0])
    angles.sort()
    for index, angle in enumerate(angles):
        close((angles[(index + 1) % 6] - angle) % (2 * math.pi), math.pi / 3)
    return {"cadAcrossFlatsMm": 2 * offsets[0], "nominalShaftAcrossFlatsMm": 12.7,
            "faceIndices": indices, "axialEngagementEnvelopeMm": width,
            "shaftFitApproved": False}


def build():
    ledger_path = ROOT / "request-ledger.json"
    ledger = read(ledger_path)
    old_ledger = read(OLD / "public-fetch-log.json")
    assert digest(OLD / "public-fetch-log.json") == OLD_LEDGER_SHA256, "Old ledger changed"
    assert old_ledger["limit"] == len(old_ledger["requests"]) == 39 and old_ledger["phase_closed"]
    assert len(ledger["requests"]) <= 12
    assert sum(record["chargedBytes"] for record in ledger["requests"]) <= 100 * 1024 ** 2
    for record in ledger["requests"]:
        assert record["receivedBytes"] <= 25 * 1024 ** 2
        assert record["status"] in ["saved", "redirect"], "Unresolved acquisition failure"
        if record["savedPath"]:
            assert digest(REPO / record["savedPath"]) == record["sha256"]
    receipts = old_ledger["requests"] + ledger["requests"]
    geometry = read(ROOT / "geometry-report.json")["assets"]
    legacy = read(OLD / "attachment-points.json")["products"]
    products = {}
    specifications = [
        ("spline_pinion", "WCP-1010", "wcp-1010", "wcp-kraken-cad-fresh.csv", "wcp-1016.pdf"),
        ("hex_output_gear", "WCP-0121", "wcp-0121", "wcp-gear-cad.csv", "wcp-0137.pdf"),
        ("x44", "WCP-0941", "wcp-0941", "wcp-kraken-cad-fresh.csv", "wcp-0941.pdf"),
        ("hex_bearing", "WCP-0783", "wcp-0783", "wcp-bearing-cad.csv", "wcp-0783.pdf"),
        ("indexer_wheel", "am-3945_green", "am-3945-rev3", None, "am-3945-rev3.pdf"),
        ("intake_star", "am-5123_green", "am-5123", None, "am-5123.pdf")]
    for identifier, sku, key, table_name, drawing_name in specifications:
        measured = geometry[key]
        path = REPO / measured["file"]
        assert digest(path) == measured["sha256"]
        assert measured["status"] == "PASS" and measured["root_count"] == 1
        assert all(solid["valid"] for solid in measured["root_geometry"][0]["solids"])
        product = {"sku": sku, **artifact(path, receipts),
                   "sourceunits": measured["declared_length_units"], "importUnits": "mm",
                   "importsolids": measured["occurrence_solid_count"], "sourceRootCount": measured["root_count"],
                   "status": "ORIGINAL_VERIFIED_GEOMETRY_DATUMS_VERIFIED_FIT_NOT_APPROVED",
                   "datumsverified": False, "nativeOnshapeImportVerified": False,
                   "geometryEvidence": "designs/coral-intake-v1/cots/geometry-report.json",
                   "faceIndexReference": f"assets.{key}.root_geometry[0].analytic_faces; zero-based, hash-specific",
                   "boundsMm": measured["root_geometry"][0]["bounds_mm"],
                   "solidEnvelopes": measured["root_geometry"][0]["solids"], "discrepancies": []}
        if table_name:
            table_path = OLD / "cache" / table_name
            with table_path.open(newline="", encoding="utf8") as stream:
                rows = list(csv.DictReader(stream))
            selected = [(index + 2, row) for index, row in enumerate(rows) if row["P/N"] == sku]
            assert len(selected) == 1
            record_number, row = selected[0]
            assert unquote(row["CAD"]).lower() == unquote(product["url"]).lower()
            product["catalog"] = {**artifact(table_path, receipts), "csvLine": record_number,
                                  "description": row["Description"], "row": row}
            product["drawing"] = artifact(OLD / "cache" / drawing_name, receipts)
            assert unquote(product["drawing"]["url"]).lower() == unquote(row["Drawings"]).lower()
        else:
            page_path = OLD / "cache/wheel.html" if identifier == "indexer_wheel" else ROOT / "originals/compliant-stars.html"
            page = ProductPage(page_path)
            variants = [variant for item in page.products for variant in item["variants"] if variant["sku"] == sku]
            assert len(variants) == 1 and "35A" in variants[0]["title"]
            assert any(unquote(product["url"]) == unquote(link) for link in page.links)
            product["catalog"] = artifact(page_path, receipts)
            product["drawing"] = artifact(ROOT / "originals" / drawing_name, receipts)
            assert any(unquote(product["drawing"]["url"]) == unquote(link) for link in page.links)
            product["variant"] = {"sku": sku, "title": variants[0]["title"], "manufacturerVariantId": variants[0]["id"],
                                  "durometerShoreA": 35, "evidence": "Explicit manufacturer variant SKU/title; never CAD appearance",
                                  "stepScope": "Manufacturer publishes one family geometry, not a durometer-specific STEP"}
        faces = measured["root_geometry"][0]["analytic_faces"]
        if identifier in ["x44", "hex_bearing"]:
            prior = legacy[identifier]
            assert prior["source_sha256"] == measured["sha256"]
            transform = prior["source_to_attachment"]
            rotation = transform["rotation"]
            inverse = [list(row) for row in zip(*rotation)]
            center = [-value for value in multiply(inverse, transform["translation_mm"])]
            product["attachment"] = source_attachment(center, rotation)
            product["axis"] = {"originMm": prior["shaft_axis"]["origin"], "direction": prior["shaft_axis"]["direction"],
                               "evidence": "Hash-matched cached geometry and face-index derivation"}
            product["datums"] = prior
        elif identifier in ["spline_pinion", "hex_output_gear"]:
            teeth, radius = (12, 8.89) if identifier == "spline_pinion" else (60, 39.37)
            tips = [face for face in faces if abs(face.get("radius_mm", -1) - radius) < 1e-6]
            assert len(tips) == teeth
            for face in tips:
                close(abs(face["axis_direction"][2]), 1)
                close(face["axis_origin_mm"][0], 0)
                close(face["axis_origin_mm"][1], 0)
            product["axis"] = {"originMm": [0, 0, 0], "direction": [0, 0, 1], "faceIndices": [face["index"] for face in tips]}
            lower, upper = measured["root_geometry"][0]["bounds_mm"][2::3]
            product["attachment"] = source_attachment([0, 0, 0])
            product["datums"] = {"origin": "Gear tooth midplane", "endPlanes": axial_planes(faces, lower, upper),
                                 "overallWidthMm": upper - lower, "toothCountFromTipFaces": teeth,
                                 "tipCircleDiameterMm": radius * 2,
                                 "toothFaceWidthMm": tips[0]["bounds_mm"][5] - tips[0]["bounds_mm"][2],
                                 "diametralPitchPerInch": 20, "pitchDiameterMmFromCatalog": teeth / 20 * 25.4}
            if identifier == "spline_pinion":
                product["datums"]["boreProfile"] = "Original vendor SplineXS; not approximated by an 8 mm circle"
                product["datums"]["motorSplineClockingVerified"] = False
            else:
                product["datums"]["hex"] = hex_contract(faces, list(range(132, 138)), [0, 0, 0], upper - lower)
                angle = math.pi / 6
                rotation = [[math.cos(angle), math.sin(angle), 0], [-math.sin(angle), math.cos(angle), 0], [0, 0, 1]]
                product["attachment"] = source_attachment([0, 0, 0], rotation)
                product["datums"]["clocking"] = "Source hex corner +30 degrees maps to attachment +X"
        else:
            is_wheel = identifier == "indexer_wheel"
            cylinder = faces[19] if is_wheel else faces[0]
            close(cylinder["radius_mm"], 38.1 if is_wheel else 10)
            close(abs(cylinder["axis_direction"][2]), 1)
            indices = list(range(225, 231)) if is_wheel else list(range(4, 10))
            lower = faces[indices[0]]["bounds_mm"][2]
            upper = faces[indices[0]]["bounds_mm"][5]
            center = [*cylinder["axis_origin_mm"][:2], (lower + upper) / 2]
            product["axis"] = {"originMm": center, "direction": [0, 0, 1], "faceIndices": [cylinder["index"]]}
            product["attachment"] = source_attachment(center)
            product["datums"] = {"origin": "Bore axial midplane", "endPlanes": axial_planes(faces, lower, upper),
                                 "overallWidthMm": upper - lower,
                                 "hex": hex_contract(faces, indices, center, upper - lower),
                                 "clocking": "Source and attachment +X point to a hex corner",
                                 "nominalDiameterMmFromDrawing": 76.2 if is_wheel else 127,
                                 "profile": "Unmodified original vendor profile, including all solids; no custom tyre approximation"}
            limits = [0.501 * 25.4, 0.506 * 25.4] if is_wheel else [0.505 * 25.4, 0.515 * 25.4]
            product["datums"]["hex"]["drawingAcrossFlatsLimitsMm"] = limits
            product["discrepancies"].append({"field": "hex bore across flats", "cadMm": product["datums"]["hex"]["cadAcrossFlatsMm"],
                                             "drawingRangeMm": limits, "resolution": "Preserve CAD, use drawing for hardware fit; no fit approval"})
            product["status"] = "ORIGINAL_AND_DATUMS_VERIFIED_CAD_DRAWING_BORE_DISCREPANCY"
            if is_wheel:
                product["datums"]["outerCylinderDiameterMm"] = 2 * cylinder["radius_mm"]
            else:
                close(faces[174]["origin_mm"][2] - faces[172]["origin_mm"][2], 10.16)
                product["datums"].update(spokeBodyWidthMm=10.16, spokeBodyPlaneIndices=[172, 174],
                                         spokeCountFromDrawing=8, spokeSpacingDegreesFromDrawing=45,
                                         sourceXYEnvelopeMm=measured["root_geometry"][0]["size_mm"][:2],
                                         rotationalSweptEnvelopeVerified=False,
                                         includedSolids="Core spacer, small separate marking solid, star body; retain all three",
                                         catalogWidthInterpretation="0.40 inch is spoke thickness; drawing hub width is 0.50 inch",
                                         profileDifference="CAD XY envelope is 127.17734346 mm; drawing diameter is nominal 127 mm. No scaling applied.")
        product["datumsverified"] = True
        products[identifier] = product
    result = {"schema": "coral-cots-source-bindings/v1", "date": datetime.now(timezone.utc).isoformat(),
              "requests": ledger["requests"], "limits": ledger["limits"],
              "scope": "Public vendor acquisition only; no authenticated service, browser, cookies, secrets, purchases, installs or agents",
              "oldLedger": {"pathrepoRelative": "trials/subsystem-ab/cots/public-fetch-log.json", "sha256": OLD_LEDGER_SHA256,
                            "limit": 39, "requests": 39, "unchanged": True},
              "products": products,
              "gearPairContract": {"pinionSku": "WCP-1010", "gearSku": "WCP-0121", "ratio": 5,
                                   "nominalCenterDistanceMm": (12 + 60) / (2 * 20) * 25.4,
                                   "basis": "Manufacturer 12/60 tooth counts and 20DP; nominal pitch-circle calculation only",
                                   "backlashPressureAngleClockingAndLoadedMeshVerified": False},
              "limitations": ["Verified source geometry/datums are not manufacturing or assembly-fit approval.",
                              "Both AndyMark STEP bores are nominal 12.7 mm; their drawings specify larger bore limits.",
                              "Unit-aware import converts INCH source representations to millimetres; no CAD resizing or master re-export.",
                              "Source coordinates are retained in masters; apply attachment transforms only to assembly instances.",
                              "No placement in parent assembly or replacement of parent custom roller tyres was performed (outside owned scope)."]}
    validate(result)
    ledger["closed"] = True
    ledger["closureReason"] = "Requested originals acquired; 9 of 12 attempts used. No further public requests authorized by this script run."
    ledger_path.write_text(json.dumps(ledger, indent=2) + "\n", encoding="utf8")
    (ROOT / "sourcebindings.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"status": "PASS", "publicAttempts": len(ledger["requests"]),
                      "downloadedBytes": sum(record["receivedBytes"] for record in ledger["requests"]),
                      "oldLedgerUnchanged": True,
                      "products": {key: {"sku": value["sku"], "solids": value["importsolids"],
                                         "datumsverified": value["datumsverified"], "status": value["status"],
                                         "sourceToAttachment": value["attachment"]["sourceToAttachment"]}
                                   for key, value in products.items()}}, indent=2))


def validate(bindings):
    assert set(bindings["products"]) == {"spline_pinion", "hex_output_gear", "indexer_wheel", "intake_star", "x44", "hex_bearing"}
    assert digest(OLD / "public-fetch-log.json") == bindings["oldLedger"]["sha256"]
    assert bindings["requests"] == read(ROOT / "request-ledger.json")["requests"]
    expected = {"spline_pinion": ("WCP-1010", 1), "hex_output_gear": ("WCP-0121", 1),
                "indexer_wheel": ("am-3945_green", 2), "intake_star": ("am-5123_green", 3),
                "x44": ("WCP-0941", 2), "hex_bearing": ("WCP-0783", 1)}
    for identifier, (sku, solids) in expected.items():
        assert bindings["products"][identifier]["sku"] == sku
        assert bindings["products"][identifier]["importsolids"] == solids
    for product in bindings["products"].values():
        path = (REPO / product["pathrepoRelative"]).resolve()
        assert path.is_relative_to(REPO)
        assert digest(path) == product["sha256"]
        assert path.stat().st_size == product["bytes"]
        assert product["datumsverified"] and product["importsolids"] > 0
        transform = product["attachment"]["sourceToAttachment"]
        rotation = transform["rotation"]
        center = product["attachment"]["originInSourceMm"]
        assert transform["matrix4x4"] == [row + [shift] for row, shift in zip(rotation, transform["translationMm"])] + [[0, 0, 0, 1]]
        assert product["attachment"]["attachmentToSource"]["rotation"] == [list(row) for row in zip(*rotation)]
        assert product["attachment"]["attachmentToSource"]["translationMm"] == center
        for index, row in enumerate(rotation):
            for other_index, other in enumerate(rotation):
                close(dot(row, other), 1 if index == other_index else 0)
        cross = [rotation[0][1] * rotation[1][2] - rotation[0][2] * rotation[1][1],
                 rotation[0][2] * rotation[1][0] - rotation[0][0] * rotation[1][2],
                 rotation[0][0] * rotation[1][1] - rotation[0][1] * rotation[1][0]]
        close(dot(cross, rotation[2]), 1)
        for value, shift in zip(multiply(rotation, center), transform["translationMm"]):
            close(value + shift, 0)
        for actual, expected in zip(multiply(rotation, product["axis"]["direction"]), [0, 0, 1]):
            close(actual, expected)
        for evidence in [product["drawing"], product["catalog"]]:
            assert digest(REPO / evidence["pathrepoRelative"]) == evidence["sha256"]


if __name__ == "__main__":
    if sys.argv[1:] == ["--check"]:
        validate(read(ROOT / "sourcebindings.json"))
        print("PASS: six source hashes, catalogs/drawings, rigid transforms, axes, and unchanged old ledger")
    elif not sys.argv[1:]:
        build()
    else:
        raise SystemExit("Usage: build_bindings.py [--check]")