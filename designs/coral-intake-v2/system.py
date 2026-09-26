import argparse
from collections import Counter
import csv
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys
import time


ROOT = Path(__file__).resolve().parent
V1 = ROOT.parent / "coral-intake-v1"
OUTPUT = ROOT / "system-output"
GROUND = ((200.0, 185.0), (340.0, 365.0))
FRONT = ((-300.0, 195.0), (-160.0, 375.0))
LINK_X = 292.0
STOW = 78.0


def translation(angle):
    radians = math.radians(angle)
    return (500 * (1 - math.cos(radians)) + 10 * math.sin(radians),
            500 * math.sin(radians) + 10 * (math.cos(radians) - 1))


def jacobian(angle):
    radians = math.radians(angle)
    return (500 * math.sin(radians) + 10 * math.cos(radians),
            500 * math.cos(radians) - 10 * math.sin(radians))


def circle_box_gap(center, radius, lower=(-85, 45), upper=(0, 165)):
    distances = [max(lower[index] - value, value - upper[index], 0)
                 for index, value in enumerate(center)]
    if not any(distances):
        return -radius - min(min(value - lower[index], upper[index] - value)
                             for index, value in enumerate(center))
    return math.hypot(*distances) - radius


def trajectory_screen():
    report = json.loads((ROOT / "pickup-report.json").read_text(encoding="utf8"))
    samples = []
    for index in range(781):
        angle = index / 10
        delta = translation(angle)
        gaps = [circle_box_gap([center[axis] + delta[axis] for axis in range(2)],
                               25.5 if name == "kick" else 63.7)
                for name, center in report["roller_centers_yz"].items()]
        samples.append({"angle_deg": angle, "bumper_gap_mm": min(gaps),
                        "jacobian_mm_per_rad": jacobian(angle)})
    bound = math.hypot(500, 10) * math.radians(0.05)
    minimum = min(sample["bumper_gap_mm"] for sample in samples)
    return {"scope": "ROLLER_ENVELOPES_ONLY", "samples": len(samples),
            "minimum_bumper_gap_mm": minimum, "interpolation_bound_mm": bound,
            "bumper_gap_lower_bound_mm": minimum - bound,
            "minimum_inward_jacobian_mm_per_rad": min(sample["jacobian_mm_per_rad"][0] for sample in samples),
            "positive_wall_work": all(sample["jacobian_mm_per_rad"][0] > 0 for sample in samples),
            "full_physical_gate": False, "impact_survival": False}


def digest(path):
    checksum = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def protected_hashes():
    paths = list(V1.rglob("*")) + list(ROOT.glob("*"))
    return {path.relative_to(ROOT.parent).as_posix(): digest(path) for path in sorted(paths)
            if path.is_file() and path.name not in {"system.py", "test_system.py", "SYSTEM.md"}}


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def load_builders():
    pickup_module = sys.modules.get("system_v2_pickup") or load_module("system_v2_pickup", ROOT / "pickup.py")
    if "system_v1_model" in sys.modules:
        return pickup_module, sys.modules["system_v1_model"], sys.modules["system_v1_completion"]
    names = ("geometry", "model", "transmission", "cots", "cots.load_vendor")
    saved = {name: sys.modules.get(name) for name in names}
    old_path = sys.path[:]
    try:
        for name in names:
            sys.modules.pop(name, None)
        sys.path.insert(0, str(V1))
        load_module("geometry", V1 / "geometry.py")
        model = load_module("model", V1 / "model.py")
        load_module("transmission", V1 / "transmission.py")
        completion = load_module("system_v1_completion", V1 / "drive_completion.py")
        sys.modules["system_v1_model"] = model
    finally:
        sys.path[:] = old_path
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module
    return pickup_module, model, completion


class System:
    def __init__(self):
        self.pickup_module, self.model, self.completion = load_builders()
        self.cq = self.pickup_module.cq
        self.definitions = {}
        self.instances = []
        self.sources = {}
        self.joints = []
        self.drives = []
        self.missing = []
        self.retained_ids = []
        self.pickup_ids = []

    def define(self, name, shape, material, kind="custom_brep", origin="new", **metadata):
        if name in self.definitions:
            raise ValueError("Duplicate definition: " + name)
        self.definitions[name] = {"shape": shape, "material": material, "kind": kind,
                                  "origin": origin, "status": "NOT_RELEASED", **metadata}
        return name

    def add(self, name, definition, pose=None, motion="fixed", role="structure", **metadata):
        self.instances.append({"id": name, "definition": definition, "pose": pose or self.cq.Location(),
                               "motion": motion, "role": role, **metadata})
        return name

    def import_package(self, package, prefix, origin, motion="fixed"):
        active = {instance["definition"] for instance in package.instances}
        for name in sorted(active):
            definition = package.definitions[name]
            self.define(prefix + name, definition["shape"], definition["material"], definition["kind"],
                        origin, source=definition.get("source"), stock=definition.get("stock"),
                        engineering_status="Retained engineering geometry; never approved" if origin == "retained_v1" else "Candidate placement of authentic stage")
        for instance in package.instances:
            self.add(prefix + instance["id"], prefix + instance["definition"], instance["pose"], motion,
                     instance["role"], original_id=instance["id"], original_module=instance["module"])
        self.sources.update(package.sources)
        self.drives.extend({**pair, "namespace": prefix} for pair in package.gear_pairs)
        self.missing.extend(package.missing)

    def pose(self, instance, angle=0, floating=0):
        module = self.pickup_module
        pose = instance["pose"]
        if instance["motion"] == "float":
            pose = module.rotation((0, *module.centers(self.pickup.config)["middle"]), floating) * pose
        if instance["motion"] in ("pickup_translate", "float"):
            delta = translation(angle)
            pose = self.cq.Location(self.cq.Vector(0, *delta)) * pose
        elif instance["motion"] == "link":
            pose = module.rotation(instance["center"], -angle) * pose
        return pose

    def shape(self, instance, angle=0, floating=0):
        return self.definitions[instance["definition"]]["shape"].moved(self.pose(instance, angle, floating))


def build_retained(system):
    model = system.model
    package = model.Package(model.parameters())
    package.custom("tube_end_plug", model.box((15.8, 15.8, 12), (0, 0, 0)).cut(model.cylinder(2.1, 14, (0, 0, 0))),
                   stock="Unchanged v1 template: 15.8 square, M5 tap after drilling 4.2")
    package.custom("hex_collar", model.hex_hub(24, 8), stock="Unchanged v1 base template; replaced by v1 capture stack")
    model.build_indexer(package)
    model.build_dock(package)
    system.capture_stacks = system.completion._capture_indexer(package)
    model.clock_outputs(package, 3)
    system.import_package(package, "v1_", "retained_v1")
    system.retained_ids = ["v1_" + instance["id"] for instance in package.instances]
    system.retained = package


def build_pickup(system):
    module = system.pickup_module
    pickup = module.build()
    system.pickup = pickup
    kinds = {"custom": "custom_brep", "nominal_hardware": "standard_hardware_nominal_brep",
             "authentic_vendor": "authentic_vendor_brep"}
    for name, definition in pickup.definitions.items():
        metadata = {key: value for key, value in definition.items() if key not in ("shape", "material", "category")}
        source_key = metadata.get("source")
        if source_key:
            metadata["source_binding"] = pickup.sources[source_key]
        system.define("v2_" + name, definition["shape"], definition.get("material", "Nominal material unspecified"),
                      kinds[definition["category"]], "v2_pickup_unchanged", **metadata)
    for instance in pickup.instances:
        motion = "float" if instance["motion"] == "float" else "pickup_translate"
        system.add("v2_" + instance["id"], "v2_" + instance["definition"], instance["pose"], motion,
                   instance["category"], original_motion=instance["motion"], original_id=instance["id"])
    system.pickup_ids = ["v2_" + instance["id"] for instance in pickup.instances]
    system.sources.update({"v2_" + key: value for key, value in pickup.sources.items()})
    system.joints.extend(pickup.joints)


def build_motor_stages(system):
    model = system.model
    for name, motor, output, motion in (("pickup", (-80, 390), (-34.28, 390), "pickup_translate"),
                                        ("deployment", (550, 180), (504.28, 180), "fixed")):
        package = model.Package(model.parameters())
        package.settings["pickup"]["sideplate_x"] = 255
        shaft = package.custom(name + "_stage_shaft", model.shaft(48), stock="AF12.7 x48, M5 end taps; output support/load path incomplete")
        package.add(name + "_stage_shaft", shaft, model.location((282, *output), (1, 0, 0)), "dock", "hard_shaft")
        package.drive(name + "_drive", output, motor, 260, (1, 0, 0), "dock", name + "_candidate_mount")
        model.clock_outputs(package, 3)
        system.import_package(package, name + "_", "new_drive_stage", motion)
        system.missing.append({"id": name + "_downstream_drive", "reason":
            "Only authentic X44 + 12:60 first stage exists. " +
            ("18:36 HTD 2:1 is a catalog candidate without original CAD, selected belt, tensioner or shaft coupling; 10:1 NOT established. Kicker reversal unresolved."
             if name == "pickup" else "Additional reduction and output connection to the upper ground shaft unresolved; 50:1 NOT established, backdrivability and holding unknown.")})


def add_tube(system, name, start, end, width=20, wall=2, motion="fixed"):
    module = system.pickup_module
    length = math.dist(start, end)
    direction = [(end[index] - start[index]) / length for index in range(3)]
    center = [(end[index] + start[index]) / 2 for index in range(3)]
    shape = module.box((width, width, length)).cut(module.box((width - 2 * wall, width - 2 * wall, length + 2)))
    definition = system.define(name, shape, "6061-T6 provisional", stock=f"{width}x{width}x{wall} tube, {length:.6f} mm; saw cuts, no bends")
    transverse = (0, 1, 0) if abs(direction[1]) < 0.9 else (1, 0, 0)
    pose = system.cq.Location(system.cq.Plane(origin=center, xDir=transverse, normal=direction))
    system.add(name, definition, pose, motion)


def add_fastener(system, name, center, side, length, motion):
    module = system.pickup_module
    definition = "system_M5x" + str(length)
    if definition not in system.definitions:
        system.define(definition, system.completion._socket_screw(length), "steel grade unqualified",
                      "standard_hardware_nominal_brep", dimensions_mm={"major_diameter": 5, "length": length, "head_diameter": 8.5, "head_height": 5},
                      verification="Nominal dimensions checked by construction, not a selected supplier product; threads omitted")
    system.add(name, definition, module.location(center, (side, 0, 0)), motion, "fastener")


def contact_guard_shape(module):
    attachments = [(front[0], front[1] + 30) for front in FRONT]
    shape = module.web([(-355, 190), (-355, 335), FRONT[1]], 18, 6.35)
    shape = shape.fuse(module.web([(-355, 190), attachments[0]], 14, 6.35),
                       module.web([FRONT[1], attachments[1]], 14, 6.35)).clean()
    return module.drill(shape, [(*center, 5.5) for center in attachments], 6.35)


def build_structure(system):
    module, model = system.pickup_module, system.model
    thickness = 6
    bearing = "v2_WCP_0783"
    roots = ((12.5, 45), (550, 45))
    for index, (ground, front) in enumerate(zip(GROUND, FRONT)):
        link = module.web([ground, front], 20, thickness)
        link = link.cut(model.hex_shaft(12.8, 8).translate((*ground, 0)))
        link = module.drill(link, [(*front, 28.57)], thickness)
        key = system.define("rocker_" + str(index), link, "6061-T6 provisional", stock="6 mm flat plate, 40 mm rounded web; 500.09999 mm pivots; lateral stiffness NOT qualified")
        for side in (-1, 1):
            system.add("rocker_" + str(index) + "_" + str(side), key, module.location((side * LINK_X, 0, 0)),
                       "link", "link", center=[side * LINK_X, *ground], angle_sign=-1, linkage_index=index)
            system.add("front_bearing_" + str(index) + "_" + str(side), bearing,
                       module.location((side * 295, *front), (side, 0, 0)), "link", "bearing",
                       center=[side * LINK_X, *ground], angle_sign=-1)
    ground_web = module.web([roots[0], GROUND[0], GROUND[1], roots[1], roots[0]], 19, thickness)
    ground_web = ground_web.fuse(module.web([roots[0], GROUND[1]], 16, thickness)).clean()
    ground_web = module.drill(ground_web, [(*center, 28.57) for center in GROUND] + [(*center, 5.5) for center in roots], thickness)
    ground_definition = system.define("ground_triangulated_plate", ground_web, "6061-T6 provisional", stock="6 mm routed open triangulation; root/load/fastener qualification pending")
    anchors = system.pickup.config["crossmembers_yz"]
    attachments = [(FRONT[0][0], FRONT[0][1] + 30), (FRONT[1][0], FRONT[1][1] + 30)]
    coupler = module.web([anchors[0], FRONT[0], FRONT[1], anchors[1], anchors[0]], 20, thickness)
    for pivot, attachment in zip(FRONT, attachments):
        coupler = coupler.fuse(module.web([pivot, attachment], 14, thickness))
    ears = module.drill(coupler, [(*center, 5.5) for center in anchors + attachments], thickness)
    ears = module.drill(ears, [(*center, 32) for center in FRONT], thickness)
    ear_definition = system.define("pickup_attachment_ear", ears, "6061-T6 provisional", stock="6 mm bolt-on plate on existing crossmember holes; unchanged pickup cheek")
    fork = module.drill(coupler, [(*center, 5.5) for center in attachments], thickness)
    for center in FRONT:
        fork = fork.cut(model.hex_shaft(12.8, 8).translate((*center, 0)))
    fork_definition = system.define("moving_fork_plate", fork.clean(), "6061-T6 provisional", stock="6 mm flat fork; hex stub capture; no lower transverse shaft")
    stub = system.define("front_pivot_stub", model.shaft(30), "AF12.7 aluminum hex; grade unqualified", stock="30 mm, M5 end taps; double-supported fork")
    lower_stub = system.define("lower_ground_stub", model.shaft(33), "AF12.7 aluminum hex; grade unqualified", stock="33 mm, M5 end taps; bearing support both ends")
    upper_shaft = system.define("upper_common_shaft", model.shaft(624), "AF12.7 aluminum hex; grade unqualified", stock="624 mm, only common shaft at Y340 Z365; no shaft at lower coral corridor")
    system.add("upper_common_shaft", upper_shaft, module.location((0, *GROUND[1])), "fixed", "hard_shaft")
    skin = contact_guard_shape(module)
    skin_definition = system.define("PC_leading_guard", skin, "polycarbonate", stock="6.35 mm routed flat sacrificial guide; no metal bend; impact/fastener bearing stress unqualified", thickness_mm=6.35)
    system.fastener_replacements = []
    for side in (-1, 1):
        suffix = str(side)
        for axial in (285, 303):
            system.add("ground_plate_" + suffix + "_" + str(axial), ground_definition, module.location((side * axial, 0, 0)))
            system.add("moving_fork_" + suffix + "_" + str(axial), fork_definition, module.location((side * axial, 0, 0)), "pickup_translate")
        system.add("pickup_ear_" + suffix, ear_definition, module.location((side * 231, 0, 0)), "pickup_translate")
        system.add("PC_leading_guard_" + suffix, skin_definition, module.location((side * 310.175, 0, 0)), "pickup_translate", "contact_guard")
        for index, center in enumerate(anchors):
            prefix = "v2_tube_joint_" + str(index) + "_" + suffix + "_axial"
            for instance in system.instances:
                if instance["id"] in (prefix + "_screw", prefix + "_washer"):
                    instance["pose"] = system.cq.Location(system.cq.Vector(side * 6, 0, 0)) * instance["pose"]
                    system.fastener_replacements.append({"id": instance["id"], "reason": "6 mm bolted ear added outside unchanged main cheek", "old_definition": instance["definition"]})
                    if instance["id"].endswith("_screw"):
                        definition = "ear_M5x25"
                        if definition not in system.definitions:
                            system.define(definition, system.completion._socket_screw(25), "steel grade unqualified", "standard_hardware_nominal_brep",
                                          dimensions_mm={"diameter": 5, "length": 25}, engagement_mm=12, verification="Nominal screw, replaces M5x20; supplier/grade not selected")
                        instance["definition"] = definition
        for index, center in enumerate(attachments):
            add_tube(system, "outrigger_" + suffix + "_" + str(index), (side * 234, *center), (side * 282, *center), motion="pickup_translate")
            add_tube(system, "fork_bridge_" + suffix + "_" + str(index), (side * 288, *center), (side * 300, *center), motion="pickup_translate")
            for axial in (240, 276, 294):
                plug = module.box((15.8, 15.8, 12)).cut(module.cylinder(2.1, 14))
                key = "outrigger_end_plug"
                if key not in system.definitions:
                    system.define(key, plug, "6061-T6 provisional", stock="15.8 square x12, axial M5; radial retention NOT established")
                system.add("outrigger_plug_" + suffix + "_" + str(index) + "_" + str(axial), key,
                           module.location((side * axial, *center)), "pickup_translate")
            add_fastener(system, "ear_tube_screw_" + suffix + "_" + str(index), (side * 228, *center), -side, 18, "pickup_translate")
            add_fastener(system, "fork_tube_screw_" + suffix + "_" + str(index), (side * 288, *center), side, 18, "pickup_translate")
            add_fastener(system, "guard_bridge_screw_" + suffix + "_" + str(index), (side * 313.35, *center), side, 25, "pickup_translate")
            system.add("guard_gap_washer_" + suffix + "_" + str(index), "v2_M5_washer",
                       module.location((side * 306.5, *center)), "pickup_translate", "fastener")
        for index, (ground, front) in enumerate(zip(GROUND, FRONT)):
            for face, direction in ((282, -side), (306, side)):
                system.add("ground_bearing_" + suffix + "_" + str(index) + "_" + str(face), bearing,
                           module.location((side * face, *ground), (direction, 0, 0)), "fixed", "bearing")
            system.add("front_stub_" + suffix + "_" + str(index), stub, module.location((side * 294, *front)), "pickup_translate", "hard_shaft")
            for face, direction in ((279, -side), (309, side)):
                add_fastener(system, "front_stub_end_" + suffix + "_" + str(index) + "_" + str(face), (side * face, *front), direction, 12, "pickup_translate")
            if index == 0:
                system.add("lower_ground_stub_" + suffix, lower_stub, module.location((side * 295.5, *ground)), "fixed", "hard_shaft")
                add_fastener(system, "lower_ground_end_" + suffix, (side * 312, *ground), side, 12, "fixed")
        add_fastener(system, "upper_common_end_" + suffix, (side * 312, *GROUND[1]), side, 12, "fixed")
        for index, root in enumerate(roots):
            add_tube(system, "frame_root_bridge_" + suffix + "_" + str(index), (side * 306, *root), (side * 325, *root), width=25)
            add_fastener(system, "frame_root_bolt_" + suffix + "_" + str(index), (side * 354, *root), side, 75, "fixed")
        rail = module.box((25, 760, 40)).cut(module.box((21, 762, 36)))
        for root in roots:
            rail = rail.cut(module.cylinder(2.75, 27, (0, root[0] - 380, 0), (1, 0, 0)))
        key = system.define("side_frame_" + suffix, rail, "6061-T6 provisional", stock="Assumed chassis datum: 25x40x2, 760 long; not supplied robot CAD")
        system.add("side_frame_" + suffix, key, system.cq.Location(system.cq.Vector(side * 337.5, 380, 45)), role="chassis_assumption")
    add_tube(system, "upper_moving_crossmember", (-282, *FRONT[1]), (282, *FRONT[1]), motion="pickup_translate")
    add_tube(system, "ground_upper_crossmember", (-279, 340, 395), (279, 340, 395))
    for name, first, second, motion in (("pickup_motor_support", (240, -160, 405), (240, -34, 362), "pickup_translate"),
                                       ("deployment_motor_support", (303, 550, 45), (260, 504.28, 152), "fixed")):
        add_tube(system, name, first, second, width=25, motion=motion)
    system.missing.extend([
        {"id": "mount_completion", "reason": "Tube plug radial retention, crossmember end joints, motor-support bolted interfaces, root bolt crush sleeves/nuts, pivot flange retention and drive guarding require completion; connected geometry is not an approved load path."},
        {"id": "wall_hit_qualification", "reason": "PC leads exposed metal; link compliance/backdrive, out-of-plane stiffness, impact energy, hard stops, side-load and fastener loads unqualified. No survival claim."},
        {"id": "v2_redundant_pivot", "reason": "All original v2 stubs and bearings travel with the pickup; former pivot is no longer a ground joint. Redundant hardware retained explicitly."}])


def build_envelopes_and_guards(system):
    module = system.pickup_module
    for name, size, center, motion in (
            ("bumper", (870, 85, 120), (0, -42.5, 105), "fixed"),
            ("receiver_keepout", (260, 140, 850), (0, 440, 675), "fixed"),
            ("pickup_second_stage", (30, 150, 120), (288, -75, 405), "pickup_translate"),
            ("deployment_reducer", (95, 150, 160), (245, 465, 230), "fixed"),
            ("moving_cable_reserve", (18, 250, 40), (318, 0, 395), "pickup_translate")):
        key = system.define(name + "_envelope", module.box(size), "REFERENCE ONLY", "reference_envelope", "reference_envelope",
                            purpose="Unresolved drive space" if "stage" in name or "reducer" in name else "Assumed keepout/route; not a manufactured component")
        system.add(name + "_envelope", key, system.cq.Location(system.cq.Vector(*center)), motion, "reference_envelope")
    for name, center, motion in (("pickup", (292, -75, 480), "pickup_translate"), ("deployment", (290, 505, 325), "fixed")):
        shape = module.box((80, 180, 3))
        key = system.define(name + "_PC_drive_guard", shape, "polycarbonate", stock="3 mm flat partial guard, mounting tabs/fasteners and full coverage unresolved", thickness_mm=3)
        system.add(name + "_PC_drive_guard", key, system.cq.Location(system.cq.Vector(*center)), motion, "guard")
    system.missing.append({"id": "stops_and_wiring", "reason": "No selected elastomer buffer, adjustable stop contact pair, service hold, limit sensing or physical wire chain. Route envelope and partial PC guard are NOT completion evidence."})


def build_stop_candidates(system):
    module = system.pickup_module
    block = module.box((24, 30, 20)).cut(module.cylinder(3.4, 22))
    support = system.define("stop_thread_block", block, "6061-T6 provisional", stock="M8 tapped block, 24x30x20; mounting interface unresolved")
    bolt = module.cylinder(4, 24).fuse(model_hex_head(system, 13, 5).translate((0, 0, -14.5)))
    screw = system.define("stop_M8_adjuster", bolt, "steel grade unqualified", "standard_hardware_nominal_brep",
                          dimensions_mm={"major_diameter": 8, "length": 24, "head_af": 13}, verification="Nominal dimensions only; lock nut/procurement unresolved")
    pad = system.define("stop_buffer_candidate", module.box((20, 20, 8)), "elastomer unspecified", stock="Candidate buffer shape, not selected product; no durometer or damping claim")
    for side in (-1, 1):
        center = (side * 292, 170, 141)
        system.add("stop_block_" + str(side), support, system.cq.Location(system.cq.Vector(*center)))
        system.add("stop_adjuster_" + str(side), screw, system.cq.Location(system.cq.Vector(side * 292, 170, 149.5)), role="fastener")
        system.add("stop_buffer_" + str(side), pad, system.cq.Location(system.cq.Vector(side * 292, 170, 161.5)), role="outer_elastomer")


def model_hex_head(system, across_flats, length):
    return system.model.hex_shaft(across_flats, length)


def build():
    system = System()
    build_pickup(system)
    build_retained(system)
    build_motor_stages(system)
    build_structure(system)
    build_envelopes_and_guards(system)
    build_stop_candidates(system)
    return system


def transformed_bounds(extent, matrix):
    corners = [[extent[axis + (3 if mask & (1 << axis) else 0)] for axis in range(3)] for mask in range(8)]
    transformed = [[sum(matrix[row][axis] * corner[axis] for axis in range(3)) + matrix[row][3] for row in range(3)] for corner in corners]
    return [min(point[axis] for point in transformed) for axis in range(3)] + [max(point[axis] for point in transformed) for axis in range(3)]


def aabb_gap(first, second):
    return math.sqrt(sum(max(first[axis] - second[axis + 3], second[axis] - first[axis + 3], 0) ** 2 for axis in range(3)))


def is_reference(system, instance):
    return system.definitions[instance["definition"]]["kind"] == "reference_envelope"


def pair_priority(system, first, second):
    origins = [system.definitions[instance["definition"]]["origin"] for instance in (first, second)]
    roles = {first["role"], second["role"]}
    if "retained_v1" in origins and "new" in origins and roles.intersection({"structure", "link", "hard_shaft", "motor", "gear"}):
        return 0
    if "retained_v1" in origins and "v2_pickup_unchanged" in origins:
        return 1
    if roles.intersection({"link", "contact_guard", "motor", "gear"}):
        return 2
    return 3


def overlap_witness(system, first_shape, second_shape, allowance):
    from OCP.BRepClass3d import BRepClass3d_SolidClassifier
    from OCP.TopAbs import TopAbs_IN
    from OCP.gp import gp_Pnt
    calls = 0
    first_solids = [(solid, system.pickup_module.bounds(solid)) for solid in first_shape.Solids()]
    second_solids = [(solid, system.pickup_module.bounds(solid)) for solid in second_shape.Solids()]
    fractions = [(0.5, 0.5, 0.5), (0.25, 0.25, 0.25), (0.75, 0.75, 0.75),
                 (0.25, 0.75, 0.5), (0.75, 0.25, 0.5)]
    for first_solid, first_box in first_solids:
        for second_solid, second_box in second_solids:
            lower = [max(first_box[axis], second_box[axis]) for axis in range(3)]
            upper = [min(first_box[axis + 3], second_box[axis + 3]) for axis in range(3)]
            if any(upper[axis] - lower[axis] <= 1e-5 for axis in range(3)):
                continue
            for fraction in fractions:
                if calls + 2 > allowance:
                    return None, calls
                point = [lower[axis] + fraction[axis] * (upper[axis] - lower[axis]) for axis in range(3)]
                classifier = BRepClass3d_SolidClassifier(first_solid.wrapped, gp_Pnt(*point), 1e-7)
                calls += 1
                if classifier.State() != TopAbs_IN:
                    continue
                classifier = BRepClass3d_SolidClassifier(second_solid.wrapped, gp_Pnt(*point), 1e-7)
                calls += 1
                if classifier.State() == TopAbs_IN:
                    return point, calls
    return None, calls


def collision_check(system, max_exact=1000, seconds=360, persist=False):
    started = time.monotonic()
    poses = [(angle, 0) for angle in (0, 13, 26, 39, 52, 65, 78)] + [(angle, -8) for angle in (0, 39, 78)]
    instances = system.instances
    local_bounds = {name: system.pickup_module.bounds(definition["shape"]) for name, definition in system.definitions.items()}
    candidates = []
    coverage = Counter()
    coverage_by_priority = Counter()
    for angle, floating in poses:
        extents = [transformed_bounds(local_bounds[instance["definition"]], system.pickup_module.matrix(system.pose(instance, angle, floating))) for instance in instances]
        for first_index, first in enumerate(instances):
            for second_index in range(first_index + 1, len(instances)):
                second = instances[second_index]
                motions = {first["motion"], second["motion"]}
                if motions == {"fixed"} and (angle or floating):
                    coverage["rigid_relative_pose_reused"] += 1
                    continue
                if motions.issubset({"pickup_translate", "float"}) and angle:
                    coverage["rigid_translation_reused"] += 1
                    continue
                if "float" not in motions and floating:
                    coverage["identical_float_pose_reused"] += 1
                    continue
                references = [instance for instance in (first, second) if is_reference(system, instance)]
                if references and not any(instance["id"] in {"bumper_envelope", "receiver_keepout_envelope"} for instance in references):
                    coverage["nonphysical_envelope_pairs_not_certified"] += 1
                    continue
                if len(references) == 2:
                    coverage["reference_reference_not_physical"] += 1
                    continue
                coverage["sampled_pair_obligations"] += 1
                gap = aabb_gap(extents[first_index], extents[second_index])
                if gap > 0.25:
                    coverage["aabb_separated_at_sample"] += 1
                    continue
                priority = pair_priority(system, first, second)
                coverage_by_priority[str(priority)] += 1
                candidates.append({"first": first["id"], "second": second["id"], "angle_deg": angle,
                                   "float_deg": floating, "priority": priority, "aabb_distance_lower_bound_mm": gap})
    candidates.sort(key=lambda pair: (pair["priority"], pair["angle_deg"], pair["float_deg"], pair["first"], pair["second"]))
    lookup = {instance["id"]: instance for instance in instances}
    results, calls = [], 0
    checked_priorities = Counter()
    def persist_progress(active_pair=None):
        if persist:
            write_json(OUTPUT / "checks.json", {"status": "INCOMPLETE_RUNNING_OR_INTERRUPTED", "full_physical_gate": False,
                                               "continuous_motion_certified": False, "candidate_count": len(candidates),
                                               "results": results, "exact_kernel_calls": calls, "active_pair": active_pair,
                                               "collisions": [row for row in results if row["classification"] in {"HARD_INTERFERENCE", "REFERENCE_KEEPOUT_INTERFERENCE"}],
                                               "untested_pairs": candidates[len(results):], "uncertified_pair_count": len(candidates) - len(results),
                                               "coverage": dict(coverage), "adjacency_exclusions": []})
    persist_progress()
    for candidate in candidates:
        if calls + 12 > max_exact or time.monotonic() - started >= seconds:
            break
        first, second = lookup[candidate["first"]], lookup[candidate["second"]]
        result = dict(candidate)
        persist_progress(candidate)
        try:
            first_shape = system.shape(first, candidate["angle_deg"], candidate["float_deg"])
            second_shape = system.shape(second, candidate["angle_deg"], candidate["float_deg"])
            witness, witness_calls = overlap_witness(system, first_shape, second_shape, min(10, max_exact - calls - 1))
            calls += witness_calls
            distance = 0.0
            if witness is None:
                calls += 1
                distance = first_shape.distance(second_shape)
            soft = bool({first["role"], second["role"]}.intersection({"outer_elastomer", "compliant_contact"}))
            classification = "CLEAR_AT_SAMPLE" if distance > 0.25 else "NEAR_OR_CONTACT_UNQUALIFIED"
            if witness is not None:
                classification = "SOFT_OVERLAP_UNQUALIFIED" if soft else "HARD_INTERFERENCE"
                if is_reference(system, first) or is_reference(system, second):
                    classification = "REFERENCE_KEEPOUT_INTERFERENCE"
            result.update(distance_mm=distance, intersection_mm3=None, interior_witness_mm=witness, classification=classification,
                          overlap_method="Point strictly inside both actual B-rep solids; volume not computed. No witness is NOT proof of no overlap.",
                          nominal_thread_or_joint_waiver=False)
        except Exception as error:
            result.update(classification="KERNEL_CHECK_ERROR", error=str(error))
        results.append(result)
        checked_priorities[str(candidate["priority"])] += 1
        persist_progress()
        if len(results) % 5 == 0:
            print(json.dumps({"phase": "collision", "checked_pairs": len(results), "exact_kernel_calls": calls,
                              "seconds": round(time.monotonic() - started, 1)}), flush=True)
    untested = candidates[len(results):]
    collisions = [result for result in results if result["classification"] in {"HARD_INTERFERENCE", "REFERENCE_KEEPOUT_INTERFERENCE"}]
    return {"status": "BLOCKED", "full_physical_gate": False, "continuous_motion_certified": False,
            "poses": poses, "coverage": dict(coverage), "candidate_count": len(candidates),
            "candidates_by_priority": dict(coverage_by_priority), "checked_by_priority": dict(checked_priorities),
            "exact_kernel_calls": calls, "maximum_exact_kernel_calls": max_exact,
            "time_budget_seconds": seconds, "elapsed_seconds": time.monotonic() - started,
            "budget_note": "Deadline checked between OCCT calls; an individual kernel operation is not preemptible",
            "results": results, "collisions": collisions, "untested_pairs": untested,
            "uncertified_pair_count": len(untested), "adjacency_exclusions": [],
            "qualification": "All physical pairs enter broadphase; rigid relative poses reused only when identical. Nominal threads/contacts are not silently waived. Reference drive/wire/sensor envelopes cannot certify hardware."}


def material_density(definition):
    material = definition["material"].lower()
    if definition["kind"] in {"authentic_vendor_brep", "reference_envelope"}:
        return None
    if "polycarbonate" in material:
        return 1.2e-6
    if "steel" in material:
        return 7.85e-6
    if "aluminum" in material or "6061" in material:
        return 2.7e-6
    return None


def appearance(definition, role=""):
    if definition["kind"] == "reference_envelope":
        return [0.95, 0.15, 0.12, 0.22]
    if "polycarbonate" in definition["material"].lower():
        return [0.95, 0.70, 0.16, 1]
    if role in {"outer_elastomer", "compliant_contact"}:
        return [0.18, 0.60, 0.30, 1]
    if role == "motor":
        return [0.18, 0.20, 0.22, 1]
    return [0.68, 0.72, 0.75, 1]


def write_json(path, content):
    path.write_text(json.dumps(content, indent=2, allow_nan=False) + "\n", encoding="utf8")


def wall_material_report(system):
    physical = [instance for instance in system.instances if not is_reference(system, instance)]
    moving = [instance for instance in physical if instance["motion"] != "fixed"]
    leading = sorted([{"id": instance["id"], "role": instance["role"],
                       "front_y_mm": system.pickup_module.bounds(system.shape(instance))[1],
                       "material": system.definitions[instance["definition"]]["material"]} for instance in moving], key=lambda row: row["front_y_mm"])
    return {"status": "NOT_QUALIFIED", "first_front_plane_contacts": leading[:15],
            "wall_force_direction": "+Y", "positive_work_per_positive_retraction": trajectory_screen()["positive_wall_work"],
            "work_relation": "virtual work = Fy * (500 sin(q) + 10 cos(q)) * dq, q in radians",
            "force_path_candidate": ["6.35 mm PC leading guide", "moving fork and bolted ear", "48 mm tube outrigger and cheek/crossmember joints", "front short stubs and bearings", "four 6 mm Al links", "ground bearing frames", "root fasteners and assumed side rails"],
            "known_breaks": ["Tube plugs lack positive radial retention", "Guide bolt bearing/crush and preload unqualified", "Long flat links lack lateral strength/fatigue qualification", "Motor reaction and root fastener interfaces incomplete", "Backdrive can be prevented by unselected reduction", "Candidate stop blocks lack completed mounting and buffer specification"],
            "polycarbonate": {"contact_guides_mm": 6.35, "partial_drive_guards_mm": 3, "retained_tray_mm": 3,
                              "grade": "unselected", "impact_energy_absorption_claim": False},
            "aluminum": {"links_and_plates_mm": 6, "tubes": "20/25 mm square x2 mm wall", "grade": "6061-T6 assumed, not purchased or certified"},
            "wall_survival": False, "side_and_oblique_hits": "UNTESTED", "damper_selected": False,
            "scope": "Quasistatic sign and front-plane geometry only; no impact dynamics, strength, current limit, friction, rebound or loaded contact proof"}


def retained_comparison(system):
    manifest = json.loads((V1 / "checkpoint/manifest.json").read_text(encoding="utf8"))
    prior = {instance["id"]: instance for instance in manifest["instances"]}
    rows = []
    for instance in system.instances:
        if instance["id"] not in system.retained_ids:
            continue
        old = prior.get(instance["original_id"])
        row = {"id": instance["id"], "checkpoint_present": old is not None}
        if old:
            definition = system.definitions[instance["definition"]]
            old_definition = manifest["definitions"][old["definition"]]
            row["volume_delta_mm3"] = definition["shape"].Volume() - old_definition["volume_mm3"]
            old_matrix = old.get("matrix_row_major_mm", old.get("matrix"))
            row["matrix_max_delta"] = max(abs(first - second) for first_row, second_row in zip(system.pickup_module.matrix(instance["pose"]), old_matrix) for first, second in zip(first_row, second_row)) if old_matrix else None
        rows.append(row)
    return {"rows": rows, "all_ids_present": all(row["checkpoint_present"] for row in rows),
            "geometry_and_pose_unchanged": all(row.get("matrix_max_delta") is not None and row["matrix_max_delta"] < 1e-7 and abs(row["volume_delta_mm3"]) < 1e-4 for row in rows),
            "comparison": "Definition volume and instance matrix, not topological equivalence or engineering approval"}


def export_system(system):
    OUTPUT.mkdir(exist_ok=True)
    custom_directory = OUTPUT / "custom"
    custom_directory.mkdir(exist_ok=True)
    quantities = Counter(instance["definition"] for instance in system.instances)
    definitions, mesh_definitions, bom, roundtrips = {}, {}, [], []
    for name in sorted(quantities):
        definition = system.definitions[name]
        shape = definition["shape"]
        metadata = {key: value for key, value in definition.items() if key != "shape"}
        metadata.update(volume_mm3=shape.Volume(), surface_area_mm2=shape.Area(), solids=len(shape.Solids()),
                        valid=shape.isValid(), bounds_mm=system.pickup_module.bounds(shape), quantity=quantities[name],
                        color_rgba=appearance(definition))
        density = material_density(definition)
        metadata["mass_per_instance_kg_estimate"] = density * metadata["volume_mm3"] if density else None
        metadata["mass_status"] = "ASSUMED_DENSITY_NOT_WEIGHED" if density else "UNKNOWN_NOT_ZERO"
        if definition["kind"] == "custom_brep" and metadata["valid"] and metadata["solids"] and metadata["volume_mm3"] > 0:
            path = custom_directory / (name + ".step")
            system.cq.exporters.export(shape, str(path))
            imported = system.cq.importers.importStep(str(path)).val()
            delta = abs(imported.Volume() - shape.Volume())
            passed = imported.isValid() and delta <= max(1e-4, shape.Volume() * 1e-8)
            roundtrips.append({"definition": name, "valid": imported.isValid(), "volume_delta_mm3": delta, "pass": passed})
            metadata["custom_step"] = path.relative_to(OUTPUT).as_posix()
        vertices, triangles = shape.tessellate(0.8, 0.2)
        mesh_definitions[name] = {**metadata, "positions": [coordinate for vertex in vertices for coordinate in vertex.toTuple()],
                                  "indices": [index for triangle in triangles for index in triangle], "geometry_type": "TESSELLATION_OF_ACTUAL_BREP"}
        definitions[name] = metadata
        bom.append({"part": name, "quantity": quantities[name], "origin": definition["origin"], "geometry": definition["kind"],
                    "material": definition["material"], "material_status": "UNQUALIFIED", "volume_each_mm3": metadata["volume_mm3"],
                    "surface_area_each_mm2": metadata["surface_area_mm2"], "mass_each_kg_estimate": metadata["mass_per_instance_kg_estimate"],
                    "mass_total_kg_estimate": metadata["mass_per_instance_kg_estimate"] * quantities[name] if density else None,
                    "mass_status": metadata["mass_status"], "status": "NOT_RELEASED", "source": json.dumps(definition.get("source_binding", definition.get("source", "local parametric B-rep")))})
    assembly = system.cq.Assembly(name="Coral_Intake_v2_FULL_SYSTEM_NOT_RELEASED")
    references = system.cq.Assembly(name="REFERENCE_ENVELOPES_NOT_HARDWARE")
    instances = []
    for instance in system.instances:
        definition = system.definitions[instance["definition"]]
        color = appearance(definition, instance["role"])
        target = references if is_reference(system, instance) else assembly
        target.add(definition["shape"], name=instance["id"], loc=instance["pose"], color=system.cq.Color(*color))
        metadata = {key: value for key, value in instance.items() if key != "pose"}
        metadata.update(matrix=system.pickup_module.matrix(instance["pose"]), matrix_row_major_mm=system.pickup_module.matrix(instance["pose"]),
                        color_rgba=color, opacity=color[3], origin=definition["origin"], reference_only=is_reference(system, instance),
                        bounds_deployed_mm=system.pickup_module.bounds(system.shape(instance)))
        instances.append(metadata)
    assembly.save(str(OUTPUT / "systemassembly.step"))
    references.save(str(OUTPUT / "reference-envelopes.step"))
    motion = {"units": "mm/degrees", "coordinates": "X width, Y into robot, Z up", "range_deg": [0, 78], "float_deg": [-8, 0],
              "translation": {"dy": "500*(1-cos(q))+10*sin(q)", "dz": "500*sin(q)+10*(cos(q)-1)", "q_unit": "radians"},
              "float_center": [0, *system.pickup_module.centers(system.pickup.config)["middle"]],
              "composition": "float about local middle first, then translate; link rotates -q about instance.center; matrix is deployed world pose", "root_frames": ["fixed", "pickup_translate", "float", "link"]}
    manifest = {"status": "NOT_RELEASED", "full_physical_gate": False, "definitions": definitions, "instances": instances, "motion": motion,
                "sources": system.sources, "drives": system.drives, "missing_required": system.missing, "fastener_replacements": system.fastener_replacements,
                "source_code_sha256": {path.name: digest(path) for path in (ROOT / "system.py", ROOT / "pickup.py", V1 / "model.py", V1 / "geometry.py", V1 / "transmission.py", V1 / "drive_completion.py")},
                "vendor_fidelity": "Original verified, normalized cached vendor B-reps. STEP assembly is a convenience OCCT re-export, NOT source-fidelity approval.",
                "no_mesh_to_brep": True, "retained_checkpoint_comparison": retained_comparison(system)}
    write_json(OUTPUT / "manifest.json", manifest)
    write_json(OUTPUT / "system-mesh.json", {"schema_version": 1, "status": "NOT_RELEASED", "definitions": mesh_definitions, "instances": instances, "motion": motion})
    write_json(OUTPUT / "BOM.json", {"parts": bom, "missing_required": system.missing, "mass_total_kg": None,
                                     "known_material_mass_subtotal_kg_estimate": sum(row["mass_total_kg_estimate"] or 0 for row in bom),
                                     "unknown_mass_definitions": [row["part"] for row in bom if row["mass_total_kg_estimate"] is None and row["geometry"] != "reference_envelope"]})
    with (OUTPUT / "BOM.csv").open("w", newline="", encoding="utf8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(bom[0]))
        writer.writeheader()
        writer.writerows(bom)
    write_json(OUTPUT / "export-checks.json", {"custom_roundtrips": roundtrips, "all_custom_roundtrips_pass": all(row["pass"] for row in roundtrips),
                                              "invalid_definitions": [name for name, definition in definitions.items() if not definition["valid"] or definition["volume_mm3"] <= 0],
                                              "assembly_reimport_checked": False, "manufacturing_release": False})
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-exact", type=int, default=1000)
    parser.add_argument("--seconds", type=float, default=360)
    arguments = parser.parse_args()
    if not 0 <= arguments.max_exact <= 1000 or not 0 <= arguments.seconds <= 540:
        parser.error("Exact-call budget must be 0..1000 and check time 0..540 seconds")
    started = time.monotonic()
    OUTPUT.mkdir(exist_ok=True)
    previous_manifest = OUTPUT / "manifest.json"
    if previous_manifest.exists():
        prior = json.loads(previous_manifest.read_text(encoding="utf8"))
        prior_hashes = {path.name: digest(path) for path in OUTPUT.glob("*.json") if path.name != "prior-run.json"}
        write_json(OUTPUT / "prior-run.json", {"status": "SUPERSEDED_OR_INTERRUPTED", "source_code_sha256": prior.get("source_code_sha256"),
                                              "report_hashes": prior_hashes, "note": "First collision attempt interrupted after exceeding ten minutes; no completed physical check claimed"})
    before = protected_hashes()
    write_json(OUTPUT / "source-freeze.json", {"before": before, "after": None, "pass": False, "status": "RUNNING_OR_INTERRUPTED"})
    write_json(OUTPUT / "summary.json", {"status": "RUNNING_OR_INTERRUPTED_NOT_RELEASED", "full_physical_gate": False})
    system = build()
    print(json.dumps({"phase": "built", "instances": len(system.instances), "seconds": time.monotonic() - started}), flush=True)
    manifest = export_system(system)
    write_json(OUTPUT / "materials-wall-hits.json", wall_material_report(system))
    remaining = max(0, min(arguments.seconds, 575 - (time.monotonic() - started)))
    checks = collision_check(system, arguments.max_exact, remaining, persist=True)
    write_json(OUTPUT / "checks.json", checks)
    after = protected_hashes()
    changed = sorted(name for name in set(before) | set(after) if before.get(name) != after.get(name))
    write_json(OUTPUT / "source-freeze.json", {"before": before, "after": after, "changed": changed, "pass": not changed,
                                              "v1_files": sum(name.startswith("coral-intake-v1/") for name in before)})
    summary = {"status": "BLOCKED_NOT_RELEASED", "full_physical_gate": False, "instances": len(system.instances),
               "definitions": len(manifest["definitions"]), "real_motors": sum(instance["role"] == "motor" for instance in system.instances),
               "real_gears": sum(instance["role"] == "gear" for instance in system.instances), "hard_or_keepout_interferences": len(checks["collisions"]),
               "unchecked_candidate_pairs": checks["uncertified_pair_count"], "source_freeze_pass": not changed,
               "elapsed_seconds": time.monotonic() - started, "trajectory_screen": trajectory_screen(),
               "completion_boundary": "Full-context B-rep checkpoint exists; unresolved drive stages, joints, collisions, continuous motion and strength prevent competition readiness"}
    write_json(OUTPUT / "summary.json", summary)
    artifacts = {path.relative_to(OUTPUT).as_posix(): digest(path) for path in sorted(OUTPUT.rglob("*")) if path.is_file() and path.name != "artifact-hashes.json"}
    write_json(OUTPUT / "artifact-hashes.json", artifacts)
    print(json.dumps(summary, indent=2), flush=True)
    return 2


if __name__ == "__main__":
    sys.exit(main())