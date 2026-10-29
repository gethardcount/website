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

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const data = route.entry.data;
  const path = context.url.pathname.replace(/\/$/, '');
  if (!path.startsWith('/docs/api/endpoints')) return;

  let title = data.title;
  if (title === 'Overview') {
    const tag = path.match(/^\/docs\/api\/endpoints\/operations\/tags\/([^/]+)$/)?.[1];
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
});
