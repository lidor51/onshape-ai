# Coral Intake V1: Local Parametric Prototype

**Status: prototype-engineering. NOT RELEASED. Geometry acceptance FAIL. Current generator BLOCKED by syntax after the three-repair limit.**

**Revision boundary:** the STEP, BOM, `parts.json`, meshes and drawings are the last successfully executed export (pivot Z210, sideplates X +/-238, 40 mm rear hard core). The latest `model.py` / `params.json` attempt a Z265 pivot, X +/-290 supports and 20 mm rear core, but failed Python parsing and were NOT exported. Do not treat the current parameters as the retained CAD's configuration. See [EXECUTION-REPORT.md](EXECUTION-REPORT.md) and [execution-status.json](execution-status.json). Further generator repair requires direction because the explicit three-local-repair limit was reached.

This is actual CadQuery/OpenCascade B-rep CAD for a new option 1 + option 9 functional hybrid: a separately folding compliant pickup, two independently powered plan-view V-indexer banks, and a detachable tray/receiver interface. It is not a replica, not option 14, not a verified 1778 mechanism, and not native Onshape. It does not yet meet the requested complete functional engineering contract. Missing gears, transmission details, physical joints and failed safety/contact gates are not hidden by software test passes.

## Files

- `params.json`: mm geometry, source-grounded roller stations, stock assumptions and restricted fit dimensions.
- `model.py`: offline parametric generator, authentic source imports cached once, per-part rigid placements.
- `assembled.step`: local B-rep assembly including authentic X44/bearings and explicit sensor envelopes. Missing gears are NOT approximated inside this file.
- `custompart.step`: combined custom B-reps in deployed assembly positions.
- `custom/*.step`: individual custom B-reps in their manufacturing/local coordinates.
- `parts.json`: definitions, source hashes, local STEP/STL paths, row-major local-to-world transforms, geometry tags, module and motion tags, missing components, belt routes and gear centers.
- `meshes/*.stl`: viewer tessellations derived from B-reps. These are not authoritative manufacturing geometry or authentic source files.
- `BOM.csv` / `BOM.json`: custom stock, instance quantities, nominal fasteners/washers and explicit missing items. Hardware is simplified nominal B-rep, not vendor CAD. Thread helices are not represented.
- `validate.py`: geometry gates with nonzero exit for required failures; `test_package.py`: separate software tests.
- `initial-probe.json`: preserved first roller-only 100-pose PASS, never a full-mechanism acceptance result.
- `quick-validation.json`, `validation.json`, `export-validation.json`, `history/`: local evidence. Geometry reports are archived before replacement.
- `drawings/inspection-not-released.pdf` and flat DXFs: inspection / fit-review only. Their local flat-part gate passed; assembly release did not. DXF wires have 0.05 mm curve deflection and are not approved finish-bore toolpaths.

The two externally owned review files, `COTS-REVIEW.md` and `RELEASE-GATES.md`, are not generated or edited by this package.

## Reproduce Offline

Run from the repository root in PowerShell using the existing user-specified environment. No package installation, network, credential access, API, cloud or Onshape session is needed. The scripts reject socket connections and child-process launches. Runtime verification used Python 3.10 / CadQuery 2.6.1 / OCP 7.8.1.1; no claim is made about the editor-selected interpreter.

```powershell
$cad = 'C:/Users/lidor/FRC/onshape-ai/trials/manufacturing-package/.venv/Scripts/python.exe'
& $cad -I -B designs/coral-intake-v1/geometry.py
& $cad -I -B designs/coral-intake-v1/model.py --check
& $cad -I -B designs/coral-intake-v1/test_package.py
& $cad -I -B designs/coral-intake-v1/model.py
& $cad -I -B designs/coral-intake-v1/validate.py --reimport --step 5
& $cad -I -B designs/coral-intake-v1/drawings.py
```

The listed model/test/validation commands currently stop on the generator's `IndentationError`, not a newly executed geometry report. The last executable revision's validator exited 1 for actual geometry failures. Do not replace those with expected-failure acceptance tests. Its ten software tests passed before the subsequent source correction; that pass does not apply to the current non-executable source. STEP re-export of vendor objects is not source equivalence evidence; the original hash-bound source files are authoritative and left untouched.

## Mechanism And Coordinates

Custom coordinates are X width, Y into the robot, Z up, all millimeters. Source 1690 reference observations were native Y-up; no reference mesh is relabeled as a custom solid. Chassis is X +/-350, Y 0..760, frame front Y 0..25 / Z 25..65. Continuous front bumper is Y -85..0 / Z 45..165, with a conservative full width of 870. There is no bumper opening.

Deployed pickup roller Y/Z centers remain (-140,34), (-261,161), (-136,262), (-9,287); OD 51/127/127/127. The rigid cassette folds -120 degrees about Y110/Z210. Our 360 mm contact width reserves space for the X44 motor at the side; it is an engineering choice, not a copied source width. C-shaped paired plates route around the continuous bumper. Crossmembers are 20x20x2 metric tube with separate end plugs. Replaceable axle cassettes use the actual WCP bearing interface. The pivot uses split side stubs, not a shaft through the coral path.

The floating front roller uses paired physical arms about the middle roller, plain bush/journal pivots and external stop hardware, provisionally -8..0 degrees. It is NOT the source slotted mechanism and NOT a reference four-bar. Exact stops, joint retention, preload and moving-belt take-up still need engineering validation. Upper pickup and indexer closed paths are actual B-rep round-belt loops with custom grooved pulleys, not vendor toothed belts; drive friction, tension and wrap remain unverified. The opposite-sense low kicker transmission is absent and called out as a blocker.

Each indexer bank has three vertical shafts at mirrored X172.5/Y74, X110/Y182, X92.25/Y288 with custom 76.2 OD / 25.4-thick compliant wheels. First two stacks have Z144.6/170/195.4; the final stack Z165.6/191/216.4. This is custom geometry, NOT a scaled authentic AndyMark 2-inch wheel. Two X44s occupy real drilled motor mounts. Four motor/output interfaces are on the specified 12/60 20DP pitch center distance 45.72 mm; no unverified gear solids are substituted.

Tray top is Z133.85. Full coral is OD114.3 / bore101.6 / length301.625, seated with its Y axis at (0,385,191), spanning Y234.1875..535.8125 and Z133.85..248.15. A fixed stop begins at Y538. Receiver reservation is X +/-130, Y370..510, Z250..1100. Receiver and existing scoring arm remain reference interfaces, not an extra scoring subsystem. The rear is open from above; the reference keepout checks clear, but a complete grasp/lift-away transfer has not been proven.

## Authenticity And Offline Blockers

Only X44 WCP-0941 and hex bearing WCP-0783 are authentic imported vendor B-reps in this assembly. Original source SHA256 values and source-to-attachment transforms are in `parts.json`. Repeated instances share one import per original. The X44 source contains two solids; its housing/shaft presentation is not split into an invented moving rotor. X60 remains quarantined and unused.

The cache contains authentic older WCP-1016 16T and WCP-0137 48T assets, but not requested WCP-1010 12T and WCP-0121 60T original STEP files. Catalog text confirms SKUs; it does not supply those missing geometries. No network request was made to acquire them, no older failed-model surrogate was used, and the requested gearing remains a hard blocker. Existing original source files were neither modified nor replaced.

Large pickup contact elements are explicitly custom tube/core/rubber volumes. There is no verified cached 5-inch compliant star product interface. Rubber hardness, segment construction, bonding/fastening and allowable deflection must be chosen and tested. Shafts keep exact 12.7 mm AF; vendor bearing CAD bore is 12.72 mm and journal OD28.5496. Proposed custom bearing seat is 28.57, not a verified press fit. Motor pilot is 19.05; drawing threads are #10-32 UNF. Nominal motor screw bodies are 4.826 mm diameter, not M5 despite the generic geometry identifier.

## Operation And Service Scope

One coral maximum. Intended sequence: deploy empty pickup; acquire with upper rollers and opposite-sense kicker; command bank differential speeds only while centering; presence sensor inhibits a second acquisition; seated sensor stops and retains the offered piece; receiver grips and withdraws upward; clear-jam reverse only when receiver is retracted and a sensor sanity check is satisfied. Folding with a captured piece is not authorized by the current evidence. There is no automatic two-coral workflow and no claim this control narrative has been implemented on a robot.

Two separate sensor adapters are present for arrival and seated detection. Their actual hole geometry is modelled, but the 20x15 pattern and 32x24x15 envelope are explicitly provisional, NOT a verified LaserCAN mounting interface. Line of sight and actual electronics need confirmation. Tray dock screws permit removal; sensor wiring, strain relief, hand access and a verified jam-service envelope remain open gates.

## Critical Inputs Before Release

1. Supply the actual offline WCP-1010/WCP-0121 STEP originals with catalog/drawing identity, or explicitly authorize an alternate verified reduction.
2. Resolve the measured rear hard-core collision at the bumper-crest witness and demonstrate the full-length orientation path, not merely isolated poses.
3. Complete kicker reversal, closed drive continuity, tensioners, floating take-up, pulley retention and guarding. Round belt slip is not assumed acceptable.
4. Verify every mounting interface, frame doubler, tube wall bolt/plug joint, split pivot torque connection, shoulder/spacer stack, nut and shaft collar. Contact adjacency cannot prove these.
5. Establish fold reduction, holding/brake strategy, torque, current limits, stopped-load cases and hard stops before powered testing.
6. Choose actual elastomer, wheel manufacturing process, shaft grade/length SKU, bearing fit class, available metric stock and cutter/tolerance capacity. Custom hex holes are not automatically manufacturable on a round-tool mill.
7. Verify actual sensor CAD/pattern, receiver end-effector sweep, cable routing, tool access and quick-service procedure.

Unknown annual Onshape allowance only blocks cloud work; it is irrelevant to execution of this local package. No cloud readiness, rule compliance, manufacturing release or physical reliability has been inferred from valid CAD exports.