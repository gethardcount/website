// One place for the site's shared words and links. Page copy lives in the pages.
export const REPO = 'https://github.com/gethardcount/hardcount';
// Doc links pin the release, so the site describes the code people install.
export const RELEASE = 'v0.9.1';
// The release's date, as the changelog heading gives it, and for reading.
export const RELEASE_ISO = '2026-10-29';
export const RELEASE_DATE = '29 Oct 2026';
// The release's entry in the changelog page ("## [0.9.1] - 2026-10-29").
export const WHATS_NEW = `/docs/project/changelog/#${RELEASE.slice(1).replaceAll('.', '')}---${RELEASE_ISO}`;
// Screenshots and videos of the dashboard, listed in src/data/media.ts. The
// ones marked `live` match the release now. The rest, and the videos, show
// only once this is true: flip it with the release bump whose UI they show,
// after copying the files in and setting each width and height to the file's.
export const MEDIA_READY = false;
import { sections, movedToSite } from '../scripts/docs-map.mjs';

// Where each repo doc is shown on this site, from scripts/docs-map.mjs.
const docPages = new Map<string, string>(Object.entries(movedToSite));
for (const section of sections) {
  for (const item of section.items) {
    if (item.src) docPages.set(item.src, `/docs/${item.slug}/`);
  }
}

// doc('payments.md') → the site page that shows docs/payments.md. A doc the
// map does not know fails the build, so no page links back to GitHub.
export const doc = (path: string) => {
  const [file, hash] = path.split('#');
  const url = docPages.get(`docs/${file}`);
  if (!url) throw new Error(`doc(): docs/${file} is not in scripts/docs-map.mjs`);
  return hash ? `${url}#${hash}` : url;
};

// code('internal/config/config.go') → that file on GitHub at the release.
export const code = (path: string) => `${REPO}/blob/${RELEASE}/${path}`;
export const DISCUSSIONS = `${REPO}/discussions`;
// Questions about using Hardcount: the Q&A category of Discussions.
export const ASK = `${REPO}/discussions/categories/q-a`;
// The pinned "Start here: try Hardcount, then tell us where you got stuck".
export const START_HERE = `${REPO}/discussions/1057`;
// The issue form picker (bug report or feature request).
export const NEW_ISSUE = `${REPO}/issues/new/choose`;
export const CONTACT_EMAIL = 'sagar@sagarwaidande.org';
// Every "Run it locally" button goes here.
export const QUICK_START = '/docs/get-started/quick-start/';

// Row 7 of the approved copy: the same words on every page. The last part
// links to the FAQ answer about real money (src/components/StatusLine.astro).
export const STATUS_PARTS = ['Pre-1.0', 'one maintainer', 'Stripe and cards only', 'no SDKs (client libraries) yet'];
export const STATUS_HONEST = { text: 'no production users yet', href: '/faq/#safe-for-real-money' };

export const NAV: { label: string; href: string }[] = [
  { label: 'Product', href: '/product/' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Reliability', href: '/reliability/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'GitHub', href: REPO },
];
