# Paradise Fine Foods Industrial Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing bilingual Paradise Fine Foods application into the approved minimal industrial visual system without changing page structure, content, routes, or interaction behavior.

**Architecture:** Keep all Astro markup, component composition, data flow, and TypeScript controllers intact. Establish canonical industrial design tokens first, then update component-scoped CSS in coherent surface groups while revising source contracts alongside each group. Retain existing token aliases only as neutral compatibility mappings during the refactor; final component consumers use the canonical industrial tokens.

**Tech Stack:** Astro 7, TypeScript 6, Bun test runner, component-scoped CSS, existing Newsreader and Nunito font packages.

## Global Constraints

- This is a styling-only redesign.
- Preserve all ten homepage sections in their current order.
- Preserve every existing public route and localized route pair.
- Preserve existing Astro component boundaries and page composition.
- Preserve existing content, labels, metadata, and CMS query behavior.
- Preserve existing navigation, carousel, filter, form, language-switching, and floating-rail interactions.
- Preserve existing responsive layout behavior unless a CSS correction is required to prevent overflow or obstruction.
- Preserve existing semantic HTML and accessibility relationships.
- Do not merge, remove, add, or reorder homepage sections.
- Do not change business logic, content data, route generation, or interaction controllers.
- Do not remove the floating enquiry rail or carousel.
- Do not introduce a new font family, icon system, framework, dependency, or JavaScript enhancement.
- Standard corner radius is `0` to `4px`; pill geometry is permitted only for true status indicators.
- Paradise orange `#E46F2C` is the only recurring brand accent.
- Product photography, packaging, partner logos, and approved brand artwork retain their authentic colors.
- Success uses `#356146` and error uses `#9A3F38`, only when the corresponding state is present.
- CSS transitions are limited to interaction feedback and must not exceed `160ms`.
- Maintain WCAG AA contrast, visible focus, logical source/tab order, and `44px` minimum touch targets.
- Verify at exact viewport widths of `1280px` and `390px` in English and Vietnamese.

---

## File Responsibility Map

- `src/styles/tokens.css`: canonical palette, compatibility mappings, spacing, type scale, radius, focus, and transition tokens.
- `src/styles/typography.css`: global display/body role assignment and label treatment.
- `src/styles/global.css`: resets, shared layout utilities, links, focus, selection, and reduced-motion baseline.
- `src/components/global/*.astro`: shared shell, navigation, actions, breadcrumbs, decorative mark suppression, and enquiry rail presentation.
- `src/components/sections/*.astro`: the ten homepage sections; markup and order remain unchanged.
- `src/components/catalog/*.astro`: catalog controls, cards, grid, product detail, and specification presentation.
- `src/components/brands/*.astro`: brand card/detail presentation without partner accent backgrounds.
- `src/components/blogs/*.astro`: article and card presentation.
- `src/components/forms/EnquiryForm.astro`: flat form layout and semantic state styling.
- `src/pages/[locale]/**/*.astro` and `src/pages/404.astro`: page-level spacing/surface rules only.
- `tests/living-design-contract.test.ts`: primary source-level styling and structural contract.
- `tests/homepage-composition.test.ts`: exact homepage section order and enhancement-markup preservation.
- `tests/floating-form-rail-render-contract.test.ts`: rail structure/behavior retention and approved presentation values.
- `tests/verify-built-living-design.ts`: existing production-build structure and budget verification; change only if a removed presentation assertion requires it.

## Task 1: Establish the Industrial Foundation

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/typography.css`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing CSS custom-property usage throughout Astro components.
- Produces: canonical tokens `--color-process-white`, `--color-cold-paper`, `--color-brushed-steel`, `--color-graphite`, `--color-utility-grey`, `--color-paradise-orange`, `--color-success`, `--color-error`, `--radius-sm`, `--radius-md`, `--focus-ring`, `--transition-fast`, and `--transition-base`.

- [ ] **Step 1: Replace the palette contract with a failing industrial foundation test**

In `tests/living-design-contract.test.ts`, rename the outer description to `Precision Supply System identity` and replace the old bright-palette test with:

```ts
test('defines the approved industrial palette and neutral compatibility mappings', () => {
  const tokens = source('src/styles/tokens.css').toLowerCase();
  for (const declaration of [
    '--color-process-white: #ffffff',
    '--color-cold-paper: #f5f6f2',
    '--color-brushed-steel: #d9dcd7',
    '--color-graphite: #202522',
    '--color-utility-grey: #68706a',
    '--color-paradise-orange: #e46f2c',
    '--color-success: #356146',
    '--color-error: #9a3f38',
  ]) expect(tokens).toContain(declaration);

  for (const retiredHex of ['#fa6c47', '#0796d2', '#94c11f', '#d94d55', '#fbfaf5', '#28342b', '#e8f6fa']) {
    expect(tokens).not.toContain(retiredHex);
  }

  expect(tokens).toContain('--color-paper-white: var(--color-process-white)');
  expect(tokens).toContain('--color-rice-paper: var(--color-cold-paper)');
  expect(tokens).toContain('--color-mist-blue: var(--color-cold-paper)');
  expect(tokens).toContain('--color-deep-herb: var(--color-graphite)');
  expect(tokens).toContain('--shape-drop: var(--radius-sm)');
});
```

Update contrast assertions in the same file from `#28342b` to `#202522`. In the link contrast test, require `color: var(--color-graphite)` and `text-decoration-color: var(--color-paradise-orange)` for the global link rules. In the eyebrow contrast test, require `color: var(--color-utility-grey)` and reject every bright brand token. Keep authentic-logo, route, CMS, interaction, and accessibility assertions unchanged.

- [ ] **Step 2: Run the focused contract and confirm it fails**

Run: `bun test tests/living-design-contract.test.ts`

Expected: FAIL because canonical industrial tokens are not defined and retired bright hex values are still present.

- [ ] **Step 3: Implement the canonical token system**

Replace the color, radius, focus, transition, and upper spacing portions of `src/styles/tokens.css` with these exact declarations while retaining the existing font-family declarations:

```css
:root {
  --color-process-white: #ffffff;
  --color-cold-paper: #f5f6f2;
  --color-brushed-steel: #d9dcd7;
  --color-graphite: #202522;
  --color-utility-grey: #68706a;
  --color-paradise-orange: #e46f2c;
  --color-success: #356146;
  --color-error: #9a3f38;

  --color-paper-white: var(--color-process-white);
  --color-rice-paper: var(--color-cold-paper);
  --color-mist-blue: var(--color-cold-paper);
  --color-deep-herb: var(--color-graphite);
  --color-paradise-tangerine: var(--color-paradise-orange);
  --color-paradise-blue: var(--color-brushed-steel);
  --color-paradise-green: var(--color-brushed-steel);
  --color-paradise-coral: var(--color-brushed-steel);

  --font-display: 'Newsreader', Georgia, serif;
  --font-body: 'Nunito', system-ui, sans-serif;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.5rem;
  --space-8: 3.5rem;
  --space-9: 5rem;

  --container-inline: clamp(1rem, 4vw, 4rem);
  --container-max: 80rem;
  --measure: 68ch;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: clamp(1.0625rem, 1.35vw, 1.2rem);
  --text-xl: clamp(1.375rem, 2vw, 1.75rem);
  --text-2xl: clamp(1.875rem, 4vw, 3.5rem);
  --text-hero: clamp(2.5rem, 6vw, 5rem);

  --leading-tight: 1;
  --leading-heading: 1.08;
  --leading-body: 1.6;
  --tracking-label: 0.07em;

  --radius-sm: 0;
  --radius-md: 0.25rem;
  --shape-drop: var(--radius-sm);
  --focus-ring: 0 0 0 3px color-mix(in srgb, var(--color-paradise-orange) 55%, transparent);
  --transition-fast: 120ms ease;
  --transition-base: 160ms ease;
}
```

Update `src/styles/typography.css` so `h1`, `h2`, and `.display-type` use `var(--font-display)`, while `h3` uses `var(--font-body)` with weight `600`. Use this exact eyebrow rule so non-technical section labels are not presented as specification fields:

```css
.eyebrow {
  color: var(--color-utility-grey);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.4;
  text-transform: none;
}
```

Update `src/styles/global.css` to use canonical tokens directly:

```css
html { background: var(--color-cold-paper); color: var(--color-graphite); }
a { color: var(--color-graphite); }
a:hover { text-decoration-color: var(--color-paradise-orange); }
:focus-visible { border-radius: var(--radius-sm); box-shadow: var(--focus-ring); outline: 2px solid var(--color-graphite); outline-offset: 3px; }
::selection { background: color-mix(in srgb, var(--color-paradise-orange) 24%, var(--color-process-white)); color: var(--color-graphite); }
.section-space { padding-block: clamp(var(--space-7), 7vw, var(--space-9)); }
```

- [ ] **Step 4: Run foundation and regression tests**

Run: `bun test tests/living-design-contract.test.ts tests/homepage-composition.test.ts tests/i18n.test.ts`

Expected: PASS. If a failure still asserts a retired literal color, update only that styling assertion to its canonical equivalent; do not weaken structural or behavior assertions.

- [ ] **Step 5: Commit the foundation**

```bash
git add tests/living-design-contract.test.ts src/styles/tokens.css src/styles/typography.css src/styles/global.css
git commit -m "style: establish industrial design foundation"
```

## Task 2: Restyle the Shared Shell and Primitives

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `tests/floating-form-rail-render-contract.test.ts`
- Modify: `src/components/global/Header.astro`
- Modify: `src/components/global/Footer.astro`
- Modify: `src/components/global/ButtonLink.astro`
- Modify: `src/components/global/Breadcrumbs.astro`
- Modify: `src/components/global/LanguageSwitcher.astro`
- Modify: `src/components/global/OrganicMark.astro`
- Modify: `src/components/global/FloatingFormRail.astro`

**Interfaces:**
- Consumes: canonical tokens from Task 1 and existing global-component markup/controllers.
- Produces: neutral shell and action primitives reused by every route; the exact floating-rail DOM and controller interface remain unchanged.

- [ ] **Step 1: Write failing shell and rail presentation assertions**

Replace the rail styling token loop in `tests/living-design-contract.test.ts` and the presentation values in `tests/floating-form-rail-render-contract.test.ts` with assertions for:

```ts
for (const value of [
  'var(--color-cold-paper)',
  'var(--color-process-white)',
  'var(--color-graphite)',
  'var(--color-brushed-steel)',
  'var(--color-paradise-orange)',
  '160ms ease',
  'inline-size: 2.75rem',
  'block-size: 2.75rem',
  'inline-size: min(12rem, calc(100vw - 2.75rem))',
  '@media (prefers-reduced-motion: reduce)',
]) expect(rail).toContain(value);

for (const removed of ['clip-path', 'drop-shadow', '@keyframes floating-rail-enter', '360ms cubic-bezier']) {
  expect(rail).not.toContain(removed);
}
```

Add these primitive assertions to `tests/living-design-contract.test.ts`:

```ts
expect(source('src/components/global/OrganicMark.astro')).toContain('display: none');
expect(cssRule(source('src/components/global/ButtonLink.astro'), '.button-link--primary')).toContain('background: var(--color-graphite)');
expect(cssRule(source('src/components/global/ButtonLink.astro'), '.button-link--primary')).toContain('border-color: var(--color-paradise-orange)');
expect(cssRule(source('src/components/global/Header.astro'), '.site-header')).toContain('border-bottom: 1px solid var(--color-brushed-steel)');
```

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run: `bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts`

Expected: FAIL on the old clipped, shadowed, 360ms rail and old shell color consumers.

- [ ] **Step 3: Apply the shell and primitive styling**

Make only CSS changes inside the listed Astro files. Use these exact presentation rules as the task contract:

```css
/* Header */
.site-header { background: var(--color-cold-paper); border-bottom: 1px solid var(--color-brushed-steel); }
.site-header__bar { min-block-size: 5rem; }
.wordmark img { inline-size: 5.25rem; }
.primary-nav a { color: var(--color-graphite); }
.primary-nav a:hover { color: var(--color-graphite); text-decoration-color: var(--color-paradise-orange); }

/* Buttons */
.button-link { border-radius: var(--radius-sm); min-block-size: 2.75rem; transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast); }
.button-link--primary { background: var(--color-graphite); border-color: var(--color-paradise-orange); color: var(--color-process-white); }
.button-link--primary:hover { background: var(--color-graphite); border-color: var(--color-paradise-orange); color: var(--color-process-white); }
.button-link--secondary { background: var(--color-process-white); border-color: var(--color-graphite); color: var(--color-graphite); }

/* Footer and utility navigation */
.site-footer { background: var(--color-graphite); color: var(--color-cold-paper); }
.site-footer__label { color: var(--color-brushed-steel); }
.site-footer__legal { border-top: 1px solid var(--color-brushed-steel); }
.breadcrumbs { color: var(--color-utility-grey); text-transform: none; }
.breadcrumbs__separator { color: var(--color-paradise-orange); }
.language-switcher span { border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }

/* Decorative primitive */
.organic-mark { display: none; }

/* Rail */
.floating-form-rail { filter: none; transition: translate var(--transition-base); }
.floating-form-rail__toggle { background: var(--color-graphite); border: 0; border-inline-start: 2px solid var(--color-paradise-orange); color: var(--color-process-white); filter: none; transition: background-color var(--transition-fast); }
.floating-form-rail__panel { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-block-start: 2px solid var(--color-paradise-orange); filter: none; inline-size: min(12rem, calc(100vw - 2.75rem)); padding: var(--space-1) var(--space-3); }
.floating-form-rail__panel a { border-block-end: 1px solid var(--color-brushed-steel); color: var(--color-graphite); transition: background-color var(--transition-fast), color var(--transition-fast); }
.floating-form-rail__panel a:hover,
.floating-form-rail__panel a:focus-visible { background: var(--color-cold-paper); color: var(--color-graphite); }
```

Delete the button hover/focus transform, the rail entrance keyframes, and all `drop-shadow`, `clip-path`, 360ms, and cubic-bezier declarations. Keep all markup, data attributes, script imports, selectors used by the controller, and responsive positioning rules. Use the footer, breadcrumb, and language-switcher declarations above without changing their markup.

- [ ] **Step 4: Run shell, rail, accessibility, and interaction tests**

Run: `bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts tests/motion.test.ts tests/icon-system.test.ts`

Expected: PASS, including the unchanged rail lifecycle and accessibility-copy tests.

- [ ] **Step 5: Commit the shared shell**

```bash
git add tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts src/components/global
git commit -m "style: simplify shared shell and enquiry rail"
```

## Task 3: Restyle the Hero and Product Discovery Surfaces

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `tests/homepage-composition.test.ts`
- Modify: `src/components/sections/LivingHero.astro`
- Modify: `src/components/sections/CredibilityStrip.astro`
- Modify: `src/components/sections/CategoryDiscovery.astro`
- Modify: `src/components/sections/FeaturedProducts.astro`
- Modify: `src/components/catalog/ProductCard.astro`

**Interfaces:**
- Consumes: global tokens and ButtonLink from Tasks 1–2; existing carousel and motion controller markup.
- Produces: rectangular product stages and reusable product specification bands used by homepage and catalog routes.

- [ ] **Step 1: Write failing hero/discovery style contracts**

Replace old hero backplate and organic-card assertions with:

```ts
test('uses neutral rectangular hero and product stages', () => {
  const hero = source('src/components/sections/LivingHero.astro');
  expect(cssRule(hero, '.living-hero__art')).toContain('background: var(--color-cold-paper)');
  expect(cssRule(hero, '[data-living-canvas]')).toContain('display: none');
  expect(hero).not.toContain('drop-shadow');

  const card = source('src/components/catalog/ProductCard.astro');
  expect(cssRule(card, '.product-card__organic-media')).toContain('border-radius: var(--radius-sm)');
  expect(cssRule(card, '.product-card__meta')).toContain('border-block-start: 2px solid var(--color-paradise-orange)');
  expect(card).not.toContain('var(--shape-drop)');
});
```

In `tests/homepage-composition.test.ts`, keep all assertions that the image, actions, caption, `data-living-canvas`, controller imports, and disposal behavior remain present. Add an assertion that the canvas is presentation-suppressed rather than removed:

```ts
expect(hero).toMatch(/\[data-living-canvas\]\s*\{[^}]*display:\s*none/);
```

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run: `bun test tests/living-design-contract.test.ts tests/homepage-composition.test.ts tests/product-card.test.ts tests/carousel.test.ts`

Expected: FAIL on mist-blue/organic stages, visible Canvas presentation, rounded controls, and legacy color consumers.

- [ ] **Step 3: Apply precise hero and discovery styling**

Preserve markup and use these declarations as the required visual baseline:

```css
/* LivingHero.astro */
.living-hero { background: var(--color-process-white); border-block-end: 1px solid var(--color-brushed-steel); }
.living-hero__content { min-block-size: min(44rem, calc(100vh - 6rem)); }
.living-hero h1 { font-size: clamp(2.75rem, 5vw, 5rem); }
.living-hero__metadata { border-block-start: 2px solid var(--color-paradise-orange); }
.living-hero__metadata div { border-block-end: 1px solid var(--color-brushed-steel); }
.living-hero__metadata dt { color: var(--color-utility-grey); }
.living-hero__art { background: var(--color-cold-paper); border-inline: 1px solid var(--color-brushed-steel); }
.living-hero__art figcaption { background: var(--color-graphite); color: var(--color-process-white); }
:global(.living-hero__mark),
[data-living-canvas] { display: none; }

/* ProductCard.astro */
.product-card__organic-media { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.product-card__organic-media::before { background: var(--color-cold-paper); border-radius: var(--radius-sm); }
.product-card__meta { border-block-start: 2px solid var(--color-paradise-orange); color: var(--color-graphite); }
```

For CredibilityStrip, CategoryDiscovery, and FeaturedProducts:

- Replace all legacy bright/mist/deep-herb consumers with canonical tokens.
- Change every media/control/card radius to `var(--radius-sm)` or `var(--radius-md)`.
- Replace organic bullets with `0.5rem` square graphite/steel markers; orange is allowed only for the active datum or interaction state.
- Remove component `filter`, `drop-shadow`, and decorative color-mix declarations.
- Keep every `data-reveal`, `data-carousel*`, ARIA attribute, item order, and responsive grid/overflow rule.
- Set carousel control transitions to `var(--transition-fast)` and keep `min-block-size: 2.75rem`.

- [ ] **Step 4: Run hero, discovery, carousel, and structure tests**

Run: `bun test tests/living-design-contract.test.ts tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/product-card.test.ts tests/carousel.test.ts tests/motion.test.ts`

Expected: PASS with unchanged hero/carousel structure and behavior.

- [ ] **Step 5: Commit hero and discovery styling**

```bash
git add tests/living-design-contract.test.ts tests/homepage-composition.test.ts src/components/sections/LivingHero.astro src/components/sections/CredibilityStrip.astro src/components/sections/CategoryDiscovery.astro src/components/sections/FeaturedProducts.astro src/components/catalog/ProductCard.astro
git commit -m "style: industrialize hero and product discovery"
```

## Task 4: Restyle the Remaining Homepage Sections

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `src/components/sections/FeaturedBrands.astro`
- Modify: `src/components/blogs/LatestBlogs.astro`
- Modify: `src/components/blogs/BlogCard.astro`
- Modify: `src/components/brands/BrandCard.astro`
- Modify: `src/components/sections/PartnerStrip.astro`
- Modify: `src/components/sections/ServiceProof.astro`
- Modify: `src/components/sections/ChannelPathways.astro`
- Modify: `src/components/sections/FinalCta.astro`

**Interfaces:**
- Consumes: canonical tokens and section spacing from Task 1; shared card geometry from Task 3.
- Produces: consistent brand, blog, partner, operations, channel, and CTA presentation while preserving all homepage section markup.

- [ ] **Step 1: Add a failing remaining-homepage presentation test**

Add to `tests/living-design-contract.test.ts`:

```ts
test('keeps remaining homepage sections neutral, rectangular, and shadow-free', () => {
  const files = [
    'src/components/sections/FeaturedBrands.astro',
    'src/components/blogs/LatestBlogs.astro',
    'src/components/blogs/BlogCard.astro',
    'src/components/brands/BrandCard.astro',
    'src/components/sections/PartnerStrip.astro',
    'src/components/sections/ServiceProof.astro',
    'src/components/sections/ChannelPathways.astro',
    'src/components/sections/FinalCta.astro',
  ];
  for (const file of files) {
    const component = source(file);
    expect(component).not.toMatch(/var\(--color-paradise-(?:blue|green|coral|tangerine)\)|var\(--color-mist-blue\)|var\(--shape-drop\)|drop-shadow|box-shadow/);
  }
  expect(source('src/components/sections/FinalCta.astro')).toContain('background: var(--color-graphite)');
  expect(source('src/components/sections/FinalCta.astro')).toContain('color: var(--color-cold-paper)');
});
```

- [ ] **Step 2: Run the focused contract and confirm it fails**

Run: `bun test tests/living-design-contract.test.ts tests/blog-components.test.ts`

Expected: FAIL on colored organic fields, large asymmetric radii, and the old tinted CTA.

- [ ] **Step 3: Apply neutral ruled styling to the remaining sections**

Use the following exact decisions in the listed component-scoped style blocks:

```css
/* Featured brand and brand cards */
.featured-brands__story-mask,
.brand-card__organic-field { background: var(--color-cold-paper); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.featured-brands__products,
.brand-card a { border-block-start: 2px solid var(--color-paradise-orange); }

/* Blog cards */
.latest-blogs { background: var(--color-cold-paper); }
.blog-card { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.blog-card__image { background: var(--color-cold-paper); }
.blog-card__label { background: var(--color-graphite); border-radius: var(--radius-sm); color: var(--color-process-white); }

/* Operations and channels */
.service-proof { background: var(--color-cold-paper); }
.service-proof__image,
.service-proof__pillars li,
.channel-pathways__links a { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.service-proof__journey > svg path { stroke: var(--color-paradise-orange); }

/* Final CTA */
.final-cta__shape { background: var(--color-graphite); border-radius: var(--radius-sm); color: var(--color-cold-paper); }
.final-cta__shape::before { background: var(--color-paradise-orange); border-radius: var(--radius-sm); }
```

Remove per-brand accent backgrounds, organic masks, colored decorative marks, alternating channel fills, and non-semantic green dots. Preserve authentic `<img>`/`<Image>` output, article/brand data, link destinations, `data-reveal` hooks, section markup, and responsive grids.

- [ ] **Step 4: Run homepage, brand-card, and blog-card tests**

Run: `bun test tests/living-design-contract.test.ts tests/homepage-contract.test.ts tests/homepage-composition.test.ts tests/branding-assets.test.ts tests/blog-components.test.ts tests/blog-integration.test.ts`

Expected: PASS with all ten homepage sections still rendered in their original order.

- [ ] **Step 5: Commit remaining homepage styling**

```bash
git add tests/living-design-contract.test.ts src/components/sections/FeaturedBrands.astro src/components/blogs/LatestBlogs.astro src/components/blogs/BlogCard.astro src/components/brands/BrandCard.astro src/components/sections/PartnerStrip.astro src/components/sections/ServiceProof.astro src/components/sections/ChannelPathways.astro src/components/sections/FinalCta.astro
git commit -m "style: simplify remaining homepage surfaces"
```

## Task 5: Restyle Catalog, Brand, and Blog Templates

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `src/components/catalog/CatalogFilters.astro`
- Modify: `src/components/catalog/ProductGrid.astro`
- Modify: `src/components/catalog/ProductDetail.astro`
- Modify: `src/components/catalog/ProductMetadata.astro`
- Modify: `src/components/brands/BrandDetail.astro`
- Modify: `src/components/blogs/BlogArticle.astro`
- Modify: `src/pages/[locale]/products/index.astro`
- Modify: `src/pages/[locale]/products/[slug].astro`
- Modify: `src/pages/[locale]/brands/index.astro`
- Modify: `src/pages/[locale]/brands/[slug].astro`
- Modify: `src/pages/[locale]/blogs/index.astro`
- Modify: `src/pages/[locale]/blogs/[slug].astro`

**Interfaces:**
- Consumes: ProductCard, BrandCard, BlogCard, canonical tokens, and unchanged catalog/route/content APIs.
- Produces: flat specification-oriented inner content templates with unchanged filters, sticky media, metadata reading order, and localized routing.

- [ ] **Step 1: Replace organic inner-page assertions with failing industrial assertions**

In `tests/living-design-contract.test.ts`, replace tests named around “organic presentation” and “organic brand-card fields” with:

```ts
test('uses industrial presentation across catalog, brand, and blog templates', () => {
  const files = [
    'src/components/catalog/CatalogFilters.astro',
    'src/components/catalog/ProductGrid.astro',
    'src/components/catalog/ProductDetail.astro',
    'src/components/catalog/ProductMetadata.astro',
    'src/components/brands/BrandDetail.astro',
    'src/components/blogs/BlogArticle.astro',
    'src/pages/[locale]/products/index.astro',
    'src/pages/[locale]/brands/index.astro',
    'src/pages/[locale]/blogs/index.astro',
  ];
  for (const file of files) {
    const component = source(file);
    expect(component).not.toMatch(/var\(--color-paradise-(?:blue|green|coral|tangerine)\)|var\(--color-mist-blue\)|var\(--shape-drop\)|drop-shadow|box-shadow/);
  }
  expect(cssRule(source('src/components/catalog/CatalogFilters.astro'), '.catalog-filters')).toContain('border-radius: var(--radius-sm)');
  expect(cssRule(source('src/components/catalog/ProductMetadata.astro'), '.product-metadata')).toContain('border-inline-start: 2px solid var(--color-paradise-orange)');
});
```

Keep product metadata reading-order, filter `aria-live`, sticky behavior, route, and localization assertions unchanged.

- [ ] **Step 2: Run inner-page tests and confirm they fail**

Run: `bun test tests/living-design-contract.test.ts tests/catalog-filter.test.ts tests/catalog-state.test.ts tests/brand-routes.test.ts tests/blog-routes.test.ts tests/blog-data.test.ts`

Expected: FAIL on organic masks, partner accent backgrounds, special blog corners, tinted filters, and large radii.

- [ ] **Step 3: Apply industrial template styling**

Use these exact baseline declarations:

```css
.catalog-filters { background: var(--color-cold-paper); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.catalog-filters input,
.catalog-filters select { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-md); }
.catalog-empty { background: var(--color-cold-paper); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.product-detail__organic-stage { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
.product-detail__stage::before { background: var(--color-cold-paper); border-radius: var(--radius-sm); }
.product-metadata { border-inline-start: 2px solid var(--color-paradise-orange); }
.brand-detail__visual,
.brand-detail__editorial,
.blog-article__label,
.blog-article__visual { border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); }
```

Replace partner accent fields with canonical neutral surfaces. Retain native asset colors. Remove decorative pseudo-shapes, special corners, and shadows. Preserve all markup, page data, headings, links, filter attributes, sticky stage behavior, and localized paths. Page-level styles may change only padding, surfaces, borders, radii, and typographic presentation.

- [ ] **Step 4: Run catalog, brand, blog, route, and metadata tests**

Run: `bun test tests/living-design-contract.test.ts tests/catalog-filter.test.ts tests/catalog-state.test.ts tests/catalog-routes.test.ts tests/product-card.test.ts tests/brand-routes.test.ts tests/blog-routes.test.ts tests/blog-data.test.ts tests/blog-components.test.ts tests/blog-integration.test.ts`

Expected: PASS with unchanged content and route behavior.

- [ ] **Step 5: Commit inner-template styling**

```bash
git add tests/living-design-contract.test.ts src/components/catalog src/components/brands/BrandDetail.astro src/components/blogs/BlogArticle.astro src/pages/[locale]/products src/pages/[locale]/brands src/pages/[locale]/blogs
git commit -m "style: simplify catalog and editorial templates"
```

## Task 6: Restyle Forms and 404, Then Lock the Final Contract

**Files:**
- Modify: `tests/living-design-contract.test.ts`
- Modify: `src/components/forms/EnquiryForm.astro`
- Modify: `src/pages/404.astro`
- Modify only if required by a superseded visual assertion: `tests/verify-built-living-design.ts`

**Interfaces:**
- Consumes: every completed presentation group and unchanged enquiry/404 contracts.
- Produces: final cross-surface industrial contract and complete styling-only implementation.

- [ ] **Step 1: Add a failing cross-surface completion contract**

Add to `tests/living-design-contract.test.ts`:

```ts
test('removes legacy decorative presentation from every active styled surface', () => {
  const styledFiles = filesBelow('src/components')
    .filter((path) => path.endsWith('.astro') && path !== 'src/components/global/OrganicMark.astro');
  const pageFiles = filesBelow('src/pages').filter((path) => path.endsWith('.astro'));

  for (const file of [...styledFiles, ...pageFiles]) {
    const component = source(file);
    expect(component, file).not.toMatch(/var\(--color-paradise-(?:blue|green|coral|tangerine)\)|var\(--color-mist-blue\)|var\(--shape-drop\)|drop-shadow|box-shadow|linear-gradient|color-mix\(|clip-path/);
    expect(component, file).not.toMatch(/border-radius:\s*(?:[5-9]px|[1-9]\d+px|(?:0\.[3-9]|[1-9]\d*(?:\.\d+)?)rem|[1-9]\d*%|999px)/);
  }

  expect(source('src/components/global/OrganicMark.astro')).toContain('display: none');
  expect(source('src/components/sections/LivingHero.astro')).toMatch(/\[data-living-canvas\]\s*\{[^}]*display:\s*none/);
});

test('preserves the exact homepage section order', () => {
  const page = source('src/pages/[locale]/index.astro');
  const sections = [
    '<LivingHero', '<CredibilityStrip', '<CategoryDiscovery', '<FeaturedProducts',
    '<FeaturedBrands', '<LatestBlogs', '<PartnerStrip', '<ServiceProof',
    '<ChannelPathways', '<FinalCta',
  ];
  const positions = sections.map((section) => page.indexOf(section));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});
```

If the radius regex catches a true semantic status indicator, exclude that exact selector with a narrowly scoped assertion rather than weakening the global rule.

- [ ] **Step 2: Run final-contract and enquiry tests and confirm they fail**

Run: `bun test tests/living-design-contract.test.ts tests/enquiry.test.ts tests/enquiry-render-contract.test.ts tests/enquiry-modes.test.ts tests/route-manifest.test.ts`

Expected: FAIL because EnquiryForm and 404 still contain organic fields, large asymmetric radii, shadows, and legacy presentation tokens.

- [ ] **Step 3: Apply flat form and 404 styling**

Use these exact form rules while preserving all fields, validation markup, modes, submission scripts, and accessible relationships:

```css
.enquiry__organic-mark { display: none; }
.enquiry__panel { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-sm); box-shadow: none; }
.field input:not([type='checkbox']),
.field select,
.field textarea { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-md); color: var(--color-graphite); }
.enquiry-form__actions { border-block-start: 2px solid var(--color-paradise-orange); }
.enquiry-form__actions button { background: var(--color-graphite); border: 1px solid var(--color-paradise-orange); border-radius: var(--radius-sm); color: var(--color-process-white); }
```

In `src/pages/404.astro`, retain all landmarks, localized links, logo, rail, and content. Hide organic marks with existing classes, replace every large radius with `var(--radius-sm)`, use cold-paper/process-white/graphite surfaces, steel rules, and Paradise orange only for the specification datum and action border.

Update any remaining stale styling assertions in `tests/living-design-contract.test.ts`. Do not change interaction or content assertions. Change `tests/verify-built-living-design.ts` only if it explicitly requires visible decorative presentation; retain its route, logo, carousel, asset, and JavaScript budget checks.

- [ ] **Step 4: Run the complete automated verification suite**

Run: `bun test`

Expected: PASS with no skipped or failing tests.

Run: `bun run check`

Expected: exit code 0 with no Astro or TypeScript errors.

Run: `bun run build`

Expected: exit code 0; all existing built-output verifiers pass, the route manifest remains 42 pages, and localized catalog/brand/blog/enquiry contracts remain valid.

- [ ] **Step 5: Commit final surfaces and contracts**

```bash
git add tests/living-design-contract.test.ts tests/verify-built-living-design.ts src/components/forms/EnquiryForm.astro src/pages/404.astro
git commit -m "style: finish industrial surface system"
```

## Final Controller Verification

After all six task reviews are clean, the controlling agent must:

- Generate a whole-branch review package from the branch merge base to `HEAD`.
- Dispatch a final reviewer using the requesting-code-review template.
- Fix and re-review every Critical or Important finding.
- Build and serve the production output locally.
- Inspect English and Vietnamese homepages plus representative product, brand, blog, enquiry, and 404 routes at `1280px` and `390px`.
- Verify palette restraint, rectangular geometry, authentic asset colors, visible focus, zero horizontal overflow, unobstructed essential controls, unchanged section order, and unchanged interactions.
- Compare measured structure with the original audit without using page-height reduction as a substitute for the approved styling-only scope.
