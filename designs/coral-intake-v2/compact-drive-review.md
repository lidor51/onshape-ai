# Compact Drive Decision

**Current applicability:** This review predates the actual [coaxial rear-axis
candidate](COAXIAL.md). Its shared-drive principle remains a candidate, but do
not install these stages from this table without new layout/load checks. Current
front/middle and middle/rear centers are 180/155 mm, so the equal-18T upper loops
are 450/400 mm (WCP-0623/WCP-0621), not 400/350 mm. Kicker center is now Y=-122/Z34.
The independent deployment flange must rotate the cheek without locking it to
the powered rear shaft. All eleven qualification gates remain OPEN.

2026-09-18. **Prototype topology selected; NOT field-ready and NOT complete CAD.**
Keep the low single pivot, provisionally Y110/Z170 with -110-degree stow. No
500mm linkage, fifth motor or precision-bent bracket is proposed. Exact tooth
ratios and catalog interfaces below are usable layout decisions, not load ratings.
The [qualification contract](compact-qualification.json) contains the source hashes,
explicit missing inputs and measurable OPEN release gates.

## Build These Paths

| Output | Explicit drive selection | What the parent must build |
| --- | --- | --- |
| Three upper pickup rollers | X44 WCP-0941 -> 12T SplineXS WCP-1010 -> 60T hex WCP-0121 on shaft A -> 18T WCP-0563 / 36T WCP-0990, 350mm WCP-0619 belt -> rear roller. **10:1**. Rear-middle: 18:18, 350mm WCP-0619; middle-front: 18:18, 400mm WCP-0621. | Paired reducer plates, two bearings on A, independent axial pulley lanes, actual tension/removal access and full guards. Front float stays concentric with middle shaft, preserving 155mm center distance; rear loop is 130mm. |
| Lower kicker | Share A's actual 60T gear -> one additional WCP-0121 60T reversing gear on shaft B -> 18T WCP-0563 / 15T WCP-1420, **650mm WCP-0632** belt -> kicker. **25/6:1**, opposite the uppers. | Two bearings on B, 76.2mm A-B centers, machined positive hub/core attachment and tread retention. This avoids a fifth motor, an extra pickoff gear and a crossed belt. |
| Left/right indexer, independently | Each X44 -> WCP-1010 / WCP-0121 **5:1** -> first vertical shaft. Each bank then uses two 18:18 HTD loops: 350mm WCP-0619 to station 1; 320mm WCP-1757 to station 2. | Two independently adjustable, bearing-supported take-ups per bank; separate pulley lanes on middle shaft. Preserve both motors, all six shafts and all eighteen 3-inch wheels. Recalculate shaft stacks, not wheel positions. |
| Single deployment pivot | Chassis X44 -> WCP-1010 / WCP-0121 **5:1** -> WCP-0576 12T / WCP-2106 36T **3:1** -> another 12T/36T **3:1** -> supported pivot. **45:1** prototype. | Two supported chassis jackshafts, two guarded #25H loops, positive pivot-to-cassette flange, chassis stops and stow/service retention. Chain SKU/load rating and rounded-hex fit are still blocking selections. |

All listed HTD pulleys/belts are **5mm pitch, 9mm wide**. Ordinary open belts
preserve angular sign; external spur meshes reverse it. At the prior assumed
3m/s upper surface speed, upper speed is 451.15rpm, motor 4511.48rpm and kicker
1082.75rpm. A 51mm kicker then has **96.38%** of the 127mm upper surface speed.
That is nominal speed matching, not contact/traction proof. Sum both branch loads
at the shared first stage; the old assumed 40N is not a measured force allowance.

The 18:36/350mm reduction has ideal pitch-circle center **106.5356mm**; the
18:15/650mm kicker loop has about **283.740mm**. These specify a layout target,
not permission to stretch a belt onto the old isolated motor placement. Both
gears A/B must stay on one carrier; orient/adjust that carrier and provide take-up
as needed without changing gear centers. Actual pulley flange widths, wrap,
pretension, floor/bumper clearance and folded routing remain unverified.

Indexer shaft centers are **124.7808mm** and **107.4759mm**. The chosen belts
leave **10.4384mm** and **15.0483mm** of excess pitch path before take-up. Do not
call these fixed-center fits. A single triangular belt saves pulleys but risks
very poor wrap at the nearly inline middle station; it is not selected. A toothed
idler can reuse an 18T pulley on a captured hex stub with separated bearings;
its carrier, travel and wrap still need design. Do not substitute an idler envelope.

For the two 12:36 deployment loops, **56 pitches including the closing link**
give approximately **98.617mm** centers by the usual chain-length approximation.
Select real chain and verify discrete tooth seating, adjustment, lubrication and
reverse-load rating. WCP-0576 is **rounded hex**, not generic sharp-corner hex.
Use a verified matching stock profile or a drawing-controlled lathe corner-relief
operation; do not force the existing ideal CAD hex through it. WCP-2106 is hex.
The tempting WCP-0970 60T plate sprocket is **SplineXL**, so it is deliberately
not called a drop-in hex output here.

## Support And Retain

- X44: preserve 19.05mm pilot, 34.925mm bolt circle and **#10-32 UNF**, not M5.
  Saved drawing depths are 6.35mm mounting and 9.525mm shaft-end. Select screw
  lengths from the actual stack; no bottoming or spline-tip preload guess.
- WCP-1010 is motor SplineXS only. First-stage gear centers are 45.72mm;
  60:60 reversal centers are 76.2mm. Check mating gear specification, phase,
  backlash, support stiffness and actual tooth overlap. A fused motor STEP rotor
  is a reference-model limitation, not proof that the physical mesh jams or clears.
- Every new jackshaft gets two separated WCP-0783 supports; place gear/pulley
  loads between them where possible. A lone bearing and a named parent part do
  not complete a support. Three aligned bearings on a retained first indexer shaft
  need one controlled datum, not three unrelated tight seats.
- Hex transfers torque; end screws/washers and faced spacers retain the rotating
  stack. Specify end float and contact only the appropriate inner race/hub faces.
  Retain outer races with shoulders/keepers. Supplier fits must determine the
  seats: the source bearing's 28.5496mm CAD OD is not a press-fit prescription.
- Keep aluminum bearing/reducer datums; use replaceable PC contact faces independent
  of shaft location. The existing kicker hub's sub-1mm wall and unqualified sleeve
  attachment remain hard blockers. Router-cut hex reliefs are manufacturable in
  principle, not evidence of adequate wall or torque capacity.
- Final pivot needs two separated chassis supports, a sized shaft/flange bolt group
  tying both pickup sides, positive endpoint stops and operational stow retention.
  A manual service pin alone does not solve automated stow or mid-stroke power loss.
  Pure side hits do not relieve through the deployment axis; low frontal hits may
  drive into the deployed stop. Gear teeth and current limiting are not crash stops.

## What Is Not Proven

The retained builder completes **only the authentic first gear stages** for pickup
and deployment. It retains indexer **round cord** loops with unqualified tension;
capture stacks do not fix their transmission rating. Receiver stop joints and
sensor envelopes remain unfinished. No downstream path above exists merely
because the current model contains four motors.

**45:1 is a compact prototype choice, not the final rated reduction.** Applied to
the OLD 43.497Nm, 140-degree/1.2s screen at assumed 70% efficiency, it requires
1.381Nm motor torque, 1750rpm peak and a crude **93.70A endpoint proxy**. The final
36T sprocket sees about **1.19kN chain tension difference** before pretension or
shock. A catalog's tensile breaking load is not allowable working tension.
Do not release #25H at this load without its actual rating. Recalculate with the
complete low-axis mass/COM/inertia, trapped-coral case and battery/current budget.
Longer fold time reduces acceleration, not gravity or static chain tension;
counterbalance or a stronger transmission may be required. No current limit is set.

This is already the lower-part-count option compared with another powered kicker
or a long linkage: four motors, one shared reversing pickoff, fixed-center front
float and reusable gear/belt sizes. A three-motor alternative gangs the indexer
banks but removes independent orientation/jam control; do not adopt it until a
passive-centering fixture passes the same yaw/offset/wall matrix. No unsupported
MAXPlanetary/ThriftyBot-to-X44 interface or custom-cut gear is assumed.

## Sources And Release

Use the unchanged [source bindings](../coral-intake-v1/cots/sourcebindings.json)
and [loader](../coral-intake-v1/cots/load_vendor.py) for the six existing vendor
models, retaining their original hashes and units. New catalog observations:
[pulleys](https://wcproducts.com/products/htd-timing-pulleys),
[belts](https://wcproducts.com/products/htd-timing-belts-9mm-width),
[sprockets](https://wcproducts.com/products/25-sprockets), read 2026-09-18.
Selected listings said In Stock, but exact drawings, loads, purchased inventory
and **2025-season availability are not established**. Two attempted gear pages
failed extraction; no facts were inferred from them. No new CAD download or
authenticated service was used; public facts are preserved in the contract.

Shop scope: router CNC, manual lathe/mill, flat aluminum/PC and saw-cut tube;
**NO accurate metal bending**. Stock, machine envelope and tolerance capability
remain unknown. Release requires actual sourced sensors/receiver grip, full swept
hardware/guards/cables, supported stops/retention, load-rated drives and all eleven
contract gates with raw evidence. Linear static plate screens and passing Node
tests cannot qualify dynamic impact, capture reliability or physical readiness.