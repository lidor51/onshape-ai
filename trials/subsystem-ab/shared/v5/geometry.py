import hashlib
import itertools
import json
import math
from pathlib import Path
import sys
import time

import vtk
from vtk.util.numpy_support import vtk_to_numpy
import cadquery as cq


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
STARTED = time.monotonic()
TOLERANCE = 0.0001
COLORS = {
    "rubber": (0.10, 0.15, 0.17), "tube": (0.62, 0.72, 0.75),
    "shaft": (0.73, 0.76, 0.80), "plate": (0.17, 0.64, 0.65),
    "retainer": (0.88, 0.55, 0.19), "coral": (0.95, 0.94, 0.85),
    "bumper": (0.76, 0.10, 0.17), "chassis": (0.44, 0.49, 0.51),
    "receiver": (0.52, 0.32, 0.65), "floor": (0.78, 0.81, 0.82),
}


def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + "\n")


def box(size, center):
    return cq.Solid.makeBox(*size, cq.Vector(*[center[index] - size[index] / 2 for index in range(3)]))


def cylinder(radius, length, center, axis):
    start = [center[index] - axis[index] * length / 2 for index in range(3)]
    return cq.Solid.makeCylinder(radius, length, cq.Vector(*start), cq.Vector(*axis))


def ring(outer, inner, length, center, axis):
    return cylinder(outer, length, center, axis).cut(cylinder(inner, length + 2, center, axis))


def bounds(shape):
    measured = shape.BoundingBox()
    return [measured.xmin, measured.ymin, measured.zmin, measured.xmax, measured.ymax, measured.zmax]


def solid_check(shape):
    return {"valid": shape.isValid(), "closed": all(shell.Closed() for shell in shape.Shells()),
            "solids": len(shape.Solids()), "volumeMm3": shape.Volume(), "boundsMm": bounds(shape)}


def coral_shape(parameters, center, yaw, envelope=False):
    angle = math.radians(yaw)
    axis = (math.sin(angle), math.cos(angle), 0)
    outer = cylinder(parameters["coralDiameter"] / 2, parameters["coralLength"], center, axis)
    return outer if envelope else outer.cut(cylinder(50.8, parameters["coralLength"] + 2, center, axis))


def build(packet):
    parameters = packet["parameters"]
    width = parameters["mouthWidth"]
    deck_z = parameters["deckHeight"]
    parts = []

    def add(name, shape, role, group="fixed", reference=False, proxy=None):
        parts.append({"id": name, "shape": shape, "role": role, "group": group,
                      "reference": reference, "proxy": proxy})

    for roller in packet["contact"]["rollers"]:
        length = roller["x"][1] - roller["x"][0]
        center = (sum(roller["x"]) / 2, roller["y"], roller["z"])
        group = "float" if roller["floating"] else "pickup"
        axis = (1, 0, 0)
        add(roller["id"] + "_tube", ring(40, 34, length, center, axis), "tube", group)
        add(roller["id"] + "_rubber", ring(63.5, 40, length, center, axis), "rubber", group,
            proxy=cylinder(63.5 - parameters["compressionLimit"], length, center, axis))
        add(roller["id"] + "_shaft", cylinder(6.35, length, center, axis), "shaft", group)

    toe = parameters["toeY"]
    crest = parameters["crestY"]
    slope = deck_z / (crest - toe)
    vertical_thickness = parameters["plateThickness"] * math.hypot(1, slope)
    polygon = [(toe, 0), (crest, deck_z), (crest, deck_z - vertical_thickness),
               (toe + vertical_thickness / slope, 0)]
    ramp = cq.Workplane("YZ", origin=(-width / 2, 0, 0)).polyline(polygon).close().extrude(width).val()
    add("pickup_flat_ramp_mitered_toe", ramp, "plate", "pickup")
    deck = box((width, 680 - crest, 4), (0, (680 + crest) / 2, deck_z - 2))
    for finger_x in packet["receiver"]["fingerX"]:
        deck = deck.cut(box((18, 58, 8), (finger_x, parameters["receiverY"], deck_z - 2)))
    deck = deck.cut(box((44, 24, 8), (0, 320, deck_z - 2)))
    add("fixed_flat_deck_receiver_slots", deck, "plate")

    for station in packet["orienter"]:
        for side in [-1, 1]:
            center = (side * station["x"], station["y"], deck_z + 70)
            prefix = f'orienter_{station["id"]}_{"left" if side < 0 else "right"}'
            add(prefix + "_shaft", cylinder(12.7, 140, center, (0, 0, 1)), "shaft")
            add(prefix + "_rubber", ring(35, 12.7, 140, center, (0, 0, 1)), "rubber",
                proxy=cylinder(27, 140, center, (0, 0, 1)))

    back_y = parameters["receiverY"] + parameters["coralLength"] / 2 + 4
    add("cradle_back_stop", box((100, 4, 30), (0, back_y, deck_z + 15)), "retainer")
    for side in [-1, 1]:
        add(f"cradle_side_rail_{side}", box((6, 270, 30), (side * 73, 485, deck_z + 15)), "retainer")
    add("front_stop_antibounce_flexible_tab", box((40, 18, 2), (0, 319, deck_z - 5)), "retainer", "tab")

    add("bumper_reference", box((870, 85, 120), (0, -42.5, 105)), "bumper", reference=True)
    for side in [-1, 1]:
        add(f"chassis_side_reference_{side}", box((30, 760, 30), (side * 335, 380, 65)), "chassis", reference=True)
    for longitudinal in [15, 745]:
        add(f"chassis_end_reference_{longitudinal}", box((640, 30, 30), (0, longitudinal, 65)), "chassis", reference=True)
    add("floor_reference", box((1400, 1600, 10), (0, 100, -5)), "floor", reference=True)
    for finger_x in packet["receiver"]["fingerX"]:
        add(f"receiver_finger_reference_{finger_x}", box((10, 50, 5), (finger_x, parameters["receiverY"], 165)),
            "receiver", "receiver", reference=True)
    add("coral_reference", coral_shape(parameters, packet["receiver"]["center"], 0), "coral", "coral", True)
    return parts


def posed(parts, packet, angle=0, float_mm=0, piece=None, finger_lift=0, tab_closed=True):
    placed = []
    pivot = (0, *packet["pivot"])
    for part in parts:
        shape = part["shape"]
        proxy = part["proxy"]
        state = "fixed"
        if part["group"] in {"pickup", "float"}:
            shift = float_mm if part["group"] == "float" else 0
            shape = shape.translate((0, 0, shift)).rotate(pivot, (1, *packet["pivot"]), angle)
            if proxy is not None:
                proxy = proxy.translate((0, 0, shift)).rotate(pivot, (1, *packet["pivot"]), angle)
            state = (angle, shift)
        elif part["group"] == "coral" and piece is not None:
            shape = coral_shape(packet["parameters"], piece["center"], piece["yaw"])
            state = (tuple(piece["center"]), piece["yaw"])
        elif part["group"] == "receiver":
            shape = shape.translate((0, 0, finger_lift))
            state = finger_lift
        elif part["group"] == "tab":
            if tab_closed:
                shape = shape.rotate((0, 310, 176), (1, 310, 176), 90)
            state = tab_closed
        placed.append({**part, "shape": shape, "proxy": proxy, "bounds": bounds(shape), "state": state})
    return placed


class CollisionCheck:
    def __init__(self):
        self.cache = {}
        self.pairs = 0
        self.cache_hits = 0
        self.broadphase_rejections = 0
        self.booleans = 0
        self.intended_contacts = 0
        self.failures = []

    def pair(self, first, second, label):
        self.pairs += 1
        if first["group"] == second["group"] and first["group"] in {"fixed", "pickup", "float"}:
            states = "rigid-relative"
        else:
            states = (first["state"], second["state"])
        key = (first["id"], second["id"], str(states))
        if key in self.cache:
            self.cache_hits += 1
            result = self.cache[key]
        elif any(min(first["bounds"][axis + 3], second["bounds"][axis + 3]) -
                 max(first["bounds"][axis], second["bounds"][axis]) <= 1e-7 for axis in range(3)):
            self.broadphase_rejections += 1
            result = {"volume": 0}
            self.cache[key] = result
        else:
            self.booleans += 1
            volume = first["shape"].intersect(second["shape"]).Volume()
            result = {"volume": volume}
            if volume > TOLERANCE and {first["role"], second["role"]} == {"coral", "rubber"}:
                rubber = first if first["role"] == "rubber" else second
                coral = second if first["role"] == "rubber" else first
                residual = rubber["proxy"].intersect(coral["shape"]).Volume()
                self.booleans += 1
                result = {"volume": residual, "compliantIntersection": volume,
                          "allowanceMm": 8, "assumptionNotPhysicalPass": True}
                self.intended_contacts += 1
            self.cache[key] = result
        if result["volume"] > TOLERANCE:
            failure = {"sample": label, "pair": [first["id"], second["id"]], **result}
            self.failures.append(failure)

    def all_pairs(self, parts, label):
        for first, second in itertools.combinations(parts, 2):
            self.pair(first, second, label)

    def summary(self):
        return {"pairVisits": self.pairs, "cacheHits": self.cache_hits,
                "broadphaseRejections": self.broadphase_rejections, "fullBrepBooleans": self.booleans,
                "intentionalCompliantContacts": self.intended_contacts,
                "unexpectedCount": len(self.failures), "witnesses": self.failures[:30]}


def render(parts, directory, name, view):
    renderer = vtk.vtkRenderer()
    renderer.SetBackground(0.92, 0.95, 0.96)
    renderer.SetBackground2(0.77, 0.83, 0.85)
    renderer.GradientBackgroundOn()
    for part in parts:
        if part["role"] == "floor":
            continue
        vertices, triangles = part["shape"].tessellate(0.6, 0.2)
        points = vtk.vtkPoints()
        for vertex in vertices:
            points.InsertNextPoint(vertex.x, vertex.y, vertex.z)
        cells = vtk.vtkCellArray()
        for triangle in triangles:
            cells.InsertNextCell(3)
            for index in triangle:
                cells.InsertCellPoint(index)
        data = vtk.vtkPolyData()
        data.SetPoints(points)
        data.SetPolys(cells)
        mapper = vtk.vtkPolyDataMapper()
        mapper.SetInputData(data)
        actor = vtk.vtkActor()
        actor.SetMapper(mapper)
        actor.GetProperty().SetColor(*COLORS[part["role"]])
        actor.GetProperty().SetSpecular(0.15)
        renderer.AddActor(actor)
    camera = renderer.GetActiveCamera()
    focal = (0, 110, 290)
    camera.SetFocalPoint(*focal)
    offsets = {"iso": (1200, -1550, 1000), "side": (1600, 0, 0), "plan": (0, 0, 1800)}
    camera.SetPosition(*[focal[index] + offsets[view][index] for index in range(3)])
    camera.SetViewUp(0, 1, 0) if view == "plan" else camera.SetViewUp(0, 0, 1)
    camera.ParallelProjectionOn()
    renderer.ResetCamera()
    window = vtk.vtkRenderWindow()
    window.SetOffScreenRendering(1)
    window.SetMultiSamples(4)
    window.SetSize(1600, 1000)
    window.AddRenderer(renderer)
    window.Render()
    image = vtk.vtkWindowToImageFilter()
    image.SetInput(window)
    image.ReadFrontBufferOff()
    image.Update()
    writer = vtk.vtkPNGWriter()
    writer.SetFileName(str(directory / (name + ".png")))
    writer.SetInputConnection(image.GetOutputPort())
    writer.Write()
    depth = vtk.vtkWindowToImageFilter()
    depth.SetInput(window)
    depth.SetInputBufferTypeToZBuffer()
    depth.ReadFrontBufferOff()
    depth.Update()
    pixels = vtk_to_numpy(depth.GetOutput().GetPointData().GetScalars())
    check = {"file": name + ".png", "foregroundDepthPixels": int((pixels < 0.9999).sum()),
             "depthMin": float(pixels.min()), "depthMax": float(pixels.max()), "renderer": "VTK per-pixel depth buffer"}
    window.Finalize()
    assert check["foregroundDepthPixels"] > 10000, check
    return check


def validate(packet, parts):
    checks = {part["id"]: solid_check(part["shape"]) for part in parts}
    assert all(check["valid"] and check["closed"] and check["solids"] == 1 and check["volumeMm3"] > 0
               for check in checks.values()), "Nonclosed, invalid, or disconnected component"
    sweep = CollisionCheck()
    for index, sample in enumerate(packet["sweep"]["samples"]):
        sweep.all_pairs(posed(parts, packet, sample["angle"], sample["float"]), f"deployment:{index}")
    print(json.dumps({"variant": packet["name"], "deployment": sweep.summary()}), flush=True)
    entry_reports = []
    for trial in packet["entryTrials"]:
        entry = CollisionCheck()
        for index, sample in enumerate(trial["samples"]):
            delta = sample["y"] - packet["contact"]["rollers"][0]["y"]
            loaded_distance = 57.15 + 63.5 - packet["parameters"]["preloadCompression"]
            requested = max(0, sample["z"] + math.sqrt(max(0, loaded_distance ** 2 - delta ** 2)) - 169) if abs(delta) < loaded_distance else 0
            float_mm = min(packet["parameters"]["frontFloat"], requested)
            state = {"center": [0, sample["y"], sample["z"]], "yaw": trial["yaw"]}
            placed = posed(parts, packet, float_mm=float_mm, piece=state, tab_closed=False)
            entry.all_pairs(placed, f"entry:{trial['yaw']}:{index}")
        entry_reports.append({"yaw": trial["yaw"], "samples": len(trial["samples"]), **entry.summary()})
        print(json.dumps({"variant": packet["name"], "entryYaw": trial["yaw"], "failures": len(entry.failures)}), flush=True)
    yaw = CollisionCheck()
    for index, state in enumerate(packet["yaw"]["path"]):
        placed = posed(parts, packet, piece={"center": [0, state[0], 237.15], "yaw": state[1]},
                       tab_closed=state[0] - 150.8125 > 314)
        yaw.all_pairs(placed, f"yaw:{index}")
    receiver = CollisionCheck()
    contact_top = 237.15 - math.sqrt(57.15 ** 2 - 35 ** 2)
    for index in range(63):
        travel = (contact_top - 167.5 + 180) * index / 62
        coral_lift = max(0, travel - (contact_top - 167.5))
        placed = posed(parts, packet, finger_lift=travel,
                       piece={"center": [0, 465, 237.15 + coral_lift], "yaw": 0})
        receiver.all_pairs(placed, f"receiver:{index}")
    return {"solids": checks, "modeledOccurrences": len(parts), "customOccurrences": sum(not part["reference"] for part in parts),
            "deployment": {"samples": 126, **sweep.summary()}, "entry": entry_reports,
            "yaw": {"samples": len(packet["yaw"]["path"]), **yaw.summary()},
            "receiver": {"samples": 63, "liftMm": 180, **receiver.summary()},
            "allModeledPairsVisited": True, "omittedHardwareNotClaimedTested": True}


def main():
    results = []
    for name in ["baseline", "revision"]:
        packet = json.loads((ROOT / f"{name}-layout.json").read_text())
        assert packet["status"] == "PASS_COARSE_ENVELOPES_ONLY"
        parts = build(packet)
        report = validate(packet, parts)
        nominal = next(entry for entry in report["entry"] if entry["yaw"] == 90)
        core_pass = all(report[group]["unexpectedCount"] == 0 for group in ["deployment", "yaw", "receiver"]) and nominal["unexpectedCount"] == 0
        report["status"] = "PASS_MODELED_CORE_ONLY" if core_pass else "FAIL_MODELED_CORE"
        report["frozen"] = False
        report["geometrySecondsCumulative"] = time.monotonic() - STARTED
        save(f"{name}-brep.json", report)
        directory = ROOT / name
        directory.mkdir(exist_ok=True)
        deployed = posed(parts, packet)
        stowed = posed(parts, packet, packet["stowAngle"])
        custom = cq.Compound.makeCompound([part["shape"] for part in deployed if not part["reference"]])
        cq.exporters.export(custom, str(directory / "contact-core.step"))
        image_checks = [render(deployed, directory, "deployed", "iso"),
                        render(deployed, directory, "side", "side"),
                        render(deployed, directory, "plan", "plan"),
                        render(stowed, directory, "stowed", "iso")]
        accepted = posed(parts, packet, finger_lift=180 + 237.15 - math.sqrt(57.15 ** 2 - 35 ** 2) - 167.5,
                         piece={"center": [0, 465, 417.15], "yaw": 0})
        image_checks.append(render(accepted, directory, "receiver-probe", "iso"))
        save(f"{name}/previews.json", image_checks)
        save(f"{name}/component-inventory.json", [{"id": part["id"], "role": part["role"],
            "group": part["group"], "referenceOnly": part["reference"], "sourceClass": "NOT_COTS",
            "geometry": report["solids"][part["id"]]} for part in parts])
        results.append({"variant": name, "status": report["status"], "occurrences": len(parts),
                        "deploymentFailures": report["deployment"]["unexpectedCount"],
                        "nominalEntryFailures": nominal["unexpectedCount"],
                        "yawFailures": report["yaw"]["unexpectedCount"], "receiverFailures": report["receiver"]["unexpectedCount"],
                        "entryOrientations": [{"yaw": entry["yaw"], "failures": entry["unexpectedCount"]} for entry in report["entry"]]})
        print(json.dumps(results[-1]), flush=True)
    preservation = {"sources": [], "placementTransforms": [], "vendorBodiesInCustomExports": 0,
                    "status": "ORIGINALS_HASHED_NOT_PLACED", "nativeImplementation": "OUT_OF_SCOPE"}
    for name in ["wcp-0941.step", "wcp-0783.step", "wcp-1016.step", "wcp-0137.step"]:
        path = REPO / "trials/subsystem-ab/cots/cache" / name
        preservation["sources"].append({"path": path.relative_to(REPO).as_posix(),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size,
            "reexportAllowed": False, "originalImportRequired": True})
    preservation["x44BodySemantics"] = "Original body includes presentation output shaft; rear cover fixed. No generated replacement vendor shaft."
    save("original-cots-manifest.json", preservation)
    save("geometry-summary.json", {"variants": results, "seconds": time.monotonic() - STARTED,
        "cadquery": cq.__version__, "apiCalls": 0, "newDownloads": 0, "frozen": False,
        "finishedDemonstrator": False, "manufacturingRelease": False,
        "scope": "Contact geometry core, not a supported, fastened or powered assembly. No hardware omitted from this model is claimed collision-checked."})
    if any(result["status"] != "PASS_MODELED_CORE_ONLY" for result in results):
        raise SystemExit(1)


def boundary_probe():
    packet = json.loads((ROOT / "baseline-layout.json").read_text())
    parts = build(packet)
    fixed_parts = [part for part in parts if part["group"] == "pickup" and part["role"] == "tube"]
    skew_witnesses = []
    for trial in packet["entryTrials"]:
        if trial["yaw"] == 90:
            continue
        witness = None
        for index, sample in enumerate(trial["samples"]):
            coral = coral_shape(packet["parameters"], (0, sample["y"], sample["z"]), trial["yaw"])
            for part in fixed_parts:
                volume = part["shape"].intersect(coral).Volume()
                if volume > TOLERANCE:
                    witness = {"yaw": trial["yaw"], "sampleIndex": index,
                               "coralCenterMm": [0, sample["y"], sample["z"]],
                               "fixedTube": part["id"], "hardIntersectionMm3": volume,
                               "frontFloatCannotRepairFixedTubeCollision": True}
                    break
            if witness is not None:
                break
        skew_witnesses.append(witness or {"yaw": trial["yaw"], "fixedTubeWitness": None})
    retention = CollisionCheck()
    original_tab = next(part for part in parts if part["group"] == "tab")
    for index in range(63):
        angle = 90 * index / 62
        placed = posed(parts, packet)
        tab = next(part for part in placed if part["group"] == "tab")
        tab["shape"] = original_tab["shape"].rotate((0, 310, 176), (1, 310, 176), angle)
        tab["bounds"] = bounds(tab["shape"])
        tab["state"] = angle
        for other in placed:
            if other["id"] != tab["id"]:
                retention.pair(tab, other, f"tab-close:{angle}")
    report = {"fixedTubeSkewWitnesses": skew_witnesses, "retentionClosure": {"samples": 63, **retention.summary()},
              "status": "FAIL_REQUIRED_LAYOUT_GATES", "physicalPerformance": "UNVERIFIED",
              "note": "No edits to geometry; test additional required states not covered by endpoint receiver clearance."}
    save("boundary-report.json", report)
    print(json.dumps(report, indent=2), flush=True)
    raise SystemExit(1 if any(entry.get("hardIntersectionMm3", 0) > TOLERANCE for entry in skew_witnesses)
                     or retention.failures else 0)


if __name__ == "__main__":
    boundary_probe() if "--boundary" in sys.argv else main()