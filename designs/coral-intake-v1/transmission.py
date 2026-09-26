import math
from collections import Counter
from functools import lru_cache

from geometry import bounds, cq, cylinder, hex_shaft
from model import location, matrix, pulley, ring, shaft, web


STATUS = "NOT RELEASED"
AXIAL_FLOAT = 0.20


def two_pulley_belt(first, second, pitch_radius=18.0, cord_diameter=6.0):
    distance = math.dist(first, second)
    if distance <= 2 * pitch_radius or not 0 < cord_diameter < 2 * pitch_radius:
        raise ValueError("Separated pulleys and a positive, smaller cord are required")
    path = (cq.Workplane("XY").moveTo(0, pitch_radius)
            .lineTo(distance, pitch_radius)
            .threePointArc((distance + pitch_radius, 0), (distance, -pitch_radius))
            .lineTo(0, -pitch_radius)
            .threePointArc((-pitch_radius, 0), (0, pitch_radius)).close().val())
    edge = path.Edges()[0]
    plane = cq.Plane(origin=edge.startPoint(), normal=edge.tangentAt(0))
    shape = cq.Workplane(plane).circle(cord_diameter / 2).sweep(
        cq.Workplane("XY").newObject([path]), isFrenet=True).val()
    angle = math.degrees(math.atan2(second[1] - first[1], second[0] - first[0]))
    shape = shape.rotate((0, 0, 0), (0, 0, 1), angle).translate((*first, 0))
    return shape, path.Length()


def _route(centers, signed_radii):
    outgoing, incoming = [], [None] * len(centers)
    length = 0.0
    for index, first in enumerate(centers):
        following = (index + 1) % len(centers)
        second = centers[following]
        distance = math.dist(first, second)
        cosine = (signed_radii[index] - signed_radii[following]) / distance
        if abs(cosine) >= 1:
            raise ValueError("No internal common tangent: idler too close to pulley")
        direction = [(second[axis] - first[axis]) / distance for axis in range(2)]
        sine = math.sqrt(1 - cosine * cosine)
        normal = [direction[0] * cosine + direction[1] * sine,
                  direction[1] * cosine - direction[0] * sine]
        outgoing.append(tuple(first[axis] + signed_radii[index] * normal[axis] for axis in range(2)))
        incoming[following] = tuple(second[axis] + signed_radii[following] * normal[axis] for axis in range(2))
        length += math.dist(outgoing[-1], incoming[following])
    arcs = []
    for index, center in enumerate(centers):
        start = math.atan2(incoming[index][1] - center[1], incoming[index][0] - center[0])
        end = math.atan2(outgoing[index][1] - center[1], outgoing[index][0] - center[0])
        sweep = (end - start) % (2 * math.pi)
        if signed_radii[index] < 0:
            sweep -= 2 * math.pi
        radius = abs(signed_radii[index])
        midpoint = (center[0] + radius * math.cos(start + sweep / 2),
                    center[1] + radius * math.sin(start + sweep / 2))
        arcs.append((incoming[index], midpoint, outgoing[index], sweep))
        length += radius * abs(sweep)
    return outgoing, incoming, arcs, length


def idler_layout(first, second, takeup=3.0, pitch_radius=18.0, idler_radius=23.0, span_fraction=0.5):
    if not 0 < takeup <= 4:
        raise ValueError("Supported geometric take-up is greater than zero through 4 mm")
    distance = math.dist(first, second)
    direction = [(second[axis] - first[axis]) / distance for axis in range(2)]
    normal = [-direction[1], direction[0]]
    midpoint = [first[axis] + span_fraction * (second[axis] - first[axis]) for axis in range(2)]
    neutral = 2 * distance + 2 * math.pi * pitch_radius
    lower, upper = 0.0, pitch_radius
    for iteration in range(45):
        deflection = (lower + upper) / 2
        center = tuple(midpoint[axis] + normal[axis] * (pitch_radius + idler_radius - deflection) for axis in range(2))
        route = _route([first, second, center], [pitch_radius, pitch_radius, -idler_radius])
        if route[3] < neutral + takeup:
            lower = deflection
        else:
            upper = deflection
    if abs(route[3] - neutral - takeup) > 1e-7:
        raise ValueError("Idler travel cannot supply requested take-up")
    release = tuple(midpoint[axis] + normal[axis] * (pitch_radius + idler_radius + 1) for axis in range(2))
    return {"center": center, "release_center": release, "neutral_length_mm": neutral,
            "installed_length_mm": route[3], "takeup_mm": takeup, "span_fraction": span_fraction,
            "pulley_wrap_degrees": [math.degrees(abs(arc[3])) for arc in route[2][:2]],
            "idler_wrap_degrees": math.degrees(abs(route[2][2][3])), "route": route}


def tensioned_belt(first, second, takeup=3.0, span_fraction=0.5):
    layout = idler_layout(first, second, takeup, span_fraction=span_fraction)
    outgoing, incoming, arcs, length = layout["route"]
    edges = []
    for index, start in enumerate(outgoing):
        following = (index + 1) % len(outgoing)
        edges.append(cq.Edge.makeLine(cq.Vector(*start, 0), cq.Vector(*incoming[following], 0)))
        arc = arcs[following]
        edges.append(cq.Edge.makeThreePointArc(*(cq.Vector(*point, 0) for point in arc[:3])))
    path = cq.Wire.assembleEdges(edges)
    plane = cq.Plane(origin=edges[0].startPoint(), normal=edges[0].tangentAt(0))
    shape = cq.Workplane(plane).circle(3).sweep(cq.Workplane("XY").newObject([path]), isFrenet=True).val()
    return shape, {key: value for key, value in layout.items() if key != "route"}


@lru_cache(maxsize=None)
def _drive_pulley():
    shape = pulley().intersect(cylinder(22, 12, (0, 0, 0))).cut(ring(44, 36, 6.1))
    for corner in range(6):
        angle = math.radians(corner * 60)
        shape = shape.cut(cylinder(1.5, 16, (12.8 / math.sqrt(3) * math.cos(angle),
                                           12.8 / math.sqrt(3) * math.sin(angle), 0)))
    return shape.clean()


@lru_cache(maxsize=None)
def _idler_wheel():
    return ring(52, 28.57, 12.7).cut(cq.Solid.makeTorus(23, 3.05)).cut(ring(54, 46, 6.1)).clean()


@lru_cache(maxsize=None)
def _idler_axle():
    shape = hex_shaft(12.7, 20)
    for sign in (-1, 1):
        shape = shape.fuse(cylinder(4, 6, (0, 0, sign * 13)))
        shape = shape.cut(cylinder(2.1, 12, (0, 0, sign * 10)))
    return shape.clean()


@lru_cache(maxsize=None)
def _socket_screw(length):
    shape = cylinder(2.5, length, (0, 0, -length / 2)).fuse(cylinder(4.25, 5, (0, 0, 2.5)))
    return shape.cut(hex_shaft(4, 3).translate((0, 0, 4))).clean()


def _add_end(package, name, end, axis, parent, motion):
    washer = package.custom("tx_end_washer", ring(19, 5.5, 1), material="steel provisional",
                            stock="OD19 ID5.5 x 1 flat washer; custom/nominal, procurement pending")
    center = tuple(end[index] + axis[index] * 0.5 for index in range(3))
    package.add(name + "_washer", washer, location(center, axis), "pickup", "spacer", parent, motion)
    screw = package.define("tx_M5x12_socket_screw", _socket_screw(12), "steel grade pending",
                           "standard_hardware_nominal_brep", "M5x12 socket screw; 4 mm key; nominal threads, procurement pending")
    center = tuple(end[index] + axis[index] for index in range(3))
    package.add(name + "_screw", screw, location(center, axis), "pickup", "fastener", parent, motion)
    package.hardware[screw] += 1


def _tube(package, name, start, end, center, parent, motion, outer=19, inner=15):
    length = end - start
    if length <= 1e-6:
        raise ValueError("Nonpositive spacer length: " + name)
    key = "tx_tube_" + "_".join(f"{value:.6f}" for value in (outer, inner, length))
    definition = package.custom(key, ring(outer, inner, length),
                                stock=f"Turn/saw tube OD{outer} ID{inner} x {length:.6f}; deburr, finish both faces; tolerance pending")
    package.add(name, definition, location(((start + end) / 2, *center), (1, 0, 0)),
                "pickup", "spacer", parent, motion)
    return {"id": name, "start_mm": start, "end_mm": end, "length_mm": length,
            "od_mm": outer, "id_mm": inner}


def _remove(package, identifiers):
    removed = [instance for instance in package.instances if instance["id"] in identifiers]
    package.instances[:] = [instance for instance in package.instances if instance["id"] not in identifiers]
    package.joints[:] = [joint for joint in package.joints if not identifiers.intersection((joint["first"], joint["second"]))]
    package.holes[:] = [hole for hole in package.holes if hole["part"] not in identifiers]
    for instance in removed:
        if instance["role"] == "fastener" and package.hardware[instance["definition"]] > 0:
            package.hardware[instance["definition"]] -= 1
    return removed


def _add_idler(package, name, first, second, axial, support_row, motion, belt_layout):
    maximum = idler_layout(first, second, 4, span_fraction=belt_layout["span_fraction"])
    start, end = belt_layout["release_center"], maximum["center"]
    support = second
    anchors = [(support[0] - 20, support[1] + 20), (support[0] + 20, support[1] - 20)]
    holes = [(support[0], support[1], 26)] + [(*anchor, 5.5) for anchor in anchors]
    bracket = web([support, start, end], 18, 6).fuse(web([anchors[0], support, anchors[1]], 8, 6))
    for horizontal, vertical, diameter in holes:
        bracket = bracket.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    bracket = bracket.cut(web([start, end], 4.1, 8)).clean()
    definition = package.custom(name + "_bracket", bracket, stock="Paired 6 mm router plate; 8.2 wide straight adjustment slot; no bends", flat=True, holes=holes)
    package.definitions[definition]["slot"] = {"centerline_ends_yz_mm": [start, end], "width_mm": 8.2}
    for sign in (-1, 1):
        package.add(name + "_bracket_" + str(sign), definition, location((axial + sign * 13, 0, 0), (1, 0, 0)),
                    "pickup", "structure", "cassette_" + support_row + "_L", motion)
    rail = package.settings["pickup"]["sideplate_x"]
    cassette_outer = -(rail - 7 if support_row == "front" else rail + 9)
    support_inner = cassette_outer + 12
    removed_ids = {"cassette_bolt_" + support_row + "_L" + str(index) for index in (1, 2)}
    _remove(package, removed_ids)
    length = math.ceil((support_inner + 5 - (axial - 17)) / 5) * 5
    screw_key = package.define("tx_M5x" + str(length) + "_socket_screw", _socket_screw(length), "steel grade pending",
                               "standard_hardware_nominal_brep", f"M5x{length} socket screw, nominal thread; procurement pending")
    nut = package.define("tx_M5_nut", hex_shaft(8, 4).cut(cylinder(2.1, 6, (0, 0, 0))), "steel grade pending",
                         "standard_hardware_nominal_brep", "M5 nut, AF8 x 4; tap drill represented, thread helix omitted")
    for index, anchor in enumerate(anchors):
        _tube(package, name + "_mount_sleeve_" + str(index), axial + 16, cassette_outer, anchor,
              "cassette_" + support_row + "_L", motion, 10, 5.5)
        _tube(package, name + "_bridge_" + str(index), axial - 10, axial + 10, anchor,
              name + "_bracket_-1", motion, 10, 5.5)
        package.add(name + "_mount_screw_" + str(index), screw_key, location((axial - 17, *anchor), (-1, 0, 0)),
                    "pickup", "fastener", name + "_bracket_-1", motion)
        package.hardware[screw_key] += 1
        package.add(name + "_mount_nut_" + str(index), nut, location((support_inner + 2, *anchor), (1, 0, 0)),
                    "pickup", "fastener", "cassette_" + support_row + "_L", motion)
        package.hardware[nut] += 1
        washer = package.custom("tx_mount_washer", ring(10, 5.5, 1), material="steel provisional", stock="Nominal OD10 ID5.5 x 1 washer, procurement pending")
        package.add(name + "_mount_washer_" + str(index), washer, location((axial - 16.5, *anchor), (1, 0, 0)),
                    "pickup", "spacer", name + "_mount_screw_" + str(index), motion)
    wheel = package.custom("tx_idler_wheel", _idler_wheel(), stock="Turn OD52 x 12.7, bore28.57; R23 pitch / R3.05 round groove, 6.1 wide mouth opened to OD; two opposed WCP-0783 flange seats")
    center = belt_layout["center"]
    package.add(name + "_wheel", wheel, location((axial, *center), (1, 0, 0)), "pickup", "pulley", name + "_axle", motion)
    axle = package.custom("tx_idler_axle", _idler_axle(), stock="AF12.7 hex x20; turn each end OD8 x6; total32; M5 taps 11 engagement, 12 drilled depth; slot-clamped")
    package.add(name + "_axle", axle, location((axial, *center), (1, 0, 0)), "pickup", "hard_shaft", name + "_bracket_-1", motion)
    for sign in (-1, 1):
        package.bearing(name + "_bearing_" + str(sign), (axial + sign * 6.35, *center), (sign, 0, 0),
                        "pickup", name + "_axle", motion)
        inside, outside = sorted((axial + sign * 7.9375, axial + sign * 10))
        if sign == 1:
            inside += AXIAL_FLOAT
        _tube(package, name + "_race_sleeve_" + str(sign), inside, outside, center, name + "_axle", motion)
        _add_end(package, name + "_end_" + str(sign), (axial + sign * 16, *center), (sign, 0, 0), name + "_axle", motion)
    return {"id": name, "center_yz_mm": center, "axial_plane_mm": axial, "slot_ends_yz_mm": [start, end],
            "slot_center_travel_mm": math.dist(start, end), "takeup_range_mm": [0, 4],
            "bearing_sku": "WCP-0783", "bearing_quantity": 2, "axial_float_mm": AXIAL_FLOAT,
            "mount_screw_length_mm": length, "adjustment": "Loosen both M5 axle ends, slide in paired slots, clamp; release position clears cord by 1 mm"}


def _interval(package, instance):
    extent = bounds(package.definitions[instance["definition"]]["shape"].moved(instance["pose"]))
    return extent[0], extent[3]


def _replace_left_stop_support(package, middle):
    instances = {instance["id"]: instance for instance in package.instances}
    stop_centers = [tuple(row[3] for row in matrix(instances["floating_stop_L" + str(index)]["pose"])[:3])[1:]
                    for index in (0, 1)]
    anchors = [(middle[0] + horizontal, middle[1] + vertical) for horizontal in (-20, 20) for vertical in (-20, 20)]
    holes = [(*middle, 32)] + [(*center, 8.2) for center in stop_centers] + [(*anchor, 5.5) for anchor in anchors]
    shape = cylinder(34, 6, (*middle, 0)).fuse(*(web([middle, center], 13, 6) for center in stop_centers))
    for horizontal, vertical, diameter in holes:
        shape = shape.cut(cylinder(diameter / 2, 8, (horizontal, vertical, 0)))
    definition = package.custom("tx_middle_stop_bridge", shape.clean(), stock="6 mm router plate; shared stop support, central OD32 shaft clearance, four M5 cassette mounts; no bends; load qualification pending",
                                flat=True, holes=holes)
    rail = package.settings["pickup"]["sideplate_x"]
    axial = -(rail + 13)
    _remove(package, {"stop_mount_L0", "stop_mount_L1"} | {"cassette_bolt_middle_L" + str(index) for index in range(4)})
    package.add("tx_middle_stop_bridge", definition, location((axial, 0, 0), (1, 0, 0)), "pickup", "structure", "cassette_middle_L")
    screw = package.define("tx_M5x25_socket_screw", _socket_screw(25), "steel grade pending", "standard_hardware_nominal_brep",
                           "M5x25 socket screw; nominal threads, procurement pending")
    nut = "tx_M5_nut"
    washer = "tx_mount_washer"
    for index, anchor in enumerate(anchors):
        for suffix, horizontal in (("gap", axial + 3.5), ("head", axial - 3.5)):
            package.add("tx_stop_" + suffix + "_washer_" + str(index), washer, location((horizontal, *anchor), (1, 0, 0)),
                        "pickup", "spacer", "tx_middle_stop_bridge")
        package.add("tx_stop_mount_screw_" + str(index), screw, location((axial - 4, *anchor), (-1, 0, 0)),
                    "pickup", "fastener", "tx_middle_stop_bridge")
        package.add("tx_stop_mount_nut_" + str(index), nut, location((-(rail - 5), *anchor), (1, 0, 0)),
                    "pickup", "fastener", "cassette_middle_L")
        package.hardware[screw] += 1
        package.hardware[nut] += 1
    for index in (0, 1):
        package.joints.append({"first": "floating_stop_L" + str(index), "second": "tx_middle_stop_bridge",
                               "type": "existing M8 stop in preserved 8.2 mm hole; structural load unqualified"})
    return {"id": "tx_middle_stop_bridge", "plate_thickness_mm": 6, "shaft_clearance_mm": 32,
            "stop_centers_yz_mm": stop_centers, "mount_centers_yz_mm": anchors,
            "mount_screws": "4 x M5x25, four M5 nuts, eight OD10/ID5.5 x1 washers",
            "reason": "Original coplanar stop roots occupied the shaft/spacer axis; fused support now has real clearance and bolted attachment"}


def _capture_row(package, row, center, planes):
    identifier = row["row"]
    motion = "float" if identifier == "front" else "fold"
    instances = {instance["id"]: instance for instance in package.instances}
    shaft_id = "shaft_" + identifier
    old_shaft = instances[shaft_id]
    right_end = _interval(package, old_shaft)[1]
    left_end = min(planes) - 16
    definition = package.custom("tx_shaft_" + identifier, shaft(right_end - left_end),
                                material="1/2 inch AF hex stock, grade unqualified",
                                stock=f"AF12.7 x {right_end - left_end:.6f}; M5 end taps; original right end preserved")
    old_shaft.update(definition=definition, pose=location(((left_end + right_end) / 2, *center), (1, 0, 0)))
    occupied = []
    for name in ("bearing_" + identifier + "_L", "bearing_" + identifier + "_R"):
        occupied.append((*_interval(package, instances[name]), name))
    width = row["hub_width_mm"]
    for index, position in enumerate(row["axial_centers_mm"]):
        occupied.append((position - width / 2, position + width / 2, "star_" + identifier + "_" + str(index)))
    for instance in package.instances:
        if instance["id"].startswith("tx_pulley_" + identifier + "_"):
            occupied.append((*_interval(package, instance), instance["id"]))
    if identifier == "rear":
        for name in ("pickup_drive_60T", "pickup_drive_output_spacer"):
            if name in instances:
                occupied.append((*_interval(package, instances[name]), name))
    occupied.sort()
    cursor = left_end
    spacers = []
    for start, end, name in occupied + [(right_end, right_end, "end")]:
        if start < cursor - 1e-5 or end > right_end + 1e-5:
            raise ValueError("Overlapping or out-of-shaft capture stack: " + identifier + ": " + name)
        gap = AXIAL_FLOAT if name == "bearing_" + identifier + "_R" else 0
        if start - cursor > 1e-5:
            spacers.append(_tube(package, "tx_stack_" + identifier + "_" + str(len(spacers)), cursor, start - gap,
                                  center, shaft_id, motion))
        cursor = end
    _remove(package, {"collar_" + identifier + str(sign) for sign in (-1, 1)} |
                    {"shaft_end_" + identifier + str(sign) for sign in (-1, 1)})
    for sign, end in ((-1, left_end), (1, right_end)):
        _add_end(package, "tx_capture_" + identifier + "_" + str(sign), (end, *center), (sign, 0, 0), shaft_id, motion)
    row.update(shaft_length_mm=right_end - left_end, axial_wheel_spacing_retention="B-rep sleeve/end-washer capture; 0.20 mm right inner-race end float; NOT RELEASED")
    return {"row": identifier, "shaft_ends_x_mm": [left_end, right_end], "shaft_length_mm": right_end - left_end,
            "occupied_intervals_mm": occupied, "spacers": spacers, "axial_float_mm": AXIAL_FLOAT,
            "float_at": "inboard face of right bearing", "shaft_end_thread_engagement_mm": 11,
            "inner_race_od_mm": 19.304, "spacer_od_mm": 19, "spacer_id_mm": 15,
            "hex_circumdiameter_mm": 12.7 * 2 / math.sqrt(3)}


def add_transmission(package):
    if hasattr(package, "transmission"):
        return package
    if any("output_clock_degrees" in instance for instance in package.instances):
        raise ValueError("Call add_transmission before clock_outputs; do not apply to the already-clocked build() result")
    instances = {instance["id"]: instance for instance in package.instances}
    rows = {row["row"]: row for row in package.wheel_rows}
    required = {"pickup_upper_belt", "pulley_front", "pulley_middle", "pulley_rear",
                "stop_mount_L0", "stop_mount_L1", "floating_stop_L0", "floating_stop_L1"}
    required.update("shaft_" + name for name in ("front", "middle", "rear"))
    required.update("bearing_" + name + "_" + side for name in ("front", "middle", "rear") for side in ("L", "R"))
    if required - instances.keys() or set(rows) != {"front", "middle", "rear"}:
        raise ValueError("Expected the unclocked 9/8/5 pickup assembly and its original belt/shaft interfaces")
    if package.sourcebindings["hex_bearing"]["sku"] != "WCP-0783":
        raise ValueError("Idler seats require the verified WCP-0783 source binding")
    if package.settings["pickup"]["plate_thickness"] != 6 or package.settings["pickup"]["shaft_af"] != 12.7:
        raise ValueError("This transmission requires 6 mm plates and 12.7 AF shafts")
    if package.settings["drives"]["pulley_pitch_radius"] != 18 or package.settings["drives"]["round_belt_diameter"] != 6:
        raise ValueError("This transmission is the R18 / 6 mm round-cord variant only")
    for row in rows.values():
        if row["hub_width_mm"] != 12.7 or len(row["axial_centers_mm"]) != row["count"]:
            raise ValueError("Capture requires actual 12.7 mm hub centers")
    before = len(package.instances)
    original_ids = set(instances)
    original_definitions = set(package.definitions)
    rail = package.settings["pickup"]["sideplate_x"]
    centers = {roller["id"]: roller["yz"] for roller in package.settings["pickup"]["rollers"]}
    planes = {"front": -(rail + 23), "rear": -(rail + 38)}
    pulley_definition = package.custom("tx_round_hex_pulley", _drive_pulley(),
                                        stock="OD42 x12; pitchR18 / grooveR3.05, 6.1 wide mouth opened to OD; AF12.8 through bore with six R1.5 corner router reliefs; NOT timing")
    _remove(package, {"pickup_upper_belt", "pulley_front", "pulley_middle", "pulley_rear"})
    package.belts[:] = [belt for belt in package.belts if belt["id"] != "pickup_upper_belt"]
    loops, idlers = [], []
    for member, axial in planes.items():
        motion = "float" if member == "front" else "fold"
        name = "tx_" + member
        for roller in ("middle", member):
            package.add("tx_pulley_" + roller + "_" + member, pulley_definition, location((axial, *centers[roller]), (1, 0, 0)),
                        "pickup", "pulley", "shaft_" + roller, "float" if roller == "front" else "fold")
        shape, layout = tensioned_belt(centers["middle"], centers[member], span_fraction=0.75 if member == "front" else 0.5)
        belt_definition = package.custom(name + "_belt", shape, material="6 mm welded PU cord; supplier/source pending",
                                         stock="Custom round friction belt; drawn INSTALLED geometry, not timing; qualified cut length, weld loss, creep and load test required")
        package.add(name + "_belt", belt_definition, location((axial, 0, 0), (1, 0, 0)), "pickup", "belt", "shaft_" + member, motion)
        entry = {"id": name + "_belt", "closed": True, "drive_members": ["middle", member], "type": "round friction, not timing",
                 "axial_plane_mm": axial, "center_distance_mm": math.dist(centers["middle"], centers[member]),
                 "nominal_length": layout["installed_length_mm"], **layout,
                 "floating_compensation": "constant center; front belt and idler follow floating arm around middle axis" if member == "front" else "fixed relative to pickup",
                 "sourcing": "PENDING; custom model, not authentic COTS", "load_test_required": True,
                 "pretension_force_N": None, "cut_length_released": False, "status": STATUS}
        package.belts.append(entry)
        loops.append(entry)
        idlers.append(_add_idler(package, name + "_idler", centers["middle"], centers[member], axial, member, motion, layout))
    stop_bridge = _replace_left_stop_support(package, centers["middle"])
    stacks = [_capture_row(package, rows[name], centers[name], [planes[name]] if name != "middle" else list(planes.values()))
              for name in ("front", "middle", "rear")]
    for item in package.missing:
        if item["id"] == "star_axial_retention":
            item["reason"] = "Upper-row sleeve/capture B-reps now present; tolerances, end-float and loaded retention still unqualified"
    package.missing.append({"id": "tx_round_cord_qualification", "reason": "Supplier, splice process, tension force, slip, creep, guarding and load tests unresolved; 30 A is only an initial test limit"})
    current_ids = {instance["id"] for instance in package.instances}
    counts = Counter(instance["definition"] for instance in package.instances)
    package.transmission = {"status": STATUS, "loops": loops, "idlers": idlers, "capture_stacks": stacks, "stop_bridge": stop_bridge,
                            "added_instances": sorted(current_ids - original_ids), "removed_instances": sorted(original_ids - current_ids),
                            "net_instance_delta": len(package.instances) - before,
                            "new_definition_quantities": {name: counts[name] for name in sorted(set(package.definitions) - original_definitions)},
                            "zero_quantity_definitions": sorted(name for name in package.definitions if not counts[name]),
                            "unresolved": ["kick_reversal", "kick_hub_and_sleeve_torque_attachment", "fold_positive_hub_flange", "fold_5_to_1_torque", "whole_assembly_sweep_and_guarding"],
                            "minimum_pulley_axial_gap_mm": abs(planes["front"] - planes["rear"]) - 12,
                            "maximum_left_hardware_x_mm": min(planes.values()) - 22,
                            "removal": "Release idler clamps; slide off welded loop after outboard bracket removal. Remove left M5 end screw/washer and sleeves/pulleys, then withdraw shaft toward left; wheel service requires shaft withdrawal.",
                            "evidence": "Modeled geometry and focused slice tests only; no physical pass or manufacturing release"}
    return package