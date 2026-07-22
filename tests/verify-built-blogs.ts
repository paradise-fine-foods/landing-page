import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { blogDetailPath } from '../src/lib/blogs/routes';
import { getBlogPosts, getLatestBlogPosts } from '../src/lib/cms/queries';
import type { BlogPost } from '../src/lib/cms/types';
import { ui } from '../src/lib/i18n/ui';

export const extractLatestBlogSection = (html: string): string =>
  html.match(/<section\b[^>]*data-latest-blogs[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';

export const assertLatestBlogSection = (
  html: string,
  expectedPaths: readonly string[],
  currentPath?: string,
): void => {
  const scoped = html.includes('data-latest-blogs') ? extractLatestBlogSection(html) : html;
  assert.ok(scoped, 'latest blog section is missing');
  const articles = scoped.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
  assert.equal(articles.length, expectedPaths.length, 'latest blog article count differs');
  for (const [index, article] of articles.entries()) {
    const expectedPath = expectedPaths[index]!;
    const paths = [...article.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]!);
    assert.ok(paths.length > 0, `latest blog article ${index + 1} has no story links`);
    assert.deepEqual(paths, Array(paths.length).fill(expectedPath), `latest blog article ${index + 1} link sequence differs`);
  }
  if (currentPath) assert.ok(!articles.some((article) => article.includes(`href="${currentPath}"`)), `latest blog section repeats current route ${currentPath}`);
};

export const assertSemanticDate = (html: string, publishedAt: string): void => {
  assert.match(html, new RegExp(`<time\\b[^>]*\\bdatetime="${publishedAt}"`), `semantic date missing for ${publishedAt}`);
};

export const extractBlogArticle = (html: string): string =>
  html.match(/<article\b(?=[^>]*\bdata-blog-article(?:\s|=|>))[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';

export const assertLocalizedArticleOutput = (
  html: string,
  post: Pick<BlogPost, 'title' | 'excerpt' | 'sections'>,
): void => {
  const scoped = extractBlogArticle(html);
  assert.ok(scoped, 'blog article is missing');
  for (const text of [post.title, post.excerpt, ...post.sections.flatMap((section) => [section.heading, ...section.paragraphs])]) {
    if (text) assert.ok(scoped.includes(text), `localized article content is missing ${text}`);
  }
};

export const assertArticleMetadata = (
  html: string,
  locale: 'en' | 'vi',
  path: string,
  alternatePath: string,
  post?: Pick<BlogPost, 'title' | 'excerpt'>,
): void => {
  const origin = 'https://paradisefinefoods.com';
  const alternateLocale = locale === 'en' ? 'vi' : 'en';
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`), `${path} canonical missing`);
  assert.ok(html.includes(`<link rel="alternate" hreflang="${locale}" href="${origin}${path}">`), `${path} ${locale} alternate missing`);
  assert.ok(html.includes(`<link rel="alternate" hreflang="${alternateLocale}" href="${origin}${alternatePath}">`), `${path} ${alternateLocale} alternate missing`);
  const escapedPath = alternatePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(html, new RegExp(`<a\\b(?=[^>]*\\bhref="${escapedPath}")(?=[^>]*\\bhreflang="${alternateLocale}")[^>]*>`), `${path} language-switch counterpart missing`);
  if (post) {
    const title = `${post.title} | ${ui[locale].siteName}`;
    const articleImage = extractBlogArticle(html).match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
    assert.ok(articleImage, `${path} article image missing`);
    const image = new URL(articleImage, origin).toString();
    assert.ok(html.includes(`<title>${title}</title>`), `${path} title metadata missing`);
    assert.ok(html.includes(`<meta name="description" content="${post.excerpt}">`), `${path} description metadata missing`);
    assert.ok(html.includes(`<meta property="og:title" content="${title}">`), `${path} Open Graph title missing`);
    assert.ok(html.includes(`<meta property="og:description" content="${post.excerpt}">`), `${path} Open Graph description missing`);
    assert.ok(html.includes(`<meta property="og:image" content="${image}">`), `${path} Open Graph image missing`);
  }
};

export const verifyBuiltBlogs = async (dist = join(import.meta.dir, '..', 'dist')): Promise<void> => {
  const built = (path: string) => readFileSync(join(dist, path.replace(/^\//, ''), 'index.html'), 'utf8');
  const postsByLocale = {
    en: await getBlogPosts('en'),
    vi: await getBlogPosts('vi'),
  };
  for (const locale of ['en', 'vi'] as const) {
    const posts = postsByLocale[locale];
    const alternateLocale = locale === 'en' ? 'vi' : 'en';
    const indexPath = `/${locale}/blogs/`;
    const home = built(`/${locale}/`);
    const index = built(indexPath);
    assert.ok(home.includes(`href="${indexPath}"`), `${locale} home/header must link blog index`);
    assert.ok(index.includes('data-blog-index'), `${locale} blog index marker missing`);
    assertLatestBlogSection(home, (await getLatestBlogPosts(locale, 3)).map((post) => blogDetailPath(locale, post)));
    for (const post of posts) {
      const path = blogDetailPath(locale, post);
      const html = built(path);
      const alternatePost = postsByLocale[alternateLocale].find((item) => item.id === post.id);
      assert.ok(alternatePost, `${path} counterpart record missing`);
      const alternatePath = blogDetailPath(alternateLocale, alternatePost);
      assert.ok(html.includes('data-blog-article'), `${path} article marker missing`);
      assertSemanticDate(html, post.publishedAt);
      assertLocalizedArticleOutput(html, post);
      assertArticleMetadata(html, locale, path, alternatePath, post);
      assertLatestBlogSection(html, (await getLatestBlogPosts(locale, 3, post.id)).map((item) => blogDetailPath(locale, item)), path);
      assert.doesNotMatch(html, /\bundefined\b|file:\/\/\/|src\/assets\/|demo-data/);
    }
  }
};

if (import.meta.main) {
  await verifyBuiltBlogs();
  console.log('Blog build verified: bilingual indexes, articles, metadata, and latest-story exclusions are correct.');
}
