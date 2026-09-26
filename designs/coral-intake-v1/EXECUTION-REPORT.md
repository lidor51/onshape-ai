# Executed Results And Blockers

Historical first-build report. The syntax issue below was subsequently repaired,
real COTS integrated, and a separate current checkpoint exported. See
[CURRENT.md](CURRENT.md) for the latest source/export/acceptance boundary. This
report and its failed original artifacts are retained rather than overwritten.

**INCOMPLETE / BLOCKED. Real CAD outputs exist, but this is not a completed engineering package or manufacturing release.** The current generator cannot parse after its third local repair. No fourth repair was attempted. Latest attempted source changes do not match the retained STEP/BOM/drawing revision.

## Actual Retained Outputs

The last executable generator produced 282 assembly instances, 54 definitions and 378 occurrence solids. It produced 44 individual custom STEP files, combined custom B-reps, one local assembly STEP, 54 viewer meshes, two BOM formats, 15 flat DXFs and a 15-sheet dimensioned inspection PDF. All sheets say NOT RELEASED. Artifact SHA256 values and the exported versus attempted parameter differences are in [execution-status.json](execution-status.json).

Only X44 WCP-0941 and bearing WCP-0783 are authentic vendor B-reps. Each original was imported once and reused; final original-byte SHA256 checks passed. The larger wheels/sleeves, hubs, plates, tubes and shafts are explicitly custom B-reps; nominal screw/washer shapes are not authentic fastener vendor CAD. Sensor boxes are reference envelopes. STL meshes are derived display geometry. No reference robot mesh was used as a custom B-rep. No cloud, API, network, credential, commit, branch, reset or deletion action was performed.

## Commands Actually Run

All Python commands used the explicitly supplied executable:

```powershell
$cad = 'C:/Users/lidor/FRC/onshape-ai/trials/manufacturing-package/.venv/Scripts/python.exe'
```

The suffix below is appended after `& $cad -I -B designs/coral-intake-v1/`.

| Command / check | Observed result |
| --- | --- |
| `geometry.py` | Exit 0; 100 roller-only samples PASS, original 420-wide rollers / Z210 pivot. Preserved historical hypothesis only. |
| `model.py --check` first attempt | Exit 1; interrupted in repeated hub boolean construction. |
| `model.py --check` after repair 1 | Exit 0; 54 valid positive-volume definitions / 282 instances. |
| `validate.py --quick` | Exit 1; actual solids/holes/bearing fits pass, rear hard-core coral collision fails. Repeat confirmed it; archived prior report. |
| `drawings.py --self-test` | Exit 0; actual outer profile and circular hole extracted from planar B-rep. |
| `test_package.py` | Exit 0; 10 tests passed, 18.116 seconds. This is the last executable source revision, not the current source. |
| `model.py` | Exit 0; retained STEP/custom STEP/meshes/BOM/parts manifest generated. |
| `drawings.py` | Exit 0; 15 NOT RELEASED sheets and DXFs, conditional on passed local flat/actual-hole gate. |
| `definition_checks(build(), True)` through a Python `-c` check | Exit 0; 44 custom STEP reimports valid, solid counts/volumes match, no hole-check failures. Results in `export-validation.json`. |
| `validate.py --step 20` | Exit 1; 628.422 seconds; 21 complete fold/float poses, all failing, 264 recorded violations. |
| `validate.py --quick` after repair 2 | Exit 1; `IndentationError` at stop-mount block before geometry execution. |
| `validate.py --quick` after repair 3 | Exit 1; `IndentationError` at fold-drive line265 before geometry execution. **STOP: repair limit reached.** |
| Final Node artifact/source check | 103 referenced deliverable paths exist; X44/bearing original SHA256 unchanged. |

Runtime prerequisites were observed as CadQuery2.6.1/OCP7.8.1.1, with ReportLab and ezdxf present. No packages were installed or editor interpreter changed. The editor diagnostics tool returned no errors even after the Python failure; the actual runtime parse error is authoritative.

## Geometry Findings On Exported Revision

Passed: valid closed positive-volume B-reps and drilled-hole voids; exact shaft/bearing alignment without hard interference; all four proposed 12/60 gear center distances45.72; receiver keepout at deployed/stowed endpoints. These are four of fifteen required gates, not overall acceptance.

Failed: sideplate lower extent4 mm versus required5; pickup rails/cassettes/rear roller/drive hardware collide with fixed V-bank parts through folding; crest witness rear hard core intersects full-length coral by14013.2873 mm3; seated sensor bracket forms an isolated component. Connectivity found one279-member component plus that one bracket (two sensor reference envelopes excluded). Contact adjacency cannot establish load-bearing joints; interpenetration can falsely connect an invalid assembly and is expressly not accepted as fastening proof.

Maximum sampled frame-referenced extension was390.2401 mm versus457.2. This does not erase the collisions. Final coral occupied Y234.1875..535.8125 and Z133.85..248.15, with no hard interference at the seated witness. Final tyre intersections are classified as unqualified unloaded compliant overlap, not accepted compression. Continuous acquisition, orientation, support and handoff were not proven. The requested5-degree full-mechanism sweep was not reached; only the initial roller-only probe used5 degrees.

## Unexecuted Correction

The attempted correction changes fold pivot Z210->265, moves side supports X238->290, trims plate bottoms above6, replaces only the custom rear hard tube OD40 with standard20x2 while keeping OD127 contact envelope and all roller centers, adds a third #10-32 motor screw and moves the seated-sensor bracket against the tray. Python parsing failed, so none of this has geometry evidence or an updated export. It must not be presented as a working fix. The original failed exports and reports remain intact.

## Remaining Critical Inputs

Exact WCP-1010/WCP-0121 original STEP assets are absent offline; their catalog identities do not authorize substituted teeth. Kicker reversal, tensioners/float take-up, fold torque connection and holding strategy, full spacer/shaft retention, mounting hardware and frame reactions remain unresolved. Custom elastomer hardness/attachment, stock grade, hex feature process, bearing fit, machine capacity, actual LaserCAN interfaces, receiver withdrawal and sensor observability require decisions/testing. The independent [COTS-REVIEW.md](COTS-REVIEW.md) and [RELEASE-GATES.md](RELEASE-GATES.md) were read but not modified.

The next required authorization is to continue beyond the three-repair generator limit, followed by successful parsing and the same focused geometry checks before any new export. Missing authentic parts and physical/manufacturing decisions remain separate blockers; fixing syntax cannot convert the current package into a release.