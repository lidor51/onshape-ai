import assert from 'node:assert/strict';
import test from 'node:test';
import {access} from 'node:fs/promises';
import {renderConceptHome} from './home.mjs';
import {robotCatalogue} from './task-contract.mjs';

test('robot homepage previews all ten concepts and links each to its dedicated viewer',async()=>{
  const html=renderConceptHome(robotCatalogue);
  assert.equal([...html.matchAll(/class="concept"/g)].length,10);
  assert.ok(!html.includes('id="scene"'),'home must not start inside the task viewer');
  assert.ok(html.includes('.concept img{width:100%;height:auto;aspect-ratio:1.3;'),'preview height must scale with its tile');
  for(const robot of robotCatalogue){
    assert.ok(html.includes(`href="viewer.html?robot=${robot.id}"`));
    assert.ok(html.includes(`src="robot-${robot.id}.png"`));
    await access(new URL(`../../../outputs/whole-robots/mechanisms/robot-${robot.id}.png`,import.meta.url));
  }
  assert.ok(html.includes("location.replace('viewer.html'+location.search+location.hash)"),'preserve legacy deep links');
});