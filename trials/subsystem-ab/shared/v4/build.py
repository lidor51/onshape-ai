import hashlib
import json
import math
from pathlib import Path
import sys

import vtk
import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from cad_core import cq, bounds, solid_check
from model import geometry, rectangular, round_stock, primitive, recipe
from layout import CONTROLS, CORAL_LENGTH, CORAL_RADIUS, stations

REPO = HERE.parents[3]
COTS = HERE.parents[1] / "cots"
PIVOT = np.array([0., 140., 435.])
BASE = {name: specification["default"] for name, specification in CONTROLS.items()}
AXIS_X = np.array([[0., 0., 1.], [1., 0., 0.], [0., 1., 0.]])


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def rotation(axis, degrees):
    direction = np.array(axis, dtype=float)
    direction /= np.linalg.norm(direction)
    skew = np.array([[0, -direction[2], direction[1]], [direction[2], 0, -direction[0]], [-direction[1], direction[0], 0]])
    angle = math.radians(degrees)
    return np.eye(3) + math.sin(angle) * skew + (1 - math.cos(angle)) * (skew @ skew)


def matrix(origin=(0, 0, 0), orientation=None):
    result = np.eye(4)
    result[:3, 3] = origin
    if orientation is not None:
        result[:3, :3] = orientation
    return result


def located(shape, placement):
    from OCP.gp import gp_Trsf
    transform = gp_Trsf()
    transform.SetValues(*placement[:3, :].flatten().tolist())
    return shape.moved(cq.Location(transform))


def hexagon(across_flats, length, center=(0, 0, 0)):
    radius = across_flats / math.sqrt(3)
    return primitive("polygon", center, points=[[radius * math.cos(index * math.pi / 3), radius * math.sin(index * math.pi / 3)] for index in range(6)], length=length, start=-length / 2, axis="x")


def strip(first, second, half_width, thickness=6):
    delta = np.array(second, dtype=float) - first
    normal = np.array([-delta[1], delta[0]]) / np.linalg.norm(delta)
    points = [list(np.array(point) + sign * half_width * normal) for point, sign in [(first, 1), (second, 1), (second, -1), (first, -1)]]
    return primitive("polygon", (0, 0, 0), points=points, length=thickness, start=-thickness / 2, axis="x")


class Model:
    def __init__(self, controls=None):
        self.controls = dict(BASE, **(controls or {}))
        for name, value in self.controls.items():
            if name not in CONTROLS or not CONTROLS[name]["min"] <= value <= CONTROLS[name]["max"]:
                raise ValueError("Unsafe control: " + name)
        self.parts = {}
        self.shapes = {}
        self.instances = []
        self.groups = {}
        self.interfaces = []
        self.exemptions = []
        self.sources = {}
        self.relations = []

    def part(self, name, additions, cuts=(), material="6061-T6_ASSUMED", process="Router cut; deburr; inspect", category="custom"):
        operations = recipe(additions, cuts)
        self.parts[name] = {"id": name, "category": category, "material": material, "process": process, "recipe": operations, "holeInterfaces": [], "notes": "Qualification pending; not vendor geometry"}
        self.shapes[name] = geometry(operations, self.controls)
        return name

    def group(self, name, parent="fixed", kind="FASTENED", origin=(0, 0, 0), axis=(1, 0, 0), limits=None):
        self.groups[name] = {"id": name, "parent": parent, "jointType": kind, "originMm": list(origin), "axis": list(axis), "limits": limits, "nativeStatus": "UNEXECUTED"}

    def add(self, name, role, origin=(0, 0, 0), group="fixed", orientation=None, width_factor=0, height_factor=0):
        self.instances.append({"id": name, "part": role, "group": group, "matrix": matrix(origin, orientation).tolist(), "mouthWidthTranslation": [width_factor, 0, 0], "receiverHeightTranslation": [0, 0, height_factor], "referenceOnly": self.parts[role]["category"] == "reference"})
        return name

    def pair(self, first, second, maximum, intent):
        self.exemptions.append({"pair": sorted([first, second]), "maximumVolumeMm3": maximum, "intent": intent})

    def vendor(self, product):
        if product in self.sources:
            return self.sources[product]["roles"]
        packet = json.loads((COTS / "import-packet.json").read_text())
        candidate = next(item for item in packet["allowed_import_candidates"] if item["product_id"] == product)
        if product == "x60":
            raise ValueError("Quarantined product")
        path = REPO / candidate["path"]
        if sha(path) != candidate["sha256"]:
            raise ValueError("Original COTS source changed: " + product)
        imported = cq.importers.importStep(str(path)).val()
        roles = []
        frames = json.loads((COTS / "attachment-points.json").read_text())["products"]
        source_frame = frames[product]["source_to_attachment"]
        attachment = matrix(source_frame["translation_mm"], source_frame["rotation"])
        for index, body in enumerate(imported.Solids()):
            role = product + "_body_" + str(index)
            roles.append(role)
            self.parts[role] = {"id": role, "category": "cots", "product": product, "bodyIndex": index, "sourcePath": candidate["path"], "sha256": candidate["sha256"], "sourceToAttachment": attachment.tolist(), "sourceFunction": "FIXED_PRESENTATION_INCLUDES_NONSEPARABLE_SHAFT" if product == "x44" and index == 0 else "FIXED_REAR_COVER" if product == "x44" else "UNSPLIT_BEARING_PRESENTATION" if product == "hex_bearing" else "AUTHENTIC_GEAR", "recipe": []}
            self.shapes[role] = body
        self.sources[product] = {"roles": roles, "originalPath": candidate["path"], "sha256": candidate["sha256"], "bytes": path.stat().st_size, "directOriginalImportRequired": True, "occtReexportAllowed": False, "sourceUnits": candidate["source_units"], "sourceToAttachment": attachment.tolist(), "sourceSolidCount": len(roles), "nativePartIds": None}
        return roles

    def cots(self, name, product, origin, group="fixed", orientation=None):
        roles = self.vendor(product)
        attach = np.array(self.sources[product]["sourceToAttachment"])
        placement = matrix(origin, orientation) @ attach
        for index, role in enumerate(roles):
            self.add(name + "_" + str(index), role, group=group)
            self.instances[-1]["matrix"] = placement.tolist()
        if product == "x44":
            self.pair(name + "_0", name + "_1", 1.1, "Unmodified original WCP source-body internal overlap measured 1.013296 mm3; fixed presentation solids, no regenerated interface")
        return [name + "_" + str(index) for index in range(len(roles))]

    def poses(self, angle=0, receiver_lift=0, top_float=None):
        fold = matrix(PIVOT) @ matrix(orientation=rotation((1, 0, 0), angle)) @ matrix(-PIVOT)
        result = {}
        for item in self.instances:
            placement = np.array(item["matrix"])
            if item["group"] == "deploy_motor_output_reference":
                origin = np.array(self.groups[item["group"]]["originMm"])
                placement = matrix(origin) @ matrix(orientation=rotation((1, 0, 0), -3 * angle)) @ matrix(-origin) @ placement
            if item["group"].startswith("pickup"):
                if item["group"].startswith("pickup_top"):
                    displacement = self.controls["topFloat"] if top_float is None else top_float
                    placement[1:3, 3] += np.array([-40., 35.]) / math.hypot(40, 35) * displacement
                placement = fold @ placement
            if item["group"].startswith("receiver"):
                placement[2, 3] += receiver_lift
            result[item["id"]] = located(self.shapes[item["part"]], placement)
        return result


def make_model(controls=None):
    model = Model(controls)
    width = model.controls["mouthWidth"]
    half = width / 2
    model.group("fixed", parent=None, kind="FIXED")
    model.group("pickup", kind="REVOLUTE", origin=PIVOT, limits=[-135, 0])
    model.group("pickup_top", parent="pickup", kind="SLIDER", origin=(0, -359.9, 154.9), axis=(0, -40 / math.hypot(40, 35), 35 / math.hypot(40, 35)), limits=[0, 12])
    model.group("receiver", kind="SLIDER", origin=(0, 560, 447.15), axis=(0, 0, 1), limits=[0, 100])
    model.part("chassis_reference", [rectangular([700, 760, 50], (0, 380, 95))], [rectangular([650, 710, 52], (0, 380, 95))], category="reference")
    model.part("bumper_keepout", [rectangular([870, 930, 120], (0, 380, 105))], [rectangular([700, 760, 122], (0, 380, 105))], category="reference")
    model.add("chassis", "chassis_reference")
    model.add("bumper", "bumper_keepout")
    model.part("bolt_M6x20", [round_stock(3, 20, (-10, 0, 0)), round_stock(5, 6, (3, 0, 0))], material="ISO4762_M6x20_SIMPLIFIED_THREAD_ENVELOPE", process="Purchase; screw thread not modeled")
    model.part("bolt_M6x16", [round_stock(3, 16, (-8, 0, 0)), round_stock(5, 6, (3, 0, 0))], material="GENERIC_M6x16_SIMPLIFIED_THREAD_ENVELOPE_NOT_VENDOR_CAD", process="Purchase; screw thread not modeled")
    model.part("bolt_M6x50", [round_stock(3, 50, (-25, 0, 0)), round_stock(5, 6, (3, 0, 0))], material="ISO4762_M6x50_SIMPLIFIED_THREAD_ENVELOPE", process="Purchase; screw thread not modeled")
    model.part("nut_M6", [hexagon(10, 5)], [round_stock(3.05, 7)], material="ISO4032_M6_SIMPLIFIED", process="Purchase; thread not modeled")
    model.part("washer_M6", [round_stock(6, 1.6)], [round_stock(3.2, 3)], material="ISO7089_M6_SIMPLIFIED", process="Purchase")
    model.part("collar_half_hex", [round_stock(12, 8)], [hexagon(12.75, 10), rectangular([10, 1, 15], (0, 0, 10)), round_stock(2.1, 26, (0, 0, 9), "z")], process="Lathe and mill split clamp; cross tap M4")
    model.part("end_retainer_M5", [round_stock(10, 2), round_stock(2.5, 9, (-5.5, 0, 0))], material="M5_SCREW_AND_RETAINER_DISC_ASSEMBLY", process="Separate washer and M5 screw; threads schematic")
    model.part("bearing_retainer", [round_stock(24, 2)], [round_stock(15.7, 4)] + [round_stock(2.2, 4, (0, 20 * math.cos(math.radians(clock)), 20 * math.sin(math.radians(clock)))) for clock in [0, 120, 240]])
    model.part("M4_retainer_screw", [round_stock(2, 10, (-5, 0, 0)), round_stock(3.5, 4, (2, 0, 0))], material="M4_THREAD_ENVELOPE", process="Purchase")

    def hardware(prefix, origin, group="fixed", orientation=None, long=False, tapped=False):
        orientation = np.eye(3) if orientation is None else orientation
        origin = np.array(origin) + orientation @ [1.6, 0, 0]
        model.add(prefix + "_screw", "bolt_M6x50" if long else "bolt_M6x20", origin, group, orientation)
        if not tapped:
            model.add(prefix + "_nut", "nut_M6", np.array(origin) + orientation @ [-44 if long else -18.6, 0, 0], group, orientation)
        model.add(prefix + "_washer", "washer_M6", np.array(origin) + orientation @ [-0.8, 0, 0], group, orientation)
        model.interfaces.append({"id": prefix, "standard": "M6", "axis": orientation[:, 0].tolist(), "headFaceMm": list(origin), "modeledStackMm": 12.4, "screwLengthMm": 20, "engagementQualification": "PENDING_PHYSICAL_ASSEMBLY"})

    lower = stations()
    plate_add = [strip(first, second, 24) for first, second in zip(lower, lower[1:])]
    plate_add += [round_stock(24, 6, (0, *center)) for center in lower]
    plate_add += [strip(lower[-1], (140, 435), 24), round_stock(28, 6, (0, 140, 435))]
    plate_cuts = [round_stock(14.3375, 8, (0, *center)) for center in lower]
    plate_cuts += [round_stock(2.2, 8, (0, center[0] + 20 * math.cos(math.radians(clock)), center[1] + 20 * math.sin(math.radians(clock)))) for center in lower for clock in [0, 120, 240]]
    plate_cuts += [round_stock(12.6, 8, (0, 140, 435))]
    plate_cuts += [round_stock(4.2, 8, (0, 116.8225, 435))]
    for clock in [45, 135, 225, 315]:
        plate_cuts.append(round_stock(3.3, 8, (0, 140 + 20.5 * math.cos(math.radians(clock)), 435 + 20.5 * math.sin(math.radians(clock)))))
    model.part("pickup_cheek", plate_add, plate_cuts)
    for sign, side in [(-1, "left"), (1, "right")]:
        model.add("pickup_" + side + "_cheek", "pickup_cheek", (sign * half, 0, 0), "pickup", width_factor=sign / 2)

    model.part("roller_tube", [round_stock(19, "mouthWidth - 30")], [round_stock(17, "mouthWidth - 28")], process="TEST_ONLY assumed 38x2 mm tube; drill plug screws; deburr; confirm stock before release")
    model.part("roller_rubber", [round_stock(25, "mouthWidth - 34")], [round_stock(19, "mouthWidth - 32")], material="RUBBER_SLEEVE_GRADE_AND_BOND_PENDING", process="Custom bonded 6 mm sleeve, OD50; qualify hardness, bond and wear")
    model.part("roller_hex_shaft", [hexagon(12.7, width + 76)], [round_stock(2.1, 12, (-half - 33, 0, 0)), round_stock(2.1, 12, (half + 33, 0, 0))], process="Cut exact 1/2-inch hex; face; drill/tap M5 axial ends")
    model.part("roller_end_plug", [round_stock(17, 14)], [hexagon(12.75, 16), round_stock(2.1, 36, (0, 0, 0), "z")], material="MACHINED_POLYMER_GRADE_PENDING", process="Turn OD34 and mill hex; radial M4 cross pin, no unqualified glue-only torque path")
    model.part("roller_cross_pin", [round_stock(2, 40, (0, 0, 0), "z")], material="STEEL_M4_PIN", process="Retained through screw; qualify shaft cross-hole fatigue")
    model.part("chain_sprocket_12t", [round_stock(13.8, 3)], [hexagon(12.75, 5)] + [round_stock(1.7, 5, (0, 12.267 * math.cos(index * math.pi / 6), 12.267 * math.sin(index * math.pi / 6))) for index in range(12)], process="Custom #25 12t sprocket blank; 6.35 mm pitch, tooth form requires cutter qualification; NOT vendor CAD")

    def roller(prefix, center, group_parent="pickup", length_width=True):
        group = prefix + "_rotation"
        model.group(group, parent=group_parent, kind="REVOLUTE", origin=(0, *center))
        model.add(prefix + "_shaft", "roller_hex_shaft", (0, *center), group)
        model.add(prefix + "_tube", "roller_tube", (0, *center), group)
        model.add(prefix + "_rubber", "roller_rubber", (0, *center), group)
        for sign, side in [(-1, "L"), (1, "R")]:
            model.add(prefix + "_plug_" + side, "roller_end_plug", (sign * (half - 22), *center), group)
            model.add(prefix + "_collar_" + side, "collar_half_hex", (sign * (half - 8), *center), group)
            model.add(prefix + "_end_" + side, "end_retainer_M5", (sign * (half + 39), *center), group, np.eye(3) if sign > 0 else rotation((0, 0, 1), 180))
            model.pair(prefix + "_end_" + side, prefix + "_shaft", 70, "M5 male thread envelope into modeled 4.2 mm tap drill, <=9 mm engagement; threads not tessellated")
            orient = AXIS_X if sign > 0 else rotation((0, 0, 1), 180) @ AXIS_X
            model.cots(prefix + "_bearing_" + side, "hex_bearing", (sign * (half + 3), *center), group, orient)
            model.add(prefix + "_retainer_" + side, "bearing_retainer", (sign * (half + 5.6), *center), group_parent)
            for clock in [0, 120, 240]:
                origin = (sign * (half + 7), center[0] + 20 * math.cos(math.radians(clock)), center[1] + 20 * math.sin(math.radians(clock)))
                model.add(prefix + "_retainer_screw_" + side + str(clock), "M4_retainer_screw", origin, group_parent, np.eye(3) if sign > 0 else rotation((0, 0, 1), 180))
        for lane in [14, 22]:
            model.add(prefix + "_sprocket_" + str(lane), "chain_sprocket_12t", (half + lane, *center), group)
        model.relations.append({"id": prefix + "_drive", "type": "CHAIN_SYNCHRONIZATION", "parent": group_parent + "_drive_reference", "child": group, "signedRatio": 1, "physicalPath": "alternating short #25 loops; length and tensioner qualification pending"})

    for index, center in enumerate(lower):
        roller("pickup_roll_" + str(index), center)
    for index, center in enumerate([(195 + 55 * index, 370) for index in range(4)]):
        roller("fixed_roll_" + str(index), center, "fixed")
    fixed_add = [rectangular([6, 205, 45], (0, 277.5, 370))]
    fixed_cut = [round_stock(14.3375, 8, (0, 195 + 55 * index, 370)) for index in range(4)]
    fixed_cut += [round_stock(2.2, 8, (0, 195 + 55 * index + 20 * math.cos(math.radians(clock)), 370 + 20 * math.sin(math.radians(clock)))) for index in range(4) for clock in [0, 120, 240]]
    model.part("fixed_transfer_cheek", fixed_add, fixed_cut)
    for sign in [-1, 1]:
        model.add("fixed_transfer_cheek_" + str(sign), "fixed_transfer_cheek", (sign * half, 0, 0))

    normal = np.array([-40, 35]) / math.hypot(40, 35)
    tangent = np.array([35, 40]) / math.hypot(40, 35)
    def guide_segment(name, first, second, offset, group, width_reduction=50):
        start = np.array(first) + normal * offset
        end = np.array(second) + normal * offset
        section = [list(start), list(end), list(end - normal * 3), list(start - normal * 3)]
        model.part(name, [primitive("polygon", (0, 0, 0), points=section, length="mouthWidth - " + str(width_reduction), start="-(mouthWidth - " + str(width_reduction) + ") / 2", axis="x")], material="POLYCARBONATE_3_MM", process="Flat router-cut segment; no bending; attach to machined edge support strips")
        model.add(name, name, group=group)
    for index in range(8):
        first, second = np.array(lower[index]), np.array(lower[index + 1])
        guide_segment("pickup_lower_guide_" + str(index), first + tangent * 21, second - tangent * 21, 20, "pickup")
    for index in range(4):
        guide_segment("pickup_upper_guide_" + str(index), np.array(lower[2 * index]) + tangent * (10 if index == 0 else 0), np.array(lower[2 * index + 2]), 137.3, "pickup_top")
    floor_center = np.array([lower[0][0] - math.sqrt(77.15 ** 2 - (CORAL_RADIUS - lower[0][1]) ** 2), CORAL_RADIUS])
    upper_center = floor_center + normal * 77.15
    roller("pickup_top_entry", upper_center, "pickup_top")
    float_cuts = [round_stock(14.3375, 8)] + [round_stock(2.2, 8, (0, 20 * math.cos(math.radians(clock)), 20 * math.sin(math.radians(clock)))) for clock in [0, 120, 240]]
    float_cuts += [primitive("capsule", (0, offset, 15), radius=3.3, length=8, second=(-12 * normal).tolist()) for offset in [-32, 32]]
    float_outline = [round_stock(24, 6)]
    for offset in [-32, 32]:
        slot_end = np.array([offset, 15]) - 12 * normal
        float_outline += [strip((0, 0), (offset, 15), 10), strip((offset, 15), slot_end, 8), round_stock(8, 6, (0, *slot_end))]
    model.part("float_carriage", float_outline, float_cuts)
    for sign in [-1, 1]:
        model.add("pickup_float_carriage_" + str(sign), "float_carriage", (sign * half, *upper_center), "pickup_top")
        for offset in [-32, 32]:
            hardware("pickup_float_slide_" + str(sign) + "_" + str(offset), (sign * (half + 3), upper_center[0] + offset, upper_center[1] + 15), "pickup", np.eye(3) if sign > 0 else rotation((0, 0, 1), 180))

    model.part("cross_tube", [rectangular(["mouthWidth - 6", 25, 25])], [rectangular(["mouthWidth - 4", 21, 21])], process="Saw 25x25x2 metric tube; drill ends; bolt machined threaded plugs")
    model.part("cross_tube_plug", [rectangular([20, 20.8, 20.8])], [round_stock(2.5, 22)])
    for index, center in enumerate([(140, 315), (25, 290), (-185, 35)]):
        model.add("pickup_cross_tube_" + str(index), "cross_tube", (0, *center), "pickup")
        for sign in [-1, 1]:
            model.add("pickup_cross_plug_" + str(index) + "_" + str(sign), "cross_tube_plug", (sign * (half - 14), *center), "pickup")
            hardware("pickup_cross_joint_" + str(index) + "_" + str(sign), (sign * (half + 3), *center), "pickup", np.eye(3) if sign > 0 else rotation((0, 0, 1), 180), tapped=True)
            model.pair("pickup_cross_joint_" + str(index) + "_" + str(sign) + "_screw", "pickup_cross_plug_" + str(index) + "_" + str(sign), 120, "M6 thread envelope in 5 mm tapped plug bore; not adhesive torque transfer")

    model.part("pivot_spine", [round_stock(12.5, 56)], [round_stock(8.5, 58)], process="Turn separate 25 mm OD side trunnions; no shaft across coral path; qualify flange torque clamp")
    for sign in [-1, 1]:
        model.add("pickup_trunnion_" + str(sign), "pivot_spine", (sign * (half + 19), 140, 435), "pickup")
    model.part("pivot_hub", [round_stock(25, 8)], [round_stock(12.55, 10)] + [round_stock(2.5, 10, (0, 20.5 * math.cos(math.radians(clock)), 20.5 * math.sin(math.radians(clock)))) for clock in [45, 135, 225, 315]], process="Turn flange; M6 tap four 5 mm drills through 8 mm flange; qualify thread pullout")
    model.part("pivot_bush", [round_stock(17, 8)], [round_stock(12.6, 10)], material="ACETAL_ASSUMED", process="Lathe bushing; qualify bearing pressure and wear")
    tower_add = [rectangular([8, 70, 315], (0, 140, 277.5)), round_stock(28, 8, (0, 140, 435))]
    tower_cut = [round_stock(17.05, 10, (0, 140, 435)), round_stock(26, 10, (0, 99.36, 435)), round_stock(11, 10, (0, 140, 370))] + [round_stock(3.3, 10, (0, longitudinal, height)) for longitudinal in [125, 165] for height in [135, 160]]
    model.part("tower", tower_add, tower_cut)
    model.part("chassis_mount_block", [rectangular([30, 70, 60])], [round_stock(3.3, 32, (0, longitudinal, height)) for longitudinal in [-15, 25] for height in [-15, 10]], process="Saw aluminum bar; drill two-axis M6 patterns; no precision bends")
    for sign in [-1, 1]:
        model.add("tower_" + str(sign), "tower", (sign * (half + 42), 0, 0))
        model.add("pivot_bush_" + str(sign), "pivot_bush", (sign * (half + 42), 140, 435))
        model.add("pickup_hub_" + str(sign), "pivot_hub", (sign * (half - 7), 140, 435), "pickup")
        model.add("chassis_mount_block_" + str(sign), "chassis_mount_block", (sign * (half + 61), 140, 150))
        for clock in [45, 135, 225, 315]:
            prefix = "pickup_hub_joint_" + str(sign) + "_" + str(clock)
            origin = np.array((sign * (half + 4.6), 140 + 20.5 * math.cos(math.radians(clock)), 435 + 20.5 * math.sin(math.radians(clock))))
            orientation = np.eye(3) if sign > 0 else rotation((0, 0, 1), 180)
            model.add(prefix + "_screw", "bolt_M6x16", origin, "pickup", orientation)
            model.add(prefix + "_washer", "washer_M6", origin - orientation @ [0.8, 0, 0], "pickup", orientation)
            model.pair(prefix + "_screw", "pickup_hub_" + str(sign), 70, "M6 screw thread envelope in actual 5 mm tap drill through 8 mm flange; 8 mm modeled thread engagement")
            model.interfaces.append({"id": prefix, "standard": "M6", "screwLengthMm": 16, "clearanceStackMm": 7.6, "threadEngagementMm": 8, "nut": False, "qualification": "TEST_ONLY thread pullout unverified"})
        for longitudinal in [125, 165]:
            for height in [135, 160]:
                hardware("tower_joint_" + str(sign) + "_" + str(longitudinal) + "_" + str(height), (sign * (half + 76), longitudinal, height), orientation=np.eye(3) if sign > 0 else rotation((0, 0, 1), 180), long=True)

    model.part("cradle_floor", [rectangular([width - 50, 330, 6], (0, 560, 387))], [rectangular([34, 65, 8], (location, 620, 387)) for location in [-55, 55]] + [round_stock(20, 8, (sign * 87.15, longitudinal, 387), "z") for sign in [-1, 1] for longitudinal in [400, 540]], material="POLYCARBONATE_6_MM", process="Router flat plate; receiver finger windows and bearing clearances; bolt to four frame standoffs")
    model.add("cradle_floor", "cradle_floor")
    model.part("cradle_stop", [rectangular([125, 6, 80], (0, 720, 430))], [round_stock(3.3, 8, (location, 720, 407), "z") for location in [-45, 45]], material="POLYCARBONATE_6_MM")
    model.add("cradle_stop", "cradle_stop")
    model.part("anti_bounce_finger", [rectangular([15, 60, 3])], [round_stock(2.2, 5, (0, 22, 0), "z")], material="SPRING_POLYCARBONATE_3_MM", process="Flat replaceable finger; deflection and fatigue pending")
    for sign in [-1, 1]:
        model.add("anti_bounce_" + str(sign), "anti_bounce_finger", (sign * 45, 660, 503))
    model.part("sensor_bracket", [rectangular([30, 18, 30])], [round_stock(2.2, 32, (0, -4, 0)), round_stock(2.2, 32, (0, 4, 0)), round_stock(4, 32, (0, 0, 8))], material="PRINTED_POLYMER_PENDING", process="Two M4 mounts; 8 mm optical barrel clearance; exact sensor selection pending")
    for longitudinal in [460, 650]:
        for sign in [-1, 1]:
            model.add("sensor_" + str(longitudinal) + "_" + str(sign), "sensor_bracket", (sign * (half - 15), longitudinal, 432), width_factor=sign / 2)
    model.part("frame_post", [rectangular([25, 25, 264])], [rectangular([21, 21, 266])], process="Saw 25x25x2 tube; drill both end mounting patterns")
    for location in [-half - 55, half + 55]:
        for longitudinal in [300, 700]:
            model.add("frame_post_" + str(location) + "_" + str(longitudinal), "frame_post", (location, longitudinal, 252))

    model.part("orienter_drum", [round_stock(35, 90)], [hexagon(12.75, 92)], material="CUSTOM_POLYURETHANE_OVER_HEX_HUB_PENDING", process="Two separable machined hubs and bonded tire required; compression 5 mm budget, qualify bond")
    model.part("orienter_shaft", [hexagon(12.7, 190)], process="1/2-inch hex; face and tap M5 ends")
    model.part("orienter_deck", [rectangular([120, 190, 8])], [round_stock(14.3375, 10, (0, offset, 0), "z") for offset in [-85, 55]], process="Router plate; finish bearing bores and M6 chassis mounts")
    for sign in [-1, 1]:
        for index, longitudinal in enumerate([400, 540]):
            location = sign * 87.15
            group = "orienter_" + str(sign) + "_" + str(index)
            model.group(group, kind="REVOLUTE", origin=(location, longitudinal, 447.15), axis=(0, 0, 1))
            orientation = rotation((0, 1, 0), -90)
            model.add(group + "_drum", "orienter_drum", (location, longitudinal, 447.15), group, orientation)
            model.add(group + "_shaft", "orienter_shaft", (location, longitudinal, 462), group, orientation)
            for level in [384, 528]:
                model.cots(group + "_bearing_" + str(level), "hex_bearing", (location, longitudinal, level), group, rotation((0, 0, 1), 90))
            model.add(group + "_collar", "collar_half_hex", (location, longitudinal, 539), group, orientation)
            model.relations.append({"id": group + "_drive", "type": "CHAIN_SYNCHRONIZATION", "signedRatio": 1, "parent": "orienter_" + str(sign) + "_motor_output_reference", "child": group})
        for level in [380, 524]:
            model.add("orienter_deck_" + str(sign) + "_" + str(level), "orienter_deck", (sign * 87.15, 485, level))

    model.part("motor_mount", [rectangular([6, 64, 64])], [round_stock(9.575, 8)] + [round_stock(2.75, 8, (0, 17.4625 * math.cos(math.radians(clock)), 17.4625 * math.sin(math.radians(clock)))) for clock in [0, 120, 240]], process="Router; finish 19.15 pilot; exact 34.925 mm BCD; #10-32 screws, <=6.35 mm thread depth")
    model.part("deployment_motor_mount", [rectangular([6, 64, 64])], [round_stock(9.575, 8), round_stock(27, 8, (0, 20.32, -40.64 * math.sin(math.pi / 3)))] + [round_stock(2.75, 8, (0, 17.4625 * math.cos(math.radians(clock)), 17.4625 * math.sin(math.radians(clock)))) for clock in [0, 120, 240]], process="Router output relief; motor clocked 60 degrees; retain exact pilot and three #10-32 mounting interfaces")
    model.part("motor_screw_10_32", [round_stock(2.413, 9.525, (-4.7625, 0, 0)), round_stock(3.9, 4.6, (2.3, 0, 0))], material="10_32_UNF_3_8_IN_THREAD_ENVELOPE", process="Purchase; 3.525 mm engagement after 6 mm plate, verify washer stack")
    for prefix, origin, group, output_origin in [
        ("deploy_motor", (-half - 12, 99.36, 435), "fixed", (-half + 19, 140, 435)),
        ("pickup_motor", (half + 3, 100, 275), "pickup", (half + 21, 100, 315.64)),
        ("orienter_left_motor", (-127.79, 650, 560), "fixed", (-87.15, 650, 578)),
        ("orienter_right_motor", (127.79, 650, 560), "fixed", (87.15, 650, 578)),
    ]:
        vertical = prefix.startswith("orienter")
        orientation = np.eye(3) if vertical else AXIS_X
        if prefix == "deploy_motor":
            orientation = orientation @ rotation((0, 0, 1), 60)
        model.cots(prefix, "x44", origin, group, orientation)
        mount_orientation = np.column_stack([orientation[:, 2], orientation[:, 0], orientation[:, 1]])
        forward = orientation[:, 2]
        mount_origin = np.array(origin) + forward * 3
        model.add(prefix + "_mount", "deployment_motor_mount" if prefix == "deploy_motor" else "motor_mount", mount_origin, group, mount_orientation)
        for clock in [0, 120, 240]:
            bolt_origin = np.array(origin) + forward * 6 + orientation @ [17.4625 * math.cos(math.radians(clock)), 17.4625 * math.sin(math.radians(clock)), 0]
            bolt_orientation = np.column_stack([forward, orientation[:, 0], orientation[:, 1]])
            model.add(prefix + "_screw_" + str(clock), "motor_screw_10_32", bolt_origin, group, bolt_orientation)
            model.pair(prefix + "_screw_" + str(clock), prefix + "_0", 30, "Exact #10-32 3/8-inch screw thread envelope in original blind tap-drill; modeled engagement 3.525 mm, physical qualification pending")
        drive_group = ("pickup_" if group == "pickup" else "") + prefix + "_output_reference"
        model.group(drive_group, parent=group, kind="REVOLUTE", origin=origin, axis=forward)
        pinion = model.cots(prefix + "_pinion", "spline_pinion", np.array(origin) + forward * (31 if prefix == "deploy_motor" else 18), drive_group, orientation @ rotation((0, 0, 1), 30))
        gear = model.cots(prefix + "_gear", "hex_output_gear", output_origin, "pickup" if prefix == "deploy_motor" else drive_group, orientation @ rotation((0, 0, 1), -48.8 if prefix == "deploy_motor" else 31.2))
        model.pair(pinion[0], prefix + "_0", 1, "Spline tooth contact only; 1 mm3 limit, not blanket motor overlap; joint representation distinct from fixed motor source")
        model.pair(pinion[0], gear[0], 0.05, "Authentic 16:48 mesh, 40.64 mm pitch center; phase/backlash must pass actual geometry")
        model.relations.append({"id": prefix + "_reduction", "type": "GEAR", "signedRatio": -3, "input": drive_group, "output": "pickup" if prefix == "deploy_motor" else prefix + "_driven_shaft", "loadCapacity": "UNVERIFIED_NOT_THERMAL_OR_POWER_PASS"})

    model.part("receiver_bridge_reference", [rectangular([190, 35, 16], (0, 0, 100)), rectangular([16, 35, 130], (-87, 0, 43)), rectangular([16, 35, 130], (87, 0, 43))], category="reference", material="ROUGH_RECEIVER_CLEARANCE_TOOL")
    model.add("receiver_bridge", "receiver_bridge_reference", (0, 620, model.controls["receiverHeight"]), "receiver", height_factor=1)
    model.part("receiver_finger_reference", [rectangular([12, 30, 30])], category="reference")
    for sign in [-1, 1]:
        model.add("receiver_finger_" + str(sign), "receiver_finger_reference", (sign * 55, 620, model.controls["receiverHeight"] - 51), "receiver", height_factor=1)
    model.part("coral_reference", [round_stock(CORAL_RADIUS, CORAL_LENGTH)], [round_stock(50.8, CORAL_LENGTH + 2)], material="NOMINAL_CORAL_REFERENCE", category="reference")
    return model


if __name__ == "__main__":
    model = make_model()
    checks = {name: solid_check(shape) for name, shape in model.shapes.items()}
    bad = {name: check for name, check in checks.items() if not check["valid"] or not check["closed"] or check["solids"] != 1}
    HERE.mkdir(exist_ok=True)
    (HERE / "build-check.json").write_text(json.dumps({"badSolids": bad, "parts": len(model.parts), "physicalInstances": len(model.instances), "rigidGroups": len(model.groups), "checks": checks}, indent=2))
    print(json.dumps({"badSolids": list(bad), "parts": len(model.parts), "physicalInstances": len(model.instances), "rigidGroups": len(model.groups)}), flush=True)
    raise SystemExit(bool(bad))