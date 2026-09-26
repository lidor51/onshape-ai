# Consolidated Assembly Checkpoint

**D0 engineering checkpoint only. NOT RELEASED. Not a workable physical assembly or complete digital prototype yet.**

This is the existing pickup / independent powered V-bank / removable tray architecture, assembled through one callable source entry point. It does not replace the architecture or change the historical CAD exports. The measured failures below remain blockers, not accepted contacts.

## Parent Contract

Use `assemble.build_assembly(settings=None)`. It returns the same `model.Package` type used by the original builder. The pipeline is `Package -> build_pickup -> build_indexer -> build_dock -> add_transmission -> add_drive_completion -> localized custom interface repairs -> clock_outputs(3)`.

Inputs are deep-copied. The checkpoint imposes stow **-123 degrees** and updates the copied fold bounds only. The source parameter file remains unchanged. The bounded layout requires pivot Y110/Z265, rail X290, 360 mm rollers and 6 mm plate. This is an engineering variant, not a silently widened acceptance limit.

The only shared-source edit is the localized `fold_input` case in [model.py](model.py): the fold pinion rotates -5 times the output fold angle about its own axis. The output, shafts and flanges still follow the helper's existing pose assignment. The original X44 contains a fused rotor; its internal rotation, spline coupling and native joints are **not verified**. No vendor solids are cut or replaced.

After checking, the parent may use this package for a conspicuously failed **checkpoint-directory** export. Export active definitions and all instances from this package, with its settings and `assembly_checkpoint`, `transmission`, `drive_completion`, gear, hole, joint and missing-part metadata. Recheck recorded source hashes at export time. Do not call the old `model.export_package`: it writes the original output paths. This task performs **no exports**, and no STEP roundtrip or export-fidelity pass is claimed.

## Actual Inventory

| Quantity | Full integrated package |
| --- | ---: |
| Instances / unique active IDs | 551 / 551 |
| Active definitions | 140 |
| Active custom definitions | 111 |
| Custom instances | 274 |
| All definitions, including unused intermediate blanks | 167 |
| All custom definitions, including unused blanks | 136 |
| Motors / gear occurrences / bearings | 4 / 10 / 36 |
| Fastener-role occurrences / spacer-role occurrences | 123 / 165 |
| Imported original products | 6 |
| Original base instances / net helper additions | 364 / 187 |

Active custom definitions are checked for valid, closed, positive-volume solids; flat parts must remain single solids. Unused intermediate definitions are listed separately and must not become fabricated BOM quantities.

Existing service boundaries are retained: pickup 330 occurrences, fold/frame interface 40, left V bank 82, right V bank 82, and tray/dock 17. These are explicit inventory ownership groups, **not proof of easy removal or improved modularity**. The helper's shaft-withdrawal and belt-release requirements remain; quick-change locators, accessible connectors, guards, repeatable alignment, service time and load paths are unresolved. The +187 net occurrences are not described as simplification.

## Applied Repairs

- Right pickup rail and rear-right bearing carrier: circular through-relief on the actual pickup-motor back axis Y36.72/Z287, radius26.4000001 mm, with 1 mm radial envelope allowance. Both remain single solids. The build rejects less than3 mm ligament between the relief and existing mounting-hole edges. Load capacity remains unqualified.
- Right rail / floating stop R0: real OD8.5 through-hole for the M8 shank. This is not a blanket fastener collision waiver.
- Fold input: entire existing motor/pinion/mount input assembly relocated -90 degrees about the unchanged output pivot; center distance45.72 and ratio5:1 retained. New motor center Y155.72/Z265. The right cheek has a matched OD20 input aperture.
- Right rail: full analytic motor-envelope arc from deployed through-123, not a single-angle drilled hole. Flat bypass material and a20 mm relief-exit notch keep one connected plate. Minimum nominal pivot-bore radial ligament is3.3199999 mm; the four relocated bolt lands retain at least3 mm material around their clearance holes. These are geometry checks, not stress qualification.
- Right pivot cassette / positive hex flange: matched four-bolt pattern at relative YZ(-50,-50),(-50,-30),(-30,-50),(-30,-30). The relieved hex retains its3-degree shaft clock. Four OD10.5 counterbores recess screws and washers3 mm; M5x15 replaces M5x18 while retaining5 mm flange engagement and3 mm counterbore floors. No fasteners are suppressed. Claimed1 mm axial mount clearance is a nominal stack dimension, not a whole-motion clearance approval.

The original eight inherited static collision pairs measure **0 mm3** after these changes. All five static source-gear meshes also measure0 mm3. Neither result is continuous-motion certification.

## Bounded Repair History

Initial implementation cleared seven inherited pairs but rejected a full fold notch because the original40 mm square bolt pattern lost support material. Repair1 relocated the fold input and bolt pattern; the rail split into two solids and was rejected. Repair2 opened the notch to the edge: the rail stayed connected, all eight known static pairs passed, and all five static meshes passed. Repair3 closed verification gaps: source snapshots, minimum bolt ligaments, affected-part checks, relocated-input adjacent pairs and comparison against the uncorrected integrated package. **No further geometry repair is authorized in this checkpoint pass.**

## Verification And Open Gates

Run offline with the existing interpreter:

```powershell
& 'trials/manufacturing-package/.venv/Scripts/python.exe' -I -B 'designs/coral-intake-v1/test_assembly.py' --checkpoint
```

Seven software regressions pass. A successful software suite does not mean physical clearance passes. The command writes [assembly-checks.json](assembly-checks.json) and exits1 whenever a required package gate is false. Before replacement, the previous owned report is copied to a content-hashed file under `history/`. Existing CAD exports, BOMs, validation reports and source STEP files are not overwritten. Six original source hashes are checked; source changes during a build cause rejection.

Final run: **7/7 software tests PASS; physical package acceptance FAIL**. Software test/build phase123.944 seconds; checkpoint checks552.906 seconds. All111 active custom definitions pass solid validity/closure, all551 IDs are unique, all six source products match hashes, and source-current and nine historical-artifact preservation checks pass. No network, API, cloud, dependencies or CAD export were used. The previous checkpoint JSON was archived before the final report replaced it.

The final main-pose subset has **202 exact checks, 35 failing observations across12 pair types**. The broad screen records96 distinct conservative moving/fixed candidate pairs; it does not certify the untested residual pairs. Original validation is retained and its21 historical samples are copied into the report as historical evidence, not relabeled as the new package's result.

The screen has21 samples: fold0/-20/-40/-60/-80/-100/-123 crossed with float-8/-4/0. It compares moving occurrences against **all fixed occurrences**, plus bumper/front-frame references. Rotated AABBs are conservative triage; near-floor and final-stow bounds use actual posed B-reps. Overlapping envelopes are recorded as uncertain. Specific shaft/bearing and gear joints are identified, but are not blanket collision exemptions. The exact subset covers known and corrected pairs and relocated-input neighbors at main poses. Full connectivity, all moving/moving pairs and continuous collision bounds are not run.

Measured nominal stow width is X[-350,348]: **left reserve0 mm, right reserve2 mm**. The rear shaft end screws limit width. Neither the1 mm minimum nor the5 mm target passes. No pulley/idler stack is shifted or trimmed to manufacture a pass. Full-package stow also finds fixed frame-cheek geometry reaching Y=-2 mm, outside the supplied frame start boundary. The moving pickup's-123 front margin is **12.310879 mm**, limited by the left kicker cassette; that improvement does not excuse the fixed-part failure. The complete stow bounds are X[-350,348], Y[-2,544], Z[9.387500,788.380277] mm.

The deployed minimum is Z5 mm, with **zero floor reserve**, at both kicker cassettes and both kicker-idler brackets. Loaded/tolerance clearance remains unqualified. The largest conservative sampled extension is442.791372 mm, leaving14.408628 mm to the unchanged457.2 cap; this is not a rules certification.

Exact main-pose checks find the pickup-drive mount, motor, pinion, motor screws and rear cassette hardware interfering with the fixed right frame cheek. Those fixed dock parts were not included in the original validator's indexer-only moving/fixed loop. Baseline comparisons and any new/worsened cases belong to the generated report, never an intentional-contact waiver.

| Remaining measured pair | Worst overlap, mm3 | Interpretation |
| --- | ---: | --- |
| Fold drive mount / right frame cheek | 33233.949514 | Inherited/reduced, still invalid static mounting stack |
| Pickup drive mount / right frame cheek | 6324.891107 | Inherited, still invalid |
| Pickup drive mount / fold drive mount | 2930.708364 | Some poses worsen by776.864215; not accepted |
| Pickup drive motor screw0 / fold drive mount | 122.597891 | New collision in relocated layout |
| Pickup drive mount / fold drive motor screw1 | 87.631576 | New collision in relocated layout |
| Rotating fold pinion / fused X44 source rotor | 73.023487 | New modeled interference when pinion follows ratio but the vendor rotor is fused; internal rotational contact unverified |

The fold relocation solves the rail sweep locally but **is not an accepted assembly-wide clearance solution**. All new/worsened observations remain FAIL. The report includes per-pose baseline volumes and numerical deltas. Reaching the repair cap does not convert these failures into approval. The next authorized local packaging task must resolve the fold/frame/pickup mounting stack before any complete-build claim; this checkpoint does not silently reopen that task or authorize a fourth repair.

All D1-D8 requirements in [RELEASE-GATES.md](RELEASE-GATES.md) remain controlling. Continuous full-pipe contact, holding/latch and fold torque, sleeve attachment, tension qualification, indexer tensioners, retention, stress/deflection, drawings, actual hardware selection, wiring, guarding, manufacturing approval and physical field reliability are **not passed**. This checkpoint must not be presented as ready for manufacture or robot use.