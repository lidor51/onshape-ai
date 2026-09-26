import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateConcept } from './validate.mjs';

const root = new URL('./', import.meta.url);
const output = new URL('../../../outputs/concepts/', root);
const colors = { ink: '#202d2b', muted: '#62726c', guide: '#287b8a', guideFill: '#dceef0', link: '#337cbe', roller: '#177855', rollerFill: '#d9ece1', coral: '#df9e27', receiver: '#865196', reference: '#e9edeb', bumper: '#e9c9c5', danger: '#a33830', path: '#a46b11' };
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x, y, value, size = 18, fill = colors.ink, weight = 400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(value)}</text>`;
const rect = (x, y, width, height, fill, stroke = 'none', extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, width = 2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;

function wrap(value, width) {
  const rows = [];
  for (const word of value.split(/\s+/)) {
    if (!rows.length || rows.at(-1).length + word.length + 1 > width) rows.push(word);
    else rows[rows.length - 1] += ` ${word}`;
  }
  return rows;
}

function paragraph(x, y, value, width = 55, size = 18, fill = colors.ink) {
  return wrap(value, width).map((row, index) => text(x, y + index * (size + 7), row, size, fill)).join('');
}

function poly(points, transform, stroke, width = 3, fill = 'none', extra = '') {
  const coordinates = points.map(point => transform(point).map(value => value.toFixed(2)).join(',')).join(' ');
  return `<polyline points="${coordinates}" stroke="${stroke}" stroke-width="${width}" fill="${fill}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}

function dot(point, transform, label, fill = colors.path) {
  const [x, y] = transform(point);
  return `<circle cx="${x}" cy="${y}" r="10" fill="white" stroke="${fill}" stroke-width="2"/>${text(x + 15, y - 10, label, 15, fill, 600)}`;
}

function bodyProjection(concept, transform, scale, view) {
  const center = concept[view].receiver.center;
  const [x, y] = transform(center);
  const width = 114.3 * scale;
  const length = 301.625 * scale;
  if (view === 'plan') {
    return `<g transform="translate(${x},${y}) rotate(${-concept.plan.coralYawDeg})">${rect(-width / 2, -length / 2, width, length, '#f9e5ba', colors.coral, 'stroke-width="2" rx="7"')}${line(0, -length / 2 + 8, 0, length / 2 - 8, colors.coral, 1, 'stroke-dasharray="6 4"')}</g>`;
  }
  const yaw = concept.plan.coralYawDeg * Math.PI / 180;
  const projectedLength = (301.625 * Math.abs(Math.cos(yaw)) + 114.3 * Math.abs(Math.sin(yaw))) * scale;
  return rect(x - projectedLength / 2, y - width / 2, projectedLength, width, '#f9e5ba', colors.coral, 'stroke-width="2" rx="8"');
}

function views(concept) {
  const sideScale = 0.65;
  const planScale = 0.38;
  const side = ([longitudinal, height]) => [66 + (longitudinal + 480) * sideScale, 662 - height * sideScale];
  const plan = ([across, longitudinal]) => [1010 + (across + 650) * planScale, 182 + (longitudinal + 480) * planScale];
  const output = [];
  output.push(text(54, 161, concept.bumperOpening ? 'CENTER SECTION / THROUGH OPENING' : 'SIDE / FLOOR TO HANDOFF', 18, colors.ink, 650));
  output.push(text(1008, 161, 'TOP / ORIENTATION & PACKAGING', 18, colors.ink, 650));
  output.push(rect(48, 174, 900, 528, '#fbfcfb', '#d8dfdb'));
  output.push(rect(997, 174, 550, 528, '#fbfcfb', '#d8dfdb'));
  for (let height = 0; height <= 600; height += 100) {
    const first = side([-460, height]);
    const last = side([740, height]);
    output.push(line(...first, ...last, '#e5eae7', 1));
    output.push(text(54, first[1] - 4, `${height}`, 12, colors.muted));
  }
  for (let longitudinal = -400; longitudinal <= 700; longitudinal += 100) {
    output.push(line(...side([longitudinal, 0]), ...side([longitudinal, 650]), '#eef1ef', 1));
  }
  const frameStart = concept.bumperOpening?.recessDepthMm ?? 0;
  output.push(poly([[frameStart,70],[760,70],[760,120],[frameStart,120],[frameStart,70]], side, '#b1bcb5', 1.5, colors.reference));
  output.push(poly([[-85,45],[0,45],[0,165],[-85,165],[-85,45]], side, '#c98981', 2,
    concept.bumperOpening ? 'none' : colors.bumper, concept.bumperOpening ? 'id="removed-bumper-section" stroke-dasharray="5 5"' : ''));
  output.push(poly([[-480,0],[760,0]], side, colors.ink, 2));
  output.push(poly([[-457.2,0],[-457.2,620]], side, colors.danger, 1, 'none', 'stroke-dasharray="5 5"'));
  output.push(text(92, 195, 'front extension guide', 13, colors.danger));
  output.push(text(...side([concept.bumperOpening ? 370 : 70,30]), 'front perimeter y=0 / ground z=0', 13, colors.muted));
  output.push(poly([[-435,-85],[435,-85],[435,845],[-435,845],[-435,-85]], plan, '#c98981', 1.5, colors.bumper));
  output.push(poly([[-350,0],[350,0],[350,760],[-350,760],[-350,0]], plan, '#b1bcb5', 1.5, '#f5f7f5'));
  if (concept.bumperOpening) {
    const halfWidth = concept.bumperOpening.widthMm / 2;
    const depth = concept.bumperOpening.recessDepthMm;
    output.push(poly([[-halfWidth,-85],[halfWidth,-85],[halfWidth,depth],[-halfWidth,depth],[-halfWidth,-85]], plan,
      colors.danger, 1.5, '#fbfcfb', 'id="front-bumper-opening" stroke-dasharray="5 4"'));
    output.push(paragraph(420, 247, 'Dashed red: removed center bumper. Side bumpers remain; not 2025 legal.', 48, 16, colors.danger));
  }
  output.push(text(...plan([-285,concept.id === '11' ? 750 : 700]), 'blank chassis', 14, colors.muted));
  output.push(poly([[-435,-457.2],[435,-457.2]], plan, colors.danger, 1, 'none', 'stroke-dasharray="5 5"'));
  for (const [name, transform, scale] of [['side', side, sideScale], ['plan', plan, planScale]]) {
    const geometry = concept[name];
    for (const guide of geometry.guides) {
      if (/ground reference|chassis reference|bumper.*reference|extension guide|coral axis|chassis perimeter|inner bumper reference/i.test(guide.label)) continue;
      const closed = guide.points.length > 2 && JSON.stringify(guide.points[0]) === JSON.stringify(guide.points.at(-1));
      const coralReference = guide.label.startsWith('CORAL reference:');
      const outlineOnly = Number(concept.id) > 10 && /envelope|optical plane|access|datum|beam across/i.test(guide.label);
      const guideStroke = guide.rotation === 'locked' ? colors.muted : guide.rotation === 'driven' ? colors.roller : colors.guide;
      const guideFill = guide.rotation === 'locked' ? colors.reference : guide.rotation === 'driven' ? colors.rollerFill : colors.guideFill;
      output.push(poly(guide.points, transform, coralReference ? colors.coral : guideStroke, 3,
        closed && !coralReference && !outlineOnly ? guideFill : 'none',
        outlineOnly ? 'opacity="0.7" stroke-dasharray="5 4"' : 'opacity="0.9"'));
    }
    if (name === 'side') {
      for (const link of geometry.links) output.push(poly(link.points, transform, colors.link, 5, 'none', 'opacity="0.85"'));
      for (const ghost of geometry.ghost) output.push(poly(ghost, transform, colors.link, 2, 'none', 'stroke-dasharray="8 6" opacity="0.65"'));
      if (geometry.pivot) {
        const [x, y] = transform(geometry.pivot);
        output.push(`<circle cx="${x}" cy="${y}" r="7" fill="white" stroke="${colors.link}" stroke-width="3"/>`);
        output.push(line(x - 11, y, x + 11, y, colors.link, 1), line(x, y - 11, x, y + 11, colors.link, 1));
      }
    } else {
      output.push(poly(geometry.movingOutline, transform, colors.link, 2, 'none', 'stroke-dasharray="8 5"'));
    }
    for (const [index, roller] of geometry.rollers.entries()) {
      const [x, y] = transform(roller.center);
      if (roller.rotation === 'locked') {
        output.push(`<g data-contact="locked"><circle cx="${x}" cy="${y}" r="${roller.radius * scale}" fill="${colors.reference}" stroke="${colors.muted}" stroke-width="3"/>`);
        output.push(line(x - 6, y - 6, x + 6, y + 6, colors.muted, 2), line(x - 6, y + 6, x + 6, y - 6, colors.muted, 2));
        output.push(text(x - roller.radius * scale - 65, y + 17, 'LOCKED', 13, colors.muted, 600), '</g>');
        continue;
      }
      output.push(`<circle cx="${x}" cy="${y}" r="${roller.radius * scale}" fill="${colors.rollerFill}" stroke="${colors.roller}" stroke-width="3"/>`);
      output.push(`<circle cx="${x}" cy="${y}" r="3" fill="${colors.roller}"/>`);
      if (name === 'side') output.push(text(x + roller.radius * scale + 4, y - 6, `R${index + 1}`, 13, colors.roller, 600));
    }
    output.push(poly(geometry.path, transform, colors.path, 3.5, 'none', `stroke-dasharray="9 4" marker-end="url(#arrow${concept.id})"`));
    output.push(dot(geometry.path[0], transform, name === 'side' && concept.id === '07' ? 'side pickup' : 'pickup'));
    const [receiveX, receiveY] = transform(geometry.receiver.center);
    output.push(rect(receiveX - 52, receiveY - 42, 104, 84, concept.id === '14' ? 'none' : '#f0e6f3', colors.receiver, 'stroke-width="2" stroke-dasharray="5 4" rx="4"'));
    output.push(bodyProjection(concept, transform, scale, name));
    output.push(text(receiveX + (concept.id === '14' && name === 'side' ? 67 : -45), receiveY + (name === 'plan' && concept.plan.coralYawDeg === 0 ? 74 : 58), 'HANDOFF', 13, colors.receiver, 650));
    if (Number(concept.id) > 10) {
      for (const label of geometry.labels) output.push(text(...transform(label.at), label.text, name === 'side' ? 16 : 12, colors.muted));
    }
  }
  if (concept.id === '07') output.push(paragraph(94, 267, 'Side entry: floor lift appears vertical here; use top view for travel.', 42, 17, colors.receiver));
  output.push(line(765, 678, 765 + 100 * sideScale, 678, colors.ink, 3), text(758, 696, '100 mm', 13));
  output.push(line(1450, 678, 1450 + 100 * planScale, 678, colors.ink, 3), text(1448, 696, '100 mm', 13));
  output.push(text(54, 727, `Mouth intent ${concept.mouthWidthMm} mm  |  Handoff y ${concept.side.receiver.center[0].toFixed(0)} / z ${concept.side.receiver.center[1].toFixed(0)} mm  |  Coral ${concept.plan.coralYawDeg === 90 ? 'crosswise' : 'lengthwise'}`, 19, colors.ink, 600));
  return output.join('');
}

export function renderSheet(concept) {
  const legend = [
    [colors.guide, 'guides / support'], [colors.roller, 'powered contacts'], [colors.link, 'moving structure'],
    [colors.path, 'proposed coral path'], [colors.receiver, 'receiver'], [colors.danger, 'bumper / limit'],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1030" viewBox="0 0 1600 1030" role="img" aria-labelledby="title${concept.id}">
<title id="title${concept.id}">${esc(concept.id)} ${esc(concept.title)}: approximate concept geometry, untested</title>
<defs><marker id="arrow${concept.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${colors.path}"/></marker></defs>
${rect(0,0,1600,1030,'#fff')}
<g font-family="'Aptos','Segoe UI',sans-serif" letter-spacing="0">
${rect(0,0,14,1030,colors.link)}${text(48,58,concept.id,40,colors.link,700)}${text(126,57,concept.title,34,colors.ink,650)}
${text(48,93,concept.family,20,colors.muted)}${text(48,126,`STAGE 2 / CONCEPT ONLY / ${concept.notice ?? 'approximate mm / not proven geometry or performance'}`,16,colors.danger,600)}
${views(concept)}
${line(48,748,1545,748,'#d8dfdb',1)}
${text(48,782,'WHY CONSIDER IT',15,colors.roller,700)}${paragraph(48,812,concept.advantage,48,19)}
${text(557,782,'MAIN RISK',15,colors.danger,700)}${paragraph(557,812,concept.risk,46,19)}
${text(1051,782,'FIRST CHEAP TEST',15,colors.receiver,700)}${paragraph(1051,812,concept.firstTest,45,19)}
${text(48,935,`Complexity estimate: ${concept.complexity.toUpperCase()}  |  Contact, yaw, retention, stow and drives remain untested.`,17,colors.muted)}
${legend.map(([color,label],index)=>`${line(48+index*251,973,76+index*251,973,color,4)}${text(85+index*251,979,label,15,colors.muted)}`).join('')}
${text(48,1010,'Actual-size nominal coral is shown at handoff. Dashed blue outlines are pose proposals, not checked sweeps. Same scales on every sheet.',15,colors.muted)}
</g></svg>`;
}

const concepts = (await Promise.all(['family-a.json', 'family-b.json', 'family-c.json', 'concept-11.json', 'concept-12.json', 'concept-13.json', 'concept-14.json'].map(async name => JSON.parse(await readFile(new URL(name, root), 'utf8')))))
  .flat().map(validateConcept).sort((first, second) => first.id.localeCompare(second.id));
assert.deepEqual(concepts.map(concept => concept.id), Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0')));
await mkdir(output, { recursive: true });
const files = [];
for (const concept of concepts) {
  const content = renderSheet(concept);
  const name = `concept-${concept.id}.svg`;
  await writeFile(new URL(name, output), content);
  await writeFile(new URL(`concept-${concept.id}.html`, output), `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(concept.id)} ${esc(concept.title)}</title><style>html,body{margin:0;background:white}svg{display:block;width:1600px;height:1030px}</style><body>${content}</body></html>`);
  files.push({ id: concept.id, file: name, sha256: createHash('sha256').update(content).digest('hex') });
}
const overviewSize = { width: 2000, height: 145 + Math.ceil(concepts.length / 2) * 683 };
const overview = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${overviewSize.width}" height="${overviewSize.height}" viewBox="0 0 ${overviewSize.width} ${overviewSize.height}">
<rect width="${overviewSize.width}" height="${overviewSize.height}" fill="#eef2ef"/><g font-family="'Aptos','Segoe UI',sans-serif" fill="${colors.ink}">
${text(45,58,`CORAL INTAKE / ${concepts.length} CONCEPTS`,34,colors.ink,700)}${text(45,92,'Select an architecture before detailed CAD. All proposals are untested; same view scales on every sheet.',21,colors.muted)}
${concepts.map((concept,index)=>{
  const x = 32 + (index % 2) * 990;
  const y = 125 + Math.floor(index / 2) * 683;
  const svg = renderSheet(concept);
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<g transform="translate(${x},${y}) scale(0.59875)">${inner}</g>${paragraph(x+8,y+641,`${concept.id}  ${concept.summary.replace(/ UNTESTED.*$/, '')}`,100,17,colors.ink)}`;
}).join('')}</g></svg>`;
await writeFile(new URL('overview.svg', output), overview);
await writeFile(new URL('overview.html', output), `<!doctype html><html lang="en"><meta charset="utf-8"><title>${concepts.length} coral intake concepts</title><style>html,body{margin:0}svg{display:block;width:${overviewSize.width}px;height:${overviewSize.height}px}</style><body>${overview}</body></html>`);
await writeFile(new URL('concepts.json', output), `${JSON.stringify(concepts, null, 2)}\n`);
await writeFile(new URL('manifest.json', output), `${JSON.stringify({ stage: 2, apiCalls: 0, cadKernelRuns: 0, conceptCount: concepts.length, overviewSize, status: 'UNTESTED_CONCEPT_PREVIEWS', files }, null, 2)}\n`);
const gallery = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Coral intake concepts</title>
<style>:root{--ink:#202d2b;--muted:#52665c;--line:#cbd7ce;--accent:#287b8a}*{box-sizing:border-box}body{margin:0;background:#f3f6f3;color:var(--ink);font-family:Georgia,serif;letter-spacing:0}header{padding:24px 28px;border-bottom:1px solid var(--line);background:#fff}h1{font-size:28px;margin:0 0 8px}p{margin:5px 0;line-height:1.5}nav{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}a{color:#1c6472}main{max-width:1660px;margin:auto;padding:20px}section{padding:24px 0 32px;border-bottom:1px solid var(--line)}h2{font-size:24px;margin:0 0 12px}img{width:100%;height:auto;display:block;background:white}details{margin:12px 0}summary{cursor:pointer;color:var(--accent);font-weight:bold}footer{padding:24px 28px}@media(max-width:600px){header{padding:18px}main{padding:10px}h1{font-size:24px}nav{gap:16px}h2{font-size:21px}}@media print{header nav,details{display:none}section{break-after:page}main{padding:0}h2{font-size:18px}}</style>
<header><h1>Coral Intake: ${concepts.length} Concepts</h1><p>2025 / blank chassis / metric-first / concept selection</p><p><a href="mechanisms/index.html">3D intake mockups: open, collapsed and handoff</a> | Original 2D paths remain below.</p><p>Approximate geometry. No acquisition, motion, manufacturing or rules-compliance pass. Option 12 conflicts with the 2025 bumper rules.</p><nav>${concepts.map(concept=>`<a href="#concept-${concept.id}">${concept.id} ${esc(concept.title)}</a>`).join('')}</nav></header>
<main>${concepts.map(concept=>`<section id="concept-${concept.id}"><h2>${concept.id} / ${esc(concept.title)}</h2><a href="concept-${concept.id}.png"><img src="concept-${concept.id}.png" alt="${esc(concept.title)} side and top concept drawing" width="1600" height="1030"></a><p>${esc(concept.summary)}</p><details><summary>Assumptions and reference</summary><p>${esc(concept.inspiration)}</p><p>${esc(concept.states)}</p></details></section>`).join('')}</main><footer><a href="overview.png">All ${concepts.length} concepts</a> · <a href="concepts.json">Dimensioned concept data</a></footer></html>`;
await writeFile(new URL('index.html', output), gallery);
console.log(`Generated ${concepts.length} SVG concept sheets, overview, dimensioned data, manifest and local HTML gallery. Zero CAD kernel or API calls.`);