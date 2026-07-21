import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('localized blog routes', () => {
  test('defines one localized index and one localized detail route shape', () => {
    for (const path of ['src/pages/[locale]/blogs/index.astro', 'src/pages/[locale]/blogs/[slug].astro']) {
      expect(existsSync(join(root, path))).toBe(true);
    }
  });

  test('keeps route pages behind CMS queries and reciprocal stable-ID maps', () => {
    const index = source('src/pages/[locale]/blogs/index.astro');
    const detail = source('src/pages/[locale]/blogs/[slug].astro');

    expect(index).toContain('getBlogPosts(locale)');
    expect(detail).toContain('getLatestBlogPosts(locale, 3, post.id)');
    expect(detail).toContain('buildBlogRouteMaps(englishPosts, vietnamesePosts)');
    expect(detail).toContain('satisfies GetStaticPaths');
    expect(`${index}\n${detail}`).not.toMatch(/demo-data|demoBlogPosts/);
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
});
