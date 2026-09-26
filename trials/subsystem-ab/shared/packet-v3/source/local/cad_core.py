import json
import math
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parent
NETWORK_EVENTS = []


def deny_network(event, arguments):
    if event.startswith("socket.") and event != "socket.gethostname":
        NETWORK_EVENTS.append(event)
        raise PermissionError("Local engineering forbids network access")
    if event in {"subprocess.Popen", "os.system", "os.spawn", "os.exec"}:
        raise PermissionError("Local engineering forbids child processes")


sys.addaudithook(deny_network)

import cadquery as cq


def box(size, center):
    return cq.Solid.makeBox(*size, cq.Vector(*[center[index] - size[index] / 2 for index in range(3)]))


def cylinder(radius, length, center, axis=(1, 0, 0)):
    start = [center[index] - axis[index] * length / 2 for index in range(3)]
    return cq.Solid.makeCylinder(radius, length, cq.Vector(*start), cq.Vector(*axis))


def polygon(points, length, start=0, axis="x"):
    plane = "YZ" if axis == "x" else "XY"
    offset = (start, 0, 0) if axis == "x" else (0, 0, start)
    return cq.Workplane(plane, origin=offset).polyline(points).close().extrude(length).val()


def hex_prism(across_flats, length, center, axis="x"):
    radius = across_flats / math.sqrt(3)
    points = [(radius * math.cos(math.radians(30 + 60 * index)), radius * math.sin(math.radians(30 + 60 * index))) for index in range(6)]
    return polygon(points, length, -length / 2, axis).translate(center)


def capsule(radius, length_x, first=(0, 0), second=(-385, -345)):
    delta_y, delta_z = second[0] - first[0], second[1] - first[1]
    distance = math.hypot(delta_y, delta_z)
    normal_y, normal_z = -delta_z / distance, delta_y / distance
    points = [(center[0] + sign * radius * normal_y, center[1] + sign * radius * normal_z) for center, sign in [(first, 1), (second, 1), (second, -1), (first, -1)]]
    return polygon(points, length_x, -length_x / 2).fuse(cylinder(radius, length_x, (0, *first)), cylinder(radius, length_x, (0, *second))).clean()


def deploy(shape, angle, pivot):
    return shape.rotate((0, 0, 0), (1, 0, 0), angle).translate(pivot)


def bumper(parameters):
    chassis = parameters["chassisMm"]
    padding = parameters["bumperMm"]
    height = padding["top"] - padding["bottom"]
    center = [0, chassis["length"] / 2, padding["bottom"] + height / 2]
    return box([chassis["width"] + 2 * padding["outwardDepth"], chassis["length"] + 2 * padding["outwardDepth"], height], center).cut(box([chassis["width"], chassis["length"], height + 2], center))


def bounds(shape):
    bound = shape.BoundingBox()
    return [bound.xmin, bound.ymin, bound.zmin, bound.xmax, bound.ymax, bound.zmax]


def solid_check(shape):
    return {"valid": shape.isValid(), "solids": len(shape.Solids()), "closed": all(shell.Closed() for shell in shape.Shells()), "volumeMm3": shape.Volume(), "boundsMm": bounds(shape)}


def initial_probe():
    parameters = json.loads((ROOT / "parameters.json").read_text())
    keepout = bumper(parameters)
    sweep_body = capsule(parameters["drumRadiusMm"] + parameters["beltThicknessMm"], parameters["baseline"]["mouthWidth"], second=parameters["lowerDrumLocalMm"][1:])
    samples = []
    for angle in sorted(set(range(-145, 1, 5)) | {-72.5}):
        placed = deploy(sweep_body, angle, parameters["pivotOriginMm"])
        measured = bounds(placed)
        intersection = placed.intersect(keepout).Volume()
        okay = intersection < 1e-5 and measured[2] >= 0 and measured[1] >= -457.2 and measured[5] <= 1066.8
        if angle == -145:
            okay = okay and measured[1] >= 0 and measured[4] <= 760
        samples.append({"angleDeg": angle, "bumperIntersectionMm3": intersection, "bumperDistanceMm": placed.distance(keepout), "boundsMm": measured, "status": "PASS" if okay else "FAIL"})
    report = {"cadquery": cq.__version__, "status": "PASS" if all(sample["status"] == "PASS" for sample in samples) else "FAIL", "samples": samples, "apiCalls": 0}
    (ROOT / "revised-probe.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"status": report["status"], "samples": len(samples), "minBumperDistanceMm": min(sample["bumperDistanceMm"] for sample in samples)}))
    if report["status"] != "PASS":
        raise AssertionError("Pickup envelope failed; see revised-probe.json")


if __name__ == "__main__":
    initial_probe()