import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

const localizedRoutes = [
  'src/pages/[locale]/index.astro',
  'src/pages/[locale]/products/index.astro',
  'src/pages/[locale]/products/[slug].astro',
  'src/pages/[locale]/brands/index.astro',
  'src/pages/[locale]/brands/[slug].astro',
  'src/pages/[locale]/blogs/index.astro',
  'src/pages/[locale]/blogs/[slug].astro',
  'src/pages/[locale]/contact.astro',
  'src/pages/[locale]/contact/[mode].astro',
];

describe('localized SSR routes', () => {
  test('resolves every localized page from validated request params', () => {
    for (const routePath of localizedRoutes) {
      const route = source(routePath);

      expect(route).toContain('Astro.params');
      expect(route).toContain('isLocale');
      expect(route).not.toContain('getStaticPaths');
      expect(route).not.toContain('Astro.props');
      expect(route).not.toContain('InferGetStatic');
    }
  });

  test('resolves detail content at request time and handles unknown params', () => {
    const product = source('src/pages/[locale]/products/[slug].astro');
    const brand = source('src/pages/[locale]/brands/[slug].astro');
    const blog = source('src/pages/[locale]/blogs/[slug].astro');
    const blogData = source('src/lib/blogs/routes.ts');
    const contactMode = source('src/pages/[locale]/contact/[mode].astro');

    expect(product).toContain('getProductBySlug(locale, slug)');
    expect(brand).toContain('getBrandBySlug(locale, slug)');
    expect(blog).toContain('loadBlogDetailPageData(locale, slug)');
    expect(blogData).toContain('queries.getBlogPostBySlug(locale, slug)');
    expect(contactMode).toContain('isContactMode(modeParam)');

    for (const route of [product, brand, blog, contactMode]) {
      expect(route).toContain('markNotFound(Astro.response)');
      expect(route).toContain("return Astro.rewrite('/404')");
    }
  });

  test('maps CMS failures to the noindex 503 route and supplies CMS settings to layouts', () => {
    for (const routePath of localizedRoutes) {
      const route = source(routePath);
      if (routePath.endsWith('blogs/[slug].astro')) {
        expect(route).toContain('loadBlogDetailPageData');
        expect(source('src/lib/blogs/routes.ts')).toContain('loadCmsPageData');
      } else {
        expect(route).toContain('loadCmsPageData');
      }
      expect(route).toContain("return Astro.rewrite('/503')");
      expect(route).toContain('settings={settings}');
    }

    const unavailable = source('src/pages/503.astro');
    expect(unavailable).toContain('Astro.response.status = 503');
    expect(unavailable).toContain('<meta name="robots" content="noindex"');
  });

  test('uses stable detail counterparts without querying a second locale index', () => {
    const product = source('src/pages/[locale]/products/[slug].astro');
    const brand = source('src/pages/[locale]/brands/[slug].astro');
    const blog = source('src/pages/[locale]/blogs/[slug].astro');

    expect(product).toContain('productAlternatePath(locale, product)');
    expect(product).not.toContain('counterpartProducts');
    expect(brand).toContain('brandAlternatePath(locale, brand)');
    expect(brand).not.toContain('counterpartBrands');
    expect(blog).toContain('blogAlternatePath(locale, post)');
    expect(blog).not.toContain('counterpartPosts');
  });

  test('renders localized CMS store information through the shared layout footer', () => {
    const layout = source('src/layouts/SiteLayout.astro');
    const footer = source('src/components/global/Footer.astro');

    expect(layout).toContain('settings: GlobalSettings');
    expect(layout).toContain('store={settings.store}');
    for (const field of ['store.address', 'store.email', 'store.phone', 'store.footerCopy']) {
      expect(footer).toContain(field);
    }
  });
});
