import hashlib
import math
from pathlib import Path

import cadquery as cq
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.IFSelect import IFSelect_RetDone
from OCP.STEPControl import STEPControl_Reader
from OCP.TColStd import TColStd_SequenceOfAsciiString


class Rejected(ValueError):
    pass


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def require(condition, message):
    if not condition:
        raise Rejected(message)


def close(actual, expected, tolerance=0.01):
    require(math.isfinite(actual) and abs(actual - expected) <= tolerance,
            f"Geometry mismatch: {actual} versus {expected}")


def extract(step_path):
    reader = STEPControl_Reader()
    require(reader.ReadFile(str(step_path)) == IFSelect_RetDone, "Unreadable STEP")
    lengths = TColStd_SequenceOfAsciiString()
    angles = TColStd_SequenceOfAsciiString()
    solids = TColStd_SequenceOfAsciiString()
    reader.FileUnits(lengths, angles, solids)
    units = [lengths.Value(index).ToCString().lower() for index in range(1, lengths.Length() + 1)]
    require(units in (["millimetre"], ["metre"]), f"STEP must declare millimeters or meters: {units}")
    shape = cq.importers.importStep(str(step_path)).val()
    require(shape.isValid() and len(shape.Solids()) == 1, "Expected one valid solid")
    result = inspect_shape(shape)
    result["step_declared_units"] = units
    result["step_import_length_unit"] = "mm"
    return result


def inspect_shape(shape):
    require(shape.isValid() and len(shape.Solids()) == 1, "Expected one valid solid")
    bounds = shape.BoundingBox()
    thickness = bounds.xlen
    require(thickness > 0 and bounds.ylen > thickness and bounds.zlen > thickness,
            "Not an X-normal flat plate")
    broad_faces = []
    holes = []
    side_faces = []
    for face in shape.Faces():
        face_bounds = face.BoundingBox()
        kind = face.geomType()
        if kind == "PLANE":
            normal = face.normalAt()
            if abs(normal.x) > 1 - 1e-7:
                broad_faces.append(face)
            else:
                require(max(abs(normal.y), abs(normal.z)) > 1 - 1e-7,
                        "Unsupported angled side face")
                close(face_bounds.xlen, thickness, 1e-5)
                side_faces.append(face)
        elif kind == "CYLINDER":
            cylinder = BRepAdaptor_Surface(face.wrapped).Cylinder()
            axis = cylinder.Axis()
            require(abs(axis.Direction().X()) > 1 - 1e-7, "Non-normal bore")
            close(face_bounds.xmin, bounds.xmin, 1e-5)
            close(face_bounds.xmax, bounds.xmax, 1e-5)
            radius = cylinder.Radius()
            close(face.Area(), 2 * math.pi * radius * thickness, 1e-4)
            holes.append({"u": axis.Location().Y(), "v": axis.Location().Z() - 12.7,
                          "diameter": 2 * radius})
        else:
            raise Rejected(f"Unsupported surface: {kind}")
    require(len(broad_faces) == 2 and len(side_faces) == 4, "Ambiguous or nonconstant plate faces")
    for face in broad_faces:
        face_bounds = face.BoundingBox()
        close(face_bounds.xlen, 0, 1e-5)
        require(min(abs(face.Center().x - bounds.xmin), abs(face.Center().x - bounds.xmax)) < 1e-5,
                "Internal/blind planar face")
        outer = face.outerWire()
        require(len(outer.Edges()) == 4 and all(edge.geomType() == "LINE" for edge in outer.Edges()),
                "Only rectangular outer profiles supported")
        require(len(face.innerWires()) == len(holes), "Hole wire count mismatch")
        for wire in face.innerWires():
            edges = wire.Edges()
            require(len(edges) == 1 and edges[0].geomType() == "CIRCLE" and wire.IsClosed(),
                    "Only full circular through-holes supported")
            center = edges[0].arcCenter()
            require(any(abs(center.y - hole["u"]) < 1e-5 and
                        abs(center.z - 12.7 - hole["v"]) < 1e-5 and
                        abs(edges[0].radius() * 2 - hole["diameter"]) < 1e-5 for hole in holes),
                    "Bore and end-face disagreement")
    holes.sort(key=lambda hole: (hole["u"], hole["v"]))
    for index, hole in enumerate(holes, 1):
        hole["key"] = f"H{index}"
    outer = [[bounds.ymin, bounds.zmin - 12.7], [bounds.ymax, bounds.zmin - 12.7],
             [bounds.ymax, bounds.zmax - 12.7], [bounds.ymin, bounds.zmax - 12.7]]
    result = {"units": "mm", "solid_count": 1, "thickness": thickness,
              "width": bounds.ylen, "height": bounds.zlen, "volume": shape.Volume(),
              "world_bounds": [bounds.xmin, bounds.ymin, bounds.zmin,
                               bounds.xmax, bounds.ymax, bounds.zmax],
              "outer": outer, "holes": holes, "transform": "u=Y; v=Z-12.7; normal=+X"}
    expected_volume = (bounds.ylen * bounds.zlen - sum(math.pi * (hole["diameter"] / 2) ** 2
                                                     for hole in holes)) * thickness
    close(result["volume"], expected_volume, max(0.1, expected_volume * 1e-6))
    return result


def compare(actual, expected):
    require(actual["units"] == expected["units"] == "mm", "Wrong measurement units")
    require(actual["solid_count"] == expected["solid_count"] == 1, "Solid count mismatch")
    for key in ("thickness", "width", "height"):
        close(actual[key], expected[key])
    for left, right in zip(actual["world_bounds"], expected["world_bounds"], strict=True):
        close(left, right)
    close(actual["volume"], expected["volume"], max(0.1, 1e-6 * expected["volume"]))
    require(len(actual["holes"]) == len(expected["holes"]), "Hole count mismatch")
    measured = sorted(expected["holes"], key=lambda hole: (hole["u"], hole["v"]))
    for left, right in zip(actual["holes"], measured, strict=True):
        for key in ("u", "v", "diameter"):
            close(left[key], right[key])


def validate_snapshot(step_path, manifest, revision):
    require(manifest["revision"] == revision, "Mixed revision")
    require(manifest["step_sha256"] == digest(step_path), "Stale STEP manifest")
    require(manifest["state"] == manifest["measurement_state"] == manifest["export_state"],
            "Mixed source states")
    require(manifest["state"]["configuration"] == "default", "Unsupported configuration")
    result = extract(step_path)
    compare(result, manifest["measurements"])
    return result