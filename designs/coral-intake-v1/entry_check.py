import json
import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, cq, parameters
from model import hollow_tube, location


def floor_entry_clearance(member_yz, half_size=10):
    radius = parameters()["coral"]["od"] / 2
    minimum = float("inf")
    witness = None
    for step in range(1201):
        center_y = -450 + step * 0.25
        horizontal = max(abs(center_y - member_yz[0]) - half_size, 0)
        vertical = max(abs(radius - member_yz[1]) - half_size, 0)
        clearance = math.hypot(horizontal, vertical) - radius
        if clearance < minimum:
            minimum, witness = clearance, center_y
    return {"minimum_clearance_mm": minimum, "witness_center_y_mm": witness,
            "sample_step_mm": 0.25, "between_sample_distance_bound_mm": 0.125,
            "lower_bound_mm": minimum - 0.125, "pass": minimum - 0.125 >= 5}


def check_original_brep():
    manifest = json.loads((ROOT / "checkpoint/manifest.json").read_text())
    part = next(part for part in manifest["instances"] if part["id"] == "pickup_crossmember_0")
    definition = manifest["definitions"][part["definition"]]
    source = cq.importers.importStep(str(ROOT / "checkpoint" / definition["step"])).val()
    from OCP.gp import gp_Trsf
    transform = gp_Trsf()
    transform.SetValues(*[value for row in part["matrix"][:3] for value in row])
    member = source.moved(cq.Location(transform))
    settings = parameters()["coral"]
    center = (0, -365, settings["od"] / 2)
    from geometry import cylinder
    pipe = cylinder(settings["od"] / 2, settings["length"], center, (1, 0, 0)).cut(
        cylinder(settings["bore"] / 2, settings["length"] + 2, center, (1, 0, 0)))
    intersection = member.intersect(pipe).Volume()
    return {"part": part["id"], "coral_center_mm": center, "intersection_mm3": intersection,
            "obstruction_reproduced": intersection > 1}


if __name__ == "__main__":
    original = check_original_brep()
    old = floor_entry_clearance((-310, 44))
    candidate = floor_entry_clearance((-215, 320))
    if not original["obstruction_reproduced"] or old["pass"] or not candidate["pass"]:
        raise AssertionError("Entry obstruction or relocation hypothesis not confirmed")
    print(json.dumps({"original_brep": original, "old_member": old, "candidate_overhead_member": candidate,
                      "scope": "Centered crosswise floor approach only; not full acquisition/contact proof"}, indent=2))