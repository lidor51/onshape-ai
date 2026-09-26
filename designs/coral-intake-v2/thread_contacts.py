import math


def verified_thread_pairs(assembly):
    module = assembly.pickup_module
    parts = {part["id"]: part for part in assembly.instances}
    records = {}
    for index in (0, 1):
        for side in (-1, 1):
            prefix = f"tube_joint_{index}_{side}"
            plug_id = "v2_" + prefix + "_plug"
            screw_id = "v2_" + prefix + "_top_screw"
            joint = next((entry for entry in assembly.joints if entry["id"] == prefix + "_top"), None)
            if joint is None or plug_id not in parts or screw_id not in parts:
                continue
            plug_part, screw_part = parts[plug_id], parts[screw_id]
            if plug_part["motion"] != screw_part["motion"] or not math.isclose(joint["thread_engagement_mm"], 4.9):
                continue
            plug = assembly.shape(plug_part)
            screw = assembly.shape(screw_part)
            local_screw = screw.moved(plug_part["pose"].inverse)
            local_bounds = module.bounds(local_screw)
            if abs((local_bounds[0] + local_bounds[3]) / 2) > 1e-5 or abs((local_bounds[2] + local_bounds[5]) / 2) > 1e-5:
                continue
            if local_bounds[1] < 3 - 1e-5:
                continue
            allowed_local = module.cylinder(2.5 + 1e-6, 4.9 + 2e-6, (0, 5.45, 0), (0, 1, 0))
            allowed = allowed_local.moved(plug_part["pose"])
            intersection = screw.intersect(plug)
            overlap = abs(intersection.Volume())
            outside = abs(intersection.cut(allowed).Volume())
            if overlap <= 1e-6 or outside > 1e-6:
                continue
            records[frozenset((plug_id, screw_id))] = {
                "status": "EXPECTED_THREAD_ENGAGEMENT", "joint": prefix + "_top",
                "parts": [plug_id, screw_id], "nominal_thread": "M5", "tap_drill_mm": 4.2,
                "nominal_major_diameter_mm": 5, "engagement_mm": 4.9,
                "overlap_mm3": overlap, "overlap_outside_thread_region_mm3": outside,
                "method": "Actual overlap Boolean confined to the coaxial major-diameter engagement cylinder; screw tip checked against tap depth",
                "strength_qualified": False, "thread_fit_qualified": False}
    return records