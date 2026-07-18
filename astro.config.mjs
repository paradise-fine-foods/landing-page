// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import icon from 'astro-icon';
import { defaultLocale, locales } from './src/lib/i18n/types.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://paradisefinefoods.com',
  output: 'static',

  redirects: {
    '/vi/san-pham': '/vi/products',
    '/vi/thuong-hieu': '/vi/brands',
    '/vi/lien-he': '/vi/contact',
  },

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
    service: passthroughImageService(),
  },
  integrations: [icon()],
});
