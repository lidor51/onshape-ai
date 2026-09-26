import hashlib
import json
import math
import sys
from pathlib import Path

import cadquery as cq
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.gp import gp_Trsf

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]


def load_vendor(identifier):
    bindings = json.loads((ROOT / "sourcebindings.json").read_text(encoding="utf8"))
    product = bindings["products"][identifier]
    path = (REPO / product["pathrepoRelative"]).resolve()
    if not path.is_relative_to(REPO):
        raise ValueError("Vendor source must be inside repository")
    if hashlib.sha256(path.read_bytes()).hexdigest() != product["sha256"]:
        raise ValueError("Vendor original hash mismatch")
    if not product["datumsverified"]:
        raise ValueError("Unverified attachment datums")
    imported = cq.importers.importStep(str(path))
    if len(imported.vals()) != product["sourceRootCount"] or product["sourceRootCount"] != 1:
        raise ValueError("Unexpected source roots; do not drop assembly components")
    shape = imported.val()
    if len(shape.Solids()) != product["importsolids"] or not shape.isValid():
        raise ValueError("Imported solid count or validity mismatch")
    matrix = product["attachment"]["sourceToAttachment"]["matrix4x4"]
    transform = gp_Trsf()
    transform.SetValues(*(value for row in matrix[:3] for value in row))
    placed = shape.moved(cq.Location(transform))
    if len(placed.Solids()) != product["importsolids"] or not placed.isValid():
        raise ValueError("Attachment placement changed valid solid inventory")
    if not math.isclose(shape.Volume(), placed.Volume(), abs_tol=1e-5, rel_tol=1e-9):
        raise ValueError("Attachment placement must preserve volume")
    return placed, product


def check():
    bindings = json.loads((ROOT / "sourcebindings.json").read_text(encoding="utf8"))
    cylinders = {"spline_pinion": 8.89, "hex_output_gear": 39.37, "x44": 9.525,
                 "hex_bearing": bindings["products"]["hex_bearing"]["datums"]["body_od_mm"] / 2,
                 "indexer_wheel": 38.1, "intake_star": 10}
    results = {}
    for identifier, radius in cylinders.items():
        shape, product = load_vendor(identifier)
        matches = []
        for index, face in enumerate(shape.Faces()):
            surface = BRepAdaptor_Surface(face.wrapped)
            if surface.GetType() != GeomAbs_Cylinder:
                continue
            cylinder = surface.Cylinder()
            if not math.isclose(cylinder.Radius(), radius, abs_tol=1e-6):
                continue
            direction = cylinder.Axis().Direction()
            origin = cylinder.Location()
            if abs(direction.Z()) > 0.999999 and math.hypot(origin.X(), origin.Y()) < 1e-6:
                matches.append(index)
        assert matches, f"{identifier}: expected attachment-axis cylinder not found"
        box = shape.BoundingBox()
        if identifier in ["spline_pinion", "hex_output_gear", "indexer_wheel", "intake_star"]:
            assert math.isclose(box.zmin + box.zmax, 0, abs_tol=1e-5), "Axial midpoint misplaced"
            assert math.isclose(box.zlen, product["datums"]["overallWidthMm"], abs_tol=1e-5)
        results[identifier] = {"status": "PASS", "validSolids": len(shape.Solids()),
                               "attachmentAxisCylinderMatches": len(matches),
                               "attachmentBoundsMm": [box.xmin, box.ymin, box.zmin, box.xmax, box.ymax, box.zmax],
                               "volumeMm3": shape.Volume(), "masterReexported": False}
        print(json.dumps({"product": identifier, **results[identifier]}), flush=True)
    ledger = json.loads((ROOT / "request-ledger.json").read_text(encoding="utf8"))
    assert ledger["closed"] and len(ledger["requests"]) == 9
    (ROOT / "integration-validation.json").write_text(json.dumps({"schema": "coral-cots-integration-check/v1",
        "status": "PASS", "networkRequests": 0, "products": results,
        "assemblyFitApproved": False}, indent=2) + "\n", encoding="utf8")


if __name__ == "__main__":
    if sys.argv[1:] == ["--check"]:
        check()
    else:
        raise SystemExit("Usage: load_vendor.py --check; parent API: shape, binding = load_vendor(identifier)")