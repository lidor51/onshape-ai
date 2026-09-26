# Provisional Sizing Screen

Generated from source-bound local inputs. These are calculations, not Onshape
measurements, a validated mechanism, or electrical/control settings.

## Envelope Assumptions

- Rectangular blank chassis: 700 x 760 mm, perimeter 2920 mm.
- Margin below sourced perimeter maximum: 128 mm of total perimeter, not per side.
- Starting-height target margin: 166.8 mm.
- Front-extension target margin: 57.2 mm from ROBOT PERIMETER, not bumper face.
- Horizontal CORAL centered-yaw disk: 322.6 mm diameter; 362.6 mm with the assumed allowance.
- These scalar numbers do not prove stow, bumper coverage, actual movement, wiring or receiver clearance.

## Pickup Speed Screen

X44 trapezoidal 12 V test endpoints; 127 mm example contact diameter and 3 m/s
illustrative target. Diameters/targets/reductions are not selected hardware.

| Total reduction | No-load surface m/s | Required fraction of motor free speed |
| --- | ---: | ---: |
| 3:1 | 17.20 | 17.4% |
| 6:1 | 8.60 | 34.9% |
| 9:1 | 5.73 | 52.3% |
| 12:1 | 4.30 | 69.8% |

Speed fraction is not duty cycle or a guaranteed loaded operating point. Higher
reduction can increase stall/jam force; it is not automatically safer. Check the
exact contact-wheel RPM rating before any powered test.

## Pivot Load Screen

Assumptions: 4 kg structure, 0.22 m center-of-mass radius,
0.22 kg m^2 structure inertia about the pivot, worst manual CORAL mass 0.816 kg at 0.3 m,
80 degrees in 0.75 s, 75% efficiency, 1 N m friction, 1.5 load factor.
CORAL centroidal inertia: 0.007383 kg m^2, using a uniform annular tube and worst principal axis.
This assumes a direct constant-ratio pivot and triangular rest-to-rest velocity,
not a collapsing linkage, impacts or a measured controller trajectory.

Conservative combined output torque: **22.53 N m**.

| Reduction | Required peak motor rpm | Required motor torque N m | Torque / extrapolated stall |
| --- | ---: | ---: | ---: |
| 36:1 | 1280 | 0.834 | 20.3% |
| 50:1 | 1778 | 0.601 | 14.6% |
| 64:1 | 2276 | 0.469 | 11.4% |

These are requirements, not proof of an available simultaneous speed/torque point.
Stator and supply current differ; no current limit is inferred from stall current.
No gear stress, bearing load, braking/backdrive, impact or thermal check has passed.

## Provenance And Reproduction

Inputs and all sensitivity rows: [concept-screen.json](concept-screen.json).
Assumptions: [concept-inputs.json](concept-inputs.json); motor sources: [cots.md](cots.md); rules: [rules.md](rules.md).

```powershell
node --test research/2025-coral/sizing.test.mjs
node research/2025-coral/generate-concept.mjs
```

Both commands require no credentials, dependencies or network. Source hashes
allow stale inputs to be detected; they do not turn assumptions into facts.
