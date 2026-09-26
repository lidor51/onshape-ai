import copy
import json
from pathlib import Path
import sys
import time

import numpy as np

from cad_core import ROOT, NETWORK_EVENTS, bounds, cq, solid_check
import package_packet as legacy
from v2_packet import verify_freeze as verify_v2
from v3_checks import phase_checks
from v3_contract import connector_contract, digest, mate_frames, source_candidate
from v3_model import PACKET, imported_product, make_design, neutral_shapes, pose_matrix, source_body
from v3_sources import COTS, PRODUCT_FILES, sha
from v3_source_probe import probe as source_probe
from v3_brep_probe import probe as brep_probe
from v3_validate import validate


SOURCES = legacy.SOURCE_FILES + ["v2_model.py", "v2_reducer.py", "v2_packet.py", "v2_test.py", "v3_model.py", "v3_gears.py", "v3_sources.py", "v3_validate.py", "v3_checks.py", "v3_contract.py", "v3_finish.py", "v3_source_probe.py", "v3_roundtrip_probe.py", "v3_brep_probe.py", "v3_resume_test.py", "v3_resume_report.py", "v3_run.mjs"]
UPSTREAM = ["manifest.json", "import-packet.json", "attachment-points.json", "../PROTOCOL.md"]


def source_snapshot():
    result = {name: sha(ROOT / name) for name in SOURCES}
    for path in sorted((ROOT / "vendor").rglob("*")):
        if path.is_file() and "__pycache__" not in path.parts:
            result[path.relative_to(ROOT).as_posix()] = sha(path)
    return result


def upstream_snapshot():
    return {name: sha(COTS / name) for name in UPSTREAM + ["cache/" + filename for filename in PRODUCT_FILES.values()]}


def write_json(name, data):
    legacy.write_json(PACKET / name, data)


def check_shape(shape, original=None, expected_count=1):
    record = solid_check(shape)
    okay = record["valid"] and record["closed"] and record["solids"] == expected_count and record["volumeMm3"] > 0
    if original is not None:
        record["volumeErrorMm3"] = abs(shape.Volume() - original.Volume())
        record["boundsMaximumErrorMm"] = float(np.max(np.abs(np.array(bounds(shape)) - bounds(original))))
        okay = okay and record["volumeErrorMm3"] < max(0.01, original.Volume() * 1e-7) and record["boundsMaximumErrorMm"] < 0.001
    record["status"] = "PASS" if okay else "FAIL"
    return record


def export_step(path, bodies):
    path.parent.mkdir(parents=True, exist_ok=True)
    assembly = cq.Assembly(name="Concept_A_v3_" + path.stem)
    for name, shape in bodies.items():
        assembly.add(shape, name=name)
    assembly.save(str(path), exportType="STEP", mode="default")
    readback = cq.importers.importStep(str(path)).val()
    original = cq.Compound.makeCompound(list(bodies.values()))
    record = check_shape(readback, original, len(bodies))
    record.update(path=path.relative_to(PACKET).as_posix(), sha256=sha(path), localNotOnshapeExport=True)
    if record["status"] != "PASS":
        raise ValueError("STEP round trip failed: " + str(path))
    return record


def preview(placed, design, path, title):
    from PIL import Image, ImageDraw, ImageFont
    drawing = copy.deepcopy(design)
    for part in drawing["parts"].values():
        if part["category"] == "cots":
            part["category"] = "cots-envelope"
    result = legacy.preview(placed, drawing, path, title)
    with Image.open(path) as source:
        image = source.convert("RGB")
    painter = ImageDraw.Draw(image)
    for rectangle in [(38, 55, 1600, 84), (38, 1048, 1600, 1090)]:
        painter.rectangle(rectangle, fill=(246, 247, 248))
    painter.text((40, 57), "LOCAL CAD PROTOTYPE | actual vendor-derived bodies | NOT MANUFACTURING RELEASE", fill=(172, 39, 39), font=ImageFont.load_default(size=18))
    painter.text((40, 1050), "Blue: generated custom parts   Gold: unchanged authentic COTS   Red: bumper keepout", fill=(30, 38, 46), font=ImageFont.load_default(size=17))
    image.save(path)
    colors = image.getcolors(image.width * image.height)
    result.update(colorCount=len(colors), nonBackgroundPixels=sum(count for count, color in colors if color != (246, 247, 248)))
    return result


def budget_plan(design):
    instances = len(design["instances"]) - 1
    mates = len(design["joints"]) - 1
    relations = len(design["relations"])
    phases = {"instanceInsertsWithoutBatchAssumption": instances, "mates": mates, "relations": relations, "documentAndElements": 4, "preparedCotsImportAndBoundedStatus": 3, "featureStudioWriteAndFeature": 3, "sourceIdentityInspection": 1, "groundRoot": 1, "baselineHealthAndExport": 3, "parameterRevision": 1, "revisionHealthAndExport": 3, "reservedUncertainOrRepairAttempts": 3}
    total = sum(phases.values())
    return {"status": "CONDITIONAL_REMAINING_LEDGER_AND_SUPPORTED_NATIVE_SOURCE", "globalAttemptCap": 150, "apiArmAttemptCap": 140, "overheadReserved": 10, "localAuthenticatedAttempts": 0, "counts": {"instances": instances, "mates": mates, "relations": relations}, "conservativeFreshArmAttemptPlan": phases, "requiredFreshArmHeadroom": total, "withinFresh140": total <= 140, "remainingActualApiHeadroom": None, "actualLedgerRead": False, "noHard45InstanceLimit": True, "sourceStrategy": "One prepared six-body COTS STEP only after strict source round trips pass; generated custom bodies and source-owned parametric connectors; mate solver positions each instance. Native part and connector IDs must be observed. No assumed multi-instance endpoint or uncounted poll/retry.", "admissionRule": "Parent must account all prior attempted requests in the persistent ledger. This plan is not 140 additional calls and cannot waive remaining headroom, allowance/reserve or source-connector compilation. Stop if bounded import/status or native connector ownership is unsupported.", "batching": "Native rigid groups or documented insertion optimizations may lower cost only after parent verifies supported schemas and readback of every logical member; not credited here."}


def static_checks(design):
    sealed = verify_v2()
    contract = connector_contract(design)
    source, layouts = source_candidate(design, contract)
    assert not any("envelope" in role for role in design["parts"] if role.startswith("cots_"))
    assert all(binding["product"] != "x60" for binding in design["cotsBindings"].values())
    assert "cots_x44_shaft" not in design["parts"]
    assert all("derivedPartition" not in binding for binding in design["cotsBindings"].values())
    assert sorted(binding["sourceBodyIndex"] for binding in design["cotsBindings"].values() if binding["product"] == "x44") == [0, 1]
    assert len(contract["connectors"]) == 2 * (len(design["joints"]) - 1)
    upstream = json.loads((COTS / "import-packet.json").read_text())
    allowed = {entry["sha256"] for entry in upstream["allowed_import_candidates"]}
    assert all(binding["sha256"] in allowed for binding in design["cotsBindings"].values())
    assert all(np.allclose(np.array(binding["sourceToNeutralRowMajorMm"])[:3, :3].T @ np.array(binding["sourceToNeutralRowMajorMm"])[:3, :3], np.eye(3)) for binding in design["cotsBindings"].values())
    return {"status": "PASS", "connectorFrameChecks": contract["evaluatedConnectorFrames"], "sourceConnectorCount": len(contract["connectors"]), "cotsBindingChecks": len(design["cotsBindings"]), "preservedV1AndV2": "PASS", "v2FreezeSha256": sha(ROOT / "packet-v2" / "freeze.json"), "v1FreezeSha256": sha(ROOT / "packet-v1" / "freeze.json"), "nativeCompilation": "UNVERIFIED"}, contract, source, layouts


def verify():
    freeze = json.loads((PACKET / "freeze.json").read_text())
    for name, expected in freeze["artifactSha256"].items():
        assert sha(PACKET / name) == expected, name
    assert source_snapshot() == freeze["sourceSha256"]
    assert upstream_snapshot() == freeze["cotsUpstreamSha256"]
    verify_v2()
    assert sha(ROOT / "packet-v2" / "freeze.json") == freeze["preserved"]["v2FreezeSha256"]
    assert sha(ROOT / "packet-v1" / "freeze.json") == freeze["preserved"]["v1FreezeSha256"]
    return {"status": "PASS", "artifacts": len(freeze["artifactSha256"]), "sourceFiles": len(freeze["sourceSha256"]), "cotsInputs": len(freeze["cotsUpstreamSha256"]), "admission": freeze["apiBrowserAdmission"]}


def finish():
    if (PACKET / "freeze.json").exists():
        raise RuntimeError("V3 is sealed; use --verify")
    if source_probe()["status"] != "PASS":
        raise RuntimeError("V3_SOURCE_ROUNDTRIP_BLOCKED: unchanged source geometry failed the existing strict STEP gate; no freeze or full sweep was run")
    if brep_probe()["status"] != "PASS":
        raise RuntimeError("V3_SOURCE_BREP_BLOCKED: source-frame geometry correspondence is not verified; no freeze or full sweep was run")
    started = time.perf_counter()
    snapshot, upstream = source_snapshot(), upstream_snapshot()
    design = make_design()
    checks, connectors, source, layouts = static_checks(design)
    (PACKET / "source").mkdir(exist_ok=True)
    (PACKET / "source" / "concept-a.fs").write_text(source, encoding="utf8")
    write_json("source/geometry-payload.json", {"schema": "INTERNAL_CONSTRUCTION_RECIPE_NOT_REST", "modelSha256": digest(design), "parts": design["parts"], "parameters": design["parameters"], "customLayoutOffsetsMm": layouts, "cotsLayoutOffsetsMm": {role: [0, 0, 0] for role in design["cotsBindings"]}, "nativeCompilation": "UNVERIFIED", "sourceUnit": "millimeter"})
    write_json("source/parametric-connectors.json", connectors)
    for name in snapshot:
        target = PACKET / "source" / "local" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((ROOT / name).read_bytes())
    expected = {}
    cached_shapes = {}

    def export_pose(current_design, variant, angle, shapes, frames, placed):
        if variant not in expected:
            expected[variant] = {"controls": design["parameters"][variant], "parts": {}, "poses": {}, "mates": mate_frames(design, design["parameters"][variant])}
            cached_shapes[variant] = shapes
            for role, shape in shapes.items():
                print("Neutral STEP", variant, role, flush=True)
                expected[variant]["parts"][role] = export_step(PACKET / variant / "parts" / (role + ".step"), {role: shape})
        name = "deployed" if angle == 0 else "mid" if angle == -72.5 else "stowed" if angle == -145 else "pose_" + str(abs(angle)).replace(".", "p")
        print("Pose STEP", variant, name, flush=True)
        record = export_step(PACKET / variant / (name + ".step"), placed)
        record.update(angleDeg=angle, instanceTransformsRowMajorMm={role: frame.tolist() for role, frame in frames.items()})
        if name in {"deployed", "mid", "stowed"}:
            record["preview"] = preview(placed, design, PACKET / variant / (name + ".png"), "Concept A v3 | " + variant + " | " + name)
        expected[variant]["poses"][name] = record
        write_json("expected-progress.json", expected)
        return {key: record[key] for key in ["status", "path", "sha256", "solids", "volumeErrorMm3", "boundsMaximumErrorMm"]}

    validation = validate(export_callback=export_pose)
    phase_variants = {variant: phase_checks(design=design, shapes=cached_shapes[variant], variant=variant) for variant in ["baseline", "revision"]}
    phase = {"status": "PASS" if all(result["status"] == "PASS" for result in phase_variants.values()) else "FAIL", "modelSha256": digest(design), "variants": phase_variants, "samples": [row for result in phase_variants.values() for row in result["samples"]], "wallSeconds": sum(result["wallSeconds"] for result in phase_variants.values())}
    write_json("gear-phase.json", phase)
    write_json("expected.json", expected)
    prepared = {role: cached_shapes["baseline"][role] for role in design["cotsBindings"]}
    prepared_step = export_step(PACKET / "source" / "cots-prepared.step", prepared)
    unchanged = all(imported_product(binding["product"]).Solids()[binding["sourceBodyIndex"]].wrapped.IsPartner(source_body(role).wrapped) for role, binding in design["cotsBindings"].items())
    preservation = {"status": "PASS" if unchanged else "FAIL", "method": "OpenCascade IsPartner: identical underlying topology with only rigid Location changes", "sourceSolidCount": 2, "preparedX44SolidCount": 2, "rearCoverIsRotor": False, "independentRotorAvailable": False}
    write_json("cots-bindings.json", {"status": "PASS_UNMODIFIED_AUTHENTIC_SOURCE_GEOMETRY" if unchanged else "FAIL", "bindings": design["cotsBindings"], "preparedStep": prepared_step, "x44SourcePreservation": preservation, "unsplitBearingRepresentation": "Vendor bearing is a single body carried by its hex shaft. Its circular outer surfaces are rotationally invariant; internal race/ball motion is not modeled or vendor-certified.", "wheelRevision": "REV2 CAD only; not asserted equivalent to REV3 drawing or green material variant", "originalBytes": upstream, "redistributionLicense": "NOT_ESTABLISHED_LOCAL_USER_CACHE_ONLY", "x60": "QUARANTINED_INVALID_EXCLUDED"})
    write_json("assembly-contract.json", {**design, "nativeInstanceCount": len(design["instances"]) - 1, "nativeMateCount": len(design["joints"]) - 1, "nativeRelationCount": len(design["relations"]), "diagnosticCoralExcludedFromNative": True, "baselineMates": expected["baseline"]["mates"], "revisionMates": expected["revision"]["mates"], "sourceConnectors": "source/parametric-connectors.json", "transformConvention": "4x4 row-major, column-vector, mm translation; joint +Z is revolute axis", "nativeIds": "UNOBSERVED_NOT_FABRICATED", "nativeHealth": "UNVERIFIED"})
    changed = [role for role in design["parts"] if abs(expected["baseline"]["parts"][role]["volumeMm3"] - expected["revision"]["parts"][role]["volumeMm3"]) > 0.001]
    baseline_pose = expected["baseline"]["poses"]["deployed"]["instanceTransformsRowMajorMm"]
    revision_pose = expected["revision"]["poses"]["deployed"]["instanceTransformsRowMajorMm"]
    revision_okay = len(changed) > 0 and baseline_pose["receiver"] == revision_pose["receiver"] and baseline_pose["pivot_spine"] == revision_pose["pivot_spine"]
    write_json("revision-report.json", {"status": "PASS" if revision_okay else "FAIL", "changedSourceParts": changed, "widthBeforeMm": 500, "widthAfterMm": 520, "sameLocalPartInstanceMateRoleIds": True, "pivotAndReceiverPreserved": revision_okay, "nativeIdentityRetention": "UNVERIFIED", "sourceConnectorAlgebra": checks})
    write_json("ui-edit-map.json", {"featureName": "Concept A v3 prototype", "featureSymbol": "conceptAShared", "controls": design["parameters"]["controls"], "mouthWidth": {"baselineMm": 500, "revisionMm": 520, "affectedGeometry": changed, "clearSidePlateWidthMm": "mouthWidth + 4", "beltWidthMm": "mouthWidth - 60"}, "receiverHeight": {"sourceEffect": "fork leg length = receiverHeight - 110; placement Z = receiverHeight + 85", "independentOf": "mouthWidth"}, "cotsSourceBindingInputs": list(design["cotsBindings"]), "automaticSourceMateConnectors": True, "sourceDefaultCoralReference": False, "sourceDefaultCotsBinding": False, "nativeCompilation": "UNVERIFIED", "humanUIObserved": False})
    budget = budget_plan(design)
    write_json("api-source-plan.json", budget)
    write_json("bom.json", {"manufacturingRelease": "UNVERIFIED_NOT_RELEASED", "parts": [{"role": role, "quantity": sum(item["part"] == role for item in design["instances"]), "category": part["category"], "provenance": part["geometryProvenance"], "notes": part["notes"]} for role, part in design["parts"].items()], "generatedGears": "CQ_Gears pinned source; custom 96/128/16-tooth polyline geometry, not vendor or load qualified", "omittedDetailedHardware": "Motor/hub/cheek joining screws, axial collars, positive retention, covers, powered-off brake/hard stops, wiring and sensors require engineering. Rigid modules are not monolithic stock. No manufacturing release implied."})
    full_samples = [sample for variant in validation["variants"].values() for sample in variant["samples"]]
    geometry_okay = validation["status"] == "PASS" and phase["status"] == "PASS" and preservation["status"] == "PASS" and revision_okay and len(full_samples) == 62
    reasons = [] if geometry_okay else ["Geometry/interface/round-trip checks failed; see validation.json and gear-phase.json"]
    reasons.append("Native source/connector ownership and compilation unverified offline; no supported live ID binding has been observed")
    reasons.append("Actual remaining 140-arm ledger headroom is owned by parent and not read here; conservative fresh-arm plan requires " + str(budget["requiredFreshArmHeadroom"]) + " attempts including reserve")
    admission = {"status": "BLOCKED_LIVE_ADMISSION", "localCadPrototype": "PASS" if geometry_okay else "FAIL", "apiBrowserAdmission": "BLOCKED", "reasons": reasons, "torqueProof": "UNVERIFIED_NOT_A_LOCAL_CAD_GEOMETRY_BLOCKER", "manufacturingRelease": "UNVERIFIED_NOT_RELEASED", "nativeAssembly": "UNVERIFIED", "annualAllowanceAnd500Reserve": "PARENT_MUST_VERIFY_NO_AUTH_HERE", "apiCalls": 0}
    write_json("admission.json", admission)
    checks.update(geometryStatus=validation["status"], gearPhaseStatus=phase["status"], gearPhaseSamples=len(phase["samples"]), deploymentPoseCount=len(full_samples), pairChecks=sum(sample["pairCount"] for sample in full_samples), neutralRoundTrips=sum(len(value["parts"]) for value in expected.values()), assemblyRoundTrips=sum(len(value["poses"]) for value in expected.values()), cotsPreparedRoundTrips=1, sourcePreservationStatus=preservation["status"], revisionStatus="PASS" if revision_okay else "FAIL", skipped=0)
    checks["status"] = "PASS" if geometry_okay else "FAIL"
    write_json("tests.json", checks)
    write_json("runtime.json", {"pythonExecutable": sys.executable, "apiCalls": 0, "newPublicDownloads": 0, "networkAuditDeniedEvents": NETWORK_EVENTS, "wallSeconds": time.perf_counter() - started, "validationSeconds": validation["wallSeconds"], "phaseSeconds": phase["wallSeconds"], "scope": "Completed local execution only; prior interrupted interactive probes are not counted as passes"})
    assert snapshot == source_snapshot(), "Source changed during final run"
    assert upstream == upstream_snapshot(), "COTS upstream changed during final run"
    report = "# V3 Local Subsystem Packet\n\nFINISHED LOCAL EXECUTION. **" + admission["localCadPrototype"] + " local CAD prototype; LIVE ADMISSION BLOCKED; NOT MANUFACTURING RELEASE.**\n\n"
    report += "## Measured Checks\n\n"
    report += f"- {checks['deploymentPoseCount']} deployment poses, {checks['pairChecks']} unordered pair checks, baseline/revision. No gear or shaft-bearing overlap exclusions.\n- {checks['neutralRoundTrips']} neutral STEP round trips, {checks['assemblyRoundTrips']} {len(design['instances'])}-solid assembly round trips, one six-body prepared COTS STEP, six real tessellation PNGs.\n- {checks['gearPhaseSamples']} conjugate tooth-phase samples: {phase['status']}; source preservation: {preservation['status']}; {checks['connectorFrameChecks']} source-connector parameter checks.\n- Minimum sampled moving-to-bumper clearance: {min(sample['minimumMovingToBumperMm'] for sample in full_samples):.6f} mm. Continuous swept clearance and physical motion are not proven.\n- {budget['counts']['instances']} native instances, {budget['counts']['mates']} mates, {budget['counts']['relations']} relations, {checks['sourceConnectorCount']} source connector definitions. Diagnostic coral adds one solid/mate to local exports only.\n\n"
    report += "## Provenance And Limitations\n\nFive authentic cached vendor files are hash-bound. Both X44 solids are unchanged: body 0 is the combined housing/shaft presentation and body 1 is the fixed rear cover. No independent source rotor exists; internal motor kinematics remain UNVERIFIED. X60 is quarantined and excluded. The molded wheel's undersized hex press fit is an exact two-pair exception, not a general COTS clash waiver. Bearing internal races are not resolved. Generated 96/128/16 teeth use pinned CQ_Gears source and are not vendor or load-qualified gears. The two-stage 8:1 x 6:1 reducer is explicit geometry, not an opaque box.\n\nTorque/material/retention, joining hardware, guarding, wiring, brake/hard stops, friction, acquisition and manufacturing release remain UNVERIFIED. They are not relabeled PASS and torque proof alone does not block geometric CAD representability.\n\n"
    report += "## Admission And Budget\n\n" + "\n".join("- " + reason for reason in reasons) + "\n- The actual cap is 150 global / 140 API / 10 overhead, not 45 instances. No authenticated requests, credentials, browser, downloads, delegates or commits were used. Do not reset or waive the existing ledger.\n\n"
    report += "## Exact API Handoff\n\n- `freeze.json`: verify all input/artifact hashes first.\n- `source/concept-a.fs`: parametric custom bodies and owner-bound connectors; native compilation UNVERIFIED.\n- `source/cots-prepared.step` and `cots-bindings.json`: six named unchanged neutral source bodies plus exact original-source provenance; local STEP, not cloud export.\n- `source/geometry-payload.json`, `source/parametric-connectors.json`: layout subtraction and neutral-frame rules.\n- `assembly-contract.json`, `expected.json`, `revision-report.json`, `ui-edit-map.json`: individual instances, mate frames, relations and retained-role revision.\n- `api-source-plan.json`, `admission.json`, `tests.json`, `validation.json`, `gear-phase.json`: budget and admission evidence.\n\nBaseline/revision `deployed.step`, `mid.step`, `stowed.step` and matching PNGs are viewable local artifacts. Remaining 28 pose STEPs per variant cover the entire sampled sweep. All legacy v1/v2 hashes verified unchanged; early v3 failure probes remain evidence. Native assembly is still required; importing an assembly-shaped STEP does not satisfy the trial.\n"
    (PACKET / "REPORT.md").write_text(report, encoding="utf8")
    artifacts = {path.relative_to(PACKET).as_posix(): sha(path) for path in sorted(PACKET.rglob("*")) if path.is_file() and not path.name.endswith(".log")}
    freeze = {"packetVersion": "concept-a-local-v3", "status": "FROZEN_LOCAL_CAD_" + admission["localCadPrototype"] + "_LIVE_BLOCKED", "apiBrowserAdmission": "BLOCKED", "modelSha256": digest(design), "sourceSha256": snapshot, "cotsUpstreamSha256": upstream, "artifactSha256": artifacts, "preserved": {key: checks[key] for key in ["v1FreezeSha256", "v2FreezeSha256"]}, "sharedApiCalls": 0, "mutableLogsExcluded": True, "snapshotRule": "Immutable packet. Hash, geometry or source changes require a new version and fresh checks."}
    write_json("freeze.json", freeze)
    print(json.dumps({"result": "FINISHED", "admission": admission, "tests": checks, "freezeVerification": verify()}, indent=2), flush=True)


if __name__ == "__main__":
    if "--verify" in sys.argv:
        print(json.dumps(verify(), indent=2))
    elif "--check" in sys.argv:
        checks, connectors, source, layouts = static_checks(make_design())
        print(json.dumps({**checks, "budget": budget_plan(make_design())}, indent=2))
    else:
        finish()