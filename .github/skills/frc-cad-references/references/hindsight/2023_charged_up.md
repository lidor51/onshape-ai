# 2023 CHARGED UP – hindsight

Source: user hindsight notes, batch 1 (2026-09-27).

## Game play / meta
- Some elite teams had a forklift to slide under robots on the CHARGE STATION for a last-second balance, but
  balancing the traditional way was easy.
- **Most alliances played triple offense** with no dedicated defense – only occasional hitting while already
  cycling. Most matches were cycles to the loading area, with occasional mid-field pickups.
- At the low (single) station, human players had a technique to drop cones **standing up** when they wanted, or lying
  down (harder to control whether the base or the tip faced forward). They also found ways to **throw a lying cone or
  a cube forward to the edge of the loading area**, for shorter cycles.
- **Teams that tried to pick "any orientation" cones off the floor failed** this season: very inefficient to intake
  and slow to index into a placement-ready orientation. Successful teams took cones only from the human player, or
  only in a specific orientation (standing, or lying – acquired from the base / tip / middle).

## Dominant robots (varied concepts)
- **254** – elevator with a linearly extending gripper holding both cubes and cones, directly from the higher
  (double) human-player station; cube ground intake (linear deployment with a polycarbonate rack and pinion; same
  side as placement); forklift to go under robots on the ramp and join last after it was already balanced.
- **2056** – double-jointed arm with a dual end effector at the end (horizontal rollers plus a set of two compliant
  side wheels): could intake a standing cone or a floor cube.
- **2910** – the start of their signature pick & place robot: a telescopic arm on a very low pivot and a gripper on
  a wrist (another pivot). This utility arm gave a very low centre of gravity and was the only mechanism on the robot
  (also the ground intake). In AUTO only, they extended it very long along the floor to shorten drive time to game
  pieces.
- **1577** – high pivot holding a rack-and-pinion arm with a light roller gripper that pinches a cube and takes a cone
  from its edge. Floor cubes and lying cones (base side) via a mecanum ground intake that hands off to the end
  effector (ground cone intake opposite the placement side), or directly from either human-player station with the
  end effector.
- **1678** – elevator on a low pivot with a very wide gripper (two horizontal rollers, top and bottom) on another
  wrist, also used as their floor intake: floor cubes and standing cones, and both from the high station. Forklift to
  go under robots and balance last.
- **1561** – cube niche: a cube launcher. Small, low-CoG, light and very zippy, so it scored a very high number of
  game pieces per match; after filling the whole low row with cubes it had time to throw some cubes to mid and high.
- **695** – simple yet very effective: tilted fixed elevator with a gripper end effector and a hole in the bumper
  (two rollers: the bottom one intakes cubes, the two upper ones together collect a standing cone), from the floor or
  the high station.
- **1323** – straight elevator with a roller gripper on 2-DOF joints, plus a flap-down cube intake (like their 2022
  intake). Cube intake opposite the placement / station side.
- **4414** – tilted fixed elevator with a small 2-DOF roller gripper on a small robot, plus a flap-down cube intake
  (like their 2022 intake). Cube intake opposite the placement / station side.
- **5940** – tilted fixed elevator with a gripper on a wrist that takes cones/cubes from the high station, or cubes
  from their flap-down intake (similar to 1323, 4414). Forklift to go under robots and balance last. Cube intake
  opposite the placement / station side.
- **5460** – cube intake that can shoot/eject cubes or hand off to a 971-2018-style double-jointed carbon arm with a
  simple end effector (two compliant horizontal wheels); could also take a cone/cube from the high station.
- **3538** – 2-DOF arm with a high/medium base pivot.
- **971** – a super complex robot, but executed very well. 3-DOF arm: the lower joint is a high pivot this time, the
  second link is longer thand first link, and rotatable to control the end-effector orientation. End
  effector similar to 1678's, with wide double rollers (top, bottom).

## Effective mechanisms
- **254 linear self-retracting end effector** – lets the driver hit the human-player wall at high speed without
  breaking the mechanism, for faster cycles.
- **254 rack-and-pinion deployed intake** – linear ground intake deployed with a polycarbonate rack and pinion
  (another team did the same with slightly arced racks for an over-the-bumper motion).
- **3005** – wheeled gripper grabs a lying cone from its middle, then rotates it to the correct placement direction.
  A very effective way to intake (at the cost of the extra end-effector rotation).
- **1577 end effector** – two relatively close compliant-wheel rollers that pinch a standing cone at the top, or pinch
  a cube. Very simple and light.
- **1577 rack-and-pinion arm** – very simple linear mechanism, especially since the needed reach is not very high;
  the rack is a square tube with holes, and the pinion is a chain sprocket.
- **1678** wide gripper intake – pinches cones from the tip or holds cubes.
- **4414 / 1323 / 5940** flap-down cube intake (similar to the 1323 / 4414 2022 intake) – simple and effective.
- **695 / 4414 / 5940** tilted fixed elevator.
- **5460** double-jointed arm (971 2018 style).
- **5460 ground intake** – could both acquire and hand off a lying cone from its base, and acquire and hand off, or
  directly shoot/eject, a cube. Three rollers: two upper rollers pinch a standing cone, the lower pair grabs a cube
  (as described in the notes).
- **5460 end effector** – not fancy, but light and effective: only two sets of horizontal wheels, grabbing directly
  from the human player or from the intake handoff.
