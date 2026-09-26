from copy import deepcopy

import pytest

from fixtures import synthetic_snapshot
from geometry import Rejected, validate_snapshot


def test_import_five_holes_mm_and_reject_stale(tmp_path):
    step, manifest = synthetic_snapshot(tmp_path, "A")
    actual = validate_snapshot(step, manifest, "A")
    assert actual["units"] == "mm"
    assert actual["width"] == pytest.approx(320)
    assert actual["height"] == pytest.approx(150)
    assert actual["thickness"] == pytest.approx(6.35)
    assert [(hole["u"], hole["v"], hole["diameter"]) for hole in actual["holes"]] == pytest.approx(
        [(25, 117.3, 12.9), (70, 52.3, 12.9), (140, 122.3, 6.6),
         (246.2, 52.3, 12.9), (300, 122.3, 6.6)])
    stale = deepcopy(manifest)
    stale["step_sha256"] = "0" * 64
    with pytest.raises(Rejected, match="Stale"):
        validate_snapshot(step, stale, "A")