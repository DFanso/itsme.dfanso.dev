// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: new Date(),
    }),
  ],
  output: 'static',
  adapter: vercel({ 
    webAnalytics: { enabled: true }
  }),
  site: 'https://itsme.dfanso.dev',
});