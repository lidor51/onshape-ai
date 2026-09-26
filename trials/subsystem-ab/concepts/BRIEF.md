# Fourteen Concept Previews

Stage 2, authorized 2026-09-13: fourteen low-effort, comparable napkin-CAD concepts for
user selection. No detailed CAD, exact COTS imports, gears/fasteners, full solid
sweeps, Onshape calls, or physical-success claims. Earlier v1-v5 failures remain
unchanged. Do not carry their high receiver or roller-ladder geometry as constraints.

All concepts: 2025 coral, metric-first, router-cut aluminum/polycarbonate, lathe,
manual mill and printing, no accurate bends. Keep required bumper protection,
except user-requested 12: actual front gap, explicitly non-compliant for 2025.
An internal chassis/bellypan recess is allowed as a concept, not a bumper gap.
Nominal coral length 301.625 mm and OD 114.3 mm. Common rectangular blank chassis:
x=-350..350 across, y=0..760 rearward, z upwards; ground z=0. Front bumper reference
y=-85..0 and z=45..165; full plan bumper ring x=-435..435, y=-85..845.
Front extension guide y=-457.2 is from ROBOT PERIMETER, not bumper face. Reference
dimensions are provisional, not a rules inspection or a provided actual chassis.

One per-concept JSON object with exact fields:
- id: two digits 01..14; title: short; family: mechanism principle.
- summary, advantage, risk, firstTest: concise plain English, each <=180 characters.
- complexity: low/moderate/high, qualitative hypothesis, not measured mass/cost.
- inspiration: reference/concept origin; no claim to reproduce a team's geometry.
- side: guides (array of {points:[[y,z],...], label}), rollers (array of
  {center:[y,z], radius, label}), links (array of {points, label}),
  pivot (null or [y,z]), ghost (array of [[y,z],...] deployment/stow proposals),
  path (coral-center sequence [[y,z],...]), receiver:{center:[y,z],label},
  labels (array of {at:[y,z],text}).
- plan: guides ({points:[[x,y],...],label}), rollers ({center:[x,y],radius,label}),
  movingOutline:[[x,y],...], path:[[x,y],...], receiver:{center:[x,y],label},
  coralYawDeg: final horizontal axis measured from +y (0 along robot,90 crosswise),
  labels ({at:[x,y],text}).
- mouthWidthMm: 350..600 approximate usable-width intent.
- states: short description of pickup/hold/offer, and unknowns.
- Optional notice: <=120 characters, displayed next to Stage 2 warning.
- Optional bumperOpening: {widthMm, recessDepthMm}; removes front bumper and
  central chassis section. Must have a notice saying "2025 NON-COMPLIANT".
- For 11..14, short side/plan labels are rendered. Guides labeled "CORAL reference:"
  show nominal piece outlines rather than structural material.
- Optional guide/roller rotation: "locked" or "driven". Locked contacts are gray;
  a locked roller has a cross and label. Lock is relative to its carrier, not world.

Plan rollers are vertical-axis wheels; show transverse pickup rolls as outline
or guide bands. Side rollers are transverse-axis contacts; plan/side may simplify
different parts, but same handoff y and physical axis relationship must agree.
Receiver is a rough block/jaw envelope, not complete scoring mechanism. Each
concept handles one coral total, with whole-robot occupancy preventing a second.

Keep paths in side domain y=-480..760,z=0..650 and plan y=-480..760. Front-entry
paths use x=-350..350; side-entry 07 extends to x=-595 outside the intact bumper.
Its side extension is measured from chassis side x=-350, not the global origin.
Except the explicitly non-compliant cutout 12, no path crosses through the bumper:
when horizontal coral crosses its front band,
its center should be above reference top+57.15 mm, plus an explicit sketch margin.
This is only a 2D envelope screen; real 3D pieces can pitch/yaw, and contact,
stow, loads, flex and legality remain unverified. Prefer low handoff positions but
do not force equal heights for different principles. Preserve reference context.

Independent concept families:
01 compact roller/kicker + fixed V orienter;
02 short opposed belts + fixed cradle;
03 floating four-bar nose + fixed indexer;
04 pivoting roller scoop presents piece directly;
05 translating drawer with pickup rolls;
06 powered roller cradle that tips into handoff;
07 low side-entry intake feeding sideways;
08 compact pick-and-place jaws on short arm;
09 differential wheel deck that yaws coral;
10 segmented star-wheel tunnel + compliant ceiling.
11 1690/2056 architecture hybrid, not measured team CAD;
12 direct through-bumper feed, known 2025 rule conflict;
13 internal expanding mandrel, vertical lift and outside receiver capture.
14 1778 capture/raise/center and powered handoff with a carrier-locked lower axle.

Use a common renderer and scales. These are fourteen concepts, not fourteen independent
reliability trials. User selects one or two before geometry refinement; no automatic
favorite is called a working design. Stage workflow: 0 capabilities/rules/task,
1 research, 2 concept choice, 3 geometry/prototypes, 4 detailed design.