import importlib.util
import json
import math
from pathlib import Path
import sys


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent


def belt_length(distance, first_teeth, second_teeth, pitch=5):
    first_radius, second_radius = [teeth * pitch / (2 * math.pi) for teeth in (first_teeth, second_teeth)]
    difference = abs(second_radius - first_radius)
    if distance <= difference:
        raise ValueError("Pulley pitch circles cannot have external tangents")
    angle = math.asin(difference / distance)
    return 2 * math.sqrt(distance ** 2 - difference ** 2) + math.pi * (first_radius + second_radius) + 2 * difference * angle


def belt_center(length, first_teeth, second_teeth, pitch=5):
    lower = abs(second_teeth - first_teeth) * pitch / (2 * math.pi) + 1e-6
    upper = length / 2
    if belt_length(lower, first_teeth, second_teeth, pitch) >= length:
        raise ValueError("Belt too short")
    for iteration in range(70):
        middle = (lower + upper) / 2
        if belt_length(middle, first_teeth, second_teeth, pitch) > length:
            upper = middle
        else:
            lower = middle
    return (lower + upper) / 2


def circle_intersection(first, first_radius, second, second_radius, branch=1):
    distance = math.dist(first, second)
    along = (first_radius ** 2 - second_radius ** 2 + distance ** 2) / (2 * distance)
    height_squared = first_radius ** 2 - along ** 2
    if height_squared < 0:
        raise ValueError("Carrier and belt circles do not intersect")
    direction = [(second[index] - first[index]) / distance for index in range(2)]
    height = branch * math.sqrt(height_squared)
    return [first[0] + along * direction[0] - height * direction[1],
            first[1] + along * direction[1] + height * direction[0]]


def chain_layout(first_teeth, second_teeth, first_wrap, second_wrap, links, pitch=6.35):
    straight = (links - first_wrap - second_wrap) / 2
    if straight != int(straight) or straight < 1 or links % 2:
        raise ValueError("Even closed chain with integral straight runs required")
    straight = int(straight)
    radii = [pitch / (2 * math.sin(math.pi / count)) for count in (first_teeth, second_teeth)]
    angles = [math.pi - first_wrap * math.pi / first_teeth, second_wrap * math.pi / second_teeth]
    delta = radii[1] * math.sin(angles[1]) - radii[0] * math.sin(angles[0])
    center = math.sqrt((straight * pitch) ** 2 - delta ** 2) - radii[1] * math.cos(angles[1]) + radii[0] * math.cos(angles[0])
    points = [[radii[0] * math.cos(angles[0] + index * 2 * math.pi / first_teeth),
               radii[0] * math.sin(angles[0] + index * 2 * math.pi / first_teeth)] for index in range(first_wrap + 1)]
    second_bottom = [center + radii[1] * math.cos(angles[1]), -radii[1] * math.sin(angles[1])]
    start = points[-1]
    points += [[start[axis] + (second_bottom[axis] - start[axis]) * index / straight for axis in range(2)] for index in range(1, straight)]
    points += [[center + radii[1] * math.cos(-angles[1] + index * 2 * math.pi / second_teeth),
                radii[1] * math.sin(-angles[1] + index * 2 * math.pi / second_teeth)] for index in range(second_wrap + 1)]
    start, end = points[-1], points[0]
    points += [[start[axis] + (end[axis] - start[axis]) * index / straight for axis in range(2)] for index in range(1, straight)]
    return {"center_mm": center, "points": points, "pitch_mm": pitch, "links": links,
            "wrap_teeth": [first_wrap, second_wrap], "pitch_radii_mm": radii, "contact_angles_rad": angles}


def load_sibling(name):
    specification = importlib.util.spec_from_file_location("powertrain_" + name, ROOT / (name + ".py"))
    module = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(module)
    return module


def tangent_route(centers, radii):
    tangents = []
    count = len(centers)
    for index, first in enumerate(centers):
        following = (index + 1) % count
        second = centers[following]
        distance = math.dist(first, second)
        direction = math.atan2(second[1] - first[1], second[0] - first[0])
        angle = direction - math.acos((radii[index] - radii[following]) / distance)
        normal = [math.cos(angle), math.sin(angle)]
        tangents.append(([first[axis] + radii[index] * normal[axis] for axis in range(2)],
                         [second[axis] + radii[following] * normal[axis] for axis in range(2)], angle))
    arcs, length = [], 0
    for index, center in enumerate(centers):
        start = tangents[(index - 1) % count][2]
        end = tangents[index][2]
        sweep = (end - start) % (2 * math.pi)
        arcs.append((start, sweep))
        length += radii[index] * sweep + math.dist(tangents[index][0], tangents[index][1])
    return tangents, arcs, length


class Installer:
    def __init__(self, assembly):
        self.assembly = assembly
        self.module = assembly.pickup_module
        self.cq = assembly.cq
        self.sources = load_sibling("transmission_sources")
        self.report = {"schema": "coaxial-powertrain-installation/v1", "removed_ids": [], "replaced_ids": [],
                       "stacks": [], "paths": [], "supports": [], "attachments": [], "source_datums": {},
                       "release_status": "NOT_RELEASED", "global_completion": False}
        self.before = len(assembly.instances)
        self.vendor_cache = {}

    def define(self, name, shape, **metadata):
        key = "pt_" + name
        if key not in self.assembly.definitions:
            self.assembly.define(key, shape, metadata.pop("material", "6061-T6 provisional; not certified"),
                                 metadata.pop("kind", "custom_brep"), "powered_transmissions", **metadata)
        return key

    def pose(self, axial, center, axis=0, sign=1):
        if axis == 0:
            return self.module.location((axial, *center), (sign, 0, 0))
        return self.assembly.model.location((*center, axial), (0, 0, sign))

    def add(self, name, definition, axial, center=(0, 0), motion="fixed", role="structure", axis=0, sign=1):
        identifier = "pt_" + name
        self.assembly.add(identifier, definition, self.pose(axial, center, axis, sign), motion, role)
        return identifier

    def remove(self, identifiers):
        selected = set(identifiers)
        actual = [part["id"] for part in self.assembly.instances if part["id"] in selected]
        self.report["removed_ids"].extend(actual)
        self.assembly.instances = [part for part in self.assembly.instances if part["id"] not in selected]

    def replace(self, identifier, shape, pose=None, **metadata):
        part = next(part for part in self.assembly.instances if part["id"] == identifier)
        old = part["definition"]
        part["definition"] = self.define("replacement_" + identifier + "_" + str(len(self.report["replaced_ids"])), shape, **metadata)
        if pose is not None:
            part["pose"] = pose
        self.report["replaced_ids"].append({"id": identifier, "old_definition": old, "new_definition": part["definition"]})
        return part

    def vendor(self, sku):
        if sku in self.vendor_cache:
            return self.vendor_cache[sku]
        if sku.startswith("WCP-"):
            shape, binding = self.sources.load(sku, self.cq)
            from OCP.BRepAdaptor import BRepAdaptor_Surface
            from OCP.GeomAbs import GeomAbs_Plane
            flats = []
            for face in shape.Faces():
                surface = BRepAdaptor_Surface(face.wrapped)
                if surface.GetType() == GeomAbs_Plane:
                    plane = surface.Plane()
                    direction, origin = plane.Axis().Direction(), plane.Location()
                    offset = abs(direction.X() * origin.X() + direction.Y() * origin.Y())
                    if abs(direction.Z()) < 1e-6 and abs(offset - 6.3754) < 0.04:
                        flats.append(math.degrees(math.atan2(direction.Y(), direction.X())) % 60)
            clock = 0
            if binding["bore"] == "half-inch hex":
                if len(flats) < 6:
                    raise ValueError("Vendor hex bore planes missing: " + sku)
                clock = (30 - flats[0]) % 60
                shape = shape.rotate((0, 0, 0), (0, 0, 1), clock)
            bounds = self.module.bounds(shape)
            if abs(bounds[2] + bounds[5]) > 1e-5:
                raise ValueError("Source axial midpoint not zero")
            self.report["source_datums"][sku] = {"bounds_mm": bounds, "clock_deg": clock,
                                                "bore_plane_count": len(flats), "sha256": binding["sha256"]}
        else:
            shape, binding = self.module.vendor(sku)
        key = self.define(sku, shape, material="Manufacturer source; see binding", kind="authentic_vendor_brep", source_binding=binding)
        self.assembly.sources["powertrain_" + sku] = binding
        self.vendor_cache[sku] = key
        return key

    def interval(self, identifier, axis=0):
        part = next(part for part in self.assembly.instances if part["id"] == identifier)
        bounds = self.module.bounds(self.assembly.shape(part))
        return [bounds[axis], bounds[axis + 3], identifier]

    def bolt(self, name, axial, center, length, motion="fixed", axis=0, sign=1, diameter=5):
        shape = self.module.cylinder(diameter / 2, length, (0, 0, -length / 2)).fuse(
            self.module.cylinder(diameter * 0.85, diameter, (0, 0, diameter / 2)))
        definition = self.define("screw_" + str(diameter) + "_" + str(length), shape,
                                 kind="standard_hardware_nominal_brep", material="Steel grade unqualified",
                                 thread="M5 nominal" if diameter == 5 else "10-32 UNF nominal", length_mm=length)
        return self.add(name, definition, axial, center, motion, "fastener", axis, sign)

    def tube(self, name, start, end, center, motion="fixed", axis=0, outer=19, inner=15):
        if end <= start:
            raise ValueError("Nonpositive spacer: " + name)
        key = self.define("tube_" + "_".join(format(value, ".6f") for value in (end - start, outer, inner)),
                          self.module.ring(outer, inner, end - start), process="lathe_face_cut_stock")
        return self.add(name, key, (start + end) / 2, center, motion, "spacer", axis)

    def nut(self, name, axial, center, motion="fixed", axis=0):
        shape = self.module.hex_prism(8, 5).cut(self.module.cylinder(2.1, 7))
        key = self.define("M5_nut", shape, kind="standard_hardware_nominal_brep", material="Steel; locking method unqualified")
        return self.add(name, key, axial, center, motion, "fastener", axis)

    def stack(self, name, center, ends, occupied, motion="fixed", axis=0, shaft_id=None, clock=0):
        entries = sorted(occupied)
        shaft = self.module.tapped_shaft(ends[1] - ends[0]).rotate((0, 0, 0), (0, 0, 1), clock)
        if shaft_id:
            self.replace(shaft_id, shaft, self.pose(sum(ends) / 2, center, axis), process="cut_hex_end_tap")
        else:
            shaft_id = self.add(name + "_shaft", self.define(name + "_shaft", shaft, process="cut_hex_end_tap"),
                                sum(ends) / 2, center, motion, "hard_shaft", axis)
        cursor, spacers = ends[0], []
        for index, (start, end, identifier) in enumerate(entries + [[ends[1], ends[1], "end"]]):
            if start < cursor - 1e-5 or end > ends[1] + 1e-5:
                raise ValueError("Overlapping stack " + name + ": " + identifier + " at " + str([cursor, start, end]))
            allowance = 0.2 if index == 0 else 0
            if start - cursor > allowance + 1e-5:
                spacers.append(self.tube(name + "_spacer_" + str(index), cursor + allowance, start, center, motion, axis))
            elif allowance:
                raise ValueError("No end-float allowance: " + name)
            cursor = end
        washer = self.define("end_washer", self.module.ring(19, 5.5, 2), material="Steel nominal")
        for sign, end in zip((-1, 1), ends):
            self.add(name + "_washer_" + str(sign), washer, end + sign, center, motion, "retainer", axis)
            self.bolt(name + "_end_screw_" + str(sign), end + sign * 2, center, 12, motion, axis, sign)
        self.report["stacks"].append({"id": name, "shaft_id": shaft_id, "ends_mm": ends, "occupied": entries,
                                      "axis": axis, "spacers": spacers, "end_float_mm": 0.2,
                                      "thread_engagement_mm": 10, "thread_drill_depth_mm": 14,
                                      "fit_and_load_qualified": False})
        return shaft_id

    def loop(self, name, centers, teeth, axial, motion, sku, axis=0, pitch=5, width=9):
        radii = [count * pitch / (2 * math.pi) for count in teeth]
        tangents, arcs, length = tangent_route(centers, radii)
        edges = []
        for index, center in enumerate(centers):
            start, sweep = arcs[index]
            points = [self.cq.Vector(center[0] + radii[index] * math.cos(start + fraction * sweep),
                                     center[1] + radii[index] * math.sin(start + fraction * sweep), 0)
                      for fraction in (0, 0.5, 1)]
            edges.append(self.cq.Edge.makeThreePointArc(*points))
            edges.append(self.cq.Edge.makeLine(self.cq.Vector(*tangents[index][0], 0), self.cq.Vector(*tangents[index][1], 0)))
        wire = self.cq.Wire.assembleEdges(edges)
        outer = wire.offset2D(2 if pitch == 5 else 0.75)[0]
        inner = wire.offset2D(0.5 if pitch == 5 else -0.75)[0]
        shape = self.cq.Solid.extrudeLinear(outer, [inner], self.cq.Vector(0, 0, width)).translate((0, 0, -width / 2))
        key = self.define(name, shape, material="Nominal belt backing, NOT manufacturer CAD" if pitch == 5 else "Nominal chain routing, NOT manufacturer CAD",
                          pitch_mm=pitch, width_mm=width, computed_length_mm=length, pitch_count=length / pitch,
                          teeth_not_modeled=True, closed=True, sku=sku, wrap_degrees=[math.degrees(arc[1]) for arc in arcs])
        identifier = self.add(name, key, axial, motion=motion, role="belt" if pitch == 5 else "chain", axis=axis)
        self.report["paths"].append({"id": name, "instance": identifier, "centers": centers, "teeth": teeth,
                                    "axial_mm": axial, "axis": axis, "motion": motion, "pitch_mm": pitch,
                                    "length_mm": length, "pitch_count": length / pitch, "sku": sku,
                                    "wrap_deg": [math.degrees(arc[1]) for arc in arcs], "geometry_closed": True,
                                    "load_qualified": False, "nominal_backing_only": True})
        return identifier

    def plate(self, name, points, holes, axial, motion="fixed", axis=0, clearances=()):
        shape = self.module.web(points, 10, 6)
        for horizontal, vertical, diameter in holes:
            if diameter > 20:
                shape = shape.fuse(self.module.cylinder(diameter / 2 + 8, 6, (horizontal, vertical, 0)))
        shape = self.module.drill(shape, holes, 6)
        for center, diameter in clearances:
            shape = shape.cut(self.module.cylinder(diameter / 2, 8, (*center, 0)))
        key = self.define(name, shape, holes=holes, process="flat_router_plate_then_finish_bore")
        return self.add(name, key, axial, motion=motion, axis=axis)

    def bearing(self, name, axial, center, sign, motion="fixed", axis=0):
        return self.add(name, self.vendor("hex_bearing"), axial, center, motion, "bearing", axis, sign)

    def keeper(self, name, axial, center, sign, motion="fixed", axis=0):
        holes = [(center[0] + offset, center[1], 5.5) for offset in (-21, 21)]
        shape = self.module.web([(center[0] - 21, center[1]), (center[0] + 21, center[1])], 8, 2)
        shape = self.module.drill(shape, [(*center, 24), *holes], 2)
        key = self.define(name + "_keeper", shape, holes=holes, process="flat_router_plate")
        self.add(name + "_keeper", key, axial + sign * 2.6375, motion=motion, axis=axis)
        for index, point in enumerate(holes):
            self.bolt(name + "_keeper_screw_" + str(index), axial + sign * 3.6375, point[:2], 16, motion, axis, sign)
            self.nut(name + "_keeper_nut_" + str(index), axial - sign * 8.5, point[:2], motion, axis)

    def modify_plate(self, identifier, anchors, root, clearance=()):
        part = next(part for part in self.assembly.instances if part["id"] == identifier)
        original = self.assembly.definitions[part["definition"]]["shape"]
        bottom = min(face.Center().z for face in original.Faces() if face.geomType() == "PLANE")
        lower_faces = [face for face in original.Faces() if face.geomType() == "PLANE" and abs(face.Center().z - bottom) < 1e-5]
        lower = max(lower_faces, key=lambda face: face.Area())
        footprint = self.cq.Solid.extrudeLinear(lower.outerWire(), [], self.cq.Vector(0, 0, 6))
        voids = footprint.cut(original)
        shape = original.fuse(self.module.web([root, *anchors, root], 10, 6)).cut(voids).clean()
        for center, diameter in clearance:
            if abs(diameter - 28.57) < 1e-5:
                shape = shape.fuse(self.module.cylinder(23, 6, (*center, 0))).cut(voids)
        holes = [(*center, 5.5) for center in anchors] + [(*center, diameter) for center, diameter in clearance]
        shape = self.module.drill(shape, holes, 6)
        self.replace(identifier, shape, added_holes=holes, process="flat_router_plate_then_finish_bore")

    def pickup_stage(self, rear):
        input_direction = self.assembly.pickup.config.get("pickup_input_direction", -1)
        if input_direction not in (-1, 1):
            raise ValueError("Pickup input direction must be -1 or +1")
        center = [rear[0], rear[1] + input_direction * belt_center(350, 18, 36)]
        motor = [center[0] + 45.72, center[1]]
        self.remove([part["id"] for part in self.assembly.instances if part["id"].startswith("pickup_")])
        package = self.assembly.model.Package(self.assembly.model.parameters())
        package.import_cache.update(self.assembly.retained.import_cache)
        package.settings["pickup"]["sideplate_x"] = 255
        package.drive("pickup", center, motor, 260, (1, 0, 0), "dock", "new_supported_plate")
        package.instances = [part for part in package.instances if not part["id"].endswith(("_output_spacer", "_output_end"))]
        self.assembly.import_package(package, "pt_drive_", "powered_transmissions", "fixed")
        anchors = [[center[0] + delta, center[1] + vertical] for delta, vertical in ((-27, -50), (27, -50), (27, 50), (-27, 50))]
        holes = [(*point, 5.5) for point in anchors] + [(*center, 28.57)]
        holes += [(center[0] + offset, center[1], 5.5) for offset in (-21, 21)]
        self.plate("pickup_outer_plate", [center, *anchors, center], holes, 303, clearances=[(motor, 27)])
        motor_clearance = [(motor, 19.1)] + [([motor[0] + 17.4625 * math.cos(math.radians(angle)), motor[1] + 17.4625 * math.sin(math.radians(angle))], 5.2) for angle in (0, 120, 240)]
        self.modify_plate("pt_drive_pickup_mount", anchors + [[center[0] - 21, center[1]], [center[0] + 21, center[1]]], center,
                  [(center, 28.57), *motor_clearance])
        self.modify_plate("coaxial_frame_plate_1", anchors, rear)
        pickup_slots = [([point[0], point[1] - 2], [point[0], point[1] + 2]) for point in anchors]
        self.slot_plate("coaxial_frame_plate_1", pickup_slots, 5.5)
        for index, anchor in enumerate(anchors):
            self.tube("pickup_column_" + str(index), 266, 300, anchor, outer=12, inner=5.5)
            self.tube("pickup_frame_gap_" + str(index), 306, 307, anchor, outer=12, inner=5.5)
            self.bolt("pickup_box_bolt_" + str(index), 314, anchor, 60)
            self.nut("pickup_box_nut_" + str(index), 257.5, anchor)
        first = "pt_drive_pickup_output_bearing"
        second = self.bearing("pickup_outer_bearing", 300, center, -1)
        self.keeper("pickup_inner", 266, center, 1)
        self.keeper("pickup_outer", 300, center, -1)
        pulley = self.add("pickup_18T", self.vendor("WCP-0563"), 289, center, role="pulley")
        members = [first, second, "pt_drive_pickup_60T", pulley]
        self.stack("pickup_stage", center, [257, 310], [self.interval(member) for member in members])
        self.report["supports"].append({"id": "pickup_stage", "bearings": [first, second], "spacing_mm": 34})
        self.report["attachments"].append({"id": "pickup_to_frame", "parent": "coaxial_frame_plate_1", "holes": anchors,
                           "through_bolts": 4, "takeup_slots_mm": pickup_slots, "travel_mm": 4})
        rear_pulley = self.add("rear_36T", self.vendor("WCP-0990"), 289, rear, role="pulley")
        self.loop("pickup_reduction", [center, rear], [18, 36], 289, "fixed", "WCP-0619")
        return rear_pulley

    def upper_loops(self, rows):
        members = {row: [] for row in ("front", "middle", "rear")}
        belt_skus = self.assembly.pickup.config.get("upper_belt_skus", ["WCP-0623", "WCP-0621"])
        for name, first, second, axial, sku in (("front_middle", "middle", "front", -253, belt_skus[0]),
                                               ("rear_middle", "rear", "middle", -271, belt_skus[1])):
            motion = "float" if first == "middle" and second == "front" else "fold"
            for row in (first, second):
                identifier = self.add(name + "_" + row, self.vendor("WCP-0563"), axial, rows[row],
                                      "fixed" if row == "rear" else "float" if row == "front" else "fold", "pulley")
                members[row].append(identifier)
            self.loop(name, [rows[first], rows[second]], [18, 18], axial, motion, sku)
        for row, negative_end in (("front", -264), ("middle", -282)):
            remove = ["v2_" + row + suffix for suffix in ("_outer_-1", "_end_washer_-1", "_end_screw_-1")]
            self.remove(remove)
            self.replace("v2_shaft_" + row, self.module.tapped_shaft(250 - negative_end),
                         self.pose((250 + negative_end) / 2, rows[row]), process="asymmetric_extended_hex_shaft")
            occupied = [self.interval(identifier) for identifier in members[row]]
            self.stack(row + "_negative_extension", rows[row], [negative_end, -242], occupied,
                       "float" if row == "front" else "fold")
            self.remove(["pt_" + row + "_negative_extension_shaft", "pt_" + row + "_negative_extension_washer_1", "pt_" + row + "_negative_extension_end_screw_1"])
            self.report["stacks"][-1].update(shaft_id="v2_shaft_" + row, partial_stack=True, positive_end="Existing +250 retained", interface_end_mm=-241.5875)
            self.tube(row + "_bearing_interface", -242, -241.5875, rows[row], "float" if row == "front" else "fold")
        return members["rear"]

    def reverse_stage(self, rows):
        rear, kicker = rows["rear"], rows["kick"]
        reverse_length = self.assembly.pickup.config.get("reverse_belt_length_mm", 700)
        reverse_sku = self.assembly.pickup.config.get("reverse_belt_sku", "WCP-0634")
        reverse = circle_intersection(rear, 76.2, kicker, belt_center(reverse_length, 36, 15), -1)
        anchors = [[rear[0] + horizontal, rear[1] + vertical] for horizontal, vertical in ((-15, -55), (30, -45), (30, 45), (-30, 45))]
        holes = [(*point, 5.5) for point in anchors] + [(*reverse, 28.57)]
        keeper_holes = [[reverse[0] - 21, reverse[1]], [reverse[0] + 21, reverse[1]]]
        holes += [(*point, 5.5) for point in keeper_holes]
        for name, axial in (("inner", 237), ("outer", 286)):
            self.plate("reverse_" + name + "_plate", [reverse, *keeper_holes, *anchors, reverse], holes, axial, "fold", clearances=[(rear, 65)])
        self.modify_plate("v2_main_cheek_1", anchors, rear, [(rear, 28.57)])
        carrier_slots = []
        for point in anchors:
            delta = [point[axis] - rear[axis] for axis in range(2)]
            carrier_slots.append([[rear[0] + delta[0] * math.cos(angle) - delta[1] * math.sin(angle),
                                   rear[1] + delta[0] * math.sin(angle) + delta[1] * math.cos(angle)]
                                  for angle in (math.radians(-1), math.radians(1))])
        self.slot_plate("v2_main_cheek_1", carrier_slots, 5.5)
        for index, point in enumerate(anchors):
            self.tube("reverse_inner_gap_" + str(index), 228, 234, point, "fold", outer=12, inner=5.5)
            self.tube("reverse_column_" + str(index), 240, 283, point, "fold", outer=12, inner=5.5)
            self.bolt("reverse_box_bolt_" + str(index), 290, point, 75, "fold")
            self.nut("reverse_box_nut_" + str(index), 219.5, point, "fold")
        first = self.bearing("reverse_inner_bearing", 240, reverse, 1, "fold")
        second = self.bearing("reverse_outer_bearing", 283, reverse, -1, "fold")
        self.keeper("reverse_inner", 240, reverse, 1, "fold")
        self.keeper("reverse_outer", 283, reverse, -1, "fold")
        gear = self.add("reverse_60T", self.vendor("hex_output_gear"), 251, reverse, "fold", "gear")
        rear_gear = self.add("rear_reverse_60T", self.vendor("hex_output_gear"), 251, rear, "fixed", "gear")
        pulley = self.add("reverse_36T", self.vendor("WCP-0990"), 269, reverse, "fold", "pulley")
        self.stack("reverse", reverse, [231, 294], [self.interval(identifier) for identifier in (first, second, gear, pulley)], "fold")
        kick_pulley = self.add("kick_15T", self.vendor("WCP-1420"), 269, kicker, "fold", "pulley")
        self.loop("reverse_kicker", [reverse, kicker], [36, 15], 269, "fold", reverse_sku)
        self.remove(["v2_kick" + suffix for suffix in ("_outer_1", "_end_washer_1", "_end_screw_1")])
        self.replace("v2_shaft_kick", self.module.tapped_shaft(532), self.pose(16, kicker), process="asymmetric_extended_hex_shaft")
        self.stack("kick_positive_extension", kicker, [229.5875, 282], [self.interval(kick_pulley)], "fold")
        self.remove(["pt_kick_positive_extension_shaft", "pt_kick_positive_extension_washer_-1", "pt_kick_positive_extension_end_screw_-1"])
        self.report["stacks"][-1].update(shaft_id="v2_shaft_kick", partial_stack=True, negative_end="Existing -250 retained")
        self.report["supports"].append({"id": "reverse", "bearings": [first, second], "spacing_mm": 43,
                                        "center_yz": reverse, "carrier_motion": "fold", "gear_center_mm": math.dist(reverse, rear)})
        self.report["attachments"].append({"id": "reverse_to_cheek", "parent": "v2_main_cheek_1", "holes": anchors,
                           "through_bolts": 4, "carrier_adjustment_deg": [-1, 1], "takeup_slots_mm": carrier_slots,
                           "setup": "Gauge 76.2 mm centers while clamping; chord slots approximate angular travel, no automatic gear-center constraint"})
        return rear_gear

    def install_pickup(self):
        rows = self.module.centers(self.assembly.pickup.config)
        rear_pulley = self.pickup_stage(rows["rear"])
        rear_upper = self.upper_loops(rows)
        rear_gear = self.reverse_stage(rows)
        self.remove(["v2_rear_to_frame_" + str(sign) for sign in (-1, 1)])
        for sign, members, ends in ((1, [rear_gear, rear_pulley], [229.5875, 306.65]),
                                    (-1, rear_upper, [-306.65, -229.5875])):
            prefix = "rear_bridge_" + str(sign)
            self.stack(prefix, rows["rear"], ends, [self.interval(member) for member in members])
            self.remove(["pt_" + prefix + suffix for suffix in ("_shaft", "_washer_-1", "_washer_1", "_end_screw_-1", "_end_screw_1")])
            self.report["stacks"][-1].update(shaft_id="v2_shaft_rear", partial_stack=True, retained_end_hardware=True)
        self.report["ratios"] = {"upper_motor_to_roller": -10, "kicker_motor_to_roller": 25 / 6,
                                  "fold_coupling": "Rear-to-reverse speeds are relative to moving carrier; command pickup motor during fold or keep intake disabled. Gears do not lock the frame."}

    def slot_plate(self, identifier, slots, width, clearance_slots=()):
        part = next(part for part in self.assembly.instances if part["id"] == identifier)
        shape = self.assembly.definitions[part["definition"]]["shape"]
        for start, end in slots:
            shape = shape.cut(self.module.web([start, end], width / 2, 8))
        for start, end, diameter in clearance_slots:
            shape = shape.cut(self.module.web([start, end], diameter / 2, 8))
        self.replace(identifier, shape.clean(), slots=slots, slot_width_mm=width, process="flat_router_plate")

    def indexer_idler(self, name, center, direction, lane, parent, bank_z):
        normal = [direction[1], -direction[0]]
        anchors = [[center[axis] + side * 29 * direction[axis] for axis in range(2)] for side in (-1, 1)]
        keeper_points = [[center[0] - 21, center[1]], [center[0] + 21, center[1]]]
        holes = [(*center, 28.57)] + [(*point, 5.5) for point in anchors + keeper_points]
        lower, upper = lane - 20, lane + 20
        for suffix, axial in (("lower", lower), ("upper", upper)):
            self.plate(name + "_" + suffix + "_plate", [center, *keeper_points, *anchors, center], holes, axial, axis=2)
        slots = [([point[axis] - 3 * normal[axis] for axis in range(2)],
                  [point[axis] + 3 * normal[axis] for axis in range(2)]) for point in anchors]
        self.modify_plate(parent, anchors, center)
        central_slot = [[center[axis] + side * 3 * normal[axis] for axis in range(2)] for side in (-1, 1)]
        self.slot_plate(parent, slots, 5.5, [(*central_slot, 36)])
        for index, point in enumerate(anchors):
            intervals = sorted({lower + 3, bank_z - 3, bank_z + 3, upper - 3})
            for segment, (start, end) in enumerate(zip(intervals, intervals[1:])):
                midpoint = (start + end) / 2
                if start >= lower + 3 - 1e-5 and end <= upper - 3 + 1e-5 and not bank_z - 3 < midpoint < bank_z + 3:
                    self.tube(name + "_column_" + str(index) + "_" + str(segment), start, end, point, axis=2, outer=12, inner=5.5)
            if lower - 3 > bank_z + 3:
                self.tube(name + "_bank_gap_" + str(index), bank_z + 3, lower - 3, point, axis=2, outer=12, inner=5.5)
            bottom = min(lower - 3, bank_z - 3)
            length = math.ceil((upper + 4 - bottom + 7) / 5) * 5
            self.bolt(name + "_clamp_" + str(index), upper + 4, point, length, axis=2)
            self.nut(name + "_clamp_nut_" + str(index), bottom - 2.5, point, axis=2)
        first = self.bearing(name + "_lower_bearing", lower + 3, center, 1, axis=2)
        second = self.bearing(name + "_upper_bearing", upper - 3, center, -1, axis=2)
        self.keeper(name + "_lower", lower + 3, center, 1, axis=2)
        self.keeper(name + "_upper", upper - 3, center, -1, axis=2)
        pulley = self.add(name + "_18T", self.vendor("WCP-0563"), lane, center, role="pulley", axis=2)
        self.stack(name, center, [lower - 8, upper + 8], [self.interval(identifier, 2) for identifier in (first, second, pulley)], axis=2)
        self.report["supports"].append({"id": name, "bearings": [first, second], "spacing_mm": 34,
                                        "adjustment_slots_mm": slots, "travel_mm": 6, "parent": parent})
        return pulley

    def install_indexers(self):
        lift = self.assembly.pickup.config["indexer_lift_mm"]
        settings = self.assembly.retained.settings["indexer"]
        for side, sign in (("L", -1), ("R", 1)):
            stations = [[sign * center[0], center[1]] for center in settings["stations_xy"]]
            self.remove([part["id"] for part in self.assembly.instances if part["id"] == "v1_indexer_belt_" + side
                         or part["id"].startswith("v1_dc_indexer_" + side)
                         or part["id"] in ["v1_indexer_" + side + str(station) + "_pulley" for station in range(3)]])
            pulleys = {station: [] for station in range(3)}
            for loop_index, length in enumerate((350, 320)):
                first, second = stations[loop_index:loop_index + 2]
                distance = math.dist(first, second)
                direction = [(second[axis] - first[axis]) / distance for axis in range(2)]
                idler_side = self.assembly.pickup.config.get("indexer_idler_sides", {}).get(side + "_" + str(loop_index), 1)
                if idler_side not in (-1, 1):
                    raise ValueError("Indexer idler side must be -1 or +1")
                normal = [idler_side * direction[1], -idler_side * direction[0]]
                half_side = (length - 90 - distance) / 2
                height = math.sqrt(half_side ** 2 - (distance / 2) ** 2)
                center = [(first[axis] + second[axis]) / 2 + height * normal[axis] for axis in range(2)]
                lane = 260 + 18 * loop_index + lift
                name = "indexer_" + side + "_" + str(loop_index)
                for station in (loop_index, loop_index + 1):
                    identifier = self.add(name + "_station_" + str(station), self.vendor("WCP-0563"), lane,
                                          stations[station], role="pulley", axis=2)
                    if station == 0:
                        part = self.assembly.instances[-1]
                        part["pose"] = part["pose"] * self.cq.Location(self.cq.Vector(), self.cq.Vector(0, 0, 1), 3)
                    pulleys[station].append(identifier)
                self.indexer_idler(name + "_idler", center, direction, lane, "v1_indexer_plate_" + side + "_247", 247 + lift)
                route = [first, center, second] if idler_side == 1 else [second, center, first]
                self.loop(name, route, [18, 18, 18], lane, "fixed", "WCP-0619" if loop_index == 0 else "WCP-1757", axis=2)
            for station, center in enumerate(stations):
                prefix = "indexer_" + side + str(station)
                old = next(stack for stack in self.assembly.capture_stacks if stack["id"] == "dc_" + prefix)
                occupied = [[start + lift, end + lift, "v1_" + identifier] for start, end, identifier in old["occupied_intervals_mm"]
                            if not identifier.endswith("_pulley")]
                occupied += [self.interval(identifier, 2) for identifier in pulleys[station]]
                top = (274 if station == 0 else 291) + lift
                self.stack(prefix, center, [82 + lift, top], occupied, axis=2, shaft_id="v1_" + prefix + "_shaft", clock=3 if station == 0 else 0)
            center = stations[0]
            anchors = [[center[0] + horizontal, center[1] + vertical] for horizontal, vertical in ((-28, -40), (28, -40), (28, 40), (-28, 40))]
            motor = [center[0] + sign * 45.72, center[1]]
            clearance = [(center, 28.57), (motor, 19.1)]
            clearance += [([motor[0] + 17.4625 * math.cos(math.radians(angle)), motor[1] + 17.4625 * math.sin(math.radians(angle))], 5.2) for angle in (0, 120, 240)]
            self.modify_plate("v1_indexer_drive_" + side + "_mount", anchors, center, clearance)
            self.modify_plate("v1_indexer_plate_" + side + "_114", anchors, center, [(center, 28.57)])
            for index, point in enumerate(anchors):
                self.tube("indexer_" + side + "_mount_gap_" + str(index), 90 + lift, 111 + lift, point, axis=2, outer=12, inner=5.5)
                self.bolt("indexer_" + side + "_mount_bolt_" + str(index), 118 + lift, point, 45, axis=2)
                self.nut("indexer_" + side + "_mount_nut_" + str(index), 81.5 + lift, point, axis=2)
            self.report["attachments"].append({"id": "indexer_" + side + "_motor_support", "parent": "v1_indexer_plate_" + side + "_114",
                                               "holes": anchors, "through_bolts": 4, "chassis_interface": "Parent raised-deck structure still required"})
        self.report["ratios"]["indexer_each"] = -5

    def chain(self, name, layout, start, end, lane):
        angle = math.atan2(end[1] - start[1], end[0] - start[0])
        points = [[start[0] + point[0] * math.cos(angle) - point[1] * math.sin(angle),
                   start[1] + point[0] * math.sin(angle) + point[1] * math.cos(angle)] for point in layout["points"]]
        roller = self.module.cylinder(1.651, 3.175)
        link = self.module.web([(0, 0), (6.35, 0)], 2.9, 0.75)
        link = self.module.drill(link, [(0, 0, 1.8), (6.35, 0, 1.8)], 0.75)
        shapes = []
        for index, point in enumerate(points):
            following = points[(index + 1) % len(points)]
            orientation = math.degrees(math.atan2(following[1] - point[1], following[0] - point[0]))
            shapes.append(roller.translate((*point, 0)))
            for side in (-1, 1):
                shapes.append(link.rotate((0, 0, 0), (0, 0, 1), orientation).translate((*point, side * (1.9625 + (index % 2) * 0.8))))
        shape = self.cq.Compound.makeCompound(shapes)
        definition = self.define(name, shape, material="Nominal #25 chain route; NOT vendor CAD or selected rated chain",
                                 pitch_mm=6.35, closed=True, links=layout["links"], tooth_seating_qualified=False,
                                 nominal_roller_diameter_mm=3.302, nominal_inside_width_mm=3.175)
        identifier = self.add(name, definition, lane, role="chain")
        self.report["paths"].append({"id": name, "instance": identifier, "pitch_mm": 6.35,
                                    "links": layout["links"], "pitch_points": points, "centers": [start, end],
                                    "axial_mm": lane, "geometry_closed": True, "actual_chord_pitch": True,
                                    "tooth_seating_qualified": False, "load_qualified": False})
        return identifier

    def deployment_flange(self, rear):
        source = json.loads((self.sources.CACHE / "datums.json").read_text())["WCP-0970"]
        candidates = []
        for face in source["faces"]:
            if face["type"] == "cylinder" and abs(face["radius"] - 2.4892) < 1e-5 and abs(math.hypot(*face["origin"][:2]) - 25.4) < 1e-5:
                point = face["origin"][:2]
                if not any(math.dist(point, prior) < 1e-5 for prior in candidates):
                    candidates.append(point)
        holes = []
        for angle in (30, 90, 150, 210, 270, 330):
            target = [25.4 * math.cos(math.radians(angle)), 25.4 * math.sin(math.radians(angle))]
            match = next((point for point in candidates if math.dist(point, target) < 1e-5), None)
            if match is None:
                raise ValueError("Documented MotionX two-inch pattern absent from source")
            holes.append(match)
        anchors = [[rear[0] + 42 * math.cos(math.radians(angle)), rear[1] + 42 * math.sin(math.radians(angle))] for angle in (45, 135, 225, 315)]
        adapter = self.module.ring(116, 36, 9)
        adapter = self.module.drill(adapter, [(*point, 5.2) for point in holes] +
                        [(point[0] - rear[0], point[1] - rear[1], 4.2) for point in anchors], 9)
        key = self.define("deployment_annular_adapter", adapter, process="lathe_ring_router_pattern",
                          center_bore_mm=36, source_holes_mm=holes, shaft_keyed=False,
                          drawing="WCP MotionX 2-inch Bolt Circle diagram, #10-32 hardware; exact passage checked against original STEP")
        self.add("deployment_adapter", key, -243, rear, "fold", "hub")
        self.add("deployment_60T_plate", self.vendor("WCP-0970"), -249, rear, "fold", "sprocket")
        self.modify_plate("v2_main_cheek_-1", anchors, rear)
        for index, point in enumerate(anchors):
            self.tube("deployment_cheek_gap_" + str(index), -238.5, -228, point, "fold", outer=12, inner=5.5)
            self.bolt("deployment_cheek_bolt_" + str(index), -221, point, 25, "fold")
        nut_shape = self.module.hex_prism(9.525, 4).cut(self.module.cylinder(2.05, 6))
        nut_definition = self.define("10_32_nut", nut_shape, material="Steel nominal", kind="standard_hardware_nominal_brep", thread="10-32 UNF")
        for index, point in enumerate(holes):
            center = [rear[axis] + point[axis] for axis in range(2)]
            self.bolt("deployment_plate_bolt_" + str(index), -251.5, center, 19.05, "fold", sign=-1, diameter=4.826)
            self.add("deployment_plate_nut_" + str(index), nut_definition, -236.5, center, "fold", "fastener")
        self.report["attachments"].append({"id": "independent_deployment_flange", "parent": "v2_main_cheek_-1",
                                           "center_yz": rear, "bore_mm": 36, "keyed_to_rear_shaft": False,
                                           "source_plate_sku": "WCP-0970", "source_hole_centers_mm": holes,
                                           "plate_screws": "6 x #10-32 UNF x19.05", "cheek_bolts": 4,
                                           "cheek_threads": "M5x25 into adapter, nominal 7.5 mm engagement, 1.5 mm tip-to-sprocket clearance",
                                         "bolt_circle_mm": 50.8, "documented_pattern": True,
                                         "drawing_sha256": self.sources.digest(self.sources.CACHE / "motionx-two-inch.svg"),
                                         "remaining": "Pattern documented and source passages tested; fits, tolerances, bolt preload and strength not released"})
        tapped_joint = {"id": "pt_deployment_cheek_adapter_taps", "type": "nominal_thread_engagement", "thread": "M5", "tap_drill_mm": 4.2, "screw_major_mm": 5, "engagement_mm": 7.5, "tip_to_vendor_plate_mm": 1.5, "load_qualified": False}
        tapped_joint["parts"] = ["pt_deployment_adapter"] + ["pt_deployment_cheek_bolt_" + str(index) for index in range(4)]
        self.assembly.joints.append(tapped_joint)

    def deployment_eccentrics(self, center):
        eccentric_center = [center[0] - 1.5, center[1]]
        for suffix, plate_id, face, sign in (("inner", "pt_deploy_deployment_mount", -292, 1),
                                             ("outer", "pt_deployment_outer_plate", -235, -1)):
            part = next(part for part in self.assembly.instances if part["id"] == plate_id)
            shape = self.assembly.definitions[part["definition"]]["shape"]
            shape = shape.fuse(self.module.cylinder(42, 6, (*eccentric_center, 0)))
            holes = [(*eccentric_center, 40.02)] + [(center[0] + offset, center[1], 5.5) for offset in (-33, 33)]
            shape = self.module.drill(shape, holes, 6)
            self.replace(plate_id, shape, holes=holes, process="router_and_finish_eccentric_socket")
            cartridge = self.module.cylinder(20, 6, (-1.5, 0, 0)).cut(self.module.cylinder(14.285, 8))
            flange = self.module.cylinder(24, 1.5, (-1.5, 0, sign * 3.75)).cut(self.module.cylinder(18, 10))
            cartridge = cartridge.fuse(flange).clean()
            key = self.define("deployment_" + suffix + "_eccentric", cartridge, process="lathe_and_offset_finish_bore",
                              eccentricity_mm=1.5, outside_mm=40, seat_mm=28.57, fit_qualified=False)
            self.add("deployment_" + suffix + "_eccentric", key, face - sign * 3, center, role="bearing_carrier")
            prefix = "pt_deployment_second_" + suffix + "_keeper"
            self.remove([part["id"] for part in self.assembly.instances if part["id"].startswith(prefix)])
            keeper = self.module.ring(80, 24, 2)
            keeper = self.module.drill(keeper, [(-33, 0, 5.5), (33, 0, 5.5)], 2)
            key = self.define("eccentric_keeper", keeper, process="flat_router_plate")
            self.add("deployment_" + suffix + "_eccentric_keeper", key, face + sign * 2.6375, center)
            for index, offset in enumerate((-33, 33)):
                point = [center[0] + offset, center[1]]
                self.bolt("deployment_" + suffix + "_eccentric_clamp_" + str(index), face + sign * 3.6375, point, 16, sign=sign)
                self.nut("deployment_" + suffix + "_eccentric_nut_" + str(index), face - sign * 8.5, point)
        self.report["attachments"].append({"id": "deployment_chain_adjustment", "type": "paired_clamped_eccentric_bearing_cartridges",
                                           "bearing_center": center, "socket_center": eccentric_center, "eccentricity_mm": 1.5,
                                           "travel_diameter_mm": 3, "setting": "Set both eccentrics to identical angle, gauge both chain tensions; pretension/load not approved"})

    def clock_gears(self):
        def tooth_phase(shape, count):
            radius = count * 25.4 / 40
            occupied = []
            for index in range(120):
                angle = 2 * math.pi * index / (count * 120)
                if shape.isInside(self.cq.Vector(radius * math.cos(angle), radius * math.sin(angle), 0), 1e-7):
                    occupied.append(angle)
            if not occupied:
                raise ValueError("No source material at gear pitch circle")
            return math.atan2(sum(math.sin(count * angle) for angle in occupied),
                              sum(math.cos(count * angle) for angle in occupied)) / count
        phases = {}
        pairs = [("pt_drive_pickup_12T", "pt_drive_pickup_60T", 12, 60, math.radians(30)),
                 ("pt_rear_reverse_60T", "pt_reverse_60T", 60, 60, 0),
                 ("pt_deploy_deployment_12T", "pt_deploy_deployment_60T", 12, 60, math.radians(30))]
        records = []
        for input_id, output_id, input_teeth, output_teeth, input_clock in pairs:
            instances = {part["id"]: part for part in self.assembly.instances}
            first, second = instances[input_id], instances[output_id]
            first_matrix, second_matrix = [self.module.matrix(part["pose"]) for part in (first, second)]
            centers = [[matrix[1][3], matrix[2][3]] for matrix in (first_matrix, second_matrix)]
            angle = math.atan2(centers[1][1] - centers[0][1], centers[1][0] - centers[0][0])
            tooth_phases = []
            for part, teeth in ((first, input_teeth), (second, output_teeth)):
                key = part["definition"]
                if key not in phases:
                    phases[key] = tooth_phase(self.assembly.definitions[key]["shape"], teeth)
                tooth_phases.append(phases[key])
            clock = (angle + math.pi - tooth_phases[1] + (input_teeth * (angle - input_clock - tooth_phases[0]) - math.pi) / output_teeth) % (2 * math.pi / output_teeth)
            for part in self.assembly.instances:
                if part["role"] not in {"hard_shaft", "gear", "pulley", "sprocket", "bearing", "spacer", "fastener"}:
                    continue
                matrix = self.module.matrix(part["pose"])
                if abs(matrix[0][2]) > 0.999 and math.dist([matrix[1][3], matrix[2][3]], centers[1]) < 1e-5:
                    part["pose"] = part["pose"] * self.cq.Location(self.cq.Vector(), self.cq.Vector(0, 0, 1), math.degrees(clock) * matrix[0][2])
            records.append({"input": input_id, "output": output_id, "teeth": [input_teeth, output_teeth],
                            "centers_mm": math.dist(*centers), "output_clock_deg": math.degrees(clock),
                            "basis": "120 material samples per source tooth pitch; matched conjugate phase; exact overlap regression required",
                            "source_motor_rotor": "Fused rotor in X44 STEP is not an independently posed mechanism"})
        self.report["gear_meshes"] = records

    def install_deployment(self):
        rear = self.module.centers(self.assembly.pickup.config)["rear"]
        first_chain = chain_layout(14, 36, 6, 20, 56)
        final_chain = chain_layout(16, 60, 7, 33, 90)
        second = [rear[0] + final_chain["center_mm"], rear[1]]
        first = [second[0], second[1] - first_chain["center_mm"]]
        motor = [first[0] + 45.72, first[1]]
        self.remove([part["id"] for part in self.assembly.instances if part["id"].startswith("deployment_")])
        package = self.assembly.model.Package(self.assembly.model.parameters())
        package.import_cache.update(self.assembly.retained.import_cache)
        package.settings["pickup"]["sideplate_x"] = -303
        package.drive("deployment", first, motor, -298, (1, 0, 0), "dock", "paired_deployment_box")
        package.instances = [part for part in package.instances if not part["id"].endswith(("_output_spacer", "_output_end"))]
        self.assembly.import_package(package, "pt_deploy_", "powered_transmissions", "fixed")
        anchors = [[first[0] - 40, first[1] - 52], [first[0] + 40, first[1] - 52],
                   [second[0] + 55, second[1] + 35], [second[0] - 30, second[1] + 35]]
        keeper_points = [[center[0] + delta, center[1]] for center in (first, second) for delta in (-21, 21)]
        holes = [(*point, 5.5) for point in anchors + keeper_points] + [(*center, 28.57) for center in (first, second)]
        motor_holes = [([motor[0] + 17.4625 * math.cos(math.radians(angle)), motor[1] + 17.4625 * math.sin(math.radians(angle))], 5.2) for angle in (0, 120, 240)]
        self.modify_plate("pt_deploy_deployment_mount", anchors + keeper_points + [second], first,
                          [(first, 28.57), (second, 28.57), (motor, 19.1), *motor_holes])
        self.plate("deployment_outer_plate", [first, second, *keeper_points, *anchors, first], holes, -232, clearances=[(motor, 27)])
        self.modify_plate("coaxial_frame_plate_-1", anchors, rear, [(motor, 66)])
        for index, point in enumerate(anchors):
            self.tube("deployment_column_" + str(index), -292, -235, point, outer=12, inner=5.5)
            self.tube("deployment_frame_gap_" + str(index), -307, -298, point, outer=12, inner=5.5)
            self.bolt("deployment_box_bolt_" + str(index), -228, point, 95)
            self.nut("deployment_box_nut_" + str(index), -315.5, point)
        members = {}
        for name, center in (("first", first), ("second", second)):
            inner = "pt_deploy_deployment_output_bearing" if name == "first" else self.bearing("deployment_second_inner_bearing", -292, center, 1)
            outer = self.bearing("deployment_" + name + "_outer_bearing", -235, center, -1)
            self.keeper("deployment_" + name + "_inner", -292, center, 1)
            self.keeper("deployment_" + name + "_outer", -235, center, -1)
            members[name] = [inner, outer]
            self.report["supports"].append({"id": "deployment_" + name, "bearings": [inner, outer], "spacing_mm": 57})
        first_sprocket = self.add("deployment_14T", self.vendor("WCP-0577"), -265, first, role="sprocket")
        second_sprocket = self.add("deployment_36T", self.vendor("WCP-2106"), -265, second, role="sprocket")
        final_sprocket = self.add("deployment_16T", self.vendor("WCP-0578"), -249, second, role="sprocket")
        members["first"] += ["pt_deploy_deployment_60T", first_sprocket]
        members["second"] += [second_sprocket, final_sprocket]
        for name, center in (("first", first), ("second", second)):
            self.stack("deployment_" + name, center, [-302, -227], [self.interval(member) for member in members[name]])
        self.chain("deployment_intermediate_chain", first_chain, first, second, -265)
        self.chain("deployment_final_chain", final_chain, second, rear, -249)
        self.deployment_flange(rear)
        self.deployment_eccentrics(second)
        self.report["ratios"]["deployment_motor_to_cheek"] = -5 * 36 / 14 * 60 / 16
        self.report["attachments"].append({"id": "deployment_to_frame", "parent": "coaxial_frame_plate_-1", "holes": anchors, "through_bolts": 4})
        tension = 43.497 / (final_chain["pitch_radii_mm"][1] / 1000)
        working_load = 209 * 4.4482216152605
        self.report["load_screen"] = {"output_torque_screen_Nm": 43.497, "basis": "Historical assumed torque, not new mass/inertia calculation",
                           "final_chain_tension_difference_N": tension,
                                       "efficiency_assumed": 0.7, "motor_torque_screen_Nm": 43.497 / (abs(self.report["ratios"]["deployment_motor_to_cheek"]) * 0.7),
                           "candidate_chain_sku": "WCP-0767", "candidate_master_link_sku": "WCP-0768",
                           "working_load_rating_lbf": 209, "working_load_rating_N": working_load,
                           "headroom_before_pretension_and_additional_dynamic_load_N": working_load - tension,
                           "rating_source": "https://docs.wcproducts.com/welcome/frc-build-system/belts-chain-and-gears/sprockets-and-chain.md",
                           "rating_source_sha256": self.sources.digest(self.sources.CACHE / "chain-ratings.md"),
                           "shock_and_holding_qualified": False}

    def finish(self):
        self.report["before_instances"] = self.before
        self.report["after_instances"] = len(self.assembly.instances)
        self.report["new_ids"] = [part["id"] for part in self.assembly.instances if part["id"].startswith("pt_")]
        self.report["remaining"] = ["Chain tooth seating/phase and actual pretension/dynamic working tension not qualified; WCP-0767 candidate sourced",
                                     "Running gear phase/backlash, physical belt tension and load ratings unqualified; only three static source meshes tested",
                                     "Kicker hub/core/tread torque attachment remains unqualified", "Full-fold interference and guards pending"]
        self.report["path_status"] = {
            "upper_rollers": "Installed geometry to all three hex shafts; real pulleys and closed nominal 350/400/450 mm belts; tension and torque capacity not qualified",
            "indexer_L": "Installed geometry to all three retained shafts; two nominal HTD loops with two supported adjustable idlers",
            "indexer_R": "Installed geometry to all three retained shafts; two nominal HTD loops with two supported adjustable idlers",
            "kicker": "Installed reversing gears and HTD path to hex shaft; inherited thin hub/core/tread torque connection still BLOCKED",
            "deployment": "Installed 48.2143:1 geometry to independent cheek flange; discrete chain pitch closes, actual tooth seating and load qualification BLOCKED",
        }
        self.report["superseded_missing_records"] = []
        for missing in self.assembly.missing:
            if missing.get("id") in {"upper_roller_loops", "pickup_stage_support_and_downstream", "deployment_stage_support_and_downstream"}:
                self.report["superseded_missing_records"].append(dict(missing))
                missing["reason"] = "Geometry installed by powered_transmissions.install; see powertrain_installation for unqualified loads, tension, guards and full-sweep requirements"
                missing["geometric_installation"] = "PRESENT_NOT_RELEASED"
        self.assembly.drives.extend({**path, "namespace": "powered_transmissions", "physical_drive_complete": False} for path in self.report["paths"])
        self.assembly.powertrain_installation = self.report
        return self.assembly


def install(assembly):
    if hasattr(assembly, "powertrain_installation"):
        raise ValueError("Powertrain already installed")
    installer = Installer(assembly)
    installer.install_pickup()
    installer.install_indexers()
    installer.install_deployment()
    installer.clock_gears()
    return installer.finish()


def build():
    return install(load_sibling("coaxial_pickup").build())


def write_report(assembly, export=False):
    report = assembly.powertrain_installation
    report["counts"] = {"instances": len(assembly.instances),
                         "physical_instances": sum(part["role"] != "reference_environment" for part in assembly.instances),
                         "motors": sum(part["role"] == "motor" for part in assembly.instances),
                         "new_instances": len(report["new_ids"]), "removed_instances": len(report["removed_ids"]),
                         "removed_original_instances": sum(not identifier.startswith("pt_") for identifier in report["removed_ids"]),
                         "discarded_temporary_installation_instances": sum(identifier.startswith("pt_") for identifier in report["removed_ids"]),
                         "active_definitions": len({part["definition"] for part in assembly.instances}),
                         "belt_routes": sum(path["pitch_mm"] == 5 for path in report["paths"]),
                         "chain_routes": sum(path["pitch_mm"] == 6.35 for path in report["paths"])}
    report["source_receipts"] = load_sibling("transmission_sources").receipts()
    (ROOT / "transmission-installation.json").write_text(json.dumps(report, indent=2) + "\n")
    if export:
        output = ROOT / "powertrain-output"
        output.mkdir(exist_ok=True)
        compound = assembly.cq.Assembly(name="coaxial-powered-not-released")
        for part in assembly.instances:
            compound.add(assembly.definitions[part["definition"]]["shape"], name=part["id"], loc=assembly.pose(part))
        compound.save(str(output / "installed-not-released.step"))
    return report


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true")
    arguments = parser.parse_args()
    report = write_report(build(), arguments.export)
    print(json.dumps({"counts": report["counts"], "ratios": report["ratios"], "remaining": report["remaining"]}, indent=2))