import hashlib
import importlib.metadata
import json
import math
from pathlib import Path
import sys
import time


ROOT = Path(__file__).resolve().parent
AUDIT_EVENTS = {"localHostnameLookups": 0, "denied": []}


def deny_network(event, arguments):
    if event == "socket.gethostname":
        AUDIT_EVENTS["localHostnameLookups"] += 1
        return
    if event.startswith("socket.") or event in {"subprocess.Popen", "os.system", "os.spawn", "os.posix_spawn", "os.exec", "os.fork"}:
        AUDIT_EVENTS["denied"].append(event)
        raise PermissionError("Offline oracle forbids network access and child processes: " + event)


sys.addaudithook(deny_network)


def local_path(value):
    path = Path(value).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError("Oracle files must stay inside the trial folder")
    return path


def runtime_inventory():
    if Path(sys.prefix).resolve() != (ROOT / ".venv").resolve():
        raise RuntimeError("Use the configured folder-local .venv")
    packages = sorted(
        f"{distribution.metadata['Name']}=={distribution.version}"
        for distribution in importlib.metadata.distributions()
    )
    return {"python": sys.version, "packages": packages, "folderLocalVenv": True}


def checked_runtime():
    runtime = runtime_inventory()
    lock = (ROOT / "requirements.lock").read_text(encoding="utf8")
    if lock != "\n".join(runtime["packages"]) + "\n":
        raise RuntimeError("Installed dependencies differ from requirements.lock")
    if importlib.metadata.version("cadquery") != "2.6.1":
        raise RuntimeError("Expected pinned CadQuery 2.6.1")
    return runtime


def contract(parameters):
    if parameters["units"] != "mm":
        raise ValueError("Only millimeters accepted")

    def check_finite(value):
        if isinstance(value, list):
            return all(check_finite(item) for item in value)
        return type(value) in (int, float) and math.isfinite(value)

    positive = (
        "innerWidthMm", "plateThicknessMm", "plateLengthMm", "plateHeightMm",
        "rollerDiameterMm", "shaftHoleDiameterMm", "mountHoleDiameterMm",
        "pivotHoleDiameterMm",
    )
    for name in positive:
        if not check_finite(parameters[name]) or parameters[name] <= 0:
            raise ValueError("Invalid positive dimension: " + name)
    for name in ("plateBottomZMm", "rollerGapMm", "frontRollerYMm", "rollerZMm", "crossmemberCentersYZMm", "pivotCenterYZMm"):
        if not check_finite(parameters[name]):
            raise ValueError("Non-finite parameter: " + name)
    if parameters["rollerGapMm"] < 0 or type(parameters["downstreamHole"]) is not bool:
        raise ValueError("Invalid gap or downstream state")
    if len(parameters["crossmemberCentersYZMm"]) != 2 or any(len(center) != 2 for center in parameters["crossmemberCentersYZMm"]) or len(parameters["pivotCenterYZMm"]) != 2:
        raise ValueError("Invalid hole coordinates")
    holes = [
        ("frontShaft", parameters["frontRollerYMm"], parameters["rollerZMm"], parameters["shaftHoleDiameterMm"] / 2),
        ("rearShaft", parameters["frontRollerYMm"] + parameters["rollerDiameterMm"] + parameters["rollerGapMm"], parameters["rollerZMm"], parameters["shaftHoleDiameterMm"] / 2),
        *[(f"mount{index}", center[0], center[1], parameters["mountHoleDiameterMm"] / 2) for index, center in enumerate(parameters["crossmemberCentersYZMm"])],
        ("pivot", *parameters["pivotCenterYZMm"], parameters["pivotHoleDiameterMm"] / 2),
    ]
    if parameters["downstreamHole"]:
        holes.append(("independentNativeHole", 200, 40, 2))
    bottom = parameters["plateBottomZMm"]
    for index, (name, center_y, center_z, radius) in enumerate(holes):
        ligament = min(center_y - radius, parameters["plateLengthMm"] - center_y - radius, center_z - radius - bottom, bottom + parameters["plateHeightMm"] - center_z - radius)
        if ligament <= 0:
            raise ValueError("Non-positive edge ligament: " + name)
        for _, other_y, other_z, other_radius in holes[:index]:
            if math.hypot(center_y - other_y, center_z - other_z) <= radius + other_radius:
                raise ValueError("Overlapping bores: " + name)
    thickness = parameters["plateThicknessMm"]
    max_x = -parameters["innerWidthMm"] / 2
    expected = {
        "boundsMm": [max_x - thickness, max_x, 0, parameters["plateLengthMm"], bottom, bottom + parameters["plateHeightMm"]],
        "volumeMm3": thickness * (parameters["plateLengthMm"] * parameters["plateHeightMm"] - math.pi * sum(hole[3] ** 2 for hole in holes)),
        "holes": holes,
    }
    return expected


def build(parameters):
    import cadquery as cq

    expected = contract(parameters)
    min_x, max_x, min_y, max_y, min_z, max_z = expected["boundsMm"]
    solid = cq.Solid.makeBox(max_x - min_x, max_y - min_y, max_z - min_z, cq.Vector(min_x, min_y, min_z))
    for _, center_y, center_z, radius in expected["holes"]:
        tool = cq.Solid.makeCylinder(radius, max_x - min_x + 2, cq.Vector(min_x - 1, center_y, center_z), cq.Vector(1, 0, 0))
        solid = solid.cut(tool)
    return solid


def measure(shape, parameters):
    import cadquery as cq
    from OCP.BRepAdaptor import BRepAdaptor_Surface

    expected = contract(parameters)
    tolerance = 0.01

    def near(actual, desired, allowed=tolerance):
        if not math.isfinite(actual) or abs(actual - desired) > allowed:
            raise ValueError(f"Geometry mismatch: measured {actual}, expected {desired}")

    solids = shape.Solids()
    if len(solids) != 1 or not shape.isValid():
        raise ValueError("Expected one valid solid")
    solid = solids[0]
    if not solid.Shells() or not all(shell.Closed() for shell in solid.Shells()):
        raise ValueError("Solid shell is not closed")
    bounds = solid.BoundingBox()
    measured_bounds = [bounds.xmin, bounds.xmax, bounds.ymin, bounds.ymax, bounds.zmin, bounds.zmax]
    for actual, desired in zip(measured_bounds, expected["boundsMm"]):
        near(actual, desired)
    volume = solid.Volume()
    near(volume, expected["volumeMm3"], max(0.1, 1e-6 * expected["volumeMm3"]))
    measured_holes = []
    for face in solid.Faces():
        if face.geomType() != "CYLINDER":
            continue
        cylinder = BRepAdaptor_Surface(face.wrapped, True).Cylinder()
        axis = cylinder.Axis()
        location = axis.Location()
        direction = axis.Direction()
        near(abs(direction.X()), 1, 1e-7)
        near(direction.Y(), 0, 1e-7)
        near(direction.Z(), 0, 1e-7)
        face_bounds = face.BoundingBox()
        near(face_bounds.xmin, bounds.xmin)
        near(face_bounds.xmax, bounds.xmax)
        matches = [hole for hole in measured_holes if abs(hole["y"] - location.Y()) < tolerance and abs(hole["z"] - location.Z()) < tolerance and abs(hole["radius"] - cylinder.Radius()) < tolerance]
        if matches:
            matches[0]["areaMm2"] += face.Area()
            matches[0]["faceCount"] += 1
        else:
            measured_holes.append({"y": location.Y(), "z": location.Z(), "radius": cylinder.Radius(), "axis": [direction.X(), direction.Y(), direction.Z()], "xBoundsMm": [face_bounds.xmin, face_bounds.xmax], "areaMm2": face.Area(), "faceCount": 1})
    if len(measured_holes) != len(expected["holes"]):
        raise ValueError("Wrong number of cylindrical bore axes")
    unmatched = list(measured_holes)
    for name, center_y, center_z, radius in expected["holes"]:
        matches = [hole for hole in unmatched if abs(hole["y"] - center_y) <= tolerance and abs(hole["z"] - center_z) <= tolerance and abs(hole["radius"] - radius) <= tolerance]
        if len(matches) != 1:
            raise ValueError("Missing or ambiguous cylindrical bore: " + name)
        measured = matches[0]
        unmatched.remove(measured)
        measured["name"] = name
        near(measured["areaMm2"], 2 * math.pi * radius * (bounds.xmax - bounds.xmin), max(0.1, 1e-6 * measured["areaMm2"]))
        for fraction in (0.001, 0.5, 0.999):
            if solid.isInside(cq.Vector(bounds.xmin + fraction * (bounds.xmax - bounds.xmin), measured["y"], measured["z"]), 1e-7):
                raise ValueError("Bore is obstructed: " + name)
    return {
        "valid": True, "closed": True, "solids": 1,
        "boundsMm": measured_bounds, "volumeMm3": volume,
        "holes": measured_holes, "holeCount": len(measured_holes),
        "analyticComparison": "PASS", "expected": expected,
        "kernel": "OpenCascade via CadQuery/OCP, not Onshape Parasolid",
        "tolerances": {"linearMm": tolerance, "volumeMm3": max(0.1, 1e-6 * expected["volumeMm3"])},
    }


def evaluate(parameters, directory):
    import cadquery as cq

    directory = local_path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    started = time.perf_counter()
    solid = build(parameters)
    result = measure(solid, parameters)
    step = directory / "local.step"
    preview = directory / "local-preview.svg"
    cq.exporters.export(solid, str(step), exportType="STEP")
    reimported = cq.importers.importStep(str(step)).val()
    roundtrip = measure(reimported, parameters)
    cq.exporters.export(reimported, str(preview), exportType="SVG", opt={"projectionDir": (1, 0, 0), "showAxes": False, "showHidden": False, "width": 960, "height": 500})
    if preview.stat().st_size < 200:
        raise ValueError("Missing orthographic preview")
    result.update({
        "stepRoundtrip": "PASS", "roundtrip": roundtrip,
        "localStepSha256": hashlib.sha256(step.read_bytes()).hexdigest(),
        "previewSha256": hashlib.sha256(preview.read_bytes()).hexdigest(),
        "evidenceOrigin": "LOCAL_CADQUERY_NOT_ONSHAPE_EXPORT",
        "networkIsolation": {"guard": "Python audit hook installed before CAD import", "allowedLocalOnlyEvent": "socket.gethostname", "events": AUDIT_EVENTS, "osFirewallClaim": False},
        "wallTimeMs": (time.perf_counter() - started) * 1000,
    })
    return result


def main():
    command = sys.argv[1]
    if command == "lock":
        runtime = runtime_inventory()
        if importlib.metadata.version("cadquery") != "2.6.1":
            raise RuntimeError("Install pinned CadQuery 2.6.1 first")
        lock = ROOT / "requirements.lock"
        with lock.open("x", encoding="utf8", newline="\n") as target:
            target.write("\n".join(runtime["packages"]) + "\n")
        print(json.dumps(runtime))
        return
    runtime = checked_runtime()
    if command == "runtime":
        print(json.dumps(runtime, sort_keys=True))
        return
    parameters = json.loads(local_path(sys.argv[2]).read_text(encoding="utf8"))
    if command == "evaluate":
        result = evaluate(parameters, local_path(sys.argv[3]))
    elif command == "inspect-step":
        import cadquery as cq

        downloaded = local_path(sys.argv[3])
        if not downloaded.is_relative_to(ROOT / "live"):
            raise ValueError("Server comparison accepts only retained live downloads")
        result = measure(cq.importers.importStep(str(downloaded)).val(), parameters)
        result["downloadSha256"] = hashlib.sha256(downloaded.read_bytes()).hexdigest()
        result["provenance"] = "Geometry inspection only; UI ledger must separately establish Onshape download origin"
    else:
        raise ValueError("Unknown oracle command")
    result["runtime"] = runtime
    print(json.dumps(result, sort_keys=True, allow_nan=False))


if __name__ == "__main__":
    main()