import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Resvg} from '../../subsystem-ab/concepts/node_modules/@resvg/resvg-js/index.js';
import {recipes} from './models.mjs';

const output=new URL('../../../outputs/whole-robots/mechanisms/',import.meta.url);
const review=JSON.parse(await readFile(new URL('review.json',output),'utf8'));
const manifest=JSON.parse(await readFile(new URL('manifest.json',output),'utf8'));
const robots=(await Promise.all(['a','b','c','d'].map(async family=>JSON.parse(await readFile(new URL(`../robots-${family}.json`,import.meta.url),'utf8'))))).flat();
const images=[];const files=[];
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const recipe of recipes){
  for(const suffix of ['','-score']){
    const file=`robot-${recipe.id}${suffix}.png`;const bytes=await readFile(new URL(file,output));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.ok(bytes.length>20_000,'Unexpectedly empty preview');
    files.push({file,bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),sha256:createHash('sha256').update(bytes).digest('hex')});
    if(!suffix)images.push(bytes.toString('base64'));
  }
}
const overview=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2000" height="4440" viewBox="0 0 2000 4440"><rect width="2000" height="4440" fill="#f2f5f3"/><g font-family="'Segoe UI',sans-serif" fill="#263934"><text x="35" y="55" font-size="34" font-weight="700">REEFSCAPE / MECHANISM CONCEPTS</text><text x="35" y="91" font-size="20">Revision 2: recognizable mechanisms, one pose at a time. All architectures and dimensions remain untested.</text>${recipes.map((recipe,index)=>{const x=25+(index%2)*990;const y=125+Math.floor(index/2)*850;const robot=robots.find(robot=>robot.id===recipe.id);const assessment=review.robots.find(robot=>robot.id===recipe.id);return `<image x="${x}" y="${y}" width="950" height="735" xlink:href="data:image/png;base64,${images[index]}"/><text x="${x+15}" y="${y+768}" font-size="25" font-weight="650">${recipe.id} / ${esc(robot.title)}</text><text x="${x+15}" y="${y+803}" font-size="19">${assessment.tier.toUpperCase()} | ${assessment.complexity.positioningDofs} positioning DOFs* | coral/algae handoffs ${assessment.complexity.handoffsCoral}/${assessment.complexity.handoffsAlgae}</text>`;}).join('')}<text x="35" y="4407" font-size="17">* Recipe-level positioning subtotal, not complete actuator inventory. No verified contact, stow, motion, ballistics, stability or climb proof.</text></g></svg>`;
await writeFile(new URL('overview.svg',output),overview);
await writeFile(new URL('overview.png',output),new Resvg(overview,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'}}).render().asPng());
manifest.files=files;manifest.screenshotsVerified=true;manifest.exportMethod='Direct WebGL canvas PNG; browser checks separately recorded';
await writeFile(new URL('manifest.json',output),`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Finalized ${files.length} mechanism PNGs and overview; hashes recorded. No CAD or Onshape calls.`);