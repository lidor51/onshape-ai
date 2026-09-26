import hashlib
import importlib.util
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
OLD = REPO / "trials/subsystem-ab/cots"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save(name, data):
    destination = (ROOT / name).resolve()
    if not destination.is_relative_to(ROOT):
        raise ValueError("Output outside owned COTS directory")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(data, indent=2) + "\n", encoding="utf8")


def summarize(measured):
    geometry = measured["root_geometry"][0]
    cylinders = defaultdict(list)
    for face in geometry["analytic_faces"]:
        if "radius_mm" not in face:
            continue
        direction = face["axis_direction"]
        major = max(range(3), key=lambda index: abs(direction[index]))
        if direction[major] < 0:
            direction = [-value for value in direction]
        origin = face["axis_origin_mm"]
        offset = sum(left * right for left, right in zip(origin, direction))
        center = [value - offset * component for value, component in zip(origin, direction)]
        key = tuple(round(value, 6) for value in [face["radius_mm"], *direction, *center])
        cylinders[key].append(face["index"])
    groups = [{"radius_mm": key[0], "direction": key[1:4], "axis_point_mm": key[4:],
               "count": len(indices), "face_indices": indices}
              for key, indices in cylinders.items()]
    groups.sort(key=lambda group: (-group["count"], -group["radius_mm"]))
    return {"status": measured["status"], "sourceunits": measured["declared_length_units"],
            "importsolids": measured["occurrence_solid_count"], "bounds_mm": geometry["bounds_mm"],
            "size_mm": geometry["size_mm"], "cylinder_groups": groups[:18]}


def inspect():
    spec = importlib.util.spec_from_file_location("vendor_geometry_helper", OLD / "validate_assets.py")
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    helper.ROOT = REPO
    output = ROOT / "geometry-report.json"
    report = json.loads(output.read_text(encoding="utf8")) if output.exists() else {
        "schema": "coral-cots-geometry/v1", "date": datetime.now(timezone.utc).isoformat(),
        "python": sys.executable, "assets": {}}
    for path in sorted((ROOT / "originals").glob("*.step")):
        key = path.stem
        if report["assets"].get(key, {}).get("sha256") != digest(path):
            report["assets"][key] = helper.inspect_step(path)
            save("geometry-report.json", report)
        print(json.dumps({"asset": key, **summarize(report["assets"][key])}), flush=True)
    cached = json.loads((OLD / "geometry-validation-v2.json").read_text(encoding="utf8"))["assets"]
    for sku in ["0941", "0783"]:
        path = OLD / "cache" / f"wcp-{sku}.step"
        measured = cached[f"cache/wcp-{sku}.step"]
        assert measured["sha256"] == digest(path), "Cached geometry hash mismatch"
        assert measured["status"] == "PASS"
        report["assets"][f"wcp-{sku}"] = {**measured, "file": path.relative_to(REPO).as_posix(),
                                            "reused_hash_verified_analysis": True}
        print(json.dumps({"asset": f"wcp-{sku}", "status": "CACHED_HASH_MATCH",
                          "importsolids": measured["occurrence_solid_count"]}), flush=True)
    save("geometry-report.json", report)
    if any(asset["status"] != "PASS" for asset in report["assets"].values()):
        raise SystemExit(1)


def drawings():
    import pypdfium2 as pdfium
    pages = []
    for path in sorted((ROOT / "originals").glob("*.pdf")):
        document = pdfium.PdfDocument(str(path))
        try:
            page = document[0]
            textpage = page.get_textpage()
            bitmap = page.render(scale=1.5)
            try:
                text = textpage.get_text_bounded()
                image = bitmap.to_pil()
                output = ROOT / "evidence" / (path.stem + "-page-1.png")
                output.parent.mkdir(parents=True, exist_ok=True)
                image.save(output)
                image.close()
                pages.append({"path": path.relative_to(REPO).as_posix(), "sha256": digest(path),
                              "pages": len(document), "render": output.relative_to(REPO).as_posix(),
                              "page": 1, "text": text})
                print(json.dumps(pages[-1]), flush=True)
            finally:
                bitmap.close()
                textpage.close()
                page.close()
        finally:
            document.close()
    save("drawing-evidence.json", {"schema": "coral-cots-drawings/v1", "drawings": pages})


if __name__ == "__main__":
    if sys.argv[1:] == ["drawings"]:
        drawings()
    elif not sys.argv[1:]:
        inspect()
    else:
        raise SystemExit("Usage: inspect_sources.py [drawings]")