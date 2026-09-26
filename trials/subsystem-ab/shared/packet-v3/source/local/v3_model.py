import copy
import json
from functools import lru_cache

import numpy as np

from cad_core import ROOT, cq, box
from model import geometry, round_stock, value
from package_packet import instance_matrix, rotation_matrix, transform_solid
from v2_model import make_design as make_v2_design
from v3_gears import primitive as gear_primitive
from v3_sources import COTS, PRODUCT_FILES, sha


PACKET = ROOT / "packet-v3"


def source_bindings():
    inspection = json.loads((PACKET / "source-inspection.json").read_text())["sources"]
    frames = json.loads((COTS / "attachment-points.json").read_text())["products"]
    axis_map = np.array([[0., 0., 1.], [1., 0., 0.], [0., 1., 0.]])
    result = {}
    for product, filename in PRODUCT_FILES.items():
        source = inspection[product]
        if sha(COTS / "cache" / filename) != source["sha256"]:
            raise ValueError("Frozen source changed")
        attachment = np.eye(4)
        if product in frames:
            attachment[:3, :3] = frames[product]["source_to_attachment"]["rotation"]
            attachment[:3, 3] = frames[product]["source_to_attachment"]["translation_mm"]
        else:
            attachment[2, 3] = -6.35
        neutral = np.eye(4)
        neutral[:3, :3] = axis_map
        if product in {"hex_bearing", "hex_output_gear", "wheel"}:
            neutral[:3, :3] = rotation_matrix([1, 0, 0], 30) @ axis_map
        if product == "x44":
            neutral[:3, :3] = np.array([[0., 0., -1.], [1., 0., 0.], [0., -1., 0.]])
        for body in source["bodies"]:
            role = "cots_" + product + ("_main" if body["index"] == 0 else "_rear_cover") if product == "x44" else "cots_" + product
            result[role] = {"product": product, "sourceFile": "trials/subsystem-ab/cots/cache/" + filename, "sha256": source["sha256"], "sourceBodyIndex": body["index"], "sourceBodySignature": body, "sourceToAttachmentRowMajorMm": attachment.tolist(), "attachmentToNeutralRowMajorMm": neutral.tolist(), "sourceToNeutralRowMajorMm": (neutral @ attachment).tolist(), "sourceUnits": "inch", "importedUnits": "mm", "scaleAfterImport": 1, "nativePartId": None, "nativeConnectorIds": None, "sourceFunction": "FIXED_VENDOR_PRESENTATION_BODY_CONTAINS_HOUSING_AND_SHAFT_NOT_SEPARABLE_ROTOR" if role == "cots_x44_main" else "FIXED_REAR_COVER_NOT_ROTOR" if role == "cots_x44_rear_cover" else "RACE_UNSPLIT_HEX_BEARING_PRESENTATION" if product == "hex_bearing" else "ROTATING_DRIVEN_MEMBER"}
    main = result["cots_x44_main"]
    main["derivedPartition"] = {"axisSource": "z", "planeMm": 5.55625, "keep": "below", "operation": "INTERSECT_HALFSPACE_NO_GEOMETRY_REGENERATION"}
    main["sourceFunction"] = "FIXED_HOUSING_AND_CIRCULAR_PILOT_FRAGMENT_OF_SOURCE_BODY_0"
    shaft = copy.deepcopy(main)
    shaft["derivedPartition"]["keep"] = "above"
    shaft["sourceFunction"] = "ROTATING_EXPOSED_SPLINE_FRAGMENT_OF_SOURCE_BODY_0_NOT_INTERNAL_ROTOR_MODEL"
    result["cots_x44_shaft"] = shaft
    return result


def make_design(parameters=None):
    parameters = copy.deepcopy(parameters or json.loads((ROOT / "parameters.json").read_text()))
    parameters["packetVersion"] = "concept-a-local-v3"
    parameters["assumptions"] = ["Authentic COTS bytes retained. X44 body 0 partitioned at measured spline shoulder into housing and exposed shaft; body 1 remains the rear cover.", "Discrete deployment and tooth-phase clearance only; continuous dynamics, physical grip and manufacture remain UNVERIFIED."]
    design = make_v2_design(parameters)
    design["parameters"]["packetVersion"] = "concept-a-local-v3"
    parts = design["parts"]
    bindings = source_bindings()
    replacements = {"x44_envelope": "cots_x44_main", "hex_bearing_envelope": "cots_hex_bearing", "pinion_16_envelope": "cots_spline_pinion", "gear_48_envelope": "cots_hex_output_gear", "orienter_contact_drum": "cots_wheel"}
    for old in replacements:
        parts.pop(old)
    for role, binding in bindings.items():
        parts[role] = {"id": role, "category": "cots", "geometryProvenance": "AUTHENTIC_HASH_BOUND_VENDOR_STEP", "recipe": [], "holeInterfaces": [], "material": "VENDOR_SOURCE_UNMODIFIED", "notes": binding["sourceFunction"], "sourceBinding": binding}
        if binding.get("derivedPartition"):
            parts[role].update(geometryProvenance="DERIVED_PARTITION_OF_AUTHENTIC_VENDOR_STEP", material="VENDOR_GEOMETRY_PARTITIONED_NOT_ORIGINAL_PART_HIERARCHY")
    for role in ["pickup_output_gear", "deploy_output_gear"]:
        parts[role]["recipe"][0]["primitive"] = gear_primitive(96, phase=0 if role == "pickup_output_gear" else 1.875)
        parts[role]["notes"] = "Complete CQ_Gears 96-tooth profile including root return, discretized from the pinned library; strength, tolerances, cutting process and axial retention UNVERIFIED. Not an addendum disk."
    parts["deploy_compound_shaft_module"]["recipe"][1]["primitive"] = gear_primitive(128, center=(-37, 0, 0), phase=0.5859375)
    parts["deploy_compound_shaft_module"]["recipe"][2]["primitive"] = gear_primitive(16)
    parts["deploy_compound_shaft_module"]["notes"] = "Complete 128t and 16t CQ_Gears profiles joined to the original hex shaft as a rigid module. This is multiple fabricated items, not monolithic stock. 16t/14.5 degree root undercut and manufacture UNVERIFIED."
    for operation in parts["pickup_side_plate"]["recipe"]:
        primitive = operation["primitive"]
        if primitive["kind"] == "cylinder" and primitive["radius"] == 4.5:
            primitive.update(length=27, center=[-17.5, *primitive["center"][1:]])
    for operation in parts["pickup_gear_guard"]["recipe"]:
        operation["primitive"]["length"] = 24 if operation["operation"] == "add" else 26
    for operation in parts["orienter_housing"]["recipe"]:
        primitive = operation["primitive"]
        if primitive["center"][2] == 187:
            primitive["center"][2] = 191
        if primitive.get("size") == [60, 8, 168]:
            primitive["size"][0] = 44
    parts["orienter_housing"]["recipe"].append({"operation": "cut", "primitive": round_stock(5, 10, [0, 40.64, 160], "z")})
    parts["orienter_housing"]["holeInterfaces"].append({"id": "motor_tip_clearance", "centerMm": [0, 40.64, 160], "diameterMm": 10, "axis": "z", "throughLengthMm": 8})
    for role in ["pickup_output_gear", "deploy_output_gear"]:
        for operation in parts[role]["recipe"]:
            if operation["operation"] == "cut" and operation["primitive"].get("radius") == 14.4:
                operation["primitive"]["radius"] = 15.65
    for hole in parts["orienter_housing"]["holeInterfaces"]:
        if hole["centerMm"][2] == 187:
            hole["centerMm"][2] = 191
    for operation in parts["stage_deck"]["recipe"]:
        center = operation["primitive"]["center"]
        if abs(center[0]) == 88:
            center[0] = 82.55 if center[0] > 0 else -82.55
    for hole in parts["stage_deck"]["holeInterfaces"]:
        if abs(hole["centerMm"][0]) == 88:
            hole["centerMm"][0] = 82.55 if hole["centerMm"][0] > 0 else -82.55
    support = parts["deploy_support_module"]
    support["notes"] = "Generated flat tower and two 6 mm gearbox cheeks at world X=-333/-303, connected by explicit spacer/bridge geometry. Bearing attachment planes X=-336/-300 (36 mm apart), compound shaft at Y=171.12,Z=410, motor mount X=-300,Y=262.56,Z=410. Joining fasteners, materials, bearing fit and load capacity UNVERIFIED; not vendor hardware or monolithic stock."
    for operation in support["recipe"]:
        primitive = operation["primitive"]
        if primitive["center"][0] == -12:
            primitive["center"][0] = -8
        if primitive["kind"] == "cylinder" and primitive["radius"] == 3:
            primitive["length"] = 26
            primitive["center"][0] = -23
    support["recipe"].append({"operation": "cut", "primitive": round_stock(5, 8, [-38, 162.56, 0])})
    for hole in support["holeInterfaces"]:
        if hole["centerMm"][0] == -12:
            hole["centerMm"][0] = -8
    support["holeInterfaces"].append({"id": "motor_shaft_outboard_clearance", "centerMm": [-38, 162.56, 0], "diameterMm": 10, "axis": "x", "throughLengthMm": 6})
    additional = []
    for item in design["instances"]:
        old = item["part"]
        item["part"] = replacements.get(old, old)
        name = item["id"]
        if name.startswith("orienter_"):
            item["originMm"][0] = -82.55 if "left" in name else 82.55
            if name.endswith("_motor"):
                item["originMm"][2] = 436
            if name.endswith("_drum"):
                item["originMm"][2] = 320
            if name.endswith("_bearing_lower"):
                item["originMm"][2] = 238
                item["neutralFlip"] = True
            if name.endswith("_bearing_upper"):
                item["originMm"][2] = 406
            if name.endswith(("_shaft", "_drum", "_gear", "_bearing_lower", "_bearing_upper")):
                item["phaseDeg"] = 2.1875 if item.get("neutralFlip") else -2.1875
            if name.endswith("_pinion"):
                item["phaseDeg"] = 17.8125
        if name == "pickup_motor":
            item["originMm"][0] = "mouthWidth / 2 - 25"
        if name == "pickup_pinion":
            item["originMm"][0] = "mouthWidth / 2 - 9"
        if name == "pickup_gear_guard":
            item["originMm"][0] = "mouthWidth / 2 - 11"
        if name.startswith(("frame_bearing_", "lower_drum_bearing_", "upper_drum_bearing_")):
            left = name.endswith("left")
            distance = "mouthWidth / 2 - 15" if name.startswith("upper_drum") else "mouthWidth / 2 + 10"
            item["originMm"][0] = "-(" + distance + ")" if left else distance
            item["neutralFlip"] = left
        if name == "deploy_motor":
            item["originMm"][0] = -300
        if name == "deploy_motor_pinion":
            item["phaseDeg"] = 17.8125
        if name == "deploy_bearing_inboard":
            item["originMm"][0] = -300
        if name == "deploy_bearing_outboard":
            item["originMm"][0] = -336
            item["neutralFlip"] = True
        if item["part"] == "cots_x44_main":
            cover = copy.deepcopy(item)
            cover.update(id=name + "_rear_cover", part="cots_x44_rear_cover")
            additional.append(cover)
            design["joints"].append({"id": "mate_" + cover["id"], "type": "FASTENED", "parent": name, "child": cover["id"], "axisParentGroup": [1, 0, 0], "originParentGroupMm": item["originMm"], "limitsDeg": None})
            shaft = copy.deepcopy(item)
            shaft.update(id=name + "_shaft", part="cots_x44_shaft", shaftDriver=name.replace("_motor", "_pinion") if name != "deploy_motor" else "deploy_motor_pinion")
            if name == "pickup_motor":
                shaft["phaseDeg"] = -6
            additional.append(shaft)
            design["joints"].append({"id": "mate_" + shaft["id"], "type": "FASTENED", "parent": shaft["shaftDriver"], "child": shaft["id"], "axisParentGroup": [1, 0, 0], "originParentGroupMm": item["originMm"], "limitsDeg": None})
    design["instances"].extend(additional)
    records = {item["id"]: item for item in design["instances"]}
    for joint in design["joints"]:
        item = records[joint["child"]]
        if "pinion" in item["id"] or item["id"].startswith("orienter_"):
            joint["originParentGroupMm"] = list(item["originMm"])
    design["intentionalContactExclusions"] = []
    design["declaredPressInterfaces"] = [{"pair": sorted(["orienter_" + side + "_drum", "orienter_" + side + "_shaft"]), "maximumAllowedIntersectionMm3": 510, "reason": "Measured molded wheel hex AF 10.795 mm versus 12.7 mm shaft. Explicit wheel-only press interface; elastic fit, assembly force and hub life UNVERIFIED."} for side in ["left", "right"]]
    design["cotsBindings"] = bindings
    return design


@lru_cache(maxsize=None)
def imported_product(product):
    return cq.importers.importStep(str(COTS / "cache" / PRODUCT_FILES[product])).val()


@lru_cache(maxsize=None)
def source_body(role):
    binding = source_bindings()[role]
    shape = imported_product(binding["product"]).Solids()[binding["sourceBodyIndex"]]
    if binding.get("derivedPartition"):
        upper = binding["derivedPartition"]["keep"] == "above"
        plane = binding["derivedPartition"]["planeMm"]
        shape = shape.intersect(box([200, 200, 200], [0, 0, plane + (100 if upper else -100)]))
    return transform_solid(shape, np.array(binding["sourceToNeutralRowMajorMm"]))


def neutral_shapes(design, controls):
    return {role: source_body(role) if part["category"] == "cots" else geometry(part["recipe"], controls) for role, part in design["parts"].items()}


def pose_matrix(item, controls, angle, pivot, drive_phases=None):
    matrix = instance_matrix(item, controls, angle, pivot)
    local = np.eye(4)
    if item.get("neutralFlip"):
        local[:3, :3] = rotation_matrix([0, 1, 0], 180)
    if item.get("phaseDeg"):
        local[:3, :3] = local[:3, :3] @ rotation_matrix([1, 0, 0], item["phaseDeg"])
    spin = -6 * angle if item["id"] in {"deploy_pinion", "deploy_bearing_inboard", "deploy_bearing_outboard"} else 48 * angle if item["id"] in {"deploy_motor_pinion", "deploy_motor_shaft"} else 0
    phases = drive_phases or {}
    name = item["id"]
    if name in {"pickup_pinion", "pickup_motor_shaft"}:
        spin += phases.get("pickup", 0) * (-1 if name == "pickup_motor_shaft" else 1)
    elif name in {"pickup_output_gear", "upper_pickup_drum", "lower_shaft", "lower_pickup_drum", "lower_drum_bearing_left", "lower_drum_bearing_right"}:
        spin -= phases.get("pickup", 0) / 6
    for side in ["left", "right"]:
        prefix = "orienter_" + side
        if name in {prefix + "_pinion", prefix + "_motor_shaft"}:
            spin += phases.get(prefix, 0)
        elif name in {prefix + "_shaft", prefix + "_gear", prefix + "_drum", prefix + "_bearing_upper", prefix + "_bearing_lower"}:
            spin -= phases.get(prefix, 0) / 3
    if spin:
        local[:3, :3] = rotation_matrix([1, 0, 0], spin) @ local[:3, :3]
    return matrix @ local


def resolve_model(design, controls, angle=0):
    for control, limit in design["parameters"]["controls"].items():
        if not limit["min"] <= controls[control] <= limit["max"]:
            raise ValueError("Control out of range")
    shapes = neutral_shapes(design, controls)
    placed = {item["id"]: transform_solid(shapes[item["part"]], pose_matrix(item, controls, angle, design["parameters"]["pivotOriginMm"])) for item in design["instances"]}
    return shapes, placed