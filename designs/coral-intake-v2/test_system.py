import importlib.util
import math
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("coral_v2_system", ROOT / "system.py")
system = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(system)


class KinematicsTests(unittest.TestCase):
    def test_translation_and_link_closure(self):
        self.assertEqual(system.translation(0), (0, 0))
        for angle in range(79):
            delta = system.translation(angle)
            for ground, front in zip(system.GROUND, system.FRONT):
                translated = [front[index] + delta[index] for index in range(2)]
                self.assertAlmostEqual(math.dist(ground, translated), math.hypot(500, 10), places=9)

    def test_positive_wall_work_and_derivative(self):
        for angle in range(79):
            analytic = system.jacobian(angle)
            self.assertGreater(analytic[0], 0)
            self.assertGreater(analytic[1], 0)
            before = system.translation(angle - 0.0001)
            after = system.translation(angle + 0.0001)
            for axis in range(2):
                numeric = (after[axis] - before[axis]) / math.radians(0.0002)
                self.assertAlmostEqual(numeric, analytic[axis], places=6)

    def test_bumper_screen_is_not_assembly_approval(self):
        screen = system.trajectory_screen()
        self.assertGreaterEqual(screen["bumper_gap_lower_bound_mm"], 3)
        self.assertTrue(screen["positive_wall_work"])
        self.assertFalse(screen["full_physical_gate"])


class GuardTests(unittest.TestCase):
    def test_real_material_surrounds_both_mount_holes(self):
        module = system.load_module("guard_test_pickup", ROOT / "pickup.py")
        shape = system.contact_guard_shape(module)
        self.assertTrue(shape.isValid())
        self.assertEqual(len(shape.Solids()), 1)
        for front in system.FRONT:
            center = (front[0], front[1] + 30, 0)
            annulus = module.cylinder(8, 6.35, center).cut(module.cylinder(2.75, 8, center))
            self.assertAlmostEqual(shape.intersect(annulus).Volume(), annulus.Volume(), places=5)
            bore = module.cylinder(2.7, 6.35, center)
            self.assertLess(abs(shape.intersect(bore).Volume()), 1e-6)

    def test_exact_overlap_witness_and_call_budget(self):
        from types import SimpleNamespace
        module = system.load_module("witness_test_pickup", ROOT / "pickup.py")
        context = SimpleNamespace(pickup_module=module)
        first = module.box((10, 10, 10))
        witness, calls = system.overlap_witness(context, first, module.box((10, 10, 10), (5, 0, 0)), 10)
        self.assertIsNotNone(witness)
        self.assertLessEqual(calls, 10)
        witness, calls = system.overlap_witness(context, first, module.box((10, 10, 10), (20, 0, 0)), 10)
        self.assertIsNone(witness)
        self.assertEqual(calls, 0)


class AssemblyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.before = system.protected_hashes()
        cls.assembly = system.build()

    def test_original_pickup_and_retained_drives_present(self):
        assembly = self.assembly
        identifiers = {instance["id"] for instance in assembly.instances}
        self.assertTrue(set(assembly.pickup_ids).issubset(identifiers))
        self.assertTrue(set(assembly.retained_ids).issubset(identifiers))
        self.assertEqual(sum(instance["role"] == "motor" for instance in assembly.instances), 4)
        self.assertEqual(sum(instance["role"] == "gear" for instance in assembly.instances), 8)
        self.assertIn("v1_detachable_tray", identifiers)
        self.assertEqual(len(assembly.capture_stacks), 6)
        self.assertFalse(any("frame_cheek" in name or "fold_drive" in name for name in identifiers))

    def test_real_solids_and_protected_sources(self):
        for name, definition in self.assembly.definitions.items():
            self.assertGreater(len(definition["shape"].Solids()), 0, name)
            self.assertGreater(definition["shape"].Volume(), 0, name)
        self.assertEqual(self.before, system.protected_hashes())

    def test_pickup_fixed_stubs_travel_with_translation(self):
        assembly = self.assembly
        stub = next(instance for instance in assembly.instances if instance["id"] == "v2_pivot_stub_1")
        original = assembly.pickup_module.matrix(stub["pose"])
        translated = assembly.pickup_module.matrix(assembly.pose(stub, 78))
        delta = system.translation(78)
        self.assertAlmostEqual(translated[1][3] - original[1][3], delta[0])
        self.assertAlmostEqual(translated[2][3] - original[2][3], delta[1])

    def test_links_materials_and_no_lower_cross_shaft(self):
        assembly = self.assembly
        links = [instance for instance in assembly.instances if instance["role"] == "link"]
        self.assertEqual(len(links), 4)
        for link in links:
            self.assertEqual(abs(link["center"][0]), 292)
            self.assertEqual(link["motion"], "link")
        self.assertEqual(assembly.definitions["PC_leading_guard"]["thickness_mm"], 6.35)
        self.assertEqual(assembly.definitions["PC_leading_guard"]["material"], "polycarbonate")
        self.assertEqual(len(assembly.fastener_replacements), 8)
        for instance in assembly.instances:
            if instance["id"].startswith("front_stub_") and instance["role"] == "hard_shaft":
                extent = assembly.pickup_module.bounds(assembly.shape(instance))
                self.assertLess(extent[3] - extent[0], 31)

    def test_zero_budget_lists_uncertified_pairs_without_waivers(self):
        report = system.collision_check(self.assembly, max_exact=0, seconds=10)
        self.assertEqual(report["exact_kernel_calls"], 0)
        self.assertGreater(report["uncertified_pair_count"], 0)
        self.assertEqual(report["adjacency_exclusions"], [])
        self.assertFalse(report["full_physical_gate"])
        self.assertGreater(report["candidates_by_priority"].get("0", 0), 0)

    def test_pickup_geometry_reuse_and_opaque_actual_parts(self):
        assembly = self.assembly
        replacements = {row["id"] for row in assembly.fastener_replacements}
        for instance in assembly.instances:
            definition = assembly.definitions[instance["definition"]]
            if not system.is_reference(assembly, instance):
                self.assertEqual(system.appearance(definition, instance["role"])[3], 1)
            if instance["id"] in assembly.pickup_ids and instance["id"] not in replacements:
                original = next(row for row in assembly.pickup.instances if row["id"] == instance["original_id"])
                self.assertIs(definition["shape"], assembly.pickup.definitions[original["definition"]]["shape"])


if __name__ == "__main__":
    unittest.main()