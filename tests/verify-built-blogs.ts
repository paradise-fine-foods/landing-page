import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { blogDetailPath } from '../src/lib/blogs/routes';
import { getBlogPosts, getLatestBlogPosts } from '../src/lib/cms/queries';

export const extractLatestBlogSection = (html: string): string =>
  html.match(/<section\b[^>]*data-latest-blogs[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';

export const assertLatestBlogSection = (
  html: string,
  expectedPaths: readonly string[],
  currentPath?: string,
): void => {
  const scoped = html.includes('data-latest-blogs') ? extractLatestBlogSection(html) : html;
  assert.ok(scoped, 'latest blog section is missing');
  const articles = scoped.match(/<article\b/g) ?? [];
  assert.equal(articles.length, expectedPaths.length, 'latest blog article count differs');
  for (const path of expectedPaths) assert.ok(scoped.includes(`href="${path}"`), `latest blog section is missing ${path}`);
  if (currentPath) assert.ok(!scoped.includes(`href="${currentPath}"`), `latest blog section repeats current route ${currentPath}`);
};

export const assertSemanticDate = (html: string, publishedAt: string): void => {
  assert.match(html, new RegExp(`<time\\b[^>]*\\bdatetime="${publishedAt}"`), `semantic date missing for ${publishedAt}`);
};

export const verifyBuiltBlogs = async (dist = join(import.meta.dir, '..', 'dist')): Promise<void> => {
  const origin = 'https://paradisefinefoods.com';
  const built = (path: string) => readFileSync(join(dist, path.replace(/^\//, ''), 'index.html'), 'utf8');
  for (const locale of ['en', 'vi'] as const) {
    const posts = await getBlogPosts(locale);
    const indexPath = `/${locale}/blogs/`;
    const home = built(`/${locale}/`);
    const index = built(indexPath);
    assert.ok(home.includes(`href="${indexPath}"`), `${locale} home/header must link blog index`);
    assert.ok(index.includes('data-blog-index'), `${locale} blog index marker missing`);
    assertLatestBlogSection(home, (await getLatestBlogPosts(locale, 3)).map((post) => blogDetailPath(locale, post)));
    for (const post of posts) {
      const path = blogDetailPath(locale, post);
      const html = built(path);
      assert.ok(html.includes('data-blog-article'), `${path} article marker missing`);
      assertSemanticDate(html, post.publishedAt);
      assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`), `${path} canonical missing`);
      assertLatestBlogSection(html, (await getLatestBlogPosts(locale, 3, post.id)).map((item) => blogDetailPath(locale, item)), path);
      assert.doesNotMatch(html, /\bundefined\b|file:\/\/\/|src\/assets\/|demo-data/);
    }
  }
};

if (import.meta.main) {
  await verifyBuiltBlogs();
  console.log('Blog build verified: bilingual indexes, articles, metadata, and latest-story exclusions are correct.');
}
