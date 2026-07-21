import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('blog shell and homepage integration', () => {
  test('places Blogs between Brands and Contact in the shared link array', () => {
    const header = source('src/components/global/Header.astro');
    const brands = header.indexOf("localizedPath(locale, 'brands')");
    const blogs = header.indexOf("localizedPath(locale, 'blogs')");
    const contact = header.indexOf("localizedPath(locale, 'contact')");

    expect(brands).toBeGreaterThan(-1);
    expect(blogs).toBeGreaterThan(brands);
    expect(contact).toBeGreaterThan(blogs);
    expect(header).toContain('label: copy.blogs');
  });

  test('queries exactly three latest posts and places them between brands and partners', () => {
    const home = source('src/pages/[locale]/index.astro');

    expect(home).toContain('getLatestBlogPosts(locale, 3)');
    expect(home).toContain('<LatestBlogs');
    const brands = home.indexOf('<FeaturedBrands');
    const blogs = home.indexOf('<LatestBlogs');
    const partners = home.indexOf('<PartnerStrip');
    expect(blogs).toBeGreaterThan(brands);
    expect(partners).toBeGreaterThan(blogs);
  });
});
