import hashlib
import json
import math
from pathlib import Path
import shutil
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geometry import ROOT, REPO, bounds, cylinder
from model import build, matrix, posed, ring
from validate import aabb_gap, axis_checks, definition_checks, overlap, piece_checks, receiver_checks
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder


EXPECTED_SOURCES = {"spline_pinion": ("WCP-1010", 1), "hex_output_gear": ("WCP-0121", 1), "x44": ("WCP-0941", 2), "hex_bearing": ("WCP-0783", 1), "indexer_wheel": ("am-3945_green", 2), "intake_star": ("am-5123_green", 3)}


def cylinder_axis(shape, radius, origin, axis):
    matches = []
    axial_index = max(range(3), key=lambda index: abs(axis[index]))
    for face in shape.Faces():
        surface = BRepAdaptor_Surface(face.wrapped)
        if surface.GetType() != GeomAbs_Cylinder:
            continue
        cylinder = surface.Cylinder()
        if not math.isclose(cylinder.Radius(), radius, abs_tol=1e-6):
            continue
        direction = cylinder.Axis().Direction()
        point = cylinder.Location()
        parallel = abs(sum(direction.Coord(index + 1) * axis[index] for index in range(3)))
        delta = [point.Coord(index + 1) - origin[index] for index in range(3)]
        axial = sum(delta[index] * axis[index] for index in range(3))
        radial = math.sqrt(max(0, sum(value * value for value in delta) - axial * axial))
        if parallel > 0.999999 and radial < 1e-5:
            extent = bounds(face)
            matches.append([extent[axial_index], extent[axial_index + 3]])
    return {"pass": bool(matches), "matching_cylinders": len(matches), "axial_span_mm": [min(span[0] for span in matches), max(span[1] for span in matches)] if matches else None}


def source_checks(package):
    radii = {"spline_pinion": 8.89, "hex_output_gear": 39.37, "x44": 9.525, "hex_bearing": 14.2748, "indexer_wheel": 38.1, "intake_star": 10}
    results = []
    for product, (sku, count) in EXPECTED_SOURCES.items():
        source = package.sources[product]
        binding = package.sourcebindings[product]
        shape = package.definitions["vendor_" + product]["shape"]
        volumes = [solid.Volume() for solid in shape.Solids()]
        volume_preserved = len(volumes) == count and all(math.isclose(volume, evidence["volume_mm3"], rel_tol=1e-8, abs_tol=1e-5) for volume, evidence in zip(volumes, binding["solidEnvelopes"]))
        digest = hashlib.sha256((REPO / source["path"]).read_bytes()).hexdigest()
        axis = cylinder_axis(shape, radii[product], (0, 0, 0), (0, 0, 1))
        mapping = source.get("solid_mapping", [])
        decomposition_preserved = not mapping or sorted(part["source_solid_index"] for part in mapping) == list(range(count)) and all(math.isclose(package.definitions[part["definition"]]["shape"].Volume(), volumes[part["source_solid_index"]], abs_tol=1e-5) for part in mapping)
        results.append({"product": product, "sku": source["sku"], "source_roots": source["source_root_count"], "solids": len(volumes), "solid_volumes_mm3": volumes, "compound_volume_mm3": shape.Volume(), "compound_vs_solid_sum_delta_mm3": shape.Volume() - sum(volumes), "original_sha256_unchanged": digest == binding["sha256"], "import_count": source["import_count"], "axis": axis, "solid_mapping": mapping, "variant": source["variant"], "pass": source["sku"] == sku and source["source_root_count"] == 1 and source["import_count"] == 1 and digest == binding["sha256"] and volume_preserved and decomposition_preserved and axis["pass"]})
    return results


def gear_checks(package, deployed):
    instances = {instance["id"]: instance for instance in package.instances}
    results = []
    for pair in package.gear_pairs:
        axis = pair["axis"]
        axial_index = axis.index(1)
        pinion_pose = matrix(instances[pair["pinion"]]["pose"])
        gear_pose = matrix(instances[pair["gear"]]["pose"])
        pinion_origin = [row[3] for row in pinion_pose[:3]]
        gear_origin = [row[3] for row in gear_pose[:3]]
        pinion_axis = cylinder_axis(deployed[pair["pinion"]], 8.89, pinion_origin, axis)
        output_axis = cylinder_axis(deployed[pair["gear"]], 39.37, gear_origin, axis)
        candidates = []
        for instance in package.instances:
            if instance["role"] != "hard_shaft":
                continue
            pose = matrix(instance["pose"])
            if abs(sum(pose[index][2] * axis[index] for index in range(3))) < 0.99999:
                continue
            radial = math.sqrt(sum((pose[index][3] - gear_origin[index]) ** 2 for index in range(3) if index != axial_index))
            extent = bounds(deployed[instance["id"]])
            axial_gap = max(extent[axial_index] - gear_origin[axial_index], gear_origin[axial_index] - extent[axial_index + 3], 0)
            candidates.append((math.hypot(radial, axial_gap), radial, instance["id"]))
        _, radial, shaft_id = min(candidates)
        shaft_extent = bounds(deployed[shaft_id])
        gear_extent = bounds(deployed[pair["gear"]])
        engagement = min(gear_extent[axial_index + 3], shaft_extent[axial_index + 3]) - max(gear_extent[axial_index], shaft_extent[axial_index])
        gear_width = gear_extent[axial_index + 3] - gear_extent[axial_index]
        shaft_overlap = overlap(deployed[pair["gear"]], deployed[shaft_id])
        spline_overlap = overlap(deployed[pair["pinion"]], deployed[pair["motor"]])
        mesh_overlap = overlap(deployed[pair["pinion"]], deployed[pair["gear"]])
        tooth_overlap = min(pinion_axis["axial_span_mm"][1], output_axis["axial_span_mm"][1]) - max(pinion_axis["axial_span_mm"][0], output_axis["axial_span_mm"][0]) if pinion_axis["pass"] and output_axis["pass"] else 0
        spacer_extent = bounds(deployed[pair["name"] + "_pinion_spacer"])
        pinion_extent = bounds(deployed[pair["pinion"]])
        tip = pair["mount_face"] + package.sourcebindings["x44"]["datums"]["shaft_tip_z_mm"]
        bridge_pass = abs(spacer_extent[axial_index] - pinion_extent[axial_index + 3]) < 1e-5 and abs(spacer_extent[axial_index + 3] - tip) < 1e-5
        center_distance = math.dist(pinion_origin, gear_origin)
        midplane_error = max(abs(pinion_origin[axial_index] - pair["gear_midplane"]), abs(gear_origin[axial_index] - pair["gear_midplane"]))
        placement_pass = pair["vendor_solids_present"] and pinion_axis["pass"] and output_axis["pass"] and abs(center_distance - 45.72) < 1e-6 and midplane_error < 1e-6 and tooth_overlap > 9.5249 and radial < 1e-5 and engagement >= gear_width - 1e-5 and shaft_overlap < 0.01 and spline_overlap < 0.01 and bridge_pass and 4.826 <= pair["pinion_thread_engagement_mm"] < pair["pinion_thread_depth_mm"]
        results.append({"name": pair["name"], "authentic_gears_present": pair["vendor_solids_present"], "actual_center_distance_mm": center_distance, "midplane_mm": pair["gear_midplane"], "midplane_error_mm": midplane_error, "pinion_axis": pinion_axis, "output_axis": output_axis, "tooth_plane_overlap_mm": tooth_overlap, "output_shaft": shaft_id, "shaft_axis_error_mm": radial, "shaft_engagement_mm": engagement, "gear_width_mm": gear_width, "output_hex_overlap_mm3": shaft_overlap, "spline_overlap_mm3": spline_overlap, "pinion_spacer_bridge_pass": bridge_pass, "pinion_spacer_length_mm": pair["pinion_spacer_length_mm"], "pinion_thread_engagement_mm": pair["pinion_thread_engagement_mm"], "pinion_thread_depth_mm": pair["pinion_thread_depth_mm"], "output_clock_degrees": pair["output_clock_degrees"], "output_clocked_parts": pair["output_clocked_parts"], "placement_pass": placement_pass, "tooth_interference_mm3": mesh_overlap, "static_mesh_pass": mesh_overlap < 0.01, "rotating_mesh_proven": False, "pass": placement_pass and mesh_overlap < 0.01})
    return results


def reducer_repair_checks(package, deployed):
    instances = {instance["id"]: instance for instance in package.instances}
    counterbores, screws, access = [], [], []
    for pair in package.gear_pairs:
        mount_id = pair["name"] + "_mount"
        definition = package.definitions[instances[mount_id]["definition"]]
        for pocket in definition["counterbores"]:
            horizontal, vertical = pocket["center"]
            through = cylinder(pocket["through_diameter_mm"] * 0.49, 6.2, (horizontal, vertical, 0))
            recess = cylinder(pocket["diameter_mm"] / 2 - 0.01, 2.98, (horizontal, vertical, 1.5))
            floor = ring(10, 5.4, 2.98).translate((horizontal, vertical, -1.5))
            through_blocked = overlap(definition["shape"], through)
            recess_blocked = overlap(definition["shape"], recess)
            floor_missing = abs(floor.Volume() - overlap(definition["shape"], floor))
            counterbores.append({"mount": mount_id, **pocket, "through_blocked_mm3": through_blocked, "recess_blocked_mm3": recess_blocked, "floor_missing_mm3": floor_missing, "pass": through_blocked < 1e-6 and recess_blocked < 1e-6 and floor_missing < 1e-5})
        axial_index = pair["axis"].index(1)
        depth = package.sourcebindings["x44"]["datums"]["mounting_thread_depth_from_drawing_mm"]
        for index in range(3):
            screw_id = pair["name"] + "_motor_screw_" + str(index)
            extent = bounds(deployed[screw_id])
            underside = matrix(instances[screw_id]["pose"])[axial_index][3] - pair["mount_face"]
            engagement = pair["mount_face"] - extent[axial_index]
            top = extent[axial_index + 3] - pair["mount_face"]
            mount_overlap = overlap(deployed[screw_id], deployed[mount_id])
            gear_overlap = overlap(deployed[screw_id], deployed[pair["gear"]])
            screws.append({"screw": screw_id, "geometry_kind": package.definitions[instances[screw_id]["definition"]]["kind"], "head_underside_from_face_mm": underside, "head_top_from_face_mm": top, "washer_seat_from_face_mm": underside - 1, "engagement_mm": engagement, "blind_depth_mm": depth, "mount_overlap_mm3": mount_overlap, "gear_overlap_mm3": gear_overlap, "strength_qualified": False, "pass": abs(underside - 4) < 1e-6 and abs(engagement - 5.525) < 1e-6 and engagement < depth and top < 10.3 and mount_overlap < 0.01 and gear_overlap < 0.01})
    for first, second in [("fold_drive_12T", "frame_cheek_1")] + [("indexer_drive_" + suffix + component, "indexer_plate_" + suffix + "_114") for suffix in ("L", "R") for component in ("_pinion_spacer", "_pinion_retention")]:
        volume = overlap(deployed[first], deployed[second])
        access.append({"first": first, "second": second, "overlap_mm3": volume, "pass": volume < 0.01, "gearbox_removal_proven": False})
    sensor_failures = []
    for first in ("sensor_mount_presence", "presence_sensor_tab", "sensor_presence"):
        for second in deployed:
            if first == second:
                continue
            volume = overlap(deployed[first], deployed[second])
            if volume > 0.01:
                sensor_failures.append({"first": first, "second": second, "overlap_mm3": volume})
    contacts = []
    for first, second in (("sensor_mount_presence", "presence_sensor_tab"), ("presence_sensor_tab", "detachable_tray"), ("presence_sensor_tab", "tray_dock_screw_65_245")):
        distance = deployed[first].distance(deployed[second])
        volume = overlap(deployed[first], deployed[second])
        contacts.append({"first": first, "second": second, "distance_mm": distance, "overlap_mm3": volume, "pass": distance < 1e-5 and volume < 0.01, "joint_strength_qualified": False})
    return {"pass": all(result["pass"] for result in counterbores + screws + access + contacts) and not sensor_failures, "counterbores": counterbores, "motor_screws": screws, "access_clearances": access, "sensor_contacts": contacts, "sensor_failures": sensor_failures, "scope": "Actual recessed nominal hardware and whole presence bracket/tab/envelope geometry; zero overlap required, not waived contact. Counterbore floor, sensor tab joint, retention and strength remain unqualified."}


def new_part_clearances(package, deployed):
    parts = package.instances
    extents = {name: bounds(shape) for name, shape in deployed.items()}
    checked = set()
    failures = []
    exact_checks = 0
    for first in parts:
        source = package.definitions[first["definition"]]["source"]
        product = source.get("product_id") if source else None
        if product not in {"spline_pinion", "hex_output_gear", "indexer_wheel", "intake_star"} and not (first["role"] == "spacer" and "drive" in first["id"]):
            continue
        for second in parts:
            first_id, second_id = first["id"], second["id"]
            key = tuple(sorted((first_id, second_id)))
            if first_id == second_id or key in checked or second["role"] == "sensor_envelope":
                continue
            checked.add(key)
            if "_solid_" in first_id and first_id.rsplit("_solid_", 1)[0] == second_id.rsplit("_solid_", 1)[0]:
                continue
            if aabb_gap(extents[first_id], extents[second_id]) > 1e-5:
                continue
            exact_checks += 1
            volume = overlap(deployed[first_id], deployed[second_id])
            if volume > 0.01:
                failures.append({"first": first_id, "second": second_id, "first_role": first["role"], "second_role": second["role"], "overlap_mm3": volume})
    return {"pass": not failures, "exact_boolean_checks": exact_checks, "failures": failures, "scope": "Deployed new wheel/gear solids and drive spacers against other modeled parts; same-product material components excluded; no fold sweep or compliance waiver"}


def wheel_fit_checks(package, deployed):
    instances = {instance["id"]: instance for instance in package.instances}
    parents = {joint["first"]: joint["second"] for joint in package.joints}
    results = []
    for instance in package.instances:
        source = package.definitions[instance["definition"]]["source"]
        if instance["role"] != "hard_roller_core" or not source or source["product_id"] not in {"indexer_wheel", "intake_star"}:
            continue
        shaft_id = parents[instance["id"]]
        shaft_pose = matrix(instances[shaft_id]["pose"])
        wheel_pose = matrix(instance["pose"])
        axial_index = max(range(3), key=lambda index: abs(shaft_pose[index][2]))
        radial = math.sqrt(sum((shaft_pose[index][3] - wheel_pose[index][3]) ** 2 for index in range(3) if index != axial_index))
        parallel = abs(sum(shaft_pose[index][2] * wheel_pose[index][2] for index in range(3)))
        wheel_extent = bounds(deployed[instance["id"]])
        shaft_extent = bounds(deployed[shaft_id])
        clearance = min(wheel_extent[axial_index] - shaft_extent[axial_index], shaft_extent[axial_index + 3] - wheel_extent[axial_index + 3])
        blocked = overlap(deployed[instance["id"]], deployed[shaft_id])
        results.append({"hub": instance["id"], "shaft": shaft_id, "axis_error_mm": radial, "shaft_end_clearance_mm": clearance, "bore_overlap_mm3": blocked, "pass": radial < 1e-5 and parallel > 0.999999 and clearance > 0 and blocked < 0.01, "manufacturing_fit_approved": False})
    return results


def check_package(package):
    start = time.monotonic()
    print("Integration: original hashes, solid inventory and analytic axes", flush=True)
    sources = source_checks(package)
    deployed = {instance["id"]: posed(package, instance) for instance in package.instances}
    print("Integration: B-reps, drilled holes and actual bearing/shaft fits", flush=True)
    definitions = definition_checks(package)
    axes = axis_checks(package, deployed)
    wheels = wheel_fit_checks(package, deployed)
    print("Integration: authentic gear axes, bores, axial engagement and static teeth", flush=True)
    gears = gear_checks(package, deployed)
    print("Integration: recessed motor screws, clearance holes and whole sensor bracket", flush=True)
    repairs = reducer_repair_checks(package, deployed)
    print("Integration: new parts against deployed neighbors", flush=True)
    clearances = new_part_clearances(package, deployed)
    instances = {instance["id"]: instance for instance in package.instances}
    for failure in clearances["failures"]:
        if failure["first"].startswith("indexer_") and "_wheel_" in failure["first"]:
            old_tyre = ring(76.2, 38, 25.4).moved(instances[failure["first"]]["pose"])
            previous_overlap = overlap(old_tyre, deployed[failure["second"]])
            failure["replaced_custom_tyre_overlap_mm3"] = previous_overlap
            failure["newly_introduced"] = previous_overlap <= 0.01
        else:
            failure["newly_introduced"] = True
    print("Integration: full coral witnesses and two receiver endpoints (no motion sweep)", flush=True)
    pieces = piece_checks(package, deployed)
    receiver = receiver_checks(package, deployed)
    gates = {"exact_six_sources_preserved": set(package.sources) == set(EXPECTED_SOURCES) and len(package.import_cache) == 6 and all(source["pass"] for source in sources), "valid_brep_and_drilled_holes": all(result["valid_closed_positive_solids"] and result["holes_pass"] for result in definitions), "bearing_shaft_fits": all(result["pass"] for result in axes), "vendor_wheel_bore_fits": len(wheels) == 40 and all(result["pass"] for result in wheels), "authentic_gear_placement_and_engagement": len(gears) == 4 and all(result["placement_pass"] for result in gears), "static_gear_mesh": all(result["static_mesh_pass"] for result in gears), "new_part_deployed_clearances": clearances["pass"], "full_coral_hard_witnesses": pieces["hard_clearance_pass"], "receiver_endpoints": receiver["pass"]}
    gates["reducer_repair_geometry"] = repairs["pass"]
    input_paths = ["model.py", "integration_checks.py", "test_package.py", "geometry.py", "validate.py", "params.json", "cots/load_vendor.py", "cots/sourcebindings.json"]
    remaining = ["Resolve failed targeted gate: " + name for name, passed in gates.items() if not passed]
    return {"schema": "coral-targeted-cots-integration/v1", "status": "PASS" if all(gates.values()) else "FAIL", "release": "NOT RELEASED", "global_gates_approved": False, "scope": "Targeted static COTS integration only; no full motion, drawings or STEP export; previous integration report archived before replacement", "network_requests": 0, "input_sha256": {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in input_paths}, "elapsed_seconds": time.monotonic() - start, "runtime": {"executable": sys.executable, "python": sys.version.split()[0]}, "gates": gates, "sources": sources, "wheel_rows": package.wheel_rows, "wheel_fits": wheels, "definitions": definitions, "bearing_axes": axes, "gears": gears, "reducer_repairs": repairs, "new_part_clearances": clearances, "piece_checks": pieces, "receiver": receiver, "missing_required": package.missing, "next_known_needs": remaining + ["Static tooth phase is not a rotating-mesh proof; retain actual spline and hex engagement throughout any future motion test", "Motor-mount 3 mm counterbore floors and nominal screws are NOT strength-qualified; presence upright/tab joint also requires qualification", "Qualify star-row axial spacing and capture; custom kick drive reversal remains unresolved", "Resolve floating belt take-up, other belt tension, retention and load paths", "Qualify green 35A compliance/friction and CAD-vs-drawing bore tolerances by physical tests", "Full motion and exports deferred to parent; existing historical outputs do not represent this integration", "Sensors, continuous feed/handoff, strength and current limits remain unapproved"]}


def write_report(report):
    previous = ROOT / "integration-checks.json"
    if previous.exists():
        archive = ROOT / "history"
        archive.mkdir(exist_ok=True)
        archive_path = archive / (previous.stem + "-" + str(time.time_ns()) + ".json")
        shutil.copy2(previous, archive_path)
        report["previous_report_archive"] = archive_path.relative_to(ROOT).as_posix()
    previous.write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"integration_status": report["status"], "gates": report["gates"], "geometry_failures": report["new_part_clearances"]["failures"], "coral_hard_collisions": [{"pose": item["pose"], "collisions": item["hard_collisions"]} for item in report["piece_checks"]["poses"] if item["hard_collisions"]], "elapsed_seconds": report["elapsed_seconds"]}), flush=True)


if __name__ == "__main__":
    report = check_package(build())
    write_report(report)
    sys.exit(0 if report["status"] == "PASS" else 1)