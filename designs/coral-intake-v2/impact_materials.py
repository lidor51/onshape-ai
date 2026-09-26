import hashlib
import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MATERIALS = {
    "6061_T6": {"modulus_pa": 69e9, "density_kg_m3": 2700, "nominal_yield_mpa": 276,
                "temperature_c": 23, "numeric_basis": "PROVISIONAL typical screening assumptions, not extracted producer values",
                "qualification": "Actual sheet/plate temper, thickness, direction, mill certificate and minimum yield required"},
    "unfilled_PC": {"modulus_pa": 2.3e9, "density_kg_m3": 1200, "nominal_yield_mpa": 60,
                    "temperature_c": 23, "numeric_basis": "PROVISIONAL typical screening assumptions, not extracted producer values",
                    "qualification": "Specify unfilled extruded sheet grade; resin data alone does not qualify sheet, holes, creep or impact"},
}
SOURCE_ATTEMPTS = [
    {"url": "https://www.kaiseraluminum.com/wp-content/uploads/2016/02/Kaiser_Aluminum_6061_Sheet_Coil_Plate.pdf",
     "result": "HTTP_404", "numeric_datasheet_verified": False},
    {"url": "https://solutions.covestro.com/en/products/makrolon/makrolon-2405",
     "result": "HTTP_404", "numeric_datasheet_verified": False},
    {"url": "https://www.hydro.com/globalassets/01-products-services/extruded-profiles/north-america/hydro_extrusion_na_alloy_6061.pdf",
     "result": "HTTP_404", "numeric_datasheet_verified": False},
    {"url": "https://solutions.covestro.com/en/brands/makrolon",
     "result": "FIRST_PARTY_BRAND_PAGE_ONLY; multiple resin grades and PDF links, no numeric property table extracted",
     "numeric_datasheet_verified": False},
]


def positive(*values):
    if any(not math.isfinite(value) or value <= 0 for value in values):
        raise ValueError("Expected positive finite quantities")


def plate_comparison(area_mm2, thickness_mm, modulus_pa, density_kg_m3):
    positive(area_mm2, thickness_mm, modulus_pa, density_kg_m3)
    return {
        "thickness_mm": thickness_mm,
        "mass_kg": area_mm2 * thickness_mm * density_kg_m3 * 1e-9,
        "weak_axis_Et3_relative_to_6mm_al": modulus_pa / 69e9 * (thickness_mm / 6) ** 3,
        "strong_axis_Et_relative_to_6mm_al": modulus_pa / 69e9 * thickness_mm / 6,
    }


def equal_weak_axis_thickness(reference_mm, reference_modulus_pa, candidate_modulus_pa):
    positive(reference_mm, reference_modulus_pa, candidate_modulus_pa)
    return reference_mm * (reference_modulus_pa / candidate_modulus_pa) ** (1 / 3)


def cantilever(force_n, length_mm, height_mm, thickness_mm, modulus_pa):
    positive(force_n, length_mm, height_mm, thickness_mm, modulus_pa)
    length_m, height_m, thickness_m = [value / 1000 for value in (length_mm, height_mm, thickness_mm)]
    second_moment_m4 = height_m * thickness_m ** 3 / 12
    deflection_m = force_n * length_m ** 3 / (3 * modulus_pa * second_moment_m4)
    stress_pa = force_n * length_m * thickness_m / (2 * second_moment_m4)
    return {
        "force_n": force_n, "length_mm": length_mm, "height_mm": height_mm,
        "thickness_mm": thickness_mm, "second_moment_m4": second_moment_m4,
        "root_moment_nm": force_n * length_m, "elastic_tip_deflection_mm": deflection_m * 1000,
        "elastic_nominal_stress_mpa": stress_pa / 1e6, "elastic_strain_proxy": stress_pa / modulus_pa,
        "deflection_over_length": deflection_m / length_m,
        "small_deflection_screen_exceeded": deflection_m / length_m > 0.05,
        "scope": "Uniform isolated rectangular cantilever, no holes, no plate FEA or dynamic qualification",
    }


def collision(mass_kg, speed_mps, stopping_travel_mm):
    positive(mass_kg, speed_mps, stopping_travel_mm)
    energy_j = mass_kg * speed_mps ** 2 / 2
    return {
        "effective_mass_kg": mass_kg, "speed_mps": speed_mps,
        "stopping_travel_mm": stopping_travel_mm, "energy_j": energy_j,
        "average_force_n": energy_j / (stopping_travel_mm / 1000),
        "peak_force_n": None, "qualified": False,
    }


def folded_point(point_mm, pivot_yz_mm, fold_radians):
    width, inward, height = point_mm
    pivot_y, pivot_z = pivot_yz_mm
    cosine, sine = math.cos(fold_radians), math.sin(fold_radians)
    return [width, pivot_y + cosine * (inward - pivot_y) - sine * (height - pivot_z),
            pivot_z + sine * (inward - pivot_y) + cosine * (height - pivot_z)]


def contact_work(point_mm, pivot_yz_mm, force_n, fold_radians=0):
    point = folded_point(point_mm, pivot_yz_mm, fold_radians)
    relative_y_m = (point[1] - pivot_yz_mm[0]) / 1000
    relative_z_m = (point[2] - pivot_yz_mm[1]) / 1000
    jacobian_m_per_rad = [0.0, -relative_z_m, relative_y_m]
    torque_x_nm = sum(derivative * force for derivative, force in zip(jacobian_m_per_rad, force_n))
    return {
        "point_mm": point, "force_n": list(force_n), "fold_radians": fold_radians,
        "dpoint_dfold_m_per_rad": jacobian_m_per_rad, "torque_x_nm": torque_x_nm,
        "work_per_stow_radian_j": -torque_x_nm,
        "assists_negative_fold_stow": torque_x_nm < 0,
    }


def mesh_volume_inertia(definition, matrix, pivot_yz_mm):
    positions, indices = definition["positions"], definition["indices"]
    if len(positions) % 3 or len(indices) % 3:
        raise ValueError("Expected flat triangle mesh arrays")
    vertices = []
    for offset in range(0, len(positions), 3):
        local = positions[offset:offset + 3] + [1]
        transformed = [sum(row[index] * local[index] for index in range(4)) for row in matrix[:3]]
        vertices.append([transformed[0], transformed[1] - pivot_yz_mm[0], transformed[2] - pivot_yz_mm[1]])
    volumes, inertias = [], []
    for offset in range(0, len(indices), 3):
        first, second, third = [vertices[index] for index in indices[offset:offset + 3]]
        cross = [second[1] * third[2] - second[2] * third[1],
                 second[2] * third[0] - second[0] * third[2],
                 second[0] * third[1] - second[1] * third[0]]
        volume = sum(first[index] * cross[index] for index in range(3)) / 6
        second_moment = 0.0
        for axis in (1, 2):
            coords = [first[axis], second[axis], third[axis]]
            second_moment += volume / 10 * (sum(value ** 2 for value in coords)
                                           + coords[0] * coords[1] + coords[0] * coords[2] + coords[1] * coords[2])
        volumes.append(volume)
        inertias.append(second_moment)
    signed_volume = math.fsum(volumes)
    positive(abs(signed_volume))
    inertia = math.fsum(inertias) * (1 if signed_volume > 0 else -1)
    positive(inertia)
    return {"volume_mm3": abs(signed_volume), "volume_inertia_about_pivot_mm5": inertia}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_reference_geometry(root):
    relative = ".cache/reference-cad/1690/bore-observations.json"
    path = root.parents[1] / relative
    if not path.exists():
        return {"status": "SOURCE_CACHE_UNAVAILABLE", "source": relative, "motion_qualified": False}
    source = json.loads(path.read_text())
    rocker = next(row for row in source["findings"] if row["partId"] == "LFPYB")
    rear = next(row["center"] for row in rocker["bores"]
                if math.isclose(row["center"][0], 52, abs_tol=0.01)
                and math.isclose(row["center"][1], 227, abs_tol=0.01))
    front = next(row["center"] for row in rocker["bores"]
                 if math.isclose(row.get("radius", 0), 2.6, abs_tol=0.01)
                 and math.isclose(row["center"][0], 179.535, abs_tol=0.01))
    return {"status": "SOURCE_MESH_AXIS_ORDERING_ONLY", "source": relative, "sha256": sha256(path),
            "part": "LFPYB", "native_frame": "X width, Y up, +Z out toward pickup",
            "rear_axis_interface_native_yz_mm": rear, "front_pin_native_yz_mm": front,
            "rear_axis_basis": "Noncircular outline center, not an analytic round-bore fit or independent proof of drive coupling",
            "front_pin_height_above_rear_mm": front[0] - rear[0],
            "illustrative_front_pin_wall_torque_x_nm_at_150n": -(front[0] - rear[0]) * 150 / 1000,
            "d_front_height_d_positive_x_radian_mm": -(front[1] - rear[1]),
            "motion_qualified": False,
            "limitation": "Isolated rocker tendency at front pin only; full linkage has shaped-slot contact, not a proven pinned four-bar. Actual roller force transmission unresolved."}


def snapshot_plates(mesh, pickup_report, drive_report):
    if mesh["units"] != "mm" or pickup_report["units"] != "mm":
        raise ValueError("Expected millimetre source geometry")
    if mesh["coordinate_frame"] != "X width, Y inward, Z up":
        raise ValueError("Unexpected source coordinate frame")
    if mesh["settings"] != pickup_report["settings"]:
        raise ValueError("Mesh and report settings disagree")
    thickness = pickup_report["settings"]["plate_thickness"]
    if thickness != 6:
        raise ValueError("This comparison requires the recorded 6 mm baseline")
    exact = {row["definition"]: row for row in pickup_report["local_geometry"]["custom"]}
    mass_rows = {row["part"]: row for row in drive_report["cad_mass"]["rows"]}
    rows = []
    for instance in mesh["instances"]:
        name = instance["definition"]
        if name not in ("main_cheek", "floating_cheek"):
            continue
        definition = mesh["definitions"][name]
        volume = definition["volume_mm3"]
        if not math.isclose(volume, exact[name]["volume_mm3"], rel_tol=1e-12):
            raise ValueError("Mesh metadata and report exact CAD volume disagree")
        if not exact[name]["valid"] or not exact[name]["closed"] or exact[name]["solids"] != 1:
            raise ValueError("Plate source is not a valid closed single solid")
        triangles = mesh_volume_inertia(definition, instance["matrix"], mesh["settings"]["pivot_yz"])
        mass_row = mass_rows[instance["id"]]
        cad_inertias = []
        for density, bound in zip(mass_row["density_kg_per_mm3"], mass_row["bounds"]):
            if not math.isclose(bound["mass_kg"] / density, volume, rel_tol=1e-9):
                raise ValueError("Drive mass report and plate volume disagree")
            cad_inertias.append(bound["inertia_kg_m2"] * 1e6 / density)
        if not math.isclose(cad_inertias[0], cad_inertias[1], rel_tol=1e-10):
            raise ValueError("Density-normalized CAD inertias disagree")
        volume_error = triangles["volume_mm3"] / volume - 1
        inertia_error = triangles["volume_inertia_about_pivot_mm5"] / cad_inertias[0] - 1
        if abs(volume_error) > 0.01 or abs(inertia_error) > 0.01:
            raise ValueError("Triangle/CAD cross-check exceeded 1 percent numerical tolerance")
        rows.append({"part": instance["id"], "definition": name,
                     "volume_mm3": volume, "net_area_mm2": volume / thickness,
                     "area_basis": "Exact exported CAD solid volume / nominal uniform 6 mm extrusion, including holes/slots",
                     "triangle_volume_relative_error": volume_error,
                     "triangle_inertia_relative_error": inertia_error,
                     "cad_volume_inertia_about_pivot_mm5": cad_inertias[0],
                     "cad_mass_bounds_kg": [bound["mass_kg"] for bound in mass_row["bounds"]],
                     "cad_inertia_bounds_kg_m2": [bound["inertia_kg_m2"] for bound in mass_row["bounds"]],
                     "matrix": instance["matrix"]})
    if len(rows) != 4 or pickup_report["inventory"]["instances"] != len(mesh["instances"]):
        raise ValueError("Unexpected plate or instance inventory")
    return rows


def build_report(root=ROOT):
    paths = ["output/pickup-mesh.json", "pickup-report.json", "drive-sizing.json", "pickup.py"]
    mesh, pickup_report, drive_report = [json.loads((root / name).read_text()) for name in paths[:3]]
    source_hashes = {name: sha256(root / name) for name in paths}
    if drive_report["source_pickup_sha256"] != source_hashes["pickup.py"]:
        raise ValueError("Drive report is stale relative to pickup source; no build was attempted")
    plates = snapshot_plates(mesh, pickup_report, drive_report)
    total_area = sum(row["net_area_mm2"] for row in plates)
    total_volume_inertia = sum(row["cad_volume_inertia_about_pivot_mm5"] for row in plates)
    prior_totals = drive_report["cad_mass"]["totals"]
    remainder_mass = [total["mass_kg"] - sum(row["cad_mass_bounds_kg"][index] for row in plates)
                      for index, total in enumerate(prior_totals)]
    remainder_inertia = [total["inertia_kg_m2"] - sum(row["cad_inertia_bounds_kg_m2"][index] for row in plates)
                         for index, total in enumerate(prior_totals)]
    candidates = []
    for material_name, thickness in (("6061_T6", 6), ("unfilled_PC", 6.35),
                                     ("unfilled_PC", 9.525), ("unfilled_PC", 12.7)):
        material = MATERIALS[material_name]
        result = plate_comparison(total_area, thickness, material["modulus_pa"], material["density_kg_m3"])
        inertia = total_volume_inertia * (thickness / 6) * material["density_kg_m3"] * 1e-15
        result.update({"material": material_name, "four_plate_inertia_about_pivot_kg_m2": inertia,
                       "assembly_mass_bounds_kg": [mass + result["mass_kg"] for mass in remainder_mass],
                       "assembly_inertia_bounds_kg_m2": [value + inertia for value in remainder_inertia],
                       "mass_saved_vs_nominal_al_kg": total_area * 6 * 2700e-9 - result["mass_kg"],
                       "qualified": False})
        candidates.append(result)
    settings = pickup_report["settings"]
    pivot = settings["pivot_yz"]
    contact_cases = []
    for name in ("front", "kick"):
        point = [0, *pickup_report["roller_centers_yz"][name]]
        for angle in (0, -20, -40, -60, -80, -100, -120, -140):
            contact_cases.append({"name": name + "_frontal_wall", "fold_deg": angle,
                                  "contact_basis": "Representative roller-height +Y load; not first-contact or persistent wall contact proof",
                                  **contact_work(point, pivot, [0, 150, 0], math.radians(angle))})
    for side in (-1, 1):
        for plate_name in ("main_cheek", "floating_cheek"):
            instance = next(row for row in mesh["instances"] if row["id"] == plate_name + "_" + str(side))
            definition = mesh["definitions"][plate_name]
            positions, matrix = definition["positions"], instance["matrix"]
            vertices = []
            for offset in range(0, len(positions), 3):
                local = positions[offset:offset + 3] + [1]
                vertices.append([sum(matrix[axis][index] * local[index] for index in range(4)) for axis in range(3)])
            point = min(vertices, key=lambda vertex: (vertex[1], -side * vertex[0]))
            for label, force in (("corner_wall", [0, 150, 0]), ("side_hit", [-side * 150, 0, 0])):
                contact_cases.append({"name": instance["id"] + "_" + label,
                                      "contact_basis": "Full exported plate mesh frontmost vertex; not full assembly first-contact proof",
                                      **contact_work(point, pivot, force)})
    beam_cases = [{"material": row["material"], **cantilever(force, length, 60, row["thickness_mm"],
                  MATERIALS[row["material"]]["modulus_pa"])}
                  for row in candidates for length in (300, 450) for force in (40, 150)]
    doubler_mass = 60 * 60 * 3 * 2700e-9
    return {
        "schema": "pickup-impact-material-screen/1", "date": "2026-09-18",
        "status": "PROVISIONAL_DESIGN_POLICY_NOT_COMPETITION_READY", "physical_validation": False,
        "source_sha256": source_hashes, "analysis_sha256": sha256(Path(__file__)),
        "network_calls_by_generator": 0, "cad_rebuild": False,
        "source_lookup": {"url_limit": 4, "attempts": SOURCE_ATTEMPTS,
                          "first_party_numeric_datasheets_verified": False,
                          "limitation": "Four named URLs exhausted; no usable numerical PDF extraction. No assumed property is manufacturer-guaranteed."},
        "materials": MATERIALS, "coordinate_frame": mesh["coordinate_frame"],
        "source_reference_1690": source_reference_geometry(root),
        "geometry": {"pivot_yz_mm": pivot, "front_yz_mm": pickup_report["roller_centers_yz"]["front"],
                     "kick_yz_mm": pickup_report["roller_centers_yz"]["kick"],
                     "main_cheek_x_mm": settings["cheek_x"], "floating_cheek_x_mm": settings["arm_x"],
                     "front_roller_coverage_mm": (settings["star_counts"]["front"] - 1) * settings["star_pitch"] + 12.7,
                     "coverage_basis": "11 discs at 38.1 mm pitch plus nominal 12.7 mm disc width, not capture guarantee",
                     "instances": len(mesh["instances"]), "plates": plates, "total_net_plate_area_mm2": total_area},
        "existing_assembly": {"mass_bounds_kg": [row["mass_kg"] for row in prior_totals],
                              "inertia_bounds_kg_m2": [row["inertia_kg_m2"] for row in prior_totals],
                              "scope": "Moving CAD subtotal; no omitted drives, wiring, guards or actual scale measurement"},
        "plate_candidates": candidates,
        "candidate_scope": "Identical YZ contours and pivot, uniform thickness along X; no new hole/shaft/belt stack or stock tolerance validation",
        "equivalent_pc_weak_axis_thickness_mm": equal_weak_axis_thickness(6, 69e9, 2.3e9),
        "equivalent_pc_thickness_sensitivity_mm": [equal_weak_axis_thickness(6, 68e9, 2.4e9),
                                                  equal_weak_axis_thickness(6, 70e9, 2e9)],
        "doubler_budget": {"basis": "Illustrative gross 60x60x3 mm aluminum pads, not designed bearing mounts",
                           "one_pad_mass_kg": doubler_mass,
                           "12_pad_mass_kg": 12 * doubler_mass, "24_pad_mass_kg": 24 * doubler_mass,
                           "pc6p35_plus_24_pads_kg": candidates[1]["mass_kg"] + 24 * doubler_mass,
                           "saving_before_extra_hardware_kg": candidates[0]["mass_kg"] - candidates[1]["mass_kg"] - 24 * doubler_mass,
                           "extra_hardware_mass_kg": None, "shaft_alignment_qualified": False},
        "contact_cases": contact_cases,
        "stow_contact_gate": {"status": "FAIL_FOR_LOW_FRONTAL_WALL_NORMAL_AT_DEPLOYED_POSE",
                              "convention": "q is right-hand +X fold angle in radians; stow is negative q",
                              "equation": "J=[0,-(z-zp),(y-yp)] metres/radian; Q=J dot F; stow work per positive stow radian=-Q",
                              "full_swept_unilateral_contact_solution": False,
                              "low_pivot_z40_front": contact_work([0, *pickup_report["roller_centers_yz"]["front"]], [110, 40], [0, 150, 0]),
                              "low_pivot_z40_kick": contact_work([0, *pickup_report["roller_centers_yz"]["kick"]], [110, 40], [0, 150, 0]),
                              "required": "Every active unilateral wall/reef/floor contact needs a feasible separating or compliant motion; no claimed passive stow if J dot F opposes it"},
        "load_targets": {"acquisition_aggregate_n": 40, "quasistatic_operating_contact_n": 150,
                         "basis": "Design targets, not measurements, not simultaneous per-roller loads and not collision qualification",
                         "collision_250n_qualification": False},
        "beam_examples": beam_cases,
        "collision_cases": [collision(55, speed, travel) for speed in (0.5, 1, 2) for travel in (10, 50)],
        "reduced_mass_sensitivity": [collision(mass, 1, 50) for mass in (5, 15, 55)],
        "collision_scope": "55 kg finite single-robot energy illustration, not universal maximum. 5..55 kg reduced mass is assumed sensitivity only; other robots, rotation and continued drive can add energy.",
        "policy": {"preferred": "Protected stiff 6061-T6 bearing/reducer skeleton with replaceable 6.35 mm unfilled PC leading guides/face",
                   "alternate": "6.35 mm PC outboard cheeks with local aluminum bearing doublers are a prototype candidate only; global flex/shaft and timing-belt compatibility unresolved",
                   "force_path": "Sacrificial face -> directionally verified reversible compliance/link/translation -> spring or dissipative travel -> mechanical stop -> chassis frame, bypassing reducer teeth",
                   "forbidden_assumptions": ["Motor brake/high ratio is impact protection", "Local bearing pads restore global stiffness",
                                             "Rigid shaft and timing belt can tolerate independent cheek flex without alignment checks",
                                             "Printed stock is qualified", "A static 250 N check qualifies a collision"],
                   "final_kinematics_selected": False, "manufacturing_release": False},
        "release_gates": {"datasheet_and_stock": False, "stow_direction_unilateral_contacts": False,
                          "shaft_belt_alignment": False, "stop_frame_energy_capacity": False,
                          "physical_coupon_and_fixture_tests": False, "human_machine_review": False},
    }


def main():
    report = build_report()
    (ROOT / "impact-materials.json").write_text(json.dumps(report, indent=2, allow_nan=False) + "\n")
    print(json.dumps({"status": report["status"], "area_mm2": report["geometry"]["total_net_plate_area_mm2"],
                      "plate_candidates": report["plate_candidates"], "stow_contact_gate": report["stow_contact_gate"],
                      "doubler_budget": report["doubler_budget"]}, indent=2))


if __name__ == "__main__":
    main()