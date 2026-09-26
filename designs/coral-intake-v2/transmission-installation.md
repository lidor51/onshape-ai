# Powered Transmission Installation

This is an executable CAD installer, **not a competition release**. It mutates
only the assembly returned by the existing coaxial builder. Protected builders,
frozen v1 files, old exports and old source bindings were not edited.

## Integration

Call `powered_transmissions.install(assembly)` immediately after
`coaxial_pickup.build()`. Alternatively, `powered_transmissions.build()` performs
both calls through local file imports. The original builder remains untouched.
The installer rejects a second installation on the same object.

Run the new test module with the existing manufacturing-package interpreter and
`-I -B -W ignore`. It writes the detailed installation JSON in this directory.
The executable installer writes the same inventory; optional `--export` writes
only into `powertrain-output/installed-not-released.step`. No new full STEP export
was required for the integration handoff.

For a fresh cache, run `transmission_sources.py --fetch --inspect --drawing
--references` in a separate process **before** importing the offline builder.
Original files live in the ignored `.cache/coral-powertrain` directory. Downloads
are public, unauthenticated, individually bounded at 20 MiB and cumulatively
bounded at 60 MiB. No Onshape calls, browser cookies, environment secrets or old
source-file rewrites are used. Receipts retain the original-byte SHA-256 values.

## Installed Geometry

| Path | CAD implementation | Limit of completion |
| --- | --- | --- |
| Upper pickup | Real X44/12:60, paired supported shaft, actual 18:36 pulleys, nominal 350 mm belt; actual equal-18 pulleys with 400/450 mm rear-middle/front loops. 10:1 magnitude. | Geometry reaches all three roller shafts; belt/tooth load and tension are not qualified. |
| Kicker | Rear 60T meshes with a real 60T on a two-bearing moving carrier at 76.2 mm centers; actual 36:15 pulleys and 700 mm WCP-0634 nominal belt. 25/6:1 magnitude, opposite upper rollers. | Complete to the kicker hex shaft. Existing thin hub, core and elastomer torque attachment remain blocked. |
| Indexer banks | Both real X44/12:60 stages retained. Four separate 350/320 mm HTD loops replace the two cord loops. Four idlers have real pulleys, paired bearings, captured shafts and 6 mm clamp-slot travel. | Geometry reaches all six shafts without moving the 18 wheels. Raised-deck attachment to chassis remains the parent structure task. |
| Deployment | X44/12:60, 14:36 and 16:60 chains, two supported jackshafts, paired 1.5 mm eccentric cartridges. 48.2143:1 magnitude. | Geometry reaches the moving cheek through a free-bore adapter, not through the powered rear hex shaft. Actual chain tooth seating and load qualification remain open. |

New shafts have positive hex engagement, modeled end screws/washers, faced
spacers, and nominal 0.2 mm axial float. Bearing retainers, gearbox columns,
plate holes and attachment bolts are physical solids. Source pulley assemblies
are 14.2875 mm wide, not 9 mm; shaft extensions and lanes account for that width.
Six #10-32 adapter bolts use the documented 2-inch MotionX pattern, matched to
the original WCP-0970 passages. Four M5 cheek screws engage the adapter without
piercing the vendor sprocket. All fits and thread representations remain nominal.

Belts are smooth closed backing solids with pitch, tooth-count and wrap metadata,
**not vendor belt CAD**. Chains are closed discrete 6.35 mm chord-pitch routes
with nominal rollers/link plates, **not vendor chain CAD**. The chains contain
56 and 90 pitches including the closing connection. Master-link pins, complete
supplier envelope and engagement phase are not qualified by these route models.

The source motor STEP has a fused rotor reference. Three newly installed spur
meshes are clocked using source tooth material and tested for exact B-rep overlap.
That does not simulate rotation of the fused motor rotor. Rear/reverse coupling
is relative to the moving carrier: intake must be disabled or appropriately
commanded during folding; the gear mesh does not lock the frame.

## Evidence And Remaining Gates

The JSON records all removed/replaced IDs, new instances, stacks, mounting holes,
source receipts, source datums, ratios, actual counts and test results. Some
removed IDs are temporary installer parts, separately counted from originals.
The installed candidate has 849 total instances, including four real motors,
27 retained stars, 18 retained indexer wheels, eight belts and two chain routes.
There are 445 new surviving instances. This is a substantial hardware increase,
not a demonstrated low-part-count solution.

Tests cover valid solids, real pulley hex-bore clearance, nonoverlapping axial
intervals, open bearing seats, three exact spur meshes, eleven selected local
solid-pair clearances, documented sprocket screw passages, four drive-center
pairs in fifteen fold/float combinations, and original source hashes. A detected
51.43 mm3 gear/column collision was repaired and the same check rerun. These are
bounded interface checks, not a full collision certificate.

The manufacturer lists WCP-0767 #25H and WCP-0768 master links; its guide gives
209 lbf maximum working load. The old assumed 43.497 N m torque yields about
717 N final-chain tension difference and 1.2888 N m motor torque at assumed 70%
efficiency. Only about 213 N remains below that working load before pretension
or additional dynamic load. New assembly mass/inertia, duty, shock, holding and
current limits have not been validated; do not select a current limit from this.

Blocking handoff items are the inherited kicker hub/core/tread torque joint,
actual chain tooth seating and master-link envelope, validated tension settings,
gear running backlash, dynamic loads, full-system continuous clearance, guards,
deployment stops/holding, and parent chassis/raised-deck structure qualification.
Neither modeled bolts nor passing CAD tests establish frame strength or
competition readiness.