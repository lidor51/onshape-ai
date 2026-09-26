import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { diagnosticScript } from './compile-check.mjs';

test('diagnostic wrapper defines but never invokes the intake; this is not CAD validation', async () => {
  const script = diagnosticScript(await readFile(new URL('./intake.fs', import.meta.url), 'utf8'));
  assert.match(script, /^function\(context is Context, queries\)/);
  assert.match(script, /const nameBody = function/);
  assert.match(script, /const coralGroundIntake = defineFeature/);
  assert.doesNotMatch(script, /coralGroundIntake\(/);
  assert.doesNotMatch(script, /^export|^import|^FeatureScript/gm);
  assert.match(script, /return 0;\n}$/);
});