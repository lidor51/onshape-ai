---
name: frc-cad-references
description: 'Find public FRC robot CAD and mechanism design studies to use as references: the Spectrum 3847 FRC CAD Collection sheet (team/year/format/link index, 2006-2026, plus Tech Documents and Code tabs) and the "Design Study" Google Drive folder (rolly-grippers, ball storage and serialization, catapults and shooters, tiny robots, grippers and claws, intake assemblies, pick and place games). Use when: CAD reference, public robot CAD, CAD release, find team N CAD for year Y, Onshape reference model, steal from the best, design study, mechanism survey, reference designs before concepts or detailed CAD.'
argument-hint: 'Team/year or mechanism, e.g. "1690 2025" or "ball serialization"'
---

# FRC CAD references

## Sources (checked 2026-09-27, publicly viewable without sign-in)

| Source | Link | Observed contents |
| --- | --- | --- |
| FRC CAD Collection, Spectrum 3847 | [Google Sheet](https://docs.google.com/spreadsheets/d/1acT6PpdR5l3zVhPqrehgamPsnUbk6yg-2JC5FcwIbb4/edit?gid=0#gid=0) | Tabs: CAD Collection, Tech Documents, Code Projects, Code Libraries, CAD: Onshape, one per year 2012-2022. Master tab (gid=0) columns: Team #, Year, Description, Format, Link, Team Name. About 1,000 rows, 2006-2026, mostly Onshape; also GrabCAD/STEP, Fusion, SolidWorks, Inventor, Drive. Community-submitted (a "Submit CAD Links" column). Includes a 1577 2026 row. |
| Design Study folder | [Google Drive](https://drive.google.com/drive/u/0/folders/1KDnN9-venG5a0sZtMT0qe9H2nJCRfTpX) | 7 files: Design Study - "Rolly-Grippers", Ball Storage and Serialization, Catapults and Shooters, FRC Tiny Robots, Grippers and Claws, Intake Assemblies, Pick and Place Games. Owner hidden. Author, file type and contents not yet verified. |

## Lookup

- Automated fetches of the `/edit` URL redirect to sign-in. Use
  `https://docs.google.com/spreadsheets/d/1acT6PpdR5l3zVhPqrehgamPsnUbk6yg-2JC5FcwIbb4/htmlview` (all tabs) or
  `.../export?format=csv&gid=0` (master tab CSV, redirects to googleusercontent).
- Folder listing: `https://drive.google.com/embeddedfolderview?id=1KDnN9-venG5a0sZtMT0qe9H2nJCRfTpX#list`.
- Filter by team and year first, then by Description keywords (turret, elevator, swerve). Description is free text,
  so a keyword search misses robots.
- Pick the Design Study that matches the mechanism class, read it, and cite page numbers.
- Pass the shortlist into [the research workflow](../../../docs/RESEARCH-REQUIREMENTS.md) with evidence labels.

## Rules

- The sheet is an index, not evidence: a row only shows that someone submitted a link. Open the specific document
  and record exact URL, version (`/v/`) or workspace (`/w/`, which is mutable), configuration and retrieval date.
  Label it LINK-ONLY until it has been inspected.
- Do not crawl the listed Onshape documents through the API or browser automation (Onshape API terms, see
  "Cost And Access" in RESEARCH-REQUIREMENTS). Open only specific documents for a specific question.
- Do not mirror the sheet or the Design Study files into this repo. Keep links and authored notes. Being publicly
  visible does not grant a reuse license.
- Data-quality problems seen: wrong team numbers (the row with Team # 2026 is actually 3255 SuperNURDs), malformed
  URLs (the 10243 "Other" row), Year 0 or Unknown, and Format values that don't match the link (STEP/IGES rows that
  point to Onshape). Check team and season against the document or the team's Chief Delphi release post.
- CAD shows the robot as modelled, which can differ from the robot as built at a given event. Check the release post
  for revision context.
- On a sign-in redirect, stop. Do not try other download routes.
