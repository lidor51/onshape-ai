# Optional Non-Coder UI Check

Status: **UNVERIFIED**. No human performed this checklist. All editor changes in
local tests are simulations. There was no browser use in this invocation.

Run only after a separately authorized live setup and copy have succeeded. A CAD
reviewer must first confirm that the source candidate actually solves in Onshape.
Use the trial-owned copied document, not an existing robot document. Do not run
the automatic simulated-editor phase on top of a human-edited copy: the current
bounded runner intentionally stops for reconciliation rather than adapting that
different experiment silently.

1. In the copied Part Studio, open the named `Control: plateThickness` variable
   dialog, change 6.35 mm to 8 mm, and accept. Open `Left plate: thickness` to
   inspect the ordinary extrusion depth reference. Check regeneration.
2. Open `Control: pivotY`, change 25 mm to 30 mm, and accept. Inspect the named
   `Pivot: constrained hole sketch` dimensions and the updated pivot position.
3. Create an ordinary sketch on the left inner face. Draw a circle, dimension
   diameter to 4 mm, locate its center 200 mm from the plate's front edge and
   27.3 mm above its bottom edge (world Y=200, Z=40). Constrain the sketch fully.
   Use an ordinary remove-extrude through the plate. Name it `Editor downstream`.
4. Ask the operator to reconcile this human variant before an AI revision; no
   code, console, payload construction, or FeatureScript editing is a CAD-user step.
5. After an authorized width/gap revision, inspect thickness 8, pivot (30,130),
   downstream diameter 4 at (200,40), six holes, and rear shaft Y=241.2. Use
   Onshape's normal measuring tools; confirm the template remains unchanged.

Record tester role, date, completion time, missed controls, errors, whether each
sketch was fully constrained, and any assistance. Leave all outcomes UNVERIFIED
until a person actually completes the steps. API success is not human usability.

## Family Boundary

Intended ordinary UI edits: named length variables, profile dimensions, hole
locations/diameters, plate extrusion depth, and a new downstream native feature.
The automatic revision owns only inner width and roller gap. Unrelated definitions
must remain unchanged or the run stops.

Outside this family: nonrectangular plates, changed topology/hole counts other
than this one editor hole, fillets, bearing/fastener fits, material assignment,
manufacturing tolerances, whole assemblies, purchased parts, mates, BOM and FEA.
A new family needs a new native template authoring and validation cost, which is
not known yet; copying or six-call parameter updates do not make that work free.