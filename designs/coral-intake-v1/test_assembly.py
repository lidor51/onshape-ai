from copy import deepcopy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from assemble import build_assembly, custom_solid_checks, focused_checks, inventory, source_checks, file_hashes, HISTORICAL_FILES, SOURCE_FILES, verify_assembly, write_checks
from geometry import parameters
from model import posed, rotation_about


class AssemblyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.settings = parameters()
        cls.original = deepcopy(cls.settings)
        cls.historical = file_hashes(HISTORICAL_FILES)
        cls.package = build_assembly(cls.settings)

    def test_01_build_contract(self):
        self.assertEqual(self.settings, self.original)
        self.assertEqual(self.package.settings["pickup"]["stow_angle"], -123)
        count = inventory(self.package)
        self.assertEqual(count["instances"], count["unique_ids"])
        self.assertEqual(self.package.assembly_checkpoint["net_helper_instances"], 187)
        self.assertEqual(file_hashes(HISTORICAL_FILES), self.historical)
        print("ACTUAL INVENTORY", {key: count[key] for key in ("instances", "active_definitions", "active_custom_definitions", "custom_instances", "all_custom_definitions")}, flush=True)

    def test_02_custom_solids(self):
        result = custom_solid_checks(self.package)
        self.assertTrue(result["pass"], [row for row in result["definitions"] if not row["valid_closed_positive"] or not row["flat_single_solid"]])

    def test_03_sources(self):
        self.assertTrue(source_checks(self.package)["pass"])

    def test_04_focused_repairs_and_meshes(self):
        result = focused_checks(self.package)
        print("FOCUSED RESULTS", result, flush=True)
        self.assertTrue(result["five_static_gear_pairs_pass"])
        for row in result["known_pairs"]:
            self.assertTrue(row["pass"], row)

    def test_05_rejected_sweep_is_explicit(self):
        repair = next(row for row in self.package.assembly_checkpoint["repairs"] if "swept" in row["repair"])
        if not repair["accepted"]:
            self.assertTrue(repair["lost_3mm_bolt_lands"] or repair["candidate_solids"] != 1)
            self.assertIn("REJECTED", repair["status"])

    def test_06_fold_input_motion(self):
        pinion = next(instance for instance in self.package.instances if instance["id"] == "fold_drive_12T")
        self.assertEqual(pinion["motion"], "fold_input")
        self.assertEqual(pinion["input_ratio"], -5)
        deployed, folded = posed(self.package, pinion), posed(self.package, pinion, -20)
        self.assertAlmostEqual(deployed.Volume(), folded.Volume(), places=4)
        self.assertAlmostEqual(deployed.Center().x, folded.Center().x, places=5)
        expected = deployed.moved(rotation_about((0, *pinion["input_center_yz"]), 100))
        self.assertLess((expected.Vertices()[0].Center() - folded.Vertices()[0].Center()).Length, 1e-6)
        self.assertFalse(self.package.assembly_checkpoint["fold_input"]["fused_vendor_rotor_motion_verified"])

    def test_07_source_and_repair_contract(self):
        self.assertEqual(file_hashes(SOURCE_FILES), self.package.assembly_checkpoint["source_hashes"])
        repairs = self.package.assembly_checkpoint["repairs"]
        self.assertTrue(all(row["minimum_existing_bolt_ligament_mm"] >= 3 for row in repairs if "minimum_existing_bolt_ligament_mm" in row))
        self.assertEqual(len(self.package.instances), len(self.package._assembly_baseline.instances))
        self.assertEqual({instance["id"] for instance in self.package.instances}, {instance["id"] for instance in self.package._assembly_baseline.instances})
        self.assertEqual({instance["id"]: instance["definition"] for instance in self.package.instances if instance["role"] == "motor"},
                         {instance["id"]: instance["definition"] for instance in self.package._assembly_baseline.instances if instance["role"] == "motor"})


if __name__ == "__main__":
    checkpoint = "--checkpoint" in sys.argv
    if checkpoint:
        sys.argv.remove("--checkpoint")
    result = unittest.main(verbosity=2, exit=False).result
    if checkpoint and result.wasSuccessful():
        report = verify_assembly(AssemblyTests.package)
        report["software_tests"] = {"run": result.testsRun, "passed": result.testsRun, "failures": 0, "errors": 0}
        write_checks(report)
        print("CHECKPOINT GATES", report["gates"], flush=True)
        sys.exit(0 if report["pass"] else 1)
    sys.exit(0 if result.wasSuccessful() else 1)