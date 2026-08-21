import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';

import { resolveConfig } from '../node_modules/astro/dist/core/config/config.js';
import { createSettings } from '../node_modules/astro/dist/core/config/settings.js';
import { AstroLogger } from '../node_modules/astro/dist/core/logger/core.js';
import astroPlugin from '../node_modules/astro/dist/vite-plugin-astro/index.js';
import {
  loadRelatedProducts,
  type RelatedProductCriteria,
} from '../src/lib/catalog/related-products';
import { loadBlogSuggestions } from '../src/lib/blogs/suggestions';
import type { Product } from '../src/lib/cms/types';
import { getBlogPosts, getProducts } from './fixtures/directus';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');
let vite: ViteDevServer;

beforeAll(async () => {
  const { astroConfig } = await resolveConfig({ root, configFile: false }, 'dev');
  const settings = await createSettings(astroConfig, 'silent', root);
  const logger = new AstroLogger({
    level: 'silent',
    destination: { write: () => undefined },
  });
  vite = await createServer({
    root,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
    plugins: astroPlugin({ settings, logger }),
  });
});

afterAll(async () => {
  await vite?.close();
});

const component = async (path: string) =>
  (await vite.ssrLoadModule(path)).default;

const unrelatedProduct = (product: Product): Product => ({
  ...structuredClone(product),
  id: 'unrelated-product',
  brand: { ...structuredClone(product.brand), id: 'unrelated-brand' },
  categories: product.categories.map((category) => ({
    ...structuredClone(category),
    id: `unrelated-${category.id}`,
  })),
});

describe('deferred recommendation query behavior', () => {
  test('queries and limits related products from stable relation IDs while excluding the current product', async () => {
    const products = await getProducts('en');
    const current = products[0]!;
    const related = Array.from({ length: 4 }, (_, index) => ({
      ...structuredClone(current),
      id: `related-${index + 1}`,
      slug: `related-${index + 1}`,
    }));
    const criteria: RelatedProductCriteria = {
      productId: current.id,
      brandId: current.brand.id,
      categoryIds: current.categories.map(({ id }) => id),
    };
    const calls: string[] = [];

    const result = await loadRelatedProducts('en', criteria, async (locale) => {
      calls.push(locale);
      return [current, unrelatedProduct(current), ...related];
    });

    expect(calls).toEqual(['en']);
    expect(result.map(({ id }) => id)).toEqual(['related-1', 'related-2', 'related-3']);
    expect(result.some(({ id }) => id === current.id)).toBe(false);
    expect(result.some(({ id }) => id === 'unrelated-product')).toBe(false);
  });

  test('passes the stable current-post ID to the latest query and defensively excludes it', async () => {
    const posts = await getBlogPosts('vi');
    const current = posts[0]!;
    const calls: Array<[string, number, string | undefined]> = [];

    const result = await loadBlogSuggestions(
      'vi',
      current.id,
      async (locale, limit, excludeId) => {
        calls.push([locale, limit, excludeId]);
        return [current, ...posts.slice(1), { ...structuredClone(current), id: 'new-story' }];
      },
    );

    expect(calls).toEqual([['vi', 3, current.id]]);
    expect(result).toHaveLength(3);
    expect(result.every(({ id }) => id !== current.id)).toBe(true);
  });
});

describe('Astro server-island boundaries', () => {
  test('defers only detail-page recommendations and passes stable IDs instead of prefetched arrays', () => {
    const productRoute = source('src/pages/[locale]/products/[slug].astro');
    const blogRoute = source('src/pages/[locale]/blogs/[slug].astro');
    const productIsland = source('src/components/catalog/RelatedProductsIsland.astro');
    const blogIsland = source('src/components/blogs/BlogSuggestionsIsland.astro');
    const blogData = source('src/lib/blogs/routes.ts');
    const allAstro = [...new Bun.Glob('src/**/*.astro').scanSync({ cwd: root, onlyFiles: true })]
      .map((path) => source(path));

    expect(productRoute).toContain('<ProductDetail');
    expect(productRoute).toContain('<RelatedProductsIsland');
    expect(productRoute.indexOf('<ProductDetail')).toBeLessThan(productRoute.indexOf('<RelatedProductsIsland'));
    expect(productRoute).toContain('currentProductId={product.id}');
    expect(productRoute).toContain('brandId={product.brand.id}');
    expect(productRoute).toContain('categoryIds={product.categories.map(({ id }) => id)}');
    expect(productRoute).not.toContain('getProducts(locale)');
    expect(productRoute).not.toContain('relatedProducts=');

    expect(blogRoute).toContain('<BlogArticle');
    expect(blogRoute).toContain('<BlogSuggestionsIsland');
    expect(blogRoute.indexOf('<BlogArticle')).toBeLessThan(blogRoute.indexOf('<BlogSuggestionsIsland'));
    expect(blogRoute).toContain('currentPostId={post.id}');
    expect(blogRoute).not.toContain('suggestions=');
    expect(blogData).not.toContain('getLatestBlogPosts');

    expect(productRoute).toContain('server:defer');
    expect(blogRoute).toContain('server:defer');
    expect(productRoute).toContain('<CardSkeleton slot="fallback"');
    expect(blogRoute).toContain('<CardSkeleton slot="fallback"');
    expect(allAstro.reduce((count, value) => count + (value.match(/server:defer/g)?.length ?? 0), 0)).toBe(3);

    expect(productIsland).toContain('await loadRelatedProducts(locale');
    expect(blogIsland).toContain('await loadBlogSuggestions(locale');
  });

  test('renders an accessible fixed-layout skeleton and disables its animation for reduced motion', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(
      await component('/src/components/global/CardSkeleton.astro'),
      { props: { label: 'Loading related products', title: 'Related products', count: 3 } },
    );
    const skeletonSource = source('src/components/global/CardSkeleton.astro');

    expect(html).toMatch(/<section\b(?=[^>]*\brole="status")(?=[^>]*\baria-live="polite")(?=[^>]*\baria-busy="true")[^>]*>/);
    expect(html).toContain('Loading related products');
    expect(html.match(/data-card-skeleton-card/g)).toHaveLength(3);
    expect(skeletonSource).toContain('min-block-size: 22rem');
    expect(skeletonSource).toContain('aspect-ratio: 4 / 3');
    expect(skeletonSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(skeletonSource).toContain('animation: none');
  });

  test('keeps the article hero as explicit high-priority initial content', () => {
    const article = source('src/components/blogs/BlogArticle.astro');
    const route = source('src/pages/[locale]/blogs/[slug].astro');

    expect(article).toContain('loading="eager"');
    expect(article).toContain('fetchpriority="high"');
    expect(route).toContain('preloadImages={[{ href: post.image.src }]}');
  });
});
