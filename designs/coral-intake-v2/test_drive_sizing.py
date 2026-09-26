import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from drive_sizing import roller_requirement, fold_requirement, mass_properties, motor_data
from pickup import Pickup, box


class DriveSizingTests(unittest.TestCase):
    def test_roll_speed_and_force(self):
        result = roller_requirement(127, 3, 40, 10, 0.8, motor_data())
        self.assertAlmostEqual(result["motor_torque_nm"], 0.3175)
        self.assertAlmostEqual(result["no_load_surface_mps"], 5.158840712, places=8)
        self.assertFalse(result["hardware_qualified"])

    def test_parallel_axis_against_known_box(self):
        pickup = Pickup({"pivot_yz": [0, 0]})
        name = pickup.define("fixture", box((10, 10, 10), (0, 100, 0)))
        pickup.add("fixture", name)
        estimate = mass_properties(pickup)["totals"][0]
        mass = 1000 * 2.65e-6
        self.assertAlmostEqual(estimate["mass_kg"], mass)
        self.assertAlmostEqual(estimate["first_moment_bound_kg_m"], mass * 0.1)
        self.assertAlmostEqual(estimate["inertia_kg_m2"], mass * (0.1 ** 2 + (0.01 ** 2 + 0.01 ** 2) / 12))

    def test_fold_reduction_does_not_change_output_requirement(self):
        args = dict(mass_kg=4, first_moment_kg_m=1.2, inertia_kg_m2=0.4, duration_s=1.2, angle_deg=140, motor=motor_data())
        slow = fold_requirement(**args, ratio=50)
        fast = fold_requirement(**args, ratio=5)
        self.assertAlmostEqual(slow["required_output_torque_nm"], fast["required_output_torque_nm"])
        self.assertAlmostEqual(fast["required_motor_torque_nm"], 10 * slow["required_motor_torque_nm"])
        self.assertFalse(slow["holding_approved"])


if __name__ == "__main__":
    unittest.main()