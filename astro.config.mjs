import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import starlightLlmsTxt from 'starlight-llms-txt';
import mermaid from 'astro-mermaid';

// Written by scripts/sync-docs.mjs and scripts/gen-objects.mjs (npm run sync).
const sidebar = JSON.parse(fs.readFileSync('./src/generated/sidebar.json', 'utf8'));
const objects = JSON.parse(fs.readFileSync('./src/generated/objects.json', 'utf8'));

function toStarlight(items) {
  return items.flatMap((it) => {
    if (it.objects) return [{ label: it.label, collapsed: true, items: [{ label: 'All objects', link: '/docs/api/objects/' }, ...objects] }];
    if (it.openapi) return openAPISidebarGroups;
    if (it.items) return [{ label: it.label, collapsed: it.collapsed, items: toStarlight(it.items) }];
    return [it];
  });
}

export default defineConfig({
  site: 'https://gethardcount.com',
  trailingSlash: 'ignore',
  integrations: [
    mermaid({ theme: 'neutral', autoTheme: true, enableLog: false }),
    starlight({
      title: 'Hardcount',
      customCss: ['./src/styles/starlight.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap' } },
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' } },
      ],
      components: {
        Header: './src/components/DocsHeader.astro',
        Sidebar: './src/components/DocsSidebar.astro',
        Banner: './src/components/DocsBanner.astro',
      },
      routeMiddleware: './src/routeData.ts',
      sidebar: toStarlight(sidebar),
      plugins: [
        starlightOpenAPI([
          { base: 'docs/api/endpoints', schema: './src/generated/openapi.yaml', sidebar: { label: 'Endpoints', collapsed: true } },
        ]),
        starlightLlmsTxt({
          description: 'Hardcount is an open-source (MIT), self-hosted usage-billing engine for AI products: it prices tokens per model, sells prepaid credit, shows margin per customer, makes invoices, and charges cards through Stripe.',
        }),
      ],
    }),
  ],
});
