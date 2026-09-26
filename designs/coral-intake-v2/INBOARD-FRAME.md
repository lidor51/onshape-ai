# Physical Inboard Frame Candidate

Status: **FRAME_CONTAINED, NOT RELEASED; FAIL_INTERFERENCE**.

This is an actual changed B-rep assembly, not a viewer offset or frame redefinition. It retains one positioning pivot, all four authentic X44 motor instances, the indexer, 11/9/7 upper stars, eight modeled belt paths, and two modeled chain paths. Nominal belts/chains remain routing geometry, not supplier tooth or tension certification.

## Implemented Geometry

- Rear roller and positioning pivot YZ = [80, 348] mm; middle = [-149.686743196, 336]; front = [-264.25113557, 166]. Real cheek and frame support plates are rebuilt from these centers.
- Front/middle center distance 205 mm with 18T pulleys and 500 mm WCP-0625; rear/middle 230 mm with 18T pulleys and 550 mm WCP-0628. Reversing 36T/15T branch uses 750 mm WCP-0636. Catalog identifiers are parent-supplied official-catalog verification; no network request was made here.
- Kicker stays at [-122, 34]; crossmembers at [-288, 268] and [-210, 408]. Stow stays -165 degrees; front float remains -8..0 degrees.
- Deployment reducer translates +34 mm in X and then rotates +45 degrees about the rear pivot. Authentic motor/gear bodies and their relative clocks are unchanged. The intermediate chain lane is X=-231; final chain and 16T/60T sprockets retain X=-249; independent adapter stays X=-243.
- The second shaft is rebuilt at X=-268..-193 with spacers generated from actual bearing/sprocket occupied intervals, retaining 0.2 mm end float. Both bearing planes retain 57 mm spacing. The first shaft stack moves intact.
- Deployment frame gaps become 43 mm, with nominal M5x130 bolts from head base X=-194 to tip X=-324 and existing nuts at X=-315.5. The left frame plate is regenerated from its original root/rear-bearing geometry with the rotated anchor pattern; no unattached translated bracket is claimed.
- Four external root screws, washers, nuts, and crush sleeves are replaced by inward M5x35 screws, inner washers, and captive 17.8x20x35.8 mm tapped blocks. Existing 12 mm standoffs remain. Blocks occupy absolute X=327.1..344.9; the originally proposed 20.8 mm block width was shortened to achieve the 5 mm reserve. The 16 mm blind tap has 13.9 mm nominal screw engagement and 1.8 mm back wall. Rail geometry is regenerated with inner-wall-only 5.5 mm holes; outside frame planes are unchanged.

The block has 0.2 mm height clearance in the assumed 36 mm rail cavity and a 0.1 mm nominal seating gap to the inner wall. Insertion is from an open tube end. The 2 mm rail wall, block contact, M5 thread finish, bolt grade/preload, buckling of extended spacers, bearing loads and impact strength are **not qualified**. There is no full-width crush-sleeve load-path claim.

## Measured Results

Final assembly: **845 instances, 840 physical, 5 existing references, 207 active definitions, 203 physical BOM rows**. All physical instances remain included in the audit and physical STEP assemblies. The five unchanged references are two sensor envelopes, bumper, and front/rear frame envelopes. The actual side rails remain physical and are the only zero-reserve exceptions.

The fixed frame is X=-350..350, Y=0..760, maximum Z=1066.8 mm. Exact analytic B-rep bounds show zero outside parts, zero reserve failures, and zero full-spin enclosure failures at both stow float endpoints. A conservative nearest-endpoint displacement bound extends containment across the entire -8..0 degree float interval at the single -165 degree fold pose.

| Boundary | Non-rail continuous-float/full-spin margin lower bound |
| --- | ---: |
| Left | 5.100 mm |
| Right | 5.100 mm |
| Front | 15.166 mm |
| Rear | 216.000 mm |
| Height | 318.356 mm |

The rails reach the original side planes with only numerical B-rep tolerance and have 25 mm rear clearance. These nominal bounds are not manufacturing-tolerance allowances. The two crossmembers versus full-spin upper-star enclosures and the 25.5 mm kicker disk have a conservative **8.672 mm minimum gap** over the continuous float range, using a 0.5 degree grid plus the maximum between-sample displacement. This does not establish game-piece transport.

## Remaining Collisions

The bounded fixed-context check completed **40 actual Boolean common operations**, with **25 interference pairs** and zero budget-unknown pairs. The scope is relocated fixed rear roller/shaft/drives and repacked deployment hardware versus the retained indexer/dock and installed indexer drives. It is not a complete system sweep, nor all rotor phases.

- Rear star `v2_star_rear_0_body_2` intersects the left first idler's upper plate, pulley, screw, shaft, two spacers and upper bearing. Examples: 47.232 mm3 with the upper plate; 493.367 mm3 with the bearing. Seven confirmed pairs.
- `pt_deployment_final_chain` intersects `v1_indexer_plate_L_247`: **741.202 mm3**. Rotating the reducer clears the tested gearbox solids from the old upper-plate/post interference but does not clear this retained final-chain run. One confirmed pair.
- Pickup first-stage plate, shaft, supports, hardware and gear intersect the right indexer upper plate/post; the motor also has a 0.0301 mm3 overlap with one retained wheel. Seventeen confirmed pairs. Example: mount/upper plate **2402.623 mm3**.

No indexer, roller, motor or plate aperture was removed to hide these collisions. No bearing-load-path redesign was attempted. Two coherent physical repair rounds were used: narrowing the blocks for reserve, then rotating/reanchoring the deployment reducer. The resulting candidate solves nominal frame bounds but is **not a functioning collision-free assembly**.

Feed contact remains parent-owned and unqualified. The supplied 353-point float=-4 degree compression-route observation is not rerun here and is not physical feed proof; float=0/-8 routes remain unqualified. Hard stops, stow holding, guards, chain seating/pretension, moving cables, tolerances, loads and continuous fold motion remain unresolved. No rules certification or competition-ready claim is made.

## Verification And Artifacts

- Nine tests in [test_inboard_frame.py](test_inboard_frame.py) passed after the final physical repair: candidate layout, belt closure, source gear meshes, pulley contacts, actual stack intervals, retained motors/rollers/indexer, frame-hole alignment, root threads and selected deployment/indexer clearance.
- All four new block/screw commons match the individual 13.9 mm M5 engagement annulus and have no overlap outside that thread cylinder. They supplement the four existing verified top-plug threads; no broad collision exclusion or change to the existing thread classifier is used.
- All **150 custom STEP round trips** passed. No exported active definition is invalid. Every exported stow mesh vertex lies within its exact B-rep bounds; maximum excess is 0 mm. Assembly STEP reimport is not checked; source fidelity is not certified by an OCCT export.
- **165 artifact hashes and 19 source-code hashes** independently verified. All protected files, including existing exports, were unchanged during generation; all **305 frozen v1 files** match their baseline. No existing source file was modified, including the power installer.
- Final audit/export completed synchronously in 531.469 seconds. No required one-shot process remains running.

Files for the parent viewer and review:

- [inboard-frame-output/manifest.json](inboard-frame-output/manifest.json), [inboard-frame-output/coaxial-mesh.json](inboard-frame-output/coaxial-mesh.json)
- [inboard-frame-output/coaxial-deployed-NOT-RELEASED.step](inboard-frame-output/coaxial-deployed-NOT-RELEASED.step), [inboard-frame-output/coaxial-stow-NOT-RELEASED.step](inboard-frame-output/coaxial-stow-NOT-RELEASED.step)
- [inboard-frame-output/audit.json](inboard-frame-output/audit.json), [inboard-frame-output/targeted-interference.json](inboard-frame-output/targeted-interference.json)
- [inboard-frame-output/BOM.csv](inboard-frame-output/BOM.csv), [inboard-frame-output/BOM.json](inboard-frame-output/BOM.json), [inboard-frame-output/powertrain-installation.json](inboard-frame-output/powertrain-installation.json)
- [inboard-frame-output/root-thread-contacts.json](inboard-frame-output/root-thread-contacts.json), [inboard-frame-output/source-freeze.json](inboard-frame-output/source-freeze.json), [inboard-frame-output/artifact-hashes.json](inboard-frame-output/artifact-hashes.json)

Run from the repository root using the existing manufacturing-package environment:

```powershell
& trials/manufacturing-package/.venv/Scripts/python.exe -I -B -W ignore designs/coral-intake-v2/test_inboard_frame.py
& trials/manufacturing-package/.venv/Scripts/python.exe -I -B -W ignore designs/coral-intake-v2/inboard_frame.py --export
```

The generator's zero exit code means containment/export/source-freeze checks passed. It explicitly does **not** mean collision clearance or release readiness; inspect `collisionStatus`, `releaseReady` and the per-pair evidence.