import argparse
import csv
import hashlib
import json
from pathlib import Path
import sys
from urllib.request import Request, urlopen
from urllib.parse import urlparse


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / ".cache" / "coral-powertrain"
LIMIT_FILE = 20 * 1024 * 1024
LIMIT_TOTAL = 60 * 1024 * 1024
PRODUCTS = {
    "WCP-0563": {"teeth": 18, "type": "HTD5", "width_mm": 9, "bore": "half-inch hex"},
    "WCP-0990": {"teeth": 36, "type": "HTD5", "width_mm": 9, "bore": "half-inch hex"},
    "WCP-1420": {"teeth": 15, "type": "HTD5", "width_mm": 9, "bore": "half-inch hex"},
    "WCP-0577": {"teeth": 14, "type": "25-chain", "bore": "half-inch hex"},
    "WCP-0578": {"teeth": 16, "type": "25-chain", "bore": "half-inch hex"},
    "WCP-2106": {"teeth": 36, "type": "25-chain", "bore": "half-inch hex"},
    "WCP-0970": {"teeth": 60, "type": "25-chain", "bore": "SplineXL"},
}
CATALOGS = {
    "pulleys": "https://wcproducts.com/products/htd-timing-pulleys",
    "sprockets": "https://wcproducts.com/products/25-sprockets",
    "belts": "https://wcproducts.com/products/htd-timing-belts-9mm-width",
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def receipts():
    path = CACHE / "receipts.json"
    return json.loads(path.read_text()) if path.exists() else {"requests": [], "products": {}, "charged_bytes": 0}


def fetch(url, filename):
    def allowed(address):
        parsed = urlparse(address)
        return parsed.scheme == "https" and (parsed.hostname in {"wcproducts.info", "wcproducts.com", "docs.google.com", "docs.wcproducts.com", "1911150060-files.gitbook.io"}
                                              or parsed.hostname.endswith(".googleusercontent.com"))
    if not allowed(url):
        raise ValueError("Public manufacturer URLs only")
    CACHE.mkdir(parents=True, exist_ok=True)
    ledger = receipts()
    target = CACHE / filename
    if target.exists():
        record = next(row for row in ledger["requests"] if row.get("file") == filename and row.get("sha256") == digest(target))
        return record
    record = {"url": url, "file": filename, "bytes": 0, "status": "attempted"}
    ledger["requests"].append(record)
    try:
        with urlopen(Request(url, headers={"User-Agent": "coral-public-cad/1.0"}), timeout=45) as response:
            if not allowed(response.url):
                raise ValueError("Unexpected redirect host")
            content = bytearray()
            while True:
                chunk = response.read(min(65536, LIMIT_FILE - len(content) + 1))
                if not chunk:
                    break
                ledger["charged_bytes"] += len(chunk)
                record["bytes"] += len(chunk)
                if record["bytes"] > LIMIT_FILE or ledger["charged_bytes"] > LIMIT_TOTAL:
                    raise ValueError("Public download byte budget exceeded")
                content.extend(chunk)
            if filename.endswith(".step") and not content.startswith(b"ISO-10303-21"):
                raise ValueError("Response is not STEP")
            target.write_bytes(content)
            record.update(status="saved", sha256=digest(target), content_type=response.headers.get("Content-Type"))
    except Exception as error:
        record.update(status="failed", error=str(error))
        raise
    finally:
        (CACHE / "receipts.json").write_text(json.dumps(ledger, indent=2) + "\n")
    return record


def acquire():
    for name, url in CATALOGS.items():
        fetch(url, "catalog-" + name + ".html")
    for sku, product in PRODUCTS.items():
        page = "pulleys" if product["type"] == "HTD5" else "sprockets"
        row = fetch("https://wcproducts.info/files/frc/cad/" + sku + ".step", sku + ".step")
        ledger = receipts()
        ledger["products"][sku] = {**product, **row, "catalog": CATALOGS[page],
                                   "catalog_observation": "Official rendered product table read 2026-09-19; dynamic SKU rows absent from raw HTML snapshot",
                                   "units": "STEP unit-aware import, no scaling"}
        (CACHE / "receipts.json").write_text(json.dumps(ledger, indent=2) + "\n")
        print(sku, row["bytes"], row["sha256"], flush=True)


def load(sku, cq):
    binding = receipts()["products"][sku]
    path = CACHE / binding["file"]
    if digest(path) != binding["sha256"]:
        raise ValueError("Changed original vendor bytes: " + sku)
    shape = cq.importers.importStep(str(path)).val()
    return shape, binding


def inspect():
    import cadquery as cq
    from OCP.BRepAdaptor import BRepAdaptor_Surface
    from OCP.GeomAbs import GeomAbs_Cylinder, GeomAbs_Plane
    result = {}
    for sku in receipts()["products"]:
        shape, binding = load(sku, cq)
        bounds = shape.BoundingBox()
        faces = []
        for index, face in enumerate(shape.Faces()):
            surface = BRepAdaptor_Surface(face.wrapped)
            if surface.GetType() == GeomAbs_Cylinder:
                cylinder = surface.Cylinder()
                faces.append({"index": index, "type": "cylinder", "radius": cylinder.Radius(),
                              "origin": list(cylinder.Location().Coord()), "axis": list(cylinder.Axis().Direction().Coord())})
            elif surface.GetType() == GeomAbs_Plane:
                plane = surface.Plane()
                faces.append({"index": index, "type": "plane", "origin": list(plane.Location().Coord()),
                              "axis": list(plane.Axis().Direction().Coord())})
        result[sku] = {"sha256": binding["sha256"], "valid": shape.isValid(), "solids": len(shape.Solids()),
                       "bounds": [bounds.xmin, bounds.ymin, bounds.zmin, bounds.xmax, bounds.ymax, bounds.zmax], "faces": faces}
        print(sku, result[sku]["bounds"], "solids", result[sku]["solids"], flush=True)
    (CACHE / "datums.json").write_text(json.dumps(result, indent=2) + "\n")


def drawing():
    url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZeZHcDPnZQIcYWm8WMmOUDzfBuh5zs9hROb3MuPvnkusPZuQDykwHV8uUDsjj8nRnv2LYrAV-hHZ/pub?gid=403705519&single=true&output=csv"
    fetch(url, "sprockets.csv")
    with (CACHE / "sprockets.csv").open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    for row in rows:
        if row.get("P/N") == "WCP-0970":
            print(json.dumps(row), flush=True)
            record = fetch(row["Drawings"], "WCP-0970.pdf")
            print(json.dumps(record), flush=True)
            return
    raise ValueError("Plate sprocket absent from linked official CAD table")


def references():
    urls = {
        "motionx.md": "https://docs.wcproducts.com/welcome/frc-build-system/spline-and-motionx-system.md",
        "chain-ratings.md": "https://docs.wcproducts.com/welcome/frc-build-system/belts-chain-and-gears/sprockets-and-chain.md",
        "chain-products.html": "https://wcproducts.com/products/roller-chain",
        "motionx-two-inch.svg": "https://1911150060-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FByQLBt0bw4wTa9DDV1kH%2Fuploads%2F45WmVcr8WMz0xRshEZfE%2F2in%20Bolt%20Circle.svg?alt=media&token=c076c7c9-15d2-4853-b542-2a2409da88d1",
    }
    for filename, url in urls.items():
        print(json.dumps(fetch(url, filename)), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--fetch", action="store_true")
    parser.add_argument("--inspect", action="store_true")
    parser.add_argument("--drawing", action="store_true")
    parser.add_argument("--references", action="store_true")
    arguments = parser.parse_args()
    if arguments.fetch:
        acquire()
    if arguments.inspect:
        inspect()
    if arguments.drawing:
        drawing()
    if arguments.references:
        references()