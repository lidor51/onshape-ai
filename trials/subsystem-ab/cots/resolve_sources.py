import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SELECTION = {
    "wcp-kraken-cad-fresh.csv": {"WCP-0940": "x60", "WCP-0941": "x44", "WCP-1016": "spline_pinion"},
    "wcp-bearing-cad.csv": {"WCP-0783": "hex_bearing"},
    "wcp-gear-cad.csv": {"WCP-0137": "hex_output_gear"},
}


def resolve_rows():
    ledger = json.loads((ROOT / "public-fetch-log.json").read_text(encoding="utf8"))
    selected = []
    for filename, wanted in SELECTION.items():
        relative = "cache/" + filename
        source = next(item for item in ledger["requests"] if item["cache"] == relative)
        assert source["status"] == 200
        assert hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() == source["sha256"]
        with (ROOT / relative).open(encoding="utf-8-sig", newline="") as stream:
            for row_number, row in enumerate(csv.DictReader(stream), start=2):
                sku = row["P/N"]
                if sku in wanted:
                    selected.append({"id": wanted[sku], "sku": sku, "table_cache": relative,
                                     "table_sha256": source["sha256"], "csv_record_number": row_number,
                                     "row": row, "cad_url": row["CAD"], "drawing_url": row["Drawings"],
                                     "cad_cache": "cache/" + sku.lower() + ".step"})
    assert sorted(item["sku"] for item in selected) == sorted(sku for group in SELECTION.values() for sku in group)
    return {"schema_version": 2, "parser": "Python standard library csv.DictReader",
            "native_links_are_discovery_only": True, "sources": selected}


if __name__ == "__main__":
    result = resolve_rows()
    (ROOT / "resolved-sources.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf8")
    print(json.dumps(result, indent=2))