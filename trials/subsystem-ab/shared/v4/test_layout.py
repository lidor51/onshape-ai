import unittest
import math
import hashlib
import json
from pathlib import Path

from layout import BUMPER_TOP, CONTROLS, ROLLER_RADIUS, layout_check, stations


class LayoutTests(unittest.TestCase):
    def test_driven_contact_regions_overlap(self):
        self.assertGreater(layout_check()["minimumDrivenOverlapMm"], 0)
        self.assertTrue(all(math.dist(first, second) >= 2 * ROLLER_RADIUS
                            for first, second in zip(stations(), stations()[1:])))

    def test_63_pose_outer_bounds(self):
        samples = layout_check()["samples"]
        self.assertEqual(len(samples), 63)
        self.assertTrue(all(sample["frontMm"] >= -457.2 for sample in samples))
        self.assertTrue(all(sample["topMm"] <= 1066.8 for sample in samples))

    def test_complete_front_bumper_not_removed(self):
        for longitudinal, height in stations():
            if -125 <= longitudinal <= 40:
                self.assertGreaterEqual(height - 35, BUMPER_TOP + 5)

    def test_frozen_widths_and_independent_receiver(self):
        self.assertEqual(CONTROLS["mouthWidth"]["default"], 500)
        self.assertEqual(CONTROLS["mouthWidth"]["max"], 520)
        self.assertNotEqual(CONTROLS["receiverHeight"]["min"], CONTROLS["receiverHeight"]["max"])


class RepairEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parent
        cls.probe = json.loads((cls.root / "mechanical-probe.json").read_text())

    def test_probe_matches_current_geometry_sources(self):
        for name in ["build.py", "layout.py", "probe.py"]:
            self.assertEqual(self.probe["sourceHashes"][name], hashlib.sha256((self.root / name).read_bytes()).hexdigest(), name)

    def test_original_mount_hub_trunnion_clashes_closed(self):
        self.assertEqual(self.probe["mountHubTrunnionStatus"], "PASS")
        self.assertEqual(len(self.probe["samples"]), 4)

    def test_actual_deployment_gear_mesh_four_phases(self):
        self.assertEqual(self.probe["gearMeshStatus"], "PASS")
        self.assertTrue(all(sample["intersectionMm3"] <= 0.05 for sample in self.probe["gearMesh"]))

    def test_inlet_has_both_compliant_contacts_without_rigid_core_penetration(self):
        samples = self.probe["inletSamples"]
        self.assertEqual(len(samples), 13)
        for sample in samples:
            self.assertLessEqual(sample["requiredFloatMm"], CONTROLS["topFloat"]["max"])
            self.assertLessEqual(sample["lowerRubberGapMm"], 0.001)
            self.assertLessEqual(sample["upperRubberGapMm"], 0.001)
            self.assertLessEqual(max(sample["rigidCoreIntersectionMm3"].values()), 0.01)

    def test_nominal_upper_guide_seams_have_no_contact_gap(self):
        for sample in self.probe["contactGaps"]:
            if sample["topFloatMm"] == 0:
                self.assertLessEqual(sample["gapMm"], 0.001)

    def test_unresolved_original_motor_presentation_remains_fail_closed(self):
        self.assertEqual(self.probe["status"], "FAIL")
        self.assertTrue(any(entry["pair"] == ["deploy_motor_0", "deploy_motor_pinion_0"]
                            for sample in self.probe["samples"] for entry in sample["unexpected"]))

    def test_full_sweep_timeout_is_durably_not_a_pass(self):
        result = json.loads((self.root / "validate.exit.json").read_text())
        validation = json.loads((self.root / "validation.json").read_text())
        self.assertTrue(result["timedOut"])
        self.assertEqual(result["exitCode"], 124)
        self.assertLess(sum(len(variant["samples"]) for variant in validation["variants"].values()), 126)
        self.assertNotEqual(validation["status"], "PASS")


if __name__ == "__main__":
    unittest.main()