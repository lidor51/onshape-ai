import ast
import json
import math
import operator

from cad_core import ROOT, box, bounds, capsule, cq, cylinder, deploy, hex_prism, polygon, solid_check


OPERATORS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}


def value(expression, controls):
    if isinstance(expression, (int, float)):
        return expression
    if isinstance(expression, list):
        return [value(item, controls) for item in expression]

    def visit(node):
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            return node.value
        if isinstance(node, ast.Name) and node.id in controls:
            return controls[node.id]
        if isinstance(node, ast.BinOp) and type(node.op) in OPERATORS:
            return OPERATORS[type(node.op)](visit(node.left), visit(node.right))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
            return -visit(node.operand)
        raise ValueError("Unsupported parameter expression")

    return visit(ast.parse(expression, mode="eval").body)


def primitive(kind, center, **dimensions):
    return {"kind": kind, "center": list(center), **dimensions}


def rectangular(size, center=(0, 0, 0)):
    return primitive("box", center, size=list(size))


def round_stock(radius, length, center=(0, 0, 0), axis="x"):
    return primitive("cylinder", center, radius=radius, length=length, axis=axis)


def hex_stock(across_flats, length, center=(0, 0, 0), axis="x"):
    return primitive("hex", center, acrossFlats=across_flats, length=length, axis=axis)


def capsule_stock(radius, length, second, center=(0, 0, 0)):
    return primitive("capsule", center, radius=radius, length=length, second=list(second))


def geometry(recipe, controls):
    shape = None
    for operation in recipe:
        description = operation["primitive"]
        center = value(description["center"], controls)
        kind = description["kind"]
        if kind == "box":
            tool = box(value(description["size"], controls), center)
        elif kind == "cylinder":
            tool = cylinder(value(description["radius"], controls), value(description["length"], controls), center, (1, 0, 0) if description["axis"] == "x" else (0, 0, 1))
        elif kind == "hex":
            tool = hex_prism(value(description["acrossFlats"], controls), value(description["length"], controls), center, description["axis"])
        elif kind == "capsule":
            tool = capsule(value(description["radius"], controls), value(description["length"], controls), second=value(description["second"], controls)).translate(center)
        elif kind == "polygon":
            tool = polygon(value(description["points"], controls), value(description["length"], controls), value(description["start"], controls), description["axis"]).translate(center)
        else:
            raise ValueError("Unsupported primitive: " + kind)
        shape = tool if shape is None else shape.fuse(tool) if operation["operation"] == "add" else shape.cut(tool)
    return shape.clean()


def recipe(additions, cuts=()):
    return [{"operation": "add", "primitive": addition} for addition in additions] + [{"operation": "cut", "primitive": cut} for cut in cuts]


def make_design(parameters):
    parts, instances, joints, interfaces, exclusions = {}, [], [], [], []

    def part(name, additions, cuts=(), category="custom", material="ALUMINUM_GRADE_UNSELECTED", notes="", holes=()):
        parts[name] = {"id": name, "category": category, "material": material, "recipe": recipe(additions, cuts), "notes": notes, "holeInterfaces": list(holes), "geometryProvenance": "NOT_VENDOR_GEOMETRY" if category == "cots-envelope" else "LOCAL_PARAMETRIC_CUSTOM" if category == "custom" else "ROUGH_REFERENCE_NOT_MANUFACTURED"}
        return name

    def instance(name, part_id, origin=(0, 0, 0), group="fixed", parent="chassis", joint="FASTENED", rotation=None, joint_origin=None, axis=(1, 0, 0), limits=None):
        instances.append({"id": name, "part": part_id, "originMm": list(origin), "rotation": rotation, "motionGroup": group, "referenceOnly": parts[part_id]["category"] == "reference"})
        if parent is not None:
            joints.append({"id": "mate_" + name, "type": joint, "parent": parent, "child": name, "axisParentGroup": list(axis), "originParentGroupMm": list(joint_origin if joint_origin is not None else origin), "limitsDeg": limits, "frameConvention": "right-handed; joint Z is the stated axis; values are engineering datums, not Onshape REST payloads"})
        return name

    def exclude(first, second, reason):
        exclusions.append({"pair": sorted([first, second]), "reason": reason, "maximumAllowedIntersectionMm3": 1000 if "gear" in reason else 100000})

    def hole(name, center, diameter, axis="x", length=8):
        return {"id": name, "centerMm": list(center), "diameterMm": diameter, "axis": axis, "throughLengthMm": length}

    chassis = parameters["chassisMm"]
    part("chassis_reference", [rectangular([700, 760, 50], [0, 380, 95])], [rectangular([650, 710, 52], [0, 380, 95])], "reference")
    parts["chassis_reference"]["recipe"].extend(recipe([rectangular([660, 25, 50], [0, 100, 95]), rectangular([660, 25, 50], [0, 440, 95]), rectangular([30, 30, 107], [-220, 440, 173.5]), rectangular([30, 30, 107], [220, 440, 173.5]), rectangular([500, 330, 6], [0, 440, 224])]))
    instance("chassis", "chassis_reference", parent=None)
    padding = parameters["bumperMm"]
    height = padding["top"] - padding["bottom"]
    part("bumper_keepout", [rectangular([870, 930, height])], [rectangular([700, 760, height + 2])], "reference", "FULL_BUMPER_KEEP_OUT_NO_NOTCH")
    instance("bumper", "bumper_keepout", [0, 380, (padding["top"] + padding["bottom"]) / 2])
    part("receiver_reference", [rectangular([320, 30, 20], [0, 0, "receiverHeight - 110"]), rectangular([20, 30, "receiverHeight - 110"], [-150, 0, "(receiverHeight - 110) / 2"]), rectangular([20, 30, "receiverHeight - 110"], [150, 0, "(receiverHeight - 110) / 2"])], category="reference", notes="Rough open fork, not a modeled capture actuator; height control changes fork geometry and placement, independently of mouthWidth.")
    instance("receiver", "receiver_reference", [0, 440, "receiverHeight + 85"])
    part("coral_reference", [round_stock(57.15, 301.625)], [round_stock(50.8, 303.625)], "reference", "NOMINAL_PVC_NOT_MEASURED")
    instance("held_coral", "coral_reference", [0, 440, 320], rotation={"axis": [0, 0, 1], "angleDeg": 90})
    deck_holes = [hole("mount_" + str(index), [side, longitudinal, 0], 6.6, "z", 6) for index, (side, longitudinal) in enumerate([(-220, -150), (-220, 150), (220, -150), (220, 150)])]
    deck_holes.extend([hole("shaft_clearance_left", [-88, 0, 0], 14.9, "z", 6), hole("shaft_clearance_right", [88, 0, 0], 14.9, "z", 6)])
    part("stage_deck", [rectangular([500, 380, 6])], [round_stock(entry["diameterMm"] / 2, 8, entry["centerMm"], "z") for entry in deck_holes], holes=deck_holes)
    instance("stage_deck", "stage_deck", [0, 440, 230])
    cradle_profile = [[-50, -87], [50, -87], [50, -30.822305], [0, -80.822305], [-50, -30.822305]]
    cradle = primitive("polygon", [0, 0, 0], points=cradle_profile, length=330, start=-165, axis="x")
    part("cradle", [cradle], material="MACHINED_POLYMER_STOCK_UNSELECTED", notes="Straight V trough, nominal tangent contact; router stock/travel and split construction require review.")
    instance("cradle", "cradle", [0, 440, 320], parent="stage_deck", rotation={"axis": [0, 0, 1], "angleDeg": -90})
    ramp_additions = [primitive("polygon", [0, 0, 0], points=[[145, 385], [270, 250], [273, 253], [148, 388]], length=390, start=-195, axis="x")]
    for transverse in [-170, 170]:
        ramp_additions.extend([rectangular([8, 8, 22], [transverse, 271, 244]), rectangular([30, 50, 6], [transverse, 292, 236])])
    part("transfer_ramp", ramp_additions, material="FLAT_POLYCARBONATE_RAMP_RIGID_MODULE", notes="Inclined flat plate on two attached foot blocks; no sheet bending. Foot joining hardware omitted. Gravity transition and dynamic coral transfer unverified.")
    instance("transfer_ramp", "transfer_ramp", parent="stage_deck")

    bearing = part("hex_bearing_envelope", [round_stock(14.2875, 7.9502)], [hex_stock(12.7, 10)], "cots-envelope", "BEARING_ENVELOPE", "WCP-0783 nominal body only. Flange/races/loads pending. Whole envelope follows inner hex; circular OD does not imply race locking.")
    motor_additions = [round_stock(23.7, 75, [37.5, 0, 0]), round_stock(9.525, 2, [-1, 0, 0]), round_stock(4, 22, [-11, 0, 0])]
    motor = part("x44_envelope", motor_additions, category="cots-envelope", material="MOTOR_ENVELOPE", notes="WCP-0941 body 47.4 x 75; 8 mm cylindrical spline envelope. Shaft extension assumed 22 mm; catalog drawing confirmation required.")
    pinion = part("pinion_16_envelope", [round_stock(11.43, 8)], [round_stock(4.05, 10)], "cots-envelope", "STEEL_GEAR_ENVELOPE", "16 teeth, 20 DP, 14.5 deg; teeth omitted, addendum envelope. Assumed face width 8 mm, NOT vendor gear geometry.")
    output_gear = part("gear_48_envelope", [round_stock(31.75, 8)], [hex_stock(12.7, 10)], "cots-envelope", "GEAR_ENVELOPE", "48 teeth, 20 DP, 14.5 deg. Simplified solid addendum envelope; actual WCP width/retention pending.")
    shaft = part("orienter_hex_shaft", [hex_stock(12.7, 194)], notes="1/2 inch AF native interface; collars/axial retention in omitted hardware BOM.")
    roller = part("orienter_contact_drum", [round_stock(35, 144)], [hex_stock(12.7, 146)], material="CUSTOM_ELASTOMER_CONTACT_DRUM", notes="Custom 70 mm OD contact drum, not AndyMark am-3462. Tire compliance/friction and hub construction unverified.")
    housing_holes = [hole("lower_bearing", [0, 0, 0], 28.675, "z", 8), hole("upper_bearing", [0, 0, 160], 28.675, "z", 8), hole("motor_pilot", [0, 40.64, 187], 19.15, "z", 6)]
    housing_cuts = [round_stock(14.3375, 174, [0, 0, 80], "z"), round_stock(9.575, 8, [0, 40.64, 187], "z")]
    for clock in [0, 120, 240]:
        center = [17.4625 * math.cos(math.radians(clock)), 40.64 + 17.4625 * math.sin(math.radians(clock)), 187]
        housing_cuts.append(round_stock(2.75, 8, center, "z"))
        housing_holes.append(hole("motor_bolt_" + str(clock), center, 5.5, "z", 6))
    housing = part("orienter_housing", [rectangular([60, 140, 8], [0, 35, 0]), rectangular([74, 140, 8], [0, 35, 160]), rectangular([60, 8, 168], [0, 101, 80]), rectangular([48, 8, 31], [0, 65, 173.5]), rectangular([48, 48, 6], [0, 40.64, 187]), rectangular([3, 140, 28], [-35.5, 35, 174]), rectangular([3, 140, 28], [35.5, 35, 174])], housing_cuts, material="PRINTED_HOUSING_MATERIAL_UNSELECTED", notes="One printable U support plus open-bottom gear side guards; no precision bend. Motor clocking and top access guard still require vendor and safety review.", holes=housing_holes)
    for side, location_x in [("left", -88), ("right", 88)]:
        prefix = "orienter_" + side
        instance(prefix + "_housing", housing, [location_x, 440, 242], parent="stage_deck")
        instance(prefix + "_shaft", shaft, [location_x, 440, 329], prefix, prefix + "_housing", "REVOLUTE", {"axis": [0, 1, 0], "angleDeg": -90}, [location_x, 440, 242], (0, 0, 1))
        instance(prefix + "_drum", roller, [location_x, 440, 322], prefix, prefix + "_shaft", rotation={"axis": [0, 1, 0], "angleDeg": -90})
        instance(prefix + "_gear", output_gear, [location_x, 440, 418], prefix, prefix + "_shaft", rotation={"axis": [0, 1, 0], "angleDeg": -90})
        for suffix, elevation in [("lower", 242), ("upper", 402)]:
            instance(prefix + "_bearing_" + suffix, bearing, [location_x, 440, elevation], prefix, prefix + "_shaft", rotation={"axis": [0, 1, 0], "angleDeg": -90})
        instance(prefix + "_motor", motor, [location_x, 480.64, 432], parent=prefix + "_housing", rotation={"axis": [0, 1, 0], "angleDeg": -90})
        instance(prefix + "_pinion", pinion, [location_x, 480.64, 418], prefix + "_input", prefix + "_housing", "REVOLUTE", {"axis": [0, 1, 0], "angleDeg": -90}, [location_x, 480.64, 418], (0, 0, 1))
        exclude(prefix + "_pinion", prefix + "_gear", "Designed gear addendum-envelope overlap at 40.64 mm pitch centers; not tooth contact validation")
        exclude(prefix + "_drum", "held_coral", "Intentional nominal compliant contact; physical compression/traction NOT PROVEN")

    lower = parameters["lowerDrumLocalMm"]
    side_holes = [hole("upper_bearing", [0, 0, 0], 28.675), hole("lower_bearing", [0, lower[1], lower[2]], 28.675)]
    side_cuts = [round_stock(14.3375, 10), round_stock(14.3375, 10, lower)]
    left_plate = part("pickup_left_plate", [capsule_stock(21, 8, lower[1:])], list(side_cuts), holes=list(side_holes))
    side_add = [capsule_stock(21, 8, lower[1:]), capsule_stock(24, 8, [71.12, 0])]
    for clock in [0, 60, -60]:
        center = [0, 71.12 + 17.4625 * math.cos(math.radians(clock)), 17.4625 * math.sin(math.radians(clock))]
        side_add.append(round_stock(4.5, 21, [-14.5, center[1], center[2]]))
        side_cuts.append(round_stock(2.75, 62, center))
        side_holes.append(hole("motor_bolt_" + str(clock), center, 5.5))
    side_cuts.append(round_stock(9.575, 10, [0, 71.12, 0]))
    side_holes.append(hole("motor_pilot", [0, 71.12, 0], 19.15))
    for clock in [45, 135, 225, 315]:
        center = [0, 17 * math.cos(math.radians(clock)), 17 * math.sin(math.radians(clock))]
        side_cuts.append(round_stock(2.2, 10, center))
        side_holes.append(hole("deploy_hub_bolt_" + str(clock), center, 4.4))
    side_plate = part("pickup_side_plate", side_add, side_cuts, holes=side_holes)
    instance("pickup_left", left_plate, ["-mouthWidth / 2 - 6", 0, 0], "pickup", "pivot_spine", "REVOLUTE", joint_origin=[0, 0, 0], limits=[-145, 0])
    instance("pickup_right", side_plate, ["mouthWidth / 2 + 6", 0, 0], "pickup", "pickup_left")
    part("pickup_cross_tube", [rectangular(["mouthWidth + 4", 20, 20])], [rectangular(["mouthWidth + 6", 16, 16])], notes="20 x 20 x 2 metric tube; end fasteners omitted, end holes pending.")
    instance("pickup_cross_tube", "pickup_cross_tube", [0, -170, -187], "pickup", "pickup_left")
    part("pivot_spine", [hex_stock(12.7, 612)], notes="Fixed 1/2 inch hex spine supports independent frame and upper-drum bearings; separate frame/drum outer races.")
    instance("pivot_spine", "pivot_spine", parameters["pivotOriginMm"], parent="tower_left")
    for side, sign in [("left", -1), ("right", 1)]:
        instance("frame_bearing_" + side, bearing, [f"{sign} * (mouthWidth / 2 + 6)", 100, 410], parent="pivot_spine")
        instance("upper_drum_bearing_" + side, bearing, [f"{sign} * (mouthWidth / 2 - 19)", 100, 410], parent="pivot_spine")
        instance("lower_drum_bearing_" + side, bearing, [f"{sign} * (mouthWidth / 2 + 6)", lower[1], lower[2]], "pickup", "lower_shaft")
    part("lower_hex_shaft", [hex_stock(12.7, "mouthWidth + 28")])
    instance("lower_shaft", "lower_hex_shaft", lower, "pickup", "pickup_left", "REVOLUTE", joint_origin=lower)
    part("upper_pickup_drum", [round_stock(27, "mouthWidth - 30")], [round_stock(14.3375, "mouthWidth - 28")], material="TUBE_RUBBER_ASSEMBLY", notes="Continuous bored tube with end bearing seats. Rubber/hub retention and stiffness pending.")
    instance("upper_pickup_drum", "upper_pickup_drum", group="pickup", parent="pickup_left", joint="REVOLUTE", joint_origin=[0, 0, 0])
    part("lower_pickup_drum", [round_stock(27, "mouthWidth - 30")], [hex_stock(12.7, "mouthWidth - 28")], material="TUBE_RUBBER_ASSEMBLY", notes="Hex-driven lower drum and end hubs treated as one rigid custom part; detailed hub build pending.")
    instance("lower_pickup_drum", "lower_pickup_drum", lower, "pickup", "lower_shaft")
    part("pickup_belt", [capsule_stock(30, "mouthWidth - 60", lower[1:])], [capsule_stock(27, "mouthWidth - 58", lower[1:])], material="BELT_ENVELOPE_NOT_VENDOR", notes="Actual closed 3 mm belt envelope with two tangent spans and wrap. Flexible belt represented fixed for clearance only, not a rigid native transmission simulation.")
    instance("pickup_belt", "pickup_belt", group="pickup", parent="pickup_left")
    instance("pickup_motor", motor, ["mouthWidth / 2 - 19", 71.12, 0], "pickup", "pickup_right", rotation={"axis": [0, 0, 1], "angleDeg": 180})
    instance("pickup_pinion", pinion, ["mouthWidth / 2 - 5", 71.12, 0], "pickup_input", "pickup_right", "REVOLUTE", joint_origin=["mouthWidth / 2 - 5", 71.12, 0])
    part("pickup_output_gear", [round_stock(62.23, 8), round_stock(20, 10, [-5, 0, 0])], [round_stock(14.4, 20)], notes="Custom 96t gear with bearing-clearance hub; 6:1 reduction, teeth simplified to addendum envelope. Bolted drum flange retention pending.")
    instance("pickup_output_gear", "pickup_output_gear", ["mouthWidth / 2 - 5", 0, 0], "pickup", "upper_pickup_drum")
    exclude("pickup_pinion", "pickup_output_gear", "Designed gear addendum-envelope overlap at 71.12 mm pitch centers; not tooth contact validation")
    part("pickup_gear_guard", [round_stock(67, 13), round_stock(17, 13, [0, 71.12, 0])], [round_stock(65, 15), round_stock(15, 15, [0, 71.12, 0])], material="POLYCARBONATE_GUARD", notes="Contoured radial guard ring, side plate closes one face; removable outboard cover and finger access review still required.")
    instance("pickup_gear_guard", "pickup_gear_guard", ["mouthWidth / 2 - 8.5", 0, 0], "pickup", "pickup_right")
    tower_holes = [hole("fixed_hex_spine_clearance", [0, 0, 0], 14.9, length=12)]
    tower = part("pivot_tower", [rectangular([12, 60, 290], [0, 0, -145]), round_stock(35, 12), rectangular([36, 90, 8], [0, 0, -286])], [round_stock(7.45, 16)], holes=tower_holes, notes="Flat tower with machined/bolted foot represented as a rigid contiguous module; joining and spine clamp hardware pending.")
    instance("tower_left", tower, [-295, 100, 410])
    instance("tower_right", tower, [295, 100, 410])
    reducer = part("deploy_motor_reducer_envelope", [round_stock(23.7, 75, [-72.5, 0, 0]), round_stock(25, 35, [-17.5, 0, 0]), round_stock(4, 16, [8, 0, 0])], category="cots-envelope", material="UNSELECTED_MOTOR_REDUCER_ENVELOPE", notes="X44 plus assumed 8:1 reducer envelope, NOT an authentic selected gearbox. Internal stages/adapter/brake unverified, deployment powertrain gate BLOCKED pending selection.")
    instance("deploy_motor_reducer", reducer, [-271, 171.12, 410], parent="tower_left", rotation={"axis": [0, 0, 1], "angleDeg": 180})
    instance("deploy_pinion", pinion, [-281, 171.12, 410], "deploy_input", "tower_left", "REVOLUTE", joint_origin=[-281, 171.12, 410])
    deploy_gear_cuts = [round_stock(14.4, 50)]
    for clock in [45, 135, 225, 315]:
        deploy_gear_cuts.append(round_stock(2.2, 50, [0, 17 * math.cos(math.radians(clock)), 17 * math.sin(math.radians(clock))]))
    parts[left_plate]["recipe"].extend(recipe([], deploy_gear_cuts[1:]))
    part("deploy_output_gear", [round_stock(62.23, 8), round_stock(20, "281 - (mouthWidth / 2 + 10)", ["(281 - (mouthWidth / 2 + 10)) / 2", 0, 0])], deploy_gear_cuts, notes="Custom 96t output, 20 DP/14.5 deg, 6:1 mesh at 71.12 mm centers; 4 M4 bolt pattern to left carrier. Axial hub shortens under mouth revision.")
    instance("deploy_output_gear", "deploy_output_gear", [-281, 0, 0], "pickup", "pickup_left")
    exclude("deploy_pinion", "deploy_output_gear", "Designed gear addendum-envelope overlap at 71.12 mm pitch centers; not tooth contact validation")
    ratios = [
        {"id": "pickup_6_to_1", "type": "GEAR_RELATION", "driverMate": "mate_pickup_pinion", "drivenMate": "mate_upper_pickup_drum", "outputPerInput": -1 / 6, "carrier": "pickup_left"},
        {"id": "pickup_equal_drums", "type": "BELT_RELATION", "driverMate": "mate_upper_pickup_drum", "drivenMate": "mate_lower_shaft", "outputPerInput": 1, "nativeRelationSupport": "UNVERIFIED; do not substitute static positioning"},
        {"id": "deploy_6_to_1", "type": "GEAR_RELATION", "driverMate": "mate_deploy_pinion", "drivenMate": "mate_pickup_left", "outputPerInput": -1 / 6, "upstreamReducer": {"ratio": 8, "status": "UNSELECTED_ENVELOPE_ONLY"}},
    ]
    for side in ["left", "right"]:
        ratios.append({"id": "orienter_" + side + "_3_to_1", "type": "GEAR_RELATION", "driverMate": "mate_orienter_" + side + "_pinion", "drivenMate": "mate_orienter_" + side + "_shaft", "outputPerInput": -1 / 3})
    return {"schema": "onshape-ai/shared-engineering-contract/1; NOT Onshape REST schema", "parts": parts, "instances": instances, "joints": joints, "relations": ratios, "intentionalContactExclusions": exclusions, "parameters": parameters}


def resolve_model(design, controls, angle=0):
    for name, limit in design["parameters"]["controls"].items():
        candidate = controls[name]
        if type(candidate) not in (int, float) or not math.isfinite(candidate) or not limit["min"] <= candidate <= limit["max"]:
            raise ValueError("Unsafe control: " + name)
    shapes = {name: geometry(part["recipe"], controls) for name, part in design["parts"].items()}
    placed = {}
    for item in design["instances"]:
        shape = shapes[item["part"]]
        if item["rotation"]:
            shape = shape.rotate((0, 0, 0), item["rotation"]["axis"], item["rotation"]["angleDeg"])
        shape = shape.translate(value(item["originMm"], controls))
        if item["motionGroup"] in {"pickup", "pickup_input"}:
            shape = deploy(shape, angle, design["parameters"]["pivotOriginMm"])
        placed[item["id"]] = shape
    return shapes, placed


def main():
    parameters = json.loads((ROOT / "parameters.json").read_text())
    design = make_design(parameters)
    shapes, placed = resolve_model(design, parameters["baseline"])
    results = {name: solid_check(shape) for name, shape in shapes.items()}
    okay = all(result["valid"] and result["closed"] and result["solids"] == 1 and result["volumeMm3"] > 0 for result in results.values())
    (ROOT / "solids-first-check.json").write_text(json.dumps({"status": "PASS" if okay else "FAIL", "parts": results, "instanceCount": len(placed)}, indent=2) + "\n")
    print(json.dumps({"status": "PASS" if okay else "FAIL", "uniqueParts": len(shapes), "instancesIncludingCoral": len(placed), "badParts": [name for name, result in results.items() if not result["valid"] or not result["closed"] or result["solids"] != 1 or result["volumeMm3"] <= 0]}))
    assert okay, "Invalid solids in solids-first-check.json"


if __name__ == "__main__":
    main()