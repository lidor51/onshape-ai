import importlib.util
import json
import math
from pathlib import Path
import sys
import unittest


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("starting_frame", ROOT / "starting_frame.py")
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class StartingFrameTests(unittest.TestCase):
    def test_bumper_face_is_not_frame(self):
        self.assertTrue(audit.classify("motor", [-30, -80, 20, 30, 20, 70])["outsideFrame"])

    def test_rail_exception_does_not_waive_containment(self):
        self.assertTrue(audit.classify("assumed_chassis_side_rail_1", [325, 25, 25, 350, 735, 65])["reserveMet"])
        self.assertTrue(audit.classify("assumed_chassis_side_rail_1", [325, 25, 25, 351, 735, 65])["outsideFrame"])
        self.assertFalse(audit.classify("frame_root_1_0_screw", [330, 60, 40, 350, 80, 50])["reserveMet"])

    def test_reference_exclusion_is_explicit(self):
        bounds = [-350, -85, 45, 350, 0, 165]
        self.assertFalse(audit.classify("bumper", bounds, True)["outsideFrame"])
        self.assertTrue(audit.classify("drive", bounds)["outsideFrame"])

    def test_exact_bounds_after_rotation(self):
        import cadquery as cq
        shape = cq.Workplane("XY").box(20, 10, 6).val().rotate((0, 0, 0), (0, 0, 1), 30).translate((5, 8, 11))
        bounds = audit.exact_bounds(shape)
        self.assertAlmostEqual(bounds[3], 5 + 10 * math.cos(math.pi / 6) + 5 * math.sin(math.pi / 6), places=5)
        self.assertAlmostEqual(bounds[2], 8, places=5)

    def test_full_spin_encloses_unsampled_corner(self):
        import cadquery as cq
        shape = cq.Workplane("XY").box(20, 10, 6).val()
        radial = audit.radial_enclosure(shape)
        self.assertGreaterEqual(radial["radiusUpperMm"], math.hypot(10, 5))
        self.assertLessEqual(radial["radiusLowerMm"], math.hypot(10, 5))
        matrix = [[0, 0, 1, 10], [1, 0, 0, 20], [0, 1, 0, 30], [0, 0, 0, 1]]
        bounds = audit.cylinder_bounds(radial, matrix)
        self.assertAlmostEqual(bounds[0], 7, places=5)
        self.assertGreaterEqual(bounds[4], 20 + math.hypot(10, 5))

    def test_rear_move_cannot_hide_powered_gap(self):
        rows = {"middle": [-177.630272, 321], "rear": [-25, 348]}
        screen = audit.rear_move_screen(rows, 75)
        self.assertTrue(screen["rearOnlyMoveRejected"])
        self.assertGreater(screen["minimumPoweredContactGapMm"], 10)

    def test_oriented_cache_is_not_transformed_local_box(self):
        import cadquery as cq
        class Module:
            @staticmethod
            def matrix(pose):
                transform = pose.wrapped.Transformation()
                return [[transform.Value(row + 1, column + 1) for column in range(4)] for row in range(3)] + [[0, 0, 0, 1]]
        class Assembly:
            pickup_module = Module()
            definitions = {"ball": {"shape": cq.Workplane("XY").sphere(10).val()}}

            @staticmethod
            def pose(part, angle, floating):
                return cq.Location(cq.Vector(1, 2, 3), cq.Vector(1, 0, 0), angle)
        assembly = Assembly()
        assembly.cq = cq
        cache = audit.BoundsCache(assembly)
        bounds, matrix = cache.placed({"definition": "ball"}, 45, 0)
        self.assertAlmostEqual(bounds[4], 12, places=5)
        self.assertAlmostEqual(bounds[5], 13, places=5)


class ArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads((audit.OUTPUT / "audit.json").read_text(encoding="utf8"))
        cls.manifest = json.loads((audit.OUTPUT / "manifest.json").read_text(encoding="utf8"))
        cls.mesh = json.loads((audit.OUTPUT / "coaxial-mesh.json").read_text(encoding="utf8"))

    def test_all_powered_hardware_present(self):
        self.assertEqual(self.report["counts"]["instances"], 849)
        self.assertEqual(self.report["counts"]["physical"], 846)
        self.assertEqual(self.report["counts"]["motors"], 4)
        self.assertEqual(self.report["counts"]["belts"], 8)
        self.assertEqual(self.report["counts"]["chains"], 2)
        self.assertEqual(len(self.mesh["instances"]), 849)
        self.assertEqual({part["id"] for part in self.mesh["instances"]}, {part["id"] for part in self.manifest["instances"]})

    def test_only_declared_references_excluded(self):
        excluded = {part["id"] for part in self.mesh["instances"] if part["reference_only"]}
        self.assertEqual(excluded, {"assumed_bumper", "assumed_frame_front", "assumed_frame_rear"})
        self.assertTrue(all(not part["reference_only"] for part in self.mesh["instances"] if part["role"] in {"motor", "belt", "chain"}))
        for part in self.mesh["instances"]:
            if part["id"] in audit.RAILS:
                self.assertFalse(part["reference_only"])
                self.assertEqual(part["starting_frame"]["requiredReserveMm"], 0)

    def test_failure_is_not_waived(self):
        self.assertEqual(self.report["status"], "FAIL_OUTSIDE_FRAME")
        self.assertGreater(len(self.report["fixedProtrusionsAtEveryFoldAngle"]), 0)
        self.assertEqual(self.report["allowableStowRange"]["intervalsDeg"], [])
        self.assertTrue(self.report["rearOnlyRouteScreen"]["rearOnlyMoveRejected"])
        self.assertFalse(self.report["candidateGeometryChanged"])
        self.assertFalse(self.report["startingConfigurationCertified"])
        self.assertFalse(self.report["releaseReady"])
        self.assertFalse(self.report["globalTaskComplete"])
        self.assertEqual(self.report["hardStop"], "MISSING")
        self.assertEqual(self.report["stowHolding"], "MISSING")
        self.assertEqual(self.report["collisionStatus"], "NOT_TESTED_NO_PASS_CLAIM")

    def test_full_spin_covers_every_powered_contact(self):
        for part in self.report["poses"][0]["parts"]:
            if part["role"] in {"outer_elastomer", "compliant_contact", "gear", "pulley", "sprocket", "motor"}:
                self.assertIn("spin", part, part["id"])
                self.assertGreaterEqual(part["spin"]["radiusUpperMm"], part["spin"]["radiusLowerMm"])

    def test_mesh_vertices_and_exact_gate_agree(self):
        comparison = json.loads((audit.OUTPUT / "mesh-brep-comparison.json").read_text(encoding="utf8"))
        self.assertEqual(len(comparison["parts"]), 849)
        self.assertTrue(comparison["allVerticesEnclosedByBrepBounds"])
        records = {part["id"]: part for part in self.report["poses"][0]["parts"]}
        for part in self.mesh["instances"]:
            self.assertEqual(part["starting_frame"]["outsideFrame"], records[part["id"]]["outsideFrame"])
            self.assertEqual(part["starting_frame"]["boundsMm"], records[part["id"]]["boundsMm"])

    def test_true_motion_without_display_offsets(self):
        import numpy as np
        motion = self.mesh["motion"]
        def rotation(center, degrees):
            cosine, sine = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
            matrix = np.asarray([[1, 0, 0, 0], [0, cosine, -sine, 0], [0, sine, cosine, 0], [0, 0, 0, 1]], dtype=float)
            matrix[:3, 3] = np.asarray(center) - matrix[:3, :3] @ center
            return matrix
        fold = rotation(motion["pivot"], motion["stow_deg"])
        for part in self.mesh["instances"]:
            original = np.asarray(part["matrix"])
            expected = fold @ original if part["motion"] in {"fold", "float"} else original
            self.assertTrue(np.allclose(expected, part["stow_matrix"], atol=1e-8, rtol=0), part["id"])

    def test_frozen_sources_and_four_expected_taps(self):
        self.assertTrue(self.report["auditIntegrityPass"])
        self.assertEqual(self.report["sourceFreeze"]["frozenV1Count"], 305)
        self.assertEqual(self.report["sourceFreeze"]["changed"], [])
        self.assertEqual(self.report["sourceFreeze"]["frozenV1Changes"], [])
        self.assertEqual(len(self.report["verifiedExpectedThreadContacts"]), 4)
        for name, expected in self.report["sourceHashes"].items():
            self.assertEqual(audit.digest(ROOT / name), expected, name)

    def test_exported_step_hashes_and_custom_roundtrips(self):
        for entry in self.manifest["assembly_files"]:
            path = audit.OUTPUT / entry["path"]
            self.assertGreater(path.stat().st_size, 1000)
            self.assertEqual(audit.digest(path), entry["sha256"])
        checks = json.loads((audit.OUTPUT / "export-checks.json").read_text(encoding="utf8"))
        self.assertTrue(checks["all_custom_roundtrips_pass"])
        self.assertEqual(checks["invalid_definitions"], [])
        self.assertFalse(checks["manufacturing_release"])


if __name__ == "__main__":
    unittest.main()