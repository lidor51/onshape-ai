import { readFileSync } from 'node:fs';
import { requireThat, sha256 } from './ledger.mjs';

export function loadSchema() {
  const text = readFileSync(new URL('./schema/openapi-v17.json', import.meta.url), 'utf8');
  const provenance = JSON.parse(readFileSync(new URL('./schema/provenance.json', import.meta.url), 'utf8'));
  requireThat(sha256(text) === provenance.sha256 && provenance.targetApiVersion === 'v17', 'SCHEMA_HASH_OR_VERSION');
  return new Schema(JSON.parse(text));
}

export class Schema {
  constructor(spec) { this.spec = spec; }

  resolve(schema) {
    return schema.$ref ? this.spec.components.schemas[schema.$ref.split('/').at(-1)] : schema;
  }

  flatten(schema) {
    schema = this.resolve(schema);
    requireThat(schema, 'UNKNOWN_SCHEMA');
    const output = { ...schema, properties: { ...schema.properties }, required: [...(schema.required ?? [])] };
    for (const base of schema.allOf ?? []) {
      const inherited = this.flatten(base);
      Object.assign(output.properties, inherited.properties);
      output.required.push(...inherited.required);
    }
    return output;
  }

  derives(type, base) {
    if (type === base) return true;
    return (this.spec.components.schemas[type]?.allOf ?? []).some(schema =>
      schema.$ref && this.derives(schema.$ref.split('/').at(-1), base));
  }

  check(schema, value, location = 'body') {
    const base = schema.$ref?.split('/').at(-1);
    if (base && value?.btType) {
      requireThat(this.derives(value.btType, base), `SCHEMA_SUBTYPE:${location}`);
      schema = this.spec.components.schemas[value.btType];
    }
    const shape = this.flatten(schema);
    if (shape.format === 'binary') {
      requireThat(Buffer.isBuffer(value), `SCHEMA_BINARY:${location}`);
      return;
    }
    if (value === null && shape.nullable) return;
    if (shape.enum) requireThat(shape.enum.includes(value), `SCHEMA_ENUM:${location}`);
    if (shape.type === 'array') {
      requireThat(Array.isArray(value), `SCHEMA_ARRAY:${location}`);
      value.forEach((item, index) => this.check(shape.items, item, `${location}[${index}]`));
    } else if (shape.type === 'object') {
      requireThat(value && typeof value === 'object' && !Array.isArray(value), `SCHEMA_OBJECT:${location}`);
      for (const name of shape.required) requireThat(value[name] !== undefined, `SCHEMA_REQUIRED:${location}.${name}`);
      for (const [name, item] of Object.entries(value)) {
        const property = shape.properties[name] ?? shape.additionalProperties;
        requireThat(property && property !== false, `SCHEMA_FIELD:${location}.${name}`);
        if (property !== true) this.check(property, item, `${location}.${name}`);
      }
    } else if (shape.type === 'number' || shape.type === 'integer') {
      requireThat(Number.isFinite(value) && (shape.type !== 'integer' || Number.isInteger(value)), `SCHEMA_NUMBER:${location}`);
    } else if (shape.type) requireThat(typeof value === shape.type, `SCHEMA_TYPE:${location}`);
  }

  operation(name) {
    for (const [path, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (operation.operationId === name) return { path, method: method.toUpperCase(), ...operation };
      }
    }
    throw new Error(`UNKNOWN_OPERATION:${name}`);
  }

  request(name, variables = {}, body, query = {}) {
    const operation = this.operation(name);
    requireThat(['GET', 'POST'].includes(operation.method), 'METHOD_SCOPE');
    const path = operation.path.replace(/\{(\w+)\}/g, (_, field) => {
      requireThat(typeof variables[field] === 'string' && /^[A-Za-z0-9_+\/-]+$/.test(variables[field]) &&
        !variables[field].includes('/'), `MISSING_OR_UNSAFE_ID:${field}`);
      return encodeURIComponent(variables[field]);
    });
    const content = Object.entries(operation.requestBody?.content ?? {});
    if (content.length) this.check(content[0][1].schema, body);
    else requireThat(body === undefined, 'UNEXPECTED_BODY');
    const allowedQuery = (operation.parameters ?? []).filter(parameter => parameter.in === 'query');
    for (const [field, value] of Object.entries(query)) {
      const parameter = allowedQuery.find(item => item.name === field);
      requireThat(parameter, `UNKNOWN_QUERY:${field}`);
      this.check(parameter.schema, value, `query.${field}`);
    }
    const suffix = new URLSearchParams(query).toString();
    return { operation: name, method: operation.method, path: `/api/v17${path}${suffix ? `?${suffix}` : ''}`,
      body, contentType: content[0]?.[0] ?? 'application/json' };
  }
}

if (import.meta.main) {
  const schema = loadSchema();
  for (const name of process.argv.slice(2)) {
    console.log(JSON.stringify({ name, schema: schema.spec.components.schemas[name] ?
      schema.flatten(schema.spec.components.schemas[name]) : schema.operation(name) }, null, 2));
  }
}