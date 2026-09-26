import importlib.util
import math
from pathlib import Path
import sys
import unittest


sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("inboard", Path(__file__).with_name("inboard_frame.py"))
inboard = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(inboard)


class LayoutTests(unittest.TestCase):
    def test_candidate_centers_and_catalog_lengths(self):
        config = inboard.candidate_config({})
        self.assertAlmostEqual(config["middle_yz"][0], -149.686743196, places=8)
        self.assertAlmostEqual(config["middle_yz"][0] - config["front_dy"], -264.25113557, places=7)
        self.assertAlmostEqual(math.dist(config["middle_yz"], config["pivot_yz"]), 230)
        self.assertEqual([2 * config[key] + 90 for key in ("front_distance", "rear_distance")], [500, 550])
        self.assertEqual(config["upper_belt_skus"], ["WCP-0625", "WCP-0628"])

    def test_reverse_circle_closes(self):
        powered = inboard.load_sibling("powered_transmissions")
        config = inboard.candidate_config({})
        distance = powered.belt_center(750, 36, 15)
        reverse = powered.circle_intersection(config["pivot_yz"], 76.2, config["kick_yz"], distance)
        self.assertAlmostEqual(math.dist(reverse, config["pivot_yz"]), 76.2)
        self.assertAlmostEqual(powered.belt_length(math.dist(reverse, config["kick_yz"]), 36, 15), 750)

    def test_original_settings_not_mutated(self):
        base = {"pivot_yz": [-25, 348], "roller_counts": [11, 9, 7]}
        config = inboard.candidate_config(base)
        self.assertEqual(base["pivot_yz"], [-25, 348])
        self.assertEqual(config["roller_counts"], [11, 9, 7])


class AssemblyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.coaxial, cls.assembly = inboard.build()
        cls.parts = {part["id"]: part for part in cls.assembly.instances}
        cls.report = cls.assembly.powertrain_installation

    def test_motors_rollers_and_indexer_preserved(self):
        self.assertEqual(sum(part["role"] == "motor" for part in self.parts.values()), 4)
        for row, count in (("front", 11), ("middle", 9), ("rear", 7)):
            self.assertEqual(sum(part["id"].startswith("v2_star_" + row + "_") and part["role"] == "outer_elastomer"
                                 for part in self.parts.values()), count)
        self.assertEqual(sum(part["id"].startswith("v1_indexer_") and "_wheel_" in part["id"]
                             and part["role"] == "compliant_contact" for part in self.parts.values()), 18)

    def test_actual_repacked_stack_lanes(self):
        module = self.assembly.pickup_module
        for identifier, axial in (("pt_deployment_14T", -231), ("pt_deployment_36T", -231),
                                   ("pt_deployment_16T", -249), ("pt_deployment_60T_plate", -249),
                                   ("pt_deployment_adapter", -243)):
            self.assertAlmostEqual(module.matrix(self.parts[identifier]["pose"])[0][3], axial)
        audit = inboard.load_sibling("starting_frame")
        for stack in self.report["stacks"]:
            if not stack["id"].startswith("deployment_"):
                continue
            cursor = stack["ends_mm"][0]
            for lower, upper, identifier in stack["occupied"]:
                extent = audit.exact_bounds(self.assembly.shape(self.parts[identifier]))
                self.assertAlmostEqual(lower, extent[0], places=4)
                self.assertAlmostEqual(upper, extent[3], places=4)
                self.assertGreaterEqual(lower, cursor - 1e-5, identifier)
                cursor = upper
            self.assertLessEqual(cursor, stack["ends_mm"][1] + 1e-5)

    def test_internal_root_threads_and_outer_wall(self):
        contacts = inboard.root_thread_contacts(self.assembly)
        self.assertEqual(len(contacts), 4)
        self.assertTrue(all(row["status"] == "EXPECTED_THREAD_ENGAGEMENT" for row in contacts), contacts)
        module = self.assembly.pickup_module
        audit = inboard.load_sibling("starting_frame")
        for joint in self.report["inboard_root_joints"]:
            side = joint["side"]
            self.assertNotIn(joint["id"] + "_crush_sleeve", self.parts)
            self.assertNotIn(joint["id"] + "_nut", self.parts)
            bounds = audit.exact_bounds(self.assembly.shape(self.parts[joint["block"]]))
            self.assertGreaterEqual(min(bounds[0] + 350, 350 - bounds[3]), 5.09)
            rail = self.assembly.shape(self.parts["assumed_chassis_side_rail_" + str(side)])
            for axial, expected in ((326, False), (349, True)):
                point = self.assembly.cq.Vector(side * axial, *joint["center_yz"])
                self.assertEqual(rail.isInside(point, 1e-7), expected)

    def test_rotated_deployment_attachment_and_indexer_clearance(self):
        module = self.assembly.pickup_module
        attachment = next(row for row in self.report["attachments"] if row["id"] == "deployment_to_frame")
        frame = self.assembly.shape(self.parts["coaxial_frame_plate_-1"])
        for index, point in enumerate(attachment["holes"]):
            bolt = self.parts["pt_deployment_box_bolt_" + str(index)]
            matrix = module.matrix(bolt["pose"])
            self.assertAlmostEqual(matrix[1][3], point[0])
            self.assertAlmostEqual(matrix[2][3], point[1])
            probe = module.cylinder(2.74, 5.9, (-310, *point), (1, 0, 0))
            self.assertLess(abs(frame.intersect(probe).Volume()), 1e-6)
        plate = self.assembly.shape(self.parts["v1_indexer_plate_L_247"])
        post = self.assembly.shape(self.parts["v1_indexer_post_L1"])
        for identifier in ("pt_deploy_deployment_X44", "pt_deploy_deployment_mount", "pt_deploy_deployment_60T",
                           "pt_deployment_outer_plate", "pt_deployment_intermediate_chain"):
            shape = self.assembly.shape(self.parts[identifier])
            for obstruction in (plate, post):
                self.assertLess(abs(shape.intersect(obstruction).Volume()), 1e-4, identifier)

    def test_actual_source_gear_centers_and_mesh(self):
        for mesh in self.report["gear_meshes"]:
            self.assertAlmostEqual(mesh["centers_mm"], sum(mesh["teeth"]) * 25.4 / 40, places=7)
            first, second = [self.assembly.shape(self.parts[mesh[key]]) for key in ("input", "output")]
            self.assertLess(abs(first.intersect(second).Volume()), 1e-4, mesh["output"])

    def test_catalog_paths_and_pulley_clearance(self):
        paths = {row["id"]: row for row in self.report["paths"]}
        for name, length, sku in (("front_middle", 500, "WCP-0625"), ("rear_middle", 550, "WCP-0628"),
                                  ("reverse_kicker", 750, "WCP-0636")):
            self.assertAlmostEqual(paths[name]["length_mm"], length, places=6)
            self.assertEqual(paths[name]["sku"], sku)
        for first, second in (("pt_pickup_reduction", "pt_pickup_18T"), ("pt_reverse_kicker", "pt_reverse_36T"),
                              ("pt_front_middle", "pt_front_middle_front"), ("pt_rear_middle", "pt_rear_middle_rear")):
            volume = self.assembly.shape(self.parts[first]).intersect(self.assembly.shape(self.parts[second])).Volume()
            self.assertLess(abs(volume), 1e-4, first)


if __name__ == "__main__":
    unittest.main()