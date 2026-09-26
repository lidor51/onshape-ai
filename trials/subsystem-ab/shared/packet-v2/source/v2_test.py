import copy
import json
import math
import sys
import unittest

import numpy as np

from cad_core import ROOT, box, bounds, solid_check
from model import make_design as make_v1_design, resolve_model
from package_packet import featurescript, instance_matrix, mate_frames, sha, transform_solid
from v2_model import PACKET, make_design
from v2_packet import admission, digest, verify_freeze, verify_hashes, verify_v1
from v2_reducer import engineering_report
from validate import graph_checks, hole_checks


class V2Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parameters = json.loads((ROOT / "parameters.json").read_text())
        cls.design = make_design(cls.parameters)
        cls.shapes, cls.placed = resolve_model(cls.design, cls.parameters["baseline"])
        cls.revised, cls.revised_placed = resolve_model(cls.design, cls.parameters["revision"])

    def test_v1_seal_and_failures_unchanged(self):
        self.assertEqual(verify_v1()["status"], "PASS")
        original = json.loads((ROOT / "packet-v1" / "validation.json").read_text())
        self.assertEqual(original["status"], "FAIL")
        self.assertTrue(all(sample["status"] == "FAIL" for result in original["variants"].values() for sample in result["motion"]["samples"]))

    def test_full_sweep_same_sampling_and_all_pairs(self):
        report = json.loads((PACKET / "validation.json").read_text())
        self.assertEqual(report["status"], "PASS")
        for variant in ["baseline", "revision"]:
            samples = report["variants"][variant]["motion"]["samples"]
            self.assertEqual({sample["angleDeg"] for sample in samples}, set(range(-145, 1, 5)) | {-72.5})
            self.assertEqual(len(samples), 31)
            for sample in samples:
                self.assertEqual(sample["pairCount"], math.comb(len(self.design["instances"]), 2))
                self.assertEqual(sample["status"], "PASS")
                self.assertEqual(sample["unexpectedClashes"], [])

    def test_old_exclusions_unchanged_and_new_mesh_only(self):
        original = make_v1_design(self.parameters)["intentionalContactExclusions"]
        self.assertEqual(self.design["intentionalContactExclusions"][:6], original)
        extra = self.design["intentionalContactExclusions"][6:]
        self.assertEqual(len(extra), 1)
        self.assertEqual(extra[0]["pair"], ["deploy_motor_pinion", "deploy_pinion"])
        for entry in self.design["intentionalContactExclusions"]:
            self.assertNotIn("transfer_ramp", entry["pair"])
            self.assertNotIn("pickup_right", entry["pair"])

    def test_current_solids_and_holes_match_stored_validation(self):
        report = json.loads((PACKET / "validation.json").read_text())
        for variant, shapes in [("baseline", self.shapes), ("revision", self.revised)]:
            for name, shape in shapes.items():
                health = solid_check(shape)
                self.assertTrue(health["valid"] and health["closed"])
                self.assertEqual(health["solids"], 1)
                self.assertGreater(health["volumeMm3"], 0)
                self.assertAlmostEqual(health["volumeMm3"], report["variants"][variant]["solids"][name]["volumeMm3"], places=5)
            self.assertTrue(all(entry["status"] == "PASS" for entry in hole_checks(shapes, self.design, self.parameters[variant])))

    def test_repaired_guard_and_continuous_motor_ramp_radial_bound(self):
        self.assertAlmostEqual(self.placed["pickup_gear_guard"].distance(self.placed["pickup_right"]), 1.0375, places=5)
        motor_radius_bound = 71.12 + 23.7
        ramp_radius_bound = math.hypot(148 - 100, 320 - 410)
        self.assertGreater(ramp_radius_bound - motor_radius_bound, 7)
        self.assertEqual(bounds(self.shapes["transfer_ramp"])[0], -195)
        self.assertEqual(bounds(self.shapes["transfer_ramp"])[3], 195)

    def test_graph_reducer_centers_load_and_honest_budget(self):
        report = graph_checks(self.design)
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["nativeInstancesExcludingCoral"], 48)
        self.assertEqual(report["revoluteJoints"], 10)
        self.assertEqual(report["transmissionRelations"], 6)
        self.assertNotIn("deploy_motor_reducer_envelope", self.design["parts"])
        engineering = engineering_report(self.design)
        self.assertEqual(engineering["status"], "UNVERIFIED_BUILD")
        self.assertEqual(engineering["budget"]["status"], "FAIL_CONSERVATIVE_NATIVE_INSTANCE_LIMIT")
        self.assertFalse(engineering["loadBasis"]["impactLoadRating"])
        for stage in engineering["stages"]:
            self.assertAlmostEqual(sum(stage["teeth"]) * stage["moduleMm"] / 2, stage["centerDistanceMm"])
        self.assertEqual(engineering["totalReduction"], 48)

    def test_real_width_revision_and_unchanged_fixed_interfaces(self):
        for name in ["upper_pickup_drum", "lower_pickup_drum", "lower_hex_shaft", "pickup_belt", "pickup_cross_tube"]:
            first, second = bounds(self.shapes[name]), bounds(self.revised[name])
            self.assertAlmostEqual(second[3] - second[0] - first[3] + first[0], 20, places=5)
        self.assertGreater(abs(self.shapes["deploy_output_gear"].Volume() - self.revised["deploy_output_gear"].Volume()), 1)
        for name in ["receiver", "pivot_spine", "cradle", "stage_deck", "tower_left", "deploy_motor"]:
            np.testing.assert_allclose(bounds(self.placed[name]), bounds(self.revised_placed[name]), atol=1e-7)
        original = make_v1_design(self.parameters)
        for role in ["receiver_reference", "bumper_keepout", "chassis_reference", "cradle", "pivot_spine"]:
            self.assertEqual(self.design["parts"][role], original["parts"][role])

    def test_receiver_control_independent(self):
        shapes, placed = resolve_model(self.design, self.parameters["receiverControlProbe"])
        self.assertNotAlmostEqual(shapes["receiver_reference"].Volume(), self.shapes["receiver_reference"].Volume())
        np.testing.assert_allclose(bounds(shapes["upper_pickup_drum"]), bounds(self.shapes["upper_pickup_drum"]), atol=1e-7)
        self.assertAlmostEqual(bounds(placed["receiver"])[2] - bounds(self.placed["receiver"])[2], 30, places=5)

    def test_exported_frames_and_source_neutral_io(self):
        expected = json.loads((PACKET / "expected.json").read_text())
        payload = json.loads((PACKET / "source" / "geometry-payload.json").read_text())
        contract = json.loads((PACKET / "io-contract.json").read_text())
        self.assertEqual(contract["recipeSha256"], digest(self.design["parts"]))
        self.assertEqual(contract["parametersSha256"], digest(self.design["parameters"]))
        self.assertEqual(contract["layoutSha256"], digest(payload["partStudioLayoutOffsetsMm"]))
        frames = {variant: {"poses": {name: pose["instanceTransformsRowMajorMm"] for name, pose in result["poses"].items()}, "mates": result["mateFramesDeployed"]} for variant, result in expected.items()}
        self.assertEqual(contract["neutralPartFrameSha256"], digest(frames))
        for variant, shapes in [("baseline", self.shapes), ("revision", self.revised)]:
            controls = self.parameters[variant]
            for pose, angle in [("deployed", 0), ("mid", -72.5), ("stowed", -145)]:
                direct = resolve_model(self.design, controls, angle)[1]
                for item in self.design["instances"]:
                    matrix = instance_matrix(item, controls, angle, self.parameters["pivotOriginMm"])
                    np.testing.assert_allclose(matrix, expected[variant]["poses"][pose]["instanceTransformsRowMajorMm"][item["id"]], atol=1e-8)
                    np.testing.assert_allclose(bounds(transform_solid(shapes[item["part"]], matrix)), bounds(direct[item["id"]]), atol=1e-5)
                self.assertTrue(all(entry["coincidenceError"] < 1e-8 for entry in mate_frames(self.design, controls, angle)))
            for name, entry in expected[variant]["parts"].items():
                self.assertEqual(sha(PACKET / variant / entry["neutralStep"]), entry["sha256"])
                self.assertEqual(entry["roundTrip"], "PASS")

    def test_generated_source_and_ui_replay(self):
        source, layout = featurescript(self.design)
        self.assertEqual(source, (PACKET / "source" / "concept-a.fs").read_text())
        self.assertEqual(len(layout), len(self.design["parts"]))
        self.assertIn('"includeCotsEnvelopes" : false', source)
        self.assertIn('"includeCoralReference" : false', source)
        self.assertNotIn("deploy_motor_reducer_envelope", source)
        ui = json.loads((PACKET / "ui-edit-map.json").read_text())
        old_ui = json.loads((ROOT / "packet-v1" / "ui-edit-map.json").read_text())
        self.assertEqual(ui["controls"], old_ui["controls"])

    def test_nonblank_previews_and_roundtrips(self):
        expected = json.loads((PACKET / "expected.json").read_text())
        self.assertEqual(len(list(PACKET.rglob("*.step"))), 62)
        for result in expected.values():
            for pose in result["poses"].values():
                self.assertEqual(pose["solidCount"], 49)
                self.assertGreater(pose["previewCheck"]["nonBackgroundPixels"], 100000)
                self.assertGreater(pose["previewCheck"]["colorCount"], 50)

    def test_admission_and_cots_remain_separate(self):
        report = json.loads((PACKET / "admission.json").read_text())
        self.assertEqual(report["localGeometry"], "PASS")
        self.assertEqual(report["authenticCots"], "PENDING_PARENT_MANIFEST")
        self.assertEqual(report["status"], "BLOCKED")
        self.assertEqual(report["nonVendorBuild"], "UNVERIFIED_BUILD")
        self.assertFalse(report["mechanicallyReleased"])
        if (PACKET / "freeze.json").exists():
            self.assertEqual(admission(), report)
            manifest = verify_freeze()
            corrupted = copy.deepcopy(manifest)
            corrupted["artifactSha256"]["source/concept-a.fs"] = "0" * 64
            with self.assertRaises(ValueError):
                verify_freeze(corrupted)
        with self.assertRaises(ValueError):
            verify_hashes(PACKET, {"../outside.json": "0" * 64})

    def test_kernel_collision_sentinel(self):
        self.assertAlmostEqual(box([10, 10, 10], [0, 0, 0]).intersect(box([10, 10, 10], [5, 0, 0])).Volume(), 500, places=6)


if __name__ == "__main__":
    if "--admission" in sys.argv:
        report = admission()
        print(json.dumps(report, indent=2))
        raise SystemExit(2 if report["status"] == "BLOCKED" else 0)
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(V2Tests))
    summary = {"status": "PASS" if result.wasSuccessful() else "FAIL", "testsRun": result.testsRun, "failures": len(result.failures), "errors": len(result.errors), "skipped": len(result.skipped), "scope": "Local geometry, frame/source/export integrity and truthful blocked admission; not mechanical release or COTS acceptance"}
    destination = ROOT / "tests-v2.json" if (PACKET / "freeze.json").exists() else PACKET / "tests.json"
    destination.write_text(json.dumps(summary, indent=2) + "\n")
    raise SystemExit(0 if result.wasSuccessful() else 1)