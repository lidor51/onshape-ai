import itertools
import json
import time

import numpy as np

from cad_core import bounds, cq, solid_check
from package_packet import transform_solid, write_json
from v3_contract import digest
from v3_model import PACKET, make_design, neutral_shapes, pose_matrix
from v3_sources import sha
from validate import boxes_overlap, graph_checks, hole_checks


def validate(quick=False, export_callback=None):
    started = time.perf_counter()
    design = make_design()
    report = {"apiCalls": 0, "graph": graph_checks(design), "variants": {}, "scope": "All unordered body-instance pairs, including diagnostic references. Sampled deployment with synchronized -6/48 gear rotations. Not continuous dynamics or manufacturing release.", "gearPairExemptions": [], "ordinaryShaftBearingExemptions": []}
    report["modelSha256"] = digest(design)
    report["roundTripRequired"] = export_callback is not None
    angles = [0, -72.5, -145] if quick else sorted(set(range(-145, 1, 5)) | {-72.5})
    for variant in ["baseline", "revision"]:
        controls = design["parameters"][variant]
        shapes = neutral_shapes(design, controls)
        solids = {name: solid_check(shape) for name, shape in shapes.items()}
        holes = hole_checks(shapes, design, controls)
        samples = []
        cache = {}
        original_internal = shapes["cots_x44_main"].intersect(shapes["cots_x44_rear_cover"]).Volume()
        press = {tuple(entry["pair"]): entry for entry in design["declaredPressInterfaces"]}
        for angle in angles:
            frames = {item["id"]: pose_matrix(item, controls, angle, design["parameters"]["pivotOriginMm"]) for item in design["instances"]}
            placed = {item["id"]: transform_solid(shapes[item["part"]], frames[item["id"]]) for item in design["instances"]}
            boxes = {name: bounds(shape) for name, shape in placed.items()}
            unexpected, contacts, internal = [], [], []
            calculations = 0
            for first, second in itertools.combinations(sorted(placed), 2):
                relative = np.linalg.inv(frames[first]) @ frames[second]
                key = (first, second, tuple(np.round(relative.flatten(), 7)))
                if key in cache:
                    overlap = cache[key]
                elif not boxes_overlap(boxes[first], boxes[second]):
                    overlap = 0
                else:
                    intersection = placed[first].intersect(placed[second])
                    if not intersection.isValid():
                        raise ValueError("Invalid intersection: " + first + " / " + second)
                    overlap = max(0, intersection.Volume())
                    calculations += 1
                cache[key] = overlap
                if overlap <= 1e-4:
                    continue
                entry = {"pair": [first, second], "overlapMm3": overlap}
                if second == first + "_rear_cover" and first.endswith("_motor") and abs(overlap - original_internal) < 1e-4:
                    internal.append({**entry, "classification": "UNCHANGED_VENDOR_INTERNAL_BODY_INTERFACE", "sourceMeasuredOverlapMm3": original_internal})
                elif (first, second) in press and overlap <= press[(first, second)]["maximumAllowedIntersectionMm3"]:
                    contacts.append({**entry, **press[(first, second)]})
                else:
                    unexpected.append(entry)
            names = [name for name in placed if name not in {"held_coral", "bumper"}]
            envelope = [min(boxes[name][index] for name in names) for index in range(3)] + [max(boxes[name][index + 3] for name in names) for index in range(3)]
            extension = max(0, -envelope[1], -350 - envelope[0], envelope[3] - 350, envelope[4] - 760)
            envelope_okay = extension <= 457.2 and envelope[2] >= -1e-6
            if angle == -145:
                envelope_okay = envelope_okay and extension <= 1e-6 and envelope[5] <= 1066.8
            sample = {"angleDeg": angle, "pairCount": len(placed) * (len(placed) - 1) // 2, "kernelIntersectionComputations": calculations, "unexpectedClashes": unexpected, "declaredWheelPressContacts": contacts, "originalVendorInternalInterfaces": internal, "boundsMm": envelope, "extensionMm": extension, "envelopeStatus": "PASS" if envelope_okay else "FAIL", "status": "PASS" if not unexpected and envelope_okay else "FAIL"}
            moving = [name for name, item in ((item["id"], item) for item in design["instances"]) if item["motionGroup"] in {"pickup", "pickup_input"}]
            nearest = min((placed[name].distance(placed["bumper"]), name) for name in moving)
            sample.update(minimumMovingToBumperMm=nearest[0], nearestBumperPart=nearest[1])
            if export_callback is not None:
                sample["stepRoundTrip"] = export_callback(design, variant, angle, shapes, frames, placed)
                if sample["stepRoundTrip"]["status"] != "PASS":
                    sample["status"] = "FAIL"
            samples.append(sample)
            print(variant, angle, sample["status"], json.dumps(unexpected), flush=True)
        okay = all(entry["status"] == "PASS" for entry in samples + holes) and all(entry["valid"] and entry["closed"] and entry["solids"] == 1 for entry in solids.values())
        report["variants"][variant] = {"status": "PASS" if okay else "FAIL", "solids": solids, "holes": holes, "samples": samples}
    report["status"] = "PASS" if report["graph"]["status"] == "PASS" and all(entry["status"] == "PASS" for entry in report["variants"].values()) else "FAIL"
    report["wallSeconds"] = time.perf_counter() - started
    write_json(PACKET / ("validation-quick.json" if quick else "validation.json"), report)
    return report


if __name__ == "__main__":
    import sys
    result = validate("--quick" in sys.argv)
    raise SystemExit(0 if result["status"] == "PASS" else 1)