import importlib
import json
import math
import sys
import types
from functools import lru_cache

import numpy as np

from cad_core import ROOT
from v3_sources import sha


@lru_cache(maxsize=None)
def profile(teeth, phase=0):
    directory = ROOT / "vendor" / "cq_gears"
    provenance = json.loads((directory / "provenance.json").read_text())
    for filename, evidence in provenance["files"].items():
        if sha(directory / filename) != evidence["sha256"]:
            raise ValueError("Gear dependency hash mismatch")
    package = types.ModuleType("packet3_cq_gears")
    package.__path__ = [str(directory)]
    sys.modules.setdefault("packet3_cq_gears", package)
    generator = importlib.import_module("packet3_cq_gears.spur_gear").SpurGear
    gear = generator(module=1.27, teeth_number=teeth, width=12.6492, pressure_angle=14.5, backlash=0.30)
    points = gear.gear_points()[:, :2]
    selected = []
    for index in range(teeth):
        tooth = points[index * 80:(index + 1) * 80]
        for curve in range(4):
            for sample in [0, 4, 8, 12, 16, 19]:
                point = tooth[curve * 20 + sample]
                if not selected or np.linalg.norm(point - selected[-1]) > 1e-8:
                    selected.append(point)
    if np.linalg.norm(selected[0] - selected[-1]) < 1e-8:
        selected.pop()
    angle = math.radians(phase)
    rotation = np.array([[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]])
    return [list(map(float, rotation @ point)) for point in selected]


def primitive(teeth, length=12.6492, center=(0, 0, 0), phase=0):
    return {"kind": "polygon", "center": list(center), "points": profile(teeth, phase), "length": length, "start": -length / 2, "axis": "x"}