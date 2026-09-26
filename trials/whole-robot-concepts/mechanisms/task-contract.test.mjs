import assert from 'node:assert/strict';
import test from 'node:test';
import {tasksForRobot,assertSupportedTask,robotCatalogue} from './task-contract.mjs';

test('task list follows each robot capability instead of universal generic poses',()=>{
  assert.ok(!tasksForRobot('R03').includes('coral-floor'));
  assert.ok(!tasksForRobot('R01').includes('net'));
  assert.ok(!tasksForRobot('R05').includes('algae-high'));
  assert.ok(!tasksForRobot('R07').includes('coral-l4'));
  assert.ok(!tasksForRobot('R08').includes('coral-l3'));
  assert.ok(tasksForRobot('R06').includes('park'));
  assert.ok(!tasksForRobot('R06').includes('climb'));
  assert.throws(()=>assertSupportedTask('R03','coral-floor'),/does not support/);
  for(const robot of robotCatalogue){
    const tasks=tasksForRobot(robot.id);
    assert.equal(tasks.length,new Set(tasks).size);
    for(const task of tasks)assert.doesNotThrow(()=>assertSupportedTask(robot.id,task));
  }
});