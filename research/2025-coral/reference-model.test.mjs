import test from 'node:test';
import assert from 'node:assert/strict';
import {placedParts,sourceFrame} from './reference-model.mjs';

test('source occurrences resolve by complete native path and do not double-compose world transforms',()=>{
  const matrix=[1,0,0,0.4,0,1,0,0.5,0,0,1,0.6,0,0,0,1];
  const definition={rootAssembly:{elementId:'root',instances:[{id:'index',type:'Assembly',elementId:'befa12a91dd2f83dec7fac8c',name:'indexer'}],occurrences:[{path:['index','wheel'],transform:matrix,hidden:false}]},subAssemblies:[{elementId:'befa12a91dd2f83dec7fac8c',instances:[{id:'wheel',type:'Part',partId:'source-wheel',name:'wheel'}]}]};
  const result=placedParts(definition,new Set(['source-wheel']));
  assert.equal(result.length,1);assert.equal(result[0].group,'indexer');assert.deepEqual(result[0].transform,matrix);
  assert.equal(placedParts(definition,new Set()).length,0);
  definition.rootAssembly.occurrences[0].hidden=true;assert.equal(placedParts(definition,new Set(['source-wheel'])).length,0);
});

test('vacuum receiver is retained as a separate source group',()=>{
  const matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  const definition={rootAssembly:{elementId:'root',instances:[{id:'receiver',type:'Assembly',elementId:'4711e6fc676ebb7fceb3e769',name:'receiver'}],occurrences:[{path:['receiver','cup'],transform:matrix}]},subAssemblies:[{elementId:'4711e6fc676ebb7fceb3e769',instances:[{id:'cup',type:'Part',partId:'cup',name:'vacuum cup'}]}]};
  assert.equal(placedParts(definition,new Set(['cup']))[0].group,'receiver');
});

test('source view convention uses the chassis-grounded Y-up frame',()=>{
  assert.deepEqual(sourceFrame.up,[0,1,0]);assert.equal(sourceFrame.foreAftAxis,'Z');
  assert.ok(sourceFrame.evidenceParts.includes('KF3n'));
});