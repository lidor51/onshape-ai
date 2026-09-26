import copy
import math

from model import capsule_stock, hex_stock, recipe, rectangular, round_stock


def apply_reducer(design):
    parts = design["parts"]
    parts.pop("deploy_motor_reducer_envelope")
    for item in design["instances"]:
        if item["id"] == "deploy_motor_reducer":
            item.update(id="deploy_motor", part="x44_envelope", originMm=[-304, 262.56, 410], rotation=None)
        elif item["id"] == "tower_left":
            item["part"] = "deploy_support_module"
        elif item["id"] == "deploy_pinion":
            item["part"] = "deploy_compound_shaft_module"
    for joint in design["joints"]:
        if joint["child"] == "deploy_motor_reducer":
            joint.update(id="mate_deploy_motor", child="deploy_motor", originParentGroupMm=[-304, 262.56, 410])

    support = copy.deepcopy(parts["pivot_tower"])
    support.update(id="deploy_support_module", notes="Flat tower plus two 6 mm gearbox cheeks, four turned spacers and a bolted bridge, represented as one rigid module. No bending. Plates are at world X=-333/-307; 1/2-inch hex bearing centers Y=171.12,Z=410; motor at Y=262.56,Z=410. Joining bolt lengths/stock grade and cheek bending are UNVERIFIED_BUILD.")
    additions = [capsule_stock(92, 6, [91.44, 0], [location, 71.12, 0]) for location in [-38, -12]]
    additions.append(rectangular([12, 20, 20], [-8, 0, 0]))
    for longitudinal in [71.12, 162.56]:
        for elevation in [-88, 88]:
            additions.append(round_stock(3, 22, [-25, longitudinal, elevation]))
    cuts = [round_stock(7.45, 100), round_stock(14.3375, 100, [0, 71.12, 0]), round_stock(9.575, 8, [-12, 162.56, 0])]
    support["holeInterfaces"] = [{"id": "spine_clearance", "centerMm": [0, 0, 0], "diameterMm": 14.9, "axis": "x", "throughLengthMm": 12}]
    for location in [-38, -12]:
        support["holeInterfaces"].append({"id": "compound_bearing_" + str(location), "centerMm": [location, 71.12, 0], "diameterMm": 28.675, "axis": "x", "throughLengthMm": 6})
    support["holeInterfaces"].append({"id": "motor_pilot", "centerMm": [-12, 162.56, 0], "diameterMm": 19.15, "axis": "x", "throughLengthMm": 6})
    for clock in [0, 120, 240]:
        center = [-12, 162.56 + 17.4625 * math.cos(math.radians(clock)), 17.4625 * math.sin(math.radians(clock))]
        cuts.append(round_stock(2.75, 8, center))
        support["holeInterfaces"].append({"id": "motor_bolt_" + str(clock), "centerMm": center, "diameterMm": 5.5, "axis": "x", "throughLengthMm": 6})
    support["recipe"].extend(recipe(additions, cuts))
    parts[support["id"]] = support
    parts["deploy_compound_shaft_module"] = {
        "id": "deploy_compound_shaft_module", "category": "custom", "material": "STEEL_SHAFT_AND_GEARS_GRADES_UNSELECTED",
        "geometryProvenance": "LOCAL_PARAMETRIC_CUSTOM", "holeInterfaces": [],
        "recipe": recipe([hex_stock(12.7, 64, [-25, 0, 0]), round_stock(82.55, 12.7, [-37, 0, 0]), round_stock(11.43, 8)]),
        "notes": "128t driven gear, 64 mm long 1/2-inch hex shaft and 16t final pinion, joined as one rigid module, NOT one purchasable box. Gear centers share Y=171.12,Z=410; faces at X=-318 and -281. Disks are addendum envelopes, NOT cuttable involute teeth. Three physical items plus retention; exact broach/key, tooth form, joining and load rating UNVERIFIED_BUILD.",
    }
    new_instances = [
        {"id": "deploy_motor_pinion", "part": "pinion_16_envelope", "originMm": [-318, 262.56, 410], "rotation": None, "motionGroup": "deploy_motor_input", "referenceOnly": False},
        {"id": "deploy_bearing_outboard", "part": "hex_bearing_envelope", "originMm": [-333, 171.12, 410], "rotation": None, "motionGroup": "deploy_input", "referenceOnly": False},
        {"id": "deploy_bearing_inboard", "part": "hex_bearing_envelope", "originMm": [-307, 171.12, 410], "rotation": None, "motionGroup": "deploy_input", "referenceOnly": False},
    ]
    design["instances"].extend(new_instances)
    for item in new_instances:
        design["joints"].append({"id": "mate_" + item["id"], "type": "REVOLUTE" if item["id"] == "deploy_motor_pinion" else "FASTENED", "parent": "tower_left" if item["id"] == "deploy_motor_pinion" else "deploy_pinion", "child": item["id"], "axisParentGroup": [1, 0, 0], "originParentGroupMm": item["originMm"], "limitsDeg": None, "frameConvention": "right-handed; joint Z is the stated axis; engineering contract, not REST"})
    for relation in design["relations"]:
        relation.pop("upstreamReducer", None)
    design["relations"].append({"id": "deploy_8_to_1", "type": "GEAR_RELATION", "driverMate": "mate_deploy_motor_pinion", "drivenMate": "mate_deploy_pinion", "outputPerInput": -1 / 8})
    design["intentionalContactExclusions"].append({"pair": ["deploy_motor_pinion", "deploy_pinion"], "reason": "New V2 designed 16:128 gear addendum overlap at 91.44 mm pitch centers; established before testing, not an exemption for an unexpected clash", "maximumAllowedIntersectionMm3": 1000})
    return design


def engineering_report(design):
    output_torque = 22.5
    stage_efficiency = 0.9
    compound_torque = output_torque / (6 * stage_efficiency)
    final_force = output_torque / 0.06096
    first_force = compound_torque / 0.08128
    bearing_span = 26
    overhang = 26
    nearest_reaction = final_force * (1 + overhang / bearing_span) + first_force
    bending_moment = final_force * overhang / 1000
    diameter = 0.0127
    bending_stress = 32 * bending_moment / (math.pi * diameter ** 3) / 1e6
    torsion_stress = 16 * compound_torque / (math.pi * diameter ** 3) / 1e6
    native_count = len(design["instances"]) - 1
    mechanism_count = sum(not item["referenceOnly"] for item in design["instances"])
    return {
        "status": "UNVERIFIED_BUILD", "opaqueReducerRemoved": True,
        "loadBasis": {"outputTorqueNm": output_torque, "source": "Parent referenced deployment sizing calculation, rounded 22.5 N m input; not independently rerun here", "impactLoadRating": False, "motorStallOrJamLoadRated": False, "stageEfficiencyAssumed": stage_efficiency},
        "stages": [{"teeth": [16, 128], "ratio": 8, "moduleMm": 1.27, "pressureAngleDeg": 14.5, "centerDistanceMm": 91.44, "planeXmm": -318}, {"teeth": [16, 96], "ratio": 6, "moduleMm": 1.27, "pressureAngleDeg": 14.5, "centerDistanceMm": 71.12, "planeXmm": -281}],
        "totalReduction": 48, "inputTorqueNmAtAssumedEfficiency": output_torque / (48 * stage_efficiency ** 2), "compoundTorqueNm": compound_torque,
        "finalMeshTangentialN": final_force, "firstMeshTangentialN": first_force, "finalMeshRadialN": final_force * math.tan(math.radians(14.5)),
        "shaftScreen": {"bearingSpanMm": bearing_span, "finalPinionOverhangMm": overhang, "inboardTangentialReactionUpperScreenN": nearest_reaction, "overhangMomentNm": bending_moment, "inscribedCircleDiameterMm": 12.7, "bendingMPa": bending_stress, "torsionMPa": torsion_stress, "vonMisesMPa": math.sqrt(bending_stress ** 2 + 3 * torsion_stress ** 2), "status": "SCREEN_ONLY_NO_MATERIAL_FATIGUE_OR_BEARING_RATING"},
        "budget": {"range": [25, 45], "nativeInstancesExcludingCoral": native_count, "mechanismInstancesExcludingAllReferences": mechanism_count, "uniqueNeutralParts": len(design["parts"]), "status": "FAIL_CONSERVATIVE_NATIVE_INSTANCE_LIMIT" if native_count > 45 else "PASS", "scope": "Do not hide support/bearing instances or redefine the v1 native-instance budget. Rigid module physical item counts exceed instance counts; not a complete fabrication BOM."},
        "nonBendBuildRoute": ["Router-cut flat cheeks with bearing and motor pilot bores; manual lathe turned spacers", "Existing flat tower joined to cheek bridge with bolts, no precision sheet bending", "Hex shaft with separate gear hubs; source exact 16t tooth/spline geometry or generate and validate a manufacturable profile", "Cut 128t output from selected gear stock only after tooth/root strength and shop process approval"],
        "unresolved": ["16t 14.5-degree involute undercut/profile and mating tooth manufacture are not defined by addendum disks", "Gear and shaft materials, hub retention, cheek/spacer joining, axial retention, bearing ratings and tolerances are unselected", "No powered-off brake, hard-stop load path, jam/impact rating or physical transfer proof", "Full native instance count exceeds 45; no removal or masking of modeled parts to claim budget PASS"],
    }