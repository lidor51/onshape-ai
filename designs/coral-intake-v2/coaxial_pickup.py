import argparse
from collections import Counter
import csv
import importlib.util
import json
import math
from pathlib import Path
import sys
import time


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "coaxial-output" / "revision-feed"
SPEC = importlib.util.spec_from_file_location("coaxial_retained_system", ROOT / "system.py")
legacy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(legacy)
module, model, completion = legacy.load_builders()
cq = module.cq


def settings():
    config = module.settings()
    middle_y = -25 - math.sqrt(155 ** 2 - 27 ** 2)
    config.update(pivot_yz=[-25.0, 348.0], middle_yz=[middle_y, 321.0],
                  front_dy=math.sqrt(180 ** 2 - 155 ** 2), front_distance=180.0,
                  rear_dy=-25 - middle_y, rear_distance=155.0,
                  kick_yz=[-122.0, 34.0], crossmembers_yz=[[-288.0, 268.0], [-210.0, 408.0]],
                  stow_angle=-165.0, fold_angles=[0, -15, -30, -45, -60, -75, -90, -105, -120, -135, -150, -165],
                  indexer_lift_mm=41.15, support_x=310.0, rear_shaft_length=648.0)
    return config


def candidate_belts(config):
    rows = module.centers(config)
    return [{"rows": [first, second], "centers_mm": math.dist(rows[first], rows[second]),
             "candidate_sku": sku, "length_mm": length, "pulley_teeth": [18, 18],
             "pitch_mm": 5, "width_mm": 9, "profile": "HTD",
             "computed_pitch_length_mm": 2 * math.dist(rows[first], rows[second]) + 90,
             "catalog_evidence": "User-supplied parent official-catalog verification, 2026-09-19",
             "status": "LENGTH_CANDIDATE_ONLY_NO_PULLEY_DATUMS", "physical_drive_complete": False}
            for first, second, sku, length in (("front", "middle", "WCP-0623", 450),
                                               ("middle", "rear", "WCP-0621", 400))]


def crossmember_screen(config):
    rows = module.centers(config)
    margins = []
    for floating in range(-8, 1):
        angle = math.radians(floating)
        delta = [rows["front"][axis] - rows["middle"][axis] for axis in range(2)]
        front = [rows["middle"][0] + delta[0] * math.cos(angle) - delta[1] * math.sin(angle),
                 rows["middle"][1] + delta[0] * math.sin(angle) + delta[1] * math.cos(angle)]
        for index, center in enumerate(config["crossmembers_yz"]):
            for row, position in {**rows, "front": front}.items():
                radius = 25.5 if row == "kick" else 63.7
                gap = legacy.circle_box_gap(position, radius, [value - 10 for value in center], [value + 10 for value in center])
                margins.append({"tube": index, "row": row, "float_deg": floating, "conservative_radial_gap_mm": gap})
    return {"minimum_gap_mm": min(entry["conservative_radial_gap_mm"] for entry in margins), "samples": margins,
            "scope": "20 mm square tubes vs conservative full-spin 63.7 mm upper and 25.5 mm kicker disks; nine float samples; no coral transport proof",
            "superseded_actual_solid_witnesses": [
                {"tube_yz": [-288, 215], "row": "front", "phase_deg": 15, "interior_witness_mm": [0, -279, 206]},
                {"tube_yz": [-210, 360], "row": "middle", "phase_deg": 0, "interior_witness_mm": [0, -210, 351]}]}


def build_structure(config=None):
    config = config or settings()
    pickup = module.Pickup(config)
    rows = module.centers(config)
    thickness = config["plate_thickness"]
    cheek = module.web([rows["kick"], rows["middle"], rows["rear"]], 23, thickness)
    cheek = cheek.fuse(module.web([rows["middle"], *reversed(config["crossmembers_yz"])], 23, thickness)).clean()
    holes = [(*rows[name], config["bearing_seat"]) for name in ("kick", "middle", "rear")]
    holes += [(*center, 5.5) for center in config["crossmembers_yz"]]
    pickup.define("main_cheek", module.drill(cheek, holes, thickness), holes=holes,
                  material="6 mm aluminum flat router plate; grade and finish bore unqualified",
                  positioning_pivot="rear roller axis; one seat, no independent pivot lobe")
    arm = module.drill(module.web([rows["middle"], rows["front"]], 23, thickness),
                       [(*rows[name], config["bearing_seat"]) for name in ("middle", "front")], thickness)
    pickup.define("floating_cheek", arm, material="6 mm aluminum flat router plate")
    length = 2 * config["cheek_x"] - thickness
    pickup.define("crossmember", module.hollow_tube(length), material="20x20x2 aluminum tube",
                  length_mm=length, process="cut_stock")
    for side in (-1, 1):
        pickup.add("main_cheek_" + str(side), "main_cheek", module.location((side * config["cheek_x"], 0, 0)))
        pickup.add("floating_cheek_" + str(side), "floating_cheek", module.location((side * config["arm_x"], 0, 0)), "float")
    for index, center in enumerate(config["crossmembers_yz"]):
        pickup.add("crossmember_" + str(index), "crossmember", module.location((0, *center)))
    return pickup


def retain_coaxial_bearings(pickup):
    config = pickup.config
    bearing, binding = module.vendor("hex_bearing")
    pickup.sources["hex_bearing"] = binding
    pickup.define("WCP_0783", bearing, "authentic_vendor", source_solid_indices=[0], source="hex_bearing")
    keeper = module.ring(38, 24, 2).fuse(module.web([(-38, 0), (38, 0)], 6, 2)).clean()
    keeper = module.drill(keeper, [(0, 0, 24), (-38, 0, 5.5), (38, 0, 5.5)], 2)
    pickup.define("bearing_keeper", keeper, material="2 mm aluminum flat plate", process="profile_plate")
    for layout in module.bearing_layout(config):
        if layout["key"] == "pivot":
            continue
        angle = math.radians(layout["angle"])
        points = [[layout["center"][axis] + side * 38 * (math.cos(angle), math.sin(angle))[axis]
                   for axis in range(2)] for side in (-1, 1)]
        cheek = pickup.definitions[layout["plate"]]["shape"]
        cheek = cheek.fuse(module.web([points[0], layout["center"], points[1]], 9, 6)).clean()
        pickup.definitions[layout["plate"]]["shape"] = module.drill(
            cheek, [(*layout["center"], config["bearing_seat"])] + [(*point, 5.5) for point in points], 6)
        for side in (-1, 1):
            prefix = "bearing_" + layout["key"] + "_" + str(side)
            face = side * (layout["x"] + 3)
            motion = "fixed" if layout["key"] == "rear" else "fold" if layout["key"] == "arm_middle" else layout["motion"]
            pickup.add(prefix, "WCP_0783", module.location((face, *layout["center"]), (side, 0, 0)), motion, "bearing")
            pickup.add(prefix + "_keeper", "bearing_keeper",
                       module.oriented_pose((face + side * 2.6375, *layout["center"]), side, layout["angle"]),
                       layout["motion"], "retainer")
            for index, point in enumerate(points):
                module.hardware(pickup, prefix + "_bolt_" + str(index), (face + side * 4.6375, *point),
                                (side, 0, 0), 16, layout["motion"], (side * (layout["x"] - 3), *point))
            pickup.joints.append({"id": prefix, "type": "source_flanged_bearing_with_bolted_outer_race_keeper",
                                  "center_yz": layout["center"], "seat_x_mm": face, "motion": motion,
                                  "keeper_motion": layout["motion"], "seat_diameter_mm": config["bearing_seat"],
                                  "fit_and_load_qualified": False})


def build_pickup(config=None):
    pickup = build_structure(config)
    module.define_hardware(pickup)
    retain_coaxial_bearings(pickup)
    module.crossmember_joints(pickup)
    module.float_stops(pickup)
    module.add_rotors(pickup)
    removed = [part["id"] for part in pickup.instances if part["id"].startswith("pivot_")]
    pickup.instances = [part for part in pickup.instances if part["id"] not in removed]
    pickup.retention = [entry for entry in pickup.retention if not entry["id"].startswith("pivot_")]
    rows = module.centers(pickup.config)
    length = pickup.config["rear_shaft_length"]
    pickup.define("rear_powered_hex_shaft", module.tapped_shaft(length), material="AF12.7 aluminum hex; grade unverified",
                  process="cut_and_end_tap", length_mm=length,
                  reason="Two outer chassis supports beyond retained bank plates plus end retention; other shafts remain 500 mm")
    for part in pickup.instances:
        identifier = part["id"]
        if identifier.startswith(("star_rear_", "rear_")) or identifier in ("shaft_rear", "bearing_rear_-1", "bearing_rear_1"):
            part["motion"] = "fixed"
        if identifier == "shaft_rear":
            part["definition"] = "rear_powered_hex_shaft"
    replacing = ["rear_outer_" + str(side) for side in (-1, 1)]
    pickup.instances = [part for part in pickup.instances if part["id"] not in replacing]
    pickup.retention = [entry for entry in pickup.retention if entry["id"] not in replacing]
    data = pickup.sources["hex_bearing"]["datums"]
    for side in (-1, 1):
        outer_face = pickup.config["support_x"] + 3
        inner_face = pickup.config["cheek_x"] + 3
        between = sorted([side * (inner_face + data["flange_thickness_mm"]),
                          side * (outer_face - data["journal_depth_to_seat_mm"])])
        end = sorted([side * (outer_face + data["flange_thickness_mm"]), side * length / 2])
        module.spacer(pickup, "rear_to_frame_" + str(side), *between, rows["rear"], "fixed")
        module.spacer(pickup, "rear_frame_end_" + str(side), *end, rows["rear"], "fixed")
        for part in pickup.instances:
            if part["id"] == "rear_end_washer_" + str(side):
                part["pose"] = module.location((side * (length / 2 + 1), *rows["rear"]), (side, 0, 0))
            if part["id"] == "rear_end_screw_" + str(side):
                part["pose"] = module.location((side * (length / 2 + 2), *rows["rear"]), (side, 0, 0))
    active = {part["definition"] for part in pickup.instances}
    pickup.definitions = {name: entry for name, entry in pickup.definitions.items() if name in active}
    pickup.replacements = {"removed_legacy_instances": removed,
                           "omitted_legacy_bearings": ["bearing_pivot_-1", "bearing_pivot_1"],
                           "reconstructed": ["main_cheek", "floating_cheek", "float_stops", "crossmember_joints"],
                           "replaced_rear_spacers": replacing,
                           "rear_rotor_positioning": "fixed; spin not simulated; keeper and cheek fold independently"}
    return pickup


class CoaxialSystem(legacy.System):
    def pose(self, instance, angle=0, floating=0):
        pose = instance["pose"]
        if instance["motion"] == "float":
            pose = module.rotation((0, *module.centers(self.pickup.config)["middle"]), floating) * pose
        if instance["motion"] in ("float", "fold"):
            pose = module.rotation((0, *self.pickup.config["pivot_yz"]), angle) * pose
        return pose


def add_mounts(assembly):
    config = assembly.pickup.config
    rear = config["pivot_yz"]
    roots = [(70.0, 45.0), (190.0, 45.0)]
    keeper_points = [(rear[0] - 38, rear[1]), (rear[0] + 38, rear[1])]
    plate = module.web([roots[0], rear, roots[1], roots[0]], 18, 6)
    plate = plate.fuse(module.web([keeper_points[0], rear, keeper_points[1]], 9, 6)).clean()
    holes = [(*rear, 28.57)] + [(*point, 5.5) for point in roots + keeper_points]
    assembly.define("coaxial_frame_plate", module.drill(plate, holes, 6), "6 mm aluminum router plate; grade unqualified",
                    holes_yz=holes, no_bends=True)
    rail = module.box((25, 710, 40)).cut(module.box((21, 712, 36)))
    for center in roots:
        rail = rail.cut(module.cylinder(2.75, 27, (0, center[0] - 380, 0), (1, 0, 0)))
    assembly.define("assumed_chassis_side_rail", rail, "25x40x2 aluminum tube; ASSUMED chassis interface",
                    stock="710 mm saw cut; two cross-drilled 5.5 mm holes; not an actual robot frame source")
    gap = 325 - (config["support_x"] + 3)
    assembly.define("pivot_frame_standoff", module.ring(20, 5.5, gap), "aluminum lathe standoff", length_mm=gap)
    assembly.define("frame_crush_sleeve", module.ring(10, 5.5, 21), "aluminum lathe sleeve", length_mm=21)
    for side in (-1, 1):
        suffix = str(side)
        assembly.add("coaxial_frame_plate_" + suffix, "coaxial_frame_plate", module.location((side * config["support_x"], 0, 0)))
        assembly.add("assumed_chassis_side_rail_" + suffix, "assumed_chassis_side_rail", cq.Location(cq.Vector(side * 337.5, 380, 45)))
        face = side * (config["support_x"] + 3)
        assembly.add("coaxial_outer_bearing_" + suffix, "v2_WCP_0783", module.location((face, *rear), (side, 0, 0)), role="bearing")
        assembly.add("coaxial_outer_keeper_" + suffix, "v2_bearing_keeper",
                     module.oriented_pose((face + side * 2.6375, *rear), side), role="retainer")
        for index, center in enumerate(keeper_points):
            prefix = "coaxial_keeper_bolt_" + suffix + "_" + str(index)
            assembly.add(prefix, "v2_M5x16", module.location((face + side * 4.6375, *center), (side, 0, 0)), role="fastener")
            assembly.add(prefix + "_washer", "v2_M5_washer", module.location((face + side * 4.1375, *center), (side, 0, 0)), role="fastener")
            assembly.add(prefix + "_nut", "v2_M5_flanged_nut",
                         module.location((side * (config["support_x"] - 5.5), *center), (side, 0, 0)), role="fastener")
        for index, center in enumerate(roots):
            prefix = "frame_root_" + suffix + "_" + str(index)
            assembly.add(prefix + "_standoff", "pivot_frame_standoff", module.location((side * (325 - gap / 2), *center)), role="spacer")
            assembly.add(prefix + "_crush_sleeve", "frame_crush_sleeve", module.location((side * 337.5, *center)), role="spacer")
            legacy.add_fastener(assembly, prefix + "_screw", (side * 351, *center), side, 50, "fixed")
            assembly.add(prefix + "_washer", "v2_M5_washer", module.location((side * 350.5, *center), (side, 0, 0)), role="fastener")
            assembly.add(prefix + "_nut", "v2_M5_flanged_nut", module.location((side * (config["support_x"] - 5.5), *center), (side, 0, 0)), role="fastener")
            assembly.joints.append({"id": prefix, "type": "through_bolt_crush_sleeve_and_standoff",
                                    "parts": ["coaxial_frame_plate_" + suffix, "assumed_chassis_side_rail_" + suffix],
                                    "axis": [side, 0, 0], "center_yz": center, "bolt": "M5x50 nominal",
                                    "grip_mm": 6 + gap + 25 + 1, "nut_mm": 5, "protrusion_mm": 1,
                                    "positive_retention": True, "load_and_product_qualified": False})
    bumper = module.box((700, 85, 120), (0, -42.5, 105))
    assembly.define("assumed_bumper", bumper, "REFERENCE ONLY", "reference_envelope", bounds_basis="User supplied Y[-85,0], Z[45,165]")
    assembly.add("assumed_bumper", "assumed_bumper", role="reference_environment")
    for name, size, center in (("front", (700, 25, 40), (0, 12.5, 45)),
                                ("rear", (700, 25, 40), (0, 747.5, 45))):
        key = "assumed_frame_" + name
        assembly.define(key, module.box(size, center), "REFERENCE ONLY", "reference_envelope")
        assembly.add(key, key, role="reference_environment")
    assembly.joints.append({"id": "single_coaxial_positioning_axis", "type": "revolute_cheeks_about_powered_rear_shaft",
                            "axis": [1, 0, 0], "center": [0, *rear], "cheek_bearing_planes_x_mm": [-228, 228],
                            "chassis_bearing_planes_x_mm": [-313, 313], "rear_shaft_length_mm": config["rear_shaft_length"],
                            "bearing_count_on_axis": 4, "separate_pivot_stubs": False,
                            "outer_races_kept": True, "shaft_end_washers_and_tapped_end_screws": True,
                            "axial_preload_and_tolerance": "UNQUALIFIED rigid four-bearing stack; shim/end-float specification required",
                            "deployment_torque_connection": "MISSING; powered hex shaft must not be locked to positioning cheek"})


def add_stages(assembly):
    rear = assembly.pickup.config["pivot_yz"]
    stage_center = 106.5356
    for name, output, motor in (("pickup", (rear[0], rear[1] - stage_center), (rear[0] - 45.72, rear[1] - stage_center)),
                                 ("deployment", (504.28, 100.0), (550.0, 100.0))):
        package = model.Package(model.parameters())
        package.import_cache.update(assembly.retained.import_cache)
        package.settings["pickup"]["sideplate_x"] = 255
        shaft = package.custom(name + "_stage_shaft", model.shaft(47), stock="AF12.7 x47, X258..305, end flush to washer; second bearing and mount incomplete")
        package.add(name + "_stage_shaft", shaft, model.location((281.5, *output), (1, 0, 0)), "dock", "hard_shaft")
        package.drive(name + "_drive", output, motor, 260, (1, 0, 0), "dock", name + "_candidate_mount")
        model.clock_outputs(package, 3)
        assembly.import_package(package, name + "_", "relocated_authentic_first_stage", "fixed")
        assembly.missing.append({"id": name + "_stage_support_and_downstream", "reason":
            "Authentic first stage retained and chassis-fixed in kinematics; plate-to-frame bracket, second output bearing, "
            "supported transmission, tension adjustment and guards NOT completed."})
    assembly.drives.append({"name": "pickup_rear_reduction_candidate", "centers_mm": stage_center,
                            "input_yz": [rear[0], rear[1] - stage_center], "output_yz": rear,
                            "teeth": [18, 36], "belt_candidate": "WCP-0619 HTD 5 mm x350 mm, 9 mm wide",
                            "status": "CATALOG_PITCH_LAYOUT_ONLY", "pulley_brep_present": False,
                            "source": "compact-drive-review.md; parent supplied verification", "power_path_complete": False})


def build(config=None):
    assembly = CoaxialSystem()
    assembly.pickup = build_pickup(config)
    kinds = {"custom": "custom_brep", "nominal_hardware": "standard_hardware_nominal_brep", "authentic_vendor": "authentic_vendor_brep"}
    for name, definition in assembly.pickup.definitions.items():
        metadata = {key: value for key, value in definition.items() if key not in ("shape", "category", "material")}
        if metadata.get("source"):
            metadata["source_binding"] = assembly.pickup.sources[metadata["source"]]
        assembly.define("v2_" + name, definition["shape"], definition.get("material", "UNQUALIFIED"),
                        kinds[definition["category"]], "new_coaxial_pickup", **metadata)
    for part in assembly.pickup.instances:
        assembly.add("v2_" + part["id"], "v2_" + part["definition"], part["pose"], part["motion"], part["category"])
    assembly.pickup_ids = [part["id"] for part in assembly.instances]
    assembly.sources.update(assembly.pickup.sources)
    assembly.joints.extend(assembly.pickup.joints)
    legacy.build_retained(assembly)
    lift = cq.Location(cq.Vector(0, 0, assembly.pickup.config["indexer_lift_mm"]))
    for part in assembly.instances:
        if part["id"] in assembly.retained_ids:
            part["pose"] = lift * part["pose"]
            part["retained_rigid_lift_mm"] = assembly.pickup.config["indexer_lift_mm"]
    add_mounts(assembly)
    add_stages(assembly)
    assembly.drives.extend(candidate_belts(assembly.pickup.config))
    assembly.missing.extend([
        {"id": "upper_roller_loops", "reason": "Both catalog length matches lack authenticated pulley axial datums, actual belts, pulley retention and tensioning; no fabricated COTS added."},
        {"id": "kicker_power_and_hub", "reason": "Reversing branch missing; legacy thin router-relieved hub and sleeve torque attachment unqualified."},
        {"id": "deployment_output", "reason": "Independent output flange to moving cheek, reduction, endpoint stops and operational stow/service lock absent; rear powered shaft cannot transmit deployment torque."},
        {"id": "retained_indexer_dock_mount", "reason": "All 181 retained occurrences lifted rigidly; raised subsystem-to-chassis mounting not redesigned. Retained round-cord transmission and dock/sensor shortcomings unchanged."}])
    return assembly


class SolidCache:
    def __init__(self, assembly):
        self.assembly = assembly
        self.definitions = {}
        self.poses = {}
        self.classifier_calls = 0
        for name, definition in assembly.definitions.items():
            self.definitions[name] = {"bounds": module.bounds(definition["shape"]),
                                      "solids": [{"shape": solid, "bounds": module.bounds(solid), "classifier": None}
                                                 for solid in definition["shape"].Solids()]}

    def placed(self, instance, angle, floating):
        key = (instance["id"], angle if instance["motion"] != "fixed" else 0,
               floating if instance["motion"] == "float" else 0)
        if key not in self.poses:
            pose = self.assembly.pose(instance, angle, floating)
            matrix = module.matrix(pose)
            definition = self.definitions[instance["definition"]]
            self.poses[key] = {"bounds": module.transform_bounds(definition["bounds"], matrix),
                               "inverse": module.matrix(pose.inverse),
                               "solids": [(solid, module.transform_bounds(solid["bounds"], matrix)) for solid in definition["solids"]]}
        return self.poses[key]

    def contains(self, solid, point, inverse):
        from OCP.BRepClass3d import BRepClass3d_SolidClassifier
        from OCP.TopAbs import TopAbs_IN
        from OCP.gp import gp_Pnt
        if solid["classifier"] is None:
            solid["classifier"] = BRepClass3d_SolidClassifier(solid["shape"].wrapped)
        local = [sum(row[index] * point[index] for index in range(3)) + row[3] for row in inverse[:3]]
        solid["classifier"].Perform(gp_Pnt(*local), 1e-6)
        self.classifier_calls += 1
        return solid["classifier"].State() == TopAbs_IN

    def pair(self, first, second, budget, deadline):
        if module.separation(first["bounds"], second["bounds"]) > 1e-5:
            return "WHOLE_AABB_SEPARATED", None
        overlapping_solids = False
        fractions = [(0.5, 0.5, 0.5)]
        for axis in range(3):
            for fraction in (0.05, 0.95):
                point = [0.5, 0.5, 0.5]
                point[axis] = fraction
                fractions.append(tuple(point))
        fractions += [(horizontal, vertical, height) for horizontal in (0.2, 0.5, 0.8)
                                       for vertical in (0.2, 0.5, 0.8) for height in (0.2, 0.5, 0.8)]
        started_calls = self.classifier_calls
        for first_solid, first_bounds in first["solids"]:
            for second_solid, second_bounds in second["solids"]:
                if module.separation(first_bounds, second_bounds) > 1e-5:
                    continue
                overlapping_solids = True
                lower = [max(first_bounds[axis], second_bounds[axis]) for axis in range(3)]
                upper = [min(first_bounds[axis + 3], second_bounds[axis + 3]) for axis in range(3)]
                if any(upper[axis] - lower[axis] <= 2e-6 for axis in range(3)):
                    continue
                for fraction in fractions:
                    if self.classifier_calls - started_calls + 2 > budget or time.monotonic() >= deadline:
                        return "UNKNOWN_BUDGET", None
                    point = [lower[axis] + fraction[axis] * (upper[axis] - lower[axis]) for axis in range(3)]
                    if self.contains(first_solid, point, first["inverse"]) and self.contains(second_solid, point, second["inverse"]):
                        return "INTERIOR_WITNESS", point
        return ("UNKNOWN_NO_WITNESS" if overlapping_solids else "SOLID_AABBS_SEPARATED"), None


def check_interfaces(assembly, seconds=75, classifier_budget=16000):
    thread_module = legacy.load_module("coaxial_thread_contacts", ROOT / "thread_contacts.py")
    expected_threads = thread_module.verified_thread_pairs(assembly)
    cache = SolidCache(assembly)
    started = time.monotonic()
    deadline = started + seconds
    counts = Counter()
    cases = []
    structural_roles = {"structure", "hard_shaft", "hard_hub", "retainer", "pivot_support"}
    parts = assembly.instances
    pairs = []
    for first_index, first in enumerate(parts):
        for second in parts[first_index + 1:]:
            moving_fixed = (first["motion"] != "fixed") != (second["motion"] != "fixed")
            pickup_structure = first["id"] in assembly.pickup_ids and second["id"] in assembly.pickup_ids and (
                first["role"] in structural_roles or second["role"] in structural_roles)
            fixed_new_context = first["motion"] == second["motion"] == "fixed" and (
                first["id"].startswith(("coaxial_", "pickup_", "deployment_")) or second["id"].startswith(("coaxial_", "pickup_", "deployment_")))
            if moving_fixed or pickup_structure or fixed_new_context:
                pairs.append((first, second))
    retained = set(assembly.retained_ids)
    pairs.sort(key=lambda pair: (
        not any(part["id"] in retained for part in pair),
        not any(part["id"].startswith("v2_crossmember") for part in pair),
        all(part["role"] not in ("structure", "hard_shaft", "retainer") for part in pair)))
    angles = list(dict.fromkeys([assembly.pickup.config["stow_angle"], 0, *assembly.pickup.config["fold_angles"]]))
    poses = [(angle, floating) for angle in angles for floating in (0, -8)]
    checked = set()
    pose_summary = []
    for angle, floating in poses:
        pose_counts = Counter()
        moving_boxes = [cache.placed(part, angle, floating)["bounds"] for part in parts if part["motion"] != "fixed"]
        for first, second in pairs:
            invariant = first["motion"] == second["motion"] == "fixed" or (
                first["id"] in assembly.pickup_ids and second["id"] in assembly.pickup_ids and
                first["motion"] == second["motion"])
            key = (first["id"], second["id"], None if invariant else angle,
                   None if invariant or "float" not in (first["motion"], second["motion"]) else floating)
            if key in checked:
                continue
            checked.add(key)
            expected_thread = expected_threads.get(frozenset((first["id"], second["id"])))
            if expected_thread is not None:
                counts["EXPECTED_THREAD_ENGAGEMENT"] += 1
                pose_counts["EXPECTED_THREAD_ENGAGEMENT"] += 1
                continue
            first_shape, second_shape = cache.placed(first, angle, floating), cache.placed(second, angle, floating)
            pair_deadline = min(deadline, time.monotonic() + 1.0)
            status, witness = cache.pair(first_shape, second_shape, min(64, max(0, classifier_budget - cache.classifier_calls)), pair_deadline)
            counts[status] += 1
            pose_counts[status] += 1
            if status not in ("WHOLE_AABB_SEPARATED", "SOLID_AABBS_SEPARATED"):
                cases.append({"first": first["id"], "second": second["id"], "angle_deg": angle,
                              "float_deg": floating, "status": status, "interior_witness_mm": witness,
                              "invariant_pair": invariant,
                              "roles": [first["role"], second["role"]],
                              "reference_pair": any(assembly.definitions[part["definition"]]["kind"] == "reference_envelope" for part in (first, second))})
        extent = [min(box[axis] for box in moving_boxes) for axis in range(3)] + [max(box[axis + 3] for box in moving_boxes) for axis in range(3)]
        pose_summary.append({"angle_deg": angle, "float_deg": floating, "new_pair_counts": dict(pose_counts), "moving_conservative_bounds_mm": extent})
        print(json.dumps({"phase": "coaxial_pose", **pose_summary[-1], "classifier_calls": cache.classifier_calls}), flush=True)
    return {"status": "FAIL" if counts["INTERIOR_WITNESS"] else "INCOMPLETE" if cases else "SAMPLED_AABB_CLEAR",
            "scope": "Moving-to-fixed; pickup structural self-pairs; new fixed supports/stages vs context. Retained-to-retained not recertified.",
            "counts": dict(counts), "cases": cases, "poses": pose_summary,
            "expected_thread_engagements": list(expected_threads.values()),
            "classifier_calls": cache.classifier_calls, "classifier_budget": classifier_budget,
            "elapsed_s": time.monotonic() - started, "negative_result_proves_clearance": False,
            "method": "Cached local solid bounds and classifiers; transformed conservative bounds; two strict interior classifications prove intersection. No witness stays UNKNOWN.",
            "continuous_sweep_certified": False, "release_ready": False}


def mesh_pose_extents(assembly, meshes):
    import numpy as np
    local_vertices = {name: np.asarray(mesh["positions"]).reshape(-1, 3) for name, mesh in meshes.items()}
    cache = {}
    results = []
    for angle in list(dict.fromkeys([*assembly.pickup.config["fold_angles"], 125, 20])):
        for floating in (0, -8):
            categories = {"moving": [], "all_physical": []}
            for part in assembly.instances:
                if assembly.definitions[part["definition"]]["kind"] == "reference_envelope":
                    continue
                matrix = np.asarray(module.matrix(assembly.pose(part, angle, floating)))
                key = (part["definition"], tuple(matrix[:3, :3].ravel()))
                if key not in cache:
                    vertices = local_vertices[part["definition"]] @ matrix[:3, :3].T
                    cache[key] = (vertices.min(axis=0), vertices.max(axis=0))
                lower, upper = [extent + matrix[:3, 3] for extent in cache[key]]
                extent = [*lower.tolist(), *upper.tolist()]
                categories["all_physical"].append(extent)
                if part["motion"] != "fixed":
                    categories["moving"].append(extent)
            result = {"angle_deg": angle, "float_deg": floating}
            for category, extents in categories.items():
                result[category + "_bounds_mm"] = [min(extent[axis] for extent in extents) for axis in range(3)] + [max(extent[axis + 3] for extent in extents) for axis in range(3)]
            results.append(result)
    return {"source": "Actual local Brep tessellations transformed by the same full matrices as STEP; not the box-corner screen",
            "tessellation_tolerance_mm": 0.8, "clearance_certificate": False, "samples": results,
            "positive_path_note": "+125 endpoint is not a path approval; +20 diagnostic exposes the kicker floor intrusion.",
            "stow_note": "-165 is an inspection endpoint, not certified stow; -180 archive has proven clashes and is excluded. Rear fixed star remains forward of Y=-85 bumper face."}


def write_json(path, content):
    path.write_text(json.dumps(content, indent=2) + "\n", encoding="utf8")


def protected_hashes():
    allowed = {"coaxial_pickup.py", "test_coaxial_pickup.py", "COAXIAL.md"}
    paths = [path for path in legacy.V1.rglob("*") if path.is_file()]
    paths += [path for path in ROOT.rglob("*") if path.is_file() and
              "coaxial-output" not in path.relative_to(ROOT).parts and path.name not in allowed]
    return {path.relative_to(ROOT.parent).as_posix(): module.sha256(path) for path in sorted(paths)}


def export_geometry(assembly, checks):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    custom = OUTPUT / "custom"
    custom.mkdir(exist_ok=True)
    quantities = Counter(part["definition"] for part in assembly.instances)
    definitions, meshes, roundtrips, bom = {}, {}, [], []
    for name in sorted(quantities):
        definition = assembly.definitions[name]
        shape = definition["shape"]
        data = {key: value for key, value in definition.items() if key != "shape"}
        data.update(bounds_mm=module.bounds(shape), volume_mm3=shape.Volume(), valid=shape.isValid(),
                    solids=len(shape.Solids()), quantity=quantities[name])
        if definition["kind"] == "custom_brep":
            path = custom / (name + ".step")
            cq.exporters.export(shape, str(path))
            imported = cq.importers.importStep(str(path)).val()
            delta = abs(imported.Volume() - data["volume_mm3"])
            passed = imported.isValid() and len(imported.Solids()) == data["solids"] and delta <= max(1e-4, data["volume_mm3"] * 1e-8)
            data.update(custom_step=path.relative_to(OUTPUT).as_posix(), custom_step_sha256=module.sha256(path))
            roundtrips.append({"definition": name, "pass": passed, "volume_delta_mm3": delta})
        vertices, triangles = shape.tessellate(0.8, 0.2)
        meshes[name] = {"positions": [coordinate for vertex in vertices for coordinate in vertex.toTuple()],
                        "indices": [index for triangle in triangles for index in triangle], "geometry_type": "ACTUAL_BREP_TESSELLATION"}
        definitions[name] = data
        if definition["kind"] != "reference_envelope":
            bom.append({"part": name, "quantity": quantities[name], "kind": definition["kind"],
                        "material": definition["material"], "origin": definition["origin"], "status": "NOT_RELEASED",
                        "source": json.dumps(definition.get("source_binding", definition.get("source", "local Brep")))})
    instances = []
    files = []
    selected = assembly.pickup.config["stow_angle"]
    for label, angle in (("deployed", 0), ("stow", selected)):
        cad = cq.Assembly(name="Coaxial_" + label + "_NOT_RELEASED")
        for part in assembly.instances:
            definition = assembly.definitions[part["definition"]]
            if definition["kind"] != "reference_envelope":
                cad.add(definition["shape"], name=part["id"], loc=assembly.pose(part, angle),
                        color=cq.Color(*legacy.appearance(definition, part["role"])))
        path = OUTPUT / ("coaxial-" + label + "-NOT-RELEASED.step")
        cad.save(str(path))
        files.append({"path": path.name, "sha256": module.sha256(path), "angle_deg": angle, "reference_envelopes_excluded": True})
    for part in assembly.instances:
        instances.append({**{key: value for key, value in part.items() if key != "pose"},
                          "matrix": module.matrix(assembly.pose(part)), "stow_matrix": module.matrix(assembly.pose(part, selected)),
                          "reference_only": assembly.definitions[part["definition"]]["kind"] == "reference_envelope",
                          "color_rgba": legacy.appearance(assembly.definitions[part["definition"]], part["role"])})
    source_paths = [ROOT / "coaxial_pickup.py", ROOT / "test_coaxial_pickup.py", ROOT / "pickup.py", ROOT / "system.py", ROOT / "compact_system.py",
                    legacy.V1 / "model.py", legacy.V1 / "geometry.py", legacy.V1 / "drive_completion.py", legacy.V1 / "transmission.py", legacy.V1 / "cots/load_vendor.py", legacy.V1 / "cots/sourcebindings.json"]
    manifest = {"schema": "coaxial-candidate/1", "status": "NOT_RELEASED", "selected_config": assembly.pickup.config,
                "roller_centers_yz": module.centers(assembly.pickup.config), "definitions": definitions, "instances": instances,
                "sources": assembly.sources, "source_code_sha256": {path.relative_to(ROOT.parent).as_posix(): module.sha256(path) for path in source_paths},
                "retained_ids": assembly.retained_ids, "retained_rigid_lift_mm": assembly.pickup.config["indexer_lift_mm"],
                "replacements": assembly.pickup.replacements, "joints": assembly.joints, "drives": assembly.drives,
                "missing_required": assembly.missing, "assembly_files": files,
                "motion": {"type": "SINGLE_COAXIAL_X_REVOLUTE", "coordinates": "X width; +Y into robot; +Z up; mm/degrees",
                           "pivot": [0, *assembly.pickup.config["pivot_yz"]], "float_pivot": [0, *assembly.pickup.config["middle_yz"]],
                           "composition": "Float about deployed middle first, then fold about fixed rear; fixed stays fixed. Rear spin not simulated.",
                           "stow_deg": selected, "float_deg": [-8, 0]},
                "geometry_status": checks["status"], "physical_mount_complete": False,
                "pivot_support_geometry": "Two real bearings in anchored flat plates; four through bolts, crush sleeves and end-retained shaft on assumed chassis rails; fits/loads unqualified.",
                "vendor_fidelity": "Six original hash-verified vendor sources; assembly STEP is an OCCT convenience re-export, not source-fidelity certification.",
                "release_ready": False}
    write_json(OUTPUT / "manifest.json", manifest)
    write_json(OUTPUT / "coaxial-mesh.json", {"definitions": meshes, "instances": instances, "motion": manifest["motion"], "status": "NOT_RELEASED"})
    write_json(OUTPUT / "mesh-pose-extents.json", mesh_pose_extents(assembly, meshes))
    write_json(OUTPUT / "BOM.json", {"parts": bom, "missing_required": assembly.missing})
    with (OUTPUT / "BOM.csv").open("w", newline="", encoding="utf8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(bom[0]))
        writer.writeheader()
        writer.writerows(bom)
    write_json(OUTPUT / "export-checks.json", {"custom_roundtrips": roundtrips, "all_custom_roundtrips_pass": all(row["pass"] for row in roundtrips),
                                               "invalid_definitions": [name for name, entry in definitions.items() if not entry["valid"]],
                                               "assembly_reimport_checked": False, "manufacturing_release": False})
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true")
    parser.add_argument("--seconds", type=float, default=75)
    parser.add_argument("--classifier-budget", type=int, default=16000)
    arguments = parser.parse_args()
    if not 0 <= arguments.seconds <= 100 or not 0 <= arguments.classifier_budget <= 30000:
        parser.error("Bounded check requires seconds 0..100 and classifier budget 0..30000")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name in ("checks.json", "summary.json", "source-freeze.json"):
        previous = OUTPUT / name
        archive = OUTPUT / ("iteration-1-" + name)
        if previous.exists() and not archive.exists():
            write_json(archive, json.loads(previous.read_text(encoding="utf8")))
    before = protected_hashes()
    write_json(OUTPUT / "source-freeze.json", {"before": before, "status": "RUNNING_NOT_VERIFIED"})
    started = time.monotonic()
    assembly = build()
    print(json.dumps({"phase": "built", "instances": len(assembly.instances), "elapsed_s": time.monotonic() - started}), flush=True)
    checks = check_interfaces(assembly, arguments.seconds, arguments.classifier_budget)
    write_json(OUTPUT / "checks.json", checks)
    write_json(OUTPUT / "crossmember-checks.json", crossmember_screen(assembly.pickup.config))
    manifest = export_geometry(assembly, checks) if arguments.export else None
    after = protected_hashes()
    changed = [name for name in set(before) | set(after) if before.get(name) != after.get(name)]
    frozen = json.loads((ROOT / "output/frozen-v1.json").read_text(encoding="utf8"))
    v1_unchanged = frozen == module.frozen_hashes()
    write_json(OUTPUT / "source-freeze.json", {"before": before, "changed": sorted(changed), "pass": not changed and v1_unchanged,
                                              "v1_files": len(frozen), "v1_matches_frozen_baseline": v1_unchanged})
    summary = {"status": "NOT_RELEASED", "geometry_status": checks["status"], "instances": len(assembly.instances),
               "physical_instances": sum(assembly.definitions[part["definition"]]["kind"] != "reference_envelope" for part in assembly.instances),
               "definitions": len(assembly.definitions), "retained_instances": len(assembly.retained_ids),
               "motors": sum(part["role"] == "motor" for part in assembly.instances), "gears": sum(part["role"] == "gear" for part in assembly.instances),
               "authentic_vendor_sources": len({source["sha256"] for source in assembly.sources.values() if isinstance(source, dict) and source.get("pathrepoRelative")}),
               "selected_config": assembly.pickup.config, "check_counts": checks["counts"], "source_freeze_pass": not changed and v1_unchanged,
               "exported": manifest is not None, "physical_mount_complete": False, "release_ready": False,
               "elapsed_s": time.monotonic() - started}
    write_json(OUTPUT / "summary.json", summary)
    write_json(OUTPUT / "artifact-hashes.json", {path.relative_to(OUTPUT).as_posix(): module.sha256(path) for path in sorted(OUTPUT.rglob("*"))
                                                if path.is_file() and path.name != "artifact-hashes.json"})
    print(json.dumps(summary, indent=2), flush=True)
    return 0 if not changed and v1_unchanged else 1


if __name__ == "__main__":
    sys.exit(main())