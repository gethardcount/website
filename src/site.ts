// One place for the site's shared words and links. Page copy lives in the pages.
export const REPO = 'https://github.com/gethardcount/hardcount';
// Doc links pin the release, so the site describes the code people install.
export const RELEASE = 'v0.9.1';
export const doc = (path: string) => `${REPO}/blob/${RELEASE}/docs/${path}`;
export const DISCUSSIONS = `${REPO}/discussions`;
export const CONTACT_EMAIL = 'sagar@sagarwaidande.org';

// Row 7 of the approved copy: the same words on every page.
export const STATUS_LINE =
  'Pre-1.0 · one maintainer · Stripe and cards only · no SDKs (client libraries) yet · no production users yet.';

export const NAV: { label: string; href: string }[] = [
  { label: 'Why', href: '/#why' },
  { label: 'How it works', href: '/#how' },
  { label: 'Compare', href: '/compare' },
  { label: 'Docs', href: doc('README.md') },
  { label: 'GitHub', href: REPO },
];
