// Writes one "The X object" page per core object from api/openapi.yaml:
// what the object is, an example, and every field with its type, whether it
// is always present, and what it means. Objects nested inside it (a
// subscription's items, a price's tiers) get their own table on the same page.
// The words come from the spec, so fixing a field description means editing
// api/openapi.yaml. A description or example the spec does not have yet is
// left out, not shown as a gap; the page fills in when the spec does.
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
// A description in a table cell: its lines joined, except that each item of a
// list in it (an enum's values, each with what it means) starts a new line.
const cellText = (s) =>
  String(s ?? '')
    .trim()
    .split(/\n\s*\n|\n(?=\s*[-*] )/)
    .map((part) => cell(part.replace(/^\s*[-*]\s+/, '')))
    .filter(Boolean)
    .join('<br>');
// The page's meta description: the first paragraph as plain text, at most
// 200 characters, as scripts/sync-docs.mjs writes for the synced pages.
const metaText = (s) => {
  const text = cell(String(s).trim().split(/\n\s*\n|\n(?=\s*[-*] )/)[0]).replace(/\\\|/g, '|').replace(/`/g, '');
  return text.length > 200 ? text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : text;
};
// Every value of an enum is already a list item of its description.
const listsEvery = (text, values) => values.every((v) => new RegExp(`^\\s*[-*]\\s+\`${v}\``, 'm').test(text ?? ''));
// SubscriptionItem → "Subscription item"; its heading id is "subscription-item".
const human = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().replace(/^./, (c) => c.toUpperCase());
const anchor = (name) => human(name).toLowerCase().replace(/\s+/g, '-');

function resolve(prop) {
  if (prop?.$ref) return { name: refName(prop.$ref), schema: schemas[refName(prop.$ref)] ?? {} };
  if (prop?.allOf?.length === 1 && prop.allOf[0].$ref) return resolve(prop.allOf[0]);
  return { name: null, schema: prop ?? {} };
}

// A named schema with fields of its own, shown as a table on the page.
const isNested = (name, schema) => name && !pageOf.has(name) && schema.properties && Object.keys(schema.properties).length;

function typeOf(prop, nested) {
  const { name, schema } = resolve(prop);
  if (name && pageOf.has(name)) return `[${human(name)}](${pageOf.get(name)})`;
  if (isNested(name, schema)) {
    nested.add(name);
    return `[${human(name)}](#${anchor(name)})`;
  }
  if (schema.enum) return 'enum';
  if (schema.type === 'array') return `array of ${typeOf(schema.items, nested)}`;
  const t = schema.type ?? 'object';
  return schema.format ? `${t} (${schema.format})` : t;
}

function describe(prop) {
  const { schema } = resolve(prop);
  const parts = [];
  const text = prop.description ?? schema.description;
  if (text) parts.push(cellText(text));
  const values = schema.enum ?? resolve(schema.items ?? {}).schema.enum;
  if (values && !listsEvery(text, values)) parts.push(`One of: ${values.map((v) => `\`${v}\``).join(', ')}.`);
  if (prop.nullable || schema.nullable) parts.push('Can be null.');
  return parts.join(' ');
}

// The object's own example, or one put together from its fields' examples
// when those cover every field that is always present (a partial one would
// mislead).
function example(schema) {
  if (schema.example) return schema.example;
  const out = {};
  for (const [k, v] of Object.entries(schema.properties ?? {})) {
    const ex = v.example ?? resolve(v).schema.example;
    if (ex !== undefined) out[k] = ex;
  }
  const complete = (schema.required ?? []).every((k) => k in out);
  return Object.keys(out).length && complete ? out : null;
}

// Wrapped like the synced pages' tables (scripts/sync-docs.mjs), so a wide
// table scrolls inside its own box.
function fieldTable(schema, nested) {
  const required = new Set(schema.required ?? []);
  return [
    '<div class="hc-table hc-fields">',
    '',
    '| Field | Type | Always present | What it means |',
    '|---|---|---|---|',
    ...Object.entries(schema.properties ?? {}).map(
      ([k, p]) => `| \`${k}\` | ${typeOf(p, nested)} | ${required.has(k) ? 'Yes' : 'No'} | ${describe(p)} |`,
    ),
    '',
    '</div>',
  ];
}

const index = [];

for (const [name, slug] of objects) {
  const schema = schemas[name];
  if (!schema) {
    console.warn(`no schema ${name}`);
    continue;
  }
  const label = human(name);
  const title = `The ${label.toLowerCase()} object`;
  const ex = example(schema);
  const nested = new Set();
  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(schema.description ? metaText(schema.description) : `The ${label.toLowerCase()} object in the Hardcount API: every field and what it means.`)}`,
    '---',
    '',
  ];
  if (schema.description) lines.push(schema.description.trim(), '');
  if (ex) lines.push('## Example', '', '```json\n' + JSON.stringify(ex, null, 2) + '\n```', '');
  lines.push('## Fields', '', ...fieldTable(schema, nested), '');

  // Nested objects, each once, in the order the fields name them; a nested
  // object's own nested objects follow it.
  const done = new Set();
  const queue = [...nested];
  while (queue.length) {
    const n = queue.shift();
    if (done.has(n)) continue;
    done.add(n);
    const s = schemas[n];
    const inner = new Set();
    lines.push(`## ${human(n)}`, '');
    if (s.description) lines.push(s.description.trim(), '');
    lines.push(...fieldTable(s, inner), '');
    for (const i of inner) if (!done.has(i)) queue.push(i);
  }

  fs.writeFileSync(path.join(OUT, `${slug}.md`), lines.join('\n'));
  index.push({ title, label, slug, fields: Object.keys(schema.properties ?? {}).length, nested: [...done].map(human) });
}

fs.writeFileSync(
  path.join(OUT, 'index.md'),
  [
    '---',
    'title: "Objects"',
    'description: "The core objects the Hardcount API returns, with each field explained."',
    '---',
    '',
    'The core objects the API returns, with each field explained. Each page is generated from the API spec, [`/openapi.yaml`](/openapi.yaml), which also describes every other shape the API sends. Field names are checked against the server code by tests.',
    '',
    '| Object | Fields | Objects inside it |',
    '|---|---|---|',
    ...index.map((o) => `| [${o.label}](/docs/api/objects/${o.slug}/) | ${o.fields} | ${o.nested.join(', ')} |`),
    '',
  ].join('\n'),
);
fs.writeFileSync('src/generated/objects.json', JSON.stringify(index.map((o) => ({ label: o.label, link: `/docs/api/objects/${o.slug}/` })), null, 2));
console.log(`wrote ${index.length} object pages`);
