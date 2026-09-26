import hashlib
import importlib.metadata
import json
import math
from pathlib import Path
import sys
import time

from cad_core import ROOT, NETWORK_EVENTS, bounds, cq, solid_check
from model import geometry, make_design, resolve_model, value
from validate import graph_checks, hole_checks, motion_check


PACKET = ROOT / "packet-v1"
SOURCE_FILES = ["parameters.json", "cad_core.py", "model.py", "validate.py", "package_packet.py", "packet_test.py"]
UPSTREAM = ["trials/subsystem-ab/PROTOCOL.md", "docs/TEAM-PROFILE.md", "research/2025-coral/CONCEPT-DECISION.md", "research/2025-coral/rules.json", "research/2025-coral/cots.json", "research/2025-coral/concept-inputs.json"]
REPOSITORY = ROOT.parents[2]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, allow_nan=False) + "\n", encoding="utf8")


def rotation_matrix(axis, degrees):
    import numpy as np
    direction = np.array(axis, dtype=float)
    direction /= np.linalg.norm(direction)
    cosine, sine = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
    cross = np.array([[0, -direction[2], direction[1]], [direction[2], 0, -direction[0]], [-direction[1], direction[0], 0]])
    return cosine * np.eye(3) + (1 - cosine) * np.outer(direction, direction) + sine * cross


def instance_matrix(item, controls, angle, pivot):
    import numpy as np
    matrix = np.eye(4)
    if item["rotation"]:
        matrix[:3, :3] = rotation_matrix(item["rotation"]["axis"], item["rotation"]["angleDeg"])
    matrix[:3, 3] = value(item["originMm"], controls)
    if item["motionGroup"] in {"pickup", "pickup_input"}:
        group = np.eye(4)
        group[:3, :3] = rotation_matrix([1, 0, 0], angle)
        group[:3, 3] = pivot
        matrix = group @ matrix
    return matrix


def transform_solid(shape, matrix):
    import numpy as np
    from OCP.gp import gp_Trsf
    rotation = matrix[:3, :3]
    if not np.allclose(rotation.T @ rotation, np.eye(3), atol=1e-10) or abs(np.linalg.det(rotation) - 1) > 1e-10:
        raise ValueError("Only proper rigid instance frames are allowed")
    transform = gp_Trsf()
    transform.SetValues(*[float(matrix[row, column]) for row in range(3) for column in range(4)])
    return shape.moved(cq.Location(transform))


def mate_frames(design, controls, angle=0):
    import numpy as np
    records = {item["id"]: item for item in design["instances"]}
    frames = {name: instance_matrix(item, controls, angle, design["parameters"]["pivotOriginMm"]) for name, item in records.items()}
    result = []
    for joint in design["joints"]:
        child = records[joint["child"]]
        joint_frame = np.eye(4)
        if joint["type"] == "FASTENED":
            joint_frame = frames[joint["child"]].copy()
        else:
            origin = np.array(value(joint["originParentGroupMm"], controls), dtype=float)
            axis = np.array(joint["axisParentGroup"], dtype=float)
            if child["motionGroup"] in {"pickup", "pickup_input"}:
                rotate = rotation_matrix([1, 0, 0], angle)
                origin = rotate @ origin + design["parameters"]["pivotOriginMm"]
                axis = rotate @ axis
            reference = np.array([0., 1., 0.]) if abs(axis[1]) < 0.9 else np.array([1., 0., 0.])
            first_axis = reference - np.dot(reference, axis) * axis
            first_axis /= np.linalg.norm(first_axis)
            joint_frame[:3, :3] = np.column_stack([first_axis, np.cross(axis, first_axis), axis])
            joint_frame[:3, 3] = origin
        parent_local = np.linalg.inv(frames[joint["parent"]]) @ joint_frame
        child_local = np.linalg.inv(frames[joint["child"]]) @ joint_frame
        error = np.max(np.abs(frames[joint["parent"]] @ parent_local - frames[joint["child"]] @ child_local))
        result.append({**joint, "worldJointFrameRowMajorMm": joint_frame.tolist(), "parentPartLocalFrameRowMajorMm": parent_local.tolist(), "childPartLocalFrameRowMajorMm": child_local.tolist(), "coincidenceError": float(error), "nativeStatus": "UNVERIFIED"})
    return result


def expression(item):
    return str(item) if isinstance(item, (int, float)) else "(" + item + ")"


def add_expression(first, second):
    return "(" + expression(first) + " + " + expression(second) + ")"


def fs_vector(coordinates):
    return "vector(" + ", ".join(expression(item) for item in coordinates) + ") * millimeter"


def featurescript(design):
    output = ["FeatureScript 3070;", 'import(path : "onshape/std/geometry.fs", version : "3070.0");', "", 'annotation { "Feature Type Name" : "Concept A shared engineering" }', "export const conceptAShared = defineFeature(function(context is Context, id is Id, definition is map)", "    precondition", "    {", '        annotation { "Name" : "Pickup mouth width" }', "        isLength(definition.mouthWidth, { (millimeter) : [480, 500, 520] } as LengthBoundSpec);", '        annotation { "Name" : "Receiver height datum" }', "        isLength(definition.receiverHeight, { (millimeter) : [300, 320, 360] } as LengthBoundSpec);", '        annotation { "Name" : "Study only: COTS envelopes" }', "        definition.includeCotsEnvelopes is boolean;", '        annotation { "Name" : "Show nominal coral reference" }', "        definition.includeCoralReference is boolean;", "    }", "    {", "        const mouthWidth = definition.mouthWidth / millimeter;", "        const receiverHeight = definition.receiverHeight / millimeter;"]
    layouts = {}

    def emit_primitive(description, token, layout):
        kind = description["kind"]
        center = [add_expression(coordinate, layout[index]) for index, coordinate in enumerate(description["center"])]
        operation_id = 'id + "' + token + '"'
        query = "qCreatedBy(" + operation_id + ", EntityType.BODY)"
        if kind == "box":
            lower = [add_expression(center[index], "-" + expression(description["size"][index]) + "/2") for index in range(3)]
            upper = [add_expression(center[index], expression(description["size"][index]) + "/2") for index in range(3)]
            output.append("        fCuboid(context, " + operation_id + ', { "corner1" : ' + fs_vector(lower) + ', "corner2" : ' + fs_vector(upper) + " });")
        elif kind == "cylinder":
            axis_index = 0 if description["axis"] == "x" else 2
            lower, upper = list(center), list(center)
            lower[axis_index] = add_expression(lower[axis_index], "-" + expression(description["length"]) + "/2")
            upper[axis_index] = add_expression(upper[axis_index], expression(description["length"]) + "/2")
            output.append("        fCylinder(context, " + operation_id + ', { "bottomCenter" : ' + fs_vector(lower) + ', "topCenter" : ' + fs_vector(upper) + ', "radius" : ' + expression(description["radius"]) + " * millimeter });")
        elif kind in {"polygon", "hex"}:
            axis = description["axis"]
            if kind == "hex":
                radius = expression(description["acrossFlats"]) + "/sqrt(3)"
                points = [["(" + radius + ")*" + str(math.cos(math.radians(30 + 60 * index))), "(" + radius + ")*" + str(math.sin(math.radians(30 + 60 * index)))] for index in range(6)]
                start = "-" + expression(description["length"]) + "/2"
            else:
                points = description["points"]
                start = description["start"]
            center[0 if axis == "x" else 2] = add_expression(center[0 if axis == "x" else 2], start)
            normal = "vector(1, 0, 0)" if axis == "x" else "vector(0, 0, 1)"
            horizontal = "vector(0, 1, 0)" if axis == "x" else "vector(1, 0, 0)"
            sketch = "sketch_" + token
            output.append("        const " + sketch + ' = newSketchOnPlane(context, id + "' + token + '_sk", { "sketchPlane" : plane(' + fs_vector(center) + ", " + normal + ", " + horizontal + ") });")
            for index, point in enumerate(points):
                following = points[(index + 1) % len(points)]
                output.append("        skLineSegment(" + sketch + ', "edge' + str(index) + '", { "start" : ' + fs_vector(point) + ', "end" : ' + fs_vector(following) + " });")
            output.append("        skSolve(" + sketch + ");")
            output.append("        opExtrude(context, " + operation_id + ', { "entities" : qSketchRegion(id + "' + token + '_sk"), "direction" : ' + normal + ', "endBound" : BoundingType.BLIND, "endDepth" : ' + expression(description["length"]) + " * millimeter });")
            output.append('        opDeleteBodies(context, id + "' + token + '_clean", { "entities" : qCreatedBy(id + "' + token + '_sk", EntityType.BODY) });')
        elif kind == "capsule":
            first, second = [0, 0], description["second"]
            distance = math.hypot(*second)
            normal_y, normal_z = -second[1] / distance, second[0] / distance
            points = [[add_expression(endpoint[0], expression(description["radius"]) + "*" + str(sign * normal_y)), add_expression(endpoint[1], expression(description["radius"]) + "*" + str(sign * normal_z))] for endpoint, sign in [(first, 1), (second, 1), (second, -1), (first, -1)]]
            pieces = [{"kind": "polygon", "center": description["center"], "points": points, "length": description["length"], "start": "-" + expression(description["length"]) + "/2", "axis": "x"}]
            for endpoint in [first, second]:
                pieces.append({"kind": "cylinder", "center": [description["center"][0], add_expression(description["center"][1], endpoint[0]), add_expression(description["center"][2], endpoint[1])], "radius": description["radius"], "length": description["length"], "axis": "x"})
            queries = [emit_primitive(piece, token + "sub" + str(index), layout) for index, piece in enumerate(pieces)]
            output.append("        opBoolean(context, " + operation_id + ', { "tools" : qUnion([' + ", ".join(queries) + ']), "operationType" : BooleanOperationType.UNION });')
            query = "qUnion([" + ", ".join(queries) + ", " + query + "])"
        else:
            raise ValueError("Unsupported native source primitive")
        return query

    for index, (name, part) in enumerate(design["parts"].items()):
        layout = [(index % 6) * 1200, (index // 6) * 1500, 0]
        layouts[name] = layout
        condition = "definition.includeCotsEnvelopes" if part["category"] == "cots-envelope" else "definition.includeCoralReference" if name == "coral_reference" else "true"
        output.extend(["        if (" + condition + ")", "        {"])
        body_name = "body" + str(index)
        for operation_index, operation in enumerate(part["recipe"]):
            token = "part" + str(index) + "primitive" + str(operation_index)
            tool_query = emit_primitive(operation["primitive"], token, layout)
            if operation_index == 0:
                output.append("        var " + body_name + " = " + tool_query + ";")
            elif operation["operation"] == "add":
                boolean_id = 'id + "part' + str(index) + "union" + str(operation_index) + '"'
                output.append("        opBoolean(context, " + boolean_id + ', { "tools" : qUnion([' + body_name + ", " + tool_query + ']), "operationType" : BooleanOperationType.UNION });')
                output.append("        " + body_name + " = qUnion([" + body_name + ", " + tool_query + ", qCreatedBy(" + boolean_id + ", EntityType.BODY)]);")
            else:
                output.append('        opBoolean(context, id + "part' + str(index) + "cut" + str(operation_index) + '", { "tools" : ' + tool_query + ', "targets" : ' + body_name + ', "operationType" : BooleanOperationType.SUBTRACTION, "keepTools" : false });')
        output.append('        setProperty(context, { "entities" : ' + body_name + ', "propertyType" : PropertyType.NAME, "value" : "' + name + '" });')
        output.append("        if (size(evaluateQuery(context, " + body_name + ")) != 1) throw regenError(\"Expected one solid: " + name + "\");")
        output.append("        }")
    output.extend(['    }, { "mouthWidth" : 500 * millimeter, "receiverHeight" : 320 * millimeter, "includeCotsEnvelopes" : false, "includeCoralReference" : false });', ""])
    return "\n".join(output), layouts


def preview(placed, design, path, title):
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    camera = np.array([1.2, -1.7, 1.05])
    camera /= np.linalg.norm(camera)
    right = np.cross([0, 0, 1], camera)
    right /= np.linalg.norm(right)
    upward = np.cross(camera, right)
    colors = {"custom": (75, 155, 186), "reference": (154, 161, 168), "cots-envelope": (215, 152, 62)}
    records = {item["id"]: item for item in design["instances"]}
    triangles, projected_points = [], []
    for name, shape in placed.items():
        vertices, faces = shape.tessellate(1.5, 0.22)
        points = np.array([[point.x, point.y, point.z] for point in vertices])
        projected = np.column_stack([points @ right, -(points @ upward)])
        projected_points.extend(projected.tolist())
        base_color = (190, 67, 55) if name == "bumper" else (230, 233, 217) if name == "held_coral" else (58, 68, 72) if "belt" in name else colors[design["parts"][records[name]["part"]]["category"]]
        for face in faces:
            triangle = points[list(face)]
            normal = np.cross(triangle[1] - triangle[0], triangle[2] - triangle[0])
            length = np.linalg.norm(normal)
            brightness = 0.58 + 0.42 * abs(np.dot(normal / length, camera)) if length else 0.6
            color = tuple(int(channel * brightness) for channel in base_color)
            triangles.append((float(np.mean(triangle @ camera)), projected[list(face)].tolist(), color))
    projected_points = np.array(projected_points)
    minimum, maximum = projected_points.min(axis=0), projected_points.max(axis=0)
    scale = min(1500 / (maximum[0] - minimum[0]), 900 / (maximum[1] - minimum[1]))
    image = Image.new("RGB", (1620, 1100), (246, 247, 248))
    painter = ImageDraw.Draw(image)
    for depth, points, color in sorted(triangles, key=lambda item: item[0]):
        pixels = [((point[0] - minimum[0]) * scale + 60, (point[1] - minimum[1]) * scale + 105) for point in points]
        painter.polygon(pixels, fill=color)
    font = ImageFont.load_default(size=25)
    painter.text((40, 20), title, fill=(23, 32, 39), font=font)
    painter.text((40, 57), "LOCAL CAD / NOT RELEASED / motion gate FAIL - see validation.json", fill=(172, 39, 39), font=ImageFont.load_default(size=18))
    painter.text((40, 1050), "Blue: custom   Gold: COTS envelopes, NOT vendor geometry   Red: full bumper keepout   Gray: references", fill=(30, 38, 46), font=ImageFont.load_default(size=17))
    image.save(path)
    colors_used = image.getcolors(image.width * image.height)
    return {"width": image.width, "height": image.height, "colorCount": len(colors_used), "nonBackgroundPixels": sum(count for count, color in colors_used if color != (246, 247, 248)), "renderer": "Pillow 11.3.0 painter projection of real CadQuery/OCP B-rep tessellation; no CAD engine substitution"}


def export_variant(design, variant, directory):
    controls = design["parameters"][variant]
    shapes, deployed = resolve_model(design, controls)
    directory.mkdir(parents=True, exist_ok=True)
    part_results = {}
    for name, shape in shapes.items():
        part_file = directory / "parts" / (name + ".step")
        part_file.parent.mkdir(exist_ok=True)
        assembly = cq.Assembly(name=name + "_neutral_export")
        assembly.add(shape, name=name)
        assembly.save(str(part_file), exportType="STEP", mode="default")
        reimported = cq.importers.importStep(str(part_file)).val()
        measurement = solid_check(reimported)
        assert measurement["valid"] and measurement["closed"] and measurement["solids"] == 1
        assert abs(measurement["volumeMm3"] - shape.Volume()) < max(0.01, shape.Volume() * 1e-7)
        part_results[name] = {"neutralStep": "parts/" + name + ".step", "sha256": sha(part_file), "measured": measurement, "roundTrip": "PASS"}
    poses = {}
    for pose, angle in [("deployed", 0), ("mid", -72.5), ("stowed", -145)]:
        frames = {item["id"]: instance_matrix(item, controls, angle, design["parameters"]["pivotOriginMm"]) for item in design["instances"]}
        placed = {}
        assembly = cq.Assembly(name="Concept_A_" + variant + "_" + pose)
        for item in design["instances"]:
            matrix = frames[item["id"]]
            shape = transform_solid(shapes[item["part"]], matrix)
            placed[item["id"]] = shape
            assembly.add(shape, name=item["id"])
        step = directory / (pose + ".step")
        assembly.save(str(step), exportType="STEP", mode="default")
        readback = cq.importers.importStep(str(step)).val()
        assert len(readback.Solids()) == len(placed)
        assert readback.isValid()
        png = directory / (pose + ".png")
        image_check = preview(placed, design, png, "Concept A | " + variant + " | " + pose + " | mouth " + str(controls["mouthWidth"]) + " mm")
        poses[pose] = {"angleDeg": angle, "step": step.name, "stepSha256": sha(step), "solidCount": len(readback.Solids()), "nativeInstanceTargetExcludingCoral": len(placed) - 1, "preview": png.name, "previewCheck": image_check, "instanceTransformsRowMajorMm": {name: matrix.tolist() for name, matrix in frames.items()}, "boundsMm": bounds(readback)}
    return {"controls": controls, "parts": part_results, "poses": poses, "mateFramesDeployed": mate_frames(design, controls)}


def binding_manifest(design):
    catalog_ids = {"x44_envelope": "x44", "hex_bearing_envelope": "hex_bearing", "pinion_16_envelope": "spline_pinion", "gear_48_envelope": "hex_output_gear", "deploy_motor_reducer_envelope": None}
    return {"status": "PENDING_PARENT_COTS_BINDINGS", "doNotRelabelEnvelopesAsVendor": True, "localGeometryFrozen": True, "pairedTrialAdmission": "BLOCKED", "roles": [{"partRole": name, "instances": [item["id"] for item in design["instances"] if item["part"] == name], "researchCandidateId": catalog_ids[name], "authenticFile": None, "sourceUrl": None, "sourceVersion": None, "sha256": None, "interfaceCrossCheck": "PENDING", "geometryStatus": "NOT_VENDOR_GEOMETRY", "substitutionPolicy": "Parent must bind approved vendor geometry and rerun fit/motion; no silent scale, mirror, or mechanical release."} for name, part in design["parts"].items() if part["category"] == "cots-envelope"]}


def main():
    parameters = json.loads((ROOT / "parameters.json").read_text())
    design = make_design(parameters)
    source, layouts = featurescript(design)
    assert source.startswith("FeatureScript 3070;") and source.count("{") == source.count("}")
    assert all("\"" + name + "\"" in source for name in design["parts"])
    assert graph_checks(design)["status"] == "PASS"
    assert max(entry["coincidenceError"] for entry in mate_frames(design, parameters["baseline"])) < 1e-8
    if "--check" in sys.argv:
        print(json.dumps({"sourceEmitter": "PASS_STATIC_ONLY_NOT_ONSHAPE_COMPILE", "uniqueParts": len(layouts), "mateFrameCheck": "PASS", "featureScriptLines": len(source.splitlines())}))
        return
    if (PACKET / "freeze.json").exists():
        raise RuntimeError("Versioned packet already frozen; do not overwrite. Parent must authorize a new version.")
    started = time.perf_counter()
    PACKET.mkdir(exist_ok=True)
    source_dir = PACKET / "source"
    source_dir.mkdir(exist_ok=True)
    for name in SOURCE_FILES:
        (source_dir / name).write_bytes((ROOT / name).read_bytes())
    (source_dir / "concept-a.fs").write_text(source, encoding="utf8")
    write_json(source_dir / "geometry-payload.json", {"schema": "Internal construction recipe, NOT Onshape API JSON", "featureScriptVersionBasis": "3070 inherited from existing local plate.fs; live version and compilation UNVERIFIED", "parts": design["parts"], "partStudioLayoutOffsetsMm": layouts, "sourceToNeutral": "Subtract the role's fixed layout offset before applying its instance matrix; do not use Part Studio layout positions as assembly coordinates."})
    expected = {variant: export_variant(design, variant, PACKET / variant) for variant in ["baseline", "revision"]}
    write_json(PACKET / "expected.json", expected)
    write_json(PACKET / "assembly-contract.json", {**design, "instanceCountIncludingDiagnosticCoral": len(design["instances"]), "nativeInstanceCount": len(design["instances"]) - 1, "requiredNativeBehavior": "Create named instances and actual revolute/fastened mates. A compound STEP or static transforms cannot satisfy the native assembly gate.", "baselineMates": expected["baseline"]["mateFramesDeployed"], "revisionMates": expected["revision"]["mateFramesDeployed"], "nativeStatus": "UNVERIFIED", "geometryHealth": "FAIL", "transformConvention": "4x4 row-major column-vector active transform; mm; neutral part coordinates to world; joint Z axis is revolute axis"})
    write_json(PACKET / "cots-bindings-pending.json", binding_manifest(design))
    (PACKET / "validation.json").write_bytes((ROOT / "validation.json").read_bytes())
    (PACKET / "initial-failed-sweep.json").write_bytes((ROOT / "initial-probe.json").read_bytes())
    (PACKET / "corrected-conveyor-sweep.json").write_bytes((ROOT / "revised-probe.json").read_bytes())
    changes = []
    for name in design["parts"]:
        baseline = expected["baseline"]["parts"][name]["measured"]
        revision = expected["revision"]["parts"][name]["measured"]
        if abs(baseline["volumeMm3"] - revision["volumeMm3"]) > 0.001:
            changes.append({"part": name, "volumeDeltaMm3": revision["volumeMm3"] - baseline["volumeMm3"], "boundsBeforeMm": baseline["boundsMm"], "boundsAfterMm": revision["boundsMm"]})
    receiver_shapes, receiver_placed = resolve_model(design, parameters["receiverControlProbe"])
    receiver_probe = {"controls": parameters["receiverControlProbe"], "receiverBoundsMm": bounds(receiver_placed["receiver"]), "pickupDrumLengthMm": bounds(receiver_shapes["upper_pickup_drum"])[3] - bounds(receiver_shapes["upper_pickup_drum"])[0], "sourceGeometryChanged": abs(receiver_shapes["receiver_reference"].Volume() - expected["baseline"]["parts"]["receiver_reference"]["measured"]["volumeMm3"]) > 0.001, "motion": motion_check(design, parameters["receiverControlProbe"], True)[0]}
    write_json(PACKET / "revision-report.json", {"status": "PASS_LOCAL_GEOMETRY_AND_DATUM_PRESERVATION_ONLY", "geometryMotionStatus": "FAIL_SEE_VALIDATION", "changedSourceParts": changes, "samePartRoleIds": True, "sameInstanceIds": True, "sameMateIds": True, "pivotOriginBeforeMm": parameters["pivotOriginMm"], "pivotOriginAfterMm": parameters["pivotOriginMm"], "receiverAttachmentBefore": expected["baseline"]["poses"]["deployed"]["instanceTransformsRowMajorMm"]["receiver"], "receiverAttachmentAfter": expected["revision"]["poses"]["deployed"]["instanceTransformsRowMajorMm"]["receiver"], "receiverIndependentProbe": receiver_probe, "nativeMatePreservation": "UNVERIFIED_NOT_EXECUTED"})
    write_json(PACKET / "ui-edit-map.json", {"featureName": "Concept A shared engineering", "featureSymbol": "conceptAShared", "source": "source/concept-a.fs", "compilation": "UNVERIFIED_ZERO_LIVE_CALLS", "controls": {"mouthWidth": {"label": "Pickup mouth width", "baselineMm": 500, "revisionMm": 520, "rangeMm": [480, 520], "affectedGeometry": [entry["part"] for entry in changes], "preserved": ["pivot world origin/axis", "receiver source geometry/attachment", "fixed orienter"]}, "receiverHeight": {"label": "Receiver height datum", "baselineMm": 320, "probeMm": 350, "rangeMm": [300, 360], "sourceEffect": "Rough fork leg length = receiverHeight - 110; fork attachment world Z = receiverHeight + 85. Height dimension and assembly placement must both update.", "independentFrom": "mouthWidth"}}, "fixedNotIndependentlyEditableInUI": ["gear teeth/module/pressure angle", "bearing/hex nominal fits", "pivot Y/Z", "transfer ramp profile", "mount hole patterns", "drum diameter", "stow limit"], "assemblyUpdate": "Resolve parts by role, preserve existing instance/mate IDs, recompute parameter-dependent connector positions from contract; do not delete/reinsert to claim identity retention.", "humanUsabilityObserved": False})
    write_json(PACKET / "bom.json", {"mechanicallyReleased": False, "parts": [{"role": name, "quantity": sum(item["part"] == name for item in design["instances"]), "category": part["category"], "manufacturedBomIncluded": part["category"] == "custom", "material": part["material"], "notes": part["notes"]} for name, part in design["parts"].items()], "omittedDetailedHardware": [{"item": "X44 #10-32 motor screws", "nominalQuantity": 12, "status": "Clocking, engagement and exact lengths unverified"}, {"item": "M4 deployment hub bolts", "nominalQuantity": 4, "status": "Bolt pattern modeled; engagement/load review pending"}, {"item": "M6 deck mount bolts", "nominalQuantity": 4, "status": "Deck bores modeled; chassis reference attachment pending"}, {"item": "Shaft collars/retainers", "nominalQuantity": 8, "status": "Envelope/length design pending"}, {"item": "Tower feet, motor adapter, drum hubs, ramp and guard fastening", "nominalQuantity": None, "status": "Incomplete detailed hardware BOM, not counted as released fasteners"}], "rigidModulesNotMonolithicStock": ["pivot_tower", "transfer_ramp", "pickup_side_plate with standoffs", "pickup drums with hubs/tread"], "referencesExcluded": ["chassis", "bumper", "receiver", "held_coral"], "massCostStress": "UNVERIFIED"})
    runtime = {"pythonExecutable": sys.executable, "python": sys.version, "packages": {name: importlib.metadata.version(name) for name in ["cadquery", "cadquery-ocp", "vtk", "Pillow", "reportlab", "pypdfium2"]}, "execution": "Explicit existing manufacturing .venv python.exe -B; isolated -I mode failed visualization DLL loading", "apiCalls": 0, "networkAuditDeniedEvents": NETWORK_EVENTS, "wallSeconds": time.perf_counter() - started}
    write_json(PACKET / "runtime.json", runtime)
    source_hashes = {name: sha(ROOT / name) for name in SOURCE_FILES}
    upstream_hashes = {name: sha(REPOSITORY / name) for name in UPSTREAM}
    artifact_hashes = {str(path.relative_to(PACKET)).replace("\\", "/"): sha(path) for path in sorted(PACKET.rglob("*")) if path.is_file()}
    freeze = {"packetVersion": parameters["packetVersion"], "status": "FROZEN_DIAGNOSTIC_PACKET_NOT_ADMITTED", "apiBrowserAdmission": "BLOCKED", "blockers": ["Unexpected pickup guard/motor-standoff solid overlap", "Intermediate pickup motor/transfer-ramp collision", "Authentic COTS source bindings pending parent", "FeatureScript compilation and actual native assembly not executed", "Deployment 8:1 reducer and mounting/brake not selected"], "sourceSha256": source_hashes, "upstreamSha256": upstream_hashes, "artifactSha256": artifact_hashes, "snapshotRule": "Immutable hashes, no editing this version. Any geometry/COTS repair requires a newly versioned packet and new validations before either arm.", "sharedApiCalls": 0}
    write_json(PACKET / "freeze.json", freeze)
    print(json.dumps({"packet": str(PACKET), "artifactCount": len(artifact_hashes), "stepFiles": len(list(PACKET.rglob("*.step"))), "pngFiles": len(list(PACKET.rglob("*.png"))), "nativeInstances": len(design["instances"]) - 1, "gate": "BLOCKED", "wallSeconds": runtime["wallSeconds"]}))


if __name__ == "__main__":
    main()