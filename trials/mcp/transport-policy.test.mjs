import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('reviewed Rust request boundary disables redirects and proxies before authentication', async () => {
  const source = await readFile(new URL('./vendor/source/crates/onshape-client-io/src/lib.rs', import.meta.url), 'utf8');
  assert.match(source, /\.redirect\(reqwest::redirect::Policy::none\(\)\)/);
  assert.match(source, /\.retry\(reqwest::retry::never\(\)\)/);
  assert.match(source, /\.no_proxy\(\)/);
  assert.match(source, /destination\.scheme\(\) != "https"/);
  assert.match(source, /destination\.host_str\(\) != Some\("cad\.onshape\.com"\)/);
  assert.match(source, /destination\.port\(\)\.is_some\(\)/);
  assert.match(source, /destination\.username\(\)\.is_empty\(\)/);
  assert.match(source, /destination\.password\(\)\.is_some\(\)/);
  assert.match(source, /destination\.fragment\(\)\.is_some\(\)/);
  assert.match(source, /destination\.path\(\)\.starts_with\("\/api\/v16\/"\)/);
  assert.ok(source.indexOf('trial destination is outside') < source.indexOf('let auth_header ='));
});