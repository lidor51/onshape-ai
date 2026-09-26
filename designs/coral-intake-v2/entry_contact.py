import json
import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pickup import ROOT, build, coral, centers, separation, bounds, sha256


def run():
    pickup = build()
    star_instances = [part for part in pickup.instances if part["id"].startswith("star_front_") and part["category"] == "outer_elastomer"]
    hard_instances = [part for part in pickup.instances if part["category"] != "outer_elastomer"]
    star_shapes = [(part["id"], pickup.posed(part)) for part in star_instances]
    hard_shapes = [(part["id"], pickup.posed(part)) for part in hard_instances]
    extents = {name: bounds(shape) for name, shape in star_shapes + hard_shapes}
    kicker = centers(pickup.config)["kick"]
    pipe_radius, kick_radius = 57.15, 25.5
    kick_contact_y = kicker[0] - math.sqrt((pipe_radius + kick_radius) ** 2 - (pipe_radius - kicker[1]) ** 2)
    rows = []
    for yaw in (0, 30, 60, 90):
        direction_y = abs(math.cos(math.radians(yaw)))
        support_y = 301.625 / 2 * direction_y + pipe_radius * math.sqrt(1 - direction_y ** 2)
        first_y = -261 - support_y - 70
        contact = None
        obstruction = None
        for step in range(60):
            center_y = first_y + step * 4
            if center_y > kick_contact_y + 4:
                break
            piece = coral((0, center_y, pipe_radius), yaw)
            piece_bounds = bounds(piece)
            for name, shape in hard_shapes:
                if separation(piece_bounds, extents[name]) <= 0:
                    volume = piece.intersect(shape).Volume()
                    if volume > 0.01:
                        obstruction = {"part": name, "center_y_mm": center_y, "overlap_mm3": volume}
                        break
            if obstruction:
                break
            for name, shape in star_shapes:
                if separation(piece_bounds, extents[name]) <= 0:
                    volume = piece.intersect(shape).Volume()
                    if volume > 0.01:
                        contact = {"part": name, "center_y_mm": center_y, "unloaded_overlap_mm3": volume}
                        break
            if contact:
                break
        rows.append({"yaw_deg": yaw, "contact": contact, "hard_obstruction_before_contact": obstruction,
                     "status": "GEOMETRIC_CONTACT_WITNESS" if contact and not obstruction else "BLOCKED_OR_NO_WITNESS"})
    result = {"status": "SCOPED_CONTACT_WITNESSES" if all(row["contact"] and not row["hard_obstruction_before_contact"] for row in rows) else "FAIL",
              "pickup_source_sha256": sha256(ROOT / "pickup.py"), "approach_step_mm": 4,
              "crosswise_circular_kicker_first_contact_center_y_mm": kick_contact_y,
              "rows": rows,
              "scope": "Centered horizontal pipe, four yaw angles, fixed unloaded star phase. Stops at first soft contact. Not traction, compression, complete feed, offset/pitch or floating motion verification."}
    (ROOT / "entry-contact.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    result = run()
    sys.exit(0 if result["status"] == "SCOPED_CONTACT_WITNESSES" else 1)