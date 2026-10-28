// One place for the site's shared words and links. Page copy lives in the pages.
export const REPO = 'https://github.com/gethardcount/hardcount';
export const DOCS = `${REPO}/tree/v0.9.0/docs`;
export const QUICKSTART = `${REPO}/blob/v0.9.0/docs/quick-start.md`;
export const DISCUSSIONS = `${REPO}/discussions`;
export const CONTACT_EMAIL = 'sagar@sagarwaidande.org';

// Row 7 of the approved copy: the same words on every page.
export const STATUS_LINE =
  'Pre-1.0 · one maintainer · Stripe and cards only · no SDKs (client libraries) yet · no production users yet.';

// Filled from the copy deck (velox-ops/marketing/site-copy-2026-10-29.md).
export const NAV: { label: string; href: string }[] = [
  { label: 'Docs', href: DOCS },
  { label: 'GitHub', href: REPO },
];
