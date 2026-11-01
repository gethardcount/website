// Copies the docs from a checkout of gethardcount/hardcount into the site.
// Each page keeps one source file in the repo; this only displays it.
//
//   HC_SRC=<checkout path> HC_REF=<tag or branch> node scripts/sync-docs.mjs
//
// Links are rewritten: a mapped doc becomes its site page, an image is copied,
// a doc that moved to the website points there, and anything else (source
// code) points to GitHub at HC_REF. A few fixes make a repo page read right on
// a site pinned to one release; each is named below.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { sections, plannedPages, movedToSite, redirects, nearestUntilBuilt } from './docs-map.mjs';

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
// A GitHub Actions annotation, so a missing page shows on the run's summary.
const warn = (msg) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=Docs sync::${msg}` : `warning: ${msg}`);

// 1. Expand the map into pages: { src, slug, title?, label?, ... }.
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
const h1Of = (p) => {
  const m = read(p).match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : slugOf(p);
};

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
      const flags = { noindex: item.noindex, unlisted: false };
      if (item.index) {
        pages.push({ src: item.index, slug: item.base, index: true, ...flags });
        sub.items.push({ pageSlug: item.base, overview: true });
      }
      const entries = listGlob(item).map((p) => {
        const file = path.posix.basename(p);
        const hidden = (item.hidden ?? []).includes(p);
        const page = { src: p, slug: `${item.base}/${slugOf(p)}`, label: item.labels?.[file], ...flags, unlisted: hidden };
        pages.push(page);
        return page;
      });
      const listed = entries.filter((e) => !e.unlisted);
      if (item.sortByLabel) listed.sort((a, b) => (a.label ?? h1Of(a.src)).localeCompare(b.label ?? h1Of(b.src)));
      for (const e of listed) sub.items.push({ pageSlug: e.slug, label: e.label });
      group.items.push(sub);
      continue;
    }
    if (item.src && !exists(item.src)) {
      warn(`${item.src} is in scripts/docs-map.mjs but missing at ${REF}; /docs/${item.slug}/ is left out until it ships.`);
      continue;
    }
    pages.push(item);
    group.items.push({ pageSlug: item.slug, label: item.label });
  }
  sidebar.push(group);
}

// The docs landing page is the repo's docs index, shown at /docs/.
pages.push({ src: 'docs/README.md', slug: 'index', title: 'Hardcount docs' });

// 2. Where every repo file is shown, and each page's title.
const urlOf = new Map();
const pageUrl = (slug) => (slug === 'index' ? '/docs/' : `/docs/${slug}/`);
for (const p of pages) if (p.src) urlOf.set(p.src, pageUrl(p.slug));
for (const [src, url] of Object.entries(movedToSite)) if (!urlOf.has(src)) urlOf.set(src, url);
// A link to a docs folder the site shows as a group (docs/adr/) goes to that
// group's index page, not to the folder on GitHub.
for (const section of sections) {
  for (const item of section.items) {
    if (item.glob && item.index) {
      const url = pageUrl(item.base);
      urlOf.set(item.glob, url);
      urlOf.set(item.glob.replace(/\/$/, ''), url);
    }
  }
}
// "(LOCKED)" marked a design note as settled for the maintainer; a reader
// does not need it.
const cleanTitle = (t) => t.replace(/\s*\(LOCKED\)\s*/g, ' ').trim();
const titleOf = new Map();
for (const p of pages) {
  if (p.src === 'LICENSE') titleOf.set(pageUrl(p.slug), p.title);
  else titleOf.set(pageUrl(p.slug), cleanTitle(p.title ?? h1Of(p.src)));
}
const siteTitles = { '/product/': 'Product', '/compare/': 'Compare', '/reliability/': 'Reliability', '/': 'Hardcount', '/docs/api/endpoints/': 'API endpoints' };

const IMG = /\.(png|jpe?g|gif|svg|webp)$/i;
const warnings = [];

const GH_FILE = /^https:\/\/github\.com\/gethardcount\/hardcount\/(?:blob|tree)\/[^/]+\/([^#]+)(#.*)?$/;
// The OpenAPI file is shown as the endpoint reference.
const SPEC = 'api/openapi.yaml';

function rewrite(target, fromFile) {
  // An absolute GitHub link to a file the site shows becomes its site page.
  const gh = target.match(GH_FILE);
  if (gh && gh[1] === SPEC) return '/docs/api/endpoints/';
  if (gh && urlOf.has(gh[1])) return urlOf.get(gh[1]) + (movedToSite[gh[1]] ? '' : gh[2] ?? '');
  if (/^(https?:|mailto:|#|\/)/.test(target)) return target;
  const [pathPart, anchor] = target.split('#');
  if (!pathPart) return target;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), decodeURI(pathPart)));
  const hash = anchor ? `#${anchor}` : '';
  if (resolved === SPEC) return '/docs/api/endpoints/';
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

// Link text that is only a repo path ("docs/README.md", "`webhooks.md`")
// names the page it leads to instead, when that is a page on this site.
const PATH_TEXT = /^`?[\w./-]+\.(md|ya?ml)`?$/;
function linkText(text, url) {
  if (!PATH_TEXT.test(text.trim())) return text;
  const base = url.split('#')[0];
  return titleOf.get(base) ?? siteTitles[base] ?? text;
}

// Inline code spans are left alone by every text fix below.
function outsideInlineCode(line, fn) {
  return line
    .split(/(`+[^`]*`+)/)
    .map((part, i) => (i % 2 ? part : fn(part)))
    .join('');
}

// A bare placeholder such as <customer id> is read as an HTML tag and
// vanishes; show it as written. Real HTML tags are left alone.
const HTML_TAGS = new Set('a abbr b blockquote br caption cite code col colgroup dd del details dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img input ins kbd li mark ol p picture pre q s samp section small source span strong sub summary sup table tbody td tfoot th thead tr u ul var video wbr svg'.split(' '));
function escapePlaceholders(text) {
  return text.replace(/<(\/?)([A-Za-z][\w.-]*)((?: [\w.-]+)*)>/g, (m, slash, name, rest) =>
    HTML_TAGS.has(name.toLowerCase()) && !rest ? m : `&lt;${slash}${name}${rest}&gt;`,
  );
}

// A table scrolls inside its own box, so a wide one never runs under the
// table of contents. Only tables that start a line are wrapped; one inside a
// list item keeps the stylesheet's fallback.
function wrapTables(chunk) {
  const lines = chunk.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const isStart = /^\|.*\|\s*$/.test(lines[i]) && /^\|\s*:?-{2,}/.test(lines[i + 1] ?? '') && !/^\|/.test(lines[i - 1] ?? '');
    if (!isStart) {
      out.push(lines[i]);
      continue;
    }
    let j = i;
    while (j < lines.length && /^\|/.test(lines[j])) j++;
    out.push('<div class="hc-table">', '', ...lines.slice(i, j), '', '</div>');
    i = j - 1;
  }
  return out.join('\n');
}

function rewriteBody(text, fromFile) {
  // Fenced code blocks are left alone.
  return text
    .split(/(^ *```[\s\S]*?^ *```)/m)
    .map((chunk, i) => {
      if (i % 2 === 1) return chunk;
      chunk = chunk
        .replace(/(!?)\[([^\]]*)\]\((<?)([^)\s>]+)(>?)((?:\s+"[^"]*")?\))/g, (m, bang, txt, lt, t, gt, b) => {
          const url = rewrite(t, fromFile);
          return `${bang}[${bang ? txt : linkText(txt, url)}](${lt}${url}${gt}${b}`;
        })
        .replace(/^(\[[^\]]+\]:\s+)(\S+)/gm, (m, a, t) => a + rewrite(t, fromFile))
        .replace(/\b(src|href)="([^"]+)"/g, (m, a, t) => `${a}="${rewrite(t, fromFile)}"`)
        // The repo moved from getvelox/velox; old links still name it.
        .replace(/https:\/\/github\.com\/getvelox\/velox\//g, `${REPO}/`);
      chunk = chunk
        .split('\n')
        .map((line) => outsideInlineCode(line, escapePlaceholders))
        .join('\n');
      return wrapTables(chunk);
    })
    .join('');
}

function splitFrontmatter(text) {
  if (!text.startsWith('---\n')) return { fm: '', body: text };
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return { fm: '', body: text };
  return { fm: text.slice(4, end), body: text.slice(end + 5) };
}

// Not in search: contributor pages, design records, records and design notes,
// so a reader searching "invoice" finds the user docs first. Design records
// stay one click away.
const unsearched = (slug) => slug.startsWith('contribute') || /^internals\/(decisions|records|design-notes)/.test(slug);

// The first real paragraph, as plain text, for the page's meta description.
// Metadata (Status, Date, Supersedes…) is skipped, as is anything under a
// Status or Date heading, so a design record is described by what it decides.
const META_LINE = /^(\*\*)?(Status|Date|Dates?|Supersedes|Superseded|Superseded by|Amended|Amends|Amendment|Builds on|Deciders|Decided|Authors?|Owner|Related|Updated|Last updated|Accepted|Proposed|Reviewed|Scope|Type|Issue|Issues|PR|Tracking)\b[^\n]{0,40}?(\*\*)?\s*:/i;
const META_HEADING = /^#{2,6}\s+(Status|Date|Deciders|Authors?|Supersedes|Superseded by|Related)\s*$/i;
function firstParagraph(md) {
  const blocks = md
    .replace(/^ *```[\s\S]*?^ *```/gm, '')
    .split(/\n\s*\n/)
    .map((b) => b.trim());
  let underMeta = false;
  for (const b of blocks) {
    if (!b) continue;
    if (/^#/.test(b)) {
      underMeta = META_HEADING.test(b.split('\n')[0]);
      continue;
    }
    if (underMeta) continue;
    if (/^(\||:::|<|!\[|[-*>] |\d+\.\s|\*\*[^*]+:\*\*\s*$)/.test(b)) continue;
    if (META_LINE.test(b)) continue;
    const text = b
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/[*`]/g, '')
      // _emphasis_ marks go; underscores inside names (invoice_id) stay.
      .replace(/(^|[\s(])_+|_+(?=[\s).,;:!?]|$)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length > 200 ? text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : text;
  }
  return '';
}

// Page fixes for a site pinned to one release. Each returns the new body; a
// fix whose text is no longer in the source warns, so it is not kept by habit.
const fixes = {
  // "Read this page at the version you run" links the page to itself here:
  // every page on this site is the release's.
  'docs/first-invoice.md': (body) =>
    replaceOnce(body, /Read this page at the version you run\.[\s\S]*?ahead of that release\.\n/, () => `This page describes ${REF}, the release the quick start runs.\n`, 'docs/first-invoice.md'),
  // The changelog shows the latest releases; the full history is on GitHub.
  'CHANGELOG.md': (body) => {
    const parts = body.split(/^(?=## \[)/m);
    const head = parts[0]
      .split(/\n\s*\n/)
      .filter((b) => !/^How to write an entry/.test(b.trim()) && !/^Long entries from/.test(b.trim()))
      .join('\n\n');
    const releases = parts.slice(1).filter((r) => !/^## \[Unreleased\]\s*$/.test(r.trim()));
    // Releases of the current and the previous minor version, after an
    // Unreleased section that has entries (a release's own is empty).
    const minors = [...new Set(releases.map((r) => r.match(/^## \[(\d+\.\d+)\./)?.[1]).filter(Boolean))].slice(0, 2);
    const kept = releases.filter((r) => /^## \[Unreleased\]/.test(r) || minors.includes(r.match(/^## \[(\d+\.\d+)\./)?.[1]));
    const full = `${REPO}/blob/${REF}/CHANGELOG.md`;
    return `${head.trim()}\n\nThis page shows the ${minors.map((m) => `${m}.x`).join(' and ')} releases. Every earlier release is in the [full changelog on GitHub](${full}).\n\n${kept.join('').trim()}\n\nEarlier releases: [the full changelog on GitHub](${full}).\n`;
  },
};
function replaceOnce(body, re, fn, name) {
  if (!re.test(body)) {
    warn(`${name}: the text a site fix replaces is gone; remove that fix from scripts/sync-docs.mjs.`);
    return body;
  }
  return body.replace(re, fn);
}

function yamlList(head) {
  return head.map((h) => `  - tag: ${h.tag}\n    attrs:\n${Object.entries(h.attrs).map(([k, v]) => `      ${k}: ${JSON.stringify(v)}`).join('\n')}`).join('\n');
}

function writePage(p, title, body) {
  const file = path.join(OUT, `${p.slug}.md`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const description = firstParagraph(body);
  const link = (v) => (v === false ? 'false' : JSON.stringify({ link: pageUrl(v), label: titleOf.get(pageUrl(v)) }));
  const fm = [
    `title: ${JSON.stringify(title)}`,
    description && `description: ${JSON.stringify(description)}`,
    // "View source" opens the file this page shows, at the release.
    p.src && `editUrl: ${JSON.stringify(`${REPO}/blob/${REF}/${p.src}`)}`,
    unsearched(p.slug) && 'pagefind: false',
    p.keywords && `keywords: ${JSON.stringify(p.keywords)}`,
    p.next !== undefined && `next: ${link(p.next)}`,
    p.prev !== undefined && `prev: ${link(p.prev)}`,
    p.noindex && `head:\n${yamlList([{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }])}`,
  ]
    .filter(Boolean)
    .join('\n');
  fs.writeFileSync(file, `---\n${fm}\n---\n\n${body.trimStart()}`);
}

// 3. Write each page.
for (const p of pages) {
  const raw = read(p.src);
  const title = titleOf.get(pageUrl(p.slug));
  let body;
  if (p.src === 'LICENSE') {
    body = 'Hardcount is released under the MIT licence:\n\n```text\n' + raw.trim() + '\n```\n';
  } else {
    // A source file's own metadata block is not used by the site.
    const { body: rest } = splitFrontmatter(raw);
    const h1 = rest.match(/^#\s+(.+)$/m);
    body = h1 ? rest.replace(h1[0], '') : rest;
    if (fixes[p.src]) body = fixes[p.src](body);
    if (p.asCode) {
      // A template is shown as text to copy, so its notes stay visible.
      body = `Copy this into a new file to start a design record.\n\n\`\`\`\`markdown\n${rest.trim()}\n\`\`\`\`\n`;
    } else {
      body = rewriteBody(body, p.src);
    }
    if (p.intro) body = `${p.intro}\n\n${body.trimStart()}`;
  }
  writePage(p, title, body);
}

// 4. The sidebar, for astro.config.mjs.
function toSidebar(items) {
  return items.map((it) => {
    if (it.objects || it.openapi) return it;
    if (it.items) return { label: it.label, collapsed: it.collapsed, items: toSidebar(it.items) };
    const label = it.overview ? 'Overview' : it.label ?? titleOf.get(pageUrl(it.pageSlug)) ?? it.pageSlug;
    return { label, link: `/docs/${it.pageSlug}/` };
  });
}
fs.writeFileSync(
  path.join(GEN, 'sidebar.json'),
  JSON.stringify(sidebar.map((g) => ({ label: g.label, collapsed: g.collapsed, items: toSidebar(g.items) })), null, 2),
);

// 5. Redirects for addresses that are not pages (any more, or yet).
const built = new Set(pages.map((p) => pageUrl(p.slug)));
const redirectMap = {};
for (const [from, to] of Object.entries(redirects)) if (!built.has(from)) redirectMap[from] = to;
for (const [slug, to] of Object.entries(nearestUntilBuilt)) {
  const from = pageUrl(slug);
  if (!built.has(from)) redirectMap[from] = to;
}
for (const p of plannedPages) if (!nearestUntilBuilt[p.slug]) warn(`planned page ${p.slug} has no entry in nearestUntilBuilt`);
fs.writeFileSync(path.join(GEN, 'redirects.json'), JSON.stringify(redirectMap, null, 2));

// 6. Pages left out of llms-full.txt (astro.config.mjs filters it by page
// title after the build): records, the changelog and contributor pages,
// which would crowd out the docs a model needs. A title that an included page
// also has cannot be told apart, so it stays in.
const llmsSkip = (slug) => slug.startsWith('internals/records') || slug === 'project/changelog' || slug.startsWith('contribute');
const skipTitles = new Set(pages.filter((p) => llmsSkip(p.slug)).map((p) => titleOf.get(pageUrl(p.slug))));
for (const p of pages) {
  const t = titleOf.get(pageUrl(p.slug));
  if (!llmsSkip(p.slug) && skipTitles.has(t)) {
    warn(`llms-full: "${t}" is the title of a kept page and a left-out one; both stay in`);
    skipTitles.delete(t);
  }
}
skipTitles.add('Page not found');
fs.writeFileSync(path.join(GEN, 'llms-full-skip.json'), JSON.stringify([...skipTitles].sort(), null, 2));

// 7. The API spec, from the same checkout as the docs. The download
// (/openapi.yaml) and the Objects pages (gen-objects.mjs) use it as it is.
const spec = read(SPEC);
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/openapi.yaml', spec);
fs.writeFileSync(path.join(GEN, 'openapi.yaml'), spec);

// The endpoint reference shows the API an integration calls. Routes marked
// `x-internal: true` (the dashboard's own routes, the receivers Stripe and
// Postmark call, first-run setup) are left out of the copy it reads, and so
// is a tag or a security scheme that no route left uses. Everything else is
// the spec's own text.
const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
function integrationSpec(text) {
  const docu = YAML.parseDocument(text);
  if (docu.errors.length) throw new Error(`${SPEC}: ${docu.errors[0].message}`);
  const paths = docu.get('paths');
  const usedTags = new Set();
  const usedSchemes = new Set();
  for (const req of docu.get('security')?.items ?? []) for (const pair of req.items) usedSchemes.add(String(pair.key.value ?? pair.key));
  const left = [];
  let kept = 0;
  for (const route of paths.items.map((pair) => pair.key.value)) {
    const item = paths.get(route);
    const routeInternal = item.get('x-internal') === true;
    for (const method of METHODS) {
      const op = item.get(method);
      if (!op) continue;
      if (routeInternal || op.get('x-internal') === true) {
        item.delete(method);
        left.push(`${method.toUpperCase()} ${route}`);
        continue;
      }
      kept++;
      for (const tag of op.get('tags')?.items ?? []) usedTags.add(String(tag.value ?? tag));
      for (const req of op.get('security')?.items ?? []) for (const pair of req.items) usedSchemes.add(String(pair.key.value ?? pair.key));
    }
    if (!METHODS.some((m) => item.has(m))) paths.delete(route);
  }
  const tags = docu.get('tags');
  const emptyTags = [];
  if (tags) {
    for (let i = tags.items.length - 1; i >= 0; i--) {
      const name = tags.items[i].get('name');
      if (!usedTags.has(name)) {
        emptyTags.unshift(name);
        tags.delete(i);
      }
    }
  }
  const schemes = docu.getIn(['components', 'securitySchemes']);
  const unusedSchemes = [];
  for (const name of schemes?.items.map((pair) => String(pair.key.value ?? pair.key)) ?? []) {
    if (!usedSchemes.has(name)) {
      unusedSchemes.push(name);
      schemes.delete(name);
    }
  }
  return { text: docu.toString({ lineWidth: 0 }), kept, left, emptyTags, unusedSchemes };
}
const shown = integrationSpec(spec);
fs.writeFileSync(path.join(GEN, 'openapi-integration.yaml'), shown.text);
console.log(
  `endpoint reference: ${shown.kept} operations; ${shown.left.length} marked x-internal left out` +
    (shown.emptyTags.length ? `, with the tags (${shown.emptyTags.join(', ')})` : '') +
    (shown.unusedSchemes.length ? ` and security schemes (${shown.unusedSchemes.join(', ')}) only they used` : ''),
);

console.log(`synced ${pages.length} pages from ${SRC} at ${REF}`);
if (warnings.length) {
  console.log(`${warnings.length} links point to files that do not exist:`);
  for (const w of warnings.slice(0, 40)) console.log('  ' + w);
}
