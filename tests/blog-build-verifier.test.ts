import { describe, expect, test } from 'bun:test';
import {
  assertArticleMetadata,
  assertLatestBlogSection,
  assertLocalizedArticleOutput,
  assertSemanticDate,
  extractLatestBlogSection,
} from './verify-built-blogs';

const section = (links: string[]) => `<section data-latest-blogs>${links.map((href) => `<article><a href="${href}">Story</a></article>`).join('')}</section>`;

describe('built blog verifier helpers', () => {
  test('extracts the scoped latest-story section', () => {
    expect(extractLatestBlogSection(`<nav><a href="/outside/">Outside</a></nav>${section(['/a/', '/b/', '/c/'])}`))
      .toContain('href="/a/"');
  });

  test('requires exactly the expected links and excludes the current route', () => {
    expect(() => assertLatestBlogSection(section(['/a/', '/b/', '/c/']), ['/a/', '/b/', '/c/'], '/current/')).not.toThrow();
    expect(() => assertLatestBlogSection(section(['/current/', '/b/', '/c/']), ['/a/', '/b/', '/c/'], '/current/')).toThrow();
    expect(() => assertLatestBlogSection(section(['/a/', '/b/']), ['/a/', '/b/', '/c/'], '/current/')).toThrow();
  });

  test('rejects reversed latest stories and unrelated links inside a story card', () => {
    expect(() => assertLatestBlogSection(section(['/c/', '/b/', '/a/']), ['/a/', '/b/', '/c/'])).toThrow();
    const withUnrelatedLink = section(['/a/', '/b/', '/c/']).replace('Story</a></article>', 'Story</a><a href="/unrelated/">Unrelated</a></article>');
    expect(() => assertLatestBlogSection(withUnrelatedLink, ['/a/', '/b/', '/c/'])).toThrow();
  });

  test('accepts a semantic date when Astro adds scoped attributes', () => {
    expect(() => assertSemanticDate('<time datetime="2026-07-12" data-astro-cid-example>12 July 2026</time>', '2026-07-12')).not.toThrow();
  });

  test('requires localized article title, excerpt, headings, and body paragraphs', () => {
    const post = {
      title: 'Localized title',
      excerpt: 'Localized excerpt',
      sections: [{ paragraphs: ['Opening paragraph'] }, { heading: 'Localized heading', paragraphs: ['Detailed paragraph'] }],
    };
    const html = '<article><h1>Localized title</h1><p>Localized excerpt</p><p>Opening paragraph</p><h2>Localized heading</h2><p>Detailed paragraph</p></article>';
    expect(() => assertLocalizedArticleOutput(html, post)).not.toThrow();
    expect(() => assertLocalizedArticleOutput(html.replace('Detailed paragraph', ''), post)).toThrow();
  });

  test('requires canonical, reciprocal hreflang metadata, and the language-switch counterpart link', () => {
    const path = '/en/blogs/english-story/';
    const alternatePath = '/vi/blogs/cau-chuyen-viet/';
    const html = `<link rel="canonical" href="https://paradisefinefoods.com${path}"><link rel="alternate" hreflang="en" href="https://paradisefinefoods.com${path}"><link rel="alternate" hreflang="vi" href="https://paradisefinefoods.com${alternatePath}"><a href="${alternatePath}" hreflang="vi">Vietnamese</a>`;
    expect(() => assertArticleMetadata(html, 'en', path, alternatePath)).not.toThrow();
    expect(() => assertArticleMetadata(html.replace(`href="https://paradisefinefoods.com${alternatePath}"`, `href="https://paradisefinefoods.com/vi/blogs/wrong/"`), 'en', path, alternatePath)).toThrow();
  });
});
