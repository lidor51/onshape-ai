import argparse
from collections import Counter
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys
import time


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "starting-frame-output"
FRAME = {"x": [-350.0, 350.0], "y": [0.0, 760.0], "maximumHeight": 1066.8}
RESERVE = 5.0
RAILS = {"assumed_chassis_side_rail_-1", "assumed_chassis_side_rail_1"}
SIDES = ("left", "right", "front", "rear", "height")


def load_sibling(name):
    specification = importlib.util.spec_from_file_location("starting_frame_" + name, ROOT / (name + ".py"))
    loaded = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(loaded)
    return loaded


def digest(path):
    checksum = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def write_json(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(content, indent=2, allow_nan=False) + "\n", encoding="utf8")


def margins(bounds):
    return dict(zip(SIDES, (bounds[0] + 350, 350 - bounds[3], bounds[1],
                            760 - bounds[4], 1066.8 - bounds[5])))


def classify(identifier, bounds, reference=False):
    clearance = margins(bounds)
    required = 0.0 if identifier in RAILS else RESERVE
    return {"boundsMm": bounds, "marginsMm": clearance,
            "referenceOnly": reference, "requiredReserveMm": required,
            "outsideFrame": not reference and min(clearance.values()) < -1e-5,
            "reserveMet": reference or min(clearance.values()) >= required - 1e-5}


def exact_bounds(shape):
    from OCP.Bnd import Bnd_Box
    from OCP.BRepBndLib import BRepBndLib
    box = Bnd_Box()
    BRepBndLib.AddOptimal_s(shape.wrapped, box, False, True)
    return list(box.Get())


def radial_enclosure(shape, samples=4):
    if samples < 1:
        raise ValueError("At least one support orientation is required")
    support = 0.0
    for index in range(samples):
        rotated = shape.rotate((0, 0, 0), (0, 0, 1), index * 90 / samples)
        extent = exact_bounds(rotated)
        support = max(support, *(abs(extent[axis]) for axis in (0, 1, 3, 4)))
    axial = exact_bounds(shape)
    return {"radiusLowerMm": max(0.0, support - 1e-5),
            "radiusUpperMm": support / math.cos(math.pi / (4 * samples)),
            "axialMm": [axial[2], axial[5]], "supportOrientations": samples,
            "method": "Analytic B-rep support strips; enclosing disk uses sec(pi/(4*N)), not sampled rotor phases"}


def cylinder_bounds(enclosure, matrix, radius_key="radiusUpperMm"):
    radius = enclosure[radius_key]
    result = []
    for sign in (-1, 1):
        for axis in range(3):
            direction = matrix[axis][2]
            axial = [direction * value for value in enclosure["axialMm"]]
            radial = radius * math.hypot(matrix[axis][0], matrix[axis][1])
            result.append(matrix[axis][3] + (min(axial) - radial if sign == -1 else max(axial) + radial))
    return result


def rear_move_screen(rows, minimum_rear_y):
    middle = rows["middle"]
    horizontal = minimum_rear_y - middle[0]
    maximum_contact_distance = 2 * (63.7 + 57.15)
    return {"minimumRearYmm": minimum_rear_y, "middleCenterYZmm": middle,
            "existingRearCenterYZmm": rows["rear"],
            "bestPossibleRearMiddleDistanceMm": horizontal,
            "sameHeightRearMiddleDistanceMm": math.hypot(horizontal, rows["rear"][1] - middle[1]),
            "optimisticDualRollerContactLimitMm": maximum_contact_distance,
            "minimumPoweredContactGapMm": horizontal - maximum_contact_distance,
            "rearOnlyMoveRejected": horizontal > maximum_contact_distance,
            "basis": "Uncompressed 63.7 mm upper rollers and 114.3 mm coral OD. Even arbitrary rear height cannot close excessive horizontal separation. Necessary contact condition only, not feed proof."}


def protected_hashes():
    allowed = {"starting_frame.py", "test_starting_frame.py", "STARTING-FRAME.md"}
    paths = [path for path in ROOT.parent.joinpath("coral-intake-v1").rglob("*") if path.is_file()]
    paths += [path for path in ROOT.rglob("*") if path.is_file()
              and path.name not in allowed and OUTPUT not in path.parents]
    return {path.relative_to(ROOT.parent).as_posix(): digest(path) for path in sorted(paths)}


class BoundsCache:
    def __init__(self, assembly):
        self.assembly = assembly
        self.local = {}
        self.oriented = {}
        self.radial = {}

    def placed(self, part, angle, floating):
        pose = self.assembly.pose(part, angle, floating)
        matrix = self.assembly.pickup_module.matrix(pose)
        orientation = tuple(round(value, 12) for row in matrix[:3] for value in row[:3])
        key = (part["definition"], orientation)
        if key not in self.oriented:
            translation = self.assembly.cq.Location(self.assembly.cq.Vector(*[-row[3] for row in matrix[:3]]))
            shape = self.assembly.definitions[part["definition"]]["shape"]
            self.oriented[key] = exact_bounds(shape.moved(translation * pose))
        return [value + matrix[axis % 3][3] for axis, value in enumerate(self.oriented[key])], matrix

    def spin(self, part, matrix):
        name = part["definition"]
        if name not in self.radial:
            self.radial[name] = radial_enclosure(self.assembly.definitions[name]["shape"])
        enclosure = self.radial[name]
        return {**enclosure, "boundsMm": cylinder_bounds(enclosure, matrix),
                "axis": [row[2] for row in matrix[:3]], "originMm": [row[3] for row in matrix[:3]]}


def rotary_ids(assembly):
    roles = {"compliant_contact", "outer_elastomer", "hard_hub", "hard_marking_unqualified",
             "hard_shaft", "gear", "pulley", "sprocket", "hub", "motor"}
    selected = {part["id"] for part in assembly.instances if part["role"] in roles}
    shafts = [assembly.pickup_module.matrix(part["pose"]) for part in assembly.instances
              if part["role"] == "hard_shaft"]
    for part in assembly.instances:
        if part["role"] not in {"spacer", "fastener", "retainer"}:
            continue
        matrix = assembly.pickup_module.matrix(part["pose"])
        for shaft in shafts:
            direction = [row[2] for row in shaft[:3]]
            dot = sum(matrix[axis][2] * direction[axis] for axis in range(3))
            delta = [matrix[axis][3] - shaft[axis][3] for axis in range(3)]
            along = sum(delta[axis] * direction[axis] for axis in range(3))
            radial = math.sqrt(sum((delta[axis] - along * direction[axis]) ** 2 for axis in range(3)))
            if abs(dot) > 0.999999 and radial < 1e-5:
                selected.add(part["id"])
                break
    return selected


def summarize_pose(parts, angle, floating):
    physical = [part for part in parts if not part["referenceOnly"]]
    outside = [part for part in physical if part["outsideFrame"]]
    swept = [part for part in physical if "spin" in part]
    return {"angleDeg": angle, "floatDeg": floating, "physicalParts": len(physical),
            "outsideCount": len(outside), "fixedOutsideCount": sum(part["motion"] == "fixed" for part in outside),
            "reserveFailureCount": sum(not part["reserveMet"] for part in physical),
            "worstParts": {side: sorted(physical, key=lambda part: part["marginsMm"][side])[:8] for side in SIDES},
            "minimumMarginsMm": {side: min(part["marginsMm"][side] for part in physical) for side in SIDES},
            "outsideIds": [part["id"] for part in outside],
            "reserveFailureIds": [part["id"] for part in physical if not part["reserveMet"]],
            "fullSpinEnclosureFailureIds": [part["id"] for part in swept if not part["spin"]["reserveEnclosureMet"]],
            "parts": parts}


def audit_assembly(assembly):
    cache = BoundsCache(assembly)
    rotors = rotary_ids(assembly)
    selected = assembly.pickup.config["stow_angle"]
    poses = []
    for floating in (0, -8):
        parts = []
        for part in assembly.instances:
            definition = assembly.definitions[part["definition"]]
            reference = definition["kind"] == "reference_envelope"
            bounds, matrix = cache.placed(part, selected, floating)
            row = {"id": part["id"], "definition": part["definition"], "motion": part["motion"],
                   "role": part["role"], **classify(part["id"], bounds, reference)}
            if part["id"] in rotors and not reference:
                row["spin"] = cache.spin(part, matrix)
                row["spin"]["marginsMm"] = margins(row["spin"]["boundsMm"])
                row["spin"]["reserveEnclosureMet"] = min(row["spin"]["marginsMm"].values()) >= RESERVE - 1e-5
            parts.append(row)
        poses.append(summarize_pose(parts, selected, floating))
        print(json.dumps({"phase": "exact-stow-audit", "float": floating,
                          "outside": poses[-1]["outsideCount"], "worst": poses[-1]["minimumMarginsMm"]}), flush=True)
    fixed = [part for part in poses[0]["parts"] if part["motion"] == "fixed" and not part["referenceOnly"]]
    fixed_outside = [part for part in fixed if part["outsideFrame"]]
    rows = assembly.pickup_module.centers(assembly.pickup.config)
    sprocket = next(part for part in poses[0]["parts"] if part["id"] == "pt_deployment_60T_plate")
    star = next(part for part in poses[0]["parts"] if part["id"].startswith("v2_star_rear_") and part["role"] == "outer_elastomer")
    necessary_rear_y = RESERVE + max(star["spin"]["radiusLowerMm"], sprocket["spin"]["radiusLowerMm"])
    sufficient_disk_y = RESERVE + max(star["spin"]["radiusUpperMm"], sprocket["spin"]["radiusUpperMm"])
    thread_pairs = list(load_sibling("thread_contacts").verified_thread_pairs(assembly).values())
    paths = assembly.powertrain_installation["paths"]
    report = {"schema": "full-powered-starting-frame/1", "status": "FAIL_OUTSIDE_FRAME" if fixed_outside or any(pose["outsideCount"] for pose in poses) else "UNQUALIFIED",
              "frame": FRAME, "reserveMm": RESERVE, "railReserveExceptions": sorted(RAILS),
              "frameContainmentExceptions": [], "referenceExclusions": [part["id"] for part in poses[0]["parts"] if part["referenceOnly"]],
              "counts": {"instances": len(assembly.instances), "physical": poses[0]["physicalParts"],
                         "motors": sum(part["role"] == "motor" for part in assembly.instances),
                         "belts": sum(path["pitch_mm"] == 5 for path in paths),
                         "chains": sum(path["pitch_mm"] == 6.35 for path in paths),
                         "rotaryEnvelopeInstances": len(rotors), "rotaryDefinitions": len(cache.radial)},
              "poses": poses, "fixedProtrusionsAtEveryFoldAngle": fixed_outside,
              "fixedReserveFailuresAtEveryFoldAngle": [part for part in fixed if not part["reserveMet"]],
              "allowableStowRange": {"status": "EMPTY_FIXED_GEOMETRY_OUTSIDE_FRAME" if fixed_outside else "NOT_SOLVED",
                                     "intervalsDeg": [], "proof": "Fixed instances do not depend on fold angle or front float; each listed exact B-rep protrusion persists for every angle."},
              "rearOnlyRouteScreen": {**rear_move_screen(rows, necessary_rear_y),
                                      "conservativeFullDiskRequiredRearYmm": sufficient_disk_y,
                                      "sourceSprocket": sprocket["id"], "sourceStar": star["id"]},
              "verifiedExpectedThreadContacts": thread_pairs,
              "candidateGeometryChanged": False, "collisionStatus": "NOT_TESTED_NO_PASS_CLAIM",
              "hardStop": "MISSING", "stowHolding": "MISSING", "startingConfigurationCertified": False,
              "releaseReady": False, "globalTaskComplete": False,
              "boundsMethod": "OCCT BRepBndLib.AddOptimal(useTriangulation=False, useShapeTolerance=True) after rigid rotation; translation added exactly. Cached by definition and orientation, never transformed local box corners.",
              "fullSpinScope": "All rotary roles and coaxial shaft end hardware use continuous enclosing cylinders from 16 analytic support directions. Whole fused motor source and deployment output plate are conservatively enclosed too; casing and locked flange do not physically spin in stow. Enclosure failure alone is NOT a proved protrusion. All phase-zero parts also have exact B-rep bounds.",
              "limitations": ["Nominal source solids only; supplier cables, chain master links, guards and tolerances remain unqualified.",
                              "Float endpoints 0/-8 degrees are audited, not a continuous float or fold clearance certificate.",
                              "No full-system collision test, feed proof, strength approval, legal ruling or starting restraint is supplied.",
                              "Bumpers and declared reference geometry alone are excluded; actual chassis side rails, every motor and every modeled drive remain physical."]}
    return report


def compare_export(report, mesh):
    import numpy as np
    vertices = {name: np.asarray(definition["positions"]).reshape(-1, 3) for name, definition in mesh["definitions"].items()}
    parts = {part["id"]: part for part in report["poses"][0]["parts"]}
    records = []
    for part in mesh["instances"]:
        matrix = np.asarray(part["stow_matrix"])
        points = vertices[part["definition"]] @ matrix[:3, :3].T + matrix[:3, 3]
        bounds = [*points.min(axis=0).tolist(), *points.max(axis=0).tolist()]
        exact = parts[part["id"]]["boundsMm"]
        excess = max([exact[axis] - bounds[axis] for axis in range(3)] +
                     [bounds[axis + 3] - exact[axis + 3] for axis in range(3)])
        records.append({"id": part["id"], "meshBoundsMm": bounds, "meshMarginsMm": margins(bounds),
                        "meshOutsideExactBoundsMm": max(0.0, excess),
                        "largestMeshToBrepExtremumGapMm": max(abs(first - second) for first, second in zip(exact, bounds))})
    return {"method": "Every exported mesh vertex transformed by the exported true stow_matrix; no viewer offset or cropping",
            "parts": records, "maximumOutsideExactBoundsMm": max(row["meshOutsideExactBoundsMm"] for row in records),
            "allVerticesEnclosedByBrepBounds": all(row["meshOutsideExactBoundsMm"] <= 1e-4 for row in records)}


def export_audit(coaxial, assembly, report):
    original_output = coaxial.OUTPUT
    coaxial.OUTPUT = OUTPUT
    try:
        manifest = coaxial.export_geometry(assembly, {"status": report["status"]})
    finally:
        coaxial.OUTPUT = original_output
    mesh = json.loads((OUTPUT / "coaxial-mesh.json").read_text(encoding="utf8"))
    selected = {part["id"]: part for part in report["poses"][0]["parts"]}
    for collection in (mesh["instances"], manifest["instances"]):
        for part in collection:
            record = selected[part["id"]]
            part["starting_frame"] = {key: record[key] for key in ("boundsMm", "marginsMm", "outsideFrame", "reserveMet", "requiredReserveMm")}
            part["starting_frame"]["fullSpinEnclosureBoundsMm"] = record.get("spin", {}).get("boundsMm")
    manifest.update(starting_frame_audit="audit.json", powertrain_installation=assembly.powertrain_installation,
                    geometry_status=report["status"], collision_status=report["collisionStatus"],
                    hard_stop=report["hardStop"], stow_holding=report["stowHolding"],
                    physical_mount_complete=False, starting_configuration_certified=False, release_ready=False)
    manifest["source_code_sha256"].update({"coral-intake-v2/" + name: digest(ROOT / name) for name in
                                         ("starting_frame.py", "test_starting_frame.py", "powered_transmissions.py", "transmission_sources.py", "thread_contacts.py", "starting-envelope.mjs")})
    manifest["vendor_fidelity"] = "Original source hashes retained including newly installed powertrain sources. OCCT STEP convenience export is not source-fidelity certification."
    mesh.update(status=report["status"], starting_frame_audit="audit.json", collision_status=report["collisionStatus"])
    write_json(OUTPUT / "manifest.json", manifest)
    write_json(OUTPUT / "coaxial-mesh.json", mesh)
    comparison = compare_export(report, mesh)
    write_json(OUTPUT / "mesh-brep-comparison.json", comparison)
    write_json(OUTPUT / "powertrain-installation.json", assembly.powertrain_installation)
    report["export"] = {"manifest": "manifest.json", "mesh": "coaxial-mesh.json", "assemblyFiles": manifest["assembly_files"],
                        "meshComparison": "mesh-brep-comparison.json", "meshVerticesEnclosed": comparison["allVerticesEnclosedByBrepBounds"]}
    return comparison["allVerticesEnclosedByBrepBounds"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", action="store_true")
    arguments = parser.parse_args()
    started = time.monotonic()
    before = protected_hashes()
    coaxial = load_sibling("coaxial_pickup")
    powered = load_sibling("powered_transmissions")
    assembly = powered.install(coaxial.build())
    print(json.dumps({"phase": "built-full-powered", "instances": len(assembly.instances), "elapsedSeconds": time.monotonic() - started}), flush=True)
    report = audit_assembly(assembly)
    write_json(OUTPUT / "audit.json", report)
    write_json(OUTPUT / "powertrain-installation.json", assembly.powertrain_installation)
    export_valid = export_audit(coaxial, assembly, report) if arguments.export else True
    after = protected_hashes()
    changed = [name for name in sorted(set(before) | set(after)) if before.get(name) != after.get(name)]
    frozen = json.loads((ROOT / "output" / "frozen-v1.json").read_text(encoding="utf8"))
    frozen_changes = [name for name, expected in frozen.items() if after.get("coral-intake-v1/" + name) != expected]
    freeze = {"protectedBefore": before, "protectedAfter": after, "changed": changed,
              "frozenV1Count": len(frozen), "frozenV1Changes": frozen_changes,
              "allProtectedUnchanged": not changed, "frozenV1Unchanged": not frozen_changes}
    write_json(OUTPUT / "source-freeze.json", freeze)
    report["sourceFreeze"] = {key: value for key, value in freeze.items() if key not in {"protectedBefore", "protectedAfter"}}
    report["sourceHashes"] = {name: digest(ROOT / name) for name in
                              ("starting_frame.py", "test_starting_frame.py", "coaxial_pickup.py", "powered_transmissions.py", "thread_contacts.py", "transmission-installation.md", "starting-envelope.mjs")}
    report["elapsedSeconds"] = time.monotonic() - started
    report["auditIntegrityPass"] = not changed and not frozen_changes and export_valid and len(report["verifiedExpectedThreadContacts"]) == 4
    write_json(OUTPUT / "audit.json", report)
    print(json.dumps({key: report[key] for key in ("status", "counts", "rearOnlyRouteScreen", "sourceFreeze", "elapsedSeconds", "auditIntegrityPass")}, indent=2), flush=True)
    return 2 if not report["auditIntegrityPass"] else 1 if report["status"] == "FAIL_OUTSIDE_FRAME" else 0


if __name__ == "__main__":
    raise SystemExit(main())