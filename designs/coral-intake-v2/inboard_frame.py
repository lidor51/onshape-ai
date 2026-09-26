import argparse
import importlib.util
import json
import math
from pathlib import Path
import sys
import time


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "inboard-frame-output"
DEPLOYMENT_SHIFT = 34.0


def load_sibling(name):
    specification = importlib.util.spec_from_file_location("inboard_" + name, ROOT / (name + ".py"))
    loaded = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(loaded)
    return loaded


def candidate_config(base):
    config = dict(base)
    rear_dy = math.sqrt(230 ** 2 - 12 ** 2)
    config.update(pivot_yz=[80.0, 348.0], middle_yz=[80 - rear_dy, 336.0],
                  front_dy=math.sqrt(205 ** 2 - 170 ** 2), front_distance=205.0,
                  rear_dy=rear_dy, rear_distance=230.0,
                  kick_yz=[-122.0, 34.0], crossmembers_yz=[[-288.0, 268.0], [-210.0, 408.0]],
                  stow_angle=-165.0, upper_belt_skus=["WCP-0625", "WCP-0628"],
                  reverse_belt_length_mm=750.0, reverse_belt_sku="WCP-0636")
    return config


def repack_deployment(installer):
    assembly = installer.assembly
    module = assembly.pickup_module
    retained_prefixes = ("pt_deployment_final_chain", "pt_deployment_16T", "pt_deployment_adapter",
                         "pt_deployment_60T_plate", "pt_deployment_cheek_", "pt_deployment_plate_",
                         "pt_deployment_frame_gap_", "pt_deployment_box_bolt_", "pt_deployment_box_nut_")
    translation = assembly.cq.Location(assembly.cq.Vector(DEPLOYMENT_SHIFT, 0, 0))
    moved = []
    for part in assembly.instances:
        if part["id"].startswith(("pt_deploy_", "pt_deployment_")) and not part["id"].startswith(retained_prefixes):
            part["pose"] = translation * part["pose"]
            moved.append(part["id"])
    attachment = next(row for row in installer.report["attachments"] if row["id"] == "deployment_to_frame")
    for index, center in enumerate(attachment["holes"]):
        installer.remove(["pt_deployment_frame_gap_" + str(index), "pt_deployment_box_bolt_" + str(index)])
        installer.tube("deployment_frame_gap_" + str(index), -307, -264, center, outer=12, inner=5.5)
        installer.bolt("deployment_box_bolt_" + str(index), -194, center, 130)
    for stack in installer.report["stacks"]:
        if stack["id"] == "deployment_first":
            stack["ends_mm"] = [value + DEPLOYMENT_SHIFT for value in stack["ends_mm"]]
            stack["occupied"] = [[start + DEPLOYMENT_SHIFT, end + DEPLOYMENT_SHIFT, identifier]
                                 for start, end, identifier in stack["occupied"]]
    old_stack = next(row for row in installer.report["stacks"] if row["id"] == "deployment_second")
    members = [row[2] for row in old_stack["occupied"]]
    installer.remove([old_stack["shaft_id"], *old_stack["spacers"],
                      "pt_deployment_second_washer_-1", "pt_deployment_second_washer_1",
                      "pt_deployment_second_end_screw_-1", "pt_deployment_second_end_screw_1"])
    installer.report["stacks"].remove(old_stack)
    shaft = next(part for part in assembly.instances if part["id"] == "pt_deployment_16T")
    matrix = module.matrix(shaft["pose"])
    center = [matrix[1][3], matrix[2][3]]
    installer.stack("deployment_second_inboard", center, [-268, -193],
                    [installer.interval(identifier) for identifier in members])
    for path in installer.report["paths"]:
        if path["id"] == "deployment_intermediate_chain":
            path["axial_mm"] += DEPLOYMENT_SHIFT
    attachment.update(mount_face_x_mm=-264, frame_face_x_mm=-307, standoff_mm=43,
                      bolt_head_base_x_mm=-194, bolt_length_mm=130, nut_center_x_mm=-315.5,
                      frame_holes_unchanged_yz=True, load_qualified=False)
    installer.report["inboard_repack"] = {"shift_x_mm": DEPLOYMENT_SHIFT, "translated_ids": moved,
        "retained_final_lane_x_mm": -249, "intermediate_lane_x_mm": -231,
        "second_shaft_ends_x_mm": [-268, -193], "new_second_stack": "deployment_second_inboard",
        "source_solids_modified": False, "frame_attachment_rebuilt": True}


def replace_root_joints(installer):
    assembly = installer.assembly
    module = assembly.pickup_module
    roots = [(70.0, 45.0), (190.0, 45.0)]
    records = []
    for side in (-1, 1):
        rail = module.box((25, 710, 40)).cut(module.box((21, 712, 36)))
        for center in roots:
            rail = rail.cut(module.cylinder(2.75, 2.2, (-side * 11.5, center[0] - 380, 0), (1, 0, 0)))
        installer.replace("assumed_chassis_side_rail_" + str(side), rail,
                          process="saw_cut_and_inner_wall_drill_only", stock="25x40x2 assumed rail, 710 mm",
                          exterior_wall_unpierced=True, interface_not_robot_source=True)
        for index, center in enumerate(roots):
            prefix = "frame_root_" + str(side) + "_" + str(index)
            installer.remove([prefix + suffix for suffix in ("_crush_sleeve", "_screw", "_washer", "_nut")])
            assembly.joints = [joint for joint in assembly.joints if joint["id"] != prefix]
            block = module.box((17.8, 20, 35.8), (side * 336, *center))
            block = block.cut(module.cylinder(2.1, 16, (side * 335.1, *center), (side, 0, 0)))
            definition = installer.define(prefix + "_tap_block", block, process="saw_mill_blind_drill_and_M5_tap",
                                          size_mm=[17.8, 20, 35.8], tap_drill_mm=4.2, tap_depth_mm=16,
                                          thread_finish_and_grade_qualified=False)
            block_id = "pt_" + prefix + "_tap_block"
            assembly.add(block_id, definition)
            screw_id = installer.bolt(prefix + "_inward_screw", side * 306, center, 35, sign=-side)
            washer_id = "pt_" + prefix + "_inner_washer"
            assembly.add(washer_id, "v2_M5_washer", module.location((side * 306.5, *center), (-side, 0, 0)), role="fastener")
            record = {"id": prefix, "type": "internal_captive_rectangular_tapped_block",
                      "parts": [block_id, screw_id, washer_id, prefix + "_standoff",
                                "coaxial_frame_plate_" + str(side), "assumed_chassis_side_rail_" + str(side)],
                      "block": block_id, "screw": screw_id, "side": side, "center_yz": list(center),
                      "engagement_mm": 13.9, "tap_depth_mm": 16, "tap_drill_mm": 4.2,
                      "block_inward_face_abs_x_mm": 327.1, "screw_tip_abs_x_mm": 341,
                      "block_height_clearance_mm": 0.2, "block_axial_clearance_mm": 3.2,
                      "minimum_frame_reserve_mm": 5.1, "blind_tap_back_wall_mm": 1.8,
                      "inner_wall_seating_gap_mm": 0.1,
                      "insertion": "Slide from open rail end; 35.8 mm block height captured by 36 mm cavity",
                      "load_path": "Inward screw -> plate -> 12 mm standoff -> 2 mm inner wall -> 20x35.8 block face",
                      "outer_head_nut_and_crush_sleeve_removed": True,
                      "strength_qualified": False, "thread_fit_qualified": False,
                      "wall_bearing_and_impact_qualified": False}
            records.append(record)
            assembly.joints.append(record)
    installer.report["inboard_root_joints"] = records


def build():
    coaxial = load_sibling("coaxial_pickup")
    powered = load_sibling("powered_transmissions")
    assembly = coaxial.build(candidate_config(coaxial.settings()))
    original_frame = assembly.definitions["coaxial_frame_plate"]["shape"]
    installer = powered.Installer(assembly)
    installer.install_pickup()
    installer.install_indexers()
    installer.install_deployment()
    repack_deployment(installer)
    replace_root_joints(installer)
    installer.clock_gears()
    rotate_deployment(installer, original_frame)
    assembly = installer.finish()
    assembly.drives = [row for row in assembly.drives if "rows" not in row]
    installer.report["path_status"]["upper_rollers"] = "Installed 350/500/550 mm nominal HTD paths with authentic pulleys; tension and torque unqualified"
    return coaxial, assembly


def rotate_deployment(installer, original_frame):
    assembly = installer.assembly
    module = assembly.pickup_module
    rear = assembly.pickup.config["pivot_yz"]
    rotation = module.rotation((0, *rear), 45)
    retained = ("pt_deployment_adapter", "pt_deployment_60T_plate", "pt_deployment_cheek_", "pt_deployment_plate_")
    rotated = []
    for part in assembly.instances:
        if part["id"].startswith(("pt_deploy_", "pt_deployment_")) and not part["id"].startswith(retained):
            part["pose"] = rotation * part["pose"]
            rotated.append(part["id"])

    def point_rotated(point):
        cosine = math.sqrt(0.5)
        delta = [point[axis] - rear[axis] for axis in (0, 1)]
        return [rear[0] + cosine * (delta[0] - delta[1]), rear[1] + cosine * (delta[0] + delta[1])]

    attachment = next(row for row in installer.report["attachments"] if row["id"] == "deployment_to_frame")
    attachment["previous_holes_yz"] = attachment["holes"]
    attachment["holes"] = [point_rotated(point) for point in attachment["holes"]]
    attachment.update(frame_holes_unchanged_yz=False, frame_plate_rebuilt_from_original=True,
                      gearbox_rotation_about_rear_deg=45)
    motor = next(part for part in assembly.instances if part["id"] == "pt_deploy_deployment_12T")
    matrix = module.matrix(motor["pose"])
    motor_center = [matrix[1][3], matrix[2][3]]
    installer.replace("coaxial_frame_plate_-1", original_frame, process="original_root_and_rear_bearing_pattern")
    installer.modify_plate("coaxial_frame_plate_-1", attachment["holes"], rear, [(motor_center, 66)])
    for path in installer.report["paths"]:
        if path["id"].startswith("deployment_"):
            path["centers"] = [point_rotated(point) for point in path["centers"]]
            if "points" in path:
                path["points"] = [point_rotated(point) for point in path["points"]]
            path["rigid_rotation_about_rear_deg"] = 45
    adjustment = next(row for row in installer.report["attachments"] if row["id"] == "deployment_chain_adjustment")
    for key in ("bearing_center", "socket_center"):
        adjustment[key] = point_rotated(adjustment[key])
    installer.report["inboard_repack"].update(rotation_about_rear_deg=45, rotated_ids=rotated,
                                             original_frame_pattern_rebuilt=True)


def root_thread_contacts(assembly):
    module = assembly.pickup_module
    instances = {part["id"]: part for part in assembly.instances}
    records = []
    for joint in assembly.powertrain_installation["inboard_root_joints"]:
        side = joint["side"]
        block = assembly.shape(instances[joint["block"]])
        screw = assembly.shape(instances[joint["screw"]])
        region = module.cylinder(2.5 + 1e-6, 13.9 + 2e-6,
                                 (side * ((327.1 + 341) / 2), *joint["center_yz"]), (side, 0, 0))
        overlap = screw.intersect(block)
        volume = abs(overlap.Volume())
        excess = abs(overlap.cut(region).Volume())
        expected = math.pi * (2.5 ** 2 - 2.1 ** 2) * 13.9
        passed = volume > 1e-6 and abs(volume - expected) < 1e-4 and excess < 1e-6
        records.append({"joint": joint["id"], "parts": [joint["block"], joint["screw"]],
                        "status": "EXPECTED_THREAD_ENGAGEMENT" if passed else "FAIL_THREAD_GEOMETRY",
                        "overlap_mm3": volume, "expected_annular_overlap_mm3": expected,
                        "overlap_outside_thread_region_mm3": excess, "engagement_mm": 13.9,
                        "tip_to_blind_bottom_mm": 2.1, "nominal_thread": "M5",
                        "method": "Actual Boolean overlap restricted to the individual 13.9 mm coaxial thread cylinder",
                        "strength_qualified": False, "thread_fit_qualified": False})
    return records


def continuous_float_frame(assembly, report):
    module = assembly.pickup_module
    middle = module.centers(assembly.pickup.config)["middle"]
    pose = module.rotation((0, *assembly.pickup.config["pivot_yz"]), assembly.pickup.config["stow_angle"])
    matrix = module.matrix(pose * assembly.cq.Location(assembly.cq.Vector(0, *middle)))
    center = [matrix[1][3], matrix[2][3]]
    last = {part["id"]: part for part in report["poses"][1]["parts"]}
    records = []
    for first in report["poses"][0]["parts"]:
        if first["referenceOnly"]:
            continue
        second = last[first["id"]]
        endpoint_margins = [first["marginsMm"], second["marginsMm"]]
        bounds = [first["boundsMm"], second["boundsMm"]]
        if "spin" in first:
            endpoint_margins += [first["spin"]["marginsMm"], second["spin"]["marginsMm"]]
            bounds += [first["spin"]["boundsMm"], second["spin"]["boundsMm"]]
        radius = max(math.hypot(extent[horizontal] - center[0], extent[vertical] - center[1])
                     for extent in bounds for horizontal in (1, 4) for vertical in (2, 5))
        displacement = 2 * radius * math.sin(math.radians(2)) if first["motion"] == "float" else 0
        lower = {side: min(row[side] for row in endpoint_margins) - (0 if side in ("left", "right") else displacement)
                 for side in report["poses"][0]["minimumMarginsMm"]}
        records.append({"id": first["id"], "motion": first["motion"], "maximumEndpointDisplacementMm": displacement,
                        "marginLowerBoundsMm": lower, "requiredReserveMm": first["requiredReserveMm"],
                        "pass": min(lower.values()) >= first["requiredReserveMm"] - 1e-5})
    return {"pass": all(row["pass"] for row in records), "floatRangeDeg": [-8, 0], "foldDeg": -165,
            "method": "Each intermediate float is within 4 degrees of an audited endpoint. Subtract 2*R*sin(2deg) using conservative YZ radius from exact/enclosing endpoint bounds; X unchanged. Includes full-spin enclosures.",
            "failures": [row for row in records if not row["pass"]], "parts": records,
            "minimumNonRailMarginLowerBoundsMm": {side: min(row["marginLowerBoundsMm"][side] for row in records
                                                              if row["requiredReserveMm"] > 0)
                                                   for side in report["poses"][0]["minimumMarginsMm"]}}


def tube_rotor_clearance(coaxial, assembly, report):
    rows = assembly.pickup_module.centers(assembly.pickup.config)
    radii = {name: max(part["spin"]["radiusUpperMm"] for part in report["poses"][0]["parts"]
                      if part["id"].startswith("v2_star_" + name + "_") and "spin" in part)
             for name in ("front", "middle", "rear")}
    radii["kick"] = 25.5
    cases = []
    delta = [rows["front"][axis] - rows["middle"][axis] for axis in (0, 1)]
    allowance = 2 * math.hypot(*delta) * math.sin(math.radians(0.125))
    for index, center in enumerate(assembly.pickup.config["crossmembers_yz"]):
        for name, radius in radii.items():
            gaps = []
            for sample in range(17):
                angle = math.radians(-sample / 2)
                point = [rows["middle"][0] + delta[0] * math.cos(angle) - delta[1] * math.sin(angle),
                         rows["middle"][1] + delta[0] * math.sin(angle) + delta[1] * math.cos(angle)] if name == "front" else rows[name]
                gaps.append(coaxial.legacy.circle_box_gap(point, radius, [value - 10 for value in center], [value + 10 for value in center]))
            lower = min(gaps) - (allowance if name == "front" else 0)
            cases.append({"tube": index, "row": name, "sourceDiskRadiusMm": radius,
                          "minimumSampleGapMm": min(gaps), "continuousGapLowerBoundMm": lower, "pass": lower > 0})
    return {"pass": all(row["pass"] for row in cases), "cases": cases, "floatRangeDeg": [-8, 0],
            "minimumGapLowerBoundMm": min(row["continuousGapLowerBoundMm"] for row in cases),
            "method": "Conservative actual-source full-spin disks vs solid 20 mm square tube section. 0.5 degree float grid plus exact nearest-sample displacement bound; common fold is rigid.",
            "feedOrContactProof": False}


def targeted_interference(assembly, audit, seconds=100, maximum_commons=60):
    started = time.monotonic()
    instances = {part["id"]: part for part in assembly.instances}
    cache = audit.BoundsCache(assembly)
    retained = [part for part in assembly.instances if part["id"].startswith(("v1_indexer_", "v1_dock_", "pt_indexer_"))]
    moved = set(assembly.powertrain_installation["inboard_repack"]["rotated_ids"])
    selected = [part for part in assembly.instances if part["motion"] == "fixed" and
                (part["id"].startswith(("v2_star_rear_", "v2_shaft_rear", "pt_rear_", "pt_drive_", "pt_pickup_"))
                 or part["id"] in moved)]
    candidates, separated = [], 0
    for first in selected:
        first_bounds, unused = cache.placed(first, 0, 0)
        for second in retained:
            if first["id"] == second["id"]:
                continue
            second_bounds, unused = cache.placed(second, 0, 0)
            if any(min(first_bounds[axis + 3], second_bounds[axis + 3]) - max(first_bounds[axis], second_bounds[axis]) <= 1e-6 for axis in range(3)):
                separated += 1
                continue
            candidates.append((first, second))
    candidates.sort(key=lambda pair: (not pair[0]["id"].startswith("v2_star_rear_"),
                                      "plate" not in pair[1]["id"], pair[0]["id"], pair[1]["id"]))
    shapes, cases, commons = {}, [], 0
    for first, second in candidates:
        record = {"parts": [first["id"], second["id"]], "angleDeg": 0, "floatDeg": 0,
                  "invariantFixedPair": second["motion"] == "fixed"}
        if commons >= maximum_commons or time.monotonic() - started >= seconds:
            record["status"] = "UNKNOWN_BUDGET"
        else:
            for part in (first, second):
                if part["id"] not in shapes:
                    shapes[part["id"]] = assembly.shape(part)
            common = shapes[first["id"]].intersect(shapes[second["id"]])
            volume = abs(common.Volume())
            commons += 1
            record.update(status="INTERFERENCE" if volume > 1e-4 else "CLEAR_AT_MODELED_PHASE",
                          overlapMm3=volume, commonValid=common.isValid())
        cases.append(record)
    failures = [row for row in cases if row["status"] == "INTERFERENCE"]
    return {"status": "FAIL_INTERFERENCE" if failures else "INCOMPLETE" if any(row["status"] == "UNKNOWN_BUDGET" for row in cases) else "TARGETED_PHASE_ZERO_CLEAR",
            "scope": "Relocated fixed rear roller/shaft/drives and repacked deployment box versus retained indexer/dock and installed indexer drives. Exact broad phase; bounded actual Boolean commons. Not all pairs or full rotor phase.",
            "selectedParts": len(selected), "contextParts": len(retained), "separatedPairs": separated,
            "candidatePairs": len(candidates), "exactCommons": commons, "maximumCommons": maximum_commons,
            "secondsBudget": seconds, "elapsedSeconds": time.monotonic() - started,
            "failures": failures, "cases": cases, "globalClearanceCertified": False}


def protected_hashes(audit):
    allowed = {"inboard_frame.py", "test_inboard_frame.py", "INBOARD-FRAME.md"}
    paths = [path for path in ROOT.parent.joinpath("coral-intake-v1").rglob("*") if path.is_file()]
    paths += [path for path in ROOT.rglob("*") if path.is_file() and path.name not in allowed and OUTPUT not in path.parents]
    return {path.relative_to(ROOT.parent).as_posix(): audit.digest(path) for path in sorted(paths)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true")
    arguments = parser.parse_args()
    started = time.monotonic()
    audit = load_sibling("starting_frame")
    before = protected_hashes(audit)
    coaxial, assembly = build()
    print(json.dumps({"phase": "built-inboard", "instances": len(assembly.instances), "elapsedSeconds": time.monotonic() - started}), flush=True)
    report = audit.audit_assembly(assembly)
    report.update(schema="physical-inboard-frame-candidate/1", candidateGeometryChanged=True,
                  selectedConfig=assembly.pickup.config, collisionStatus="PENDING_TARGETED_CHECKS")
    report["continuousFloatFrame"] = continuous_float_frame(assembly, report)
    report["tubeRotorClearance"] = tube_rotor_clearance(coaxial, assembly, report)
    report["verifiedExpectedThreadContacts"] += root_thread_contacts(assembly)
    report["framePass"] = report["continuousFloatFrame"]["pass"]
    report["status"] = "FRAME_CONTAINED" if report["framePass"] else "FAIL_FRAME_RESERVE"
    report["limitations"] = [entry for entry in report["limitations"] if not entry.startswith("Float endpoints")]
    report["limitations"].append("Continuous float containment is bounded only at -165 degree stow; no continuous fold or collision-clearance certificate.")
    report["allowableStowRange"] = {"status": "SINGLE_FOLD_POSE_CHECKED", "intervalsDeg": [],
                                    "selectedFoldDeg": -165, "floatRangeDeg": [-8, 0],
                                    "proof": "Continuous float bounded at the single selected fold; no fold-motion certificate."}
    report["rearOnlyRouteScreen"]["basis"] += " Historical necessary-contact screen only; this candidate also relocates the middle/front rows."
    report["targetedInterference"] = targeted_interference(assembly, audit)
    report["collisionStatus"] = report["targetedInterference"]["status"]
    report["contactStatus"] = "UNQUALIFIED; parent owns new contact trace. Frame containment does not prove feed."
    audit.write_json(OUTPUT / "audit.json", report)
    audit.write_json(OUTPUT / "powertrain-installation.json", assembly.powertrain_installation)
    audit.write_json(OUTPUT / "targeted-interference.json", report["targetedInterference"])
    audit.write_json(OUTPUT / "root-thread-contacts.json", root_thread_contacts(assembly))
    export_valid = True
    if arguments.export:
        audit.OUTPUT = OUTPUT
        export_valid = audit.export_audit(coaxial, assembly, report)
        manifest = json.loads((OUTPUT / "manifest.json").read_text(encoding="utf8"))
        manifest.update(schema="physical-inboard-frame-candidate/1", frame_contained=report["framePass"],
                        pivot_support_geometry="Four inward M5x35 screws into captive blind-tapped blocks inside assumed rails; no exterior heads/nuts or crush sleeves. Wall bearing, block seating, tap finish and impact strength unqualified.")
        manifest["source_code_sha256"].update({"coral-intake-v2/" + name: audit.digest(ROOT / name)
                                               for name in ("inboard_frame.py", "test_inboard_frame.py")})
        audit.write_json(OUTPUT / "manifest.json", manifest)
        checks = json.loads((OUTPUT / "export-checks.json").read_text(encoding="utf8"))
        export_valid = export_valid and checks["all_custom_roundtrips_pass"] and not checks["invalid_definitions"]
    after = protected_hashes(audit)
    changed = [name for name in sorted(set(before) | set(after)) if before.get(name) != after.get(name)]
    frozen = json.loads((ROOT / "output" / "frozen-v1.json").read_text(encoding="utf8"))
    frozen_changes = [name for name, expected in frozen.items() if after.get("coral-intake-v1/" + name) != expected]
    freeze = {"protectedBefore": before, "protectedAfter": after, "changed": changed,
              "frozenV1Count": len(frozen), "frozenV1Changes": frozen_changes,
              "allProtectedUnchanged": not changed, "frozenV1Unchanged": not frozen_changes}
    audit.write_json(OUTPUT / "source-freeze.json", freeze)
    report["sourceFreeze"] = {key: value for key, value in freeze.items() if key not in ("protectedBefore", "protectedAfter")}
    report["elapsedSeconds"] = time.monotonic() - started
    report["exportValid"] = export_valid if arguments.export else None
    audit.write_json(OUTPUT / "audit.json", report)
    summary = {key: report[key] for key in ("status", "framePass", "counts", "collisionStatus", "sourceFreeze", "exportValid", "elapsedSeconds")}
    summary["nonRailMarginsLowerBoundMm"] = report["continuousFloatFrame"]["minimumNonRailMarginLowerBoundsMm"]
    summary["targetedCollisions"] = report["targetedInterference"]["failures"]
    summary["tubeRotorMinimumGapMm"] = report["tubeRotorClearance"]["minimumGapLowerBoundMm"]
    audit.write_json(OUTPUT / "summary.json", summary)
    audit.write_json(OUTPUT / "artifact-hashes.json", {path.relative_to(OUTPUT).as_posix(): audit.digest(path)
                                                       for path in sorted(OUTPUT.rglob("*")) if path.is_file() and path.name != "artifact-hashes.json"})
    print(json.dumps(summary, indent=2), flush=True)
    return 0 if report["framePass"] and export_valid and not changed and not frozen_changes else 1


if __name__ == "__main__":
    sys.exit(main())