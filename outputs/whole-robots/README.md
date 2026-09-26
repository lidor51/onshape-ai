# Ten Full-Robot Concepts

[Open the gallery](index.html) | [Overview PNG](overview.png) |
[3D block/link data](robots.json) | [Game analysis](../../trials/whole-robot-concepts/GAME-ANALYSIS.md)

Ten **2025 REEFSCAPE** coral + algae robots, each with drive, mechanisms, endgame,
battery/electrical space, stow, acquisition, retention and release plans. Every sheet
projects the same dimensioned 3D data into axonometric, side and top views. These
are whole-robot **crayola CAD architecture proposals**, not detailed native CAD,
solved joints, verified working geometry, manufactured robots or match simulations.
The fourteen earlier [intake-only concepts](../concepts/index.html) remain unchanged.

## Suggested Comparison

**Start with R01, R04 and R07.** They test three materially different commitments:
separate task mechanisms, a shared arm, and deliberately limited coral reach.
This is an engineering shortlist, not a measured ranking or a selection made for you.

| Option | Coral | Algae | Endgame Intent | Why Consider It / Deliberate Sacrifice |
| --- | --- | --- | --- | --- |
| [R01 Split-Task Elevator](robot-R01.png) | L1-L4, station + floor | Both reef heights + floor; processor | Deep | Balanced baseline; separate retention and task ownership, but more handoff/packaging work. No net. |
| [R02 One Carriage, Two Tools](robot-R02.png) | L1-L4, station + floor | Both reef heights + floor; processor + net placement intent | Shallow | Share lift hardware; tasks serialize and one mechanism can disable both functions. |
| [R03 Station Sprint + Algae Launcher](robot-R03.png) | L1-L4, station only | Both reef heights + floor; processor + net shot intent | Deep | Strong capability ceiling if station access and shooting justify it. Gives up floor coral. |
| [R04 Telescopic Utility Arm](robot-R04.png) | L1-L4, station + floor | Both reef heights + floor; processor | Deep | Avoid a separate coral handoff; common wrist must retain both shapes. No net or simultaneous carry. |
| [R05 Lift-and-Center Carrier](robot-R05.png) | L1-L4, station + floor | Low reef + floor; processor | Shallow | 1778-style capture/centering into an elevator; no high-reef algae, net or deep climb. |
| [R06 Turreted Reach](robot-R06.png) | L1-L4, station + floor | Both reef heights + floor; processor + net placement intent | Park | Fewer chassis reorientations are plausible; yaw/backlash/cabling add risk. No cage climb. |
| [R07 Low-Mast Partner](robot-R07.png) | L1-L3, station + floor | Both reef heights + floor; processor | Deep | Alliance-complementary lower-reach design. Gives up L4 and net; lower mass/CG is not yet measured. |
| [R08 Wide-Mouth Cycle Partner](robot-R08.png) | L1-L2, station + floor | Low reef + floor; processor | Shallow | Smaller reach commitment and broad capture. Partners must cover L3/L4 and high-reef clearing. |
| [R09 Algae-First Hybrid](robot-R09.png) | L1-L3, station + floor | Both reef heights + floor; processor + net shot intent | Deep | Prioritize reef clearing and algae cycles; sacrifices L4 and simultaneous carry. |
| [R10 Twin Independent Lifts](robot-R10.png) | L1-L4, station + floor | Both reef heights + floor; processor + net placement intent | Shallow | Retain one algae during coral work; duplicate lifts increase width, top mass and integration risk. |

R01 is the first balanced reference I would test with this shop: router-cut plates,
simple tubes and separately testable coral/algae paths. The initial proof is the
floor intake-to-wrist transition plus occupied stow and battery access, not an L4 render.
R04 is the useful counterexample: no coral transfer station, but wrist versatility,
floor reach and telescope stiffness become critical. R07 tests whether giving up
L4 produces enough measured throughput and integration benefit to justify it.

R03 is the next comparison when net shooting is an explicit goal. Treat R06/R10
as higher-complexity research candidates until their unique benefit is measured;
more axes or nominal capabilities alone do not make a better robot.

## Game Decisions

- TELEOP coral is **2 / 3 / 4 / 5 points** at L1/L2/L3/L4; AUTO is **3 / 4 / 6 / 7**.
  LEAVE adds 3 in AUTO. AUTO and TELEOP values are not added for the same coral.
- At equal reliability, an L4 cycle must take **less than 1.25 times an L3 cycle**
  to win on immediate points/second. Travel, available branches and RP needs still matter.
- Processor algae gives **6 to us**, then the ball goes to the **opposing human player**.
  A successful subsequent opponent net shot gives them 4; it is not 10 points for us.
  Our robot's own-net delivery gives 4. Compare time, accuracy, clearing value and
  Coopertition, not just 6 versus 4. No shooting performance is assumed here.
- Clearing algae can unlock affected coral branches for the alliance, but removal
  earns no points by itself. Staged reef algae does not automatically block L4.
- Deep/shallow/park are **12 / 6 / 2 points**, mutually exclusive. Choose climb
  effort using measured reliability and cycles forgone, not a blanket deep-climb mandate.
- Ordinary-event and District Championship bonuses use **5 coral per required level
  and 14 barge points**; FIRST Championship uses **7 and 16**. Coopertition reduces
  required coral levels from four to three. These are alliance requirements.
- The whole robot may control **one coral and one algae**, not two of either.
  A shared tool can intentionally serialize both jobs even though the rules permit one each.

The [source-grounded analysis](../../trials/whole-robot-concepts/GAME-ANALYSIS.md)
includes official page locators, source hashes, qualification details, protection
rules and conditional value equations. No cycle times, success probabilities or
full-match scores have been measured or simulated.

## Reading The Geometry

Common chassis: **700 x 760 mm**, perimeter 2920 mm; intact bumper ring. The starting
height cap is 1066.8 mm and extension limit is 457.2 mm from robot perimeter. Colors:
ochre coral, green algae, blue structure, purple climb, gray electrical/service.
Filled base/stow envelopes and dashed working poses represent alternatives of the
same hardware, not several deployed copies. A battery service box is reserved air.

Tool blocks may be partial contact hardware, not complete game-piece envelopes.
Nominal algae is 412.75 +/- 6.35 mm; coral is 301.625 mm long and 114.3 mm OD.
Full-piece clearances, compression, retained orientation, stacked-piece acquisition,
floor/bumper transitions and simultaneous carrying remain to be proved. R06 has a
near-limit floor working envelope; do not treat an endpoint check as useful margin.

Side-view L1 is the trough edge; L2-L4 lines are branch highest points. They are
**not manipulator-center targets**. Low/high reef-algae centers, net rim/opening,
processor edge-specific height and legal cage engagement geometry were not resolved
in the bounded source read. The robot poses are labeled hypotheses, not substitutes
for those field dimensions. In particular, net-placement candidates do not have a
verified reach pass and launcher candidates do not have a ballistic solution.

## Verify And Iterate

The renderer reuses the pinned 2D rasterizer from the intake-concept folder; no
CAD kernel, native Onshape calls, credentials or development server are needed.

```powershell
npm ci --prefix trials/subsystem-ab/concepts --ignore-scripts --no-audit --no-fund
node trials/whole-robot-concepts/render.mjs
node --test trials/whole-robot-concepts/*.test.mjs
```

[checks.json](checks.json) records static hardware endpoint/envelope checks;
[manifest.json](manifest.json) records source-image hashes and render-only runtime.
None tests mechanism collisions, kinematics, stability, cable/chain routing, joint
or climb loads, actual placement, controls, autonomy or inspection compliance.

Select one or two full-robot IDs, then verify the missing field interfaces and the
highest-risk contact/handoff/stow transition at full scale. Do not add detailed
hardware before that gate. Four separate GPT-6 Astra drafting agents covered the
ten architectures; a separate GPT-6 analysis used the cached official 2025 sources.
That is concept diversity, not ten independent physical validations.