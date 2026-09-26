import argparse
from collections import Counter
import itertools
import json
import time

from build import BASE, HERE, Model, bounds, make_model, matrix, np, solid_check, vtk, located, rotation, sha
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib


def quick_bounds(shape):
    bound = Bnd_Box()
    BRepBndLib.Add_s(shape.wrapped, bound, False)
    return list(bound.Get())


def collision_check(model, placed, cache=None):
    cache = {} if cache is None else cache
    names = list(placed)
    boxes = np.array([quick_bounds(placed[name]) for name in names])
    records = {item["id"]: item for item in model.instances}
    exemptions = {tuple(item["pair"]): item for item in model.exemptions}
    failures, contacts = [], []
    exact_count = cache_hits = candidate_count = 0
    for first_index, first in enumerate(names):
        candidates = np.where(np.all(np.minimum(boxes[first_index, 3:], boxes[first_index + 1:, 3:]) - np.maximum(boxes[first_index, :3], boxes[first_index + 1:, :3]) > 0.001, axis=1))[0] + first_index + 1
        for second_index in candidates:
            second = names[second_index]
            pair = tuple(sorted([first, second]))
            candidate_count += 1
            def motion_class(name):
                group = records[name]["group"]
                if group == "deploy_motor_output_reference":
                    return "deployment_pinion"
                if group.startswith("pickup_top"):
                    return "pickup_float"
                return "pickup" if group.startswith("pickup") else "fixed"
            same_group = motion_class(first) == motion_class(second)
            if same_group and pair in cache:
                volume = cache[pair]
                cache_hits += 1
            else:
                volume = abs(placed[first].intersect(placed[second]).Volume())
                exact_count += 1
                if same_group:
                    cache[pair] = volume
            if volume <= 0.01:
                continue
            contact = exemptions.get(pair)
            entry = {"pair": list(pair), "intersectionMm3": volume}
            if contact and volume <= contact["maximumVolumeMm3"]:
                contacts.append({**entry, "intent": contact["intent"]})
            else:
                failures.append(entry)
    return {"pairCount": len(names) * (len(names) - 1) // 2, "broadPhaseCandidates": candidate_count, "exactBooleanChecks": exact_count, "invariantPairCacheHits": cache_hits, "unexpected": failures, "declaredContact": contacts, "status": "PASS" if not failures else "FAIL"}


def envelope(model, placed, angle):
    actual = [quick_bounds(placed[item["id"]]) for item in model.instances if not item["referenceOnly"]]
    measured = np.array(actual)
    combined = np.r_[measured[:, :3].min(axis=0), measured[:, 3:].max(axis=0)].tolist()
    failures = []
    if combined[2] < -0.01:
        failures.append("floor")
    if combined[5] > 1066.8:
        failures.append("height")
    if combined[1] < -457.2 or combined[4] > 760 + 457.2 or combined[0] < -350 - 457.2 or combined[3] > 350 + 457.2:
        failures.append("extension")
    if angle == -135 and (combined[0] < -350 or combined[3] > 350 or combined[1] < 0 or combined[4] > 760):
        failures.append("stowed_perimeter")
    return {"boundsMm": combined, "failures": failures, "status": "PASS" if not failures else "FAIL"}


def polydata(shape):
    vertices, triangles = shape.tessellate(0.55, 0.2)
    points = vtk.vtkPoints()
    for vertex in vertices:
        points.InsertNextPoint(vertex.x, vertex.y, vertex.z)
    faces = vtk.vtkCellArray()
    for triangle in triangles:
        faces.InsertNextCell(3)
        for index in triangle:
            faces.InsertCellPoint(index)
    data = vtk.vtkPolyData()
    data.SetPoints(points)
    data.SetPolys(faces)
    return data


def render(model, path, angle=0, view="iso", coral=None):
    renderer = vtk.vtkRenderer()
    renderer.SetBackground(0.96, 0.97, 0.98)
    renderer.SetBackground2(0.82, 0.87, 0.9)
    renderer.GradientBackgroundOn()
    mesh_cache = {}
    placed = model.poses(angle)
    entries = [(item["id"], item["part"], placed[item["id"]]) for item in model.instances]
    if coral:
        for index, (center, yaw) in enumerate(coral):
            entries.append(("coral_" + str(index), "coral_reference", located(model.shapes["coral_reference"], matrix(center, rotation((0, 0, 1), yaw)))))
    for name, role, shape in entries:
        if view == "side" and ("cheek" in name or "tower" in name or "retainer" in name or "bearing" in name or "screw" in name or "nut" in name or "washer" in name):
            continue
        mapper = vtk.vtkPolyDataMapper()
        mapper.SetInputData(polydata(shape))
        actor = vtk.vtkActor()
        actor.SetMapper(mapper)
        color = (0.55, 0.61, 0.67)
        if "rubber" in role or "drum" in role:
            color = (0.10, 0.15, 0.16)
        elif "guide" in role or "floor" in role or "stop" in role or "finger" in role:
            color = (0.12, 0.66, 0.62)
        elif "cheek" in role or "tower" in role:
            color = (0.18, 0.38, 0.61)
        elif "x44" in role:
            color = (0.21, 0.22, 0.24)
        elif "gear" in role or "sprocket" in role:
            color = (0.86, 0.57, 0.17)
        elif "bumper" in role:
            color = (0.67, 0.13, 0.17)
        elif "coral" in role:
            color = (0.98, 0.83, 0.4)
        elif "receiver" in role:
            color = (0.68, 0.35, 0.63)
        actor.GetProperty().SetColor(*color)
        actor.GetProperty().SetSpecular(0.2)
        actor.GetProperty().SetSpecularPower(28)
        renderer.AddActor(actor)
    window = vtk.vtkRenderWindow()
    window.SetOffScreenRendering(1)
    window.SetSize(1800, 1300)
    window.SetMultiSamples(4)
    window.AddRenderer(renderer)
    camera = renderer.GetActiveCamera()
    camera.SetFocalPoint(0, 220, 400)
    camera.SetPosition(*(dict(iso=(1300, -1500, 1400), side=(2000, 200, 400), plan=(0, 220, 2200))[view]))
    camera.SetViewUp(*(dict(iso=(0, 0, 1), side=(0, 0, 1), plan=(0, 1, 0))[view]))
    camera.ParallelProjectionOn()
    renderer.ResetCamera()
    camera.Zoom(1.1)
    renderer.ResetCameraClippingRange()
    window.Render()
    image = vtk.vtkWindowToImageFilter()
    image.SetInput(window)
    image.ReadFrontBufferOff()
    image.Update()
    writer = vtk.vtkPNGWriter()
    writer.SetFileName(str(path))
    writer.SetInputConnection(image.GetOutputPort())
    writer.Write()
    window.Finalize()


def run(full=False, images=False):
    started = time.monotonic()
    report = {"scope": "LOCAL_BREP_NOT_SIMULATION_NOT_ONSHAPE", "status": "IN_PROGRESS", "expectedPoseCount": 126 if full else 4, "sourceHashes": {name: sha(HERE / name) for name in ["build.py", "layout.py", "validate.py"]}, "apiCalls": 0, "networkCalls": 0, "variants": {}, "manufacturingRelease": False, "physicalValidation": "UNVERIFIED"}
    (HERE / "validation.json").write_text(json.dumps(report, indent=2))
    for variant, controls in [("baseline", BASE), ("revision", {**BASE, "mouthWidth": 520})]:
        print("BUILD " + variant, flush=True)
        model = make_model(controls)
        samples = []
        cache = {}
        angles = np.linspace(0, -135, 63) if full else [0, -135]
        for angle in angles:
            placed = model.poses(float(angle))
            collision = collision_check(model, placed, cache)
            limits = envelope(model, placed, float(angle))
            samples.append({"angleDeg": float(angle), "collisions": collision, "envelope": limits})
            report["variants"][variant] = {"samples": samples, "modeledOccurrencesIncludingReferences": len(model.instances), "groups": len(model.groups), "status": "IN_PROGRESS"}
            (HERE / "validation.json").write_text(json.dumps(report, indent=2))
            print(json.dumps({"variant": variant, "angle": float(angle), "collisions": len(collision["unexpected"]), "envelope": limits["failures"]}), flush=True)
        report["variants"][variant] = {"samples": samples, "physicalInstances": len(model.instances), "groups": len(model.groups), "status": "PASS" if all(not entry["collisions"]["unexpected"] and not entry["envelope"]["failures"] for entry in samples) else "FAIL"}
        (HERE / "validation.json").write_text(json.dumps(report, indent=2))
        if images:
            folder = HERE / "previews"
            folder.mkdir(exist_ok=True)
            render(model, folder / (variant + "-deployed.png"), coral=[((0, 560, 447.15), 90)])
            render(model, folder / (variant + "-stowed.png"), -135)
            if variant == "baseline":
                render(model, folder / "side-contact.png", view="side", coral=[((0, -322, 57.15), 0), ((0, -185, 224), 0), ((0, 30, 447.15), 0), ((0, 560, 447.15), 90)])
                render(model, folder / "plan-contact.png", view="plan", coral=[((0, 195, 447.15), 0), ((0, 330, 447.15), 45), ((0, 560, 447.15), 90)])
    report["wallSeconds"] = time.monotonic() - started
    report["status"] = "PASS" if all(entry["status"] == "PASS" for entry in report["variants"].values()) else "FAIL"
    (HERE / "validation.json").write_text(json.dumps(report, indent=2))
    print(json.dumps({"status": report["status"], "wallSeconds": report["wallSeconds"]}), flush=True)
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--images", action="store_true")
    options = parser.parse_args()
    result = run(options.full, options.images)
    raise SystemExit(result["status"] != "PASS")