import copy
import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import unittest

import oracle


class OracleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        oracle.checked_runtime()
        cls.baseline = json.loads((oracle.ROOT / "artifacts/candidates/A/parameters.json").read_text())

    def test_negative_parameters(self):
        for change in ({"plateThicknessMm": -1}, {"pivotCenterYZMm": [330, 130]}, {"pivotCenterYZMm": [70, 65]}, {"units": "inch"}, {"rollerGapMm": float("nan")}, {"plateThicknessMm": float("inf")}):
            with self.subTest(change=change):
                parameters = {**copy.deepcopy(self.baseline), **change}
                with self.assertRaises(ValueError):
                    oracle.build(parameters)

    def test_network_guard(self):
        with self.assertRaisesRegex(PermissionError, "Offline oracle"):
            socket.socket()

    def test_dns_guard(self):
        with self.assertRaisesRegex(PermissionError, "socket.getaddrinfo"):
            socket.getaddrinfo("offline.invalid", 443)

    def test_subprocess_guard(self):
        with self.assertRaisesRegex(PermissionError, "subprocess.Popen"):
            subprocess.run([sys.executable, "-c", "raise AssertionError('Must not execute')"], check=True)

    def test_local_hostname_is_allowed(self):
        before = oracle.AUDIT_EVENTS["localHostnameLookups"]
        self.assertIsInstance(socket.gethostname(), str)
        self.assertEqual(oracle.AUDIT_EVENTS["localHostnameLookups"], before + 1)

    def test_output_path_is_confined(self):
        with self.assertRaises(ValueError):
            oracle.local_path(oracle.ROOT.parent / "not-trial-owned.step")

    def test_real_kernel_and_step_roundtrip(self):
        with tempfile.TemporaryDirectory(dir=oracle.ROOT) as directory:
            measured = oracle.evaluate(self.baseline, Path(directory))
            self.assertEqual(measured["holeCount"], 5)
            self.assertTrue(measured["closed"])
            self.assertEqual(measured["stepRoundtrip"], "PASS")

    def test_wrong_shape_is_rejected(self):
        import cadquery as cq

        with self.assertRaises(ValueError):
            oracle.measure(cq.Workplane().box(10, 10, 10).val(), self.baseline)
        modified = {**self.baseline, "plateThicknessMm": 8}
        with self.assertRaises(ValueError):
            oracle.measure(oracle.build(modified), self.baseline)
        for change in ({"shaftHoleDiameterMm": 13.1}, {"pivotCenterYZMm": [26, 130]}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                oracle.measure(oracle.build({**self.baseline, **change}), self.baseline)
        with self.assertRaises(ValueError):
            oracle.measure(cq.Compound.makeCompound([oracle.build(self.baseline), cq.Workplane().box(1, 1, 1).val()]), self.baseline)


if __name__ == "__main__":
    unittest.main()