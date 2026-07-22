import { describe, expect, test } from 'bun:test';
import { assertLatestBlogSection, assertSemanticDate, extractLatestBlogSection } from './verify-built-blogs';

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

  test('accepts a semantic date when Astro adds scoped attributes', () => {
    expect(() => assertSemanticDate('<time datetime="2026-07-12" data-astro-cid-example>12 July 2026</time>', '2026-07-12')).not.toThrow();
  });
});
