import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRobot } from './validate.mjs';

function fixture() {
  const component = { name: 'Envelope', role: 'electrical', center: [0,380,150], size: [100,200,100], state: 'base' };
  const link = { name: 'Link', role: 'structure', points: [[0,0,0],[0,0,500]], radius: 20, state: 'deployed' };
  return {
    id: 'R01', title: 'Fixture', family: 'Fixture', strategy: 'Intent', tradeoff: 'Unknown', firstTest: 'Test',
    capabilities: { coralLevels: [1,2,3,4], coralSources: ['station'], algaeSources: ['reefLow'], algaeDestinations: ['processor'], climb: 'deep', simultaneousCarry: false },
    subsystems: Object.fromEntries(['drive','coral','algae','climb','packaging','control','stow'].map(field => [field, 'Provisional'])),
    cycle: Object.fromEntries(['auto','coral','algae','endgame'].map(field => [field, 'Proposed'])),
    inspiration: [{ source: 'Fixture', lesson: 'Not evidence' }],
    geometry: { boxes: Array.from({ length: 4 }, () => structuredClone(component)), links: Array.from({ length: 3 }, () => structuredClone(link)),
      tools: Array.from({ length: 3 }, () => ({ ...structuredClone(component), role: 'coral' })),
      routes: ['coral','algae'].map(role => ({ name: 'Route', role, points: [[0,0,100],[0,0,1000]] })), annotations: [] },
  };
}

test('whole-robot contract retains both-piece strategy and shared 3D coordinates', () => {
  const robot = fixture();
  assert.equal(validateRobot(robot), robot);
  robot.geometry.tools[0].center[2] = NaN;
  assert.throws(() => validateRobot(robot), /finite 3D/);
});

test('contract rejects missing algae capability, battery space and invalid concept IDs', () => {
  const robot = fixture();
  assert.throws(() => validateRobot({ ...robot, id: 'R11' }));
  assert.throws(() => validateRobot({ ...robot, capabilities: { ...robot.capabilities, algaeDestinations: [] } }), /algae destinations/);
  robot.geometry.boxes.forEach(box => { box.role = 'structure'; });
  assert.throws(() => validateRobot(robot), /battery/);
});