import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateConcept } from './validate.mjs';

const root = new URL('./', import.meta.url);
const output = new URL('../../../outputs/concepts/', root);
const readJson = async url => JSON.parse(await readFile(url, 'utf8'));
const expectedIds = Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0'));

test('all fourteen generated concepts match their validated sources', async () => {
  const source = (await Promise.all(['family-a.json', 'family-b.json', 'family-c.json', 'concept-11.json', 'concept-12.json', 'concept-13.json', 'concept-14.json'].map(name => readJson(new URL(name, root)))))
    .flat().map(validateConcept).sort((first, second) => first.id.localeCompare(second.id));
  const generated = await readJson(new URL('concepts.json', output));
  assert.deepEqual(source.map(concept => concept.id), expectedIds);
  assert.equal(new Set(source.map(concept => concept.title)).size, 14);
  assert.deepEqual(generated, source);
});

test('sheets, overview and raster hashes preserve the concept-only bundle', async () => {
  const manifest = await readJson(new URL('manifest.json', output));
  assert.equal(manifest.stage, 2);
  assert.equal(manifest.apiCalls, 0);
  assert.equal(manifest.cadKernelRuns, 0);
  assert.equal(manifest.status, 'UNTESTED_CONCEPT_PREVIEWS');
  assert.equal(manifest.conceptCount, 14);
  assert.deepEqual(manifest.overviewSize, { width: 2000, height: 4926 });
  assert.deepEqual(manifest.files.map(file => file.id), expectedIds);
  assert.deepEqual(manifest.rasters.map(file => file.file), [...expectedIds.map(id => `concept-${id}.png`), 'overview.png']);
  for (const file of [...manifest.files, ...manifest.rasters]) {
    const bytes = await readFile(new URL(file.file, output));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `${file.file} hash`);
    if (file.file.endsWith('.png')) {
      assert.equal(bytes.length, file.bytes, `${file.file} size`);
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16), file.file === 'overview.png' ? 2000 : 1600);
      assert.equal(bytes.readUInt32BE(20), file.file === 'overview.png' ? 4926 : 1030);
    } else {
      const svg = bytes.toString('utf8');
      assert.ok(svg.includes('viewBox="0 0 1600 1030"'), `${file.file} viewport`);
      assert.ok(svg.includes('STAGE 2 / CONCEPT ONLY'), `${file.file} evidence label`);
      assert.ok(svg.includes('x1="765" y1="678" x2="830"'), `${file.file} side scale`);
      assert.ok(svg.includes('x1="1450" y1="678" x2="1488"'), `${file.file} top scale`);
    }
  }
  const overview = await readFile(new URL('overview.svg', output), 'utf8');
  assert.ok(!overview.includes('data:image/svg+xml'), 'overview text must not depend on nested image font loading');
  for (const id of expectedIds) assert.ok(overview.includes(`id="title${id}"`), `overview includes ${id}`);
});

test('the bumper-cutout sheet shows a real opening and its known rule conflict', async () => {
  const concept = await readJson(new URL('concept-12.json', root));
  assert.deepEqual(concept.bumperOpening, { widthMm: 350, recessDepthMm: 340 });
  assert.ok(concept.side.path.every(([, height]) => height < 165), 'route passes through, not over the bumper');
  const cutout = await readFile(new URL('concept-12.svg', output), 'utf8');
  for (const required of ['2025 NON-COMPLIANT', 'id="front-bumper-opening"', 'id="removed-bumper-section"', 'CENTER SECTION / THROUGH OPENING']) {
    assert.ok(cutout.includes(required), required);
  }
  for (const id of ['11', '13', '14']) {
    const intact = await readFile(new URL(`concept-${id}.svg`, output), 'utf8');
    assert.ok(!intact.includes('id="front-bumper-opening"'), `${id} keeps intact bumper`);
  }
});

test('1778 concept preserves and renders the carrier-locked lower contact', async () => {
  const concept = await readJson(new URL('concept-14.json', root));
  assert.equal(concept.side.rollers.filter(roller => roller.rotation === 'locked').length, 1);
  assert.equal(concept.plan.guides.filter(guide => guide.rotation === 'locked').length, 1);
  assert.ok(concept.notice.includes('not measured 1778 CAD'));
  const svg = await readFile(new URL('concept-14.svg', output), 'utf8');
  assert.ok(svg.includes('data-contact="locked"'), 'locked contact must not use powered rendering');
  assert.ok(svg.includes('>LOCKED</text>'), 'locked contact must be labeled');
  assert.ok(svg.includes('Locked axle moves with carrier'), 'not a world-fixed axle');
});

test('gallery links and current workflow document links resolve locally', async () => {
  const gallery = await readFile(new URL('index.html', output), 'utf8');
  for (const id of expectedIds) {
    assert.ok(gallery.includes(`id="concept-${id}"`), `${id} navigation target`);
    assert.ok(gallery.includes(`src="concept-${id}.png"`), `${id} clean raster preview`);
    assert.ok(gallery.includes(`href="concept-${id}.png"`), `${id} browser-safe full-size link`);
  }
  for (const [, target] of gallery.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    await access(new URL(target, output));
  }
  for (const path of ['../../../README.md', '../../../docs/STATUS.md', '../../../docs/DESIGN-WORKFLOW.md', '../../../outputs/concepts/README.md']) {
    const url = new URL(path, root);
    const markdown = await readFile(url, 'utf8');
    for (const [, target] of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(?:https?:|#)/.test(target)) continue;
      const linked = new URL(target, url);
      linked.hash = '';
      await access(linked);
    }
  }
});