// Every dashboard picture and video on the site, in one place.
//
// A screenshot is two files in public/shots: <name>-light.png and
// <name>-dark.png, shown to match the reader's light or dark setting. A video
// is public/media/<name>.webm with its first frame as <name>-poster.png.
//
// `live: true` files are published and match the release in src/site.ts. The
// others render only when MEDIA_READY (src/site.ts) is true. Before flipping
// it, check each width and height against the file, and each alt text against
// what the picture shows.
import { MEDIA_READY } from '../site';

export type Shot = { name: string; w: number; h: number; alt: string; live: boolean };
export type Video = { name: string; w: number; h: number; label: string };

export const shots = {
  invoice: {
    name: 'invoice', w: 1400, h: 760, live: true,
    alt: 'The lines of the demo invoice in the Hardcount dashboard, for the period Oct 29 to Nov 28, 2026: input, output and cache_read tokens for claude-sonnet-4.5, input and output tokens for claude-haiku-4.5, each priced per 1M tokens, with $5.73 due.',
  },
  margin: {
    name: 'margin', w: 1400, h: 507, live: true,
    alt: 'The Margin card for the demo customer: $5.73 usage billed, $2.76 provider cost and 51.9% margin, with claude-sonnet-4.5 at 67.1% and claude-haiku-4.5 at 20.0%.',
  },
  pricing: {
    name: 'pricing', w: 1400, h: 900, live: false,
    alt: 'A plan in the Hardcount dashboard with its own price for each model and token type.',
  },
  credit: {
    name: 'credit', w: 1400, h: 900, live: false,
    alt: 'A customer’s credit balance in the Hardcount dashboard, with the grants and usage behind it.',
  },
  payments: {
    name: 'payments', w: 1400, h: 900, live: false,
    alt: 'An invoice in the Hardcount dashboard whose card payment failed, with the next retry scheduled.',
  },
  testclock: {
    name: 'testclock', w: 1400, h: 900, live: false,
    alt: 'A test clock in the Hardcount dashboard, moved forward a month, and the invoice it made.',
  },
} satisfies Record<string, Shot>;

export const videos = {
  tour: { name: 'dashboard-tour', w: 1280, h: 720, label: 'A short tour of the Hardcount dashboard after the demo has run.' },
  demo: { name: 'demo-terminal', w: 1280, h: 720, label: 'The quick start demo running in a terminal, from start to finish.' },
} satisfies Record<string, Video>;

export const showShot = (s: Shot) => s.live || MEDIA_READY;
export const showVideos = MEDIA_READY;
