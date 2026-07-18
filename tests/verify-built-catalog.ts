import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..', 'dist');
const built = (path: string) => readFileSync(join(root, path, 'index.html'), 'utf8');
const productCards = (html: string) =>
  [...html.matchAll(/<article class="product-card"[^>]*>[\s\S]*?<\/article>/g)].map(
    ([card]) => card,
  );
const queryValues = (html: string, parameter: string): string[] =>
  [...html.matchAll(new RegExp(`href="([^"]+[?&]${parameter}=([^"]+))"`, 'g'))]
    .map(([, , value]) => decodeURIComponent(value.replace(/&amp;.*/, '')));

for (const [locale, path] of [
  ['en', 'en/products'],
  ['vi', 'vi/products'],
] as const) {
  const html = built(path);
  const cards = productCards(html);
  assert.ok(cards.length > 0, `${locale} catalog must contain product cards`);
  assert.ok(html.indexOf('<h1') < html.indexOf('<h2'), `${locale} catalog must start at h1`);
  assert.ok(cards.every((card) => card.includes('<h2')), `${locale} catalog cards must use h2`);
  assert.ok(cards.every((card) => !card.includes('<h3')), `${locale} catalog cards must not skip to h3`);

  const homepage = built(locale);
  const requestedCategories = queryValues(homepage, 'category');
  const renderedOptions = [...html.matchAll(/<option\b[^>]*value="([^"]+)"[^>]*data-category-slug="([^"]+)"[^>]*>/g)]
    .map(([, id, slug]) => ({ id, slug }));
  assert.ok(requestedCategories.length > 0, `${locale} homepage must emit category query links`);
  assert.deepEqual(
    new Set(requestedCategories),
    new Set(renderedOptions.map(({ slug }) => slug)),
    `${locale} homepage category queries must exactly map to rendered category options`,
  );
  assert.ok(renderedOptions.every(({ id }) => id.length > 0), `${locale} category query options must map to stable IDs`);
}

const viCatalog = built('vi/products');
assert.match(
  viCatalog,
  /data-product-id="cultured-butter-sheet"[^>]*data-search="[^"]*lamination[^"]*Cán lớp[^"]*"/,
  'Vietnamese cultured butter must index its stable and displayed application labels',
);

for (const [label, path] of [
  ['English homepage', 'en'],
  ['Vietnamese homepage', 'vi'],
  ['English detail', 'en/products/cultured-butter-sheet'],
  ['Vietnamese detail', 'vi/products/bo-lat-len-men'],
] as const) {
  const cards = productCards(built(path));
  assert.ok(cards.length > 0, `${label} must contain product cards`);
  assert.ok(cards.every((card) => card.includes('<h3')), `${label} cards must remain h3`);
  assert.ok(cards.every((card) => !card.includes('<h2')), `${label} cards must not use h2`);
}

console.log('Catalog build verified: localized search corpus and contextual card headings are correct.');
