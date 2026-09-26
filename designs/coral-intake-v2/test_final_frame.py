import importlib.util
import json
import math
from pathlib import Path
import sys
import unittest


sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("final_frame", Path(__file__).with_name("final_frame.py"))
final = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(final)


class PickupRepairTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.coaxial, cls.assembly = final.build()
        cls.parts = {part["id"]: part for part in cls.assembly.instances}
        cls.audit = final.inboard.load_sibling("starting_frame")
        cls.report = cls.assembly.powertrain_installation

    def test_pickup_repair(self):
        assembly = self.assembly
        module = assembly.pickup_module
        historical = json.loads((final.ROOT / "inboard-frame-output" / "targeted-interference.json").read_text())
        pairs = [row["parts"] for row in historical["failures"]
                 if row["parts"][0].startswith(("pt_drive_pickup_", "pt_pickup_"))]
        self.assertEqual(len(pairs), 17)
        for first, second in pairs:
            common = assembly.shape(self.parts[first]).intersect(assembly.shape(self.parts[second]))
            self.assertLess(abs(common.Volume()), 1e-4, (first, second))
        targeted = final.inboard.targeted_interference(assembly, self.audit, seconds=150, maximum_commons=100)
        self.audit.write_json(final.OUTPUT / "pickup-targeted-interference.json", targeted)
        self.assertFalse([row for row in targeted["cases"] if row["status"] == "UNKNOWN_BUDGET"])
        self.assertFalse([row for row in targeted["failures"]
                          if row["parts"][0].startswith(("pt_drive_pickup_", "pt_pickup_", "pt_rear_"))])
        self.assertEqual(sum(part["role"] == "motor" for part in self.parts.values()), 4)
        paths = {row["id"]: row for row in self.report["paths"]}
        self.assertAlmostEqual(paths["pickup_reduction"]["length_mm"], 350, places=6)
        center = paths["pickup_reduction"]["centers"][0]
        self.assertAlmostEqual(center[0], 80)
        powered = final.inboard.load_sibling("powered_transmissions")
        self.assertAlmostEqual(center[1], 348 + powered.belt_center(350, 18, 36), places=8)
        self.assertEqual(assembly.pickup.config["pivot_yz"], [80, 348])
        for mesh in self.report["gear_meshes"]:
            self.assertAlmostEqual(mesh["centers_mm"], sum(mesh["teeth"]) * 25.4 / 40, places=7)
        attachment = next(row for row in self.report["attachments"] if row["id"] == "pickup_to_frame")
        for index, point in enumerate(attachment["holes"]):
            bolt_pose = module.matrix(self.parts["pt_pickup_box_bolt_" + str(index)]["pose"])
            self.assertAlmostEqual(bolt_pose[1][3], point[0])
            self.assertAlmostEqual(bolt_pose[2][3], point[1])
            for identifier, axial in (("coaxial_frame_plate_1", 310), ("pt_pickup_outer_plate", 303)):
                probe = module.cylinder(2.74, 5.9, (axial, *point), (1, 0, 0))
                self.assertLess(abs(assembly.shape(self.parts[identifier]).intersect(probe).Volume()), 1e-6)
        print(json.dumps({"pickupHistoricalPairsCleared": len(pairs), "remainingTargetedFailures": targeted["failures"],
                          "inputCenterYZ": center, "instances": len(self.parts)}, indent=2), flush=True)

    def test_bank_repair(self):
        assembly = self.assembly
        historical = json.loads((final.ROOT / "inboard-frame-output" / "targeted-interference.json").read_text())
        for row in historical["failures"]:
            first, second = row["parts"]
            common = assembly.shape(self.parts[first]).intersect(assembly.shape(self.parts[second]))
            self.assertLess(abs(common.Volume()), 1e-4, row["parts"])
        targeted = final.inboard.targeted_interference(assembly, self.audit, seconds=150, maximum_commons=100)
        self.audit.write_json(final.OUTPUT / "bank-targeted-interference.json", targeted)
        self.assertEqual(targeted["status"], "TARGETED_PHASE_ZERO_CLEAR", targeted["failures"])
        path = next(row for row in self.report["paths"] if row["id"] == "indexer_L_0")
        self.assertAlmostEqual(path["length_mm"], 350, places=6)
        self.assertAlmostEqual(sum(path["wrap_deg"]), 360, places=7)
        self.assertGreater(min(path["wrap_deg"]), 45)
        self.assertAlmostEqual(path["centers"][1][0], -163.79495034505229)
        self.assertAlmostEqual(path["centers"][1][1], 141.04684626449784)
        module = assembly.pickup_module
        plate = assembly.shape(self.parts["v1_indexer_plate_L_247"])
        self.assertEqual(len(plate.Solids()), 1)
        self.assertTrue(plate.isValid())
        for point in self.report["chain_passage"]["anchors_xy"]:
            probe = module.cylinder(2.74, 5.9, (*point, 288.15))
            self.assertLess(abs(plate.intersect(probe).Volume()), 1e-6)
        print(json.dumps({"historicalPairsCleared": len(historical["failures"]),
                          "targetedStatus": targeted["status"], "candidatePairs": targeted["candidatePairs"],
                          "idlerPath": path, "chainPassage": self.report["chain_passage"]}, indent=2), flush=True)
        neighbors = final.repair_neighbor_interference(assembly, self.audit)
        envelope = final.chain_passage_envelope(assembly)
        self.audit.write_json(final.OUTPUT / "repair-neighbor-interference.json", neighbors)
        self.audit.write_json(final.OUTPUT / "chain-passage-envelope.json", envelope)
        print(json.dumps({"neighborStatus": neighbors["status"], "neighborFailures": neighbors["failures"],
                  "neighborUnknownCount": neighbors["unknownCount"], "chainEnvelope": envelope}, indent=2), flush=True)
        self.assertTrue(envelope["pass"])
        self.assertEqual(neighbors["status"], "REPAIR_NEIGHBORS_PHASE_ZERO_CLEAR", neighbors["failures"])

    def test_keeper_openings_preserve_connected_support_plates(self):
        module = self.assembly.pickup_module
        for identifier in ("coaxial_frame_plate_1", "v1_indexer_plate_L_247"):
            shape = self.assembly.shape(self.parts[identifier])
            self.assertTrue(shape.isValid(), identifier)
            self.assertEqual(len(shape.Solids()), 1, identifier)
        historical = json.loads((final.ROOT / "final-frame-output" / "repair-neighbor-interference.json").read_text())
        self.assertEqual(len(historical["failures"]), 9)
        for pair in historical["failures"]:
            first, second = pair["parts"]
            common = self.assembly.shape(self.parts[first]).intersect(self.assembly.shape(self.parts[second]))
            self.assertLess(abs(common.Volume()), 1e-4, pair["parts"])
        bank = self.assembly.shape(self.parts["v1_indexer_plate_L_247"])
        for center in ((-172.5, 74), (-110, 182), (-92.25, 288)):
            annulus = module.ring(39, 28.57, 5.9).translate((*center, 288.15))
            original = self.assembly.retained.definitions["indexer_bank_plate_L"]["shape"].translate((0, 0, 288.15))
            expected = abs(original.intersect(annulus).Volume())
            self.assertAlmostEqual(abs(bank.intersect(annulus).Volume()), expected, places=4)


if __name__ == "__main__":
    unittest.main()