import importlib.util
import json
import math
from pathlib import Path
import sys
import unittest


sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("powered", Path(__file__).with_name("powered_transmissions.py"))
powered = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(powered)


class LayoutTests(unittest.TestCase):
    def test_upper_catalog_lengths(self):
        self.assertAlmostEqual(powered.belt_length(155, 18, 18), 400)
        self.assertAlmostEqual(powered.belt_length(180, 18, 18), 450)

    def test_unequal_loop_exact_length(self):
        center = powered.belt_center(350, 18, 36)
        self.assertAlmostEqual(powered.belt_length(center, 18, 36), 350, places=9)
        self.assertTrue(106 < center < 107)

    def test_moving_reverse_carrier(self):
        rear, kicker = [-25, 348], [-122, 34]
        distance = powered.belt_center(700, 36, 15)
        center = powered.circle_intersection(rear, 76.2, kicker, distance)
        self.assertAlmostEqual(math.dist(center, rear), 76.2)
        self.assertAlmostEqual(powered.belt_length(math.dist(center, kicker), 36, 15), 700)

    def test_impossible_geometry_rejected(self):
        with self.assertRaises(ValueError):
            powered.belt_center(20, 18, 36)
        with self.assertRaises(ValueError):
            powered.circle_intersection([0, 0], 1, [5, 0], 1)

    def test_discrete_chain_routes_close_at_actual_pitch(self):
        for parameters in ((14, 36, 6, 20, 56), (16, 60, 7, 33, 90)):
            layout = powered.chain_layout(*parameters)
            points = layout["points"]
            self.assertEqual(len(points), layout["links"])
            for index, point in enumerate(points):
                self.assertAlmostEqual(math.dist(point, points[(index + 1) % len(points)]), 6.35, places=9)


class AssemblyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.assembly = powered.build()
        cls.report = cls.assembly.powertrain_installation

    def test_four_real_motors_and_retained_rollers(self):
        self.assertEqual(sum(part["role"] == "motor" for part in self.assembly.instances), 4)
        self.assertEqual(sum(part["id"].startswith("v2_star_") and part["id"].endswith("_body_2") for part in self.assembly.instances), 27)
        self.assertEqual(sum(part["id"].startswith("v1_indexer_") and "_wheel_" in part["id"] and part["role"] == "compliant_contact" for part in self.assembly.instances), 18)

    def test_closed_pitch_routes_and_supported_jackshafts(self):
        paths = {row["id"]: row for row in self.report["paths"]}
        for name, length in (("pickup_reduction", 350), ("front_middle", 450), ("rear_middle", 400), ("reverse_kicker", 700)):
            self.assertAlmostEqual(paths[name]["length_mm"], length, places=6)
        self.assertEqual(len(self.report["supports"]), 8)
        for support in self.report["supports"]:
            self.assertEqual(len(support["bearings"]), 2)
            self.assertGreater(support["spacing_mm"], 30)

    def test_indexer_belts_and_takeup_slots(self):
        paths = {row["id"]: row for row in self.report["paths"]}
        for side in ("L", "R"):
            for index, length in enumerate((350, 320)):
                path = paths["indexer_" + side + "_" + str(index)]
                self.assertAlmostEqual(path["length_mm"], length, places=6)
                self.assertGreater(path["wrap_deg"][0], 140)
                self.assertGreater(path["wrap_deg"][2], 140)
        self.assertFalse(any(part["id"].startswith("v1_indexer_belt_") for part in self.assembly.instances))
        self.assertEqual(sum("adjustment_slots_mm" in row for row in self.report["supports"]), 4)

    def test_pickup_support_bore_is_actually_open(self):
        assembly = self.assembly
        bearing = next(part for part in assembly.instances if part["id"] == "pt_drive_pickup_output_bearing")
        center = assembly.pickup_module.matrix(bearing["pose"])
        probe = assembly.pickup_module.cylinder(14.2748, 5.9, (263, center[1][3], center[2][3]), (1, 0, 0))
        mount = next(part for part in assembly.instances if part["id"] == "pt_drive_pickup_mount")
        self.assertLess(assembly.shape(mount).intersect(probe).Volume(), 1e-5)

    def test_deployment_is_independent_of_powered_shaft(self):
        assembly = self.assembly
        instances = {part["id"]: part for part in assembly.instances}
        shaft = assembly.shape(instances["v2_shaft_rear"])
        for identifier in ("pt_deployment_adapter", "pt_deployment_60T_plate"):
            self.assertEqual(instances[identifier]["motion"], "fold")
            self.assertLess(assembly.shape(instances[identifier]).intersect(shaft).Volume(), 1e-5)
        self.assertEqual(instances["v2_shaft_rear"]["motion"], "fixed")
        self.assertAlmostEqual(abs(self.report["ratios"]["deployment_motor_to_cheek"]), 48.214285714285715)

    def test_frame_bearing_holes_survive_added_gearbox_mounts(self):
        assembly = self.assembly
        rear = assembly.pickup.config["pivot_yz"]
        for sign in (-1, 1):
            identifier = "coaxial_frame_plate_" + str(sign)
            part = next(part for part in assembly.instances if part["id"] == identifier)
            probe = assembly.pickup_module.cylinder(14.2748, 5.9, (sign * 310, *rear), (1, 0, 0))
            self.assertLess(assembly.shape(part).intersect(probe).Volume(), 1e-5)

    def test_actual_gear_mesh_overlap(self):
        assembly = self.assembly
        instances = {part["id"]: part for part in assembly.instances}
        for mesh in self.report["gear_meshes"]:
            expected = sum(mesh["teeth"]) * 25.4 / 40
            self.assertAlmostEqual(mesh["centers_mm"], expected, places=7)
            volume = assembly.shape(instances[mesh["input"]]).intersect(assembly.shape(instances[mesh["output"]])).Volume()
            mesh["measured_overlap_mm3"] = volume
            self.assertLess(volume, 1e-4, mesh["output"])

    def test_deployment_cheek_screws_do_not_pierce_vendor_plate(self):
        assembly = self.assembly
        instances = {part["id"]: part for part in assembly.instances}
        plate = assembly.shape(instances["pt_deployment_60T_plate"])
        for index in range(4):
            screw = assembly.shape(instances["pt_deployment_cheek_bolt_" + str(index)])
            self.assertLess(plate.intersect(screw).Volume(), 1e-6)

    def test_documented_motionx_holes_pass_real_screw_diameter(self):
        assembly = self.assembly
        flange = next(row for row in self.report["attachments"] if row["id"] == "independent_deployment_flange")
        self.assertTrue(flange["documented_pattern"])
        source = assembly.definitions["pt_WCP-0970"]["shape"]
        for point in flange["source_hole_centers_mm"]:
            self.assertAlmostEqual(math.hypot(*point), 25.4, places=7)
            screw = assembly.pickup_module.cylinder(4.826 / 2, 5, (*point, 0))
            self.assertLess(source.intersect(screw).Volume(), 1e-6)

    def test_critical_local_hardware_clearances(self):
        assembly = self.assembly
        instances = {part["id"]: part for part in assembly.instances}
        pairs = [("pt_reverse_60T", "pt_reverse_column_" + str(index)) for index in range(4)]
        pairs += [("pt_drive_pickup_60T", "pt_pickup_inner_keeper"),
                  ("pt_reverse_60T", "pt_reverse_inner_keeper"),
                  ("pt_reverse_36T", "pt_reverse_outer_keeper"),
                  ("pt_rear_36T", "pt_reverse_outer_plate"),
                  ("pt_deployment_adapter", "v2_bearing_rear_-1_keeper"),
                  ("pt_pickup_reduction", "pt_pickup_18T"),
                  ("pt_reverse_kicker", "pt_reverse_36T")]
        checks = []
        for first, second in pairs:
            volume = assembly.shape(instances[first]).intersect(assembly.shape(instances[second])).Volume()
            checks.append({"pair": [first, second], "overlap_mm3": volume})
        self.report["critical_interface_checks"] = checks
        failures = [row for row in checks if row["overlap_mm3"] >= 1e-4]
        self.assertEqual(failures, [])

    def test_powerpath_centers_through_fold_and_float(self):
        assembly = self.assembly
        instances = {part["id"]: part for part in assembly.instances}
        pairs = [("pt_rear_reverse_60T", "pt_reverse_60T", 76.2),
                 ("pt_reverse_36T", "pt_kick_15T", powered.belt_center(700, 36, 15)),
                 ("pt_front_middle_middle", "pt_front_middle_front", 180),
                 ("pt_rear_middle_rear", "pt_rear_middle_middle", 155)]
        for fold in (0, -45, -90, -135, -165):
            for floating in (0, -4, -8):
                for first, second, distance in pairs:
                    centers = []
                    for identifier in (first, second):
                        matrix = assembly.pickup_module.matrix(assembly.pose(instances[identifier], fold, floating))
                        centers.append([row[3] for row in matrix[:3]])
                    self.assertAlmostEqual(math.dist(*centers), distance, places=7)

    def test_source_originals_unchanged(self):
        sources = powered.load_sibling("transmission_sources")
        ledger = sources.receipts()
        self.assertLess(ledger["charged_bytes"], sources.LIMIT_TOTAL)
        for binding in ledger["products"].values():
            self.assertEqual(sources.digest(sources.CACHE / binding["file"]), binding["sha256"])

    @classmethod
    def tearDownClass(cls):
        report = powered.write_report(cls.assembly)
        print(json.dumps({"counts": report["counts"], "load_screen": report["load_screen"]}), flush=True)

    def test_capture_stacks_have_positive_gaps_and_end_float(self):
        for stack in self.report["stacks"]:
            cursor = stack["ends_mm"][0]
            for start, end, identifier in stack["occupied"]:
                self.assertGreaterEqual(start + 1e-5, cursor, identifier)
                self.assertGreater(end, start)
                cursor = end
            self.assertLessEqual(cursor, stack["ends_mm"][1] + 1e-5)
            self.assertEqual(stack["end_float_mm"], 0.2)

    def test_real_pulley_hex_bores_accept_actual_shaft(self):
        module = self.assembly.pickup_module
        shaft = module.hex_prism(12.7, 18)
        for sku in ("WCP-0563", "WCP-0990", "WCP-1420"):
            shape = self.assembly.definitions["pt_" + sku]["shape"]
            self.assertEqual(len(shape.Solids()), 3)
            self.assertTrue(shape.isValid())
            self.assertLess(shape.intersect(shaft).Volume(), 1e-6, sku)

    def test_new_shapes_valid_and_identifiers_unique(self):
        names = [part["id"] for part in self.assembly.instances]
        self.assertEqual(len(names), len(set(names)))
        active = {part["definition"] for part in self.assembly.instances if part["id"].startswith("pt_")}
        for name in active:
            shape = self.assembly.definitions[name]["shape"]
            self.assertTrue(shape.isValid(), name)
            self.assertGreater(shape.Volume(), 0, name)


if __name__ == "__main__":
    run = unittest.main(exit=False)
    report_path = Path(__file__).with_name("transmission-installation.json")
    if report_path.exists() and run.result.testsRun > 5:
        report = json.loads(report_path.read_text())
        report["test_run"] = {"tests_run": run.result.testsRun, "passed": run.result.wasSuccessful(),
                              "failures": [test.id() for test, message in run.result.failures],
                              "errors": [test.id() for test, message in run.result.errors],
                              "scope": "Focused installation CAD tests, not full-system clearance or competition release"}
        report_path.write_text(json.dumps(report, indent=2) + "\n")
    sys.exit(0 if run.result.wasSuccessful() else 1)