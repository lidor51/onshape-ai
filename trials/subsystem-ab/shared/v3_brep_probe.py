import json
from collections import Counter

import numpy as np
from OCP.Bnd import Bnd_Box, Bnd_OBB
from OCP.BRepBndLib import BRepBndLib

from cad_core import cq
from package_packet import transform_solid, write_json
from v3_model import PACKET, imported_product, source_bindings, source_body
from v3_sources import sha


def oriented_frame_check(original, restored):
    oriented = Bnd_OBB()
    BRepBndLib.AddOBB_s(original.wrapped, oriented, False, True, False)
    frame = np.eye(4)
    for index, direction in enumerate([oriented.XDirection(), oriented.YDirection(), oriented.ZDirection(), oriented.Center()]):
        frame[:3, index] = [direction.X(), direction.Y(), direction.Z()]
    inverse = np.linalg.inv(frame)
    boxes = []
    for shape in [original, restored]:
        box = Bnd_Box()
        BRepBndLib.AddOptimal_s(transform_solid(shape, inverse).wrapped, box, False, False)
        boxes.append(list(box.Get()))
    error = float(np.max(np.abs(np.array(boxes[0]) - boxes[1])))
    return {"method": "Exact B-rep bounds projected into the original source OBB frame, without triangulation or tolerance inflation; no transformed-AABB comparison.", "sourceObbFrameRowMajorMm": frame.tolist(), "sourceBoundsInObbMm": boxes[0], "readbackBoundsInObbMm": boxes[1], "maximumErrorMm": error, "budgetMm": 0.001, "status": "PASS" if error < 0.001 else "FAIL"}


def probe():
    from v3_roundtrip_probe import boundary_probe

    prior_path = PACKET / "original-source-roundtrip-probe.json"
    prior = json.loads(prior_path.read_text())
    rows = []
    for measurement in prior["rows"]:
        role = measurement["role"]
        print("Source OBB/B-rep", role, flush=True)
        binding = source_bindings()[role]
        path = PACKET / "source-probe" / (role + ".step")
        assert measurement["exportSha256"] == sha(path)
        assert measurement["sourceSha256"] == binding["sha256"]
        original = imported_product(binding["product"]).Solids()[binding["sourceBodyIndex"]]
        neutral = source_body(role)
        restored = transform_solid(cq.importers.importStep(str(path)).val(), np.linalg.inv(np.array(binding["sourceToNeutralRowMajorMm"])))
        partner = original.wrapped.IsPartner(neutral.wrapped)
        oriented = oriented_frame_check(original, restored)
        source_types = Counter(face.geomType() for face in original.Faces())
        restored_types = Counter(face.geomType() for face in restored.Faces())
        if source_types == restored_types:
            boundary = boundary_probe(original, restored)
        else:
            boundary = {"status": "FAIL_SURFACE_TYPE_COUNTS_CHANGED", "sourceSurfaceTypes": dict(source_types), "readbackSurfaceTypes": dict(restored_types), "surfaceSamples": "NOT_COMPARABLE_BY_EXISTING_PARAMETER_MATCHER"}
        correspondence = source_types == restored_types and boundary.get("maximumSurfaceSampleErrorMm", float("inf")) <= 1e-6 and boundary.get("vertexMaximumErrorMm", float("inf")) <= 1e-6
        boundary["correspondenceStatus"] = "PASS_SAMPLED_ONLY" if correspondence else "UNVERIFIED_PARAMETERIZATION_OR_SURFACE_DIFFERENCE"
        boundary["correspondenceBudgetMm"] = 1e-6
        boundary["caution"] = "UV parameter samples are not geometric nearest-surface distances. A mismatch cannot certify equivalence or alone prove material displacement. No scalar failure is waived."
        record = {"role": role, "sourceGeometryUnmodifiedIsPartner": partner, "orientedFrame": oriented, "boundary": boundary, "strictRoundTrip": measurement}
        record["status"] = "PASS" if partner and correspondence and oriented["status"] == "PASS" and measurement["status"] == "PASS" else "FAIL" if measurement["status"] == "FAIL" or not partner or oriented["status"] == "FAIL" else "UNVERIFIED"
        rows.append(record)
        write_json(PACKET / "source-brep-roundtrip-probe.json", {"status": "RUNNING", "rows": rows})
        print(json.dumps({"role": role, "status": record["status"], "sourceGeometryUnmodifiedIsPartner": partner, "obbErrorMm": oriented["maximumErrorMm"], "vertexErrorMm": boundary.get("vertexMaximumErrorMm"), "surfaceSampleErrorMm": boundary.get("maximumSurfaceSampleErrorMm"), "surfaceTypesMatch": source_types == restored_types, "volumeErrorMm3": measurement["volumeErrorMm3"]}), flush=True)
    report = {"status": "PASS" if all(row["status"] == "PASS" for row in rows) else "FAIL", "sourceProbeSha256": sha(prior_path), "apiCalls": 0, "scope": "Unchanged underlying source topology proven by IsPartner before export; STEP geometry equivalence is separately gated, not inferred from source identity or bounds. Boundary samples are not continuous Hausdorff proof. Original scalar budgets are unchanged.", "rows": rows}
    write_json(PACKET / "source-brep-roundtrip-probe.json", report)
    return report


if __name__ == "__main__":
    raise SystemExit(0 if probe()["status"] == "PASS" else 1)