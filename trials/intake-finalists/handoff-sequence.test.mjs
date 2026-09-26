import assert from 'node:assert/strict';
import test from 'node:test';
import {liftAwaySequence} from './handoff-sequence.mjs';

test('receiver retains before carrier opens and lifts before return',()=>{
  for(let index=0;index<=1000;index++){
    const sequence=liftAwaySequence(index/1000);
    if(sequence.carrierReleased>0)assert.equal(sequence.receiverClosed,1);
    if(sequence.receiverLift>0)assert.equal(sequence.carrierReleased,1);
    if(sequence.carrierReturn>0)assert.equal(sequence.receiverLift,160);
    if(sequence.owner==='receiver')assert.equal(sequence.receiverClosed,1);
  }
  assert.equal(liftAwaySequence(0).owner,'carrier');
  assert.equal(liftAwaySequence(1).carrierReturn,1);
});

test('sequence is continuous at boundaries and rejects invalid progress',()=>{
  for(const progress of [0.2,0.4,0.65]){
    const before=liftAwaySequence(progress-1e-9);const after=liftAwaySequence(progress+1e-9);
    for(const key of ['receiverClosed','carrierReleased','receiverLift','carrierReturn'])assert.ok(Math.abs(after[key]-before[key])<0.00001);
  }
  assert.throws(()=>liftAwaySequence(NaN));assert.throws(()=>liftAwaySequence(1.1));assert.throws(()=>liftAwaySequence(0,{liftMm:0}));
});