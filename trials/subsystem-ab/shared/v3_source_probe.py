import json
import sys

import numpy as np

from cad_core import cq, solid_check
from package_packet import transform_solid, write_json
from v3_model import PACKET, imported_product, make_design, source_bindings, source_body
from v3_sources import sha


def probe():
    suffix = "-no-pcurves" if "--no-pcurves" in sys.argv else ""
    report_path = PACKET / ("original-source-roundtrip" + suffix + "-probe.json")
    design = make_design()
    bindings = source_bindings()
    assert "cots_x44_shaft" not in bindings
    assert len([binding for binding in bindings.values() if binding["product"] == "x44"]) == 2
    assert all("derivedPartition" not in binding for binding in bindings.values())
    rows = []
    for role, binding in bindings.items():
        print("Unmodified source round trip", role, flush=True)
        original = imported_product(binding["product"]).Solids()[binding["sourceBodyIndex"]]
        neutral = source_body(role)
        directory = PACKET / ("source-probe" + suffix)
        directory.mkdir(exist_ok=True)
        path = directory / (role + ".step")
        cq.exporters.export(neutral, str(path), opt={"write_pcurves": not bool(suffix)})
        imported = cq.importers.importStep(str(path)).val()
        restored = transform_solid(imported, np.linalg.inv(np.array(binding["sourceToNeutralRowMajorMm"])))
        source_measure = solid_check(original)
        actual = solid_check(restored)
        volume_error = abs(actual["volumeMm3"] - source_measure["volumeMm3"])
        bounds_error = float(np.max(np.abs(np.array(actual["boundsMm"]) - source_measure["boundsMm"])))
        budget = max(0.01, source_measure["volumeMm3"] * 1e-7)
        row = {"role": role, "sourceSha256": binding["sha256"], "exportSha256": sha(path), "sourceFrameMeasured": source_measure, "sourceFrameReimported": actual, "volumeErrorMm3": volume_error, "volumeBudgetMm3": budget, "sourceFrameBoundsMaximumErrorMm": bounds_error, "status": "PASS" if actual["valid"] and actual["closed"] and actual["solids"] == 1 and volume_error < budget and bounds_error < 0.001 else "FAIL"}
        rows.append(row)
        write_json(report_path, {"status": "RUNNING", "rows": rows})
        print(json.dumps(row), flush=True)
    report = {"status": "PASS" if all(row["status"] == "PASS" for row in rows) else "FAIL", "apiCalls": 0, "writePcurves": not bool(suffix), "nativeInstances": len(design["instances"]) - 1, "x44SourceBodies": 2, "inventedRotorBodies": 0, "rows": rows}
    write_json(report_path, report)
    print(json.dumps({key: value for key, value in report.items() if key != "rows"}), flush=True)
    return report


if __name__ == "__main__":
    raise SystemExit(0 if probe()["status"] == "PASS" else 1)