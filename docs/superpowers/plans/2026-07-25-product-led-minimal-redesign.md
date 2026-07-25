# Product-Led Minimal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a quieter, compact, image-forward Paradise Fine Foods interface across all bilingual routes without changing content, information architecture, or functional behavior.

**Architecture:** Keep the existing Astro component/page ownership and CMS/query layer. Establish the approved global tokens first, then restyle the homepage, catalog/brand surfaces, and editorial/form surfaces in independently reviewable tasks; remove only the decorative motion modules and hooks that become unused.

**Tech Stack:** Astro 7, TypeScript 6, Bun test runner, component-scoped CSS, Astro assets, Cloudflare static output.

## Global Constraints

- Preserve all ten homepage sections in their current order and preserve all 42 generated routes.
- Preserve CMS data/types/queries, localized copy, SEO metadata, forms, filters, carousel semantics, language switching, and floating-rail behavior.
- Use only `#FFFFFF`, `#F5F6F2`, `#D9DCD7`, `#202522`, `#68706A`, and `#E46F2C` for recurring non-semantic interface color.
- Use Newsreader 500 only for H1/H2/display type; use Nunito 400/500/600 everywhere else.
- Use H1 `clamp(2.25rem, 5vw, 4.25rem)`, H2 `clamp(1.75rem, 3vw, 2.75rem)`, H3 `clamp(1.125rem, 1.5vw, 1.35rem)`, and section spacing `clamp(2.5rem, 5vw, 4rem)`.
- Use square media/cards/panels; form controls may use at most `2px` radius; do not introduce shadows, gradients, masks, washes, or decorative image effects.
- Use the orange inventory locator only with genuine product facts.
- Remove ambient Canvas and authored reveal behavior; keep functional interactions and reduced-motion-safe transitions.
- Maintain WCAG AA contrast, visible focus, 44px targets, source order, and no horizontal overflow at 1280x800 and 390x844.
- Reuse existing imagery and dependencies; add no generated assets, third-party assets, fonts, frameworks, or runtime packages.

---

### Task 1: Global Foundation and Shared Chrome

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `tests/floating-form-rail-render-contract.test.ts`
- Modify: `src/styles/tokens.css`, `src/styles/typography.css`, `src/styles/global.css`
- Modify: `src/components/global/Header.astro`, `Footer.astro`, `ButtonLink.astro`, `LanguageSwitcher.astro`, `FloatingFormRail.astro`

**Interfaces:**
- Consumes: the existing CSS custom-property names and existing component props/markup.
- Produces: exact approved type/spacing/radius/transition tokens used unchanged by Tasks 2-4.

- [ ] Add contract assertions for the exact H1/H2/H3 scales, section spacing, zero card/panel radius, `2px` maximum control radius, 44px targets, compact shared shell, and absence of decorative shadows/gradients.
- [ ] Run `bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts`; verify the new assertions fail against the industrial baseline.
- [ ] Implement the global tokens and compact shared components without changing component props, navigation targets, localized labels, or rail state behavior.
- [ ] Re-run the focused tests and `bun run check`; require zero failures and zero diagnostics.
- [ ] Commit as `feat: establish product-led minimal foundation`.

### Task 2: Product-Led Homepage and Near-Static Runtime

**Files:**
- Modify: `tests/homepage-composition.test.ts`, `tests/homepage-contract.test.ts`, `tests/living-design-contract.test.ts`, `tests/living-build-verifier.test.ts`, `tests/motion.test.ts`
- Modify: `tests/verify-built-living-design.ts`
- Modify: `src/components/sections/LivingHero.astro`, `CredibilityStrip.astro`, `CategoryDiscovery.astro`, `FeaturedProducts.astro`, `FeaturedBrands.astro`, `PartnerStrip.astro`, `ServiceProof.astro`, `ChannelPathways.astro`, `FinalCta.astro`
- Modify: `src/components/blogs/LatestBlogs.astro`
- Delete when unreferenced: `src/lib/motion/reveal.ts`, `src/lib/motion/living-canvas.ts`, `src/lib/motion/preferences.ts`

**Interfaces:**
- Consumes: Task 1 tokens and existing homepage props, queries, section order, carousel controller, and image assets.
- Produces: a ten-section product-led homepage with no `data-reveal`, `data-living-canvas`, reveal import, Canvas import, or decorative enhancement bundle.

- [ ] Replace old reveal/Canvas expectations with assertions for exact section order, image-forward hero/card stages, compact metadata, near-static markup, and absence of decorative motion imports/hooks.
- [ ] Run `bun test tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/living-design-contract.test.ts tests/living-build-verifier.test.ts tests/motion.test.ts`; verify failures identify the old motion and styling contracts.
- [ ] Restyle every homepage section using authentic media, whitespace, steel separators, compact copy, and product-fact locators; preserve all content, props, links, headings, carousel behavior, and source order.
- [ ] Remove the ambient/reveal initialization and delete motion modules only after `rg` proves they have no remaining import.
- [ ] Update the generated-output verifier so a build fails if reveal/Canvas hooks or their enhancement chunks return.
- [ ] Re-run the focused tests, `bun run check`, and `bun run build`; require all verifiers and the 42-route manifest to pass.
- [ ] Commit as `feat: simplify homepage around product imagery`.

### Task 3: Catalog and Brand Surfaces

**Files:**
- Modify: `tests/living-design-contract.test.ts`, `tests/product-card.test.ts`, `tests/catalog-routes.test.ts`, `tests/brand-routes.test.ts`
- Modify: `src/components/catalog/ProductCard.astro`, `ProductGrid.astro`, `ProductMetadata.astro`, `ProductDetail.astro`, `CatalogFilters.astro`
- Modify: `src/components/brands/BrandCard.astro`, `BrandDetail.astro`
- Modify: localized product and brand index/detail page-scoped styles under `src/pages/[locale]/`

**Interfaces:**
- Consumes: Task 1 tokens, existing catalog state/filter contracts, CMS product/brand types, and localized route helpers.
- Produces: shared image-leading product/brand stages and compact metadata/filter layouts with all existing URLs and interactions intact.

- [ ] Add assertions that catalog/brand cards use unmasked neutral media stages, restrained separators, compact filters, genuine metadata locators, and no redundant surrounding decorative box.
- [ ] Run `bun test tests/living-design-contract.test.ts tests/product-card.test.ts tests/catalog-routes.test.ts tests/brand-routes.test.ts`; verify the added styling assertions fail first.
- [ ] Implement the product-led catalog/detail/brand styling without changing filters, result state, sticky behavior, product metadata order, related-product queries, or enquiry links.
- [ ] Re-run the focused tests and `bun run check`; require zero failures and diagnostics.
- [ ] Commit as `feat: simplify catalog and brand surfaces`.

### Task 4: Editorial, Enquiry, and 404 Surfaces

**Files:**
- Modify: `tests/living-design-contract.test.ts`, `tests/blog-components.test.ts`, `tests/blog-routes.test.ts`, `tests/enquiry-render-contract.test.ts`, `tests/mvp-completion.test.ts`
- Modify: `src/components/blogs/BlogCard.astro`, `BlogArticle.astro`
- Modify: `src/components/forms/EnquiryForm.astro`
- Modify: localized blog/contact page-scoped styles under `src/pages/[locale]/`
- Modify: `src/pages/404.astro`

**Interfaces:**
- Consumes: Task 1 tokens, existing blog records/routes, enquiry controller/validation/types, and localized 404 links.
- Produces: compact editorial reading, flat forms, and a product-led 404 while retaining every semantic and validation relationship.

- [ ] Add assertions for image-leading blog cards, compact article labels, flat form fields, direct validation feedback, restrained 404 stages, 44px targets, and absence of shadows/decorative masks.
- [ ] Run `bun test tests/living-design-contract.test.ts tests/blog-components.test.ts tests/blog-routes.test.ts tests/enquiry-render-contract.test.ts tests/mvp-completion.test.ts`; verify the new styling assertions fail first.
- [ ] Implement the approved styling without changing blog content/order, form fields/options/submission behavior, focus/error relationships, locale links, or 404 landmarks.
- [ ] Re-run the focused tests and `bun run check`; require zero failures and diagnostics.
- [ ] Commit as `feat: simplify editorial and enquiry surfaces`.

### Task 5: Responsive Browser Audit and Cross-App Polish

**Files:**
- Modify only the component/page styles proven defective by the audit.
- Modify the closest existing source contract test for each correction before production CSS.
- Record: `.superpowers/sdd/product-led-minimal-browser-qa.md` and ignored screenshots.

**Interfaces:**
- Consumes: Tasks 1-4 and the exact current static route set.
- Produces: verified desktop/mobile English/Vietnamese presentation with no new public interface.

- [ ] Run `bun run build`, serve the generated `dist`, and inspect English/Vietnamese home, product index/detail, brand index/detail, blog index/article, general/mode-specific contact, and 404 at 1280x800 and 390x844.
- [ ] Record computed viewport width, document scroll width, heading fit, focus visibility, rail/control overlap, and console errors for every representative template.
- [ ] For each defect, add a focused failing source contract, verify failure, apply the smallest CSS/markup correction, and verify the focused test passes.
- [ ] Confirm all audited routes have no horizontal overflow, no essential rail obstruction, readable Vietnamese text, dominant authentic media, 44px targets, and visible keyboard focus.
- [ ] Run `bun test`, `bun run check`, `bun run build`, and `git diff --check`; require 0 failures, 0 diagnostics, 42 routes, all verifiers passing, and no warning beyond the accepted root-route warning.
- [ ] Commit as `test: verify product-led minimal interface`.
