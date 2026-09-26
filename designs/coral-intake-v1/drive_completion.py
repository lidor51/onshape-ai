import math
from collections import Counter

from geometry import bounds, cq, cylinder, hex_shaft
from model import location, matrix, ring, shaft, web
from transmission import AXIAL_FLOAT, _drive_pulley, _idler_axle, _idler_wheel, _remove, _socket_screw, idler_layout, tensioned_belt


STATUS = "NOT RELEASED"


def _instances(package):
    return {instance["id"]: instance for instance in package.instances}


def _interval(package, name, axis):
    instance = _instances(package)[name]
    extent = bounds(package.definitions[instance["definition"]]["shape"].moved(instance["pose"]))
    return extent[axis], extent[axis + 3]


def _tube(package, name, start, end, center, axis, module, parent, outer=19, inner=15):
    if end - start <= 1e-6:
        raise ValueError("Nonpositive capture spacer: " + name)
    length = end - start
    definition = package.custom("dc_tube_" + "_".join(f"{value:.6f}" for value in (outer, inner, length)),
                                ring(outer, inner, length), stock=f"Turn OD{outer} ID{inner} x {length:.6f}; finish both faces; tolerance pending")
    position = ((start + end) / 2, *center) if axis == 0 else (*center, (start + end) / 2)
    package.add(name, definition, location(position, (1, 0, 0) if axis == 0 else (0, 0, 1)), module, "spacer", parent)
    return {"id": name, "start_mm": start, "end_mm": end, "length_mm": length}


def _end(package, name, end, center, axis, sign, module, parent):
    direction = (sign, 0, 0) if axis == 0 else (0, 0, sign)
    washer = package.custom("dc_end_washer", ring(19, 5.5, 1), material="steel provisional",
                            stock="OD19 ID5.5 x1 nominal washer; procurement pending")
    screw = package.define("dc_M5x12_screw", _socket_screw(12), "steel grade pending",
                           "standard_hardware_nominal_brep", "M5x12 socket screw; tap-drill overlap represents nominal threads")
    for suffix, definition, offset, role in (("washer", washer, 0.5, "spacer"), ("screw", screw, 1, "fastener")):
        position = (end + sign * offset, *center) if axis == 0 else (*center, end + sign * offset)
        package.add(name + "_" + suffix, definition, location(position, direction), module, role, parent)
    package.hardware[screw] += 1


def _capture(package, name, shaft_id, center, axis, ends, occupied, float_before, module):
    occupied = sorted(occupied)
    cursor = ends[0]
    spacers = []
    for start, end, identifier in occupied + [(ends[1], ends[1], "end")]:
        if start < cursor - 1e-5 or end > ends[1] + 1e-5:
            raise ValueError("Overlapping capture stack: " + name + ": " + identifier)
        allowance = AXIAL_FLOAT if identifier == float_before else 0
        if start - cursor > 1e-5:
            spacers.append(_tube(package, name + "_spacer_" + str(len(spacers)), cursor,
                                 start - allowance, center, axis, module, shaft_id))
        elif allowance:
            raise ValueError("No room for specified axial float: " + name)
        cursor = end
    for sign, end in zip((-1, 1), ends):
        _end(package, name + "_end_" + str(sign), end, center, axis, sign, module, shaft_id)
    return {"id": name, "shaft": shaft_id, "axis": axis, "shaft_ends_mm": list(ends),
            "occupied_intervals_mm": occupied, "spacers": spacers, "axial_float_mm": AXIAL_FLOAT,
            "float_before": float_before, "thread_engagement_mm": 11}


def _capture_indexer(package):
    instances = _instances(package)
    width = package.sourcebindings["indexer_wheel"]["datums"]["overallWidthMm"]
    pulley = package.custom("dc_round_hex_pulley", _drive_pulley(),
                            stock="OD42 x12; AF12.8 with R1.5 corner reliefs; R18 round-cord pitch; 6.1 wide open groove")
    stacks = []
    for side in ("L", "R"):
        for station, heights in enumerate(package.settings["indexer"]["wheel_z"]):
            prefix = "indexer_" + side + str(station)
            shaft_id = prefix + "_shaft"
            pose = matrix(instances[shaft_id]["pose"])
            center = (pose[0][3], pose[1][3])
            ends = (82, 274)
            definition = package.custom("dc_indexer_shaft", shaft(ends[1] - ends[0]),
                                        stock="AF12.7 x192; M5 taps both ends, 14 drilled depth; material and fatigue unqualified")
            instances[shaft_id].update(definition=definition, pose=location((*center, sum(ends) / 2)))
            instances[prefix + "_pulley"]["definition"] = pulley
            removed = {prefix + "_collar124", prefix + "_collar271", prefix + "_end83", prefix + "_end281"}
            members = [prefix + "_lower", prefix + "_upper", prefix + "_pulley"]
            if station == 0:
                drive = "indexer_drive_" + side
                members += [drive + "_output_bearing", drive + "_60T"]
                removed.update(drive + "_output_spacer_" + str(index) for index in (0, 1))
            _remove(package, removed)
            occupied = [(*_interval(package, member, 2), member) for member in members]
            occupied += [(height - width / 2, height + width / 2, prefix + "_wheel_" + str(index))
                         for index, height in enumerate(heights)]
            stacks.append(_capture(package, "dc_" + prefix, shaft_id, center, 2, ends, occupied, prefix + "_upper", "indexer"))
    return stacks


def _mount_screw(package, name, center, axis, length, parent, module="pickup", diameter=5):
    key = "dc_M" + str(diameter) + "x" + str(length) + "_screw"
    if diameter == 5:
        shape = _socket_screw(length)
    else:
        shape = cylinder(2, length, (0, 0, -length / 2)).fuse(cylinder(3.5, 4, (0, 0, 2)))
        shape = shape.cut(hex_shaft(3, 3).translate((0, 0, 3)))
    definition = package.define(key, shape, "steel grade pending", "standard_hardware_nominal_brep",
                                f"M{diameter}x{length}; nominal threads; trim commercial length if unavailable; grade/procurement pending")
    package.add(name, definition, location(center, axis), module, "fastener", parent)
    package.hardware[definition] += 1


def _new_shaft(package, identifier, ends, center, axis=0, module="pickup"):
    definition = package.custom("dc_" + identifier, shaft(ends[1] - ends[0]),
                                stock=f"AF12.7 x {ends[1] - ends[0]:.6f}; M5 end taps, 14 drilled depth; grade/load unqualified")
    position = (sum(ends) / 2, *center) if axis == 0 else (*center, sum(ends) / 2)
    pose = location(position, (1, 0, 0) if axis == 0 else (0, 0, 1))
    instance = _instances(package).get(identifier)
    if instance:
        instance.update(definition=definition, pose=pose)
    else:
        package.add(identifier, definition, pose, module, "hard_shaft")


def _reverse_support(package, rear, reverse):
    instances = _instances(package)
    rail = package.settings["pickup"]["sideplate_x"]
    anchors = [(rear[0] - 20, rear[1] + offset) for offset in (-20, 20)]
    bearing_diameter = 28.57
    outer = package.definitions[instances["cassette_rear_R"]["definition"]]["shape"].translate((*rear, 0))
    outer = outer.fuse(web([rear, reverse], 20, 6))
    for center in (rear, reverse):
        outer = outer.cut(cylinder(bearing_diameter / 2, 8, (*center, 0)))
    holes = [(*rear, bearing_diameter), (*reverse, bearing_diameter)]
    holes += [(rear[0] + horizontal, rear[1] + vertical, 5.5) for horizontal in (-20, 20) for vertical in (-20, 20)]
    for horizontal, vertical, diameter in holes:
        outer = outer.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    definition = package.custom("dc_reverse_outer_carrier", outer.clean(), flat=True, holes=holes,
                                stock="6 mm 6061 replacement rear-right cassette plus reversal bearing arm; preserve all four original mounting holes")
    instances["cassette_rear_R"].update(definition=definition, pose=location((rail + 6, 0, 0), (1, 0, 0)))
    inner = web([rear, reverse], 20, 6).fuse(web([anchors[0], rear, anchors[1]], 8, 6))
    holes = [(*rear, 32), (*reverse, bearing_diameter)] + [(*anchor, 4.2) for anchor in anchors]
    for horizontal, vertical, diameter in holes:
        inner = inner.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    motor = (rear[0] + 45.72, rear[1])
    inner = inner.cut(cylinder(32, 8, (*motor, 0)))
    definition = package.custom("dc_reverse_inner_carrier", inner.clean(), flat=True, holes=holes,
                                stock="6 mm 6061; two 4.2 holes tapped M5; 28.57 bearing seat; shaft clearance32; motor relief64; strength unqualified")
    package.add("dc_reverse_inner_carrier", definition, location((rail - 10, 0, 0), (1, 0, 0)), "pickup", parent="pickup_rail_R")
    rail_instance = instances["pickup_rail_R"]
    rail_shape = package.definitions[rail_instance["definition"]]["shape"]
    definition = package.custom("dc_pickup_rail_R", rail_shape.cut(cylinder(16, 8, (*reverse, 0))).clean(), flat=True,
                                holes=package.definitions[rail_instance["definition"]]["holes"] + [(*reverse, 32)],
                                stock="Original right 6 mm rail plus OD32 reversal-shaft clearance; ligament/load check required")
    rail_instance["definition"] = definition
    _remove(package, {"cassette_bolt_rear_R0", "cassette_bolt_rear_R1"})
    washer = package.custom("dc_mount_washer", ring(10, 5.5, 1), material="steel provisional", stock="Nominal OD10 ID5.5 x1")
    for index, anchor in enumerate(anchors):
        _tube(package, "dc_reverse_mount_spacer_" + str(index), rail - 7, rail - 3, anchor, 0, "pickup", "dc_reverse_inner_carrier", 10, 5.5)
        package.add("dc_reverse_mount_washer_" + str(index), washer, location((rail + 9.5, *anchor), (1, 0, 0)),
                    "pickup", "spacer", "cassette_rear_R")
        _mount_screw(package, "dc_reverse_mount_screw_" + str(index), (rail + 10, *anchor), (1, 0, 0), 22, "dc_reverse_inner_carrier")
    for side, axial, sign in (("inner", rail - 13, -1), ("outer", rail + 9, 1)):
        package.bearing("dc_reverse_bearing_" + side, (axial, *reverse), (sign, 0, 0), "pickup",
                        "dc_reverse_inner_carrier" if side == "inner" else "cassette_rear_R")
    return {"bearing_seat_x_mm": [rail - 13, rail + 9], "bearing_spacing_mm": 22,
            "anchors_yz_mm": anchors, "mount_thread_engagement_mm": 5, "gear_overhang_from_outer_seat_mm": 35}


def _kicker_idler(package, first, second, axial, layout):
    rail = package.settings["pickup"]["sideplate_x"]
    maximum = idler_layout(first, second, 4, span_fraction=layout["span_fraction"])
    start, end = layout["release_center"], maximum["center"]
    anchors = [(second[0] + offset, second[1] - 20) for offset in (-20, 20)]
    holes = [(*second, 44)] + [(*anchor, 5.5) for anchor in anchors]
    shape = web([anchors[0], anchors[1], start, end], 9, 6)
    shape = shape.cut(cylinder(22, 8, (*second, 0))).cut(web([start, end], 4.1, 8))
    for anchor in anchors:
        shape = shape.cut(cylinder(2.75, 8, (*anchor, 0)))
    definition = package.custom("dc_kick_idler_bracket", shape.clean(), flat=True, holes=holes,
                                stock="Paired 6 mm plate; 8.2 straight slots, OD44 pulley clearance; two existing kick-cassette mounting holes")
    package.definitions[definition]["slot"] = {"ends_yz_mm": [start, end], "width_mm": 8.2}
    for sign in (-1, 1):
        package.add("dc_kick_idler_bracket_" + str(sign), definition, location((axial + sign * 13, 0, 0), (1, 0, 0)),
                    "pickup", parent="cassette_kick_R")
    _remove(package, {"cassette_bolt_kick_R0", "cassette_bolt_kick_R2"})
    nut = package.define("dc_M5_nut", hex_shaft(8, 4).cut(cylinder(2.1, 6, (0, 0, 0))), "steel grade pending",
                         "standard_hardware_nominal_brep", "M5 AF8 x4; tap drill represents nominal threads")
    for index, anchor in enumerate(anchors):
        _tube(package, "dc_kick_idler_mount_gap_" + str(index), rail + 9, axial - 16, anchor, 0, "pickup", "cassette_kick_R", 10, 5.5)
        _tube(package, "dc_kick_idler_bridge_" + str(index), axial - 10, axial + 10, anchor, 0, "pickup", "dc_kick_idler_bracket_-1", 10, 5.5)
        _mount_screw(package, "dc_kick_idler_mount_screw_" + str(index), (axial + 17, *anchor), (1, 0, 0), 55, "dc_kick_idler_bracket_1")
        package.add("dc_kick_idler_mount_nut_" + str(index), nut, location((rail - 6, *anchor), (1, 0, 0)), "pickup", "fastener", "pickup_rail_R")
        package.hardware[nut] += 1
        for suffix, position in (("head", axial + 16.5), ("nut", rail - 3.5)):
            package.add("dc_kick_idler_" + suffix + "_washer_" + str(index), "dc_mount_washer", location((position, *anchor), (1, 0, 0)),
                        "pickup", "spacer", "dc_kick_idler_mount_screw_" + str(index))
    center = layout["center"]
    wheel = package.custom("dc_idler_wheel", _idler_wheel(), stock="Turn OD52 x12.7, bore28.57; R23 round-cord groove; opposed authentic WCP-0783 seats")
    axle = package.custom("dc_idler_axle", _idler_axle(), stock="AF12.7 x20, turn OD8 x6 ends; total32; M5 end taps")
    package.add("dc_kick_idler_wheel", wheel, location((axial, *center), (1, 0, 0)), "pickup", "pulley", "dc_kick_idler_axle")
    package.add("dc_kick_idler_axle", axle, location((axial, *center), (1, 0, 0)), "pickup", "hard_shaft", "dc_kick_idler_bracket_-1")
    for sign in (-1, 1):
        package.bearing("dc_kick_idler_bearing_" + str(sign), (axial + sign * 6.35, *center), (sign, 0, 0), "pickup", "dc_kick_idler_axle")
        lower, upper = sorted((axial + sign * 7.9375, axial + sign * 10))
        _tube(package, "dc_kick_idler_race_spacer_" + str(sign), lower + (AXIAL_FLOAT if sign == 1 else 0), upper,
              center, 0, "pickup", "dc_kick_idler_axle")
        _end(package, "dc_kick_idler_end_" + str(sign), axial + sign * 16, center, 0, sign, "pickup", "dc_kick_idler_axle")
    return {"center_yz_mm": center, "plane_x_mm": axial, "slot_ends_yz_mm": [start, end],
            "bearing_quantity": 2, "takeup_range_mm": [0, 4], "axial_float_mm": AXIAL_FLOAT}


def _kicker_pins(package, center, ends):
    instances = _instances(package)
    width = package.settings["pickup"]["roller_width"]
    positions = [sign * (width / 2 - 8) for sign in (-1, 1)]
    for name in ("core_kick", "sleeve_kick", "shaft_kick", "hub_kick-1", "hub_kick1"):
        instance = instances[name]
        shape = package.definitions[instance["definition"]]["shape"]
        local_positions = [0] if name.startswith("hub_") else [value - (sum(ends) / 2 if name == "shaft_kick" else 0) for value in positions]
        for position in local_positions:
            shape = shape.cut(cylinder(5 if name == "sleeve_kick" else 2.25, 60, (0, 0, position), (0, 1, 0)))
        instance["definition"] = package.custom("dc_pinned_" + name, shape.clean(),
                                               material="custom compliant material unqualified" if name == "sleeve_kick" else "6061-T6 provisional",
                                               stock="Preserved parent blank plus two-end transverse M4 clearance holes; sleeve has OD10 access holes; cross-pin strength unqualified")
    nut = package.define("dc_M4_nut", hex_shaft(7, 4).cut(cylinder(1.65, 6, (0, 0, 0))), "steel grade pending",
                         "standard_hardware_nominal_brep", "M4 AF7 x4; tap drill, nominal thread")
    washer = package.custom("dc_M4_washer", ring(9, 4.5, 1), material="steel provisional", stock="OD9 ID4.5 x1; nominal")
    for index, position in enumerate(positions):
        _mount_screw(package, "dc_kick_pin_" + str(index), (position, center[0], center[1] + 13), (0, 0, 1), 30, "shaft_kick", diameter=4)
        package.add("dc_kick_pin_nut_" + str(index), nut, location((position, center[0], center[1] - 15)), "pickup", "fastener", "dc_kick_pin_" + str(index))
        package.hardware[nut] += 1
        for sign in (-1, 1):
            package.add("dc_kick_pin_washer_" + str(index) + "_" + str(sign), washer,
                        location((position, center[0], center[1] + sign * 12.5)), "pickup", "spacer", "core_kick")
    return {"pin_x_mm": positions, "fasteners": "2 x M4x30, two nuts, four washers", "hole_mm": 4.5,
            "sleeve_access_hole_mm": 10, "strength_and_balance_qualified": False}


def _add_kicker(package):
    centers = {roller["id"]: roller["yz"] for roller in package.settings["pickup"]["rollers"]}
    rear, kick = centers["rear"], centers["kick"]
    pitch = package.sourcebindings["hex_output_gear"]["datums"]["pitchDiameterMmFromCatalog"]
    reverse = (rear[0] - pitch, rear[1])
    rail = package.settings["pickup"]["sideplate_x"]
    gear_plane, belt_plane = rail + 44, rail + 26
    support = _reverse_support(package, rear, reverse)
    for name, center, parent in (("dc_pickoff_60T", rear, "shaft_rear"), ("dc_reverse_60T", reverse, "dc_reverse_shaft")):
        package.add(name, package.vendor("hex_output_gear"), location((gear_plane, *center), (1, 0, 0)), "pickup", "gear", parent)
    for name, center, parent in (("dc_reverse_pulley", reverse, "dc_reverse_shaft"), ("dc_kick_pulley", kick, "shaft_kick")):
        package.add(name, "dc_round_hex_pulley", location((belt_plane, *center), (1, 0, 0)), "pickup", "pulley", parent)
    reverse_ends = (rail - 16, rail + 52)
    _new_shaft(package, "dc_reverse_shaft", reverse_ends, reverse)
    members = ["dc_reverse_bearing_inner", "dc_reverse_bearing_outer", "dc_reverse_pulley", "dc_reverse_60T"]
    reverse_stack = _capture(package, "dc_reverse", "dc_reverse_shaft", reverse, 0, reverse_ends,
                             [(*_interval(package, name, 0), name) for name in members], "dc_reverse_bearing_outer", "pickup")
    old_stack = next(stack for stack in package.transmission["capture_stacks"] if stack["row"] == "rear")
    rear_ends = (old_stack["shaft_ends_x_mm"][0], rail + 52)
    _new_shaft(package, "shaft_rear", rear_ends, rear)
    _remove(package, {spacer["id"] for spacer in old_stack["spacers"]} |
            {"tx_capture_rear_" + str(sign) + "_" + suffix for sign in (-1, 1) for suffix in ("washer", "screw")} |
            {"pickup_drive_output_spacer"})
    occupied = [entry for entry in old_stack["occupied_intervals_mm"] if entry[2] != "pickup_drive_output_spacer"]
    occupied.append((*_interval(package, "dc_pickoff_60T", 0), "dc_pickoff_60T"))
    rear_stack = _capture(package, "dc_rear", "shaft_rear", rear, 0, rear_ends, occupied, "bearing_rear_R", "pickup")
    old_stack.update(shaft_ends_x_mm=list(rear_ends), shaft_length_mm=rear_ends[1] - rear_ends[0],
                     occupied_intervals_mm=rear_stack["occupied_intervals_mm"], spacers=rear_stack["spacers"],
                     updated_by="drive_completion")
    next(row for row in package.wheel_rows if row["row"] == "rear")["shaft_length_mm"] = rear_ends[1] - rear_ends[0]
    kick_ends = (-(rail + 15), rail + 36)
    _new_shaft(package, "shaft_kick", kick_ends, kick)
    _remove(package, {"collar_kick" + str(sign) for sign in (-1, 1)} | {"shaft_end_kick" + str(sign) for sign in (-1, 1)})
    members = ["bearing_kick_L", "bearing_kick_R", "hub_kick-1", "hub_kick1", "dc_kick_pulley"]
    kick_stack = _capture(package, "dc_kick", "shaft_kick", kick, 0, kick_ends,
                          [(*_interval(package, name, 0), name) for name in members], "bearing_kick_R", "pickup")
    pins = _kicker_pins(package, kick, kick_ends)
    shape, layout = tensioned_belt(reverse, kick, span_fraction=0.8)
    definition = package.custom("dc_kick_belt", shape, material="6 mm welded PU cord, supplier pending",
                                stock="Installed tensioned round belt; not timing; qualified cut length and tension force unknown")
    package.add("dc_kick_belt", definition, location((belt_plane, 0, 0), (1, 0, 0)), "pickup", "belt", "dc_reverse_pulley")
    loop = {"id": "dc_kick_belt", "closed": True, "drive_members": ["dc_reverse_shaft", "shaft_kick"],
            "centers_yz_mm": [reverse, kick], "center_distance_mm": math.dist(reverse, kick), "axial_plane_mm": belt_plane,
            "nominal_length": layout["installed_length_mm"], **layout, "cut_length_released": False, "load_test_required": True}
    package.belts.append(loop)
    idler = _kicker_idler(package, reverse, kick, belt_plane, layout)
    for instance in package.instances:
        pose = matrix(instance["pose"])
        if instance["role"] not in {"hard_shaft", "gear", "pulley", "bearing", "spacer", "fastener"}:
            continue
        if math.dist((pose[1][3], pose[2][3]), reverse) < 1e-5 and abs(pose[0][2]) > 0.999999:
            instance["pose"] = instance["pose"] * cq.Location(cq.Vector(), cq.Vector(0, 0, 1), -3 if pose[0][2] > 0 else 3)
            instance["drive_completion_preclock_degrees"] = -3
    package.gear_pairs.append({"name": "dc_reversal", "module": "pickup", "axis": [1, 0, 0], "mount_face": rail + 3,
                              "input": list(rear), "output": list(reverse), "teeth": [60, 60], "center_distance": pitch,
                              "ratio": 1, "gear_midplane": gear_plane, "pinion": "dc_pickoff_60T", "gear": "dc_reverse_60T",
                              "motor": "pickup_drive_X44", "required_skus": ["WCP-0121", "WCP-0121"],
                              "vendor_solids_present": True, "fit_and_mesh_approved": False,
                              "final_absolute_phases_degrees": [3, 0], "mesh_status": "Requires focused actual-B-rep validation after clock_outputs(3)"})
    return {"loop": loop, "idler": idler, "support": support, "stacks": [rear_stack, reverse_stack, kick_stack], "pins": pins,
            "gear_centers_yz_mm": [rear, reverse], "gear_plane_x_mm": gear_plane, "rotation_relative_to_upper": -1,
            "surface_speed_ratio_magnitude": 51 / 127, "gear_phase_sum_degrees": 3}


def _fold_flanges(package):
    pivot = package.settings["pickup"]["pivot_yz"]
    rail = package.settings["pickup"]["sideplate_x"]
    instances = _instances(package)
    for sign, side in ((-1, "L"), (1, "R")):
        phase = 3
        holes = [(horizontal, vertical, 4.2) for horizontal in (-20, 20) for vertical in (-20, 20)]
        shape = web([(-20, -20), (20, -20), (20, 20), (-20, 20)], 9, 6)
        shape = shape.fuse(cylinder(26, 6, (0, 0, 0)))
        bore = hex_shaft(12.8, 8)
        for corner in range(6):
            angle = math.radians(corner * 60)
            bore = bore.fuse(cylinder(1.5, 8, (12.8 / math.sqrt(3) * math.cos(angle), 12.8 / math.sqrt(3) * math.sin(angle), 0)))
        shape = shape.cut(bore.rotate((0, 0, 0), (0, 0, 1), phase))
        for horizontal, vertical, diameter in holes:
            shape = shape.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
        if sign == 1:
            shape = shape.cut(cylinder(27, 8, (0, 45.72, 0)))
        definition = package.custom("dc_fold_flange_" + side, shape.clean(), flat=True, holes=holes,
                                    stock=f"6 mm 6061; AF12.8 hex with R1.5 router corner reliefs clocked {phase} deg; four M5 tapped holes on40 square; right has R27 motor relief at (0,45.72); hex transfers torque, not friction")
        package.add("dc_fold_flange_" + side, definition, location((sign * (rail - 6), *pivot), (1, 0, 0)),
                    "pickup", "structure", "pivot_stub_" + str(sign))
        _remove(package, {"cassette_bolt_pivot_" + side + str(index) for index in range(4)})
        for index, (horizontal, vertical, diameter) in enumerate(holes):
            _mount_screw(package, "dc_fold_mount_" + side + str(index), (sign * (rail + 10), pivot[0] + horizontal, pivot[1] + vertical),
                         (sign, 0, 0), 18, "dc_fold_flange_" + side)
            washer = package.custom("dc_mount_washer", ring(10, 5.5, 1), material="steel provisional", stock="Nominal OD10 ID5.5 x1")
            package.add("dc_fold_washer_" + side + str(index), washer, location((sign * (rail + 9.5), pivot[0] + horizontal, pivot[1] + vertical), (sign, 0, 0)),
                        "pickup", "spacer", "cassette_pivot_" + side)
        instances["pivot_stub_" + str(sign)]["motion"] = "fold"
    for name in ("fold_drive_60T", "fold_drive_output_spacer", "fold_drive_output_end"):
        if name in instances:
            instances[name]["motion"] = "fold"
    return {"flanges": 2, "thickness_mm": 6, "mount_pattern_mm": [40, 40], "screws": 8,
            "thread_engagement_mm": 5, "hold_latch_present": False, "counterbalance_present": False,
            "moving_mass_kg": None, "required_torque_Nm": None, "torque_status": "BLOCKED: mass/CG, acceleration, continuous motor limits and positive holding not qualified",
            "native_joint_verified": False}


def add_drive_completion(package):
    if hasattr(package, "drive_completion"):
        return package
    if not hasattr(package, "transmission") or any("output_clock_degrees" in instance for instance in package.instances):
        raise ValueError("Require unclocked build modules -> add_transmission -> add_drive_completion -> clock_outputs(3)")
    if package.sourcebindings["hex_output_gear"]["sku"] != "WCP-0121" or package.sourcebindings["hex_bearing"]["sku"] != "WCP-0783":
        raise ValueError("Expected verified WCP-0121 and WCP-0783 bindings")
    if package.settings["pickup"]["sideplate_x"] != 290 or package.settings["pickup"]["plate_thickness"] != 6:
        raise ValueError("This bounded completion layout requires X290 rails and 6 mm plate")
    original = {instance["id"]: instance["definition"] for instance in package.instances}
    original_definitions = set(package.definitions)
    indexer = _capture_indexer(package)
    kicker = _add_kicker(package)
    fold = _fold_flanges(package)
    current = {instance["id"]: instance["definition"] for instance in package.instances}
    counts = Counter(current.values())
    redefined = sorted(name for name in original.keys() & current.keys() if original[name] != current[name])
    package.holes[:] = [hole for hole in package.holes if hole["part"] not in redefined]
    for name in redefined:
        for horizontal, vertical, diameter in package.definitions[current[name]]["holes"]:
            package.holes.append({"part": name, "local_center": [horizontal, vertical, 0], "diameter": diameter})
    for item in package.missing:
        if item["id"] == "kick_reversal":
            item["reason"] = "Authentic 60:60 reversal, tensioned kicker loop and transverse core pins modeled; source mesh, sweep, belt load and cross-pin strength require qualification"
    package.missing += [{"id": "dc_fold_hold", "reason": fold["torque_status"]},
                        {"id": "dc_indexer_tension", "reason": "Wheel/pulley capture modeled; original fixed triangular indexer belts still need qualified adjustable tensioners"}]
    package.drive_completion = {"status": STATUS, "indexer_stacks": indexer, "kicker": kicker, "fold": fold,
                                "added_instances": sorted(current.keys() - original.keys()), "removed_instances": sorted(original.keys() - current.keys()),
                                "redefined_instances": redefined,
                                "net_instance_delta": len(current) - len(original),
                                "new_definition_quantities": {name: counts[name] for name in sorted(set(package.definitions) - original_definitions)},
                                "replaces_transmission_capture_rows": ["rear"],
                                "inherited_left_extent_mm": package.transmission.get("maximum_left_hardware_x_mm"),
                                "clearance_status": "UNVERIFIED until focused tests; full assembly sweep remains parent-owned",
                                "unresolved": ["fold_torque_and_positive_hold", "fold_stub_axial_retention_and_existing_mount_overlap",
                                               "indexer_belt_tensioners", "belt_slip_creep_splice_and_pretension", "shaft_cross_pin_fatigue", "kicker_sleeve_bond_or_positive_attachment",
                                               "reversal_carrier_cantilever_load", "full_pair_and_motion_clearance", "guards"]}
    return package