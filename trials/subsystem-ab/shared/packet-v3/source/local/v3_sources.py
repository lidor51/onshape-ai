import hashlib
import importlib.metadata
import json
import sys

from cad_core import ROOT, bounds, cq, cylinder, solid_check


COTS = ROOT.parent / "cots"
PRODUCT_FILES = {"x44": "wcp-0941.step", "hex_bearing": "wcp-0783.step", "spline_pinion": "wcp-1016.step", "hex_output_gear": "wcp-0137.step", "wheel": "am-3462-rev2.step"}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inspect_sources():
    frames = json.loads((COTS / "attachment-points.json").read_text())["products"]
    validation = json.loads((COTS / "geometry-validation-v2.json").read_text())["assets"]
    report = {"python": sys.executable, "cadquery": cq.__version__, "apiCalls": 0, "sources": {}, "gearPackages": [entry.metadata["Name"] for entry in importlib.metadata.distributions() if "gear" in entry.metadata["Name"].lower()]}
    for role, filename in PRODUCT_FILES.items():
        path = COTS / "cache" / filename
        measured = validation["cache/" + filename]
        if sha(path) != measured["sha256"] or measured["status"] != "PASS":
            raise ValueError("Source hash or geometry failure: " + role)
        shape = cq.importers.importStep(str(path)).val()
        bodies = []
        for index, body in enumerate(shape.Solids()):
            entry = {"index": index, **solid_check(body)}
            if role == "x44":
                entry["axialSections"] = [{"zMm": elevation, "volumeIn1mmSlabMm3": body.intersect(cylinder(100, 1, (0, 0, elevation), (0, 0, 1))).Volume()} for elevation in [-65, -35, -5, 0, 3, 8, 20, 35]]
            bodies.append(entry)
        report["sources"][role] = {"path": str(path), "sha256": sha(path), "boundsMm": bounds(shape), "bodies": bodies, "frame": frames.get(role), "validationKeys": list(measured)}
    return report


if __name__ == "__main__":
    report = inspect_sources()
    directory = ROOT / "packet-v3"
    directory.mkdir(exist_ok=True)
    (directory / "source-inspection.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))