// Writes one "The X object" page per core object from api/openapi.yaml:
// what the object is, a realistic example, and every field with its type,
// whether it is always present, and what it means. The words come from the
// spec, so fixing a field description means editing api/openapi.yaml.
//
//   node scripts/gen-objects.mjs   (after sync-docs.mjs has copied the spec)
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { objects } from './docs-map.mjs';

const spec = YAML.parse(fs.readFileSync('src/generated/openapi.yaml', 'utf8'));
const schemas = spec.components?.schemas ?? {};
const OUT = 'src/content/docs/docs/api/objects';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const pageOf = new Map(objects.map(([name, slug]) => [name, `/docs/api/objects/${slug}/`]));
const refName = (ref) => ref.split('/').pop();
const cell = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim();

function resolve(prop) {
  if (prop?.$ref) return { name: refName(prop.$ref), schema: schemas[refName(prop.$ref)] ?? {} };
  if (prop?.allOf?.length === 1 && prop.allOf[0].$ref) return resolve(prop.allOf[0]);
  return { name: null, schema: prop ?? {} };
}

function typeOf(prop) {
  const { name, schema } = resolve(prop);
  if (name && pageOf.has(name)) return `[${name}](${pageOf.get(name)})`;
  if (schema.enum) return 'enum';
  if (schema.type === 'array') return `array of ${typeOf(schema.items)}`;
  if (name && schema.type === 'object') return `object (${name})`;
  const t = schema.type ?? (name ? name : 'object');
  return schema.format ? `${t} (${schema.format})` : t;
}

function describe(prop) {
  const { schema } = resolve(prop);
  const parts = [];
  const text = prop.description ?? schema.description;
  parts.push(text ? cell(text) : '*No description yet.*');
  const values = schema.enum ?? resolve(schema.items ?? {}).schema.enum;
  if (values) parts.push(`One of: ${values.map((v) => `\`${v}\``).join(', ')}.`);
  if (prop.nullable || schema.nullable) parts.push('Can be null.');
  return parts.join(' ');
}

function example(schema) {
  if (schema.example) return schema.example;
  const out = {};
  let any = false;
  for (const [k, v] of Object.entries(schema.properties ?? {})) {
    const ex = v.example ?? resolve(v).schema.example;
    if (ex !== undefined) {
      out[k] = ex;
      any = true;
    }
  }
  return any ? out : null;
}

const index = [];

for (const [name, slug] of objects) {
  const schema = schemas[name];
  if (!schema) {
    console.warn(`no schema ${name}`);
    continue;
  }
  const props = Object.entries(schema.properties ?? {});
  const required = new Set(schema.required ?? []);
  const described = props.filter(([, p]) => p.description || resolve(p).schema.description).length;
  const ex = example(schema);
  const title = `The ${name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/^./, (c) => c.toUpperCase())} object`;

  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(schema.description ? cell(schema.description) : `${title} in the Hardcount API: every field and what it means.`)}`,
    '---',
    '',
    schema.description ? cell(schema.description) : '*This object has no description in the spec yet.*',
    '',
    `:::note[Preview: generated from api/openapi.yaml]`,
    `${described} of ${props.length} fields have a description in the spec today. Step 5 fills the rest, with a realistic example.`,
    ':::',
    '',
    '## Example',
    '',
    ex ? '```json\n' + JSON.stringify(ex, null, 2) + '\n```' : '*No example in the spec yet.*',
    '',
    '## Fields',
    '',
    '| Field | Type | Always present | What it means |',
    '|---|---|---|---|',
    ...props.map(([k, p]) => `| \`${k}\` | ${typeOf(p)} | ${required.has(k) ? 'Yes' : 'No'} | ${describe(p)} |`),
    '',
  ];
  fs.writeFileSync(path.join(OUT, `${slug}.md`), lines.join('\n'));
  index.push({ title, slug, described, total: props.length });
}

fs.writeFileSync(
  path.join(OUT, 'index.md'),
  [
    '---',
    'title: "Objects"',
    'description: "Every object the Hardcount API returns, with each field explained."',
    '---',
    '',
    'Every object the API returns, with each field explained. Each page is generated from `api/openapi.yaml`, the file the server code is built from, so field names and types match the code. Some descriptions are still missing; the count is on each page.',
    '',
    '| Object | Fields described |',
    '|---|---|',
    ...index.map((o) => `| [${o.title}](/docs/api/objects/${o.slug}/) | ${o.described} of ${o.total} |`),
    '',
  ].join('\n'),
);
fs.writeFileSync('src/generated/objects.json', JSON.stringify(index.map((o) => ({ label: o.title, link: `/docs/api/objects/${o.slug}/` })), null, 2));
console.log(`wrote ${index.length} object pages`);
