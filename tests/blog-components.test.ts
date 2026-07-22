import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../src/lib/i18n/ui';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('blog components', () => {
  test('provides complete bilingual blog interface copy', () => {
    for (const locale of ['en', 'vi'] as const) {
      expect(ui[locale].header.blogs.length).toBeGreaterThan(3);
      expect(ui[locale].blog.readStory).toBeTruthy();
      expect(ui[locale].blog.readingTime).toContain('{minutes}');
      expect(ui[locale].home.latestBlogsTitle).toBeTruthy();
    }
  });

  test('renders semantic cards with title-specific localized links and deferred non-lead images', () => {
    const card = source('src/components/blogs/BlogCard.astro');
    expect(card).toContain('<article');
    expect(card).toContain('<time datetime={post.publishedAt}>');
    expect(card).toContain('width={post.image.width}');
    expect(card).toContain('height={post.image.height}');
    expect(card).toContain('alt={post.image.alt}');
    expect(card).toContain('blog-card--lead');
    expect(card).toContain('blog-card__label');
    expect(card).toContain('const storyLinkLabel = `${copy.readStory}: ${post.title}`;');
    expect(card.match(/aria-label=\{storyLinkLabel\}/g)).toHaveLength(2);
    expect(card).toContain("const imageLoading = variant === 'lead' ? 'eager' : 'lazy';");
    expect(card).toContain('loading={imageLoading}');
    expect(card).toContain('decoding="async"');
  });

  test('uses a contrast-safe category text color', () => {
    const card = source('src/components/blogs/BlogCard.astro');
    expect(card).toContain('.blog-card__meta span:first-child { color: var(--color-deep-herb); }');
    expect(card).not.toContain('.blog-card__meta span:first-child { color: var(--color-paradise-blue); }');
  });

  test('omits empty latest sections and keeps article heading hierarchy', () => {
    const latest = source('src/components/blogs/LatestBlogs.astro');
    const article = source('src/components/blogs/BlogArticle.astro');
    expect(latest).toContain('posts.length > 0');
    expect(latest).toContain('data-latest-blogs');
    expect(article).toContain('data-blog-article');
    expect(article).toContain('<h1>{post.title}</h1>');
    expect(article).toContain('section.heading && <h2>');
    expect(article).not.toContain('<script');
  });
});
