import argparse
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, bounds, cq
import ezdxf
from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfgen import canvas


def flat_face(shape):
    planar = [face for face in shape.Faces() if face.geomType() == "PLANE" and abs(face.normalAt().z) > 0.999999]
    return max(planar, key=lambda face: face.Center().z)


def export_drawings():
    validation_path = ROOT / "validation.json"
    if not validation_path.exists():
        validation_path = ROOT / "quick-validation.json"
    report = json.loads(validation_path.read_text())
    if not report["gates"]["valid_brep_and_drilled_holes"]:
        raise RuntimeError("Flat-part dimensional gate has not passed; drawings withheld")
    manifest = json.loads((ROOT / "parts.json").read_text())
    folder = ROOT / "drawings"
    folder.mkdir(exist_ok=True)
    page_width, page_height = landscape(A3)
    document = canvas.Canvas(str(folder / "inspection-not-released.pdf"), pagesize=(page_width, page_height))
    results = []
    for name, definition in manifest["definitions"].items():
        if not definition["flat"]:
            continue
        shape = cq.importers.importStep(str(ROOT / definition["step"])).val()
        if not shape.isValid() or shape.Volume() <= 0:
            raise RuntimeError("Invalid reimported flat: " + name)
        extent = bounds(shape)
        face = flat_face(shape)
        dxf = ezdxf.new("R2010")
        dxf.units = ezdxf.units.MM
        dxf.layers.new("CUT_PROFILE", dxfattribs={"color": 7})
        dxf.layers.new("NOT_RELEASED", dxfattribs={"color": 1})
        modelspace = dxf.modelspace()
        paths = []
        for wire in face.Wires():
            points, _ = wire.sample(0.05)
            path = [(point.x, point.y) for point in points]
            if len(path) < 3:
                continue
            paths.append(path)
            modelspace.add_lwpolyline(path, close=True, dxfattribs={"layer": "CUT_PROFILE"})
        dxf_path = folder / (name + ".dxf")
        dxf.saveas(str(dxf_path))
        document.setFillColor(Color(0.65, 0.05, 0.04))
        document.setFont("Helvetica-Bold", 20)
        document.drawString(30, page_height - 34, "NOT RELEASED - INSPECTION / FIT REVIEW ONLY")
        document.setFillColor(Color(0, 0, 0))
        document.setFont("Helvetica-Bold", 14)
        document.drawString(30, page_height - 59, name)
        document.setFont("Helvetica", 10)
        document.drawString(30, page_height - 78, definition["material"] + " | quantity " + str(definition["quantity"]) + " | mm; no assumed drawing tolerance")
        document.drawString(30, page_height - 93, "DXF polylines sampled from actual B-rep wires at 0.05 mm deflection. Finish bores from dimensions, not tessellation.")
        width, height = extent[3] - extent[0], extent[4] - extent[1]
        scale = min((page_width * 0.62 - 100) / max(width, 1), (page_height - 230) / max(height, 1))
        origin = (65 - extent[0] * scale, 85 - extent[1] * scale)

        def page_point(point):
            return origin[0] + point[0] * scale, origin[1] + point[1] * scale

        document.setLineWidth(0.6)
        for path in paths:
            drawing = document.beginPath()
            drawing.moveTo(*page_point(path[0]))
            for point in path[1:]:
                drawing.lineTo(*page_point(point))
            drawing.close()
            document.drawPath(drawing)
        document.setFont("Helvetica", 10)
        left, bottom = page_point((extent[0], extent[1]))
        right, top = page_point((extent[3], extent[4]))
        document.line(left, bottom - 18, right, bottom - 18)
        for horizontal in (left, right):
            document.line(horizontal, bottom - 23, horizontal, bottom - 9)
        document.drawCentredString((left + right) / 2, bottom - 32, "Overall X = %.3f" % width)
        document.drawString(right + 12, (top + bottom) / 2, "Y %.3f" % height)
        table_x = page_width * 0.65
        table_y = page_height - 125
        document.setFont("Helvetica-Bold", 11)
        document.drawString(table_x, table_y, "HOLE CENTERS: LOCAL X / Y / DIAMETER (mm)")
        document.setFont("Courier", 9)
        for index, hole in enumerate(definition["holes"]):
            document.drawString(table_x, table_y - 18 - index * 12, "%02d  %9.3f %9.3f  D%7.3f" % (index + 1, *hole))
        document.setFont("Helvetica", 10)
        document.drawString(30, 43, "Thickness %.3f mm | all hole axes normal to sheet | no bends | datums local model origin" % (extent[5] - extent[2]))
        document.drawString(30, 28, "Assembly geometry FAIL / unresolved interfaces. No cutting authorization. Check machine, stock, fit, edge distances and tool access.")
        document.showPage()
        results.append({"part": name, "dxf": dxf_path.relative_to(ROOT).as_posix(), "wires": len(paths), "bounds_mm": extent, "holes": len(definition["holes"]), "status": "NOT RELEASED", "gate": "valid local B-rep and actual drilled holes only"})
    document.save()
    summary = {"status": "NOT RELEASED", "sheets": results, "count": len(results), "pdf": "drawings/inspection-not-released.pdf", "assembly_geometry_status": report["status"]}
    (folder / "manifest.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps({"sheets": len(results), "status": summary["status"]}))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    arguments = parser.parse_args()
    if arguments.self_test:
        sample = cq.Workplane("XY").rect(40, 30).extrude(6).faces(">Z").workplane().hole(5.5).val()
        face = flat_face(sample)
        wires = face.Wires()
        assert len(wires) == 2
        assert all(len(wire.sample(0.05)[0]) >= 3 for wire in wires)
        print("PASS: drawing extracts outer profile and actual circular hole from reimport-compatible B-rep")
    else:
        export_drawings()