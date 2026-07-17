# Living Ingredients Task 4 report

## Status

Implemented the accessible manual featured-product carousel, one-shot authored scroll reveals and the organic lower-homepage composition on authorized `main`. Catalog, brand, enquiry and error routes were not restyled; CMS query boundaries, localized routes, Task 2 contrast tokens and Task 3 Living Canvas eligibility remain intact.

## RED / GREEN evidence

- RED command: `bun test tests/carousel.test.ts tests/motion.test.ts tests/homepage-contract.test.ts tests/homepage-composition.test.ts tests/living-design-contract.test.ts`
- RED result: 18 passed, 7 failed and 2 expected missing-module errors. Failures were the absent carousel/reveal modules, missing localized carousel copy/contracts and old rigid section markup. A Bun-only `KeyboardEvent` harness error was corrected to an event-capable DOM-like test object before evaluating GREEN.
- Initial GREEN result: 39 passed, 0 failed, 266 assertions. After independent review regressions, final focused GREEN is 42 passed, 0 failed, 278 assertions.
- The controller tests use a minimal real event/listener DOM-like harness rather than source strings. They prove listener-before-unhide ordering, initial status/disabled state, clamping, keyboard prevention/movement, smooth versus instant behavior, native-scroll synchronization, idempotent cleanup and safe missing-DOM behavior.
- Reveal tests inject an IntersectionObserver dependency and prove exact `0.18` threshold, authored-node observation, one-shot reveal/unobserve, untouched non-intersections, idempotent disconnect and a settled no-observer fallback.

## Implementation

- Every featured CMS product remains server-rendered in horizontal reading order. Progressive controls start hidden, become available only after all listeners install, never autoplay/wrap/clone, never move focus and remain usable with reduced motion through instant scrolling.
- Reveals are dynamically loaded only when `shouldEnhanceMotion` permits. The main element receives `data-motion-enhanced` only after the reveal module loads, so failed/disabled JavaScript never hides SSR content. Reduced motion keeps content settled and disables transitions.
- Category discovery uses four stable CMS-derived links in a loose editorial table with authored Paradise marks and predictable mobile stacking.
- Featured brand, service proof, credibility, channels and CTA use light organic composition, semantic content independent of decoration and preserved CMS-derived links/data.
- English/Vietnamese carousel label, previous/next and localized position template copy were added to `UiCopy`; `docs/demo-content.md` now assigns their localization/accessibility ownership and documents both enhancement modules.

## Independent review follow-up

The required independent diff review found no critical issues and identified three fixes. New failing regressions reproduced nonzero item-offset native scrolling, missing localized live-status context and partial IntersectionObserver setup cleanup. The controller now normalizes item positions to the first item's offset, formats its live status through localized `{current}` / `{total}` templates, and reveal setup disconnects before settling after partial failure.

## Verification

- Focused tests: 42 passed, 0 failed.
- `bun run check`: 0 errors, 0 warnings, 0 hints across 81 files.
- Full `bun test`: 99 passed, 0 failed, 579 assertions.
- `bun run build`: success; 28 static pages plus all CMS/catalog/brand/enquiry/MVP verifiers passed.
- `git diff --check`: clean.
- Known pre-existing build warning: Astro reports a root `/` route priority conflict while still completing the build successfully; Task 4 did not modify root routing.

## Changed files

- New: `src/lib/carousel/controller.ts`, `src/lib/motion/reveal.ts`, `tests/carousel.test.ts`.
- Homepage sections: `CategoryDiscovery.astro`, `FeaturedProducts.astro`, `FeaturedBrands.astro`, `ServiceProof.astro`, `CredibilityStrip.astro`, `ChannelPathways.astro`, `FinalCta.astro`, `LivingHero.astro`.
- Composition/copy/ledger: both localized homepage files, `src/lib/i18n/ui.ts`, `docs/demo-content.md`.
- Contracts: `tests/motion.test.ts`, `tests/homepage-contract.test.ts`, `tests/homepage-composition.test.ts`, `tests/living-design-contract.test.ts`.

## Required decoration-removal self-critique

The Living Hero remains the only bold signature; lower sections use quieter white/mist surfaces, orange rules and a single service journey. I removed numbered channel badges because they falsely implied a sequence and repeated the retired ledger language. I also removed the closing CTA's `PFF / SALES LINE` utility label because it did not improve grouping, progression or tactility. The remaining marks identify category/product groupings, the service path communicates handling progression, and the CTA curve contains the final action without competing with the hero.
