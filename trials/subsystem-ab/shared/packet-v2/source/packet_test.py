import copy
import json
import math
from pathlib import Path
import sys
import unittest

import numpy as np

from cad_core import ROOT, box, bounds, cq, solid_check
from model import geometry, make_design, resolve_model, value
from package_packet import PACKET, REPOSITORY, featurescript, instance_matrix, mate_frames, sha, transform_solid
from validate import graph_checks, hole_checks


def verify_freeze(manifest=None):
    manifest = manifest if manifest is not None else json.loads((PACKET / "freeze.json").read_text())
    for category, base in [("artifactSha256", PACKET), ("sourceSha256", ROOT), ("upstreamSha256", REPOSITORY)]:
        for name, expected in manifest[category].items():
            path = (base / name).resolve()
            if not path.is_relative_to(base) or not path.is_file() or sha(path) != expected:
                raise ValueError("Stale or unsafe packet source: " + name)
    return manifest


def admission():
    manifest = verify_freeze()
    if manifest["apiBrowserAdmission"] != "READY":
        return {"status": "BLOCKED", "apiCalls": 0, "reasons": manifest["blockers"]}
    validation = json.loads((PACKET / "validation.json").read_text())
    bindings = json.loads((PACKET / "cots-bindings-pending.json").read_text())
    if validation["status"] != "PASS" or bindings["status"] != "APPROVED_BOUND_SOURCES":
        return {"status": "BLOCKED", "apiCalls": 0, "reasons": ["Local geometry or COTS gate not satisfied"]}
    return {"status": "LOCAL_PREREQUISITES_ONLY", "apiCalls": 0, "requiresParentAuthorizationAndLiveQuotaGate": True}


class PacketTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parameters = json.loads((ROOT / "parameters.json").read_text())
        cls.design = make_design(cls.parameters)
        cls.baseline, cls.placed = resolve_model(cls.design, cls.parameters["baseline"])
        cls.revision, cls.revised_placed = resolve_model(cls.design, cls.parameters["revision"])

    def test_solid_health_baseline_and_revision(self):
        self.assertEqual(len(self.baseline), 27)
        for collection in [self.baseline, self.revision]:
            for name, shape in collection.items():
                with self.subTest(part=name):
                    measured = solid_check(shape)
                    self.assertTrue(measured["valid"] and measured["closed"])
                    self.assertEqual(measured["solids"], 1)
                    self.assertGreater(measured["volumeMm3"], 0)

    def test_native_graph_has_real_motion_contract(self):
        report = graph_checks(self.design)
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["nativeInstancesExcludingCoral"], 45)
        self.assertEqual(report["revoluteJoints"], 9)
        self.assertEqual(report["transmissionRelations"], 5)
        pivot = next(joint for joint in self.design["joints"] if joint["child"] == "pickup_left")
        self.assertEqual(pivot["limitsDeg"], [-145, 0])

    def test_control_range_and_expression_rejection(self):
        for controls in [{"mouthWidth": 540, "receiverHeight": 320}, {"mouthWidth": float("nan"), "receiverHeight": 320}, {"mouthWidth": 500, "receiverHeight": 0}, {"mouthWidth": True, "receiverHeight": 320}]:
            with self.assertRaises(ValueError):
                resolve_model(self.design, controls)
        for expression in ["__import__('os')", "mouthWidth.__class__", "unknown + 2"]:
            with self.assertRaises(ValueError):
                value(expression, self.parameters["baseline"])

    def test_all_declared_bores_are_measured_and_empty(self):
        for controls, collection in [(self.parameters["baseline"], self.baseline), (self.parameters["revision"], self.revision)]:
            checks = hole_checks(collection, self.design, controls)
            self.assertGreaterEqual(len(checks), 25)
            self.assertTrue(all(entry["status"] == "PASS" and entry["sampleCount"] == 12 for entry in checks))

    def test_revision_changes_real_neutral_geometry_by_20_mm(self):
        for name in ["upper_pickup_drum", "lower_pickup_drum", "lower_hex_shaft", "pickup_belt", "pickup_cross_tube"]:
            first, second = bounds(self.baseline[name]), bounds(self.revision[name])
            self.assertAlmostEqual((second[3] - second[0]) - (first[3] - first[0]), 20, places=5)
        self.assertEqual(set(self.baseline), set(self.revision))
        self.assertEqual(set(self.placed), set(self.revised_placed))
        self.assertGreater(abs(self.baseline["deploy_output_gear"].Volume() - self.revision["deploy_output_gear"].Volume()), 1)

    def test_revision_preserves_pivot_and_receiver(self):
        for name in ["pivot_spine", "receiver", "cradle", "stage_deck", "orienter_left_shaft", "orienter_right_shaft"]:
            np.testing.assert_allclose(bounds(self.placed[name]), bounds(self.revised_placed[name]), atol=1e-7)
        first = {entry["id"]: entry for entry in mate_frames(self.design, self.parameters["baseline"])}
        second = {entry["id"]: entry for entry in mate_frames(self.design, self.parameters["revision"])}
        self.assertEqual(set(first), set(second))
        np.testing.assert_allclose(first["mate_pickup_left"]["worldJointFrameRowMajorMm"], second["mate_pickup_left"]["worldJointFrameRowMajorMm"], atol=1e-8)

    def test_receiver_control_is_independent(self):
        probe, placed = resolve_model(self.design, self.parameters["receiverControlProbe"])
        self.assertNotAlmostEqual(probe["receiver_reference"].Volume(), self.baseline["receiver_reference"].Volume())
        np.testing.assert_allclose(bounds(probe["upper_pickup_drum"]), bounds(self.baseline["upper_pickup_drum"]), atol=1e-7)
        self.assertAlmostEqual(bounds(placed["receiver"])[2] - bounds(self.placed["receiver"])[2], 30, places=5)

    def test_explicit_frames_transform_real_solids(self):
        for angle in [0, -72.5, -145]:
            for entry in mate_frames(self.design, self.parameters["revision"], angle):
                self.assertLess(entry["coincidenceError"], 1e-8)
            direct = resolve_model(self.design, self.parameters["baseline"], angle)[1]
            for item in self.design["instances"]:
                matrix = instance_matrix(item, self.parameters["baseline"], angle, self.parameters["pivotOriginMm"])
                transformed = transform_solid(self.baseline[item["part"]], matrix)
                np.testing.assert_allclose(bounds(transformed), bounds(direct[item["id"]]), atol=1e-5)

    def test_feature_source_controls_and_envelope_separation(self):
        source, layout = featurescript(self.design)
        self.assertIn("FeatureScript 3070;", source)
        self.assertIn('"includeCotsEnvelopes" : false', source)
        self.assertIn('"includeCoralReference" : false', source)
        self.assertIn("definition.mouthWidth", source)
        self.assertIn("definition.receiverHeight", source)
        self.assertEqual(len(layout), 27)
        self.assertEqual(source.count("{"), source.count("}"))

    def test_exact_semantic_exclusions_only(self):
        exclusions = self.design["intentionalContactExclusions"]
        self.assertEqual(len(exclusions), 6)
        self.assertTrue(all(len(entry["pair"]) == 2 and all("*" not in role for role in entry["pair"]) for entry in exclusions))
        for entry in exclusions:
            self.assertNotIn("transfer_ramp", entry["pair"])
            self.assertNotIn("pickup_right", entry["pair"])

    def test_failed_motion_samples_remain_failed(self):
        validation = json.loads((ROOT / "validation.json").read_text())
        self.assertEqual(validation["status"], "FAIL")
        for variant in ["baseline", "revision"]:
            samples = validation["variants"][variant]["motion"]["samples"]
            self.assertEqual(len(samples), 31)
            self.assertTrue({0, -72.5, -145}.issubset({sample["angleDeg"] for sample in samples}))
            failures = {tuple(clash["pair"]) for sample in samples for clash in sample["unexpectedClashes"]}
            self.assertEqual(failures, {("pickup_gear_guard", "pickup_right"), ("pickup_motor", "transfer_ramp")})
            self.assertTrue(all(sample["status"] == "FAIL" for sample in samples))

    def test_kernel_collision_sentinel(self):
        self.assertAlmostEqual(box([10, 10, 10], [0, 0, 0]).intersect(box([10, 10, 10], [5, 0, 0])).Volume(), 500, places=6)

    def test_single_coral_reference_and_reference_bom_boundary(self):
        self.assertEqual(sum(item["part"] == "coral_reference" for item in self.design["instances"]), 1)
        self.assertLess(330, 2 * self.parameters["coralMm"]["length"])
        self.assertLess(100, 2 * self.parameters["coralMm"]["outerDiameter"])
        self.assertEqual(self.design["parts"]["chassis_reference"]["category"], "reference")
        self.assertEqual(self.design["parts"]["receiver_reference"]["category"], "reference")

    @unittest.skipUnless((PACKET / "freeze.json").exists(), "Packet not sealed yet")
    def test_frozen_hashes_admission_and_wrong_source_rejection(self):
        manifest = verify_freeze()
        self.assertEqual(admission()["status"], "BLOCKED")
        self.assertEqual(manifest["sharedApiCalls"], 0)
        corrupt = copy.deepcopy(manifest)
        corrupt["artifactSha256"]["source/concept-a.fs"] = "0" * 64
        with self.assertRaises(ValueError):
            verify_freeze(corrupt)
        unsafe = copy.deepcopy(manifest)
        unsafe["artifactSha256"]["../outside.json"] = "0" * 64
        with self.assertRaises(ValueError):
            verify_freeze(unsafe)


if __name__ == "__main__":
    if "--admission" in sys.argv:
        report = admission()
        print(json.dumps(report, indent=2))
        raise SystemExit(2 if report["status"] == "BLOCKED" else 0)
    runner = unittest.TextTestRunner(verbosity=2)
    outcome = runner.run(unittest.defaultTestLoader.loadTestsFromTestCase(PacketTests))
    write_path = ROOT / "tests.json"
    write_path.write_text(json.dumps({"status": "PASS" if outcome.wasSuccessful() else "FAIL", "testsRun": outcome.testsRun, "failures": len(outcome.failures), "errors": len(outcome.errors), "skipped": len(outcome.skipped), "meaning": "Regression/measurement/gate tests passing does NOT mean physical geometry motion passed."}, indent=2) + "\n")
    raise SystemExit(0 if outcome.wasSuccessful() else 1)