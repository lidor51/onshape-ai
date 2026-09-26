import json
import sys
import time
import unittest

from cad_core import NETWORK_EVENTS, ROOT
from package_packet import write_json
from v3_contract import digest, mate_frames
from v3_finish import budget_plan, source_snapshot, static_checks, upstream_snapshot
from v3_model import PACKET, make_design
import v3_resume_test
from v3_sources import sha


def publish():
    if (PACKET / "freeze.json").exists():
        raise RuntimeError("V3 is sealed; do not rewrite current artifacts")
    started = time.perf_counter()
    source_hashes, upstream_hashes = source_snapshot(), upstream_snapshot()
    design = make_design()
    checks, connectors, source, layouts = static_checks(design)
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(v3_resume_test))
    if not result.wasSuccessful():
        raise RuntimeError("Continuation regressions failed")
    scalar = json.loads((PACKET / "original-source-roundtrip-probe.json").read_text())
    boundary = json.loads((PACKET / "source-brep-roundtrip-probe.json").read_text())
    assert boundary["sourceProbeSha256"] == sha(PACKET / "original-source-roundtrip-probe.json")
    pcurves = json.loads((PACKET / "original-source-roundtrip-no-pcurves-probe.json").read_text())
    assert scalar["status"] == "FAIL" and boundary["status"] == "FAIL" and pcurves["status"] == "FAIL"
    assert len(scalar["rows"]) == len(boundary["rows"]) == len(pcurves["rows"]) == 6
    for row in scalar["rows"]:
        assert sha(PACKET / "source-probe" / (row["role"] + ".step")) == row["exportSha256"]
        assert row["sourceSha256"] == design["cotsBindings"][row["role"]]["sha256"]
    current = PACKET / "current"

    def save(name, data):
        write_json(current / name, data)

    save("assembly-contract.json", {**design, "modelSha256": digest(design), "status": "UNFROZEN_SOURCE_ROUNDTRIP_BLOCKED", "nativeInstanceCount": len(design["instances"]) - 1, "nativeMateCount": len(design["joints"]) - 1, "nativeRelationCount": len(design["relations"]), "diagnosticCoralExcludedFromNative": True, "baselineMates": mate_frames(design, design["parameters"]["baseline"]), "revisionMates": mate_frames(design, design["parameters"]["revision"]), "nativeIds": "UNOBSERVED_NOT_FABRICATED"})
    save("source/geometry-payload.json", {"schema": "INTERNAL_CONSTRUCTION_RECIPE_NOT_REST", "modelSha256": digest(design), "parts": design["parts"], "parameters": design["parameters"], "customLayoutOffsetsMm": layouts, "cotsLayoutOffsetsMm": {role: [0, 0, 0] for role in design["cotsBindings"]}, "nativeCompilation": "UNVERIFIED", "sourceUnit": "millimeter"})
    save("source/parametric-connectors.json", connectors)
    (current / "source" / "concept-a.fs").write_text(source, encoding="utf8")
    save("cots-bindings.json", {"status": "SOURCE_GEOMETRY_UNCHANGED_STEP_EQUIVALENCE_BLOCKED", "bindings": design["cotsBindings"], "sourceInputHashes": upstream_hashes, "sourceTopologyIdentity": {row["role"]: row["sourceGeometryUnmodifiedIsPartner"] for row in boundary["rows"]}, "x44SourceSolids": 2, "inventedRotors": 0, "x60": "QUARANTINED_EXCLUDED", "stepExports": [{"role": row["role"], "path": "../source-probe/" + row["role"] + ".step", "sha256": row["exportSha256"], "status": row["status"]} for row in scalar["rows"]], "redistributionLicense": "NOT_ESTABLISHED_LOCAL_CACHE_ONLY"})
    save("ui-edit-map.json", {"controls": design["parameters"]["controls"], "baseline": design["parameters"]["baseline"], "revision": design["parameters"]["revision"], "mouthWidthEffects": ["side-plate positions", "cross-tube, drum and belt widths", "source-owned connector locations"], "receiverHeightEffects": ["fork leg length = receiverHeight - 110", "receiver datum Z = receiverHeight + 85"], "sourceCandidate": "source/concept-a.fs", "sourceOwnedConnectorDefinitions": len(connectors["connectors"]), "nativeFeatureGeometryEquivalence": "UNVERIFIED_OFFLINE_CANDIDATE_ONLY", "nativeConnectorOwnership": "UNVERIFIED_SOURCE_EMITTED_NOT_NATIVE_READBACK", "humanUiObserved": False})
    budget = budget_plan(design)
    save("api-source-plan.json", budget)
    tests = {"status": "PASS_REGRESSIONS_NOT_GEOMETRY_RELEASE", "run": result.testsRun, "failures": len(result.failures), "errors": len(result.errors), "skipped": len(result.skipped), "staticContractChecks": checks, "sourceRoundTrip": scalar["status"], "sourceBrepCorrespondence": boundary["status"], "newDeploymentSamples": 0, "newFullAssemblyRoundTrips": 0}
    save("tests.json", tests)
    status = {"status": "BLOCKED_UNFROZEN_V3", "freezeCreated": False, "fullV3Run": "NOT_RUN_SOURCE_GATE_FAILED", "modelSha256": digest(design), "currentContract": "current/assembly-contract.json", "tests": tests, "nativeInstances": budget["counts"]["instances"], "sourceSha256": source_hashes, "upstreamSha256": upstream_hashes, "proofSha256": {name: sha(PACKET / name) for name in ["original-source-roundtrip-probe.json", "original-source-roundtrip-no-pcurves-probe.json", "source-brep-roundtrip-probe.json", "x44-roundtrip-failure-probe.json", "x44-roundtrip-integration-probe.json", "x44-roundtrip-boundary-probe.json"]}, "apiCalls": 0, "networkDeniedEvents": NETWORK_EVENTS, "pythonExecutable": sys.executable, "reportExecutionSeconds": time.perf_counter() - started, "olderV3Artifacts": "Historical diagnostics only: root source/, baseline/, validation-quick.json and phase probes predate the unchanged-two-body contract and are not current admitted geometry", "remainingGates": ["Resolve both X44 STEP scalar discrepancies without changing original geometry or relaxing budgets", "Resolve bearing geometric boundary correspondence independent of UV parameterization", "Run current baseline/revision exports and 62 deployment samples after strict source gates pass", "Run current tooth-phase and interface checks with unsplit motor presentation limitations retained", "Verify native FeatureScript effective geometry, source-owned connectors, identities, mates and UI", "Parent must verify remaining persistent request budget and allowance; native grouping requires logical-member readback", "Physical torque, materials, teeth production, fastening/retention, guarding, wiring, jam handling and manufacturing release remain unverified"]}
    write_json(PACKET / "continuation-status.json", status)
    rows = {row["role"]: row for row in scalar["rows"]}
    report = "# V3 Continuation Result\n\n**BLOCKED / UNFROZEN. Not a complete local V3 packet, live admission, or manufacturing release.**\n\n"
    report += "## Measured Result\n\nThe unauthorized split of X44 body 0 was removed. Both original solids are preserved by rigid location only: combined housing/shaft presentation plus fixed rear cover. There is no vendor rotor solid. OpenCascade `IsPartner` confirms unchanged underlying source topology for all six bodies from five vendor files. X60 is excluded. No original COTS bytes or manifest were written.\n\n"
    report += f"- X44 main STEP volume error: {rows['cots_x44_main']['volumeErrorMm3']:.12f} mm3; unchanged budget {rows['cots_x44_main']['volumeBudgetMm3']:.12f} mm3: FAIL.\n- X44 rear-cover STEP volume error: {rows['cots_x44_rear_cover']['volumeErrorMm3']:.12f} mm3; unchanged budget 0.01 mm3: FAIL.\n- Bearing, pinion, output gear and AndyMark REV2 wheel pass the original scalar/bounds budgets. Pinion/gear/wheel also pass the current sampled B-rep correspondence check. Bearing correspondence is UNVERIFIED because UV reparameterization invalidates the existing point-to-point sampler.\n- Original-OBB-frame errors are below 1e-11 mm for all six bodies. This rules out a gross source-frame error, not a STEP geometry mismatch. X44 rear-cover surface-type counts change on readback. Tighter integration and recentering did not cure the earlier main-body discrepancy; disabling pcurves does not cure the current X44 corpus. The exact OCCT serialization/healing mechanism is not proven.\n- {result.testsRun} focused regressions pass; {checks['connectorFrameChecks']} parameter-frame checks, {len(connectors['connectors'])} source connector definitions, {budget['counts']['instances']} native instances, {budget['counts']['mates']} mates and {budget['counts']['relations']} relations. These are local definitions/algebra, not native readback or physical tests.\n- V1/V2 source and artifact freeze verification passes. No new V3 sweep, full assembly export or freeze was executed after the failed narrow gate.\n\n"
    report += "## Current Artifacts\n\n- [Status and hashes](continuation-status.json)\n- [Corrected complete local contract](current/assembly-contract.json)\n- [Unchanged source bindings and diagnostic STEP paths](current/cots-bindings.json)\n- [Geometry payload](current/source/geometry-payload.json)\n- [Source connector frames](current/source/parametric-connectors.json)\n- [FeatureScript candidate, uncompiled](current/source/concept-a.fs)\n- [Controls and native limitations](current/ui-edit-map.json)\n- [Regression result](current/tests.json)\n- [Default source corpus](original-source-roundtrip-probe.json)\n- [No-pcurve experiment](original-source-roundtrip-no-pcurves-probe.json)\n- [Source OBB/B-rep evidence](source-brep-roundtrip-probe.json)\n\nOlder root `source/`, `baseline/`, quick validation and phase artifacts predate this corrected contract. They are retained as historical failure evidence, not current source geometry or an admitted packet. The six `source-probe/` STEP exports are diagnostic; the X44 exports failed equivalence.\n\n"
    report += "## Reproduction\n\nFrom the repository root, the runner uses only the existing explicit CadQuery environment, preloads its installed VTK, denies socket/child-process operations in Python, and waits for one process without polling or installing anything.\n\n```powershell\nnode trials/subsystem-ab/shared/v3_run.mjs v3_source_probe.py\nnode trials/subsystem-ab/shared/v3_run.mjs v3_source_probe.py --no-pcurves\nnode trials/subsystem-ab/shared/v3_run.mjs v3_brep_probe.py\nnode trials/subsystem-ab/shared/v3_run.mjs v3_resume_test.py\nnode trials/subsystem-ab/shared/v3_run.mjs v3_resume_report.py\n```\n\nThe first three return failure by design while the measured gate remains unresolved; regression PASS tests that failures cannot be hidden. `v3_finish.py` now runs fresh scalar and B-rep source gates before attempting a full sweep or freeze. The standalone X44 probe supports `--boundary-only` and retains separate historical partition evidence.\n\n"
    report += f"## Remaining Gates\n\n" + "\n".join("- " + gate for gate in status["remainingGates"]) + f"\n\nThe cap is 150 global attempted requests, 140 API plus 10 overhead, not 45 instances. The conservative fresh-arm plan is {budget['requiredFreshArmHeadroom']} attempts, not an allowance to reset an existing ledger. Actual remaining headroom was not read. Native rigid groups are conditional on supported schemas and readback of every logical member.\n\nOnly shared code/local artifacts were written. Zero API/network/browser actions, credentials access, downloads, installs, commits or delegates. No physical hardware or manufacturing certification is claimed.\n"
    (PACKET / "REPORT.md").write_text(report, encoding="utf8")
    assert source_hashes == source_snapshot()
    assert upstream_hashes == upstream_snapshot()
    print(json.dumps({"status": status["status"], "tests": result.testsRun, "nativeInstances": status["nativeInstances"], "sourceConnectorDefinitions": len(connectors["connectors"]), "freshArmPlan": budget["requiredFreshArmHeadroom"], "fullV3Run": status["fullV3Run"], "report": str(PACKET / "REPORT.md")}, indent=2), flush=True)


if __name__ == "__main__":
    publish()