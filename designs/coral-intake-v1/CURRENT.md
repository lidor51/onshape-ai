# Current CAD Checkpoint

**NOT RELEASED. The requested complete, low-part-count, reliable subsystem has
not been achieved.** This directory contains actual custom B-rep CAD and original
purchased-part geometry, but the integrated draft fails assembly acceptance.

## Current Files

- [Interactive CAD view](checkpoint/index.html): our geometry, not the1690 source
  robot. CAD-derived meshes, module isolation, modeled fold/float and full-size
  coral witness poses. The animation is not a successful motion demonstration.
- [Current assembly STEP](checkpoint/assembly-not-released.step):44,238,205 bytes,
  local CAD export. Not native editable Onshape feature history or working mates.
- [Current parts/BOM](checkpoint/BOM.csv) and [manifest](checkpoint/manifest.json).
- [Assembly acceptance](checkpoint/assembly-checks.json) and
  [engineering findings](ASSEMBLY-CHECKPOINT.md).
-111 individual custom STEP files under the checkpoint's custom directory, each
  reimported and checked for validity, solid count and volume agreement.

The top-level `assembled.step`, `custompart.step`, `parts.json`, BOMs and drawings
are retained **historical exports**, not the current integrated source revision.
Do not use the old inspection drawings as a manufacturing package for this checkpoint.
Current exports are isolated under `checkpoint/` and bound to exact source hashes.
Vendor-containing derivatives remain git-ignored; original vendor files are retained.

## Design And COTS

Direction: option1's separate pickup combined with option9's independently powered
orientation stage. Option14 was not silently substituted or declared invalid:
1778 native assembly reads failed, and its accessible GLTF exceeded the retained
150 MiB download ceiling. Its detailed geometry was not inspected.

Actual verified manufacturer sources used: Kraken X44 WCP-0941, WCP-0783 bearing,
WCP-1010 12T SplineXS pinion, WCP-0121 60T hex gear, AndyMark am-3945_green3-inch
wheel and am-5123_green5-inch star. Source SHA256, attachment frames, individual
solids and dimensional discrepancies are in [COTS bindings](cots/sourcebindings.json).
All six original sources were imported without alteration and reused. Local STEP
re-export fidelity for vendor geometry is unverified; originals remain authoritative.

The low kicker still uses a custom elastomer sleeve requiring a specified attachment
and compound. Nominal fastener B-reps and sensor envelopes are not authentic vendor
models. These distinctions remain in the BOM/manifest instead of being hidden.

Construction uses flat router-cut plates, straight tube, turned shafts/spacers,
and bolted interfaces. No precision metal bends are required by the modeled parts.
Stock grades/fit tolerances, machine envelope and real sensor interfaces still need
confirmation. Meeting a process family is not manufacturing release.

## Results And Failures

The final integrated checkpoint has551 instances,140 active definitions and111
active custom definitions. Four motors,10 gears,36 bearings,123 fastener-role
occurrences and165 spacer-role occurrences are modeled. This **does not satisfy
the requested simplicity**. Many repeated spacers are ordinary cut tube, but the
unique custom count and mounting complexity remain too high.

Passing bounded checks: six source hashes;111 active custom solid definitions;
all five static gear meshes; all eight original targeted static collision repairs;
111 custom STEP reimports; source-matched exports. Earlier targeted integration
also passed28 bearing and40 wheel-hub fits and three full-length coral witnesses.
Those earlier checks do not substitute for final integrated motion/contact checks.

Failing/open:35 exact failing observations over12 pair types in the bounded
main-pose check; fold/frame/pickup mounting interference;0/2 mm left/right width
reserve; fixed frame cheeks reaching Y=-2;5 mm deployed floor with no reserve;
undersized/unqualified fold actuation and no positive holding mechanism; incomplete
indexer belt tension, sensor/wiring/guard details and kicker sleeve attachment.
Continuous acquisition, support, centering, receiver custody and safe jam recovery
are not established. Physical reliability is unmeasured.

Three bounded assembly repair passes have been exhausted. Further incremental
reliefs are not an accepted route to a build. The next mechanical revision needs
a simpler fold-drive/mounting stack and a lower unique-part count, with geometric
contact and load checks before another detailed export. The remaining work is
substantive engineering, not merely a cloud upload or final drawing pass.

## Reproduce

```powershell
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v1/test_assembly.py --checkpoint
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B designs/coral-intake-v1/export_checkpoint.py
node designs/coral-intake-v1/build-checkpoint-viewer.mjs
node --test designs/coral-intake-v1/checkpoint-motion.test.mjs designs/coral-intake-v1/checkpoint-artifacts.test.mjs
```

The assembly acceptance command intentionally exits1 while its real geometry gates
fail. Artifact tests only verify reproducibility and labels. They must not be
reported as subsystem acceptance. Original failed trial evidence remains preserved.

No native Onshape modeling was performed: current annual allowance is unverified
and the existing500-call reserve gate remains. Two1778 retry requests raised the
cumulative direct ledger from41 to43 of140. The separate COTS pass used9 bounded
anonymous public requests, not authenticated Onshape calls.