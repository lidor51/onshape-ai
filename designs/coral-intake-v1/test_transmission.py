import math
import copy
import itertools
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import bounds, cylinder, hex_shaft, parameters
from model import Package, clock_outputs, location, plate, posed, ring, shaft, web
from transmission import add_transmission, idler_layout, tensioned_belt, two_pulley_belt


def minimal_package():
    package = Package(parameters())
    pickup = package.settings["pickup"]
    rail = pickup["sideplate_x"]
    placeholder = package.custom("fixture_old_component", ring(24, 15, 8))
    hub = package.custom("fixture_hub", cylinder(10, 12.7, (0, 0, 0)).cut(hex_shaft(12.7, 15)))
    cassette = package.custom("fixture_cassette", plate([(-29, -29), (29, -29), (29, 29), (-29, 29)],
                              6, [(0, 0, 28.57)] + [(horizontal, vertical, 5.5) for horizontal in (-20, 20) for vertical in (-20, 20)]))
    for roller in pickup["rollers"]:
        name, center = roller["id"], roller["yz"]
        if name == "kick":
            continue
        motion = "float" if name == "front" else "fold"
        length = 2 * (rail + (40 if name == "rear" else 30))
        definition = package.custom("fixture_shaft_" + name, shaft(length))
        package.add("shaft_" + name, definition, location((0, *center), (1, 0, 0)), "pickup", "hard_shaft", motion=motion)
        for sign, side in ((-1, "L"), (1, "R")):
            axial = rail - 10 if name == "front" else rail + 6
            package.add("cassette_" + name + "_" + side, cassette, location((sign * axial, *center), (1, 0, 0)), "pickup", motion=motion)
            package.bearing("bearing_" + name + "_" + side, (sign * (axial + 3), *center), (sign, 0, 0), "pickup", motion=motion)
            package.add("collar_" + name + str(sign), placeholder, module="pickup", role="collar")
            package.bolt("shaft_end_" + name + str(sign), (sign * (length / 2 + 1), *center), (sign, 0, 0), 12, "pickup", motion=motion)
            if sign == -1:
                for index, (horizontal, vertical) in enumerate([(horizontal, vertical) for horizontal in (-20, 20) for vertical in (-20, 20)]):
                    package.bolt("cassette_bolt_" + name + "_L" + str(index), (-(axial + 4), center[0] + horizontal, center[1] + vertical),
                                 (-1, 0, 0), 16, "pickup", motion=motion)
        count = {"front": 9, "middle": 8, "rear": 5}[name]
        width = package.sourcebindings["intake_star"]["datums"]["overallWidthMm"]
        positions = [(index / (count - 1) - 0.5) * (pickup["roller_width"] - width) for index in range(count)]
        for index, position in enumerate(positions):
            package.add("fixture_star_" + name + "_" + str(index), hub, location((position, *center), (1, 0, 0)), "pickup", "hard_roller_core", motion=motion)
        package.wheel_rows.append({"row": name, "count": count, "hub_width_mm": width, "axial_centers_mm": positions})
        package.add("pulley_" + name, placeholder, module="pickup")
    package.add("pickup_upper_belt", placeholder, module="pickup", role="belt")
    rear = next(roller["yz"] for roller in pickup["rollers"] if roller["id"] == "rear")
    midplane = rail + 10 + package.settings["drives"]["pinion_midplane_from_motor_face"]
    gear = package.vendor("hex_output_gear")
    package.add("pickup_drive_60T", gear, location((midplane, *rear), (1, 0, 0)), "pickup", "gear")
    gear_end = midplane + package.sourcebindings["hex_output_gear"]["datums"]["overallWidthMm"] / 2
    spacer = package.custom("fixture_output_spacer", ring(24, 15, rail + 40 - gear_end))
    package.add("pickup_drive_output_spacer", spacer, location(((gear_end + rail + 40) / 2, *rear), (1, 0, 0)), "pickup", "spacer")
    package.gear_pairs.append({"name": "pickup_drive", "gear": "pickup_drive_60T", "axis": [1, 0, 0]})
    middle = next(roller["yz"] for roller in pickup["rollers"] if roller["id"] == "middle")
    arm_angle = math.atan2(-101, -125)
    for index, delta in enumerate((-8 - math.degrees(math.asin(34 / 85)), math.degrees(math.asin(34 / 85)))):
        angle = arm_angle + math.radians(delta)
        center = [middle[0] + 85 * math.cos(angle), middle[1] + 85 * math.sin(angle)]
        definition = package.custom("fixture_stop_mount_" + str(index), web([middle, center], 13, 6, [(*center, 8.2)]))
        package.add("stop_mount_L" + str(index), definition, location((-(rail + 13), 0, 0), (1, 0, 0)), "pickup")
        package.bolt("floating_stop_L" + str(index), (-(rail + 17), *center), (-1, 0, 0), 40, "pickup", nominal=8)
    package.belts.append({"id": "pickup_upper_belt"})
    package.missing.extend([{"id": "star_axial_retention"}, {"id": "kick_reversal", "reason": "unresolved"}])
    return package


class BeltGeometryTests(unittest.TestCase):
    def test_closed_exact_tangents_and_semicircles(self):
        for other in ((-261, 161), (-9, 287)):
            shape, length = two_pulley_belt((-136, 262), other)
            self.assertTrue(shape.isValid())
            self.assertEqual(len(shape.Solids()), 1)
            self.assertTrue(all(shell.Closed() for shell in shape.Shells()))
            self.assertAlmostEqual(length, 2 * math.dist((-136, 262), other) + 36 * math.pi, places=6)
            self.assertAlmostEqual(shape.Volume(), math.pi * 9 * length, delta=0.02)

    def test_invalid_centers_are_rejected(self):
        with self.assertRaises(ValueError):
            two_pulley_belt((0, 0), (10, 0))

    def test_idler_has_exact_take_up_and_closed_tangent_sweep(self):
        for other in ((-261, 161), (-9, 287)):
            for takeup in (2, 3, 4):
                layout = idler_layout((-136, 262), other, takeup)
                self.assertAlmostEqual(layout["installed_length_mm"] - layout["neutral_length_mm"], takeup, places=7)
                self.assertTrue(all(angle > 150 for angle in layout["pulley_wrap_degrees"]))
            shape, layout = tensioned_belt((-136, 262), other)
            self.assertTrue(shape.isValid())
            self.assertTrue(all(shell.Closed() for shell in shape.Shells()))
            self.assertAlmostEqual(shape.Volume(), math.pi * 9 * layout["installed_length_mm"], delta=0.05)


class TransmissionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package = minimal_package()
        cls.sources_before = repr(cls.package.sources)
        cls.before = len(cls.package.instances)
        add_transmission(cls.package)
        cls.instances = {instance["id"]: instance for instance in cls.package.instances}

    def test_valid_new_breps_and_no_source_mutation(self):
        self.assertEqual(repr(self.package.sources), self.sources_before)
        for name in self.package.transmission["new_definition_quantities"]:
            with self.subTest(definition=name):
                shape = self.package.definitions[name]["shape"]
                self.assertTrue(shape.isValid())
                self.assertGreater(shape.Volume(), 0)
                self.assertTrue(all(shell.Closed() for shell in shape.Shells()))

    def test_pair_routes_motion_and_idempotency(self):
        self.assertNotIn("pickup_upper_belt", self.instances)
        self.assertEqual(len(self.package.belts), 2)
        self.assertEqual(self.instances["tx_front_belt"]["motion"], "float")
        self.assertEqual(self.instances["tx_rear_belt"]["motion"], "fold")
        self.assertEqual(self.instances["tx_pulley_middle_front"]["motion"], "fold")
        self.assertEqual(self.instances["tx_pulley_middle_rear"]["motion"], "fold")
        count = len(self.package.instances)
        self.assertIs(add_transmission(self.package), self.package)
        self.assertEqual(count, len(self.package.instances))
        self.assertEqual(count - self.before, self.package.transmission["net_instance_delta"])
        self.assertEqual(self.package.transmission["net_instance_delta"], 88)

    def test_axial_capture_intervals_and_real_bearing_seat(self):
        for stack in self.package.transmission["capture_stacks"]:
            occupied = sum(end - start for start, end, name in stack["occupied_intervals_mm"])
            sleeves = sum(spacer["length_mm"] for spacer in stack["spacers"])
            self.assertAlmostEqual(occupied + sleeves + stack["axial_float_mm"], stack["shaft_length_mm"], places=6)
            self.assertGreater(stack["spacer_id_mm"], stack["hex_circumdiameter_mm"])
            self.assertLess(stack["spacer_od_mm"], stack["inner_race_od_mm"])
            self.assertFalse(any(name.startswith("collar_" + stack["row"]) for name in self.instances))
        bearing = self.package.definitions["vendor_hex_bearing"]["shape"]
        probe = ring(19, 15, 0.01).translate((0, 0, -6.345))
        self.assertAlmostEqual(bearing.intersect(probe).Volume(), probe.Volume(), places=5)

    def test_belts_do_not_intersect_pulleys_shafts_or_brackets(self):
        for member in ("front", "rear"):
            belt = posed(self.package, self.instances["tx_" + member + "_belt"])
            identifiers = ["shaft_front", "shaft_middle", "shaft_rear",
                           "tx_pulley_middle_front", "tx_pulley_middle_rear", "tx_pulley_" + member + "_" + member,
                           "tx_" + member + "_idler_wheel", "tx_" + member + "_idler_axle"]
            identifiers += [name for name in self.instances if "bracket_" in name or name.startswith("cassette_")]
            for name in identifiers:
                with self.subTest(belt=member, other=name):
                    other = posed(self.package, self.instances[name])
                    self.assertLess(belt.intersect(other).Volume(), 1e-5)

    def test_float_keeps_front_loop_coaxial_at_endpoints(self):
        shaft_instance = self.instances["shaft_front"]
        middle = next(roller["yz"] for roller in self.package.settings["pickup"]["rollers"] if roller["id"] == "middle")
        for floating in (-8, -4, 0):
            extent = bounds(posed(self.package, shaft_instance, floating=floating))
            center = ((extent[1] + extent[4]) / 2, (extent[2] + extent[5]) / 2)
            self.assertAlmostEqual(math.dist(center, middle), math.hypot(125, 101), places=6)
            belt = posed(self.package, self.instances["tx_front_belt"], floating=floating)
            middle_pulley = posed(self.package, self.instances["tx_pulley_middle_front"], floating=floating)
            self.assertLess(belt.intersect(middle_pulley).Volume(), 1e-5)

    def test_unqualified_items_stay_visible(self):
        report = self.package.transmission
        self.assertEqual(report["status"], "NOT RELEASED")
        self.assertIn("kick_reversal", report["unresolved"])
        self.assertTrue(all(loop["load_test_required"] and not loop["cut_length_released"] for loop in report["loops"]))
        self.assertTrue(any(item["id"] == "kick_reversal" for item in self.package.missing))

    def test_floating_stop_neighbors_clear_new_transmission(self):
        candidates = [instance for instance in self.package.instances if instance["id"].startswith("tx_front")]
        for floating in (-8, 0):
            for stop in ("tx_middle_stop_bridge", "floating_stop_L0", "floating_stop_L1"):
                obstacle = posed(self.package, self.instances[stop], floating=floating)
                for instance in candidates:
                    shape = posed(self.package, instance, floating=floating)
                    first, second = bounds(shape), bounds(obstacle)
                    if any(first[axis + 3] < second[axis] or second[axis + 3] < first[axis] for axis in range(3)):
                        continue
                    with self.subTest(floating=floating, stop=stop, part=instance["id"]):
                        self.assertLess(shape.intersect(obstacle).Volume(), 1e-5)

    def test_parent_clock_preserves_rear_hex_fit(self):
        package = copy.copy(self.package)
        package.instances = [dict(instance) for instance in self.package.instances]
        package.gear_pairs = [dict(pair) for pair in self.package.gear_pairs]
        clock_outputs(package)
        instances = {instance["id"]: instance for instance in package.instances}
        self.assertEqual(instances["shaft_rear"]["output_clock_degrees"], 3)
        self.assertEqual(instances["tx_pulley_rear_rear"]["output_clock_degrees"], 3)
        self.assertNotIn("output_clock_degrees", instances["tx_rear_belt"])
        self.assertLess(posed(package, instances["shaft_rear"]).intersect(posed(package, instances["pickup_drive_60T"])).Volume(), 1e-5)

    def test_structural_interfaces_and_representative_threads(self):
        shapes = {name: posed(self.package, instance) for name, instance in self.instances.items()}
        boxes = {name: bounds(shape) for name, shape in shapes.items()}
        joint_pairs = {frozenset((joint["first"], joint["second"])) for joint in self.package.joints}
        thread_cases = {frozenset(pair) for pair in (("shaft_front", "tx_capture_front_-1_screw"),
                        ("tx_front_idler_axle", "tx_front_idler_end_-1_screw"),
                        ("tx_front_idler_mount_screw_0", "tx_front_idler_mount_nut_0"))}
        for first, second in itertools.combinations(shapes, 2):
            pair = frozenset((first, second))
            structures = ("tx_middle_stop_bridge", "tx_front_idler_bracket_-1", "tx_front_idler_bracket_1",
                          "tx_rear_idler_bracket_-1", "tx_rear_idler_bracket_1")
            if not (first in structures or second in structures or pair in thread_cases):
                continue
            if self.instances[first]["role"] == "belt" or self.instances[second]["role"] == "belt":
                continue
            first_box, second_box = boxes[first], boxes[second]
            if any(first_box[axis + 3] <= second_box[axis] + 1e-5 or second_box[axis + 3] <= first_box[axis] + 1e-5 for axis in range(3)):
                continue
            volume = shapes[first].intersect(shapes[second]).Volume()
            threaded_length = 0
            for screw, mate in ((first, second), (second, first)):
                if screw.endswith("_screw") and (mate.startswith("shaft_") or mate.endswith("_axle")) and frozenset((screw, mate)) in joint_pairs:
                    threaded_length = 11
                if "_mount_screw_" in screw and screw.replace("_mount_screw_", "_mount_nut_") == mate:
                    threaded_length = 4
            expected = math.pi * (2.5 ** 2 - 2.1 ** 2) * threaded_length
            with self.subTest(first=first, second=second):
                self.assertAlmostEqual(volume, expected, delta=1e-5)


if __name__ == "__main__":
    unittest.main()