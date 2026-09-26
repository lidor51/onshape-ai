import copy
import json
import sys
import time

import numpy as np

from model import geometry
from package_packet import transform_solid, write_json
from v3_contract import digest
from v3_model import PACKET, make_design, pose_matrix, source_body


DRIVES = [
    {"id": "pickup", "input": "pickup_pinion", "output": "pickup_output_gear", "ratio": 6, "motor": "pickup_motor"},
    {"id": "orienter_left", "input": "orienter_left_pinion", "output": "orienter_left_gear", "ratio": 3, "motor": "orienter_left_motor"},
    {"id": "orienter_right", "input": "orienter_right_pinion", "output": "orienter_right_gear", "ratio": 3, "motor": "orienter_right_motor"},
    {"id": "deployment_first", "input": "deploy_motor_pinion", "output": "deploy_pinion", "ratio": 8, "motor": "deploy_motor"},
    {"id": "deployment_final", "input": "deploy_pinion", "output": "deploy_output_gear", "ratio": 6},
]


def phase_checks(quick=False, design=None, shapes=None, variant="baseline"):
    started = time.perf_counter()
    design = design or make_design()
    controls = design["parameters"][variant]
    records = {item["id"]: item for item in design["instances"]}
    required = {drive[key] for drive in DRIVES for key in ["input", "output"]}
    for drive in DRIVES:
        if "motor" in drive:
            required.update([drive["motor"], drive["motor"] + "_shaft"])
    shapes = {} if shapes is None else dict(shapes)
    for role in sorted({records[name]["part"] for name in required}):
        if role in shapes:
            continue
        print("Build phase body", role, flush=True)
        part = design["parts"][role]
        shapes[role] = source_body(role) if part["category"] == "cots" else geometry(part["recipe"], controls)
    pivot = design["parameters"]["pivotOriginMm"]
    phases = [0, 11.25, 22.5] if quick else np.linspace(0, 22.5, 25).tolist()

    def placed(name, drive, phase):
        angle = phase / 48 if drive["id"] == "deployment_first" else -phase / 6 if drive["id"] == "deployment_final" else 0
        item = records[name]
        return transform_solid(shapes[item["part"]], pose_matrix(item, controls, angle, pivot, {drive["id"]: phase}))

    rows = []
    for drive in DRIVES:
        for phase in phases:
            first = placed(drive["input"], drive, phase)
            second = placed(drive["output"], drive, phase)
            overlap = first.intersect(second).Volume()
            row = {"variant": variant, "drive": drive["id"], "inputPhaseDeg": phase, "outputPhaseDeg": -phase / drive["ratio"], "meshOverlapMm3": overlap, "meshDistanceMm": first.distance(second)}
            if "motor" in drive:
                shaft = placed(drive["motor"] + "_shaft", drive, phase)
                housing = placed(drive["motor"], drive, phase)
                row["shaftPinionOverlapMm3"] = shaft.intersect(first).Volume()
                row["shaftHousingOverlapMm3"] = shaft.intersect(housing).Volume()
                row["shaftPinionDistanceMm"] = shaft.distance(first)
            row["status"] = "PASS" if all(value <= 1e-4 for key, value in row.items() if key.endswith("OverlapMm3")) and row["meshDistanceMm"] < 0.5 else "FAIL"
            rows.append(row)
        print(drive["id"], "max overlap", max(row["meshOverlapMm3"] for row in rows if row["drive"] == drive["id"]), flush=True)
    report = {"status": "PASS" if all(row["status"] == "PASS" for row in rows) else "FAIL", "variant": variant, "modelSha256": digest(design), "apiCalls": 0, "samples": rows, "scope": "One complete 16-tooth input pitch in this measured variant; conjugate output phase through production pose_matrix, actual COTS and generated custom teeth; no mesh exemptions.", "wallSeconds": time.perf_counter() - started}
    write_json(PACKET / ("gear-phase-" + variant + ("-quick" if quick else "") + ".json"), report)
    return report


if __name__ == "__main__":
    result = phase_checks("--quick" in sys.argv)
    print(json.dumps({"status": result["status"], "samples": len(result["samples"]), "wallSeconds": result["wallSeconds"]}))
    raise SystemExit(0 if result["status"] == "PASS" else 1)