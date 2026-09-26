import json
import math
from functools import lru_cache
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]


def deny_network(event, arguments):
    if event.startswith("socket.") and event != "socket.gethostname":
        raise PermissionError("Offline CAD package: network disabled")
    if event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:
        raise PermissionError("Offline CAD package: child processes disabled")


sys.addaudithook(deny_network)

import cadquery as cq


def parameters():
    return json.loads((ROOT / "params.json").read_text())


def box(size, center):
    origin = [center[index] - size[index] / 2 for index in range(3)]
    return cq.Solid.makeBox(*size, cq.Vector(*origin))


def cylinder(radius, length, center, axis=(0, 0, 1)):
    start = [center[index] - length * axis[index] / 2 for index in range(3)]
    return cq.Solid.makeCylinder(radius, length, cq.Vector(*start), cq.Vector(*axis))


def hex_shaft(across_flats, length):
    radius = across_flats / math.sqrt(3)
    points = [(radius * math.cos(math.radians(60 * index)), radius * math.sin(math.radians(60 * index))) for index in range(6)]
    return cq.Workplane("XY", origin=(0, 0, -length / 2)).polyline(points).close().extrude(length).val()


@lru_cache(maxsize=16384)
def bounds(shape):
    bound = shape.BoundingBox()
    return [bound.xmin, bound.ymin, bound.zmin, bound.xmax, bound.ymax, bound.zmax]


def rotate_pickup(shape, angle, settings):
    pivot = (0, *settings["pickup"]["pivot_yz"])
    return shape.rotate(pivot, (1, *pivot[1:]), angle)


def reference_boxes(settings):
    bumper = settings["bumper"]
    bumper_shape = box([bumper[axis][1] - bumper[axis][0] for axis in "xyz"], [sum(bumper[axis]) / 2 for axis in "xyz"])
    chassis = settings["chassis"]
    frame = box([chassis["width"], 25, 40], [0, 12.5, 45])
    return {"bumper": bumper_shape, "frame_front": frame}


def probe():
    settings = parameters()
    obstacles = reference_boxes(settings)
    samples = []
    for angle in range(0, -121, -5):
        for roller in settings["pickup"]["rollers"]:
            shape = cylinder(roller["od"] / 2, settings["pickup"]["roller_width"], [0, *roller["yz"]], (1, 0, 0))
            moved = rotate_pickup(shape, angle, settings)
            extent = bounds(moved)
            overlaps = {name: moved.intersect(obstacle).Volume() for name, obstacle in obstacles.items()}
            okay = max(overlaps.values()) < 1e-5 and extent[2] >= settings["limits"]["minimum_floor"] and extent[1] >= -settings["limits"]["extension"]
            if angle == -120:
                okay = okay and extent[1] >= 0 and extent[4] <= 760 and extent[0] >= -350 and extent[3] <= 350
            samples.append({"roller": roller["id"], "angle": angle, "bounds": extent, "overlap_mm3": overlaps, "pass": okay})
    result = {"status": "PASS" if all(sample["pass"] for sample in samples) else "FAIL", "scope": "roller cylinders only, not complete mechanism or contact proof", "cadquery": cq.__version__, "samples": samples}
    (ROOT / "initial-probe.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"status": result["status"], "samples": len(samples), "failures": [sample for sample in samples if not sample["pass"]]}))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(probe())