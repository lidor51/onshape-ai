import hashlib
import json
from pathlib import Path
import sys
import time

from cad_core import ROOT, NETWORK_EVENTS, bounds
from model import resolve_model
import package_packet as legacy
from v2_model import PACKET, make_design
from v2_reducer import engineering_report


SOURCE_FILES = legacy.SOURCE_FILES + ["v2_model.py", "v2_reducer.py", "v2_packet.py", "v2_test.py"]


def digest(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def verify_hashes(base, entries):
    base = base.resolve()
    for name, expected in entries.items():
        path = (base / name).resolve()
        if not path.is_relative_to(base) or not path.is_file() or legacy.sha(path) != expected:
            raise ValueError("Stale or unsafe source: " + name)


def verify_v1():
    directory = ROOT / "packet-v1"
    manifest = json.loads((directory / "freeze.json").read_text())
    verify_hashes(directory, manifest["artifactSha256"])
    verify_hashes(ROOT, manifest["sourceSha256"])
    return {"status": "PASS", "freezeSha256": legacy.sha(directory / "freeze.json"), "artifactCount": len(manifest["artifactSha256"]), "rootSourceCount": len(manifest["sourceSha256"]), "upstream": "Historical upstream hashes retained in v1; upstream and sibling arms not reread"}


def verify_freeze(manifest=None):
    manifest = manifest if manifest is not None else json.loads((PACKET / "freeze.json").read_text())
    verify_hashes(PACKET, manifest["artifactSha256"])
    verify_hashes(ROOT, manifest["sourceSha256"])
    if legacy.sha(ROOT / "packet-v1" / "freeze.json") != manifest["preservedV1"]["freezeSha256"]:
        raise ValueError("V1 seal changed")
    verify_v1()
    return manifest


def gate_report(validation, engineering):
    geometry_okay = validation["status"] == "PASS"
    return {"status": "BLOCKED", "apiCalls": 0, "localGeometry": "PASS" if geometry_okay else "FAIL", "nonVendorGeometry": "PASS" if geometry_okay else "FAIL", "nonVendorBuild": engineering["status"], "partBudget": engineering["budget"]["status"], "authenticCots": "PENDING_PARENT_MANIFEST", "nativeSourceCompilation": "UNVERIFIED_ZERO_LIVE_CALLS", "nativeAssemblyExecution": "UNVERIFIED_ZERO_LIVE_CALLS", "provisionalAssemblySubset": "GEOMETRY_CANDIDATE_ONLY_NOT_ADMITTED", "mechanicallyReleased": False, "reasons": ([] if geometry_okay else ["Local all-pairs geometry failed"]) + ["Full native assembly has 48 instances, exceeding the conservative 45-instance budget", "Deployment tooth manufacture, material/load ratings, joints and retention remain UNVERIFIED_BUILD", "Authentic COTS manifest remains PENDING and was not read; binding requires a fresh fit and collision gate"], "scope": "Geometry PASS is separate from COTS and build acceptance. No full-pass or upload authorization is inferred."}


def admission():
    verify_freeze()
    validation = json.loads((PACKET / "validation.json").read_text())
    engineering = json.loads((PACKET / "deployment-drive.json").read_text())
    return gate_report(validation, engineering)


def corrected_preview(placed, design, path, title):
    from PIL import Image, ImageDraw, ImageFont
    result = ORIGINAL_PREVIEW(placed, design, path, title)
    with Image.open(path) as source:
        image = source.convert("RGB")
    painter = ImageDraw.Draw(image)
    painter.rectangle((38, 55, 1585, 84), fill=(246, 247, 248))
    painter.text((40, 57), "LOCAL sampled geometry PASS | BUILD UNVERIFIED | COTS PENDING | NOT RELEASED", fill=(172, 39, 39), font=ImageFont.load_default(size=18))
    image.save(path)
    colors = image.getcolors(image.width * image.height)
    result.update(colorCount=len(colors), nonBackgroundPixels=sum(count for count, color in colors if color != (246, 247, 248)))
    return result


ORIGINAL_PREVIEW = legacy.preview


def assemble_packet():
    if (PACKET / "freeze.json").exists():
        raise RuntimeError("V2 is sealed; overwrite forbidden")
    started = time.perf_counter()
    preserved = verify_v1()
    design = make_design(json.loads((ROOT / "parameters.json").read_text()))
    validation = json.loads((PACKET / "validation.json").read_text())
    if validation["status"] != "PASS":
        raise ValueError("Do not export a colliding mechanism")
    for variant in ["baseline", "revision"]:
        if set(validation["variants"][variant]["solids"]) != set(design["parts"]):
            raise ValueError("Validation does not cover current part roles")
    source_directory = PACKET / "source"
    source_directory.mkdir(exist_ok=True)
    for name in SOURCE_FILES:
        (source_directory / name).write_bytes((ROOT / name).read_bytes())
    legacy.write_json(source_directory / "parameters-v2.json", design["parameters"])
    source, layouts = legacy.featurescript(design)
    if source.count("{") != source.count("}") or "deploy_motor_reducer_envelope" in source:
        raise ValueError("Invalid generated source")
    (source_directory / "concept-a.fs").write_text(source, encoding="utf8")
    payload = {"schema": "Internal construction recipe, NOT Onshape API JSON", "parts": design["parts"], "parameters": design["parameters"], "partStudioLayoutOffsetsMm": layouts, "sourceToNeutral": "Subtract the role layout offset, then apply its neutral-to-world instance matrix; translations in millimeters", "featureScriptCompilation": "UNVERIFIED_OFFLINE_EMITTER_ONLY"}
    legacy.write_json(source_directory / "geometry-payload.json", payload)
    legacy.preview = corrected_preview
    try:
        expected = {}
        for variant in ["baseline", "revision"]:
            print("Export and STEP round trip: " + variant, flush=True)
            expected[variant] = legacy.export_variant(design, variant, PACKET / variant)
    finally:
        legacy.preview = ORIGINAL_PREVIEW
    legacy.write_json(PACKET / "expected.json", expected)
    legacy.write_json(PACKET / "assembly-contract.json", {**design, "nativeInstanceCount": len(design["instances"]) - 1, "instanceCountIncludingDiagnosticCoral": len(design["instances"]), "baselineMates": expected["baseline"]["mateFramesDeployed"], "revisionMates": expected["revision"]["mateFramesDeployed"], "geometryHealth": "PASS_SAMPLED_LOCAL_ONLY", "nativeStatus": "UNVERIFIED", "requiredNativeBehavior": "Named individual parts, fixed/revolute mates and transmission relations; static STEP compound is insufficient", "transformConvention": "4x4 row-major, column-vector, millimeter translation; neutral part to world; joint Z is revolute axis"})
    changes = []
    for name in design["parts"]:
        first = expected["baseline"]["parts"][name]["measured"]
        second = expected["revision"]["parts"][name]["measured"]
        if abs(first["volumeMm3"] - second["volumeMm3"]) > 0.001:
            changes.append({"part": name, "volumeDeltaMm3": second["volumeMm3"] - first["volumeMm3"], "boundsBeforeMm": first["boundsMm"], "boundsAfterMm": second["boundsMm"]})
    receiver_shapes, receiver_placed = resolve_model(design, design["parameters"]["receiverControlProbe"])
    legacy.write_json(PACKET / "revision-report.json", {"status": "PASS_LOCAL_GEOMETRY_AND_DATUM_PRESERVATION", "changedSourceParts": changes, "samePartRoleIds": True, "sameInstanceIds": True, "sameMateIds": True, "pivotOriginBeforeMm": design["parameters"]["pivotOriginMm"], "pivotOriginAfterMm": design["parameters"]["pivotOriginMm"], "receiverAttachmentBefore": expected["baseline"]["poses"]["deployed"]["instanceTransformsRowMajorMm"]["receiver"], "receiverAttachmentAfter": expected["revision"]["poses"]["deployed"]["instanceTransformsRowMajorMm"]["receiver"], "receiverIndependentProbe": {"controls": design["parameters"]["receiverControlProbe"], "receiverBoundsMm": bounds(receiver_placed["receiver"]), "receiverVolumeMm3": receiver_shapes["receiver_reference"].Volume()}, "nativeIdentityRetention": "UNVERIFIED"})
    ui = json.loads((ROOT / "packet-v1" / "ui-edit-map.json").read_text())
    ui["controls"]["mouthWidth"]["affectedGeometry"] = [entry["part"] for entry in changes]
    ui["packetVersion"] = "concept-a-local-v2"
    legacy.write_json(PACKET / "ui-edit-map.json", ui)
    legacy.write_json(PACKET / "cots-bindings-pending.json", legacy.binding_manifest(design))
    engineering = engineering_report(design)
    legacy.write_json(PACKET / "deployment-drive.json", engineering)
    legacy.write_json(PACKET / "admission.json", gate_report(validation, engineering))
    legacy.write_json(PACKET / "bom.json", {"mechanicallyReleased": False, "budget": engineering["budget"], "parts": [{"role": name, "quantity": sum(item["part"] == name for item in design["instances"]), "category": part["category"], "material": part["material"], "notes": part["notes"]} for name, part in design["parts"].items()], "newRigidModulePhysicalBreakdown": {"deploy_support_module": ["existing tower/foot", "two flat gearbox cheeks", "four turned spacers", "one bridge", "joining fasteners unselected"], "deploy_compound_shaft_module": ["one 128t gear", "one hex shaft", "one 16t pinion", "hubs and axial retainers unselected"]}, "omittedHardware": "Retain v1 omissions: motor/deck/hub screws, collars, tube/drum/ramp/guard joints. New gearbox joining and axial retention also incomplete; not released."})
    frame_contract = {variant: {"poses": {name: pose["instanceTransformsRowMajorMm"] for name, pose in result["poses"].items()}, "mates": result["mateFramesDeployed"]} for variant, result in expected.items()}
    legacy.write_json(PACKET / "io-contract.json", {"units": "mm", "recipeSha256": digest(design["parts"]), "parametersSha256": digest(design["parameters"]), "layoutSha256": digest(layouts), "neutralPartFrameSha256": digest(frame_contract), "featureSourceSha256": legacy.sha(source_directory / "concept-a.fs"), "inputSources": SOURCE_FILES, "neutralPartSteps": {variant: {name: {"path": variant + "/" + entry["neutralStep"], "sha256": entry["sha256"]} for name, entry in result["parts"].items()} for variant, result in expected.items()}, "placementRule": "Source layout offset subtraction precedes neutral-to-world transform; no automatic scale or mirror", "freezeScope": "Source files, recipe, parameters, UI map, neutral STEP bytes, pose/mate frames and every exported artifact"})
    legacy.write_json(PACKET / "runtime.json", {"pythonExecutable": sys.executable, "apiCalls": 0, "networkAuditDeniedEvents": NETWORK_EVENTS, "exportWallSeconds": time.perf_counter() - started, "validationWallSeconds": validation["wallSeconds"], "sourceAndEnvironment": "Existing manufacturing venv, -u -B; no environment changes", "priorInterruptedAttempts": "Initial import/Boolean/distance calls were interrupted; only the completed stored full sweeps support PASS"})
    legacy.write_json(PACKET / "v1-preservation.json", preserved)
    print(json.dumps({"packet": str(PACKET), "stage": "EXPORTED_UNSEALED_PENDING_TESTS", "steps": len(list(PACKET.rglob("*.step"))), "previews": len(list(PACKET.rglob("*.png"))), "nativeInstances": len(design["instances"]) - 1}), flush=True)


def seal():
    if (PACKET / "freeze.json").exists():
        raise RuntimeError("V2 already sealed")
    tests = json.loads((PACKET / "tests.json").read_text())
    if tests["status"] != "PASS" or tests["skipped"]:
        raise ValueError("Seal requires passing non-skipped tests")
    preserved = verify_v1()
    artifacts = {path.relative_to(PACKET).as_posix(): legacy.sha(path) for path in sorted(PACKET.rglob("*")) if path.is_file()}
    manifest = {"packetVersion": "concept-a-local-v2", "status": "FROZEN_LOCAL_GEOMETRY_PASS_BUILD_BLOCKED_COTS_PENDING", "apiBrowserAdmission": "BLOCKED", "sharedApiCalls": 0, "sourceSha256": {name: legacy.sha(ROOT / name) for name in SOURCE_FILES}, "artifactSha256": artifacts, "preservedV1": preserved, "snapshotRule": "No overwrite of v1 or v2. Geometry/vendor changes require new evidence, not relabeling this packet."}
    legacy.write_json(PACKET / "freeze.json", manifest)
    verify_freeze()
    print(json.dumps(admission(), indent=2), flush=True)


if __name__ == "__main__":
    if "--seal" in sys.argv:
        seal()
    elif "--admission" in sys.argv:
        report = admission()
        print(json.dumps(report, indent=2))
        raise SystemExit(2 if report["status"] == "BLOCKED" else 0)
    else:
        assemble_packet()