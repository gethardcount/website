// Every dashboard picture and video on the site, in one place.
//
// A screenshot is two files in public/shots: <name>-light.png and
// <name>-dark.png, shown to match the reader's light or dark setting. A video
// is public/media/<name>.webm, narrated, with a still from it as
// <name>-poster.png and captions of its narration as <name>.vtt.
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
    name: 'invoice', w: 2128, h: 1094, live: true,
    alt: 'The lines of the demo invoice in the Hardcount dashboard, issued Dec 1, 2026 for the period Nov 1 to Nov 30, 2026: input, output and cache_read tokens for claude-sonnet-4.5, input and output tokens for claude-haiku-4.5, each priced per 1M tokens, with $5.73 due.',
  },
  margin: {
    name: 'margin', w: 1510, h: 812, live: true,
    alt: 'The Margin card for the demo customer’s last invoiced period, Nov 1 to Nov 30, 2026: $5.73 usage billed, $2.76 provider cost and 51.9% margin, with claude-sonnet-4.5 at 67.1% and claude-haiku-4.5 at 20.0%.',
  },
  pricing: {
    name: 'pricing', w: 2256, h: 920, live: false,
    alt: 'The usage prices of the AI API plan in the Hardcount dashboard: one row per Claude model and one column per token type (input, output, cache_read, cache_write_5m, cache_write_1h), each a price per 1M tokens, such as $3.00 input and $15.00 output for claude-sonnet-4.5.',
  },
  credit: {
    name: 'credit', w: 2256, h: 842, live: false,
    alt: 'A demo customer’s credit in the Hardcount dashboard: a $54.27 balance from a $50.00 prepaid top-up and a $10.00 promotional welcome credit, less $5.73 applied to invoice HC-000001.',
  },
  payments: {
    name: 'payments', w: 2256, h: 1312, live: false,
    alt: 'An invoice in the Hardcount dashboard whose card Stripe declined: the $5.73 payment and its first retry both failed with “Card declined by the bank”, payment recovery is running, and the next retry is on Dec 8, 2026.',
  },
  testclock: {
    name: 'testclock', w: 2256, h: 1462, live: false,
    alt: 'A test clock in the Hardcount dashboard, moved forward a month from Nov 1 to Dec 3, 2026, with one invoice generated, and the demo customer and its subscription on the clock.',
  },
} satisfies Record<string, Shot>;

export const videos = {
  walkthrough: { name: 'demo-walkthrough', w: 1280, h: 720, label: 'A narrated walkthrough, with captions: the quick start demo runs in a terminal, then the dashboard shows what it made.' },
} satisfies Record<string, Video>;

export const showShot = (s: Shot) => s.live || MEDIA_READY;
export const showVideos = MEDIA_READY;
