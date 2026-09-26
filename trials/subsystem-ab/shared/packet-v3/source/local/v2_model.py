import copy
import json
import time

from cad_core import ROOT, solid_check
from model import make_design as make_v1_design, primitive, recipe, rectangular, round_stock
from validate import graph_checks, hole_checks, motion_check
from v2_reducer import apply_reducer


PACKET = ROOT / "packet-v2"


def make_design(parameters):
    parameters = copy.deepcopy(parameters)
    parameters["packetVersion"] = "concept-a-local-v2"
    design = make_v1_design(parameters)
    design["parts"]["pickup_gear_guard"]["recipe"] = recipe(
        [round_stock(67, 13), round_stock(25, 13, [0, 71.12, 0])],
        [round_stock(65, 15), round_stock(23, 15, [0, 71.12, 0])],
    )
    design["parts"]["pickup_gear_guard"]["notes"] = "V2 radial relief: 23 mm inner radius exceeds 17.4625 mm bolt-circle radius plus 4.5 mm standoff radius by 1.0375 mm. Side cover and attachment remain unverified."
    ramp = [primitive("polygon", [0, 0, 0], points=[[145, 317], [270, 250], [273, 253], [148, 320]], length=390, start=-195, axis="x")]
    for transverse in [-170, 170]:
        ramp.extend([rectangular([8, 8, 22], [transverse, 271, 244]), rectangular([30, 50, 6], [transverse, 292, 236])])
    design["parts"]["transfer_ramp"]["recipe"] = recipe(ramp)
    design["parts"]["transfer_ramp"]["notes"] = "V2 lower-profile 390 mm wide flat polycarbonate transfer surface with separate foot blocks; no bend or bumper notch. Entry top Z=320 mm; pickup belt crest Z=440 mm. The 120 mm gravity drop and capture dynamics are UNVERIFIED, not a transfer success claim."
    return apply_reducer(design)


def validate_design(design):
    started = time.perf_counter()
    report = {"packetVersion": "concept-a-local-v2", "apiCalls": 0, "source": "LOCAL_CADQUERY_NOT_ONSHAPE", "graph": graph_checks(design), "variants": {}, "physicalCoralContact": "UNVERIFIED", "continuousMotion": "UNVERIFIED_SAMPLED_ONLY"}
    for variant in ["baseline", "revision"]:
        print("Full sweep: " + variant, flush=True)
        controls = design["parameters"][variant]
        motion, shapes = motion_check(design, controls)
        holes = hole_checks(shapes, design, controls)
        solids = {name: solid_check(shape) for name, shape in shapes.items()}
        okay = motion["status"] == "PASS" and all(entry["status"] == "PASS" for entry in holes) and all(entry["valid"] and entry["closed"] and entry["solids"] == 1 and entry["volumeMm3"] > 0 for entry in solids.values())
        report["variants"][variant] = {"motion": motion, "holes": holes, "solids": solids, "status": "PASS" if okay else "FAIL"}
        print(variant + ": " + report["variants"][variant]["status"], flush=True)
    report["status"] = "PASS" if report["graph"]["status"] == "PASS" and all(entry["status"] == "PASS" for entry in report["variants"].values()) else "FAIL"
    report["wallSeconds"] = time.perf_counter() - started
    return report


if __name__ == "__main__":
    if (PACKET / "freeze.json").exists():
        raise RuntimeError("Packet v2 is sealed")
    design = make_design(json.loads((ROOT / "parameters.json").read_text()))
    report = validate_design(design)
    PACKET.mkdir(exist_ok=True)
    (PACKET / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"status": report["status"], "wallSeconds": report["wallSeconds"], "failures": [{"variant": name, "angle": sample["angleDeg"], "clashes": sample["unexpectedClashes"], "envelope": sample["envelopeStatus"]} for name, result in report["variants"].items() for sample in result["motion"]["samples"] if sample["status"] != "PASS"], "badSolids": [{"variant": name, "part": part} for name, result in report["variants"].items() for part, entry in result["solids"].items() if not entry["valid"] or not entry["closed"] or entry["solids"] != 1]}, indent=2))
    raise SystemExit(0 if report["status"] == "PASS" else 1)