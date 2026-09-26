# Ten Whole-Robot Concepts

User request, 2026-09-13: ten full-robot crayola CAD concepts for **2025 REEFSCAPE**,
handling both coral and algae, driven by game analysis. This expands the prior
intake-only scope. Preserve all fourteen intake concepts and earlier failures.
Stay in Stage 2: dimensioned blocks, links, functional routes and proposed poses,
not detailed solids, vendor imports, manufacturing approval or Onshape deployment.

Use the existing team profile: aluminum/polycarbonate, router CNC, manual machining,
printing, metric-first with exact imperial COTS interfaces, no accurate metal bends.
Prefer Kraken X60/X44 and WCP parts when appropriate, but do not invent detailed
motor sizing, mass, COTS compatibility or performance. No credentials, network CAD,
kernel runs, or authenticated API calls. Research public/cached sources separately.

## Coordinates And Contract

One JSON object per robot, R01 through R10. All lengths in approximate mm.
Common chassis x=-350..350, y=0..760, z=0 at floor, +y rearward, +z up.
Intact provisional bumper ring x=-435..435,y=-85..845,z=45..165. Fixed starting
structure must stay within chassis plan and height 1066.8. All proposed mechanism
states must respect 457.2 extension measured from perimeter, not bumper face.
For sketch margin, keep robot hardware within x=+/-770 and y=-420..1180.
Coral L301.625, OD114.3; algae and field targets come from the game analysis.

Mandatory fields:
- id, title, family: short unique identities; title <=44 characters.
- strategy, tradeoff, firstTest: each <=240 characters, plain English.
- capabilities: coralLevels (unique integers1..4), coralSources (station/floor),
  algaeSources (reefLow/reefHigh/floor), algaeDestinations (processor/net),
  climb (deep/shallow/park), simultaneousCarry (boolean). At least one coral level,
  one coral source, one algae source and one algae destination are required.
- subsystems: drive, coral, algae, climb, packaging, control, stow; each <=480 chars.
- cycle: auto, coral, algae, endgame; each <=360 chars. Workflow intentions, not timings.
- inspiration: array of {source, lesson}; source is a URL or repository reference;
  distinguish author-reported team behavior from original proposals.
- geometry: boxes, links, tools, routes, annotations.
  - boxes: {name, role, center:[x,y,z], size:[dx,dy,dz], state}.
    role = structure/coral/algae/climb/electrical; state=base/stowed/deployed.
    Every box is a component envelope, not a load-path or interference proof.
  - links: {name, role, points:[[x,y,z],...], radius, state}; minimum two points,
    radius is a drawn tube/link envelope, not a solved joint. All points in world frame.
  - tools: {name, role:coral|algae, center:[x,y,z], size:[dx,dy,dz], state}.
    Show proposed acquisition and scoring/offer poses with name prefixes, e.g.
    "Coral L4", "Coral station", "Algae reef high", "Algae processor", "Algae net".
    Same tool in several poses is not multiple simultaneous pieces. Do not duplicate
    full mechanisms to pretend independent functionality; document shared ownership.
  - routes: {name, role:coral|algae, points:[[x,y,z],...]}; center-path proposal,
    not a collision-checked or dynamically simulated trajectory.
  - annotations: {at:[x,y,z], text}; up to four, <=32chars, labels handled by renderer.

Use >=4 component boxes (including reserved battery/electrical space), >=3 links,
>=3 tools, >=2 routes. The renderer supplies chassis, four drive-module envelopes,
bumper ring and field height guides. Identify mechanism anchors and links from
chassis to acquisition/scoring tools; no visibly disconnected tool floating in space.
Stowed envelopes are distinguished from deployed pose proposals. All views must
project this SAME 3D dataset, not independent contradictory side/top drawings.
Do not fill the entire robot with solid blocks or detailed fasteners.

## Selection, Not Certification

Each robot handles both pieces but may intentionally omit L4, net or deep climb;
mark omissions plainly. Whole-robot G409 occupancy allows one coral and one algae;
simultaneousCarry is a mechanical design claim to test, not a universal requirement.
Scoring height lines are field references, not reachable-pose/branch-insertion proofs.
Show acquisition -> retention -> score and climb transition, including shared-tool
conflicts, reconfiguration and battery/service access. Full stow, joint geometry,
stability, loads, cables, sensing, autonomy, reliable cycles and climb proof remain open.

Use GAME-ANALYSIS.md and game.json before drafting. Compare actual architectures
and strategic sacrifices, not ten cosmetic arrangements of one machine.