import json
import time
from datetime import datetime, timezone

from geometry import require, validate_snapshot
from native import NativeFixture, measure_version
from package import no_network, render_package, validate_dxf, validate_output_package
from safety import BoundedRequests, Ledger, QUOTA, ROOT, atomic_json, require_live_authorization
from snapshot import capture_snapshot
from transport import AuthenticatedSender

LIVE = ROOT / "artifacts/live"


def render_live(revision, rerender=False):
    cache = LIVE / revision / "cache"
    destination = LIVE / revision / ("rerender" if rerender else "package")
    with no_network() as traffic:
        result = render_package(cache, destination, ROOT / "intent.test-only.json", revision)
        validate_output_package(destination, cache, ROOT / "intent.test-only.json", revision)
        require(traffic["blocked_attempts"] == 0, "Cached rendering attempted network")
    atomic_json(destination / "network-proof.json", traffic)
    return result


def verify_rerender(original, rerendered):
    for name in ("plate.step", "drawing.pdf", "drawing.png", "layout.json"):
        require(original["outputs"][name] == rerendered["outputs"][name], "Cache rerender changed stable output")
    require(original["measurements"] == rerendered["measurements"], "Cache rerender changed geometry")
    validate_dxf(LIVE / "B/rerender/profile.dxf", original["measurements"])
    return {"status": "PASS", "authenticated_calls": 0, "blocked_attempts": 0,
            "stable_output_hashes_equal": True, "dxf_geometry_revalidated": True,
            "dxf_bytes_equal": original["outputs"]["profile.dxf"] == rerendered["outputs"]["profile.dxf"]}


def finish_cached():
    result = json.loads((LIVE / "summary.json").read_text())
    result["status"] = "PARTIAL"
    with no_network() as traffic:
        for revision in ("A", "B"):
            package = validate_output_package(LIVE / revision / "package", LIVE / revision / "cache",
                                              ROOT / "intent.test-only.json", revision)
            snapshot = json.loads((LIVE / revision / "cache/snapshot.json").read_text())
            validate_snapshot(LIVE / revision / "cache/source.step", snapshot, revision)
            require(package["evidence"] == "ONSHAPE_NATIVE_SNAPSHOT_LOCAL_PACKAGE", "Non-Onshape evidence")
        rerendered = render_live("B", rerender=True)
        original = json.loads((LIVE / "B/package/manifest.json").read_text())
        result["rerender_check"] = verify_rerender(original, rerendered)
        require(traffic["blocked_attempts"] == 0, "Cache finalization attempted network")
    ledger = Ledger()
    try:
        result["calls"] = ledger.summary()
        result["authorization"] = ledger.state["authorization"]
        result["credential_loads"] = ledger.state.get("credential_loads", 0)
        result["request_elapsed_seconds"] = round(sum(event.get("elapsed_seconds", 0) for event in ledger.state["events"]), 3)
        result["feature_counts"] = {revision: len(ledger.state["snapshots"][revision]["features"]["features"]) for revision in ("A", "B")}
        result["phase_elapsed_seconds"] = {phase: round(sum(event.get("elapsed_seconds", 0) for event in ledger.state["events"]
                                                  if event["phase"] == phase), 3) for phase in ("setup", "revision", "A", "B")}
        result["recoveries"] = ledger.state.get("recoveries", [])
    finally:
        ledger.close()
    result.update(status="PASS", no_network_rerender="PASS", manufacture_ready=False,
                  engineering_approval="UNVERIFIED", finalized_at=datetime.now(timezone.utc).isoformat())
    atomic_json(LIVE / "summary.json", result)
    print(json.dumps({"status": result["status"], "calls": result["calls"], "rerender_check": result["rerender_check"]}))
    return result


def execute_live(current_key, rotated, public):
    require_live_authorization(rotated, public, ROOT / "artifacts/offline/preflight.json",
                               bindings_verified=True, current_key_confirmation=current_key)
    ledger = Ledger()
    started = time.monotonic()
    result = {"status": "PARTIAL", "evidence": "AUTHENTICATED_NATIVE_TRIAL", "manufacture_ready": False,
              "engineering_approval": "UNVERIFIED", "revisions": {}, "quota_reference": QUOTA,
              "started_at": datetime.now(timezone.utc).isoformat()}
    try:
        require(not ledger.state["halted"] and not any(event["outcome"] == "UNKNOWN" for event in ledger.state["events"]),
                "Prior halt requires evidence-based recovery; no requests sent")
        ledger.acknowledge(current_key=current_key, rotated=rotated)
        requests = BoundedRequests(ledger, AuthenticatedSender(ledger))
        fixture = NativeFixture(requests)
        for revision in ("A", "B"):
            cache = LIVE / revision / "cache"
            if (cache / "snapshot.json").exists():
                snapshot = json.loads((cache / "snapshot.json").read_text())
                validate_snapshot(cache / "source.step", snapshot, revision)
            else:
                require(not (revision == "A" and ledger.state.get("fixture_revision") == "B"),
                        "Cannot recreate baseline from a revised workspace")
                element = fixture.build(revision)
                snapshot = capture_snapshot(requests, element, revision, cache, measure_version,
                                             simulation=False, wait=time.sleep)
            package = render_live(revision)
            result["revisions"][revision] = {"state": snapshot["state"], "measurements": package["measurements"],
                                            "package_correctness": package["package_correctness"],
                                            "evidence": package["evidence"], "outputs": package["outputs"]}
            atomic_json(LIVE / "summary.json", {**result, "calls": ledger.summary()})
        rerendered = render_live("B", rerender=True)
        result["rerender_check"] = verify_rerender(result["revisions"]["B"], rerendered)
        result.update(status="PASS", no_network_rerender="PASS")
        return result
    finally:
        result["elapsed_seconds_this_invocation"] = round(time.monotonic() - started, 3)
        result["calls"] = ledger.summary()
        result["authorization"] = ledger.state.get("authorization")
        if ledger.state.get("element"):
            result["url"] = "https://cad.onshape.com/documents/" + ledger.state["owned_document"] + "/w/" + ledger.state["workspace"] + "/e/" + ledger.state["element"]
        atomic_json(LIVE / "summary.json", result)
        ledger.close()
        print(json.dumps({key: result[key] for key in ("status", "calls", "manufacture_ready")}, sort_keys=True))