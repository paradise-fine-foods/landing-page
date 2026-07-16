// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://demo.paradisefinefoods.com',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },
  image: { responsiveStyles: true, layout: 'constrained' },
});
