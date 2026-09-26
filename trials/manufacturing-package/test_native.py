import json

from native import decode_fs, drawing_to_sketch, extrude_feature, plane_feature, sketch_feature
from safety import ROOT


FRAME = {"origin": [-170, 0, 0], "x": [0, 1, 0], "normal": [1, 0, 0]}


def test_native_payload_units_and_revision_coordinates():
    benchmark = json.loads((ROOT.parent.parent / "benchmark/intake.json").read_text())
    values = benchmark["baseline"]
    baseline = sketch_feature("nativeplane", FRAME, values, holes=True)
    assert len(baseline["entities"]) == 5
    assert baseline["entities"][1]["geometry"]["xCenter"] == 0.2462
    values.update(benchmark["revision"])
    values.update(plateThicknessMm=8, pivotCenterYZMm=[30, 130])
    revised = sketch_feature("nativeplane", FRAME, values, holes=True)
    assert revised["entities"][1]["geometry"]["xCenter"] == 0.2412
    assert revised["entities"][2]["geometry"]["xCenter"] == 0.03
    assert sketch_feature("nativeplane", FRAME, values, downstream=True)["entities"][0]["geometry"]["radius"] == 0.002
    assert plane_feature(360)["parameters"][2]["expression"] == "180 mm"
    assert extrude_feature("outline", 8, FRAME)["parameters"][4]["expression"] == "8 mm"


def test_native_sketch_frame_and_rectangle_closure():
    assert drawing_to_sketch(FRAME, 70, 65) == [0.07, 0.065]
    reversed_frame = {"origin": [-170, 0, 0], "x": [0, 0, 1], "normal": [1, 0, 0]}
    assert drawing_to_sketch(reversed_frame, 70, 65) == [0.065, -0.07]
    values = json.loads((ROOT.parent.parent / "benchmark/intake.json").read_text())["baseline"]
    edges = sketch_feature("nativeplane", FRAME, values)["entities"]
    assert len(edges) == 4
    for index, edge in enumerate(edges):
        curve = edge["geometry"]
        following = edges[(index + 1) % 4]["geometry"]
        assert abs(curve["pntX"] + curve["dirX"] * edge["endParam"] - following["pntX"]) < 1e-10
        assert abs(curve["pntY"] + curve["dirY"] * edge["endParam"] - following["pntY"]) < 1e-10


def test_decode_featurescript_map_and_array():
    node = {"btType": "BTFSValueMap", "value": [{"key": {"btType": "BTFSValueString", "value": "bounds"},
            "value": {"btType": "BTFSValueArray", "value": [{"btType": "BTFSValueNumber", "value": 8}]}}]}
    assert decode_fs(node) == {"bounds": [8]}


def test_measurement_script_is_read_only():
    script = (ROOT / "measure.fs").read_text()
    assert "evBox3d" in script and "evVolume" in script and "evSurfaceDefinition" in script
    assert not any(word in script for word in ("opExtrude", "opBoolean", "newSketch", "defineFeature", "skSolve"))


def test_measurement_rejects_wrong_response_microversion():
    import pytest
    from geometry import Rejected
    from native import measure_version
    class WrongVersion:
        def request(self, *args, **kwargs):
            return {"sourceMicroversion": "old"}
    with pytest.raises(Rejected, match="source microversion"):
        measure_version(WrongVersion(), {"document": "owned", "element": "plate", "version": "version",
                                        "microversion": "current"}, "A")