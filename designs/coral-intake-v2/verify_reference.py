from collections import Counter
import argparse
import json
from pathlib import Path
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pickup


def pair_key(model, instance, reference, fold, floating):
    pose = pickup.matrix(pickup.instance_pose(model, instance, fold, floating))
    moving_key = (instance["definition"], tuple(value for row in pose for value in row))
    if reference.get("geometry") == "box":
        fixed_key = ("box", tuple(reference["bounds_mm"]))
    else:
        fixed_key = (reference.get("definition", reference["id"]),
                     tuple(value for row in reference.get("matrix", []) for value in row))
    return moving_key, fixed_key


class ReferenceResolver:
    def __init__(self, model, max_exact_checks=200, max_seconds=600):
        if not 0 <= max_exact_checks <= 200 or not 0 < max_seconds <= 600:
            raise ValueError("Reference verification is capped at 200 exact operations and 600 seconds")
        self.model = model
        self.instances = {entry["id"]: entry for entry in model.instances}
        self.manifest, references = pickup.reference_data()
        self.references = {entry["id"]: entry for entry in references}
        self.fixed_shapes = {}
        self.moving_shapes = {}
        self.results = {}
        self.max_exact_checks = max_exact_checks
        self.max_seconds = max_seconds
        self.started = time.monotonic()
        self.exact_checks = 0
        self.boolean_checks = 0
        self.distance_checks = 0
        self.cache_reuses = 0
        self.candidate_calls = 0

    def available(self):
        return self.exact_checks < self.max_exact_checks and time.monotonic() - self.started < self.max_seconds

    def check(self, candidate):
        self.candidate_calls += 1
        result = self._check(candidate)
        if self.candidate_calls % 10 == 0:
            print(json.dumps({"phase": "reference_progress", "candidate_calls": self.candidate_calls,
                              "exact_operations": self.exact_checks, "booleans": self.boolean_checks,
                              "cache_reuses": self.cache_reuses, "elapsed_seconds": round(time.monotonic() - self.started, 2)}), flush=True)
        return result

    def _check(self, candidate):
        reference = self.references[candidate["reference"]]
        if reference.get("geometry") == "envelope_only":
            return {"status": "UNCERTAIN_ENVELOPE_ONLY", "geometry_basis": "Assumed bracket envelope, not CAD",
                    "retained_interface": "Pivot support attachment needs a specified bore, retention and bracket geometry" if candidate["intended_attachment"] else "Moving-part bracket clearance unresolved",
                    "intended_attachment_is_collision_waiver": False}
        instance = self.instances[candidate["part"]]
        key = pair_key(self.model, instance, reference, candidate["fold_deg"], candidate["float_deg"])
        if key in self.results:
            self.cache_reuses += 1
            return dict(self.results[key], reused_identical_shape_and_matrix=True)
        if not self.available():
            return {"status": "UNCERTAIN_BUDGET", "reason": "Exact-operation or elapsed-time scheduling cap"}
        try:
            if key[1] not in self.fixed_shapes:
                if reference.get("geometry") == "box":
                    extent = reference["bounds_mm"]
                    obstacle = pickup.box([extent[index + 3] - extent[index] for index in range(3)],
                                          [(extent[index] + extent[index + 3]) / 2 for index in range(3)])
                else:
                    obstacle = pickup.reference_shape(reference["definition"])
                    if obstacle is None:
                        return {"status": "UNCERTAIN_NO_SOURCE_GEOMETRY"}
                    obstacle = obstacle.moved(pickup.from_matrix(reference["matrix"]))
                self.fixed_shapes[key[1]] = obstacle
            if key[0] not in self.moving_shapes:
                self.moving_shapes[key[0]] = self.model.posed(instance, candidate["fold_deg"], candidate["float_deg"])
            moving = self.moving_shapes[key[0]]
            obstacle = self.fixed_shapes[key[1]]
            if not moving.isValid() or not obstacle.isValid():
                result = {"status": "UNCERTAIN_INVALID_SOURCE_GEOMETRY"}
            elif not self.available():
                result = {"status": "UNCERTAIN_BUDGET"}
            else:
                self.exact_checks += 1
                self.distance_checks += 1
                distance = moving.distance(obstacle)
                result = {"exact_distance_mm": distance, "geometry_basis": reference.get("geometry", "hash_verified_source_brep")}
                if distance > 1e-6:
                    result.update({"status": "EXACT_CLEAR_AT_SAMPLE", "exact_overlap_mm3": 0.0,
                                   "method": "Exact BRep minimum distance exceeds tolerance; no boolean needed"})
                elif not self.available():
                    result["status"] = "UNCERTAIN_BUDGET"
                else:
                    self.exact_checks += 1
                    self.boolean_checks += 1
                    common = moving.intersect(obstacle)
                    if not common.isValid():
                        result["status"] = "UNCERTAIN_INVALID_BOOLEAN"
                    else:
                        volume = common.Volume()
                        result.update({"status": "FAIL_EXACT_COLLISION" if volume > 1e-4 else "EXACT_CLEAR_AT_SAMPLE",
                                       "exact_overlap_mm3": volume, "intersection_solids": len(common.Solids()),
                                       "intersection_bounds_mm": pickup.bounds(common) if len(common.Solids()) else None,
                                       "method": "Exact BRep minimum distance and common volume; zero volume may include touching"})
        except Exception as error:
            result = {"status": "UNCERTAIN_BOOLEAN_ERROR", "error": type(error).__name__ + ": " + str(error)}
        result["tested_candidate"] = {name: candidate[name] for name in ("part", "reference", "fold_deg", "float_deg")}
        self.results[key] = result
        return dict(result)

    def resolve(self, candidates):
        ranked = sorted(enumerate(candidates), key=lambda indexed: (
            self.references[indexed[1]["reference"]].get("geometry") != "box",
            self.references[indexed[1]["reference"]].get("geometry") == "envelope_only",
            indexed[1]["aabb_overlap_mm3"]))
        outcomes = [None] * len(candidates)
        for index, candidate in ranked:
            outcomes[index] = dict(candidate, original_status=candidate["status"])
            outcomes[index].update(self.check(candidate))
            outcomes[index]["moving_definition"] = self.instances[candidate["part"]]["definition"]
            outcomes[index]["moving_matrix"] = pickup.matrix(pickup.instance_pose(
                self.model, self.instances[candidate["part"]], candidate["fold_deg"], candidate["float_deg"]))
        counts = dict(Counter(entry["status"] for entry in outcomes))
        collisions = [entry for entry in outcomes if entry["status"] == "FAIL_EXACT_COLLISION"]
        uncertain = [entry for entry in outcomes if entry["status"].startswith("UNCERTAIN")]
        return {"schema": "pickup-reference-resolution/1", "units": "mm",
                "status": "FAIL_EXACT_COLLISION" if collisions else "UNCERTAIN" if uncertain else "CLEAR_AT_SAMPLES_ONLY",
                "summary": {"candidates": len(candidates), "initially_uncertain": sum(entry["status"].startswith("UNCERTAIN") for entry in candidates),
                            "outcomes": counts, "exact_operations": self.exact_checks, "distance_checks": self.distance_checks,
                            "boolean_checks": self.boolean_checks, "unique_shape_pose_pairs": len(self.results),
                            "cache_reuses": self.cache_reuses, "exact_operation_limit": self.max_exact_checks,
                            "elapsed_seconds": time.monotonic() - self.started, "scheduling_seconds_limit": self.max_seconds},
                "scope": "Every reported broad-phase candidate retained; sample poses only, not continuous motion. Solid CAD, box models and assumed bracket envelopes distinguished. No attachment collision waiver.",
                "budget_scope": "Distance and common each count as one exact operation, including initial pose checks. No new kernel operation starts after the deadline; an in-flight OCCT operation cannot be preempted.",
                "source_definition_cache": pickup.reference_shape.cache_info()._asdict(),
                "collisions": collisions, "remaining_uncertain": uncertain, "candidates": outcomes}

    def write(self, resolution):
        baseline = json.loads((pickup.OUTPUT / "frozen-v1.json").read_text(encoding="utf8"))
        after = pickup.frozen_hashes()
        resolution["v1_frozen"] = {"file_count": len(after), "unchanged": baseline == after and len(after) == 305}
        resolution["bindings"] = {"pickup_report_sha256": pickup.sha256(pickup.ROOT / "pickup-report.json"),
                                  "assembly_sha256": pickup.sha256(pickup.OUTPUT / "assembly.step"),
                                  "mesh_sha256": pickup.sha256(pickup.OUTPUT / "pickup-mesh.json"),
                                  "reference_manifest_sha256": pickup.sha256(pickup.V1 / "checkpoint/manifest.json"),
                                  "pickup_source_sha256": pickup.sha256(pickup.ROOT / "pickup.py"),
                                  "verifier_source_sha256": pickup.sha256(Path(__file__))}
        pickup.write_json(pickup.OUTPUT / "final-reference-resolution.json", resolution)
        print(json.dumps({"phase": "reference_resolution", "status": resolution["status"], "summary": resolution["summary"],
                          "v1_frozen": resolution["v1_frozen"]}), flush=True)


def resume_resolution():
    report_path = pickup.ROOT / "pickup-report.json"
    report = json.loads(report_path.read_text(encoding="utf8"))
    previous = json.loads((pickup.OUTPUT / "final-reference-resolution.json").read_text(encoding="utf8"))
    for name, path in (("pickup_report_sha256", report_path), ("assembly_sha256", pickup.OUTPUT / "assembly.step"),
                       ("mesh_sha256", pickup.OUTPUT / "pickup-mesh.json"),
                       ("reference_manifest_sha256", pickup.V1 / "checkpoint/manifest.json")):
        if previous["bindings"][name] != pickup.sha256(path):
            raise ValueError("Cannot resume against changed geometry artifacts: " + name)
    frozen = json.loads((pickup.OUTPUT / "frozen-v1.json").read_text(encoding="utf8"))
    if len(frozen) != 305 or pickup.frozen_hashes() != frozen:
        raise ValueError("Frozen v1 changed")
    snapshot = pickup.archive_generated()
    mesh = json.loads((pickup.OUTPUT / "pickup-mesh.json").read_text(encoding="utf8"))
    model = pickup.Pickup(mesh["settings"])
    model.instances = [{key: value for key, value in instance.items() if key != "matrix"}
                       | {"pose": pickup.from_matrix(instance["matrix"])} for instance in mesh["instances"]]
    instances = {entry["id"]: entry for entry in model.instances}
    needed = {instances[entry["part"]]["definition"] for entry in previous["candidates"]
              if entry["status"].startswith("UNCERTAIN") and entry["status"] != "UNCERTAIN_ENVELOPE_ONLY"}
    for definition in needed:
        metadata = mesh["definitions"][definition]
        path = (pickup.OUTPUT / metadata["step"]).resolve()
        if not path.is_relative_to(pickup.OUTPUT) or pickup.sha256(path) != metadata["step_sha256"]:
            raise ValueError("Exported moving definition changed")
        shape = pickup.cq.importers.importStep(str(path)).val()
        model.define(definition, shape, metadata["category"])
    resolver = ReferenceResolver(model)
    resolver.exact_checks = previous["summary"]["exact_operations"]
    resolver.distance_checks = previous["summary"]["distance_checks"]
    resolver.boolean_checks = previous["summary"]["boolean_checks"]
    resolver.started -= previous["summary"]["elapsed_seconds"]
    for candidate in previous["candidates"]:
        if candidate["status"] not in ("EXACT_CLEAR_AT_SAMPLE", "FAIL_EXACT_COLLISION"):
            continue
        key = pair_key(model, instances[candidate["part"]], resolver.references[candidate["reference"]],
                       candidate["fold_deg"], candidate["float_deg"])
        resolver.results[key] = {name: candidate[name] for name in (
            "status", "exact_distance_mm", "exact_overlap_mm3", "geometry_basis", "method",
            "intersection_solids", "intersection_bounds_mm", "tested_candidate") if name in candidate}
    resolution = resolver.resolve(report["poses"]["overlapping_pairs"])
    resolution["resumed_from"] = {"snapshot": snapshot, "previous_exact_operations": previous["summary"]["exact_operations"],
                                  "geometry_rebuilt": False, "moving_definitions_imported_once": sorted(needed),
                                  "reuse_basis": "Hash-identical report, STEP, mesh and reference manifest; prior exact results retained"}
    report["reference_resolution"].update({"status": resolution["status"], "summary": resolution["summary"]})
    pickup.write_json(report_path, report)
    resolver.write(resolution)
    return 1 if resolution["status"] != "CLEAR_AT_SAMPLES_ONLY" else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--resume", action="store_true")
    arguments = parser.parse_args()
    raise SystemExit(resume_resolution() if arguments.resume else pickup.run_build(verify_references=True))