import argparse
import hashlib
import importlib.metadata
import json
import math
import sys
from pathlib import Path

from OCP.Bnd import Bnd_Box
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepGProp import BRepGProp
from OCP.GeomAbs import GeomAbs_Cylinder, GeomAbs_Plane
from OCP.GProp import GProp_GProps
from OCP.IFSelect import IFSelect_RetDone
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TCollection import TCollection_AsciiString, TCollection_ExtendedString
from OCP.TColStd import TColStd_SequenceOfAsciiString
from OCP.TDataStd import TDataStd_Name
from OCP.TDF import TDF_Label, TDF_LabelSequence, TDF_Tool
from OCP.TDocStd import TDocStd_Document
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS
from OCP.XCAFDoc import XCAFDoc_DocumentTool, XCAFDoc_ShapeTool

ROOT = Path(__file__).resolve().parent


def owned_cache(value):
    path = (ROOT / value).resolve()
    if not path.is_relative_to(ROOT / "cache"):
        raise ValueError("Inputs must be in the owned cache")
    return path


def label_entry(label):
    result = TCollection_AsciiString()
    TDF_Tool.Entry_s(label, result)
    return result.ToCString()


def label_name(label):
    attribute = TDataStd_Name()
    return attribute.Get().ToExtString() if label.FindAttribute(TDataStd_Name.GetID_s(), attribute) else None


def bounds(shape):
    box = Bnd_Box()
    BRepBndLib.AddOptimal_s(shape, box, False, False)
    return list(box.Get())


def vector_values(value):
    return [value.X(), value.Y(), value.Z()]


def geometry(shape):
    solids = []
    explorer = TopExp_Explorer(shape, TopAbs_SOLID)
    while explorer.More():
        solid = explorer.Current()
        properties = GProp_GProps()
        BRepGProp.VolumeProperties_s(solid, properties)
        solids.append({"index": len(solids), "valid": BRepCheck_Analyzer(solid).IsValid(),
                       "volume_mm3": properties.Mass(), "bounds_mm": bounds(solid)})
        explorer.Next()
    faces = []
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = TopoDS.Face_s(explorer.Current())
        surface = BRepAdaptor_Surface(face)
        item = {"index": len(faces), "type": str(surface.GetType()), "bounds_mm": bounds(face)}
        if surface.GetType() == GeomAbs_Cylinder:
            cylinder = surface.Cylinder()
            item.update(radius_mm=cylinder.Radius(), axis_origin_mm=vector_values(cylinder.Location()),
                        axis_direction=vector_values(cylinder.Axis().Direction()))
        elif surface.GetType() == GeomAbs_Plane:
            plane = surface.Plane()
            item.update(origin_mm=vector_values(plane.Location()), normal=vector_values(plane.Axis().Direction()))
        faces.append(item)
        explorer.Next()
    box = bounds(shape)
    return {"valid": BRepCheck_Analyzer(shape).IsValid(), "solid_count": len(solids),
            "face_count": len(faces), "bounds_mm": box,
            "size_mm": [box[index + 3] - box[index] for index in range(3)],
            "volume_mm3": sum(solid["volume_mm3"] for solid in solids),
            "solids": solids, "analytic_faces": faces}


def inspect_step(path):
    reader = STEPCAFControl_Reader()
    reader.SetNameMode(True)
    reader.SetColorMode(True)
    status = reader.ReadFile(str(path))
    if status != IFSelect_RetDone:
        raise ValueError("STEP parser rejected asset")
    length, angle, solid_angle = (TColStd_SequenceOfAsciiString() for _ in range(3))
    reader.Reader().FileUnits(length, angle, solid_angle)
    declared = [length.Value(index).ToCString() for index in range(1, length.Length() + 1)]
    if not declared:
        raise ValueError("STEP representation has no established length units")
    reader.ChangeReader().SetSystemLengthUnit(1.0)
    document = TDocStd_Document(TCollection_ExtendedString("COTS"))
    if not reader.Transfer(document):
        raise ValueError("STEP XCAF transfer failed")
    shape_tool = XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)
    definitions = {}
    leaf_occurrences = []

    def visit(label, ancestry):
        entry = label_entry(label)
        if entry in ancestry:
            raise ValueError("Cyclic assembly hierarchy")
        definition = label
        if XCAFDoc_ShapeTool.IsReference_s(label):
            definition = TDF_Label()
            if not XCAFDoc_ShapeTool.GetReferredShape_s(label, definition):
                raise ValueError("Unresolved component reference")
        definition_id = label_entry(definition)
        transform = XCAFDoc_ShapeTool.GetLocation_s(label).Transformation()
        item = {"label": entry, "name": label_name(label), "definition_label": definition_id,
                "definition_name": label_name(definition),
                "local_transform_3x4": [[transform.Value(row, column) for column in range(1, 5)]
                                        for row in range(1, 4)], "children": []}
        components = TDF_LabelSequence()
        if XCAFDoc_ShapeTool.GetComponents_s(definition, components, False):
            item["children"] = [visit(components.Value(index), ancestry + [entry])
                                for index in range(1, components.Length() + 1)]
        else:
            if definition_id not in definitions:
                shape = XCAFDoc_ShapeTool.GetShape_s(definition)
                if shape.IsNull():
                    raise ValueError("Null source part")
                definitions[definition_id] = {"name": label_name(definition), **geometry(shape)}
            leaf_occurrences.append(definition_id)
        return item

    hierarchy = [visit(roots.Value(index), []) for index in range(1, roots.Length() + 1)]
    valid = bool(definitions) and all(item["valid"] and item["solid_count"] > 0
                                    and all(solid["valid"] and math.isfinite(solid["volume_mm3"])
                                            and solid["volume_mm3"] > 0 for solid in item["solids"])
                                    for item in definitions.values())
    return {"status": "PASS" if valid else "FAIL", "file": path.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size,
            "reader": "OpenCascade STEPCAFControl_Reader / XCAF",
            "declared_length_units": declared, "measurement_units": "mm",
            "transfer_system_length_unit_mm": reader.Reader().SystemLengthUnit(),
            "root_count": roots.Length(), "leaf_definition_count": len(definitions),
            "leaf_occurrence_count": len(leaf_occurrences),
            "occurrence_solid_count": sum(definitions[key]["solid_count"] for key in leaf_occurrences),
            "hierarchy": hierarchy, "definitions": definitions,
            "root_geometry": [geometry(XCAFDoc_ShapeTool.GetShape_s(roots.Value(index)))
                              for index in range(1, roots.Length() + 1)],
            "native_onshape_import_verified": False, "parametric_history": False,
            "note": "Original STEP bytes unchanged; local transforms retained, not flattened or fused."}


def inspect_pdf(path):
    import pypdfium2 as pdfium
    document = pdfium.PdfDocument(str(path))
    pages = []
    try:
        for index in range(len(document)):
            page = document[index]
            textpage = page.get_textpage()
            bitmap = page.render(scale=1.5)
            try:
                text = textpage.get_text_bounded()
                text_path = path.with_name(path.stem + f"-page-{index + 1}.txt")
                image_path = path.with_name(path.stem + f"-page-{index + 1}.png")
                text_path.write_text(text, encoding="utf8")
                image = bitmap.to_pil()
                image.save(image_path)
                image.close()
                pages.append({"page": index + 1, "text": text_path.relative_to(ROOT).as_posix(),
                              "image": image_path.relative_to(ROOT).as_posix()})
            finally:
                bitmap.close()
                textpage.close()
                page.close()
    finally:
        document.close()
    return {"file": path.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "pages": pages}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--step")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--pdf")
    arguments = parser.parse_args()
    if arguments.all:
        sources = json.loads((ROOT / "resolved-sources.json").read_text(encoding="utf8"))["sources"]
        paths = [source["cad_cache"] for source in sources] + ["cache/am-3462-rev2.step"]
        report = {"schema_version": 2, "environment": {"python_executable": sys.executable,
                  "cadquery_ocp": importlib.metadata.version("cadquery-ocp")}, "assets": {}}
        output = ROOT / "geometry-validation-v2.json"
        if output.exists():
            previous = json.loads(output.read_text(encoding="utf8"))
            if previous.get("schema_version") == 2 and previous.get("environment") == report["environment"]:
                report["assets"] = previous["assets"]
        for relative in paths:
            path = owned_cache(relative)
            if not path.exists():
                continue
            if report["assets"].get(relative, {}).get("sha256") == hashlib.sha256(path.read_bytes()).hexdigest():
                print("Reusing hash-matched validation: " + relative, flush=True)
                continue
            measured = inspect_step(path)
            report["assets"][relative] = measured
            (ROOT / "geometry-validation-v2.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
            print(json.dumps({key: measured[key] for key in ["file", "status", "declared_length_units",
                             "leaf_definition_count", "leaf_occurrence_count", "occurrence_solid_count"]}), flush=True)
        if len(report["assets"]) != len(paths) or any(item["status"] != "PASS" for item in report["assets"].values()):
            raise SystemExit(1)
        return
    if not arguments.step:
        parser.error("--step or --all is required")
    report = {"schema_version": 1, "environment": {"python_executable": sys.executable,
              "cadquery_ocp": importlib.metadata.version("cadquery-ocp"),
              "pypdfium2": importlib.metadata.version("pypdfium2")},
              "step": inspect_step(owned_cache(arguments.step))}
    if arguments.pdf:
        report["drawing"] = inspect_pdf(owned_cache(arguments.pdf))
    (ROOT / "geometry-validation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    print(json.dumps({key: report["step"][key] for key in
                      ["status", "declared_length_units", "root_count", "leaf_definition_count",
                       "leaf_occurrence_count", "occurrence_solid_count"]}))
    if report["step"]["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()