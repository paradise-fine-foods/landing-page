# Task 2 Report: Product-Led Homepage and Near-Static Runtime

Date: 2026-07-25
Branch: `codex/product-led-minimal-redesign`
Starting commit: `c7c3efc fix: correct shared chrome contrast and rail weight`

## Outcome

The bilingual homepage retains the same ten sections, exact source order, CMS/query-derived content, public props, headings, links, hero preload source, carousel behavior, and route set. It now uses authentic product, category, brand, editorial, blog, and partner media in disciplined rectangular stages with steel separators and compact buyer-facing facts. Authored reveal behavior and the ambient canvas runtime are removed. The featured-product carousel and floating enquiry rail remain functional.

Homepage source order remains:

1. `LivingHero`
2. `CredibilityStrip`
3. `CategoryDiscovery`
4. `FeaturedProducts`
5. `FeaturedBrands`
6. `LatestBlogs`
7. `PartnerStrip`
8. `ServiceProof`
9. `ChannelPathways`
10. `FinalCta`

## Design execution

- Hero: one uninterrupted, eagerly loaded CMS product image occupies the dominant stage; compact brand, origin, pack, and storage facts sit beside it.
- Credibility: the four localized operational pillars are presented as a compact fact strip with descriptions and one restrained orange locator.
- Categories: authentic category images and CMS counts use orderly steel-divided rows; decorative marks and staggered offsets are gone.
- Products: the localized manual carousel, server-rendered cards, controls, live status, keyboard viewport, native rail motion, and reduced-motion behavior are unchanged.
- Brands: one image-led producer story remains distinct from the secondary brand list; product links are separated as facts rather than decorated with shapes.
- Latest blogs: existing `BlogCard` interiors are untouched and organized by steel dividers at the section level.
- Partners: existing local partner assets remain in a compact neutral grid.
- Service proof: the authentic editorial image and temperature label lead a direct image/editorial split followed by a straight operational ledger; the decorative path and stagger are removed.
- Channels and final CTA: compact divided pathways lead to one graphite CTA with a functional orange edge locator.

## TDD evidence

### RED

Exact command:

```text
bun test tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/living-design-contract.test.ts tests/living-build-verifier.test.ts tests/motion.test.ts
```

Expected output summary captured before production edits:

```text
10 tests failed:
(fail) homepage composition > living hero server-renders one image-forward product stage and compact facts
(fail) homepage composition > the localized homepage consumes CMS queries and a central locale counterpart
(fail) homepage composition > keeps all ten homepage sections near-static and free of decorative motion hooks
(fail) reviewed homepage contracts > category discovery is image-led, count-aware, and orderly
(fail) reviewed homepage contracts > uses product imagery and fact locators instead of decorative authored shapes
(fail) living build verifier semantics > rejects decorative reveal and canvas hooks in generated homepage markup
(fail) living build verifier semantics > rejects emitted reveal, canvas, and preference chunks even when unreachable
(fail) Precision Supply System identity > uses neutral rectangular hero and product stages
(fail) Precision Supply System identity > keeps the homepage free of reveal and ambient canvas contracts
(fail) Precision Supply System identity > removes legacy decorative presentation from every active styled surface

50 pass
10 fail
520 expect() calls
Ran 60 tests across 5 files.
```

These failures were caused by the old `OrganicMark`/Canvas hero markup, motion imports, `data-reveal` hooks, staggered category/service composition, undeleted ambient modules, and generated-output verifier gaps.

### GREEN

Exact command:

```text
bun test tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/living-design-contract.test.ts tests/living-build-verifier.test.ts tests/motion.test.ts
```

Exact result summary:

```text
60 pass
0 fail
570 expect() calls
Ran 60 tests across 5 files. [608.00ms]
```

The GREEN run includes nine living-build-verifier semantics tests, including rejection of generated reveal/Canvas hooks and unreachable reveal, canvas, or preference chunks.

## Deletion proof

Before deletion, the following import search was run:

```text
rg -n "(?:from|import\s*\()[^\r\n]*(?:motion/(?:reveal|living-canvas|preferences)|lib/motion/(?:reveal|living-canvas|preferences))" src tests
```

Result: no live source or runtime-test import remained. The only matches were negative string assertions in `tests/homepage-composition.test.ts`.

A second residue search found the named initializers only in their own modules:

```text
src/lib/motion/reveal.ts: export function installReveals(...)
src/lib/motion/preferences.ts: export const shouldEnhanceMotion = ...
src/lib/motion/living-canvas.ts: export function mountLivingCanvas(...)
```

Only after that proof, these files were deleted:

- `src/lib/motion/reveal.ts`
- `src/lib/motion/living-canvas.ts`
- `src/lib/motion/preferences.ts`

Post-build `rg` over `src` and `dist` found no `data-reveal`, `data-revealed`, `data-motion-enhanced`, `data-living-canvas`, `installReveals`, `mountLivingCanvas`, or `shouldEnhanceMotion` residue.

## Generated-output verification

`tests/verify-built-living-design.ts` now:

- scans emitted HTML, CSS, JS, and JSON for decorative motion hooks and initializer names;
- rejects emitted chunk names beginning with `reveal`, `living-canvas`, or `preferences`, even if unreachable;
- preserves the carousel DOM/localization verification;
- renames the surviving enhancement graph to the homepage interaction graph;
- tightens that graph from a 35,000-byte to a 12,000-byte gzip budget.

The production build measured:

```text
Living design verified: 6 canonical routes, 1 initial JS files and 2 inline JS bodies (1710 gzip bytes), 3 homepage SVG files (1666 gzip bytes), 2 reachable interaction files (1677 gzip bytes).
```

## Verification

### Astro check

Command:

```text
bun run check
```

Result:

```text
Result (104 files):
- 0 errors
- 0 warnings
- 0 hints
```

### Production build

Command:

```text
bun run build
```

The first run generated all 42 pages and passed the living-design, catalog, brand, blog, and enquiry verifiers, then exposed an existing MVP verifier bug: it searched the HTML body rather than the emitted linked CSS for the scoped `.organic-mark{display:none}` rule. `tests/verify-built-mvp.ts` was corrected to inspect its already-collected CSS string; no 404 component or interior styling changed.

The final build result was:

```text
42 page(s) built
Living design verified ... 2 reachable interaction files (1677 gzip bytes).
Catalog build verified.
Brand build verified.
Blog build verified.
Verified bilingual built enquiry pages.
Verified 42 generated pages plus bilingual 404 metadata, landmarks, direct locale links, and no-JavaScript contract.
Verified floating rail on 40 canonical localized pages.
Verified exact 42-page generated HTML route manifest.
Exit code: 0
```

Astro emitted the pre-existing root-route priority warning:

```text
Could not render `` from route `/` as it conflicts with higher priority route `/`.
```

It did not affect the exact route-manifest verifier.

### Full test suite

Command, run once after focused tests, check, build, and code review:

```text
bun test
```

Exact result summary:

```text
192 pass
0 fail
1230 expect() calls
Ran 192 tests across 28 files. [1099.00ms]
```

### Diff hygiene

```text
git diff --check
```

Result: exit code 0 with no whitespace errors.

## Files changed

Homepage components:

- `src/components/sections/LivingHero.astro`
- `src/components/sections/CredibilityStrip.astro`
- `src/components/sections/CategoryDiscovery.astro`
- `src/components/sections/FeaturedProducts.astro`
- `src/components/sections/FeaturedBrands.astro`
- `src/components/blogs/LatestBlogs.astro`
- `src/components/sections/PartnerStrip.astro`
- `src/components/sections/ServiceProof.astro`
- `src/components/sections/ChannelPathways.astro`
- `src/components/sections/FinalCta.astro`

Removed runtime modules:

- `src/lib/motion/reveal.ts`
- `src/lib/motion/living-canvas.ts`
- `src/lib/motion/preferences.ts`

Contracts and verifiers:

- `tests/homepage-composition.test.ts`
- `tests/homepage-contract.test.ts`
- `tests/living-design-contract.test.ts`
- `tests/living-build-verifier.test.ts`
- `tests/motion.test.ts`
- `tests/verify-built-living-design.ts`
- `tests/verify-built-mvp.ts`

Report:

- `.superpowers/sdd/task-2-report.md`

## Self-review

- Hierarchy: the hero is the only oversized visual statement. Credibility immediately converts brand claims into operational facts. Category, product, and brand sections then move from discovery to specific evidence; service and channel sections become denser before the single high-contrast CTA.
- Product-led emphasis: every large visual surface uses existing CMS/authentic imagery. The removed marks, path, stagger, and ambient canvas no longer compete with the products.
- Copy density: headings, descriptions, labels, counts, origins, temperature, product names, and channel descriptions remain compact and source-derived. No marketing copy was invented.
- Motion: authored reveals and ambient Canvas are absent. Carousel scroll/controls and floating-rail motion remain because they communicate functional state.
- Responsive semantics: source order never changes; grids collapse without visual reordering; the carousel remains horizontally scrollable and keyboard focusable; mobile CTA actions stack.
- Accessibility: heading relationships, figure caption, image dimensions/alts, eager hero priority, carousel localized labels/live status, focusability, and reduced-motion rail behavior remain intact.
- Scope: catalog, brand-card, blog-card, form, and 404 interiors were not restyled. The only non-listed verifier correction changes where generated CSS is inspected.

## Concerns and deferred QA

- Browser screenshot QA is intentionally deferred to Task 5. The code-level review found no hierarchy contradiction, but crop balance of the 4:3 category images and 16:10 service image should be inspected at intermediate tablet widths.
- The Astro root-route priority warning remains pre-existing and route-manifest-safe.
- Existing CMS demo SVG imagery remains because the brief explicitly requires reuse of authentic/demo media and forbids replacement artwork in this task.

## Important finding follow-up

Date: 2026-07-25

### Corrections

- `CredibilityStrip` now pins its local Newsreader H2 to `var(--text-h2)` at weight 500.
- `CredibilityStrip` fact labels now declare weight 600 rather than inheriting the browser's heavier default for `strong`.
- Both primary and secondary `FeaturedBrands` H3 rules now use the exact `var(--text-h3)` token.
- `FeaturedBrands` utility links and `LatestBlogs` utility links are capped at Nunito weight 600.
- `ServiceProof` editorial and pillar labels now have explicit weights of 500 and 600 respectively.
- `FinalCta` now uses the exact `var(--text-h2)` token and a neutral brushed-steel border. The orange edge was removed because the CTA is not a product-fact surface.
- The `::selection` contract now extracts one rule and requires both `background: var(--color-paradise-orange)` and `color: var(--color-graphite)` from that same rule.
- Nine separate component-level tests cover these distinct invariants; the obsolete broad `--text-2xl` alias assertion was removed rather than duplicated.

### Follow-up RED

Exact command:

```text
bun test tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/living-design-contract.test.ts
```

Before production edits, the selector helper was corrected to inspect base component rules where responsive overrides also matched. The corrected RED result was:

```text
9 tests failed:
(fail) Precision Supply System identity > keeps the credibility heading on the approved local H2 display role
(fail) Precision Supply System identity > keeps the credibility display heading at the approved medium weight
(fail) Precision Supply System identity > keeps every featured-brand heading on the approved local H3 scale
(fail) Precision Supply System identity > keeps the final CTA heading on the approved local H2 scale
(fail) Precision Supply System identity > caps latest-blog Nunito utility weights at semibold
(fail) Precision Supply System identity > caps featured-brand Nunito utility weights at semibold
(fail) Precision Supply System identity > gives credibility fact labels an explicit semibold ceiling
(fail) Precision Supply System identity > gives service-proof labels explicit weights no heavier than semibold
(fail) Precision Supply System identity > uses only a neutral boundary on the non-fact final CTA surface

47 pass
9 fail
548 expect() calls
Ran 56 tests across 3 files. [157.00ms]
```

The strengthened selection-pairing test passed during RED because the production declarations were already correct; the finding was a missing same-rule regression assertion, not missing CSS.

### Follow-up GREEN

Exact command:

```text
bun test tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/living-design-contract.test.ts
```

Exact result:

```text
56 pass
0 fail
545 expect() calls
Ran 56 tests across 3 files. [172.00ms]
```

### Follow-up verification

Astro diagnostics:

```text
bun run check

Result (104 files):
- 0 errors
- 0 warnings
- 0 hints
```

Full suite, run once before the follow-up commit:

```text
bun test

201 pass
0 fail
1241 expect() calls
Ran 201 tests across 28 files. [2.63s]
```

The planned 199-test floor is exceeded by two meaningful contracts; obsolete reveal/Canvas lifecycle tests remain removed.

Diff and source audit:

```text
git diff --check
# exit code 0

rg -n "font-weight:\s*700|font-size:\s*(?:var\(--text-2xl\)|var\(--text-xl\)|clamp\(2rem, 4vw, 3.5rem\))|final-cta[^\r\n]*color-paradise-orange" \
  src/components/sections/CredibilityStrip.astro \
  src/components/sections/FeaturedBrands.astro \
  src/components/sections/FinalCta.astro \
  src/components/sections/ServiceProof.astro \
  src/components/blogs/LatestBlogs.astro
# no matches
```

### Follow-up concerns

- No new functional or structural concerns were found. Browser crop review remains deferred to Task 5 as previously recorded.
