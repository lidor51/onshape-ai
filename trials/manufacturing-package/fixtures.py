import json
from pathlib import Path

import cadquery as cq

from geometry import digest, extract

ROOT = Path(__file__).resolve().parent


def fixture_shape(revision="A"):
    benchmark = json.loads((ROOT / "../../benchmark/intake.json").resolve().read_text())
    values = benchmark["baseline"].copy()
    if revision == "B":
        values.update(benchmark["revision"])
        values["plateThicknessMm"] = 8
        values["pivotCenterYZMm"] = [30, 130]
    thickness = values["plateThicknessMm"]
    minimum_x = -values["innerWidthMm"] / 2 - thickness
    shape = cq.Solid.makeBox(thickness, values["plateLengthMm"], values["plateHeightMm"],
                             cq.Vector(minimum_x, 0, values["plateBottomZMm"]))
    rear = values["frontRollerYMm"] + values["rollerDiameterMm"] + values["rollerGapMm"]
    holes = [(values["frontRollerYMm"], values["rollerZMm"], values["shaftHoleDiameterMm"]),
             (rear, values["rollerZMm"], values["shaftHoleDiameterMm"]),
             (*values["pivotCenterYZMm"], values["pivotHoleDiameterMm"])]
    holes.extend((*center, values["mountHoleDiameterMm"]) for center in values["crossmemberCentersYZMm"])
    if revision == "B":
        holes.append((200, 40, 4))
    for center_y, center_z, diameter in holes:
        shape = shape.cut(cq.Solid.makeCylinder(diameter / 2, thickness + 2,
                          cq.Vector(minimum_x - 1, center_y, center_z), cq.Vector(1, 0, 0)))
    return shape


def synthetic_snapshot(folder, revision):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    step = folder / "source.step"
    cq.exporters.export(fixture_shape(revision), str(step))
    source_hash = digest(step)
    state = {"kind": "LOCAL_SYNTHETIC", "immutable_id": source_hash,
             "configuration": "default", "part": "synthetic-left-plate"}
    manifest = {"schema": 1, "revision": revision, "step_sha256": source_hash,
                "state": state, "measurement_state": state.copy(), "export_state": state.copy(),
                "measurement_origin": "LOCAL_OPEN_CASCADE_NOT_ONSHAPE", "measurements": extract(step)}
    (folder / "snapshot.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return step, manifest