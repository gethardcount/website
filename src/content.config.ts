import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  // `keywords`: words search should find a page by (scripts/docs-map.mjs).
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: z.object({ keywords: z.array(z.string()).optional() }) }) }),
  // Starlight's interface words, where the site says them differently.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
