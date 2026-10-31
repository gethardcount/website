// Cloudflare Web Analytics counts visits without cookies or personal data, so
// the site needs no cookie banner. The token is public by design: it is in
// every page's source. Used by the site layout and the docs (astro.config.mjs).
export const CF_BEACON_TOKEN = '607cf13e0a9846269f42d8eaa4f5d9a5';

export const cfBeaconAttrs = {
  type: 'module',
  src: 'https://static.cloudflareinsights.com/beacon.min.js',
  'data-cf-beacon': JSON.stringify({ token: CF_BEACON_TOKEN }),
};
