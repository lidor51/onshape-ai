import importlib.util
import tempfile
import unittest
from pathlib import Path

from OCP.BRep import BRep_Builder
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCP.IFSelect import IFSelect_RetDone
from OCP.STEPCAFControl import STEPCAFControl_Writer
from OCP.STEPControl import STEPControl_AsIs
from OCP.TCollection import TCollection_ExtendedString
from OCP.TDataStd import TDataStd_Name
from OCP.TDocStd import TDocStd_Document
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS_Compound
from OCP.XCAFDoc import XCAFDoc_DocumentTool
from OCP.gp import gp_Trsf, gp_Vec

ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("cots_asset_validation", ROOT / "validate_assets.py")
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


class AssetTests(unittest.TestCase):
    def test_vendor_wheel_units_topology_and_hex(self):
        report = VALIDATOR.inspect_step(ROOT / "cache/am-3462-rev2.step")
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["declared_length_units"], ["INCH"])
        self.assertEqual(report["occurrence_solid_count"], 1)
        part = next(iter(report["definitions"].values()))
        self.assertAlmostEqual(part["size_mm"][2], 12.7, places=5)
        self.assertLessEqual(max(part["size_mm"][:2]), 50.8)
        bore = [face for face in part["analytic_faces"] if face["index"] in range(18, 24)]
        for face in bore:
            radius = abs(sum(component * coordinate for component, coordinate in
                             zip(face["normal"], face["origin_mm"])))
            self.assertAlmostEqual(2 * radius, 10.795, places=7)

    def test_html_is_not_step(self):
        with self.assertRaises(ValueError):
            VALIDATOR.inspect_step(ROOT / "cache/wcp-kraken-cad.csv")

    def test_cache_boundary(self):
        with self.assertRaises(ValueError):
            VALIDATOR.owned_cache("../outside.step")

    def test_nested_assembly_keeps_occurrences_multibodies_names_and_placements(self):
        document = TDocStd_Document(TCollection_ExtendedString("TEST_FIXTURE_ONLY"))
        shapes = XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
        compound = TopoDS_Compound()
        builder = BRep_Builder()
        builder.MakeCompound(compound)
        builder.Add(compound, BRepPrimAPI_MakeBox(1, 2, 3).Shape())
        translation = gp_Trsf()
        translation.SetTranslation(gp_Vec(10, 0, 0))
        builder.Add(compound, BRepPrimAPI_MakeBox(1, 2, 3).Shape().Moved(TopLoc_Location(translation)))
        part = shapes.AddShape(compound, False)
        TDataStd_Name.Set_s(part, TCollection_ExtendedString("FixtureMultibody"))
        nested = shapes.NewShape()
        TDataStd_Name.Set_s(nested, TCollection_ExtendedString("FixtureNested"))
        shapes.AddComponent(nested, part, TopLoc_Location())
        assembly = shapes.NewShape()
        TDataStd_Name.Set_s(assembly, TCollection_ExtendedString("FixtureRoot"))
        translation.SetTranslation(gp_Vec(100, 0, 0))
        shapes.AddComponent(assembly, nested, TopLoc_Location(translation))
        translation.SetTranslation(gp_Vec(0, 20, 0))
        shapes.AddComponent(assembly, part, TopLoc_Location(translation))
        shapes.UpdateAssemblies()
        writer = STEPCAFControl_Writer()
        self.assertTrue(writer.Transfer(document, STEPControl_AsIs))
        with tempfile.TemporaryDirectory(prefix="test-fixture-", dir=ROOT / "cache") as directory:
            path = Path(directory) / "synthetic-assembly-not-cots.step"
            self.assertEqual(writer.Write(str(path)), IFSelect_RetDone)
            report = VALIDATOR.inspect_step(path)
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["root_count"], 1)
        self.assertEqual(report["leaf_definition_count"], 1)
        self.assertEqual(report["leaf_occurrence_count"], 2)
        self.assertEqual(report["occurrence_solid_count"], 4)
        self.assertEqual(report["root_geometry"][0]["solid_count"], 4)
        for actual, expected in zip(report["root_geometry"][0]["bounds_mm"], [0, 0, 0, 111, 22, 3]):
            self.assertAlmostEqual(actual, expected, places=5)
        root = report["hierarchy"][0]
        self.assertEqual(root["name"], "FixtureRoot")
        self.assertEqual(root["children"][0]["definition_name"], "FixtureNested")
        self.assertEqual(root["children"][0]["local_transform_3x4"][0][3], 100)
        self.assertEqual(root["children"][1]["local_transform_3x4"][1][3], 20)
        part = next(iter(report["definitions"].values()))
        self.assertEqual(part["name"], "FixtureMultibody")
        self.assertEqual(part["solid_count"], 2)
        self.assertAlmostEqual(part["volume_mm3"], 12, places=5)


if __name__ == "__main__":
    unittest.main(verbosity=2)