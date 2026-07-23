# Task 3 Report: Industrial Hero and Product Discovery

## RED

Added the hero/product-stage contract and canvas presentation-suppression assertion, then ran:

```text
bun test tests/living-design-contract.test.ts tests/homepage-composition.test.ts tests/product-card.test.ts tests/carousel.test.ts
```

Result: **37 pass, 2 fail** (expected failures for the visible canvas and legacy mist-blue/organic hero stage).

## GREEN

Restyled the hero, credibility strip, category discovery, featured-products carousel, and product card with canonical industrial tokens. Canvas and decorative organic marks remain in the DOM but are presentation-suppressed; carousel markup, controls, data attributes, and behavior are unchanged. Reveal hooks now remain visibly settled without reveal timing.

Focused verification:

```text
bun test tests/living-design-contract.test.ts tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/product-card.test.ts tests/carousel.test.ts tests/motion.test.ts
```

Result: **62 pass, 0 fail**.

Full verification:

```text
bun test
```

Result: **188 pass, 0 fail**.

## Changed Files

- `tests/living-design-contract.test.ts`
- `tests/homepage-composition.test.ts`
- `src/components/sections/LivingHero.astro`
- `src/components/sections/CredibilityStrip.astro`
- `src/components/sections/CategoryDiscovery.astro`
- `src/components/sections/FeaturedProducts.astro`
- `src/components/catalog/ProductCard.astro`

## Self-Review

- Scope is styling and matching design-contract coverage only; markup, data flow, ARIA, imports, controller setup, carousel behavior, route behavior, and reveal hooks were preserved.
- Confirmed the scoped components have no legacy bright/mist/deep-herb consumers, `var(--shape-drop)`, filters, drop shadows, decorative `color-mix`, clip paths, 600ms/700ms reveal timings, or fully rounded carousel controls.
- No outstanding concerns.

## Commit

`style: industrialize hero and product discovery`
