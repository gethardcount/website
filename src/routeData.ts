import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

// starlight-openapi titles every endpoint group page "Overview" and gives its
// generated pages no description. Name each group page after its group, and
// describe each generated page, so tabs and search results say what they are.
const groups: Record<string, string> = {
  customers: 'Customers', pricing: 'Pricing', subscriptions: 'Subscriptions', usage: 'Usage',
  invoices: 'Invoices', creditnotes: 'Credit notes', credits: 'Credits', billing: 'Billing',
  dunning: 'Dunning', webhooks: 'Webhooks', auth: 'Authentication', members: 'Team members',
  providercosts: 'Provider costs', testclocks: 'Test clocks', recipes: 'Recipes',
  public: 'Public pages', system: 'System',
};
const ENDPOINTS = '/docs/api/endpoints/';
const TAG_PAGE = /^\/docs\/api\/endpoints\/operations\/tags\/([^/]+)\/?$/;

type Entry = { type: 'link'; label: string; href: string } | { type: 'group'; label: string; entries: Entry[] };

// A sidebar label for an endpoint: its summary without the asides, so
// "Batch ingest usage events (max 1000, all-or-nothing)" reads "Batch ingest
// usage events". The page keeps the full summary as its title.
const shortLabel = (label: string) => label.replace(/\s*\([^)]*\)/g, '').replace(/;.*$/, '').trim();

function relabel(entries: Entry[], inEndpoints = false): void {
  for (const e of entries) {
    if (e.type === 'group') {
      // An endpoint group is named after its spec tag ("CreditNotes").
      if (inEndpoints) e.label = groups[e.label.toLowerCase()] ?? e.label;
      relabel(e.entries, inEndpoints || e.label === 'Endpoints');
      continue;
    }
    if (!inEndpoints && !e.href.startsWith(ENDPOINTS)) continue;
    const tag = e.href.match(TAG_PAGE)?.[1];
    if (e.href.replace(/\/?$/, '/') === ENDPOINTS) e.label = 'All endpoints';
    else if (tag) e.label = groups[tag] ?? tag;
    else if (e.href.startsWith(ENDPOINTS)) e.label = shortLabel(e.label);
  }
}

export const onRequest = defineRouteMiddleware(async (context, next) => {
  const route = context.locals.starlightRoute;
  const data = route.entry.data;
  const path = context.url.pathname.replace(/\/$/, '');

  // The 404 page has no address of its own: no canonical link, and kept out
  // of search engines.
  if (route.entry.id === '404') {
    route.head = route.head.filter((h) => !(h.tag === 'link' && h.attrs?.rel === 'canonical') && !(h.tag === 'meta' && h.attrs?.property === 'og:url'));
    route.head.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } });
    return;
  }

  if (path.startsWith('/docs/api/endpoints')) {
    let title = data.title;
    if (title === 'Overview') {
      const tag = `${path}/`.match(TAG_PAGE)?.[1];
      title = path === '/docs/api/endpoints' ? 'API endpoints' : `${groups[tag ?? ''] ?? tag} endpoints`;
    }
    const description = data.description ?? `${title}: part of the Hardcount API reference.`;
    data.title = title;
    data.description = description;

    // The <head> was built before this middleware runs, so update it too.
    for (const h of route.head) {
      if (h.tag === 'title') h.content = `${title} | Hardcount`;
      if (h.tag === 'meta' && h.attrs?.property === 'og:title') h.attrs.content = title;
    }
    if (!route.head.some((h) => h.tag === 'meta' && h.attrs?.name === 'description')) {
      route.head.push({ tag: 'meta', attrs: { name: 'description', content: description } });
    }
  }

  // starlight-openapi builds the endpoint sidebar and the previous and next
  // links after this point, so the label fixes run once it has.
  await next();
  relabel(route.sidebar as Entry[]);
  // The previous and next links share objects with the sidebar, so each gets
  // a copy; out of the sidebar's context a group page says "… endpoints".
  const fix = <T extends { href: string; label: string }>(link: T | undefined): T | undefined => {
    if (!link) return link;
    const tag = link.href.match(TAG_PAGE)?.[1];
    if (link.href.replace(/\/?$/, '/') === ENDPOINTS) return { ...link, label: 'All endpoints' };
    if (tag) return { ...link, label: `${groups[tag] ?? tag} endpoints` };
    if (link.href.startsWith(ENDPOINTS)) return { ...link, label: shortLabel(link.label) };
    return link;
  };
  route.pagination.prev = fix(route.pagination.prev);
  route.pagination.next = fix(route.pagination.next);
  // The API section ends at Webhook events; its last page does not lead
  // into Self-host.
  if (route.pagination.next?.href.startsWith('/docs/self-host/') && path.startsWith('/docs/api')) route.pagination.next = undefined;
});
