import itertools
import json
import math
import sys
import time

from cad_core import ROOT, bounds, cq, deploy, solid_check
from model import make_design, resolve_model, value


def boxes_overlap(first, second):
    return all(min(first[index + 3], second[index + 3]) - max(first[index], second[index]) > 1e-6 for index in range(3))


def hole_checks(shapes, design, controls):
    checks = []
    for name, part in design["parts"].items():
        shape = shapes[name]
        for entry in part["holeInterfaces"]:
            center = value(entry["centerMm"], controls)
            radius = entry["diameterMm"] / 2
            axis_index = 0 if entry["axis"] == "x" else 2
            radial_indices = [index for index in range(3) if index != axis_index]
            samples = []
            for axial_fraction in [-0.45, 0, 0.45]:
                for phase in [0, 90, 180, 270]:
                    point = list(center)
                    point[axis_index] += axial_fraction * entry["throughLengthMm"]
                    point[radial_indices[0]] += 0.98 * radius * math.cos(math.radians(phase))
                    point[radial_indices[1]] += 0.98 * radius * math.sin(math.radians(phase))
                    samples.append(not shape.isInside(cq.Vector(*point), 1e-6))
            probe_status = all(samples)
            matching_cylinders = []
            from OCP.BRepAdaptor import BRepAdaptor_Surface
            for face in shape.Faces():
                if face.geomType() != "CYLINDER":
                    continue
                surface = BRepAdaptor_Surface(face.wrapped, True).Cylinder()
                location = surface.Axis().Location()
                coordinates = [location.X(), location.Y(), location.Z()]
                direction = surface.Axis().Direction()
                components = [direction.X(), direction.Y(), direction.Z()]
                if abs(surface.Radius() - radius) < 1e-5 and abs(components[axis_index]) > 0.999999 and all(abs(coordinates[index] - center[index]) < 1e-5 for index in radial_indices):
                    matching_cylinders.append(face.Area())
            checks.append({"part": name, "interface": entry["id"], "diameterMm": 2 * radius, "cylindricalFaces": len(matching_cylinders), "emptyBoreSamples": sum(samples), "sampleCount": len(samples), "status": "PASS" if probe_status and matching_cylinders else "FAIL"})
    return checks


def motion_check(design, controls, quick=False):
    shapes, deployed = resolve_model(design, controls)
    records = {item["id"]: item for item in design["instances"]}
    movable = {name for name, item in records.items() if item["motionGroup"] in {"pickup", "pickup_input"}}
    exclusion_map = {tuple(entry["pair"]): entry for entry in design["intentionalContactExclusions"]}
    angles = [0, -72.5, -145] if quick else sorted(set(range(-145, 1, 5)) | {-72.5})
    samples, memo = [], {}
    for angle in angles:
        placed = {name: shape.translate(tuple(-coordinate for coordinate in design["parameters"]["pivotOriginMm"])) if name in movable else shape for name, shape in deployed.items()}
        placed = {name: deploy(shape, angle, design["parameters"]["pivotOriginMm"]) if name in movable else shape for name, shape in placed.items()}
        boxes = {name: bounds(shape) for name, shape in placed.items()}
        unexpected, intentional = [], []
        tested = 0
        for first, second in itertools.combinations(sorted(placed), 2):
            pair = (first, second)
            same_motion = (first in movable) == (second in movable)
            if same_motion and pair in memo:
                overlap = memo[pair]
            elif not boxes_overlap(boxes[first], boxes[second]):
                overlap = 0
            else:
                overlap = max(0, placed[first].intersect(placed[second]).Volume())
                tested += 1
            if same_motion:
                memo[pair] = overlap
            if overlap > 1e-4:
                entry = {"pair": list(pair), "overlapMm3": overlap}
                permission = exclusion_map.get(pair)
                if permission and overlap <= permission["maximumAllowedIntersectionMm3"]:
                    intentional.append({**entry, "reason": permission["reason"]})
                else:
                    unexpected.append(entry)
        mechanism_names = [name for name in placed if name not in {"bumper", "held_coral"}]
        mechanism_bounds = [min(boxes[name][index] for name in mechanism_names) for index in range(3)] + [max(boxes[name][index + 3] for name in mechanism_names) for index in range(3)]
        front_extension = max(0, -mechanism_bounds[1])
        side_extension = max(0, -350 - mechanism_bounds[0], mechanism_bounds[3] - 350)
        rear_extension = max(0, mechanism_bounds[4] - 760)
        envelope_okay = max(front_extension, side_extension, rear_extension) <= 457.2 and mechanism_bounds[2] >= -1e-6
        if angle == -145:
            envelope_okay = envelope_okay and max(front_extension, side_extension, rear_extension) <= 1e-6 and mechanism_bounds[5] <= 1066.8
        nearest_bumper = min((placed[name].distance(placed["bumper"]), name) for name in movable)
        samples.append({"angleDeg": angle, "status": "PASS" if not unexpected and envelope_okay else "FAIL", "unexpectedClashes": unexpected, "intentionalContacts": intentional, "pairCount": len(records) * (len(records) - 1) // 2, "kernelIntersectionComputations": tested, "envelopeStatus": "PASS" if envelope_okay else "FAIL", "mechanismBoundsMm": mechanism_bounds, "frontExtensionMm": front_extension, "sideExtensionMm": side_extension, "rearExtensionMm": rear_extension, "minimumMovingToBumperMm": nearest_bumper[0], "nearestBumperPart": nearest_bumper[1]})
    return {"status": "PASS" if all(entry["status"] == "PASS" for entry in samples) else "FAIL", "sampledNotContinuousProof": True, "incrementDeg": 5 if not quick else None, "samples": samples}, shapes


def graph_checks(design):
    identities = {item["id"] for item in design["instances"]}
    children = [joint["child"] for joint in design["joints"]]
    parents = {joint["child"]: joint["parent"] for joint in design["joints"]}
    valid = len(children) == len(set(children)) == len(identities) - 1
    for child in identities - {"chassis"}:
        visited = set()
        while child != "chassis":
            if child in visited or child not in parents:
                valid = False
                break
            visited.add(child)
            child = parents[child]
    return {"status": "PASS" if valid else "FAIL", "instancesIncludingCoral": len(identities), "nativeInstancesExcludingCoral": len(identities) - 1, "treeMatesIncludingReference": len(children), "revoluteJoints": len([joint for joint in design["joints"] if joint["type"] == "REVOLUTE"]), "transmissionRelations": len(design["relations"]), "nativeExecution": "UNVERIFIED_LOCAL_CONTRACT_ONLY"}


def main():
    started = time.perf_counter()
    parameters = json.loads((ROOT / "parameters.json").read_text())
    design = make_design(parameters)
    quick = "--quick" in sys.argv
    variants = ["baseline"] if quick else ["baseline", "revision"]
    report = {"apiCalls": 0, "source": "LOCAL_CADQUERY_NOT_ONSHAPE", "graph": graph_checks(design), "variants": {}, "physicalCoralContact": "UNVERIFIED", "continuousMotion": "UNVERIFIED_SAMPLED_ONLY"}
    for variant in variants:
        motion, shapes = motion_check(design, parameters[variant], quick)
        holes = hole_checks(shapes, design, parameters[variant])
        solids = {name: solid_check(shape) for name, shape in shapes.items()}
        report["variants"][variant] = {"motion": motion, "holes": holes, "solids": solids, "status": "PASS" if motion["status"] == "PASS" and all(entry["status"] == "PASS" for entry in holes) and all(entry["valid"] and entry["closed"] and entry["solids"] == 1 and entry["volumeMm3"] > 0 for entry in solids.values()) else "FAIL"}
    report["status"] = "PASS" if report["graph"]["status"] == "PASS" and all(entry["status"] == "PASS" for entry in report["variants"].values()) else "FAIL"
    report["wallSeconds"] = time.perf_counter() - started
    path = ROOT / ("validation-quick.json" if quick else "validation.json")
    path.write_text(json.dumps(report, indent=2) + "\n")
    unique_failures = {}
    for result in report["variants"].values():
        for sample in result["motion"]["samples"]:
            for clash in sample["unexpectedClashes"]:
                key = tuple(clash["pair"])
                unique_failures.setdefault(key, {**clash, "angles": []})["angles"].append(sample["angleDeg"])
    print(json.dumps({"status": report["status"], "graph": report["graph"], "uniqueClashes": list(unique_failures.values()), "badHoles": [entry for result in report["variants"].values() for entry in result["holes"] if entry["status"] == "FAIL"], "envelopeFailures": [{"variant": name, "angle": sample["angleDeg"], "bounds": sample["mechanismBoundsMm"]} for name, result in report["variants"].items() for sample in result["motion"]["samples"] if sample["envelopeStatus"] != "PASS"], "wallSeconds": report["wallSeconds"]}, indent=2))
    if report["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()