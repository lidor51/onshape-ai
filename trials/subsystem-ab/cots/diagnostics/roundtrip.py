import argparse
import hashlib
import importlib.metadata
import inspect
import json
import platform
import sys
import time
from collections import Counter
from pathlib import Path

import cadquery as cq
import numpy as np
import OCP
from OCP.Bnd import Bnd_Box
from OCP.BRep import BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepClass import BRepClass_FaceClassifier
from OCP.BRepExtrema import BRepExtrema_DistShapeShape
from OCP.BRepGProp import BRepGProp
from OCP.BRepTools import BRepTools
from OCP.GeomAPI import GeomAPI_ProjectPointOnSurf
from OCP.GProp import GProp_GProps
from OCP.TopAbs import TopAbs_IN
from OCP.gp import gp_Pnt, gp_Pnt2d, gp_Trsf


DIRECTORY = Path(__file__).resolve().parent
ROOT = DIRECTORY.parents[3]
PACKET = ROOT / "trials/subsystem-ab/shared/packet-v3"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bounds(shape):
    box = Bnd_Box()
    BRepBndLib.AddOptimal_s(shape.wrapped, box, False, False)
    return list(box.Get())


def rigid_transform(shape, matrix):
    assert np.max(np.abs(matrix[:3, :3].T @ matrix[:3, :3] - np.eye(3))) < 1e-10
    assert abs(np.linalg.det(matrix[:3, :3]) - 1) < 1e-10
    transform = gp_Trsf()
    transform.SetValues(*matrix[:3, :].ravel().tolist())
    return shape.moved(cq.Location(transform))


def closest_sample(point, boundary):
    vertex = cq.Vertex.makeVertex(*point)
    solver = BRepExtrema_DistShapeShape()
    solver.LoadS1(vertex.wrapped)
    solver.LoadS2(boundary.wrapped)
    solver.SetDeflection(1e-9)
    solver.Perform()
    if not solver.IsDone() or solver.NbSolution() == 0:
        raise RuntimeError("Closest boundary distance did not converge")
    nearest = solver.PointOnShape2(1)
    return {"distanceMm": solver.Value(), "pointMm": list(point),
            "closestPointMm": [nearest.X(), nearest.Y(), nearest.Z()]}


def closest_distance(point, boundary):
    return closest_sample(point, boundary)["distanceMm"]


class BoundaryIndex:
    def __init__(self, shape):
        self.faces = shape.Faces()
        boxes = np.array([bounds(face) for face in self.faces])
        self.minimum = boxes[:, :3] - 1e-6
        self.maximum = boxes[:, 3:] + 1e-6

    def nearest(self, point):
        offsets = np.maximum(np.maximum(self.minimum - point, point - self.maximum), 0)
        lower_bounds = np.linalg.norm(offsets, axis=1)
        best = {"distanceMm": float("inf")}
        for index in np.argsort(lower_bounds):
            if lower_bounds[index] > best["distanceMm"] + 1e-8:
                break
            result = closest_sample(point, self.faces[index])
            if result["distanceMm"] < best["distanceMm"]:
                best = {**result, "targetFaceIndex": int(index),
                        "targetSurfaceType": self.faces[index].geomType()}
        return best


def face_points(face, count):
    minimum_u, maximum_u, minimum_v, maximum_v = BRepTools.UVBounds_s(face.wrapped)
    surface = BRepAdaptor_Surface(face.wrapped)
    for fraction_u in (np.arange(count) + 0.5) / count:
        for fraction_v in (np.arange(count) + 0.5) / count:
            parameter_u = minimum_u + fraction_u * (maximum_u - minimum_u)
            parameter_v = minimum_v + fraction_v * (maximum_v - minimum_v)
            classifier = BRepClass_FaceClassifier(face.wrapped, gp_Pnt2d(parameter_u, parameter_v), 1e-9)
            if classifier.State() == TopAbs_IN:
                point = surface.Value(parameter_u, parameter_v)
                yield [point.X(), point.Y(), point.Z()]


def directed_boundary(source, target):
    target_index = BoundaryIndex(target)
    face_rows = []
    distances = []
    missing = []
    source_faces = source.Faces()
    for index, face in enumerate(source_faces):
        if index % 250 == 0:
            print("Boundary faces " + str(index) + "/" + str(len(source_faces)), flush=True)
        points = list(face_points(face, 3))
        if not points:
            points = list(face_points(face, 9))
        if not points:
            missing.append(index)
            continue
        samples = [target_index.nearest(point) for point in points]
        distances.extend(sample["distanceMm"] for sample in samples)
        face_rows.append({"sourceFaceIndex": index, "sourceSurfaceType": face.geomType(),
                          "samples": len(samples), "maximum": max(samples, key=lambda row: row["distanceMm"])})
    worst_faces = sorted(face_rows, key=lambda row: row["maximum"]["distanceMm"], reverse=True)[:8]
    for row in worst_faces:
        samples = [target_index.nearest(point) for point in face_points(source_faces[row["sourceFaceIndex"]], 9)]
        distances.extend(sample["distanceMm"] for sample in samples)
        row["refinedSamples"] = len(samples)
        if samples:
            row["maximum"] = max([row["maximum"], *samples], key=lambda sample: sample["distanceMm"])
    boundary_samples = []
    for vertex in source.Vertices():
        boundary_samples.append(target_index.nearest(list(vertex.Center().toTuple())))
    for edge in source.Edges():
        boundary_samples.append(target_index.nearest(list(edge.positionAt(0.5).toTuple())))
    surface_maximum = max(face_rows, key=lambda row: row["maximum"]["distanceMm"])
    boundary_maximum = max(boundary_samples, key=lambda row: row["distanceMm"])
    whole_boundary = cq.Compound.makeCompound(target.Faces())
    crosschecks = []
    for sample in [surface_maximum["maximum"], boundary_maximum]:
        brute = closest_distance(sample["pointMm"], whole_boundary)
        crosschecks.append(abs(brute - sample["distanceMm"]))
    return {"faceCount": len(source_faces), "facesSampled": len(face_rows), "uncoveredFaceIndices": missing,
            "surfaceSamples": len(distances), "surfaceMaximumMm": max(distances),
            "surfacePercentile95Mm": float(np.percentile(distances, 95)),
            "vertexAndEdgeMidpointSamples": len(boundary_samples), "vertexAndEdgeMaximum": boundary_maximum,
            "worstFaces": sorted(face_rows, key=lambda row: row["maximum"]["distanceMm"], reverse=True)[:12],
            "unprunedCompoundCrosscheckErrorMm": crosschecks}


def properties(shape, method, epsilon=None):
    result = GProp_GProps()
    if method == "default":
        BRepGProp.VolumeProperties_s(shape.wrapped, result)
        estimate = None
    elif method == "gauss":
        estimate = BRepGProp.VolumeProperties_s(shape.wrapped, result, float(epsilon), True, False)
    else:
        estimate = BRepGProp.VolumePropertiesGK_s(shape.wrapped, result, float(epsilon), True, True, True, True, False)
        if estimate < 0:
            raise RuntimeError("Adaptive Gauss-Kronrod failed")
    center = result.CentreOfMass()
    inertia = result.MatrixOfInertia()
    return {"method": method, "requestedRelativeEpsilon": epsilon, "estimatedRelativeError": estimate,
            "volumeMm3": result.Mass(), "centroidMm": [center.X(), center.Y(), center.Z()],
            "centroidalInertiaMm5UnitDensity": [[inertia.Value(row, column) for column in range(1, 4)] for row in range(1, 4)]}


def metric_pair(source, target, method, epsilon=None):
    original = properties(source, method, epsilon)
    restored = properties(target, method, epsilon)
    original_inertia = np.array(original["centroidalInertiaMm5UnitDensity"])
    restored_inertia = np.array(restored["centroidalInertiaMm5UnitDensity"])
    return {"source": original, "readback": restored,
            "volumeDifferenceMm3": restored["volumeMm3"] - original["volumeMm3"],
            "centroidDistanceMm": float(np.linalg.norm(np.array(original["centroidMm"]) - restored["centroidMm"])),
            "inertiaRelativeFrobeniusError": float(np.linalg.norm(restored_inertia - original_inertia) / np.linalg.norm(original_inertia))}


def geometry_summary(shape):
    return {"valid": shape.isValid(), "solids": len(shape.Solids()), "closed": shape.Closed(),
            "boundsMm": bounds(shape), "areaMm2DefaultIntegration": shape.Area(),
            "surfaceTypes": dict(Counter(face.geomType() for face in shape.Faces())),
            "maximumKernelToleranceMm": max(BRep_Tool.Tolerance_s(item.wrapped)
                                           for item in [*shape.Vertices(), *shape.Edges(), *shape.Faces()])}


def probe(roles):
    bindings_path = PACKET / "current/cots-bindings.json"
    scalar_path = PACKET / "original-source-roundtrip-probe.json"
    bindings = json.loads(bindings_path.read_text())["bindings"]
    scalar_rows = {row["role"]: row for row in json.loads(scalar_path.read_text())["rows"]}
    imported = {}
    for role in roles:
        started = time.monotonic()
        binding = bindings[role]
        source_path = ROOT / binding["sourceFile"]
        target_path = PACKET / "source-probe" / (role + ".step")
        hashes = {str(path.relative_to(ROOT)): sha(path) for path in [source_path, target_path, bindings_path, scalar_path]}
        assert sha(source_path) == binding["sha256"] == scalar_rows[role]["sourceSha256"]
        assert sha(target_path) == scalar_rows[role]["exportSha256"]
        if source_path not in imported:
            imported[source_path] = cq.importers.importStep(str(source_path)).val()
        source = imported[source_path].Solids()[binding["sourceBodyIndex"]]
        target = rigid_transform(cq.importers.importStep(str(target_path)).val(),
                                 np.linalg.inv(np.array(binding["sourceToNeutralRowMajorMm"])))
        print("Measuring " + role, flush=True)
        row = {"status": "DIAGNOSTIC_ONLY_NOT_CERTIFICATION", "role": role, "environment": environment(),
               "inputSha256": hashes, "sourceBodyIndex": binding["sourceBodyIndex"],
               "originalStrictGate": scalar_rows[role], "source": geometry_summary(source),
               "readback": geometry_summary(target), "integrations": [], "completed": False,
               "gaussKronrodCorpusStatus": "OMITTED_AFTER_BOUNDED_BEARING_RUN_DID_NOT_COMPLETE"}
        output_path = DIRECTORY / (role + ".json")
        row["bboxMaximumDifferenceMm"] = float(np.max(np.abs(np.array(row["source"]["boundsMm"]) - row["readback"]["boundsMm"])))
        for method, epsilon in [("default", None), ("gauss", 1e-7), ("gauss", 1e-9)]:
            measurement = metric_pair(source, target, method, epsilon)
            row["integrations"].append(measurement)
            output_path.write_text(json.dumps(row, indent=2) + "\n")
            print(json.dumps({"role": role, "method": method, "epsilon": epsilon,
                              "volumeDifferenceMm3": measurement["volumeDifferenceMm3"]}), flush=True)
        for name, first, second in [("sourceToReadback", source, target), ("readbackToSource", target, source)]:
            row[name] = directed_boundary(first, second)
            output_path.write_text(json.dumps(row, indent=2) + "\n")
            print(json.dumps({"role": role, "direction": name, "surfaceMaximumMm": row[name]["surfaceMaximumMm"]}), flush=True)
        row["inputBytesUnchanged"] = all(sha(ROOT / path) == digest for path, digest in hashes.items())
        assert row["inputBytesUnchanged"]
        row["elapsedSeconds"] = time.monotonic() - started
        row["completed"] = True
        output_path.write_text(json.dumps(row, indent=2) + "\n")
        print(json.dumps({"role": role, "completedSeconds": row["elapsedSeconds"]}), flush=True)


def environment():
    versions = {}
    for package in ["cadquery", "cadquery-ocp", "build123d", "vtk", "numpy"]:
        try:
            versions[package] = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            versions[package] = None
    return {"python": platform.python_version(), "executable": sys.executable,
            "OCP_module_version": getattr(OCP, "__version__", None), "packages": versions}


def cover_witnesses():
    role = "cots_x44_rear_cover"
    previous = json.loads((DIRECTORY / (role + ".json")).read_text())
    for path, digest in previous["inputSha256"].items():
        assert sha(ROOT / path) == digest
    binding = json.loads((PACKET / "current/cots-bindings.json").read_text())["bindings"][role]
    source = cq.importers.importStep(str(ROOT / binding["sourceFile"])).val().Solids()[binding["sourceBodyIndex"]]
    target = rigid_transform(cq.importers.importStep(str(PACKET / "source-probe" / (role + ".step"))).val(),
                             np.linalg.inv(np.array(binding["sourceToNeutralRowMajorMm"])))
    rows = []
    for direction, original, other in [("sourceToReadback", source, target), ("readbackToSource", target, source)]:
        witness = previous[direction]["worstFaces"][0]
        coordinates = witness["maximum"]["pointMm"]
        face_index = witness["sourceFaceIndex"]
        own_face = original.Faces()[face_index]
        candidate = other.Faces()[face_index]
        projection = GeomAPI_ProjectPointOnSurf(gp_Pnt(*coordinates), BRep_Tool.Surface_s(candidate.wrapped))
        projections = []
        for index in range(1, projection.NbPoints() + 1):
            parameter_u, parameter_v = projection.Parameters(index)
            classification = BRepClass_FaceClassifier(candidate.wrapped, gp_Pnt2d(parameter_u, parameter_v), 1e-9)
            projections.append({"distanceMm": projection.Distance(index), "uv": [parameter_u, parameter_v],
                                "trimState": str(classification.State())})
        row = {"direction": direction, "faceIndex": face_index, "pointMm": coordinates,
               "ownSurfaceType": own_face.geomType(), "oppositeCandidateSurfaceType": candidate.geomType(),
               "ownTrimmedFaceDistanceMm": closest_distance(coordinates, own_face),
               "oppositeTrimmedFaceDistanceMm": closest_distance(coordinates, candidate),
               "oppositeWholeBoundaryDistanceMm": closest_distance(coordinates, cq.Compound.makeCompound(other.Faces())),
               "oppositeSupportProjections": sorted(projections, key=lambda item: item["distanceMm"]),
               "ownUvBounds": list(BRepTools.UVBounds_s(own_face.wrapped)),
               "oppositeUvBounds": list(BRepTools.UVBounds_s(candidate.wrapped)),
               "ownFaceToleranceMm": BRep_Tool.Tolerance_s(own_face.wrapped),
               "oppositeFaceToleranceMm": BRep_Tool.Tolerance_s(candidate.wrapped),
               "ownMaximumEdgeToleranceMm": max(BRep_Tool.Tolerance_s(edge.wrapped) for edge in own_face.Edges()),
               "oppositeMaximumEdgeToleranceMm": max(BRep_Tool.Tolerance_s(edge.wrapped) for edge in candidate.Edges())}
        assert row["ownTrimmedFaceDistanceMm"] < 1e-7
        rows.append(row)
    report = {"status": "DIAGNOSTIC_WITNESSES_NOT_CERTIFICATION", "environment": environment(),
              "inputSha256": previous["inputSha256"], "rows": rows}
    (DIRECTORY / "cover-witnesses.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


def self_test():
    box = cq.Solid.makeBox(10, 10, 10)
    boundary = cq.Compound.makeCompound(box.Faces())
    assert closest_distance((5, 5, 0), boundary) < 1e-9
    assert abs(closest_distance((5, 5, 0.02), boundary) - 0.02) < 1e-9
    assert abs(closest_distance((11, 5, 0), boundary) - 1) < 1e-9
    cylinder = cq.Solid.makeCylinder(5, 10).rotate((0, 0, 0), (0, 0, 1), 37)
    assert closest_distance((5, 0, 5), cq.Compound.makeCompound(cylinder.Faces())) < 1e-9
    indexed = BoundaryIndex(box)
    for point in [(5, 5, 0), (5, 5, 0.02), (11, 5, 0)]:
        assert abs(indexed.nearest(point)["distanceMm"] - closest_distance(point, boundary)) < 1e-9
    comparison = directed_boundary(box, box.translate((0, 0, 0.02)))
    assert abs(comparison["surfaceMaximumMm"] - 0.02) < 1e-9
    assert comparison["facesSampled"] == 6
    assert max(comparison["unprunedCompoundCrosscheckErrorMm"]) < 1e-9
    for method in ["default", "gauss", "kronrod"]:
        result = properties(box, method, 1e-9)
        assert abs(result["volumeMm3"] - 1000) < 1e-6
        assert np.linalg.norm(np.array(result["centroidMm"]) - [5, 5, 5]) < 1e-8
        assert abs(result["centroidalInertiaMm5UnitDensity"][0][0] - 1000 * 200 / 12) < 1e-4
    print(json.dumps({"self_test": "PASS", "environment": environment(),
                      "cadqueryVolumeSource": inspect.getsource(cq.Shape.Volume),
                      "adaptive_volume_api": BRepGProp.VolumePropertiesGK_s.__doc__}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--cover-witnesses", action="store_true")
    parser.add_argument("--roles", nargs="+", default=["cots_hex_bearing", "cots_x44_rear_cover", "cots_x44_main"],
                        choices=["cots_hex_bearing", "cots_x44_rear_cover", "cots_x44_main"])
    arguments = parser.parse_args()
    if arguments.self_test:
        self_test()
    elif arguments.cover_witnesses:
        cover_witnesses()
    else:
        probe(arguments.roles)