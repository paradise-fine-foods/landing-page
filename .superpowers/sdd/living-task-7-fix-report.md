# Living Ingredients Task 7 — Rendered QA Fix Report

## Scope

Focused rendered-QA correction only. This does not mark the wider Living Ingredients specification complete.

## Changed files

- `src/lib/i18n/ui.ts` — hero thesis eyebrows now use the exact English and Vietnamese Living Ingredients copy.
- `src/pages/en/products/index.astro`
- `src/pages/vi/products/index.astro`
- `src/pages/en/brands/index.astro`
- `src/pages/vi/brands/index.astro` — remove the empty intro decorations and keep the desktop editorial description in column two, resetting it for the mobile single-column layout.
- `src/components/catalog/ProductCard.astro`
- `src/components/sections/FeaturedBrands.astro`
- `src/components/global/Breadcrumbs.astro`
- `src/components/forms/EnquiryForm.astro` — standalone navigation targets and the consent label have a `2.75rem` minimum block target; the checkbox remains visually `1.25rem`.
- `src/components/catalog/ProductDetail.astro` — isolated product-stage stacking with backplate `z-index: 0`, image `z-index: 1`, and brand label `z-index: 2`; the label now uses responsive safe-area insets (`16%` block-start and `36%` inline-start) inside the asymmetric clipped mask.
- `tests/living-design-contract.test.ts` — focused contracts for all corrections.

## TDD evidence

### RED

Initial focused run:

```powershell
bun test tests/living-design-contract.test.ts tests/homepage-contract.test.ts tests/product-card.test.ts
```

Result: 24 pass, 3 fail, 202 assertions. The new contracts failed for the old hero copy, the four remaining empty intro decoration classes, and missing 44px target declarations.

After the additional product-detail rendered-QA defect was added, the same focused run produced 27 pass, 1 fail, 214 assertions. The new stacking contract failed because `.product-detail__organic-stage` did not isolate its stack or explicitly layer the backplate and image beneath the label.

### GREEN

The final focused command passed: 28 pass, 0 fail, 218 assertions.

### Follow-up safe-area correction

Browser QA on the first Task 7 commit confirmed that the computed stack order was correct but the label was clipped by the stage's asymmetric top-left border radius. The new safe-area contract first failed with 28 pass, 1 fail, and 219 assertions because the label used `var(--space-4)` insets. After replacing those offsets with proportional `16%` block-start and `36%` inline-start insets, the focused command passed with 29 pass, 0 fail, and 220 assertions.

## Decoration restraint decision

Removed the isolated orange catalog oval and green brands oval from both English and Vietnamese index pages, including their CSS. They carried no grouping, sequence, state, or tactility meaning and competed with the hero’s expressive organic signature. The resulting asymmetric editorial grid retains the eyebrow/title/description hierarchy without an empty decorative slot; the mobile layout remains one column.

## Self-review

Reviewed the worktree diff against Task 7 requirements. No correctness, scope, or test-contract issues remain. In particular, the product-detail stage has an isolated stacking context and an explicit `0 < 1 < 2` layer order for backplate, image, and brand label; the label is now positioned proportionally beyond the clipped top-left curve.

## Final verification

```powershell
bun test tests/living-design-contract.test.ts tests/homepage-contract.test.ts tests/product-card.test.ts
```

Pass: 29 tests, 0 failures, 220 assertions.

```powershell
bun test
```

Pass: 113 tests, 0 failures, 654 assertions across 16 files.

```powershell
bun run check
```

Pass: 83 files, 0 errors, 0 warnings, 0 hints.

```powershell
bun run build
```

Pass: 28 pages built; all built CMS, Living design, catalog, brand, enquiry, and MVP verifiers passed. Astro emitted its pre-existing root-route conflict warning while still completing successfully.

```powershell
git diff --check
```

Pass: no whitespace errors.

## Concern

Rendered re-verification is deferred to the parent task as requested. The final source contract explicitly verifies stage isolation, the backplate/image/label stacking order, and the proportional safe-area insets; focused, full, type-check, and production-build verification all passed.
