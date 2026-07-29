// @ts-check
import cloudflare from '@astrojs/cloudflare';
import { defineConfig, passthroughImageService } from 'astro/config';
import icon from 'astro-icon';
import { defaultLocale, locales } from './src/lib/i18n/types.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://paradisefinefoods.com',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: 'manual',
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
    service: passthroughImageService(),
  },
  integrations: [icon()],
});
