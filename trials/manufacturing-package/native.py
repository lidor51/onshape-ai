import copy
import json
import math

from geometry import close, require
from safety import ROOT


def parameter(kind, identifier, **values):
    types = {"query": "BTMParameterQueryList-148", "quantity": "BTMParameterQuantity-147",
             "enum": "BTMParameterEnum-145", "boolean": "BTMParameterBoolean-144"}
    return {"btType": types[kind], "parameterId": identifier, **values}


def query_parameter(identifier, query):
    return parameter("query", identifier, queries=[{"btType": "BTMIndividualQuery-138", "queryString": "query=" + query + ";"}])


def created(feature_id, entity):
    require(feature_id.replace("_", "").isalnum(), "Invalid native feature identifier")
    return 'qCreatedBy(makeId("' + feature_id + '"), EntityType.' + entity + ')'


def feature(kind, name, parameters, **values):
    return {"btType": "BTMSketch-151" if kind == "newSketch" else "BTMFeature-134",
            "featureType": kind, "name": name, "parameters": parameters, "suppressed": False, **values}


def plane_feature(width):
    return feature("cPlane", "Left plate inner face - native offset", [
        parameter("enum", "cplaneType", enumName="CPlaneType", value="OFFSET"),
        query_parameter("entities", created("Right", "FACE")),
        parameter("quantity", "offset", expression=f"{width / 2:g} mm"),
        parameter("boolean", "oppositeDirection", value=True)])


def drawing_to_sketch(frame, world_y, world_z):
    origin, horizontal, normal = frame["origin"], frame["x"], frame["normal"]
    vertical = [normal[1] * horizontal[2] - normal[2] * horizontal[1],
                normal[2] * horizontal[0] - normal[0] * horizontal[2],
                normal[0] * horizontal[1] - normal[1] * horizontal[0]]
    delta = [0, world_y - origin[1], world_z - origin[2]]
    return [sum(left * right for left, right in zip(delta, axis)) / 1000 for axis in (horizontal, vertical)]


def sketch_feature(plane_id, frame, values, *, holes=False, downstream=False):
    entities = []
    if not holes and not downstream:
        vertices = [drawing_to_sketch(frame, center_y, center_z) for center_y, center_z in
                    [(0, values["plateBottomZMm"]), (values["plateLengthMm"], values["plateBottomZMm"]),
                     (values["plateLengthMm"], values["plateBottomZMm"] + values["plateHeightMm"]),
                     (0, values["plateBottomZMm"] + values["plateHeightMm"])]]
        for index in range(4):
            start, end = vertices[index], vertices[(index + 1) % 4]
            length = math.dist(start, end)
            identifier = f"edge{index}"
            entities.append({"btType": "BTMSketchCurveSegment-155", "entityId": identifier,
                             "startPointId": identifier + ".start", "endPointId": identifier + ".end",
                             "startParam": 0, "endParam": length,
                             "geometry": {"btType": "BTCurveGeometryLine-117", "pntX": start[0], "pntY": start[1],
                                          "dirX": (end[0] - start[0]) / length, "dirY": (end[1] - start[1]) / length}})
    else:
        locations = [(200, 40, 4)] if downstream else [
            (values["frontRollerYMm"], values["rollerZMm"], values["shaftHoleDiameterMm"]),
            (values["frontRollerYMm"] + values["rollerDiameterMm"] + values["rollerGapMm"],
             values["rollerZMm"], values["shaftHoleDiameterMm"]),
            (*values["pivotCenterYZMm"], values["pivotHoleDiameterMm"]),
            *((*point, values["mountHoleDiameterMm"]) for point in values["crossmemberCentersYZMm"])]
        for index, (center_y, center_z, diameter) in enumerate(locations):
            center = drawing_to_sketch(frame, center_y, center_z)
            identifier = f"bore{index}"
            entities.append({"btType": "BTMSketchCurve-4", "entityId": identifier, "centerId": identifier + ".center",
                             "geometry": {"btType": "BTCurveGeometryCircle-115", "radius": diameter / 2000,
                                          "xCenter": center[0], "yCenter": center[1], "xDir": 1, "yDir": 0,
                                          "clockwise": False}})
    return feature("newSketch", "Downstream sixth hole" if downstream else "Five benchmark bores" if holes else "Plate outline",
                   [query_parameter("sketchPlane", created(plane_id, "FACE"))], entities=entities, constraints=[])


def extrude_feature(sketch_id, thickness, frame, body_id=None):
    parameters = [parameter("enum", "bodyType", enumName="ExtendedToolBodyType", value="SOLID"),
                  parameter("enum", "operationType", enumName="NewBodyOperationType", value="REMOVE" if body_id else "NEW"),
                  parameter("query", "entities", queries=[{"btType": "BTMIndividualSketchRegionQuery-140", "featureId": sketch_id}]),
                  parameter("enum", "endBound", enumName="BoundingType", value="THROUGH_ALL" if body_id else "BLIND"),
                  parameter("quantity", "depth", expression=f"{thickness:g} mm"),
                  parameter("boolean", "oppositeDirection", value=frame["normal"][0] > 0)]
    if body_id:
        parameters += [query_parameter("booleanScope", created(body_id, "BODY")),
                       parameter("boolean", "defaultScope", value=False)]
    return feature("extrude", "Through holes - native remove" if body_id else "Left plate - native solid", parameters)


def decode_fs(node):
    require(isinstance(node, dict) and "value" in node, "Missing FeatureScript result value")
    value, kind = node["value"], node.get("btType", "")
    if "Map" in kind:
        return {decode_fs(item["key"]): decode_fs(item["value"]) for item in value}
    if "Array" in kind:
        return [decode_fs(item) for item in value]
    return value


def evaluated(response):
    require(not response.get("microversionSkew", False), "Measurement microversion skew")
    require(response.get("result") and not any(item.get("severity") == "ERROR" for item in response.get("notices", [])),
            "Read-only server evaluation failed; inspect sanitized response")
    return decode_fs(response["result"])


def measure_version(requests, state, revision):
    script = (ROOT / "measure.fs").read_text()
    response = requests.request("measure", revision, document=state["document"], element=state["element"],
                                version=state["version"], payload={"script": script})
    require(response.get("sourceMicroversion") == state["microversion"], "Exact measurement source microversion mismatch")
    measurements = evaluated(response)
    require(measurements["solid_count"] == 1 and measurements["part_ids"] == [state["part"]],
            "Measured part identity mismatch")
    for hole in measurements["holes"]:
        close(abs(hole["axis"][0]), 1, 1e-7)
        close(hole["x_min"], measurements["world_bounds"][0])
        close(hole["x_max"], measurements["world_bounds"][3])
    return {"state": dict(state), "measurements": measurements,
            "response_source_microversion": response.get("sourceMicroversion")}


class NativeFixture:
    def __init__(self, requests):
        self.requests, self.ledger = requests, requests.ledger
        self.state = self.ledger.state

    def options(self):
        return {"document": self.state["owned_document"], "workspace": self.state["workspace"], "element": self.state["element"]}

    def prepare(self):
        if not self.state["owned_document"]:
            self.requests.request("create_document", "setup")
        if not self.state.get("element"):
            elements = self.requests.request("elements", "setup", document=self.state["owned_document"], workspace=self.state["workspace"])
            studios = [item for item in elements if item.get("elementType") == "PARTSTUDIO"]
            require(len(studios) == 1, "Expected one default Part Studio")
            self.state["element"] = studios[0]["id"]
            self.ledger.save()
        if not self.state.get("native_context"):
            response = self.requests.request("workspace_features", "setup", **self.options())
            require(not response["features"], "New fixture unexpectedly contains features")
            self.state["native_context"] = {key: response[key] for key in ("serializationVersion", "libraryVersion")}
            self.ledger.save()

    def apply(self, key, definition, phase, update_id=None):
        completed = self.state.setdefault("native_steps", {})
        if key in completed:
            return completed[key]
        definition = copy.deepcopy(definition)
        if update_id:
            definition["featureId"] = update_id
        response = self.requests.request("native_update" if update_id else "native_add", phase,
                                        **self.options(), resource=update_id,
                                        payload={"btType": "BTFeatureDefinitionCall-1406", "feature": definition,
                                                 **self.state["native_context"]})
        require(response.get("featureState", {}).get("featureStatus") == "OK", "Native feature is unhealthy; inspect response")
        completed[key] = response["feature"]["featureId"]
        self.ledger.save()
        return completed[key]

    def build(self, revision):
        self.prepare()
        benchmark = json.loads((ROOT.parent.parent / "benchmark/intake.json").read_text())
        values = copy.deepcopy(benchmark["baseline"])
        if revision == "B":
            values.update(benchmark["revision"])
            values.update(plateThicknessMm=8, pivotCenterYZMm=[30, 130])
        phase = "setup" if revision == "A" else "revision"
        steps = self.state.setdefault("native_steps", {})
        plane_id = self.apply(revision + "_plane", plane_feature(values["innerWidthMm"]), phase,
                              steps.get("A_plane") if revision == "B" else None)
        frame_key = revision + "_frame"
        if frame_key not in self.state:
            script = 'function(context is Context, queries is map) { const frame = evPlane(context, {"face": ' + created(plane_id, "FACE") + '}); return {"origin":frame.origin / millimeter,"x":frame.x,"normal":frame.normal}; }'
            self.state[frame_key] = evaluated(self.requests.request("frame_measure", phase, **self.options(), payload={"script": script}))
            self.ledger.save()
        frame = self.state[frame_key]
        close(frame["origin"][0], -values["innerWidthMm"] / 2)
        close(abs(frame["normal"][0]), 1, 1e-7)
        outline_id = steps.get("A_outline") or self.apply("A_outline", sketch_feature(plane_id, frame, values), phase)
        body_id = self.apply(revision + "_body", extrude_feature(outline_id, values["plateThicknessMm"], frame), phase,
                             steps.get("A_body") if revision == "B" else None)
        holes_id = self.apply(revision + "_holes", sketch_feature(plane_id, frame, values, holes=True), phase,
                              steps.get("A_holes") if revision == "B" else None)
        if revision == "A":
            self.apply("A_remove", extrude_feature(holes_id, values["plateThicknessMm"], frame, body_id), phase)
        else:
            extra = self.apply("B_downstream_sketch", sketch_feature(plane_id, frame, values, downstream=True), phase)
            self.apply("B_downstream_remove", extrude_feature(extra, values["plateThicknessMm"], frame, body_id), phase)
        self.state["fixture_revision"] = revision
        self.ledger.save()
        return self.state["element"]