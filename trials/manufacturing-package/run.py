import argparse
import importlib.metadata
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

from fixtures import synthetic_snapshot
from geometry import Rejected, digest, require, validate_snapshot
from package import no_network, render_package, validate_output_package, write_json
from safety import (LEDGER_PATH, QUOTA, ROOT, Ledger, environment_versions,
                    require_live_authorization, source_hashes)

OFFLINE = ROOT / "artifacts/offline"
PRIVATE = ROOT / "artifacts/private"


def inventory():
    require(Path(sys.prefix).resolve() == (ROOT / ".venv").resolve(), "Use the trial-local .venv")
    distributions = sorted(importlib.metadata.distributions(), key=lambda item: item.metadata["Name"].lower())
    packages = []
    for distribution in distributions:
        metadata = distribution.metadata
        packages.append({"name": metadata["Name"], "version": distribution.version,
                         "license": metadata.get("License-Expression") or metadata.get("License", "See distribution license"),
                         "classifiers": [item for item in metadata.get_all("Classifier", []) if item.startswith("License")],
                         "project_urls": metadata.get_all("Project-URL", []),
                         "license_files": [str(item).replace("\\", "/") for item in distribution.files or []
                                           if "license" in str(item).lower() or "copying" in str(item).lower()]})
    write_json(ROOT / "dependencies.json", {"python": platform.python_version(), "platform": platform.platform(),
               "scope": "trial-local .venv", "packages": packages})
    (ROOT / "requirements.lock").write_text("\n".join(f"{item['name']}=={item['version']}" for item in packages) + "\n")


class TestEvidence:
    def __init__(self):
        self.results = []

    def pytest_runtest_logreport(self, report):
        if report.when == "call" or report.failed:
            self.results.append({"test": report.nodeid, "outcome": report.outcome})


def tests():
    import pytest
    PRIVATE.mkdir(parents=True, exist_ok=True)
    evidence = TestEvidence()
    test_files = [str(path) for path in sorted(ROOT.glob("test_*.py"))]
    code = pytest.main(test_files + ["-q", "--disable-warnings", "--tb=short",
                      "--basetemp", str(PRIVATE / "test-temp"),
                      "-o", f"cache_dir={PRIVATE / 'pytest-cache'}"], plugins=[evidence])
    result = {"status": "PASS" if code == 0 else "FAIL", "exit_code": int(code),
              "passed": sum(item["outcome"] == "passed" for item in evidence.results),
              "failed": sum(item["outcome"] == "failed" for item in evidence.results),
              "results": evidence.results, "evidence": "LOCAL_TESTS_WITH_SEPARATELY_IDENTIFIED_RETAINED_ONSHAPE_CHECKS",
              "source_hashes": source_hashes(), "environment": environment_versions(),
              "created_at": datetime.now(timezone.utc).isoformat(), "authenticated_calls": 0}
    write_json(PRIVATE / "test-run.json", result)
    write_json(OFFLINE / "tests.json", result)
    if (ROOT / "artifacts/live/B/cache/snapshot.json").exists():
        write_json(ROOT / "artifacts/live/tests.json", result)
    require(code == 0, "Offline tests failed; no preflight issued")
    return result


def local_lifecycle():
    OFFLINE.mkdir(parents=True, exist_ok=True)
    inventory()
    results = tests()
    with no_network() as traffic:
        packages = {}
        for revision in ("A", "B"):
            cache = OFFLINE / revision / "cache"
            if cache.exists():
                snapshot = json.loads((cache / "snapshot.json").read_text())
                validate_snapshot(cache / "source.step", snapshot, revision)
            else:
                synthetic_snapshot(cache, revision)
            packages[revision] = render_package(cache, OFFLINE / revision / "package",
                                                ROOT / "intent.test-only.json", revision)
            validate_output_package(OFFLINE / revision / "package", cache,
                                    ROOT / "intent.test-only.json", revision)
        rerender = render_package(OFFLINE / "B/cache", OFFLINE / "B/rerender",
                                   ROOT / "intent.test-only.json", "B")
        require(rerender["outputs"]["drawing.pdf"] == packages["B"]["outputs"]["drawing.pdf"],
                "Cached PDF rerender changed")
        require(traffic["blocked_attempts"] == 0, "Unexpected network attempt during local pipeline")
    artifacts = {str(path.relative_to(ROOT)).replace("\\", "/"): digest(path)
                 for path in OFFLINE.glob("*/package/*") if path.is_file()}
    artifacts.update({str(path.relative_to(ROOT)).replace("\\", "/"): digest(path)
                      for path in OFFLINE.glob("*/cache/*") if path.is_file()})
    results["artifacts"] = artifacts
    results["zero_network_rerender"] = traffic
    write_json(OFFLINE / "preflight.json", results)
    if not LEDGER_PATH.exists():
        ledger = Ledger(initialize=True)
    else:
        ledger = Ledger()
    try:
        calls = ledger.summary()
    finally:
        ledger.close()
    summary = {"status": "PASS", "evidence": "LOCAL_SYNTHETIC_ONLY_NOT_ONSHAPE",
               "revisions": {revision: {"holes": len(value["measurements"]["holes"]),
                               "thickness_mm": value["measurements"]["thickness"],
                               "volume_mm3": value["measurements"]["volume"],
                               "package_correctness": value["package_correctness"]}
                             for revision, value in packages.items()},
               "live_snapshot": "SEPARATE_EVIDENCE_IN_ARTIFACTS_LIVE", "human_approval": "UNVERIFIED", "manufacture_ready": False,
               "tests_passed": results["passed"], "calls": calls, "quota_source": QUOTA,
               "network_guard": traffic, "fresh_key_confirmed": False,
               "annual_scenario": {"status": "UNVERIFIED_CONDITIONAL_NOT_MEASURED",
                   "existing_used": 273, "combined_trial_reserve": 300,
                   "additional_milestones": 100, "assumed_calls_per_milestone": 10,
                   "future_native_edit_setup_allowance": 427, "planning_total": 2000,
                   "safety_reserve": 500}}
    write_json(OFFLINE / "summary.json", summary)
    print(json.dumps({"status": "FINISHED_LOCAL_SYNTHETIC", "tests_passed": results["passed"],
                      "A_holes": 5, "B_holes": 6, "authenticated_calls": calls["attempted"],
                      "live_snapshot": "SEPARATE_EVIDENCE_IN_ARTIFACTS_LIVE", "approval": "UNVERIFIED"}))


def main(argv=None):
    parser = argparse.ArgumentParser(description="Bounded manufacturing package, offline by default")
    parser.add_argument("command", choices=["offline", "rerender", "test", "inventory", "live", "finish-live"], nargs="?", default="offline")
    parser.add_argument("--revision", choices=["A", "B"], default="B")
    parser.add_argument("--confirm-fresh-key", action="store_true")
    parser.add_argument("--acknowledge-current-key", action="store_true")
    parser.add_argument("--confirm-new-public", action="store_true")
    parser.add_argument("--source", choices=["offline", "live"], default="offline")
    options = parser.parse_args(argv)
    if options.command == "finish-live":
        from live import finish_cached
        return finish_cached()
    if options.command == "live":
        from live import execute_live
        return execute_live(options.acknowledge_current_key, options.confirm_fresh_key, options.confirm_new_public)
    if options.command == "inventory":
        inventory()
    elif options.command == "test":
        OFFLINE.mkdir(parents=True, exist_ok=True)
        tests()
    elif options.command == "rerender":
        if options.source == "live":
            from live import render_live
            result = render_live(options.revision, rerender=True)
            print(json.dumps({"status": result["package_correctness"], "evidence": result["evidence"], "authenticated_calls": 0}))
            return
        with no_network() as traffic:
            result = render_package(OFFLINE / options.revision / "cache", OFFLINE / options.revision / "rerender",
                                    ROOT / "intent.test-only.json", options.revision)
            require(traffic["blocked_attempts"] == 0, "Rerender attempted network")
        write_json(OFFLINE / options.revision / "rerender/network-proof.json", traffic)
        print(json.dumps({"status": result["package_correctness"], "evidence": result["evidence"], **traffic}))
    else:
        local_lifecycle()


if __name__ == "__main__":
    try:
        main()
    except (Rejected, OSError, KeyError, ValueError) as error:
        print(f"BLOCKED: {error}" if isinstance(error, Rejected) else "BLOCKED: invalid or missing local input")
        sys.exit(2)