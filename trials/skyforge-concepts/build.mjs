import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { CONCEPTS, MORTAR_ANGLE, KICKER_ANGLE } from './robots.mjs';
import { TASKS, PHASE_NAMES, matrix, scene } from './tasks.mjs';
import { GOALS, LIMITS } from './field.mjs';
import { SF5, SF6, SF7, SF8, DUNK, TRAY, columnAt, trayAt, dunkTrayAt, sf5Pose, sf6Pose, sf7Pose, sf8Pose, tunnelFor } from './magazine.mjs';

const here = new URL('./', import.meta.url);
const output = new URL('../../outputs/skyforge/', here);
const gameDir = process.env.SKYFORGE_GAME_DIR ?? 'C:/Users/lidor/FRC/2026/mocked_game';
const fieldHtmlPath = `${gameDir}/Steampunk_SKYFORGE_Field_3D.html`;
const manualPath = `${gameDir}/Steampunk_SKYFORGE_Game_Manual.html`;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

await mkdir(output, { recursive: true });

// 1. Field mesh: taken verbatim (vertices rounded to 0.1 mm) from the supplied 3D field page.
const fieldHtml = await readFile(fieldHtmlPath);
const text = fieldHtml.toString('utf8');
const start = text.indexOf('>', text.indexOf('id="field-data"')) + 1;
const field = JSON.parse(text.slice(start, text.indexOf('</script>', start)));
if (field.units !== 'mm' || field.up !== 'Z') throw new Error(`Unexpected field convention ${field.units}/${field.up}`);
const parts = field.parts.map(part => ({
  name: part.name, layer: part.layer, color: part.color, opacity: part.opacity,
  vertices: part.vertices.map(value => Math.round(value * 10) / 10), triangles: part.triangles,
}));
const fieldJs = `window.SKYFORGE_FIELD=${JSON.stringify({ units: 'mm', up: 'Z', parts })};\n`;
await writeFile(new URL('field.js', output), fieldJs);

// 2. Every declared concept/task/phase is built and rule-checked.
const results = matrix();
const worst = statuses => statuses.includes('fail') ? 'fail' : statuses.includes('flag') ? 'flag' : 'pass';
const summary = { concepts: {} };
for (const row of results) {
  summary.concepts[row.id] = { tasks: {} };
  for (const entry of row.tasks) if (entry.supported) summary.concepts[row.id].tasks[entry.task] = worst(entry.phases.flatMap(phase => phase.checks.map(check => check.status)));
}
await writeFile(new URL('checks.json', output), `${JSON.stringify(results, null, 1)}\n`);

// 3. Hood-angle scan that fixed the SF2 and SF4 hood angles.
const scanRows = [];
for (const [id, task] of [['SF2', 'vgFender'], ['SF2', 'vgZone'], ['SF4', 'vgZone']]) {
  for (let alpha = 56; alpha <= 76; alpha += 2) {
    const shots = scene(id, task, 'aim', { alpha }).shots.map(item => item.result);
    const feasible = shots.every(shot => shot.feasible);
    const width = feasible ? Math.min(...shots.map(shot => shot.speedBandPct[1] - shot.speedBandPct[0])) : 0;
    scanRows.push({ id, task, alpha, feasible, speedBand: width, unblockable: feasible && shots.every(shot => shot.unblockable) });
  }
}

// 4. Optional robustness runs from the supplied simulator (see sim/run.mjs).
const simPath = new URL('sim/results.json', here);
const sim = existsSync(simPath) ? JSON.parse(await readFile(simPath, 'utf8')) : null;
const simRow = prefix => sim?.rows.find(row => row.label.startsWith(prefix));
const at = (prefix, tier) => { const row = simRow(prefix); return row ? `${row.byTier[tier].win.toFixed(0)}% win / ${row.byTier[tier].rp.toFixed(2)} RP` : 'n/a'; };

// 5. Side-view feasibility searches behind SF5/SF6 (node feasibility.mjs writes feasibility.json).
const feasPath = new URL('feasibility.json', here);
const feas = existsSync(feasPath) ? JSON.parse(await readFile(feasPath, 'utf8')) : null;
if (feas) await writeFile(new URL('feasibility.json', output), await readFile(feasPath));

// 2D side view (robot frame, mm) of one concept in several poses, drawn from the same kinematics as the 3D model.
function sideView(id) {
  const { L } = { SF5, SF6, SF7, SF8 }[id];
  const goals = id === 'SF8' ? [GOALS.G3, GOALS.G2near] : [id === 'SF6' ? GOALS.G3 : GOALS.G2near];
  const face = L / 2 + 82.55, ext = L / 2 + LIMITS.extension;
  const poly = (pts, cls) => `<polygon class="${cls}" points="${pts.map(([x, z]) => `${x.toFixed(0)},${(-z).toFixed(0)}`).join(' ')}"/>`;
  const line = ([x1, z1], [x2, z2], cls) => `<line class="${cls}" x1="${x1.toFixed(0)}" y1="${(-z1).toFixed(0)}" x2="${x2.toFixed(0)}" y2="${(-z2).toFixed(0)}"/>`;
  const label = ([x, z], text, cls = '') => `<text class="${cls}" x="${x.toFixed(0)}" y="${(-z).toFixed(0)}">${esc(text)}</text>`;
  const poses = [];
  if (id === 'SF5') {
    for (const [task, phase, name, cls] of [['start', 'start', 'start (42 in)', 'p0'], ['floor', 'intake', 'load (vertical column, curved handoff from the tunnel)', 'p1'], ['g2', 'engage', 'GOAL 2 drop', 'p2'], ['vgZone', 'aim', 'VERTICAL GOAL shot (zone spot)', 'p3']]) {
      const j = scene(id, task, phase).root.userData.joints;
      const p = sf5Pose(j.shoulder, j.axis);
      poses.push({ name, cls, body: poly(columnAt(p.bottom, j.axis), cls) + line(SF5.pivot, p.wrist, `${cls} arm`) });
    }
  } else if (id === 'SF6') {
    for (const [task, phase, name, cls] of [['start', 'start', 'start (42 in)', 'p0'], ['floor', 'intake', 'load (in line with the tunnel)', 'p1'], ['g3', 'engage', 'GOAL 3 (both joints on stops)', 'p2'], ['vgZone', 'aim', 'VERTICAL GOAL shot (zone spot)', 'p3']]) {
      const j = scene(id, task, phase).root.userData.joints;
      const p = sf6Pose(j.carriage, j.tilt);
      poses.push({ name, cls, body: poly(trayAt(p.front, j.tilt), cls) + `<circle class="${cls}" cx="${p.pivot[0].toFixed(0)}" cy="${(-p.pivot[1]).toFixed(0)}" r="14"/>` });
    }
  } else if (id === 'SF7') {
    for (const [task, phase, name, cls] of [['start', 'start', 'start, crank 0', 'p0'], ['floor', 'intake', `load, crank ${SF7.loadCrank.toFixed(0)} deg`, 'p1'], ['g2', 'engage', `GOAL 2, crank ${SF7.sweep.toFixed(0)} deg (end stop)`, 'p2'], ['vgZone', 'aim', 'VERTICAL GOAL shot (zone spot)', 'p3']]) {
      const p = sf7Pose(scene(id, task, phase).root.userData.joints.crank);
      poses.push({ name, cls, body: poly(trayAt(p.front, p.axis), cls) + SF7.links.map((link, index) => line(link.ground, p.joints[index], `${cls} arm`)).join('') });
    }
  } else {
    for (const [task, phase, name, cls] of [['start', 'start', 'start (42 in)', 'p0'], ['floor', 'intake', `load (tray ${180 - SF8.loadAxis} deg up, ${130 - SF8.loadAxis} deg kink at the tunnel)`, 'p1'], ['g2', 'engage', 'GOAL 2 dunk (level)', 'p2'], ['g3', 'engage', 'GOAL 3 dunk (level, mast top stop)', 'p4'], ['vgZone', 'aim', 'VERTICAL GOAL shot (zone spot)', 'p3']]) {
      const j = scene(id, task, phase).root.userData.joints;
      const p = sf8Pose(j.h, j.tilt);
      poses.push({ name, cls, body: poly(dunkTrayAt(p.front, j.tilt), cls) + `<circle class="${cls}" cx="${p.pivot[0].toFixed(0)}" cy="${(-p.pivot[1]).toFixed(0)}" r="14"/>` });
    }
  }
  const P = t => [SF6.pivotLoad[0] + SF6.u[0] * t, SF6.pivotLoad[1] + SF6.u[1] * t];
  const structure = id === 'SF5'
    ? `<circle class="joint" cx="${SF5.pivot[0]}" cy="${-SF5.pivot[1]}" r="18"/>${label([SF5.pivot[0] + 40, SF5.pivot[1] + 55], 'shoulder (42 in ceiling)')}`
    : id === 'SF6' ? `${line(P(SF6.rail.baseS), P(SF6.travel + 60 / SF6.u[1]), 'rail')}${label([P(SF6.rail.baseS)[0] - 60, 40], `lift line, ${SF6.beta.toFixed(0)} deg from vertical`)}`
    : id === 'SF8' ? `${line([SF8.mastX, 60], [SF8.mastX, SF8.g3 + SF8.carriage.up], 'rail')}${label([SF8.mastX - 380, 1420], 'vertical mast')}`
    : SF7.links.map((link, index) => `<circle class="joint" cx="${link.ground[0].toFixed(0)}" cy="${(-link.ground[1]).toFixed(0)}" r="18"/>${label([link.ground[0] + 25, link.ground[1] - 60], index === 0 ? 'crank (motor)' : 'rocker')}`).join('');
  const throat = [face + 304.8 - 139.7, face + 304.8 + 139.7];
  const goalSvg = goals.map((goal, index) => `<rect class="goal" x="${face}" y="${-goal.rim}" width="609.6" height="${goal.rim}"/>${line([throat[0], goal.rim], [throat[1], goal.rim], 'throat')}${label([face + 330, goal.rim - 90 + (index ? 0 : 0)], `${goal.id === 'G3' ? 'GOAL 3' : 'GOAL 2'} rim ${Math.round(goal.rim)} mm`)}`).join('');
  return `<svg class="side" viewBox="-1000 -2150 2450 2260" role="img" aria-label="${id} side view">
${goalSvg}
${line([-1000, LIMITS.maxHeight], [1450, LIMITS.maxHeight], 'limit')}${label([-990, LIMITS.maxHeight + 25], '78 in')}
${line([-L / 2, LIMITS.startHeight], [L / 2, LIMITS.startHeight], 'limit')}${label([-L / 2, LIMITS.startHeight + 25], '42 in start')}
${line([ext, 0], [ext, 2100], 'limit')}${line([-ext, 0], [-ext, 2100], 'limit')}${label([ext + 10, 2060], '18 in')}
${poly(tunnelFor(L).keepout, 'keep')}${label([tunnelFor(L).keepout[0][0], tunnelFor(L).keepout[2][1] + 20], 'stowed intake')}
<rect class="frame" x="${-L / 2}" y="-146" width="${L}" height="108"/><rect class="bumper" x="${-L / 2 - 82.55}" y="-146" width="${L + 165.1}" height="82.55"/>${line([-1000, 0], [1450, 0], 'ground')}
${structure}${poses.map(p => p.body).join('')}
</svg><p class="legend minor">${poses.map(p => `<span><i class="${p.cls}"></i>${esc(p.name)}</span>`).join('')}<br>Robot frame, mm. The goal is drawn at its scoring position; loading and shooting happen elsewhere on the field.</p>`;
}

function armSection() {
  if (!feas) return '<p class="minor">feasibility.json not generated: run <code>node feasibility.mjs</code>.</p>';
  const frames = Object.entries(feas.frames);
  const hb = feas.heightBudget;
  const g1 = hb.find(row => row.goal.startsWith('GOAL 1')), g2 = hb.find(row => row.goal.startsWith('GOAL 2')), g3 = hb.find(row => row.goal.startsWith('GOAL 3'));
  const rows = frames.map(([L, name]) => {
    const rigid = feas.rigidArm?.find(r => String(r.L) === L), wrist = feas.wristArm.find(r => String(r.L) === L), ramp = feas.rampLift.find(r => String(r.L) === L), bar = feas.fourBarTray?.find(r => String(r.L) === L);
    const rigidText = !rigid ? 'n/a' : rigid.bestLegalSwing && rigid.bestLegalSwing.violation <= 0 ? 'legal swing found' : rigid.legalStarts ? `no: best swing leaves the envelope by ${Math.round(rigid.bestLegalSwing.violation)} mm` : 'no legal start pose';
    return `<tr><th>${esc(name)}</th><td class="${rigid && rigid.bestLegalSwing?.violation <= 0 ? 's-pass' : 's-fail'}">${rigidText}</td><td class="${wrist.count ? 's-pass' : 's-fail'}">${wrist.count} (${Object.entries(wrist.byLoad).filter(([, v]) => v.count).map(([axis, v]) => `${v.count} with ${axis === '90' ? 'vertical' : `${180 - Number(axis)} deg`} loading`).join(', ') || 'none'})</td><td class="${ramp.count ? 's-pass' : 's-fail'}">${ramp.count} (${ramp.byStages[1]} with one moving stage)</td><td class="${bar?.count ? 's-pass' : 's-fail'}">${bar ? `${bar.count} (${bar.hangCompatible} can also hang)` : 'n/a'}</td></tr>`;
  }).join('');
  const w = feas.wristArm.find(r => r.count)?.byLoad['90'];
  const pins = feas.singlePivot?.find(r => r.L === 762), inline = pins?.trayLevel.find(r => r.loadAxis === 130), inRobot = pins?.trayLevel.filter(r => r.inRobot) ?? [];
  const bar = feas.fourBarTray?.find(r => r.L === 762), s6 = feas.sf6Goal2;
  const sf7Alpha = (180 - scene('SF7', 'vgZone', 'aim').root.userData.joints.tilt).toFixed(0);
  const singleDof = pins && bar && s6 ? `<h3>Is one rotational DOF enough for GOAL 2 + VERTICAL GOAL?</h3>
<ol class="rec">
<li><b>A single pin joint: no.</b> A pin moves the magazine rigidly, so the load pose and the GOAL 2 pose fix the only possible pivot. With the tray loading in line with the tunnel, that pivot is at (${inline.pivot.join(', ')}) mm, above the 42 in start ceiling. With curved-handoff loading (${inRobot.map(r => `${180 - r.loadAxis} deg`).join(', ')} up from horizontal) the pivot falls inside the robot at ${Math.min(...inRobot.map(r => r.pivot[1]))}-${Math.max(...inRobot.map(r => r.pivot[1]))} mm, but no rotation about it gives a legal start pose. For the 4-cube column the pivot is outside the robot, or does not exist. The 34 x 26 in frame gives the same answer.</li>
<li><b>One motor driving a four-bar: yes, this is SF7 Rocker Tray.</b> With the tray as the coupler, a four-bar passes three exact poses (start, load, GOAL 2) and turns the tray on the way. On the 30 x 28 in frame, ${bar.count} linkages run start, then load, then GOAL 2 in order, without a dead point and inside 78 in / 18 in; ${bar.hangCompatible} of them keep the front half low enough to hang. The path passes rear-up poses between loading and GOAL 2, and at the zone spot one of them is a legal VERTICAL GOAL shot (${band('SF7', 'vgZone')} speed tolerance). Costs: the shot is flat (${sf7Alpha} deg), there is no fender shot, GOAL 1 and GOAL 3 are out, and the tray turns fast near the start pose.</li></ol>
<h3>Can SF6 also do GOAL 2?</h3>
<p>No. Its lift is inclined, so height and reach move together. At GOAL 2 height the tilt axle would need to be at x ${s6.neededPivot[0]} mm, but the lift line is at x ${s6.liftLineXAtThatHeight} mm there: ${s6.levelShortfall} mm short with the tray level. Even with any tilt, the best controlled drop (cube bottom 10-150 mm above the rim) is ${s6.bestAnyTilt.offset} mm short of the THROAT centre, and the THROAT allows about 25 mm. GOAL 2 would need a reach DOF (a drawer, as in SF3) or a different linkage (SF7 gets GOAL 2 but gives up GOAL 3).</p>` : '';
  return `<p><b>Short answer: a single pin joint cannot carry a 4-cube magazine to GOAL 2 from a legal start. Three layouts that do work: a high shoulder plus a wrist (SF5: 34 x 26 in frame, drops of 4 at GOAL 2), one motor driving a four-bar (SF7: 30 x 28 in frame, 4 cubes indexed at GOAL 2), and an inclined lift plus tilt for GOAL 3 (SF6).</b></p>
<ol class="rec">
<li><b>GOAL 1 is out for a 4-cube column.</b> GOAL 1 stands in the opponent LAUNCH ZONE, so the robot must stay under 48 in there (G416). A 4-stack over the 18 in rim tops out at ${Math.round(g1.fourCubeTop)} mm against ${Math.round(g1.limit)} mm, and even the empty 950 mm column reaches ${Math.round(GOALS.G1.rim + 40 + 940)} mm. Score GOAL 1 with a partner or a separate low mechanism.</li>
<li><b>GOAL 2 fits 4.</b> The stack top is at ${Math.round(g2.fourCubeTop)} mm, ${Math.round(g2.limit - g2.fourCubeTop)} mm under 78 in. Above GOAL 3 only ${g3.cubes} cube height fits.</li>
<li><b>A column bolted to a single-pivot arm cannot get there legally.</b> With the stowed intake and drivebase in the way, no pivot inside the robot can even rotate the GOAL 2 drop pose into a legal start pose, on either frame (table). The column is vertical at only one arm angle, and that angle cannot be reached from a legal stow.</li>
<li><b>A levelling linkage keeps it vertical but fails elsewhere:</b> the load point would sit ${Math.round(feas.leveledArm.loadBottomInsideFrame)} mm above the carpet (under the bumper top), and an always-vertical column cannot tilt to shoot.</li>
<li><b>Shoulder + wrist works${w ? `: every solution has the shoulder at ${w.range.pivotZ[0]}-${w.range.pivotZ[1]} mm, which is the 42 in start ceiling, just behind centre, with a ${w.range.arm[0]}-${w.range.arm[1]} mm arm` : ''}.</b> So your high-pivot instinct is right: as high as possible. But the column also needs its own joint. With vertical loading, each cycle is a single shoulder swing (the wrist chain holds the column's angle), and the wrist only moves to stow and to tilt for a shot.</li>
<li><b>GOAL 3 + VERTICAL GOAL:</b> an inclined single-stage lift with a tilting tray works on the standard 30 x 28 in frame. At GOAL 3 both joints are on hard stops, which is where its precision comes from.</li></ol>
<table class="wide"><thead><tr><th>Frame</th><th>Rigid single pivot (GOAL 2 drop)</th><th>Shoulder + wrist, legal cycle and start (SF5)</th><th>Inclined lift + tilting tray (SF6)</th><th>Four-bar tray, one motor (SF7)</th></tr></thead><tbody>${rows}</tbody></table>
${singleDof}
<p class="minor">Method: 2D side-view envelopes of the magazine only (column 950 x 218 mm, tray hull 904 x 324 mm), checked against 42 in and inside the frame at the start, clear of the drivebase (120 mm) and the stowed intake, and against 78 in, 18 in and the floor in motion. SF5 motion is searched on a joint grid (shoulder 2 deg, column 5 deg, wrist rate limited) with 30 mm vertical spare. SF6 paths are linear in carriage position and tilt. SF7 linkages are synthesised from three exact poses and driven in 90 steps on one assembly branch. Links, arm tubes, drives, wiring, dynamics and structure are not checked. Source: <a href="feasibility.json">feasibility.json</a>.</p>
<div class="sides"><figure><h3>SF5 Column Arm, side view</h3>${sideView('SF5')}</figure><figure><h3>SF6 Ramp Lift, side view</h3>${sideView('SF6')}</figure><figure><h3>SF7 Rocker Tray, side view</h3>${sideView('SF7')}</figure></div>`;
}
function dunkSection() {
  if (!feas?.dunkMast || !feas.throatShots) return '<p class="minor">feasibility.json has no dunk study: run <code>node feasibility.mjs</code>.</p>';
  const best = feas.dunkMast.chosen.best, ts = feas.throatShots;
  const pm = (b, digits = 1) => `&plusmn;${Math.min(-b[0], b[1]).toFixed(digits)}`;
  const width = s => s.speedBandPct[1] - s.speedBandPct[0];
  const shotCell = s => s ? `<td class="${width(s) >= 6 ? 's-pass' : width(s) >= 3 ? 's-flag' : 's-fail'}">${pm(s.speedBandPct)}% speed, ${pm(s.angleBandDeg, 2)} deg angle; ${s.alpha} deg from ${s.release} mm, apex ${(s.apex / 1000).toFixed(1)} m</td>` : '<td class="s-fail">no clean entry</td>';
  const shotRows = ts.rows.map(row => `<tr><th>${row.goal === 'G2' ? 'GOAL 2 (38 in)' : 'GOAL 3 (60 in)'}</th><td>${(row.distance / 1000).toFixed(1)} m</td>${shotCell(row.practical)}${shotCell(row.mortar)}</tr>`).join('');
  const dist = ts.rows.flatMap(row => [row.practical, row.mortar]).filter(Boolean).map(s => Math.min(-s.distanceBand[0], s.distanceBand[1]));
  const own = ts.sf8FromGoalFace;
  const ownText = key => own[key] ? `${pm(own[key].speedBandPct)}% speed and ${pm(own[key].angleBandDeg, 2)} deg (a ${own[key].alpha} deg lob, apex ${(own[key].apex / 1000).toFixed(1)} m)` : 'no clean entry';
  const axisRows = feas.dunkMast.byLoadAxis.map(r => `<tr${r.loadAxis === SF8.loadAxis ? ' class="chosen"' : ''}><th>${180 - r.loadAxis} deg up${r.loadAxis === 130 ? ' (in line with the tunnel)' : ` (${130 - r.loadAxis} deg kink)`}</th><td class="${r.count ? 's-pass' : 's-fail'}">${r.count}</td><td>${r.byStages[1]}</td><td>${r.hangCompatible}</td></tr>`).join('');
  const lever = SF8.pivotAlong - 114.3, g1Floor = GOALS.G1.rim + DUNK.goalGap + 114.3 - TRAY.floor, intakeTop = tunnelFor(SF8.L).keepout[2][1];
  return `<p><b>Short answer: dunk both GOAL 2 and GOAL 3 with one mechanism (SF8 Dunk Mast) and shoot only at the VERTICAL GOAL. A THROAT is too tight to shoot into: from under 78 in no practical shot (20-70 deg) enters GOAL 3 cleanly, and GOAL 2 only from close range with about &plusmn;1% speed.</b></p>
<h3>Why shooting into a THROAT does not work</h3>
<p>An aligned 9 in cube has 1 in of clearance per side in the 11 in THROAT. To go in without touching the walls, its square has to stay inside the THROAT while it falls its own height through the rim plane: it must come down within about 12.5 deg of vertical (2 in of play over 9 in of height), with its centre within 25 mm of the THROAT centre in both directions. The hexagon allows about 266 mm sideways. Best clean-entry shot from each distance, released at 900-1900 mm:</p>
<table class="wide"><thead><tr><th>Goal</th><th>Distance to THROAT centre</th><th>Practical shooter (20-70 deg)</th><th>Mortar lob (71-88 deg)</th></tr></thead><tbody>${shotRows}</tbody></table>
<p class="minor">Tolerances are the speed (at the nominal angle) and launch angle (at the nominal speed) that still enter cleanly; the distance window is at most &plusmn;${Math.max(...dist)} mm and the aim window &plusmn;25 mm in every case. SF8's own kicker, with its rear bumper on the goal face (${(own.G2?.distance / 1000).toFixed(1)} m to the THROAT centre), gets ${ownText('G2')} at GOAL 2 and ${ownText('G3')} at GOAL 3. Its VERTICAL GOAL shots keep ${band('SF8', 'vgFender')} at the fender and ${band('SF8', 'vgZone')} at the zone spot. Drag, spin and foam bounce are not modelled. A cube that hits the far wall inside the THROAT can still fall in, but it can also pitch and wedge, which is the jam your simulator charges for a miss. ${esc(ts.entryRule)}</p>
<h3>How the dunk works</h3>
<ol class="rec">
<li><b>Slot 1 has no floor.</b> Two rows of omni wheels per side pinch the cube's side faces. Their rollers let the cube slide along the tray while loading and shooting; the wheels themselves drive it across the tray, which is straight down when the tray is level.</li>
<li><b>Downward drive through the THROAT mouth.</b> The lower row is as low as the rim allows: axle ${Math.round(DUNK.lineAboveRim)} mm above the rim, wheel ${DUNK.clearance} mm clear of the rim edge. The cube is driven until its top leaves that row, when its bottom is ${Math.round(DUNK.driveDepth)} mm below the rim, past the 152 mm straight section. Only the cube enters the THROAT.</li>
<li><b>The pinch centres the cube sideways.</b> Between SF6's and SF7's tray plates a cube has ${Math.round(172 - 3 - 114.3)} mm of side play against 25 mm of THROAT clearance, so those trays also need side guides or this pinch.</li>
<li><b>Force, not just a drop:</b> driven wheels can push a slightly yawed or tilted foam cube through the mouth, and they index the next cube without waiting for a trapdoor. How much force the foam needs is untested.</li></ol>
<h3>Why a vertical mast, and where the tilt axle sits</h3>
<p>The level poses over GOAL 2 and GOAL 3 differ only in height, so the tilt axle must travel on a vertical line. SF6's inclined lift reaches only GOAL 3. The loading pose must put the axle on the same line, and that fixes the axle's position on the tray: near the rear corner, ${SF8.pivotAlong} mm along and ${SF8.across.toFixed(0)} mm across, with the mast at x ${SF8.mastX.toFixed(0)} mm. With the tray in line with the tunnel no axle position on the side plate gives a legal start; loading it a few degrees steeper does:</p>
<table class="wide"><thead><tr><th>Tray angle at loading</th><th>Legal layouts</th><th>With one moving stage</th><th>Also hang-compatible</th></tr></thead><tbody>${axisRows}</tbody></table>
<p>SF8's axle rides from ${SF8.start.h} mm (start) to ${Math.round(SF8.load)} mm (load), ${Math.round(SF8.g2)} mm (GOAL 2) and ${Math.round(SF8.g3)} mm (GOAL 3): ${best.carriageTravel} mm on a mast with one moving stage. Loading to GOAL 2 is a ${Math.round(SF8.g2 - SF8.load)} mm lift plus a ${180 - SF8.loadAxis} deg tilt; the path margin inside 18 in is ${best.cycleMargin} mm, because the goal poses use the whole reach budget.</p>
<h3>Costs</h3>
<ul><li><b>The dunk pushes the tray up.</b> The wheels are ${Math.round(lever)} mm from the tilt axle: ${(lever / 100).toFixed(1)} N m of hold-down per 10 N of dunk force. The tilt drive must hold it; a level stop only resists the other way.</li>
<li><b>Rules:</b> 4.5 says cubes enter a THROAT by being dropped or LAUNCHED. As the game author, decide whether a driven dunk from above counts; G411 only forbids breaking opponent THROATs.</li>
<li><b>No GOAL 1:</b> a level tray over the 18 in rim would put its floor at ${Math.round(g1Floor)} mm, inside the stowed intake (up to ${Math.round(intakeTop)} mm).</li>
<li><b>More on the tray:</b> 11 motors; tilt, belt, 2 dunk and kicker motors move with the mast, and the mast rails cannot be tied across the top.</li>
<li><b>Simulator</b> (my estimates: 0.35 s and 95% per cube at GOAL 2/3, against SF6's 0.45 s and 93% trapdoor): ${at('SF8 Dunk', 'strong')} strong, ${at('SF8 Dunk', 'average')} average; with SF6's trapdoor numbers instead, ${at('SF8 control', 'strong')} / ${at('SF8 control', 'average')}.</li></ul>
<div class="sides"><figure><h3>SF8 Dunk Mast, side view</h3>${sideView('SF8')}</figure></div>`;
}
function recommendation() {
  const lev = (prefix, tier) => simRow(prefix)?.byTier[tier].levels.toFixed(0);
  return `<p class="minor">Capacities are now what each mock physically holds per trip: SF1, SF2, SF5, SF6, SF7 and SF8 carry 4; SF3 carries 3 and SF4 carries 2. The earlier runs gave SF3 and SF4 one cube more than their trays hold, and gave SF1 no reload time between its two pairs.</p>
<ol class="rec">
<li><b>Highest in your simulator, if the dunk works: SF8 Dunk Mast</b> (${at('SF8 Dunk', 'elite')} elite, ${at('SF8 Dunk', 'strong')} strong, ${at('SF8 Dunk', 'average')} average; LEVELS RP ${lev('SF8 Dunk', 'strong')}% at strong). It adds GOAL 2 to SF6's GOAL 3, dunks both with driven omni wheels, and shoots the VERTICAL GOAL spin-free (${band('SF8', 'vgFender')} fender, ${band('SF8', 'vgZone')} zone), then HANGs. The lead rests on my dunk estimate (0.35 s and 95% per cube): with SF6's trapdoor numbers it gets ${at('SF8 control', 'strong')} strong and ${at('SF8 control', 'average')} average, below SF6 at strong. So the dunk rig is the first prototype. Costs: 11 motors, a mast that cannot be tied across the top, and a dunk reaction the tilt drive must hold.</li>
<li><b>Highest without the dunk assumption: SF6 Ramp Lift</b> (${at('SF6', 'elite')} elite, ${at('SF6', 'strong')} strong, ${at('SF6', 'average')} average; LEVELS RP ${lev('SF6', 'strong')}% at strong). It puts 4 cubes into the 5-point GOAL 3 from hard stops and also shoots the VERTICAL GOAL (${band('SF6', 'vgFender')} speed tolerance at the fender, ${band('SF6', 'vgZone')} at the zone spot). At average execution it is level with SF3, so its lead depends on executing well. Its task times are my estimates, and the tray sandwich and trapdoor indexing are unproven. Its tray also lets a cube sit ${Math.round(172 - 3 - 114.3)} mm off centre over a 25 mm THROAT margin: it needs side guides.</li>
<li><b>Most tolerant when execution slips: SF3 Gantry Tower</b>, now with its real 3-cube tray (${at('SF3 Gantry', 'strong')} strong, ${at('SF3 Gantry', 'average')} average; your Tower preset gets ${at('Your Tower', 'average')} at average). The fork mainly protects the LEVELS RP (${lev('SF3 Gantry', 'strong')}% vs ${lev('SF3 control', 'strong')}% without it at strong). Cost: 5 DOF, 7 state changes per cycle and a 70 mm reach margin.</li>
<li><b>SF5 Column Arm (your arm idea, made legal)</b>: GOAL 2 in drops of 4 plus the VERTICAL GOAL (${band('SF5', 'vgFender')} fender, ${band('SF5', 'vgZone')} zone) and HANG. Simulator: ${at('SF5', 'strong')} strong, ${at('SF5', 'average')} average; LEVELS RP ${lev('SF5', 'strong')}% at strong. Its costs are a 34 x 26 in frame, a long lever at 78 in, and no GOAL 1.</li>
<li><b>SF7 Rocker Tray (one motor)</b>: GOAL 2 four cubes per trip plus zone-spot VERTICAL GOAL shots (${band('SF7', 'vgZone')}) and HANG, on the standard frame. Simulator: ${at('SF7', 'strong')} strong, ${at('SF7', 'average')} average; LEVELS RP ${lev('SF7', 'strong')}% at strong. Fewest positioning DOF of the placer-shooters, but a flat shot and no fender shot.</li>
<li><b>SF1 Brass Cannon</b> with honest 4-cube indexing (two pairs, one barrel reset): ${at('SF1 Brass', 'strong')} strong, ${at('SF1 Brass', 'average')} average, against your Launcher preset's ${at('Your Launcher', 'strong')} / ${at('Your Launcher', 'average')}. It stays the best under-board and UNDER option, and its release clears a legal defender (${band('SF1', 'vgFender')} fender, ${band('SF1', 'vgZone')} zone). Your simulator applies the same accuracy penalty to the hexagon as to the THROATs, so it cannot credit the bigger target; shooter-only robots look worst when execution slips.</li>
<li><b>Budget floor: SF2 Mortar Rider</b> (${at('SF2', 'strong')} strong, ${at('SF2', 'average')} average): fewest positioning DOF, but it is only reliable from the fender and cannot hang.</li>
<li><b>SF4 Forge Hybrid</b> is the complexity ceiling with only 2 cubes per trip (${at('SF4', 'strong')} strong, ${at('SF4', 'average')} average). Not recommended.</li></ol>
<p class="minor">Next discriminating tests, cheapest first: (1) a dunk rig: two rows of omni wheels pushing a foam cube into a real 11 in THROAT box at 0, 10 and 20 deg yaw, measuring force, time and jams; (2) a cube shooter test rig at the fender and at 1.6 m (speed band, tumble, whether the cube passes above 48 in at the bumper line); (3) the 2-lane intake wedge with cubes arriving centred; (4) a cardboard goal fork and trapdoor tray on a real 24 in goal box, and the SF6 tray sandwich at 50 deg; (5) the rail hook and 2 in lift, with measured centre-of-mass offset.</p>`;
}

const bundle = await build({ entryPoints: [fileURLToPath(new URL('app.mjs', here))], bundle: true, format: 'iife', write: false, minify: true, legalComments: 'none', platform: 'browser' });
const appBytes = bundle.outputFiles[0].contents;
await writeFile(new URL('app.js', output), appBytes);

const taskColumns = Object.keys(TASKS).filter(task => task !== 'start');
function band(id, task) {
  const shots = results.find(row => row.id === id).tasks.find(entry => entry.task === task).phases.find(phase => phase.phase === 'aim').checks.filter(check => check.label.startsWith('Speed tolerance'));
  return [...new Set(shots.map(check => check.detail.match(/from (.*) of nominal/)[1].replace(' to ', ' / ')))].join(' (lane L) and ') + (new Set(shots.map(check => check.detail)).size > 1 ? ' (lane R)' : '');
}
const cell = (id, task) => {
  const status = summary.concepts[id].tasks[task];
  return status ? `<td class="s-${status}"><a href="#viewer/${id}/${task}/${TASKS[task].phases.at(-1)}" data-open="${id}/${task}">${{ pass: 'yes', flag: 'yes*', fail: 'fails' }[status]}</a></td>` : '<td class="none">-</td>';
};
const scanTable = ['SF2 vgFender', 'SF2 vgZone', 'SF4 vgZone'].map(key => {
  const rows = scanRows.filter(row => `${row.id} ${row.task}` === key);
  return `<tr><th>${key.replace('vgFender', 'fender').replace('vgZone', 'zone 1.6 m')}</th>${rows.map(row => `<td class="${row.feasible ? row.speedBand >= 6 ? 's-pass' : 's-flag' : 's-fail'}">${row.feasible ? `${row.speedBand.toFixed(1)}%${row.unblockable ? '' : '<sup>b</sup>'}` : 'x'}</td>`).join('')}</tr>`;
}).join('');
const simSection = sim ? `<h3>Execution-robustness runs in your simulator</h3>
<p>${esc(sim.note)}</p>
<table class="sim wide"><thead><tr><th>Alliance (our robot first)</th>${sim.tiers.map(tier => `<th colspan="3">Our robot: ${esc(tier)}</th>`).join('')}<th colspan="2">Strong to average</th></tr><tr><th></th>${sim.tiers.map(() => '<th>Win %</th><th>Avg RP</th><th>Score</th>').join('')}<th>RP lost</th><th>SKYFORGE / LEVELS RP at average</th></tr></thead>
<tbody>${sim.rows.map(row => `<tr><th>${esc(row.label)}</th>${sim.tiers.map(tier => { const r = row.byTier[tier]; return `<td>${r.win.toFixed(0)}</td><td>${r.rp.toFixed(2)}</td><td>${r.score.toFixed(0)}</td>`; }).join('')}<td>${(row.byTier.strong.rp - row.byTier.average.rp).toFixed(2)}</td><td>${row.byTier.average.skyforge.toFixed(0)}% / ${row.byTier.average.levels.toFixed(0)}%</td></tr>`).join('')}</tbody></table>
<p class="minor">${esc(sim.caveat)} Your tier model applies the same accuracy penalty to every target, so it cannot credit the hexagon's larger opening; the geometric tolerance bands above are the evidence for that.</p>` : '<p class="minor">Simulator robustness runs not generated.</p>';

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Steampunk SKYFORGE - crayola robot concepts</title><link rel="icon" href="data:,">
<style>
:root{--ink:#2b1d12;--muted:#6f5a43;--brass:#b8862f;--line:#d8c7a4;--paper:#fbf6ea;--pass:#1f8a4c;--flag:#b7791f;--fail:#c0392b}
*{box-sizing:border-box}body{margin:0;background:#efe6d2;color:var(--ink);font:15px/1.5 "Segoe UI",Roboto,Arial,sans-serif}
header{background:#17110c;color:#f3e6c8;padding:18px 26px;border-bottom:4px double var(--brass)}header h1{margin:0;font:700 26px Georgia,"Palatino Linotype",serif;letter-spacing:.5px}header p{margin:4px 0 0;color:#d9c49a}
nav a{color:#f0c56a;margin-right:16px;text-decoration:none;font-weight:600}nav{margin-top:10px}
main{max-width:1500px;margin:0 auto;padding:10px 20px 50px}section{background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:18px 22px;margin:18px 0}
h2{font:700 21px Georgia,serif;margin:0 0 10px;color:#4a2e14}h3{font:700 16px Georgia,serif;margin:18px 0 6px;color:#5b3a18}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px}
.card{background:white;border:1px solid var(--line);border-radius:6px;padding:12px;display:flex;flex-direction:column}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:6px}.duo figure{margin:0}.duo img{width:100%;aspect-ratio:72/52;background:#e9e1cf;border-radius:4px;display:block}
figcaption{font-size:12px;color:var(--muted);text-align:center}.card h3{margin:10px 0 2px}.tag{background:#17110c;color:#f0c56a;border-radius:3px;padding:0 6px;font:600 13px ui-monospace,Consolas,monospace}
.tagline{color:var(--muted);margin:0 0 6px;font-style:italic}.chips{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}.chip{font-size:11.5px;border-radius:10px;padding:1px 8px;border:1px solid}
.chip.s-pass{border-color:var(--pass);color:var(--pass)}.chip.s-flag{border-color:var(--flag);color:var(--flag)}.chip.s-fail{border-color:var(--fail);color:var(--fail)}
.counts{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:8px 0}.counts div{background:#f6efdf;border-radius:4px;padding:4px;text-align:center}.counts dt{font-size:10.5px;color:var(--muted)}.counts dd{margin:0;font:700 18px Georgia,serif}
button.open{margin-top:auto;background:#6b3f1d;color:#fff4dc;border:0;border-radius:4px;padding:8px;font-weight:600;cursor:pointer}button.open:hover{background:#8a5226}
.toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-bottom:10px}label{font-size:12.5px;color:var(--muted);display:grid;gap:3px}label.inline{display:flex;align-items:center;gap:6px}
select{font:14px "Segoe UI",sans-serif;padding:6px 8px;border:1px solid #bba77f;border-radius:4px;background:white;color:var(--ink);max-width:100%}
.workspace{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:14px}#scene{position:relative;height:640px;background:#f4efe3;border:1px solid var(--line);border-radius:4px;overflow:hidden}#scene canvas{width:100%;height:100%;display:block;touch-action:none}
#status{position:absolute;left:10px;bottom:8px;font-size:12px;background:#fbf6eaE6;padding:3px 7px;border-radius:3px;color:var(--muted);pointer-events:none}
.panel{max-height:640px;overflow:auto;padding-right:4px}.panel p{margin:4px 0 8px}.checks{list-style:none;padding:0;margin:0}.checks li{display:grid;grid-template-columns:44px 1fr;gap:8px;padding:6px 0;border-bottom:1px solid #eadfc6;font-size:13px}
.checks b{font-size:11px;border-radius:3px;text-align:center;color:white;height:18px;line-height:18px}.c-pass b{background:var(--pass)}.c-flag b{background:var(--flag)}.c-fail b{background:var(--fail)}.c-info b{background:#6b7c8f}
span.c-fail{color:var(--fail)}span.c-flag{color:var(--flag)}
table{border-collapse:collapse;width:100%;font-size:13.5px;background:white}table.wide{display:block;overflow-x:auto;max-width:100%}th,td{border:1px solid var(--line);padding:5px 7px;text-align:left;vertical-align:top}thead th{background:#ecdfc1}
td.s-pass{background:#e3f4e8}td.s-flag{background:#fbefd6}td.s-fail{background:#f8dedb}td.none{color:#b3a58b;text-align:center}td a{color:inherit;font-weight:600}
.compare{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}.cmp{margin:0;background:white;border:1px solid var(--line);border-radius:4px;padding:6px}.cmp img{width:100%;display:block;border-radius:3px}.cmp figcaption{text-align:left;font-size:12.5px;color:var(--ink)}
.missing{color:var(--muted);font-style:italic}.minor{font-size:12.5px;color:var(--muted)}.legend span{display:inline-block;margin-right:12px;font-size:12.5px}.legend i{display:inline-block;width:12px;height:12px;border-radius:2px;margin-right:4px;vertical-align:-1px}
.kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}.kv div{background:white;border:1px solid var(--line);border-radius:4px;padding:8px 10px}.kv strong{display:block;font:700 15px Georgia,serif;color:#5b3a18}
ol.rec li{margin-bottom:6px}
.sides{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:14px}.sides figure{margin:0;background:white;border:1px solid var(--line);border-radius:4px;padding:8px}
svg.side{width:100%;height:auto;display:block;background:#fbf8f0}svg.side text{font:34px "Segoe UI",sans-serif;fill:#5b4630}
svg.side .goal{fill:#d9cdb4;stroke:#7a6443;stroke-width:4}svg.side .throat{stroke:#18a058;stroke-width:14}svg.side .limit{stroke:#c0392b;stroke-width:4;stroke-dasharray:22 14}svg.side .ground{stroke:#3b2a18;stroke-width:6}
svg.side .keep{fill:#cdd3d8;fill-opacity:.6;stroke:#8a949c;stroke-width:3;stroke-dasharray:10 8}svg.side .frame{fill:#9aa7b0}svg.side .bumper{fill:#d62828;fill-opacity:.85}svg.side .rail{stroke:#5f7fa3;stroke-width:22;stroke-linecap:round;opacity:.7}svg.side .joint{fill:#3a3f46}
svg.side polygon,svg.side circle{stroke-width:5;fill-opacity:.22}svg.side line.arm{stroke-width:14;stroke-linecap:round}
.p0{fill:#8a949c;stroke:#6b7780}.p1{fill:#3fae5a;stroke:#2f8a45}.p2{fill:#e07b1f;stroke:#b85d10}.p3{fill:#1d4ed8;stroke:#1d3faa}.p4{fill:#9b3fb5;stroke:#7a2f90}.legend i.p0{background:#8a949c}.legend i.p1{background:#3fae5a}.legend i.p2{background:#e07b1f}.legend i.p3{background:#1d4ed8}.legend i.p4{background:#9b3fb5}
tr.chosen th,tr.chosen td{font-weight:700}
@media (max-width:980px){.workspace{grid-template-columns:1fr}#scene{height:480px}.panel{max-height:none}}
</style></head><body>
<header><h1>Steampunk SKYFORGE / Crayola robot concepts</h1><p>Eight archetypes built from the v0.1 manual and the supplied 3D field. They are static pose studies plus 2D side-view searches: no CAD kernel, no Onshape API calls, no physical test.</p>
<nav><a href="#concepts">Concepts</a><a href="#arm">Arm verdict</a><a href="#dunk">Dunk verdict</a><a href="#analysis">Game analysis</a><a href="#viewer">3D task viewer</a><a href="#compare">Same-target comparison</a><a href="#matrix">Capability matrix</a></nav></header>
<main>
<section id="concepts"><h2>Eight concepts, collapsed and working</h2>
<p>Each card shows one start configuration and one working configuration of the same robot. Task chips are coloured by the worst static check across that task's phases: green passes, amber passes with a warning, red fails.</p>
<div class="legend"><span><i style="background:#3fae5a"></i>compliant rollers</span><span><i style="background:#d9a441"></i>flywheels / barrel</span><span><i style="background:#9b6bd1"></i>rail hooks</span><span><i style="background:#2a9d8f"></i>goal fork</span><span><i style="background:#5f7fa3"></i>elevator rails</span><span><i style="background:#c26a3d"></i>carriage / trapdoor</span><span><i style="background:#cdd3d8"></i>reserved volume (not a mechanism)</span></div>
<div class="grid" id="concept-grid"></div></section>

<section id="arm"><h2>Arm verdict: levels 1-2 + VERTICAL GOAL with a high-pivot arm dropping 4 cubes</h2>
${armSection()}
</section>

<section id="dunk"><h2>Dunk verdict: shoot and dunk at GOAL 2 / GOAL 3 with downward force</h2>
${dunkSection()}
</section>

<section id="analysis"><h2>Game analysis: what makes a robot dominant when it is not executed perfectly</h2>
<div class="kv">
<div><strong>Cube supply is finite</strong>Each alliance has about 61 cubes: 32 on its half, 26 in reserve and 3 preloads. Only the 14 centre-line cubes and the 4 beside IP-C are really contested. Elite alliances run out of cubes, so points per cube count, not just cycles.</div>
<div><strong>Value of a full 4-cube trip</strong>GOAL 1: 8. GOAL 2: 12. VERTICAL GOAL: 16. GOAL 3: 20. The VERTICAL GOAL and GOAL 3 are both at the far end, so the trip is the same length.</div>
<div><strong>Forgiveness is not equal</strong>The hexagon is 30 in across the flats for a 9 in cube, giving about +/-266 mm of lateral margin. A THROAT is 11 in, giving +/-25 mm and +/-14.8 deg of yaw. There is only one GOAL 3, and a cube that jams in it blocks it (your simulator models a 12% jam chance per miss).</div>
<div><strong>Reach budget at a HORIZONTAL GOAL</strong>Every goal backs onto a wall, so the throat centre is 12 in from the only face you can touch. With the bumper on that face the cube centre is 15.25 in outside the frame. That leaves 2.75 in (70 mm) of mechanism inside the 18 in limit: a placer needs a hard-stopped reach, not a long arm.</div>
<div><strong>Height ladder</strong>42 in at the start, 32 in under the boards, 48 in inside the opponent LAUNCH ZONE, 78 in maximum. A steep shot whose underside is above 48 in by the time it clears your bumper cannot be touched by a legal defender.</div>
<div><strong>Endgame is cheap</strong>The rail top is at 33.8 in, so a robot only has to lift about 2 in to get off the carpet. A robot under 30 in can straddle the rail with its centre of mass underneath. HANG is worth 10 points, the same as 2.5 VERTICAL GOAL cubes.</div>
</div>
<h3>Design principles used for every concept</h3>
<ul><li><b>Choose big targets:</b> the VERTICAL GOAL before horizontal throats.</li><li><b>Let contact do the aiming:</b> bumper on a field face (blue GOAL 1 as a fender, goal faces as depth stops), a fork that straddles the 24 in goal base, drawers that run to a hard stop.</li><li><b>Carry 4 cubes</b> for the far end and keep one piece path (one handoff per cycle).</li><li><b>Stay under 32 in when stowed</b> where the architecture allows it: the under-board lane, 4 short-only cubes and UNDER as an endgame fallback.</li></ul>
<h3>Why the fixed hoods are 72 deg (SF2) and 60 deg (SF4)</h3>
<p>Speed tolerance: the percentage of nominal speed that still scores. Drag-free, non-rotating cube; <sup>b</sup> means a legal 48 in defender pressed against our bumper could touch the shot.</p>
<table class="scan wide"><thead><tr><th>Hood angle (deg)</th>${Array.from({ length: 11 }, (_, index) => `<th>${56 + 2 * index}</th>`).join('')}</tr></thead><tbody>${scanTable}</tbody></table>
<p class="minor">The fixed mortar is a fender specialist: from contact it keeps ${band('SF2', 'vgFender')} speed tolerance at ${MORTAR_ANGLE} deg, but from the 1.6 m zone spot only ${band('SF2', 'vgZone')}. SF1's pivot keeps ${band('SF1', 'vgFender')} at the fender and ${band('SF1', 'vgZone')} at the zone spot. SF4 raises a ${KICKER_ANGLE} deg kicker on its elevator and gets ${band('SF4', 'vgZone')}.</p>
<h3>Recommendation (hypothesis, not a result)</h3>
${recommendation()}
${simSection}
</section>

<section id="viewer"><h2>3D task viewer (red alliance, supplied field mesh)</h2>
<div class="toolbar"><label>Concept<select id="robot"></select></label><label>Task<select id="task"></select></label><label>Phase<select id="phase"></select></label>
<label>Camera<select id="view"><option value="task">Task view</option><option value="iso">Robot isometric</option><option value="side">Robot side</option><option value="front">Robot front</option><option value="rear">Robot rear</option><option value="top">Robot top</option></select></label>
<label class="inline"><input type="checkbox" id="field" checked>Field</label><label class="inline"><input type="checkbox" id="aids" checked>Trajectory / target aids</label></div>
<div class="workspace"><div id="scene"><div id="status"></div></div>
<aside class="panel"><h3 id="p-title"></h3><p id="p-tagline" class="tagline"></p><p id="p-role"></p><p id="p-heights" class="minor"></p><p id="p-why"></p>
<h3 id="p-task"></h3><p id="p-task-note" class="minor"></p><ul class="checks" id="p-checks"></ul>
<h3>Complexity register</h3><table id="p-complexity"></table><h3>Open risks</h3><ul id="p-risks"></ul></aside></div>
<p class="minor">Only tasks a concept is designed for are offered. Phases are separate snapshots (approach, engage or aim, release), each showing one physical configuration. Trajectories are drag-free sketches. The checks cover static rules and geometry for this pose only: not continuous motion, contact forces, stability, structure or real cube flight.</p></section>

<section id="compare"><h2>Same target, same phase, same camera</h2>
<div class="toolbar"><label>Task<select id="c-task"></select></label><label>Phase<select id="c-phase"></select></label></div>
<div class="compare" id="compare-grid"></div></section>

<section id="matrix"><h2>Capability matrix</h2>
<table class="wide"><thead><tr><th>Concept</th>${taskColumns.map(task => `<th>${esc(TASKS[task].name)}</th>`).join('')}</tr></thead>
<tbody>${CONCEPTS.map(item => `<tr><th>${item.id} ${esc(item.name)}</th>${taskColumns.map(task => cell(item.id, task)).join('')}</tr>`).join('')}</tbody></table>
<p class="minor">yes* = passes with a warning (tight margin, aim or COM assumption). Click a cell to open that task. Complete check list: <a href="checks.json">checks.json</a>. Sources and hashes: <a href="manifest.json">manifest.json</a>.</p></section>
</main>
<script>window.SKYFORGE_SUMMARY=${JSON.stringify(summary)};</script>
<script src="field.js"></script><script src="app.js"></script>
</body></html>`;
await writeFile(new URL('index.html', output), html);

const counts = results.flatMap(row => row.tasks.filter(entry => entry.supported).flatMap(entry => entry.phases.flatMap(phase => phase.checks.map(check => check.status))));
const manifest = {
  status: 'CRAYOLA_CONCEPTS_STATIC_POSE_CHECKS',
  generated: new Date().toISOString(),
  sources: {
    fieldHtml: { path: fieldHtmlPath, sha256: sha(fieldHtml), use: 'field mesh (parts, colours) re-used verbatim, vertices rounded to 0.1 mm' },
    manual: existsSync(manualPath) ? { path: manualPath, sha256: sha(await readFile(manualPath)), use: 'all rule and field datums in field.mjs' } : null,
    simulator: sim ? sim.source : null,
  },
  concepts: CONCEPTS.map(item => ({ id: item.id, name: item.name, tasks: item.tasks, complexity: item.complexity })),
  checkCounts: { pass: counts.filter(s => s === 'pass').length, flag: counts.filter(s => s === 'flag').length, fail: counts.filter(s => s === 'fail').length, info: counts.filter(s => s === 'info').length },
  hoodScan: scanRows,
  bundleSha256: sha(appBytes), fieldJsSha256: sha(fieldJs), engine: 'three 0.180.0 + esbuild 0.25.10',
  notProven: ['continuous motion or sweep clearance', 'contact forces, compression, traction', 'real cube flight (drag, tumble, spin)', 'structure, loads, hang retention', 'cycle times or match performance'],
  apiCalls: 0, cadKernelRuns: 0,
};
await writeFile(new URL('manifest.json', output), `${JSON.stringify(manifest, null, 1)}\n`);
console.log(`Built outputs/skyforge: ${CONCEPTS.length} concepts, ${counts.length} checks (${manifest.checkCounts.fail} fail, ${manifest.checkCounts.flag} flag); field ${parts.length} parts; bundle ${(appBytes.length / 1024).toFixed(0)} KiB.`);
