import ctypes
import importlib.metadata
import json
import math
from contextlib import contextmanager, ExitStack
from pathlib import Path
from unittest.mock import patch

import cadquery as cq
import ezdxf
import matplotlib
import pypdfium2 as pdfium
from pypdf import PdfReader
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

from geometry import close, compare, digest, inspect_shape, require, validate_snapshot

ROOT = Path(__file__).resolve().parent
STATUS = "EXPERIMENT - NOT FOR MANUFACTURE"
PACKAGES = ["cadquery", "cadquery-ocp", "casadi", "ezdxf", "reportlab", "pypdf",
            "pypdfium2", "Pillow", "matplotlib", "pytest"]


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


@contextmanager
def no_network():
    events = {"blocked_attempts": 0, "authenticated_calls": 0}

    def blocked(*args, **kwargs):
        events["blocked_attempts"] += 1
        raise RuntimeError("Offline socket guard: network forbidden")

    with ExitStack() as stack:
        for target in ("socket.socket.connect", "socket.socket.connect_ex", "socket.socket.sendto",
                       "socket.create_connection", "socket.getaddrinfo"):
            stack.enter_context(patch(target, blocked))
        yield events


def intent_status(intent):
    fields = ["part_number", "description", "material", "quantity", "thickness_source",
              "outer_tolerance_mm", "thickness_tolerance_mm", "hole_diameter_tolerance_mm",
              "hole_coordinate_tolerance_mm", "finish", "date"]
    complete = all(intent.get(field) not in (None, "", "UNKNOWN") for field in fields)
    tolerances = all(isinstance(intent.get(field), (int, float)) and
                     math.isfinite(intent[field]) and intent[field] > 0
                     for field in fields if field.endswith("_mm"))
    return "TEST_ONLY" if (complete and tolerances and intent.get("test_assumptions_acknowledged") is True
                           and intent.get("release_status") == "TEST_ONLY"
                           and intent.get("approval") is None) else "INTENT_UNVERIFIED"


def export_dxf(path, geometry):
    document = ezdxf.new("R2013", units=ezdxf.units.MM)
    document.header["$MEASUREMENT"] = 1
    document.header["$INSBASE"] = (0, 0, 0)
    document.layers.new("CUT", dxfattribs={"color": 7})
    model = document.modelspace()
    model.add_lwpolyline(geometry["outer"], close=True, dxfattribs={"layer": "CUT"})
    for hole in geometry["holes"]:
        model.add_circle((hole["u"], hole["v"]), hole["diameter"] / 2,
                         dxfattribs={"layer": "CUT"})
    document.saveas(path)


def validate_dxf(path, geometry):
    document = ezdxf.readfile(path)
    require(not document.audit().has_errors, "DXF audit failed")
    require(document.units == ezdxf.units.MM and document.header["$MEASUREMENT"] == 1,
            "DXF units must be mm")
    entities = list(document.modelspace())
    loops = [entity for entity in entities if entity.dxftype() == "LWPOLYLINE"]
    circles = [entity for entity in entities if entity.dxftype() == "CIRCLE"]
    require(len(loops) == 1 and len(circles) == len(geometry["holes"]) and
            len(entities) == len(circles) + 1, "Unexpected DXF entities or duplicate/missing loops")
    require(all(entity.dxf.layer == "CUT" for entity in entities), "Non-cutting layer geometry")
    loop = loops[0]
    require(loop.closed and len(loop) == 4 and not loop.has_arc, "Invalid exterior loop")
    require(not loop.has_width and loop.dxf.elevation == 0, "Unsupported polyline width/elevation")
    require(tuple(loop.dxf.extrusion) == (0, 0, 1), "Wrong DXF normal")
    points = list(loop.get_points("xy"))
    for actual, expected in zip(points, geometry["outer"], strict=True):
        close(actual[0], expected[0])
        close(actual[1], expected[1])
    measured_holes = []
    for circle in circles:
        require(tuple(circle.dxf.extrusion) == (0, 0, 1) and circle.dxf.center.z == 0,
                "Wrong circle plane")
        measured_holes.append({"u": circle.dxf.center.x, "v": circle.dxf.center.y,
                               "diameter": 2 * circle.dxf.radius})
    roundtrip = cq.importers.importDXF(str(path)).wires().toPending().extrude(geometry["thickness"]).val()
    roundtrip = roundtrip.rotate((0, 0, 0), (1, 1, 1), 120)
    roundtrip = roundtrip.translate((geometry["world_bounds"][0], 0, 12.7))
    rebuilt = inspect_shape(roundtrip)
    compare(rebuilt, geometry)
    circle_check = dict(geometry, holes=measured_holes)
    compare(circle_check, geometry)
    return {"status": "PASS", "reconstructed_solid_count": 1,
            "hole_count": len(circles), "volume_mm3": rebuilt["volume"],
            "checks": ["units", "closed loops", "no duplicate/annotation entities", "hole centers",
                       "hole diameters", "thickness", "world bounds", "volume", "valid BRep"]}


class Sheet:
    def __init__(self, path):
        font = Path(matplotlib.get_data_path()) / "fonts/ttf/DejaVuSans.ttf"
        pdfmetrics.registerFont(TTFont("Drawing", str(font)))
        self.canvas = Canvas(str(path), pagesize=landscape(A3), invariant=1, initialFontName="Drawing")
        self.canvas.setTitle(STATUS)
        self.text_boxes = []

    def text(self, horizontal, vertical, text, size=9, centered=False):
        text = str(text)
        glyphs = pdfmetrics.getFont("Drawing").face.charToGlyph
        require(all(ord(character) in glyphs for character in text), "Missing PDF font glyph")
        width = pdfmetrics.stringWidth(text, "Drawing", size) / mm
        left = horizontal - width / 2 if centered else horizontal
        box = [left, vertical - size / mm * 0.25, left + width, vertical + size / mm]
        require(box[0] >= 10 and box[2] <= 410 and box[1] >= 10 and box[3] <= 287,
                f"PDF text outside margins: {text}")
        for previous in self.text_boxes:
            other = previous["box"]
            intersects = min(box[2], other[2]) - max(box[0], other[0]) > 0.2 and \
                         min(box[3], other[3]) - max(box[1], other[1]) > 0.2
            require(not intersects, f"PDF text overlap: {text} / {previous['text']}")
        self.text_boxes.append({"text": text, "box": box})
        self.canvas.setFont("Drawing", size)
        self.canvas.drawString(left * mm, vertical * mm, text)

    def line(self, start, end, width=0.2):
        self.canvas.setLineWidth(width * mm)
        self.canvas.line(start[0] * mm, start[1] * mm, end[0] * mm, end[1] * mm)

    def arrow(self, point, direction):
        horizontal, vertical = point
        along, across = direction
        self.line(point, (horizontal + along * 2 + across * 0.65,
                          vertical + across * 2 - along * 0.65))
        self.line(point, (horizontal + along * 2 - across * 0.65,
                          vertical + across * 2 + along * 0.65))

    def dimension(self, start, end, ordinate, value):
        self.line((start, ordinate), (end, ordinate))
        self.arrow((start, ordinate), (1, 0))
        self.arrow((end, ordinate), (-1, 0))
        self.text((start + end) / 2, ordinate + 2, value, centered=True)


def draw_pdf(path, geometry, intent, revision, source_kind):
    sheet = Sheet(path)
    canvas = sheet.canvas
    canvas.rect(10 * mm, 10 * mm, 400 * mm, 277 * mm)
    sheet.text(210, 278, STATUS, 16, centered=True)
    sheet.text(210, 268, f"{source_kind} | NOT ONSHAPE EVIDENCE" if source_kind == "LOCAL_SYNTHETIC"
               else "ONSHAPE SNAPSHOT | ENGINEERING REVIEW REQUIRED", 10, centered=True)
    sheet.line((10, 263), (410, 263))
    sheet.text(45, 251, "PRINCIPAL VIEW - looking along -X", 10)
    sheet.text(45, 244, "THIRD-ANGLE ORTHOGRAPHIC PROJECTION | SCALE 1:2", 9)
    origin_u, origin_v = 45, 145
    scale = 0.5
    project = lambda point: (origin_u + point[0] * scale, origin_v + point[1] * scale)
    for start, end in zip(geometry["outer"], geometry["outer"][1:] + geometry["outer"][:1]):
        sheet.line(project(start), project(end), 0.35)
    for hole in geometry["holes"]:
        center_u, center_v = project((hole["u"], hole["v"]))
        radius = hole["diameter"] / 4
        canvas.setLineWidth(0.25 * mm)
        canvas.circle(center_u * mm, center_v * mm, radius * mm)
        sheet.line((center_u - radius - 1, center_v), (center_u + radius + 1, center_v), 0.1)
        sheet.line((center_u, center_v - radius - 1), (center_u, center_v + radius + 1), 0.1)
        sheet.line((center_u + radius * 0.707, center_v + radius * 0.707),
                   (center_u + radius + 3, center_v + radius + 4), 0.15)
        sheet.text(center_u + radius + 3.5, center_v + radius + 4, hole["key"], 9)
    sheet.line((45, 145), (57, 145))
    sheet.arrow((57, 145), (-1, 0))
    sheet.line((45, 145), (45, 157))
    sheet.arrow((45, 157), (0, -1))
    sheet.text(58, 142, "+u", 8)
    sheet.text(40, 159, "+v", 8)
    sheet.text(45, 136, "O (0,0) - front/lower corner", 9)
    for endpoint in (45, 45 + geometry["width"] / 2):
        sheet.line((endpoint, 221), (endpoint, 235), 0.1)
    sheet.dimension(45, 45 + geometry["width"] / 2, 232, f"{geometry['width']:.2f}")
    sheet.line((30, 145), (30, 145 + geometry["height"] / 2))
    sheet.line((29, 145), (43, 145), 0.1)
    sheet.line((29, 145 + geometry["height"] / 2), (43, 145 + geometry["height"] / 2), 0.1)
    sheet.arrow((30, 145), (0, 1))
    sheet.arrow((30, 145 + geometry["height"] / 2), (0, -1))
    sheet.text(13, 181, f"{geometry['height']:.2f}", 9)
    side_u = 233
    side_width = geometry["thickness"] / 2
    canvas.rect(side_u * mm, origin_v * mm, side_width * mm, geometry["height"] / 2 * mm)
    canvas.setDash(2 * mm, 1 * mm)
    for height in sorted({round(hole["v"] + sign * hole["diameter"] / 2, 6)
                          for hole in geometry["holes"] for sign in (-1, 1)}):
        sheet.line((side_u, origin_v + height / 2), (side_u + side_width, origin_v + height / 2), 0.1)
    canvas.setDash()
    sheet.text(225, 239, "RIGHT SIDE", 9)
    sheet.text(225, 232, "+Y toward -Y", 8)
    for endpoint in (side_u, side_u + side_width):
        sheet.line((endpoint, 145), (endpoint, 135), 0.1)
    sheet.line((side_u - 4, 138), (side_u + side_width + 4, 138))
    sheet.arrow((side_u, 138), (-1, 0))
    sheet.arrow((side_u + side_width, 138), (1, 0))
    sheet.text(side_u + side_width / 2, 128, f"{geometry['thickness']:.2f} THICK", 9, centered=True)
    sheet.text(279, 249, "HOLE TABLE - ALL THRU", 10)
    columns = [279, 299, 330, 363]
    for position, heading in zip(columns, ["KEY", "u (mm)", "v (mm)", "\u2300 (mm)"]):
        sheet.text(position, 236, heading, 9)
    sheet.line((277, 232), (405, 232))
    for index, hole in enumerate(geometry["holes"]):
        vertical = 223 - index * 10
        for position, value in zip(columns, [hole["key"], f"{hole['u']:.2f}", f"{hole['v']:.2f}",
                                            f"{hole['diameter']:.2f}"]):
            sheet.text(position, vertical, value, 10)
        sheet.line((277, vertical - 3), (405, vertical - 3), 0.1)
    sheet.text(279, 151, "Coordinates from O; +u right, +v up", 8)
    sheet.text(279, 144, "u = world Y; v = world Z - 12.7 mm", 8)
    sheet.text(20, 115, "TEST-ONLY MANUFACTURING ASSUMPTIONS", 10)
    notes = [f"Material: {intent.get('material') or 'UNKNOWN'}; quantity: {intent.get('quantity', 'UNKNOWN')}",
             f"Outer size: +/-{intent.get('outer_tolerance_mm', 'UNKNOWN')} mm; stock thickness: +/-{intent.get('thickness_tolerance_mm', 'UNKNOWN')} mm",
             f"Hole diameter: +/-{intent.get('hole_diameter_tolerance_mm', 'UNKNOWN')} mm; hole coordinates: +/-{intent.get('hole_coordinate_tolerance_mm', 'UNKNOWN')} mm",
             intent.get("finish") or "Finish: UNKNOWN",
             "No kerf compensation. DXF modelspace 1:1 mm. Print PDF at 100%; do not scale to fit.",
             "Fits, strength, stock, machining process and interfaces require engineering/manufacturer review."]
    for index, note in enumerate(notes):
        sheet.text(20, 106 - index * 7, note, 9)
    sheet.line((10, 60), (410, 60))
    sheet.line((215, 10), (215, 60))
    sheet.text(20, 49, intent.get("part_number", "UNKNOWN"), 14)
    sheet.text(20, 38, intent.get("description", "UNKNOWN"), 10)
    sheet.text(20, 27, f"REVISION {revision} | {intent_status(intent)} | Approval: UNVERIFIED", 10)
    sheet.text(20, 16, "Geometry package only; not a toolpath or an associative Onshape drawing", 8)
    sheet.text(223, 49, f"A3 LANDSCAPE | SCALE 1:2 | UNITS mm | SHEET 1 OF 1", 10)
    sheet.text(223, 38, f"Date: {intent.get('date', 'UNKNOWN')} | Quantity: {intent.get('quantity', 'UNKNOWN')}", 10)
    sheet.text(223, 27, f"Stock thickness: {geometry['thickness']:.2f} mm | {len(geometry['holes'])} through-holes", 10)
    sheet.text(223, 16, "No approval signature assigned. EXPERIMENT - NOT FOR MANUFACTURE", 8)
    canvas.showPage()
    canvas.save()
    return {"text_boxes": sheet.text_boxes, "font_sha256": digest(Path(matplotlib.get_data_path()) /
            "fonts/ttf/DejaVuSans.ttf"), "principal_origin_mm": [45, 145], "scale": 0.5}


def validate_pdf_vectors(page, geometry):
    records = []
    for item in page.get_objects():
        if item.type != pdfium.raw.FPDF_PAGEOBJ_PATH:
            continue
        matrix = pdfium.raw.FS_MATRIX()
        require(pdfium.raw.FPDFPageObj_GetMatrix(item.raw, ctypes.byref(matrix)), "PDF path transform unavailable")
        points = []
        segment_count = pdfium.raw.FPDFPath_CountSegments(item.raw)
        for index in range(segment_count):
            segment = pdfium.raw.FPDFPath_GetPathSegment(item.raw, index)
            horizontal, vertical = ctypes.c_float(), ctypes.c_float()
            require(pdfium.raw.FPDFPathSegment_GetPoint(segment, ctypes.byref(horizontal), ctypes.byref(vertical)),
                    "PDF path point unavailable")
            points.append(((matrix.a * horizontal.value + matrix.c * vertical.value + matrix.e) / mm,
                           (matrix.b * horizontal.value + matrix.d * vertical.value + matrix.f) / mm))
        records.append({"segments": segment_count,
                        "bounds": [min(point[0] for point in points), min(point[1] for point in points),
                                   max(point[0] for point in points), max(point[1] for point in points)]})
    def contains(bounds, segments):
        return any(record["segments"] == segments and all(abs(left - right) < 0.001
                   for left, right in zip(record["bounds"], bounds, strict=True)) for record in records)
    for start, end in zip(geometry["outer"], geometry["outer"][1:] + geometry["outer"][:1]):
        bounds = [45 + min(start[0], end[0]) / 2, 145 + min(start[1], end[1]) / 2,
                  45 + max(start[0], end[0]) / 2, 145 + max(start[1], end[1]) / 2]
        require(contains(bounds, 2), "PDF principal outline/scale mismatch")
    require(sum(record["segments"] == 13 for record in records) == len(geometry["holes"]),
            "PDF hole path count mismatch")
    for hole in geometry["holes"]:
        center_u, center_v, radius = 45 + hole["u"] / 2, 145 + hole["v"] / 2, hole["diameter"] / 4
        require(contains([center_u - radius, center_v - radius, center_u + radius, center_v + radius], 13),
                "PDF projected hole geometry mismatch")
    require(contains([233, 145, 233 + geometry["thickness"] / 2, 145 + geometry["height"] / 2], 5),
            "PDF thickness projection mismatch")


def validate_pdf(path, geometry, revision, layout, png):
    document = PdfReader(path)
    require(len(document.pages) == 1, "Expected single PDF page")
    page = document.pages[0]
    require(page.rotation == 0, "Unsupported PDF page rotation")
    close(float(page.mediabox.width) / mm, 420, 0.001)
    close(float(page.mediabox.height) / mm, 297, 0.001)
    text = page.extract_text()
    for item in layout["text_boxes"]:
        require(item["text"] in text, f"Missing PDF text: {item['text']}")
    for value in (STATUS, f"REVISION {revision}", "THIRD-ANGLE", "SCALE 1:2", "ALL THRU"):
        require(value in text, "Missing PDF drawing requirement")
    fonts = [reference.get_object() for reference in page["/Resources"]["/Font"].values()]
    require(fonts and all("/FontFile2" in font["/FontDescriptor"] for font in fonts),
            "PDF fonts must all be embedded TrueType")
    rendered = pdfium.PdfDocument(str(path))
    try:
        rendered_page = rendered[0]
        validate_pdf_vectors(rendered_page, geometry)
        bitmap = rendered_page.render(scale=150 / 72)
        image = bitmap.to_pil()
        require(image.convert("L").getextrema()[0] < 30, "Blank rendered PDF")
        image.save(png)
        bitmap.close()
        rendered_page.close()
    finally:
        rendered.close()
    return {"status": "PASS", "page_mm": [420, 297], "scale": "1:2", "fonts_embedded": True,
            "text_overlap": False, "vector_geometry_matches_step": True,
            "render_dpi": 150, "visual_human_review": "UNVERIFIED"}


def render_package(cache, destination, intent_path, revision):
    cache, destination = Path(cache), Path(destination)
    manifest_path = cache / "snapshot.json"
    input_manifest_hash = digest(manifest_path)
    input_intent_hash = digest(intent_path)
    snapshot = json.loads(manifest_path.read_text())
    step = cache / "source.step"
    geometry = validate_snapshot(step, snapshot, revision)
    require(snapshot["state"]["kind"] in ("LOCAL_SYNTHETIC", "ONSHAPE"), "Unsupported source evidence")
    if snapshot["state"]["kind"] == "ONSHAPE":
        require(snapshot.get("measurement_origin") == "EXACT_SERVER_EVALUATION" and
                snapshot.get("feature_health") == "PASS" and snapshot.get("translation_id") and
                all(snapshot["state"].get(key) for key in ("document", "element", "part", "version", "microversion")),
                "Incomplete Onshape snapshot provenance")
    intent = json.loads(Path(intent_path).read_text())
    require(geometry["outer"][0] == [0, 0] and geometry["width"] <= 330 and geometry["height"] <= 160
            and len(geometry["holes"]) <= 6, "Outside tested drawing envelope")
    destination.mkdir(parents=True, exist_ok=True)
    write_json(destination / "manifest.json", {"package_correctness": "BLOCKED", "revision": revision,
               "reason": "Rendering or validation incomplete", "manufacture_ready": False})
    package_step = destination / "plate.step"
    package_step.write_bytes(step.read_bytes())
    require(digest(package_step) == snapshot["step_sha256"], "Authoritative bytes changed")
    export_dxf(destination / "profile.dxf", geometry)
    dxf_check = validate_dxf(destination / "profile.dxf", geometry)
    layout = draw_pdf(destination / "drawing.pdf", geometry, intent, revision, snapshot["state"]["kind"])
    pdf_check = validate_pdf(destination / "drawing.pdf", geometry, revision, layout, destination / "drawing.png")
    write_json(destination / "layout.json", layout)
    require(digest(step) == snapshot["step_sha256"] and digest(manifest_path) == input_manifest_hash
            and digest(intent_path) == input_intent_hash, "Inputs changed during rendering")
    result = {"schema": 1, "revision": revision, "evidence": "LOCAL_SYNTHETIC_NOT_ONSHAPE"
              if snapshot["state"]["kind"] == "LOCAL_SYNTHETIC" else "ONSHAPE_NATIVE_SNAPSHOT_LOCAL_PACKAGE",
              "package_correctness": "PASS" if intent_status(intent) == "TEST_ONLY" else "BLOCKED",
              "manufacture_ready": False, "engineering_approval": "UNVERIFIED",
              "intent_status": intent_status(intent), "source_state": snapshot["state"],
              "source_step_sha256": snapshot["step_sha256"], "source_manifest_sha256": input_manifest_hash,
              "intent_sha256": input_intent_hash, "intent": intent, "measurements": geometry,
              "dependencies": {name: importlib.metadata.version(name) for name in PACKAGES},
              "dxf": dxf_check, "pdf": pdf_check,
              "outputs": {name: digest(destination / name) for name in
                          ("plate.step", "profile.dxf", "drawing.pdf", "drawing.png", "layout.json")}}
    write_json(destination / "manifest.json", result)
    return result


def validate_output_package(destination, cache, intent_path, revision):
    destination, cache = Path(destination), Path(cache)
    manifest = json.loads((destination / "manifest.json").read_text())
    require(manifest.get("package_correctness") == "PASS" and manifest.get("revision") == revision,
            "Incomplete or mixed-revision output package")
    expected_files = {"plate.step", "profile.dxf", "drawing.pdf", "drawing.png", "layout.json"}
    require(set(manifest["outputs"]) == expected_files, "Missing required output hash")
    require(manifest["source_manifest_sha256"] == digest(cache / "snapshot.json") and
            manifest["source_step_sha256"] == digest(cache / "source.step") and
            manifest["intent_sha256"] == digest(intent_path), "Stale package source or manufacturing intent")
    for name, expected in manifest["outputs"].items():
        require(digest(destination / name) == expected, "Output hash mismatch")
    require(manifest["outputs"]["plate.step"] == manifest["source_step_sha256"], "STEP not original bytes")
    require(manifest["manufacture_ready"] is False and manifest["engineering_approval"] == "UNVERIFIED",
            "Automatic manufacturing approval forbidden")
    return manifest