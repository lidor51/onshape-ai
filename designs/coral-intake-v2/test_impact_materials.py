import copy
import json
import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import impact_materials as impact


class ImpactMaterialsTests(unittest.TestCase):
    def test_mass_units_against_one_square_metre(self):
        result = impact.plate_comparison(1_000_000, 6, 69e9, 2700)
        self.assertAlmostEqual(result["mass_kg"], 16.2)
        self.assertEqual(result["weak_axis_Et3_relative_to_6mm_al"], 1)
        self.assertEqual(result["strong_axis_Et_relative_to_6mm_al"], 1)

    def test_pc_6p35_stiffness_and_mass(self):
        result = impact.plate_comparison(1_000_000, 6.35, 2.3e9, 1200)
        self.assertAlmostEqual(result["mass_kg"], 7.62)
        self.assertAlmostEqual(result["weak_axis_Et3_relative_to_6mm_al"], 0.03951356095679013)
        self.assertAlmostEqual(result["strong_axis_Et_relative_to_6mm_al"], 0.035277777777777776)
        equivalent = impact.equal_weak_axis_thickness(6, 69e9, 2.3e9)
        self.assertAlmostEqual(equivalent, 18.643395035723153)

    def test_cantilever_independent_si_solution(self):
        result = impact.cantilever(150, 300, 60, 6, 69e9)
        self.assertAlmostEqual(result["second_moment_m4"], 1.08e-9)
        self.assertAlmostEqual(result["root_moment_nm"], 45)
        self.assertAlmostEqual(result["elastic_nominal_stress_mpa"], 125)
        self.assertAlmostEqual(result["elastic_tip_deflection_mm"], 18.115942028985508)
        longer = impact.cantilever(150, 450, 60, 6, 69e9)
        self.assertAlmostEqual(longer["elastic_tip_deflection_mm"] / result["elastic_tip_deflection_mm"], 3.375)

    def test_energy_is_not_peak_force(self):
        result = impact.collision(55, 2, 10)
        self.assertEqual(result["energy_j"], 110)
        self.assertEqual(result["average_force_n"], 11000)
        self.assertIsNone(result["peak_force_n"])
        self.assertFalse(result["qualified"])
        self.assertAlmostEqual(impact.collision(55, 0.5, 50)["average_force_n"], 137.5)

    def test_wall_force_pushes_front_down(self):
        result = impact.contact_work([0, -261, 170.3484861008832], [110, 330], [0, 150, 0])
        self.assertAlmostEqual(result["torque_x_nm"], 23.94772708486752)
        self.assertLess(result["work_per_stow_radian_j"], 0)
        self.assertFalse(result["assists_negative_fold_stow"])
        displaced = impact.folded_point(result["point_mm"], [110, 330], 0.001)
        self.assertLess(displaced[2], result["point_mm"][2])

    def test_jacobian_matches_finite_difference(self):
        point, pivot, force = [237, -261, 170.3484861008832], [110, 330], [70, 150, -35]
        epsilon = 1e-6
        for angle in (0, -0.1, -0.8, math.radians(-140)):
            result = impact.contact_work(point, pivot, force, angle)
            before = impact.folded_point(point, pivot, angle - epsilon)
            after = impact.folded_point(point, pivot, angle + epsilon)
            work = sum((upper - lower) / (2 * epsilon * 1000) * load
                       for upper, lower, load in zip(after, before, force))
            self.assertAlmostEqual(result["torque_x_nm"], work, places=6)

    def test_contact_direction_and_low_pivot_counterexample(self):
        self.assertTrue(impact.contact_work([0, -261, 170], [110, 40], [0, 150, 0])["assists_negative_fold_stow"])
        self.assertFalse(impact.contact_work([0, -140, 34], [110, 40], [0, 150, 0])["assists_negative_fold_stow"])
        self.assertTrue(impact.contact_work([0, -140, 34], [110, 330], [0, 0, 150])["assists_negative_fold_stow"])
        self.assertEqual(impact.contact_work([237, -261, 170], [110, 330], [-150, 0, 0])["torque_x_nm"], 0)

    def test_tetrahedral_integration_and_parallel_axis(self):
        definition = {
            "positions": [0, 0, 0, 10, 0, 0, 10, 20, 0, 0, 20, 0,
                          0, 0, 30, 10, 0, 30, 10, 20, 30, 0, 20, 30],
            "indices": [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
                        0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5,
                        2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7],
        }
        matrix = [[1, 0, 0, 100], [0, 1, 0, 90], [0, 0, 1, -15], [0, 0, 0, 1]]
        result = impact.mesh_volume_inertia(definition, matrix, [0, 0])
        self.assertAlmostEqual(result["volume_mm3"], 6000)
        expected = 6000 * (100 ** 2 + (20 ** 2 + 30 ** 2) / 12)
        self.assertAlmostEqual(result["volume_inertia_about_pivot_mm5"], expected)
        self.assertAlmostEqual(result["volume_inertia_about_pivot_mm5"] * 2700e-15, 0.000163755)

    def test_invalid_dimensions_rejected(self):
        for bad in (0, -1, math.nan, math.inf):
            with self.assertRaises(ValueError):
                impact.plate_comparison(100, bad, 69e9, 2700)
            with self.assertRaises(ValueError):
                impact.collision(55, 1, bad)


class SavedGeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = impact.build_report()

    def test_exact_net_area_and_inventory(self):
        geometry = self.report["geometry"]
        self.assertEqual(geometry["instances"], 279)
        self.assertAlmostEqual(geometry["front_roller_coverage_mm"], 393.7)
        self.assertAlmostEqual(geometry["total_net_plate_area_mm2"], 86489.68405382101)
        for row in geometry["plates"]:
            self.assertAlmostEqual(row["volume_mm3"], row["net_area_mm2"] * 6)
            self.assertLess(abs(row["triangle_volume_relative_error"]), 0.01)
            self.assertLess(abs(row["triangle_inertia_relative_error"]), 0.01)

    def test_mass_and_inertia_substitution_preserve_remainder(self):
        baseline = self.report["plate_candidates"][0]
        for candidate in self.report["plate_candidates"]:
            for index in range(2):
                self.assertAlmostEqual(baseline["assembly_mass_bounds_kg"][index] - baseline["mass_kg"],
                                       candidate["assembly_mass_bounds_kg"][index] - candidate["mass_kg"])
                self.assertAlmostEqual(baseline["assembly_inertia_bounds_kg_m2"][index] - baseline["four_plate_inertia_about_pivot_kg_m2"],
                                       candidate["assembly_inertia_bounds_kg_m2"][index] - candidate["four_plate_inertia_about_pivot_kg_m2"])
            self.assertAlmostEqual(candidate["mass_kg"] / baseline["mass_kg"],
                                   candidate["four_plate_inertia_about_pivot_kg_m2"] / baseline["four_plate_inertia_about_pivot_kg_m2"])
            self.assertFalse(candidate["qualified"])

    def test_all_deployed_frontal_witnesses_oppose_stow(self):
        frontal = [row for row in self.report["contact_cases"]
                   if row["force_n"] == [0, 150, 0] and row.get("fold_deg", 0) == 0]
        self.assertEqual(len(frontal), 6)
        for row in frontal:
            self.assertGreater(row["torque_x_nm"], 0)
            self.assertFalse(row["assists_negative_fold_stow"])

    def test_provisional_and_blocked_claims_are_preserved(self):
        self.assertFalse(self.report["physical_validation"])
        self.assertFalse(any(self.report["release_gates"].values()))
        self.assertFalse(self.report["source_lookup"]["first_party_numeric_datasheets_verified"])
        self.assertEqual(len(self.report["source_lookup"]["attempts"]), 4)
        self.assertFalse(self.report["policy"]["final_kinematics_selected"])
        self.assertEqual(self.report["network_calls_by_generator"], 0)
        self.assertFalse(self.report["cad_rebuild"])

    def test_left_right_contact_witnesses_are_outboard(self):
        for row in self.report["contact_cases"]:
            if "cheek" not in row["name"]:
                continue
            expected_x = 228 if row["name"].startswith("main") else 240
            self.assertAlmostEqual(abs(row["point_mm"][0]), expected_x)
            if row["name"].endswith("side_hit"):
                self.assertLess(row["point_mm"][0] * row["force_n"][0], 0)
                self.assertEqual(row["torque_x_nm"], 0)

    def test_reference_axis_ordering_not_motion_qualification(self):
        reference = self.report["source_reference_1690"]
        self.assertFalse(reference["motion_qualified"])
        if reference["status"] == "SOURCE_CACHE_UNAVAILABLE":
            self.skipTest("Optional private reference mesh cache not available")
        self.assertAlmostEqual(reference["front_pin_height_above_rear_mm"], 127.5352494166298)
        self.assertAlmostEqual(reference["illustrative_front_pin_wall_torque_x_nm_at_150n"], -19.13028741249447)
        self.assertLess(reference["d_front_height_d_positive_x_radian_mm"], 0)

    def test_inconsistent_exports_rejected(self):
        mesh = json.loads((impact.ROOT / "output/pickup-mesh.json").read_text())
        pickup = json.loads((impact.ROOT / "pickup-report.json").read_text())
        drive = json.loads((impact.ROOT / "drive-sizing.json").read_text())
        bad = copy.deepcopy(pickup)
        bad["units"] = "m"
        with self.assertRaises(ValueError):
            impact.snapshot_plates(mesh, bad, drive)
        bad = copy.deepcopy(pickup)
        bad["local_geometry"]["custom"][0]["volume_mm3"] *= 1.01
        with self.assertRaises(ValueError):
            impact.snapshot_plates(mesh, bad, drive)

    def test_generated_report_is_current(self):
        saved = json.loads((impact.ROOT / "impact-materials.json").read_text())
        self.assertTrue(saved == self.report, "Regenerate impact-materials.json from the current source exports")

    def test_policy_retains_blockers_and_test_safety(self):
        policy = (impact.ROOT / "IMPACT-MATERIALS.md").read_text()
        for required in ("PROVISIONAL DESIGN POLICY", "NOT COMPETITION READY",
                         "first-party numerical datasheet requirement remains unverified",
                         "No powered robot or automatic impact test", "human review",
                         "40 N aggregate", "150 N operating contact", "crazing", "overconstraint"):
            self.assertIn(required, policy)


if __name__ == "__main__":
    unittest.main()