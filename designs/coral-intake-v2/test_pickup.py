import json
import math
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pickup


class StructureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = pickup.build_structure()

    def test_full_coral_old_brace_regression_and_new_clearance(self):
        result = pickup.brace_check(self.model)
        self.assertEqual(result["status"], "PASS", result)
        self.assertGreater(result["old_tube_collision_mm3"], 8000)
        self.assertGreater(result["minimum_certified_structure_gap_mm"], 0)

    def test_exact_roller_centers(self):
        rows = pickup.centers(self.model.config)
        self.assertAlmostEqual(math.dist(rows["front"], rows["middle"]), 155)
        self.assertAlmostEqual(math.dist(rows["rear"], rows["middle"]), 130)

    def test_finite_cylinder_support_encloses_full_annular_coral(self):
        for yaw in (0, 30, 60, 90):
            direction = (math.sin(math.radians(yaw)), math.cos(math.radians(yaw)), 0)
            analytic = pickup.finite_cylinder_bounds((-60, -365, 57.15), direction, 57.15, 301.625)
            actual = pickup.bounds(pickup.coral((-60, -365, 57.15), yaw))
            for index in range(3):
                self.assertLessEqual(analytic[index], actual[index] + 1e-5)
                self.assertGreaterEqual(analytic[index + 3], actual[index + 3] - 1e-5)

    def test_custom_closed_positive(self):
        for definition in self.model.definitions.values():
            shape = definition["shape"]
            self.assertTrue(shape.isValid())
            self.assertEqual(len(shape.Solids()), 1)
            self.assertTrue(all(shell.wrapped.Closed() for shell in shape.Shells()))
            self.assertGreater(shape.Volume(), 0)


class CatalogGeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = pickup.build_structure()
        pickup.define_hardware(cls.model)
        pickup.retain_bearings(cls.model)
        pickup.float_stops(cls.model)

    def test_catalog_and_parametric_centers(self):
        config = self.model.config
        rows = pickup.centers(config)
        self.assertAlmostEqual(rows["front"][1], 262 - math.sqrt(155 ** 2 - 125 ** 2))
        previous = pickup.centers(config | {"front_distance": 160})
        self.assertEqual(rows["rear"], previous["rear"])
        self.assertAlmostEqual(rows["front"][1] - previous["front"][1], math.sqrt(160 ** 2 - 125 ** 2) - math.sqrt(155 ** 2 - 125 ** 2))
        belts = pickup.candidate_belts(config)
        self.assertEqual([entry["candidate_sku"] for entry in belts], ["WCP-0621", "WCP-0619"])
        self.assertEqual([entry["candidate_length_mm"] for entry in belts], [400, 350])
        self.assertEqual([entry["catalog_center_distance_mm"] for entry in belts], [155, 130])
        self.assertLess(belts[1]["axial_envelope_mm"][1], belts[0]["axial_envelope_mm"][0])
        for entry in belts:
            self.assertTrue(entry["catalog_length_matches_geometry"])
            self.assertEqual(entry["pulley_candidate_sku"], "WCP-0563")
            self.assertEqual(entry["catalog_seen"], "2026-09-18")
            self.assertFalse(entry["authentic_pulley_cad"])
            self.assertFalse(entry["torque_qualified"])
        changed = pickup.candidate_belts(config | {"front_distance": 156})
        self.assertAlmostEqual(changed[0]["equal_pulley_pitch_length_mm"], 402)
        self.assertFalse(changed[0]["catalog_length_matches_geometry"])

    def test_front_arm_fits_at_both_float_samples(self):
        overlaps = []
        for floating in (0, -8):
            for side in (-1, 1):
                plate = next(entry for entry in self.model.instances if entry["id"] == "floating_cheek_" + str(side))
                for row in ("front", "middle"):
                    bearing = next(entry for entry in self.model.instances if entry["id"] == "bearing_arm_" + row + "_" + str(side))
                    overlap = self.model.posed(plate, 0, floating).intersect(self.model.posed(bearing, 0, floating)).Volume()
                    overlaps.append(overlap)
                    self.assertLess(overlap, 1e-5, (floating, bearing["id"], overlap))
        print(json.dumps({"focused_front_arm_fit_overlaps_mm3": overlaps}), flush=True)

    def test_source_phase_floor_contact_is_measured_not_assumed(self):
        model = pickup.Pickup(pickup.settings())
        source, binding = pickup.vendor("intake_star")
        model.define("source_elastomer", source.Solids()[2], "authentic_vendor")
        model.add("star_front_5_body_2", "source_elastomer", pickup.location((0, *pickup.centers(model.config)["front"])), "float", "outer_elastomer")
        result = pickup.contact_witness(model)
        self.assertTrue(result["samples"])
        positive = any(sample["overlap_mm3"] > 1e-4 for sample in result["samples"])
        self.assertEqual(result["status"], "CONTACT_WITNESS" if positive else "NO_WITNESS")
        if not positive:
            self.assertEqual([sample["center_y_mm"] for sample in result["samples"]], list(range(-335, -289, 5)))
        self.assertTrue(all(math.isfinite(sample["overlap_mm3"]) for sample in result["samples"]))
        print(json.dumps({"focused_contact": result, "front_center_yz": pickup.centers(model.config)["front"]}), flush=True)


class ReferenceVerifierTests(unittest.TestCase):
    def test_frozen_nominal_hardware_matches_manifest_and_is_cached(self):
        shape = pickup.reference_shape("hardware_10-32_UNFx9.525")
        self.assertTrue(shape.isValid())
        self.assertEqual(len(shape.Solids()), 2)
        self.assertAlmostEqual(shape.Volume(), 481.8872061017094)
        self.assertIs(shape, pickup.reference_shape("hardware_10-32_UNFx9.525"))

    def test_cache_key_keeps_float_motion_and_shares_identical_rigid_poses(self):
        from verify_reference import pair_key
        model = pickup.build_structure()
        reference = {"id": "box", "geometry": "box", "bounds_mm": [0, 0, 0, 1, 1, 1]}
        rigid = next(entry for entry in model.instances if entry["id"] == "main_cheek_-1")
        arm = next(entry for entry in model.instances if entry["id"] == "floating_cheek_-1")
        self.assertEqual(pair_key(model, rigid, reference, -20, 0), pair_key(model, rigid, reference, -20, -8))
        self.assertNotEqual(pair_key(model, arm, reference, -20, 0), pair_key(model, arm, reference, -20, -8))
        self.assertNotEqual(pair_key(model, rigid, reference, 0, 0), pair_key(model, rigid, reference, -20, 0))

    def test_exact_collision_clearance_envelope_and_budget_remain_distinct(self):
        from verify_reference import ReferenceResolver
        model = pickup.Pickup(pickup.settings())
        model.define("test_cube", pickup.box((2, 2, 2)))
        model.add("pivot_test", "test_cube", motion="fixed")
        references = [{"id": "hit", "geometry": "box", "bounds_mm": [0, 0, 0, 2, 2, 2]},
                      {"id": "clear", "geometry": "box", "bounds_mm": [4, 0, 0, 5, 2, 2]},
                      {"id": "bracket", "geometry": "envelope_only", "bounds_mm": [-2, -2, -2, 2, 2, 2]}]
        base = {"part": "pivot_test", "fold_deg": 0, "float_deg": 0, "intended_attachment": True}
        with patch.object(pickup, "reference_data", return_value=({}, references)):
            resolver = ReferenceResolver(model)
            hit = resolver.check(base | {"reference": "hit"})
            self.assertEqual(hit["status"], "FAIL_EXACT_COLLISION")
            self.assertAlmostEqual(hit["exact_overlap_mm3"], 1)
            self.assertEqual(resolver.check(base | {"reference": "clear"})["status"], "EXACT_CLEAR_AT_SAMPLE")
            self.assertEqual(resolver.check(base | {"reference": "bracket"})["status"], "UNCERTAIN_ENVELOPE_ONLY")
            self.assertTrue(resolver.check(base | {"reference": "hit", "float_deg": -8})["reused_identical_shape_and_matrix"])
            self.assertEqual(resolver.exact_checks, 3)
            self.assertEqual(ReferenceResolver(model, max_exact_checks=0).check(base | {"reference": "hit"})["status"], "UNCERTAIN_BUDGET")
            with self.assertRaises(ValueError):
                ReferenceResolver(model, max_exact_checks=201)


class PickupTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = pickup.build()

    def test_closed_custom_solids_and_actual_bearing_fits(self):
        result = pickup.local_checks(self.model)
        self.assertEqual(result["status"], "PASS", result)
        self.assertEqual(len(result["bearing_fits"]), 12)

    def test_machine_counts_unchanged_by_catalog_update(self):
        result = pickup.inventory(self.model)
        self.assertEqual(result["instances"], 279)
        self.assertEqual(result["custom_definitions"], 17)
        self.assertEqual(result["unique_machined_definitions"], 8)
        self.assertEqual(result["definitions"], 29)

    def test_all_source_star_bodies_and_real_widths(self):
        for row, count in self.model.config["star_counts"].items():
            for body in range(3):
                stars = [entry for entry in self.model.instances if entry["id"].startswith("star_" + row + "_") and entry["definition"] == "am5123_body_" + str(body)]
                self.assertEqual(len(stars), count)
            hubs = [entry for entry in self.model.instances if entry["id"].startswith("star_" + row + "_") and entry["definition"] == "am5123_body_0"]
            span = max(pickup.bounds(self.model.posed(entry))[3] for entry in hubs) - min(pickup.bounds(self.model.posed(entry))[0] for entry in hubs)
            self.assertAlmostEqual(span, (count - 1) * 38.1 + 12.7)

    def test_coaxial_bearing_bores_follow_shafts_not_floating_cheeks(self):
        for side in (-1, 1):
            bearing = next(entry for entry in self.model.instances if entry["id"] == "bearing_arm_middle_" + str(side))
            self.assertEqual(pickup.matrix(pickup.instance_pose(self.model, bearing, -20, 0)), pickup.matrix(pickup.instance_pose(self.model, bearing, -20, -8)))
            pivot_bearing = next(entry for entry in self.model.instances if entry["id"] == "bearing_pivot_" + str(side))
            self.assertEqual(pickup.matrix(pickup.instance_pose(self.model, pivot_bearing, 0, 0)), pickup.matrix(pickup.instance_pose(self.model, pivot_bearing, -140, -8)))

    def test_parameter_changes_geometry_not_vendor_solids(self):
        config = pickup.settings()
        config["cheek_x"] += 5
        changed = pickup.build_structure(config)
        original = pickup.build_structure()
        self.assertAlmostEqual(pickup.bounds(changed.definitions["crossmember"]["shape"])[5] - pickup.bounds(original.definitions["crossmember"]["shape"])[5], 5)
        source, binding = pickup.vendor("intake_star")
        self.assertEqual(pickup.sha256(pickup.REPO / binding["pathrepoRelative"]), binding["sha256"])
        self.assertEqual(len(source.Solids()), 3)


class GeneratedArtifactTests(unittest.TestCase):
    def test_archived_baseline_and_exhaustive_reference_ledger(self):
        report_path = pickup.ROOT / "pickup-report.json"
        if not report_path.exists():
            self.skipTest("Run pickup.py --build --verify-reference first")
        report = json.loads(report_path.read_text(encoding="utf8"))
        snapshot = report.get("previous_generated_baseline")
        self.assertIsNotNone(snapshot, "The old v2 baseline must be preserved before rebuilding")
        receipt_path = pickup.ROOT / snapshot["receipt"]
        self.assertEqual(pickup.sha256(receipt_path), snapshot["sha256"])
        receipt = json.loads(receipt_path.read_text(encoding="utf8"))
        for relative, digest in receipt["files"].items():
            self.assertEqual(pickup.sha256(receipt_path.parent / relative), digest, relative)
        resolution = json.loads((pickup.OUTPUT / "final-reference-resolution.json").read_text(encoding="utf8"))
        self.assertEqual(resolution["bindings"]["pickup_report_sha256"], pickup.sha256(report_path))
        self.assertEqual(resolution["bindings"]["assembly_sha256"], pickup.sha256(pickup.OUTPUT / "assembly.step"))
        self.assertEqual(resolution["bindings"]["pickup_source_sha256"], pickup.sha256(pickup.ROOT / "pickup.py"))
        self.assertEqual(resolution["bindings"]["verifier_source_sha256"], pickup.sha256(pickup.ROOT / "verify_reference.py"))
        self.assertEqual(resolution["v1_frozen"], {"file_count": 305, "unchanged": True})
        self.assertLessEqual(resolution["summary"]["exact_operations"], 200)
        self.assertEqual(len(resolution["candidates"]), len(report["poses"]["overlapping_pairs"]))
        for candidate in resolution["candidates"]:
            if candidate["reference"].startswith("pivot_bracket"):
                self.assertEqual(candidate["status"], "UNCERTAIN_ENVELOPE_ONLY")
                self.assertFalse(candidate["intended_attachment_is_collision_waiver"])
            else:
                self.assertIn(candidate["status"], ("FAIL_EXACT_COLLISION", "EXACT_CLEAR_AT_SAMPLE"))

    def test_generated_report_is_bound_to_existing_outputs_and_v1(self):
        report_path = pickup.ROOT / "pickup-report.json"
        if not report_path.exists():
            self.skipTest("Run pickup.py --build to generate the artifact checks")
        report = json.loads(report_path.read_text(encoding="utf8"))
        frozen = json.loads((pickup.OUTPUT / "frozen-v1.json").read_text(encoding="utf8"))
        self.assertEqual(frozen, pickup.frozen_hashes())
        self.assertTrue(report["v1_frozen"]["unchanged"])
        self.assertEqual(pickup.sha256(pickup.OUTPUT / "assembly.step"), report["exports"]["assembly_sha256"])
        self.assertLessEqual(report["poses"]["exact_tests"], 20)
        self.assertFalse(report["cad_ready"])
        self.assertEqual(report["status"] == "PASS_LOCAL_STRUCTURE_ONLY", all(report["acceptance_gates"].values()))
        mesh = json.loads((pickup.OUTPUT / "pickup-mesh.json").read_text(encoding="utf8"))
        self.assertEqual(len(mesh["instances"]), report["inventory"]["instances"])
        self.assertFalse(any("x44" in entry["definition"].lower() or entry["category"].startswith("reference") for entry in mesh["instances"]))
        for entry in mesh["definitions"].values():
            self.assertEqual(len(entry["positions"]) % 3, 0)
            self.assertEqual(len(entry["indices"]) % 3, 0)
            self.assertTrue(all(0 <= index < len(entry["positions"]) / 3 for index in entry["indices"]))
            self.assertTrue(all(math.isfinite(value) for value in entry["positions"]))
            if "step" in entry:
                self.assertEqual(pickup.sha256(pickup.OUTPUT / entry["step"]), entry["step_sha256"])
        for sample in report["poses"]["overlapping_pairs"]:
            if "exact_overlap_mm3" not in sample:
                self.assertTrue(sample["status"].startswith("UNCERTAIN"))


def acceptance():
    report = json.loads((pickup.ROOT / "pickup-report.json").read_text(encoding="utf8"))
    failures = [name for name, passed in report["acceptance_gates"].items() if not passed]
    print(json.dumps({"status": "FAIL" if failures else "PASS_LOCAL_STRUCTURE_ONLY", "failed_gates": failures,
                      "completion_boundary": report["completion_boundary"]}), flush=True)
    return 1 if failures else 0


if __name__ == "__main__":
    if sys.argv[1:] == ["--acceptance"]:
        raise SystemExit(acceptance())
    unittest.main()