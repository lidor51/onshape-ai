from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from assemble import build_assembly, file_hashes, inventory, SOURCE_FILES
from geometry import ROOT, REPO, cq, bounds
from model import matrix


def file_digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export_checkpoint():
    report_path = ROOT / "assembly-checks.json"
    report = json.loads(report_path.read_text())
    expected = report["checkpoint"]["source_hashes"]
    if expected != file_hashes(SOURCE_FILES):
        raise RuntimeError("Assembly acceptance report does not match current source")
    package = build_assembly()
    if expected != package.assembly_checkpoint["source_hashes"]:
        raise RuntimeError("Mixed assembly revision")
    destination = ROOT / "checkpoint"
    destination.mkdir(exist_ok=True)
    custom = destination / "custom"
    custom.mkdir(exist_ok=True)
    counts = Counter(part["definition"] for part in package.instances)
    assembly = cq.Assembly(name="Coral_Intake_1_9_FAILED_ENGINEERING_CHECKPOINT")
    definitions = {}
    meshes = {}
    bom = []
    for name, quantity in sorted(counts.items()):
        definition = package.definitions[name]
        shape = definition["shape"]
        if not shape.isValid() or shape.Volume() <= 0:
            raise RuntimeError("Invalid export definition: " + name)
        entry = {key: value for key, value in definition.items() if key != "shape"}
        entry.update(quantity=quantity, volume_mm3=shape.Volume(), solids=len(shape.Solids()), bounds_mm=bounds(shape))
        if definition["kind"] == "custom_brep":
            filename = custom / (name + ".step")
            cq.exporters.export(shape, str(filename))
            imported = cq.importers.importStep(str(filename)).val()
            if not imported.isValid() or len(imported.Solids()) != len(shape.Solids()) or abs(imported.Volume() - shape.Volume()) > max(0.001, shape.Volume() * 1e-7):
                raise RuntimeError("Custom STEP reimport mismatch: " + name)
            entry["step"] = filename.relative_to(destination).as_posix()
            entry["step_sha256"] = file_digest(filename)
            entry["custom_step_reimport"] = "PASS"
        vertices, triangles = shape.tessellate(0.7, 0.3)
        meshes[name] = {"positions": [coordinate for vertex in vertices for coordinate in vertex.toTuple()],
                        "indices": [index for triangle in triangles for index in triangle]}
        definitions[name] = entry
        bom.append({"part": name, "quantity": quantity, "kind": definition["kind"], "material": definition["material"],
                    "stock": definition["stock"], "source": (definition.get("source") or {}).get("sku", "custom / nominal / reference"),
                    "release": "NOT RELEASED"})
    instances = []
    for part in package.instances:
        definition = package.definitions[part["definition"]]
        color = (0.14, 0.56, 0.32) if part["role"] == "compliant_contact" else (0.63, 0.68, 0.71)
        if part["role"] == "motor":
            color = (0.8, 0.38, 0.09)
        assembly.add(definition["shape"], name=part["id"], loc=part["pose"], color=cq.Color(*color))
        instances.append({**{key: value for key, value in part.items() if key != "pose"}, "matrix": matrix(part["pose"])})
    assembly_path = destination / "assembly-not-released.step"
    assembly.save(str(assembly_path))
    for source in package.sources.values():
        if file_digest(REPO / source["pathrepoRelative"]) != source["sha256"]:
            raise RuntimeError("Original COTS source changed")
    if expected != file_hashes(SOURCE_FILES):
        raise RuntimeError("Source changed during export")
    manifest = {"schema": "coral-intake-engineering-checkpoint/1", "release": "NOT RELEASED",
                "assembly_acceptance": "FAIL", "physical_reliability": "UNMEASURED", "native_onshape": False,
                "cad_origin": "Our custom parametric B-reps plus hash-bound original vendor B-reps; not 1690 robot parts",
                "units": "mm", "coordinate_frame": "X width, Y into robot, Z up",
                "source_hashes": expected, "assembly_check_sha256": file_digest(report_path),
                "assembly_step": assembly_path.name, "assembly_step_sha256": file_digest(assembly_path),
                "vendor_reexport_fidelity": "UNVERIFIED; unchanged vendor originals remain authoritative",
                "inventory": inventory(package), "settings": package.settings, "definitions": definitions, "instances": instances,
                "sources": package.sources, "transmission": package.transmission, "drive_completion": package.drive_completion,
                "gear_pairs": package.gear_pairs, "assembly_checkpoint": package.assembly_checkpoint,
                "missing_required": package.missing, "joints": package.joints,
                "geometry_checks": "See copied assembly-checks.json; failed motion, packaging, load and release gates remain open"}
    (destination / "assembly-checks.json").write_bytes(report_path.read_bytes())
    (destination / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (destination / "viewer-data.json").write_text(json.dumps({"manifest": manifest, "meshes": meshes}, separators=(",", ":")))
    (destination / "BOM.json").write_text(json.dumps(bom, indent=2) + "\n")
    with (destination / "BOM.csv").open("w", newline="", encoding="utf8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(bom[0]))
        writer.writeheader()
        writer.writerows(bom)
    print(json.dumps({"status": "CHECKPOINT_EXPORTED_NOT_RELEASED", "instances": len(instances), "active_definitions": len(definitions),
                      "custom_reimports_passed": sum("step" in definition for definition in definitions.values()),
                      "assembly_bytes": assembly_path.stat().st_size, "output": str(destination)}), flush=True)


if __name__ == "__main__":
    export_checkpoint()