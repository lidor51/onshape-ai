import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

test('trial reports link existing evidence and state actual public MCP results', async () => {
  for (const relative of ['./REPORT.md', '../REPORT.md']) {
    const file = fileURLToPath(new URL(relative, import.meta.url));
    const text = await readFile(file, 'utf8');
    assert.ok(!/[^\x00-\x7f]/.test(text), `${relative} ASCII`);
    assert.ok(!/[\t ]+$/m.test(text), `${relative} whitespace`);
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^https?:/.test(match[1])) continue;
      const target = match[1].split('#')[0];
      if (target) await access(resolve(dirname(file), target));
    }
    for (const token of ['34', '16', 'MCP+FS', 'second-server', '1.2.0', '1.26.0']) {
      assert.ok(text.includes(token), `${relative} missing ${token}`);
    }
  }
});