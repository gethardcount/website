import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import starlightLlmsTxt from 'starlight-llms-txt';
import mermaid from 'astro-mermaid';
import { cfBeaconAttrs } from './src/analytics.mjs';

// Written by scripts/sync-docs.mjs and scripts/gen-objects.mjs (npm run sync).
const readGenerated = (name) => JSON.parse(fs.readFileSync(`./src/generated/${name}`, 'utf8'));
const sidebar = readGenerated('sidebar.json');
const objects = readGenerated('objects.json');
const redirects = readGenerated('redirects.json');
const llmsFullSkip = new Set(readGenerated('llms-full-skip.json'));

const SITE = 'https://gethardcount.com';
const RELEASE = fs.readFileSync('./src/site.ts', 'utf8').match(/^export const RELEASE = '(.*)';/m)[1];

function toStarlight(items) {
  return items.flatMap((it) => {
    if (it.objects) return [{ label: it.label, collapsed: true, items: [{ label: 'All objects', link: '/docs/api/objects/' }, ...objects] }];
    if (it.openapi) return openAPISidebarGroups;
    if (it.items) return [{ label: it.label, collapsed: it.collapsed, items: toStarlight(it.items) }];
    return [it];
  });
}

// Pages are separated by this marker in llms-full.txt and llms-small.txt, so
// the step below can drop whole pages; it is turned back into a blank line.
const PAGE_MARK = '\n\n<!-- hc-page -->\n\n';

// llms-full.txt has no exclude option, so after the build it drops the pages
// sync-docs.mjs lists (records, the changelog, contributor pages, the 404).
const llmsTrim = {
  name: 'hc-llms-trim',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const out = fileURLToPath(dir);
      for (const file of ['llms-full.txt', 'llms-small.txt']) {
        const p = path.join(out, file);
        if (!fs.existsSync(p)) continue;
        const pages = fs.readFileSync(p, 'utf8').split(PAGE_MARK);
        const kept = pages.filter((page) => !llmsFullSkip.has(page.match(/^# (.+)$/m)?.[1]?.trim()));
        fs.writeFileSync(p, kept.join('\n\n'));
      }
    },
  },
};

// Every endpoint page carries the same curl and fetch samples, so words such
// as "url" matched every one of them. Before Starlight builds the search index
// (this integration is listed first, so its hook runs first), the samples are
// marked to be skipped by search. The pages look the same.
const searchPrep = {
  name: 'hc-search-prep',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
      const root = path.join(fileURLToPath(dir), 'docs/api/endpoints');
      if (!fs.existsSync(root)) return;
      for (const file of walk(root).filter((f) => f.endsWith('.html'))) {
        const html = fs.readFileSync(file, 'utf8');
        const out = html
          .replace(/<div class="sl-openapi-snippets /g, '<div data-pagefind-ignore class="sl-openapi-snippets ')
          .replace(/<sl-openapi-snippet-picker /g, '<sl-openapi-snippet-picker data-pagefind-ignore ');
        if (out !== html) fs.writeFileSync(file, out);
      }
    },
  },
};

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  redirects,
  integrations: [
    searchPrep,
    mermaid({ theme: 'neutral', autoTheme: true, enableLog: false }),
    starlight({
      title: 'Hardcount',
      customCss: ['./src/styles/starlight.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap' } },
        // Starlight links /favicon.svg itself; these are the fallbacks.
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
        // The same card as the website pages when a docs link is shared.
        { tag: 'meta', attrs: { property: 'og:image', content: `${SITE}/og.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1280' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '640' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Hardcount: open-source usage billing for AI products, on your own servers.' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#F6F0E4', media: '(prefers-color-scheme: light)' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#1B1814', media: '(prefers-color-scheme: dark)' } },
        { tag: 'script', attrs: cfBeaconAttrs },
      ],
      components: {
        Header: './src/components/DocsHeader.astro',
        Sidebar: './src/components/DocsSidebar.astro',
        Banner: './src/components/DocsBanner.astro',
        MarkdownContent: './src/components/DocsContent.astro',
        PageTitle: './src/components/DocsTitle.astro',
      },
      routeMiddleware: './src/routeData.ts',
      // A page title counts as much as its body text, not five times as much,
      // so endpoint titles that share a word ("rate") do not bury the page
      // that explains the topic ("rate limit").
      pagefind: { ranking: { metaWeights: { title: 1 } } },
      sidebar: toStarlight(sidebar),
      plugins: [
        starlightOpenAPI([
          { base: 'docs/api/endpoints', schema: './src/generated/openapi.yaml', sidebar: { label: 'Endpoints', collapsed: true } },
        ]),
        starlightLlmsTxt({
          description: 'Hardcount is an open-source (MIT), self-hosted usage-billing engine for AI products: it prices tokens per model, sells prepaid credit, shows margin per customer, makes invoices, and charges cards through Stripe.',
          details: [
            `These docs describe Hardcount ${RELEASE}. The API reference is the OpenAPI spec below.`,
            '',
            `- [OpenAPI spec](${SITE}/openapi.yaml): every endpoint, request and response; use it to generate a client`,
            `- [Product](${SITE}/product/): what Hardcount does`,
            `- [Pricing](${SITE}/pricing/): free and MIT-licensed; what running it costs`,
            `- [Compare](${SITE}/compare/): Hardcount next to Stripe Billing, Lago, OpenMeter, Flexprice and Kill Bill`,
            `- [FAQ](${SITE}/faq/): cost, safety for real money, lock-in, who maintains it`,
          ].join('\n'),
          pageSeparator: PAGE_MARK,
          // The abridged file keeps what a developer needs to integrate: getting
          // started, concepts, guides and the API pages (not every object).
          exclude: ['!{docs,docs/get-started/**,docs/concepts/**,docs/guides/**,docs/api/*}'],
          // Both files open with the pages a newcomer reads first.
          promote: ['docs', 'docs/get-started/**', 'docs/concepts/**', 'docs/guides/**', 'docs/api/*'],
        }),
      ],
    }),
    llmsTrim,
  ],
});
