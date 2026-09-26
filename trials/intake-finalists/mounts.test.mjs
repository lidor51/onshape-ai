import assert from 'node:assert/strict';
import test from 'node:test';
import {placePoint,unplacePoint} from './mounts.mjs';

test('side mounting preserves local geometry, motion distances and exact coordinates',()=>{
  const first=[125,-320,80],second=[-135,260,315];
  const distance=(start,end)=>Math.hypot(...start.map((value,index)=>value-end[index]));
  for(const mount of ['front','left','right']){
    assert.deepEqual(unplacePoint(placePoint(first,mount),mount),first);
    assert.ok(Math.abs(distance(placePoint(first,mount),placePoint(second,mount))-distance(first,second))<1e-9);
  }
  assert.deepEqual(placePoint([0,-300,80],'left'),[-650,380,80]);
});