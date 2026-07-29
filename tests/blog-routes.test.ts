import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getBlogPosts, getGlobalSettings } from './fixtures/directus';
import type { BlogPost } from '../src/lib/cms/types';
import {
  blogAlternatePath,
  loadBlogDetailPageData,
} from '../src/lib/blogs/routes';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('localized blog routes', () => {
  test('defines one localized index and one localized detail route shape', () => {
    for (const path of ['src/pages/[locale]/blogs/index.astro', 'src/pages/[locale]/blogs/[slug].astro']) {
      expect(existsSync(join(root, path))).toBe(true);
    }
  });

  test('keeps route pages behind runtime CMS queries and reciprocal stable IDs', () => {
    const index = source('src/pages/[locale]/blogs/index.astro');
    const detail = source('src/pages/[locale]/blogs/[slug].astro');
    const routeData = source('src/lib/blogs/routes.ts');

    expect(index).toContain('getBlogPosts(locale)');
    expect(detail).toContain('loadBlogDetailPageData(locale, slug)');
    expect(routeData).toContain('queries.getBlogPostBySlug(locale, slug)');
    expect(routeData).toContain('queries.getLatestBlogPosts(locale, 3, post.id)');
    expect(detail).toContain('blogAlternatePath(locale, post)');
    expect(detail).not.toContain('counterpartPosts');
    expect(detail).toContain("return Astro.rewrite('/404')");
    expect(detail).not.toContain('getStaticPaths');
    expect(`${index}\n${detail}`).not.toMatch(/demo-data|demoBlogPosts/);
  });

  test('uses the mapped stable counterpart or the opposite-locale blog index', async () => {
    const [english] = await getBlogPosts('en');

    expect(english).toBeDefined();
    expect(blogAlternatePath('en', english!)).toBe(
      `/vi/blogs/${english!.counterpart!.slug}/`,
    );
    expect(blogAlternatePath('en', { counterpart: undefined })).toBe('/vi/blogs/');
    expect(blogAlternatePath('vi', { counterpart: undefined })).toBe('/en/blogs/');
  });

  test('resolves posts added at runtime and returns 404 for unknown or unpublished slugs', async () => {
    const [basePost, ...otherPosts] = await getBlogPosts('en');
    const records: Array<{ status: 'draft' | 'published'; post: BlogPost }> = [{
      status: 'draft',
      post: { ...basePost!, id: 'draft-story', slug: 'draft-story' },
    }];
    const queries = {
      getGlobalSettings,
      getBlogPostBySlug: async (_locale: 'en' | 'vi', slug: string) =>
        records.find((record) => record.status === 'published' && record.post.slug === slug)?.post,
      getLatestBlogPosts: async (_locale: 'en' | 'vi', limit: number, excludeId?: string) =>
        otherPosts.filter(({ id }) => id !== excludeId).slice(0, limit),
    };

    records.push({
      status: 'published',
      post: { ...basePost!, id: 'published-after-start', slug: 'published-after-start' },
    });
    const found = await loadBlogDetailPageData('en', 'published-after-start', queries);
    expect(found.status).toBe(200);
    if (found.status !== 200) throw new Error(`expected runtime post, received ${found.status}`);
    expect(found.post.id).toBe('published-after-start');
    expect(found.suggestions.every(({ id }) => id !== 'published-after-start')).toBe(true);
    expect((await loadBlogDetailPageData('en', 'draft-story', queries)).status).toBe(404);
    expect((await loadBlogDetailPageData('en', 'missing-story', queries)).status).toBe(404);
  });

  test('renders semantic index, empty state, article, breadcrumbs, and suggestions', () => {
    const index = source('src/pages/[locale]/blogs/index.astro');
    const detail = source('src/pages/[locale]/blogs/[slug].astro');

    expect(index).toContain('data-blog-index');
    expect(index).toContain('posts.length > 0');
    expect(index).toContain("variant={index === 0 ? 'lead' : 'standard'}");
    expect(detail).toContain('<BlogArticle');
    expect(detail).toContain('<LatestBlogs');
    expect(detail).toContain('post.image.src');
    expect(`${index}\n${detail}`).toContain('<Breadcrumbs');
  });

  test('keeps editorial index stages flat and image-forward without changing the route data flow', () => {
    const index = source('src/pages/[locale]/blogs/index.astro');

    expect(index).toContain('.blog-index__grid { display: grid; gap: var(--space-5);');
    expect(index).toContain('.blog-index__empty { border-block: 1px solid var(--color-brushed-steel);');
    expect(index).not.toContain('.blog-index__empty { background: var(--color-cold-paper); border: 1px solid');
  });
});
