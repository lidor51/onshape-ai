import json
import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pickup import ROOT, REPO, build, bounds, sha256
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps


def density_range(instance):
    category = instance["category"]
    if category in ("bearing", "fastener", "retainer"):
        return [7.7e-6, 8.0e-6], "steel density assumption"
    if category == "outer_elastomer":
        return [1.0e-6, 1.3e-6], "elastomer density unconfirmed"
    if category in ("hard_hub", "hard_marking_unqualified") and instance["id"].startswith("star_"):
        return [1.05e-6, 1.4e-6], "polymer density unconfirmed"
    return [2.65e-6, 2.85e-6], "aluminum stock density assumption"


def motor_data():
    catalog = json.loads((REPO / "research/2025-coral/cots.json").read_text())
    source = next(item for item in catalog["candidates"] if item["id"] == "x44")["motor_data"]["ctre_12V_reference"]
    mode = next(item for item in source["modes"] if item["mode"] == "trapezoidal")
    return {"source": source["dataset"], "free_rpm": mode["free_speed_rpm"],
            "stall_torque_nm": mode["stall_torque_Nm"], "stall_current_a": mode["stall_current_A"],
            "voltage_v": source["test_voltage_V"], "current_basis": source["current_basis"]}


def roller_requirement(diameter_mm, speed_mps, tangential_force_n, ratio, efficiency, motor):
    radius = diameter_mm / 2000
    roller_rpm = speed_mps * 60 / (2 * math.pi * radius)
    motor_rpm = roller_rpm * ratio
    motor_torque = tangential_force_n * radius / (ratio * efficiency)
    speed_fraction = motor_rpm / motor["free_rpm"]
    ideal_available = motor["stall_torque_nm"] * max(0, 1 - speed_fraction)
    return {"ratio": ratio, "diameter_mm": diameter_mm, "target_surface_mps": speed_mps,
            "assumed_combined_tangential_force_n": tangential_force_n, "assumed_efficiency": efficiency,
            "roller_rpm": roller_rpm, "motor_rpm": motor_rpm, "free_speed_fraction": speed_fraction,
            "motor_torque_nm": motor_torque,
            "endpoint_current_proxy_a": motor_torque * motor["stall_current_a"] / motor["stall_torque_nm"],
            "ideal_12v_linear_speed_torque_margin_nm": ideal_available - motor_torque,
            "no_load_surface_mps": math.pi * diameter_mm / 1000 * motor["free_rpm"] / (60 * ratio),
            "hardware_qualified": False}


def fold_requirement(mass_kg, first_moment_kg_m, inertia_kg_m2, ratio, duration_s, angle_deg, motor):
    if mass_kg <= 0 or first_moment_kg_m < 0 or inertia_kg_m2 < first_moment_kg_m ** 2 / mass_kg:
        raise ValueError("Inconsistent mass/first moment/inertia")
    angle = math.radians(angle_deg)
    acceleration = 4 * angle / duration_s ** 2
    peak_speed = 2 * angle / duration_s
    efficiency, load_factor, friction = 0.7, 1.5, 1.0
    output_torque = load_factor * (9.80665 * first_moment_kg_m + inertia_kg_m2 * acceleration + friction)
    motor_torque = output_torque / (ratio * efficiency)
    motor_rpm = peak_speed * ratio * 60 / (2 * math.pi)
    available = motor["stall_torque_nm"] * max(0, 1 - motor_rpm / motor["free_rpm"])
    return {"ratio": ratio, "travel_degrees": angle_deg, "duration_s": duration_s,
            "motion": "triangular rest-to-rest speed; conservative peak torque combined with peak speed",
            "assumed_efficiency": efficiency, "load_factor": load_factor, "friction_torque_nm": friction,
            "gravity_torque_bound_nm": 9.80665 * first_moment_kg_m,
            "required_output_torque_nm": output_torque, "motor_rpm_peak": motor_rpm,
            "required_motor_torque_nm": motor_torque,
            "endpoint_current_proxy_a": motor_torque * motor["stall_current_a"] / motor["stall_torque_nm"],
            "ideal_speed_torque_margin_nm": available - motor_torque,
            "holding_approved": False, "physical_duty_validated": False}


def mass_properties(pickup):
    rows = []
    pivot_y, pivot_z = pickup.config["pivot_yz"]
    totals = [{"mass_kg": 0, "first_moment_bound_kg_m": 0, "inertia_kg_m2": 0} for _ in range(2)]
    for instance in pickup.instances:
        if instance["motion"] == "fixed":
            continue
        shape = pickup.posed(instance)
        props = GProp_GProps()
        BRepGProp.VolumeProperties_s(shape.wrapped, props)
        volume = props.Mass()
        center = props.CentreOfMass()
        radial_mm = math.hypot(center.Y() - pivot_y, center.Z() - pivot_z)
        central_inertia = props.MatrixOfInertia().Value(1, 1)
        density, basis = density_range(instance)
        properties = []
        for index, value in enumerate(density):
            mass = volume * value
            first_moment = mass * radial_mm / 1000
            inertia = value * (central_inertia + volume * radial_mm ** 2) / 1e6
            properties.append({"mass_kg": mass, "first_moment_bound_kg_m": first_moment, "inertia_kg_m2": inertia})
            for key in totals[index]:
                totals[index][key] += properties[-1][key]
        rows.append({"part": instance["id"], "density_kg_per_mm3": density, "density_basis": basis, "bounds": properties})
    return {"status": "CAD_VOLUME_ESTIMATE_NOT_WEIGHED", "rows": rows, "totals": totals,
            "limitations": ["Unconfirmed density and mixed materials", "No omitted drives, guards, connectors or wiring included in CAD subtotal",
                            "Conservative sum of each component radial first moment, not angle-specific gravity torque"]}


def run():
    pickup = build()
    mass = mass_properties(pickup)
    upper = mass["totals"][1]
    reserve_mass, reserve_radius = 1.5, 0.30
    loaded = {"mass_kg": upper["mass_kg"] + reserve_mass,
              "first_moment_kg_m": upper["first_moment_bound_kg_m"] + reserve_mass * reserve_radius,
              "inertia_kg_m2": upper["inertia_kg_m2"] + reserve_mass * reserve_radius ** 2}
    motor = motor_data()
    report = {"status": "ENGINEERING_SCREEN_NOT_SELECTED_HARDWARE", "source_pickup_sha256": sha256(ROOT / "pickup.py"),
              "motor": motor, "cad_mass": mass,
              "additional_drive_wiring_guard_reserve": {"mass_kg": reserve_mass, "point_radius_m": reserve_radius, "basis": "design allowance, not measured or sufficient by default"},
              "fold_model": {**loaded, "no_coral": "Normal sequence clears acquisition cassette before folding; jammed-piece load is a separate unresolved case"},
              "pickup": [roller_requirement(127, 3, 40, ratio, 0.8, motor) for ratio in (5, 9, 10, 12)],
              "fold": [fold_requirement(**loaded, ratio=ratio, duration_s=1.2, angle_deg=140, motor=motor) for ratio in (5, 36, 50, 64)],
              "ratio_policy": "Size pickup and deployment separately; motor endpoint model is not continuous rating or a controller stator-current calibration",
              "required_before_selection": ["Measured contact force/speed", "Motor and controller current/thermal duty", "Gear tooth/shaft/bearing loads",
                                            "Transmission efficiency", "Holding latch/stop and backdrive behavior", "Current-limited collision behavior"]}
    (ROOT / "drive-sizing.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"mass_bounds_kg": [item["mass_kg"] for item in mass["totals"]], "pickup": report["pickup"], "fold": report["fold"]}, indent=2))


if __name__ == "__main__":
    run()