import hashlib
import importlib.metadata
import json
from pathlib import Path
import runpy
import sys
import time
import xml.etree.ElementTree as ElementTree


root = Path(__file__).resolve().parent
oracle = runpy.run_path(str(root / "oracle.py"))
started = time.perf_counter()
runtime = oracle["checked_runtime"]()
assert importlib.metadata.version("casadi") == "3.7.2"
packages = []
for distribution in sorted(importlib.metadata.distributions(), key=lambda value: value.metadata["Name"].lower()):
    metadata = distribution.metadata
    license_files = []
    for relative in distribution.files or []:
        if "license" not in relative.name.lower() and "copying" not in relative.name.lower():
            continue
        path = distribution.locate_file(relative).resolve()
        if not path.is_relative_to(root / ".venv") or not path.is_file():
            continue
        license_files.append({"path": str(relative).replace("\\", "/"), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    packages.append({
        "name": metadata["Name"], "version": distribution.version,
        "requiresPython": metadata.get("Requires-Python"),
        "licenseExpression": metadata.get("License-Expression"),
        "licenseSummary": (metadata.get("License") or "").split("\n")[0][:200],
        "licenseClassifiers": [value for value in metadata.get_all("Classifier", []) if value.startswith("License ::")],
        "projectUrls": metadata.get_all("Project-URL", []),
        "licenseFiles": license_files,
        "metadataSha256": hashlib.sha256((distribution.read_text("METADATA") or "").encode()).hexdigest(),
        "installedRecordSha256": hashlib.sha256((distribution.read_text("RECORD") or "").encode()).hexdigest(),
    })

summary = json.loads((root / "artifacts/preflight-summary.json").read_text())
assert summary["status"] == "PASS" and len(summary["results"]) == 31
candidates = json.loads((root / "artifacts/preparation.json").read_text())["candidates"]
previews = []
for state in summary["results"]:
    directory = root / "artifacts" / ("candidates" if state["name"] in candidates else "sweep") / state["name"]
    report = json.loads((directory / "preflight.json").read_text())["oracle"]
    preview = directory / "local-preview.svg"
    document = ElementTree.parse(preview).getroot()
    assert document.tag == "{http://www.w3.org/2000/svg}svg"
    assert float(document.attrib["width"]) == 960 and float(document.attrib["height"]) == 500
    paths = document.findall(".//{http://www.w3.org/2000/svg}path")
    assert len(paths) >= report["holeCount"] + 1
    assert all(path.attrib.get("d", "").strip() for path in paths)
    assert not document.findall(".//{http://www.w3.org/2000/svg}image")
    previews.append({"state": state["name"], "paths": len(paths), "sha256": hashlib.sha256(preview.read_bytes()).hexdigest()})

baseline_directory = root / "artifacts/candidates/A"
parameters = json.loads((baseline_directory / "parameters.json").read_text())
repeat = oracle["evaluate"](parameters, root / "artifacts/repeat-baseline")
original = json.loads((baseline_directory / "preflight.json").read_text())["oracle"]
assert abs(repeat["volumeMm3"] - original["volumeMm3"]) < 1e-6
assert repeat["boundsMm"] == original["boundsMm"]
assert repeat["holes"] == original["holes"]
assert repeat["previewSha256"] == original["previewSha256"]
report = {
    "status": "PASS", "runtime": runtime, "executable": sys.executable, "basePrefix": sys.base_prefix,
    "packages": packages, "previewChecks": previews, "baselineRepeat": repeat,
    "repeatability": "Identical baseline measured bounds, volume, bores and SVG; STEP bytes may differ due to export timestamps",
    "metadataScope": "Installed distribution metadata and license-file hashes; not a legal audit or wheel signature",
    "wallTimeMs": (time.perf_counter() - started) * 1000,
    "directOnshapeApiCalls": 0, "browserInvocations": 0,
}
(root / "artifacts/dependency-evidence.json").write_text(json.dumps(report, indent=2, allow_nan=False) + "\n", encoding="utf8")
print(json.dumps({"status": "PASS", "packages": len(packages), "previews": len(previews), "baselineRepeat": "PASS", "wallTimeMs": report["wallTimeMs"]}))