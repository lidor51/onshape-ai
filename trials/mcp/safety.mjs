import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const trialDirectory = dirname(fileURLToPath(import.meta.url));
export const safeTools = new Set([
  'onshape_auth_status',
  'onshape_api_search',
  'onshape_api_explain',
  'onshape_api_schema',
]);

export function isolatedEnvironment(runtimeDirectory, parent = process.env) {
  const runtime = resolve(runtimeDirectory);
  const systemRoot = parent.SystemRoot ?? parent.SYSTEMROOT ?? 'C:\\Windows';
  return {
    SystemRoot: systemRoot,
    WINDIR: systemRoot,
    PATH: [dirname(process.execPath), join(systemRoot, 'System32')].join(';'),
    HOME: runtime,
    USERPROFILE: runtime,
    APPDATA: join(runtime, 'config'),
    LOCALAPPDATA: join(runtime, 'data'),
    XDG_CONFIG_HOME: join(runtime, 'config'),
    XDG_DATA_HOME: join(runtime, 'data'),
    TEMP: join(runtime, 'temp'),
    TMP: join(runtime, 'temp'),
    HOMEDRIVE: runtime.slice(0, 2),
    HOMEPATH: runtime.slice(2),
    SYSTEMDRIVE: systemRoot.slice(0, 2),
    SYSTEMROOT: systemRoot,
    USERNAME: 'offline-mcp-trial',
    USERDOMAIN: 'offline-mcp-trial',
    LOGONSERVER: '\\\\offline-mcp-trial',
    PROCESSOR_ARCHITECTURE: 'AMD64',
    PROGRAMFILES: dirname(dirname(process.execPath)),
  };
}

export function assertOfflineCall(name, args) {
  if (!safeTools.has(name)) throw new Error(`Offline policy rejects tool: ${name}`);
  if (name === 'onshape_auth_status' && args.validate !== false) {
    throw new Error('Auth status requires validate:false');
  }
}

export function assertOfflineArguments(args) {
  if (args.length) throw new Error('This phase supports no flags, live access, or host overrides');
}