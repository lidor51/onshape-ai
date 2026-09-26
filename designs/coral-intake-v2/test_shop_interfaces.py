from pathlib import Path
import math
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pickup import router_hex_bore, hex_prism, cylinder


class ShopInterfaceTests(unittest.TestCase):
    def test_relief_clears_actual_hex_without_broaching(self):
        bore = router_hex_bore(12.8, 24)
        shaft = hex_prism(12.7, 22)
        hub = cylinder(9.5, 20).cut(bore)
        self.assertTrue(hub.isValid())
        self.assertEqual(len(hub.Solids()), 1)
        self.assertLess(hub.intersect(shaft).Volume(), 1e-6)
        self.assertAlmostEqual(9.5 - 12.8 / math.sqrt(3) - 1.5, 0.609916554, places=8)
        self.assertGreater(bore.Volume(), hex_prism(12.8, 24).Volume())


if __name__ == "__main__":
    unittest.main()