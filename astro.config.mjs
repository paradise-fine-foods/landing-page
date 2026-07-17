// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://demo.paradisefinefoods.com',
  output: 'static',
  redirects: {
    '/vi/san-pham': '/vi/products',
    '/vi/san-pham/[slug]': '/vi/products/[slug]',
    '/vi/thuong-hieu': '/vi/brands',
    '/vi/thuong-hieu/[slug]': '/vi/brands/[slug]',
    '/vi/lien-he': '/vi/contact',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },
  image: { responsiveStyles: true, layout: 'constrained' },
  integrations: [icon()],
});
