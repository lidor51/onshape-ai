import argparse
from collections import Counter
import csv
from functools import lru_cache
import json
import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, REPO, box, bounds, cq, cylinder, hex_shaft, parameters
from cots.load_vendor import load_vendor


IDENTITY = cq.Location()


def location(center=(0, 0, 0), axis=(0, 0, 1)):
    direction = (0, 1, 0) if abs(axis[0]) == 1 else (1, 0, 0)
    return cq.Location(cq.Plane(origin=center, xDir=direction, normal=axis))


def rotation_about(center, degrees):
    return cq.Location(cq.Vector(*center)) * cq.Location(cq.Vector(), cq.Vector(1, 0, 0), degrees) * cq.Location(cq.Vector(*[-value for value in center]))


def matrix(pose):
    transform = pose.wrapped.Transformation()
    return [[transform.Value(row, column) for column in range(1, 5)] for row in range(1, 4)] + [[0, 0, 0, 1]]


def plate(points, thickness=6, holes=()):
    shape = cq.Workplane("XY", origin=(0, 0, -thickness / 2)).polyline(points).close().extrude(thickness).val()
    for horizontal, vertical, diameter in holes:
        shape = shape.cut(cylinder(diameter / 2, thickness + 2, (horizontal, vertical, 0)))
    return shape.clean()


def web(points, radius=24, thickness=6, holes=()):
    pieces = [cylinder(radius, thickness, (*point, 0)) for point in points]
    for first, second in zip(points, points[1:]):
        length = math.dist(first, second)
        normal = [-(second[1] - first[1]) / length, (second[0] - first[0]) / length]
        outline = [[point[index] + sign * radius * normal[index] for index in range(2)] for point, sign in ((first, 1), (second, 1), (second, -1), (first, -1))]
        pieces.append(plate(outline, thickness))
    shape = pieces[0].fuse(*pieces[1:]).clean()
    for horizontal, vertical, diameter in holes:
        shape = shape.cut(cylinder(diameter / 2, thickness + 2, (horizontal, vertical, 0)))
    return shape.clean()


@lru_cache(maxsize=None)
def ring(outer, inner, length):
    return cylinder(outer / 2, length, (0, 0, 0)).cut(cylinder(inner / 2, length + 2, (0, 0, 0)))


@lru_cache(maxsize=None)
def shaft(length):
    shape = hex_shaft(12.7, length)
    for sign in (-1, 1):
        shape = shape.cut(cylinder(2.1, 14, (0, 0, sign * (length / 2 - 6))))
    return shape


@lru_cache(maxsize=None)
def hollow_tube(width, wall, length):
    return box((width, width, length), (0, 0, 0)).cut(box((width - 2 * wall, width - 2 * wall, length + 2), (0, 0, 0)))


@lru_cache(maxsize=None)
def hex_hub(outer, length):
    return cylinder(outer / 2, length, (0, 0, 0)).cut(hex_shaft(12.8, length + 2))


@lru_cache(maxsize=None)
def pulley():
    blank = hex_hub(42, 14)
    groove = cq.Solid.makeTorus(18, 3.05)
    return blank.cut(groove)


def belt_loop(centers, pitch_radius=18, cord=6):
    outline = cq.Workplane("XY").polyline(centers).close().val()
    path = outline.offset2D(pitch_radius, "arc")[0]
    edge = path.Edges()[0]
    section_plane = cq.Plane(origin=edge.startPoint(), normal=edge.tangentAt(0))
    result = cq.Workplane(section_plane).circle(cord / 2).sweep(cq.Workplane("XY").newObject([path]), isFrenet=True).val()
    return result, path.Length()


class Package:
    def __init__(self, settings):
        self.settings = settings
        self.definitions = {}
        self.instances = []
        self.import_cache = {}
        self.holes = []
        self.joints = []
        self.missing = []
        self.belts = []
        self.gear_pairs = []
        self.sources = {}
        self.sourcebindings = json.loads((ROOT / "cots/sourcebindings.json").read_text(encoding="utf8"))["products"]
        self.wheel_rows = []
        self.hardware = Counter()

    def define(self, name, shape, material, kind="custom_brep", stock="", source=None, flat=False, holes=()):
        if name not in self.definitions:
            self.definitions[name] = {"shape": shape, "material": material, "kind": kind, "stock": stock, "source": source, "flat": flat, "holes": list(holes)}
        return name

    def add(self, name, definition, pose=IDENTITY, module="indexer", role="structure", parent=None, motion=None):
        self.instances.append({"id": name, "definition": definition, "pose": pose, "module": module, "role": role, "motion": motion or ("fold" if module == "pickup" else "fixed")})
        if parent:
            self.joints.append({"first": name, "second": parent, "type": "nominal assembly adjacency; must pass geometry distance check"})
        for horizontal, vertical, diameter in self.definitions[definition]["holes"]:
            self.holes.append({"part": name, "local_center": [horizontal, vertical, 0], "diameter": diameter})
        return name

    def vendor(self, product):
        if product in self.sources:
            return "vendor_" + product
        entry = self.sourcebindings[product]
        source = REPO / entry["pathrepoRelative"]
        if source not in self.import_cache:
            self.import_cache[source], verified = load_vendor(product)
            if verified != entry:
                raise ValueError("Source binding changed during build: " + product)
        shape = self.import_cache[source]
        self.sources[product] = {"product_id": product, "path": entry["pathrepoRelative"], "pathrepoRelative": entry["pathrepoRelative"], "sha256": entry["sha256"], "sku": entry["sku"], "normalization_matrix": entry["attachment"]["sourceToAttachment"]["matrix4x4"], "source_root_count": entry["sourceRootCount"], "import_solids": entry["importsolids"], "original_volume_mm3": shape.Volume(), "original_bytes_unchanged": True, "assembly_reexport_fidelity": "NOT claimed; original is authoritative", "import_count": 1, "variant": entry.get("variant"), "fit_approved": False}
        return self.define("vendor_" + product, shape, "vendor mixed materials", "authentic_vendor_brep", entry["sku"], self.sources[product])

    def vendor_wheel_parts(self, product):
        root = self.vendor(product)
        source = self.sources[product]
        if "solid_mapping" in source:
            return source["solid_mapping"]
        binding = self.sourcebindings[product]
        mapping = []
        for index, solid in enumerate(self.definitions[root]["shape"].Solids()):
            extent = bounds(solid)
            width, depth = extent[3] - extent[0], extent[4] - extent[1]
            if min(width, depth) > binding["datums"]["nominalDiameterMmFromDrawing"] * 0.8:
                role = "compliant_contact"
                material = "manufacturer green 35 Shore A variant; unloaded geometry only; compression/friction needs physical test"
            elif abs(width - 20) < 1e-5 and abs(depth - 20) < 1e-5 and abs(extent[0] + extent[3]) < 1e-5 and abs(extent[1] + extent[4]) < 1e-5:
                role = "hard_roller_core"
                material = "vendor hub; material unqualified; collision checked as hard"
            else:
                role = "vendor_marking_unqualified"
                material = "vendor separate marking; material unverified; collision checked as hard"
            part_source = {**source, "source_solid_indices": [index], "parent_product": root}
            definition = self.define(root + "_solid_" + str(index), solid, material, "authentic_vendor_brep", binding["sku"], part_source)
            mapping.append({"source_solid_index": index, "definition": definition, "role": role, "volume_mm3": solid.Volume(), "attachment_bounds_mm": extent, "classification": "radial envelope and centered 20 mm hub geometry; not solid order or display color"})
        if sum(part["role"] == "compliant_contact" for part in mapping) != 1 or sum(part["role"] == "hard_roller_core" for part in mapping) != 1:
            raise ValueError("Ambiguous vendor material separation: " + product)
        source["solid_mapping"] = mapping
        return mapping

    def wheel(self, name, product, pose, module, parent, motion=None):
        for part in self.vendor_wheel_parts(product):
            self.add(name + "_solid_" + str(part["source_solid_index"]), part["definition"], pose, module, part["role"], parent, motion)

    def bolt(self, name, center, axis, length=16, module="indexer", parent=None, nominal=5, motion=None):
        designation = "10-32_UNF" if nominal == 4.826 else "M" + str(nominal)
        key = "hardware_" + designation + "x" + str(length)
        if key not in self.definitions:
            shank = cylinder(nominal / 2, length, (0, 0, -length / 2))
            head = cylinder(nominal * 0.85, nominal, (0, 0, nominal / 2))
            washer = ring(nominal * 2, nominal + 0.3, 1).translate((0, 0, -0.5))
            shape = cq.Compound.makeCompound([shank.fuse(head), washer])
            self.define(key, shape, "steel", "standard_hardware_nominal_brep", "socket head screw plus washer; no thread helices")
        self.hardware[key] += 1
        return self.add(name, key, location(center, axis), module, "fastener", parent, motion)

    def bearing(self, name, center, axis, module="indexer", parent=None, motion=None):
        return self.add(name, self.vendor("hex_bearing"), location(center, axis), module, "bearing", parent, motion)

    def custom(self, name, shape, material="6061-T6 provisional", stock="", flat=False, holes=()):
        return self.define(name, shape, material, stock=stock, flat=flat, holes=holes)

    def drive(self, name, output, motor, face, axis, module, parent):
        horizontal, vertical = motor
        output_horizontal, output_vertical = output
        holes = [(horizontal, vertical, 19.1), (output_horizontal, output_vertical, 28.57)]
        motor_holes = [(17.4625 * math.cos(math.radians(angle)), 17.4625 * math.sin(math.radians(angle))) for angle in (0, 120, 240)]
        for delta_horizontal, delta_vertical in motor_holes:
            holes.append((horizontal + delta_horizontal, vertical + delta_vertical, 5.2))
        for offset in (-27, 27):
            holes.append((output_horizontal + offset, output_vertical - 28, 5.5))
        minimum_horizontal, maximum_horizontal = min(horizontal, output_horizontal) - 34, max(horizontal, output_horizontal) + 34
        minimum_vertical, maximum_vertical = min(vertical, output_vertical) - 38, max(vertical, output_vertical) + 34
        shape = plate([(minimum_horizontal, minimum_vertical), (maximum_horizontal, minimum_vertical), (maximum_horizontal, maximum_vertical), (minimum_horizontal, maximum_vertical)], 6, holes)
        counterbores = []
        for delta_horizontal, delta_vertical in motor_holes:
            center = (horizontal + delta_horizontal, vertical + delta_vertical, 1.5)
            shape = shape.cut(cylinder(5.1, 3, center))
            counterbores.append({"center": list(center[:2]), "diameter_mm": 10.2, "local_z_mm": [0, 3], "through_diameter_mm": 5.2, "floor_mm": 3, "strength_qualified": False})
        definition = self.custom(name + "_mount", shape.clean(), stock="6 mm plate; motor holes only: OD10.2 counterbore 3 deep from outboard face, 3 mm floor NOT strength-qualified; pilot and journal finish-machine", flat=True, holes=holes)
        self.definitions[definition]["counterbores"] = counterbores
        origin = (face + 3, 0, 0) if axis == (1, 0, 0) else (0, 0, face + 3)
        support = self.add(name + "_mount", definition, location(origin, axis), module, parent=parent)
        motor_center = (face, horizontal, vertical) if axis == (1, 0, 0) else (horizontal, vertical, face)
        motor_id = self.add(name + "_X44", self.vendor("x44"), location(motor_center, axis), module, "motor", support)
        seat_center = (face + 6, *output) if axis == (1, 0, 0) else (*output, face + 6)
        self.bearing(name + "_output_bearing", seat_center, axis, module, support)
        for index, (delta_horizontal, delta_vertical) in enumerate(motor_holes):
            center = (face + 4, horizontal + delta_horizontal, vertical + delta_vertical) if axis == (1, 0, 0) else (horizontal + delta_horizontal, vertical + delta_vertical, face + 4)
            self.bolt(name + "_motor_screw_" + str(index), center, axis, 9.525, module, motor_id, 4.826)
        midplane = face + self.settings["drives"]["pinion_midplane_from_motor_face"]
        pinion_center = (midplane, *motor) if axis == (1, 0, 0) else (*motor, midplane)
        output_center = (midplane, *output) if axis == (1, 0, 0) else (*output, midplane)
        pinion_pose = location(pinion_center, axis) * cq.Location(cq.Vector(), cq.Vector(0, 0, 1), 30)
        pinion = self.add(name + "_12T", self.vendor("spline_pinion"), pinion_pose, module, "gear", motor_id)
        gear = self.add(name + "_60T", self.vendor("hex_output_gear"), location(output_center, axis), module, "gear", support)
        motor_datums = self.sourcebindings["x44"]["datums"]
        pinion_end = midplane + self.sourcebindings["spline_pinion"]["datums"]["overallWidthMm"] / 2
        motor_tip = face + motor_datums["shaft_tip_z_mm"]
        spacer_length = motor_tip - pinion_end
        spacer_def = self.custom("pinion_retention_spacer", ring(12, 8.2, spacer_length), stock="OD12 ID8.2; length " + str(spacer_length) + "; spline-tip bridge, tolerance unapproved")
        spacer_center = ((pinion_end + motor_tip) / 2, *motor) if axis == (1, 0, 0) else (*motor, (pinion_end + motor_tip) / 2)
        self.add(name + "_pinion_spacer", spacer_def, location(spacer_center, axis), module, "spacer", pinion)
        screw_center = (motor_tip + 1, *motor) if axis == (1, 0, 0) else (*motor, motor_tip + 1)
        self.bolt(name + "_pinion_retention", screw_center, axis, 9.525, module, motor_id, 4.826)
        if axis == (1, 0, 0):
            output_end = self.settings["pickup"]["sideplate_x"] + (40 if module == "pickup" else 50)
            gear_end = midplane + self.sourcebindings["hex_output_gear"]["datums"]["overallWidthMm"] / 2
            spacer_def = self.custom(name + "_output_spacer", hex_hub(24, output_end - gear_end), stock="hex bored axial retention spacer; stack tolerance unapproved")
            self.add(name + "_output_spacer", spacer_def, location(((gear_end + output_end) / 2, *output), axis), module, "spacer", gear)
            if module == "dock":
                self.bolt(name + "_output_end", (output_end + 1, *output), axis, 12, module, gear)
        else:
            half_width = self.sourcebindings["hex_output_gear"]["datums"]["overallWidthMm"] / 2
            intervals = [(face + 6 + 1.5875, midplane - half_width), (midplane + half_width, 117 - 6.35)]
            for index, (start, end) in enumerate(intervals):
                spacer_def = self.custom(name + "_output_spacer_" + str(index), hex_hub(24, end - start), stock="gear captured between output and lower-bank bearings; stack tolerance unapproved")
                self.add(name + "_output_spacer_" + str(index), spacer_def, location((*output, (start + end) / 2)), module, "spacer", gear)
        self.gear_pairs.append({"name": name, "module": module, "axis": list(axis), "mount_face": face, "input": list(motor), "output": list(output), "teeth": [12, 60], "center_distance": math.dist(motor, output), "ratio": 5, "gear_midplane": midplane, "vendor_solids_present": all(any(instance["id"] == identifier for instance in self.instances) for identifier in (pinion, gear)), "required_skus": ["WCP-1010", "WCP-0121"], "pinion": pinion, "gear": gear, "motor": motor_id, "spline_clock_degrees": 30, "output_clocking": "source-to-attachment Z -30 degrees aligns source +30-degree hex corner with shaft +X", "pinion_spacer_length_mm": spacer_length, "pinion_screw": "#10-32 UNF x 9.525 mm plus 1 mm washer", "pinion_thread_engagement_mm": 8.525, "pinion_thread_depth_mm": motor_datums["shaft_end_thread_depth_from_drawing_mm"], "mesh_status": "BLOCKED: tooth phase clashes with shaft-aligned source clocking; X44 rotor is fused in original", "fit_and_mesh_approved": False})
        return support


def build_pickup(package):
    settings = package.settings
    pickup = settings["pickup"]
    pivot = pickup["pivot_yz"]
    rail_x = pickup["sideplate_x"]
    centers = {roller["id"]: roller["yz"] for roller in pickup["rollers"]}
    rail_points = [centers["kick"], [-330, 44], [-350, 210], centers["middle"], centers["rear"], pivot]
    base_holes = [(center[0], center[1], 32) for key, center in centers.items() if key != "front"] + [(pivot[0], pivot[1], 32)]
    for center in [centers["kick"], centers["middle"], centers["rear"], pivot]:
        base_holes.extend((center[0] + horizontal, center[1] + vertical, 5.5) for horizontal in (-20, 20) for vertical in (-20, 20))
    crossmembers = [(-310, 44), (-330, 211)]
    base_holes.extend((horizontal, vertical, 5.5) for horizontal, vertical in crossmembers)
    rail_shape = web(rail_points, 34, 6, base_holes).cut(box((1500, 500, 20), (0, -244, 0)))
    rail_def = package.custom("pickup_sideplate", rail_shape, stock="6 mm router plate, paired", flat=True, holes=base_holes)
    cassette_holes = [(0, 0, 28.57)] + [(horizontal, vertical, 5.5) for horizontal in (-20, 20) for vertical in (-20, 20)]
    cassette_def = package.custom("axle_cassette", plate([(-29, -29), (29, -29), (29, 29), (-29, 29)], 6, cassette_holes), stock="6 mm plate; bore fit provisional", flat=True, holes=cassette_holes)
    arm_holes = [(0, 0, 30.1), (-125, -101, 32)] + [(-125 + horizontal, -101 + vertical, 5.5) for horizontal in (-20, 20) for vertical in (-20, 20)]
    arm_def = package.custom("floating_arm", web([(0, 0), (-125, -101)], 30, 6, arm_holes), stock="6 mm paired plates; plain pivot, NOT reference four-bar", flat=True, holes=arm_holes)
    journal_def = package.custom("floating_pivot_journal", ring(24, 16, 20), stock="lathe sleeve; central roller shaft rotates independently")
    bushing_def = package.custom("floating_pivot_bushing", ring(30, 24.1, 6), material="acetal", stock="lathe bush, radial clearance 0.1 mm provisional")
    for sign in (-1, 1):
        suffix = "L" if sign < 0 else "R"
        rail = package.add("pickup_rail_" + suffix, rail_def, location((sign * rail_x, 0, 0), (1, 0, 0)), "pickup")
        package.add("floating_arm_" + suffix, arm_def, location((sign * (rail_x - 16), *centers["middle"]), (1, 0, 0)), "pickup", parent=rail, motion="float")
        package.add("floating_journal_" + suffix, journal_def, location((sign * (rail_x - 9), *centers["middle"]), (1, 0, 0)), "pickup", "pivot_journal", rail)
        package.add("floating_bushing_" + suffix, bushing_def, location((sign * (rail_x - 16), *centers["middle"]), (1, 0, 0)), "pickup", "bushing", "floating_arm_" + suffix, "float")
        for roller_id, center in list(centers.items()) + [("pivot", pivot)]:
            floating = roller_id == "front"
            local_x = rail_x - 10 if floating else rail_x + 6
            parent = "floating_arm_" + suffix if floating else rail
            support = package.add("cassette_" + roller_id + "_" + suffix, cassette_def, location((sign * local_x, *center), (1, 0, 0)), "pickup", parent=parent, motion="float" if floating else "fold")
            package.bearing("bearing_" + roller_id + "_" + suffix, (sign * (local_x + 3), *center), (sign, 0, 0), "pickup", support, "float" if floating else "fold")
            for index, (horizontal, vertical) in enumerate([(horizontal, vertical) for horizontal in (-20, 20) for vertical in (-20, 20)]):
                package.bolt("cassette_bolt_" + roller_id + "_" + suffix + str(index), (sign * (local_x + 4), center[0] + horizontal, center[1] + vertical), (sign, 0, 0), 16, "pickup", support, motion="float" if floating else "fold")
        arm_angle = math.atan2(-101, -125)
        for stop_index, delta in enumerate((-8 - math.degrees(math.asin(34 / 85)), math.degrees(math.asin(34 / 85)))):
            angle = arm_angle + math.radians(delta)
            center = [centers["middle"][0] + 85 * math.cos(angle), centers["middle"][1] + 85 * math.sin(angle)]
            stop_mount_def = package.custom("stop_mount_" + str(stop_index), web([centers["middle"], center], 13, 6, [(center[0], center[1], 8.2)]), stock="6 mm plate stop outrigger", flat=True, holes=[(center[0], center[1], 8.2)])
            stop_mount = package.add("stop_mount_" + suffix + str(stop_index), stop_mount_def, location((sign * (rail_x + 13), 0, 0), (1, 0, 0)), "pickup", parent=rail)
            package.bolt("floating_stop_" + suffix + str(stop_index), (sign * (rail_x + 17), *center), (sign, 0, 0), 40, "pickup", stop_mount, 8)
    tube_def = package.custom("pickup_crossmember", hollow_tube(20, 2, rail_x * 2 - 6), stock="20x20x2 mm tube, parametric between inner sideplate faces")
    plug_def = package.custom("tube_end_plug", box((15.8, 15.8, 12), (0, 0, 0)).cut(cylinder(2.1, 14, (0, 0, 0))), stock="15.8 square, M5 tap after drilling 4.2")
    for index, center in enumerate(crossmembers):
        tube = package.add("pickup_crossmember_" + str(index), tube_def, location((0, *center), (1, 0, 0)), "pickup", parent="pickup_rail_L")
        for sign in (-1, 1):
            package.add("crossmember_plug_" + str(index) + "_" + str(sign), plug_def, location((sign * (rail_x - 9), *center), (1, 0, 0)), "pickup", parent=tube)
            package.bolt("crossmember_bolt_" + str(index) + "_" + str(sign), (sign * (rail_x + 4), *center), (sign, 0, 0), 20, "pickup", tube)
    for roller in pickup["rollers"]:
        roller_id = roller["id"]
        center = (0, *roller["yz"])
        motion = "float" if roller_id == "front" else "fold"
        shaft_length = 2 * (rail_x + (40 if roller_id == "rear" else 30))
        shaft_def = package.custom("pickup_hex_shaft_" + roller_id, shaft(shaft_length), material="WCP 1/2 inch AF hex aluminum stock, grade unverified", stock="AF 12.7 exact; parametric length " + str(shaft_length) + "; M5 end taps")
        shaft_id = package.add("shaft_" + roller_id, shaft_def, location(center, (1, 0, 0)), "pickup", "hard_shaft", "bearing_" + roller_id + "_L", motion)
        if roller_id == "kick":
            core_def = package.custom("roller_core_kick", ring(24, 20, pickup["roller_width"]), stock="custom OD24 aluminum core, 2 mm wall")
            package.add("core_kick", core_def, location(center, (1, 0, 0)), "pickup", "hard_roller_core", shaft_id, motion)
            hub_def = package.custom("roller_hub_kick", hex_hub(20, 16), stock="custom hub, 12.8 AF; retention pending")
            sleeve_def = package.custom("compliant_sleeve_kick", ring(51, 24, pickup["roller_width"]), material="custom rubber/foam compound TBD; needs physical test", stock="UNLOADED custom OD51 on OD24 core; NOT authentic AM-3462")
            package.add("sleeve_kick", sleeve_def, location(center, (1, 0, 0)), "pickup", "compliant_contact", "core_kick", motion)
        else:
            package.vendor("intake_star")
            count = {"front": 9, "middle": 8, "rear": 5}[roller_id]
            width = package.sourcebindings["intake_star"]["datums"]["overallWidthMm"]
            positions = [(index / (count - 1) - 0.5) * (pickup["roller_width"] - width) for index in range(count)]
            for index, horizontal in enumerate(positions):
                package.wheel("star_" + roller_id + "_" + str(index), "intake_star", location((horizontal, *roller["yz"]), (1, 0, 0)), "pickup", shaft_id, motion)
            package.wheel_rows.append({"row": roller_id, "product": "intake_star", "count": count, "axial_centers_mm": positions, "hub_width_mm": width, "row_width_mm": pickup["roller_width"], "shaft_length_mm": shaft_length, "minimum_shaft_end_clearance_mm": (shaft_length - pickup["roller_width"]) / 2, "axial_wheel_spacing_retention": "BLOCKED: inter-wheel spacers/collars not detailed"})
        for sign in (-1, 1):
            if roller_id == "kick":
                package.add("hub_kick" + str(sign), hub_def, location((sign * (pickup["roller_width"] / 2 - 8), *roller["yz"]), (1, 0, 0)), "pickup", "hub", shaft_id, motion)
            collar_def = package.custom("hex_collar", hex_hub(24, 8), stock="split/set screw retention interface not yet detailed")
            collar_x = rail_x + 15
            if roller_id == "rear" and sign == 1:
                package.vendor("hex_output_gear")
                collar_x = rail_x + 10 + settings["drives"]["pinion_midplane_from_motor_face"] - package.sourcebindings["hex_output_gear"]["datums"]["overallWidthMm"] / 2 - 4
            package.add("collar_" + roller_id + str(sign), collar_def, location((sign * collar_x, *roller["yz"]), (1, 0, 0)), "pickup", "collar", shaft_id, motion)
            package.bolt("shaft_end_" + roller_id + str(sign), (sign * (shaft_length / 2 + 1), *roller["yz"]), (sign, 0, 0), 12, "pickup", shaft_id, motion=motion)
    package.missing.append({"id": "star_axial_retention", "reason": "Authentic 9/8/5 star rows require qualified inter-wheel spacing sleeves and axial capture"})
    pulley_def = package.custom("round_belt_hex_pulley", pulley(), stock="custom lathe/router pulley, R18 pitch, 6 mm round belt; grip unverified")
    for roller_id in ("front", "middle", "rear"):
        package.add("pulley_" + roller_id, pulley_def, location((-(rail_x + 23), *centers[roller_id]), (1, 0, 0)), "pickup", "pulley", "shaft_" + roller_id, "float" if roller_id == "front" else "fold")
    belt, length = belt_loop([centers["front"], centers["rear"], centers["middle"]])
    belt_def = package.custom("upper_pickup_belt", belt, material="6 mm welded polyurethane round belt, supplier TBD", stock="neutral-length belt, tensioner travel unverified")
    package.add("pickup_upper_belt", belt_def, location((-(rail_x + 23), 0, 0), (1, 0, 0)), "pickup", "belt", "pulley_rear")
    package.belts.append({"id": "pickup_upper_belt", "closed": True, "nominal_length": length, "floating_compensation": "BLOCKED: tension stroke and wrap must be solved", "drive_members": ["front", "middle", "rear"]})
    package.drive("pickup_drive", centers["rear"], [centers["rear"][0] + 45.72, centers["rear"][1]], rail_x + 10, (1, 0, 0), "pickup", "pickup_rail_R")
    package.missing.append({"id": "kick_reversal", "reason": "Kick needs opposite rotation to upper rollers; dedicated reversal and its closed drive remain unresolved, not silently same-sense powered"})
    for sign in (-1, 1):
        holes = [(pivot[0], pivot[1], 28.57), (12.5, 45, 5.5), (12.5, 60, 5.5)]
        if sign == 1:
            holes.append((pivot[0], pivot[1] + 45.72, 20))
        cheek_def = package.custom("frame_pivot_cheek_" + str(sign), plate([(-2, 28), (36, 28), (170, pivot[1] - 35), (170, pivot[1] + 82), (72, pivot[1] + 82), (-2, 80)], 6, holes), stock="6 mm frame cheek; right only OD20 fold-pinion clearance; frame doubler/load verification pending", flat=True, holes=holes)
        cheek = package.add("frame_cheek_" + str(sign), cheek_def, location((sign * (rail_x + 16), 0, 0), (1, 0, 0)), "dock")
        package.bearing("frame_pivot_bearing_" + str(sign), (sign * (rail_x + 19), *pivot), (sign, 0, 0), "dock", cheek)
        stub_def = package.custom("fold_pivot_stub", shaft(76), material="WCP 1/2 inch AF hex stock, grade TBD", stock="split 76 mm stub, NOT a shaft across the coral corridor")
        package.add("pivot_stub_" + str(sign), stub_def, location((sign * (rail_x + 12), *pivot), (1, 0, 0)), "dock", "hard_shaft", cheek)
        for index, height in enumerate((45, 60)):
            package.bolt("frame_mount_" + str(sign) + str(index), (sign * (rail_x + 20), 12.5, height), (sign, 0, 0), 35, "dock", cheek)
    package.drive("fold_drive", pivot, [pivot[0], pivot[1] + 45.72], rail_x + 13, (1, 0, 0), "dock", "frame_cheek_1")


def build_indexer(package):
    settings = package.settings["indexer"]
    pulley_def = package.custom("round_belt_hex_pulley", pulley(), stock="custom R18 pitch round-belt pulley")
    for sign in (-1, 1):
        suffix = "L" if sign < 0 else "R"
        stations = [[sign * center[0], center[1]] for center in settings["stations_xy"]]
        holes = [(center[0], center[1], 28.57) for center in stations] + [(sign * 265, vertical, 5.5) for vertical in (74, 300)]
        holes.append((stations[0][0] + sign * 45.72, stations[0][1], 14))
        outline = [(sign * horizontal, vertical) for horizontal, vertical in [(150, 44), (280, 44), (280, 324), (65, 324), (65, 260), (84, 154), (147, 44)]]
        deck = plate(outline, 6, holes)
        deck_def = package.custom("indexer_bank_plate_" + suffix, deck, stock="6 mm paired flat plates; bearing holes finish-machine", flat=True, holes=holes)
        for height in settings["bearing_plate_z"]:
            package.add("indexer_plate_" + suffix + "_" + str(height), deck_def, location((0, 0, height)), "indexer")
        for post_index, vertical in enumerate((74, 300)):
            tube_def = package.custom("indexer_post", hollow_tube(20, 2, 178), stock="20x20x2 metric tube, saw 178")
            post = package.add("indexer_post_" + suffix + str(post_index), tube_def, location((sign * 265, vertical, 155)), "indexer", parent="indexer_plate_" + suffix + "_247")
            for height, axis in ((250, (0, 0, 1)), (66, (0, 0, -1))):
                plug = package.add("post_plug_" + suffix + str(post_index) + "_" + str(height), "tube_end_plug", location((sign * 265, vertical, height - 12 if height == 250 else height + 6)), "indexer", parent=post)
                package.bolt("post_bolt_" + suffix + str(post_index) + "_" + str(height), (sign * 265, vertical, height + 1 if height == 250 else height - 1), axis, 20, "indexer", plug)
        for station_index, (center, stack) in enumerate(zip(stations, settings["wheel_z"])):
            prefix = "indexer_" + suffix + str(station_index)
            lower = "indexer_plate_" + suffix + "_114"
            upper = "indexer_plate_" + suffix + "_247"
            package.bearing(prefix + "_lower", (*center, 117), (0, 0, 1), "indexer", lower)
            package.bearing(prefix + "_upper", (*center, 244), (0, 0, -1), "indexer", upper)
            shaft_def = package.custom("indexer_hex_shaft", shaft(196), material="WCP half-inch hex stock, grade unverified", stock="AF12.7 exact; 196 long, M5 end taps")
            shaft_id = package.add(prefix + "_shaft", shaft_def, location((*center, 182)), "indexer", "hard_shaft", prefix + "_lower")
            for wheel_index, height in enumerate(stack):
                package.wheel(prefix + "_wheel_" + str(wheel_index), "indexer_wheel", location((*center, height)), "indexer", shaft_id)
            for height in (124, 271):
                package.add(prefix + "_collar" + str(height), "hex_collar", location((*center, height)), "indexer", "collar", shaft_id)
            package.add(prefix + "_pulley", pulley_def, location((*center, 260)), "indexer", "pulley", shaft_id)
            for height, axis in ((281, (0, 0, 1)), (83, (0, 0, -1))):
                package.bolt(prefix + "_end" + str(height), (*center, height), axis, 12, "indexer", shaft_id)
        belt, length = belt_loop(stations)
        belt_def = package.custom("indexer_belt_" + suffix, belt, material="6 mm welded PU round belt, supplier TBD", stock="continuous closed loop; slip/load unverified")
        package.add("indexer_belt_" + suffix, belt_def, location((0, 0, 260)), "indexer", "belt", "indexer_" + suffix + "0_pulley")
        package.belts.append({"id": "indexer_belt_" + suffix, "closed": True, "nominal_length": length, "drive_members": ["indexer_" + suffix + str(index) for index in range(3)], "tension_status": "fixed center; adjustable idler required before release"})
        package.drive("indexer_drive_" + suffix, stations[0], [stations[0][0] + sign * 45.72, stations[0][1]], 84, (0, 0, 1), "indexer", "indexer_plate_" + suffix + "_114")


def build_dock(package):
    settings = package.settings
    tray = settings["tray"]
    holes = [(horizontal, vertical, 5.5) for horizontal in (-65, 65) for vertical in (245, 525)]
    tray_def = package.custom("detachable_tray", plate([(-80, tray["front_y"]), (80, tray["front_y"]), (80, tray["rear_y"]), (-80, tray["rear_y"])], tray["thickness"], holes), material="polycarbonate", stock="3 mm flat sheet, no precision bends", flat=True, holes=holes)
    tray_id = package.add("detachable_tray", tray_def, location((0, 0, tray["top_z"] - tray["thickness"] / 2)), "dock", "coral_support")
    cross_def = package.custom("dock_crossbar", hollow_tube(20, 2, 530), stock="20x20x2 tube, saw 530")
    for vertical in (245, 525):
        cross = package.add("dock_crossbar_" + str(vertical), cross_def, location((0, vertical, 115), (1, 0, 0)), "dock", parent=tray_id)
        for horizontal in (-65, 65):
            spacer_def = package.custom("tray_spacer", ring(16, 5.5, 5.85), stock="lathe standoff 5.85 nominal")
            package.add("tray_spacer_" + str(horizontal) + "_" + str(vertical), spacer_def, location((horizontal, vertical, 127.925)), "dock", parent=cross)
            tab_thickness = 3 if (horizontal, vertical) == (65, 245) else 0
            package.bolt("tray_dock_screw_" + str(horizontal) + "_" + str(vertical), (horizontal, vertical, 134.85 + tab_thickness), (0, 0, 1), 30, "dock", tray_id)
    stop_holes = [(-65, 8, 5.5), (65, 8, 5.5)]
    stop_def = package.custom("coral_stop", plate([(-80, 0), (80, 0), (80, 40), (-80, 40)], 6, stop_holes), stock="6 mm flat stop; bracket joint unresolved", flat=True, holes=stop_holes)
    package.add("coral_stop", stop_def, location((0, tray["stop_y"] + 3, tray["top_z"]), (0, -1, 0)), "dock", "coral_stop", tray_id)
    sensor_plate_holes = [(-10, -7.5, 3.4), (10, -7.5, 3.4), (-10, 7.5, 3.4), (10, 7.5, 3.4), (0, -20, 5.5)]
    sensor_plate_def = package.custom("sensor_adapter", plate([(-20, -26), (20, -26), (20, 18), (-20, 18)], 3, sensor_plate_holes), material="polycarbonate", stock="3 mm provisional 20x15 mount pattern; NOT verified LaserCAN interface", flat=True, holes=sensor_plate_holes)
    presence_plate_def = package.custom("presence_sensor_adapter", plate([(-16, -26), (16, -26), (16, 18), (-16, 18)], 3, sensor_plate_holes), material="polycarbonate", stock="3 mm flat, 32 mm wide to clear both adjacent wheel rows; tab joint and sensor interface unqualified", flat=True, holes=sensor_plate_holes)
    tab_holes = [(65, 245, 5.5)]
    tab_def = package.custom("presence_sensor_tab", plate([(59.5, 219), (80.5, 219), (80.5, 251), (59.5, 251)], 3, tab_holes), material="polycarbonate", stock="3 mm flat tray extension on existing dock screw; upright-to-tab joint NOT strength-qualified", flat=True, holes=tab_holes)
    tab_id = package.add("presence_sensor_tab", tab_def, location((0, 0, tray["top_z"] + 1.5)), "dock", parent=tray_id)
    sensor_def = package.define("sensor_reference_envelope", box((32, 24, 15), (0, 0, 0)), "REFERENCE only", "reference_envelope", "LaserCAN candidate envelope; vendor CAD and actual holes unavailable")
    for name, vertical in (("presence", 235), ("seated", 505)):
        height = tray["top_z"] + 29 if name == "presence" else 156.85
        mount = package.add("sensor_mount_" + name, presence_plate_def if name == "presence" else sensor_plate_def, location((79, vertical, height), (1, 0, 0)), "dock", parent=tab_id if name == "presence" else tray_id)
        package.add("sensor_" + name, sensor_def, location((100, vertical, height)), "dock", "sensor_envelope", mount)
    package.missing.append({"id": "sensors", "reason": "Two distinct presence/seated interfaces; LaserCAN dimensions/pattern and line-of-sight unverified"})


def clock_outputs(package, degrees=3):
    rotating_roles = {"hard_shaft", "gear", "hard_roller_core", "compliant_contact", "vendor_marking_unqualified", "hub", "collar", "bearing", "pulley", "spacer", "fastener"}
    instances = {instance["id"]: instance for instance in package.instances}
    for pair in package.gear_pairs:
        gear = instances[pair["gear"]]
        gear_pose = matrix(gear["pose"])
        origin = [row[3] for row in gear_pose[:3]]
        axis = pair["axis"]
        axial_index = axis.index(1)
        collinear = []
        for instance in package.instances:
            if instance["role"] not in rotating_roles:
                continue
            pose = matrix(instance["pose"])
            alignment = sum(pose[index][2] * axis[index] for index in range(3))
            radial = math.sqrt(sum((pose[index][3] - origin[index]) ** 2 for index in range(3) if index != axial_index))
            if abs(alignment) > 0.999999 and radial < 1e-5:
                collinear.append((instance, alignment))
        gear_extent = bounds(posed(package, gear))
        shafts = []
        for instance, alignment in collinear:
            if instance["role"] == "hard_shaft":
                extent = bounds(posed(package, instance))
                if extent[axial_index] <= gear_extent[axial_index] + 1e-5 and extent[axial_index + 3] >= gear_extent[axial_index + 3] - 1e-5:
                    shafts.append(instance["id"])
        if len(shafts) != 1:
            raise ValueError("Output gear must have one coaxial shaft spanning its width: " + pair["name"])
        for instance, alignment in collinear:
            if "output_clock_degrees" in instance:
                if instance["output_clock_degrees"] != degrees:
                    raise ValueError("Conflicting output clocks: " + instance["id"])
                continue
            instance["pose"] = instance["pose"] * cq.Location(cq.Vector(), cq.Vector(0, 0, 1), degrees if alignment > 0 else -degrees)
            instance["output_clock_degrees"] = degrees
        pair.update({"output_clock_degrees": degrees, "output_shaft": shafts[0], "output_clocked_parts": [instance["id"] for instance, alignment in collinear], "output_clocking": "Unchanged source-to-attachment normalization; assembly output gear and all collinear rotating parts clocked " + str(degrees) + " degrees about positive drive axis", "mesh_status": "Static tooth phase requires actual B-rep check; rotating mesh not proven"})


def build(settings=None):
    package = Package(settings or parameters())
    print("Building pickup with cached vendor definitions", flush=True)
    build_pickup(package)
    print("Building independent V-indexer banks", flush=True)
    build_indexer(package)
    print("Building detachable tray and receiver interface", flush=True)
    build_dock(package)
    clock_outputs(package)
    return package


def posed(package, instance, fold=0, floating=0):
    pose = instance["pose"]
    if instance["motion"] == "fold_input":
        pose = rotation_about((0, *instance["input_center_yz"]), instance["input_ratio"] * fold) * pose
    if instance["motion"] == "float":
        middle = next(roller["yz"] for roller in package.settings["pickup"]["rollers"] if roller["id"] == "middle")
        pose = rotation_about((0, *middle), floating) * pose
    if instance["motion"] in ("float", "fold"):
        pose = rotation_about((0, *package.settings["pickup"]["pivot_yz"]), fold) * pose
    return package.definitions[instance["definition"]]["shape"].moved(pose)


def export_package(package):
    custom_directory = ROOT / "custom"
    mesh_directory = ROOT / "meshes"
    custom_directory.mkdir(exist_ok=True)
    mesh_directory.mkdir(exist_ok=True)
    assembly = cq.Assembly(name="Coral_Intake_v1_NOT_RELEASED")
    counts = Counter(instance["definition"] for instance in package.instances)
    definitions = {}
    bom = []
    for name, definition in package.definitions.items():
        shape = definition["shape"]
        entry = {key: value for key, value in definition.items() if key != "shape"}
        entry.update({"bounds_mm": bounds(shape), "volume_mm3": shape.Volume(), "solids": len(shape.Solids()), "valid": shape.isValid(), "quantity": counts[name]})
        if definition["kind"] == "custom_brep":
            step_path = custom_directory / (name + ".step")
            cq.exporters.export(shape, str(step_path))
            entry["step"] = step_path.relative_to(ROOT).as_posix()
        mesh_path = mesh_directory / (name + ".stl")
        cq.exporters.export(shape, str(mesh_path), tolerance=0.6, angularTolerance=0.3)
        entry["mesh"] = mesh_path.relative_to(ROOT).as_posix()
        definitions[name] = entry
        if not definition["source"] or "parent_product" not in definition["source"]:
            quantity = counts[name]
            if definition["source"] and "solid_mapping" in definition["source"]:
                component_counts = {counts[part["definition"]] for part in definition["source"]["solid_mapping"]}
                if len(component_counts) != 1:
                    raise ValueError("Incomplete vendor product instances: " + name)
                quantity = component_counts.pop()
            bom.append({"part": name, "quantity": quantity, "material": definition["material"], "stock": definition["stock"], "geometry": definition["kind"], "source": definition["source"]["path"] if definition["source"] else "custom/local nominal", "status": "NOT RELEASED"})
    instances = []
    for instance in package.instances:
        definition = package.definitions[instance["definition"]]
        color = (0.18, 0.22, 0.25) if instance["role"] == "compliant_contact" else (0.65, 0.73, 0.78)
        if definition["kind"] == "authentic_vendor_brep":
            color = (0.9, 0.51, 0.12)
        if definition["kind"] == "reference_envelope":
            color = (0.35, 0.85, 0.65)
        assembly.add(definition["shape"], name=instance["id"], loc=instance["pose"], color=cq.Color(*color))
        entry = {key: value for key, value in instance.items() if key != "pose"}
        entry["matrix_row_major_mm"] = matrix(instance["pose"])
        entry["bounds_deployed_mm"] = bounds(posed(package, instance))
        instances.append(entry)
    assembly.save(str(ROOT / "assembled.step"))
    custom_shapes = [posed(package, instance) for instance in package.instances if package.definitions[instance["definition"]]["kind"] == "custom_brep"]
    cq.exporters.export(cq.Compound.makeCompound(custom_shapes), str(ROOT / "custompart.step"))
    missing_bom = [{"part": item["id"], "quantity": 1, "material": "procurement / design required", "stock": item.get("sku", "unresolved"), "geometry": "MISSING, not substituted", "source": item["reason"], "status": "BLOCKED"} for item in package.missing]
    bom.extend(missing_bom)
    (ROOT / "BOM.json").write_text(json.dumps(bom, indent=2) + "\n")
    with (ROOT / "BOM.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(bom[0]))
        writer.writeheader()
        writer.writerows(bom)
    report = {"schema_version": 1, "status": "prototype-engineering", "release": "NOT RELEASED", "units": "mm", "coordinates": "X width/Y into robot/Z up", "pose_convention": "world = row-major 4x4 matrix * local; STL in definition local frame", "definitions": definitions, "instances": instances, "sources": package.sources, "missing_required_parts": package.missing, "gear_pairs": package.gear_pairs, "belt_routes": package.belts, "joints": package.joints, "holes": package.holes, "receiver_keepout": package.settings["receiver_keepout"], "scope": "1+9 hybrid: pickup, powered V indexer, detachable receiver interface only; not option 14 or native Onshape", "brep_mesh_boundary": "Customs are parametric OpenCascade B-rep. STL files are derived viewer tessellations, never authoritative CAD. Vendor STEP originals retained; no native reference robot mesh used as custom solid."}
    (ROOT / "parts.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"instances": len(instances), "definitions": len(definitions), "custom_definitions": sum(definition["kind"] == "custom_brep" for definition in package.definitions.values()), "imported_originals": len(package.import_cache), "status": "prototype-engineering", "missing_required": len(package.missing)}), flush=True)
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    arguments = parser.parse_args()
    package = build()
    invalid = [name for name, definition in package.definitions.items() if not definition["shape"].isValid() or definition["shape"].Volume() <= 0]
    print(json.dumps({"stage": "build", "invalid_definitions": invalid, "definitions": len(package.definitions), "instances": len(package.instances)}), flush=True)
    if invalid:
        sys.exit(1)
    if not arguments.check:
        export_package(package)