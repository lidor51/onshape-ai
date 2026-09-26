import math
import itertools
import json
from functools import lru_cache
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import bounds, box, cq, cylinder, parameters
from model import Package, build_indexer, clock_outputs, hex_hub, location, matrix, plate, posed, ring, shaft, web
from drive_completion import add_drive_completion
from test_transmission import minimal_package
from transmission import add_transmission


@lru_cache(maxsize=1)
def completion_fixture():
    package = minimal_package()
    package.custom("tube_end_plug", ring(12, 5, 12))
    package.custom("hex_collar", hex_hub(24, 8))
    build_indexer(package)
    pickup = package.settings["pickup"]
    rail = pickup["sideplate_x"]
    centers = {roller["id"]: roller["yz"] for roller in pickup["rollers"]}
    pivot = pickup["pivot_yz"]
    points = [centers["kick"], [-330, 44], [-350, 210], centers["middle"], centers["rear"], pivot]
    holes = [(*center, 32) for name, center in centers.items() if name != "front"] + [(*pivot, 32)]
    holes += [(center[0] + horizontal, center[1] + vertical, 5.5) for center in [centers["kick"], centers["middle"], centers["rear"], pivot]
              for horizontal in (-20, 20) for vertical in (-20, 20)]
    rail_shape = web(points, 34, 6, holes).cut(box((1500, 500, 20), (0, -244, 0)))
    rail_def = package.custom("fixture_pickup_rail", rail_shape, holes=holes)
    cassette = "fixture_cassette"
    for sign, side in ((-1, "L"), (1, "R")):
        package.add("pickup_rail_" + side, rail_def, location((sign * rail, 0, 0), (1, 0, 0)), "pickup")
        for row in ("kick", "pivot"):
            center = pivot if row == "pivot" else centers[row]
            package.add("cassette_" + row + "_" + side, cassette, location((sign * (rail + 6), *center), (1, 0, 0)), "pickup")
            package.bearing("bearing_" + row + "_" + side, (sign * (rail + 9), *center), (sign, 0, 0), "pickup")
        for row in ("kick", "pivot", "rear"):
            if row == "rear" and sign == -1:
                continue
            center = pivot if row == "pivot" else centers[row]
            for index, (horizontal, vertical) in enumerate(itertools.product((-20, 20), repeat=2)):
                package.bolt("cassette_bolt_" + row + "_" + side + str(index), (sign * (rail + 10), center[0] + horizontal, center[1] + vertical),
                             (sign, 0, 0), 16, "pickup")
        stub = package.custom("fixture_pivot_stub", shaft(76))
        package.add("pivot_stub_" + str(sign), stub, location((sign * (rail + 12), *pivot), (1, 0, 0)), "dock", "hard_shaft")
    kick = centers["kick"]
    width = pickup["roller_width"]
    kick_shaft = package.custom("fixture_kick_shaft", shaft(640))
    package.add("shaft_kick", kick_shaft, location((0, *kick), (1, 0, 0)), "pickup", "hard_shaft")
    for name, shape, role in (("core_kick", ring(24, 20, width), "hard_roller_core"),
                              ("sleeve_kick", ring(51, 24, width), "compliant_contact")):
        package.add(name, package.custom("fixture_" + name, shape), location((0, *kick), (1, 0, 0)), "pickup", role)
    for sign in (-1, 1):
        hub = package.custom("fixture_kick_hub", hex_hub(20, 16))
        package.add("hub_kick" + str(sign), hub, location((sign * (width / 2 - 8), *kick), (1, 0, 0)), "pickup", "hub")
        package.add("collar_kick" + str(sign), "hex_collar", location((sign * (rail + 15), *kick), (1, 0, 0)), "pickup", "collar")
        package.bolt("shaft_end_kick" + str(sign), (sign * 321, *kick), (sign, 0, 0), 12, "pickup")
    rear = centers["rear"]
    package.add("pickup_drive_X44", package.vendor("x44"), location((300, rear[0] + 45.72, rear[1]), (1, 0, 0)), "pickup", "motor")
    package.drive("fold_drive", pivot, [pivot[0], pivot[1] + 45.72], rail + 13, (1, 0, 0), "dock", "frame_cheek_1")
    source_hub = next(part["definition"] for part in package.vendor_wheel_parts("intake_star") if part["role"] == "hard_roller_core")
    for instance in package.instances:
        if instance["id"].startswith("fixture_star_"):
            instance["definition"] = source_hub
    for index in (0, 1):
        original = next(instance for instance in package.instances if instance["id"] == "floating_stop_L" + str(index))
        pose = matrix(original["pose"])
        center = (pose[1][3], pose[2][3])
        stop = package.custom("fixture_stop_R" + str(index), web([centers["middle"], center], 13, 6, [(*center, 8.2)]))
        package.add("stop_mount_R" + str(index), stop, location((303, 0, 0), (1, 0, 0)), "pickup")
        package.bolt("floating_stop_R" + str(index), (307, *center), (1, 0, 0), 40, "pickup", nominal=8)
    add_transmission(package)
    package.fixture_before = len(package.instances)
    package.fixture_sources = repr(package.sources)
    package.fixture_original_shapes = {instance["id"]: posed(package, instance) for instance in package.instances}
    add_drive_completion(package)
    clock_outputs(package)
    return package


class IndexerCaptureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package = completion_fixture()
        cls.stacks = cls.package.drive_completion["indexer_stacks"]
        cls.instances = {instance["id"]: instance for instance in cls.package.instances}

    def test_capture_closes_with_one_float(self):
        self.assertEqual(len(self.stacks), 6)
        for stack in self.stacks:
            occupied = sum(end - start for start, end, name in stack["occupied_intervals_mm"])
            spacers = sum(item["length_mm"] for item in stack["spacers"])
            self.assertAlmostEqual(occupied + spacers + stack["axial_float_mm"], 192, places=6)
        self.assertFalse(any("_collar" in name for name in self.instances))

    def test_source_inner_race_and_wheel_hub_contact(self):
        bearing = self.package.definitions["vendor_hex_bearing"]["shape"]
        probe = ring(19, 15, 0.01).translate((0, 0, 1.5825))
        self.assertAlmostEqual(bearing.intersect(probe).Volume(), probe.Volume(), places=5)
        hub = next(part for part in self.package.vendor_wheel_parts("indexer_wheel") if part["role"] == "hard_roller_core")
        shape = self.package.definitions[hub["definition"]]["shape"]
        probe = ring(19, 15, 0.01).translate((0, 0, 12.695))
        self.assertAlmostEqual(shape.intersect(probe).Volume(), probe.Volume(), places=5)

    def test_clocked_shafts_fit_source_gears_and_pulleys(self):
        for side in ("L", "R"):
            shaft = posed(self.package, self.instances["indexer_" + side + "0_shaft"])
            for name in ("indexer_drive_" + side + "_60T", "indexer_" + side + "0_pulley"):
                self.assertLess(shaft.intersect(posed(self.package, self.instances[name])).Volume(), 1e-5)


class DriveCompletionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package = completion_fixture()
        cls.report = cls.package.drive_completion
        cls.instances = {instance["id"]: instance for instance in cls.package.instances}
        cls.shapes = {name: posed(cls.package, instance) for name, instance in cls.instances.items()}

    def test_inventory_idempotence_and_source_integrity(self):
        self.assertEqual(len(self.package.sources), 6)
        self.assertEqual(repr(self.package.sources), self.package.fixture_sources)
        before = len(self.package.instances)
        self.assertIs(add_drive_completion(self.package), self.package)
        self.assertEqual(before, len(self.package.instances))
        self.assertEqual(before - self.package.fixture_before, self.report["net_instance_delta"])
        self.assertEqual(len(self.instances), len(self.package.instances))
        for identifier in self.report["redefined_instances"]:
            holes = [hole for hole in self.package.holes if hole["part"] == identifier]
            self.assertEqual(len(holes), len(self.package.definitions[self.instances[identifier]["definition"]]["holes"]))
        rear = next(stack for stack in self.package.transmission["capture_stacks"] if stack["row"] == "rear")
        self.assertEqual(rear["shaft_ends_x_mm"], self.report["kicker"]["stacks"][0]["shaft_ends_mm"])
        self.assertTrue(all(spacer["id"] in self.instances for spacer in rear["spacers"]))
        for name, count in self.report["new_definition_quantities"].items():
            if count:
                with self.subTest(definition=name):
                    shape = self.package.definitions[name]["shape"]
                    self.assertTrue(shape.isValid())
                    self.assertGreater(shape.Volume(), 0)
                    self.assertTrue(all(shell.Closed() for shell in shape.Shells()))
                    if self.package.definitions[name]["flat"]:
                        self.assertEqual(len(shape.Solids()), 1)

    def test_actual_reversal_mesh_phase_and_hex_fit(self):
        first, second = self.shapes["dc_pickoff_60T"], self.shapes["dc_reverse_60T"]
        self.assertLess(first.intersect(second).Volume(), 1e-5)
        wrong = second.rotate((334, -85.2, 287), (335, -85.2, 287), 3)
        self.assertGreater(first.intersect(wrong).Volume(), 100)
        for shaft_id, members in (("shaft_rear", ("dc_pickoff_60T", "pickup_drive_60T")),
                                   ("dc_reverse_shaft", ("dc_reverse_60T", "dc_reverse_pulley", "dc_reverse_bearing_inner", "dc_reverse_bearing_outer")),
                                   ("shaft_kick", ("dc_kick_pulley", "hub_kick-1", "hub_kick1"))):
            for member in members:
                with self.subTest(shaft=shaft_id, other=member):
                    self.assertLess(self.shapes[shaft_id].intersect(self.shapes[member]).Volume(), 1e-5)
        self.assertEqual(self.report["kicker"]["rotation_relative_to_upper"], -1)
        self.assertAlmostEqual(math.dist(*self.report["kicker"]["gear_centers_yz_mm"]), 76.2)

    def test_capture_and_constant_center_loop(self):
        for stack in self.report["kicker"]["stacks"]:
            occupied = sum(end - start for start, end, name in stack["occupied_intervals_mm"])
            spacers = sum(item["length_mm"] for item in stack["spacers"])
            self.assertAlmostEqual(occupied + spacers + stack["axial_float_mm"], stack["shaft_ends_mm"][1] - stack["shaft_ends_mm"][0], places=6)
        loop = self.report["kicker"]["loop"]
        self.assertAlmostEqual(loop["installed_length_mm"] - loop["neutral_length_mm"], 3, places=6)
        self.assertAlmostEqual(self.shapes["dc_kick_belt"].Volume(), math.pi * 9 * loop["installed_length_mm"], delta=0.05)
        self.assertGreaterEqual(self.report["kicker"]["support"]["bearing_spacing_mm"], 12)
        for angle in (0, -60, -120):
            positions = []
            for name in ("dc_reverse_pulley", "dc_kick_pulley"):
                extent = bounds(posed(self.package, self.instances[name], fold=angle))
                positions.append(((extent[1] + extent[4]) / 2, (extent[2] + extent[5]) / 2))
            self.assertAlmostEqual(math.dist(*positions), loop["center_distance_mm"], places=5)

    def test_fold_hex_flange_fits_and_holding_is_blocked(self):
        for sign, side in ((-1, "L"), (1, "R")):
            self.assertLess(self.shapes["pivot_stub_" + str(sign)].intersect(self.shapes["dc_fold_flange_" + side]).Volume(), 1e-5)
            self.assertEqual(self.instances["pivot_stub_" + str(sign)]["motion"], "fold")
        self.assertFalse(self.report["fold"]["hold_latch_present"])
        self.assertIsNone(self.report["fold"]["required_torque_Nm"])
        self.assertEqual(self.report["status"], "NOT RELEASED")

    def test_new_right_hardware_stays_inside_width(self):
        exempt = {item["id"] for item in self.report["kicker"]["stacks"][0]["spacers"]}
        exempt.update({"dc_rear_end_-1_washer", "dc_rear_end_-1_screw", "shaft_rear"})
        for name in set(self.report["added_instances"] + self.report["redefined_instances"]) - exempt:
            with self.subTest(part=name):
                extent = bounds(self.shapes[name])
                self.assertGreaterEqual(extent[0], -350 - 1e-5)
                self.assertLessEqual(extent[3], 350 + 1e-5)

    def test_no_new_static_collisions_relative_to_fixture(self):
        changed = set(self.report["added_instances"] + self.report["redefined_instances"])
        extents = {name: bounds(shape) for name, shape in self.shapes.items()}
        adjacent = {frozenset((joint["first"], joint["second"])) for joint in self.package.joints}
        failures = []
        introduced = []
        checked = 0
        for first, second in itertools.combinations(self.shapes, 2):
            if first not in changed and second not in changed:
                continue
            first_box, second_box = extents[first], extents[second]
            if any(first_box[axis + 3] <= second_box[axis] + 1e-5 or second_box[axis + 3] <= first_box[axis] + 1e-5 for axis in range(3)):
                continue
            checked += 1
            volume = self.shapes[first].intersect(self.shapes[second]).Volume()
            expected = 0
            for screw, mate in ((first, second), (second, first)):
                if screw.endswith("_screw") and self.instances[mate]["role"] == "hard_shaft" and frozenset((screw, mate)) in adjacent:
                    expected = math.pi * (2.5 ** 2 - 2.1 ** 2) * 11
                if screw.startswith("dc_reverse_mount_screw_") and mate == "dc_reverse_inner_carrier":
                    expected = math.pi * (2.5 ** 2 - 2.1 ** 2) * 5
                if screw.startswith("dc_fold_mount_") and mate == "dc_fold_flange_" + screw[-2]:
                    expected = math.pi * (2.5 ** 2 - 2.1 ** 2) * 5
                if screw.startswith("dc_kick_idler_mount_screw_") and mate == screw.replace("mount_screw", "mount_nut"):
                    expected = math.pi * (2.5 ** 2 - 2.1 ** 2) * 4
                if screw.startswith("dc_kick_pin_") and mate == screw.replace("dc_kick_pin_", "dc_kick_pin_nut_"):
                    expected = math.pi * (2 ** 2 - 1.65 ** 2) * 4
            if abs(volume - expected) > 1e-4:
                original_names = [name.replace("dc_fold_mount_", "cassette_bolt_pivot_") for name in (first, second)]
                original_shapes = self.package.fixture_original_shapes
                baseline = original_shapes[original_names[0]].intersect(original_shapes[original_names[1]]).Volume() if all(name in original_shapes for name in original_names) else 0
                failure = {"first": first, "second": second, "volume_mm3": round(volume, 6), "expected_mm3": round(expected, 6),
                           "baseline_volume_mm3": round(baseline, 6), "introduced_or_worsened": volume > baseline + 1e-4}
                failures.append(failure)
                if failure["introduced_or_worsened"]:
                    introduced.append(failure)
        self.package.fixture_clearance = {"slice_boolean_pairs": checked, "clearance_failures": failures,
                                          "static_clearance_status": "FAIL" if failures else "PASS",
                                          "introduced_collisions": len(introduced), "full_motion_status": "NOT RUN"}
        print(json.dumps(self.package.fixture_clearance), flush=True)
        self.assertEqual(introduced, [])


def print_summary():
    package = completion_fixture()
    report = package.drive_completion
    counts = report["new_definition_quantities"]
    print(json.dumps({"drive_completion_net_instances": report["net_instance_delta"], "added": len(report["added_instances"]),
                      "removed": len(report["removed_instances"]), "redefined": len(report["redefined_instances"]),
                      "new_definitions": len(counts), "new_custom_definitions": sum(package.definitions[name]["kind"] == "custom_brep" for name in counts),
                      "unused_new_definitions": [name for name, quantity in counts.items() if not quantity],
                      "clearance": getattr(package, "fixture_clearance", {"status": "NOT RUN"}),
                      "source_additions": {"WCP-0121": 2, "WCP-0783": 4}, "loop": report["kicker"]["loop"],
                      "unresolved": report["unresolved"], "inherited_left_extent_mm": report["inherited_left_extent_mm"]}, indent=2), flush=True)


if __name__ == "__main__":
    completion_fixture()
    result = unittest.main(exit=False)
    print_summary()
    sys.exit(not result.result.wasSuccessful())