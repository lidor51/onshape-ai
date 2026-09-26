import copy
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
SPEC = importlib.util.spec_from_file_location("build_cots_bindings", ROOT / "build_bindings.py")
BUILD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILD)


class SourceBindingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bindings = BUILD.read(ROOT / "sourcebindings.json")
        cls.geometry = BUILD.read(ROOT / "geometry-report.json")["assets"]

    def test_all_source_hashes_and_rigid_attachments(self):
        BUILD.validate(self.bindings)

    def test_ledger_caps_and_closed_pass(self):
        ledger = BUILD.read(ROOT / "request-ledger.json")
        self.assertTrue(ledger["closed"])
        self.assertEqual(len(ledger["requests"]), 9)
        self.assertEqual([record["attempt"] for record in ledger["requests"]], list(range(1, 10)))
        self.assertEqual(sum(record["receivedBytes"] for record in ledger["requests"]), 13352516)
        self.assertLessEqual(sum(record["chargedBytes"] for record in ledger["requests"]), 100 * 1024 ** 2)
        self.assertTrue(all(record["receivedBytes"] <= 25 * 1024 ** 2 for record in ledger["requests"]))
        self.assertEqual(sum(record["status"] == "redirect" for record in ledger["requests"]), 1)

    def test_exact_gear_identity_and_tooth_contract(self):
        for identifier, sku, teeth, pitch, outside in [
            ("spline_pinion", "WCP-1010", 12, 15.24, 17.78),
            ("hex_output_gear", "WCP-0121", 60, 76.2, 78.74)]:
            product = self.bindings["products"][identifier]
            self.assertEqual(product["sku"], sku)
            self.assertEqual(product["datums"]["toothCountFromTipFaces"], teeth)
            self.assertAlmostEqual(product["datums"]["pitchDiameterMmFromCatalog"], pitch)
            self.assertAlmostEqual(product["datums"]["tipCircleDiameterMm"], outside)
        self.assertAlmostEqual(self.bindings["gearPairContract"]["nominalCenterDistanceMm"], 45.72)

    def test_no_durometer_inference_from_cad_color(self):
        for identifier, sku in [("indexer_wheel", "am-3945_green"), ("intake_star", "am-5123_green")]:
            variant = self.bindings["products"][identifier]["variant"]
            self.assertEqual(variant["sku"], sku)
            self.assertEqual(variant["durometerShoreA"], 35)
            self.assertIn("35A", variant["title"])
            self.assertIn("family geometry", variant["stepScope"])

    def test_drawing_discrepancies_remain_explicit(self):
        for identifier in ["indexer_wheel", "intake_star"]:
            product = self.bindings["products"][identifier]
            bore = product["datums"]["hex"]
            self.assertAlmostEqual(bore["cadAcrossFlatsMm"], 12.7)
            self.assertGreater(bore["drawingAcrossFlatsLimitsMm"][0], bore["cadAcrossFlatsMm"])
            self.assertTrue(product["discrepancies"])
            self.assertFalse(bore["shaftFitApproved"])

    def test_hex_clocking_from_six_measured_flats(self):
        for identifier, key in [("hex_output_gear", "wcp-0121"), ("indexer_wheel", "am-3945-rev3"), ("intake_star", "am-5123")]:
            product = self.bindings["products"][identifier]
            rotation = product["attachment"]["sourceToAttachment"]["rotation"]
            faces = self.geometry[key]["root_geometry"][0]["analytic_faces"]
            normals = [BUILD.multiply(rotation, faces[index]["normal"]) for index in product["datums"]["hex"]["faceIndices"]]
            self.assertEqual(len(normals), 6)
            self.assertTrue(any(abs(abs(normal[1]) - 1) < 1e-6 for normal in normals))
            self.assertTrue(all(abs(normal[2]) < 1e-6 for normal in normals))

    def test_star_spoke_hub_and_original_component_counts(self):
        product = self.bindings["products"]["intake_star"]
        self.assertEqual(product["importsolids"], 3)
        self.assertAlmostEqual(product["datums"]["spokeBodyWidthMm"], 10.16)
        self.assertAlmostEqual(product["datums"]["overallWidthMm"], 12.7)
        self.assertGreater(product["datums"]["sourceXYEnvelopeMm"][0], 127)
        self.assertFalse(product["datums"]["rotationalSweptEnvelopeVerified"])

    def test_reject_tampered_matrix(self):
        modified = copy.deepcopy(self.bindings)
        modified["products"]["indexer_wheel"]["attachment"]["sourceToAttachment"]["matrix4x4"][0][3] += 1
        with self.assertRaises(AssertionError):
            BUILD.validate(modified)

    def test_reject_wrong_original_hash(self):
        modified = copy.deepcopy(self.bindings)
        modified["products"]["spline_pinion"]["sha256"] = "0" * 64
        with self.assertRaises(AssertionError):
            BUILD.validate(modified)

    def test_reject_substituted_sku(self):
        modified = copy.deepcopy(self.bindings)
        modified["products"]["hex_output_gear"]["sku"] = "WCP-0137"
        with self.assertRaises(AssertionError):
            BUILD.validate(modified)

    def test_reject_nonrigid_transform(self):
        modified = copy.deepcopy(self.bindings)
        transform = modified["products"]["intake_star"]["attachment"]["sourceToAttachment"]
        transform["rotation"][0][0] = 2
        with self.assertRaises(AssertionError):
            BUILD.validate(modified)

    def test_runtime_loader_evidence(self):
        report = BUILD.read(ROOT / "integration-validation.json")
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["networkRequests"], 0)
        self.assertEqual(len(report["products"]), 6)
        for identifier, product in report["products"].items():
            self.assertEqual(product["validSolids"], self.bindings["products"][identifier]["importsolids"])
            self.assertGreater(product["attachmentAxisCylinderMatches"], 0)
            self.assertFalse(product["masterReexported"])


if __name__ == "__main__":
    unittest.main(verbosity=2)