import json

import pytest

from fixtures import synthetic_snapshot
from geometry import Rejected
from geometry import compare, extract
from package import render_package
from safety import ROOT


def test_onshape_claim_requires_real_snapshot_provenance(tmp_path):
    _, snapshot = synthetic_snapshot(tmp_path / "cache", "A")
    snapshot["state"]["kind"] = "ONSHAPE"
    snapshot["measurement_state"] = snapshot["state"].copy()
    snapshot["export_state"] = snapshot["state"].copy()
    (tmp_path / "cache/snapshot.json").write_text(json.dumps(snapshot))
    with pytest.raises(Rejected, match="Onshape snapshot provenance"):
        render_package(tmp_path / "cache", tmp_path / "package", ROOT / "intent.test-only.json", "A")


@pytest.mark.skipif(not (ROOT / "artifacts/live/A/cache/source.step").exists(), reason="Live export not available")
def test_actual_native_baseline_export_matches_retained_server_measurement():
    ledger = json.loads((ROOT / "artifacts/private/call-ledger.json").read_text())
    checkpoint = ledger["snapshots"]["A"]
    measured = checkpoint["measured"]
    assert measured["state"]["kind"] == "ONSHAPE"
    assert measured["state"]["version"] == checkpoint["version"]["id"]
    assert measured["response_source_microversion"] == checkpoint["version"]["microversion"]
    actual = extract(ROOT / "artifacts/live/A/cache/source.step")
    compare(actual, measured["measurements"])
    assert actual["step_declared_units"] == ["metre"]
    assert actual["units"] == "mm" and len(actual["holes"]) == 5
    assert abs(actual["thickness"] - 6.35) < 0.01


@pytest.mark.skipif(not (ROOT / "artifacts/live/A/cache/source.step").exists(), reason="Live export not available")
def test_retained_download_recovery_needs_no_requests(tmp_path):
    from safety import Ledger, atomic_json
    from snapshot import complete_cached_download
    original = json.loads((ROOT / "artifacts/private/call-ledger.json").read_text())
    last = next(event for event in original["events"] if event["operation"] == "download" and event["phase"] == "A")
    original["events"] = original["events"][:last["attempt"]]
    original["halted"] = True
    atomic_json(tmp_path / "ledger.json", original)
    evidence = json.loads((ROOT / "artifacts/private" / last["evidence"]).read_text())
    atomic_json(tmp_path / last["evidence"], evidence)
    cache = tmp_path / "cache"
    cache.mkdir()
    (cache / "source.step").write_bytes((ROOT / "artifacts/live/A/cache/source.step").read_bytes())
    ledger = Ledger(tmp_path / "ledger.json")
    try:
        snapshot = complete_cached_download(ledger, "A", cache)
        assert snapshot["state"]["kind"] == "ONSHAPE"
        assert ledger.summary()["attempted"] == last["attempt"]
        assert ledger.state["recoveries"][-1]["replayed"] is False
    finally:
        ledger.close()


@pytest.mark.skipif(not (ROOT / "artifacts/live/B/cache/snapshot.json").exists(), reason="Live B export not available")
def test_actual_native_revisions_original_bytes_and_downstream_edits():
    from geometry import digest, validate_snapshot
    from package import validate_dxf, validate_output_package
    ledger = json.loads((ROOT / "artifacts/private/call-ledger.json").read_text())
    versions = []
    for revision, thickness, pivot, rear, count in [("A", 6.35, 25, 246.2, 5), ("B", 8, 30, 241.2, 6)]:
        cache = ROOT / "artifacts/live" / revision / "cache"
        snapshot = json.loads((cache / "snapshot.json").read_text())
        geometry = validate_snapshot(cache / "source.step", snapshot, revision)
        assert snapshot["measurement_response_source_microversion"] == snapshot["state"]["microversion"]
        assert snapshot["measurement_origin"] == "EXACT_SERVER_EVALUATION"
        assert snapshot["state"]["kind"] == "ONSHAPE"
        versions.append(snapshot["state"]["version"])
        assert len(geometry["holes"]) == count and abs(geometry["thickness"] - thickness) < 0.01
        assert any(abs(hole["u"] - pivot) < 0.01 and abs(hole["v"] - 117.3) < 0.01 for hole in geometry["holes"])
        assert any(abs(hole["u"] - rear) < 0.01 and abs(hole["v"] - 52.3) < 0.01 for hole in geometry["holes"])
        assert abs(geometry["world_bounds"][0] - (-176.35 if revision == "A" else -188)) < 0.01
        assert abs(geometry["world_bounds"][3] - (-170 if revision == "A" else -180)) < 0.01
        package_path = cache.parent / "package"
        package = validate_output_package(package_path, cache, ROOT / "intent.test-only.json", revision)
        validate_dxf(package_path / "profile.dxf", geometry)
        assert digest(package_path / "plate.step") == snapshot["step_sha256"]
        assert package["manufacture_ready"] is False
    assert versions[0] != versions[1]
    assert any(abs(hole["u"] - 200) < 0.01 and abs(hole["v"] - 27.3) < 0.01 and
               abs(hole["diameter"] - 4) < 0.01 for hole in geometry["holes"])
    assert ledger["native_steps"]["A_body"] == ledger["native_steps"]["B_body"]
    assert ledger["native_steps"]["A_plane"] == ledger["native_steps"]["B_plane"]
    assert ledger["native_steps"]["A_holes"] == ledger["native_steps"]["B_holes"]
    assert "B_downstream_remove" in ledger["native_steps"]
    assert len(ledger["events"]) <= 80 and sum(event["operation"] == "create_document" for event in ledger["events"]) == 1


@pytest.mark.skipif(not (ROOT / "artifacts/live/B/rerender/manifest.json").exists(), reason="Live rerender not available")
def test_actual_cache_rerender_geometry_and_stable_outputs():
    from live import verify_rerender
    original = json.loads((ROOT / "artifacts/live/B/package/manifest.json").read_text())
    rerendered = json.loads((ROOT / "artifacts/live/B/rerender/manifest.json").read_text())
    assert verify_rerender(original, rerendered)["status"] == "PASS"
    proof = json.loads((ROOT / "artifacts/live/B/rerender/network-proof.json").read_text())
    assert proof == {"authenticated_calls": 0, "blocked_attempts": 0}