# Task 3 — Catalog and Brand Surfaces

## RED evidence

Added source contracts first in `tests/living-design-contract.test.ts`, `tests/product-card.test.ts`, `tests/catalog-routes.test.ts`, and `tests/brand-routes.test.ts` for square unmasked media, neutral separators, compact filters, product-only orange metadata locator, and removal of redundant card surrounds.

Command:

```text
bun test tests/living-design-contract.test.ts tests/product-card.test.ts tests/catalog-routes.test.ts tests/brand-routes.test.ts
```

Initial result: **49 pass, 6 fail**. The failures were the expected missing contracts: product and brand media classes were still the old organic variants; catalog filters still used a cold-paper box; product-card metadata still used orange; and the product-detail stage was still a masked layer.

## GREEN evidence

Implemented neutral, square media stages; thin steel separators; compact 44px filter controls; and an orange locator only for genuine product metadata. The focused command above then passed **55 pass, 0 fail (528 expectations)**.

## Files changed

- `src/components/catalog/ProductCard.astro`
- `src/components/catalog/ProductGrid.astro`
- `src/components/catalog/ProductMetadata.astro`
- `src/components/catalog/ProductDetail.astro`
- `src/components/catalog/CatalogFilters.astro`
- `src/components/brands/BrandCard.astro`
- `src/components/brands/BrandDetail.astro`
- `src/pages/[locale]/products/index.astro`
- `src/pages/[locale]/brands/index.astro`
- `tests/living-design-contract.test.ts`
- `tests/product-card.test.ts`
- `tests/catalog-routes.test.ts`
- `tests/brand-routes.test.ts`

## Verification

```text
bun run check
Result (104 files): 0 errors, 0 warnings, 0 hints

bun test
203 pass, 0 fail, 1255 expectations

git diff --check
No whitespace errors
```

## Self-review

- Preserved catalog state, DOM hooks, filter/search/reset behavior, result and empty states.
- Preserved localized CMS queries, localized slugs/routes, brand accent normalization, product metadata order, related-product selection, sticky product media behavior, and enquiry links.
- Kept Newsreader on H1/H2 only; scoped utility text is Nunito at 600 or lighter.
- Used existing product and brand images only; no masks, shadows, gradients, decorative orange, or redundant outer cards were introduced.
- Left blog, form, and 404 styling untouched.

## Concerns

None. Brand accent classes remain in the markup to preserve the normalized CMS accent contract, but the redesigned neutral surfaces intentionally do not use accent color styling.

## Important follow-up fixes

### RED evidence

Added focused source contracts for the current `.product-card__media img` and `.product-card:hover .product-card__media img` selectors, including non-empty extracted-rule assertions. Added contracts requiring the product and brand media anchors to omit `aria-hidden` and to use their existing image `alt` values as link names.

```text
bun test tests/living-design-contract.test.ts tests/product-card.test.ts tests/brand-routes.test.ts
48 pass, 3 fail, 479 expectations
```

The three expected failures were: missing `alt={product.image.alt}`, missing `alt={brand.image.alt}`, and no rule for `.product-card:hover .product-card__media img` after replacing the retired selector.

### GREEN evidence

- Removed `aria-hidden="true"` from both media anchors while preserving `tabindex="-1"` for the existing single-tab-stop pattern.
- Used `product.image.alt` and `brand.image.alt` to name the exposed image links.
- Added a minimal opacity-only product-media hover rule; the contract explicitly verifies the present rule does not use transform or scale.
- Kept the category and blog media checks on their existing base-image rules so no out-of-scope styling changed.

```text
bun test tests/living-design-contract.test.ts tests/product-card.test.ts tests/brand-routes.test.ts
51 pass, 0 fail, 493 expectations

bun run check
Result (104 files): 0 errors, 0 warnings, 0 hints
```
