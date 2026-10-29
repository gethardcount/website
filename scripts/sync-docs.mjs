// Copies the docs from a checkout of gethardcount/hardcount into the site.
// Each page keeps one source file in the repo; this only displays it.
//
//   HC_SRC=<checkout path> HC_REF=<tag or branch> node scripts/sync-docs.mjs
//
// Links are rewritten: a mapped doc becomes its site page, an image is copied,
// a doc that moved to the website points there, and anything else (source
// code) points to GitHub at HC_REF.
import fs from 'node:fs';
import path from 'node:path';
import { sections, movedToSite } from './docs-map.mjs';

const SRC = process.env.HC_SRC;
const REF = process.env.HC_REF;
if (!SRC || !REF) {
  console.error('HC_SRC and HC_REF are required, e.g. HC_SRC=.hc-src HC_REF=v0.9.1');
  process.exit(2);
}
const REPO = 'https://github.com/gethardcount/hardcount';
const OUT = 'src/content/docs/docs';
const ASSETS = 'public/docs-assets';
const GEN = 'src/generated';

for (const d of [OUT, ASSETS]) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(GEN, { recursive: true });

const exists = (p) => fs.existsSync(path.join(SRC, p));
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

// 1. Expand the map into pages: { src?, slug, title?, planned? }.
const pages = [];
const sidebar = [];

function listGlob(item) {
  const dir = path.join(SRC, item.glob);
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => item.glob + e.name)
    .filter((p) => p !== item.index && !(item.exclude ?? []).some((x) => p.startsWith(x)))
    .sort();
}

const slugOf = (p) => path.posix.basename(p, '.md').toLowerCase();

for (const section of sections) {
  const group = { label: section.label, collapsed: section.collapsed ?? false, items: [] };
  for (const item of section.items) {
    if (item.objects) {
      group.items.push({ objects: true, label: item.label });
      continue;
    }
    if (item.openapi) {
      group.items.push({ openapi: true, label: item.label });
      continue;
    }
    if (item.glob) {
      const sub = { label: item.label, collapsed: item.collapsed ?? true, items: [] };
      if (item.index) {
        pages.push({ src: item.index, slug: item.base, index: true });
        sub.items.push({ pageSlug: item.base, overview: true });
      }
      for (const p of listGlob(item)) {
        const slug = `${item.base}/${slugOf(p)}`;
        pages.push({ src: p, slug });
        sub.items.push({ pageSlug: slug });
      }
      group.items.push(sub);
      continue;
    }
    if (item.src && !exists(item.src)) {
      console.warn(`missing in source: ${item.src}`);
      continue;
    }
    pages.push(item);
    group.items.push({ pageSlug: item.slug, label: item.label });
  }
  sidebar.push(group);
}

// The docs landing page is the repo's docs index, shown at /docs/.
pages.push({ src: 'docs/README.md', slug: 'index', title: 'Hardcount docs' });

// 2. Where every repo file is shown.
const urlOf = new Map();
const pageUrl = (slug) => (slug === 'index' ? '/docs/' : `/docs/${slug}/`);
for (const p of pages) if (p.src) urlOf.set(p.src, pageUrl(p.slug));
for (const [src, url] of Object.entries(movedToSite)) if (!urlOf.has(src)) urlOf.set(src, url);

const IMG = /\.(png|jpe?g|gif|svg|webp)$/i;
const warnings = [];

const GH_FILE = /^https:\/\/github\.com\/gethardcount\/hardcount\/(?:blob|tree)\/[^/]+\/([^#]+)(#.*)?$/;

function rewrite(target, fromFile) {
  // An absolute GitHub link to a file the site shows becomes its site page.
  const gh = target.match(GH_FILE);
  if (gh && urlOf.has(gh[1])) return urlOf.get(gh[1]) + (movedToSite[gh[1]] ? '' : gh[2] ?? '');
  if (/^(https?:|mailto:|#|\/)/.test(target)) return target;
  const [pathPart, anchor] = target.split('#');
  if (!pathPart) return target;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), decodeURI(pathPart)));
  const hash = anchor ? `#${anchor}` : '';
  if (urlOf.has(resolved)) return urlOf.get(resolved) + (movedToSite[resolved] ? '' : hash);
  if (IMG.test(resolved) && exists(resolved)) {
    const rel = resolved.replace(/^docs\//, '');
    const dest = path.join(ASSETS, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(SRC, resolved), dest);
    return `/docs-assets/${rel}`;
  }
  if (exists(resolved)) {
    const isDir = fs.statSync(path.join(SRC, resolved)).isDirectory();
    return `${REPO}/${isDir ? 'tree' : 'blob'}/${REF}/${resolved}${hash}`;
  }
  warnings.push(`${fromFile}: link to missing ${resolved}`);
  return target;
}

function rewriteLinks(text, fromFile) {
  // Leave fenced code blocks alone.
  return text
    .split(/(^```[\s\S]*?^```)/m)
    .map((chunk, i) => {
      if (i % 2 === 1) return chunk;
      return chunk
        .replace(/(!?\[[^\]]*\]\()(<?)([^)\s>]+)(>?)((?:\s+"[^"]*")?\))/g, (m, a, lt, t, gt, b) => a + lt + rewrite(t, fromFile) + gt + b)
        .replace(/^(\[[^\]]+\]:\s+)(\S+)/gm, (m, a, t) => a + rewrite(t, fromFile))
        .replace(/\b(src|href)="([^"]+)"/g, (m, a, t) => `${a}="${rewrite(t, fromFile)}"`);
    })
    .join('');
}

function splitFrontmatter(text) {
  if (!text.startsWith('---\n')) return { fm: '', body: text };
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return { fm: '', body: text };
  return { fm: text.slice(4, end), body: text.slice(end + 5) };
}

// A planned page points to where its content lives today, so a reader never
// hits a dead end. `from` entries start with a repo path when they have one.
function nowAt(from) {
  const links = from
    .map((f) => {
      const src = f.split(':')[0].trim();
      return urlOf.has(src) ? `- [${titlesByUrl.get(urlOf.get(src)) ?? src}](${urlOf.get(src)})${f.includes(':') ? ':' + f.split(':').slice(1).join(':') : ''}` : null;
    })
    .filter(Boolean);
  if (!links.length) return [];
  return ['', ':::tip[Until this page is written]', 'Its content lives here today:', '', ...links, ':::', ''];
}

// Each page being split names the planned pages its parts move to.
const splitInto = new Map();
for (const p of pages) {
  for (const f of p.planned?.from ?? []) {
    const src = f.split(':')[0].trim();
    if (!splitInto.has(src)) splitInto.set(src, []);
    splitInto.get(src).push(p);
  }
}

// Not in search: contributor pages, design records, records and design notes,
// so a reader searching
// "invoice" finds the user docs first. Design records stay one click away.
const unsearched = (slug) => slug.startsWith('contribute') || /^internals\/(decisions|records|design-notes)/.test(slug);

// 3. Write each page.
const titles = new Map();
const titlesByUrl = new Map();

// The first real paragraph, as plain text, for the page's meta description.
function firstParagraph(md) {
  const para = md
    .replace(/^```[\s\S]*?^```/gm, '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|\||:::|<|!\[|[-*>] |\d+\.\s|\*\*[^*]+:\*\*\s*$)/.test(b));
  if (!para) return '';
  const text = para
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 200 ? text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : text;
}

function writePage(slug, title, body, extraFm = '') {
  const file = path.join(OUT, `${slug}.md`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const description = firstParagraph(body);
  const fm = [`title: ${JSON.stringify(title)}`, description && `description: ${JSON.stringify(description)}`, extraFm]
    .filter(Boolean)
    .join('\n');
  fs.writeFileSync(file, `---\n${fm}\n---\n\n${body.trimStart()}`);
}

// Real pages first, so a planned page can name the pages its content lives on.
for (const p of [...pages.filter((x) => !x.planned), ...pages.filter((x) => x.planned)]) {
  if (p.planned) {
    const pl = p.planned;
    const body = [
      ':::caution[Planned page]',
      'This page is not written yet. This outline shows what it will contain.',
      ':::',
      '',
      pl.intro,
      '',
      '## It will cover',
      '',
      ...pl.sections.map((s) => `- ${s}`),
      '',
      ...nowAt(pl.from),
    ].join('\n');
    writePage(p.slug, pl.title, body);
    titles.set(p.slug, pl.title);
    continue;
  }
  let raw = read(p.src);
  let title = p.title;
  let body;
  if (p.src === 'LICENSE') {
    body = 'Hardcount is released under the MIT licence:\n\n```text\n' + raw.trim() + '\n```\n';
  } else {
    // A source file's own metadata block is not used by the site.
    const { body: rest } = splitFrontmatter(raw);
    const h1 = rest.match(/^#\s+(.+)$/m);
    title = title ?? (h1 ? h1[1].trim() : slugOf(p.src));
    body = h1 ? rest.replace(h1[0], '') : rest;
    body = rewriteLinks(body, p.src);
  }
  const parts = splitInto.get(p.src)?.filter((x) => p.slug.startsWith('being-split/'));
  if (parts?.length) {
    body = [':::note[This page is being split up]', 'Before launch its parts move to:', '', ...parts.map((x) => `- [${x.planned.title}](${pageUrl(x.slug)})`), ':::', '', body].join('\n');
  }
  writePage(p.slug, title, body, unsearched(p.slug) ? 'pagefind: false' : '');
  titles.set(p.slug, title);
  titlesByUrl.set(pageUrl(p.slug), title);
}

// 4. The sidebar, for astro.config.mjs.
function toSidebar(items) {
  return items.map((it) => {
    if (it.objects || it.openapi) return it;
    if (it.items) return { label: it.label, collapsed: it.collapsed, items: toSidebar(it.items) };
    const label = it.overview ? 'Overview' : it.label ?? titles.get(it.pageSlug) ?? it.pageSlug;
    return { label, link: `/docs/${it.pageSlug}/` };
  });
}
fs.writeFileSync(
  path.join(GEN, 'sidebar.json'),
  JSON.stringify(sidebar.map((g) => ({ label: g.label, collapsed: g.collapsed, items: toSidebar(g.items) })), null, 2),
);

// 5. The API spec, for the reference and as a download.
fs.copyFileSync(path.join(SRC, 'api/openapi.yaml'), path.join(GEN, 'openapi.yaml'));
fs.mkdirSync('public', { recursive: true });
fs.copyFileSync(path.join(SRC, 'api/openapi.yaml'), 'public/openapi.yaml');

console.log(`synced ${pages.length} pages from ${SRC} at ${REF}`);
if (warnings.length) {
  console.log(`${warnings.length} links point to files that do not exist:`);
  for (const w of warnings.slice(0, 40)) console.log('  ' + w);
}
