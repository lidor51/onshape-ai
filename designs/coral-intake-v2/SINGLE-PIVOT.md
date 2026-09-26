# Compact Single-Pivot Direction

Date: 2026-09-18. **Preferred architecture, not released geometry.**

**Update:** Full-system B-rep testing rejected the lower Y110/Z170 layout below:
the rear shaft intersects the retained indexer plates at stow. The current
[coaxial rear-roller pivot candidate](COAXIAL.md) keeps the single positioning
axis but has real revised cheeks/supports and a raised holding cradle. Its drives,
stow containment, contact mechanics and manufacturing gates are still incomplete.
The previous isolated-pickup numbers below are preserved, not current acceptance.

The user's latest direction is a simple single deployment pivot and a substantially
smaller deployment sweep. The 500 mm parallel-link layout is parked: it added
packaging and mechanical complexity without adequate passive frontal-impact relief.
The pickup, powered indexer, receiver, motors and transmissions remain required.
This decision does not approve the earlier high-pivot implementation unchanged.

## Packaging Candidate

Keep the roller layout for this first discriminating check, lower the positioning
axis and measure the entire arc, not just its endpoints. The promising candidate
is **X-axis pivot at Y=110, Z=170 mm, negative 110-degree stow**. These coordinates
are provisional; no physical mount, replacement cheek or complete drive has been
generated for them.

| Pickup layout | Fold travel | Maximum pickup height during movement |
| --- | ---: | ---: |
| Rejected parallel links, 500/10 mm geometry | 78 degrees of link rotation | about 835 mm |
| Original single pivot, Y110/Z330 | 140 degrees | about 809 mm |
| Lower single-pivot candidate, Y110/Z170 | 110 degrees | about 635 mm |

The comparison covers the pickup module only, not the tallest part of the robot.
For the lower candidate at front-float zero, stowed mesh bounds are approximately
Y42..386 and Z70..593 mm. The pickup does not initially swing farther forward than
its deployed outline in this screen. Its existing mouth still reaches about
268 mm beyond the assumed front bumper face. **Lowering the pivot reduces the
folding sweep, not the deployed intake depth.** Shortening that depth would require
a separate change to roller/contact geometry and another feeding check.

The four circular roller envelopes retain at least about 30.25 mm of bumper
clearance and 8.17 mm of floor clearance after the angular interpolation allowance,
at the two tested front-float endpoints. Neither number clears the cheeks, motor,
indexer, receiver, chassis supports or wiring. In particular, a lower folded pickup
uses different internal space and may conflict with the fixed indexer/receiver.
Do not select this axis from an isolated-pickup check alone.

## Impact Requirements

Powered deployment and impact protection are separate requirements. A single pivot
does not have to passively fold on every impact, but any protected direction needs
a defined, sized load path. No force limit, impact speed or survival rating is
approved by this calculation.

- Preserve stiff aluminum bearing and transmission datums. Use replaceable PC
  leading/contact pieces where their deflection cannot change roller centers or
  enter a belt, shaft or coral path. Thickness is still provisional.
- Provide chassis-supported endpoint stops with a defined compliant element and
  travel where useful. Do not make gearbox teeth or a stalled motor the unspecified
  endpoint impact restraint. Stops need calculated loads and fastening details;
  they do not make an intake immune to collision.
- For a low frontal contact that drives the pickup into the deployed stop, size
  local deflection or a replaceable sacrificial interface explicitly. Do not call
  ordinary PC guards an energy absorber or assume an unselected torque limiter.
- Carry sideways impacts through separated pivot supports, crossmembers and chassis
  attachments. A pure X-directed side hit supplies no deployment-axis torque and
  cannot be relieved merely by allowing that pivot to rotate.
- Assess wall contact during deployment as well as at the stops. Current limiting
  and driver commands are secondary controls, not structural crash protection.

At the candidate axis, an assumed 150 N inward force at the kicker center gives
**+20.4 Nm**, compared with +44.4 Nm at the old high axis. Positive torque still
opposes negative-angle stow. Thus the important earlier finding remains; the
single-pivot preference does not waive it. A real wall may strike other parts at
different heights, and peak collision forces are not established by this example.

## Evidence And Limits

[Calculation](single-pivot-screen.mjs), [tests](single-pivot-screen.test.mjs) and
[generated comparison](single-pivot-screen.json) preserve both old and new layouts.
The report binds the existing pickup mesh and geometry report by SHA256. It uses
all pickup mesh vertices projected into YZ, with analytic arc extrema of their
convex outline; a whole-module box is retained separately to show its conservatism.
An added 0.5 mm mesh allowance is an assumption, not a certified tessellation or
manufacturing tolerance. Front-float endpoints are checked independently, not all
coupled float/deployment trajectories. Original high-pivot hardware moves with
the module in the low-axis probe; this is not an assembled or supported mechanism.

The complete [linkage CAD checkpoint](system-output/index.html) is preserved as
rejected history, including all its mechanisms and failures. It is not a secretly
reparented single-pivot model. The next CAD change must replace incompatible
linkage structure with real pivot supports and actuation while retaining the full
indexer/receiver and all drives for interference and service-access checks.
No manufacturing or field-readiness gate is closed here.