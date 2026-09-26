import json
import socket
from copy import deepcopy

import cadquery as cq
import ezdxf
import pytest
from OCP.Interface import Interface_Static

from fixtures import ROOT, fixture_shape, synthetic_snapshot
from geometry import Rejected, extract, inspect_shape, validate_snapshot
from package import intent_status, no_network, render_package, validate_dxf


def test_revision_packages_and_offline_rerender(tmp_path):
    with no_network() as traffic:
        for revision, count, thickness in [("A", 5, 6.35), ("B", 6, 8)]:
            cache = tmp_path / revision / "cache"
            source, snapshot = synthetic_snapshot(cache, revision)
            result = render_package(cache, tmp_path / revision / "package", ROOT / "intent.test-only.json", revision)
            assert result["package_correctness"] == "PASS"
            assert not result["manufacture_ready"]
            assert len(result["measurements"]["holes"]) == count
            assert result["measurements"]["thickness"] == pytest.approx(thickness)
            assert (tmp_path / revision / "package/plate.step").read_bytes() == source.read_bytes()
            assert snapshot["measurement_origin"] == "LOCAL_OPEN_CASCADE_NOT_ONSHAPE"
            rerender = render_package(cache, tmp_path / revision / "rerender", ROOT / "intent.test-only.json", revision)
            assert result["outputs"]["drawing.pdf"] == rerender["outputs"]["drawing.pdf"]
            if revision == "B":
                holes = result["measurements"]["holes"]
                assert any(abs(hole["u"] - 241.2) < 1e-6 for hole in holes)
                assert any(hole["u"] == 30 for hole in holes)
                assert any(hole["u"] == 200 and abs(hole["v"] - 27.3) < 1e-6 and
                           hole["diameter"] == 4 for hole in holes)
        assert traffic["blocked_attempts"] == 0
        with pytest.raises(RuntimeError, match="socket guard"):
            socket.create_connection(("example.com", 443))
        assert traffic["blocked_attempts"] == 1


@pytest.mark.parametrize("mutation", ["missing_hole", "wrong_units", "mixed_revision", "mixed_state", "shift_same_volume"])
def test_bad_snapshot_blocks(tmp_path, mutation):
    step, manifest = synthetic_snapshot(tmp_path, "A")
    invalid = deepcopy(manifest)
    if mutation == "missing_hole":
        invalid["measurements"]["holes"].pop()
    elif mutation == "wrong_units":
        invalid["measurements"]["units"] = "inch"
    elif mutation == "mixed_revision":
        invalid["revision"] = "B"
    elif mutation == "mixed_state":
        invalid["export_state"]["immutable_id"] = "different"
    else:
        invalid["measurements"]["holes"][0]["u"] += 1
    with pytest.raises(Rejected):
        validate_snapshot(step, invalid, "A")


@pytest.mark.parametrize("kind", ["blind", "counterbore", "countersink", "angled", "multiple", "pocket"])
def test_unsupported_brep(kind):
    shape = fixture_shape("A")
    if kind in ("blind", "counterbore"):
        center_y, center_z = (100, 70) if kind == "blind" else (70, 65)
        shape = shape.cut(cq.Solid.makeCylinder(9, 3, cq.Vector(-177, center_y, center_z), cq.Vector(1, 0, 0)))
    elif kind == "countersink":
        shape = shape.cut(cq.Solid.makeCone(10, 5, 4, cq.Vector(-177, 70, 65), cq.Vector(1, 0, 0)))
    elif kind == "angled":
        shape = shape.cut(cq.Solid.makeCylinder(3, 20, cq.Vector(-180, 100, 70), cq.Vector(1, 0.2, 0)))
    elif kind == "pocket":
        shape = shape.cut(cq.Solid.makeBox(3, 20, 20, cq.Vector(-177, 100, 70)))
    else:
        shape = cq.Compound.makeCompound([shape, cq.Solid.makeBox(1, 1, 1)])
    with pytest.raises(Rejected):
        inspect_shape(shape)


def test_step_declared_inches_rejected(tmp_path):
    path = tmp_path / "inches.step"
    try:
        Interface_Static.SetCVal_s("write.step.unit", "INCH")
        cq.exporters.export(fixture_shape(), str(path))
    finally:
        Interface_Static.SetCVal_s("write.step.unit", "MM")
    with pytest.raises(Rejected, match="millimeters"):
        extract(path)


@pytest.mark.parametrize("field", ["material", "hole_coordinate_tolerance_mm", "release_status"])
def test_unknown_intent_cannot_release(field):
    intent = json.loads((ROOT / "intent.test-only.json").read_text())
    intent[field] = None
    assert intent_status(intent) == "INTENT_UNVERIFIED"


@pytest.mark.parametrize("mutation", ["units", "duplicate", "shift", "self_intersect", "annotation"])
def test_bad_dxf_rejected(tmp_path, mutation):
    from package import export_dxf
    step, snapshot = synthetic_snapshot(tmp_path / "cache", "A")
    geometry = extract(step)
    path = tmp_path / "bad.dxf"
    export_dxf(path, geometry)
    document = ezdxf.readfile(path)
    model = document.modelspace()
    if mutation == "units":
        document.units = ezdxf.units.IN
    elif mutation == "duplicate":
        model.add_entity(model.query("CIRCLE")[0].copy())
    elif mutation == "shift":
        circle = model.query("CIRCLE")[0]
        circle.dxf.center = circle.dxf.center + (1, 0, 0)
    elif mutation == "annotation":
        model.add_text("NOT CUT GEOMETRY")
    else:
        model.query("LWPOLYLINE")[0].set_points([(0, 0), (320, 150), (320, 0), (0, 150)])
    document.saveas(path)
    with pytest.raises(Rejected):
        validate_dxf(path, geometry)


def test_scaled_pdf_rejected(tmp_path):
    from pypdf import PdfReader, PdfWriter, Transformation
    from package import draw_pdf, validate_pdf
    step, snapshot = synthetic_snapshot(tmp_path / "cache", "B")
    geometry = extract(step)
    path = tmp_path / "drawing.pdf"
    intent = json.loads((ROOT / "intent.test-only.json").read_text())
    layout = draw_pdf(path, geometry, intent, "B", "LOCAL_SYNTHETIC")
    document = PdfReader(path)
    page = document.pages[0]
    page.add_transformation(Transformation().scale(0.9))
    writer = PdfWriter()
    writer.add_page(page)
    altered = tmp_path / "wrong-scale.pdf"
    writer.write(altered)
    with pytest.raises(Rejected, match="outline/scale"):
        validate_pdf(altered, geometry, "B", layout, tmp_path / "wrong-scale.png")


def test_review_output_for_unknown_intent(tmp_path):
    from package import write_json
    cache, output = tmp_path / "cache", tmp_path / "output"
    synthetic_snapshot(cache, "A")
    intent = json.loads((ROOT / "intent.test-only.json").read_text())
    intent["material"] = None
    path = tmp_path / "intent.json"
    write_json(path, intent)
    result = render_package(cache, output, path, "A")
    assert result["package_correctness"] == "BLOCKED"
    assert result["intent_status"] == "INTENT_UNVERIFIED"
    assert result["manufacture_ready"] is False
    assert (output / "drawing.pdf").is_file()


def test_output_tamper_and_interrupted_rerender(tmp_path, monkeypatch):
    import package
    cache, output = tmp_path / "cache", tmp_path / "output"
    synthetic_snapshot(cache, "A")
    intent = ROOT / "intent.test-only.json"
    render_package(cache, output, intent, "A")
    package.validate_output_package(output, cache, intent, "A")
    with (output / "plate.step").open("ab") as stream:
        stream.write(b"tampered")
    with pytest.raises(Rejected, match="hash mismatch"):
        package.validate_output_package(output, cache, intent, "A")
    def fail(*args):
        raise Rejected("Simulated drawing failure")
    monkeypatch.setattr(package, "draw_pdf", fail)
    with pytest.raises(Rejected, match="Simulated"):
        render_package(cache, output, intent, "A")
    with pytest.raises(Rejected, match="Incomplete"):
        package.validate_output_package(output, cache, intent, "A")