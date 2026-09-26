import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {circleBoxClearance} from './deployment_path.mjs';

export function layout() {
  const rear = [55, 360], middle = [55 - Math.sqrt(155 ** 2 - 14 ** 2), 346];
  return {rear, middle, front: [middle[0] - Math.sqrt(205 ** 2 - 180 ** 2), 166],
    kick: [-132, 34], trayTop: 188, coralRadius: 57.15, starRadius: 63.7,
    upperHardRadius: Math.SQRT2 * 10, kickerRadius: 25.5};
}

export function classify(center, config = layout(), maxCompression = 8) {
  const bumper = circleBoxClearance(center, config.coralRadius, {min: [-85, 45], max: [0, 165]});
  const floor = center[1] - config.coralRadius;
  const rows = ['front', 'middle', 'rear', 'kick'].map(name => {
    const radius = name === 'kick' ? config.kickerRadius : config.starRadius;
    const distance = Math.hypot(center[0] - config[name][0], center[1] - config[name][1]);
    return {name, compression: radius + config.coralRadius - distance,
      hardGap: distance - config.coralRadius - (name === 'kick' ? radius : config.upperHardRadius)};
  });
  return {bumper, floor, rows, geometricallyAllowed: bumper >= 3 && floor >= 0
    && rows.every(row => row.hardGap >= (row.name === 'kick' ? -2 : 3))
    && rows.every(row => row.compression <= (row.name === 'kick' ? 2 : maxCompression)),
    drivenEnvelope: rows.some(row => row.compression >= 0 && row.compression <= (row.name === 'kick' ? 2 : maxCompression))};
}

export function trace(config = layout(), maxCompression = 8) {
  const spacing = 2, minY = Math.floor((config.front[0] - config.starRadius - config.coralRadius - 4) / 2) * 2;
  const maxY = config.rear[0] + 5, minZ = config.coralRadius, maxZ = Math.max(config.middle[1], config.rear[1]) + 2;
  const width = Math.round((maxY - minY) / spacing) + 1, height = Math.round((maxZ - minZ) / spacing) + 1;
  const coordinates = index => [minY + index % width * spacing, minZ + Math.floor(index / width) * spacing];
  const cells = Array.from({length: width * height}, (_, index) => classify(coordinates(index), config, maxCompression));
  const permitted = index => cells[index].geometricallyAllowed && cells[index].drivenEnvelope;
  const firstFloorContact = cells.findIndex((cell, index) => index < width && permitted(index));
  const starts = firstFloorContact >= 0 ? [firstFloorContact] : [];
  const queue = starts.slice(), visited = new Set(starts), parent = new Map();
  let goal = null;
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const index = queue[cursor], center = coordinates(index);
    if (center[0] >= config.rear[0] - 1 && Math.abs(center[1] - (config.trayTop + config.coralRadius)) <= spacing) {
      goal = index; break;
    }
    for (const [deltaY, deltaZ] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const column = index % width + deltaY, row = Math.floor(index / width) + deltaZ;
      if (column < 0 || column >= width || row < 0 || row >= height) continue;
      const other = row * width + column;
      if (visited.has(other) || !permitted(other)) continue;
      visited.add(other); parent.set(other, index); queue.push(other);
    }
  }
  const path = [];
  for (let index = goal; index !== undefined && index !== null; index = parent.get(index)) path.push(coordinates(index));
  path.reverse();
  const reached = [...visited].map(coordinates);
  const reachableBoundsYZ = reached.length ? {min: [0, 1].map(axis => Math.min(...reached.map(point => point[axis]))),
    max: [0, 1].map(axis => Math.max(...reached.map(point => point[axis])))} : null;
  return {schema: 'coaxial-crosswise-envelope-path/1', config, spacingMm: spacing, maximumAssumedStarCompressionMm: maxCompression,
    status: path.length ? 'DISCRETE_ENVELOPE_ROUTE_FOUND' : 'NO_ROUTE_IN_SEARCH', path,
    visitedNodes: visited.size, startNodes: starts.length, reachableBoundsYZ,
    scope: 'Centered sideways outer-cylinder, circular drive envelopes, hard hub enclosing disk and bumper. No star phase, traction, force equilibrium, actual support, guides, cheeks or lengthwise/yaw path solved.',
    contactForceAndVelocityDirectionsSolved: false,
    entryScope: 'Front-most permitted floor-contact cell only; no insertion behind the front roller',
    passiveSupportDesigned: false, continuousPathCertified: false, physicalFeedProven: false, releaseReady: false};
}

  export function floatConfig(config, angleDeg) {
    const angle = angleDeg * Math.PI / 180;
    const deltaY = config.front[0] - config.middle[0], deltaZ = config.front[1] - config.middle[1];
    return {...config, front: [config.middle[0] + deltaY * Math.cos(angle) - deltaZ * Math.sin(angle),
    config.middle[1] + deltaY * Math.sin(angle) + deltaZ * Math.cos(angle)]};
  }

if (import.meta.main) {
  const bytes = readFileSync(new URL('coaxial-output/revision-feed/manifest.json', import.meta.url));
  const manifest = JSON.parse(bytes);
  const config = {...layout(), ...manifest.roller_centers_yz, trayTop: 133.85 + manifest.retained_rigid_lift_mm};
  const result = {...trace(config), sourceManifestSha256: createHash('sha256').update(bytes).digest('hex'),
    source: 'coaxial-output/revision-feed/manifest.json',
    fixedFloatSensitivity: [0, -4, -8].map(angle => {
      const report = trace(floatConfig(config, angle));
      return {angle, status: report.status, points: report.path.length, first: report.path[0], last: report.path.at(-1)};
    }),
    kickerSensitivity: [-132, -122, -112].map(yCoord => {
      const report = trace({...config, kick: [yCoord, 34]});
      return {yCoord, status: report.status, points: report.path.length, reachableBoundsYZ: report.reachableBoundsYZ};
    })};
  writeFileSync(new URL('coaxial-transport.json', import.meta.url), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({...result, path: {points: result.path.length, first: result.path[0], last: result.path.at(-1)}}, null, 2));
}