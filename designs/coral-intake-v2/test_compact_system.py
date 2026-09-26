import importlib.util
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("compact_system", ROOT / "compact_system.py")
compact = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(compact)


class CompactAssemblyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.before = compact.legacy.load_builders()[0].frozen_hashes()
        cls.assembly = compact.build()

    def test_full_function_inventory_and_real_pivot_geometry(self):
        assembly = self.assembly
        self.assertEqual(sum(part["role"] == "motor" for part in assembly.instances), 4)
        self.assertEqual(len(assembly.retained_ids), 181)
        self.assertEqual(assembly.pickup.config["pivot_yz"], [110, 170])
        self.assertIn((110, 170, 28.57), [tuple(hole) for hole in assembly.pickup.definitions["main_cheek"]["holes"]])
        self.assertTrue(assembly.pickup.definitions["main_cheek"]["shape"].isValid())

    def test_fixed_stubs_and_indexer_do_not_follow_fold(self):
        assembly = self.assembly
        for name in ("v2_pivot_stub_1", "v1_detachable_tray"):
            part = next(part for part in assembly.instances if part["id"] == name)
            self.assertEqual(assembly.pickup_module.matrix(part["pose"]),
                             assembly.pickup_module.matrix(assembly.pose(part, -110, -8)))
        cheek = next(part for part in assembly.instances if part["id"] == "v2_main_cheek_1")
        self.assertNotEqual(assembly.pickup_module.matrix(cheek["pose"]),
                            assembly.pickup_module.matrix(assembly.pose(cheek, -110)))

    def test_previous_v1_files_unchanged(self):
        self.assertEqual(self.before, self.assembly.pickup_module.frozen_hashes())


if __name__ == "__main__":
    unittest.main()