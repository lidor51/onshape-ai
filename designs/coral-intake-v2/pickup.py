import argparse
from collections import Counter
from functools import lru_cache
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import shutil
import sys


ROOT = Path(__file__).resolve().parent
V1 = ROOT.parent / "coral-intake-v1"
REPO = ROOT.parents[1]
OUTPUT = ROOT / "output"


def offline_guard(event, arguments):
    if event.startswith("socket.") and event != "socket.gethostname":
        raise PermissionError("Local pickup build: network prohibited")
    if event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:
        raise PermissionError("Local pickup build: child processes prohibited")


sys.addaudithook(offline_guard)
import cadquery as cq
from OCP.gp import gp_Trsf


def settings():
    return {"cheek_x": 225.0, "arm_x": 237.0, "plate_thickness": 6.0,
            "bearing_seat": 28.57, "pivot_yz": [110.0, 330.0],
            "middle_yz": [-136.0, 262.0], "front_dy": 125.0,
            "front_distance": 155.0, "rear_dy": 127.0, "rear_distance": 130.0,
            "kick_yz": [-140.0, 34.0], "kick_width": 420.0,
            "crossmembers_yz": [[-330.0, 211.0], [-215.0, 320.0]],
            "shaft_length": 500.0, "star_pitch": 38.1,
            "star_counts": {"front": 11, "middle": 9, "rear": 7},
            "fold_angles": list(range(0, -141, -20)), "float_angles": [0, -8],
            "stow_angle": -140.0, "extension_limit": 457.2,
            "minimum_floor": 5.0, "custom_definition_target": 15}


def centers(config):
    middle_y, middle_z = config["middle_yz"]
    return {"middle": [middle_y, middle_z],
            "front": [middle_y - config["front_dy"], middle_z - math.sqrt(config["front_distance"] ** 2 - config["front_dy"] ** 2)],
            "rear": [middle_y + config["rear_dy"], middle_z + math.sqrt(config["rear_distance"] ** 2 - config["rear_dy"] ** 2)],
            "kick": config["kick_yz"]}


def candidate_belts(config):
    rows = centers(config)
    candidates = []
    for first, second, sku, teeth, plane in (("front", "middle", "WCP-0621", 80, -253),
                                             ("middle", "rear", "WCP-0619", 70, -267)):
        distance = math.dist(rows[first], rows[second])
        candidates.append({"rows": [first, second], "centers_mm": distance,
            "candidate_sku": sku, "candidate_belt_teeth": teeth, "candidate_length_mm": teeth * 5,
            "pulley_candidate_sku": "WCP-0563", "teeth_each": 18, "pitch_mm": 5,
            "belt_width_mm": 9, "profile": "HTD", "pulley_bore": "1/2 inch hex",
            "pitch_radius_mm": 18 * 5 / (2 * math.pi),
            "equal_pulley_pitch_length_mm": 2 * distance + 18 * 5,
            "catalog_center_distance_mm": (teeth * 5 - 18 * 5) / 2,
            "catalog_length_matches_geometry": math.isclose(2 * distance + 18 * 5, teeth * 5, abs_tol=1e-7),
            "plane_x_mm": plane, "axial_envelope_mm": [plane - 6, plane + 6],
            "axial_envelope_basis": "Provisional 12 mm pulley allowance, not downloaded CAD dimensions",
            "middle_pulleys_axially_separate": True,
            "catalog_seen": "2026-09-18", "catalog_evidence": "Official catalog read by parent; supplied facts, no network in this build",
            "belt_source_url": "https://wcproducts.com/products/htd-timing-belts-9mm-width",
            "pulley_source_url": "https://wcproducts.com/products/htd-timing-pulleys",
            "superseded_unlisted_lengths_mm": [440, 380],
            "status": "CATALOG_CANDIDATE_ENVELOPE_ONLY", "selected_product": None,
            "authentic_belt_cad": False, "authentic_pulley_cad": False, "torque_qualified": False,
            "end_washer_axial_conflict": "UNRESOLVED: washer/head reaches X=-257; separated loop planes do not establish washer clearance, shaft engagement or torque transfer"})
    return candidates


def box(size, center=(0, 0, 0)):
    return cq.Solid.makeBox(*size, cq.Vector(*[center[index] - size[index] / 2 for index in range(3)]))


def cylinder(radius, length, center=(0, 0, 0), axis=(0, 0, 1)):
    start = [center[index] - length * axis[index] / 2 for index in range(3)]
    return cq.Solid.makeCylinder(radius, length, cq.Vector(*start), cq.Vector(*axis))


def ring(outer, inner, length):
    return cylinder(outer / 2, length).cut(cylinder(inner / 2, length + 2))


def bounds(shape):
    extent = shape.BoundingBox()
    return [extent.xmin, extent.ymin, extent.zmin, extent.xmax, extent.ymax, extent.zmax]


def location(center=(0, 0, 0), axis=(1, 0, 0)):
    return cq.Location(cq.Plane(origin=center, xDir=(0, 1, 0), normal=axis))


def rotation(center, degrees):
    return cq.Location(cq.Vector(*center)) * cq.Location(cq.Vector(), cq.Vector(1, 0, 0), degrees) * cq.Location(cq.Vector(*[-value for value in center]))


def matrix(pose):
    transform = pose.wrapped.Transformation()
    return [[transform.Value(row, column) for column in range(1, 5)] for row in range(1, 4)] + [[0, 0, 0, 1]]


def from_matrix(values):
    transform = gp_Trsf()
    transform.SetValues(*(value for row in values[:3] for value in row))
    return cq.Location(transform)


def web(points, radius, thickness):
    pieces = [cylinder(radius, thickness, (*point, 0)) for point in points]
    for first, second in zip(points, points[1:]):
        distance = math.dist(first, second)
        normal = [-(second[1] - first[1]) / distance, (second[0] - first[0]) / distance]
        outline = [[point[index] + sign * radius * normal[index] for index in range(2)]
                   for point, sign in ((first, 1), (second, 1), (second, -1), (first, -1))]
        pieces.append(cq.Workplane("XY", origin=(0, 0, -thickness / 2)).polyline(outline).close().extrude(thickness).val())
    return pieces[0].fuse(*pieces[1:]).clean()


def drill(shape, holes, thickness):
    for horizontal, vertical, diameter in holes:
        shape = shape.cut(cylinder(diameter / 2, thickness + 2, (horizontal, vertical, 0)))
    return shape.clean()


def hollow_tube(length):
    return box((20, 20, length)).cut(box((16, 16, length + 2)))


def coral(center, yaw):
    direction = (math.sin(math.radians(yaw)), math.cos(math.radians(yaw)), 0)
    return cylinder(57.15, 301.625, center, direction).cut(cylinder(50.8, 303.625, center, direction))


def finite_cylinder_bounds(center, direction, radius, length):
    support = [abs(component) * length / 2 + radius * math.sqrt(max(0, 1 - component ** 2)) for component in direction]
    return [center[index] - support[index] for index in range(3)] + [center[index] + support[index] for index in range(3)]


def separation(first, second):
    return max(max(first[index] - second[index + 3], second[index] - first[index + 3]) for index in range(3))


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def frozen_hashes():
    return {path.relative_to(V1).as_posix(): sha256(path) for path in sorted(V1.rglob("*")) if path.is_file()}


@lru_cache(maxsize=None)
def vendor(identifier):
    spec = importlib.util.spec_from_file_location("pickup_v1_vendor_readonly", V1 / "cots/load_vendor.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.load_vendor(identifier)


class Pickup:
    def __init__(self, config):
        self.config = config
        self.definitions = {}
        self.instances = []
        self.joints = []
        self.sources = {}
        self.retention = []

    def define(self, name, shape, category="custom", **metadata):
        if name not in self.definitions:
            self.definitions[name] = {"shape": shape, "category": category, **metadata}
        return name

    def add(self, name, definition, pose=None, motion="fold", category="structure"):
        self.instances.append({"id": name, "definition": definition, "pose": pose or cq.Location(), "motion": motion, "category": category})
        return self.instances[-1]

    def posed(self, instance, fold=0, floating=0):
        pose = instance["pose"]
        if instance["motion"] == "float":
            pose = rotation((0, *centers(self.config)["middle"]), floating) * pose
        if instance["motion"] != "fixed":
            pose = rotation((0, *self.config["pivot_yz"]), fold) * pose
        return self.definitions[instance["definition"]]["shape"].moved(pose)


def build_structure(config=None):
    config = config or settings()
    pickup = Pickup(config)
    rows = centers(config)
    thickness = config["plate_thickness"]
    main = web([rows["kick"], rows["middle"], rows["rear"], config["pivot_yz"]], 23, thickness)
    main = main.fuse(web([rows["middle"], config["crossmembers_yz"][1], config["crossmembers_yz"][0]], 23, thickness)).clean()
    holes = [(*rows[key], config["bearing_seat"]) for key in ("kick", "middle", "rear")]
    holes += [(*config["pivot_yz"], config["bearing_seat"])]
    holes += [(*center, 5.5) for center in config["crossmembers_yz"]]
    main = drill(main, holes, thickness)
    pickup.define("main_cheek", main, holes=holes, material="6 mm aluminum plate; grade and bore coupon unqualified")
    arm = drill(web([rows["middle"], rows["front"]], 23, thickness),
                [(*rows[key], config["bearing_seat"]) for key in ("middle", "front")], thickness)
    pickup.define("floating_cheek", arm, material="6 mm aluminum plate; direct coaxial bearing seats")
    tube_length = 2 * config["cheek_x"] - thickness
    pickup.define("crossmember", hollow_tube(tube_length), material="20x20x2 aluminum tube; grade unqualified", length_mm=tube_length)
    for sign in (-1, 1):
        pickup.add("main_cheek_" + str(sign), "main_cheek", location((sign * config["cheek_x"], 0, 0)))
        pickup.add("floating_cheek_" + str(sign), "floating_cheek", location((sign * config["arm_x"], 0, 0)), "float")
    for index, center in enumerate(config["crossmembers_yz"]):
        pickup.add("crossmember_" + str(index), "crossmember", location((0, *center)))
    return pickup


def brace_check(pickup):
    piece = coral((0, -365, 57.15), 90)
    old_tube = hollow_tube(574).moved(location((0, -310, 44)))
    old_collision = piece.intersect(old_tube).Volume()
    samples = []
    for yaw in (0, 30, 60, 90):
        direction = (math.sin(math.radians(yaw)), math.cos(math.radians(yaw)), 0)
        for offset in (-60, 0, 60):
            swept = finite_cylinder_bounds((offset, -320, 57.15), direction, 57.15, 301.625)
            swept[1] -= 130
            swept[4] += 130
            for instance in pickup.instances:
                if instance["category"] != "structure":
                    continue
                extent = bounds(pickup.posed(instance))
                gap = separation(swept, extent)
                samples.append({"yaw": yaw, "x_offset": offset, "part": instance["id"],
                                "conservative_separation_mm": gap,
                                "status": "CERTIFIED_SEPARATED" if gap > 1e-6 else "UNCERTAIN"})
    return {"status": "PASS" if old_collision > 8000 and all(sample["status"] == "CERTIFIED_SEPARATED" for sample in samples) else "FAIL",
            "old_tube_collision_mm3": old_collision, "old_witness": {"center": [0, -365, 57.15], "yaw": 90},
            "minimum_certified_structure_gap_mm": min(sample["conservative_separation_mm"] for sample in samples),
            "scope": "Horizontal full finite coral, continuous Y=-450..-190; unpowered cheeks and overhead tubes only. Not all-angle capture or powered traversal.",
            "samples": samples}


def hex_prism(across_flats, length):
    radius = across_flats / math.sqrt(3)
    points = [(radius * math.cos(math.radians(60 * index)), radius * math.sin(math.radians(60 * index))) for index in range(6)]
    return cq.Workplane("XY", origin=(0, 0, -length / 2)).polyline(points).close().extrude(length).val()


def router_hex_bore(across_flats, length, cutter_diameter=3):
    bore = hex_prism(across_flats, length)
    radius = across_flats / math.sqrt(3)
    for corner in range(6):
        angle = math.radians(corner * 60)
        bore = bore.fuse(cylinder(cutter_diameter / 2, length,
                                 (radius * math.cos(angle), radius * math.sin(angle), 0)))
    return bore.clean()


def tapped_shaft(length):
    shape = hex_prism(12.7, length)
    for sign in (-1, 1):
        shape = shape.cut(cylinder(2.1, 14, (0, 0, sign * (length / 2 - 7))))
    return shape


def oriented_pose(center, sign=1, angle=0):
    return rotation(center, angle) * location(center, (sign, 0, 0))


def define_hardware(pickup):
    for length in (8, 12, 16, 20):
        screw = cylinder(2.5, length, (0, 0, -length / 2)).fuse(cylinder(4.25, 5, (0, 0, 2.5)))
        screw = screw.cut(hex_prism(4, 3).translate((0, 0, 4)))
        pickup.define("M5x" + str(length), screw, "nominal_hardware", material="steel; grade provisional",
                      specification="M5 socket screw, thread represented by major diameter; product not selected", length_mm=length)
    pickup.define("M5_washer", ring(10, 5.5, 1), "nominal_hardware", specification="M5 flat washer, 1 mm nominal")
    pickup.define("M5_end_washer", ring(20, 5.5, 2), "nominal_hardware", specification="M5 large washer, OD20 x2 nominal")
    nut = hex_prism(8, 5).fuse(cylinder(5.5, 1, (0, 0, 2)))
    pickup.define("M5_flanged_nut", nut.cut(cylinder(2.1, 7)), "nominal_hardware",
                  specification="M5 flanged nut, 5 mm nominal height; locking method unqualified")
    shoulder = cylinder(3, 12.5, (0, 0, -6.25)).fuse(cylinder(2.5, 10, (0, 0, -17.5)), cylinder(5, 4, (0, 0, 2)))
    pickup.define("float_stop_shoulder_screw", shoulder, "nominal_hardware",
                  specification="OD6 x12.5 shoulder, M5 x10 threaded end; dimensional proposal, no selected product")


def hardware(pickup, name, center, axis, length, motion="fold", nut_face=None):
    pose = location(center, axis)
    pickup.add(name + "_screw", "M5x" + str(length), pose, motion, "fastener")
    pickup.add(name + "_washer", "M5_washer", pose * cq.Location(cq.Vector(0, 0, -0.5)), motion, "fastener")
    if nut_face is not None:
        pickup.add(name + "_nut", "M5_flanged_nut", location(nut_face, axis) * cq.Location(cq.Vector(0, 0, -2.5)), motion, "fastener")


def spacer(pickup, name, lower, upper, center, motion="fold"):
    length = upper - lower
    if length <= 1e-6:
        raise ValueError("Nonpositive spacer length")
    key = "spacer_" + format(length, ".4f").replace(".", "p")
    pickup.define(key, ring(19, 15, length), material="OD19 ID15 aluminum round tube; stock/grade unverified",
                  process="cut_stock", length_mm=length)
    pickup.add(name, key, location(((lower + upper) / 2, *center)), motion, "spacer")
    pickup.retention.append({"id": name, "definition": key, "x_interval_mm": [lower, upper],
                             "purpose": "Axial stack; ID15 clears 14.6647 mm hex corners", "length_mm": length})


def bearing_layout(config):
    rows = centers(config)
    arm_angle = math.degrees(math.atan2(rows["front"][1] - rows["middle"][1], rows["front"][0] - rows["middle"][0]))
    result = []
    for key in ("kick", "middle", "rear", "pivot"):
        result.append({"key": key, "center": config["pivot_yz"] if key == "pivot" else rows[key],
                       "plate": "main_cheek", "x": config["cheek_x"], "motion": "fold",
                       "angle": arm_angle + 90 if key == "middle" else 0})
    for key in ("front", "middle"):
        result.append({"key": "arm_" + key, "center": rows[key], "plate": "floating_cheek", "x": config["arm_x"],
                       "motion": "float", "angle": arm_angle})
    return result


def retain_bearings(pickup):
    config = pickup.config
    bearing, binding = vendor("hex_bearing")
    pickup.sources["hex_bearing"] = binding
    pickup.define("WCP_0783", bearing, "authentic_vendor", source_solid_indices=[0], source="hex_bearing")
    keeper = ring(38, 24, 2).fuse(web([(-38, 0), (38, 0)], 6, 2)).clean()
    keeper = drill(keeper, [(0, 0, 24), (-38, 0, 5.5), (38, 0, 5.5)], 2)
    pickup.define("bearing_keeper", keeper, material="2 mm aluminum flat plate; strength unqualified", process="profile_plate")
    for layout in bearing_layout(config):
        plate = pickup.definitions[layout["plate"]]["shape"]
        angle = math.radians(layout["angle"])
        bolt_points = [[layout["center"][coordinate] + sign * 38 * (math.cos(angle), math.sin(angle))[coordinate]
                        for coordinate in range(2)] for sign in (-1, 1)]
        ears = web([bolt_points[0], layout["center"], bolt_points[1]], 9, config["plate_thickness"])
        plate = plate.fuse(ears).clean()
        plate = drill(plate, [(*layout["center"], config["bearing_seat"])] + [(*point, 5.5) for point in bolt_points], config["plate_thickness"])
        pickup.definitions[layout["plate"]]["shape"] = plate
        for side in (-1, 1):
            prefix = "bearing_" + layout["key"] + "_" + str(side)
            face = side * (layout["x"] + config["plate_thickness"] / 2)
            bearing_motion = "fixed" if layout["key"] == "pivot" else "fold" if layout["key"] == "arm_middle" else layout["motion"]
            pickup.add(prefix, "WCP_0783", location((face, *layout["center"]), (side, 0, 0)), bearing_motion, "bearing")
            keeper_center = (face + side * 2.6375, *layout["center"])
            pickup.add(prefix + "_keeper", "bearing_keeper", oriented_pose(keeper_center, side, layout["angle"]), layout["motion"], "retainer")
            for index, point in enumerate(bolt_points):
                head_face = (face + side * 4.6375, *point)
                nut_face = (side * (layout["x"] - config["plate_thickness"] / 2), *point)
                name = prefix + "_bolt_" + str(index)
                hardware(pickup, name, head_face, (side, 0, 0), 16, layout["motion"], nut_face)
                pickup.joints.append({"id": name, "type": "through_fastener", "plate": layout["plate"],
                                      "axis": [side, 0, 0], "hole_world_center": [side * layout["x"], *point],
                                      "hole_diameter_mm": 5.5, "bolt_diameter_mm": 5,
                                      "grip_mm": 10.6375, "nut_height_mm": 5, "length_mm": 16,
                                      "thread_protrusion_mm": 0.3625,
                                      "nut_tool_radius_mm": 7, "tool_access": "whole cheek removable; approach envelope checked separately",
                                      "motion": layout["motion"]})


def crossmember_joints(pickup):
    config = pickup.config
    inner_face = config["cheek_x"] - config["plate_thickness"] / 2
    plug = box((15.8, 15.8, 16)).cut(cylinder(2.1, 18))
    plug = plug.cut(cylinder(2.1, 5, (0, 5.5, 0), (0, 1, 0)))
    pickup.define("tube_end_plug", plug, material="aluminum, grade unqualified", process="mill_and_tap",
                  taps=[{"axis": "axial", "thread": "M5", "engagement_mm": 13},
                        {"axis": "radial_top", "thread": "M5", "engagement_mm": 4.9}],
                  note="One common plug definition, four occurrences; top screw prevents axial plug extraction; no welding")
    tube = pickup.definitions["crossmember"]["shape"]
    for side in (-1, 1):
        tube = tube.cut(cylinder(2.75, 4, (0, 9, side * (inner_face - 8)), (0, 1, 0)))
    pickup.definitions["crossmember"]["shape"] = tube
    for index, center in enumerate(config["crossmembers_yz"]):
        for side in (-1, 1):
            prefix = "tube_joint_" + str(index) + "_" + str(side)
            plug_center = (side * (inner_face - 8), *center)
            pickup.add(prefix + "_plug", "tube_end_plug", location(plug_center), category="structure")
            hardware(pickup, prefix + "_axial", (side * (config["cheek_x"] + 4), *center), (side, 0, 0), 20)
            top_center = (plug_center[0], center[0], center[1] + 11)
            top_pose = cq.Location(cq.Vector(*top_center))
            pickup.add(prefix + "_top_screw", "M5x8", top_pose, category="fastener")
            pickup.add(prefix + "_top_washer", "M5_washer", top_pose * cq.Location(cq.Vector(0, 0, -0.5)), category="fastener")
            pickup.joints.extend([
                {"id": prefix + "_axial", "type": "tapped_joint", "axis": [side, 0, 0],
                 "hole_world_center": [side * config["cheek_x"], *center], "hole_diameter_mm": 5.5,
                 "length_mm": 20, "thread_engagement_mm": 13, "drill_mm": 4.2, "motion": "fold"},
                {"id": prefix + "_top", "type": "tube_wall_pin", "axis": [0, 0, 1],
                 "hole_world_center": [plug_center[0], center[0], center[1] + 9],
                 "length_mm": 8, "hole_diameter_mm": 5.5, "thread_engagement_mm": 4.9,
                 "tap_bottom_clearance_mm": 0.1, "strength_qualified": False, "motion": "fold"}])


def float_stops(pickup):
    config = pickup.config
    rows = centers(config)
    angle = math.atan2(rows["front"][1] - rows["middle"][1], rows["front"][0] - rows["middle"][0])
    path = [[rows["middle"][0] + 85 * math.cos(angle + math.radians(offset)),
             rows["middle"][1] + 85 * math.sin(angle + math.radians(offset))] for offset in range(-4, 5)]
    pin = path[0]
    slot = web(path, 3.2, config["plate_thickness"] + 2)
    pickup.definitions["floating_cheek"]["shape"] = pickup.definitions["floating_cheek"]["shape"].cut(slot).clean()
    main = pickup.definitions["main_cheek"]["shape"].fuse(web([rows["middle"], pin], 10, config["plate_thickness"])).clean()
    ports = [[rows["middle"][coordinate] + side * 38 * (math.cos(angle), math.sin(angle))[coordinate]
              for coordinate in range(2)] for side in (-1, 1)]
    main = main.fuse(*[cylinder(14, config["plate_thickness"], (*point, 0)) for point in ports]).clean()
    pickup.definitions["main_cheek"]["shape"] = drill(main, [(*pin, 5.5), (*rows["middle"], config["bearing_seat"])] + [(*point, 16) for point in ports], config["plate_thickness"])
    pickup.definitions["main_cheek"]["service_ports"] = {"centers_yz": ports, "diameter_mm": 16,
        "boss_od_mm": 28, "minimum_radial_land_mm": 6, "service_float_deg": 0, "strength_qualified": False}
    for side in (-1, 1):
        center = (side * (config["cheek_x"] + 15.5), *pin)
        pickup.add("float_stop_" + str(side), "float_stop_shoulder_screw", location(center, (side, 0, 0)), category="fastener")
        pickup.add("float_stop_nut_" + str(side), "M5_flanged_nut",
                   location((side * (config["cheek_x"] - 5.5), *pin), (side, 0, 0)), category="fastener")
    pickup.joints.append({"id": "float_stops", "type": "shoulder_pin_in_arc_slot", "radius_mm": 85,
                          "slot_width_mm": 6.4, "pin_od_mm": 6, "nominal_angles": [-8, 0],
                          "end_clearance_mm": 0.2, "mechanical_limit_qualified": False,
                          "note": "One-degree chordal slot construction; load, tolerance and stop impact unqualified"})


def add_rotors(pickup):
    config = pickup.config
    rows = centers(config)
    original, star_binding = vendor("intake_star")
    pickup.sources["intake_star"] = star_binding
    manifest = json.loads((V1 / "checkpoint/manifest.json").read_text(encoding="utf8"))
    mapping = []
    roles = {0: "hard_hub", 1: "hard_marking_unqualified", 2: "outer_elastomer"}
    for index, solid in enumerate(original.Solids()):
        prior = manifest["definitions"]["vendor_intake_star_solid_" + str(index)]
        if not math.isclose(solid.Volume(), prior["volume_mm3"], abs_tol=1e-5, rel_tol=1e-9):
            raise ValueError("Star body no longer matches frozen v1 mapping")
        key = "am5123_body_" + str(index)
        pickup.define(key, solid, "authentic_vendor", source="intake_star", source_solid_indices=[index],
                      material=prior["material"], role=roles[index])
        mapping.append({"source_body_index": index, "definition": key, "role": roles[index],
                        "volume_mm3": solid.Volume(), "bounds_mm": bounds(solid),
                        "v1_mapping": "vendor_intake_star_solid_" + str(index)})
    pickup.sources["star_body_mapping"] = mapping
    pickup.define("roller_hex_shaft", tapped_shaft(config["shaft_length"]), material="12.7 AF aluminum hex; grade unqualified",
                  process="cut_and_end_tap", length_mm=config["shaft_length"], end_taps="M5, 14 mm drill depth")
    hub_width = star_binding["datums"]["overallWidthMm"]
    bearing_data = pickup.sources["hex_bearing"]["datums"]
    for row, count in config["star_counts"].items():
        motion = "float" if row == "front" else "fold"
        pickup.add("shaft_" + row, "roller_hex_shaft", location((0, *rows[row])), motion, "hard_shaft")
        positions = [(index - (count - 1) / 2) * config["star_pitch"] for index in range(count)]
        for index, horizontal in enumerate(positions):
            for part in mapping:
                pickup.add("star_" + row + "_" + str(index) + "_body_" + str(part["source_body_index"]),
                           part["definition"], location((horizontal, *rows[row])), motion, part["role"])
        for index, (left, right) in enumerate(zip(positions, positions[1:])):
            spacer(pickup, row + "_between_" + str(index), left + hub_width / 2, right - hub_width / 2, rows[row], motion)
        seat = (config["arm_x"] if row == "front" else config["cheek_x"]) + config["plate_thickness"] / 2
        inner = seat - bearing_data["journal_depth_to_seat_mm"]
        for side in (-1, 1):
            endpoints = sorted([side * (positions[-1] + hub_width / 2), side * inner])
            spacer(pickup, row + "_end_" + str(side), *endpoints, rows[row], motion)
            if row == "middle":
                endpoints = sorted([side * (seat + bearing_data["flange_thickness_mm"]),
                                    side * (config["arm_x"] + 3 - bearing_data["journal_depth_to_seat_mm"])])
                spacer(pickup, row + "_coaxial_" + str(side), *endpoints, rows[row], motion)
            outer_seat = config["arm_x"] + 3 if row in ("middle", "front") else seat
            endpoints = sorted([side * (outer_seat + bearing_data["flange_thickness_mm"]), side * config["shaft_length"] / 2])
            spacer(pickup, row + "_outer_" + str(side), *endpoints, rows[row], motion)
    kick_half = config["kick_width"] / 2
    pickup.define("kick_core", ring(24, 20, config["kick_width"]), material="aluminum OD24 ID20 tube; grade unverified", process="cut_stock")
    pickup.define("kick_rubber", ring(51, 24, config["kick_width"]), material="custom rubber sleeve; material, bond and durometer UNVERIFIED", process="cut_stock")
    pickup.add("shaft_kick", "roller_hex_shaft", location((0, *rows["kick"])), category="hard_shaft")
    pickup.add("kick_core", "kick_core", location((0, *rows["kick"])), category="hard_hub")
    pickup.add("kick_rubber", "kick_rubber", location((0, *rows["kick"])), category="outer_elastomer")
    hub_extension = config["cheek_x"] + 3 - bearing_data["journal_depth_to_seat_mm"] - kick_half
    hub = cylinder(10, 16, (0, 0, -8)).fuse(cylinder(11.75, 2, (0, 0, 1)), cylinder(9.5, hub_extension - 2, (0, 0, (hub_extension + 2) / 2)))
    hub = hub.cut(router_hex_bore(12.8, 2 * (16 + hub_extension)))
    pickup.define("kick_end_hub", hub, material="aluminum; hex fit and torque connection unqualified", process="turn_and_router_hex",
                  cutter_diameter_mm=3, hex_af_mm=12.8,
                  minimum_nominal_wall_mm=9.5 - 12.8 / math.sqrt(3) - 1.5,
                  note="Six router corner reliefs; no broach required. Turn in a supported fixture; thin remaining wall and torque/bond connection require qualification")
    for side in (-1, 1):
        pickup.add("kick_hub_" + str(side), "kick_end_hub", location((side * kick_half, *rows["kick"]), (side, 0, 0)), category="hard_hub")
        endpoints = sorted([side * (config["cheek_x"] + 4.5875), side * config["shaft_length"] / 2])
        spacer(pickup, "kick_outer_" + str(side), *endpoints, rows["kick"])
    for row in rows:
        motion = "float" if row == "front" else "fold"
        for side in (-1, 1):
            pose = location((side * (config["shaft_length"] / 2 + 1), *rows[row]), (side, 0, 0))
            pickup.add(row + "_end_washer_" + str(side), "M5_end_washer", pose, motion, "fastener")
            pickup.add(row + "_end_screw_" + str(side), "M5x12", pose * cq.Location(cq.Vector(0, 0, 1)), motion, "fastener")
    stub_length = 36.0
    stub = tapped_shaft(stub_length).fuse(cylinder(10, 7.65, (0, 0, -stub_length / 2 + 7.65 / 2)))
    stub = stub.cut(cylinder(2.1, 14, (0, 0, -stub_length / 2 + 7)))
    pickup.define("pivot_stub", stub, material="aluminum, grade unqualified", process="turn_hex_and_tap",
                  note="Two split fixed stubs, no shaft across piece corridor; chassis bracket connection is reference-only")
    for side in (-1, 1):
        pose = location((side * 232, *config["pivot_yz"]), (side, 0, 0))
        pickup.add("pivot_stub_" + str(side), "pivot_stub", pose, "fixed", "pivot_support")
        endpoints = sorted([side * (config["cheek_x"] + 4.5875), side * 250])
        spacer(pickup, "pivot_outer_" + str(side), *endpoints, config["pivot_yz"], "fixed")
        pickup.add("pivot_end_washer_" + str(side), "M5_end_washer", location((side * 251, *config["pivot_yz"]), (side, 0, 0)), "fixed", "fastener")
        pickup.add("pivot_end_screw_" + str(side), "M5x12", location((side * 252, *config["pivot_yz"]), (side, 0, 0)), "fixed", "fastener")


def build(config=None):
    pickup = build_structure(config)
    define_hardware(pickup)
    retain_bearings(pickup)
    crossmember_joints(pickup)
    float_stops(pickup)
    add_rotors(pickup)
    return pickup


def local_checks(pickup):
    custom = []
    for name, entry in pickup.definitions.items():
        if entry["category"] != "custom":
            continue
        shape = entry["shape"]
        custom.append({"definition": name, "valid": shape.isValid(), "solids": len(shape.Solids()),
                       "closed": all(shell.wrapped.Closed() for shell in shape.Shells()), "volume_mm3": shape.Volume()})
    fits = []
    for instance in pickup.instances:
        if instance["category"] != "bearing":
            continue
        layout = next(item for item in bearing_layout(pickup.config) if instance["id"].startswith("bearing_" + item["key"] + "_"))
        side = -1 if instance["id"].endswith("_-1") else 1
        plate = next(item for item in pickup.instances if item["id"] == layout["plate"] + "_" + str(side))
        overlap = pickup.posed(instance).intersect(pickup.posed(plate)).Volume()
        fits.append({"bearing": instance["id"], "cheek": plate["id"], "overlap_mm3": overlap,
                     "diametral_clearance_mm": pickup.config["bearing_seat"] - pickup.sources["hex_bearing"]["datums"]["body_od_mm"],
                     "status": "PASS" if overlap < 1e-5 else "FAIL", "manufacturing_fit": "UNQUALIFIED; finish-bore coupon required"})
    floating_fits = []
    for side in (-1, 1):
        plate = next(item for item in pickup.instances if item["id"] == "floating_cheek_" + str(side))
        for row in ("middle", "front"):
            bearing = next(item for item in pickup.instances if item["id"] == "bearing_arm_" + row + "_" + str(side))
            overlap = pickup.posed(bearing, 0, -8).intersect(pickup.posed(plate, 0, -8)).Volume()
            floating_fits.append({"bearing": bearing["id"], "float_deg": -8, "overlap_mm3": overlap,
                                  "status": "PASS" if overlap < 1e-5 else "FAIL"})
    return {"status": "PASS" if all(item["valid"] and item["closed"] and item["solids"] == 1 and item["volume_mm3"] > 0 for item in custom)
            and all(item["status"] == "PASS" for item in fits + floating_fits) else "FAIL", "custom": custom, "bearing_fits": fits,
            "floating_bearing_fits": floating_fits,
            "bearing_kinematics": "Unmodified source bearing bores follow shaft frames: middle-arm bearings fold but do not float; pivot bearings stay fixed on stubs. Circular outer race seats permit independent cheek rotation; loaded bearing function unqualified."}


def transform_bounds(extent, values):
    corners = [[extent[horizontal], extent[vertical], extent[height]]
               for horizontal in (0, 3) for vertical in (1, 4) for height in (2, 5)]
    moved = [[sum(row[index] * point[index] for index in range(3)) + row[3] for row in values[:3]] for point in corners]
    return [min(point[index] for point in moved) for index in range(3)] + [max(point[index] for point in moved) for index in range(3)]


def instance_pose(pickup, instance, fold=0, floating=0):
    pose = instance["pose"]
    if instance["motion"] == "float":
        pose = rotation((0, *centers(pickup.config)["middle"]), floating) * pose
    if instance["motion"] != "fixed":
        pose = rotation((0, *pickup.config["pivot_yz"]), fold) * pose
    return pose


def reference_data():
    manifest = json.loads((V1 / "checkpoint/manifest.json").read_text(encoding="utf8"))
    references = []
    for instance in manifest["instances"]:
        if instance["module"] != "indexer":
            continue
        definition = manifest["definitions"][instance["definition"]]
        references.append({"id": "v1/" + instance["id"], "definition": instance["definition"],
                           "matrix": instance["matrix"], "category": "reference_indexer",
                           "bounds_mm": transform_bounds(definition["bounds_mm"], instance["matrix"]),
                           "source_instance": instance})
    config = manifest["settings"]
    bumper = config["bumper"]
    environment = {"bumper": [bumper[axis][0] for axis in "xyz"] + [bumper[axis][1] for axis in "xyz"],
                   "frame_front": [-350, 0, 25, 350, 25, 65],
                   "frame_left": [-350, 25, 25, -325, 735, 65],
                   "frame_right": [325, 25, 25, 350, 735, 65],
                   "frame_rear": [-350, 735, 25, 350, 760, 65],
                   "pivot_bracket_left": [-220, 82, 302, -206, 138, 358],
                   "pivot_bracket_right": [206, 82, 302, 220, 138, 358]}
    for name, extent in environment.items():
        references.append({"id": name, "bounds_mm": extent, "category": "reference_bracket" if name.startswith("pivot_bracket") else "reference_environment",
                           "geometry": "envelope_only" if name.startswith("pivot_bracket") else "box",
                           "source": "v1 bumper/front rail; assumed full perimeter rail envelopes" if name.startswith("frame") else "reference bounds only"})
    return manifest, references


@lru_cache(maxsize=None)
def reference_nominal_package():
    spec = importlib.util.spec_from_file_location("pickup_v1_nominal_readonly", V1 / "model.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.Package({})


@lru_cache(maxsize=None)
def reference_shape(definition_name):
    manifest = json.loads((V1 / "checkpoint/manifest.json").read_text(encoding="utf8"))
    entry = manifest["definitions"][definition_name]
    if entry.get("step"):
        path = (V1 / "checkpoint" / entry["step"]).resolve()
        if not path.is_relative_to(V1 / "checkpoint") or sha256(path) != entry["step_sha256"]:
            raise ValueError("Frozen custom reference STEP hash mismatch")
        return cq.importers.importStep(str(path)).val()
    source = entry.get("source")
    if source:
        original, binding = vendor(source["product_id"])
        if binding["sha256"] != source["sha256"]:
            raise ValueError("Reference vendor hash mismatch")
        indices = source.get("source_solid_indices")
        return cq.Compound.makeCompound([original.Solids()[index] for index in indices]) if indices else original
    if definition_name == "hardware_10-32_UNFx9.525":
        package = reference_nominal_package()
        package.bolt("reference_definition_probe", (0, 0, 0), (0, 0, 1), length=9.525, nominal=4.826)
        shape = package.definitions[definition_name]["shape"]
        if (len(shape.Solids()) != entry["solids"] or not shape.isValid()
                or not math.isclose(shape.Volume(), entry["volume_mm3"], abs_tol=1e-6)
                or any(not math.isclose(actual, expected, abs_tol=1e-6) for actual, expected in zip(bounds(shape), entry["bounds_mm"]))):
            raise ValueError("Frozen nominal hardware differs from checkpoint definition")
        return shape
    return None


def overlap_box_volume(first, second):
    return math.prod(max(0, min(first[index + 3], second[index + 3]) - max(first[index], second[index])) for index in range(3))


def pose_checks(pickup, resolver=None):
    manifest, references = reference_data()
    orientation_bounds = {}
    poses = []
    candidates = []
    pair_count = 0
    for fold in pickup.config["fold_angles"]:
        for floating in pickup.config["float_angles"]:
            extents = []
            separated = 0
            pose_index = len(poses)
            for instance in pickup.instances:
                values = matrix(instance_pose(pickup, instance, fold, floating))
                orientation = tuple(round(value, 12) for row in values[:3] for value in row[:3])
                key = (instance["definition"], orientation)
                if key not in orientation_bounds:
                    rotation_values = [[*values[index][:3], 0] for index in range(3)] + [[0, 0, 0, 1]]
                    oriented = pickup.definitions[instance["definition"]]["shape"].moved(from_matrix(rotation_values))
                    orientation_bounds[key] = bounds(oriented)
                local_extent = orientation_bounds[key]
                extent = [local_extent[index] + values[index % 3][3] for index in range(6)]
                extents.append(extent)
                for reference in references:
                    pair_count += 1
                    gap = separation(extent, reference["bounds_mm"])
                    if gap > 1e-6:
                        separated += 1
                        continue
                    volume = overlap_box_volume(extent, reference["bounds_mm"])
                    if volume <= 1e-7:
                        status = "UNCERTAIN_TOUCHING_BOUNDS"
                    else:
                        status = "UNCERTAIN"
                    candidates.append({"pose_index": pose_index, "fold_deg": fold, "float_deg": floating,
                                       "part": instance["id"], "reference": reference["id"], "status": status,
                                       "aabb_overlap_mm3": volume, "aabb_gap_mm": gap,
                                       "intended_attachment": reference["category"] == "reference_bracket" and instance["id"].startswith("pivot_")})
            union = [min(extent[index] for extent in extents) for index in range(3)] + [max(extent[index + 3] for extent in extents) for index in range(3)]
            margins = {"floor_mm": union[2] - pickup.config["minimum_floor"],
                       "extension_mm": pickup.config["extension_limit"] + union[1],
                       "left_width_mm": union[0] + 350, "right_width_mm": 350 - union[3]}
            if fold == pickup.config["stow_angle"]:
                margins.update({"stow_front_mm": union[1], "stow_rear_mm": 760 - union[4], "stow_height_mm": 1066.8 - union[5]})
            poses.append({"fold_deg": fold, "float_deg": floating, "bounds_mm": union, "margins": margins,
                          "envelope_status": "PASS" if min(margins.values()) >= 0 else "FAIL",
                          "certified_separated_pairs": separated})
    instances = {entry["id"]: entry for entry in pickup.instances}
    ref_lookup = {entry["id"]: entry for entry in references}
    tested = 0
    selected_keys = set()
    ranked = sorted(candidates, key=lambda item: (item["reference"].startswith("v1/"), item["aabb_overlap_mm3"]), reverse=True)
    for candidate in ranked:
        if tested >= 20:
            break
        reference = ref_lookup[candidate["reference"]]
        if reference.get("geometry") == "envelope_only":
            continue
        key = (instances[candidate["part"]]["definition"],
               tuple(value for row in matrix(instance_pose(pickup, instances[candidate["part"]], candidate["fold_deg"], candidate["float_deg"])) for value in row),
               candidate["reference"])
        if key in selected_keys:
            continue
        if resolver is not None:
            selected_keys.add(key)
            tested += 1
            candidate.update(resolver.check(candidate))
            continue
        if reference.get("geometry") == "box":
            extent = reference["bounds_mm"]
            obstacle = box([extent[index + 3] - extent[index] for index in range(3)], [(extent[index] + extent[index + 3]) / 2 for index in range(3)])
        else:
            obstacle = reference_shape(reference["definition"])
            if obstacle is None:
                continue
            obstacle = obstacle.moved(from_matrix(reference["matrix"]))
        selected_keys.add(key)
        tested += 1
        try:
            volume = pickup.posed(instances[candidate["part"]], candidate["fold_deg"], candidate["float_deg"]).intersect(obstacle).Volume()
            candidate["exact_overlap_mm3"] = volume
            candidate["status"] = "FAIL_EXACT_COLLISION" if volume > 1e-4 else "EXACT_CLEAR_AT_SAMPLE"
        except Exception as error:
            candidate["status"] = "UNCERTAIN_BOOLEAN_ERROR"
            candidate["error"] = type(error).__name__ + ": " + str(error)
    for index, pose in enumerate(poses):
        pose_pairs = [item for item in candidates if item["pose_index"] == index]
        pose["pair_outcomes"] = dict(Counter(item["status"] for item in pose_pairs))
        pose["collision_status"] = "FAIL" if any(item["status"] == "FAIL_EXACT_COLLISION" for item in pose_pairs) else "UNCERTAIN" if any(item["status"].startswith("UNCERTAIN") for item in pose_pairs) else "CLEAR_AT_SAMPLE"
    return {"status": "FAIL" if any(pose["envelope_status"] == "FAIL" or pose["collision_status"] == "FAIL" for pose in poses)
            else "UNCERTAIN" if any(pose["collision_status"] == "UNCERTAIN" for pose in poses) else "CLEAR_AT_SAMPLES_ONLY",
            "scope": "All new pickup hardware; orientation-specific actual BRep bounds translated by rigid fold/float transforms, fixed frozen indexer manifest bounds. AABB separation certifies only the sampled poses, not the intervals.",
            "continuous_motion": "NOT_CERTIFIED; no interval motion bound between the 20-degree fold samples",
            "reference_indexer_instances": sum(item["category"] == "reference_indexer" for item in references),
            "reference_manifest_sha256": sha256(V1 / "checkpoint/manifest.json"),
            "pair_tests": pair_count, "certified_separated_pairs": sum(pose["certified_separated_pairs"] for pose in poses),
            "exact_test_limit": 20, "exact_tests": tested,
            "minimum_margins_mm": {key: min(pose["margins"][key] for pose in poses if key in pose["margins"])
                                   for key in {key for pose in poses for key in pose["margins"]}},
            "poses": poses, "overlapping_pairs": candidates}


def contact_witness(pickup):
    front = next(entry for entry in pickup.instances if entry["id"] == "star_front_5_body_2")
    star = pickup.posed(front)
    samples = []
    for horizontal in range(-335, -289, 5):
        shape = coral((0, horizontal, 57.15), 90)
        volume = shape.intersect(star).Volume()
        samples.append({"center_y_mm": horizontal, "overlap_mm3": volume,
                        "minimum_distance_mm": 0.0 if volume > 1e-4 else shape.distance(star)})
        if volume > 1e-4:
            return {"status": "CONTACT_WITNESS", "center": [0, horizontal, 57.15], "yaw": 90,
                    "part": front["id"], "samples": samples,
                    "scope": "Single unloaded source-star phase; first positive 5 mm sample, not exact first contact, compression, traction, or all-angle capture proof"}
    return {"status": "NO_WITNESS", "samples": samples,
            "minimum_sample_distance_mm": min(sample["minimum_distance_mm"] for sample in samples),
            "scope": "Crosswise central star at source phase only, Y=-335..-290; larger Y and rotating star phase unvalidated, no capture claim"}


def attachment_checks(pickup):
    results = []
    for joint in pickup.joints:
        if "hole_world_center" not in joint:
            continue
        probe = cylinder(joint["hole_diameter_mm"] / 2 - 0.01, 6 if joint["type"] != "tube_wall_pin" else 1.8,
                         joint["hole_world_center"], joint["axis"])
        if joint["type"] == "tube_wall_pin":
            index = int(joint["id"].split("_")[2])
            owner = next(instance for instance in pickup.instances if instance["id"] == "crossmember_" + str(index))
        else:
            plate = joint.get("plate", "main_cheek")
            side = -1 if joint["axis"][0] < 0 else 1
            owner = next(instance for instance in pickup.instances if instance["id"] == plate + "_" + str(side))
        overlap = probe.intersect(pickup.posed(owner)).Volume()
        results.append({"joint": joint["id"], "owner": owner["id"], "hole_probe_overlap_mm3": overlap,
                        "status": "PASS" if overlap < 1e-4 else "FAIL"})
    access = []
    deployed = {instance["id"]: pickup.posed(instance) for instance in pickup.instances}
    deployed_bounds = {name: bounds(shape) for name, shape in deployed.items()}
    for joint in pickup.joints:
        if joint["type"] != "through_fastener":
            continue
        side = joint["axis"][0]
        center = joint["hole_world_center"]
        tool_center = (center[0] - side * 15.5, center[1], center[2])
        tool = cylinder(7, 15, tool_center, joint["axis"])
        blockers = []
        tool_bounds = bounds(tool)
        for obstacle in pickup.instances:
            if obstacle["id"].startswith(joint["id"] + "_"):
                continue
            if separation(tool_bounds, deployed_bounds[obstacle["id"]]) > 1e-6:
                continue
            volume = tool.intersect(deployed[obstacle["id"]]).Volume()
            if volume > 1e-4:
                blockers.append({"part": obstacle["id"], "overlap_mm3": volume})
        access.append({"joint": joint["id"], "status": "BLOCKED_IN_ASSEMBLY" if blockers else "CLEAR_OF_MODELED_PARTS",
                       "blockers": blockers, "tool": "OD14 x15 socket approach, inside nut face",
                   "service": "Float=0 service ports expose inner nuts; remove complete cheek for roller replacement; no shaft sliding through adjacent indexer"})
    return {"status": "PASS" if all(item["status"] == "PASS" for item in results) else "FAIL",
            "hole_coaxiality": results, "nut_access": access,
            "retention_qualification": "UNQUALIFIED loads, loosening, thread engagement and service sequence; no thread helix modeled"}


def inventory(pickup):
    counts = Counter(instance["definition"] for instance in pickup.instances)
    custom = [name for name, definition in pickup.definitions.items() if definition["category"] == "custom"]
    cut_only = [name for name in custom if name.startswith("spacer_") or name in ("kick_core", "kick_rubber")]
    machined = [name for name in custom if name not in cut_only]
    manifest = json.loads((V1 / "checkpoint/manifest.json").read_text(encoding="utf8"))
    old_pickup = [entry for entry in manifest["instances"] if entry["module"] == "pickup"]
    old_moving = [entry for entry in old_pickup if entry["motion"] != "fixed"]
    return {"instances": len(pickup.instances), "definitions": len(counts), "custom_definitions": len(custom),
            "custom_definition_names": custom, "unique_machined_definitions": len(machined),
            "machined_definition_names": machined, "cut_only_definitions": cut_only,
            "machined_definition_target": pickup.config["custom_definition_target"],
            "machined_definition_status": "PASS" if len(machined) <= pickup.config["custom_definition_target"] else "FAIL",
            "strict_all_custom_under_15": len(custom) <= pickup.config["custom_definition_target"],
            "physical_solid_occurrences": sum(len(pickup.definitions[entry["definition"]]["shape"].Solids()) for entry in pickup.instances),
            "by_category": dict(Counter(entry["category"] for entry in pickup.instances)),
            "bom": [{"definition": name, "quantity": count, "category": pickup.definitions[name]["category"]} for name, count in sorted(counts.items())],
            "comparison": {"requested_old_pickup_baseline": 330, "new_instances": len(pickup.instances),
                           "reduction_from_330": 330 - len(pickup.instances), "percent_reduction_from_330": 100 * (330 - len(pickup.instances)) / 330,
                           "frozen_manifest_pickup_all": len(old_pickup), "frozen_manifest_pickup_moving": len(old_moving),
                           "whole_old_551_not_used_as_baseline": True,
                           "scope_caveat": "New inventory includes extra 5 stars (15 source bodies), structural retention and all modeled hardware, but excludes drive transmission/motors and chassis-fixed brackets; not like-for-like powered-system completion"}}


def self_structure_checks(pickup):
    instances = [entry for entry in pickup.instances if entry["category"] in ("structure", "retainer", "bearing", "fastener")]
    candidates = []
    for floating in pickup.config["float_angles"]:
        main = [entry for entry in instances if entry["definition"] == "main_cheek"]
        floating_parts = [entry for entry in instances if entry["motion"] == "float"]
        for plate in main:
            for other in floating_parts:
                first = pickup.posed(plate)
                second = pickup.posed(other, 0, floating)
                if overlap_box_volume(bounds(first), bounds(second)) <= 1e-6:
                    continue
                volume = first.intersect(second).Volume()
                candidates.append({"float_deg": floating, "parts": [plate["id"], other["id"]],
                                   "overlap_mm3": volume, "status": "FAIL" if volume > 1e-4 else "PASS"})
    return {"status": "FAIL" if any(item["status"] == "FAIL" for item in candidates) else "PASS_SCOPED",
            "scope": "Main cheeks versus all floating structural/hardware parts at 0/-8 degrees only; not exhaustive all-pair or swept self-collision proof",
            "pairs": candidates}


def export_geometry(pickup):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    custom_directory = OUTPUT / "custom"
    custom_directory.mkdir(parents=True, exist_ok=True)
    definitions = {}
    roundtrips = []
    for name, entry in pickup.definitions.items():
        shape = entry["shape"]
        vertices, triangles = shape.tessellate(0.8, 0.2)
        data = {key: value for key, value in entry.items() if key != "shape"}
        data.update({"bounds_mm": bounds(shape), "volume_mm3": shape.Volume(), "solid_count": len(shape.Solids()),
                     "positions": [coordinate for vertex in vertices for coordinate in vertex.toTuple()],
                     "indices": [index for triangle in triangles for index in triangle]})
        if entry["category"] == "custom":
            path = custom_directory / (name + ".step")
            cq.exporters.export(shape, str(path))
            imported = cq.importers.importStep(str(path)).val()
            valid = imported.isValid() and len(imported.Solids()) == 1 and math.isclose(imported.Volume(), shape.Volume(), rel_tol=1e-7, abs_tol=1e-4)
            roundtrips.append({"definition": name, "status": "PASS" if valid else "FAIL",
                               "volume_difference_mm3": imported.Volume() - shape.Volume(), "sha256": sha256(path)})
            data["step"] = "custom/" + path.name
            data["step_sha256"] = sha256(path)
        definitions[name] = data
    instances = [{key: value for key, value in entry.items() if key != "pose"} | {"matrix": matrix(entry["pose"])} for entry in pickup.instances]
    manifest, references = reference_data()
    write_json(OUTPUT / "pickup-mesh.json", {"schema": "local-pickup-instanced-mesh/1", "units": "mm", "coordinate_frame": "X width, Y inward, Z up",
               "definitions": definitions, "instances": instances, "settings": pickup.config,
               "pose_order": "fold about main pivot after float about middle roller; fixed parts do not fold",
               "reference_only": {"manifest": "../../coral-intake-v1/checkpoint/manifest.json", "sha256": sha256(V1 / "checkpoint/manifest.json"),
                                  "instances": references, "mesh_source": "../../coral-intake-v1/checkpoint/viewer-data.json",
                                  "note": "Frozen indexer and motors are references, excluded from new STEP and BOM"}})
    assembly = cq.Assembly(name="pickup_structure_not_released")
    for instance in pickup.instances:
        assembly.add(pickup.definitions[instance["definition"]]["shape"], name=instance["id"], loc=instance["pose"])
    path = OUTPUT / "assembly.step"
    assembly.save(str(path))
    return {"status": "PASS" if all(item["status"] == "PASS" for item in roundtrips) else "FAIL",
            "assembly_step": "output/assembly.step", "assembly_sha256": sha256(path), "custom_roundtrips": roundtrips,
            "vendor_roundtrip_fidelity": "NOT_CLAIMED; original source STEP files remain authoritative; no native Onshape validation",
            "scope": "New pickup structure only; no reference indexer, motors, candidate belts or chassis brackets exported as new parts"}


def archive_generated():
    paths = [path for path in OUTPUT.rglob("*") if path.is_file() and "history" not in path.relative_to(OUTPUT).parts]
    report_path = ROOT / "pickup-report.json"
    if report_path.exists():
        paths.append(report_path)
    hashes = {path.relative_to(ROOT).as_posix(): sha256(path) for path in sorted(paths)}
    if not hashes:
        return None
    digest = hashlib.sha256(json.dumps(hashes, sort_keys=True).encode("utf8")).hexdigest()
    directory = OUTPUT / "history" / ("baseline-" + digest[:16])
    receipt_path = directory / "receipt.json"
    if receipt_path.exists():
        if json.loads(receipt_path.read_text(encoding="utf8"))["files"] != hashes:
            raise ValueError("Existing baseline receipt differs; refusing to overwrite history")
    else:
        directory.mkdir(parents=True, exist_ok=False)
        for path in paths:
            target = directory / path.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
        if any(sha256(directory / relative) != digest for relative, digest in hashes.items()):
            raise ValueError("Generated baseline copy failed hash verification")
        write_json(receipt_path, {"schema": "pickup-generated-baseline/1", "files": hashes,
                                 "contents_sha256": digest, "verified_before_overwrite": True})
    if any(sha256(directory / relative) != digest for relative, digest in hashes.items()):
        raise ValueError("Archived baseline no longer matches receipt")
    return {"receipt": receipt_path.relative_to(ROOT).as_posix(), "sha256": sha256(receipt_path),
            "file_count": len(hashes), "report": (directory / "pickup-report.json").relative_to(ROOT).as_posix() if report_path.exists() else None}


def run_build(do_export=True, verify_references=False):
    before = frozen_hashes()
    frozen_path = OUTPUT / "frozen-v1.json"
    if frozen_path.exists():
        baseline = json.loads(frozen_path.read_text(encoding="utf8"))
        if baseline != before:
            raise ValueError("Frozen v1 changed since this module's first recorded build; refusing to replace baseline")
    else:
        write_json(frozen_path, before)
    if len(before) != 305:
        raise ValueError("Expected all 305 frozen v1 files")
    baseline_snapshot = archive_generated()
    print(json.dumps({"phase": "baseline_archived", "snapshot": baseline_snapshot}), flush=True)
    pickup = build()
    x44, x44_binding = vendor("x44")
    print(json.dumps({"phase": "built", "instances": len(pickup.instances), "definitions": len(pickup.definitions)}), flush=True)
    local = local_checks(pickup)
    braces = brace_check(pickup)
    joints = attachment_checks(pickup)
    self_checks = self_structure_checks(pickup)
    contact = contact_witness(pickup)
    print(json.dumps({"phase": "local_checks", "solids_and_bearings": local["status"], "braces": braces["status"], "joints": joints["status"], "self_structure": self_checks["status"]}), flush=True)
    resolver = None
    if verify_references:
        from verify_reference import ReferenceResolver
        resolver = ReferenceResolver(pickup)
    poses = pose_checks(pickup, resolver)
    resolution = resolver.resolve(poses["overlapping_pairs"]) if resolver else None
    counts = inventory(pickup)
    print(json.dumps({"phase": "pose_checks", "status": poses["status"], "exact_tests": poses["exact_tests"]}), flush=True)
    exports = export_geometry(pickup) if do_export else {"status": "NOT_RUN"}
    rows = centers(pickup.config)
    belts = candidate_belts(pickup.config)
    report = {"schema": "local-pickup-structure-report/1", "units": "mm", "cad_ready": False,
              "scope": "New integrated pickup structure only, inspired/source-grounded geometry, not literal 1690 CAD and not a completed subsystem",
              "network_calls": 0, "settings": pickup.config, "roller_centers_yz": rows,
              "previous_generated_baseline": baseline_snapshot,
              "inventory": counts, "local_geometry": local, "brace_clearance": braces,
              "sampled_contact": contact, "attachments": joints, "self_structure": self_checks, "poses": poses,
              "candidate_belts": belts, "retention_stacks": pickup.retention, "joints": pickup.joints,
              "sources": {"star": pickup.sources["intake_star"], "bearing": pickup.sources["hex_bearing"],
                          "star_body_mapping": pickup.sources["star_body_mapping"],
                          "reference_x44": {"sku": x44_binding["sku"], "sha256": x44_binding["sha256"], "valid": x44.isValid(),
                                            "source_solids": len(x44.Solids()), "new_motor_instances": 0,
                                            "scope": "Authentic loader check only; existing indexer X44 placements remain reference-only"}},
              "exports": exports, "v1_frozen": {"file_count": len(before), "baseline": "output/frozen-v1.json",
                                                 "unchanged": before == frozen_hashes()},
              "completion_boundary": ["Direct-seat main/floating cheeks, authentic rollers/bearings, axial stacks, bolted crossmembers and split pivot stubs modeled",
                                      "No motor mounts, torque transmission, selected belts, verified rubber, chassis attachment, actuation or loaded deployment hold",
                                      "Not a complete indexer, pickup subsystem, manufacturing release, reliability result or all-angle capture demonstration",
                                      "Horizontal floor approach only; upright coral, pitch and yaw capture dynamics not checked",
                                      "Reference overlaps and nut-access blockers remain explicit; service sequence and strength unqualified",
                                      "Full-array star rotation and continuous fold/self-collision not certified"],
              "commands": {"build": "& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v2/pickup.py --build",
                           "test": "& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v2/test_pickup.py",
                           "acceptance": "& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v2/test_pickup.py --acceptance"}}
    gates = {"closed_custom_and_bearing_fits": local["status"] == "PASS", "unpowered_mouth_clearance": braces["status"] == "PASS",
             "fastener_holes_coaxial": joints["status"] == "PASS", "scoped_self_structure": self_checks["status"] == "PASS_SCOPED",
             "machined_definition_target": counts["machined_definition_status"] == "PASS", "fewer_than_330_instances": counts["instances"] < 330,
             "all_sampled_envelopes": all(pose["envelope_status"] == "PASS" for pose in poses["poses"]),
             "fixed_reference_clearance": poses["status"] == "CLEAR_AT_SAMPLES_ONLY",
             "assembled_nut_tool_access": all(item["status"] == "CLEAR_OF_MODELED_PARTS" for item in joints["nut_access"]),
             "exports": exports["status"] == "PASS", "v1_unchanged": report["v1_frozen"]["unchanged"]}
    report["acceptance_gates"] = gates
    report["status"] = "PASS_LOCAL_STRUCTURE_ONLY" if all(gates.values()) else "BLOCKED_LOCAL_STRUCTURE"
    if resolution is not None:
        report["reference_resolution"] = {"path": "output/final-reference-resolution.json",
                                           "status": resolution["status"], "summary": resolution["summary"],
                                           "scope": "Separate exhaustive candidate ledger; original limited pose outcomes retained"}
    if baseline_snapshot and baseline_snapshot["report"]:
        prior = json.loads((ROOT / baseline_snapshot["report"]).read_text(encoding="utf8"))
        report["catalog_change_effect"] = {
            "front_center_z_change_mm": rows["front"][1] - prior["roller_centers_yz"]["front"][1],
            "previous_front_center_yz": prior["roller_centers_yz"]["front"], "new_front_center_yz": rows["front"],
            "rear_center_unchanged": rows["rear"] == prior["roller_centers_yz"]["rear"],
            "previous_contact": prior["sampled_contact"], "new_contact": contact,
            "previous_mouth_gap_mm": prior["brace_clearance"]["minimum_certified_structure_gap_mm"],
            "new_mouth_gap_mm": braces["minimum_certified_structure_gap_mm"],
            "previous_minimum_margins_mm": prior["poses"]["minimum_margins_mm"],
            "new_minimum_margins_mm": poses["minimum_margins_mm"]}
    write_json(ROOT / "pickup-report.json", report)
    write_json(OUTPUT / "settings.json", pickup.config)
    write_json(OUTPUT / "BOM.json", counts)
    write_json(OUTPUT / "numerical-checks.json", {"local": local, "braces": braces, "poses": poses, "attachments": joints, "self_structure": self_checks})
    if resolution is not None:
        resolver.write(resolution)
    print(json.dumps({"status": report["status"], "gates": gates, "instances": counts["instances"],
                      "custom_definitions": counts["custom_definitions"], "unique_machined_definitions": counts["unique_machined_definitions"],
                      "brace_minimum_mm": braces["minimum_certified_structure_gap_mm"], "old_tube_collision_mm3": braces["old_tube_collision_mm3"],
                      "pose_minimum_margins_mm": poses["minimum_margins_mm"], "v1_unchanged": report["v1_frozen"]["unchanged"]}), flush=True)
    return 0 if all(gates.values()) else 1


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, allow_nan=False) + "\n", encoding="utf8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--smoke", action="store_true")
    parser.add_argument("--build", action="store_true")
    parser.add_argument("--verify-reference", action="store_true")
    arguments = parser.parse_args()
    if arguments.build:
        return run_build(verify_references=arguments.verify_reference)
    before = frozen_hashes()
    pickup = build_structure()
    result = brace_check(pickup)
    result["custom_valid"] = all(entry["shape"].isValid() and entry["shape"].Volume() > 0 for entry in pickup.definitions.values())
    result["v1_unchanged"] = before == frozen_hashes()
    write_json(OUTPUT / "frozen-v1.json", before)
    write_json(OUTPUT / "structure-smoke.json", result)
    print(json.dumps({key: value for key, value in result.items() if key != "samples"}), flush=True)
    return 0 if result["status"] == "PASS" and result["custom_valid"] and result["v1_unchanged"] else 1


if __name__ == "__main__":
    raise SystemExit(main())