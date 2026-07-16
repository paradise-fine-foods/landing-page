import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { brandDetailPath } from '../src/lib/brands/routes';
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

const [englishBrands, vietnameseBrands] = await Promise.all([getBrands('en'), getBrands('vi')]);
const vietnameseById = new Map(vietnameseBrands.map((brand) => [brand.id, brand]));

for (const [locale, indexPath, counterpartPath, brands] of [
  ['en', '/en/brands/', '/vi/thuong-hieu/', englishBrands],
  ['vi', '/vi/thuong-hieu/', '/en/brands/', vietnameseBrands],
] as const) {
  const html = built(withoutTrailingSlash(indexPath));
  assertMeta(html, indexPath, counterpartPath);
  assert.match(html, /<h1[^>]*>/, `${locale} brand index needs an h1`);
  for (const brand of brands) {
    assert.ok(html.includes(`href="${brandDetailPath(locale, brand)}"`), `${locale} index must link ${brand.id}`);
  }
}

for (const englishBrand of englishBrands) {
  const vietnameseBrand = vietnameseById.get(englishBrand.id);
  assert.ok(vietnameseBrand, `missing Vietnamese brand for ${englishBrand.id}`);
  const englishPath = brandDetailPath('en', englishBrand);
  const vietnamesePath = brandDetailPath('vi', vietnameseBrand);

  for (const [locale, brand, path, counterpart] of [
    ['en', englishBrand, englishPath, vietnamesePath],
    ['vi', vietnameseBrand, vietnamesePath, englishPath],
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
