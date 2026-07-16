import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getBrands, getProducts } from '../src/lib/cms/queries';

const root = join(import.meta.dir, '..', 'dist');
const origin = 'https://demo.paradisefinefoods.com';
const built = (path: string) => readFileSync(join(root, path, 'index.html'), 'utf8');
const withoutTrailingSlash = (path: string) => path.replace(/^\//, '').replace(/\/$/, '');
const assertMeta = (html: string, canonicalPath: string, alternatePath: string) => {
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${canonicalPath}">`));
  assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${origin}${canonicalPath.startsWith('/en/') ? canonicalPath : alternatePath}">`));
  assert.ok(html.includes(`<link rel="alternate" hreflang="vi" href="${origin}${canonicalPath.startsWith('/vi/') ? canonicalPath : alternatePath}">`));
};

const expectedBrands = [
  {
    id: 'maison-laitiere',
    en: { slug: 'maison-laitiere', path: '/en/brands/maison-laitiere/' },
    vi: { slug: 'nha-sua-maison', path: '/vi/thuong-hieu/nha-sua-maison/' },
  },
  {
    id: 'atelier-creme',
    en: { slug: 'atelier-creme', path: '/en/brands/atelier-creme/' },
    vi: { slug: 'xuong-kem', path: '/vi/thuong-hieu/xuong-kem/' },
  },
  {
    id: 'formagerie-nord',
    en: { slug: 'formagerie-nord', path: '/en/brands/formagerie-nord/' },
    vi: { slug: 'xuong-pho-mai-bac', path: '/vi/thuong-hieu/xuong-pho-mai-bac/' },
  },
] as const;

const [englishBrands, vietnameseBrands] = await Promise.all([getBrands('en'), getBrands('vi')]);
const vietnameseById = new Map(vietnameseBrands.map((brand) => [brand.id, brand]));

for (const [locale, indexPath, counterpartPath] of [
  ['en', '/en/brands/', '/vi/thuong-hieu/'],
  ['vi', '/vi/thuong-hieu/', '/en/brands/'],
] as const) {
  const html = built(withoutTrailingSlash(indexPath));
  assertMeta(html, indexPath, counterpartPath);
  assert.match(html, /<h1[^>]*>/, `${locale} brand index needs an h1`);
  for (const expected of expectedBrands) {
    assert.ok(html.includes(`href="${expected[locale].path}"`), `${locale} index must link ${expected.id}`);
  }
}

for (const expected of expectedBrands) {
  const englishBrand = englishBrands.find(({ id }) => id === expected.id);
  const vietnameseBrand = vietnameseById.get(expected.id);
  assert.ok(englishBrand, `missing English brand for ${expected.id}`);
  assert.ok(vietnameseBrand, `missing Vietnamese brand for ${expected.id}`);
  assert.equal(englishBrand.slug, expected.en.slug);
  assert.equal(vietnameseBrand.slug, expected.vi.slug);

  for (const [locale, brand, path, counterpart] of [
    ['en', englishBrand, expected.en.path, expected.vi.path],
    ['vi', vietnameseBrand, expected.vi.path, expected.en.path],
  ] as const) {
    const html = built(withoutTrailingSlash(path));
    const products = await getProducts(locale, { brand: [brand.id] });
    assertMeta(html, path, counterpart);
    assert.ok(html.includes(brand.name), `${locale} detail must render its localized name`);
    assert.ok(html.includes(brand.origin), `${locale} detail must render its localized origin`);
    assert.ok(html.includes(brand.description), `${locale} detail must render its localized story`);
    assert.ok(html.includes('brand-detail__notice'), `${locale} detail must render its demo notice`);
    for (const product of products) {
      const productRoot = locale === 'en' ? '/en/products/' : '/vi/san-pham/';
      assert.ok(html.includes(`href="${productRoot}${product.slug}/"`), `${locale} detail must link ${product.id}`);
    }
    assert.doesNotMatch(html, /\bundefined\b|file:\/\/\/|src\/assets\/|demo-data/);
    assert.match(html, /src="\/_astro\//, `${locale} detail must use an emitted asset URL`);
  }
}

console.log('Brand build verified: reciprocal metadata, localized content, product links, and assets are correct.');
