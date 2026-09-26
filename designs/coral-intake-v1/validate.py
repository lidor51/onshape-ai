import argparse
from collections import Counter
import json
import math
from pathlib import Path
import shutil
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, bounds, box, cq, cylinder, reference_boxes
from model import build, posed, rotation_about
from OCP.BRepAlgoAPI import BRepAlgoAPI_Common


def aabb_gap(first, second):
    return math.sqrt(sum(max(first[index] - second[index + 3], second[index] - first[index + 3], 0) ** 2 for index in range(3)))


def overlap(first, second):
    if aabb_gap(bounds(first), bounds(second)) > 1e-5:
        return 0.0
    common = first._bool_op((first,), (second,), BRepAlgoAPI_Common(), parallel=False)
    return max(0.0, common.Volume())


def coral(settings, center=None, axis=(0, 1, 0)):
    piece = settings["coral"]
    center = center or piece["final_center"]
    return cylinder(piece["od"] / 2, piece["length"], center, axis).cut(cylinder(piece["bore"] / 2, piece["length"] + 2, center, axis))


def definition_checks(package, reimport=False):
    results = []
    for name, definition in package.definitions.items():
        shape = definition["shape"]
        solids = shape.Solids()
        valid = bool(solids) and all(solid.isValid() and solid.Volume() > 1e-6 and all(shell.Closed() for shell in solid.Shells()) for solid in solids)
        result = {"definition": name, "valid_closed_positive_solids": valid, "solids": len(solids), "volume_mm3": shape.Volume(), "hole_checks": []}
        for horizontal, vertical, diameter in definition["holes"]:
            gauge = cylinder(diameter * 0.49, 0.5, (horizontal, vertical, 0))
            volume = overlap(shape, gauge)
            result["hole_checks"].append({"center": [horizontal, vertical], "diameter": diameter, "blocked_mm3": volume, "pass": volume < 1e-6})
        result["holes_pass"] = all(hole["pass"] for hole in result["hole_checks"])
        if reimport and definition["kind"] == "custom_brep":
            path = ROOT / "custom" / (name + ".step")
            if path.exists():
                imported = cq.importers.importStep(str(path)).val()
                difference = abs(imported.Volume() - shape.Volume())
                result["step_reimport"] = {"valid": imported.isValid(), "solids": len(imported.Solids()), "volume_delta_mm3": difference, "pass": imported.isValid() and difference <= max(1e-3, shape.Volume() * 1e-7) and len(imported.Solids()) == len(solids)}
            else:
                result["step_reimport"] = {"pass": False, "reason": "missing export"}
        results.append(result)
    return results


def axis_checks(package, deployed):
    shafts = [instance for instance in package.instances if instance["role"] == "hard_shaft"]
    checks = []
    for bearing in [instance for instance in package.instances if instance["role"] == "bearing"]:
        transform = bearing["pose"].wrapped.Transformation()
        origin = [transform.Value(index, 4) for index in range(1, 4)]
        axis = [transform.Value(index, 3) for index in range(1, 4)]
        candidates = []
        for shaft in shafts:
            shaft_transform = shaft["pose"].wrapped.Transformation()
            shaft_axis = [shaft_transform.Value(index, 3) for index in range(1, 4)]
            if abs(sum(axis[index] * shaft_axis[index] for index in range(3))) < 0.99999:
                continue
            delta = [shaft_transform.Value(index + 1, 4) - origin[index] for index in range(3)]
            along = sum(delta[index] * axis[index] for index in range(3))
            radial = math.sqrt(max(0, sum(value * value for value in delta) - along * along))
            length = bounds(package.definitions[shaft["definition"]]["shape"])[5] - bounds(package.definitions[shaft["definition"]]["shape"])[2]
            if abs(along) <= length / 2 + 1:
                candidates.append((radial, shaft["id"]))
        if candidates:
            radial, nearest = min(candidates)
            interference = overlap(deployed[bearing["id"]], deployed[nearest]) if radial < 0.01 else None
            checks.append({"bearing": bearing["id"], "shaft": nearest, "axis_error_mm": radial, "shaft_bearing_overlap_mm3": interference, "pass": radial < 0.005 and interference is not None and interference < 0.01})
        else:
            checks.append({"bearing": bearing["id"], "pass": False, "reason": "no supported shaft through bearing axial span"})
    return checks


def connectivity(package, deployed):
    instances = [instance for instance in package.instances if package.definitions[instance["definition"]]["kind"] != "reference_envelope"]
    parents = {instance["id"]: instance["id"] for instance in instances}
    extents = {name: bounds(shape) for name, shape in deployed.items()}

    def root(name):
        while parents[name] != name:
            parents[name] = parents[parents[name]]
            name = parents[name]
        return name

    contact_pairs = []
    for first_index, first in enumerate(instances):
        for second in instances[first_index + 1:]:
            first_id, second_id = first["id"], second["id"]
            if root(first_id) == root(second_id):
                continue
            if aabb_gap(extents[first_id], extents[second_id]) > 0.2:
                continue
            distance = deployed[first_id].distance(deployed[second_id])
            if distance <= 0.2:
                parents[root(second_id)] = root(first_id)
                contact_pairs.append({"first": first_id, "second": second_id, "distance_mm": distance})
    components = {}
    for name in parents:
        components.setdefault(root(name), []).append(name)
    return {"pass": len(components) == 1, "components": list(components.values()), "contact_tolerance_mm": 0.2, "measured_spanning_contacts": contact_pairs, "meaning": "Necessary contact adjacency only. Interpenetration can connect invalid assemblies; this is NOT proof of fastening, load path or joint retention."}


def motion_checks(package, deployed, step=10):
    settings = package.settings
    references = reference_boxes(settings)
    moving = [instance for instance in package.instances if instance["motion"] != "fixed"]
    fixed = [instance for instance in package.instances if instance["motion"] == "fixed" and instance["module"] == "indexer"]
    fixed_bounds = {instance["id"]: bounds(deployed[instance["id"]]) for instance in fixed}
    checks = []
    for angle in range(0, -121, -step):
        for floating in (-8, -4, 0):
            failures = []
            maximum_extension = 0
            minimum_floor = 1e9
            for instance in moving:
                shape = posed(package, instance, angle, floating)
                extent = bounds(shape)
                minimum_floor = min(minimum_floor, extent[2])
                maximum_extension = max(maximum_extension, -extent[1], extent[4] - 760, -extent[0] - 350, extent[3] - 350)
                if extent[2] < settings["limits"]["minimum_floor"] - 1e-5:
                    failures.append({"part": instance["id"], "obstacle": "floor", "minimum_z_mm": extent[2]})
                if maximum_extension > settings["limits"]["extension"] + 1e-5:
                    failures.append({"part": instance["id"], "obstacle": "extension", "extension_mm": maximum_extension})
                if angle == -120 and (extent[0] < -350 - 1e-5 or extent[3] > 350 + 1e-5 or extent[1] < -1e-5 or extent[4] > 760 + 1e-5 or extent[5] > settings["limits"]["maximum_start_height"]):
                    failures.append({"part": instance["id"], "obstacle": "stow envelope", "bounds_mm": extent})
                for name, reference in references.items():
                    volume = overlap(shape, reference)
                    if volume > 0.01:
                        failures.append({"part": instance["id"], "obstacle": name, "overlap_mm3": volume})
                for other in fixed:
                    if aabb_gap(extent, fixed_bounds[other["id"]]) > 1e-5:
                        continue
                    volume = overlap(shape, deployed[other["id"]])
                    if volume > 0.05:
                        failures.append({"part": instance["id"], "obstacle": other["id"], "overlap_mm3": volume, "contact_class": "NOT intended pickup/indexer contact"})
            checks.append({"fold_degrees": angle, "floating_degrees": floating, "minimum_floor_mm": minimum_floor, "maximum_extension_mm": maximum_extension, "pass": not failures, "failures": failures})
        print("Motion checked fold=" + str(angle), flush=True)
    return {"sample_count": len(checks), "step_degrees": step, "pass": all(check["pass"] for check in checks), "samples": checks, "continuous_clearance_proven": False, "held_piece_fold": "prohibited: reverse-clear pickup before fold; final coral tested separately"}


def piece_checks(package, deployed):
    references = [("floor_pickup_witness", (0, -224, 57.15), (1, 0, 0)), ("bumper_crest_witness", (0, -42.5, 226.15), (1, 0, 0)), ("seated_offer", (0, 385, 191), (0, 1, 0))]
    result = []
    for name, center, axis in references:
        piece = coral(package.settings, center, axis)
        hard, compliant = [], []
        for instance in package.instances:
            volume = overlap(piece, deployed[instance["id"]])
            if volume <= 0.01:
                continue
            entry = {"part": instance["id"], "overlap_mm3": volume, "role": instance["role"]}
            if instance["role"] == "compliant_contact":
                compliant.append(entry)
            else:
                hard.append(entry)
        result.append({"pose": name, "center_mm": center, "axis": axis, "full_length_mm": 301.625, "hard_clearance_pass": not hard, "hard_collisions": hard, "compliant_intersections": compliant, "compliance_status": "measured unloaded overlap, NOT accepted compression without material/load test"})
    final = coral(package.settings)
    return {"poses": result, "hard_clearance_pass": all(entry["hard_clearance_pass"] for entry in result), "final_bounds_mm": bounds(final), "continuous_feed_and_orientation": "UNPROVEN; discrete witnesses do not prove guided contact, shaft clearance between witnesses, or turning the full-length tube"}


def receiver_checks(package, deployed):
    envelope = package.settings["receiver_keepout"]
    keepout = box([envelope[axis][1] - envelope[axis][0] for axis in "xyz"], [sum(envelope[axis]) / 2 for axis in "xyz"])
    result = []
    for angle in (0, -120):
        clashes = []
        for instance in package.instances:
            shape = deployed[instance["id"]] if angle == 0 else posed(package, instance, angle)
            volume = overlap(shape, keepout)
            if volume > 0.01:
                clashes.append({"part": instance["id"], "overlap_mm3": volume})
        result.append({"fold_degrees": angle, "pass": not clashes, "clashes": clashes})
    return {"pass": all(entry["pass"] for entry in result), "poses": result, "scope": "actual x+-130/y370..510/z250..1100 reference keepout, not a scoring arm", "removal_path_proven": False}


def validate(package, reimport=False, quick=False, step=10):
    start = time.monotonic()
    deployed = {instance["id"]: posed(package, instance) for instance in package.instances}
    print("Checking solids, drilled bores and bearing axes", flush=True)
    definitions = definition_checks(package, reimport)
    axes = axis_checks(package, deployed)
    print("Checking actual contact adjacency and full coral witnesses", flush=True)
    connections = connectivity(package, deployed) if not quick else {"pass": False, "status": "not run in quick mode"}
    pieces = piece_checks(package, deployed)
    receiver = receiver_checks(package, deployed)
    motion = motion_checks(package, deployed, step) if not quick else {"pass": False, "status": "not run in quick mode"}
    gear_centers_pass = all(abs(pair["center_distance"] - 45.72) < 1e-6 for pair in package.gear_pairs)
    solid_pass = all(entry["valid_closed_positive_solids"] and entry["holes_pass"] and entry.get("step_reimport", {"pass": True})["pass"] for entry in definitions)
    gates = {
        "valid_brep_and_drilled_holes": solid_pass,
        "bearing_shaft_alignment_and_no_interference": all(entry["pass"] for entry in axes),
        "specified_12_60_gear_center_distances": gear_centers_pass,
        "full_mechanism_sampled_fold": motion["pass"],
        "full_length_coral_hard_clearance_witnesses": pieces["hard_clearance_pass"],
        "receiver_keepout": receiver["pass"],
        "necessary_assembly_connectivity": connections["pass"],
        "authentic_12T_and_60T_gears": False,
        "powered_kick_opposes_upper_contact": False,
        "floating_arm_belt_take_up_and_stops_proven": False,
        "continuous_contact_and_handoff": False,
        "fastener_retention_and_load_path_approved": False,
        "sensor_product_mounts_and_line_of_sight": False,
        "strength_fold_torque_holding_and_current_limits": False,
        "manufacturing_fit_tolerance_approved": False
    }
    result = {"status": "PASS" if all(gates.values()) else "FAIL", "release": "NOT RELEASED", "package_status": "prototype-engineering", "units": "mm", "runtime": {"python": sys.version.split()[0], "executable": sys.executable, "cadquery": cq.__version__}, "scope": "Offline local CAD; no cloud, native Onshape or physical reliability claim", "elapsed_seconds": time.monotonic() - start, "gates": gates, "definitions": definitions, "bearing_axes": axes, "connectivity": connections, "piece_checks": pieces, "receiver": receiver, "motion": motion, "missing_required": package.missing, "drawing_policy": "Only locally valid flat-part inspection sheets and cut profiles may be emitted; conspicuous NOT RELEASED while any assembly/safety gate remains unresolved."}
    filename = "quick-validation.json" if quick else "validation.json"
    previous = ROOT / filename
    if previous.exists():
        archive = ROOT / "history"
        archive.mkdir(exist_ok=True)
        shutil.copy2(previous, archive / (previous.stem + "-" + str(time.time_ns()) + ".json"))
    (ROOT / filename).write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"geometry_status": result["status"], "gates": gates, "bearing_failures": [entry for entry in axes if not entry["pass"]], "connection_components": len(connections.get("components", [])), "elapsed_seconds": result["elapsed_seconds"]}), flush=True)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true")
    parser.add_argument("--reimport", action="store_true")
    parser.add_argument("--step", type=int, choices=(5, 10, 20), default=5)
    arguments = parser.parse_args()
    report = validate(build(), arguments.reimport, arguments.quick, arguments.step)
    sys.exit(0 if report["status"] == "PASS" else 1)