import copy
import hashlib
import json

import numpy as np

from model import value
from package_packet import featurescript, rotation_matrix
from v3_model import make_design, pose_matrix


def digest(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def mate_frames(design, controls, angle=0):
    records = {item["id"]: item for item in design["instances"]}
    frames = {name: pose_matrix(item, controls, angle, design["parameters"]["pivotOriginMm"]) for name, item in records.items()}
    result = []
    for joint in design["joints"]:
        child = records[joint["child"]]
        frame = frames[joint["child"]].copy()
        if joint["type"] != "FASTENED":
            origin = np.array(value(joint["originParentGroupMm"], controls), dtype=float)
            axis = np.array(joint["axisParentGroup"], dtype=float)
            if child["motionGroup"] in {"pickup", "pickup_input"}:
                rotate = rotation_matrix([1, 0, 0], angle)
                origin = rotate @ origin + design["parameters"]["pivotOriginMm"]
                axis = rotate @ axis
            reference = np.array([0., 1., 0.]) if abs(axis[1]) < 0.9 else np.array([1., 0., 0.])
            horizontal = reference - np.dot(reference, axis) * axis
            horizontal /= np.linalg.norm(horizontal)
            frame[:3, :3] = np.column_stack([horizontal, np.cross(axis, horizontal), axis])
            frame[:3, 3] = origin
        parent = np.linalg.inv(frames[joint["parent"]]) @ frame
        child_local = np.linalg.inv(frames[joint["child"]]) @ frame
        error = np.max(np.abs(frames[joint["parent"]] @ parent - frames[joint["child"]] @ child_local))
        result.append({**joint, "worldJointFrameRowMajorMm": frame.tolist(), "parentPartLocalFrameRowMajorMm": parent.tolist(), "childPartLocalFrameRowMajorMm": child_local.tolist(), "coincidenceError": float(error), "parentConnectorRole": joint["id"] + "_parent", "childConnectorRole": joint["id"] + "_child", "nativeStatus": "UNVERIFIED"})
    return result


def connector_contract(design):
    controls = design["parameters"]["baseline"]
    base = mate_frames(design, controls)
    width = mate_frames(design, {**controls, "mouthWidth": controls["mouthWidth"] + 1})
    height = mate_frames(design, {**controls, "receiverHeight": controls["receiverHeight"] + 1})
    records = {item["id"]: item for item in design["instances"]}
    connectors = []
    for original, wide, tall in zip(base, width, height):
        if original["child"] == "held_coral":
            continue
        for end in ["parent", "child"]:
            key = end + "PartLocalFrameRowMajorMm"
            matrix = np.array(original[key])
            connectors.append({"id": original[end + "ConnectorRole"], "part": records[original[end]]["part"], "instance": original[end], "mate": original["id"], "matrixAtBaseline": matrix.tolist(), "perMouthWidthMm": (np.array(wide[key]) - matrix).tolist(), "perReceiverHeightMm": (np.array(tall[key]) - matrix).tolist()})
    errors = []
    for controls_probe in [{"mouthWidth": 480, "receiverHeight": 300}, {"mouthWidth": 510, "receiverHeight": 350}, design["parameters"]["revision"]]:
        actual = {row["id"]: row for row in mate_frames(design, controls_probe)}
        for connector in connectors:
            predicted = np.array(connector["matrixAtBaseline"]) + np.array(connector["perMouthWidthMm"]) * (controls_probe["mouthWidth"] - controls["mouthWidth"]) + np.array(connector["perReceiverHeightMm"]) * (controls_probe["receiverHeight"] - controls["receiverHeight"])
            end = "parent" if connector["id"].endswith("_parent") else "child"
            errors.append(float(np.max(np.abs(predicted - actual[connector["mate"]][end + "PartLocalFrameRowMajorMm"]))))
    if max(errors) > 1e-8:
        raise ValueError("Non-affine source connector position")
    return {"status": "PASS_LOCAL_FRAME_ALGEBRA", "baselineControls": controls, "connectors": connectors, "evaluatedConnectorFrames": len(errors), "maximumFrameError": max(errors), "nativeConnectorIds": "OBSERVE_AFTER_SOURCE_REGENERATION_NOT_FABRICATED"}


def source_candidate(design, contract):
    custom = copy.deepcopy(design)
    custom["parts"] = {name: part for name, part in design["parts"].items() if part["category"] != "cots"}
    source, layouts = featurescript(custom)
    source = source.replace('Concept A shared engineering', 'Concept A v3 prototype')
    cots = [name for name, part in design["parts"].items() if part["category"] == "cots"]
    queries = ['        annotation { "Name" : "Bind imported COTS connectors" }', '        definition.bindCots is boolean;']
    for role in cots:
        queries.extend(['        annotation { "Name" : "' + role + '", "Filter" : EntityType.BODY && BodyType.SOLID, "MaxNumberOfPicks" : 1 }', '        definition.' + role + ' is Query;'])
    source = source.replace('        definition.includeCoralReference is boolean;', '        definition.includeCoralReference is boolean;\n' + '\n'.join(queries))

    def emit(connector, owner, layout):
        matrix = np.array(connector["matrixAtBaseline"])
        if not np.allclose(np.array(connector["perMouthWidthMm"])[:3, :3], 0) or not np.allclose(np.array(connector["perReceiverHeightMm"])[:3, :3], 0):
            raise ValueError("Connector rotation depends on parameter")
        coordinates = []
        for index in range(3):
            coordinates.append(str(float(matrix[index, 3] + layout[index])) + ' + (mouthWidth - 500) * ' + str(connector["perMouthWidthMm"][index][3]) + ' + (receiverHeight - 320) * ' + str(connector["perReceiverHeightMm"][index][3]))
        horizontal = ', '.join(str(float(number)) for number in matrix[:3, 0])
        normal = ', '.join(str(float(number)) for number in matrix[:3, 2])
        return '        opMateConnector(context, id + "' + connector["id"] + '", { "coordSystem" : coordSystem(vector(' + ', '.join(coordinates) + ') * millimeter, vector(' + horizontal + '), vector(' + normal + ')), "owner" : ' + owner + ' });'

    for index, role in enumerate(custom["parts"]):
        anchor = '        if (size(evaluateQuery(context, body' + str(index) + ')) != 1) throw regenError("Expected one solid: ' + role + '");'
        lines = [emit(connector, 'body' + str(index), layouts[role]) for connector in contract["connectors"] if connector["part"] == role]
        if source.count(anchor) != 1:
            raise ValueError("Source owner query anchor changed")
        source = source.replace(anchor, anchor + '\n' + '\n'.join(lines))
    cots_lines = ['        if (definition.bindCots)', '        {']
    for role in cots:
        cots_lines.append('        if (size(evaluateQuery(context, definition.' + role + ')) != 1) throw regenError("Bind exactly one source body: ' + role + '");')
        cots_lines.extend(emit(connector, 'definition.' + role, [0, 0, 0]) for connector in contract["connectors"] if connector["part"] == role)
    cots_lines.append('        }')
    source = source.replace('    }, { "mouthWidth"', '\n'.join(cots_lines) + '\n    }, { "mouthWidth"')
    source = source.replace('"includeCoralReference" : false });', '"includeCoralReference" : false, "bindCots" : false' + ''.join(', "' + role + '" : qNothing()' for role in cots) + ' });')
    if source.count('{') != source.count('}') or source.count('opMateConnector(context,') != len(contract["connectors"]):
        raise ValueError("Source connector emission mismatch")
    return source, layouts


if __name__ == "__main__":
    design = make_design()
    contract = connector_contract(design)
    source, layouts = source_candidate(design, contract)
    print(json.dumps({"status": contract["status"], "nativeInstances": len(design["instances"]) - 1, "nativeMates": len(design["joints"]) - 1, "relations": len(design["relations"]), "sourceConnectors": len(contract["connectors"]), "checks": contract["evaluatedConnectorFrames"], "maxError": contract["maximumFrameError"], "sourceLines": len(source.splitlines()), "nativeCompilation": "UNVERIFIED_OFFLINE_ONLY"}))