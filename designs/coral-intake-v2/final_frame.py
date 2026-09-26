import argparse
import importlib.util
import json
import math
from pathlib import Path
import sys
import time


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "final-frame-output" / "revision-clearance"
SPEC = importlib.util.spec_from_file_location("final_inboard", ROOT / "inboard_frame.py")
inboard = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(inboard)


def candidate_config(base):
    config = inboard.candidate_config(base)
    config["pickup_input_direction"] = 1
    config["indexer_idler_sides"] = {"L_0": -1}
    return config


def bridge_chain_passage(installer):
    assembly = installer.assembly
    module = assembly.pickup_module
    identifier = "v1_indexer_plate_L_247"
    part = next(part for part in assembly.instances if part["id"] == identifier)
    original = assembly.definitions[part["definition"]]["shape"]
    anchors = [[-269.0, 96.0], [-229.0, 96.0]]
    passage = module.web([[-249.0, 42.0], [-249.0, 115.0]], 5.65, 8)
    plate = module.drill(original.cut(passage), [(*point, 5.5) for point in anchors], 6).clean()
    installer.replace(identifier, plate, process="router_chain_passage_and_bridge_mounts",
                      passage_width_mm=11.3, nominal_chain_side_clearance_mm=2.5125,
                      bridge_anchors_xy=anchors, load_qualified=False)
    bank_z = 247 + assembly.pickup.config["indexer_lift_mm"]
    installer.plate("chain_passage_bridge", anchors, [(*point, 5.5) for point in anchors], bank_z - 16, axis=2)
    for index, point in enumerate(anchors):
        installer.tube("chain_passage_bridge_gap_" + str(index), bank_z - 13, bank_z - 3,
                       point, axis=2, outer=12, inner=5.5)
        installer.bolt("chain_passage_bridge_bolt_" + str(index), bank_z + 3, point, 30, axis=2)
        installer.nut("chain_passage_bridge_nut_" + str(index), bank_z - 21.5, point, axis=2)
    installer.report["chain_passage"] = {
        "parent": identifier, "bridge": "pt_chain_passage_bridge", "anchors_xy": anchors,
        "slot_centerline_xy": [[-249, 42], [-249, 115]], "slot_radius_mm": 5.65,
        "plate_center_z_mm": bank_z, "bridge_center_z_mm": bank_z - 16,
        "bridge_thickness_mm": 6, "spacers_mm": 10, "through_bolts": "2 x M5x30",
        "post_seat_unchanged": True, "bearing_seats_unchanged": True,
        "minimum_post_hole_ligament_mm": 7.6,
        "load_path": "Post seat -> outboard bank strip -> M5 clamp/spacer -> 6 mm bridge under chain -> inner clamp/spacer -> bearing-side bank",
        "load_qualified": False, "chain_phase_envelope_qualified": False}


def repair_neighbor_interference(assembly, audit, seconds=180, maximum_commons=100):
    started = time.monotonic()
    cache = audit.BoundsCache(assembly)
    groups = {}
    for part in assembly.instances:
        identifier = part["id"]
        if identifier.startswith(("pt_drive_pickup_", "pt_pickup_")):
            groups[identifier] = "pickup"
        elif identifier.startswith("pt_indexer_L_0_idler") or identifier == "pt_indexer_L_0":
            groups[identifier] = "idler"
        elif identifier.startswith("pt_chain_passage_bridge"):
            groups[identifier] = "bridge"
    context = [part for part in assembly.instances if part["motion"] == "fixed"
               and assembly.definitions[part["definition"]]["kind"] != "reference_envelope"]
    selected = [part for part in context if part["id"] in groups]
    pairs, visited, separated = [], set(), 0
    for first in selected:
        first_bounds, unused = cache.placed(first, 0, 0)
        for second in context:
            pair = tuple(sorted((first["id"], second["id"])))
            if groups.get(second["id"]) == groups[first["id"]] or pair in visited:
                continue
            visited.add(pair)
            second_bounds, unused = cache.placed(second, 0, 0)
            if any(min(first_bounds[axis + 3], second_bounds[axis + 3]) -
                   max(first_bounds[axis], second_bounds[axis]) <= 1e-6 for axis in range(3)):
                separated += 1
            else:
                pairs.append((first, second))
    shapes, cases, commons = {}, [], 0
    for first, second in pairs:
        record = {"parts": [first["id"], second["id"]], "angleDeg": 0, "floatDeg": 0}
        if commons >= maximum_commons or time.monotonic() - started >= seconds:
            record["status"] = "UNKNOWN_BUDGET"
        else:
            for part in (first, second):
                if part["id"] not in shapes:
                    shapes[part["id"]] = assembly.shape(part)
            common = shapes[first["id"]].intersect(shapes[second["id"]])
            volume = abs(common.Volume())
            record.update(overlapMm3=volume, commonValid=common.isValid(),
                          status="INTERFERENCE" if volume > 1e-4 else "CLEAR_AT_MODELED_PHASE")
            commons += 1
        cases.append(record)
    failures = [row for row in cases if row["status"] == "INTERFERENCE"]
    unknown = [row for row in cases if row["status"] == "UNKNOWN_BUDGET"]
    return {"status": "FAIL_INTERFERENCE" if failures else "INCOMPLETE" if unknown else "REPAIR_NEIGHBORS_PHASE_ZERO_CLEAR",
            "scope": "Relocated pickup, left first idler/belt, and new chain bridge vs other fixed physical parts; internal pairs within each installed group excluded. Not moving-fold geometry or full-system certification.",
            "cases": cases, "failures": failures, "unknownCount": len(unknown),
            "candidatePairs": len(pairs), "exactCommons": commons, "separatedPairs": separated,
            "secondsBudget": seconds, "maximumCommons": maximum_commons,
            "elapsedSeconds": time.monotonic() - started, "globalClearanceCertified": False}


def chain_passage_envelope(assembly):
    powered = inboard.load_sibling("powered_transmissions")
    module = assembly.pickup_module
    parts = {part["id"]: part for part in assembly.instances}
    matrix = module.matrix(parts["pt_deployment_16T"]["pose"])
    centers = [[matrix[1][3], matrix[2][3]], assembly.pickup.config["pivot_yz"]]
    clearance = 2.5
    radii = [6.35 / (2 * math.sin(math.pi / teeth)) + 2.9 + clearance for teeth in (16, 60)]
    tangents, unused_arcs, unused_length = powered.tangent_route(centers, radii)
    points = [tangents[0][0], tangents[0][1], tangents[1][0], tangents[1][1]]
    width = 6.275 + 2 * clearance
    shape = assembly.cq.Workplane("XY").polyline(points).close().extrude(width).val().translate((0, 0, -width / 2))
    for center, radius in zip(centers, radii):
        shape = shape.fuse(module.cylinder(radius, width, (*center, 0)))
    shape = shape.clean().moved(module.location((-249, 0, 0), (1, 0, 0)))
    identifiers = ["v1_indexer_plate_L_247"] + [name for name in parts if name.startswith("pt_chain_passage_bridge")]
    cases = []
    for identifier in identifiers:
        common = shape.intersect(assembly.shape(parts[identifier]))
        cases.append({"part": identifier, "envelopeOverlapMm3": abs(common.Volume()),
                      "pass": abs(common.Volume()) < 1e-4})
    result = {"pass": all(row["pass"] for row in cases), "cases": cases,
              "nominalClearanceMm": clearance, "enclosingWidthMm": width,
              "method": "Filled convex hull of 16T/60T chain pitch circles plus 2.9 mm link radius and 2.5 mm reserve; full axial link width plus 2.5 mm each side. Conservative envelope of nominal chain travel at fixed gearbox pose, not tooth seating or master-link certification."}
    assembly.powertrain_installation["chain_passage"]["chain_phase_envelope_qualified"] = result["pass"]
    return result


def build():
    coaxial = inboard.load_sibling("coaxial_pickup")
    powered = inboard.load_sibling("powered_transmissions")
    assembly = coaxial.build(candidate_config(coaxial.settings()))
    original_frame = assembly.definitions["coaxial_frame_plate"]["shape"]
    installer = powered.Installer(assembly)
    installer.install_pickup()
    installer.install_indexers()
    installer.install_deployment()
    inboard.repack_deployment(installer)
    inboard.replace_root_joints(installer)
    installer.clock_gears()
    inboard.rotate_deployment(installer, original_frame)
    rear = assembly.pickup.config["pivot_yz"]
    cosine = math.sqrt(0.5)
    for path in installer.report["paths"]:
        if path["id"].startswith("deployment_") and "pitch_points" in path:
            path["pitch_points"] = [[rear[0] + cosine * ((point[0] - rear[0]) - (point[1] - rear[1])),
                                     rear[1] + cosine * ((point[0] - rear[0]) + (point[1] - rear[1]))]
                                    for point in path["pitch_points"]]
            path["pitch_points_frame"] = "World YZ after rigid 45 degree gearbox rotation"
    bridge_chain_passage(installer)
    clear_supported_keeper_interfaces(installer)
    assembly = installer.finish()
    assembly.drives = [row for row in assembly.drives if "rows" not in row]
    installer.report["path_status"]["upper_rollers"] = "Installed 350/500/550 mm nominal HTD paths with authentic pulleys; tension and torque unqualified"
    return coaxial, assembly


def clear_supported_keeper_interfaces(installer):
    assembly = installer.assembly
    module = assembly.pickup_module
    parts = {part["id"]: part for part in assembly.instances}
    path = next(row for row in installer.report["paths"] if row["id"] == "pickup_reduction")
    center = path["centers"][0]
    frame = assembly.definitions[parts["coaxial_frame_plate_1"]["definition"]]["shape"]
    openings = []
    for offset, diameter in ((-21, 12), (0, 26), (21, 12)):
        ends = [[center[0] + offset, center[1] + travel] for travel in (-2, 2)]
        frame = frame.cut(module.web(ends, diameter / 2, 8))
        openings.append({"ends_yz": ends, "diameter_mm": diameter})
    installer.replace("coaxial_frame_plate_1", frame.clean(),
                      process="router_keeper_and_rotating_end_stack_clearances",
                      openings=openings, bearing_seat_modified=False, load_qualified=False)
    keeper_id = "pt_indexer_L_0_idler_lower_keeper"
    keeper = assembly.definitions[parts[keeper_id]["definition"]]["shape"]
    extent = module.bounds(keeper)
    center = [(extent[axis] + extent[axis + 3]) / 2 for axis in (0, 1)]
    plate_id = "v1_indexer_plate_L_247"
    plate = assembly.definitions[parts[plate_id]["definition"]]["shape"]
    window = module.box((68, 24, 8), (*center, 0))
    installer.replace(plate_id, plate.cut(window).clean(), process="router_idler_keeper_service_opening",
                      opening_center_xy=center, opening_size_mm=[68, 24],
                      bearing_seats_modified=False, clamp_slots_preserved=True, load_qualified=False)
    installer.report["keeper_clearances"] = {
        "pickup_frame": {"part": "coaxial_frame_plate_1", "openings": openings,
                         "bearing_support": "The paired gearbox plates retain the bearings; this frame plate receives the four outer anchors only"},
        "indexer_bank": {"part": plate_id, "window_center_xy": center, "window_size_mm": [68, 24],
                         "purpose": "Clear separate idler lower keeper and screw heads over the existing 6 mm adjustment range"},
        "strength_qualified": False}


def historical_pairs(assembly):
    historical = json.loads((ROOT / "inboard-frame-output" / "targeted-interference.json").read_text())
    parts = {part["id"]: part for part in assembly.instances}
    cases = []
    for row in historical["failures"]:
        first, second = row["parts"]
        common = assembly.shape(parts[first]).intersect(assembly.shape(parts[second]))
        cases.append({"parts": row["parts"], "previousOverlapMm3": row["overlapMm3"],
                      "overlapMm3": abs(common.Volume()), "commonValid": common.isValid(),
                      "pass": common.isValid() and abs(common.Volume()) < 1e-4})
    return {"pass": len(cases) == 25 and all(row["pass"] for row in cases), "cases": cases,
            "scope": "All 25 archived fixed interference pairs at modeled phase, not all rotor phases."}


def mechanical_invariants(assembly):
    parts = {part["id"]: part for part in assembly.instances}
    report = assembly.powertrain_installation
    paths = {row["id"]: row for row in report["paths"]}
    expected = {"pickup_reduction": 350, "front_middle": 500, "rear_middle": 550,
                "reverse_kicker": 750, "indexer_L_0": 350, "indexer_L_1": 320,
                "indexer_R_0": 350, "indexer_R_1": 320}
    lengths = {name: abs(paths[name]["length_mm"] - length) < 1e-6 for name, length in expected.items()}
    gear_cases = []
    for mesh in report["gear_meshes"]:
        common = assembly.shape(parts[mesh["input"]]).intersect(assembly.shape(parts[mesh["output"]]))
        gear_cases.append({"parts": [mesh["input"], mesh["output"]], "overlapMm3": abs(common.Volume()),
                           "centersMm": mesh["centers_mm"],
                           "pass": abs(mesh["centers_mm"] - sum(mesh["teeth"]) * 25.4 / 40) < 1e-7
                           and abs(common.Volume()) < 1e-4})
    counts = {"motors": sum(part["role"] == "motor" for part in parts.values()),
              "upperStars": sum(part["id"].startswith("v2_star_") and part["role"] == "outer_elastomer" for part in parts.values()),
              "indexerWheels": sum(part["id"].startswith("v1_indexer_") and part["role"] == "compliant_contact" for part in parts.values()),
              "belts": sum(path["pitch_mm"] == 5 for path in paths.values()),
              "chains": sum(path["pitch_mm"] == 6.35 for path in paths.values())}
    chain_pitch = all(abs(math.dist(point, path["pitch_points"][(index + 1) % len(path["pitch_points"])]) - 6.35) < 1e-7
                      for path in paths.values() if "pitch_points" in path
                      for index, point in enumerate(path["pitch_points"]))
    return {"pass": all(lengths.values()) and all(row["pass"] for row in gear_cases) and chain_pitch
            and counts == {"motors": 4, "upperStars": 27, "indexerWheels": 18, "belts": 8, "chains": 2},
            "counts": counts, "beltLengthChecks": lengths, "sourceGearMeshes": gear_cases,
            "chainChordPitchPass": chain_pitch, "powerAndLoadQualified": False}


def protected_hashes(audit):
    allowed = {"final_frame.py", "test_final_frame.py", "FINAL-FRAME.md", "powered_transmissions.py"}
    paths = [path for path in ROOT.parent.joinpath("coral-intake-v1").rglob("*") if path.is_file()]
    paths += [path for path in ROOT.rglob("*") if path.is_file() and path.name not in allowed and OUTPUT not in path.parents]
    return {path.relative_to(ROOT.parent).as_posix(): audit.digest(path) for path in sorted(paths)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true")
    arguments = parser.parse_args()
    started = time.monotonic()
    audit = inboard.load_sibling("starting_frame")
    before = protected_hashes(audit)
    coaxial, assembly = build()
    print(json.dumps({"phase": "built-final", "instances": len(assembly.instances),
                      "elapsedSeconds": time.monotonic() - started}), flush=True)
    report = audit.audit_assembly(assembly)
    report.update(schema="physical-final-frame-candidate/1", candidateGeometryChanged=True,
                  selectedConfig=assembly.pickup.config)
    report["continuousFloatFrame"] = inboard.continuous_float_frame(assembly, report)
    report["tubeRotorClearance"] = inboard.tube_rotor_clearance(coaxial, assembly, report)
    report["verifiedExpectedThreadContacts"] += inboard.root_thread_contacts(assembly)
    report["framePass"] = report["continuousFloatFrame"]["pass"] and all(
        pose["outsideCount"] == 0 and pose["reserveFailureCount"] == 0 and not pose["fullSpinEnclosureFailureIds"]
        for pose in report["poses"])
    report["historicalPairs"] = historical_pairs(assembly)
    report["targetedInterference"] = inboard.targeted_interference(assembly, audit, seconds=150, maximum_commons=100)
    report["repairNeighbors"] = repair_neighbor_interference(assembly, audit)
    report["chainPassageEnvelope"] = chain_passage_envelope(assembly)
    report["mechanicalInvariants"] = mechanical_invariants(assembly)
    report["historicalTargetAndContainmentPass"] = all((
        report["framePass"], report["tubeRotorClearance"]["pass"], report["historicalPairs"]["pass"],
        report["targetedInterference"]["status"] == "TARGETED_PHASE_ZERO_CLEAR",
        report["chainPassageEnvelope"]["pass"], report["mechanicalInvariants"]["pass"]))
    report["candidateAcceptancePass"] = report["historicalTargetAndContainmentPass"] and report["repairNeighbors"]["status"] == "REPAIR_NEIGHBORS_PHASE_ZERO_CLEAR"
    report["collisionStatus"] = report["repairNeighbors"]["status"] if not report["candidateAcceptancePass"] else "BOUNDED_FIXED_PAIRS_CLEAR"
    report["status"] = "BOUNDED_CANDIDATE_CHECKS_PASS_NOT_RELEASED" if report["candidateAcceptancePass"] else "BLOCKED_FIXED_NEIGHBORS" if report["historicalTargetAndContainmentPass"] else "BLOCKED_SELECTED_CHECKS"
    report["contactStatus"] = "UNQUALIFIED; rear/middle/front/kicker centers and tray height unchanged from inboard candidate. No feed or field-cycle proof."
    report["allowableStowRange"] = {"status": "SINGLE_FOLD_POSE_CHECKED", "intervalsDeg": [],
                                     "selectedFoldDeg": -165, "floatRangeDeg": [-8, 0],
                                     "proof": "Continuous float and full rotor enclosures bounded at the single selected fold; no fold-motion certificate."}
    report["limitations"] = [entry for entry in report["limitations"] if not entry.startswith("Float endpoints")]
    report["limitations"] += ["Keeper/end-stack parent clearances are explicit profile openings, not blanket fastener exclusions; strength of the revised ligaments remains unqualified.",
                               "Continuous float containment is bounded only at -165 degree stow; no continuous fold or collision-clearance certificate.",
                               "Bridge, post ligaments, tapped root blocks and thin kicker hub remain structurally unqualified; guards, stops, holding, cables, chain seating and operating loads remain open."]
    report["rearOnlyRouteScreen"]["basis"] += " Historical necessary-contact screen only; the inboard layout already relocated front/middle rows."
    for name, content in (("audit.json", report), ("targeted-interference.json", report["targetedInterference"]),
                           ("historical-pair-regression.json", report["historicalPairs"]),
                           ("repair-neighbor-interference.json", report["repairNeighbors"]),
                           ("chain-passage-envelope.json", report["chainPassageEnvelope"]),
                           ("mechanical-invariants.json", report["mechanicalInvariants"]),
                           ("powertrain-installation.json", assembly.powertrain_installation)):
        audit.write_json(OUTPUT / name, content)
    print(json.dumps({"phase": "selected-checks", "status": report["status"], "framePass": report["framePass"],
                      "historicalPairsPass": report["historicalPairs"]["pass"],
                      "neighborFailures": len(report["repairNeighbors"]["failures"]),
                      "mechanicalInvariantsPass": report["mechanicalInvariants"]["pass"]}), flush=True)
    export_valid = None
    if arguments.export and report["historicalTargetAndContainmentPass"]:
        audit.OUTPUT = OUTPUT
        export_valid = audit.export_audit(coaxial, assembly, report)
        manifest = json.loads((OUTPUT / "manifest.json").read_text())
        manifest.update(schema="physical-final-frame-candidate/1", frame_contained=report["framePass"],
                        historical_target_pairs_clear=report["historicalPairs"]["pass"],
                        candidate_acceptance_pass=report["candidateAcceptancePass"], inspection_only=True,
                        known_fixed_neighbor_interferences=report["repairNeighbors"]["failures"],
                        pivot_support_geometry="Retained inboard M5x35 captive tapped root blocks inside assumed rails. Wall bearing, tap finish and impact strength unqualified.")
        manifest["source_code_sha256"].update({"coral-intake-v2/" + name: audit.digest(ROOT / name)
                                              for name in ("final_frame.py", "test_final_frame.py", "inboard_frame.py", "test_inboard_frame.py")})
        audit.write_json(OUTPUT / "manifest.json", manifest)
        checks = json.loads((OUTPUT / "export-checks.json").read_text())
        export_valid = export_valid and checks["all_custom_roundtrips_pass"] and not checks["invalid_definitions"] and len(checks["custom_roundtrips"]) >= 150
        report["customRoundtripCount"] = len(checks["custom_roundtrips"])
    after = protected_hashes(audit)
    changed = [name for name in sorted(set(before) | set(after)) if before.get(name) != after.get(name)]
    frozen = json.loads((ROOT / "output" / "frozen-v1.json").read_text())
    frozen_changes = [name for name, expected in frozen.items() if after.get("coral-intake-v1/" + name) != expected]
    historical_hashes = json.loads((ROOT / "inboard-frame-output" / "artifact-hashes.json").read_text())
    inboard_changes = [name for name, expected in historical_hashes.items()
                       if audit.digest(ROOT / "inboard-frame-output" / name) != expected]
    freeze = {"protectedBefore": before, "protectedAfter": after, "changed": changed,
              "allProtectedUnchanged": not changed, "frozenV1Count": len(frozen),
              "frozenV1Changes": frozen_changes, "frozenV1Unchanged": not frozen_changes,
              "inboardArtifactCount": len(historical_hashes), "inboardArtifactChanges": inboard_changes,
              "inboardArtifactsUnchanged": not inboard_changes,
              "intentionalSharedSourceChange": "powered_transmissions.py: two optional direction hooks only; missing options preserve old behavior"}
    audit.write_json(OUTPUT / "source-freeze.json", freeze)
    report["sourceFreeze"] = {key: value for key, value in freeze.items() if key not in ("protectedBefore", "protectedAfter")}
    report["exportValid"] = export_valid
    report["elapsedSeconds"] = time.monotonic() - started
    audit.write_json(OUTPUT / "audit.json", report)
    summary = {key: report[key] for key in ("status", "framePass", "counts", "collisionStatus", "candidateAcceptancePass",
                                            "historicalTargetAndContainmentPass", "sourceFreeze", "exportValid", "elapsedSeconds")}
    summary.update(nonRailMarginsLowerBoundMm=report["continuousFloatFrame"]["minimumNonRailMarginLowerBoundsMm"],
                   targetedCollisions=report["targetedInterference"]["failures"],
                   additionalFixedClashes=report["repairNeighbors"]["failures"],
                   customRoundtripCount=report.get("customRoundtripCount"),
                   tubeRotorMinimumGapMm=report["tubeRotorClearance"]["minimumGapLowerBoundMm"])
    audit.write_json(OUTPUT / "summary.json", summary)
    audit.write_json(OUTPUT / "artifact-hashes.json", {path.relative_to(OUTPUT).as_posix(): audit.digest(path)
                                                       for path in sorted(OUTPUT.rglob("*")) if path.is_file() and path.name != "artifact-hashes.json"})
    print(json.dumps(summary, indent=2), flush=True)
    return 0 if report["candidateAcceptancePass"] and (not arguments.export or export_valid) and not changed and not frozen_changes and not inboard_changes else 1


if __name__ == "__main__":
    sys.exit(main())