import assert from 'node:assert/strict';

const roles = ['structure', 'coral', 'algae', 'climb', 'electrical'];
const states = ['base', 'stowed', 'deployed'];

function point(value) {
  assert.ok(Array.isArray(value) && value.length === 3 && value.every(Number.isFinite), 'Expected finite 3D point');
}

function text(value, limit, label) {
  assert.ok(typeof value === 'string' && value.trim().length > 0 && value.length <= limit, `Invalid ${label}`);
}

function choices(value, allowed, label) {
  assert.ok(Array.isArray(value) && value.length > 0 && new Set(value).size === value.length && value.every(item => allowed.includes(item)), `Invalid ${label}`);
}

function component(value, allowedRoles) {
  text(value.name, 100, 'component name');
  assert.ok(allowedRoles.includes(value.role), 'Invalid component role');
  assert.ok(states.includes(value.state), 'Invalid component state');
  point(value.center);
  point(value.size);
  assert.ok(value.size.every(size => size > 0), 'Component size must be positive');
}

export function validateRobot(robot) {
  assert.match(robot.id, /^R(0[1-9]|10)$/);
  text(robot.title, 44, 'title');
  text(robot.family, 130, 'family');
  for (const field of ['strategy', 'tradeoff', 'firstTest']) text(robot[field], 240, field);
  const capabilities = robot.capabilities;
  choices(capabilities.coralLevels, [1,2,3,4], 'coral levels');
  choices(capabilities.coralSources, ['station', 'floor'], 'coral sources');
  choices(capabilities.algaeSources, ['reefLow', 'reefHigh', 'floor'], 'algae sources');
  choices(capabilities.algaeDestinations, ['processor', 'net'], 'algae destinations');
  assert.ok(['deep', 'shallow', 'park'].includes(capabilities.climb), 'Invalid climb intent');
  assert.equal(typeof capabilities.simultaneousCarry, 'boolean');
  for (const field of ['drive','coral','algae','climb','packaging','control','stow']) text(robot.subsystems[field], 480, field);
  for (const field of ['auto','coral','algae','endgame']) text(robot.cycle[field], 360, field);
  assert.ok(Array.isArray(robot.inspiration) && robot.inspiration.length > 0, 'Missing provenance');
  for (const entry of robot.inspiration) {
    text(entry.source, 500, 'source');
    text(entry.lesson, 700, 'lesson');
  }
  const geometry = robot.geometry;
  for (const [field, minimum] of [['boxes',4],['links',3],['tools',3],['routes',2],['annotations',0]]) {
    assert.ok(Array.isArray(geometry[field]) && geometry[field].length >= minimum, `Missing ${field}`);
  }
  for (const box of geometry.boxes) component(box, roles);
  for (const tool of geometry.tools) component(tool, ['coral','algae']);
  assert.ok(geometry.boxes.some(box => box.role === 'electrical'), 'Reserve battery/electrical volume');
  for (const field of ['links','routes']) {
    for (const item of geometry[field]) {
      text(item.name, 100, `${field} name`);
      assert.ok((field === 'links' ? roles : ['coral','algae']).includes(item.role));
      assert.ok(item.points.length >= 2, 'Need connected polyline');
      item.points.forEach(point);
      if (field === 'links') {
        assert.ok(states.includes(item.state));
        assert.ok(Number.isFinite(item.radius) && item.radius > 0 && item.radius <= 150, 'Invalid link radius');
      }
    }
  }
  assert.ok(geometry.annotations.length <= 4);
  for (const annotation of geometry.annotations) {
    point(annotation.at);
    text(annotation.text, 32, 'annotation');
  }
  return robot;
}

export function screenHardware(robot) {
  const entries = [...robot.geometry.boxes,...robot.geometry.tools].map(item => ({...item, half:item.size.map(value=>value/2)}));
  for (const link of robot.geometry.links) for (const center of link.points) entries.push({name:link.name,state:link.state,center,half:[link.radius,link.radius,link.radius]});
  let maximumStowHeight = 0;
  let maximumExtension = 0;
  for (const item of entries) {
    const minimum = item.center.map((value,index)=>value-item.half[index]);
    const maximum = item.center.map((value,index)=>value+item.half[index]);
    const stowed = item.state!=='deployed';
    const lower = stowed ? [-350,0,0] : [-807.2,-457.2,0];
    const upper = stowed ? [350,760,1066.8] : [807.2,1217.2,2800];
    for (let axis=0;axis<3;axis++) assert.ok(minimum[axis]>=lower[axis]-1e-6 && maximum[axis]<=upper[axis]+1e-6, `${robot.id} ${item.name}: ${item.state} envelope axis ${axis}`);
    if (stowed) maximumStowHeight=Math.max(maximumStowHeight,maximum[2]);
    maximumExtension=Math.max(maximumExtension,-350-minimum[0],maximum[0]-350,-minimum[1],maximum[1]-760);
  }
  for (const tool of robot.geometry.tools) {
    assert.ok(robot.geometry.links.some(link=>link.points.some(point=>point.every((value,index)=>Math.abs(value-tool.center[index])<1))), `${robot.id} ${tool.name}: tool center needs a link endpoint`);
  }
  return {id:robot.id,maximumStowHeightMm:maximumStowHeight,maximumHardwareExtensionMm:maximumExtension,toolCentersLinked:true,scope:'Static coordinates only'};
}