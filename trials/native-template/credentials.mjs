import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export function loadCredentials(origin, readText = () => readFileSync(new URL('../../.env.local', import.meta.url), 'utf8')) {
  try {
    const values = parseEnv(readText());
    if (values.ONSHAPE_BASE_URL && values.ONSHAPE_BASE_URL !== origin) throw new Error();
    if (!values.ONSHAPE_ACCESS_KEY || !values.ONSHAPE_SECRET_KEY) throw new Error();
    return { accessKey: values.ONSHAPE_ACCESS_KEY, secretKey: values.ONSHAPE_SECRET_KEY };
  } catch { throw new Error('CREDENTIAL_FILE_OR_ORIGIN_INVALID'); }
}

export function safeEvidence(value, credentials) {
  if (Array.isArray(value)) return value.map(item => safeEvidence(item, credentials));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/^(message|errorMessage|stackTrace|headers|authorization|accessKey|secretKey)$/i.test(key))
    .map(([key, item]) => [key, safeEvidence(item, credentials)]));
  if (typeof value === 'string') {
    for (const secret of [credentials?.accessKey, credentials?.secretKey].filter(Boolean)) value = value.replaceAll(secret, '[REDACTED]');
  }
  return value;
}