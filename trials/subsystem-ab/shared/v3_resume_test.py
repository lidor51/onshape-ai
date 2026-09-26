import json
import unittest
from unittest.mock import patch

import v3_finish
from v3_checks import DRIVES
from v3_contract import connector_contract, mate_frames
from v3_model import PACKET, make_design


class ResumeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.design = make_design()

    def test_original_x44_bodies_and_drive_roles(self):
        bindings = self.design["cotsBindings"]
        motors = [binding for binding in bindings.values() if binding["product"] == "x44"]
        self.assertEqual(sorted(binding["sourceBodyIndex"] for binding in motors), [0, 1])
        self.assertTrue(all("derivedPartition" not in binding for binding in bindings.values()))
        self.assertNotIn("cots_x44_shaft", bindings)
        names = {item["id"] for item in self.design["instances"]}
        self.assertFalse(any(name.endswith("_motor_shaft") for name in names))
        for drive in DRIVES:
            self.assertTrue({drive[key] for key in ["input", "output", "motor"] if key in drive} <= names)

    def test_source_gate_stops_before_full_execution(self):
        with patch.object(v3_finish, "source_probe", return_value={"status": "FAIL"}), patch.object(v3_finish, "validate") as validation, patch.object(v3_finish, "source_snapshot") as snapshot:
            with self.assertRaisesRegex(RuntimeError, "V3_SOURCE_ROUNDTRIP_BLOCKED"):
                v3_finish.finish()
            validation.assert_not_called()
            snapshot.assert_not_called()

    def test_brep_gate_stops_before_full_execution(self):
        with patch.object(v3_finish, "source_probe", return_value={"status": "PASS"}), patch.object(v3_finish, "brep_probe", return_value={"status": "FAIL"}), patch.object(v3_finish, "validate") as validation:
            with self.assertRaisesRegex(RuntimeError, "V3_SOURCE_BREP_BLOCKED"):
                v3_finish.finish()
            validation.assert_not_called()

    def test_measured_failures_not_reclassified(self):
        report = json.loads((PACKET / "original-source-roundtrip-probe.json").read_text())
        rows = {row["role"]: row for row in report["rows"]}
        self.assertEqual(report["status"], "FAIL")
        for role in ["cots_x44_main", "cots_x44_rear_cover"]:
            self.assertGreater(rows[role]["volumeErrorMm3"], rows[role]["volumeBudgetMm3"])
        self.assertFalse((PACKET / "freeze.json").exists())

    def test_current_connectors_and_request_budget(self):
        contract = connector_contract(self.design)
        self.assertEqual(len(contract["connectors"]), 102)
        self.assertLessEqual(contract["maximumFrameError"], 1e-8)
        for variant in ["baseline", "revision"]:
            self.assertTrue(all(row["coincidenceError"] < 1e-8 for row in mate_frames(self.design, self.design["parameters"][variant])))
        budget = v3_finish.budget_plan(self.design)
        self.assertEqual(budget["counts"]["instances"], 52)
        self.assertTrue(budget["noHard45InstanceLimit"])
        self.assertFalse(budget["actualLedgerRead"])
        self.assertIsNone(budget["remainingActualApiHeadroom"])

    def test_legacy_freezes_and_source_emission(self):
        checks, contract, source, layouts = v3_finish.static_checks(self.design)
        self.assertEqual(checks["preservedV1AndV2"], "PASS")
        self.assertEqual(source.count("opMateConnector(context,"), len(contract["connectors"]))
        self.assertNotIn("cots_x44_shaft", source)
        self.assertIn('"owner"', source)


if __name__ == "__main__":
    unittest.main()