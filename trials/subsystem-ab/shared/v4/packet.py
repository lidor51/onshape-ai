from collections import Counter
import argparse
import copy
import importlib.util
import json
import math
import sys
import time
import unittest

from build import BASE, COTS, HERE, REPO, Model, make_model, matrix, located, rotation, np, cq, sha, solid_check, bounds
from package_packet import featurescript
from model import value
sys.path.insert(0, str(HERE))
validation_spec = importlib.util.spec_from_file_location("v4_validation", HERE / "validate.py")
validation_module = importlib.util.module_from_spec(validation_spec)
validation_spec.loader.exec_module(validation_module)
render = validation_module.render
quick_bounds = validation_module.quick_bounds
from layout import CORAL_LENGTH, CORAL_RADIUS, COMPRESSION, CONTROLS, ROLLER_RADIUS, stations, layout_check


def write(name, payload):
    destination = HERE / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(payload, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def affine(base, revision):
    if isinstance(base, dict):
        return {key: affine(entry, revision[key]) for key, entry in base.items()}
    if isinstance(base, list):
        if len(base) != len(revision):
            raise ValueError("Nonaffine recipe topology")
        return [affine(first, second) for first, second in zip(base, revision)]
    if isinstance(base, (float, int)) and base != revision:
        return "(" + str(base) + " + (mouthWidth - 500) * " + str((revision - base) / 20) + ")"
    if base != revision:
        raise ValueError("Nonaffine recipe field")
    return base


def source_packet(base, revision):
    parts = {name: copy.deepcopy(part) for name, part in base.parts.items() if part["category"] != "cots"}
    for name, part in parts.items():
        part["recipe"] = affine(part["recipe"], revision.parts[name]["recipe"])
    source, layouts = featurescript({"parts": parts})
    source = source.replace("Concept A shared engineering", "Concept A v4 BLOCKED local checkpoint")
    source = source.replace("[480, 500, 520]", "[500, 500, 520]")
    source = source.replace("[300, 320, 360]", "[437.15, 447.15, 467.15]")
    source = source.replace('"receiverHeight" : 320 * millimeter', '"receiverHeight" : 447.15 * millimeter')
    source = source.replace('        definition.includeCoralReference is boolean;', '        definition.includeCoralReference is boolean;\n        annotation { "Name" : "Top roller float datum" }\n        isLength(definition.topFloat, { (millimeter) : [0, 0, 12] } as LengthBoundSpec);\n        annotation { "Name" : "Bind original COTS bodies" }\n        definition.bindCots is boolean;' + ''.join('\n        annotation { "Name" : "' + name + '", "Filter" : EntityType.BODY && BodyType.SOLID, "MaxNumberOfPicks" : 1 }\n        definition.' + name + ' is Query;' for name, part in base.parts.items() if part["category"] == "cots"))
    source = source.replace('        const receiverHeight = definition.receiverHeight / millimeter;', '        const receiverHeight = definition.receiverHeight / millimeter;\n        const topFloat = definition.topFloat / millimeter;')
    defaults = ', "topFloat" : 0 * millimeter, "bindCots" : false' + ''.join(', "' + name + '" : qNothing()' for name, part in base.parts.items() if part["category"] == "cots")
    source = source.replace('"includeCoralReference" : false });', '"includeCoralReference" : false' + defaults + ' });')
    connectors = []
    for variant, model in [("baseline", base), ("revision", revision)]:
        instances = []
        for item in model.instances:
            placement = np.array(item["matrix"])
            role = item["part"]
            source_layout = matrix(layouts.get(role, [0, 0, 0]))
            instances.append({**item, "nativeSourcePartId": None, "sourceFeatureId": "part" + str(list(parts).index(role)) if role in parts else None, "sourceLayoutMm": layouts.get(role, [0, 0, 0]), "sourceToAssemblyRowMajorMm": (placement @ np.linalg.inv(source_layout)).tolist(), "sourceBodyIndex": model.parts[role].get("bodyIndex"), "sourceSha256": model.parts[role].get("sha256")})
        write(variant + "/instances.json", instances)
    for index, (first, second) in enumerate(zip(base.instances, revision.instances)):
        if first["part"] != second["part"] or first["group"] != second["group"]:
            raise ValueError("Variant instance topology changed")
        role = first["part"]
        group = base.groups[first["group"]]
        direction = np.array(group["axis"], dtype=float)
        horizontal = np.array([0., 1., 0.]) if abs(direction[1]) < 0.9 else np.array([1., 0., 0.])
        horizontal -= np.dot(horizontal, direction) * direction
        horizontal /= np.linalg.norm(horizontal)
        world = matrix(group["originMm"], np.column_stack([horizontal, np.cross(direction, horizontal), direction]))
        first_frame = np.linalg.inv(np.array(first["matrix"])) @ world
        second_frame = np.linalg.inv(np.array(second["matrix"])) @ world
        per_width = (second_frame[:3, 3] - first_frame[:3, 3]) / 20
        receiver_derivative = -np.array(first["matrix"])[:3, :3].T @ np.array([0, 0, first["receiverHeightTranslation"][2]])
        float_derivative = np.zeros(3)
        if first["group"].startswith("pickup_top"):
            float_derivative = -np.array(first["matrix"])[:3, :3].T @ np.array([0, -40, 35]) / math.hypot(40, 35)
        connector_id = "instance_" + str(index) + "_mount"
        connectors.append({"id": connector_id, "instance": first["id"], "revisionInstanceId": second["id"], "part": role, "group": first["group"], "baselineLocalFrame": first_frame.tolist(), "perMouthWidthMm": per_width.tolist(), "perReceiverHeightMm": receiver_derivative.tolist(), "perTopFloatMm": float_derivative.tolist(), "nativeId": None})
    for role, part in base.parts.items():
        lines = []
        for connector in connectors:
            if connector["part"] != role:
                continue
            frame = np.array(connector["baselineLocalFrame"])
            origin = frame[:3, 3] + layouts.get(role, [0, 0, 0])
            coordinates = [str(origin[index]) + " + (mouthWidth - 500) * " + str(connector["perMouthWidthMm"][index]) + " + (receiverHeight - 447.15) * " + str(connector["perReceiverHeightMm"][index]) + " + topFloat * " + str(connector["perTopFloatMm"][index]) for index in range(3)]
            owner = "body" + str(list(parts).index(role)) if role in parts else "definition." + role
            lines.append('        opMateConnector(context, id + "' + connector["id"] + '", { "coordSystem" : coordSystem(vector(' + ', '.join(coordinates) + ') * millimeter, vector(' + ', '.join(map(str, frame[:3, 0])) + '), vector(' + ', '.join(map(str, frame[:3, 2])) + ')), "owner" : ' + owner + ' });')
        if role in parts:
            anchor = '        if (size(evaluateQuery(context, body' + str(list(parts).index(role)) + ')) != 1) throw regenError("Expected one solid: ' + role + '");'
            if source.count(anchor) != 1:
                raise ValueError("Missing source owner anchor")
            source = source.replace(anchor, anchor + '\n' + '\n'.join(lines))
        else:
            block = '\n        if (definition.bindCots)\n        {\n        if (size(evaluateQuery(context, definition.' + role + ')) != 1) throw regenError("Original COTS body required: ' + role + '");\n' + '\n'.join(lines) + '\n        }\n'
            source = source.replace('    }, { "mouthWidth"', block + '    }, { "mouthWidth"')
    if source.count('{') != source.count('}') or source.count('opMateConnector(context,') != len(connectors):
        raise ValueError("Source connector emission mismatch")
    (HERE / "source").mkdir(exist_ok=True)
    (HERE / "source/concept-a-v4.fs").write_text(source, encoding="utf-8")
    write("source/geometry-payload.json", {"parts": parts, "neutralLayoutsMm": layouts, "kernel": "CadQuery 2.6.1", "featurescriptVersion": 3070, "nativeCompilation": "UNEXECUTED_LOCAL_ONLY"})
    write("source/connectors.json", connectors)
    checks = []
    for name, part in parts.items():
        for label, model in [("baseline", base), ("revision", revision)]:
            from model import geometry
            predicted = geometry(part["recipe"], model.controls)
            difference = abs(predicted.Volume() - model.shapes[name].Volume())
            bound_difference = float(np.max(np.abs(np.array(bounds(predicted)) - bounds(model.shapes[name]))))
            topology_equal = [len(predicted.Faces()), len(predicted.Edges()), len(predicted.Vertices())] == [len(model.shapes[name].Faces()), len(model.shapes[name].Edges()), len(model.shapes[name].Vertices())]
            checks.append({"part": name, "variant": label, "volumeDifferenceMm3": difference, "boundsDifferenceMm": bound_difference, "topologyCountsEqual": topology_equal, "status": "PASS" if difference < 0.001 and bound_difference < 0.001 and topology_equal else "FAIL"})
    write("source/recipe-parity.json", {"checks": checks, "meaning": "Local recipe parity, NOT FeatureScript execution parity"})
    return connectors


def exports(model, variant):
    folder = HERE / variant / "neutral"
    folder.mkdir(parents=True, exist_ok=True)
    checks = []
    for name, shape in model.shapes.items():
        if model.parts[name]["category"] == "cots":
            continue
        path = folder / (name + ".step")
        cq.exporters.export(shape, str(path))
        imported = cq.importers.importStep(str(path)).val()
        volume_error = abs(imported.Volume() - shape.Volume())
        bound_error = float(np.max(np.abs(np.array(bounds(imported)) - bounds(shape))))
        before, after = solid_check(shape), solid_check(imported)
        passed = before["valid"] and after["valid"] and before["closed"] and after["closed"] and before["solids"] == after["solids"] == 1 and volume_error <= max(0.001, shape.Volume() * 1e-7) and bound_error < 0.001
        checks.append({"part": name, "sha256": sha(path), "before": before, "readback": after, "volumeErrorMm3": volume_error, "boundsErrorMm": bound_error, "status": "PASS" if passed else "FAIL"})
    placed = model.poses()
    generated = [placed[item["id"]] for item in model.instances if model.parts[item["part"]]["category"] != "cots"]
    assembly_path = HERE / variant / "generated-only-deployed.step"
    combined = cq.Compound.makeCompound(generated)
    cq.exporters.export(combined, str(assembly_path))
    readback = cq.importers.importStep(str(assembly_path)).val()
    assembly_volume_error = abs(readback.Volume() - combined.Volume())
    assembly_bound_error = float(np.max(np.abs(np.array(bounds(readback)) - bounds(combined))))
    readback_checks = [solid_check(shape) for shape in readback.Solids()]
    assembly_pass = len(readback_checks) == len(generated) and all(check["valid"] and check["closed"] for check in readback_checks) and assembly_volume_error <= max(0.01, combined.Volume() * 1e-7) and assembly_bound_error < 0.001
    write(variant + "/custom-roundtrip.json", {"status": "PASS" if all(check["status"] == "PASS" for check in checks) and assembly_pass else "FAIL", "checks": checks, "generatedAssemblyReadback": {"status": "PASS" if assembly_pass else "FAIL", "sha256": sha(assembly_path), "expectedBodies": len(generated), "actualBodies": len(readback_checks), "volumeErrorMm3": assembly_volume_error, "boundsErrorMm": assembly_bound_error, "allBodiesValidClosed": all(check["valid"] and check["closed"] for check in readback_checks)}, "cotsReexported": False, "scope": "Generated neutral solids and generated-only assembly independently reimported; scalar/bounds/topological validity, no pointwise face-equivalence claim"})
    print("EXPORT " + variant + " " + str(len(checks)), flush=True)


def source_checks(model):
    results = []
    for item in model.instances:
        part = model.parts[item["part"]]
        if part["category"] != "cots":
            continue
        original = model.shapes[item["part"]]
        positioned = located(original, np.array(item["matrix"]))
        results.append({"instance": item["id"], "sourceBodyIndex": part["bodyIndex"], "sha256": part["sha256"], "originalValid": original.isValid(), "originalClosed": all(shell.Closed() for shell in original.Shells()), "IsPartner": bool(original.wrapped.IsPartner(positioned.wrapped)), "topologyCountsBefore": [len(original.Faces()), len(original.Edges()), len(original.Vertices())], "topologyCountsPlaced": [len(positioned.Faces()), len(positioned.Edges()), len(positioned.Vertices())], "boundsMm": quick_bounds(positioned)})
    write("cots-preservation.json", {"sources": model.sources, "instances": results, "x60": "QUARANTINED_EXCLUDED", "originalFilesReexported": False, "sourceInterfaceEvidence": "trials/subsystem-ab/cots/attachment-points.json", "nativeDestinationValidation": "UNEXECUTED", "status": "PASS" if all(entry["originalValid"] and entry["originalClosed"] and entry["IsPartner"] and entry["topologyCountsBefore"] == entry["topologyCountsPlaced"] for entry in results) else "FAIL"})


def coral_checks(model):
    placed = model.poses()
    boxes = {name: quick_bounds(shape) for name, shape in placed.items()}
    normal = np.array([-40., 35.]) / math.hypot(40, 35)
    inlet = json.loads((HERE / "mechanical-probe.json").read_text())["inletSamples"]
    poses = [("floor", inlet[0]["centerMm"], 0)]
    for index, center in enumerate(stations()[:9]):
        contact_center = np.array(center) + normal * (CORAL_RADIUS + ROLLER_RADIUS - COMPRESSION)
        poses.append(("incline_" + str(index), [0, *contact_center], 0))
    for longitudinal, yaw in [(140, 0), (250, 0), (330, 30), (400, 60), (560, 90)]:
        poses.append(("transfer_" + str(longitudinal), [0, longitudinal, 447.15], yaw))
    results = []
    records = {entry["id"]: entry for entry in model.instances}
    for name, center, yaw in poses:
        coral = located(model.shapes["coral_reference"], matrix(center, rotation((0, 0, 1), yaw)))
        coral_box = np.array(quick_bounds(coral))
        contacts, blockers = [], []
        minimum_support = float("inf")
        for part_name, other in placed.items():
            role = records[part_name]["part"]
            if "floor" in role or "guide" in role or "rubber" in role:
                minimum_support = min(minimum_support, coral.distance(other))
            bound = np.array(boxes[part_name])
            if not np.all(np.minimum(coral_box[3:], bound[3:]) - np.maximum(coral_box[:3], bound[:3]) > 0.001):
                continue
            volume = abs(coral.intersect(other).Volume())
            if volume <= 0.01:
                continue
            entry = {"part": part_name, "intersectionMm3": volume}
            if "rubber" in role or "drum" in role:
                contacts.append({**entry, "intent": "candidate compliant roller contact; volume is not acceptance; compression/normal/reaction require fixture verification"})
            else:
                blockers.append(entry)
        results.append({"pose": name, "centerMm": center, "axisYawDegFromX": yaw, "nearestSupportGapMm": minimum_support, "compliantCandidates": contacts, "hardBlockers": blockers, "status": "FAIL" if blockers else "GEOMETRY_SAMPLE_ONLY"})
        print("CORAL " + name + " blockers=" + str(len(blockers)), flush=True)
    write("contact-samples.json", {"scope": "15 chosen exact tube-BRep poses, NOT simulation, not a continuous transport/centering proof", "nominalCoralMm": {"OD": 114.3, "ID": 101.6, "length": CORAL_LENGTH}, "tolerances": {"booleanVolumeMm3": 0.01, "nominalCompressionMm": 5, "topFloatTravelMm": 12}, "supportedAngleCoverage": "Chosen transverse, 30/60 degree intermediate and longitudinal poses only; off-axis, end-on, tipped and adverse floor cases UNVERIFIED", "samples": results, "velocityCommands": [{"stage": "pickup_lower", "positiveAxis": "+X", "omegaSignForRearwardFeed": -1}, {"stage": "pickup_top", "positiveAxis": "+X", "omegaSignForRearwardFeed": 1}, {"stage": "orienter_left", "positiveAxis": "+Z", "omegaSignForRearwardFeed": 1}, {"stage": "orienter_right", "positiveAxis": "+Z", "omegaSignForRearwardFeed": -1}], "captureCenterRetainRelease": ["capture: floor and roller constraints must coexist", "center: independent banks, no convergence proof", "retain: stop and anti-bounce candidate, insufficient attachment/qualification", "release: receiver grip acknowledgement required before lift; no sensor success fabricated"]})


def native_catalog(model, connectors):
    parts = []
    generic_prefixes = ("bolt_", "nut_", "washer_", "M4_", "motor_screw_", "end_retainer_", "roller_cross_pin")
    for name, part in model.parts.items():
        members = [item["id"] for item in model.instances if item["part"] == name]
        parts.append({"id": name, "category": "generic_hardware_NOT_COTS" if name.startswith(generic_prefixes) else part["category"], "modeledQuantity": len(members), "occurrences": members, "originalFile": part.get("sourcePath"), "originalSha256": part.get("sha256"), "originalBodyIndex": part.get("bodyIndex"), "neutralExport": None if part["category"] == "cots" else "baseline/neutral/" + name + ".step", "neutralExportSha256": None if part["category"] == "cots" else sha(HERE / "baseline/neutral" / (name + ".step")), "nativePartId": None})
    members = [{"id": item["id"], "part": item["part"], "group": item["group"], "referenceOnly": item["referenceOnly"], "sourceBodyIndex": model.parts[item["part"]].get("bodyIndex"), "baselineMatrixMm": item["matrix"], "connector": connector["id"], "nativeOccurrenceId": None, "readbackVerified": False} for item, connector in zip(model.instances, connectors)]
    groups = [{"id": name, "members": [member["id"] for member in members if member["group"] == name]} for name in model.groups]
    write("native-catalog.json", {"status": "BLOCKED_NOT_ADMITTED", "modeledOccurrencesIncludingReferences": len(members), "modeledNonReferenceOccurrences": sum(not item["referenceOnly"] for item in members), "referenceOccurrences": sum(item["referenceOnly"] for item in members), "exactPurchasePieceCount": "UNVERIFIED: end retainers combine washer/screw presentation; missing attachments and drives are not counted", "uniquePartDefinitions": len(parts), "originalVendorFileCount": len(model.sources), "originalVendorSourceBodyCount": sum(source["sourceSolidCount"] for source in model.sources.values()), "originalVendorOccurrenceCount": sum(model.parts[item["part"]]["category"] == "cots" for item in model.instances), "logicalKinematicGroups": len(groups), "parts": parts, "members": members, "groups": groups, "nativeScalingRecommendation": "Use supported bulk occurrence insertion and rigid group operations at approximately 28 current logical motion groups, within the parent's roughly 50-group planning scale; never substitute groups for member-level readback. This is not a guaranteed API request count.", "requiredReadback": ["Every original file body count and body index against unchanged source SHA256", "Every occurrence identity, source binding and placement, including repeated generic hardware", "Every group member count, parent joint and relation endpoint", "Control edit regeneration, connector identity and revised clearances"], "admission": "Local collisions and missing physical attachments must close first; no network action from this packet"})


def completion_summary(model):
    validation = json.loads((HERE / "validation.json").read_text())
    validation_exit = json.loads((HERE / "validate.exit.json").read_text())
    probe = json.loads((HERE / "mechanical-probe.json").read_text())
    contacts = json.loads((HERE / "contact-samples.json").read_text())
    all_samples = [sample for variant in validation["variants"].values() for sample in variant["samples"]]
    worst = {}
    for sample in all_samples:
        for collision in sample["collisions"]["unexpected"]:
            key = tuple(collision["pair"])
            if key not in worst or worst[key]["intersectionMm3"] < collision["intersectionMm3"]:
                worst[key] = {**collision, "angleDeg": sample["angleDeg"]}
    extension = min((sample["envelope"]["boundsMm"][1] for sample in all_samples), default=0)
    roundtrips = {name: json.loads((HERE / name / "custom-roundtrip.json").read_text()) for name in ["baseline", "revision"]}
    parity = json.loads((HERE / "source/recipe-parity.json").read_text())
    source = json.loads((HERE / "cots-preservation.json").read_text())
    summary = {"status": "BLOCKED_LOCAL_CAD_DEMONSTRATOR", "localCADApproved": False, "manufacturingRelease": False, "nativeAdmitted": False, "networkCalls": 0, "apiCalls": 0, "geometryRepairCyclesThisContinuation": 3, "stopReason": "Three geometry repair cycles completed; original bolt/mount slice repaired but full-motion and physical-attachment blockers remain", "counts": {"modeledOccurrencesIncludingReferences": len(model.instances), "modeledNonReferenceOccurrences": sum(not item["referenceOnly"] for item in model.instances), "referenceOccurrences": sum(item["referenceOnly"] for item in model.instances), "uniqueDefinitions": len(model.parts), "logicalMotionGroups": len(model.groups), "pickupLowerRollers": 11, "fixedTransferRollers": 4, "upperRollers": 1, "originalVendorFiles": len(model.sources), "originalVendorBodies": sum(source["sourceSolidCount"] for source in model.sources.values()), "originalVendorOccurrences": len(source["instances"])}, "fixedSlice": {"mountHubTrunnion": probe["mountHubTrunnionStatus"], "synchronizedGearMesh": probe["gearMeshStatus"], "inletSamples": len(probe["inletSamples"]), "inletFailures": sum(item["status"] != "PASS" for item in probe["inletSamples"]), "maximumRequiredFloatMm": max(item["requiredFloatMm"] for item in probe["inletSamples"])}, "fullSweep": {"status": "INCOMPLETE_FAIL_TIMEOUT" if validation_exit["timedOut"] else validation["status"], "expectedPoses": 126, "completedPoses": len(all_samples), "exitCode": validation_exit["exitCode"], "hardWallLimitSeconds": validation_exit["wallLimitMs"] / 1000, "minimumForwardCoordinateMm": extension, "forwardLimitMm": -457.2, "forwardExcessMm": max(0, -457.2 - extension), "worstUnexpectedPairs": sorted(worst.values(), key=lambda item: item["intersectionMm3"], reverse=True)}, "hardCoralBlockers": [{"pose": sample["pose"], "blockers": sample["hardBlockers"]} for sample in contacts["samples"] if sample["hardBlockers"]], "originalCotsPreservation": source["status"], "originalVendorFilesReexported": False, "generatedExports": {name: {"status": result["status"], "uniqueChecks": len(result["checks"]), "assemblyReadback": result["generatedAssemblyReadback"]} for name, result in roundtrips.items()}, "localSourceRecipeParity": {"checks": len(parity["checks"]), "failures": sum(item["status"] != "PASS" for item in parity["checks"]), "nativeCompilation": "UNVERIFIED_NO_NETWORK"}, "controls": CONTROLS, "datums": {"deploymentPivotMm": [0, 140, 435], "axis": [1, 0, 0], "receiverDefaultMm": [0, 560, 447.15], "topFloatAxis": [0, -40 / math.hypot(40, 35), 35 / math.hypot(40, 35)]}, "blockingAttachments": ["Pickup and fixed transfer have sprocket blanks but no chain loops, tensioners or connected motor-output shaft; no powered handoff claim", "Independent orienter motor gears are not connected to the contact shafts", "Deployment gear hex bore lacks a mechanically retained adapter to the round trunnion/flange", "Roller plug cross-pin and tube drill retention are incomplete", "Upper guides and floating carriage lack complete anchored supports, return/preload and screws", "Frame/chassis, motor brackets, stops, anti-bounce fingers and sensor mounting connections are incomplete", "Guards and guard fasteners are absent"], "originalMotorPresentationBlocker": "Original X44 body includes fixed housing and nonseparable shaft. Rotating pinion overlaps source shaft; no splitting, reexport or blanket exemption used.", "simplificationAssessment": "11 lower rollers are not proven necessary. Current continuity test assumes adjacent roller contact patches; replacing intermediate stations with a powered belt/guide span is a topology and support redesign, not permission to remove coverage assertions. No rollers added this continuation; no such redesign validated.", "physicalTests": {"friction": "UNVERIFIED", "thermalDuty": "UNVERIFIED", "tractionAndCapture": "UNVERIFIED", "torqueAndBrake": "UNVERIFIED", "materialStockTolerances": "TEST_ONLY_ASSUMPTIONS_NOT_RELEASE"}, "previews": ["previews/baseline-deployed.png", "previews/baseline-stowed.png", "previews/revision-deployed.png", "previews/revision-stowed.png", "previews/side-contact.png", "previews/plan-contact.png"]}
    write("summary.json", summary)
    return summary


def finalize_existing():
    model = make_model()
    required = ["baseline/custom-roundtrip.json", "revision/custom-roundtrip.json", "source/recipe-parity.json", "source/geometry-payload.json", "source/connectors.json", "native-catalog.json", "cots-preservation.json", "contact-samples.json", "test_layout.exit.json"]
    for name in required:
        if not (HERE / name).is_file():
            raise ValueError("Incomplete existing packet: " + name)
    probe = json.loads((HERE / "mechanical-probe.json").read_text())
    for name in ["build.py", "layout.py", "probe.py"]:
        if probe["sourceHashes"][name] != sha(HERE / name):
            raise ValueError("Stale geometry probe: " + name)
    payload = json.loads((HERE / "source/geometry-payload.json").read_text())
    for variant, controls in [("baseline", BASE), ("revision", {**BASE, "mouthWidth": 520})]:
        roundtrip = json.loads((HERE / variant / "custom-roundtrip.json").read_text())
        for check in roundtrip["checks"]:
            if sha(HERE / variant / "neutral" / (check["part"] + ".step")) != check["sha256"]:
                raise ValueError("Changed generated STEP: " + check["part"])
        if sha(HERE / variant / "generated-only-deployed.step") != roundtrip["generatedAssemblyReadback"]["sha256"]:
            raise ValueError("Changed generated assembly: " + variant)
    validation = json.loads((HERE / "validation.json").read_text())
    validation_exit = json.loads((HERE / "validate.exit.json").read_text())
    if validation_exit["timedOut"]:
        validation["status"] = "FAIL_INCOMPLETE_TIMEOUT"
        validation["termination"] = validation_exit
        for variant in validation["variants"].values():
            if variant["status"] == "IN_PROGRESS":
                variant["status"] = "FAIL_INCOMPLETE_TIMEOUT"
        write("validation.json", validation)
    render(model, HERE / "previews/plan-contact.png", view="plan", coral=[((0, 195, 447.15), 0), ((0, 330, 447.15), 30), ((0, 560, 447.15), 90)])
    from vtk.util.numpy_support import vtk_to_numpy
    images = []
    for path in sorted((HERE / "previews").glob("*.png")):
        reader = validation_module.vtk.vtkPNGReader()
        reader.SetFileName(str(path))
        reader.Update()
        image = reader.GetOutput()
        pixels = vtk_to_numpy(image.GetPointData().GetScalars())[:, :3].astype(float)
        chromatic = int(np.count_nonzero(pixels.max(axis=1) - pixels.min(axis=1) > 45))
        images.append({"path": str(path.relative_to(HERE)).replace('\\', '/'), "sha256": sha(path), "dimensions": list(image.GetDimensions()), "chromaticPixels": chromatic, "status": "PASS_NONBLANK" if chromatic > 10000 else "FAIL"})
    write("preview-checks.json", {"renderer": "VTK offscreen OpenGL depth-buffered BRep tessellation", "scope": "Pixel-content verification; guide/contact overlays show alternative single-coral poses, not simultaneous inventory", "images": images})
    summary = completion_summary(model)
    test_exit = json.loads((HERE / "test_layout.exit.json").read_text())
    summary["regressions"] = {"count": 11, "exitCode": test_exit["exitCode"], "evidence": "test_layout.exit.json"}
    summary["previewPixelChecks"] = "PASS" if all(image["status"] == "PASS_NONBLANK" for image in images) else "FAIL"
    write("summary.json", summary)
    write("finalization-inputs.json", {"sourceHashes": {name: sha(HERE / name) for name in ["build.py", "layout.py", "validate.py", "probe.py", "packet.py", "run.mjs", "test_layout.py"]}, "verifiedExistingExports": True, "uncompiledSourceVersion": payload["featurescriptVersion"], "zeroNetwork": True})
    source_paths = [path for path in HERE.rglob("*") if path.is_file() and path.suffix not in {".log", ".jsonl"} and path.name not in {"checkpoint.json", "packet.exit.json"}]
    write("checkpoint.json", {"status": summary["status"], "freezeScope": "HASHED_BLOCKED_DIAGNOSTIC_NOT_APPROVED_GEOMETRY", "localCADApproved": False, "manufacturingRelease": False, "apiCalls": 0, "summary": "summary.json", "nativeCatalog": "native-catalog.json", "sourceHashes": {str(path.relative_to(HERE)).replace('\\', '/'): sha(path) for path in source_paths}, "resume": "Original bolt/mount repair is closed at four measured angles. Three geometry repair cycles exhausted. Read summary.json for unresolved motion, extension, single-coral and missing physical-drive/attachment blockers. No Onshape admission; no v3 gate."})
    print(json.dumps({"status": summary["status"], "counts": summary["counts"], "fullSweep": summary["fullSweep"]["status"], "hardCoralBlockers": summary["hardCoralBlockers"], "images": len(images)}), flush=True)
    return summary


def package():
    started = time.monotonic()
    base, revision = make_model(), make_model({"mouthWidth": 520})
    source_checks(base)
    exports(base, "baseline")
    exports(revision, "revision")
    connectors = source_packet(base, revision)
    native_catalog(base, connectors)
    counts = Counter(item["part"] for item in base.instances)
    bom = [{"sourcePart": name, "modeledQuantity": quantity, "category": base.parts[name]["category"], "material": base.parts[name].get("material", "ORIGINAL_VENDOR"), "operations": base.parts[name].get("process", "Direct original STEP import; no machining"), "manufacturingRelease": False} for name, quantity in counts.items()]
    write("bom.json", {"rows": bom, "modeledPhysicalInstances": len(base.instances), "quantityCaution": "Modeled instance count; end_retainer_M5 is a washer/screw representation and modeled tube plugs lack all required cross pins. Total purchase quantity is incomplete.", "missingHardware": ["#25 chains, tensioners, axial sprocket spacers and complete physical drive connection", "guide edge-support fasteners and frame-post/chassis joint hardware", "motor bracket chassis attachment, deploy hub shaft connection", "hard-stop blocks and pins, powered-off retention", "guards, guard standoffs and service-cover fasteners", "sensor selection and stop/anti-bounce mounting fasteners"], "tolerances": {"customStock": "metric nominal, grade assumed", "hexStockAFmm": 12.7, "bearingSourceBoreAFmm": 12.72, "bearingSeatMm": 28.675, "motorPilotMm": 19.15, "motorBCDmm": 34.925, "routerGeneralPositionMm": "+/-0.2 provisional coupon qualification", "bearingSeatDiameterToleranceMm": "+0.025/-0 provisional, qualify with actual source bearing"}})
    groups = []
    for name, group in base.groups.items():
        members = [item["id"] for item in base.instances if item["group"] == name]
        groups.append({**group, "members": members, "memberConnectorIds": [item["id"] for item in connectors if item["group"] == name], "physicalGroundingComplete": False})
    write("assembly-contract.json", {"status": "BLOCKED_NOT_NATIVE_ADMITTED", "controls": CONTROLS, "baseline": BASE, "revision": {**BASE, "mouthWidth": 520}, "receiverProbe": {**BASE, "receiverHeight": 467.15}, "groups": groups, "relations": base.relations, "sourceBodyCount": len(base.parts), "physicalInstances": len(base.instances), "logicalGroups": len(base.groups), "connectors": "source/connectors.json", "instances": ["baseline/instances.json", "revision/instances.json"], "contactExceptions": base.exemptions, "interfaces": base.interfaces, "sourcePolicy": "Custom bodies from FeatureScript; original source-file COTS direct import; source-to-assembly placements separate; both X44 bodies fixed, output connectors are joint representations, not physical fake rotors", "nativeGate": "No API/UI action authorized by this local packet; fix mechanical blockers and validate missing relation endpoints before admission", "limitations": ["Drive reference endpoints include unresolved generated shaft roles; native relations NOT ready to submit", "Group motion currently tests deployment only, not gear phase progression, receiver travel or topFloat sweep", "Frame post instance labels vary with width; source roles remain stable but native occurrence identity needs migration"]})
    taller = make_model({"receiverHeight": 467.15})
    baseline_pose, tall_pose = base.poses(), taller.poses()
    probe = []
    for name in ["receiver_bridge", "receiver_finger_-1", "receiver_finger_1", "cradle_floor", "cradle_stop"]:
        delta = np.array(quick_bounds(tall_pose[name])) - quick_bounds(baseline_pose[name])
        probe.append({"instance": name, "boundsChangeMm": delta.tolist()})
    write("receiver-probe.json", {"status": "PASS_INDEPENDENT_RELATIONSHIP_CHANGE_NOT_HANDOFF", "heightDeltaMm": 20, "measurements": probe, "acceptance": "Receiver moves 20 mm; cradle does not. Successful handoff at revised height is UNVERIFIED, not inferred."})
    coral_checks(base)
    folder = HERE / "previews"
    folder.mkdir(exist_ok=True)
    for label, model in [("baseline", base), ("revision", revision)]:
        render(model, folder / (label + "-deployed.png"), coral=[((0, 560, 447.15), 90)])
        render(model, folder / (label + "-stowed.png"), -135)
        print("RENDER " + label, flush=True)
    render(base, folder / "side-contact.png", view="side", coral=[((0, -322, 57.15), 0), ((0, -193, 225), 0), ((0, 140, 447.15), 0), ((0, 560, 447.15), 90)])
    render(base, folder / "plan-contact.png", view="plan", coral=[((0, 195, 447.15), 0), ((0, 330, 447.15), 30), ((0, 560, 447.15), 90)])
    source_paths = [path for path in HERE.rglob("*") if path.is_file() and path.suffix not in {".log"} and path.name != "checkpoint.json"]
    summary = completion_summary(base)
    source_paths = [path for path in HERE.rglob("*") if path.is_file() and path.suffix not in {".log", ".jsonl"} and path.name not in {"checkpoint.json", "packet.exit.json"}]
    write("checkpoint.json", {"status": summary["status"], "freezeScope": "HASHED_BLOCKED_DIAGNOSTIC_NOT_APPROVED_GEOMETRY", "localCADApproved": False, "manufacturingRelease": False, "apiCalls": 0, "summary": "summary.json", "nativeCatalog": "native-catalog.json", "sourceHashes": {str(path.relative_to(HERE)).replace('\\', '/'): sha(path) for path in source_paths}, "wallSeconds": time.monotonic() - started, "resume": "Original mount/hub/trunnion collisions repaired. STOP after three geometry cycles. Read summary.json for measured motion, extension, contact and attachment blockers. No Onshape admission, no v3 gate. Original vendor files remain direct-import only."})
    print(json.dumps({"status": summary["status"], "modeledOccurrencesIncludingReferences": len(base.instances), "groups": len(base.groups), "connectors": len(connectors), "wallSeconds": time.monotonic() - started}), flush=True)
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--finalize-existing", action="store_true")
    arguments = parser.parse_args()
    result = finalize_existing() if arguments.finalize_existing else package()
    raise SystemExit(0 if result["status"] == "LOCALCAD_DEMONSTRATOR_PASS" else 2)