# Full Subsystem Packaging Checkpoint

**NOT RELEASED. This is a full-context B-rep checkpoint, not a competition-ready mechanism.**

## Current Architecture Direction

The subsequent [coaxial single-pivot candidate](COAXIAL.md) now has a
[full-context viewer](coaxial-output/revision-feed/index.html) and actual local
STEP solids. It supersedes the isolated low-pivot proposal, which collided with
the fixed indexer. All functions remain in scope, but downstream drives and
qualification are unfinished. Neither this old linkage nor the new candidate is
released for manufacture or competition.

The user prefers the simpler single pivot and rejects the large deployment sweep
of this linkage. [The compact single-pivot study](SINGLE-PIVOT.md) is now the
preferred direction, with a provisional lower axis and explicit impact/load-path
requirements. The indexer, receiver, motors and transmissions stay in scope.
The geometry below is preserved as a rejected linkage checkpoint, not the new
single-pivot design. The lower-axis screen has not produced complete replacement
CAD or cleared the fixed indexer/drives.

## Preserved Linkage Review

[Open the complete system viewer](system-output/index.html). It shows all589
physical candidate occurrences by default, including the indexer/tray and four
authentic X44 motor bodies. Seven reference volumes, including unfinished
reduction spaces, are available as an overlay. Rendering the whole assembly
does not close the missing power paths.

The subsequent gravity/virtual-work screen rejects the displayed near-horizontal
linkage as a qualified passive impact-relief mechanism: about3735 N frontal force
would be needed at its initial10 mm vertical offset merely to overcome the
screened gravity load, excluding drivetrain resistance. This is distinct from
the earlier favorable kinematic sign. See [deployment-path.json](deployment-path.json)
and [IMPACT-MATERIALS.md](IMPACT-MATERIALS.md). Do not use the pose slider as proof
that a wall hit will lift or retract this pickup.

Two exact hard interferences are confirmed in the exported solids: deployment
motor support/rear dock crossbar147.47 mm3, and pickup stage shaft/upper-right
rocker588.71 mm3. The2,188 unchecked candidates, missing reductions/joints,
unqualified materials/load paths and physical test gates remain blockers.
Three bounded repairs were exhausted; no subsequent repair or approval is implied
by the viewer or successful software tests.

The controlling outputs are generated under [system-output](system-output/):
[complete assembly](system-output/systemassembly.step), [mesh data](system-output/system-mesh.json),
[summary](system-output/summary.json), [collision results](system-output/checks.json),
[BOM](system-output/BOM.json), [source freeze](system-output/source-freeze.json), and
[materials and wall-hit assessment](system-output/materials-wall-hits.json).
The STEP assembly contains actual physical candidate solids. Reference drive spaces,
receiver, bumper and wire envelopes are exported separately. Mesh data includes both,
with explicit reference flags; every physical part is opaque.

## Included Geometry

- The actual [pickup.build](pickup.py) B-reps, not an envelope replacement. Original cheeks,
  rollers, shafts, floating arms, hardware and split stubs are retained. All former fixed
  pickup parts now translate with the module. Four axial crossmember screws become nominal
  M5x25 and their four washers move outward 6 mm for the new ears; the original files and
  original cheek solids remain unchanged. The former pivot hardware is redundant, not a
  hidden chassis attachment.
- The v1 powered indexer, both original X44 drives, original pinions/output gears, six
  shaft capture stacks, pulleys, round belts, posts, tray and dock parts. Only the lightweight
  indexer/dock builders and indexer capture routine run. The old pickup, fold drive, frame
  cheeks and pivot stubs are never instantiated. Retained geometry remains unapproved.
- Two additional authentic cached X44/12T/60T stages, one moving with the pickup and one
  chassis-fixed. All four drive outputs are clocked 3 degrees using the existing routine.
  This is not new certification of tooth clearance, torque transfer or dynamic mesh.
- Four 6 mm aluminum links at X=+/-292 mm, double-supported ground bearings, short front
  pivot stubs, an upper common shaft, open triangulated ground plates, moving forks,
  bolt-on ears, tube outriggers and assumed chassis side rails. No lower transverse shaft
  is placed across the coral path.
- Actual 6.35 mm polycarbonate leading guards, 3 mm partial drive guards and the retained
  3 mm PC tray. Stop adjusters and unspecified buffer solids are candidates, not approved
  dampers. No precision metal bends are required by these candidate shapes.

## Deployment Hypothesis

The pickup translates without rotating. Ground pivots are (Y,Z)=(200,185),(340,365),
front pivots (-300,195),(-160,375); separation is sqrt(500^2+10^2) mm for each link.
For q=0..78 degrees, with trigonometry evaluated in radians:

```
dy = 500*(1-cos(q)) + 10*sin(q)
dz = 500*sin(q) + 10*(cos(q)-1)
dY/dq = 500*sin(q) + 10*cos(q)
```

Positive +Y wall force has positive virtual work for positive retraction across this
range. This proves a kinematic sign only. An unselected high-ratio reduction, friction,
inertia or a controller may prevent that motion. Link motion rotates -q about its ground
pivot; front-bearing instances share that transform. Float occurs about the v2 middle
roller before module translation. The mesh manifest records each transform explicitly.

## Completion Boundary

The downstream pickup HTD stage has no original pulley CAD or selected complete belt
installation. The deployment reduction and coupling to the upper common shaft are
unresolved. Do not multiply the modeled 5:1 stage into a claimed 10:1 or 50:1 drive.
Kicker reversal, torque/current/duty/holding, continuous transfer and loaded stow are
unproven. Real motors are present; full power paths are not complete.

The proposed wall-force path is PC guide -> moving fork/ear -> outriggers and pickup
crossmember joints -> short pivot stubs/bearings -> links -> ground frames -> chassis
roots. Tube plugs lack positive radial retention, root crush sleeves/nuts and several
support joints are unfinished, and bearing retention and long-link lateral stiffness
need engineering. Consequently this force path is not approved. Partial guards are not
full drive protection, and stop-block mounting and buffer energy capacity remain open.

Exact collision results are authoritative for their sampled poses only. All physical
part pairs enter AABB broadphase; identical rigid-relative poses are reused. Significant
new-structure/indexer pairs run first. There are no silent fastener or adjacency waivers.
Proven overlaps use a point classified strictly inside both actual B-rep solids; overlap
volume is not computed. No witness is not proof of clearance: exact distance follows,
and zero-distance cases without an interior witness remain unqualified contacts.
Nominal thread overlap, near-contact and soft overlap remain explicitly unqualified.
All remaining candidate pairs are listed if the exact-call or time budget is exhausted.
Continuous motion, held-coral trajectories, manufacturing tolerances, strength, impact
survival, fatigue and competition rules compliance are not established.

## Reproduction

From the repository root, offline, without new dependencies:

```powershell
& trials/manufacturing-package/.venv/Scripts/python.exe -I -B designs/coral-intake-v2/test_system.py
& trials/manufacturing-package/.venv/Scripts/python.exe -I -B designs/coral-intake-v2/system.py --max-exact 1000 --seconds 360
```

The build writes only system-output. Exit code 2 from the exporter means the checkpoint
was produced but the physical release gate is BLOCKED; software tests are not that gate.
The collision budget is at most 1,000 exact kernel calls; the remaining wall-clock
allowance is computed after build/export. Individual OCCT operations are not preemptible.
Results and all unchecked obligations are persisted before and after each tested pair.
The first run exceeded the budget inside an OCCT call and was forcibly stopped; its
geometry/report hashes are recorded as superseded evidence. Use an external process
watchdog for a strict total runtime bound; a Python between-call timer cannot enforce it.
No full v1 validator is run. Protected source hashes are captured before and after.

Custom STEP exports require valid positive-volume solids and are reimported individually.
These are engineering exports, not released drawings/toolpaths. Vendor originals retain
their cached source bindings and normalization; the convenience assembly re-export does
not establish vendor STEP fidelity. Nominal hardware is parametric B-rep with stated
dimensions, not vendor certification. No mesh-to-B-rep substitution is used.
The BOM gives active quantities, areas and assumed-density mass where meaningful;
unknown vendor/mixed-material mass is null, never zero or an asserted system total.