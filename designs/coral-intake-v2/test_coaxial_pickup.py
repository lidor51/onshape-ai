import math
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import coaxial_pickup as coaxial


class GeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pickup = coaxial.build_structure()

    def test_requested_centers_and_catalog_lengths(self):
        config = self.pickup.config
        rows = coaxial.module.centers(config)
        self.assertEqual(config["stow_angle"], -165)
        self.assertGreaterEqual(min(config["fold_angles"]), -165)
        self.assertEqual(rows["kick"], [-122, 34])
        self.assertAlmostEqual(rows["rear"][0], -25)
        self.assertAlmostEqual(rows["rear"][1], 348)
        self.assertAlmostEqual(rows["front"][1], 166)
        self.assertAlmostEqual(math.dist(rows["front"], rows["middle"]), 180)
        self.assertAlmostEqual(math.dist(rows["middle"], rows["rear"]), 155)
        for belt in coaxial.candidate_belts(config):
            self.assertAlmostEqual(belt["length_mm"], belt["computed_pitch_length_mm"])
            self.assertFalse(belt["physical_drive_complete"])

    def test_real_cheek_has_one_coaxial_seat_and_no_old_pivot_lobe(self):
        definition = self.pickup.definitions["main_cheek"]
        self.assertEqual(len([hole for hole in definition["holes"] if hole[2] == 28.57]), 3)
        self.assertTrue(definition["shape"].isValid())
        self.assertEqual(len(definition["shape"].Solids()), 1)
        self.assertLess(coaxial.module.bounds(definition["shape"])[3], 0)
        probe = coaxial.module.cylinder(10, 10, (-25, 348, 0))
        self.assertLess(definition["shape"].intersect(probe).Volume(), 1e-6)

    def test_repaired_tubes_clear_full_spin_disks_at_nine_float_samples(self):
        report = coaxial.crossmember_screen(self.pickup.config)
        self.assertGreater(report["minimum_gap_mm"], 10)
        original = self.pickup.config | {"crossmembers_yz": [[-288, 215], [-210, 360]]}
        self.assertLess(coaxial.crossmember_screen(original)["minimum_gap_mm"], 0)


class AssemblyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.assembly = coaxial.build()
        cls.parts = {part["id"]: part for part in cls.assembly.instances}

    def test_all_retained_context_moves_rigidly_and_four_motors_survive(self):
        self.assertEqual(len(self.assembly.retained_ids), 181)
        self.assertEqual(sum(part["role"] == "motor" for part in self.assembly.instances), 4)
        self.assertEqual(sum(part["role"] == "gear" for part in self.assembly.instances), 8)
        for original in self.assembly.retained.instances:
            retained = self.parts["v1_" + original["id"]]
            expected = coaxial.cq.Location(coaxial.cq.Vector(0, 0, 41.15)) * original["pose"]
            self.assertEqual(coaxial.module.matrix(retained["pose"]), coaxial.module.matrix(expected))
        tray = self.parts["v1_detachable_tray"]
        self.assertAlmostEqual(coaxial.module.bounds(self.assembly.shape(tray))[5], 175)

    def test_rear_fixed_keeper_moving_and_no_duplicate_pivot(self):
        for identifier in self.parts:
            self.assertNotIn("pivot_stub", identifier)
            self.assertNotIn("bearing_pivot", identifier)
        for identifier in ("v2_shaft_rear", "v2_star_rear_0_body_2", "v2_rear_between_0", "v2_bearing_rear_1"):
            part = self.parts[identifier]
            self.assertEqual(coaxial.module.matrix(self.assembly.pose(part)), coaxial.module.matrix(self.assembly.pose(part, -180, -8)))
        keeper = self.parts["v2_bearing_rear_1_keeper"]
        self.assertNotEqual(coaxial.module.matrix(self.assembly.pose(keeper)), coaxial.module.matrix(self.assembly.pose(keeper, -180)))
        self.assertEqual(sum(part["role"] == "bearing" and ("rear" in part["id"] or "coaxial_outer" in part["id"]) for part in self.parts.values()), 4)

    def test_six_authentic_vendor_sources_hash_match(self):
        bindings = {}
        for definition in self.assembly.definitions.values():
            source = definition.get("source_binding") or definition.get("source")
            if isinstance(source, dict):
                product = source.get("product_id")
                if product:
                    bindings[product] = source
        self.assertEqual(len(self.assembly.retained.sources), 5)
        self.assertEqual(len({source["sha256"] for source in self.assembly.sources.values() if isinstance(source, dict) and source.get("pathrepoRelative")}), 6)
        for source in self.assembly.sources.values():
            if isinstance(source, dict) and source.get("pathrepoRelative"):
                self.assertEqual(coaxial.module.sha256(coaxial.module.REPO / source["pathrepoRelative"]), source["sha256"])

    def test_stage_end_faces_no_longer_intrude_on_washers(self):
        for name in ("pickup", "deployment"):
            shaft = self.parts[name + "_" + name + "_stage_shaft"]
            self.assertAlmostEqual(coaxial.module.bounds(self.assembly.shape(shaft))[3], 305)

    def test_recorded_top_screw_contacts_match_explicit_tapped_joints(self):
        from thread_contacts import verified_thread_pairs
        verified = verified_thread_pairs(self.assembly)
        self.assertEqual(len(verified), 4)
        for record in verified.values():
            self.assertLess(record["overlap_outside_thread_region_mm3"], 1e-6)
            self.assertFalse(record["strength_qualified"])
        definition = self.assembly.pickup.definitions["tube_end_plug"]
        top_tap = next(tap for tap in definition["taps"] if tap["axis"] == "radial_top")
        self.assertEqual(top_tap["thread"], "M5")
        self.assertAlmostEqual(top_tap["engagement_mm"], 4.9)
        for index in (0, 1):
            for side in (-1, 1):
                prefix = f"tube_joint_{index}_{side}"
                joint = next(row for row in self.assembly.joints if row["id"] == prefix + "_top")
                self.assertAlmostEqual(joint["thread_engagement_mm"], 4.9)
                self.assertFalse(joint["strength_qualified"])
                screw = self.assembly.shape(self.parts["v2_" + prefix + "_top_screw"])
                plug = self.assembly.shape(self.parts["v2_" + prefix + "_plug"])
                self.assertGreater(abs(screw.intersect(plug).Volume()), 0)

    def test_thread_rule_rejects_misaligned_and_bottoming_screws(self):
        from thread_contacts import verified_thread_pairs
        screw = self.parts["v2_tube_joint_0_1_top_screw"]
        original = screw["pose"]
        try:
            for offset in ((1, 0, 0), (0, 0, -1)):
                screw["pose"] = coaxial.cq.Location(coaxial.cq.Vector(*offset)) * original
                self.assertEqual(len(verified_thread_pairs(self.assembly)), 3)
        finally:
            screw["pose"] = original

    def test_cached_classifier_proves_witness_but_not_clear_from_absence(self):
        assembly = coaxial.CoaxialSystem()
        assembly.pickup = self.assembly.pickup
        assembly.define("cube", coaxial.module.box((2, 2, 2)), "test")
        assembly.add("first", "cube")
        assembly.add("hit", "cube", coaxial.cq.Location(coaxial.cq.Vector(0.5, 0, 0)))
        assembly.add("clear", "cube", coaxial.cq.Location(coaxial.cq.Vector(3, 0, 0)))
        cache = coaxial.SolidCache(assembly)
        first, hit, clear = [cache.placed(part, 0, 0) for part in assembly.instances]
        self.assertEqual(cache.pair(first, hit, 0, math.inf)[0], "UNKNOWN_BUDGET")
        self.assertEqual(cache.pair(first, hit, 80, math.inf)[0], "INTERIOR_WITNESS")
        self.assertEqual(cache.pair(first, clear, 0, math.inf)[0], "WHOLE_AABB_SEPARATED")


if __name__ == "__main__":
    unittest.main()