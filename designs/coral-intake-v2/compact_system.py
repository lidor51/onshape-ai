import argparse
import importlib.util
import json
from pathlib import Path
import time


ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("retained_system", ROOT / "system.py")
legacy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(legacy)
OUTPUT = ROOT / "compact-output"


class CompactSystem(legacy.System):
    def pose(self, instance, angle=0, floating=0):
        pose = instance["pose"]
        if instance["motion"] == "float":
            pose = self.pickup_module.rotation((0, *self.pickup.config["middle_yz"]), floating) * pose
        if instance["motion"] in ("fold", "float", "pickup_translate"):
            pose = self.pickup_module.rotation((0, *self.pickup.config["pivot_yz"]), angle) * pose
        return pose


def build(pivot=(110.0, 170.0), stow=-110.0):
    assembly = CompactSystem()
    module = assembly.pickup_module
    config = module.settings()
    config.update(pivot_yz=list(pivot), stow_angle=stow)
    assembly.pickup = module.build(config)
    kinds = {"custom": "custom_brep", "nominal_hardware": "standard_hardware_nominal_brep",
             "authentic_vendor": "authentic_vendor_brep"}
    for name, definition in assembly.pickup.definitions.items():
        metadata = {key: value for key, value in definition.items() if key not in ("shape", "material", "category")}
        assembly.define("v2_" + name, definition["shape"], definition.get("material", "Unqualified"),
                        kinds[definition["category"]], "reparameterized_pickup", **metadata)
    for instance in assembly.pickup.instances:
        assembly.add("v2_" + instance["id"], "v2_" + instance["definition"], instance["pose"],
                     instance["motion"], instance["category"], original_id=instance["id"])
    assembly.pickup_ids = [instance["id"] for instance in assembly.instances]
    assembly.sources.update(assembly.pickup.sources)
    assembly.joints.extend(assembly.pickup.joints)
    legacy.build_retained(assembly)
    build_motor_stages(assembly)
    assembly.missing.append({"id": "compact_pivot_supports", "reason":
        "Real revised cheek and fixed stub geometry; chassis support, actuation, stops and full interface clearance not yet established."})
    return assembly


def build_motor_stages(assembly):
    model = assembly.model
    for name, motor, output, motion in (("pickup", (-80, 390), (-34.28, 390), "fold"),
                                        ("deployment", (550, 180), (504.28, 180), "fixed")):
        package = model.Package(model.parameters())
        package.import_cache.update(assembly.retained.import_cache)
        package.settings["pickup"]["sideplate_x"] = 255
        shaft = package.custom(name + "_stage_shaft", model.shaft(48), stock="AF12.7 x48, M5 end taps; downstream installation unfinished")
        package.add(name + "_stage_shaft", shaft, model.location((282, *output), (1, 0, 0)), "dock", "hard_shaft")
        package.drive(name + "_drive", output, motor, 260, (1, 0, 0), "dock", name + "_candidate_mount")
        model.clock_outputs(package, 3)
        assembly.import_package(package, name + "_", "new_drive_stage", motion)
        assembly.missing.append({"id": name + "_downstream_drive", "reason": "Only authentic 5:1 first stage exists; see compact-drive-review.md for unbuilt topology."})


def check_interfaces(assembly, step=5, max_exact=200, max_failures=12):
    if step <= 0 or max_exact < 0 or max_failures < 1:
        raise ValueError("Positive step/failure budget and nonnegative exact budget required")
    module = assembly.pickup_module
    fixed = [part for part in assembly.instances if part["motion"] == "fixed" and part["id"] not in assembly.pickup_ids]
    moving = sorted([part for part in assembly.instances if part["motion"] != "fixed"],
                    key=lambda part: (part["role"] not in ("structure", "hard_shaft", "hard_hub"), part["id"]))
    fixed_shapes = {part["id"]: assembly.shape(part) for part in fixed}
    fixed_bounds = {name: module.bounds(shape) for name, shape in fixed_shapes.items()}
    local_bounds = {name: module.bounds(definition["shape"]) for name, definition in assembly.definitions.items()}
    stow = assembly.pickup.config["stow_angle"]
    angles = list(dict.fromkeys([stow, stow / 2, 0.0, *[-float(angle) for angle in range(0, int(abs(stow)) + 1, step)]]))
    failures = []
    failed_pairs = set()
    contacts = []
    pending = []
    exact_calls = 0
    started = time.monotonic()
    for angle in angles:
        print(json.dumps({"phase": "check_pose", "angle_deg": angle, "exact_calls": exact_calls,
                          "failures": len(failures)}), flush=True)
        for floating in (0, -8):
            for part in moving:
                pose = assembly.pose(part, angle, floating)
                extent = module.transform_bounds(local_bounds[part["definition"]], module.matrix(pose))
                shape = None
                for other in fixed:
                    pair = (part["id"], other["id"])
                    if pair in failed_pairs or module.separation(extent, fixed_bounds[other["id"]]) > 0.1:
                        continue
                    case = {"moving": pair[0], "fixed": pair[1], "angle_deg": angle, "float_deg": floating}
                    if exact_calls >= max_exact or len(failures) >= max_failures:
                        pending.append(case)
                        continue
                    if shape is None:
                        shape = assembly.definitions[part["definition"]]["shape"].moved(pose)
                    witness, calls = legacy.overlap_witness(assembly, shape, fixed_shapes[other["id"]],
                                                            min(20, max_exact - exact_calls))
                    exact_calls += calls
                    if witness is not None:
                        failures.append({**case, "interior_witness_mm": witness})
                        failed_pairs.add(pair)
                        print(json.dumps({"phase": "proven_interference", **failures[-1]}), flush=True)
                    else:
                        pending.append({**case, "reason": "No interior witness found; distance/Boolean clearance NOT established"})
    return {"schema": "compact-interface-check/1", "pivot_yz": assembly.pickup.config["pivot_yz"],
            "stow_deg": stow, "status": "FAIL" if failures else "INCOMPLETE" if pending or contacts else "SAMPLED_CLEAR",
            "physical_instances": len(assembly.instances), "motor_count": sum(part["role"] == "motor" for part in assembly.instances),
            "tested_angles_deg": angles, "float_endpoints_deg": [0, -8], "exact_calls": exact_calls,
            "hard_interferences": failures, "unqualified_contacts": contacts, "pending": pending,
            "elapsed_s": time.monotonic() - started, "full_assembly_clearance": False, "release_ready": False,
            "scope": "Moving-to-retained-fixed AABB candidates, bounded solid-interior witness checks, no distance/Boolean clearance. Moving self-collision, new mounts, field and continuous motion not certified."}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pivot-z", type=float, default=170)
    parser.add_argument("--pivot-y", type=float, default=110)
    parser.add_argument("--stow", type=float, default=-110)
    parser.add_argument("--max-exact", type=int, default=200)
    parser.add_argument("--step", type=int, default=5)
    arguments = parser.parse_args()
    assembly = build((arguments.pivot_y, arguments.pivot_z), arguments.stow)
    print(json.dumps({"phase": "built", "instances": len(assembly.instances)}), flush=True)
    report = check_interfaces(assembly, step=arguments.step, max_exact=arguments.max_exact)
    OUTPUT.mkdir(exist_ok=True)
    destination = OUTPUT / f"interfaces-y{arguments.pivot_y:g}-z{arguments.pivot_z:g}-q{abs(arguments.stow):g}.json"
    destination.write_text(json.dumps(report, indent=2), encoding="utf8")
    print(json.dumps({key: value for key, value in report.items() if key != "pending"}, indent=2))
    print(f"Pending cases: {len(report['pending'])}; report: {destination}")


if __name__ == "__main__":
    main()