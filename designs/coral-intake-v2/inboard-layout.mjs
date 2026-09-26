import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {layout, trace, floatConfig} from './coaxial-transport.mjs';

export function inboardLayout({rearY = 80, rearZ = 348, middleZ = 321, frontSpan = 192.5, rearSpan = 230} = {}) {
  const middle = [rearY - Math.sqrt(rearSpan ** 2 - (rearZ - middleZ) ** 2), middleZ];
  const front = [middle[0] - Math.sqrt(frontSpan ** 2 - (middleZ - 166) ** 2), 166];
  if (![...middle, ...front].every(Number.isFinite)) throw new Error('Impossible roller centers');
  return {...layout(), rear: [rearY, rearZ], middle, front, kick: [-122, 34], trayTop: 175,
    frontSpan, rearSpan, frontBeltLength: 2 * frontSpan + 90, rearBeltLength: 2 * rearSpan + 90};
}

export function compareCandidates() {
  const baseline = JSON.parse(readFileSync(new URL('coaxial-output/revision-feed/manifest.json', import.meta.url)));
  return {scope: 'Necessary front containment and discrete sideways-contact sensitivity, NOT full-frame or continuous-feed acceptance',
    reference: {...layout(), ...baseline.roller_centers_yz, trayTop: 175},
    candidates: [70, 80, 90].flatMap(rearY => [192.5, 205].map(frontSpan => {
      const config = inboardLayout({rearY, frontSpan});
      return {config, fixedRearCircleFrontMargin: rearY - config.starRadius,
        floatResults: [0, -4, -8].map(angle => {
          const report = trace(floatConfig(config, angle));
          return {angle, status: report.status, pathPoints: report.path.length, start: report.path[0], end: report.path.at(-1)};
        }), releaseReady: false};
    }))};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = compareCandidates();
  writeFileSync(new URL('inboard-layout.json', import.meta.url), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}