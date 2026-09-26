# Full-Powered Starting Frame

**BLOCKED. This is a geometry audit, not a corrected starting configuration,
collision certificate, legality certification or competition release.**

## Scope

The wrapper in [starting_frame.py](starting_frame.py) builds the existing
coaxial assembly and installs the full powered transmission on that object.
No pickup centers, supports, drives, frame dimensions or viewer positions are
changed. All existing builders, thread-contact checks, v1 and earlier exports
remain frozen. New artifacts are isolated in
[starting-frame-output](starting-frame-output/).

The requested frame is X[-350,350], Y[0,760], maximum Z1066.8 mm, with 5 mm
reserve. The bumper face at Y=-85 is **not** the starting boundary. The two
physical chassis side rails have no inset requirement but must still remain
inside the frame. Only the existing bumper and front/rear frame reference
envelopes are excluded from the physical inventory. No motor, drive, mounting
plate, fastener, chain or belt is treated as a reference.

## Evidence

- [audit.json](starting-frame-output/audit.json): every exact-pose B-rep bound,
  every margin and violation, all fixed protrusions independent of fold angle,
  rotor enclosures, counts, thread checks and geometric route rejection.
- [manifest.json](starting-frame-output/manifest.json): full installed assembly,
  source bindings and hashes, full powertrain installation records, matrices,
  STEP paths and per-instance `starting_frame` flags.
- [coaxial-mesh.json](starting-frame-output/coaxial-mesh.json): real B-rep meshes,
  true deployed/stowed matrices, all hardware and violation flags for the parent
  viewer. No cropping, hiding, moved display geometry or old viewer overwrite.
- [mesh-brep-comparison.json](starting-frame-output/mesh-brep-comparison.json):
  transformed actual mesh extrema compared with exact-pose B-rep extrema.
- [source-freeze.json](starting-frame-output/source-freeze.json): before/after
  protected hashes and comparison with the 305-file frozen v1 baseline.

The bound calculation uses OCCT `BRepBndLib.AddOptimal`, with triangulation
disabled and shape tolerances included, on the **rotated solid**. Rigid
translations are then added to cached orientation-specific bounds. Transformed
local box corners are not used as exact extrema. These remain nominal
kernel/tolerance bounds, not measurements of manufactured hardware.

Full rotor turns use continuous enclosing disks derived from 16 analytic
support directions: the greatest support is multiplied by `sec(pi/16)`.
This encloses unsampled phases as well as sampled ones. An enclosure exceeding
the frame is marked unresolved unless the actual posed solid already violates
it. Shaft end hardware is included. Whole fused motor sources and the deployment
output plate are conservatively enclosed; this does not assert that their
casings or a held deployment flange physically rotate in stow.

## Packaging Decision

The angle-only route cannot correct any fixed protrusion. The unchanged rear
roller remains at Y=-25. Its rotating contact envelope necessarily protrudes
through the Y=0 plane for every fold angle. The installed deployment sprocket,
chain and rear-axis hardware must also fit, not just a sampled star phase.

The one local route screened is moving only the coaxial rear row inboard while
preserving the front, middle and kicker contact centers. It is rejected when
the necessary rear Y produces more than 241.7 mm horizontal separation from
the middle row: two uncompressed 63.7 mm-radius rollers and a 57.15 mm-radius
coral cannot both contact across that gap, even with an optimally chosen rear
height. This is an optimistic necessary condition, not a feed simulation.
Moving the entire pickup inward would change the floor acquisition/throat and
is not implemented or offered as a solution.

The next viable decision requires a layout change: redesign the front/middle
contact path to meet an inboard coaxial rear row, or add a dimensioned powered
transfer row if that cannot preserve floor acquisition. The former deserves
the first study because the latter adds parts. Both require new belt lengths,
carrier/support geometry, continuous feed validation and folded clearance.
An independent inboard pivot is a different supported cassette and chain-path
design, not a reparenting change; prior indexer clashes remain unresolved.

Side-width correction is a separate real mounting problem. Reversing the
existing external root screws does not remove the external nut envelope.
An internal spreader/through-sleeve attachment or properly specified recessed
hardware needs a new structural joint and tool-access check. A 2 mm rail wall
is not adequate justification for an ordinary 9 mm socket-head counterbore.
Neither the declared 700 mm frame nor the rail positions are changed here.

## Run

From the repository root, using the existing manufacturing-package environment:

```powershell
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B -W ignore designs/coral-intake-v2/test_starting_frame.py StartingFrameTests
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B -W ignore designs/coral-intake-v2/starting_frame.py --export
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B -W ignore designs/coral-intake-v2/test_starting_frame.py
```

The audit intentionally returns **exit 1** for geometric failure; exit 2 is an
audit integrity failure. Passing software/artifact tests must not turn a failing
geometry gate green. Existing exports and viewers are not regenerated.

## Open Gates

Deployment hard stops and a stow holding/restraint mechanism are **missing**.
The audit does not establish continuous fold/float clearance, feed into the
indexer, chain tooth seating/master-link envelope, guards, cables, actual belt
tension, strength, tolerance stacks or a starting configuration legal ruling.
Four verified nominal tube-plug M5 engagements are preserved as expected
contacts, not reclassified as clearances or claimed to establish strength.