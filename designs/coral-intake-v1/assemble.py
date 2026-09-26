import argparse
from collections import Counter
from copy import copy, deepcopy
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import shutil
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, REPO, bounds, box, cq, cylinder, hex_shaft, parameters, reference_boxes
from model import Package, build_pickup, build_indexer, build_dock, clock_outputs, location, matrix, posed, rotation_about, web
from transmission import add_transmission, _socket_screw
from drive_completion import add_drive_completion
from OCP.BRepAlgoAPI import BRepAlgoAPI_Common


STOW_DEGREES = -123
FOLD_SAMPLES = (0, -20, -40, -60, -80, -100, STOW_DEGREES)
FLOAT_SAMPLES = (-8, -4, 0)
SOURCE_FILES = ("model.py", "geometry.py", "transmission.py", "drive_completion.py", "params.json", "cots/sourcebindings.json", "cots/load_vendor.py", "assemble.py", "test_assembly.py")
HISTORICAL_FILES = ("assembled.step", "custompart.step", "parts.json", "BOM.json", "BOM.csv", "validation.json", "quick-validation.json", "integration-checks.json", "export-validation.json")
KNOWN_PAIRS = [("cassette_rear_R", "pickup_drive_X44"), ("pickup_rail_R", "pickup_drive_X44"),
               ("pickup_rail_R", "fold_drive_X44"), ("pickup_rail_R", "floating_stop_R0")]
KNOWN_PAIRS += [("fold_drive_mount", "dc_fold_mount_R" + str(index)) for index in range(4)]
ADJACENT_PAIRS = [("fold_drive_mount", "frame_cheek_1"), ("fold_drive_X44", "frame_cheek_1"),
                  ("pickup_drive_X44", "fold_drive_X44"), ("pickup_drive_mount", "fold_drive_X44"),
                  ("cassette_pivot_R", "fold_drive_X44"), ("dc_fold_flange_R", "fold_drive_X44"),
                  ("cassette_pivot_R", "fold_drive_mount"), ("pickup_drive_mount", "fold_drive_mount")]


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest() if hasattr(hashlib, "file_digest") else hashlib.sha256(stream.read()).hexdigest()


def file_hashes(names):
    return {name: digest(ROOT / name) for name in names if (ROOT / name).is_file()}


def instances_by_id(package):
    return {instance["id"]: instance for instance in package.instances}


def overlap(first, second):
    if not boxes_overlap(bounds(first), bounds(second)):
        return 0.0
    result = first._bool_op((first,), (second,), BRepAlgoAPI_Common(), parallel=False)
    return max(0.0, result.Volume())


def boxes_overlap(first, second):
    return all(first[axis] < second[axis + 3] - 1e-6 and second[axis] < first[axis + 3] - 1e-6 for axis in range(3))


def _replace_plate(package, identifier, shape, holes, description):
    instance = instances_by_id(package)[identifier]
    previous = package.definitions[instance["definition"]]
    if previous["kind"] != "custom_brep":
        raise ValueError("Refuse vendor or nominal hardware trim: " + identifier)
    shape = shape.clean()
    if len(shape.Solids()) != 1 or not shape.isValid() or shape.Volume() <= 0:
        raise ValueError("Reject disconnected/invalid custom plate: " + identifier)
    key = package.custom("assembly_" + identifier, shape, material=previous["material"], stock=description, flat=True, holes=holes)
    instance["definition"] = key
    return key


def _swept_disk(center, pivot, radius, end_angle, thickness=8):
    radial = math.dist(center, pivot)
    start = math.atan2(center[1] - pivot[1], center[0] - pivot[0])
    finish = start + math.radians(-end_angle)
    def point(angle, distance):
        return (pivot[0] + distance * math.cos(angle), pivot[1] + distance * math.sin(angle))
    outer, inner = radial + radius, radial - radius
    if inner <= 0:
        raise ValueError("Swept disk covers pivot")
    section = cq.Workplane("XY", origin=(0, 0, -thickness / 2))
    section = section.moveTo(*point(start, outer)).threePointArc(point((start + finish) / 2, outer), point(finish, outer))
    section = section.lineTo(*point(finish, inner)).threePointArc(point((start + finish) / 2, inner), point(start, inner)).close()
    shape = section.extrude(thickness).val()
    return shape.fuse(cylinder(radius, thickness, (*center, 0)), cylinder(radius, thickness, (*point(finish, radial), 0))).clean()


def _repair_custom_interfaces(package):
    instances = instances_by_id(package)
    repairs = []
    motor_extent = bounds(package.definitions[instances["pickup_drive_X44"]["definition"]]["shape"])
    motor_radius = max(abs(motor_extent[index]) for index in (0, 1, 3, 4)) + 1
    motor_pose = matrix(instances["pickup_drive_X44"]["pose"])
    motor_center = (motor_pose[1][3], motor_pose[2][3])
    for identifier in ("pickup_rail_R", "cassette_rear_R"):
        definition = package.definitions[instances[identifier]["definition"]]
        shape = definition["shape"].cut(cylinder(motor_radius, 8, (*motor_center, 0)))
        holes = definition["holes"] + [(*motor_center, 2 * motor_radius)]
        _replace_plate(package, identifier, shape, holes, "6 mm flat plate; actual pickup motor back-axis circular relief, 1 mm radial envelope allowance; load unqualified")
        bolt_ligaments = [math.dist(motor_center, (horizontal, vertical)) - motor_radius - diameter / 2 for horizontal, vertical, diameter in definition["holes"] if diameter == 5.5]
        minimum_bolt_ligament = min(bolt_ligaments)
        if minimum_bolt_ligament < 3:
            raise ValueError("Pickup relief removes required 3 mm bolt ligament: " + identifier)
        repairs.append({"part": identifier, "repair": "pickup motor axial through-relief", "radius_mm": motor_radius, "center_yz_mm": motor_center,
                        "minimum_existing_bolt_ligament_mm": minimum_bolt_ligament, "load_qualified": False})
    stop_pose = matrix(instances["floating_stop_R0"]["pose"])
    stop_center = (stop_pose[1][3], stop_pose[2][3])
    rail = package.definitions[instances["pickup_rail_R"]["definition"]]
    rail["shape"] = rail["shape"].cut(cylinder(4.25, 8, (*stop_center, 0))).clean()
    rail["holes"].append((*stop_center, 8.5))
    repairs.append({"part": "pickup_rail_R", "repair": "R0 M8 stop shank actual OD8.5 through-hole", "center_yz_mm": stop_center})
    pivot = package.settings["pickup"]["pivot_yz"]
    fold_rotation = rotation_about((0, *pivot), -90)
    relocated = ["fold_drive_mount", "fold_drive_X44", "fold_drive_12T", "fold_drive_pinion_spacer", "fold_drive_pinion_retention"]
    relocated += ["fold_drive_motor_screw_" + str(index) for index in range(3)]
    for identifier in relocated:
        instances[identifier]["pose"] = fold_rotation * instances[identifier]["pose"]
    fold_pair = next(pair for pair in package.gear_pairs if pair["name"] == "fold_drive")
    fold_pair["input"] = [pivot[0] + fold_pair["center_distance"], pivot[1]]
    fold_pair["assembly_input_relocation_degrees"] = -90
    fold_pose = matrix(instances["fold_drive_X44"]["pose"])
    fold_center = (fold_pose[1][3], fold_pose[2][3])
    swept = _swept_disk(fold_center, pivot, motor_radius, package.settings["pickup"]["stow_angle"])
    bolt_pattern = [(horizontal, vertical) for horizontal in (-50, -30) for vertical in (-50, -30)]
    bypass = web([(-9, 287), (20, 175), (110, 175), pivot], 18, 6)
    bolt_web = web([(pivot[0] + horizontal, pivot[1] + vertical) for horizontal, vertical in bolt_pattern] + [tuple(pivot)], 10, 6)
    rail["holes"] += [(pivot[0] + horizontal, pivot[1] + vertical, 5.5) for horizontal, vertical in bolt_pattern]
    relief_exit = web([(53, 299), (53, 345)], 10, 8)
    candidate = rail["shape"].fuse(bypass, bolt_web).cut(swept).cut(relief_exit)
    for horizontal, vertical, diameter in rail["holes"]:
        candidate = candidate.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    candidate = candidate.clean()
    lost_lands = []
    for horizontal, vertical in bolt_pattern:
        center = (pivot[0] + horizontal, pivot[1] + vertical, 0)
        land = cylinder(5.75, 4, center).cut(cylinder(2.75, 6, center))
        retained = overlap(candidate, land) / land.Volume()
        if retained < 0.999:
            lost_lands.append({"center_yz_mm": center[:2], "retained_fraction": retained})
    accepted = len(candidate.Solids()) == 1 and candidate.isValid() and not lost_lands
    if not accepted:
        raise ValueError("Reject fold relocation: disconnected rail or insufficient bolt lands: " + str(lost_lands))
    rail["shape"] = candidate
    rail["stock"] += "; swept fold motor clearance with flat bypass, 3 mm bolt lands checked"
    repairs.append({"part": "pickup_rail_R", "repair": "full fold-motor swept notch plus bypass candidate", "accepted": accepted,
                    "candidate_solids": len(candidate.Solids()), "lost_3mm_bolt_lands": lost_lands,
                    "motor_radius_mm": motor_radius, "center_yz_mm": fold_center, "minimum_radial_pivot_ligament_mm": math.dist(fold_center, pivot) - motor_radius - 16,
                    "relief_exit_slot_yz_mm": [[53, 299], [53, 345]], "relief_exit_width_mm": 20,
                    "bolt_pattern_relative_pivot_mm": bolt_pattern, "status": "APPLIED, load unqualified"})
    local_swept = swept.translate((-pivot[0], -pivot[1], 0))
    blank = web(bolt_pattern + [(0, 0)], 10, 6).fuse(cylinder(26, 6, (0, 0, 0))).cut(local_swept)
    cassette_holes = [(0, 0, 28.57)] + [(horizontal, vertical, 5.5) for horizontal, vertical in bolt_pattern]
    flange_holes = [(horizontal, vertical, 4.2) for horizontal, vertical in bolt_pattern]
    flange = blank
    bore = hex_shaft(12.8, 8)
    for corner in range(6):
        angle = math.radians(60 * corner)
        bore = bore.fuse(cylinder(1.5, 8, (12.8 / math.sqrt(3) * math.cos(angle), 12.8 / math.sqrt(3) * math.sin(angle), 0)))
    flange = flange.cut(bore.rotate((0, 0, 0), (0, 0, 1), 3))
    for horizontal, vertical, diameter in flange_holes:
        flange = flange.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    _replace_plate(package, "dc_fold_flange_R", flange, flange_holes, "6 mm flat torque flange; preserved clocked relieved hex and four M5 tapped holes relocated below pivot; full swept motor relief; load unqualified")
    cheek = package.definitions[instances["frame_cheek_1"]["definition"]]
    _replace_plate(package, "frame_cheek_1", cheek["shape"].cut(cylinder(10, 8, (*fold_center, 0))), cheek["holes"] + [(*fold_center, 20)], "6 mm frame cheek; relocated fold input OD20 through-clearance; old input hole retained; load unqualified")
    cassette = instances["cassette_pivot_R"]
    shape = blank
    for horizontal, vertical, diameter in cassette_holes:
        shape = shape.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    for horizontal, vertical in bolt_pattern:
        shape = shape.cut(cylinder(5.25, 3, (horizontal, vertical, 1.5)))
    key = _replace_plate(package, "cassette_pivot_R", shape, cassette_holes, "6 mm cassette; four OD10.5 counterbores 3 deep from outboard face; 3 mm floor; M5x15 socket screws, 5 mm flange engagement; strength unqualified")
    package.definitions[key]["counterbores"] = [{"center": [horizontal, vertical], "diameter_mm": 10.5, "depth_mm": 3, "floor_mm": 3} for horizontal, vertical in bolt_pattern]
    screw_key = package.define("assembly_M5x15_socket_screw", _socket_screw(15), "steel grade pending", "standard_hardware_nominal_brep", "Nominal M5x15 socket screw, 5 mm flange engagement, procurement pending")
    old_pattern = [(horizontal, vertical) for horizontal in (-20, 20) for vertical in (-20, 20)]
    for index, (horizontal, vertical) in enumerate(bolt_pattern):
        screw = instances["dc_fold_mount_R" + str(index)]
        package.hardware[screw["definition"]] -= 1
        package.hardware[screw_key] += 1
        screw["definition"] = screw_key
        for identifier in ("dc_fold_mount_R" + str(index), "dc_fold_washer_R" + str(index)):
            instances[identifier]["pose"] = cq.Location(cq.Vector(-3, horizontal - old_pattern[index][0], vertical - old_pattern[index][1])) * instances[identifier]["pose"]
    repairs.append({"part": "cassette_pivot_R", "repair": "recess four screw heads and washers 3 mm, M5x18 to M5x15", "thread_engagement_mm": 5, "mount_axial_clearance_mm": 1, "counterbore_floor_mm": 3})
    package.drive_completion["fold"]["right_mount_pattern_relative_pivot_mm"] = bolt_pattern
    package.drive_completion["fold"]["right_screw_length_mm"] = 15
    repairs.append({"part": "fold_drive", "repair": "input assembly relocated -90 degrees about unchanged output, same 45.72 center distance and gears", "relocated_ids": relocated,
                    "original_swept_relief": "REJECTED in first focused run: original 40 mm square bolt lands intersect full sweep", "native_joint_verified": False})
    return repairs


def build_assembly(settings=None):
    source_before = file_hashes(SOURCE_FILES)
    settings = deepcopy(parameters() if settings is None else settings)
    if settings["pickup"]["pivot_yz"] != [110, 265] or settings["pickup"]["roller_width"] != 360:
        raise ValueError("Checkpoint relief geometry requires source pivot Y110 Z265 and roller width360")
    original_stow = settings["pickup"]["stow_angle"]
    settings["pickup"]["stow_angle"] = STOW_DEGREES
    settings["bounds"]["fold_angle"] = [STOW_DEGREES, 0]
    package = Package(settings)
    print("Assembly: pickup, indexer, dock", flush=True)
    build_pickup(package)
    build_indexer(package)
    build_dock(package)
    base_count = len(package.instances)
    print("Assembly: transmission and drive completion", flush=True)
    add_transmission(package)
    add_drive_completion(package)
    baseline = copy(package)
    baseline.instances = [dict(instance) for instance in package.instances]
    baseline.definitions = {name: dict(definition) for name, definition in package.definitions.items()}
    baseline.gear_pairs = deepcopy(package.gear_pairs)
    clock_outputs(baseline, degrees=3)
    repairs = _repair_custom_interfaces(package)
    clock_outputs(package, degrees=3)
    instances = instances_by_id(package)
    instances["fold_drive_12T"].update(motion="fold_input", input_ratio=-5, input_center_yz=list(next(pair["input"] for pair in package.gear_pairs if pair["name"] == "fold_drive")))
    package.holes = [{"part": instance["id"], "local_center": [horizontal, vertical, 0], "diameter": diameter}
                     for instance in package.instances for horizontal, vertical, diameter in package.definitions[instance["definition"]]["holes"]]
    if source_before != file_hashes(SOURCE_FILES):
        raise RuntimeError("Source changed during assembly build; do not export a mixed checkpoint")
    baseline_instances = instances_by_id(baseline)
    affected = [instance["id"] for instance in package.instances if instance["definition"] != baseline_instances[instance["id"]]["definition"] or
                matrix(instance["pose"]) != matrix(baseline_instances[instance["id"]]["pose"]) or instance["motion"] != baseline_instances[instance["id"]]["motion"]]
    package._assembly_baseline = baseline
    package.assembly_checkpoint = {"release": "NOT RELEASED", "base_instances": base_count, "net_helper_instances": len(package.instances) - base_count,
                                   "engineering_variant": {"source_stow_degrees": original_stow, "stow_degrees": STOW_DEGREES, "params_file_modified": False},
                                   "repairs": repairs, "fold_input": {"pinion_ratio": -5, "vendor_motor_body_unchanged": True, "fused_vendor_rotor_motion_verified": False},
                                   "source_hashes": source_before, "affected_instance_ids": affected,
                                   "bounded_passes": {"initial": "seven of eight inherited static clashes cleared; original fold notch rejected for lost bolt lands",
                                                      "repair_1": "relocated fold input and bolt pattern; split rail rejected",
                                                      "repair_2": "open relief exit; single-solid rail; eight inherited static pairs and five meshes pass",
                                                      "repair_3": "final verification closure: ligament guard, uncorrected baseline comparison and relocated-input adjacent pairs; no further geometry iterations"}}
    return package


def inventory(package):
    counts = Counter(instance["definition"] for instance in package.instances)
    custom = {name: quantity for name, quantity in counts.items() if package.definitions[name]["kind"] == "custom_brep"}
    services = {}
    for instance in package.instances:
        service = instance["module"]
        if service == "indexer":
            service = "indexer_left" if matrix(instance["pose"])[0][3] < 0 or "_L" in instance["id"] else "indexer_right"
        elif instance["id"].startswith(("fold_", "frame_", "pivot_", "dc_fold_")):
            service = "fold_frame_interface"
        services.setdefault(service, []).append(instance["id"])
    identifiers = [instance["id"] for instance in package.instances]
    return {"instances": len(identifiers), "unique_ids": len(set(identifiers)), "active_definitions": len(counts),
            "active_custom_definitions": len(custom), "custom_instances": sum(custom.values()), "all_definitions": len(package.definitions),
            "all_custom_definitions": sum(definition["kind"] == "custom_brep" for definition in package.definitions.values()),
            "unused_definitions": sorted(set(package.definitions) - counts.keys()), "custom_quantities": custom,
            "roles": dict(Counter(instance["role"] for instance in package.instances)), "service_units": services,
            "modularity_status": "Existing pickup, independent indexer banks, tray/dock and fold interface; no simplification claimed from helper count; physical service access unqualified"}


def custom_solid_checks(package):
    rows = []
    for name in sorted({instance["definition"] for instance in package.instances}):
        definition = package.definitions[name]
        if definition["kind"] != "custom_brep":
            continue
        shape = definition["shape"]
        solids = shape.Solids()
        valid = shape.isValid() and bool(solids) and all(solid.isValid() and solid.Volume() > 1e-6 and all(shell.Closed() for shell in solid.Shells()) for solid in solids)
        rows.append({"definition": name, "solids": len(solids), "valid_closed_positive": valid,
                     "flat_single_solid": not definition["flat"] or len(solids) == 1, "volume_mm3": shape.Volume()})
    return {"pass": all(row["valid_closed_positive"] and row["flat_single_solid"] for row in rows), "definitions": rows}


def source_checks(package):
    rows = [{"product": name, "path": source["pathrepoRelative"], "expected_sha256": source["sha256"],
             "actual_sha256": digest(REPO / source["pathrepoRelative"])} for name, source in package.sources.items()]
    return {"pass": len(rows) == 6 and all(row["expected_sha256"] == row["actual_sha256"] for row in rows), "products": rows,
            "imported_originals": len(package.import_cache), "vendor_boolean_trims": False, "step_roundtrip_verified": False}


def exact_pair(package, first, second, fold=0, floating=0):
    instances = instances_by_id(package)
    try:
        volume = overlap(posed(package, instances[first], fold, floating), posed(package, instances[second], fold, floating))
        return {"first": first, "second": second, "fold_degrees": fold, "float_degrees": floating, "overlap_mm3": volume, "pass": volume <= 0.01}
    except Exception as error:
        return {"first": first, "second": second, "fold_degrees": fold, "float_degrees": floating, "pass": False, "error": str(error), "status": "UNCERTAIN kernel error"}


def focused_checks(package):
    known = [exact_pair(package, first, second) for first, second in KNOWN_PAIRS]
    gears = []
    for pair in package.gear_pairs:
        row = exact_pair(package, pair["pinion"], pair["gear"])
        row.update(name=pair["name"], center_distance_mm=pair["center_distance"], continuous_mesh_verified=False)
        gears.append(row)
    return {"known_pairs": known, "known_pairs_pass": all(row["pass"] for row in known),
            "gear_pairs": gears, "five_static_gear_pairs_pass": len(gears) == 5 and all(row["pass"] for row in gears)}


def transformed_bounds(extent, pose):
    transform = matrix(pose)
    corners = [(horizontal, vertical, height) for horizontal in (extent[0], extent[3]) for vertical in (extent[1], extent[4]) for height in (extent[2], extent[5])]
    points = [[sum(transform[row][column] * point[column] for column in range(3)) + transform[row][3] for row in range(3)] for point in corners]
    return [min(point[axis] for point in points) for axis in range(3)] + [max(point[axis] for point in points) for axis in range(3)]


def motion_screen(package):
    instances = instances_by_id(package)
    deployed = {name: bounds(posed(package, instance)) for name, instance in instances.items()}
    references = reference_boxes(package.settings)
    fixed = {name: extent for name, extent in deployed.items() if instances[name]["motion"] == "fixed"}
    fixed.update({"reference:" + name: bounds(shape) for name, shape in references.items()})
    pivot = (0, *package.settings["pickup"]["pivot_yz"])
    middle = (0, *next(roller["yz"] for roller in package.settings["pickup"]["rollers"] if roller["id"] == "middle"))
    samples = []
    candidates = {}
    for fold in FOLD_SAMPLES:
        for floating in FLOAT_SAMPLES:
            extents = dict(fixed)
            for name, instance in instances.items():
                motion = instance["motion"]
                if motion == "fixed":
                    continue
                if motion == "fold_input":
                    pose = rotation_about((0, *instance["input_center_yz"]), instance["input_ratio"] * fold)
                else:
                    pose = rotation_about(pivot, fold)
                    if motion == "float":
                        pose = pose * rotation_about(middle, floating)
                extent = transformed_bounds(deployed[name], pose)
                extents[name] = extent
                for other, fixed_extent in fixed.items():
                    if boxes_overlap(extent, fixed_extent):
                        candidates.setdefault((name, other), []).append([fold, floating])
            package_extents = {name: extent for name, extent in extents.items() if not name.startswith("reference:")}
            floor_candidates = [name for name, extent in package_extents.items() if extent[2] < package.settings["limits"]["minimum_floor"] + 1]
            for name in floor_candidates:
                package_extents[name] = bounds(posed(package, instances[name], fold, floating))
            if fold == STOW_DEGREES:
                for name in package_extents:
                    package_extents[name] = bounds(posed(package, instances[name], fold, floating))
            union = [min(extent[axis] for extent in package_extents.values()) for axis in range(3)] + [max(extent[axis] for extent in package_extents.values()) for axis in range(3, 6)]
            floor = min((extent[2], name) for name, extent in package_extents.items())
            moving_extents = {name: extent for name, extent in package_extents.items() if instances[name]["motion"] in ("fold", "float")}
            moving_front = min((extent[1], name) for name, extent in moving_extents.items())
            limiting = {label: min((margin(extent), name) for name, extent in package_extents.items()) for label, margin in
                        (("left", lambda extent: extent[0] + 350), ("right", lambda extent: 350 - extent[3]),
                         ("front", lambda extent: extent[1]), ("rear", lambda extent: 760 - extent[4]),
                         ("height", lambda extent: package.settings["limits"]["maximum_start_height"] - extent[5]))}
            width_margin = min(union[0] + 350, 350 - union[3])
            stow_margin = min(width_margin, union[1], 760 - union[4], package.settings["limits"]["maximum_start_height"] - union[5]) if fold == STOW_DEGREES else None
            samples.append({"fold_degrees": fold, "floating_degrees": floating, "bounds_mm": union, "minimum_floor_mm": floor[0], "floor_limiting_part": floor[1],
                            "floor_reserve_above_5mm": floor[0] - 5, "width_margin_mm": width_margin, "stow_margin_mm": stow_margin,
                            "limiting_parts": limiting, "moving_front_margin_mm": moving_front[0], "moving_front_limiting_part": moving_front[1],
                            "floor_minimum_parts": sorted(name for name, extent in package_extents.items() if abs(extent[2] - floor[0]) < 1e-5),
                            "within_floor_cap": floor[0] >= 5 - 1e-5, "stow_minimum_1mm_pass": stow_margin is None or stow_margin >= 1 - 1e-5,
                            "stow_target_5mm_pass": stow_margin is None or stow_margin >= 5 - 1e-5,
                            "maximum_extension_mm": max(-union[1], union[4] - 760, -union[0] - 350, union[3] - 350),
                            "bounds_method": "exact posed bounds at stow; conservative rotated AABBs elsewhere, near-floor candidates exact"})
        print("Assembly screen: fold " + str(fold), flush=True)
    declared = {}
    for sign in (-1, 1):
        declared[frozenset(("pivot_stub_" + str(sign), "frame_pivot_bearing_" + str(sign)))] = "Specific coaxial hex stub / source bearing bore; nominal running joint, still needs exact fit and retention qualification"
    declared[frozenset(("pivot_stub_1", "fold_drive_output_bearing"))] = "Specific fold output shaft / bearing bore; exact fit required"
    declared[frozenset(("fold_drive_12T", "fold_drive_60T"))] = "Specific 12:60 external gear contact; zero hard volume required at measured phases, continuous mesh unverified"
    rows = [{"first": first, "second": second, "sample_poses": poses, "status": "UNCERTAIN conservative envelope overlap",
             "declared_joint": declared.get(frozenset((first, second)))} for (first, second), poses in sorted(candidates.items())]
    return {"samples": samples, "sample_count": len(samples), "moving_vs_all_fixed": True, "fixed_instances": len(fixed) - len(references),
            "aabb_candidates": rows, "candidate_pairs": len(rows), "continuous_motion_certified": False,
            "moving_vs_moving_exhaustive": False, "connectivity_n_squared_run": False, "pass": False,
            "status": "TRIAGE ONLY; overlapping envelopes are uncertain, declared joints are not collision waivers"}


def main_pose_checks(package, screen):
    pairs = set(KNOWN_PAIRS)
    changed = set(package.assembly_checkpoint["affected_instance_ids"])
    pairs.update(ADJACENT_PAIRS)
    for row in screen["aabb_candidates"]:
        if (row["first"] in changed or row["second"] in changed) and not row["second"].startswith("reference:"):
            pairs.add((row["first"], row["second"]))
    results = []
    for first, second in sorted(pairs):
        for fold, floating in ((0, 0), (-60, -8), (STOW_DEGREES, -8), (STOW_DEGREES, 0)):
            results.append(exact_pair(package, first, second, fold, floating))
    for fold in FOLD_SAMPLES:
        if fold:
            results.append(exact_pair(package, "fold_drive_12T", "fold_drive_60T", fold))
    for row in results:
        if not row["pass"]:
            baseline = exact_pair(package._assembly_baseline, row["first"], row["second"], row["fold_degrees"], row["float_degrees"])
            row["uncorrected_integrated_baseline"] = baseline
            if "overlap_mm3" in row and "overlap_mm3" in baseline:
                row["delta_mm3"] = row["overlap_mm3"] - baseline["overlap_mm3"]
                row["classification"] = "NEW_OR_WORSENED" if row["delta_mm3"] > 0.01 else "INHERITED_OR_REDUCED_STILL_FAIL"
    return {"checks": results, "pass": all(row["pass"] for row in results), "scope": "Known and relocated-input adjacent pairs plus affected-part versus all-fixed candidates, four key poses; fold gear sampled at all seven angles; no global pair certification",
            "baseline": "Same current uncorrected integrated helpers, clocked3; imposed -123 variant, not overwritten historical export"}


def write_checks(report):
    destination = ROOT / "assembly-checks.json"
    if destination.exists():
        history = ROOT / "history"
        history.mkdir(exist_ok=True)
        archive = history / ("assembly-checks-" + digest(destination) + ".json")
        if not archive.exists():
            shutil.copy2(destination, archive)
    destination.write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")


def verify_assembly(package):
    started = time.monotonic()
    historical = file_hashes(HISTORICAL_FILES)
    report = {"schema_version": 1, "created_utc": datetime.now(timezone.utc).isoformat(), "release": "NOT RELEASED", "export_performed": False,
              "checkpoint": package.assembly_checkpoint, "inventory": inventory(package), "sources": source_checks(package), "custom_solids": custom_solid_checks(package)}
    print("Assembly checks: known interferences and five static meshes", flush=True)
    report["focused"] = focused_checks(package)
    report["motion"] = motion_screen(package)
    print("Assembly checks: exact corrected pairs at main poses", flush=True)
    report["main_poses"] = main_pose_checks(package, report["motion"])
    inherited_path = ROOT / "validation.json"
    if inherited_path.exists():
        inherited = json.loads(inherited_path.read_text(encoding="utf8"))
        report["inherited_validation"] = {"sha256": historical.get("validation.json"), "samples": inherited.get("motion", {}).get("samples", []), "unchanged": True}
    report["historical_hashes"] = historical
    report["historical_unchanged"] = historical == file_hashes(HISTORICAL_FILES)
    report["source_current"] = package.assembly_checkpoint["source_hashes"] == file_hashes(SOURCE_FILES)
    samples = report["motion"]["samples"]
    report["gates"] = {"unique_active_ids": report["inventory"]["instances"] == report["inventory"]["unique_ids"],
                       "custom_valid_closed_solids": report["custom_solids"]["pass"], "six_original_hashes": report["sources"]["pass"],
                       "five_static_gear_meshes": report["focused"]["five_static_gear_pairs_pass"], "known_static_clearance": report["focused"]["known_pairs_pass"],
                       "main_pose_corrected_clearance": report["main_poses"]["pass"], "sampled_floor_5mm": all(row["within_floor_cap"] for row in samples),
                       "sampled_extension_cap": all(row["maximum_extension_mm"] <= package.settings["limits"]["extension"] + 1e-5 for row in samples),
                       "stow_1mm_minimum": all(row["stow_minimum_1mm_pass"] for row in samples), "stow_5mm_target": all(row["stow_target_5mm_pass"] for row in samples),
                       "source_current": report["source_current"], "historical_unchanged": report["historical_unchanged"],
                       "all_fixed_candidate_resolution": False, "continuous_motion": False, "full_D1_physical_gates": False,
                       "strength_and_fold_hold": False, "field_reliability": False, "manufacturing_release": False}
    report["elapsed_check_seconds"] = time.monotonic() - started
    report["pass"] = all(report["gates"].values())
    report["parent_export_contract"] = {"builder": "assemble.build_assembly", "exports_performed": False,
                                       "historical_model_export_package_must_not_be_called": True,
                                       "checkpoint_only": True, "active_definitions_only": True,
                                       "source_hashes_must_match_at_export": True,
                                       "status": "FAILED ENGINEERING CHECKPOINT ONLY; no manufacturing or physical release",
                                       "preserve_metadata": ["assembly_checkpoint", "transmission", "drive_completion", "settings", "gear_pairs", "joints", "holes", "missing"]}
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Write owned checkpoint report only; never export CAD")
    arguments = parser.parse_args()
    if not arguments.check:
        parser.error("Use --check; parent owns checkpoint-directory exports after verification")
    report = verify_assembly(build_assembly())
    write_checks(report)
    print(json.dumps({"instances": report["inventory"]["instances"], "active_custom_definitions": report["inventory"]["active_custom_definitions"], "gates": report["gates"], "release": report["release"]}, indent=2), flush=True)
    sys.exit(0 if report["pass"] else 1)