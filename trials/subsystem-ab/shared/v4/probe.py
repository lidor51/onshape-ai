import argparse
import json
import math
import sys

from build import HERE, Model, make_model, matrix, located, rotation, np, sha
sys.path.insert(0, str(HERE))
from validate import render, collision_check, quick_bounds
from layout import CORAL_RADIUS, ROLLER_RADIUS, COMPRESSION, stations


def mechanical_probe():
    model = make_model()
    focus = [item["id"] for item in model.instances if item["id"].startswith(("deploy_motor", "pickup_hub", "pickup_trunnion", "pivot_bush", "tower_"))]
    results = []
    mesh_samples = []
    for angle in [0, -135 / 62, -67.5, -135]:
        placed = model.poses(angle)
        result = collision_check(model, {name: placed[name] for name in focus})
        results.append({"angleDeg": angle, **result})
        mesh_samples.append({"angleDeg": angle, "intersectionMm3": abs(placed["deploy_motor_gear_0"].intersect(placed["deploy_motor_pinion_0"]).Volume())})
        print(json.dumps({"angleDeg": angle, "unexpected": result["unexpected"]}), flush=True)
    contacts = []
    normal = np.array([-40., 35.]) / math.hypot(40, 35)
    for displacement in [0, 12]:
        placed = model.poses(top_float=displacement)
        upper_names = [name for name in placed if name.startswith("pickup_upper_guide") or name == "pickup_top_entry_rubber"]
        for index, center in enumerate(stations()[:9]):
            center = np.array(center) + normal * (CORAL_RADIUS + ROLLER_RADIUS - COMPRESSION)
            coral = located(model.shapes["coral_reference"], matrix((0, *center)))
            nearest = min(({"part": name, "gapMm": coral.distance(placed[name])} for name in upper_names), key=lambda item: item["gapMm"])
            contacts.append({"station": index, "topFloatMm": displacement, **nearest})
    inlet = []
    lower_center = np.array(stations()[0])
    radius = CORAL_RADIUS + ROLLER_RADIUS - COMPRESSION
    floor_angle = math.pi - math.asin((CORAL_RADIUS - lower_center[1]) / radius)
    incline_angle = math.atan2(normal[1], normal[0])
    upper_center = np.array(next(item["matrix"] for item in model.instances if item["id"] == "pickup_top_entry_rubber"))[1:3, 3]
    for angle in np.linspace(floor_angle, incline_angle, 13):
        center = lower_center + radius * np.array([math.cos(angle), math.sin(angle)])
        delta = upper_center - center
        projection = float(np.dot(delta, normal))
        displacement = max(0., -projection + math.sqrt(max(0., projection ** 2 + radius ** 2 - float(np.dot(delta, delta)))))
        placed = model.poses(top_float=displacement)
        coral = located(model.shapes["coral_reference"], matrix((0, *center)))
        hard = {name: abs(coral.intersect(placed[name]).Volume()) for name in ["pickup_roll_0_tube", "pickup_top_entry_tube"]}
        inlet.append({"centerMm": [0, *center], "requiredFloatMm": displacement, "lowerRubberGapMm": coral.distance(placed["pickup_roll_0_rubber"]), "upperRubberGapMm": coral.distance(placed["pickup_top_entry_rubber"]), "rigidCoreIntersectionMm3": hard, "status": "PASS" if displacement <= 12 and max(hard.values()) <= 0.01 else "FAIL"})
    bounds = {name: quick_bounds(shape) for name, shape in model.poses().items() if name in focus}
    original_pair = ["deploy_motor_0", "deploy_motor_pinion_0"]
    hardware_failures = [entry for sample in results for entry in sample["unexpected"] if entry["pair"] != original_pair]
    result = {"status": "PASS" if all(item["status"] == "PASS" for item in results) and all(item["status"] == "PASS" for item in inlet) else "FAIL", "sourceHashes": {name: sha(HERE / name) for name in ["build.py", "layout.py", "probe.py", "validate.py"]}, "scope": "Deployment solids at four angles; nominal upper gaps at float limits; thirteen exact floor-to-incline inlet poses with required float solved geometrically, not a spring or friction simulation", "mountHubTrunnionStatus": "PASS" if not hardware_failures else "FAIL", "gearMeshStatus": "PASS" if max(item["intersectionMm3"] for item in mesh_samples) <= 0.05 else "FAIL", "gearMesh": mesh_samples, "samples": results, "contactGaps": contacts, "inletSamples": inlet, "boundsMm": bounds}
    (HERE / "mechanical-probe.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"status": result["status"], "contactGaps": contacts}), flush=True)
    return result


def gear_probe(fine=False):
    model = Model()
    model.vendor("x44")
    model.vendor("spline_pinion")
    model.vendor("hex_output_gear")
    motor = model.shapes["x44_body_0"]
    cover = model.shapes["x44_body_1"]
    pinion = model.shapes["spline_pinion_body_0"]
    gear = model.shapes["hex_output_gear_body_0"]
    samples = []
    for phase in ([30] if fine else np.arange(0, 45.01, 2.5)):
        placed = located(pinion, matrix((0, 0, 18), rotation((0, 0, 1), phase)))
        overlap = abs(motor.intersect(placed).Volume())
        samples.append({"phaseDeg": float(phase), "intersectionMm3": overlap})
        print(json.dumps(samples[-1]), flush=True)
    best = min(samples, key=lambda entry: entry["intersectionMm3"])
    meshing = []
    placed_pinion = located(pinion, matrix((0, 40.64, 18), rotation((0, 0, 1), best["phaseDeg"])))
    for phase in (np.arange(1.2, 1.801, 0.025) if fine else np.arange(0, 7.501, 0.5)):
        placed_gear = located(gear, matrix((0, 0, 18), rotation((0, 0, 1), phase)))
        meshing.append({"phaseDeg": float(phase), "intersectionMm3": abs(placed_gear.intersect(placed_pinion).Volume())})
    result = {"motorSpline": samples, "bestSpline": best, "gearMesh": meshing, "bestMesh": min(meshing, key=lambda entry: entry["intersectionMm3"]), "originalMotorCoverIntersectionMm3": abs(motor.intersect(cover).Volume()), "scope": "Finite phase samples of unmodified vendor solids, not load or friction verification"}
    (HERE / "gear-probe.json").write_text(json.dumps(result, indent=2))
    print(json.dumps({key: result[key] for key in ["bestSpline", "bestMesh", "originalMotorCoverIntersectionMm3"]}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--gears", action="store_true")
    parser.add_argument("--images", action="store_true")
    parser.add_argument("--fine", action="store_true")
    parser.add_argument("--mechanical", action="store_true")
    arguments = parser.parse_args()
    if arguments.mechanical:
        raise SystemExit(mechanical_probe()["status"] != "PASS")
    if arguments.gears:
        gear_probe(arguments.fine)
    if arguments.images:
        model = make_model()
        folder = HERE / "previews"
        folder.mkdir(exist_ok=True)
        for name, angle, view in [("baseline-deployed", 0, "iso"), ("baseline-stowed", -125, "iso"), ("side-contact", 0, "side"), ("plan-contact", 0, "plan")]:
            render(model, folder / (name + ".png"), angle, view, coral=[((0, 560, 447.15), 90)])
            print("Rendered " + name, flush=True)