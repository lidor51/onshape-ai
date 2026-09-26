import json
import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, bounds, parameters
from model import build, matrix, posed
from validate import axis_checks, coral, definition_checks, overlap
from integration_checks import EXPECTED_SOURCES, check_package, gear_checks, reducer_repair_checks, wheel_fit_checks, write_report


class ReducerRepairTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package = build()
        cls.deployed = {part["id"]: posed(cls.package, part) for part in cls.package.instances}

    def test_all_four_static_meshes_and_engagements(self):
        results = gear_checks(self.package, self.deployed)
        self.assertEqual(len(results), 4)
        for result in results:
            with self.subTest(drive=result["name"]):
                self.assertTrue(result["pass"], result)
                self.assertEqual(result["output_clock_degrees"], 3)

    def test_all_bearings_and_all_forty_hubs_still_fit(self):
        bearings = axis_checks(self.package, self.deployed)
        wheels = wheel_fit_checks(self.package, self.deployed)
        self.assertEqual(len(bearings), 28)
        self.assertEqual(len(wheels), 40)
        self.assertTrue(all(result["pass"] for result in bearings + wheels), [result for result in bearings + wheels if not result["pass"]])

    def test_counterbores_screws_access_and_whole_sensor_parts(self):
        result = reducer_repair_checks(self.package, self.deployed)
        self.assertEqual(len(result["counterbores"]), 12)
        self.assertEqual(len(result["motor_screws"]), 12)
        self.assertTrue(result["pass"], result)
        self.assertTrue(all(not pocket["strength_qualified"] for pocket in result["counterbores"]))
        self.assertTrue(all(screw["geometry_kind"] == "standard_hardware_nominal_brep" for screw in result["motor_screws"]))

    def test_through_holes_remain_gauged_and_right_cheek_only(self):
        results = definition_checks(self.package)
        self.assertTrue(all(result["valid_closed_positive_solids"] and result["holes_pass"] for result in results), [result for result in results if not result["valid_closed_positive_solids"] or not result["holes_pass"]])
        instances = {part["id"]: part for part in self.package.instances}
        pivot = self.package.settings["pickup"]["pivot_yz"]
        hole = (pivot[0], pivot[1] + 45.72, 20)
        self.assertIn(hole, self.package.definitions[instances["frame_cheek_1"]["definition"]]["holes"])
        self.assertNotIn(hole, self.package.definitions[instances["frame_cheek_-1"]["definition"]]["holes"])

    def test_clock_records_include_both_fold_stubs_not_mounts_or_motors(self):
        instances = {part["id"]: part for part in self.package.instances}
        for pair in self.package.gear_pairs:
            self.assertIn(pair["output_shaft"], pair["output_clocked_parts"])
            for identifier in (pair["motor"], pair["pinion"], pair["name"] + "_mount"):
                self.assertNotIn(identifier, pair["output_clocked_parts"])
                self.assertNotIn("output_clock_degrees", instances[identifier])
            for identifier in pair["output_clocked_parts"]:
                part = instances[identifier]
                self.assertEqual(part["output_clock_degrees"], 3)
                pose = matrix(part["pose"])
                positive_axis = pair["axis"].index(1)
                base_horizontal = (0, 1, 0) if positive_axis == 0 else (1, 0, 0)
                cosine = sum(pose[index][0] * base_horizontal[index] for index in range(3))
                self.assertAlmostEqual(cosine, math.cos(math.radians(3)), places=9)
        fold = next(pair for pair in self.package.gear_pairs if pair["name"] == "fold_drive")
        self.assertTrue({"pivot_stub_-1", "pivot_stub_1"}.issubset(fold["output_clocked_parts"]))


class PackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package = build()
        cls.settings = cls.package.settings
        cls.integration = check_package(cls.package)
        write_report(cls.integration)

    def test_all_definitions_valid_closed_positive(self):
        for name, definition in self.package.definitions.items():
            with self.subTest(part=name):
                shape = definition["shape"]
                self.assertTrue(shape.isValid())
                self.assertGreater(shape.Volume(), 0)
                self.assertTrue(all(shell.Closed() for shell in shape.Shells()))

    def test_exact_coral_stock(self):
        piece = coral(self.settings)
        expected = math.pi * (114.3 ** 2 - 101.6 ** 2) / 4 * 301.625
        self.assertAlmostEqual(piece.Volume(), expected, places=3)
        self.assertAlmostEqual(bounds(piece)[1], 234.1875, places=4)
        self.assertAlmostEqual(bounds(piece)[4], 535.8125, places=4)

    def test_vendor_sources_imported_once_and_x60_absent(self):
        self.assertEqual(set(self.package.sources), set(EXPECTED_SOURCES))
        self.assertEqual(len(self.package.import_cache), 6)
        self.assertTrue(all(source["original_bytes_unchanged"] and source["import_count"] == 1 for source in self.package.sources.values()))
        for identifier, (sku, solids) in EXPECTED_SOURCES.items():
            source = self.package.sources[identifier]
            self.assertEqual(source["sku"], sku)
            self.assertEqual(source["source_root_count"], 1)
            self.assertEqual(source["import_solids"], solids)
        self.assertNotIn("x60", json.dumps(self.package.sources).lower())

    def test_genuine_gears_replace_old_missing_entries(self):
        self.assertEqual(len(self.package.gear_pairs), 4)
        self.assertTrue(all(pair["vendor_solids_present"] for pair in self.package.gear_pairs))
        self.assertTrue(all(abs(pair["center_distance"] - 45.72) < 1e-7 for pair in self.package.gear_pairs))
        self.assertFalse(any(item.get("sku") in {"WCP-1010", "WCP-0121"} for item in self.package.missing))
        self.assertEqual(sum(part["role"] == "gear" for part in self.package.instances), 8)

    def test_original_solids_and_hashes_preserved(self):
        self.assertTrue(all(source["pass"] for source in self.integration["sources"]))

    def test_material_split_retains_hubs_and_star_marking(self):
        for product, count in (("indexer_wheel", 2), ("intake_star", 3)):
            parts = self.package.sources[product]["solid_mapping"]
            self.assertEqual(len(parts), count)
            self.assertEqual(sum(part["role"] == "compliant_contact" for part in parts), 1)
            self.assertEqual(sum(part["role"] == "hard_roller_core" for part in parts), 1)
            self.assertEqual({part["source_solid_index"] for part in parts}, set(range(count)))
            for part in parts:
                definition = self.package.definitions[part["definition"]]
                self.assertEqual(definition["kind"], "authentic_vendor_brep")
                self.assertAlmostEqual(definition["shape"].Volume(), part["volume_mm3"], places=5)
        self.assertEqual(sum(part["role"] == "vendor_marking_unqualified" for part in self.package.instances), 22)

    def test_only_kick_retains_custom_rubber(self):
        self.assertNotIn("indexer_custom_tyre", self.package.definitions)
        self.assertNotIn("indexer_wheel_core", self.package.definitions)
        for name in ("front", "middle", "rear"):
            self.assertNotIn("compliant_sleeve_" + name, self.package.definitions)
            self.assertNotIn("roller_core_" + name, self.package.definitions)
        sleeve = self.package.definitions["compliant_sleeve_kick"]
        self.assertEqual(sleeve["kind"], "custom_brep")
        self.assertIsNone(sleeve["source"])
        self.assertAlmostEqual(bounds(sleeve["shape"])[3] - bounds(sleeve["shape"])[0], 51)
        self.assertTrue(all(self.package.sources[name]["variant"]["durometerShoreA"] == 35 for name in ("indexer_wheel", "intake_star")))

    def test_actual_star_rows_fit_width_and_shafts(self):
        self.assertEqual({row["row"]: row["count"] for row in self.package.wheel_rows}, {"front": 9, "middle": 8, "rear": 5})
        for row in self.package.wheel_rows:
            self.assertAlmostEqual(row["hub_width_mm"], 12.7)
            self.assertGreater(row["minimum_shaft_end_clearance_mm"], 0)
            for center in row["axial_centers_mm"]:
                self.assertLessEqual(abs(center) + row["hub_width_mm"] / 2, self.settings["pickup"]["roller_width"] / 2 + 1e-6)

    def test_indexer_actual_stacks_follow_parameters(self):
        cores = [part for part in self.package.instances if part["definition"] == "vendor_indexer_wheel_solid_1"]
        self.assertEqual(len(cores), 2 * sum(len(stack) for stack in self.settings["indexer"]["wheel_z"]))
        for sign, suffix in ((-1, "L"), (1, "R")):
            for station, (center, stack) in enumerate(zip(self.settings["indexer"]["stations_xy"], self.settings["indexer"]["wheel_z"])):
                for index, height in enumerate(stack):
                    part = next(part for part in cores if part["id"] == "indexer_" + suffix + str(station) + "_wheel_" + str(index) + "_solid_1")
                    position = part["pose"].toTuple()[0]
                    self.assertEqual(position, (sign * center[0], center[1], height))

    def test_actual_gear_axes_bores_and_retention_engagement(self):
        for gear in self.integration["gears"]:
            with self.subTest(drive=gear["name"]):
                self.assertTrue(gear["placement_pass"], gear)
                self.assertAlmostEqual(gear["actual_center_distance_mm"], 45.72)
                self.assertLess(gear["spline_overlap_mm3"], 0.01)
                self.assertLess(gear["output_hex_overlap_mm3"], 0.01)
                self.assertGreaterEqual(gear["shaft_engagement_mm"], gear["gear_width_mm"] - 1e-5)

    def test_drilled_holes_and_actual_bearing_fits(self):
        self.assertTrue(self.integration["gates"]["valid_brep_and_drilled_holes"])
        self.assertTrue(self.integration["gates"]["bearing_shaft_fits"])

    def test_repaired_static_teeth_and_new_part_neighbors(self):
        self.assertTrue(self.integration["gates"]["static_gear_mesh"], self.integration["gears"])
        self.assertTrue(self.integration["gates"]["new_part_deployed_clearances"], self.integration["new_part_clearances"])
        self.assertTrue(self.integration["gates"]["reducer_repair_geometry"], self.integration["reducer_repairs"])

    def test_all_vendor_wheel_hubs_fit_actual_shafts(self):
        self.assertEqual(len(self.integration["wheel_fits"]), 40)
        for result in self.integration["wheel_fits"]:
            with self.subTest(hub=result["hub"]):
                self.assertTrue(result["pass"], result)
                self.assertFalse(result["manufacturing_fit_approved"])

    def test_full_length_witnesses_include_vendor_hard_hubs(self):
        poses = self.integration["piece_checks"]["poses"]
        self.assertEqual({pose["pose"] for pose in poses}, {"floor_pickup_witness", "bumper_crest_witness", "seated_offer"})
        self.assertTrue(all(pose["full_length_mm"] == 301.625 for pose in poses))
        self.assertTrue(all(part["role"] != "compliant_contact" for part in self.package.instances if part["definition"] in {"vendor_intake_star_solid_0", "vendor_indexer_wheel_solid_1"}))
        self.assertTrue(self.integration["piece_checks"]["hard_clearance_pass"], poses)

    def test_incomplete_integration_cannot_approve_global_gates(self):
        self.assertFalse(self.integration["global_gates_approved"])
        self.assertEqual(self.integration["release"], "NOT RELEASED")
        self.assertFalse(any(pair["fit_and_mesh_approved"] for pair in self.package.gear_pairs))
        self.assertIn("kick_reversal", {entry["id"] for entry in self.package.missing})
        self.assertEqual(self.integration["status"], "PASS" if all(self.integration["gates"].values()) else "FAIL")

    def test_three_modules_only_and_four_separate_motors(self):
        self.assertEqual({part["module"] for part in self.package.instances}, {"pickup", "indexer", "dock"})
        self.assertEqual(sum(part["role"] == "motor" for part in self.package.instances), 4)
        self.assertEqual(sum(part["role"] == "sensor_envelope" for part in self.package.instances), 2)

    def test_closed_belt_paths_positive_length(self):
        self.assertEqual(len(self.package.belts), 3)
        self.assertTrue(all(route["closed"] and route["nominal_length"] > 100 for route in self.package.belts))

    def test_parameter_change_moves_actual_brep(self):
        instance = next(part for part in self.package.instances if part["id"] == "shaft_front")
        baseline = posed(self.package, instance)
        floated = posed(self.package, instance, floating=-8)
        folded = posed(self.package, instance, fold=-120)
        self.assertGreater(floated.Center().z, baseline.Center().z + 15)
        self.assertGreater(folded.Center().y, 0)
        self.assertAlmostEqual(baseline.Volume(), floated.Volume(), places=4)

    def test_no_full_width_pivot_shaft(self):
        pivots = [part for part in self.package.instances if part["id"].startswith("pivot_stub_")]
        self.assertEqual(len(pivots), 2)
        for part in pivots:
            extent = bounds(posed(self.package, part))
            self.assertLess(extent[3] - extent[0], 77)
            self.assertGreater(abs(posed(self.package, part).Center().x), 200)

    def test_hard_collision_detector_does_not_waive_shafts(self):
        piece = coral(self.settings)
        self.assertGreater(overlap(piece, piece), 100000)
        settings = json.loads(json.dumps(self.settings))
        settings["coral"]["final_center"][0] += 500
        self.assertEqual(overlap(piece, coral(settings)), 0)

    def test_original_roller_hypothesis_evidence_preserved(self):
        evidence = json.loads((ROOT / "initial-probe.json").read_text())
        self.assertEqual(len(evidence["samples"]), 100)
        self.assertEqual(evidence["status"], "PASS")
        self.assertIn("not complete mechanism", evidence["scope"])


if __name__ == "__main__":
    unittest.main(verbosity=2)