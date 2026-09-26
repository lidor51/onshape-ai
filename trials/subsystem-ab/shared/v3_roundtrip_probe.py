import json
import sys

import numpy as np
from OCP.BRep import BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepTools import BRepTools

from cad_core import cq, solid_check
from package_packet import write_json
from v3_model import PACKET, source_body


def boundary_probe(original, imported):
    source_vertices = np.array([vertex.Center().toTuple() for vertex in original.Vertices()])
    target_vertices = np.array([vertex.Center().toTuple() for vertex in imported.Vertices()])
    distances = np.linalg.norm(source_vertices[:, None, :] - target_vertices[None, :, :], axis=2)
    source_faces, target_faces = original.Faces(), imported.Faces()
    target_centers = np.array([face.Center().toTuple() for face in target_faces])
    target_types = [face.geomType() for face in target_faces]
    unmatched = set(range(len(target_faces)))
    face_rows = []
    for source_face in source_faces:
        surface_type = source_face.geomType()
        candidates = [index for index in unmatched if target_types[index] == surface_type]
        if not candidates:
            raise ValueError("Missing corresponding surface type")
        center = np.array(source_face.Center().toTuple())
        target_index = candidates[int(np.argmin(np.linalg.norm(target_centers[candidates] - center, axis=1)))]
        target_face = target_faces[target_index]
        unmatched.remove(target_index)
        source_uv = BRepTools.UVBounds_s(source_face.wrapped)
        target_uv = BRepTools.UVBounds_s(target_face.wrapped)
        source_surface = BRepAdaptor_Surface(source_face.wrapped)
        target_surface = BRepAdaptor_Surface(target_face.wrapped)
        errors = []
        for fraction_u in np.linspace(0, 1, 5):
            for fraction_v in np.linspace(0, 1, 5):
                source_point = source_surface.Value(source_uv[0] + fraction_u * (source_uv[1] - source_uv[0]), source_uv[2] + fraction_v * (source_uv[3] - source_uv[2]))
                target_point = target_surface.Value(target_uv[0] + fraction_u * (target_uv[1] - target_uv[0]), target_uv[2] + fraction_v * (target_uv[3] - target_uv[2]))
                errors.append(source_point.Distance(target_point))
        face_rows.append({"type": surface_type, "areaErrorMm2": abs(source_face.Area() - target_face.Area()), "uvBoundsMaximumError": float(np.max(np.abs(np.array(source_uv) - target_uv))), "parameterSampleMaximumErrorMm": max(errors)})
    shift = tuple(-coordinate for coordinate in original.Center().toTuple())
    return {"method": "Bidirectional vertex nearest distances; 25 corresponding UV samples per matched surface, including untrimmed UV rectangle. Sampled evidence, not continuous Hausdorff proof.", "sourceTopology": {"vertices": len(source_vertices), "edges": len(original.Edges()), "faces": len(source_faces)}, "targetTopology": {"vertices": len(target_vertices), "edges": len(imported.Edges()), "faces": len(target_faces)}, "vertexMaximumErrorMm": float(max(distances.min(axis=0).max(), distances.min(axis=1).max())), "sourceAreaMm2": original.Area(), "targetAreaMm2": imported.Area(), "areaErrorMm2": abs(original.Area() - imported.Area()), "maximumKernelToleranceMm": max(BRep_Tool.Tolerance_s(vertex.wrapped) for shape in [original, imported] for vertex in shape.Vertices()), "maximumSurfaceSampleErrorMm": max(row["parameterSampleMaximumErrorMm"] for row in face_rows), "faces": face_rows, "recenteredVolume": {"translationMm": shift, "sourceMm3": original.translate(shift).Volume(tol=1e-9), "targetMm3": imported.translate(shift).Volume(tol=1e-9)}}


def probe():
    path = PACKET / "source-probe" / "cots_x44_main.step"
    print("Reimport unchanged X44 presentation body", flush=True)
    imported = cq.importers.importStep(str(path)).val()
    actual = solid_check(imported)
    original = source_body("cots_x44_main")
    prior = solid_check(original)
    record = {"actual": actual, "previousQuickMeasured": prior, "volumeErrorMm3": abs(actual["volumeMm3"] - prior["volumeMm3"]), "boundsErrorsMm": (np.array(actual["boundsMm"]) - prior["boundsMm"]).tolist()}
    if "--boundary-only" in sys.argv:
        record["integrationStatus"] = "NOT_REPEATED_FOR_CURRENT_UNPARTITIONED_BODY"
    else:
        print("Compare tighter volume integration", flush=True)
        record["integration"] = []
        for tolerance in [1e-7, 1e-9]:
            source_volume = original.Volume(tol=tolerance)
            imported_volume = imported.Volume(tol=tolerance)
            record["integration"].append({"tolerance": tolerance, "sourceMm3": source_volume, "reimportedMm3": imported_volume, "errorMm3": abs(source_volume - imported_volume)})
        write_json(PACKET / "x44-original-integration-probe.json", record)
    print("Compare boundary and rigid-translation integrals", flush=True)
    record["boundary"] = boundary_probe(original, imported)
    record["status"] = "PASS" if record["volumeErrorMm3"] < max(0.01, prior["volumeMm3"] * 1e-7) and np.max(np.abs(record["boundsErrorsMm"])) < 0.001 else "FAIL"
    write_json(PACKET / "x44-original-boundary-probe.json", record)
    print(json.dumps({**record, "boundary": {key: value for key, value in record["boundary"].items() if key != "faces"}}, indent=2), flush=True)
    return record


if __name__ == "__main__":
    raise SystemExit(0 if probe()["status"] == "PASS" else 1)